const url = import.meta.env.VITE_BACKEND_URL

export async function sendTranscript(transcript) {
    try {
        const response = await fetch(`${url}/classify/transcript`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({transcript})
        })
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    }
    catch (error) {
        console.error(error)
        throw error
    }
}