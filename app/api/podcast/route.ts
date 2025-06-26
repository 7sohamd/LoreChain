import { NextRequest, NextResponse } from "next/server";
import { getTranscriptFromUrl } from "@/lib/transcript";
import { generateStoryFromText } from "@/lib/gemini";

function isYouTubeUrl(url: string) {
  return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/i.test(url.trim());
}

const podcastPrompt = (content: string) => `
You are an AI podcast host. Turn the following input into a podcast-style conversation between two engaging hosts. Make it lively, easy to understand, and fun. Use a conversational tone, include questions, answers, and natural banter. Avoid dry narration. Output should be in a script format, alternating between Host 1 and Host 2.

Input:
"""
${content}
"""

Podcast Conversation:
`;

export async function POST(req: NextRequest) {
  try {
    const { input } = await req.json();
    if (!input) {
      return NextResponse.json({ error: "Input is required" }, { status: 400 });
    }
    let content = input;
    if (isYouTubeUrl(input)) {
      const transcript = await getTranscriptFromUrl(input);
      if (transcript) {
        content = transcript;
      } else {
        content = `Here is a YouTube link: ${input}\nPlease generate a podcast-style conversation as if you had access to the video.`;
      }
    }
    const podcast = await generateStoryFromText(podcastPrompt(content));
    return NextResponse.json({ podcast });
  } catch (error) {
    return NextResponse.json({ error: `Server error: ${error?.message || error}` }, { status: 500 });
  }
} 