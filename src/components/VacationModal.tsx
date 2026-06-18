import React, { useState } from 'react';
import type { VacationPeriod } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface VacationModalProps {
  vacations: VacationPeriod[];
  onClose: () => void;
  onAdd: (v: any) => Promise<{success: boolean; error?: string}>;
  onUpdate: (id: string, v: any) => Promise<{success: boolean; error?: string}>;
  onDelete: (id: string) => Promise<{success: boolean; error?: string}>;
}

const VacationModal: React.FC<VacationModalProps> = ({ vacations, onClose, onAdd, onUpdate, onDelete }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [memo, setMemo] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const openAdd = () => {
    setEditingId(null);
    setStartDate('');
    setEndDate('');
    setMemo('');
    setIsFormOpen(true);
  };

  const openEdit = (v: VacationPeriod) => {
    setEditingId(v.id);
    setStartDate(v.start_date);
    setEndDate(v.end_date);
    setMemo(v.memo || '');
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) return;
    if (startDate > endDate) {
      alert('종료일이 시작일보다 빠를 수 없습니다.');
      return;
    }

    setIsSubmitting(true);
    const data = { start_date: startDate, end_date: endDate, memo };
    let res;
    if (editingId) {
      res = await onUpdate(editingId, data);
    } else {
      res = await onAdd(data);
    }
    setIsSubmitting(false);

    if (res.success) {
      setIsFormOpen(false);
    } else {
      alert(`저장 실패: ${res.error}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('이 휴식기간을 삭제하시겠습니까?')) {
      const res = await onDelete(id);
      if (!res.success) alert(`삭제 실패: ${res.error}`);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '1rem'
    }}>
      <Card style={{ width: '100%', maxWidth: '400px', maxHeight: '80vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>휴식기간 관리</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
        </div>

        {isFormOpen ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ margin: 0, fontSize: '1rem' }}>{editingId ? '휴식기간 수정' : '새 휴식기간'}</h3>
            <Input label="시작일" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
            <Input label="종료일" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required />
            <Input label="메모 (선택)" type="text" value={memo} onChange={e => setMemo(e.target.value)} placeholder="예: 기말고사, 여행" />
            
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <Button type="button" variant="outline" fullWidth onClick={() => setIsFormOpen(false)}>취소</Button>
              <Button type="submit" variant="primary" fullWidth disabled={isSubmitting}>{isSubmitting ? '저장중' : '저장'}</Button>
            </div>
          </form>
        ) : (
          <Button variant="primary" fullWidth onClick={openAdd} style={{ marginBottom: '1rem' }}>
            + 휴식기간 추가
          </Button>
        )}

        {!isFormOpen && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {vacations.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '1rem 0' }}>등록된 휴식기간이 없습니다.</p>
            ) : (
              vacations.map(v => (
                <div key={v.id} style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      <p style={{ margin: '0 0 0.25rem 0', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {v.start_date} ~ {v.end_date}
                      </p>
                      {v.memo && <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{v.memo}</p>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <Button variant="outline" size="sm" onClick={() => openEdit(v)}>수정</Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(v.id)} style={{ color: 'var(--error)' }}>삭제</Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        
        {!isFormOpen && (
          <div style={{ marginTop: '1.5rem' }}>
            <Button variant="outline" fullWidth onClick={onClose}>
              완료
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default VacationModal;
