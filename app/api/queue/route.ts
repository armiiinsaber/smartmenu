// app/api/queue/route.ts     (Edge Function)

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Papa from "papaparse";

// — supabase client —
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// run as Edge
export const runtime = "edge";

export async function POST(req: NextRequest) {
  let csvJson: unknown = null;
  // use Web Crypto, not Node import
  const slug = crypto.randomUUID().slice(0, 8);

  // 1️⃣ parse form + CSV
  const form = await req.formData().catch((e) => {
    console.error("[queue] formData error", e);
    return new FormData();
  });
  const file = form.get("file") as File | null;
  if (file) {
    try {
      const text = await file.text();
      const { data } = Papa.parse(text, { header: true });
      csvJson = data;
    } catch (e) {
      console.error("[queue] CSV parse error", e);
    }
  }

  // read title if you’re sending one
  const title = (form.get("title") as string) || null;

  // 2️⃣ insert as pending
  const { error } = await supabase.from("menus").insert([
    { 
      slug,
      title,
      status: "pending",
      json_menu: csvJson,
      review_note: null
    }
  ]);
  if (error) console.error("[queue] insert error", error);

  // 3️⃣ always 200
  return NextResponse.json({ ok: true, slug });
}
