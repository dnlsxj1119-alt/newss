import { withCors } from './_lib/handler.js';
import { generateWithSearch, generateWithSchema, parseJsonLoose } from './_lib/gemini.js';
import {
  ARTICLE_ANALYZER_SEARCH_PROMPT,
  ARTICLE_ANALYZER_TEXT_PROMPT,
  ARTICLE_ANALYZER_SCHEMA,
} from './_lib/prompts.js';

// 독립형 "AI 기사분석" 탭 전용 엔드포인트. /study(news-analyzer.js)와는 완전히 분리되어 있으며
// 서로 수정해도 영향을 주지 않는다.
export default withCors(async (req, res) => {
  const { mode, url, content } = req.body || {};

  if (mode === 'url') {
    if (!url?.trim()) {
      throw new Error('분석할 기사 URL이 필요합니다.');
    }
    const prompt = `다음 URL의 기사를 검색해서 분석해줘: ${url.trim()}`;
    const text = await generateWithSearch({ systemInstruction: ARTICLE_ANALYZER_SEARCH_PROMPT, prompt });
    const parsed = parseJsonLoose(text);
    return res.status(200).json(parsed);
  }

  if (mode === 'text') {
    if (!content?.trim()) {
      throw new Error('분석할 기사 본문이 필요합니다.');
    }
    const prompt = `다음 기사 본문을 분석해줘:\n\n${content.trim()}`;
    const text = await generateWithSchema({
      systemInstruction: ARTICLE_ANALYZER_TEXT_PROMPT,
      prompt,
      responseSchema: ARTICLE_ANALYZER_SCHEMA,
    });
    return res.status(200).json(parseJsonLoose(text));
  }

  throw new Error('mode는 "url" 또는 "text" 여야 합니다.');
});
