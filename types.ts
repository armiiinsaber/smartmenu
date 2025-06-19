// types.ts

export interface Menu {
  id: number;
  slug: string;
  title: string | null;                // the human‐friendly title
  status: "pending" | "approved" | "rejected";
  link: string | null;                 // published menu URL
  review_note: string | null;          // reviewer’s comments
  json_menu: unknown;                  // raw parsed CSV
  created_at: string;                  // ISO timestamp
}
