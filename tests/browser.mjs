import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const url=new URL('../public/index.html',import.meta.url).href;
const manifest=JSON.parse(readFileSync(new URL('./photo-manifest.json',import.meta.url),'utf8'));
const photoDimensions=new Map(manifest.photos.map(p=>{
 const bytes=readFileSync(new URL('../public/'+p.path,import.meta.url));
 const sha=createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');
 const v=p.versions.find(x=>x.sha===sha&&x.size===bytes.length);
 assert.ok(v,'Known photo version: '+p.path);
 return [p.path,v];
}));

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
  assert.deepEqual(await portrait.evaluate(img=>[img.naturalWidth,img.naturalHeight]),[1122,1402],'High-resolution full-length portrait decoded correctly');
  assert.equal(await portrait.evaluate(img=>getComputedStyle(img).objectFit),'contain','Full portrait is not cropped');
  assert.equal(await page.locator('.philosophy-principles article').count(),3);
  assert.equal(await page.locator('#impact .press-card').count(),2);
  assert.equal(await page.locator('.impact-grid article').count(),4);
  await page.locator('nav a[href="#impact"]').click();
  assert.ok(page.url().endsWith('#impact'));
  assert.ok(await page.locator('#impact-skatepark').isVisible());
  const layout=await page.evaluate(()=>{
    const d=s=>getComputedStyle(document.querySelector(s));
    const rect=s=>Array.from(document.querySelectorAll(s),n=>({x:n.getBoundingClientRect().x,y:n.getBoundingClientRect().y}));
    return {stylesheet:[...document.styleSheets].some(s=>s.href&&s.href.endsWith('/styles-v07.css')),head:d('#impact .impact-feature-head').display,background:d('#impact .impact-feature-head').backgroundImage,foreground:d('#impact .impact-feature-head').color,journey:d('#impact .impact-journey').display,press:d('#impact .press-grid').display,pressCard:d('#impact .press-card').display,recognition:d('#impact .impact-recognition').display,cards:d('#impact .impact-grid').display,card:d('#impact .impact-achievement').display,columns:rect('#impact .impact-achievement'),milestones:rect('#impact .impact-journey article'),bodyPadding:parseFloat(d('#impact .impact-feature-body').paddingTop),metric:d('#impact .impact-feature-metric strong').display};
  });
  assert.ok(layout.stylesheet,'Versioned stylesheet loaded');
  for(const name of ['head','journey','press','recognition','cards'])assert.equal(layout[name],'grid','Computed layout: '+name);
  assert.equal(layout.pressCard,'flex');
  assert.equal(layout.card,'flex');
  assert.equal(layout.metric,'block');
  assert.ok(layout.background.includes('gradient')&&layout.foreground==='rgb(255, 255, 255)','Dark feature header actually rendered');
  assert.ok(layout.bodyPadding>=18,'Feature body padding applied');
  if(width<=760){
   assert.ok(layout.columns.every(p=>Math.abs(p.x-layout.columns[0].x)<2),'Mobile cards stack');
   assert.ok(layout.milestones.every(p=>Math.abs(p.x-layout.milestones[0].x)<2),'Mobile milestones stack');
  }else{
   assert.ok(Math.abs(layout.columns[0].x-layout.columns[1].x)>30,'Desktop cards side by side');
   assert.ok(Math.abs(layout.columns[0].y-layout.columns[1].y)<2,'Desktop first row aligned');
   assert.ok(Math.abs(layout.milestones[0].y-layout.milestones[2].y)<2,'Desktop milestones aligned');
  }
  const visuals=page.locator('#impact .impact-project-image img');
  assert.equal(await visuals.count(),3);
  for(let i=0;i<3;i++){
   const visual=visuals.nth(i);await visual.scrollIntoViewIfNeeded();await visual.evaluate(el=>el.decode());
   assert.ok(await visual.evaluate(el=>el.naturalWidth>0&&el.naturalHeight>0),'Project image decoded');
  }
  await page.locator('#impact').scrollIntoViewIfNeeded();
  await page.screenshot({path:new URL('./output/impact-'+width+'.png',import.meta.url).pathname});
  await page.goto(url);
  assert.equal(await page.locator('.case-card').count(),6);
  const leadershipImages=page.locator('.leadership-image img');
  assert.equal(await leadershipImages.count(),3);
  const expected=['assets/fire-service-training.avif','assets/fire-service-fleet.avif','assets/lead-board-hq.webp'].map(path=>photoDimensions.get(path));
  for(let k=0;k<3;k++){
   const img=leadershipImages.nth(k);
   await img.scrollIntoViewIfNeeded();
   await img.evaluate(el=>el.decode());
   assert.deepEqual(await img.evaluate(el=>[el.naturalWidth,el.naturalHeight]),[expected[k].width,expected[k].height],'Leadership image decoded at verified source dimensions');
   if(expected[k].quality==='high')assert.ok(Math.max(expected[k].width,expected[k].height)>=1200,'High-quality source');
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
  assert.equal(await page.locator('.recognition-grid').evaluate(el=>getComputedStyle(el).display),'grid','Evidence recognition CSS loaded');
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
