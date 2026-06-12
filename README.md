# Live Transcription App

Login with email/password (Nhost) then speak into your mic and watch words appear in real time (Deepgram nova-3).

---

## Prerequisites

- Node.js 18+
- A [Nhost](https://app.nhost.io) project (free tier works)
- A [Deepgram](https://console.deepgram.com) API key

---

## Setup

### 1. Clone / open the project

```
assignment/
├── backend/
└── frontend/
```

### 2. Configure Nhost

In `frontend/.env`, fill in your Nhost project details:

```env
VITE_NHOST_SUBDOMAIN=your-subdomain
VITE_NHOST_REGION=your-region        # e.g. ap-south-1
VITE_WS_URL=ws://localhost:3001
```

> Find these in your Nhost dashboard → **Settings → General**.

**Disable email verification** (required for instant login during demo):  
Nhost dashboard → **Settings → Sign-in methods → Email + Password** → uncheck **Require verified emails** → Save.

### 3. Configure Deepgram

`backend/.env` already has the key set. To use your own:

```env
DEEPGRAM_API_KEY=your_key_here
PORT=3001
```

---

## Running

Open **two terminals**:

**Terminal 1 — Backend**
```bash
cd backend
npm install
npm run dev
# → Server running on http://localhost:3001
```

**Terminal 2 — Frontend**
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## How it works

1. **Sign up / Log in** — Nhost handles auth, session persists across refreshes
2. **Click Start Recording** — browser asks for mic permission
3. **Speak** — audio streams to the backend via WebSocket, which proxies it to Deepgram
4. **See words appear live** — interim results show in grey, final results in black

---

## Project structure

```
assignment/
├── backend/
│   ├── server.js       # WebSocket proxy: browser → Deepgram
│   ├── .env            # DEEPGRAM_API_KEY
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Login.jsx
    │   │   ├── Signup.jsx
    │   │   └── Dashboard.jsx   # mic + live transcript
    │   ├── context/
    │   │   └── AuthContext.jsx  # Nhost session management
    │   ├── nhostClient.js
    │   ├── App.jsx
    │   └── main.jsx
    ├── .env            # VITE_NHOST_SUBDOMAIN / REGION
    └── package.json
```
