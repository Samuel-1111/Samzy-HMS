import { NextResponse } from "next/server";
import { getPortalSession } from "@/lib/auth/admin-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type DiscoveredCamera = {
  id: string;
  name: string;
  host?: string;
  manufacturer?: string;
  model?: string;
  protocol?: string;
};

function isCamera(value: unknown): value is DiscoveredCamera {
  if (!value || typeof value !== "object") return false;
  const camera = value as Record<string, unknown>;
  return typeof camera.id === "string" && camera.id.length > 0 &&
    typeof camera.name === "string" && camera.name.length > 0;
}

export async function POST() {
  const session = await getPortalSession(["admin"]);
  if (!session) return NextResponse.json({ error: "Administrator sign-in is required." }, { status: 401 });

  const bridgeUrl = process.env.CCTV_DISCOVERY_BRIDGE_URL?.trim();
  const bridgeToken = process.env.CCTV_DISCOVERY_BRIDGE_TOKEN?.trim();
  if (!bridgeUrl || !bridgeToken) {
    return NextResponse.json({
      error: "Camera discovery is not connected yet. Install the Samzy CCTV discovery bridge on the hospital's local network, then configure CCTV_DISCOVERY_BRIDGE_URL and CCTV_DISCOVERY_BRIDGE_TOKEN in the server environment. A Vercel cloud function cannot directly scan private hospital-network cameras.",
    }, { status: 503 });
  }

  let target: URL;
  try {
    target = new URL(bridgeUrl);
    if (!["http:", "https:"].includes(target.protocol) || target.username || target.password) throw new Error("Invalid bridge URL");
  } catch {
    return NextResponse.json({ error: "CCTV_DISCOVERY_BRIDGE_URL must be a valid HTTP or HTTPS bridge URL." }, { status: 500 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(new URL("/discover", target), {
      method: "POST",
      headers: { Authorization: `Bearer ${bridgeToken}`, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ protocol: "onvif", discovery: "ws-discovery" }),
      cache: "no-store",
      signal: controller.signal,
    });
    const payload: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      return NextResponse.json({ error: "The hospital CCTV bridge returned an error. Check its service logs and network access." }, { status: 502 });
    }
    const data = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
    const cameras = Array.isArray(data.cameras) ? data.cameras.filter(isCamera).slice(0, 64) : [];
    return NextResponse.json({
      cameras,
      message: cameras.length ? `Discovery completed. ${cameras.length} camera device(s) reported by the local bridge.` : "Discovery completed; no compatible cameras were reported by the local bridge.",
    });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "AbortError";
    return NextResponse.json({
      error: timedOut ? "Camera discovery timed out. Check that the local bridge is online." : "The CCTV discovery bridge could not be reached. Check its network route and service status.",
    }, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }
}
