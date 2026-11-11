"use server";

import { randomBytes } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

const destinations: Record<string, string> = { admin: "/admin", receptionist: "/reception", staff: "/staff", patient: "/patient" };

export async function signInPortal(identifier: string, password: string) {
  const value = identifier.trim();
  if (!value || !password) return { error: "Enter your username and password." };
  const supabase = await createClient();
  let credentials: { email: string; password: string } | { phone: string; password: string };

  if (value.includes("@")) {
    credentials = { email: value.toLowerCase(), password };
  } else if (/^[+0-9()\s-]{8,20}$/.test(value)) {
    const phone = value.replace(/[()\s-]/g, "");
    credentials = { phone: phone.startsWith("0") && phone.length === 11 ? "+234" + phone.slice(1) : phone.startsWith("234") ? "+" + phone : phone, password };
  } else {
    const admin = createAdminClient();
    const { data: profile, error } = await admin.from("user_profiles")
      .select("email,phone,is_active").eq("login_username", value.toLowerCase()).maybeSingle();
    if (error || !profile || !profile.is_active || (!profile.email && !profile.phone)) {
      return { error: "Invalid username or password." };
    }
    credentials = profile.email ? { email: profile.email, password } : { phone: profile.phone!, password };
  }

  const { error: signInError } = await supabase.auth.signInWithPassword(credentials);
  if (signInError) return { error: "Invalid username or password." };

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    await supabase.auth.signOut();
    return { error: "Unable to verify this account. Please try again." };
  }

  const role = String(user.app_metadata?.role ?? "");
  const hospitalId = String(user.app_metadata?.hospital_id ?? "");
  const { data: profile, error: profileError } = await supabase.from("user_profiles")
    .select("role,hospital_id,is_active,must_change_password")
    .eq("auth_user_id", user.id).maybeSingle();

  if (profileError || !profile || !profile.is_active || profile.role !== role || profile.hospital_id !== hospitalId || !destinations[role]) {
    await supabase.auth.signOut();
    return { error: "This account is inactive or not authorised for Samzy HMS." };
  }
  return { destination: profile.must_change_password ? "/change-password" : destinations[role] };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function changeOwnPassword(newPassword: string, confirmPassword: string) {
  if (newPassword.length < 12) return { error: "Use at least 12 characters for your new password." };
  if (newPassword !== confirmPassword) return { error: "The passwords do not match." };
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { error: "Your session has expired. Sign in again." };
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { error: error.message };
  const admin = createAdminClient();
  const { data: profile, error: profileError } = await admin.from("user_profiles")
    .update({ must_change_password: false }).eq("auth_user_id", user.id)
    .select("hospital_id").maybeSingle();
  if (profileError || !profile) return { error: "Password changed, but account activation did not complete. Contact the administrator." };
  await admin.from("audit_logs").insert({
    hospital_id: profile.hospital_id, actor_user_id: user.id, action: "account.password_changed",
    resource_type: "user_profile", resource_id: user.id, outcome: "success", metadata: {},
  });
  const role = String(user.app_metadata?.role ?? "");
  return { destination: destinations[role] ?? "/login" };
}

export async function listPortalAccounts() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user || user.app_metadata?.role !== "admin") throw new Error("Administrator access required.");
  const { data: current, error: currentError } = await supabase.from("user_profiles")
    .select("hospital_id,is_active,must_change_password").eq("auth_user_id", user.id).maybeSingle();
  if (currentError || !current?.is_active || current.must_change_password || user.app_metadata?.hospital_id !== current.hospital_id) throw new Error("Administrator account is unavailable.");
  const admin = createAdminClient();
  const { data, error: listError } = await admin.from("user_profiles")
    .select("id,display_name,login_username,role,email,phone,is_active,must_change_password,created_at")
    .eq("hospital_id", current.hospital_id).in("role", ["admin","receptionist","staff"]).order("created_at");
  if (listError) throw new Error(listError.message);
  return data ?? [];
}

export async function createPortalAccount(input: {
  displayName: string; username: string; role: "receptionist" | "staff";
  email?: string; phone?: string; contactVerified: boolean;
}) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user || user.app_metadata?.role !== "admin") throw new Error("Administrator access required.");
  const { data: current } = await supabase.from("user_profiles")
    .select("hospital_id,is_active,must_change_password").eq("auth_user_id", user.id).maybeSingle();
  if (!current?.is_active || current.must_change_password || user.app_metadata?.hospital_id !== current.hospital_id) throw new Error("Administrator account is unavailable.");
  const username = input.username.trim().toLowerCase();
  const displayName = input.displayName.trim();
  const email = input.email?.trim().toLowerCase() || undefined;
  const phoneRaw = input.phone?.trim() || undefined;
  const phone = phoneRaw ? (phoneRaw.startsWith("0") && phoneRaw.length === 11 ? "+234" + phoneRaw.slice(1) : phoneRaw.startsWith("234") ? "+" + phoneRaw : phoneRaw) : undefined;
  if (!displayName || !/^[a-z0-9][a-z0-9._-]{2,31}$/.test(username)) throw new Error("Enter a name and a valid username (3–32 characters).");
  if (!email && !phone) throw new Error("Enter an email address or phone number.");
  if (!input.contactVerified) throw new Error("Confirm that you have verified this person's identity and contact details before creating the account.");
  const admin = createAdminClient();
  if (input.role === "staff") {
    const { count, error: countError } = await admin.from("user_profiles").select("id", { count: "exact", head: true })
      .eq("hospital_id", current.hospital_id).eq("role", "staff");
    if (countError) throw new Error(countError.message);
    if ((count ?? 0) > 0) throw new Error("The shared Staff Portal account already exists. Reset it instead of creating another.");
  }
  const temporaryPassword = randomBytes(18).toString("base64url");
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email, phone, password: temporaryPassword, email_confirm: Boolean(email), phone_confirm: Boolean(phone),
    app_metadata: { hospital_id: current.hospital_id, role: input.role },
    user_metadata: { display_name: displayName },
  });
  if (createError || !created.user) throw new Error(createError?.message ?? "Account creation failed.");
  const { error: profileError } = await admin.from("user_profiles").insert({
    hospital_id: current.hospital_id, auth_user_id: created.user.id, role: input.role,
    display_name: displayName, login_username: username, email: email ?? null, phone: phone ?? null,
    is_active: true, must_change_password: true,
  });
  if (profileError) {
    await admin.auth.admin.deleteUser(created.user.id);
    throw new Error(profileError.message);
  }
  await admin.from("audit_logs").insert({
    hospital_id: current.hospital_id, actor_user_id: user.id, action: "account.provision",
    resource_type: "user_profile", resource_id: created.user.id, outcome: "success",
    metadata: { role: input.role, username },
  });
  return { username, temporaryPassword, role: input.role };
}