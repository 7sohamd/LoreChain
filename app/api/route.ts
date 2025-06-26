import { NextRequest, NextResponse } from "next/server"
import { getTranscriptFromUrl } from "@/lib/transcript"
import { generateStoryFromTranscript, generateStoryFromText } from "@/lib/gemini"

function isYouTubeUrl(url: string) {
  return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/i.test(url.trim());
}

export async function POST(req: NextRequest) {
  try {
    const { url, transcript } = await req.json()

    if (!url && !transcript) {
      return NextResponse.json({ error: "Either 'url' or 'transcript' is required" }, { status: 400 })
    }

    let story: string;
    let usedFallback = false;
    
    if (url && isYouTubeUrl(url)) {
      // YouTube link: try to get transcript, then generate story
      const videoTranscript = await getTranscriptFromUrl(url);
      if (videoTranscript) {
        story = await generateStoryFromTranscript(videoTranscript);
      } else {
        // Fallback: ask Gemini to imagine a story from the link
        usedFallback = true;
        story = await generateStoryFromText(`Here is a YouTube link: ${url}\nPlease generate a story as if you had access to the video.`);
      }
    } else if (transcript) {
      // Plain text: generate story directly from the text
      story = await generateStoryFromText(transcript);
    } else {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    return NextResponse.json({ story, fallback: usedFallback });
  } catch (error) {
    return NextResponse.json({ error: `Server error: ${error?.message || error}` }, { status: 500 });
  }
}