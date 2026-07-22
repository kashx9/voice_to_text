import extractFromTranscript from '../utils/extract.js'
import embeddings from '../utils/embed.js'
import { pool } from '../utils/db.js'

export async function extractionController(req, res) {
    const { transcript, userId } = req.body
    if (!transcript || typeof transcript !== 'string') {
        return res.status(400).json({ error: 'transcript is required' })
    }

    try {
        const data = await extractFromTranscript(transcript)
        const vector = await embeddings(transcript)

        const logResult = await pool.query(
            `INSERT INTO logs (user_id, category, item, quantity, workout_sets, reps, duration_minutes, meal_type, notes, raw_transcript)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
            [userId, data.category, data.item, data.quantity, data.sets, data.reps, data.duration_minutes, data.meal_type, data.notes, transcript]
        )
        await pool.query(
            `INSERT INTO embeddings(user_id,raw_text,embedding) VALUES($1,$2,$3)`,
            [userId,transcript,JSON.stringify(vector)]
        )
        res.json(logResult.rows[0])
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'extraction failed' })
    }
}
