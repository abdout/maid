import { test, expect } from '@playwright/test';

const BASE_URL = 'https://maid-app.databayt.org';

test.describe('RTL Progress Bar Simple Test', () => {
  test.setTimeout(180000); // 3 minutes

  test('Test RTL progress bar', async ({ page }) => {
    page.on('console', msg => console.log('Browser:', msg.text()));

    console.log('\n=== STEP 1: Go to App ===');
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test-results/simple-01-home.png', fullPage: true });

    console.log('\n=== STEP 2: Click Register Office ===');
    await page.click('text=Register Office');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test-results/simple-02-login.png', fullPage: true });

    console.log('\n=== STEP 3: Switch to Arabic ===');
    try {
      await page.click('text=العربية', { timeout: 3000 });
      await page.waitForTimeout(2000);
      console.log('Switched to Arabic');
    } catch (e) {
      console.log('Already in Arabic or button not found');
    }
    await page.screenshot({ path: 'test-results/simple-03-arabic.png', fullPage: true });

    console.log('\n=== STEP 4: Fill and Submit Login ===');
    // Fill form
    const emailInput = page.locator('input').first();
    await emailInput.fill('office1@test.com');

    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill('password123');

    await page.screenshot({ path: 'test-results/simple-04-filled.png', fullPage: true });

    // Find and click the pink submit button (it's likely a button with specific styling)
    // The button contains Arabic text "تسجيل الدخول"
    const loginButton = page.locator('button.bg-pink-500, button[class*="bg-primary"], button[class*="pink"]').first();

    if (await loginButton.isVisible({ timeout: 2000 })) {
      await loginButton.click();
      console.log('Clicked login button by class');
    } else {
      // Try clicking any button with Arabic login text
      await page.click('button >> text=تسجيل');
      console.log('Clicked button with تسجيل text');
    }

    await page.waitForTimeout(8000);
    await page.screenshot({ path: 'test-results/simple-05-after-login.png', fullPage: true });
    console.log('URL after login:', page.url());

    console.log('\n=== STEP 5: Look for Add Maid ===');
    // Check current page state
    const pageText = await page.evaluate(() => document.body.innerText.substring(0, 800));
    console.log('Page content preview:', pageText);

    // Try to find Add Maid button
    const addButtons = await page.locator('button, a').allTextContents();
    console.log('Available buttons:', addButtons.filter(t => t.trim()).slice(0, 10));

    // Click Add Maid if visible
    try {
      await page.click('text=/إضافة|Add/i', { timeout: 5000 });
      console.log('Clicked Add button');
      await page.waitForTimeout(3000);
    } catch (e) {
      console.log('Add button not directly visible');
    }

    await page.screenshot({ path: 'test-results/simple-06-dashboard.png', fullPage: true });

    console.log('\n=== STEP 6: Analyze RTL and Progress Bar ===');

    const analysis = await page.evaluate(() => {
      const result: any = {
        documentDir: document.documentElement.dir,
        bodyDirection: getComputedStyle(document.body).direction,
        progressBars: [],
        scaleXElements: []
      };

      // Find all elements and check transforms
      document.querySelectorAll('*').forEach((el) => {
        const style = window.getComputedStyle(el);
        const transform = style.transform;
        const className = (el as HTMLElement).className || '';

        // Check for scaleX(-1) which indicates RTL flip
        if (transform === 'matrix(-1, 0, 0, 1, 0, 0)') {
          result.scaleXElements.push({
            tag: el.tagName,
            class: className.substring(0, 80)
          });
        }

        // Look for progress bar elements
        if (className.includes('h-1') || className.includes('progress')) {
          result.progressBars.push({
            tag: el.tagName,
            class: className.substring(0, 80),
            transform: transform,
            hasRTLTransform: transform === 'matrix(-1, 0, 0, 1, 0, 0)'
          });
        }
      });

      return result;
    });

    console.log('\n=== RTL ANALYSIS ===');
    console.log('Document dir:', analysis.documentDir);
    console.log('Body direction:', analysis.bodyDirection);
    console.log('Progress bars found:', analysis.progressBars.length);
    console.log('Elements with scaleX(-1):', analysis.scaleXElements.length);

    analysis.progressBars.forEach((bar: any, i: number) => {
      console.log(`\nProgress Bar ${i + 1}:`);
      console.log(`  Class: ${bar.class}`);
      console.log(`  Transform: ${bar.transform}`);
      console.log(`  Has RTL transform: ${bar.hasRTLTransform}`);
    });

    analysis.scaleXElements.forEach((el: any, i: number) => {
      console.log(`\nScaleX Element ${i + 1}: ${el.tag} - ${el.class}`);
    });

    await page.screenshot({ path: 'test-results/simple-07-final.png', fullPage: true });

    // Final result
    const isRTL = analysis.documentDir === 'rtl' || analysis.bodyDirection === 'rtl';
    const hasProgressBarRTL = analysis.progressBars.some((b: any) => b.hasRTLTransform);

    console.log('\n=== VERDICT ===');
    console.log('RTL Mode:', isRTL);
    console.log('Progress Bar RTL Transform:', hasProgressBarRTL);

    if (isRTL && hasProgressBarRTL) {
      console.log('[PASS] Progress bar correctly fills RIGHT to LEFT');
    } else if (isRTL) {
      console.log('[CHECK] In RTL but no scaleX(-1) on progress bar');
    } else {
      console.log('[INFO] Not in RTL mode');
    }
  });
});
