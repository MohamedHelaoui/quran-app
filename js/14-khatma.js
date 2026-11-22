// ---- Khatma (reading plan by mushaf pages) ----
// first ayah starting on each page, from the Qalun line data
const PAGE_FIRST=(()=>{const a=Array(606).fill(null);for(let s=1;s<=114;s++){const l=LINES[s-1];for(let i=0;i<l.length/2;i++){const st=i===0?l[0]+(s===9?1:2):l[i*2];const pg=Math.floor(st/15)+1;if(!a[pg])a[pg]=[s,i+1];}}for(let p=1;p<=604;p++)if(!a[p])a[p]=a[p-1];return a;})();
const DUA_KHATM="اللَّهُمَّ ارْحَمْنِي بِالقُرْآنِ، وَاجْعَلْهُ لِي إِمَامًا وَنُورًا وَهُدًى وَرَحْمَةً، اللَّهُمَّ ذَكِّرْنِي مِنْهُ مَا نَسِيتُ، وَعَلِّمْنِي مِنْهُ مَا جَهِلْتُ، وَارْزُقْنِي تِلَاوَتَهُ آنَاءَ اللَّيْلِ وَأَطْرَافَ النَّهَارِ، وَاجْعَلْهُ لِي حُجَّةً يَا رَبَّ العَالَمِينَ.";
function duaHTML(){return `<div class="dua"><div class="ttl">دعاء ختم القرآن</div><div class="txt" style="font-family:Amiri,serif;font-size:22px;line-height:2.1">${DUA_KHATM}</div>
  <p class="help">لم يثبت عن النبي ﷺ دعاء مخصوص لختم القرآن، وهذا دعاء مأثور مشهور يُطبع في آخر كثير من المصاحف. وكان أنس بن مالك رضي الله عنه إذا ختم القرآن جمع أهله ودعا، فادعُ بما تيسّر لك.</p></div>`;}
function showDua(){
  let m=document.getElementById("duaModal"); if(m) m.remove();
  document.body.insertAdjacentHTML("beforeend",`<div id="duaModal" class="modal" role="dialog" aria-modal="true"><div class="modal-box"><div class="name" style="text-align:center;color:var(--green)">ختمت القرآن 🌿</div><p class="meta" style="text-align:center;margin-top:0">تقبّل الله منك</p>${duaHTML()}<div class="row-btns"><button class="btn" id="duaClose">آمين</button></div></div></div>`);
  m=document.getElementById("duaModal");
  document.getElementById("duaClose").onclick=()=>m.remove();
  m.onclick=e=>{if(e.target===m)m.remove();};
}
function fmtDate(d){try{const [y,m,dd]=d.split("-").map(Number);return new Date(y,m-1,dd).toLocaleDateString("ar-u-nu-latn",{day:"numeric",month:"long"});}catch(e){return d;}}
function pagesTxt(n){if(n===1)return "صفحة واحدة";if(n===2)return "صفحتان";if(n<=10)return n+" صفحات";return n+" صفحة";}
function khStatus(){
  const k=state.kh; if(!k) return null;
  const t=today(); const dayIdx=Math.max(0,diffDays(t,k.start)); const daysLeft=Math.max(1,k.days-dayIdx);
  const total=605-k.startPage; const readToday=k.log[t]||0;
  const posStartToday=k.pos-readToday; const remainingFromToday=605-posStartToday;
  const target=Math.max(1,Math.ceil(remainingFromToday/daysLeft));
  const todayEnd=Math.min(604,posStartToday+target-1);
  const doneToday=k.pos>todayEnd;
  const expected=k.startPage+Math.min(total,Math.ceil(total*(dayIdx+(doneToday?1:0))/k.days));
  return {k,dayIdx,daysLeft,total,readToday,posStartToday,target,todayEnd,diff:k.pos-expected,finished:k.pos>604,endDate:addDays(k.start,k.days-1)};
}
function pageLabel(p){const [s,a]=PAGE_FIRST[p];return "سورة "+SURAHS[s-1][0]+" "+a;}
function khRead(toPage){
  const k=state.kh; toPage=Math.round(Number(toPage));
  if(!(toPage>=k.pos-1&&toPage<=604)){toast("أدخل صفحة بين "+k.pos+" و604");return;}
  const n=toPage-k.pos+1; if(n<=0) return;
  const t=today(); const before=JSON.parse(JSON.stringify(k));
  k.log[t]=(k.log[t]||0)+n; k.pos=toPage+1;
  let msg="سُجّلت "+pagesTxt(n);
  if(k.pos>604){state.khDone.push(t);msg="ختمت القرآن، تقبّل الله منك 🌿";setTimeout(showDua,300);}
  save(); render(); toast(msg,false);
  document.getElementById("toast").insertAdjacentHTML("beforeend",`<button id="undoK">تراجع</button>`);
  document.getElementById("undoK").onclick=()=>{state.kh=before;if(k.pos>604)state.khDone.pop();save();render();hideToast();};
}
let khDays=30;
function renderKhatma(){
  const el=document.getElementById("v-khatma"); const st=khStatus();
  if(!st||st.finished){
    const fin=st&&st.finished;
    const presets=[[3,"3 أيام"],[7,"أسبوع"],[10,"10 أيام"],[15,"15 يومًا"],[30,"شهر"],[60,"شهران"]];
    const per=Math.ceil(604/khDays);
    el.innerHTML=`${fin?`<div class="card hifdh" style="text-align:center"><div class="name">ختمت القرآن 🌿</div><p class="meta">بدأتها في ${fmtDate(st.k.start)} وأتممتها في ${fmtDate(state.khDone[state.khDone.length-1]||today())}. تقبّل الله منك.</p><div style="text-align:right">${duaHTML()}</div></div>`:""}
      <div class="card"><div style="font-weight:600;margin-bottom:6px">${fin?"ختمة جديدة":"ابدأ ختمة"}</div>
      <p class="meta" style="margin-top:0">في كم يومًا تريد أن تختم؟</p>
      <div class="chips">${presets.map(([d,n])=>`<button class="chip ${khDays===d?"on":""}" data-khd="${d}">${n}</button>`).join("")}</div>
      <div class="setting"><label for="khDaysIn">عدد الأيام</label><input type="number" id="khDaysIn" min="1" max="3650" value="${khDays}"></div>
      <div class="setting"><label for="khStartIn">أبدأ من الصفحة</label><input type="number" id="khStartIn" min="1" max="604" value="1"></div>
      <div class="card" style="background:var(--green-soft);border:0;margin-top:12px;text-align:center"><div class="lbl">وردك اليومي</div><div class="big" id="khPer" style="font-size:34px">${pagesTxt(per)}</div><div class="meta" id="khPerH">≈ ${fmtH(per*60/604)} حزب يوميًا · تختم في ${fmtDate(addDays(today(),khDays-1))}</div></div>
      <div class="row-btns"><button class="btn" id="khStart">ابدأ الختمة</button></div></div>
      ${state.khDone.length?`<p class="meta" style="text-align:center">عدد الختمات المسجّلة: ${state.khDone.length}</p>`:""}`+twCardHTML();twBind();
    const upd=()=>{const d=Math.max(1,Math.round(Number(document.getElementById("khDaysIn").value)||30));const sp=Math.min(604,Math.max(1,Math.round(Number(document.getElementById("khStartIn").value)||1)));const per=Math.ceil((605-sp)/d);document.getElementById("khPer").textContent=pagesTxt(per);document.getElementById("khPerH").textContent="≈ "+fmtH(per*60/604)+" حزب يوميًا · تختم في "+fmtDate(addDays(today(),d-1));khDays=d;};
    document.getElementById("khDaysIn").oninput=upd; document.getElementById("khStartIn").oninput=upd;
    document.getElementById("khStart").onclick=()=>{upd();const sp=Math.min(604,Math.max(1,Math.round(Number(document.getElementById("khStartIn").value)||1)));state.kh={start:today(),days:khDays,startPage:sp,pos:sp,log:{}};save();renderKhatma();toast("بدأت الختمة، أعانك الله");};
    return;
  }
  const k=st.k; const done=k.pos-k.startPage; const pct=Math.round(done/st.total*100);
  const todayDone=k.pos>st.todayEnd;
  const status=st.diff>=0?(st.diff>0?`متقدّم بـ ${pagesTxt(st.diff)} 👍`:"في الموعد 👍"):`متأخر بـ ${pagesTxt(-st.diff)}، ووُزّعت على الأيام الباقية`;
  el.innerHTML=`<div class="card"><div class="hero" style="margin-bottom:6px"><div><div class="lbl">الختمة · اليوم ${st.dayIdx+1} من ${k.days}</div><div class="big" style="font-size:34px">${pct}%</div><div class="lbl">قرأت ${done} من ${st.total} صفحة · ${status}</div></div>
      <div style="text-align:left;white-space:nowrap;flex:none"><div class="lbl">تختم في</div><div style="font-weight:600">${fmtDate(st.endDate)}</div><div class="lbl">بقي ${daysTxt(st.daysLeft)}</div></div></div>
      <div class="progress"><i style="width:${pct}%"></i></div></div>
    <div class="card hifdh" style="margin-top:12px"><div class="lbl">ورد اليوم · ${pagesTxt(st.target)} (≈ ${fmtH(st.target*60/604)} حزب)</div>
      ${todayDone?`<div class="big" style="font-size:30px">أتممت ✓</div><p class="meta">قرأت اليوم ${pagesTxt(st.readToday)}. ورد الغد يبدأ من الصفحة ${k.pos} (${pageLabel(k.pos)}).</p>
        <div class="row-btns" style="justify-content:flex-start"><button class="btn ghost" data-khopen="${k.pos}">📖 أكمل القراءة</button></div>`
      :`<div class="name" style="font-size:24px">من الصفحة ${k.pos} إلى ${st.todayEnd}</div><div class="meta">من ${pageLabel(k.pos)} إلى نهاية الصفحة ${st.todayEnd}</div>
        <div class="row-btns" style="justify-content:flex-start"><button class="btn ghost" data-khopen="${k.pos}">📖 اقرأ في المصحف</button><button class="btn" id="khDone">قرأت ورد اليوم ✓</button></div>`}
      <div class="seg-form" style="margin-top:10px"><label class="meta">أو: قرأت حتى الصفحة <input type="number" id="khTo" min="${k.pos}" max="604" value="${Math.min(604,todayDone?k.pos:st.todayEnd)}"></label><button class="btn ghost" id="khToBtn">سجّل</button></div>
    </div>
    <div class="row-btns"><button class="linkbtn" id="khCancel" style="color:var(--red)">إلغاء الختمة</button></div>`+twCardHTML();twBind();
  const dn=document.getElementById("khDone"); if(dn) dn.onclick=()=>khRead(st.todayEnd);
  document.getElementById("khToBtn").onclick=()=>khRead(document.getElementById("khTo").value);
  const c=document.getElementById("khCancel"); c.onclick=()=>{if(c.dataset.confirm){state.kh=null;save();renderKhatma();}else{c.dataset.confirm="1";c.textContent="اضغط مرة أخرى لإلغاء الختمة";setTimeout(()=>{if(c.isConnected){delete c.dataset.confirm;c.textContent="إلغاء الختمة";}},3000);}};
}

// ---- Daily tafsir wird: one thematic section per day, in mushaf order ----
let TWS=null, twTab="j", twStartSur=1;
// thematic sections, with any uncovered ayat filled in as their own small sections
function twSecs(){
  if(TWS) return TWS; if(!THM||!Q) return null; const out=[];
  for(let sn=1;sn<=114;sn++){const n=Q.t[sn-1].length;const L=THM.secs.filter(x=>x.s===sn);let a=1;
    for(const x of L){if(x.from>a)out.push({s:sn,from:a,to:x.from-1,t:""});out.push(x);a=x.to+1;}
    if(a<=n)out.push({s:sn,from:a,to:n,t:""});}
  return TWS=out;
}
function twTafsir(sec){
  const d=TF.get(sec.s); tfLoad(sec.s);
  if(d==="loading"||d===undefined) return `<p class="help">جارٍ تحميل التفسير…</p>`;
  if(d===null) return `<p class="help">تعذّر تحميل التفسير، ويحتاج اتصالًا بالإنترنت في المرة الأولى.</p>`;
  let h="";
  for(let a=sec.from;a<=sec.to;a++){
    const r=d[String(a)]||{}; let txt=r[twTab], note="";
    if(!txt&&twTab==="j"&&r.jp){if(r.jp>=sec.from)txt="";else if(d[String(r.jp)]&&d[String(r.jp)].j){txt=d[String(r.jp)].j;note=`<p class="tf-note">مع تفسير الآية ${r.jp}.</p>`;}}
    h+=`<div class="tw-aya"><div class="tw-q">${esc(Q.t[sec.s-1][a-1])}</div>${txt?note+`<div class="tf-txt tw-t">${tfFmt(txt)}</div>`:""}</div>`;
  }
  return h;
}
function twCardHTML(){
  const tw=state.tw; loadThemes(); if(!Q){loadQ().then(()=>{if(view==="khatma")renderKhatma();}).catch(()=>{});}
  const S=twSecs();
  if(!S) return `<div class="card tw" style="margin-top:16px"><div style="font-weight:600">📖 ورد التفسير</div><p class="help">جارٍ التحميل…</p></div>`;
  if(!tw) return `<div class="card tw" style="margin-top:16px"><div style="font-weight:600">📖 ورد التفسير</div>
    <p class="meta" style="margin-top:4px">كل يوم موضوع واحد من مواضيع القرآن، بالتقسيم نفسه الذي في ألوان المصحف، مع الجلالين ومعاني المفردات والإعراب. ${S.length} موضوعًا.</p>
    <div class="setting"><label for="twSur">أبدأ من سورة</label><select id="twSur">${SURAHS.map((x,i)=>`<option value="${i+1}" ${twStartSur===i+1?"selected":""}>${i+1}. ${esc(x[0])}</option>`).join("")}</select></div>
    <div class="row-btns"><button class="btn" id="twStart">ابدأ ورد التفسير</button></div></div>`;
  if(tw.i>=S.length) return `<div class="card tw hifdh" style="margin-top:16px;text-align:center"><div class="name">أتممت تفسير القرآن 🌿</div><p class="meta">${tw.n} موضوعًا منذ ${fmtDate(tw.start)}. تقبّل الله منك.</p><div class="row-btns" style="justify-content:center"><button class="btn ghost" id="twReset">ابدأ من جديد</button></div></div>`;
  const doneToday=tw.last===today(); const sec=S[tw.i]; const pct=Math.round(tw.i/S.length*100);
  const tabs=[["j","الجلالين"],["m","معاني المفردات"],["i","إعراب"]];
  return `<div class="card tw" style="margin-top:16px">
    <div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px"><div style="font-weight:600">📖 ورد التفسير</div><div class="lbl">${tw.i+1} من ${S.length} · ${pct}%</div></div>
    <div class="progress" style="margin:6px 0 10px"><i style="width:${pct}%"></i></div>
    ${doneToday?`<p class="meta" style="margin:0 0 8px">✓ قرأت ورد اليوم. هذا موضوع الغد إن أردت أن تتقدّم:</p>`:""}
    <div class="name" style="font-size:20px">${esc(sec.t||"تتمة "+SURAHS[sec.s-1][0])}</div>
    <div class="meta">${esc(SURAHS[sec.s-1][0])} ${sec.from===sec.to?sec.from:`<span dir="ltr">${sec.from}–${sec.to}</span>`}</div>
    <div class="seg-ctl" role="group" aria-label="التفسير" style="display:flex;margin:10px 0 6px">${tabs.map(([k,n])=>`<button data-twtab="${k}" class="${twTab===k?"on":""}" style="flex:1">${n}</button>`).join("")}</div>
    <div class="tw-body">${twTafsir(sec)}</div>
    <div class="row-btns" style="justify-content:flex-start"><button class="btn" id="twDone">${doneToday?"قرأته أيضًا ✓":"قرأت ورد اليوم ✓"}</button><button class="btn ghost" data-twopen="1">في المصحف</button>${tw.i?`<button class="linkbtn sm" id="twBack">↶ الموضوع السابق</button>`:""}</div>
    <div class="row-btns"><button class="linkbtn sm" id="twReset" style="color:var(--red)">إيقاف ورد التفسير</button></div></div>`;
}
function twBind(){
  const g=id=>document.getElementById(id);
  if(g("twSur")) g("twSur").onchange=e=>{twStartSur=Number(e.target.value);};
  if(g("twStart")) g("twStart").onclick=()=>{const S=twSecs();const i=Math.max(0,S.findIndex(x=>x.s>=twStartSur));state.tw={start:today(),i,n:0,last:"",log:{}};save();renderKhatma();toast("بدأ ورد التفسير، يسّره الله");};
  if(g("twDone")) g("twDone").onclick=()=>{const tw=state.tw;tw.i++;tw.n=(tw.n||0)+1;tw.last=today();tw.log=tw.log||{};tw.log[today()]=(tw.log[today()]||0)+1;save();renderKhatma();const c=document.querySelector(".tw");if(c)c.scrollIntoView({block:"start"});};
  if(g("twBack")) g("twBack").onclick=()=>{const tw=state.tw;tw.i=Math.max(0,tw.i-1);save();renderKhatma();};
  const r=g("twReset"); if(r) r.onclick=()=>{if(r.dataset.confirm||!state.tw||state.tw.i>=(twSecs()||[]).length){state.tw=null;save();renderKhatma();}else{r.dataset.confirm="1";r.textContent="اضغط مرة أخرى للإيقاف";setTimeout(()=>{if(r.isConnected){delete r.dataset.confirm;r.textContent="إيقاف ورد التفسير";}},3000);}};
  document.querySelectorAll("[data-twtab]").forEach(b=>b.onclick=()=>{twTab=b.dataset.twtab;renderKhatma();});
  const o=document.querySelector("[data-twopen]"); if(o) o.onclick=()=>{const sec=twSecs()[state.tw.i];openMushaf(sec.s,sec.from,sec.to);};
}

