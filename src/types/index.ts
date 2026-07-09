export interface Member {
  profile_id: string;
  display_name: string;
}

export const MEMBERS: Member[] = [
  { profile_id: '다연', display_name: '다연' },
  { profile_id: '예본', display_name: '예본' }
];

// "AI 기사분석" 탭은 이 사용자에게만 노출된다.
export const AI_ARTICLE_ANALYSIS_ALLOWED_USER = '다연';

export interface StudyRecord {
  id: string;
  date: string; // YYYY-MM-DD
  member_name: string; // Note: stores profile_id (e.g., 'user1') instead of display_name
  raw_text: string;
  headlines_text: string;
  is_included: boolean;
  created_at: string;
  updated_at: string;
  // AI 산업스터디 워크플로우로 생성된 경우에만 채워지는 필드 (전부 선택적)
  source?: 'manual' | 'ai_workflow';
  article_title?: string | null;
  article_link?: string | null;
  press?: string | null;
  importance?: number | null;
  why_it_matters?: string | null;
  keywords?: string[] | null;
  companies?: string[] | null;
  technologies?: string[] | null;
  trend_connection?: TrendConnectionResult | null;
  my_opinion?: string | null;
  critical_thinking?: CriticalThinkingResult | null;
}

// --- AI 산업스터디 워크플로우 타입 ---

export interface ScoutedArticle {
  title: string;
  link: string;
  date: string;
  press: string;
  reason: string;
  importance: number;
}

export interface NewsAnalysis {
  summary: string[];
  why_it_matters: string;
  keywords: string[];
  companies: string[];
  technologies: string[];
}

export interface TrendConnectionResult {
  related_articles: string[];
  related_technologies: string[];
  related_companies: string[];
  industry_flow: string;
  further_study: string[];
}

export interface CriticalThinkingResult {
  counterpoints: string[];
  blindspots: string[];
  questions: string[];
}

// --- 독립형 "AI 기사분석" 탭 전용 타입 (/study 워크플로우와 무관) ---
export interface StandaloneArticleAnalysis {
  title: string;
  insufficient_content: boolean;
  note: string;
  summary: string[];
  why_it_matters: string;
  keywords: string[];
  companies: string[];
  technologies: string[];
}

export interface VacationPeriod {
  id: string;
  start_date: string;
  end_date: string;
  memo?: string;
  created_at: string;
}

export interface VacationDay {
  id: string;
  date: string; // YYYY-MM-DD
  reason?: string;
  created_at: string;
}

export interface AppSettings {
  key: string;
  value: any;
  updated_at: string;
}
