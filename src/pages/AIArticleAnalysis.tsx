import React, { useState } from 'react';
import { format } from 'date-fns';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import ConfirmModal from '../components/ConfirmModal';
import { useUser } from '../hooks/useUser';
import { useRecords } from '../hooks/useRecords';
import { analyzeStandaloneArticle, criticalThinkStandalone } from '../lib/aiArticleAnalysis';
import { getErrorMessage } from '../lib/errors';
import type { StandaloneArticleAnalysis, CriticalThinkingResult } from '../types';

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
const textareaStyle: React.CSSProperties = {
  width: '100%', minHeight: '120px', resize: 'vertical', padding: '0.75rem',
  borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', color: 'var(--text-primary)',
  border: '1px solid var(--border-color)', fontFamily: 'inherit',
};

type InputMode = 'url' | 'text';

const buildMarkdown = (
  analysis: StandaloneArticleAnalysis,
  inputMode: InputMode,
  url: string,
  opinion: string,
  critical: CriticalThinkingResult | null
) => {
  const lines: string[] = [`# ${analysis.title}`];
  if (inputMode === 'url' && url.trim()) lines.push(`링크: ${url.trim()}`);
  lines.push('', '## 5줄 요약', ...analysis.summary.map((s, i) => `${i + 1}. ${s}`));
  lines.push('', '## 왜 중요한가', analysis.why_it_matters);
  lines.push('', '## 핵심 키워드', analysis.keywords.join(', '));
  lines.push('', '## 관련 기업', ...analysis.companies.map((c) => `- ${c}`));
  lines.push('', '## 관련 기술', ...analysis.technologies.map((t) => `- ${t}`));

  if (opinion.trim()) {
    lines.push('', '## 내 의견', opinion.trim());
  }
  if (critical) {
    lines.push(
      '', '## 반대 관점', ...critical.counterpoints.map((c) => `- ${c}`),
      '', '## 놓친 요소', ...critical.blindspots.map((b) => `- ${b}`),
      '', '## 생각해볼 질문', ...critical.questions.map((q, i) => `${i + 1}. ${q}`)
    );
  }
  return lines.join('\n');
};

const AIArticleAnalysis: React.FC = () => {
  const { currentUser } = useUser();
  const { addRecord } = useRecords();

  const [inputMode, setInputMode] = useState<InputMode>('url');
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');

  const [analysis, setAnalysis] = useState<StandaloneArticleAnalysis | null>(null);
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  const [opinion, setOpinion] = useState('');
  const [critical, setCritical] = useState<CriticalThinkingResult | null>(null);
  const [criticalLoading, setCriticalLoading] = useState(false);
  const [criticalError, setCriticalError] = useState<string | null>(null);

  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');

  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const resetResults = () => {
    setAnalysis(null);
    setAnalyzeError(null);
    setOpinion('');
    setCritical(null);
    setCriticalError(null);
    setCopyStatus('idle');
    setSaved(false);
    setSaveError(null);
  };

  const handleAnalyze = async () => {
    if (inputMode === 'url' && !urlInput.trim()) {
      setAnalyzeError('기사 URL을 입력해주세요.');
      return;
    }
    if (inputMode === 'text' && !textInput.trim()) {
      setAnalyzeError('기사 본문을 입력해주세요.');
      return;
    }

    resetResults();
    setAnalyzeLoading(true);
    try {
      const result = inputMode === 'url'
        ? await analyzeStandaloneArticle({ mode: 'url', url: urlInput.trim() })
        : await analyzeStandaloneArticle({ mode: 'text', content: textInput.trim() });
      setAnalysis(result);
    } catch (err) {
      setAnalyzeError(getErrorMessage(err, '기사 분석에 실패했습니다.'));
    } finally {
      setAnalyzeLoading(false);
    }
  };

  const handleCriticalThink = async () => {
    if (!analysis || !opinion.trim()) return;
    setCriticalLoading(true);
    setCriticalError(null);
    try {
      const result = await criticalThinkStandalone(analysis.title, analysis, opinion);
      setCritical(result);
    } catch (err) {
      setCriticalError(getErrorMessage(err, '반대 관점 생성에 실패했습니다.'));
    } finally {
      setCriticalLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!analysis) return;
    const markdown = buildMarkdown(analysis, inputMode, urlInput, opinion, critical);
    try {
      await navigator.clipboard.writeText(markdown);
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch {
      setCopyStatus('error');
    }
  };

  const handleConfirmSave = async () => {
    if (!currentUser || !analysis) return;
    setSaveLoading(true);
    setSaveError(null);

    const result = await addRecord({
      date: format(new Date(), 'yyyy-MM-dd'),
      member_name: currentUser,
      is_included: true,
      raw_text: buildMarkdown(analysis, inputMode, urlInput, opinion, critical),
      headlines_text: `(1) ${analysis.title}`,
      source: 'ai_workflow',
      article_title: analysis.title,
      article_link: inputMode === 'url' && urlInput.trim() ? urlInput.trim() : null,
      press: null,
      importance: null,
      why_it_matters: analysis.why_it_matters,
      keywords: analysis.keywords,
      companies: analysis.companies,
      technologies: analysis.technologies,
      trend_connection: null,
      my_opinion: opinion.trim() || null,
      critical_thinking: critical,
    });

    setSaveLoading(false);
    setShowSaveConfirm(false);

    if (result.success) {
      setSaved(true);
    } else {
      setSaveError(result.error || '저장에 실패했습니다.');
    }
  };

  return (
    <div style={{ padding: '1.5rem', paddingBottom: '3rem' }}>
      <header style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', margin: 0 }}>AI 기사분석</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
          독립 도구입니다. 자동으로 저장되지 않으며, 아래에서 직접 [산업스터디에 저장]을 눌러야만 기록으로 남습니다.
        </p>
      </header>

      {/* 입력 */}
      <Card style={sectionStyle}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <Button
            variant={inputMode === 'url' ? 'primary' : 'outline'}
            fullWidth
            onClick={() => setInputMode('url')}
          >
            URL 입력
          </Button>
          <Button
            variant={inputMode === 'text' ? 'primary' : 'outline'}
            fullWidth
            onClick={() => setInputMode('text')}
          >
            본문 직접 입력
          </Button>
        </div>

        {inputMode === 'url' ? (
          <Input
            placeholder="분석할 기사 URL을 입력하세요. 예: https://..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
          />
        ) : (
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="기사 본문을 붙여넣으세요."
            style={textareaStyle}
          />
        )}

        <Button fullWidth onClick={handleAnalyze} disabled={analyzeLoading} style={{ marginTop: '1rem' }}>
          {analyzeLoading ? '분석 중...' : '분석하기'}
        </Button>
        {analyzeError && <p style={errorStyle}>{analyzeError}</p>}
      </Card>

      {/* URL에서 내용을 충분히 못 읽은 경우 */}
      {analysis?.insufficient_content && (
        <Card style={{ ...sectionStyle, border: '1px solid var(--warning)' }}>
          <p style={{ color: 'var(--warning)', fontSize: '0.9rem', margin: '0 0 0.75rem 0' }}>
            ⚠ {analysis.note || 'URL에서 충분한 내용을 확인하지 못했습니다. 기사 본문을 직접 입력해주세요.'}
          </p>
          <Button
            variant="outline"
            fullWidth
            onClick={() => {
              setInputMode('text');
              setAnalysis(null);
            }}
          >
            본문 직접 입력하기
          </Button>
        </Card>
      )}

      {/* 분석 결과 */}
      {analysis && !analysis.insufficient_content && (
        <Card style={sectionStyle}>
          <h2 style={sectionTitleStyle}>분석 결과</h2>
          <p style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 1rem 0' }}>{analysis.title}</p>
          <p style={labelStyle}>5줄 요약</p>
          <ol style={listStyle}>
            {analysis.summary.map((s, i) => <li key={i}>{s}</li>)}
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

      {/* 내 의견 */}
      {analysis && !analysis.insufficient_content && (
        <Card style={sectionStyle}>
          <h2 style={sectionTitleStyle}>내 의견</h2>
          <textarea
            value={opinion}
            onChange={(e) => setOpinion(e.target.value)}
            placeholder="이 기사에 대한 내 생각을 작성해보세요."
            style={textareaStyle}
          />
        </Card>
      )}

      {/* 반대 관점 */}
      {analysis && !analysis.insufficient_content && (
        <Card style={sectionStyle}>
          <h2 style={sectionTitleStyle}>반대 관점 / 확장 질문</h2>
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

      {/* 복사 / 저장 (선택) */}
      {analysis && !analysis.insufficient_content && (
        <Card style={sectionStyle}>
          <h2 style={sectionTitleStyle}>복사 / 저장 (선택)</h2>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Button variant="outline" fullWidth onClick={handleCopy}>
              {copyStatus === 'copied' ? '복사됨 ✓' : '복사하기'}
            </Button>
            <Button
              variant="outline"
              fullWidth
              onClick={() => setShowSaveConfirm(true)}
              disabled={saved}
              style={{ borderColor: 'var(--accent-secondary)', color: 'var(--accent-secondary)' }}
            >
              {saved ? '저장됨 ✓' : '산업스터디에 저장'}
            </Button>
          </div>
          {copyStatus === 'error' && <p style={errorStyle}>클립보드 복사에 실패했습니다. 직접 선택해서 복사해주세요.</p>}
          {saveError && <p style={errorStyle}>{saveError}</p>}
          {saved && (
            <p style={{ color: 'var(--success)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
              ✓ 산업스터디 기록에 저장되었습니다. (목록/달력에서 확인 가능)
            </p>
          )}
        </Card>
      )}

      {showSaveConfirm && (
        <ConfirmModal
          title="산업스터디에 저장할까요?"
          message={`이 분석 결과가 오늘(${format(new Date(), 'yyyy-MM-dd')}) 날짜로 산업스터디 기록에 저장됩니다.\n저장 후에는 기존 목록/달력에서 다른 기록과 동일하게 보입니다.`}
          confirmLabel="저장"
          isSubmitting={saveLoading}
          onConfirm={handleConfirmSave}
          onCancel={() => setShowSaveConfirm(false)}
        />
      )}
    </div>
  );
};

export default AIArticleAnalysis;
