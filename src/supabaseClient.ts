import { createClient } from "@supabase/supabase-js";

// TODO: Replace with your actual Supabase project URL and anon key
const SUPABASE_URL = "https://pswkfhvcwuziqswlgbdz.supabase.co";
const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzd2tmaHZjd3V6aXFzd2xnYmR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5MTIzNzMsImV4cCI6MjA3ODQ4ODM3M30.9cWYGDbhaTOtWOTpH_uVW8Jl4nwArpKHbZR0BK2Qlfk";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
