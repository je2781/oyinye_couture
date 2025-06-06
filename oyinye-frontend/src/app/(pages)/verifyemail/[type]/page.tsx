import Header from "@/components/layout/header/Header";
import Login from "@/components/auth/Login";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCsrfToken } from "@/helpers/getHelpers";
import api from "@/helpers/axios";

async function verifyToken(token: string, type: string) {
  const res = await api.get(
    `${process.env.AUTH_DOMAIN}/api/auth/verify-email/${type}/${token}`,
    {
      headers: {
        "Cache-Control": "no-store",

      }
    }
  );

  return res.data;
}

export default async function VerifyPage({ searchParams, params }: any) {
  //protecting public routes
  const cookieStore = cookies();
  const isAdmin = Boolean(cookieStore.get("admin_status")?.value);
  const token = cookieStore.get("access_token")?.value;
  const csrfToken = await getCsrfToken();

  if (token && isAdmin) {
    redirect("/admin/summary");
  }

  const data = await verifyToken(searchParams["token"], params.type);

  return (
    <>
      <Header isAuth />
      <Login message={data.message} success={data.success} csrf={csrfToken} />
    </>
  );
}
