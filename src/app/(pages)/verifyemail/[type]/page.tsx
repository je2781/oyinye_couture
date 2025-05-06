
import Header from "@/components/layout/header/Header";
import Login from "@/components/auth/Login";
import {cookies, headers} from "next/headers";
import { redirect } from "next/navigation";

async function verifyToken(token: string, type: string){
  const res = await fetch(`${process.env.DOMAIN}/api/users/verify-email/${type}/${token}`, {
    cache: 'no-store'
  });

  const data = await res.json();

  return data;
}

export default async function VerifyPage({searchParams, params}: any) {
  const data = await verifyToken(searchParams['token'], params.type);

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
      <Header isAuth />
      <Login message={data.message} success={data.success} csrf={csrfToken}/>
    </>
  );
}
