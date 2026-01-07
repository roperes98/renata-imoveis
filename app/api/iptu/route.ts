import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

const log = (msg: string) => {
  // Log to a file in the project root
  const logFile = path.resolve(process.cwd(), "debug_puppeteer.log");
  const timestamp = new Date().toISOString();
  try {
    fs.appendFileSync(logFile, `[${timestamp}] ${msg}\n`);
  } catch (e) {
    console.error("Failed to write to log file:", e);
  }
  console.log(`[IPTU API] ${msg}`);
};

export async function POST(req: NextRequest) {
  let browser = null;
  try {
    const { iptu_number, exercise = "2025" } = await req.json();
    log(`Request received for IPTU: ${iptu_number}`);

    if (!iptu_number) {
      return NextResponse.json({ error: "IPTU number is required" }, { status: 400 });
    }

    // Launch browser
    log("Launching Puppeteer...");

    // Attempt to locate chromium manually if needed, but try default first
    // headless: 'new' is recommended for Pptr v22+
    browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    log("Browser launched.");

    const page = await browser.newPage();
    log("New page created.");

    // Navigate
    const url = "https://iportal.rio.rj.gov.br/PF331IPTUATUAL/pages/ParcelamentoIptuDs/TelaSelecao.aspx";
    log(`Navigating to ${url}...`);

    await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    log("Navigation complete.");

    // Type IPTU
    const inputSelector = 'input[name="ctl00$ePortalContent$inscricao_input"]';
    log(`Waiting for selector ${inputSelector}...`);
    await page.waitForSelector(inputSelector, { timeout: 10000 });

    log("Typing IPTU number...");
    await page.$eval(inputSelector, (el) => (el as HTMLInputElement).value = '');
    await page.type(inputSelector, iptu_number);

    // Exercise
    const exerciseSelector = 'input[name="ctl00$ePortalContent$EXERCICIO"]';
    log("Typing Exercise...");
    await page.$eval(exerciseSelector, (el) => (el as HTMLInputElement).value = '');
    await page.type(exerciseSelector, exercise);

    // Click "PROSSEGUIR"
    log("Clicking PROSSEGUIR...");
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('input[type="submit"], button, a.btn'));
      const target = buttons.find(b => (b as HTMLElement).getAttribute('value')?.toUpperCase().includes('PROSSEGUIR') || (b as HTMLElement).innerText.toUpperCase().includes('PROSSEGUIR'));
      if (target) (target as HTMLElement).click();
      else throw new Error("Button PROSSEGUIR not found");
    });

    log("Waiting for result...");
    // Wait for result
    await page.waitForFunction(() => {
      return document.body.innerText.includes('Valor Total Emitido na Guia');
    }, { timeout: 15000 });
    log("Result found.");

    // Extract value
    const value = await page.evaluate(() => {
      const bodyText = document.body.innerText;
      const match = bodyText.match(/Valor Total Emitido na Guia[\s\S]*?(\d{1,3}(?:\.\d{3})*,\d{2})/);
      return match ? match[1] : null;
    });

    log(`Extracted value: ${value}`);

    if (value) {
      await browser.close();
      return NextResponse.json({
        success: true,
        value: value,
        full_value: `R$ ${value}`
      });
    }

    await browser.close();
    return NextResponse.json({ error: "Value not found in page" }, { status: 404 });

  } catch (error: any) {
    log(`Puppeteer Error: ${error.message}`);
    if (browser) await browser.close();
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
