import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { StudyRecord } from '../types';

export const useRecords = () => {
  const [records, setRecords] = useState<StudyRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('study_records')
        .select('*')
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setRecords(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching records:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addRecord = async (recordData: Omit<StudyRecord, 'id' | 'created_at' | 'updated_at'>) => {
    setIsLoading(true);
    setError(null);
    try {
      const { error: insertError } = await supabase
        .from('study_records')
        .insert([recordData]);

      if (insertError) throw insertError;
      await fetchRecords();
      return { success: true };
    } catch (err: any) {
      setError(err.message);
      console.error('Error adding record:', err);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const updateRecord = async (id: string, recordData: Partial<StudyRecord>) => {
    setIsLoading(true);
    setError(null);
    try {
      const { error: updateError } = await supabase
        .from('study_records')
        .update({ ...recordData, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (updateError) throw updateError;
      await fetchRecords();
      return { success: true };
    } catch (err: any) {
      setError(err.message);
      console.error('Error updating record:', err);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteRecord = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { error: deleteError } = await supabase
        .from('study_records')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      await fetchRecords();
      return true;
    } catch (err: any) {
      setError(err.message);
      console.error('Error deleting record:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    records,
    isLoading,
    error,
    fetchRecords,
    addRecord,
    updateRecord,
    deleteRecord
  };
};
