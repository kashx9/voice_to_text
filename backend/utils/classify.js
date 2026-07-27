// utils/classify.js
import dotenv from 'dotenv'
import { GoogleGenAI } from '@google/genai'
dotenv.config()

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

export default async function classifyTranscript(transcript) {
  const prompt = `Classify this voice transcript as exactly one word: "log" or "query".

"log" = the person is stating something that happened or wants it recorded (e.g. "I ate rice and dal", "did 3 sets of pushups").
"query" = the person is asking a question about past data (e.g. "what did I eat yesterday").

Transcript: "${transcript}"

Respond with only the single word "log" or "query".`

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt
  })

  const raw = response.text.trim().toLowerCase()
  return raw.includes('query') ? 'query' : 'log'
}