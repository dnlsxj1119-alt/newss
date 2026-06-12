import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import styles from './Layout.module.css';

const Layout: React.FC = () => {
  return (
    <div className={styles.layout}>
      <main className={styles.mainContent}>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};

export default Layout;
