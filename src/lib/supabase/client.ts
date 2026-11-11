"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { supabaseConfig } from "@/lib/supabase/config";

let browserClient: SupabaseClient<Database> | undefined;

export function createClient() {
  if (!supabaseConfig.url || !supabaseConfig.publishableKey) {
    throw new Error("Supabase browser configuration is missing.");
  }

  browserClient ??= createBrowserClient<Database>(
    supabaseConfig.url,
    supabaseConfig.publishableKey,
  );

  return browserClient;
}
