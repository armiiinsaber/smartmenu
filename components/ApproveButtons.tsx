"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  id: number;
}

export default function ApproveButtons({ id }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handle(status: "approved" | "rejected") {
    setLoading(true);
    await fetch("/api/admin/update-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        status,
        // you can prompt for or auto-fill a note on rejection
        review_note: status === "rejected" ? "— pending review —" : undefined,
      }),
    });
    router.refresh(); // re-fetch server data
  }

  return (
    <div style={{ display: "flex", gap: "0.5rem" }}>
      <button disabled={loading} onClick={() => handle("approved")}>
        Approve
      </button>
      <button disabled={loading} onClick={() => handle("rejected")}>
        Reject
      </button>
    </div>
  );
}
