// Delegated clicks
document.addEventListener("click",e=>{
  const t=e.target.closest("[data-lall],[data-lexp],[data-wknav],[data-tsel],[data-tstart],[data-tmode],[data-tshow],[data-tgrade],[data-tpick],[data-tnext],[data-tmist],[data-mqstart],[data-mqrate],[data-mqexit],[data-mshaya],[data-mshitem],[data-goloc],[data-munit],[data-qa],[data-qaundo],[data-cal],[data-calnav],[data-scroll],[data-newtog],[data-mmode],[data-backup],[data-restore],[data-khd],[data-khopen],[data-htog],[data-hdel],[data-goadh],[data-adcat],[data-adtap],[data-hopen],[data-splitopen],[data-splitat],[data-splith],[data-merge],[data-aya],[data-openaya],[data-open],[data-rate],[data-edit],[data-range],[data-go],[data-f],[data-notebtn],[data-addseg],[data-delseg],[data-full],[data-clear]");
  if(!t) return;
  const d=t.dataset;
  if(HUF()&&(d.addseg||d.delseg||d.full||d.clear||d.range||d.newtog||d.splitopen||d.splitat||d.splith||d.merge||d.edit)) return;
  if(d.lall){laterAll=true;renderToday();return;}
  if(d.lexp){laterExp.add(d.lexp);renderToday();return;}
  if(d.wknav){wkOff=Math.max(0,wkOff+Number(d.wknav));renderWeek();return;}
  if(d.tsel){state.tsb.sel=d.tsel;save();renderTasbih();return;}
  if(d.tstart){startTests(d.tstart);return;}
  if(d.tmode){tst.mode=d.tmode;tst.ok=0;tst.n=0;nextTest();renderTests();return;}
  if(d.tshow){tst.shown=true;renderTests();return;}
  if(d.tgrade!==undefined){tst.n++;if(d.tgrade==="1")tst.ok++;else{const [s0,a0]=tst.cur;const a1=tst.mode==="link"?a0+1:a0;addMistake(s0,a1,null);toast("سُجّل خطأ في "+SURAHS[s0-1][0]+" "+a1);}nextTest();renderTests();return;}
  if(d.tpick){if(tst.pick===null){tst.pick=Number(d.tpick);tst.n++;if(tst.pick===tst.cur[0])tst.ok++;renderTests();}return;}
  if(d.tnext){nextTest();renderTests();window.scrollTo(0,0);return;}
  if(d.tmist){const [s0,a0]=d.tmist.split(":").map(Number);addMistake(s0,a0,null);toast("سُجّل خطأ في "+SURAHS[s0-1][0]+" "+a0);t.remove();return;}
  if(d.mqstart){startMQ(d.mqstart==="all");return;}
  if(d.mqrate){mqRate(d.mqrate);return;}
  if(d.mqexit){mq=null;setView("list");return;}
  if(d.mshaya){const [sn,a]=d.mshaya.split(":").map(Number);showMshPanel(sn,a,a);return;}
  if(d.mshitem){const it=state.items[d.mshitem];if(it)showMshPanel(it.s,it.from,it.to);return;}
  if(d.closemodal){const m=document.getElementById("mshModal");if(m)m.remove();}
  if(d.qa!==undefined){qadaMark(Number(d.qa),1);return;}
  if(d.qaundo!==undefined){qadaMark(Number(d.qaundo),-1);return;}
  if(d.cal){calSel=calSel===d.cal?null:d.cal;renderStats();return;}
  if(d.calnav!==undefined){const k=Number(d.calnav);if(k===0){const [y,m]=today().split("-").map(Number);calYM=[y,m];}else{let [y,m]=calYM;m+=k;if(m<1){m=12;y--;}if(m>12){m=1;y++;}calYM=[y,m];}calSel=null;renderStats();return;}
  if(d.scroll){const el=document.getElementById(d.scroll);if(el)el.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"});return;}
  if(d.mmode!==undefined){mMode=Number(d.mmode);clearRev();mSel=null;renderMushaf();return;}
  if(d.backup){doBackup();return;}
  if(d.restore){if(d.restore==="yes"&&pendingRestore){state=pendingRestore;pendingRestore=null;save();render();setView("today");toast("استُرجعت البيانات");}else{pendingRestore=null;const b=document.getElementById("restoreBox");if(b){b.className="hidden";b.innerHTML="";}}return;}
  if(d.newtog){const it=state.items[d.newtog];if(it){if(it.newAt){delete it.newAt;toast("أُزيل من المراجعة القريبة");}else{it.newAt=addDays(today(),-1);toast("سيُراجَع يوميًا لمدة "+daysTxt(state.recent.days));}save();render();}return;}
  if(d.khd){khDays=Number(d.khd);renderKhatma();return;}
  if(d.khopen){const pgn=Number(d.khopen);loadQ().then(()=>{mPage=pgn;mHi=null;mSel=null;clearRev();setView("mushaf");window.scrollTo(0,0);}).catch(()=>toast("تعذّر تحميل المصحف"));return;}
  if(d.htog){toggleHabit(d.htog,d.hd);renderStats();return;}
  if(d.hdel){if(t.dataset.confirm){state.habits=state.habits.filter(h=>h.id!==d.hdel);save();renderStats();toast("حُذفت العادة");}else{t.dataset.confirm="1";t.textContent="حذف؟";t.style.color="var(--red)";setTimeout(()=>{if(t.isConnected){delete t.dataset.confirm;t.textContent="✕";t.style.color="var(--muted)";}},3000);}return;}
  if(d.goadh){adhCat=d.goadh;setView("adhkar");window.scrollTo(0,0);return;}
  if(d.adcat){adhCat=d.adcat;renderAdhkar();window.scrollTo(0,0);return;}
  if(d.adtap!==undefined){adhTap(Number(d.adtap));return;}
  if(d.hopen!==undefined&&hParts){const p=hParts[Number(d.hopen)];if(p)openMushaf(p.s,p.from,p.to);return;}
  if(d.splitopen){openSplit=openSplit===d.splitopen?null:d.splitopen;relist();return;}
  if(d.splitat){splitAt(d.splitat,document.getElementById("splitA").value);return;}
  if(d.splith){splitBySize(d.splith,document.getElementById("splitH").value);return;}
  if(d.merge){mergeSurah(Number(d.merge));return;}
  if(d.aya){ const [sn,a]=d.aya.split(":").map(Number);
    if(segMode()&&!linkFrom){ if(suppressClick){suppressClick=false;return;} const w0=e.target.closest("[data-w]"); if(!e.target.closest("[data-anum]")||t.classList.contains("hiding")){ segTap(sn,a,w0?Number(w0.dataset.w):null); return; } }
    if(t.classList.contains("hiding")){ const len=ayaParts(Q.t[sn-1][a-1]).words.length; const cur=shownWords(sn,a,len); revealed.set(d.aya,mUnit==="aya"?len:cur+1); renderMushaf(); return; }
    const wEl=e.target.closest("[data-w]"); const w=wEl?Number(wEl.dataset.w):null;
    // picking a word extends the current pick to a phrase when it is in the same ayah
    const pick=(cur)=>{ if(w===null) return {s:sn,a,w:null};
      if(cur&&cur.s===sn&&cur.a===a&&cur.w!==null&&selAnchor!==null){ if(w===selAnchor&&(cur.we??cur.w)===cur.w) return null; if(w===selAnchor) return {s:sn,a,w}; const lo=Math.min(selAnchor,w),hi=Math.max(selAnchor,w); return {s:sn,a,w:lo,we:hi}; }
      selAnchor=w; return {s:sn,a,w}; };
    if(linkFrom){ const n=pick(linkTo); linkTo=n; if(!n) selAnchor=null; renderMushaf(); return; }
    const n=pick(mSel); if(!n||w===null) selAnchor=w===null?null:selAnchor; mSel=n; if(!n) selAnchor=null; noteEdit=false; renderMushaf(); return; }
  if(d.goloc){const [sn,a,w,we]=d.goloc.split(":");const l={s:+sn,a:+a,w:w===""?null:+w};if(we!==undefined&&we!=="")l.we=+we;selAnchor=null;goLoc(l);return;}
  if(d.munit){mUnit=d.munit;renderMushaf();return;}
  if(d.openaya){const [sn,a]=d.openaya.split(":").map(Number);loadQ().then(()=>{mPage=Q.p[sn-1][a-1];mHi=null;mSel={s:sn,a,w:null};clearRev();mScroll=true;setView("mushaf");}).catch(()=>toast("تعذّر تحميل المصحف"));return;}
  if(d.open){const it=state.items[d.open];if(it)openMushaf(it.s,it.from,it.to);return;}
  if(d.rate){rate(d.id,d.rate);}
  else if(d.edit){const n=Number(d.edit);openEdit=openEdit===n?null:n;relist();}
  else if(d.addseg){const n=Number(d.addseg);const nw=document.getElementById("new-"+n);addSeg(n,document.getElementById("from-"+n).value,document.getElementById("to-"+n).value,nw&&nw.checked);}
  else if(d.delseg){removeSeg(d.delseg);}
  else if(d.full){const n=Number(d.full);addSegQuiet(n);save();render();toast("سورة "+SURAHS[n-1][0]+": محفوظة كاملة");}
  else if(d.clear){const n=Number(d.clear);clearSurah(n);toast("أُلغي حفظ سورة "+SURAHS[n-1][0]);}
  else if(d.range){const [a,b]=d.range.split("-").map(Number);addRange(a,b);}
  else if(d.go){setView(d.go);}
  else if(d.f){listFilter=d.f;renderList();}
  else if(d.notebtn){
    const id=d.notebtn;
    if(openNote===id){saveNoteFrom(id);openNote=null;}
    else{ if(openNote) saveNoteFrom(openNote); openNote=id; }
    render();
    const ta=document.querySelector(`textarea[data-note="${id}"]`); if(ta) ta.focus();
  }
});
document.addEventListener("change",e=>{
  if(e.target.matches("textarea[data-note]")) saveNoteFrom(e.target.dataset.note);
});

let toastTimer=null;
function toast(msg,withUndo){
  const el=document.getElementById("toast");
  el.innerHTML=`<span>${esc(msg)}</span>`+(withUndo?`<button id="undoBtn">تراجع</button>`:"");
  const bar=document.querySelector(".aya-bar");el.style.bottom=bar?(window.innerHeight-bar.getBoundingClientRect().top+8)+"px":"";
  el.classList.remove("hidden");
  if(withUndo) document.getElementById("undoBtn").onclick=undo;
  clearTimeout(toastTimer); toastTimer=setTimeout(hideToast,4500);
}
function hideToast(){document.getElementById("toast").classList.add("hidden");}

// Re-render at day change when the tab regains focus
let renderedDay=today();
document.addEventListener("visibilitychange",()=>{if(!document.hidden&&today()!==renderedDay){renderedDay=today();render();}});

initDb();
if("serviceWorker" in navigator&&location.protocol!=="file:"){window.addEventListener("load",()=>{navigator.serviceWorker.register("sw.js").then(()=>navigator.serviceWorker.ready).then(()=>{ /* pass the fonts stylesheet through the worker once so it is kept for offline use */ document.querySelectorAll('link[rel=stylesheet][href*="fonts.googleapis"]').forEach(l=>fetch(l.href,{mode:"no-cors"}).catch(()=>{})); }).catch(()=>{});});}
