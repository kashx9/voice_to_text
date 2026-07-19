import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import { WebSocketServer, WebSocket } from 'ws'

import extractRouter from './router/router.js'

const app = express()

app.use(express.json())
app.use(cors())

app.use("/extract",extractRouter)

const server = app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`)
})

const DEEPGRAM_URL = 'wss://api.deepgram.com/v1/listen' +
    '?model=nova-3' +
    '&language=en' +
    '&punctuate=true' +
    '&interim_results=true'+
    '&encoding=linear16' +
    '&sample_rate=16000'

const wss = new WebSocketServer({ server })

wss.on('connection', (clientWs, req) => {//client connected
    console.log(`[WS] Client connected`)

    const dgWs = new WebSocket(DEEPGRAM_URL, {//create connection to deepgram using uel and api key
        headers: { Authorization: `TOKEN ${process.env.DEEPGRAM_API_KEY}` }
    })

    dgWs.on('open', () => {//connected to deepgram
        console.log(`[DG] Connected to Deepgram`)
        if(clientWs.readyState === WebSocket.OPEN)
            clientWs.send(JSON.stringify({type:'Ready'}))
    })

    dgWs.on('close', (code) => {
        console.log(`[DG] Deepgram closed : ${code}`)
        if (clientWs.readyState === WebSocket.OPEN) clientWs.close()
    })

    clientWs.on('message', (data) => {//when user or client is speaking send data to deepgram
        // console.log('[WS] Received chunk from client, size:', data.length) 
        if (dgWs.readyState === WebSocket.OPEN) dgWs.send(data)
    })

    dgWs.on('message', (data) => {//when deepgram is sending data send it to client
        // console.log(`Raw DG data: ${data.toString()}`)
        if (clientWs.readyState === WebSocket.OPEN) clientWs.send(data.toString())
    })

    dgWs.on('error', (err) => {
        console.error('[DG] Error:', err.message)
        if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ type: 'Error', message: err.message }))
        }
    })

    clientWs.on('close', () => {
        console.log('[WS] Client disconnected')
        if (dgWs.readyState === WebSocket.OPEN) dgWs.close()
    })

    clientWs.on('error',(err)=>{
        console.error(`[WS] Error: ${err}`)
    })
})