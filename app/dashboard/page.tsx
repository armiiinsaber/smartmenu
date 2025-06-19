// app/dashboard/page.tsx

import type { Menu } from "../../types";          // ← point at the new types.ts
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function Dashboard() {
  const { data: menus } = await supabase
    .from("menus")
    .select("*")
    .order("created_at", { ascending: false });

  const chip = (status: Menu["status"]) =>
    ({
      pending: "🔵",
      approved: "🟢",
      rejected: "🟠"
    }[status] ?? "❔");

  return (
    <main style={{ padding: "4rem", fontFamily: "system-ui" }}>
      <h1>Your Menus</h1>

      {menus?.length ? (
        <table cellPadding={12} style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>
              <th>Status</th>
              <th>Title</th>
              <th>Link / Review Note</th>
            </tr>
          </thead>
          <tbody>
            {menus.map((m: Menu) => (
              <tr key={m.id} style={{ borderBottom: "1px solid #eee" }}>
                <td>
                  {chip(m.status)} <em>{m.status}</em>
                </td>
                <td>{m.title || "–"}</td>
                <td>
                  {m.status === "approved" && m.link ? (
                    <a href={m.link} target="_blank" rel="noopener">
                      View menu
                    </a>
                  ) : (
                    m.review_note || "– pending review –"
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
