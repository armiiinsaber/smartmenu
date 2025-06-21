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

  const languages = ["en", "es", "fr", "de", "it", "pt", "zh", "ja", "ko", "ru"];

  function toggleLang(lang: string) {
    setSelectedLangs((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setRawText(reader.result as string);
    reader.readAsText(file);
  }

  async function handleSubmit() {
    if (!restaurantName || !rawText || selectedLangs.length === 0) {
      alert(
        "Please fill out restaurant name, menu text, and select at least one language."
      );
      return;
    }

    // Validate 4-column format: Category|Dish|Description|Price
    const lines = rawText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l);
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].split("|").length !== 4) {
        alert(
          `Line ${i + 1} is invalid. Each row must be: Category|Dish|Description|Price`
        );
        return;
      }
    }

    setLoading(true);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantName,
          text: rawText,
          languages: selectedLangs,
        }),
      });
      const payload = await res.json();
      if (!res.ok) {
        alert(`Error ${res.status}: ${payload.error}`);
        setLoading(false);
        return;
      }
      sessionStorage.setItem(
        `menu-${payload.slug}`,
        JSON.stringify({
          restaurantName: payload.restaurantName,
          translations: payload.translations,
        })
      );
      router.push(`/menu/${payload.slug}`);
    } catch (e: any) {
      alert(`Network error: ${e.message}`);
      setLoading(false);
    }
  }

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
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-6"
        >
          {/* Restaurant Name */}
          <div>
            <label className="block text-sm uppercase tracking-wider text-gray-600 mb-2">
              Restaurant Name
            </label>
            <input
              type="text"
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              placeholder="e.g. Cipriani"
              disabled={loading}
              className="w-full bg-transparent border-b-2 border-gray-300 py-2 focus:border-[#C9B458] outline-none transition"
            />
          </div>

          {/* Menu Text */}
          <div>
            <label className="block text-sm uppercase tracking-wider text-gray-600 mb-2">
              Paste menu text{" "}
              <span className="font-semibold">(Category|Dish|Description|Price)</span>
            </label>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              rows={6}
              placeholder="Antipasti|Pappa al Pomodoro|Traditional Tuscan tomato and bread soup|$22"
              disabled={loading}
              className="w-full bg-transparent border-b-2 border-gray-300 py-2 focus:border-[#C9B458] outline-none transition"
            />
          </div>

          {/* File Upload */}
          <div>
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

          {/* Language Selector */}
          <div>
            <label className="block text-sm uppercase tracking-wider text-gray-600 mb-2">
              Your Guests Speak
            </label>
            <div className="flex flex-wrap gap-2">
              {languages.map((lang) => (
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

          {/* Submit */}
          <div className="text-center">
            <button
              type="submit"
              disabled={loading}
              className={`mt-4 px-8 py-3 rounded-full font-semibold transition ${
                loading
                  ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                  : "bg-[#C9B458] text-white hover:bg-opacity-90"
              }`}
            >
              {loading ? "Generating…" : "Generate Menu"}
            </button>
          </div>
        </form>
      </div>

      {/* Global keyframes for the background animation */}
      <style jsx global>{`
        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </div>
  );
}
