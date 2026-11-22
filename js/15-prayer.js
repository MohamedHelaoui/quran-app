// ---- Prayer times (from the mosque's Mawaqit calendar file) ----
const PRAYER_BUILTIN={"name":"مواقيت - مسجد السلام","tz":"Europe/Berlin","days":{"2026-11-01":["202611010445","202611011109","202611011343","202611011607","202611011737",null],"2026-11-02":["202611020447","202611021109","202611021342","202611021606","202611021736",null],"2026-11-03":["202611030448","202611031109","202611031341","202611031604","202611031734",null],"2026-11-04":["202611040449","202611041109","202611041340","202611041603","202611041733",null],"2026-11-05":["202611050451","202611051109","202611051339","202611051601","202611051731",null],"2026-11-06":["202611060452","202611061109","202611061337","202611061600","202611061730",1],"2026-11-07":["202611070453","202611071110","202611071336","202611071558","202611071728",null],"2026-11-08":["202611080455","202611081110","202611081335","202611081557","202611081727",null],"2026-11-09":["202611090456","202611091110","202611091334","202611091556","202611091726",null],"2026-11-10":["202611100457","202611101110","202611101333","202611101554","202611101724",null],"2026-11-11":["202611110459","202611111110","202611111332","202611111553","202611111723",null],"2026-11-12":["202611120500","202611121110","202611121331","202611121552","202611121722",null],"2026-11-13":["202611130501","202611131110","202611131330","202611131550","202611131720",1],"2026-11-14":["202611140503","202611141110","202611141329","202611141549","202611141719",null],"2026-11-15":["202611150504","202611151110","202611151328","202611151548","202611151718",null],"2026-11-16":["202611160505","202611161111","202611161327","202611161547","202611161717",null],"2026-11-17":["202611170507","202611171111","202611171326","202611171546","202611171716",null],"2026-11-18":["202611180508","202611181111","202611181325","202611181545","202611181715",null],"2026-11-19":["202611190509","202611191111","202611191325","202611191544","202611191714",null],"2026-11-20":["202611200510","202611201111","202611201324","202611201543","202611201713",1],"2026-11-21":["202611210512","202611211112","202611211323","202611211542","202611211712",null],"2026-11-22":["202611220513","202611221112","202611221322","202611221541","202611221711",null],"2026-11-23":["202611230514","202611231112","202611231322","202611231540","202611231710",null],"2026-11-24":["202611240515","202611241113","202611241321","202611241539","202611241709",null],"2026-11-25":["202611250516","202611251113","202611251320","202611251538","202611251708",null],"2026-11-26":["202611260518","202611261113","202611261320","202611261538","202611261708",null],"2026-11-27":["202611270519","202611271113","202611271319","202611271537","202611271707",1],"2026-11-28":["202611280520","202611281114","202611281319","202611281536","202611281706",null],"2026-11-29":["202611290521","202611291114","202611291318","202611291536","202611291706",null],"2026-11-30":["202611300522","202611301115","202611301318","202611301535","202611301705",null],"2026-12-01":["202612010523","202612011115","202612011318","202612011535","202612011705",null],"2026-12-02":["202612020524","202612021115","202612021317","202612021534","202612021704",null],"2026-12-03":["202612030525","202612031116","202612031317","202612031534","202612031704",null],"2026-12-04":["202612040526","202612041116","202612041317","202612041534","202612041704",1],"2026-12-05":["202612050527","202612051116","202612051316","202612051533","202612051703",null],"2026-12-06":["202612060528","202612061117","202612061316","202612061533","202612061703",null],"2026-12-07":["202612070529","202612071117","202612071316","202612071533","202612071703",null],"2026-12-08":["202612080530","202612081118","202612081316","202612081533","202612081703",null],"2026-12-09":["202612090531","202612091118","202612091316","202612091532","202612091702",null],"2026-12-10":["202612100532","202612101119","202612101316","202612101532","202612101702",null],"2026-12-11":["202612110533","202612111119","202612111316","202612111532","202612111702",1],"2026-12-12":["202612120534","202612121120","202612121316","202612121532","202612121702",null],"2026-12-13":["202612130534","202612131120","202612131316","202612131532","202612131702",null],"2026-12-14":["202612140535","202612141121","202612141316","202612141533","202612141703",null],"2026-12-15":["202612150536","202612151121","202612151316","202612151533","202612151703",null],"2026-12-16":["202612160537","202612161121","202612161316","202612161533","202612161703",null],"2026-12-17":["202612170537","202612171122","202612171316","202612171533","202612171703",null],"2026-12-18":["202612180538","202612181122","202612181317","202612181534","202612181704",1],"2026-12-19":["202612190539","202612191123","202612191317","202612191534","202612191704",null],"2026-12-20":["202612200539","202612201123","202612201317","202612201534","202612201704",null],"2026-12-21":["202612210540","202612211124","202612211318","202612211535","202612211705",null],"2026-12-22":["202612220540","202612221124","202612221318","202612221535","202612221705",null],"2026-12-23":["202612230541","202612231125","202612231319","202612231536","202612231706",null],"2026-12-24":["202612240541","202612241125","202612241319","202612241536","202612241706",null],"2026-12-25":["202612250541","202612251126","202612251320","202612251537","202612251707",1],"2026-12-26":["202612260542","202612261126","202612261320","202612261538","202612261708",null],"2026-12-27":["202612270542","202612271127","202612271321","202612271539","202612271709",null],"2026-12-28":["202612280542","202612281127","202612281322","202612281539","202612281709",null],"2026-12-29":["202612290543","202612291128","202612291322","202612291540","202612291710",null],"2026-12-30":["202612300543","202612301128","202612301323","202612301541","202612301711",null],"2026-12-31":["202612310543","202612311129","202612311324","202612311542","202612311712",null]}}
;
const PR_NAMES=["الفجر","الظهر","العصر","المغرب","العشاء"];
function prayerData(){return state.prayer&&state.prayer.days&&Object.keys(state.prayer.days).length?state.prayer:PRAYER_BUILTIN;}
function prEpoch(s){return Date.UTC(+s.slice(0,4),+s.slice(4,6)-1,+s.slice(6,8),+s.slice(8,10),+s.slice(10,12));}
function prTime(s){try{return new Date(prEpoch(s)).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit",hour12:false,timeZone:prayerData().tz||"Europe/Berlin"});}catch(e){return s.slice(8,10)+":"+s.slice(10,12);}}
function prayersOn(d){const a=prayerData().days[d];if(!a)return null;return a.slice(0,5).map((x,i)=>({i,n:(i===1&&a[5])?"الجمعة":PR_NAMES[i],s:x,t:prEpoch(x)}));}
function nextPrayer(){const now=Date.now();for(let k=0;k<2;k++){const ps=prayersOn(addDays(today(),k));if(!ps)continue;const nx=ps.find(p=>p.t>now);if(nx)return nx;}return null;}
function prLastDay(){const ks=Object.keys(prayerData().days).sort();return ks[ks.length-1]||"";}
function untilTxt(ms){const m=Math.max(0,Math.round(ms/60000));if(m<1)return "الآن";if(m<60)return "بعد "+(m===1?"دقيقة":m===2?"دقيقتين":m<=10?m+" دقائق":m+" دقيقة");const h=Math.floor(m/60),r=m%60;return "بعد "+(h===1?"ساعة":h===2?"ساعتين":h+" ساعات")+(r?" و"+(r===1?"دقيقة":r===2?"دقيقتين":r<=10?r+" دقائق":r+" دقيقة"):"");}
function prayerStripHTML(){
  const ps=prayersOn(today()); const pd=prayerData(); const last=prLastDay();
  const soon=last&&diffDays(last,today())<=7;
  if(!ps) return `<div class="pray"><div class="pray-h"><span>مواقيت الصلاة</span></div><p class="meta" style="margin:4px 0 0">لا توجد مواقيت محفوظة لهذا اليوم. أضف ملف المواقيت من <button class="linkbtn" data-go="settings">الإعدادات</button>.</p></div>`;
  const now=Date.now(); const nx=nextPrayer();
  return `<div class="pray" id="prayStrip"><div class="pray-h"><span>${esc(String(pd.name||"مواقيت الصلاة").replace(/^مواقيت\s*-\s*/,""))} · <button class="linkbtn" data-go="qada" style="font-size:12.5px">${state.qada&&qadaLeftTotal()?"الفوائت: "+qadaLeftTotal():"الفوائت"}</button></span>${nx?`<span class="nx">${nx.n} ${untilTxt(nx.t-now)}</span>`:""}</div>
    <div class="pray-row">${ps.map(p=>`<div class="pc${p.t<=now?" past":""}${nx&&nx.s===p.s?" next":""}"><span class="pn">${p.n}</span><span class="pt">${prTime(p.s)}</span></div>`).join("")}</div>
    ${soon?`<p class="help" style="margin:8px 0 0">المواقيت المحفوظة تنتهي في ${fmtDate(last)}. أضف ملف الشهر القادم من <button class="linkbtn" data-go="settings">الإعدادات</button>.</p>`:""}</div>`;
}
setInterval(()=>{const el=document.getElementById("prayStrip");if(el&&view==="today"){el.outerHTML=prayerStripHTML();}},30000);
function parseIcs(txt){
  txt=txt.replace(/\r\n[ \t]/g,"");
  const name=((txt.match(/X-WR-CALNAME:(.*)/)||[])[1]||"").trim(); const tz=((txt.match(/X-WR-TIMEZONE:(.*)/)||[])[1]||"").trim();
  const byUid={fajr:0,dhuhr:1,dohr:1,asr:2,maghrib:3,isha:4};
  const bySum=[["الفجر",0],["الصبح",0],["fajr",0],["الجمعة",1],["الظهر",1],["dhuhr",1],["jumu",1],["العصر",2],["asr",2],["المغرب",3],["maghrib",3],["العشاء",4],["isha",4]];
  const days={};
  for(const ev of txt.split("BEGIN:VEVENT").slice(1)){
    const st=ev.match(/DTSTART[^:\n]*:(\d{8})T(\d{4})\d\dZ/); if(!st) continue;
    const sum=(((ev.match(/SUMMARY[^:\n]*:(.*)/)||[])[1])||"").trim().toLowerCase();
    const uid=(ev.match(/UID:[^\n]*?-(\w+)@/)||[])[1];
    let k=uid&&uid.toLowerCase() in byUid?byUid[uid.toLowerCase()]:undefined;
    if(k===undefined){const f=bySum.find(([w])=>sum.includes(w));if(f)k=f[1];}
    if(k===undefined) continue;
    const d=st[1].slice(0,4)+"-"+st[1].slice(4,6)+"-"+st[1].slice(6,8);
    const a=days[d]||(days[d]=[null,null,null,null,null,null]); a[k]=st[1]+st[2]; if(sum.includes("الجمعة")||sum.includes("jumu"))a[5]=1;
  }
  for(const d of Object.keys(days)) if(days[d].slice(0,5).some(x=>!x)) delete days[d];
  return {name:name||"مواقيت الصلاة",tz:tz||"Europe/Berlin",days};
}

// ---- Missed prayers (qada) ----
let qadaEdit=false;
function qadaToday(){
  const q=state.qada; if(!q) return null;
  const done=q.log[today()]||[0,0,0,0,0];
  const quota=q.left.map((l,i)=>Math.min(q.perDay,l+done[i]));
  const qT=quota.reduce((a,b)=>a+b,0), dT=done.reduce((a,x,i)=>a+Math.min(x,quota[i]),0);
  return {done,quota,qT,dT,ok:qT>0&&dT>=qT};
}
function qadaLeftTotal(){return state.qada?state.qada.left.reduce((a,b)=>a+b,0):0;}
function prayersTxt(n){if(n===1)return "صلاة واحدة";if(n===2)return "صلاتان";if(n<=10)return n+" صلوات";return n+" صلاة";}
function qadaMark(i,delta){
  const q=state.qada; const t=today(); const d=(q.log[t]||[0,0,0,0,0]).slice();
  if(delta>0){ if(q.left[i]<=0) return; q.left[i]--; d[i]++; }
  else { if(d[i]<=0) return; q.left[i]++; d[i]--; }
  if(d.some(x=>x))q.log[t]=d; else delete q.log[t];
  const ks=Object.keys(q.log).sort(); while(ks.length>400) delete q.log[ks.shift()];
  save(); renderQada();
  if(delta>0){ const qt=qadaToday(); toast(qadaLeftTotal()===0?"أتممت قضاء كل الفوائت، تقبّل الله منك 🌿":"قضيت "+PR_NAMES[i]+" · بقي منها "+q.left[i]+(qt.ok?" · أتممت قضاء اليوم ✓":""),false);
    document.getElementById("toast").insertAdjacentHTML("beforeend",`<button id="undoQ">تراجع</button>`); document.getElementById("undoQ").onclick=()=>{qadaMark(i,-1);hideToast();}; }
}
function renderQada(){
  const el=document.getElementById("v-qada"); const q=state.qada;
  const back=`<button class="linkbtn" data-go="today" style="margin-bottom:8px">→ اليوم</button>`;
  if(!q||qadaEdit){
    const v=q?q.left:[0,0,0,0,0];
    el.innerHTML=back+`<h2 class="page-t">قضاء الفوائت</h2>
      <div class="card"><div style="font-weight:600;margin-bottom:4px">${q?"تعديل عدد الفوائت المتبقية":"كم عليك من كل صلاة؟"}</div>
        <div class="qa-inputs">${PR_NAMES.map((n,i)=>`<label><span>${n}</span><input type="number" min="0" step="1" id="qa${i}" value="${v[i]}"></label>`).join("")}</div>
        <div class="split-box" style="margin-top:12px"><div style="font-weight:600;margin-bottom:4px">لا تعرف العدد بالضبط؟ احسبه من المدة</div>
          <div class="seg-form"><label>من <input type="date" id="qaFrom" style="width:auto"></label><label>إلى <input type="date" id="qaTo" style="width:auto"></label></div>
          <div class="seg-form" style="margin-top:6px"><span class="meta">أو:</span><label><input type="number" min="0" id="qaY" placeholder="0"> سنة</label><label><input type="number" min="0" id="qaM" placeholder="0"> شهر</label><label><input type="number" min="0" id="qaD" placeholder="0"> يوم</label></div>
          <p class="help" id="qaEst">الحساب: كل يوم = صلاة واحدة من كل فرض.</p>
          <button class="btn ghost" id="qaFill">ضع هذا العدد في الخانات</button></div>
        <div class="row-btns" style="justify-content:flex-start"><button class="btn" id="qaSave">حفظ</button>${q?`<button class="btn ghost" id="qaCancel">إلغاء</button>`:""}</div>
        <p class="help">العدد تقديري، فاحتط فيه. أما أحكام القضاء، كالترتيب بين الفوائت، فارجع فيها إلى شيخك.</p>
      </div>`;
    const est=()=>{let days=0;const f=document.getElementById("qaFrom").value,t=document.getElementById("qaTo").value;
      if(f&&t&&t>=f) days=diffDays(t,f)+1;
      else{const y=Number(document.getElementById("qaY").value)||0,m=Number(document.getElementById("qaM").value)||0,d=Number(document.getElementById("qaD").value)||0;days=Math.round(y*365.25+m*30.44+d);}
      document.getElementById("qaEst").textContent=days?("المدة: "+daysTxt(days)+" ← "+prayersTxt(days)+" من كل فرض ("+prayersTxt(days*5)+" في المجموع)."+(document.getElementById("qaFrom").value?"":" (السنة 365 يومًا).")):"الحساب: كل يوم = صلاة واحدة من كل فرض.";return days;};
    ["qaFrom","qaTo","qaY","qaM","qaD"].forEach(id=>document.getElementById(id).oninput=est);
    document.getElementById("qaFill").onclick=()=>{const d=est();if(!d){toast("أدخل المدة أولًا");return;}for(let i=0;i<5;i++)document.getElementById("qa"+i).value=d;};
    document.getElementById("qaSave").onclick=()=>{const v=[0,1,2,3,4].map(i=>Math.max(0,Math.round(Number(document.getElementById("qa"+i).value)||0)));
      if(!v.some(x=>x)&&!q){toast("أدخل عدد الفوائت أولًا");return;}
      if(q){const doneAll=q.init.map((x,i)=>Math.max(0,x-q.left[i]));q.left=v;q.init=v.map((x,i)=>x+doneAll[i]);}
      else state.qada={init:v.slice(),left:v.slice(),perDay:1,log:{}};
      qadaEdit=false;save();renderQada();toast("حُفظ عدد الفوائت");};
    const c=document.getElementById("qaCancel"); if(c) c.onclick=()=>{qadaEdit=false;renderQada();};
    return;
  }
  const L=qadaLeftTotal(), I=q.init.reduce((a,b)=>a+b,0), doneAll=I-L; const pct=I?Math.round(doneAll/I*100):100;
  const qt=qadaToday(); const maxLeft=Math.max(...q.left); const finishDays=Math.ceil(maxLeft/q.perDay);
  el.innerHTML=back+`<h2 class="page-t">قضاء الفوائت</h2>
    <div class="card"><div class="hero" style="margin-bottom:6px"><div><div class="lbl">المتبقي</div><div class="big" style="font-size:34px">${L?prayersTxt(L):"أتممت ✓"}</div>
      <div class="lbl">قضيت ${doneAll} من ${I} (${pct}%)</div></div>
      ${L?`<div style="text-align:left;white-space:nowrap"><div class="lbl">تنتهي تقريبًا في</div><div style="font-weight:600">${fmtDate(addDays(today(),finishDays-(qt.ok?0:1)))}${finishDays>300?" "+addDays(today(),finishDays).slice(0,4):""}</div><div class="lbl">بعد ${daysTxt(finishDays)}</div></div>`:""}</div>
      <div class="progress"><i style="width:${pct}%"></i></div></div>
    ${L?`<div class="card hifdh" style="margin-top:12px"><div class="lbl">قضاء اليوم · ${qt.dT} / ${qt.qT}</div>
      <div class="qa-rows">${PR_NAMES.map((n,i)=>{const quota=qt.quota[i],done=qt.done[i];if(!q.left[i]&&!done)return "";const ok=done>=quota;
        return `<div class="qa-row${ok?" ok":""}"><div class="grow"><div class="name" style="font-size:19px">${n}</div><div class="meta">اليوم: ${Math.min(done,quota)} / ${quota} · بقي ${q.left[i]} من ${q.init[i]}</div>
          <div class="progress" style="margin-top:6px;height:4px"><i style="width:${q.init[i]?Math.round((q.init[i]-q.left[i])/q.init[i]*100):100}%"></i></div></div>
          ${done?`<button class="icon-nav" data-qaundo="${i}" title="إنقاص" aria-label="إنقاص واحدة">−</button>`:""}
          <button class="tap" data-qa="${i}" ${q.left[i]?"":"disabled"} style="min-width:92px;font-size:15px">${q.left[i]?(ok?"+ قضيت":"قضيت ✓"):"انتهت"}</button></div>`;}).join("")}</div></div>`:
      `<div class="card hifdh" style="margin-top:12px;text-align:center"><div class="name">تقبّل الله منك 🌿</div><p class="meta">لم يبق عليك شيء من الفوائت المسجّلة.</p></div>`}
    <div class="card" style="margin-top:10px"><div style="font-weight:600">الخطة اليومية</div>
      <div class="setting"><label for="qaPer">كم يومًا من الفوائت تقضي كل يوم؟</label><input type="number" id="qaPer" min="1" max="50" value="${q.perDay}"></div>
      <p class="help">${q.perDay===1?"يوم واحد = صلاة واحدة من كل فرض (5 صلوات يوميًا).":daysTxt(q.perDay)+" = "+prayersTxt(q.perDay)+" من كل فرض ("+prayersTxt(q.perDay*5)+" يوميًا)."} بهذا المعدّل تنتهي بعد ${daysTxt(finishDays||0)}.</p>
      <div class="row-btns" style="justify-content:flex-start"><button class="btn ghost" id="qaEdit">تعديل الأعداد</button><button class="linkbtn" id="qaDel" style="color:var(--red)">حذف العدّاد</button></div>
    </div>`;
  document.getElementById("qaPer").onchange=e=>{q.perDay=Math.min(50,Math.max(1,Math.round(Number(e.target.value)||1)));save();renderQada();};
  document.getElementById("qaEdit").onclick=()=>{qadaEdit=true;renderQada();};
  const dl=document.getElementById("qaDel"); dl.onclick=()=>{if(dl.dataset.confirm){state.qada=null;save();renderQada();toast("حُذف عدّاد الفوائت");}else{dl.dataset.confirm="1";dl.textContent="اضغط مرة أخرى للحذف";setTimeout(()=>{if(dl.isConnected){delete dl.dataset.confirm;dl.textContent="حذف العدّاد";}},3000);}};
}

