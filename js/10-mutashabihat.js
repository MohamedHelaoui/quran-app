// ---- Mutashabihat: groups of similar words or ayat ----
function sameLoc(x,y){return x.s===y.s&&x.a===y.a&&(x.w??null)===(y.w??null)&&(x.we??null)===(y.we??null);}
function locRange(l){return l.w===null||l.w===undefined?null:[l.w,l.we??l.w];}
function cleanLoc(l){return l.we!==undefined&&l.we!==null&&l.we!==l.w?{s:l.s,a:l.a,w:l.w,we:l.we}:{s:l.s,a:l.a,w:l.w};}
function groupOf(loc){return state.mutash.find(g=>g.items.some(it=>sameLoc(it,loc)));}
function mshOnAya(sn,a){const r={aya:false,words:new Set()};for(const g of state.mutash)for(const it of g.items)if(it.s===sn&&it.a===a){if(it.w===null)r.aya=true;else for(let i=it.w;i<=(it.we??it.w);i++)r.words.add(i);}return r;}
function linkLocs(x,y){
  if(sameLoc(x,y)) return false;
  const gx=groupOf(x), gy=groupOf(y);
  if(gx&&gy){ if(gx===gy) return false; gx.items.push(...gy.items.filter(it=>!gx.items.some(o=>sameLoc(o,it)))); gx.note=[gx.note,gy.note].filter(Boolean).join(" | "); state.mutash=state.mutash.filter(g=>g!==gy); }
  else if(gx) gx.items.push(y); else if(gy) gy.items.push(x);
  else state.mutash.push({id:"g"+Date.now().toString(36)+Math.random().toString(36).slice(2,6),items:[x,y],note:""});
  save(); return true;
}
function unlinkLoc(loc){const g=groupOf(loc);if(!g)return;g.items=g.items.filter(it=>!sameLoc(it,loc));if(g.items.length<2)state.mutash=state.mutash.filter(x=>x!==g);save();}
// all similar places registered for an ayah (or a range of ayat), side by side
function groupsIn(sn,from,to){return state.mutash.filter(g=>g.items.some(it=>it.s===sn&&it.a>=from&&it.a<=to));}
function ayaWithMark(loc){const ws=locWords(loc);if(!ws)return "";const r=locRange(loc);
  return ws.map((w,i)=>r&&i>=r[0]&&i<=r[1]?`<mark>${esc(w)}</mark>`:esc(w)).join(" ")+" "+esc(ayaParts(Q.t[loc.s-1][loc.a-1]).num);}
function showMshPanel(sn,from,to){
  loadQ().then(()=>{
    const gs=groupsIn(sn,from,to); if(!gs.length){toast("لا متشابهات مسجّلة هنا");return;}
    const head=from===to?`سورة ${SURAHS[sn-1][0]}، الآية ${from}`:`سورة ${SURAHS[sn-1][0]}، الآيات ${from}–${to}`;
    const body=gs.map((g,gi)=>{const here=g.items.filter(it=>it.s===sn&&it.a>=from&&it.a<=to);const others=g.items.filter(it=>!(it.s===sn&&it.a>=from&&it.a<=to));
      const row=(it,isHere)=>`<div class="mp-loc${isHere?" here":""}"><div class="mp-h"><span>${isHere?"هنا · ":""}${esc(SURAHS[it.s-1][0])} ${it.a}${it.w===null?" · الآية كاملة":""}</span><button class="linkbtn" data-goloc="${it.s}:${it.a}:${it.w??""}:${it.we??""}" data-closemodal="1">افتح ←</button></div><div class="mp-txt">${ayaWithMark(it)}</div></div>`;
      return `<div class="mp-group"><div class="mp-n">${gs.length>1?"المجموعة "+(gi+1)+" · ":""}${g.items.length} مواضع</div>${here.map(it=>row(it,true)).join("")}${others.map(it=>row(it,false)).join("")}${g.note?`<div class="note">📝 ${esc(g.note)}</div>`:""}</div>`;}).join("");
    let m=document.getElementById("mshModal"); if(m) m.remove();
    document.body.insertAdjacentHTML("beforeend",`<div id="mshModal" class="modal" role="dialog" aria-modal="true"><div class="modal-box mp"><div class="t" style="display:flex;justify-content:space-between;align-items:center;gap:8px"><div><div class="name" style="font-size:20px">المتشابهات</div><div class="meta">${head}</div></div><button class="icon-nav" id="mpClose" aria-label="إغلاق">✕</button></div>${body}</div></div>`);
    m=document.getElementById("mshModal");
    document.getElementById("mpClose").onclick=()=>m.remove(); m.onclick=e=>{if(e.target===m)m.remove();};
  }).catch(()=>toast("تعذّر تحميل المصحف"));
}
function locWords(loc){if(!Q)return null;return ayaParts(Q.t[loc.s-1][loc.a-1]).words;}
// labels use the interface font, which lacks the mushaf's special marks: drop them there
function uiAr(t){return String(t).replace(/[\u06D6-\u06ED\u08D3-\u08FF\u06DE\u00a0]/g,"").replace(/\s+/g," ").trim();}
function locLabel(loc,withSurah=true){const ws=locWords(loc);const sn=SURAHS[loc.s-1][0];
  const word=loc.w!==null&&ws&&ws[loc.w]?" «"+uiAr(ws.slice(loc.w,(loc.we??loc.w)+1).join(" "))+"»":"";
  return (withSurah?sn+" ":"")+loc.a+word;}
function locSnippet(loc){const ws=locWords(loc);if(!ws)return "";if(loc.w===null)return ws.slice(0,7).join(" ")+(ws.length>7?" …":"");const i=loc.w,j=loc.we??loc.w;return (i>0?"… ":"")+ws.slice(Math.max(0,i-2),j+3).join(" ")+(j+3<ws.length?" …":"");}

function errTxt(c){if(c===1)return "مرة واحدة";if(c===2)return "مرتين";if(c<=10)return c+" مرات";return c+" مرة";}

