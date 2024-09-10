
import Header from "@/components/Header";
import Reset from "@/components/auth/Reset";

export default async function ResetPasswordPage() {
  return (
    <>
      <Header isAuth={true}/>
      <Reset />
    </>
  );
}
