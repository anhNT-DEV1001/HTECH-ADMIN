import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = [
  "/api/v1/auth/login",
  "/api/v1/auth/refresh",
  "/api/v1/public",
  "/register",
];
const AUTH_PATHS = ["/login", "/register"];

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (req.method === "OPTIONS") return NextResponse.next();
  const accessToken = req.cookies.get("accessToken")?.value;
  if (accessToken && AUTH_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (!accessToken) {
    if (
      PUBLIC_PATHS.some((path) => pathname.startsWith(path)) ||
      AUTH_PATHS.some((path) => pathname.startsWith(path))
    ) {
      return NextResponse.next();
    }

    const accept = req.headers.get("accept") || "";
    const xRequestedWith = req.headers.get("x-requested-with") || "";
    const isApiRequest =
      pathname.startsWith("/api/v1") ||
      accept.includes("application/json") ||
      xRequestedWith === "XMLHttpRequest";

    if (isApiRequest) {
      const isPublicFlag = PUBLIC_PATHS.some((path) =>
        pathname.startsWith(path),
      );
      if (isPublicFlag) return NextResponse.next();
      return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}
export const config = {
  matcher: [
    /*
     * Match tất cả request paths ngoại trừ:
     * 1. /api/auth (nếu bạn muốn middleware bỏ qua API login)
     * 2. /_next/static (static files)
     * 3. /_next/image (image optimization files)
     * 4. /favicon.ico (favicon file)
     * 5. Các file ảnh/tài liệu public (.png, .jpg, .svg, ...)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
