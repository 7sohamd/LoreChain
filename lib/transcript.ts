import fetch from "node-fetch";

// AssemblyAI API key should be set in your .env file
const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY;

function extractVideoId(url: string): string | null {
  const regex = /(?:v=|\/)([0-9A-Za-z_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

export async function getTranscriptFromUrl(url: string): Promise<string | null> {
  try {
    if (!ASSEMBLYAI_API_KEY) throw new Error("AssemblyAI API key not set");
    const videoId = extractVideoId(url);
    if (!videoId) throw new Error("Invalid YouTube URL");
    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;

    // Step 1: Submit the YouTube URL for transcription
    const uploadRes = await fetch("https://api.assemblyai.com/v2/transcript", {
      method: "POST",
      headers: {
        "authorization": ASSEMBLYAI_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        audio_url: youtubeUrl,
        auto_chapters: false,
        speaker_labels: false,
        language_detection: true,
      }),
    });
    const uploadData = await uploadRes.json();
    if (!uploadData.id) throw new Error("Failed to submit YouTube URL to AssemblyAI");

    // Step 2: Poll for transcript completion
    let transcript = null;
    for (let i = 0; i < 30; i++) { // Poll for up to ~30 seconds
      await new Promise((r) => setTimeout(r, 1000));
      const statusRes = await fetch(`https://api.assemblyai.com/v2/transcript/${uploadData.id}`, {
        headers: { "authorization": ASSEMBLYAI_API_KEY },
      });
      const statusData = await statusRes.json();
      if (statusData.status === "completed") {
        transcript = statusData.text;
        break;
      } else if (statusData.status === "failed") {
        throw new Error("AssemblyAI transcript failed");
      }
    }
    if (!transcript) throw new Error("Transcript not ready. Please try again later.");
    return transcript;
  } catch (err) {
    console.error("Transcript fetch error:", err);
    return null;
  }
}
