import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supa = createClient(
  process.env.NEXT_PUBLIC_SUPA_URL!,
  process.env.NEXT_PUBLIC_SUPA_ANON!
);

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  const { data, error } = await supa
    .from("menus")
    .select("*")
    .eq("slug", slug.toLowerCase())
    .single();

  return NextResponse.json({ data, error });
}
