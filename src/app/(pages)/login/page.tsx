

import Header from "@/components/Header";
import Login from "@/components/auth/Login";
import { cookies } from "next/headers";



export default async function LoginPage() {
  return (
    <>
      <Header isAuth={true}/>
      <Login/>
    </>
  );
}
