import { NextRequest, NextResponse } from "next/server";
import { analyzeViralTags, calculateViralityScore } from "@/lib/viral-tags";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

const systemPrompt = `You are a viral content expert specializing in TikTok/Instagram Reels/YouTube Shorts.
Analyze YouTube transcripts and identify the most viral-worthy moments for short-form content.

VIRAL MOMENT CRITERIA:
1. STRONG HOOK (0-3 seconds): Shocking reveals, controversial takes, mystery setups, before/after moments
2. EMOTIONAL IMPACT: Hilarious, heartwarming, shocking, inspiring, or relatable content
3. TREND ALIGNMENT: POV content, tutorials, reactions, challenges, storytimes
4. CLEAR VALUE: Standalone content that makes sense without context
5. QUICK PACING: No filler words, fast progression, immediate payoff

TASK: Find 6-8 viral moments from the transcript. Each clip should be 15-60 seconds long.

Return JSON only: { "clips": [{
  "title": string,           // Catchy, clickbait-style title
  "start": number,           // Start time in seconds
  "end": number,             // End time in seconds  
  "description": string,     // What happens in this clip (1-2 sentences)
  "hook": string            // Opening line that hooks viewers (first 3 seconds)
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

    const userPrompt = `VIDEO ID: ${videoId}\nTRANSCRIPT:\n${transcript}\n\nFind the most viral moments. Return only JSON.`;

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
        temperature: 0.3, // Lower temperature for more consistent results
        max_tokens: 2000, // Limit tokens for faster response
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

    // Enhance clips with viral tags and realistic scoring
    const enhancedClips = parsed.clips.map((clip: any) => {
      // Analyze content for viral tags
      const viralTags = analyzeViralTags(
        clip.description || '',
        clip.title || '',
        clip.hook || ''
      );

      // Calculate realistic virality score based on tags
      const baseScore = calculateViralityScore(viralTags);
      
      // Add some variation for realism (±3 points)
      const variation = (Math.random() - 0.5) * 6;
      const finalScore = Math.max(0, Math.min(100, Math.round(baseScore + variation)));

      return {
        ...clip,
        score: finalScore,
        scoreReasons: viralTags.slice(0, 3).join(', '), // Top 3 tags as reasons
        viralTags: viralTags // Store all tags for display
      };
    });

    return NextResponse.json({ clips: enhancedClips });
  } catch (err) {
    return NextResponse.json({ error: "Failed to generate clips" }, { status: 500 });
  }
}


