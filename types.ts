// types.ts
export interface Menu {
  id: number;
  slug: string;
  status: "pending" | "approved" | "rejected";
  link: string | null;
  review_note: string | null;
  created_at: string;
}
