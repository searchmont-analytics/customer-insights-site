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
assert.match(home,/<img src="assets\/travis-portrait.avif" width="400" height="500" alt="[^"]+"/);
const portrait=readFileSync(new URL('../public/assets/travis-portrait.avif',import.meta.url));
assert.equal(portrait.length,4400,'Portrait file byte length');
assert.equal(portrait.toString('ascii',4,12),'ftypavif','AVIF file signature');
assert.equal(portrait.reduce((v,b)=>Math.imul(v^b,16777619)>>>0,2166136261),0x044e9420,'Original crop transfer checksum');
for(const id of ['philosophy','leadership','experience','strategy','work','research-note','alignment','roadmap'])assert.ok(home.includes('id="'+id+'"'));
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
