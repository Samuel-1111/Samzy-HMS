import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabaseConfig } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { status: "not_configured" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const response = await fetch(
      `${supabaseConfig.url.replace(/\\/$/, "")}/rest/v1/public_site_content?select=id&limit=0`,
      {
        method: "GET",
        headers: {
          apikey: supabaseConfig.publishableKey,
          Authorization: `Bearer ${supabaseConfig.publishableKey}`,
          Accept: "application/json",
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        { status: "unavailable", httpStatus: response.status },
        { status: 503, headers: { "Cache-Control": "no-store" } },
      );
    }

    return NextResponse.json(
      { status: "connected", databaseApi: "reachable" },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { status: "unreachable" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
