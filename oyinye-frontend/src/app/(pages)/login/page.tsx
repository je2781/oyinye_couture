import Header from "@/components/layout/header/Header";
import Login from "@/components/auth/Login";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCsrfToken } from "@/helpers/getHelpers";
import api from "@/helpers/axios";

export default async function LoginPage() {
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
      <Login csrf={csrfToken} />
    </>
  );
}
