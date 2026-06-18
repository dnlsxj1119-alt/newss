import { useCallback } from 'react';

export const useSettings = () => {
  const fetchSettings = useCallback(() => {
    // Only kept for backwards compatibility of other settings if added later
  }, []);

  const updateSetting = async (key: string, value: any) => {
    try {
      localStorage.setItem(`app_setting_${key}`, JSON.stringify(value));
      return { success: true };
    } catch (err: any) {
      console.error(`Error updating setting ${key}:`, err);
      return { success: false, error: err.message };
    }
  };

  return {
    updateSetting,
    refreshSettings: fetchSettings
  };
};
