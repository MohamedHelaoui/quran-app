// ---- Mushaf (Qalun, KFGQPC text) ----
let mSel=null;
let mtOpen=false, tfOpen=false, tfTab="j", TF=new Map();
function tfLoad(s){
  if(TF.has(s)) return;
  TF.set(s,"loading");
  fetch("tf/"+s+".json").then(r=>{if(!r.ok)throw new Error("http");return r.json();}).then(d=>{TF.set(s,d);}).catch(()=>{TF.set(s,null);}).then(()=>{if(view==="mushaf"&&tfOpen&&mSel&&mSel.s===s)renderMushaf();else if(view==="khatma")renderKhatma();});
}
function tfFmt(t){return String(t).split(/\n{2,}/).map(x=>"<p>"+esc(x).replace(/\n/g," ").replace(/(﴿[^﴾]*﴾)/g,"<b>$1</b>")+"</p>").join("");}
function tfBoxHTML(L){
  if(!tfOpen) return "";
  tfLoad(L.s); const d=TF.get(L.s);
  const tabs=[["m","معاني المفردات"],["i","إعراب"],["j","الجلالين"]];
  const head=`<div class="seg-ctl" role="group" aria-label="التفسير">${tabs.map(([k,n])=>`<button data-tftab="${k}" class="${tfTab===k?"on":""}">${n}</button>`).join("")}</div>`;
  let body;
  if(d==="loading"||d===undefined) body=`<p class="help">جارٍ التحميل…</p>`;
  else if(d===null) body=`<p class="help">تعذّر التحميل، ويحتاج اتصالًا بالإنترنت في المرة الأولى.</p>`;
  else{
    const r=d[String(L.a)]||{}; let txt=r[tfTab], note="";
    if(!txt&&tfTab==="j"&&r.jp&&d[String(r.jp)]&&d[String(r.jp)].j){txt=d[String(r.jp)].j;note=`<p class="tf-note">هذه الآية مشروحة ضمن تفسير الآية ${r.jp}.</p>`;}
    body=txt?note+`<div class="tf-txt">${tfFmt(txt)}</div>`:`<p class="help">${tfTab==="m"?"لا توجد كلمات غريبة في هذه الآية.":"لا يوجد نصّ لهذه الآية."}</p>`;
  }
  return `<div class="tf-box">${head}${body}</div>`;
}
let THM=null, thOn=(()=>{try{return localStorage.getItem("quran-th-on")!=="0";}catch(e){return true;}})(), thLoading=null;
function loadThemes(){
  if(THM||thLoading) return thLoading;
  thLoading=fetch("themes.json").then(r=>{if(!r.ok)throw new Error("none");return r.json();}).then(d=>{
    const secs=[],at=new Map();
    for(let sn=1;sn<=114;sn++){(d.r&&d.r[sn]||[]).forEach(([f,t,title])=>{const k=secs.length;secs.push({s:sn,from:f,to:t,t:title||"",k});for(let a=f;a<=t;a++)at.set(sn+":"+a,k);});}
    if(secs.length){THM={secs,at};TWS=null;if(view==="mushaf")renderMushaf();else if(view==="khatma")renderKhatma();}
  }).catch(()=>{});
  return thLoading;
}
