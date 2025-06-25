import { createClient } from "@supabase/supabase-js";
export default async function handler(req, res) {
  const supa = createClient(
    process.env.NEXT_PUBLIC_SUPA_URL!,
    process.env.NEXT_PUBLIC_SUPA_ANON!
  );
  const { slug } = req.query;
  const { data, error } = await supa
    .from("menus")
    .select("*")
    .eq("slug", String(slug).toLowerCase())
    .single();
  res.status(200).json({ data, error });
}
