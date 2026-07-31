import {PDFParse} from "pdf-parse"
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from "url"

export default async function convertPdfToText(pdfPath) {
    try {
        // const filePath = fileURLToPath(import.meta.url)
        // const dirname = path.dirname(filePath)

        // const pdfPath = path.join(dirname,'ProductDevelopmentRoadmap.pdf')
        // const outputPath = path.join(dirname,'output.txt')

        const pdf = await fs.readFile(pdfPath)
        const parser = new PDFParse({data:pdf})
        const result = await parser.getText()
        // await fs.writeFile(outputPath, result.text, 'utf-8')
        // console.log('Success')
        return result.text
    } catch (error) {
        console.error("Error converting the pdf:",error)
        throw error
    }
}
