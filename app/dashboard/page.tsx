// app/dashboard/page.tsx
export const dynamic = 'force-dynamic';  // ← force SSR on every request

import type { Menu } from '../../types';            // adjust if your types live elsewhere
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function Dashboard() {
  // fetch latest menus, newest first
  const { data: menus } = await supabase
    .from('menus')
    .select('*')
    .order('created_at', { ascending: false });

  const chip = (status: string) =>
    ({
      pending: '🔵',
      approved: '🟢',
      rejected: '🟠',
    } as const)[status as keyof typeof status] || '❔';

  return (
    <main style={{ padding: '4rem', fontFamily: 'system-ui' }}>
      <h1>Your Menus</h1>

      {menus?.length ? (
        <table cellPadding={12} style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
              <th>Status</th>
              <th>Title</th>
              <th>Link / Review Note</th>
            </tr>
          </thead>
          <tbody>
            {menus.map((m: Menu) => (
              <tr key={m.id} style={{ borderBottom: '1px solid #eee' }}>
                <td>{chip(m.status)} {m.status}</td>
                <td>{m.title || '—'}</td>
                <td>
                  {m.status === 'approved' && m.link ? (
                    <a target="_blank" rel="noopener noreferrer" href={m.link}>
                      View menu
                    </a>
                  ) : (
                    m.review_note ?? '— pending review —'
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

