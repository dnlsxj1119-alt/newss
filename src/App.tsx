import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { useUser } from './hooks/useUser';

// Pages
import UserSelect from './pages/UserSelect';
import Home from './pages/Home';
import RecordForm from './pages/RecordForm';
import RecordList from './pages/RecordList';
import Settings from './pages/Settings';

const App: React.FC = () => {
  const { currentUser, isLoading } = useUser();

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
