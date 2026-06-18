import React, { useState, useEffect, useMemo } from 'react';
import { useRecords } from '../hooks/useRecords';
import { MEMBERS } from '../types';
import { useVacations } from '../hooks/useVacations';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import VacationModal from '../components/VacationModal';
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth, 
  startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, 
  eachDayOfInterval, isWeekend 
} from 'date-fns';
import { ko } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CalendarView: React.FC = () => {
  const { records, fetchRecords } = useRecords();
  const { vacations, fetchVacations, addVacation, updateVacation, deleteVacation } = useVacations();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  const [isVacationModalOpen, setIsVacationModalOpen] = useState(false);

  useEffect(() => {
    fetchRecords();
    fetchVacations();
  }, [fetchRecords, fetchVacations]);

  useEffect(() => {
    const handleDocumentClick = () => {
      // Intentionally empty
    };
    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, []);



  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  // Active weekdays calculation for the current displayed month
  const activeWeekdaysInMonth = useMemo(() => {
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const activeDays = days.filter(d => {
      if (isWeekend(d)) return false;
      const dStr = format(d, 'yyyy-MM-dd');
      const isVacation = vacations.some(v => dStr >= v.start_date && dStr <= v.end_date);
      return !isVacation;
    });
    return activeDays.length;
  }, [monthStart, monthEnd, vacations]);

  const recordsByDate = useMemo(() => {
    const map: Record<string, any[]> = {};
    records.forEach(r => {
      if (!map[r.date]) map[r.date] = [];
      map[r.date].push(r);
    });
    return map;
  }, [records]);

  // Compute Completion Rates for displayed month
  const { completionStats } = useMemo(() => {
    const stats: Record<string, number> = {};
    MEMBERS.forEach(m => stats[m.profile_id] = 0);
    let overallCount = 0;

    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    days.forEach(d => {
      if (isWeekend(d)) return;
      const dStr = format(d, 'yyyy-MM-dd');
      const isVacation = vacations.some(v => dStr >= v.start_date && dStr <= v.end_date);
      if (isVacation) return;

      const dayRecords = recordsByDate[dStr] || [];
      const validRecords = dayRecords.filter(r => r.is_included !== false);
      
      let allMembersWrote = true;
      MEMBERS.forEach(m => {
        if (validRecords.some(r => r.member_name === m.profile_id)) {
          stats[m.profile_id]++;
        } else {
          allMembersWrote = false;
        }
      });
      
      if (allMembersWrote && MEMBERS.length > 0) {
        overallCount++;
      }
    });

    return { completionStats: { memberStats: stats, overallCount } };
  }, [monthStart, monthEnd, recordsByDate, MEMBERS]);



  const renderDays = () => {
    const days = [];
    const date = ['일', '월', '화', '수', '목', '금', '토'];

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} style={{ textAlign: 'center', fontWeight: 600, fontSize: '0.875rem', color: i === 0 || i === 6 ? 'var(--text-tertiary)' : 'var(--text-primary)', paddingBottom: '0.5rem' }}>
          {date[i]}
        </div>
      );
    }
    return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '0.5rem' }}>{days}</div>;
  };

  const renderCells = () => {
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = '';
    const today = new Date();
    
    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, 'd');
        const dateStr = format(day, 'yyyy-MM-dd');
        const dayRecords = recordsByDate[dateStr] || [];
        const validRecords = dayRecords.filter(r => r.is_included !== false);
        
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isToday = isSameDay(day, today);
        const isVacation = vacations.some(v => dateStr >= v.start_date && dateStr <= v.end_date);
        const isSelected = selectedDateStr === dateStr;

        let wroteA = MEMBERS[0] && validRecords.some(r => r.member_name === MEMBERS[0].profile_id);
        let wroteB = MEMBERS[1] && validRecords.some(r => r.member_name === MEMBERS[1].profile_id);

        const baseBg = isVacation 
          ? 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(148, 163, 184, 0.1) 5px, rgba(148, 163, 184, 0.1) 10px)'
          : isSelected ? 'var(--primary-gradient)' : 'transparent';

        const textColor = isToday ? 'var(--primary-color)' : isSelected ? '#ffffff' : 'var(--text-primary)';
        const borderColor = isSelected ? 'var(--primary-color)' : isVacation ? 'rgba(148, 163, 184, 0.2)' : 'transparent';

        const dayToStore = day; // capture in closure

        days.push(
          <div
            key={day.toString()}
            onClick={() => setSelectedDateStr(format(dayToStore, 'yyyy-MM-dd'))}
            style={{
              padding: '0.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              background: baseBg,
              borderRadius: 'var(--radius-md)',
              opacity: isCurrentMonth ? 1 : 0.3,
              minHeight: '50px',
              border: `1px solid ${borderColor}`,
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out'
            }}
          >
            <div style={{
              color: textColor,
              fontWeight: isToday ? 700 : 500,
              fontSize: '0.875rem',
              marginBottom: '2px'
            }}>
              {formattedDate}
            </div>
            <div style={{ display: 'flex', gap: '3px', height: '14px', alignItems: 'center' }}>
              {wroteA && <span style={{ fontSize: '0.65rem', lineHeight: 1, color: 'var(--primary-color)' }}>●</span>}
              {wroteB && <span style={{ fontSize: '0.65rem', lineHeight: 1, color: 'var(--primary-color)' }}>○</span>}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '4px' }}>
          {days}
        </div>
      );
      days = [];
    }
    return <div>{rows}</div>;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.3s ease-in-out' }}>
      
      {/* 1. 상단 요약 영역 (완료율 카드) */}
      <div style={{ padding: '0.5rem' }}>
        <h2 style={{ fontSize: '0.9rem', margin: '0 0 0.75rem 0', color: 'var(--text-secondary)' }}>이번 달 스터디 완료율</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          
          {MEMBERS.map(m => {
            const count = completionStats.memberStats[m.profile_id] || 0;
            const rate = Math.min(Math.round((count / Math.max(activeWeekdaysInMonth, 1)) * 100), 100);
            return (
              <div key={m.profile_id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8125rem' }}>
                <span style={{ fontWeight: 600, width: '40px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.display_name}</span>
                <div style={{ flex: 1, height: '4px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-full)', overflow: 'hidden', display: 'flex' }}>
                  <div style={{ width: `${rate}%`, height: '100%', background: 'var(--primary-gradient)' }} />
                </div>
                <span style={{ color: 'var(--text-secondary)', width: '75px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                  {count}/{activeWeekdaysInMonth}일 <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>({rate}%)</span>
                </span>
              </div>
            );
          })}
          
          {/* 전체 완료율 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8125rem', marginTop: '0.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
            <span style={{ fontWeight: 700, width: '40px', color: 'var(--accent-secondary)', whiteSpace: 'nowrap' }}>전체</span>
            <div style={{ flex: 1, height: '4px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-full)', overflow: 'hidden', display: 'flex' }}>
              <div style={{ 
                width: `${Math.min(Math.round((completionStats.overallCount / Math.max(activeWeekdaysInMonth, 1)) * 100), 100)}%`, 
                height: '100%', 
                background: 'var(--primary-gradient)' 
              }} />
            </div>
            <span style={{ color: 'var(--text-secondary)', width: '75px', textAlign: 'right', whiteSpace: 'nowrap' }}>
              {completionStats.overallCount}/{activeWeekdaysInMonth}일 <span style={{ color: 'var(--accent-secondary)', fontWeight: 700 }}>({Math.min(Math.round((completionStats.overallCount / Math.max(activeWeekdaysInMonth, 1)) * 100), 100)}%)</span>
            </span>
          </div>
        </div>
      </div>



      {/* 4. 달력 */}
      <Card style={{ padding: '1.25rem', marginTop: '0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <Button variant="ghost" onClick={prevMonth} style={{ padding: '0.5rem' }}>
            <ChevronLeft />
          </Button>
          <h2 style={{ margin: 0, fontSize: '1.125rem' }}>
            {format(currentDate, 'yyyy년 M월')}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Button variant="ghost" size="sm" onClick={() => setIsVacationModalOpen(true)} style={{ color: 'var(--text-secondary)' }}>
              휴가설정
            </Button>
            <Button variant="ghost" onClick={nextMonth} style={{ padding: '0.5rem' }}>
              <ChevronRight />
            </Button>
          </div>
        </div>
        
        {renderDays()}
        {renderCells()}
        
        {/* 범례 */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          {MEMBERS[0] && <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><span style={{ color: 'var(--primary-color)' }}>●</span> <span>{MEMBERS[0].display_name} 작성</span></div>}
          {MEMBERS[1] && <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><span style={{ color: 'var(--primary-color)' }}>○</span> <span>{MEMBERS[1].display_name} 작성</span></div>}
        </div>
      </Card>

      {/* 5. 선택 날짜 기록 상세 보기 */}
      {selectedDateStr && (
        <div style={{ padding: '0.5rem', marginBottom: '4rem' }}>
          <div style={{ borderTop: '1px solid var(--border-color)', margin: '1.5rem 0 1rem 0', width: '100%' }} />
          <h3 style={{ fontSize: '1rem', margin: '0 0 1.25rem 0', color: 'var(--text-primary)' }}>
            {format(new Date(selectedDateStr), 'M월 d일', { locale: ko })} 기록 상세
          </h3>
          
          {(recordsByDate[selectedDateStr] || []).length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem 0' }}>작성된 기록이 없습니다.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {MEMBERS.map(member => {
                const userRecords = (recordsByDate[selectedDateStr] || []).filter(r => r.member_name === member.profile_id);
                if (userRecords.length === 0) return null;

                return (
                  <div key={member.profile_id}>
                    <div style={{ display: 'inline-block', background: 'var(--bg-secondary)', padding: '0.3rem 0.8rem', borderRadius: 'var(--radius-full)', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>
                      {member.display_name} 작성
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {userRecords.map(record => {
                        // Parse rawText to extract What/Why/How
                        const lines = (record.raw_text || '').split('\n');
                        const markerRegex = /^(?:\(\d+\)|\[\d+\]|\{\d+\}|\d+\.\s+|\d+\)\s+)\s*(.+)/;
                        
                        const articles: { title: string, what: string[], why: string[], how: string[], memo: string[], other: string[] }[] = [];
                        let currentArticle = { title: '기록 내용', what: [] as string[], why: [] as string[], how: [] as string[], memo: [] as string[], other: [] as string[] };
                        let currentSection = 'other';
                        
                        for (const line of lines) {
                          const trimmed = line.trim();
                          if (!trimmed) continue;
                          
                          const match = markerRegex.exec(trimmed);
                          if (match) {
                            if (currentArticle.other.length > 0 || currentArticle.what.length > 0 || currentArticle.why.length > 0) {
                              articles.push(currentArticle);
                            }
                            currentArticle = { title: match[1].trim(), what: [], why: [], how: [], memo: [], other: [] };
                            currentSection = 'other';
                            continue;
                          }
                          
                          const lower = trimmed.toLowerCase();
                          if (lower.match(/^[-*\s]*(what)(:|\s|$)/)) {
                            currentSection = 'what';
                            currentArticle.what.push(trimmed.replace(/^[-*\s]*(what|What|WHAT)[^:]*:?\s*/, ''));
                          } else if (lower.match(/^[-*\s]*(why)(:|\s|$)/)) {
                            currentSection = 'why';
                            currentArticle.why.push(trimmed.replace(/^[-*\s]*(why|Why|WHY)[^:]*:?\s*/, ''));
                          } else if (lower.match(/^[-*\s]*(how)(:|\s|$)/)) {
                            currentSection = 'how';
                            currentArticle.how.push(trimmed.replace(/^[-*\s]*(how|How|HOW)[^:]*:?\s*/, ''));
                          } else if (lower.match(/^[-*\s]*메모(:|\s|$)/)) {
                            currentSection = 'memo';
                            currentArticle.memo.push(trimmed.replace(/^[-*\s]*메모[^:]*:?\s*/, ''));
                          } else {
                            if (currentSection === 'what') currentArticle.what.push(trimmed);
                            else if (currentSection === 'why') currentArticle.why.push(trimmed);
                            else if (currentSection === 'how') currentArticle.how.push(trimmed);
                            else if (currentSection === 'memo') currentArticle.memo.push(trimmed);
                            else currentArticle.other.push(trimmed);
                          }
                        }
                        if (currentArticle.other.length > 0 || currentArticle.what.length > 0 || currentArticle.why.length > 0) {
                          articles.push(currentArticle);
                        }

                        // fallback title
                        if (articles.length === 1 && articles[0].title === '기록 내용' && record.headlines_text) {
                          const firstTitle = record.headlines_text.split('\n').filter(Boolean)[0];
                          if (firstTitle) {
                            articles[0].title = firstTitle.replace(/^(\(\d+\)|\[\d+\]|\{\d+\}|\d+\.|\d+\))\s*/, '').trim();
                          }
                        }

                        return (
                          <div key={record.id} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {articles.map((art, idx) => (
                              <Card key={idx} style={{ padding: '1.25rem' }}>
                                <h4 style={{ fontSize: '1.125rem', margin: '0 0 1rem 0', color: 'var(--primary-color)', lineHeight: 1.4 }}>
                                  {art.title}
                                </h4>
                                
                                {art.what.length > 0 && (
                                  <div style={{ marginBottom: '0.75rem' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>What</span>
                                    <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginTop: '0.25rem', lineHeight: 1.5 }}>
                                      {art.what.filter(Boolean).map((t, i) => <div key={i}>{t.startsWith('-') ? t : `- ${t}`}</div>)}
                                    </div>
                                  </div>
                                )}
                                
                                {art.why.length > 0 && (
                                  <div style={{ marginBottom: '0.75rem' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Why</span>
                                    <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginTop: '0.25rem', lineHeight: 1.5 }}>
                                      {art.why.filter(Boolean).map((t, i) => <div key={i}>{t.startsWith('-') ? t : `- ${t}`}</div>)}
                                    </div>
                                  </div>
                                )}
                                
                                {art.how.length > 0 && (
                                  <div style={{ marginBottom: '0.75rem' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>How</span>
                                    <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginTop: '0.25rem', lineHeight: 1.5 }}>
                                      {art.how.filter(Boolean).map((t, i) => <div key={i}>{t.startsWith('-') ? t : `- ${t}`}</div>)}
                                    </div>
                                  </div>
                                )}
                                
                                {art.memo.length > 0 && (
                                  <div style={{ marginBottom: '0.75rem', background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>📝 메모</span>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginTop: '0.25rem', lineHeight: 1.5 }}>
                                      {art.memo.filter(Boolean).map((t, i) => <div key={i}>{t.startsWith('-') ? t : `- ${t}`}</div>)}
                                    </div>
                                  </div>
                                )}
                                
                                {art.other.length > 0 && (
                                  <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                                    {art.other.join('\n')}
                                  </div>
                                )}
                              </Card>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {isVacationModalOpen && (
        <VacationModal 
          vacations={vacations}
          onClose={() => setIsVacationModalOpen(false)}
          onAdd={addVacation}
          onUpdate={updateVacation}
          onDelete={deleteVacation}
        />
      )}
    </div>
  );
};

export default CalendarView;
