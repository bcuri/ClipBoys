export interface ClipProposal {
  title: string;
  start: number;
  end: number;
  description: string;
  hook: string;
  score?: number; // 0-100 virality score
  scoreReasons?: string; // brief rationale
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
  
  try {
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("JSON parsing error in requestClips:", error);
    throw new Error(`Failed to parse response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
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
  
  try {
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("JSON parsing error in fetchTranscript:", error);
    throw new Error(`Failed to parse transcript response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}


