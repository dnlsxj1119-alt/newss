import { useState, useEffect } from 'react';

const USER_KEY = 'news_study_user';

export const useUser = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let storedUser = localStorage.getItem(USER_KEY);
    if (storedUser === 'user1') {
      storedUser = '다연';
      localStorage.setItem(USER_KEY, storedUser);
    } else if (storedUser === 'user2') {
      storedUser = '예본';
      localStorage.setItem(USER_KEY, storedUser);
    }
    
    if (storedUser) {
      setCurrentUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const login = (profileId: string) => {
    localStorage.setItem(USER_KEY, profileId);
    setCurrentUser(profileId);
    window.location.href = '/';
  };

  const logout = () => {
    localStorage.removeItem(USER_KEY);
    setCurrentUser(null);
    window.location.href = '/select-user';
  };

  return { currentUser, login, logout, isLoading };
};
