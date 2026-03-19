import { createClient } from "@supabase/supabase-js";

const supabaseUrl = `https://pvhdmnolrqgbpsolqhxr.supabase.co`;
const supabaseKey = "sb_publishable_a7QogAF-79Gy_veufWVMbA_1VWZxerY";

export const supabase = createClient(supabaseUrl, supabaseKey);
