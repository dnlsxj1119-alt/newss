import { withCors } from './_lib/handler.js';
import { generateWithSearch, parseJsonLoose } from './_lib/gemini.js';
import { NEWS_SCOUT_SYSTEM_PROMPT, DEFAULT_INDUSTRIES } from './_lib/prompts.js';

function pickDefaultIndustries(count = 5) {
  const shuffled = [...DEFAULT_INDUSTRIES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export default withCors(async (req, res) => {
  const { keywords } = req.body || {};
  const trimmed = (keywords || '').trim();
  const topics = trimmed || pickDefaultIndustries().join(', ');
  const today = new Date().toISOString().slice(0, 10);

  const prompt = `오늘 날짜: ${today}\n다음 산업/키워드에 대한 최신 산업 기사를 찾아 선별해줘: ${topics}`;

  const text = await generateWithSearch({ systemInstruction: NEWS_SCOUT_SYSTEM_PROMPT, prompt });
  const parsed = parseJsonLoose(text);

  if (!Array.isArray(parsed.articles) || parsed.articles.length === 0) {
    throw new Error('추천할 기사를 찾지 못했습니다. 다른 키워드로 다시 시도해보세요.');
  }

  res.status(200).json({ articles: parsed.articles, topics });
});
