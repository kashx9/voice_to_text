import { useState } from "react"
import { ingestFile } from "../api.js"

 export default function UploadFile(){
    const [file,setFile] = useState()
    const [loading,setLoading] = useState()
    const [status,setStatus] = useState()

    function upload(e){
        setFile(e.target.files[0])
    }
    async function handleUpload(){
        if(!file) return
        setLoading(true)
        setStatus("")

        try {
            const formData = new FormData()
            formData.append('file',file)
            const res = await ingestFile(formData)
            setStatus(res.message || "Done")
        } catch (error) {
            setStatus(`Error ${error.message}`)
        }finally{
            setLoading(false)
        }
    }

    return(
        <div>
            <input
                type="file"
                accept=".docx,.pdf"
                onChange={upload}
            />
            <p>File uploaded : {file?.name || "none"}</p>
            <button
                onClick={handleUpload}
                disabled={!file || loading}
            >
                {loading?"Uploading...":"Upload File"}
            </button>
            {status && <p>{status}</p>}
            <p>Supported docs:DOCX, PDF</p>
        </div>
    )
 }