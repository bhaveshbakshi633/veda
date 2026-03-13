import { createClient, SupabaseClient } from "@supabase/supabase-js";

// lazy init — build ke time env vars nahi hoti, runtime pe milti hain
let _anonClient: SupabaseClient | null = null;

function getEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey) {
    throw new Error(
      "Missing Supabase environment variables. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }
  return { url, anonKey };
}

// Client-side Supabase client (anon key — RLS enforced)
export function getSupabase() {
  if (!_anonClient) {
    const { url, anonKey } = getEnv();
    _anonClient = createClient(url, anonKey);
  }
  return _anonClient;
}

// backward compat — lazy getter
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return (getSupabase() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

// Server-side Supabase client (service role — bypasses RLS, used in API routes only)
export function getServiceClient() {
  const { url } = getEnv();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!serviceKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY for server operations.");
  }
  return createClient(url, serviceKey);
}
