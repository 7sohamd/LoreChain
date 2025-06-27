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
import { getSpeechFromText } from "@/lib/tts-service";

const HOST_VOICES = {
  "Host 1": "21m00Tcm4TlvDq8ikWAM", // Adam
  "Host 2": "JBFqnCBsd6RMkjVDRZzb", // Rachel
};

function pickBackgroundMusic(text: string) {
  const lower = text.toLowerCase();
  if (lower.includes("happy") || lower.includes("joy") || lower.includes("excited")) return "uplifting";
  if (lower.includes("sad") || lower.includes("cry") || lower.includes("loss")) return "sad";
  if (lower.includes("mystery") || lower.includes("secret") || lower.includes("unknown")) return "mystery";
  if (lower.includes("love") || lower.includes("romance") || lower.includes("heart")) return "romantic";
  if (lower.includes("adventure") || lower.includes("quest") || lower.includes("explore")) return "adventure";
  if (lower.includes("tense") || lower.includes("danger") || lower.includes("chase")) return "tension";
  if (lower.includes("relax") || lower.includes("calm") || lower.includes("peace")) return "relaxing";
  if (lower.includes("epic") || lower.includes("battle") || lower.includes("hero")) return "cinematic";
  return "cinematic";
}

function parsePodcastSegments(podcast: string): { speaker: 'Host 1' | 'Host 2', text: string }[] {
  // Returns [{ speaker: "Host 1", text: "..." }, ...]
  return podcast.split(/\n/).map(line => {
    const match = line.match(/^(Host 1|Host 2)(?:\s*\(.*\))?:\s*(.*)$/);
    if (match) return { speaker: match[1] as 'Host 1' | 'Host 2', text: match[2] };
    return { speaker: 'Host 1', text: line }; // fallback
  });
}

function stripMarkdown(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1') // bold
    .replace(/\*(.*?)\*/g, '$1')       // italics
    .replace(/\_(.*?)\_/g, '$1')       // underscore italics
    .replace(/\`(.*?)\`/g, '$1')       // inline code
    .replace(/^#+\s+(.*)/gm, '$1')      // headings
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // links
    .replace(/\!\[(.*?)\]\(.*?\)/g, '') // images
    .replace(/\>\s?(.*)/g, '$1')       // blockquotes
    .replace(/\r?\n/g, '\n')          // normalize newlines
    .replace(/\n{2,}/g, '\n');         // collapse multiple newlines
}

function ensureStartsWithHost(text: string) {
  const lines = text.split(/\n/).map(line => line.trim()).filter(Boolean);
  const firstHostIdx = lines.findIndex(line => /^Host [12](\s*\(.*\))?:/.test(line));
  if (firstHostIdx === 0) return lines.join('\n');
  const hostLines = lines.slice(firstHostIdx);
  return hostLines.join('\n');
}

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
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isStopped, setIsStopped] = useState(false);

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

  async function playPodcastWithVoicesElevenLabs(podcast: string, resumeFromIndex = 0) {
    const processedPodcast = ensureStartsWithHost(stripMarkdown(podcast));
    const segments = parsePodcastSegments(processedPodcast);
    setIsLoadingAudio(true);
    setSpeaking(true);
    setIsStopped(false);
    for (let i = resumeFromIndex; i < segments.length; i++) {
      setCurrentSegmentIndex(i);
      if (isStopped) break;
      if (!segments[i].text.trim()) continue;
      const voiceId = HOST_VOICES[segments[i].speaker] || HOST_VOICES["Host 1"];
      const backgroundMusic = pickBackgroundMusic(segments[i].text);
      const cleanText = stripMarkdown(segments[i].text);
      const audioBlob = await getSpeechFromText(cleanText, voiceId, backgroundMusic);
      if (!audioBlob) continue;
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      setCurrentAudio(audio);
      await new Promise<void>(resolve => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          setCurrentAudio(null);
          if (!isPaused && !isStopped) resolve();
        };
        audio.onerror = () => {
          setCurrentAudio(null);
          resolve();
        };
        audio.onpause = () => {
          if (isPaused) {
            setCurrentAudio(audio);
          }
        };
        audio.play();
      });
      if (isPaused || isStopped) break;
    }
    setSpeaking(false);
    setIsLoadingAudio(false);
    setCurrentAudio(null);
    setCurrentSegmentIndex(0);
    setIsPaused(false);
    setIsStopped(false);
  }

  async function handleSpeak() {
    if (speaking && currentAudio) {
      currentAudio.pause();
      setIsPaused(true);
      setSpeaking(false);
      setIsLoadingAudio(false);
      return;
    }
    if (isPaused && currentAudio) {
      currentAudio.play();
      setIsPaused(false);
      setSpeaking(true);
      setIsLoadingAudio(false);
      // Resume from current segment
      await playPodcastWithVoicesElevenLabs(podcast, currentSegmentIndex);
      return;
    }
    setIsPaused(false);
    setIsStopped(false);
    await playPodcastWithVoicesElevenLabs(podcast, 0);
  }

  function handlePause() {
    if (currentAudio) {
      currentAudio.pause();
      setIsPaused(true);
      setSpeaking(false);
    }
  }

  function handleResume() {
    if (currentAudio) {
      currentAudio.play();
      setIsPaused(false);
      setSpeaking(true);
    } else {
      // Resume from current segment
      playPodcastWithVoicesElevenLabs(podcast, currentSegmentIndex);
    }
  }

  function handleStop() {
    setIsStopped(true);
    setIsPaused(false);
    setSpeaking(false);
    setIsLoadingAudio(false);
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
    }
    setCurrentSegmentIndex(0);
  }

  return (
    <div className="min-h-screen w-full py-8 pt-24" style={{ background: '#fff9de' }}>
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6 text-center" style={{ color: '#3d2c00' }}>Podcast Generator</h1>
        <p className="mb-6 text-center" style={{ color: '#5c4a1a', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}>
          Enter a YouTube video URL or a topic. We'll turn it into a podcast-style conversation that's easy to understand and engaging!
        </p>
        {!user ? (
          <div className="text-center mt-8">
            <Button onClick={handleSignIn} className="bg-[#ffb300] text-[#3d2c00] hover:bg-[#ffd966] border-none font-bold shadow-none">Sign in with Google to use Podcast Generator</Button>
          </div>
        ) : (
        <>
        <form onSubmit={handleSubmit} className="space-y-4 p-6 rounded-xl shadow-lg" style={{ background: '#fff9de', border: '1px solid #ffb300' }}>
          <Input
            type="text"
            placeholder="Paste YouTube URL or enter a topic (e.g. Quantum Computing, World War II)"
            value={input}
            onChange={e => setInput(e.target.value)}
            className="bg-[#fff9de] border-[#ffb300] text-[#3d2c00] placeholder:text-[#bfa76a] font-mono"
            required
          />
          <Button type="submit" className="w-full bg-[#ffb300] text-[#3d2c00] hover:bg-[#ffd966] border-none font-bold shadow-none" disabled={loading || !input}>
            {loading ? "Generating..." : "Generate Podcast"}
          </Button>
        </form>
        {error && <div className="mt-4 text-center font-mono" style={{ color: '#b30000' }}>{error}</div>}
        {saveMsg && <div className="mt-4 text-center font-mono" style={{ color: '#1a7f37' }}>{saveMsg}</div>}
        {podcast && (
          <div className="mt-8 p-6 rounded-xl shadow-lg" style={{ background: '#fff9de', border: '1px solid #ffb300' }}>
            <h2 className="text-xl font-semibold mb-2" style={{ color: '#3d2c00' }}>Generated Podcast</h2>
            <div className="mb-4 prose max-w-none" style={{ color: '#5c4a1a', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}>
              <ReactMarkdown
                components={{
                  strong: ({node, ...props}) => <strong style={{ color: '#3d2c00' }} {...props} />,
                  b: ({node, ...props}) => <b style={{ color: '#3d2c00' }} {...props} />,
                  h1: ({node, ...props}) => <h1 style={{ color: '#3d2c00' }} {...props} />,
                  h2: ({node, ...props}) => <h2 style={{ color: '#3d2c00' }} {...props} />,
                  h3: ({node, ...props}) => <h3 style={{ color: '#3d2c00' }} {...props} />,
                  h4: ({node, ...props}) => <h4 style={{ color: '#3d2c00' }} {...props} />,
                  h5: ({node, ...props}) => <h5 style={{ color: '#3d2c00' }} {...props} />,
                  h6: ({node, ...props}) => <h6 style={{ color: '#3d2c00' }} {...props} />,
                  p: ({node, ...props}) => <p style={{ color: '#5c4a1a', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }} {...props} />,
                  li: ({node, ...props}) => <li style={{ color: '#5c4a1a', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }} {...props} />,
                }}
              >
                {showFullPodcast ? podcast : getPreview(podcast)}
              </ReactMarkdown>
              {(podcast.length > 500 || podcast.split("\n").length > 10) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 bg-transparent text-[#3d2c00] hover:bg-[#ffb300] hover:text-[#3d2c00] font-bold"
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
                className="border-[#ffb300] bg-[#ffb300] text-[#3d2c00] hover:bg-[#ffd966] font-bold"
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
                  ? "Pause"
                  : isPaused
                  ? "Resume"
                  : "Speak"}
              </Button>
              <Button
                onClick={handleStop}
                variant="destructive"
                size="sm"
                className="border-[#ffb300] bg-[#fff9de] text-[#3d2c00] hover:bg-[#ffd966] font-bold"
                disabled={!speaking && !isPaused}
              >
                Stop
              </Button>
            </div>
          </div>
        )}
        {/* Past Podcasts Section */}
        {pastChats.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#3d2c00' }}>Past Podcasts</h2>
            <div className="space-y-6">
              {pastChats.map((chat) => {
                const isExpanded = expandedPastChats[chat.id];
                const podcastText = chat.podcast || "";
                return (
                  <div key={chat.id} className="p-4 rounded-xl shadow border" style={{ background: '#fff9de', border: '1px solid #ffb300' }}>
                    <div className="text-xs mb-1" style={{ color: '#bfa76a', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}>
                      {chat.createdAt?.toDate ? chat.createdAt.toDate().toLocaleString() : ""}
                    </div>
                    <div className="text-sm mb-2" style={{ color: '#3d2c00' }}>
                      <b>Input:</b> <span style={{ color: '#5c4a1a', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}>{chat.input}</span>
                    </div>
                    <div className="prose max-w-none" style={{ color: '#5c4a1a', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}>
                      <ReactMarkdown
                        components={{
                          strong: ({node, ...props}) => <strong style={{ color: '#3d2c00' }} {...props} />,
                          b: ({node, ...props}) => <b style={{ color: '#3d2c00' }} {...props} />,
                          h1: ({node, ...props}) => <h1 style={{ color: '#3d2c00' }} {...props} />,
                          h2: ({node, ...props}) => <h2 style={{ color: '#3d2c00' }} {...props} />,
                          h3: ({node, ...props}) => <h3 style={{ color: '#3d2c00' }} {...props} />,
                          h4: ({node, ...props}) => <h4 style={{ color: '#3d2c00' }} {...props} />,
                          h5: ({node, ...props}) => <h5 style={{ color: '#3d2c00' }} {...props} />,
                          h6: ({node, ...props}) => <h6 style={{ color: '#3d2c00' }} {...props} />,
                          p: ({node, ...props}) => <p style={{ color: '#5c4a1a', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }} {...props} />,
                          li: ({node, ...props}) => <li style={{ color: '#5c4a1a', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }} {...props} />,
                        }}
                      >
                        {isExpanded ? podcastText : getPreview(podcastText)}
                      </ReactMarkdown>
                      {(podcastText.length > 500 || podcastText.split("\n").length > 10) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 bg-transparent text-[#3d2c00] hover:bg-[#ffb300] hover:text-[#3d2c00] font-bold"
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