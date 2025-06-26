import { NextRequest, NextResponse } from "next/server"
import { getTranscriptFromUrl } from "@/lib/transcript"
import { generateStoryFromTranscript } from "@/lib/gemini"

export async function POST(req: NextRequest) {
  try {
    const { url, transcript } = await req.json()

    if (!url && !transcript) {
      return NextResponse.json({ error: "Either 'url' or 'transcript' is required" }, { status: 400 })
    }

    let finalTranscript = transcript
    if (url) {
      finalTranscript = await getTranscriptFromUrl(url)
      if (!finalTranscript) {
        return NextResponse.json({ error: "Transcript not found or disabled." }, { status: 404 })
      }
    }

    const story = await generateStoryFromTranscript(finalTranscript)
    return NextResponse.json({ story })
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 })
  }
}