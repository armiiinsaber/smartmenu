// app/dashboard/page.tsx
import type { Menu } from "../../types";     // ← make sure this points at your types file
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { realtime: { enabled: false } }         // disable WS to avoid bufferutil/utf-8 errors
);

export default async function Dashboard() {
  const { data: menus } = await supabase
    .from<Menu>("menus")
    .select("*")
    .order("created_at", { ascending: false });

  const chip = (status: Menu["status"]) =>
    status === "pending"   ? "🔵"
  : status === "approved"  ? "🟢"
  : status === "rejected"  ? "🟠"
  : "❔";

  return (
    <main style={{ padding: "4rem", fontFamily: "system-ui" }}>
      <h1>Your Menus</h1>

      {menus && menus.length > 0 ? (
        <table cellPadding={12} style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>
              <th>Status</th>
              <th>Title</th>
              <th>Message / Link</th>
            </tr>
          </thead>
          <tbody>
            {menus.map((m) => (
              <tr key={m.id} style={{ borderBottom: "1px solid #eee" }}>
                <td>
                  {chip(m.status)} {m.status}
                </td>
                <td>{m.title || m.slug}</td>
                <td>
                  {m.status === "approved" && m.link ? (
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href={m.link}
                    >
                      View menu
                    </a>
                  ) : (
                    m.review_note || "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No menus yet.</p>
      )}
    </main>
  );
}
