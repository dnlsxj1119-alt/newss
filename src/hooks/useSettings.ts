import { useState, useEffect, useCallback } from 'react';

const DEFAULT_MEMBERS = ["사용자 A", "사용자 B"];

export const useSettings = () => {
  const [members, setMembers] = useState<string[]>(DEFAULT_MEMBERS);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = useCallback(() => {
    setIsLoading(true);
    try {
      const savedMembers = localStorage.getItem('app_members');
      if (savedMembers) {
        setMembers(JSON.parse(savedMembers));
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

