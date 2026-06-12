import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, List, Calendar, Settings } from 'lucide-react';
import styles from './BottomNav.module.css';

const BottomNav: React.FC = () => {
  const navItems = [
    { to: '/', icon: <Home size={24} />, label: '홈' },
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
