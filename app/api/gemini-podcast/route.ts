import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { getTranscriptFromUrl } from '@/lib/transcript';

const MODEL = 'gemini-2.5-flash';

function isYouTubeUrl(url: string) {
  return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/i.test(url.trim());
}

const podcastPrompt = ({ content }: { content: string }) => `
You are a podcast scriptwriter. Create a lively, engaging, and easy-to-understand podcast conversation between two hosts (Host 1 and Host 2) about the following topic or content. The conversation should:
- Be in a modern, conversational style
- Explain the topic in a way that's fun and accessible to everyone
- Include questions, answers, and natural banter
- Avoid dry summary; make it sound like a real podcast episode
- Be at least 600 words

Topic/Content:
"""
${content}
"""

Now write the podcast conversation script.
`;

export async function POST(req: NextRequest) {
  try {
    const { input } = await req.json();
    if (!input || typeof input !== 'string') {
      return NextResponse.json({ error: 'Input is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing Gemini API key.' }, { status: 500 });
    }

    let content = input;
    if (isYouTubeUrl(input)) {
      const transcript = await getTranscriptFromUrl(input);
      if (transcript) {
        content = transcript;
      } else {
        // Fallback: use the link as context
        content = `Here is a YouTube link: ${input}\nPlease generate a podcast conversation as if you had access to the video.`;
      }
    }

    const prompt = podcastPrompt({ content });

    const genAI = new GoogleGenAI({ apiKey });
    const response = await genAI.models.generateContent({
      model: MODEL,
      contents: prompt,
    });

    return NextResponse.json({ podcast: response.text || 'No podcast generated.' });
  } catch (error: any) {
    console.error('Gemini podcast error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to generate podcast.' }, { status: 500 });
  }
}