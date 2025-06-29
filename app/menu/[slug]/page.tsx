"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

/* ───────────  SUPABASE PUBLIC CLIENT  ─────────── */
const supabase =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ? createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )
    : null;

/* ───────────  LABELS MAP (for language buttons) ─────────── */
const LABELS: Record<string, string> = {
  en: "English",
  fr: "Français",
  pa: "ਪੰਜਾਬੀ",
  hi: "हिन्दी",
  ur: "اردو",
  ta: "தமிழ்",
  gu: "ગુજરાતી",
  bn: "বাংলা",
  zh: "中文",
  yue: "粵語",
  ko: "한국어",
  tl: "Filipino",
  vi: "Tiếng Việt",
  ml: "മലയാളം",
  fa: "فارسی",
  ar: "العربية",
  tr: "Türkçe",
  ku: "Kurdî",
  ps: "پښتو",
  es: "Español",
  pt: "Português",
  it: "Italiano",
  el: "Ελληνικά",
  ru: "Русский",
  pl: "Polski",
  de: "Deutsch",
  uk: "Українська",
  hu: "Magyar",
  ro: "Română",
  he: "עברית",
  am: "አማርኛ",
  so: "Soomaali",
  ti: "ትግርኛ",
  cs: "Čeština",
  sk: "Slovenčina",
};

/* ───────────  TYPES  ─────────── */
type TranslationsMap = Record<string, string>;

interface MenuEntry {
  mainCat: string;
  category: string;
  name: string;
  desc?: string;
  price?: string;
}

export default function MenuPage() {
  const { slug } = useParams() as { slug: string };

  const [restaurantName, setRestaurantName] = useState<string | null>(null);
  const [translations, setTranslations] = useState<TranslationsMap | null>(null);
  const [currentLang, setCurrentLang] = useState("");
  const [currentMain, setCurrentMain] = useState("");

  /* ───────────  PICK FIRST MAIN CAT (always-present hook) ─────────── */
  useEffect(() => {
    if (
      !currentMain &&
      translations &&
      currentLang &&
      typeof translations[currentLang] === "string"
    ) {
      const firstLine = translations[currentLang]
        .trim()
        .split("\n")
        .find(Boolean);
      const firstMain = firstLine?.split("|")[0].trim() || "";
      if (firstMain) setCurrentMain(firstMain);
    }
  }, [translations, currentLang, currentMain]);

  /* ───────────  LOAD DATA  ─────────── */
  useEffect(() => {
    if (!slug) return;

    (async () => {
      /* 1️⃣  Supabase (if available) */
      if (supabase) {
        try {
          const { data } = await supabase
            .from("menus")
            .select("*")
            .eq("slug", slug.toLowerCase())
            .single();

          if (data?.translations) {
            setRestaurantName(data.restaurant_name ?? data.name ?? "Menu");
            setTranslations(data.translations as TranslationsMap);
            setCurrentLang(Object.keys(data.translations)[0] || "");
            return;
          }
        } catch {
          /* ignore – fallback below */
        }
      }

      /* 2️⃣  sessionStorage fallback (preview) */
      const cached = sessionStorage.getItem(`menu-${slug}`);
      if (cached) {
        const { restaurantName, translations } = JSON.parse(cached) as {
          restaurantName: string;
          translations: TranslationsMap;
        };
        setRestaurantName(restaurantName);
        setTranslations(translations);
        setCurrentLang(Object.keys(translations)[0] || "");
        return;
      }

      /* 3️⃣  No data */
      setRestaurantName("Menu unavailable");
      setTranslations({});
    })();
  }, [slug]);

  /* ───────────  PDF BUTTON  ─────────── */
  const handlePrint = useCallback(() => {
    if (slug) window.location.href = `/api/pdf/${slug}`;
  }, [slug]);

  /* ───────────  EARLY STATES  ─────────── */
  if (restaurantName === null || translations === null) {
    return <p className="text-center mt-12 text-gray-600">Loading menu…</p>;
  }
  if (!Object.keys(translations).length) {
    return (
      <p className="text-center mt-12 text-red-600">
        No menu data found for this link.
      </p>
    );
  }

  const langValue = translations[currentLang];
  if (typeof langValue !== "string") {
    return (
      <p className="text-center mt-12 text-red-600">
        Menu format error – translation value is not text.
      </p>
    );
  }

  /* ───────────  PARSE MENU  ─────────── */
  const rows = langValue
    .trim()
    .split("\n")
    .map((l) => l.split("|").map((c) => c.trim()))
    .filter((p) => p.length >= 5);

  const entries: MenuEntry[] = rows.map(
    ([mainCat, category, name, desc, price]) => ({
      mainCat,
      category,
      name,
      desc,
      price,
    })
  );

  // Group entries → { mainCat: { category: MenuEntry[] } }
  const grouped = entries.reduce<Record<string, Record<string, MenuEntry[]>>>(
    (acc, e) => {
      if (!acc[e.mainCat]) acc[e.mainCat] = {};
      if (!acc[e.mainCat][e.category]) acc[e.mainCat][e.category] = [];
      acc[e.mainCat][e.category].push(e);
      return acc;
    },
    {}
  );

  const mainCats = Object.keys(grouped);

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

      {/* Menu container */}
      <div className="menu-container min-h-screen bg-[#FAF8F4] px-4 sm:px-6 md:px-8 py-8 md:py-12">
        <div className="max-w-2xl mx-auto bg-white shadow-2xl rounded-2xl p-8 md:p-16 border border-[#C9B458] print:shadow-none print:border print:border-[#C9B458] print:rounded print:p-8">
          <header className="print-fixed-header text-center mb-6 md:mb-10">
            <h1 className="text-4xl md:text-5xl font-serif leading-tight text-gray-900">
              {restaurantName}
            </h1>
            <div className="mt-1 h-1 w-20 md:w-24 bg-[#C9B458] mx-auto" />
          </header>

          {/* Language picker */}
          {Object.keys(translations).length > 1 && (
            <div className="print:hidden mb-6 md:mb-10 overflow-x-auto">
              <div className="inline-flex gap-3 px-6">
                {Object.keys(translations).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setCurrentLang(lang)}
                    className={`px-4 py-1 text-sm font-semibold rounded-full border whitespace-nowrap ${
                      currentLang === lang
                        ? "bg-[#C9B458] text-white border-[#C9B458]"
                        : "bg-transparent text-gray-900 border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {LABELS[lang] ?? lang.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Main-category picker */}
          {mainCats.length > 1 && (
            <div className="print:hidden mb-8 overflow-x-auto">
              <div className="inline-flex gap-3 px-6">
                {mainCats.map((mc) => (
                  <button
                    key={mc}
                    onClick={() => setCurrentMain(mc)}
                    className={`px-4 py-1 text-sm font-semibold rounded-full border uppercase whitespace-nowrap ${
                      currentMain === mc
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-transparent text-gray-900 border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {mc}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sections */}
          <div className="space-y-14 md:space-y-20">
            {Object.entries(grouped[currentMain] || {}).map(
              ([category, items]) => (
                <section key={category}>
                  <h2 className="text-xl md:text-2xl font-serif uppercase tracking-wider text-center text-gray-900">
                    {category}
                  </h2>
                  <div className="h-px bg-gray-300 opacity-20 my-4" />

                  <ul className="space-y-6">
                    {items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-4">
                        <div className="flex flex-col min-w-0">
                          <h3 className="font-serif text-lg uppercase tracking-wide text-gray-900 break-words">
                            {item.name}
                          </h3>
                          {item.desc && (
                            <p className="text-sm italic text-gray-700 break-words">
                              {item.desc}
                            </p>
                          )}
                        </div>
                        <span
                          aria-hidden="true"
                          className="flex-grow border-b border-dotted border-gray-300/40 translate-y-2 mx-2"
                        />
                        <span className="font-serif text-lg text-gray-900 min-w-max">
                          {item.price}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              )
            )}
          </div>
        </div>
      </div>

      {/* Print tweaks */}
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
