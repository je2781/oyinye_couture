
import Header from "@/components/Header";
import Login from "@/components/auth/Login";

async function verifyToken(token: string){
  const res = await fetch(`${process.env.DOMAIN}/api/users/verify-email/${token}`, {
    cache: 'no-store'
  });

  const data = await res.json();

  return data;
}

export default async function VerifyPage({searchParams}: any) {
  const data = await verifyToken(searchParams['token']);
  return (
    <>
      <Header isAuth={true}/>
      <Login message={data.message} success={data.success}/>
    </>
  );
}
