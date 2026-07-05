import { chromium } from 'playwright';
const BASE='https://nicenumbers.app';
const b=await chromium.launch();
const p=await (await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844},isMobile:true,hasTouch:true})).newPage();
const type=async(s,v)=>{await p.click(s);await p.fill(s,v);};
await p.goto(BASE+'/?z='+Math.random(),{waitUntil:'networkidle'});
await p.evaluate(()=>{localStorage.clear();sessionStorage.clear();});
await p.goto(BASE+'/?z='+Math.random(),{waitUntil:'networkidle'});
await type('#birthDay','02');await type('#birthMonth','06');await type('#birthYear','1978');
await p.click('#startBtn');await p.waitForTimeout(500);
await p.click('#wizardStep2 .wizard-actions .wizard-btn');await p.waitForTimeout(300);
await p.click('#wizardStep3 .wizard-actions .wizard-btn');await p.waitForTimeout(300);
await type('#friendDay','13');await type('#friendMonth','03');await type('#friendYear','1990');
await p.evaluate(()=>{const n=document.querySelector('#wizardStep4 input[type=text]');if(n&&!n.value){n.removeAttribute('readonly');n.value='Val';['input','change'].forEach(ev=>n.dispatchEvent(new Event(ev,{bubbles:true})));}});
await p.click('#wizardShowTheirBtn');await p.waitForTimeout(600);
if(await p.$('#wizardStep5 .wizard-btn')){await p.click('#wizardStep5 .wizard-btn');await p.waitForTimeout(600);}
await p.click('#wizardAddMoreBtn6');await p.waitForTimeout(600);
await p.evaluate(()=>{ const w=document.getElementById('groupPersonField'); if(w){w.removeAttribute('readonly');w.value='Nastja';w.dispatchEvent(new Event('input',{bubbles:true}));} const d=document.getElementById('groupDay'),m=document.getElementById('groupMonth'),y=document.getElementById('groupYear'); if(d){d.value='07';d.dispatchEvent(new Event('input',{bubbles:true}));} if(m){m.value='11';m.dispatchEvent(new Event('input',{bubbles:true}));} if(y){y.value='2000';y.dispatchEvent(new Event('input',{bubbles:true}));} });
await p.waitForTimeout(400);
await p.evaluate(()=>{const a=document.querySelector('#groupAddForm .wizard-btn-secondary');if(a)a.click();});await p.waitForTimeout(400);
await p.evaluate(()=>{const c=document.getElementById('groupContinueBtn');if(c)c.click();});await p.waitForTimeout(900);
for(let i=0;i<6;i++){await p.evaluate(()=>{const bt=[...document.querySelectorAll('.wizard-step-active button.wizard-btn')].find(x=>x.offsetParent!==null&&!x.classList.contains('wizard-btn-secondary'));if(bt)bt.click();});await p.waitForTimeout(500);if(!(await p.evaluate(()=>{const o=document.getElementById('onboarding');return o&&!o.classList.contains('hidden');})))break;}
await p.waitForTimeout(800);
await p.evaluate(()=>{ window.__cap=null; window.openShareSheet=function(m,t){ let cardVal=null; try{ cardVal=(m&&m.isCosmic)?(m.description||m.unitName):formatMilestoneValue(m.value);}catch(e){} const full=t||((typeof generateShareMessage==='function'&&m)?generateShareMessage(m):'')||''; window.__cap={ cardVal, textDigits:String(full).replace(/[^0-9]/g,''), cosmic:!!(m&&m.isCosmic) }; if(document.getElementById('shareSheetModal'))document.getElementById('shareSheetModal').remove(); }; });
const norm=s=>String(s).replace(/[^0-9]/g,'');
async function sweep(tab,rowSel,valSel,label){
  await p.evaluate(t=>{const b=document.querySelector(t);if(b)b.click();},tab); await p.waitForTimeout(800);
  const rows=await p.$$(rowSel); let mism=0,checked=0,dead=0;
  for(let i=0;i<Math.min(rows.length,14);i++){
    const shown=await rows[i].evaluate((el,vs)=>{const t=(vs&&el.querySelector(vs))?el.querySelector(vs).textContent:el.textContent;return t||'';},valSel).catch(()=>'');
    const shownD=norm((shown.match(/[\d][\d,\. ]{1,}/)||[''])[0]); if(shownD.length<3) continue;
    await p.evaluate(()=>window.__cap=null);
    await rows[i].evaluate(el=>el.click()).catch(()=>{}); await p.waitForTimeout(160);
    const cap=await p.evaluate(()=>window.__cap); if(!cap){dead++;continue;} checked++;
    const cardD=norm(cap.cardVal); const okCard=cardD.includes(shownD)||shownD.includes(cardD.slice(0,4)); const okText=cap.textDigits.includes(shownD)||cap.cosmic;
    if(!okCard||!okText){mism++;console.log('  '+label+' MISMATCH shown="'+shownD+'" card="'+cap.cardVal+'" textHasIt='+cap.textDigits.includes(shownD));}
  }
  console.log(label+': checked='+checked+' mismatches='+mism+' dead='+dead);
  return {mism,dead};
}
let tot=0,deadTot=0;
for(const[t,r,v,l] of [
  ['.tab-btn-bottom[data-tab="me"]','.time-chunk-item','.tc-value','SOLO home rows'],
  ['.tab-btn-bottom[data-tab="me"]','.column-milestone','.cm-num','SOLO card body (was dead)'],
  ['.tab-btn-bottom[data-tab="together"]','.combined-milestone-item','.cmi-value','TOGETHER rows'],
]){const rr=await sweep(t,r,v,l);tot+=rr.mism;deadTot+=rr.dead;}
console.log('\n=== mismatches='+tot+' dead-taps='+deadTot+' ===');
console.log(tot===0&&deadTot===0?'>>> ALL SHARES CORRECT + NO DEAD TAPS ✓':'>>> ISSUES ✗');
await b.close();
