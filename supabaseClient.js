import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://inyhqqjkwzyjhjmwimtz.supabase.co";

const supabaseKey = "sb_publishable_ADeZZ_PPdKhvrxsOFV-Sgw_rgltKK4_";

export const supabase = createClient(supabaseUrl, supabaseKey);
