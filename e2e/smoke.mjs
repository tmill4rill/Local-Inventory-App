// End-to-end smoke test: serves the web export (dist/) and walks the core journey in a phone viewport.
// Usage: npx expo export --platform web && node e2e/smoke.mjs [screenshotDir]
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { extname, join } from 'node:path';
import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';

const DIST = new URL('../dist/', import.meta.url).pathname;
const SHOTS = process.argv[2];
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.ttf': 'font/ttf', '.json': 'application/json' };

const server = createServer(async (req, res) => {
  const raw = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const path = raw === '/' ? '/index.html' : raw;
  try {
    const file = await readFile(join(DIST, path));
    res.writeHead(200, { 'content-type': MIME[extname(path)] ?? 'application/octet-stream' }).end(file);
  } catch {
    res.writeHead(200, { 'content-type': 'text/html' }).end(await readFile(join(DIST, 'index.html'))); // SPA fallback
  }
}).listen(0);
const base = `http://localhost:${server.address().port}`;

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, permissions: ['clipboard-read', 'clipboard-write'] });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
if (SHOTS) await mkdir(SHOTS, { recursive: true });
const shot = (name) => SHOTS && page.screenshot({ path: join(SHOTS, `${name}.png`) });
const step = (msg) => console.log('•', msg);

try {
  // Today: suggested looks built from nearby stock.
  await page.goto(base);
  await page.getByText("Today's suggestions").waitFor();
  await page.getByTestId('suggestion-work').waitFor();
  step('Today renders with suggested looks');
  await shot('01-today');

  // Shop: range levels and the extend-range prompt.
  await page.getByTestId('tab-shop').click();
  await page.getByText('Shop it online.', { exact: false }).waitFor();
  const countText = async () => (await page.getByText(/items? ready for pickup nearby/).textContent()) ?? '';
  const n10 = parseInt(await countText());
  await shot('02-shop');
  await page.getByTestId('radius-toggle').click();
  const slider = page.getByTestId('radius-slider');
  await slider.waitFor();
  const box = await slider.boundingBox();
  const y = box.y + box.height / 2;
  await page.mouse.move(box.x + box.width * 0.24, y); // thumb sits at ~10 of 40 miles
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.12, y, { steps: 5 });
  await page.mouse.move(box.x + 1, y, { steps: 5 }); // drag to the minimum: 1 mile
  await page.mouse.up();
  await page.waitForFunction(() => /Within 1 mi/.test(document.body.innerText));
  const n1 = parseInt(await countText());
  assert.ok(n1 < n10, `smaller radius should show fewer items (${n1} vs ${n10})`);
  step(`Radius filter works (${n10} items @10mi -> ${n1} @1mi)`);
  await page.getByTestId('extend-radius').click();
  await page.waitForFunction((n) => parseInt(document.body.innerText.match(/(\d+) items? ready/)?.[1] ?? '0') > n, n1);
  step('"Extend range" prompt widens the radius');
  await page.getByTestId('radius-toggle').click(); // close panel
  await page.getByTestId('level-10').click();

  // Product: wishlist, Style this item, reserve for pickup.
  await page.getByTestId('search-input').fill('trench');
  await page.getByTestId('product-o-trench').click();
  await page.getByText('The in-person difference').waitFor();
  await page.getByTestId('wish').click();
  await shot('03-product');
  await page.getByTestId('style-item').click();
  await page.getByTestId('save-look').waitFor();
  assert.ok(await page.getByTestId('opt-o-trench').isVisible(), 'builder starts from the anchored piece');
  await shot('04-builder');
  step('Style this item opens the look builder around it');
  await page.goBack();
  await page.getByTestId('add-pickup').click();
  await page.getByText(/Added for pickup at/).waitFor();
  step('Reserved for pickup');
  await page.getByTestId('go-cart').click();
  await page.getByText(/^Pickup · /).first().waitFor();
  await shot('05-bag');

  // Checkout requires a slot.
  await page.getByTestId('checkout').click();
  await page.getByText('When will you come?').waitFor();
  await page.locator('[data-testid^="slot-"]').first().click();
  await page.getByTestId('place-order').click();

  // Order confirmation + social invite.
  await page.getByTestId('pickup-code').waitFor();
  const code = await page.getByTestId('pickup-code').textContent();
  assert.match(code, /^LP-[A-Z2-9]{5}$/);
  step(`Order placed, pickup code ${code}`);
  await page.getByTestId('friend-maya').click();
  await page.getByTestId('friend-leo').click();
  await shot('06-order');
  await page.getByTestId('send-invite').click();
  await page.getByTestId('share-note').waitFor();
  const clip = await page.evaluate(() => navigator.clipboard.readText());
  assert.match(clip, /Maya & Leo/);
  assert.ok(clip.includes(code), 'invite includes pickup code');
  step('Invite composed for friends');

  // Picking it up puts it in the closet.
  await page.getByTestId('advance').click();
  await page.getByTestId('advance').click();
  await page.getByTestId('step-picked_up').waitFor();
  await page.goto(base + '/closet');
  await page.getByTestId('closet-o-trench').waitFor();
  await page.getByTestId('closet-tab-wishlist').click();
  await page.getByTestId('closet-o-trench').waitFor();
  step('Picked-up piece is in the closet; hearted piece is in the wishlist');

  // Save and reserve a suggested look from Today.
  await page.getByTestId('tab-index').click();
  await page.getByTestId('save-work').click();
  await page.getByText('Saved look to today').waitFor();
  await page.getByTestId('reserve-evening').click();
  await page.getByText(/reserved (at|across)/).waitFor();
  const bagLabel = await page.getByTestId('open-bag').getAttribute('aria-label');
  assert.ok(parseInt(bagLabel.match(/(\d+)/)[1]) >= 3, `look pieces in bag: ${bagLabel}`);
  await shot('07-today-saved');
  step('Suggested look saved to today and reserved for pickup');

  // Stylist from the + menu.
  await page.getByTestId('plus').click();
  await page.getByTestId('menu-stylist').click();
  await page.getByTestId('stylist-input').fill('dinner date, something black');
  await page.getByTestId('stylist-send').click();
  await page.getByTestId('stylist-reply').waitFor();
  assert.match(await page.getByTestId('stylist-reply').innerText(), /dinner-ready look/);
  await shot('08-stylist');
  step('Stylist answers with a nearby look');

  // Persistence across reload.
  await page.goto(base);
  await page.getByText("Today's suggestions").waitFor();
  await page.getByTestId('tab-orders').click();
  await page.getByText(code).waitFor();
  await page.getByTestId('tab-closet').click();
  await page.getByTestId('closet-tab-looks').click();
  await page.getByText('Work Presentation').first().waitFor();
  await shot('09-looks');
  step('Order, closet and saved look persist across reload');

  assert.deepEqual(errors.filter((e) => !/favicon|Failed to load resource/.test(e)), [], 'no console errors');
  console.log('\nE2E smoke test passed');
} catch (e) {
  await shot('failure');
  console.error('\nE2E FAILED:', e.message);
  console.error('Console errors:', errors);
  process.exitCode = 1;
} finally {
  await browser.close();
  server.close();
}
