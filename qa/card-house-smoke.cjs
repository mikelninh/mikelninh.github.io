const { chromium } = require('playwright-core');
const fs = require('node:fs');

const chrome = [
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].find(fs.existsSync);

if (!chrome) throw new Error('No Chrome or Chromium executable found on runner.');

async function waitUntil(page, check, timeout = 20000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    if (await check()) return true;
    await page.waitForTimeout(250);
  }
  return false;
}

(async () => {
  const browser = await chromium.launch({ executablePath: chrome, headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);

  try {
    console.log('STAGE lobby');
    await page.goto('http://127.0.0.1:4173/tien-len/', { waitUntil: 'domcontentloaded' });
    await page.getByText('THE CARD HOUSE', { exact: true }).waitFor();
    await page.getByText('Full original game', { exact: true }).waitFor();
    await page.getByText('Shared daily multiplayer', { exact: true }).waitFor();
    await page.getByText('Prototype · house bot', { exact: true }).waitFor();
    if (await page.getByText('Tiến Lên Sprint', { exact: false }).count()) throw new Error('Sprint fallback is present.');
    console.log('PASS lobby');

    console.log('STAGE tien-len-render');
    await page.getByRole('button', { name: /Vs 3 bots/i }).click();
    await page.getByText('Vietnamese Thirteen', { exact: true }).waitFor();
    await page.getByRole('button', { name: /Rules/i }).waitFor();
    await page.getByRole('button', { name: /Show played|Hide played/i }).waitFor();
    await page.getByRole('button', { name: /New game/i }).waitFor();
    await page.locator('.pcard').first().waitFor();
    if ((await page.locator('.pcard').count()) < 13) throw new Error('Original Tiến Lên hand did not render.');
    console.log('PASS tien-len-render');

    console.log('STAGE tien-len-engine-move');
    let moved = false;
    for (let attempt = 0; attempt < 12 && !moved; attempt++) {
      const hint = page.getByRole('button', { name: /Hint/i });
      const hasTurn = await waitUntil(page, async () => await hint.isEnabled().catch(() => false), 15000);
      if (!hasTurn) {
        await page.getByRole('button', { name: /New game/i }).click();
        continue;
      }

      const beforeHand = await page.locator('.pcard').count();
      await hint.click();
      await page.waitForTimeout(300);
      const hinted = page.locator('.pcard.hintable');
      const count = await hinted.count();

      if (count > 0) {
        for (let i = 0; i < count; i++) await hinted.nth(i).click();
        const play = page.getByRole('button', { name: /^Play$/i });
        if (await play.isEnabled().catch(() => false)) {
          await play.click();
          moved = await waitUntil(page, async () => (await page.locator('.pcard').count()) < beforeHand, 5000);
          if (moved) break;
        }
      }

      const pass = page.getByRole('button', { name: /^Pass$/i });
      if (await pass.isEnabled().catch(() => false)) {
        await pass.click();
        await page.waitForTimeout(1000);
      } else {
        await page.getByRole('button', { name: /New game/i }).click();
        await page.waitForTimeout(600);
      }
    }
    if (!moved) throw new Error('Could not complete a legal Tiến Lên engine move.');
    console.log('PASS tien-len-engine-move');

    console.log('STAGE poker');
    await page.getByRole('button', { name: /Menu/i }).click();
    await page.getByText('THE CARD HOUSE', { exact: true }).waitFor();
    await page.getByRole('button', { name: /Enter today's showdown/i }).click();
    await page.getByText('Daily Poker Showdown', { exact: true }).waitFor();
    const pokerAnswers = page.locator('button').filter({ hasText: /^[A-D]\./ });
    if ((await pokerAnswers.count()) < 4) throw new Error('Daily Poker answers did not render.');
    await pokerAnswers.first().click();
    console.log('PASS poker');

    console.log('STAGE durak');
    await page.getByRole('button', { name: /Lobby/i }).click();
    await page.getByText('THE CARD HOUSE', { exact: true }).waitFor();
    await page.getByRole('button', { name: /Play Durak prototype/i }).click();
    await page.getByText('Durak', { exact: true }).waitFor();
    await page.getByText('Durak Bot', { exact: true }).waitFor();
    await page.getByText('Trump', { exact: true }).waitFor();
    await page.getByText('Stock', { exact: true }).waitFor();

    const actionReady = await waitUntil(page, async () => {
      const card = await page.locator('button.h-28.w-20:not([disabled])').count();
      const pickup = await page.getByRole('button', { name: /Pick up attack/i }).isVisible().catch(() => false);
      return card > 0 || pickup;
    }, 12000);
    if (!actionReady) throw new Error('No valid Durak action became available.');

    const enabledCard = page.locator('button.h-28.w-20:not([disabled])').first();
    if (await enabledCard.count()) await enabledCard.click();
    else await page.getByRole('button', { name: /Pick up attack/i }).click();
    await page.waitForTimeout(900);
    console.log('PASS durak');

    await page.screenshot({ path: '/tmp/card-house-smoke.png', fullPage: true });
    console.log('PASS all released Card House browser interactions');
  } catch (error) {
    console.error('FAIL', error);
    await page.screenshot({ path: '/tmp/card-house-smoke.png', fullPage: true }).catch(() => {});
    throw error;
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exit(1);
});
