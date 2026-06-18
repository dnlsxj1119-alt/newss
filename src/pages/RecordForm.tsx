import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
import { MEMBERS } from '../types';
import { useRecords } from '../hooks/useRecords';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { format } from 'date-fns';

const RecordForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const { records, fetchRecords, addRecord, updateRecord } = useRecords();

  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [rawText, setRawText] = useState('');
  const [headlinesText, setHeadlinesText] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!id;

  const today = format(new Date(), 'yyyy-MM-dd');
  const [isIncluded, setIsIncluded] = useState(date === today);

  // Update isIncluded when date changes (for new records)
  useEffect(() => {
    if (!isEditing) {
      setIsIncluded(date === today);
    }
  }, [date, today, isEditing]);

  useEffect(() => {
    if (isEditing) {
      if (records.length === 0) {
        fetchRecords();
      } else {
        const recordToEdit = records.find(r => r.id === id);
        if (recordToEdit) {
          if (recordToEdit.member_name !== currentUser) {
            alert('본인이 작성한 기록만 수정할 수 있습니다.');
            navigate('/records');
            return;
          }
          setDate(recordToEdit.date);
          setRawText(recordToEdit.raw_text || '');
          setHeadlinesText(recordToEdit.headlines_text || '');
          setIsIncluded(recordToEdit.is_included ?? true);
        }
      }
    }
  }, [id, isEditing, records, fetchRecords, currentUser, navigate]);

  // Regex-based "AI" Title Extraction
  const handleExtractTitles = () => {
    if (!rawText.trim()) {
      alert('먼저 원문이나 메모를 붙여넣어 주세요.');
      return;
    }
    
    const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    // 사용자가 제외해달라고 요청한 세부 정보 키워드들
    const exclusionKeywords = [
      '설비 용량', '일자리 창출', 'ETF 편입', 'ADR 상장', 
      '코스피 최고', '수혜 예상', '전망 및 효과', '규모', '확보'
    ];

    const extractedTitles: string[] = [];
    
    // 기사 구분 마커: 문장 맨 앞에 (1), [1], {1}, 1., 1) 등이 오고 뒤에 공백이 있는 형태
    const markerRegex = /^(?:\(\d+\)|\[\d+\]|\{\d+\}|\d+\.\s+|\d+\)\s+)\s*(.+)/;

    // 본문에 마커가 최소 1개라도 있는지 확인
    const hasMarkers = lines.some(l => markerRegex.test(l));

    if (hasMarkers) {
      // 마커가 있는 경우: 마커가 있는 줄만 검사하여 제목으로 추출
      for (const line of lines) {
        const match = markerRegex.exec(line);
        if (match) {
          const titleCandidate = match[1].trim();
          const isExcluded = exclusionKeywords.some(keyword => titleCandidate.includes(keyword));
          // 영문, 숫자, 특수기호로만 이루어진 단순 수치 제외
          const isOnlyNumbers = /^[\d\s\.,%a-zA-Z]+$/.test(titleCandidate);
          
          if (!isExcluded && !isOnlyNumbers) {
            extractedTitles.push(titleCandidate);
          }
        }
      }
    } else {
      // 마커가 전혀 없는 경우: 빈 줄(\n\n)을 기준으로 기사를 구분한다고 가정
      const blocks = rawText.split(/\n\s*\n/).filter(b => b.trim().length > 0);
      for (const block of blocks) {
        const blockLines = block.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        for (const line of blockLines) {
          // - 나 * 등으로 시작하는 세부 항목 줄은 무시
          if (/^[-*•]/.test(line)) continue;

          const isExcluded = exclusionKeywords.some(keyword => line.includes(keyword));
          const isOnlyNumbers = /^[\d\s\.,%a-zA-Z]+$/.test(line);
          
          if (!isExcluded && !isOnlyNumbers && line.length > 2) {
            extractedTitles.push(line);
            break; // 한 기사(블록)당 최상단의 핵심 제목 1개만 추출
          }
        }
      }
    }

    if (extractedTitles.length > 0) {
      // (1) 제목, (2) 제목 형태로 깔끔하게 포맷팅
      const formatted = extractedTitles.map((t, i) => `(${i + 1}) ${t}`).join('\n');
      setHeadlinesText(formatted);
    } else {
      alert('제목으로 추출할 만한 핵심 문장을 찾지 못했습니다.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !date) return;

    setIsSubmitting(true);
    
    const recordData = {
      date,
      member_name: currentUser,
      raw_text: rawText,
      headlines_text: headlinesText,
      is_included: isIncluded
    };

    let result;
    if (isEditing) {
      result = await updateRecord(id!, recordData);
    } else {
      result = await addRecord(recordData);
    }

    setIsSubmitting(false);

    if (result.success) {
      navigate('/records');
    } else {
      alert(`저장 중 오류가 발생했습니다: ${result.error}`);
    }
  };

  return (
    <div style={{ padding: '1.5rem', paddingBottom: '2rem' }}>
      <header style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button 
            onClick={() => navigate(-1)}
            style={{ marginRight: '1rem', color: 'var(--text-secondary)' }}
          >
            ← 뒤로
          </button>
          <h1 style={{ fontSize: '1.5rem', margin: 0 }}>
            {isEditing ? '기록 수정' : '새 기록 추가'}
          </h1>
        </div>
        
        {/* Author display moved to header */}
        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--badge-text)', background: 'var(--badge-bg)', border: '1px solid var(--badge-border)', padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-full)' }}>
          {MEMBERS.find(m => m.profile_id === currentUser)?.display_name || currentUser}
        </div>
      </header>

      <Card>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div>
            <Input 
              label="날짜" 
              type="date" 
              value={date} 
              onChange={e => setDate(e.target.value)}
              required
              style={{ marginBottom: '0.25rem' }}
            />
            {isIncluded ? (
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--success)' }}>✓ 오늘 날짜이므로 완료율 계산에 포함됩니다.</p>
            ) : (
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>⚠ 과거 기록이므로 완료율 계산에서 제외됩니다.</p>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>뉴스스터디 원문/메모</label>
            <textarea 
              value={rawText}
              onChange={e => setRawText(e.target.value)}
              placeholder="(1) 첫번째 제목\n내용...\n\n(2) 두번째 제목\n내용..."
              style={{ width: '100%', minHeight: '150px', resize: 'vertical', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', fontFamily: 'inherit' }}
            />
          </div>

          <Button 
            type="button" 
            variant="outline" 
            fullWidth 
            style={{ borderColor: 'var(--accent-secondary)', color: 'var(--accent-secondary)', marginBottom: '0.5rem' }}
            onClick={handleExtractTitles}
          >
            ✨ AI 제목 추출
          </Button>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>제목 목록</label>
            <textarea 
              value={headlinesText}
              onChange={e => setHeadlinesText(e.target.value)}
              placeholder="(1) 메모리 다음은 기판\n(2) 교부금, 대학에 쓴다..."
              style={{ width: '100%', minHeight: '200px', resize: 'vertical', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', fontFamily: 'inherit', lineHeight: '1.6' }}
            />
          </div>

          <Button type="submit" disabled={isSubmitting} size="lg" style={{ marginTop: '0.5rem' }}>
            {isSubmitting ? '저장 중...' : '저장하기'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default RecordForm;
