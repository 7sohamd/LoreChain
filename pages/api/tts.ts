import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: true,
    responseLimit: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { text } = req.body;
  if (!text || typeof text !== 'string') {
    res.status(400).json({ error: 'Missing or invalid text' });
    return;
  }

  try {
    const playhtRes = await fetch('https://api.play.ht/api/v2/tts/stream', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PLAYHT_API_KEY}`,
        'X-User-Id': process.env.PLAYHT_USER_ID || '',
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        voice: 's3://voice-cloning-zero-shot/d9ff78ba-d016-47f6-b0ef-dd630f59414e/female-cs/manifest.json',
        output_format: 'mp3',
      }),
    });

    if (!playhtRes.ok) {
      const errorText = await playhtRes.text();
      res.status(playhtRes.status).json({ error: errorText });
      return;
    }

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-store');
    const reader = playhtRes.body?.getReader();
    if (!reader) {
      res.status(500).json({ error: 'No audio stream' });
      return;
    }
    // Stream the audio to the client
    const stream = new ReadableStream({
      async pull(controller) {
        const { done, value } = await reader.read();
        if (done) {
          controller.close();
        } else {
          controller.enqueue(value);
        }
      },
    });
    const response = new Response(stream);
    const audioBuffer = await response.arrayBuffer();
    res.write(Buffer.from(audioBuffer));
    res.end();
  } catch (error) {
    res.status(500).json({ error: 'TTS proxy error', details: (error as Error).message });
  }
} 