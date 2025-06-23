import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { slug } = req.query;
  if (!slug || Array.isArray(slug)) {
    res.status(400).send("Bad slug");
    return;
  }

  // lazy-load: avoids build-time bundling issues
  const chromium = (await import("@sparticuz/chromium")).default;
  const puppeteer = (await import("puppeteer-core")).default;

  const host = req.headers.host!;
  const proto = host.startsWith("localhost") ? "http" : "https";
  const url = `${proto}://${host}/menu/${slug}`;

  let browser: Awaited<ReturnType<typeof puppeteer.launch>> | null = null;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({
      format: "A4",
      margin: { top: "1.25in", bottom: "1.25in", left: "1in", right: "1in" },
      printBackground: true,
      displayHeaderFooter: false,
    });

    res
      .status(200)
      .setHeader("Content-Type", "application/pdf")
      .setHeader("Content-Disposition", `inline; filename=menu-${slug}.pdf`)
      .send(pdf);
  } catch (err) {
    console.error("PDF error", err);
    res.status(500).send("PDF failed");
  } finally {
    if (browser) await browser.close();
  }
}
