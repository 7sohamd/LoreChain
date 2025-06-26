"use client"

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";
import { Volume2, Loader2, Square } from "lucide-react";
import { db, auth, provider } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, getDocs, orderBy, query, where } from "firebase/firestore";
import { signInWithPopup, onAuthStateChanged } from "firebase/auth";

export default function PodcastPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [podcast, setPodcast] = useState("");
  const [error, setError] = useState("");
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [pastChats, setPastChats] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [showFullPodcast, setShowFullPodcast] = useState(false);
  const [expandedPastChats, setExpandedPastChats] = useState<{ [id: string]: boolean }>({});

  // Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // Fetch past podcasts for this user
  useEffect(() => {
    async function fetchChats() {
      if (!user) {
        setPastChats([]);
        return;
      }
      const q = query(
        collection(db, "podcastChats"),
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
    setPodcast("");
    setError("");
    setSaveMsg("");
    try {
      const res = await fetch("/api/gemini-podcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      const data = await res.json();
      if (res.ok) {
        setPodcast(data.podcast);
        // Save to Firestore with user info
        try {
          await addDoc(collection(db, "podcastChats"), {
            input,
            podcast: data.podcast,
            userId: user.uid,
            userEmail: user.email,
            createdAt: serverTimestamp(),
          });
          setSaveMsg("Podcast saved to your past chats!");
          // Refresh past chats
          const q = query(
            collection(db, "podcastChats"),
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc")
          );
          const querySnapshot = await getDocs(q);
          setPastChats(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (fireErr) {
          setSaveMsg("Failed to save podcast to past chats.");
        }
      } else {
        setError(data.error || "Failed to generate podcast.");
      }
    } catch (err) {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function playPodcastWithVoices(podcast: string, onDone: () => void) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Speech synthesis not supported.');
      return;
    }
    window.speechSynthesis.cancel();

    const voices = window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('en'));
    // Pick two distinct voices (male/female if possible)
    let host1Voice = voices.find(v => v.name.toLowerCase().includes('female')) || voices[0];
    let host2Voice = voices.find(v => v.name.toLowerCase().includes('male') && v !== host1Voice) || voices[1] || voices[0];
    if (host1Voice === host2Voice && voices.length > 1) host2Voice = voices[1];

    // Split by Host 1: and Host 2:
    const lines = podcast.split(/\n/).filter(line => line.trim());
    const utterances: SpeechSynthesisUtterance[] = [];

    for (const line of lines) {
      let utter: SpeechSynthesisUtterance | null = null;
      if (line.startsWith('Host 1:')) {
        utter = new window.SpeechSynthesisUtterance(line.replace(/^Host 1:\s*/, ''));
        utter.voice = host1Voice;
        utter.rate = 1.12;
        utter.pitch = 1.25;
      } else if (line.startsWith('Host 2:')) {
        utter = new window.SpeechSynthesisUtterance(line.replace(/^Host 2:\s*/, ''));
        utter.voice = host2Voice;
        utter.rate = 1.05;
        utter.pitch = 0.85;
      } else {
        // Default to Host 1
        utter = new window.SpeechSynthesisUtterance(line);
        utter.voice = host1Voice;
        utter.rate = 1.12;
        utter.pitch = 1.25;
      }
      utterances.push(utter);
    }

    function speakNext(index: number) {
      if (index >= utterances.length) {
        onDone();
        return;
      }
      const utter = utterances[index];
      utter.onend = () => speakNext(index + 1);
      utter.onerror = () => onDone();
      window.speechSynthesis.speak(utter);
    }
    speakNext(0);
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
      playPodcastWithVoices(podcast, () => {
        setSpeaking(false);
        setIsLoadingAudio(false);
      });
    } catch (error) {
      setSpeaking(false);
      setIsLoadingAudio(false);
      alert('TTS failed: ' + (error as Error).message);
    }
  }

  // Helper to get preview text (first 500 chars or 10 lines)
  function getPreview(text: string) {
    const lines = text.split("\n");
    if (lines.length > 10) {
      return lines.slice(0, 10).join("\n") + "...";
    }
    if (text.length > 500) {
      return text.slice(0, 500) + "...";
    }
    return text;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-950 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6 text-center text-white">Podcast Generator</h1>
        <p className="mb-6 text-slate-300 text-center">
          Enter a YouTube video URL or a topic. We'll turn it into a podcast-style conversation that's easy to understand and engaging!
        </p>
        {!user ? (
          <div className="text-center mt-8">
            <Button onClick={handleSignIn}>Sign in with Google to use Podcast Generator</Button>
          </div>
        ) : (
        <>
        <form onSubmit={handleSubmit} className="space-y-4 bg-slate-800/60 p-6 rounded-xl shadow-lg">
          <Input
            type="text"
            placeholder="Paste YouTube URL or enter a topic (e.g. Quantum Computing, World War II)"
            value={input}
            onChange={e => setInput(e.target.value)}
            className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
            required
          />
          <Button type="submit" className="w-full" disabled={loading || !input}>
            {loading ? "Generating..." : "Generate Podcast"}
          </Button>
        </form>
        {error && <div className="mt-4 text-red-400 text-center">{error}</div>}
        {saveMsg && <div className="mt-4 text-green-400 text-center">{saveMsg}</div>}
        {podcast && (
          <div className="mt-8 bg-slate-900/80 p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold mb-2 text-blue-300">Generated Podcast</h2>
            <div className="prose prose-invert max-w-none mb-4">
              <ReactMarkdown>
                {showFullPodcast ? podcast : getPreview(podcast)}
              </ReactMarkdown>
              {(podcast.length > 500 || podcast.split("\n").length > 10) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 text-blue-400 hover:underline"
                  onClick={() => setShowFullPodcast((v) => !v)}
                >
                  {showFullPodcast ? "See less" : "See more"}
                </Button>
              )}
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
        {/* Past Podcasts Section */}
        {pastChats.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4 text-white">Past Podcasts</h2>
            <div className="space-y-6">
              {pastChats.map((chat) => {
                const isExpanded = expandedPastChats[chat.id];
                const podcastText = chat.podcast || "";
                return (
                  <div key={chat.id} className="bg-slate-800/60 p-4 rounded-xl shadow border border-slate-700">
                    <div className="text-slate-400 text-xs mb-1">
                      {chat.createdAt?.toDate ? chat.createdAt.toDate().toLocaleString() : ""}
                    </div>
                    <div className="text-slate-300 text-sm mb-2">
                      <b>Input:</b> {chat.input}
                    </div>
                    <div className="prose prose-invert max-w-none">
                      <ReactMarkdown>
                        {isExpanded ? podcastText : getPreview(podcastText)}
                      </ReactMarkdown>
                      {(podcastText.length > 500 || podcastText.split("\n").length > 10) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 text-blue-400 hover:underline"
                          onClick={() => setExpandedPastChats((prev) => ({ ...prev, [chat.id]: !prev[chat.id] }))}
                        >
                          {isExpanded ? "See less" : "See more"}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        </>
        )}
      </div>
    </div>
  );
} 