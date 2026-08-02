import convertDocToText from "../utils/docxParse.js"
import convertPdfToText from "../utils/pdfParse.js"
import textChunking from "../utils/chunking.js"
import embedChunks from "../utils/embedChunk.js"
import path from 'path'
import os from 'os'

export default async function ingestController(req, res) {
    try {
        const uploadedFile = req.files?.file
        if(!uploadedFile) return res.status(400).json({ error: "Missing file" })
        
        const ext = path.extname(uploadedFile.name).toLowerCase()
        const tempPath = path.join(os.tmpdir(),`${Date.now()}-${uploadedFile.name}`)
        await uploadedFile.mv(tempPath)

        let text
        if (ext === '.pdf') {
            text = await convertPdfToText(tempPath)
        }
        else if (ext === '.docx') {
            text = await convertDocToText(tempPath)
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