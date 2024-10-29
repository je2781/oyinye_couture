
import Header from "@/components/layout/Header";
import Reset from "@/components/auth/Reset";
import { cookies } from "next/headers";


export default async function ResetPasswordPage() {
  const locale = cookies().get('NEXT_LOCALE')?.value || 'en';

  return (
    <>
      <Header isAuth={true} locale={locale}/>
      <Reset />
    </>
  );
}
