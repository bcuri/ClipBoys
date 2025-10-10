export interface ClipProposal {
  title: string;
  start: number;
  end: number;
  description: string;
  score: number; // 0-100 virality score
  viralTags: string[]; // 2-3 tags, 4 for MVP
  isMVP: boolean; // true for highest scoring clip
}

export interface GenerateClipsResponse {
  clips: ClipProposal[];
}

export async function requestClips(videoId: string, transcript: string): Promise<GenerateClipsResponse> {
  const res = await fetch("/api/generate-clips", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ videoId, transcript }),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Clip generation failed: ${detail}`);
  }
  return res.json();
}

export async function fetchTranscript(videoId: string): Promise<{ fullText: string } & any> {
  const res = await fetch("/api/transcript", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ videoId }),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Transcript fetch failed: ${detail}`);
  }
  return res.json();
}


