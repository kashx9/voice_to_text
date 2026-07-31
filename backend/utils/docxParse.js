import mammoth from 'mammoth'
import {fileURLToPath} from 'url'
import path from 'path'
import fs from 'fs/promises'

export default async function convertDocToText(docPath){
    try {
        // const filePath = fileURLToPath(import.meta.url)
        // const dirname = path.dirname(filePath)
        // const docPath = path.join(dirname,'DEED OF PUBLIC CHARITABLE TRUST.docx')
        // const outputPath = path.join(dirname,'outputDoc.txt')

        const doc = await fs.readFile(docPath)
        const result = await mammoth.extractRawText({buffer:doc})
        const text = result.value

        // await fs.writeFile(outputPath,text)
        // console.log('Success')
        return text
    } catch (error) {
        console.error("Error converting doc:",error)
        throw error
    }
}

// convertDocToText()