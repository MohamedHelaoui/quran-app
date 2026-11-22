function renderStats(){
  const el=document.getElementById("v-stats");
  const ids=Object.keys(state.items);
  const full=SURAHS.filter((_,i)=>statusOf(i+1)==="full").length;
  const part=SURAHS.filter((_,i)=>statusOf(i+1)==="part").length;
  const ahzab=ids.reduce((a,id)=>a+itemH(state.items[id]),0);
  const total=Object.values(state.log).reduce((a,b)=>a+b,0);
  const weak=ids.filter(id=>state.items[id].level<=1&&state.items[id].reviews>0).sort((a,b)=>state.items[a].s-state.items[b].s||state.items[a].from-state.items[b].from);
  const days=[];for(let i=13;i>=0;i--){const d=addDays(today(),-i);days.push([d,state.log[d]||0]);}
  const mx=Math.max(1,...days.map(d=>d[1]));
  const wkH=[0,1,2,3,4,5,6].reduce((a,i)=>a+(state.rH[addDays(today(),-i)]||0),0);
  el.innerHTML=(HUF()?todaySummaryHTML()+tgEditHTML():"")+`<button class="wk-entry" data-go="week"><span><b>الملخّص الأسبوعي</b><span class="meta" style="display:block">ما أنجزته في آخر 7 أيام وما تركّز عليه</span></span><span aria-hidden="true">‹</span></button>`+calendarCard()+(HUF()?surahsCardHTML():"")+habitsCard()+(HUF()?hufTailHTML():`<div class="stats">
      ${HUF()?`<div class="card stat"><div class="v">${fmtH(wkH)}</div><div class="k">حزبًا راجعتها في آخر 7 أيام</div></div>
      <div class="card stat"><div class="v">${state.rv.length}</div><div class="k">في «مراجعتي»</div></div>`:`<div class="card stat"><div class="v">${full}<span style="font-size:18px"> / 114</span></div><div class="k">سورة محفوظة كاملة${part?" + "+part+" جزئيًا":""}</div></div>
      <div class="card stat"><div class="v">${fmtH(ahzab)}<span style="font-size:18px"> / 60</span></div><div class="k">حزبًا محفوظًا (تقريبًا)</div></div>`}
      <div class="card stat"><div class="v">🔥 ${streak()}</div><div class="k">أيام مراجعة متتالية</div></div>
      <div class="card stat"><div class="v">${total}</div><div class="k">مراجعة في المجموع</div></div>
    </div>
    <div class="card" style="margin-top:10px"><div style="font-weight:600">آخر 14 يومًا</div>
      <div class="bars">${days.map(([d,v])=>`<div class="${v?"":"zero"}" style="height:${v?Math.max(8,v/mx*100):2}%" title="${d}: ${v}"></div>`).join("")}</div>
      <div class="bars-l"><span>قبل أسبوعين</span><span>اليوم</span></div></div>
    <div class="card" style="margin-top:10px"><div style="font-weight:600">${HUF()?"سور تحتاج تركيزًا":"مقاطع تحتاج تركيزًا"}</div>
      ${weak.length?`<p class="meta" style="margin:6px 0 0">${weak.map(id=>labelOf(state.items[id]).replace("سورة ","")).join(" · ")}</p>`:`<p class="meta" style="margin:6px 0 0">لا يوجد مقطع ضعيف حاليًا 👍</p>`}</div>
    <div class="card" style="margin-top:10px"><div style="font-weight:600">آيات أخطأت فيها أكثر</div>
      ${(()=>{const top=Object.entries(state.mistakes).map(([k,v])=>{const [sn,a]=k.split(":").map(Number);return {sn,a,c:v.c};}).sort((x,y)=>y.c-x.c||x.sn-y.sn||x.a-y.a).slice(0,12);
        if(HUF()&&top.length) return mistListHTML(top.map(m=>m.sn+":"+m.a),true);
        return top.length?`<div class="mist" style="color:var(--ink)">${top.map(m=>`<button class="chip" data-openaya="${m.sn}:${m.a}">${SURAHS[m.sn-1][0]} ${m.a} · ${errTxt(m.c)}</button>`).join("")}</div>`:`<p class="meta" style="margin:6px 0 0">لم تسجّل أي خطأ بعد. في المصحف، اضغط على الآية التي أخطأت فيها.</p>`;})()}</div>
    </div>`);
  {const sd=document.getElementById("surDet");if(sd)sd.ontoggle=()=>{surOpen=sd.open;};}
  {const a=document.getElementById("focDet");if(a)a.ontoggle=()=>{focOpen=a.open;};const b=document.getElementById("topDet");if(b)b.ontoggle=()=>{const was=topOpen;topOpen=b.open;if(was!==topOpen)renderStats();};}
  document.getElementById("hAdd").onclick=()=>{const v=document.getElementById("hNew").value.trim();if(!v)return;state.habits.push({id:"h"+Date.now().toString(36),n:v.slice(0,40)});save();renderStats();toast("أُضيفت العادة: "+v);};
  document.getElementById("hNew").onkeydown=e=>{if(e.key==="Enter")document.getElementById("hAdd").click();};
}

let pendingRestore=null;
async function doBackup(){
  const data=JSON.stringify(Object.assign({app:"quran-review-qalun"},state),null,1);
  const name="quran-backup-"+today()+".json";
  try{const url=URL.createObjectURL(new Blob([data],{type:"application/json"}));const a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);toast("نُزّلت النسخة الاحتياطية");}
  catch(e){toast("تعذّر تنزيل الملف");}
}
function renderSettings(){
  const el=document.getElementById("v-settings");
  const sm={ok:["متزامن مع حسابك","تُحفظ بياناتك في حسابك، وتظهر على أي جهاز تسجّل الدخول منه. التغييرات من جهاز آخر تصل تلقائيًا."],
    busy:["جارٍ الحفظ…","تُرسَل آخر تغييراتك إلى حسابك."],
    local:["على هذا الجهاز فقط",sbUser?"لم يتمكن التطبيق من الوصول إلى حسابك.":"أنت تستعمل التطبيق دون حساب، فبياناتك محفوظة على هذا الجهاز فقط. سجّل الدخول لتصل إليها من أجهزتك الأخرى."],
    warn:[navigator.onLine?"تعذّر الاتصال":"دون إنترنت","التطبيق يعمل دون إنترنت، وتغييراتك محفوظة على هذا الجهاز وتُرسَل إلى حسابك تلقائيًا عند عودة الاتصال."]}[syncMode]||["…",""];
  el.innerHTML=`<h2 class="page-t">الإعدادات</h2>
    <div class="card" style="margin-bottom:10px"><div style="font-weight:600">طريقة الاستعمال</div>
      <p class="help">${HUF()?"الوضع الحالي: مراجعة للحفّاظ (حافظ للقرآن كاملًا، مراجعة فقط).":"الوضع الحالي: حفظ + مراجعة."}</p>
      <div class="bar-acts"><button class="btn ghost sm" id="modeSw">${HUF()?"التحويل إلى: حفظ + مراجعة":"التحويل إلى: مراجعة للحفّاظ"}</button></div>
      <div id="modeConfirm" class="hidden" style="margin-top:10px"><p class="meta">${HUF()?"ستعود إلى محفوظك السابق وخطة الحفظ كما تركتهما. وتبقى «مراجعتي» محفوظة فتجدها إن رجعت.":"تختار ما تراجعه بنفسك في «مراجعتي»، ويُحفظ محفوظك الحالي وخطة الحفظ جانبًا فتعود إليهما إن رجعت إلى هذا الوضع."}</p><div class="row-btns" style="justify-content:flex-start"><button class="btn" id="modeYes">نعم، حوّل</button><button class="btn ghost" id="modeNo">إلغاء</button></div></div>
    </div>
    <div class="card"><div style="font-weight:600">الحساب والمزامنة</div>
      <div class="setting"><span>${sbUser?`<span dir="ltr" style="font-weight:500">${esc(sbUser.email||"")}</span>`:`<span class="meta">دون حساب</span>`}</span><span class="sync ${syncMode}" style="cursor:default"><i></i><span>${sm[0]}</span></span></div>
      <p class="help">${sm[1]}</p>
      <div class="bar-acts">${sbUser?`<button class="btn ghost sm" id="sOut">تسجيل الخروج</button>`:`<button class="btn sm" id="sIn">تسجيل الدخول أو إنشاء حساب</button>`}</div>
      <details style="margin-top:8px"><summary style="cursor:pointer;color:var(--indigo-2);font-size:14px">كيف أستعمله على الهاتف؟</summary>
        <ol class="help" style="padding-inline-start:20px;margin:8px 0 0">
          <li>افتح رابط الموقع في متصفح الهاتف، وسجّل الدخول بالحساب نفسه.</li>
          <li>أضِفه إلى الشاشة الرئيسية ليفتح كتطبيق: في Safari من زر المشاركة ثم «إضافة إلى الشاشة الرئيسية»، وفي Chrome من القائمة ⋮ ثم «إضافة إلى الشاشة الرئيسية» أو «تثبيت التطبيق».</li>
        </ol></details>
    </div>
    <div class="card" style="margin-top:10px"><div style="font-weight:600">مواقيت الصلاة</div>
      ${(()=>{const pd=prayerData();const ks=Object.keys(pd.days).sort();return ks.length?`<p class="help">${esc(pd.name)}: من ${fmtDate(ks[0])} إلى ${fmtDate(ks[ks.length-1])} ${ks[0].slice(0,4)!==ks[ks.length-1].slice(0,4)?"":ks[0].slice(0,4)}. الأوقات بتوقيت ${pd.tz==="Europe/Berlin"?"ألمانيا":esc(pd.tz)} أينما كنت.</p>`:`<p class="help">لا توجد مواقيت محفوظة.</p>`;})()}
      <div class="setting"><span class="meta">إضافة مواقيت شهر جديد: صدّر التقويم من تطبيق Mawaqit (ملف ‎.ics) ثم اختره هنا</span><label class="btn ghost" style="flex:none;cursor:pointer">اختيار ملف<input type="file" id="icsFile" accept=".ics,text/calendar" style="display:none"></label></div>
    </div>
    <div class="card" style="margin-top:10px"><div style="font-weight:600">المراجعة</div>
${HUF()?"":`
      <div class="setting"><label for="rOn">المراجعة القريبة (الحفظ الجديد يُراجَع يوميًا)</label><input type="checkbox" id="rOn" ${state.recent.on?"checked":""} style="width:22px;height:22px;flex:none"></div>
      <div class="setting"><label for="rDays">مدتها</label><select id="rDays" style="font:inherit;border:1px solid var(--line);border-radius:10px;padding:6px;background:var(--card);color:var(--ink)">${[7,14,30,40,60].map(x=>`<option value="${x}" ${state.recent.days===x?"selected":""}>${daysTxt(x)}</option>`).join("")}</select></div>
      <p class="help">ما تحفظه من «حفظ اليوم» يدخل المراجعة القريبة تلقائيًا. ولتعليم مقطع حفظته حديثًا بنفسك: في «حفظي» اضغط ☆ بجانبه.</p>`}
      ${HUF()?`<p class="help">تختار ما تراجعه بنفسك وترتّبه في «مراجعتي».</p>`:`<div class="setting"><label for="goal">هدف المراجعة اليومي (عدد الأحزاب)</label><input type="number" id="goal" min="0.5" max="60" step="0.5" value="${state.goalH}"></div>
      <p class="help">يقترح التطبيق مقاطع للمراجعة حتى يبلغ هذا العدد من الأحزاب، وما يزيد يظهر في قسم «إن كان لديك وقت إضافي». الحجم بالأحزاب تقريبي (محسوب من عدد صفحات المصحف، ولجزء السورة بنسبة عدد آياته).</p>`}
    </div>
    ${HUF()?"":`
    <div class="card" style="margin-top:10px" id="planCard"><div style="font-weight:600">خطة الحفظ</div>
      <div class="setting"><label for="pOn">تفعيل خطة الحفظ</label><input type="checkbox" id="pOn" ${state.plan.on?"checked":""} style="width:22px;height:22px"></div>
      <div class="setting"><label>المقدار في كل يوم حفظ</label><span style="display:flex;gap:6px"><input type="number" id="pAmt" min="0.25" step="${state.plan.unit==="ayah"?1:0.25}" value="${state.plan.amount}"><select id="pUnit" style="font:inherit;border:1px solid var(--line);border-radius:10px;padding:6px;background:var(--card);color:var(--ink)">${Object.entries(UNITS).map(([k,u])=>`<option value="${k}" ${state.plan.unit===k?"selected":""}>${u.name}</option>`).join("")}</select></span></div>
      <div class="setting" style="align-items:flex-start"><span>أيام الحفظ<span class="meta" style="display:block">${hifdhDaysTxt()}</span></span>
        <div class="wd-pick">${[1,2,3,4,5,6,0].map(i=>`<button class="${state.plan.days.includes(i)?"on":""}" data-pday="${i}" aria-pressed="${state.plan.days.includes(i)}">${WDN[i].replace("ال","")}</button>`).join("")}</div></div>
      <div class="chips" style="margin:6px 0 0;justify-content:flex-end"><button class="chip" data-pdays="0123456">كل يوم</button><button class="chip" data-pdays="12345">أيام الدراسة (الإثنين–الجمعة)</button><button class="chip" data-pdays="135">3 أيام</button></div>
      <div class="setting"><label for="pOrd">ترتيب الحفظ</label><select id="pOrd" style="font:inherit;border:1px solid var(--line);border-radius:10px;padding:6px;background:var(--card);color:var(--ink)"><option value="back" ${state.plan.order==="back"?"selected":""}>من الناس إلى البقرة</option><option value="fwd" ${state.plan.order==="fwd"?"selected":""}>من الفاتحة إلى الناس</option></select></div>
      ${(()=>{const r=remainingH();const d=dailyH();const sessions=d>0?Math.ceil(r/d):0;const days=Math.ceil(sessions*7/state.plan.days.length);const st=nextStart();const wk=[0,1,2,3,4,5,6].reduce((a,i)=>a+(state.hlog[addDays(today(),-i)]||0),0);
        return `<p class="help">${st?"المقطع الجديد يبدأ من سورة "+SURAHS[st.s-1][0]+"، الآية "+st.a+". ":""}بقي حوالي ${fmtH(r)} حزب؛ بمقدار ${amountTxt(state.plan)} ${state.plan.days.length===7?"يوميًا":"في كل يوم حفظ ("+hifdhDaysTxt()+")"} تُتمّ الحفظ في حوالي ${daysTxt(days)}${days>60?" (≈ "+(Math.round(days/30.4*10)/10)+" شهرًا)":""}. حفظت في آخر 7 أيام: ${ayatTxt(wk)}.</p>`;})()}
      <p class="help">الصفحة محسوبة من أسطر مصحف قالون، والثُّمن تقريبي (من حجم النص). إذا انتهت السورة قبل المقدار اليومي، يُكمَل من السورة التالية.</p>
    </div>`}
    <div class="card" style="margin-top:10px"><div style="font-weight:600">البيانات</div>
      <div class="setting"><span class="meta">نسخة احتياطية من كل بياناتك في ملف تحتفظ به</span><button class="btn ghost" data-backup="1" style="flex:none">تنزيل</button></div>
      <div class="setting"><span class="meta">استرجاع البيانات من ملف نسخة احتياطية</span><label class="btn ghost" style="flex:none;cursor:pointer">اختيار ملف<input type="file" id="restoreFile" accept=".json,application/json" style="display:none"></label></div>
      <div id="restoreBox" class="hidden"></div>
      <div class="setting" style="margin-top:14px"><span class="meta">${HUF()?"البدء من جديد: يعيد جدول المراجعة والأخطاء والختمة وسجلّ العادات إلى البداية (تبقى الإعدادات والعادات التي أضفتها)":"البدء من جديد: يحذف المحفوظ والمراجعات والأخطاء والختمة وسجلّ العادات (تبقى الإعدادات والعادات التي أضفتها)"}</span><button class="btn ghost" id="reset" style="border-color:var(--red);color:var(--red);flex:none">مسح</button></div>
      <div id="resetConfirm" class="hidden" style="margin-top:10px"><p class="meta">هل أنت متأكد؟ سيُحذف كل تقدّمك من كل أجهزتك.</p><div class="row-btns" style="justify-content:flex-start"><button class="btn" id="resetYes" style="background:var(--red)">نعم، احذف</button><button class="btn ghost" id="resetNo">لا</button></div></div>
    </div>`;
  const pSave=()=>{const u=document.getElementById("pUnit").value;let a=Number(document.getElementById("pAmt").value);if(!(a>0))a=1;if(u==="ayah")a=Math.max(1,Math.round(a));else a=Math.max(0.25,Math.round(a*4)/4);state.plan={on:document.getElementById("pOn").checked,amount:a,unit:u,order:document.getElementById("pOrd").value,days:state.plan.days};save();renderSettings();};
  document.querySelectorAll("[data-pday]").forEach(b=>b.onclick=()=>{const i=Number(b.dataset.pday);let ds=state.plan.days.slice();ds=ds.includes(i)?ds.filter(x=>x!==i):[...ds,i].sort();if(!ds.length){toast("اختر يومًا واحدًا على الأقل");return;}state.plan.days=ds;save();renderSettings();});
  document.querySelectorAll("[data-pdays]").forEach(b=>b.onclick=()=>{state.plan.days=b.dataset.pdays.split("").map(Number).sort();save();renderSettings();});
  ["pOn","pAmt","pUnit","pOrd"].forEach(id=>{const e=document.getElementById(id);if(e)e.onchange=pSave;});
  {const ge=document.getElementById("goal");if(ge)ge.onchange=e=>{const v=Math.min(60,Math.max(0.5,Math.round((Number(e.target.value)||3)*2)/2));state.goalH=v;state.goalSet=true;e.target.value=v;save();toast("الهدف: "+fmtH(v)+" حزب في اليوم");};}
  document.getElementById("icsFile").onchange=e=>{const f=e.target.files&&e.target.files[0];if(!f)return;const rd=new FileReader();rd.onload=()=>{const r=parseIcs(String(rd.result||""));const n=Object.keys(r.days).length;
    if(!n){toast("لم أجد مواقيت صلاة في هذا الملف. تأكد أنه ملف ‎.ics من Mawaqit.");return;}
    const base=prayerData(); const keep={}; const cut=addDays(today(),-7);
    for(const [d,a] of Object.entries(base.days)) if(d>=cut) keep[d]=a;
    state.prayer={name:r.name,tz:r.tz,days:Object.assign(keep,r.days)}; save(); renderSettings();
    const ks=Object.keys(r.days).sort(); toast("أُضيفت مواقيت "+n+" يومًا: من "+fmtDate(ks[0])+" إلى "+fmtDate(ks[ks.length-1]));};
    rd.readAsText(f);e.target.value="";};
  document.getElementById("restoreFile").onchange=e=>{const f=e.target.files&&e.target.files[0];if(!f)return;const rd=new FileReader();rd.onload=()=>{let obj=null;try{obj=JSON.parse(rd.result);}catch(_){}
    const box=document.getElementById("restoreBox");
    if(!obj||typeof obj!=="object"||!(obj.items||obj.surahs)){box.className="";box.innerHTML=`<p class="meta" style="color:var(--red)">هذا الملف ليس نسخة احتياطية من هذا التطبيق.</p>`;return;}
    const r=normalize(obj); pendingRestore=r;
    box.className="";box.innerHTML=`<div class="split-box" style="margin-top:8px"><p class="meta" style="margin-top:0">في هذه النسخة: المحفوظ (${segTxt(Object.keys(r.items).length)})${r.kh?"، وختمة جارية":""}${obj.updatedAt?"، آخر تعديل فيها: "+new Date(obj.updatedAt).toLocaleString("ar-u-nu-latn",{day:"numeric",month:"long",hour:"2-digit",minute:"2-digit"}):""}. سيحلّ محلّ كل ما في التطبيق الآن، على كل أجهزتك.</p>
      <div class="row-btns" style="justify-content:flex-start"><button class="btn" data-restore="yes">استرجاع</button><button class="btn ghost" data-restore="no">إلغاء</button></div></div>`;};
    rd.readAsText(f);e.target.value="";};
  const so=document.getElementById("sOut"); if(so) so.onclick=signOut;
  const si=document.getElementById("sIn"); if(si) si.onclick=()=>{try{localStorage.removeItem("qa-guest");}catch(e){}showAuth("login");};
  const mSw=document.getElementById("modeSw"); if(mSw){mSw.onclick=()=>document.getElementById("modeConfirm").classList.toggle("hidden");document.getElementById("modeNo").onclick=()=>document.getElementById("modeConfirm").classList.add("hidden");document.getElementById("modeYes").onclick=()=>setMode(HUF()?"hifdh":"huffaz");}
  const rSave=()=>{state.recent={on:document.getElementById("rOn").checked,days:Number(document.getElementById("rDays").value)||30};save();renderSettings();};
  {const e1=document.getElementById("rOn"),e2=document.getElementById("rDays");if(e1)e1.onchange=rSave;if(e2)e2.onchange=rSave;}
  document.getElementById("reset").onclick=()=>document.getElementById("resetConfirm").classList.remove("hidden");
  document.getElementById("resetNo").onclick=()=>document.getElementById("resetConfirm").classList.add("hidden");
  document.getElementById("resetYes").onclick=()=>{state=freshState({goalH:state.goalH,goalSet:state.goalSet,plan:state.plan,habits:state.habits,recent:state.recent,mode:state.mode}); save();setView(HUF()?"stats":"today");toast("تم حذف كل شيء");};
}

let firstView=false;
function render(){
  if(modeReady&&!firstView){firstView=true;if(HUF()&&view==="today"){setView("stats");return;}}
  ["today","list","stats","mushaf","adhkar","khatma","settings","qada","mquiz","tests","week"].forEach(v=>document.getElementById("v-"+v).classList.toggle("hidden",v!==view));
  if(view==="today") renderToday(); else if(view==="list") renderList(); else if(view==="mushaf") renderMushaf(); else if(view==="adhkar") renderAdhkar(); else if(view==="khatma") renderKhatma(); else if(view==="settings") renderSettings(); else if(view==="qada") renderQada(); else if(view==="mquiz") renderMQ(); else if(view==="tests") renderTests(); else if(view==="week") renderWeek(); else renderStats();
  applyModeUI(); renderModePicker();
}

function saveNoteFrom(id){
  const ta=document.querySelector(`textarea[data-note="${id}"]`);
  if(ta&&state.items[id]){const v=ta.value.trim();if(v!==(state.items[id].note||"")){state.items[id].note=v;save();}}
}

