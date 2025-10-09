import { NextRequest, NextResponse } from "next/server";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

const systemPrompt = `You are a short-form video editor AI specialized in TikTok/Reels virality.
Given a YouTube transcript with timestamps, propose 5-10 high-impact short-form clips.
For EACH clip, also compute a virality score between 0 and 100 and a brief rationale.

Scoring rubric (weight ~ sum to 100):
- Hook strength (0-30): clear curiosity gap, shock, controversy, payoff within 3s.
- Emotional charge (0-20): surprise, humor, anger, awe.
- Clarity/standalone value (0-15): can be understood without full context.
- Pacing (0-15): few filler words, quick progression, no dead air.
- Visual/aural cues (0-10): references to visuals/sfx, voice energy, emphasis.
- Shareability (0-10): quotable lines, practical takeaway, novelty.

Return JSON only with: { "clips": [{
  "title": string,
  "start": number,
  "end": number,
  "description": string,
  "hook": string,
  "score": number,            // 0-100 integer
  "scoreReasons": string      // 1 sentence rationale
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

    const userPrompt = `VIDEO ID: ${videoId}\nTRANSCRIPT:\n${transcript}\n\nReturn only JSON.`;

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

    return NextResponse.json({ clips: parsed.clips });
  } catch (err) {
    return NextResponse.json({ error: "Failed to generate clips" }, { status: 500 });
  }
}


