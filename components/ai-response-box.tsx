"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Copy, Plus, Volume2, Loader2, Square } from "lucide-react"
import { useRef, useState } from "react"
import { getSpeechFromText } from "@/lib/tts-service"

interface AIResponseBoxProps {
  suggestions: string[]
  isLoading: boolean
  onSelectSuggestion: (suggestion: string) => void
}

export function AIResponseBox({ suggestions, isLoading, onSelectSuggestion }: AIResponseBoxProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null)
  const [isLoadingAudio, setIsLoadingAudio] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const handleCopy = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const handleSpeak = async (text: string, index: number) => {
    if (speakingIndex === index) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
      setSpeakingIndex(null);
      setIsLoadingAudio(false);
      return;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsLoadingAudio(true);
    setSpeakingIndex(index);
    try {
      const audioBlob = await getSpeechFromText(text);
      if (!audioBlob) throw new Error('No audio received');
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
        setSpeakingIndex(null);
        setIsLoadingAudio(false);
      };
      audio.onpause = () => {
        setIsLoadingAudio(false);
      };
      await audio.play();
      setIsLoadingAudio(false);
    } catch (error) {
      setSpeakingIndex(null);
      setIsLoadingAudio(false);
      alert('TTS failed: ' + (error as Error).message);
    }
  }

  if (isLoading) {
    return (
      <Card className="bg-slate-800/50 border-purple-500/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-400 animate-pulse" />
            AI Generating Suggestions...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-slate-700/50 rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-slate-600 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-slate-600 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-800/50 border-purple-500/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-400" />
          AI Suggestions
        </CardTitle>
        <CardDescription className="text-slate-300">
          Select a suggestion to add to your lore, or use them as inspiration
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="bg-slate-700/50 rounded-lg p-4 border border-slate-600 hover:border-purple-500/50 transition-colors"
            >
              <p className="text-slate-200 leading-relaxed mb-3">{suggestion}</p>
              <div className="flex gap-2">
                <Button
                  onClick={() => onSelectSuggestion(suggestion)}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Plus className="mr-2 h-3 w-3" />
                  Add to Lore
                </Button>
                <Button
                  onClick={() => handleSpeak(suggestion, index)}
                  variant="outline"
                  size="sm"
                  className="border-slate-600 text-slate-300 hover:bg-slate-600"
                  disabled={isLoadingAudio && speakingIndex !== index}
                >
                  {isLoadingAudio && speakingIndex === index ? (
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  ) : speakingIndex === index ? (
                    <Square className="mr-2 h-3 w-3" />
                  ) : (
                    <Volume2 className="mr-2 h-3 w-3" />
                  )}
                  {isLoadingAudio && speakingIndex === index
                    ? "Loading..."
                    : speakingIndex === index
                    ? "Stop"
                    : "Speak"}
                </Button>
                <Button
                  onClick={() => handleCopy(suggestion, index)}
                  variant="outline"
                  size="sm"
                  className="border-slate-600 text-slate-300 hover:bg-slate-600"
                >
                  <Copy className="mr-2 h-3 w-3" />
                  {copiedIndex === index ? "Copied!" : "Copy"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
