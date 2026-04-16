(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))a(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const o of r.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&a(o)}).observe(document,{childList:!0,subtree:!0});function t(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function a(s){if(s.ep)return;s.ep=!0;const r=t(s);fetch(s.href,r)}})();class Xn extends Error{constructor(n,t,a,s,r){super(n),this.name="ListenerError",this.error=t,this.object=a,this.event=s,this.listener=r}}function $(e){if(typeof e!="string"&&typeof e!="symbol")throw new TypeError("Expect event to be a string or symbol.")}function fe(e){return typeof e=="function"}function Xe(e){if(fe(e))return e}function on(e){return typeof e=="object"&&e!==null}function we(e){if(!fe(e))throw new TypeError("Expect a function.")}const Qn=(e=Object.create(null),n={})=>{if(!on(e)&&!fe(e))throw new TypeError("Expect an object or a function.");for(const p of["on","once","off","emit","emitAsync","has"])if(p in e)throw new Error(`Method "${p}" already exists.`);const{strict:t=!1,trace:a=null,error:s=null}=n,r=Xe(a)??null,o=Xe(s)??null,f=e!==_,w=(p,h)=>{r==null||r(p,h),f&&_.emit(p,h)};w("new",{object:e});const g=new Set,d=new Map,v={enumerable:!1,configurable:!0,writable:!0};return Object.defineProperties(e,{on:Object.assign({value:E},v),once:Object.assign({value:x},v),off:Object.assign({value:y},v),emit:Object.assign({value:k},v),emitAsync:Object.assign({value:L},v),has:Object.assign({value:I},v)}),e;function l(p,h){let b=d.get(p);b||d.set(p,b=new Set),b.add(h)}function m(p,h){const b=d.get(p);if(!b)return!1;const A=b.delete(h);return b.size===0&&d.delete(p),A}function u(p,h,b){const A={error:b,object:e,event:p,listener:h};if(o==null||o(A),e===_&&p==="error")throw new Xn("Error in a global error listener.",b,e,p,h);_.emit("error",A)}function E(p,h){$(p),we(h),w("on",{object:e,event:p,listener:h}),l(p,h);let b=!0;return()=>b?(b=!1,m(p,h)):!1}function x(p,h){$(p),we(h);const b=E(p,(...A)=>{b(),h(...A)});return b}function y(p,h){return $(p),we(h),w("off",{object:e,event:p,listener:h}),m(p,h)}function I(p){var h;return $(p),(((h=d.get(p))==null?void 0:h.size)??0)>0}function k(p,...h){$(p);const b=d.get(p)||g;if(w("emit",{object:e,listeners:[...b],event:p,args:h}),b.size!==0)for(const A of b)try{A(...h)}catch(C){if(u(p,A,C),t)throw C}}async function L(p,...h){$(p);const b=d.get(p)||g;if(w("emitAsync",{object:e,listeners:[...b],event:p,args:h}),b.size===0)return;const A=[...b].map(async C=>{try{await C(...h)}catch(Ye){if(u(p,C,Ye),t)throw Ye}});await(t?Promise.all(A):Promise.allSettled(A))}},_=Qn;_(_);function Zn(e){return!on(e)&&!fe(e)?!1:typeof e.on=="function"}function ln(e){if(Zn(e))return e}function T(e){return typeof e=="function"}function Re(e){return typeof e=="object"&&e!==null}function cn(e){if(!T(e))throw new TypeError("Expect a function.")}function Ie(e){if(e.trim()==="")throw new TypeError("Expect watch path to be a non-empty string.");const n=e.split(".");for(const t of n)if(t.trim()==="")throw new TypeError("Expect watch path segments to be non-empty.");return e.split(".").map(t=>t.trim()).filter(t=>t!=="")}function et(e,n){const t=Ie(n);if(t.length===0)return;let a=e;for(const s of t){if(!Re(a)||!(s in a))return;a=a[s]}return a}const dn=(e,n,t)=>{if(Array.isArray(e))throw new TypeError("Watching arrays is not supported.");cn(t);const a=typeof n=="string"?[n]:n;if(!Array.isArray(a))throw new TypeError("Expect properties to be a string or an array of strings.");for(const o of a){if(typeof o!="string")throw new TypeError("Expect properties to be a string or an array of strings.");Ie(o)}const s=()=>a.map(o=>et(e,o)),r=[];for(const o of a){const f=Ie(o);let w=null;const g=()=>{const d=[],v=(l,m)=>{if(!Re(l)||m>=f.length)return;const u=f[m],E=ln(l);if(E){const x=E.on(`set:${u}`,()=>{t(...s()),m<f.length-1&&w&&(w(),w=g())});d.push(x)}m<f.length-1&&v(l[u],m+1)};return v(e,0),()=>d.reduce((l,m)=>m()||l,!1)};w=g(),r.push(()=>w?w():!1)}return t(...s()),()=>r.reduce((o,f)=>f()||o,!1)};function nt(e,n){"watch"in e||Object.defineProperty(e,"watch",{configurable:!0,writable:!0,enumerable:!1,value(t,a){return n(typeof t=="string"?this:this,t,a)}})}function Qe(e,n){return Object.prototype.hasOwnProperty.call(e,n)}function xe(e){if(typeof e=="symbol")return!1;const n=typeof e=="number"?e:Number(e);return!Number.isInteger(n)||n<0||n>=4294967295?!1:typeof e=="number"||e===String(n)}function tt(e){return ln(e)?T(e.emit):!1}const pn=(e,n={})=>{const{eventful:t=_,trace:a=null,shallow:s=!1}=n;cn(t);const r=he.options,o=new WeakMap,f=l=>{if(s||!Re(l)||tt(l))return l;if(o.has(l))return o.get(l);const m=pn(l,{eventful:t,trace:a,shallow:s});return o.set(l,m),m},w=l=>{if(!s){if(Array.isArray(l)){for(let m=0;m<l.length;m++)l[m]=f(l[m]);return}for(const m of Reflect.ownKeys(l))Qe(l,m)&&(l[m]=f(l[m]))}},g=l=>{const m=Array.isArray(l);w(l),nt(l,dn);let u;const E=new Proxy(l,{set(x,y,I,k){const L=m&&xe(y),p=Reflect.get(x,y,k),h=Reflect.set(x,y,f(I),k);if(u&&h){const b=Reflect.get(x,y,k);if(!Object.is(p,b)){const A=L?{index:Number(y),value:b,previous:p}:{property:y,value:b,previous:p},C=a||r.trace;u.emit(`set:${String(y)}`,A),T(C)&&C(u,"set",A),u.emit("set",A)}}return h},deleteProperty(x,y){const I=m&&xe(y),k=Qe(x,y),L=k?x[y]:void 0,p=Reflect.deleteProperty(x,y);if(u&&p&&k){const h=I?{index:Number(y),previous:L}:{property:y,previous:L},b=a||r.trace;u.emit(`delete:${String(y)}`,h),T(b)&&b(u,"delete",h),u.emit("delete",h)}return p},defineProperty(x,y,I){const k=Object.getOwnPropertyDescriptor(x,y)??null,L=Object.prototype.hasOwnProperty.call(I,"value")?{...I,value:f(I.value)}:I,p=Reflect.defineProperty(x,y,L),h=m&&(y==="length"||xe(y));if(u&&!h&&p){const b={property:y,descriptor:L,previous:k},A=a||r.trace;u.emit(`define:${String(y)}`,b),T(A)&&A(u,"define",b),u.emit("define",b)}return p}});return u=T(l==null?void 0:l.emit)?E:t(E),u},d=a||r.trace;if(Array.isArray(e)){const l=g(e);return T(d)&&d(l,"new"),l}if(e!==null&&typeof e=="object"){const l=g(e);return T(d)&&d(l,"new",{object:l}),l}const v=t({get value(){return e},set value(l){if(Object.is(l,e))return;const m=e;e=l;const u={property:"value",value:e,previous:m};v.emit("set:value",u),T(d)&&d(v,"set",u),v.emit("set",u)}});return T(d)&&d(v,"new",{object:v}),v},he=pn;he.options={trace:null};he.watch=dn;const i=he({apps:[],currentAppId:null,files:[],activeFileName:null,generating:!1,error:null});function S(e){return new Promise((n,t)=>{e.addEventListener("success",()=>{n(e.result)}),e.addEventListener("error",()=>{t(e.error??new Error("IndexedDB request failed"))})})}function at(e,n){return new Promise((t,a)=>{const s=indexedDB.open(e,n.length);s.addEventListener("upgradeneeded",r=>{const o=n.slice(r.oldVersion-1,r.newVersion??n.length-1);for(const f of o)f(s.result)}),s.addEventListener("success",()=>{t(s.result)}),s.addEventListener("blocked",()=>{a(new Error("Database opening is blocked"))}),s.addEventListener("error",()=>{a(s.error??new Error("Failed to open database"))})})}const st="asljs-app-builder";let ne=null;async function U(){return ne!==null||(ne=await at(st,[e=>{e.createObjectStore("apps",{keyPath:"id"}),e.createObjectStore("files",{keyPath:"id"}).createIndex("byAppId","appId",{unique:!1})}])),ne}async function rt(){const n=(await U()).transaction("apps","readonly");return S(n.objectStore("apps").getAll())}async function N(e){const t=(await U()).transaction("apps","readwrite");await S(t.objectStore("apps").put(e))}async function ot(e){const t=(await U()).transaction(["apps","files"],"readwrite");await S(t.objectStore("apps").delete(e));const a=t.objectStore("files"),s=await S(a.index("byAppId").getAllKeys(e));for(const r of s)await S(a.delete(r))}async function it(e){const t=(await U()).transaction("files","readonly");return S(t.objectStore("files").index("byAppId").getAll(e))}async function un(e){const t=(await U()).transaction("files","readwrite");await S(t.objectStore("files").put(e))}async function lt(e){const t=(await U()).transaction("files","readwrite");await S(t.objectStore("files").delete(e))}async function mn(e,n){const s=(await U()).transaction("files","readwrite").objectStore("files"),r=await S(s.index("byAppId").getAllKeys(e));for(const o of r)await S(s.delete(o));for(const o of n)await S(s.put(o))}function F(e,n,t,a){return{name:e,type:"function",description:n,parameters:{type:"object",properties:t||{},required:a||[],additionalProperties:!1},strict:!0}}const ct=[F("listFileset","List all file paths in the virtual filesystem."),F("readFile","Read the full text content of a file.",{path:{type:"string"}},["path"]),F("setFileContent","Create or fully replace file content.",{path:{type:"string"},content:{type:"string"}},["path","content"]),F("replaceFilePart","Replace part of a file by exact search string.",{path:{type:"string"},search:{type:"string"},replacement:{type:"string"},replaceAll:{type:"boolean"}},["path","search","replacement","replaceAll"]),F("deleteFile","Delete a file from the virtual filesystem.",{path:{type:"string"}},["path"]),F("evalInApp","Evaluate JavaScript in the running app document context.",{code:{type:"string"}},["code"]),F("getAppDiagnostics","Get current runtime logs and errors from the running app."),F("runAppAndCollectDiagnostics","Run the app and collect runtime logs and errors after startup.")],dt=350;function pt(e){async function n(){return[...e.getFiles()].map(g=>g.name).sort((g,d)=>g.localeCompare(d))}async function t(g){const d=te(e,g),v=d===null?void 0:e.getFiles().find(l=>l.name===d);if(v===void 0)throw new Error(`File not found: ${g}`);return v.content}async function a(g,d){const v=ut(e),l=ke(g),m=te(e,l),u=e.getFiles().find(x=>x.name===(m??l));if(u!==void 0){const x={...u,content:d};await e.saveFile(x),e.setFiles(e.getFiles().map(y=>y.id===x.id?x:y)),e.setActiveFileName(x.name);return}const E={id:e.createFileId(),appId:v,name:l,content:d};await e.saveFile(E),e.setFiles([...e.getFiles(),E]),e.setActiveFileName(E.name)}async function s(g){var m;const d=te(e,g),v=d===null?void 0:e.getFiles().find(u=>u.name===d);if(v===void 0)return;await e.deleteFileById(v.id);const l=e.getFiles().filter(u=>u.id!==v.id);e.setFiles(l),e.getActiveFileName()===g&&e.setActiveFileName(((m=l[0])==null?void 0:m.name)??null)}async function r(g,d,v,l=!1){if(d==="")throw new Error("Search text cannot be empty.");const m=te(e,g);if(m===null)throw new Error(`File not found: ${g}`);const u=await t(m);if(!u.includes(d))throw new Error(`Search text not found in ${m}.`);let E=u;if(l)E=u.split(d).join(v);else{const x=u.indexOf(d);if(u.indexOf(d,x+d.length)!==-1)throw new Error("Search text is ambiguous. Use replaceAll=true or provide a more specific search block.");E=u.slice(0,x)+v+u.slice(x+d.length)}await a(m,E)}async function o(g){if(e.getFiles().length===0)throw new Error("No files available to run.");e.runApp();try{return await e.evaluateInApp(g)}catch{return e.runApp(),e.evaluateInApp(g)}}async function f(){return e.getAppDiagnostics()}async function w(){return e.runApp(),await e.wait(e.diagnosticsDelayMs??dt),e.getAppDiagnostics()}return{listFileset:n,readFile:t,setFileContent:a,deleteFile:s,replaceFilePart:r,evalInApp:o,getAppDiagnostics:f,runAppAndCollectDiagnostics:w}}function ut(e){const n=e.getCurrentAppId();if(n===null)throw new Error("No active app. Create or open an app first.");return n}function ke(e){const n=e.trim().replace(/\\/g,"/").replace(/^\.\//,"").replace(/^\/+/,"");if(n==="")throw new Error("Path cannot be empty.");if(n.includes(".."))throw new Error("Parent path segments are not allowed.");return n}function te(e,n){const t=ke(n),a=e.getFiles().find(s=>ke(s.name).toLowerCase()===t.toLowerCase());return(a==null?void 0:a.name)??null}function mt(e){return typeof e!="object"||e===null?!1:e.type==="function_call"}function fn(e){if(typeof e.name!="string"||e.name.trim()==="")throw new Error("Tool call missing function name.");return e.name}function ft(e){if(typeof e.call_id!="string"||e.call_id.trim()==="")throw new Error("Tool call missing call_id.");return e.call_id}async function ht(e,n){const t=fn(e),a=gt(e.arguments);try{switch(t){case"listFileset":{const s=await n.listFileset();return O(s)}case"readFile":{const s=await n.readFile(D(a,"path"));return O(s)}case"setFileContent":return await n.setFileContent(D(a,"path"),D(a,"content")),O("ok");case"replaceFilePart":return await n.replaceFilePart(D(a,"path"),D(a,"search"),D(a,"replacement"),vt(a,"replaceAll",!1)),O("ok");case"deleteFile":return await n.deleteFile(D(a,"path")),O("ok");case"evalInApp":{const s=await n.evalInApp(D(a,"code"));return O(s)}case"getAppDiagnostics":{const s=await n.getAppDiagnostics();return O(s)}case"runAppAndCollectDiagnostics":{const s=await n.runAppAndCollectDiagnostics();return O(s)}default:return Ze(`Unknown tool: ${t}`)}}catch(s){return Ze(s instanceof Error?s.message:String(s))}}function gt(e){if(e===void 0)return{};if(typeof e=="object"&&e!==null)return e;if(typeof e!="string")throw new Error("Invalid tool arguments value.");try{const n=JSON.parse(e);if(typeof n!="object"||n===null)throw new Error("Tool arguments must be a JSON object.");return n}catch{throw new Error("Invalid tool arguments JSON.")}}function D(e,n){const t=e[n];if(typeof t!="string")throw new Error(`Tool argument "${n}" must be a string.`);return t}function vt(e,n,t){const a=e[n];if(a===void 0)return t;if(typeof a!="boolean")throw new Error(`Tool argument "${n}" must be a boolean.`);return a}function O(e){return hn({ok:!0,value:e})}function Ze(e){return hn({ok:!1,error:e})}function hn(e){try{return JSON.stringify(e)}catch{return'{"ok":false,"error":"Failed to serialize tool result."}'}}const bt="https://api.openai.com/v1/responses",yt="gpt-5.3-codex",X=20,wt="You are an expert ASLJS app generator.",xt=12,Et={createResponse:async e=>{const n=await fetch(bt,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${e.apiKey}`},body:JSON.stringify({model:e.model,instructions:e.instructions,temperature:e.temperature,previous_response_id:e.previous_response_id,input:e.input,tools:e.tools})});if(!n.ok){const t=await n.json().catch(()=>({})),a=jt(t)??`OpenAI API error: ${n.status}`;throw new Error(a)}return n.json()}};async function At(e,n,t,a,s){var v;const r=(s==null?void 0:s.transport)??Et,o=(s==null?void 0:s.systemPrompt)??wt;let f,w=e,g=St(s==null?void 0:s.initialToolStepLimit),d=0;for(;;){if(await V(s,`Step ${d+1}: requesting assistant response...`),d>=g){if(!(await((v=s==null?void 0:s.onToolStepLimit)==null?void 0:v.call(s,{stepsCompleted:d,stepLimit:g}))??!1))throw new Error("AI exceeded maximum tool steps without completing.");g+=xt,await V(s,`Extended step limit to ${g}. Continuing...`)}const l=await r.createResponse({apiKey:n,model:t,instructions:o,temperature:.1,previous_response_id:f,input:w,tools:ct});if(!Array.isArray(l.output))throw new Error("AI returned an unexpected response format.");const m=l.output.filter(mt);if(m.length===0){await V(s,`Completed in ${d+1} step(s). Finalizing summary...`);const E=It(l);return{summary:E===""?"Completed tool-based update.":E}}const u=[];for(const E of m){await V(s,`Step ${d+1}: running ${fn(E)}...`);const x=await ht(E,a);u.push({type:"function_call_output",call_id:ft(E),output:x})}await V(s,`Step ${d+1}: submitted ${u.length} tool result(s).`),f=typeof l.id=="string"?l.id:f,w=u,d+=1}}function St(e){if(!Number.isFinite(e))return X;const n=Math.floor(e);return n>=1?n:X}async function V(e,n){(e==null?void 0:e.onProgress)!==void 0&&await Promise.resolve(e.onProgress(n))}function jt(e){const n=e.error;return typeof(n==null?void 0:n.message)=="string"?n.message:null}function It(e){return typeof e.output_text=="string"&&e.output_text.trim()!==""?e.output_text.trim():Array.isArray(e.output)?e.output.filter(t=>t.type==="message").flatMap(t=>t.content??[]).map(t=>t.text??"").map(t=>t.trim()).filter(t=>t!=="").join(`
`):""}const kt=`# observable

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
`,Tt=`# eventful

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
`,Lt=`# data-binding

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
`,Pt=`# AI

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
`,Ct=`# dali

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
`,gn=`
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

${Tt}

[observable] guide:

${kt}

[data-binding] guide:

${Lt}

[components] guide:

${Pt}

[dali] guide:

${Ct}
`,_e="asljs-app-builder:eval-request",vn="asljs-app-builder:eval-response",bn="asljs-app-builder:diagnostics-request",yn="asljs-app-builder:diagnostics-response",en=`<script>
(() => {
  const REQUEST = '${_e}';
  const RESPONSE = '${vn}';
  const DIAG_REQUEST = '${bn}';
  const DIAG_RESPONSE = '${yn}';
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
<\/script>`;function Ft(e,n,t){if(n.length===0){e.removeAttribute("srcdoc"),e.src="about:blank";return}const a=n.find(o=>o.name==="index.html")??n.find(o=>o.name.endsWith(".html"))??null;if(a===null){e.removeAttribute("srcdoc"),e.src="about:blank";return}let s=a.content;const r=n.find(o=>o.name==="style.css")??n.find(o=>o.name.endsWith(".css"))??null;r!==null&&(s=s.replace(/<link[^>]+href=["']style\.css["'][^>]*>/gi,`<style>${r.content}</style>`),s=s.replace(/<link[^>]+href=["']([^"']+\.css)["'][^>]*>/gi,`<style>${r.content}</style>`));for(const o of n){if(!o.name.endsWith(".js"))continue;const f=o.name.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");s=s.replace(new RegExp(`(<script[^>]*?)\\s+src=["']${f}["']([^>]*)><\\/script>`,"gi"),(w,g,d)=>{const v=`${String(g)} ${String(d)}`;return/type=["']module["']/i.test(v)?`<script type="module">${o.content}<\/script>`:`<script>${o.content}<\/script>`})}s=Mt(s,n),s=Bt(s,t),s=Nt(s),e.srcdoc=s}async function Dt(e,n){const t=await wn(e,_e,{code:n},vn);if(t.ok===!0)return t.value;throw new Error(typeof t.error=="string"?t.error:"Unknown preview evaluation error.")}async function Ot(e){const n=await wn(e,bn,{},yn);if(n.ok!==!0)throw new Error(typeof n.error=="string"?n.error:"Failed to read preview diagnostics.");return n.diagnostics??{logs:[],errors:[]}}async function wn(e,n,t,a){const s=e.contentWindow;if(s===null)throw new Error("Preview frame is not available.");const r=crypto.randomUUID();return new Promise((o,f)=>{const w=window.setTimeout(()=>{d(),f(new Error("Timed out waiting for app evaluation result."))},5e3),g=v=>{if(v.source!==s)return;const l=v.data;l.type!==a||l.id!==r||(d(),o(l))};function d(){window.clearTimeout(w),window.removeEventListener("message",g)}window.addEventListener("message",g),s.postMessage({type:n,id:r,...t},"*")})}function Nt(e){return e.includes(_e)?e:e.includes("</body>")?e.replace("</body>",`${en}</body>`):`${e}
${en}`}function Mt(e,n){if(/type=["']importmap["']/i.test(e))return e;const t=n.find(o=>o.name==="package.json")??null,a=Rt(t==null?void 0:t.content),s=Object.fromEntries(a.map(([o,f])=>[o,`https://esm.sh/${o}@${f}?bundle`]));if(Object.keys(s).length===0)return e;const r=`<script type="importmap">${JSON.stringify({imports:s})}<\/script>`;return/<head[^>]*>/i.test(e)?e.replace(/<head[^>]*>/i,o=>`${o}
${r}`):`${r}
${e}`}function Rt(e){if(e===void 0)return nn();try{const n=JSON.parse(e),t={...n.dependencies??{},...n.devDependencies??{}};return["asljs-eventful","asljs-observable","asljs-data-binding","asljs-components","asljs-dali","openai"].map(r=>[r,_t(t[r])])}catch{return nn()}}function _t(e){if(typeof e!="string"||e.trim()==="")return"latest";const n=e.trim().replace(/^[~^<>=\s]+/,"");return n===""?"latest":n}function nn(){return[["asljs-eventful","latest"],["asljs-observable","latest"],["asljs-data-binding","latest"],["asljs-components","latest"],["asljs-dali","latest"],["openai","latest"]]}function Bt(e,n){if(e.includes("__ASLJS_APP_BUILDER_HOST__"))return e;const t=`<script>window.__ASLJS_APP_BUILDER_HOST__ = ${JSON.stringify({openAiApiKey:(n==null?void 0:n.hostOpenAiApiKey)===void 0||n.hostOpenAiApiKey.trim()===""?null:n.hostOpenAiApiKey})};<\/script>`;return e.includes("</head>")?e.replace("</head>",`${t}</head>`):e.includes("<body")?e.replace(/<body[^>]*>/i,a=>`${a}
${t}`):`${t}
${e}`}function Ut(e){const n=e.selectElement;n.replaceChildren();const t=[...e.apps].sort((r,o)=>o.updatedAt.localeCompare(r.updatedAt));for(const r of t){const o=document.createElement("option");o.value=r.id,o.textContent=r.name,n.appendChild(o)}if(t.length>0){const r=document.createElement("option");r.value="__separator__",r.textContent="────────",r.disabled=!0,n.appendChild(r)}const a=document.createElement("option");a.value=e.newActionValue,a.textContent="New...",n.appendChild(a);const s=document.createElement("option");s.value=e.importActionValue,s.textContent="Import...",n.appendChild(s),e.currentAppId!==null&&(n.value=e.currentAppId)}function $t(e){const n=e.selectElement;if(n.replaceChildren(),e.files.length===0){const a=document.createElement("option");a.value="",a.textContent="No files",n.appendChild(a),n.value="",n.disabled=!0;return}for(const a of e.files){const s=document.createElement("option");s.value=a.name,s.textContent=a.name,n.appendChild(s)}const t=e.activeFileName??e.files[0].name;n.value=t,n.disabled=!1}function Ht(e){const n=e.files.find(t=>t.name===e.activeFileName);e.textAreaElement.value=(n==null?void 0:n.content)??"",e.textAreaElement.disabled=n===void 0}function zt(e,n){e.disabled=n,e.innerHTML=n?'<span class="spinner"></span> Sending…':"Send"}function Jt(e,n,t){e.textContent=n,e.classList.toggle("hidden",!t)}function Wt(e,n,t){const a=document.createElement("div");a.className=`chat-msg ${n}`;const s=document.createElement("div");s.className="chat-msg-role",s.textContent=n==="user"?"You":"Assistant";const r=document.createElement("div");r.className="chat-bubble",r.textContent=t,a.appendChild(s),a.appendChild(r),e.appendChild(a),e.scrollTop=e.scrollHeight}function xn(e){const n=!e.panelElement.classList.contains("collapsed");return e.toggleButtonElement.textContent=n?e.collapsedLabel:e.expandedLabel,e.toggleButtonElement.setAttribute("aria-expanded",n?"false":"true"),e.panelElement.classList.toggle("collapsed",n),e.panelsElement.classList.toggle(e.collapsedPanelsClass,n),n}const qt=`{
  "id": "5935ae06-fe33-4019-86ab-afa78151e96c",
  "name": "TODO Sample",
  "files": {
    "app.js": "const form = document.getElementById('todo-form');\\nconst input = document.getElementById('todo-input');\\nconst list = document.getElementById('todo-list');\\nconst doneList = document.getElementById('done-list');\\n\\nif (!(form instanceof HTMLFormElement)\\n    || !(input instanceof HTMLInputElement)\\n    || !(list instanceof HTMLUListElement)\\n    || !(doneList instanceof HTMLUListElement))\\n{\\n  throw new Error('Missing TODO app elements.');\\n}\\n\\nconst state = {\\n  todos: [],\\n  done: [],\\n};\\n\\nfunction uid() {\\n  return crypto.randomUUID();\\n}\\n\\nfunction render() {\\n  list.replaceChildren();\\n  doneList.replaceChildren();\\n\\n  for (const todo of state.todos) {\\n    const item = document.createElement('li');\\n    item.className = 'todo-item';\\n\\n    const main = document.createElement('div');\\n    main.className = 'todo-main';\\n\\n    const text = document.createElement('span');\\n    text.className = 'todo-text';\\n    text.textContent = todo.text;\\n\\n    const actions = document.createElement('div');\\n\\n    const checkButton = document.createElement('button');\\n    checkButton.type = 'button';\\n    checkButton.className = 'check-btn';\\n    checkButton.textContent = '✓';\\n    checkButton.title = 'Mark done';\\n    checkButton.addEventListener('click', () => {\\n      state.todos = state.todos.filter(entry => entry.id !== todo.id);\\n      state.done.unshift(todo);\\n      render();\\n    });\\n\\n    main.appendChild(checkButton);\\n    main.appendChild(text);\\n\\n    const bin = document.createElement('button');\\n    bin.type = 'button';\\n    bin.className = 'bin-btn';\\n    bin.textContent = '🗑';\\n    bin.title = 'Delete todo';\\n    bin.addEventListener('click', () => {\\n      state.todos = state.todos.filter(entry => entry.id !== todo.id);\\n      render();\\n    });\\n\\n    actions.appendChild(checkButton);\\n    actions.appendChild(bin);\\n\\n    item.appendChild(main);\\n    item.appendChild(actions);\\n    list.appendChild(item);\\n  }\\n\\n  for (const todo of state.done) {\\n    const item = document.createElement('li');\\n    item.className = 'todo-item done';\\n\\n    const main = document.createElement('div');\\n    main.className = 'todo-main';\\n\\n    const text = document.createElement('span');\\n    text.className = 'todo-text';\\n    text.textContent = todo.text;\\n\\n    main.appendChild(text);\\n\\n    const actions = document.createElement('div');\\n\\n    const bin = document.createElement('button');\\n    bin.type = 'button';\\n    bin.className = 'bin-btn';\\n    bin.textContent = '🗑';\\n    bin.title = 'Delete todo';\\n    bin.addEventListener('click', () => {\\n      state.done = state.done.filter(entry => entry.id !== todo.id);\\n      render();\\n    });\\n\\n    actions.appendChild(bin);\\n\\n    item.appendChild(main);\\n    item.appendChild(actions);\\n    doneList.appendChild(item);\\n  }\\n\\n  if (state.todos.length === 0) {\\n    const empty = document.createElement('li');\\n    empty.className = 'todo-empty';\\n    empty.textContent = 'No active TODO items.';\\n    list.appendChild(empty);\\n  }\\n\\n  if (state.done.length === 0) {\\n    const emptyDone = document.createElement('li');\\n    emptyDone.className = 'todo-empty';\\n    emptyDone.textContent = 'No completed TODO items yet.';\\n    doneList.appendChild(emptyDone);\\n  }\\n}\\n\\nform.addEventListener('submit', event => {\\n  event.preventDefault();\\n\\n  const text = input.value.trim();\\n\\n  if (text === '') {\\n    return;\\n  }\\n\\n  state.todos.unshift({\\n    id: uid(),\\n    text,\\n  });\\n  input.value = '';\\n  input.focus();\\n  render();\\n});\\n\\nrender();",
    "README.md": "# TODO Sample\\n\\nSimple TODO sample application.\\n\\n## Usage\\n\\nOpen index.html and add items using the input.\\n\\n## Behavior\\n\\n- Add TODO item on submit.\\n- Active TODO items show Check and Bin actions.\\n- Clicking Check moves an item immediately to Done.\\n- Each item has a bin icon to delete it.\\n",
    "package.json": "{\\n  \\"name\\": \\"todo-sample\\",\\n  \\"version\\": \\"0.1.0\\",\\n  \\"private\\": true,\\n  \\"type\\": \\"module\\",\\n  \\"scripts\\": {\\n    \\"start\\": \\"echo \\"Open index.html in a browser\\"\\"\\n  }\\n}",
    "style.css": ":root {\\n  color-scheme: light dark;\\n}\\n\\nbody {\\n  margin: 0;\\n  font-family: system-ui, sans-serif;\\n  background: #0b1220;\\n  color: #e7edf7;\\n}\\n\\n.app {\\n  max-width: 560px;\\n  margin: 2rem auto;\\n  padding: 1rem;\\n  border: 1px solid #2b3954;\\n  border-radius: 8px;\\n  background: #121b2d;\\n}\\n\\n#todo-form {\\n  display: flex;\\n  gap: 0.5rem;\\n}\\n\\n#todo-input {\\n  flex: 1;\\n  padding: 0.5rem;\\n}\\n\\n.list-section {\\n  margin-top: 1rem;\\n}\\n\\n.list-section h2 {\\n  margin: 0 0 0.5rem;\\n  font-size: 1rem;\\n}\\n\\n.todo-list {\\n  margin: 0;\\n  padding: 0;\\n  list-style: none;\\n  display: grid;\\n  gap: 0.5rem;\\n}\\n\\n.todo-item {\\n  display: flex;\\n  align-items: center;\\n  justify-content: space-between;\\n  gap: 0.5rem;\\n  padding: 0.5rem 0.6rem;\\n  border: 1px solid #2b3954;\\n  border-radius: 6px;\\n  background: #0f1a2f;\\n}\\n\\n.todo-main {\\n  display: flex;\\n  align-items: center;\\n  gap: 0.5rem;\\n  min-width: 0;\\n}\\n\\n.todo-text {\\n  overflow: hidden;\\n  text-overflow: ellipsis;\\n  white-space: nowrap;\\n}\\n\\n.done .todo-text {\\n  text-decoration: line-through;\\n  opacity: 0.75;\\n}\\n\\n.bin-btn {\\n  border: 1px solid #3b4e7a;\\n  background: transparent;\\n  color: #e7edf7;\\n  border-radius: 6px;\\n  padding: 0.35rem 0.5rem;\\n  cursor: pointer;\\n}\\n\\n.check-btn {\\n  border: 1px solid #3b4e7a;\\n  background: #1b2b4b;\\n  color: #e7edf7;\\n  border-radius: 6px;\\n  padding: 0.35rem 0.55rem;\\n  cursor: pointer;\\n}\\n\\n.todo-empty {\\n  color: #9fb2d8;\\n  font-size: 0.9rem;\\n  padding: 0.25rem 0;\\n}",
    "index.html": "<!doctype html>\\n<html lang=\\"en\\">\\n<head>\\n  <meta charset=\\"UTF-8\\" />\\n  <meta name=\\"viewport\\" content=\\"width=device-width, initial-scale=1.0\\" />\\n  <title>TODO Sample</title>\\n  <link rel=\\"stylesheet\\" href=\\"style.css\\" />\\n</head>\\n<body>\\n  <main class=\\"app\\">\\n    <h1>TODO Sample</h1>\\n    <form id=\\"todo-form\\">\\n      <input id=\\"todo-input\\" type=\\"text\\" placeholder=\\"What needs doing?\\" required />\\n      <button type=\\"submit\\">Add</button>\\n    </form>\\n    <section class=\\"list-section\\">\\n      <h2>Todo</h2>\\n      <ul id=\\"todo-list\\" class=\\"todo-list\\"></ul>\\n    </section>\\n    <section class=\\"list-section\\">\\n      <h2>Done</h2>\\n      <ul id=\\"done-list\\" class=\\"todo-list\\"></ul>\\n    </section>\\n  </main>\\n  <script type=\\"module\\" src=\\"app.js\\"><\/script>\\n</body>\\n</html>"
  }
}`,Gt=`{
  "id": "e44d7e29-c40a-4731-9092-9407b0105624",
  "name": "PdfParser",
  "files": {
    "README.md": "# PDF Text Extractor\\n\\nA simple browser app that converts PDF pages into a text-only layout preview using a 100-column virtual buffer.\\n\\n## Features\\n\\n- Drag-and-drop or click-to-upload PDF input\\n- Text extraction with \`pdfjs-dist\`\\n- Page-by-page monospace preview\\n- Activity log and extraction stats\\n- IndexedDB session persistence with \`asljs-dali\`\\n- Saved-session history with restore support\\n- Declarative UI bindings with \`asljs-data-binding\`\\n- Observable app state with \`asljs-observable\`\\n- Event bus with \`asljs-eventful\`\\n- \`asljs-components\` list rendering for pages and activity\\n\\n## ASLJS package usage\\n\\n- \`asljs-eventful\`: app event bus for status, success, and error events\\n- \`asljs-observable\`: reactive state for UI, pages, stats, and activity\\n- \`asljs-data-binding\`: declarative bindings via \`data-bind-*\` attributes\\n- \`asljs-components\`: \`asljs-list\` for activity and extracted page rendering\\n- \`asljs-dali\`: IndexedDB-backed session table and live recordset observation\\n\\n## Files\\n\\n- \`index.html\`: app shell and declarative binding markup\\n- \`style.css\`: layout and visual styling\\n- \`app.js\`: app entry point and runtime logic\\n- \`package.json\`: scripts and required dependencies\\n\\n## Run\\n\\nUse a static server, for example:\\n\\n\`\`\`bash\\nnpm install\\nnpm run dev\\n\`\`\`\\n\\nThen open the served app in a modern browser.\\n\\n## Agent tool workflow\\n\\nThis project is intended to be updated through the app-builder tool workflow:\\n\\n- inspect files with \`listFileset()\` and \`readFile(path)\`\\n- modify files with \`replaceFilePart(...)\` or \`setFileContent(...)\`\\n- remove files with \`deleteFile(path)\`\\n- verify runtime with \`runAppAndCollectDiagnostics()\` and \`getAppDiagnostics()\`\\n- perform targeted checks with \`evalInApp(code)\`\\n\\nThe app entry point is \`app.js\`, and \`index.html\` loads it with \`<script type=\\"module\\">\`.\\n\\n## Current behavior\\n\\n- Uploading a PDF extracts text from each page\\n- Each page is mapped into a fixed-width text buffer\\n- Extraction results are shown in a list of page cards\\n- Full extraction sessions are stored in IndexedDB\\n- Recent saved sessions can be restored into the page preview\\n- The activity log records app events and persistence updates\\n",
    "app.js": "import { eventful } from 'https://cdn.jsdelivr.net/npm/asljs-eventful/+esm';\\nimport { observable } from 'https://cdn.jsdelivr.net/npm/asljs-observable/+esm';\\nimport { bindDataModel } from 'https://cdn.jsdelivr.net/npm/asljs-data-binding/+esm';\\nimport 'https://cdn.jsdelivr.net/npm/asljs-components/+esm';\\nimport { dbOpen, Table } from 'https://cdn.jsdelivr.net/npm/asljs-dali/+esm';\\nimport * as pdfjsLib from 'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.6.205/build/pdf.mjs';\\n\\npdfjsLib.GlobalWorkerOptions.workerSrc =\\n  'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.6.205/build/pdf.worker.mjs';\\n\\nconst BUFFER_WIDTH = 100;\\nconst DB_NAME = 'pdf-text-extractor-db';\\nconst STORE_NAME = 'sessions';\\nconst SAMPLE_MESSAGE = 'Drop a PDF file or click here to choose one. The app maps extracted text into a 100-column virtual text buffer per page.';\\nconst MAX_HISTORY = 8;\\n\\nlet booted = false;\\n\\nwindow.addEventListener('error', event => {\\n  console.error('Window error', event.error || event.message);\\n});\\n\\nwindow.addEventListener('unhandledrejection', event => {\\n  console.error('Unhandled rejection', event.reason);\\n});\\n\\nboot().catch(error => {\\n  console.error('Boot failed', error);\\n});\\n\\nasync function boot() {\\n  if (booted) return;\\n  booted = true;\\n  console.log('boot:start');\\n\\n  const root = document.getElementById('app');\\n  if (!root) throw new Error('Missing #app root element.');\\n\\n  const bus = eventful({ name: 'pdf-text-extractor-bus' });\\n  const state = observable({\\n    stats: {\\n      pages: 0,\\n      characters: 0,\\n      sessions: 0,\\n    },\\n    ui: {\\n      dragOver: false,\\n      busy: false,\\n      dropzoneTitle: 'Drop PDF here',\\n      dropzoneHint: SAMPLE_MESSAGE,\\n      status: {\\n        message: 'Ready for a PDF.',\\n        error: '',\\n      },\\n      loadSample() {\\n        state.ui.status.message = 'Instructions loaded. Now drop a PDF file.';\\n        state.ui.status.error = '';\\n        addLog('Instructions', SAMPLE_MESSAGE, true);\\n        bus.emit('status', state.ui.status.message);\\n      },\\n      clearOutput() {\\n        state.pages.length = 0;\\n        state.stats.pages = 0;\\n        state.stats.characters = 0;\\n        state.ui.status.message = 'Output cleared.';\\n        state.ui.status.error = '';\\n        addLog('Cleared', 'Removed extracted pages from the current view.', false);\\n        bus.emit('cleared');\\n      },\\n    },\\n    pages: observable([]),\\n    activity: observable([]),\\n    history: observable([]),\\n    selectedSessionId: null,\\n    lastSessionId: null,\\n    restoreSession(event, model, element) {\\n      const sessionId = element?.dataset?.sessionId;\\n      if (!sessionId) return;\\n      restoreSessionById(sessionId);\\n    },\\n    async clearHistory() {\\n      if (!sessions?.clear) return;\\n      await sessions.clear();\\n      state.history.splice(0, state.history.length);\\n      state.selectedSessionId = null;\\n      state.stats.sessions = 0;\\n      state.ui.status.message = 'Saved session history cleared.';\\n      state.ui.status.error = '';\\n      addLog('History cleared', 'Removed saved extraction sessions from IndexedDB.', true);\\n      bus.emit('status', state.ui.status.message);\\n    },\\n  });\\n\\n  let sessions = null;\\n  let liveSessions = null;\\n\\n  try {\\n    const db = await dbOpen(DB_NAME, [database => {\\n      if (!database.objectStoreNames.contains(STORE_NAME)) {\\n        database.createObjectStore(STORE_NAME, { keyPath: 'id' });\\n      }\\n    }]);\\n\\n    sessions = new Table(STORE_NAME, db, {});\\n\\n    const refreshHistory = async (logLatest = false) => {\\n      if (!sessions?.scan) return;\\n      const records = await sessions.scan(() => true);\\n      const sorted = [...records].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));\\n      state.history.splice(0, state.history.length, ...sorted.slice(0, MAX_HISTORY).map(record => ({\\n        id: record.id,\\n        fileName: record.fileName,\\n        pageCount: record.pageCount,\\n        characterCount: record.characterCount,\\n        createdAt: record.createdAt,\\n        selected: record.id === state.selectedSessionId,\\n        summary: \`\${record.pageCount} page(s) • \${record.characterCount} chars\`,\\n      })));\\n      state.stats.sessions = records.length;\\n\\n      const latest = sorted[0];\\n      if (!logLatest || !latest || latest.id === state.lastSessionId) return;\\n      state.lastSessionId = latest.id;\\n      addLog('Saved session', \`\${latest.fileName} (\${latest.pageCount} pages) stored in IndexedDB.\`, false);\\n    };\\n\\n    await refreshHistory(false);\\n    sessions.notify({\\n      add() {\\n        refreshHistory(true).catch(error => console.warn('History refresh failed', error));\\n      },\\n      put() {\\n        refreshHistory(true).catch(error => console.warn('History refresh failed', error));\\n      },\\n      update() {\\n        refreshHistory(false).catch(error => console.warn('History refresh failed', error));\\n      },\\n      delete() {\\n        refreshHistory(false).catch(error => console.warn('History refresh failed', error));\\n      },\\n      clear() {\\n        refreshHistory(false).catch(error => console.warn('History refresh failed', error));\\n      },\\n    });\\n  } catch (error) {\\n    console.warn('Persistence unavailable', error);\\n    state.ui.status.error = 'IndexedDB persistence unavailable in this environment.';\\n  }\\n\\n  bus.on('status', message => addLog('Status', message, false));\\n  bus.on('pdf-loaded', payload => addLog('PDF loaded', \`\${payload.fileName} with \${payload.pageCount} pages extracted.\`, true));\\n  bus.on('error', message => addLog('Error', message, true));\\n\\n  bindDataModel(root, state, {});\\n\\n  const pagesList = document.getElementById('pages-list');\\n  if (pagesList) {\\n    pagesList.items = state.pages;\\n    pagesList.context = state;\\n  }\\n\\n  const activityList = document.getElementById('activity-list');\\n  if (activityList) {\\n    activityList.items = state.activity;\\n    activityList.context = state;\\n  }\\n\\n  const historyList = document.getElementById('history-list');\\n  if (historyList) {\\n    historyList.items = state.history;\\n    historyList.context = state;\\n  }\\n\\n  wireFileInput(state, bus, sessions);\\n  wireDropzone(state, bus, sessions);\\n\\n  state.ui.status.message = 'Ready for a PDF. Drag and drop or click the dropzone.';\\n  addLog('Ready', 'Application booted successfully.', false);\\n\\n  window.__PDF_TEXT_EXTRACTOR__ = { state, bus, sessions };\\n\\n  async function restoreSessionById(sessionId) {\\n    if (!sessions?.getOne) return;\\n    try {\\n      const session = await sessions.getOne(sessionId);\\n      if (!session) {\\n        state.ui.status.error = 'Saved session not found.';\\n        bus.emit('error', state.ui.status.error);\\n        return;\\n      }\\n\\n      state.selectedSessionId = session.id;\\n      for (const item of state.history) {\\n        item.selected = item.id === session.id;\\n      }\\n\\n      state.pages.splice(0, state.pages.length, ...(session.pages || []));\\n      state.stats.pages = session.pageCount || 0;\\n      state.stats.characters = session.characterCount || 0;\\n      state.ui.status.message = \`Restored \${session.fileName} from saved history.\`;\\n      state.ui.status.error = '';\\n      addLog('Session restored', \`\${session.fileName} loaded from IndexedDB history.\`, true);\\n      bus.emit('status', state.ui.status.message);\\n    } catch (error) {\\n      console.error(error);\\n      state.ui.status.error = 'Failed to restore saved session.';\\n      bus.emit('error', state.ui.status.error);\\n    }\\n  }\\n\\n  function addLog(title, detail, highlight) {\\n    state.activity.unshift({\\n      id: crypto.randomUUID(),\\n      title,\\n      detail,\\n      highlight,\\n      time: new Date().toLocaleTimeString(),\\n    });\\n    if (state.activity.length > 12) {\\n      state.activity.length = 12;\\n    }\\n  }\\n}\\n\\nfunction wireFileInput(state, bus, sessions) {\\n  const input = document.getElementById('pdf-input');\\n  if (!input) return;\\n\\n  input.addEventListener('change', async event => {\\n    const file = event.target?.files?.[0];\\n    if (!file) return;\\n    await handlePdfFile(file, state, bus, sessions);\\n    input.value = '';\\n  });\\n}\\n\\nfunction wireDropzone(state, bus, sessions) {\\n  const dropzone = document.getElementById('dropzone');\\n  if (!dropzone) return;\\n\\n  ['dragenter', 'dragover'].forEach(type => {\\n    dropzone.addEventListener(type, event => {\\n      event.preventDefault();\\n      state.ui.dragOver = true;\\n    });\\n  });\\n\\n  ['dragleave', 'dragend'].forEach(type => {\\n    dropzone.addEventListener(type, () => {\\n      state.ui.dragOver = false;\\n    });\\n  });\\n\\n  dropzone.addEventListener('drop', async event => {\\n    event.preventDefault();\\n    state.ui.dragOver = false;\\n    const file = event.dataTransfer?.files?.[0];\\n    if (!file) return;\\n    await handlePdfFile(file, state, bus, sessions);\\n  });\\n}\\n\\nasync function handlePdfFile(file, state, bus, sessions) {\\n  if (file.type && file.type !== 'application/pdf') {\\n    state.ui.status.error = 'Please drop a valid PDF file.';\\n    bus.emit('error', state.ui.status.error);\\n    return;\\n  }\\n\\n  state.ui.busy = true;\\n  state.ui.status.message = \`Reading \${file.name}...\`;\\n  state.ui.status.error = '';\\n  bus.emit('status', state.ui.status.message);\\n\\n  try {\\n    const bytes = await file.arrayBuffer();\\n    const loadingTask = pdfjsLib.getDocument({ data: bytes });\\n    const pdf = await loadingTask.promise;\\n    const pages = [];\\n    let totalCharacters = 0;\\n\\n    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {\\n      const page = await pdf.getPage(pageNumber);\\n      const viewport = page.getViewport({ scale: 1 });\\n      const textContent = await page.getTextContent();\\n      const rendered = renderPageToBuffer(textContent.items, viewport.width, viewport.height);\\n      totalCharacters += rendered.replace(/\\\\n/g, '').length;\\n      pages.push({\\n        id: \`\${file.name}-\${pageNumber}\`,\\n        pageNumber,\\n        summary: \`\${rendered.length} chars\`,\\n        text: rendered,\\n      });\\n    }\\n\\n    state.pages.splice(0, state.pages.length, ...pages);\\n    state.stats.pages = pages.length;\\n    state.stats.characters = totalCharacters;\\n    state.ui.status.message = \`Extracted \${pages.length} page(s) from \${file.name}.\`;\\n    state.ui.status.error = '';\\n\\n    const session = {\\n      id: crypto.randomUUID(),\\n      fileName: file.name,\\n      pageCount: pages.length,\\n      characterCount: totalCharacters,\\n      createdAt: new Date().toISOString(),\\n      pages,\\n    };\\n\\n    if (sessions?.put) {\\n      await sessions.put(session);\\n    }\\n    bus.emit('pdf-loaded', { fileName: file.name, pageCount: pages.length });\\n  } catch (error) {\\n    console.error(error);\\n    state.ui.status.error = error?.message || 'Failed to extract PDF text.';\\n    bus.emit('error', state.ui.status.error);\\n  } finally {\\n    state.ui.busy = false;\\n  }\\n}\\n\\nfunction renderPageToBuffer(items, pageWidth, pageHeight) {\\n  const rows = [];\\n  const rowCount = Math.max(1, Math.ceil((pageHeight / pageWidth) * BUFFER_WIDTH * 1.6));\\n\\n  for (let i = 0; i < rowCount; i += 1) {\\n    rows.push(Array(BUFFER_WIDTH).fill(' '));\\n  }\\n\\n  for (const item of items) {\\n    const text = String(item.str || '');\\n    if (!text.trim()) continue;\\n\\n    const transform = item.transform || [1, 0, 0, 1, 0, 0];\\n    const x = Number(transform[4] || 0);\\n    const y = Number(transform[5] || 0);\\n    const col = clamp(Math.round((x / Math.max(pageWidth, 1)) * (BUFFER_WIDTH - 1)), 0, BUFFER_WIDTH - 1);\\n    const row = clamp(Math.round(((pageHeight - y) / Math.max(pageHeight, 1)) * (rowCount - 1)), 0, rowCount - 1);\\n\\n    for (let i = 0; i < text.length; i += 1) {\\n      const targetCol = col + i;\\n      if (targetCol >= BUFFER_WIDTH) break;\\n      rows[row][targetCol] = text[i];\\n    }\\n  }\\n\\n  return rows\\n    .map(chars => chars.join('').replace(/\\\\s+$/g, ''))\\n    .join('\\\\n')\\n    .replace(/\\\\n{3,}/g, '\\\\n\\\\n')\\n    .trimEnd();\\n}\\n\\nfunction clamp(value, min, max) {\\n  return Math.min(max, Math.max(min, value));\\n}\\n",
    "index.html": "<!doctype html>\\n<html lang=\\"en\\">\\n<head>\\n  <meta charset=\\"UTF-8\\">\\n  <meta name=\\"viewport\\" content=\\"width=device-width, initial-scale=1.0\\">\\n  <title>PDF Text Extractor</title>\\n  <link rel=\\"stylesheet\\" href=\\"./style.css\\">\\n</head>\\n<body>\\n  <div id=\\"app\\" class=\\"app-shell\\">\\n    <header class=\\"hero\\">\\n      <div>\\n        <h1>PDF Text Extractor</h1>\\n        <p class=\\"subtitle\\">Drop a PDF to build a text-only page layout preview using a 100-column virtual buffer.</p>\\n      </div>\\n      <div class=\\"hero-stats\\" data-bind-context=\\"stats\\">\\n        <div class=\\"stat-card\\">\\n          <span class=\\"stat-label\\">Pages</span>\\n          <strong data-bind-text=\\"pages\\"></strong>\\n        </div>\\n        <div class=\\"stat-card\\">\\n          <span class=\\"stat-label\\">Chars</span>\\n          <strong data-bind-text=\\"characters\\"></strong>\\n        </div>\\n        <div class=\\"stat-card\\">\\n          <span class=\\"stat-label\\">Sessions</span>\\n          <strong data-bind-text=\\"sessions\\"></strong>\\n        </div>\\n      </div>\\n    </header>\\n\\n    <main class=\\"workspace\\">\\n      <section class=\\"panel controls\\" data-bind-context=\\"ui\\">\\n        <label\\n          id=\\"dropzone\\"\\n          class=\\"dropzone\\"\\n          data-bind-class-dragover=\\"dragOver\\"\\n          data-bind-class-busy=\\"busy\\"\\n          for=\\"pdf-input\\"\\n        >\\n          <input id=\\"pdf-input\\" type=\\"file\\" accept=\\"application/pdf\\">\\n          <span class=\\"dropzone-title\\" data-bind-text=\\"dropzoneTitle\\"></span>\\n          <span class=\\"dropzone-hint\\" data-bind-text=\\"dropzoneHint\\"></span>\\n        </label>\\n\\n        <div class=\\"actions\\">\\n          <button class=\\"secondary\\" data-bind-onclick=\\"loadSample\\">Load sample instructions</button>\\n          <button class=\\"danger\\" data-bind-onclick=\\"clearOutput\\">Clear output</button>\\n        </div>\\n\\n        <section class=\\"status-card\\">\\n          <h2>Status</h2>\\n          <p class=\\"status-line\\" data-bind-text=\\"status.message\\"></p>\\n          <p class=\\"error-line\\" data-bind-text=\\"status.error\\"></p>\\n        </section>\\n\\n        <section class=\\"status-card\\">\\n          <h2>Saved Sessions</h2>\\n          <div class=\\"actions compact-actions\\">\\n            <button class=\\"secondary\\" data-bind-onclick=\\"clearHistory\\">Clear saved history</button>\\n          </div>\\n          <asljs-list id=\\"history-list\\">\\n            <template data-slot=\\"container\\">\\n              <div class=\\"log-list\\" data-role=\\"items\\"></div>\\n            </template>\\n            <template data-slot=\\"item\\">\\n              <button\\n                class=\\"history-entry\\"\\n                type=\\"button\\"\\n                data-bind-class-selected=\\"item.selected\\"\\n                data-bind-onclick=\\"context.restoreSession\\"\\n                data-bind-data-session-id=\\"item.id\\"\\n              >\\n                <div class=\\"log-entry-top\\">\\n                  <strong data-bind-text=\\"item.fileName\\"></strong>\\n                  <span data-bind-text=\\"item.createdAt\\"></span>\\n                </div>\\n                <span data-bind-text=\\"item.summary\\"></span>\\n              </button>\\n            </template>\\n            <template data-slot=\\"empty\\">\\n              <p class=\\"empty-state\\">No saved sessions yet.</p>\\n            </template>\\n          </asljs-list>\\n        </section>\\n\\n        <section class=\\"status-card\\">\\n          <h2>Activity Log</h2>\\n          <asljs-list id=\\"activity-list\\">\\n            <template data-slot=\\"container\\">\\n              <div class=\\"log-list\\" data-role=\\"items\\"></div>\\n            </template>\\n            <template data-slot=\\"item\\">\\n              <article class=\\"log-entry\\" data-bind-class-highlight=\\"item.highlight\\">\\n                <div class=\\"log-entry-top\\">\\n                  <strong data-bind-text=\\"item.title\\"></strong>\\n                  <span data-bind-text=\\"item.time\\"></span>\\n                </div>\\n                <p data-bind-text=\\"item.detail\\"></p>\\n              </article>\\n            </template>\\n            <template data-slot=\\"empty\\">\\n              <p class=\\"empty-state\\">No activity yet.</p>\\n            </template>\\n          </asljs-list>\\n        </section>\\n      </section>\\n\\n      <section class=\\"panel output-panel\\">\\n        <div class=\\"output-header\\">\\n          <h2>Extracted Text Layout</h2>\\n          <p>Whitespace preserved, 8pt monospace, all pages shown.</p>\\n        </div>\\n        <asljs-list id=\\"pages-list\\">\\n          <template data-slot=\\"container\\">\\n            <div class=\\"pages-list\\" data-role=\\"items\\"></div>\\n          </template>\\n          <template data-slot=\\"item\\">\\n            <section class=\\"page-card\\">\\n              <header class=\\"page-card-header\\">\\n                <h3>Page <span data-bind-text=\\"item.pageNumber\\"></span></h3>\\n                <span data-bind-text=\\"item.summary\\"></span>\\n              </header>\\n              <pre class=\\"page-text\\" data-bind-text=\\"item.text\\"></pre>\\n            </section>\\n          </template>\\n          <template data-slot=\\"empty\\">\\n            <div class=\\"empty-output\\">\\n              <h3>No PDF loaded</h3>\\n              <p>Drop a PDF file onto the zone to extract positioned text.</p>\\n            </div>\\n          </template>\\n        </asljs-list>\\n      </section>\\n    </main>\\n  </div>\\n\\n  <script type=\\"module\\" src=\\"app.js\\"><\/script>\\n</body>\\n</html>",
    "package.json": "{\\n  \\"name\\": \\"pdf-text-extractor\\",\\n  \\"version\\": \\"1.0.0\\",\\n  \\"private\\": true,\\n  \\"type\\": \\"module\\",\\n  \\"scripts\\": {\\n    \\"start\\": \\"npx serve .\\",\\n    \\"dev\\": \\"npx serve .\\"\\n  },\\n  \\"dependencies\\": {\\n    \\"asljs-components\\": \\"latest\\",\\n    \\"asljs-dali\\": \\"latest\\",\\n    \\"asljs-data-binding\\": \\"latest\\",\\n    \\"asljs-eventful\\": \\"latest\\",\\n    \\"asljs-observable\\": \\"latest\\"\\n  }\\n}",
    "style.css": ":root {\\n  color-scheme: light;\\n  --bg: #f4f7fb;\\n  --panel: #ffffff;\\n  --border: #d8e0ea;\\n  --text: #1f2937;\\n  --muted: #5f6b7a;\\n  --accent: #2563eb;\\n  --accent-soft: #dbeafe;\\n  --danger: #b91c1c;\\n  --shadow: 0 10px 30px rgba(15, 23, 42, 0.08);\\n}\\n\\n* {\\n  box-sizing: border-box;\\n}\\n\\nbody {\\n  margin: 0;\\n  font-family: Arial, Helvetica, sans-serif;\\n  background: var(--bg);\\n  color: var(--text);\\n}\\n\\n.app-shell {\\n  max-width: 1400px;\\n  margin: 0 auto;\\n  padding: 24px;\\n}\\n\\n.hero {\\n  display: flex;\\n  justify-content: space-between;\\n  gap: 16px;\\n  align-items: flex-start;\\n  margin-bottom: 24px;\\n}\\n\\n.hero h1 {\\n  margin: 0 0 8px;\\n}\\n\\n.subtitle {\\n  margin: 0;\\n  color: var(--muted);\\n}\\n\\n.hero-stats {\\n  display: flex;\\n  gap: 12px;\\n}\\n\\n.stat-card,\\n.panel,\\n.page-card,\\n.status-card,\\n.log-entry {\\n  background: var(--panel);\\n  border: 1px solid var(--border);\\n  border-radius: 14px;\\n  box-shadow: var(--shadow);\\n}\\n\\n.stat-card {\\n  min-width: 110px;\\n  padding: 14px;\\n}\\n\\n.stat-label {\\n  display: block;\\n  color: var(--muted);\\n  font-size: 12px;\\n  margin-bottom: 6px;\\n}\\n\\n.workspace {\\n  display: grid;\\n  grid-template-columns: 340px 1fr;\\n  gap: 20px;\\n}\\n\\n.panel {\\n  padding: 18px;\\n}\\n\\n.controls {\\n  display: flex;\\n  flex-direction: column;\\n  gap: 16px;\\n}\\n\\n.dropzone {\\n  display: flex;\\n  flex-direction: column;\\n  justify-content: center;\\n  align-items: center;\\n  min-height: 220px;\\n  border: 2px dashed #93c5fd;\\n  border-radius: 16px;\\n  background: #eff6ff;\\n  text-align: center;\\n  padding: 20px;\\n  cursor: pointer;\\n  transition: 0.2s ease;\\n}\\n\\n.dropzone.dragover {\\n  border-color: var(--accent);\\n  background: var(--accent-soft);\\n  transform: scale(1.01);\\n}\\n\\n.dropzone.busy {\\n  opacity: 0.7;\\n}\\n\\n.dropzone input {\\n  display: none;\\n}\\n\\n.dropzone-title {\\n  font-size: 20px;\\n  font-weight: 700;\\n  margin-bottom: 8px;\\n}\\n\\n.dropzone-hint {\\n  color: var(--muted);\\n  line-height: 1.5;\\n}\\n\\n.actions {\\n  display: flex;\\n  gap: 10px;\\n}\\n\\n.compact-actions {\\n  margin-bottom: 10px;\\n}\\n\\nbutton {\\n  border: 1px solid var(--border);\\n  background: white;\\n  color: var(--text);\\n  border-radius: 10px;\\n  padding: 10px 14px;\\n  cursor: pointer;\\n}\\n\\nbutton.secondary {\\n  background: #eff6ff;\\n}\\n\\nbutton.danger {\\n  color: white;\\n  background: var(--danger);\\n  border-color: var(--danger);\\n}\\n\\n.status-card {\\n  padding: 14px;\\n}\\n\\n.status-card h2,\\n.output-header h2 {\\n  margin-top: 0;\\n}\\n\\n.status-line,\\n.error-line,\\n.empty-state,\\n.empty-output p,\\n.output-header p,\\n.log-entry p {\\n  margin-bottom: 0;\\n}\\n\\n.error-line {\\n  color: var(--danger);\\n  min-height: 1.2em;\\n}\\n\\n.log-list,\\n.pages-list {\\n  display: flex;\\n  flex-direction: column;\\n  gap: 12px;\\n}\\n\\n.log-entry {\\n  padding: 12px;\\n}\\n\\n.history-entry {\\n  width: 100%;\\n  text-align: left;\\n  display: flex;\\n  flex-direction: column;\\n  gap: 6px;\\n}\\n\\n.history-entry.selected {\\n  border-color: var(--accent);\\n  background: var(--accent-soft);\\n}\\n\\n.log-entry.highlight {\\n  border-color: #93c5fd;\\n}\\n\\n.log-entry-top {\\n  display: flex;\\n  justify-content: space-between;\\n  gap: 12px;\\n  font-size: 12px;\\n  color: var(--muted);\\n}\\n\\n.output-panel {\\n  min-width: 0;\\n}\\n\\n.output-header {\\n  margin-bottom: 16px;\\n}\\n\\n.page-card {\\n  padding: 16px;\\n}\\n\\n.page-card-header {\\n  display: flex;\\n  justify-content: space-between;\\n  gap: 12px;\\n  align-items: baseline;\\n  margin-bottom: 12px;\\n}\\n\\n.page-card-header h3 {\\n  margin: 0;\\n}\\n\\n.page-text {\\n  margin: 0;\\n  white-space: pre-wrap;\\n  font-family: \\"Courier New\\", Courier, monospace;\\n  font-size: 8pt;\\n  line-height: 1.2;\\n  overflow: auto;\\n  background: #f8fafc;\\n  border: 1px solid var(--border);\\n  border-radius: 10px;\\n  padding: 12px;\\n}\\n\\n.empty-output {\\n  border: 1px dashed var(--border);\\n  border-radius: 14px;\\n  padding: 24px;\\n  text-align: center;\\n  background: #f8fafc;\\n}\\n\\n@media (max-width: 980px) {\\n  .hero,\\n  .workspace {\\n    grid-template-columns: 1fr;\\n    display: grid;\\n  }\\n\\n  .hero-stats {\\n    flex-wrap: wrap;\\n  }\\n}\\n"
  }
}`;function Kt(e){const n={};for(const t of e.files)n[t.name]=t.content;return{id:e.app.id,name:e.app.name,author:Sn(e.app.author),files:n}}function En(e){const n=JSON.parse(e);return An(n),n}function Vt(e){An(e.payload);const n=e.existingApps.find(s=>s.id===e.payload.id);if(n!==void 0)return e.navigateToExistingById?{kind:"existing",appId:n.id}:{kind:"duplicate"};const t={id:e.payload.id,uuid:e.createUuid(),name:e.payload.name,author:Sn(e.payload.author),createdAt:e.now,updatedAt:e.now},a=Object.entries(e.payload.files).map(([s,r])=>({id:e.createId(),appId:t.id,name:s,content:r}));return{kind:"new",app:t,files:a}}function An(e){if(typeof e.id!="string"||e.id.trim()==="")throw new Error("Invalid app JSON format.");if(typeof e.name!="string"||e.name.trim()==="")throw new Error("Invalid app JSON format.");if(e.files===null||typeof e.files!="object")throw new Error("Invalid app JSON format.");if(!Yt(e.author))throw new Error("Invalid app JSON format.");for(const[n,t]of Object.entries(e.files))if(n.trim()===""||typeof t!="string")throw new Error("Invalid app JSON format.")}function Sn(e){if(e===void 0)return;const n=typeof e.name=="string"?e.name.trim():"",t=typeof e.email=="string"?e.email.trim():"";if(!(n===""&&t===""))return{...n!==""?{name:n}:{},...t!==""?{email:t}:{}}}function Yt(e){if(e===void 0)return!0;if(e===null||typeof e!="object")return!1;const n=e;return!(n.name!==void 0&&typeof n.name!="string"||n.email!==void 0&&typeof n.email!="string")}const Xt=[qt,Gt];function jn(){return Xt.map(En)}function Qt(e){return jn().find(t=>t.name===e)??null}function tn(e){return jn().find(t=>t.id===e)??null}function Zt(e,n,t){return Object.entries(e.files).map(([a,s])=>({id:t(),appId:n,name:a,content:s}))}const ea=6e3;function na(e){const n=Number.isFinite(e.timeoutMs)?Math.max(1,Math.floor(e.timeoutMs)):ea;async function t(r){const o=performance.now();console.info("[share-service] create-url-start");const f=JSON.stringify(r);console.info("[share-service] create-url-serialized",{serializedLength:f.length});const w=await an(e.codec.compress(f),n,"Link compression timed out. Use Download export instead.");console.info("[share-service] create-url-compressed",{compressedLength:w.length});const g=encodeURIComponent(ra(w)),d=`${e.baseUrl}${e.hashPrefix}${g}`;return console.info("[share-service] create-url-done",{elapsedMs:Math.round(performance.now()-o),urlLength:d.length}),{url:d,exceedsMaxUrlLength:d.length>e.maxUrlLength}}async function a(r){const o=decodeURIComponent(r),f=oa(o),w=await an(e.codec.decompress(f),n,"Link decompression timed out.");return JSON.parse(w)}function s(r){return r.startsWith(e.hashPrefix)?r.slice(e.hashPrefix.length):null}return{createShareUrl:t,parsePayloadFromToken:a,readTokenFromHash:s}}function ta(){return{compress:aa,decompress:sa}}async function aa(e){const n=performance.now();console.info("[share-service] browser-compress-start",{textLength:e.length});const t=window.CompressionStream;if(t===void 0)throw new Error("Link sharing is not supported in this browser. Use Download export instead.");const a=new Blob([e]).stream().pipeThrough(new t("gzip"));console.info("[share-service] browser-compress-pipe-start");const s=new Uint8Array(await new Response(a).arrayBuffer());return console.info("[share-service] browser-compress-pipe-done"),console.info("[share-service] browser-compress-done",{elapsedMs:Math.round(performance.now()-n),outputLength:s.length}),s}async function sa(e){const n=window.DecompressionStream;if(n===void 0)throw new Error("Cannot import from shared link in this browser.");const t=e.buffer instanceof ArrayBuffer?e.buffer.slice(e.byteOffset,e.byteOffset+e.byteLength):new Uint8Array(e).buffer,a=new Blob([t]).stream().pipeThrough(new n("gzip"));return await new Response(a).text()}function ra(e){let n="";for(let a=0;a<e.length;a+=32768){const s=e.subarray(a,a+32768);n+=String.fromCharCode(...s)}return btoa(n)}function oa(e){const n=atob(e),t=new Uint8Array(n.length);for(let a=0;a<n.length;a++)t[a]=n.charCodeAt(a);return t}async function an(e,n,t){let a;const s=performance.now(),r=new Promise((o,f)=>{a=globalThis.setTimeout(()=>{console.warn("[share-service] timeout",{timeoutMs:n,elapsedMs:Math.round(performance.now()-s),timeoutMessage:t}),f(new Error(t))},n)});try{return await Promise.race([e,r])}finally{a!==void 0&&globalThis.clearTimeout(a)}}function W(){return crypto.randomUUID()}function j(){return new Date().toISOString()}function c(e){const n=document.getElementById(e);if(n===null)throw new Error(`Missing element #${e}`);return n}const ia=c("app-workspace"),la=c("first-app-setup"),Be=c("first-api-key-input"),q=c("first-app-name-input"),ca=c("btn-create-first-app"),da=c("btn-create-todo-sample"),Q=c("panels"),pa=c("panel-chat"),ua=c("panel-editor"),Te=c("app-select"),Le=c("file-select"),Ue=c("file-content"),$e=c("chat-messages"),ma=c("chat-progress"),Pe=c("chat-input"),In=c("btn-generate"),fa=c("btn-run"),ha=c("btn-refresh-preview"),re=c("preview-frame"),ga=c("btn-new-app"),va=c("btn-import"),ba=c("btn-project-settings"),ya=c("btn-share"),wa=c("btn-settings"),xa=c("btn-agent-instructions"),oe=c("btn-toggle-chat"),ie=c("btn-toggle-files"),le=c("settings-modal"),Ea=c("btn-close-settings"),Aa=c("btn-save-settings"),Sa=c("btn-cancel-settings"),Ce=c("api-key-input"),kn=c("model-select"),Tn=c("theme-select"),Ln=c("font-size-input"),Pn=c("max-tool-steps-input"),Z=c("name-modal"),ja=c("name-modal-title"),se=c("app-name-input"),ge=c("btn-confirm-name"),Ia=c("btn-cancel-name"),ka=c("btn-close-name-modal"),ce=c("project-settings-modal"),J=c("project-name-input"),Cn=c("project-author-name-input"),Fn=c("project-author-email-input"),Ta=c("btn-save-project-settings"),La=c("btn-delete-project"),Pa=c("btn-close-project-settings"),Ca=c("btn-close-project-settings-x"),de=c("share-modal"),Fa=c("btn-close-share"),Da=c("btn-close-share-2"),Fe=c("btn-share-link"),Oa=c("btn-share-download"),H=c("share-link-status"),z=c("share-link-output"),pe=c("import-file"),ue=c("agent-instructions-modal"),De=c("agent-instructions-text"),Na=c("btn-close-agent-instructions"),Ma=c("btn-close-agent-instructions-2"),Ra=c("btn-copy-agent-instructions"),Dn="asljs-app-builder-settings",On="light",Oe=14,Nn="__new__",Mn="__import__",_a="#I!",Ba=2e3,Ua=1e4,$a="https://alexandritesoftware.github.io/asljs/app-builder";let Ee=null,Ae=!1,Y=0;function He(){return Ee=Ee??na({codec:ta(),baseUrl:$a,hashPrefix:_a,maxUrlLength:Ba}),Ee}function M(){try{const e=localStorage.getItem(Dn)??"{}";return JSON.parse(e)}catch{return{}}}function ze(e){localStorage.setItem(Dn,JSON.stringify(e))}function ve(){return M().apiKey??""}function Rn(){const e=M().model;return e==="gpt-5.3-codex"||e==="gpt-5.4"?e:yt}function _n(){const e=M().maxToolSteps;if(!Number.isFinite(e))return X;const n=Math.floor(e);return n<1?X:n}function Bn(){return M().theme==="light"?"light":On}function Un(){const e=M().fontSize;if(!Number.isFinite(e))return Oe;const n=Math.floor(e);return n<12||n>20?Oe:n}function $n(){document.body.dataset.theme=Bn(),document.documentElement.style.fontSize=`${Un()}px`}function Ha(e){if(typeof e!="string")return null;const n=e.trim();return n===""?null:n}function K(){return crypto.randomUUID()}async function za(e){const n=new Set,t=[];for(const a of e){let s=Ha(a.uuid);if((s===null||n.has(s))&&(s=K()),n.add(s),a.uuid===s){t.push(a);continue}const r={...a,uuid:s,updatedAt:a.updatedAt??j()};await N(r),t.push(r)}return t}function Je(){return i.apps.find(e=>e.id===i.currentAppId)}async function Ja(e){await N(e),i.apps=i.apps.map(n=>n.id===e.id?e:n)}async function Ne(){const e=Je();if(e===void 0)return;const n={...e,uuid:K(),updatedAt:j()};await Ja(n)}const P=pt({getCurrentAppId:()=>i.currentAppId,getFiles:()=>i.files,setFiles:e=>{i.files=e},getActiveFileName:()=>i.activeFileName,setActiveFileName:e=>{i.activeFileName=e},createFileId:W,saveFile:async e=>{await un(e),await Ne()},deleteFileById:async e=>{await lt(e),await Ne()},runApp:G,evaluateInApp:e=>Dt(re,e),getAppDiagnostics:()=>Ot(re),wait:e=>new Promise(n=>{window.setTimeout(n,e)})});function me(){Ut({selectElement:Te,apps:i.apps,currentAppId:i.currentAppId,newActionValue:Nn,importActionValue:Mn})}function Hn(){ia.classList.remove("hidden");const e=i.currentAppId!==null&&i.apps.some(n=>n.id===i.currentAppId);if(la.classList.toggle("hidden",e),Q.classList.toggle("hidden",!e),!e){Be.value=ve(),q.value="";return}We(),qe()}async function zn(){const e=q.value.trim();if(e===""){q.focus();return}const n=Be.value.trim();if(n!==""){const a=M();a.apiKey=n,ze(a)}const t={id:W(),uuid:K(),name:e,createdAt:j(),updatedAt:j()};await N(t),i.apps=[...i.apps,t],await B(t.id)}async function Wa(){const e=Qt("TODO Sample");if(e===null){alert("TODO sample is not available.");return}const n=q.value.trim(),t=n===""?e.name:n,a=Be.value.trim();if(a!==""){const o=M();o.apiKey=a,ze(o)}const s={id:W(),uuid:K(),name:t,author:e.author,createdAt:j(),updatedAt:j()},r=Zt(e,s.id,W);await N(s),await mn(s.id,r),i.apps=[...i.apps,s],await B(s.id)}function We(){$t({selectElement:Le,files:i.files,activeFileName:i.activeFileName})}function qe(){Ht({textAreaElement:Ue,files:i.files,activeFileName:i.activeFileName})}function sn(e){i.generating=e,zt(In,e)}function Se(e,n){Jt(ma,e,n)}function R(e,n){Wt($e,e,n)}async function be(){if(i.activeFileName===null||i.currentAppId===null)return;const e=i.files.find(t=>t.name===i.activeFileName);if(e===void 0)return;const n=Ue.value;e.content!==n&&(e.content=n,await un(e),await Ne())}async function B(e){var t;i.currentAppId=e;const n=await it(e);i.files=n,i.activeFileName=((t=n[0])==null?void 0:t.name)??null,$e.replaceChildren()}function Jn(){ja.textContent="New App",se.value="",Z.classList.remove("hidden"),se.focus(),ge.onclick=async()=>{const e=se.value.trim();if(e==="")return;Z.classList.add("hidden");const n={id:W(),uuid:K(),name:e,createdAt:j(),updatedAt:j()};await N(n),i.apps=[...i.apps,n],await B(n.id)}}function Ge(){Z.classList.add("hidden"),ge.onclick=null}function qa(){var n,t;const e=i.apps.find(a=>a.id===i.currentAppId);e!==void 0&&(J.value=e.name,Cn.value=((n=e.author)==null?void 0:n.name)??"",Fn.value=((t=e.author)==null?void 0:t.email)??"",ce.classList.remove("hidden"),J.focus(),J.select())}function ee(){ce.classList.add("hidden")}async function Wn(){const e=i.apps.find(o=>o.id===i.currentAppId);if(e===void 0)return;const n=J.value.trim();if(n===""){J.focus();return}const t=Cn.value.trim(),a=Fn.value.trim(),s=t!==""||a!==""?{...t!==""?{name:t}:{},...a!==""?{email:a}:{}}:void 0,r={...e,name:n,author:s,updatedAt:j()};await N(r),i.apps=i.apps.map(o=>o.id===e.id?r:o),ee()}async function Ga(){ee(),await Ka()}async function Ka(){const e=i.apps.find(n=>n.id===i.currentAppId);e!==void 0&&confirm(`Delete "${e.name}"? This cannot be undone.`)&&(await ot(e.id),i.apps=i.apps.filter(n=>n.id!==e.id),i.currentAppId=null,i.files=[],i.activeFileName=null,$e.replaceChildren(),re.src="about:blank")}async function qn(){const e=Pe.value.trim();if(e==="")return;const n=ve();if(n===""){R("assistant","No OpenAI API key set. Open Settings (⚙) to add your key. Generation is optional — you can also create files manually.");return}if(i.currentAppId===null){R("assistant","Please create or open an app first.");return}Pe.value="",R("user",e),sn(!0),Se("Starting generation...",!0);try{const t=Rn(),a=_n(),s=await At(e,n,t,P,{initialToolStepLimit:a,systemPrompt:gn,onToolStepLimit:async({stepsCompleted:o})=>confirm(`AI reached ${o} tool steps without finishing. Continue for 12 more steps?`),onProgress:o=>{Se(o,!0)}}),r=i.apps.find(o=>o.id===i.currentAppId);if(r!==void 0){const o={...r,updatedAt:j()};await N(o),i.apps=i.apps.map(f=>f.id===r.id?o:f)}R("assistant",s.summary),G()}catch(t){const a=t instanceof Error?t.message:String(t);R("assistant",`Error: ${a}`)}finally{Se("",!1),sn(!1)}}function G(){be().then(()=>{Ft(re,i.files,{hostOpenAiApiKey:ve()})})}async function Gn(){await be();const e=Je();if(e===void 0)throw new Error("No app selected.");return Kt({app:e,files:i.files})}function Va(e){const n=new Blob([JSON.stringify(e,null,2)],{type:"application/json"}),t=URL.createObjectURL(n),a=document.createElement("a");a.href=t,a.download=`${e.name.replace(/\s+/g,"-")}.json`,a.click(),URL.revokeObjectURL(t)}function Ya(e){var r,o;const n=((r=e==null?void 0:e.name)==null?void 0:r.trim())??"",t=((o=e==null?void 0:e.email)==null?void 0:o.trim())??"";return`Author: ${n===""?"Not provided":n}
Email: ${t===""?"Not provided":t}`}function Kn(e){return confirm(`Security warning: You are about to import an application.

${Ya(e.author)}

Although apps run in an isolated browser context, imported code can still be harmful. Be vigilant and only open apps from sources you trust.

Do you want to continue?`)}function ae(e){const n=e==="run";Q.classList.toggle("chat-collapsed",n),Q.classList.toggle("files-collapsed",n),oe.textContent=n?"Chat ▸":"Chat ▾",ie.textContent=n?"Files ▸":"Files ▾",oe.setAttribute("aria-expanded",String(!n)),ie.setAttribute("aria-expanded",String(!n))}function rn(){return confirm(`You followed the application link.

Click OK to start the application.
Click Cancel to edit it.`)?"run":"edit"}function Vn(){pe.value="",pe.click()}async function Me(e,n){const t=Vt({payload:e,existingApps:i.apps,navigateToExistingById:n.navigateToExistingById,now:j(),createId:W,createUuid:K});return t.kind==="duplicate"?(n.showDuplicateAlert&&alert("Import stopped: an app with the same ID already exists."),null):t.kind==="existing"?(await B(t.appId),t.appId):(await N(t.app),await mn(t.app.id,t.files),i.apps=[...i.apps,t.app],await B(t.app.id),t.app.id)}async function Xa(){var n;const e=(n=pe.files)==null?void 0:n[0];if(e!==void 0)try{const t=await e.text(),a=En(t);if(!Kn(a))return;await Me(a,{navigateToExistingById:!1,showDuplicateAlert:!0})}catch(t){const a=t instanceof Error?t.message:String(t);alert(`Import failed: ${a}`)}}function Qa(){return He().readTokenFromHash(window.location.hash)}function je(){window.history.pushState(null,"",`${window.location.pathname}${window.location.search}`)}async function Yn(){const e=Qa();if(e===null||e.trim()==="")return!1;if(Ae)return!0;Ae=!0;try{const n=(()=>{try{return decodeURIComponent(e)}catch{return e}})(),t=tn(e)??tn(n);if(t!==null)return await Me(t,{navigateToExistingById:!0,showDuplicateAlert:!1})!==null&&(rn()==="run"?(ae("run"),G()):ae("edit")),je(),!0;try{const a=await He().parsePayloadFromToken(e);if(!Kn(a))return je(),!0;await Me(a,{navigateToExistingById:!0,showDuplicateAlert:!1})!==null&&(rn()==="run"?(ae("run"),G()):ae("edit"))}catch(a){const s=a instanceof Error?a.message:String(a);alert(`Could not import from share link: ${s}`)}return je(),!0}finally{Ae=!1}}async function Za(){const e=++Y,n=performance.now();console.info("[share-ui] prepare-start",{requestId:e}),z.value="",Fe.disabled=!0,H.textContent="Preparing share link...";try{const t=await ns((async()=>{console.info("[share-ui] build-payload-start",{requestId:e});const a=await Gn();return console.info("[share-ui] build-payload-done",{requestId:e,appId:a.id,fileCount:Object.keys(a.files).length}),console.info("[share-ui] create-share-url-start",{requestId:e}),He().createShareUrl(a)})(),Ua,"Preparing share link timed out. Use Download export instead.");if(e!==Y){console.info("[share-ui] prepare-stale-result",{requestId:e});return}if(t.exceedsMaxUrlLength){console.warn("[share-ui] prepare-too-long",{requestId:e,urlLength:t.url.length}),H.textContent="Link sharing is unavailable because URL length exceeds 2000 characters. Use Download export and import the file instead.";return}console.info("[share-ui] prepare-success",{requestId:e,elapsedMs:Math.round(performance.now()-n),urlLength:t.url.length}),z.value=t.url,H.textContent="Link is ready. Use Share with link to copy it.",Fe.disabled=!1}catch(t){const a=t instanceof Error?t.message:String(t);console.error("[share-ui] prepare-error",{requestId:e,elapsedMs:Math.round(performance.now()-n),message:a}),e===Y&&(H.textContent=a)}}function es(){Je()!==void 0&&(de.classList.remove("hidden"),Za())}function Ke(){console.info("[share-ui] close-modal",{nextPreparationId:Y+1}),Y+=1,de.classList.add("hidden")}async function ns(e,n,t){let a;const s=performance.now(),r=new Promise((o,f)=>{a=globalThis.setTimeout(()=>{console.warn("[share-ui] timeout",{timeoutMs:n,elapsedMs:Math.round(performance.now()-s),timeoutMessage:t}),f(new Error(t))},n)});try{return await Promise.race([e,r])}finally{a!==void 0&&globalThis.clearTimeout(a)}}async function ts(){if(z.value.trim()!=="")try{await navigator.clipboard.writeText(z.value),H.textContent="Share link copied to clipboard."}catch{z.focus(),z.select(),H.textContent="Could not copy automatically. Link is selected, copy it manually."}}async function as(){const e=await Gn();Va(e)}function ss(){Ce.value=ve(),kn.value=Rn(),Tn.value=Bn(),Ln.value=String(Un()),Pn.value=String(_n()),le.classList.remove("hidden"),Ce.focus()}function ye(){le.classList.add("hidden")}function rs(){const e=M();e.apiKey=Ce.value.trim(),e.model=kn.value==="gpt-5.4"?"gpt-5.4":"gpt-5.3-codex",e.theme=Tn.value==="light"?"light":On;const n=Number.parseInt(Ln.value,10);e.fontSize=Number.isFinite(n)&&n>=12&&n<=20?n:Oe;const t=Number.parseInt(Pn.value,10);e.maxToolSteps=Number.isFinite(t)&&t>=1?t:X,ze(e),$n(),ye()}function os(){De.value=gn,ue.classList.remove("hidden"),De.scrollTop=0}function Ve(){ue.classList.add("hidden")}function is(){xn({panelElement:pa,toggleButtonElement:oe,panelsElement:Q,collapsedPanelsClass:"chat-collapsed",expandedLabel:"Chat ▾",collapsedLabel:"Chat ▸"})}function ls(){xn({panelElement:ua,toggleButtonElement:ie,panelsElement:Q,collapsedPanelsClass:"files-collapsed",expandedLabel:"Files ▾",collapsedLabel:"Files ▸"})}async function cs(){const e=De.value;try{await navigator.clipboard.writeText(e),R("assistant","Agent instructions copied to clipboard.")}catch{R("assistant","Could not copy to clipboard automatically. You can still select and copy from the instructions modal.")}}i.on("set:apps",()=>me());i.on("set:currentAppId",()=>{me(),Hn()});i.on("set:files",()=>{We(),qe()});i.on("set:activeFileName",()=>{We(),qe()});ga.addEventListener("click",Jn);va.addEventListener("click",Vn);ba.addEventListener("click",qa);ya.addEventListener("click",()=>{es()});In.addEventListener("click",()=>{qn()});fa.addEventListener("click",G);ha.addEventListener("click",G);wa.addEventListener("click",ss);xa.addEventListener("click",os);oe.addEventListener("click",is);ie.addEventListener("click",ls);Ea.addEventListener("click",ye);Aa.addEventListener("click",rs);Sa.addEventListener("click",ye);le.addEventListener("click",e=>{e.target===le&&ye()});Na.addEventListener("click",Ve);Ma.addEventListener("click",Ve);Ra.addEventListener("click",()=>{cs()});ue.addEventListener("click",e=>{e.target===ue&&Ve()});Fa.addEventListener("click",Ke);Da.addEventListener("click",Ke);Fe.addEventListener("click",()=>{ts()});Oa.addEventListener("click",()=>{as()});de.addEventListener("click",e=>{e.target===de&&Ke()});ge.addEventListener("click",()=>{});Ia.addEventListener("click",Ge);ka.addEventListener("click",Ge);Z.addEventListener("click",e=>{e.target===Z&&Ge()});Ta.addEventListener("click",()=>{Wn()});La.addEventListener("click",()=>{Ga()});Pa.addEventListener("click",ee);Ca.addEventListener("click",ee);ce.addEventListener("click",e=>{e.target===ce&&ee()});se.addEventListener("keydown",e=>{e.key==="Enter"&&ge.click()});J.addEventListener("keydown",e=>{e.key==="Enter"&&(e.preventDefault(),Wn())});ca.addEventListener("click",()=>{zn()});da.addEventListener("click",()=>{Wa()});q.addEventListener("keydown",e=>{e.key==="Enter"&&(e.preventDefault(),zn())});Pe.addEventListener("keydown",e=>{e.key==="Enter"&&!e.shiftKey&&(e.preventDefault(),qn())});Te.addEventListener("change",()=>{const e=Te.value;if(e===Nn){Jn(),me();return}if(e===Mn){Vn(),me();return}e!==""&&e!==i.currentAppId&&B(e)});Le.addEventListener("change",()=>{const e=Le.value;e===""||e===i.activeFileName||(be(),i.activeFileName=e)});Ue.addEventListener("blur",()=>{be()});pe.addEventListener("change",()=>{Xa()});window.listFileset=P.listFileset;window.readFile=P.readFile;window.setFileContent=P.setFileContent;window.replaceFilePart=P.replaceFilePart;window.deleteFile=P.deleteFile;window.evalInApp=P.evalInApp;window.getAppDiagnostics=P.getAppDiagnostics;window.runAppAndCollectDiagnostics=P.runAppAndCollectDiagnostics;window.addEventListener("hashchange",()=>{Yn()});async function ds(){$n();const e=await za(await rt());if(i.apps=e,!await Yn())if(e.length>0){const t=[...e].sort((a,s)=>s.updatedAt.localeCompare(a.updatedAt));await B(t[0].id)}else i.currentAppId=null,i.files=[],i.activeFileName=null,Hn(),q.focus()}ds().catch(e=>{console.error("App Builder init failed:",e)});
