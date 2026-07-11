import { definePostHandler, onRequestOptions as sharedOptions } from './_lib/handler.js';
import { generateWithSchema, parseJsonLoose } from './_lib/gemini.js';
import { CRITICAL_THINKING_SYSTEM_PROMPT, CRITICAL_THINKING_SCHEMA } from './_lib/prompts.js';

export const onRequestPost = definePostHandler(async ({ body, env }) => {
  const { article, analysis, opinion } = body || {};
  if (!article?.title || !opinion?.trim()) {
    throw new Error('기사 정보와 사용자 의견이 필요합니다.');
  }

  const prompt = `[기사]
제목: ${article.title}
왜 중요한가: ${analysis?.why_it_matters || ''}
핵심 키워드: ${(analysis?.keywords || []).join(', ')}

[사용자 의견]
${opinion.trim()}`;

  const { text } = await generateWithSchema({
    env,
    systemInstruction: CRITICAL_THINKING_SYSTEM_PROMPT,
    prompt,
    responseSchema: CRITICAL_THINKING_SCHEMA,
  });

  return parseJsonLoose(text);
});

export const onRequestOptions = sharedOptions;
