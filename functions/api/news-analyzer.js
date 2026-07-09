import { definePostHandler, onRequestOptions as sharedOptions } from './_lib/handler.js';
import { generateWithSearch, parseJsonLoose } from './_lib/gemini.js';
import { NEWS_ANALYZER_SYSTEM_PROMPT } from './_lib/prompts.js';

export const onRequestPost = definePostHandler(async ({ body, env }) => {
  const { title, link, press, date } = body || {};
  if (!title || !link) {
    throw new Error('분석할 기사의 제목과 링크가 필요합니다.');
  }

  const prompt = `다음 기사를 분석해줘.\n제목: ${title}\n링크: ${link}\n언론사: ${press || '미상'}\n날짜: ${date || '미상'}`;

  const text = await generateWithSearch({ env, systemInstruction: NEWS_ANALYZER_SYSTEM_PROMPT, prompt });
  return parseJsonLoose(text);
});

export const onRequestOptions = sharedOptions;
