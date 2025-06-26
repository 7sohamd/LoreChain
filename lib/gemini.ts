const GEMINI_API_URL =
  process.env.NEXT_PUBLIC_GEMINI_API || "https://lorechain.onrender.com/gemini"

const basePrompt = `
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

export async function generateStoryFromTranscript(transcript: string): Promise<string> {
  const cleanTranscript = transcript.replace(/\s+/g, " ").trim()

  const res = await fetch(GEMINI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: basePrompt.replace("{transcript}", cleanTranscript),
    }),
  })

  const data = await res.json()

  if (!res.ok) {
    console.error("Gemini API error:", data)
    throw new Error(data.error || "Story generation failed.")
  }

  return data.response || "No story generated."
}
