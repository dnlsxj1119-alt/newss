import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
import { useRecords } from '../hooks/useRecords';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { format } from 'date-fns';

const RecordForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const { addRecord, updateRecord, records, fetchRecords } = useRecords();

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
    
    // 매칭 가능한 형태: (1), [1], {1}, 1., 1)
    const regex = /(?:\(\d+\)|\[\d+\]|\{\d+\}|\d+\.|\d+\))\s*([^\n]+)/g;
    const matches = [];
    let match;
    let count = 1;
    while ((match = regex.exec(rawText)) !== null) {
      matches.push(`(${count}) ${match[1].trim()}`);
      count++;
    }

    if (matches.length > 0) {
      setHeadlinesText(matches.join('\n'));
    } else {
      alert('원문에서 (1), (2) 형태의 제목을 찾지 못했습니다.');
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
          {currentUser}
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
