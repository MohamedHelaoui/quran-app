// ---- 1. Search in the mushaf (letters only: marks and alif ignored, so spelling differences between the mushaf and typing do not matter) ----
function normAr(t){return String(t).replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u08D3-\u08FF\u0640\u00a0\u06DE\u06E9]/g,"").replace(/[أإآٱ]/g,"ا").replace(/ا/g,"").replace(/ى/g,"ي").replace(/ة/g,"ه").replace(/ؤ/g,"و").replace(/ئ/g,"ي").replace(/ء/g,"").replace(/[^\u0621-\u064A ]/g,"").trim();}
let NORM=null;
function normIndex(){if(NORM)return NORM;NORM=Q.t.map(sur=>sur.map(t=>ayaParts(t).words.map(normAr)));return NORM;}
function searchQuran(q){
  const qw=normAr(q).split(/\s+/).filter(Boolean); if(!qw.length) return [];
  const N=normIndex(); const out=[];
  for(let s=0;s<114;s++) for(let a=0;a<N[s].length;a++){ const ws=N[s][a];
    for(let i=0;i+qw.length<=ws.length;i++){ let ok=true;
      for(let k=0;k<qw.length&&ok;k++){ const w=ws[i+k], x=qw[k];
        ok = qw.length===1 ? w.includes(x) : k===0 ? w.endsWith(x) : k===qw.length-1 ? w.startsWith(x) : w===x; }
      if(ok){ out.push(qw.length>1?{s:s+1,a:a+1,w:i,we:i+qw.length-1}:{s:s+1,a:a+1,w:i}); if(out.length>=300) return out; }
    } }
  return out;
}
// every other place where exactly the selected words occur (letters compared without marks)
let occ={key:"",res:[],open:false,picked:new Set(),all:false};
function phraseOcc(L){
  const N=normIndex(); const ws=N[L.s-1][L.a-1]; const r=locRange(L); const q=r?ws.slice(r[0],r[1]+1):ws.slice();
  const qq=q.filter(Boolean); if(!qq.length) return [];
  const out=[];
  for(let s=0;s<114;s++) for(let a=0;a<N[s].length;a++){ const W=N[s][a];
    for(let i=0;i+qq.length<=W.length;i++){ let ok=true; for(let k=0;k<qq.length&&ok;k++) ok=W[i+k]===qq[k];
      if(ok){ const loc=r?(qq.length>1?{s:s+1,a:a+1,w:i,we:i+qq.length-1}:{s:s+1,a:a+1,w:i}):{s:s+1,a:a+1,w:null};
        if(!(loc.s===L.s&&loc.a===L.a&&(r?loc.w===r[0]:true))) out.push(r?loc:{s:s+1,a:a+1,w:null,_m:[i,i+qq.length-1]}); if(!r) break; } } }
  return out;
}
function occFor(L){const k=JSON.stringify(cleanLoc(L));if(occ.key!==k){occ={key:k,res:phraseOcc(L),open:false,picked:new Set(),all:false};}return occ;}
function occSnippet(x){const ws=locWords(x);const m=x._m||locRange(x)||[0,ws.length-1];const i0=Math.max(0,m[0]-3),i1=Math.min(ws.length,m[1]+4);
  return (i0>0?"… ":"")+[esc(ws.slice(i0,m[0]).join(" ")),`<mark>${esc(ws.slice(m[0],m[1]+1).join(" "))}</mark>`,esc(ws.slice(m[1]+1,i1).join(" "))].filter(Boolean).join(" ")+(i1<ws.length?" …":"");}
let mSearch={open:false,q:"",res:null,picked:new Set()};
function searchPanelHTML(){
  if(!mSearch.open) return "";
  const r=mSearch.res;
  return `<div class="card srch"><div class="seg-form"><input type="search" id="sQ" placeholder="ابحث عن كلمة أو عبارة، مثلًا: بغافل عما تعملون" value="${esc(mSearch.q)}" style="flex:1"><button class="btn sm" id="sGo">بحث</button></div>
    ${r===null?`<p class="help">يُبحث في نص مصحف قالون دون اعتبار للتشكيل وطريقة رسم الألف.</p>`:!r.length?`<p class="help">لا نتائج.</p>`:
    `<div class="srch-top"><span class="meta">${r.length>=300?"أكثر من 300 موضع (تظهر أول 300)":r.length+" "+(r.length===1?"موضع":r.length===2?"موضعان":r.length<=10?"مواضع":"موضعًا")}</span>
      ${r.length>1&&r.length<=60?`<button class="linkbtn sm" id="sAll">${mSearch.picked.size===r.length?"إلغاء تحديد الكل":"تحديد الكل"}</button>`:""}</div>
     <div class="srch-list">${r.map((x,i)=>`<div class="srch-it"><input type="checkbox" data-spick="${i}" ${mSearch.picked.has(i)?"checked":""} aria-label="اختيار"><button class="srch-go" data-goloc="${x.s}:${x.a}:${x.w}:${x.we??""}"><span class="ml">${esc(SURAHS[x.s-1][0])} ${x.a}${groupOf(x)?" · ≈ مسجّلة":""}</span><span class="mq">${(()=>{const ws=locWords(x);const i0=Math.max(0,x.w-3),i1=Math.min(ws.length,(x.we??x.w)+4);return (i0>0?"… ":"")+ws.slice(i0,i1).map((w,j)=>{const k=i0+j;return k>=x.w&&k<=(x.we??x.w)?`<mark>${esc(w)}</mark>`:esc(w);}).join(" ")+(i1<ws.length?" …":"");})()}</span></button></div>`).join("")}</div>
     ${mSearch.picked.size>=2?`<div class="bar-acts"><button class="btn sm" id="sLink" style="background:var(--gold-leaf);color:#0d1230">≈ اربط ${mSearch.picked.size} مواضع كمتشابهات</button></div>`:`<p class="help" style="margin:6px 0 0">اختر موضعين أو أكثر لربطها كمتشابهات.</p>`}`}
  </div>`;
}
function bindSearch(){
  if(!mSearch.open) return;
  const run=()=>{mSearch.q=document.getElementById("sQ").value;mSearch.res=mSearch.q.trim()?searchQuran(mSearch.q):null;mSearch.picked=new Set();renderMushaf();const i=document.getElementById("sQ");if(i){i.focus();}};
  document.getElementById("sGo").onclick=run;
  document.getElementById("sQ").onkeydown=e=>{if(e.key==="Enter")run();};
  const al=document.getElementById("sAll"); if(al) al.onclick=()=>{const r=mSearch.res;mSearch.picked=mSearch.picked.size===r.length?new Set():new Set(r.map((_,i)=>i));renderMushaf();};
  document.querySelectorAll("[data-spick]").forEach(c=>c.onchange=()=>{const i=Number(c.dataset.spick);if(c.checked)mSearch.picked.add(i);else mSearch.picked.delete(i);renderMushaf();});
  const lk=document.getElementById("sLink"); if(lk) lk.onclick=()=>{const locs=[...mSearch.picked].sort((a,b)=>a-b).map(i=>cleanLoc(mSearch.res[i]));for(let i=1;i<locs.length;i++)linkLocs(locs[0],locs[i]);mSearch.picked=new Set();toast("رُبطت "+locs.length+" مواضع كمتشابهات");renderMushaf();};
}

// ---- 2. Mutashabihat review: each group gets its own spaced schedule ----
function groupDue(g){return (g.due||"")<=today();}
function dueGroups(){return state.mutash.filter(groupDue);}
let mq=null; // {ids, i, k, shown}
function startMQ(all){let gs=all?state.mutash:dueGroups(); if(HUF()) gs=mtSorted(gs.slice().sort((x,y)=>state.mutash.indexOf(x)-state.mutash.indexOf(y)));if(!gs.length){toast("لا متشابهات مستحقة للمراجعة الآن");return;}
  loadQ().then(()=>{mq={ids:gs.map(g=>g.id),i:0,k:0,shown:false};setView("mquiz");}).catch(()=>toast("تعذّر تحميل المصحف"));}
function mqPrompt(it){const ws=locWords(it);const r=locRange(it);
  if(!r||r[0]===0){return {ctx:"",ask:r?"كيف تبدأ هذه الآية؟":"اقرأ هذه الآية"};}
  const i0=Math.max(0,r[0]-6);return {ctx:(i0>0?"… ":"")+ws.slice(i0,r[0]).join(" "),ask:"كيف تُكمَل؟"};}
function renderMQ(){
  const el=document.getElementById("v-mquiz");
  if(!mq||!Q){el.innerHTML=`<button class="linkbtn" data-go="today">→ اليوم</button><div class="card empty"><p class="meta">لا يوجد اختبار جارٍ.</p></div>`;return;}
  const g=state.mutash.find(x=>x.id===mq.ids[mq.i]);
  if(!g){ el.innerHTML=`<button class="linkbtn" data-go="list">→ ${HUF()?"المتشابهات":"حفظي"}</button><h2 class="page-t">مراجعة المتشابهات</h2><div class="card empty"><div class="name">أتممت ✓</div><p class="meta">راجعت ${mq.ids.length===1?"مجموعة واحدة":mq.ids.length+" مجموعات"}.</p><div class="row-btns"><button class="btn" data-go="today">العودة إلى اليوم</button></div></div>`; return; }
  const it=g.items[mq.k]; const last=mq.k===g.items.length-1; const p=mqPrompt(it);
  el.innerHTML=`<button class="linkbtn" data-mqexit="1">→ إنهاء</button>
    <h2 class="page-t">مراجعة المتشابهات</h2>
    <div class="meta" style="margin-bottom:8px">المجموعة ${mq.i+1} من ${mq.ids.length} · الموضع ${mq.k+1} من ${g.items.length}</div>
    <div class="card"><div class="lbl" style="color:var(--muted)">سورة ${esc(SURAHS[it.s-1][0])}، الآية ${it.a}</div>
      ${p.ctx?`<div class="mp-txt" style="margin-top:6px">${esc(p.ctx)} <span class="q-gap">؟</span></div>`:""}
      <div class="name" style="font-size:18px;margin-top:6px">${p.ask}</div>
      ${mq.shown?`<div class="mp-loc here" style="margin-top:10px"><div class="mp-txt">${ayaWithMark(it)}</div></div>`:`<div class="row-btns"><button class="btn" id="mqShow">أظهر الجواب</button></div>`}
      ${mq.shown&&last?`${g.note?`<div class="note" style="margin-top:10px">📝 ${esc(g.note)}</div>`:""}
        <p class="meta" style="margin:12px 0 4px">كيف كان تمييزك لهذه المواضع؟</p>
        <div class="rate"><button class="hard" data-mqrate="hard">خلطت بينها<small>غدًا</small></button><button class="mid" data-mqrate="mid">ترددت<small>${daysTxt(Math.max(1,Math.round(INTERVALS[Math.min(g.lv||0,INTERVALS.length-1)]/2)))}</small></button><button class="easy" data-mqrate="easy">ميّزتها<small>${daysTxt(INTERVALS[Math.min((g.lv||0)+1,INTERVALS.length-1)])}</small></button></div>`
       :mq.shown?`<div class="row-btns"><button class="btn" id="mqNext">الموضع التالي</button></div>`:""}
    </div>`;
  const sh=document.getElementById("mqShow"); if(sh) sh.onclick=()=>{mq.shown=true;renderMQ();};
  const nx=document.getElementById("mqNext"); if(nx) nx.onclick=()=>{mq.k++;mq.shown=false;renderMQ();};
}
function mqRate(kind){
  const g=state.mutash.find(x=>x.id===mq.ids[mq.i]); if(!g) return; const t=today(); const lv=g.lv||0;
  if(kind==="hard"){g.lv=0;g.due=addDays(t,1);} else if(kind==="mid"){g.lv=lv;g.due=addDays(t,Math.max(1,Math.round(INTERVALS[Math.min(lv,INTERVALS.length-1)]/2)));} else {g.lv=Math.min(lv+1,INTERVALS.length-1);g.due=addDays(t,INTERVALS[g.lv]);}
  state.mlog=state.mlog||{}; state.mlog[t]=(state.mlog[t]||0)+1;
  save(); mq.i++; mq.k=0; mq.shown=false; renderMQ(); window.scrollTo(0,0);
}

// ---- 3. Tests from what you have memorized ----
let tst={mode:"complete",cur:null,shown:false,ok:0,n:0,pick:null,choices:null};
function memAyat(){if(HUF()){const o=[];for(let s0=1;s0<=114;s0++)for(let a=1;a<=SURAHS[s0-1][1];a++)o.push([s0,a]);return o;}const out=[];for(const it of Object.values(state.items))for(let a=it.from;a<=it.to;a++)out.push([it.s,a]);const seen=new Set();return out.filter(([s,a])=>{const k=s+":"+a;if(seen.has(k))return false;seen.add(k);return true;});}
function isMem(s,a){if(HUF())return true;return Object.values(state.items).some(it=>it.s===s&&a>=it.from&&a<=it.to);}
function nextTest(){
  let pool=memAyat(); if(tst.mode==="link") pool=pool.filter(([s,a])=>a<SURAHS[s-1][1]&&isMem(s,a+1));
  if(!pool.length){tst.cur=null;return;}
  let c; for(let k=0;k<6;k++){c=pool[Math.floor(Math.random()*pool.length)];if(!tst.cur||c[0]!==tst.cur[0]||c[1]!==tst.cur[1])break;}
  tst.cur=c; tst.shown=false; tst.pick=null;
  if(tst.mode==="where"){const surs=[...new Set(memAyat().map(x=>x[0]))].filter(x=>x!==c[0]);const others=[];while(others.length<3&&surs.length){others.push(surs.splice(Math.floor(Math.random()*surs.length),1)[0]);}
    while(others.length<3){const r=1+Math.floor(Math.random()*114);if(r!==c[0]&&!others.includes(r))others.push(r);}
    tst.choices=[c[0],...others].sort(()=>Math.random()-.5);}
}
function startTests(mode){loadQ().then(()=>{tst={mode:mode||"complete",cur:null,shown:false,ok:0,n:0,pick:null,choices:null};nextTest();setView("tests");}).catch(()=>toast("تعذّر تحميل المصحف"));}
function renderTests(){
  const el=document.getElementById("v-tests");
  const modes=[["complete","أكمل الآية"],["where","أين هذه الآية؟"],["link","ربط الآيات"]];
  let body="";
  if(!Q){body=`<div class="card empty"><p class="meta">جارٍ التحميل…</p></div>`;}
  else if(!tst.cur){body=`<div class="card empty"><p class="meta">${tst.mode==="link"?"تحتاج إلى آيتين متتاليتين محفوظتين على الأقل.":"لا يوجد محفوظ مسجّل بعد. أضف ما تحفظه من «حفظي»."}</p></div>`;}
  else{
    const [s,a]=tst.cur; const {words}=ayaParts(Q.t[s-1][a-1]);
    if(tst.mode==="complete"){
      const n=Math.min(words.length-1,Math.max(1,Math.min(3,Math.ceil(words.length/4))));
      body=`<div class="card"><div class="lbl" style="color:var(--muted)">سورة ${esc(SURAHS[s-1][0])}، الآية ${a}</div>
        <div class="mp-txt" style="margin-top:6px">${tst.shown?ayaWithMark({s,a,w:null}):esc(words.slice(0,n).join(" "))+' <span class="q-gap">…</span>'}</div>
        ${tst.shown?"":`<p class="help">أكمل الآية من حفظك، ثم اكشف الجواب.</p>`}</div>`;
    } else if(tst.mode==="where"){
      body=`<div class="card"><div class="lbl" style="color:var(--muted)">في أي سورة هذه الآية؟</div>
        <div class="mp-txt" style="margin-top:6px">${esc(words.join(" "))}</div>
        <div class="choices">${tst.choices.map(c=>`<button class="chip ${tst.pick!==null?(c===s?"right":c===tst.pick?"wrong":""):""}" data-tpick="${c}" ${tst.pick!==null?"disabled":""}>${esc(SURAHS[c-1][0])}</button>`).join("")}</div>
        ${tst.pick!==null?`<p class="meta" style="margin-top:10px">${tst.pick===s?"✓ صحيح":"✗ الجواب: سورة "+esc(SURAHS[s-1][0])}، الآية ${a}.</p>
          ${a>1?`<div class="mp-loc" style="margin-top:6px"><div class="mp-h">قبلها · الآية ${a-1}</div><div class="mp-txt">${esc(Q.t[s-1][a-2])}</div></div>`:`<p class="help">هي أول آية في السورة.</p>`}`:""}</div>`;
    } else {
      const tail=words.slice(Math.max(0,words.length-4)).join(" ");
      const nx=ayaParts(Q.t[s-1][a]).words;
      body=`<div class="card"><div class="lbl" style="color:var(--muted)">سورة ${esc(SURAHS[s-1][0])} · نهاية الآية ${a}:</div>
        <div class="mp-txt" style="margin-top:6px">… ${esc(tail)} ${esc(ayaParts(Q.t[s-1][a-1]).num)}</div>
        <div class="name" style="font-size:18px;margin-top:6px">بماذا تبدأ الآية ${a+1}؟</div>
        ${tst.shown?`<div class="mp-loc here" style="margin-top:8px"><div class="mp-txt">${ayaWithMark({s,a:a+1,w:0,we:Math.min(2,nx.length-1)})}</div></div>`:""}</div>`;
    }
    const answered=tst.mode==="where"?tst.pick!==null:tst.shown;
    body+= tst.mode==="where"
      ? (answered?`<div class="row-btns">${tst.pick!==s?`<button class="btn ghost" data-tmist="${s}:${a}">سجّل خطأً في الآية</button>`:""}<button class="btn" data-tnext="1">التالية</button></div>`:"")
      : (answered?`<div class="row-btns"><button class="btn ghost" data-tgrade="0" style="border-color:var(--red);color:var(--red)">أخطأت</button><button class="btn" data-tgrade="1" style="background:var(--green);color:#fff">أصبت</button></div>`
                 :`<div class="row-btns"><button class="btn" data-tshow="1">أظهر الجواب</button></div>`);
  }
  el.innerHTML=`<button class="linkbtn" data-go="${HUF()?"stats":"list"}">→ ${HUF()?"المتابعة":"حفظي"}</button><h2 class="page-t">${HUF()?"اختبر نفسك":"اختبر حفظك"}</h2>
    <div class="chips">${modes.map(([k,n])=>`<button class="chip ${tst.mode===k?"on":""}" data-tmode="${k}">${n}</button>`).join("")}</div>
    ${tst.n?`<p class="meta">النتيجة: ${tst.ok} من ${tst.n}</p>`:""}${body}
    <p class="help" style="text-align:center">${HUF()?"الأسئلة من آيات القرآن كلّه.":"الأسئلة من الآيات التي سجّلتها في «حفظي» فقط."}</p>`;
}

