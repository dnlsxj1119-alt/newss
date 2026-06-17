import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { useUser } from './hooks/useUser';

// Pages
import UserSelect from './pages/UserSelect';
import Home from './pages/Home';
import RecordForm from './pages/RecordForm';
import RecordList from './pages/RecordList';
import CalendarPage from './pages/CalendarPage';
import Settings from './pages/Settings';

const App: React.FC = () => {
  const { currentUser, isLoading } = useUser();

  // Initialize theme on app load
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }

    // Load custom primary gradient
    const savedStart = localStorage.getItem('primaryStart') || '#60A5FA';
    const savedEnd = localStorage.getItem('primaryEnd') || localStorage.getItem('primaryColor') || '#2563EB';

    document.documentElement.style.setProperty('--primary-gradient-start', savedStart);
    document.documentElement.style.setProperty('--primary-gradient-end', savedEnd);
    document.documentElement.style.setProperty('--primary-gradient', `linear-gradient(135deg, ${savedStart}, ${savedEnd})`);
    document.documentElement.style.setProperty('--primary-color', savedEnd);

    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '37, 99, 235';
    };
    document.documentElement.style.setProperty('--primary-color-rgb', hexToRgb(savedEnd));

    // Check existing localStorage data
    try {
      const recordsStr = localStorage.getItem('app_records');
      const records = recordsStr ? JSON.parse(recordsStr) : [];
      const membersStr = localStorage.getItem('app_members');
      const currentUserLocal = localStorage.getItem('news_study_user');
      
      console.log('--- LocalStorage Data Check ---');
      console.log('1. app_records count:', Array.isArray(records) ? records.length : 0);
      console.log('2. app_members:', membersStr);
      console.log('3. news_study_user:', currentUserLocal);
      console.log('-------------------------------');
    } catch (e) {
      console.error('Failed to parse localStorage data for check:', e);
    }
  }, []);

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>로딩 중...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Route */}
        <Route 
          path="/select-user" 
          element={!currentUser ? <UserSelect /> : <Navigate to="/" replace />} 
        />

        {/* Protected Routes inside Layout */}
        <Route 
          path="/" 
          element={currentUser ? <Layout /> : <Navigate to="/select-user" replace />}
        >
          <Route index element={<Home />} />
          <Route path="add" element={<RecordForm />} />
          <Route path="edit/:id" element={<RecordForm />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="records" element={<RecordList />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
