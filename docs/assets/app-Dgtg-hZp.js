(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))r(a);new MutationObserver(a=>{for(const s of a)if(s.type==="childList")for(const i of s.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&r(i)}).observe(document,{childList:!0,subtree:!0});function t(a){const s={};return a.integrity&&(s.integrity=a.integrity),a.referrerPolicy&&(s.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?s.credentials="include":a.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function r(a){if(a.ep)return;a.ep=!0;const s=t(a);fetch(a.href,s)}})();class Un extends Error{constructor(n,t,r,a,s){super(n),this.name="ListenerError",this.error=t,this.object=r,this.event=a,this.listener=s}}function J(e){if(typeof e!="string"&&typeof e!="symbol")throw new TypeError("Expect event to be a string or symbol.")}function ue(e){return typeof e=="function"}function ze(e){if(ue(e))return e}function Ze(e){return typeof e=="object"&&e!==null}function be(e){if(!ue(e))throw new TypeError("Expect a function.")}const $n=(e=Object.create(null),n={})=>{if(!Ze(e)&&!ue(e))throw new TypeError("Expect an object or a function.");for(const p of["on","once","off","emit","emitAsync","has"])if(p in e)throw new Error(`Method "${p}" already exists.`);const{strict:t=!1,trace:r=null,error:a=null}=n,s=ze(r)??null,i=ze(a)??null,h=e!==_,A=(p,f)=>{s==null||s(p,f),h&&_.emit(p,f)};A("new",{object:e});const g=new Set,d=new Map,v={enumerable:!1,configurable:!0,writable:!0};return Object.defineProperties(e,{on:Object.assign({value:E},v),once:Object.assign({value:w},v),off:Object.assign({value:y},v),emit:Object.assign({value:L},v),emitAsync:Object.assign({value:I},v),has:Object.assign({value:j},v)}),e;function l(p,f){let b=d.get(p);b||d.set(p,b=new Set),b.add(f)}function m(p,f){const b=d.get(p);if(!b)return!1;const S=b.delete(f);return b.size===0&&d.delete(p),S}function u(p,f,b){const S={error:b,object:e,event:p,listener:f};if(i==null||i(S),e===_&&p==="error")throw new Un("Error in a global error listener.",b,e,p,f);_.emit("error",S)}function E(p,f){J(p),be(f),A("on",{object:e,event:p,listener:f}),l(p,f);let b=!0;return()=>b?(b=!1,m(p,f)):!1}function w(p,f){J(p),be(f);const b=E(p,(...S)=>{b(),f(...S)});return b}function y(p,f){return J(p),be(f),A("off",{object:e,event:p,listener:f}),m(p,f)}function j(p){var f;return J(p),(((f=d.get(p))==null?void 0:f.size)??0)>0}function L(p,...f){J(p);const b=d.get(p)||g;if(A("emit",{object:e,listeners:[...b],event:p,args:f}),b.size!==0)for(const S of b)try{S(...f)}catch(P){if(u(p,S,P),t)throw P}}async function I(p,...f){J(p);const b=d.get(p)||g;if(A("emitAsync",{object:e,listeners:[...b],event:p,args:f}),b.size===0)return;const S=[...b].map(async P=>{try{await P(...f)}catch(We){if(u(p,P,We),t)throw We}});await(t?Promise.all(S):Promise.allSettled(S))}},_=$n;_(_);function Jn(e){return!Ze(e)&&!ue(e)?!1:typeof e.on=="function"}function en(e){if(Jn(e))return e}function T(e){return typeof e=="function"}function Fe(e){return typeof e=="object"&&e!==null}function nn(e){if(!T(e))throw new TypeError("Expect a function.")}function Ee(e){if(e.trim()==="")throw new TypeError("Expect watch path to be a non-empty string.");const n=e.split(".");for(const t of n)if(t.trim()==="")throw new TypeError("Expect watch path segments to be non-empty.");return e.split(".").map(t=>t.trim()).filter(t=>t!=="")}function Hn(e,n){const t=Ee(n);if(t.length===0)return;let r=e;for(const a of t){if(!Fe(r)||!(a in r))return;r=r[a]}return r}const tn=(e,n,t)=>{if(Array.isArray(e))throw new TypeError("Watching arrays is not supported.");nn(t);const r=typeof n=="string"?[n]:n;if(!Array.isArray(r))throw new TypeError("Expect properties to be a string or an array of strings.");for(const i of r){if(typeof i!="string")throw new TypeError("Expect properties to be a string or an array of strings.");Ee(i)}const a=()=>r.map(i=>Hn(e,i)),s=[];for(const i of r){const h=Ee(i);let A=null;const g=()=>{const d=[],v=(l,m)=>{if(!Fe(l)||m>=h.length)return;const u=h[m],E=en(l);if(E){const w=E.on(`set:${u}`,()=>{t(...a()),m<h.length-1&&A&&(A(),A=g())});d.push(w)}m<h.length-1&&v(l[u],m+1)};return v(e,0),()=>d.reduce((l,m)=>m()||l,!1)};A=g(),s.push(()=>A?A():!1)}return t(...a()),()=>s.reduce((i,h)=>h()||i,!1)};function Wn(e,n){"watch"in e||Object.defineProperty(e,"watch",{configurable:!0,writable:!0,enumerable:!1,value(t,r){return n(typeof t=="string"?this:this,t,r)}})}function Ke(e,n){return Object.prototype.hasOwnProperty.call(e,n)}function ye(e){if(typeof e=="symbol")return!1;const n=typeof e=="number"?e:Number(e);return!Number.isInteger(n)||n<0||n>=4294967295?!1:typeof e=="number"||e===String(n)}function zn(e){return en(e)?T(e.emit):!1}const rn=(e,n={})=>{const{eventful:t=_,trace:r=null,shallow:a=!1}=n;nn(t);const s=me.options,i=new WeakMap,h=l=>{if(a||!Fe(l)||zn(l))return l;if(i.has(l))return i.get(l);const m=rn(l,{eventful:t,trace:r,shallow:a});return i.set(l,m),m},A=l=>{if(!a){if(Array.isArray(l)){for(let m=0;m<l.length;m++)l[m]=h(l[m]);return}for(const m of Reflect.ownKeys(l))Ke(l,m)&&(l[m]=h(l[m]))}},g=l=>{const m=Array.isArray(l);A(l),Wn(l,tn);let u;const E=new Proxy(l,{set(w,y,j,L){const I=m&&ye(y),p=Reflect.get(w,y,L),f=Reflect.set(w,y,h(j),L);if(u&&f){const b=Reflect.get(w,y,L);if(!Object.is(p,b)){const S=I?{index:Number(y),value:b,previous:p}:{property:y,value:b,previous:p},P=r||s.trace;u.emit(`set:${String(y)}`,S),T(P)&&P(u,"set",S),u.emit("set",S)}}return f},deleteProperty(w,y){const j=m&&ye(y),L=Ke(w,y),I=L?w[y]:void 0,p=Reflect.deleteProperty(w,y);if(u&&p&&L){const f=j?{index:Number(y),previous:I}:{property:y,previous:I},b=r||s.trace;u.emit(`delete:${String(y)}`,f),T(b)&&b(u,"delete",f),u.emit("delete",f)}return p},defineProperty(w,y,j){const L=Object.getOwnPropertyDescriptor(w,y)??null,I=Object.prototype.hasOwnProperty.call(j,"value")?{...j,value:h(j.value)}:j,p=Reflect.defineProperty(w,y,I),f=m&&(y==="length"||ye(y));if(u&&!f&&p){const b={property:y,descriptor:I,previous:L},S=r||s.trace;u.emit(`define:${String(y)}`,b),T(S)&&S(u,"define",b),u.emit("define",b)}return p}});return u=T(l==null?void 0:l.emit)?E:t(E),u},d=r||s.trace;if(Array.isArray(e)){const l=g(e);return T(d)&&d(l,"new"),l}if(e!==null&&typeof e=="object"){const l=g(e);return T(d)&&d(l,"new",{object:l}),l}const v=t({get value(){return e},set value(l){if(Object.is(l,e))return;const m=e;e=l;const u={property:"value",value:e,previous:m};v.emit("set:value",u),T(d)&&d(v,"set",u),v.emit("set",u)}});return T(d)&&d(v,"new",{object:v}),v},me=rn;me.options={trace:null};me.watch=tn;const o=me({apps:[],currentAppId:null,files:[],activeFileName:null,generating:!1,error:null});function k(e){return new Promise((n,t)=>{e.addEventListener("success",()=>{n(e.result)}),e.addEventListener("error",()=>{t(e.error??new Error("IndexedDB request failed"))})})}function Kn(e,n){return new Promise((t,r)=>{const a=indexedDB.open(e,n.length);a.addEventListener("upgradeneeded",s=>{const i=n.slice(s.oldVersion-1,s.newVersion??n.length-1);for(const h of i)h(a.result)}),a.addEventListener("success",()=>{t(a.result)}),a.addEventListener("blocked",()=>{r(new Error("Database opening is blocked"))}),a.addEventListener("error",()=>{r(a.error??new Error("Failed to open database"))})})}const qn="asljs-app-builder";let ee=null;async function $(){return ee!==null||(ee=await Kn(qn,[e=>{e.createObjectStore("apps",{keyPath:"id"}),e.createObjectStore("files",{keyPath:"id"}).createIndex("byAppId","appId",{unique:!1})}])),ee}async function Gn(){const n=(await $()).transaction("apps","readonly");return k(n.objectStore("apps").getAll())}async function N(e){const t=(await $()).transaction("apps","readwrite");await k(t.objectStore("apps").put(e))}async function Vn(e){const t=(await $()).transaction(["apps","files"],"readwrite");await k(t.objectStore("apps").delete(e));const r=t.objectStore("files"),a=await k(r.index("byAppId").getAllKeys(e));for(const s of a)await k(r.delete(s))}async function Yn(e){const t=(await $()).transaction("files","readonly");return k(t.objectStore("files").index("byAppId").getAll(e))}async function an(e){const t=(await $()).transaction("files","readwrite");await k(t.objectStore("files").put(e))}async function Xn(e){const t=(await $()).transaction("files","readwrite");await k(t.objectStore("files").delete(e))}async function sn(e,n){const a=(await $()).transaction("files","readwrite").objectStore("files"),s=await k(a.index("byAppId").getAllKeys(e));for(const i of s)await k(a.delete(i));for(const i of n)await k(a.put(i))}function F(e,n,t,r){return{name:e,type:"function",description:n,parameters:{type:"object",properties:t||{},required:r||[],additionalProperties:!1},strict:!0}}const Qn=[F("listFileset","List all file paths in the virtual filesystem."),F("readFile","Read the full text content of a file.",{path:{type:"string"}},["path"]),F("setFileContent","Create or fully replace file content.",{path:{type:"string"},content:{type:"string"}},["path","content"]),F("replaceFilePart","Replace part of a file by exact search string.",{path:{type:"string"},search:{type:"string"},replacement:{type:"string"},replaceAll:{type:"boolean"}},["path","search","replacement","replaceAll"]),F("deleteFile","Delete a file from the virtual filesystem.",{path:{type:"string"}},["path"]),F("evalInApp","Evaluate JavaScript in the running app document context.",{code:{type:"string"}},["code"]),F("getAppDiagnostics","Get current runtime logs and errors from the running app."),F("runAppAndCollectDiagnostics","Run the app and collect runtime logs and errors after startup.")],Zn=350;function et(e){async function n(){return[...e.getFiles()].map(g=>g.name).sort((g,d)=>g.localeCompare(d))}async function t(g){const d=ne(e,g),v=d===null?void 0:e.getFiles().find(l=>l.name===d);if(v===void 0)throw new Error(`File not found: ${g}`);return v.content}async function r(g,d){const v=nt(e),l=Ae(g),m=ne(e,l),u=e.getFiles().find(w=>w.name===(m??l));if(u!==void 0){const w={...u,content:d};await e.saveFile(w),e.setFiles(e.getFiles().map(y=>y.id===w.id?w:y)),e.setActiveFileName(w.name);return}const E={id:e.createFileId(),appId:v,name:l,content:d};await e.saveFile(E),e.setFiles([...e.getFiles(),E]),e.setActiveFileName(E.name)}async function a(g){var m;const d=ne(e,g),v=d===null?void 0:e.getFiles().find(u=>u.name===d);if(v===void 0)return;await e.deleteFileById(v.id);const l=e.getFiles().filter(u=>u.id!==v.id);e.setFiles(l),e.getActiveFileName()===g&&e.setActiveFileName(((m=l[0])==null?void 0:m.name)??null)}async function s(g,d,v,l=!1){if(d==="")throw new Error("Search text cannot be empty.");const m=ne(e,g);if(m===null)throw new Error(`File not found: ${g}`);const u=await t(m);if(!u.includes(d))throw new Error(`Search text not found in ${m}.`);let E=u;if(l)E=u.split(d).join(v);else{const w=u.indexOf(d);if(u.indexOf(d,w+d.length)!==-1)throw new Error("Search text is ambiguous. Use replaceAll=true or provide a more specific search block.");E=u.slice(0,w)+v+u.slice(w+d.length)}await r(m,E)}async function i(g){if(e.getFiles().length===0)throw new Error("No files available to run.");e.runApp();try{return await e.evaluateInApp(g)}catch{return e.runApp(),e.evaluateInApp(g)}}async function h(){return e.getAppDiagnostics()}async function A(){return e.runApp(),await e.wait(e.diagnosticsDelayMs??Zn),e.getAppDiagnostics()}return{listFileset:n,readFile:t,setFileContent:r,deleteFile:a,replaceFilePart:s,evalInApp:i,getAppDiagnostics:h,runAppAndCollectDiagnostics:A}}function nt(e){const n=e.getCurrentAppId();if(n===null)throw new Error("No active app. Create or open an app first.");return n}function Ae(e){const n=e.trim().replace(/\\/g,"/").replace(/^\.\//,"").replace(/^\/+/,"");if(n==="")throw new Error("Path cannot be empty.");if(n.includes(".."))throw new Error("Parent path segments are not allowed.");return n}function ne(e,n){const t=Ae(n),r=e.getFiles().find(a=>Ae(a.name).toLowerCase()===t.toLowerCase());return(r==null?void 0:r.name)??null}function tt(e){return typeof e!="object"||e===null?!1:e.type==="function_call"}function on(e){if(typeof e.name!="string"||e.name.trim()==="")throw new Error("Tool call missing function name.");return e.name}function rt(e){if(typeof e.call_id!="string"||e.call_id.trim()==="")throw new Error("Tool call missing call_id.");return e.call_id}async function at(e,n){const t=on(e),r=st(e.arguments);try{switch(t){case"listFileset":{const a=await n.listFileset();return D(a)}case"readFile":{const a=await n.readFile(O(r,"path"));return D(a)}case"setFileContent":return await n.setFileContent(O(r,"path"),O(r,"content")),D("ok");case"replaceFilePart":return await n.replaceFilePart(O(r,"path"),O(r,"search"),O(r,"replacement"),it(r,"replaceAll",!1)),D("ok");case"deleteFile":return await n.deleteFile(O(r,"path")),D("ok");case"evalInApp":{const a=await n.evalInApp(O(r,"code"));return D(a)}case"getAppDiagnostics":{const a=await n.getAppDiagnostics();return D(a)}case"runAppAndCollectDiagnostics":{const a=await n.runAppAndCollectDiagnostics();return D(a)}default:return qe(`Unknown tool: ${t}`)}}catch(a){return qe(a instanceof Error?a.message:String(a))}}function st(e){if(e===void 0)return{};if(typeof e=="object"&&e!==null)return e;if(typeof e!="string")throw new Error("Invalid tool arguments value.");try{const n=JSON.parse(e);if(typeof n!="object"||n===null)throw new Error("Tool arguments must be a JSON object.");return n}catch{throw new Error("Invalid tool arguments JSON.")}}function O(e,n){const t=e[n];if(typeof t!="string")throw new Error(`Tool argument "${n}" must be a string.`);return t}function it(e,n,t){const r=e[n];if(r===void 0)return t;if(typeof r!="boolean")throw new Error(`Tool argument "${n}" must be a boolean.`);return r}function D(e){return ln({ok:!0,value:e})}function qe(e){return ln({ok:!1,error:e})}function ln(e){try{return JSON.stringify(e)}catch{return'{"ok":false,"error":"Failed to serialize tool result."}'}}const ot="https://api.openai.com/v1/responses",lt="gpt-5.3-codex",V=20,ct="You are an expert ASLJS app generator.",dt=12,pt={createResponse:async e=>{const n=await fetch(ot,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${e.apiKey}`},body:JSON.stringify({model:e.model,instructions:e.instructions,temperature:e.temperature,previous_response_id:e.previous_response_id,input:e.input,tools:e.tools})});if(!n.ok){const t=await n.json().catch(()=>({})),r=ft(t)??`OpenAI API error: ${n.status}`;throw new Error(r)}return n.json()}};async function ut(e,n,t,r,a){var v;const s=(a==null?void 0:a.transport)??pt,i=(a==null?void 0:a.systemPrompt)??ct;let h,A=e,g=mt(a==null?void 0:a.initialToolStepLimit),d=0;for(;;){if(await G(a,`Step ${d+1}: requesting assistant response...`),d>=g){if(!(await((v=a==null?void 0:a.onToolStepLimit)==null?void 0:v.call(a,{stepsCompleted:d,stepLimit:g}))??!1))throw new Error("AI exceeded maximum tool steps without completing.");g+=dt,await G(a,`Extended step limit to ${g}. Continuing...`)}const l=await s.createResponse({apiKey:n,model:t,instructions:i,temperature:.1,previous_response_id:h,input:A,tools:Qn});if(!Array.isArray(l.output))throw new Error("AI returned an unexpected response format.");const m=l.output.filter(tt);if(m.length===0){await G(a,`Completed in ${d+1} step(s). Finalizing summary...`);const E=ht(l);return{summary:E===""?"Completed tool-based update.":E}}const u=[];for(const E of m){await G(a,`Step ${d+1}: running ${on(E)}...`);const w=await at(E,r);u.push({type:"function_call_output",call_id:rt(E),output:w})}await G(a,`Step ${d+1}: submitted ${u.length} tool result(s).`),h=typeof l.id=="string"?l.id:h,A=u,d+=1}}function mt(e){if(!Number.isFinite(e))return V;const n=Math.floor(e);return n>=1?n:V}async function G(e,n){(e==null?void 0:e.onProgress)!==void 0&&await Promise.resolve(e.onProgress(n))}function ft(e){const n=e.error;return typeof(n==null?void 0:n.message)=="string"?n.message:null}function ht(e){return typeof e.output_text=="string"&&e.output_text.trim()!==""?e.output_text.trim():Array.isArray(e.output)?e.output.filter(t=>t.type==="message").flatMap(t=>t.content??[]).map(t=>t.text??"").map(t=>t.trim()).filter(t=>t!=="").join(`
`):""}const gt=`# observable\r
\r
> Part of [Alexandrite Software Library][#1] – a set of high‑quality,\r
performant JavaScript libraries for everyday use.\r
\r
## Overview\r
\r
Lightweight observable for JS. Emits events on property changes via on/off/emit.\r
Works with objects, arrays, and primitives.\r
\r
## Installation\r
\r
\`\`\`bash\r
npm install asljs-observable\r
\`\`\`\r
\r
NPM Package: [asljs-observable](https://www.npmjs.com/package/asljs-observable)\r
\r
## Usage\r
\r
### Observing an object (JavaScript)\r
\r
\`\`\`js\r
import { observable } from 'asljs-observable';\r
\r
const obj = observable({ a: 1, b: 2 });\r
\r
obj.on('set:a', ({ value, previous }) => {\r
  console.log(\`obj.a ←\`, value, '(was', previous, ')');\r
});\r
\r
obj.on('set', ({ property, value, previous }) => {\r
  console.log(\`obj.\${property} ←\`, value, '(was', previous, ')');\r
});\r
\r
obj.a = 3;\r
\`\`\`\r
\r
### Observing an array (JavaScript)\r
\r
\`\`\`js\r
import { observable } from 'asljs-observable';\r
\r
const arr = observable([1, 2, 3]);\r
\r
arr.on('set:1', ({ value, previous }) => {\r
  console.log('arr[1] ←', value, '(was', previous, ')');\r
});\r
\r
arr.on('set', (payload) => {\r
  if ('index' in payload) {\r
    console.log(\`arr[\${payload.index}] ←\`, payload.value, '(was', payload.previous, ')');\r
    return;\r
  }\r
\r
  console.log(\`arr.\${payload.property} ←\`, payload.value, '(was', payload.previous, ')');\r
});\r
\r
arr[1] = 42;\r
\`\`\`\r
\r
### Observing a number (JavaScript)\r
\r
\`\`\`js\r
import { observable } from 'asljs-observable';\r
\r
const box = observable(10);\r
\r
box.on('set', ({ value, previous }) => {\r
  console.log('value:', previous, '→', value);\r
});\r
\r
box.value = 11;\r
\`\`\`\r
\r
### Watch selected properties (JavaScript)\r
\r
\`\`\`js\r
import { observable } from 'asljs-observable';\r
\r
const state = observable({ user: 'Alice', active: false });\r
\r
// logs "User: Alice Active: false"\r
state.watch(\r
  [ 'user', 'active' ],\r
  (user, active) =>\r
    console.log('User:', user, 'Active:', active));\r
\r
// logs "User: Alice Active: true"\r
state.active = true;\r
\`\`\`\r
\r
### Watch nested paths (JavaScript)\r
\r
\`\`\`js\r
import { observable } from 'asljs-observable';\r
\r
const state = observable({ user: { name: 'Alice' }, active: false });\r
\r
state.watch(\r
  [ 'user.name', 'active' ],\r
  (userName, active) =>\r
    console.log('User:', userName, 'Active:', active));\r
\r
state.user.name = 'Bob';\r
\`\`\`\r
\r
### Watching an object's property (TypeScript)\r
\r
\`\`\`ts\r
import { observable, type Observable } from 'asljs-observable';\r
\r
const obj: Observable<{ name: string }> =\r
  observable({ name: 'Alice' });\r
\r
obj.watch(\r
  'name',\r
  name => console.log(name));\r
\`\`\`\r
\r
### Observable class (TypeScript)\r
\r
\`\`\`ts\r
import { ObservableObject } from 'asljs-observable';\r
\r
class User\r
  extends ObservableObject<{ name: string }>\r
{\r
  #name: string;\r
\r
  constructor(name: string) {\r
    super();\r
\r
    this.#name = name;\r
  }\r
\r
  get name() {\r
    return this.#name;\r
  }\r
\r
  set name(value: string) {\r
    this.setAndEmit(\r
      'name',\r
      this.#name,\r
      value,\r
      next => {\r
        this.#name = next;\r
      });\r
  }\r
}\r
\`\`\`\r
\r
## API Reference\r
\r
### \`observable(value, [options])\`\r
\r
Wraps an object, array, or primitive to make it observable.\r
\r
- \`value\`: Target object/array/primitive to observe.\r
- \`options.eventful\` (optional): Custom \`eventful\` factory (defaults to \`asljs-eventful\`).\r
- \`options.trace\` (optional): Trace hook \`(object, action, payload)\` invoked on \`'new'\`, \`'set'\`, \`'delete'\`, \`'define'\`.\r
- \`options.shallow\` (optional): Nested conversion mode.\r
  - \`false\` (default): recursively converts nested objects and arrays.\r
  - \`true\`: converts only the top-level value.\r
\r
Returns the original value wrapped with Eventful API and change notifications.\r
When the target object does not already have a \`watch\` method, observable adds a\r
non-enumerable \`watch(properties, callback)\` method to the wrapped object.\r
\r
### \`observable.watch(target, properties, callback)\`\r
\r
Watches one or more properties/paths and invokes callback with current values.\r
\r
- \`properties\` can be a single path string (e.g. \`'user.name'\`) or an array\r
  of path strings.\r
\r
- Runs the callback immediately with current values.\r
- Re-runs callback each time one of the selected \`set:<propertyOrPath>\` events\r
  fires.\r
- Nested paths are supported, e.g. \`'user.name'\`.\r
- \`target\` may be a plain object; callback still runs immediately with a\r
  snapshot.\r
- Updates are observed only where an eventful segment exists along the watched\r
  path.\r
- Arrays are not supported by \`watch\` yet and will throw \`TypeError\`.\r
- Returns an unsubscribe function. Calling it removes all listeners attached by\r
  this \`watch\` call.\r
\r
### Events and payloads\r
\r
More concrete events are emitted first, followed by more generic ones.\r
E.g., setting \`obj.a\` emits \`set:a\` first, then \`set\`.\r
\r
Objects emit:\r
\r
- \`set\` and \`set:<property>\`: \`{ property, value, previous }\`\r
- \`delete\` and \`delete:<property>\`: \`{ property, previous }\`\r
- \`define\` and \`define:<property>\`: \`{ property, descriptor, previous }\`\r
\r
For arrays:\r
\r
- index changes (\`arr[0] = x\`, \`delete arr[1]\`) emit payloads with numeric\r
  \`index\`.\r
- non-index properties (including \`'length'\` and custom properties) emit\r
  payloads with string \`property\`.\r
- \`define\` / \`define:<property>\` are emitted only for non-index properties.\r
\r
Primitives (boxed as \`{ value }\`) emit:\r
\r
- \`set\` and \`set:value\`: \`{ property: 'value', value, previous }\`\r
\r
## License\r
\r
MIT License. See [LICENSE](LICENSE.md) for details.\r
\r
[#1]: https://github.com/AlexandriteSoftware/asljs\r
`,vt=`# eventful\r
\r
> Part of [Alexandrite Software Library][#1] – a set of high‑quality,\r
performant JavaScript libraries for everyday use.\r
\r
Lightweight event helper adding on/off/emit to any object.\r
\r
## Installation\r
\r
\`\`\`bash\r
npm install asljs-eventful\r
\`\`\`\r
\r
NPM Package: [asljs-eventful](https://www.npmjs.com/package/asljs-eventful)\r
\r
## Usage\r
\r
### Basic (JavaScript)\r
\r
Adding events to an object, add listeners, and emit events:\r
\r
\`\`\`js\r
import { eventful } from 'asljs-eventful';\r
\r
const obj = eventful({ name: 'Alice' });\r
\r
obj.on('greet',\r
  msg => console.log(\`\${msg}, \${obj.name}!\`));\r
 \r
// writes "Hello, Alice!" to console\r
obj.emit('greet', 'Hello');\r
\`\`\`\r
\r
### Basic (TypeScript)\r
\r
\`\`\`ts\r
import { eventful, type Eventful } from 'asljs-eventful';\r
\r
type Events =\r
  { greet: [msg: string] };\r
\r
const obj: { name: string } & Eventful<Events> =\r
  eventful({ name: 'Alice' });\r
\r
obj.on('greet',\r
  msg => console.log(\`\${msg}, \${obj.name}!\`));\r
\r
// writes "Hello, Alice!" to console\r
obj.emit('greet', 'Hello');\r
\`\`\`\r
\r
### Inheritance (JavaScript)\r
\r
Adding events to a class via inheritance:\r
\r
\`\`\`js\r
import { EventfulBase } from 'asljs-eventful';\r
\r
class MyClass extends EventfulBase {\r
  constructor(name) {\r
    super();\r
\r
    this.name = name;\r
  }\r
\r
  greet() {\r
    this.emit(\r
      'greet',\r
      \`Hello, \${this.name}\`);\r
  }\r
}\r
\`\`\`\r
\r
### Inheritance (TypeScript)\r
\r
\`\`\`ts\r
import { EventfulBase } from 'asljs-eventful';\r
\r
class MyClass extends EventfulBase {\r
  name: string;\r
\r
  constructor(name: string) {\r
    super();\r
\r
    this.name = name;\r
  }\r
\r
  greet() {\r
    this.emit(\r
      'greet',\r
      \`Hello, \${this.name}\`);\r
  }\r
}\r
\`\`\`\r
\r
### Construction (JavaScript)\r
\r
Adding events to an existing class during construction:\r
\r
\`\`\`js\r
import { eventful } from 'asljs-eventful';\r
\r
export class MyClass {\r
  constructor(name) {\r
    eventful(this);\r
\r
    this.name = name;\r
  }\r
\r
  greet() {\r
    this.emit(\r
      'greet',\r
      \`Hello, \${this.name}\`);\r
  }\r
}\r
\`\`\`\r
\r
### Construction (TypeScript)\r
\r
\`\`\`ts\r
import { eventful, type Eventful } from 'asljs-eventful';\r
\r
type MyClassEvents =\r
  { greet: [message: string]; };\r
\r
export class MyClass implements Eventful<MyClassEvents> {\r
  name: string;\r
\r
  declare on: Eventful<MyClassEvents>['on'];\r
  declare once: Eventful<MyClassEvents>['once'];\r
  declare off: Eventful<MyClassEvents>['off'];\r
  declare emit: Eventful<MyClassEvents>['emit'];\r
  declare emitAsync: Eventful<MyClassEvents>['emitAsync'];\r
  declare has: Eventful<MyClassEvents>['has'];\r
\r
  constructor(name: string) {\r
    eventful(this);\r
\r
    this.name = name;\r
  }\r
\r
  greet() {\r
    this.emit(\r
      'greet',\r
      \`Hello, \${this.name}\`);\r
  }\r
}\r
\`\`\`\r
\r
### Advanced Options\r
\r
Trace event invocations to console:\r
\r
\`\`\`js\r
const obj =\r
  eventful(\r
    { },\r
    { trace:\r
        (action, payload) => {\r
          console.log(\r
            \`Action: \${action}\`,\r
            payload);\r
        } });\r
\r
// Tracing (event, payload):\r
// - 'new' on creation, { object }\r
// - 'on' when subscribing, { object, event, listener }\r
// - 'off' when unsubscribing, { object, event, listener }\r
// - 'emit' for sync emit, { object, event, args, listeners }\r
// - 'emitAsync' for async emit, { object, event, args, listeners }\r
\`\`\`\r
\r
Custom error handler for listener errors:\r
\r
\`\`\`js\r
const obj =\r
  eventful(\r
    { },\r
    { error:\r
        ({ error, object, event, listener }) => {\r
          console.error(\r
            \`Error in listener for event "\${event}"\`,\r
            error);\r
        } });\r
\`\`\`\r
\r
Strict mode to propagate listener errors:\r
\r
\`\`\`js\r
const obj =\r
  eventful(\r
    { },\r
    { strict: true });\r
\`\`\`\r
\r
### Global Events\r
\r
\`eventful\` is also a global emitter. When you create an enhanced object via\r
\`eventful(target, options)\`, its lifecycle and actions are traced via the\r
per-instance \`trace\` hook and also emitted as global events on \`eventful\`.\r
\r
\`\`\`js\r
const offNew =\r
  eventful.on(\r
    'new',\r
    ({ object }) => {\r
      console.log('created', object);\r
    });\r
\r
const offError =\r
  eventful.on(\r
    'error',\r
    ({ error, object, event }) => {\r
      console.error('listener error', event, error);\r
    });\r
\r
// Later\r
offNew();\r
offError();\r
\`\`\`\r
\r
Note: if a **global** \`eventful.on('error', ...)\` listener throws, \`eventful\`\r
throws a \`ListenerError\` (an \`Error\` subclass with fields\r
\`{ error, object, event, listener }\`) to avoid an infinite error loop.\r
\r
## API\r
\r
### eventful([target], [options])\r
\r
Wraps the \`target\` object with event capabilities. If no target is provided,\r
a new empty object is created.\r
\r
- \`target\` (Object): The object to be enhanced with event capabilities.\r
- \`options\` (Object): Configuration options.\r
  - \`error\` (Function | null): Optional error hook called with\r
    \`{ error, object, event, listener }\`.\r
  - \`trace\` (Function | null): Optional trace hook called with\r
    \`(action, payload)\`.\r
  - \`strict\` (Boolean): If true, propagates listener errors; otherwise they\r
    are isolated. Defaults to false.\r
\r
### on(event, listener)\r
\r
Registers a listener for the specified event.\r
\r
- \`event\` (String | Symbol): The event name.\r
- \`listener\` (Function): The callback function to be invoked when the event is\r
  emitted.\r
\r
Returns a function to remove the listener.\r
\r
### once(event, listener)\r
\r
Registers a one-time listener for the specified event. The listener is removed\r
after its first invocation.\r
\r
- \`event\` (String | Symbol): The event name.\r
- \`listener\` (Function): The callback function to be invoked when the event is\r
  emitted.\r
\r
Returns a function to remove the listener.\r
\r
Example:\r
\r
\`\`\`js\r
obj.once(\r
  'tick',\r
  n => console.log('first only', n));\r
\r
obj.emit('tick', 1); // logs\r
obj.emit('tick', 2); // no-op; already unsubscribed\r
\`\`\`\r
\r
### off(event, listener)\r
\r
Removes a listener for the specified event.\r
\r
- \`event\` (String | Symbol): The event name.\r
- \`listener\` (Function): The callback function to be removed.\r
\r
### emit(event, ...args)\r
\r
Emits the specified event, invoking all registered listeners with the provided\r
arguments.\r
\r
- \`event\` (String | Symbol): The event name.\r
- \`...args\` (Any): Arguments to pass to the listeners.\r
\r
### emitAsync(event, ...args)\r
\r
Emits the specified event asynchronously, running listeners in parallel.\r
In non-strict mode, all listeners run and rejections are isolated; in strict\r
mode, the first rejection causes the returned promise to reject.\r
\r
- \`event\` (String | Symbol): The event name.\r
- \`...args\` (Any): Arguments to pass to the listeners.\r
\r
Returns a Promise that resolves when all listeners have been invoked.\r
\r
### has(event)\r
\r
Checks if there are any listeners registered for the specified event.\r
\r
- \`event\` (String | Symbol): The event name.\r
\r
Returns \`true\` if there are listeners, otherwise \`false\`.\r
\r
Example:\r
\r
\`\`\`js\r
const off =\r
  obj.on('e', () => {});\r
\r
console.log(obj.has('e')); // true\r
off();\r
console.log(obj.has('e')); // false\r
\`\`\`\r
\r
## License\r
\r
MIT License. See [LICENSE](LICENSE.md) for details.\r
\r
[#1]: https://github.com/AlexandriteSoftware/asljs\r
`,bt=`# data-binding\r
\r
> Part of [Alexandrite Software Library][#1] - a set of high-quality,\r
performant JavaScript libraries for everyday use.\r
\r
## Overview\r
\r
\`asljs-data-binding\` provides declarative DOM bindings using explicit\r
\`data-bind-*\` attributes. Bindings are applied with\r
\`bindDataModel(root, model, options?)\`.\r
\r
There are three binding families:\r
\r
- Value bindings: write model values to \`textContent\`, \`innerHTML\`, or an\r
  attribute.\r
- Event bindings: wire DOM events to model actions.\r
- Context bindings: switch the model context for a descendant subtree.\r
\r
Both families support lightweight reactivity through \`observable.watch(...)\`\r
on the configured model path.\r
\r
## Installation\r
\r
\`\`\`bash\r
npm install asljs-data-binding\r
\`\`\`\r
\r
NPM Package:\r
[asljs-data-binding](https://www.npmjs.com/package/asljs-data-binding)\r
\r
## Usage\r
\r
\`\`\`ts\r
import {\r
    bindDataModel\r
  } from 'asljs-data-binding';\r
import {\r
    observable\r
  } from 'asljs-observable';\r
\r
const root =\r
  document.body;\r
\r
const model =\r
  observable(\r
    { user:\r
        { name: 'Alex' },\r
      save: () => {\r
        console.log('saved');\r
      } });\r
\r
const dispose =\r
  bindDataModel(\r
    root,\r
    model,\r
    {\r
      pipes:\r
        { yesno: value => value ? 'Yes' : 'No' }\r
    });\r
\r
// later:\r
dispose();\r
\`\`\`\r
\r
Example bindings:\r
\r
\`\`\`html\r
<div data-bind-text="user.name"></div>\r
<div data-bind-text="user.active | yesno"></div>\r
<div data-bind-html="body | wrap:'<span>':'</span>'"></div>\r
<button data-bind-onclick="save">Save</button>\r
\`\`\`\r
\r
Use \`data-bind-context\` to switch the model context for a subtree:\r
\r
\`\`\`html\r
<div data-bind-context="user">\r
  <h1 data-bind-text="name"></h1>\r
  <button data-bind-onclick="save">Save</button>\r
</div>\r
\`\`\`\r
\r
Multiple bindings on the same element are supported and preferred when they\r
describe different concerns:\r
\r
\`\`\`html\r
<a\r
  data-bind-href="url"\r
  data-bind-text="label | upper"\r
  data-bind-class-active="isActive"\r
  data-bind-onclick="openDetails"\r
></a>\r
\`\`\`\r
\r
## Binding Syntax\r
\r
### Context binding\r
\r
\`data-bind-context\` switches the model context for the entire descendant\r
subtree.\r
\r
General form:\r
\r
\`\`\`text\r
data-bind-context="path"\r
\`\`\`\r
\r
The \`path\` is resolved against the current model. The resulting object becomes\r
the model context for all descendant bindings.\r
\r
Example — binding to a nested object:\r
\r
\`\`\`html\r
<div data-bind-context="user">\r
  <h1 data-bind-text="name"></h1>\r
  <span data-bind-text="email"></span>\r
</div>\r
\`\`\`\r
\r
This is equivalent to writing \`user.name\` and \`user.email\` on the descendants\r
without the context switch.\r
\r
Nested \`data-bind-context\` attributes stack naturally:\r
\r
\`\`\`html\r
<div data-bind-context="item">\r
  <div data-bind-context="author">\r
    <span data-bind-text="name"></span>\r
  </div>\r
</div>\r
\`\`\`\r
\r
Here \`name\` resolves relative to \`item.author\`.\r
\r
Reactivity:\r
\r
- \`data-bind-context\` watches its path on the parent context\r
- when the context object is replaced, all descendant bindings are rebound\r
  against the new context\r
- stale watchers from the old context are removed\r
\r
Null/undefined context:\r
\r
- if the path resolves to \`null\` or \`undefined\`, descendant bindings degrade\r
  gracefully following the existing nullish conventions (empty text, removed\r
  attributes, action warnings)\r
- if the context later becomes a non-null object, descendants become active\r
  again\r
\r
### Value bindings\r
\r
General form:\r
\r
\`\`\`text\r
data-bind-<target>="path[ | pipe[:arg1[:arg2...]]]*"\r
\`\`\`\r
\r
Pipe arguments can be quoted when they contain characters like \`:\`.\r
\r
\`\`\`text\r
data-bind-html="content | wrap:'<span>':'</span>'"\r
\`\`\`\r
\r
Supported targets:\r
\r
- \`data-bind-text\` -> \`textContent\`\r
- \`data-bind-html\` -> \`innerHTML\`\r
- \`data-bind-<attr>\` -> HTML attribute (for example \`href\`, \`title\`,\r
  \`aria-label\`)\r
- \`data-bind-prop-<name>\` -> DOM property (for example \`value\`, \`checked\`)\r
- \`data-bind-class-<name>\` -> class toggle by truthy/falsy value\r
\r
Examples:\r
\r
\`\`\`html\r
<div data-bind-text="name"></div>\r
<div data-bind-text="name | upper"></div>\r
<div data-bind-text="createdAt | date:short"></div>\r
<div data-bind-text="amount | currency:GBP"></div>\r
<div data-bind-html="content | wrap:'<span>':'</span>'"></div>\r
<a data-bind-href="url"></a>\r
<input data-bind-prop-value="name">\r
<button data-bind-class-active="isSelected"></button>\r
<div data-bind-html="body | safeHtml"></div>\r
\`\`\`\r
\r
Reactivity for value bindings:\r
\r
- depends only on \`path\`\r
- subscribes to updates for that path\r
- pipe args are static strings and are not reactive\r
\r
### Event bindings\r
\r
General form:\r
\r
\`\`\`text\r
data-bind-on<event>="actionPath"\r
\`\`\`\r
\r
Examples:\r
\r
\`\`\`html\r
<button data-bind-onclick="activate"></button>\r
<a data-bind-onclick="openDetails"></a>\r
<form data-bind-onsubmit="save"></form>\r
\`\`\`\r
\r
Runtime behavior:\r
\r
- \`data-bind-onclick\` listens to \`click\`, \`data-bind-onsubmit\` listens to\r
  \`submit\`, etc.\r
- action is resolved from model by \`actionPath\`\r
- when action is a function, it is invoked as \`(event, model, element)\`\r
- missing or non-function actions emit warnings and keep binding alive\r
\r
Reactivity for event bindings:\r
\r
- depends only on \`actionPath\`\r
- subscribes to updates for that path\r
- handler reference refreshes when action changes\r
\r
## Built-ins\r
\r
Value pipes:\r
\r
- \`string\`\r
- \`number\`\r
- \`currency[:code]\`\r
- \`date[:format]\`\r
- \`datetime[:format]\`\r
- \`fixed[:digits]\`\r
- \`upper\`\r
- \`lower\`\r
- \`json[:spaces]\`\r
- \`default:value\`\r
- \`safeHtml\`\r
\r
Locale behavior:\r
\r
- by default, \`Intl\` pipes use runtime/browser locale settings\r
- to force a locale, compose custom pipes using \`createBuiltInPipes('en-GB')\`\r
  in your own implementation\r
\r
## Error Handling\r
\r
- unknown pipe: throws\r
- pipe error: exception from pipe propagates\r
- missing/non-function action: warning, binding continues\r
\r
Nullish behavior:\r
\r
- built-in pipes preserve \`null\` and \`undefined\` values\r
- \`data-bind-text\` and \`data-bind-html\` render \`null\`/\`undefined\` as \`''\`\r
- \`data-bind-<attr>\` removes the attribute when final value is \`null\` or\r
  \`undefined\`\r
\r
## API Reference\r
\r
Core API:\r
\r
- \`bindDataModel(root, model, options)\`\r
\r
Types are exported from:\r
\r
- \`BindDataModelOptions\`\r
- \`DataModel\`\r
\r
## License\r
\r
MIT License. See [LICENSE](LICENSE.md) for details.\r
\r
[#1]: https://github.com/AlexandriteSoftware/asljs\r
`,yt=`# AI

AI guidance for using \`asljs-components\` in generated or modified code.

## Purpose

Use this file as the AI-facing equivalent of README:

- what this package provides,
- what patterns are preferred,
- what constraints must be preserved when applying changes.

## Package Scope

Current exported component(s):

- \`List\` custom element (\`asljs-list\`)

Exports from \`src/index.ts\`:

- \`List\`
- \`ListItem\`
- \`ListItemsSource\`
- \`ListRowContext\`

## Preferred Usage Patterns

### 1. Register components once

\`\`\`ts
import 'asljs-components';
\`\`\`

Create and configure elements through standard DOM APIs.

### 2. Provide templates through data slots

Use \`template[data-slot]\` children inside \`asljs-list\`:

- required for non-empty rendering:
  - \`template[data-slot="item"]\`
- optional:
  - \`template[data-slot="empty"]\`
  - \`template[data-slot="container"]\` (must include \`[data-role="items"]\`)

If \`items\` is non-empty and \`item\` slot is missing, component warns and renders
nothing.

### 3. Use row bindings via \`asljs-data-binding\`

Supported row binding context fields:

- \`item\`
- \`index\`
- \`first\`
- \`last\`
- \`odd\`
- \`even\`
- \`count\`
- \`context\`

Prefer path-based binding expressions:

- values: \`item.title\`, \`index\`, \`context.label\`
- events: \`context.select\`, \`item.onClick\`

### 4. Use \`list.context\` for shared row actions/state

\`List.context\` is a shared base context value. During row rendering, the list
creates a row-local derived context and exposes it at \`context\` in bindings.

For object contexts:

- derived row context carries row-specific \`item\` and \`index\`,
- own function members from base context are bound to the derived row context,
- methods like \`context.select\` can use \`this.item\` safely.

Example:

\`\`\`ts
import 'asljs-components';

const list = document.createElement('asljs-list');

list.context = {
  select(this: { item: { id: string; title: string } }, event: Event) {
    event.preventDefault();
    console.log(this.item.id, this.item.title);
  }
};

list.innerHTML = \`
  <template data-slot="item">
    <button data-bind-text="item.title"
            data-bind-onclick="context.select"></button>
  </template>
\`;

list.items = [
  { id: 'a', title: 'First' },
  { id: 'b', title: 'Second' }
];
\`\`\`

## Event Binding Constraints

When producing AI-generated code that uses \`asljs-data-binding\` event bindings,
preserve this contract:

- \`data-bind-on*\` resolves a function from a path and registers it as listener.
- Do not add parameter-expression syntax.
- Do not introduce \`*-args\`, \`*-param\`, or function-call binding expressions.

If row-specific data is required by handlers, use \`context\` + \`this\` pattern.

## Observable Items Pattern

\`List.items\` can be plain array or observable/eventful-like collection.
When an eventful-like source emits \`set\`, \`delete\`, or \`define\`, list requests
rerender.

AI should:

- keep collection updates deterministic,
- avoid mutating template structure at runtime,
- prefer updating \`items\`/collection state over imperative DOM rewrites.

## Do And Do-Not Checklist

Do:

- keep templates declarative,
- keep event bindings path-based,
- keep container slot compliant with \`[data-role="items"]\`.

Do not:

- bypass \`template[data-slot="item"]\` for row rendering,
- rely on implicit global handlers,
- add custom invocation protocol for bindings.

## Maintenance Task Reference

When implementation changes in \`components/src/\` affect usage, update:

- README for developer-facing docs,
- this file (\`components/AI.md\`) for AI-facing usage guidance.\r
`,wt=`# dali\r
\r
> Part of [Alexandrite Software Library][#1] - a set of high-quality,\r
performant JavaScript libraries for everyday use.\r
\r
## Overview\r
\r
\`asljs-dali\` is a data layer for apps that store data in IndexedDB. It is for\r
developers who want a typed, event-aware table abstraction instead of\r
hand-writing low-level request and transaction plumbing. Use it to model\r
stores as \`Table<T>\`, keep CRUD operations consistent, and optionally enforce\r
optimistic concurrency with version strategies.\r
\r
## Installation\r
\r
\`\`\`bash\r
npm install asljs-dali\r
\`\`\`\r
\r
NPM Package: [asljs-dali](https://www.npmjs.com/package/asljs-dali)\r
\r
## Usage\r
\r
\`\`\`ts\r
import {\r
    dbOpen,\r
    Table,\r
  } from 'asljs-dali';\r
\r
type Note =\r
  { id: string;\r
    title: string; };\r
\r
const db =\r
  await dbOpen(\r
    'notes-db',\r
    [ targetDb => {\r
        targetDb.createObjectStore(\r
          'notes',\r
          { keyPath: 'id' });\r
      } ]);\r
\r
const notes =\r
  new Table<Note>(\r
    'notes',\r
    db,\r
    { /* options */ });\r
\r
await notes.add(\r
  { id: '1',\r
    title: 'Hello' });\r
\r
const row =\r
  await notes.getOne('1');\r
\`\`\`\r
\r
### Cross-tab notifications with \`observe()\`\r
\r
\`Table\` supports two notification paths:\r
\r
| Method | Who calls the callback |\r
|---|---|\r
| \`notify(receiver)\` | Local writes committed by **this** Table instance only |\r
| \`observe(receiver)\` | Local writes **and** remote writes from other tabs |\r
\r
Pass a \`broadcastService\` to the Table constructor to enable cross-tab delivery.\r
The service is an abstraction — you can implement it with \`BroadcastChannel\` or\r
any equivalent transport.\r
\r
\`\`\`ts\r
import {\r
    type TableBroadcastMessage,\r
    type TableBroadcastService,\r
  } from 'asljs-dali';\r
\r
// BroadcastChannel-backed implementation\r
function makeBroadcastService(\r
    channelName: string\r
  ): TableBroadcastService\r
{\r
  const channel = new BroadcastChannel(channelName);\r
\r
  return {\r
    publish(message: TableBroadcastMessage) {\r
      channel.postMessage(message);\r
    },\r
    subscribe(handler) {\r
      const listener = (ev: MessageEvent) => handler(ev.data);\r
      channel.addEventListener('message', listener);\r
      return () => channel.removeEventListener('message', listener);\r
    },\r
  };\r
}\r
\r
const notes =\r
  new Table<Note>(\r
    'notes',\r
    db,\r
    { broadcastService: makeBroadcastService('notes-sync') });\r
\r
// Local-only — fires only for writes made by this Table instance.\r
notes.notify(\r
  { add(record) { console.log('local add', record); } });\r
\r
// Observed — fires for both local and remote writes.\r
// The \`source\` field tells you where the change came from.\r
const unobserve =\r
  notes.observe(event => {\r
    console.log(event.source, event.eventType);\r
    if (event.eventType === 'add')\r
      console.log(event.record);\r
  });\r
\r
// When the Table is no longer needed, dispose it to stop listening.\r
notes.dispose();\r
\`\`\`\r
\r
**Design rules:**\r
\r
- Broadcast messages are published **only after** a successful IndexedDB\r
  transaction; rolled-back or provisional changes are never broadcast.\r
- A Table instance **discards its own echoed messages** using a per-instance\r
  \`originId\` included in every broadcast message.\r
- Remote messages are routed only to \`observe()\` subscribers; local-only\r
  \`notify()\` subscribers are never called for remote events.\r
- A Table receiving a remote message **does not re-publish** it, preventing\r
  broadcast loops.\r
\r
### Live views with \`record()\` and \`recordset()\`\r
\r
\`Table\` provides **live-first** APIs that return reactive containers tracking\r
committed table changes automatically.  Both containers are built on\r
**ASLJS eventful** (for domain events) and **ASLJS observable** (for\r
property-path watching).\r
\r
#### \`Table.record(key)\` → \`LiveRecord<T>\`\r
\r
Returns a live single-record view for a specific primary key.\r
\r
\`\`\`ts\r
const live = notes.record('1');\r
\r
// Stable property — null until the initial load settles.\r
console.log(live.record); // { id: '1', title: 'Hello' } | null\r
\r
// Domain events via ASLJS eventful.\r
live.on('changed', (record, previous) => {\r
  console.log('record changed to', record, 'was', previous);\r
});\r
\r
live.on('deleted', previous => {\r
  console.log('record deleted, was', previous);\r
});\r
\r
// Property-path watching via ASLJS observable.\r
live.watch('record.title', title => {\r
  console.log('title is now', title);\r
});\r
\r
// Release the live view when no longer needed.\r
live.dispose();\r
\`\`\`\r
\r
Behaviour:\r
\r
- \`record\` is \`null\` until the initial database read settles.\r
- On \`add\` / \`update\` for the tracked key — \`record\` is updated and \`changed\`\r
  fires.\r
- On \`delete\` or \`clear\` — \`record\` becomes \`null\` and \`deleted\` fires.\r
- Unrelated changes on the same table do not affect this view.\r
- \`watch(path, cb)\` is called immediately with the current value and again\r
  whenever the path changes.  Watchers are anchored to the stable container.\r
\r
> **Snapshot read**: use \`table.getOne(key)\` instead.\r
>\r
> **Limitation**: \`record(key)\` is limited to key-only semantics.\r
\r
#### \`Table.recordset(predicate)\` → \`LiveRecordSet<T>\`\r
\r
Returns a live filtered set view for records matching a client-side predicate.\r
\r
\`\`\`ts\r
const live = notes.recordset(note => note.title.startsWith('A'));\r
\r
// Stable property — a readonly array snapshot.\r
console.log(live.records); // readonly Note[]\r
\r
// Domain events via ASLJS eventful.\r
live.on('added',   record          => console.log('added',   record));\r
live.on('removed', record          => console.log('removed', record));\r
live.on('updated', (record, prev)  => console.log('updated', record, prev));\r
live.on('cleared', ()              => console.log('cleared'));\r
live.on('changed', records         => console.log('set now has', records.length));\r
\r
// Property-path watching via ASLJS observable.\r
live.watch('records', records => {\r
  console.log('count:', (records as readonly Note[]).length);\r
});\r
\r
live.dispose();\r
\`\`\`\r
\r
Behaviour:\r
\r
- On initial creation the table is scanned and all matching records are loaded.\r
- On \`add\` — the record is included if the predicate returns \`true\`; \`added\`\r
  fires.\r
- On \`update\` — membership is re-evaluated; \`added\`, \`updated\`, or \`removed\`\r
  fires accordingly.\r
- On \`delete\` — the record is removed if it was present; \`removed\` fires.\r
- On \`clear\` — the set is emptied and \`cleared\` fires.\r
- \`changed\` fires after every mutation.\r
\r
> **Snapshot read**: use \`table.scan(predicate)\` instead.\r
>\r
> **Limitation**: \`recordset(predicate)\` is limited to client-side predicate\r
> semantics. Joins, ordering, and DB-level query composition are not supported.\r
\r
## API Reference\r
\r
Core:\r
\r
- \`dbOpen(name, upgrades)\`\r
- \`dbDelete(name)\`\r
- \`dbRequestAsync(request)\`\r
- \`Table<T>\`\r
\r
Live views:\r
\r
- \`LiveRecord<T>\` — live single-record container returned by \`Table.record(key)\`\r
  - Events (ASLJS eventful): \`changed\`, \`deleted\`\r
  - Watch (ASLJS observable): \`record.someField\`\r
- \`LiveRecordSet<T>\` — live filtered set container returned by \`Table.recordset(predicate)\`\r
  - Events (ASLJS eventful): \`added\`, \`removed\`, \`updated\`, \`cleared\`, \`changed\`\r
  - Watch (ASLJS observable): \`records\`, \`records.length\`\r
- \`LiveRecordEvents<T>\` — event map type for \`LiveRecord\`\r
- \`LiveRecordSetPayload<T>\` — \`set:record\` / \`set\` event payload for \`LiveRecord\`\r
- \`LiveRecordSetEvents<T>\` — event map type for \`LiveRecordSet\`\r
- \`LiveRecordSetSetPayload<T>\` — \`set:records\` / \`set\` event payload for \`LiveRecordSet\`\r
\r
Versioning:\r
\r
- \`TableVersionStrategy<T>\`\r
- \`TableVersionConflictError\`\r
- \`IncrementTableVersionStrategy<T>\`\r
- \`UuidTableVersionStrategy<T>\`\r
\r
Delete strategies:\r
\r
- \`TableDeleteStrategy<T>\`\r
- \`UuidSoftDeleteTableDeleteStrategy<T>\`\r
\r
Transactions:\r
\r
- \`TxMode\`\r
- \`txRead(db, storeName, tx?)\`\r
- \`txWrite(db, storeName, tx?)\`\r
- \`txDone(tx)\`\r
- \`txEnsure(tx, storeName, mode)\`\r
- \`txReuseOrCreate(tx, storeNames, mode, db)\`\r
\r
Broadcast / cross-tab:\r
\r
- \`TableBroadcastService\` — interface for the publish/subscribe transport\r
- \`TableBroadcastMessage\` — message shape published on every committed change\r
- \`TableObservedEvent<T>\` — event delivered to \`observe()\` subscribers\r
- \`TableObservedReceiver<T>\` — callback type for \`observe()\`\r
\r
## License\r
\r
MIT License. See [LICENSE](LICENSE.md) for details.\r
\r
[#1]: https://github.com/AlexandriteSoftware/asljs\r
`,cn=`
You are an expert ASLJS app generator.

The generated app is a showcase of ASLJS libraries. Use ALL of these packages in useful, visible ways:

- asljs-eventful
- asljs-observable
- asljs-data-binding
- asljs-components
- asljs-dali

Response requirements:
- Use tool calls for file and runtime operations.
- Do not return a full files JSON snapshot.
- Return a short plain-text summary only after updates are complete.

Input interpretation rules:
- Treat user input as an app modification request by default.
- If user input looks command-like (for example: "add", "change", "replace", "remove", "rename", "fix", "update", "move", "create"), interpret it as instructions to modify the existing project files.
- If user input looks like project artifacts or descriptive specs (feature bullets, acceptance criteria, user stories, TODO lists, changelog-style notes, issue-like descriptions, README snippets, architecture notes), treat it as actionable requirements to implement in the current app.
- Do not just echo or summarize artifact-like input; apply it as code/file changes unless the user explicitly asks only for explanation.
- Prefer incremental edits to existing files over full rewrites when handling these requests.

README source-of-truth rules:
- Treat README.md as the current project specification/source of truth by default.
- At the start of each task, read README.md (if present) and use it as context for expected behavior, constraints, and usage.
- If a direct user request conflicts with README.md, follow the user request and then update README.md to match the new behavior.
- If behavior changes due to implementation updates, update README.md so it stays accurate.
- Do not add changelog/update-log sections to README.md unless the user explicitly requests one.

Tool-first generation protocol (stability-first):
- Always work in small, incremental steps:
  1) inspect current files/state,
  2) edit one focused thing,
  3) verify app behavior,
  4) fix issues,
  5) repeat until stable.
- Prefer targeted updates (replace specific file parts) over full rewrites.
- Use setFileContent only when replaceFilePart is not suitable.
- Verify each major change using evalInApp and diagnostics tools.
- Use JSON only for explicit import/export content handled by the app itself.

Generation rules:
- Always include at least: index.html, style.css, app.js, package.json, README.md.
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

Agent tool contract (virtual filesystem and runtime):
- Assume the generated app includes an agent that can use these tools:
  - listFileset(): returns all file paths in the virtual filesystem.
  - readFile(path): returns full text content for a file.
  - setFileContent(path, content): creates or replaces a file's content.
  - replaceFilePart(path, search, replacement, replaceAll?): replaces exact text in a file.
  - deleteFile(path): deletes a file from the virtual filesystem.
  - evalInApp(code): evaluates JavaScript in the context of the running app document.
  - getAppDiagnostics(): returns runtime logs and errors from the running app.
  - runAppAndCollectDiagnostics(): runs app and returns startup/runtime logs and errors.
- Generate app code and README so these tool names and behaviors are clear and usable.
- Keep the tool usage model deterministic and safe (no hidden magic paths).
- Runtime host context available to generated app:
  - window.__ASLJS_APP_BUILDER_HOST__?.openAiApiKey
  - Value is provided by host app settings; it may be null.

In-app agent update protocol:
- For normal edits, the in-app agent must update files through tools:
  - inspect with listFileset/readFile
  - modify with replaceFilePart first; use setFileContent for create/full replace
  - remove with deleteFile when appropriate
- JSON should be used only for explicit export/import workflows.

Run/repair loop requirements for the generated agent behavior:
- The agent must treat app.js as the starting point for the app runtime.
- After each generation pass, the agent must run the app and collect diagnostics using runAppAndCollectDiagnostics().
- If diagnostics report runtime errors, the agent must iteratively fix files and re-run diagnostics until errors are resolved.
- The agent should use getAppDiagnostics() and evalInApp(...) for targeted debugging checks between edits.
- The agent should verify implemented functionality through realistic interactions, not only static checks:
  - trigger click handlers,
  - fill form inputs,
  - submit forms,
  - and assert expected visible or state outcomes.
- The final generated code should reflect this workflow explicitly in app.js and/or README.

Use this package knowledge as source material when choosing APIs and patterns:

[eventful] guide:

${vt}

[observable] guide:

${gt}

[data-binding] guide:

${bt}

[components] guide:

${yt}

[dali] guide:

${wt}
`,Oe="asljs-app-builder:eval-request",dn="asljs-app-builder:eval-response",pn="asljs-app-builder:diagnostics-request",un="asljs-app-builder:diagnostics-response",Ge=`<script>
(() => {
  const REQUEST = '${Oe}';
  const RESPONSE = '${dn}';
  const DIAG_REQUEST = '${pn}';
  const DIAG_RESPONSE = '${un}';
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
<\/script>`;function Et(e,n,t){if(n.length===0){e.removeAttribute("srcdoc"),e.src="about:blank";return}const r=n.find(i=>i.name==="index.html")??n.find(i=>i.name.endsWith(".html"))??null;if(r===null){e.removeAttribute("srcdoc"),e.src="about:blank";return}let a=r.content;const s=n.find(i=>i.name==="style.css")??n.find(i=>i.name.endsWith(".css"))??null;s!==null&&(a=a.replace(/<link[^>]+href=["']style\.css["'][^>]*>/gi,`<style>${s.content}</style>`),a=a.replace(/<link[^>]+href=["']([^"']+\.css)["'][^>]*>/gi,`<style>${s.content}</style>`));for(const i of n){if(!i.name.endsWith(".js"))continue;const h=i.name.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");a=a.replace(new RegExp(`(<script[^>]*?)\\s+src=["']${h}["']([^>]*)><\\/script>`,"gi"),(A,g,d)=>{const v=`${String(g)} ${String(d)}`;return/type=["']module["']/i.test(v)?`<script type="module">${i.content}<\/script>`:`<script>${i.content}<\/script>`})}a=kt(a,n),a=Tt(a,t),a=xt(a),e.srcdoc=a}async function At(e,n){const t=await mn(e,Oe,{code:n},dn);if(t.ok===!0)return t.value;throw new Error(typeof t.error=="string"?t.error:"Unknown preview evaluation error.")}async function St(e){const n=await mn(e,pn,{},un);if(n.ok!==!0)throw new Error(typeof n.error=="string"?n.error:"Failed to read preview diagnostics.");return n.diagnostics??{logs:[],errors:[]}}async function mn(e,n,t,r){const a=e.contentWindow;if(a===null)throw new Error("Preview frame is not available.");const s=crypto.randomUUID();return new Promise((i,h)=>{const A=window.setTimeout(()=>{d(),h(new Error("Timed out waiting for app evaluation result."))},5e3),g=v=>{if(v.source!==a)return;const l=v.data;l.type!==r||l.id!==s||(d(),i(l))};function d(){window.clearTimeout(A),window.removeEventListener("message",g)}window.addEventListener("message",g),a.postMessage({type:n,id:s,...t},"*")})}function xt(e){return e.includes(Oe)?e:e.includes("</body>")?e.replace("</body>",`${Ge}</body>`):`${e}
${Ge}`}function kt(e,n){if(/type=["']importmap["']/i.test(e))return e;const t=n.find(i=>i.name==="package.json")??null,r=jt(t==null?void 0:t.content),a=Object.fromEntries(r.map(([i,h])=>[i,`https://esm.sh/${i}@${h}?bundle`]));if(Object.keys(a).length===0)return e;const s=`<script type="importmap">${JSON.stringify({imports:a})}<\/script>`;return/<head[^>]*>/i.test(e)?e.replace(/<head[^>]*>/i,i=>`${i}
${s}`):`${s}
${e}`}function jt(e){if(e===void 0)return Ve();try{const n=JSON.parse(e),t={...n.dependencies??{},...n.devDependencies??{}};return["asljs-eventful","asljs-observable","asljs-data-binding","asljs-components","asljs-dali","openai"].map(s=>[s,Lt(t[s])])}catch{return Ve()}}function Lt(e){if(typeof e!="string"||e.trim()==="")return"latest";const n=e.trim().replace(/^[~^<>=\s]+/,"");return n===""?"latest":n}function Ve(){return[["asljs-eventful","latest"],["asljs-observable","latest"],["asljs-data-binding","latest"],["asljs-components","latest"],["asljs-dali","latest"],["openai","latest"]]}function Tt(e,n){if(e.includes("__ASLJS_APP_BUILDER_HOST__"))return e;const t=`<script>window.__ASLJS_APP_BUILDER_HOST__ = ${JSON.stringify({openAiApiKey:(n==null?void 0:n.hostOpenAiApiKey)===void 0||n.hostOpenAiApiKey.trim()===""?null:n.hostOpenAiApiKey})};<\/script>`;return e.includes("</head>")?e.replace("</head>",`${t}</head>`):e.includes("<body")?e.replace(/<body[^>]*>/i,r=>`${r}
${t}`):`${t}
${e}`}function It(e){const n=e.selectElement;n.replaceChildren();const t=[...e.apps].sort((s,i)=>i.updatedAt.localeCompare(s.updatedAt));for(const s of t){const i=document.createElement("option");i.value=s.id,i.textContent=s.name,n.appendChild(i)}if(t.length>0){const s=document.createElement("option");s.value="__separator__",s.textContent="────────",s.disabled=!0,n.appendChild(s)}const r=document.createElement("option");r.value=e.newActionValue,r.textContent="New...",n.appendChild(r);const a=document.createElement("option");a.value=e.importActionValue,a.textContent="Import...",n.appendChild(a),e.currentAppId!==null&&(n.value=e.currentAppId)}function Ct(e){const n=e.selectElement;if(n.replaceChildren(),e.files.length===0){const r=document.createElement("option");r.value="",r.textContent="No files",n.appendChild(r),n.value="",n.disabled=!0;return}for(const r of e.files){const a=document.createElement("option");a.value=r.name,a.textContent=r.name,n.appendChild(a)}const t=e.activeFileName??e.files[0].name;n.value=t,n.disabled=!1}function Pt(e){const n=e.files.find(t=>t.name===e.activeFileName);e.textAreaElement.value=(n==null?void 0:n.content)??"",e.textAreaElement.disabled=n===void 0}function Ft(e,n){e.disabled=n,e.innerHTML=n?'<span class="spinner"></span> Sending…':"Send"}function Ot(e,n,t){e.textContent=n,e.classList.toggle("hidden",!t)}function Dt(e,n,t){const r=document.createElement("div");r.className=`chat-msg ${n}`;const a=document.createElement("div");a.className="chat-msg-role",a.textContent=n==="user"?"You":"Assistant";const s=document.createElement("div");s.className="chat-bubble",s.textContent=t,r.appendChild(a),r.appendChild(s),e.appendChild(r),e.scrollTop=e.scrollHeight}function fn(e){const n=!e.panelElement.classList.contains("collapsed");return e.toggleButtonElement.textContent=n?e.collapsedLabel:e.expandedLabel,e.toggleButtonElement.setAttribute("aria-expanded",n?"false":"true"),e.panelElement.classList.toggle("collapsed",n),e.panelsElement.classList.toggle(e.collapsedPanelsClass,n),n}function Nt(e,n){return[{id:n(),appId:e,name:"index.html",content:`<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>TODO Sample</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <main class="app">
    <h1>TODO Sample</h1>
    <form id="todo-form">
      <input id="todo-input" type="text" placeholder="What needs doing?" required />
      <button type="submit">Add</button>
    </form>
    <section class="list-section">
      <h2>Todo</h2>
      <ul id="todo-list" class="todo-list"></ul>
    </section>
    <section class="list-section">
      <h2>Done</h2>
      <ul id="done-list" class="todo-list"></ul>
    </section>
  </main>
  <script type="module" src="app.js"><\/script>
</body>
</html>`},{id:n(),appId:e,name:"style.css",content:`:root {
  color-scheme: light dark;
}

body {
  margin: 0;
  font-family: system-ui, sans-serif;
  background: #0b1220;
  color: #e7edf7;
}

.app {
  max-width: 560px;
  margin: 2rem auto;
  padding: 1rem;
  border: 1px solid #2b3954;
  border-radius: 8px;
  background: #121b2d;
}

#todo-form {
  display: flex;
  gap: 0.5rem;
}

#todo-input {
  flex: 1;
  padding: 0.5rem;
}

.list-section {
  margin-top: 1rem;
}

.list-section h2 {
  margin: 0 0 0.5rem;
  font-size: 1rem;
}

.todo-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0.5rem;
}

.todo-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.5rem 0.6rem;
  border: 1px solid #2b3954;
  border-radius: 6px;
  background: #0f1a2f;
}

.todo-main {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
}

.todo-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.done .todo-text {
  text-decoration: line-through;
  opacity: 0.75;
}

.bin-btn {
  border: 1px solid #3b4e7a;
  background: transparent;
  color: #e7edf7;
  border-radius: 6px;
  padding: 0.35rem 0.5rem;
  cursor: pointer;
}

.check-btn {
  border: 1px solid #3b4e7a;
  background: #1b2b4b;
  color: #e7edf7;
  border-radius: 6px;
  padding: 0.35rem 0.55rem;
  cursor: pointer;
}

.todo-empty {
  color: #9fb2d8;
  font-size: 0.9rem;
  padding: 0.25rem 0;
}`},{id:n(),appId:e,name:"app.js",content:`const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');
const doneList = document.getElementById('done-list');

if (!(form instanceof HTMLFormElement)
    || !(input instanceof HTMLInputElement)
    || !(list instanceof HTMLUListElement)
    || !(doneList instanceof HTMLUListElement))
{
  throw new Error('Missing TODO app elements.');
}

const state = {
  todos: [],
  done: [],
};

function uid() {
  return crypto.randomUUID();
}

function render() {
  list.replaceChildren();
  doneList.replaceChildren();

  for (const todo of state.todos) {
    const item = document.createElement('li');
    item.className = 'todo-item';

    const main = document.createElement('div');
    main.className = 'todo-main';

    const text = document.createElement('span');
    text.className = 'todo-text';
    text.textContent = todo.text;

    const actions = document.createElement('div');

    const checkButton = document.createElement('button');
    checkButton.type = 'button';
    checkButton.className = 'check-btn';
    checkButton.textContent = '✓';
    checkButton.title = 'Mark done';
    checkButton.addEventListener('click', () => {
      state.todos = state.todos.filter(entry => entry.id !== todo.id);
      state.done.unshift(todo);
      render();
    });

    main.appendChild(checkButton);
    main.appendChild(text);

    const bin = document.createElement('button');
    bin.type = 'button';
    bin.className = 'bin-btn';
    bin.textContent = '🗑';
    bin.title = 'Delete todo';
    bin.addEventListener('click', () => {
      state.todos = state.todos.filter(entry => entry.id !== todo.id);
      render();
    });

    actions.appendChild(checkButton);
    actions.appendChild(bin);

    item.appendChild(main);
    item.appendChild(actions);
    list.appendChild(item);
  }

  for (const todo of state.done) {
    const item = document.createElement('li');
    item.className = 'todo-item done';

    const main = document.createElement('div');
    main.className = 'todo-main';

    const text = document.createElement('span');
    text.className = 'todo-text';
    text.textContent = todo.text;

    main.appendChild(text);

    const actions = document.createElement('div');

    const bin = document.createElement('button');
    bin.type = 'button';
    bin.className = 'bin-btn';
    bin.textContent = '🗑';
    bin.title = 'Delete todo';
    bin.addEventListener('click', () => {
      state.done = state.done.filter(entry => entry.id !== todo.id);
      render();
    });

    actions.appendChild(bin);

    item.appendChild(main);
    item.appendChild(actions);
    doneList.appendChild(item);
  }

  if (state.todos.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'todo-empty';
    empty.textContent = 'No active TODO items.';
    list.appendChild(empty);
  }

  if (state.done.length === 0) {
    const emptyDone = document.createElement('li');
    emptyDone.className = 'todo-empty';
    emptyDone.textContent = 'No completed TODO items yet.';
    doneList.appendChild(emptyDone);
  }
}

form.addEventListener('submit', event => {
  event.preventDefault();

  const text = input.value.trim();

  if (text === '') {
    return;
  }

  state.todos.unshift({
    id: uid(),
    text,
  });
  input.value = '';
  input.focus();
  render();
});

render();`},{id:n(),appId:e,name:"package.json",content:`{
  "name": "todo-sample",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "start": "echo "Open index.html in a browser""
  }
}`},{id:n(),appId:e,name:"README.md",content:`# TODO Sample

Simple TODO sample application.

## Usage

Open index.html and add items using the input.

## Behavior

- Add TODO item on submit.
- Active TODO items show Check and Bin actions.
- Clicking Check moves an item immediately to Done.
- Each item has a bin icon to delete it.
`}]}function B(){return crypto.randomUUID()}function x(){return new Date().toISOString()}function c(e){const n=document.getElementById(e);if(n===null)throw new Error(`Missing element #${e}`);return n}const Mt=c("app-workspace"),Rt=c("first-app-setup"),De=c("first-api-key-input"),K=c("first-app-name-input"),_t=c("btn-create-first-app"),Bt=c("btn-create-todo-sample"),Y=c("panels"),Ut=c("panel-chat"),$t=c("panel-editor"),Se=c("app-select"),xe=c("file-select"),Ne=c("file-content"),Me=c("chat-messages"),Jt=c("chat-progress"),ke=c("chat-input"),hn=c("btn-generate"),Ht=c("btn-run"),Wt=c("btn-refresh-preview"),re=c("preview-frame"),zt=c("btn-new-app"),Kt=c("btn-import"),qt=c("btn-project-settings"),Gt=c("btn-share"),Vt=c("btn-settings"),Yt=c("btn-agent-instructions"),ae=c("btn-toggle-chat"),se=c("btn-toggle-files"),ie=c("settings-modal"),Xt=c("btn-close-settings"),Qt=c("btn-save-settings"),Zt=c("btn-cancel-settings"),je=c("api-key-input"),gn=c("model-select"),vn=c("theme-select"),bn=c("font-size-input"),yn=c("max-tool-steps-input"),X=c("name-modal"),er=c("name-modal-title"),te=c("app-name-input"),fe=c("btn-confirm-name"),nr=c("btn-cancel-name"),tr=c("btn-close-name-modal"),oe=c("project-settings-modal"),z=c("project-name-input"),rr=c("btn-save-project-settings"),ar=c("btn-delete-project"),sr=c("btn-close-project-settings"),ir=c("btn-close-project-settings-x"),le=c("share-modal"),or=c("btn-close-share"),lr=c("btn-close-share-2"),Le=c("btn-share-link"),cr=c("btn-share-download"),H=c("share-link-status"),W=c("share-link-output"),ce=c("import-file"),de=c("agent-instructions-modal"),Te=c("agent-instructions-text"),dr=c("btn-close-agent-instructions"),pr=c("btn-close-agent-instructions-2"),ur=c("btn-copy-agent-instructions"),wn="asljs-app-builder-settings",En="light",Ie=14,An="__new__",Sn="__import__",Ce="#I!",mr=2e3,xn="https://alexandritesoftware.github.io/asljs/app-builder";function M(){try{const e=localStorage.getItem(wn)??"{}";return JSON.parse(e)}catch{return{}}}function Re(e){localStorage.setItem(wn,JSON.stringify(e))}function he(){return M().apiKey??""}function kn(){const e=M().model;return e==="gpt-5.3-codex"||e==="gpt-5.4"?e:lt}function jn(){const e=M().maxToolSteps;if(!Number.isFinite(e))return V;const n=Math.floor(e);return n<1?V:n}function Ln(){return M().theme==="light"?"light":En}function Tn(){const e=M().fontSize;if(!Number.isFinite(e))return Ie;const n=Math.floor(e);return n<12||n>20?Ie:n}function In(){document.body.dataset.theme=Ln(),document.documentElement.style.fontSize=`${Tn()}px`}function Cn(e){if(typeof e!="string")return null;const n=e.trim();return n===""?null:n}function q(){return crypto.randomUUID()}async function fr(e){const n=new Set,t=[];for(const r of e){let a=Cn(r.uuid);if((a===null||n.has(a))&&(a=q()),n.add(a),r.uuid===a){t.push(r);continue}const s={...r,uuid:a,updatedAt:r.updatedAt??x()};await N(s),t.push(s)}return t}function _e(){return o.apps.find(e=>e.id===o.currentAppId)}async function hr(e){await N(e),o.apps=o.apps.map(n=>n.id===e.id?e:n)}async function Pe(){const e=_e();if(e===void 0)return;const n={...e,uuid:q(),updatedAt:x()};await hr(n)}const C=et({getCurrentAppId:()=>o.currentAppId,getFiles:()=>o.files,setFiles:e=>{o.files=e},getActiveFileName:()=>o.activeFileName,setActiveFileName:e=>{o.activeFileName=e},createFileId:B,saveFile:async e=>{await an(e),await Pe()},deleteFileById:async e=>{await Xn(e),await Pe()},runApp:Z,evaluateInApp:e=>At(re,e),getAppDiagnostics:()=>St(re),wait:e=>new Promise(n=>{window.setTimeout(n,e)})});function pe(){It({selectElement:Se,apps:o.apps,currentAppId:o.currentAppId,newActionValue:An,importActionValue:Sn})}function Pn(){Mt.classList.remove("hidden");const e=o.currentAppId!==null&&o.apps.some(n=>n.id===o.currentAppId);if(Rt.classList.toggle("hidden",e),Y.classList.toggle("hidden",!e),!e){De.value=he(),K.value="";return}Be(),Ue()}async function Fn(){const e=K.value.trim();if(e===""){K.focus();return}const n=De.value.trim();if(n!==""){const r=M();r.apiKey=n,Re(r)}const t={id:B(),uuid:q(),name:e,createdAt:x(),updatedAt:x()};await N(t),o.apps=[...o.apps,t],await U(t.id)}async function gr(){const e=K.value.trim(),n=e===""?"TODO Sample":e,t=De.value.trim();if(t!==""){const i=M();i.apiKey=t,Re(i)}const r=B(),a={id:r,uuid:q(),name:n,createdAt:x(),updatedAt:x()},s=Nt(r,B);await N(a),await sn(r,s),o.apps=[...o.apps,a],await U(r)}function Be(){Ct({selectElement:xe,files:o.files,activeFileName:o.activeFileName})}function Ue(){Pt({textAreaElement:Ne,files:o.files,activeFileName:o.activeFileName})}function Ye(e){o.generating=e,Ft(hn,e)}function we(e,n){Ot(Jt,e,n)}function R(e,n){Dt(Me,e,n)}async function ge(){if(o.activeFileName===null||o.currentAppId===null)return;const e=o.files.find(t=>t.name===o.activeFileName);if(e===void 0)return;const n=Ne.value;e.content!==n&&(e.content=n,await an(e),await Pe())}async function U(e){var t;o.currentAppId=e;const n=await Yn(e);o.files=n,o.activeFileName=((t=n[0])==null?void 0:t.name)??null,Me.replaceChildren()}function On(){er.textContent="New App",te.value="",X.classList.remove("hidden"),te.focus(),fe.onclick=async()=>{const e=te.value.trim();if(e==="")return;X.classList.add("hidden");const n={id:B(),uuid:q(),name:e,createdAt:x(),updatedAt:x()};await N(n),o.apps=[...o.apps,n],await U(n.id)}}function $e(){X.classList.add("hidden"),fe.onclick=null}function vr(){const e=o.apps.find(n=>n.id===o.currentAppId);e!==void 0&&(z.value=e.name,oe.classList.remove("hidden"),z.focus(),z.select())}function Q(){oe.classList.add("hidden")}async function Dn(){const e=o.apps.find(r=>r.id===o.currentAppId);if(e===void 0)return;const n=z.value.trim();if(n===""){z.focus();return}const t={...e,name:n,updatedAt:x()};await N(t),o.apps=o.apps.map(r=>r.id===e.id?t:r),Q()}async function br(){Q(),await yr()}async function yr(){const e=o.apps.find(n=>n.id===o.currentAppId);e!==void 0&&confirm(`Delete "${e.name}"? This cannot be undone.`)&&(await Vn(e.id),o.apps=o.apps.filter(n=>n.id!==e.id),o.currentAppId=null,o.files=[],o.activeFileName=null,Me.replaceChildren(),re.src="about:blank")}async function Nn(){const e=ke.value.trim();if(e==="")return;const n=he();if(n===""){R("assistant","No OpenAI API key set. Open Settings (⚙) to add your key. Generation is optional — you can also create files manually.");return}if(o.currentAppId===null){R("assistant","Please create or open an app first.");return}ke.value="",R("user",e),Ye(!0),we("Starting generation...",!0);try{const t=kn(),r=jn(),a=await ut(e,n,t,C,{initialToolStepLimit:r,systemPrompt:cn,onToolStepLimit:async({stepsCompleted:i})=>confirm(`AI reached ${i} tool steps without finishing. Continue for 12 more steps?`),onProgress:i=>{we(i,!0)}}),s=o.apps.find(i=>i.id===o.currentAppId);if(s!==void 0){const i={...s,updatedAt:x()};await N(i),o.apps=o.apps.map(h=>h.id===s.id?i:h)}R("assistant",a.summary),Z()}catch(t){const r=t instanceof Error?t.message:String(t);R("assistant",`Error: ${r}`)}finally{we("",!1),Ye(!1)}}function Z(){ge().then(()=>{Et(re,o.files,{hostOpenAiApiKey:he()})})}async function Mn(){await ge();const e=_e();if(e===void 0)throw new Error("No app selected.");return{app:e,files:[...o.files],exportedAt:x()}}function wr(e){const n=new Blob([JSON.stringify(e,null,2)],{type:"application/json"}),t=URL.createObjectURL(n),r=document.createElement("a");r.href=t,r.download=`${e.app.name.replace(/\s+/g,"-")}.json`,r.click(),URL.revokeObjectURL(t)}function Rn(){return confirm(`Security warning: You are about to import an application.

Although apps run in an isolated browser context, imported code can still be harmful. Be vigilant and only open apps from sources you trust.

Do you want to continue?`)}function Xe(e){const n=e==="run";Y.classList.toggle("chat-collapsed",n),Y.classList.toggle("files-collapsed",n),ae.textContent=n?"Chat ▸":"Chat ▾",se.textContent=n?"Files ▸":"Files ▾",ae.setAttribute("aria-expanded",String(!n)),se.setAttribute("aria-expanded",String(!n))}function Er(){return confirm(`Import link opened.

Press OK to edit the app (chat/files open, app not auto-run).
Press Cancel to run the app (chat/files hidden).`)?"edit":"run"}function _n(){Rn()&&(ce.value="",ce.click())}function Ar(e){if(e.app===void 0||typeof e.app.name!="string"||!Array.isArray(e.files))throw new Error("Invalid app JSON format.")}async function Bn(e,n){Ar(e);const t=Cn(e.app.uuid)??q(),r=o.apps.find(h=>h.uuid===t);if(r!==void 0)return n.navigateToExistingByUuid?(await U(r.id),r.id):(n.showDuplicateAlert&&alert("Import stopped: an app with the same UUID already exists."),null);const a=B(),s={id:a,uuid:t,name:e.app.name,createdAt:e.app.createdAt??x(),updatedAt:e.app.updatedAt??x()},i=e.files.filter(h=>typeof h.name=="string"&&typeof h.content=="string").map(h=>({id:B(),appId:a,name:h.name,content:h.content}));return await N(s),await sn(a,i),o.apps=[...o.apps,s],await U(a),a}async function Sr(){var n;const e=(n=ce.files)==null?void 0:n[0];if(e!==void 0)try{const t=await e.text(),r=JSON.parse(t);await Bn(r,{navigateToExistingByUuid:!1,showDuplicateAlert:!0})}catch(t){const r=t instanceof Error?t.message:String(t);alert(`Import failed: ${r}`)}}function xr(e){let n="";for(let r=0;r<e.length;r+=32768){const a=e.subarray(r,r+32768);n+=String.fromCharCode(...a)}return btoa(n)}function kr(e){const n=atob(e),t=new Uint8Array(n.length);for(let r=0;r<n.length;r++)t[r]=n.charCodeAt(r);return t}async function jr(e){const n=window.CompressionStream;if(n===void 0)throw new Error("Link sharing is not supported in this browser. Use Download export instead.");const t=new n("gzip"),r=t.writable.getWriter(),a=new TextEncoder().encode(e);return await r.write(a),await r.close(),new Uint8Array(await new Response(t.readable).arrayBuffer())}async function Lr(e){const n=window.DecompressionStream;if(n===void 0)throw new Error("Cannot import from shared link in this browser.");const t=new n("gzip"),r=t.writable.getWriter();return await r.write(e),await r.close(),new TextDecoder().decode(await new Response(t.readable).arrayBuffer())}async function Tr(e){const n=JSON.stringify(e),t=await jr(n),r=encodeURIComponent(xr(t));return`${xn}${Ce}${r}`}async function Ir(e){const n=decodeURIComponent(e),t=kr(n),r=await Lr(t);return JSON.parse(r)}function Cr(){return window.location.hash.startsWith(Ce)?window.location.hash.slice(Ce.length):null}function Qe(){if(window.location.origin==="https://alexandritesoftware.github.io"){window.location.replace(xn);return}window.history.replaceState(null,"",window.location.pathname)}async function Pr(){const e=Cr();if(e===null||e.trim()==="")return!1;if(!Rn())return Qe(),!0;try{const n=await Ir(e);await Bn(n,{navigateToExistingByUuid:!0,showDuplicateAlert:!1})!==null&&(Er()==="run"?(Xe("run"),Z()):Xe("edit"))}catch(n){const t=n instanceof Error?n.message:String(n);alert(`Could not import from share link: ${t}`)}return Qe(),!0}async function Fr(){W.value="",Le.disabled=!0,H.textContent="Preparing share link...";try{const e=await Mn(),n=await Tr(e);if(n.length>mr){H.textContent="Link sharing is unavailable because URL length exceeds 2000 characters. Use Download export and import the file instead.";return}W.value=n,H.textContent="Link is ready. Use Share with link to copy it.",Le.disabled=!1}catch(e){const n=e instanceof Error?e.message:String(e);H.textContent=n}}function Or(){_e()!==void 0&&(le.classList.remove("hidden"),Fr())}function Je(){le.classList.add("hidden")}async function Dr(){if(W.value.trim()!=="")try{await navigator.clipboard.writeText(W.value),H.textContent="Share link copied to clipboard."}catch{W.focus(),W.select(),H.textContent="Could not copy automatically. Link is selected, copy it manually."}}async function Nr(){const e=await Mn();wr(e)}function Mr(){je.value=he(),gn.value=kn(),vn.value=Ln(),bn.value=String(Tn()),yn.value=String(jn()),ie.classList.remove("hidden"),je.focus()}function ve(){ie.classList.add("hidden")}function Rr(){const e=M();e.apiKey=je.value.trim(),e.model=gn.value==="gpt-5.4"?"gpt-5.4":"gpt-5.3-codex",e.theme=vn.value==="light"?"light":En;const n=Number.parseInt(bn.value,10);e.fontSize=Number.isFinite(n)&&n>=12&&n<=20?n:Ie;const t=Number.parseInt(yn.value,10);e.maxToolSteps=Number.isFinite(t)&&t>=1?t:V,Re(e),In(),ve()}function _r(){Te.value=cn,de.classList.remove("hidden"),Te.scrollTop=0}function He(){de.classList.add("hidden")}function Br(){fn({panelElement:Ut,toggleButtonElement:ae,panelsElement:Y,collapsedPanelsClass:"chat-collapsed",expandedLabel:"Chat ▾",collapsedLabel:"Chat ▸"})}function Ur(){fn({panelElement:$t,toggleButtonElement:se,panelsElement:Y,collapsedPanelsClass:"files-collapsed",expandedLabel:"Files ▾",collapsedLabel:"Files ▸"})}async function $r(){const e=Te.value;try{await navigator.clipboard.writeText(e),R("assistant","Agent instructions copied to clipboard.")}catch{R("assistant","Could not copy to clipboard automatically. You can still select and copy from the instructions modal.")}}o.on("set:apps",()=>pe());o.on("set:currentAppId",()=>{pe(),Pn()});o.on("set:files",()=>{Be(),Ue()});o.on("set:activeFileName",()=>{Be(),Ue()});zt.addEventListener("click",On);Kt.addEventListener("click",_n);qt.addEventListener("click",vr);Gt.addEventListener("click",()=>{Or()});hn.addEventListener("click",()=>{Nn()});Ht.addEventListener("click",Z);Wt.addEventListener("click",Z);Vt.addEventListener("click",Mr);Yt.addEventListener("click",_r);ae.addEventListener("click",Br);se.addEventListener("click",Ur);Xt.addEventListener("click",ve);Qt.addEventListener("click",Rr);Zt.addEventListener("click",ve);ie.addEventListener("click",e=>{e.target===ie&&ve()});dr.addEventListener("click",He);pr.addEventListener("click",He);ur.addEventListener("click",()=>{$r()});de.addEventListener("click",e=>{e.target===de&&He()});or.addEventListener("click",Je);lr.addEventListener("click",Je);Le.addEventListener("click",()=>{Dr()});cr.addEventListener("click",()=>{Nr()});le.addEventListener("click",e=>{e.target===le&&Je()});fe.addEventListener("click",()=>{});nr.addEventListener("click",$e);tr.addEventListener("click",$e);X.addEventListener("click",e=>{e.target===X&&$e()});rr.addEventListener("click",()=>{Dn()});ar.addEventListener("click",()=>{br()});sr.addEventListener("click",Q);ir.addEventListener("click",Q);oe.addEventListener("click",e=>{e.target===oe&&Q()});te.addEventListener("keydown",e=>{e.key==="Enter"&&fe.click()});z.addEventListener("keydown",e=>{e.key==="Enter"&&(e.preventDefault(),Dn())});_t.addEventListener("click",()=>{Fn()});Bt.addEventListener("click",()=>{gr()});K.addEventListener("keydown",e=>{e.key==="Enter"&&(e.preventDefault(),Fn())});ke.addEventListener("keydown",e=>{e.key==="Enter"&&!e.shiftKey&&(e.preventDefault(),Nn())});Se.addEventListener("change",()=>{const e=Se.value;if(e===An){On(),pe();return}if(e===Sn){_n(),pe();return}e!==""&&e!==o.currentAppId&&U(e)});xe.addEventListener("change",()=>{const e=xe.value;e===""||e===o.activeFileName||(ge(),o.activeFileName=e)});Ne.addEventListener("blur",()=>{ge()});ce.addEventListener("change",()=>{Sr()});window.listFileset=C.listFileset;window.readFile=C.readFile;window.setFileContent=C.setFileContent;window.replaceFilePart=C.replaceFilePart;window.deleteFile=C.deleteFile;window.evalInApp=C.evalInApp;window.getAppDiagnostics=C.getAppDiagnostics;window.runAppAndCollectDiagnostics=C.runAppAndCollectDiagnostics;async function Jr(){In();const e=await fr(await Gn());if(o.apps=e,!await Pr())if(e.length>0){const t=[...e].sort((r,a)=>a.updatedAt.localeCompare(r.updatedAt));await U(t[0].id)}else o.currentAppId=null,o.files=[],o.activeFileName=null,Pn(),K.focus()}Jr().catch(e=>{console.error("App Builder init failed:",e)});
