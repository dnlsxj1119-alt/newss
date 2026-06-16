import { useState, useCallback } from 'react';
import type { StudyRecord } from '../types';

export const useRecords = () => {
  const [records, setRecords] = useState<StudyRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(() => {
    setIsLoading(true);
    setError(null);
    try {
      const savedRecords = localStorage.getItem('app_records');
      let data: StudyRecord[] = savedRecords ? JSON.parse(savedRecords) : [];
      
      // Sort by date desc, then created_at desc
      data.sort((a, b) => {
        if (a.date !== b.date) {
          return a.date < b.date ? 1 : -1;
        }
        return a.created_at < b.created_at ? 1 : -1;
      });
      
      setRecords(data);
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
      const savedRecords = localStorage.getItem('app_records');
      const data: StudyRecord[] = savedRecords ? JSON.parse(savedRecords) : [];
      
      const newRecord: StudyRecord = {
        ...recordData,
        id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      data.push(newRecord);
      localStorage.setItem('app_records', JSON.stringify(data));
      
      fetchRecords();
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
      const savedRecords = localStorage.getItem('app_records');
      const data: StudyRecord[] = savedRecords ? JSON.parse(savedRecords) : [];
      
      const index = data.findIndex(r => r.id === id);
      if (index === -1) throw new Error('Record not found');
      
      data[index] = {
        ...data[index],
        ...recordData,
        updated_at: new Date().toISOString()
      };
      
      localStorage.setItem('app_records', JSON.stringify(data));
      
      fetchRecords();
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
      const savedRecords = localStorage.getItem('app_records');
      const data: StudyRecord[] = savedRecords ? JSON.parse(savedRecords) : [];
      
      const newData = data.filter(r => r.id !== id);
      localStorage.setItem('app_records', JSON.stringify(newData));
      
      fetchRecords();
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
