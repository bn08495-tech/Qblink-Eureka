import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://fvhkpxxahpcofhasfukc.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2aGtweHhhaHBjb2ZoYXNmdWtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyMzgxMjksImV4cCI6MjA5MTgxNDEyOX0.OPGzemBq95oOZUd3MRGJe-gL7f_sofI-YaqL_dbeQ0E";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});