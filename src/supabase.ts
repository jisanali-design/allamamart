import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://cwjdufcpvbuwjqzevzkg.supabase.co";
const RAW_KEY = "EyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3amR1ZmNwdmJ1d2pxemV2emtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyNzI1MjUsImV4cCI6MjEwNTg0ODUyNX0.QNcOQr3C_MzGIHNBxCwqnQQVV51oQLjxCaiotLpx0Gc";
// Normalize leading character to 'e' to ensure valid JWT format even if capitalized by mobile input
const SUPABASE_ANON_KEY = RAW_KEY.startsWith('EyJ') ? 'e' + RAW_KEY.slice(1) : RAW_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export default supabase;
