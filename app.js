/* ===================== APP LOGIC ===================== */

let RAW=[], sortKey="occ", sortDir=-1, lastGood=null, teamFilter="__all", cdLeft=REFRESH_MS/1000;

const fmtINR=n=>{ if(n>=1e7)return "₹"+(n/1e7).toFixed(2)+" Cr"; if(n>=1e5)return "₹"+(n/1e5).toFixed(2)+" L"; return "₹"+Math.round(n).toLocaleString('en-IN'); };
const fmtMin=m=>{const h=Math.floor(m/60),mm=Math.round(m%60);return h>0?h+"h "+mm+"m":mm+"m";};
function nameFromEmail(e){let s=e.split("@")[0].replace(/\.(bd|bd1|ugc|super|bda|1|cat|upsc)$/,"");
  return s.split(".").filter(Boolean).map(w=>w.charAt(0).toUpperCase()+w.slice(1)).join(" ");}
const shortTeam=t=>t.replace(/^Team\s+/,"").replace(/\s*\((Select|Super BDA|1-10)\)$/,"");
function targets(){return{
  workMin:(+wHrs.value||8)*60, connMin:+cMin.value||20, dnpMin:(+dMin.value||2.5),
  vcMin:+vMin.value||40, green:+gThr.value||75, amber:+aThr.value||50, wd:+wdays.value||25};}
const occ=(r,T)=>r.connected*T.connMin + Math.max(0,r.calls-r.connected)*T.dnpMin + r.vc*T.vcMin;
const teamOcc=(t,T)=>t.conn*T.connMin + Math.max(0,t.calls-t.conn)*T.dnpMin + t.vc*T.vcMin;
const utilPct=(r,T)=>T.workMin>0?occ(r,T)/T.workMin*100:0;

function normalize(rows){
  return rows.filter(r=>r.email && r.email.toLowerCase()!=="total").map(r=>{
    const em=r.email.toLowerCase(), mp=MAP[em];
    return {date:r.date, email:em, name:nameFromEmail(em),
      team:mp?mp.t:"Unmapped", goal:mp?mp.g:"", mTarget:mp?mp.m:0,
      calls:+r.calls, connected:+r.conn, talk:+r.talk, vc:+r.vc, uniq:+r.uniq, pct:+r.pct, mapped:!!mp};
  });
}

function statusOf(r,T){
  if(r.calls===0) return ["Idle","s-idle"];
  const u=utilPct(r,T);
  if(u>=T.green) return ["On track","s-good"];
  if(u>=T.amber) return ["Watch","s-watch"];
  return ["Behind","s-bad"];
}

function activeDate(){ return dateSel.value; }
function dayRowsAll(){ return RAW.filter(r=>r.date===activeDate() && r.mapped); }
function viewRows(){
  let rows=dayRowsAll();
  if(teamFilter!=="__all") rows=rows.filter(r=>r.team===teamFilter);
  const q=search.value.trim().toLowerCase();
  if(q) rows=rows.filter(r=>r.name.toLowerCase().includes(q)||r.email.includes(q));
  return rows;
}
function mappedRepsForTeam(team){ return Object.values(MAP).filter(v=>team==="__all"||v.t===team).length; }
function rosterForView(){
  const byEmail={}; dayRowsAll().forEach(r=>byEmail[r.email]=r);
  const q=search.value.trim().toLowerCase();
  return Object.keys(MAP).filter(e=>teamFilter==="__all"||MAP[e].t===teamFilter).map(e=>{
    const mp=MAP[e], r=byEmail[e];
    return r?{...r}:{email:e,name:nameFromEmail(e),team:mp.t,goal:mp.g,mTarget:mp.m,calls:0,connected:0,talk:0,vc:0,uniq:0,pct:0,mapped:true};
  }).filter(r=>!q||r.name.toLowerCase().includes(q)||r.email.includes(q));
}
function utilFill(u,active,T){ return !active?"f-idle":u>=T.green?"f-good":u>=T.amber?"f-watch":"f-bad"; }

function render(){
  const T=targets();
  const day=dayRowsAll();
  const present=new Set(day.map(r=>r.email));
  const roster=Object.keys(MAP).filter(e=>teamFilter==="__all"||MAP[e].t===teamFilter);
  const idleCount=roster.filter(e=>!present.has(e)).length;

  const totMonthly=Object.values(MAP).reduce((a,v)=>a+v.m,0);
  const totReps=Object.keys(MAP).length;
  const totTeams=new Set(Object.values(MAP).map(v=>v.t)).size;
  banner.innerHTML=`
    <div class="b"><span class="l">June revenue target (floor)</span><span class="v">${fmtINR(totMonthly)}</span></div>
    <div class="b"><span class="l">Teams</span><span class="v">${totTeams}</span></div>
    <div class="b"><span class="l">Mapped reps</span><span class="v">${totReps}</span></div>
    <div class="b"><span class="l">Daily pace needed</span><span class="v">${fmtINR(totMonthly/T.wd)} <small>/ day</small></span></div>`;

  const rows=day.filter(r=>teamFilter==="__all"||r.team===teamFilter);
  const calls=rows.reduce((a,r)=>a+r.calls,0), conn=rows.reduce((a,r)=>a+r.connected,0);
  const vc=rows.reduce((a,r)=>a+r.vc,0), active=rows.length, repsT=mappedRepsForTeam(teamFilter)||1;
  const occTot=rows.reduce((a,r)=>a+occ(r,T),0), cap=T.workMin*repsT;
  const util=cap>0?occTot/cap*100:0, connPct=calls>0?conn/calls*100:0;
  const uFill=utilFill(util,active>0,T);
  const K=[
    {l:"Utilization",v:Math.round(util)+"%",bar:true,fill:uFill,p:util/100,m:`${fmtMin(occTot)} used of ${fmtMin(cap)} capacity`},
    {l:"Occupancy",v:fmtMin(occTot),bar:true,fill:uFill,p:util/100,m:`${fmtMin(occTot/repsT)}/rep · cap ${T.workMin/60}h`},
    {l:"Connect rate",v:connPct.toFixed(1)+"%",m:`${conn} connected of ${calls} calls`},
    {l:"Calls",v:calls.toLocaleString(),m:`${Math.round(calls/repsT)}/rep`},
    {l:"Video calls",v:vc,m:`${(vc/repsT).toFixed(1)}/rep · ${T.vcMin}m each`},
    {l:"Active / idle",v:`${active} / ${idleCount}`,bar:true,fill:"f-good",p:active/(active+idleCount||1),m:`${active+idleCount} on roster`},
  ];
  kpis.innerHTML=K.map(k=>`<div class="kpi"><div class="lab">${k.l}</div>
    <div class="val tabnum">${k.v}</div>
    ${k.bar?`<div class="bar"><i class="${k.fill||''}" style="width:${Math.max(2,Math.min(100,Math.round(k.p*100)))}%"></i></div>`:`<div style="height:6px"></div>`}
    <div class="meta">${k.m}</div></div>`).join("");

  const byTeam={};
  Object.entries(MAP).forEach(([e,v])=>{(byTeam[v.t]??={calls:0,conn:0,talk:0,vc:0,act:0,n:0,tgt:0});byTeam[v.t].n++;byTeam[v.t].tgt+=v.m;});
  day.forEach(r=>{const t=byTeam[r.team];if(!t)return;t.calls+=r.calls;t.conn+=r.connected;t.talk+=r.talk;t.vc+=r.vc;if(r.calls>0)t.act++;});
  teams.innerHTML=Object.entries(byTeam).map(([name,t])=>{
    const oo=teamOcc(t,T), cap=T.workMin*t.n, u=cap>0?oo/cap*100:0; return [name,t,oo,u];
  }).sort((a,b)=>b[3]-a[3]).map(([name,t,oo,u])=>{
    const c=t.act===0?["No activity","s-idle"]:u>=T.green?["On track","s-good"]:u>=T.amber?["Watch","s-watch"]:["Behind","s-bad"];
    const cp=t.calls>0?t.conn/t.calls*100:0;
    return `<div class="team ${teamFilter===name?'sel':''}" data-team="${name}">
      <div class="tn">${shortTeam(name)}<span class="pill ${c[1]}">${c[0]}</span></div>
      <div class="row"><span>Active reps</span><b class="tabnum">${t.act}/${t.n}</b></div>
      <div class="row"><span>Calls</span><span><b class="tabnum">${t.calls}</b> <span style="color:var(--muted)">· ${cp.toFixed(0)}% conn</span></span></div>
      <div class="row"><span>Occupancy</span><b class="tabnum">${fmtMin(oo)}</b></div>
      <div class="row"><span>Occ / BDE</span><b class="tabnum">${fmtMin(oo/t.n)}</b></div>
      <div class="row"><span>Utilization</span><b class="tabnum" style="color:var(--ink)">${Math.round(u)}%</b></div>
      <div class="tgt">Monthly target <b style="color:var(--ink)">${fmtINR(t.tgt)}</b> · ${fmtINR(t.tgt/T.wd)}/day</div></div>`;
  }).join("");
  teams.querySelectorAll('.team').forEach(el=>el.onclick=()=>{const t=el.dataset.team;teamFilter=(teamFilter===t)?"__all":t;teamSel.value=teamFilter;render();});

  // Utilization bars — TL-wise (team occupancy vs team capacity = workMin × reps)
  const tl=Object.entries(byTeam).map(([name,t])=>{const oo=teamOcc(t,T),cap=T.workMin*t.n;
    return {short:shortTeam(name),u:cap>0?oo/cap*100:0,oo,act:t.act,n:t.n};}).sort((a,b)=>b.u-a.u);
  tlBars.innerHTML=tl.map(x=>`<div class="ubar">
    <div class="ulab">${x.short}<span class="usub">${x.act}/${x.n} active · ${fmtMin(x.oo)} · ${fmtMin(x.oo/x.n)}/BDE</span></div>
    <div class="utrack"><i class="ufill ${utilFill(x.u,x.act>0,T)}" style="width:${Math.min(100,Math.round(x.u))}%"></i></div>
    <div class="uval">${Math.round(x.u)}%</div></div>`).join("");

  // Utilization bars — BDE-wise (full roster in view; idle = 0%)
  const bde=rosterForView().map(r=>({...r,oo:occ(r,T),u:utilPct(r,T)})).sort((a,b)=>b.u-a.u);
  bdeBars.innerHTML=bde.length?bde.map(x=>`<div class="ubar">
    <div class="ulab">${x.name}<span class="usub">${shortTeam(x.team)} · ${x.calls} calls · ${fmtMin(x.oo)}</span></div>
    <div class="utrack"><i class="ufill ${utilFill(x.u,x.calls>0,T)}" style="width:${Math.min(100,Math.round(x.u))}%"></i></div>
    <div class="uval">${Math.round(x.u)}%</div></div>`).join("")
    :`<div style="padding:14px;color:var(--muted);font-size:13px">No reps in this view.</div>`;

  const aug=viewRows().map(r=>({...r,occ:occ(r,T),util:utilPct(r,T),avg:r.connected>0?r.talk/r.connected:0}));
  aug.sort((a,b)=>{const x=a[sortKey],y=b[sortKey];return(typeof x==="string"?x.localeCompare(y):x-y)*sortDir;});
  const cols=[["name","Rep"],["calls","Calls"],["connected","Conn"],["pct","Conn %"],["vc","VC"],["avg","Avg talk"],["occ","Occupancy"],["util","Util %"],["uniq","Unique"],["_st","Status"]];
  let h="<thead><tr>"+cols.map(c=>`<th data-k="${c[0]}" class="${c[0]===sortKey?'active':''}">${c[1]}${c[0]===sortKey?' <span class="ar">'+(sortDir<0?'▼':'▲')+'</span>':''}</th>`).join("")+"</tr></thead><tbody>";
  if(!aug.length) h+=`<tr><td colspan="10" style="text-align:center;color:var(--muted);padding:22px">No matching reps for this view.</td></tr>`;
  aug.forEach(r=>{const st=statusOf(r,T);
    h+=`<tr><td><span class="who">${r.name}</span> <span class="tag">${r.goal}</span><br><span class="tag">${shortTeam(r.team)}</span></td>
      <td class="tabnum">${r.calls}</td><td class="tabnum">${r.connected}</td><td class="tabnum">${r.pct.toFixed(1)}%</td>
      <td class="tabnum">${r.vc}</td><td class="tabnum">${r.avg>0?r.avg.toFixed(1)+'m':'—'}</td>
      <td class="tabnum">${fmtMin(r.occ)}</td><td class="tabnum">${Math.round(r.util)}%</td><td class="tabnum">${r.uniq}</td>
      <td><span class="status ${st[1]}">${st[0]}</span></td></tr>`;});
  h+="</tbody>"; tbl.innerHTML=h;
  tbl.querySelectorAll('th').forEach(th=>th.onclick=()=>{const k=th.dataset.k;if(k===sortKey)sortDir*=-1;else{sortKey=k;sortDir=(k==="name")?1:-1;}render();});
}

function fillTeamSel(){
  const ts=[...new Set(Object.values(MAP).map(v=>v.t))].sort();
  teamSel.innerHTML=`<option value="__all">All Plutus teams</option>`+ts.map(t=>`<option value="${t}">${shortTeam(t)}</option>`).join("");
}
function setData(rows,label){
  RAW=normalize(rows);
  const dates=[...new Set(RAW.map(r=>r.date))].sort().reverse();
  const keep=dateSel.value;
  dateSel.innerHTML=dates.map(d=>`<option>${d}</option>`).join("");
  if(dates.includes(keep))dateSel.value=keep;
  asof.textContent="As of "+(label||dates[0]); render();
}
function setLive(s){dot.className="dot "+s;liveTxt.textContent=({live:"Live",stale:"Snapshot",err:"Offline"})[s];}
function parseFeed(j){return j.query_result.data.rows.map(r=>({
  date:(r["Activity_Date::filter"]||r["Activity_Date"]||"").slice(0,10),
  email:r.BD,conn:r.Connected,calls:r.TotalCallAttempt,talk:+r.TotalCallDuration,vc:r.Vcdone,uniq:r.Unique_Dailed,pct:r.Connected_Percent}));}

async function tryFetch(url){const res=await fetch(url,{cache:"no-store"});if(!res.ok)throw new Error(res.status);return res.json();}
async function poll(){
  cdLeft=REFRESH_MS/1000;
  let j=null;
  try{ if(API_URL_DIRECT) j=await tryFetch(API_URL_DIRECT); }catch(e){}
  if(!j){ try{ j=await tryFetch(API_PROXY); }catch(e2){} }
  if(j){ const rows=parseFeed(j); lastGood=rows;
    setData(rows,new Date().toLocaleString('en-IN',{hour:'2-digit',minute:'2-digit',day:'2-digit',month:'short'})+" IST");
    setLive("live"); fallback.style.display="none";
  }else if(!lastGood){ setData(SNAP.rows.map(r=>({date:r[0],email:r[1],calls:r[2],conn:r[3],talk:r[4],vc:r[5],uniq:r[6],pct:r[7]})),SNAP.updated);
    setLive("stale"); fallback.style.display="block"; }
}

exportBtn.onclick=()=>{const T=targets();const rows=viewRows().map(r=>({...r,occ:occ(r,T),util:utilPct(r,T)}));
  const head=["Rep","Email","Team","Goal","Calls","Connected","ConnectPct","TalkMin","VC","OccupancyMin","UtilizationPct","Unique","MonthlyTarget"];
  const body=rows.map(r=>[r.name,r.email,r.team,r.goal,r.calls,r.connected,r.pct,r.talk.toFixed(1),r.vc,r.occ.toFixed(1),r.util.toFixed(1),r.uniq,r.mTarget].join(","));
  const blob=new Blob([head.join(",")+"\n"+body.join("\n")],{type:"text/csv"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`utilization_${activeDate()}.csv`;a.click();};
loadPaste.onclick=()=>{try{const j=JSON.parse(pasteBox.value);const rows=parseFeed(j);lastGood=rows;setData(rows,"pasted data");setLive("stale");}catch(e){alert("Couldn't parse that JSON.");}};
refreshBtn.onclick=poll;
dateSel.onchange=render;
teamSel.onchange=()=>{teamFilter=teamSel.value;render();};
search.oninput=render;
['wHrs','cMin','dMin','vMin','gThr','aThr','wdays'].forEach(id=>document.getElementById(id).oninput=render);

note.innerHTML="<b>Occupancy</b> = estimated working minutes = (connected calls × connected-min) + (DNP/call-back attempts × DNP-min) + (video calls × VC-min). <b>Utilization %</b> = occupancy ÷ daily capacity (work hrs × 60). TL bars divide team occupancy by the team's full-roster capacity, so idle reps pull a team down. All model values are editable above. Connected-call time is modelled at a flat average for fair comparison; each rep's real measured talk time is the "Avg talk" column. Revenue figures are the fixed June targets from your mapping.";

fillTeamSel();
setData(SNAP.rows.map(r=>({date:r[0],email:r[1],calls:r[2],conn:r[3],talk:r[4],vc:r[5],uniq:r[6],pct:r[7]})),SNAP.updated); setLive("stale");
poll(); setInterval(poll,REFRESH_MS);
setInterval(()=>{cdLeft--;const m=Math.floor(Math.max(0,cdLeft)/60),s=Math.max(0,cdLeft)%60;cd.textContent=`${m}:${String(s).padStart(2,'0')}`;},1000);
