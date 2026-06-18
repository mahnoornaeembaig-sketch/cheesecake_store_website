import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ggfrvxubtpwmtaqivlno.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdnZnJ2eHVidHB3bXRhcWl2bG5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4MDU5ODIsImV4cCI6MjA5NzM4MTk4Mn0.Bln0l5j9RnZvKgQ7O8zrL4UiJFUmisn1dGg1qNO-dzQ";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
