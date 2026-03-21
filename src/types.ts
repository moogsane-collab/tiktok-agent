export interface Video {
  id: string;
  hook: string;
  account: string;
  views: number;
  likes: number;
  shares: number;
  comments: number;
  engagement: string;
  duration: number;
  thumbnail: string;
  visualDescription: string;
  hookAnalysis?: HookAnalysis;
  comments_data: Comment[];
  brief?: CreativeBrief;
}

export interface Comment {
  text: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  isQuestion?: boolean;
}

export interface HookAnalysis {
  score: number;
  type: string;
  explanation: string;
  keyElement: string;
}

export interface CreativeBrief {
  concept: string;
  hook: string;
  script: string;
  visuals: string;
  audio: string;
  cta: string;
  hashtags: string[];
  seoKeywords: string[];
  salesFunnelStage: 'Awareness' | 'Consideration' | 'Conversion';
}

export interface BrandBible {
  name: string;
  tagline: string;
  mission: string;
  avatar: string;
  tone: string[];
  pillars: string[];
  hashtags: string[];
}

export interface ContentIdea {
  title: string;
  hook: string;
  reason: string;
}

export interface OSINTResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
  views?: string;
  engagement?: string;
  isViral?: boolean;
}
