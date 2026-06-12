import React, { useEffect, useState, useMemo } from 'react';
import { useUser } from '../hooks/useUser';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend, subDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import { supabase } from '../lib/supabase';
import { useSettings } from '../hooks/useSettings';
import { useVacations } from '../hooks/useVacations';
import { Flame } from 'lucide-react';

const Home: React.FC = () => {
  const { currentUser } = useUser();
  const navigate = useNavigate();
  const { members } = useSettings();
  const { vacations } = useVacations();
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');

  const [todayRecords, setTodayRecords] = useState<any[]>([]);
  const [monthTotal, setMonthTotal] = useState(0);
  const [allUserRecords, setAllUserRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Calculate active weekdays in the current month excluding vacations
  const activeWeekdaysInMonth = useMemo(() => {
    const days = eachDayOfInterval({ start: startOfMonth(today), end: endOfMonth(today) });
    const activeDays = days.filter(d => {
      if (isWeekend(d)) return false;
      const dStr = format(d, 'yyyy-MM-dd');
      const isVacation = vacations.some(v => dStr >= v.start_date && dStr <= v.end_date);
      return !isVacation;
    });
    return activeDays.length;
  }, [today, vacations]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const { data: todayData } = await supabase
          .from('study_records')
          .select('member_name, id, is_included, headlines_text')
          .eq('date', todayStr);
        if (todayData) setTodayRecords(todayData);

        const sm = format(startOfMonth(today), 'yyyy-MM-dd');
        const em = format(endOfMonth(today), 'yyyy-MM-dd');
        
        const { count } = await supabase
          .from('study_records')
          .select('*', { count: 'exact', head: true })
          .gte('date', sm)
          .lte('date', em)
          .eq('is_included', true);
          
        setMonthTotal(count || 0);

        // Fetch all records for current user to calculate streak
        if (currentUser) {
          const { data: userRecs } = await supabase
            .from('study_records')
            .select('date')
            .eq('member_name', currentUser)
            .eq('is_included', true)
            .order('date', { ascending: false });
          if (userRecs) setAllUserRecords(userRecs);
        }

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [todayStr, currentUser]);

  const memberStatus = useMemo(() => {
    const status: Record<string, boolean> = {};
    members.forEach(m => status[m] = false);
    todayRecords.forEach(r => {
      if (r.is_included !== false) {
        status[r.member_name] = true;
      }
    });
    return status;
  }, [members, todayRecords]);

  // Streak logic
  const streak = useMemo(() => {
    if (allUserRecords.length === 0) return 0;
    
    // Create a set of dates where user recorded
    const recordDates = new Set(allUserRecords.map(r => r.date));
    
    let currentStreak = 0;
    let checkDate = new Date();
    // If user hasn't recorded today, start checking from yesterday. 
    // If they haven't recorded yesterday either, streak might be 0, unless yesterday was weekend/vacation
    
    const todayStr = format(checkDate, 'yyyy-MM-dd');
    if (!recordDates.has(todayStr)) {
      const isTodayVacation = vacations.some(v => todayStr >= v.start_date && todayStr <= v.end_date);
      if (!isWeekend(checkDate) && !isTodayVacation) {
        checkDate = subDays(checkDate, 1); // Not recorded today, so let's see if they had a streak until yesterday
      }
    }

    while (true) {
      const dStr = format(checkDate, 'yyyy-MM-dd');
      const isVacation = vacations.some(v => dStr >= v.start_date && dStr <= v.end_date);
      
      if (recordDates.has(dStr)) {
        currentStreak++;
      } else if (!isWeekend(checkDate) && !isVacation) {
        // Missing a required day breaks the streak
        break;
      }
      // If it's a weekend or vacation but NO record, it's ignored and streak continues
      checkDate = subDays(checkDate, 1);
    }
    
    return currentStreak;
  }, [allUserRecords, vacations]);

  const completionRate = Math.min(Math.round((monthTotal / Math.max(activeWeekdaysInMonth, 1)) * 100), 100);

  const todayVacation = vacations.find(v => todayStr >= v.start_date && todayStr <= v.end_date);

  return (
    <div style={{ padding: '1.5rem', paddingBottom: '3rem' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
            {format(today, 'yyyy년 M월 d일 (EEEE)', { locale: ko })}
          </p>
          <h1 style={{ fontSize: '1.75rem', margin: 0 }}>
            환영합니다, <span className="gradient-text">{currentUser}</span>님!
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--badge-bg)', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--badge-border)', color: 'var(--badge-text)' }}>
          <Flame size={16} />
          <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>연속 기록</span>
          <span style={{ fontSize: '1rem', fontWeight: 700 }}>{streak}일</span>
        </div>
      </header>

      <Card style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>오늘의 스터디</h2>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            이번 달 완료율 {completionRate}%
          </span>
        </div>
        
        {isLoading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', margin: '2rem 0' }}>불러오는 중...</p>
        ) : todayVacation ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', background: 'rgba(148, 163, 184, 0.1)', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ fontSize: '1.25rem', margin: '0 0 0.5rem 0' }}>🛌 현재 휴식기간</h3>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
              {todayVacation.memo ? `사유: ${todayVacation.memo}` : '재충전의 시간입니다!'}
            </p>
          </div>
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

      <div style={{ padding: '0.5rem', marginBottom: '2rem' }}>
        <div style={{ borderTop: '1px solid var(--border-color)', margin: '0 0 1rem 0', width: '100%' }} />
        <h3 style={{ fontSize: '0.9rem', margin: '0 0 1.25rem 0', color: 'var(--text-secondary)' }}>오늘의 기록</h3>

        {isLoading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', margin: '2rem 0' }}>불러오는 중...</p>
        ) : todayRecords.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-secondary)' }}>
            오늘의 첫 기록을 작성해보세요!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {todayRecords.map(record => (
              <div key={record.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {record.member_name}
                  </span>
                  {record.is_included === false && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--badge-text)', background: 'var(--badge-bg)', border: '1px solid var(--badge-border)', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>
                      완료율 제외됨
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {record.headlines_text ? (
                    record.headlines_text.split('\n').filter(Boolean).map((line: string, idx: number) => (
                      <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span style={{ color: 'var(--text-tertiary)' }}>•</span>
                        <span>{line.replace(/^(\(\d+\)|\[\d+\]|\{\d+\}|\d+\.|\d+\))\s*/, '').trim()}</span>
                      </div>
                    ))
                  ) : (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <span style={{ color: 'var(--text-tertiary)' }}>•</span>
                      <span>추출된 제목이 없습니다.</span>
                    </div>
                  )}
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
