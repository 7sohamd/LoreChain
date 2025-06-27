export const config = {
  api: {
    bodyParser: false,
  },
};

const HUGGINGFACE_API_KEY = process.env.HF_API_KEY || 'hf_your_huggingface_api_key';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image');
    if (!file || typeof file === 'string') {
      return new Response(JSON.stringify({ error: 'No image uploaded.' }), { status: 400 });
    }
    const arrayBuffer = await file.arrayBuffer();
    const response = await fetch('https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-base', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/octet-stream',
      },
      body: arrayBuffer,
    });
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Hugging Face API non-JSON response:', text);
      return new Response(JSON.stringify({ error: 'Hugging Face model is loading or unavailable. Please try again in a minute.' }), { status: 503 });
    }
    const data = await response.json();
    if (!response.ok) {
      console.error('Hugging Face API error:', data);
      return new Response(JSON.stringify({ error: data.error || 'Hugging Face API error.' }), { status: 500 });
    }
    if (Array.isArray(data) && data[0]?.generated_text) {
      return new Response(JSON.stringify({ caption: data[0].generated_text }), { status: 200 });
    } else if (data.generated_text) {
      return new Response(JSON.stringify({ caption: data.generated_text }), { status: 200 });
    } else {
      return new Response(JSON.stringify({ error: 'Could not extract text from image.' }), { status: 400 });
    }
  } catch (err) {
    console.error('Server error:', err);
    return new Response(JSON.stringify({ error: 'Image-to-text failed.' }), { status: 500 });
  }
} 