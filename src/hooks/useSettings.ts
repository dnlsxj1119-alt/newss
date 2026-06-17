import { useState, useEffect, useCallback } from 'react';
import type { Member } from '../types';

const DEFAULT_MEMBERS: Member[] = [
  { profile_id: 'user1', display_name: '사용자 A' },
  { profile_id: 'user2', display_name: '사용자 B' }
];

export const useSettings = () => {
  const [members, setMembers] = useState<Member[]>(DEFAULT_MEMBERS);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = useCallback(() => {
    setIsLoading(true);
    try {
      const savedMembers = localStorage.getItem('app_members');
      if (savedMembers) {
        const parsed = JSON.parse(savedMembers);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (typeof parsed[0] === 'string') {
            // Backward compatibility
            const upgraded = parsed.map((name, index) => ({
              profile_id: `user${index + 1}`,
              display_name: name
            }));
            setMembers(upgraded);
            localStorage.setItem('app_members', JSON.stringify(upgraded));
          } else {
            setMembers(parsed);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching settings from localStorage:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSetting = async (key: string, value: any) => {
    try {
      if (key === 'members') {
        localStorage.setItem('app_members', JSON.stringify(value));
        setMembers(value);
      } else {
        localStorage.setItem(`app_setting_${key}`, JSON.stringify(value));
      }
      return { success: true };
    } catch (err: any) {
      console.error(`Error updating setting ${key}:`, err);
      return { success: false, error: err.message };
    }
  };

  return {
    members,
    isLoading,
    updateSetting,
    refreshSettings: fetchSettings
  };
};

