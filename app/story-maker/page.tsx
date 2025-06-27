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
import { Badge } from "@/components/ui/badge";

const ELEVENLABS_VOICES = [
  { id: "JBFqnCBsd6RMkjVDRZzb", name: "Rachel (English)" },
  { id: "21m00Tcm4TlvDq8ikWAM", name: "Adam (English)" },
  { id: "AZnzlk1XvdvUeBnXmlld", name: "Antoni (English)" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Elli (English)" },
];

function extractTitleAndExcerpt(story: string, input: string) {
  // Use input as title if it looks like a topic, else first line of story
  let title = input.trim();
  if (title.length > 60 || title.match(/^https?:\/\//)) {
    // If input is a URL or too long, use first line of story
    title = story.split("\n")[0].slice(0, 60);
  }
  const excerpt = story.replace(/\n/g, " ").slice(0, 120) + (story.length > 120 ? "..." : "");
  return { title, excerpt };
}

function extractTags(input: string): string[] {
  // Simple keyword extraction: split by space, remove stopwords, dedupe, filter short
  const stopwords = ["the","and","or","in","on","at","a","an","of","for","to","with","by","from","is","are","was","were","as","that","this","it","be","but","if","then","so","do","does","did","has","have","had","will","would","can","could","should","may","might","must","not","just","about","into","over","after","before","between","under","above","more","most","some","such","no","nor","only","own","same","than","too","very","s","t","ll","d","m","re","ve","y","ain","aren","couldn","didn","doesn","hadn","hasn","haven","isn","ma","mightn","mustn","needn","shan","shouldn","wasn","weren","won","wouldn"];
  return Array.from(new Set(input
    .replace(/[^\w\s+#]/g, " ")
    .split(/\s+/)
    .map(w => w.trim().replace(/^#+/, ""))
    .filter(w => w.length > 1 && !stopwords.includes(w.toLowerCase()))
    .map(w => w[0].toUpperCase() + w.slice(1))
  ));
}

// New: classifyTags function for higher-level categories
function classifyTags(tags: string[]): string[] {
  const categories: { [category: string]: string[] } = {
    "Data Structures": [
      "Array", "Linked List", "Stack", "Queue", "Tree", "Binary Tree", "BST", "Heap", "Trie", "Graph", "Hashmap", "Hash Table", "Set", "Map"
    ],
    "Algorithms": [
      "Sort", "Sorting", "Search", "Searching", "DFS", "BFS", "Dijkstra", "Algorithm", "Recursion", "Dynamic Programming", "Greedy", "Backtracking"
    ],
    "Programming": [
      "C++", "Java", "Python", "JavaScript", "TypeScript", "Code", "Programming", "Function", "Variable", "Loop", "Condition", "Class", "Object"
    ],
    "Math": [
      "Math", "Algebra", "Geometry", "Probability", "Statistics", "Number", "Prime", "Factorial", "Equation"
    ],
    "Science": [
      "Physics", "Chemistry", "Biology", "Photosynthesis", "Cell", "Atom", "Molecule", "Energy", "Force"
    ],
    "History": [
      "History", "War", "Revolution", "Empire", "Ancient", "Medieval", "Modern"
    ],
    "Geography": [
      "Country", "Continent", "Ocean", "Mountain", "River", "Desert", "Geography"
    ],
    // Add more as needed
  };

  const foundCategories = new Set<string>();
  for (const tag of tags) {
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.map(k => k.toLowerCase()).includes(tag.toLowerCase())) {
        foundCategories.add(category);
      }
    }
  }
  return Array.from(foundCategories);
}

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
  const [search, setSearch] = useState("");
  const [expandedChatId, setExpandedChatId] = useState<string | null>(null);

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
    if (speaking && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
      setSpeaking(false);
      setIsLoadingAudio(false);
      return;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsLoadingAudio(true);
    setSpeaking(true);
    try {
      const response = await fetch('/api/elevenlabs-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: story, voiceId }),
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
        setSpeaking(false);
        setIsLoadingAudio(false);
      };
      audio.onpause = () => {
        setIsLoadingAudio(false);
      };
      await audio.play();
      setIsLoadingAudio(false);
    } catch (error) {
      setSpeaking(false);
      setIsLoadingAudio(false);
      alert('TTS failed: ' + (error as Error).message);
    }
  }

  return (
    <div className="min-h-screen bg-[#fff9de] py-8 pt-24">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6 text-center text-[#3d2c00] text-justify">Story Maker (Educational)</h1>
        <p className="mb-6 text-[#5c4a1a] text-center font-mono text-justify">
          Enter a YouTube video URL (any language) or just a topic name. We'll turn it into a simple story anyone can understand!
        </p>
        {!user ? (
          <div className="text-center mt-8">
            <Button onClick={handleSignIn} className="bg-[#ffb300] text-[#3d2c00] font-bold shadow border border-[#f5e6b2] hover:bg-[#ffd54f]">Sign in with Google to use Story Maker</Button>
          </div>
        ) : (
        <>
        <div className="mb-10 flex justify-center">
          <form onSubmit={handleSubmit} className="w-full max-w-xl bg-white border border-[#f5e6b2] p-8 rounded-2xl shadow-xl flex flex-col gap-4">
            <Input
              type="text"
              placeholder="Paste YouTube URL or enter a topic (e.g. Photosynthesis, Binary Search Tree)"
              value={input}
              onChange={e => setInput(e.target.value)}
              className="bg-[#fff9de] border-2 border-[#ffb300] text-[#3d2c00] placeholder:text-[#a3a380] rounded-lg shadow-md focus:border-[#3d2c00] focus:ring-2 focus:ring-[#ffb300] transition-all text-base py-3 px-4"
              required
            />
            <Button type="submit" className="w-full bg-[#ffb300] text-[#3d2c00] font-bold shadow border border-[#f5e6b2] hover:bg-[#ffd54f] hover:text-[#3d2c00] rounded-lg text-lg py-3 transition-all" disabled={loading || !input}>
              {loading ? "Generating..." : "Generate Story"}
            </Button>
          </form>
        </div>
        {error && <div className="mt-4 text-red-400 text-center font-mono">{error}</div>}
        {saveMsg && <div className="mt-4 text-green-400 text-center font-mono">{saveMsg}</div>}
        {story && (
          <div className="mt-8 bg-white border border-[#f5e6b2] p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold mb-2 text-[#3d2c00]">Generated Story</h2>
            <div className="prose max-w-none mb-4 text-[#3d2c00] text-justify">
              <ReactMarkdown>{story}</ReactMarkdown>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <label htmlFor="voice-select" className="text-[#5c4a1a] text-sm mr-2 font-mono">Voice:</label>
              <select
                id="voice-select"
                value={voiceId}
                onChange={e => setVoiceId(e.target.value)}
                className="bg-[#fff9de] text-[#3d2c00] rounded px-2 py-1 border border-[#f5e6b2] focus:outline-none font-mono"
              >
                {ELEVENLABS_VOICES.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
              <Button
                onClick={handleSpeak}
                variant="outline"
                size="sm"
                className="border-[#ffb300] text-[#3d2c00] bg-transparent hover:bg-[#ffb300] hover:text-[#3d2c00] font-bold rounded-lg shadow-sm transition-colors"
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
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4 text-[#3d2c00] text-justify">Past Chats</h2>
          <Input
            placeholder="Search by keyword (e.g. C++, Arrays, DataStructures)"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="mb-6 bg-[#fff9de] border-2 border-[#ffb300] text-[#3d2c00] placeholder:text-[#a3a380] rounded-lg shadow-md focus:border-[#3d2c00] focus:ring-2 focus:ring-[#ffb300] transition-all text-base py-3 px-4"
          />
          <div className="space-y-6">
            {pastChats
              .map(chat => ({
                ...chat,
                tags: extractTags(chat.input),
                categories: classifyTags(extractTags(chat.input)),
                ...extractTitleAndExcerpt(chat.story, chat.input),
              }))
              .filter(chat =>
                !search ||
                chat.tags.some((tag: string) => tag.toLowerCase().includes(search.toLowerCase())) ||
                (chat.categories && chat.categories.some((cat: string) => cat.toLowerCase().includes(search.toLowerCase()))) ||
                chat.title.toLowerCase().includes(search.toLowerCase())
              )
              .map((chat) => (
                <div key={chat.id} className="bg-white border border-[#f5e6b2] p-4 rounded-xl shadow">
                  <div className="text-[#a3a380] text-xs mb-1 font-mono">
                    {chat.createdAt?.toDate ? chat.createdAt.toDate().toLocaleString() : ""}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {(chat.categories as string[]).map((cat: string) => (
                      <Badge key={cat} className="bg-[#fff9de] border border-[#ffb300] text-[#ffb300] font-mono">{cat}</Badge>
                    ))}
                    {(chat.tags as string[]).map((tag: string) => (
                      <Badge key={tag} className="bg-[#fff9de] border border-[#a3a380] text-[#a3a380] font-mono">{tag}</Badge>
                    ))}
                  </div>
                  <div className="text-[#3d2c00] font-bold text-lg mb-1 text-justify">{chat.title}</div>
                  <div className="text-[#5c4a1a] text-sm mb-2 font-mono text-justify">
                    <b>Input:</b> {chat.input}
                  </div>
                  {expandedChatId === chat.id ? (
                    <div className="prose max-w-none mb-2 text-[#5c4a1a] font-mono text-justify">
                      <ReactMarkdown>{chat.story}</ReactMarkdown>
                    </div>
                  ) : (
                    <div className="text-[#a3a380] text-sm mb-2 font-mono text-justify">
                      {chat.excerpt}
                    </div>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-[#ffb300] text-[#3d2c00] bg-transparent hover:bg-[#ffb300] hover:text-[#3d2c00] font-bold rounded-lg shadow-sm transition-colors"
                    onClick={() => setExpandedChatId(expandedChatId === chat.id ? null : chat.id)}
                  >
                    {expandedChatId === chat.id ? "Hide full chat" : "See full chat"}
                  </Button>
                </div>
              ))}
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  );
} 