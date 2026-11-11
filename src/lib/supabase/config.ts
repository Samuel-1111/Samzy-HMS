// Browser and SSR clients require a NEXT_PUBLIC_ URL because the browser
// cannot read server-only SUPABASE_URL. Set both URL variables to the same
// Supabase Project URL in Vercel.
export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
};

export const isSupabaseConfigured = Boolean(
  supabaseConfig.url && supabaseConfig.publishableKey,
);
