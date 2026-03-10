"""
Ayurv Voice Service — Lightweight TTS server
Uses edge-tts (Microsoft neural TTS) — zero GPU, Pi-compatible.
Hindi + English support with Indian voices.
"""

import asyncio
import io
import re
from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import edge_tts

app = FastAPI(title="Ayurv Voice Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# hindi voices — neural, natural sounding
VOICE_HINDI = "hi-IN-SwaraNeural"       # female hindi
VOICE_HINDI_MALE = "hi-IN-MadhurNeural"  # male hindi
VOICE_ENGLISH = "en-IN-NeerjaExpressiveNeural"  # indian english female
VOICE_ENGLISH_MALE = "en-IN-PrabhatNeural"       # indian english male

# devanagari unicode range check
DEVANAGARI_RE = re.compile(r'[\u0900-\u097F]')


def detect_language(text: str) -> str:
    """Simple heuristic: if >20% characters are Devanagari, use Hindi voice."""
    alpha_chars = [c for c in text if c.isalpha() or '\u0900' <= c <= '\u097F']
    if not alpha_chars:
        return "en"
    hindi_count = sum(1 for c in alpha_chars if '\u0900' <= c <= '\u097F')
    return "hi" if (hindi_count / len(alpha_chars)) > 0.2 else "en"


class TTSRequest(BaseModel):
    text: str
    voice: str | None = None  # override auto-detection
    rate: str = "+0%"         # speech rate, e.g. "+10%", "-5%"


@app.get("/health")
async def health():
    return {"status": "ok", "service": "ayurv-voice", "tts": "edge-tts"}


@app.post("/tts")
async def text_to_speech(req: TTSRequest):
    # auto-detect language if voice not specified
    if req.voice:
        voice = req.voice
    else:
        lang = detect_language(req.text)
        voice = VOICE_HINDI if lang == "hi" else VOICE_ENGLISH

    # strip markdown bold markers for cleaner speech
    clean_text = req.text.replace("**", "").replace("*", "")
    # strip markdown bullet points
    clean_text = re.sub(r'^[-•]\s*', '', clean_text, flags=re.MULTILINE)

    communicate = edge_tts.Communicate(clean_text, voice, rate=req.rate)

    # collect audio chunks
    audio_data = io.BytesIO()
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_data.write(chunk["data"])

    audio_data.seek(0)
    return Response(
        content=audio_data.read(),
        media_type="audio/mpeg",
        headers={"Content-Disposition": "inline; filename=speech.mp3"},
    )


@app.get("/voices")
async def list_voices():
    """List available Indian voices."""
    return {
        "hindi": [
            {"id": VOICE_HINDI, "name": "Swara (Female)", "lang": "hi-IN"},
            {"id": VOICE_HINDI_MALE, "name": "Madhur (Male)", "lang": "hi-IN"},
        ],
        "english": [
            {"id": VOICE_ENGLISH, "name": "Neerja (Female)", "lang": "en-IN"},
            {"id": VOICE_ENGLISH_MALE, "name": "Prabhat (Male)", "lang": "en-IN"},
        ],
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8100)
