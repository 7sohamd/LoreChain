import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { GoogleGenAI } from "@google/genai"

dotenv.config()

const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

app.get("/", (req, res) => {
  res.send("✅ Gemini API is live!")
})

app.post("/gemini", async (req, res) => {
  try {
    const { prompt } = req.body
    if (!prompt) return res.status(400).json({ error: "Prompt required" })

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // or "gemini-2.5-pro" if you have access
      contents: prompt,
    })

    res.json({ response: response.text })
  } catch (err) {
    console.error("Gemini error:", err)
    res.status(500).json({ error: err.message || "Gemini API failed", details: err })
  }
})

app.listen(port, () => {
  console.log(`🚀 Gemini API listening on port ${port}`)
})
