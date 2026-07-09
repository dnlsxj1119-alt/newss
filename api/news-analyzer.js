import { withCors } from './_lib/handler.js';
import { generateWithSearch, parseJsonLoose } from './_lib/gemini.js';
import { NEWS_ANALYZER_SYSTEM_PROMPT } from './_lib/prompts.js';

export default withCors(async (req, res) => {
  const { title, link, press, date } = req.body || {};
  if (!title || !link) {
    throw new Error('분석할 기사의 제목과 링크가 필요합니다.');
  }

  const prompt = `다음 기사를 분석해줘.\n제목: ${title}\n링크: ${link}\n언론사: ${press || '미상'}\n날짜: ${date || '미상'}`;

  const text = await generateWithSearch({ systemInstruction: NEWS_ANALYZER_SYSTEM_PROMPT, prompt });
  const parsed = parseJsonLoose(text);

  res.status(200).json(parsed);
});
