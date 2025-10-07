import { NextRequest, NextResponse } from "next/server";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

const systemPrompt = `You are a short-form video editor AI.
Given a YouTube transcript with timestamps, propose 5-10 high-impact short-form clips.
Return JSON with an array of clips. Each clip should have:
- title: punchy title (<= 60 chars)
- start: seconds (number)
- end: seconds (number)
- description: 1-2 lines why it's engaging
- hook: a strong opening hook text (<= 100 chars)
Prefer moments with:
- clear hooks, punchlines, surprises, answers, contrarian insights
- self-contained context (avoid starting mid-sentence if confusing)
Output strictly JSON: { "clips": Clip[] }`;

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


