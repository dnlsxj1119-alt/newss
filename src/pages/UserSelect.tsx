import React from 'react';
import { useUser } from '../hooks/useUser';
import { MEMBERS } from '../types';
import { Button } from '../components/ui/Button';

const UserSelect: React.FC = () => {
  const { login } = useUser();
  
  const handleLogin = (profileId: string) => {
    login(profileId);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      padding: '2rem'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
          News Study
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          기록을 시작할 사용자를 선택해주세요
        </p>
      </div>

      <div style={{ width: '100%', maxWidth: '300px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {MEMBERS.map(member => (
          <Button 
            key={member.profile_id}
            size="lg" 
            variant="secondary"
            onClick={() => handleLogin(member.profile_id)}
            style={{ 
              height: '4rem', 
              fontSize: '1.125rem', 
              fontWeight: 600,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            {member.display_name}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default UserSelect;
