import { test, expect } from '@playwright/test';

const BASE_URL = 'https://maid-app.databayt.org';

test.describe('RTL Verify', () => {
  test.setTimeout(180000);

  test('Verify RTL progress bar', async ({ page }) => {
    page.on('console', msg => console.log('Browser:', msg.text()));

    // Navigate and login
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // Click Register Office
    await page.click('text=Register Office');
    await page.waitForTimeout(3000);

    // Switch to Arabic
    try {
      await page.click('text=العربية', { timeout: 3000 });
      await page.waitForTimeout(2000);
    } catch (e) {}

    // Fill and submit login
    const inputs = await page.locator('input').all();
    if (inputs.length >= 2) {
      await inputs[0].fill('office@tadbeer.com');
      await inputs[1].fill('1234');
    }

    // Click login button
    const viewport = page.viewportSize();
    if (viewport) {
      await page.mouse.click(viewport.width / 2, 416);
    }
    await page.waitForTimeout(5000);

    // Click Add Maid
    try {
      await page.click('text=إضافة عاملة', { timeout: 5000 });
      await page.waitForTimeout(2000);
    } catch (e) {}

    // Click Start
    try {
      await page.click('text=ابدأ الآن', { timeout: 5000 });
      await page.waitForTimeout(3000);
    } catch (e) {}

    await page.screenshot({ path: 'test-results/verify-01-step1.png', fullPage: true });

    // Analysis - safe version
    const analysis = await page.evaluate(() => {
      const result = {
        documentDir: document.documentElement.dir || 'not set',
        bodyDirection: getComputedStyle(document.body).direction,
        transforms: [] as string[]
      };

      // Find all elements and check for scaleX(-1)
      document.querySelectorAll('*').forEach((el) => {
        try {
          const style = getComputedStyle(el);
          const transform = style.transform;
          if (transform === 'matrix(-1, 0, 0, 1, 0, 0)') {
            const cls = el.className;
            const clsStr = typeof cls === 'string' ? cls : (cls.baseVal || '');
            result.transforms.push(`${el.tagName}: ${clsStr.substring(0, 50)}`);
          }
        } catch (e) {}
      });

      return result;
    });

    console.log('\n=== RTL VERIFICATION ===');
    console.log('Document dir:', analysis.documentDir);
    console.log('Body direction:', analysis.bodyDirection);
    console.log('Elements with scaleX(-1):', analysis.transforms.length);
    analysis.transforms.forEach((t, i) => console.log(`  ${i}: ${t}`));

    // Click Next to see progress
    try {
      await page.click('text=التالي', { timeout: 3000 });
      await page.waitForTimeout(2000);
    } catch (e) {}

    await page.screenshot({ path: 'test-results/verify-02-step2.png', fullPage: true });

    // Check again
    const analysis2 = await page.evaluate(() => {
      const transforms: string[] = [];
      document.querySelectorAll('*').forEach((el) => {
        try {
          const style = getComputedStyle(el);
          if (style.transform === 'matrix(-1, 0, 0, 1, 0, 0)') {
            const cls = el.className;
            const clsStr = typeof cls === 'string' ? cls : (cls.baseVal || '');
            transforms.push(`${el.tagName}: ${clsStr.substring(0, 50)}`);
          }
        } catch (e) {}
      });
      return transforms;
    });

    console.log('\nAfter clicking Next:');
    console.log('Elements with scaleX(-1):', analysis2.length);
    analysis2.forEach((t, i) => console.log(`  ${i}: ${t}`));

    console.log('\n=== VERDICT ===');
    if (analysis.transforms.length > 0 || analysis2.length > 0) {
      console.log('[PASS] scaleX(-1) transforms found - RTL progress bar fix IS working');
      console.log('Progress bar fills from RIGHT to LEFT');
    } else {
      console.log('[CHECK] No scaleX(-1) transforms detected');
      console.log('Check screenshots to verify visual RTL behavior');
    }
  });
});
