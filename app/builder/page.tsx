// app/builder/page.tsx
"use client";

import { useState } from "react";
import axios from "axios";

export default function MenuBuilder() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">(
    "idle"
  );
  const [errMsg, setErrMsg] = useState<string | null>(null);

  async function handleSubmit() {
    if (!file || !title.trim()) return;

    setStatus("uploading");
    setErrMsg(null);

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("title", title.trim());         // ← pass the title along

      await axios.post("/api/queue", form);
      setStatus("done");
      setFile(null);
      setTitle("");
    } catch (err) {
      setStatus("error");
      setErrMsg(
        err instanceof Error ? err.message : "Upload failed. Try again."
      );
    }
  }

  return (
    <main style={{ padding: "4rem", fontFamily: "system-ui", maxWidth: 560 }}>
      <h1>Menu Builder</h1>

      {/* 1️⃣ Title input */}
      <label>
        <strong>Menu title (shown in dashboard)</strong>
        <input
          type="text"
          placeholder="e.g. Luigi Trattoria – Dinner"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            display: "block",
            width: "100%",
            margin: "0.5rem 0 1.5rem",
            padding: "0.5rem",
            fontSize: 16
          }}
        />
      </label>

      {/* 2️⃣ File picker */}
      <input
        type="file"
        accept=".csv"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        style={{ marginBottom: "1rem" }}
      />

      <br />

      {/* 3️⃣ Submit button */}
      <button
        onClick={handleSubmit}
        disabled={status === "uploading" || !file || !title.trim()}
        style={{
          padding: "0.5rem 1rem",
          fontSize: 16,
          cursor:
            status === "uploading" || !file || !title.trim()
              ? "not-allowed"
              : "pointer",
          opacity: status === "uploading" || !file || !title.trim() ? 0.5 : 1
        }}
      >
        {status === "uploading" ? "Uploading…" : "Send for Review"}
      </button>

      {/* 4️⃣ Feedback */}
      {status === "done" && (
        <>
          <p style={{ color: "green", marginTop: "1rem" }}>
            ✅ Uploaded. You’ll see it in the dashboard as <em>Pending</em>.
          </p>
          <p>
            <a href="/dashboard">Go to your dashboard →</a>
          </p>
        </>
      )}

      {status === "error" && (
        <p style={{ color: "red", marginTop: "1rem" }}>❌ {errMsg}</p>
      )}
    </main>
  );
}
