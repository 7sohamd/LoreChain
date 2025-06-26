// Helper to call the ElevenLabs TTS API route
export async function getSpeechFromText(text: string, voiceId = "21m00Tcm4TlvDq8ikWAM", backgroundMusic = "cinematic"): Promise<Blob | null> {
  try {
    const res = await fetch("/api/elevenlabs-tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voiceId, backgroundMusic }),
    });
    if (!res.ok) throw new Error("TTS API error");
    return await res.blob();
  } catch (err) {
    console.error("TTS fetch error:", err);
    return null;
  }
}

// Optionally, add a helper to use the browser's speechSynthesis API
export function speakText(text: string) {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    const utter = new window.SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utter);
  } else {
    console.error('speechSynthesis not supported in this environment.');
  }
} 