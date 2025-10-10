import { NextRequest, NextResponse } from "next/server";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

const systemPrompt = `You are a viral content expert for TikTok/Instagram Reels/YouTube Shorts.

VIRAL TAGS (assign 2-3 unique tags per clip, 4 for MVP):
- Shocking Reveal, Controversial Take, Mystery Setup, Before/After
- Hilarious, Heartwarming, Shocking, Inspiring, Relatable
- POV, Tutorial, Reaction, Challenge, Storytime, Transformation
- Life Hack, Money Tips, Tech Review, Career Advice
- High Energy, Visual Appeal, Quick Tips, Expert Breakdown
- Plot Twist, Secret Exposed, Mistake Caught, Expert Breakdown
- Day in My Life, Behind the Scenes, Comparison, Ranking
- Q&A, Step-by-Step, Myth Busting, Timeline

IMPORTANT RULES:
1. Each clip must have UNIQUE tags - no duplicates across clips
2. Tags must be RELEVANT to the specific clip content
3. MVP clip gets 4 tags, others get 2-3 tags
4. Choose tags that best describe what makes THIS specific clip viral
5. Ensure variety across all clips

TASK: Find 6-8 viral moments (15-60 seconds each).

Return JSON: { "clips": [{
  "title": string,
  "start": number,
  "end": number,
  "description": string,
  "score": number,        // 0-100 realistic score
  "viralTags": string[],  // 2-3 unique tags, 4 for MVP
  "isMVP": boolean        // true for highest scoring clip
}] }`;

export async function POST(req: NextRequest) {
  try {
    const { videoId, transcript } = await req.json();
    if (!videoId || !transcript) {
      return NextResponse.json({ error: "Missing videoId or transcript" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OPENAI_API_KEY not set" }, { status: 500 });
    }

    const userPrompt = `VIDEO ID: ${videoId}\nTRANSCRIPT:\n${transcript}\n\nFind viral moments. Return only JSON.`;

    const res = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.4,
        max_tokens: 2500,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: "LLM error", detail: text }, { status: 502 });
    }

    const data = await res.json();
    const raw = data?.choices?.[0]?.message?.content || "";
    // Attempt to parse JSON from model output
    let parsed: any = null;
    try {
      parsed = JSON.parse(raw);
    } catch (_) {
      // Try to extract JSON substring
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      }
    }

    if (!parsed || !Array.isArray(parsed.clips)) {
      return NextResponse.json({ error: "Invalid LLM response" }, { status: 502 });
    }

    // Return ChatGPT's response directly - it already includes score, viralTags, isMVP
    return NextResponse.json({ clips: parsed.clips });
  } catch (err) {
    return NextResponse.json({ error: "Failed to generate clips" }, { status: 500 });
  }
}


