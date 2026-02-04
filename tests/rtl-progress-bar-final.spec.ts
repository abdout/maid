import { test, expect } from '@playwright/test';

const BASE_URL = 'https://maid-app.databayt.org';

test.describe('RTL Progress Bar Final Test', () => {
  test.setTimeout(300000); // 5 minutes

  test('Complete flow to test RTL progress bar', async ({ page }) => {
    // Enable verbose logging
    page.on('console', msg => console.log('Browser:', msg.text()));
    page.on('pageerror', err => console.log('Page Error:', err.message));

    console.log('\n=== STEP 1: Navigate to Production App ===');
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test-results/final-01-home.png', fullPage: true });

    console.log('\n=== STEP 2: Click Register Office ===');
    // Click on "Register Office" card
    await page.locator('text=Register Office').click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test-results/final-02-login.png', fullPage: true });

    console.log('\n=== STEP 3: Switch to Arabic ===');
    // Click the Arabic language button in top right
    const arabicButton = page.locator('text=العربية').first();
    if (await arabicButton.isVisible({ timeout: 3000 })) {
      await arabicButton.click();
      await page.waitForTimeout(2000);
      console.log('Switched to Arabic');
    }
    await page.screenshot({ path: 'test-results/final-03-arabic.png', fullPage: true });

    console.log('\n=== STEP 4: Login ===');
    // Fill login form
    await page.locator('input[placeholder="Email"], input[type="email"]').first().fill('office1@test.com');
    await page.locator('input[placeholder="Password"], input[type="password"]').first().fill('password123');
    await page.screenshot({ path: 'test-results/final-04-filled.png', fullPage: true });

    // Click Login button
    await page.locator('button:has-text("Login"), button:has-text("تسجيل الدخول")').first().click();
    console.log('Clicked Login button');

    // Wait for navigation
    await page.waitForTimeout(8000);
    await page.screenshot({ path: 'test-results/final-05-after-login.png', fullPage: true });
    console.log('Current URL after login:', page.url());

    console.log('\n=== STEP 5: Find Add Maid Button ===');
    // Look for tabs or navigation to add maid
    // The office dashboard should have tabs: Maids, Quotations, Settings
    // Or an Add button/FAB

    // Try to find and click Add Maid
    const addMaidSelectors = [
      'button:has-text("إضافة عاملة")',
      'button:has-text("Add Maid")',
      'button:has-text("إضافة")',
      'button:has-text("Add")',
      '[aria-label*="add"]',
      'a:has-text("إضافة عاملة")',
      'a:has-text("Add Maid")'
    ];

    let foundAddMaid = false;
    for (const selector of addMaidSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          await element.click();
          console.log(`Found and clicked: ${selector}`);
          foundAddMaid = true;
          await page.waitForTimeout(3000);
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }

    if (!foundAddMaid) {
      console.log('Add Maid button not found directly, checking page content...');
      // Take screenshot to see current state
      await page.screenshot({ path: 'test-results/final-06-dashboard.png', fullPage: true });

      // Print all visible text for debugging
      const pageText = await page.evaluate(() => document.body.innerText);
      console.log('Page text (first 500 chars):', pageText.substring(0, 500));
    }

    await page.screenshot({ path: 'test-results/final-07-after-add-click.png', fullPage: true });

    console.log('\n=== STEP 6: Check for Get Started / Onboarding ===');
    // Look for Get Started button if we're on onboarding intro
    const getStartedBtn = page.locator('text=/Get started|ابدأ الآن|Start|Begin/i').first();
    try {
      if (await getStartedBtn.isVisible({ timeout: 3000 })) {
        await getStartedBtn.click();
        console.log('Clicked Get Started');
        await page.waitForTimeout(3000);
      }
    } catch (e) {
      console.log('Get Started not found');
    }

    await page.screenshot({ path: 'test-results/final-08-onboarding.png', fullPage: true });

    console.log('\n=== STEP 7: Analyze Progress Bar ===');
    console.log('Current URL:', page.url());

    // Check document direction
    const docDir = await page.evaluate(() => document.documentElement.dir);
    const bodyDir = await page.evaluate(() => getComputedStyle(document.body).direction);
    console.log('Document dir:', docDir);
    console.log('Body direction:', bodyDir);

    // Look for progress bar with various patterns
    const progressAnalysis = await page.evaluate(() => {
      const results: any = {
        documentDir: document.documentElement.dir,
        bodyDir: getComputedStyle(document.body).direction,
        htmlLang: document.documentElement.lang,
        progressElements: [],
        elementsWithTransform: []
      };

      // Find all elements
      const allElements = document.querySelectorAll('*');

      allElements.forEach((el) => {
        const style = window.getComputedStyle(el);
        const transform = style.transform;
        const className = (el as HTMLElement).className || '';
        const tagName = el.tagName.toLowerCase();

        // Check for progress bar patterns
        const isProgressBar =
          className.includes('progress') ||
          className.includes('h-1 ') ||
          className.includes(' h-1') ||
          className === 'h-1' ||
          className.includes('overflow-hidden') ||
          (el as HTMLElement).getAttribute('role') === 'progressbar';

        // Check for scaleX(-1) transform
        const hasScaleXMinus1 =
          transform === 'matrix(-1, 0, 0, 1, 0, 0)' ||
          transform.includes('scaleX(-1)') ||
          (transform.includes('matrix') && transform.includes('-1, 0, 0, 1'));

        if (hasScaleXMinus1) {
          results.elementsWithTransform.push({
            tagName,
            className: className.substring(0, 100),
            transform
          });
        }

        if (isProgressBar && className) {
          results.progressElements.push({
            tagName,
            className: className.substring(0, 150),
            width: style.width,
            height: style.height,
            transform,
            hasScaleXMinus1
          });
        }
      });

      return results;
    });

    console.log('\n=== PROGRESS BAR ANALYSIS ===');
    console.log('Document dir:', progressAnalysis.documentDir);
    console.log('Body direction:', progressAnalysis.bodyDir);
    console.log('HTML lang:', progressAnalysis.htmlLang);
    console.log('\nProgress elements found:', progressAnalysis.progressElements.length);

    progressAnalysis.progressElements.forEach((el: any, i: number) => {
      console.log(`\n  [${i + 1}] ${el.tagName}`);
      console.log(`      Class: ${el.className}`);
      console.log(`      Transform: ${el.transform}`);
      console.log(`      Has scaleX(-1): ${el.hasScaleXMinus1}`);
    });

    console.log('\nElements with scaleX(-1):', progressAnalysis.elementsWithTransform.length);
    progressAnalysis.elementsWithTransform.forEach((el: any, i: number) => {
      console.log(`  [${i + 1}] ${el.tagName} - ${el.className.substring(0, 50)}`);
    });

    await page.screenshot({ path: 'test-results/final-09-analysis.png', fullPage: true });

    // Final verdict
    const isRTL = progressAnalysis.documentDir === 'rtl' || progressAnalysis.bodyDir === 'rtl';
    const hasRTLTransform = progressAnalysis.elementsWithTransform.length > 0;
    const progressBarHasRTL = progressAnalysis.progressElements.some((p: any) => p.hasScaleXMinus1);

    console.log('\n=== FINAL VERDICT ===');
    console.log('Is in RTL mode:', isRTL);
    console.log('Any element has scaleX(-1):', hasRTLTransform);
    console.log('Progress bar has scaleX(-1):', progressBarHasRTL);

    if (isRTL && progressBarHasRTL) {
      console.log('\n[PASS] RTL progress bar is correctly configured');
      console.log('Progress bar fills from RIGHT to LEFT');
    } else if (isRTL && !progressBarHasRTL) {
      console.log('\n[POTENTIAL ISSUE] RTL mode but progress bar missing scaleX(-1)');
    } else if (!isRTL) {
      console.log('\n[INFO] Not in RTL mode');
    }

    console.log('\n=== Test Complete - Screenshots saved ===');
  });
});
