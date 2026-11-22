// ---- Date helpers (local days) ----
function dayStr(d){const z=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+z(d.getMonth()+1)+"-"+z(d.getDate());}
function today(){return dayStr(new Date());}
function addDays(s,n){const [y,m,d]=s.split("-").map(Number);return dayStr(new Date(y,m-1,d+n));}
function diffDays(a,b){const p=s=>{const [y,m,d]=s.split("-").map(Number);return new Date(y,m-1,d).getTime();};return Math.round((p(a)-p(b))/86400000);}
function ar(n){return String(n);}
function ayatTxt(n){if(n===1)return "آية واحدة";if(n===2)return "آيتان";if(n>=3&&n<=10)return n+" آيات";return n+" آية";}
function timesTxt(n){if(!n)return "لم تُراجع بعد";if(n===1)return "روجعت مرة واحدة";if(n===2)return "روجعت مرتين";if(n<=10)return "روجعت "+n+" مرات";return "روجعت "+n+" مرة";}
function segTxt(n){if(n===1)return "مقطع واحد";if(n===2)return "مقطعان";if(n<=10)return n+" مقاطع";return n+" مقطعًا";}
function daysTxt(n){n=Number(n);if(n===1)return "يوم واحد";if(n===2)return "يومين";if(n>=3&&n<=10)return n+" أيام";return n+" يومًا";}

