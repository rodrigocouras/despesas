import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://xplimfyrnzelrxmrrbri.supabase.co";
const supabaseAnonKey = "sb_publishable_BfOTPoN4JVMI0D67N0dVzQ_QEX562j-";

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);