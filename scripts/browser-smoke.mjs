import { chromium } from "playwright";
import assert from "node:assert/strict";

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));

try {
  await page.goto("http://127.0.0.1:4173/", { waitUntil: "networkidle" });
  assert.equal(await page.title(), "InstaPlan", "Home page title should be InstaPlan");
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload({ waitUntil: "networkidle" });

  await page.locator("#heroAdd").click();
  await page.locator("#postTitle").fill("Test automatico InstaPlan");
  await page.locator("#postDate").fill(new Date().toLocaleDateString("en-CA"));
  await page.locator("#postForm button.primary").click();
  await page.getByText("Test automatico InstaPlan", { exact: true }).first().waitFor();

  await page.locator(".bottomNav [data-nav='ideas']").click();
  await page.locator("#newIdeaBtn").click();
  await page.locator("#ideaText").fill("Idea test automatizzato");
  await page.locator("#ideaForm button.primary").click();
  await page.getByText("Idea test automatizzato", { exact: true }).first().waitFor();

  await page.reload({ waitUntil: "networkidle" });
  await page.getByText("Test automatico InstaPlan", { exact: true }).first().waitFor();
  await page.locator(".bottomNav [data-nav='ideas']").click();
  await page.getByText("Idea test automatizzato", { exact: true }).first().waitFor();

  await context.setOffline(true);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.getByText("InstaPlan", { exact: true }).first().waitFor({ timeout: 5000 });
  await context.setOffline(false);

  assert.deepEqual(errors, [], "The app should not emit uncaught page errors");
  console.log("Browser smoke checks passed: app loads, post/idea creation, local persistence, offline navigation.");
} finally {
  await context.close();
  await browser.close();
}
