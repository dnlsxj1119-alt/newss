import { definePostHandler, onRequestOptions as sharedOptions } from './_lib/handler.js';
import { generateWithSchema, parseJsonLoose } from './_lib/gemini.js';
import { TREND_CONNECTION_SYSTEM_PROMPT, TREND_CONNECTION_SCHEMA } from './_lib/prompts.js';

export const onRequestPost = definePostHandler(async ({ body, env }) => {
  const { article, analysis, history } = body || {};
  if (!article?.title || !analysis) {
    throw new Error('기사와 분석 결과가 필요합니다.');
  }

  const historyText = Array.isArray(history) && history.length > 0
    ? history
        .map((h) => `- [${h.date}] ${h.article_title} (키워드: ${(h.keywords || []).join(', ') || '없음'} / 기업: ${(h.companies || []).join(', ') || '없음'} / 기술: ${(h.technologies || []).join(', ') || '없음'})`)
        .join('\n')
    : '이전에 저장된 산업스터디 기록 없음';

  const prompt = `[현재 기사]
제목: ${article.title}
왜 중요한가: ${analysis.why_it_matters || ''}
핵심 키워드: ${(analysis.keywords || []).join(', ')}
관련 기업: ${(analysis.companies || []).join(', ')}
관련 기술: ${(analysis.technologies || []).join(', ')}

[이전 산업스터디 기록 목록]
${historyText}`;

  const { text } = await generateWithSchema({
    env,
    systemInstruction: TREND_CONNECTION_SYSTEM_PROMPT,
    prompt,
    responseSchema: TREND_CONNECTION_SCHEMA,
  });

  return parseJsonLoose(text);
});

export const onRequestOptions = sharedOptions;
