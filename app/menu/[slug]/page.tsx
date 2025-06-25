"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

/* ───────────  SUPABASE PUBLIC CLIENT  ─────────── */
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPA_URL!,
  process.env.NEXT_PUBLIC_SUPA_ANON!
);

/* ───────────  TYPES  ─────────── */
type TranslationsMap = Record<string, string>;
interface MenuEntry {
  category: string;
  name: string;
  desc?: string;
  price?: string;
}

export default function MenuPage() {
  /* ───────────  STATE  ─────────── */
  const { slug } = useParams() as { slug: string };
  const [restaurantName, setRestaurantName] = useState("");
  const [translations, setTranslations] = useState<TranslationsMap>({});
  const [currentLang, setCurrentLang] = useState("");

  /* ───────────  LOAD DATA  ─────────── */
  useEffect(() => {
    if (!slug) return;

    (async () => {
      /* 1️⃣  try Supabase (any device) */
      const { data } = await supabase
        .from("menus")
        .select("*")
        .eq("slug", slug.toLowerCase())
        .single();

      if (data) {
        setRestaurantName(data.restaurant_name ?? data.name ?? "");
        setTranslations(data.translations as TranslationsMap);
        setCurrentLang(Object.keys(data.translations)[0] || "");
        return;
      }

      /* 2️⃣  fallback for builder preview */
      const stored = sessionStorage.getItem(`menu-${slug}`);
      if (stored) {
        const { restaurantName, translations } = JSON.parse(stored) as {
          restaurantName: string;
          translations: TranslationsMap;
        };
        setRestaurantName(restaurantName);
        setTranslations(translations);
        setCurrentLang(Object.keys(translations)[0] || "");
      }
    })();
  }, [slug]);

  /* ───────────  PDF BUTTON  ─────────── */
  const handlePrint = useCallback(() => {
    if (!slug) return;
    window.location.href = `/api/pdf/${slug}`;
  }, [slug]);

  if (!restaurantName || !currentLang) {
    return <p className="text-center mt-12 text-gray-600">Loading menu…</p>;
  }

  /* ───────────  PARSE MENU  ─────────── */
  const rows = translations[currentLang]
    .trim()
    .split("\n")
    .map((l) => l.split("|").map((c) => c.trim()))
    .filter((p) => p.length >= 4);

  const entries: MenuEntry[] = rows.map(([category, name, desc, price]) => ({
    category,
    name,
    desc,
    price,
  }));

  const grouped = entries.reduce<Record<string, MenuEntry[]>>((acc, e) => {
    (acc[e.category] = acc[e.category] || []).push(e);
    return acc;
  }, {});

  /* ───────────  RENDER  ─────────── */
  return (
    <>
      {/* Download PDF */}
      <div className="print:hidden fixed top-4 right-4 z-50">
        <button
          onClick={handlePrint}
          className="px-4 py-2 rounded-md bg-[#C9B458] text-white font-semibold shadow-lg hover:opacity-90"
        >
          Download PDF
        </button>
      </div>

      <div className="menu-container min-h-screen bg-[#FAF8F4] px-4 sm:px-6 md:px-8 py-8 md:py-12">
        <div className="max-w-2xl mx-auto bg-white shadow-2xl rounded-2xl p-8 md:p-16 border border-[#C9B458] print:shadow-none print:border print:border-[#C9B458] print:rounded print:p-8">
          {/* Header */}
          <header className="print-fixed-header text-center mb-6 md:mb-10">
            <h1 className="text-4xl md:text-5xl font-serif leading-tight text-gray-900">
              {restaurantName}
            </h1>
            <div className="mt-1 h-1 w-20 md:w-24 bg-[#C9B458] mx-auto" />
          </header>

          {/* Language picker (screen only) */}
          <div className="print:hidden mb-6 md:mb-10 overflow-x-auto">
            <div className="inline-flex whitespace-nowrap px-4 md:px-6 gap-2 md:gap-3">
              {Object.keys(translations).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setCurrentLang(lang)}
                  className={`px-3 md:px-4 py-1 md:py-2 text-xs md:text-sm font-semibold rounded-full border ${
                    currentLang === lang
                      ? "bg-[#C9B458] text-white border-[#C9B458]"
                      : "bg-transparent text-gray-900 border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-14 md:space-y-20">
            {Object.entries(grouped).map(([category, items]) => (
              <section key={category}>
                <h2 className="text-xl md:text-2xl font-serif uppercase tracking-wider text-center text-gray-900">
                  {category}
                </h2>
                <div className="h-px bg-gray-300 opacity-20 my-4 md:my-5" />

                <ul className="space-y-5 md:space-y-6">
                  {items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-x-3 md:gap-x-4">
                      {/* Name & desc */}
                      <div className="flex flex-col min-w-0">
                        <h3 className="font-serif text-lg md:text-xl uppercase tracking-wide text-gray-900 break-words">
                          {item.name}
                        </h3>
                        {item.desc && (
                          <p className="text-xs md:text-sm italic text-gray-700 mt-1 ml-1 break-words">
                            {item.desc}
                          </p>
                        )}
                      </div>

                      {/* Dotted leader */}
                      <span
                        aria-hidden="true"
                        className="flex-grow border-b border-dotted border-gray-300/40 translate-y-2 mx-2"
                      />

                      {/* Price */}
                      <span className="font-serif text-lg md:text-xl text-gray-900 min-w-max">
                        {item.price}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </div>

      {/* Global print rules */}
      <style jsx global>{`
        .print-fixed-header {
          page-break-after: avoid;
          break-after: avoid-page;
        }
        @media print {
          @page {
            margin: 1.25in 1in;
          }
          body {
            background: #ffffff !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .menu-container {
            background: #ffffff !important;
          }
        }
      `}</style>
    </>
  );
}
