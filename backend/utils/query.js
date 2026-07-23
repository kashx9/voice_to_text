import embeddings from "./embed.js"
import { GoogleGenAI } from "@google/genai"
import { pool } from "./db.js"
import { response } from "express"

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

export default async function answerQuery(req,res) {
    const {question,userId} = req.body
    const queryVector = await embeddings(question)

    const { rows } = await pool.query(
        `SELECT raw_text,created_at FROM embeddings
        WHERE user_id = $1
        ORDER BY embedding <=> $2
        LIMIT 5`,
        [userId, JSON.stringify(queryVector)]
    )

    const context = rows.map(r => `(${r.created_at.toISOString().slice(0, 10)})- ${r.raw_text}`).join('\n')

    const prompt = `Using only the context below, answer the question. If the context doesn't contain the answer, say so don't make anything up.

    Context:
    ${context}

    Question: ${question}`

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    })

    res.json({answer:response.text,sources_used:rows})
}