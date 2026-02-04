import { test, expect } from '@playwright/test';

const BASE_URL = 'https://maid-app.databayt.org';

test.describe('RTL Coordinate Test', () => {
  test.setTimeout(180000);

  test('Test RTL with coordinate clicks', async ({ page }) => {
    page.on('console', msg => console.log('Browser:', msg.text()));

    console.log('\n=== Navigate and Setup ===');
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test-results/coord-01-home.png', fullPage: true });

    // Click Register Office
    await page.click('text=Register Office');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test-results/coord-02-login.png', fullPage: true });

    // Switch to Arabic (top right corner - the button shows "العربية")
    try {
      const arabicBtn = page.locator('text=العربية');
      if (await arabicBtn.isVisible({ timeout: 3000 })) {
        await arabicBtn.click();
        await page.waitForTimeout(2000);
        console.log('Switched to Arabic');
      }
    } catch (e) {
      console.log('Arabic button not found');
    }
    await page.screenshot({ path: 'test-results/coord-03-arabic.png', fullPage: true });

    // Fill form using direct input
    const inputs = await page.locator('input').all();
    console.log('Found', inputs.length, 'inputs');

    if (inputs.length >= 2) {
      await inputs[0].fill('office1@test.com');
      await inputs[1].fill('password123');
      console.log('Filled form');
    }
    await page.screenshot({ path: 'test-results/coord-04-filled.png', fullPage: true });

    // Debug: List all clickable elements
    const clickables = await page.evaluate(() => {
      const elements: any[] = [];
      document.querySelectorAll('*').forEach((el) => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        const role = el.getAttribute('role');
        const tabIndex = el.getAttribute('tabindex');
        const className = (el as HTMLElement).className || '';
        const text = (el as HTMLElement).innerText?.substring(0, 50) || '';

        // Check if element is likely clickable
        if (
          el.tagName === 'BUTTON' ||
          el.tagName === 'A' ||
          role === 'button' ||
          tabIndex === '0' ||
          className.includes('Pressable') ||
          className.includes('touchable') ||
          style.cursor === 'pointer'
        ) {
          if (rect.width > 50 && rect.height > 20 && rect.top > 0 && rect.left > 0) {
            elements.push({
              tag: el.tagName,
              role,
              class: className.substring(0, 60),
              text: text.replace(/\n/g, ' ').substring(0, 40),
              x: Math.round(rect.left + rect.width / 2),
              y: Math.round(rect.top + rect.height / 2),
              width: Math.round(rect.width),
              height: Math.round(rect.height)
            });
          }
        }
      });
      return elements;
    });

    console.log('\nClickable elements found:', clickables.length);
    clickables.forEach((el, i) => {
      console.log(`  ${i}: ${el.tag} [${el.role}] "${el.text}" at (${el.x}, ${el.y}) size ${el.width}x${el.height}`);
    });

    // Find the login button - it should be a wide element with "تسجيل الدخول" or pinkish
    // Based on screenshots, the login button is around y=200-250 area
    const loginBtn = clickables.find(el =>
      el.text.includes('الدخول') ||
      el.text.includes('تسجيل') ||
      (el.y > 150 && el.y < 300 && el.width > 200 && el.height > 30)
    );

    if (loginBtn) {
      console.log(`\nClicking login at (${loginBtn.x}, ${loginBtn.y})`);
      await page.mouse.click(loginBtn.x, loginBtn.y);
    } else {
      // Fallback: click where login button typically is (center-ish, below form)
      console.log('\nUsing fallback coordinates for login button');
      const viewport = page.viewportSize();
      if (viewport) {
        // The login button appears to be around 280px from top and centered
        await page.mouse.click(viewport.width / 2, 280);
      }
    }

    await page.waitForTimeout(8000);
    await page.screenshot({ path: 'test-results/coord-05-after-login.png', fullPage: true });
    console.log('URL after login:', page.url());

    // Check if we navigated away from login
    const currentUrl = page.url();
    if (!currentUrl.includes('/login')) {
      console.log('\n=== Login successful! ===');

      // Look for Add Maid
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'test-results/coord-06-dashboard.png', fullPage: true });

      // Get clickable elements on dashboard
      const dashClickables = await page.evaluate(() => {
        const elements: any[] = [];
        document.querySelectorAll('[role="button"], [tabindex="0"]').forEach((el) => {
          const rect = el.getBoundingClientRect();
          const text = (el as HTMLElement).innerText?.substring(0, 50) || '';
          if (rect.width > 30 && rect.height > 20) {
            elements.push({
              text: text.replace(/\n/g, ' '),
              x: Math.round(rect.left + rect.width / 2),
              y: Math.round(rect.top + rect.height / 2)
            });
          }
        });
        return elements;
      });

      console.log('\nDashboard clickables:', dashClickables.length);
      dashClickables.forEach((el, i) => {
        console.log(`  ${i}: "${el.text}" at (${el.x}, ${el.y})`);
      });

      // Find and click Add Maid
      const addBtn = dashClickables.find(el =>
        el.text.includes('إضافة') || el.text.includes('Add')
      );

      if (addBtn) {
        console.log(`Clicking Add at (${addBtn.x}, ${addBtn.y})`);
        await page.mouse.click(addBtn.x, addBtn.y);
        await page.waitForTimeout(3000);
      }

      await page.screenshot({ path: 'test-results/coord-07-add-maid.png', fullPage: true });

      // Try to start onboarding
      const onboardingClickables = await page.evaluate(() => {
        const elements: any[] = [];
        document.querySelectorAll('[role="button"], [tabindex="0"]').forEach((el) => {
          const rect = el.getBoundingClientRect();
          const text = (el as HTMLElement).innerText?.substring(0, 50) || '';
          if (text.includes('ابدأ') || text.includes('Start') || text.includes('Get')) {
            elements.push({
              text,
              x: Math.round(rect.left + rect.width / 2),
              y: Math.round(rect.top + rect.height / 2)
            });
          }
        });
        return elements;
      });

      if (onboardingClickables.length > 0) {
        const startBtn = onboardingClickables[0];
        console.log(`Clicking Start at (${startBtn.x}, ${startBtn.y})`);
        await page.mouse.click(startBtn.x, startBtn.y);
        await page.waitForTimeout(3000);
      }

      await page.screenshot({ path: 'test-results/coord-08-onboarding.png', fullPage: true });
    }

    // Final RTL analysis
    console.log('\n=== RTL Analysis ===');
    const analysis = await page.evaluate(() => {
      const result = {
        documentDir: document.documentElement.dir,
        bodyDirection: getComputedStyle(document.body).direction,
        lang: document.documentElement.lang,
        progressBars: [] as any[],
        scaleXElements: [] as any[]
      };

      document.querySelectorAll('*').forEach((el) => {
        const style = getComputedStyle(el);
        const transform = style.transform;
        const className = (el as HTMLElement).className || '';

        if (transform === 'matrix(-1, 0, 0, 1, 0, 0)') {
          result.scaleXElements.push({
            tag: el.tagName,
            class: className.substring(0, 60)
          });
        }

        if (className.includes('h-1') || className.includes('progress') || className.includes('Progress')) {
          result.progressBars.push({
            tag: el.tagName,
            class: className.substring(0, 80),
            transform,
            hasRTL: transform === 'matrix(-1, 0, 0, 1, 0, 0)'
          });
        }
      });

      return result;
    });

    console.log('Document dir:', analysis.documentDir);
    console.log('Body direction:', analysis.bodyDirection);
    console.log('Lang:', analysis.lang);
    console.log('Progress bars:', analysis.progressBars.length);
    console.log('Elements with scaleX(-1):', analysis.scaleXElements.length);

    analysis.progressBars.forEach((bar, i) => {
      console.log(`  Progress ${i}: ${bar.class} - RTL=${bar.hasRTL}`);
    });

    analysis.scaleXElements.forEach((el, i) => {
      console.log(`  ScaleX ${i}: ${el.tag} - ${el.class}`);
    });

    await page.screenshot({ path: 'test-results/coord-09-final.png', fullPage: true });

    const isRTL = analysis.documentDir === 'rtl' || analysis.bodyDirection === 'rtl';
    const hasProgressRTL = analysis.progressBars.some(b => b.hasRTL);

    console.log('\n=== VERDICT ===');
    console.log('RTL Mode:', isRTL);
    console.log('Progress Bar RTL:', hasProgressRTL);
    if (isRTL && hasProgressRTL) {
      console.log('[PASS] Progress bar fills RIGHT to LEFT');
    } else if (isRTL) {
      console.log('[CHECK] RTL mode but no scaleX(-1) on progress bar');
    } else {
      console.log('[INFO] Not in RTL mode');
    }
  });
});
