import React, { useState } from "react";

export default function EasyStoryPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [story, setStory] = useState("");
  const [error, setError] = useState("");

  function isYouTubeUrl(url: string) {
    return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/i.test(url.trim());
  }

  async function fetchTranscript(youtubeUrl: string) {
    const res = await fetch("/api/transcript", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: youtubeUrl }),
    });
    if (!res.ok) throw new Error("Failed to fetch transcript");
    const data = await res.json();
    return data.transcript;
  }

  async function handleGenerate() {
    setLoading(true);
    setError("");
    setStory("");
    try {
      let transcript = input;
      if (isYouTubeUrl(input)) {
        transcript = await fetchTranscript(input);
      }
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      });
      if (!res.ok) throw new Error("Failed to generate story");
      const data = await res.json();
      setStory(data.response || "No story generated.");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-2">Easy Story Generator</h1>
      <p className="mb-6 text-gray-600">Paste text or a YouTube link below to generate an easy-to-understand story for your users.</p>
      <textarea
        className="w-full border rounded p-3 mb-4 min-h-[100px]"
        placeholder="Enter text or YouTube link..."
        value={input}
        onChange={e => setInput(e.target.value)}
        disabled={loading}
      />
      <button
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        onClick={handleGenerate}
        disabled={loading || !input.trim()}
      >
        {loading ? "Generating..." : "Generate Easy Story"}
      </button>
      {error && <div className="mt-4 text-red-600">{error}</div>}
      {story && (
        <div className="mt-8 p-4 border rounded bg-gray-50 whitespace-pre-line">
          <h2 className="font-semibold mb-2">Generated Story:</h2>
          {story}
        </div>
      )}
    </div>
  );
} 