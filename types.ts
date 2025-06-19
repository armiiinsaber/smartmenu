// types.ts
export type Menu = {
  id: number;
  created_at: string;
  title: string | null;
  status: "pending" | "approved" | "rejected";
  link?: string | null;
  review_note?: string | null;
  json_menu: unknown;
};
