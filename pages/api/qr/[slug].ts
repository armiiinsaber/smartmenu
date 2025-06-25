import type { NextApiRequest, NextApiResponse } from "next";
import QRCode from "qrcode";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { slug } = req.query;
  if (!slug || Array.isArray(slug)) {
    res.status(400).send("Bad slug");
    return;
  }

  // Absolute URL to the restaurant’s menu page
  const host = req.headers.host!;
  const proto = host.startsWith("localhost") ? "http" : "https";
  const menuURL = `${proto}://${host}/menu/${slug}`;

  // Generate QR as a PNG buffer
  const pngBuffer = await QRCode.toBuffer(menuURL, {
    type: "png",
    margin: 1,
    scale: 8,         // ~800-px square (prints crisply at 5–7 cm)
  });

  res
    .status(200)
    .setHeader("Content-Type", "image/png")
    .setHeader(
      "Content-Disposition",
      `inline; filename=${slug}-qr.png`
    )
    .send(pngBuffer);
}
