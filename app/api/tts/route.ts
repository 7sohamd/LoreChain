import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { text, instructions = "Speak in a lively and optimistic tone.", voice = "alloy" } = await req.json();

  const res = await fetch("https://open-ai-text-to-speech1.p.rapidapi.com/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-rapidapi-host": "open-ai-text-to-speech1.p.rapidapi.com",
      "x-rapidapi-key": process.env.RAPIDAPI_KEY!
    },
    body: JSON.stringify({
      model: "tts-1",
      input: text,
      instructions,
      voice
    })
  });

  if (!res.ok) {
    let errorMsg = "TTS API error";
    try {
      errorMsg = await res.text();
    } catch {}
    console.error("TTS API error:", errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }

  const audioBuffer = await res.arrayBuffer();
  return new Response(audioBuffer, {
    headers: {
      "Content-Type": "audio/mpeg"
    }
  });
} 