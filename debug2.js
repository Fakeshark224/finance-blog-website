const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  
  await page.goto('https://finance-blog-website.vercel.app/index.html', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  
  try {
    console.log("Attempting UI click on [data-auth-action='login']...");
    await page.click('[data-auth-action="login"]');
    console.log("UI Click successful.");
  } catch (e) {
    console.log("UI Click failed:", e.toString());
  }
  
  await new Promise(r => setTimeout(r, 1000));
  
  const modalHtml = await page.evaluate(() => {
    return document.getElementById('auth-modal-overlay') ? 'MODAL EXISTS' : 'MODAL MISSING';
  });
  console.log(modalHtml);
  
  await browser.close();
})();
