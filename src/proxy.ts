import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const publicRoutes = ["/login", "/signup", "/api/auth", "/api/signup"];
export default auth((request) => {
  const isPublic = publicRoutes.some(route => request.nextUrl.pathname === route || request.nextUrl.pathname.startsWith(`${route}/`));
  if (!request.auth && !isPublic) return NextResponse.redirect(new URL("/login", request.nextUrl));
  return NextResponse.next();
});

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
