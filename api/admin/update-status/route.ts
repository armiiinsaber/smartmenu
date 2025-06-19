import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Edge Runtime
export const runtime = "edge";

// initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  // expect { id, status, review_note?, link? }
  const { id, status, review_note, link } = await req.json();

  // build our partial update object
  const updates: Record<string, unknown> = { status };
  if (review_note !== undefined) updates.review_note = review_note;
  if (link) updates.link = link;

  // perform the update
  const { data, error } = await supabase
    .from("menus")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[admin/update-status] supabase error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, menu: data });
}
