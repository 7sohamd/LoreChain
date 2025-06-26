"use client"

import React, { useState } from "react";

export default function EasyStoryPage() {
  const [input, setInput] = useState("");
  const [manualTranscript, setManualTranscript] = useState("");
  const [showManualTranscript, setShowManualTranscript] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [story, setStory] = useState("");
  const [error, setError] = useState("");

  function isYouTubeUrl(url: string) {
    return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/i.test(url.trim());
  }

  async function handleGenerate(transcriptOverride?: string) {
    setLoading(true);
    setError("");
    setStory("");
    setShowManualTranscript(false);
    setLoadingMsg("");
    try {
      let body: any = {};
      if (transcriptOverride) {
        body.transcript = transcriptOverride;
      } else if (isYouTubeUrl(input)) {
        setLoadingMsg("Fetching transcript from YouTube...");
        body.url = input;
      } else {
        setLoadingMsg("Generating story...");
        body.transcript = input;
      }
      const res = await fetch("/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setLoadingMsg("Generating story with Gemini...");
      const data = await res.json();
      if (!res.ok) {
        if (data?.error?.toLowerCase().includes("transcript")) {
          setError("Could not fetch transcript from YouTube. Please try a different video or use text input.");
          setShowManualTranscript(true);
        } else {
          setError(data.error || "Failed to generate story");
        }
        return;
      }
      setStory(data.story || "No story generated.");
    } catch (err: any) {
      setError("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
      setLoadingMsg("");
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-2">Easy Story Generator</h1>
      <p className="mb-4 text-gray-600">Paste text or a YouTube link below to generate an easy-to-understand story for your users.</p>
      <div className="mb-2">
        <textarea
          className="w-full rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition p-4 min-h-[120px] text-lg bg-white placeholder-gray-400 shadow-sm resize-none"
          placeholder="Enter text or YouTube link..."
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={loading}
          spellCheck={true}
        />
        <div className="text-xs text-gray-500 mt-1 ml-1">You can paste a YouTube link or any text you want to turn into a story.</div>
      </div>
      <button
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition font-semibold shadow flex items-center gap-2"
        onClick={() => handleGenerate()}
        disabled={loading || !input.trim()}
      >
        {loading && (
          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
        )}
        {loading ? "Working..." : "Generate Easy Story"}
      </button>
      {loadingMsg && <div className="mt-3 text-blue-700 font-medium flex items-center gap-2">
        <svg className="animate-spin h-4 w-4 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
        </svg>
        {loadingMsg}
      </div>}
      {error && <div className="mt-4 text-red-600 font-medium">{error}</div>}
      {showManualTranscript && (
        <div className="mt-6">
          <label className="block mb-2 font-semibold text-gray-800">Paste Transcript Manually:</label>
          <textarea
            className="w-full rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition p-4 min-h-[100px] text-base bg-white placeholder-gray-400 shadow-sm resize-none mb-2"
            placeholder="Paste the transcript here..."
            value={manualTranscript}
            onChange={e => setManualTranscript(e.target.value)}
            disabled={loading}
            spellCheck={true}
          />
          <button
            className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition font-semibold shadow"
            onClick={() => handleGenerate(manualTranscript)}
            disabled={loading || !manualTranscript.trim()}
          >
            {loading ? "Generating..." : "Generate Story from Transcript"}
          </button>
        </div>
      )}
      {story && (
        <div className="mt-8 p-4 border rounded bg-gray-50 whitespace-pre-line text-gray-900">
          <h2 className="font-semibold mb-2 text-gray-800">Generated Story:</h2>
          {story}
        </div>
      )}
    </div>
  );
} 