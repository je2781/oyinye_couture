

import Header from "@/components/layout/header/Header";
import Login from "@/components/auth/Login";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";


export default async function LoginPage() {
  const h = headers();
  const csrfToken = h.get('X-CSRF-Token') || 'missing';
   
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
      <Login csrf={csrfToken}/>
    </>
  );
}
