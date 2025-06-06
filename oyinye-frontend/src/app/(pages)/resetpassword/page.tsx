import Header from "@/components/layout/header/Header";
import Reset from "@/components/auth/Reset";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCsrfToken } from "@/helpers/getHelpers";
import api from "@/helpers/axios";

export default async function ResetPasswordPage() {
  //protecting public routes
  const cookieStore = cookies();
  const isAdmin = Boolean(cookieStore.get("admin_status")?.value);
  const token = cookieStore.get("access_token")?.value;
  const csrfToken = await getCsrfToken();


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
