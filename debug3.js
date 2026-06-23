const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  
  await page.goto('https://finance-blog-website.vercel.app/index.html', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  
  try {
    await page.click('[data-auth-action="register"]');
    await new Promise(r => setTimeout(r, 1000));
    
    // Fill out form
    await page.type('#auth-name', 'Test User');
    await page.type('#auth-email', 'test@example.com');
    await page.type('#auth-pw', 'password123');
    
    // Submit
    await page.click('#auth-submit-btn');
    console.log("Form submitted. Waiting for response...");
    
    await new Promise(r => setTimeout(r, 2000));
    
    // Check for error
    const errorMsg = await page.evaluate(() => {
      const el = document.getElementById('auth-error');
      return (el && el.style.display !== 'none') ? el.textContent : 'NO ERROR';
    });
    
    console.log("Auth Error Display:", errorMsg);
    
  } catch (e) {
    console.log("Puppeteer Error:", e.toString());
  }
  
  await browser.close();
})();
