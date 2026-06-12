import 'dotenv/config'
import http from 'http'
import { WebSocketServer, WebSocket } from 'ws'

const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY
const PORT = process.env.PORT || 3001

if (!DEEPGRAM_API_KEY) {
  console.error('DEEPGRAM_API_KEY missing in .env')
  process.exit(1)
}

// No encoding/sample_rate — Deepgram auto-detects from the webm/opus container the browser sends
const DEEPGRAM_URL =
  'wss://api.deepgram.com/v1/listen' +
  '?model=nova-3' +
  '&language=en' +
  '&interim_results=true' +
  '&smart_format=true'

const server = http.createServer((req, res) => {
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  })
  res.end(JSON.stringify({ status: 'ok' }))
})

const wss = new WebSocketServer({ server })

wss.on('connection', (clientWs, req) => {
  console.log('[WS] Client connected')

  const dgWs = new WebSocket(DEEPGRAM_URL, {
    headers: { Authorization: `Token ${DEEPGRAM_API_KEY}` },
  })

  dgWs.on('open', () => {
    console.log('[DG] Connected to Deepgram')
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(JSON.stringify({ type: 'Ready' }))
    }
  })

  // Forward Deepgram transcript events → client
  // isBinary flag is required: Deepgram sends JSON as text frames, but ws gives us a Buffer.
  // Forwarding a Buffer makes the browser receive binary (ArrayBuffer), breaking JSON.parse.
  // Convert to string so the browser gets a proper text frame.
  dgWs.on('message', (data, isBinary) => {
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(isBinary ? data : data.toString())
    }
  })

  dgWs.on('error', (err) => {
    console.error('[DG] Error:', err.message)
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(JSON.stringify({ type: 'Error', message: err.message }))
    }
  })

  dgWs.on('close', (code) => {
    console.log(`[DG] Closed: ${code}`)
    if (clientWs.readyState === WebSocket.OPEN) clientWs.close()
  })

  // Forward raw PCM audio from client → Deepgram
  clientWs.on('message', (data) => {
    if (dgWs.readyState === WebSocket.OPEN) dgWs.send(data)
  })

  clientWs.on('close', () => {
    console.log('[WS] Client disconnected')
    if (dgWs.readyState === WebSocket.OPEN) dgWs.close()
  })

  clientWs.on('error', (err) => console.error('[WS] Client error:', err.message))
})

server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
