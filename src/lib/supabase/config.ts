// The server can use SUPABASE_URL; NEXT_PUBLIC_SUPABASE_URL remains supported
// for deployments that already expose the URL to the browser.
export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "",
  publishableKey: process.env.SUPABASE_PUBLISHABLE_KEY ?? "",
};

export const isSupabaseConfigured = Boolean(
  supabaseConfig.url && supabaseConfig.publishableKey,
);
