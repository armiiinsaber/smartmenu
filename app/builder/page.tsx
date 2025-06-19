"use client";

/* -------------------------------------------------------
 *  app/builder/page.tsx
 *  Single-file uploader ➜ sends to /api/queue
 * -----------------------------------------------------*/
import { useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function MenuBuilder() {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSend() {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post("/api/queue", formData);
      router.push("/dashboard");                // 🚀 go see status
    } catch (e: any) {
      setError(`❌ ${e.message || "Upload failed"}`);
    }
  }

  return (
    <main style={{ padding: "4rem", fontFamily: "system-ui" }}>
      <h1>Menu Builder</h1>

      <input
        type="file"
        accept=".csv"
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setFile(e.target.files?.[0] || null)
        }
      />

      <button
        style={{
          marginLeft: "1rem",
          padding: "0.5rem 1rem",
          cursor: file ? "pointer" : "not-allowed"
        }}
        disabled={!file}
        onClick={handleSend}
      >
        Send for Review
      </button>

      {error && (
        <p style={{ color: "crimson", marginTop: "2rem", fontWeight: 600 }}>
          {error}
        </p>
      )}
    </main>
  );
}
