// app/api/queue/route.ts            (Edge Function)
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Papa from "papaparse";

// supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const runtime = "edge";

export async function POST(req: NextRequest) {
  let csvJson: unknown = null;

  // read multipart form
  const form = await req.formData();
  const file = form.get("file") as File | null;
  const title = form.get("title")?.toString().trim() || null;

  if (file) {
    try {
      const text = await file.text();
      const { data } = Papa.parse(text, { header: true });
      csvJson = data;
    } catch (err) {
      console.error("[queue] CSV parse error:", err);
    }
  }

  // always insert a pending row
  const { error } = await supabase.from("menus").insert([
    {
      title,          // ← now saving human title
      status: "pending",
      json_menu: csvJson,
      review_note: null,
    },
  ]);

  if (error) console.error("[queue] insert error:", error);

  return NextResponse.json({ ok: true });
}
