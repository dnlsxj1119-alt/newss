import { definePostHandler, onRequestOptions as sharedOptions } from './_lib/handler.js';
import { generateWithSearch, parseJsonLoose } from './_lib/gemini.js';
import { NEWS_SCOUT_SYSTEM_PROMPT, DEFAULT_INDUSTRIES } from './_lib/prompts.js';

function pickDefaultIndustries(count = 5) {
  const shuffled = [...DEFAULT_INDUSTRIES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function normalize(str) {
  return (str || '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

function wordOverlap(a, b) {
  const aWords = new Set(normalize(a).split(' ').filter((w) => w.length > 1));
  const bWords = new Set(normalize(b).split(' ').filter((w) => w.length > 1));
  let overlap = 0;
  for (const w of aWords) if (bWords.has(w)) overlap++;
  return overlap;
}

const HUB_PATH_PATTERN = /\/(hub|topic|topics|tag|tags|category|categories|section|sections|live|videos)(\/|$)/i;

// 그라운딩 링크는 vertexaisearch.cloud.google.com 리다이렉트라 실제 도착지를 알 수 없다.
// 리다이렉트를 따라가 최종 URL을 확인하고, 허브/카테고리 목록 페이지로 보이면 신뢰하지 않는다.
async function resolveFinalUrl(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NewsScoutBot/1.0)' },
    });
    clearTimeout(timeout);
    res.body?.cancel?.();
    return res.ok ? res.url : null;
  } catch {
    return null;
  }
}

function looksLikeHubPage(url) {
  try {
    const { pathname } = new URL(url);
    if (HUB_PATH_PATTERN.test(pathname)) return true;
    const segments = pathname.split('/').filter(Boolean);
    const last = segments[segments.length - 1] || '';
    // 개별 기사 슬러그는 보통 길고 숫자/하이픈이 섞여 있다. 마지막 경로가 짧고 숫자가 없으면 목록 페이지일 가능성이 높다.
    return last.length < 12 && !/\d/.test(last);
  } catch {
    return false;
  }
}

// 모델이 link 필드에 직접 적어낸 URL은 지어낸 것일 수 있다(404 원인).
// googleSearch 그라운딩이 실제로 찾아낸 groundingChunks 링크와 제목/언론사를 매칭해
// 실제 도착지를 확인한 뒤, 허브 페이지가 아닌 개별 기사일 때만 그 링크로 교체한다.
async function attachVerifiedLinks(articles, groundingChunks) {
  if (!groundingChunks?.length) return articles;
  return Promise.all(articles.map(async (article) => {
    const candidates = groundingChunks
      .map((chunk) => ({ chunk, score: wordOverlap(`${article.title} ${article.press || ''}`, `${chunk.title || ''} ${chunk.uri || ''}`) }))
      .filter((c) => c.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 2);

    // 가장 잘 맞는 후보부터 순서대로 시도한다. 죽은 리다이렉트나 허브 페이지면 다음 후보로 넘어간다.
    for (const { chunk } of candidates) {
      const resolved = await resolveFinalUrl(chunk.uri);
      if (resolved && !looksLikeHubPage(resolved)) {
        return { ...article, link: resolved };
      }
    }
    return article;
  }));
}

export const onRequestPost = definePostHandler(async ({ body, env }) => {
  const { keywords } = body || {};
  const trimmed = (keywords || '').trim();
  const topics = trimmed || pickDefaultIndustries().join(', ');
  const today = new Date().toISOString().slice(0, 10);

  const prompt = `오늘 날짜: ${today}\n다음 산업/키워드에 대한 최신 산업 기사를 찾아 선별해줘: ${topics}`;

  const { text, groundingChunks } = await generateWithSearch({ env, systemInstruction: NEWS_SCOUT_SYSTEM_PROMPT, prompt });
  const parsed = parseJsonLoose(text);

  if (!Array.isArray(parsed.articles) || parsed.articles.length === 0) {
    throw new Error('추천할 기사를 찾지 못했습니다. 다른 키워드로 다시 시도해보세요.');
  }

  const articles = await attachVerifiedLinks(parsed.articles, groundingChunks);
  return { articles, topics };
});

export const onRequestOptions = sharedOptions;
