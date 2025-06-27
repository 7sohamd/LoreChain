import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { getTranscriptFromUrl } from '@/lib/transcript';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const MODEL = 'gemini-2.5-flash';

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:v=|youtu.be\/|embed\/|shorts\/)([\w-]{11})/);
  return match ? match[1] : null;
}

async function fetchYouTubeTitleAndDescription(videoId: string): Promise<{ title: string, description: string } | null> {
  if (!YOUTUBE_API_KEY) return null;
  try {
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${YOUTUBE_API_KEY}`;
    const res = await fetch(apiUrl);
    const data = await res.json();
    if (data.items && data.items.length > 0) {
      return {
        title: data.items[0].snippet.title,
        description: data.items[0].snippet.description || ''
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const { input } = await req.json();
  if (!input || typeof input !== 'string') {
    return NextResponse.json({ error: 'Missing or invalid input.' }, { status: 400 });
  }
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ error: 'Missing Gemini API key.' }, { status: 500 });
  }

  let prompt = '';
  if (input.startsWith('http')) {
    const videoId = extractYouTubeId(input);
    let transcript: string | null = null;
    if (videoId) {
      // Try to fetch transcript
      transcript = await getTranscriptFromUrl(input);
      const meta = await fetchYouTubeTitleAndDescription(videoId);
      if (transcript) {
        prompt = `Given the following YouTube video transcript, generate a simple, educational story for kids about the main topic of the video. Do not mention the transcript, extraction process, or that you are an AI. Only return the story itself.\n\nTranscript: ${transcript}`;
      } else if (meta) {
        prompt = `Given the following YouTube video title and description, generate a simple, educational story for kids about the main topic of the video. Do not mention the transcript, extraction process, or that you are an AI. Only return the story itself.\n\nTitle: ${meta.title}\nDescription: ${meta.description}`;
      } else {
        prompt = `Given the following YouTube video URL, generate a simple, educational story for kids that explains the main topic of the video in clear, friendly language. Do not mention the transcript, extraction process, or that you are an AI. Only return the story itself.\n\nYouTube URL: ${input}`;
      }
    } else {
      prompt = `Given the following YouTube video URL, generate a simple, educational story for kids that explains the main topic of the video in clear, friendly language. Do not mention the transcript, extraction process, or that you are an AI. Only return the story itself.\n\nYouTube URL: ${input}`;
    }
  } else {
    prompt = `Explain the following topic as a short, clean, well-explained, and interesting story for a child. Make it brief, engaging, and easy to understand, so a kid won't get bored.\n\nTopic: ${input}`;
  }

  try {
    const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const response = await genAI.models.generateContent({
      model: MODEL,
      contents: prompt,
    });
    const story = response.text;
    return NextResponse.json({ story });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to generate story.' }, { status: 500 });
  }
} 