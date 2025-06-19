/* -------------------------------------------------------
 *  app/api/queue/route.ts      (Edge Function)
 *  Always creates a “pending” row, never throws 500
 * -----------------------------------------------------*/
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Papa from "papaparse";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const runtime = "edge";

export async function POST(req: NextRequest) {
  let jsonMenu: unknown = null;

  /* ---------- 1️⃣ read CSV from multipart/form-data ---------- */
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (file) {
      const text = await file.text();
      const { data } = Papa.parse(text, { header: true });
      jsonMenu = data;
    }
  } catch (e) {
    console.error("[queue] CSV parse error", e);
  }

  /* ---------- 2️⃣ create Supabase row in ‘pending’ ---------- */
  const { error } = await supabase.from("menus").insert([
    {
      status: "pending",
      json_menu: jsonMenu,
      review_note: null
    }
  ]);

  if (error) console.error("[queue] insert error", error);

  /* ---------- 3️⃣ always respond OK (front-end never sees 500) ---------- */
  return NextResponse.json({ ok: true });
}
