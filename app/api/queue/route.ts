/* -------------------------------------------------------
 *  app/api/queue/route.ts   (Edge Function)
 * -----------------------------------------------------*/
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Papa from "papaparse";
import { randomUUID } from "crypto";

export const runtime = "edge";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  let csvJson: unknown = null;

  const form  = await req.formData();
  const file  = form.get("file")  as File | null;
  const title = (form.get("title") as string | null)?.trim() || "Untitled menu";
  const slug  = randomUUID().slice(0, 8);

  /* 1️⃣ Parse CSV (if any) */
  if (file) {
    try {
      const text = await file.text();
      const { data } = Papa.parse(text, { header: true });
      csvJson = data;
    } catch (err) {
      console.error("[queue] CSV parse error:", err);
    }
  }

  /* 2️⃣ Insert row */
  const { error } = await supabase.from("menus").insert([
    { slug, title, status: "pending", json_menu: csvJson, review_note: null }
  ]);
  if (error) console.error("[queue] Supabase insert error:", error);

  /* 3️⃣ Respond */
  return NextResponse.json({ ok: true, slug });
}
