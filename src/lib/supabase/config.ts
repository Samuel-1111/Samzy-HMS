// Browser and SSR clients require a NEXT_PUBLIC_ URL because the browser
// cannot read server-only SUPABASE_URL. The publishable key is explicitly
// exposed by next.config.ts because it is designed to be public.
export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  publishableKey: process.env.SUPABASE_PUBLISHABLE_KEY ?? "",
};

export const isSupabaseConfigured = Boolean(
  supabaseConfig.url && supabaseConfig.publishableKey,
);
