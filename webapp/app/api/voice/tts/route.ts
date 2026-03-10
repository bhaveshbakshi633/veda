// POST /api/voice/tts — proxy to Python edge-tts service
import { NextRequest, NextResponse } from "next/server";

const VOICE_SERVICE_URL = process.env.VOICE_SERVICE_URL || "http://localhost:8100";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, voice, rate } = body as {
      text: string;
      voice?: string;
      rate?: string;
    };

    if (!text) {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }

    const res = await fetch(`${VOICE_SERVICE_URL}/tts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voice, rate: rate || "+0%" }),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "TTS service error" },
        { status: res.status }
      );
    }

    const audioBuffer = await res.arrayBuffer();
    return new Response(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    console.error("TTS proxy error:", err);
    return NextResponse.json(
      { error: "TTS service unavailable" },
      { status: 503 }
    );
  }
}
