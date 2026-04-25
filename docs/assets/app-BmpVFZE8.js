(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))s(i);new MutationObserver(i=>{for(const p of i)if(p.type==="childList")for(const v of p.addedNodes)v.tagName==="LINK"&&v.rel==="modulepreload"&&s(v)}).observe(document,{childList:!0,subtree:!0});function r(i){const p={};return i.integrity&&(p.integrity=i.integrity),i.referrerPolicy&&(p.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?p.credentials="include":i.crossOrigin==="anonymous"?p.credentials="omit":p.credentials="same-origin",p}function s(i){if(i.ep)return;i.ep=!0;const p=r(i);fetch(i.href,p)}})();class Cs extends Error{constructor(t,r,s,i,p){super(t),this.name="ListenerError",this.error=r,this.object=s,this.event=i,this.listener=p}}function Ze(e){if(typeof e!="string"&&typeof e!="symbol")throw new TypeError("Expect event to be a string or symbol.")}function Bt(e){return typeof e=="function"}function Mn(e){if(Bt(e))return e}function er(e){return typeof e=="object"&&e!==null}function Gt(e){if(!Bt(e))throw new TypeError("Expect a function.")}const Fs=(e=Object.create(null),t={})=>{if(!er(e)&&!Bt(e))throw new TypeError("Expect an object or a function.");for(const I of["on","once","off","emit","emitAsync","has"])if(I in e)throw new Error(`Method "${I}" already exists.`);const{strict:r=!1,trace:s=null,error:i=null}=t,p=Mn(s)??null,v=Mn(i)??null,G=e!==Ge,X=(I,A)=>{p==null||p(I,A),G&&Ge.emit(I,A)};X("new",{object:e});const ce=new Set,ee=new Map,de={enumerable:!1,configurable:!0,writable:!0};return Object.defineProperties(e,{on:Object.assign({value:fe},de),once:Object.assign({value:ge},de),off:Object.assign({value:ue},de),emit:Object.assign({value:q},de),emitAsync:Object.assign({value:B},de),has:Object.assign({value:Ae},de)}),e;function H(I,A){let U=ee.get(I);U||ee.set(I,U=new Set),U.add(A)}function te(I,A){const U=ee.get(I);if(!U)return!1;const Q=U.delete(A);return U.size===0&&ee.delete(I),Q}function Y(I,A,U){const Q={error:U,object:e,event:I,listener:A};if(v==null||v(Q),e===Ge&&I==="error")throw new Cs("Error in a global error listener.",U,e,I,A);Ge.emit("error",Q)}function fe(I,A){Ze(I),Gt(A),X("on",{object:e,event:I,listener:A}),H(I,A);let U=!0;return()=>U?(U=!1,te(I,A)):!1}function ge(I,A){Ze(I),Gt(A);const U=fe(I,(...Q)=>{U(),A(...Q)});return U}function ue(I,A){return Ze(I),Gt(A),X("off",{object:e,event:I,listener:A}),te(I,A)}function Ae(I){var A;return Ze(I),(((A=ee.get(I))==null?void 0:A.size)??0)>0}function q(I,...A){Ze(I);const U=ee.get(I)||ce;if(X("emit",{object:e,listeners:[...U],event:I,args:A}),U.size!==0)for(const Q of U)try{Q(...A)}catch(pe){if(Y(I,Q,pe),r)throw pe}}async function B(I,...A){Ze(I);const U=ee.get(I)||ce;if(X("emitAsync",{object:e,listeners:[...U],event:I,args:A}),U.size===0)return;const Q=[...U].map(async pe=>{try{await pe(...A)}catch(we){if(Y(I,pe,we),r)throw we}});await(r?Promise.all(Q):Promise.allSettled(Q))}},Ge=Fs;Ge(Ge);function Ds(e){return!er(e)&&!Bt(e)?!1:typeof e.on=="function"}function tr(e){if(Ds(e))return e}function Le(e){return typeof e=="function"}function pn(e){return typeof e=="object"&&e!==null}function nr(e){if(!Le(e))throw new TypeError("Expect a function.")}function tn(e){if(e.trim()==="")throw new TypeError("Expect watch path to be a non-empty string.");const t=e.split(".");for(const r of t)if(r.trim()==="")throw new TypeError("Expect watch path segments to be non-empty.");return e.split(".").map(r=>r.trim()).filter(r=>r!=="")}function _s(e,t){const r=tn(t);if(r.length===0)return;let s=e;for(const i of r){if(!pn(s)||!(i in s))return;s=s[i]}return s}const rr=(e,t,r)=>{if(Array.isArray(e))throw new TypeError("Watching arrays is not supported.");nr(r);const s=typeof t=="string"?[t]:t;if(!Array.isArray(s))throw new TypeError("Expect properties to be a string or an array of strings.");for(const v of s){if(typeof v!="string")throw new TypeError("Expect properties to be a string or an array of strings.");tn(v)}const i=()=>s.map(v=>_s(e,v)),p=[];for(const v of s){const G=tn(v);let X=null;const ce=()=>{const ee=[],de=(H,te)=>{if(!pn(H)||te>=G.length)return;const Y=G[te],fe=tr(H);if(fe){const ge=fe.on(`set:${Y}`,()=>{r(...i()),te<G.length-1&&X&&(X(),X=ce())});ee.push(ge)}te<G.length-1&&de(H[Y],te+1)};return de(e,0),()=>ee.reduce((H,te)=>te()||H,!1)};X=ce(),p.push(()=>X?X():!1)}return r(...i()),()=>p.reduce((v,G)=>G()||v,!1)};function Ls(e,t){"watch"in e||Object.defineProperty(e,"watch",{configurable:!0,writable:!0,enumerable:!1,value(r,s){return t(typeof r=="string"?this:this,r,s)}})}function Rn(e,t){return Object.prototype.hasOwnProperty.call(e,t)}function Kt(e){if(typeof e=="symbol")return!1;const t=typeof e=="number"?e:Number(e);return!Number.isInteger(t)||t<0||t>=4294967295?!1:typeof e=="number"||e===String(t)}function Os(e){return tr(e)?Le(e.emit):!1}const sr=(e,t={})=>{const{eventful:r=Ge,trace:s=null,shallow:i=!1}=t;nr(r);const p=zt.options,v=new WeakMap,G=H=>{if(i||!pn(H)||Os(H))return H;if(v.has(H))return v.get(H);const te=sr(H,{eventful:r,trace:s,shallow:i});return v.set(H,te),te},X=H=>{if(!i){if(Array.isArray(H)){for(let te=0;te<H.length;te++)H[te]=G(H[te]);return}for(const te of Reflect.ownKeys(H))Rn(H,te)&&(H[te]=G(H[te]))}},ce=H=>{const te=Array.isArray(H);X(H),Ls(H,rr);let Y=null;const fe=new Proxy(H,{set(ge,ue,Ae,q){const B=te&&Kt(ue),I=Reflect.get(ge,ue,q),A=Reflect.set(ge,ue,G(Ae),q);if(Y&&A){const U=Reflect.get(ge,ue,q);if(!Object.is(I,U)){const Q=B?{index:Number(ue),value:U,previous:I}:{property:ue,value:U,previous:I},pe=s||p.trace;Y.emit(`set:${String(ue)}`,Q),Le(pe)&&pe(Y,"set",Q),Y.emit("set",Q)}}return A},deleteProperty(ge,ue){const Ae=te&&Kt(ue),q=Rn(ge,ue),B=q?ge[ue]:void 0,I=Reflect.deleteProperty(ge,ue);if(Y&&I&&q){const A=Ae?{index:Number(ue),previous:B}:{property:ue,previous:B},U=s||p.trace;Y.emit(`delete:${String(ue)}`,A),Le(U)&&U(Y,"delete",A),Y.emit("delete",A)}return I},defineProperty(ge,ue,Ae){const q=Object.getOwnPropertyDescriptor(ge,ue)??null,B=Object.prototype.hasOwnProperty.call(Ae,"value")?{...Ae,value:G(Ae.value)}:Ae,I=Reflect.defineProperty(ge,ue,B),A=te&&(ue==="length"||Kt(ue));if(Y&&!A&&I){const U={property:ue,descriptor:B,previous:q},Q=s||p.trace;Y.emit(`define:${String(ue)}`,U),Le(Q)&&Q(Y,"define",U),Y.emit("define",U)}return I}});return Y=Le(H==null?void 0:H.emit)?fe:r(fe),Y},ee=s||p.trace;if(Array.isArray(e)){const H=ce(e);return Le(ee)&&ee(H,"new"),H}if(e!==null&&typeof e=="object"){const H=ce(e);return Le(ee)&&ee(H,"new",{object:H}),H}const de=r({get value(){return e},set value(H){if(Object.is(H,e))return;const te=e;e=H;const Y={property:"value",value:e,previous:te};de.emit("set:value",Y),Le(ee)&&ee(de,"set",Y),de.emit("set",Y)}});return Le(ee)&&ee(de,"new",{object:de}),de},zt=sr;zt.options={trace:null};zt.watch=rr;const L=zt({apps:[],currentAppId:null,files:[],activeFileName:null,chatMessages:[],generating:!1,error:null});function Fe(e){return new Promise((t,r)=>{e.addEventListener("success",()=>{t(e.result)}),e.addEventListener("error",()=>{r(e.error??new Error("IndexedDB request failed"))})})}function Ms(e,t){return new Promise((r,s)=>{const i=indexedDB.open(e,t.length);i.addEventListener("upgradeneeded",p=>{const v=t.slice(p.oldVersion-1,p.newVersion??t.length-1);for(const G of v)G(i.result)}),i.addEventListener("success",()=>{r(i.result)}),i.addEventListener("blocked",()=>{s(new Error("Database opening is blocked"))}),i.addEventListener("error",()=>{s(i.error??new Error("Failed to open database"))})})}const Rs="asljs-app-builder";let kt=null;async function Ye(){return kt!==null||(kt=await Ms(Rs,[e=>{e.createObjectStore("apps",{keyPath:"id"}),e.createObjectStore("files",{keyPath:"id"}).createIndex("byAppId","appId",{unique:!1})}])),kt}async function $s(){const t=(await Ye()).transaction("apps","readonly");return Fe(t.objectStore("apps").getAll())}async function We(e){const r=(await Ye()).transaction("apps","readwrite");await Fe(r.objectStore("apps").put(e))}async function Us(e){const r=(await Ye()).transaction(["apps","files"],"readwrite");await Fe(r.objectStore("apps").delete(e));const s=r.objectStore("files"),i=await Fe(s.index("byAppId").getAllKeys(e));for(const p of i)await Fe(s.delete(p))}async function Ns(e){const r=(await Ye()).transaction("files","readonly");return Fe(r.objectStore("files").index("byAppId").getAll(e))}async function ar(e){const r=(await Ye()).transaction("files","readwrite");await Fe(r.objectStore("files").put(e))}async function Bs(e){const r=(await Ye()).transaction("files","readwrite");await Fe(r.objectStore("files").delete(e))}async function ir(e,t){const i=(await Ye()).transaction("files","readwrite").objectStore("files"),p=await Fe(i.index("byAppId").getAllKeys(e));for(const v of p)await Fe(i.delete(v));for(const v of t)await Fe(i.put(v))}function or(e){const t=e.trim(),r=/^data:([^;,]+);base64,([a-z0-9+/]+=*)$/i.exec(t.replace(/\s+/g,""));return r===null?null:{mimeType:r[1].toLowerCase(),base64:r[2],dataUrl:t}}function zs(e){return/^image\//i.test(e.trim())}function Ee(e,t,r,s){return{name:e,type:"function",description:t,parameters:{type:"object",properties:r||{},required:s||[],additionalProperties:!1},strict:!0}}const Ws=[Ee("listFileset","List all file paths in the virtual filesystem."),Ee("listFilesByMask","List file paths that match a glob-like mask such as src/*.js or assets/**/*.png.",{mask:{type:"string"},maxFiles:{type:"number"}},["mask","maxFiles"]),Ee("readFile","Read the full text content of a file.",{path:{type:"string"}},["path"]),Ee("readFiles","Read several files in one step. Use maxCharsPerFile to cap each returned file content.",{paths:{type:"array",items:{type:"string"}},maxCharsPerFile:{type:"number"}},["paths","maxCharsPerFile"]),Ee("readFilesByMask","Read all files that match a glob-like mask in one step. Use maxFiles and maxCharsPerFile to keep results bounded.",{mask:{type:"string"},maxFiles:{type:"number"},maxCharsPerFile:{type:"number"}},["mask","maxFiles","maxCharsPerFile"]),Ee("readFileData","Read a binary-safe file stored as a data URL. Returns MIME type, base64 payload, and data URL, or null when the file is plain text.",{path:{type:"string"}},["path"]),Ee("setFilesContent","Create or fully replace several text files in one step.",{files:{type:"array",items:{type:"object",properties:{path:{type:"string"},content:{type:"string"}},required:["path","content"],additionalProperties:!1}}},["files"]),Ee("setFileData","Create or replace a binary-safe file from base64 data. Use this for image assets that should be referenced by path from HTML or CSS.",{path:{type:"string"},mimeType:{type:"string"},base64:{type:"string"}},["path","mimeType","base64"]),Ee("setFileContent","Create or fully replace file content.",{path:{type:"string"},content:{type:"string"}},["path","content"]),Ee("replaceFilePart","Replace part of a file by exact search string.",{path:{type:"string"},search:{type:"string"},replacement:{type:"string"},replaceAll:{type:"boolean"}},["path","search","replacement","replaceAll"]),Ee("deleteFile","Delete a file from the virtual filesystem.",{path:{type:"string"}},["path"]),Ee("grep","Search matching files with a regular expression and return matching lines.",{mask:{type:"string"},pattern:{type:"string"},flags:{type:"string"},maxMatches:{type:"number"}},["mask","pattern","flags","maxMatches"]),Ee("choose","Show a short list of clickable choices in the chat UI. Use this when asking the user to pick from a few clear options.",{question:{type:"string"},options:{type:"array",items:{type:"string"}}},["question","options"]),Ee("evalInApp","Evaluate JavaScript in the running app document context.",{code:{type:"string"}},["code"]),Ee("assertInApp","Run a JavaScript check in the app context and fail if it throws or returns false.",{code:{type:"string"},message:{type:"string"}},["code","message"]),Ee("runAppTests","Run the JSON test suite stored in app.tests.json or another specified file. The app restarts before each test.",{path:{type:"string"}},["path"]),Ee("getAppDiagnostics","Get current runtime logs and errors from the running app."),Ee("runAppAndCollectDiagnostics","Run the app and collect runtime logs and errors after startup.")],$n=350;function Vs(e){async function t(){return[...e.getFiles()].map(q=>q.name).sort((q,B)=>q.localeCompare(B))}async function r(q,B=100){return Un(e,q,B)}async function s(q){const B=ct(e,q),I=B===null?void 0:e.getFiles().find(A=>A.name===B);if(I===void 0)throw new Error(`File not found: ${q}`);return I.content}async function i(q,B=0){const I={};for(const A of q)I[A]=Gs(await s(A),B);return I}async function p(q,B=100,I=0){return i(await r(q,B),I)}async function v(q){return or(await s(q))}async function G(q,B){const I=Hs(e),A=tt(q),U=ct(e,A),Q=e.getFiles().find(we=>we.name===(U??A));if(Q!==void 0){const we={...Q,content:B};await e.saveFile(we),e.setFiles(e.getFiles().map(le=>le.id===we.id?we:le)),nn(we.name)||e.setActiveFileName(we.name);return}const pe={id:e.createFileId(),appId:I,name:A,content:B};await e.saveFile(pe),e.setFiles([...e.getFiles(),pe]),nn(pe.name)||e.setActiveFileName(pe.name)}async function X(q,B,I){await G(q,`data:${qs(B)};base64,${Js(I)}`)}async function ce(q){for(const B of q)await G(B.path,B.content)}async function ee(q){const B=ct(e,q),I=B===null?void 0:e.getFiles().find(U=>U.name===B);if(I===void 0)return;await e.deleteFileById(I.id);const A=e.getFiles().filter(U=>U.id!==I.id);e.setFiles(A),e.getActiveFileName()===q&&e.setActiveFileName(Zs(A))}async function de(q,B,I,A=!1){if(B==="")throw new Error("Search text cannot be empty.");const U=ct(e,q);if(U===null)throw new Error(`File not found: ${q}`);const Q=await s(U);if(!Q.includes(B))throw new Error(`Search text not found in ${U}.`);let pe=Q;if(A)pe=Q.split(B).join(I);else{const we=Q.indexOf(B);if(Q.indexOf(B,we+B.length)!==-1)throw new Error("Search text is ambiguous. Use replaceAll=true or provide a more specific search block.");pe=Q.slice(0,we)+I+Q.slice(we+B.length)}await G(U,pe)}async function H(q){if(e.getFiles().length===0)throw new Error("No files available to run.");e.runApp();try{return await e.evaluateInApp(q)}catch{return e.runApp(),e.evaluateInApp(q)}}async function te(q,B,I="",A=100){const U=[],Q=Ys(B,I);for(const pe of Un(e,q,Number.MAX_SAFE_INTEGER)){const le=(await s(pe)).split(/\r?\n/);for(let N=0;N<le.length;N+=1)if(Q.lastIndex=0,!!Q.test(le[N])&&(U.push({path:pe,line:N+1,text:le[N]}),U.length>=A))return U}return U}async function Y(q,B){const I=q.trim(),A=B.map(U=>U.trim()).filter(U=>U!=="");if(I==="")throw new Error("Choice question cannot be empty.");if(A.length<2)throw new Error("Choice options must include at least two items.");e.showChoicePrompt(I,A)}async function fe(q,B){const I=await H(q);if(I===!1)throw new Error((B==null?void 0:B.trim())||"App assertion returned false.");return I}async function ge(q="app.tests.json"){const B=ct(e,q);if(B===null)throw new Error(`Test file not found: ${q}`);const I=Qs(await s(B)),A=[];for(const U of I)try{if(e.runApp(),await e.wait(e.diagnosticsDelayMs??$n),await e.evaluateInApp(U.code)===!1)throw new Error("Test returned false.");A.push({name:U.name,ok:!0})}catch(Q){A.push({name:U.name,ok:!1,error:Q instanceof Error?Q.message:String(Q)})}return{path:B,total:A.length,passed:A.filter(U=>U.ok).length,failed:A.filter(U=>!U.ok).length,results:A}}async function ue(){return e.getAppDiagnostics()}async function Ae(){return e.runApp(),await e.wait(e.diagnosticsDelayMs??$n),e.getAppDiagnostics()}return{listFileset:t,listFilesByMask:r,readFile:s,readFiles:i,readFilesByMask:p,readFileData:v,setFilesContent:ce,setFileData:X,setFileContent:G,deleteFile:ee,replaceFilePart:de,grep:te,choose:Y,evalInApp:H,assertInApp:fe,runAppTests:ge,getAppDiagnostics:ue,runAppAndCollectDiagnostics:Ae}}function Hs(e){const t=e.getCurrentAppId();if(t===null)throw new Error("No active app. Create or open an app first.");return t}function tt(e){const t=e.trim().replace(/\\/g,"/").replace(/^\.\//,"").replace(/^\/+/,"");if(t==="")throw new Error("Path cannot be empty.");if(t.includes(".."))throw new Error("Parent path segments are not allowed.");return t}function nn(e){return tt(e).startsWith(".")}function qs(e){const t=e.trim().toLowerCase();if(t==="")throw new Error("MIME type cannot be empty.");if(!/^[a-z0-9!#$&^_.+-]+\/[a-z0-9!#$&^_.+-]+$/i.test(t))throw new Error(`Invalid MIME type: ${e}`);return t}function Js(e){const t=e.trim().replace(/^data:[^,]+,/,"").replace(/\s+/g,"");if(t==="")throw new Error("Base64 data cannot be empty.");if(!/^[a-z0-9+/]+=*$/i.test(t))throw new Error("Base64 data contains invalid characters.");return t}function Gs(e,t){if(!Number.isFinite(t)||t<=0)return e;const r=Math.floor(t);return e.length<=r?e:`${e.slice(0,r)}
...[truncated]`}function Un(e,t,r){const s=Ks(t),i=Xs(r,100);return e.getFiles().map(p=>p.name).filter(p=>s.test(tt(p))).sort((p,v)=>p.localeCompare(v)).slice(0,i)}function Ks(e){const r=tt(e).replace(/[.+^${}()|[\]\\]/g,"\\$&").replace(/\*\*/g,"::DOUBLE_STAR::").replace(/\*/g,"[^/]*").replace(/\?/g,"[^/]").replace(/::DOUBLE_STAR::/g,".*");return new RegExp(`^${r}$`,"i")}function Ys(e,t){const r=Array.from(new Set(t.replace(/g/g,"").split(""))).join("");return new RegExp(e,r)}function Xs(e,t){return!Number.isFinite(e)||e<=0?t:Math.floor(e)}function Qs(e){let t;try{t=JSON.parse(e)}catch{throw new Error("Test suite file must be valid JSON.")}const r=Array.isArray(t)?t:t.tests;if(!Array.isArray(r))throw new Error("Test suite file must be an array or an object with a tests array.");return r.map((s,i)=>{if(s===null||typeof s!="object")throw new Error(`Invalid test case at index ${i}.`);const p=s;if(typeof p.name!="string"||p.name.trim()==="")throw new Error(`Test case ${i+1} is missing a name.`);if(typeof p.code!="string"||p.code.trim()==="")throw new Error(`Test case ${p.name} is missing code.`);return{name:p.name,code:p.code}})}function Zs(e){var t;return((t=e.find(r=>!nn(r.name)))==null?void 0:t.name)??null}function ct(e,t){const r=tt(t),s=e.getFiles().find(i=>tt(i.name).toLowerCase()===r.toLowerCase());return(s==null?void 0:s.name)??null}function ea(e){return typeof e!="object"||e===null?!1:e.type==="function_call"}function lr(e){if(typeof e.name!="string"||e.name.trim()==="")throw new Error("Tool call missing function name.");return e.name}function ta(e){if(typeof e.call_id!="string"||e.call_id.trim()==="")throw new Error("Tool call missing call_id.");return e.call_id}async function na(e,t){const r=lr(e),s=ra(e.arguments);try{switch(r){case"listFileset":{const i=await t.listFileset();return ke(i)}case"listFilesByMask":{const i=await t.listFilesByMask(ve(s,"mask"),dt(s,"maxFiles",100));return ke(i)}case"readFile":{const i=await t.readFile(ve(s,"path"));return ke(i)}case"readFiles":{const i=await t.readFiles(Nn(s,"paths"),dt(s,"maxCharsPerFile",0));return ke(i)}case"readFilesByMask":{const i=await t.readFilesByMask(ve(s,"mask"),dt(s,"maxFiles",100),dt(s,"maxCharsPerFile",0));return ke(i)}case"readFileData":{const i=await t.readFileData(ve(s,"path"));return ke(i)}case"setFilesContent":return await t.setFilesContent(sa(s,"files")),ke("ok");case"setFileData":return await t.setFileData(ve(s,"path"),ve(s,"mimeType"),ve(s,"base64")),ke("ok");case"setFileContent":return await t.setFileContent(ve(s,"path"),ve(s,"content")),ke("ok");case"replaceFilePart":return await t.replaceFilePart(ve(s,"path"),ve(s,"search"),ve(s,"replacement"),aa(s,"replaceAll",!1)),ke("ok");case"deleteFile":return await t.deleteFile(ve(s,"path")),ke("ok");case"grep":{const i=await t.grep(ve(s,"mask"),ve(s,"pattern"),ve(s,"flags",""),dt(s,"maxMatches",100));return ke(i)}case"choose":return await t.choose(ve(s,"question"),Nn(s,"options")),ke("ok");case"evalInApp":{const i=await t.evalInApp(ve(s,"code"));return ke(i)}case"assertInApp":{const i=await t.assertInApp(ve(s,"code"),ve(s,"message",""));return ke(i)}case"runAppTests":{const i=await t.runAppTests(ve(s,"path","app.tests.json"));return ke(i)}case"getAppDiagnostics":{const i=await t.getAppDiagnostics();return ke(i)}case"runAppAndCollectDiagnostics":{const i=await t.runAppAndCollectDiagnostics();return ke(i)}default:return Bn(`Unknown tool: ${r}`)}}catch(i){return Bn(i instanceof Error?i.message:String(i))}}function ra(e){if(e===void 0)return{};if(typeof e=="object"&&e!==null)return e;if(typeof e!="string")throw new Error("Invalid tool arguments value.");try{const t=JSON.parse(e);if(typeof t!="object"||t===null)throw new Error("Tool arguments must be a JSON object.");return t}catch{throw new Error("Invalid tool arguments JSON.")}}function ve(e,t,r){const s=e[t];if(s===void 0&&r!==void 0)return r;if(typeof s!="string")throw new Error(`Tool argument "${t}" must be a string.`);return s}function Nn(e,t){const r=e[t];if(!Array.isArray(r)||r.some(s=>typeof s!="string"))throw new Error(`Tool argument "${t}" must be an array of strings.`);return r}function sa(e,t){const r=e[t];if(!Array.isArray(r))throw new Error(`Tool argument "${t}" must be an array.`);return r.map((s,i)=>{if(typeof s!="object"||s===null||Array.isArray(s))throw new Error(`Tool argument "${t}" entry ${i+1} must be an object.`);const p=s;if(typeof p.path!="string"||typeof p.content!="string")throw new Error(`Tool argument "${t}" entry ${i+1} must include string path and content fields.`);return{path:p.path,content:p.content}})}function dt(e,t,r){const s=e[t];if(s===void 0)return r;if(typeof s!="number"||Number.isNaN(s))throw new Error(`Tool argument "${t}" must be a number.`);return s}function aa(e,t,r){const s=e[t];if(s===void 0)return r;if(typeof s!="boolean")throw new Error(`Tool argument "${t}" must be a boolean.`);return s}function ke(e){return cr({ok:!0,value:e})}function Bn(e){return cr({ok:!1,error:e})}function cr(e){try{return JSON.stringify(e)}catch{return'{"ok":false,"error":"Failed to serialize tool result."}'}}const ia="https://api.openai.com/v1/responses",oa="gpt-5.3-codex",pt=20,la="You are an expert ASLJS app generator.",ca=12,da={createResponse:async e=>{const t=await fetch(ia,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${e.apiKey}`},body:JSON.stringify({model:e.model,instructions:e.instructions,temperature:e.temperature,previous_response_id:e.previous_response_id,input:e.input,tools:e.tools})});if(!t.ok){const r=await t.json().catch(()=>({})),s=fa(r)??`OpenAI API error: ${t.status}`;throw new Error(s)}return t.json()}};async function ua(e,t,r,s,i){var de;const p=(i==null?void 0:i.transport)??da,v=(i==null?void 0:i.systemPrompt)??la;let G,X=e,ce=pa(i==null?void 0:i.initialToolStepLimit),ee=0;for(;;){if(await ut(i,`Step ${ee+1}: requesting assistant response...`),ee>=ce){if(!(await((de=i==null?void 0:i.onToolStepLimit)==null?void 0:de.call(i,{stepsCompleted:ee,stepLimit:ce}))??!1))throw new Error("AI exceeded maximum tool steps without completing.");ce+=ca,await ut(i,`Extended step limit to ${ce}. Continuing...`)}const H=await p.createResponse({apiKey:t,model:r,instructions:v,temperature:.1,previous_response_id:G,input:X,tools:Ws});if(!Array.isArray(H.output))throw new Error("AI returned an unexpected response format.");const te=H.output.filter(ea);if(te.length===0){await ut(i,`Completed in ${ee+1} step(s). Finalizing summary...`);const fe=ma(H);return{summary:fe===""?"Completed tool-based update.":fe}}const Y=[];for(const fe of te){await ut(i,`Step ${ee+1}: running ${lr(fe)}...`);const ge=await na(fe,s);Y.push({type:"function_call_output",call_id:ta(fe),output:ge})}await ut(i,`Step ${ee+1}: submitted ${Y.length} tool result(s).`),G=typeof H.id=="string"?H.id:G,X=Y,ee+=1}}function pa(e){if(!Number.isFinite(e))return pt;const t=Math.floor(e);return t>=1?t:pt}async function ut(e,t){(e==null?void 0:e.onProgress)!==void 0&&await Promise.resolve(e.onProgress(t))}function fa(e){const t=e.error;return typeof(t==null?void 0:t.message)=="string"?t.message:null}function ma(e){return typeof e.output_text=="string"&&e.output_text.trim()!==""?e.output_text.trim():Array.isArray(e.output)?e.output.filter(r=>r.type==="message").flatMap(r=>r.content??[]).map(r=>r.text??"").map(r=>r.trim()).filter(r=>r!=="").join(`
`):""}const ha=`# ASLJS Observable AI Guidance\r
\r
## Purpose\r
\r
Use this file as AI-facing guidance for \`asljs-observable\`.\r
\r
This package makes objects, arrays, and primitive boxes emit change events and\r
supports path-based watching.\r
\r
## Package Scope\r
\r
Exports from \`src/index.ts\`:\r
\r
- \`observable\`\r
- \`ObservableObject\`\r
- observable-related event, options, trace, and watch types\r
\r
## Preferred Usage Patterns\r
\r
- Use \`observable(value, options?)\` to wrap plain objects, arrays, or\r
  primitives.\r
- Use \`.watch(pathOrPaths, callback)\` for path-based reactive reads.\r
- Use \`ObservableObject\` when implementing a class with explicit getters and\r
  setters.\r
- Keep change notifications expressed through \`set\`, \`delete\`, and \`define\`\r
  events.\r
\r
## Constraints To Preserve\r
\r
- Objects, arrays, and primitive boxes have different payload shapes; do not\r
  merge them into a vague generic payload.\r
- More specific events fire before the generic event, for example \`set:a\`\r
  before \`set\`.\r
- \`watch(...)\` runs immediately with current values and returns an unsubscribe\r
  function.\r
- Nested path watching is supported where an observable/eventful segment exists\r
  along the path.\r
- Arrays are not supported by \`watch(...)\` yet and that limitation is part of\r
  current public guidance.\r
- \`shallow: true\` must remain top-level-only conversion.\r
\r
## Validation\r
\r
- \`npm -w asljs-observable run test\`\r
- \`npm -w asljs-observable run typecheck\`\r
- \`npm -w asljs-observable run lint\`\r
\r
Update this file when AI-facing constraints, preserved payload semantics, or\r
validation commands change. Update \`README.md\` separately only when\r
user-facing behavior changes.\r
`,ga="# ASLJS Eventful AI Guidance\r\n\r\n## Purpose\r\n\r\nUse this file as AI-facing guidance for `asljs-eventful`.\r\n\r\nThis package adds lightweight event methods to plain objects and provides a\r\nbase class for event-capable types.\r\n\r\n## Package Scope\r\n\r\nExports from `src/index.ts`:\r\n\r\n- `eventful`\r\n- `EventfulBase`\r\n- `EventfulLike`, `isEventfulLike`, `asEventfulLike`\r\n- event-related types and `ListenerError`\r\n\r\n## AI Quick Reference\r\n\r\nMain exports:\r\n\r\n- `eventful` to add event methods to an object or instance\r\n- `EventfulBase` for class hierarchies that should be event-capable by design\r\n- `isEventfulLike` and `asEventfulLike` for compatibility checks\r\n- `Eventful`, `EventMap`, `EventfulOptions`, `Listener`, and related types for\r\n  TypeScript usage\r\n- `ListenerError` for listener-failure handling\r\n\r\nChoose this API when:\r\n\r\n- plain object or existing instance needs events -> use `eventful(target)`\r\n- class hierarchy is under your control -> use `EventfulBase`\r\n- class cannot change inheritance -> call `eventful(this)` in the constructor\r\n- code needs to accept unknown values safely -> use `isEventfulLike` or\r\n  `asEventfulLike`\r\n- TypeScript event signatures matter -> define an event map and use the\r\n  exported eventful types\r\n\r\nStable public behaviors:\r\n\r\n- `eventful` adds `on`, `once`, `off`, `emit`, `emitAsync`, and `has`\r\n- the package-level `eventful` function is also a global emitter\r\n- strict mode propagates listener errors\r\n- non-strict mode routes listener failures through the configured error path\r\n- `trace`, `strict`, and `error` are public option behaviors\r\n\r\nSpecial behavior:\r\n\r\n- `eventful` is both the object enhancer and the package-level global emitter\r\n- lifecycle, trace, and listener-error changes must preserve that global\r\n  emitter contract\r\n\r\nDo not assume:\r\n\r\n- DOM `EventTarget` terminology or behavior maps directly to this package\r\n- event bubbling or capture semantics exist here\r\n- wildcard events are supported\r\n- listener return values control emit flow\r\n- strict mode is the default\r\n\r\nAvoid this when:\r\n\r\n- you are removing or bypassing the global-emitter behavior of `eventful`\r\n- you are introducing heavier abstractions where object enhancement is enough\r\n\r\nCommon mistakes:\r\n\r\n- treating `eventful(target)` and `EventfulBase` as interchangeable style only\r\n  rather than a design choice\r\n- forgetting that strict and non-strict error flows are intentionally different\r\n- changing trace or lifecycle behavior without preserving package-level\r\n  `eventful` events\r\n- using internal source files instead of the package-root export surface\r\n\r\n## Preferred Usage Patterns\r\n\r\n- Use `eventful(target)` to enhance plain objects or class instances.\r\n- Use `EventfulBase` when inheritance is already the natural design.\r\n- In TypeScript, declare event maps and use the exported `Eventful<...>` types\r\n  to preserve listener signatures.\r\n- Prefer package event semantics over DOM `EventTarget` semantics when working\r\n  inside this package.\r\n\r\n## Stable Behavior\r\n\r\nTreat these as public contract behaviors that should not drift silently:\r\n\r\n- `eventful` adds `on`, `once`, `off`, `emit`, `emitAsync`, and `has`\r\n- `eventful` also acts as a package-level global emitter\r\n- strict mode propagates listener errors\r\n- non-strict mode isolates listener failures through the configured error path\r\n- `ListenerError` protects against recursive failures in global error handling\r\n\r\n## Constraints To Preserve\r\n\r\n- The core object API is `on`, `once`, `off`, `emit`, `emitAsync`, and `has`.\r\n- The package-level `eventful` function is also a global emitter for lifecycle\r\n  and error events; do not remove that behavior silently.\r\n- `trace`, `strict`, and `error` options are documented public behavior.\r\n- Strict mode propagates listener errors; non-strict flows route them through\r\n  the configured error handler.\r\n- Keep the library lightweight and object-oriented; avoid introducing heavier\r\n  abstractions unless explicitly requested.\r\n\r\n## Change Safety Checklist\r\n\r\n- If changing error behavior, then verify both strict and non-strict flows.\r\n- If changing trace behavior, then verify both package-level and per-instance\r\n  trace paths.\r\n- If changing lifecycle events, then preserve the package-level global emitter\r\n  behavior.\r\n- If changing typing, then preserve listener signatures in the TypeScript\r\n  usage patterns.\r\n\r\n## Validation\r\n\r\n- `npm -w asljs-eventful run test`\r\n- `npm -w asljs-eventful run typecheck`\r\n- `npm -w asljs-eventful run lint`\r\n\r\n## Related Packages\r\n\r\n- If the task is really about property change tracking, move to\r\n  `asljs-observable`.\r\n- If the task is really about DOM binding or browser template updates, move to\r\n  `asljs-data-binding`.\r\n\r\nUpdate this file when AI-facing constraints, exported surface expectations, or\r\nvalidation commands change. Update `README.md` separately only when\r\nuser-facing behavior changes.\r\n",ya=`# ASLJS Data Binding AI Guidance\r
\r
## Purpose\r
\r
Use this file as AI-facing guidance for \`asljs-data-binding\`.\r
\r
This package provides declarative DOM binding through explicit\r
\`data-bind-*\` attributes and \`bindDataModel(root, model, options?)\`.\r
\r
## Package Scope\r
\r
Exports from \`src/index.ts\`:\r
\r
- \`bindDataModel\`\r
- \`createBuiltInPipes\`\r
- \`BindDataModelOptions\`\r
- \`DataModel\`\r
\r
Binding families in this package:\r
\r
- value bindings\r
- event bindings\r
- context bindings\r
\r
## AI Quick Reference\r
\r
Binding contract at a glance:\r
\r
- value bindings are path-based\r
- event bindings are path-based\r
- context bindings switch subtree model roots\r
- pipe args are static strings\r
- event actions are invoked as \`(event, model, element)\`\r
- missing actions warn instead of crashing the whole binding system\r
\r
Choose this binding family when:\r
\r
- you need text output -> \`data-bind-text\`\r
- you need HTML output -> \`data-bind-html\`\r
- you need an attribute value -> \`data-bind-<attr>\`\r
- you need a DOM property -> \`data-bind-prop-<name>\`\r
- you need a class toggle -> \`data-bind-class-<name>\`\r
- you need an event handler -> \`data-bind-on<event>\`\r
- you need a subtree context switch -> \`data-bind-context\`\r
\r
Unsupported syntax:\r
\r
- no inline function-call expressions like \`save(item.id)\`\r
- no computed expressions like \`price * qty\`\r
- no reactive pipe arguments\r
- no template-language control structures inside attributes\r
- no implicit two-way binding syntax\r
\r
## Preferred Usage Patterns\r
\r
- Keep bindings explicit through \`data-bind-*\` attributes.\r
- Use \`data-bind-context\` to switch descendant binding roots instead of\r
  repeating long model paths.\r
- Keep value bindings path-based and pipe-based.\r
- Keep event bindings path-based and resolve actions from the model.\r
- Use multiple bindings on the same element when they represent distinct\r
  concerns.\r
\r
## Common Wrong Assumptions\r
\r
- this is a general expression language\r
- binding attributes support arbitrary JavaScript\r
- event bindings resolve inline calls instead of model paths\r
- pipe arguments are reactive values\r
- reactivity comes from automatic dependency tracking instead of watched paths\r
\r
## Constraints To Preserve\r
\r
- Event bindings currently resolve a function and invoke it as\r
  \`(event, model, element)\`.\r
- Do not introduce expression-call syntax in binding attributes unless\r
  explicitly requested.\r
- Pipe arguments are static strings, not reactive model paths.\r
- \`data-bind-context\` rebinding must continue to dispose stale descendant\r
  watchers when context objects are replaced.\r
- Nullish behavior is part of the contract:\r
  text/html render empty string, nullish attributes are removed.\r
- Missing or non-function event handlers warn and keep bindings alive.\r
\r
## Safe Authoring Rules\r
\r
- keep each binding attribute focused on one concern\r
- prefer multiple binding attributes over overloaded single expressions\r
- use \`data-bind-context\` instead of repeating long nested paths\r
- keep handler names on the model\r
- keep pipe args literal unless a custom pipe expects string args\r
\r
## Change Safety Checklist\r
\r
- If changing event binding, then re-check invocation shape \`(event, model,\r
  element)\`.\r
- If changing context behavior, then re-check stale watcher disposal.\r
- If changing nullish behavior, then re-check text, html, and attribute cases.\r
- If changing syntax parsing, then re-check quoted pipe arguments.\r
- If changing value binding, then re-check that watch path subscriptions depend\r
  only on the main path.\r
\r
## Related Packages\r
\r
- If the task is really about model reactivity, move to \`asljs-observable\`.\r
- If the task is really about event primitives, move to \`asljs-eventful\`.\r
- If the task is really about reusable UI elements, move to\r
  \`asljs-components\`.\r
\r
## Validation\r
\r
- \`npm -w asljs-data-binding run test\`\r
- \`npm -w asljs-data-binding run typecheck\`\r
- \`npm -w asljs-data-binding run lint\`\r
\r
Update this file when AI-facing binding constraints, preserved runtime\r
contracts, or validation commands change. Update \`README.md\` separately only\r
when user-facing binding usage or behavior changes.\r
`,ba=`# ASLJS Components AI Guidance

## Purpose

Use this file as AI-facing guidance for \`asljs-components\`.

This package currently exports the \`List\` web component and its related types.

## Package Scope

Exports from \`src/index.ts\`:

- \`List\`
- \`ListItem\`
- \`ListItemsSource\`
- \`ListRowContext\`

Current custom element:

- \`asljs-list\`

## AI Quick Reference

Component contract at a glance:

- import with \`import 'asljs-components';\`
- current custom element: \`asljs-list\`
- required row template: \`template[data-slot="item"]\`
- optional templates: \`template[data-slot="empty"]\` and
  \`template[data-slot="container"]\`
- container templates must include \`[data-role="items"]\`
- row bindings expose \`item\`, \`index\`, \`first\`, \`last\`, \`odd\`, \`even\`,
  \`count\`, and \`context\`

Use this package when:

- you want reusable web components already designed for ASLJS patterns
- you specifically want \`asljs-list\` rather than raw DOM binding

Use another package when:

- you only need DOM binding -> \`asljs-data-binding\`
- you need state reactivity -> \`asljs-observable\`
- you need event primitives -> \`asljs-eventful\`

## Preferred Usage Patterns

### Register components once

\`\`\`ts
import 'asljs-components';
\`\`\`

Create and configure elements through normal DOM APIs.

### Use slot templates for rendering

Inside \`asljs-list\`, use:

- required: \`template[data-slot="item"]\`
- optional: \`template[data-slot="empty"]\`
- optional: \`template[data-slot="container"]\` with required
  \`[data-role="items"]\`

If \`items\` is non-empty and no item template is provided, the component warns
and renders nothing.

### Use row bindings through \`asljs-data-binding\`

Row binding context fields are:

- \`item\`
- \`index\`
- \`first\`
- \`last\`
- \`odd\`
- \`even\`
- \`count\`
- \`context\`

Prefer path-based binding expressions such as:

- \`item.title\`
- \`index\`
- \`context.select\`

### Use \`list.context\` for shared row actions and state

\`List.context\` is the shared base context. Row rendering derives a row-local
context that includes row-specific \`item\` and \`index\` values and binds base
context methods to that derived object.

If a handler needs row data, prefer the \`context\` plus \`this\` pattern.

## How Row Actions Receive Row Data

- handlers should usually be referenced as \`context.someAction\`
- row-specific values arrive through the derived row-local \`this\` context
- the derived row context includes at least \`item\` and \`index\`
- do not invent inline argument syntax like \`select(item.id)\`

## Common Wrong Assumptions

- this is React-style callback rendering
- this is template-expression syntax with inline function calls
- row actions should pass arguments in attributes
- any container template shape is acceptable
- item rendering is driven by imperative callbacks instead of templates

## Constraints To Preserve

- Keep row rendering template-driven.
- Keep event bindings path-based; do not add parameter-expression syntax.
- Do not introduce custom invocation protocols such as \`*-args\` or inline call
  expressions for bindings.
- \`template[data-slot="container"]\` must keep \`[data-role="items"]\` as the
  insertion point.
- \`List.items\` can be a plain array or an eventful-like collection; when the
  source emits \`set\`, \`delete\`, or \`define\`, list rerender behavior is part of
  the current design.

## Safe Authoring Rules

- keep row templates declarative
- use \`context\` methods for shared row actions
- avoid custom attribute protocols
- do not mutate slot templates at runtime
- update \`list.items\` or the source collection instead of rewriting row DOM

## Change Safety Checklist

- If touching row rendering, then preserve template-driven rendering.
- If touching container handling, then preserve \`[data-role="items"]\` as the
  insertion point.
- If touching row context, then preserve the documented field names.
- If touching event binding integration, then preserve path-based
  \`asljs-data-binding\` handler rules.
- If touching item sources, then preserve rerender behavior for arrays and
  eventful-like collections.

## Validation

- \`npm -w asljs-components run test\`
- \`npm -w asljs-components run typecheck\`
- \`npm -w asljs-components run lint\`

Update this file when AI-facing constraints, exported surface expectations, or
validation commands change. Update \`README.md\` separately only when
user-facing usage or behavior changes.
`,va=`# ASLJS Dali AI Guidance\r
\r
## Purpose\r
\r
Use this file as AI-facing guidance for \`asljs-dali\`.\r
\r
\`asljs-dali\` is an IndexedDB data layer centered on typed \`Table<T>\` access,\r
cross-tab observation, live views, transaction helpers, event-source helpers,\r
and saga helpers.\r
\r
## Package Scope\r
\r
Package exports from \`src/index.ts\` include:\r
\r
- DB helpers: \`dbOpen\`, \`dbDelete\`, \`dbRequestAsync\`\r
- Tables and live views: \`Table\`, \`LiveRecord\`, \`LiveRecordSet\`\r
- Observation and broadcast types\r
- Version and delete strategies\r
- Transaction helpers: \`txRead\`, \`txWrite\`, \`txDone\`, \`txEnsure\`,\r
  \`txReuseOrCreate\`, \`TxMode\`\r
- Event-source helpers and managers\r
- Saga helpers and managers\r
\r
## AI Quick Reference\r
\r
Choose this API when:\r
\r
- you need a one-time single-row read -> \`getOne(key)\`\r
- you need a one-time filtered scan -> \`scan(predicate)\`\r
- you need live single-row tracking -> \`record(key)\`\r
- you need live filtered tracking -> \`recordset(predicate)\`\r
- you need local-only mutation notifications -> \`notify(...)\`\r
- you need local plus remote committed notifications -> \`observe(...)\`\r
\r
Public contracts:\r
\r
- \`notify(...)\` is local-only\r
- \`observe(...)\` includes remote committed changes\r
- broadcasts happen only after successful commit\r
- remote messages are not re-published\r
- \`record(key)\` is key-based only\r
- \`recordset(predicate)\` is client-side predicate filtering only\r
\r
What not to assume:\r
\r
- joins are available\r
- server-style query planners are available\r
- \`recordset(predicate)\` performs DB-level query composition\r
- live sets imply automatic ordering semantics\r
- remote messages are echoed back out again\r
\r
## Preferred Usage Patterns\r
\r
- Model stores through \`Table<T>\` instead of ad hoc request plumbing.\r
- Use \`notify(...)\` for local-only subscribers.\r
- Use \`observe(...)\` only when cross-tab or remote-origin events are needed.\r
- Use \`record(key)\` and \`recordset(predicate)\` for live-first consumers.\r
- Use snapshot methods like \`getOne(...)\` and \`scan(...)\` when reactivity is\r
  not needed.\r
- Keep broadcast delivery post-commit only.\r
\r
## Common Wrong Assumptions\r
\r
- \`recordset(predicate)\` is a database query planner\r
- \`notify(...)\` includes remote tab changes\r
- \`observe(...)\` re-broadcasts remote changes\r
- live views imply joins or rich query composition\r
- broadcast delivery happens during tentative mutations instead of after\r
  commit\r
\r
## Constraints To Preserve\r
\r
- \`notify(...)\` must remain local-only.\r
- \`observe(...)\` must continue to receive local and remote committed changes.\r
- Remote messages must not be re-published by receiving table instances.\r
- Broadcast loop prevention through per-instance origin handling is part of the\r
  current contract.\r
- \`record(key)\` is key-based only; do not imply join/query semantics.\r
- \`recordset(predicate)\` is client-side predicate filtering; do not imply DB\r
  query composition, ordering, or joins.\r
- Keep optimistic concurrency behavior aligned with the exported version\r
  strategies and conflict error type.\r
\r
## Safe Usage Rules\r
\r
- use \`Table<T>\` before dropping to raw transaction helpers\r
- prefer snapshot reads unless reactivity is actually needed\r
- use \`observe(...)\` only when remote-origin changes matter\r
- dispose live views when they are no longer needed\r
- do not describe \`recordset(predicate)\` as a full query engine\r
\r
## Change Safety Checklist\r
\r
- If touching observation, then re-check \`notify(...)\` vs \`observe(...)\`.\r
- If touching live views, then re-check snapshot alternatives and stated\r
  limits.\r
- If touching broadcast handling, then re-check post-commit-only behavior and\r
  echo suppression.\r
- If touching version strategies, then re-check documented conflict behavior.\r
- If touching live containers, then re-check their eventful and observable\r
  surfaces.\r
\r
## Related Packages\r
\r
- If the task is really about event primitives, move to \`asljs-eventful\`.\r
- If the task is really about path watching and reactive property access, move\r
  to \`asljs-observable\`.\r
- If the task is really about DOM binding on observable models, move to\r
  \`asljs-data-binding\`.\r
\r
## Validation\r
\r
- \`npm -w asljs-dali run test\`\r
- \`npm -w asljs-dali run typecheck\`\r
- \`npm -w asljs-dali run lint\`\r
\r
Update this file when AI-facing constraints, exported surface expectations, or\r
validation commands change. Update \`README.md\` separately only when\r
user-facing behavior changes.\r
`,dr=`
You are an expert ASLJS app generator.

Your normal job is to run a lightweight conversation loop, not to jump
straight into coding on the first vague request.

The generated app is a showcase of ASLJS libraries. Use ALL of these packages in useful, visible ways:

- asljs-eventful
- asljs-observable
- asljs-data-binding
- asljs-components
- asljs-dali

Response requirements:
- Use tool calls for file and runtime operations.
- Do not return a full files JSON snapshot.
- Return one short plain-text assistant message per turn.
- Keep the message lightweight and understandable for non-developers.
- Assume the user is about 8 years old unless their wording clearly shows they want more technical language.
- Match the user's level gently: simple words first, more technical only when the user shows they want that.

Conversation transcript rules:
- The user input may include a "Conversation transcript:" section.
- Use that transcript to understand follow-up replies like "yes", "2 players", "make it blue", or "that part is broken".
- Treat the last user line in the transcript as the newest request.

Conversation loop:
- Stage 1: understand what the user wants.
- Stage 2: update README.md into a vision document.
- Stage 3: ask one concise follow-up question that makes the app definition clearer.
- Stage 4: once the idea is clear enough, suggest running the implementation changes.
- Stage 5: if the user says yes, update the app code, test it by interacting with the app, and report back in simple language.
- Stage 6: ask whether it worked, or what to add or change next.
- If the user reports a bug or says something does not work, switch into repair mode: diagnose, fix, test, explain simply, and ask whether the issue is fixed.

Input interpretation rules:
- Treat user input as a request to continue the conversation loop by default.
- If user input looks command-like (for example: "add", "change", "replace", "remove", "rename", "fix", "update", "move", "create"), interpret it as instructions to modify the existing project files.
- If user input looks like project artifacts or descriptive specs (feature bullets, acceptance criteria, user stories, TODO lists, changelog-style notes, issue-like descriptions, README snippets, architecture notes), treat it as actionable requirements to implement in the current app.
- Do not just echo or summarize artifact-like input.
- Prefer incremental edits to existing files over full rewrites when handling these requests.
- Do not change runtime app code immediately when the request is still vague. First update README.md and ask the next useful question.

README source-of-truth rules:
- Treat README.md as the current project specification/source of truth by default.
- At the start of each task, read README.md (if present) and use it as context for expected behavior, constraints, and usage.
- Also read .README.md when it exists. Treat it as the last completed README snapshot.
- If README.md exists and .README.md does not exist yet, create .README.md from the current README.md before reshaping the README for a new loop.
- If a direct user request conflicts with README.md, follow the user request and then update README.md to match the new behavior.
- If behavior changes due to implementation updates, update README.md so it stays accurate.
- If README.md requirements changed intentionally, treat that as a required app.tests.json update during the next implementation or repair pass.
- Do not add changelog/update-log sections to README.md unless the user explicitly requests one.
- Allow direct editing of README.md by the user. If README.md differs from .README.md, treat that diff as a real design change request.
- Use README changes to ask how new ideas relate to existing actors, scenes, data models, and behaviors.

README vision-document contract:
- README.md should become a vision document that helps future implementation.
- Prefer sections such as:
  - what the app is about
  - key actors
  - scenes, screens, or play areas
  - data models
  - behaviors and rules
  - important constraints
- If the app idea is still early, keep README.md short but structured.
- If there is no README.md yet, create one before editing runtime files.
- Keep .README.md unchanged during planning and implementation.
- Only after the implementation is complete and tested should you update .README.md so it matches the finished README.md.

Clarification and approval rules:
- Ask only one focused follow-up question at a time.
- When the user is choosing between a small number of concrete options, call choose(question, options) instead of listing the options only in prose.
- Keep choose questions short and broad, for example: "How should it look?" with options like "glowing ring" and "spinning block".
- The user may click an option or ignore it and type a custom answer.
- Prefer questions that unlock implementation details:
  - who uses the app
  - what actors exist
  - what each actor can do
  - what data needs to be stored
  - what the main scenes or screens are
  - what success or failure should look like
- When the project already has actors or scenes in README.md, ask how the new request connects to them.
- After a few clarification turns, or once the README is clear enough, suggest implementation in simple language, for example: "I think I understand it now. Shall I build these changes?"
- Do not modify app runtime files until the user explicitly approves implementation, unless the user clearly asked only for a README/vision update.

Tool-first generation protocol (stability-first):
- Always work in small, incremental steps:
  1) inspect current files/state,
  2) edit one focused thing,
  3) verify app behavior,
  4) fix issues,
  5) repeat until stable.
- Prefer targeted updates (replace specific file parts) over full rewrites.
- Use setFileData for image or binary-safe asset files that should be referenced by path from HTML or CSS.
- Use choose when the next clarification step is a small finite pick.
- Use setFileContent only when replaceFilePart is not suitable.
- Verify each major change using evalInApp and diagnostics tools.
- Use JSON only for explicit import/export content handled by the app itself.

Per-turn workflow:
- Start by checking the files with listFileset().
- Prefer listFilesByMask/readFilesByMask for bounded multi-file inspection when you already know the area you need.
- If the project is empty, ask what the user wants to create before generating runtime files.
- If the project already has files, use README.md and .README.md to understand whether the user is changing the vision or asking for implementation.
- During clarification turns, update README.md first and normally stop after asking the next question.
- During implementation turns, update code from README.md, update app.tests.json for any README requirement changes, run the app, interact with it, repair issues, run the tests, then update .README.md at the end.

Generation rules:
- Always include at least: index.html, style.css, app.js, package.json, README.md.
- During implementation, also create and maintain app.tests.json as the default executable test suite for the current README requirements.
- package.json must include latest versions listed above.
- app.js must demonstrate practical usage of ALL five ASLJS packages.
- app.js is the app entry point.
- index.html must load app.js using <script type="module">.
- OpenAI libraries are allowed when required by user features.
- If OpenAI is used in the generated app, read key from host context: 
  window.__ASLJS_APP_BUILDER_HOST__?.openAiApiKey.
- Never hardcode API keys in generated files.
- UI code must be data-binding-first: prefer declarative \`data-bind-*\` attributes with \`bindDataModel\`.
- For UI updates, prefer model changes that automatically re-render through bindings.
- Avoid imperative DOM mutation patterns for normal UI state changes (manual \`innerHTML\` rebuild loops, ad-hoc query-and-set chains).
- Use imperative DOM code only for unavoidable integration points, and keep it minimal.
- Prefer real app behavior over toy snippets (state, events, bindings, local persistence, and at least one ASLJS component).
- Keep code concise, runnable in modern browser, and readable.

Stability contract (minimize generation failures):
- Prefer a small, deterministic architecture over clever patterns.
- Keep all runtime logic in app.js unless splitting is necessary.
- Do not reference files that do not exist in the current virtual filesystem.
- Do not use placeholders, TODOs, pseudo-code, or omitted sections.
- Avoid dynamic imports and avoid network/runtime external dependencies.
- Guard all DOM queries and event wiring against missing elements.
- Wrap startup in a safe boot path with clear error handling.
- Ensure app initialization is idempotent (safe to run more than once).
- Keep CSS simple and resilient; avoid assumptions about unavailable fonts/assets.

Implementation reliability rules:
- index.html must contain the actual mount/root element used by app.js.
- app.js must only use APIs available in modern browsers and must not require build-time transforms.
- package.json scripts must be coherent and runnable (at least a valid start/dev flow).
- All referenced ASLJS APIs must match the provided package docs/types excerpts.
- Prefer \`asljs-data-binding\` for form fields, labels, visibility flags, and action wiring.
- When using \`asljs-components\`, bind row/content templates through data-binding context instead of manual DOM writes.
- For data persistence, handle empty/first-run states and corrupted data gracefully.
- For asynchronous flows, handle rejection paths and surface readable errors.

Pre-flight self-check before final response:
- Verify file graph consistency: every referenced local file exists.
- Verify boot consistency: index.html loads app.js and app.js mounts to an existing element.
- Verify no syntax-fragment artifacts (unclosed tags, truncated strings, unfinished blocks).
- Verify at least one concrete usage of each required ASLJS package.
- Verify UI behavior is primarily implemented with \`asljs-data-binding\` (not imperative DOM patching).
- Verify generated README explains how to run and what the agent tools do.
- Verify README.md matches the implemented behavior after modifications.
- Verify .README.md is updated only after successful implementation/testing, not during clarification.
- Verify app.tests.json still covers the main README requirements after behavior changes.
- Verify newly added or changed README requirements have matching app.tests.json coverage before ending an implementation or repair turn.

Agent tool contract (virtual filesystem and runtime):
- Assume the generated app includes an agent that can use these tools:
  - listFileset(): returns all file paths in the virtual filesystem.
  - listFilesByMask(mask, maxFiles?): returns matching file paths for targeted inspection.
  - readFile(path): returns full text content for a file.
  - readFiles(paths, maxCharsPerFile?): returns multiple file contents in one call.
  - readFilesByMask(mask, maxFiles?, maxCharsPerFile?): returns multiple matching file contents in one call.
  - readFileData(path): returns MIME type, base64 payload, and data URL for files stored as data URLs, or null for plain text files.
  - setFilesContent(files): creates or replaces several text files in one call using \`{ path, content }\` entries.
  - setFileData(path, mimeType, base64): creates or replaces an embeddable binary-safe file, such as an image asset.
  - setFileContent(path, content): creates or replaces a file's content.
  - replaceFilePart(path, search, replacement, replaceAll?): replaces exact text in a file.
  - deleteFile(path): deletes a file from the virtual filesystem.
  - grep(mask, pattern, flags?, maxMatches?): searches matching files with a regular expression.
  - choose(question, options): shows clickable choices for the user while still allowing a typed custom reply.
  - evalInApp(code): evaluates JavaScript in the context of the running app document.
  - assertInApp(code, message?): fails when an app check throws or returns false.
  - runAppTests(path?): runs the JSON test suite and restarts the app before each test.
  - getAppDiagnostics(): returns runtime logs and errors from the running app.
  - runAppAndCollectDiagnostics(): runs app and returns startup/runtime logs and errors.
- Generate app code and README so these tool names and behaviors are clear and usable.
- Keep the tool usage model deterministic and safe (no hidden magic paths).
- Runtime host context available to generated app:
  - window.__ASLJS_APP_BUILDER_HOST__?.openAiApiKey
  - Value is provided by host app settings; it may be null.

In-app agent update protocol:
- For normal edits, the in-app agent must update files through tools:
  - inspect with listFileset/readFile or bounded multi-file tools when they reduce noise
  - create image assets with setFileData and then reference them by path from HTML or CSS
  - modify with replaceFilePart first; use setFileContent for create/full replace
  - remove with deleteFile when appropriate
- JSON should be used only for explicit export/import workflows.

Run/repair loop requirements for the generated agent behavior:
- The agent must treat app.js as the starting point for the app runtime.
- After each generation pass, the agent must run the app and collect diagnostics using runAppAndCollectDiagnostics().
- If diagnostics report runtime errors, the agent must iteratively fix files and re-run diagnostics until errors are resolved.
- The agent should use getAppDiagnostics() and evalInApp(...) for targeted debugging checks between edits.
- The agent should maintain app.tests.json as a lightweight executable suite derived from README requirements.
- When implementing an app that does not have app.tests.json yet, the agent should create it before concluding the first implementation pass.
- When README.md changes intentionally, the agent should update app.tests.json in the same implementation pass so each changed user-visible requirement still has at least one executable check.
- After implementation or repair work, the agent should run runAppTests() and fix failing tests or update stale tests when README requirements changed intentionally.
- If a test fails after a README change, the agent should decide whether the app is broken or the test is stale by checking README.md first, then either fix the app or update the test to match the new requirement.
- The agent should verify implemented functionality through realistic interactions, not only static checks:
  - trigger click handlers,
  - fill form inputs,
  - submit forms,
  - and assert expected visible or state outcomes.
- The final generated code should reflect this workflow explicitly in app.js and/or README.

Turn-ending rules:
- If you are still clarifying, end with one short question.
- If the README is clear enough and the user has not approved coding yet, end by asking whether you should run the changes.
- If you implemented or repaired code, end with a short summary, what you tested, and a simple question asking whether it now works or what should change next.

Use this package knowledge as source material when choosing APIs and patterns.
These imported package guides are generator context, not host app API:

[eventful] guide:

${ga}

[observable] guide:

${ha}

[data-binding] guide:

${ya}

[components] guide:

${ba}

[dali] guide:

${va}
`;function wa(e){return e.length===0?"What would you like to create? You can describe it in simple words, and I will help shape the plan first.":"What would you like to add or change? You can also edit README.md directly, and I will use it as the plan."}function xa(e){return["Conversation transcript:",e.slice(-10).map(r=>`${Ea(r.role)}: ${r.text}`).join(`

`),"",'Use the transcript to resolve short follow-up answers such as "yes",','"2 players", or "make it blue". The last user message is the newest',"request."].join(`
`)}function Ea(e){return e==="assistant"?"Assistant":"User"}const fn="asljs-app-builder:eval-request",ur="asljs-app-builder:eval-response",pr="asljs-app-builder:diagnostics-request",fr="asljs-app-builder:diagnostics-response",zn=`<script>
(() => {
  const REQUEST = '${fn}';
  const RESPONSE = '${ur}';
  const DIAG_REQUEST = '${pr}';
  const DIAG_RESPONSE = '${fr}';
  const DIAG_KEY = '__asljs_app_builder_diagnostics';
  const MAX_ENTRIES = 250;

  const diagnostics =
    window[DIAG_KEY]
    ?? { logs: [], errors: [] };

  window[DIAG_KEY] = diagnostics;

  const toText = (value) => {
    if (value instanceof Error) {
      const stack = typeof value.stack === 'string' && value.stack !== ''
        ? '\\n' + value.stack
        : '';
      return value.name + ': ' + value.message + stack;
    }

    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'number' || typeof value === 'boolean' || value === null || value === undefined) {
      return String(value);
    }

    if (typeof value === 'object') {
      const maybeMessage = typeof value.message === 'string'
        ? value.message
        : null;

      const maybeName = typeof value.name === 'string'
        ? value.name
        : null;

      const maybeStack = typeof value.stack === 'string'
        ? value.stack
        : null;

      if (maybeMessage !== null) {
        const prefix = maybeName !== null
          ? maybeName + ': '
          : '';

        return maybeStack !== null && maybeStack !== ''
          ? prefix + maybeMessage + '\\n' + maybeStack
          : prefix + maybeMessage;
      }
    }

    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  };

  const append = (list, entry) => {
    list.push(entry);

    if (list.length > MAX_ENTRIES) {
      list.splice(0, list.length - MAX_ENTRIES);
    }
  };

  const addLog = (level, args) => {
    append(
      diagnostics.logs,
      {
        timestamp: Date.now(),
        level,
        message: args.map(toText).join(' '),
      },
    );
  };

  const addError = (message) => {
    append(
      diagnostics.errors,
      {
        timestamp: Date.now(),
        message,
      },
    );
  };

  if (!window.__asljs_app_builder_console_hooked__) {
    window.__asljs_app_builder_console_hooked__ = true;

    const methods = ['log', 'info', 'warn', 'error', 'debug'];

    for (const method of methods) {
      const original = console[method].bind(console);

      console[method] = (...args) => {
        addLog(method, args);

        if (method === 'error') {
          addError(args.map(toText).join(' '));
        }

        original(...args);
      };
    }

    window.addEventListener('error', event => {
      const source = event.filename
        ? ' (' + event.filename + ':' + event.lineno + ':' + event.colno + ')'
        : '';

      const detail = event.error !== undefined
        ? toText(event.error)
        : event.message;

      addError(
        detail && detail !== ''
          ? detail + source
          : 'Unknown runtime error' + source,
      );
    });

    window.addEventListener('unhandledrejection', event => {
      addError('Unhandled rejection: ' + toText(event.reason));
    });
  }

  window.addEventListener('message', async event => {
    const data = event.data;

    if (!data || typeof data.type !== 'string') {
      return;
    }

    if (data.type === DIAG_REQUEST) {
      if (typeof data.id !== 'string') {
        return;
      }

      event.source?.postMessage(
        {
          type: DIAG_RESPONSE,
          id: data.id,
          ok: true,
          diagnostics,
        },
        '*',
      );
      return;
    }

    if (data.type !== REQUEST) {
      return;
    }

    if (typeof data.id !== 'string' || typeof data.code !== 'string') {
      return;
    }

    try {
      const result = (0, eval)(data.code);
      const value = await Promise.resolve(result);

      event.source?.postMessage(
        {
          type: RESPONSE,
          id: data.id,
          ok: true,
          value,
        },
        '*',
      );
    } catch (error) {
      event.source?.postMessage(
        {
          type: RESPONSE,
          id: data.id,
          ok: false,
          error: error instanceof Error
            ? error.message
            : String(error),
        },
        '*',
      );
    }
  });
})();
<\/script>`;function ka(e,t,r){if(t.length===0){e.removeAttribute("srcdoc"),e.src="about:blank";return}const s=t.find(X=>X.name==="index.html")??t.find(X=>X.name.endsWith(".html"))??null;if(s===null){e.removeAttribute("srcdoc"),e.src="about:blank";return}let i=s.content;const p=Fa(t),v=t.find(X=>X.name==="style.css")??t.find(X=>X.name.endsWith(".css"))??null,G=v===null?null:La(v.content,v.name,p);v!==null&&(i=i.replace(/<link[^>]+href=["']style\.css["'][^>]*>/gi,`<style>${G}</style>`),i=i.replace(/<link[^>]+href=["']([^"']+\.css)["'][^>]*>/gi,`<style>${G}</style>`));for(const X of t){if(!X.name.endsWith(".js"))continue;const ce=X.name.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");i=i.replace(new RegExp(`(<script[^>]*?)\\s+src=["']${ce}["']([^>]*)><\\/script>`,"gi"),(ee,de,H)=>{const te=`${String(de)} ${String(H)}`;return/type=["']module["']/i.test(te)?`<script type="module">${X.content}<\/script>`:`<script>${X.content}<\/script>`})}i=_a(i,s.name,p),i=Ta(i,t),i=Ca(i,r),i=Ia(i),e.srcdoc=i}async function Aa(e,t){const r=await mr(e,fn,{code:t},ur);if(r.ok===!0)return r.value;throw new Error(typeof r.error=="string"?r.error:"Unknown preview evaluation error.")}async function Sa(e){const t=await mr(e,pr,{},fr);if(t.ok!==!0)throw new Error(typeof t.error=="string"?t.error:"Failed to read preview diagnostics.");return t.diagnostics??{logs:[],errors:[]}}async function mr(e,t,r,s){const i=e.contentWindow;if(i===null)throw new Error("Preview frame is not available.");const p=crypto.randomUUID();return new Promise((v,G)=>{const X=window.setTimeout(()=>{ee(),G(new Error("Timed out waiting for app evaluation result."))},5e3),ce=de=>{if(de.source!==i)return;const H=de.data;H.type!==s||H.id!==p||(ee(),v(H))};function ee(){window.clearTimeout(X),window.removeEventListener("message",ce)}window.addEventListener("message",ce),i.postMessage({type:t,id:p,...r},"*")})}function Ia(e){return e.includes(fn)?e:e.includes("</body>")?e.replace("</body>",`${zn}</body>`):`${e}
${zn}`}function Ta(e,t){if(/type=["']importmap["']/i.test(e))return e;const r=t.find(v=>v.name==="package.json")??null,s=ja(r==null?void 0:r.content),i=Object.fromEntries(s.map(([v,G])=>[v,`https://esm.sh/${v}@${G}?bundle`]));if(Object.keys(i).length===0)return e;const p=`<script type="importmap">${JSON.stringify({imports:i})}<\/script>`;return/<head[^>]*>/i.test(e)?e.replace(/<head[^>]*>/i,v=>`${v}
${p}`):`${p}
${e}`}function ja(e){if(e===void 0)return Wn();try{const t=JSON.parse(e),r={...t.dependencies??{},...t.devDependencies??{}};return["asljs-eventful","asljs-observable","asljs-data-binding","asljs-components","asljs-dali","openai"].map(p=>[p,Pa(r[p])])}catch{return Wn()}}function Pa(e){if(typeof e!="string"||e.trim()==="")return"latest";const t=e.trim().replace(/^[~^<>=\s]+/,"");return t===""?"latest":t}function Wn(){return[["asljs-eventful","latest"],["asljs-observable","latest"],["asljs-data-binding","latest"],["asljs-components","latest"],["asljs-dali","latest"],["openai","latest"]]}function Ca(e,t){if(e.includes("__ASLJS_APP_BUILDER_HOST__"))return e;const r=`<script>window.__ASLJS_APP_BUILDER_HOST__ = ${JSON.stringify({openAiApiKey:(t==null?void 0:t.hostOpenAiApiKey)===void 0||t.hostOpenAiApiKey.trim()===""?null:t.hostOpenAiApiKey})};<\/script>`;return e.includes("</head>")?e.replace("</head>",`${r}</head>`):e.includes("<body")?e.replace(/<body[^>]*>/i,s=>`${s}
${r}`):`${r}
${e}`}function Fa(e){const t=new Map;for(const r of e){const s=Da(r.content);s!==null&&t.set(mn(r.name),s)}return t}function Da(e){const t=e.trim();return/^data:[^,]+,.+/i.test(t)?t:null}function _a(e,t,r){return e.replace(/\b(src|href|poster)=(["'])([^"']+)\2/gi,(s,i,p,v)=>{const G=hr(t,String(v),r);return G===null?s:`${String(i)}=${String(p)}${G}${String(p)}`})}function La(e,t,r){return e.replace(/url\(\s*(["']?)([^"')]+)\1\s*\)/gi,(s,i,p)=>{const v=hr(t,String(p),r);return v===null?s:`url(${String(i)}${v}${String(i)})`})}function hr(e,t,r){const s=t.trim();if(s===""||s.startsWith("#")||/^[a-z]+:/i.test(s)||s.startsWith("//"))return null;const i=s.split("#",1)[0]??s,p=i.split("?",1)[0]??i,v=mn(Ma(Oa(e),p));return r.get(v)??null}function Oa(e){const t=mn(e).split("/");return t.pop(),t.join("/")}function Ma(e,t){return t.startsWith("/")||e===""?t:`${e}/${t}`}function mn(e){const t=e.replace(/\\/g,"/").split("/"),r=[];for(const s of t)if(!(s===""||s===".")){if(s===".."){r.pop();continue}r.push(s)}return r.join("/")}function Ra(e){const t=e.selectElement;t.replaceChildren();const r=[...e.apps].sort((p,v)=>v.updatedAt.localeCompare(p.updatedAt));for(const p of r){const v=document.createElement("option");v.value=p.id,v.textContent=p.name,t.appendChild(v)}if(r.length>0){const p=document.createElement("option");p.value="__separator__",p.textContent="────────",p.disabled=!0,t.appendChild(p)}const s=document.createElement("option");s.value=e.newActionValue,s.textContent="New...",t.appendChild(s);const i=document.createElement("option");i.value=e.importActionValue,i.textContent="Import...",t.appendChild(i),e.currentAppId!==null&&(t.value=e.currentAppId)}function $a(e){const t=e.selectElement,r=e.files.filter(i=>!Na(i.name));if(t.replaceChildren(),r.length===0){const i=document.createElement("option");i.value="",i.textContent="No files",t.appendChild(i),t.value="",t.disabled=!0;return}for(const i of r){const p=document.createElement("option");p.value=i.name,p.textContent=i.name,t.appendChild(p)}const s=e.activeFileName!==null&&r.some(i=>i.name===e.activeFileName)?e.activeFileName:r[0].name;t.value=s,t.disabled=!1}function Ua(e){const t=e.files.find(i=>i.name===e.activeFileName),r=t===void 0?null:or(t.content),s=r!==null&&zs(r.mimeType);e.textAreaElement.value=(t==null?void 0:t.content)??"",e.textAreaElement.disabled=t===void 0||s,e.textAreaElement.classList.toggle("hidden",s),e.imagePreviewElement.classList.toggle("hidden",!s),e.previewFallbackElement.classList.toggle("hidden",!s),e.previewFallbackElement.textContent=s?`${(r==null?void 0:r.mimeType)??""} preview`:"",s?(e.imagePreviewElement.src=r.dataUrl,e.imagePreviewElement.alt=(t==null?void 0:t.name)??"Image preview"):(e.imagePreviewElement.removeAttribute("src"),e.imagePreviewElement.alt="")}function Na(e){return e.startsWith(".")}function Ba(e,t){e.disabled=t,e.innerHTML=t?'<span class="spinner"></span> Sending…':"Send"}function za(e,t,r){e.textContent=t,e.classList.toggle("hidden",!r)}function Wa(e,t,r){const s=document.createElement("div");s.className=`chat-msg ${t}`;const i=document.createElement("div");i.className="chat-msg-role",i.textContent=t==="user"?"You":"Assistant";const p=document.createElement("div");p.className="chat-bubble",p.textContent=r,s.appendChild(i),s.appendChild(p),e.appendChild(s),e.scrollTop=e.scrollHeight}function Va(e,t,r,s){if(e.replaceChildren(),t.trim()===""||r.length===0){e.classList.add("hidden");return}const i=document.createElement("p");i.className="chat-choice-question",i.textContent=t,e.appendChild(i);const p=document.createElement("div");p.className="chat-choice-options";for(const v of r){const G=document.createElement("button");G.type="button",G.className="chat-choice-option",G.textContent=v,G.addEventListener("click",()=>{s(v)}),p.appendChild(G)}e.appendChild(p),e.classList.remove("hidden")}function Ha(e){e.replaceChildren(),e.classList.add("hidden")}function gr(e){const t=!e.panelElement.classList.contains("collapsed");return e.toggleButtonElement.textContent=t?e.collapsedLabel:e.expandedLabel,e.toggleButtonElement.setAttribute("aria-expanded",t?"false":"true"),e.panelElement.classList.toggle("collapsed",t),e.panelsElement.classList.toggle(e.collapsedPanelsClass,t),t}const qa=`{
  "id": "5935ae06-fe33-4019-86ab-afa78151e96c",
  "name": "TODO Sample",
  "files": {
    "app.js": "const form = document.getElementById('todo-form');\\nconst input = document.getElementById('todo-input');\\nconst list = document.getElementById('todo-list');\\nconst doneList = document.getElementById('done-list');\\n\\nif (!(form instanceof HTMLFormElement)\\n    || !(input instanceof HTMLInputElement)\\n    || !(list instanceof HTMLUListElement)\\n    || !(doneList instanceof HTMLUListElement))\\n{\\n  throw new Error('Missing TODO app elements.');\\n}\\n\\nconst state = {\\n  todos: [],\\n  done: [],\\n};\\n\\nfunction uid() {\\n  return crypto.randomUUID();\\n}\\n\\nfunction render() {\\n  list.replaceChildren();\\n  doneList.replaceChildren();\\n\\n  for (const todo of state.todos) {\\n    const item = document.createElement('li');\\n    item.className = 'todo-item';\\n\\n    const main = document.createElement('div');\\n    main.className = 'todo-main';\\n\\n    const text = document.createElement('span');\\n    text.className = 'todo-text';\\n    text.textContent = todo.text;\\n\\n    const actions = document.createElement('div');\\n\\n    const checkButton = document.createElement('button');\\n    checkButton.type = 'button';\\n    checkButton.className = 'check-btn';\\n    checkButton.textContent = '✓';\\n    checkButton.title = 'Mark done';\\n    checkButton.addEventListener('click', () => {\\n      state.todos = state.todos.filter(entry => entry.id !== todo.id);\\n      state.done.unshift(todo);\\n      render();\\n    });\\n\\n    main.appendChild(checkButton);\\n    main.appendChild(text);\\n\\n    const bin = document.createElement('button');\\n    bin.type = 'button';\\n    bin.className = 'bin-btn';\\n    bin.textContent = '🗑';\\n    bin.title = 'Delete todo';\\n    bin.addEventListener('click', () => {\\n      state.todos = state.todos.filter(entry => entry.id !== todo.id);\\n      render();\\n    });\\n\\n    actions.appendChild(checkButton);\\n    actions.appendChild(bin);\\n\\n    item.appendChild(main);\\n    item.appendChild(actions);\\n    list.appendChild(item);\\n  }\\n\\n  for (const todo of state.done) {\\n    const item = document.createElement('li');\\n    item.className = 'todo-item done';\\n\\n    const main = document.createElement('div');\\n    main.className = 'todo-main';\\n\\n    const text = document.createElement('span');\\n    text.className = 'todo-text';\\n    text.textContent = todo.text;\\n\\n    main.appendChild(text);\\n\\n    const actions = document.createElement('div');\\n\\n    const bin = document.createElement('button');\\n    bin.type = 'button';\\n    bin.className = 'bin-btn';\\n    bin.textContent = '🗑';\\n    bin.title = 'Delete todo';\\n    bin.addEventListener('click', () => {\\n      state.done = state.done.filter(entry => entry.id !== todo.id);\\n      render();\\n    });\\n\\n    actions.appendChild(bin);\\n\\n    item.appendChild(main);\\n    item.appendChild(actions);\\n    doneList.appendChild(item);\\n  }\\n\\n  if (state.todos.length === 0) {\\n    const empty = document.createElement('li');\\n    empty.className = 'todo-empty';\\n    empty.textContent = 'No active TODO items.';\\n    list.appendChild(empty);\\n  }\\n\\n  if (state.done.length === 0) {\\n    const emptyDone = document.createElement('li');\\n    emptyDone.className = 'todo-empty';\\n    emptyDone.textContent = 'No completed TODO items yet.';\\n    doneList.appendChild(emptyDone);\\n  }\\n}\\n\\nform.addEventListener('submit', event => {\\n  event.preventDefault();\\n\\n  const text = input.value.trim();\\n\\n  if (text === '') {\\n    return;\\n  }\\n\\n  state.todos.unshift({\\n    id: uid(),\\n    text,\\n  });\\n  input.value = '';\\n  input.focus();\\n  render();\\n});\\n\\nrender();",
    "README.md": "# TODO Sample\\n\\nSimple TODO sample application.\\n\\n## Usage\\n\\nOpen index.html and add items using the input.\\n\\n## Behavior\\n\\n- Add TODO item on submit.\\n- Active TODO items show Check and Bin actions.\\n- Clicking Check moves an item immediately to Done.\\n- Each item has a bin icon to delete it.\\n",
    "package.json": "{\\n  \\"name\\": \\"todo-sample\\",\\n  \\"version\\": \\"0.1.0\\",\\n  \\"private\\": true,\\n  \\"type\\": \\"module\\",\\n  \\"scripts\\": {\\n    \\"start\\": \\"echo \\"Open index.html in a browser\\"\\"\\n  }\\n}",
    "style.css": ":root {\\n  color-scheme: light dark;\\n}\\n\\nbody {\\n  margin: 0;\\n  font-family: system-ui, sans-serif;\\n  background: #0b1220;\\n  color: #e7edf7;\\n}\\n\\n.app {\\n  max-width: 560px;\\n  margin: 2rem auto;\\n  padding: 1rem;\\n  border: 1px solid #2b3954;\\n  border-radius: 8px;\\n  background: #121b2d;\\n}\\n\\n#todo-form {\\n  display: flex;\\n  gap: 0.5rem;\\n}\\n\\n#todo-input {\\n  flex: 1;\\n  padding: 0.5rem;\\n}\\n\\n.list-section {\\n  margin-top: 1rem;\\n}\\n\\n.list-section h2 {\\n  margin: 0 0 0.5rem;\\n  font-size: 1rem;\\n}\\n\\n.todo-list {\\n  margin: 0;\\n  padding: 0;\\n  list-style: none;\\n  display: grid;\\n  gap: 0.5rem;\\n}\\n\\n.todo-item {\\n  display: flex;\\n  align-items: center;\\n  justify-content: space-between;\\n  gap: 0.5rem;\\n  padding: 0.5rem 0.6rem;\\n  border: 1px solid #2b3954;\\n  border-radius: 6px;\\n  background: #0f1a2f;\\n}\\n\\n.todo-main {\\n  display: flex;\\n  align-items: center;\\n  gap: 0.5rem;\\n  min-width: 0;\\n}\\n\\n.todo-text {\\n  overflow: hidden;\\n  text-overflow: ellipsis;\\n  white-space: nowrap;\\n}\\n\\n.done .todo-text {\\n  text-decoration: line-through;\\n  opacity: 0.75;\\n}\\n\\n.bin-btn {\\n  border: 1px solid #3b4e7a;\\n  background: transparent;\\n  color: #e7edf7;\\n  border-radius: 6px;\\n  padding: 0.35rem 0.5rem;\\n  cursor: pointer;\\n}\\n\\n.check-btn {\\n  border: 1px solid #3b4e7a;\\n  background: #1b2b4b;\\n  color: #e7edf7;\\n  border-radius: 6px;\\n  padding: 0.35rem 0.55rem;\\n  cursor: pointer;\\n}\\n\\n.todo-empty {\\n  color: #9fb2d8;\\n  font-size: 0.9rem;\\n  padding: 0.25rem 0;\\n}",
    "index.html": "<!doctype html>\\n<html lang=\\"en\\">\\n<head>\\n  <meta charset=\\"UTF-8\\" />\\n  <meta name=\\"viewport\\" content=\\"width=device-width, initial-scale=1.0\\" />\\n  <title>TODO Sample</title>\\n  <link rel=\\"stylesheet\\" href=\\"style.css\\" />\\n</head>\\n<body>\\n  <main class=\\"app\\">\\n    <h1>TODO Sample</h1>\\n    <form id=\\"todo-form\\">\\n      <input id=\\"todo-input\\" type=\\"text\\" placeholder=\\"What needs doing?\\" required />\\n      <button type=\\"submit\\">Add</button>\\n    </form>\\n    <section class=\\"list-section\\">\\n      <h2>Todo</h2>\\n      <ul id=\\"todo-list\\" class=\\"todo-list\\"></ul>\\n    </section>\\n    <section class=\\"list-section\\">\\n      <h2>Done</h2>\\n      <ul id=\\"done-list\\" class=\\"todo-list\\"></ul>\\n    </section>\\n  </main>\\n  <script type=\\"module\\" src=\\"app.js\\"><\/script>\\n</body>\\n</html>"
  }
}`,Ja=`{
  "id": "e44d7e29-c40a-4731-9092-9407b0105624",
  "name": "PdfParser",
  "files": {
    "README.md": "# PDF Text Extractor\\n\\nA simple browser app that converts PDF pages into a text-only layout preview using a 100-column virtual buffer.\\n\\n## Features\\n\\n- Drag-and-drop or click-to-upload PDF input\\n- Text extraction with \`pdfjs-dist\`\\n- Page-by-page monospace preview\\n- Activity log and extraction stats\\n- IndexedDB session persistence with \`asljs-dali\`\\n- Saved-session history with restore support\\n- Declarative UI bindings with \`asljs-data-binding\`\\n- Observable app state with \`asljs-observable\`\\n- Event bus with \`asljs-eventful\`\\n- \`asljs-components\` list rendering for pages and activity\\n- Executable browser checks in \`app.tests.json\`\\n\\n## ASLJS package usage\\n\\n- \`asljs-eventful\`: app event bus for status, success, and error events\\n- \`asljs-observable\`: reactive state for UI, pages, stats, and activity\\n- \`asljs-data-binding\`: declarative bindings via \`data-bind-*\` attributes\\n- \`asljs-components\`: \`asljs-list\` for activity and extracted page rendering\\n- \`asljs-dali\`: IndexedDB-backed session table and live recordset observation\\n\\n## Files\\n\\n- \`index.html\`: app shell and declarative binding markup\\n- \`style.css\`: layout and visual styling\\n- \`app.js\`: app entry point and runtime logic\\n- \`app.tests.json\`: runtime test checks derived from the README\\n- \`package.json\`: scripts and required dependencies\\n\\n## Run\\n\\nUse a static server, for example:\\n\\n\`\`\`bash\\nnpm install\\nnpm run dev\\n\`\`\`\\n\\nThen open the served app in a modern browser.\\n\\n## Agent tool workflow\\n\\nThis project is intended to be updated through the app-builder tool workflow:\\n\\n- inspect files with \`listFileset()\`, \`listFilesByMask(...)\`, \`readFile(path)\`, or \`readFilesByMask(...)\`\\n- modify files with \`replaceFilePart(...)\`, \`setFileContent(...)\`, or \`setFilesContent([{ path, content }])\`\\n- ask short option questions with \`choose(question, options)\` when a small list is enough\\n- remove files with \`deleteFile(path)\`\\n- verify runtime with \`runAppAndCollectDiagnostics()\`, \`getAppDiagnostics()\`, \`assertInApp(...)\`, and \`runAppTests()\`\\n- perform targeted checks with \`evalInApp(code)\` or \`grep(...)\`\\n\\nThe app entry point is \`app.js\`, and \`index.html\` loads it with \`<script type=\\"module\\">\`.\\n\\n## Current behavior\\n\\n- Uploading a PDF extracts text from each page\\n- Each page is mapped into a fixed-width text buffer\\n- Extraction results are shown in a list of page cards\\n- Full extraction sessions are stored in IndexedDB\\n- Recent saved sessions can be restored into the page preview\\n- The activity log records app events and persistence updates\\n",
    "app.tests.json": "[\\n  {\\n    \\"name\\": \\"app bootstraps\\",\\n    \\"code\\": \\"Boolean(document.getElementById('app'))\\"\\n  },\\n  {\\n    \\"name\\": \\"dropzone exists\\",\\n    \\"code\\": \\"Boolean(document.getElementById('dropzone'))\\"\\n  },\\n  {\\n    \\"name\\": \\"pdf input exists\\",\\n    \\"code\\": \\"Boolean(document.getElementById('pdf-input'))\\"\\n  }\\n]",
    "app.js": "import { eventful } from 'https://cdn.jsdelivr.net/npm/asljs-eventful/+esm';\\nimport { observable } from 'https://cdn.jsdelivr.net/npm/asljs-observable/+esm';\\nimport { bindDataModel } from 'https://cdn.jsdelivr.net/npm/asljs-data-binding/+esm';\\nimport 'https://cdn.jsdelivr.net/npm/asljs-components/+esm';\\nimport { dbOpen, Table } from 'https://cdn.jsdelivr.net/npm/asljs-dali/+esm';\\nimport * as pdfjsLib from 'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.6.205/build/pdf.mjs';\\n\\npdfjsLib.GlobalWorkerOptions.workerSrc =\\n  'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.6.205/build/pdf.worker.mjs';\\n\\nconst BUFFER_WIDTH = 100;\\nconst DB_NAME = 'pdf-text-extractor-db';\\nconst STORE_NAME = 'sessions';\\nconst SAMPLE_MESSAGE = 'Drop a PDF file or click here to choose one. The app maps extracted text into a 100-column virtual text buffer per page.';\\nconst MAX_HISTORY = 8;\\n\\nlet booted = false;\\n\\nwindow.addEventListener('error', event => {\\n  console.error('Window error', event.error || event.message);\\n});\\n\\nwindow.addEventListener('unhandledrejection', event => {\\n  console.error('Unhandled rejection', event.reason);\\n});\\n\\nboot().catch(error => {\\n  console.error('Boot failed', error);\\n});\\n\\nasync function boot() {\\n  if (booted) return;\\n  booted = true;\\n  console.log('boot:start');\\n\\n  const root = document.getElementById('app');\\n  if (!root) throw new Error('Missing #app root element.');\\n\\n  const bus = eventful({ name: 'pdf-text-extractor-bus' });\\n  const state = observable({\\n    stats: {\\n      pages: 0,\\n      characters: 0,\\n      sessions: 0,\\n    },\\n    ui: {\\n      dragOver: false,\\n      busy: false,\\n      dropzoneTitle: 'Drop PDF here',\\n      dropzoneHint: SAMPLE_MESSAGE,\\n      status: {\\n        message: 'Ready for a PDF.',\\n        error: '',\\n      },\\n      loadSample() {\\n        state.ui.status.message = 'Instructions loaded. Now drop a PDF file.';\\n        state.ui.status.error = '';\\n        addLog('Instructions', SAMPLE_MESSAGE, true);\\n        bus.emit('status', state.ui.status.message);\\n      },\\n      clearOutput() {\\n        state.pages.length = 0;\\n        state.stats.pages = 0;\\n        state.stats.characters = 0;\\n        state.ui.status.message = 'Output cleared.';\\n        state.ui.status.error = '';\\n        addLog('Cleared', 'Removed extracted pages from the current view.', false);\\n        bus.emit('cleared');\\n      },\\n    },\\n    pages: observable([]),\\n    activity: observable([]),\\n    history: observable([]),\\n    selectedSessionId: null,\\n    lastSessionId: null,\\n    restoreSession(event, model, element) {\\n      const sessionId = element?.dataset?.sessionId;\\n      if (!sessionId) return;\\n      restoreSessionById(sessionId);\\n    },\\n    async clearHistory() {\\n      if (!sessions?.clear) return;\\n      await sessions.clear();\\n      state.history.splice(0, state.history.length);\\n      state.selectedSessionId = null;\\n      state.stats.sessions = 0;\\n      state.ui.status.message = 'Saved session history cleared.';\\n      state.ui.status.error = '';\\n      addLog('History cleared', 'Removed saved extraction sessions from IndexedDB.', true);\\n      bus.emit('status', state.ui.status.message);\\n    },\\n  });\\n\\n  let sessions = null;\\n  let liveSessions = null;\\n\\n  try {\\n    const db = await dbOpen(DB_NAME, [database => {\\n      if (!database.objectStoreNames.contains(STORE_NAME)) {\\n        database.createObjectStore(STORE_NAME, { keyPath: 'id' });\\n      }\\n    }]);\\n\\n    sessions = new Table(STORE_NAME, db, {});\\n\\n    const refreshHistory = async (logLatest = false) => {\\n      if (!sessions?.scan) return;\\n      const records = await sessions.scan(() => true);\\n      const sorted = [...records].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));\\n      state.history.splice(0, state.history.length, ...sorted.slice(0, MAX_HISTORY).map(record => ({\\n        id: record.id,\\n        fileName: record.fileName,\\n        pageCount: record.pageCount,\\n        characterCount: record.characterCount,\\n        createdAt: record.createdAt,\\n        selected: record.id === state.selectedSessionId,\\n        summary: \`\${record.pageCount} page(s) • \${record.characterCount} chars\`,\\n      })));\\n      state.stats.sessions = records.length;\\n\\n      const latest = sorted[0];\\n      if (!logLatest || !latest || latest.id === state.lastSessionId) return;\\n      state.lastSessionId = latest.id;\\n      addLog('Saved session', \`\${latest.fileName} (\${latest.pageCount} pages) stored in IndexedDB.\`, false);\\n    };\\n\\n    await refreshHistory(false);\\n    sessions.notify({\\n      add() {\\n        refreshHistory(true).catch(error => console.warn('History refresh failed', error));\\n      },\\n      put() {\\n        refreshHistory(true).catch(error => console.warn('History refresh failed', error));\\n      },\\n      update() {\\n        refreshHistory(false).catch(error => console.warn('History refresh failed', error));\\n      },\\n      delete() {\\n        refreshHistory(false).catch(error => console.warn('History refresh failed', error));\\n      },\\n      clear() {\\n        refreshHistory(false).catch(error => console.warn('History refresh failed', error));\\n      },\\n    });\\n  } catch (error) {\\n    console.warn('Persistence unavailable', error);\\n    state.ui.status.error = 'IndexedDB persistence unavailable in this environment.';\\n  }\\n\\n  bus.on('status', message => addLog('Status', message, false));\\n  bus.on('pdf-loaded', payload => addLog('PDF loaded', \`\${payload.fileName} with \${payload.pageCount} pages extracted.\`, true));\\n  bus.on('error', message => addLog('Error', message, true));\\n\\n  bindDataModel(root, state, {});\\n\\n  const pagesList = document.getElementById('pages-list');\\n  if (pagesList) {\\n    pagesList.items = state.pages;\\n    pagesList.context = state;\\n  }\\n\\n  const activityList = document.getElementById('activity-list');\\n  if (activityList) {\\n    activityList.items = state.activity;\\n    activityList.context = state;\\n  }\\n\\n  const historyList = document.getElementById('history-list');\\n  if (historyList) {\\n    historyList.items = state.history;\\n    historyList.context = state;\\n  }\\n\\n  wireFileInput(state, bus, sessions);\\n  wireDropzone(state, bus, sessions);\\n\\n  state.ui.status.message = 'Ready for a PDF. Drag and drop or click the dropzone.';\\n  addLog('Ready', 'Application booted successfully.', false);\\n\\n  window.__PDF_TEXT_EXTRACTOR__ = { state, bus, sessions };\\n\\n  async function restoreSessionById(sessionId) {\\n    if (!sessions?.getOne) return;\\n    try {\\n      const session = await sessions.getOne(sessionId);\\n      if (!session) {\\n        state.ui.status.error = 'Saved session not found.';\\n        bus.emit('error', state.ui.status.error);\\n        return;\\n      }\\n\\n      state.selectedSessionId = session.id;\\n      for (const item of state.history) {\\n        item.selected = item.id === session.id;\\n      }\\n\\n      state.pages.splice(0, state.pages.length, ...(session.pages || []));\\n      state.stats.pages = session.pageCount || 0;\\n      state.stats.characters = session.characterCount || 0;\\n      state.ui.status.message = \`Restored \${session.fileName} from saved history.\`;\\n      state.ui.status.error = '';\\n      addLog('Session restored', \`\${session.fileName} loaded from IndexedDB history.\`, true);\\n      bus.emit('status', state.ui.status.message);\\n    } catch (error) {\\n      console.error(error);\\n      state.ui.status.error = 'Failed to restore saved session.';\\n      bus.emit('error', state.ui.status.error);\\n    }\\n  }\\n\\n  function addLog(title, detail, highlight) {\\n    state.activity.unshift({\\n      id: crypto.randomUUID(),\\n      title,\\n      detail,\\n      highlight,\\n      time: new Date().toLocaleTimeString(),\\n    });\\n    if (state.activity.length > 12) {\\n      state.activity.length = 12;\\n    }\\n  }\\n}\\n\\nfunction wireFileInput(state, bus, sessions) {\\n  const input = document.getElementById('pdf-input');\\n  if (!input) return;\\n\\n  input.addEventListener('change', async event => {\\n    const file = event.target?.files?.[0];\\n    if (!file) return;\\n    await handlePdfFile(file, state, bus, sessions);\\n    input.value = '';\\n  });\\n}\\n\\nfunction wireDropzone(state, bus, sessions) {\\n  const dropzone = document.getElementById('dropzone');\\n  if (!dropzone) return;\\n\\n  ['dragenter', 'dragover'].forEach(type => {\\n    dropzone.addEventListener(type, event => {\\n      event.preventDefault();\\n      state.ui.dragOver = true;\\n    });\\n  });\\n\\n  ['dragleave', 'dragend'].forEach(type => {\\n    dropzone.addEventListener(type, () => {\\n      state.ui.dragOver = false;\\n    });\\n  });\\n\\n  dropzone.addEventListener('drop', async event => {\\n    event.preventDefault();\\n    state.ui.dragOver = false;\\n    const file = event.dataTransfer?.files?.[0];\\n    if (!file) return;\\n    await handlePdfFile(file, state, bus, sessions);\\n  });\\n}\\n\\nasync function handlePdfFile(file, state, bus, sessions) {\\n  if (file.type && file.type !== 'application/pdf') {\\n    state.ui.status.error = 'Please drop a valid PDF file.';\\n    bus.emit('error', state.ui.status.error);\\n    return;\\n  }\\n\\n  state.ui.busy = true;\\n  state.ui.status.message = \`Reading \${file.name}...\`;\\n  state.ui.status.error = '';\\n  bus.emit('status', state.ui.status.message);\\n\\n  try {\\n    const bytes = await file.arrayBuffer();\\n    const loadingTask = pdfjsLib.getDocument({ data: bytes });\\n    const pdf = await loadingTask.promise;\\n    const pages = [];\\n    let totalCharacters = 0;\\n\\n    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {\\n      const page = await pdf.getPage(pageNumber);\\n      const viewport = page.getViewport({ scale: 1 });\\n      const textContent = await page.getTextContent();\\n      const rendered = renderPageToBuffer(textContent.items, viewport.width, viewport.height);\\n      totalCharacters += rendered.replace(/\\\\n/g, '').length;\\n      pages.push({\\n        id: \`\${file.name}-\${pageNumber}\`,\\n        pageNumber,\\n        summary: \`\${rendered.length} chars\`,\\n        text: rendered,\\n      });\\n    }\\n\\n    state.pages.splice(0, state.pages.length, ...pages);\\n    state.stats.pages = pages.length;\\n    state.stats.characters = totalCharacters;\\n    state.ui.status.message = \`Extracted \${pages.length} page(s) from \${file.name}.\`;\\n    state.ui.status.error = '';\\n\\n    const session = {\\n      id: crypto.randomUUID(),\\n      fileName: file.name,\\n      pageCount: pages.length,\\n      characterCount: totalCharacters,\\n      createdAt: new Date().toISOString(),\\n      pages,\\n    };\\n\\n    if (sessions?.put) {\\n      await sessions.put(session);\\n    }\\n    bus.emit('pdf-loaded', { fileName: file.name, pageCount: pages.length });\\n  } catch (error) {\\n    console.error(error);\\n    state.ui.status.error = error?.message || 'Failed to extract PDF text.';\\n    bus.emit('error', state.ui.status.error);\\n  } finally {\\n    state.ui.busy = false;\\n  }\\n}\\n\\nfunction renderPageToBuffer(items, pageWidth, pageHeight) {\\n  const rows = [];\\n  const rowCount = Math.max(1, Math.ceil((pageHeight / pageWidth) * BUFFER_WIDTH * 1.6));\\n\\n  for (let i = 0; i < rowCount; i += 1) {\\n    rows.push(Array(BUFFER_WIDTH).fill(' '));\\n  }\\n\\n  for (const item of items) {\\n    const text = String(item.str || '');\\n    if (!text.trim()) continue;\\n\\n    const transform = item.transform || [1, 0, 0, 1, 0, 0];\\n    const x = Number(transform[4] || 0);\\n    const y = Number(transform[5] || 0);\\n    const col = clamp(Math.round((x / Math.max(pageWidth, 1)) * (BUFFER_WIDTH - 1)), 0, BUFFER_WIDTH - 1);\\n    const row = clamp(Math.round(((pageHeight - y) / Math.max(pageHeight, 1)) * (rowCount - 1)), 0, rowCount - 1);\\n\\n    for (let i = 0; i < text.length; i += 1) {\\n      const targetCol = col + i;\\n      if (targetCol >= BUFFER_WIDTH) break;\\n      rows[row][targetCol] = text[i];\\n    }\\n  }\\n\\n  return rows\\n    .map(chars => chars.join('').replace(/\\\\s+$/g, ''))\\n    .join('\\\\n')\\n    .replace(/\\\\n{3,}/g, '\\\\n\\\\n')\\n    .trimEnd();\\n}\\n\\nfunction clamp(value, min, max) {\\n  return Math.min(max, Math.max(min, value));\\n}\\n",
    "index.html": "<!doctype html>\\n<html lang=\\"en\\">\\n<head>\\n  <meta charset=\\"UTF-8\\">\\n  <meta name=\\"viewport\\" content=\\"width=device-width, initial-scale=1.0\\">\\n  <title>PDF Text Extractor</title>\\n  <link rel=\\"stylesheet\\" href=\\"./style.css\\">\\n</head>\\n<body>\\n  <div id=\\"app\\" class=\\"app-shell\\">\\n    <header class=\\"hero\\">\\n      <div>\\n        <h1>PDF Text Extractor</h1>\\n        <p class=\\"subtitle\\">Drop a PDF to build a text-only page layout preview using a 100-column virtual buffer.</p>\\n      </div>\\n      <div class=\\"hero-stats\\" data-bind-context=\\"stats\\">\\n        <div class=\\"stat-card\\">\\n          <span class=\\"stat-label\\">Pages</span>\\n          <strong data-bind-text=\\"pages\\"></strong>\\n        </div>\\n        <div class=\\"stat-card\\">\\n          <span class=\\"stat-label\\">Chars</span>\\n          <strong data-bind-text=\\"characters\\"></strong>\\n        </div>\\n        <div class=\\"stat-card\\">\\n          <span class=\\"stat-label\\">Sessions</span>\\n          <strong data-bind-text=\\"sessions\\"></strong>\\n        </div>\\n      </div>\\n    </header>\\n\\n    <main class=\\"workspace\\">\\n      <section class=\\"panel controls\\" data-bind-context=\\"ui\\">\\n        <label\\n          id=\\"dropzone\\"\\n          class=\\"dropzone\\"\\n          data-bind-class-dragover=\\"dragOver\\"\\n          data-bind-class-busy=\\"busy\\"\\n          for=\\"pdf-input\\"\\n        >\\n          <input id=\\"pdf-input\\" type=\\"file\\" accept=\\"application/pdf\\">\\n          <span class=\\"dropzone-title\\" data-bind-text=\\"dropzoneTitle\\"></span>\\n          <span class=\\"dropzone-hint\\" data-bind-text=\\"dropzoneHint\\"></span>\\n        </label>\\n\\n        <div class=\\"actions\\">\\n          <button class=\\"secondary\\" data-bind-onclick=\\"loadSample\\">Load sample instructions</button>\\n          <button class=\\"danger\\" data-bind-onclick=\\"clearOutput\\">Clear output</button>\\n        </div>\\n\\n        <section class=\\"status-card\\">\\n          <h2>Status</h2>\\n          <p class=\\"status-line\\" data-bind-text=\\"status.message\\"></p>\\n          <p class=\\"error-line\\" data-bind-text=\\"status.error\\"></p>\\n        </section>\\n\\n        <section class=\\"status-card\\">\\n          <h2>Saved Sessions</h2>\\n          <div class=\\"actions compact-actions\\">\\n            <button class=\\"secondary\\" data-bind-onclick=\\"clearHistory\\">Clear saved history</button>\\n          </div>\\n          <asljs-list id=\\"history-list\\">\\n            <template data-slot=\\"container\\">\\n              <div class=\\"log-list\\" data-role=\\"items\\"></div>\\n            </template>\\n            <template data-slot=\\"item\\">\\n              <button\\n                class=\\"history-entry\\"\\n                type=\\"button\\"\\n                data-bind-class-selected=\\"item.selected\\"\\n                data-bind-onclick=\\"context.restoreSession\\"\\n                data-bind-data-session-id=\\"item.id\\"\\n              >\\n                <div class=\\"log-entry-top\\">\\n                  <strong data-bind-text=\\"item.fileName\\"></strong>\\n                  <span data-bind-text=\\"item.createdAt\\"></span>\\n                </div>\\n                <span data-bind-text=\\"item.summary\\"></span>\\n              </button>\\n            </template>\\n            <template data-slot=\\"empty\\">\\n              <p class=\\"empty-state\\">No saved sessions yet.</p>\\n            </template>\\n          </asljs-list>\\n        </section>\\n\\n        <section class=\\"status-card\\">\\n          <h2>Activity Log</h2>\\n          <asljs-list id=\\"activity-list\\">\\n            <template data-slot=\\"container\\">\\n              <div class=\\"log-list\\" data-role=\\"items\\"></div>\\n            </template>\\n            <template data-slot=\\"item\\">\\n              <article class=\\"log-entry\\" data-bind-class-highlight=\\"item.highlight\\">\\n                <div class=\\"log-entry-top\\">\\n                  <strong data-bind-text=\\"item.title\\"></strong>\\n                  <span data-bind-text=\\"item.time\\"></span>\\n                </div>\\n                <p data-bind-text=\\"item.detail\\"></p>\\n              </article>\\n            </template>\\n            <template data-slot=\\"empty\\">\\n              <p class=\\"empty-state\\">No activity yet.</p>\\n            </template>\\n          </asljs-list>\\n        </section>\\n      </section>\\n\\n      <section class=\\"panel output-panel\\">\\n        <div class=\\"output-header\\">\\n          <h2>Extracted Text Layout</h2>\\n          <p>Whitespace preserved, 8pt monospace, all pages shown.</p>\\n        </div>\\n        <asljs-list id=\\"pages-list\\">\\n          <template data-slot=\\"container\\">\\n            <div class=\\"pages-list\\" data-role=\\"items\\"></div>\\n          </template>\\n          <template data-slot=\\"item\\">\\n            <section class=\\"page-card\\">\\n              <header class=\\"page-card-header\\">\\n                <h3>Page <span data-bind-text=\\"item.pageNumber\\"></span></h3>\\n                <span data-bind-text=\\"item.summary\\"></span>\\n              </header>\\n              <pre class=\\"page-text\\" data-bind-text=\\"item.text\\"></pre>\\n            </section>\\n          </template>\\n          <template data-slot=\\"empty\\">\\n            <div class=\\"empty-output\\">\\n              <h3>No PDF loaded</h3>\\n              <p>Drop a PDF file onto the zone to extract positioned text.</p>\\n            </div>\\n          </template>\\n        </asljs-list>\\n      </section>\\n    </main>\\n  </div>\\n\\n  <script type=\\"module\\" src=\\"app.js\\"><\/script>\\n</body>\\n</html>",
    "package.json": "{\\n  \\"name\\": \\"pdf-text-extractor\\",\\n  \\"version\\": \\"1.0.0\\",\\n  \\"private\\": true,\\n  \\"type\\": \\"module\\",\\n  \\"scripts\\": {\\n    \\"start\\": \\"npx serve .\\",\\n    \\"dev\\": \\"npx serve .\\"\\n  },\\n  \\"dependencies\\": {\\n    \\"asljs-components\\": \\"latest\\",\\n    \\"asljs-dali\\": \\"latest\\",\\n    \\"asljs-data-binding\\": \\"latest\\",\\n    \\"asljs-eventful\\": \\"latest\\",\\n    \\"asljs-observable\\": \\"latest\\"\\n  }\\n}",
    "style.css": ":root {\\n  color-scheme: light;\\n  --bg: #f4f7fb;\\n  --panel: #ffffff;\\n  --border: #d8e0ea;\\n  --text: #1f2937;\\n  --muted: #5f6b7a;\\n  --accent: #2563eb;\\n  --accent-soft: #dbeafe;\\n  --danger: #b91c1c;\\n  --shadow: 0 10px 30px rgba(15, 23, 42, 0.08);\\n}\\n\\n* {\\n  box-sizing: border-box;\\n}\\n\\nbody {\\n  margin: 0;\\n  font-family: Arial, Helvetica, sans-serif;\\n  background: var(--bg);\\n  color: var(--text);\\n}\\n\\n.app-shell {\\n  max-width: 1400px;\\n  margin: 0 auto;\\n  padding: 24px;\\n}\\n\\n.hero {\\n  display: flex;\\n  justify-content: space-between;\\n  gap: 16px;\\n  align-items: flex-start;\\n  margin-bottom: 24px;\\n}\\n\\n.hero h1 {\\n  margin: 0 0 8px;\\n}\\n\\n.subtitle {\\n  margin: 0;\\n  color: var(--muted);\\n}\\n\\n.hero-stats {\\n  display: flex;\\n  gap: 12px;\\n}\\n\\n.stat-card,\\n.panel,\\n.page-card,\\n.status-card,\\n.log-entry {\\n  background: var(--panel);\\n  border: 1px solid var(--border);\\n  border-radius: 14px;\\n  box-shadow: var(--shadow);\\n}\\n\\n.stat-card {\\n  min-width: 110px;\\n  padding: 14px;\\n}\\n\\n.stat-label {\\n  display: block;\\n  color: var(--muted);\\n  font-size: 12px;\\n  margin-bottom: 6px;\\n}\\n\\n.workspace {\\n  display: grid;\\n  grid-template-columns: 340px 1fr;\\n  gap: 20px;\\n}\\n\\n.panel {\\n  padding: 18px;\\n}\\n\\n.controls {\\n  display: flex;\\n  flex-direction: column;\\n  gap: 16px;\\n}\\n\\n.dropzone {\\n  display: flex;\\n  flex-direction: column;\\n  justify-content: center;\\n  align-items: center;\\n  min-height: 220px;\\n  border: 2px dashed #93c5fd;\\n  border-radius: 16px;\\n  background: #eff6ff;\\n  text-align: center;\\n  padding: 20px;\\n  cursor: pointer;\\n  transition: 0.2s ease;\\n}\\n\\n.dropzone.dragover {\\n  border-color: var(--accent);\\n  background: var(--accent-soft);\\n  transform: scale(1.01);\\n}\\n\\n.dropzone.busy {\\n  opacity: 0.7;\\n}\\n\\n.dropzone input {\\n  display: none;\\n}\\n\\n.dropzone-title {\\n  font-size: 20px;\\n  font-weight: 700;\\n  margin-bottom: 8px;\\n}\\n\\n.dropzone-hint {\\n  color: var(--muted);\\n  line-height: 1.5;\\n}\\n\\n.actions {\\n  display: flex;\\n  gap: 10px;\\n}\\n\\n.compact-actions {\\n  margin-bottom: 10px;\\n}\\n\\nbutton {\\n  border: 1px solid var(--border);\\n  background: white;\\n  color: var(--text);\\n  border-radius: 10px;\\n  padding: 10px 14px;\\n  cursor: pointer;\\n}\\n\\nbutton.secondary {\\n  background: #eff6ff;\\n}\\n\\nbutton.danger {\\n  color: white;\\n  background: var(--danger);\\n  border-color: var(--danger);\\n}\\n\\n.status-card {\\n  padding: 14px;\\n}\\n\\n.status-card h2,\\n.output-header h2 {\\n  margin-top: 0;\\n}\\n\\n.status-line,\\n.error-line,\\n.empty-state,\\n.empty-output p,\\n.output-header p,\\n.log-entry p {\\n  margin-bottom: 0;\\n}\\n\\n.error-line {\\n  color: var(--danger);\\n  min-height: 1.2em;\\n}\\n\\n.log-list,\\n.pages-list {\\n  display: flex;\\n  flex-direction: column;\\n  gap: 12px;\\n}\\n\\n.log-entry {\\n  padding: 12px;\\n}\\n\\n.history-entry {\\n  width: 100%;\\n  text-align: left;\\n  display: flex;\\n  flex-direction: column;\\n  gap: 6px;\\n}\\n\\n.history-entry.selected {\\n  border-color: var(--accent);\\n  background: var(--accent-soft);\\n}\\n\\n.log-entry.highlight {\\n  border-color: #93c5fd;\\n}\\n\\n.log-entry-top {\\n  display: flex;\\n  justify-content: space-between;\\n  gap: 12px;\\n  font-size: 12px;\\n  color: var(--muted);\\n}\\n\\n.output-panel {\\n  min-width: 0;\\n}\\n\\n.output-header {\\n  margin-bottom: 16px;\\n}\\n\\n.page-card {\\n  padding: 16px;\\n}\\n\\n.page-card-header {\\n  display: flex;\\n  justify-content: space-between;\\n  gap: 12px;\\n  align-items: baseline;\\n  margin-bottom: 12px;\\n}\\n\\n.page-card-header h3 {\\n  margin: 0;\\n}\\n\\n.page-text {\\n  margin: 0;\\n  white-space: pre-wrap;\\n  font-family: \\"Courier New\\", Courier, monospace;\\n  font-size: 8pt;\\n  line-height: 1.2;\\n  overflow: auto;\\n  background: #f8fafc;\\n  border: 1px solid var(--border);\\n  border-radius: 10px;\\n  padding: 12px;\\n}\\n\\n.empty-output {\\n  border: 1px dashed var(--border);\\n  border-radius: 14px;\\n  padding: 24px;\\n  text-align: center;\\n  background: #f8fafc;\\n}\\n\\n@media (max-width: 980px) {\\n  .hero,\\n  .workspace {\\n    grid-template-columns: 1fr;\\n    display: grid;\\n  }\\n\\n  .hero-stats {\\n    flex-wrap: wrap;\\n  }\\n}\\n"
  }
}`;function Ga(e){const t={};for(const r of e.files)t[r.name]=r.content;return{id:e.app.id,name:e.app.name,author:vr(e.app.author),files:t}}function yr(e){const t=JSON.parse(e);return br(t),t}function Ka(e){br(e.payload);const t=e.existingApps.find(i=>i.id===e.payload.id);if(t!==void 0)return e.navigateToExistingById?{kind:"existing",appId:t.id}:{kind:"duplicate"};const r={id:e.payload.id,uuid:e.createUuid(),name:e.payload.name,author:vr(e.payload.author),createdAt:e.now,updatedAt:e.now},s=Object.entries(e.payload.files).map(([i,p])=>({id:e.createId(),appId:r.id,name:i,content:p}));return{kind:"new",app:r,files:s}}function br(e){if(typeof e.id!="string"||e.id.trim()==="")throw new Error("Invalid app JSON format.");if(typeof e.name!="string"||e.name.trim()==="")throw new Error("Invalid app JSON format.");if(e.files===null||typeof e.files!="object")throw new Error("Invalid app JSON format.");if(!Ya(e.author))throw new Error("Invalid app JSON format.");for(const[t,r]of Object.entries(e.files))if(t.trim()===""||typeof r!="string")throw new Error("Invalid app JSON format.")}function vr(e){if(e===void 0)return;const t=typeof e.name=="string"?e.name.trim():"",r=typeof e.email=="string"?e.email.trim():"";if(!(t===""&&r===""))return{...t!==""?{name:t}:{},...r!==""?{email:r}:{}}}function Ya(e){if(e===void 0)return!0;if(e===null||typeof e!="object")return!1;const t=e;return!(t.name!==void 0&&typeof t.name!="string"||t.email!==void 0&&typeof t.email!="string")}const Xa=[qa,Ja];function wr(){return Xa.map(ei).map(yr)}function Qa(e){return wr().find(r=>r.name===e)??null}function Vn(e){return wr().find(r=>r.id===e)??null}function Za(e,t,r){return Object.entries(e.files).map(([s,i])=>({id:r(),appId:t,name:s,content:i}))}function ei(e){if(typeof e=="string")return e;if(e!==null&&typeof e=="object")return JSON.stringify(e);throw new Error("Invalid sample source format.")}const ti=6e3;function ni(e){const t=Number.isFinite(e.timeoutMs)?Math.max(1,Math.floor(e.timeoutMs)):ti;async function r(p){const v=JSON.stringify(p),G=await Hn(e.codec.compress(v),t,"Link compression timed out. Use Download export instead."),X=`${e.baseUrl}${e.hashPrefix}${G}`;return{url:X,exceedsMaxUrlLength:X.length>e.maxUrlLength}}async function s(p){const v=await Hn(e.codec.decompress(p),t,"Link decompression timed out.");return JSON.parse(v)}function i(p){return p.startsWith(e.hashPrefix)?p.slice(e.hashPrefix.length):null}return{createShareUrl:r,parsePayloadFromToken:s,readTokenFromHash:i}}function ri(){return{compress:si,decompress:ai}}async function si(e){const t=new TextEncoder().encode(e),r=await ii(t,"gzip");return li(r)}async function ai(e){const t=ci(e),r=await oi(t,"gzip");return new TextDecoder().decode(r)}async function ii(e,t){const r=new Blob([xr(e)]).stream().pipeThrough(new CompressionStream(t));return Er(r)}async function oi(e,t){const r=new Blob([xr(e)]).stream().pipeThrough(new DecompressionStream(t));return Er(r)}function xr(e){const t=new Uint8Array(e.byteLength);return t.set(e),t}async function Er(e){const t=e.getReader(),r=[];let s=0;for(;;){const{value:v,done:G}=await t.read();if(G)break;v!==void 0&&(r.push(v),s+=v.length)}const i=new Uint8Array(s);let p=0;for(const v of r)i.set(v,p),p+=v.length;return i}function li(e){let r="";for(let s=0;s<e.length;s+=32768){const i=e.subarray(s,s+32768);r+=String.fromCharCode(...i)}return btoa(r).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,"")}function ci(e){const t=e.replace(/-/g,"+").replace(/_/g,"/"),r=t.length%4,s=r===0?t:`${t}${"=".repeat(4-r)}`;let i="";try{i=atob(s)}catch{throw new Error("Invalid compressed share token.")}const p=new Uint8Array(i.length);for(let v=0;v<i.length;v++)p[v]=i.charCodeAt(v);return p}async function Hn(e,t,r){let s;const i=new Promise((p,v)=>{s=globalThis.setTimeout(()=>{v(new Error(r))},t)});try{return await Promise.race([e,i])}finally{s!==void 0&&globalThis.clearTimeout(s)}}async function di(e,t){const r={...e.files};for(const[s,i]of Object.entries(e.files)){const p=ui(s);if(p!==null){r[s]=await t(i,p);continue}pi(s)&&(r[s]=fi(i))}return{...e,files:r}}function ui(e){const t=e.toLowerCase();return t.endsWith(".css")?"css":t.endsWith(".ts")?"ts":t.endsWith(".tsx")?"tsx":t.endsWith(".jsx")?"jsx":t.endsWith(".js")||t.endsWith(".mjs")||t.endsWith(".cjs")?"js":null}function pi(e){const t=e.toLowerCase();return t.endsWith(".html")||t.endsWith(".htm")}function fi(e){const t=[];return e.replace(/<(pre|textarea|script|style)\b[\s\S]*?<\/\1>/gi,i=>`__ASLJS_HTML_BLOCK_${t.push(i)-1}__`).replace(/<!--([\s\S]*?)-->/g,"").replace(/>\s+</g,"><").replace(/\s{2,}/g," ").trim().replace(/__ASLJS_HTML_BLOCK_(\d+)__/g,(i,p)=>t[Number.parseInt(p,10)]??"")}const mi="Use copy buttons to share as text or HTML.";function hi(e){return/(?:^|\/)[^/]+\.test\.js$/i.test(e.trim())}function qn(e,t,r){const s=`Link is ready at ${e} characters. Practical working limit is about ${t}. `;return e>r?`${s}It is over the warning threshold of ${r}, so some apps may reject it.`:e>t?`${s}It may still work, but shorter links are safer.`:`${s}${mi}`}var Yt={exports:{}},Jn;function gi(){return Jn||(Jn=1,(function(e){(t=>{var r=Object.defineProperty,s=Object.getOwnPropertyDescriptor,i=Object.getOwnPropertyNames,p=Object.prototype.hasOwnProperty,v=(n,a)=>{for(var l in a)r(n,l,{get:a[l],enumerable:!0})},G=(n,a,l,f)=>{if(a&&typeof a=="object"||typeof a=="function")for(let x of i(a))!p.call(n,x)&&x!==l&&r(n,x,{get:()=>a[x],enumerable:!(f=s(a,x))||f.enumerable});return n},X=n=>G(r({},"__esModule",{value:!0}),n),ce=(n,a,l)=>new Promise((f,x)=>{var E=u=>{try{j(l.next(u))}catch(T){x(T)}},y=u=>{try{j(l.throw(u))}catch(T){x(T)}},j=u=>u.done?f(u.value):Promise.resolve(u.value).then(E,y);j((l=l.apply(n,a)).next())}),ee={};v(ee,{analyzeMetafile:()=>vs,analyzeMetafileSync:()=>ks,build:()=>hs,buildSync:()=>ws,context:()=>gs,default:()=>Ts,formatMessages:()=>bs,formatMessagesSync:()=>Es,initialize:()=>Ss,stop:()=>As,transform:()=>ys,transformSync:()=>xs,version:()=>ms}),t.exports=X(ee);function de(n){let a=f=>{if(f===null)l.write8(0);else if(typeof f=="boolean")l.write8(1),l.write8(+f);else if(typeof f=="number")l.write8(2),l.write32(f|0);else if(typeof f=="string")l.write8(3),l.write(Y(f));else if(f instanceof Uint8Array)l.write8(4),l.write(f);else if(f instanceof Array){l.write8(5),l.write32(f.length);for(let x of f)a(x)}else{let x=Object.keys(f);l.write8(6),l.write32(x.length);for(let E of x)l.write(Y(E)),a(f[E])}},l=new te;return l.write32(0),l.write32(n.id<<1|+!n.isRequest),a(n.value),Ae(l.buf,l.len-4,0),l.buf.subarray(0,l.len)}function H(n){let a=()=>{switch(l.read8()){case 0:return null;case 1:return!!l.read8();case 2:return l.read32();case 3:return fe(l.read());case 4:return l.read();case 5:{let y=l.read32(),j=[];for(let u=0;u<y;u++)j.push(a());return j}case 6:{let y=l.read32(),j={};for(let u=0;u<y;u++)j[fe(l.read())]=a();return j}default:throw new Error("Invalid packet")}},l=new te(n),f=l.read32(),x=(f&1)===0;f>>>=1;let E=a();if(l.ptr!==n.length)throw new Error("Invalid packet");return{id:f,isRequest:x,value:E}}var te=class{constructor(n=new Uint8Array(1024)){this.buf=n,this.len=0,this.ptr=0}_write(n){if(this.len+n>this.buf.length){let a=new Uint8Array((this.len+n)*2);a.set(this.buf),this.buf=a}return this.len+=n,this.len-n}write8(n){let a=this._write(1);this.buf[a]=n}write32(n){let a=this._write(4);Ae(this.buf,n,a)}write(n){let a=this._write(4+n.length);Ae(this.buf,n.length,a),this.buf.set(n,a+4)}_read(n){if(this.ptr+n>this.buf.length)throw new Error("Invalid packet");return this.ptr+=n,this.ptr-n}read8(){return this.buf[this._read(1)]}read32(){return ue(this.buf,this._read(4))}read(){let n=this.read32(),a=new Uint8Array(n),l=this._read(a.length);return a.set(this.buf.subarray(l,l+n)),a}},Y,fe,ge;if(typeof TextEncoder<"u"&&typeof TextDecoder<"u"){let n=new TextEncoder,a=new TextDecoder;Y=l=>n.encode(l),fe=l=>a.decode(l),ge='new TextEncoder().encode("")'}else if(typeof Buffer<"u")Y=n=>Buffer.from(n),fe=n=>{let{buffer:a,byteOffset:l,byteLength:f}=n;return Buffer.from(a,l,f).toString()},ge='Buffer.from("")';else throw new Error("No UTF-8 codec found");if(!(Y("")instanceof Uint8Array))throw new Error(`Invariant violation: "${ge} instanceof Uint8Array" is incorrectly false

This indicates that your JavaScript environment is broken. You cannot use
esbuild in this environment because esbuild relies on this invariant. This
is not a problem with esbuild. You need to fix your environment instead.
`);function ue(n,a){return(n[a++]|n[a++]<<8|n[a++]<<16|n[a++]<<24)>>>0}function Ae(n,a,l){n[l++]=a,n[l++]=a>>8,n[l++]=a>>16,n[l++]=a>>24}var q=String.fromCharCode;function B(n,a,l){const f=n[a];let x=1,E=0;for(let y=0;y<a;y++)n[y]===10?(x++,E=0):E++;throw new SyntaxError(l||(a===n.length?"Unexpected end of input while parsing JSON":f>=32&&f<=126?`Unexpected character ${q(f)} in JSON at position ${a} (line ${x}, column ${E})`:`Unexpected byte 0x${f.toString(16)} in JSON at position ${a} (line ${x}, column ${E})`))}function I(n){if(!(n instanceof Uint8Array))throw new Error("JSON input must be a Uint8Array");const a=[],l=[],f=[],x=n.length;let E=null,y=0,j,u=0;for(;u<x;){let T=n[u++];if(T<=32)continue;let F;switch(y===2&&E===null&&T!==34&&T!==125&&B(n,--u),T){case 116:{(n[u++]!==114||n[u++]!==117||n[u++]!==101)&&B(n,--u),F=!0;break}case 102:{(n[u++]!==97||n[u++]!==108||n[u++]!==115||n[u++]!==101)&&B(n,--u),F=!1;break}case 110:{(n[u++]!==117||n[u++]!==108||n[u++]!==108)&&B(n,--u),F=null;break}case 45:case 46:case 48:case 49:case 50:case 51:case 52:case 53:case 54:case 55:case 56:case 57:{let $=u;for(F=q(T),T=n[u];;){switch(T){case 43:case 45:case 46:case 48:case 49:case 50:case 51:case 52:case 53:case 54:case 55:case 56:case 57:case 101:case 69:{F+=q(T),T=n[++u];continue}}break}F=+F,isNaN(F)&&B(n,--$,"Invalid number");break}case 34:{for(F="";u>=x&&B(n,x),T=n[u++],T!==34;)if(T===92)switch(n[u++]){case 34:F+='"';break;case 47:F+="/";break;case 92:F+="\\";break;case 98:F+="\b";break;case 102:F+="\f";break;case 110:F+=`
`;break;case 114:F+="\r";break;case 116:F+="	";break;case 117:{let $=0;for(let re=0;re<4;re++)T=n[u++],$<<=4,T>=48&&T<=57?$|=T-48:T>=97&&T<=102?$|=T+-87:T>=65&&T<=70?$|=T+-55:B(n,--u);F+=q($);break}default:B(n,--u);break}else if(T<=127)F+=q(T);else if((T&224)===192)F+=q((T&31)<<6|n[u++]&63);else if((T&240)===224)F+=q((T&15)<<12|(n[u++]&63)<<6|n[u++]&63);else if((T&248)==240){let $=(T&7)<<18|(n[u++]&63)<<12|(n[u++]&63)<<6|n[u++]&63;$>65535&&($-=65536,F+=q($>>10&1023|55296),$=56320|$&1023),F+=q($)}F[0];break}case 91:{F=[],a.push(E),l.push(j),f.push(y),E=null,j=F,y=1;continue}case 123:{F={},a.push(E),l.push(j),f.push(y),E=null,j=F,y=2;continue}case 93:{y!==1&&B(n,--u),F=j,E=a.pop(),j=l.pop(),y=f.pop();break}case 125:{y!==2&&B(n,--u),F=j,E=a.pop(),j=l.pop(),y=f.pop();break}default:B(n,--u)}for(T=n[u];T<=32;)T=n[++u];switch(y){case 0:{if(u===x)return F;break}case 1:{if(j.push(F),T===44){u++;continue}if(T===93)continue;break}case 2:{if(E===null){if(E=F,T===58){u++;continue}}else{if(j[E]=F,E=null,T===44){u++;continue}if(T===125)continue}break}}break}B(n,u)}var A=JSON.stringify,U="warning",Q="silent";function pe(n,a){const l=[];for(const f of n){if(Ie(f,a),f.indexOf(",")>=0)throw new Error(`Invalid ${a}: ${f}`);l.push(f)}return l.join(",")}var we=()=>null,le=n=>typeof n=="boolean"?null:"a boolean",N=n=>typeof n=="string"?null:"a string",gt=n=>n instanceof RegExp?null:"a RegExp object",He=n=>typeof n=="number"&&n===(n|0)?null:"an integer",es=n=>typeof n=="number"&&n===(n|0)&&n>=0&&n<=65535?null:"a valid port number",In=n=>typeof n=="function"?null:"a function",Me=n=>Array.isArray(n)?null:"an array",Se=n=>Array.isArray(n)&&n.every(a=>typeof a=="string")?null:"an array of strings",je=n=>typeof n=="object"&&n!==null&&!Array.isArray(n)?null:"an object",ts=n=>typeof n=="object"&&n!==null?null:"an array or an object",ns=n=>n instanceof WebAssembly.Module?null:"a WebAssembly.Module",Tn=n=>typeof n=="object"&&!Array.isArray(n)?null:"an object or null",jn=n=>typeof n=="string"||typeof n=="boolean"?null:"a string or a boolean",rs=n=>typeof n=="string"||typeof n=="object"&&n!==null&&!Array.isArray(n)?null:"a string or an object",Pn=n=>typeof n=="string"||Array.isArray(n)&&n.every(a=>typeof a=="string")?null:"a string or an array of strings",Cn=n=>typeof n=="string"||n instanceof Uint8Array?null:"a string or a Uint8Array",ss=n=>typeof n=="string"||n instanceof URL?null:"a string or a URL";function d(n,a,l,f){let x=n[l];if(a[l+""]=!0,x===void 0)return;let E=f(x);if(E!==null)throw new Error(`${A(l)} must be ${E}`);return x}function ye(n,a,l){for(let f in n)if(!(f in a))throw new Error(`Invalid option ${l}: ${A(f)}`)}function as(n){let a=Object.create(null),l=d(n,a,"wasmURL",ss),f=d(n,a,"wasmModule",ns),x=d(n,a,"worker",le);return ye(n,a,"in initialize() call"),{wasmURL:l,wasmModule:f,worker:x}}function Fn(n){let a;if(n!==void 0){a=Object.create(null);for(let l in n){let f=n[l];if(typeof f=="string"||f===!1)a[l]=f;else throw new Error(`Expected ${A(l)} in mangle cache to map to either a string or false`)}}return a}function yt(n,a,l,f,x){let E=d(a,l,"color",le),y=d(a,l,"logLevel",N),j=d(a,l,"logLimit",He);E!==void 0?n.push(`--color=${E}`):f&&n.push("--color=true"),n.push(`--log-level=${y||x}`),n.push(`--log-limit=${j||0}`)}function Ie(n,a,l){if(typeof n!="string")throw new Error(`Expected value for ${a}${l!==void 0?" "+A(l):""} to be a string, got ${typeof n} instead`);return n}function Dn(n,a,l){let f=d(a,l,"legalComments",N),x=d(a,l,"sourceRoot",N),E=d(a,l,"sourcesContent",le),y=d(a,l,"target",Pn),j=d(a,l,"format",N),u=d(a,l,"globalName",N),T=d(a,l,"mangleProps",gt),F=d(a,l,"reserveProps",gt),$=d(a,l,"mangleQuoted",le),re=d(a,l,"minify",le),Z=d(a,l,"minifySyntax",le),ae=d(a,l,"minifyWhitespace",le),ie=d(a,l,"minifyIdentifiers",le),V=d(a,l,"lineLimit",He),he=d(a,l,"drop",Se),W=d(a,l,"dropLabels",Se),z=d(a,l,"charset",N),S=d(a,l,"treeShaking",le),b=d(a,l,"ignoreAnnotations",le),c=d(a,l,"jsx",N),h=d(a,l,"jsxFactory",N),w=d(a,l,"jsxFragment",N),D=d(a,l,"jsxImportSource",N),M=d(a,l,"jsxDev",le),g=d(a,l,"jsxSideEffects",le),k=d(a,l,"define",je),_=d(a,l,"logOverride",je),o=d(a,l,"supported",je),m=d(a,l,"pure",Se),C=d(a,l,"keepNames",le),P=d(a,l,"platform",N),K=d(a,l,"tsconfigRaw",rs),me=d(a,l,"absPaths",Se);if(f&&n.push(`--legal-comments=${f}`),x!==void 0&&n.push(`--source-root=${x}`),E!==void 0&&n.push(`--sources-content=${E}`),y&&n.push(`--target=${pe(Array.isArray(y)?y:[y],"target")}`),j&&n.push(`--format=${j}`),u&&n.push(`--global-name=${u}`),P&&n.push(`--platform=${P}`),K&&n.push(`--tsconfig-raw=${typeof K=="string"?K:JSON.stringify(K)}`),re&&n.push("--minify"),Z&&n.push("--minify-syntax"),ae&&n.push("--minify-whitespace"),ie&&n.push("--minify-identifiers"),V&&n.push(`--line-limit=${V}`),z&&n.push(`--charset=${z}`),S!==void 0&&n.push(`--tree-shaking=${S}`),b&&n.push("--ignore-annotations"),he)for(let R of he)n.push(`--drop:${Ie(R,"drop")}`);if(W&&n.push(`--drop-labels=${pe(W,"drop label")}`),me&&n.push(`--abs-paths=${pe(me,"abs paths")}`),T&&n.push(`--mangle-props=${wt(T)}`),F&&n.push(`--reserve-props=${wt(F)}`),$!==void 0&&n.push(`--mangle-quoted=${$}`),c&&n.push(`--jsx=${c}`),h&&n.push(`--jsx-factory=${h}`),w&&n.push(`--jsx-fragment=${w}`),D&&n.push(`--jsx-import-source=${D}`),M&&n.push("--jsx-dev"),g&&n.push("--jsx-side-effects"),k)for(let R in k){if(R.indexOf("=")>=0)throw new Error(`Invalid define: ${R}`);n.push(`--define:${R}=${Ie(k[R],"define",R)}`)}if(_)for(let R in _){if(R.indexOf("=")>=0)throw new Error(`Invalid log override: ${R}`);n.push(`--log-override:${R}=${Ie(_[R],"log override",R)}`)}if(o)for(let R in o){if(R.indexOf("=")>=0)throw new Error(`Invalid supported: ${R}`);const oe=o[R];if(typeof oe!="boolean")throw new Error(`Expected value for supported ${A(R)} to be a boolean, got ${typeof oe} instead`);n.push(`--supported:${R}=${oe}`)}if(m)for(let R of m)n.push(`--pure:${Ie(R,"pure")}`);C&&n.push("--keep-names")}function is(n,a,l,f,x){var E;let y=[],j=[],u=Object.create(null),T=null,F=null;yt(y,a,u,l,f),Dn(y,a,u);let $=d(a,u,"sourcemap",jn),re=d(a,u,"bundle",le),Z=d(a,u,"splitting",le),ae=d(a,u,"preserveSymlinks",le),ie=d(a,u,"metafile",le),V=d(a,u,"outfile",N),he=d(a,u,"outdir",N),W=d(a,u,"outbase",N),z=d(a,u,"tsconfig",N),S=d(a,u,"resolveExtensions",Se),b=d(a,u,"nodePaths",Se),c=d(a,u,"mainFields",Se),h=d(a,u,"conditions",Se),w=d(a,u,"external",Se),D=d(a,u,"packages",N),M=d(a,u,"alias",je),g=d(a,u,"loader",je),k=d(a,u,"outExtension",je),_=d(a,u,"publicPath",N),o=d(a,u,"entryNames",N),m=d(a,u,"chunkNames",N),C=d(a,u,"assetNames",N),P=d(a,u,"inject",Se),K=d(a,u,"banner",je),me=d(a,u,"footer",je),R=d(a,u,"entryPoints",ts),oe=d(a,u,"absWorkingDir",N),se=d(a,u,"stdin",je),ne=(E=d(a,u,"write",le))!=null?E:x,Te=d(a,u,"allowOverwrite",le),be=d(a,u,"mangleCache",je);if(u.plugins=!0,ye(a,u,`in ${n}() call`),$&&y.push(`--sourcemap${$===!0?"":`=${$}`}`),re&&y.push("--bundle"),Te&&y.push("--allow-overwrite"),Z&&y.push("--splitting"),ae&&y.push("--preserve-symlinks"),ie&&y.push("--metafile"),V&&y.push(`--outfile=${V}`),he&&y.push(`--outdir=${he}`),W&&y.push(`--outbase=${W}`),z&&y.push(`--tsconfig=${z}`),D&&y.push(`--packages=${D}`),S&&y.push(`--resolve-extensions=${pe(S,"resolve extension")}`),_&&y.push(`--public-path=${_}`),o&&y.push(`--entry-names=${o}`),m&&y.push(`--chunk-names=${m}`),C&&y.push(`--asset-names=${C}`),c&&y.push(`--main-fields=${pe(c,"main field")}`),h&&y.push(`--conditions=${pe(h,"condition")}`),w)for(let J of w)y.push(`--external:${Ie(J,"external")}`);if(M)for(let J in M){if(J.indexOf("=")>=0)throw new Error(`Invalid package name in alias: ${J}`);y.push(`--alias:${J}=${Ie(M[J],"alias",J)}`)}if(K)for(let J in K){if(J.indexOf("=")>=0)throw new Error(`Invalid banner file type: ${J}`);y.push(`--banner:${J}=${Ie(K[J],"banner",J)}`)}if(me)for(let J in me){if(J.indexOf("=")>=0)throw new Error(`Invalid footer file type: ${J}`);y.push(`--footer:${J}=${Ie(me[J],"footer",J)}`)}if(P)for(let J of P)y.push(`--inject:${Ie(J,"inject")}`);if(g)for(let J in g){if(J.indexOf("=")>=0)throw new Error(`Invalid loader extension: ${J}`);y.push(`--loader:${J}=${Ie(g[J],"loader",J)}`)}if(k)for(let J in k){if(J.indexOf("=")>=0)throw new Error(`Invalid out extension: ${J}`);y.push(`--out-extension:${J}=${Ie(k[J],"out extension",J)}`)}if(R)if(Array.isArray(R))for(let J=0,Ue=R.length;J<Ue;J++){let Pe=R[J];if(typeof Pe=="object"&&Pe!==null){let _e=Object.create(null),Ne=d(Pe,_e,"in",N),Ce=d(Pe,_e,"out",N);if(ye(Pe,_e,"in entry point at index "+J),Ne===void 0)throw new Error('Missing property "in" for entry point at index '+J);if(Ce===void 0)throw new Error('Missing property "out" for entry point at index '+J);j.push([Ce,Ne])}else j.push(["",Ie(Pe,"entry point at index "+J)])}else for(let J in R)j.push([J,Ie(R[J],"entry point",J)]);if(se){let J=Object.create(null),Ue=d(se,J,"contents",Cn),Pe=d(se,J,"resolveDir",N),_e=d(se,J,"sourcefile",N),Ne=d(se,J,"loader",N);ye(se,J,'in "stdin" object'),_e&&y.push(`--sourcefile=${_e}`),Ne&&y.push(`--loader=${Ne}`),Pe&&(F=Pe),typeof Ue=="string"?T=Y(Ue):Ue instanceof Uint8Array&&(T=Ue)}let $e=[];if(b)for(let J of b)J+="",$e.push(J);return{entries:j,flags:y,write:ne,stdinContents:T,stdinResolveDir:F,absWorkingDir:oe,nodePaths:$e,mangleCache:Fn(be)}}function os(n,a,l,f){let x=[],E=Object.create(null);yt(x,a,E,l,f),Dn(x,a,E);let y=d(a,E,"sourcemap",jn),j=d(a,E,"sourcefile",N),u=d(a,E,"loader",N),T=d(a,E,"banner",N),F=d(a,E,"footer",N),$=d(a,E,"mangleCache",je);return ye(a,E,`in ${n}() call`),y&&x.push(`--sourcemap=${y===!0?"external":y}`),j&&x.push(`--sourcefile=${j}`),u&&x.push(`--loader=${u}`),T&&x.push(`--banner=${T}`),F&&x.push(`--footer=${F}`),{flags:x,mangleCache:Fn($)}}function ls(n){const a={},l={didClose:!1,reason:""};let f={},x=0,E=0,y=new Uint8Array(16*1024),j=0,u=z=>{let S=j+z.length;if(S>y.length){let c=new Uint8Array(S*2);c.set(y),y=c}y.set(z,j),j+=z.length;let b=0;for(;b+4<=j;){let c=ue(y,b);if(b+4+c>j)break;b+=4,ae(y.subarray(b,b+c)),b+=c}b>0&&(y.copyWithin(0,b,j),j-=b)},T=z=>{l.didClose=!0,z&&(l.reason=": "+(z.message||z));const S="The service was stopped"+l.reason;for(let b in f)f[b](S,null);f={}},F=(z,S,b)=>{if(l.didClose)return b("The service is no longer running"+l.reason,null);let c=x++;f[c]=(h,w)=>{try{b(h,w)}finally{z&&z.unref()}},z&&z.ref(),n.writeToStdin(de({id:c,isRequest:!0,value:S}))},$=(z,S)=>{if(l.didClose)throw new Error("The service is no longer running"+l.reason);n.writeToStdin(de({id:z,isRequest:!1,value:S}))},re=(z,S)=>ce(null,null,function*(){try{if(S.command==="ping"){$(z,{});return}if(typeof S.key=="number"){const b=a[S.key];if(!b)return;const c=b[S.command];if(c){yield c(z,S);return}}throw new Error("Invalid command: "+S.command)}catch(b){const c=[qe(b,n,null,void 0,"")];try{$(z,{errors:c})}catch{}}}),Z=!0,ae=z=>{if(Z){Z=!1;let b=String.fromCharCode(...z);if(b!=="0.27.7")throw new Error(`Cannot start service: Host version "0.27.7" does not match binary version ${A(b)}`);return}let S=H(z);if(S.isRequest)re(S.id,S.value);else{let b=f[S.id];delete f[S.id],S.value.error?b(S.value.error,{}):b(null,S.value)}};return{readFromStdout:u,afterClose:T,service:{buildOrContext:({callName:z,refs:S,options:b,isTTY:c,defaultWD:h,callback:w})=>{let D=0;const M=E++,g={},k={ref(){++D===1&&S&&S.ref()},unref(){--D===0&&(delete a[M],S&&S.unref())}};a[M]=g,k.ref(),cs(z,M,F,$,k,n,g,b,c,h,(_,o)=>{try{w(_,o)}finally{k.unref()}})},transform:({callName:z,refs:S,input:b,options:c,isTTY:h,fs:w,callback:D})=>{const M=_n();let g=k=>{try{if(typeof b!="string"&&!(b instanceof Uint8Array))throw new Error('The input to "transform" must be a string or a Uint8Array');let{flags:_,mangleCache:o}=os(z,c,h,Q),m={command:"transform",flags:_,inputFS:k!==null,input:k!==null?Y(k):typeof b=="string"?Y(b):b};o&&(m.mangleCache=o),F(S,m,(C,P)=>{if(C)return D(new Error(C),null);let K=Xe(P.errors,M),me=Xe(P.warnings,M),R=1,oe=()=>{if(--R===0){let se={warnings:me,code:P.code,map:P.map,mangleCache:void 0,legalComments:void 0};"legalComments"in P&&(se.legalComments=P==null?void 0:P.legalComments),P.mangleCache&&(se.mangleCache=P==null?void 0:P.mangleCache),D(null,se)}};if(K.length>0)return D(it("Transform failed",K,me),null);P.codeFS&&(R++,w.readFile(P.code,(se,ne)=>{se!==null?D(se,null):(P.code=ne,oe())})),P.mapFS&&(R++,w.readFile(P.map,(se,ne)=>{se!==null?D(se,null):(P.map=ne,oe())})),oe()})}catch(_){let o=[];try{yt(o,c,{},h,Q)}catch{}const m=qe(_,n,M,void 0,"");F(S,{command:"error",flags:o,error:m},()=>{m.detail=M.load(m.detail),D(it("Transform failed",[m],[]),null)})}};if((typeof b=="string"||b instanceof Uint8Array)&&b.length>1024*1024){let k=g;g=()=>w.writeFile(b,k)}g(null)},formatMessages:({callName:z,refs:S,messages:b,options:c,callback:h})=>{if(!c)throw new Error(`Missing second argument in ${z}() call`);let w={},D=d(c,w,"kind",N),M=d(c,w,"color",le),g=d(c,w,"terminalWidth",He);if(ye(c,w,`in ${z}() call`),D===void 0)throw new Error(`Missing "kind" in ${z}() call`);if(D!=="error"&&D!=="warning")throw new Error(`Expected "kind" to be "error" or "warning" in ${z}() call`);let k={command:"format-msgs",messages:Re(b,"messages",null,"",g),isWarning:D==="warning"};M!==void 0&&(k.color=M),g!==void 0&&(k.terminalWidth=g),F(S,k,(_,o)=>{if(_)return h(new Error(_),null);h(null,o.messages)})},analyzeMetafile:({callName:z,refs:S,metafile:b,options:c,callback:h})=>{c===void 0&&(c={});let w={},D=d(c,w,"color",le),M=d(c,w,"verbose",le);ye(c,w,`in ${z}() call`);let g={command:"analyze-metafile",metafile:b};D!==void 0&&(g.color=D),M!==void 0&&(g.verbose=M),F(S,g,(k,_)=>{if(k)return h(new Error(k),null);h(null,_.result)})}}}}function cs(n,a,l,f,x,E,y,j,u,T,F){const $=_n(),re=n==="context",Z=(V,he)=>{const W=[];try{yt(W,j,{},u,U)}catch{}const z=qe(V,E,$,void 0,he);l(x,{command:"error",flags:W,error:z},()=>{z.detail=$.load(z.detail),F(it(re?"Context failed":"Build failed",[z],[]),null)})};let ae;if(typeof j=="object"){const V=j.plugins;if(V!==void 0){if(!Array.isArray(V))return Z(new Error('"plugins" must be an array'),"");ae=V}}if(ae&&ae.length>0){if(E.isSync)return Z(new Error("Cannot use plugins in synchronous API calls"),"");ds(a,l,f,x,E,y,j,ae,$).then(V=>{if(!V.ok)return Z(V.error,V.pluginName);try{ie(V.requestPlugins,V.runOnEndCallbacks,V.scheduleOnDisposeCallbacks)}catch(he){Z(he,"")}},V=>Z(V,""));return}try{ie(null,(V,he)=>he([],[]),()=>{})}catch(V){Z(V,"")}function ie(V,he,W){const z=E.hasFS,{entries:S,flags:b,write:c,stdinContents:h,stdinResolveDir:w,absWorkingDir:D,nodePaths:M,mangleCache:g}=is(n,j,u,U,z);if(c&&!E.hasFS)throw new Error('The "write" option is unavailable in this environment');const k={command:"build",key:a,entries:S,flags:b,write:c,stdinContents:h,stdinResolveDir:w,absWorkingDir:D||T,nodePaths:M,context:re};V&&(k.plugins=V),g&&(k.mangleCache=g);const _=(C,P)=>{const K={errors:Xe(C.errors,$),warnings:Xe(C.warnings,$),outputFiles:void 0,metafile:void 0,mangleCache:void 0},me=K.errors.slice(),R=K.warnings.slice();C.outputFiles&&(K.outputFiles=C.outputFiles.map(ps)),C.metafile&&C.metafile.length&&(K.metafile=fs(C.metafile)),C.mangleCache&&(K.mangleCache=C.mangleCache),C.writeToStdout!==void 0&&console.log(fe(C.writeToStdout).replace(/\n$/,"")),he(K,(oe,se)=>{if(me.length>0||oe.length>0){const ne=it("Build failed",me.concat(oe),R.concat(se));return P(ne,null,oe,se)}P(null,K,oe,se)})};let o,m;re&&(y["on-end"]=(C,P)=>new Promise(K=>{_(P,(me,R,oe,se)=>{const ne={errors:oe,warnings:se};m&&m(me,R),o=void 0,m=void 0,f(C,ne),K()})})),l(x,k,(C,P)=>{if(C)return F(new Error(C),null);if(!re)return _(P,(R,oe)=>(W(),F(R,oe)));if(P.errors.length>0)return F(it("Context failed",P.errors,P.warnings),null);let K=!1;const me={rebuild:()=>(o||(o=new Promise((R,oe)=>{let se;m=(Te,be)=>{se||(se=()=>Te?oe(Te):R(be))};const ne=()=>{l(x,{command:"rebuild",key:a},(be,$e)=>{be?oe(new Error(be)):se?se():ne()})};ne()})),o),watch:(R={})=>new Promise((oe,se)=>{if(!E.hasFS)throw new Error('Cannot use the "watch" API in this environment');const ne={},Te=d(R,ne,"delay",He);ye(R,ne,"in watch() call");const be={command:"watch",key:a};Te&&(be.delay=Te),l(x,be,$e=>{$e?se(new Error($e)):oe(void 0)})}),serve:(R={})=>new Promise((oe,se)=>{if(!E.hasFS)throw new Error('Cannot use the "serve" API in this environment');const ne={},Te=d(R,ne,"port",es),be=d(R,ne,"host",N),$e=d(R,ne,"servedir",N),J=d(R,ne,"keyfile",N),Ue=d(R,ne,"certfile",N),Pe=d(R,ne,"fallback",N),_e=d(R,ne,"cors",je),Ne=d(R,ne,"onRequest",In);ye(R,ne,"in serve() call");const Ce={command:"serve",key:a,onRequest:!!Ne};if(Te!==void 0&&(Ce.port=Te),be!==void 0&&(Ce.host=be),$e!==void 0&&(Ce.servedir=$e),J!==void 0&&(Ce.keyfile=J),Ue!==void 0&&(Ce.certfile=Ue),Pe!==void 0&&(Ce.fallback=Pe),_e){const lt={},Qe=d(_e,lt,"origin",Pn);ye(_e,lt,'on "cors" object'),Array.isArray(Qe)?Ce.corsOrigin=Qe:Qe!==void 0&&(Ce.corsOrigin=[Qe])}l(x,Ce,(lt,Qe)=>{if(lt)return se(new Error(lt));Ne&&(y["serve-request"]=(js,Ps)=>{Ne(Ps.args),f(js,{})}),oe(Qe)})}),cancel:()=>new Promise(R=>{if(K)return R();l(x,{command:"cancel",key:a},()=>{R()})}),dispose:()=>new Promise(R=>{if(K)return R();K=!0,l(x,{command:"dispose",key:a},()=>{R(),W(),x.unref()})})};x.ref(),F(null,me)})}}var ds=(n,a,l,f,x,E,y,j,u)=>ce(null,null,function*(){let T=[],F=[],$={},re={},Z=[],ae=0,ie=0,V=[],he=!1;j=[...j];for(let S of j){let b={};if(typeof S!="object")throw new Error(`Plugin at index ${ie} must be an object`);const c=d(S,b,"name",N);if(typeof c!="string"||c==="")throw new Error(`Plugin at index ${ie} is missing a name`);try{let h=d(S,b,"setup",In);if(typeof h!="function")throw new Error("Plugin is missing a setup function");ye(S,b,`on plugin ${A(c)}`);let w={name:c,onStart:!1,onEnd:!1,onResolve:[],onLoad:[]};ie++;let M=h({initialOptions:y,resolve:(g,k={})=>{if(!he)throw new Error('Cannot call "resolve" before plugin setup has completed');if(typeof g!="string")throw new Error("The path to resolve must be a string");let _=Object.create(null),o=d(k,_,"pluginName",N),m=d(k,_,"importer",N),C=d(k,_,"namespace",N),P=d(k,_,"resolveDir",N),K=d(k,_,"kind",N),me=d(k,_,"pluginData",we),R=d(k,_,"with",je);return ye(k,_,"in resolve() call"),new Promise((oe,se)=>{const ne={command:"resolve",path:g,key:n,pluginName:c};if(o!=null&&(ne.pluginName=o),m!=null&&(ne.importer=m),C!=null&&(ne.namespace=C),P!=null&&(ne.resolveDir=P),K!=null)ne.kind=K;else throw new Error('Must specify "kind" when calling "resolve"');me!=null&&(ne.pluginData=u.store(me)),R!=null&&(ne.with=us(R,"with")),a(f,ne,(Te,be)=>{Te!==null?se(new Error(Te)):oe({errors:Xe(be.errors,u),warnings:Xe(be.warnings,u),path:be.path,external:be.external,sideEffects:be.sideEffects,namespace:be.namespace,suffix:be.suffix,pluginData:u.load(be.pluginData)})})})},onStart(g){let k='This error came from the "onStart" callback registered here:',_=bt(new Error(k),x,"onStart");T.push({name:c,callback:g,note:_}),w.onStart=!0},onEnd(g){let k='This error came from the "onEnd" callback registered here:',_=bt(new Error(k),x,"onEnd");F.push({name:c,callback:g,note:_}),w.onEnd=!0},onResolve(g,k){let _='This error came from the "onResolve" callback registered here:',o=bt(new Error(_),x,"onResolve"),m={},C=d(g,m,"filter",gt),P=d(g,m,"namespace",N);if(ye(g,m,`in onResolve() call for plugin ${A(c)}`),C==null)throw new Error("onResolve() call is missing a filter");let K=ae++;$[K]={name:c,callback:k,note:o},w.onResolve.push({id:K,filter:wt(C),namespace:P||""})},onLoad(g,k){let _='This error came from the "onLoad" callback registered here:',o=bt(new Error(_),x,"onLoad"),m={},C=d(g,m,"filter",gt),P=d(g,m,"namespace",N);if(ye(g,m,`in onLoad() call for plugin ${A(c)}`),C==null)throw new Error("onLoad() call is missing a filter");let K=ae++;re[K]={name:c,callback:k,note:o},w.onLoad.push({id:K,filter:wt(C),namespace:P||""})},onDispose(g){Z.push(g)},esbuild:x.esbuild});M&&(yield M),V.push(w)}catch(h){return{ok:!1,error:h,pluginName:c}}}E["on-start"]=(S,b)=>ce(null,null,function*(){u.clear();let c={errors:[],warnings:[]};yield Promise.all(T.map(h=>ce(null,[h],function*({name:w,callback:D,note:M}){try{let g=yield D();if(g!=null){if(typeof g!="object")throw new Error(`Expected onStart() callback in plugin ${A(w)} to return an object`);let k={},_=d(g,k,"errors",Me),o=d(g,k,"warnings",Me);ye(g,k,`from onStart() callback in plugin ${A(w)}`),_!=null&&c.errors.push(...Re(_,"errors",u,w,void 0)),o!=null&&c.warnings.push(...Re(o,"warnings",u,w,void 0))}}catch(g){c.errors.push(qe(g,x,u,M&&M(),w))}}))),l(S,c)}),E["on-resolve"]=(S,b)=>ce(null,null,function*(){let c={},h="",w,D;for(let M of b.ids)try{({name:h,callback:w,note:D}=$[M]);let g=yield w({path:b.path,importer:b.importer,namespace:b.namespace,resolveDir:b.resolveDir,kind:b.kind,pluginData:u.load(b.pluginData),with:b.with});if(g!=null){if(typeof g!="object")throw new Error(`Expected onResolve() callback in plugin ${A(h)} to return an object`);let k={},_=d(g,k,"pluginName",N),o=d(g,k,"path",N),m=d(g,k,"namespace",N),C=d(g,k,"suffix",N),P=d(g,k,"external",le),K=d(g,k,"sideEffects",le),me=d(g,k,"pluginData",we),R=d(g,k,"errors",Me),oe=d(g,k,"warnings",Me),se=d(g,k,"watchFiles",Se),ne=d(g,k,"watchDirs",Se);ye(g,k,`from onResolve() callback in plugin ${A(h)}`),c.id=M,_!=null&&(c.pluginName=_),o!=null&&(c.path=o),m!=null&&(c.namespace=m),C!=null&&(c.suffix=C),P!=null&&(c.external=P),K!=null&&(c.sideEffects=K),me!=null&&(c.pluginData=u.store(me)),R!=null&&(c.errors=Re(R,"errors",u,h,void 0)),oe!=null&&(c.warnings=Re(oe,"warnings",u,h,void 0)),se!=null&&(c.watchFiles=vt(se,"watchFiles")),ne!=null&&(c.watchDirs=vt(ne,"watchDirs"));break}}catch(g){c={id:M,errors:[qe(g,x,u,D&&D(),h)]};break}l(S,c)}),E["on-load"]=(S,b)=>ce(null,null,function*(){let c={},h="",w,D;for(let M of b.ids)try{({name:h,callback:w,note:D}=re[M]);let g=yield w({path:b.path,namespace:b.namespace,suffix:b.suffix,pluginData:u.load(b.pluginData),with:b.with});if(g!=null){if(typeof g!="object")throw new Error(`Expected onLoad() callback in plugin ${A(h)} to return an object`);let k={},_=d(g,k,"pluginName",N),o=d(g,k,"contents",Cn),m=d(g,k,"resolveDir",N),C=d(g,k,"pluginData",we),P=d(g,k,"loader",N),K=d(g,k,"errors",Me),me=d(g,k,"warnings",Me),R=d(g,k,"watchFiles",Se),oe=d(g,k,"watchDirs",Se);ye(g,k,`from onLoad() callback in plugin ${A(h)}`),c.id=M,_!=null&&(c.pluginName=_),o instanceof Uint8Array?c.contents=o:o!=null&&(c.contents=Y(o)),m!=null&&(c.resolveDir=m),C!=null&&(c.pluginData=u.store(C)),P!=null&&(c.loader=P),K!=null&&(c.errors=Re(K,"errors",u,h,void 0)),me!=null&&(c.warnings=Re(me,"warnings",u,h,void 0)),R!=null&&(c.watchFiles=vt(R,"watchFiles")),oe!=null&&(c.watchDirs=vt(oe,"watchDirs"));break}}catch(g){c={id:M,errors:[qe(g,x,u,D&&D(),h)]};break}l(S,c)});let W=(S,b)=>b([],[]);F.length>0&&(W=(S,b)=>{ce(null,null,function*(){const c=[],h=[];for(const{name:w,callback:D,note:M}of F){let g,k;try{const _=yield D(S);if(_!=null){if(typeof _!="object")throw new Error(`Expected onEnd() callback in plugin ${A(w)} to return an object`);let o={},m=d(_,o,"errors",Me),C=d(_,o,"warnings",Me);ye(_,o,`from onEnd() callback in plugin ${A(w)}`),m!=null&&(g=Re(m,"errors",u,w,void 0)),C!=null&&(k=Re(C,"warnings",u,w,void 0))}}catch(_){g=[qe(_,x,u,M&&M(),w)]}if(g){c.push(...g);try{S.errors.push(...g)}catch{}}if(k){h.push(...k);try{S.warnings.push(...k)}catch{}}}b(c,h)})});let z=()=>{for(const S of Z)setTimeout(()=>S(),0)};return he=!0,{ok:!0,requestPlugins:V,runOnEndCallbacks:W,scheduleOnDisposeCallbacks:z}});function _n(){const n=new Map;let a=0;return{clear(){n.clear()},load(l){return n.get(l)},store(l){if(l===void 0)return-1;const f=a++;return n.set(f,l),f}}}function bt(n,a,l){let f,x=!1;return()=>{if(x)return f;x=!0;try{let E=(n.stack+"").split(`
`);E.splice(1,1);let y=Ln(a,E,l);if(y)return f={text:n.message,location:y},f}catch{}}}function qe(n,a,l,f,x){let E="Internal error",y=null;try{E=(n&&n.message||n)+""}catch{}try{y=Ln(a,(n.stack+"").split(`
`),"")}catch{}return{id:"",pluginName:x,text:E,location:y,notes:f?[f]:[],detail:l?l.store(n):-1}}function Ln(n,a,l){let f="    at ";if(n.readFileSync&&!a[0].startsWith(f)&&a[1].startsWith(f))for(let x=1;x<a.length;x++){let E=a[x];if(E.startsWith(f))for(E=E.slice(f.length);;){let y=/^(?:new |async )?\S+ \((.*)\)$/.exec(E);if(y){E=y[1];continue}if(y=/^eval at \S+ \((.*)\)(?:, \S+:\d+:\d+)?$/.exec(E),y){E=y[1];continue}if(y=/^(\S+):(\d+):(\d+)$/.exec(E),y){let j;try{j=n.readFileSync(y[1],"utf8")}catch{break}let u=j.split(/\r\n|\r|\n|\u2028|\u2029/)[+y[2]-1]||"",T=+y[3]-1,F=u.slice(T,T+l.length)===l?l.length:0;return{file:y[1],namespace:"file",line:+y[2],column:Y(u.slice(0,T)).length,length:Y(u.slice(T,T+F)).length,lineText:u+`
`+a.slice(1).join(`
`),suggestion:""}}break}}return null}function it(n,a,l){let f=5;n+=a.length<1?"":` with ${a.length} error${a.length<2?"":"s"}:`+a.slice(0,f+1).map((E,y)=>{if(y===f)return`
...`;if(!E.location)return`
error: ${E.text}`;let{file:j,line:u,column:T}=E.location,F=E.pluginName?`[plugin: ${E.pluginName}] `:"";return`
${j}:${u}:${T}: ERROR: ${F}${E.text}`}).join("");let x=new Error(n);for(const[E,y]of[["errors",a],["warnings",l]])Object.defineProperty(x,E,{configurable:!0,enumerable:!0,get:()=>y,set:j=>Object.defineProperty(x,E,{configurable:!0,enumerable:!0,value:j})});return x}function Xe(n,a){for(const l of n)l.detail=a.load(l.detail);return n}function On(n,a,l){if(n==null)return null;let f={},x=d(n,f,"file",N),E=d(n,f,"namespace",N),y=d(n,f,"line",He),j=d(n,f,"column",He),u=d(n,f,"length",He),T=d(n,f,"lineText",N),F=d(n,f,"suggestion",N);if(ye(n,f,a),T){const $=T.slice(0,(j&&j>0?j:0)+(u&&u>0?u:0)+(l&&l>0?l:80));!/[\x7F-\uFFFF]/.test($)&&!/\n/.test(T)&&(T=$)}return{file:x||"",namespace:E||"",line:y||0,column:j||0,length:u||0,lineText:T||"",suggestion:F||""}}function Re(n,a,l,f,x){let E=[],y=0;for(const j of n){let u={},T=d(j,u,"id",N),F=d(j,u,"pluginName",N),$=d(j,u,"text",N),re=d(j,u,"location",Tn),Z=d(j,u,"notes",Me),ae=d(j,u,"detail",we),ie=`in element ${y} of "${a}"`;ye(j,u,ie);let V=[];if(Z)for(const he of Z){let W={},z=d(he,W,"text",N),S=d(he,W,"location",Tn);ye(he,W,ie),V.push({text:z||"",location:On(S,ie,x)})}E.push({id:T||"",pluginName:F||f,text:$||"",location:On(re,ie,x),notes:V,detail:l?l.store(ae):-1}),y++}return E}function vt(n,a){const l=[];for(const f of n){if(typeof f!="string")throw new Error(`${A(a)} must be an array of strings`);l.push(f)}return l}function us(n,a){const l=Object.create(null);for(const f in n){const x=n[f];if(typeof x!="string")throw new Error(`key ${A(f)} in object ${A(a)} must be a string`);l[f]=x}return l}function ps({path:n,contents:a,hash:l}){let f=null;return{path:n,contents:a,hash:l,get text(){const x=this.contents;return(f===null||x!==a)&&(a=x,f=fe(x)),f}}}function wt(n){let a=n.source;return n.flags&&(a=`(?${n.flags})${a}`),a}function fs(n){let a;try{a=fe(n)}catch{return I(n)}return JSON.parse(a)}var ms="0.27.7",hs=n=>ot().build(n),gs=n=>ot().context(n),ys=(n,a)=>ot().transform(n,a),bs=(n,a)=>ot().formatMessages(n,a),vs=(n,a)=>ot().analyzeMetafile(n,a),ws=()=>{throw new Error('The "buildSync" API only works in node')},xs=()=>{throw new Error('The "transformSync" API only works in node')},Es=()=>{throw new Error('The "formatMessagesSync" API only works in node')},ks=()=>{throw new Error('The "analyzeMetafileSync" API only works in node')},As=()=>(xt&&xt(),Promise.resolve()),Je,xt,Et,ot=()=>{if(Et)return Et;throw Je?new Error('You need to wait for the promise returned from "initialize" to be resolved before calling this'):new Error('You need to call "initialize" before calling this')},Ss=n=>{n=as(n||{});let a=n.wasmURL,l=n.wasmModule,f=n.worker!==!1;if(!a&&!l)throw new Error('Must provide either the "wasmURL" option or the "wasmModule" option');if(Je)throw new Error('Cannot call "initialize" more than once');return Je=Is(a||"",l,f),Je.catch(()=>{Je=void 0}),Je},Is=(n,a,l)=>ce(null,null,function*(){let f,x;const E=new Promise($=>x=$);if(l){let $=new Blob([`onmessage=((postMessage) => {
      // Copyright 2018 The Go Authors. All rights reserved.
      // Use of this source code is governed by a BSD-style
      // license that can be found in the LICENSE file.
      var __async = (__this, __arguments, generator) => {
        return new Promise((resolve, reject) => {
          var fulfilled = (value) => {
            try {
              step(generator.next(value));
            } catch (e) {
              reject(e);
            }
          };
          var rejected = (value) => {
            try {
              step(generator.throw(value));
            } catch (e) {
              reject(e);
            }
          };
          var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
          step((generator = generator.apply(__this, __arguments)).next());
        });
      };
      let onmessage;
      let globalThis = {};
      for (let o = self; o; o = Object.getPrototypeOf(o))
        for (let k of Object.getOwnPropertyNames(o))
          if (!(k in globalThis))
            Object.defineProperty(globalThis, k, { get: () => self[k] });
      "use strict";
      (() => {
        const enosys = () => {
          const err = new Error("not implemented");
          err.code = "ENOSYS";
          return err;
        };
        if (!globalThis.fs) {
          let outputBuf = "";
          globalThis.fs = {
            constants: { O_WRONLY: -1, O_RDWR: -1, O_CREAT: -1, O_TRUNC: -1, O_APPEND: -1, O_EXCL: -1, O_DIRECTORY: -1 },
            // unused
            writeSync(fd, buf) {
              outputBuf += decoder.decode(buf);
              const nl = outputBuf.lastIndexOf("\\n");
              if (nl != -1) {
                console.log(outputBuf.substring(0, nl));
                outputBuf = outputBuf.substring(nl + 1);
              }
              return buf.length;
            },
            write(fd, buf, offset, length, position, callback) {
              if (offset !== 0 || length !== buf.length || position !== null) {
                callback(enosys());
                return;
              }
              const n = this.writeSync(fd, buf);
              callback(null, n);
            },
            chmod(path, mode, callback) {
              callback(enosys());
            },
            chown(path, uid, gid, callback) {
              callback(enosys());
            },
            close(fd, callback) {
              callback(enosys());
            },
            fchmod(fd, mode, callback) {
              callback(enosys());
            },
            fchown(fd, uid, gid, callback) {
              callback(enosys());
            },
            fstat(fd, callback) {
              callback(enosys());
            },
            fsync(fd, callback) {
              callback(null);
            },
            ftruncate(fd, length, callback) {
              callback(enosys());
            },
            lchown(path, uid, gid, callback) {
              callback(enosys());
            },
            link(path, link, callback) {
              callback(enosys());
            },
            lstat(path, callback) {
              callback(enosys());
            },
            mkdir(path, perm, callback) {
              callback(enosys());
            },
            open(path, flags, mode, callback) {
              callback(enosys());
            },
            read(fd, buffer, offset, length, position, callback) {
              callback(enosys());
            },
            readdir(path, callback) {
              callback(enosys());
            },
            readlink(path, callback) {
              callback(enosys());
            },
            rename(from, to, callback) {
              callback(enosys());
            },
            rmdir(path, callback) {
              callback(enosys());
            },
            stat(path, callback) {
              callback(enosys());
            },
            symlink(path, link, callback) {
              callback(enosys());
            },
            truncate(path, length, callback) {
              callback(enosys());
            },
            unlink(path, callback) {
              callback(enosys());
            },
            utimes(path, atime, mtime, callback) {
              callback(enosys());
            }
          };
        }
        if (!globalThis.process) {
          globalThis.process = {
            getuid() {
              return -1;
            },
            getgid() {
              return -1;
            },
            geteuid() {
              return -1;
            },
            getegid() {
              return -1;
            },
            getgroups() {
              throw enosys();
            },
            pid: -1,
            ppid: -1,
            umask() {
              throw enosys();
            },
            cwd() {
              throw enosys();
            },
            chdir() {
              throw enosys();
            }
          };
        }
        if (!globalThis.path) {
          globalThis.path = {
            resolve(...pathSegments) {
              return pathSegments.join("/");
            }
          };
        }
        if (!globalThis.crypto) {
          throw new Error("globalThis.crypto is not available, polyfill required (crypto.getRandomValues only)");
        }
        if (!globalThis.performance) {
          throw new Error("globalThis.performance is not available, polyfill required (performance.now only)");
        }
        if (!globalThis.TextEncoder) {
          throw new Error("globalThis.TextEncoder is not available, polyfill required");
        }
        if (!globalThis.TextDecoder) {
          throw new Error("globalThis.TextDecoder is not available, polyfill required");
        }
        const encoder = new TextEncoder("utf-8");
        const decoder = new TextDecoder("utf-8");
        globalThis.Go = class {
          constructor() {
            this.argv = ["js"];
            this.env = {};
            this.exit = (code) => {
              if (code !== 0) {
                console.warn("exit code:", code);
              }
            };
            this._exitPromise = new Promise((resolve) => {
              this._resolveExitPromise = resolve;
            });
            this._pendingEvent = null;
            this._scheduledTimeouts = /* @__PURE__ */ new Map();
            this._nextCallbackTimeoutID = 1;
            const setInt64 = (addr, v) => {
              this.mem.setUint32(addr + 0, v, true);
              this.mem.setUint32(addr + 4, Math.floor(v / 4294967296), true);
            };
            const setInt32 = (addr, v) => {
              this.mem.setUint32(addr + 0, v, true);
            };
            const getInt64 = (addr) => {
              const low = this.mem.getUint32(addr + 0, true);
              const high = this.mem.getInt32(addr + 4, true);
              return low + high * 4294967296;
            };
            const loadValue = (addr) => {
              const f = this.mem.getFloat64(addr, true);
              if (f === 0) {
                return void 0;
              }
              if (!isNaN(f)) {
                return f;
              }
              const id = this.mem.getUint32(addr, true);
              return this._values[id];
            };
            const storeValue = (addr, v) => {
              const nanHead = 2146959360;
              if (typeof v === "number" && v !== 0) {
                if (isNaN(v)) {
                  this.mem.setUint32(addr + 4, nanHead, true);
                  this.mem.setUint32(addr, 0, true);
                  return;
                }
                this.mem.setFloat64(addr, v, true);
                return;
              }
              if (v === void 0) {
                this.mem.setFloat64(addr, 0, true);
                return;
              }
              let id = this._ids.get(v);
              if (id === void 0) {
                id = this._idPool.pop();
                if (id === void 0) {
                  id = this._values.length;
                }
                this._values[id] = v;
                this._goRefCounts[id] = 0;
                this._ids.set(v, id);
              }
              this._goRefCounts[id]++;
              let typeFlag = 0;
              switch (typeof v) {
                case "object":
                  if (v !== null) {
                    typeFlag = 1;
                  }
                  break;
                case "string":
                  typeFlag = 2;
                  break;
                case "symbol":
                  typeFlag = 3;
                  break;
                case "function":
                  typeFlag = 4;
                  break;
              }
              this.mem.setUint32(addr + 4, nanHead | typeFlag, true);
              this.mem.setUint32(addr, id, true);
            };
            const loadSlice = (addr) => {
              const array = getInt64(addr + 0);
              const len = getInt64(addr + 8);
              return new Uint8Array(this._inst.exports.mem.buffer, array, len);
            };
            const loadSliceOfValues = (addr) => {
              const array = getInt64(addr + 0);
              const len = getInt64(addr + 8);
              const a = new Array(len);
              for (let i = 0; i < len; i++) {
                a[i] = loadValue(array + i * 8);
              }
              return a;
            };
            const loadString = (addr) => {
              const saddr = getInt64(addr + 0);
              const len = getInt64(addr + 8);
              return decoder.decode(new DataView(this._inst.exports.mem.buffer, saddr, len));
            };
            const testCallExport = (a, b) => {
              this._inst.exports.testExport0();
              return this._inst.exports.testExport(a, b);
            };
            const timeOrigin = Date.now() - performance.now();
            this.importObject = {
              _gotest: {
                add: (a, b) => a + b,
                callExport: testCallExport
              },
              gojs: {
                // Go's SP does not change as long as no Go code is running. Some operations (e.g. calls, getters and setters)
                // may synchronously trigger a Go event handler. This makes Go code get executed in the middle of the imported
                // function. A goroutine can switch to a new stack if the current stack is too small (see morestack function).
                // This changes the SP, thus we have to update the SP used by the imported function.
                // func wasmExit(code int32)
                "runtime.wasmExit": (sp) => {
                  sp >>>= 0;
                  const code = this.mem.getInt32(sp + 8, true);
                  this.exited = true;
                  delete this._inst;
                  delete this._values;
                  delete this._goRefCounts;
                  delete this._ids;
                  delete this._idPool;
                  this.exit(code);
                },
                // func wasmWrite(fd uintptr, p unsafe.Pointer, n int32)
                "runtime.wasmWrite": (sp) => {
                  sp >>>= 0;
                  const fd = getInt64(sp + 8);
                  const p = getInt64(sp + 16);
                  const n = this.mem.getInt32(sp + 24, true);
                  globalThis.fs.writeSync(fd, new Uint8Array(this._inst.exports.mem.buffer, p, n));
                },
                // func resetMemoryDataView()
                "runtime.resetMemoryDataView": (sp) => {
                  sp >>>= 0;
                  this.mem = new DataView(this._inst.exports.mem.buffer);
                },
                // func nanotime1() int64
                "runtime.nanotime1": (sp) => {
                  sp >>>= 0;
                  setInt64(sp + 8, (timeOrigin + performance.now()) * 1e6);
                },
                // func walltime() (sec int64, nsec int32)
                "runtime.walltime": (sp) => {
                  sp >>>= 0;
                  const msec = (/* @__PURE__ */ new Date()).getTime();
                  setInt64(sp + 8, msec / 1e3);
                  this.mem.setInt32(sp + 16, msec % 1e3 * 1e6, true);
                },
                // func scheduleTimeoutEvent(delay int64) int32
                "runtime.scheduleTimeoutEvent": (sp) => {
                  sp >>>= 0;
                  const id = this._nextCallbackTimeoutID;
                  this._nextCallbackTimeoutID++;
                  this._scheduledTimeouts.set(id, setTimeout(
                    () => {
                      this._resume();
                      while (this._scheduledTimeouts.has(id)) {
                        console.warn("scheduleTimeoutEvent: missed timeout event");
                        this._resume();
                      }
                    },
                    getInt64(sp + 8)
                  ));
                  this.mem.setInt32(sp + 16, id, true);
                },
                // func clearTimeoutEvent(id int32)
                "runtime.clearTimeoutEvent": (sp) => {
                  sp >>>= 0;
                  const id = this.mem.getInt32(sp + 8, true);
                  clearTimeout(this._scheduledTimeouts.get(id));
                  this._scheduledTimeouts.delete(id);
                },
                // func getRandomData(r []byte)
                "runtime.getRandomData": (sp) => {
                  sp >>>= 0;
                  crypto.getRandomValues(loadSlice(sp + 8));
                },
                // func finalizeRef(v ref)
                "syscall/js.finalizeRef": (sp) => {
                  sp >>>= 0;
                  const id = this.mem.getUint32(sp + 8, true);
                  this._goRefCounts[id]--;
                  if (this._goRefCounts[id] === 0) {
                    const v = this._values[id];
                    this._values[id] = null;
                    this._ids.delete(v);
                    this._idPool.push(id);
                  }
                },
                // func stringVal(value string) ref
                "syscall/js.stringVal": (sp) => {
                  sp >>>= 0;
                  storeValue(sp + 24, loadString(sp + 8));
                },
                // func valueGet(v ref, p string) ref
                "syscall/js.valueGet": (sp) => {
                  sp >>>= 0;
                  const result = Reflect.get(loadValue(sp + 8), loadString(sp + 16));
                  sp = this._inst.exports.getsp() >>> 0;
                  storeValue(sp + 32, result);
                },
                // func valueSet(v ref, p string, x ref)
                "syscall/js.valueSet": (sp) => {
                  sp >>>= 0;
                  Reflect.set(loadValue(sp + 8), loadString(sp + 16), loadValue(sp + 32));
                },
                // func valueDelete(v ref, p string)
                "syscall/js.valueDelete": (sp) => {
                  sp >>>= 0;
                  Reflect.deleteProperty(loadValue(sp + 8), loadString(sp + 16));
                },
                // func valueIndex(v ref, i int) ref
                "syscall/js.valueIndex": (sp) => {
                  sp >>>= 0;
                  storeValue(sp + 24, Reflect.get(loadValue(sp + 8), getInt64(sp + 16)));
                },
                // valueSetIndex(v ref, i int, x ref)
                "syscall/js.valueSetIndex": (sp) => {
                  sp >>>= 0;
                  Reflect.set(loadValue(sp + 8), getInt64(sp + 16), loadValue(sp + 24));
                },
                // func valueCall(v ref, m string, args []ref) (ref, bool)
                "syscall/js.valueCall": (sp) => {
                  sp >>>= 0;
                  try {
                    const v = loadValue(sp + 8);
                    const m = Reflect.get(v, loadString(sp + 16));
                    const args = loadSliceOfValues(sp + 32);
                    const result = Reflect.apply(m, v, args);
                    sp = this._inst.exports.getsp() >>> 0;
                    storeValue(sp + 56, result);
                    this.mem.setUint8(sp + 64, 1);
                  } catch (err) {
                    sp = this._inst.exports.getsp() >>> 0;
                    storeValue(sp + 56, err);
                    this.mem.setUint8(sp + 64, 0);
                  }
                },
                // func valueInvoke(v ref, args []ref) (ref, bool)
                "syscall/js.valueInvoke": (sp) => {
                  sp >>>= 0;
                  try {
                    const v = loadValue(sp + 8);
                    const args = loadSliceOfValues(sp + 16);
                    const result = Reflect.apply(v, void 0, args);
                    sp = this._inst.exports.getsp() >>> 0;
                    storeValue(sp + 40, result);
                    this.mem.setUint8(sp + 48, 1);
                  } catch (err) {
                    sp = this._inst.exports.getsp() >>> 0;
                    storeValue(sp + 40, err);
                    this.mem.setUint8(sp + 48, 0);
                  }
                },
                // func valueNew(v ref, args []ref) (ref, bool)
                "syscall/js.valueNew": (sp) => {
                  sp >>>= 0;
                  try {
                    const v = loadValue(sp + 8);
                    const args = loadSliceOfValues(sp + 16);
                    const result = Reflect.construct(v, args);
                    sp = this._inst.exports.getsp() >>> 0;
                    storeValue(sp + 40, result);
                    this.mem.setUint8(sp + 48, 1);
                  } catch (err) {
                    sp = this._inst.exports.getsp() >>> 0;
                    storeValue(sp + 40, err);
                    this.mem.setUint8(sp + 48, 0);
                  }
                },
                // func valueLength(v ref) int
                "syscall/js.valueLength": (sp) => {
                  sp >>>= 0;
                  setInt64(sp + 16, parseInt(loadValue(sp + 8).length));
                },
                // valuePrepareString(v ref) (ref, int)
                "syscall/js.valuePrepareString": (sp) => {
                  sp >>>= 0;
                  const str = encoder.encode(String(loadValue(sp + 8)));
                  storeValue(sp + 16, str);
                  setInt64(sp + 24, str.length);
                },
                // valueLoadString(v ref, b []byte)
                "syscall/js.valueLoadString": (sp) => {
                  sp >>>= 0;
                  const str = loadValue(sp + 8);
                  loadSlice(sp + 16).set(str);
                },
                // func valueInstanceOf(v ref, t ref) bool
                "syscall/js.valueInstanceOf": (sp) => {
                  sp >>>= 0;
                  this.mem.setUint8(sp + 24, loadValue(sp + 8) instanceof loadValue(sp + 16) ? 1 : 0);
                },
                // func copyBytesToGo(dst []byte, src ref) (int, bool)
                "syscall/js.copyBytesToGo": (sp) => {
                  sp >>>= 0;
                  const dst = loadSlice(sp + 8);
                  const src = loadValue(sp + 32);
                  if (!(src instanceof Uint8Array || src instanceof Uint8ClampedArray)) {
                    this.mem.setUint8(sp + 48, 0);
                    return;
                  }
                  const toCopy = src.subarray(0, dst.length);
                  dst.set(toCopy);
                  setInt64(sp + 40, toCopy.length);
                  this.mem.setUint8(sp + 48, 1);
                },
                // func copyBytesToJS(dst ref, src []byte) (int, bool)
                "syscall/js.copyBytesToJS": (sp) => {
                  sp >>>= 0;
                  const dst = loadValue(sp + 8);
                  const src = loadSlice(sp + 16);
                  if (!(dst instanceof Uint8Array || dst instanceof Uint8ClampedArray)) {
                    this.mem.setUint8(sp + 48, 0);
                    return;
                  }
                  const toCopy = src.subarray(0, dst.length);
                  dst.set(toCopy);
                  setInt64(sp + 40, toCopy.length);
                  this.mem.setUint8(sp + 48, 1);
                },
                "debug": (value) => {
                  console.log(value);
                }
              }
            };
          }
          run(instance) {
            return __async(this, null, function* () {
              if (!(instance instanceof WebAssembly.Instance)) {
                throw new Error("Go.run: WebAssembly.Instance expected");
              }
              this._inst = instance;
              this.mem = new DataView(this._inst.exports.mem.buffer);
              this._values = [
                // JS values that Go currently has references to, indexed by reference id
                NaN,
                0,
                null,
                true,
                false,
                globalThis,
                this
              ];
              this._goRefCounts = new Array(this._values.length).fill(Infinity);
              this._ids = /* @__PURE__ */ new Map([
                // mapping from JS values to reference ids
                [0, 1],
                [null, 2],
                [true, 3],
                [false, 4],
                [globalThis, 5],
                [this, 6]
              ]);
              this._idPool = [];
              this.exited = false;
              let offset = 4096;
              const strPtr = (str) => {
                const ptr = offset;
                const bytes = encoder.encode(str + "\\0");
                new Uint8Array(this.mem.buffer, offset, bytes.length).set(bytes);
                offset += bytes.length;
                if (offset % 8 !== 0) {
                  offset += 8 - offset % 8;
                }
                return ptr;
              };
              const argc = this.argv.length;
              const argvPtrs = [];
              this.argv.forEach((arg) => {
                argvPtrs.push(strPtr(arg));
              });
              argvPtrs.push(0);
              const keys = Object.keys(this.env).sort();
              keys.forEach((key) => {
                argvPtrs.push(strPtr(\`\${key}=\${this.env[key]}\`));
              });
              argvPtrs.push(0);
              const argv = offset;
              argvPtrs.forEach((ptr) => {
                this.mem.setUint32(offset, ptr, true);
                this.mem.setUint32(offset + 4, 0, true);
                offset += 8;
              });
              const wasmMinDataAddr = 4096 + 8192;
              if (offset >= wasmMinDataAddr) {
                throw new Error("total length of command line and environment variables exceeds limit");
              }
              this._inst.exports.run(argc, argv);
              if (this.exited) {
                this._resolveExitPromise();
              }
              yield this._exitPromise;
            });
          }
          _resume() {
            if (this.exited) {
              throw new Error("Go program has already exited");
            }
            this._inst.exports.resume();
            if (this.exited) {
              this._resolveExitPromise();
            }
          }
          _makeFuncWrapper(id) {
            const go = this;
            return function() {
              const event = { id, this: this, args: arguments };
              go._pendingEvent = event;
              go._resume();
              return event.result;
            };
          }
        };
      })();
      onmessage = ({ data: wasm }) => {
        let decoder = new TextDecoder();
        let fs = globalThis.fs;
        let stderr = "";
        fs.writeSync = (fd, buffer) => {
          if (fd === 1) {
            postMessage(buffer);
          } else if (fd === 2) {
            stderr += decoder.decode(buffer);
            let parts = stderr.split("\\n");
            if (parts.length > 1) console.log(parts.slice(0, -1).join("\\n"));
            stderr = parts[parts.length - 1];
          } else {
            throw new Error("Bad write");
          }
          return buffer.length;
        };
        let stdin = [];
        let resumeStdin;
        let stdinPos = 0;
        onmessage = ({ data }) => {
          if (data.length > 0) {
            stdin.push(data);
            if (resumeStdin) resumeStdin();
          }
          return go;
        };
        fs.read = (fd, buffer, offset, length, position, callback) => {
          if (fd !== 0 || offset !== 0 || length !== buffer.length || position !== null) {
            throw new Error("Bad read");
          }
          if (stdin.length === 0) {
            resumeStdin = () => fs.read(fd, buffer, offset, length, position, callback);
            return;
          }
          let first = stdin[0];
          let count = Math.max(0, Math.min(length, first.length - stdinPos));
          buffer.set(first.subarray(stdinPos, stdinPos + count), offset);
          stdinPos += count;
          if (stdinPos === first.length) {
            stdin.shift();
            stdinPos = 0;
          }
          callback(null, count);
        };
        let go = new globalThis.Go();
        go.argv = ["", \`--service=\${"0.27.7"}\`];
        tryToInstantiateModule(wasm, go).then(
          (instance) => {
            postMessage(null);
            go.run(instance);
          },
          (error) => {
            postMessage(error);
          }
        );
        return go;
      };
      function tryToInstantiateModule(wasm, go) {
        return __async(this, null, function* () {
          if (wasm instanceof WebAssembly.Module) {
            return WebAssembly.instantiate(wasm, go.importObject);
          }
          const res = yield fetch(wasm);
          if (!res.ok) throw new Error(\`Failed to download \${JSON.stringify(wasm)}\`);
          if ("instantiateStreaming" in WebAssembly && /^application\\/wasm($|;)/i.test(res.headers.get("Content-Type") || "")) {
            const result2 = yield WebAssembly.instantiateStreaming(res, go.importObject);
            return result2.instance;
          }
          const bytes = yield res.arrayBuffer();
          const result = yield WebAssembly.instantiate(bytes, go.importObject);
          return result.instance;
        });
      }
      return (m) => onmessage(m);
    })(postMessage)`],{type:"text/javascript"});f=new Worker(URL.createObjectURL($))}else{let $=(Z=>{var ae=(W,z,S)=>new Promise((b,c)=>{var h=M=>{try{D(S.next(M))}catch(g){c(g)}},w=M=>{try{D(S.throw(M))}catch(g){c(g)}},D=M=>M.done?b(M.value):Promise.resolve(M.value).then(h,w);D((S=S.apply(W,z)).next())});let ie,V={};for(let W=self;W;W=Object.getPrototypeOf(W))for(let z of Object.getOwnPropertyNames(W))z in V||Object.defineProperty(V,z,{get:()=>self[z]});(()=>{const W=()=>{const b=new Error("not implemented");return b.code="ENOSYS",b};if(!V.fs){let b="";V.fs={constants:{O_WRONLY:-1,O_RDWR:-1,O_CREAT:-1,O_TRUNC:-1,O_APPEND:-1,O_EXCL:-1,O_DIRECTORY:-1},writeSync(c,h){b+=S.decode(h);const w=b.lastIndexOf(`
`);return w!=-1&&(console.log(b.substring(0,w)),b=b.substring(w+1)),h.length},write(c,h,w,D,M,g){if(w!==0||D!==h.length||M!==null){g(W());return}const k=this.writeSync(c,h);g(null,k)},chmod(c,h,w){w(W())},chown(c,h,w,D){D(W())},close(c,h){h(W())},fchmod(c,h,w){w(W())},fchown(c,h,w,D){D(W())},fstat(c,h){h(W())},fsync(c,h){h(null)},ftruncate(c,h,w){w(W())},lchown(c,h,w,D){D(W())},link(c,h,w){w(W())},lstat(c,h){h(W())},mkdir(c,h,w){w(W())},open(c,h,w,D){D(W())},read(c,h,w,D,M,g){g(W())},readdir(c,h){h(W())},readlink(c,h){h(W())},rename(c,h,w){w(W())},rmdir(c,h){h(W())},stat(c,h){h(W())},symlink(c,h,w){w(W())},truncate(c,h,w){w(W())},unlink(c,h){h(W())},utimes(c,h,w,D){D(W())}}}if(V.process||(V.process={getuid(){return-1},getgid(){return-1},geteuid(){return-1},getegid(){return-1},getgroups(){throw W()},pid:-1,ppid:-1,umask(){throw W()},cwd(){throw W()},chdir(){throw W()}}),V.path||(V.path={resolve(...b){return b.join("/")}}),!V.crypto)throw new Error("globalThis.crypto is not available, polyfill required (crypto.getRandomValues only)");if(!V.performance)throw new Error("globalThis.performance is not available, polyfill required (performance.now only)");if(!V.TextEncoder)throw new Error("globalThis.TextEncoder is not available, polyfill required");if(!V.TextDecoder)throw new Error("globalThis.TextDecoder is not available, polyfill required");const z=new TextEncoder("utf-8"),S=new TextDecoder("utf-8");V.Go=class{constructor(){this.argv=["js"],this.env={},this.exit=o=>{o!==0&&console.warn("exit code:",o)},this._exitPromise=new Promise(o=>{this._resolveExitPromise=o}),this._pendingEvent=null,this._scheduledTimeouts=new Map,this._nextCallbackTimeoutID=1;const b=(o,m)=>{this.mem.setUint32(o+0,m,!0),this.mem.setUint32(o+4,Math.floor(m/4294967296),!0)},c=o=>{const m=this.mem.getUint32(o+0,!0),C=this.mem.getInt32(o+4,!0);return m+C*4294967296},h=o=>{const m=this.mem.getFloat64(o,!0);if(m===0)return;if(!isNaN(m))return m;const C=this.mem.getUint32(o,!0);return this._values[C]},w=(o,m)=>{if(typeof m=="number"&&m!==0){if(isNaN(m)){this.mem.setUint32(o+4,2146959360,!0),this.mem.setUint32(o,0,!0);return}this.mem.setFloat64(o,m,!0);return}if(m===void 0){this.mem.setFloat64(o,0,!0);return}let P=this._ids.get(m);P===void 0&&(P=this._idPool.pop(),P===void 0&&(P=this._values.length),this._values[P]=m,this._goRefCounts[P]=0,this._ids.set(m,P)),this._goRefCounts[P]++;let K=0;switch(typeof m){case"object":m!==null&&(K=1);break;case"string":K=2;break;case"symbol":K=3;break;case"function":K=4;break}this.mem.setUint32(o+4,2146959360|K,!0),this.mem.setUint32(o,P,!0)},D=o=>{const m=c(o+0),C=c(o+8);return new Uint8Array(this._inst.exports.mem.buffer,m,C)},M=o=>{const m=c(o+0),C=c(o+8),P=new Array(C);for(let K=0;K<C;K++)P[K]=h(m+K*8);return P},g=o=>{const m=c(o+0),C=c(o+8);return S.decode(new DataView(this._inst.exports.mem.buffer,m,C))},k=(o,m)=>(this._inst.exports.testExport0(),this._inst.exports.testExport(o,m)),_=Date.now()-performance.now();this.importObject={_gotest:{add:(o,m)=>o+m,callExport:k},gojs:{"runtime.wasmExit":o=>{o>>>=0;const m=this.mem.getInt32(o+8,!0);this.exited=!0,delete this._inst,delete this._values,delete this._goRefCounts,delete this._ids,delete this._idPool,this.exit(m)},"runtime.wasmWrite":o=>{o>>>=0;const m=c(o+8),C=c(o+16),P=this.mem.getInt32(o+24,!0);V.fs.writeSync(m,new Uint8Array(this._inst.exports.mem.buffer,C,P))},"runtime.resetMemoryDataView":o=>{this.mem=new DataView(this._inst.exports.mem.buffer)},"runtime.nanotime1":o=>{o>>>=0,b(o+8,(_+performance.now())*1e6)},"runtime.walltime":o=>{o>>>=0;const m=new Date().getTime();b(o+8,m/1e3),this.mem.setInt32(o+16,m%1e3*1e6,!0)},"runtime.scheduleTimeoutEvent":o=>{o>>>=0;const m=this._nextCallbackTimeoutID;this._nextCallbackTimeoutID++,this._scheduledTimeouts.set(m,setTimeout(()=>{for(this._resume();this._scheduledTimeouts.has(m);)console.warn("scheduleTimeoutEvent: missed timeout event"),this._resume()},c(o+8))),this.mem.setInt32(o+16,m,!0)},"runtime.clearTimeoutEvent":o=>{o>>>=0;const m=this.mem.getInt32(o+8,!0);clearTimeout(this._scheduledTimeouts.get(m)),this._scheduledTimeouts.delete(m)},"runtime.getRandomData":o=>{o>>>=0,crypto.getRandomValues(D(o+8))},"syscall/js.finalizeRef":o=>{o>>>=0;const m=this.mem.getUint32(o+8,!0);if(this._goRefCounts[m]--,this._goRefCounts[m]===0){const C=this._values[m];this._values[m]=null,this._ids.delete(C),this._idPool.push(m)}},"syscall/js.stringVal":o=>{o>>>=0,w(o+24,g(o+8))},"syscall/js.valueGet":o=>{o>>>=0;const m=Reflect.get(h(o+8),g(o+16));o=this._inst.exports.getsp()>>>0,w(o+32,m)},"syscall/js.valueSet":o=>{o>>>=0,Reflect.set(h(o+8),g(o+16),h(o+32))},"syscall/js.valueDelete":o=>{o>>>=0,Reflect.deleteProperty(h(o+8),g(o+16))},"syscall/js.valueIndex":o=>{o>>>=0,w(o+24,Reflect.get(h(o+8),c(o+16)))},"syscall/js.valueSetIndex":o=>{o>>>=0,Reflect.set(h(o+8),c(o+16),h(o+24))},"syscall/js.valueCall":o=>{o>>>=0;try{const m=h(o+8),C=Reflect.get(m,g(o+16)),P=M(o+32),K=Reflect.apply(C,m,P);o=this._inst.exports.getsp()>>>0,w(o+56,K),this.mem.setUint8(o+64,1)}catch(m){o=this._inst.exports.getsp()>>>0,w(o+56,m),this.mem.setUint8(o+64,0)}},"syscall/js.valueInvoke":o=>{o>>>=0;try{const m=h(o+8),C=M(o+16),P=Reflect.apply(m,void 0,C);o=this._inst.exports.getsp()>>>0,w(o+40,P),this.mem.setUint8(o+48,1)}catch(m){o=this._inst.exports.getsp()>>>0,w(o+40,m),this.mem.setUint8(o+48,0)}},"syscall/js.valueNew":o=>{o>>>=0;try{const m=h(o+8),C=M(o+16),P=Reflect.construct(m,C);o=this._inst.exports.getsp()>>>0,w(o+40,P),this.mem.setUint8(o+48,1)}catch(m){o=this._inst.exports.getsp()>>>0,w(o+40,m),this.mem.setUint8(o+48,0)}},"syscall/js.valueLength":o=>{o>>>=0,b(o+16,parseInt(h(o+8).length))},"syscall/js.valuePrepareString":o=>{o>>>=0;const m=z.encode(String(h(o+8)));w(o+16,m),b(o+24,m.length)},"syscall/js.valueLoadString":o=>{o>>>=0;const m=h(o+8);D(o+16).set(m)},"syscall/js.valueInstanceOf":o=>{o>>>=0,this.mem.setUint8(o+24,h(o+8)instanceof h(o+16)?1:0)},"syscall/js.copyBytesToGo":o=>{o>>>=0;const m=D(o+8),C=h(o+32);if(!(C instanceof Uint8Array||C instanceof Uint8ClampedArray)){this.mem.setUint8(o+48,0);return}const P=C.subarray(0,m.length);m.set(P),b(o+40,P.length),this.mem.setUint8(o+48,1)},"syscall/js.copyBytesToJS":o=>{o>>>=0;const m=h(o+8),C=D(o+16);if(!(m instanceof Uint8Array||m instanceof Uint8ClampedArray)){this.mem.setUint8(o+48,0);return}const P=C.subarray(0,m.length);m.set(P),b(o+40,P.length),this.mem.setUint8(o+48,1)},debug:o=>{console.log(o)}}}}run(b){return ae(this,null,function*(){if(!(b instanceof WebAssembly.Instance))throw new Error("Go.run: WebAssembly.Instance expected");this._inst=b,this.mem=new DataView(this._inst.exports.mem.buffer),this._values=[NaN,0,null,!0,!1,V,this],this._goRefCounts=new Array(this._values.length).fill(1/0),this._ids=new Map([[0,1],[null,2],[!0,3],[!1,4],[V,5],[this,6]]),this._idPool=[],this.exited=!1;let c=4096;const h=_=>{const o=c,m=z.encode(_+"\0");return new Uint8Array(this.mem.buffer,c,m.length).set(m),c+=m.length,c%8!==0&&(c+=8-c%8),o},w=this.argv.length,D=[];this.argv.forEach(_=>{D.push(h(_))}),D.push(0),Object.keys(this.env).sort().forEach(_=>{D.push(h(`${_}=${this.env[_]}`))}),D.push(0);const g=c;if(D.forEach(_=>{this.mem.setUint32(c,_,!0),this.mem.setUint32(c+4,0,!0),c+=8}),c>=12288)throw new Error("total length of command line and environment variables exceeds limit");this._inst.exports.run(w,g),this.exited&&this._resolveExitPromise(),yield this._exitPromise})}_resume(){if(this.exited)throw new Error("Go program has already exited");this._inst.exports.resume(),this.exited&&this._resolveExitPromise()}_makeFuncWrapper(b){const c=this;return function(){const h={id:b,this:this,args:arguments};return c._pendingEvent=h,c._resume(),h.result}}}})(),ie=({data:W})=>{let z=new TextDecoder,S=V.fs,b="";S.writeSync=(M,g)=>{if(M===1)Z(g);else if(M===2){b+=z.decode(g);let k=b.split(`
`);k.length>1&&console.log(k.slice(0,-1).join(`
`)),b=k[k.length-1]}else throw new Error("Bad write");return g.length};let c=[],h,w=0;ie=({data:M})=>(M.length>0&&(c.push(M),h&&h()),D),S.read=(M,g,k,_,o,m)=>{if(M!==0||k!==0||_!==g.length||o!==null)throw new Error("Bad read");if(c.length===0){h=()=>S.read(M,g,k,_,o,m);return}let C=c[0],P=Math.max(0,Math.min(_,C.length-w));g.set(C.subarray(w,w+P),k),w+=P,w===C.length&&(c.shift(),w=0),m(null,P)};let D=new V.Go;return D.argv=["","--service=0.27.7"],he(W,D).then(M=>{Z(null),D.run(M)},M=>{Z(M)}),D};function he(W,z){return ae(this,null,function*(){if(W instanceof WebAssembly.Module)return WebAssembly.instantiate(W,z.importObject);const S=yield fetch(W);if(!S.ok)throw new Error(`Failed to download ${JSON.stringify(W)}`);if("instantiateStreaming"in WebAssembly&&/^application\/wasm($|;)/i.test(S.headers.get("Content-Type")||""))return(yield WebAssembly.instantiateStreaming(S,z.importObject)).instance;const b=yield S.arrayBuffer();return(yield WebAssembly.instantiate(b,z.importObject)).instance})}return W=>ie(W)})(Z=>f.onmessage({data:Z})),re;f={onmessage:null,postMessage:Z=>setTimeout(()=>{try{re=$({data:Z})}catch(ae){x(ae)}}),terminate(){if(re)for(let Z of re._scheduledTimeouts.values())clearTimeout(Z)}}}let y,j;const u=new Promise(($,re)=>{y=$,j=re});f.onmessage=({data:$})=>{f.onmessage=({data:re})=>T(re),$?j($):y()},f.postMessage(a||new URL(n,location.href).toString());let{readFromStdout:T,service:F}=ls({writeToStdin($){f.postMessage($)},isSync:!1,hasFS:!1,esbuild:ee});yield u,xt=()=>{f.terminate(),Je=void 0,xt=void 0,Et=void 0},Et={build:$=>new Promise((re,Z)=>{E.then(Z),F.buildOrContext({callName:"build",refs:null,options:$,isTTY:!1,defaultWD:"/",callback:(ae,ie)=>ae?Z(ae):re(ie)})}),context:$=>new Promise((re,Z)=>{E.then(Z),F.buildOrContext({callName:"context",refs:null,options:$,isTTY:!1,defaultWD:"/",callback:(ae,ie)=>ae?Z(ae):re(ie)})}),transform:($,re)=>new Promise((Z,ae)=>{E.then(ae),F.transform({callName:"transform",refs:null,input:$,options:re||{},isTTY:!1,fs:{readFile(ie,V){V(new Error("Internal error"),null)},writeFile(ie,V){V(null)}},callback:(ie,V)=>ie?ae(ie):Z(V)})}),formatMessages:($,re)=>new Promise((Z,ae)=>{E.then(ae),F.formatMessages({callName:"formatMessages",refs:null,messages:$,options:re,callback:(ie,V)=>ie?ae(ie):Z(V)})}),analyzeMetafile:($,re)=>new Promise((Z,ae)=>{E.then(ae),F.analyzeMetafile({callName:"analyzeMetafile",refs:null,metafile:typeof $=="string"?$:JSON.stringify($),options:re,callback:(ie,V)=>ie?ae(ie):Z(V)})})}}),Ts=ee})(e)})(Yt)),Yt.exports}var Gn=gi();const yi="/asljs/assets/esbuild-B7pGHhMe.wasm";function nt(){return crypto.randomUUID()}function De(){return new Date().toISOString()}function O(e){const t=document.getElementById(e);if(t===null)throw new Error(`Missing element #${e}`);return t}const bi=O("app-workspace"),vi=O("first-app-setup"),hn=O("first-api-key-input"),rt=O("first-app-name-input"),wi=O("btn-create-first-app"),xi=O("btn-create-todo-sample"),ft=O("panels"),Ei=O("panel-chat"),ki=O("panel-editor"),rn=O("app-select"),sn=O("file-select"),gn=O("file-content"),Ai=O("file-preview-panel"),Si=O("file-preview-meta"),Kn=O("file-image-preview"),kr=O("chat-messages"),Ii=O("chat-progress"),Ar=O("chat-choices"),Ft=O("chat-input"),Sr=O("btn-generate"),Ti=O("btn-run"),ji=O("btn-refresh-preview"),Dt=O("preview-frame"),Pi=O("btn-new-app"),Ci=O("btn-import"),Fi=O("btn-project-settings"),Di=O("btn-share"),_i=O("btn-settings"),Li=O("btn-agent-instructions"),_t=O("btn-toggle-chat"),Lt=O("btn-toggle-files"),Ot=O("settings-modal"),Oi=O("btn-close-settings"),Mi=O("btn-save-settings"),Ri=O("btn-cancel-settings"),an=O("api-key-input"),Ir=O("model-select"),Tr=O("theme-select"),jr=O("font-size-input"),Pr=O("max-tool-steps-input"),mt=O("name-modal"),$i=O("name-modal-title"),It=O("app-name-input"),Wt=O("btn-confirm-name"),Ui=O("btn-cancel-name"),Ni=O("btn-close-name-modal"),Mt=O("project-settings-modal"),et=O("project-name-input"),Cr=O("project-author-name-input"),Fr=O("project-author-email-input"),Bi=O("btn-save-project-settings"),zi=O("btn-delete-project"),Wi=O("btn-close-project-settings"),Vi=O("btn-close-project-settings-x"),Rt=O("share-modal"),Hi=O("btn-close-share"),qi=O("btn-close-share-2"),Tt=O("btn-share-link"),Ji=O("btn-share-download"),jt=O("btn-share-copy-text"),Pt=O("btn-share-copy-html"),Dr=O("share-minified-input"),_r=O("share-exclude-tests-input"),Be=O("share-link-status"),Oe=O("share-link-output"),$t=O("import-file"),Ut=O("agent-instructions-modal"),on=O("agent-instructions-text"),Gi=O("btn-close-agent-instructions"),Ki=O("btn-close-agent-instructions-2"),Yi=O("btn-copy-agent-instructions"),Lr="asljs-app-builder-settings",Or="light",ln=14,Mr="__new__",Rr="__import__",Xi="#I!",cn=5e3,Yn=4e3,Qi=1e4,Zi="https://alexandritesoftware.github.io/asljs/app-builder";let Xt=null,Qt=!1,Ct=0,At=null;function yn(){return Xt=Xt??ni({codec:ri(),baseUrl:Zi,hashPrefix:Xi,maxUrlLength:cn}),Xt}function Ve(){try{const e=localStorage.getItem(Lr)??"{}";return JSON.parse(e)}catch{return{}}}function bn(e){localStorage.setItem(Lr,JSON.stringify(e))}function Vt(){return Ve().apiKey??""}function $r(){const e=Ve().model;return e==="gpt-5.3-codex"||e==="gpt-5.4"?e:oa}function Ur(){const e=Ve().maxToolSteps;if(!Number.isFinite(e))return pt;const t=Math.floor(e);return t<1?pt:t}function Nr(){return Ve().theme==="light"?"light":Or}function Br(){const e=Ve().fontSize;if(!Number.isFinite(e))return ln;const t=Math.floor(e);return t<12||t>20?ln:t}function zr(){document.body.dataset.theme=Nr(),document.documentElement.style.fontSize=`${Br()}px`}function eo(e){if(typeof e!="string")return null;const t=e.trim();return t===""?null:t}function at(){return crypto.randomUUID()}async function to(e){const t=new Set,r=[];for(const s of e){let i=eo(s.uuid);if((i===null||t.has(i))&&(i=at()),t.add(i),s.uuid===i){r.push(s);continue}const p={...s,uuid:i,updatedAt:s.updatedAt??De()};await We(p),r.push(p)}return r}function Ht(){return L.apps.find(e=>e.id===L.currentAppId)}async function no(e){await We(e),L.apps=L.apps.map(t=>t.id===e.id?e:t)}async function dn(){const e=Ht();if(e===void 0)return;const t={...e,uuid:at(),updatedAt:De()};await no(t)}const xe=Vs({getCurrentAppId:()=>L.currentAppId,getFiles:()=>L.files,setFiles:e=>{L.files=e},getActiveFileName:()=>L.activeFileName,setActiveFileName:e=>{L.activeFileName=e},createFileId:nt,saveFile:async e=>{await ar(e),await dn()},deleteFileById:async e=>{await Bs(e),await dn()},runApp:st,evaluateInApp:e=>Aa(Dt,e),getAppDiagnostics:()=>Sa(Dt),showChoicePrompt:so,wait:e=>new Promise(t=>{window.setTimeout(t,e)})});function Nt(){Ra({selectElement:rn,apps:L.apps,currentAppId:L.currentAppId,newActionValue:Mr,importActionValue:Rr})}function Wr(){bi.classList.remove("hidden");const e=L.currentAppId!==null&&L.apps.some(t=>t.id===L.currentAppId);if(vi.classList.toggle("hidden",e),ft.classList.toggle("hidden",!e),!e){hn.value=Vt(),rt.value="";return}vn(),wn()}async function Vr(){const e=rt.value.trim();if(e===""){rt.focus();return}const t=hn.value.trim();if(t!==""){const s=Ve();s.apiKey=t,bn(s)}const r={id:nt(),uuid:at(),name:e,createdAt:De(),updatedAt:De()};await We(r),L.apps=[...L.apps,r],await Ke(r.id)}async function ro(){const e=Qa("TODO Sample");if(e===null){alert("TODO sample is not available.");return}const t=rt.value.trim(),r=t===""?e.name:t,s=hn.value.trim();if(s!==""){const v=Ve();v.apiKey=s,bn(v)}const i={id:nt(),uuid:at(),name:r,author:e.author,createdAt:De(),updatedAt:De()},p=Za(e,i.id,nt);await We(i),await ir(i.id,p),L.apps=[...L.apps,i],await Ke(i.id)}function vn(){$a({selectElement:sn,files:L.files,activeFileName:L.activeFileName})}function wn(){Ua({textAreaElement:gn,imagePreviewElement:Kn,previewFallbackElement:Si,files:L.files,activeFileName:L.activeFileName}),Ai.classList.toggle("hidden",Kn.classList.contains("hidden"))}function Xn(e){L.generating=e,Ba(Sr,e)}function Zt(e,t){za(Ii,e,t)}function ze(e,t){L.chatMessages=[...L.chatMessages,{role:e,text:t}],Wa(kr,e,t)}function Hr(){Ha(Ar)}function so(e,t){Va(Ar,e,t,r=>{Ft.value=r,En()})}function qr(){L.chatMessages=[],kr.replaceChildren(),Hr()}function ao(e){ze("assistant",wa(e))}async function qt(){if(L.activeFileName===null||L.currentAppId===null)return;const e=L.files.find(r=>r.name===L.activeFileName);if(e===void 0)return;const t=gn.value;e.content!==t&&(e.content=t,await ar(e),await dn())}async function Ke(e){L.currentAppId=e;const t=await Ns(e);L.files=t,L.activeFileName=io(t),qr(),ao(t.map(r=>r.name))}function io(e){var t;return((t=e.find(r=>!r.name.startsWith(".")))==null?void 0:t.name)??null}function Jr(){$i.textContent="New App",It.value="",mt.classList.remove("hidden"),It.focus(),Wt.onclick=async()=>{const e=It.value.trim();if(e==="")return;mt.classList.add("hidden");const t={id:nt(),uuid:at(),name:e,createdAt:De(),updatedAt:De()};await We(t),L.apps=[...L.apps,t],await Ke(t.id)}}function xn(){mt.classList.add("hidden"),Wt.onclick=null}function oo(){var t,r;const e=L.apps.find(s=>s.id===L.currentAppId);e!==void 0&&(et.value=e.name,Cr.value=((t=e.author)==null?void 0:t.name)??"",Fr.value=((r=e.author)==null?void 0:r.email)??"",Mt.classList.remove("hidden"),et.focus(),et.select())}function ht(){Mt.classList.add("hidden")}async function Gr(){const e=L.apps.find(v=>v.id===L.currentAppId);if(e===void 0)return;const t=et.value.trim();if(t===""){et.focus();return}const r=Cr.value.trim(),s=Fr.value.trim(),i=r!==""||s!==""?{...r!==""?{name:r}:{},...s!==""?{email:s}:{}}:void 0,p={...e,name:t,author:i,updatedAt:De()};await We(p),L.apps=L.apps.map(v=>v.id===e.id?p:v),ht()}async function lo(){ht(),await co()}async function co(){const e=L.apps.find(t=>t.id===L.currentAppId);e!==void 0&&confirm(`Delete "${e.name}"? This cannot be undone.`)&&(await Us(e.id),L.apps=L.apps.filter(t=>t.id!==e.id),L.currentAppId=null,L.files=[],L.activeFileName=null,qr(),Dt.src="about:blank")}async function En(){const e=Ft.value.trim();if(e==="")return;const t=Vt();if(t===""){ze("assistant","No OpenAI API key set. Open Settings (⚙) to add your key. Generation is optional — you can also create files manually.");return}if(L.currentAppId===null){ze("assistant","Please create or open an app first.");return}Hr(),Ft.value="",ze("user",e),Xn(!0),Zt("Starting generation...",!0);try{const r=$r(),s=Ur(),i=xa(L.chatMessages),p=await ua(i,t,r,xe,{initialToolStepLimit:s,systemPrompt:dr,onToolStepLimit:async({stepsCompleted:G})=>confirm(`AI reached ${G} tool steps without finishing. Continue for 12 more steps?`),onProgress:G=>{Zt(G,!0)}}),v=L.apps.find(G=>G.id===L.currentAppId);if(v!==void 0){const G={...v,updatedAt:De()};await We(G),L.apps=L.apps.map(X=>X.id===v.id?G:X)}ze("assistant",p.summary),st()}catch(r){const s=r instanceof Error?r.message:String(r);ze("assistant",`Error: ${s}`)}finally{Zt("",!1),Xn(!1)}}function st(){qt().then(()=>{ka(Dt,L.files,{hostOpenAiApiKey:Vt()})})}async function uo(){await qt();const e=Ht();if(e===void 0)throw new Error("No app selected.");return Ga({app:e,files:L.files})}function po(e){const t=new Blob([JSON.stringify(e)],{type:"application/json"}),r=URL.createObjectURL(t),s=document.createElement("a");s.href=r,s.download=`${e.name.replace(/\s+/g,"-")}.json`,s.click(),URL.revokeObjectURL(r)}async function Kr(){let e=await uo();return _r.checked&&(e={...e,files:Object.fromEntries(Object.entries(e.files).filter(([t])=>!hi(t)))}),Dr.checked?di(e,fo):e}async function fo(e,t){return(await(await mo()).transform(e,{loader:t,minify:!0,target:"es2020"})).code.trim()}async function mo(){return At!==null||(At=(async()=>(await Gn.initialize({wasmURL:yi,worker:!0}),{transform:Gn.transform}))()),At}function ho(e){var p,v;const t=((p=e==null?void 0:e.name)==null?void 0:p.trim())??"",r=((v=e==null?void 0:e.email)==null?void 0:v.trim())??"";return`Author: ${t===""?"Not provided":t}
Email: ${r===""?"Not provided":r}`}function Yr(e){return confirm(`Security warning: You are about to import an application.

${ho(e.author)}

Although apps run in an isolated browser context, imported code can still be harmful. Be vigilant and only open apps from sources you trust.

Do you want to continue?`)}function St(e){const t=e==="run";ft.classList.toggle("chat-collapsed",t),ft.classList.toggle("files-collapsed",t),_t.textContent=t?"Chat ▸":"Chat ▾",Lt.textContent=t?"Files ▸":"Files ▾",_t.setAttribute("aria-expanded",String(!t)),Lt.setAttribute("aria-expanded",String(!t))}function Qn(){return confirm(`You followed the application link.

Click OK to start the application.
Click Cancel to edit it.`)?"run":"edit"}function Xr(){$t.value="",$t.click()}async function un(e,t){const r=Ka({payload:e,existingApps:L.apps,navigateToExistingById:t.navigateToExistingById,now:De(),createId:nt,createUuid:at});return r.kind==="duplicate"?(t.showDuplicateAlert&&alert("Import stopped: an app with the same ID already exists."),null):r.kind==="existing"?(await Ke(r.appId),r.appId):(await We(r.app),await ir(r.app.id,r.files),L.apps=[...L.apps,r.app],await Ke(r.app.id),r.app.id)}async function go(){var t;const e=(t=$t.files)==null?void 0:t[0];if(e!==void 0)try{const r=await e.text(),s=yr(r);if(!Yr(s))return;await un(s,{navigateToExistingById:!1,showDuplicateAlert:!0})}catch(r){const s=r instanceof Error?r.message:String(r);alert(`Import failed: ${s}`)}}function yo(){return yn().readTokenFromHash(window.location.hash)}function en(){window.history.pushState(null,"",`${window.location.pathname}${window.location.search}`)}async function Qr(){const e=yo();if(e===null||e.trim()==="")return!1;if(Qt)return!0;Qt=!0;try{const t=(()=>{try{return decodeURIComponent(e)}catch{return e}})(),r=Vn(e)??Vn(t);if(r!==null)return await un(r,{navigateToExistingById:!0,showDuplicateAlert:!1})!==null&&(Qn()==="run"?(St("run"),st()):St("edit")),en(),!0;try{const s=await yn().parsePayloadFromToken(e);if(!Yr(s))return en(),!0;await un(s,{navigateToExistingById:!0,showDuplicateAlert:!1})!==null&&(Qn()==="run"?(St("run"),st()):St("edit"))}catch(s){const i=s instanceof Error?s.message:String(s);alert(`Could not import from share link: ${i}`)}return en(),!0}finally{Qt=!1}}async function kn(){const e=++Ct;Oe.value="",Tt.disabled=!0,jt.disabled=!0,Pt.disabled=!0,Be.textContent="Preparing share link...";try{const t=await vo((async()=>{const r=await Kr();return yn().createShareUrl(r)})(),Qi,"Preparing share link timed out. Use Download export instead.");if(e!==Ct)return;if(t.exceedsMaxUrlLength){Oe.value=t.url,Be.textContent=qn(t.url.length,Yn,cn),Tt.disabled=!1,jt.disabled=!1,Pt.disabled=!1;return}Oe.value=t.url,Be.textContent=qn(t.url.length,Yn,cn),Tt.disabled=!1,jt.disabled=!1,Pt.disabled=!1}catch(t){const r=t instanceof Error?t.message:String(t);e===Ct&&(Be.textContent=r)}}function bo(){Ht()!==void 0&&(Rt.classList.remove("hidden"),kn())}function An(){Ct+=1,Rt.classList.add("hidden")}async function vo(e,t,r){let s;const i=new Promise((p,v)=>{s=globalThis.setTimeout(()=>{v(new Error(r))},t)});try{return await Promise.race([e,i])}finally{s!==void 0&&globalThis.clearTimeout(s)}}async function wo(){await Zr()}async function Zr(){if(Oe.value.trim()!=="")try{await navigator.clipboard.writeText(Oe.value),Be.textContent="Share link copied to clipboard."}catch{Oe.focus(),Oe.select(),Be.textContent="Could not copy automatically. Link is selected, copy it manually."}}async function xo(){var s;const e=Oe.value.trim();if(e==="")return;const t=((s=Ht())==null?void 0:s.name.trim())||"Shared app",r=`<a href="${Zn(e)}">${Zn(t)}</a>`;try{if(typeof ClipboardItem<"u"&&navigator.clipboard.write!==void 0){await navigator.clipboard.write([new ClipboardItem({"text/html":new Blob([r],{type:"text/html"}),"text/plain":new Blob([e],{type:"text/plain"})})]),Be.textContent="HTML link copied to clipboard.";return}await navigator.clipboard.writeText(e),Be.textContent="HTML clipboard is unavailable here. URL copied as text."}catch{Oe.focus(),Oe.select(),Be.textContent="Could not copy automatically. Link is selected, copy it manually."}}function Zn(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}async function Eo(){const e=await Kr();po(e)}function ko(){an.value=Vt(),Ir.value=$r(),Tr.value=Nr(),jr.value=String(Br()),Pr.value=String(Ur()),Ot.classList.remove("hidden"),an.focus()}function Jt(){Ot.classList.add("hidden")}function Ao(){const e=Ve();e.apiKey=an.value.trim(),e.model=Ir.value==="gpt-5.4"?"gpt-5.4":"gpt-5.3-codex",e.theme=Tr.value==="light"?"light":Or;const t=Number.parseInt(jr.value,10);e.fontSize=Number.isFinite(t)&&t>=12&&t<=20?t:ln;const r=Number.parseInt(Pr.value,10);e.maxToolSteps=Number.isFinite(r)&&r>=1?r:pt,bn(e),zr(),Jt()}function So(){on.value=dr,Ut.classList.remove("hidden"),on.scrollTop=0}function Sn(){Ut.classList.add("hidden")}function Io(){gr({panelElement:Ei,toggleButtonElement:_t,panelsElement:ft,collapsedPanelsClass:"chat-collapsed",expandedLabel:"Chat ▾",collapsedLabel:"Chat ▸"})}function To(){gr({panelElement:ki,toggleButtonElement:Lt,panelsElement:ft,collapsedPanelsClass:"files-collapsed",expandedLabel:"Files ▾",collapsedLabel:"Files ▸"})}async function jo(){const e=on.value;try{await navigator.clipboard.writeText(e),ze("assistant","Agent instructions copied to clipboard.")}catch{ze("assistant","Could not copy to clipboard automatically. You can still select and copy from the instructions modal.")}}L.on("set:apps",()=>Nt());L.on("set:currentAppId",()=>{Nt(),Wr()});L.on("set:files",()=>{vn(),wn()});L.on("set:activeFileName",()=>{vn(),wn()});Pi.addEventListener("click",Jr);Ci.addEventListener("click",Xr);Fi.addEventListener("click",oo);Di.addEventListener("click",()=>{bo()});Sr.addEventListener("click",()=>{En()});Ti.addEventListener("click",st);ji.addEventListener("click",st);_i.addEventListener("click",ko);Li.addEventListener("click",So);_t.addEventListener("click",Io);Lt.addEventListener("click",To);Oi.addEventListener("click",Jt);Mi.addEventListener("click",Ao);Ri.addEventListener("click",Jt);Ot.addEventListener("click",e=>{e.target===Ot&&Jt()});Gi.addEventListener("click",Sn);Ki.addEventListener("click",Sn);Yi.addEventListener("click",()=>{jo()});Ut.addEventListener("click",e=>{e.target===Ut&&Sn()});Hi.addEventListener("click",An);qi.addEventListener("click",An);Tt.addEventListener("click",()=>{wo()});Ji.addEventListener("click",()=>{Eo()});jt.addEventListener("click",()=>{Zr()});Pt.addEventListener("click",()=>{xo()});Dr.addEventListener("change",()=>{kn()});_r.addEventListener("change",()=>{kn()});Rt.addEventListener("click",e=>{e.target===Rt&&An()});Wt.addEventListener("click",()=>{});Ui.addEventListener("click",xn);Ni.addEventListener("click",xn);mt.addEventListener("click",e=>{e.target===mt&&xn()});Bi.addEventListener("click",()=>{Gr()});zi.addEventListener("click",()=>{lo()});Wi.addEventListener("click",ht);Vi.addEventListener("click",ht);Mt.addEventListener("click",e=>{e.target===Mt&&ht()});It.addEventListener("keydown",e=>{e.key==="Enter"&&Wt.click()});et.addEventListener("keydown",e=>{e.key==="Enter"&&(e.preventDefault(),Gr())});wi.addEventListener("click",()=>{Vr()});xi.addEventListener("click",()=>{ro()});rt.addEventListener("keydown",e=>{e.key==="Enter"&&(e.preventDefault(),Vr())});Ft.addEventListener("keydown",e=>{e.key==="Enter"&&!e.shiftKey&&(e.preventDefault(),En())});rn.addEventListener("change",()=>{const e=rn.value;if(e===Mr){Jr(),Nt();return}if(e===Rr){Xr(),Nt();return}e!==""&&e!==L.currentAppId&&Ke(e)});sn.addEventListener("change",()=>{const e=sn.value;e===""||e===L.activeFileName||(qt(),L.activeFileName=e)});gn.addEventListener("blur",()=>{qt()});$t.addEventListener("change",()=>{go()});window.listFileset=xe.listFileset;window.listFilesByMask=xe.listFilesByMask;window.readFile=xe.readFile;window.readFiles=xe.readFiles;window.readFilesByMask=xe.readFilesByMask;window.readFileData=xe.readFileData;window.setFilesContent=xe.setFilesContent;window.setFileData=xe.setFileData;window.setFileContent=xe.setFileContent;window.replaceFilePart=xe.replaceFilePart;window.deleteFile=xe.deleteFile;window.grep=xe.grep;window.choose=xe.choose;window.evalInApp=xe.evalInApp;window.assertInApp=xe.assertInApp;window.runAppTests=xe.runAppTests;window.getAppDiagnostics=xe.getAppDiagnostics;window.runAppAndCollectDiagnostics=xe.runAppAndCollectDiagnostics;window.addEventListener("hashchange",()=>{Qr()});async function Po(){zr();const e=await to(await $s());if(L.apps=e,!await Qr())if(e.length>0){const r=[...e].sort((s,i)=>i.updatedAt.localeCompare(s.updatedAt));await Ke(r[0].id)}else L.currentAppId=null,L.files=[],L.activeFileName=null,L.chatMessages=[],Wr(),rt.focus()}Po().catch(e=>{console.error("App Builder init failed:",e)});
