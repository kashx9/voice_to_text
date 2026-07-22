import dotenv from 'dotenv'
import { GoogleGenAI } from '@google/genai'

dotenv.config()

const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY})

export default async function embeddings(text){
    const response = await ai.models.embedContent({
        model: 'gemini-embedding-001',
        contents: text,
        config:{
            outputDimensionality: 768
        }
    })
    const raw = response.embeddings[0].values
    const magnitude = Math.sqrt(raw.reduce((sum,v)=>sum+v*v,0))
    const normalized = raw.map(v=>v/magnitude)
    return normalized
    // console.log(response.embeddings[0].values.length)
}

// embeddings('I had toast and eggs')