/* -------------------------------------------------------
 *  app/api/queue/route.ts            (Edge Function)
 *  • Accepts multipart/form-data (CSV file)
 *  • Saves a “pending” menu row in Supabase
 *  • Never throws a 500 to the client
 * -----------------------------------------------------*/

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Papa from "papaparse";

// ---------- Supabase client ----------
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Edge Runtime ✔
export const runtime = "edge";

export async function POST(req: NextRequest) {
  /* short unique slug generated with Edge-native crypto */
  const slug = crypto.randomUUID().slice(0, 8);

  let csvJson: unknown = null;

  /* ---------- 1️⃣  read CSV from multipart/form-data ---------- */
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;

    if (!file) {
      // no file uploaded – still create a “pending” row
      console.warn("[queue] no file uploaded");
    } else {
      const text = await file.text();
      const { data } = Papa.parse(text, { header: true });
      csvJson = data;
    }
  } catch (err) {
    // parsing problems are logged but won’t block the request
    console.error("[queue] CSV parse error:", err);
  }

  /* ---------- 2️⃣  create Supabase row (status = pending) ---------- */
  const { error } = await supabase.from("menus").insert([
    {
      slug,                  // so you can approve & build a link later
      status: "pending",     // always pending on upload
      json_menu: csvJson,    // may be null if parsing failed
      review_note: null
    }
  ]);

  if (error) console.error("[queue] Supabase insert error:", error);

  /* ---------- 3️⃣  always respond 200 ---------- */
  return NextResponse.json({ ok: true, slug });
}
