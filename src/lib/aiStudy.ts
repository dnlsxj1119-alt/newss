import type { ScoutedArticle, NewsAnalysis, TrendConnectionResult, CriticalThinkingResult } from '../types';
import { postJson } from './apiClient';

export interface HistoryEntry {
  article_title: string;
  date: string;
  keywords?: string[] | null;
  companies?: string[] | null;
  technologies?: string[] | null;
}

export const scoutNews = (keywords: string) =>
  postJson<{ articles: ScoutedArticle[]; topics: string }>('/api/news-scout', { keywords });

export const analyzeArticle = (article: Pick<ScoutedArticle, 'title' | 'link' | 'press' | 'date'>) =>
  postJson<NewsAnalysis>('/api/news-analyzer', article);

export const connectTrends = (
  article: Pick<ScoutedArticle, 'title'>,
  analysis: NewsAnalysis,
  history: HistoryEntry[]
) => postJson<TrendConnectionResult>('/api/trend-connection', { article, analysis, history });

export const criticalThink = (
  article: Pick<ScoutedArticle, 'title'>,
  analysis: NewsAnalysis,
  opinion: string
) => postJson<CriticalThinkingResult>('/api/critical-thinking', { article, analysis, opinion });
