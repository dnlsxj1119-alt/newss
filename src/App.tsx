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

    // Load custom primary color
    const savedColor = localStorage.getItem('primaryColor');
    if (savedColor) {
      document.documentElement.style.setProperty('--primary-color', savedColor);
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '79, 125, 243';
      };
      document.documentElement.style.setProperty('--primary-color-rgb', hexToRgb(savedColor));
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
