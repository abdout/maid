import { test, expect } from '@playwright/test';

const BASE_URL = 'https://maid-app.databayt.org';

test.describe('RTL Progress Bar Test v3', () => {
  test.setTimeout(300000); // 5 minutes

  test('Navigate through UI to test progress bar RTL', async ({ page }) => {
    // Enable verbose logging
    page.on('console', msg => console.log('Browser:', msg.text()));
    page.on('pageerror', err => console.log('Page Error:', err.message));

    console.log('\n=== STEP 1: Navigate to Production App ===');
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'test-results/rtl-v3-01-home.png', fullPage: true });

    // Check for language selector and switch to Arabic
    console.log('\n=== STEP 2: Switch to Arabic Language ===');

    // Look for language selector (globe icon, "EN", "العربية", etc.)
    const langSelector = page.locator('[data-testid="language-selector"], button:has-text("EN"), button:has-text("English"), [aria-label*="language"]').first();

    try {
      if (await langSelector.isVisible({ timeout: 3000 })) {
        await langSelector.click();
        await page.waitForTimeout(1000);

        // Click Arabic option
        const arabicOption = page.locator('text=/العربية|Arabic|ar/i').first();
        if (await arabicOption.isVisible({ timeout: 2000 })) {
          await arabicOption.click();
          await page.waitForTimeout(2000);
        }
      }
    } catch (e) {
      console.log('Language selector not found or already in Arabic');
    }

    // Set language via localStorage as backup
    await page.evaluate(() => {
      localStorage.setItem('app_language', 'ar');
      localStorage.setItem('language', 'ar');
      localStorage.setItem('i18nextLng', 'ar');
    });

    await page.screenshot({ path: 'test-results/rtl-v3-02-arabic.png', fullPage: true });

    console.log('\n=== STEP 3: Click on Register Office ===');

    // From the homepage, click on "Register Office" / "تسجيل مكتب"
    const registerOfficeCard = page.locator('text=/Register Office|تسجيل مكتب/i').first();

    try {
      if (await registerOfficeCard.isVisible({ timeout: 5000 })) {
        await registerOfficeCard.click();
        console.log('Clicked Register Office');
        await page.waitForTimeout(3000);
      }
    } catch (e) {
      console.log('Register Office not visible, trying alternative navigation');
    }

    await page.screenshot({ path: 'test-results/rtl-v3-03-after-register-click.png', fullPage: true });

    // Check if we're on an office registration/login page
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);

    console.log('\n=== STEP 4: Login as Office Admin ===');

    // Look for login form elements
    const emailInput = page.locator('input[type="email"], input[placeholder*="email"], input[placeholder*="بريد"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();

    try {
      // Wait for form to appear
      await page.waitForTimeout(2000);

      if (await emailInput.isVisible({ timeout: 5000 })) {
        await emailInput.fill('office1@test.com');
        console.log('Email entered');
        await page.waitForTimeout(500);
      }

      if (await passwordInput.isVisible({ timeout: 3000 })) {
        await passwordInput.fill('password123');
        console.log('Password entered');
        await page.waitForTimeout(500);
      }

      await page.screenshot({ path: 'test-results/rtl-v3-04-login-form.png', fullPage: true });

      // Click login/submit button
      const submitBtn = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("تسجيل الدخول"), button:has-text("Sign in")').first();
      if (await submitBtn.isVisible({ timeout: 3000 })) {
        await submitBtn.click();
        console.log('Clicked login button');
        await page.waitForTimeout(5000);
      }
    } catch (e) {
      console.log('Could not fill login form:', e);
    }

    await page.screenshot({ path: 'test-results/rtl-v3-05-after-login.png', fullPage: true });
    console.log('URL after login:', page.url());

    console.log('\n=== STEP 5: Navigate to Add Maid ===');

    // Look for "Add Maid" / "إضافة عاملة" button or link
    const addMaidButton = page.locator('text=/Add Maid|إضافة عاملة|أضف عاملة|Add Worker|إضافة/i').first();
    const plusIcon = page.locator('[aria-label*="add"], button:has(svg), [data-testid="add-maid"]').first();

    try {
      await page.waitForTimeout(2000);

      if (await addMaidButton.isVisible({ timeout: 5000 })) {
        await addMaidButton.click();
        console.log('Clicked Add Maid button');
        await page.waitForTimeout(3000);
      } else if (await plusIcon.isVisible({ timeout: 3000 })) {
        await plusIcon.click();
        console.log('Clicked plus icon');
        await page.waitForTimeout(3000);
      }
    } catch (e) {
      console.log('Add Maid button not found');
    }

    await page.screenshot({ path: 'test-results/rtl-v3-06-add-maid.png', fullPage: true });

    // Check if we're on maid onboarding
    console.log('\n=== STEP 6: Check for Maid Onboarding ===');
    console.log('Current URL:', page.url());

    // Look for "Get Started" or "ابدأ الآن" button
    const getStartedBtn = page.locator('text=/Get started|ابدأ الآن|Start|Begin/i').first();

    try {
      if (await getStartedBtn.isVisible({ timeout: 5000 })) {
        await getStartedBtn.click();
        console.log('Clicked Get Started');
        await page.waitForTimeout(3000);
      }
    } catch (e) {
      console.log('Get Started button not found');
    }

    await page.screenshot({ path: 'test-results/rtl-v3-07-onboarding-step1.png', fullPage: true });

    console.log('\n=== STEP 7: Analyze Progress Bar ===');

    // Comprehensive progress bar analysis
    const progressAnalysis = await page.evaluate(() => {
      const results: any = {
        documentDir: document.documentElement.dir || 'not set',
        documentLang: document.documentElement.lang || 'not set',
        bodyDir: getComputedStyle(document.body).direction,
        progressBars: [],
        allElementsWithScaleX: []
      };

      // Find all elements with potential progress bar styling
      const allElements = document.querySelectorAll('*');

      allElements.forEach((el, i) => {
        const style = window.getComputedStyle(el);
        const transform = style.transform;
        const className = (el as HTMLElement).className || '';

        // Check if element has scaleX(-1)
        if (transform && (transform.includes('-1') || transform === 'matrix(-1, 0, 0, 1, 0, 0)')) {
          results.allElementsWithScaleX.push({
            tagName: el.tagName,
            className: className.substring(0, 100),
            transform: transform
          });
        }

        // Look for progress bar patterns
        if (
          className.includes('progress') ||
          className.includes('h-1') ||
          className.includes('h-2') ||
          className.includes('bg-primary') ||
          className.includes('bg-blue') ||
          (el as HTMLElement).getAttribute('role') === 'progressbar'
        ) {
          results.progressBars.push({
            tagName: el.tagName,
            className: className.substring(0, 150),
            width: style.width,
            height: style.height,
            transform: transform,
            backgroundColor: style.backgroundColor,
            hasScaleXMinus1: transform.includes('-1') || transform === 'matrix(-1, 0, 0, 1, 0, 0)'
          });
        }
      });

      return results;
    });

    console.log('\n=== PROGRESS BAR ANALYSIS ===');
    console.log('Document dir:', progressAnalysis.documentDir);
    console.log('Document lang:', progressAnalysis.documentLang);
    console.log('Body direction:', progressAnalysis.bodyDir);
    console.log('\nProgress bar elements found:', progressAnalysis.progressBars.length);

    progressAnalysis.progressBars.forEach((bar: any, i: number) => {
      console.log(`\nProgress Bar ${i + 1}:`);
      console.log(`  Tag: ${bar.tagName}`);
      console.log(`  Class: ${bar.className}`);
      console.log(`  Transform: ${bar.transform}`);
      console.log(`  Has scaleX(-1): ${bar.hasScaleXMinus1}`);
    });

    console.log('\nElements with scaleX(-1) transform:', progressAnalysis.allElementsWithScaleX.length);
    progressAnalysis.allElementsWithScaleX.forEach((el: any, i: number) => {
      console.log(`  ${i + 1}. ${el.tagName} - ${el.className.substring(0, 50)}`);
    });

    await page.screenshot({ path: 'test-results/rtl-v3-08-final.png', fullPage: true });

    // Determine RTL status
    const isRTL = progressAnalysis.documentDir === 'rtl' || progressAnalysis.bodyDir === 'rtl';
    const hasRTLTransformOnProgressBar = progressAnalysis.progressBars.some((bar: any) => bar.hasScaleXMinus1);
    const hasAnyScaleXTransform = progressAnalysis.allElementsWithScaleX.length > 0;

    console.log('\n=== FINAL RESULTS ===');
    console.log('Is in RTL mode:', isRTL);
    console.log('Progress bar has scaleX(-1):', hasRTLTransformOnProgressBar);
    console.log('Any element has scaleX(-1):', hasAnyScaleXTransform);

    if (isRTL && hasRTLTransformOnProgressBar) {
      console.log('\n[PASS] RTL progress bar fix is WORKING');
      console.log('Progress bar fills from RIGHT to LEFT in Arabic mode');
    } else if (isRTL && !hasRTLTransformOnProgressBar) {
      console.log('\n[FAIL] RTL mode active but progress bar missing scaleX(-1)');
      console.log('Progress bar may incorrectly fill from LEFT to RIGHT');
    } else if (!isRTL && hasAnyScaleXTransform) {
      console.log('\n[INFO] Not in RTL mode but scaleX transforms found');
    } else {
      console.log('\n[INFO] Not in RTL mode, RTL transform not expected');
    }

    console.log('\n=== Screenshots saved to test-results/ ===');
  });
});
