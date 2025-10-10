import { NextRequest, NextResponse } from "next/server";

// Best-effort transcript fetcher for public YT captions.
// Tries a couple of public endpoints. If none work, returns 502.

async function fetchFromUnofficialAPI(videoId: string) {
  // Public community endpoint that often returns transcript JSON
  const urls = [
    `https://youtubetranscript.cc/api/v1?video_id=${encodeURIComponent(videoId)}&lang=en`,
    `https://youtubetranscript.cc/api/v1?video_id=${encodeURIComponent(videoId)}`,
  ];

  for (const url of urls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const res = await fetch(url, { 
        next: { revalidate: 3600 }, // Cache for 1 hour
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (!res.ok) continue;
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        // Normalize into { text, start, duration }
        return data.map((d: any) => ({
          text: String(d.text ?? ""),
          start: Number(d.offset ?? d.start ?? 0),
          duration: Number(d.duration ?? 0),
        }));
      }
    } catch (_) {
      // continue trying others
    }
  }
  return null;
}

async function fetchFromJinaReader(videoId: string) {
  // Fallback: Jina AI reader scrapes page text and often returns captions-like text
  const url = `https://r.jina.ai/http://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout for fallback
    
    const res = await fetch(url, { 
      next: { revalidate: 3600 }, // Cache for 1 hour
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    if (!res.ok) return null;
    const text = await res.text();
    const cleaned = text.trim();
    if (!cleaned) return null;
    return { fullText: cleaned, segments: [] };
  } catch (_) {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { videoId } = await req.json();
    if (!videoId || typeof videoId !== "string") {
      return NextResponse.json({ error: "Missing videoId" }, { status: 400 });
    }

    const segments = await fetchFromUnofficialAPI(videoId);
    if (segments) {
      const fullText = segments.map(s => s.text).join(" ").trim();
      return NextResponse.json({ segments, fullText });
    }

    const jina = await fetchFromJinaReader(videoId);
    if (jina) {
      return NextResponse.json(jina);
    }

    return NextResponse.json(
      { error: "Transcript unavailable for this video." },
      { status: 502 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch transcript." },
      { status: 500 }
    );
  }
}


