// Cloudflare Pages Functions(Workers 런타임)에서 동작해야 하므로 Node 전용 SDK(@google/genai) 대신
// fetch로 Gemini REST API를 직접 호출한다. 로컬(wrangler pages dev)과 배포 환경에서 동일하게 동작한다.

const MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-preview-05-20', 'gemini-2.5-flash-lite'];

async function callGemini(apiKey, model, systemInstruction, prompt, { tools, responseSchema } = {}) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const generationConfig = {};
  if (responseSchema) {
    generationConfig.responseMimeType = 'application/json';
    generationConfig.responseSchema = responseSchema;
  }

  const body = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: systemInstruction }] },
    ...(Object.keys(generationConfig).length > 0 ? { generationConfig } : {}),
    ...(tools ? { tools } : {}),
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || `Gemini 호출 실패 (${res.status})`);
  }

  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text).join('');
  if (!text) {
    throw new Error('Gemini 응답에 내용이 없습니다.');
  }
  return text;
}

function getApiKey(env) {
  const apiKey = env?.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY 환경변수가 설정되어 있지 않습니다. 로컬은 .dev.vars, 배포는 Cloudflare Pages 대시보드의 환경변수를 확인하세요.');
  }
  return apiKey;
}

// Google 검색 그라운딩이 필요한 호출 (News Scout, News Analyzer, 기사 URL 분석)
export async function generateWithSearch({ env, systemInstruction, prompt }) {
  const apiKey = getApiKey(env);
  let lastError;
  for (const model of MODELS) {
    try {
      return await callGemini(apiKey, model, systemInstruction, prompt, { tools: [{ googleSearch: {} }] });
    } catch (err) {
      console.warn(`[gemini] ${model} (search) 실패:`, err.message);
      lastError = err;
    }
  }
  throw lastError || new Error('모든 모델 호출에 실패했습니다.');
}

// 순수 추론(검색 불필요) 호출: 구조화된 JSON을 responseSchema로 강제한다
export async function generateWithSchema({ env, systemInstruction, prompt, responseSchema }) {
  const apiKey = getApiKey(env);
  let lastError;
  for (const model of MODELS) {
    try {
      return await callGemini(apiKey, model, systemInstruction, prompt, { responseSchema });
    } catch (err) {
      console.warn(`[gemini] ${model} (schema) 실패:`, err.message);
      lastError = err;
    }
  }
  throw lastError || new Error('모든 모델 호출에 실패했습니다.');
}

// 검색 도구를 쓴 응답은 마크다운 코드블록이나 잡담이 섞일 수 있어 { ... } 구간만 추출해 파싱한다.
export function parseJsonLoose(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) {
    throw new Error('AI 응답에서 JSON을 찾을 수 없습니다.');
  }
  return JSON.parse(text.slice(start, end + 1));
}
