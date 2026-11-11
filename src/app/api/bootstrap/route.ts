import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { bootstrapHospital } from "@/lib/supabase/bootstrap";
import type { Json } from "@/types/database";

export const dynamic = "force-dynamic";
type BootstrapPayload = {
  slug?: string; legalName?: string; displayName?: string; timezone?: string;
  phone?: string; email?: string; address?: Json;
  initialAdmin?: { displayName?: string; loginUsername?: string; password?: string; email?: string; phone?: string; emailVerified?: boolean; phoneVerified?: boolean };
};
function isAuthorized(request: NextRequest) {
  const expected = process.env.HMS_BOOTSTRAP_TOKEN ?? "";
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!expected || expected.length < 32) return false;
  const suppliedBytes = Buffer.from(supplied), expectedBytes = Buffer.from(expected);
  return suppliedBytes.length === expectedBytes.length && timingSafeEqual(suppliedBytes, expectedBytes);
}
export async function POST(request: NextRequest) {
  if (!process.env.HMS_BOOTSTRAP_TOKEN) return NextResponse.json({ error: "Bootstrap is disabled." }, { status: 404 });
  if (!isAuthorized(request)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  try {
    const admin = createAdminClient();
    const { count, error: countError } = await admin.from("hospitals").select("id", { count: "exact", head: true });
    if (countError) throw countError;
    if ((count ?? 0) > 0) return NextResponse.json({ error: "A hospital tenant already exists. Bootstrap is one-time only." }, { status: 409 });
    const payload = (await request.json()) as BootstrapPayload;
    const required = [payload.slug, payload.legalName, payload.displayName, payload.initialAdmin?.displayName, payload.initialAdmin?.password];
    if (required.some((value) => !value?.trim())) return NextResponse.json({ error: "Hospital details and initial administrator credentials are required." }, { status: 400 });
    if (payload.initialAdmin?.loginUsername !== "administrator") return NextResponse.json({ error: "The initial administrator username must be administrator." }, { status: 400 });
    if (!payload.initialAdmin?.email && !payload.initialAdmin?.phone) return NextResponse.json({ error: "A verified administrator recovery email or phone is required." }, { status: 400 });
    if (!(payload.initialAdmin.email && payload.initialAdmin.emailVerified) && !(payload.initialAdmin.phone && payload.initialAdmin.phoneVerified)) return NextResponse.json({ error: "Verify the initial administrator contact outside the system before activating the account." }, { status: 400 });
    if ((payload.initialAdmin.password ?? "").length < 12) return NextResponse.json({ error: "The temporary password must contain at least 12 characters." }, { status: 400 });
    if (!/^[a-z0-9-]{3,50}$/.test(payload.slug ?? "")) return NextResponse.json({ error: "Hospital slug must be 3–50 lowercase letters, numbers or hyphens." }, { status: 400 });
    const created = await bootstrapHospital({
      slug: payload.slug!, legalName: payload.legalName!, displayName: payload.displayName!,
      timezone: payload.timezone, phone: payload.phone, email: payload.email, address: payload.address,
      initialAdmin: {
        displayName: payload.initialAdmin!.displayName!, loginUsername: "administrator",
        password: payload.initialAdmin!.password!, email: payload.initialAdmin!.email,
        phone: payload.initialAdmin!.phone, emailVerified: payload.initialAdmin!.emailVerified,
        phoneVerified: payload.initialAdmin!.phoneVerified,
      },
    });
    return NextResponse.json({ status: "created", ...created }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Hospital bootstrap failed." }, { status: 500 });
  }
}