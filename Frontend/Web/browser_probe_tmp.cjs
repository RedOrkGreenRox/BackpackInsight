const { chromium } = require('playwright');
const fs = require('fs');
const urls = ['https://backpackinsight.pages.dev/', 'https://backpackinsight.pages.dev/items', 'https://backpackinsight.pages.dev/item/wooden-sword'];
(async () => {
  const browser = await chromium.launch({ headless: true });
  const results=[];
  for (const url of urls) {
    const context = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 1365, height: 768 }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    const reqs=[];
    page.on('requestfinished', async req => {
      try {
        const res = await req.response();
        const sizes = await req.sizes();
        reqs.push({
          url: req.url(), method: req.method(), type: req.resourceType(), status: res?.status(),
          reqHeaders: sizes.requestHeadersSize, reqBody: sizes.requestBodySize,
          resHeaders: sizes.responseHeadersSize, resBody: sizes.responseBodySize,
          contentType: res?.headers()['content-type'] || '', cache: res?.headers()['cache-control'] || '', enc: res?.headers()['content-encoding'] || '',
        });
      } catch (e) {}
    });
    const t0=Date.now();
    await page.goto(url, { waitUntil: 'load', timeout: 60000 });
    // Wait for SPA route/API/items if any.
    try { await page.waitForLoadState('networkidle', { timeout: 10000 }); } catch(e) {}
    await page.waitForTimeout(1000);
    const metrics = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0];
      const paints = Object.fromEntries(performance.getEntriesByType('paint').map(p => [p.name, p.startTime]));
      const resources = performance.getEntriesByType('resource').map(r => ({name:r.name, initiatorType:r.initiatorType, transferSize:r.transferSize, encodedBodySize:r.encodedBodySize, decodedBodySize:r.decodedBodySize, duration:r.duration, startTime:r.startTime}));
      return {
        title: document.title,
        bodyText: document.body.innerText.slice(0,200),
        nav: nav ? {
          domContentLoadedEventEnd: nav.domContentLoadedEventEnd,
          loadEventEnd: nav.loadEventEnd,
          responseStart: nav.responseStart,
          responseEnd: nav.responseEnd,
          transferSize: nav.transferSize,
          encodedBodySize: nav.encodedBodySize,
          decodedBodySize: nav.decodedBodySize,
          duration: nav.duration,
        } : null,
        paints,
        resources,
        appChildren: document.querySelector('#app')?.children.length || 0,
        itemCards: document.querySelectorAll('.item-card, .item-card-link').length,
      };
    });
    const perfTotals = metrics.resources.reduce((a,r)=>{a.transfer+=r.transferSize||0; a.encoded+=r.encodedBodySize||0; a.decoded+=r.decodedBodySize||0; return a;},{transfer: metrics.nav?.transferSize||0, encoded: metrics.nav?.encodedBodySize||0, decoded: metrics.nav?.decodedBodySize||0});
    const reqTotals = reqs.reduce((a,r)=>{a.body+=r.resBody||0; a.headers+=r.resHeaders||0; return a;},{body:0, headers:0});
    results.push({url, wallMs: Date.now()-t0, metrics, perfTotals, reqTotals, reqs});
    await context.close();
  }
  await browser.close();
  fs.writeFileSync('/home/user/prod_probe/browser_metrics.json', JSON.stringify(results,null,2));
  for (const r of results) {
    console.log('\n===', r.url, '===');
    console.log('title:', r.metrics.title);
    console.log('wallMs', r.wallMs, 'DCL', r.metrics.nav?.domContentLoadedEventEnd?.toFixed(1), 'load', r.metrics.nav?.loadEventEnd?.toFixed(1), 'FCP', r.metrics.paints['first-contentful-paint']?.toFixed(1));
    console.log('appChildren', r.metrics.appChildren, 'itemCards', r.metrics.itemCards);
    console.log('perf transfer/encoded/decoded', r.perfTotals);
    const byType={}; for (const q of r.reqs) { byType[q.type]??={n:0,body:0,headers:0}; byType[q.type].n++; byType[q.type].body+=q.resBody||0; byType[q.type].headers+=q.resHeaders||0; }
    console.log('byType', byType);
    console.log('top reqs by body:');
    for (const q of [...r.reqs].sort((a,b)=>(b.resBody||0)-(a.resBody||0)).slice(0,12)) {
      console.log(String(q.resBody).padStart(8), q.type.padEnd(10), q.status, q.enc.padEnd(3), q.url.replace('https://backpackinsight.pages.dev','').slice(0,100));
    }
  }
})();
