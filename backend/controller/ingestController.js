import convertDocToText from "../utils/docxParse.js"
import convertPdfToText from "../utils/pdfParse.js"
import textChunking from "../utils/chunking.js"
import embedChunks from "../utils/embedChunk.js"
import path from 'path'

export default async function ingestController(req, res) {
    const { filePath } = req.body
    try {
        let text
        const ext = path.extname(filePath).toLowerCase()
        if (ext === '.pdf') {
            text = await convertPdfToText(filePath)
        }
        else if (ext === '.docx') {
            text = await convertDocToText(filePath)
        }
        else {
            const error = new Error("Invalid file type")
            throw error
        }

        const chunks = await textChunking(text)
        await embedChunks(chunks)
        res.status(200).json({message:"Ingestion completed"})
    } catch (error) {
        console.error("Error in ingestion:", error)
        res.status(500).json({ error: error.message })
    }
}