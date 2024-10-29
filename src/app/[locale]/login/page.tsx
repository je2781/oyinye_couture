

import Header from "@/components/layout/Header";
import Login from "@/components/auth/Login";
import { cookies } from "next/headers";


export default async function LoginPage() {
  const locale = cookies().get('NEXT_LOCALE')?.value || 'en';

  return (
    <>
      <Header isAuth={true} locale={locale}/>
      <Login locale={locale}/>
    </>
  );
}
