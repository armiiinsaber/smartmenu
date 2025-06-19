export type Menu = {
  id: number;
  slug: string;
  title: string | null;     // ← our new field
  status: 'pending' | 'approved' | 'rejected';
  json_menu: any;
  review_note: string | null;
  link: string | null;
  created_at: string;
};
