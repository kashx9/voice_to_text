# Voice-to-Text + RAG Prototype

This repository is a work-in-progress voice-to-text transcription app with a backend retrieval-augmented generation (RAG) pipeline.

## What it does

- Frontend captures live microphone audio and streams it to the backend over WebSockets.
- Backend forwards audio to Deepgram for real-time speech transcription.
- When recording stops, the frontend sends the final transcript to the backend `/extract/transcript` endpoint.
- The backend uses Gemini to extract structured data from the transcript and generate an embedding.
- The transcript is logged to the database and the normalized embedding is stored for similarity search.
- A separate `/query` endpoint supports RAG search by embedding the user query, retrieving the closest stored transcript rows with cosine similarity, and using Gemini to answer with that context.

## Project structure

- `frontend/`
  - React + Vite app
  - microphone permission, live audio streaming, and transcript display
  - sends finalized transcript to backend for extraction
- `backend/`
  - Express server with WebSocket connection to Deepgram
  - `controller/` manages transcript extraction and DB logging
  - `utils/embed.js` creates normalized Gemini embeddings
  - `utils/extract.js` extracts structured JSON from transcripts with Gemini
  - `utils/query.js` performs vector search and answers queries via Gemini

## Current status

- Voice transcription is implemented and working in the frontend UI.
- Backend extraction and embedding storage are implemented.
- RAG query backend exists, but frontend RAG query UI is still WIP and not exposed yet.

## Environment

Backend environment variables:

- `GEMINI_API_KEY`
- `DEEPGRAM_API_KEY`
- `NEON_DB` (or another PostgreSQL-compatible connection string)
- `PORT`

Frontend environment variable:

- `VITE_BACKEND_URL`

## Notes

This is a prototype focused on the transcription and retrieval pipeline. The current frontend showcases the live speech-to-text experience while the RAG query component remains backend-ready for future UI integration.
