import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';

// 실패 시 순서대로 재시도할 모델 목록 (semi-mate 프로젝트와 동일한 fallback 전략)
const MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-preview-05-20', 'gemini-2.5-flash-lite'];

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('서버에 GEMINI_API_KEY 환경변수가 설정되어 있지 않습니다. .env(로컬) 또는 Vercel 환경변수를 확인하세요.');
  }
  return new GoogleGenAI({ apiKey });
}

// Google 검색 그라운딩이 필요한 호출 (News Scout, News Analyzer, 기사 URL 분석)
// 검색 도구를 쓰면 responseSchema를 함께 쓸 수 없으므로, 프롬프트로 JSON 형식을 강제하고
// parseJsonLoose로 텍스트에서 JSON만 뽑아낸다.
export async function generateWithSearch({ systemInstruction, prompt }) {
  const ai = getClient();
  let lastError;
  for (const model of MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          systemInstruction,
          tools: [{ googleSearch: {} }],
        },
      });
      return response.text;
    } catch (err) {
      console.warn(`[gemini] ${model} (search) 실패:`, err.message);
      lastError = err;
    }
  }
  throw lastError || new Error('모든 모델 호출에 실패했습니다.');
}

// 순수 추론(검색 불필요) 호출: 구조화된 JSON을 responseSchema로 강제한다 (Trend Connection, Critical Thinking, 본문 직접 입력 분석)
export async function generateWithSchema({ systemInstruction, prompt, responseSchema }) {
  const ai = getClient();
  let lastError;
  for (const model of MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema,
        },
      });
      return response.text;
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
