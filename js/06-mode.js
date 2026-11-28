// ---- Usage mode: "hifdh" (memorize + review) or "huffaz" (already memorized the whole Quran: review only) ----
function HUF(){return state.mode==="huffaz";}
// Review schedule for someone who has memorized the whole Quran: every surah split into parts of about one hizb,
// with the first due dates spread over the days so that today only shows about one daily goal.
function fullQuranItems(){
  const out={}; let cum=0; const g=state.goalH>0?state.goalH:3;
  for(let n=1;n<=114;n++){const q=SURAHS[n-1][1];out[idOf(n,1,q)]=newItem(n,1,q,{level:3,due:addDays(today(),Math.floor(cum/g+1e-9))});cum+=rangeH(n,1,q);}
  return out;
}
function setMode(m){
  if(m!=="hifdh"&&m!=="huffaz") return;
  if(state.mode===m) return;
  if(!state.stash||typeof state.stash!=="object") state.stash={};
  if(m==="huffaz"){
    // what was there (memorized segments + plan) is kept aside, and comes back if the person returns to "hifdh"
    state.stash.hifdh={items:state.items,planOn:!!(state.plan&&state.plan.on)};
    const kept=state.stash.huffaz; delete state.stash.huffaz;
    state.items={};
    state.plan.on=false;
  } else if(state.mode==="huffaz"){
    delete state.stash.huffaz; const kept=state.stash.hifdh; delete state.stash.hifdh;
    state.items=(kept&&kept.items)?kept.items:{};
    state.plan.on=!!(kept&&kept.planOn);
  }
  state.mode=m; openEdit=null; openSplit=null; lastUndo=null; hParts=null; showExtra=false;
  save(); render(); setView(m==="huffaz"?"stats":"today"); window.scrollTo(0,0);
  toast(m==="huffaz"?"وضع مراجعة الحفّاظ: اختر ما تراجعه في «مراجعتي»":"وضع الحفظ + المراجعة");
}
function applyModeUI(){const nav=document.querySelector(".tabbar");if(nav){nav.classList.toggle("c7",HUF());const order=HUF()?["stats","today","list","mushaf","maps","khatma","adhkar"]:["today","list","mushaf","khatma","adhkar","stats"];const cur=[...nav.querySelectorAll("button[data-v]")].map(b=>b.dataset.v).join();if(cur!==order.join())order.forEach(v=>{const b=nav.querySelector(`button[data-v="${v}"]`);if(b)nav.appendChild(b);});}const tb=document.querySelector('.tabbar button[data-v="today"] span'); if(tb) tb.textContent=HUF()?"مراجعتي":"اليوم";const b=document.querySelector('.tabbar button[data-v="list"] span'); if(b) b.textContent=HUF()?"المتشابهات":"حفظي";}
function renderModePicker(){
  const ex=document.getElementById("modePick");
  if(!modeReady||state.mode||document.getElementById("auth")){ if(ex) ex.remove(); return; }
  if(ex) return;
  document.body.insertAdjacentHTML("beforeend",`<div id="modePick" class="auth"><div class="auth-box">
    <div class="auth-h"><div class="auth-t">مراجعة القرآن</div><div class="auth-s">كيف تريد استعمال التطبيق؟</div></div>
    <button class="mode-opt" data-pick="hifdh"><b>حفظ + مراجعة</b><span>أحفظ شيئًا جديدًا وأراجع ما حفظته: خطة حفظ يومية، ومراجعة قريبة لما حفظته حديثًا، وجدول مراجعة لمحفوظك.</span></button>
    <button class="mode-opt" data-pick="huffaz"><b>مراجعة للحفّاظ</b><span>حفظتُ القرآن كاملًا وأريد المراجعة فقط: أختار بنفسي السور والصفحات التي أراجعها، دون خطة حفظ ودون أي شيء يخصّ الحفظ.</span></button>
    <p class="help" style="text-align:center;margin:12px 0 0">يمكنك تغيير هذا الاختيار لاحقًا من الإعدادات.</p>
  </div></div>`);
  document.querySelectorAll("#modePick [data-pick]").forEach(b=>b.onclick=()=>setMode(b.dataset.pick));
}
function surDue(n){const sg=segs(n);if(!sg.length)return "";const m=sg.map(([,it])=>it.due).sort()[0];const d=diffDays(m,today());return d<=0?"مستحقة":"بعد "+daysTxt(d);}


