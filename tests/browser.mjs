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
  const portrait=page.locator('.portrait-image img');
  await portrait.waitFor({state:'visible'});
  await portrait.evaluate(img=>img.decode());
  assert.deepEqual(await portrait.evaluate(img=>[img.naturalWidth,img.naturalHeight]),[560,700],'Full-length portrait decoded correctly');
  assert.equal(await portrait.evaluate(img=>getComputedStyle(img).objectFit),'contain','Full portrait is not cropped');
  assert.equal(await page.locator('.philosophy-principles article').count(),3);
  assert.equal(await page.locator('#impact .press-card').count(),2);
  assert.equal(await page.locator('.impact-grid article').count(),4);
  await page.locator('nav a[href="#impact"]').click();
  assert.ok(page.url().endsWith('#impact'));
  assert.ok(await page.locator('#impact-skatepark').isVisible());
  await page.goto(url);
  assert.equal(await page.locator('.case-card').count(),6);
  const leadershipImages=page.locator('.leadership-image img');
  assert.equal(await leadershipImages.count(),3);
  const expected=[[340,255],[302,340],[255,340]];
  for(let k=0;k<3;k++){
   const img=leadershipImages.nth(k);
   await img.scrollIntoViewIfNeeded();
   await img.evaluate(el=>el.decode());
   assert.deepEqual(await img.evaluate(el=>[el.naturalWidth,el.naturalHeight]),expected[k],'Leadership image decoded');
  }
  await page.locator('h1').scrollIntoViewIfNeeded();
  assert.equal(await page.locator('.fit-item').count(),6);
  assert.equal(await page.locator('.reviewer-paths>a').count(),3);
  await page.locator('.research-method-note summary').click();
  assert.equal(await page.locator('.research-method-note').getAttribute('open'),'');
  await page.locator('.research-method-note summary').click();
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
  await page.goto(url);
  await page.locator('nav a[href="evidence.html"]').click();
  assert.ok(page.url().endsWith('/evidence.html'));
  assert.equal(await page.locator('h1').count(),1);
  assert.equal(await page.locator('.recognition-feature').count(),1);
  assert.equal(await page.locator('#press .press-card').count(),2);
  assert.equal(await page.locator('.library-card-grid article').count(),6);
  const ev=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,inner:innerWidth}));
  assert.ok(ev.scroll<=ev.inner+2,'Evidence library overflow '+width+' '+JSON.stringify(ev));
  await page.locator('nav a[href="#recognition"]').click();
  assert.ok(page.url().endsWith('#recognition'));
  assert.deepEqual(errors,[]);
  await page.screenshot({path:new URL('./output/evidence-'+width+'.png',import.meta.url).pathname,fullPage:true});
  await page.close();
  console.log('PASS '+width+'px homepage, navigation, disclosure controls, briefing, evidence library and layout');
 }
}finally{await browser.close()}
