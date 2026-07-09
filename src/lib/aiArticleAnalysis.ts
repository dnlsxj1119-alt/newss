import type { StandaloneArticleAnalysis, CriticalThinkingResult } from '../types';
import { postJson } from './apiClient';

// 독립형 "AI 기사분석" 탭 전용 API 클라이언트. /study(aiStudy.ts)와는 완전히 분리되어 있다.

export type ArticleAnalyzerInput =
  | { mode: 'url'; url: string }
  | { mode: 'text'; content: string };

export const analyzeStandaloneArticle = (input: ArticleAnalyzerInput) =>
  postJson<StandaloneArticleAnalysis>('/api/article-analyzer', input);

// critical-thinking API는 /study와 동일한 엔드포인트를 그대로 재사용한다 (DB 연결 없이 순수 텍스트 추론이라 안전하게 공유 가능).
export const criticalThinkStandalone = (title: string, analysis: StandaloneArticleAnalysis, opinion: string) =>
  postJson<CriticalThinkingResult>('/api/critical-thinking', {
    article: { title },
    analysis,
    opinion,
  });
