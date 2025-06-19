// app/api/queue/route.ts            (Edge Function)
// -----------------------------------------------------
// • Accepts multipart/form-data (CSV file + title)
// • Saves a “pending” menu row (with title)
// • Never throws a 500 to the client
// -----------------------------------------------------

import { NextRequest, NextResponse } from "next/server";
import { createClient }             from "@supabase/supabase-js";
import Papa                         from "papaparse";
import { v4 as uuidv4 }             from "uuid";

// ─── Supabase client ──────────────────────────────────────────────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Edge Runtime ✔
export const runtime = "edge";

export async function POST(req: NextRequest) {
  let jsonMenu: unknown = null;
  let title: string   = "";
  const slug = uuidv4().slice(0, 8); // short unique id

  // 1️⃣ Read CSV + title from multipart/form-data
  try {
    const form = await req.formData();
    const file = form.get("file")  as File | null;
    const raw = form.get("title");
    if (raw) title = raw.toString();

    if (file) {
      const text = await file.text();
      const { data } = Papa.parse(text, { header: true });
      jsonMenu = data;
    } else {
      console.warn("[queue] no file uploaded – json_menu will be null");
    }
  } catch (err) {
    console.error("[queue] form parse error:", err);
  }

  // 2️⃣ Insert into Supabase (status = pending)
  const { error } = await supabase.from("menus").insert([{
    slug,
    title,
    status:      "pending",
    json_menu:   jsonMenu,
    review_note: null
  }]);

  if (error) console.error("[queue] Supabase insert error:", error);

  // 3️⃣ Always 200 OK (front-end won’t see a 500)
  return NextResponse.json({ ok: true, slug });
}
