import React, { useEffect, useMemo } from 'react';
import { useRecords } from '../hooks/useRecords';
import { useSettings } from '../hooks/useSettings';
import { Card } from '../components/ui/Card';

const Statistics: React.FC = () => {
  const { records, fetchRecords, isLoading } = useRecords();
  const { members } = useSettings();
  
  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // Filter records for this month
  const thisMonthRecords = useMemo(() => {
    return records.filter(r => {
      const date = new Date(r.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
  }, [records, currentMonth, currentYear]);

  // Member stats
  const memberStats = useMemo(() => {
    const stats: Record<string, number> = {};
    members.forEach(m => stats[m] = 0);
    thisMonthRecords.forEach(r => {
      if (stats[r.member_name] !== undefined) {
        stats[r.member_name]++;
      }
    });
    return stats;
  }, [thisMonthRecords, members]);

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <header style={{ marginBottom: '1.5rem' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>이번 달 ({currentMonth + 1}월) 작성 횟수</p>
      </header>

      {isLoading ? (
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>통계를 불러오는 중...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <Card style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', marginTop: 0 }}>총 작성 건수</h3>
            <p style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0, color: 'var(--accent-primary)' }}>
              {thisMonthRecords.length}
            </p>
          </Card>

          <Card>
            <h3 style={{ fontSize: '1.125rem', marginTop: 0, marginBottom: '1.5rem' }}>참여자별 작성 횟수</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {members.map(member => (
                <div key={member}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '1rem' }}>
                    <span style={{ fontWeight: 500 }}>{member}</span>
                    <span style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{memberStats[member]}건</span>
                  </div>
                  <div style={{ height: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${Math.min((memberStats[member] / Math.max(thisMonthRecords.length, 1)) * 100, 100)}%`, 
                      height: '100%', 
                      background: 'var(--accent-secondary)', 
                      borderRadius: 'var(--radius-full)'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

        </div>
      )}
    </div>
  );
};

export default Statistics;
