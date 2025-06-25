"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";

/* ─────────────  TYPES  ───────────── */
type TranslationsMap = Record<string, string>;
interface MenuEntry {
  category: string;
  name: string;
  desc?: string;
  price?: string;
}

export default function MenuPage() {
  const { slug } = useParams() as { slug: string };

  const [restaurantName, setRestaurantName] = useState("");
  const [translations, setTranslations] = useState<TranslationsMap>({});
  const [currentLang, setCurrentLang] = useState("");

  /* ─────────────  LOAD DATA  ───────────── */
  useEffect(() => {
    if (!slug) return;

    (async () => {
      /* 1️⃣  Try Supabase — but only if env-vars are defined */
      if (process.env.NEXT_PUBLIC_SUPA_URL && process.env.NEXT_PUBLIC_SUPA_ANON) {
        const { createClient } = await import("@supabase/supabase-js");
        const supa = createClient(
          process.env.NEXT_PUBLIC_SUPA_URL,
          process.env.NEXT_PUBLIC_SUPA_ANON
        );

        try {
          const { data } = await supa
            .from("menus")
            .select("*")
            .eq("slug", slug.toLowerCase())
            .single();

          if (data) {
            setRestaurantName(data.restaurant_name ?? data.name ?? "");
            setTranslations(data.translations as TranslationsMap);
            setCurrentLang(Object.keys(data.translations)[0] || "");
            return; // success → stop here
          }
        } catch {
          /* ignore – fall back */
        }
      }

      /* 2️⃣  Fallback: sessionStorage (builder preview) */
      const stored = se
