import Header from "@/components/layout/header/Header";
import Reset from "@/components/auth/Reset";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function ResetPasswordPage() {
  const h = headers();
  const csrfToken = h.get("X-CSRF-Token") || "missing";
 
  //protecting public routes
  const cookieStore = cookies();
  const isAdmin = Boolean(cookieStore.get("admin_status")?.value);
  const token = cookieStore.get("access_token")?.value;

  if (token && isAdmin) {
    redirect("/admin/summary");
  }

  return (
    <>
      <Header isAuth={true} />
      <Reset csrf={csrfToken} />
    </>
  );
}
