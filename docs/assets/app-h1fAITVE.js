(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))a(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const o of i.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&a(o)}).observe(document,{childList:!0,subtree:!0});function t(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerPolicy&&(i.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?i.credentials="include":s.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function a(s){if(s.ep)return;s.ep=!0;const i=t(s);fetch(s.href,i)}})();class Un extends Error{constructor(n,t,a,s,i){super(n),this.name="ListenerError",this.error=t,this.object=a,this.event=s,this.listener=i}}function J(e){if(typeof e!="string"&&typeof e!="symbol")throw new TypeError("Expect event to be a string or symbol.")}function ue(e){return typeof e=="function"}function ze(e){if(ue(e))return e}function Ze(e){return typeof e=="object"&&e!==null}function be(e){if(!ue(e))throw new TypeError("Expect a function.")}const $n=(e=Object.create(null),n={})=>{if(!Ze(e)&&!ue(e))throw new TypeError("Expect an object or a function.");for(const p of["on","once","off","emit","emitAsync","has"])if(p in e)throw new Error(`Method "${p}" already exists.`);const{strict:t=!1,trace:a=null,error:s=null}=n,i=ze(a)??null,o=ze(s)??null,h=e!==_,A=(p,f)=>{i==null||i(p,f),h&&_.emit(p,f)};A("new",{object:e});const g=new Set,d=new Map,v={enumerable:!1,configurable:!0,writable:!0};return Object.defineProperties(e,{on:Object.assign({value:E},v),once:Object.assign({value:w},v),off:Object.assign({value:y},v),emit:Object.assign({value:L},v),emitAsync:Object.assign({value:I},v),has:Object.assign({value:j},v)}),e;function l(p,f){let b=d.get(p);b||d.set(p,b=new Set),b.add(f)}function m(p,f){const b=d.get(p);if(!b)return!1;const S=b.delete(f);return b.size===0&&d.delete(p),S}function u(p,f,b){const S={error:b,object:e,event:p,listener:f};if(o==null||o(S),e===_&&p==="error")throw new Un("Error in a global error listener.",b,e,p,f);_.emit("error",S)}function E(p,f){J(p),be(f),A("on",{object:e,event:p,listener:f}),l(p,f);let b=!0;return()=>b?(b=!1,m(p,f)):!1}function w(p,f){J(p),be(f);const b=E(p,(...S)=>{b(),f(...S)});return b}function y(p,f){return J(p),be(f),A("off",{object:e,event:p,listener:f}),m(p,f)}function j(p){var f;return J(p),(((f=d.get(p))==null?void 0:f.size)??0)>0}function L(p,...f){J(p);const b=d.get(p)||g;if(A("emit",{object:e,listeners:[...b],event:p,args:f}),b.size!==0)for(const S of b)try{S(...f)}catch(P){if(u(p,S,P),t)throw P}}async function I(p,...f){J(p);const b=d.get(p)||g;if(A("emitAsync",{object:e,listeners:[...b],event:p,args:f}),b.size===0)return;const S=[...b].map(async P=>{try{await P(...f)}catch(We){if(u(p,P,We),t)throw We}});await(t?Promise.all(S):Promise.allSettled(S))}},_=$n;_(_);function Jn(e){return!Ze(e)&&!ue(e)?!1:typeof e.on=="function"}function en(e){if(Jn(e))return e}function T(e){return typeof e=="function"}function Fe(e){return typeof e=="object"&&e!==null}function nn(e){if(!T(e))throw new TypeError("Expect a function.")}function Ee(e){if(e.trim()==="")throw new TypeError("Expect watch path to be a non-empty string.");const n=e.split(".");for(const t of n)if(t.trim()==="")throw new TypeError("Expect watch path segments to be non-empty.");return e.split(".").map(t=>t.trim()).filter(t=>t!=="")}function Hn(e,n){const t=Ee(n);if(t.length===0)return;let a=e;for(const s of t){if(!Fe(a)||!(s in a))return;a=a[s]}return a}const tn=(e,n,t)=>{if(Array.isArray(e))throw new TypeError("Watching arrays is not supported.");nn(t);const a=typeof n=="string"?[n]:n;if(!Array.isArray(a))throw new TypeError("Expect properties to be a string or an array of strings.");for(const o of a){if(typeof o!="string")throw new TypeError("Expect properties to be a string or an array of strings.");Ee(o)}const s=()=>a.map(o=>Hn(e,o)),i=[];for(const o of a){const h=Ee(o);let A=null;const g=()=>{const d=[],v=(l,m)=>{if(!Fe(l)||m>=h.length)return;const u=h[m],E=en(l);if(E){const w=E.on(`set:${u}`,()=>{t(...s()),m<h.length-1&&A&&(A(),A=g())});d.push(w)}m<h.length-1&&v(l[u],m+1)};return v(e,0),()=>d.reduce((l,m)=>m()||l,!1)};A=g(),i.push(()=>A?A():!1)}return t(...s()),()=>i.reduce((o,h)=>h()||o,!1)};function Wn(e,n){"watch"in e||Object.defineProperty(e,"watch",{configurable:!0,writable:!0,enumerable:!1,value(t,a){return n(typeof t=="string"?this:this,t,a)}})}function Ke(e,n){return Object.prototype.hasOwnProperty.call(e,n)}function ye(e){if(typeof e=="symbol")return!1;const n=typeof e=="number"?e:Number(e);return!Number.isInteger(n)||n<0||n>=4294967295?!1:typeof e=="number"||e===String(n)}function zn(e){return en(e)?T(e.emit):!1}const an=(e,n={})=>{const{eventful:t=_,trace:a=null,shallow:s=!1}=n;nn(t);const i=me.options,o=new WeakMap,h=l=>{if(s||!Fe(l)||zn(l))return l;if(o.has(l))return o.get(l);const m=an(l,{eventful:t,trace:a,shallow:s});return o.set(l,m),m},A=l=>{if(!s){if(Array.isArray(l)){for(let m=0;m<l.length;m++)l[m]=h(l[m]);return}for(const m of Reflect.ownKeys(l))Ke(l,m)&&(l[m]=h(l[m]))}},g=l=>{const m=Array.isArray(l);A(l),Wn(l,tn);let u;const E=new Proxy(l,{set(w,y,j,L){const I=m&&ye(y),p=Reflect.get(w,y,L),f=Reflect.set(w,y,h(j),L);if(u&&f){const b=Reflect.get(w,y,L);if(!Object.is(p,b)){const S=I?{index:Number(y),value:b,previous:p}:{property:y,value:b,previous:p},P=a||i.trace;u.emit(`set:${String(y)}`,S),T(P)&&P(u,"set",S),u.emit("set",S)}}return f},deleteProperty(w,y){const j=m&&ye(y),L=Ke(w,y),I=L?w[y]:void 0,p=Reflect.deleteProperty(w,y);if(u&&p&&L){const f=j?{index:Number(y),previous:I}:{property:y,previous:I},b=a||i.trace;u.emit(`delete:${String(y)}`,f),T(b)&&b(u,"delete",f),u.emit("delete",f)}return p},defineProperty(w,y,j){const L=Object.getOwnPropertyDescriptor(w,y)??null,I=Object.prototype.hasOwnProperty.call(j,"value")?{...j,value:h(j.value)}:j,p=Reflect.defineProperty(w,y,I),f=m&&(y==="length"||ye(y));if(u&&!f&&p){const b={property:y,descriptor:I,previous:L},S=a||i.trace;u.emit(`define:${String(y)}`,b),T(S)&&S(u,"define",b),u.emit("define",b)}return p}});return u=T(l==null?void 0:l.emit)?E:t(E),u},d=a||i.trace;if(Array.isArray(e)){const l=g(e);return T(d)&&d(l,"new"),l}if(e!==null&&typeof e=="object"){const l=g(e);return T(d)&&d(l,"new",{object:l}),l}const v=t({get value(){return e},set value(l){if(Object.is(l,e))return;const m=e;e=l;const u={property:"value",value:e,previous:m};v.emit("set:value",u),T(d)&&d(v,"set",u),v.emit("set",u)}});return T(d)&&d(v,"new",{object:v}),v},me=an;me.options={trace:null};me.watch=tn;const r=me({apps:[],currentAppId:null,files:[],activeFileName:null,generating:!1,error:null});function k(e){return new Promise((n,t)=>{e.addEventListener("success",()=>{n(e.result)}),e.addEventListener("error",()=>{t(e.error??new Error("IndexedDB request failed"))})})}function Kn(e,n){return new Promise((t,a)=>{const s=indexedDB.open(e,n.length);s.addEventListener("upgradeneeded",i=>{const o=n.slice(i.oldVersion-1,i.newVersion??n.length-1);for(const h of o)h(s.result)}),s.addEventListener("success",()=>{t(s.result)}),s.addEventListener("blocked",()=>{a(new Error("Database opening is blocked"))}),s.addEventListener("error",()=>{a(s.error??new Error("Failed to open database"))})})}const qn="asljs-app-builder";let ee=null;async function $(){return ee!==null||(ee=await Kn(qn,[e=>{e.createObjectStore("apps",{keyPath:"id"}),e.createObjectStore("files",{keyPath:"id"}).createIndex("byAppId","appId",{unique:!1})}])),ee}async function Gn(){const n=(await $()).transaction("apps","readonly");return k(n.objectStore("apps").getAll())}async function N(e){const t=(await $()).transaction("apps","readwrite");await k(t.objectStore("apps").put(e))}async function Vn(e){const t=(await $()).transaction(["apps","files"],"readwrite");await k(t.objectStore("apps").delete(e));const a=t.objectStore("files"),s=await k(a.index("byAppId").getAllKeys(e));for(const i of s)await k(a.delete(i))}async function Yn(e){const t=(await $()).transaction("files","readonly");return k(t.objectStore("files").index("byAppId").getAll(e))}async function sn(e){const t=(await $()).transaction("files","readwrite");await k(t.objectStore("files").put(e))}async function Xn(e){const t=(await $()).transaction("files","readwrite");await k(t.objectStore("files").delete(e))}async function on(e,n){const s=(await $()).transaction("files","readwrite").objectStore("files"),i=await k(s.index("byAppId").getAllKeys(e));for(const o of i)await k(s.delete(o));for(const o of n)await k(s.put(o))}function F(e,n,t,a){return{name:e,type:"function",description:n,parameters:{type:"object",properties:t||{},required:a||[],additionalProperties:!1},strict:!0}}const Qn=[F("listFileset","List all file paths in the virtual filesystem."),F("readFile","Read the full text content of a file.",{path:{type:"string"}},["path"]),F("setFileContent","Create or fully replace file content.",{path:{type:"string"},content:{type:"string"}},["path","content"]),F("replaceFilePart","Replace part of a file by exact search string.",{path:{type:"string"},search:{type:"string"},replacement:{type:"string"},replaceAll:{type:"boolean"}},["path","search","replacement","replaceAll"]),F("deleteFile","Delete a file from the virtual filesystem.",{path:{type:"string"}},["path"]),F("evalInApp","Evaluate JavaScript in the running app document context.",{code:{type:"string"}},["code"]),F("getAppDiagnostics","Get current runtime logs and errors from the running app."),F("runAppAndCollectDiagnostics","Run the app and collect runtime logs and errors after startup.")],Zn=350;function et(e){async function n(){return[...e.getFiles()].map(g=>g.name).sort((g,d)=>g.localeCompare(d))}async function t(g){const d=ne(e,g),v=d===null?void 0:e.getFiles().find(l=>l.name===d);if(v===void 0)throw new Error(`File not found: ${g}`);return v.content}async function a(g,d){const v=nt(e),l=Ae(g),m=ne(e,l),u=e.getFiles().find(w=>w.name===(m??l));if(u!==void 0){const w={...u,content:d};await e.saveFile(w),e.setFiles(e.getFiles().map(y=>y.id===w.id?w:y)),e.setActiveFileName(w.name);return}const E={id:e.createFileId(),appId:v,name:l,content:d};await e.saveFile(E),e.setFiles([...e.getFiles(),E]),e.setActiveFileName(E.name)}async function s(g){var m;const d=ne(e,g),v=d===null?void 0:e.getFiles().find(u=>u.name===d);if(v===void 0)return;await e.deleteFileById(v.id);const l=e.getFiles().filter(u=>u.id!==v.id);e.setFiles(l),e.getActiveFileName()===g&&e.setActiveFileName(((m=l[0])==null?void 0:m.name)??null)}async function i(g,d,v,l=!1){if(d==="")throw new Error("Search text cannot be empty.");const m=ne(e,g);if(m===null)throw new Error(`File not found: ${g}`);const u=await t(m);if(!u.includes(d))throw new Error(`Search text not found in ${m}.`);let E=u;if(l)E=u.split(d).join(v);else{const w=u.indexOf(d);if(u.indexOf(d,w+d.length)!==-1)throw new Error("Search text is ambiguous. Use replaceAll=true or provide a more specific search block.");E=u.slice(0,w)+v+u.slice(w+d.length)}await a(m,E)}async function o(g){if(e.getFiles().length===0)throw new Error("No files available to run.");e.runApp();try{return await e.evaluateInApp(g)}catch{return e.runApp(),e.evaluateInApp(g)}}async function h(){return e.getAppDiagnostics()}async function A(){return e.runApp(),await e.wait(e.diagnosticsDelayMs??Zn),e.getAppDiagnostics()}return{listFileset:n,readFile:t,setFileContent:a,deleteFile:s,replaceFilePart:i,evalInApp:o,getAppDiagnostics:h,runAppAndCollectDiagnostics:A}}function nt(e){const n=e.getCurrentAppId();if(n===null)throw new Error("No active app. Create or open an app first.");return n}function Ae(e){const n=e.trim().replace(/\\/g,"/").replace(/^\.\//,"").replace(/^\/+/,"");if(n==="")throw new Error("Path cannot be empty.");if(n.includes(".."))throw new Error("Parent path segments are not allowed.");return n}function ne(e,n){const t=Ae(n),a=e.getFiles().find(s=>Ae(s.name).toLowerCase()===t.toLowerCase());return(a==null?void 0:a.name)??null}function tt(e){return typeof e!="object"||e===null?!1:e.type==="function_call"}function rn(e){if(typeof e.name!="string"||e.name.trim()==="")throw new Error("Tool call missing function name.");return e.name}function at(e){if(typeof e.call_id!="string"||e.call_id.trim()==="")throw new Error("Tool call missing call_id.");return e.call_id}async function st(e,n){const t=rn(e),a=it(e.arguments);try{switch(t){case"listFileset":{const s=await n.listFileset();return D(s)}case"readFile":{const s=await n.readFile(O(a,"path"));return D(s)}case"setFileContent":return await n.setFileContent(O(a,"path"),O(a,"content")),D("ok");case"replaceFilePart":return await n.replaceFilePart(O(a,"path"),O(a,"search"),O(a,"replacement"),ot(a,"replaceAll",!1)),D("ok");case"deleteFile":return await n.deleteFile(O(a,"path")),D("ok");case"evalInApp":{const s=await n.evalInApp(O(a,"code"));return D(s)}case"getAppDiagnostics":{const s=await n.getAppDiagnostics();return D(s)}case"runAppAndCollectDiagnostics":{const s=await n.runAppAndCollectDiagnostics();return D(s)}default:return qe(`Unknown tool: ${t}`)}}catch(s){return qe(s instanceof Error?s.message:String(s))}}function it(e){if(e===void 0)return{};if(typeof e=="object"&&e!==null)return e;if(typeof e!="string")throw new Error("Invalid tool arguments value.");try{const n=JSON.parse(e);if(typeof n!="object"||n===null)throw new Error("Tool arguments must be a JSON object.");return n}catch{throw new Error("Invalid tool arguments JSON.")}}function O(e,n){const t=e[n];if(typeof t!="string")throw new Error(`Tool argument "${n}" must be a string.`);return t}function ot(e,n,t){const a=e[n];if(a===void 0)return t;if(typeof a!="boolean")throw new Error(`Tool argument "${n}" must be a boolean.`);return a}function D(e){return ln({ok:!0,value:e})}function qe(e){return ln({ok:!1,error:e})}function ln(e){try{return JSON.stringify(e)}catch{return'{"ok":false,"error":"Failed to serialize tool result."}'}}const rt="https://api.openai.com/v1/responses",lt="gpt-5.3-codex",V=20,ct="You are an expert ASLJS app generator.",dt=12,pt={createResponse:async e=>{const n=await fetch(rt,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${e.apiKey}`},body:JSON.stringify({model:e.model,instructions:e.instructions,temperature:e.temperature,previous_response_id:e.previous_response_id,input:e.input,tools:e.tools})});if(!n.ok){const t=await n.json().catch(()=>({})),a=ft(t)??`OpenAI API error: ${n.status}`;throw new Error(a)}return n.json()}};async function ut(e,n,t,a,s){var v;const i=(s==null?void 0:s.transport)??pt,o=(s==null?void 0:s.systemPrompt)??ct;let h,A=e,g=mt(s==null?void 0:s.initialToolStepLimit),d=0;for(;;){if(await G(s,`Step ${d+1}: requesting assistant response...`),d>=g){if(!(await((v=s==null?void 0:s.onToolStepLimit)==null?void 0:v.call(s,{stepsCompleted:d,stepLimit:g}))??!1))throw new Error("AI exceeded maximum tool steps without completing.");g+=dt,await G(s,`Extended step limit to ${g}. Continuing...`)}const l=await i.createResponse({apiKey:n,model:t,instructions:o,temperature:.1,previous_response_id:h,input:A,tools:Qn});if(!Array.isArray(l.output))throw new Error("AI returned an unexpected response format.");const m=l.output.filter(tt);if(m.length===0){await G(s,`Completed in ${d+1} step(s). Finalizing summary...`);const E=ht(l);return{summary:E===""?"Completed tool-based update.":E}}const u=[];for(const E of m){await G(s,`Step ${d+1}: running ${rn(E)}...`);const w=await st(E,a);u.push({type:"function_call_output",call_id:at(E),output:w})}await G(s,`Step ${d+1}: submitted ${u.length} tool result(s).`),h=typeof l.id=="string"?l.id:h,A=u,d+=1}}function mt(e){if(!Number.isFinite(e))return V;const n=Math.floor(e);return n>=1?n:V}async function G(e,n){(e==null?void 0:e.onProgress)!==void 0&&await Promise.resolve(e.onProgress(n))}function ft(e){const n=e.error;return typeof(n==null?void 0:n.message)=="string"?n.message:null}function ht(e){return typeof e.output_text=="string"&&e.output_text.trim()!==""?e.output_text.trim():Array.isArray(e.output)?e.output.filter(t=>t.type==="message").flatMap(t=>t.content??[]).map(t=>t.text??"").map(t=>t.trim()).filter(t=>t!=="").join(`
`):""}const gt=`# observable

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
`,vt=`# eventful

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
`,bt=`# data-binding

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
- this file (\`components/AI.md\`) for AI-facing usage guidance.
`,wt=`# dali

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
<\/script>`;function Et(e,n,t){if(n.length===0){e.removeAttribute("srcdoc"),e.src="about:blank";return}const a=n.find(o=>o.name==="index.html")??n.find(o=>o.name.endsWith(".html"))??null;if(a===null){e.removeAttribute("srcdoc"),e.src="about:blank";return}let s=a.content;const i=n.find(o=>o.name==="style.css")??n.find(o=>o.name.endsWith(".css"))??null;i!==null&&(s=s.replace(/<link[^>]+href=["']style\.css["'][^>]*>/gi,`<style>${i.content}</style>`),s=s.replace(/<link[^>]+href=["']([^"']+\.css)["'][^>]*>/gi,`<style>${i.content}</style>`));for(const o of n){if(!o.name.endsWith(".js"))continue;const h=o.name.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");s=s.replace(new RegExp(`(<script[^>]*?)\\s+src=["']${h}["']([^>]*)><\\/script>`,"gi"),(A,g,d)=>{const v=`${String(g)} ${String(d)}`;return/type=["']module["']/i.test(v)?`<script type="module">${o.content}<\/script>`:`<script>${o.content}<\/script>`})}s=kt(s,n),s=Tt(s,t),s=xt(s),e.srcdoc=s}async function At(e,n){const t=await mn(e,Oe,{code:n},dn);if(t.ok===!0)return t.value;throw new Error(typeof t.error=="string"?t.error:"Unknown preview evaluation error.")}async function St(e){const n=await mn(e,pn,{},un);if(n.ok!==!0)throw new Error(typeof n.error=="string"?n.error:"Failed to read preview diagnostics.");return n.diagnostics??{logs:[],errors:[]}}async function mn(e,n,t,a){const s=e.contentWindow;if(s===null)throw new Error("Preview frame is not available.");const i=crypto.randomUUID();return new Promise((o,h)=>{const A=window.setTimeout(()=>{d(),h(new Error("Timed out waiting for app evaluation result."))},5e3),g=v=>{if(v.source!==s)return;const l=v.data;l.type!==a||l.id!==i||(d(),o(l))};function d(){window.clearTimeout(A),window.removeEventListener("message",g)}window.addEventListener("message",g),s.postMessage({type:n,id:i,...t},"*")})}function xt(e){return e.includes(Oe)?e:e.includes("</body>")?e.replace("</body>",`${Ge}</body>`):`${e}
${Ge}`}function kt(e,n){if(/type=["']importmap["']/i.test(e))return e;const t=n.find(o=>o.name==="package.json")??null,a=jt(t==null?void 0:t.content),s=Object.fromEntries(a.map(([o,h])=>[o,`https://esm.sh/${o}@${h}?bundle`]));if(Object.keys(s).length===0)return e;const i=`<script type="importmap">${JSON.stringify({imports:s})}<\/script>`;return/<head[^>]*>/i.test(e)?e.replace(/<head[^>]*>/i,o=>`${o}
${i}`):`${i}
${e}`}function jt(e){if(e===void 0)return Ve();try{const n=JSON.parse(e),t={...n.dependencies??{},...n.devDependencies??{}};return["asljs-eventful","asljs-observable","asljs-data-binding","asljs-components","asljs-dali","openai"].map(i=>[i,Lt(t[i])])}catch{return Ve()}}function Lt(e){if(typeof e!="string"||e.trim()==="")return"latest";const n=e.trim().replace(/^[~^<>=\s]+/,"");return n===""?"latest":n}function Ve(){return[["asljs-eventful","latest"],["asljs-observable","latest"],["asljs-data-binding","latest"],["asljs-components","latest"],["asljs-dali","latest"],["openai","latest"]]}function Tt(e,n){if(e.includes("__ASLJS_APP_BUILDER_HOST__"))return e;const t=`<script>window.__ASLJS_APP_BUILDER_HOST__ = ${JSON.stringify({openAiApiKey:(n==null?void 0:n.hostOpenAiApiKey)===void 0||n.hostOpenAiApiKey.trim()===""?null:n.hostOpenAiApiKey})};<\/script>`;return e.includes("</head>")?e.replace("</head>",`${t}</head>`):e.includes("<body")?e.replace(/<body[^>]*>/i,a=>`${a}
${t}`):`${t}
${e}`}function It(e){const n=e.selectElement;n.replaceChildren();const t=[...e.apps].sort((i,o)=>o.updatedAt.localeCompare(i.updatedAt));for(const i of t){const o=document.createElement("option");o.value=i.id,o.textContent=i.name,n.appendChild(o)}if(t.length>0){const i=document.createElement("option");i.value="__separator__",i.textContent="────────",i.disabled=!0,n.appendChild(i)}const a=document.createElement("option");a.value=e.newActionValue,a.textContent="New...",n.appendChild(a);const s=document.createElement("option");s.value=e.importActionValue,s.textContent="Import...",n.appendChild(s),e.currentAppId!==null&&(n.value=e.currentAppId)}function Ct(e){const n=e.selectElement;if(n.replaceChildren(),e.files.length===0){const a=document.createElement("option");a.value="",a.textContent="No files",n.appendChild(a),n.value="",n.disabled=!0;return}for(const a of e.files){const s=document.createElement("option");s.value=a.name,s.textContent=a.name,n.appendChild(s)}const t=e.activeFileName??e.files[0].name;n.value=t,n.disabled=!1}function Pt(e){const n=e.files.find(t=>t.name===e.activeFileName);e.textAreaElement.value=(n==null?void 0:n.content)??"",e.textAreaElement.disabled=n===void 0}function Ft(e,n){e.disabled=n,e.innerHTML=n?'<span class="spinner"></span> Sending…':"Send"}function Ot(e,n,t){e.textContent=n,e.classList.toggle("hidden",!t)}function Dt(e,n,t){const a=document.createElement("div");a.className=`chat-msg ${n}`;const s=document.createElement("div");s.className="chat-msg-role",s.textContent=n==="user"?"You":"Assistant";const i=document.createElement("div");i.className="chat-bubble",i.textContent=t,a.appendChild(s),a.appendChild(i),e.appendChild(a),e.scrollTop=e.scrollHeight}function fn(e){const n=!e.panelElement.classList.contains("collapsed");return e.toggleButtonElement.textContent=n?e.collapsedLabel:e.expandedLabel,e.toggleButtonElement.setAttribute("aria-expanded",n?"false":"true"),e.panelElement.classList.toggle("collapsed",n),e.panelsElement.classList.toggle(e.collapsedPanelsClass,n),n}function Nt(e,n){return[{id:n(),appId:e,name:"index.html",content:`<!doctype html>
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
`}]}function B(){return crypto.randomUUID()}function x(){return new Date().toISOString()}function c(e){const n=document.getElementById(e);if(n===null)throw new Error(`Missing element #${e}`);return n}const Mt=c("app-workspace"),Rt=c("first-app-setup"),De=c("first-api-key-input"),K=c("first-app-name-input"),_t=c("btn-create-first-app"),Bt=c("btn-create-todo-sample"),Y=c("panels"),Ut=c("panel-chat"),$t=c("panel-editor"),Se=c("app-select"),xe=c("file-select"),Ne=c("file-content"),Me=c("chat-messages"),Jt=c("chat-progress"),ke=c("chat-input"),hn=c("btn-generate"),Ht=c("btn-run"),Wt=c("btn-refresh-preview"),ae=c("preview-frame"),zt=c("btn-new-app"),Kt=c("btn-import"),qt=c("btn-project-settings"),Gt=c("btn-share"),Vt=c("btn-settings"),Yt=c("btn-agent-instructions"),se=c("btn-toggle-chat"),ie=c("btn-toggle-files"),oe=c("settings-modal"),Xt=c("btn-close-settings"),Qt=c("btn-save-settings"),Zt=c("btn-cancel-settings"),je=c("api-key-input"),gn=c("model-select"),vn=c("theme-select"),bn=c("font-size-input"),yn=c("max-tool-steps-input"),X=c("name-modal"),ea=c("name-modal-title"),te=c("app-name-input"),fe=c("btn-confirm-name"),na=c("btn-cancel-name"),ta=c("btn-close-name-modal"),re=c("project-settings-modal"),z=c("project-name-input"),aa=c("btn-save-project-settings"),sa=c("btn-delete-project"),ia=c("btn-close-project-settings"),oa=c("btn-close-project-settings-x"),le=c("share-modal"),ra=c("btn-close-share"),la=c("btn-close-share-2"),Le=c("btn-share-link"),ca=c("btn-share-download"),H=c("share-link-status"),W=c("share-link-output"),ce=c("import-file"),de=c("agent-instructions-modal"),Te=c("agent-instructions-text"),da=c("btn-close-agent-instructions"),pa=c("btn-close-agent-instructions-2"),ua=c("btn-copy-agent-instructions"),wn="asljs-app-builder-settings",En="light",Ie=14,An="__new__",Sn="__import__",Ce="#I!",ma=2e3,xn="https://alexandritesoftware.github.io/asljs/app-builder";function M(){try{const e=localStorage.getItem(wn)??"{}";return JSON.parse(e)}catch{return{}}}function Re(e){localStorage.setItem(wn,JSON.stringify(e))}function he(){return M().apiKey??""}function kn(){const e=M().model;return e==="gpt-5.3-codex"||e==="gpt-5.4"?e:lt}function jn(){const e=M().maxToolSteps;if(!Number.isFinite(e))return V;const n=Math.floor(e);return n<1?V:n}function Ln(){return M().theme==="light"?"light":En}function Tn(){const e=M().fontSize;if(!Number.isFinite(e))return Ie;const n=Math.floor(e);return n<12||n>20?Ie:n}function In(){document.body.dataset.theme=Ln(),document.documentElement.style.fontSize=`${Tn()}px`}function Cn(e){if(typeof e!="string")return null;const n=e.trim();return n===""?null:n}function q(){return crypto.randomUUID()}async function fa(e){const n=new Set,t=[];for(const a of e){let s=Cn(a.uuid);if((s===null||n.has(s))&&(s=q()),n.add(s),a.uuid===s){t.push(a);continue}const i={...a,uuid:s,updatedAt:a.updatedAt??x()};await N(i),t.push(i)}return t}function _e(){return r.apps.find(e=>e.id===r.currentAppId)}async function ha(e){await N(e),r.apps=r.apps.map(n=>n.id===e.id?e:n)}async function Pe(){const e=_e();if(e===void 0)return;const n={...e,uuid:q(),updatedAt:x()};await ha(n)}const C=et({getCurrentAppId:()=>r.currentAppId,getFiles:()=>r.files,setFiles:e=>{r.files=e},getActiveFileName:()=>r.activeFileName,setActiveFileName:e=>{r.activeFileName=e},createFileId:B,saveFile:async e=>{await sn(e),await Pe()},deleteFileById:async e=>{await Xn(e),await Pe()},runApp:Z,evaluateInApp:e=>At(ae,e),getAppDiagnostics:()=>St(ae),wait:e=>new Promise(n=>{window.setTimeout(n,e)})});function pe(){It({selectElement:Se,apps:r.apps,currentAppId:r.currentAppId,newActionValue:An,importActionValue:Sn})}function Pn(){Mt.classList.remove("hidden");const e=r.currentAppId!==null&&r.apps.some(n=>n.id===r.currentAppId);if(Rt.classList.toggle("hidden",e),Y.classList.toggle("hidden",!e),!e){De.value=he(),K.value="";return}Be(),Ue()}async function Fn(){const e=K.value.trim();if(e===""){K.focus();return}const n=De.value.trim();if(n!==""){const a=M();a.apiKey=n,Re(a)}const t={id:B(),uuid:q(),name:e,createdAt:x(),updatedAt:x()};await N(t),r.apps=[...r.apps,t],await U(t.id)}async function ga(){const e=K.value.trim(),n=e===""?"TODO Sample":e,t=De.value.trim();if(t!==""){const o=M();o.apiKey=t,Re(o)}const a=B(),s={id:a,uuid:q(),name:n,createdAt:x(),updatedAt:x()},i=Nt(a,B);await N(s),await on(a,i),r.apps=[...r.apps,s],await U(a)}function Be(){Ct({selectElement:xe,files:r.files,activeFileName:r.activeFileName})}function Ue(){Pt({textAreaElement:Ne,files:r.files,activeFileName:r.activeFileName})}function Ye(e){r.generating=e,Ft(hn,e)}function we(e,n){Ot(Jt,e,n)}function R(e,n){Dt(Me,e,n)}async function ge(){if(r.activeFileName===null||r.currentAppId===null)return;const e=r.files.find(t=>t.name===r.activeFileName);if(e===void 0)return;const n=Ne.value;e.content!==n&&(e.content=n,await sn(e),await Pe())}async function U(e){var t;r.currentAppId=e;const n=await Yn(e);r.files=n,r.activeFileName=((t=n[0])==null?void 0:t.name)??null,Me.replaceChildren()}function On(){ea.textContent="New App",te.value="",X.classList.remove("hidden"),te.focus(),fe.onclick=async()=>{const e=te.value.trim();if(e==="")return;X.classList.add("hidden");const n={id:B(),uuid:q(),name:e,createdAt:x(),updatedAt:x()};await N(n),r.apps=[...r.apps,n],await U(n.id)}}function $e(){X.classList.add("hidden"),fe.onclick=null}function va(){const e=r.apps.find(n=>n.id===r.currentAppId);e!==void 0&&(z.value=e.name,re.classList.remove("hidden"),z.focus(),z.select())}function Q(){re.classList.add("hidden")}async function Dn(){const e=r.apps.find(a=>a.id===r.currentAppId);if(e===void 0)return;const n=z.value.trim();if(n===""){z.focus();return}const t={...e,name:n,updatedAt:x()};await N(t),r.apps=r.apps.map(a=>a.id===e.id?t:a),Q()}async function ba(){Q(),await ya()}async function ya(){const e=r.apps.find(n=>n.id===r.currentAppId);e!==void 0&&confirm(`Delete "${e.name}"? This cannot be undone.`)&&(await Vn(e.id),r.apps=r.apps.filter(n=>n.id!==e.id),r.currentAppId=null,r.files=[],r.activeFileName=null,Me.replaceChildren(),ae.src="about:blank")}async function Nn(){const e=ke.value.trim();if(e==="")return;const n=he();if(n===""){R("assistant","No OpenAI API key set. Open Settings (⚙) to add your key. Generation is optional — you can also create files manually.");return}if(r.currentAppId===null){R("assistant","Please create or open an app first.");return}ke.value="",R("user",e),Ye(!0),we("Starting generation...",!0);try{const t=kn(),a=jn(),s=await ut(e,n,t,C,{initialToolStepLimit:a,systemPrompt:cn,onToolStepLimit:async({stepsCompleted:o})=>confirm(`AI reached ${o} tool steps without finishing. Continue for 12 more steps?`),onProgress:o=>{we(o,!0)}}),i=r.apps.find(o=>o.id===r.currentAppId);if(i!==void 0){const o={...i,updatedAt:x()};await N(o),r.apps=r.apps.map(h=>h.id===i.id?o:h)}R("assistant",s.summary),Z()}catch(t){const a=t instanceof Error?t.message:String(t);R("assistant",`Error: ${a}`)}finally{we("",!1),Ye(!1)}}function Z(){ge().then(()=>{Et(ae,r.files,{hostOpenAiApiKey:he()})})}async function Mn(){await ge();const e=_e();if(e===void 0)throw new Error("No app selected.");return{app:e,files:[...r.files],exportedAt:x()}}function wa(e){const n=new Blob([JSON.stringify(e,null,2)],{type:"application/json"}),t=URL.createObjectURL(n),a=document.createElement("a");a.href=t,a.download=`${e.app.name.replace(/\s+/g,"-")}.json`,a.click(),URL.revokeObjectURL(t)}function Rn(){return confirm(`Security warning: You are about to import an application.

Although apps run in an isolated browser context, imported code can still be harmful. Be vigilant and only open apps from sources you trust.

Do you want to continue?`)}function Xe(e){const n=e==="run";Y.classList.toggle("chat-collapsed",n),Y.classList.toggle("files-collapsed",n),se.textContent=n?"Chat ▸":"Chat ▾",ie.textContent=n?"Files ▸":"Files ▾",se.setAttribute("aria-expanded",String(!n)),ie.setAttribute("aria-expanded",String(!n))}function Ea(){return confirm(`Import link opened.

Press OK to edit the app (chat/files open, app not auto-run).
Press Cancel to run the app (chat/files hidden).`)?"edit":"run"}function _n(){Rn()&&(ce.value="",ce.click())}function Aa(e){if(e.app===void 0||typeof e.app.name!="string"||!Array.isArray(e.files))throw new Error("Invalid app JSON format.")}async function Bn(e,n){Aa(e);const t=Cn(e.app.uuid)??q(),a=r.apps.find(h=>h.uuid===t);if(a!==void 0)return n.navigateToExistingByUuid?(await U(a.id),a.id):(n.showDuplicateAlert&&alert("Import stopped: an app with the same UUID already exists."),null);const s=B(),i={id:s,uuid:t,name:e.app.name,createdAt:e.app.createdAt??x(),updatedAt:e.app.updatedAt??x()},o=e.files.filter(h=>typeof h.name=="string"&&typeof h.content=="string").map(h=>({id:B(),appId:s,name:h.name,content:h.content}));return await N(i),await on(s,o),r.apps=[...r.apps,i],await U(s),s}async function Sa(){var n;const e=(n=ce.files)==null?void 0:n[0];if(e!==void 0)try{const t=await e.text(),a=JSON.parse(t);await Bn(a,{navigateToExistingByUuid:!1,showDuplicateAlert:!0})}catch(t){const a=t instanceof Error?t.message:String(t);alert(`Import failed: ${a}`)}}function xa(e){let n="";for(let a=0;a<e.length;a+=32768){const s=e.subarray(a,a+32768);n+=String.fromCharCode(...s)}return btoa(n)}function ka(e){const n=atob(e),t=new Uint8Array(n.length);for(let a=0;a<n.length;a++)t[a]=n.charCodeAt(a);return t}async function ja(e){const n=window.CompressionStream;if(n===void 0)throw new Error("Link sharing is not supported in this browser. Use Download export instead.");const t=new n("gzip"),a=t.writable.getWriter(),s=new TextEncoder().encode(e);return await a.write(s),await a.close(),new Uint8Array(await new Response(t.readable).arrayBuffer())}async function La(e){const n=window.DecompressionStream;if(n===void 0)throw new Error("Cannot import from shared link in this browser.");const t=new n("gzip"),a=t.writable.getWriter();return await a.write(e),await a.close(),new TextDecoder().decode(await new Response(t.readable).arrayBuffer())}async function Ta(e){const n=JSON.stringify(e),t=await ja(n),a=encodeURIComponent(xa(t));return`${xn}${Ce}${a}`}async function Ia(e){const n=decodeURIComponent(e),t=ka(n),a=await La(t);return JSON.parse(a)}function Ca(){return window.location.hash.startsWith(Ce)?window.location.hash.slice(Ce.length):null}function Qe(){if(window.location.origin==="https://alexandritesoftware.github.io"){window.location.replace(xn);return}window.history.replaceState(null,"",window.location.pathname)}async function Pa(){const e=Ca();if(e===null||e.trim()==="")return!1;if(!Rn())return Qe(),!0;try{const n=await Ia(e);await Bn(n,{navigateToExistingByUuid:!0,showDuplicateAlert:!1})!==null&&(Ea()==="run"?(Xe("run"),Z()):Xe("edit"))}catch(n){const t=n instanceof Error?n.message:String(n);alert(`Could not import from share link: ${t}`)}return Qe(),!0}async function Fa(){W.value="",Le.disabled=!0,H.textContent="Preparing share link...";try{const e=await Mn(),n=await Ta(e);if(n.length>ma){H.textContent="Link sharing is unavailable because URL length exceeds 2000 characters. Use Download export and import the file instead.";return}W.value=n,H.textContent="Link is ready. Use Share with link to copy it.",Le.disabled=!1}catch(e){const n=e instanceof Error?e.message:String(e);H.textContent=n}}function Oa(){_e()!==void 0&&(le.classList.remove("hidden"),Fa())}function Je(){le.classList.add("hidden")}async function Da(){if(W.value.trim()!=="")try{await navigator.clipboard.writeText(W.value),H.textContent="Share link copied to clipboard."}catch{W.focus(),W.select(),H.textContent="Could not copy automatically. Link is selected, copy it manually."}}async function Na(){const e=await Mn();wa(e)}function Ma(){je.value=he(),gn.value=kn(),vn.value=Ln(),bn.value=String(Tn()),yn.value=String(jn()),oe.classList.remove("hidden"),je.focus()}function ve(){oe.classList.add("hidden")}function Ra(){const e=M();e.apiKey=je.value.trim(),e.model=gn.value==="gpt-5.4"?"gpt-5.4":"gpt-5.3-codex",e.theme=vn.value==="light"?"light":En;const n=Number.parseInt(bn.value,10);e.fontSize=Number.isFinite(n)&&n>=12&&n<=20?n:Ie;const t=Number.parseInt(yn.value,10);e.maxToolSteps=Number.isFinite(t)&&t>=1?t:V,Re(e),In(),ve()}function _a(){Te.value=cn,de.classList.remove("hidden"),Te.scrollTop=0}function He(){de.classList.add("hidden")}function Ba(){fn({panelElement:Ut,toggleButtonElement:se,panelsElement:Y,collapsedPanelsClass:"chat-collapsed",expandedLabel:"Chat ▾",collapsedLabel:"Chat ▸"})}function Ua(){fn({panelElement:$t,toggleButtonElement:ie,panelsElement:Y,collapsedPanelsClass:"files-collapsed",expandedLabel:"Files ▾",collapsedLabel:"Files ▸"})}async function $a(){const e=Te.value;try{await navigator.clipboard.writeText(e),R("assistant","Agent instructions copied to clipboard.")}catch{R("assistant","Could not copy to clipboard automatically. You can still select and copy from the instructions modal.")}}r.on("set:apps",()=>pe());r.on("set:currentAppId",()=>{pe(),Pn()});r.on("set:files",()=>{Be(),Ue()});r.on("set:activeFileName",()=>{Be(),Ue()});zt.addEventListener("click",On);Kt.addEventListener("click",_n);qt.addEventListener("click",va);Gt.addEventListener("click",()=>{Oa()});hn.addEventListener("click",()=>{Nn()});Ht.addEventListener("click",Z);Wt.addEventListener("click",Z);Vt.addEventListener("click",Ma);Yt.addEventListener("click",_a);se.addEventListener("click",Ba);ie.addEventListener("click",Ua);Xt.addEventListener("click",ve);Qt.addEventListener("click",Ra);Zt.addEventListener("click",ve);oe.addEventListener("click",e=>{e.target===oe&&ve()});da.addEventListener("click",He);pa.addEventListener("click",He);ua.addEventListener("click",()=>{$a()});de.addEventListener("click",e=>{e.target===de&&He()});ra.addEventListener("click",Je);la.addEventListener("click",Je);Le.addEventListener("click",()=>{Da()});ca.addEventListener("click",()=>{Na()});le.addEventListener("click",e=>{e.target===le&&Je()});fe.addEventListener("click",()=>{});na.addEventListener("click",$e);ta.addEventListener("click",$e);X.addEventListener("click",e=>{e.target===X&&$e()});aa.addEventListener("click",()=>{Dn()});sa.addEventListener("click",()=>{ba()});ia.addEventListener("click",Q);oa.addEventListener("click",Q);re.addEventListener("click",e=>{e.target===re&&Q()});te.addEventListener("keydown",e=>{e.key==="Enter"&&fe.click()});z.addEventListener("keydown",e=>{e.key==="Enter"&&(e.preventDefault(),Dn())});_t.addEventListener("click",()=>{Fn()});Bt.addEventListener("click",()=>{ga()});K.addEventListener("keydown",e=>{e.key==="Enter"&&(e.preventDefault(),Fn())});ke.addEventListener("keydown",e=>{e.key==="Enter"&&!e.shiftKey&&(e.preventDefault(),Nn())});Se.addEventListener("change",()=>{const e=Se.value;if(e===An){On(),pe();return}if(e===Sn){_n(),pe();return}e!==""&&e!==r.currentAppId&&U(e)});xe.addEventListener("change",()=>{const e=xe.value;e===""||e===r.activeFileName||(ge(),r.activeFileName=e)});Ne.addEventListener("blur",()=>{ge()});ce.addEventListener("change",()=>{Sa()});window.listFileset=C.listFileset;window.readFile=C.readFile;window.setFileContent=C.setFileContent;window.replaceFilePart=C.replaceFilePart;window.deleteFile=C.deleteFile;window.evalInApp=C.evalInApp;window.getAppDiagnostics=C.getAppDiagnostics;window.runAppAndCollectDiagnostics=C.runAppAndCollectDiagnostics;async function Ja(){In();const e=await fa(await Gn());if(r.apps=e,!await Pa())if(e.length>0){const t=[...e].sort((a,s)=>s.updatedAt.localeCompare(a.updatedAt));await U(t[0].id)}else r.currentAppId=null,r.files=[],r.activeFileName=null,Pn(),K.focus()}Ja().catch(e=>{console.error("App Builder init failed:",e)});
