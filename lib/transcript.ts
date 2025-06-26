import { YoutubeTranscript } from "youtube-transcript"

export async function getTranscriptFromUrl(url: string): Promise<string | null> {
  try {
    const transcriptArr = await YoutubeTranscript.fetchTranscript(url)
    return transcriptArr.map((t) => t.text).join(" ")
  } catch (err) {
    console.error("Transcript fetch error:", err)
    return null
  }
}