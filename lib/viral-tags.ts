// Comprehensive viral tags system for TikTok/Instagram/YouTube Shorts
export interface ViralTag {
  name: string;
  description: string;
  weight: number; // 1-10, how much this tag contributes to virality
  category: 'hook' | 'emotion' | 'trend' | 'format' | 'content' | 'technical';
}

export const VIRAL_TAGS: ViralTag[] = [
  // HOOK TAGS (Strong opening moments)
  { name: "Shocking Reveal", description: "Unexpected information that surprises viewers", weight: 9, category: 'hook' },
  { name: "Controversial Take", description: "Bold opinion that sparks debate", weight: 8, category: 'hook' },
  { name: "Mystery Setup", description: "Creates curiosity gap that needs resolution", weight: 8, category: 'hook' },
  { name: "Before/After", description: "Dramatic transformation or comparison", weight: 7, category: 'hook' },
  { name: "Secret Exposed", description: "Hidden information being revealed", weight: 8, category: 'hook' },
  { name: "Mistake Caught", description: "Someone making an error or being wrong", weight: 6, category: 'hook' },
  { name: "Plot Twist", description: "Unexpected turn of events", weight: 9, category: 'hook' },
  { name: "Expert Breakdown", description: "Professional analysis of something", weight: 7, category: 'hook' },

  // EMOTION TAGS (High emotional impact)
  { name: "Hilarious", description: "Makes people laugh out loud", weight: 8, category: 'emotion' },
  { name: "Heartwarming", description: "Touching, emotional, feel-good content", weight: 7, category: 'emotion' },
  { name: "Shocking", description: "Surprising or unbelievable content", weight: 8, category: 'emotion' },
  { name: "Angry", description: "Content that makes people mad or frustrated", weight: 6, category: 'emotion' },
  { name: "Inspiring", description: "Motivational or uplifting content", weight: 7, category: 'emotion' },
  { name: "Relatable", description: "Content people can relate to personally", weight: 6, category: 'emotion' },
  { name: "Nostalgic", description: "Reminds people of the past", weight: 5, category: 'emotion' },
  { name: "Awe-Inspiring", description: "Amazing, impressive, or mind-blowing", weight: 8, category: 'emotion' },

  // TREND TAGS (Current viral formats)
  { name: "POV", description: "Point of view content", weight: 6, category: 'trend' },
  { name: "Day in My Life", description: "Daily routine content", weight: 5, category: 'trend' },
  { name: "Tutorial", description: "How-to or educational content", weight: 6, category: 'trend' },
  { name: "Reaction", description: "Reacting to something", weight: 5, category: 'trend' },
  { name: "Challenge", description: "Participating in a trend or challenge", weight: 6, category: 'trend' },
  { name: "Storytime", description: "Personal story being told", weight: 5, category: 'trend' },
  { name: "Transformation", description: "Makeover or change content", weight: 7, category: 'trend' },
  { name: "Behind the Scenes", description: "Exclusive or insider content", weight: 6, category: 'trend' },

  // FORMAT TAGS (Video structure)
  { name: "Quick Tips", description: "Fast, actionable advice", weight: 6, category: 'format' },
  { name: "List Format", description: "Numbered or bulleted content", weight: 5, category: 'format' },
  { name: "Q&A", description: "Question and answer format", weight: 5, category: 'format' },
  { name: "Comparison", description: "Comparing two or more things", weight: 6, category: 'format' },
  { name: "Timeline", description: "Chronological progression", weight: 5, category: 'format' },
  { name: "Step-by-Step", description: "Process broken down into steps", weight: 6, category: 'format' },
  { name: "Myth Busting", description: "Debunking common beliefs", weight: 7, category: 'format' },
  { name: "Ranking", description: "Ordering items by preference/quality", weight: 6, category: 'format' },

  // CONTENT TAGS (Subject matter)
  { name: "Life Hack", description: "Practical life improvement tip", weight: 7, category: 'content' },
  { name: "Money Tips", description: "Financial advice or insights", weight: 8, category: 'content' },
  { name: "Health & Fitness", description: "Wellness, exercise, or health content", weight: 6, category: 'content' },
  { name: "Tech Review", description: "Technology product or service review", weight: 6, category: 'content' },
  { name: "Food Content", description: "Cooking, eating, or food-related", weight: 5, category: 'content' },
  { name: "Travel", description: "Travel experiences or tips", weight: 5, category: 'content' },
  { name: "Career Advice", description: "Professional development content", weight: 7, category: 'content' },
  { name: "Relationship Tips", description: "Dating, friendship, or family advice", weight: 6, category: 'content' },
  { name: "Productivity", description: "Getting things done efficiently", weight: 6, category: 'content' },
  { name: "Creativity", description: "Art, design, or creative process", weight: 5, category: 'content' },

  // TECHNICAL TAGS (Production quality)
  { name: "High Energy", description: "Fast-paced, energetic delivery", weight: 6, category: 'technical' },
  { name: "Visual Appeal", description: "Strong visual elements or graphics", weight: 5, category: 'technical' },
  { name: "Clear Audio", description: "Good sound quality and clarity", weight: 4, category: 'technical' },
  { name: "Smooth Editing", description: "Well-edited, polished content", weight: 4, category: 'technical' },
  { name: "Good Lighting", description: "Well-lit, professional appearance", weight: 3, category: 'technical' },
  { name: "Captions", description: "Text overlays or subtitles", weight: 4, category: 'technical' },
  { name: "Music/SFX", description: "Background music or sound effects", weight: 3, category: 'technical' },
  { name: "Multiple Angles", description: "Different camera angles or shots", weight: 4, category: 'technical' }
];

// Function to analyze content and assign relevant tags (optimized)
export function analyzeViralTags(content: string, title: string, description: string): string[] {
  const text = `${title} ${description} ${content}`.toLowerCase();
  const assignedTags: string[] = [];

  // Pre-compile regex patterns for better performance
  const compiledPatterns = new Map<string, (string | RegExp)[]>();
  
  // Analyze for specific patterns and assign tags (optimized)
  for (const tag of VIRAL_TAGS) {
    if (shouldAssignTagOptimized(tag, text, compiledPatterns)) {
      assignedTags.push(tag.name);
      // Early exit if we have enough high-weight tags
      if (assignedTags.length >= 8) break;
    }
  }

  // Sort by weight and limit to top 5 most relevant tags
  return assignedTags
    .map(tagName => VIRAL_TAGS.find(t => t.name === tagName))
    .filter(Boolean)
    .sort((a, b) => (b?.weight || 0) - (a?.weight || 0))
    .slice(0, 5)
    .map(tag => tag!.name);
}

function shouldAssignTagOptimized(tag: ViralTag, text: string, compiledPatterns: Map<string, (string | RegExp)[]>): boolean {
  let patterns = compiledPatterns.get(tag.name);
  if (!patterns) {
    patterns = getTagPatterns(tag.name);
    compiledPatterns.set(tag.name, patterns);
  }
  
  return patterns.some(pattern => {
    if (typeof pattern === 'string') {
      return text.includes(pattern);
    } else {
      return pattern.test(text);
    }
  });
}

function shouldAssignTag(tag: ViralTag, text: string): boolean {
  const patterns = getTagPatterns(tag.name);
  return patterns.some(pattern => {
    if (typeof pattern === 'string') {
      return text.includes(pattern);
    } else {
      return pattern.test(text);
    }
  });
}

function getTagPatterns(tagName: string): (string | RegExp)[] {
  const patterns: { [key: string]: (string | RegExp)[] } = {
    "Shocking Reveal": ["shocking", "unexpected", "surprising", "reveal", "exposed", "secret"],
    "Controversial Take": ["controversial", "unpopular opinion", "hot take", "debate", "argue"],
    "Mystery Setup": ["mystery", "secret", "hidden", "unknown", "reveal", "discover"],
    "Before/After": ["before", "after", "transformation", "change", "difference"],
    "Secret Exposed": ["secret", "exposed", "revealed", "hidden", "confidential"],
    "Mistake Caught": ["mistake", "error", "wrong", "caught", "fail"],
    "Plot Twist": ["twist", "unexpected", "surprise", "plot", "turn"],
    "Expert Breakdown": ["expert", "analysis", "breakdown", "explain", "professional"],
    "Hilarious": ["funny", "hilarious", "laugh", "comedy", "joke", "humor"],
    "Heartwarming": ["heartwarming", "touching", "emotional", "sweet", "cute"],
    "Shocking": ["shocking", "unbelievable", "amazing", "incredible", "wow"],
    "Angry": ["angry", "mad", "frustrated", "annoyed", "upset"],
    "Inspiring": ["inspiring", "motivational", "uplifting", "encouraging", "empowering"],
    "Relatable": ["relatable", "relate", "same", "me too", "exactly"],
    "Nostalgic": ["nostalgic", "remember", "throwback", "old", "childhood"],
    "Awe-Inspiring": ["amazing", "incredible", "mind-blowing", "awe", "impressive"],
    "POV": ["pov", "point of view", "from my perspective"],
    "Day in My Life": ["day in my life", "daily routine", "my day", "routine"],
    "Tutorial": ["tutorial", "how to", "guide", "step by step", "learn"],
    "Reaction": ["reaction", "reacting", "my reaction", "first time"],
    "Challenge": ["challenge", "trying", "attempt", "dare"],
    "Storytime": ["storytime", "story", "happened to me", "experience"],
    "Transformation": ["transformation", "makeover", "change", "glow up"],
    "Behind the Scenes": ["behind the scenes", "bts", "making of", "process"],
    "Quick Tips": ["tips", "tricks", "hacks", "quick", "fast"],
    "List Format": ["list", "top", "best", "worst", "ranking"],
    "Q&A": ["q&a", "question", "answer", "ask me", "faq"],
    "Comparison": ["vs", "versus", "compare", "comparison", "difference"],
    "Timeline": ["timeline", "chronological", "sequence", "order"],
    "Step-by-Step": ["step", "steps", "process", "procedure", "method"],
    "Myth Busting": ["myth", "busting", "debunk", "false", "wrong"],
    "Ranking": ["ranking", "rank", "best", "worst", "top", "bottom"],
    "Life Hack": ["life hack", "hack", "trick", "tip", "shortcut"],
    "Money Tips": ["money", "finance", "budget", "saving", "investing", "rich"],
    "Health & Fitness": ["health", "fitness", "exercise", "workout", "diet", "nutrition"],
    "Tech Review": ["tech", "review", "product", "gadget", "technology"],
    "Food Content": ["food", "cooking", "recipe", "eating", "meal", "taste"],
    "Travel": ["travel", "trip", "vacation", "destination", "explore"],
    "Career Advice": ["career", "job", "work", "professional", "business"],
    "Relationship Tips": ["relationship", "dating", "love", "partner", "marriage"],
    "Productivity": ["productivity", "productive", "efficient", "organize", "focus"],
    "Creativity": ["creative", "art", "design", "craft", "artistic", "imagination"],
    "High Energy": ["energy", "excited", "pumped", "hyped", "enthusiastic"],
    "Visual Appeal": ["visual", "graphics", "design", "aesthetic", "beautiful"],
    "Clear Audio": ["audio", "sound", "voice", "clear", "crisp"],
    "Smooth Editing": ["editing", "edited", "smooth", "polished", "professional"],
    "Good Lighting": ["lighting", "bright", "well-lit", "illuminated"],
    "Captions": ["captions", "subtitles", "text", "words", "overlay"],
    "Music/SFX": ["music", "sound", "audio", "background", "effects"],
    "Multiple Angles": ["angles", "shots", "camera", "perspective", "view"]
  };

  return patterns[tagName] || [];
}

// Quick viral tags function for performance
export function getQuickViralTags(content: string): string[] {
  const tags: string[] = [];
  
  // High-priority patterns that are quick to check
  const quickPatterns = [
    { tag: "Shocking Reveal", patterns: ["shocking", "unexpected", "reveal", "exposed"] },
    { tag: "Hilarious", patterns: ["funny", "hilarious", "laugh", "comedy"] },
    { tag: "Tutorial", patterns: ["how to", "tutorial", "guide", "step by step"] },
    { tag: "POV", patterns: ["pov", "point of view", "from my perspective"] },
    { tag: "Life Hack", patterns: ["life hack", "hack", "trick", "tip"] },
    { tag: "Money Tips", patterns: ["money", "finance", "budget", "saving"] },
    { tag: "Reaction", patterns: ["reaction", "reacting", "first time"] },
    { tag: "Storytime", patterns: ["storytime", "story", "happened to me"] },
    { tag: "Transformation", patterns: ["transformation", "makeover", "change"] },
    { tag: "Quick Tips", patterns: ["tips", "tricks", "hacks", "quick"] },
    { tag: "High Energy", patterns: ["energy", "excited", "pumped", "hyped"] },
    { tag: "Inspiring", patterns: ["inspiring", "motivational", "uplifting"] },
    { tag: "Relatable", patterns: ["relatable", "relate", "same", "me too"] },
    { tag: "Controversial Take", patterns: ["controversial", "unpopular opinion", "hot take"] },
    { tag: "Before/After", patterns: ["before", "after", "transformation", "change"] }
  ];

  for (const { tag, patterns } of quickPatterns) {
    if (patterns.some(pattern => content.includes(pattern))) {
      tags.push(tag);
      if (tags.length >= 5) break; // Early exit for performance
    }
  }

  return tags;
}

// Function to calculate virality score based on tags
export function calculateViralityScore(tags: string[]): number {
  let totalWeight = 0;
  let tagCount = 0;

  for (const tagName of tags) {
    const tag = VIRAL_TAGS.find(t => t.name === tagName);
    if (tag) {
      totalWeight += tag.weight;
      tagCount++;
    }
  }

  if (tagCount === 0) return 0;

  // Base score from tag weights (0-100)
  const baseScore = (totalWeight / tagCount) * 10;
  
  // Bonus for having multiple tags
  const bonus = Math.min(tagCount * 2, 20);
  
  // Add some randomness for realism (±5 points)
  const randomFactor = (Math.random() - 0.5) * 10;
  
  return Math.max(0, Math.min(100, Math.round(baseScore + bonus + randomFactor)));
}
