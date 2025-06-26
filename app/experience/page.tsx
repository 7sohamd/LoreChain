"use client"

import { useEffect, useState, useRef } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Play, Pause, Volume2, Image as ImageIcon, Music, ChevronDown } from "lucide-react"

const backgroundsByCategory: Record<string, { value: string; preview: string }> = {
  "event": {
    value: "linear-gradient(135deg, #f8fafc 0%, #a78bfa 100%)",
    preview: ""
  },
  "place": {
    value: "url('https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=1500&q=80')",
    preview: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=300&q=80"
  },
  "character": {
    value: "linear-gradient(135deg, #fff1eb 0%, #ace0f9 100%)",
    preview: ""
  },
  "faction": {
    value: "linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)",
    preview: ""
  },
  "object": {
    value: "linear-gradient(135deg, #f9f9f9 0%, #d6d6d6 100%)",
    preview: ""
  }
}
const defaultBackground = "linear-gradient(135deg, #f8fafc 0%, #a78bfa 100%)"
const playingBackground = "linear-gradient(135deg, #232526 0%, #414345 100%)" // fallback if no category

const musicByCategory: Record<string, string> = {
  "event": "https://cdn.pixabay.com/audio/2022/10/16/audio_12b6b1b7b2.mp3",
  "place": "https://cdn.pixabay.com/audio/2022/07/26/audio_124bfae5b2.mp3",
  "character": "https://cdn.pixabay.com/audio/2022/10/16/audio_12b6b1b7b2.mp3",
  "faction": "https://cdn.pixabay.com/audio/2022/07/26/audio_124bfae5b2.mp3",
  "object": "https://cdn.pixabay.com/audio/2022/10/16/audio_12b6b1b7b2.mp3",
}
const defaultMusic = "https://cdn.pixabay.com/audio/2022/07/26/audio_124bfae5b2.mp3"

export default function ExperiencePage() {
  const [bg, setBg] = useState(defaultBackground)
  const [audioUrl, setAudioUrl] = useState(defaultMusic)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)
  const [stories, setStories] = useState<any[]>([])
  const [selectedStory, setSelectedStory] = useState<string>("")
  const [speaking, setSpeaking] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<string>("")
  const [rate, setRate] = useState(1)
  const [pitch, setPitch] = useState(1)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [activeStoryBg, setActiveStoryBg] = useState(defaultBackground)

  // Fetch all stories
  useEffect(() => {
    const fetchStories = async () => {
      const snap = await getDocs(collection(db, "stories"))
      setStories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    }
    fetchStories()
  }, [])

  // Fetch available voices for TTS
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const populateVoices = () => {
        const v = window.speechSynthesis.getVoices()
        setVoices(v)
        if (v.length && !selectedVoice) setSelectedVoice(v[0].name)
      }
      populateVoices()
      window.speechSynthesis.onvoiceschanged = populateVoices
    }
  }, [selectedVoice])

  // Handle background change
  useEffect(() => {
    document.body.style.background = bg || ""
    return () => { document.body.style.background = "" }
  }, [bg])

  // Play audio when audioUrl changes
  useEffect(() => {
    if (audioUrl) {
      const newAudio = new Audio(audioUrl)
      setAudio(newAudio)
      newAudio.play()
    }
    // Pause previous audio
    return () => {
      if (audio) audio.pause()
    }
    // eslint-disable-next-line
  }, [audioUrl])

  // When a story is selected, set up music and background for that story
  useEffect(() => {
    if (!selectedStory) return
    const story = stories.find(s => s.id === selectedStory)
    if (!story) return
    const music = musicByCategory[story.category] || defaultMusic
    setAudioUrl(music)
    const bgObj = backgroundsByCategory[story.category]
    setActiveStoryBg(bgObj ? bgObj.value : playingBackground)
  // eslint-disable-next-line
  }, [selectedStory])

  // Change background only while speaking
  useEffect(() => {
    if (speaking) {
      setBg(activeStoryBg)
    } else {
      setBg(defaultBackground)
    }
  }, [speaking, activeStoryBg])

  // Handle text-to-speech
  const handleSpeak = () => {
    if (!selectedStory) return
    const story = stories.find(s => s.id === selectedStory)
    if (!story) return
    const utter = new window.SpeechSynthesisUtterance(`${story.title}. ${story.content}`)
    if (selectedVoice) {
      const voice = voices.find(v => v.name === selectedVoice)
      if (voice) utter.voice = voice
    }
    utter.rate = rate
    utter.pitch = pitch
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
    }
  }

  // Handle audio URL input
  const handleAudioUrl = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAudioUrl(e.target.value)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4" style={{ background: bg, transition: "background 0.5s" }}>
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-lg p-8 space-y-8 border border-slate-200 text-black">
        {/* Background and Audio Controls */}
        <div className="flex flex-col md:flex-row gap-6 mb-4">
          <div className="flex-1">
            <label className="block font-semibold mb-1 flex items-center gap-2 text-black"><ImageIcon className="w-5 h-5 text-purple-600" />Background changes with story</label>
            <div className="flex gap-2">
              {Object.entries(backgroundsByCategory).map(([cat, b]) => (
                <div key={cat} className="flex flex-col items-center">
                  <div
                    className={`rounded-lg border-2 w-10 h-10 flex items-center justify-center transition-all ${bg === b.value ? "border-purple-500 ring-2 ring-purple-300" : "border-slate-300"}`}
                    style={b.value ? { background: b.value, backgroundSize: "cover" } : {}}
                    title={cat}
                  />
                  <span className="text-xs mt-1 text-black font-medium">{cat}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1">
            <label className="block font-semibold mb-1 flex items-center gap-2 text-black"><Music className="w-5 h-5 text-purple-600" />Music changes with story</label>
            <Input type="file" accept="audio/*" onChange={handleAudioUpload} className="mb-2 text-black" />
            <Input type="text" placeholder="Paste audio URL..." value={audioUrl} onChange={handleAudioUrl} className="mb-2 text-black" />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { if (audio) audio.play() }} className="text-black border-slate-300"><Play className="w-5 h-5 text-purple-600" /></Button>
              <Button variant="outline" onClick={() => { if (audio) audio.pause() }} className="text-black border-slate-300"><Pause className="w-5 h-5 text-purple-600" /></Button>
            </div>
            {audioUrl && (
              <audio ref={audioRef} src={audioUrl} controls className="w-full mt-2 rounded" />
            )}
          </div>
        </div>

        {/* Story Selector */}
        <div>
          <label className="block font-semibold mb-1 flex items-center gap-2 text-black"><Volume2 className="w-5 h-5 text-purple-600" />Select Story</label>
          <select className="w-full p-2 rounded border text-black" value={selectedStory} onChange={e => setSelectedStory(e.target.value)}>
            <option value="">-- Choose a story --</option>
            {stories.map(story => (
              <option key={story.id} value={story.id}>
                {story.title}
              </option>
            ))}
          </select>
        </div>

        {/* Voice Selector */}
        <div>
          <label className="block font-semibold mb-1 flex items-center gap-2 text-black"><ChevronDown className="w-5 h-5 text-purple-600" />Voice</label>
          <select className="w-full p-2 rounded border text-black" value={selectedVoice} onChange={e => setSelectedVoice(e.target.value)}>
            {voices.map(v => (
              <option key={v.name} value={v.name}>{v.name} {v.lang}</option>
            ))}
          </select>
          <div className="flex gap-4 mt-2">
            <div>
              <label className="block text-xs text-black font-medium">Rate</label>
              <input type="range" min="0.5" max="2" step="0.1" value={rate} onChange={e => setRate(Number(e.target.value))} />
              <span className="ml-2 text-xs text-black font-semibold">{rate}</span>
            </div>
            <div>
              <label className="block text-xs text-black font-medium">Pitch</label>
              <input type="range" min="0.5" max="2" step="0.1" value={pitch} onChange={e => setPitch(Number(e.target.value))} />
              <span className="ml-2 text-xs text-black font-semibold">{pitch}</span>
            </div>
          </div>
        </div>

        {/* Speak Button */}
        <div className="flex gap-2">
          <Button onClick={handleSpeak} disabled={!selectedStory || speaking} variant="secondary" className="text-white border-white bg-purple-600 hover:bg-purple-700">
            <Volume2 className="w-5 h-5 mr-1 text-white" /> Speak Story
          </Button>
          <Button onClick={handleStopSpeak} disabled={!speaking} variant="destructive" className="text-black border-slate-300">
            <Pause className="w-5 h-5 mr-1 text-purple-600" /> Stop
          </Button>
        </div>
      </div>
    </div>
  )
} 