import { test, expect } from '@playwright/test';

const BASE_URL = 'https://maid-app.databayt.org';

test.describe('RTL Progress Bar Test v2', () => {
  test.setTimeout(240000); // 4 minutes

  test('Verify progress bar RTL behavior on production', async ({ page }) => {
    // Enable verbose logging
    page.on('console', msg => console.log('Browser:', msg.text()));
    page.on('pageerror', err => console.log('Page Error:', err.message));

    console.log('\n=== STEP 1: Navigate to Production App ===');
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

    // Wait for the SPA to hydrate
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'test-results/rtl-v2-01-initial.png', fullPage: true });

    // Check if we're on a login page or home page
    const pageContent = await page.content();
    console.log('Page contains "login":', pageContent.toLowerCase().includes('login'));
    console.log('Page contains "تسجيل":', pageContent.includes('تسجيل'));

    // Take screenshot to see what's on the page
    await page.screenshot({ path: 'test-results/rtl-v2-02-after-wait.png', fullPage: true });

    console.log('\n=== STEP 2: Set Arabic Language ===');
    // Try setting the language storage key
    await page.evaluate(() => {
      localStorage.setItem('app_language', 'ar');
      localStorage.setItem('language', 'ar');
      localStorage.setItem('i18nextLng', 'ar');
      // Also try common language storage keys
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.setAttribute('lang', 'ar');
    });

    // Reload after language set
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'test-results/rtl-v2-03-arabic-set.png', fullPage: true });

    console.log('\n=== STEP 3: Login as Office Admin ===');

    // Look for language selector or login button
    const loginButton = page.locator('text=/login|تسجيل|sign in/i').first();
    const officeLink = page.locator('text=/office|مكتب/i').first();

    // Try clicking on login or office link if visible
    try {
      // First try to find login button directly on the page
      if (await loginButton.isVisible({ timeout: 3000 })) {
        console.log('Found login button, clicking...');
        await loginButton.click();
        await page.waitForTimeout(2000);
      }
    } catch (e) {
      console.log('Login button not directly visible');
    }

    await page.screenshot({ path: 'test-results/rtl-v2-04-after-login-click.png', fullPage: true });

    // Navigate directly to office login
    console.log('\n=== STEP 4: Navigate to Office Login ===');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'test-results/rtl-v2-05-login-page.png', fullPage: true });

    // Check if we need to switch to office login tab
    const officeTab = page.locator('text=/office|مكتب/i').first();
    try {
      if (await officeTab.isVisible({ timeout: 3000 })) {
        console.log('Found office tab, clicking...');
        await officeTab.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'test-results/rtl-v2-06-office-tab.png', fullPage: true });
      }
    } catch (e) {
      console.log('Office tab not visible');
    }

    // Fill in login credentials
    console.log('\n=== STEP 5: Enter Login Credentials ===');

    // Find email input
    const emailInput = page.locator('input[type="email"], input[placeholder*="email"], input[placeholder*="بريد"]').first();
    const passwordInput = page.locator('input[type="password"]').first();

    try {
      if (await emailInput.isVisible({ timeout: 5000 })) {
        await emailInput.fill('office1@test.com');
        console.log('Email entered');
      }

      if (await passwordInput.isVisible({ timeout: 3000 })) {
        await passwordInput.fill('password123');
        console.log('Password entered');
      }

      await page.screenshot({ path: 'test-results/rtl-v2-07-credentials.png', fullPage: true });

      // Click login/submit button
      const submitBtn = page.locator('button[type="submit"], button:has-text("login"), button:has-text("تسجيل الدخول")').first();
      if (await submitBtn.isVisible({ timeout: 3000 })) {
        await submitBtn.click();
        console.log('Submitted login form');
        await page.waitForTimeout(5000);
      }
    } catch (e) {
      console.log('Could not fill login form:', e);
    }

    await page.screenshot({ path: 'test-results/rtl-v2-08-after-login.png', fullPage: true });

    console.log('\n=== STEP 6: Navigate to Maid Onboarding/Add Maid ===');

    // Try different routes to find the maid onboarding
    const onboardingRoutes = [
      '/maid-onboarding',
      '/office/add-maid',
      '/add-maid',
      '/(office)/add-maid',
      '/maids/add',
      '/office/maids/add'
    ];

    // First check current URL
    console.log('Current URL:', page.url());

    // Look for an "Add Maid" button on current page
    const addMaidButton = page.locator('text=/add maid|إضافة عاملة|أضف عاملة/i').first();
    try {
      if (await addMaidButton.isVisible({ timeout: 5000 })) {
        console.log('Found Add Maid button');
        await addMaidButton.click();
        await page.waitForTimeout(3000);
      }
    } catch (e) {
      console.log('Add Maid button not found, trying direct navigation');

      // Try navigating to onboarding route
      for (const route of onboardingRoutes) {
        await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(3000);

        // Check if we got a valid page (not 404)
        const has404 = await page.locator('text=/404|NOT_FOUND/').isVisible({ timeout: 1000 }).catch(() => false);
        if (!has404) {
          console.log(`Found valid route: ${route}`);
          break;
        }
      }
    }

    await page.screenshot({ path: 'test-results/rtl-v2-09-onboarding-page.png', fullPage: true });

    console.log('\n=== STEP 7: Analyze Progress Bar ===');

    // Wait a bit more for the page to fully render
    await page.waitForTimeout(2000);

    // Analyze the progress bar
    const progressAnalysis = await page.evaluate(() => {
      const results: any = {
        progressBars: [],
        documentDir: document.documentElement.dir,
        bodyDir: document.body.dir || getComputedStyle(document.body).direction,
        language: localStorage.getItem('app_language') || localStorage.getItem('language')
      };

      // Look for progress bar elements
      // Check for common progress bar patterns
      const potentialBars = document.querySelectorAll([
        '.h-1',
        '.h-2',
        '[class*="progress"]',
        '[class*="Progress"]',
        '[role="progressbar"]',
        '.bg-primary',
        '.bg-blue-500',
        '.bg-success'
      ].join(', '));

      potentialBars.forEach((el, i) => {
        const style = window.getComputedStyle(el);
        const transform = style.transform;
        const parent = el.parentElement;
        const parentStyle = parent ? window.getComputedStyle(parent) : null;

        results.progressBars.push({
          index: i,
          className: el.className,
          width: style.width,
          transform: transform,
          hasScaleXMinus1: transform.includes('-1') || transform.includes('scaleX(-1)') || transform === 'matrix(-1, 0, 0, 1, 0, 0)',
          parentTransform: parentStyle?.transform || 'none',
          parentClassName: parent?.className || 'none'
        });
      });

      return results;
    });

    console.log('\nDocument direction:', progressAnalysis.documentDir);
    console.log('Body direction:', progressAnalysis.bodyDir);
    console.log('Language stored:', progressAnalysis.language);
    console.log('\nFound', progressAnalysis.progressBars.length, 'potential progress elements');

    progressAnalysis.progressBars.forEach((bar: any) => {
      console.log(`\nBar ${bar.index}:`);
      console.log(`  Class: ${bar.className}`);
      console.log(`  Transform: ${bar.transform}`);
      console.log(`  Has scaleX(-1): ${bar.hasScaleXMinus1}`);
      console.log(`  Parent transform: ${bar.parentTransform}`);
    });

    // Check if any progress bar has RTL transform
    const hasRTLProgressBar = progressAnalysis.progressBars.some((bar: any) => bar.hasScaleXMinus1);

    await page.screenshot({ path: 'test-results/rtl-v2-10-final.png', fullPage: true });

    console.log('\n=== FINAL RESULTS ===');
    console.log('Document direction (dir attribute):', progressAnalysis.documentDir);
    console.log('RTL transform applied to progress bar:', hasRTLProgressBar);

    if (progressAnalysis.documentDir === 'rtl' && hasRTLProgressBar) {
      console.log('\n[PASS] RTL progress bar is correctly configured');
      console.log('Progress bar fills from RIGHT to LEFT');
    } else if (progressAnalysis.documentDir === 'rtl' && !hasRTLProgressBar) {
      console.log('\n[POTENTIAL ISSUE] In RTL mode but no scaleX(-1) detected');
      console.log('Progress bar might fill from LEFT to RIGHT incorrectly');
    } else {
      console.log('\n[INFO] Not in RTL mode - RTL transform not expected');
    }

    console.log('\n=== Screenshots saved to test-results/ ===');
  });
});
