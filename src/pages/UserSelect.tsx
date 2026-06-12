import React, { useState } from 'react';
import { useUser } from '../hooks/useUser';
import { useSettings } from '../hooks/useSettings';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const UserSelect: React.FC = () => {
  const { login } = useUser();
  const { members, updateSetting } = useSettings();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editMembers, setEditMembers] = useState(members);
  const [isSaving, setIsSaving] = useState(false);

  const handleLogin = (username: string) => {
    login(username);
  };

  const handleMemberChange = (index: number, val: string) => {
    const newMems = [...editMembers];
    newMems[index] = val;
    setEditMembers(newMems);
  };

  const saveMembers = async () => {
    if (editMembers.some(m => !m.trim())) {
      alert('이름을 비울 수 없습니다.');
      return;
    }
    setIsSaving(true);
    const result = await updateSetting('members', editMembers);
    setIsSaving(false);
    
    if (result.success) {
      setIsEditing(false);
    } else {
      alert(`이름 저장 중 오류가 발생했습니다: ${result.error}`);
    }
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
        {isEditing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: 'var(--text-primary)', textAlign: 'center' }}>사용자 이름 수정</h3>
            <Input 
              value={editMembers[0] || ''}
              onChange={(e) => handleMemberChange(0, e.target.value)}
              placeholder="첫 번째 사용자"
            />
            <Input 
              value={editMembers[1] || ''}
              onChange={(e) => handleMemberChange(1, e.target.value)}
              placeholder="두 번째 사용자"
            />
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <Button variant="outline" fullWidth onClick={() => { setIsEditing(false); setEditMembers(members); }}>
                취소
              </Button>
              <Button variant="primary" fullWidth onClick={saveMembers} disabled={isSaving}>
                {isSaving ? '저장중' : '저장'}
              </Button>
            </div>
          </div>
        ) : (
          <>
            {members.map(member => (
              <Button 
                key={member}
                size="lg" 
                variant="secondary"
                onClick={() => handleLogin(member)}
                style={{ 
                  height: '4rem', 
                  fontSize: '1.125rem', 
                  fontWeight: 600,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                {member}
              </Button>
            ))}
            
            <button 
              onClick={() => { setIsEditing(true); setEditMembers(members); }}
              style={{
                marginTop: '1.5rem',
                background: 'none',
                border: 'none',
                color: 'var(--text-tertiary)',
                fontSize: '0.875rem',
                textDecoration: 'underline',
                cursor: 'pointer'
              }}
            >
              사용자 이름 변경하기
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default UserSelect;
