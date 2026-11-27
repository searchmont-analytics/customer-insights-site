/* Shared, local theme preference. The head script sets colours before first paint. */
(()=>{
 'use strict';
 const root=document.documentElement;
 const key='tm-insights-theme';
 const system=window.matchMedia('(prefers-color-scheme: dark)');
 const valid=value=>value==='light'||value==='dark';
 let preference=null;
 try{const stored=localStorage.getItem(key);if(valid(stored))preference=stored}catch(e){}
 function apply(theme){
   root.dataset.theme=theme;
   const dark=theme==='dark';
   const meta=document.querySelector('meta[name="theme-color"]');
   if(meta)meta.content=dark?'#101e29':'#fdfdfb';
   const button=document.getElementById('themeToggle');
   const label=document.getElementById('themeLabel');
   if(button&&label){
     label.textContent=dark?'Light mode':'Dark mode';
     button.setAttribute('aria-label',dark?'Switch to light mode':'Switch to dark mode');
     button.hidden=false;
   }
 }
 const current=()=>preference||(system.matches?'dark':'light');
 apply(current());
 function init(){
   apply(current());
   const button=document.getElementById('themeToggle');
   if(button)button.addEventListener('click',()=>{
      preference=root.dataset.theme==='dark'?'light':'dark';
      try{localStorage.setItem(key,preference)}catch(e){}
      apply(preference);
   });
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
 if(system.addEventListener)system.addEventListener('change',()=>{if(!preference)apply(current())});
 window.addEventListener('storage',event=>{
   if(event.key===key||event.key===null){
     preference=valid(event.newValue)?event.newValue:null;
     apply(current());
   }
 });
})();
