import { GoogleGenAI } from "@google/genai"
import { pool } from './db.js'
import fs from 'fs/promises'

const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY })

function normalize(vec) {
    const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0))
    return vec.map(v => v / norm)
}

export default async function embedChunks(raw) {
    // const raw = await fs.readFile("D:/Frontend_project/learning/voice-to-text/backend/utils/chunkOutput.json",
    //     "utf-8")
    const chunks = JSON.parse(raw)
    for (let chunk of chunks) {
        const res = await ai.models.embedContent({
            model: 'gemini-embedding-001',
            contents: chunk,
            config: {
                outputDimensionality: 768
            }
        })

        const vector = normalize(res.embeddings[0].values)

        await pool.query(
            `INSERT INTO embeddings(user_id,raw_text,embedding) VALUES($1,$2,$3)`,
            [2, chunk, JSON.stringify(vector)]
        )

        console.log(`embedded chunk ${chunks.indexOf(chunk) + 1}/${chunks.length}`)
    }
}

// embedChunks()