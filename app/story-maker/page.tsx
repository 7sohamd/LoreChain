'use client'

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";
import { Volume2, Loader2, Square } from "lucide-react";

export default function StoryMakerPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [story, setStory] = useState("");
  const [error, setError] = useState("");
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStory("");
    setError("");
    try {
      const res = await fetch("/api/gemini-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      const data = await res.json();
      if (res.ok) {
        setStory(data.story);
      } else {
        setError(data.error || "Failed to generate story.");
      }
    } catch (err) {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSpeak() {
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
      const utter = new window.SpeechSynthesisUtterance(story);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6 text-center text-white">Story Maker (Educational)</h1>
        <p className="mb-6 text-slate-300 text-center">
          Enter a YouTube video URL (any language) or just a topic name. We'll turn it into a simple story anyone can understand!
        </p>
        <form onSubmit={handleSubmit} className="space-y-4 bg-slate-800/60 p-6 rounded-xl shadow-lg">
          <Input
            type="text"
            placeholder="Paste YouTube URL or enter a topic (e.g. Photosynthesis, Binary Search Tree)"
            value={input}
            onChange={e => setInput(e.target.value)}
            className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
            required
          />
          <Button type="submit" className="w-full" disabled={loading || !input}>
            {loading ? "Generating..." : "Generate Story"}
          </Button>
        </form>
        {error && <div className="mt-4 text-red-400 text-center">{error}</div>}
        {story && (
          <div className="mt-8 bg-slate-900/80 p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold mb-2 text-purple-300">Generated Story</h2>
            <div className="prose prose-invert max-w-none mb-4">
              <ReactMarkdown>{story}</ReactMarkdown>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Button
                onClick={handleSpeak}
                variant="outline"
                size="sm"
                className="border-slate-600 text-slate-300 hover:bg-slate-600"
                disabled={isLoadingAudio && !speaking}
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
          </div>
        )}
      </div>
    </div>
  );
} 