"use client"

import { useEffect, useState, useRef } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const backgrounds = [
  { label: "Default", value: "" },
  { label: "Night Sky", value: "url('https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=1500&q=80')" },
  { label: "Purple Gradient", value: "linear-gradient(135deg, #7b2ff2 0%, #f357a8 100%)" },
  { label: "Solid Black", value: "#000" },
  { label: "Solid White", value: "#fff" },
]

export default function ExperiencePage() {
  const [bg, setBg] = useState("")
  const [audioUrl, setAudioUrl] = useState("")
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)
  const [stories, setStories] = useState<any[]>([])
  const [selectedStory, setSelectedStory] = useState<string>("")
  const [speaking, setSpeaking] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Fetch all stories
  useEffect(() => {
    const fetchStories = async () => {
      const snap = await getDocs(collection(db, "stories"))
      setStories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    }
    fetchStories()
  }, [])

  // Handle background change
  useEffect(() => {
    document.body.style.background = bg || ""
    return () => { document.body.style.background = "" }
  }, [bg])

  // Handle audio play
  useEffect(() => {
    if (audio && audioUrl) {
      audio.play()
    }
    return () => {
      if (audio) audio.pause()
    }
  }, [audio])

  // Handle text-to-speech
  const handleSpeak = () => {
    if (!selectedStory) return
    const story = stories.find(s => s.id === selectedStory)
    if (!story) return
    const utter = new window.SpeechSynthesisUtterance(`${story.title}. ${story.content}`)
    utter.onend = () => setSpeaking(false)
    setSpeaking(true)
    window.speechSynthesis.speak(utter)
  }

  // Handle stop speaking
  const handleStopSpeak = () => {
    window.speechSynthesis.cancel()
    setSpeaking(false)
  }

  // Handle audio file upload
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0])
      setAudioUrl(url)
      setAudio(new Audio(url))
    }
  }

  // Handle audio URL input
  const handleAudioUrl = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAudioUrl(e.target.value)
    setAudio(new Audio(e.target.value))
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4" style={{ background: bg, transition: "background 0.5s" }}>
      <div className="max-w-xl w-full bg-white/80 rounded-lg shadow-lg p-8 space-y-6">
        <h1 className="text-3xl font-bold text-center mb-4">Immersive Story Experience</h1>
        
        {/* Background Selector */}
        <div>
          <label className="block font-semibold mb-1">Background</label>
          <select className="w-full p-2 rounded border" value={bg} onChange={e => setBg(e.target.value)}>
            {backgrounds.map(b => (
              <option key={b.label} value={b.value}>{b.label}</option>
            ))}
          </select>
        </div>

        {/* Audio Player */}
        <div>
          <label className="block font-semibold mb-1">Background Audio</label>
          <Input type="file" accept="audio/*" onChange={handleAudioUpload} />
          <div className="flex gap-2 mt-2">
            <Input type="text" placeholder="Paste audio URL..." value={audioUrl} onChange={handleAudioUrl} />
            <Button onClick={() => { if (audio) audio.play() }}>Play</Button>
            <Button onClick={() => { if (audio) audio.pause() }}>Pause</Button>
          </div>
          {audioUrl && (
            <audio ref={audioRef} src={audioUrl} controls className="w-full mt-2" />
          )}
        </div>

        {/* Story Selector */}
        <div>
          <label className="block font-semibold mb-1">Select Story</label>
          <select className="w-full p-2 rounded border" value={selectedStory} onChange={e => setSelectedStory(e.target.value)}>
            <option value="">-- Choose a story --</option>
            {stories.map(story => (
              <option key={story.id} value={story.id}>{story.title}</option>
            ))}
          </select>
        </div>

        {/* Speak Button */}
        <div className="flex gap-2">
          <Button onClick={handleSpeak} disabled={!selectedStory || speaking}>Speak Story</Button>
          <Button onClick={handleStopSpeak} disabled={!speaking}>Stop</Button>
        </div>
      </div>
    </div>
  )
} 