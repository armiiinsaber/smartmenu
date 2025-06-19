// app/api/queue/route.ts
/* -------------------------------------------------------
 *  Edge‐Function “queue” endpoint:
 *  • Accepts multipart/form-data (CSV + title)
 *  • Saves a “pending” menu row with human title
 *  • Never throws HTTP 500 (always returns { ok: true })
 * -----------------------------------------------------*/

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Papa from "papaparse";

// Tell Next this is an Edge function
export const runtime = "edge";

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  // 1️⃣ pull title + file out of form-data
  const form = await req.formData();
  const titleRaw = form.get("title");
  const title = typeof titleRaw === "string" && titleRaw.trim() !== ""
    ? titleRaw.trim()
    : null;

  const file = form.get("file") as File | null;

  // 2️⃣ parse CSV (if present)
  let csvJson: unknown = null;
  if (file) {
    try {
      const text = await file.text();
      const { data } = Papa.parse(text, { header: true });
      csvJson = data;
    } catch (err) {
      console.error("[queue] CSV parse error:", err);
    }
  } else {
    console.warn("[queue] no file uploaded – will insert null json_menu");
  }

  // 3️⃣ generate a slug via the global Web Crypto API
  const slug = crypto.randomUUID().slice(0, 8);

  // 4️⃣ insert into Supabase
  const { error } = await supabase.from("menus").insert([
    {
      slug,                      // for your review link
      title,                     // human‐friendly title
      status: "pending",         // always pending on upload
      json_menu: csvJson,        // parsed CSV or null
      review_note: null          // reviewer’s comments go here
    }
  ]);

  if (error) {
    console.error("[queue] Supabase insert error:", error);
  }

  // 5️⃣ always 200 back so the user never sees a 500
  return NextResponse.json({ ok: true, slug });
}
