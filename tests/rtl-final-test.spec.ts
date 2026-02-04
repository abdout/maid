import { test, expect } from '@playwright/test';

const BASE_URL = 'https://maid-app.databayt.org';

// Correct credentials from seed.ts
const CREDENTIALS = {
  email: 'office@tadbeer.com',
  password: '1234'
};

test.describe('RTL Progress Bar Final Test', () => {
  test.setTimeout(180000);

  test('Test RTL progress bar with correct credentials', async ({ page }) => {
    page.on('console', msg => console.log('Browser:', msg.text()));

    console.log('\n=== STEP 1: Navigate to App ===');
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test-results/final2-01-home.png', fullPage: true });

    console.log('\n=== STEP 2: Click Register Office ===');
    await page.click('text=Register Office');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test-results/final2-02-login.png', fullPage: true });

    console.log('\n=== STEP 3: Switch to Arabic ===');
    try {
      await page.click('text=العربية', { timeout: 3000 });
      await page.waitForTimeout(2000);
      console.log('Switched to Arabic');
    } catch (e) {
      console.log('Already in Arabic or button not found');
    }
    await page.screenshot({ path: 'test-results/final2-03-arabic.png', fullPage: true });

    console.log('\n=== STEP 4: Fill Login Form ===');
    const inputs = await page.locator('input').all();
    console.log('Found', inputs.length, 'inputs');

    if (inputs.length >= 2) {
      await inputs[0].fill(CREDENTIALS.email);
      await inputs[1].fill(CREDENTIALS.password);
      console.log(`Filled form with ${CREDENTIALS.email}`);
    }
    await page.screenshot({ path: 'test-results/final2-04-filled.png', fullPage: true });

    console.log('\n=== STEP 5: Click Login Button ===');
    // Find clickable elements
    const clickables = await page.evaluate(() => {
      const elements: any[] = [];
      document.querySelectorAll('*').forEach((el) => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        const text = (el as HTMLElement).innerText?.replace(/\n/g, ' ').substring(0, 50) || '';

        if (
          style.cursor === 'pointer' &&
          rect.width > 100 &&
          rect.height > 30 &&
          rect.top > 150 &&
          rect.top < 450
        ) {
          elements.push({
            text,
            x: Math.round(rect.left + rect.width / 2),
            y: Math.round(rect.top + rect.height / 2),
            width: Math.round(rect.width)
          });
        }
      });
      return elements;
    });

    // Find login button (the wide one with "تسجيل الدخول" or "Login")
    const loginBtn = clickables.find(el =>
      el.text.includes('الدخول') || el.text.includes('Login')
    );

    if (loginBtn) {
      console.log(`Clicking login at (${loginBtn.x}, ${loginBtn.y}): "${loginBtn.text}"`);
      await page.mouse.click(loginBtn.x, loginBtn.y);
    } else {
      console.log('Login button not found, using fallback');
      // Click the first wide element which is likely the login button
      const viewport = page.viewportSize();
      if (viewport) {
        await page.mouse.click(viewport.width / 2, 350);
      }
    }

    await page.waitForTimeout(8000);
    await page.screenshot({ path: 'test-results/final2-05-after-login.png', fullPage: true });
    console.log('URL after login:', page.url());

    // Check if login succeeded
    const currentUrl = page.url();
    const loginSuccess = !currentUrl.includes('/login');

    if (loginSuccess) {
      console.log('\n=== LOGIN SUCCESSFUL! ===');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'test-results/final2-06-dashboard.png', fullPage: true });

      // Find and click Add Maid button
      console.log('\n=== STEP 6: Find Add Maid ===');
      const dashText = await page.evaluate(() => document.body.innerText.substring(0, 1000));
      console.log('Dashboard preview:', dashText.substring(0, 300));

      // Look for Add/Plus button
      const addClickables = await page.evaluate(() => {
        const elements: any[] = [];
        document.querySelectorAll('[role="button"], [tabindex="0"]').forEach((el) => {
          const rect = el.getBoundingClientRect();
          const text = (el as HTMLElement).innerText?.replace(/\n/g, ' ') || '';
          if (rect.width > 30 && rect.height > 30 && rect.top > 0) {
            elements.push({
              text: text.substring(0, 50),
              x: Math.round(rect.left + rect.width / 2),
              y: Math.round(rect.top + rect.height / 2)
            });
          }
        });
        return elements;
      });

      console.log('Clickable elements:', addClickables.map(e => e.text).join(', '));

      // Look for Add button
      const addBtn = addClickables.find(el =>
        el.text.includes('إضافة') || el.text.includes('Add') || el.text.includes('+')
      );

      if (addBtn) {
        console.log(`Clicking Add at (${addBtn.x}, ${addBtn.y}): "${addBtn.text}"`);
        await page.mouse.click(addBtn.x, addBtn.y);
        await page.waitForTimeout(3000);
      }

      await page.screenshot({ path: 'test-results/final2-07-after-add.png', fullPage: true });

      // Look for Get Started / Start button
      console.log('\n=== STEP 7: Look for Onboarding Start ===');
      const startClickables = await page.evaluate(() => {
        const elements: any[] = [];
        document.querySelectorAll('*').forEach((el) => {
          const text = (el as HTMLElement).innerText?.replace(/\n/g, ' ') || '';
          const rect = el.getBoundingClientRect();
          const style = window.getComputedStyle(el);

          if (
            (text.includes('ابدأ') || text.includes('Start') || text.includes('Get started')) &&
            rect.width > 50 &&
            style.cursor === 'pointer'
          ) {
            elements.push({
              text: text.substring(0, 50),
              x: Math.round(rect.left + rect.width / 2),
              y: Math.round(rect.top + rect.height / 2)
            });
          }
        });
        return elements;
      });

      if (startClickables.length > 0) {
        const startBtn = startClickables[0];
        console.log(`Clicking Start at (${startBtn.x}, ${startBtn.y}): "${startBtn.text}"`);
        await page.mouse.click(startBtn.x, startBtn.y);
        await page.waitForTimeout(3000);
      }

      await page.screenshot({ path: 'test-results/final2-08-onboarding.png', fullPage: true });
    } else {
      console.log('\n=== LOGIN FAILED ===');
      // Check for error message
      const pageText = await page.evaluate(() => document.body.innerText);
      if (pageText.includes('error') || pageText.includes('خطأ') || pageText.includes('Invalid')) {
        console.log('Error detected on page');
      }
    }

    // Final RTL Analysis
    console.log('\n=== RTL ANALYSIS ===');

    const analysis = await page.evaluate(() => {
      const result = {
        documentDir: document.documentElement.dir,
        bodyDirection: getComputedStyle(document.body).direction,
        lang: document.documentElement.lang,
        isRTL: false,
        progressBars: [] as any[],
        scaleXElements: [] as any[]
      };

      result.isRTL = result.documentDir === 'rtl' || result.bodyDirection === 'rtl';

      document.querySelectorAll('*').forEach((el) => {
        const style = getComputedStyle(el);
        const transform = style.transform;
        const className = (el as HTMLElement).className || '';

        // Check for scaleX(-1)
        if (transform === 'matrix(-1, 0, 0, 1, 0, 0)') {
          result.scaleXElements.push({
            tag: el.tagName,
            class: className.substring(0, 80)
          });
        }

        // Look for progress bar elements
        if (
          className.includes('h-1') ||
          className.includes('progress') ||
          className.includes('Progress') ||
          className.includes('overflow-hidden')
        ) {
          result.progressBars.push({
            tag: el.tagName,
            class: className.substring(0, 100),
            transform,
            hasRTLTransform: transform === 'matrix(-1, 0, 0, 1, 0, 0)'
          });
        }
      });

      return result;
    });

    console.log('\n--- Analysis Results ---');
    console.log('Document dir:', analysis.documentDir || '(not set)');
    console.log('Body direction:', analysis.bodyDirection);
    console.log('Language:', analysis.lang);
    console.log('Is RTL:', analysis.isRTL);
    console.log('\nProgress bar elements:', analysis.progressBars.length);
    console.log('Elements with scaleX(-1):', analysis.scaleXElements.length);

    analysis.progressBars.forEach((bar, i) => {
      console.log(`\n  [${i}] ${bar.tag}`);
      console.log(`      Class: ${bar.class}`);
      console.log(`      Transform: ${bar.transform}`);
      console.log(`      Has RTL: ${bar.hasRTLTransform}`);
    });

    analysis.scaleXElements.forEach((el, i) => {
      console.log(`\n  ScaleX[${i}]: ${el.tag} - ${el.class}`);
    });

    await page.screenshot({ path: 'test-results/final2-09-final.png', fullPage: true });

    // Final verdict
    const hasProgressBarWithRTL = analysis.progressBars.some(b => b.hasRTLTransform);

    console.log('\n========================================');
    console.log('           FINAL VERDICT');
    console.log('========================================');
    console.log('RTL Mode Active:', analysis.isRTL);
    console.log('Progress Bar has scaleX(-1):', hasProgressBarWithRTL);

    if (analysis.isRTL && hasProgressBarWithRTL) {
      console.log('\n[PASS] RTL Progress Bar Fix WORKING');
      console.log('Progress bar fills from RIGHT to LEFT');
    } else if (analysis.isRTL && !hasProgressBarWithRTL && analysis.progressBars.length > 0) {
      console.log('\n[FAIL] RTL mode but progress bar missing scaleX(-1)');
      console.log('Progress bar may fill LEFT to RIGHT incorrectly');
    } else if (!analysis.isRTL && analysis.scaleXElements.length > 0) {
      console.log('\n[INFO] scaleX(-1) transforms found but not in RTL mode');
    } else if (!analysis.isRTL) {
      console.log('\n[INFO] Not in RTL mode - cannot verify RTL progress bar');
    }

    console.log('========================================\n');
  });
});
