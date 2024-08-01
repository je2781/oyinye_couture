import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  //   return NextResponse.redirect(new URL('/home', request.url))
  const path = request.nextUrl.pathname;

  const isPublicPath =
    path === "/login" ||
    path === "/signup" ||
    path === "/verifyemail" ||
    path === "/" ||
    path === "/resetpassword";

  const token = request.cookies.get("access_token")?.value;
  const isAdmin = request.cookies.get("admin_status")?.value;

  if (isPublicPath && token && isAdmin && isAdmin === 'false') {
    return NextResponse.redirect(new URL("/home", request.nextUrl), {
      status: 302,
    });
  }

  if (isPublicPath && token && isAdmin && isAdmin === 'true') {
    return NextResponse.redirect(new URL("/dashboard", request.nextUrl), {
      status: 302,
    });
  }

  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL("/", request.nextUrl), {
      status: 302,
    });
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    "/",
    "/login",
    "/signup",
    "/dashboard",
    "/verifyemail",
  ],
};
