export interface Member {
  profile_id: string;
  display_name: string;
}

export const MEMBERS: Member[] = [
  { profile_id: '다연', display_name: '다연' },
  { profile_id: '예본', display_name: '예본' }
];

export interface StudyRecord {
  id: string;
  date: string; // YYYY-MM-DD
  member_name: string; // Note: stores profile_id (e.g., 'user1') instead of display_name
  raw_text: string;
  headlines_text: string;
  is_included: boolean;
  created_at: string;
  updated_at: string;
}

export interface VacationPeriod {
  id: string;
  start_date: string;
  end_date: string;
  memo?: string;
  created_at: string;
}

export interface VacationDay {
  id: string;
  date: string; // YYYY-MM-DD
  reason?: string;
  created_at: string;
}

export interface AppSettings {
  key: string;
  value: any;
  updated_at: string;
}
