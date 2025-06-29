"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function BuilderPage() {
  const router = useRouter();
  const [restaurantName, setRestaurantName] = useState("");
  const [rawText, setRawText] = useState("");
  const [selectedLangs, setSelectedLangs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

const LABELS: Record<string,string> = {
  en:"English", fr:"Français", pa:"ਪੰਜਾਬੀ", hi:"हिन्दी", ur:"اردو",
  ta:"தமிழ்", gu:"ગુજરાતી", bn:"বাংলা",
  zh:"中文", yue:"粵語", ko:"한국어",
  tl:"Filipino", vi:"Tiếng Việt", ml:"മലയാളം",
  fa:"فارسی", ar:"العربية", tr:"Türkçe", ku:"Kurdî", ps:"پښتو",
  es:"Español", pt:"Português",
  it:"Italiano", el:"Ελληνικά", ru:"Русский", pl:"Polski", de:"Deutsch",
  uk:"Українська", hu:"Magyar", ro:"Română",
  he:"עברית", am:"አማርኛ", so:"Soomaali", ti:"ትግርኛ",
  cs:"Čeština", sk:"Slovenčina"
};


  /* ───────── helpers ───────── */

  function toggleLang(lang: string) {
    setSelectedLangs(prev =>
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
    );
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setRawText(reader.result as string);
    reader.readAsText(file);
  }

  /* ───────── submit ───────── */

  async function handleSubmit() {
    if (!restaurantName || !rawText || selectedLangs.length === 0) {
      alert("Fill restaurant name, menu text, and pick at least one language.");
      return;
    }

    /* 5-column sanity check */
    const lines = rawText.split("\n").map(l => l.trim()).filter(Boolean);
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].split("|").length !== 5) {
        alert(
          `Line ${i + 1} is invalid.\nUse: Main Category|Category|Dish|Description|Price`
        );
        return;
      }
    }

    setLoading(true);
    try {
      /* 1️⃣  translate */
      const tr = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantName,
          text: rawText,
          languages: selectedLangs,
        }),
      });
      const payload = await tr.json();
      if (!tr.ok) throw new Error(payload.error || "translate failed");

      /* 2️⃣  save row for guests */
      const save = await fetch("/api/save-menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: payload.slug,
          restaurant_name: restaurantName, // <- match your column name
          translations: payload.translations,
        }),
      });
      if (!save.ok) {
        const err = await save.json();
        throw new Error(err.error || "save failed");
      }

      /* 3️⃣  cache locally for instant preview */
      sessionStorage.setItem(
        `menu-${payload.slug}`,
        JSON.stringify({
          restaurantName,
          translations: payload.translations,
        })
      );

      /* 4️⃣  go to live menu */
      router.push(`/menu/${payload.slug}`);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  /* staggered fade-in delays */
  const delays = ["100ms", "200ms", "300ms", "400ms", "500ms"];

  /* ───────── render ───────── */

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background:
          "linear-gradient(130deg, #FAF8F4 0%, #F5F1EC 50%, #FAF8F4 100%)",
        backgroundSize: "200% 200%",
        animation: "gradientShift 10s ease infinite",
      }}
    >
      <div className="w-full max-w-xl bg-white bg-opacity-60 backdrop-blur-sm rounded-3xl shadow-2xl p-8">
        <h1 className="text-4xl font-serif text-center text-gray-900 mb-6">
          Acarte
        </h1>

        <form
          onSubmit={e => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-6"
        >
          {/* 1) Name */}
          <div className="group fade-in-up" style={{ animationDelay: delays[0] }}>
            <label className="block text-sm uppercase tracking-wider text-gray-600 mb-2 pb-1">
              Restaurant Name
            </label>
            <input
              type="text"
              value={restaurantName}
              onChange={e => setRestaurantName(e.target.value)}
              placeholder="e.g. Cipriani"
              disabled={loading}
              className="w-full bg-transparent border-b-2 border-gray-300 py-2 focus:border-[#C9B458] outline-none"
            />
          </div>

          {/* 2) Text */}
          <div className="fade-in-up" style={{ animationDelay: delays[1] }}>
            <label className="block text-sm uppercase tracking-wider text-gray-600 mb-2 pb-1">
              Paste menu text{" "}
              <span className="font-semibold">
                (Main Cat|Category|Dish|Description|Price)
              </span>
            </label>
            <textarea
              value={rawText}
              onChange={e => setRawText(e.target.value)}
              rows={6}
              placeholder="Drinks|Gins|Tanqueray|Classic juniper-forward|11"
              disabled={loading}
              className="w-full bg-transparent border-b-2 border-gray-300 py-2 focus:border-[#C9B458] outline-none"
            />
          </div>

          {/* 3) File */}
          <div className="fade-in-up" style={{ animationDelay: delays[2] }}>
            <label className="block text-sm uppercase tracking-wider text-gray-600 mb-2">
              Or upload file
            </label>
            <input
              type="file"
              accept=".txt,.csv"
              ref={fileInputRef}
              onChange={handleFileUpload}
              disabled={loading}
              className="text-gray-700"
            />
          </div>

          {/* 4) Languages */}
          <div className="fade-in-up" style={{ animationDelay: delays[3] }}>
            <label className="block text-sm uppercase tracking-wider text-gray-600 mb-2">
              Your Guests Speak
            </label>
            <div className="flex flex-wrap gap-2">
              {languages.map(lang => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => toggleLang(lang)}
                  disabled={loading}
                  className={`px-3 py-1 rounded-full text-sm font-medium border transition ${
                    selectedLangs.includes(lang)
                      ? "bg-[#C9B458] text-white border-[#C9B458]"
                      : "bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* 5) Submit */}
          <div className="text-center fade-in-up" style={{ animationDelay: delays[4] }}>
            <button
              type="submit"
              disabled={loading}
              className={`mt-4 px-8 py-3 rounded-full font-semibold transition ${
                loading
                  ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                  : "bg-[#C9B458] text-white hover:scale-105 hover:shadow-lg"
              }`}
            >
              {loading ? "Generating…" : "Generate Menu"}
            </button>
          </div>
        </form>
      </div>

      {/* animations */}
      <style jsx global>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in-up { opacity: 0; animation: fadeInUp 0.6s ease forwards; }
      `}</style>
    </div>
  );
}
