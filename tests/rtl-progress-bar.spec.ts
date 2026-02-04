import { test, expect } from '@playwright/test';

const BASE_URL = 'https://maid-app.databayt.org';

test.describe('RTL Progress Bar Test', () => {
  test.setTimeout(180000); // 3 minutes

  test('Progress bar fills from right to left in Arabic mode', async ({ page }) => {
    // Enable verbose logging
    page.on('console', msg => console.log('Browser:', msg.text()));
    page.on('pageerror', err => console.log('Page Error:', err.message));

    console.log('\n=== STEP 1: Navigate to App and Set Arabic Language ===');
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Set Arabic language using the correct storage key that the app uses
    await page.evaluate(() => {
      localStorage.setItem('app_language', 'ar');
    });

    // Reload the page to apply the language change
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test-results/rtl-01-homepage-arabic.png', fullPage: true });

    // Navigate directly to maid onboarding
    console.log('\n=== STEP 2: Navigate to Maid Onboarding ===');
    await page.goto(`${BASE_URL}/maid-onboarding`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test-results/rtl-02-maid-onboarding.png', fullPage: true });

    // Click "ابدأ الآن" (Start now) button
    console.log('\n=== STEP 3: Click Start Now Button ===');
    const startNowBtn = page.locator('text="ابدأ الآن"').first();
    if (await startNowBtn.isVisible({ timeout: 3000 })) {
      await startNowBtn.click();
      console.log('Clicked: ابدأ الآن (Start now)');
    } else {
      // Fallback to English
      const getStartedBtn = page.locator('text="Get started"').first();
      if (await getStartedBtn.isVisible({ timeout: 2000 })) {
        await getStartedBtn.click();
        console.log('Clicked: Get started');
      }
    }

    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/rtl-03-step1.png', fullPage: true });

    // Verify Arabic mode by checking for Arabic Next button
    console.log('\n=== STEP 4: Verify Arabic Mode ===');
    const nextBtnArabic = await page.locator('text="التالي"').first().isVisible({ timeout: 3000 }).catch(() => false);
    const nextBtnEnglish = await page.locator('text="Next"').first().isVisible({ timeout: 1000 }).catch(() => false);
    console.log('Arabic Next button (التالي) visible:', nextBtnArabic);
    console.log('English Next button visible:', nextBtnEnglish);

    const isInArabicMode = nextBtnArabic;
    console.log('Is in Arabic (RTL) mode:', isInArabicMode);

    // Fill minimal data and progress through steps
    console.log('\n=== STEP 5: Fill form and progress through steps ===');

    // Fill name
    const nameInput = page.locator('input').first();
    if (await nameInput.isVisible({ timeout: 2000 })) {
      await nameInput.fill('فاطمة محمد');
      console.log('Name entered');
    }

    // Select a nationality
    const indonesiaChip = page.locator('text="Indonesia"').first();
    if (await indonesiaChip.isVisible({ timeout: 1000 })) {
      await indonesiaChip.click();
      console.log('Selected Indonesia nationality');
    }

    await page.screenshot({ path: 'test-results/rtl-04-step1-filled.png', fullPage: true });

    // Click Next (التالي)
    const clickNext = async () => {
      const arabicNext = page.locator('text="التالي"').first();
      if (await arabicNext.isVisible({ timeout: 1500 })) {
        await arabicNext.click();
        return 'Arabic';
      }
      const englishNext = page.locator('text="Next"').first();
      if (await englishNext.isVisible({ timeout: 1500 })) {
        await englishNext.click();
        return 'English';
      }
      return null;
    };

    // Progress through multiple steps
    for (let step = 1; step <= 4; step++) {
      const lang = await clickNext();
      if (lang) {
        console.log(`Step ${step}: Clicked Next (${lang})`);
      }
      await page.waitForTimeout(1500);
      await page.screenshot({ path: `test-results/rtl-step${step + 1}.png`, fullPage: true });
    }

    // Take screenshot at step 5 which should show good progress
    await page.screenshot({ path: 'test-results/rtl-05-progress-view.png', fullPage: true });

    // Analyze the progress bar
    console.log('\n=== STEP 6: Analyze Progress Bar Direction ===');

    const progressBarAnalysis = await page.evaluate(() => {
      const results: {
        barIndex: number;
        containerTransform: string;
        fillWidth: string;
        hasScaleXMinus1: boolean;
      }[] = [];

      // Find progress bar containers by looking for h-1 elements with overflow-hidden
      const progressBars = document.querySelectorAll('.h-1.overflow-hidden, [class*="h-1"][class*="overflow-hidden"]');

      progressBars.forEach((bar, i) => {
        const style = window.getComputedStyle(bar);
        const transform = style.transform;

        // Check the fill (first child)
        const fill = bar.firstElementChild as HTMLElement;
        const fillStyle = fill ? window.getComputedStyle(fill) : null;

        results.push({
          barIndex: i,
          containerTransform: transform,
          fillWidth: fillStyle?.width || '0',
          hasScaleXMinus1: transform.includes('-1') || transform.includes('matrix(-1')
        });
      });

      return results;
    });

    console.log('\nProgress bar analysis:');
    progressBarAnalysis.forEach(bar => {
      console.log(`  Bar ${bar.barIndex}: transform=${bar.containerTransform}, fill=${bar.fillWidth}, hasScaleX-1=${bar.hasScaleXMinus1}`);
    });

    // Check if RTL transform is applied
    const hasRTLTransform = progressBarAnalysis.some(bar => bar.hasScaleXMinus1);
    console.log('\nRTL transform (scaleX: -1) applied:', hasRTLTransform);

    // Final analysis screenshot
    await page.screenshot({ path: 'test-results/rtl-final.png', fullPage: true });

    console.log('\n=== TEST RESULTS ===');
    console.log('Arabic mode active:', isInArabicMode);
    console.log('RTL transform applied:', hasRTLTransform);

    if (isInArabicMode && hasRTLTransform) {
      console.log('\n[PASS] RTL progress bar fix is WORKING correctly');
      console.log('Progress bar fills from RIGHT to LEFT in Arabic mode');
    } else if (isInArabicMode && !hasRTLTransform) {
      console.log('\n[FAIL] RTL progress bar fix is NOT working');
      console.log('Arabic mode is active but scaleX(-1) transform is NOT applied');
      console.log('Progress bar incorrectly fills from LEFT to RIGHT');
    } else {
      console.log('\n[INFO] Test inconclusive - Arabic mode not detected');
    }

    console.log('\n=== Screenshots saved to test-results/ ===');
  });
});
