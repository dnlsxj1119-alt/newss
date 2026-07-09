import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import newsScoutHandler from './api/news-scout.js';
import newsAnalyzerHandler from './api/news-analyzer.js';
import trendConnectionHandler from './api/trend-connection.js';
import criticalThinkingHandler from './api/critical-thinking.js';
import articleAnalyzerHandler from './api/article-analyzer.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.post('/api/news-scout', newsScoutHandler);
app.post('/api/news-analyzer', newsAnalyzerHandler);
app.post('/api/trend-connection', trendConnectionHandler);
app.post('/api/critical-thinking', criticalThinkingHandler);
app.post('/api/article-analyzer', articleAnalyzerHandler);

app.listen(PORT, () => {
  console.log(`AI 산업스터디 백엔드 서버 실행 중: http://localhost:${PORT}`);
});
