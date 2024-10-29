
import Header from "@/components/layout/Header";
import Signup from "@/components/auth/Signup";
import { cookies } from "next/headers";


export default async function SignupPage() {
  const locale = cookies().get('NEXT_LOCALE')?.value;

  return (
    <>
      <Header isAuth={true} locale={locale}/>
      <Signup />
    </>
  );
}
