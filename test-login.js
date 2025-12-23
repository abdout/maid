const { chromium } = require('playwright');

(async () => {
  console.log('Starting login test...');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Log console messages
  page.on('console', msg => console.log('   [Browser]', msg.type(), msg.text()));
  page.on('response', async response => {
    if (response.url().includes('api') || response.url().includes('otp')) {
      console.log('   [API]', response.status(), response.url());
      try {
        const body = await response.json();
        console.log('   [Response]', JSON.stringify(body, null, 2).slice(0, 500));
      } catch (e) {}
    }
  });

  try {
    // Step 1: Navigate to login
    console.log('1. Navigating to login page...');
    await page.goto('https://maid-xi.vercel.app/login', { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'test-1-login-page.png' });
    console.log('   Screenshot: test-1-login-page.png');

    // Step 2: Enter phone number
    console.log('2. Entering phone number...');
    const phoneInput = await page.locator('input[type="tel"], input[placeholder*="971"], input[placeholder*="phone"]').first();
    await phoneInput.fill('+971555000100');
    await page.screenshot({ path: 'test-2-phone-entered.png' });
    console.log('   Screenshot: test-2-phone-entered.png');

    // Step 3: Click continue button
    console.log('3. Clicking continue button...');
    await page.click('text=Continue');
    console.log('   Waiting for API response...');
    await page.waitForTimeout(5000);
    await page.waitForURL('**/verify**', { timeout: 5000 }).catch(() => console.log('   Did not navigate to /verify'));
    await page.screenshot({ path: 'test-3-after-continue.png' });
    console.log('   Screenshot: test-3-after-continue.png');
    console.log('   Current URL:', page.url());

    // Step 4: Enter OTP
    console.log('4. Entering OTP code 123456...');
    await page.waitForTimeout(2000);

    // List all inputs on the page
    const allInputs = await page.locator('input').all();
    console.log('   Found', allInputs.length, 'input(s) on page');

    // Try to find OTP inputs (6 single-digit inputs)
    const otpInputs = await page.locator('input[maxlength="1"]').all();
    console.log('   Found', otpInputs.length, 'OTP inputs (maxlength=1)');

    const otpCode = '123456';
    if (otpInputs.length >= 6) {
      for (let i = 0; i < 6; i++) {
        // Click first to focus, then type to trigger React state updates
        await otpInputs[i].click();
        await otpInputs[i].type(otpCode[i]);
        await page.waitForTimeout(100);
      }
      console.log('   Typed 123456 in individual OTP inputs');
    } else if (allInputs.length > 0) {
      // Try single input for OTP
      await allInputs[0].click();
      await allInputs[0].type('123456');
      console.log('   Typed 123456 in single input');
    }
    await page.waitForTimeout(500); // Wait for state to update

    // Check the actual values in OTP inputs
    const inputValues = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input[maxlength="1"]');
      return Array.from(inputs).map(i => i.value);
    });
    console.log('   OTP input values:', inputValues);

    await page.screenshot({ path: 'test-4-otp-entered.png' });
    console.log('   Screenshot: test-4-otp-entered.png');

    // Step 5: Click verify
    console.log('5. Clicking verify button...');

    // Debug: trace full parent hierarchy from Verify text
    const debug = await page.evaluate(() => {
      const all = document.body.querySelectorAll('*');
      for (const el of all) {
        if (el.textContent?.trim() === 'Verify' && el.children.length === 0) {
          const chain = [];
          let current = el;
          for (let i = 0; i < 8 && current; i++) {
            chain.push({
              level: i,
              tag: current.tagName,
              cls: current.className?.slice?.(0, 60) || '',
              bgColor: window.getComputedStyle(current).backgroundColor,
              cursor: window.getComputedStyle(current).cursor
            });
            current = current.parentElement;
          }
          return chain;
        }
      }
      return null;
    });
    console.log('   DOM hierarchy:', JSON.stringify(debug, null, 2));

    // Get button coordinates - go up 1 level (the actual blue button)
    const btnCoords = await page.evaluate(() => {
      const all = document.body.querySelectorAll('*');
      for (const el of all) {
        if (el.textContent?.trim() === 'Verify' && el.children.length === 0) {
          // Go up exactly 1 level to get the Pressable (the blue button)
          let target = el.parentElement || el;
          const rect = target.getBoundingClientRect();
          return {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
            width: rect.width,
            height: rect.height,
            className: target.className?.slice?.(0, 60),
            found: true
          };
        }
      }
      return { found: false };
    });

    console.log('   Button coordinates:', JSON.stringify(btnCoords));

    if (btnCoords.found) {
      // Use Playwright mouse click at exact coordinates
      await page.mouse.click(btnCoords.x, btnCoords.y);
      console.log('   Clicked at coordinates via Playwright mouse');
    }
    console.log('   Waiting for API response and navigation...');
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'test-5-after-verify.png' });
    console.log('   Screenshot: test-5-after-verify.png');
    console.log('   Final URL:', page.url());

    // Check if we're logged in by looking for auth indicators
    const cookies = await page.context().cookies();
    console.log('   Cookies:', cookies.map(c => c.name).join(', '));

    // Check localStorage
    const localStorage = await page.evaluate(() => JSON.stringify(window.localStorage));
    console.log('   LocalStorage:', localStorage.slice(0, 500));

    console.log('\nTest completed!');

  } catch (error) {
    console.error('Error:', error.message);
    await page.screenshot({ path: 'test-error.png' });
  } finally {
    await browser.close();
  }
})();
