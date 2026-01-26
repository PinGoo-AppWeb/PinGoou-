import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jbkhnucisqfjkbwnqfab.supabase.co';
const supabaseAnonKey = 'sb_publishable_K5YDpxSxeJtwhTKPPrikdA_dKLLu2zF';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
