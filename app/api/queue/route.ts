// app/api/queue/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Papa from "papaparse";
import { randomUUID } from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const runtime = "edge";

export async function POST(req: NextRequest) {
  let csvJson: unknown = null;
  const slug = randomUUID().slice(0, 8);
  const form = await req.formData();
  const title = (form.get("title") as string) || slug;
  const file = form.get("file") as File | null;

  if (file) {
    try {
      const text = await file.text();
      const { data } = Papa.parse(text, { header: true });
      csvJson = data;
    } catch (e) {
      console.error("[queue] CSV parse error:", e);
    }
  }

  const { error } = await supabase.from("menus").insert([
    { slug, title, status: "pending", json_menu: csvJson, review_note: null }
  ]);

  if (error) console.error("[queue] insert error:", error);

  return NextResponse.json({ ok: true, slug });
}
