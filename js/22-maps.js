// ---- Surah maps (review mode for huffaz): the surah's aim, its main axes and its sections, to help recall ----
let MAPS=null, mapsLoading=null, mapQuiz=false, mapShown=new Set();
let mapSur=(()=>{try{return Number(localStorage.getItem("quran-map-s"))||0;}catch(e){return 0;}})();
function loadMaps(){
  if(MAPS||mapsLoading) return mapsLoading||Promise.resolve();
  mapsLoading=fetch("maps.json").then(r=>{if(!r.ok)throw new Error("http");return r.json();}).then(d=>{MAPS=d;}).catch(()=>{MAPS={s:{}};});
  return mapsLoading;
}
function openMap(sn){mapSur=sn;try{localStorage.setItem("quran-map-s",String(sn));}catch(e){}mapShown.clear();setView("maps");}
// first words of an ayah (Qalun text), as a cue for where a section starts
function mapStart(sn,a){
  if(!Q) return "";
  const w=ayaParts(Q.t[sn-1][a-1]).words.filter(x=>!/^[۞۩]$/.test(x));
  return w.slice(0,3).join(" ");
}
function renderMaps(){
  const el=document.getElementById("v-maps");
  if(!mapSur) mapSur=(typeof PAGE_IDX!=="undefined"&&PAGE_IDX&&PAGE_IDX[mPage]&&PAGE_IDX[mPage][0])?PAGE_IDX[mPage][0][0]:46;
  if(!MAPS||!THM||!Q){
    el.innerHTML=`<p class="help">جارٍ التحميل…</p>`;
    Promise.all([loadMaps(),loadThemes(),loadQ()]).then(()=>{if(view==="maps")renderMaps();}).catch(()=>{});
    return;
  }
  const sn=mapSur, M=MAPS.s[sn]||null;
  // a curated map may redefine the sections (split a long one, or cover ayat the themes miss)
  const secs=M&&M.secs?M.secs.map(([f,t,ti],i)=>({s:sn,from:f,to:t,t:ti,k:"c"+i})):THM.secs.filter(x=>x.s===sn);
  const opts=SURAHS.map((x,i)=>`<option value="${i+1}" ${i+1===sn?"selected":""}>${i+1}. ${x[0]}${MAPS.s[i+1]?" ★":""}</option>`).join("");
  const hid=k=>mapQuiz&&!mapShown.has(k);
  const node=x=>{
    const key=M&&M.keys&&M.keys[x.from], h=hid("s"+x.k);
    return `<div class="mp-node ${h?"mp-hid":""}" data-mpshow="s${x.k}">
      <div class="mp-rng">${x.from===x.to?x.from:x.from+"–"+x.to}</div>
      <div class="mp-body">
        ${h?`<div class="mp-q">ما موضوع هذا المقطع؟ وبمَ يبدأ؟ <span class="meta">(اضغط للإظهار)</span></div>`:`
        ${key?`<div class="mp-key">${esc(key)}</div>`:""}
        <div class="${key?"mp-tt":"mp-key"}">${esc(x.t)}</div>
        <div class="mp-st">يبدأ: <span class="mp-ar">${esc(mapStart(sn,x.from))}…</span></div>`}
      </div>
      <button class="mp-go" data-mpgo="${x.from}:${x.to}" aria-label="افتح في المصحف" title="افتح في المصحف">📖</button>
    </div>`;
  };
  let body;
  if(M&&M.mahawir){
    body=M.mahawir.map((m,i)=>{const ss=secs.filter(x=>x.from>=m.from&&x.from<=m.to);const h=hid("m"+i);
      return `<div class="mp-mh mp-c${i%6}">
        <div class="mp-mhh" data-mpshow="m${i}"><span class="mp-n">${i+1}</span><div><b>${h?"المحور "+(i+1):esc(m.t)}</b> <span class="meta">الآيات ${m.from===m.to?m.from:m.from+"–"+m.to}</span>${h?"":`<div class="mp-d">${esc(m.d)}</div>`}</div></div>
        <div class="mp-line">${ss.map(node).join("")}</div>
      </div>`;}).join("");
  } else {
    body=secs.length?`<div class="mp-mh mp-c0"><div class="mp-line">${secs.map(node).join("")}</div></div>`:`<p class="help">لا توجد مقاطع لهذه السورة.</p>`;
  }
  const chain=M&&M.mahawir?M.mahawir.map(m=>esc(m.t.split(":")[0])):[];
  el.innerHTML=`<div class="mp-bar">
      <select id="mpSura" aria-label="السورة">${opts}</select>
      <button class="btn ${mapQuiz?"":"ghost"} sm" id="mpQuiz">${mapQuiz?"✓ اختبرني":"🙈 اختبرني"}</button>
      <button class="btn ghost sm" id="mpMushaf">📖 المصحف</button>
    </div>
    <h2 class="mp-title">سورة ${SURAHS[sn-1][0]} <span class="meta">${SURAHS[sn-1][1]} آية</span></h2>
    ${(MAPS.groups||[]).filter(g=>g.s.includes(sn)).map(g=>{const lg=g.s.length>10;const bs=g.s.map((x,i)=>`<button class="mp-gs ${x===sn?"on":""}" data-mpsur="${x}">${lg?x:i+1}. ${SURAHS[x-1][0]}</button>`).join("");
      return lg?`<div class="mp-grp mp-long"><span class="meta">${esc(g.t)}:</span><div class="mp-gsc">${bs}</div></div>`:`<div class="mp-grp"><span class="meta">${esc(g.t)}:</span>${bs}</div>`;}).join("")}
    ${M?`<div class="mp-maqsad ${hid("q")?"mp-hid":""}" data-mpshow="q"><div class="mp-lbl">مقصد السورة</div>${hid("q")?`<div class="mp-q">ما مقصد السورة في جملة؟ <span class="meta">(اضغط للإظهار)</span></div>`:`<div>${esc(M.maqsad)}</div>`}</div>`
       :`<div class="mp-maqsad mp-none"><div class="mp-lbl">مقصد السورة</div><div class="meta">لم يُضَف مقصد هذه السورة بعد؛ هذه مقاطعها من مواضيع التطبيق.</div></div>`}
    ${chain.length>1&&!mapQuiz?`<div class="mp-chain">${chain.map(c=>`<span>${c}</span>`).join(`<i>←</i>`)}</div>`:""}
    ${mapQuiz?`<p class="help">حاول أن تستحضر كل محور ومقطع قبل أن تضغط عليه.</p>`:""}
    ${body}
    ${M&&M.aghrad?`<details class="mp-agh"><summary>أغراض السورة (ملخّص من ابن عاشور)</summary><ul>${M.aghrad.map(a=>`<li>${esc(a)}</li>`).join("")}</ul>${M.note?`<p class="meta">${esc(M.note)}</p>`:""}${M.count?`<p class="meta">${esc(M.count)}</p>`:""}</details>`:""}
    <p class="help mp-src">${M?esc(MAPS.src||""):""}</p>`;
  document.getElementById("mpSura").onchange=e=>openMap(Number(e.target.value));
  document.getElementById("mpQuiz").onclick=()=>{mapQuiz=!mapQuiz;mapShown.clear();renderMaps();};
  document.getElementById("mpMushaf").onclick=()=>openMushaf(sn,1,1);
  el.querySelectorAll(".mp-gsc").forEach(c=>{const on=c.querySelector(".mp-gs.on");if(on)c.scrollLeft+=on.getBoundingClientRect().left-c.getBoundingClientRect().left-(c.clientWidth-on.offsetWidth)/2;});
  el.querySelectorAll("[data-mpsur]").forEach(b=>b.onclick=()=>{openMap(Number(b.dataset.mpsur));window.scrollTo(0,0);});
  el.querySelectorAll("[data-mpgo]").forEach(b=>b.onclick=e=>{e.stopPropagation();const [f,t]=b.dataset.mpgo.split(":").map(Number);openMushaf(sn,f,t);});
  el.querySelectorAll("[data-mpshow]").forEach(b=>b.onclick=()=>{if(!mapQuiz)return;const k=b.dataset.mpshow;if(mapShown.has(k))mapShown.delete(k);else mapShown.add(k);renderMaps();});
}
