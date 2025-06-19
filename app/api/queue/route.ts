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
  // 1️⃣ Pull title + file out of the form
  const form = await req.formData();
  const title = form.get("title")?.toString().trim() || null;
  const file = form.get("file") as File | null;

  // 2️⃣ Generate an 8-char slug via Web Crypto
  const slug =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID().slice(0, 8)
      : null;

  console.log("[queue] title:", title, "slug:", slug);

  // 3️⃣ Parse CSV if present
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

  // 4️⃣ Insert into Supabase (always “pending”)
  const { error } = await supabase.from("menus").insert([
    {
      slug,
      status: "pending",
      title,
      json_menu: csvJson,
      review_note: null,
    },
  ]);

  if (error) console.error("[queue] insert error:", error);

  // 5️⃣ Always 200 OK back to the client
  return NextResponse.json({ ok: true, slug });
}
