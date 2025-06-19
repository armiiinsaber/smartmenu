// app/api/queue/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Papa from "papaparse";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const runtime = "edge";          // edge-runtime, fast ↔ cheap

export async function POST(req: NextRequest) {
  // ── 1. read the uploaded CSV (may throw) ────────────────────────────────
  let jsonMenu: unknown = null;

  try {
    const data = await req.formData();
    const file = data.get("file") as File | null;

    if (!file) throw new Error("No file field in formData");

    const text = await file.text();
    const { data: rows } = Papa.parse(text, { header: true });

    jsonMenu = rows;                   // fine if rows is [], we still accept
  } catch (err) {
    // swallow – we still create a pending record
    console.error("[queue] parse error:", err);
  }

  // ── 2. insert “pending” row ─────────────────────────────────────────────
  const { error } = await supabase.from("menus").insert([
    {
      status: "pending",
      json_menu: jsonMenu,            // can be null
      review_note: null
    }
  ]);

  if (error) {
    console.error("[queue] DB insert error:", error);
    // STILL return 200: the restaurant shouldn’t see a failure
  }

  return NextResponse.json({ ok: true });
}
