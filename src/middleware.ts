import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt"; 

// Middleware function
export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const url = request.nextUrl;

  // If no token exists and the request is for sign-in, sign-up, or verify page
  if (!token && (url.pathname.startsWith("/signin") || url.pathname.startsWith("/signup") || url.pathname.startsWith("/verify"))) {
    return NextResponse.next(); // Allow access to these pages without redirecting
  }

  // If a token exists and the request is for these pages, redirect to dashboard
  if (token && (url.pathname.startsWith("/signin") || url.pathname.startsWith("/signup") || url.pathname.startsWith("/verify"))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect to home if token doesn't exist and the request is not for sign-in, sign-up, or verify page
  if (!token) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return NextResponse.next(); // Allow access to other pages if the token exists
}

// Configuration for matching paths to apply this middleware
export const config = {
  matcher: ["/signin", "/signup", "/verify", "/dashboard/:path*"], // Specify paths for middleware
};
