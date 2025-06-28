import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!   // service role key (already in Vercel)
);

export async function POST(req: NextRequest) {
  const body = await req.json();               // { slug, restaurant_name, translations }

  if (!body.slug || !body.translations) {
    return NextResponse.json({ error: "Bad payload" }, { status: 400 });
  }

  const { error } = await admin
    .from("menus")
    .upsert(
      {
        slug: body.slug.toLowerCase(),
        restaurant_name: body.restaurant_name ?? body.slug,
        translations: body.translations
      },
      { onConflict: "slug" }
    );

  if (error) return NextResponse.json({ error }, { status: 500 });

  return NextResponse.json({ ok: true });
}
