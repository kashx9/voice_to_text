import { useRef, useState } from 'react'

import { sendTranscript } from './api'

import './App.css'
export default function App() {

  const wsUrl = 'ws://localhost:3001'
  const wsRef = useRef(null)
  const [finalText, setFinalText] = useState("")
  const [interimText, setInterimText] = useState("")

  const streamRef = useRef(null)
  const [isRecording, setIsRecording] = useState(false)
  const [status, setStatus] = useState("Permission not granted yet")
  const audioContextRef = useRef(null)
  const sourceRef = useRef(null)
  const processorRef = useRef(null)
  const finalTextRef = useRef("")

  async function permissionCheck() {
    setFinalText('')
    if (isRecording) return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const ws = new WebSocket(wsUrl)
      setTimeout(() => {
        // readyState 1 means OPEN
        if (ws.readyState === WebSocket.OPEN) {
          console.log("connection success");
        } else {
          console.log("connection failed");
        }
      }, 1000);
      wsRef.current = ws

      ws.onopen = () => {
        console.log('Waiting to connect with Deepgram')
      }

      ws.onmessage = (e) => {
        try {
          console.log(`Raw data messages: ${e.data}`)
          let data = JSON.parse(e.data)
          console.log(data)

          if (data.type === 'Ready') {
            const audioContext = new AudioContext({ sampleRate: '16000' })
            audioContextRef.current = audioContext

            const source = audioContext.createMediaStreamSource(stream)
            sourceRef.current = source

            const processor = audioContext.createScriptProcessor(4096, 1, 1)
            processorRef.current = processor

            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0)
              const pcm16Buffer = new Int16Array(inputData.length)
              for (let i = 0; i < inputData.length; i++) {
                const sample = Math.max(-1, Math.min(1, inputData[i]))
                pcm16Buffer[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff
              }
              if (wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(pcm16Buffer.buffer)
              }
            }

            source.connect(processor)
            processor.connect(audioContext.destination)
            return
          }
          if (data.type === 'Results') {
            const transcript = data.channel.alternatives[0].transcript || ''
            console.log(transcript)
            if (data.is_final) {
              setFinalText((prev) => {
                const updated = prev ? prev + ' ' + transcript : transcript
                finalTextRef.current = updated
                return updated
              })
              setInterimText('')
            }
            else setInterimText(transcript)
          }
        } catch (error) {
          console.error(error)
        }
      }
      setStatus("Permission granted! Recording...")
      setIsRecording(true)
    } catch (error) {
      setStatus(`Permission denied: ${error}`)
      setIsRecording(false)
    }
  }
  function stopMic() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null

      // mediaRecorderRef.current.onstop = () => {
      //   const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
      //   const formData = new FormData()
      //   formData.append('file', audioBlob, 'recording.webm')
      //   console.log(audioChunksRef.current)
      // }
      setTimeout(async()=>{
        if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close()
        wsRef.current = null
      }
      if (processorRef.current) processorRef.current.disconnect()
      if (audioContextRef.current) audioContextRef.current.close()

      setStatus("Mic turned off")
      setIsRecording(false)

      const transcript = finalTextRef.current.trim()
      if(transcript){
        try {
        setStatus("Classifying...")
        const result = await sendTranscript(transcript)
        console.log(`Classification as: ${result.type}`)
      } catch (err) {
        console.log(err)
        setStatus("Failed to classify")
      }
      }
      },300)
    }
  }

  return (
    <div className='main'>
      <div>
        <h1>Voice to text converter</h1>
        <p>Click on the button to start speaking</p>
      </div>
      <div>
        <p className="transcription-box">
          {finalText}<span style={{ opacity: 0.5 }}>{interimText}</span>
        </p>
      </div>
      <div>
        <button
          style={isRecording ? { backgroundColor: "red" } : { backgroundColor: "white" }}
          onClick={permissionCheck}
          disabled={isRecording}
        >
          Start Recording
        </button>
        <button
          onClick={stopMic}
        >
          Stop recording
        </button>
        <p>Status: {status}</p>
      </div>

    </div>
  )
}