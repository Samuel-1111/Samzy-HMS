import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "samzy_hms_admin_session";
const SESSION_SECONDS = 60 * 60 * 8;

function configuredCredentials() {
  return {
    username: (process.env.admin_username || process.env.ADMIN_USERNAME || "").trim().toLowerCase(),
    password: process.env.admin_password || process.env.ADMIN_PASSWORD || "",
  };
}

function signingKey() {
  const credentials = configuredCredentials();
  if (!credentials.username || !credentials.password) return null;
  // Deriving the signing key from the server-only password means no third
  // environment variable is required. Changing the password invalidates sessions.
  return createHmac("sha256", credentials.password)
    .update(`samzy-hms-session:v1:${credentials.username}`)
    .digest();
}

function sign(payload: string, key: Buffer) {
  return createHmac("sha256", key).update(payload).digest("base64url");
}

export function verifyAdminCredentials(username: string, password: string) {
  const configured = configuredCredentials();
  if (!configured.username || !configured.password) return false;
  const suppliedUsername = username.trim().toLowerCase();
  const suppliedPassword = Buffer.from(password, "utf8");
  const expectedPassword = Buffer.from(configured.password, "utf8");
  return suppliedUsername === configured.username
    && suppliedPassword.length === expectedPassword.length
    && timingSafeEqual(suppliedPassword, expectedPassword);
}

export async function createAdminSession(username: string) {
  const key = signingKey();
  if (!key) throw new Error("HMS_ADMIN_CREDENTIALS_NOT_CONFIGURED");
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(JSON.stringify({
    sub: username.trim().toLowerCase(),
    role: "admin",
    iat: now,
    exp: now + SESSION_SECONDS,
  })).toString("base64url");
  const token = `${payload}.${sign(payload, key)}`;
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
}

export async function getAdminSession() {
  const key = signingKey();
  if (!key) return null;
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const [payload, suppliedSignature, extra] = token.split(".");
  if (!payload || !suppliedSignature || extra) return null;
  const expectedSignature = Buffer.from(sign(payload, key), "base64url");
  const actualSignature = Buffer.from(suppliedSignature, "base64url");
  if (actualSignature.length !== expectedSignature.length || !timingSafeEqual(actualSignature, expectedSignature)) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      sub?: string; role?: string; exp?: number;
    };
    const configured = configuredCredentials();
    if (session.role !== "admin" || session.sub !== configured.username
      || typeof session.exp !== "number" || session.exp <= Math.floor(Date.now() / 1000)) return null;
    return { username: session.sub, role: "admin" as const };
  } catch {
    return null;
  }
}

export async function clearAdminSession() {
  const store = await cookies();
  store.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
