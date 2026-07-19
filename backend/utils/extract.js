import dotenv from 'dotenv'
import { GoogleGenAI } from '@google/genai'

dotenv.config()

// const transcript = 'Today i had eggs and toast'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

const EXTRACTION_PROMPT = `You extract structured data from a voice transcript about food or workouts.

Return ONLY valid JSON, no markdown fences, no explanation. Shape:
{
  "category": "food" | "workout" | "other",
  "item": string | null,       // food name, or exercise name
  "quantity": string | null,   // e.g. "1 bowl", "200g" — null for workouts
  "workout_sets": number | null,       // workout only
  "reps": number | null,       // workout only
  "duration_minutes": number | null, // workout only
  "meal_type": "breakfast" | "lunch" | "dinner" | "snack" | null,
  "notes": string | null       // anything that doesn't fit the fields above
}

Examples:
Transcript: "I had two rotis and dal for lunch"
{"category":"food","item":"roti and dal","quantity":"2 rotis","workout_sets":null,"reps":null,"duration_minutes":null,"meal_type":"lunch","notes":null}

Transcript: "did 3 sets of 10 pushups"
{"category":"workout","item":"pushups","quantity":null,"workout_sets":3,"reps":10,"duration_minutes":null,"meal_type":null,"notes":null}

Transcript: "feeling really tired today, didn't sleep well"
{"category":"other","item":null,"quantity":null,"workout_sets":null,"reps":null,"duration_minutes":null,"meal_type":null,"notes":"feeling tired, poor sleep"}

Now extract from this transcript: "${'{transcript}'}"`

export default async function extractFromTranscript(transcript) {
    const prompt = EXTRACTION_PROMPT.replace('{transcript}',transcript)

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        config: {
            responseMimeType:'application/json'
        },
        contents: prompt
    })
    // const raw = response.text
    // if (raw.includes('query')) return 'query'   
    // else return 'log'
    
    const raw = response.text
    try {
        return JSON.parse(raw)
        // console.log(JSON.parse(raw))
    } catch (error) {
        console.error('Failed to parse extraction json')
        throw new Error(error)
    }
}

// classifyTranscript(transcript)