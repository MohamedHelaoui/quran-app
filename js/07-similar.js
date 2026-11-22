// ---- Similar ayat (huffaz mode): suggestions, differences, list ----
function relist(){if(view==="stats")renderStats();else renderList();}
function groupMist(g){return g.items.reduce((a,it)=>a+((state.mistakes[it.s+":"+it.a]||{}).c||0),0);}
let G4=null,G6=null;
function gramIdx(n){const N=normIndex();const m=new Map();for(let s=0;s<114;s++)for(let a=0;a<N[s].length;a++){const W=N[s][a].filter(Boolean);for(let i=0;i+n<=W.length;i++){const k=W.slice(i,i+n).join(" ");let l=m.get(k);if(!l){l=[];m.set(k,l);}const id=(s+1)*1000+a+1;if(l[l.length-1]!==id)l.push(id);}}return m;}
// ayat that share a run of at least 5 words with this one (4 for short ayat), best first
function simAyat(sn,a){
  if(!Q) return []; if(!G4) G4=gramIdx(4);
  const W=normIndex()[sn-1][a-1].filter(Boolean); if(W.length<4) return [];
  const sc=new Map(), me=sn*1000+a;
  for(let i=0;i+4<=W.length;i++){const l=G4.get(W.slice(i,i+4).join(" "));if(!l||l.length>60)continue;for(const id of new Set(l))if(id!==me)sc.set(id,(sc.get(id)||0)+1);}
  const need=W.length<=6?1:2;
  return [...sc.entries()].filter(([,c])=>c>=need).sort((x,y)=>y[1]-x[1]||x[0]-y[0]).slice(0,12).map(([id])=>({s:Math.floor(id/1000),a:id%1000}));
}
// curated mutashabihat (mut.json, Qalun numbering), loaded on first use
let MT=null, mtLoading=null, MTI=null, CSETS=[];
function loadMut(){if(MT||mtLoading)return;mtLoading=fetch("mut.json").then(r=>{if(!r.ok)throw new Error("http");return r.json();}).then(d=>{MT=d.g;MTI=new Map();CSETS=[];
  for(const g of MT){const n=Math.max(...g.map(o=>o[2]-o[1]+1));for(let i=0;i<n;i++)CSETS.push(new Set([...new Set(g.map(o=>o[0]*1000+Math.min(o[1]+i,o[2])))].map(id=>Math.floor(id/1000)+":"+id%1000)));
    for(const r of g)for(let a=r[1];a<=r[2];a++){const id=r[0]*1000+a;let l=MTI.get(id);if(!l){l=[];MTI.set(id,l);}for(const o of g){if(o===r)continue;const oid=o[0]*1000+Math.min(o[1]+a-r[1],o[2]);if(oid!==id&&!l.includes(oid))l.push(oid);}}}
  SUGG=null;if(view==="mushaf")renderMushaf();else if(view==="list")renderList();}).catch(()=>{mtLoading=null;});}
function curAyat(sn,a){loadMut();return ((MTI&&MTI.get(sn*1000+a))||[]).map(id=>({s:Math.floor(id/1000),a:id%1000,c:1}));}
// curated first, then the computed ones
function simAll(sn,a){const c=curAyat(sn,a);return c.concat(simAyat(sn,a).filter(x=>!c.some(y=>y.s===x.s&&y.a===x.a)));}
function sigCur(sig){const S=new Set(sig.split(","));return CSETS.some(c=>[...c].every(x=>S.has(x)));}
// for each word of A: is it also in B (longest common subsequence on letters only)
function lcsMatch(A,B){const n=A.length,m=B.length;const L=Array.from({length:n+1},()=>new Uint16Array(m+1));
  for(let i=n-1;i>=0;i--)for(let j=m-1;j>=0;j--)L[i][j]=A[i]===B[j]?L[i+1][j+1]+1:Math.max(L[i+1][j],L[i][j+1]);
  const r=new Array(n).fill(false);let i=0,j=0;while(i<n&&j<m){if(A[i]===B[j]){r[i]=true;i++;j++;}else if(L[i+1][j]>=L[i][j+1])i++;else j++;}return r;}
function locSpan(it){const len=locWords(it).length;const r=locRange(it);return r?[Math.max(0,r[0]-4),Math.min(len-1,r[1]+6)]:[0,len-1];}
// text of a place with the words that differ from the other places highlighted, then the start of the next ayah
function diffHTML(it,others,opts){
  const ws=locWords(it); const N=normIndex(); const [x0,x1]=opts&&opts.full?[0,ws.length-1]:locSpan(it);
  const A=N[it.s-1][it.a-1].slice(x0,x1+1); const ok=new Array(A.length).fill(false);
  for(const o of others){const [y0,y1]=opts&&opts.full?[0,locWords(o).length-1]:locSpan(o);const m=lcsMatch(A,N[o.s-1][o.a-1].slice(y0,y1+1));m.forEach((v,i)=>{if(v)ok[i]=true;});}
  let t=ws.slice(x0,x1+1).map((w,i)=>A[i]&&!ok[i]?`<span class="dif">${esc(w)}</span>`:esc(w)).join(" ");
  if(x0>0)t="… "+t; if(x1<ws.length-1)t+=" …"; else t+=" "+esc(ayaParts(Q.t[it.s-1][it.a-1]).num);
  if(!(opts&&opts.noNext)&&x1>=ws.length-1&&it.a<SURAHS[it.s-1][1]){const nw=locWords({s:it.s,a:it.a+1});t+=` <span class="nxt">ثم: ${esc(nw.slice(0,3).join(" "))} …</span>`;}
  return t;
}
// suggestions inside the selection panel (long press)
let sugAll=false;
function sugPanelHTML(L){
  const list=simAll(L.s,L.a); if(!list.length) return "";
  const me={s:L.s,a:L.a,w:null}; const g=groupOf(me);
  const shown=sugAll?list:list.slice(0,4);
  return `<div class="sug"><div class="meta" style="color:var(--ink);font-weight:600">آيات تشبهها (${list.length})${list.some(x=>x.c)?` <span style="font-weight:400">· 📚 من كتاب المتشابهات</span>`:""}</div>
    ${shown.map(x=>{const lk=g&&g.items.some(o=>o.s===x.s&&o.a===x.a);const loc={s:x.s,a:x.a,w:null};
      return `<div class="sug-it"><div class="grow"><button class="linkbtn sm" data-goloc="${x.s}:${x.a}::">${x.c?"📚 ":""}${esc(SURAHS[x.s-1][0])} ${x.a}</button><div class="mq">${diffHTML(loc,[me],{full:true,noNext:true})}</div></div>${lk?`<span class="meta">✓ مربوطة</span>`:`<button class="btn sm" data-sugl="${x.s}:${x.a}">＋ اربط</button>`}</div>`;}).join("")}
    ${!sugAll&&list.length>4?`<button class="linkbtn sm" id="sugMore">عرض الباقي (${list.length-4})</button>`:""}</div>`;
}
// list of suggested groups over the whole Quran: ayat sharing a run of 6 words or more
let SUGG=null;
function allSugg(){
  if(SUGG) return SUGG; if(!G6) G6=gramIdx(6);
  const seen=new Set(), out=[];
  for(const c of CSETS){const sig=[...c].sort((x,y)=>{const [a1,b1]=x.split(":").map(Number),[a2,b2]=y.split(":").map(Number);return a1-a2||b1-b2;}).join(",");if(c.size>1&&!seen.has(sig)){seen.add(sig);out.push(sig);}}
  for(const l of G6.values()){const u=[...new Set(l)];if(u.length<2||u.length>8)continue;const sig=u.sort((x,y)=>x-y).map(id=>Math.floor(id/1000)+":"+id%1000).join(",");if(seen.has(sig))continue;seen.add(sig);out.push(sig);}
  // drop a group whose ayat are all inside a bigger group
  const sets=out.map(sig=>new Set(sig.split(",")));
  SUGG=out.filter((sig,i)=>!sets.some((o,j)=>j!==i&&o.size>sets[i].size&&[...sets[i]].every(x=>o.has(x)))).sort((x,y)=>{const [a1,b1]=x.split(",")[0].split(":").map(Number),[a2,b2]=y.split(",")[0].split(":").map(Number);return a1-a2||b1-b2;});
  return SUGG;
}
function sigItems(sig){return sig.split(",").map(k=>{const [s,a]=k.split(":").map(Number);return {s,a,w:null};});}
function sugDone(sig){if(state.mdis.includes(sig))return true;const its=sigItems(sig);const g=groupOf(its[0]);return !!g&&its.every(it=>g.items.some(o=>o.s===it.s&&o.a===it.a));}
let mutOpenAll=false, sugN=10, surOpen=false, mtSur=0, mtDelAsk=null;
// order of "my" groups: by mistakes, mushaf order, or the user's own order (array order, moved with ↑ ↓)
function mtSortKey(){return state.mtSort||"err";}
function gFirst(g){return g.items.reduce((m,it)=>Math.min(m,it.s*1000+it.a),1e9);}
function mtSorted(gs){const k=mtSortKey(),L=gs.slice();
  if(k==="mine")return L; if(k==="msh")return L.sort((x,y)=>gFirst(x)-gFirst(y));
  return L.sort((x,y)=>groupMist(y)-groupMist(x)||(x.due||"").localeCompare(y.due||""));}
function inSur(items){return !mtSur||items.some(it=>it.s===mtSur);}
function groupHTML(g,acts,edit){
  return `<div class="card mt-g">${g.items.map((it,i)=>`<div class="mt-it"><div class="mt-h"><button class="linkbtn sm" data-goloc="${it.s}:${it.a}:${it.w??""}:${it.we??""}">${esc(SURAHS[it.s-1][0])} ${it.a}</button>${edit?`<button class="mt-x" data-mtrm="${g.id}|${i}" aria-label="أزل هذا الموضع من المجموعة" title="أزل هذا الموضع">✕</button>`:""}</div><div class="mq">${diffHTML(it,g.items.filter(o=>o!==it))}</div></div>`).join("")}${g.note?`<div class="note">📝 ${esc(g.note)}</div>`:""}${acts||""}</div>`;
}
function renderMutTab(){
  const el=document.getElementById("v-list");
  if(!Q){el.innerHTML=`<h2 class="page-t">المتشابهات</h2><div class="card empty"><p class="meta">جارٍ التحميل…</p></div>`;loadQ().then(()=>{if(view==="list")renderList();}).catch(()=>{});return;}
  {const seen=new Set();for(const g of state.mutash){if(!g.id||seen.has(g.id))g.id="g"+Date.now().toString(36)+Math.random().toString(36).slice(2,6);seen.add(g.id);}}
  const dg=dueGroups().length; const gs=mtSorted(state.mutash.filter(g=>inSur(g.items)));
  loadMut(); const sug=allSugg().filter(sig=>!sugDone(sig)&&inSur(sigItems(sig)));
  const sk=mtSortKey();
  const shownG=mutOpenAll?gs:gs.slice(0,15);
  el.innerHTML=`<h2 class="page-t">المتشابهات</h2>
    <div class="card" style="margin-bottom:12px">${state.mutash.length?`<div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><span><b>مراجعة المتشابهات</b><span class="meta" style="display:block">${dg?(dg===1?"مجموعة واحدة مستحقة":dg+" مجموعات مستحقة"):"لا شيء مستحق اليوم"}</span></span><button class="btn sm" data-mqstart="${dg?"due":"all"}">${dg?"ابدأ":"راجع الكل"}</button></div>`:`<p class="help" style="margin:0">اربط الآيات المتشابهة لتراجعها معًا: من الاقتراحات أدناه، أو في المصحف بضغطة مطوّلة على كلمة.</p>`}</div>
    <div class="card mt-tools"><label class="meta" for="mtSur">السورة</label><select id="mtSur"><option value="0">كل السور</option>${SURAHS.map((x,i)=>`<option value="${i+1}" ${mtSur===i+1?"selected":""}>${i+1}. ${esc(x[0])}</option>`).join("")}</select>${mtSur?`<button class="linkbtn sm" id="mtSurX">✕ الكل</button>`:""}</div>
    ${state.mutash.length?`<div class="section-t">متشابهاتي (${gs.length}${mtSur?" في "+esc(SURAHS[mtSur-1][0]):""})</div>
    <div class="chips mt-sort"><span class="meta">الترتيب:</span><button class="chip ${sk==="err"?"on":""}" data-mtsort="err">الأكثر خطأً</button><button class="chip ${sk==="msh"?"on":""}" data-mtsort="msh">ترتيب المصحف</button><button class="chip ${sk==="mine"?"on":""}" data-mtsort="mine">ترتيبي</button></div>
    ${sk==="mine"?`<p class="help" style="margin:0 0 8px">رتّبها بالأسهم ↑ ↓، وتُراجَع بهذا الترتيب.</p>`:""}
    ${gs.length?(mutOpenAll||mtSur?gs:gs.slice(0,15)).map((g,i,A)=>{const mc=groupMist(g);
      return groupHTML(g,`${mc?`<div class="meta" style="margin-top:6px;color:var(--red)">⚠️ ${errTxt(mc)} خطأ في هذه المواضع</div>`:""}<div class="bar-acts mt-acts">${sk==="mine"?`<button class="btn ghost sm" data-mtup="${g.id}" ${i?"":"disabled"} aria-label="أعلى">↑</button><button class="btn ghost sm" data-mtdn="${g.id}" ${i<A.length-1?"":"disabled"} aria-label="أسفل">↓</button>`:""}<span class="grow"></span>${mtDelAsk===g.id?`<button class="btn sm" style="background:var(--red);color:#fff" data-mtdel="${g.id}">تأكيد الحذف</button><button class="btn ghost sm" data-mtdel="">إلغاء</button>`:`<button class="btn ghost sm" data-mtask="${g.id}">🗑 حذف</button>`}</div>`,true);}).join("")+(!mutOpenAll&&!mtSur&&gs.length>15?`<button class="linkbtn" data-mtall="1" style="padding:6px 0">عرض الكل (${gs.length})</button>`:""):`<p class="meta">لا متشابهات مسجّلة في هذه السورة.</p>`}`:""}
    <div class="section-t" style="margin-top:20px">اقتراحات (${sug.length}${mtSur?" في "+esc(SURAHS[mtSur-1][0]):""}) <span>📚 من كتاب المتشابهات، والباقي آيات تشترك في 6 كلمات أو أكثر · اختر ما تريد</span></div>
    ${sug.length?sug.slice(0,sugN).map(sig=>{const its=sigItems(sig);return groupHTML({items:its,note:""},`${sigCur(sig)?`<div class="meta" style="margin-top:6px">📚 من كتاب المتشابهات</div>`:""}<div class="bar-acts" style="margin-top:8px"><button class="btn sm" data-sgadd="${sig}">سجّل</button><button class="btn ghost sm" data-sgno="${sig}">لا</button></div>`);}).join("")+(sug.length>sugN?`<button class="linkbtn" data-sgmore="1" style="padding:6px 0">المزيد</button>`:""):`<p class="meta">لا اقتراحات أخرى.</p>`}
    <p class="help">المعلَّمة بـ📚 من بيانات متشابهات القرآن للقارئ إدريس العاصم رحمه الله (مقابَلة على ترقيم قالون). الباقي محسوب آليًا من تطابق الكلمات، فقد تفوتها متشابهات تختلف في كلمة، وقد تقترح ما لا يُعدّ متشابهًا؛ فأنت تختار.</p>`;

  {const ms=document.getElementById("mtSur");if(ms)ms.onchange=()=>{mtSur=Number(ms.value);mtDelAsk=null;renderList();};}}
document.addEventListener("click",e=>{const t=e.target.closest&&e.target.closest("[data-sgadd],[data-sgno],[data-sgmore],[data-mtall],[data-sugl],#sugMore,[data-mtsort],[data-mtup],[data-mtdn],[data-mtask],[data-mtdel],[data-mtrm],#mtSurX");if(!t)return;const d=t.dataset;
  if(d.mtsort){if(d.mtsort==="mine"&&!state.mtMine){state.mutash=mtSorted(state.mutash);state.mtMine=1;}state.mtSort=d.mtsort;save();renderList();return;}
  if(d.mtup||d.mtdn){const id=d.mtup||d.mtdn;const vis=state.mutash.filter(g=>inSur(g.items));const i=vis.findIndex(g=>g.id===id),j=d.mtup?i-1:i+1;if(i<0||j<0||j>=vis.length)return;
    const A=state.mutash,x=A.indexOf(vis[i]),y=A.indexOf(vis[j]);[A[x],A[y]]=[A[y],A[x]];state.mtMine=1;save();renderList();return;}
  if(d.mtask){mtDelAsk=d.mtask;renderList();return;}
  if(d.mtdel!==undefined){if(d.mtdel){state.mutash=state.mutash.filter(g=>g.id!==d.mtdel);save();toast("حُذفت المجموعة");}mtDelAsk=null;renderList();return;}
  if(d.mtrm){const [id,i]=d.mtrm.split("|");const g=state.mutash.find(x=>x.id===id);if(g){unlinkLoc(g.items[Number(i)]);toast(g.items.length<2?"حُذفت المجموعة":"أُزيل الموضع");}renderList();return;}
  if(t.id==="mtSurX"){mtSur=0;renderList();return;}
  if(d.sgadd){const its=sigItems(d.sgadd);for(let i=1;i<its.length;i++)linkLocs(its[0],its[i]);save();renderList();toast("سُجّلت "+(its.length===2?"آيتان":its.length+" آيات")+" كمتشابهات");}
  else if(d.sgno){state.mdis.push(d.sgno);save();renderList();}
  else if(d.sgmore){sugN+=10;renderList();}
  else if(d.mtall){mutOpenAll=true;renderList();}
  else if(d.sugl&&mSel){const [s,a]=d.sugl.split(":").map(Number);linkLocs({s:mSel.s,a:mSel.a,w:null},{s,a,w:null});toast("رُبطت مع "+SURAHS[s-1][0]+" "+a);renderMushaf();}
  else if(t.id==="sugMore"){sugAll=true;renderMushaf();}
});
// surahs (review schedule) and tests, shown in the stats tab in huffaz mode
function surahsCardHTML(){
  return `<div class="card" style="margin-bottom:10px"><div style="font-weight:600">اختبر نفسك</div><div class="chips" style="margin:8px 0 0"><button class="chip" data-tstart="complete">أكمل الآية</button><button class="chip" data-tstart="where">أين هذه الآية؟</button><button class="chip" data-tstart="link">ربط الآيات</button></div></div>
  <details class="card" style="margin-bottom:10px" id="surDet" ${surOpen?"open":""}><summary style="font-weight:600;cursor:pointer">السور: المراجعة والأخطاء</summary>
    <div class="list">${unitList().map(u=>{const ks=unitKeys(u);const k=u.k+u.n;const o=mOpen.has(k);
      return `<div class="s" style="cursor:default"><div class="num">${unitNum(u)}</div><div class="grow"><div class="name">${unitShort(u)}</div><div class="meta">${rvHas(u.k,u.n)?"في مراجعتي":""}</div></div>${ks.length?`<button class="mx-btn${o?" on":""}" data-mtog="${k}">⚠️ الأخطاء (${ks.length}) ${o?"▴":"▾"}</button>`:""}</div>${o?mistListHTML(ks,u.k==="g"):""}`;}).join("")}</div></details>`;
}

// ---- Mistakes shown as full ayat (huffaz mode): the words you got wrong in another colour, weak pages first ----
const mOpen=new Set();
function mistKeysIn(sn,from,to){return Object.keys(state.mistakes).filter(k=>{const [x,a]=k.split(":").map(Number);return x===sn&&a>=from&&a<=to;}).sort((p,q)=>Number(p.split(":")[1])-Number(q.split(":")[1]));}
function pageMist(p){if(!PAGE_IDX)return 0;return PAGE_IDX[p].reduce((t,[x,a])=>t+((state.mistakes[x+":"+a]||{}).c||0),0);}
function mistListHTML(keys,withSurah){
  if(!keys.length) return "";
  if(!Q){loadQ().then(()=>render()).catch(()=>{});return `<p class="meta">جارٍ التحميل…</p>`;}
  const pages=[...new Set(keys.map(k=>{const [x,a]=k.split(":").map(Number);return Q.p[x-1][a-1];}))].sort((p,q)=>p-q).filter(p=>pageMist(p)>=3);
  return `<div class="mx">${pages.map(p=>`<button class="mx-page" data-khopen="${p}">📄 صفحة ${p} · أخطأت فيها ${errTxt(pageMist(p))} · راجعها كاملة</button>`).join("")}
    ${keys.map(k=>{const [x,a]=k.split(":").map(Number);const m=state.mistakes[k];const {words,num}=ayaParts(Q.t[x-1][a-1]);
      return `<button class="mx-aya" data-openaya="${x}:${a}"><span class="ml">${withSurah?esc(SURAHS[x-1][0])+" ":"الآية "}${a} · أخطأت ${errTxt(m.c)}</span><span class="mx-t">${words.map((w,i)=>m.w&&m.w[i]?`<span class="mxw">${esc(w)}</span>`:esc(w)).join(" ")} ${esc(num)}</span></button>`;}).join("")}</div>`;
}
function mistBtnHTML(key,keys){const o=mOpen.has(key);const multi=new Set(keys.map(k=>k.split(":")[0])).size>1;return `<button class="mx-btn${o?" on":""}" data-mtog="${key}">⚠️ الأخطاء (${ayatTxt(keys.length)}) ${o?"▴":"▾"}</button>`+(o?mistListHTML(keys,multi):"");}
document.addEventListener("click",e=>{const t=e.target.closest&&e.target.closest("[data-mtog]");if(!t)return;e.stopPropagation();const k=t.dataset.mtog;if(mOpen.has(k))mOpen.delete(k);else mOpen.add(k);render();},true);

