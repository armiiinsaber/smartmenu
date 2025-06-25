import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/* ─────────────  CONFIG  ─────────────
   • Runs in the Node.js runtime (not Edge)
   • Creates the Supabase client inside the handler
     so build-time analysis never executes it
*/
export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  /* Create public Supabase client on each request */
  const supa = createClient(
    process.env.NEXT_PUBLIC_SUPA_URL!,
    process.env.NEXT_PUBLIC_SUPA_ANON!
  );

  const { slug } = params;

  /* Fetch the row for this slug */
  const { data, error } = await supa
    .from("menus")
    .select("*")
    .eq("slug", slug.toLowerCase())
    .single();

  /* Return JSON for easy debugging */
  return NextResponse.json({ data, error });
}
