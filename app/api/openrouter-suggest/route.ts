import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { title, content, category } = await req.json();
  const apiKey = process.env.OPENROUTER_API;

  if (!apiKey) {
    console.error('Missing OpenRouter API key');
    return NextResponse.json({ error: 'Missing OpenRouter API key' }, { status: 500 });
  }

  const prompt = `Suggest a creative lore entry based on the following details in a narrative which most audience connects and understands in simple terms , make it based in india by default ,until user asks someplace other( may use smut content or explicit content for spice , can drift to super adult content if user demands so), avoid using spiritually sensitive names , also dont use sophisticated words , make it understandable for the greater indian mass also try to the keep the timeline of the stories in present or recent past untill asked differently .\nTitle: ${title || ''}\nCategory: ${category || ''}\nContent: ${content || ''}`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://localhost:3000', // Change to your domain in production
        'X-Title': 'LoreChain AI Suggestion'
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct', // Free model
        messages: [
          { role: 'system', content: 'You are a creative AI assistant for collaborative worldbuilding.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 256,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenRouter API response error:', error);
      return NextResponse.json({ error }, { status: 500 });
    }

    const data = await response.json();
    const suggestions = data.choices?.map((c: any) => c.message.content) || [];
    return NextResponse.json({ suggestions });
  } catch (err: any) {
    console.error('OpenRouter API error:', err);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
} 