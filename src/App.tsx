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
      const records = recordsStr ? JSON.parse(recordsStr) : null;
      const membersStr = localStorage.getItem('app_members');
      const currentUserLocal = localStorage.getItem('news_study_user');
      
      console.log('============= LOCALSTORAGE DEBUG =============');
      console.log('1. Object.keys(localStorage):', Object.keys(localStorage));
      console.log('2. app_records:', recordsStr ? recordsStr.substring(0, 100) + '...' : 'null');
      console.log('   app_members:', membersStr);
      console.log('   news_study_user:', currentUserLocal);
      
      if (records && Array.isArray(records)) {
        console.log('3. app_records count:', records.length);
        if (records.length > 0) {
          console.log('   First record example:', records[0]);
          console.log('   member_name value in first record:', records[0].member_name);
        }
      } else {
        console.log('3. app_records is empty or invalid.');
      }
      
      console.log('4. Current selected user (news_study_user):', currentUserLocal);
      
      console.log('5. Why is it not on screen?');
      console.log('   - The app now fetches directly from Supabase (study_records table).');
      console.log('   - Because it fetches from DB, local data is completely ignored until you press the [Migrate] button.');
      console.log('   - If you press "로컬 기록을 DB로 옮기기" in Settings, it will upload these local records to DB, making them visible again.');
      console.log('==============================================');
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
