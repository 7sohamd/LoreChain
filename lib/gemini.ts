import { GoogleGenAI } from "@google/genai";

const MODEL = "gemini-2.5-flash";

const transcriptPrompt = `
I want you to act as a story narrator who converts YouTube videos into story-style summaries.

Your task is to:
1. Understand the key points in the transcript.
2. Reconstruct it as an engaging narrative.
3. Avoid dry summary. Write it like you're telling an interesting story to a friend.
4. Keep it smooth and easy to follow.
5. Output around 400–600 words.

Transcript:
"""
{transcript}
"""
Now generate the story.
`;

const textPrompt = `
I want you to act as a creative storyteller who creates engaging stories from any topic or idea.

Your task is to:
1. Take the given text/topic and create an interesting story around it.
2. Make it engaging and narrative-driven.
3. Write it like you're telling an interesting story to a friend.
4. Keep it smooth and easy to follow.
5. Output around 400–600 words.

Topic/Text:
"""
{text}
"""
Now generate the story.
`;

async function callGemini(prompt: string): Promise<string> {
  const apiKey =
    process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing Gemini API key.");
  }

  const genAI = new GoogleGenAI({ apiKey });
  const response = await genAI.models.generateContent({
    model: MODEL,
    contents: prompt,
  });

  return response.text || "No story generated.";
}

export async function generateStoryFromTranscript(transcript: string): Promise<string> {
  const cleanTranscript = transcript.replace(/\s+/g, " ").trim();
  return callGemini(transcriptPrompt.replace("{transcript}", cleanTranscript));
}

export async function generateStoryFromText(text: string): Promise<string> {
  const cleanText = text.replace(/\s+/g, " ").trim();
  return callGemini(textPrompt.replace("{text}", cleanText));
}
