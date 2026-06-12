import React from 'react';
import { useUser } from '../hooks/useUser';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const UserSelect: React.FC = () => {
  const { login } = useUser();

  // In a real app, this might come from Supabase app_settings
  const availableUsers = ['사용자 A', '사용자 B'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', padding: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>News Study</h1>
        <p style={{ color: 'var(--text-secondary)' }}>기록을 시작할 사용자를 선택해주세요</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '300px' }}>
        {availableUsers.map(user => (
          <Card key={user} onClick={() => login(user)} className="text-center">
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>{user}</h2>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UserSelect;
