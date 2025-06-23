import { NextRequest, NextResponse } from "next/server";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

export const runtime = "edge";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const proto = host?.startsWith("localhost") ? "http" : "https";
  const url = `${proto}://${host}/menu/${slug}`;

  let browser: puppeteer.Browser | null = null;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      defaultViewport: chromium.defaultViewport,
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

    return new NextResponse(pdf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename=menu-${slug}.pdf`,
      },
    });
  } catch (e) {
    console.error("PDF error", e);
    return new NextResponse("PDF failed", { status: 500 });
  } finally {
    if (browser) await browser.close();
  }
}
