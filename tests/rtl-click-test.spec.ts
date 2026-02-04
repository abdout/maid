import { test, expect } from '@playwright/test';

const BASE_URL = 'https://maid-app.databayt.org';

test.describe('RTL Click Test', () => {
  test.setTimeout(180000);

  test('Test RTL with explicit clicks', async ({ page }) => {
    page.on('console', msg => console.log('Browser:', msg.text()));

    console.log('\n=== Navigate and Login ===');
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // Click Register Office
    await page.click('text=Register Office');
    await page.waitForTimeout(3000);

    // Switch to Arabic
    try {
      await page.click('text=العربية', { timeout: 3000 });
      await page.waitForTimeout(2000);
    } catch (e) {
      console.log('Arabic switch failed or already in Arabic');
    }

    // Fill form
    const inputs = await page.locator('input').all();
    console.log('Found', inputs.length, 'inputs');

    if (inputs.length >= 2) {
      await inputs[0].fill('office1@test.com');
      await inputs[1].fill('password123');
    }

    await page.screenshot({ path: 'test-results/click-01-filled.png', fullPage: true });

    // Find all buttons and log them
    const buttons = await page.locator('button').all();
    console.log('Found', buttons.length, 'buttons');

    for (let i = 0; i < buttons.length; i++) {
      const btn = buttons[i];
      const text = await btn.textContent().catch(() => '');
      const isVisible = await btn.isVisible().catch(() => false);
      console.log(`Button ${i}: visible=${isVisible}, text="${text?.trim()}"`);
    }

    // Try to click the first visible button that's likely the login
    // The login button should be one of the first few buttons
    let clicked = false;
    for (let i = 0; i < Math.min(buttons.length, 5); i++) {
      const btn = buttons[i];
      const isVisible = await btn.isVisible().catch(() => false);
      const text = await btn.textContent().catch(() => '');

      if (isVisible && text && (text.includes('الدخول') || text.includes('login') || text.includes('Login'))) {
        console.log(`Clicking button ${i}: "${text.trim()}"`);
        await btn.click();
        clicked = true;
        break;
      }
    }

    if (!clicked) {
      // Fallback: click by index - the pink button is usually index 0 or 1 of visible buttons
      console.log('Trying fallback click on first visible button');
      for (const btn of buttons) {
        if (await btn.isVisible()) {
          const bbox = await btn.boundingBox();
          if (bbox && bbox.width > 100) { // Login button should be wide
            console.log('Clicking button with width:', bbox.width);
            await btn.click();
            clicked = true;
            break;
          }
        }
      }
    }

    if (!clicked) {
      console.log('Could not find login button, trying Enter key');
      await page.keyboard.press('Enter');
    }

    await page.waitForTimeout(8000);
    await page.screenshot({ path: 'test-results/click-02-after-login.png', fullPage: true });
    console.log('URL after login attempt:', page.url());

    // Check if login succeeded by looking for dashboard elements
    const currentUrl = page.url();
    const loggedIn = !currentUrl.includes('/login');

    if (loggedIn) {
      console.log('\n=== Login successful! ===');

      // Now look for Add Maid
      const pageText = await page.evaluate(() => document.body.innerText);
      console.log('Page text preview:', pageText.substring(0, 500));

      // Try to find and click Add Maid
      try {
        // Look for FAB or Add button
        const addBtn = page.locator('button:has-text("إضافة"), button:has-text("Add"), a:has-text("إضافة")').first();
        if (await addBtn.isVisible({ timeout: 5000 })) {
          await addBtn.click();
          await page.waitForTimeout(3000);
        }
      } catch (e) {
        console.log('Add button not found');
      }

      await page.screenshot({ path: 'test-results/click-03-dashboard.png', fullPage: true });

      // Try clicking Get Started if on onboarding
      try {
        await page.click('text=/ابدأ|Get started|Start/i', { timeout: 5000 });
        await page.waitForTimeout(3000);
      } catch (e) {
        console.log('Get started not found');
      }

      await page.screenshot({ path: 'test-results/click-04-onboarding.png', fullPage: true });

    } else {
      console.log('\n=== Login may have failed ===');
      // Check for error messages
      const errorText = await page.locator('text=/error|خطأ|invalid/i').textContent().catch(() => 'No error visible');
      console.log('Error message:', errorText);
    }

    // Final analysis
    console.log('\n=== RTL Analysis ===');
    const analysis = await page.evaluate(() => {
      return {
        documentDir: document.documentElement.dir,
        bodyDirection: getComputedStyle(document.body).direction,
        lang: document.documentElement.lang,
        scaleXCount: Array.from(document.querySelectorAll('*')).filter(el => {
          const transform = getComputedStyle(el).transform;
          return transform === 'matrix(-1, 0, 0, 1, 0, 0)';
        }).length
      };
    });

    console.log('Document dir:', analysis.documentDir);
    console.log('Body direction:', analysis.bodyDirection);
    console.log('Lang:', analysis.lang);
    console.log('Elements with scaleX(-1):', analysis.scaleXCount);

    await page.screenshot({ path: 'test-results/click-05-final.png', fullPage: true });
  });
});
