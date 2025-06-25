import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// tell Next this is a server (node) function, not edge-rendered
export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  // create the client **inside** the handler so it isn’t run at build time
  const supa = createClient(
    process.env.NEXT_PUBLIC_SUPA_URL!,
    process.env.NEXT_PUBLIC_SUPA_ANON!
  );

  const { slug } = params;
  const { data, error } = await supa
    .from("menus")
    .select("*")
    .eq("slug", slug.toLowerCase())
    .single();

  return NextResponse.json({ data, error });
}
