import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const load=p=>readFileSync(new URL('../public/'+p,import.meta.url),'utf8');
for (const file of ['index.html','briefing.html','evidence.html']) {
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
const manifest=JSON.parse(readFileSync(new URL('./photo-manifest.json',import.meta.url),'utf8'));
for(const p of manifest.photos){
 const bytes=readFileSync(new URL('../public/'+p.path,import.meta.url));
 const sha=createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');
 const version=p.versions.find(v=>v.sha===sha&&v.size===bytes.length);
 assert.ok(version,'Verified photo asset: '+p.path);
 assert.ok(home.includes('src="'+p.path+'"'),'Photo referenced: '+p.path);
 if(p.path.endsWith('.webp'))assert.equal(bytes.toString('ascii',8,12),'WEBP');
 else assert.equal(bytes.toString('ascii',4,12),'ftypavif');
 if(version.quality==='legacy')console.warn('PENDING high-resolution replacement: '+p.path);
 else {assert.ok(Math.max(version.width,version.height)>=1200);console.log('HQ: '+p.path+' '+version.width+'x'+version.height);}
}
assert.equal((home.match(/class="leadership-figure"/g)||[]).length,3);
assert.equal((home.match(/AI-generated illustration/g)||[]).length,1);
assert.equal((home.match(/Fire-service photograph · Author supplied/g)||[]).length,2);
assert.ok(home.includes('not documentary evidence'));
assert.ok(home.includes('src="assets/travis-full-portrait-hq.webp" width="1122" height="1402"'));
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
assert.match(load('styles-v07.css'),/\.portrait-image img\{object-fit:contain/);

const evidence=load('evidence.html');
assert.ok(home.includes('href="evidence.html#recognition"')&&home.includes('href="evidence.html"'),'Evidence library entry points');
for(const id of ['recognition','press','career','projects'])assert.ok(evidence.includes('id="'+id+'"'));
assert.ok(evidence.includes('not a formal personal award')&&evidence.includes('original email is retained privately'),'Recognition scope');
assert.ok(evidence.includes('https://travis-mccormack-emergency-service.com/')&&home.includes('https://travis-mccormack-emergency-service.com/'),'Emergency service portfolio links');
for(const content of [home,evidence,load('briefing.html')]){
 assert.ok(!/mailto:|\.pdf["']|[A-Za-z0-9._%+-]+@(?:opp\.ca|ontario\.ca|gmail\.com)/i.test(content),'No private correspondence attachment or email address');
}
console.log('PASS: evidence library routes, source categories and privacy safeguards.');

const visualAssets=[["assets/governance-framework.jpg","a2ae2887773a2e5bf7e7053405fb756ee2e6771e",192214],["assets/lesson-coverage-map.png","9bfe0c2b531d58673b4bf6603b27ffdb77808d96",95221],["assets/firesmart-demo.png","e54c8c45bb29b52066bdee140e48a27cbe10deec",420682]];
for(const [path,sha,size] of visualAssets){
 const bytes=readFileSync(new URL('../public/'+path,import.meta.url));
 assert.equal(bytes.length,size,'Asset byte count: '+path);
 assert.equal(createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex'),sha,'Asset integrity: '+path);
 assert.ok(home.includes('src="'+path+'"'),'Image included: '+path);
}
for(const p of ['index.html','evidence.html','briefing.html'])assert.ok(load(p).includes('href="styles-v07.css"'),'Versioned stylesheet '+p);
assert.equal((home.match(/class="impact-achievement"/g)||[]).length,4);
assert.equal((home.match(/class="impact-project-image"/g)||[]).length,3);
assert.ok(load('styles-v07.css').includes('#impact .impact-grid{display:grid'));
console.log('PASS: versioned stylesheet, provenance, image integrity and career impact card structure.');
