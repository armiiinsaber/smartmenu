"use client";

import { useState } from "react";
import Papa from "papaparse";
import { v4 as uuid } from "uuid";

/* ───────────  TYPES  ─────────── */
type CsvRow = [string, string, string, string]; // Cat | Dish | Desc | Price
type TranslationsMap = Record<string, string>;

export default function BuilderPage() {
  const [csvText, setCsvText] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [translations, setTranslations] = useState<TranslationsMap | null>(null);
  const [slug, setSlug] = useState("");

  /* ─── Parse CSV exactly like original builder ─── */
  const handleParse = () => {
    const { data } = Papa.parse<CsvRow>(csvText.trim(), {
      delimiter: "|",
      skipEmptyLines: true
    });

    /* join rows back into the pipe-format string */
    const en = data
      .map((row) => row.map((c) => c.trim()).join("|"))
      .join("\n");

    setTranslations({ en });
  };

  /* ─── Generate link + save to Supabase ─── */
  const handleGenerate = async () => {
    if (!translations) return;

    const newSlug = uuid().slice(0, 6); // e.g. “ywmsb1”
    setSlug(newSlug);

    /* keep local preview behaviour */
    sessionStorage.setItem(
      `menu-${newSlug}`,
      JSON.stringify({ restaurantName, translations })
    );

    /* call backend to upsert */
    await fetch("/api/save-menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: newSlug,
        restaurant_name: restaurantName,
        translations
      })
    });

    alert(`Menu saved!\nLink: /menu/${newSlug}`);
  };

  /* ─── UI — same classes you had before ─── */
  return (
    <div className="p-10 max-w-xl mx-auto font-sans text-gray-800">
      <h1 className="text-3xl font-bold mb-6">Menu Builder</h1>

      <label className="font-semibold block mb-1">Restaurant name</label>
      <input
        className="w-full border rounded px-3 py-2 mb-4"
        value={restaurantName}
        onChange={(e) => setRestaurantName(e.target.value)}
        placeholder="KIRI"
      />

      <label className="font-semibold block mb-1">
        CSV — Category|Dish|Description|Price
      </label>
      <textarea
        className="w-full h-40 border rounded px-3 py-2 mb-4 resize-none"
        value={csvText}
        onChange={(e) => setCsvText(e.target.value)}
        placeholder="Starters|Salad|Fresh greens|12"
      />

      <button
        onClick={handleParse}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-3"
      >
        Parse CSV
      </button>

      {translations && (
        <button
          onClick={handleGenerate}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Generate &amp; Save
        </button>
      )}

      {slug && (
        <p className="mt-6">
          Live link:&nbsp;
          <a
            href={`/menu/${slug}`}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 underline"
          >
            /menu/{slug}
          </a>
        </p>
      )}
    </div>
  );
}
