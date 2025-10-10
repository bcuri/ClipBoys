import { NextRequest, NextResponse } from "next/server";
import { analyzeViralTags, calculateViralityScore, getQuickViralTags } from "@/lib/viral-tags";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

const systemPrompt = `Find 6-8 viral moments from YouTube transcripts for TikTok/Reels.

CRITERIA: Strong hooks, emotional impact, trending formats, clear value, quick pacing.

Return JSON: { "clips": [{"title": string, "start": number, "end": number, "description": string, "hook": string}] }`;

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

    // Truncate transcript to first 3000 characters for faster processing
    const truncatedTranscript = transcript.length > 3000 ? transcript.substring(0, 3000) + "..." : transcript;
    const userPrompt = `VIDEO: ${videoId}\nTRANSCRIPT: ${truncatedTranscript}\n\nFind viral moments. JSON only.`;

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
        temperature: 0.2, // Lower temperature for faster, more consistent results
        max_tokens: 1500, // Reduced token limit for faster response
        stream: false, // Disable streaming for now
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: "LLM error", detail: text }, { status: 502 });
    }

    const data = await res.json();
    const raw = data?.choices?.[0]?.message?.content || "";
    
    // Log the raw response for debugging
    console.log("Raw LLM response:", raw);
    
    // Attempt to parse JSON from model output
    let parsed: any = null;
    try {
      parsed = JSON.parse(raw);
    } catch (parseError) {
      console.log("JSON parse error:", parseError);
      // Try to extract JSON substring
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          parsed = JSON.parse(match[0]);
        } catch (extractError) {
          console.log("JSON extract error:", extractError);
          return NextResponse.json({ 
            error: "Invalid LLM response format", 
            detail: `Failed to parse JSON: ${raw.substring(0, 200)}...` 
          }, { status: 502 });
        }
      } else {
        return NextResponse.json({ 
          error: "No JSON found in LLM response", 
          detail: `Raw response: ${raw.substring(0, 200)}...` 
        }, { status: 502 });
      }
    }

    if (!parsed || !Array.isArray(parsed.clips)) {
      return NextResponse.json({ 
        error: "Invalid LLM response structure", 
        detail: `Expected clips array, got: ${JSON.stringify(parsed)}` 
      }, { status: 502 });
    }

    // Enhance clips with viral tags and realistic scoring (optimized)
    const enhancedClips = parsed.clips.map((clip: any) => {
      // Quick viral tags analysis with early exit
      const content = `${clip.title || ''} ${clip.description || ''} ${clip.hook || ''}`.toLowerCase();
      const viralTags = getQuickViralTags(content);
      
      // Calculate realistic virality score based on tags
      const baseScore = calculateViralityScore(viralTags);
      
      // Add some variation for realism (±2 points)
      const variation = (Math.random() - 0.5) * 4;
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


