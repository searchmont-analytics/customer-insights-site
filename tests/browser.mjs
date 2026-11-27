import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { resolve, sep, extname } from 'node:path';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const publicDir=fileURLToPath(new URL('../public/',import.meta.url));
const baseDir=resolve(publicDir);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.avif':'image/avif','.png':'image/png','.jpg':'image/jpeg'};
const server=createServer((req,res)=>{
 try{
   const pathname=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);
   const file=resolve(baseDir,'.'+(pathname==='/'?'/index.html':pathname));
   if(!file.startsWith(baseDir+sep))throw Error('Outside public directory');
   const bytes=readFileSync(file);
   res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream'});res.end(bytes);
 }catch(e){res.writeHead(404);res.end('Not found')}
});
await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve)});
const url='http://127.0.0.1:'+server.address().port+'/index.html';
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
 for(const theme of ['light','dark'])for(const width of [1440,768,390,320]){
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce',colorScheme:theme});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url);
  assert.equal(await page.locator('h1').count(),1);
  const getTheme=()=>page.locator('html').getAttribute('data-theme');
  const toggle=page.locator('#themeToggle');
  await toggle.waitFor({state:'visible'});
  assert.equal(await getTheme(),theme,'System theme on first visit');
  const before=await page.locator('body').evaluate(el=>getComputedStyle(el).backgroundColor);
  await toggle.focus();await page.keyboard.press('Enter');
  const other=theme==='light'?'dark':'light';
  assert.equal(await getTheme(),other,'Keyboard theme switch');
  assert.notEqual(await page.locator('body').evaluate(el=>getComputedStyle(el).backgroundColor),before,'Canvas changes');
  await page.reload();await toggle.waitFor({state:'visible'});
  assert.equal(await getTheme(),other,'Theme persists after reload');
  await toggle.click();assert.equal(await getTheme(),theme,'Return to scenario theme');
  assert.equal(await toggle.getAttribute('aria-label'),theme==='dark'?'Switch to light mode':'Switch to dark mode');
  assert.equal((await toggle.textContent()).trim(),'','Icon-only theme control');
  assert.equal(await toggle.getAttribute('title'),theme==='dark'?'Switch to light mode':'Switch to dark mode');
  assert.equal(await toggle.locator(theme==='dark'?'.sun':'.moon').isVisible(),true,'Correct theme icon');
  assert.equal(await toggle.locator(theme==='dark'?'.moon':'.sun').isVisible(),false,'Only one icon visible');
  const toggleBounds=await toggle.boundingBox();
  assert.ok(toggleBounds&&toggleBounds.width>=44&&toggleBounds.width<=45&&toggleBounds.height>=44,'Compact accessible theme target');
  const executive=page.locator('.head-actions .mast-brief');
  assert.ok(await executive.isVisible(),'Executive Brief visible at every screen width');
  const briefStyle=await executive.evaluate(el=>({bg:getComputedStyle(el).backgroundColor,fg:getComputedStyle(el).color}));
  assert.equal(briefStyle.bg,theme==='dark'?'rgb(169, 226, 212)':'rgb(7, 107, 101)','Prominent filled briefing button');
  assert.equal(await page.locator('#impact-skatepark .impact-evidence-note').count(),0);
  assert.ok((await page.locator('#impact-skatepark .impact-lead').innerText()).startsWith('As President of the Superior Community Skatepark Association'));

  const card=page.locator('.hero-portrait');
  assert.equal(await card.evaluate(el=>getComputedStyle(el).borderTopLeftRadius),'22px','Approved rounded corners');
  assert.equal(await card.evaluate(el=>getComputedStyle(el).overflow),'hidden','Rounded clipping');
  assert.ok(await card.evaluate(el=>getComputedStyle(el).boxShadow.includes('rgba')),'Portrait lighting shadow');
  assert.equal(await page.locator('.portrait-stage').evaluate(el=>getComputedStyle(el,'::before').backgroundImage.includes('radial-gradient')),true,'Underglow');
  const sample=await page.locator('.case-card').first().evaluate(el=>({bg:getComputedStyle(el).backgroundColor,fg:getComputedStyle(el).color}));
  assert.equal(sample.bg,theme==='dark'?'rgb(20, 37, 49)':'rgb(255, 255, 255)','Themed leadership cards');
  assert.equal(sample.fg,theme==='dark'?'rgb(235, 242, 243)':'rgb(20, 44, 58)','Themed card text');
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
    return {stylesheet:[...document.styleSheets].some(s=>s.href&&s.href.endsWith('/styles-v10.css')),head:d('#impact .impact-feature-head').display,background:d('#impact .impact-feature-head').backgroundImage,foreground:d('#impact .impact-feature-head').color,journey:d('#impact .impact-journey').display,press:d('#impact .press-grid').display,pressCard:d('#impact .press-card').display,recognition:d('#impact .impact-recognition').display,cards:d('#impact .impact-grid').display,card:d('#impact .impact-achievement').display,columns:rect('#impact .impact-achievement'),milestones:rect('#impact .impact-journey article'),bodyPadding:parseFloat(d('#impact .impact-feature-body').paddingTop),metric:d('#impact .impact-feature-metric strong').display};
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
  await page.screenshot({path:new URL('./output/impact-'+theme+'-'+width+'.png',import.meta.url).pathname});
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
  await page.screenshot({path:new URL('./output/home-'+theme+'-'+width+'.png',import.meta.url).pathname,fullPage:true});
  await page.goto(new URL('briefing.html',url).href);
  await page.locator('#themeToggle').waitFor({state:'visible'});
  assert.equal(await getTheme(),theme,'Preference on executive briefing');
  assert.equal(await page.locator('.brief').evaluate(el=>getComputedStyle(el).backgroundColor),theme==='dark'?'rgb(20, 37, 49)':'rgb(255, 255, 255)','Briefing theme');
  const b=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,inner:innerWidth}));
  assert.ok(b.scroll<=b.inner+2,'Briefing overflow '+width);
  assert.deepEqual(errors,[]);
  if(width===1440){
   await page.emulateMedia({media:'print'});
   assert.equal(await page.locator('.brief').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(255, 255, 255)','White printable briefing in either theme');
   assert.equal(await page.locator('.brief').evaluate(el=>getComputedStyle(el).color),'rgb(17, 17, 17)','Dark print text');
   if(theme==='dark')await page.pdf({path:new URL('./output/briefing.pdf',import.meta.url).pathname,format:'Letter',printBackground:true});
   await page.emulateMedia({media:'screen'});
  }
  await page.goto(url);
  await page.locator('nav a[href="evidence.html"]').click();
  assert.ok(page.url().endsWith('/evidence.html'));
  assert.equal(await page.locator('h1').count(),1);
  assert.equal(await page.locator('.recognition-feature').count(),1);
  await page.locator('#themeToggle').waitFor({state:'visible'});
  assert.equal(await getTheme(),theme,'Preference on evidence library');
  assert.ok(await page.locator('.head-actions .mast-brief').isVisible(),'Executive Brief visible on evidence page');
  assert.equal((await page.locator('#themeToggle').textContent()).trim(),'','Icon-only theme control on evidence page');
  assert.equal(await page.locator('.recognition-feature').evaluate(el=>getComputedStyle(el).backgroundColor),theme==='dark'?'rgb(20, 37, 49)':'rgb(255, 255, 255)','Evidence library theme');
  assert.equal(await page.locator('.recognition-grid').evaluate(el=>getComputedStyle(el).display),'grid','Evidence recognition CSS loaded');
  assert.equal(await page.locator('#press .press-card').count(),2);
  assert.equal(await page.locator('.library-card-grid article').count(),6);
  const ev=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,inner:innerWidth}));
  assert.ok(ev.scroll<=ev.inner+2,'Evidence library overflow '+width+' '+JSON.stringify(ev));
  await page.locator('nav a[href="#recognition"]').click();
  assert.ok(page.url().endsWith('#recognition'));
  assert.deepEqual(errors,[]);
  await page.screenshot({path:new URL('./output/evidence-'+theme+'-'+width+'.png',import.meta.url).pathname,fullPage:true});
  await page.close();
  console.log('PASS '+theme+' '+width+'px homepage, navigation, disclosure controls, briefing, evidence library and layout');
 }
 const hover=await browser.newPage({viewport:{width:1440,height:1000},colorScheme:'dark',reducedMotion:'no-preference'});
 await hover.goto(url);
 const portrait=hover.locator('.hero-portrait');
 await portrait.hover();
 await hover.waitForFunction(()=>getComputedStyle(document.querySelector('.hero-portrait')).transform!=='none');
 await hover.screenshot({path:new URL('./output/hero-hover.png',import.meta.url).pathname});
 await hover.emulateMedia({reducedMotion:'reduce'});
 assert.equal(await portrait.evaluate(el=>getComputedStyle(el).transform),'none','Reduced motion disables portrait lift');
 await hover.close();
 console.log('PASS: desktop hover and reduced motion');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve))}
