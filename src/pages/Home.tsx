import React, { useEffect, useState, useMemo } from 'react';
import { useUser } from '../hooks/useUser';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { supabase } from '../lib/supabase';
import { useSettings } from '../hooks/useSettings';

const Home: React.FC = () => {
  const { currentUser } = useUser();
  const navigate = useNavigate();
  const { members } = useSettings();
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');

  const [todayRecords, setTodayRecords] = useState<any[]>([]);
  const [recentRecords, setRecentRecords] = useState<any[]>([]);
  const [monthTotal, setMonthTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch today's records
        const { data: todayData } = await supabase
          .from('study_records')
          .select('member_name, id')
          .eq('date', todayStr);
        if (todayData) setTodayRecords(todayData);

        // Fetch recent 3 records
        const { data: recentData } = await supabase
          .from('study_records')
          .select('*')
          .order('date', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(3);
        if (recentData) setRecentRecords(recentData);

        // Fetch this month's stats
        const startOfMonth = format(new Date(today.getFullYear(), today.getMonth(), 1), 'yyyy-MM-dd');
        const endOfMonth = format(new Date(today.getFullYear(), today.getMonth() + 1, 0), 'yyyy-MM-dd');
        
        const { count } = await supabase
          .from('study_records')
          .select('*', { count: 'exact', head: true })
          .gte('date', startOfMonth)
          .lte('date', endOfMonth);
          
        setMonthTotal(count || 0);

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [todayStr]);

  const memberStatus = useMemo(() => {
    const status: Record<string, boolean> = {};
    members.forEach(m => status[m] = false);
    todayRecords.forEach(r => {
      status[r.member_name] = true;
    });
    return status;
  }, [members, todayRecords]);

  return (
    <div style={{ padding: '1.5rem', paddingBottom: '3rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
          {format(today, 'yyyy년 M월 d일 (EEEE)', { locale: ko })}
        </p>
        <h1 style={{ fontSize: '1.75rem' }}>
          환영합니다, <span className="gradient-text">{currentUser}</span>님!
        </h1>
      </header>

      <Card style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>오늘의 스터디</h2>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            이번 달 {monthTotal}회 작성
          </span>
        </div>
        
        {isLoading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', margin: '2rem 0' }}>불러오는 중...</p>
        ) : (
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {members.map(member => {
              const isDone = memberStatus[member];
              return (
                <div key={member} style={{ flex: 1, textAlign: 'center', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: isDone ? '1px solid var(--success)' : '1px solid transparent' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{member}</p>
                  <p style={{ fontSize: '1.125rem', fontWeight: 'bold', color: isDone ? 'var(--success)' : 'var(--text-tertiary)' }}>
                    {isDone ? '완료' : '미완료'}
                  </p>
                </div>
              );
            })}
          </div>
        )}
        
        <Button fullWidth onClick={() => navigate('/add')}>
          오늘 기록 추가하기
        </Button>
      </Card>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.125rem', margin: 0 }}>최근 기록</h3>
          <Button variant="ghost" size="sm" onClick={() => navigate('/records')} style={{ padding: 0 }}>
            전체보기 →
          </Button>
        </div>

        {isLoading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', margin: '2rem 0' }}>불러오는 중...</p>
        ) : recentRecords.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)' }}>
            아직 기록이 없습니다.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recentRecords.map(record => (
              <div 
                key={record.id} 
                onClick={() => navigate('/records')}
                style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {format(parseISO(record.date), 'M월 d일', { locale: ko })}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-primary)', background: 'rgba(59, 130, 246, 0.1)', padding: '0.1rem 0.5rem', borderRadius: 'var(--radius-full)' }}>
                    {record.member_name}
                  </span>
                </div>
                <div style={{ color: 'var(--text-primary)', fontSize: '0.875rem', whiteSpace: 'pre-wrap', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {record.headlines_text || record.raw_text}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
