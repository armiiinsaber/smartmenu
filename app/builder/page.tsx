"use client";

import { useState } from "react";
import Papa from "papaparse";
import { v4 as uuid } from "uuid";

type TranslationsMap = Record<string, string>;

export default function BuilderPage() {
  const [csvText, setCsvText] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [translations, setTranslations] = useState<TranslationsMap | null>(null);
  const [slug, setSlug] = useState("");

  /* ─────────  HANDLE CSV PASTE / UPLOAD  ───────── */
  const parseCsv = () => {
    const { data } = Papa.parse<string[]>(csvText.trim(), {
      delimiter: "|",
      skipEmptyLines: true
    });

    /* very naive “translation” – just joins rows */
    const en = (data as string[][])
      .map((row) => row.map((c) => c.trim()).join(" | "))
      .join("\n");

    const map: TranslationsMap = { en };
    setTranslations(map);
  };

  /* ─────────  GENERATE + SAVE  ───────── */
  const handleGenerate = async () => {
    if (!translations) return;

    const newSlug = uuid().slice(0, 6); // e.g. “ywmsb1”
    setSlug(newSlug);

    /* store locally for preview */
    sessionStorage.setItem(
      `menu-${newSlug}`,
      JSON.stringify({ restaurantName, translations })
    );

    /* 🔗  call the backend to persist */
    await fetch("/api/save-menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: newSlug,
        restaurant_name: restaurantName,
        translations
      })
    });

    /* show the live link */
    alert(`Menu saved! Link: /menu/${newSlug}`);
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Menu Builder</h1>

      <label className="block font-semibold mb-1">Restaurant name</label>
      <input
        className="w-full border px-3 py-2 mb-4"
        value={restaurantName}
        onChange={(e) => setRestaurantName(e.target.value)}
        placeholder="KIRI"
      />

      <label className="block font-semibold mb-1">CSV (Category|Dish|Desc|Price)</label>
      <textarea
        className="w-full h-40 border px-3 py-2 mb-4"
        value={csvText}
        onChange={(e) => setCsvText(e.target.value)}
        placeholder="Starters|Salad|Fresh greens|12"
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
          Generate &amp; Save
        </button>
      )}

      {slug && (
        <p className="mt-6">
          Live link:&nbsp;
          <a
            className="text-blue-600 underline"
            href={`/menu/${slug}`}
            target="_blank"
            rel="noreferrer"
          >
            /menu/{slug}
          </a>
        </p>
      )}
    </div>
  );
}
