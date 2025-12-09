import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nmonkhjfqnjhqkkynnwu.supabase.co';
const supabaseKey = 'sb_publishable_fzs7Hsq3hrNSZ7jMnLXg9g_zCM5euRX';

export const supabase = createClient(supabaseUrl, supabaseKey);