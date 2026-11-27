import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
// Version image URLs according to their actual bytes, in the disposable CI checkout.
// Replacing a photo under the same filename then receives a different cache key.
const root=new URL('../public/',import.meta.url);
for(const name of ['index.html','briefing.html','evidence.html']){
 const path=new URL(name,root);
 const html=readFileSync(path,'utf8');
 const updated=html.replace(/(<img\b[^>]*?\bsrc=")(assets\/[^"?]+)(?:\?v=[a-f0-9]+)?(")/g,(_,prefix,asset,suffix)=>{
  const bytes=readFileSync(new URL(asset,root));
  const version=createHash('sha256').update(bytes).digest('hex').slice(0,16);
  return prefix+asset+'?v='+version+suffix;
 });
 writeFileSync(path,updated);
}
console.log('Versioned image URLs using content hashes.');
