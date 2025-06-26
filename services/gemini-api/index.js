import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

app.post("/gemini", async (req, res) => {
  try {
    const { prompt } = req.body

    if (!prompt) return res.status(400).json({ error: "Prompt required" })

    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    const result = await model.generateContent(prompt)

    const response = result.response.text()

    res.json({ response })
  } catch (err) {
    console.error("Gemini error:", err)
    res.status(500).json({ error: "Gemini API failed" })
  }
})
