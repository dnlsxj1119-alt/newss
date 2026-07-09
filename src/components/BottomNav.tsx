import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, List, Calendar, Settings, Sparkles, FileSearch } from 'lucide-react';
import { useUser } from '../hooks/useUser';
import { AI_ARTICLE_ANALYSIS_ALLOWED_USER } from '../types';
import styles from './BottomNav.module.css';

const BottomNav: React.FC = () => {
  const { currentUser } = useUser();

  const navItems = [
    { to: '/', icon: <Home size={24} />, label: '홈' },
    { to: '/study', icon: <Sparkles size={24} />, label: 'AI스터디' },
    ...(currentUser === AI_ARTICLE_ANALYSIS_ALLOWED_USER
      ? [{ to: '/ai-article', icon: <FileSearch size={24} />, label: 'AI분석' }]
      : []),
    { to: '/calendar', icon: <Calendar size={24} />, label: '달력' },
    { to: '/records', icon: <List size={24} />, label: '목록' },
    { to: '/settings', icon: <Settings size={24} />, label: '설정' },
  ];

  return (
    <nav className={styles.bottomNav}>
      <div className={styles.navContainer}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => 
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
          >
            <div className={styles.iconWrapper}>{item.icon}</div>
            <span className={styles.label}>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
