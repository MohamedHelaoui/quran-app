// ---- State ----
function freshState(keep){return Object.assign({v:2,items:{},log:{},mistakes:{},goalH:3,goalSet:false,hlog:{},plan:{on:false,amount:1,unit:"page",order:"back",days:[0,1,2,3,4,5,6]},rH:{},habits:[],hdone:{},adhLog:{},adh:{date:today(),p:{}},kh:null,khDone:[],recent:{on:true,days:30},mutash:[],tsb:normTsb(null),mode:"",stash:{},mdis:[],rv:[],tg:{hide:[],show:[]},updatedAt:0},keep||{});}
// items: memorized segments {s: surah, from, to, level, due, reviews, note, last}
let state=freshState();
let dbRef=null, saving=false, pendingSave=false, saveTimer=null, syncMode="local", queuedRemote=null;
let LS_KEY="quran-review-v1";
let modeReady=false; // true once the account/device state is loaded, so the mode picker never flashes before it

function newItem(s,from,to,extra){return Object.assign({s,from,to,level:0,due:today(),reviews:0,note:""},extra||{});}
function idOf(s,from,to){return s+"_"+from+"_"+to;}
function normalize(src){
  if(!src||typeof src!=="object") src={};
  // default daily goal is 3 ahzab; a goal the user chose (goalSet) is kept
  const out={v:2,updatedAt:Number(src.updatedAt)||0,items:{},log:{},goalH:(src.goalSet&&Number(src.goalH)>0)?Number(src.goalH):3,goalSet:!!src.goalSet,hlog:(src.hlog&&typeof src.hlog==="object")?JSON.parse(JSON.stringify(src.hlog)):{},plan:normPlan(src.plan),adh:(src.adh&&src.adh.date===today()&&typeof src.adh.p==="object")?JSON.parse(JSON.stringify(src.adh)):{date:today(),p:{}},rH:cp(src.rH),tsb:normTsb(src.tsb),mlog:cp(src.mlog),qada:normQada(src.qada),prayer:(src.prayer&&src.prayer.days&&typeof src.prayer.days==="object")?{name:String(src.prayer.name||"").slice(0,80),tz:String(src.prayer.tz||"Europe/Berlin"),days:cp(src.prayer.days)}:null,recent:{on:!(src.recent&&src.recent.on===false),days:[7,14,30,40,60].includes(Number(src.recent&&src.recent.days))?Number(src.recent.days):30},kh:normKh(src.kh),khDone:Array.isArray(src.khDone)?src.khDone.filter(x=>typeof x==="string").slice(-200):[],habits:Array.isArray(src.habits)?src.habits.filter(h=>h&&h.id&&h.n).map(h=>({id:String(h.id),n:String(h.n).slice(0,40)})):[],hdone:cp(src.hdone),adhLog:(src.adhLog&&typeof src.adhLog==="object")?JSON.parse(JSON.stringify(src.adhLog)):{},mode:(src.mode==="hifdh"||src.mode==="huffaz")?src.mode:"",stash:(src.stash&&typeof src.stash==="object"&&!Array.isArray(src.stash))?JSON.parse(JSON.stringify(src.stash)):{},mdis:Array.isArray(src.mdis)?src.mdis.filter(x=>typeof x==="string").slice(-3000):[],rv:normRv(src.rv),tg:(src.tg&&typeof src.tg==="object")?{hide:Array.isArray(src.tg.hide)?src.tg.hide.map(String).slice(0,100):[],show:Array.isArray(src.tg.show)?src.tg.show.map(String).slice(0,100):[]}:{hide:[],show:[]}};
  const fromHafs=src.v!==2;
  out.mistakes={};
  if(src.mistakes&&typeof src.mistakes==="object"){for(const [k,v] of Object.entries(src.mistakes)){const [sn,a]=k.split(":").map(Number);if(sn>=1&&sn<=114&&a>=1&&a<=SURAHS[sn-1][1]&&v&&v.c>0)out.mistakes[k]=normMist(v);}}
  out.mutash=Array.isArray(src.mutash)?src.mutash.map(normGroup).filter(Boolean).slice(0,500):[];
  if(src.log&&typeof src.log==="object") out.log=JSON.parse(JSON.stringify(src.log));
  if(src.items&&typeof src.items==="object"){
    for(const [k,v] of Object.entries(src.items)){
      const it=JSON.parse(JSON.stringify(v));
      if(fromHafs&&it&&it.s>=1&&it.s<=114){const q=SURAHS[it.s-1][1];if(it.from===1&&it.to===HAFS_N[it.s-1])it.to=q;else{it.to=Math.min(it.to,q);it.from=Math.min(it.from,it.to);}}
      if(it&&it.s>=1&&it.s<=114&&it.from>=1&&it.to>=it.from&&it.to<=SURAHS[it.s-1][1]) out.items[idOf(it.s,it.from,it.to)]=it;
    }
  }
  // migrate old whole-surah format
  if(src.surahs&&typeof src.surahs==="object"){
    for(const [n,v] of Object.entries(src.surahs)){
      const s=Number(n); if(!(s>=1&&s<=114)) continue;
      const to=SURAHS[s-1][1]; const id=idOf(s,1,to);
      if(!out.items[id]) out.items[id]=newItem(s,1,to,JSON.parse(JSON.stringify(v||{})));
      Object.assign(out.items[id],{s,from:1,to});
    }
  }
  if(out.mode==="huffaz") out.items={}; // review-only mode: no automatic schedule, the person builds «مراجعتي»
  return out;
}
// review-only mode works on whole surahs: parts of a surah are merged back into one (weakest level, earliest date)
// «مراجعتي»: an ordered list of whole surahs (k:"s") and pages (k:"p") chosen by the person; d = last day reviewed
// the last 8 ahzab are taken as 4 parts instead of their many short surahs
const GRP=[[51,57,"جزء الذاريات"],[58,66,"جزء قد سمع"],[67,77,"جزء تبارك"],[78,114,"جزء عمّ"]];
function grpOf(n){const i=GRP.findIndex(g=>n>=g[0]&&n<=g[1]);return i+1;}
function unitOf(n){const g=grpOf(n);return g?{k:"g",n:g}:{k:"s",n};}
function unitSur(u){return u.k==="g"?[GRP[u.n-1][0],GRP[u.n-1][1]]:[u.n,u.n];}
function unitName(u){return u.k==="g"?GRP[u.n-1][2]:"سورة "+SURAHS[u.n-1][0];}
function unitShort(u){return u.k==="g"?GRP[u.n-1][2]:SURAHS[u.n-1][0];}
function unitKeys(u){const [a,b]=unitSur(u);let o=[];for(let n=a;n<=b;n++)o=o.concat(mistKeysIn(n,1,SURAHS[n-1][1]));return o;}
function unitList(){const o=[];for(let n=1;n<51;n++)o.push({k:"s",n});for(let g=1;g<=4;g++)o.push({k:"g",n:g});return o;}
function unitNum(u){return u.k==="g"?"ج":u.n;}
function normRv(a){if(!Array.isArray(a))return [];const seen=new Set();return a.filter(x=>x&&(x.k==="s"&&x.n>=1&&x.n<=114||x.k==="p"&&x.n>=1&&x.n<=604||x.k==="r"&&x.n>=1&&x.e>x.n&&x.e<=604||x.k==="g"&&x.n>=1&&x.n<=4)).map(x=>{const o=x.k==="s"?unitOf(Math.round(Number(x.n))):{k:x.k,n:Math.round(Number(x.n))};if(x.k==="r")o.e=Math.round(Number(x.e));if(/^\d{4}-\d\d-\d\d$/.test(x.d||""))o.d=x.d;return o;}).filter(x=>{const k=x.k+x.n+(x.e?"-"+x.e:"");if(seen.has(k))return false;seen.add(k);return true;}).slice(0,800);}
function wholeSurahs(items){
  const by={}; for(const it of Object.values(items||{})) if(it&&it.s>=1&&it.s<=114)(by[it.s]=by[it.s]||[]).push(it);
  const out={};
  for(let n=1;n<=114;n++){const q=SURAHS[n-1][1];const its=by[n]||[];
    if(its.length===1&&its[0].from===1&&its[0].to===q){out[idOf(n,1,q)]=its[0];continue;}
    const ex=its.length?{level:Math.min(...its.map(x=>x.level||0)),due:its.map(x=>x.due).filter(Boolean).sort()[0]||today(),reviews:Math.max(...its.map(x=>x.reviews||0)),note:[...new Set(its.map(x=>x.note).filter(Boolean))].join(" | ")}:{level:3,due:today()};
    const last=its.map(x=>x.last).filter(Boolean).sort().pop(); if(last) ex.last=last;
    out[idOf(n,1,q)]=newItem(n,1,q,ex);}
  return out;
}
const UNITS={ayah:{name:"آية",h:null},page:{name:"صفحة",h:60/604},thumun:{name:"ثُمن",h:1/8},hizb:{name:"حزب",h:1}};
function normPlan(p){p=(p&&typeof p==="object")?p:{};let days=Array.isArray(p.days)?[...new Set(p.days.map(Number).filter(x=>Number.isInteger(x)&&x>=0&&x<=6))].sort():[0,1,2,3,4,5,6];if(!days.length)days=[0,1,2,3,4,5,6];return {on:!!p.on,amount:Number(p.amount)>0?Number(p.amount):1,unit:UNITS[p.unit]?p.unit:"page",order:p.order==="fwd"?"fwd":"back",days};}
const WDN=["الأحد","الإثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"];
function wdOf(d){const [y,m,dd]=d.split("-").map(Number);return new Date(y,m-1,dd).getDay();}
function isHifdhDay(d){const ds=(state.plan&&state.plan.days)||[0,1,2,3,4,5,6];return ds.includes(wdOf(d));}
function nextHifdhDay(from){for(let i=1;i<=7;i++){const d=addDays(from,i);if(isHifdhDay(d))return d;}return addDays(from,1);}
function hifdhDaysTxt(){const ds=state.plan.days;if(ds.length===7)return "كل يوم";return ds.length===1?"مرة في الأسبوع ("+WDN[ds[0]]+")":ds.length+" أيام في الأسبوع";}
function cp(o){return (o&&typeof o==="object"&&!Array.isArray(o))?JSON.parse(JSON.stringify(o)):{};}
function normKh(k){if(!k||typeof k!=="object")return null;const days=Math.round(Number(k.days));const pos=Math.round(Number(k.pos));const startPage=Math.round(Number(k.startPage))||1;if(!(days>=1&&days<=3650&&pos>=1&&pos<=605&&/^\d{4}-\d\d-\d\d$/.test(k.start||"")))return null;return {start:k.start,days,startPage:Math.min(604,Math.max(1,startPage)),pos,log:cp(k.log)};}
function normQada(q){if(!q||typeof q!=="object")return null;const n5=a=>Array.isArray(a)&&a.length===5&&a.every(x=>Number.isFinite(Number(x))&&Number(x)>=0)?a.map(x=>Math.round(Number(x))):null;
  const init=n5(q.init),left=n5(q.left);if(!init||!left)return null;const log={};if(q.log&&typeof q.log==="object")for(const [d,a] of Object.entries(q.log)){const v=n5(a);if(v&&/^\d{4}-\d\d-\d\d$/.test(d))log[d]=v;}
  return {init,left,perDay:Math.min(50,Math.max(1,Math.round(Number(q.perDay)||1))),log};}
// a mistake entry: wa = mistakes on the whole ayah, w = {wordIndex: count}; c = total
function normMist(v){const w={};if(v.w&&typeof v.w==="object")for(const [i,n] of Object.entries(v.w)){const k=Math.round(Number(i)),c=Math.round(Number(n));if(k>=0&&k<200&&c>0)w[k]=c;}
  const wsum=Object.values(w).reduce((a,b)=>a+b,0); let wa=Number.isFinite(Number(v.wa))?Math.max(0,Math.round(Number(v.wa))):Math.max(0,Math.round(v.c)-wsum);
  const tot=wa+wsum; const c0=Math.round(Number(v.c)); const t0=Math.round(Number(v.t));
  // c counts mistakes per ayah: several words marked in the same ayah on the same day count once
  const o={c:c0>=1&&c0<=tot?c0:tot,wa,w,last:String(v.last||"")}; if(t0>0) o.t=Math.min(t0,tot); return o;}
function normLoc(x){if(!x)return null;const s=Math.round(Number(x.s)),a=Math.round(Number(x.a));if(!(s>=1&&s<=114&&a>=1&&a<=SURAHS[s-1][1]))return null;const w=x.w===null||x.w===undefined?null:Math.round(Number(x.w));const ok=Number.isFinite(w)&&w>=0;const we=ok&&Number.isFinite(Number(x.we))&&Number(x.we)>w?Math.round(Number(x.we)):null;return we!==null?{s,a,w,we}:{s,a,w:ok?w:null};}
function normGroup(g){if(!g||!Array.isArray(g.items))return null;const items=g.items.map(normLoc).filter(Boolean);if(items.length<2)return null;const o={id:String(g.id||("g"+Math.random().toString(36).slice(2,8))),items,note:String(g.note||"").slice(0,500)};if(Number.isFinite(Number(g.lv)))o.lv=Math.max(0,Math.min(8,Math.round(Number(g.lv))));if(/^\d{4}-\d\d-\d\d$/.test(g.due||""))o.due=g.due;return o;}
function tsbDefault(){return [{id:"t1",t:"سُبْحَانَ اللَّهِ",n:33},{id:"t2",t:"الْحَمْدُ لِلَّهِ",n:33},{id:"t3",t:"اللَّهُ أَكْبَرُ",n:34},{id:"t4",t:"أَسْتَغْفِرُ اللَّهَ",n:100},{id:"t5",t:"اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ",n:100}];}
function normTsb(x){const o={items:tsbDefault(),log:{},sel:"t1"};if(!x||typeof x!=="object")return o;
  if(Array.isArray(x.items))o.items=x.items.filter(i=>i&&i.id&&i.t).map(i=>({id:String(i.id),t:String(i.t).slice(0,200),n:Math.max(0,Math.min(100000,Math.round(Number(i.n)||0)))})).slice(0,40);
  if(x.log&&typeof x.log==="object")for(const [d,v] of Object.entries(x.log))if(/^\d{4}-\d\d-\d\d$/.test(d)&&v&&typeof v==="object"){const r={};for(const [k,c] of Object.entries(v)){const n=Math.round(Number(c));if(n>0)r[k]=n;}o.log[d]=r;}
  o.sel=o.items.some(i=>i.id===x.sel)?String(x.sel):(o.items[0]||{}).id||null;return o;}
function lsLoad(){try{const r=localStorage.getItem(LS_KEY);return r?JSON.parse(r):null;}catch(e){return null;}}
function lsSave(){try{localStorage.setItem(LS_KEY,JSON.stringify(state));}catch(e){}}

const SYNC_TXT={ok:"متزامن",busy:"جارٍ الحفظ…",local:"على هذا الجهاز",warn:"دون اتصال"};
function setSync(m){syncMode=m;const el=document.getElementById("sync");if(!el)return;el.className="sync "+m;el.querySelector("span").textContent=SYNC_TXT[m]||"";if(view==="settings"&&!document.activeElement.matches("input,select,textarea"))renderSettings();}

// Every change is saved on this device at once, then sent to the account (one write at a time).
let saveSeq=0, sentSeq=0; // changes made / changes confirmed by the server
function unsent(){return sentSeq<saveSeq;}
function save(){
  state.updatedAt=Date.now(); saveSeq++;
  lsSave();
  if(!dbRef) return;
  clearTimeout(saveTimer); setSync("busy");
  saveTimer=setTimeout(flush,700);
}
async function flush(){
  saveTimer=null;
  if(!dbRef) return;
  if(saving){pendingSave=true;return;}
  saving=true;
  const body=JSON.parse(JSON.stringify(state)); const seq=saveSeq;
  if(!navigator.onLine){ saving=false; setSync("warn"); return; }
  try{ await dbRef.set(body); sentSeq=Math.max(sentSeq,seq); setSync(unsent()?"busy":"ok"); }
  catch(e){
    if(e&&e.code==="unavailable"){ await new Promise(r=>setTimeout(r,800+Math.random()*800)); try{const sq=saveSeq;await dbRef.set(JSON.parse(JSON.stringify(state)));sentSeq=Math.max(sentSeq,sq);setSync("ok");}catch(e2){setSync("warn");} }
    else if(e&&(e.code==="invalid_argument"||e.code==="revoked")){dbRef=null;setSync("local");}
    else setSync("warn");
  }
  saving=false;
  if(pendingSave){pendingSave=false;flush();}
}
// Apply data that came from another device, unless the user is typing
function adoptRemote(r){
  const a=document.activeElement;
  if(a&&a.matches&&a.matches("input[type=text],input[type=search],input[type=number],textarea")){queuedRemote=r;return;}
  queuedRemote=null; state=r; lsSave(); render();
}
document.addEventListener("focusout",()=>{setTimeout(()=>{if(queuedRemote&&!document.activeElement.matches("input,textarea"))adoptRemote(queuedRemote);},50);});
function hasContent(st){return Object.keys(st.items).length||Object.keys(st.log).length||st.kh||Object.keys(st.adhLog).length||st.habits.length;}

