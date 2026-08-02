import { useState } from "react"
import { queryTranscript } from "../api"

export default function Query() {
    const [text, setText] = useState("")
    const [output, setOutput] = useState()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    function takeQuery(e) {
        setText(e.target.value)
    }

    async function handleSend() {
        if (!text.trim() || loading) return
        setLoading(true)
        setError("")
        try {
            const { answer } = await queryTranscript(text, "2") 
            setOutput(answer)
            setText("")
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <input
                type="text"
                value={text}
                onChange={takeQuery}
            />
            <button
                onClick={handleSend}
                disabled={loading || !text.trim()}>
                {loading ? "Asking..." : "Send query"}
            </button>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {output && <p>{output}</p>}
        </div>
    )
}