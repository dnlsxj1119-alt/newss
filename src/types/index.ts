export interface Member {
  profile_id: string;
  display_name: string;
}

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
