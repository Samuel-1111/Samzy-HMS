import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export type PortalRole = "admin" | "receptionist" | "staff" | "patient";
const COOKIE_NAME = "samzy_hms_portal_session";
const SESSION_SECONDS = 60 * 60 * 8;
const ENV_KEYS: Record<PortalRole, { username: string[]; password: string[] }> = {
  admin: { username: ["admin_username", "ADMIN_USERNAME"], password: ["admin_password", "ADMIN_PASSWORD"] },
  receptionist: { username: ["receptionist_username", "RECEPTIONIST_USERNAME"], password: ["receptionist_password", "RECEPTIONIST_PASSWORD"] },
  staff: { username: ["staff_username", "STAFF_USERNAME"], password: ["staff_password", "STAFF_PASSWORD"] },
  patient: { username: ["patient_username", "PATIENT_USERNAME"], password: ["patient_password", "PATIENT_PASSWORD"] },
};
const firstEnv = (keys: string[]) => keys.map((key) => process.env[key]).find((value) => typeof value === "string" && value.length > 0) ?? "";
function credentials(role: PortalRole) {
  const keys = ENV_KEYS[role];
  return { username: firstEnv(keys.username).trim().toLowerCase(), password: firstEnv(keys.password) };
}
function signingKey(role: PortalRole) {
  const configured = credentials(role);
  if (!configured.username || !configured.password) return null;
  return createHmac("sha256", configured.password).update(`samzy-hms-session:v2:${role}:${configured.username}`).digest();
}
function signature(payload: string, key: Buffer) {
  return createHmac("sha256", key).update(payload).digest("base64url");
}
export function portalCredentialsStatus(role: PortalRole) {
  const configured = credentials(role);
  return { configured: Boolean(configured.username && configured.password), username: Boolean(configured.username), password: Boolean(configured.password) };
}
export function verifyPortalCredentials(role: PortalRole, username: string, password: string) {
  const configured = credentials(role);
  if (!configured.username || !configured.password) return false;
  const userMatches = username.trim().toLowerCase() === configured.username;
  const supplied = Buffer.from(password, "utf8");
  const expected = Buffer.from(configured.password, "utf8");
  const passwordMatches = supplied.length === expected.length && timingSafeEqual(supplied, expected);
  return userMatches && passwordMatches;
}
export async function createPortalSession(role: PortalRole, username: string) {
  const key = signingKey(role);
  if (!key) throw new Error(`PORTAL_CREDENTIALS_NOT_CONFIGURED:${role}`);
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(JSON.stringify({ sub: username.trim().toLowerCase(), role, iat: now, exp: now + SESSION_SECONDS })).toString("base64url");
  const token = `${payload}.${signature(payload, key)}`;
  const store = await cookies();
  store.set(COOKIE_NAME, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: SESSION_SECONDS });
}
export async function getPortalSession(allowedRoles?: PortalRole[]) {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const [payload, supplied, extra] = token.split(".");
  if (!payload || !supplied || extra) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { sub?: string; role?: PortalRole; exp?: number };
    if (!data.role || !["admin", "receptionist", "staff", "patient"].includes(data.role)) return null;
    if (allowedRoles && !allowedRoles.includes(data.role)) return null;
    const configured = credentials(data.role);
    const key = signingKey(data.role);
    if (!key || !configured.username || data.sub !== configured.username || typeof data.exp !== "number" || data.exp <= Math.floor(Date.now() / 1000)) return null;
    const expected = Buffer.from(signature(payload, key), "base64url");
    const actual = Buffer.from(supplied, "base64url");
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
    return { username: data.sub, role: data.role };
  } catch { return null; }
}
export async function clearPortalSession() {
  const store = await cookies();
  store.set(COOKIE_NAME, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
}
