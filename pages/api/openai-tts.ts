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

  const { input, instructions } = req.body;
  if (!input || typeof input !== 'string') {
    res.status(400).json({ error: 'Missing or invalid input' });
    return;
  }

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify({
        model: 'tts-1-hd',
        voice: 'alloy',
        input,
        instructions: instructions || '',
        response_format: 'mp3',
      }),
    });

    if (!openaiRes.ok) {
      const errorText = await openaiRes.text();
      res.status(openaiRes.status).json({ error: errorText });
      return;
    }

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-store');
    const reader = openaiRes.body?.getReader();
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
    res.status(500).json({ error: 'OpenAI TTS proxy error', details: (error as Error).message });
  }
} 