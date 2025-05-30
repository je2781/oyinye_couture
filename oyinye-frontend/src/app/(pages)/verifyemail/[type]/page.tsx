
import Header from "@/components/layout/header/Header";
import Login from "@/components/auth/Login";
import {cookies, headers} from "next/headers";
import { redirect } from "next/navigation";

async function verifyToken(token: string, type: string){
  const accessToken = cookies().get('access_token')?.value;
  const res = await fetch(`${process.env.WEB_DOMAIN}/api/users/verify-email/${type}/${token}`, {
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  const data = await res.json();

  return data;
}

export default async function VerifyPage({searchParams, params}: any) {
  //protecting public routes
  const cookieStore = cookies();
  const isAdmin = Boolean(cookieStore.get("admin_status")?.value);
  const token = cookieStore.get("access_token")?.value;

  if (token && isAdmin) {
    redirect("/admin/summary");
  }

  const data = await verifyToken(searchParams['token'], params.type);

  const h = headers();
  const csrfToken = h.get('X-CSRF-Token') || 'missing';
 

  return (
    <>
      <Header isAuth />
      <Login message={data.message} success={data.success} csrf={csrfToken}/>
    </>
  );
}
