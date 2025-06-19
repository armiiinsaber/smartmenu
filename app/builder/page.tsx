// app/builder/page.tsx
"use client";

import { useState } from "react";
import Papa from "papaparse";
import axios from "axios";

export default function BuilderPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setMessage("");

    const form = new FormData();
    form.append("file", file);

    try {
      const { data } = await axios.post("/api/queue", form);
      setMessage(`✅ Uploaded! Menu ID: ${data.id}. It’s now pending review.`);
    } catch (err: any) {
      setMessage(`❌ Error: ${err?.response?.data?.error || err.message}`);
    } finally {
      setUploading(false);
      setFile(null);
    }
  }

  return (
    <main style={{ padding: "4rem", fontFamily: "system-ui" }}>
      <h1>Menu Builder</h1>

      <form onSubmit={handleSubmit}>
        <input
          required
          type="file"
          accept=".csv,.txt"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <button
          style={{ marginLeft: 12 }}
          disabled={!file || uploading}
          type="submit"
        >
          {uploading ? "Uploading…" : "Send for Review"}
        </button>
      </form>

      {message && <p style={{ marginTop: 24 }}>{message}</p>}
    </main>
  );
}
