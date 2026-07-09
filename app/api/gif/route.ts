import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  
  if (!q) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
  }

  try {
    const searchUrl = `https://tenor.com/search/${encodeURIComponent(q).replace(/%20/g, '-')}-gifs`;
    const res = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });
    
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch from Tenor' }, { status: res.status });
    }

    const html = await res.text();
    const match = html.match(/https:\/\/media\.tenor\.com\/[^"]+\.gif/);
    
    if (match) {
      return NextResponse.json({ url: match[0] });
    } else {
      return NextResponse.json({ error: 'No GIF found' }, { status: 404 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
