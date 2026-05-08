
import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log(`[BROWSER] ${msg.text()}`));
    page.on('pageerror', err => console.error(`[BROWSER ERR] ${err.message}`));

    console.log('Navigating to http://localhost:3002...');
    try {
        await page.goto('http://localhost:3002', { waitUntil: 'networkidle2', timeout: 30000 });
        console.log('Page loaded successfully.');
        
        const content = await page.content();
        if (content.includes('Internal Server Error') || content.includes('Failed to resolve import')) {
            console.error('Detected errors in page content!');
        } else {
            console.log('No obvious errors detected in page content.');
        }
    } catch (e) {
        console.error('Failed to load page:', e.message);
    }

    await browser.close();
})();
