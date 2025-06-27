# 🌌 LoreChain – Write the Next Universe. Together.

*LoreChain* is a collaborative storytelling web application that blends AI assistance, blockchain-authenticated authorship, and a credit-based monetization system. Users can co-create, explore, and narrate stories that form a growing, interconnected universe.

---

## 🚀 Live Demo

👉 [Visit LoreChain Website](https://lore-chain.vercel.app)

---

## 🧩 Key Features

- ✍️ *AI-Assisted Story Writing* using Google Gemini API  
- 🔗 *Blockchain Authorship* via Ethereum wallet integration (Ethers.js + Wagmi)  
- ✅ *Community Voting* to decide canonical stories  
- 💰 *Credit & Referral System* for monetization and feature unlocks  
- 🎙️ *Text-to-Speech Narration* via ElevenLabs / PlayHT  
- 🎧 *Podcast Generator* with AI-powered dual-host simulation  
- 🎥 *YouTube-to-Story Converter* using transcript summarization  
- 📚 *Lore Archive* for browsing, searching, and expanding community stories  
- 👤 *User Dashboard* to manage profile, submissions, and credits

---

## 🛠️ Tech Stack

| Layer         | Tech Used                                  |
|---------------|---------------------------------------------|
| *Frontend*  | Next.js 15, React 18, TypeScript, Tailwind CSS |
| *Backend*   | Firebase Firestore, Firebase Auth           |
| *AI Services*| Google Gemini AI, ElevenLabs, PlayHT        |
| *Blockchain*| Ethers.js, Wagmi, Viem                       |
| *Media Tools*| ImgBB API (Image Uploads), YouTube Transcript API |
| *UI Libraries*| Radix UI, Lucide Icons, React Markdown, Embla Carousel |

---

## 📄 Pages Overview

| Page               | Route          | Description                                         |
|--------------------|----------------|-----------------------------------------------------|
| Homepage           | /            | Introduction, Canon highlights, CTAs                |
| Write              | /write       | Story creation with AI and image upload             |
| Lore Archive       | /lore        | Browse, search, and vote on community stories       |
| Story Maker        | /story-maker | AI text + voice-based story generator               |
| Podcast Generator  | /podcast     | AI-generated podcasts with dual-voice narration     |
| YouTube to Story   | /youtube-story| Summarize YouTube videos into story format          |
| My Lore            | /me          | User profile, submissions, vote stats               |
| Monetization       | /monetization| Credits, subscriptions, referrals                   |

---

## 📦 Folder Structure (Main)

app/
├── write/ → Story writing interface
├── lore/ → Lore Archive
├── story-maker/ → AI Story + Voice
├── podcast/ → Podcast Generator
├── youtube-story/ → YouTube to Story
├── me/ → User Dashboard
├── monetization/ → Credit system
components/ → UI components
lib/ → Utility functions (AI, Firebase, Wallet)
public/ → Static assets

yaml
Copy
Edit

---

## 📌 Setup Instructions

1. *Clone the Repository*

```bash
git clone https://github.com/yourusername/lorechain.git
cd lorechain
Install Dependencies

bash
Copy
Edit
npm install
Setup .env.local

Create a .env.local file and configure:

env
Copy
Edit
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_GEMINI_API_KEY=your_google_ai_key
NEXT_PUBLIC_ELEVENLABS_API_KEY=your_elevenlabs_key
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_id
Run Development Server

bash
Copy
Edit
npm run dev
🔐 Authentication & Web3
Uses Firebase Auth (Google Sign-In)

Ethereum wallet connection via Wagmi + Viem

Wallet address linked to story authorship in Firestore

💡 How Monetization Works
Earn 10 credits per referral

Buy credits via tiered subscriptions (Starter, Pro, Unlimited)

Credits unlock AI narration, podcast generation, and premium tools

🔮 Use Cases
✍️ Creative writers and hobbyists

📚 Educational storytelling (learn via stories)

🎙️ Podcasters and content creators

🧠 AI-based learning environments

📖 Collaborative novel or worldbuilding communities

📈 Future Roadmap
 Mobile App (React Native)

 NFT minting for canon stories

 Story commenting & discussions

 AI-enhanced educational stories by subject/topic

 Creator leaderboards & story chains

📸 Screenshots
Add here demo GIFs/screenshots or link to demo video

🤝 Contribution
bash
Copy
Edit
# Fork this repo
# Create your feature branch (git checkout -b feature/AmazingFeature)
# Commit your changes (git commit -m 'Add some AmazingFeature')
# Push to the branch (git push origin feature/AmazingFeature)
# Open a Pull Request
📜 License
This project is licensed under the MIT License.

🔗 Useful Links
ElevenLabs API Docs

Firebase Documentation

Wagmi + Viem

Google Gemini AI

LoreChain GitHub

✉️ Contact
Created by [Your Name]
📧 your.email@example.com
💼 LinkedIn
