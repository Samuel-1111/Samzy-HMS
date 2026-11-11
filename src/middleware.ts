import { NextResponse, type NextRequest } from "next/server";

export function middleware(_request: NextRequest) {
  // The signed, HttpOnly application session is verified by server-side route guards.
  // Supabase Auth is deliberately not used as the login provider.
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
