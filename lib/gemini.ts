import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const MODEL = "gemini-2.5-flash";
const GEMINI_API_URL =
  process.env.NEXT_PUBLIC_GEMINI_API || "https://lorechain.onrender.com/gemini";

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
`

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
`

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callGemini(prompt: string): Promise<string> {
  let attempts = 0;
  let lastError: any = null;
  while (attempts < 3) {
    try {
      if (GEMINI_API_KEY) {
        const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
        const response = await genAI.models.generateContent({
          model: MODEL,
          contents: prompt,
        });
        return response.text || "No story generated.";
      }

      const res = await fetch(GEMINI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 503 || (typeof data.error === "string" && data.error.includes("503"))) {
          attempts++;
          await sleep(2000 * attempts);
          continue;
        }
        console.error("Gemini API error:", data);
        throw new Error(data.error || "Story generation failed.");
      }
      return data.response || "No story generated.";
    } catch (err) {
      lastError = err;
      attempts++;
      await sleep(2000 * attempts);
    }
  }
  throw new Error(lastError?.message || "Story generation failed after retries.");
}

export async function generateStoryFromTranscript(transcript: string): Promise<string> {
  const cleanTranscript = transcript.replace(/\s+/g, " ").trim();
  return callGemini(transcriptPrompt.replace("{transcript}", cleanTranscript));
}

export async function generateStoryFromText(text: string): Promise<string> {
  const cleanText = text.replace(/\s+/g, " ").trim();
  return callGemini(textPrompt.replace("{text}", cleanText));
}
