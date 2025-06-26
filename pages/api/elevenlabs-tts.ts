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

  const { text, voiceId } = req.body;
  if (!text || typeof text !== 'string') {
    res.status(400).json({ error: 'Missing or invalid text' });
    return;
  }

  try {
    const defaultVoice = 'JBFqnCBsd6RMkjVDRZzb'; // Rachel
    const selectedVoice = typeof voiceId === 'string' && voiceId.length > 0 ? voiceId : defaultVoice;
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: 'Missing ElevenLabs API key' });
      return;
    }
    const elevenRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoice}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        output_format: 'mp3_44100_128',
      }),
    });
    if (!elevenRes.ok) {
      const errorText = await elevenRes.text();
      res.status(elevenRes.status).json({ error: errorText });
      return;
    }
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-store');
    const reader = elevenRes.body?.getReader();
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
    res.status(500).json({ error: 'ElevenLabs TTS proxy error', details: (error as Error).message });
  }
} 