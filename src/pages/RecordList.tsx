import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecords } from '../hooks/useRecords';
import { useSettings } from '../hooks/useSettings';
import { useUser } from '../hooks/useUser';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

const RecordList: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const { records, fetchRecords, isLoading, deleteRecord } = useRecords();
  const { members } = useSettings();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterMember, setFilterMember] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('정말 삭제하시겠습니까?')) {
      await deleteRecord(id);
    }
  };

  const handleEdit = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/edit/${id}`);
  };

  const filteredRecords = records.filter(record => {
    const searchLower = searchTerm.toLowerCase();
    const matchSearch = searchTerm === '' || 
      (record.headlines_text || '').toLowerCase().includes(searchLower) ||
      (record.raw_text || '').toLowerCase().includes(searchLower);
    
    const matchMember = filterMember ? record.member_name === filterMember : true;
    
    return matchSearch && matchMember;
  });

  return (
    <div style={{ padding: '1.5rem', paddingBottom: '3rem' }}>
      <header style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', margin: 0 }}>목록</h1>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <Input 
          placeholder="제목이나 원문 검색..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select 
          value={filterMember} 
          onChange={e => setFilterMember(e.target.value)}
          style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: 'var(--radius-md)' }}
        >
          <option value="">모든 참여자</option>
          {members.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
          불러오는 중...
        </div>
      ) : filteredRecords.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
          기록이 없습니다.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredRecords.map(record => {
            const isExpanded = expandedId === record.id;
            return (
              <Card 
                key={record.id} 
                onClick={() => setExpandedId(isExpanded ? null : record.id)}
                style={{ cursor: 'pointer', padding: '1.25rem' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                      {format(parseISO(record.date), 'yyyy년 M월 d일', { locale: ko })}
                    </span>
                    {record.is_included === false && (
                      <span style={{ fontSize: '0.7rem', background: 'var(--badge-bg)', color: 'var(--badge-text)', padding: '0.1rem 0.4rem', borderRadius: '4px', border: '1px solid var(--badge-border)' }}>
                        완료율 제외
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {record.member_name === currentUser && (
                      <div style={{ display: 'flex', gap: '0.5rem', marginRight: '0.25rem' }}>
                        <button onClick={(e) => handleEdit(record.id, e)} style={{ background: 'none', border: 'none', fontSize: '1rem', cursor: 'pointer', padding: 0 }} title="수정">✏️</button>
                        <button onClick={(e) => handleDelete(record.id, e)} style={{ background: 'none', border: 'none', fontSize: '1rem', cursor: 'pointer', padding: 0 }} title="삭제">🗑️</button>
                      </div>
                    )}
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--badge-text)', background: 'var(--badge-bg)', border: '1px solid var(--badge-border)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)' }}>
                      {record.member_name}
                    </span>
                  </div>
                </div>
                
                <div style={{ marginBottom: '0.5rem' }}>
                  <div style={{ 
                    color: 'var(--text-primary)', 
                    fontSize: '1rem', 
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap'
                  }}>
                    {record.headlines_text || <span style={{ color: 'var(--text-tertiary)' }}>추출된 제목이 없습니다.</span>}
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', animation: 'fadeIn 0.2s ease-in-out' }}>
                    <h4 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>원문</h4>
                    <div style={{ 
                      fontSize: '0.95rem', 
                      whiteSpace: 'pre-wrap', 
                      margin: '0 0 1.5rem 0',
                      background: 'var(--bg-primary)',
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-tertiary)',
                      maxHeight: '300px',
                      overflowY: 'auto'
                    }}>
                      {record.raw_text || '원문이 없습니다.'}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecordList;
