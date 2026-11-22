// ---- Logic ----
function segs(n){return Object.entries(state.items).filter(([,it])=>it.s===n).sort((a,b)=>a[1].from-b[1].from);}
function covered(n){const a=new Set();for(const [,it] of segs(n))for(let i=it.from;i<=it.to;i++)a.add(i);return a.size;}
function statusOf(n){const c=covered(n);return c===0?"none":c>=SURAHS[n-1][1]?"full":"part";}
function isFull(it){return it.from===1&&it.to===SURAHS[it.s-1][1];}
function itemH(it){return rangeH(it.s,it.from,it.to);}
function rangeTxt(it){return "الآيات "+it.from+"–"+it.to;}
function labelOf(it){return "سورة "+SURAHS[it.s-1][0]+(isFull(it)?"":" ("+rangeTxt(it)+")");}

function addSeg(n,from,to,isNew){
  const ayat=SURAHS[n-1][1];
  from=Math.round(Number(from)); to=Math.round(Number(to));
  if(!(from>=1&&to>=from&&to<=ayat)){toast("أدخل آيات صحيحة بين 1 و"+ayat);return false;}
  // merge with overlapping or adjacent segments
  const overl=segs(n).filter(([,it])=>it.from<=to&&it.to>=from);
  let extra=null;
  if(overl.length){
    from=Math.min(from,...overl.map(([,it])=>it.from)); to=Math.max(to,...overl.map(([,it])=>it.to));
    const notes=overl.map(([,it])=>it.note).filter(Boolean);
    extra={level:Math.min(...overl.map(([,it])=>it.level)),reviews:Math.max(...overl.map(([,it])=>it.reviews||0)),note:notes.join(" | "),due:today()};
    const na=overl.map(([,it])=>it.newAt).filter(Boolean).sort().pop(); if(na) extra.newAt=na;
    overl.forEach(([id])=>delete state.items[id]);
  }
  state.items[idOf(n,from,to)]=newItem(n,from,to,extra);
  if(isNew) Object.assign(state.items[idOf(n,from,to)],{newAt:today(),due:addDays(today(),1)});
  save(); render();
  toast(overl.length?"تم دمج المقطع: "+rangeTxt({from,to}):"تمت الإضافة");
  return true;
}
function removeSeg(id){const it=state.items[id];if(!it)return;delete state.items[id];save();render();toast("أُزيل "+labelOf(it));}
function clearSurah(n){segs(n).forEach(([id])=>delete state.items[id]);save();render();}
function addRange(a,b){
  let c=0;
  for(let n=a;n<=b;n++){ if(statusOf(n)!=="full"){addSegQuiet(n);c++;} }
  save(); render(); toast("أُضيفت "+c+" سورة");
}
function addSegQuiet(n){
  const ayat=SURAHS[n-1][1]; const old=segs(n);
  const extra=old.length?{level:Math.min(...old.map(([,it])=>it.level)),due:today(),reviews:Math.max(...old.map(([,it])=>it.reviews||0)),note:old.map(([,it])=>it.note).filter(Boolean).join(" | ")}:null;
  old.forEach(([id])=>delete state.items[id]);
  state.items[idOf(n,1,ayat)]=newItem(n,1,ayat,extra);
}

// Split a segment into review parts; each part keeps the parent's schedule
function partsTxt(k){if(k===2)return "جزأين";if(k<=10)return k+" أجزاء";return k+" جزءًا";}
function replaceWithParts(id,cuts){
  const it=state.items[id]; if(!it) return 0;
  const bounds=[it.from,...cuts,it.to+1]; delete state.items[id];
  for(let i=0;i<bounds.length-1;i++){
    const f=bounds[i],t=bounds[i+1]-1;
    state.items[idOf(it.s,f,t)]=Object.assign(JSON.parse(JSON.stringify(it)),{from:f,to:t});
  }
  openSplit=null; save(); render(); return bounds.length-1;
}
function splitAt(id,a){
  const it=state.items[id]; a=Math.round(Number(a));
  if(!it||!(a>it.from&&a<=it.to)){toast("اختر آية بين "+(it.from+1)+" و"+it.to);return;}
  replaceWithParts(id,[a]); toast("قُسّم المقطع إلى جزأين");
}
function splitBySize(id,h){
  const it=state.items[id]; h=Number(h);
  if(!it||!(h>0)){toast("أدخل حجمًا صحيحًا");return;}
  const total=rangeH(it.s,it.from,it.to); const k=Math.max(1,Math.round(total/h));
  if(k<2){toast("المقطع أصغر من هذا الحجم");return;}
  const cuts=[]; let start=it.from;
  for(let j=1;j<k;j++){
    const target=total*j/k; let a=start+1;
    while(a<=it.to&&rangeH(it.s,it.from,a-1)<target) a++;
    // pick the closer boundary
    if(a-1>start&&Math.abs(rangeH(it.s,it.from,a-2)-target)<Math.abs(rangeH(it.s,it.from,a-1)-target)) a--;
    if(a>start&&a<=it.to){cuts.push(a);start=a;}
  }
  const c=replaceWithParts(id,cuts); toast("قُسّم المقطع إلى "+partsTxt(c));
}
function mergeSurah(n){
  const sg=segs(n); if(sg.length<2) return;
  let groups=[], cur=null;
  for(const [id,it] of sg){ if(cur&&it.from<=cur.to+1){cur.to=Math.max(cur.to,it.to);cur.ids.push(id);} else {cur={from:it.from,to:it.to,ids:[id]};groups.push(cur);} }
  for(const g of groups){
    if(g.ids.length<2) continue;
    const its=g.ids.map(id=>state.items[id]);
    const na=its.map(x=>x.newAt).filter(Boolean).sort().pop();
    const merged=newItem(n,g.from,g.to,{...(na?{newAt:na}:{}),level:Math.min(...its.map(x=>x.level)),due:its.map(x=>x.due).sort()[0],reviews:Math.max(...its.map(x=>x.reviews||0)),note:[...new Set(its.map(x=>x.note).filter(Boolean))].join(" | ")});
    g.ids.forEach(id=>delete state.items[id]); state.items[idOf(n,g.from,g.to)]=merged;
  }
  save(); render(); toast("دُمجت الأجزاء المتصلة");
}

