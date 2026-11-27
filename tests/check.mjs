import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const load=p=>readFileSync(new URL('../public/'+p,import.meta.url),'utf8');
for (const file of ['index.html','briefing.html']) {
 const html=load(file);
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(new Set(ids).size,ids.length,'Unique ids '+file);
 assert.equal((html.match(/<h1\b/g)||[]).length,1,'One page heading '+file);
 assert.match(html,/<html lang="en-CA">/);
 for(const m of html.matchAll(/href="([^"]+)"/g)){
  const href=m[1].replaceAll('&amp;','&');
  if(href.startsWith('#'))assert.ok(ids.includes(href.slice(1)),'Missing local anchor '+href);
  else if(!/^(?:https?:|mailto:)/.test(href)&&href!=='./'){
   const path=href.split('#')[0];assert.ok(existsSync(fileURLToPath(new URL('../public/'+path,import.meta.url))),'Missing file '+path);
   if(href.includes('#'))assert.ok(load(path==='./'?'index.html':path).includes('id="'+href.split('#')[1]+'"'),'Missing cross-page anchor');
  }
 }
 assert.ok(!/<script\b|<iframe\b/.test(html),'No external or inline scripts or embeds');
}
const home=load('index.html');
const leadershipImages=[['board',3756,0x81ac9887],['community',4560,0x4631ef5f],['chief',4164,0xa50fd74d]];
for(const [name,bytes,checksum] of leadershipImages){
 const path='assets/lead-'+name+'.avif';
 const img=readFileSync(new URL('../public/'+path,import.meta.url));
 assert.equal(img.length,bytes,'Image byte length: '+name);
 assert.equal(img.toString('ascii',4,12),'ftypavif');
 assert.equal(img.reduce((v,b)=>Math.imul(v^b,16777619)>>>0,2166136261),checksum,'Image transfer checksum: '+name);
 assert.ok(home.includes('src="'+path+'"'),'Leadership image referenced');
}
assert.equal((home.match(/class="leadership-figure"/g)||[]).length,3);
assert.equal((home.match(/AI-generated illustration/g)||[]).length,2);
assert.ok(home.includes('not documentary evidence of a particular meeting'));
assert.match(home,/<img src="assets\/travis-full-portrait.avif" width="560" height="700" alt="[^"]+"/);
const portrait=readFileSync(new URL('../public/assets/travis-full-portrait.avif',import.meta.url));
assert.equal(portrait.length,6120,'Portrait file byte length');
assert.equal(portrait.toString('ascii',4,12),'ftypavif','AVIF file signature');
assert.equal(portrait.reduce((v,b)=>Math.imul(v^b,16777619)>>>0,2166136261),0xa2e3b228,'Full-length source derivative checksum');
for(const id of ['philosophy','leadership','impact','impact-skatepark','experience','strategy','work','research-note','alignment','roadmap'])assert.ok(home.includes('id="'+id+'"'));
for(let i=1;i<=6;i++)assert.ok(home.includes('https://searchmont-analytics.github.io/customer-intelligence-lab/#module-'+i));
assert.ok(home.includes('#executive-1')&&home.includes('#technical'));
assert.ok(home.includes('2007–2009</time><div><h3>Voice Network Analyst')&&home.includes('2009–2011*</time>'));
assert.equal((home.match(/class="fit-item"/g)||[]).length,6);
assert.equal((home.match(/class="case-card"/g)||[]).length,6,'Six evidence-based leadership examples');
assert.ok(home.includes('id="reviewer-title"')&&home.includes('class="reviewer-paths"'),'Hiring-panel pathways');
assert.ok(home.includes('$400,000 raised')&&home.includes('14 sections')&&home.includes('17 lessons'),'Documented evidence highlights');
assert.ok(home.includes('class="research-method-note"'),'Research appraisal methods disclosure');
assert.match(home,/not an OLG customer sample/i);
console.log('PASS: local anchors, page headings, all six lab links, two entry pathways, timeline, alignment and source safeguards.');

assert.equal((home.match(/class="press-card"/g)||[]).length,2,'Independent press links');
assert.ok(home.includes('https://www.sootoday.com/local-news/the-problem-with-our-new-skate-park-25-photos-124248')&&home.includes('https://www.sootoday.com/local-news/the-skate-park-isnt-big-enough-for-the-community-that-we-have-11-photos-322287'),'Both supplied articles linked');
assert.ok(home.includes('$75,000')&&home.includes('do not verify the full funding total'),'Grant and funding provenance');
assert.ok(home.includes('id="impact-title"')&&home.includes('id="impact-skatepark"'),'Career impact case');
assert.match(load('styles.css'),/\.portrait-image img\{object-fit:contain/);
