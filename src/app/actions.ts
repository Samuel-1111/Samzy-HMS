"use server";

import { randomBytes, timingSafeEqual } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { bootstrapHospital } from "@/lib/supabase/bootstrap";
import { redirect } from "next/navigation";

const destinations: Record<string, string> = { admin: "/admin", receptionist: "/reception", staff: "/staff", patient: "/patient" };
const internalAuthEmail = (username: string) => username.toLowerCase() + "@accounts.samzy-hms.invalid";

function configuredAdminCredentials() {
  return {
    username: (process.env.admin_username?.trim() || process.env.ADMIN_USERNAME?.trim() || "").trim().toLowerCase(),
    password: process.env.admin_password || process.env.ADMIN_PASSWORD || "",
  };
}

function constantTimeMatch(suppliedValue: string, expectedValue: string) {
  const supplied = Buffer.from(suppliedValue, "utf8");
  const expected = Buffer.from(expectedValue, "utf8");
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

async function provisionFirstAdminFromEnvironment(username: string, password: string) {
  const configured = configuredAdminCredentials();
  if (!configured.username || !configured.password || username.toLowerCase() !== configured.username) return false;
  if (!constantTimeMatch(password, configured.password)) return false;

  const admin = createAdminClient();
  const { count, error } = await admin.from("hospitals").select("id", { count: "exact", head: true });
  if (error) throw new Error("HMS_INITIAL_SETUP_CHECK_FAILED");
  if ((count ?? 0) > 0) return false;

  await bootstrapHospital({
    slug: "samzy-hms-test",
    legalName: "Samzy HMS Test Environment",
    displayName: "Samzy HMS Test Workspace",
    timezone: "Africa/Lagos",
    initialAdmin: {
      displayName: "Samzy HMS Administrator",
      loginUsername: configured.username,
      password: configured.password,
      authEmail: internalAuthEmail(configured.username),
    },
  });
  return true;
}

export async function signInPortal(identifier: string, password: string) {
  try {
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
      // Bootstrap is attempted before profile lookup so the first Admin does not
      // depend on an already-existing profile row.
      let bootstrapped = false;
      try {
        bootstrapped = await provisionFirstAdminFromEnvironment(value, password);
      } catch (cause) {
        console.error("[HMS_AUTH] initial_admin_bootstrap_failed", {
          code: cause instanceof Error ? cause.message : "UNKNOWN",
        });
        return { error: "The administrator account could not be initialised. Please contact the system administrator." };
      }

      if (bootstrapped) {
        credentials = { email: internalAuthEmail(value), password };
      } else {
        const admin = createAdminClient();
        const { data: profile, error } = await admin.from("user_profiles")
          .select("email,phone,login_username,is_active")
          .eq("login_username", value.toLowerCase()).maybeSingle();

        if (error || !profile || !profile.is_active) return { error: "Invalid username or password." };
        credentials = profile.email ? { email: profile.email, password }
          : profile.phone ? { phone: profile.phone, password }
          : { email: internalAuthEmail(profile.login_username ?? value), password };
      }
    }

    const { error: signInError } = await supabase.auth.signInWithPassword(credentials);
    if (signInError) return { error: "Invalid username or password." };

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      await supabase.auth.signOut();
      return { error: "Unable to verify this account. Please sign in again." };
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
  } catch (cause) {
    console.error("[HMS_AUTH] sign_in_unexpected_failure", {
      code: cause instanceof Error ? cause.message : "UNKNOWN",
    });
    return { error: "We could not complete sign-in. Please try again or contact the system administrator." };
  }
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
