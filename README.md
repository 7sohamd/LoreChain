# Lorechain project

*Automatically synced with your [v0.dev](https://v0.dev) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/amrit-codes/v0-lorechain-project)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/MJ5dt0i0jTR)

## Overview

This repository will stay in sync with your deployed chats on [v0.dev](https://v0.dev).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.dev](https://v0.dev).

## Features

- **AI-Powered Lore Generation**: Generate creative lore suggestions using AI
- **Text-to-Speech**: Listen to AI-generated suggestions with PlayHT integration
- **Web3 Integration**: Connect with cryptocurrency wallets
- **Modern UI**: Built with Next.js, Tailwind CSS, and shadcn/ui components

## Text-to-Speech Setup

This project includes Text-to-Speech functionality using PlayHT. To enable TTS:

1. Sign up for a PlayHT account at [https://play.ht/studio/api-access](https://play.ht/studio/api-access)
2. Get your User ID and API Key from the PlayHT dashboard
3. Create a `.env.local` file in the root directory with your credentials:

```env
NEXT_PUBLIC_PLAYHT_USER_ID=your_user_id_here
NEXT_PUBLIC_PLAYHT_API_KEY=your_api_key_here
```

4. Restart your development server
5. Click the "Speak" button on any AI suggestion to hear it read aloud

## Firebase Setup

To enable Google sign-in and Firestore:

1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Google authentication in the Authentication > Sign-in method tab.
3. Create a Firestore database in production or test mode.
4. Get your Firebase config from Project Settings > General > Your apps.
5. Add the following to your `.env.local` file:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

6. Restart your development server after adding the environment variables.

## Deployment

Your project is live at:

**[https://vercel.com/amrit-codes/v0-lorechain-project](https://vercel.com/amrit-codes/v0-lorechain-project)**

## Build your app

Continue building your app on:

**[https://v0.dev/chat/projects/MJ5dt0i0jTR](https://v0.dev/chat/projects/MJ5dt0i0jTR)**

## How It Works

1. Create and modify your project using [v0.dev](https://v0.dev)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository