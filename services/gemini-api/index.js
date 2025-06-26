import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { GoogleGenerativeAI } from "@google/generative-ai"

dotenv.config()

const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

app.get("/", (req, res) => {
  res.send("✅ Gemini API is live!")
})

app.post("/gemini", async (req, res) => {
  try {
    const { prompt } = req.body

    if (!prompt) return res.status(400).json({ error: "Prompt required" })

    const model = genAI.getGenerativeModel({ model: "models/gemini-pro" })

    const result = await model.generateContent(prompt)

    const response = result.response.text()

    res.json({ response })
  } catch (err) {
    console.error("Gemini error:", err)
    res.status(500).json({ error: err.message || "Gemini API failed", details: err })
  }
})

app.get("/gemini-models", async (req, res) => {
  try {
    const models = await genAI.listModels();
    res.json(models);
  } catch (err) {
    res.status(500).json({ error: err.message, details: err });
  }
});

app.listen(port, () => {
  console.log(`🚀 Gemini API listening on port ${port}`)
})
