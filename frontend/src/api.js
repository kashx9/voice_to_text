const url = import.meta.env.VITE_BACKEND_URL

async function post(path, body) {
    const response = await fetch(`${url}${path}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`)
    return await response.json()
}

export async function sendTranscript(transcript) {
    return post('/classify',{transcript})
}

export function extractTranscript(transcript, userId) {
  return post('/extract/transcript', { transcript, userId })
}

export function queryTranscript(question, userId) {
  return post('/query', { question, userId })
}