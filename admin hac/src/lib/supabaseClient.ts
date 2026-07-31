import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseKey);

import { supabase } from "@/lib/supabaseClient";

// Fetch all admins
export const fetchAdmins = async () => {
  const { data, error } = await supabase.from("admin_login").select("*");
  if (error) throw error;
  return data;
};

// Fetch all employees
export const fetchEmployees = async () => {
  const { data, error } = await supabase.from("employee_login").select("*");
  if (error) throw error;
  return data;
};
