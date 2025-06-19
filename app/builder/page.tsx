// app/builder/page.tsx
"use client";

import { useState } from "react";
import axios from "axios";

export default function Builder() {
  const [file,   setFile]   = useState<File | null>(null);
  const [title,  setTitle]  = useState("");
  const [state,  setState]  = useState<"idle" | "sending" | "done" | "err">("idle");
  const [msg,    setMsg]    = useState("");

  async function handleSubmit() {
    if (!file || !title.trim()) return;

    setState("sending");
    const form = new FormData();
    form.append("file",  file);
    form.append("title", title.trim());

    try {
      await axios.post("/api/queue", form);
      setState("done");
      setMsg("✅ Uploaded. You’ll see it in the dashboard as Pending.");
      setFile(null);
      setTitle("");
    } catch (e: any) {
      setState("err");
      setMsg("❌ " + (e?.message ?? "Upload failed"));
    }
  }

  return (
    <main style={{ padding: 40, fontFamily: "system-ui" }}>
      <h1>Menu Builder</h1>

      <label>
        <strong>Menu title&nbsp;(shown in dashboard)</strong><br />
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          style={{ padding: 8, marginTop: 4, width: 320 }}
          placeholder="e.g. Luigi Trattoria – Dinner"
        />
      </label>

      <div style={{ marginTop: 24 }}>
        <input
          type="file"
          accept=".csv"
          onChange={e => setFile(e.target.files?.[0] ?? null)}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!file || !title.trim() || state === "sending"}
        style={{
          marginTop: 24,
          padding: "8px 20px",
          cursor: "pointer",
          opacity: (!file || !title.trim()) ? 0.4 : 1
        }}
      >
        {state === "sending" ? "Sending…" : "Send for Review"}
      </button>

      {msg && <p style={{ marginTop: 20 }}>{msg}</p>}
    </main>
  );
}
