import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs/promises'

export default async function textChunking(text) {
    try {
        // const filePath = fileURLToPath(import.meta.url)
        // const dirname = path.dirname(filePath)
        // const textFile = path.join(dirname, 'outputDoc.txt')
        // const text = await fs.readFile(textFile,'utf-8')

        // const outputPath = path.join(dirname,'chunkOutput.json')

        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 500,
            chunkOverlap:50
        })

        const textChunks = await splitter.splitText(text)
        // const docChunks = await splitter.createDocuments([text ])
        // await fs.writeFile(outputPath,JSON.stringify(textChunks))

        return JSON.stringify(textChunks)

        // console.log("Saved")
        // console.log(docChunks)
    } catch (error) {
        console.error("Error creating chunks:",error)
        throw error
    }
}

// textChunking()