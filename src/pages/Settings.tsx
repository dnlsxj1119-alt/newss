import React, { useState, useEffect } from 'react';
import { useUser } from '../hooks/useUser';
import { useRecords } from '../hooks/useRecords';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Sun, Moon } from 'lucide-react';

const Settings: React.FC = () => {
  const { currentUser, logout } = useUser();
  const { records } = useRecords();
  
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [primaryColor, setPrimaryColor] = useState('#4F7DF3');

  const THEME_PRESETS = [
    { name: 'Blue', start: '#60A5FA', end: '#2563EB' },
    { name: 'Purple', start: '#A78BFA', end: '#7C3AED' },
    { name: 'Pink', start: '#F472B6', end: '#DB2777' },
    { name: 'Green', start: '#4ADE80', end: '#16A34A' },
    { name: 'Orange', start: '#FB923C', end: '#EA580C' },
    { name: 'Gray', start: '#94A3B8', end: '#475569' },
  ];

  useEffect(() => {
    // Check local storage or body attribute
    const theme = document.documentElement.getAttribute('data-theme');
    setIsDarkMode(theme !== 'light');

    const savedColor = localStorage.getItem('primaryColor') || '#4F7DF3';
    setPrimaryColor(savedColor);
  }, []);

  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setIsDarkMode(!isDarkMode);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handleColorChange = (start: string, end: string) => {
    setPrimaryColor(end);
    localStorage.setItem('primaryStart', start);
    localStorage.setItem('primaryEnd', end);
    localStorage.setItem('primaryColor', end);
    
    document.documentElement.style.setProperty('--primary-gradient-start', start);
    document.documentElement.style.setProperty('--primary-gradient-end', end);
    document.documentElement.style.setProperty('--primary-gradient', `linear-gradient(135deg, ${start}, ${end})`);
    document.documentElement.style.setProperty('--primary-color', end);
    
    const hexToRgb = (h: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(h);
      return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '37, 99, 235';
    };
    document.documentElement.style.setProperty('--primary-color-rgb', hexToRgb(end));
  };

  const resetThemeColor = () => {
    handleColorChange('#60A5FA', '#2563EB');
  };

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
        <h3 style={{ fontSize: '1.125rem', marginTop: 0, marginBottom: '1rem' }}>계정 및 테마</h3>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>현재 사용자</p>
            <p style={{ margin: '0.25rem 0 0 0', fontWeight: 600 }}>{currentUser}</p>
          </div>
          <Button variant="outline" size="sm" onClick={logout}>
            사용자 변경
          </Button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <div>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>화면 모드</p>
            <p style={{ margin: '0.25rem 0 0 0', fontWeight: 500 }}>{isDarkMode ? '다크 모드' : '라이트 모드'}</p>
          </div>
          <Button variant="ghost" onClick={toggleTheme} style={{ padding: '0.5rem' }}>
            {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
          </Button>
        </div>
      </Card>

      <Card style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.125rem', margin: 0 }}>테마 색상</h3>
          <Button variant="ghost" size="sm" onClick={resetThemeColor} style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
            기본값으로 되돌리기
          </Button>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
          {THEME_PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => handleColorChange(preset.start, preset.end)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-secondary)',
                border: primaryColor.toLowerCase() === preset.end.toLowerCase() 
                  ? `2px solid ${preset.end}` 
                  : '2px solid transparent',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: `linear-gradient(135deg, ${preset.start}, ${preset.end})` }} />
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>{preset.name}</span>
            </button>
          ))}
        </div>
      </Card>



      <Card>
        <h3 style={{ fontSize: '1.125rem', marginTop: 0, marginBottom: '1rem' }}>데이터 관리</h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          작성한 모든 기록을 JSON 파일로 백업할 수 있습니다.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Button variant="outline" fullWidth onClick={handleExport}>
            기록 백업하기 (JSON 내보내기)
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Settings;
