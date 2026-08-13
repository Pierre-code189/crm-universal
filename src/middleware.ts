import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";

  // Extraer subdominio en entornos local y producción
  const currentHost =
    process.env.NODE_ENV === "production"
      ? hostname.replace(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`, "")
      : hostname.replace(".localhost:3000", "");

  const subdomain =
    currentHost !== hostname && currentHost !== "www" ? currentHost : "default";

  const response = NextResponse.next();
  response.headers.set("x-tenant-subdomain", subdomain);

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};