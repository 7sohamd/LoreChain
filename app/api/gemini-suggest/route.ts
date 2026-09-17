import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const MODEL = 'gemini-2.5-flash';

export async function POST(req: NextRequest) {
  try {
    const { title, content, category } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Missing Gemini API key.' }, { status: 500 });
    }

    const prompt = `You are a creative co-writer and worldbuilding assistant.
Suggest creative lore entries or narrative continuations based on the following details:
Title: ${title || 'Untitled'}
Category: ${category || 'General'}
Current Content: ${content || 'None provided'}

Guidelines:
- Write in an engaging, relatable narrative style suitable for broad audiences.
- Avoid overly difficult or sophisticated vocabulary, keeping the tone accessible, evocative, and entertaining.
- Default to modern or recent-past settings unless specified otherwise.
- Avoid spiritually sensitive names.
- Provide 2 or 3 distinct continuation options or creative entry suggestions.
- Separate each distinct suggestion with the delimiter "---" on a new line so they can be parsed as separate choices.
- Return only the suggestions separated by "---", without meta-intro or outro.`;

    const genAI = new GoogleGenAI({ apiKey });
    const response = await genAI.models.generateContent({
      model: MODEL,
      contents: prompt,
    });

    const text = response.text || '';
    const rawSuggestions = text
      .split(/\n\s*---\s*\n/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const suggestions = rawSuggestions.length > 0 ? rawSuggestions : (text ? [text.trim()] : ['No suggestions generated.']);

    return NextResponse.json({ suggestions });
  } catch (err: any) {
    console.error('Gemini suggest error:', err);
    return NextResponse.json({ error: err.message || 'Failed to generate suggestions.' }, { status: 500 });
  }
}
