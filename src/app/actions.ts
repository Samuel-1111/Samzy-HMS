"use server";

import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { clearPortalSession, getPortalSession, type PortalRole } from "@/lib/auth/admin-session";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const destinations: Record<string, string> = { admin: "/admin", receptionist: "/reception", staff: "/staff", patient: "/patient" };
export async function signInPortal(role: PortalRole, username: string, password: string) {
  if (!["admin", "receptionist", "staff", "patient"].includes(role)) return { error: "Select a valid portal." };
  if (role === "patient") return { error: "Individual patient accounts are not ready yet. Patient access remains locked until patient identities are provisioned." };
  const normalizedUsername = username.trim().toLowerCase();
  if (!normalizedUsername || !password) return { error: "Enter your username and password." };

  const admin = createAdminClient();
  const { data: profile, error: profileError } = await admin.from("user_profiles")
    .select("auth_user_id,hospital_id,role,is_active,login_username,must_change_password")
    .eq("login_username", normalizedUsername)
    .eq("role", role)
    .maybeSingle();
  if (profileError) {
    console.error("[HMS_AUTH] profile_lookup_failed", profileError.message);
    return { error: "The account directory is temporarily unavailable. Please try again." };
  }
  if (!profile || !profile.is_active) return { error: "Incorrect username or password for this portal." };

  const { data: authResult, error: authLookupError } = await admin.auth.admin.getUserById(profile.auth_user_id);
  if (authLookupError || !authResult.user) return { error: "This account is unavailable. Contact the hospital administrator." };
  const authUser = authResult.user;
  if (authUser.app_metadata?.role !== role || authUser.app_metadata?.hospital_id !== profile.hospital_id) {
    console.error("[HMS_AUTH] profile_metadata_mismatch", { userId: profile.auth_user_id, role });
    return { error: "This account is not correctly provisioned. Contact the system administrator." };
  }

  const supabase = await createClient();
  const credentials = authUser.email
    ? { email: authUser.email, password }
    : authUser.phone
      ? { phone: authUser.phone, password }
      : null;
  if (!credentials) return { error: "This account has no supported sign-in identity. Contact the administrator." };

  const { data, error } = await supabase.auth.signInWithPassword(credentials);
  if (error || !data.user) return { error: "Incorrect username or password for this portal." };
  if (data.user.id !== profile.auth_user_id) {
    await supabase.auth.signOut();
    return { error: "The authenticated account does not match this portal profile." };
  }
  const destinations: Record<PortalRole, string> = { admin: "/admin", receptionist: "/reception", staff: "/staff", patient: "/patient" };
  return { destination: profile.must_change_password ? "/account/change-password" : destinations[role] };
}


export async function getPortalAccountSetupStatus() {
  const session = await getPortalSession(["admin"]);
  if (!session) throw new Error("Administrator sign-in is required.");
  const admin = createAdminClient();
  const { data, error } = await admin.from("user_profiles")
    .select("role,is_active").eq("hospital_id", session.hospitalId);
  if (error) throw new Error(error.message);
  const rows = data ?? [];
  const status = (role: PortalRole) => ({ configured: rows.some((row) => row.role === role && row.is_active), username: rows.some((row) => row.role === role && row.is_active), password: rows.some((row) => row.role === role && row.is_active) });
  return {
    admin: status("admin"),
    receptionist: status("receptionist"),
    staff: status("staff"),
    patient: status("patient"),
    hospitalWorkspaceConfigured: true,
  };
}

export async function signOut() {
  await clearPortalSession();
  redirect("/login");
}

export async function changeOwnPassword(newPassword: string, confirmPassword: string) {
  if (newPassword.length < 12) return { error: "Use at least 12 characters for your new password." };
  if (newPassword !== confirmPassword) return { error: "The passwords do not match." };
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { error: "Your session has expired. Sign in again." };
  const admin = createAdminClient();
  const { data: current, error: currentError } = await admin.from("user_profiles")
    .select("hospital_id,login_username,is_active").eq("auth_user_id", user.id).maybeSingle();
  if (currentError || !current?.is_active) return { error: "This account is inactive or unavailable." };
  if (current.login_username && newPassword.toLowerCase() === current.login_username.toLowerCase()) {
    return { error: "Your new password must be different from your username." };
  }
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { error: error.message };
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
  if ((email || phone) && !input.contactVerified) throw new Error("Confirm that you have verified this person's identity and contact details before creating the account.");
  const authEmail = !email && !phone ? internalAuthEmail(username) : undefined;
  const admin = createAdminClient();
  if (input.role === "staff") {
    const { count, error: countError } = await admin.from("user_profiles").select("id", { count: "exact", head: true })
      .eq("hospital_id", current.hospital_id).eq("role", "staff");
    if (countError) throw new Error(countError.message);
    if ((count ?? 0) > 0) throw new Error("The shared Staff Portal account already exists. Reset it instead of creating another.");
  }
  const temporaryPassword = randomBytes(18).toString("base64url");
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: email ?? authEmail, phone, password: temporaryPassword, email_confirm: Boolean(email || authEmail), phone_confirm: Boolean(phone),
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

export async function managePortalAccount(input: { profileId: string; operation: "reset_password" | "suspend" | "reactivate" }) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user || user.app_metadata?.role !== "admin") throw new Error("Administrator access required.");
  const { data: current } = await supabase.from("user_profiles")
    .select("hospital_id,is_active,must_change_password").eq("auth_user_id", user.id).maybeSingle();
  if (!current?.is_active || current.must_change_password || user.app_metadata?.hospital_id !== current.hospital_id) throw new Error("Administrator account is unavailable.");
  const admin = createAdminClient();
  const { data: target, error: targetError } = await admin.from("user_profiles")
    .select("id,auth_user_id,role,login_username,is_active").eq("id", input.profileId)
    .eq("hospital_id", current.hospital_id).maybeSingle();
  if (targetError || !target || !["receptionist","staff"].includes(target.role)) throw new Error("Account not found or not manageable.");
  if (input.operation === "reset_password") {
    const temporaryPassword = randomBytes(18).toString("base64url");
    const { error: passwordError } = await admin.auth.admin.updateUserById(target.auth_user_id, { password: temporaryPassword });
    if (passwordError) throw new Error(passwordError.message);
    const { error: profileError } = await admin.from("user_profiles").update({ must_change_password: true }).eq("id", target.id);
    if (profileError) throw new Error(profileError.message);
    await admin.from("audit_logs").insert({ hospital_id: current.hospital_id, actor_user_id: user.id, action: "account.password_reset", resource_type: "user_profile", resource_id: target.auth_user_id, outcome: "success", metadata: { username: target.login_username } });
    return { username: target.login_username ?? "", temporaryPassword };
  }
  const active = input.operation === "reactivate";
  const { error: updateError } = await admin.from("user_profiles").update({ is_active: active }).eq("id", target.id);
  if (updateError) throw new Error(updateError.message);
  await admin.from("audit_logs").insert({ hospital_id: current.hospital_id, actor_user_id: user.id, action: active ? "account.reactivated" : "account.suspended", resource_type: "user_profile", resource_id: target.auth_user_id, outcome: "success", metadata: { username: target.login_username } });
  return { ok: true };
}
