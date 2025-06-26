const GEMINI_API_URL = process.env.NEXT_PUBLIC_GEMINI_API || "http://localhost:5000/gemini"


const prompt = `
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
  const res = await fetch(GEMINI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt: prompt.replace("{transcript}", transcript) }),
  })

  const data = await res.json()
  return data?.response || "No story generated."
}
