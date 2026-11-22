// ---- Calendar: past activity and scheduled reviews per day ----
let calYM=null, calSel=null;
const WD=["الإثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت","الأحد"];
function hijriParts(d){try{const [y,m,dd]=d.split("-").map(Number);const f=new Intl.DateTimeFormat("ar-u-ca-islamic-umalqura-nu-latn",{day:"numeric",month:"long",year:"numeric"});const o={};f.formatToParts(new Date(y,m-1,dd)).forEach(x=>o[x.type]=x.value);return o;}catch(e){return {};}}
function dayInfo(d){
  const t=today();
  const info={rev:state.log[d]||0,revH:state.rH[d]||0,hif:HUF()?0:(state.hlog[d]||0),adh:state.adhLog[d]||[],kh:(state.kh&&state.kh.log[d])||0,cust:(state.hdone[d]||[]).length};
  if(d>=t){ info.due=Object.values(state.items).filter(it=>!isRecent(it)&&(d===t?it.due<=t:it.due===d)).length; }
  info.any=info.rev||info.hif||info.adh.length||info.kh||info.cust;
  return info;
}
function calendarCard(){
  const t=today(); if(!calYM){const [y,m]=t.split("-").map(Number);calYM=[y,m];}
  const [Y,M]=calYM; const first=new Date(Y,M-1,1); const nDays=new Date(Y,M,0).getDate();
  const lead=(first.getDay()+6)%7; // Monday first
  const z=n=>String(n).padStart(2,"0");
  const gName=first.toLocaleDateString("ar-u-nu-latn",{month:"long",year:"numeric"});
  const h1=hijriParts(Y+"-"+z(M)+"-01"), h2=hijriParts(Y+"-"+z(M)+"-"+z(nDays));
  const hName=h1.month===h2.month?h1.month+" "+h1.year:h1.month+" – "+h2.month+" "+h2.year;
  let cells="";
  for(let i=0;i<lead;i++) cells+=`<div></div>`;
  for(let dd=1;dd<=nDays;dd++){
    const d=Y+"-"+z(M)+"-"+z(dd); const inf=dayInfo(d); const hp=hijriParts(d);
    const goal=revOk(d);
    const dots=[inf.rev?'<i class="c-rev"></i>':"",inf.hif?'<i class="c-hif"></i>':"",inf.adh.length?'<i class="c-adh"></i>':"",inf.kh?'<i class="c-kh"></i>':""].join("");
    cells+=`<button class="cday${d===t?" today":""}${d>t?" future":""}${goal?" goal":""}${calSel===d?" sel":""}" data-cal="${d}" aria-label="${dd}">
      <span class="g">${dd}</span><span class="h">${hp.day||""}</span>
      ${d<=t?`<span class="dots">${dots}</span>`:(inf.due?`<span class="due">${inf.due}</span>`:"")}</button>`;
  }
  let detail="";
  if(calSel){
    const inf=dayInfo(calSel); const hp=hijriParts(calSel);
    const [y,m,dd]=calSel.split("-").map(Number);
    const title=new Date(y,m-1,dd).toLocaleDateString("ar-u-nu-latn",{weekday:"long",day:"numeric",month:"long"})+(hp.day?` · ${hp.day} ${hp.month}`:"");
    const rows=[];
    if(calSel>t){ rows.push(inf.due?`مراجعة مجدولة: ${segTxt(inf.due)}`:"لا مراجعة مجدولة في هذا اليوم"); }
    else{
      if(inf.rev) rows.push(`المراجعة: ${segTxt(inf.rev)}${inf.revH?" ("+aboutH(inf.revH)+")":""}${inf.revH>=state.goalH*0.9?" ✓ بلغت الهدف":""}`);
      if(inf.hif) rows.push(`الحفظ الجديد: ${ayatTxt(inf.hif)}`);
      if(inf.adh.length) rows.push("الأذكار: "+inf.adh.map(k=>(ADHKAR.find(x=>x.k===k)||{}).n).filter(Boolean).join("، "));
      if(inf.kh) rows.push(`ورد الختمة: ${pagesTxt(inf.kh)}`);
      {const l=state.tsb.log[calSel];if(l){const parts=state.tsb.items.filter(i=>l[i.id]).map(i=>i.t.replace(/[\u064B-\u0652]/g,"")+" "+l[i.id]);if(parts.length)rows.push("المسبحة: "+parts.join("، "));}}
      {const qa=state.qada&&state.qada.log[calSel];const n=qa?qa.reduce((a,b)=>a+b,0):0;if(n) rows.push(`قضاء الفوائت: ${prayersTxt(n)} (${qa.map((x,i)=>x?PR_NAMES[i]+(x>1?" ×"+x:""):"").filter(Boolean).join("، ")})`);}
      if(inf.cust) rows.push("عاداتك: "+(state.hdone[calSel]||[]).map(id=>(state.habits.find(h=>h.id===id)||{}).n).filter(Boolean).join("، "));
      if(calSel===t&&inf.due) rows.push(`ما زال مستحقًا اليوم: ${segTxt(inf.due)}`);
      if(!rows.length) rows.push("لم يُسجَّل شيء في هذا اليوم.");
    }
    const pp=prayersOn(calSel);
    detail=`<div class="cal-detail"><div style="font-weight:600">${title}</div><ul>${rows.map(r=>`<li>${r}</li>`).join("")}</ul>${pp?`<div class="pray-row" style="margin-top:8px">${pp.map(p=>`<div class="pc"><span class="pn">${p.n}</span><span class="pt">${prTime(p.s)}</span></div>`).join("")}</div>`:""}</div>`;
  }
  return `<div class="card" style="margin-bottom:10px">
    <div class="cal-head"><button class="icon-nav" data-calnav="-1" aria-label="الشهر السابق">›</button>
      <div style="text-align:center"><div class="cal-g">${gName}</div><div class="meta">${hName}</div></div>
      <button class="icon-nav" data-calnav="1" aria-label="الشهر التالي">‹</button></div>
    <div class="cal-grid">${["إثنين","ثلاثاء","أربعاء","خميس","جمعة","سبت","أحد"].map(w=>`<div class="cwd">${w}</div>`).join("")}${cells}</div>
    <div class="cal-legend"><span><i class="c-rev"></i>مراجعة</span>${HUF()?"":`<span><i class="c-hif"></i>حفظ</span>`}<span><i class="c-adh"></i>أذكار</span><span><i class="c-kh"></i>ختمة</span><span><b class="lg-goal"></b>بلغت هدف المراجعة</span><span><b class="due" style="position:static">3</b>مراجعات قادمة</span></div>
    ${detail}
    ${calYM.join("-")!==t.slice(0,7).split("-").map(Number).join("-")?`<div class="row-btns" style="margin-top:8px"><button class="linkbtn" data-calnav="0">العودة إلى هذا الشهر</button></div>`:""}
  </div>`;
}

// ---- Habit tracker ----
function autoHabits(){
  const a=[
    {id:"review",n:"المراجعة",auto:true,ok:revOk,half:d=>(state.log[d]||0)>0},
    ...(HUF()?[]:[{id:"hifdh",n:"الحفظ الجديد",auto:true,ok:d=>(state.hlog[d]||0)>0,off:d=>state.plan.on&&!isHifdhDay(d)&&!(state.hlog[d]||0)}]),
    {id:"sabah",n:"أذكار الصباح",auto:true,ok:d=>(state.adhLog[d]||[]).includes("sabah")},
    {id:"masa",n:"أذكار المساء",auto:true,ok:d=>(state.adhLog[d]||[]).includes("masa")},
    {id:"nawm",n:"أذكار النوم",auto:true,ok:d=>(state.adhLog[d]||[]).includes("nawm")},
    {id:"tasbih",n:"المسبحة",auto:true,ok:d=>tsbDayState(d)===2,half:d=>tsbDayState(d)===1},
    ...(state.qada?[{id:"qada",n:"قضاء الفوائت",auto:true,ok:d=>qadaDayState(d)===2,half:d=>qadaDayState(d)===1}]:[]),
    ...(state.kh?[{id:"khatma",n:"ورد الختمة",auto:true,ok:d=>(state.kh.log[d]||0)>0}]:[]),
  ];
  return a.concat(state.habits.map(h=>({id:h.id,n:h.n,auto:false,ok:d=>(state.hdone[d]||[]).includes(h.id)})));
}
// 2 = the day's whole target done, 1 = started but not finished, 0 = nothing
function tsbDayState(d){const l=state.tsb.log[d]||{};const any=Object.values(l).some(n=>n>0);if(!any)return 0;
  const goals=state.tsb.items.filter(i=>i.n>0);if(!goals.length)return 2;return goals.every(i=>(l[i.id]||0)>=i.n)?2:1;}
function qadaDayState(d){const q=state.qada;if(!q)return 0;const done=q.log[d]||[0,0,0,0,0];if(!done.some(x=>x))return 0;
  // what was left at the start of that day = left now + everything made up from that day on
  const later=[0,0,0,0,0];for(const [k,a] of Object.entries(q.log))if(k>=d)a.forEach((x,i)=>later[i]+=x);
  const quota=q.left.map((l,i)=>Math.min(q.perDay,l+later[i]));return quota.every((x,i)=>done[i]>=x)?2:1;}
function habitStreak(h){const off=h.off||(()=>false);let d=today(),c=0;if(!h.ok(d))d=addDays(d,-1);for(let k=0;k<400;k++){if(h.ok(d))c++;else if(!off(d))break;d=addDays(d,-1);}return c;}
function toggleHabit(id,d){const l=state.hdone[d]||[];const i=l.indexOf(id);if(i>=0)l.splice(i,1);else l.push(id);if(l.length)state.hdone[d]=l;else delete state.hdone[d];const ks=Object.keys(state.hdone).sort();while(ks.length>400)delete state.hdone[ks.shift()];save();}
const DAYN=["أحد","إثنين","ثلاثاء","أربعاء","خميس","جمعة","سبت"];
function habitsCard(){
  const hs=autoHabits(); const days=[];for(let i=0;i<7;i++)days.push(addDays(today(),-i));
  const dl=d=>{const [y,m,dd]=d.split("-").map(Number);return DAYN[new Date(y,m-1,dd).getDay()];};
  const month=[];for(let i=29;i>=0;i--){const d=addDays(today(),-i);const k=hs.filter(h=>h.ok(d)).length;month.push([d,k]);}
  const doneToday=hs.filter(h=>h.ok(today())).length;
  return `<div class="card" style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;align-items:center"><div style="font-weight:600">متابعة العادات</div><span class="meta">اليوم: ${doneToday} / ${hs.length}</span></div>
    <div class="hgrid" style="grid-template-columns:minmax(84px,1.6fr) repeat(7,minmax(0,1fr)) 36px">
      <div></div>${days.map((d,i)=>`<div class="hday">${i===0?"اليوم":dl(d)}</div>`).join("")}<div class="hday">🔥</div>
      ${hs.map(h=>`<div class="hname">${esc(h.n)}${h.auto?"":` <button class="linkbtn" data-hdel="${h.id}" title="حذف" style="color:var(--muted);font-size:12px">✕</button>`}</div>${days.map(d=>{const ok=h.ok(d);const half=!ok&&h.half&&h.half(d);const rest=!ok&&h.off&&h.off(d);return `<button class="hcell ${ok?"ok":half?"half":rest?"rest":""} ${h.auto?"auto":""}" ${h.auto?`title="${ok?"تمّ":"لم يتمّ"}"`:`data-htog="${h.id}" data-hd="${d}"`}>${ok?"✓":""}</button>`;}).join("")}<div class="hstreak">${habitStreak(h)}</div>`).join("")}
    </div>
    <p class="help">${HUF()?"تُسجَّل المراجعة والأذكار":"تُسجَّل المراجعة والحفظ والأذكار"} تلقائيًا من استعمالك للتطبيق. ${HUF()?"تُعدّ المراجعة متمّمة إذا راجعت شيئًا من «مراجعتي»،":`تُعدّ المراجعة متمّمة إذا بلغت هدفك اليومي (${fmtH(state.goalH)} حزب)،`} ونصف الخانة يعني أنك بدأت دون أن تُتمّ: المراجعة دون بلوغ الهدف، أو قضاء الفوائت دون عدد اليوم كاملًا، أو المسبحة دون بلوغ عدد كل الأذكار. ${HUF()?"":"والخانة المخطّطة يوم لا حفظ فيه حسب خطتك، فلا تقطع السلسلة. "}العادات التي تضيفها بنفسك تُعلَّم بالضغط على الخانة.</p>
    <div class="seg-form" style="margin-top:6px"><input type="text" id="hNew" maxlength="40" placeholder="عادة جديدة، مثلًا: قيام الليل" style="flex:1;font:inherit;border:1px solid var(--line);border-radius:10px;padding:8px 10px;background:var(--card);color:var(--ink)"><button class="btn" id="hAdd">إضافة</button></div>
    <div style="font-weight:600;margin-top:16px;font-size:14px">آخر 30 يومًا</div>
    <div class="heat">${month.map(([d,k])=>`<div title="${d}: ${k} / ${hs.length}" style="background:${k?`color-mix(in srgb,var(--green) ${Math.round(18+k/hs.length*82)}%,transparent)`:"var(--line)"}"></div>`).join("")}</div>
    <div class="bars-l"><span>قبل شهر</span><span>اليوم</span></div>
  </div>`;
}

