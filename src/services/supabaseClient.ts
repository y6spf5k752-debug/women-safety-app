import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://imudneenrdxxglvjrxip.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltdWRuZWVucmR4eGdsdmpyeGlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3ODQ5NDMsImV4cCI6MjA4NzM2MDk0M30.JVrBwsniPAcHiha2IvdQ-gpOz14K2dNLbDWhk-lRRvg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
