import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { title, content, category } = await req.json();
  const apiKey = process.env.DEEPSEEK_API;

  if (!apiKey) {
    console.error('Missing DeepSeek API key');
    return NextResponse.json({ error: 'Missing DeepSeek API key' }, { status: 500 });
  }

  const prompt = `Suggest a creative lore entry based on the following details.\nTitle: ${title || ''}\nCategory: ${category || ''}\nContent: ${content || ''}`;

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: 'You are a creative AI assistant for collaborative worldbuilding.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 256,
        temperature: 0.8,
        n: 1
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('DeepSeek API response error:', error);
      return NextResponse.json({ error }, { status: 500 });
    }

    const data = await response.json();
    const suggestions = data.choices?.map((c: any) => c.message.content) || [];
    return NextResponse.json({ suggestions });
  } catch (err: any) {
    console.error('DeepSeek API error:', err);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
} 