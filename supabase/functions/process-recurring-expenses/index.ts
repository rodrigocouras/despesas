import { createClient } from "npm:@supabase/supabase-js@2";

const respostaJson = (status: number, corpo: Record<string, unknown>) =>
  new Response(JSON.stringify(corpo), {
    status,
    headers: { "Content-Type": "application/json" },
  });

Deno.serve(async (request: Request) => {
  if (request.method !== "POST") {
    return respostaJson(405, { error: "Method not allowed" });
  }

  const cronSecret = Deno.env.get("CRON_SECRET");
  if (!cronSecret || request.headers.get("x-cron-secret") !== cronSecret) {
    return respostaJson(401, { error: "Unauthorized" });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing Supabase service environment variables.");
    return respostaJson(500, { error: "Server configuration error" });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase.rpc("processar_despesas_recorrentes");

  if (error) {
    console.error("Failed to process recurring expenses:", error);
    return respostaJson(500, { error: "Could not process recurring expenses" });
  }

  return respostaJson(200, { created: data });
});
