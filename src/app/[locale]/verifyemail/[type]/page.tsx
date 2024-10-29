
import Header from "@/components/layout/Header";
import Login from "@/components/auth/Login";
import { cookies } from "next/headers";

async function verifyToken(token: string, type: string){
  const res = await fetch(`${process.env.DOMAIN}/api/users/verify-email/${type}/${token}`, {
    cache: 'no-store'
  });

  const data = await res.json();

  return data;
}

export default async function VerifyPage({searchParams, params}: any) {
  const data = await verifyToken(searchParams['token'], params.type);
  const locale = cookies().get('NEXT_LOCALE')?.value;

  return (
    <>
      <Header isAuth={true} locale={locale}/>
      <Login message={data.message} success={data.success}/>
    </>
  );
}
