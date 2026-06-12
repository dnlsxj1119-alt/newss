import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const DEFAULT_MEMBERS = ["사용자 A", "사용자 B"];

export const useSettings = () => {
  const [members, setMembers] = useState<string[]>(DEFAULT_MEMBERS);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('app_settings').select('*');
      if (error) throw error;

      if (data) {
        const memSetting = data.find(s => s.key === 'members');
        if (memSetting) setMembers(memSetting.value);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSetting = async (key: string, value: any) => {
    try {
      const { error } = await supabase
        .from('app_settings')
        .upsert({ key, value, updated_at: new Date().toISOString() });
        
      if (error) throw error;
      await fetchSettings();
      return true;
    } catch (err) {
      console.error(`Error updating setting ${key}:`, err);
      return false;
    }
  };

  return {
    members,
    isLoading,
    updateSetting,
    refreshSettings: fetchSettings
  };
};
