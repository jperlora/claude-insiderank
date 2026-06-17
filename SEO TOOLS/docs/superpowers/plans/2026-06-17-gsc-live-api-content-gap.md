# GSC Live API + Content Gap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add live Google Search Console API pull via OAuth 2.0 and a Content Gap view to the existing Inside Rank single-file tool.

**Architecture:** All changes are made to the single `index.html` file. The Google Identity Services (GIS) library handles OAuth in the browser — no backend needed. Pulled data is saved as a snapshot in the existing localStorage format so all current views work unchanged.

**Tech Stack:** Vanilla JS, Google Identity Services (GIS) CDN, GSC Search Analytics REST API, existing localStorage snapshot format.

---

## File Map

| File | Change |
|---|---|
| `index.html` | All changes — CSS additions, HTML additions to sidebar/views/settings/help, JS additions |

All insertions use unique anchor strings to find the right location. No line numbers — use your editor's find to locate anchors.

---

## Task 1: Add GIS library script tag + new CSS

**Files:**
- Modify: `index.html` — `<head>` section and `<style>` block

- [ ] **Step 1: Add GIS script tag to `<head>`**

Find this line in `<head>`:
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
```
Add immediately after it:
```html
<script src="https://accounts.google.com/gsi/client" async defer></script>
```

- [ ] **Step 2: Add CSS for GSC Live components**

Find the end of the `<style>` block (look for `.set-sub{font-size:13px`). Add before the closing `</style>` tag:

```css
/* ── GSC Live ── */
.gsc-onboard{background:var(--bg2);border:1px solid var(--border2);border-radius:var(--rl);padding:32px 36px;max-width:600px}
.gsc-onboard-title{font-size:18px;font-weight:700;margin-bottom:8px;color:var(--text)}
.gsc-onboard-sub{font-size:13px;color:var(--text2);line-height:1.7;margin-bottom:22px}
.gsc-steps{list-style:none;margin-bottom:24px}
.gsc-steps li{display:flex;align-items:flex-start;gap:12px;padding:9px 0;border-bottom:1px solid var(--border);font-size:13px;color:var(--text2);line-height:1.5}
.gsc-steps li:last-child{border-bottom:none}
.gsc-step-num{width:22px;height:22px;border-radius:50%;background:var(--blue-d);border:1px solid rgba(91,159,255,.35);color:var(--blue);font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px}
.gsc-connect-panel{background:var(--bg2);border:1px solid var(--border2);border-radius:var(--rl);padding:28px 32px;max-width:480px}
.gsc-connect-title{font-size:16px;font-weight:600;margin-bottom:6px;color:var(--text)}
.gsc-connect-sub{font-size:13px;color:var(--text2);line-height:1.6;margin-bottom:20px}
.gsc-pull-panel{background:var(--bg2);border:1px solid var(--border);border-radius:var(--rl);padding:22px 26px;margin-bottom:18px}
.gsc-pull-row{display:flex;align-items:flex-end;gap:12px;flex-wrap:wrap;margin-bottom:0}
.gsc-field{display:flex;flex-direction:column;gap:5px}
.gsc-field label{font-size:11px;text-transform:uppercase;letter-spacing:.6px;color:var(--text3);font-weight:500}
.gsc-connected-bar{display:flex;align-items:center;gap:8px;margin-bottom:16px;padding:9px 14px;background:var(--green-d);border:1px solid rgba(46,232,180,.28);border-radius:var(--r);font-size:12px;color:var(--green);font-weight:500}
.gsc-tab-bar{display:flex;align-items:center;gap:2px;margin-bottom:20px;background:var(--bg2);border:1px solid var(--border);border-radius:var(--rl);padding:4px;width:fit-content}
.gsc-tab{padding:7px 18px;border-radius:9px;font-size:13px;font-weight:500;color:var(--text2);cursor:pointer;transition:all .15s;border:none;background:none;font-family:var(--font)}
.gsc-tab:hover{color:var(--text)}
.gsc-tab.active{background:var(--bg4);color:var(--text);font-weight:600;box-shadow:0 1px 3px rgba(0,0,0,.3)}
.gap-opp-high{background:rgba(46,232,180,.14);color:var(--green);border:1px solid rgba(46,232,180,.28);padding:2px 9px;border-radius:20px;font-size:11px;font-weight:600}
.gap-opp-med{background:rgba(255,184,63,.13);color:var(--amber);border:1px solid rgba(255,184,63,.28);padding:2px 9px;border-radius:20px;font-size:11px;font-weight:600}
.gap-opp-low{background:rgba(255,255,255,.06);color:var(--text2);border:1px solid var(--border2);padding:2px 9px;border-radius:20px;font-size:11px;font-weight:600}
.gsc-pull-hist{background:var(--bg2);border:1px solid var(--border);border-radius:var(--rl);overflow:hidden;margin-bottom:18px}
.gsc-pull-hist-hdr{padding:13px 18px;border-bottom:1px solid var(--border);font-size:13px;font-weight:600;color:var(--text)}
.gsc-hist-item{display:flex;align-items:center;padding:12px 18px;border-bottom:1px solid var(--border);gap:12px;font-size:12px}
.gsc-hist-item:last-child{border-bottom:none}
.gsc-hist-label{flex:1;color:var(--text);font-weight:500}
.gsc-hist-meta{color:var(--text3);font-family:var(--mono);font-size:11px}
.api-key-input{width:100%;padding:9px 12px;background:var(--bg3);border:1px solid var(--border2);border-radius:var(--r);color:var(--text);font-size:13px;font-family:var(--font);outline:none;transition:border .15s}
.api-key-input:focus{border-color:var(--blue)}
```

- [ ] **Step 3: Commit**
```bash
git add index.html
git commit -m "feat: add GIS script tag and GSC Live CSS"
```

---

## Task 2: Add GSC Live nav button + view skeleton

**Files:**
- Modify: `index.html` — sidebar nav and main view area

- [ ] **Step 1: Add nav button to sidebar**

Find this line in the sidebar nav:
```html
<button class="nav-btn" onclick="goView('imports',this)">
```
Add immediately **before** it:
```html
<button class="nav-btn" id="nav-gsclive" onclick="goView('gsclive',this)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>GSC Live</button>
```

- [ ] **Step 2: Add the GSC Live view div**

Find this HTML comment:
```html
<!-- IMPORTS -->
```
Add immediately **before** it:
```html
<!-- GSC LIVE -->
<div class="view" id="v-gsclive">
  <div class="page-hdr">
    <div>
      <div class="page-title">GSC Live</div>
      <div class="page-sub">Pull live data directly from Google Search Console — no CSV export needed.</div>
    </div>
  </div>
  <!-- state: no client id -->
  <div id="gsc-state-nokey">
    <div class="gsc-onboard">
      <div class="gsc-onboard-title">Connect Google Search Console</div>
      <div class="gsc-onboard-sub">To pull live data you need a Google OAuth Client ID. It takes about 10 minutes to set up — you only do this once.</div>
      <ol class="gsc-steps">
        <li><span class="gsc-step-num">1</span><span>Go to <strong style="color:var(--text)">console.cloud.google.com</strong> and create a new project</span></li>
        <li><span class="gsc-step-num">2</span><span>Enable the <strong style="color:var(--text)">Google Search Console API</strong> under APIs &amp; Services → Library</span></li>
        <li><span class="gsc-step-num">3</span><span>Go to APIs &amp; Services → OAuth consent screen → External → add your email as a test user</span></li>
        <li><span class="gsc-step-num">4</span><span>Go to APIs &amp; Services → Credentials → Create OAuth Client ID → Web application</span></li>
        <li><span class="gsc-step-num">5</span><span>Add <code style="color:var(--teal);font-size:12px">https://insiderank.netlify.app</code> as an Authorized JavaScript origin</span></li>
        <li><span class="gsc-step-num">6</span><span>Copy the Client ID and paste it below in <a onclick="goView('settings',null);setTimeout(()=>document.getElementById('gsc-clientid-input').scrollIntoView({behavior:'smooth'}),300)" style="color:var(--blue);cursor:pointer;font-weight:500">Settings → GSC API</a></span></li>
      </ol>
      <button class="btn btn-primary" onclick="goView('settings',null);setTimeout(()=>document.getElementById('gsc-clientid-input').focus(),300)">Go to Settings → paste Client ID</button>
    </div>
  </div>
  <!-- state: has key, not yet authorized -->
  <div id="gsc-state-connect" style="display:none">
    <div class="gsc-connect-panel">
      <div class="gsc-connect-title">Connect your Google account</div>
      <div class="gsc-connect-sub">Click below to sign in with the Google account that has access to your Search Console properties. You'll be asked to grant read-only access.</div>
      <button class="btn btn-primary" onclick="connectGsc()">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.402 2.11l-2.19 2.192A4.793 4.793 0 0 0 8 3.065 4.935 4.935 0 0 0 3.065 8 4.935 4.935 0 0 0 8 12.935c2.171 0 3.668-.87 4.492-2.338H8V7.442h7.545v-.884z"/></svg>
        Connect Google Search Console
      </button>
    </div>
  </div>
  <!-- state: authorized + pull UI -->
  <div id="gsc-state-ready" style="display:none">
    <div class="gsc-connected-bar">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
      Connected as <span id="gsc-user-email" style="font-weight:700;margin:0 4px"></span>
      <button onclick="revokeGsc()" style="margin-left:auto;background:none;border:none;color:var(--green);cursor:pointer;font-size:11px;font-weight:600;opacity:.75;font-family:var(--font)">Disconnect</button>
    </div>
    <!-- tab bar -->
    <div class="gsc-tab-bar">
      <button class="gsc-tab active" id="gtab-pull" onclick="setGscTab('pull')">Pull Data</button>
      <button class="gsc-tab" id="gtab-gap" onclick="setGscTab('gap')">Content Gap</button>
    </div>
    <!-- Pull Data tab -->
    <div id="gsc-tab-pull">
      <div class="gsc-pull-panel">
        <div class="gsc-pull-row">
          <div class="gsc-field">
            <label>GSC Property</label>
            <select class="fi" id="gsc-property" style="min-width:260px;height:38px"></select>
          </div>
          <div class="gsc-field">
            <label>Date range</label>
            <select class="fi" id="gsc-range" style="height:38px">
              <option value="28">Last 28 days</option>
              <option value="90" selected>Last 3 months</option>
              <option value="180">Last 6 months</option>
            </select>
          </div>
          <button class="btn btn-primary" onclick="pullGscLive()" id="gsc-pull-btn" style="height:38px;align-self:flex-end">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.27"/></svg>
            Pull data
          </button>
        </div>
        <div id="gsc-pull-progress" style="display:none;margin-top:14px">
          <div style="font-size:12px;color:var(--text2);margin-bottom:6px" id="gsc-pull-status">Fetching…</div>
          <div class="progress-bar-bg"><div class="progress-bar-fill" id="gsc-pull-bar" style="width:0%"></div></div>
        </div>
      </div>
      <div id="gsc-pull-hist-wrap" style="display:none">
        <div class="gsc-pull-hist">
          <div class="gsc-pull-hist-hdr">Previously pulled snapshots</div>
          <div id="gsc-pull-hist-list"></div>
        </div>
      </div>
    </div>
    <!-- Content Gap tab -->
    <div id="gsc-tab-gap" style="display:none">
      <div id="gsc-gap-nosnap" style="padding:36px 0;text-align:center;color:var(--text3)">
        <div style="font-size:32px;margin-bottom:12px;opacity:.25">&#128203;</div>
        <div style="font-size:15px;font-weight:600;color:var(--text2);margin-bottom:6px">No live data yet</div>
        <div style="font-size:13px;max-width:340px;margin:0 auto">Pull data from the <strong style="color:var(--text)">Pull Data</strong> tab first — content gap analysis runs automatically on the pulled data.</div>
      </div>
      <div id="gsc-gap-content" style="display:none">
        <div class="filters" style="margin-bottom:16px">
          <div class="fi-wrap"><span class="fi-icon">&#128269;</span><input class="fi" type="text" id="gap-search" placeholder="Search queries…" style="width:240px;padding-left:26px" oninput="renderGapTable()"></div>
          <div class="gsc-field" style="flex-direction:row;align-items:center;gap:6px">
            <label style="font-size:12px;color:var(--text3);white-space:nowrap">Min impressions</label>
            <input class="fi" type="number" id="gap-min-impr" value="10" min="0" style="width:70px;height:38px" oninput="renderGapTable()">
          </div>
          <select class="fi" id="gap-pos-range" onchange="renderGapTable()">
            <option value="">All positions</option>
            <option value="1-10">Pos 1–10</option>
            <option value="11-20">Pos 11–20</option>
            <option value="21-50">Pos 21–50</option>
            <option value="51-100">Pos 51–100</option>
          </select>
          <select class="fi" id="gap-opp" onchange="renderGapTable()">
            <option value="">All opportunities</option>
            <option value="high">High</option>
            <option value="med">Medium</option>
            <option value="low">Low</option>
          </select>
          <button class="btn btn-ghost btn-sm" onclick="exportGapCSV()">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export CSV
          </button>
          <span style="margin-left:auto;font-size:11px;color:var(--text3)" id="gap-count-lbl"></span>
        </div>
        <div class="card">
          <div class="tbl-wrap">
            <table>
              <thead><tr>
                <th onclick="srtGap('query')" style="min-width:280px">Query<span class="si" id="si-gq">&#8597;</span></th>
                <th onclick="srtGap('impressions')" style="min-width:110px">Impressions<span class="si" id="si-gi">&#8597;</span></th>
                <th onclick="srtGap('position')" style="min-width:110px">Avg Position<span class="si" id="si-gp">&#8597;</span></th>
                <th onclick="srtGap('clicks')" style="min-width:90px">Clicks<span class="si" id="si-gc">&#8597;</span></th>
                <th onclick="srtGap('ctr')" style="min-width:80px">CTR<span class="si" id="si-gctr">&#8597;</span></th>
                <th style="min-width:100px">Opportunity</th>
              </tr></thead>
              <tbody id="gap-tbody"></tbody>
            </table>
          </div>
          <div class="pager"><span class="pager-info" id="gap-pinfo"></span><button class="pager-btn" id="gap-prev" onclick="pgGap(-1)">&#8592; Prev</button><button class="pager-btn" id="gap-next" onclick="pgGap(1)">Next &#8594;</button></div>
        </div>
      </div>
    </div>
  </div>
</div>

```

- [ ] **Step 3: Commit**
```bash
git add index.html
git commit -m "feat: add GSC Live nav item and view skeleton"
```

---

## Task 3: Settings — GSC Client ID card

**Files:**
- Modify: `index.html` — Settings view (`v-settings`)

- [ ] **Step 1: Add GSC API settings card**

Find this in the Settings view:
```html
<!-- SERPER -->
```
Add immediately **before** it:
```html
<!-- GSC API -->
<div class="set-card" id="gsc-api-anchor">
  <div class="set-title">&#128274; Google Search Console API</div>
  <div class="set-sub">Paste your OAuth 2.0 Client ID here to enable live GSC data pulls. You only need to do this once.</div>
  <div style="margin-bottom:8px">
    <div style="font-size:11px;color:var(--text3);margin-bottom:4px;text-transform:uppercase;letter-spacing:.4px;font-weight:500">OAuth Client ID</div>
    <input type="text" class="api-key-input" id="gsc-clientid-input" placeholder="123456789012-abc…apps.googleusercontent.com" style="margin-bottom:10px">
  </div>
  <div style="display:flex;gap:8px;align-items:center">
    <button class="btn btn-green" onclick="saveGscClientId()">Save Client ID</button>
    <span id="gsc-clientid-status" style="font-size:12px;color:var(--text3)"></span>
  </div>
  <div style="margin-top:12px;font-size:11px;color:var(--text3);line-height:1.8">&#9432; Don't have a Client ID yet? <a onclick="goView('gsclive',null)" style="color:var(--blue);cursor:pointer;font-weight:500">Go to GSC Live</a> for step-by-step setup instructions.</div>
</div>

```

- [ ] **Step 2: Add JS functions for Client ID save/load**

Find this comment near the top of the `<script>` block:
```js
const SK='ir_v4b_';const SB_SK='ir_sb_';const SERP_SK='ir_serp_';
```
Add a new constant immediately after the line that contains `const SERPER_DEFAULT=`:
```js
const GSC_CID_SK='ir_gsc_cid';
```

Find the `bootApp` function declaration:
```js
async function bootApp(){
```
Add these functions immediately **before** it:

```js
// ── GSC Client ID ──
function saveGscClientId(){
  const val=(document.getElementById('gsc-clientid-input').value||'').trim();
  if(!val){toast('Paste your Client ID first','err');return;}
  localStorage.setItem(GSC_CID_SK,val);
  document.getElementById('gsc-clientid-status').textContent='Saved';
  document.getElementById('gsc-clientid-status').style.color='var(--green)';
  toast('Client ID saved','ok');
  refreshGscState();
}
function loadGscClientId(){
  const v=localStorage.getItem(GSC_CID_SK)||'';
  const inp=document.getElementById('gsc-clientid-input');
  if(inp)inp.value=v;
  return v;
}
```

- [ ] **Step 3: Commit**
```bash
git add index.html
git commit -m "feat: add GSC Client ID settings card and save/load functions"
```

---

## Task 4: OAuth token client — connect / revoke / state management

**Files:**
- Modify: `index.html` — JS section

- [ ] **Step 1: Add GSC state variables**

Find:
```js
const GSC_CID_SK='ir_gsc_cid';
```
Add immediately after it:
```js
let gscTokenClient=null;
let gscAccessToken=null;
let gscTokenExpiry=0;
let gscProperties=[];
let gscLiveRows=[];      // query+page rows from last pull
let gscQueryOnlyRows=[]; // query-only rows from last pull
let gscSort={col:'impressions',dir:-1};
let gscGapSort={col:'impressions',dir:-1};
let gscGapPage=1;
const GSC_PAGE_SIZE=50;
```

- [ ] **Step 2: Add OAuth functions**

Add immediately after the `loadGscClientId` function:

```js
// ── GSC OAuth ──
function initGscTokenClient(){
  const cid=localStorage.getItem(GSC_CID_SK)||'';
  if(!cid||!window.google?.accounts?.oauth2)return;
  gscTokenClient=google.accounts.oauth2.initTokenClient({
    client_id:cid,
    scope:'https://www.googleapis.com/auth/webmasters.readonly',
    callback:(resp)=>{
      if(resp.error){toast('GSC auth failed: '+resp.error,'err');return;}
      gscAccessToken=resp.access_token;
      gscTokenExpiry=Date.now()+(resp.expires_in-60)*1000;
      fetchGscUserInfo().then(()=>{fetchGscProperties().then(()=>{refreshGscState();});});
    }
  });
}
function connectGsc(){
  const cid=localStorage.getItem(GSC_CID_SK)||'';
  if(!cid){toast('Paste your Client ID in Settings first','err');goView('settings',null);return;}
  if(!gscTokenClient)initGscTokenClient();
  if(!gscTokenClient){toast('Google Identity Services not loaded yet — wait a moment and try again','err');return;}
  if(gscAccessToken&&Date.now()<gscTokenExpiry){fetchGscProperties().then(()=>refreshGscState());return;}
  gscTokenClient.requestAccessToken({prompt:''});
}
function revokeGsc(){
  if(gscAccessToken)google.accounts.oauth2.revoke(gscAccessToken,()=>{});
  gscAccessToken=null;gscTokenExpiry=0;gscProperties=[];
  document.getElementById('gsc-user-email').textContent='';
  refreshGscState();
  toast('Disconnected from GSC');
}
async function fetchGscUserInfo(){
  if(!gscAccessToken)return;
  try{
    const r=await fetch('https://www.googleapis.com/oauth2/v3/userinfo',{headers:{Authorization:'Bearer '+gscAccessToken}});
    const d=await r.json();
    const el=document.getElementById('gsc-user-email');
    if(el)el.textContent=d.email||'';
  }catch(e){}
}
async function fetchGscProperties(){
  if(!gscAccessToken)return;
  try{
    const r=await fetch('https://www.googleapis.com/webmasters/v3/sites',{headers:{Authorization:'Bearer '+gscAccessToken}});
    const d=await r.json();
    gscProperties=(d.siteEntry||[]).map(s=>s.siteUrl);
    const sel=document.getElementById('gsc-property');
    if(!sel)return;
    sel.innerHTML=gscProperties.map(p=>`<option value="${p}">${p}</option>`).join('');
  }catch(e){toast('Failed to fetch GSC properties','err');}
}
function refreshGscState(){
  const cid=localStorage.getItem(GSC_CID_SK)||'';
  const nokey=document.getElementById('gsc-state-nokey');
  const conn=document.getElementById('gsc-state-connect');
  const ready=document.getElementById('gsc-state-ready');
  if(!nokey)return;
  if(!cid){nokey.style.display='';conn.style.display='none';ready.style.display='none';return;}
  if(!gscAccessToken||Date.now()>=gscTokenExpiry){nokey.style.display='none';conn.style.display='';ready.style.display='none';return;}
  nokey.style.display='none';conn.style.display='none';ready.style.display='';
  renderGscPullHist();
}
function setGscTab(tab){
  document.getElementById('gsc-tab-pull').style.display=tab==='pull'?'':'none';
  document.getElementById('gsc-tab-gap').style.display=tab==='gap'?'':'none';
  document.getElementById('gtab-pull').classList.toggle('active',tab==='pull');
  document.getElementById('gtab-gap').classList.toggle('active',tab==='gap');
  if(tab==='gap')renderGapTable();
}
```

- [ ] **Step 3: Call `initGscTokenClient` inside `bootApp`**

Find the `bootApp` function. Look for `loadSbCreds()` being called inside it (or another initialization call near the end of bootApp). Add after the last initialization call inside `bootApp`:
```js
  setTimeout(()=>initGscTokenClient(),800);
  loadGscClientId();
  refreshGscState();
```

- [ ] **Step 4: Commit**
```bash
git add index.html
git commit -m "feat: add GSC OAuth token client, connect/revoke, and state machine"
```

---

## Task 5: GSC API pull — two requests → snapshot

**Files:**
- Modify: `index.html` — JS section

- [ ] **Step 1: Add the pull function**

Add immediately after the `setGscTab` function:

```js
// ── GSC Live Pull ──
async function pullGscLive(){
  if(!gscAccessToken||Date.now()>=gscTokenExpiry){connectGsc();return;}
  const siteUrl=document.getElementById('gsc-property').value;
  if(!siteUrl){toast('Select a GSC property first','err');return;}
  const days=parseInt(document.getElementById('gsc-range').value)||90;
  const endDate=new Date();
  const startDate=new Date();startDate.setDate(endDate.getDate()-days);
  const fmt=d=>d.toISOString().split('T')[0];
  const sd=fmt(startDate),ed=fmt(endDate);

  const btn=document.getElementById('gsc-pull-btn');
  const prog=document.getElementById('gsc-pull-progress');
  const bar=document.getElementById('gsc-pull-bar');
  const status=document.getElementById('gsc-pull-status');
  btn.disabled=true;prog.style.display='';

  async function gscQuery(dimensions,label){
    status.textContent=`Fetching ${label}…`;bar.style.width='20%';
    const encoded=encodeURIComponent(siteUrl);
    const res=await fetch(`https://searchconsole.googleapis.com/webmasters/v3/sites/${encoded}/searchAnalytics/query`,{
      method:'POST',
      headers:{'Authorization':'Bearer '+gscAccessToken,'Content-Type':'application/json'},
      body:JSON.stringify({startDate:sd,endDate:ed,dimensions,rowLimit:25000,startRow:0})
    });
    if(!res.ok){const e=await res.json();throw new Error(e.error?.message||'API error');}
    const data=await res.json();
    return(data.rows||[]).map(r=>({
      query:r.keys[0]||'',
      page:dimensions.includes('page')?(r.keys[1]||''):null,
      clicks:r.clicks||0,
      impressions:r.impressions||0,
      ctr:r.ctr||0,
      position:r.position||0
    }));
  }

  try{
    const qpRows=await gscQuery(['query','page'],'queries + pages');
    bar.style.width='60%';
    const qRows=await gscQuery(['query'],'queries only');
    bar.style.width='90%';
    gscLiveRows=qpRows;
    gscQueryOnlyRows=qRows;

    // Build snapshot in existing format
    const snap={
      id:'sn_gsc_'+Date.now()+'_'+Math.random().toString(36).slice(2,6),
      label:'GSC Live — '+sd+' → '+ed,
      start:sd,end:ed,
      rows:qpRows.map(r=>({...r,src:'gsc-live',urlSource:r.page?'exact':'none'})),
      count:qpRows.length,
      urlFilledCount:qpRows.filter(r=>r.page).length,
      exactCount:qpRows.filter(r=>r.page).length,
      inferredCount:0,
      sources:['gsc-live'],
      files:['GSC Live API — '+siteUrl],
      zipName:null
    };
    if(!A.snaps[A.site])A.snaps[A.site]=[];
    // Replace previous GSC Live snap for same date range
    A.snaps[A.site]=A.snaps[A.site].filter(s=>s.label!==snap.label);
    A.snaps[A.site].push(snap);
    A.snaps[A.site].sort((a,b)=>(a.start||a.label).localeCompare(b.start||b.label));
    await save();autoPickPeriods();renderAll();renderSnapList();
    bar.style.width='100%';
    status.textContent=`Done — ${qpRows.length.toLocaleString()} queries pulled`;
    setTimeout(()=>{prog.style.display='none';bar.style.width='0%';},2000);
    renderGscPullHist();
    toast(`GSC Live snapshot saved — ${qpRows.length.toLocaleString()} rows`,'ok');
  }catch(e){
    toast('Pull failed: '+e.message,'err');
    prog.style.display='none';bar.style.width='0%';
  }
  btn.disabled=false;
}

function renderGscPullHist(){
  const wrap=document.getElementById('gsc-pull-hist-wrap');
  const list=document.getElementById('gsc-pull-hist-list');
  if(!wrap||!list)return;
  const snaps=(A.snaps[A.site]||[]).filter(s=>s.sources&&s.sources.includes('gsc-live'));
  if(!snaps.length){wrap.style.display='none';return;}
  wrap.style.display='';
  list.innerHTML=snaps.map(s=>`
    <div class="gsc-hist-item">
      <div class="gsc-hist-label">${s.label}</div>
      <div class="gsc-hist-meta">${(s.count||0).toLocaleString()} rows</div>
      <div class="gsc-hist-meta" style="margin-left:8px">${s.start} → ${s.end}</div>
    </div>`).join('');
}
```

- [ ] **Step 2: Commit**
```bash
git add index.html
git commit -m "feat: add GSC Live pull — two API calls saved as snapshot"
```

---

## Task 6: Content Gap detection + table rendering

**Files:**
- Modify: `index.html` — JS section

- [ ] **Step 1: Add content gap computation and rendering**

Add immediately after the `renderGscPullHist` function:

```js
// ── Content Gap ──
function computeContentGaps(){
  if(!gscQueryOnlyRows.length)return[];
  // Build set of queries that have a real page URL (not root)
  const withPage=new Set();
  gscLiveRows.forEach(r=>{
    if(r.page){
      const p=r.page.replace(/https?:\/\/[^/]+/,'').replace(/\/+$/,'');
      if(p&&p!=='')withPage.add(r.query);
    }
  });
  // Queries in query-only list with no associated page = content gap
  // Also flag queries whose only page is the homepage
  const homepageQueries=new Set();
  gscLiveRows.forEach(r=>{
    if(!r.page)return;
    const p=r.page.replace(/https?:\/\/[^/]+/,'').replace(/\/+$/,'');
    if(p===''||p==='/')homepageQueries.add(r.query);
  });
  return gscQueryOnlyRows
    .filter(r=>!withPage.has(r.query)||homepageQueries.has(r.query))
    .map(r=>({...r,opportunity:gapOpp(r)}));
}
function gapOpp(r){
  if(r.impressions>=100&&r.position<=20)return'high';
  if(r.impressions>=20&&r.position<=50)return'med';
  return'low';
}
function srtGap(col){
  if(gscGapSort.col===col)gscGapSort.dir*=-1;
  else{gscGapSort.col=col;gscGapSort.dir=col==='query'?1:-1;}
  gscGapPage=1;
  ['gq','gi','gp','gc','gctr'].forEach(k=>{const el=document.getElementById('si-'+k);if(el){el.textContent='↕';el.classList.remove('on');}});
  const map={query:'gq',impressions:'gi',position:'gp',clicks:'gc',ctr:'gctr'};
  const el=document.getElementById('si-'+(map[col]||col));
  if(el){el.textContent=gscGapSort.dir===1?'↑':'↓';el.classList.add('on');}
  renderGapTable();
}
function pgGap(dir){
  const gaps=getFilteredGaps();
  const total=Math.ceil(gaps.length/GSC_PAGE_SIZE);
  gscGapPage=Math.max(1,Math.min(total,gscGapPage+dir));
  renderGapTable();
}
function getFilteredGaps(){
  const gaps=computeContentGaps();
  const search=(document.getElementById('gap-search')?.value||'').toLowerCase();
  const minImpr=parseInt(document.getElementById('gap-min-impr')?.value)||0;
  const posRange=document.getElementById('gap-pos-range')?.value||'';
  const opp=document.getElementById('gap-opp')?.value||'';
  return gaps.filter(r=>{
    if(search&&!r.query.toLowerCase().includes(search))return false;
    if(r.impressions<minImpr)return false;
    if(posRange){const[lo,hi]=posRange.split('-').map(Number);if(r.position<lo||r.position>hi)return false;}
    if(opp&&r.opportunity!==opp)return false;
    return true;
  }).sort((a,b)=>{
    const{col,dir}=gscGapSort;
    const va=a[col],vb=b[col];
    if(typeof va==='string')return dir*va.localeCompare(vb);
    return dir*(vb-va);
  });
}
function renderGapTable(){
  const nosnap=document.getElementById('gsc-gap-nosnap');
  const content=document.getElementById('gsc-gap-content');
  if(!gscQueryOnlyRows.length){if(nosnap)nosnap.style.display='';if(content)content.style.display='none';return;}
  if(nosnap)nosnap.style.display='none';if(content)content.style.display='';
  const gaps=getFilteredGaps();
  const total=gaps.length;
  const pages=Math.max(1,Math.ceil(total/GSC_PAGE_SIZE));
  if(gscGapPage>pages)gscGapPage=1;
  const slice=gaps.slice((gscGapPage-1)*GSC_PAGE_SIZE,gscGapPage*GSC_PAGE_SIZE);
  const tbody=document.getElementById('gap-tbody');
  if(!tbody)return;
  if(!slice.length){
    tbody.innerHTML=`<tr><td colspan="6" style="text-align:center;padding:36px;color:var(--text3)">No content gaps found — all queries have associated pages, or no data pulled yet.</td></tr>`;
  }else{
    tbody.innerHTML=slice.map(r=>`
      <tr>
        <td class="col-kw">${escHtml(r.query)}</td>
        <td style="font-family:var(--mono);font-weight:600">${r.impressions.toLocaleString()}</td>
        <td style="font-family:var(--mono)">${r.position.toFixed(1)}</td>
        <td style="font-family:var(--mono)">${r.clicks.toLocaleString()}</td>
        <td style="font-family:var(--mono)">${(r.ctr*100).toFixed(1)}%</td>
        <td><span class="gap-opp-${r.opportunity}">${r.opportunity==='high'?'High':r.opportunity==='med'?'Medium':'Low'}</span></td>
      </tr>`).join('');
  }
  const lbl=document.getElementById('gap-count-lbl');
  if(lbl)lbl.textContent=`${total.toLocaleString()} gap${total!==1?'s':''}`;
  const pinfo=document.getElementById('gap-pinfo');
  if(pinfo)pinfo.textContent=`${(gscGapPage-1)*GSC_PAGE_SIZE+1}–${Math.min(gscGapPage*GSC_PAGE_SIZE,total)} of ${total.toLocaleString()}`;
  const prev=document.getElementById('gap-prev');const next=document.getElementById('gap-next');
  if(prev)prev.disabled=gscGapPage<=1;if(next)next.disabled=gscGapPage>=pages;
}
function escHtml(str){return(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function exportGapCSV(){
  const gaps=getFilteredGaps();
  if(!gaps.length){toast('No gaps to export','err');return;}
  const hdrs=['query','impressions','avg_position','clicks','ctr','opportunity'];
  const rows=gaps.map(r=>[`"${(r.query||'').replace(/"/g,'""')}"`,r.impressions,r.position.toFixed(2),r.clicks,(r.ctr*100).toFixed(2)+'%',r.opportunity].join(','));
  const csv=[hdrs.join(','),...rows].join('\n');
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));
  a.download='content-gaps-'+A.site+'-'+new Date().toISOString().split('T')[0]+'.csv';
  a.click();toast('Content gaps exported');
}
```

- [ ] **Step 2: Commit**
```bash
git add index.html
git commit -m "feat: add content gap computation, table rendering, sort, filter, export"
```

---

## Task 7: Wire `goView` to handle `gsclive` + call `refreshGscState` on navigation

**Files:**
- Modify: `index.html` — `goView` function

- [ ] **Step 1: Find the `goView` function**

Search for:
```js
function goView(
```

The function shows/hides views by toggling `.active` class. Find where it sets the active view and add a hook for the `gsclive` view. Look for a pattern like `renderAll()` or view-specific render calls after the view switch. Add this block inside `goView`, after the view is shown:

```js
if(v==='gsclive'){refreshGscState();}
```

The exact location: find the line inside `goView` that does something like `if(v==='overview')renderAll()` or similar per-view render calls. Add the gsclive case alongside them. If no per-view calls exist, add it right after the `.active` class toggle logic.

- [ ] **Step 2: Commit**
```bash
git add index.html
git commit -m "feat: wire goView to refresh GSC state on navigation"
```

---

## Task 8: Help section — GSC Live setup guide

**Files:**
- Modify: `index.html` — Help view (`v-help`)

- [ ] **Step 1: Add GSC Live help section**

Find this comment in the Help view:
```html
<!-- STEP 1: EXPORT FROM GSC -->
```
Add immediately **before** it:
```html
<!-- GSC LIVE SETUP -->
<div class="help-sec">
  <div class="help-sec-title">&#128279; GSC Live — setup &amp; FAQ</div>
  <div class="help-body">
    <p>GSC Live lets you pull data directly from Google Search Console without exporting CSV files. Here's how to set it up:</p>
    <ol style="line-height:2.2;padding-left:18px">
      <li>Go to <strong>console.cloud.google.com</strong> and sign in with the Google account that has Search Console access.</li>
      <li>Click the project dropdown at the top → <strong>New Project</strong> → name it anything (e.g. Inside Rank) → Create.</li>
      <li>Go to <strong>APIs &amp; Services → Library</strong> → search <em>Google Search Console API</em> → Enable.</li>
      <li>Go to <strong>APIs &amp; Services → OAuth consent screen</strong> → External → fill in App name and your email → Save. On the Test users page, add every email that will use this tool.</li>
      <li>Go to <strong>APIs &amp; Services → Credentials</strong> → Create Credentials → OAuth client ID → Web application.</li>
      <li>Under Authorized JavaScript origins add <code style="color:var(--teal);font-size:12px">https://insiderank.netlify.app</code> → Create.</li>
      <li>Copy the Client ID → go to <a onclick="goView('settings',null)" style="color:var(--blue);cursor:pointer;font-weight:500">Settings → GSC API</a> → paste and save.</li>
      <li>Go to <a onclick="goView('gsclive',null)" style="color:var(--blue);cursor:pointer;font-weight:500">GSC Live</a> → Connect Google Search Console → authorize → Pull data.</li>
    </ol>
    <ul style="margin-top:14px">
      <li><strong>The token expires after 1 hour.</strong> Click "Connect" again — if you're still logged into Google in the same browser, it re-authorizes silently with no popup.</li>
      <li><strong>25,000 row limit.</strong> GSC Live fetches up to 25,000 queries per pull. Most sites are well under this. If your site has more, the top 25,000 by impressions are returned.</li>
      <li><strong>Adding team members.</strong> Each team member who wants to use GSC Live must be added as a Test User in your Google Cloud project's OAuth consent screen (Step 4 above) and must connect with their own Google account.</li>
      <li><strong>What is Content Gap?</strong> The Content Gap tab shows queries where GSC has impression data but no landing page URL is associated — meaning Google is showing your site for these queries but you haven't created a dedicated page for them yet. Sort by Impressions to find the biggest opportunities.</li>
      <li><strong>Pulled data works like a CSV import.</strong> Every pull creates a snapshot you can set as Period A or Period B in the top bar picker. All existing views (Keywords, Pages, SERP Tracker) work with it automatically.</li>
    </ul>
  </div>
</div>

```

- [ ] **Step 2: Commit**
```bash
git add index.html
git commit -m "feat: add GSC Live setup guide to Help section"
```

---

## Self-Review

**Spec coverage check:**
- ✅ Google OAuth via GIS library — Task 4
- ✅ Client ID in Settings — Task 3
- ✅ GSC Live nav item + view — Task 2
- ✅ 3 view states (no key / not authed / ready) — Task 2 + 4
- ✅ Property selector + date range picker — Task 2 HTML
- ✅ Two API calls (query+page, query-only) — Task 5
- ✅ Snapshot saved in existing format — Task 5
- ✅ Content Gap detection logic — Task 6
- ✅ Content Gap table with sort/filter/export/pagination — Task 6
- ✅ Opportunity scoring (High/Medium/Low) — Task 6
- ✅ Help section setup guide — Task 8
- ✅ `goView` wired for gsclive — Task 7

**No placeholders found.**

**Type consistency:** `gscLiveRows`, `gscQueryOnlyRows`, `gscGapSort`, `gscGapPage`, `GSC_PAGE_SIZE` all defined in Task 4 Step 1 and used consistently in Tasks 5–6.

---

## Verification Checklist (manual browser testing)

After all tasks are complete, verify in the browser at https://insiderank.netlify.app:

- [ ] Settings → GSC API card appears, Client ID saves and persists on reload
- [ ] GSC Live nav item appears in sidebar
- [ ] Without Client ID: onboarding panel with setup steps shows
- [ ] With Client ID: "Connect Google Search Console" button shows
- [ ] Clicking Connect → Google OAuth popup appears → authorizing shows "Connected as [email]"
- [ ] Property dropdown populated with your GSC sites
- [ ] Pull Data → progress bar runs → success toast → snapshot appears in Period picker
- [ ] Content Gap tab → table shows queries with impressions but no page URL
- [ ] Content Gap filters (search, min impressions, position range, opportunity) work
- [ ] Export CSV downloads a valid file
- [ ] Disconnect button clears token and returns to Connect state
- [ ] Existing CSV import flow still works (no regression)
