// ---- 15-line mushaf: every line as on the printed page ----
// The KFGQPC data gives the first and last line of each ayah. Where an ayah runs over several lines, the
// words are shared out between them by their width in the mushaf font, so each line is about as full as
// the others on the page (the printed lines are all full). Approximate inside long ayat, exact at ayah ends.
let LNQ=null, lnLoading=null, m15=(()=>{try{return localStorage.getItem("quran-15")!=="0";}catch(e){return true;}})();
const L15=new Map(), WCACHE=new Map(); let mCtx=null, fontWait=false;
function loadLines(){
  if(LNQ||lnLoading) return;
  lnLoading=fetch("lines.json").then(r=>{if(!r.ok)throw new Error("http");return r.json();}).then(d=>{LNQ=d.q;L15.clear();if(view==="mushaf")renderMushaf();}).catch(()=>{lnLoading=null;});
}
function lnFont(){return isH()?"Hafs":"Qaloon";}
function on15(){
  if(!m15) return false;
  const LD=isH()?(QH&&QH.l):LNQ; if(!LD){if(!isH())loadLines();return false;}
  // widths are measured with the mushaf font, so wait for it once
  if(document.fonts&&!document.fonts.check("20px "+lnFont())){
    if(!fontWait){fontWait=true;document.fonts.load("20px "+lnFont()).then(()=>{fontWait=false;L15.clear();WCACHE.clear();if(view==="mushaf")renderMushaf();}).catch(()=>{fontWait=false;});}
    return false;
  }
  return true;
}
function lnData(){return isH()?QH.l:LNQ;}
function wWidth(t){
  const f=lnFont(), k=f+"|"+t; let v=WCACHE.get(k);
  if(v===undefined){if(!mCtx)mCtx=document.createElement("canvas").getContext("2d");mCtx.font="100px "+f;v=mCtx.measureText(t).width;WCACHE.set(k,v);}
  return v;
}
function needBasmala(sn){return sn!==9&&!(isH()&&sn===1);}
// lines of page pg: [{t:"x",s,e} text tokens s..e-1 | {t:"h",sn} surah title | {t:"b"} basmala | {t:"-"}], plus tokens
function build15(pg){
  const key=RIW+pg; if(L15.has(key)) return L15.get(key);
  const LD=lnData(), D=MD(), n=pg<=2?8:15;
  const items=[];
  const wordsOf=(sn,a)=>ayaParts(D.t[sn-1][a-1]);
  if(pg>1){const pl=MPI()[pg-1], last=pl[pl.length-1]; const r=last&&LD[last[0]-1][last[1]-1];
    if(r&&r[2]){const pb=build15(pg-1); const P=wordsOf(last[0],last[1]); items.push({sn:last[0],a:last[1],ls:1,le:r[1],w0:pb.carry,w1:P.words.length-1,P});}}
  for(const [sn,a] of MPI()[pg]){const r=LD[sn-1][a-1]; const P=wordsOf(sn,a); items.push({sn,a,ls:r[0],le:r[2]?n:r[1],w0:0,w1:P.words.length-1,out:!!r[2],P});}
  // tokens: one per word, the ayah number joined to its last word
  const toks=[], sp=wWidth(" ");
  items.forEach((it,k)=>{it.t0=toks.length;for(let w=it.w0;w<=it.w1;w++)toks.push({k,w,wd:wWidth(it.P.words[w])+(w===it.P.words.length-1?wWidth(it.P.num):0)});it.t1=toks.length-1;});
  const pre=[0]; toks.forEach(t=>pre.push(pre[pre.length-1]+t.wd));
  const segW=(s,e)=>e>s?pre[e]-pre[s]+(e-s-1)*sp:0;
  const used=[]; for(let L=1;L<=n;L++) used.push(items.some(it=>it.ls<=L&&L<=it.le));
  const textLines=[]; for(let L=1;L<=n;L++) if(used[L-1]) textLines.push(L);
  const outIt=items.find(it=>it.out);
  // the width of a full line on this page
  let W;
  if(outIt){const before=segW(0,outIt.t0); const full=textLines.filter(L=>L<outIt.ls).length; W=full?before/full:segW(0,toks.length)/Math.max(1,textLines.length);}
  else W=(pre[toks.length]+Math.max(0,toks.length-textLines.length)*sp)/Math.max(1,textLines.length);
  const lines=[]; let s=0, carry=0;
  textLines.forEach((L,ix)=>{
    const lastLine=ix===textLines.length-1;
    let e;
    if(lastLine&&!outIt){e=toks.length;}
    else{
      let A=s+1, B=toks.length;
      for(const it of items){
        if(it.ls<=L) A=Math.max(A,it.t0+1);
        if(it.le<=L&&!it.out) A=Math.max(A,it.t1+1);   // an ayah running onto the next page does not end here
        if(it.ls>=L+1) B=Math.min(B,it.t0);
        if(it.le>=L+1&&!(lastLine&&it.out)) B=Math.min(B,it.t1);
      }
      if(lastLine&&outIt) B=Math.min(B,outIt.t1);
      if(B<A) B=A;
      e=A; let best=Infinity;
      for(let c=A;c<=B;c++){const d=Math.abs(segW(s,c)-W); if(d<best){best=d;e=c;}}
    }
    lines[L-1]={t:"x",s,e}; s=e;
    if(lastLine&&outIt) carry=outIt.w0+(e-outIt.t0);
  });
  // empty lines: the title and basmala of the surah that starts below them (or on the next page)
  for(let L=1;L<=n;L++){
    if(used[L-1]) continue;
    let N=L+1; while(N<=n&&!used[N-1]) N++;
    let sn=null;
    if(N<=n){const tk=toks[lines[N-1].s]; const it=tk&&items[tk.k]; if(it&&it.a===1&&it.w0===0&&tk.w===0) sn=it.sn;}
    else if(pg<604){const nx=MPI()[pg+1][0]; if(nx&&nx[1]===1) sn=nx[0];}
    if(sn===null){lines[L-1]={t:"-"};continue;}
    const gap=N-L; lines[L-1]=needBasmala(sn)?(gap===1?{t:"b"}:{t:"h",sn}):{t:"h",sn};
  }
  const res={n,lines,toks,items,carry,center:pg<=2};
  L15.set(key,res); return res;
}
// HTML of a page in 15-line mode; cache of ayah HTML is per render
function page15HTML(pg,ayaFn,clsFn,thKey){
  const B=build15(pg); let h="";
  for(const ln of B.lines){
    if(!ln){h+=`<div class="ln"></div>`;continue;}
    if(ln.t==="h"){h+=`<div class="ln lh"><div class="s-head">سورة ${SURAHS[ln.sn-1][0]}</div></div>`;continue;}
    if(ln.t==="b"){h+=`<div class="ln lb">${MD().b}</div>`;continue;}
    if(ln.t==="-"){h+=`<div class="ln"></div>`;continue;}
    let frag="", cur=null, w0=0, w1=-1; const out=[];
    const flush=()=>{if(!cur)return;const A=ayaFn(cur.sn,cur.a);const tk=thKey(cur.sn,cur.a);
      const inner=`<span class="aya${clsFn(cur.sn,cur.a,A)}" data-aya="${cur.sn}:${cur.a}">${A.parts.slice(w0,w1+1).join(" ")}</span>`;
      out.push(tk>=0?`<span class="thsec" data-th="${tk%8}">${inner}</span>`:inner);};
    for(let i=ln.s;i<ln.e;i++){const t=B.toks[i], it=B.items[t.k];
      if(!cur||cur!==it){flush();cur=it;w0=t.w;} w1=t.w;}
    flush();
    h+=`<div class="ln${B.center?" center":""}">${out.join(" ")}</div>`;
  }
  return `<div class="m-text m15-lines">${h}</div>`;
}
