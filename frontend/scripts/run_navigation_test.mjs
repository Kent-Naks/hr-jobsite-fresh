import { chromium } from 'playwright';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const OUT = process.env.OUT || 'frontend/navigation-trace.json';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  console.log('Visiting', BASE);
  await page.goto(BASE, { waitUntil: 'networkidle' });
  // find first category link and navigate there
  const catLink = await page.$('a[href^="/categories/"]');
  if (!catLink) {
    console.error('No category link found on the homepage.');
    await browser.close();
    process.exit(2);
  }
  const catHref = await catLink.getAttribute('href');
  console.log('Found category link:', catHref);
  // Prefer a direct goto to load server-rendered category HTML (more deterministic)
  await page.goto(new URL(catHref, BASE).toString(), { waitUntil: 'networkidle' });

  // on category page, look for a job link
  await page.waitForLoadState('networkidle');
  const jobLink = await page.$('a[href^="/jobs/"]');
  if (!jobLink) {
    console.error('No job link found on the category page.');
    await browser.close();
    process.exit(3);
  }
  const href = await jobLink.getAttribute('href');
  console.log('Found job link:', href);

  const t0 = Date.now();
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 15000 }),
    jobLink.click(),
  ]);
  const t1 = Date.now();

  await page.waitForLoadState('networkidle');
  const t2 = Date.now();

  // collect navigation/performance entries from the page
  const perf = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0] || {};
    return {
      nav,
      now: Date.now(),
      timing: (performance.timing && Object.fromEntries(Object.entries(performance.timing))) || null,
      resources: performance.getEntriesByType('resource').slice(0, 50),
    };
  });

  const result = {
    base: BASE,
    link: href,
    clickToDCL_ms: t1 - t0,
    clickToNetworkIdle_ms: t2 - t0,
    measuredAt: new Date().toISOString(),
    perf,
  };

  console.log('Result:', JSON.stringify(result, null, 2));

  await browser.close();
})();
