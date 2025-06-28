"use client";

import { useState } from "react";
import Papa from "papaparse";
import { v4 as uuid } from "uuid";

/* ─────────────  TYPES  ───────────── */
type TranslationsMap = Record<string, string>;

export default function BuilderPage() {
  const [csv, setCsv] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [translations, setTranslations] = useState<TranslationsMap | null>(null);
  const [slug, setSlug] = useState("");

  /* ─── CSV → translations map (same behaviour as old version) ─── */
  const parseCsv = () => {
    const { data } = Papa.parse<string[]>(csv.trim(), {
      delimiter: "|",
      skipEmptyLines: true
    });

    const en = (data as string[][])
      .map((row) => row.map((c) => c.trim()).join(" | "))
      .join("\n");

    setTranslations({ en });
  };

  /* ─── Generate link + save to Supabase ─── */
  const handleGenerate = async () => {
    if (!translations) return;

    const newSlug = uuid().slice(0, 6);
    setSlug(newSlug);

    /* store locally for preview */
    sessionStorage.setItem(
      `menu-${newSlug}`,
      JSON.stringify({ restaurantName, translations })
    );

    /* upsert via backend */
    await fetch("/api/save-menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: newSlug,
        restaurant_name: restaurantName,
        translations
      })
    });
  };

  /* ───  UI (same tailwind classes you had) ─── */
  return (
    <div className="min-h-screen bg-[#FAF8F4] px-4 py-10">
      <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-2xl p-8 md:p-12 border border-[#C9B458]">
        <h1 className="text-3xl font-serif mb-6 text-center">Menu Builder</h1>

        {/* Restaurant name */}
        <label className="block font-semibold mb-1">Restaurant name</label>
        <input
          className="w-full border rounded px-3 py-2 mb-6"
          placeholder="KIRI"
          value={restaurantName}
          onChange={(e) => setRestaurantName(e.target.value)}
        />

        {/* CSV textarea */}
        <label className="block font-semibold mb-1">
          CSV &nbsp;
          <span className="text-xs text-gray-500">
            (Category|Dish|Desc|Price per line)
          </span>
        </label>
        <textarea
          className="w-full h-48 border rounded px-3 py-2 mb-4 font-mono text-sm"
          placeholder="Starters|Salad|Fresh greens|12"
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
        />

        <button
          className="px-4 py-2 bg-blue-600 text-white rounded mr-3"
          onClick={parseCsv}
        >
          Parse CSV
        </button>

        {translations && (
          <button
            className="px-4 py-2 bg-green-600 text-white rounded"
            onClick={handleGenerate}
          >
            Generate link
          </button>
        )}

        {slug && (
          <p className="mt-6 text-center">
            Live link:&nbsp;
            <a
              href={`/menu/${slug}`}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 underline break-all"
            >
              {`${window.locati
