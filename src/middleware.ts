import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  // Skip Supabase auth in local DB mode — all users are auto-authenticated
  if (process.env.USE_LOCAL_DB === "true") {
    return NextResponse.next();
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|p/|api/webhooks|api/local-db|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
