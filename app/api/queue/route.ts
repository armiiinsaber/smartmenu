// app/api/queue/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Papa from "papaparse";

export const runtime = "edge";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  // 1) pull title + file out of the multipart form
  const form = await req.formData();
  const title = form.get("title")?.toString().trim() || null;
  const file = form.get("file") as File | null;

  // **LOG IT** so we can see in Vercel logs
  console.log("[queue] received title:", title);

  // 2) parse the CSV if present
  let csvJson: unknown = null;
  if (file) {
    try {
      const text = await file.text();
      const { data } = Papa.parse(text, { header: true });
      csvJson = data;
    } catch (err) {
      console.error("[queue] CSV parse error:", err);
    }
  }

  // 3) insert a pending row including the title
  const { error } = await supabase.from("menus").insert([
    {
      status: "pending",
      title,           // ← your new column is here
      json_menu: csvJson,
      review_note: null,
    },
  ]);

  if (error) console.error("[queue] insert error:", error);

  // 4) always 200 OK
  return NextResponse.json({ ok: true });
}
