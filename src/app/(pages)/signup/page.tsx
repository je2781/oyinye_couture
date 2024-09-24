
import Header from "@/components/layout/Header";
import Signup from "@/components/auth/Signup";

export default async function SignupPage() {
  return (
    <>
      <Header isAuth={true}/>
      <Signup />
    </>
  );
}
