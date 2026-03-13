// POST /api/voice/tts — edge-tts via msedge-tts (Node.js, Vercel-compatible)
// Hindi + English Indian voices, zero GPU, no Python server needed
import { NextRequest, NextResponse } from "next/server";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

// hindi / english voice map
const VOICES = {
  hi_female: "hi-IN-SwaraNeural",
  hi_male: "hi-IN-MadhurNeural",
  en_female: "en-IN-NeerjaExpressiveNeural",
  en_male: "en-IN-PrabhatNeural",
} as const;

// devanagari check — >20% = Hindi
function detectLanguage(text: string): "hi" | "en" {
  const chars = [...text].filter(
    (c) => /\p{L}/u.test(c) || /[\u0900-\u097F]/.test(c)
  );
  if (chars.length === 0) return "en";
  const hindiCount = chars.filter((c) => /[\u0900-\u097F]/.test(c)).length;
  return hindiCount / chars.length > 0.2 ? "hi" : "en";
}

// strip HTML/SSML tags and dangerous unicode to prevent injection
function sanitizeForTTS(text: string): string {
  return text
    .replace(/<[^>]*>/g, "")                        // strip HTML/SSML tags
    .replace(/[\u202E\u202D\u061C]/g, "")            // bidi overrides hatao
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "");  // control chars hatao
}

// markdown strip for cleaner speech
function cleanText(text: string): string {
  return sanitizeForTTS(
    text
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/^[-•]\s*/gm, "")
      .replace(/#{1,6}\s*/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .trim()
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, voice, rate } = body as {
      text: string;
      voice?: string;
      rate?: string;
    };

    if (!text || typeof text !== "string" || text.length === 0) {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }
    if (text.length > 5000) {
      return NextResponse.json({ error: "Text limited to 5000 characters" }, { status: 400 });
    }

    // validate rate — must be in [-50, 50] range
    if (rate) {
      const rateVal = parseInt(rate.replace(/[^-\d]/g, "") || "0", 10);
      if (isNaN(rateVal) || Math.abs(rateVal) > 50) {
        return NextResponse.json({ error: "Rate must be between -50 and +50" }, { status: 400 });
      }
    }

    const selectedVoice =
      voice ||
      (detectLanguage(text) === "hi" ? VOICES.hi_female : VOICES.en_female);

    const tts = new MsEdgeTTS();

    // 15s timeout for voice metadata setup
    await Promise.race([
      tts.setMetadata(
        selectedVoice,
        OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3
      ),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Voice service timeout")), 15000)
      ),
    ]);

    const cleaned = cleanText(text);

    // rate as fraction: 0.5 = half speed, 1.5 = 1.5x, 1.0 = normal
    const rateNum = rate ? 1.0 + parseInt(rate.replace(/[^-\d]/g, "") || "0") / 100 : 1.0;
    const { audioStream } = tts.toStream(cleaned, { rate: rateNum });

    // collect audio chunks via Node.js stream events (30s timeout)
    const audioBuffer = await new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      audioStream.on("data", (chunk: Buffer) => chunks.push(chunk));
      audioStream.on("end", () => resolve(Buffer.concat(chunks)));
      audioStream.on("error", reject);
    });

    return new Response(new Uint8Array(audioBuffer), {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    console.error("TTS error:", err);
    return NextResponse.json(
      { error: "TTS service unavailable" },
      { status: 503 }
    );
  }
}
