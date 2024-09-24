
import Header from "@/components/layout/Header";
import Login from "@/components/auth/Login";

async function verifyToken(token: string, type: string){
  const res = await fetch(`${process.env.DOMAIN}/api/users/verify-email/${type}/${token}`, {
    cache: 'no-store'
  });

  const data = await res.json();

  return data;
}

export default async function VerifyPage({searchParams, params}: any) {
  const data = await verifyToken(searchParams['token'], params.type);
  return (
    <>
      <Header isAuth={true}/>
      <Login message={data.message} success={data.success}/>
    </>
  );
}
