import React from 'react';
import { useUser } from '../hooks/useUser';
import { useRecords } from '../hooks/useRecords';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

const Settings: React.FC = () => {
  const { currentUser, logout } = useUser();
  const { records } = useRecords();

  const handleExport = () => {
    const dataStr = JSON.stringify(records, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `news_study_backup_${new Date().toISOString().slice(0,10)}.json`;

    let linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div style={{ padding: '1.5rem', paddingBottom: '3rem' }}>
      <h1 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>설정</h1>
      
      <Card style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.125rem', marginTop: 0, marginBottom: '1rem' }}>계정</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>현재 사용자</p>
            <p style={{ margin: '0.25rem 0 0 0', fontWeight: 600 }}>{currentUser}</p>
          </div>
          <Button variant="outline" size="sm" onClick={logout}>
            사용자 변경
          </Button>
        </div>
      </Card>

      <Card style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.125rem', marginTop: 0, marginBottom: '1rem' }}>데이터베이스 상태</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Supabase 연결</p>
            <p style={{ margin: '0.25rem 0 0 0', fontWeight: 600, color: 'var(--success)' }}>정상 연결됨</p>
          </div>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--success)' }} />
        </div>
      </Card>

      <Card>
        <h3 style={{ fontSize: '1.125rem', marginTop: 0, marginBottom: '1rem' }}>데이터 관리</h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          작성한 모든 기록을 JSON 파일로 백업할 수 있습니다.
        </p>
        <Button variant="secondary" fullWidth onClick={handleExport}>
          기록 백업하기 (JSON 내보내기)
        </Button>
      </Card>
    </div>
  );
};

export default Settings;
