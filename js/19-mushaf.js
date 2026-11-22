let Q=null, qLoading=null, PAGE_IDX=null, mPage=1, mHi=null, mMode=0, revealed=new Map(), revSeg=new Map(), mScroll=false, mUnit="aya", linkFrom=null, linkTo=null, selAnchor=null, noteEdit=false;
function loadQ(){
  if(Q) return Promise.resolve(Q);
  if(!qLoading) qLoading=fetch("qaloon.json").then(r=>{if(!r.ok)throw new Error("http");return r.json();}).then(d=>{
    Q=d; PAGE_IDX=Array.from({length:605},()=>[]);
    d.p.forEach((arr,si)=>arr.forEach((pg,ai)=>PAGE_IDX[pg].push([si+1,ai+1])));
    loadThemes();
    return d;
  }).catch(e=>{qLoading=null;throw e;});
  return qLoading;
}
function setView(v){const changed=view!==v;view=v;document.querySelectorAll(".tabbar button").forEach(x=>x.classList.toggle("on",x.dataset.v===v));document.querySelectorAll(".icon-btn[data-go=settings]").forEach(x=>x.classList.toggle("on",v==="settings"));render();if(changed)window.scrollTo(0,0);}
function openMushaf(sn,from,to){
  loadQ().then(()=>{mPage=Q.p[sn-1][from-1];mHi={s:sn,from,to};clearRev();mScroll=true;setView("mushaf");window.scrollTo(0,0);})
  .catch(()=>toast("تعذّر تحميل المصحف"));
}
function goLoc(loc){loadQ().then(()=>{mPage=Q.p[loc.s-1][loc.a-1];mHi=null;mSel=loc;noteEdit=false;clearRev();mScroll=true;setView("mushaf");}).catch(()=>toast("تعذّر تحميل المصحف"));}
function goPage(pg){pg=Math.min(604,Math.max(1,Math.round(Number(pg)||1)));if(pg!==mPage){mPage=pg;clearRev();mSel=null;selAnchor=null;}renderMushaf();}
function clearRev(){revealed.clear();revSeg.clear();}
// Review-only mode + hide view: an ayah is revealed one phrase at a time, each phrase ending at a waqf sign (U+06D6) or at the end of the ayah
function segMode(){return mMode===2;}
function waqfSegs(sn,a){const words=ayaParts(Q.t[sn-1][a-1]).words;const out=[];let st=0;words.forEach((w,i)=>{if(w.includes("\u06D6")||i===words.length-1){out.push([st,i]);st=i+1;}});return out;}
function segTap(sn,a,w){
  const k=sn+":"+a; const sa=waqfSegs(sn,a); let set=revSeg.get(k); if(!set){set=new Set();revSeg.set(k,set);}
  const idx=w===null?-1:sa.findIndex(([x,y])=>w>=x&&w<=y);
  if(idx>=0&&set.has(idx)) set.delete(idx);                       // a visible phrase: hide it again
  else {const nx=sa.findIndex((_,i)=>!set.has(i)); if(nx>=0) set.add(nx);}  // otherwise: show the next phrase
  renderMushaf();
}
// long press on a word: show its phrase and select the word (panel: error, similar places)
function lpSelect(sn,a,w){
  const k=sn+":"+a; const sa=waqfSegs(sn,a); let set=revSeg.get(k); if(!set){set=new Set();revSeg.set(k,set);}
  const idx=sa.findIndex(([x,y])=>w>=x&&w<=y); if(idx>=0) set.add(idx);
  const cur=mSel; let n;
  if(cur&&cur.s===sn&&cur.a===a&&cur.w!==null&&selAnchor!==null){
    if(w===selAnchor&&(cur.we??cur.w)===cur.w) n=null;
    else if(w===selAnchor) n={s:sn,a,w};
    else {const lo=Math.min(selAnchor,w),hi=Math.max(selAnchor,w); n={s:sn,a,w:lo,we:hi};}
  } else {selAnchor=w; n={s:sn,a,w};}
  mSel=n; if(!n) selAnchor=null; noteEdit=false; sugAll=false; renderMushaf();
}
let lpT=null,lpX=0,lpY=0,suppressClick=false;
document.addEventListener("pointerdown",e=>{
  if(!segMode()||linkFrom||!e.target.closest) return;
  const w=e.target.closest("[data-w]"), ay=e.target.closest("[data-aya]"); if(!w||!ay) return;
  lpX=e.clientX; lpY=e.clientY; clearTimeout(lpT);
  const [sn,a]=ay.dataset.aya.split(":").map(Number), wi=Number(w.dataset.w);
  lpT=setTimeout(()=>{lpT=null;suppressClick=true;try{navigator.vibrate&&navigator.vibrate(15);}catch(_){}lpSelect(sn,a,wi);},450);
});
document.addEventListener("pointermove",e=>{if(lpT&&Math.hypot(e.clientX-lpX,e.clientY-lpY)>10){clearTimeout(lpT);lpT=null;}});
["pointerup","pointercancel"].forEach(ev=>document.addEventListener(ev,()=>{clearTimeout(lpT);lpT=null;if(suppressClick)setTimeout(()=>{suppressClick=false;},400);}));
document.addEventListener("scroll",()=>{clearTimeout(lpT);lpT=null;},true);
document.addEventListener("contextmenu",e=>{if(e.target.closest&&e.target.closest(".seg-mode"))e.preventDefault();});
function ayaParts(txt){const m=txt.match(/^([\s\S]*?)(\u00a0[\u0660-\u0669]+)$/);const body=m?m[1]:txt;return {words:body.split(" "),num:m?m[2]:""};}
// how many words of an ayah are shown in the current mode
function shownWords(sn,a,len){const k=sn+":"+a;if(revealed.has(k))return Math.min(len,revealed.get(k));return mMode===2?0:mMode===1?1:len;}
function ayaHTML(sn,a){
  const {words,num}=ayaParts(Q.t[sn-1][a-1]); const shown=shownWords(sn,a,words.length);
  const SG=segMode(); let vis=null; if(SG){const sa=waqfSegs(sn,a),rs=revSeg.get(sn+":"+a)||new Set();vis=new Array(words.length).fill(false);sa.forEach(([x,y],j)=>{if(rs.has(j))for(let i=x;i<=y;i++)vis[i]=true;});}
  const m=state.mistakes[sn+":"+a]; const ms=mshOnAya(sn,a); const hiding=SG?vis.some(v=>!v):shown<words.length;
  let h=words.map((w,i)=>{const cls=["w"];if(SG?!vis[i]:i>=shown)cls.push("hw");else{if(m&&m.w[i])cls.push(m.w[i]>=3?"werr2":"werr");if(ms.words.has(i))cls.push("wmsh");const inR=(l)=>l&&l.s===sn&&l.a===a&&l.w!==null&&i>=l.w&&i<=(l.we??l.w);if(inR(mSel))cls.push("wsel");if(inR(linkFrom))cls.push("wlink");if(inR(linkTo))cls.push("wsel");}
    return `<span class="${cls.join(" ")}" data-w="${i}">${esc(w)}</span>`;}).join(" ");
  const hasM=ms.aya||ms.words.size;
  return {html:h+`<span class="anum" data-anum="1">${esc(num)}</span>`+(hasM?`<button class="msh-mark" data-mshaya="${sn}:${a}" aria-label="متشابهات هذه الآية">≈</button>`:""),hiding};
}
function firstWordHTML(txt){
  const m=txt.match(/^([\s\S]*?)(\u00a0[\u0660-\u0669]+)$/); const body=m?m[1]:txt, num=m?m[2]:"";
  const i=body.indexOf(" "); if(i<0) return esc(txt);
  return esc(body.slice(0,i))+`<span class="hidw"> ${esc(body.slice(i+1))}</span>`+esc(num);
}
function renderMushaf(){
  const el=document.getElementById("v-mushaf");
  if(!Q){
    el.innerHTML=`<div class="card empty"><p class="meta">جارٍ تحميل المصحف…</p></div>`;
    loadQ().then(()=>{if(view==="mushaf")renderMushaf();}).catch(()=>{el.innerHTML=`<div class="card empty"><p class="meta">تعذّر تحميل المصحف. أعد المحاولة لاحقًا.</p><div class="row-btns"><button class="btn" id="mRetry">إعادة المحاولة</button></div></div>`;document.getElementById("mRetry").onclick=renderMushaf;});
    return;
  }
  const list=PAGE_IDX[mPage]; const first=list[0];
  let body="", curTh=-1;
  const thClose=()=>{if(curTh>=0){body+=`</span>`;curTh=-1;}};
  const thOnNow=!!(THM&&thOn);
  for(const [sn,a] of list){
    if(a===1){ thClose(); body+=`</div><div class="s-head">سورة ${SURAHS[sn-1][0]}</div>${sn!==9?`<div class="basmala">${Q.b}</div>`:""}<div class="m-text">`; }
    const tk=thOnNow?(THM.at.has(sn+":"+a)?THM.at.get(sn+":"+a):-1):-1;
    if(tk!==curTh){thClose();if(tk>=0){body+=`<span class="thsec" data-th="${tk%8}">`;curTh=tk;}}
    const inHi=mHi&&mHi.s===sn&&a>=mHi.from&&a<=mHi.to;
    const A=ayaHTML(sn,a); const wa=(state.mistakes[sn+":"+a]||{}).wa||0; const msA=mshOnAya(sn,a).aya;
    const isSel=(mSel&&mSel.s===sn&&mSel.a===a&&mSel.w===null)||(linkTo&&linkTo.s===sn&&linkTo.a===a&&linkTo.w===null); const isLink=linkFrom&&linkFrom.s===sn&&linkFrom.a===a&&linkFrom.w===null;
    body+=`<span class="aya${inHi?" hi":""}${A.hiding?" hiding":""}${!A.hiding&&wa?" err":""}${!A.hiding&&wa>=3?" err2":""}${!A.hiding&&msA?" amsh":""}${isSel?" sel":""}${isLink?" alink":""}" data-aya="${sn}:${a}">${A.html}</span> `;
  }
  thClose();
  let thLeg="";
  if(thOnNow){const seen=new Set(),multi=new Set(list.map(x=>x[0])).size>1;
    for(const [sn,a] of list){const k=THM.at.get(sn+":"+a);if(k===undefined||seen.has(k))continue;seen.add(k);const c=THM.secs[k];
      thLeg+=`<span class="th-chip" data-th="${k%8}">${multi?esc(SURAHS[c.s-1][0])+" · ":""}${c.t?`<span dir="auto">${esc(c.t)}</span>`:"آيات"}<i dir="ltr">${c.from===c.to?c.from:c.from+"–"+c.to}</i></span>`;}
    if(thLeg)thLeg=`<div class="th-leg" aria-label="موضوعات الصفحة">${thLeg}</div>`;}
  body=(`<div class="m-text">`+body+`</div>`).replace(/<div class="m-text"><\/div>/g,"");
  const opts=SURAHS.map((x,i)=>`<option value="${i+1}" ${first&&first[0]===i+1?"selected":""}>${i+1}. ${x[0]}</option>`).join("");
  el.innerHTML=`<div class="m-bar">
      <select id="mSura" aria-label="السورة">${opts}</select>
      <label class="meta">صفحة <input type="number" id="mPg" min="1" max="604" value="${mPage}"></label>
      <button class="icon-nav ${mSearch.open?"on":""}" id="mSrchBtn" aria-label="بحث" title="بحث في المصحف" style="font-size:16px">🔍</button>
      ${THM?`<button class="icon-nav ${thOn?"on":""}" id="mThBtn" aria-label="ألوان الموضوعات" title="ألوان الموضوعات" style="font-size:16px">🎨</button>`:""}
      <div class="seg-ctl" role="group" aria-label="طريقة العرض">${["عرض","أول كلمة","إخفاء"].map((x,i)=>`<button data-mmode="${i}" class="${mMode===i?"on":""}">${x}</button>`).join("")}</div>

    </div>
    ${HUF()&&!linkFrom?rvMushafHTML():""}
    <p class="help" style="margin-top:-4px">${linkFrom?"":segMode()?"اضغط على الآية لتظهر جملة جملة (عند كل وقف)، واضغط على جملة ظاهرة لإخفائها. اضغط مطوّلًا على كلمة لتحديدها: تسجيل خطأ أو متشابهات.":mMode===0?"اضغط على كلمة لتحديدها، أو على رقم الآية لتحديد الآية كاملة: ثم سجّل خطأً أو اربطها بموضع مشابه.":"اقرأ من حفظك، والضغط على الآية يُظهرها كاملة."+" بعد ظهورها كاملة، اضغط على كلمة أو على رقم الآية لتسجيل خطأ."}</p>
    ${linkFrom?`<div class="link-banner"><div style="min-width:0"><b>اختر الموضع المشابه</b><div class="meta" style="color:inherit;opacity:.85">${linkTo?"المختار: "+esc(locLabel(linkTo))+(linkTo.w!==null?" · اضغط كلمة أخرى في الآية لتوسيع العبارة":""):"من "+esc(locLabel(linkFrom))+" · اذهب إلى أي صفحة واضغط على الكلمة، أو على رقم الآية"}</div></div>
      <div style="display:flex;gap:6px;flex:none">${linkTo?`<button class="btn" id="linkOk" style="background:var(--gold-leaf);color:#0d1230">ربط</button>`:""}<button class="btn ghost" id="linkCancel">إلغاء</button></div></div>`:""}
    ${searchPanelHTML()}
    ${thLeg}
    <div class="mushaf${segMode()?" seg-mode":""}">${body}
      <div class="m-foot"><button class="btn ghost" id="mPrev" ${mPage<=1?"disabled":""}>→ السابقة</button><span>${mPage}</span><button class="btn ghost" id="mNext" ${mPage>=604?"disabled":""}>التالية ←</button></div>
    </div>
    ${mHi?`<p class="help" style="text-align:center">المقطع المظلّل: سورة ${SURAHS[mHi.s-1][0]}، الآيات ${mHi.from}–${mHi.to} <button class="linkbtn" id="mClearHi">إزالة التظليل</button></p>`:""}
    ${mSel&&!linkFrom?(()=>{const L=mSel; const c=mistCountLoc(L); const g=groupOf(L); const phrase=L.we!==undefined&&L.we!==null;
      const title=L.w!==null?esc(locLabel(L)):`${SURAHS[L.s-1][0]} ${L.a} · الآية كاملة`;
      return `<div class="aya-bar"><div class="t"><span class="ttl">${title}</span><button id="selClose" aria-label="إغلاق">✕</button></div>
      <div class="bar-acts"><button class="btn sm" id="selAdd" style="background:var(--red);color:#fff">✗ خطأ${c?" ("+c+")":""}</button>${c?`<button class="btn ghost sm" id="selDec" aria-label="إنقاص">−1</button><button class="btn ghost sm" id="selClr">إزالة الخطأ</button>`:""}<button class="btn ghost sm ${tfOpen?"on-occ":""}" id="tfBtn">📖 تفسير</button>${(()=>{const n=simAll(L.s,L.a).length;return n?`<button class="btn ghost sm ${mtOpen?"on-occ":""}" id="mtBtn">🔗 متشابهاتها (${n})</button>`:"";})()}<button class="btn ghost sm" id="mshAdd">≈ ${g?"موضع آخر":"متشابه"}</button>${(()=>{const O=occFor(L);return O.res.length?`<button class="btn ghost sm ${O.open?"on-occ":""}" id="occBtn">☰ تتكرر في ${O.res.length>=300?"300+":O.res.length}</button>`:`<span class="meta" style="font-size:12px">لا تتكرر في غيرها</span>`;})()}${L.w!==null?`<button class="linkbtn sm" id="selScope">الآية كاملة</button>`:""}</div>
      ${tfBoxHTML(L)}
      ${(()=>{const O=occFor(L);if(!O.open||!O.res.length)return "";const shown=O.all?O.res:O.res.slice(0,30);
        return `<div class="occ"><div class="srch-top"><span class="meta">${L.w===null?"الآية نفسها":"«"+esc(locLabel(L).replace(/^.*«|»$/g,""))+"»"} في ${O.res.length>=300?"أكثر من 300 موضع":O.res.length===1?"موضع آخر":O.res.length+" مواضع أخرى"}</span>${O.res.length<=60?`<button class="linkbtn sm" id="occAll">${O.picked.size===O.res.length?"إلغاء الكل":"تحديد الكل"}</button>`:""}</div>
          <div class="srch-list" style="max-height:none">${shown.map((x,i)=>`<div class="srch-it"><input type="checkbox" data-opick="${i}" ${O.picked.has(i)?"checked":""} aria-label="اختيار"><button class="srch-go" data-goloc="${x.s}:${x.a}:${x.w??""}:${x.we??""}"><span class="ml">${esc(SURAHS[x.s-1][0])} ${x.a}${groupOf(x.w===null?{s:x.s,a:x.a,w:null}:x)?" · ≈ مربوطة":""}</span><span class="mq">${occSnippet(x)}</span></button></div>`).join("")}</div>
          ${!O.all&&O.res.length>30?`<button class="linkbtn sm" id="occMore" style="padding:6px 0">عرض الباقي (${O.res.length-30})</button>`:""}
          ${O.picked.size?`<div class="bar-acts"><button class="btn sm" id="occLink" style="background:var(--gold-leaf);color:#0d1230">≈ اربط ${O.picked.size===1?"الموضع المحدّد":O.picked.size+" مواضع"} بهذه ${L.w===null?"الآية":"العبارة"}</button></div>`:`<p class="help" style="margin:6px 0 0">حدّد ما تريد ربطه كمتشابهات.</p>`}</div>`;})()}
      ${mtOpen?sugPanelHTML(L):""}
      ${L.w!==null&&!phrase?`<div class="help" style="margin:4px 0 0">لتحديد عبارة: اضغط على آخر كلمة منها في الآية نفسها.</div>`:""}
      ${g?`<div class="msh-box"><span class="meta" style="color:var(--ink)">متشابهة مع:</span>${g.items.filter(it=>!sameLoc(it,L)).map(it=>`<button class="chip msh-chip" data-goloc="${it.s}:${it.a}:${it.w??""}:${it.we??""}">${esc(locLabel(it))}</button>`).join("")}
          ${noteEdit?`<textarea id="gNote" rows="2" placeholder="كيف تفرّق بينها؟">${esc(g.note)}</textarea><div class="bar-acts"><button class="btn sm" id="gNoteSave">حفظ الملاحظة</button><button class="linkbtn sm" id="gNoteCancel">إلغاء</button></div>`
            :`${g.note?`<div class="note" style="margin-top:4px">📝 ${esc(g.note)}</div>`:""}<div class="bar-acts"><button class="linkbtn sm" id="gNoteBtn">${g.note?"تعديل الملاحظة":"＋ ملاحظة للتفريق"}</button><button class="linkbtn sm" id="mshDel" style="color:var(--red)">إزالة من المتشابهات</button></div>`}</div>`:""}</div>`;})():""}
    <p class="src" id="mSrc">رواية قالون عن نافع · النص والخط من مجمع الملك فهد لطباعة المصحف الشريف (الإصدار 10)</p>`;
  document.getElementById("mSura").onchange=e=>{const sn=Number(e.target.value);mPage=Q.p[sn-1][0];clearRev();mSel=null;renderMushaf();};
  document.getElementById("mPg").onchange=e=>goPage(e.target.value);
  document.getElementById("mSrchBtn").onclick=()=>{mSearch.open=!mSearch.open;renderMushaf();const i=document.getElementById("sQ");if(i)i.focus();};
  bindSearch();
  const thb=document.getElementById("mThBtn"); if(thb) thb.onclick=()=>{thOn=!thOn;try{localStorage.setItem("quran-th-on",thOn?"1":"0");}catch(e){}renderMushaf();};
  document.getElementById("mPrev").onclick=()=>{goPage(mPage-1);window.scrollTo(0,0);};
  document.getElementById("mNext").onclick=()=>{goPage(mPage+1);window.scrollTo(0,0);};
  const ch=document.getElementById("mClearHi"); if(ch) ch.onclick=()=>{mHi=null;renderMushaf();};
  const lc=document.getElementById("linkCancel"); if(lc) lc.onclick=()=>{mSel=linkFrom;linkFrom=null;linkTo=null;renderMushaf();};
  const lo=document.getElementById("linkOk"); if(lo) lo.onclick=()=>{const T=cleanLoc(linkTo);if(sameLoc(cleanLoc(linkFrom),T)){toast("اختر موضعًا آخر");return;}linkLocs(cleanLoc(linkFrom),T);toast("رُبط "+locLabel(linkFrom)+" بـ "+locLabel(T));linkFrom=null;linkTo=null;mSel=T;selAnchor=null;noteEdit=!(groupOf(T)||{}).note;renderMushaf();};
  if(mSel&&!linkFrom){
    const S=mSel;
    document.getElementById("tfBtn").onclick=()=>{tfOpen=!tfOpen;if(tfOpen)mtOpen=false;renderMushaf();};
    const mb=document.getElementById("mtBtn"); if(mb) mb.onclick=()=>{mtOpen=!mtOpen;if(mtOpen)tfOpen=false;renderMushaf();};
    document.querySelectorAll("[data-tftab]").forEach(b=>b.onclick=()=>{tfTab=b.dataset.tftab;renderMushaf();});
    document.getElementById("selClose").onclick=()=>{mSel=null;noteEdit=false;renderMushaf();};
    const sc=document.getElementById("selScope"); if(sc) sc.onclick=()=>{mSel={s:S.s,a:S.a,w:null};selAnchor=null;renderMushaf();};
    const gc=document.getElementById("gNoteCancel"); if(gc) gc.onclick=()=>{noteEdit=false;renderMushaf();};
    document.getElementById("selAdd").onclick=()=>{addMistakeLoc(S);if(!groupOf({s:S.s,a:S.a,w:null})){const k=simAll(S.s,S.a).length;if(k){mtOpen=true;tfOpen=false;toast("سُجّل الخطأ · هذه الآية تشبه "+(k===1?"آية أخرى":k+" آيات")+"، اختر ما تربطه بها أدناه");renderMushaf();const sg=document.querySelector(".aya-bar .sug");if(sg)sg.scrollIntoView({block:"nearest"});return;}}toast(S.w===null?"سُجّل الخطأ في الآية "+S.a:(S.we!==undefined&&S.we!==null?"سُجّل الخطأ في العبارة":"سُجّل الخطأ في الكلمة"));renderMushaf();};
    const dd=document.getElementById("selDec"); if(dd) dd.onclick=()=>{decMistakeLoc(S);renderMushaf();};
    const cl=document.getElementById("selClr"); if(cl) cl.onclick=()=>{clearMistakeLoc(S);toast("أُزيلت العلامة");renderMushaf();};
    document.getElementById("mshAdd").onclick=()=>{linkFrom=cleanLoc(S);linkTo=null;mSel=null;selAnchor=null;noteEdit=false;if(mMode){mMode=0;clearRev();}renderMushaf();};
    const nb=document.getElementById("gNoteBtn"); if(nb) nb.onclick=()=>{noteEdit=true;renderMushaf();const t=document.getElementById("gNote");if(t)t.focus();};
    const ns=document.getElementById("gNoteSave"); if(ns) ns.onclick=()=>{const g=groupOf(S);if(g){g.note=document.getElementById("gNote").value.trim().slice(0,500);save();}noteEdit=false;renderMushaf();};
    const ob=document.getElementById("occBtn"); if(ob) ob.onclick=()=>{const O=occFor(S);O.open=!O.open;renderMushaf();};
    const oa=document.getElementById("occAll"); if(oa) oa.onclick=()=>{const O=occFor(S);O.picked=O.picked.size===O.res.length?new Set():new Set(O.res.map((_,i)=>i));renderMushaf();};
    const om=document.getElementById("occMore"); if(om) om.onclick=()=>{occFor(S).all=true;renderMushaf();};
    document.querySelectorAll("[data-opick]").forEach(c=>c.onchange=()=>{const O=occFor(S);const i=Number(c.dataset.opick);if(c.checked)O.picked.add(i);else O.picked.delete(i);renderMushaf();});
    const ol=document.getElementById("occLink"); if(ol) ol.onclick=()=>{const O=occFor(S);const base=cleanLoc(S);let n=0;[...O.picked].forEach(i=>{const x=O.res[i];if(linkLocs(base,cleanLoc({s:x.s,a:x.a,w:x.w,we:x.we})))n++;});O.picked=new Set();toast(n?"رُبطت "+(n===1?"موضع واحد":n+" مواضع")+" كمتشابهات":"هذه المواضع مربوطة من قبل");renderMushaf();};
    const md=document.getElementById("mshDel"); if(md) md.onclick=()=>{unlinkLoc(S);toast("أُزيل من المتشابهات");renderMushaf();};
  }
  {const bar=el.querySelector(".aya-bar");const src=document.getElementById("mSrc");if(src)src.style.marginBottom=bar?(bar.offsetHeight+24)+"px":"";}
  if(mScroll){mScroll=false;const h=el.querySelector(".wsel")||el.querySelector(".aya.sel")||el.querySelector(".aya.hi");if(h)h.scrollIntoView({block:"center"});}
}
document.addEventListener("keydown",e=>{
  if(view!=="mushaf"||!Q||/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))return;
  if(e.key==="ArrowLeft")goPage(mPage+1); else if(e.key==="ArrowRight")goPage(mPage-1);
});

