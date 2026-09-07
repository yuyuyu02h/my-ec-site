import "server-only";

import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

type AdminAuthResult =
  | {
      ok: true;
      user: User;
    }
  | {
      ok: false;
      status: 401 | 403;
      error: string;
    };

function getAdminEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined) {
  if (!email) {
    return false;
  }

  return getAdminEmails().includes(email.toLowerCase());
}

export async function getAdminAuthResult(): Promise<AdminAuthResult> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      ok: false,
      status: 401,
      error: "Authentication required",
    };
  }

  if (!isAdminEmail(user.email)) {
    return {
      ok: false,
      status: 403,
      error: "Admin permission required",
    };
  }

  return {
    ok: true,
    user,
  };
}

export async function requireAdmin() {
  const result = await getAdminAuthResult();

  if (!result.ok) {
    redirect("/admin/login");
  }

  return result.user;
}
