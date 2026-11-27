import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
const url=new URL('../public/index.html',import.meta.url).href;
await mkdir(new URL('./output/',import.meta.url),{recursive:true});
const browser=await chromium.launch({headless:true});
try{
 for(const width of [1440,768,390,320]){
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url);
  assert.equal(await page.locator('h1').count(),1);
  assert.equal(await page.locator('.case-card').count(),4);
  assert.equal(await page.locator('.fit-item').count(),6);
  const bounds=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,inner:innerWidth}));
  assert.ok(bounds.scroll<=bounds.inner+2,'Horizontal page overflow '+width+' '+JSON.stringify(bounds));
  await page.locator('.fit-item').nth(2).locator('summary').click();
  assert.equal(await page.locator('.fit-item').nth(2).getAttribute('open'),'');
  await page.locator('.fit-item').nth(2).locator('summary').focus();
  await page.keyboard.press('Space');
  assert.equal(await page.locator('.fit-item').nth(2).getAttribute('open'),null);
  await page.locator('nav a[href="#work"]').click();
  assert.ok(page.url().endsWith('#work'));
  assert.ok(await page.locator('a[href="https://searchmont-analytics.github.io/customer-intelligence-lab/#executive-1"]').count()>0);
  await page.goto(url);
  await page.screenshot({path:new URL('./output/home-'+width+'.png',import.meta.url).pathname,fullPage:true});
  await page.goto(new URL('../public/briefing.html',import.meta.url).href);
  const b=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,inner:innerWidth}));
  assert.ok(b.scroll<=b.inner+2,'Briefing overflow '+width);
  assert.deepEqual(errors,[]);
  if(width===1440){await page.pdf({path:new URL('./output/briefing.pdf',import.meta.url).pathname,format:'Letter',printBackground:true});}
  await page.close();
  console.log('PASS '+width+'px homepage, navigation, disclosure controls, briefing and layout');
 }
}finally{await browser.close()}
