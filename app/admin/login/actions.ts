"use server";

import { redirect } from "next/navigation";
import { isAdminEmail } from "@/lib/adminAuth";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export type LoginState = {
  error?: string;
};

export async function loginAdmin(
  _state: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return {
      error: "メールアドレスとパスワードを入力してください。",
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !user) {
    return {
      error: "ログインに失敗しました。",
    };
  }

  if (!isAdminEmail(user.email)) {
    await supabase.auth.signOut();

    return {
      error: "管理者権限がありません。",
    };
  }

  redirect("/admin/orders");
}

export async function logoutAdmin() {
  const supabase = await createSupabaseServerClient();

  await supabase.auth.signOut();

  redirect("/admin/login");
}
