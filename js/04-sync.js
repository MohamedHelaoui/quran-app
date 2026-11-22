// ---- Accounts and sync (Supabase) ----
// Each user has one row in public.user_state (RLS: a user can only read and write their own row).
const SB_URL="https://vrvpqfchiihovgmlqngl.supabase.co", SB_KEY="sb_publishable_TgH8dqDjyUgw150Pv9_yQg_39_OXj7G";
let sb=null, sbUser=null, rtChan=null;
function stateRef(uid){return {set:async body=>{const {error}=await sb.from("user_state").upsert({user_id:uid,data:body,updated_at:new Date().toISOString()});
  if(error){throw {code:(error.code==="42501"||error.code==="PGRST301")?"invalid_argument":"unavailable",message:error.message};}}};}
async function pullRemote(){
  if(!sb||!sbUser) return;
  const {data,error}=await sb.from("user_state").select("data").eq("user_id",sbUser.id).maybeSingle();
  if(error){setSync("warn");return;}
  if(data&&data.data){const r=normalize(data.data);if(r.updatedAt>state.updatedAt&&!saveTimer&&!saving&&!unsent())adoptRemote(r);}
  if(syncMode==="warn"&&!saveTimer&&!saving) setSync("ok");
}
function startLocal(){
  sbUser=null; dbRef=null; LS_KEY="quran-review-v1";
  const l=lsLoad(); state=l?normalize(l):freshState(); hideAuth(); modeReady=true; render(); setSync("local");
}
async function startUser(u){
  sbUser=u; LS_KEY="quran-review-v1:"+u.id; hideAuth();
  const l=lsLoad(); state=l?normalize(l):freshState(); render(); setSync("busy");
  const {data,error}=await sb.from("user_state").select("data").eq("user_id",u.id).maybeSingle();
  dbRef=stateRef(u.id);
  if(error){ setSync("warn"); if(hasContent(state)){ saveSeq++; modeReady=true; render(); } return; }
  if(data&&data.data){ const r=normalize(data.data); if(r.updatedAt>state.updatedAt||(!state.updatedAt&&hasContent(r))) adoptRemote(r); else if(hasContent(state)) save(); }
  else {
    // a brand-new account: bring along what was recorded on this device without an account
    if(!hasContent(state)){ try{const g=localStorage.getItem("quran-review-v1");if(g){state=normalize(JSON.parse(g));toast("نُقلت بياناتك من هذا الجهاز إلى حسابك");}}catch(e){} }
    if(hasContent(state)) save();
  }
  if(!saveTimer&&!saving) setSync("ok");
  modeReady=true; render();
  try{ if(rtChan) sb.removeChannel(rtChan);
    rtChan=sb.channel("state-"+u.id).on("postgres_changes",{event:"*",schema:"public",table:"user_state",filter:"user_id=eq."+u.id},p=>{
      const d=p.new&&p.new.data; if(!d) return; const r=normalize(d); if(r.updatedAt>state.updatedAt&&!saveTimer&&!saving) adoptRemote(r); }).subscribe();
  }catch(e){}
}
async function resync(){ if(!sbUser||!dbRef) return; if(unsent()&&!saving){ await flush(); } await pullRemote(); }
document.addEventListener("visibilitychange",()=>{if(!document.hidden)resync();});
window.addEventListener("online",()=>{toast("عاد الاتصال، تُرسَل تغييراتك");resync();});
window.addEventListener("offline",()=>{setSync("warn");});
async function signOut(){try{await sb.auth.signOut();}catch(e){} try{localStorage.removeItem("qa-guest");}catch(e){} location.reload();}

// sign-in screen
let authMode="login";
function hideAuth(){const a=document.getElementById("auth");if(a)a.remove();}
function showAuth(mode,msg){
  authMode=mode||"login"; hideAuth();
  const T={login:["تسجيل الدخول","دخول"],signup:["حساب جديد","إنشاء الحساب"],reset:["استعادة كلمة السر","أرسل رابط الاستعادة"],newpass:["كلمة سر جديدة","حفظ كلمة السر"]}[authMode];
  document.body.insertAdjacentHTML("beforeend",`<div id="auth" class="auth"><form class="auth-box" id="authForm" novalidate>
    <div class="auth-h"><div class="auth-t">مراجعة القرآن</div><div class="auth-s">برواية قالون عن نافع</div></div>
    ${authMode==="login"||authMode==="signup"?`<div class="seg-ctl auth-tabs"><button type="button" data-am="login" class="${authMode==="login"?"on":""}">تسجيل الدخول</button><button type="button" data-am="signup" class="${authMode==="signup"?"on":""}">حساب جديد</button></div>`:`<div class="page-t" style="margin:4px 0 8px">${T[0]}</div>`}
    ${authMode!=="newpass"?`<label class="auth-f">البريد الإلكتروني<input type="email" id="aEmail" autocomplete="email" required dir="ltr"></label>`:""}
    ${authMode!=="reset"?`<label class="auth-f">${authMode==="newpass"?"كلمة السر الجديدة":"كلمة السر"}<input type="password" id="aPass" autocomplete="${authMode==="login"?"current-password":"new-password"}" required minlength="6" dir="ltr"></label>`:""}
    <p class="auth-msg" id="aMsg" role="status">${msg?esc(msg):""}</p>
    <button class="btn" type="submit" id="aGo" style="width:100%;padding:11px">${T[1]}</button>
    ${authMode==="login"?`<button type="button" class="linkbtn" data-am="reset" style="margin-top:10px">نسيت كلمة السر؟</button>`:authMode!=="signup"?`<button type="button" class="linkbtn" data-am="login" style="margin-top:10px">العودة إلى تسجيل الدخول</button>`:""}
    <div class="auth-guest"><button type="button" class="linkbtn" id="aGuest">متابعة دون حساب</button><span class="meta">تُحفظ بياناتك على هذا الجهاز فقط</span></div>
  </form></div>`);
  document.querySelectorAll("#auth [data-am]").forEach(b=>b.onclick=()=>showAuth(b.dataset.am));
  document.getElementById("aGuest").onclick=()=>{try{localStorage.setItem("qa-guest","1");}catch(e){}startLocal();};
  document.getElementById("authForm").onsubmit=async e=>{e.preventDefault();
    const em=(document.getElementById("aEmail")||{}).value, pw=(document.getElementById("aPass")||{}).value; const m=document.getElementById("aMsg"); const go=document.getElementById("aGo");
    const say=(t,ok)=>{m.textContent=t;m.className="auth-msg"+(ok?" ok":"");};
    if(authMode!=="newpass"&&!/^\S+@\S+\.\S+$/.test(em||"")){say("أدخل بريدًا إلكترونيًا صحيحًا");return;}
    if(authMode!=="reset"&&(!pw||pw.length<6)){say("كلمة السر 6 أحرف على الأقل");return;}
    go.disabled=true; say("…",true);
    const back=location.origin+location.pathname;
    try{
      if(authMode==="login"){const {error}=await sb.auth.signInWithPassword({email:em,password:pw});if(error)throw error;}
      else if(authMode==="signup"){const {data,error}=await sb.auth.signUp({email:em,password:pw,options:{emailRedirectTo:back}});if(error)throw error;
        if(!data.session){showAuth("login","أرسلنا رسالة تأكيد إلى "+em+". افتح الرابط الذي فيها، ثم سجّل الدخول.");return;}}
      else if(authMode==="reset"){const {error}=await sb.auth.resetPasswordForEmail(em,{redirectTo:back});if(error)throw error;say("أرسلنا رابط الاستعادة إلى بريدك.",true);go.disabled=false;return;}
      else if(authMode==="newpass"){const {error}=await sb.auth.updateUser({password:pw});if(error)throw error;hideAuth();toast("حُفظت كلمة السر الجديدة");}
    }catch(err){go.disabled=false;const t=String((err&&err.message)||"");
      say(/Invalid login/i.test(t)?"البريد أو كلمة السر غير صحيحة":/not confirmed/i.test(t)?"أكّد بريدك أولًا من الرسالة التي وصلتك":/already registered|already been registered/i.test(t)?"هذا البريد مسجّل من قبل؛ سجّل الدخول":/rate limit|too many/i.test(t)?"محاولات كثيرة؛ انتظر قليلًا ثم أعد المحاولة":/password/i.test(t)?"كلمة السر ضعيفة أو قصيرة":"تعذّر الاتصال: "+t);}
  };
  const f=document.getElementById(authMode==="newpass"?"aPass":"aEmail"); if(f) setTimeout(()=>f.focus(),50);
}
async function initDb(){
  try{ sb=window.supabase.createClient(SB_URL,SB_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}); }catch(e){ sb=null; }
  if(!sb){ startLocal(); toast("تعذّر الاتصال بالخادم؛ البيانات على هذا الجهاز فقط"); return; }
  sb.auth.onAuthStateChange((ev,sess)=>{
    if(ev==="PASSWORD_RECOVERY"){ showAuth("newpass"); return; }
    if((ev==="SIGNED_IN"||ev==="INITIAL_SESSION")&&sess&&(!sbUser||sbUser.id!==sess.user.id)) setTimeout(()=>startUser(sess.user),0);
  });
  const {data:{session}}=await sb.auth.getSession();
  if(session){ if(!sbUser) startUser(session.user); }
  else { let guest=false; try{guest=!!localStorage.getItem("qa-guest");}catch(e){} if(guest) startLocal(); else { render(); showAuth("login"); } }
}

