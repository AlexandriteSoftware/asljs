(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))l(o);new MutationObserver(o=>{for(const b of o)if(b.type==="childList")for(const y of b.addedNodes)y.tagName==="LINK"&&y.rel==="modulepreload"&&l(y)}).observe(document,{childList:!0,subtree:!0});function s(o){const b={};return o.integrity&&(b.integrity=o.integrity),o.referrerPolicy&&(b.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?b.credentials="include":o.crossOrigin==="anonymous"?b.credentials="omit":b.credentials="same-origin",b}function l(o){if(o.ep)return;o.ep=!0;const b=s(o);fetch(o.href,b)}})();class fs extends Error{constructor(n,s,l,o,b){super(n),this.name="ListenerError",this.error=s,this.object=l,this.event=o,this.listener=b}}function Ze(e){if(typeof e!="string"&&typeof e!="symbol")throw new TypeError("Expect event to be a string or symbol.")}function $n(e){return typeof e=="function"}function Ct(e){if($n(e))return e}function zt(e){return typeof e=="object"&&e!==null}function Jn(e){if(!$n(e))throw new TypeError("Expect a function.")}const ms=(e=Object.create(null),n={})=>{if(!zt(e)&&!$n(e))throw new TypeError("Expect an object or a function.");for(const G of["on","once","off","emit","emitAsync","has"])if(G in e)throw new Error(`Method "${G}" already exists.`);const{strict:s=!1,trace:l=null,error:o=null}=n,b=Ct(l)??null,y=Ct(o)??null,ee=e!==qe,ce=(G,B)=>{b==null||b(G,B),ee&&qe.emit(G,B)};ce("new",{object:e});const q=new Set,H=new Map,X={enumerable:!1,configurable:!0,writable:!0};return Object.defineProperties(e,{on:Object.assign({value:ie},X),once:Object.assign({value:oe},X),off:Object.assign({value:le},X),emit:Object.assign({value:ve},X),emitAsync:Object.assign({value:fe},X),has:Object.assign({value:ye},X)}),e;function D(G,B){let Q=H.get(G);Q||H.set(G,Q=new Set),Q.add(B)}function K(G,B){const Q=H.get(G);if(!Q)return!1;const me=Q.delete(B);return Q.size===0&&H.delete(G),me}function V(G,B,Q){const me={error:Q,object:e,event:G,listener:B};if(y==null||y(me),e===qe&&G==="error")throw new fs("Error in a global error listener.",Q,e,G,B);qe.emit("error",me)}function ie(G,B){Ze(G),Jn(B),ce("on",{object:e,event:G,listener:B}),D(G,B);let Q=!0;return()=>Q?(Q=!1,K(G,B)):!1}function oe(G,B){Ze(G),Jn(B);const Q=ie(G,(...me)=>{Q(),B(...me)});return Q}function le(G,B){return Ze(G),Jn(B),ce("off",{object:e,event:G,listener:B}),K(G,B)}function ye(G){var B;return Ze(G),(((B=H.get(G))==null?void 0:B.size)??0)>0}function ve(G,...B){Ze(G);const Q=H.get(G)||q;if(ce("emit",{object:e,listeners:[...Q],event:G,args:B}),Q.size!==0)for(const me of Q)try{me(...B)}catch(be){if(V(G,me,be),s)throw be}}async function fe(G,...B){Ze(G);const Q=H.get(G)||q;if(ce("emitAsync",{object:e,listeners:[...Q],event:G,args:B}),Q.size===0)return;const me=[...Q].map(async be=>{try{await be(...B)}catch(ze){if(V(G,be,ze),s)throw ze}});await(s?Promise.all(me):Promise.allSettled(me))}},qe=ms;qe(qe);function hs(e){return!zt(e)&&!$n(e)?!1:typeof e.on=="function"}function Ht(e){if(hs(e))return e}function Pe(e){return typeof e=="function"}function ct(e){return typeof e=="object"&&e!==null}function Vt(e){if(!Pe(e))throw new TypeError("Expect a function.")}function Zn(e){if(e.trim()==="")throw new TypeError("Expect watch path to be a non-empty string.");const n=e.split(".");for(const s of n)if(s.trim()==="")throw new TypeError("Expect watch path segments to be non-empty.");return e.split(".").map(s=>s.trim()).filter(s=>s!=="")}function gs(e,n){const s=Zn(n);if(s.length===0)return;let l=e;for(const o of s){if(!ct(l)||!(o in l))return;l=l[o]}return l}const Jt=(e,n,s)=>{if(Array.isArray(e))throw new TypeError("Watching arrays is not supported.");Vt(s);const l=typeof n=="string"?[n]:n;if(!Array.isArray(l))throw new TypeError("Expect properties to be a string or an array of strings.");for(const y of l){if(typeof y!="string")throw new TypeError("Expect properties to be a string or an array of strings.");Zn(y)}const o=()=>l.map(y=>gs(e,y)),b=[];for(const y of l){const ee=Zn(y);let ce=null;const q=()=>{const H=[],X=(D,K)=>{if(!ct(D)||K>=ee.length)return;const V=ee[K],ie=Ht(D);if(ie){const oe=ie.on(`set:${V}`,()=>{s(...o()),K<ee.length-1&&ce&&(ce(),ce=q())});H.push(oe)}K<ee.length-1&&X(D[V],K+1)};return X(e,0),()=>H.reduce((D,K)=>K()||D,!1)};ce=q(),b.push(()=>ce?ce():!1)}return s(...o()),()=>b.reduce((y,ee)=>ee()||y,!1)};function vs(e,n){"watch"in e||Object.defineProperty(e,"watch",{configurable:!0,writable:!0,enumerable:!1,value(s,l){return n(typeof s=="string"?this:this,s,l)}})}function Lt(e,n){return Object.prototype.hasOwnProperty.call(e,n)}function Gn(e){if(typeof e=="symbol")return!1;const n=typeof e=="number"?e:Number(e);return!Number.isInteger(n)||n<0||n>=4294967295?!1:typeof e=="number"||e===String(n)}function bs(e){return Ht(e)?Pe(e.emit):!1}const Gt=(e,n={})=>{const{eventful:s=qe,trace:l=null,shallow:o=!1}=n;Vt(s);const b=Un.options,y=new WeakMap,ee=D=>{if(o||!ct(D)||bs(D))return D;if(y.has(D))return y.get(D);const K=Gt(D,{eventful:s,trace:l,shallow:o});return y.set(D,K),K},ce=D=>{if(!o){if(Array.isArray(D)){for(let K=0;K<D.length;K++)D[K]=ee(D[K]);return}for(const K of Reflect.ownKeys(D))Lt(D,K)&&(D[K]=ee(D[K]))}},q=D=>{const K=Array.isArray(D);ce(D),vs(D,Jt);let V;const ie=new Proxy(D,{set(oe,le,ye,ve){const fe=K&&Gn(le),G=Reflect.get(oe,le,ve),B=Reflect.set(oe,le,ee(ye),ve);if(V&&B){const Q=Reflect.get(oe,le,ve);if(!Object.is(G,Q)){const me=fe?{index:Number(le),value:Q,previous:G}:{property:le,value:Q,previous:G},be=l||b.trace;V.emit(`set:${String(le)}`,me),Pe(be)&&be(V,"set",me),V.emit("set",me)}}return B},deleteProperty(oe,le){const ye=K&&Gn(le),ve=Lt(oe,le),fe=ve?oe[le]:void 0,G=Reflect.deleteProperty(oe,le);if(V&&G&&ve){const B=ye?{index:Number(le),previous:fe}:{property:le,previous:fe},Q=l||b.trace;V.emit(`delete:${String(le)}`,B),Pe(Q)&&Q(V,"delete",B),V.emit("delete",B)}return G},defineProperty(oe,le,ye){const ve=Object.getOwnPropertyDescriptor(oe,le)??null,fe=Object.prototype.hasOwnProperty.call(ye,"value")?{...ye,value:ee(ye.value)}:ye,G=Reflect.defineProperty(oe,le,fe),B=K&&(le==="length"||Gn(le));if(V&&!B&&G){const Q={property:le,descriptor:fe,previous:ve},me=l||b.trace;V.emit(`define:${String(le)}`,Q),Pe(me)&&me(V,"define",Q),V.emit("define",Q)}return G}});return V=Pe(D==null?void 0:D.emit)?ie:s(ie),V},H=l||b.trace;if(Array.isArray(e)){const D=q(e);return Pe(H)&&H(D,"new"),D}if(e!==null&&typeof e=="object"){const D=q(e);return Pe(H)&&H(D,"new",{object:D}),D}const X=s({get value(){return e},set value(D){if(Object.is(D,e))return;const K=e;e=D;const V={property:"value",value:e,previous:K};X.emit("set:value",V),Pe(H)&&H(X,"set",V),X.emit("set",V)}});return Pe(H)&&H(X,"new",{object:X}),X},Un=Gt;Un.options={trace:null};Un.watch=Jt;const N=Un({apps:[],currentAppId:null,files:[],activeFileName:null,generating:!1,error:null});function Te(e){return new Promise((n,s)=>{e.addEventListener("success",()=>{n(e.result)}),e.addEventListener("error",()=>{s(e.error??new Error("IndexedDB request failed"))})})}function ys(e,n){return new Promise((s,l)=>{const o=indexedDB.open(e,n.length);o.addEventListener("upgradeneeded",b=>{const y=n.slice(b.oldVersion-1,b.newVersion??n.length-1);for(const ee of y)ee(o.result)}),o.addEventListener("success",()=>{s(o.result)}),o.addEventListener("blocked",()=>{l(new Error("Database opening is blocked"))}),o.addEventListener("error",()=>{l(o.error??new Error("Failed to open database"))})})}const ws="asljs-app-builder";let xn=null;async function Ye(){return xn!==null||(xn=await ys(ws,[e=>{e.createObjectStore("apps",{keyPath:"id"}),e.createObjectStore("files",{keyPath:"id"}).createIndex("byAppId","appId",{unique:!1})}])),xn}async function xs(){const n=(await Ye()).transaction("apps","readonly");return Te(n.objectStore("apps").getAll())}async function Be(e){const s=(await Ye()).transaction("apps","readwrite");await Te(s.objectStore("apps").put(e))}async function Es(e){const s=(await Ye()).transaction(["apps","files"],"readwrite");await Te(s.objectStore("apps").delete(e));const l=s.objectStore("files"),o=await Te(l.index("byAppId").getAllKeys(e));for(const b of o)await Te(l.delete(b))}async function Ss(e){const s=(await Ye()).transaction("files","readonly");return Te(s.objectStore("files").index("byAppId").getAll(e))}async function qt(e){const s=(await Ye()).transaction("files","readwrite");await Te(s.objectStore("files").put(e))}async function As(e){const s=(await Ye()).transaction("files","readwrite");await Te(s.objectStore("files").delete(e))}async function Kt(e,n){const o=(await Ye()).transaction("files","readwrite").objectStore("files"),b=await Te(o.index("byAppId").getAllKeys(e));for(const y of b)await Te(o.delete(y));for(const y of n)await Te(o.put(y))}function Me(e,n,s,l){return{name:e,type:"function",description:n,parameters:{type:"object",properties:s||{},required:l||[],additionalProperties:!1},strict:!0}}const ks=[Me("listFileset","List all file paths in the virtual filesystem."),Me("readFile","Read the full text content of a file.",{path:{type:"string"}},["path"]),Me("setFileContent","Create or fully replace file content.",{path:{type:"string"},content:{type:"string"}},["path","content"]),Me("replaceFilePart","Replace part of a file by exact search string.",{path:{type:"string"},search:{type:"string"},replacement:{type:"string"},replaceAll:{type:"boolean"}},["path","search","replacement","replaceAll"]),Me("deleteFile","Delete a file from the virtual filesystem.",{path:{type:"string"}},["path"]),Me("evalInApp","Evaluate JavaScript in the running app document context.",{code:{type:"string"}},["code"]),Me("getAppDiagnostics","Get current runtime logs and errors from the running app."),Me("runAppAndCollectDiagnostics","Run the app and collect runtime logs and errors after startup.")],Ts=350;function js(e){async function n(){return[...e.getFiles()].map(q=>q.name).sort((q,H)=>q.localeCompare(H))}async function s(q){const H=En(e,q),X=H===null?void 0:e.getFiles().find(D=>D.name===H);if(X===void 0)throw new Error(`File not found: ${q}`);return X.content}async function l(q,H){const X=Is(e),D=et(q),K=En(e,D),V=e.getFiles().find(oe=>oe.name===(K??D));if(V!==void 0){const oe={...V,content:H};await e.saveFile(oe),e.setFiles(e.getFiles().map(le=>le.id===oe.id?oe:le)),e.setActiveFileName(oe.name);return}const ie={id:e.createFileId(),appId:X,name:D,content:H};await e.saveFile(ie),e.setFiles([...e.getFiles(),ie]),e.setActiveFileName(ie.name)}async function o(q){var K;const H=En(e,q),X=H===null?void 0:e.getFiles().find(V=>V.name===H);if(X===void 0)return;await e.deleteFileById(X.id);const D=e.getFiles().filter(V=>V.id!==X.id);e.setFiles(D),e.getActiveFileName()===q&&e.setActiveFileName(((K=D[0])==null?void 0:K.name)??null)}async function b(q,H,X,D=!1){if(H==="")throw new Error("Search text cannot be empty.");const K=En(e,q);if(K===null)throw new Error(`File not found: ${q}`);const V=await s(K);if(!V.includes(H))throw new Error(`Search text not found in ${K}.`);let ie=V;if(D)ie=V.split(H).join(X);else{const oe=V.indexOf(H);if(V.indexOf(H,oe+H.length)!==-1)throw new Error("Search text is ambiguous. Use replaceAll=true or provide a more specific search block.");ie=V.slice(0,oe)+X+V.slice(oe+H.length)}await l(K,ie)}async function y(q){if(e.getFiles().length===0)throw new Error("No files available to run.");e.runApp();try{return await e.evaluateInApp(q)}catch{return e.runApp(),e.evaluateInApp(q)}}async function ee(){return e.getAppDiagnostics()}async function ce(){return e.runApp(),await e.wait(e.diagnosticsDelayMs??Ts),e.getAppDiagnostics()}return{listFileset:n,readFile:s,setFileContent:l,deleteFile:o,replaceFilePart:b,evalInApp:y,getAppDiagnostics:ee,runAppAndCollectDiagnostics:ce}}function Is(e){const n=e.getCurrentAppId();if(n===null)throw new Error("No active app. Create or open an app first.");return n}function et(e){const n=e.trim().replace(/\\/g,"/").replace(/^\.\//,"").replace(/^\/+/,"");if(n==="")throw new Error("Path cannot be empty.");if(n.includes(".."))throw new Error("Parent path segments are not allowed.");return n}function En(e,n){const s=et(n),l=e.getFiles().find(o=>et(o.name).toLowerCase()===s.toLowerCase());return(l==null?void 0:l.name)??null}function Ps(e){return typeof e!="object"||e===null?!1:e.type==="function_call"}function Yt(e){if(typeof e.name!="string"||e.name.trim()==="")throw new Error("Tool call missing function name.");return e.name}function _s(e){if(typeof e.call_id!="string"||e.call_id.trim()==="")throw new Error("Tool call missing call_id.");return e.call_id}async function Cs(e,n){const s=Yt(e),l=Ls(e.arguments);try{switch(s){case"listFileset":{const o=await n.listFileset();return Ue(o)}case"readFile":{const o=await n.readFile($e(l,"path"));return Ue(o)}case"setFileContent":return await n.setFileContent($e(l,"path"),$e(l,"content")),Ue("ok");case"replaceFilePart":return await n.replaceFilePart($e(l,"path"),$e(l,"search"),$e(l,"replacement"),Os(l,"replaceAll",!1)),Ue("ok");case"deleteFile":return await n.deleteFile($e(l,"path")),Ue("ok");case"evalInApp":{const o=await n.evalInApp($e(l,"code"));return Ue(o)}case"getAppDiagnostics":{const o=await n.getAppDiagnostics();return Ue(o)}case"runAppAndCollectDiagnostics":{const o=await n.runAppAndCollectDiagnostics();return Ue(o)}default:return Ot(`Unknown tool: ${s}`)}}catch(o){return Ot(o instanceof Error?o.message:String(o))}}function Ls(e){if(e===void 0)return{};if(typeof e=="object"&&e!==null)return e;if(typeof e!="string")throw new Error("Invalid tool arguments value.");try{const n=JSON.parse(e);if(typeof n!="object"||n===null)throw new Error("Tool arguments must be a JSON object.");return n}catch{throw new Error("Invalid tool arguments JSON.")}}function $e(e,n){const s=e[n];if(typeof s!="string")throw new Error(`Tool argument "${n}" must be a string.`);return s}function Os(e,n,s){const l=e[n];if(l===void 0)return s;if(typeof l!="boolean")throw new Error(`Tool argument "${n}" must be a boolean.`);return l}function Ue(e){return Xt({ok:!0,value:e})}function Ot(e){return Xt({ok:!1,error:e})}function Xt(e){try{return JSON.stringify(e)}catch{return'{"ok":false,"error":"Failed to serialize tool result."}'}}const Ds="https://api.openai.com/v1/responses",Fs="gpt-5.3-codex",dn=20,Ns="You are an expert ASLJS app generator.",Rs=12,Ms={createResponse:async e=>{const n=await fetch(Ds,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${e.apiKey}`},body:JSON.stringify({model:e.model,instructions:e.instructions,temperature:e.temperature,previous_response_id:e.previous_response_id,input:e.input,tools:e.tools})});if(!n.ok){const s=await n.json().catch(()=>({})),l=Bs(s)??`OpenAI API error: ${n.status}`;throw new Error(l)}return n.json()}};async function $s(e,n,s,l,o){var X;const b=(o==null?void 0:o.transport)??Ms,y=(o==null?void 0:o.systemPrompt)??Ns;let ee,ce=e,q=Us(o==null?void 0:o.initialToolStepLimit),H=0;for(;;){if(await cn(o,`Step ${H+1}: requesting assistant response...`),H>=q){if(!(await((X=o==null?void 0:o.onToolStepLimit)==null?void 0:X.call(o,{stepsCompleted:H,stepLimit:q}))??!1))throw new Error("AI exceeded maximum tool steps without completing.");q+=Rs,await cn(o,`Extended step limit to ${q}. Continuing...`)}const D=await b.createResponse({apiKey:n,model:s,instructions:y,temperature:.1,previous_response_id:ee,input:ce,tools:ks});if(!Array.isArray(D.output))throw new Error("AI returned an unexpected response format.");const K=D.output.filter(Ps);if(K.length===0){await cn(o,`Completed in ${H+1} step(s). Finalizing summary...`);const ie=Ws(D);return{summary:ie===""?"Completed tool-based update.":ie}}const V=[];for(const ie of K){await cn(o,`Step ${H+1}: running ${Yt(ie)}...`);const oe=await Cs(ie,l);V.push({type:"function_call_output",call_id:_s(ie),output:oe})}await cn(o,`Step ${H+1}: submitted ${V.length} tool result(s).`),ee=typeof D.id=="string"?D.id:ee,ce=V,H+=1}}function Us(e){if(!Number.isFinite(e))return dn;const n=Math.floor(e);return n>=1?n:dn}async function cn(e,n){(e==null?void 0:e.onProgress)!==void 0&&await Promise.resolve(e.onProgress(n))}function Bs(e){const n=e.error;return typeof(n==null?void 0:n.message)=="string"?n.message:null}function Ws(e){return typeof e.output_text=="string"&&e.output_text.trim()!==""?e.output_text.trim():Array.isArray(e.output)?e.output.filter(s=>s.type==="message").flatMap(s=>s.content??[]).map(s=>s.text??"").map(s=>s.trim()).filter(s=>s!=="").join(`
`):""}const zs=`# observable

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
`,Hs=`# eventful

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
`,Vs=`# data-binding

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
`,Js=`# AI

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
`,Gs=`# dali

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
`,Qt=`
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

${Hs}

[observable] guide:

${zs}

[data-binding] guide:

${Vs}

[components] guide:

${Js}

[dali] guide:

${Gs}
`,dt="asljs-app-builder:eval-request",Zt="asljs-app-builder:eval-response",er="asljs-app-builder:diagnostics-request",nr="asljs-app-builder:diagnostics-response",Dt=`<script>
(() => {
  const REQUEST = '${dt}';
  const RESPONSE = '${Zt}';
  const DIAG_REQUEST = '${er}';
  const DIAG_RESPONSE = '${nr}';
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
<\/script>`;function qs(e,n,s){if(n.length===0){e.removeAttribute("srcdoc"),e.src="about:blank";return}const l=n.find(y=>y.name==="index.html")??n.find(y=>y.name.endsWith(".html"))??null;if(l===null){e.removeAttribute("srcdoc"),e.src="about:blank";return}let o=l.content;const b=n.find(y=>y.name==="style.css")??n.find(y=>y.name.endsWith(".css"))??null;b!==null&&(o=o.replace(/<link[^>]+href=["']style\.css["'][^>]*>/gi,`<style>${b.content}</style>`),o=o.replace(/<link[^>]+href=["']([^"']+\.css)["'][^>]*>/gi,`<style>${b.content}</style>`));for(const y of n){if(!y.name.endsWith(".js"))continue;const ee=y.name.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");o=o.replace(new RegExp(`(<script[^>]*?)\\s+src=["']${ee}["']([^>]*)><\\/script>`,"gi"),(ce,q,H)=>{const X=`${String(q)} ${String(H)}`;return/type=["']module["']/i.test(X)?`<script type="module">${y.content}<\/script>`:`<script>${y.content}<\/script>`})}o=Qs(o,n),o=na(o,s),o=Xs(o),e.srcdoc=o}async function Ks(e,n){const s=await tr(e,dt,{code:n},Zt);if(s.ok===!0)return s.value;throw new Error(typeof s.error=="string"?s.error:"Unknown preview evaluation error.")}async function Ys(e){const n=await tr(e,er,{},nr);if(n.ok!==!0)throw new Error(typeof n.error=="string"?n.error:"Failed to read preview diagnostics.");return n.diagnostics??{logs:[],errors:[]}}async function tr(e,n,s,l){const o=e.contentWindow;if(o===null)throw new Error("Preview frame is not available.");const b=crypto.randomUUID();return new Promise((y,ee)=>{const ce=window.setTimeout(()=>{H(),ee(new Error("Timed out waiting for app evaluation result."))},5e3),q=X=>{if(X.source!==o)return;const D=X.data;D.type!==l||D.id!==b||(H(),y(D))};function H(){window.clearTimeout(ce),window.removeEventListener("message",q)}window.addEventListener("message",q),o.postMessage({type:n,id:b,...s},"*")})}function Xs(e){return e.includes(dt)?e:e.includes("</body>")?e.replace("</body>",`${Dt}</body>`):`${e}
${Dt}`}function Qs(e,n){if(/type=["']importmap["']/i.test(e))return e;const s=n.find(y=>y.name==="package.json")??null,l=Zs(s==null?void 0:s.content),o=Object.fromEntries(l.map(([y,ee])=>[y,`https://esm.sh/${y}@${ee}?bundle`]));if(Object.keys(o).length===0)return e;const b=`<script type="importmap">${JSON.stringify({imports:o})}<\/script>`;return/<head[^>]*>/i.test(e)?e.replace(/<head[^>]*>/i,y=>`${y}
${b}`):`${b}
${e}`}function Zs(e){if(e===void 0)return Ft();try{const n=JSON.parse(e),s={...n.dependencies??{},...n.devDependencies??{}};return["asljs-eventful","asljs-observable","asljs-data-binding","asljs-components","asljs-dali","openai"].map(b=>[b,ea(s[b])])}catch{return Ft()}}function ea(e){if(typeof e!="string"||e.trim()==="")return"latest";const n=e.trim().replace(/^[~^<>=\s]+/,"");return n===""?"latest":n}function Ft(){return[["asljs-eventful","latest"],["asljs-observable","latest"],["asljs-data-binding","latest"],["asljs-components","latest"],["asljs-dali","latest"],["openai","latest"]]}function na(e,n){if(e.includes("__ASLJS_APP_BUILDER_HOST__"))return e;const s=`<script>window.__ASLJS_APP_BUILDER_HOST__ = ${JSON.stringify({openAiApiKey:(n==null?void 0:n.hostOpenAiApiKey)===void 0||n.hostOpenAiApiKey.trim()===""?null:n.hostOpenAiApiKey})};<\/script>`;return e.includes("</head>")?e.replace("</head>",`${s}</head>`):e.includes("<body")?e.replace(/<body[^>]*>/i,l=>`${l}
${s}`):`${s}
${e}`}function ta(e){const n=e.selectElement;n.replaceChildren();const s=[...e.apps].sort((b,y)=>y.updatedAt.localeCompare(b.updatedAt));for(const b of s){const y=document.createElement("option");y.value=b.id,y.textContent=b.name,n.appendChild(y)}if(s.length>0){const b=document.createElement("option");b.value="__separator__",b.textContent="────────",b.disabled=!0,n.appendChild(b)}const l=document.createElement("option");l.value=e.newActionValue,l.textContent="New...",n.appendChild(l);const o=document.createElement("option");o.value=e.importActionValue,o.textContent="Import...",n.appendChild(o),e.currentAppId!==null&&(n.value=e.currentAppId)}function ra(e){const n=e.selectElement;if(n.replaceChildren(),e.files.length===0){const l=document.createElement("option");l.value="",l.textContent="No files",n.appendChild(l),n.value="",n.disabled=!0;return}for(const l of e.files){const o=document.createElement("option");o.value=l.name,o.textContent=l.name,n.appendChild(o)}const s=e.activeFileName??e.files[0].name;n.value=s,n.disabled=!1}function sa(e){const n=e.files.find(s=>s.name===e.activeFileName);e.textAreaElement.value=(n==null?void 0:n.content)??"",e.textAreaElement.disabled=n===void 0}function aa(e,n){e.disabled=n,e.innerHTML=n?'<span class="spinner"></span> Sending…':"Send"}function ia(e,n,s){e.textContent=n,e.classList.toggle("hidden",!s)}function oa(e,n,s){const l=document.createElement("div");l.className=`chat-msg ${n}`;const o=document.createElement("div");o.className="chat-msg-role",o.textContent=n==="user"?"You":"Assistant";const b=document.createElement("div");b.className="chat-bubble",b.textContent=s,l.appendChild(o),l.appendChild(b),e.appendChild(l),e.scrollTop=e.scrollHeight}function rr(e){const n=!e.panelElement.classList.contains("collapsed");return e.toggleButtonElement.textContent=n?e.collapsedLabel:e.expandedLabel,e.toggleButtonElement.setAttribute("aria-expanded",n?"false":"true"),e.panelElement.classList.toggle("collapsed",n),e.panelsElement.classList.toggle(e.collapsedPanelsClass,n),n}const la=`{
  "id": "5935ae06-fe33-4019-86ab-afa78151e96c",
  "name": "TODO Sample",
  "files": {
    "app.js": "const form = document.getElementById('todo-form');\\nconst input = document.getElementById('todo-input');\\nconst list = document.getElementById('todo-list');\\nconst doneList = document.getElementById('done-list');\\n\\nif (!(form instanceof HTMLFormElement)\\n    || !(input instanceof HTMLInputElement)\\n    || !(list instanceof HTMLUListElement)\\n    || !(doneList instanceof HTMLUListElement))\\n{\\n  throw new Error('Missing TODO app elements.');\\n}\\n\\nconst state = {\\n  todos: [],\\n  done: [],\\n};\\n\\nfunction uid() {\\n  return crypto.randomUUID();\\n}\\n\\nfunction render() {\\n  list.replaceChildren();\\n  doneList.replaceChildren();\\n\\n  for (const todo of state.todos) {\\n    const item = document.createElement('li');\\n    item.className = 'todo-item';\\n\\n    const main = document.createElement('div');\\n    main.className = 'todo-main';\\n\\n    const text = document.createElement('span');\\n    text.className = 'todo-text';\\n    text.textContent = todo.text;\\n\\n    const actions = document.createElement('div');\\n\\n    const checkButton = document.createElement('button');\\n    checkButton.type = 'button';\\n    checkButton.className = 'check-btn';\\n    checkButton.textContent = '✓';\\n    checkButton.title = 'Mark done';\\n    checkButton.addEventListener('click', () => {\\n      state.todos = state.todos.filter(entry => entry.id !== todo.id);\\n      state.done.unshift(todo);\\n      render();\\n    });\\n\\n    main.appendChild(checkButton);\\n    main.appendChild(text);\\n\\n    const bin = document.createElement('button');\\n    bin.type = 'button';\\n    bin.className = 'bin-btn';\\n    bin.textContent = '🗑';\\n    bin.title = 'Delete todo';\\n    bin.addEventListener('click', () => {\\n      state.todos = state.todos.filter(entry => entry.id !== todo.id);\\n      render();\\n    });\\n\\n    actions.appendChild(checkButton);\\n    actions.appendChild(bin);\\n\\n    item.appendChild(main);\\n    item.appendChild(actions);\\n    list.appendChild(item);\\n  }\\n\\n  for (const todo of state.done) {\\n    const item = document.createElement('li');\\n    item.className = 'todo-item done';\\n\\n    const main = document.createElement('div');\\n    main.className = 'todo-main';\\n\\n    const text = document.createElement('span');\\n    text.className = 'todo-text';\\n    text.textContent = todo.text;\\n\\n    main.appendChild(text);\\n\\n    const actions = document.createElement('div');\\n\\n    const bin = document.createElement('button');\\n    bin.type = 'button';\\n    bin.className = 'bin-btn';\\n    bin.textContent = '🗑';\\n    bin.title = 'Delete todo';\\n    bin.addEventListener('click', () => {\\n      state.done = state.done.filter(entry => entry.id !== todo.id);\\n      render();\\n    });\\n\\n    actions.appendChild(bin);\\n\\n    item.appendChild(main);\\n    item.appendChild(actions);\\n    doneList.appendChild(item);\\n  }\\n\\n  if (state.todos.length === 0) {\\n    const empty = document.createElement('li');\\n    empty.className = 'todo-empty';\\n    empty.textContent = 'No active TODO items.';\\n    list.appendChild(empty);\\n  }\\n\\n  if (state.done.length === 0) {\\n    const emptyDone = document.createElement('li');\\n    emptyDone.className = 'todo-empty';\\n    emptyDone.textContent = 'No completed TODO items yet.';\\n    doneList.appendChild(emptyDone);\\n  }\\n}\\n\\nform.addEventListener('submit', event => {\\n  event.preventDefault();\\n\\n  const text = input.value.trim();\\n\\n  if (text === '') {\\n    return;\\n  }\\n\\n  state.todos.unshift({\\n    id: uid(),\\n    text,\\n  });\\n  input.value = '';\\n  input.focus();\\n  render();\\n});\\n\\nrender();",
    "README.md": "# TODO Sample\\n\\nSimple TODO sample application.\\n\\n## Usage\\n\\nOpen index.html and add items using the input.\\n\\n## Behavior\\n\\n- Add TODO item on submit.\\n- Active TODO items show Check and Bin actions.\\n- Clicking Check moves an item immediately to Done.\\n- Each item has a bin icon to delete it.\\n",
    "package.json": "{\\n  \\"name\\": \\"todo-sample\\",\\n  \\"version\\": \\"0.1.0\\",\\n  \\"private\\": true,\\n  \\"type\\": \\"module\\",\\n  \\"scripts\\": {\\n    \\"start\\": \\"echo \\"Open index.html in a browser\\"\\"\\n  }\\n}",
    "style.css": ":root {\\n  color-scheme: light dark;\\n}\\n\\nbody {\\n  margin: 0;\\n  font-family: system-ui, sans-serif;\\n  background: #0b1220;\\n  color: #e7edf7;\\n}\\n\\n.app {\\n  max-width: 560px;\\n  margin: 2rem auto;\\n  padding: 1rem;\\n  border: 1px solid #2b3954;\\n  border-radius: 8px;\\n  background: #121b2d;\\n}\\n\\n#todo-form {\\n  display: flex;\\n  gap: 0.5rem;\\n}\\n\\n#todo-input {\\n  flex: 1;\\n  padding: 0.5rem;\\n}\\n\\n.list-section {\\n  margin-top: 1rem;\\n}\\n\\n.list-section h2 {\\n  margin: 0 0 0.5rem;\\n  font-size: 1rem;\\n}\\n\\n.todo-list {\\n  margin: 0;\\n  padding: 0;\\n  list-style: none;\\n  display: grid;\\n  gap: 0.5rem;\\n}\\n\\n.todo-item {\\n  display: flex;\\n  align-items: center;\\n  justify-content: space-between;\\n  gap: 0.5rem;\\n  padding: 0.5rem 0.6rem;\\n  border: 1px solid #2b3954;\\n  border-radius: 6px;\\n  background: #0f1a2f;\\n}\\n\\n.todo-main {\\n  display: flex;\\n  align-items: center;\\n  gap: 0.5rem;\\n  min-width: 0;\\n}\\n\\n.todo-text {\\n  overflow: hidden;\\n  text-overflow: ellipsis;\\n  white-space: nowrap;\\n}\\n\\n.done .todo-text {\\n  text-decoration: line-through;\\n  opacity: 0.75;\\n}\\n\\n.bin-btn {\\n  border: 1px solid #3b4e7a;\\n  background: transparent;\\n  color: #e7edf7;\\n  border-radius: 6px;\\n  padding: 0.35rem 0.5rem;\\n  cursor: pointer;\\n}\\n\\n.check-btn {\\n  border: 1px solid #3b4e7a;\\n  background: #1b2b4b;\\n  color: #e7edf7;\\n  border-radius: 6px;\\n  padding: 0.35rem 0.55rem;\\n  cursor: pointer;\\n}\\n\\n.todo-empty {\\n  color: #9fb2d8;\\n  font-size: 0.9rem;\\n  padding: 0.25rem 0;\\n}",
    "index.html": "<!doctype html>\\n<html lang=\\"en\\">\\n<head>\\n  <meta charset=\\"UTF-8\\" />\\n  <meta name=\\"viewport\\" content=\\"width=device-width, initial-scale=1.0\\" />\\n  <title>TODO Sample</title>\\n  <link rel=\\"stylesheet\\" href=\\"style.css\\" />\\n</head>\\n<body>\\n  <main class=\\"app\\">\\n    <h1>TODO Sample</h1>\\n    <form id=\\"todo-form\\">\\n      <input id=\\"todo-input\\" type=\\"text\\" placeholder=\\"What needs doing?\\" required />\\n      <button type=\\"submit\\">Add</button>\\n    </form>\\n    <section class=\\"list-section\\">\\n      <h2>Todo</h2>\\n      <ul id=\\"todo-list\\" class=\\"todo-list\\"></ul>\\n    </section>\\n    <section class=\\"list-section\\">\\n      <h2>Done</h2>\\n      <ul id=\\"done-list\\" class=\\"todo-list\\"></ul>\\n    </section>\\n  </main>\\n  <script type=\\"module\\" src=\\"app.js\\"><\/script>\\n</body>\\n</html>"
  }
}`,ca=`{
  "id": "e44d7e29-c40a-4731-9092-9407b0105624",
  "name": "PdfParser",
  "files": {
    "README.md": "# PDF Text Extractor\\n\\nA simple browser app that converts PDF pages into a text-only layout preview using a 100-column virtual buffer.\\n\\n## Features\\n\\n- Drag-and-drop or click-to-upload PDF input\\n- Text extraction with \`pdfjs-dist\`\\n- Page-by-page monospace preview\\n- Activity log and extraction stats\\n- IndexedDB session persistence with \`asljs-dali\`\\n- Saved-session history with restore support\\n- Declarative UI bindings with \`asljs-data-binding\`\\n- Observable app state with \`asljs-observable\`\\n- Event bus with \`asljs-eventful\`\\n- \`asljs-components\` list rendering for pages and activity\\n\\n## ASLJS package usage\\n\\n- \`asljs-eventful\`: app event bus for status, success, and error events\\n- \`asljs-observable\`: reactive state for UI, pages, stats, and activity\\n- \`asljs-data-binding\`: declarative bindings via \`data-bind-*\` attributes\\n- \`asljs-components\`: \`asljs-list\` for activity and extracted page rendering\\n- \`asljs-dali\`: IndexedDB-backed session table and live recordset observation\\n\\n## Files\\n\\n- \`index.html\`: app shell and declarative binding markup\\n- \`style.css\`: layout and visual styling\\n- \`app.js\`: app entry point and runtime logic\\n- \`package.json\`: scripts and required dependencies\\n\\n## Run\\n\\nUse a static server, for example:\\n\\n\`\`\`bash\\nnpm install\\nnpm run dev\\n\`\`\`\\n\\nThen open the served app in a modern browser.\\n\\n## Agent tool workflow\\n\\nThis project is intended to be updated through the app-builder tool workflow:\\n\\n- inspect files with \`listFileset()\` and \`readFile(path)\`\\n- modify files with \`replaceFilePart(...)\` or \`setFileContent(...)\`\\n- remove files with \`deleteFile(path)\`\\n- verify runtime with \`runAppAndCollectDiagnostics()\` and \`getAppDiagnostics()\`\\n- perform targeted checks with \`evalInApp(code)\`\\n\\nThe app entry point is \`app.js\`, and \`index.html\` loads it with \`<script type=\\"module\\">\`.\\n\\n## Current behavior\\n\\n- Uploading a PDF extracts text from each page\\n- Each page is mapped into a fixed-width text buffer\\n- Extraction results are shown in a list of page cards\\n- Full extraction sessions are stored in IndexedDB\\n- Recent saved sessions can be restored into the page preview\\n- The activity log records app events and persistence updates\\n",
    "app.js": "import { eventful } from 'https://cdn.jsdelivr.net/npm/asljs-eventful/+esm';\\nimport { observable } from 'https://cdn.jsdelivr.net/npm/asljs-observable/+esm';\\nimport { bindDataModel } from 'https://cdn.jsdelivr.net/npm/asljs-data-binding/+esm';\\nimport 'https://cdn.jsdelivr.net/npm/asljs-components/+esm';\\nimport { dbOpen, Table } from 'https://cdn.jsdelivr.net/npm/asljs-dali/+esm';\\nimport * as pdfjsLib from 'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.6.205/build/pdf.mjs';\\n\\npdfjsLib.GlobalWorkerOptions.workerSrc =\\n  'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.6.205/build/pdf.worker.mjs';\\n\\nconst BUFFER_WIDTH = 100;\\nconst DB_NAME = 'pdf-text-extractor-db';\\nconst STORE_NAME = 'sessions';\\nconst SAMPLE_MESSAGE = 'Drop a PDF file or click here to choose one. The app maps extracted text into a 100-column virtual text buffer per page.';\\nconst MAX_HISTORY = 8;\\n\\nlet booted = false;\\n\\nwindow.addEventListener('error', event => {\\n  console.error('Window error', event.error || event.message);\\n});\\n\\nwindow.addEventListener('unhandledrejection', event => {\\n  console.error('Unhandled rejection', event.reason);\\n});\\n\\nboot().catch(error => {\\n  console.error('Boot failed', error);\\n});\\n\\nasync function boot() {\\n  if (booted) return;\\n  booted = true;\\n  console.log('boot:start');\\n\\n  const root = document.getElementById('app');\\n  if (!root) throw new Error('Missing #app root element.');\\n\\n  const bus = eventful({ name: 'pdf-text-extractor-bus' });\\n  const state = observable({\\n    stats: {\\n      pages: 0,\\n      characters: 0,\\n      sessions: 0,\\n    },\\n    ui: {\\n      dragOver: false,\\n      busy: false,\\n      dropzoneTitle: 'Drop PDF here',\\n      dropzoneHint: SAMPLE_MESSAGE,\\n      status: {\\n        message: 'Ready for a PDF.',\\n        error: '',\\n      },\\n      loadSample() {\\n        state.ui.status.message = 'Instructions loaded. Now drop a PDF file.';\\n        state.ui.status.error = '';\\n        addLog('Instructions', SAMPLE_MESSAGE, true);\\n        bus.emit('status', state.ui.status.message);\\n      },\\n      clearOutput() {\\n        state.pages.length = 0;\\n        state.stats.pages = 0;\\n        state.stats.characters = 0;\\n        state.ui.status.message = 'Output cleared.';\\n        state.ui.status.error = '';\\n        addLog('Cleared', 'Removed extracted pages from the current view.', false);\\n        bus.emit('cleared');\\n      },\\n    },\\n    pages: observable([]),\\n    activity: observable([]),\\n    history: observable([]),\\n    selectedSessionId: null,\\n    lastSessionId: null,\\n    restoreSession(event, model, element) {\\n      const sessionId = element?.dataset?.sessionId;\\n      if (!sessionId) return;\\n      restoreSessionById(sessionId);\\n    },\\n    async clearHistory() {\\n      if (!sessions?.clear) return;\\n      await sessions.clear();\\n      state.history.splice(0, state.history.length);\\n      state.selectedSessionId = null;\\n      state.stats.sessions = 0;\\n      state.ui.status.message = 'Saved session history cleared.';\\n      state.ui.status.error = '';\\n      addLog('History cleared', 'Removed saved extraction sessions from IndexedDB.', true);\\n      bus.emit('status', state.ui.status.message);\\n    },\\n  });\\n\\n  let sessions = null;\\n  let liveSessions = null;\\n\\n  try {\\n    const db = await dbOpen(DB_NAME, [database => {\\n      if (!database.objectStoreNames.contains(STORE_NAME)) {\\n        database.createObjectStore(STORE_NAME, { keyPath: 'id' });\\n      }\\n    }]);\\n\\n    sessions = new Table(STORE_NAME, db, {});\\n\\n    const refreshHistory = async (logLatest = false) => {\\n      if (!sessions?.scan) return;\\n      const records = await sessions.scan(() => true);\\n      const sorted = [...records].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));\\n      state.history.splice(0, state.history.length, ...sorted.slice(0, MAX_HISTORY).map(record => ({\\n        id: record.id,\\n        fileName: record.fileName,\\n        pageCount: record.pageCount,\\n        characterCount: record.characterCount,\\n        createdAt: record.createdAt,\\n        selected: record.id === state.selectedSessionId,\\n        summary: \`\${record.pageCount} page(s) • \${record.characterCount} chars\`,\\n      })));\\n      state.stats.sessions = records.length;\\n\\n      const latest = sorted[0];\\n      if (!logLatest || !latest || latest.id === state.lastSessionId) return;\\n      state.lastSessionId = latest.id;\\n      addLog('Saved session', \`\${latest.fileName} (\${latest.pageCount} pages) stored in IndexedDB.\`, false);\\n    };\\n\\n    await refreshHistory(false);\\n    sessions.notify({\\n      add() {\\n        refreshHistory(true).catch(error => console.warn('History refresh failed', error));\\n      },\\n      put() {\\n        refreshHistory(true).catch(error => console.warn('History refresh failed', error));\\n      },\\n      update() {\\n        refreshHistory(false).catch(error => console.warn('History refresh failed', error));\\n      },\\n      delete() {\\n        refreshHistory(false).catch(error => console.warn('History refresh failed', error));\\n      },\\n      clear() {\\n        refreshHistory(false).catch(error => console.warn('History refresh failed', error));\\n      },\\n    });\\n  } catch (error) {\\n    console.warn('Persistence unavailable', error);\\n    state.ui.status.error = 'IndexedDB persistence unavailable in this environment.';\\n  }\\n\\n  bus.on('status', message => addLog('Status', message, false));\\n  bus.on('pdf-loaded', payload => addLog('PDF loaded', \`\${payload.fileName} with \${payload.pageCount} pages extracted.\`, true));\\n  bus.on('error', message => addLog('Error', message, true));\\n\\n  bindDataModel(root, state, {});\\n\\n  const pagesList = document.getElementById('pages-list');\\n  if (pagesList) {\\n    pagesList.items = state.pages;\\n    pagesList.context = state;\\n  }\\n\\n  const activityList = document.getElementById('activity-list');\\n  if (activityList) {\\n    activityList.items = state.activity;\\n    activityList.context = state;\\n  }\\n\\n  const historyList = document.getElementById('history-list');\\n  if (historyList) {\\n    historyList.items = state.history;\\n    historyList.context = state;\\n  }\\n\\n  wireFileInput(state, bus, sessions);\\n  wireDropzone(state, bus, sessions);\\n\\n  state.ui.status.message = 'Ready for a PDF. Drag and drop or click the dropzone.';\\n  addLog('Ready', 'Application booted successfully.', false);\\n\\n  window.__PDF_TEXT_EXTRACTOR__ = { state, bus, sessions };\\n\\n  async function restoreSessionById(sessionId) {\\n    if (!sessions?.getOne) return;\\n    try {\\n      const session = await sessions.getOne(sessionId);\\n      if (!session) {\\n        state.ui.status.error = 'Saved session not found.';\\n        bus.emit('error', state.ui.status.error);\\n        return;\\n      }\\n\\n      state.selectedSessionId = session.id;\\n      for (const item of state.history) {\\n        item.selected = item.id === session.id;\\n      }\\n\\n      state.pages.splice(0, state.pages.length, ...(session.pages || []));\\n      state.stats.pages = session.pageCount || 0;\\n      state.stats.characters = session.characterCount || 0;\\n      state.ui.status.message = \`Restored \${session.fileName} from saved history.\`;\\n      state.ui.status.error = '';\\n      addLog('Session restored', \`\${session.fileName} loaded from IndexedDB history.\`, true);\\n      bus.emit('status', state.ui.status.message);\\n    } catch (error) {\\n      console.error(error);\\n      state.ui.status.error = 'Failed to restore saved session.';\\n      bus.emit('error', state.ui.status.error);\\n    }\\n  }\\n\\n  function addLog(title, detail, highlight) {\\n    state.activity.unshift({\\n      id: crypto.randomUUID(),\\n      title,\\n      detail,\\n      highlight,\\n      time: new Date().toLocaleTimeString(),\\n    });\\n    if (state.activity.length > 12) {\\n      state.activity.length = 12;\\n    }\\n  }\\n}\\n\\nfunction wireFileInput(state, bus, sessions) {\\n  const input = document.getElementById('pdf-input');\\n  if (!input) return;\\n\\n  input.addEventListener('change', async event => {\\n    const file = event.target?.files?.[0];\\n    if (!file) return;\\n    await handlePdfFile(file, state, bus, sessions);\\n    input.value = '';\\n  });\\n}\\n\\nfunction wireDropzone(state, bus, sessions) {\\n  const dropzone = document.getElementById('dropzone');\\n  if (!dropzone) return;\\n\\n  ['dragenter', 'dragover'].forEach(type => {\\n    dropzone.addEventListener(type, event => {\\n      event.preventDefault();\\n      state.ui.dragOver = true;\\n    });\\n  });\\n\\n  ['dragleave', 'dragend'].forEach(type => {\\n    dropzone.addEventListener(type, () => {\\n      state.ui.dragOver = false;\\n    });\\n  });\\n\\n  dropzone.addEventListener('drop', async event => {\\n    event.preventDefault();\\n    state.ui.dragOver = false;\\n    const file = event.dataTransfer?.files?.[0];\\n    if (!file) return;\\n    await handlePdfFile(file, state, bus, sessions);\\n  });\\n}\\n\\nasync function handlePdfFile(file, state, bus, sessions) {\\n  if (file.type && file.type !== 'application/pdf') {\\n    state.ui.status.error = 'Please drop a valid PDF file.';\\n    bus.emit('error', state.ui.status.error);\\n    return;\\n  }\\n\\n  state.ui.busy = true;\\n  state.ui.status.message = \`Reading \${file.name}...\`;\\n  state.ui.status.error = '';\\n  bus.emit('status', state.ui.status.message);\\n\\n  try {\\n    const bytes = await file.arrayBuffer();\\n    const loadingTask = pdfjsLib.getDocument({ data: bytes });\\n    const pdf = await loadingTask.promise;\\n    const pages = [];\\n    let totalCharacters = 0;\\n\\n    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {\\n      const page = await pdf.getPage(pageNumber);\\n      const viewport = page.getViewport({ scale: 1 });\\n      const textContent = await page.getTextContent();\\n      const rendered = renderPageToBuffer(textContent.items, viewport.width, viewport.height);\\n      totalCharacters += rendered.replace(/\\\\n/g, '').length;\\n      pages.push({\\n        id: \`\${file.name}-\${pageNumber}\`,\\n        pageNumber,\\n        summary: \`\${rendered.length} chars\`,\\n        text: rendered,\\n      });\\n    }\\n\\n    state.pages.splice(0, state.pages.length, ...pages);\\n    state.stats.pages = pages.length;\\n    state.stats.characters = totalCharacters;\\n    state.ui.status.message = \`Extracted \${pages.length} page(s) from \${file.name}.\`;\\n    state.ui.status.error = '';\\n\\n    const session = {\\n      id: crypto.randomUUID(),\\n      fileName: file.name,\\n      pageCount: pages.length,\\n      characterCount: totalCharacters,\\n      createdAt: new Date().toISOString(),\\n      pages,\\n    };\\n\\n    if (sessions?.put) {\\n      await sessions.put(session);\\n    }\\n    bus.emit('pdf-loaded', { fileName: file.name, pageCount: pages.length });\\n  } catch (error) {\\n    console.error(error);\\n    state.ui.status.error = error?.message || 'Failed to extract PDF text.';\\n    bus.emit('error', state.ui.status.error);\\n  } finally {\\n    state.ui.busy = false;\\n  }\\n}\\n\\nfunction renderPageToBuffer(items, pageWidth, pageHeight) {\\n  const rows = [];\\n  const rowCount = Math.max(1, Math.ceil((pageHeight / pageWidth) * BUFFER_WIDTH * 1.6));\\n\\n  for (let i = 0; i < rowCount; i += 1) {\\n    rows.push(Array(BUFFER_WIDTH).fill(' '));\\n  }\\n\\n  for (const item of items) {\\n    const text = String(item.str || '');\\n    if (!text.trim()) continue;\\n\\n    const transform = item.transform || [1, 0, 0, 1, 0, 0];\\n    const x = Number(transform[4] || 0);\\n    const y = Number(transform[5] || 0);\\n    const col = clamp(Math.round((x / Math.max(pageWidth, 1)) * (BUFFER_WIDTH - 1)), 0, BUFFER_WIDTH - 1);\\n    const row = clamp(Math.round(((pageHeight - y) / Math.max(pageHeight, 1)) * (rowCount - 1)), 0, rowCount - 1);\\n\\n    for (let i = 0; i < text.length; i += 1) {\\n      const targetCol = col + i;\\n      if (targetCol >= BUFFER_WIDTH) break;\\n      rows[row][targetCol] = text[i];\\n    }\\n  }\\n\\n  return rows\\n    .map(chars => chars.join('').replace(/\\\\s+$/g, ''))\\n    .join('\\\\n')\\n    .replace(/\\\\n{3,}/g, '\\\\n\\\\n')\\n    .trimEnd();\\n}\\n\\nfunction clamp(value, min, max) {\\n  return Math.min(max, Math.max(min, value));\\n}\\n",
    "index.html": "<!doctype html>\\n<html lang=\\"en\\">\\n<head>\\n  <meta charset=\\"UTF-8\\">\\n  <meta name=\\"viewport\\" content=\\"width=device-width, initial-scale=1.0\\">\\n  <title>PDF Text Extractor</title>\\n  <link rel=\\"stylesheet\\" href=\\"./style.css\\">\\n</head>\\n<body>\\n  <div id=\\"app\\" class=\\"app-shell\\">\\n    <header class=\\"hero\\">\\n      <div>\\n        <h1>PDF Text Extractor</h1>\\n        <p class=\\"subtitle\\">Drop a PDF to build a text-only page layout preview using a 100-column virtual buffer.</p>\\n      </div>\\n      <div class=\\"hero-stats\\" data-bind-context=\\"stats\\">\\n        <div class=\\"stat-card\\">\\n          <span class=\\"stat-label\\">Pages</span>\\n          <strong data-bind-text=\\"pages\\"></strong>\\n        </div>\\n        <div class=\\"stat-card\\">\\n          <span class=\\"stat-label\\">Chars</span>\\n          <strong data-bind-text=\\"characters\\"></strong>\\n        </div>\\n        <div class=\\"stat-card\\">\\n          <span class=\\"stat-label\\">Sessions</span>\\n          <strong data-bind-text=\\"sessions\\"></strong>\\n        </div>\\n      </div>\\n    </header>\\n\\n    <main class=\\"workspace\\">\\n      <section class=\\"panel controls\\" data-bind-context=\\"ui\\">\\n        <label\\n          id=\\"dropzone\\"\\n          class=\\"dropzone\\"\\n          data-bind-class-dragover=\\"dragOver\\"\\n          data-bind-class-busy=\\"busy\\"\\n          for=\\"pdf-input\\"\\n        >\\n          <input id=\\"pdf-input\\" type=\\"file\\" accept=\\"application/pdf\\">\\n          <span class=\\"dropzone-title\\" data-bind-text=\\"dropzoneTitle\\"></span>\\n          <span class=\\"dropzone-hint\\" data-bind-text=\\"dropzoneHint\\"></span>\\n        </label>\\n\\n        <div class=\\"actions\\">\\n          <button class=\\"secondary\\" data-bind-onclick=\\"loadSample\\">Load sample instructions</button>\\n          <button class=\\"danger\\" data-bind-onclick=\\"clearOutput\\">Clear output</button>\\n        </div>\\n\\n        <section class=\\"status-card\\">\\n          <h2>Status</h2>\\n          <p class=\\"status-line\\" data-bind-text=\\"status.message\\"></p>\\n          <p class=\\"error-line\\" data-bind-text=\\"status.error\\"></p>\\n        </section>\\n\\n        <section class=\\"status-card\\">\\n          <h2>Saved Sessions</h2>\\n          <div class=\\"actions compact-actions\\">\\n            <button class=\\"secondary\\" data-bind-onclick=\\"clearHistory\\">Clear saved history</button>\\n          </div>\\n          <asljs-list id=\\"history-list\\">\\n            <template data-slot=\\"container\\">\\n              <div class=\\"log-list\\" data-role=\\"items\\"></div>\\n            </template>\\n            <template data-slot=\\"item\\">\\n              <button\\n                class=\\"history-entry\\"\\n                type=\\"button\\"\\n                data-bind-class-selected=\\"item.selected\\"\\n                data-bind-onclick=\\"context.restoreSession\\"\\n                data-bind-data-session-id=\\"item.id\\"\\n              >\\n                <div class=\\"log-entry-top\\">\\n                  <strong data-bind-text=\\"item.fileName\\"></strong>\\n                  <span data-bind-text=\\"item.createdAt\\"></span>\\n                </div>\\n                <span data-bind-text=\\"item.summary\\"></span>\\n              </button>\\n            </template>\\n            <template data-slot=\\"empty\\">\\n              <p class=\\"empty-state\\">No saved sessions yet.</p>\\n            </template>\\n          </asljs-list>\\n        </section>\\n\\n        <section class=\\"status-card\\">\\n          <h2>Activity Log</h2>\\n          <asljs-list id=\\"activity-list\\">\\n            <template data-slot=\\"container\\">\\n              <div class=\\"log-list\\" data-role=\\"items\\"></div>\\n            </template>\\n            <template data-slot=\\"item\\">\\n              <article class=\\"log-entry\\" data-bind-class-highlight=\\"item.highlight\\">\\n                <div class=\\"log-entry-top\\">\\n                  <strong data-bind-text=\\"item.title\\"></strong>\\n                  <span data-bind-text=\\"item.time\\"></span>\\n                </div>\\n                <p data-bind-text=\\"item.detail\\"></p>\\n              </article>\\n            </template>\\n            <template data-slot=\\"empty\\">\\n              <p class=\\"empty-state\\">No activity yet.</p>\\n            </template>\\n          </asljs-list>\\n        </section>\\n      </section>\\n\\n      <section class=\\"panel output-panel\\">\\n        <div class=\\"output-header\\">\\n          <h2>Extracted Text Layout</h2>\\n          <p>Whitespace preserved, 8pt monospace, all pages shown.</p>\\n        </div>\\n        <asljs-list id=\\"pages-list\\">\\n          <template data-slot=\\"container\\">\\n            <div class=\\"pages-list\\" data-role=\\"items\\"></div>\\n          </template>\\n          <template data-slot=\\"item\\">\\n            <section class=\\"page-card\\">\\n              <header class=\\"page-card-header\\">\\n                <h3>Page <span data-bind-text=\\"item.pageNumber\\"></span></h3>\\n                <span data-bind-text=\\"item.summary\\"></span>\\n              </header>\\n              <pre class=\\"page-text\\" data-bind-text=\\"item.text\\"></pre>\\n            </section>\\n          </template>\\n          <template data-slot=\\"empty\\">\\n            <div class=\\"empty-output\\">\\n              <h3>No PDF loaded</h3>\\n              <p>Drop a PDF file onto the zone to extract positioned text.</p>\\n            </div>\\n          </template>\\n        </asljs-list>\\n      </section>\\n    </main>\\n  </div>\\n\\n  <script type=\\"module\\" src=\\"app.js\\"><\/script>\\n</body>\\n</html>",
    "package.json": "{\\n  \\"name\\": \\"pdf-text-extractor\\",\\n  \\"version\\": \\"1.0.0\\",\\n  \\"private\\": true,\\n  \\"type\\": \\"module\\",\\n  \\"scripts\\": {\\n    \\"start\\": \\"npx serve .\\",\\n    \\"dev\\": \\"npx serve .\\"\\n  },\\n  \\"dependencies\\": {\\n    \\"asljs-components\\": \\"latest\\",\\n    \\"asljs-dali\\": \\"latest\\",\\n    \\"asljs-data-binding\\": \\"latest\\",\\n    \\"asljs-eventful\\": \\"latest\\",\\n    \\"asljs-observable\\": \\"latest\\"\\n  }\\n}",
    "style.css": ":root {\\n  color-scheme: light;\\n  --bg: #f4f7fb;\\n  --panel: #ffffff;\\n  --border: #d8e0ea;\\n  --text: #1f2937;\\n  --muted: #5f6b7a;\\n  --accent: #2563eb;\\n  --accent-soft: #dbeafe;\\n  --danger: #b91c1c;\\n  --shadow: 0 10px 30px rgba(15, 23, 42, 0.08);\\n}\\n\\n* {\\n  box-sizing: border-box;\\n}\\n\\nbody {\\n  margin: 0;\\n  font-family: Arial, Helvetica, sans-serif;\\n  background: var(--bg);\\n  color: var(--text);\\n}\\n\\n.app-shell {\\n  max-width: 1400px;\\n  margin: 0 auto;\\n  padding: 24px;\\n}\\n\\n.hero {\\n  display: flex;\\n  justify-content: space-between;\\n  gap: 16px;\\n  align-items: flex-start;\\n  margin-bottom: 24px;\\n}\\n\\n.hero h1 {\\n  margin: 0 0 8px;\\n}\\n\\n.subtitle {\\n  margin: 0;\\n  color: var(--muted);\\n}\\n\\n.hero-stats {\\n  display: flex;\\n  gap: 12px;\\n}\\n\\n.stat-card,\\n.panel,\\n.page-card,\\n.status-card,\\n.log-entry {\\n  background: var(--panel);\\n  border: 1px solid var(--border);\\n  border-radius: 14px;\\n  box-shadow: var(--shadow);\\n}\\n\\n.stat-card {\\n  min-width: 110px;\\n  padding: 14px;\\n}\\n\\n.stat-label {\\n  display: block;\\n  color: var(--muted);\\n  font-size: 12px;\\n  margin-bottom: 6px;\\n}\\n\\n.workspace {\\n  display: grid;\\n  grid-template-columns: 340px 1fr;\\n  gap: 20px;\\n}\\n\\n.panel {\\n  padding: 18px;\\n}\\n\\n.controls {\\n  display: flex;\\n  flex-direction: column;\\n  gap: 16px;\\n}\\n\\n.dropzone {\\n  display: flex;\\n  flex-direction: column;\\n  justify-content: center;\\n  align-items: center;\\n  min-height: 220px;\\n  border: 2px dashed #93c5fd;\\n  border-radius: 16px;\\n  background: #eff6ff;\\n  text-align: center;\\n  padding: 20px;\\n  cursor: pointer;\\n  transition: 0.2s ease;\\n}\\n\\n.dropzone.dragover {\\n  border-color: var(--accent);\\n  background: var(--accent-soft);\\n  transform: scale(1.01);\\n}\\n\\n.dropzone.busy {\\n  opacity: 0.7;\\n}\\n\\n.dropzone input {\\n  display: none;\\n}\\n\\n.dropzone-title {\\n  font-size: 20px;\\n  font-weight: 700;\\n  margin-bottom: 8px;\\n}\\n\\n.dropzone-hint {\\n  color: var(--muted);\\n  line-height: 1.5;\\n}\\n\\n.actions {\\n  display: flex;\\n  gap: 10px;\\n}\\n\\n.compact-actions {\\n  margin-bottom: 10px;\\n}\\n\\nbutton {\\n  border: 1px solid var(--border);\\n  background: white;\\n  color: var(--text);\\n  border-radius: 10px;\\n  padding: 10px 14px;\\n  cursor: pointer;\\n}\\n\\nbutton.secondary {\\n  background: #eff6ff;\\n}\\n\\nbutton.danger {\\n  color: white;\\n  background: var(--danger);\\n  border-color: var(--danger);\\n}\\n\\n.status-card {\\n  padding: 14px;\\n}\\n\\n.status-card h2,\\n.output-header h2 {\\n  margin-top: 0;\\n}\\n\\n.status-line,\\n.error-line,\\n.empty-state,\\n.empty-output p,\\n.output-header p,\\n.log-entry p {\\n  margin-bottom: 0;\\n}\\n\\n.error-line {\\n  color: var(--danger);\\n  min-height: 1.2em;\\n}\\n\\n.log-list,\\n.pages-list {\\n  display: flex;\\n  flex-direction: column;\\n  gap: 12px;\\n}\\n\\n.log-entry {\\n  padding: 12px;\\n}\\n\\n.history-entry {\\n  width: 100%;\\n  text-align: left;\\n  display: flex;\\n  flex-direction: column;\\n  gap: 6px;\\n}\\n\\n.history-entry.selected {\\n  border-color: var(--accent);\\n  background: var(--accent-soft);\\n}\\n\\n.log-entry.highlight {\\n  border-color: #93c5fd;\\n}\\n\\n.log-entry-top {\\n  display: flex;\\n  justify-content: space-between;\\n  gap: 12px;\\n  font-size: 12px;\\n  color: var(--muted);\\n}\\n\\n.output-panel {\\n  min-width: 0;\\n}\\n\\n.output-header {\\n  margin-bottom: 16px;\\n}\\n\\n.page-card {\\n  padding: 16px;\\n}\\n\\n.page-card-header {\\n  display: flex;\\n  justify-content: space-between;\\n  gap: 12px;\\n  align-items: baseline;\\n  margin-bottom: 12px;\\n}\\n\\n.page-card-header h3 {\\n  margin: 0;\\n}\\n\\n.page-text {\\n  margin: 0;\\n  white-space: pre-wrap;\\n  font-family: \\"Courier New\\", Courier, monospace;\\n  font-size: 8pt;\\n  line-height: 1.2;\\n  overflow: auto;\\n  background: #f8fafc;\\n  border: 1px solid var(--border);\\n  border-radius: 10px;\\n  padding: 12px;\\n}\\n\\n.empty-output {\\n  border: 1px dashed var(--border);\\n  border-radius: 14px;\\n  padding: 24px;\\n  text-align: center;\\n  background: #f8fafc;\\n}\\n\\n@media (max-width: 980px) {\\n  .hero,\\n  .workspace {\\n    grid-template-columns: 1fr;\\n    display: grid;\\n  }\\n\\n  .hero-stats {\\n    flex-wrap: wrap;\\n  }\\n}\\n"
  }
}`;function da(e){const n={};for(const s of e.files)n[s.name]=s.content;return{id:e.app.id,name:e.app.name,author:ir(e.app.author),files:n}}function sr(e){const n=JSON.parse(e);return ar(n),n}function ua(e){ar(e.payload);const n=e.existingApps.find(o=>o.id===e.payload.id);if(n!==void 0)return e.navigateToExistingById?{kind:"existing",appId:n.id}:{kind:"duplicate"};const s={id:e.payload.id,uuid:e.createUuid(),name:e.payload.name,author:ir(e.payload.author),createdAt:e.now,updatedAt:e.now},l=Object.entries(e.payload.files).map(([o,b])=>({id:e.createId(),appId:s.id,name:o,content:b}));return{kind:"new",app:s,files:l}}function ar(e){if(typeof e.id!="string"||e.id.trim()==="")throw new Error("Invalid app JSON format.");if(typeof e.name!="string"||e.name.trim()==="")throw new Error("Invalid app JSON format.");if(e.files===null||typeof e.files!="object")throw new Error("Invalid app JSON format.");if(!pa(e.author))throw new Error("Invalid app JSON format.");for(const[n,s]of Object.entries(e.files))if(n.trim()===""||typeof s!="string")throw new Error("Invalid app JSON format.")}function ir(e){if(e===void 0)return;const n=typeof e.name=="string"?e.name.trim():"",s=typeof e.email=="string"?e.email.trim():"";if(!(n===""&&s===""))return{...n!==""?{name:n}:{},...s!==""?{email:s}:{}}}function pa(e){if(e===void 0)return!0;if(e===null||typeof e!="object")return!1;const n=e;return!(n.name!==void 0&&typeof n.name!="string"||n.email!==void 0&&typeof n.email!="string")}const fa=[la,ca];function or(){return fa.map(ga).map(sr)}function ma(e){return or().find(s=>s.name===e)??null}function Nt(e){return or().find(s=>s.id===e)??null}function ha(e,n,s){return Object.entries(e.files).map(([l,o])=>({id:s(),appId:n,name:l,content:o}))}function ga(e){if(typeof e=="string")return e;if(e!==null&&typeof e=="object")return JSON.stringify(e);throw new Error("Invalid sample source format.")}const va=6e3;function ba(e){const n=Number.isFinite(e.timeoutMs)?Math.max(1,Math.floor(e.timeoutMs)):va;async function s(b){const y=JSON.stringify(b),ee=await Rt(e.codec.compress(y),n,"Link compression timed out. Use Download export instead."),ce=`${e.baseUrl}${e.hashPrefix}${ee}`;return{url:ce,exceedsMaxUrlLength:ce.length>e.maxUrlLength}}async function l(b){const y=await Rt(e.codec.decompress(b),n,"Link decompression timed out.");return JSON.parse(y)}function o(b){return b.startsWith(e.hashPrefix)?b.slice(e.hashPrefix.length):null}return{createShareUrl:s,parsePayloadFromToken:l,readTokenFromHash:o}}function ya(){return{compress:wa,decompress:xa}}async function wa(e){const n=new TextEncoder().encode(e),s=await Ea(n,"gzip");return Aa(s)}async function xa(e){const n=ka(e),s=await Sa(n,"gzip");return new TextDecoder().decode(s)}async function Ea(e,n){const s=new Blob([e]).stream().pipeThrough(new CompressionStream(n));return lr(s)}async function Sa(e,n){const s=new Blob([e]).stream().pipeThrough(new DecompressionStream(n));return lr(s)}async function lr(e){const n=e.getReader(),s=[];let l=0;for(;;){const{value:y,done:ee}=await n.read();if(ee)break;y!==void 0&&(s.push(y),l+=y.length)}const o=new Uint8Array(l);let b=0;for(const y of s)o.set(y,b),b+=y.length;return o}function Aa(e){let s="";for(let l=0;l<e.length;l+=32768){const o=e.subarray(l,l+32768);s+=String.fromCharCode(...o)}return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,"")}function ka(e){const n=e.replace(/-/g,"+").replace(/_/g,"/"),s=n.length%4,l=s===0?n:`${n}${"=".repeat(4-s)}`;let o="";try{o=atob(l)}catch{throw new Error("Invalid compressed share token.")}const b=new Uint8Array(o.length);for(let y=0;y<o.length;y++)b[y]=o.charCodeAt(y);return b}async function Rt(e,n,s){let l;const o=new Promise((b,y)=>{l=globalThis.setTimeout(()=>{y(new Error(s))},n)});try{return await Promise.race([e,o])}finally{l!==void 0&&globalThis.clearTimeout(l)}}async function Ta(e,n){const s={...e.files};for(const[l,o]of Object.entries(e.files)){const b=ja(l);if(b!==null){s[l]=await n(o,b);continue}Ia(l)&&(s[l]=Pa(o))}return{...e,files:s}}function ja(e){const n=e.toLowerCase();return n.endsWith(".css")?"css":n.endsWith(".ts")?"ts":n.endsWith(".tsx")?"tsx":n.endsWith(".jsx")?"jsx":n.endsWith(".js")||n.endsWith(".mjs")||n.endsWith(".cjs")?"js":null}function Ia(e){const n=e.toLowerCase();return n.endsWith(".html")||n.endsWith(".htm")}function Pa(e){const n=[];return e.replace(/<(pre|textarea|script|style)\b[\s\S]*?<\/\1>/gi,o=>`__ASLJS_HTML_BLOCK_${n.push(o)-1}__`).replace(/<!--([\s\S]*?)-->/g,"").replace(/>\s+</g,"><").replace(/\s{2,}/g," ").trim().replace(/__ASLJS_HTML_BLOCK_(\d+)__/g,(o,b)=>n[Number.parseInt(b,10)]??"")}var qn={exports:{}},Mt;function _a(){return Mt||(Mt=1,(function(e){(n=>{var s=Object.defineProperty,l=Object.getOwnPropertyDescriptor,o=Object.getOwnPropertyNames,b=Object.prototype.hasOwnProperty,y=(t,r)=>{for(var i in r)s(t,i,{get:r[i],enumerable:!0})},ee=(t,r,i,p)=>{if(r&&typeof r=="object"||typeof r=="function")for(let x of o(r))!b.call(t,x)&&x!==i&&s(t,x,{get:()=>r[x],enumerable:!(p=l(r,x))||p.enumerable});return t},ce=t=>ee(s({},"__esModule",{value:!0}),t),q=(t,r,i)=>new Promise((p,x)=>{var E=u=>{try{T(i.next(u))}catch(k){x(k)}},g=u=>{try{T(i.throw(u))}catch(k){x(k)}},T=u=>u.done?p(u.value):Promise.resolve(u.value).then(E,g);T((i=i.apply(t,r)).next())}),H={};y(H,{analyzeMetafile:()=>ts,analyzeMetafileSync:()=>is,build:()=>Qr,buildSync:()=>rs,context:()=>Zr,default:()=>ds,formatMessages:()=>ns,formatMessagesSync:()=>as,initialize:()=>ls,stop:()=>os,transform:()=>es,transformSync:()=>ss,version:()=>Xr}),n.exports=ce(H);function X(t){let r=p=>{if(p===null)i.write8(0);else if(typeof p=="boolean")i.write8(1),i.write8(+p);else if(typeof p=="number")i.write8(2),i.write32(p|0);else if(typeof p=="string")i.write8(3),i.write(V(p));else if(p instanceof Uint8Array)i.write8(4),i.write(p);else if(p instanceof Array){i.write8(5),i.write32(p.length);for(let x of p)r(x)}else{let x=Object.keys(p);i.write8(6),i.write32(x.length);for(let E of x)i.write(V(E)),r(p[E])}},i=new K;return i.write32(0),i.write32(t.id<<1|+!t.isRequest),r(t.value),ye(i.buf,i.len-4,0),i.buf.subarray(0,i.len)}function D(t){let r=()=>{switch(i.read8()){case 0:return null;case 1:return!!i.read8();case 2:return i.read32();case 3:return ie(i.read());case 4:return i.read();case 5:{let g=i.read32(),T=[];for(let u=0;u<g;u++)T.push(r());return T}case 6:{let g=i.read32(),T={};for(let u=0;u<g;u++)T[ie(i.read())]=r();return T}default:throw new Error("Invalid packet")}},i=new K(t),p=i.read32(),x=(p&1)===0;p>>>=1;let E=r();if(i.ptr!==t.length)throw new Error("Invalid packet");return{id:p,isRequest:x,value:E}}var K=class{constructor(t=new Uint8Array(1024)){this.buf=t,this.len=0,this.ptr=0}_write(t){if(this.len+t>this.buf.length){let r=new Uint8Array((this.len+t)*2);r.set(this.buf),this.buf=r}return this.len+=t,this.len-t}write8(t){let r=this._write(1);this.buf[r]=t}write32(t){let r=this._write(4);ye(this.buf,t,r)}write(t){let r=this._write(4+t.length);ye(this.buf,t.length,r),this.buf.set(t,r+4)}_read(t){if(this.ptr+t>this.buf.length)throw new Error("Invalid packet");return this.ptr+=t,this.ptr-t}read8(){return this.buf[this._read(1)]}read32(){return le(this.buf,this._read(4))}read(){let t=this.read32(),r=new Uint8Array(t),i=this._read(r.length);return r.set(this.buf.subarray(i,i+t)),r}},V,ie,oe;if(typeof TextEncoder<"u"&&typeof TextDecoder<"u"){let t=new TextEncoder,r=new TextDecoder;V=i=>t.encode(i),ie=i=>r.decode(i),oe='new TextEncoder().encode("")'}else if(typeof Buffer<"u")V=t=>Buffer.from(t),ie=t=>{let{buffer:r,byteOffset:i,byteLength:p}=t;return Buffer.from(r,i,p).toString()},oe='Buffer.from("")';else throw new Error("No UTF-8 codec found");if(!(V("")instanceof Uint8Array))throw new Error(`Invariant violation: "${oe} instanceof Uint8Array" is incorrectly false

This indicates that your JavaScript environment is broken. You cannot use
esbuild in this environment because esbuild relies on this invariant. This
is not a problem with esbuild. You need to fix your environment instead.
`);function le(t,r){return(t[r++]|t[r++]<<8|t[r++]<<16|t[r++]<<24)>>>0}function ye(t,r,i){t[i++]=r,t[i++]=r>>8,t[i++]=r>>16,t[i++]=r>>24}var ve=String.fromCharCode;function fe(t,r,i){const p=t[r];let x=1,E=0;for(let g=0;g<r;g++)t[g]===10?(x++,E=0):E++;throw new SyntaxError(i||(r===t.length?"Unexpected end of input while parsing JSON":p>=32&&p<=126?`Unexpected character ${ve(p)} in JSON at position ${r} (line ${x}, column ${E})`:`Unexpected byte 0x${p.toString(16)} in JSON at position ${r} (line ${x}, column ${E})`))}function G(t){if(!(t instanceof Uint8Array))throw new Error("JSON input must be a Uint8Array");const r=[],i=[],p=[],x=t.length;let E=null,g=0,T,u=0;for(;u<x;){let k=t[u++];if(k<=32)continue;let P;switch(g===2&&E===null&&k!==34&&k!==125&&fe(t,--u),k){case 116:{(t[u++]!==114||t[u++]!==117||t[u++]!==101)&&fe(t,--u),P=!0;break}case 102:{(t[u++]!==97||t[u++]!==108||t[u++]!==115||t[u++]!==101)&&fe(t,--u),P=!1;break}case 110:{(t[u++]!==117||t[u++]!==108||t[u++]!==108)&&fe(t,--u),P=null;break}case 45:case 46:case 48:case 49:case 50:case 51:case 52:case 53:case 54:case 55:case 56:case 57:{let F=u;for(P=ve(k),k=t[u];;){switch(k){case 43:case 45:case 46:case 48:case 49:case 50:case 51:case 52:case 53:case 54:case 55:case 56:case 57:case 101:case 69:{P+=ve(k),k=t[++u];continue}}break}P=+P,isNaN(P)&&fe(t,--F,"Invalid number");break}case 34:{for(P="";u>=x&&fe(t,x),k=t[u++],k!==34;)if(k===92)switch(t[u++]){case 34:P+='"';break;case 47:P+="/";break;case 92:P+="\\";break;case 98:P+="\b";break;case 102:P+="\f";break;case 110:P+=`
`;break;case 114:P+="\r";break;case 116:P+="	";break;case 117:{let F=0;for(let ne=0;ne<4;ne++)k=t[u++],F<<=4,k>=48&&k<=57?F|=k-48:k>=97&&k<=102?F|=k+-87:k>=65&&k<=70?F|=k+-55:fe(t,--u);P+=ve(F);break}default:fe(t,--u);break}else if(k<=127)P+=ve(k);else if((k&224)===192)P+=ve((k&31)<<6|t[u++]&63);else if((k&240)===224)P+=ve((k&15)<<12|(t[u++]&63)<<6|t[u++]&63);else if((k&248)==240){let F=(k&7)<<18|(t[u++]&63)<<12|(t[u++]&63)<<6|t[u++]&63;F>65535&&(F-=65536,P+=ve(F>>10&1023|55296),F=56320|F&1023),P+=ve(F)}P[0];break}case 91:{P=[],r.push(E),i.push(T),p.push(g),E=null,T=P,g=1;continue}case 123:{P={},r.push(E),i.push(T),p.push(g),E=null,T=P,g=2;continue}case 93:{g!==1&&fe(t,--u),P=T,E=r.pop(),T=i.pop(),g=p.pop();break}case 125:{g!==2&&fe(t,--u),P=T,E=r.pop(),T=i.pop(),g=p.pop();break}default:fe(t,--u)}for(k=t[u];k<=32;)k=t[++u];switch(g){case 0:{if(u===x)return P;break}case 1:{if(T.push(P),k===44){u++;continue}if(k===93)continue;break}case 2:{if(E===null){if(E=P,k===58){u++;continue}}else{if(T[E]=P,E=null,k===44){u++;continue}if(k===125)continue}break}}break}fe(t,u)}var B=JSON.stringify,Q="warning",me="silent";function be(t,r){const i=[];for(const p of t){if(xe(p,r),p.indexOf(",")>=0)throw new Error(`Invalid ${r}: ${p}`);i.push(p)}return i.join(",")}var ze=()=>null,ue=t=>typeof t=="boolean"?null:"a boolean",W=t=>typeof t=="string"?null:"a string",mn=t=>t instanceof RegExp?null:"a RegExp object",He=t=>typeof t=="number"&&t===(t|0)?null:"an integer",Rr=t=>typeof t=="number"&&t===(t|0)&&t>=0&&t<=65535?null:"a valid port number",xt=t=>typeof t=="function"?null:"a function",Ce=t=>Array.isArray(t)?null:"an array",we=t=>Array.isArray(t)&&t.every(r=>typeof r=="string")?null:"an array of strings",Se=t=>typeof t=="object"&&t!==null&&!Array.isArray(t)?null:"an object",Mr=t=>typeof t=="object"&&t!==null?null:"an array or an object",$r=t=>t instanceof WebAssembly.Module?null:"a WebAssembly.Module",Et=t=>typeof t=="object"&&!Array.isArray(t)?null:"an object or null",St=t=>typeof t=="string"||typeof t=="boolean"?null:"a string or a boolean",Ur=t=>typeof t=="string"||typeof t=="object"&&t!==null&&!Array.isArray(t)?null:"a string or an object",At=t=>typeof t=="string"||Array.isArray(t)&&t.every(r=>typeof r=="string")?null:"a string or an array of strings",kt=t=>typeof t=="string"||t instanceof Uint8Array?null:"a string or a Uint8Array",Br=t=>typeof t=="string"||t instanceof URL?null:"a string or a URL";function d(t,r,i,p){let x=t[i];if(r[i+""]=!0,x===void 0)return;let E=p(x);if(E!==null)throw new Error(`${B(i)} must be ${E}`);return x}function he(t,r,i){for(let p in t)if(!(p in r))throw new Error(`Invalid option ${i}: ${B(p)}`)}function Wr(t){let r=Object.create(null),i=d(t,r,"wasmURL",Br),p=d(t,r,"wasmModule",$r),x=d(t,r,"worker",ue);return he(t,r,"in initialize() call"),{wasmURL:i,wasmModule:p,worker:x}}function Tt(t){let r;if(t!==void 0){r=Object.create(null);for(let i in t){let p=t[i];if(typeof p=="string"||p===!1)r[i]=p;else throw new Error(`Expected ${B(i)} in mangle cache to map to either a string or false`)}}return r}function hn(t,r,i,p,x){let E=d(r,i,"color",ue),g=d(r,i,"logLevel",W),T=d(r,i,"logLimit",He);E!==void 0?t.push(`--color=${E}`):p&&t.push("--color=true"),t.push(`--log-level=${g||x}`),t.push(`--log-limit=${T||0}`)}function xe(t,r,i){if(typeof t!="string")throw new Error(`Expected value for ${r}${i!==void 0?" "+B(i):""} to be a string, got ${typeof t} instead`);return t}function jt(t,r,i){let p=d(r,i,"legalComments",W),x=d(r,i,"sourceRoot",W),E=d(r,i,"sourcesContent",ue),g=d(r,i,"target",At),T=d(r,i,"format",W),u=d(r,i,"globalName",W),k=d(r,i,"mangleProps",mn),P=d(r,i,"reserveProps",mn),F=d(r,i,"mangleQuoted",ue),ne=d(r,i,"minify",ue),Y=d(r,i,"minifySyntax",ue),re=d(r,i,"minifyWhitespace",ue),se=d(r,i,"minifyIdentifiers",ue),U=d(r,i,"lineLimit",He),pe=d(r,i,"drop",we),$=d(r,i,"dropLabels",we),M=d(r,i,"charset",W),A=d(r,i,"treeShaking",ue),v=d(r,i,"ignoreAnnotations",ue),c=d(r,i,"jsx",W),m=d(r,i,"jsxFactory",W),w=d(r,i,"jsxFragment",W),_=d(r,i,"jsxImportSource",W),L=d(r,i,"jsxDev",ue),h=d(r,i,"jsxSideEffects",ue),S=d(r,i,"define",Se),C=d(r,i,"logOverride",Se),a=d(r,i,"supported",Se),f=d(r,i,"pure",we),I=d(r,i,"keepNames",ue),j=d(r,i,"platform",W),J=d(r,i,"tsconfigRaw",Ur),de=d(r,i,"absPaths",we);if(p&&t.push(`--legal-comments=${p}`),x!==void 0&&t.push(`--source-root=${x}`),E!==void 0&&t.push(`--sources-content=${E}`),g&&t.push(`--target=${be(Array.isArray(g)?g:[g],"target")}`),T&&t.push(`--format=${T}`),u&&t.push(`--global-name=${u}`),j&&t.push(`--platform=${j}`),J&&t.push(`--tsconfig-raw=${typeof J=="string"?J:JSON.stringify(J)}`),ne&&t.push("--minify"),Y&&t.push("--minify-syntax"),re&&t.push("--minify-whitespace"),se&&t.push("--minify-identifiers"),U&&t.push(`--line-limit=${U}`),M&&t.push(`--charset=${M}`),A!==void 0&&t.push(`--tree-shaking=${A}`),v&&t.push("--ignore-annotations"),pe)for(let O of pe)t.push(`--drop:${xe(O,"drop")}`);if($&&t.push(`--drop-labels=${be($,"drop label")}`),de&&t.push(`--abs-paths=${be(de,"abs paths")}`),k&&t.push(`--mangle-props=${bn(k)}`),P&&t.push(`--reserve-props=${bn(P)}`),F!==void 0&&t.push(`--mangle-quoted=${F}`),c&&t.push(`--jsx=${c}`),m&&t.push(`--jsx-factory=${m}`),w&&t.push(`--jsx-fragment=${w}`),_&&t.push(`--jsx-import-source=${_}`),L&&t.push("--jsx-dev"),h&&t.push("--jsx-side-effects"),S)for(let O in S){if(O.indexOf("=")>=0)throw new Error(`Invalid define: ${O}`);t.push(`--define:${O}=${xe(S[O],"define",O)}`)}if(C)for(let O in C){if(O.indexOf("=")>=0)throw new Error(`Invalid log override: ${O}`);t.push(`--log-override:${O}=${xe(C[O],"log override",O)}`)}if(a)for(let O in a){if(O.indexOf("=")>=0)throw new Error(`Invalid supported: ${O}`);const ae=a[O];if(typeof ae!="boolean")throw new Error(`Expected value for supported ${B(O)} to be a boolean, got ${typeof ae} instead`);t.push(`--supported:${O}=${ae}`)}if(f)for(let O of f)t.push(`--pure:${xe(O,"pure")}`);I&&t.push("--keep-names")}function zr(t,r,i,p,x){var E;let g=[],T=[],u=Object.create(null),k=null,P=null;hn(g,r,u,i,p),jt(g,r,u);let F=d(r,u,"sourcemap",St),ne=d(r,u,"bundle",ue),Y=d(r,u,"splitting",ue),re=d(r,u,"preserveSymlinks",ue),se=d(r,u,"metafile",ue),U=d(r,u,"outfile",W),pe=d(r,u,"outdir",W),$=d(r,u,"outbase",W),M=d(r,u,"tsconfig",W),A=d(r,u,"resolveExtensions",we),v=d(r,u,"nodePaths",we),c=d(r,u,"mainFields",we),m=d(r,u,"conditions",we),w=d(r,u,"external",we),_=d(r,u,"packages",W),L=d(r,u,"alias",Se),h=d(r,u,"loader",Se),S=d(r,u,"outExtension",Se),C=d(r,u,"publicPath",W),a=d(r,u,"entryNames",W),f=d(r,u,"chunkNames",W),I=d(r,u,"assetNames",W),j=d(r,u,"inject",we),J=d(r,u,"banner",Se),de=d(r,u,"footer",Se),O=d(r,u,"entryPoints",Mr),ae=d(r,u,"absWorkingDir",W),te=d(r,u,"stdin",Se),Z=(E=d(r,u,"write",ue))!=null?E:x,Ee=d(r,u,"allowOverwrite",ue),ge=d(r,u,"mangleCache",Se);if(u.plugins=!0,he(r,u,`in ${t}() call`),F&&g.push(`--sourcemap${F===!0?"":`=${F}`}`),ne&&g.push("--bundle"),Ee&&g.push("--allow-overwrite"),Y&&g.push("--splitting"),re&&g.push("--preserve-symlinks"),se&&g.push("--metafile"),U&&g.push(`--outfile=${U}`),pe&&g.push(`--outdir=${pe}`),$&&g.push(`--outbase=${$}`),M&&g.push(`--tsconfig=${M}`),_&&g.push(`--packages=${_}`),A&&g.push(`--resolve-extensions=${be(A,"resolve extension")}`),C&&g.push(`--public-path=${C}`),a&&g.push(`--entry-names=${a}`),f&&g.push(`--chunk-names=${f}`),I&&g.push(`--asset-names=${I}`),c&&g.push(`--main-fields=${be(c,"main field")}`),m&&g.push(`--conditions=${be(m,"condition")}`),w)for(let z of w)g.push(`--external:${xe(z,"external")}`);if(L)for(let z in L){if(z.indexOf("=")>=0)throw new Error(`Invalid package name in alias: ${z}`);g.push(`--alias:${z}=${xe(L[z],"alias",z)}`)}if(J)for(let z in J){if(z.indexOf("=")>=0)throw new Error(`Invalid banner file type: ${z}`);g.push(`--banner:${z}=${xe(J[z],"banner",z)}`)}if(de)for(let z in de){if(z.indexOf("=")>=0)throw new Error(`Invalid footer file type: ${z}`);g.push(`--footer:${z}=${xe(de[z],"footer",z)}`)}if(j)for(let z of j)g.push(`--inject:${xe(z,"inject")}`);if(h)for(let z in h){if(z.indexOf("=")>=0)throw new Error(`Invalid loader extension: ${z}`);g.push(`--loader:${z}=${xe(h[z],"loader",z)}`)}if(S)for(let z in S){if(z.indexOf("=")>=0)throw new Error(`Invalid out extension: ${z}`);g.push(`--out-extension:${z}=${xe(S[z],"out extension",z)}`)}if(O)if(Array.isArray(O))for(let z=0,De=O.length;z<De;z++){let Ae=O[z];if(typeof Ae=="object"&&Ae!==null){let Ie=Object.create(null),Fe=d(Ae,Ie,"in",W),ke=d(Ae,Ie,"out",W);if(he(Ae,Ie,"in entry point at index "+z),Fe===void 0)throw new Error('Missing property "in" for entry point at index '+z);if(ke===void 0)throw new Error('Missing property "out" for entry point at index '+z);T.push([ke,Fe])}else T.push(["",xe(Ae,"entry point at index "+z)])}else for(let z in O)T.push([z,xe(O[z],"entry point",z)]);if(te){let z=Object.create(null),De=d(te,z,"contents",kt),Ae=d(te,z,"resolveDir",W),Ie=d(te,z,"sourcefile",W),Fe=d(te,z,"loader",W);he(te,z,'in "stdin" object'),Ie&&g.push(`--sourcefile=${Ie}`),Fe&&g.push(`--loader=${Fe}`),Ae&&(P=Ae),typeof De=="string"?k=V(De):De instanceof Uint8Array&&(k=De)}let Oe=[];if(v)for(let z of v)z+="",Oe.push(z);return{entries:T,flags:g,write:Z,stdinContents:k,stdinResolveDir:P,absWorkingDir:ae,nodePaths:Oe,mangleCache:Tt(ge)}}function Hr(t,r,i,p){let x=[],E=Object.create(null);hn(x,r,E,i,p),jt(x,r,E);let g=d(r,E,"sourcemap",St),T=d(r,E,"sourcefile",W),u=d(r,E,"loader",W),k=d(r,E,"banner",W),P=d(r,E,"footer",W),F=d(r,E,"mangleCache",Se);return he(r,E,`in ${t}() call`),g&&x.push(`--sourcemap=${g===!0?"external":g}`),T&&x.push(`--sourcefile=${T}`),u&&x.push(`--loader=${u}`),k&&x.push(`--banner=${k}`),P&&x.push(`--footer=${P}`),{flags:x,mangleCache:Tt(F)}}function Vr(t){const r={},i={didClose:!1,reason:""};let p={},x=0,E=0,g=new Uint8Array(16*1024),T=0,u=M=>{let A=T+M.length;if(A>g.length){let c=new Uint8Array(A*2);c.set(g),g=c}g.set(M,T),T+=M.length;let v=0;for(;v+4<=T;){let c=le(g,v);if(v+4+c>T)break;v+=4,re(g.subarray(v,v+c)),v+=c}v>0&&(g.copyWithin(0,v,T),T-=v)},k=M=>{i.didClose=!0,M&&(i.reason=": "+(M.message||M));const A="The service was stopped"+i.reason;for(let v in p)p[v](A,null);p={}},P=(M,A,v)=>{if(i.didClose)return v("The service is no longer running"+i.reason,null);let c=x++;p[c]=(m,w)=>{try{v(m,w)}finally{M&&M.unref()}},M&&M.ref(),t.writeToStdin(X({id:c,isRequest:!0,value:A}))},F=(M,A)=>{if(i.didClose)throw new Error("The service is no longer running"+i.reason);t.writeToStdin(X({id:M,isRequest:!1,value:A}))},ne=(M,A)=>q(null,null,function*(){try{if(A.command==="ping"){F(M,{});return}if(typeof A.key=="number"){const v=r[A.key];if(!v)return;const c=v[A.command];if(c){yield c(M,A);return}}throw new Error("Invalid command: "+A.command)}catch(v){const c=[Ve(v,t,null,void 0,"")];try{F(M,{errors:c})}catch{}}}),Y=!0,re=M=>{if(Y){Y=!1;let v=String.fromCharCode(...M);if(v!=="0.27.7")throw new Error(`Cannot start service: Host version "0.27.7" does not match binary version ${B(v)}`);return}let A=D(M);if(A.isRequest)ne(A.id,A.value);else{let v=p[A.id];delete p[A.id],A.value.error?v(A.value.error,{}):v(null,A.value)}};return{readFromStdout:u,afterClose:k,service:{buildOrContext:({callName:M,refs:A,options:v,isTTY:c,defaultWD:m,callback:w})=>{let _=0;const L=E++,h={},S={ref(){++_===1&&A&&A.ref()},unref(){--_===0&&(delete r[L],A&&A.unref())}};r[L]=h,S.ref(),Jr(M,L,P,F,S,t,h,v,c,m,(C,a)=>{try{w(C,a)}finally{S.unref()}})},transform:({callName:M,refs:A,input:v,options:c,isTTY:m,fs:w,callback:_})=>{const L=It();let h=S=>{try{if(typeof v!="string"&&!(v instanceof Uint8Array))throw new Error('The input to "transform" must be a string or a Uint8Array');let{flags:C,mangleCache:a}=Hr(M,c,m,me),f={command:"transform",flags:C,inputFS:S!==null,input:S!==null?V(S):typeof v=="string"?V(v):v};a&&(f.mangleCache=a),P(A,f,(I,j)=>{if(I)return _(new Error(I),null);let J=Xe(j.errors,L),de=Xe(j.warnings,L),O=1,ae=()=>{if(--O===0){let te={warnings:de,code:j.code,map:j.map,mangleCache:void 0,legalComments:void 0};"legalComments"in j&&(te.legalComments=j==null?void 0:j.legalComments),j.mangleCache&&(te.mangleCache=j==null?void 0:j.mangleCache),_(null,te)}};if(J.length>0)return _(an("Transform failed",J,de),null);j.codeFS&&(O++,w.readFile(j.code,(te,Z)=>{te!==null?_(te,null):(j.code=Z,ae())})),j.mapFS&&(O++,w.readFile(j.map,(te,Z)=>{te!==null?_(te,null):(j.map=Z,ae())})),ae()})}catch(C){let a=[];try{hn(a,c,{},m,me)}catch{}const f=Ve(C,t,L,void 0,"");P(A,{command:"error",flags:a,error:f},()=>{f.detail=L.load(f.detail),_(an("Transform failed",[f],[]),null)})}};if((typeof v=="string"||v instanceof Uint8Array)&&v.length>1024*1024){let S=h;h=()=>w.writeFile(v,S)}h(null)},formatMessages:({callName:M,refs:A,messages:v,options:c,callback:m})=>{if(!c)throw new Error(`Missing second argument in ${M}() call`);let w={},_=d(c,w,"kind",W),L=d(c,w,"color",ue),h=d(c,w,"terminalWidth",He);if(he(c,w,`in ${M}() call`),_===void 0)throw new Error(`Missing "kind" in ${M}() call`);if(_!=="error"&&_!=="warning")throw new Error(`Expected "kind" to be "error" or "warning" in ${M}() call`);let S={command:"format-msgs",messages:Le(v,"messages",null,"",h),isWarning:_==="warning"};L!==void 0&&(S.color=L),h!==void 0&&(S.terminalWidth=h),P(A,S,(C,a)=>{if(C)return m(new Error(C),null);m(null,a.messages)})},analyzeMetafile:({callName:M,refs:A,metafile:v,options:c,callback:m})=>{c===void 0&&(c={});let w={},_=d(c,w,"color",ue),L=d(c,w,"verbose",ue);he(c,w,`in ${M}() call`);let h={command:"analyze-metafile",metafile:v};_!==void 0&&(h.color=_),L!==void 0&&(h.verbose=L),P(A,h,(S,C)=>{if(S)return m(new Error(S),null);m(null,C.result)})}}}}function Jr(t,r,i,p,x,E,g,T,u,k,P){const F=It(),ne=t==="context",Y=(U,pe)=>{const $=[];try{hn($,T,{},u,Q)}catch{}const M=Ve(U,E,F,void 0,pe);i(x,{command:"error",flags:$,error:M},()=>{M.detail=F.load(M.detail),P(an(ne?"Context failed":"Build failed",[M],[]),null)})};let re;if(typeof T=="object"){const U=T.plugins;if(U!==void 0){if(!Array.isArray(U))return Y(new Error('"plugins" must be an array'),"");re=U}}if(re&&re.length>0){if(E.isSync)return Y(new Error("Cannot use plugins in synchronous API calls"),"");Gr(r,i,p,x,E,g,T,re,F).then(U=>{if(!U.ok)return Y(U.error,U.pluginName);try{se(U.requestPlugins,U.runOnEndCallbacks,U.scheduleOnDisposeCallbacks)}catch(pe){Y(pe,"")}},U=>Y(U,""));return}try{se(null,(U,pe)=>pe([],[]),()=>{})}catch(U){Y(U,"")}function se(U,pe,$){const M=E.hasFS,{entries:A,flags:v,write:c,stdinContents:m,stdinResolveDir:w,absWorkingDir:_,nodePaths:L,mangleCache:h}=zr(t,T,u,Q,M);if(c&&!E.hasFS)throw new Error('The "write" option is unavailable in this environment');const S={command:"build",key:r,entries:A,flags:v,write:c,stdinContents:m,stdinResolveDir:w,absWorkingDir:_||k,nodePaths:L,context:ne};U&&(S.plugins=U),h&&(S.mangleCache=h);const C=(I,j)=>{const J={errors:Xe(I.errors,F),warnings:Xe(I.warnings,F),outputFiles:void 0,metafile:void 0,mangleCache:void 0},de=J.errors.slice(),O=J.warnings.slice();I.outputFiles&&(J.outputFiles=I.outputFiles.map(Kr)),I.metafile&&I.metafile.length&&(J.metafile=Yr(I.metafile)),I.mangleCache&&(J.mangleCache=I.mangleCache),I.writeToStdout!==void 0&&console.log(ie(I.writeToStdout).replace(/\n$/,"")),pe(J,(ae,te)=>{if(de.length>0||ae.length>0){const Z=an("Build failed",de.concat(ae),O.concat(te));return j(Z,null,ae,te)}j(null,J,ae,te)})};let a,f;ne&&(g["on-end"]=(I,j)=>new Promise(J=>{C(j,(de,O,ae,te)=>{const Z={errors:ae,warnings:te};f&&f(de,O),a=void 0,f=void 0,p(I,Z),J()})})),i(x,S,(I,j)=>{if(I)return P(new Error(I),null);if(!ne)return C(j,(O,ae)=>($(),P(O,ae)));if(j.errors.length>0)return P(an("Context failed",j.errors,j.warnings),null);let J=!1;const de={rebuild:()=>(a||(a=new Promise((O,ae)=>{let te;f=(Ee,ge)=>{te||(te=()=>Ee?ae(Ee):O(ge))};const Z=()=>{i(x,{command:"rebuild",key:r},(ge,Oe)=>{ge?ae(new Error(ge)):te?te():Z()})};Z()})),a),watch:(O={})=>new Promise((ae,te)=>{if(!E.hasFS)throw new Error('Cannot use the "watch" API in this environment');const Z={},Ee=d(O,Z,"delay",He);he(O,Z,"in watch() call");const ge={command:"watch",key:r};Ee&&(ge.delay=Ee),i(x,ge,Oe=>{Oe?te(new Error(Oe)):ae(void 0)})}),serve:(O={})=>new Promise((ae,te)=>{if(!E.hasFS)throw new Error('Cannot use the "serve" API in this environment');const Z={},Ee=d(O,Z,"port",Rr),ge=d(O,Z,"host",W),Oe=d(O,Z,"servedir",W),z=d(O,Z,"keyfile",W),De=d(O,Z,"certfile",W),Ae=d(O,Z,"fallback",W),Ie=d(O,Z,"cors",Se),Fe=d(O,Z,"onRequest",xt);he(O,Z,"in serve() call");const ke={command:"serve",key:r,onRequest:!!Fe};if(Ee!==void 0&&(ke.port=Ee),ge!==void 0&&(ke.host=ge),Oe!==void 0&&(ke.servedir=Oe),z!==void 0&&(ke.keyfile=z),De!==void 0&&(ke.certfile=De),Ae!==void 0&&(ke.fallback=Ae),Ie){const ln={},Qe=d(Ie,ln,"origin",At);he(Ie,ln,'on "cors" object'),Array.isArray(Qe)?ke.corsOrigin=Qe:Qe!==void 0&&(ke.corsOrigin=[Qe])}i(x,ke,(ln,Qe)=>{if(ln)return te(new Error(ln));Fe&&(g["serve-request"]=(us,ps)=>{Fe(ps.args),p(us,{})}),ae(Qe)})}),cancel:()=>new Promise(O=>{if(J)return O();i(x,{command:"cancel",key:r},()=>{O()})}),dispose:()=>new Promise(O=>{if(J)return O();J=!0,i(x,{command:"dispose",key:r},()=>{O(),$(),x.unref()})})};x.ref(),P(null,de)})}}var Gr=(t,r,i,p,x,E,g,T,u)=>q(null,null,function*(){let k=[],P=[],F={},ne={},Y=[],re=0,se=0,U=[],pe=!1;T=[...T];for(let A of T){let v={};if(typeof A!="object")throw new Error(`Plugin at index ${se} must be an object`);const c=d(A,v,"name",W);if(typeof c!="string"||c==="")throw new Error(`Plugin at index ${se} is missing a name`);try{let m=d(A,v,"setup",xt);if(typeof m!="function")throw new Error("Plugin is missing a setup function");he(A,v,`on plugin ${B(c)}`);let w={name:c,onStart:!1,onEnd:!1,onResolve:[],onLoad:[]};se++;let L=m({initialOptions:g,resolve:(h,S={})=>{if(!pe)throw new Error('Cannot call "resolve" before plugin setup has completed');if(typeof h!="string")throw new Error("The path to resolve must be a string");let C=Object.create(null),a=d(S,C,"pluginName",W),f=d(S,C,"importer",W),I=d(S,C,"namespace",W),j=d(S,C,"resolveDir",W),J=d(S,C,"kind",W),de=d(S,C,"pluginData",ze),O=d(S,C,"with",Se);return he(S,C,"in resolve() call"),new Promise((ae,te)=>{const Z={command:"resolve",path:h,key:t,pluginName:c};if(a!=null&&(Z.pluginName=a),f!=null&&(Z.importer=f),I!=null&&(Z.namespace=I),j!=null&&(Z.resolveDir=j),J!=null)Z.kind=J;else throw new Error('Must specify "kind" when calling "resolve"');de!=null&&(Z.pluginData=u.store(de)),O!=null&&(Z.with=qr(O,"with")),r(p,Z,(Ee,ge)=>{Ee!==null?te(new Error(Ee)):ae({errors:Xe(ge.errors,u),warnings:Xe(ge.warnings,u),path:ge.path,external:ge.external,sideEffects:ge.sideEffects,namespace:ge.namespace,suffix:ge.suffix,pluginData:u.load(ge.pluginData)})})})},onStart(h){let S='This error came from the "onStart" callback registered here:',C=gn(new Error(S),x,"onStart");k.push({name:c,callback:h,note:C}),w.onStart=!0},onEnd(h){let S='This error came from the "onEnd" callback registered here:',C=gn(new Error(S),x,"onEnd");P.push({name:c,callback:h,note:C}),w.onEnd=!0},onResolve(h,S){let C='This error came from the "onResolve" callback registered here:',a=gn(new Error(C),x,"onResolve"),f={},I=d(h,f,"filter",mn),j=d(h,f,"namespace",W);if(he(h,f,`in onResolve() call for plugin ${B(c)}`),I==null)throw new Error("onResolve() call is missing a filter");let J=re++;F[J]={name:c,callback:S,note:a},w.onResolve.push({id:J,filter:bn(I),namespace:j||""})},onLoad(h,S){let C='This error came from the "onLoad" callback registered here:',a=gn(new Error(C),x,"onLoad"),f={},I=d(h,f,"filter",mn),j=d(h,f,"namespace",W);if(he(h,f,`in onLoad() call for plugin ${B(c)}`),I==null)throw new Error("onLoad() call is missing a filter");let J=re++;ne[J]={name:c,callback:S,note:a},w.onLoad.push({id:J,filter:bn(I),namespace:j||""})},onDispose(h){Y.push(h)},esbuild:x.esbuild});L&&(yield L),U.push(w)}catch(m){return{ok:!1,error:m,pluginName:c}}}E["on-start"]=(A,v)=>q(null,null,function*(){u.clear();let c={errors:[],warnings:[]};yield Promise.all(k.map(m=>q(null,[m],function*({name:w,callback:_,note:L}){try{let h=yield _();if(h!=null){if(typeof h!="object")throw new Error(`Expected onStart() callback in plugin ${B(w)} to return an object`);let S={},C=d(h,S,"errors",Ce),a=d(h,S,"warnings",Ce);he(h,S,`from onStart() callback in plugin ${B(w)}`),C!=null&&c.errors.push(...Le(C,"errors",u,w,void 0)),a!=null&&c.warnings.push(...Le(a,"warnings",u,w,void 0))}}catch(h){c.errors.push(Ve(h,x,u,L&&L(),w))}}))),i(A,c)}),E["on-resolve"]=(A,v)=>q(null,null,function*(){let c={},m="",w,_;for(let L of v.ids)try{({name:m,callback:w,note:_}=F[L]);let h=yield w({path:v.path,importer:v.importer,namespace:v.namespace,resolveDir:v.resolveDir,kind:v.kind,pluginData:u.load(v.pluginData),with:v.with});if(h!=null){if(typeof h!="object")throw new Error(`Expected onResolve() callback in plugin ${B(m)} to return an object`);let S={},C=d(h,S,"pluginName",W),a=d(h,S,"path",W),f=d(h,S,"namespace",W),I=d(h,S,"suffix",W),j=d(h,S,"external",ue),J=d(h,S,"sideEffects",ue),de=d(h,S,"pluginData",ze),O=d(h,S,"errors",Ce),ae=d(h,S,"warnings",Ce),te=d(h,S,"watchFiles",we),Z=d(h,S,"watchDirs",we);he(h,S,`from onResolve() callback in plugin ${B(m)}`),c.id=L,C!=null&&(c.pluginName=C),a!=null&&(c.path=a),f!=null&&(c.namespace=f),I!=null&&(c.suffix=I),j!=null&&(c.external=j),J!=null&&(c.sideEffects=J),de!=null&&(c.pluginData=u.store(de)),O!=null&&(c.errors=Le(O,"errors",u,m,void 0)),ae!=null&&(c.warnings=Le(ae,"warnings",u,m,void 0)),te!=null&&(c.watchFiles=vn(te,"watchFiles")),Z!=null&&(c.watchDirs=vn(Z,"watchDirs"));break}}catch(h){c={id:L,errors:[Ve(h,x,u,_&&_(),m)]};break}i(A,c)}),E["on-load"]=(A,v)=>q(null,null,function*(){let c={},m="",w,_;for(let L of v.ids)try{({name:m,callback:w,note:_}=ne[L]);let h=yield w({path:v.path,namespace:v.namespace,suffix:v.suffix,pluginData:u.load(v.pluginData),with:v.with});if(h!=null){if(typeof h!="object")throw new Error(`Expected onLoad() callback in plugin ${B(m)} to return an object`);let S={},C=d(h,S,"pluginName",W),a=d(h,S,"contents",kt),f=d(h,S,"resolveDir",W),I=d(h,S,"pluginData",ze),j=d(h,S,"loader",W),J=d(h,S,"errors",Ce),de=d(h,S,"warnings",Ce),O=d(h,S,"watchFiles",we),ae=d(h,S,"watchDirs",we);he(h,S,`from onLoad() callback in plugin ${B(m)}`),c.id=L,C!=null&&(c.pluginName=C),a instanceof Uint8Array?c.contents=a:a!=null&&(c.contents=V(a)),f!=null&&(c.resolveDir=f),I!=null&&(c.pluginData=u.store(I)),j!=null&&(c.loader=j),J!=null&&(c.errors=Le(J,"errors",u,m,void 0)),de!=null&&(c.warnings=Le(de,"warnings",u,m,void 0)),O!=null&&(c.watchFiles=vn(O,"watchFiles")),ae!=null&&(c.watchDirs=vn(ae,"watchDirs"));break}}catch(h){c={id:L,errors:[Ve(h,x,u,_&&_(),m)]};break}i(A,c)});let $=(A,v)=>v([],[]);P.length>0&&($=(A,v)=>{q(null,null,function*(){const c=[],m=[];for(const{name:w,callback:_,note:L}of P){let h,S;try{const C=yield _(A);if(C!=null){if(typeof C!="object")throw new Error(`Expected onEnd() callback in plugin ${B(w)} to return an object`);let a={},f=d(C,a,"errors",Ce),I=d(C,a,"warnings",Ce);he(C,a,`from onEnd() callback in plugin ${B(w)}`),f!=null&&(h=Le(f,"errors",u,w,void 0)),I!=null&&(S=Le(I,"warnings",u,w,void 0))}}catch(C){h=[Ve(C,x,u,L&&L(),w)]}if(h){c.push(...h);try{A.errors.push(...h)}catch{}}if(S){m.push(...S);try{A.warnings.push(...S)}catch{}}}v(c,m)})});let M=()=>{for(const A of Y)setTimeout(()=>A(),0)};return pe=!0,{ok:!0,requestPlugins:U,runOnEndCallbacks:$,scheduleOnDisposeCallbacks:M}});function It(){const t=new Map;let r=0;return{clear(){t.clear()},load(i){return t.get(i)},store(i){if(i===void 0)return-1;const p=r++;return t.set(p,i),p}}}function gn(t,r,i){let p,x=!1;return()=>{if(x)return p;x=!0;try{let E=(t.stack+"").split(`
`);E.splice(1,1);let g=Pt(r,E,i);if(g)return p={text:t.message,location:g},p}catch{}}}function Ve(t,r,i,p,x){let E="Internal error",g=null;try{E=(t&&t.message||t)+""}catch{}try{g=Pt(r,(t.stack+"").split(`
`),"")}catch{}return{id:"",pluginName:x,text:E,location:g,notes:p?[p]:[],detail:i?i.store(t):-1}}function Pt(t,r,i){let p="    at ";if(t.readFileSync&&!r[0].startsWith(p)&&r[1].startsWith(p))for(let x=1;x<r.length;x++){let E=r[x];if(E.startsWith(p))for(E=E.slice(p.length);;){let g=/^(?:new |async )?\S+ \((.*)\)$/.exec(E);if(g){E=g[1];continue}if(g=/^eval at \S+ \((.*)\)(?:, \S+:\d+:\d+)?$/.exec(E),g){E=g[1];continue}if(g=/^(\S+):(\d+):(\d+)$/.exec(E),g){let T;try{T=t.readFileSync(g[1],"utf8")}catch{break}let u=T.split(/\r\n|\r|\n|\u2028|\u2029/)[+g[2]-1]||"",k=+g[3]-1,P=u.slice(k,k+i.length)===i?i.length:0;return{file:g[1],namespace:"file",line:+g[2],column:V(u.slice(0,k)).length,length:V(u.slice(k,k+P)).length,lineText:u+`
`+r.slice(1).join(`
`),suggestion:""}}break}}return null}function an(t,r,i){let p=5;t+=r.length<1?"":` with ${r.length} error${r.length<2?"":"s"}:`+r.slice(0,p+1).map((E,g)=>{if(g===p)return`
...`;if(!E.location)return`
error: ${E.text}`;let{file:T,line:u,column:k}=E.location,P=E.pluginName?`[plugin: ${E.pluginName}] `:"";return`
${T}:${u}:${k}: ERROR: ${P}${E.text}`}).join("");let x=new Error(t);for(const[E,g]of[["errors",r],["warnings",i]])Object.defineProperty(x,E,{configurable:!0,enumerable:!0,get:()=>g,set:T=>Object.defineProperty(x,E,{configurable:!0,enumerable:!0,value:T})});return x}function Xe(t,r){for(const i of t)i.detail=r.load(i.detail);return t}function _t(t,r,i){if(t==null)return null;let p={},x=d(t,p,"file",W),E=d(t,p,"namespace",W),g=d(t,p,"line",He),T=d(t,p,"column",He),u=d(t,p,"length",He),k=d(t,p,"lineText",W),P=d(t,p,"suggestion",W);if(he(t,p,r),k){const F=k.slice(0,(T&&T>0?T:0)+(u&&u>0?u:0)+(i&&i>0?i:80));!/[\x7F-\uFFFF]/.test(F)&&!/\n/.test(k)&&(k=F)}return{file:x||"",namespace:E||"",line:g||0,column:T||0,length:u||0,lineText:k||"",suggestion:P||""}}function Le(t,r,i,p,x){let E=[],g=0;for(const T of t){let u={},k=d(T,u,"id",W),P=d(T,u,"pluginName",W),F=d(T,u,"text",W),ne=d(T,u,"location",Et),Y=d(T,u,"notes",Ce),re=d(T,u,"detail",ze),se=`in element ${g} of "${r}"`;he(T,u,se);let U=[];if(Y)for(const pe of Y){let $={},M=d(pe,$,"text",W),A=d(pe,$,"location",Et);he(pe,$,se),U.push({text:M||"",location:_t(A,se,x)})}E.push({id:k||"",pluginName:P||p,text:F||"",location:_t(ne,se,x),notes:U,detail:i?i.store(re):-1}),g++}return E}function vn(t,r){const i=[];for(const p of t){if(typeof p!="string")throw new Error(`${B(r)} must be an array of strings`);i.push(p)}return i}function qr(t,r){const i=Object.create(null);for(const p in t){const x=t[p];if(typeof x!="string")throw new Error(`key ${B(p)} in object ${B(r)} must be a string`);i[p]=x}return i}function Kr({path:t,contents:r,hash:i}){let p=null;return{path:t,contents:r,hash:i,get text(){const x=this.contents;return(p===null||x!==r)&&(r=x,p=ie(x)),p}}}function bn(t){let r=t.source;return t.flags&&(r=`(?${t.flags})${r}`),r}function Yr(t){let r;try{r=ie(t)}catch{return G(t)}return JSON.parse(r)}var Xr="0.27.7",Qr=t=>on().build(t),Zr=t=>on().context(t),es=(t,r)=>on().transform(t,r),ns=(t,r)=>on().formatMessages(t,r),ts=(t,r)=>on().analyzeMetafile(t,r),rs=()=>{throw new Error('The "buildSync" API only works in node')},ss=()=>{throw new Error('The "transformSync" API only works in node')},as=()=>{throw new Error('The "formatMessagesSync" API only works in node')},is=()=>{throw new Error('The "analyzeMetafileSync" API only works in node')},os=()=>(yn&&yn(),Promise.resolve()),Je,yn,wn,on=()=>{if(wn)return wn;throw Je?new Error('You need to wait for the promise returned from "initialize" to be resolved before calling this'):new Error('You need to call "initialize" before calling this')},ls=t=>{t=Wr(t||{});let r=t.wasmURL,i=t.wasmModule,p=t.worker!==!1;if(!r&&!i)throw new Error('Must provide either the "wasmURL" option or the "wasmModule" option');if(Je)throw new Error('Cannot call "initialize" more than once');return Je=cs(r||"",i,p),Je.catch(()=>{Je=void 0}),Je},cs=(t,r,i)=>q(null,null,function*(){let p,x;const E=new Promise(F=>x=F);if(i){let F=new Blob([`onmessage=((postMessage) => {
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
    })(postMessage)`],{type:"text/javascript"});p=new Worker(URL.createObjectURL(F))}else{let F=(Y=>{var re=($,M,A)=>new Promise((v,c)=>{var m=L=>{try{_(A.next(L))}catch(h){c(h)}},w=L=>{try{_(A.throw(L))}catch(h){c(h)}},_=L=>L.done?v(L.value):Promise.resolve(L.value).then(m,w);_((A=A.apply($,M)).next())});let se,U={};for(let $=self;$;$=Object.getPrototypeOf($))for(let M of Object.getOwnPropertyNames($))M in U||Object.defineProperty(U,M,{get:()=>self[M]});(()=>{const $=()=>{const v=new Error("not implemented");return v.code="ENOSYS",v};if(!U.fs){let v="";U.fs={constants:{O_WRONLY:-1,O_RDWR:-1,O_CREAT:-1,O_TRUNC:-1,O_APPEND:-1,O_EXCL:-1,O_DIRECTORY:-1},writeSync(c,m){v+=A.decode(m);const w=v.lastIndexOf(`
`);return w!=-1&&(console.log(v.substring(0,w)),v=v.substring(w+1)),m.length},write(c,m,w,_,L,h){if(w!==0||_!==m.length||L!==null){h($());return}const S=this.writeSync(c,m);h(null,S)},chmod(c,m,w){w($())},chown(c,m,w,_){_($())},close(c,m){m($())},fchmod(c,m,w){w($())},fchown(c,m,w,_){_($())},fstat(c,m){m($())},fsync(c,m){m(null)},ftruncate(c,m,w){w($())},lchown(c,m,w,_){_($())},link(c,m,w){w($())},lstat(c,m){m($())},mkdir(c,m,w){w($())},open(c,m,w,_){_($())},read(c,m,w,_,L,h){h($())},readdir(c,m){m($())},readlink(c,m){m($())},rename(c,m,w){w($())},rmdir(c,m){m($())},stat(c,m){m($())},symlink(c,m,w){w($())},truncate(c,m,w){w($())},unlink(c,m){m($())},utimes(c,m,w,_){_($())}}}if(U.process||(U.process={getuid(){return-1},getgid(){return-1},geteuid(){return-1},getegid(){return-1},getgroups(){throw $()},pid:-1,ppid:-1,umask(){throw $()},cwd(){throw $()},chdir(){throw $()}}),U.path||(U.path={resolve(...v){return v.join("/")}}),!U.crypto)throw new Error("globalThis.crypto is not available, polyfill required (crypto.getRandomValues only)");if(!U.performance)throw new Error("globalThis.performance is not available, polyfill required (performance.now only)");if(!U.TextEncoder)throw new Error("globalThis.TextEncoder is not available, polyfill required");if(!U.TextDecoder)throw new Error("globalThis.TextDecoder is not available, polyfill required");const M=new TextEncoder("utf-8"),A=new TextDecoder("utf-8");U.Go=class{constructor(){this.argv=["js"],this.env={},this.exit=a=>{a!==0&&console.warn("exit code:",a)},this._exitPromise=new Promise(a=>{this._resolveExitPromise=a}),this._pendingEvent=null,this._scheduledTimeouts=new Map,this._nextCallbackTimeoutID=1;const v=(a,f)=>{this.mem.setUint32(a+0,f,!0),this.mem.setUint32(a+4,Math.floor(f/4294967296),!0)},c=a=>{const f=this.mem.getUint32(a+0,!0),I=this.mem.getInt32(a+4,!0);return f+I*4294967296},m=a=>{const f=this.mem.getFloat64(a,!0);if(f===0)return;if(!isNaN(f))return f;const I=this.mem.getUint32(a,!0);return this._values[I]},w=(a,f)=>{if(typeof f=="number"&&f!==0){if(isNaN(f)){this.mem.setUint32(a+4,2146959360,!0),this.mem.setUint32(a,0,!0);return}this.mem.setFloat64(a,f,!0);return}if(f===void 0){this.mem.setFloat64(a,0,!0);return}let j=this._ids.get(f);j===void 0&&(j=this._idPool.pop(),j===void 0&&(j=this._values.length),this._values[j]=f,this._goRefCounts[j]=0,this._ids.set(f,j)),this._goRefCounts[j]++;let J=0;switch(typeof f){case"object":f!==null&&(J=1);break;case"string":J=2;break;case"symbol":J=3;break;case"function":J=4;break}this.mem.setUint32(a+4,2146959360|J,!0),this.mem.setUint32(a,j,!0)},_=a=>{const f=c(a+0),I=c(a+8);return new Uint8Array(this._inst.exports.mem.buffer,f,I)},L=a=>{const f=c(a+0),I=c(a+8),j=new Array(I);for(let J=0;J<I;J++)j[J]=m(f+J*8);return j},h=a=>{const f=c(a+0),I=c(a+8);return A.decode(new DataView(this._inst.exports.mem.buffer,f,I))},S=(a,f)=>(this._inst.exports.testExport0(),this._inst.exports.testExport(a,f)),C=Date.now()-performance.now();this.importObject={_gotest:{add:(a,f)=>a+f,callExport:S},gojs:{"runtime.wasmExit":a=>{a>>>=0;const f=this.mem.getInt32(a+8,!0);this.exited=!0,delete this._inst,delete this._values,delete this._goRefCounts,delete this._ids,delete this._idPool,this.exit(f)},"runtime.wasmWrite":a=>{a>>>=0;const f=c(a+8),I=c(a+16),j=this.mem.getInt32(a+24,!0);U.fs.writeSync(f,new Uint8Array(this._inst.exports.mem.buffer,I,j))},"runtime.resetMemoryDataView":a=>{this.mem=new DataView(this._inst.exports.mem.buffer)},"runtime.nanotime1":a=>{a>>>=0,v(a+8,(C+performance.now())*1e6)},"runtime.walltime":a=>{a>>>=0;const f=new Date().getTime();v(a+8,f/1e3),this.mem.setInt32(a+16,f%1e3*1e6,!0)},"runtime.scheduleTimeoutEvent":a=>{a>>>=0;const f=this._nextCallbackTimeoutID;this._nextCallbackTimeoutID++,this._scheduledTimeouts.set(f,setTimeout(()=>{for(this._resume();this._scheduledTimeouts.has(f);)console.warn("scheduleTimeoutEvent: missed timeout event"),this._resume()},c(a+8))),this.mem.setInt32(a+16,f,!0)},"runtime.clearTimeoutEvent":a=>{a>>>=0;const f=this.mem.getInt32(a+8,!0);clearTimeout(this._scheduledTimeouts.get(f)),this._scheduledTimeouts.delete(f)},"runtime.getRandomData":a=>{a>>>=0,crypto.getRandomValues(_(a+8))},"syscall/js.finalizeRef":a=>{a>>>=0;const f=this.mem.getUint32(a+8,!0);if(this._goRefCounts[f]--,this._goRefCounts[f]===0){const I=this._values[f];this._values[f]=null,this._ids.delete(I),this._idPool.push(f)}},"syscall/js.stringVal":a=>{a>>>=0,w(a+24,h(a+8))},"syscall/js.valueGet":a=>{a>>>=0;const f=Reflect.get(m(a+8),h(a+16));a=this._inst.exports.getsp()>>>0,w(a+32,f)},"syscall/js.valueSet":a=>{a>>>=0,Reflect.set(m(a+8),h(a+16),m(a+32))},"syscall/js.valueDelete":a=>{a>>>=0,Reflect.deleteProperty(m(a+8),h(a+16))},"syscall/js.valueIndex":a=>{a>>>=0,w(a+24,Reflect.get(m(a+8),c(a+16)))},"syscall/js.valueSetIndex":a=>{a>>>=0,Reflect.set(m(a+8),c(a+16),m(a+24))},"syscall/js.valueCall":a=>{a>>>=0;try{const f=m(a+8),I=Reflect.get(f,h(a+16)),j=L(a+32),J=Reflect.apply(I,f,j);a=this._inst.exports.getsp()>>>0,w(a+56,J),this.mem.setUint8(a+64,1)}catch(f){a=this._inst.exports.getsp()>>>0,w(a+56,f),this.mem.setUint8(a+64,0)}},"syscall/js.valueInvoke":a=>{a>>>=0;try{const f=m(a+8),I=L(a+16),j=Reflect.apply(f,void 0,I);a=this._inst.exports.getsp()>>>0,w(a+40,j),this.mem.setUint8(a+48,1)}catch(f){a=this._inst.exports.getsp()>>>0,w(a+40,f),this.mem.setUint8(a+48,0)}},"syscall/js.valueNew":a=>{a>>>=0;try{const f=m(a+8),I=L(a+16),j=Reflect.construct(f,I);a=this._inst.exports.getsp()>>>0,w(a+40,j),this.mem.setUint8(a+48,1)}catch(f){a=this._inst.exports.getsp()>>>0,w(a+40,f),this.mem.setUint8(a+48,0)}},"syscall/js.valueLength":a=>{a>>>=0,v(a+16,parseInt(m(a+8).length))},"syscall/js.valuePrepareString":a=>{a>>>=0;const f=M.encode(String(m(a+8)));w(a+16,f),v(a+24,f.length)},"syscall/js.valueLoadString":a=>{a>>>=0;const f=m(a+8);_(a+16).set(f)},"syscall/js.valueInstanceOf":a=>{a>>>=0,this.mem.setUint8(a+24,m(a+8)instanceof m(a+16)?1:0)},"syscall/js.copyBytesToGo":a=>{a>>>=0;const f=_(a+8),I=m(a+32);if(!(I instanceof Uint8Array||I instanceof Uint8ClampedArray)){this.mem.setUint8(a+48,0);return}const j=I.subarray(0,f.length);f.set(j),v(a+40,j.length),this.mem.setUint8(a+48,1)},"syscall/js.copyBytesToJS":a=>{a>>>=0;const f=m(a+8),I=_(a+16);if(!(f instanceof Uint8Array||f instanceof Uint8ClampedArray)){this.mem.setUint8(a+48,0);return}const j=I.subarray(0,f.length);f.set(j),v(a+40,j.length),this.mem.setUint8(a+48,1)},debug:a=>{console.log(a)}}}}run(v){return re(this,null,function*(){if(!(v instanceof WebAssembly.Instance))throw new Error("Go.run: WebAssembly.Instance expected");this._inst=v,this.mem=new DataView(this._inst.exports.mem.buffer),this._values=[NaN,0,null,!0,!1,U,this],this._goRefCounts=new Array(this._values.length).fill(1/0),this._ids=new Map([[0,1],[null,2],[!0,3],[!1,4],[U,5],[this,6]]),this._idPool=[],this.exited=!1;let c=4096;const m=C=>{const a=c,f=M.encode(C+"\0");return new Uint8Array(this.mem.buffer,c,f.length).set(f),c+=f.length,c%8!==0&&(c+=8-c%8),a},w=this.argv.length,_=[];this.argv.forEach(C=>{_.push(m(C))}),_.push(0),Object.keys(this.env).sort().forEach(C=>{_.push(m(`${C}=${this.env[C]}`))}),_.push(0);const h=c;if(_.forEach(C=>{this.mem.setUint32(c,C,!0),this.mem.setUint32(c+4,0,!0),c+=8}),c>=12288)throw new Error("total length of command line and environment variables exceeds limit");this._inst.exports.run(w,h),this.exited&&this._resolveExitPromise(),yield this._exitPromise})}_resume(){if(this.exited)throw new Error("Go program has already exited");this._inst.exports.resume(),this.exited&&this._resolveExitPromise()}_makeFuncWrapper(v){const c=this;return function(){const m={id:v,this:this,args:arguments};return c._pendingEvent=m,c._resume(),m.result}}}})(),se=({data:$})=>{let M=new TextDecoder,A=U.fs,v="";A.writeSync=(L,h)=>{if(L===1)Y(h);else if(L===2){v+=M.decode(h);let S=v.split(`
`);S.length>1&&console.log(S.slice(0,-1).join(`
`)),v=S[S.length-1]}else throw new Error("Bad write");return h.length};let c=[],m,w=0;se=({data:L})=>(L.length>0&&(c.push(L),m&&m()),_),A.read=(L,h,S,C,a,f)=>{if(L!==0||S!==0||C!==h.length||a!==null)throw new Error("Bad read");if(c.length===0){m=()=>A.read(L,h,S,C,a,f);return}let I=c[0],j=Math.max(0,Math.min(C,I.length-w));h.set(I.subarray(w,w+j),S),w+=j,w===I.length&&(c.shift(),w=0),f(null,j)};let _=new U.Go;return _.argv=["","--service=0.27.7"],pe($,_).then(L=>{Y(null),_.run(L)},L=>{Y(L)}),_};function pe($,M){return re(this,null,function*(){if($ instanceof WebAssembly.Module)return WebAssembly.instantiate($,M.importObject);const A=yield fetch($);if(!A.ok)throw new Error(`Failed to download ${JSON.stringify($)}`);if("instantiateStreaming"in WebAssembly&&/^application\/wasm($|;)/i.test(A.headers.get("Content-Type")||""))return(yield WebAssembly.instantiateStreaming(A,M.importObject)).instance;const v=yield A.arrayBuffer();return(yield WebAssembly.instantiate(v,M.importObject)).instance})}return $=>se($)})(Y=>p.onmessage({data:Y})),ne;p={onmessage:null,postMessage:Y=>setTimeout(()=>{try{ne=F({data:Y})}catch(re){x(re)}}),terminate(){if(ne)for(let Y of ne._scheduledTimeouts.values())clearTimeout(Y)}}}let g,T;const u=new Promise((F,ne)=>{g=F,T=ne});p.onmessage=({data:F})=>{p.onmessage=({data:ne})=>k(ne),F?T(F):g()},p.postMessage(r||new URL(t,location.href).toString());let{readFromStdout:k,service:P}=Vr({writeToStdin(F){p.postMessage(F)},isSync:!1,hasFS:!1,esbuild:H});yield u,yn=()=>{p.terminate(),Je=void 0,yn=void 0,wn=void 0},wn={build:F=>new Promise((ne,Y)=>{E.then(Y),P.buildOrContext({callName:"build",refs:null,options:F,isTTY:!1,defaultWD:"/",callback:(re,se)=>re?Y(re):ne(se)})}),context:F=>new Promise((ne,Y)=>{E.then(Y),P.buildOrContext({callName:"context",refs:null,options:F,isTTY:!1,defaultWD:"/",callback:(re,se)=>re?Y(re):ne(se)})}),transform:(F,ne)=>new Promise((Y,re)=>{E.then(re),P.transform({callName:"transform",refs:null,input:F,options:ne||{},isTTY:!1,fs:{readFile(se,U){U(new Error("Internal error"),null)},writeFile(se,U){U(null)}},callback:(se,U)=>se?re(se):Y(U)})}),formatMessages:(F,ne)=>new Promise((Y,re)=>{E.then(re),P.formatMessages({callName:"formatMessages",refs:null,messages:F,options:ne,callback:(se,U)=>se?re(se):Y(U)})}),analyzeMetafile:(F,ne)=>new Promise((Y,re)=>{E.then(re),P.analyzeMetafile({callName:"analyzeMetafile",refs:null,metafile:typeof F=="string"?F:JSON.stringify(F),options:ne,callback:(se,U)=>se?re(se):Y(U)})})}}),ds=H})(e)})(qn)),qn.exports}var $t=_a();const Ca="/asljs/assets/esbuild-B7pGHhMe.wasm";function nn(){return crypto.randomUUID()}function je(){return new Date().toISOString()}function R(e){const n=document.getElementById(e);if(n===null)throw new Error(`Missing element #${e}`);return n}const La=R("app-workspace"),Oa=R("first-app-setup"),ut=R("first-api-key-input"),tn=R("first-app-name-input"),Da=R("btn-create-first-app"),Fa=R("btn-create-todo-sample"),un=R("panels"),Na=R("panel-chat"),Ra=R("panel-editor"),nt=R("app-select"),tt=R("file-select"),pt=R("file-content"),ft=R("chat-messages"),Ma=R("chat-progress"),rt=R("chat-input"),cr=R("btn-generate"),$a=R("btn-run"),Ua=R("btn-refresh-preview"),_n=R("preview-frame"),Ba=R("btn-new-app"),Wa=R("btn-import"),za=R("btn-project-settings"),Ha=R("btn-share"),Va=R("btn-settings"),Ja=R("btn-agent-instructions"),Cn=R("btn-toggle-chat"),Ln=R("btn-toggle-files"),On=R("settings-modal"),Ga=R("btn-close-settings"),qa=R("btn-save-settings"),Ka=R("btn-cancel-settings"),st=R("api-key-input"),dr=R("model-select"),ur=R("theme-select"),pr=R("font-size-input"),fr=R("max-tool-steps-input"),pn=R("name-modal"),Ya=R("name-modal-title"),kn=R("app-name-input"),Bn=R("btn-confirm-name"),Xa=R("btn-cancel-name"),Qa=R("btn-close-name-modal"),Dn=R("project-settings-modal"),en=R("project-name-input"),mr=R("project-author-name-input"),hr=R("project-author-email-input"),Za=R("btn-save-project-settings"),ei=R("btn-delete-project"),ni=R("btn-close-project-settings"),ti=R("btn-close-project-settings-x"),Fn=R("share-modal"),ri=R("btn-close-share"),si=R("btn-close-share-2"),Tn=R("btn-share-link"),ai=R("btn-share-download"),jn=R("btn-share-copy-text"),In=R("btn-share-copy-html"),gr=R("share-minified-input"),Ne=R("share-link-status"),_e=R("share-link-output"),Nn=R("import-file"),Rn=R("agent-instructions-modal"),at=R("agent-instructions-text"),ii=R("btn-close-agent-instructions"),oi=R("btn-close-agent-instructions-2"),li=R("btn-copy-agent-instructions"),vr="asljs-app-builder-settings",br="light",it=14,yr="__new__",wr="__import__",ci="#I!",di=5e3,ui=1e4,pi="https://alexandritesoftware.github.io/asljs/app-builder";let Kn=null,Yn=!1,Pn=0,Sn=null;function mt(){return Kn=Kn??ba({codec:ya(),baseUrl:pi,hashPrefix:ci,maxUrlLength:di}),Kn}function We(){try{const e=localStorage.getItem(vr)??"{}";return JSON.parse(e)}catch{return{}}}function ht(e){localStorage.setItem(vr,JSON.stringify(e))}function Wn(){return We().apiKey??""}function xr(){const e=We().model;return e==="gpt-5.3-codex"||e==="gpt-5.4"?e:Fs}function Er(){const e=We().maxToolSteps;if(!Number.isFinite(e))return dn;const n=Math.floor(e);return n<1?dn:n}function Sr(){return We().theme==="light"?"light":br}function Ar(){const e=We().fontSize;if(!Number.isFinite(e))return it;const n=Math.floor(e);return n<12||n>20?it:n}function kr(){document.body.dataset.theme=Sr(),document.documentElement.style.fontSize=`${Ar()}px`}function fi(e){if(typeof e!="string")return null;const n=e.trim();return n===""?null:n}function sn(){return crypto.randomUUID()}async function mi(e){const n=new Set,s=[];for(const l of e){let o=fi(l.uuid);if((o===null||n.has(o))&&(o=sn()),n.add(o),l.uuid===o){s.push(l);continue}const b={...l,uuid:o,updatedAt:l.updatedAt??je()};await Be(b),s.push(b)}return s}function zn(){return N.apps.find(e=>e.id===N.currentAppId)}async function hi(e){await Be(e),N.apps=N.apps.map(n=>n.id===e.id?e:n)}async function ot(){const e=zn();if(e===void 0)return;const n={...e,uuid:sn(),updatedAt:je()};await hi(n)}const Re=js({getCurrentAppId:()=>N.currentAppId,getFiles:()=>N.files,setFiles:e=>{N.files=e},getActiveFileName:()=>N.activeFileName,setActiveFileName:e=>{N.activeFileName=e},createFileId:nn,saveFile:async e=>{await qt(e),await ot()},deleteFileById:async e=>{await As(e),await ot()},runApp:rn,evaluateInApp:e=>Ks(_n,e),getAppDiagnostics:()=>Ys(_n),wait:e=>new Promise(n=>{window.setTimeout(n,e)})});function Mn(){ta({selectElement:nt,apps:N.apps,currentAppId:N.currentAppId,newActionValue:yr,importActionValue:wr})}function Tr(){La.classList.remove("hidden");const e=N.currentAppId!==null&&N.apps.some(n=>n.id===N.currentAppId);if(Oa.classList.toggle("hidden",e),un.classList.toggle("hidden",!e),!e){ut.value=Wn(),tn.value="";return}gt(),vt()}async function jr(){const e=tn.value.trim();if(e===""){tn.focus();return}const n=ut.value.trim();if(n!==""){const l=We();l.apiKey=n,ht(l)}const s={id:nn(),uuid:sn(),name:e,createdAt:je(),updatedAt:je()};await Be(s),N.apps=[...N.apps,s],await Ke(s.id)}async function gi(){const e=ma("TODO Sample");if(e===null){alert("TODO sample is not available.");return}const n=tn.value.trim(),s=n===""?e.name:n,l=ut.value.trim();if(l!==""){const y=We();y.apiKey=l,ht(y)}const o={id:nn(),uuid:sn(),name:s,author:e.author,createdAt:je(),updatedAt:je()},b=ha(e,o.id,nn);await Be(o),await Kt(o.id,b),N.apps=[...N.apps,o],await Ke(o.id)}function gt(){ra({selectElement:tt,files:N.files,activeFileName:N.activeFileName})}function vt(){sa({textAreaElement:pt,files:N.files,activeFileName:N.activeFileName})}function Ut(e){N.generating=e,aa(cr,e)}function Xn(e,n){ia(Ma,e,n)}function Ge(e,n){oa(ft,e,n)}async function Hn(){if(N.activeFileName===null||N.currentAppId===null)return;const e=N.files.find(s=>s.name===N.activeFileName);if(e===void 0)return;const n=pt.value;e.content!==n&&(e.content=n,await qt(e),await ot())}async function Ke(e){var s;N.currentAppId=e;const n=await Ss(e);N.files=n,N.activeFileName=((s=n[0])==null?void 0:s.name)??null,ft.replaceChildren()}function Ir(){Ya.textContent="New App",kn.value="",pn.classList.remove("hidden"),kn.focus(),Bn.onclick=async()=>{const e=kn.value.trim();if(e==="")return;pn.classList.add("hidden");const n={id:nn(),uuid:sn(),name:e,createdAt:je(),updatedAt:je()};await Be(n),N.apps=[...N.apps,n],await Ke(n.id)}}function bt(){pn.classList.add("hidden"),Bn.onclick=null}function vi(){var n,s;const e=N.apps.find(l=>l.id===N.currentAppId);e!==void 0&&(en.value=e.name,mr.value=((n=e.author)==null?void 0:n.name)??"",hr.value=((s=e.author)==null?void 0:s.email)??"",Dn.classList.remove("hidden"),en.focus(),en.select())}function fn(){Dn.classList.add("hidden")}async function Pr(){const e=N.apps.find(y=>y.id===N.currentAppId);if(e===void 0)return;const n=en.value.trim();if(n===""){en.focus();return}const s=mr.value.trim(),l=hr.value.trim(),o=s!==""||l!==""?{...s!==""?{name:s}:{},...l!==""?{email:l}:{}}:void 0,b={...e,name:n,author:o,updatedAt:je()};await Be(b),N.apps=N.apps.map(y=>y.id===e.id?b:y),fn()}async function bi(){fn(),await yi()}async function yi(){const e=N.apps.find(n=>n.id===N.currentAppId);e!==void 0&&confirm(`Delete "${e.name}"? This cannot be undone.`)&&(await Es(e.id),N.apps=N.apps.filter(n=>n.id!==e.id),N.currentAppId=null,N.files=[],N.activeFileName=null,ft.replaceChildren(),_n.src="about:blank")}async function _r(){const e=rt.value.trim();if(e==="")return;const n=Wn();if(n===""){Ge("assistant","No OpenAI API key set. Open Settings (⚙) to add your key. Generation is optional — you can also create files manually.");return}if(N.currentAppId===null){Ge("assistant","Please create or open an app first.");return}rt.value="",Ge("user",e),Ut(!0),Xn("Starting generation...",!0);try{const s=xr(),l=Er(),o=await $s(e,n,s,Re,{initialToolStepLimit:l,systemPrompt:Qt,onToolStepLimit:async({stepsCompleted:y})=>confirm(`AI reached ${y} tool steps without finishing. Continue for 12 more steps?`),onProgress:y=>{Xn(y,!0)}}),b=N.apps.find(y=>y.id===N.currentAppId);if(b!==void 0){const y={...b,updatedAt:je()};await Be(y),N.apps=N.apps.map(ee=>ee.id===b.id?y:ee)}Ge("assistant",o.summary),rn()}catch(s){const l=s instanceof Error?s.message:String(s);Ge("assistant",`Error: ${l}`)}finally{Xn("",!1),Ut(!1)}}function rn(){Hn().then(()=>{qs(_n,N.files,{hostOpenAiApiKey:Wn()})})}async function wi(){await Hn();const e=zn();if(e===void 0)throw new Error("No app selected.");return da({app:e,files:N.files})}function xi(e){const n=new Blob([JSON.stringify(e)],{type:"application/json"}),s=URL.createObjectURL(n),l=document.createElement("a");l.href=s,l.download=`${e.name.replace(/\s+/g,"-")}.json`,l.click(),URL.revokeObjectURL(s)}async function Cr(){const e=await wi();return gr.checked?Ta(e,Ei):e}async function Ei(e,n){return(await(await Si()).transform(e,{loader:n,minify:!0,target:"es2020"})).code.trim()}async function Si(){return Sn!==null||(Sn=(async()=>(await $t.initialize({wasmURL:Ca,worker:!0}),{transform:$t.transform}))()),Sn}function Ai(e){var b,y;const n=((b=e==null?void 0:e.name)==null?void 0:b.trim())??"",s=((y=e==null?void 0:e.email)==null?void 0:y.trim())??"";return`Author: ${n===""?"Not provided":n}
Email: ${s===""?"Not provided":s}`}function Lr(e){return confirm(`Security warning: You are about to import an application.

${Ai(e.author)}

Although apps run in an isolated browser context, imported code can still be harmful. Be vigilant and only open apps from sources you trust.

Do you want to continue?`)}function An(e){const n=e==="run";un.classList.toggle("chat-collapsed",n),un.classList.toggle("files-collapsed",n),Cn.textContent=n?"Chat ▸":"Chat ▾",Ln.textContent=n?"Files ▸":"Files ▾",Cn.setAttribute("aria-expanded",String(!n)),Ln.setAttribute("aria-expanded",String(!n))}function Bt(){return confirm(`You followed the application link.

Click OK to start the application.
Click Cancel to edit it.`)?"run":"edit"}function Or(){Nn.value="",Nn.click()}async function lt(e,n){const s=ua({payload:e,existingApps:N.apps,navigateToExistingById:n.navigateToExistingById,now:je(),createId:nn,createUuid:sn});return s.kind==="duplicate"?(n.showDuplicateAlert&&alert("Import stopped: an app with the same ID already exists."),null):s.kind==="existing"?(await Ke(s.appId),s.appId):(await Be(s.app),await Kt(s.app.id,s.files),N.apps=[...N.apps,s.app],await Ke(s.app.id),s.app.id)}async function ki(){var n;const e=(n=Nn.files)==null?void 0:n[0];if(e!==void 0)try{const s=await e.text(),l=sr(s);if(!Lr(l))return;await lt(l,{navigateToExistingById:!1,showDuplicateAlert:!0})}catch(s){const l=s instanceof Error?s.message:String(s);alert(`Import failed: ${l}`)}}function Ti(){return mt().readTokenFromHash(window.location.hash)}function Qn(){window.history.pushState(null,"",`${window.location.pathname}${window.location.search}`)}async function Dr(){const e=Ti();if(e===null||e.trim()==="")return!1;if(Yn)return!0;Yn=!0;try{const n=(()=>{try{return decodeURIComponent(e)}catch{return e}})(),s=Nt(e)??Nt(n);if(s!==null)return await lt(s,{navigateToExistingById:!0,showDuplicateAlert:!1})!==null&&(Bt()==="run"?(An("run"),rn()):An("edit")),Qn(),!0;try{const l=await mt().parsePayloadFromToken(e);if(!Lr(l))return Qn(),!0;await lt(l,{navigateToExistingById:!0,showDuplicateAlert:!1})!==null&&(Bt()==="run"?(An("run"),rn()):An("edit"))}catch(l){const o=l instanceof Error?l.message:String(l);alert(`Could not import from share link: ${o}`)}return Qn(),!0}finally{Yn=!1}}async function Fr(){const e=++Pn;_e.value="",Tn.disabled=!0,jn.disabled=!0,In.disabled=!0,Ne.textContent="Preparing share link...";try{const n=await Ii((async()=>{const s=await Cr();return mt().createShareUrl(s)})(),ui,"Preparing share link timed out. Use Download export instead.");if(e!==Pn)return;if(n.exceedsMaxUrlLength){_e.value=n.url,Ne.textContent="Warning: link length exceeds 5000 characters and may not work in all apps, but you can still copy and share it.",Tn.disabled=!1,jn.disabled=!1,In.disabled=!1;return}_e.value=n.url,Ne.textContent="Link is ready. Use copy buttons to share as text or HTML.",Tn.disabled=!1,jn.disabled=!1,In.disabled=!1}catch(n){const s=n instanceof Error?n.message:String(n);e===Pn&&(Ne.textContent=s)}}function ji(){zn()!==void 0&&(Fn.classList.remove("hidden"),Fr())}function yt(){Pn+=1,Fn.classList.add("hidden")}async function Ii(e,n,s){let l;const o=new Promise((b,y)=>{l=globalThis.setTimeout(()=>{y(new Error(s))},n)});try{return await Promise.race([e,o])}finally{l!==void 0&&globalThis.clearTimeout(l)}}async function Pi(){await Nr()}async function Nr(){if(_e.value.trim()!=="")try{await navigator.clipboard.writeText(_e.value),Ne.textContent="Share link copied to clipboard."}catch{_e.focus(),_e.select(),Ne.textContent="Could not copy automatically. Link is selected, copy it manually."}}async function _i(){var l;const e=_e.value.trim();if(e==="")return;const n=((l=zn())==null?void 0:l.name.trim())||"Shared app",s=`<a href="${Wt(e)}">${Wt(n)}</a>`;try{if(typeof ClipboardItem<"u"&&navigator.clipboard.write!==void 0){await navigator.clipboard.write([new ClipboardItem({"text/html":new Blob([s],{type:"text/html"}),"text/plain":new Blob([e],{type:"text/plain"})})]),Ne.textContent="HTML link copied to clipboard.";return}await navigator.clipboard.writeText(e),Ne.textContent="HTML clipboard is unavailable here. URL copied as text."}catch{_e.focus(),_e.select(),Ne.textContent="Could not copy automatically. Link is selected, copy it manually."}}function Wt(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}async function Ci(){const e=await Cr();xi(e)}function Li(){st.value=Wn(),dr.value=xr(),ur.value=Sr(),pr.value=String(Ar()),fr.value=String(Er()),On.classList.remove("hidden"),st.focus()}function Vn(){On.classList.add("hidden")}function Oi(){const e=We();e.apiKey=st.value.trim(),e.model=dr.value==="gpt-5.4"?"gpt-5.4":"gpt-5.3-codex",e.theme=ur.value==="light"?"light":br;const n=Number.parseInt(pr.value,10);e.fontSize=Number.isFinite(n)&&n>=12&&n<=20?n:it;const s=Number.parseInt(fr.value,10);e.maxToolSteps=Number.isFinite(s)&&s>=1?s:dn,ht(e),kr(),Vn()}function Di(){at.value=Qt,Rn.classList.remove("hidden"),at.scrollTop=0}function wt(){Rn.classList.add("hidden")}function Fi(){rr({panelElement:Na,toggleButtonElement:Cn,panelsElement:un,collapsedPanelsClass:"chat-collapsed",expandedLabel:"Chat ▾",collapsedLabel:"Chat ▸"})}function Ni(){rr({panelElement:Ra,toggleButtonElement:Ln,panelsElement:un,collapsedPanelsClass:"files-collapsed",expandedLabel:"Files ▾",collapsedLabel:"Files ▸"})}async function Ri(){const e=at.value;try{await navigator.clipboard.writeText(e),Ge("assistant","Agent instructions copied to clipboard.")}catch{Ge("assistant","Could not copy to clipboard automatically. You can still select and copy from the instructions modal.")}}N.on("set:apps",()=>Mn());N.on("set:currentAppId",()=>{Mn(),Tr()});N.on("set:files",()=>{gt(),vt()});N.on("set:activeFileName",()=>{gt(),vt()});Ba.addEventListener("click",Ir);Wa.addEventListener("click",Or);za.addEventListener("click",vi);Ha.addEventListener("click",()=>{ji()});cr.addEventListener("click",()=>{_r()});$a.addEventListener("click",rn);Ua.addEventListener("click",rn);Va.addEventListener("click",Li);Ja.addEventListener("click",Di);Cn.addEventListener("click",Fi);Ln.addEventListener("click",Ni);Ga.addEventListener("click",Vn);qa.addEventListener("click",Oi);Ka.addEventListener("click",Vn);On.addEventListener("click",e=>{e.target===On&&Vn()});ii.addEventListener("click",wt);oi.addEventListener("click",wt);li.addEventListener("click",()=>{Ri()});Rn.addEventListener("click",e=>{e.target===Rn&&wt()});ri.addEventListener("click",yt);si.addEventListener("click",yt);Tn.addEventListener("click",()=>{Pi()});ai.addEventListener("click",()=>{Ci()});jn.addEventListener("click",()=>{Nr()});In.addEventListener("click",()=>{_i()});gr.addEventListener("change",()=>{Fr()});Fn.addEventListener("click",e=>{e.target===Fn&&yt()});Bn.addEventListener("click",()=>{});Xa.addEventListener("click",bt);Qa.addEventListener("click",bt);pn.addEventListener("click",e=>{e.target===pn&&bt()});Za.addEventListener("click",()=>{Pr()});ei.addEventListener("click",()=>{bi()});ni.addEventListener("click",fn);ti.addEventListener("click",fn);Dn.addEventListener("click",e=>{e.target===Dn&&fn()});kn.addEventListener("keydown",e=>{e.key==="Enter"&&Bn.click()});en.addEventListener("keydown",e=>{e.key==="Enter"&&(e.preventDefault(),Pr())});Da.addEventListener("click",()=>{jr()});Fa.addEventListener("click",()=>{gi()});tn.addEventListener("keydown",e=>{e.key==="Enter"&&(e.preventDefault(),jr())});rt.addEventListener("keydown",e=>{e.key==="Enter"&&!e.shiftKey&&(e.preventDefault(),_r())});nt.addEventListener("change",()=>{const e=nt.value;if(e===yr){Ir(),Mn();return}if(e===wr){Or(),Mn();return}e!==""&&e!==N.currentAppId&&Ke(e)});tt.addEventListener("change",()=>{const e=tt.value;e===""||e===N.activeFileName||(Hn(),N.activeFileName=e)});pt.addEventListener("blur",()=>{Hn()});Nn.addEventListener("change",()=>{ki()});window.listFileset=Re.listFileset;window.readFile=Re.readFile;window.setFileContent=Re.setFileContent;window.replaceFilePart=Re.replaceFilePart;window.deleteFile=Re.deleteFile;window.evalInApp=Re.evalInApp;window.getAppDiagnostics=Re.getAppDiagnostics;window.runAppAndCollectDiagnostics=Re.runAppAndCollectDiagnostics;window.addEventListener("hashchange",()=>{Dr()});async function Mi(){kr();const e=await mi(await xs());if(N.apps=e,!await Dr())if(e.length>0){const s=[...e].sort((l,o)=>o.updatedAt.localeCompare(l.updatedAt));await Ke(s[0].id)}else N.currentAppId=null,N.files=[],N.activeFileName=null,Tr(),tn.focus()}Mi().catch(e=>{console.error("App Builder init failed:",e)});
