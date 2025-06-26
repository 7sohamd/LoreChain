'use client'

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";
import { Volume2, Loader2, Square } from "lucide-react";
import { db, auth, provider } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, getDocs, orderBy, query, where } from "firebase/firestore";
import { signInWithPopup, onAuthStateChanged } from "firebase/auth";

const ELEVENLABS_VOICES = [
  { id: "JBFqnCBsd6RMkjVDRZzb", name: "Rachel (English)" },
  { id: "21m00Tcm4TlvDq8ikWAM", name: "Adam (English)" },
  { id: "AZnzlk1XvdvUeBnXmlld", name: "Antoni (English)" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Elli (English)" },
];

export default function StoryMakerPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [story, setStory] = useState("");
  const [error, setError] = useState("");
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voiceId, setVoiceId] = useState(ELEVENLABS_VOICES[0].id);
  const [saveMsg, setSaveMsg] = useState("");
  const [pastChats, setPastChats] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // Fetch past chats for this user
  useEffect(() => {
    async function fetchChats() {
      if (!user) {
        setPastChats([]);
        return;
      }
      const q = query(
        collection(db, "storyChats"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      setPastChats(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }
    fetchChats();
  }, [user]);

  const handleSignIn = async () => {
    await signInWithPopup(auth, provider);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStory("");
    setError("");
    setSaveMsg("");
    try {
      const res = await fetch("/api/gemini-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      const data = await res.json();
      if (res.ok) {
        setStory(data.story);
        // Save to Firestore with user info
        try {
          await addDoc(collection(db, "storyChats"), {
            input,
            story: data.story,
            userId: user.uid,
            userEmail: user.email,
            createdAt: serverTimestamp(),
          });
          setSaveMsg("Story saved to your past chats!");
          // Refresh past chats
          const q = query(
            collection(db, "storyChats"),
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc")
          );
          const querySnapshot = await getDocs(q);
          setPastChats(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (fireErr) {
          setSaveMsg("Failed to save story to past chats.");
        }
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
        {!user ? (
          <div className="text-center mt-8">
            <Button onClick={handleSignIn}>Sign in with Google to use Story Maker</Button>
          </div>
        ) : (
        <>
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
        {saveMsg && <div className="mt-4 text-green-400 text-center">{saveMsg}</div>}
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
        {/* Past Chats Section */}
        {pastChats.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4 text-white">Past Chats</h2>
            <div className="space-y-6">
              {pastChats.map((chat) => (
                <div key={chat.id} className="bg-slate-800/60 p-4 rounded-xl shadow border border-slate-700">
                  <div className="text-slate-400 text-xs mb-1">
                    {chat.createdAt?.toDate ? chat.createdAt.toDate().toLocaleString() : ""}
                  </div>
                  <div className="text-slate-300 text-sm mb-2">
                    <b>Input:</b> {chat.input}
                  </div>
                  <div className="prose prose-invert max-w-none">
                    <ReactMarkdown>{chat.story}</ReactMarkdown>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        </>
        )}
      </div>
    </div>
  );
} 