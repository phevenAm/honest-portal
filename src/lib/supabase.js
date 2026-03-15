import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
// These are read from your .env.local file
// On Netlify you'll set these in Site Settings → Environment Variables
export const supabase = createClient(supabaseUrl, supabaseAnonKey);