import type { NextApiRequest, NextApiResponse } from "next";

export default function testRoute(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ ok: true, slug: req.query.slug || null });
}
