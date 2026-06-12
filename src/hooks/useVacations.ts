import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { VacationPeriod } from '../types';

export const useVacations = () => {
  const [vacations, setVacations] = useState<VacationPeriod[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchVacations = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('vacation_periods')
        .select('*')
        .order('start_date', { ascending: true });

      if (error) throw error;
      if (data) setVacations(data);
    } catch (err) {
      console.error('Error fetching vacations:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVacations();
  }, [fetchVacations]);

  const addVacation = async (vacation: Omit<VacationPeriod, 'id' | 'created_at'>) => {
    try {
      const { error } = await supabase
        .from('vacation_periods')
        .insert([vacation]);
      
      if (error) throw error;
      await fetchVacations();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const updateVacation = async (id: string, vacation: Omit<VacationPeriod, 'id' | 'created_at'>) => {
    try {
      const { error } = await supabase
        .from('vacation_periods')
        .update(vacation)
        .eq('id', id);
      
      if (error) throw error;
      await fetchVacations();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const deleteVacation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('vacation_periods')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      await fetchVacations();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  return { vacations, isLoading, fetchVacations, addVacation, updateVacation, deleteVacation };
};
