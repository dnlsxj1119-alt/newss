import React from 'react';
import CalendarView from './CalendarView';

const CalendarPage: React.FC = () => {
  return (
    <div style={{ padding: '1.5rem', paddingBottom: '3rem' }}>
      <header style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', margin: 0 }}>달력</h1>
      </header>
      <CalendarView />
    </div>
  );
};

export default CalendarPage;
