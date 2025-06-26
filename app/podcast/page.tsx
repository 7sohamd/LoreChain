"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";
import { Volume2, Loader2, Square } from "lucide-react";

export default function PodcastPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [podcast, setPodcast] = useState("");
  const [error, setError] = useState("");
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setPodcast("");
    setError("");
    try {
      const res = await fetch("/api/podcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      const data = await res.json();
      if (res.ok) {
        setPodcast(data.podcast);
      } else {
        setError(data.error || "Failed to generate podcast.");
      }
    } catch (err) {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function handleSpeak() {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      setIsLoadingAudio(false);
      return;
    }
    window.speechSynthesis.cancel();
    setIsLoadingAudio(true);
    setSpeaking(true);
    try {
      const utter = new window.SpeechSynthesisUtterance(podcast);
      utter.onend = () => {
        setSpeaking(false);
        setIsLoadingAudio(false);
      };
      utter.onerror = () => {
        setSpeaking(false);
        setIsLoadingAudio(false);
        alert('TTS failed.');
      };
      window.speechSynthesis.speak(utter);
      setIsLoadingAudio(false);
    } catch (error) {
      setSpeaking(false);
      setIsLoadingAudio(false);
      alert('TTS failed: ' + (error as Error).message);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-2">Podcast Generator</h1>
      <p className="mb-6 text-gray-600">Paste text or a YouTube link below to generate a podcast-style conversation that's easy to understand and engaging.</p>
      <form onSubmit={handleSubmit} className="space-y-4 bg-slate-800/60 p-6 rounded-xl shadow-lg">
        <Textarea
          className="w-full rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition p-4 min-h-[100px] text-lg bg-white placeholder-gray-400 shadow-sm resize-none"
          placeholder="Enter text or YouTube link..."
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={loading}
          spellCheck={true}
        />
        <Button
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition font-semibold shadow"
          type="submit"
          disabled={loading || !input.trim()}
        >
          {loading ? "Generating..." : "Generate Podcast"}
        </Button>
      </form>
      {error && <div className="mt-4 text-red-400 text-center">{error}</div>}
      {podcast && (
        <div className="mt-8 bg-slate-900/80 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-2 text-purple-300">Generated Podcast</h2>
          <div className="prose prose-invert max-w-none mb-4">
            <ReactMarkdown>{podcast}</ReactMarkdown>
          </div>
          <Button
            onClick={handleSpeak}
            variant="outline"
            size="sm"
            className="border-slate-600 text-slate-300 hover:bg-slate-600"
            disabled={isLoadingAudio && speaking}
          >
            {isLoadingAudio && speaking ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : speaking ? (
              <Square className="mr-2 h-4 w-4" />
            ) : (
              <Volume2 className="mr-2 h-4 w-4" />
            )}
            {isLoadingAudio && speaking
              ? "Loading..."
              : speaking
              ? "Stop"
              : "Speak"}
          </Button>
        </div>
      )}
    </div>
  );
} 