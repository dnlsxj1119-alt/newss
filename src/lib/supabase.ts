import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tzzgvesyyttgtuqksxqf.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6emd2ZXN5eXR0Z3R1cWtzeHFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExODE2MDYsImV4cCI6MjA5Njc1NzYwNn0._jNXhwdOGczxhv0BNv_jd9clb0XLI5RG19BFpLOfjkg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
