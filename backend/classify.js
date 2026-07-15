import dotenv from 'dotenv'
import { GoogleGenAI } from '@google/genai'

dotenv.config()

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

export default async function classifyTranscript(transcript) {
    const prompt = ` Classify this transcript as exactly one word : "log" or "query".

    "log"=the person is stating something that happened or that they want recorded (e.g. "I ate rice and dal", "went to the gym today", "feeling tired").
    "query" = the person is asking a question about past data (e.g. "what did I eat yesterday", "how many times did I go to the gym this week").

    Transcript: "${transcript}"

    Respond with only the single word "log" or "query". No punctuation, no explanation.`

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    })
    const raw = response.text
    if(raw.includes('query')) return 'query'
    else return 'log'
}

