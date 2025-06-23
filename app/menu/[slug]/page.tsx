"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";

/**
 * This revision makes the guest‑facing menu printable / PDF‑ready
 * --------------------------------------------------------------
 * • Adds a fixed "Download PDF" button that calls `window.print()` so
 *   guests (or staff) can choose **Save as PDF** in any browser.
 * • Introduces robust `@media print` rules: white background, removed
 *   shadows, ½‑inch margins, page‑break control so categories don’t
 *   split across pages.
 * • Keeps existing responsive web styles untouched.
 */

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

  // Load menu JSON from sessionStorage (created in the builder)
  useEffect(() => {
    if (!slug) return;

    const stored = sessionStorage.getItem(`menu-${slug}`);
    if (stored) {
      const parsed = JSON.parse(stored) as {
        restaurantName: string;
        translations: TranslationsMap;
      };
      setRestaurantName(parsed.restaurantName);
      setTranslations(parsed.translations);
      setCurrentLang(Object.keys(parsed.translations)[0] || "");
    }
  }, [slug]);

  // Trigger browser print dialogue (user can pick *Save as PDF*)
  const handlePrint = useCallback(() => {
    if (typeof window !== "undefined") {
      window.print();
    }
  }, []);

  if (!restaurantName || !currentLang) {
    return (
      <p className="text-center mt-12 text-gray-600">Loading menu…</p>
    );
  }

  // Parse `Category | Dish | Description | Price` rows
  const rows = translations[currentLang]
    .trim()
    .split("\n")
    .map((line) => line.split("|").map((cell) => cell.trim()))
    .filter((parts) => parts.length >= 4);

  const entries: MenuEntry[] = rows.map(([category, name, desc, price]) => ({
    category,
    name,
    desc,
    price,
  }));

  // Group by category
  const grouped = entries.reduce<Record<string, MenuEntry[]>>((acc, e) => {
    (acc[e.category] = acc[e.category] || []).push(e);
    return acc;
  }, {});

  return (
    <>
      {/* Floating button – hidden in print mode */}
      <div className="print:hidden fixed top-4 right-4 z-50">
        <button
          onClick={handlePrint}
          className="px-4 py-2 rounded-md bg-[#C9B458] text-white font-semibold shadow-lg transition-opacity hover:opacity-90"
        >
          Download PDF
        </button>
      </div>

      {/* Menu */}
      <div className="menu-container min-h-screen bg-[#FAF8F4] px-4 sm:px-6 md:px-8 py-8 md:py-12">
        <div className="max-w-2xl mx-auto bg-white shadow-2xl rounded-2xl p-8 md:p-16 border border-[#C9B458] print:shadow-none print:border-0 print:p-0">
          {/* Restaurant name */}
          <header className="text-center mb-8 md:mb-12">
            <h1 className="text-4xl md:text-5xl font-serif leading-tight text-gray-900">
              {restaurantName}
            </h1>
            <div className="mt-1 h-1 w-20 md:w-24 bg-[#C9B458] mx-auto"></div>
          </header>

          {/* Language switcher – hidden in print */}
          <div className="print:hidden mb-6 md:mb-10 overflow-x-auto">
            <div className="inline-flex whitespace-nowrap px-4 md:px-6 gap-2 md:gap-3">
              {Object.keys(translations).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setCurrentLang(lang)}
                  className={`inline-block px-3 md:px-4 py-1 md:py-2 text-xs md:text-sm font-semibold rounded-full border transition-colors ${
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

          {/* Menu sections */}
          <div className="space-y-12 md:space-y-20">
            {Object.entries(grouped).map(([category, items]) => (
              <section key={category} className="break-inside-avoid-page">
                {/* Category header */}
                <h2 className="text-xl md:text-2xl font-serif uppercase tracking-wider leading-tight text-center text-gray-900">
                  {category}
                </h2>
                <div className="border-b border-dotted border-gray-300/20 my-3 md:my-4" />

                {/* Items */}
                <ul className="space-y-6 md:space-y-8">
                  {items.map((item, idx) => (
                    <li
                      key={idx}
                      className="leader-li grid grid-cols-[1fr_auto] items-start gap-x-3 md:gap-x-4"
                    >
                      <div>
                        <h3 className="font-serif text-lg md:text-xl uppercase tracking-wide leading-snug text-gray-900">
                          {item.name}
                        </h3>
                        {item.desc && (
                          <p className="text-xs md:text-sm italic font-sans leading-normal text-gray-700 mt-1 ml-1">
                            {item.desc}
                          </p>
                        )}
                      </div>
                      <span className="font-serif text-lg md:text-xl leading-snug text-gray-900">
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

      {/* Global CSS – dotted leaders + print tweaks */}
      <style jsx global>{`
        /* dotted line leader */
        .leader-li {
          position: relative;
          padding-top: 0.25rem;
        }
        .leader-li::before {
          content: "";
          position: absolute;
          left: 0.75rem;
          right: 0.75rem;
          top: 1.2rem;
          border-bottom: 1px dotted rgba(0, 0, 0, 0.1);
          pointer-events: none;
        }

        /* PRINT STYLES */
        @media print {
          /* Remove default browser margins */
          @page {
            size: auto;
            margin: 0.5in;
          }

          body {
            background: #ffffff !important;
          }

          /* Hide elements marked with Tailwind's `print:hidden` */
          .print\\:hidden {
            display: none !important;
          }

          /* Make container flat & edge‑to‑edge */
          .menu-container {
            background: #ffffff !important;
          }

          /* Avoid splitting categories across pages */
          .break-inside-avoid-page {
            break-inside: avoid-page;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </>
  );
}
