import { YoutubeTranscript } from "youtube-transcript"

function extractVideoId(url: string): string | null {
  const regex = /(?:v=|\/)([0-9A-Za-z_-]{11})/
  const match = url.match(regex)
  return match ? match[1] : null
}

export async function getTranscriptFromUrl(url: string): Promise<string | null> {
  try {
    const videoId = extractVideoId(url)
    if (!videoId) throw new Error("Invalid YouTube URL")

    const transcriptArr = await YoutubeTranscript.fetchTranscript(videoId)
    return transcriptArr.map((t) => t.text).join(" ").replace(/\s+/g, " ").trim()
  } catch (err) {
    console.error("Transcript fetch error:", err)
    return null
  }
}
