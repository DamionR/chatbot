(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))e(a);new MutationObserver(a=>{for(const s of a)if(s.type==="childList")for(const i of s.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&e(i)}).observe(document,{childList:!0,subtree:!0});function o(a){const s={};return a.integrity&&(s.integrity=a.integrity),a.referrerPolicy&&(s.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?s.credentials="include":a.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function e(a){if(a.ep)return;a.ep=!0;const s=o(a);fetch(a.href,s)}})();let v,x,h,p,f,y,b;const I=document.createElement("style");document.head.appendChild(I);function L(n){document.body.className=n,q()}function q(){const n=document.body.className==="dark";I.textContent=`
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: ${n?"#333":"white"};
      color: ${n?"white":"black"};
    }
    .main-container {
      display: flex;
      height: 100vh;
    }
    .sidebar {
      width: 200px;
      background-color: ${n?"#444":"#f0f0f0"};
      padding: 10px;
    }
    .nav-button {
      width: 100%;
      padding: 10px;
      margin-bottom: 5px;
      background-color: ${n?"#555":"#ddd"};
      border: none;
      cursor: pointer;
    }
    .content-area {
      flex: 1;
      padding: 20px;
    }
    .chat-view, .settings-view {
      display: none;
    }
    .chat-history {
      height: 70vh;
      overflow-y: scroll;
      padding: 10px;
      border: 1px solid ${n?"#555":"#ccc"};
      margin-bottom: 10px;
      background-color: ${n?"#444":"white"};
    }
    .input-area {
      display: flex;
    }
    .input-area input {
      flex: 1;
      padding: 5px;
    }
    .input-area button {
      margin-left: 10px;
      padding: 5px 10px;
    }
    .settings-form {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .user-message {
      text-align: right;
      background-color: ${n?"#0056b3":"#007bff"};
      color: white;
      padding: 5px;
      margin: 5px;
      border-radius: 5px;
    }
    .assistant-message {
      text-align: left;
      background-color: ${n?"#555":"#f0f0f0"};
      padding: 5px;
      margin: 5px;
      border-radius: 5px;
    }
    .system-message {
      text-align: center;
      color: red;
      font-style: italic;
    }
    @media (max-width: 768px) {
      .main-container {
        flex-direction: column;
      }
      .sidebar {
        width: 100%;
        display: flex;
        justify-content: space-around;
      }
      .content-area {
        padding: 10px;
      }
      .chat-history {
        height: 60vh;
      }
    }
  `}function D(){const n=document.createElement("div");n.className="main-container",document.body.appendChild(n);const t=document.createElement("div");t.className="sidebar";const o=document.createElement("button");o.className="nav-button",o.textContent="Chat",o.onclick=()=>S("chat");const e=document.createElement("button");e.className="nav-button",e.textContent="Settings",e.onclick=()=>S("settings"),t.appendChild(o),t.appendChild(e),n.appendChild(t);const a=document.createElement("div");a.className="content-area",n.appendChild(a),y=document.createElement("div"),y.className="chat-view",v=document.createElement("div"),v.className="chat-history";const s=document.createElement("div");s.className="input-area",x=document.createElement("input"),x.type="text";const i=document.createElement("button");i.textContent="Send";const r=document.createElement("button");r.textContent="Cancel",r.style.display="none",s.appendChild(x),s.appendChild(i),s.appendChild(r),y.appendChild(v),y.appendChild(s),a.appendChild(y),b=document.createElement("div"),b.className="settings-view";const c=document.createElement("div");c.className="settings-form";const l=document.createElement("label");l.textContent="API Key:",h=document.createElement("input"),h.type="text",h.onblur=()=>{apiKey=h.value,saveSetting("apiKey",apiKey).then(populateModels)};const u=document.createElement("label");u.textContent="Select Free Model:",p=document.createElement("select");const d=document.createElement("label");d.textContent="Dark Mode:",f=document.createElement("input"),f.type="checkbox",f.onchange=()=>{const m=f.checked?"dark":"light";L(m),saveSetting("theme",m)},c.appendChild(l),c.appendChild(h),c.appendChild(u),c.appendChild(p),c.appendChild(d),c.appendChild(f),b.appendChild(c),a.appendChild(b),i.addEventListener("click",()=>sendMessage(r)),r.addEventListener("click",()=>cancelStream()),x.addEventListener("keydown",m=>{m.key==="Enter"&&(m.preventDefault(),sendMessage(r))})}function S(n){y.style.display=n==="chat"?"block":"none",b.style.display=n==="settings"?"block":"none",n==="settings"&&populateModels()}const F="modulepreload",_=function(n){return"/chatbot-project/"+n},$={},O=function(t,o,e){let a=Promise.resolve();if(o&&o.length>0){document.getElementsByTagName("link");const i=document.querySelector("meta[property=csp-nonce]"),r=(i==null?void 0:i.nonce)||(i==null?void 0:i.getAttribute("nonce"));a=Promise.allSettled(o.map(c=>{if(c=_(c),c in $)return;$[c]=!0;const l=c.endsWith(".css"),u=l?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${c}"]${u}`))return;const d=document.createElement("link");if(d.rel=l?"stylesheet":F,l||(d.as="script"),d.crossOrigin="",d.href=c,r&&d.setAttribute("nonce",r),document.head.appendChild(d),l)return new Promise((m,T)=>{d.addEventListener("load",m),d.addEventListener("error",()=>T(new Error(`Unable to preload CSS for ${c}`)))})}))}function s(i){const r=new Event("vite:preloadError",{cancelable:!0});if(r.payload=i,window.dispatchEvent(r),!r.defaultPrevented)throw i}return a.then(i=>{for(const r of i||[])r.status==="rejected"&&s(r.reason);return t().catch(s)})},A="chatbotDB",j=2;let g;function K(){return new Promise((n,t)=>{const o=indexedDB.open(A,j);o.onerror=e=>t(e.target.error),o.onsuccess=e=>{g=e.target.result,n(g)},o.onupgradeneeded=e=>{const a=e.target.result;e.oldVersion<1&&(a.createObjectStore("settings",{keyPath:"key"}),a.createObjectStore("chats",{keyPath:"id",autoIncrement:!0}).createIndex("timestamp","timestamp",{unique:!1})),e.oldVersion<2&&a.transaction(["chats"],"readwrite").objectStore("chats").createIndex("sessionId","sessionId",{unique:!1})}})}async function k(n,t,o=3){for(let e=1;e<=o;e++)try{const i=g.transaction(["settings"],"readwrite").objectStore("settings").put({key:n,value:t});await new Promise((r,c)=>{i.onsuccess=()=>r(),i.onerror=l=>c(l.target.error)});return}catch(a){if(e===o)throw new Error(`Failed to save setting after ${o} attempts: ${a.message}`);await new Promise(s=>setTimeout(s,1e3*e))}}async function w(n,t=3){for(let o=1;o<=t;o++)try{const s=g.transaction(["settings"],"readonly").objectStore("settings").get(n);return await new Promise((r,c)=>{s.onsuccess=l=>r(l.target.result?l.target.result.value:null),s.onerror=l=>c(l.target.error)})}catch(e){if(o===t)throw new Error(`Failed to get setting after ${t} attempts: ${e.message}`);await new Promise(a=>setTimeout(a,1e3*o))}}async function H(n,t=50,o=3){for(let e=1;e<=o;e++)try{const r=g.transaction(["chats"],"readonly").objectStore("chats").index("sessionId").getAll(IDBKeyRange.only(n));return(await new Promise((l,u)=>{r.onsuccess=()=>l(r.result),r.onerror=d=>u(d.target.error)})).sort((l,u)=>u.timestamp-l.timestamp).slice(0,t)}catch(a){if(e===o)throw new Error(`Failed to get chats after ${o} attempts: ${a.message}`);await new Promise(s=>setTimeout(s,1e3*e))}}async function B(n=30,t=3){for(let o=1;o<=t;o++)try{const s=g.transaction(["chats"],"readwrite").objectStore("chats").index("timestamp"),i=n*24*60*60*1e3,r=Date.now()-i,c=s.openCursor(IDBKeyRange.upperBound(r));await new Promise((l,u)=>{c.onsuccess=d=>{const m=d.target.result;m?(m.delete(),m.continue()):l()},c.onerror=d=>u(d.target.error)});return}catch(e){if(o===t)throw new Error(`Failed to clean chats after ${t} attempts: ${e.message}`);await new Promise(a=>setTimeout(a,1e3*o))}}async function R(){return[]}let C;function V(){C=document.querySelector(".settings-form"),[{label:"Fallback Models (comma-separated)",id:"fallbackModels",type:"text"},{label:"Provider Order (comma-separated)",id:"providerOrder",type:"text"},{label:"Allow Fallbacks",id:"allowFallbacks",type:"checkbox",default:!0},{label:"Require Parameters",id:"requireParameters",type:"checkbox"},{label:"Data Collection",id:"dataCollection",type:"select",options:["allow","deny"],default:"allow"},{label:"Ignore Providers (comma-separated)",id:"ignoreProviders",type:"text"},{label:"Quantizations (comma-separated)",id:"quantizations",type:"text"},{label:"Sort",id:"sort",type:"select",options:["","price","throughput","latency"]},{label:"Stream",id:"stream",type:"checkbox"},{label:"Max Tokens",id:"maxTokens",type:"number",min:1},{label:"Temperature (0-2)",id:"temperature",type:"number",min:0,max:2,step:.1,default:1},{label:"Top P (0-1)",id:"topP",type:"number",min:0,max:1,step:.1,default:1},{label:"Top K",id:"topK",type:"number",min:0,default:0},{label:"Frequency Penalty (-2-2)",id:"frequencyPenalty",type:"number",min:-2,max:2,step:.1,default:0},{label:"Presence Penalty (-2-2)",id:"presencePenalty",type:"number",min:-2,max:2,step:.1,default:0},{label:"Repetition Penalty (0-2)",id:"repetitionPenalty",type:"number",min:0,max:2,step:.1,default:1},{label:"Min P (0-1)",id:"minP",type:"number",min:0,max:1,step:.1,default:0},{label:"Top A (0-1)",id:"topA",type:"number",min:0,max:1,step:.1,default:0},{label:"Seed",id:"seed",type:"number"},{label:"Response Format (json_object)",id:"responseFormat",type:"text"},{label:"Stop Sequences (comma-separated)",id:"stop",type:"text"},{label:"Max Price Prompt ($/M)",id:"maxPricePrompt",type:"number",step:.1},{label:"Max Price Completion ($/M)",id:"maxPriceCompletion",type:"number",step:.1}].forEach(t=>{const o=document.createElement("label");o.textContent=t.label;let e;t.type==="select"?(e=document.createElement("select"),t.options.forEach(a=>{const s=document.createElement("option");s.value=a,s.textContent=a||"None",e.appendChild(s)}),t.default&&(e.value=t.default)):t.type==="checkbox"?(e=document.createElement("input"),e.type="checkbox",e.checked=t.default||!1):(e=document.createElement("input"),e.type=t.type,t.min!==void 0&&(e.min=t.min),t.max!==void 0&&(e.max=t.max),t.step&&(e.step=t.step),t.default!==void 0&&(e.value=t.default)),e.id=t.id,C.appendChild(o),C.appendChild(e)})}async function M(n,t,o,e=null){try{const s=t.length>1e3?t.substring(0,1e3)+"...":t,i=document.createElement("div");if(i.className=n==="user"?"user-message":n==="assistant"?"assistant-message":"system-message",i.textContent=s,e){const r=document.createElement("div");r.className="system-message",r.textContent=`Metadata: ${JSON.stringify(e)}`,r.style.fontSize="0.8em",r.style.opacity="0.7",chatHistory.appendChild(r)}chatHistory.appendChild(i),chatHistory.scrollTop=chatHistory.scrollHeight,o||console.warn("No sessionId provided, skipping database save")}catch(a){console.error("Error adding message to history:",a);const s=document.createElement("div");s.className="system-message",s.textContent=`Error displaying message: ${a.message}`,chatHistory.appendChild(s),chatHistory.scrollTop=chatHistory.scrollHeight}}let E="",N=null,P=null;async function z(){await K();const n=await w("theme")||"light";L(n),E=await w("apiKey")||"",P=await w("sessionId")||U(),await k("sessionId",P),D(),f.checked=n==="dark",h.value=E,V(),E?await J():M("system","Please enter your API key in settings."),(await H(P)).forEach(e=>M(e.role,e.content)),S("chat");const o=(await O(async()=>{const{default:e}=await import("./orchestrator-B3JlVIDi.js");return{default:e}},[])).default;N=new o,await N.setupClients(),console.log("Orchestrator initialized"),setInterval(()=>B(30).catch(e=>console.error("Cleanup failed:",e)),24*60*60*1e3)}function U(){return"sess_"+Math.random().toString(36).substr(2,9)+"_"+Date.now()}async function J(){const n=await R();p.innerHTML="",n.forEach(o=>{const e=document.createElement("option");e.value=o.id,e.textContent=o.name||o.id,p.appendChild(e)});const t=await w("selectedModel");t&&n.some(o=>o.id===t)?p.value=t:n.length&&(p.value=n[0].id,await k("selectedModel",n[0].id)),p.onchange=()=>k("selectedModel",p.value)}z().catch(console.error);
