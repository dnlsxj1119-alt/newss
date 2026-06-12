import React, { useState, useEffect, useMemo } from 'react';
import { useRecords } from '../hooks/useRecords';
import { useSettings } from '../hooks/useSettings';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays 
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CalendarView: React.FC = () => {
  const { records, fetchRecords } = useRecords();
  const { members } = useSettings();
  
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords, currentDate]);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  // Map records by date string (yyyy-MM-dd)
  const recordsByDate = useMemo(() => {
    const map: Record<string, any[]> = {};
    records.forEach(r => {
      if (!map[r.date]) map[r.date] = [];
      map[r.date].push(r);
    });
    return map;
  }, [records]);

  // Calendar generation logic
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const renderHeader = () => {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <Button variant="ghost" onClick={prevMonth} style={{ padding: '0.5rem' }}>
          <ChevronLeft />
        </Button>
        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>
          {format(currentDate, 'yyyy년 M월')}
        </h2>
        <Button variant="ghost" onClick={nextMonth} style={{ padding: '0.5rem' }}>
          <ChevronRight />
        </Button>
      </div>
    );
  };

  const renderDays = () => {
    const days = [];
    const date = ['일', '월', '화', '수', '목', '금', '토'];

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} style={{ textAlign: 'center', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-tertiary)', paddingBottom: '0.5rem' }}>
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
        
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isToday = isSameDay(day, today);

        days.push(
          <div
            key={day.toString()}
            style={{
              padding: '0.5rem 0.25rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: isToday ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
              borderRadius: 'var(--radius-md)',
              opacity: isCurrentMonth ? 1 : 0.3,
              minHeight: '60px'
            }}
          >
            <span style={{ 
              fontSize: '0.875rem', 
              color: isToday ? 'var(--accent-primary)' : 'var(--text-primary)',
              fontWeight: isToday ? 700 : 400,
              marginBottom: '4px'
            }}>
              {formattedDate}
            </span>
            {/* Markers for members */}
            <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {members.map((member, idx) => {
                const hasRecorded = dayRecords.some(r => r.member_name === member);
                if (!hasRecorded) return null;
                const dotColor = idx === 0 ? 'var(--accent-primary)' : 'var(--success)';
                return (
                  <div 
                    key={member}
                    title={member}
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: dotColor
                    }}
                  />
                );
              })}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '2px' }}>
          {days}
        </div>
      );
      days = [];
    }
    return <div>{rows}</div>;
  };

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <header style={{ marginBottom: '1.5rem' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
          날짜별로 누가 기록을 남겼는지 확인할 수 있습니다.
        </p>
      </header>

      <Card style={{ marginBottom: '2rem', padding: '1rem' }}>
        {renderHeader()}
        {renderDays()}
        {renderCells()}
      </Card>
      
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        {members.map((member, idx) => (
          <div key={member} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: idx === 0 ? 'var(--accent-primary)' : 'var(--success)' }} />
            {member}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarView;
