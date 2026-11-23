import {chromium} from '../../node_modules/@playwright/test/index.mjs';import {writeFileSync} from 'node:fs';import assert from 'node:assert/strict';
const base=process.env.PRODUCTION_URL??'http://127.0.0.1:8014';
const browser=await chromium.launch({args:['--no-sandbox','--enable-unsafe-swiftshader']});
try{const page=await browser.newPage({viewport:{width:1280,height:800}}),errors=[];page.on('pageerror',error=>errors.push(error.message));
 const root=await page.goto(base+'/');assert.equal(root.status(),200);await page.waitForTimeout(500);assert.ok(await page.locator('h1').textContent());
 assert.equal((await page.request.post(base+'/api/render',{data:{}})).status(),501);
 const offline=await page.goto(base+'/offline-export');assert.equal(offline.status(),200);await page.getByRole('button',{name:'Export offline WebM'}).click();await page.getByRole('link',{name:'Download WebM'}).waitFor({timeout:20000});
 const downloadEvent=page.waitForEvent('download');await page.getByRole('link',{name:'Download WebM'}).click();const download=await downloadEvent;await download.saveAs(new URL('../../audit/offline/ui-export.webm',import.meta.url).pathname);
 await page.screenshot({path:new URL('../../audit/root-offline-desktop.png',import.meta.url).pathname,fullPage:true});await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.deepEqual(errors,[]);
 writeFileSync(new URL('../../audit/root-production-results.json',import.meta.url),JSON.stringify({passed:true,rootStatus:200,offlinePageStatus:200,realOfflineUiDownload:true,pageErrors:errors,hostedWorkerEndpoint:501,mobileOverflow:false},null,2));console.log('PASS standalone production root + offline export route, actual export/download, hydration, mobile layout, honest hosted API response');
}finally{await browser.close()}
