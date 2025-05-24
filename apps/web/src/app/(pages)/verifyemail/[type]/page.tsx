
import Header from "@ui/src/components/layout/header/Header";
import Login from "@ui/src/components/auth/Login";
import {cookies, headers} from "next/headers";
import { redirect } from "next/navigation";

async function verifyToken(token: string, type: string){
  const res = await fetch(`${process.env.WEB_DOMAIN}/api/users/verify-email/${type}/${token}`, {
    cache: 'no-store'
  });

  const data = await res.json();

  return data;
}

export default async function VerifyPage({searchParams, params}: any) {
  const data = await verifyToken(searchParams['token'], params.type);

  const h = await headers();
  const csrfToken = h.get('X-CSRF-Token') || 'missing';
 
  //protecting public routes
  const cookieStore = await cookies();
  const isAdmin = Boolean(cookieStore.get("admin_status")?.value);
  const token = cookieStore.get("access_token")?.value;

  if (token && isAdmin) {
    redirect(`${process.env.ADMIN_DOMAIN}/admin/summary`);
  }

  return (
    <>
      <Header isAuth={true} />
      <Login message={data.message} success={data.success} csrf={csrfToken}/>
    </>
  );
}
