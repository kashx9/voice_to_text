import  classifyTranscript  from './classify.js'

export async function classificationController(req, res) {
    const { transcript } = req.body
    if (!transcript || typeof transcript !== 'string') {
        return res.status(400).json({ error: 'transcript is required' })
    }
    try {
        const type = await classifyTranscript(transcript)
        res.json({ type, transcript })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'classification failed' })
    }
}