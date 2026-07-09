// Cloudflare Pages Functions는 Node의 (req, res) 콜백이 아니라 Web 표준 Request/Response를 쓴다.
// 이 헬퍼가 Express 시절의 withCors 역할을 대신한다: JSON 파싱 + CORS 헤더 + 에러 처리를 공통화한다.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

// fn: async ({ body, env }) => data  (data가 그대로 200 응답 JSON이 된다)
export function definePostHandler(fn) {
  return async ({ request, env }) => {
    try {
      const body = await request.json().catch(() => ({}));
      const data = await fn({ body, env });
      return json(data, 200);
    } catch (err) {
      console.error(err);
      return json({ error: err.message || 'Unknown server error' }, 500);
    }
  };
}

export function onRequestOptions() {
  return new Response(null, { status: 200, headers: corsHeaders });
}
