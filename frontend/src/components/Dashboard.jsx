import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001'

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const [status, setStatus] = useState('idle') // idle | connecting | recording | error
  const [errorMsg, setErrorMsg] = useState('')
  const [finalText, setFinalText] = useState('')
  const [interimText, setInterimText] = useState('')

  const wsRef = useRef(null)
  const recorderRef = useRef(null)
  const streamRef = useRef(null)
  const didErrorRef = useRef(false)

  function cleanup() {
    recorderRef.current?.stop()
    streamRef.current?.getTracks().forEach((t) => t.stop())
    if (wsRef.current) {
      wsRef.current.onclose = null
      wsRef.current.onerror = null
      wsRef.current.onmessage = null
      if (wsRef.current.readyState === WebSocket.OPEN) wsRef.current.close()
    }
    wsRef.current = null
    recorderRef.current = null
    streamRef.current = null
  }

  async function startRecording() {
    setStatus('connecting')
    setErrorMsg('')
    setInterimText('')
    didErrorRef.current = false

    let stream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
    } catch (err) {
      setErrorMsg('Microphone access denied: ' + err.message)
      setStatus('error')
      return
    }
    streamRef.current = stream

    const ws = new WebSocket(WS_URL)
    wsRef.current = ws

    ws.onmessage = (e) => {
      let data
      try { data = JSON.parse(e.data) } catch { return }

      // Backend signals Deepgram is ready — start streaming audio
      if (data.type === 'Ready') {
        setStatus('recording')

        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm'

        const recorder = new MediaRecorder(stream, { mimeType })
        recorderRef.current = recorder

        recorder.ondataavailable = (ev) => {
          if (ev.data.size > 0 && wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(ev.data)
          }
        }

        recorder.start(250) // 250 ms chunks
        return
      }

      if (data.type === 'Error') {
        didErrorRef.current = true
        setErrorMsg(data.message || 'Deepgram error')
        setStatus('error')
        cleanup()
        return
      }

      // Deepgram nova-3: { type:"Results", is_final, channel:{alternatives:[{transcript}]} }
      if (data.type === 'Results') {
        const transcript = data.channel?.alternatives?.[0]?.transcript || ''
        if (!transcript) return
        if (data.is_final) {
          setFinalText((prev) => (prev ? prev + ' ' + transcript : transcript))
          setInterimText('')
        } else {
          setInterimText(transcript)
        }
      }
    }

    ws.onerror = () => {
      didErrorRef.current = true
      setErrorMsg('Cannot connect to backend — make sure the server is running on port 3001.')
      setStatus('error')
      cleanup()
    }

    ws.onclose = () => {
      if (!didErrorRef.current) {
        setStatus('idle')
        setInterimText('')
      }
    }
  }

  function stopRecording() {
    cleanup()
    setStatus('idle')
    setInterimText('')
  }

  useEffect(() => () => cleanup(), [])

  const isRecording = status === 'recording'
  const isConnecting = status === 'connecting'

  return (
    <div className="dashboard">
      <header className="dash-header">
        <h1>Live Transcription</h1>
        <div className="user-bar">
          <span className="user-email">{user?.email}</span>
          <button className="btn btn-danger" onClick={signOut}>Logout</button>
        </div>
      </header>

      <main>
        <div className="controls">
          <button
            className={`btn mic-btn ${isRecording ? 'recording' : ''}`}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isConnecting}
          >
            {isConnecting ? 'Connecting…' : isRecording ? '⏹ Stop' : '🎙 Start Recording'}
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => { setFinalText(''); setInterimText(''); setErrorMsg('') }}
            disabled={isRecording || isConnecting}
          >
            Clear
          </button>
        </div>

        {status === 'error' && (
          <p className="error" style={{ marginBottom: '1rem' }}>
            {errorMsg || 'Something went wrong — check the browser console.'}
          </p>
        )}

        <div className="transcript-box">
          {finalText || interimText ? (
            <>
              <span className="final">{finalText}</span>
              {interimText && <span className="interim"> {interimText}</span>}
            </>
          ) : (
            <span className="placeholder">
              {isRecording ? 'Listening… speak into your mic' : 'Press Start Recording and speak'}
            </span>
          )}
        </div>
      </main>
    </div>
  )
}
