import { NextRequest, NextResponse } from "next/server";
import chromium from "@sparticuz/chromium"; // lightweight Chrome for Vercel
import puppeteer from "puppeteer-core";

/**
 * GET /api/pdf/[slug]
 * Renders the publicly‑available menu page to PDF without browser headers/footers.
 * ─ Uses headless Chrome (via @sparticuz/chromium) → avoids Node 18 size limits.
 * ─ Returns application/pdf; set `Content‑Disposition` for download.
 *
 * 1. Builds the absolute URL of the menu page (/menu/[slug]).
 * 2. Launches Chromium in serverless mode.
 * 3. Prints page to PDF with `displayHeaderFooter:false`.
 * 4. Closes browser and streams PDF back.
 */

export const runtime = "edge"; // Vercel Edge Function (cold‑start < 50 ms)

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const { slug } = params;
  const origin = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const protocol = origin?.startsWith("localhost") ? "http" : "https";
  const menuURL = `${protocol}://${origin}/menu/${slug}`;

  let browser: puppeteer.Browser | null = null;

  try {
    // Launch headless Chrome
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.goto(menuURL, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      margin: { top: "1.25in", bottom: "1.25in", left: "1in", right: "1in" },
      printBackground: true,
      displayHeaderFooter: false, // crucial: remove date/URL/page‑number
    });

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename=menu-${slug}.pdf`,
        "Cache-Control": "public, max-age=0, must-revalidate",
      },
    });
  } catch (err: any) {
    console.error("PDF generation error", err);
    return new NextResponse("Failed to generate PDF", { status: 500 });
  } finally {
    if (browser) await browser.close();
  }
}
