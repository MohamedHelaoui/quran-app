// ---- Memorization plan ----
function planOrder(){const a=[];for(let i=1;i<=114;i++)a.push(i);return state.plan.order==="fwd"?a:a.reverse();}
function isCovered(n,a){for(const [,it] of segs(n))if(a>=it.from&&a<=it.to)return true;return false;}
function nextStart(){for(const n of planOrder()){const q=SURAHS[n-1][1];for(let a=1;a<=q;a++)if(!isCovered(n,a))return {s:n,a};}return null;}
function amountTxt(pl){return (pl.unit==="ayah"?ayatTxt(pl.amount):(pl.amount+" "+UNITS[pl.unit].name));}
// today's portion: from the first unmemorized ayah, up to the daily amount; may continue into the next surah(s)
function partSize(p){const u=state.plan.unit;return u==="ayah"?p.to-p.from+1:u==="page"?rangePages(p.s,p.from,p.to):rangeH(p.s,p.from,p.to)/UNITS[u].h;}
function portionSize(parts){return parts.reduce((x,p)=>x+partSize(p),0);}
function sizeTxt(parts){const pl=state.plan;const ay=parts.reduce((x,p)=>x+p.to-p.from+1,0);if(pl.unit==="ayah")return ayatTxt(ay);const v=Math.round(portionSize(parts)*10)/10;return ayatTxt(ay)+" · حوالي "+(v<0.1?"أقل من 0.1":v)+" "+UNITS[pl.unit].name;}
function todaysPortion(){
  const st=nextStart(); if(!st) return null;
  const pl=state.plan; const target=pl.amount;
  const order=planOrder(); let oi=order.indexOf(st.s); const parts=[];
  let n=st.s, a=st.a;
  while(true){
    const q=SURAHS[n-1][1]; const part={s:n,from:a,to:a}; parts.push(part);
    const free=x=>x<=q&&!isCovered(n,x);
    while(free(part.to+1)&&portionSize(parts)<target){
      part.to++;
      if(pl.unit!=="ayah"&&portionSize(parts)>target){const over=portionSize(parts)-target;part.to--;const under=target-portionSize(parts);if(over<under)part.to++;break;}
    }
    if(portionSize(parts)>=target*0.85||free(part.to+1)) break;
    // surah finished: continue with the next surah in order if its start is free
    oi++; if(oi>=order.length) break;
    const nn=order[oi]; if(isCovered(nn,1)) break;
    n=nn; a=1;
  }
  return parts;
}
function remainingH(){let h=0;for(let n=1;n<=114;n++){const q=SURAHS[n-1][1];let a=1;while(a<=q){if(isCovered(n,a)){a++;continue;}let b=a;while(b+1<=q&&!isCovered(n,b+1))b++;h+=rangeH(n,a,b);a=b+1;}}return h;}
function dailyH(){const pl=state.plan;return pl.unit==="ayah"?pl.amount*60/6214:pl.unit==="page"?pl.amount*60/604:pl.amount*UNITS[pl.unit].h;}
let lastHifdh=null;
function confirmHifdh(parts){
  const before=JSON.parse(JSON.stringify({items:state.items,hlog:state.hlog}));
  const tm=addDays(today(),1); let ay=0;
  for(const p of parts){state.items[idOf(p.s,p.from,p.to)]=newItem(p.s,p.from,p.to,{due:tm,newAt:today()});ay+=p.to-p.from+1;}
  state.hlog[today()]=(state.hlog[today()]||0)+ay;
  lastHifdh=before; save(); render();
  toast("بارك الله فيك! حفظت "+ayatTxt(ay)+"، وستراجعها غدًا",false);
  document.getElementById("toast").insertAdjacentHTML("beforeend",`<button id="undoH">تراجع</button>`);
  document.getElementById("undoH").onclick=()=>{if(!lastHifdh)return;state.items=lastHifdh.items;state.hlog=lastHifdh.hlog;lastHifdh=null;save();render();hideToast();};
}

let lastUndo=null;
function rate(id,kind){
  const s=state.items[id]; if(!s) return;
  const before=JSON.parse(JSON.stringify(s)); const t=today();
  const logBefore=state.log[t]||0;
  if(kind==="hard"){ s.level=0; s.due=addDays(t,1); }
  else if(kind==="mid"){ s.level=Math.max(0,Math.min(s.level,INTERVALS.length-1)); s.due=addDays(t,Math.max(1,Math.round(INTERVALS[s.level]/2))); }
  else { s.level=Math.min(s.level+1,INTERVALS.length-1); s.due=addDays(t,INTERVALS[s.level]); }
  s.last=t; s.reviews=(s.reviews||0)+1;
  state.log[t]=logBefore+1;
  const rHBefore=state.rH[t]||0; state.rH[t]=rHBefore+itemH(s);
  pruneLog();
  lastUndo={id,before,t,logBefore,rHBefore};
  save(); render();
  const msg={hard:"حسنًا، ستراجعها غدًا",mid:"المراجعة القادمة بعد "+daysTxt(diffDays(s.due,t)),easy:"بارك الله فيك! المراجعة القادمة بعد "+daysTxt(diffDays(s.due,t))}[kind];
  toast(labelOf(s)+" — "+msg,true);
}
function undo(){
  if(!lastUndo) return;
  const {id,before,t,logBefore,rHBefore}=lastUndo;
  if(rHBefore) state.rH[t]=rHBefore; else delete state.rH[t];
  state.items[id]=before; if(logBefore) state.log[t]=logBefore; else delete state.log[t];
  lastUndo=null; save(); render(); hideToast();
}
function pruneLog(){const ks=Object.keys(state.log).sort(); while(ks.length>400){delete state.log[ks.shift()];}}
function sortedIds(filterFn){
  return Object.keys(state.items).filter(id=>!filterFn||filterFn(state.items[id]))
    .sort((a,b)=>{const A=state.items[a],B=state.items[b];return A.due<B.due?-1:A.due>B.due?1:(A.level-B.level)||(A.s-B.s)||(A.from-B.from);});
}
function dueList(){const t=today();return sortedIds(it=>it.due<=t&&!isRecent(it));}
// Newly memorized segments are reviewed every day for the first N days, whatever the rating
function recentDay(it){return it.newAt?diffDays(today(),it.newAt):-1;}
function isRecent(it){if(HUF()||!state.recent.on||!it.newAt)return false;const d=recentDay(it);return d>=1&&d<=state.recent.days;}
function recentIds(){return Object.keys(state.items).filter(id=>isRecent(state.items[id])).sort((a,b)=>{const A=state.items[a],B=state.items[b];return (A.newAt<B.newAt?-1:A.newAt>B.newAt?1:0)||(A.s-B.s)||(A.from-B.from);});}
function streak(){
  let d=today(), c=0;
  if(!state.log[d]) d=addDays(d,-1);
  while(state.log[d]){c++;d=addDays(d,-1);}
  return c;
}

// ---- Mistakes per ayah ----
function mKey(sn,a){return sn+":"+a;}
function mistakesIn(sn,from,to){return Object.entries(state.mistakes).map(([k,v])=>{const [x,a]=k.split(":").map(Number);return {s:x,a,c:v.c,words:Object.keys(v.w||{}).length};}).filter(m=>m.s===sn&&m.a>=from&&m.a<=to).sort((a,b)=>a.a-b.a);}
function addMistakeLoc(l){const r=locRange(l);if(!r){addMistake(l.s,l.a,null);return;}for(let i=r[0];i<=r[1];i++)addMistake(l.s,l.a,i);}
function decMistakeLoc(l){const r=locRange(l);if(!r){decMistake(l.s,l.a,null);return;}for(let i=r[0];i<=r[1];i++)decMistake(l.s,l.a,i);}
function clearMistakeLoc(l){const r=locRange(l);if(!r){clearMistake(l.s,l.a,null);return;}for(let i=r[0];i<=r[1];i++)clearMistake(l.s,l.a,i);}
function mistCountLoc(l){const r=locRange(l);if(!r)return mistCount(l.s,l.a,null);let m=Infinity;for(let i=r[0];i<=r[1];i++)m=Math.min(m,mistCount(l.s,l.a,i));return m;}
function addMistake(sn,a,w){const k=mKey(sn,a);const m=state.mistakes[k]||{c:0,wa:0,w:{},last:""};if(w===null||w===undefined)m.wa++;else m.w[w]=(m.w[w]||0)+1;
  if(m.last===today()&&m.t>0)m.t++;else{m.c++;m.t=1;}m.last=today();state.mistakes[k]=m;save();}
// one mark less: the ayah's count drops only when no mark is left for that day
function mistDrop(m,n){if(m.last===today()&&m.t>0){m.t=Math.max(0,m.t-n);if(!m.t)m.c--;}else m.c--;const left=m.wa+Object.values(m.w).reduce((x,y)=>x+y,0);if(left>0&&m.c<1)m.c=1;if(m.c>left)m.c=left;}
function decMistake(sn,a,w){const k=mKey(sn,a);const m=state.mistakes[k];if(!m)return;if(w===null||w===undefined){if(m.wa>0){m.wa--;mistDrop(m,1);}}else if(m.w[w]){m.w[w]--;if(!m.w[w])delete m.w[w];mistDrop(m,1);}if(m.c<=0)delete state.mistakes[k];save();}
function clearMistake(sn,a,w){const k=mKey(sn,a);const m=state.mistakes[k];if(!m)return;let n=0;if(w===null||w===undefined){n=m.wa;m.wa=0;}else if(m.w[w]){n=m.w[w];delete m.w[w];}if(n)mistDrop(m,n);if(m.c<=0)delete state.mistakes[k];save();}
function mistCount(sn,a,w){const m=state.mistakes[mKey(sn,a)];if(!m)return 0;return w===null||w===undefined?m.wa:(m.w[w]||0);}
