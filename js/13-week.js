// ---- Weekly summary (rolling 7-day windows, compared with the 7 days before) ----
let wkOff=0;
function weekDays(off){const end=addDays(today(),-7*off);const ds=[];for(let i=6;i>=0;i--)ds.push(addDays(end,-i));return ds;}
function sumOver(ds,f){return ds.reduce((a,d)=>a+(f(d)||0),0);}
function weekStats(ds){
  const adh=k=>ds.filter(d=>(state.adhLog[d]||[]).includes(k)).length;
  const inW=x=>x&&x>=ds[0]&&x<=ds[6];
  return {
    rev:sumOver(ds,d=>state.log[d]), revH:sumOver(ds,d=>state.rH[d]), goalDays:ds.filter(revOk).length,
    activeDays:ds.filter(d=>state.log[d]||state.hlog[d]||(state.adhLog[d]||[]).length||(state.kh&&state.kh.log[d])).length,
    hif:sumOver(ds,d=>state.hlog[d]), newSegs:Object.values(state.items).filter(it=>inW(it.newAt)),
    kh:state.kh?sumOver(ds,d=>state.kh.log[d]):0,
    sabah:adh("sabah"),masa:adh("masa"),nawm:adh("nawm"),
    qada:state.qada?sumOver(ds,d=>{const a=state.qada.log[d];return a?a.reduce((x,y)=>x+y,0):0;}):0,
    tsb:sumOver(ds,d=>{const l=state.tsb.log[d];return l?Object.values(l).reduce((x,y)=>x+y,0):0;}),
    mq:sumOver(ds,d=>(state.mlog||{})[d]),
    mist:Object.entries(state.mistakes).filter(([,v])=>inW(v.last)).map(([k,v])=>{const [s,a]=k.split(":").map(Number);return {s,a,c:v.c};}).sort((x,y)=>y.c-x.c),
  };
}
function trend(a,b){if(!b&&!a)return "";if(!b)return `<span class="tr up">جديد</span>`;const p=Math.round((a-b)/b*100);if(p===0)return `<span class="tr">كالأسبوع الماضي</span>`;return `<span class="tr ${p>0?"up":"down"}">${p>0?"▲":"▼"} ${Math.abs(p)}%</span>`;}
function renderWeek(){
  const el=document.getElementById("v-week");
  const ds=weekDays(wkOff), prev=weekDays(wkOff+1); const W=weekStats(ds), P=weekStats(prev);
  const rangeTxt=fmtDate(ds[0])+" – "+fmtDate(ds[6]);
  const weak=Object.entries(state.items).filter(([,it])=>it.level<=1&&it.reviews>0).map(([,it])=>it);
  const t=today(); let dueNext=0; for(let i=1;i<=7;i++){const d=addDays(t,i);dueNext+=Object.values(state.items).filter(it=>!isRecent(it)&&it.due===d).length;}
  const overdue=Object.values(state.items).filter(it=>!isRecent(it)&&diffDays(t,it.due)>=3).length;
  const row=(label,val,tr,sub)=>`<div class="wk-row"><div><div class="wk-l">${label}</div>${sub?`<div class="meta">${sub}</div>`:""}</div><div class="wk-v">${val}${tr||""}</div></div>`;
  const dots=ds.map(d=>{const g=revOk(d), any=state.log[d];const [y,m,dd]=d.split("-").map(Number);return `<div class="wk-day ${g?"g":any?"h":""}"><span>${["أحد","إثن","ثلا","أرب","خمي","جمع","سبت"][new Date(y,m-1,dd).getDay()]}</span></div>`;}).join("");
  // what to focus on next
  const focus=[];
  if(W.goalDays<5&&HUF()) focus.push(`راجعت في ${daysTxt(W.goalDays)} فقط من 7. حاول أن تراجع شيئًا من «مراجعتي» كل يوم ولو قليلًا.`);
  else if(W.goalDays<5) focus.push(`بلغت هدف المراجعة في ${daysTxt(W.goalDays)} فقط من 7. ${state.goalH>2?"إن كان الهدف ثقيلًا، جرّب تخفيفه قليلًا من الإعدادات.":"حاول أن تثبت على وِرد يومي ولو قليلًا."}`);
  if(overdue) focus.push(`${overdue===1?"مقطع واحد متأخر":segTxt(overdue)+" متأخرة"} عن موعد المراجعة 3 أيام أو أكثر؛ ابدأ ${overdue===1?"به":"بها"}.`);
  if(weak.length) focus.push(`مقاطع ضعيفة تحتاج تكرارًا: ${weak.slice(0,6).map(it=>SURAHS[it.s-1][0]+(isFull(it)?"":" "+it.from+"–"+it.to)).join("، ")}${weak.length>6?"…":""}.`);
  if(W.mist.length) focus.push(`أكثر الآيات خطأً هذا الأسبوع: ${W.mist.slice(0,4).map(m=>SURAHS[m.s-1][0]+" "+m.a).join("، ")}. راجعها في المصحف بوضع «إخفاء».`);
  if(state.mutash.length&&dueGroups().length) focus.push(`${dueGroups().length===1?"مجموعة متشابهات واحدة مستحقة":dueGroups().length+" مجموعات متشابهات مستحقة"} للمراجعة.`);
  if(W.sabah<5||W.masa<5) focus.push(`أذكار الصباح ${W.sabah}/7 والمساء ${W.masa}/7.`);
  if(dueNext) focus.push(`المراجعات المجدولة في الأيام السبعة القادمة: ${segTxt(dueNext)}.`);
  const summaryText=[`ملخّص أسبوعي (${rangeTxt})`,`المراجعة: ${segTxt(W.rev)} ≈ ${fmtH(W.revH)} حزب، بلغت الهدف ${W.goalDays}/7 أيام`,W.hif?`الحفظ الجديد: ${ayatTxt(W.hif)}`:"",W.kh?`الختمة: ${pagesTxt(W.kh)}`:"",`الأذكار: الصباح ${W.sabah}/7، المساء ${W.masa}/7`,W.qada?`قضاء الفوائت: ${prayersTxt(W.qada)}`:"",W.tsb?`المسبحة: ${W.tsb}`:""].filter(Boolean).join("\n");
  el.innerHTML=`<button class="linkbtn" data-go="stats">→ المتابعة</button>
    <div class="cal-head" style="margin-top:6px"><button class="icon-nav" data-wknav="1" aria-label="الأسبوع السابق">›</button>
      <div style="text-align:center"><div class="cal-g">${wkOff===0?"آخر 7 أيام":wkOff===1?"الأسبوع الذي قبله":"قبل "+wkOff+" أسابيع"}</div><div class="meta">${rangeTxt}</div></div>
      <button class="icon-nav" data-wknav="-1" ${wkOff===0?"disabled":""} aria-label="الأسبوع التالي">‹</button></div>
    <div class="card"><div class="wk-days">${dots}</div><p class="meta" style="margin:6px 0 0;text-align:center">نشِطت ${daysTxt(W.activeDays)} من 7 · الخانة الملوّنة = ${HUF()?"يوم راجعت فيه":"بلغت هدف المراجعة"}</p></div>
    <div class="card" style="margin-top:10px">
      ${row("المراجعة",segTxt(W.rev),trend(W.rev,P.rev),`≈ ${fmtH(W.revH)} حزب · ${HUF()?"راجعت في "+W.goalDays+"/7 أيام":"بلغت الهدف "+W.goalDays+"/7"}`)}
      ${HUF()?"":row("الحفظ الجديد",W.hif?ayatTxt(W.hif):"—",trend(W.hif,P.hif),W.newSegs.length?W.newSegs.slice(0,4).map(it=>SURAHS[it.s-1][0]+" "+it.from+"–"+it.to).join("، "):"")}
      ${state.kh||W.kh?row("ورد الختمة",W.kh?pagesTxt(W.kh):"—",trend(W.kh,P.kh)):""}
      ${row("الأذكار",`${W.sabah+W.masa}/14`,trend(W.sabah+W.masa,P.sabah+P.masa),`الصباح ${W.sabah}/7 · المساء ${W.masa}/7 · النوم ${W.nawm}/7`)}
      ${state.qada||W.qada?row("قضاء الفوائت",W.qada?prayersTxt(W.qada):"—",trend(W.qada,P.qada),state.qada?"المتبقي: "+prayersTxt(qadaLeftTotal()):""):""}
      ${W.tsb||P.tsb?row("المسبحة",String(W.tsb),trend(W.tsb,P.tsb)):""}
      ${state.mutash.length?row("مراجعة المتشابهات",W.mq?(W.mq===1?"مجموعة واحدة":W.mq+" مجموعات"):"—",trend(W.mq,P.mq)):""}
    </div>
    ${W.mist.length&&HUF()?`<div class="card" style="margin-top:10px"><div style="font-weight:600">أخطاء هذا الأسبوع</div>${mistListHTML(W.mist.slice(0,10).map(m=>m.s+":"+m.a),true)}</div>`:""}
    ${W.mist.length&&!HUF()?`<div class="card" style="margin-top:10px"><div style="font-weight:600">أخطاء هذا الأسبوع</div><div class="mist" style="color:var(--ink)">${W.mist.slice(0,10).map(m=>`<button class="chip" data-openaya="${m.s}:${m.a}">${SURAHS[m.s-1][0]} ${m.a} · ${errTxt(m.c)}</button>`).join("")}</div></div>`:""}
    ${wkOff===0?`<div class="card hifdh" style="margin-top:10px"><div style="font-weight:600;margin-bottom:4px">ما تركّز عليه الأسبوع القادم</div>${focus.length?`<ul class="wk-focus">${focus.map(f=>`<li>${f}</li>`).join("")}</ul>`:`<p class="meta">أسبوع ممتاز، بارك الله فيك. استمر على وِردك.</p>`}</div>`:""}
    <div class="row-btns"><button class="btn ghost" id="wkCopy">نسخ الملخّص</button></div>`;
  document.getElementById("wkCopy").onclick=async()=>{try{await navigator.clipboard.writeText(summaryText);toast("نُسخ الملخّص");}catch(e){toast("تعذّر النسخ هنا");}};
}

function mutashCard(){
  if(!state.mutash.length) return `<div class="card" style="margin-bottom:12px"><div style="font-weight:600">متشابهاتي</div><p class="help" style="margin-bottom:0">في المصحف، اضغط على كلمة أو على رقم آية، ثم «تشبه موضعًا آخر…»، واختر الموضع المشابه. تظهر المواضع المربوطة هنا مع ملاحظتك للتفريق بينها.</p></div>`;
  if(!Q){loadQ().then(()=>{if(view==="list")renderList();}).catch(()=>{});}
  return `<details class="card" style="margin-bottom:12px" ${mshOpen?"open":""} id="mshDetails"><summary style="font-weight:600;cursor:pointer">متشابهاتي (${state.mutash.length})</summary>
    ${state.mutash.map(g=>`<div class="msh-group">${g.items.map(it=>`<button class="msh-item" data-goloc="${it.s}:${it.a}:${it.w??""}:${it.we??""}"><span class="ml">${esc(SURAHS[it.s-1][0])} ${it.a}${it.w===null?" · الآية":it.we!=null?" · عبارة":" · كلمة"}</span><span class="mq">${esc(locSnippet(it))}</span></button>`).join("")}${g.note?`<div class="note">📝 ${esc(g.note)}</div>`:""}</div>`).join("")}</details>`;
}
let mshOpen=false;
function renderList(){
  if(HUF()){renderMutTab();return;}
  const el=document.getElementById("v-list");
  const q=listQuery.trim();
  const rows=SURAHS.map((s,i)=>i+1).filter(n=>{
    const st=statusOf(n);
    if(!HUF()&&listFilter==="mem"&&st==="none") return false;
    if(!HUF()&&listFilter==="not"&&st!=="none") return false;
    if(q){ return SURAHS[n-1][0].includes(q)||String(n)===q; }
    return true;
  });
  const memCount=SURAHS.filter((_,i)=>statusOf(i+1)!=="none").length;
  const dg=dueGroups().length;
  el.innerHTML=`<div class="card" style="margin-bottom:12px"><div style="font-weight:600">${HUF()?"اختبر نفسك":"اختبر حفظك"}</div><div class="chips" style="margin:8px 0 0"><button class="chip" data-tstart="complete">أكمل الآية</button><button class="chip" data-tstart="where">أين هذه الآية؟</button><button class="chip" data-tstart="link">ربط الآيات</button>${state.mutash.length?`<button class="chip ${dg?"on":""}" data-mqstart="${dg?"due":"all"}">≈ المتشابهات${dg?" ("+dg+" مستحقة)":""}</button>`:""}</div></div>`+mutashCard()+`<div class="tools"><input type="search" id="q" placeholder="ابحث عن سورة…" value="${esc(listQuery)}"></div>
${HUF()?`<p class="help">اضغط على سورة لتقسيمها إلى أجزاء للمراجعة، أو لدمج أجزائها. كل جزء له جدوله الخاص.</p>`:`
    <div class="chips">
      <button class="chip ${listFilter==="all"?"on":""}" data-f="all">الكل (114)</button>
      <button class="chip ${listFilter==="mem"?"on":""}" data-f="mem">محفوظة (${memCount})</button>
      <button class="chip ${listFilter==="not"?"on":""}" data-f="not">غير محفوظة (${114-memCount})</button>
      <button class="chip" data-range="78-114">+ جزء عمّ</button>
      <button class="chip" data-range="67-77">+ جزء تبارك</button>
    </div>
    <p class="help">اضغط على سورة لتحديد ما تحفظه منها: السورة كاملة أو آيات معيّنة (مثلًا نصفها).</p>`}
    <div class="card list" style="padding:4px 12px">${rows.map(n=>{
      const st=statusOf(n); const sg=segs(n);
      const sub=st==="part"?sg.map(([,it])=>rangeTxt(it)).join("، "):(sg.length>1?"مقسّمة إلى "+partsTxt(sg.length)+" للمراجعة":"");
      const h=sg.reduce((a,[,it])=>a+itemH(it),0);
      return `<div class="s ${HUF()?"":st==="full"?"on":st==="part"?"part":""}" data-edit="${n}"><div class="check">${st==="full"&&!HUF()?"✓":""}</div><div class="num">${n}</div><div class="grow"><div class="name">${SURAHS[n-1][0]}</div>${sub?`<div class="meta">${sub}</div>`:""}</div><span class="meta">${HUF()?surDue(n)+" · "+fmtH(HIZB[n-1])+" حزب":(st==="part"?fmtH(h)+" من "+fmtH(HIZB[n-1]):fmtH(HIZB[n-1]))+" حزب"}</span></div>${openEdit===n?editorHTML(n):""}`;
    }).join("")||`<p class="meta" style="padding:12px">لا توجد نتائج.</p>`}</div>`;
  const md=document.getElementById("mshDetails"); if(md) md.ontoggle=()=>{mshOpen=md.open;};
  const qi=document.getElementById("q");
  qi.oninput=e=>{listQuery=e.target.value;const pos=e.target.selectionStart;renderList();const n=document.getElementById("q");n.focus();try{n.setSelectionRange(pos,pos);}catch(_){}}
}

