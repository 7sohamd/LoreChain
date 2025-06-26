import { NextRequest, NextResponse } from "next/server"
import { getTranscriptFromUrl } from "@/lib/transcript"
import { generateStoryFromTranscript } from "@/lib/gemini"

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    const transcript = await getTranscriptFromUrl(url)

    if (!transcript) {
      return NextResponse.json({ error: "Transcript not found or disabled." }, { status: 404 })
    }

    const story = await generateStoryFromTranscript(transcript)

    return NextResponse.json({ story })
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 })
  }
}