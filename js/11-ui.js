// ---- UI ----
let openSplit=null, showExtra=false, hParts=null, laterOpen=false, laterAll=false; const laterExp=new Set();
let view="today", openNote=null, openEdit=null, listFilter="all", listQuery="";
document.querySelectorAll(".tabbar button").forEach(b=>b.onclick=()=>setView(b.dataset.v));

function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}

function itemHTML(id,showRate){
  const s=state.items[id]; const n=s.s; const name=SURAHS[n-1][0]; const t=today();
  const late=diffDays(t,s.due);
  const lateTag=late>0?`<span class="tag late">متأخرة ${daysTxt(late)}</span>`:"";
  const noteOpen=openNote===id;
  const count=s.to-s.from+1;
  return `<div class="item${isRecent(s)?" is-new":late>0?" is-late":""}">
    <div class="top"><div class="num">${n}</div>
      <div class="grow"><div class="name">سورة ${name}</div><div class="meta">${isFull(s)?"كاملة":rangeTxt(s)} · ${fmtH(itemH(s))} حزب · ${ayatTxt(count)} · ${timesTxt(s.reviews||0)}</div></div>
      <div style="display:flex;flex-direction:column;gap:4px;align-items:flex-end">${isRecent(s)?`<span class="tag new">جديد · اليوم ${recentDay(s)} من ${state.recent.days}</span>`:`<span class="tag lvl">${LEVEL_NAMES[s.level]}</span>`}${isRecent(s)?"":lateTag}</div>
    </div>
    ${HUF()?(()=>{const ks=mistKeysIn(n,s.from,s.to);return ks.length?mistBtnHTML("i"+n,ks):"";})():(()=>{const ms=mistakesIn(n,s.from,s.to);return ms.length?`<div class="mist">⚠️ آيات أخطأت فيها: ${ms.map(m=>`<button class="chip" data-openaya="${n}:${m.a}" title="${errTxt(m.c)}">${m.a}${m.c>1?" ×"+m.c:""}</button>`).join("")}</div>`:"";})()}
    ${(()=>{const gs=groupsIn(n,s.from,s.to);return gs.length?`<button class="msh-pill" data-mshitem="${id}">≈ متشابهات في هذا المقطع: ${gs.length}</button>`:"";})()}
    ${s.note&&!noteOpen?`<div class="note">📝 ${esc(s.note)}</div>`:""}
    ${noteOpen?`<textarea data-note="${id}" placeholder="أين تخطئ؟ مثلًا: أنسى الآية 12 دائمًا">${esc(s.note||"")}</textarea>`:""}
    <div class="links">
      <button class="linkbtn" data-open="${id}">📖 افتح في المصحف</button>
      <button class="linkbtn" data-notebtn="${id}">${noteOpen?"✓ إغلاق الملاحظة":"📝 ملاحظة"}</button>
    </div>
    ${showRate?`<div class="rate">
      <button class="hard" data-rate="hard" data-id="${id}">نسيت كثيرًا<small>غدًا</small></button>
      <button class="mid" data-rate="mid" data-id="${id}">بعض الأخطاء<small>${daysTxt(Math.max(1,Math.round(INTERVALS[s.level]/2)))}</small></button>
      <button class="easy" data-rate="easy" data-id="${id}">متقنة<small>${daysTxt(INTERVALS[Math.min(s.level+1,INTERVALS.length-1)])}</small></button>
    </div>`:""}
  </div>`;
}

function renderToday(){
  if(HUF()){renderMyRev();return;}
  const el=document.getElementById("v-today");
  const count=Object.keys(state.items).length;
  const khS=khStatus();
  const khChip=khS&&!khS.finished?`<button class="chip ${khS.k.pos>khS.todayEnd?"on":""}" data-go="khatma">ورد الختمة ${khS.k.pos>khS.todayEnd?"✓":"ص "+khS.k.pos+"–"+khS.todayEnd}</button>`:"";
  const qtC=qadaToday(); const qaChip=qtC&&qtC.qT?`<button class="chip ${qtC.ok?"on":""}" data-go="qada">قضاء الفوائت ${qtC.ok?"✓":qtC.dT+"/"+qtC.qT}</button>`:"";
  const adChips=khChip+qaChip+["sabah","masa"].map(k=>{const c=ADHKAR.find(x=>x.k===k);const ok=(state.adhLog[today()]||[]).includes(k);return `<button class="chip ${ok?"on":""}" data-goadh="${k}">${c.n}${ok?" ✓":""}</button>`;}).join("");
  const wirdLine=`<div class="chips" style="align-items:center"><span class="meta">وِرد اليوم:</span>${adChips}</div>`;
  if(!count&&!state.plan.on){
    el.innerHTML=prayerStripHTML()+wirdLine+`<div class="card empty"><div class="name">بسم الله</div>
      <p class="meta">ابدأ بتحديد ما تحفظه: سورة كاملة أو جزءًا منها. يمكنك أيضًا إضافة جزء كامل بضغطة واحدة:</p>
      <p class="meta">أو إن كنت تبدأ الحفظ من جديد: <button class="linkbtn" data-go="settings">اضبط خطة الحفظ</button></p>
      <div class="row-btns"><button class="btn" data-range="78-114">جزء عمّ</button><button class="btn" data-range="67-77">جزء تبارك</button><button class="btn ghost" data-go="list">أختار بنفسي</button></div></div>`;
    return;
  }
  const due=dueList(); const goal=state.goalH;
  let hifdhHTML="";
  if(HUF()){ hifdhHTML=""; hParts=null; }
  else if(state.plan.on){
    const done=state.hlog[today()]||0; const por=todaysPortion(); hParts=por;
    if(!por) hifdhHTML=`<div class="card hifdh"><div class="lbl">حفظ اليوم</div><div class="name">أتممت حفظ القرآن كاملًا، بارك الله فيك 🌿</div></div>`;
    else if(!isHifdhDay(today())&&!done&&!showExtra){const nd=nextHifdhDay(today());hifdhHTML=`<div class="card hifdh"><div class="lbl">الحفظ الجديد</div><div class="name" style="font-size:20px">لا حفظ جديد اليوم حسب خطتك</div><div class="meta">الحفظ القادم: ${WDN[wdOf(nd)]} ${fmtDate(nd)} · سورة ${SURAHS[por[0].s-1][0]} من الآية ${por[0].from}. استغلّ اليوم لتثبيت ما حفظته.</div><div class="row-btns" style="justify-content:flex-start"><button class="btn ghost" id="hExtra">أريد أن أحفظ اليوم على أي حال</button></div></div>`;}
    else if(done&&!showExtra) hifdhHTML=`<div class="card hifdh"><div class="lbl">حفظ اليوم</div><div class="big" style="font-size:30px">أتممت ✓</div><div class="meta">حفظت اليوم ${ayatTxt(done)}. الجديد ${(()=>{const nd=nextHifdhDay(today());return nd===addDays(today(),1)?"غدًا":"يوم "+WDN[wdOf(nd)];})()}: سورة ${SURAHS[por[0].s-1][0]} من الآية ${por[0].from}.</div><div class="row-btns" style="justify-content:flex-start"><button class="btn ghost" id="hExtra">أريد أن أحفظ المزيد اليوم</button></div></div>`;
    else { const last=por[por.length-1];
      hifdhHTML=`<div class="card hifdh"><div class="lbl">حفظ اليوم${done?" (إضافي)":""} · ${amountTxt(state.plan)}</div>
        ${por.map((p,i)=>`<div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;margin-top:4px"><div class="name" style="font-size:24px">سورة ${SURAHS[p.s-1][0]}</div><div class="meta">${i===por.length-1?`الآيات ${p.from}–<span id="hToTxt">${p.to}</span>`:(p.from===1&&p.to===SURAHS[p.s-1][1]?"كاملة":"الآيات "+p.from+"–"+p.to)} <button class="linkbtn" data-hopen="${i}">📖</button></div></div>`).join("")}
        <div class="meta" id="hSize" style="margin-top:4px">${sizeTxt(por)}</div>
        <div class="seg-form" style="margin-top:8px"><label class="meta">${por.length>1?"آخر سورة: ":""}إلى الآية <input type="number" id="hTo" min="${last.from}" max="${SURAHS[last.s-1][1]}" value="${last.to}"></label></div>
        <div class="row-btns" style="justify-content:flex-start"><button class="btn" id="hDone">حفظتها ✓</button></div>
        <p class="help">احفظ المقطع، ثم اختبر نفسك في المصحف بوضع «أول كلمة» أو «إخفاء». عند الضغط على «حفظتها» يُضاف إلى محفوظك وتراجعه غدًا.</p></div>`; }
  } else hifdhHTML=`<p class="meta" style="margin:0 0 10px">تريد أن يقترح عليك التطبيق حفظًا جديدًا كل يوم؟ <button class="linkbtn" data-go="settings">فعّل خطة الحفظ</button></p>`;
  const rec=recentIds(); const recLeft=rec.filter(id=>state.items[id].last!==today());
  let sum=0; const now=[], later=[];
  for(const id of due){ const h=itemH(state.items[id]); if(sum<goal-0.05||now.length===0){now.push(id);sum+=h;} else later.push(id); }
  const doneToday=state.log[today()]||0;
  const totalToday=doneToday+now.length;
  const pct=totalToday?Math.round(doneToday/totalToday*100):100;
  // today's wird at a glance: an eight-pointed star that fills as tasks get done
  const tasks=[];
  tasks.push({n:"المراجعة",ok:!now.length,v:now.length?segTxt(now.length)+(sum>=0.05?" (≈ "+fmtH(sum)+" حزب)":""):(doneToday?"تمّت":"لا شيء مستحق"),act:'data-scroll="sec-review"'});
  {const dg=dueGroups().length; if(dg) tasks.push({n:"مراجعة المتشابهات",ok:false,v:dg===1?"مجموعة واحدة":dg+" مجموعات",act:'data-mqstart="due"'}); else if(state.mlog&&state.mlog[today()]) tasks.push({n:"مراجعة المتشابهات",ok:true,v:"تمّت",act:'data-mqstart="all"'});}
  if(rec.length) tasks.push({n:"المراجعة القريبة",ok:!recLeft.length,v:recLeft.length?segTxt(recLeft.length):"تمّت",act:'data-scroll="sec-recent"'});
  if(!HUF()&&state.plan.on&&todaysPortion()&&(isHifdhDay(today())||(state.hlog[today()]||0)>0)) tasks.push({n:"الحفظ الجديد",ok:(state.hlog[today()]||0)>0,v:(state.hlog[today()]||0)>0?ayatTxt(state.hlog[today()]):amountTxt(state.plan),act:'data-scroll="sec-hifdh"'});
  const qt=qadaToday(); if(qt&&qadaLeftTotal()+qt.dT>0&&qt.qT) tasks.push({n:"قضاء الفوائت",ok:qt.ok,v:qt.dT+" / "+qt.qT,act:'data-go="qada"'});
  if(khS&&!khS.finished) tasks.push({n:"ورد الختمة",ok:khS.k.pos>khS.todayEnd,v:khS.k.pos>khS.todayEnd?"تمّ":"ص "+khS.k.pos+"–"+khS.todayEnd,act:'data-go="khatma"'});
  ["sabah","masa"].forEach(k=>{const c=ADHKAR.find(x=>x.k===k);const ok=(state.adhLog[today()]||[]).includes(k);tasks.push({n:c.n,ok,v:ok?"تمّت":"",act:`data-goadh="${k}"`});});
  const okN=tasks.filter(t=>t.ok).length; const pr=tasks.length?okN/tasks.length:1;
  const hijri=(()=>{try{return new Date().toLocaleDateString("ar-u-ca-islamic-umalqura-nu-latn",{weekday:"long",day:"numeric",month:"long"});}catch(e){return "";}})();
  let html=`<div class="card daybox-card"><p class="daytitle">${hijri}</p><div class="daybox">
      <div class="star" role="img" aria-label="أتممت ${okN} من ${tasks.length}"><svg viewBox="0 0 100 100"><defs><clipPath id="starClip"><rect x="0" y="${100-Math.round(pr*100)}" width="100" height="100"/></clipPath>
        <path id="octa" d="M50 4 L63 18 L82 18 L82 37 L96 50 L82 63 L82 82 L63 82 L50 96 L37 82 L18 82 L18 63 L4 50 L18 37 L18 18 L37 18 Z"/></defs>
        <use href="#octa" fill="var(--indigo-soft)"/><use href="#octa" fill="var(--gold-leaf)" clip-path="url(#starClip)"/>
        <use href="#octa" class="st-o" fill="none" stroke="var(--indigo-2)" stroke-width="2"/><rect x="29" y="29" width="42" height="42" fill="none" stroke="var(--indigo-2)" stroke-opacity=".25" transform="rotate(45 50 50)"/></svg>
        <div class="pct">${okN}/${tasks.length}</div></div>
      <ul class="tasks">${tasks.map(t=>`<li class="${t.ok?"ok":""}"><button ${t.act}><span class="dot">${t.ok?"✓":""}</span><span class="t">${t.n}</span><span class="v">${t.v}</span></button></li>`).join("")}</ul>
    </div></div>`;
  html+=prayerStripHTML();
  if(hifdhHTML) html+=`<div id="sec-hifdh">${hifdhHTML}</div>`;
  if(rec.length){
    html+=`<div class="section-t" id="sec-recent">المراجعة القريبة <span>ما حفظته في آخر ${daysTxt(state.recent.days)}: يُراجَع كل يوم</span></div>`+
      (recLeft.length?recLeft.map(id=>itemHTML(id,true)).join(""):`<div class="card" style="text-align:center;margin-bottom:10px"><span class="meta">أتممت المراجعة القريبة اليوم ✓ (${segTxt(rec.length)})</span></div>`);
  }

  if(now.length){ html+=`<div class="section-t" id="sec-review" ${rec.length?'style="margin-top:22px"':""}>${rec.length?"المراجعة البعيدة":"راجع هذه المقاطع"} <span>اقرأ من حفظك، ثم قيّم نفسك</span></div>`+now.map(id=>itemHTML(id,true)).join(""); }
  if(later.length){
    const lh=later.reduce((a,id)=>a+itemH(state.items[id]),0);
    html+=`<details class="later-box" ${laterOpen?"open":""} id="laterBox"><summary><span><b>إن كان لديك وقت إضافي</b><span class="meta" style="display:block">${segTxt(later.length)} مستحقة بعد هدفك اليومي · ${aboutH(lh)}</span></span><span class="chev" aria-hidden="true">⌄</span></summary>
      <p class="help" style="margin:0 0 8px">ليست مطلوبة اليوم؛ تأتيك في الأيام القادمة. اضغط على مقطع لتراجعه الآن.</p>
      <div class="later-list">${later.slice(0,laterAll?later.length:8).map(id=>{const it=state.items[id];const late=diffDays(today(),it.due);
        return laterExp.has(id)?itemHTML(id,true):`<button class="later-row" data-lexp="${id}"><span class="num">${it.s}</span><span class="grow"><span class="lr-n">${esc(SURAHS[it.s-1][0])}</span><span class="meta">${isFull(it)?"كاملة":rangeTxt(it)} · ${fmtH(itemH(it))} حزب${late>0?" · متأخرة "+daysTxt(late):""}</span></span><span class="lr-go">راجع</span></button>`;}).join("")}${!laterAll&&later.length>8?`<button class="linkbtn" data-lall="1" style="padding:6px 0">عرض الباقي (${later.length-8})</button>`:""}</div></details>`;
  }
  if(!now.length){
    const next=sortedIds().slice(0,5);
    html+=`<div class="section-t">القادمة <span>المراجعات القريبة</span></div><div class="card list">`+next.map(id=>{const it=state.items[id];const d=diffDays(it.due,today());return `<div class="s" style="cursor:default"><div class="num">${it.s}</div><div class="grow"><div class="name">${SURAHS[it.s-1][0]}</div>${isFull(it)?"":`<div class="meta">${rangeTxt(it)}</div>`}</div><span class="meta">${d===1?"غدًا":"بعد "+daysTxt(d)}</span></div>`;}).join("")+`</div>`;
  }
  if(!count) html=hifdhHTML+`<p class="meta" style="text-align:center">ما تحفظه يُضاف إلى المراجعة ويظهر هنا ابتداءً من الغد.</p>`;
  el.innerHTML=html;
  const lb=document.getElementById("laterBox"); if(lb) lb.ontoggle=()=>{laterOpen=lb.open;};
  const hTo=document.getElementById("hTo");
  if(hTo&&hParts){const last=hParts[hParts.length-1];
    hTo.oninput=()=>{const t=Math.round(Number(hTo.value));if(t>=last.from&&t<=SURAHS[last.s-1][1]){last.to=t;document.getElementById("hToTxt").textContent=t;document.getElementById("hSize").textContent=sizeTxt(hParts);}};
    document.getElementById("hDone").onclick=()=>{showExtra=false;confirmHifdh(hParts);};}
  const hx=document.getElementById("hExtra"); if(hx) hx.onclick=()=>{showExtra=true;renderToday();};
}

function editorHTML(n){
  const ayat=SURAHS[n-1][1]; const st=statusOf(n); const sg=segs(n);
  let f0=1; for(const [,it] of sg){ if(it.from<=f0&&it.to>=f0) f0=it.to+1; } if(f0>ayat) f0=1;
  return `<div class="editor">
    ${sg.length?`<div class="meta" style="margin-bottom:6px">${HUF()?"مقاطع المراجعة:":"المحفوظ من هذه السورة:"}</div><div class="segs">${sg.map(([id,it])=>`<span class="seg">${isRecent(it)?"★ ":""}${isFull(it)?"السورة كاملة":rangeTxt(it)}${HUF()?"":`<button data-newtog="${id}" title="${it.newAt?"إزالة من المراجعة القريبة":"تعليمه كحفظ جديد (مراجعة يومية)"}" style="color:var(--gold)">${it.newAt?"★":"☆"}</button>`}${it.to>it.from?`<button data-splitopen="${id}" title="تقسيم للمراجعة" style="color:var(--green)">✂</button>`:""}${HUF()?"":`<button data-delseg="${id}" title="إزالة">✕</button>`}</span>`).join("")}</div>
    ${openSplit&&state.items[openSplit]&&state.items[openSplit].s===n?(()=>{const it=state.items[openSplit];const mid=Math.floor((it.from+it.to+1)/2);return `<div class="split-box">
      <div style="font-weight:600;margin-bottom:6px">تقسيم ${isFull(it)?"السورة":rangeTxt(it)} للمراجعة</div>
      <div class="seg-form"><label>قسّم عند الآية <input type="number" id="splitA" min="${it.from+1}" max="${it.to}" value="${mid}"></label><button class="btn" data-splitat="${openSplit}">قسّم إلى جزأين</button></div>
      <div class="seg-form" style="margin-top:8px"><label>أو أجزاء بحجم حوالي <input type="number" id="splitH" min="0.25" step="0.25" value="${Math.min(1,Math.max(0.25,Math.round(rangeH(it.s,it.from,it.to)/2*4)/4))}"> حزب</label><button class="btn" data-splith="${openSplit}">قسّم</button></div>
      <p class="help">حجم هذا المقطع حوالي ${fmtH(rangeH(it.s,it.from,it.to))} حزب. كل جزء يُراجَع وحده وله جدوله الخاص.</p></div>`;})():""}
    ${sg.length>1&&sg.some(([,a],i)=>i>0&&a.from<=sg[i-1][1].to+1)?`<button class="linkbtn" data-merge="${n}" style="font-size:13px;margin-bottom:8px">↺ دمج الأجزاء المتصلة في مقطع واحد</button>`:""}`:`<div class="meta" style="margin-bottom:6px">لم تحدّد شيئًا من هذه السورة بعد.</div>`}
${HUF()?`<p class="help">عدد آيات السورة: ${ayat}. اضغط ✂ لتقسيم السورة أو المقطع إلى أجزاء تراجع كل جزء منها وحده، أو «دمج» لإعادة الأجزاء المتصلة إلى مقطع واحد.</p>`:`
    <div class="seg-form">
      <label>من الآية <input type="number" id="from-${n}" min="1" max="${ayat}" value="${f0}"></label>
      <label>إلى الآية <input type="number" id="to-${n}" min="1" max="${ayat}" value="${ayat}"></label>
      <label class="meta" style="font-size:13px"><input type="checkbox" id="new-${n}"> حفظ جديد</label>
      <button class="btn" data-addseg="${n}">إضافة المقطع</button>
    </div>
    <div class="row-btns" style="justify-content:flex-start;margin-top:10px">
      ${st!=="full"?`<button class="btn ghost" data-full="${n}">حفظتها كاملة</button>`:""}
      ${sg.length?`<button class="btn ghost" data-clear="${n}" style="border-color:var(--red);color:var(--red)">إلغاء الحفظ</button>`:""}
    </div>
    <p class="help">عدد آيات السورة: ${ayat}. اضغط ✂ لتقسيم السورة أو المقطع إلى أجزاء تراجع كل جزء منها وحده.</p>`}
  </div>`;
}

