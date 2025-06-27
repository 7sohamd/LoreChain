"use client"

import { useState } from "react"

export default function YouTubeStoryPage() {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [story, setStory] = useState("")
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setStory("")
    setError("")

    try {
      const res = await fetch("/youtube-story/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })

      const data = await res.json()

      if (res.ok) {
        setStory(data.story)
      } else {
        setError(data.error || "Something went wrong.")
      }
    } catch {
      setError("Network error. Please try again.")
    }

    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">🎬 YouTube Story Mode</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="url"
          placeholder="Paste YouTube video link..."
          className="border p-2 rounded"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Summarizing..." : "Generate Story"}
        </button>
      </form>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {story && (
        <div className="mt-6 bg-gray-50 p-4 rounded shadow whitespace-pre-line">
          {story}
        </div>
      )}
    </div>
  )
}
