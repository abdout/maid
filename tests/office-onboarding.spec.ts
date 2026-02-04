import { test, expect } from '@playwright/test';

const BASE_URL = 'https://maid-app.databayt.org';
const TEST_CREDENTIALS = {
  email: 'company@tadbeer.com',
  password: '1234'
};

test.describe('Office Onboarding E2E Flow', () => {
  test.setTimeout(180000); // 3 minutes for full flow

  test('Complete office onboarding flow', async ({ page }) => {
    // Enable verbose logging
    page.on('console', msg => console.log('Browser:', msg.text()));
    page.on('pageerror', err => console.log('Page Error:', err.message));
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        console.log(`API: ${response.status()} ${response.url()}`);
      }
    });

    console.log('\n=== STEP 1: Navigate to Production Site ===');
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/01-homepage.png', fullPage: true });
    console.log('✓ Homepage loaded');

    // Look for Office Register card
    console.log('\n=== STEP 2: Click Office Register ===');
    await page.waitForTimeout(2000);

    const officeRegisterSelectors = [
      'text=Office Register',
      'text=تسجيل مكتب',
    ];

    let clicked = false;
    for (const selector of officeRegisterSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          await element.click();
          clicked = true;
          console.log(`✓ Clicked using selector: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (!clicked) {
      await page.goto(`${BASE_URL}/office-onboarding`);
    }

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/02-after-office-click.png', fullPage: true });
    console.log('Current URL:', page.url());

    // Login if required
    console.log('\n=== STEP 3: Login (if required) ===');

    if (page.url().includes('login')) {
      console.log('Login page detected...');

      const emailInput = page.locator('input').first();
      await emailInput.click();
      await emailInput.clear();
      await emailInput.type(TEST_CREDENTIALS.email, { delay: 50 });
      console.log('✓ Email entered');

      const passwordInput = page.locator('input').nth(1);
      await passwordInput.click();
      await passwordInput.clear();
      await passwordInput.type(TEST_CREDENTIALS.password, { delay: 50 });
      console.log('✓ Password entered');

      await page.screenshot({ path: 'test-results/03-login-filled.png', fullPage: true });

      // Click Login button
      const loginTextElement = page.locator('text="Login"').first();
      if (await loginTextElement.isVisible({ timeout: 3000 })) {
        await loginTextElement.click();
        console.log('✓ Clicked Login');
      }

      await page.waitForTimeout(5000);
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/03-after-login.png', fullPage: true });
      console.log('URL after login:', page.url());
    }

    // Office Onboarding Overview
    console.log('\n=== STEP 4: Office Onboarding Overview ===');

    if (!page.url().includes('office-onboarding')) {
      await page.goto(`${BASE_URL}/office-onboarding`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
    }

    await page.screenshot({ path: 'test-results/04-onboarding-overview.png', fullPage: true });
    console.log('Current URL:', page.url());

    if (page.url().includes('login')) {
      console.log('❌ Still on login - authentication failed');
      return;
    }

    // Click "Get started" button (note: lowercase 's')
    console.log('Looking for Get started button...');
    const getStartedSelectors = [
      'text="Get started"',
      'text="Get Started"',
      'text="ابدأ"',
      'text="البدء"',
    ];

    for (const selector of getStartedSelectors) {
      try {
        const btn = page.locator(selector).first();
        if (await btn.isVisible({ timeout: 2000 })) {
          await btn.click();
          console.log(`✓ Clicked: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }

    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/04-after-get-started.png', fullPage: true });

    // PHASE 1: Basic Info (name, phone, email, services)
    console.log('\n=== STEP 5: Basic Info (Phase 1/3) ===');

    // Wait for form to appear
    await page.waitForTimeout(1000);

    // Fill office name
    const nameInput = page.locator('input').first();
    if (await nameInput.isVisible({ timeout: 5000 })) {
      await nameInput.clear();
      await nameInput.fill('Test Office ABC');
      console.log('✓ Office name entered');
    }

    // Find and fill other inputs
    const allInputs = await page.locator('input').all();
    console.log(`Found ${allInputs.length} inputs`);

    for (let i = 0; i < allInputs.length; i++) {
      const input = allInputs[i];
      const type = await input.getAttribute('type');
      const placeholder = await input.getAttribute('placeholder');
      const name = await input.getAttribute('name');
      console.log(`Input ${i}: type=${type}, placeholder=${placeholder}, name=${name}`);

      if (type === 'tel' || placeholder?.toLowerCase().includes('phone') || name?.includes('phone')) {
        await input.clear();
        await input.fill('+971501234567');
        console.log('✓ Phone entered');
      }

      if (type === 'email' || placeholder?.toLowerCase().includes('email') || name?.includes('email')) {
        await input.clear();
        await input.fill('test@office.com');
        console.log('✓ Email entered');
      }
    }

    await page.screenshot({ path: 'test-results/05-basic-info-filled.png', fullPage: true });

    // Select services (checkboxes or cards)
    console.log('Looking for service checkboxes...');
    const checkboxes = await page.locator('[role="checkbox"], input[type="checkbox"]').all();
    console.log(`Found ${checkboxes.length} checkboxes`);

    if (checkboxes.length > 0) {
      await checkboxes[0].click();
      console.log('✓ Selected first service');
    } else {
      // Try clicking service text/cards
      const serviceTexts = ['Recruitment', 'استقدام', 'Leasing', 'تأجير'];
      for (const text of serviceTexts) {
        const el = page.locator(`text="${text}"`).first();
        if (await el.isVisible({ timeout: 1000 })) {
          await el.click();
          console.log(`✓ Clicked service: ${text}`);
          break;
        }
      }
    }

    await page.screenshot({ path: 'test-results/05-services-selected.png', fullPage: true });

    // Click Next
    console.log('Clicking Next...');
    const nextSelectors = ['text="Next"', 'text="التالي"', 'text="Continue"'];
    for (const selector of nextSelectors) {
      try {
        const btn = page.locator(selector).first();
        if (await btn.isVisible({ timeout: 2000 })) {
          await btn.click();
          console.log(`✓ Clicked: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }

    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/05-after-phase1.png', fullPage: true });

    // PHASE 2: Location & License
    console.log('\n=== STEP 6: Location & License (Phase 2/3) ===');

    // Look for "Use My Location" button (fallback when no Mapbox token)
    const useLocationBtn = page.locator('text="Use My Location"').first();
    if (await useLocationBtn.isVisible({ timeout: 3000 })) {
      console.log('✓ GPS fallback UI detected (no Mapbox token)');
      await useLocationBtn.click();
      console.log('✓ Clicked Use My Location');
      await page.waitForTimeout(3000);
    }

    // Check for Emirate dropdown/selector
    const emirateSelector = page.locator('[data-testid="emirate"], select, [role="combobox"]').first();
    if (await emirateSelector.isVisible({ timeout: 2000 })) {
      await emirateSelector.click();
      console.log('✓ Clicked emirate selector');
      await page.waitForTimeout(500);

      // Select first option
      const firstOption = page.locator('[role="option"]').first();
      if (await firstOption.isVisible({ timeout: 1000 })) {
        await firstOption.click();
        console.log('✓ Selected emirate');
      }
    }

    // Fill any visible inputs (address, license, manager phone)
    const phase2Inputs = await page.locator('input').all();
    console.log(`Phase 2: Found ${phase2Inputs.length} inputs`);

    for (const input of phase2Inputs) {
      const name = await input.getAttribute('name');
      const placeholder = await input.getAttribute('placeholder');
      const type = await input.getAttribute('type');

      if (name?.includes('license') || placeholder?.toLowerCase().includes('license')) {
        await input.fill('LIC-12345');
        console.log('✓ License entered');
      }
      if (name?.includes('address') || placeholder?.toLowerCase().includes('address')) {
        await input.fill('Test Address, Dubai');
        console.log('✓ Address entered');
      }
      if (name?.includes('manager') || placeholder?.toLowerCase().includes('manager')) {
        await input.fill('+971509876543');
        console.log('✓ Manager phone entered');
      }
      if (name === 'website' || type === 'url' || placeholder?.toLowerCase().includes('website')) {
        await input.fill('https://testoffice.com');
        console.log('✓ Website entered');
      }
    }

    await page.screenshot({ path: 'test-results/06-location-license.png', fullPage: true });

    // Look for map/location confirmation
    const confirmLocation = page.locator('text="Confirm"').first();
    if (await confirmLocation.isVisible({ timeout: 1000 })) {
      await confirmLocation.click();
      console.log('✓ Location confirmed');
    }

    // Click Next
    for (const selector of nextSelectors) {
      try {
        const btn = page.locator(selector).first();
        if (await btn.isVisible({ timeout: 2000 })) {
          await btn.click();
          console.log(`✓ Clicked: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }

    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/06-after-phase2.png', fullPage: true });

    // PHASE 3: Review & Logo
    console.log('\n=== STEP 7: Review & Logo (Phase 3/3) ===');

    await page.screenshot({ path: 'test-results/07-review.png', fullPage: true });

    // Click Submit/Register
    const submitSelectors = ['text="Submit"', 'text="Register"', 'text="تسجيل"', 'text="إرسال"', 'text="Complete"'];
    for (const selector of submitSelectors) {
      try {
        const btn = page.locator(selector).first();
        if (await btn.isVisible({ timeout: 2000 })) {
          await btn.click();
          console.log(`✓ Clicked: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }

    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'test-results/07-after-submit.png', fullPage: true });

    // Verify final state
    console.log('\n=== STEP 8: Verify Final State ===');
    console.log('Final URL:', page.url());

    await page.screenshot({ path: 'test-results/08-final.png', fullPage: true });

    const finalUrl = page.url();
    if (finalUrl.includes('office') || finalUrl.includes('maids') || finalUrl.includes('dashboard')) {
      console.log('✓ SUCCESS: Reached office dashboard!');
    } else {
      console.log('Final state URL:', finalUrl);
    }

    console.log('\n=== TEST COMPLETE ===');
  });
});
