// Vercel 서버리스 함수와 로컬 Express 서버 양쪽에서 동일하게 쓰는 CORS + 에러 래퍼
export function withCors(fn) {
  return async (req, res) => {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      await fn(req, res);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message || 'Unknown server error' });
    }
  };
}
