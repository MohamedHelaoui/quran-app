// ---- «مراجعتي» (huffaz mode) ----
function revOk(d){return HUF()?(state.log[d]||0)>0:(state.rH[d]||0)>=state.goalH*0.9;}
function rvHas(k,n){return state.rv.some(x=>x.k===k&&x.n===n);}
function rvAdd(k,n){if(rvHas(k,n)){toast("موجودة في مراجعتي من قبل");return;}state.rv.push({k,n});save();render();toast((k==="p"?"صفحة "+n:unitName({k,n}))+" أُضيفت إلى مراجعتي");}
function rvPageRange(p){if(!PAGE_IDX)return null;const l=PAGE_IDX[p];if(!l||!l.length)return null;return {f:l[0],t:l[l.length-1]};}
function rvTitle(x){if(x.k==="r")return "من صفحة "+x.n+" إلى صفحة "+x.e;if(x.k!=="p")return unitName(x);return "صفحة "+x.n;}
function rvSub(x){if(x.k==="g"){const [a,b]=unitSur(x);let h=0;for(let n=a;n<=b;n++)h+=HIZB[n-1];return "من سورة "+SURAHS[a-1][0]+" إلى سورة "+SURAHS[b-1][0]+" · "+fmtH(h)+" حزب";}if(x.k==="s")return SURAHS[x.n-1][1]+" آية · "+fmtH(HIZB[x.n-1])+" حزب";const r=rvPageRange(x.n),r2=x.k==="r"?rvPageRange(x.e):r;if(!r||!r2)return "";const [s1,a1]=r.f,[s2,a2]=r2.t;if(x.k==="r")return pagesTxt(x.e-x.n+1)+" · سورة "+SURAHS[s1-1][0]+" "+a1+" – "+(s1===s2?"":"سورة "+SURAHS[s2-1][0]+" ")+a2;return s1===s2?"سورة "+SURAHS[s1-1][0]+" "+a1+"–"+a2:"سورة "+SURAHS[s1-1][0]+" "+a1+" – سورة "+SURAHS[s2-1][0]+" "+a2;}
function rvSize(x){if(x.k==="p")return 60/604;if(x.k==="r")return (x.e-x.n+1)*60/604;const [a,b]=unitSur(x);let h=0;for(let n=a;n<=b;n++)h+=HIZB[n-1];return h;}
function rvMistKeys(x){if(x.k!=="p"&&x.k!=="r")return unitKeys(x);if(!PAGE_IDX)return [];const o=[];for(let p=x.n;p<=(x.k==="r"?x.e:x.n);p++)PAGE_IDX[p].forEach(([s0,a])=>{const k=s0+":"+a;if(state.mistakes[k])o.push(k);});return o;}
function rvToggle(i){const x=state.rv[i];if(!x)return;const t=today();
  if(x.d===t){delete x.d;state.log[t]=Math.max(0,(state.log[t]||0)-1);if(!state.log[t])delete state.log[t];state.rH[t]=Math.max(0,(state.rH[t]||0)-rvSize(x));if(state.rH[t]<0.001)delete state.rH[t];}
  else {x.d=t;state.log[t]=(state.log[t]||0)+1;state.rH[t]=(state.rH[t]||0)+rvSize(x);pruneLog();}
  save();render();}
function rvDaysAgo(x){if(!x.d)return "لم تُراجع بعد";const k=diffDays(today(),x.d);return k===0?"راجعتها اليوم ✓":k===1?"آخر مراجعة: أمس":"آخر مراجعة: قبل "+daysTxt(k);}
function renderMyRev(){
  const el=document.getElementById("v-today"); const L=state.rv; const t=today();
  if(!PAGE_IDX&&L.some(x=>x.k==="p"||x.k==="r")){loadQ().then(()=>{if(view==="today")render();}).catch(()=>{});}
  const done=L.filter(x=>x.d===t).length;
  el.innerHTML=`<h2 class="page-t">مراجعتي</h2>
    ${L.length?`<p class="meta" style="margin:-6px 0 10px">${L.length===1?"عنصر واحد":L.length===2?"عنصران":L.length<=10?L.length+" عناصر":L.length+" عنصرًا"} · راجعت اليوم ${done} · رتّبها كما تريد بالأسهم</p>`:`<div class="card empty"><p class="meta">أضف ما تريد مراجعته: سورة كاملة أو صفحة. من هنا، أو من المصحف بزرّي «＋ الصفحة» و«＋ السورة».</p></div>`}
    ${L.map((x,i)=>{const ks=rvMistKeys(x);const dn=x.d===t;
      return `<div class="item rv${dn?" rv-done":""}"><div class="top"><div class="num">${x.k==="p"||x.k==="r"?"ص":unitNum(x)}</div>
        <div class="grow"><div class="name">${rvTitle(x)}</div><div class="meta">${esc(rvSub(x))}</div><div class="meta">${rvDaysAgo(x)}</div></div>
        <div class="rv-ord"><button data-rvup="${i}" ${i===0?"disabled":""} aria-label="إلى الأعلى">▲</button><button data-rvdn="${i}" ${i===L.length-1?"disabled":""} aria-label="إلى الأسفل">▼</button></div></div>
        ${ks.length?mistBtnHTML("r"+x.k+x.n,ks):""}
        <div class="links"><button class="linkbtn" data-rvopen="${i}">📖 افتح في المصحف</button><button class="linkbtn" data-rvdel="${i}" style="color:var(--red)">✕ إزالة</button></div>
        <button class="btn${dn?" ghost":""} rv-chk" data-rvchk="${i}">${dn?"✓ راجعتها اليوم":"راجعتها"}</button></div>`;}).join("")}
    <div class="card" style="margin-top:14px"><div style="font-weight:600">إضافة</div>
      <div class="seg-form" style="margin-top:8px"><select id="rvS" style="font:inherit;border:1px solid var(--line);border-radius:10px;padding:6px;background:var(--card);color:var(--ink);flex:1">${unitList().map(u=>`<option value="${u.k}${u.n}">${u.k==="s"?u.n+". "+SURAHS[u.n-1][0]:unitName(u)}</option>`).join("")}</select><button class="btn" id="rvSAdd">＋ أضف</button></div>
      <div class="seg-form" style="margin-top:8px"><label class="meta">من صفحة <input type="number" id="rvP" min="1" max="604" placeholder="50"></label><label class="meta">إلى صفحة <input type="number" id="rvP2" min="1" max="604" placeholder="اختياري"></label><button class="btn" id="rvPAdd">＋ أضف</button></div></div>`;
  document.getElementById("rvSAdd").onclick=()=>{const v=document.getElementById("rvS").value;rvAdd(v[0],Number(v.slice(1)));};
  document.getElementById("rvPAdd").onclick=()=>{const p=Math.round(Number(document.getElementById("rvP").value));const v2=document.getElementById("rvP2").value;const q=v2===""?p:Math.round(Number(v2));
    if(!(p>=1&&p<=604)||!(q>=1&&q<=604)){toast("أدخل رقم صفحة بين 1 و604");return;}
    const a=Math.min(p,q),b=Math.max(p,q); if(a===b){rvAdd("p",a);return;}
    if(state.rv.some(x=>x.k==="r"&&x.n===a&&x.e===b)){toast("موجودة في مراجعتي من قبل");return;}
    state.rv.push({k:"r",n:a,e:b});save();render();toast("من صفحة "+a+" إلى صفحة "+b+" أُضيفت إلى مراجعتي");};
}
function rvMushafHTML(){
  if(!PAGE_IDX||!PAGE_IDX[mPage]||!PAGE_IDX[mPage].length) return "";
  const sn=mSel?mSel.s:PAGE_IDX[mPage][0][0];
  const u=unitOf(sn); const hp=rvHas("p",mPage), hs=rvHas(u.k,u.n);
  return `<div class="chips rv-add"><span class="meta">مراجعتي:</span><button class="chip${hp?" on":""}" data-rvaddp="${mPage}">${hp?"✓":"＋"} الصفحة ${mPage}</button><button class="chip${hs?" on":""}" data-rvadds="${u.k}${u.n}">${hs?"✓":"＋"} ${unitName(u)}</button></div>`;
}
document.addEventListener("click",e=>{const t=e.target.closest&&e.target.closest("[data-rvup],[data-rvdn],[data-rvopen],[data-rvdel],[data-rvchk],[data-rvaddp],[data-rvadds]");if(!t)return;const d=t.dataset;
  if(d.rvaddp){const p=Number(d.rvaddp);if(rvHas("p",p)){state.rv=state.rv.filter(x=>!(x.k==="p"&&x.n===p));save();renderMushaf();toast("أُزيلت من مراجعتي");}else{state.rv.push({k:"p",n:p});save();renderMushaf();toast("صفحة "+p+" أُضيفت إلى مراجعتي");}return;}
  if(d.rvadds){const k=d.rvadds[0],n=Number(d.rvadds.slice(1));if(rvHas(k,n)){state.rv=state.rv.filter(x=>!(x.k===k&&x.n===n));save();renderMushaf();toast("أُزيلت من مراجعتي");}else{state.rv.push({k,n});save();renderMushaf();toast(unitName({k,n})+" أُضيفت إلى مراجعتي");}return;}
  const i=Number(d.rvup??d.rvdn??d.rvopen??d.rvdel??d.rvchk); const L=state.rv; if(!L[i])return;
  if(d.rvup!==undefined&&i>0){[L[i-1],L[i]]=[L[i],L[i-1]];save();render();}
  else if(d.rvdn!==undefined&&i<L.length-1){[L[i+1],L[i]]=[L[i],L[i+1]];save();render();}
  else if(d.rvchk!==undefined){rvToggle(i);}
  else if(d.rvopen!==undefined){const x=L[i];if(x.k==="s")openMushaf(x.n,1,SURAHS[x.n-1][1]);else if(x.k==="g"){const a=unitSur(x)[0];openMushaf(a,1,SURAHS[a-1][1]);}else loadQ().then(()=>{mPage=x.n;mHi=null;mSel=null;clearRev();setView("mushaf");window.scrollTo(0,0);}).catch(()=>toast("تعذّر تحميل المصحف"));}
  else if(d.rvdel!==undefined){if(t.dataset.confirm){const x=L.splice(i,1)[0];save();render();toast(rvTitle(x)+" أُزيلت من مراجعتي");}else{t.dataset.confirm="1";t.textContent="✕ إزالة؟ اضغط مرة أخرى";setTimeout(()=>{if(t.isConnected){delete t.dataset.confirm;t.textContent="✕ إزالة";}},3000);}}
});
// today's summary at the top of the stats tab (huffaz mode has no «اليوم» tab)
let focOpen=false, topOpen=false;
// huffaz mode: surahs needing attention and most-missed ayat, folded until opened
function hufTailHTML(){
  const per={}; for(const [k,v] of Object.entries(state.mistakes)){const u=unitOf(Number(k.split(":")[0]));const id=u.k+u.n;per[id]=(per[id]||0)+(v.c||0);}
  const sur=Object.entries(per).map(([id,c])=>[{k:id[0],n:Number(id.slice(1))},c]).sort((x,y)=>y[1]-x[1]||(x[0].k+x[0].n).localeCompare(y[0].k+y[0].n));
  const top=Object.entries(state.mistakes).sort((x,y)=>y[1].c-x[1].c).slice(0,12).map(([k])=>k);
  return `<details class="card" style="margin-bottom:10px" id="focDet" ${focOpen?"open":""}><summary style="font-weight:600;cursor:pointer">سور تحتاج تركيزًا${sur.length?" ("+sur.length+")":""}</summary>
    ${sur.length?`<div class="list">${sur.map(([u,c])=>{const ks=unitKeys(u);const k="w"+u.k+u.n;const o=mOpen.has(k);
      return `<div class="s" style="cursor:default"><div class="num">${unitNum(u)}</div><div class="grow"><div class="name">${unitShort(u)}</div><div class="meta">أخطأت فيها ${errTxt(c)}${rvHas(u.k,u.n)?" · في مراجعتي":""}</div></div><button class="mx-btn${o?" on":""}" data-mtog="${k}">⚠️ الأخطاء (${ks.length}) ${o?"▴":"▾"}</button></div>${o?mistListHTML(ks,u.k==="g"):""}`;}).join("")}</div>`:`<p class="meta">لا أخطاء مسجّلة بعد 👍</p>`}</details>
  <details class="card" style="margin-bottom:10px" id="topDet" ${topOpen?"open":""}><summary style="font-weight:600;cursor:pointer">آيات أخطأت فيها أكثر</summary>
    ${top.length?(topOpen?mistListHTML(top,true):""):`<p class="meta">لم تسجّل أي خطأ بعد. في المصحف، اضغط على الآية التي أخطأت فيها.</p>`}</details>`;
}
// the day's goals in the stats tab: built-in ones (some on by default) and the person's own habits; each can be shown or hidden
const TG_BUILTIN=[["rv","مراجعتي",1],["msh","مراجعة المتشابهات",1],["kh","ورد الختمة",1],["qada","قضاء الفوائت",1],["sabah","أذكار الصباح",1],["masa","أذكار المساء",1],["nawm","أذكار النوم",0],["tsb","المسبحة",0]];
function tgOn(id){const b=TG_BUILTIN.find(x=>x[0]===id);const def=b?!!b[2]:true;return def?!state.tg.hide.includes(id):state.tg.show.includes(id);}
function tgSet(id,on){const b=TG_BUILTIN.find(x=>x[0]===id);const def=b?!!b[2]:true;state.tg.hide=state.tg.hide.filter(x=>x!==id);state.tg.show=state.tg.show.filter(x=>x!==id);if(on!==def)(on?state.tg.show:state.tg.hide).push(id);save();}
let tgEdit=false;
function tgEditHTML(){
  if(!tgEdit) return `<div style="text-align:left;margin:-4px 0 10px"><button class="linkbtn sm" id="tgOpen">✎ تعديل أهداف اليوم</button></div>`;
  const all=TG_BUILTIN.map(x=>({id:x[0],n:x[1]})).concat(state.habits.map(h=>({id:h.id,n:h.n,own:true})));
  return `<div class="card" style="margin:-4px 0 10px"><div style="display:flex;justify-content:space-between;align-items:center"><b>أهداف اليوم</b><button class="linkbtn sm" id="tgClose">تمّ</button></div>
    ${all.map(g=>`<label class="setting" style="cursor:pointer"><span>${esc(g.n)}${g.own?' <span class="meta">(من عندك)</span>':""}</span><input type="checkbox" data-tgid="${esc(g.id)}" ${tgOn(g.id)?"checked":""} style="width:22px;height:22px;flex:none"></label>`).join("")}
    <p class="help">بعض الأهداف لا تظهر إلا عند الحاجة: المتشابهات إن كان فيها شيء مستحق، والختمة إن بدأتها، والقضاء إن ضبطته.</p>
    <div class="seg-form" style="margin-top:6px"><input type="text" id="tgNew" maxlength="40" placeholder="هدف جديد، مثلًا: قيام الليل" style="flex:1;font:inherit;border:1px solid var(--line);border-radius:10px;padding:8px 10px;background:var(--card);color:var(--ink)"><button class="btn" id="tgAdd">إضافة</button></div></div>`;
}
document.addEventListener("click",e=>{const t=e.target;if(!t||!t.id)return;
  if(t.id==="tgOpen"){tgEdit=true;renderStats();}
  else if(t.id==="tgClose"){tgEdit=false;renderStats();}
  else if(t.id==="tgAdd"){const i=document.getElementById("tgNew");const v=(i.value||"").trim();if(!v)return;const id="h"+Date.now().toString(36);state.habits.push({id,n:v.slice(0,40)});save();renderStats();toast("أُضيف الهدف: "+v);}
});
document.addEventListener("change",e=>{const t=e.target;if(t&&t.dataset&&t.dataset.tgid){tgSet(t.dataset.tgid,t.checked);renderStats();}});
document.addEventListener("keydown",e=>{if(e.key==="Enter"&&e.target&&e.target.id==="tgNew"){const b=document.getElementById("tgAdd");if(b)b.click();}});
function todaySummaryHTML(){
  const t=today(); const tasks=[]; const L=state.rv;
  if(tgOn("rv")&&L.length){const dn=L.filter(x=>x.d===t).length;tasks.push({n:"مراجعتي",ok:dn>0,v:dn+" / "+L.length,act:'data-go="today"'});}
  if(tgOn("msh")){const dg=dueGroups().length; if(dg) tasks.push({n:"مراجعة المتشابهات",ok:false,v:dg===1?"مجموعة واحدة":dg+" مجموعات",act:'data-mqstart="due"'}); else if(state.mlog&&state.mlog[t]) tasks.push({n:"مراجعة المتشابهات",ok:true,v:"تمّت",act:'data-mqstart="all"'});}
  const khS=khStatus(); if(tgOn("kh")&&khS&&!khS.finished) tasks.push({n:"ورد الختمة",ok:khS.k.pos>khS.todayEnd,v:khS.k.pos>khS.todayEnd?"تمّ":"ص "+khS.k.pos+"–"+khS.todayEnd,act:'data-go="khatma"'});
  const qt=qadaToday(); if(tgOn("qada")&&qt&&qadaLeftTotal()+qt.dT>0&&qt.qT) tasks.push({n:"قضاء الفوائت",ok:qt.ok,v:qt.dT+" / "+qt.qT,act:'data-go="qada"'});
  ["sabah","masa","nawm"].filter(tgOn).forEach(k=>{const c=ADHKAR.find(x=>x.k===k);if(!c)return;const ok=(state.adhLog[t]||[]).includes(k);tasks.push({n:c.n,ok,v:ok?"تمّت":"",act:`data-goadh="${k}"`});});
  if(tgOn("tsb")){const st=tsbDayState(t);tasks.push({n:"المسبحة",ok:st===2,v:st===2?"تمّت":st===1?"بدأت":"",act:'data-goadh="tasbih"'});}
  state.habits.filter(h=>tgOn(h.id)).forEach(h=>{const ok=(state.hdone[t]||[]).includes(h.id);tasks.push({n:h.n,ok,v:ok?"تمّ":"",act:`data-htog="${esc(h.id)}" data-hd="${t}"`});});
  const okN=tasks.filter(x=>x.ok).length; const pr=tasks.length?okN/tasks.length:1;
  const hijri=(()=>{try{return new Date().toLocaleDateString("ar-u-ca-islamic-umalqura-nu-latn",{weekday:"long",day:"numeric",month:"long"});}catch(e){return "";}})();
  return `<div class="card daybox-card"><p class="daytitle">${hijri}</p><div class="daybox">
      <div class="star" role="img" aria-label="أتممت ${okN} من ${tasks.length}"><svg viewBox="0 0 100 100"><defs><clipPath id="starClip"><rect x="0" y="${100-Math.round(pr*100)}" width="100" height="100"/></clipPath>
        <path id="octa" d="M50 4 L63 18 L82 18 L82 37 L96 50 L82 63 L82 82 L63 82 L50 96 L37 82 L18 82 L18 63 L4 50 L18 37 L18 18 L37 18 Z"/></defs>
        <use href="#octa" fill="var(--indigo-soft)"/><use href="#octa" fill="var(--gold-leaf)" clip-path="url(#starClip)"/>
        <use href="#octa" class="st-o" fill="none" stroke="var(--indigo-2)" stroke-width="2"/><rect x="29" y="29" width="42" height="42" fill="none" stroke="var(--indigo-2)" stroke-opacity=".25" transform="rotate(45 50 50)"/></svg>
        <div class="pct">${okN}/${tasks.length}</div></div>
      <ul class="tasks">${tasks.map(x=>`<li class="${x.ok?"ok":""}"><button ${x.act}><span class="dot">${x.ok?"✓":""}</span><span class="t">${x.n}</span><span class="v">${x.v}</span></button></li>`).join("")}</ul>
    </div></div>`;
}

