const GEMINI_API_URL =
  process.env.NEXT_PUBLIC_GEMINI_API || "https://lorechain.onrender.com/gemini"

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

export async function generateStoryFromText(text: string): Promise<string> {
  const cleanText = text.replace(/\s+/g, " ").trim()
  let attempts = 0;
  let lastError: any = null;
  while (attempts < 3) {
    try {
      const res = await fetch(GEMINI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: textPrompt.replace("{text}", cleanText),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        // Retry on 503 Service Unavailable
        if (res.status === 503 || (typeof data.error === "string" && data.error.includes("503"))) {
          attempts++;
          await sleep(2000 * attempts); // Exponential backoff
          continue;
        }
        console.error("Gemini API error:", data)
        throw new Error(data.error || "Story generation failed.")
      }
      return data.response || "No story generated."
    } catch (err) {
      lastError = err;
      attempts++;
      await sleep(2000 * attempts);
    }
  }
  throw new Error(lastError?.message || "Story generation failed after retries.");
}
