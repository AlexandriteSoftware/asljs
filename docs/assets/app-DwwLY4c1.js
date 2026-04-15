(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))s(a);new MutationObserver(a=>{for(const i of a)if(i.type==="childList")for(const o of i.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&s(o)}).observe(document,{childList:!0,subtree:!0});function t(a){const i={};return a.integrity&&(i.integrity=a.integrity),a.referrerPolicy&&(i.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?i.credentials="include":a.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function s(a){if(a.ep)return;a.ep=!0;const i=t(a);fetch(a.href,i)}})();class xn extends Error{constructor(n,t,s,a,i){super(n),this.name="ListenerError",this.error=t,this.object=s,this.event=a,this.listener=i}}function $(e){if(typeof e!="string"&&typeof e!="symbol")throw new TypeError("Expect event to be a string or symbol.")}function se(e){return typeof e=="function"}function Ne(e){if(se(e))return e}function $e(e){return typeof e=="object"&&e!==null}function pe(e){if(!se(e))throw new TypeError("Expect a function.")}const jn=(e=Object.create(null),n={})=>{if(!$e(e)&&!se(e))throw new TypeError("Expect an object or a function.");for(const p of["on","once","off","emit","emitAsync","has"])if(p in e)throw new Error(`Method "${p}" already exists.`);const{strict:t=!1,trace:s=null,error:a=null}=n,i=Ne(s)??null,o=Ne(a)??null,g=e!==_,A=(p,f)=>{i==null||i(p,f),g&&_.emit(p,f)};A("new",{object:e});const v=new Set,d=new Map,h={enumerable:!1,configurable:!0,writable:!0};return Object.defineProperties(e,{on:Object.assign({value:E},h),once:Object.assign({value:w},h),off:Object.assign({value:y},h),emit:Object.assign({value:k},h),emitAsync:Object.assign({value:I},h),has:Object.assign({value:T},h)}),e;function r(p,f){let b=d.get(p);b||d.set(p,b=new Set),b.add(f)}function m(p,f){const b=d.get(p);if(!b)return!1;const S=b.delete(f);return b.size===0&&d.delete(p),S}function u(p,f,b){const S={error:b,object:e,event:p,listener:f};if(o==null||o(S),e===_&&p==="error")throw new xn("Error in a global error listener.",b,e,p,f);_.emit("error",S)}function E(p,f){$(p),pe(f),A("on",{object:e,event:p,listener:f}),r(p,f);let b=!0;return()=>b?(b=!1,m(p,f)):!1}function w(p,f){$(p),pe(f);const b=E(p,(...S)=>{b(),f(...S)});return b}function y(p,f){return $(p),pe(f),A("off",{object:e,event:p,listener:f}),m(p,f)}function T(p){var f;return $(p),(((f=d.get(p))==null?void 0:f.size)??0)>0}function k(p,...f){$(p);const b=d.get(p)||v;if(A("emit",{object:e,listeners:[...b],event:p,args:f}),b.size!==0)for(const S of b)try{S(...f)}catch(C){if(u(p,S,C),t)throw C}}async function I(p,...f){$(p);const b=d.get(p)||v;if(A("emitAsync",{object:e,listeners:[...b],event:p,args:f}),b.size===0)return;const S=[...b].map(async C=>{try{await C(...f)}catch(Fe){if(u(p,C,Fe),t)throw Fe}});await(t?Promise.all(S):Promise.allSettled(S))}},_=jn;_(_);function Tn(e){return!$e(e)&&!se(e)?!1:typeof e.on=="function"}function Ue(e){if(Tn(e))return e}function L(e){return typeof e=="function"}function Ae(e){return typeof e=="object"&&e!==null}function Je(e){if(!L(e))throw new TypeError("Expect a function.")}function fe(e){if(e.trim()==="")throw new TypeError("Expect watch path to be a non-empty string.");const n=e.split(".");for(const t of n)if(t.trim()==="")throw new TypeError("Expect watch path segments to be non-empty.");return e.split(".").map(t=>t.trim()).filter(t=>t!=="")}function kn(e,n){const t=fe(n);if(t.length===0)return;let s=e;for(const a of t){if(!Ae(s)||!(a in s))return;s=s[a]}return s}const Ke=(e,n,t)=>{if(Array.isArray(e))throw new TypeError("Watching arrays is not supported.");Je(t);const s=typeof n=="string"?[n]:n;if(!Array.isArray(s))throw new TypeError("Expect properties to be a string or an array of strings.");for(const o of s){if(typeof o!="string")throw new TypeError("Expect properties to be a string or an array of strings.");fe(o)}const a=()=>s.map(o=>kn(e,o)),i=[];for(const o of s){const g=fe(o);let A=null;const v=()=>{const d=[],h=(r,m)=>{if(!Ae(r)||m>=g.length)return;const u=g[m],E=Ue(r);if(E){const w=E.on(`set:${u}`,()=>{t(...a()),m<g.length-1&&A&&(A(),A=v())});d.push(w)}m<g.length-1&&h(r[u],m+1)};return h(e,0),()=>d.reduce((r,m)=>m()||r,!1)};A=v(),i.push(()=>A?A():!1)}return t(...a()),()=>i.reduce((o,g)=>g()||o,!1)};function Ln(e,n){"watch"in e||Object.defineProperty(e,"watch",{configurable:!0,writable:!0,enumerable:!1,value(t,s){return n(typeof t=="string"?this:this,t,s)}})}function De(e,n){return Object.prototype.hasOwnProperty.call(e,n)}function ue(e){if(typeof e=="symbol")return!1;const n=typeof e=="number"?e:Number(e);return!Number.isInteger(n)||n<0||n>=4294967295?!1:typeof e=="number"||e===String(n)}function In(e){return Ue(e)?L(e.emit):!1}const We=(e,n={})=>{const{eventful:t=_,trace:s=null,shallow:a=!1}=n;Je(t);const i=ie.options,o=new WeakMap,g=r=>{if(a||!Ae(r)||In(r))return r;if(o.has(r))return o.get(r);const m=We(r,{eventful:t,trace:s,shallow:a});return o.set(r,m),m},A=r=>{if(!a){if(Array.isArray(r)){for(let m=0;m<r.length;m++)r[m]=g(r[m]);return}for(const m of Reflect.ownKeys(r))De(r,m)&&(r[m]=g(r[m]))}},v=r=>{const m=Array.isArray(r);A(r),Ln(r,Ke);let u;const E=new Proxy(r,{set(w,y,T,k){const I=m&&ue(y),p=Reflect.get(w,y,k),f=Reflect.set(w,y,g(T),k);if(u&&f){const b=Reflect.get(w,y,k);if(!Object.is(p,b)){const S=I?{index:Number(y),value:b,previous:p}:{property:y,value:b,previous:p},C=s||i.trace;u.emit(`set:${String(y)}`,S),L(C)&&C(u,"set",S),u.emit("set",S)}}return f},deleteProperty(w,y){const T=m&&ue(y),k=De(w,y),I=k?w[y]:void 0,p=Reflect.deleteProperty(w,y);if(u&&p&&k){const f=T?{index:Number(y),previous:I}:{property:y,previous:I},b=s||i.trace;u.emit(`delete:${String(y)}`,f),L(b)&&b(u,"delete",f),u.emit("delete",f)}return p},defineProperty(w,y,T){const k=Object.getOwnPropertyDescriptor(w,y)??null,I=Object.prototype.hasOwnProperty.call(T,"value")?{...T,value:g(T.value)}:T,p=Reflect.defineProperty(w,y,I),f=m&&(y==="length"||ue(y));if(u&&!f&&p){const b={property:y,descriptor:I,previous:k},S=s||i.trace;u.emit(`define:${String(y)}`,b),L(S)&&S(u,"define",b),u.emit("define",b)}return p}});return u=L(r==null?void 0:r.emit)?E:t(E),u},d=s||i.trace;if(Array.isArray(e)){const r=v(e);return L(d)&&d(r,"new"),r}if(e!==null&&typeof e=="object"){const r=v(e);return L(d)&&d(r,"new",{object:r}),r}const h=t({get value(){return e},set value(r){if(Object.is(r,e))return;const m=e;e=r;const u={property:"value",value:e,previous:m};h.emit("set:value",u),L(d)&&d(h,"set",u),h.emit("set",u)}});return L(d)&&d(h,"new",{object:h}),h},ie=We;ie.options={trace:null};ie.watch=Ke;const l=ie({apps:[],currentAppId:null,files:[],activeFileName:null,generating:!1,error:null});function x(e){return new Promise((n,t)=>{e.addEventListener("success",()=>{n(e.result)}),e.addEventListener("error",()=>{t(e.error??new Error("IndexedDB request failed"))})})}function Pn(e,n){return new Promise((t,s)=>{const a=indexedDB.open(e,n.length);a.addEventListener("upgradeneeded",i=>{const o=n.slice(i.oldVersion-1,i.newVersion??n.length-1);for(const g of o)g(a.result)}),a.addEventListener("success",()=>{t(a.result)}),a.addEventListener("blocked",()=>{s(new Error("Database opening is blocked"))}),a.addEventListener("error",()=>{s(a.error??new Error("Failed to open database"))})})}const Cn="asljs-app-builder";let z=null;async function B(){return z!==null||(z=await Pn(Cn,[e=>{e.createObjectStore("apps",{keyPath:"id"}),e.createObjectStore("files",{keyPath:"id"}).createIndex("byAppId","appId",{unique:!1})}])),z}async function On(){const n=(await B()).transaction("apps","readonly");return x(n.objectStore("apps").getAll())}async function K(e){const t=(await B()).transaction("apps","readwrite");await x(t.objectStore("apps").put(e))}async function Fn(e){const t=(await B()).transaction(["apps","files"],"readwrite");await x(t.objectStore("apps").delete(e));const s=t.objectStore("files"),a=await x(s.index("byAppId").getAllKeys(e));for(const i of a)await x(s.delete(i))}async function Nn(e){const t=(await B()).transaction("files","readonly");return x(t.objectStore("files").index("byAppId").getAll(e))}async function qe(e){const t=(await B()).transaction("files","readwrite");await x(t.objectStore("files").put(e))}async function Dn(e){const t=(await B()).transaction("files","readwrite");await x(t.objectStore("files").delete(e))}async function He(e,n){const a=(await B()).transaction("files","readwrite").objectStore("files"),i=await x(a.index("byAppId").getAllKeys(e));for(const o of i)await x(a.delete(o));for(const o of n)await x(a.put(o))}function O(e,n,t,s){return{name:e,type:"function",description:n,parameters:{type:"object",properties:t||{},required:s||[],additionalProperties:!1},strict:!0}}const Mn=[O("listFileset","List all file paths in the virtual filesystem."),O("readFile","Read the full text content of a file.",{path:{type:"string"}},["path"]),O("setFileContent","Create or fully replace file content.",{path:{type:"string"},content:{type:"string"}},["path","content"]),O("replaceFilePart","Replace part of a file by exact search string.",{path:{type:"string"},search:{type:"string"},replacement:{type:"string"},replaceAll:{type:"boolean"}},["path","search","replacement","replaceAll"]),O("deleteFile","Delete a file from the virtual filesystem.",{path:{type:"string"}},["path"]),O("evalInApp","Evaluate JavaScript in the running app document context.",{code:{type:"string"}},["code"]),O("getAppDiagnostics","Get current runtime logs and errors from the running app."),O("runAppAndCollectDiagnostics","Run the app and collect runtime logs and errors after startup.")],_n=350;function Rn(e){async function n(){return[...e.getFiles()].map(v=>v.name).sort((v,d)=>v.localeCompare(d))}async function t(v){const d=Y(e,v),h=d===null?void 0:e.getFiles().find(r=>r.name===d);if(h===void 0)throw new Error(`File not found: ${v}`);return h.content}async function s(v,d){const h=Bn(e),r=ge(v),m=Y(e,r),u=e.getFiles().find(w=>w.name===(m??r));if(u!==void 0){const w={...u,content:d};await e.saveFile(w),e.setFiles(e.getFiles().map(y=>y.id===w.id?w:y)),e.setActiveFileName(w.name);return}const E={id:e.createFileId(),appId:h,name:r,content:d};await e.saveFile(E),e.setFiles([...e.getFiles(),E]),e.setActiveFileName(E.name)}async function a(v){var m;const d=Y(e,v),h=d===null?void 0:e.getFiles().find(u=>u.name===d);if(h===void 0)return;await e.deleteFileById(h.id);const r=e.getFiles().filter(u=>u.id!==h.id);e.setFiles(r),e.getActiveFileName()===v&&e.setActiveFileName(((m=r[0])==null?void 0:m.name)??null)}async function i(v,d,h,r=!1){if(d==="")throw new Error("Search text cannot be empty.");const m=Y(e,v);if(m===null)throw new Error(`File not found: ${v}`);const u=await t(m);if(!u.includes(d))throw new Error(`Search text not found in ${m}.`);let E=u;if(r)E=u.split(d).join(h);else{const w=u.indexOf(d);if(u.indexOf(d,w+d.length)!==-1)throw new Error("Search text is ambiguous. Use replaceAll=true or provide a more specific search block.");E=u.slice(0,w)+h+u.slice(w+d.length)}await s(m,E)}async function o(v){if(e.getFiles().length===0)throw new Error("No files available to run.");e.runApp();try{return await e.evaluateInApp(v)}catch{return e.runApp(),e.evaluateInApp(v)}}async function g(){return e.getAppDiagnostics()}async function A(){return e.runApp(),await e.wait(e.diagnosticsDelayMs??_n),e.getAppDiagnostics()}return{listFileset:n,readFile:t,setFileContent:s,deleteFile:a,replaceFilePart:i,evalInApp:o,getAppDiagnostics:g,runAppAndCollectDiagnostics:A}}function Bn(e){const n=e.getCurrentAppId();if(n===null)throw new Error("No active app. Create or open an app first.");return n}function ge(e){const n=e.trim().replace(/\\/g,"/").replace(/^\.\//,"").replace(/^\/+/,"");if(n==="")throw new Error("Path cannot be empty.");if(n.includes(".."))throw new Error("Parent path segments are not allowed.");return n}function Y(e,n){const t=ge(n),s=e.getFiles().find(a=>ge(a.name).toLowerCase()===t.toLowerCase());return(s==null?void 0:s.name)??null}function $n(e){return typeof e!="object"||e===null?!1:e.type==="function_call"}function Ve(e){if(typeof e.name!="string"||e.name.trim()==="")throw new Error("Tool call missing function name.");return e.name}function Un(e){if(typeof e.call_id!="string"||e.call_id.trim()==="")throw new Error("Tool call missing call_id.");return e.call_id}async function Jn(e,n){const t=Ve(e),s=Kn(e.arguments);try{switch(t){case"listFileset":{const a=await n.listFileset();return N(a)}case"readFile":{const a=await n.readFile(F(s,"path"));return N(a)}case"setFileContent":return await n.setFileContent(F(s,"path"),F(s,"content")),N("ok");case"replaceFilePart":return await n.replaceFilePart(F(s,"path"),F(s,"search"),F(s,"replacement"),Wn(s,"replaceAll",!1)),N("ok");case"deleteFile":return await n.deleteFile(F(s,"path")),N("ok");case"evalInApp":{const a=await n.evalInApp(F(s,"code"));return N(a)}case"getAppDiagnostics":{const a=await n.getAppDiagnostics();return N(a)}case"runAppAndCollectDiagnostics":{const a=await n.runAppAndCollectDiagnostics();return N(a)}default:return Me(`Unknown tool: ${t}`)}}catch(a){return Me(a instanceof Error?a.message:String(a))}}function Kn(e){if(e===void 0)return{};if(typeof e=="object"&&e!==null)return e;if(typeof e!="string")throw new Error("Invalid tool arguments value.");try{const n=JSON.parse(e);if(typeof n!="object"||n===null)throw new Error("Tool arguments must be a JSON object.");return n}catch{throw new Error("Invalid tool arguments JSON.")}}function F(e,n){const t=e[n];if(typeof t!="string")throw new Error(`Tool argument "${n}" must be a string.`);return t}function Wn(e,n,t){const s=e[n];if(s===void 0)return t;if(typeof s!="boolean")throw new Error(`Tool argument "${n}" must be a boolean.`);return s}function N(e){return Ge({ok:!0,value:e})}function Me(e){return Ge({ok:!1,error:e})}function Ge(e){try{return JSON.stringify(e)}catch{return'{"ok":false,"error":"Failed to serialize tool result."}'}}const qn="https://api.openai.com/v1/responses",Hn="gpt-5.3-codex",H=20,Vn="You are an expert ASLJS app generator.",Gn=12,zn={createResponse:async e=>{const n=await fetch(qn,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${e.apiKey}`},body:JSON.stringify({model:e.model,instructions:e.instructions,temperature:e.temperature,previous_response_id:e.previous_response_id,input:e.input,tools:e.tools})});if(!n.ok){const t=await n.json().catch(()=>({})),s=Xn(t)??`OpenAI API error: ${n.status}`;throw new Error(s)}return n.json()}};async function Yn(e,n,t,s,a){var h;const i=(a==null?void 0:a.transport)??zn,o=(a==null?void 0:a.systemPrompt)??Vn;let g,A=e,v=Qn(a==null?void 0:a.initialToolStepLimit),d=0;for(;;){if(await q(a,`Step ${d+1}: requesting assistant response...`),d>=v){if(!(await((h=a==null?void 0:a.onToolStepLimit)==null?void 0:h.call(a,{stepsCompleted:d,stepLimit:v}))??!1))throw new Error("AI exceeded maximum tool steps without completing.");v+=Gn,await q(a,`Extended step limit to ${v}. Continuing...`)}const r=await i.createResponse({apiKey:n,model:t,instructions:o,temperature:.1,previous_response_id:g,input:A,tools:Mn});if(!Array.isArray(r.output))throw new Error("AI returned an unexpected response format.");const m=r.output.filter($n);if(m.length===0){await q(a,`Completed in ${d+1} step(s). Finalizing summary...`);const E=Zn(r);return{summary:E===""?"Completed tool-based update.":E}}const u=[];for(const E of m){await q(a,`Step ${d+1}: running ${Ve(E)}...`);const w=await Jn(E,s);u.push({type:"function_call_output",call_id:Un(E),output:w})}await q(a,`Step ${d+1}: submitted ${u.length} tool result(s).`),g=typeof r.id=="string"?r.id:g,A=u,d+=1}}function Qn(e){if(!Number.isFinite(e))return H;const n=Math.floor(e);return n>=1?n:H}async function q(e,n){(e==null?void 0:e.onProgress)!==void 0&&await Promise.resolve(e.onProgress(n))}function Xn(e){const n=e.error;return typeof(n==null?void 0:n.message)=="string"?n.message:null}function Zn(e){return typeof e.output_text=="string"&&e.output_text.trim()!==""?e.output_text.trim():Array.isArray(e.output)?e.output.filter(t=>t.type==="message").flatMap(t=>t.content??[]).map(t=>t.text??"").map(t=>t.trim()).filter(t=>t!=="").join(`
`):""}const et=`# observable

> Part of [Alexandrite Software Library][#1] – a set of high‑quality,
performant JavaScript libraries for everyday use.

## Overview

Lightweight observable for JS. Emits events on property changes via on/off/emit.
Works with objects, arrays, and primitives.

## Installation

\`\`\`bash
npm install asljs-observable
\`\`\`

NPM Package: [asljs-observable](https://www.npmjs.com/package/asljs-observable)

## Usage

### Observing an object (JavaScript)

\`\`\`js
import { observable } from 'asljs-observable';

const obj = observable({ a: 1, b: 2 });

obj.on('set:a', ({ value, previous }) => {
  console.log(\`obj.a ←\`, value, '(was', previous, ')');
});

obj.on('set', ({ property, value, previous }) => {
  console.log(\`obj.\${property} ←\`, value, '(was', previous, ')');
});

obj.a = 3;
\`\`\`

### Observing an array (JavaScript)

\`\`\`js
import { observable } from 'asljs-observable';

const arr = observable([1, 2, 3]);

arr.on('set:1', ({ value, previous }) => {
  console.log('arr[1] ←', value, '(was', previous, ')');
});

arr.on('set', (payload) => {
  if ('index' in payload) {
    console.log(\`arr[\${payload.index}] ←\`, payload.value, '(was', payload.previous, ')');
    return;
  }

  console.log(\`arr.\${payload.property} ←\`, payload.value, '(was', payload.previous, ')');
});

arr[1] = 42;
\`\`\`

### Observing a number (JavaScript)

\`\`\`js
import { observable } from 'asljs-observable';

const box = observable(10);

box.on('set', ({ value, previous }) => {
  console.log('value:', previous, '→', value);
});

box.value = 11;
\`\`\`

### Watch selected properties (JavaScript)

\`\`\`js
import { observable } from 'asljs-observable';

const state = observable({ user: 'Alice', active: false });

// logs "User: Alice Active: false"
state.watch(
  [ 'user', 'active' ],
  (user, active) =>
    console.log('User:', user, 'Active:', active));

// logs "User: Alice Active: true"
state.active = true;
\`\`\`

### Watch nested paths (JavaScript)

\`\`\`js
import { observable } from 'asljs-observable';

const state = observable({ user: { name: 'Alice' }, active: false });

state.watch(
  [ 'user.name', 'active' ],
  (userName, active) =>
    console.log('User:', userName, 'Active:', active));

state.user.name = 'Bob';
\`\`\`

### Watching an object's property (TypeScript)

\`\`\`ts
import { observable, type Observable } from 'asljs-observable';

const obj: Observable<{ name: string }> =
  observable({ name: 'Alice' });

obj.watch(
  'name',
  name => console.log(name));
\`\`\`

### Observable class (TypeScript)

\`\`\`ts
import { ObservableObject } from 'asljs-observable';

class User
  extends ObservableObject<{ name: string }>
{
  #name: string;

  constructor(name: string) {
    super();

    this.#name = name;
  }

  get name() {
    return this.#name;
  }

  set name(value: string) {
    this.setAndEmit(
      'name',
      this.#name,
      value,
      next => {
        this.#name = next;
      });
  }
}
\`\`\`

## API Reference

### \`observable(value, [options])\`

Wraps an object, array, or primitive to make it observable.

- \`value\`: Target object/array/primitive to observe.
- \`options.eventful\` (optional): Custom \`eventful\` factory (defaults to \`asljs-eventful\`).
- \`options.trace\` (optional): Trace hook \`(object, action, payload)\` invoked on \`'new'\`, \`'set'\`, \`'delete'\`, \`'define'\`.
- \`options.shallow\` (optional): Nested conversion mode.
  - \`false\` (default): recursively converts nested objects and arrays.
  - \`true\`: converts only the top-level value.

Returns the original value wrapped with Eventful API and change notifications.
When the target object does not already have a \`watch\` method, observable adds a
non-enumerable \`watch(properties, callback)\` method to the wrapped object.

### \`observable.watch(target, properties, callback)\`

Watches one or more properties/paths and invokes callback with current values.

- \`properties\` can be a single path string (e.g. \`'user.name'\`) or an array
  of path strings.

- Runs the callback immediately with current values.
- Re-runs callback each time one of the selected \`set:<propertyOrPath>\` events
  fires.
- Nested paths are supported, e.g. \`'user.name'\`.
- \`target\` may be a plain object; callback still runs immediately with a
  snapshot.
- Updates are observed only where an eventful segment exists along the watched
  path.
- Arrays are not supported by \`watch\` yet and will throw \`TypeError\`.
- Returns an unsubscribe function. Calling it removes all listeners attached by
  this \`watch\` call.

### Events and payloads

More concrete events are emitted first, followed by more generic ones.
E.g., setting \`obj.a\` emits \`set:a\` first, then \`set\`.

Objects emit:

- \`set\` and \`set:<property>\`: \`{ property, value, previous }\`
- \`delete\` and \`delete:<property>\`: \`{ property, previous }\`
- \`define\` and \`define:<property>\`: \`{ property, descriptor, previous }\`

For arrays:

- index changes (\`arr[0] = x\`, \`delete arr[1]\`) emit payloads with numeric
  \`index\`.
- non-index properties (including \`'length'\` and custom properties) emit
  payloads with string \`property\`.
- \`define\` / \`define:<property>\` are emitted only for non-index properties.

Primitives (boxed as \`{ value }\`) emit:

- \`set\` and \`set:value\`: \`{ property: 'value', value, previous }\`

## License

MIT License. See [LICENSE](LICENSE.md) for details.

[#1]: https://github.com/AlexandriteSoftware/asljs
`,nt=`# eventful

> Part of [Alexandrite Software Library][#1] – a set of high‑quality,
performant JavaScript libraries for everyday use.

Lightweight event helper adding on/off/emit to any object.

## Installation

\`\`\`bash
npm install asljs-eventful
\`\`\`

NPM Package: [asljs-eventful](https://www.npmjs.com/package/asljs-eventful)

## Usage

### Basic (JavaScript)

Adding events to an object, add listeners, and emit events:

\`\`\`js
import { eventful } from 'asljs-eventful';

const obj = eventful({ name: 'Alice' });

obj.on('greet',
  msg => console.log(\`\${msg}, \${obj.name}!\`));
 
// writes "Hello, Alice!" to console
obj.emit('greet', 'Hello');
\`\`\`

### Basic (TypeScript)

\`\`\`ts
import { eventful, type Eventful } from 'asljs-eventful';

type Events =
  { greet: [msg: string] };

const obj: { name: string } & Eventful<Events> =
  eventful({ name: 'Alice' });

obj.on('greet',
  msg => console.log(\`\${msg}, \${obj.name}!\`));

// writes "Hello, Alice!" to console
obj.emit('greet', 'Hello');
\`\`\`

### Inheritance (JavaScript)

Adding events to a class via inheritance:

\`\`\`js
import { EventfulBase } from 'asljs-eventful';

class MyClass extends EventfulBase {
  constructor(name) {
    super();

    this.name = name;
  }

  greet() {
    this.emit(
      'greet',
      \`Hello, \${this.name}\`);
  }
}
\`\`\`

### Inheritance (TypeScript)

\`\`\`ts
import { EventfulBase } from 'asljs-eventful';

class MyClass extends EventfulBase {
  name: string;

  constructor(name: string) {
    super();

    this.name = name;
  }

  greet() {
    this.emit(
      'greet',
      \`Hello, \${this.name}\`);
  }
}
\`\`\`

### Construction (JavaScript)

Adding events to an existing class during construction:

\`\`\`js
import { eventful } from 'asljs-eventful';

export class MyClass {
  constructor(name) {
    eventful(this);

    this.name = name;
  }

  greet() {
    this.emit(
      'greet',
      \`Hello, \${this.name}\`);
  }
}
\`\`\`

### Construction (TypeScript)

\`\`\`ts
import { eventful, type Eventful } from 'asljs-eventful';

type MyClassEvents =
  { greet: [message: string]; };

export class MyClass implements Eventful<MyClassEvents> {
  name: string;

  declare on: Eventful<MyClassEvents>['on'];
  declare once: Eventful<MyClassEvents>['once'];
  declare off: Eventful<MyClassEvents>['off'];
  declare emit: Eventful<MyClassEvents>['emit'];
  declare emitAsync: Eventful<MyClassEvents>['emitAsync'];
  declare has: Eventful<MyClassEvents>['has'];

  constructor(name: string) {
    eventful(this);

    this.name = name;
  }

  greet() {
    this.emit(
      'greet',
      \`Hello, \${this.name}\`);
  }
}
\`\`\`

### Advanced Options

Trace event invocations to console:

\`\`\`js
const obj =
  eventful(
    { },
    { trace:
        (action, payload) => {
          console.log(
            \`Action: \${action}\`,
            payload);
        } });

// Tracing (event, payload):
// - 'new' on creation, { object }
// - 'on' when subscribing, { object, event, listener }
// - 'off' when unsubscribing, { object, event, listener }
// - 'emit' for sync emit, { object, event, args, listeners }
// - 'emitAsync' for async emit, { object, event, args, listeners }
\`\`\`

Custom error handler for listener errors:

\`\`\`js
const obj =
  eventful(
    { },
    { error:
        ({ error, object, event, listener }) => {
          console.error(
            \`Error in listener for event "\${event}"\`,
            error);
        } });
\`\`\`

Strict mode to propagate listener errors:

\`\`\`js
const obj =
  eventful(
    { },
    { strict: true });
\`\`\`

### Global Events

\`eventful\` is also a global emitter. When you create an enhanced object via
\`eventful(target, options)\`, its lifecycle and actions are traced via the
per-instance \`trace\` hook and also emitted as global events on \`eventful\`.

\`\`\`js
const offNew =
  eventful.on(
    'new',
    ({ object }) => {
      console.log('created', object);
    });

const offError =
  eventful.on(
    'error',
    ({ error, object, event }) => {
      console.error('listener error', event, error);
    });

// Later
offNew();
offError();
\`\`\`

Note: if a **global** \`eventful.on('error', ...)\` listener throws, \`eventful\`
throws a \`ListenerError\` (an \`Error\` subclass with fields
\`{ error, object, event, listener }\`) to avoid an infinite error loop.

## API

### eventful([target], [options])

Wraps the \`target\` object with event capabilities. If no target is provided,
a new empty object is created.

- \`target\` (Object): The object to be enhanced with event capabilities.
- \`options\` (Object): Configuration options.
  - \`error\` (Function | null): Optional error hook called with
    \`{ error, object, event, listener }\`.
  - \`trace\` (Function | null): Optional trace hook called with
    \`(action, payload)\`.
  - \`strict\` (Boolean): If true, propagates listener errors; otherwise they
    are isolated. Defaults to false.

### on(event, listener)

Registers a listener for the specified event.

- \`event\` (String | Symbol): The event name.
- \`listener\` (Function): The callback function to be invoked when the event is
  emitted.

Returns a function to remove the listener.

### once(event, listener)

Registers a one-time listener for the specified event. The listener is removed
after its first invocation.

- \`event\` (String | Symbol): The event name.
- \`listener\` (Function): The callback function to be invoked when the event is
  emitted.

Returns a function to remove the listener.

Example:

\`\`\`js
obj.once(
  'tick',
  n => console.log('first only', n));

obj.emit('tick', 1); // logs
obj.emit('tick', 2); // no-op; already unsubscribed
\`\`\`

### off(event, listener)

Removes a listener for the specified event.

- \`event\` (String | Symbol): The event name.
- \`listener\` (Function): The callback function to be removed.

### emit(event, ...args)

Emits the specified event, invoking all registered listeners with the provided
arguments.

- \`event\` (String | Symbol): The event name.
- \`...args\` (Any): Arguments to pass to the listeners.

### emitAsync(event, ...args)

Emits the specified event asynchronously, running listeners in parallel.
In non-strict mode, all listeners run and rejections are isolated; in strict
mode, the first rejection causes the returned promise to reject.

- \`event\` (String | Symbol): The event name.
- \`...args\` (Any): Arguments to pass to the listeners.

Returns a Promise that resolves when all listeners have been invoked.

### has(event)

Checks if there are any listeners registered for the specified event.

- \`event\` (String | Symbol): The event name.

Returns \`true\` if there are listeners, otherwise \`false\`.

Example:

\`\`\`js
const off =
  obj.on('e', () => {});

console.log(obj.has('e')); // true
off();
console.log(obj.has('e')); // false
\`\`\`

## License

MIT License. See [LICENSE](LICENSE.md) for details.

[#1]: https://github.com/AlexandriteSoftware/asljs
`,tt=`# data-binding

> Part of [Alexandrite Software Library][#1] - a set of high-quality,
performant JavaScript libraries for everyday use.

## Overview

\`asljs-data-binding\` provides declarative DOM bindings using explicit
\`data-bind-*\` attributes. Bindings are applied with
\`bindDataModel(root, model, options?)\`.

There are three binding families:

- Value bindings: write model values to \`textContent\`, \`innerHTML\`, or an
  attribute.
- Event bindings: wire DOM events to model actions.
- Context bindings: switch the model context for a descendant subtree.

Both families support lightweight reactivity through \`observable.watch(...)\`
on the configured model path.

## Installation

\`\`\`bash
npm install asljs-data-binding
\`\`\`

NPM Package:
[asljs-data-binding](https://www.npmjs.com/package/asljs-data-binding)

## Usage

\`\`\`ts
import {
    bindDataModel
  } from 'asljs-data-binding';
import {
    observable
  } from 'asljs-observable';

const root =
  document.body;

const model =
  observable(
    { user:
        { name: 'Alex' },
      save: () => {
        console.log('saved');
      } });

const dispose =
  bindDataModel(
    root,
    model,
    {
      pipes:
        { yesno: value => value ? 'Yes' : 'No' }
    });

// later:
dispose();
\`\`\`

Example bindings:

\`\`\`html
<div data-bind-text="user.name"></div>
<div data-bind-text="user.active | yesno"></div>
<div data-bind-html="body | wrap:'<span>':'</span>'"></div>
<button data-bind-onclick="save">Save</button>
\`\`\`

Use \`data-bind-context\` to switch the model context for a subtree:

\`\`\`html
<div data-bind-context="user">
  <h1 data-bind-text="name"></h1>
  <button data-bind-onclick="save">Save</button>
</div>
\`\`\`

Multiple bindings on the same element are supported and preferred when they
describe different concerns:

\`\`\`html
<a
  data-bind-href="url"
  data-bind-text="label | upper"
  data-bind-class-active="isActive"
  data-bind-onclick="openDetails"
></a>
\`\`\`

## Binding Syntax

### Context binding

\`data-bind-context\` switches the model context for the entire descendant
subtree.

General form:

\`\`\`text
data-bind-context="path"
\`\`\`

The \`path\` is resolved against the current model. The resulting object becomes
the model context for all descendant bindings.

Example — binding to a nested object:

\`\`\`html
<div data-bind-context="user">
  <h1 data-bind-text="name"></h1>
  <span data-bind-text="email"></span>
</div>
\`\`\`

This is equivalent to writing \`user.name\` and \`user.email\` on the descendants
without the context switch.

Nested \`data-bind-context\` attributes stack naturally:

\`\`\`html
<div data-bind-context="item">
  <div data-bind-context="author">
    <span data-bind-text="name"></span>
  </div>
</div>
\`\`\`

Here \`name\` resolves relative to \`item.author\`.

Reactivity:

- \`data-bind-context\` watches its path on the parent context
- when the context object is replaced, all descendant bindings are rebound
  against the new context
- stale watchers from the old context are removed

Null/undefined context:

- if the path resolves to \`null\` or \`undefined\`, descendant bindings degrade
  gracefully following the existing nullish conventions (empty text, removed
  attributes, action warnings)
- if the context later becomes a non-null object, descendants become active
  again

### Value bindings

General form:

\`\`\`text
data-bind-<target>="path[ | pipe[:arg1[:arg2...]]]*"
\`\`\`

Pipe arguments can be quoted when they contain characters like \`:\`.

\`\`\`text
data-bind-html="content | wrap:'<span>':'</span>'"
\`\`\`

Supported targets:

- \`data-bind-text\` -> \`textContent\`
- \`data-bind-html\` -> \`innerHTML\`
- \`data-bind-<attr>\` -> HTML attribute (for example \`href\`, \`title\`,
  \`aria-label\`)
- \`data-bind-prop-<name>\` -> DOM property (for example \`value\`, \`checked\`)
- \`data-bind-class-<name>\` -> class toggle by truthy/falsy value

Examples:

\`\`\`html
<div data-bind-text="name"></div>
<div data-bind-text="name | upper"></div>
<div data-bind-text="createdAt | date:short"></div>
<div data-bind-text="amount | currency:GBP"></div>
<div data-bind-html="content | wrap:'<span>':'</span>'"></div>
<a data-bind-href="url"></a>
<input data-bind-prop-value="name">
<button data-bind-class-active="isSelected"></button>
<div data-bind-html="body | safeHtml"></div>
\`\`\`

Reactivity for value bindings:

- depends only on \`path\`
- subscribes to updates for that path
- pipe args are static strings and are not reactive

### Event bindings

General form:

\`\`\`text
data-bind-on<event>="actionPath"
\`\`\`

Examples:

\`\`\`html
<button data-bind-onclick="activate"></button>
<a data-bind-onclick="openDetails"></a>
<form data-bind-onsubmit="save"></form>
\`\`\`

Runtime behavior:

- \`data-bind-onclick\` listens to \`click\`, \`data-bind-onsubmit\` listens to
  \`submit\`, etc.
- action is resolved from model by \`actionPath\`
- when action is a function, it is invoked as \`(event, model, element)\`
- missing or non-function actions emit warnings and keep binding alive

Reactivity for event bindings:

- depends only on \`actionPath\`
- subscribes to updates for that path
- handler reference refreshes when action changes

## Built-ins

Value pipes:

- \`string\`
- \`number\`
- \`currency[:code]\`
- \`date[:format]\`
- \`datetime[:format]\`
- \`fixed[:digits]\`
- \`upper\`
- \`lower\`
- \`json[:spaces]\`
- \`default:value\`
- \`safeHtml\`

Locale behavior:

- by default, \`Intl\` pipes use runtime/browser locale settings
- to force a locale, compose custom pipes using \`createBuiltInPipes('en-GB')\`
  in your own implementation

## Error Handling

- unknown pipe: throws
- pipe error: exception from pipe propagates
- missing/non-function action: warning, binding continues

Nullish behavior:

- built-in pipes preserve \`null\` and \`undefined\` values
- \`data-bind-text\` and \`data-bind-html\` render \`null\`/\`undefined\` as \`''\`
- \`data-bind-<attr>\` removes the attribute when final value is \`null\` or
  \`undefined\`

## API Reference

Core API:

- \`bindDataModel(root, model, options)\`

Types are exported from:

- \`BindDataModelOptions\`
- \`DataModel\`

## License

MIT License. See [LICENSE](LICENSE.md) for details.

[#1]: https://github.com/AlexandriteSoftware/asljs
`,at=`# AI

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
- this file (\`components/AI.md\`) for AI-facing usage guidance.
`,st=`# dali

> Part of [Alexandrite Software Library][#1] - a set of high-quality,
performant JavaScript libraries for everyday use.

## Overview

\`asljs-dali\` is a data layer for apps that store data in IndexedDB. It is for
developers who want a typed, event-aware table abstraction instead of
hand-writing low-level request and transaction plumbing. Use it to model
stores as \`Table<T>\`, keep CRUD operations consistent, and optionally enforce
optimistic concurrency with version strategies.

## Installation

\`\`\`bash
npm install asljs-dali
\`\`\`

NPM Package: [asljs-dali](https://www.npmjs.com/package/asljs-dali)

## Usage

\`\`\`ts
import {
    dbOpen,
    Table,
  } from 'asljs-dali';

type Note =
  { id: string;
    title: string; };

const db =
  await dbOpen(
    'notes-db',
    [ targetDb => {
        targetDb.createObjectStore(
          'notes',
          { keyPath: 'id' });
      } ]);

const notes =
  new Table<Note>(
    'notes',
    db,
    { /* options */ });

await notes.add(
  { id: '1',
    title: 'Hello' });

const row =
  await notes.getOne('1');
\`\`\`

### Cross-tab notifications with \`observe()\`

\`Table\` supports two notification paths:

| Method | Who calls the callback |
|---|---|
| \`notify(receiver)\` | Local writes committed by **this** Table instance only |
| \`observe(receiver)\` | Local writes **and** remote writes from other tabs |

Pass a \`broadcastService\` to the Table constructor to enable cross-tab delivery.
The service is an abstraction — you can implement it with \`BroadcastChannel\` or
any equivalent transport.

\`\`\`ts
import {
    type TableBroadcastMessage,
    type TableBroadcastService,
  } from 'asljs-dali';

// BroadcastChannel-backed implementation
function makeBroadcastService(
    channelName: string
  ): TableBroadcastService
{
  const channel = new BroadcastChannel(channelName);

  return {
    publish(message: TableBroadcastMessage) {
      channel.postMessage(message);
    },
    subscribe(handler) {
      const listener = (ev: MessageEvent) => handler(ev.data);
      channel.addEventListener('message', listener);
      return () => channel.removeEventListener('message', listener);
    },
  };
}

const notes =
  new Table<Note>(
    'notes',
    db,
    { broadcastService: makeBroadcastService('notes-sync') });

// Local-only — fires only for writes made by this Table instance.
notes.notify(
  { add(record) { console.log('local add', record); } });

// Observed — fires for both local and remote writes.
// The \`source\` field tells you where the change came from.
const unobserve =
  notes.observe(event => {
    console.log(event.source, event.eventType);
    if (event.eventType === 'add')
      console.log(event.record);
  });

// When the Table is no longer needed, dispose it to stop listening.
notes.dispose();
\`\`\`

**Design rules:**

- Broadcast messages are published **only after** a successful IndexedDB
  transaction; rolled-back or provisional changes are never broadcast.
- A Table instance **discards its own echoed messages** using a per-instance
  \`originId\` included in every broadcast message.
- Remote messages are routed only to \`observe()\` subscribers; local-only
  \`notify()\` subscribers are never called for remote events.
- A Table receiving a remote message **does not re-publish** it, preventing
  broadcast loops.

### Live views with \`record()\` and \`recordset()\`

\`Table\` provides **live-first** APIs that return reactive containers tracking
committed table changes automatically.  Both containers are built on
**ASLJS eventful** (for domain events) and **ASLJS observable** (for
property-path watching).

#### \`Table.record(key)\` → \`LiveRecord<T>\`

Returns a live single-record view for a specific primary key.

\`\`\`ts
const live = notes.record('1');

// Stable property — null until the initial load settles.
console.log(live.record); // { id: '1', title: 'Hello' } | null

// Domain events via ASLJS eventful.
live.on('changed', (record, previous) => {
  console.log('record changed to', record, 'was', previous);
});

live.on('deleted', previous => {
  console.log('record deleted, was', previous);
});

// Property-path watching via ASLJS observable.
live.watch('record.title', title => {
  console.log('title is now', title);
});

// Release the live view when no longer needed.
live.dispose();
\`\`\`

Behaviour:

- \`record\` is \`null\` until the initial database read settles.
- On \`add\` / \`update\` for the tracked key — \`record\` is updated and \`changed\`
  fires.
- On \`delete\` or \`clear\` — \`record\` becomes \`null\` and \`deleted\` fires.
- Unrelated changes on the same table do not affect this view.
- \`watch(path, cb)\` is called immediately with the current value and again
  whenever the path changes.  Watchers are anchored to the stable container.

> **Snapshot read**: use \`table.getOne(key)\` instead.
>
> **Limitation**: \`record(key)\` is limited to key-only semantics.

#### \`Table.recordset(predicate)\` → \`LiveRecordSet<T>\`

Returns a live filtered set view for records matching a client-side predicate.

\`\`\`ts
const live = notes.recordset(note => note.title.startsWith('A'));

// Stable property — a readonly array snapshot.
console.log(live.records); // readonly Note[]

// Domain events via ASLJS eventful.
live.on('added',   record          => console.log('added',   record));
live.on('removed', record          => console.log('removed', record));
live.on('updated', (record, prev)  => console.log('updated', record, prev));
live.on('cleared', ()              => console.log('cleared'));
live.on('changed', records         => console.log('set now has', records.length));

// Property-path watching via ASLJS observable.
live.watch('records', records => {
  console.log('count:', (records as readonly Note[]).length);
});

live.dispose();
\`\`\`

Behaviour:

- On initial creation the table is scanned and all matching records are loaded.
- On \`add\` — the record is included if the predicate returns \`true\`; \`added\`
  fires.
- On \`update\` — membership is re-evaluated; \`added\`, \`updated\`, or \`removed\`
  fires accordingly.
- On \`delete\` — the record is removed if it was present; \`removed\` fires.
- On \`clear\` — the set is emptied and \`cleared\` fires.
- \`changed\` fires after every mutation.

> **Snapshot read**: use \`table.scan(predicate)\` instead.
>
> **Limitation**: \`recordset(predicate)\` is limited to client-side predicate
> semantics. Joins, ordering, and DB-level query composition are not supported.

## API Reference

Core:

- \`dbOpen(name, upgrades)\`
- \`dbDelete(name)\`
- \`dbRequestAsync(request)\`
- \`Table<T>\`

Live views:

- \`LiveRecord<T>\` — live single-record container returned by \`Table.record(key)\`
  - Events (ASLJS eventful): \`changed\`, \`deleted\`
  - Watch (ASLJS observable): \`record.someField\`
- \`LiveRecordSet<T>\` — live filtered set container returned by \`Table.recordset(predicate)\`
  - Events (ASLJS eventful): \`added\`, \`removed\`, \`updated\`, \`cleared\`, \`changed\`
  - Watch (ASLJS observable): \`records\`, \`records.length\`
- \`LiveRecordEvents<T>\` — event map type for \`LiveRecord\`
- \`LiveRecordSetPayload<T>\` — \`set:record\` / \`set\` event payload for \`LiveRecord\`
- \`LiveRecordSetEvents<T>\` — event map type for \`LiveRecordSet\`
- \`LiveRecordSetSetPayload<T>\` — \`set:records\` / \`set\` event payload for \`LiveRecordSet\`

Versioning:

- \`TableVersionStrategy<T>\`
- \`TableVersionConflictError\`
- \`IncrementTableVersionStrategy<T>\`
- \`UuidTableVersionStrategy<T>\`

Delete strategies:

- \`TableDeleteStrategy<T>\`
- \`UuidSoftDeleteTableDeleteStrategy<T>\`

Transactions:

- \`TxMode\`
- \`txRead(db, storeName, tx?)\`
- \`txWrite(db, storeName, tx?)\`
- \`txDone(tx)\`
- \`txEnsure(tx, storeName, mode)\`
- \`txReuseOrCreate(tx, storeNames, mode, db)\`

Broadcast / cross-tab:

- \`TableBroadcastService\` — interface for the publish/subscribe transport
- \`TableBroadcastMessage\` — message shape published on every committed change
- \`TableObservedEvent<T>\` — event delivered to \`observe()\` subscribers
- \`TableObservedReceiver<T>\` — callback type for \`observe()\`

## License

MIT License. See [LICENSE](LICENSE.md) for details.

[#1]: https://github.com/AlexandriteSoftware/asljs
`,ze=`
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

${nt}

[observable] guide:

${et}

[data-binding] guide:

${tt}

[components] guide:

${at}

[dali] guide:

${st}
`,Se="asljs-app-builder:eval-request",Ye="asljs-app-builder:eval-response",Qe="asljs-app-builder:diagnostics-request",Xe="asljs-app-builder:diagnostics-response",_e=`<script>
(() => {
  const REQUEST = '${Se}';
  const RESPONSE = '${Ye}';
  const DIAG_REQUEST = '${Qe}';
  const DIAG_RESPONSE = '${Xe}';
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
<\/script>`;function it(e,n,t){if(n.length===0){e.removeAttribute("srcdoc"),e.src="about:blank";return}const s=n.find(o=>o.name==="index.html")??n.find(o=>o.name.endsWith(".html"))??null;if(s===null){e.removeAttribute("srcdoc"),e.src="about:blank";return}let a=s.content;const i=n.find(o=>o.name==="style.css")??n.find(o=>o.name.endsWith(".css"))??null;i!==null&&(a=a.replace(/<link[^>]+href=["']style\.css["'][^>]*>/gi,`<style>${i.content}</style>`),a=a.replace(/<link[^>]+href=["']([^"']+\.css)["'][^>]*>/gi,`<style>${i.content}</style>`));for(const o of n){if(!o.name.endsWith(".js"))continue;const g=o.name.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");a=a.replace(new RegExp(`(<script[^>]*?)\\s+src=["']${g}["']([^>]*)><\\/script>`,"gi"),(A,v,d)=>{const h=`${String(v)} ${String(d)}`;return/type=["']module["']/i.test(h)?`<script type="module">${o.content}<\/script>`:`<script>${o.content}<\/script>`})}a=ct(a,n),a=ut(a,t),a=lt(a),e.srcdoc=a}async function ot(e,n){const t=await Ze(e,Se,{code:n},Ye);if(t.ok===!0)return t.value;throw new Error(typeof t.error=="string"?t.error:"Unknown preview evaluation error.")}async function rt(e){const n=await Ze(e,Qe,{},Xe);if(n.ok!==!0)throw new Error(typeof n.error=="string"?n.error:"Failed to read preview diagnostics.");return n.diagnostics??{logs:[],errors:[]}}async function Ze(e,n,t,s){const a=e.contentWindow;if(a===null)throw new Error("Preview frame is not available.");const i=crypto.randomUUID();return new Promise((o,g)=>{const A=window.setTimeout(()=>{d(),g(new Error("Timed out waiting for app evaluation result."))},5e3),v=h=>{if(h.source!==a)return;const r=h.data;r.type!==s||r.id!==i||(d(),o(r))};function d(){window.clearTimeout(A),window.removeEventListener("message",v)}window.addEventListener("message",v),a.postMessage({type:n,id:i,...t},"*")})}function lt(e){return e.includes(Se)?e:e.includes("</body>")?e.replace("</body>",`${_e}</body>`):`${e}
${_e}`}function ct(e,n){if(/type=["']importmap["']/i.test(e))return e;const t=n.find(o=>o.name==="package.json")??null,s=dt(t==null?void 0:t.content),a=Object.fromEntries(s.map(([o,g])=>[o,`https://esm.sh/${o}@${g}?bundle`]));if(Object.keys(a).length===0)return e;const i=`<script type="importmap">${JSON.stringify({imports:a})}<\/script>`;return/<head[^>]*>/i.test(e)?e.replace(/<head[^>]*>/i,o=>`${o}
${i}`):`${i}
${e}`}function dt(e){if(e===void 0)return Re();try{const n=JSON.parse(e),t={...n.dependencies??{},...n.devDependencies??{}};return["asljs-eventful","asljs-observable","asljs-data-binding","asljs-components","asljs-dali","openai"].map(i=>[i,pt(t[i])])}catch{return Re()}}function pt(e){if(typeof e!="string"||e.trim()==="")return"latest";const n=e.trim().replace(/^[~^<>=\s]+/,"");return n===""?"latest":n}function Re(){return[["asljs-eventful","latest"],["asljs-observable","latest"],["asljs-data-binding","latest"],["asljs-components","latest"],["asljs-dali","latest"],["openai","latest"]]}function ut(e,n){if(e.includes("__ASLJS_APP_BUILDER_HOST__"))return e;const t=`<script>window.__ASLJS_APP_BUILDER_HOST__ = ${JSON.stringify({openAiApiKey:(n==null?void 0:n.hostOpenAiApiKey)===void 0||n.hostOpenAiApiKey.trim()===""?null:n.hostOpenAiApiKey})};<\/script>`;return e.includes("</head>")?e.replace("</head>",`${t}</head>`):e.includes("<body")?e.replace(/<body[^>]*>/i,s=>`${s}
${t}`):`${t}
${e}`}function mt(e){const n=e.selectElement;n.replaceChildren();const t=[...e.apps].sort((i,o)=>o.updatedAt.localeCompare(i.updatedAt));for(const i of t){const o=document.createElement("option");o.value=i.id,o.textContent=i.name,n.appendChild(o)}if(t.length>0){const i=document.createElement("option");i.value="__separator__",i.textContent="────────",i.disabled=!0,n.appendChild(i)}const s=document.createElement("option");s.value=e.newActionValue,s.textContent="New...",n.appendChild(s);const a=document.createElement("option");a.value=e.importActionValue,a.textContent="Import...",n.appendChild(a),e.currentAppId!==null&&(n.value=e.currentAppId)}function ft(e){const n=e.selectElement;if(n.replaceChildren(),e.files.length===0){const s=document.createElement("option");s.value="",s.textContent="No files",n.appendChild(s),n.value="",n.disabled=!0;return}for(const s of e.files){const a=document.createElement("option");a.value=s.name,a.textContent=s.name,n.appendChild(a)}const t=e.activeFileName??e.files[0].name;n.value=t,n.disabled=!1}function gt(e){const n=e.files.find(t=>t.name===e.activeFileName);e.textAreaElement.value=(n==null?void 0:n.content)??"",e.textAreaElement.disabled=n===void 0}function vt(e,n){e.disabled=n,e.innerHTML=n?'<span class="spinner"></span> Sending…':"Send"}function ht(e,n,t){e.textContent=n,e.classList.toggle("hidden",!t)}function bt(e,n,t){const s=document.createElement("div");s.className=`chat-msg ${n}`;const a=document.createElement("div");a.className="chat-msg-role",a.textContent=n==="user"?"You":"Assistant";const i=document.createElement("div");i.className="chat-bubble",i.textContent=t,s.appendChild(a),s.appendChild(i),e.appendChild(s),e.scrollTop=e.scrollHeight}function en(e){const n=!e.panelElement.classList.contains("collapsed");return e.toggleButtonElement.textContent=n?e.collapsedLabel:e.expandedLabel,e.toggleButtonElement.setAttribute("aria-expanded",n?"false":"true"),e.panelElement.classList.toggle("collapsed",n),e.panelsElement.classList.toggle(e.collapsedPanelsClass,n),n}function yt(e,n){return[{id:n(),appId:e,name:"index.html",content:`<!doctype html>
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
`}]}function R(){return crypto.randomUUID()}function j(){return new Date().toISOString()}function c(e){const n=document.getElementById(e);if(n===null)throw new Error(`Missing element #${e}`);return n}const wt=c("app-workspace"),Et=c("first-app-setup"),xe=c("first-api-key-input"),J=c("first-app-name-input"),At=c("btn-create-first-app"),St=c("btn-create-todo-sample"),je=c("panels"),xt=c("panel-chat"),jt=c("panel-editor"),ve=c("app-select"),he=c("file-select"),Te=c("file-content"),ke=c("chat-messages"),Tt=c("chat-progress"),be=c("chat-input"),nn=c("btn-generate"),kt=c("btn-run"),Lt=c("btn-refresh-preview"),X=c("preview-frame"),It=c("btn-new-app"),Pt=c("btn-import"),Ct=c("btn-project-settings"),Ot=c("btn-export"),Ft=c("btn-settings"),Nt=c("btn-agent-instructions"),tn=c("btn-toggle-chat"),an=c("btn-toggle-files"),Z=c("settings-modal"),Dt=c("btn-close-settings"),Mt=c("btn-save-settings"),_t=c("btn-cancel-settings"),ye=c("api-key-input"),sn=c("model-select"),on=c("theme-select"),rn=c("font-size-input"),ln=c("max-tool-steps-input"),V=c("name-modal"),Rt=c("name-modal-title"),Q=c("app-name-input"),oe=c("btn-confirm-name"),Bt=c("btn-cancel-name"),$t=c("btn-close-name-modal"),ee=c("project-settings-modal"),U=c("project-name-input"),Ut=c("btn-save-project-settings"),Jt=c("btn-delete-project"),Kt=c("btn-close-project-settings"),Wt=c("btn-close-project-settings-x"),ne=c("import-file"),te=c("agent-instructions-modal"),we=c("agent-instructions-text"),qt=c("btn-close-agent-instructions"),Ht=c("btn-close-agent-instructions-2"),Vt=c("btn-copy-agent-instructions"),cn="asljs-app-builder-settings",dn="light",Ee=14,pn="__new__",un="__import__";function D(){try{const e=localStorage.getItem(cn)??"{}";return JSON.parse(e)}catch{return{}}}function Le(e){localStorage.setItem(cn,JSON.stringify(e))}function re(){return D().apiKey??""}function mn(){const e=D().model;return e==="gpt-5.3-codex"||e==="gpt-5.4"?e:Hn}function fn(){const e=D().maxToolSteps;if(!Number.isFinite(e))return H;const n=Math.floor(e);return n<1?H:n}function gn(){return D().theme==="light"?"light":dn}function vn(){const e=D().fontSize;if(!Number.isFinite(e))return Ee;const n=Math.floor(e);return n<12||n>20?Ee:n}function hn(){document.body.dataset.theme=gn(),document.documentElement.style.fontSize=`${vn()}px`}const P=Rn({getCurrentAppId:()=>l.currentAppId,getFiles:()=>l.files,setFiles:e=>{l.files=e},getActiveFileName:()=>l.activeFileName,setActiveFileName:e=>{l.activeFileName=e},createFileId:R,saveFile:qe,deleteFileById:async e=>{await Dn(e)},runApp:ce,evaluateInApp:e=>ot(X,e),getAppDiagnostics:()=>rt(X),wait:e=>new Promise(n=>{window.setTimeout(n,e)})});function ae(){mt({selectElement:ve,apps:l.apps,currentAppId:l.currentAppId,newActionValue:pn,importActionValue:un})}function bn(){wt.classList.remove("hidden");const e=l.currentAppId!==null&&l.apps.some(n=>n.id===l.currentAppId);if(Et.classList.toggle("hidden",e),je.classList.toggle("hidden",!e),!e){xe.value=re(),J.value="";return}Ie(),Pe()}async function yn(){const e=J.value.trim();if(e===""){J.focus();return}const n=xe.value.trim();if(n!==""){const s=D();s.apiKey=n,Le(s)}const t={id:R(),name:e,createdAt:j(),updatedAt:j()};await K(t),l.apps=[...l.apps,t],await W(t.id)}async function Gt(){const e=J.value.trim(),n=e===""?"TODO Sample":e,t=xe.value.trim();if(t!==""){const o=D();o.apiKey=t,Le(o)}const s=R(),a={id:s,name:n,createdAt:j(),updatedAt:j()},i=yt(s,R);await K(a),await He(s,i),l.apps=[...l.apps,a],await W(s)}function Ie(){ft({selectElement:he,files:l.files,activeFileName:l.activeFileName})}function Pe(){gt({textAreaElement:Te,files:l.files,activeFileName:l.activeFileName})}function Be(e){l.generating=e,vt(nn,e)}function me(e,n){ht(Tt,e,n)}function M(e,n){bt(ke,e,n)}async function le(){if(l.activeFileName===null||l.currentAppId===null)return;const e=l.files.find(t=>t.name===l.activeFileName);if(e===void 0)return;const n=Te.value;e.content!==n&&(e.content=n,await qe(e))}async function W(e){var t;l.currentAppId=e;const n=await Nn(e);l.files=n,l.activeFileName=((t=n[0])==null?void 0:t.name)??null,ke.replaceChildren()}function wn(){Rt.textContent="New App",Q.value="",V.classList.remove("hidden"),Q.focus(),oe.onclick=async()=>{const e=Q.value.trim();if(e==="")return;V.classList.add("hidden");const n={id:R(),name:e,createdAt:j(),updatedAt:j()};await K(n),l.apps=[...l.apps,n],await W(n.id)}}function Ce(){V.classList.add("hidden"),oe.onclick=null}function zt(){const e=l.apps.find(n=>n.id===l.currentAppId);e!==void 0&&(U.value=e.name,ee.classList.remove("hidden"),U.focus(),U.select())}function G(){ee.classList.add("hidden")}async function En(){const e=l.apps.find(s=>s.id===l.currentAppId);if(e===void 0)return;const n=U.value.trim();if(n===""){U.focus();return}const t={...e,name:n,updatedAt:j()};await K(t),l.apps=l.apps.map(s=>s.id===e.id?t:s),G()}async function Yt(){G(),await Qt()}async function Qt(){const e=l.apps.find(n=>n.id===l.currentAppId);e!==void 0&&confirm(`Delete "${e.name}"? This cannot be undone.`)&&(await Fn(e.id),l.apps=l.apps.filter(n=>n.id!==e.id),l.currentAppId=null,l.files=[],l.activeFileName=null,ke.replaceChildren(),X.src="about:blank")}async function An(){const e=be.value.trim();if(e==="")return;const n=re();if(n===""){M("assistant","No OpenAI API key set. Open Settings (⚙) to add your key. Generation is optional — you can also create files manually.");return}if(l.currentAppId===null){M("assistant","Please create or open an app first.");return}be.value="",M("user",e),Be(!0),me("Starting generation...",!0);try{const t=mn(),s=fn(),a=await Yn(e,n,t,P,{initialToolStepLimit:s,systemPrompt:ze,onToolStepLimit:async({stepsCompleted:o})=>confirm(`AI reached ${o} tool steps without finishing. Continue for 12 more steps?`),onProgress:o=>{me(o,!0)}}),i=l.apps.find(o=>o.id===l.currentAppId);if(i!==void 0){const o={...i,updatedAt:j()};await K(o),l.apps=l.apps.map(g=>g.id===i.id?o:g)}M("assistant",a.summary),ce()}catch(t){const s=t instanceof Error?t.message:String(t);M("assistant",`Error: ${s}`)}finally{me("",!1),Be(!1)}}function ce(){le().then(()=>{it(X,l.files,{hostOpenAiApiKey:re()})})}async function Xt(){const e=l.apps.find(i=>i.id===l.currentAppId);if(e===void 0)return;await le();const n={app:e,files:l.files,exportedAt:j()},t=new Blob([JSON.stringify(n,null,2)],{type:"application/json"}),s=URL.createObjectURL(t),a=document.createElement("a");a.href=s,a.download=`${e.name.replace(/\s+/g,"-")}.json`,a.click(),URL.revokeObjectURL(s)}function Sn(){ne.value="",ne.click()}async function Zt(){var n;const e=(n=ne.files)==null?void 0:n[0];if(e!==void 0)try{const t=await e.text(),s=JSON.parse(t);if(s.app===void 0||typeof s.app.name!="string"||!Array.isArray(s.files))throw new Error("Invalid app JSON format.");const a=R(),i={id:a,name:`${s.app.name} (imported)`,createdAt:s.app.createdAt??j(),updatedAt:j()},o=s.files.filter(g=>typeof g.name=="string"&&typeof g.content=="string").map(g=>({id:R(),appId:a,name:g.name,content:g.content}));await K(i),await He(a,o),l.apps=[...l.apps,i],await W(a)}catch(t){const s=t instanceof Error?t.message:String(t);alert(`Import failed: ${s}`)}}function ea(){ye.value=re(),sn.value=mn(),on.value=gn(),rn.value=String(vn()),ln.value=String(fn()),Z.classList.remove("hidden"),ye.focus()}function de(){Z.classList.add("hidden")}function na(){const e=D();e.apiKey=ye.value.trim(),e.model=sn.value==="gpt-5.4"?"gpt-5.4":"gpt-5.3-codex",e.theme=on.value==="light"?"light":dn;const n=Number.parseInt(rn.value,10);e.fontSize=Number.isFinite(n)&&n>=12&&n<=20?n:Ee;const t=Number.parseInt(ln.value,10);e.maxToolSteps=Number.isFinite(t)&&t>=1?t:H,Le(e),hn(),de()}function ta(){we.value=ze,te.classList.remove("hidden"),we.scrollTop=0}function Oe(){te.classList.add("hidden")}function aa(){en({panelElement:xt,toggleButtonElement:tn,panelsElement:je,collapsedPanelsClass:"chat-collapsed",expandedLabel:"Chat ▾",collapsedLabel:"Chat ▸"})}function sa(){en({panelElement:jt,toggleButtonElement:an,panelsElement:je,collapsedPanelsClass:"files-collapsed",expandedLabel:"Files ▾",collapsedLabel:"Files ▸"})}async function ia(){const e=we.value;try{await navigator.clipboard.writeText(e),M("assistant","Agent instructions copied to clipboard.")}catch{M("assistant","Could not copy to clipboard automatically. You can still select and copy from the instructions modal.")}}l.on("set:apps",()=>ae());l.on("set:currentAppId",()=>{ae(),bn()});l.on("set:files",()=>{Ie(),Pe()});l.on("set:activeFileName",()=>{Ie(),Pe()});It.addEventListener("click",wn);Pt.addEventListener("click",Sn);Ct.addEventListener("click",zt);Ot.addEventListener("click",()=>{Xt()});nn.addEventListener("click",()=>{An()});kt.addEventListener("click",ce);Lt.addEventListener("click",ce);Ft.addEventListener("click",ea);Nt.addEventListener("click",ta);tn.addEventListener("click",aa);an.addEventListener("click",sa);Dt.addEventListener("click",de);Mt.addEventListener("click",na);_t.addEventListener("click",de);Z.addEventListener("click",e=>{e.target===Z&&de()});qt.addEventListener("click",Oe);Ht.addEventListener("click",Oe);Vt.addEventListener("click",()=>{ia()});te.addEventListener("click",e=>{e.target===te&&Oe()});oe.addEventListener("click",()=>{});Bt.addEventListener("click",Ce);$t.addEventListener("click",Ce);V.addEventListener("click",e=>{e.target===V&&Ce()});Ut.addEventListener("click",()=>{En()});Jt.addEventListener("click",()=>{Yt()});Kt.addEventListener("click",G);Wt.addEventListener("click",G);ee.addEventListener("click",e=>{e.target===ee&&G()});Q.addEventListener("keydown",e=>{e.key==="Enter"&&oe.click()});U.addEventListener("keydown",e=>{e.key==="Enter"&&(e.preventDefault(),En())});At.addEventListener("click",()=>{yn()});St.addEventListener("click",()=>{Gt()});J.addEventListener("keydown",e=>{e.key==="Enter"&&(e.preventDefault(),yn())});be.addEventListener("keydown",e=>{e.key==="Enter"&&!e.shiftKey&&(e.preventDefault(),An())});ve.addEventListener("change",()=>{const e=ve.value;if(e===pn){wn(),ae();return}if(e===un){Sn(),ae();return}e!==""&&e!==l.currentAppId&&W(e)});he.addEventListener("change",()=>{const e=he.value;e===""||e===l.activeFileName||(le(),l.activeFileName=e)});Te.addEventListener("blur",()=>{le()});ne.addEventListener("change",()=>{Zt()});window.listFileset=P.listFileset;window.readFile=P.readFile;window.setFileContent=P.setFileContent;window.replaceFilePart=P.replaceFilePart;window.deleteFile=P.deleteFile;window.evalInApp=P.evalInApp;window.getAppDiagnostics=P.getAppDiagnostics;window.runAppAndCollectDiagnostics=P.runAppAndCollectDiagnostics;async function oa(){hn();const e=await On();if(l.apps=e,e.length>0){const n=[...e].sort((t,s)=>s.updatedAt.localeCompare(t.updatedAt));await W(n[0].id)}else l.currentAppId=null,l.files=[],l.activeFileName=null,bn(),J.focus()}oa().catch(e=>{console.error("App Builder init failed:",e)});
