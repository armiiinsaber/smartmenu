import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  /* expose ONLY the names you care about */
  return NextResponse.json({
    SUPABASE_SERVICE_ROLE_KEY:
      process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 5) || null,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || null,
    NODE_ENV: process.env.NODE_ENV,
  });
}
