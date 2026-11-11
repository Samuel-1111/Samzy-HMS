import type { NextConfig } from "next";

// The publishable key is intentionally public. Expose this one non-secret
// variable to the client bundle so deployments can use SUPABASE_PUBLISHABLE_KEY
// without requiring the longer NEXT_PUBLIC_ environment-variable name.
const publishableKey =
  process.env.SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  "";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  env: {
    SUPABASE_PUBLISHABLE_KEY: publishableKey,
  },
};

export default nextConfig;
