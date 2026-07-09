import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import ArticleCard from '../components/ArticleCard';
import { renderStars } from '../lib/stars';
import { getErrorMessage } from '../lib/errors';
import { useUser } from '../hooks/useUser';
import { useRecords } from '../hooks/useRecords';
import { supabase } from '../lib/supabase';
import { scoutNews, analyzeArticle, connectTrends, criticalThink } from '../lib/aiStudy';
import type { ScoutedArticle, NewsAnalysis, TrendConnectionResult, CriticalThinkingResult } from '../types';

const sectionStyle: React.CSSProperties = { marginBottom: '1.5rem' };
const sectionTitleStyle: React.CSSProperties = { fontSize: '1.1rem', margin: '0 0 0.75rem 0' };
const errorStyle: React.CSSProperties = { color: 'var(--error)', fontSize: '0.85rem', marginTop: '0.5rem' };
const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.5rem' };
const listStyle: React.CSSProperties = { margin: '0 0 0.75rem 0', paddingLeft: '1.1rem', color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: 1.6 };
const chipsWrap: React.CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '0.4rem' };
const chipStyle: React.CSSProperties = {
  fontSize: '0.75rem', color: 'var(--badge-text)', background: 'var(--badge-bg)',
  border: '1px solid var(--badge-border)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)',
};

const AIStudy: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const { addRecord } = useRecords();

  // 1. 오늘 기사 찾기
  const [keywordInput, setKeywordInput] = useState('');
  const [articles, setArticles] = useState<ScoutedArticle[]>([]);
  const [topicsUsed, setTopicsUsed] = useState('');
  const [scoutLoading, setScoutLoading] = useState(false);
  const [scoutError, setScoutError] = useState<string | null>(null);

  // 2. 기사 선택 + 3. 분석
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [analysis, setAnalysis] = useState<NewsAnalysis | null>(null);
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  // 4. 지식 연결
  const [trend, setTrend] = useState<TrendConnectionResult | null>(null);
  const [trendLoading, setTrendLoading] = useState(false);
  const [trendError, setTrendError] = useState<string | null>(null);

  // 5~6. 내 의견 / 반대 관점
  const [opinion, setOpinion] = useState('');
  const [critical, setCritical] = useState<CriticalThinkingResult | null>(null);
  const [criticalLoading, setCriticalLoading] = useState(false);
  const [criticalError, setCriticalError] = useState<string | null>(null);

  // 7. 저장
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const selectedArticle = selectedIndex !== null ? articles[selectedIndex] : null;

  const resetAfterArticleChange = () => {
    setAnalysis(null);
    setAnalyzeError(null);
    setTrend(null);
    setTrendError(null);
    setOpinion('');
    setCritical(null);
    setCriticalError(null);
    setSaved(false);
    setSaveError(null);
  };

  const handleScout = async () => {
    setScoutLoading(true);
    setScoutError(null);
    setArticles([]);
    setSelectedIndex(null);
    resetAfterArticleChange();
    try {
      const { articles: found, topics } = await scoutNews(keywordInput);
      setArticles(found);
      setTopicsUsed(topics);
    } catch (err) {
      setScoutError(getErrorMessage(err, '기사를 찾지 못했습니다.'));
    } finally {
      setScoutLoading(false);
    }
  };

  const handleSelectArticle = (index: number) => {
    if (index === selectedIndex) return;
    setSelectedIndex(index);
    resetAfterArticleChange();
  };

  const handleAnalyze = async () => {
    if (!selectedArticle) return;
    setAnalyzeLoading(true);
    setAnalyzeError(null);
    try {
      const result = await analyzeArticle(selectedArticle);
      setAnalysis(result);
    } catch (err) {
      setAnalyzeError(getErrorMessage(err, '기사 분석에 실패했습니다.'));
    } finally {
      setAnalyzeLoading(false);
    }
  };

  const handleConnectTrends = async () => {
    if (!selectedArticle || !analysis) return;
    setTrendLoading(true);
    setTrendError(null);
    try {
      const { data } = await supabase
        .from('study_records')
        .select('article_title, date, keywords, companies, technologies')
        .eq('source', 'ai_workflow')
        .not('article_title', 'is', null)
        .order('date', { ascending: false })
        .limit(30);

      const history = (data || []).map((h) => ({
        article_title: h.article_title as string,
        date: h.date as string,
        keywords: h.keywords,
        companies: h.companies,
        technologies: h.technologies,
      }));

      const result = await connectTrends({ title: selectedArticle.title }, analysis, history);
      setTrend(result);
    } catch (err) {
      setTrendError(getErrorMessage(err, '지식 연결에 실패했습니다.'));
    } finally {
      setTrendLoading(false);
    }
  };

  const handleCriticalThink = async () => {
    if (!selectedArticle || !analysis || !opinion.trim()) return;
    setCriticalLoading(true);
    setCriticalError(null);
    try {
      const result = await criticalThink({ title: selectedArticle.title }, analysis, opinion);
      setCritical(result);
    } catch (err) {
      setCriticalError(getErrorMessage(err, '반대 관점 생성에 실패했습니다.'));
    } finally {
      setCriticalLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentUser || !selectedArticle || !analysis) return;
    setSaveLoading(true);
    setSaveError(null);

    const bodyLines = [
      `기사: ${selectedArticle.title}`,
      `링크: ${selectedArticle.link}`,
      `언론사: ${selectedArticle.press} / ${selectedArticle.date}`,
      `중요도: ${renderStars(selectedArticle.importance)}`,
      '',
      '[5줄 요약]',
      ...analysis.summary.map((s, i) => `${i + 1}. ${s}`),
      '',
      '[왜 중요한가]',
      analysis.why_it_matters,
      '',
      `[핵심 키워드] ${analysis.keywords.join(', ')}`,
      `[관련 기업] ${analysis.companies.join(', ')}`,
      `[관련 기술] ${analysis.technologies.join(', ')}`,
    ];

    if (trend) {
      bodyLines.push(
        '',
        '[Trend Connection]',
        `연결되는 이전 기사: ${trend.related_articles.join(' / ') || '없음'}`,
        `연결되는 기술: ${trend.related_technologies.join(', ') || '없음'}`,
        `연결되는 기업: ${trend.related_companies.join(', ') || '없음'}`,
        `산업 흐름: ${trend.industry_flow}`,
        `추가로 공부하면 좋은 개념: ${trend.further_study.join(' / ')}`
      );
    }

    if (opinion.trim()) {
      bodyLines.push('', '[내 의견]', opinion.trim());
    }

    if (critical) {
      bodyLines.push(
        '',
        '[Critical Thinking]',
        `반대 관점: ${critical.counterpoints.join(' / ')}`,
        `놓친 요소: ${critical.blindspots.join(' / ')}`,
        `생각해볼 질문: ${critical.questions.join(' / ')}`
      );
    }

    const result = await addRecord({
      date: format(new Date(), 'yyyy-MM-dd'),
      member_name: currentUser,
      is_included: true,
      raw_text: bodyLines.join('\n'),
      headlines_text: `(1) ${selectedArticle.title}`,
      source: 'ai_workflow',
      article_title: selectedArticle.title,
      article_link: selectedArticle.link,
      press: selectedArticle.press,
      importance: selectedArticle.importance,
      why_it_matters: analysis.why_it_matters,
      keywords: analysis.keywords,
      companies: analysis.companies,
      technologies: analysis.technologies,
      trend_connection: trend,
      my_opinion: opinion.trim() || null,
      critical_thinking: critical,
    });

    setSaveLoading(false);
    if (result.success) {
      setSaved(true);
    } else {
      setSaveError(result.error || '저장에 실패했습니다.');
    }
  };

  const handleStartOver = () => {
    setKeywordInput('');
    setArticles([]);
    setSelectedIndex(null);
    resetAfterArticleChange();
  };

  return (
    <div style={{ padding: '1.5rem', paddingBottom: '3rem' }}>
      <header style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', margin: 0 }}>AI 산업스터디</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
          오늘 기사 찾기 → 분석 → 지식 연결 → 내 의견 → 반대 관점 → 저장
        </p>
      </header>

      {/* 1. 오늘 기사 찾기 */}
      <Card style={sectionStyle}>
        <h2 style={sectionTitleStyle}>1. 오늘 기사 찾기</h2>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <Input
              placeholder="오늘 공부할 산업이나 키워드를 입력하세요. 예: AI 반도체, 디스플레이, 스타트업"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
            />
          </div>
          <Button onClick={handleScout} disabled={scoutLoading} style={{ whiteSpace: 'nowrap' }}>
            {scoutLoading ? '찾는 중...' : '오늘 기사 찾기'}
          </Button>
        </div>
        {topicsUsed && !scoutLoading && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
            검색 주제: {topicsUsed}
          </p>
        )}
        {scoutError && <p style={errorStyle}>{scoutError}</p>}
      </Card>

      {/* 2. 기사 카드 UI */}
      {articles.length > 0 && (
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>2. 기사 선택</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
            {articles.map((article, index) => (
              <ArticleCard
                key={article.link + index}
                article={article}
                selected={selectedIndex === index}
                onSelect={() => handleSelectArticle(index)}
              />
            ))}
          </div>
          <Button fullWidth onClick={handleAnalyze} disabled={selectedIndex === null || analyzeLoading}>
            {analyzeLoading ? '분석 중...' : '분석하기'}
          </Button>
          {analyzeError && <p style={errorStyle}>{analyzeError}</p>}
        </div>
      )}

      {/* 3. 기사 분석 */}
      {analysis && (
        <Card style={sectionStyle}>
          <h2 style={sectionTitleStyle}>3. 기사 분석</h2>
          <p style={labelStyle}>5줄 요약</p>
          <ol style={listStyle}>
            {analysis.summary.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
          <p style={labelStyle}>왜 중요한가</p>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 0.75rem 0' }}>{analysis.why_it_matters}</p>
          <p style={labelStyle}>핵심 키워드</p>
          <div style={{ ...chipsWrap, marginBottom: '0.75rem' }}>
            {analysis.keywords.map((k, i) => <span key={i} style={chipStyle}>{k}</span>)}
          </div>
          <p style={labelStyle}>관련 기업</p>
          <ul style={listStyle}>
            {analysis.companies.map((c, i) => <li key={i}>{c}</li>)}
          </ul>
          <p style={labelStyle}>관련 기술</p>
          <ul style={{ ...listStyle, marginBottom: 0 }}>
            {analysis.technologies.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        </Card>
      )}

      {/* 4. 지식 연결 */}
      {analysis && (
        <Card style={sectionStyle}>
          <h2 style={sectionTitleStyle}>4. 지식 연결</h2>
          {!trend ? (
            <Button variant="outline" fullWidth onClick={handleConnectTrends} disabled={trendLoading}>
              {trendLoading ? '연결하는 중...' : '지식 연결하기'}
            </Button>
          ) : (
            <>
              <p style={labelStyle}>연결되는 이전 기사</p>
              <ul style={listStyle}>
                {trend.related_articles.length > 0
                  ? trend.related_articles.map((a, i) => <li key={i}>{a}</li>)
                  : <li>이전 기록과 직접적인 연결 없음</li>}
              </ul>
              <p style={labelStyle}>연결되는 기술 / 기업</p>
              <div style={{ ...chipsWrap, marginBottom: '0.75rem' }}>
                {[...trend.related_technologies, ...trend.related_companies].map((t, i) => (
                  <span key={i} style={chipStyle}>{t}</span>
                ))}
              </div>
              <p style={labelStyle}>산업 흐름</p>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 0.75rem 0' }}>{trend.industry_flow}</p>
              <p style={labelStyle}>추가로 공부하면 좋은 개념</p>
              <ul style={{ ...listStyle, marginBottom: 0 }}>
                {trend.further_study.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            </>
          )}
          {trendError && <p style={errorStyle}>{trendError}</p>}
        </Card>
      )}

      {/* 5. 내 의견 작성 */}
      {analysis && (
        <Card style={sectionStyle}>
          <h2 style={sectionTitleStyle}>5. 내 의견 작성</h2>
          <textarea
            value={opinion}
            onChange={(e) => setOpinion(e.target.value)}
            placeholder="이 기사에 대한 내 생각을 작성해보세요."
            style={{
              width: '100%', minHeight: '120px', resize: 'vertical', padding: '0.75rem',
              borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', color: 'var(--text-primary)',
              border: '1px solid var(--border-color)', fontFamily: 'inherit',
            }}
          />
        </Card>
      )}

      {/* 6. Critical Thinking */}
      {analysis && (
        <Card style={sectionStyle}>
          <h2 style={sectionTitleStyle}>6. 반대 관점 / 확장 질문</h2>
          <Button
            variant="outline"
            fullWidth
            onClick={handleCriticalThink}
            disabled={!opinion.trim() || criticalLoading}
            style={{ marginBottom: critical ? '1rem' : 0 }}
          >
            {criticalLoading ? '생각하는 중...' : '다른 관점 보기'}
          </Button>
          {critical && (
            <>
              <p style={labelStyle}>반대 관점</p>
              <ul style={listStyle}>
                {critical.counterpoints.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
              <p style={labelStyle}>놓친 요소</p>
              <ul style={listStyle}>
                {critical.blindspots.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
              <p style={labelStyle}>생각해볼 질문</p>
              <ol style={{ ...listStyle, marginBottom: 0 }}>
                {critical.questions.map((q, i) => <li key={i}>{q}</li>)}
              </ol>
            </>
          )}
          {criticalError && <p style={errorStyle}>{criticalError}</p>}
        </Card>
      )}

      {/* 7. 최종 저장 */}
      {analysis && (
        <Card style={sectionStyle}>
          <h2 style={sectionTitleStyle}>7. 최종 저장</h2>
          {!saved ? (
            <>
              <Button fullWidth size="lg" onClick={handleSave} disabled={saveLoading}>
                {saveLoading ? '저장 중...' : '저장하기'}
              </Button>
              {saveError && <p style={errorStyle}>{saveError}</p>}
            </>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: 'var(--success)', fontWeight: 600, marginBottom: '1rem' }}>
                ✓ 저장되었습니다. 목록/달력에 반영됩니다.
              </p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button variant="outline" fullWidth onClick={() => navigate('/records')}>목록 보기</Button>
                <Button fullWidth onClick={handleStartOver}>새 스터디 시작</Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default AIStudy;
