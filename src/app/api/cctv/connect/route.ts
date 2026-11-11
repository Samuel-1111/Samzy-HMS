import { NextResponse } from "next/server";
import { getPortalSession } from "@/lib/auth/admin-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await getPortalSession(["admin"]);
  if (!session) return NextResponse.json({ error: "Administrator sign-in is required." }, { status: 401 });

  const body = await request.json().catch(() => null) as { cameraId?: unknown } | null;
  if (!body || typeof body.cameraId !== "string" || !body.cameraId.trim() || body.cameraId.length > 256) {
    return NextResponse.json({ error: "A valid discovered camera identifier is required." }, { status: 400 });
  }

  const bridgeUrl = process.env.CCTV_DISCOVERY_BRIDGE_URL?.trim();
  const bridgeToken = process.env.CCTV_DISCOVERY_BRIDGE_TOKEN?.trim();
  if (!bridgeUrl || !bridgeToken) {
    return NextResponse.json({ error: "The on-premises CCTV bridge is not configured. No camera connection was attempted." }, { status: 503 });
  }

  let target: URL;
  try {
    target = new URL(bridgeUrl);
    if (!["http:", "https:"].includes(target.protocol) || target.username || target.password) throw new Error("Invalid URL");
  } catch {
    return NextResponse.json({ error: "CCTV_DISCOVERY_BRIDGE_URL is invalid." }, { status: 500 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(new URL("/connect", target), {
      method: "POST",
      headers: { Authorization: `Bearer ${bridgeToken}`, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ cameraId: body.cameraId }),
      cache: "no-store",
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => null) as { connected?: unknown; message?: unknown } | null;
    if (!response.ok || payload?.connected !== true) {
      return NextResponse.json({ error: typeof payload?.message === "string" ? payload.message : "The local bridge could not verify a connection to this camera." }, { status: 502 });
    }
    return NextResponse.json({ connected: true, message: "The local bridge confirmed camera connectivity. A live video stream still requires a separately configured, secured video gateway." });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "AbortError";
    return NextResponse.json({ error: timedOut ? "Camera connection check timed out." : "The local CCTV bridge could not be reached." }, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }
}
