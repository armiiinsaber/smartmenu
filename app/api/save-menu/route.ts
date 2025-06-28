import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

/* 🚩 debug — keep this line for one deploy */
console.log(
  "save-menu env length =",
  process.env.SUPABASE_SERVICE_ROLE_KEY?.length ?? "undefined"
);

/* fail fast if the key isn’t set */
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("SUPABASE_SERVICE_ROLE_KEY env var missing");
}

/* service-role client */
const admin =
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      )
    : null;

export async function POST(req: NextRequest) {
  if (!admin) {
    return NextResponse.json(
      { error: "Service-role key not available on server" },
      { status: 500 }
    );
  }

  const body = await req.json(); // { slug, restaurant_name, translations }

  if (!body.slug || !body.translations) {
    return NextResponse.json({ error: "Bad payload" }, { status: 400 });
  }

  const { error } = await admin
    .from("menus")
    .upsert(
      {
        slug: String(body.slug).toLowerCase(),
        restaurant_name: body.restaurant_name ?? body.slug,
        translations: body.translations,
      },
      { onConflict: "slug" }
    );

  if (error) {
    console.error("Save-menu upsert error:", error);
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
