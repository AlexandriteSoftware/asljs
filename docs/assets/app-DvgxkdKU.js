(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))s(r);new MutationObserver(r=>{for(const a of r)if(a.type==="childList")for(const i of a.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&s(i)}).observe(document,{childList:!0,subtree:!0});function t(r){const a={};return r.integrity&&(a.integrity=r.integrity),r.referrerPolicy&&(a.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?a.credentials="include":r.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function s(r){if(r.ep)return;r.ep=!0;const a=t(r);fetch(r.href,a)}})();class mn extends Error{constructor(n,t,s,r,a){super(n),this.name="ListenerError",this.error=t,this.object=s,this.event=r,this.listener=a}}function B(e){if(typeof e!="string"&&typeof e!="symbol")throw new TypeError("Expect event to be a string or symbol.")}function ee(e){return typeof e=="function"}function Te(e){if(ee(e))return e}function Je(e){return typeof e=="object"&&e!==null}function le(e){if(!ee(e))throw new TypeError("Expect a function.")}const vn=(e=Object.create(null),n={})=>{if(!Je(e)&&!ee(e))throw new TypeError("Expect an object or a function.");for(const l of["on","once","off","emit","emitAsync","has"])if(l in e)throw new Error(`Method "${l}" already exists.`);const{strict:t=!1,trace:s=null,error:r=null}=n,a=Te(s)??null,i=Te(r)??null,u=e!==R,g=(l,p)=>{a==null||a(l,p),u&&R.emit(l,p)};g("new",{object:e});const j=new Set,v=new Map,y={enumerable:!1,configurable:!0,writable:!0};return Object.defineProperties(e,{on:Object.assign({value:E},y),once:Object.assign({value:x},y),off:Object.assign({value:h},y),emit:Object.assign({value:k},y),emitAsync:Object.assign({value:T},y),has:Object.assign({value:A},y)}),e;function c(l,p){let f=v.get(l);f||v.set(l,f=new Set),f.add(p)}function b(l,p){const f=v.get(l);if(!f)return!1;const w=f.delete(p);return f.size===0&&v.delete(l),w}function m(l,p,f){const w={error:f,object:e,event:l,listener:p};if(i==null||i(w),e===R&&l==="error")throw new mn("Error in a global error listener.",f,e,l,p);R.emit("error",w)}function E(l,p){B(l),le(p),g("on",{object:e,event:l,listener:p}),c(l,p);let f=!0;return()=>f?(f=!1,b(l,p)):!1}function x(l,p){B(l),le(p);const f=E(l,(...w)=>{f(),p(...w)});return f}function h(l,p){return B(l),le(p),g("off",{object:e,event:l,listener:p}),b(l,p)}function A(l){var p;return B(l),(((p=v.get(l))==null?void 0:p.size)??0)>0}function k(l,...p){B(l);const f=v.get(l)||j;if(g("emit",{object:e,listeners:[...f],event:l,args:p}),f.size!==0)for(const w of f)try{w(...p)}catch(O){if(m(l,w,O),t)throw O}}async function T(l,...p){B(l);const f=v.get(l)||j;if(g("emitAsync",{object:e,listeners:[...f],event:l,args:p}),f.size===0)return;const w=[...f].map(async O=>{try{await O(...p)}catch(Le){if(m(l,O,Le),t)throw Le}});await(t?Promise.all(w):Promise.allSettled(w))}},R=vn;R(R);function bn(e){return!Je(e)&&!ee(e)?!1:typeof e.on=="function"}function qe(e){if(bn(e))return e}function L(e){return typeof e=="function"}function ye(e){return typeof e=="object"&&e!==null}function We(e){if(!L(e))throw new TypeError("Expect a function.")}function pe(e){if(e.trim()==="")throw new TypeError("Expect watch path to be a non-empty string.");const n=e.split(".");for(const t of n)if(t.trim()==="")throw new TypeError("Expect watch path segments to be non-empty.");return e.split(".").map(t=>t.trim()).filter(t=>t!=="")}function gn(e,n){const t=pe(n);if(t.length===0)return;let s=e;for(const r of t){if(!ye(s)||!(r in s))return;s=s[r]}return s}const Ge=(e,n,t)=>{if(Array.isArray(e))throw new TypeError("Watching arrays is not supported.");We(t);const s=typeof n=="string"?[n]:n;if(!Array.isArray(s))throw new TypeError("Expect properties to be a string or an array of strings.");for(const i of s){if(typeof i!="string")throw new TypeError("Expect properties to be a string or an array of strings.");pe(i)}const r=()=>s.map(i=>gn(e,i)),a=[];for(const i of s){const u=pe(i);let g=null;const j=()=>{const v=[],y=(c,b)=>{if(!ye(c)||b>=u.length)return;const m=u[b],E=qe(c);if(E){const x=E.on(`set:${m}`,()=>{t(...r()),b<u.length-1&&g&&(g(),g=j())});v.push(x)}b<u.length-1&&y(c[m],b+1)};return y(e,0),()=>v.reduce((c,b)=>b()||c,!1)};g=j(),a.push(()=>g?g():!1)}return t(...r()),()=>a.reduce((i,u)=>u()||i,!1)};function hn(e,n){"watch"in e||Object.defineProperty(e,"watch",{configurable:!0,writable:!0,enumerable:!1,value(t,s){return n(typeof t=="string"?this:this,t,s)}})}function Ie(e,n){return Object.prototype.hasOwnProperty.call(e,n)}function ce(e){if(typeof e=="symbol")return!1;const n=typeof e=="number"?e:Number(e);return!Number.isInteger(n)||n<0||n>=4294967295?!1:typeof e=="number"||e===String(n)}function yn(e){return qe(e)?L(e.emit):!1}const He=(e,n={})=>{const{eventful:t=R,trace:s=null,shallow:r=!1}=n;We(t);const a=ne.options,i=new WeakMap,u=c=>{if(r||!ye(c)||yn(c))return c;if(i.has(c))return i.get(c);const b=He(c,{eventful:t,trace:s,shallow:r});return i.set(c,b),b},g=c=>{if(!r){if(Array.isArray(c)){for(let b=0;b<c.length;b++)c[b]=u(c[b]);return}for(const b of Reflect.ownKeys(c))Ie(c,b)&&(c[b]=u(c[b]))}},j=c=>{const b=Array.isArray(c);g(c),hn(c,Ge);let m;const E=new Proxy(c,{set(x,h,A,k){const T=b&&ce(h),l=Reflect.get(x,h,k),p=Reflect.set(x,h,u(A),k);if(m&&p){const f=Reflect.get(x,h,k);if(!Object.is(l,f)){const w=T?{index:Number(h),value:f,previous:l}:{property:h,value:f,previous:l},O=s||a.trace;m.emit(`set:${String(h)}`,w),L(O)&&O(m,"set",w),m.emit("set",w)}}return p},deleteProperty(x,h){const A=b&&ce(h),k=Ie(x,h),T=k?x[h]:void 0,l=Reflect.deleteProperty(x,h);if(m&&l&&k){const p=A?{index:Number(h),previous:T}:{property:h,previous:T},f=s||a.trace;m.emit(`delete:${String(h)}`,p),L(f)&&f(m,"delete",p),m.emit("delete",p)}return l},defineProperty(x,h,A){const k=Object.getOwnPropertyDescriptor(x,h)??null,T=Object.prototype.hasOwnProperty.call(A,"value")?{...A,value:u(A.value)}:A,l=Reflect.defineProperty(x,h,T),p=b&&(h==="length"||ce(h));if(m&&!p&&l){const f={property:h,descriptor:T,previous:k},w=s||a.trace;m.emit(`define:${String(h)}`,f),L(w)&&w(m,"define",f),m.emit("define",f)}return l}});return m=L(c==null?void 0:c.emit)?E:t(E),m},v=s||a.trace;if(Array.isArray(e)){const c=j(e);return L(v)&&v(c,"new"),c}if(e!==null&&typeof e=="object"){const c=j(e);return L(v)&&v(c,"new",{object:c}),c}const y=t({get value(){return e},set value(c){if(Object.is(c,e))return;const b=e;e=c;const m={property:"value",value:e,previous:b};y.emit("set:value",m),L(v)&&v(y,"set",m),y.emit("set",m)}});return L(v)&&v(y,"new",{object:y}),y},ne=He;ne.options={trace:null};ne.watch=Ge;const o=ne({apps:[],currentAppId:null,files:[],activeFileName:null,generating:!1,error:null});function S(e){return new Promise((n,t)=>{e.addEventListener("success",()=>{n(e.result)}),e.addEventListener("error",()=>{t(e.error??new Error("IndexedDB request failed"))})})}function wn(e,n){return new Promise((t,s)=>{const r=indexedDB.open(e,n.length);r.addEventListener("upgradeneeded",a=>{const i=n.slice(a.oldVersion-1,a.newVersion??n.length-1);for(const u of i)u(r.result)}),r.addEventListener("success",()=>{t(r.result)}),r.addEventListener("blocked",()=>{s(new Error("Database opening is blocked"))}),r.addEventListener("error",()=>{s(r.error??new Error("Failed to open database"))})})}const jn="asljs-app-builder";let H=null;async function D(){return H!==null||(H=await wn(jn,[e=>{e.createObjectStore("apps",{keyPath:"id"}),e.createObjectStore("files",{keyPath:"id"}).createIndex("byAppId","appId",{unique:!1})}])),H}async function xn(){const n=(await D()).transaction("apps","readonly");return S(n.objectStore("apps").getAll())}async function te(e){const t=(await D()).transaction("apps","readwrite");await S(t.objectStore("apps").put(e))}async function En(e){const t=(await D()).transaction(["apps","files"],"readwrite");await S(t.objectStore("apps").delete(e));const s=t.objectStore("files"),r=await S(s.index("byAppId").getAllKeys(e));for(const a of r)await S(s.delete(a))}async function Sn(e){const t=(await D()).transaction("files","readonly");return S(t.objectStore("files").index("byAppId").getAll(e))}async function ue(e){const t=(await D()).transaction("files","readwrite");await S(t.objectStore("files").put(e))}async function An(e){const t=(await D()).transaction("files","readwrite");await S(t.objectStore("files").delete(e))}async function kn(e,n){const r=(await D()).transaction("files","readwrite").objectStore("files"),a=await S(r.index("byAppId").getAllKeys(e));for(const i of a)await S(r.delete(i));for(const i of n)await S(r.put(i))}const Ln=`# observable\r
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
`,Tn=`# eventful\r
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
`,In=`# data-binding\r
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
`,On=`# components\r
\r
> Part of [Alexandrite Software Library][#1] - a set of high-quality,\r
performant JavaScript libraries for everyday use.\r
\r
## Overview\r
\r
\`asljs-components\` is a catalog of reusable UI components for web applications\r
in the ASLJS monorepo.\r
\r
This package is component-oriented: each component has a custom element name,\r
purpose, and usage pattern.\r
\r
## Installation\r
\r
\`\`\`bash\r
npm install asljs-components\r
\`\`\`\r
\r
NPM Package: [asljs-components](https://www.npmjs.com/package/asljs-components)\r
\r
## Components\r
\r
### List\r
\r
- Name: \`List\`\r
- Custom element: \`asljs-list\`\r
- Purpose: render collections from templates with row context binding.\r
\r
Notes:\r
\r
- Uses \`template[data-slot="item"]\` for row rendering.\r
- Supports optional \`template[data-slot="empty"]\` for empty state.\r
- Supports optional \`template[data-slot="container"]\` with required\r
  \`data-role="items"\` insertion point.\r
\r
\`\`\`ts\r
import 'asljs-components';\r
\r
const list =\r
  document.createElement('asljs-list');\r
\r
list.innerHTML = \`\r
  <template data-slot="container">\r
    <section class="rows" data-role="items"></section>\r
  </template>\r
\r
  <template data-slot="empty">\r
    <div>No items</div>\r
  </template>\r
\r
  <template data-slot="item">\r
    <div>\r
      <a data-bind-href="item.url"\r
         data-bind-text="item.title"></a>\r
    </div>\r
  </template>\r
\`;\r
\r
list.items =\r
  [ { title: 'First', url: '/first' },\r
    { title: 'Second', url: '/second' } ];\r
\`\`\`\r
\r
### List API Reference\r
\r
Exports:\r
\r
- \`List\`\r
- \`ListItem\` type\r
- \`ListItemsSource\` type\r
- \`ListRowContext\` type\r
\r
## License\r
\r
MIT License. See [LICENSE](LICENSE.md) for details.\r
\r
[#1]: https://github.com/AlexandriteSoftware/asljs\r
`,Nn=`# dali\r
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
`,Pn=`export {\r
    observable\r
  } from './observable.js';\r
\r
export {\r
    ObservableObject\r
  } from './observable-object.js';\r
\r
export type {\r
    Observable,\r
    ObservableEventsArray,\r
    ObservableEventsObject,\r
    ObservableEventsPrimitive,\r
    ObservableFn,\r
    ObservableGlobalOptions,\r
    ObservableOptions,\r
    ObservableTraceFn,\r
    ObservableWatchFn,\r
    WatchedValues,\r
  } from './types.js';\r
`,Cn=`export {\r
    eventful\r
  } from './eventful.js';\r
\r
export {\r
    type EventfulLike,\r
    isEventfulLike,\r
    asEventfulLike,\r
  } from './eventful-like.js';\r
\r
export {\r
    EventfulBase\r
  } from './eventful-base.js';\r
\r
export {\r
    type EventName,\r
    type EventMap,\r
    type Eventful,\r
    type EventfulFactory,\r
    type EventfulOptions,\r
    type Listener,\r
    ListenerError,\r
    type TraceFn\r
  } from './types.js';\r
`,Rn=`export {\r
    bindDataModel\r
  } from './bind-data-model.js';\r
\r
export {\r
    createBuiltInPipes\r
  } from './pipes.js';\r
\r
export type {\r
    BindDataModelOptions,\r
    DataModel,\r
  } from './types.js';\r
`,Fn=`export {\r
    List,\r
    type ListItem,\r
    type ListItemsSource,\r
    type ListRowContext,\r
  } from './list.js';\r
`,Mn=`export {\r
    dbDelete,\r
    dbOpen,\r
    dbRequestAsync,\r
  } from './db.js';\r
\r
export {\r
    EVENT_SOURCE_STORE_NAME,\r
  EVENT_SOURCE_PROJECTION_STORE_NAME,\r
    eventSourceGetAll,\r
  eventSourceProjectionGet,\r
  eventSourceProjectionSet,\r
  eventSourceProjectionSetup,\r
    eventSourceSetup,\r
  EventSourceManager,\r
  IndexedDbEventSourceAdapter,\r
  EventSourceProjectionManager,\r
  EventSourceConflictError,\r
  type EventSourceAdapter,\r
  type EventSourceEvent,\r
  type EventSourceProjection,\r
  type EventSourceTransaction,\r
  } from './event-source.js';\r
\r
export {\r
    SagaManager,\r
    SAGA_ENTRIES_STORE_NAME,\r
    SAGA_STORE_NAME,\r
    sagaEntriesGetAll,\r
    sagaGetAll,\r
    sagaSetup,\r
    type SagaEntryRecord,\r
    type SagaForwardOperation,\r
    type SagaStatus,\r
    type SagaTransactionRecord,\r
    type SagaUndoOperation,\r
  } from './saga.js';\r
\r
export {\r
    IncrementVersionStrategy as IncrementTableVersionStrategy,\r
  } from './version-strategy-increment.js';\r
\r
export {\r
    type DeleteStrategy as TableDeleteStrategy,\r
  } from './delete-strategy.js';\r
\r
export {\r
    Table,\r
    LiveRecord,\r
    LiveRecordSet,\r
    type TableBroadcastMessage,\r
    type TableBroadcastService,\r
    type TableEvents,\r
    type TableEventsReceiver,\r
    type TableObservedEvent,\r
    type TableObservedReceiver,\r
  } from './table.js';\r
\r
export {\r
    type LiveRecordEvents,\r
    type LiveRecordSetPayload,\r
  } from './live-record.js';\r
\r
export {\r
    type LiveRecordSetEvents,\r
    type LiveRecordSetSetPayload,\r
  } from './live-recordset.js';\r
\r
export {\r
    VersionConflictError as TableVersionConflictError,\r
  } from './version-conflict-error.js';\r
\r
export {\r
    type VersionStrategy as TableVersionStrategy,\r
  } from './version-strategy.js';\r
\r
export {\r
    txDone,\r
    txRead,\r
    txReuseOrCreate,\r
    txWrite,\r
    TxMode,\r
    txEnsure,\r
  } from './transactions.js';\r
\r
export {\r
    UuidSoftDeleteStrategy as UuidSoftDeleteTableDeleteStrategy,\r
  } from './delete-strategy-uuid-soft-delete-strategy.js';\r
\r
export {\r
    UuidVersionStrategy as UuidTableVersionStrategy,\r
  } from './version-strategy-uuid.js';\r
`,Dn=`{
  "name": "asljs-observable",
  "version": "0.5.3",
  "description": "Lightweight observable for JS. Emits events on property changes via on/off/emit. Works with objects, arrays, and primitives.",
  "files": [
    "dist/**",
    "README.md",
    "LICENSE.md"
  ],
  "keywords": [
    "events",
    "javascript",
    "js"
  ],
  "homepage": "https://github.com/AlexandriteSoftware/asljs#readme",
  "bugs": {
    "url": "https://github.com/AlexandriteSoftware/asljs/issues"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/AlexandriteSoftware/asljs.git"
  },
  "license": "MIT",
  "author": "\\"Alex Netkachov\\" <alex.netkachov@gmail.com>",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    }
  },
  "scripts": {
    "clean": "node ../toolkit.js clean-dist",
    "build": "npx tsc -p tsconfig.build.json",
    "build:test": "npx tsc -p tsconfig.test.json",
    "lint": "npx eslint .",
    "lint:fix": "npx eslint . --fix",
    "guard:clean-git": "node ../toolkit.js ensure-clean-working-folder",
    "prepack": "npm run clean && npm run build",
    "prepublishOnly": "npm run guard:clean-git && npm run prepack",
    "postpublish": "node ../toolkit.js tag-commit-with-release-id",
    "test": "npm run build:test && node --test dist/*.test.js",
    "test:watch": "npm run build:test && node --watch --test dist/*.test.js",
    "coverage": "npm run build:test && NODE_V8_COVERAGE=.coverage node --test dist/*.test.js && node -e \\"console.log('Coverage in .coverage (use c8/istanbul if you want reports)')\\""
  },
  "dependencies": {
    "asljs-eventful": "^0.4.8"
  }
}
`,Bn=`{\r
  "name": "asljs-eventful",\r
  "version": "0.4.8",\r
  "description": "Lightweight event helper adding on/off/emit to any object.",\r
  "files": [\r
    "dist/**",\r
    "README.md",\r
    "LICENSE.md"\r
  ],\r
  "keywords": [\r
    "events",\r
    "javascript",\r
    "js"\r
  ],\r
  "homepage": "https://github.com/AlexandriteSoftware/asljs#readme",\r
  "bugs": {\r
    "url": "https://github.com/AlexandriteSoftware/asljs/issues"\r
  },\r
  "repository": {\r
    "type": "git",\r
    "url": "git+https://github.com/AlexandriteSoftware/asljs.git"\r
  },\r
  "license": "MIT",\r
  "author": "\\"Alex Netkachov\\" <alex.netkachov@gmail.com>",\r
  "type": "module",\r
  "main": "dist/index.js",\r
  "types": "dist/index.d.ts",\r
  "exports": {\r
    ".": {\r
      "types": "./dist/index.d.ts",\r
      "default": "./dist/index.js"\r
    }\r
  },\r
  "directories": {\r
    "doc": "docs"\r
  },\r
  "scripts": {\r
    "clean": "node ../toolkit.js clean-dist",\r
    "build": "npx tsc -p tsconfig.build.json",\r
    "build:test": "npx tsc -p tsconfig.test.json",\r
    "lint": "npx eslint .",\r
    "lint:fix": "npx eslint . --fix",\r
    "guard:clean-git": "node ../toolkit.js ensure-clean-working-folder",\r
    "prepack": "npm run clean && npm run build",\r
    "prepublishOnly": "npm run guard:clean-git && npm run prepack",\r
    "postpublish": "node ../toolkit.js tag-commit-with-release-id",\r
    "test": "npm run build:test && node --test dist/*.test.js",\r
    "test:watch": "npm run build:test && node --watch --test dist/*.test.js",\r
    "coverage": "npm run build:test && NODE_V8_COVERAGE=.coverage node --test dist/*.test.js && node -e \\"console.log('Coverage in .coverage (use c8/istanbul if you want reports)')\\""\r
  }\r
}\r
`,$n=`{\r
  "name": "asljs-data-binding",\r
  "version": "0.2.3",\r
  "description": "Declarative data-bind-* bindings for DOM elements with value pipes and event middleware.",\r
  "files": [\r
    "dist/**",\r
    "README.md",\r
    "LICENSE.md"\r
  ],\r
  "keywords": [\r
    "data-binding",\r
    "dom",\r
    "observable",\r
    "javascript",\r
    "js"\r
  ],\r
  "homepage": "https://github.com/AlexandriteSoftware/asljs#readme",\r
  "bugs": {\r
    "url": "https://github.com/AlexandriteSoftware/asljs/issues"\r
  },\r
  "repository": {\r
    "type": "git",\r
    "url": "git+https://github.com/AlexandriteSoftware/asljs.git"\r
  },\r
  "license": "MIT",\r
  "author": "\\"Alex Netkachov\\" <alex.netkachov@gmail.com>",\r
  "type": "module",\r
  "main": "dist/index.js",\r
  "types": "dist/index.d.ts",\r
  "exports": {\r
    ".": {\r
      "types": "./dist/index.d.ts",\r
      "default": "./dist/index.js"\r
    }\r
  },\r
  "scripts": {\r
    "clean": "node ../toolkit.js clean-dist",\r
    "build": "npx tsc -p tsconfig.build.json",\r
    "build:test": "npx tsc -p tsconfig.test.json",\r
    "lint": "npx eslint .",\r
    "lint:fix": "npx eslint . --fix",\r
    "guard:clean-git": "node ../toolkit.js ensure-clean-working-folder",\r
    "prepack": "npm run clean && npm run build",\r
    "prepublishOnly": "npm run guard:clean-git && npm run prepack",\r
    "postpublish": "node ../toolkit.js tag-commit-with-release-id",\r
    "test": "npm run build:test && node --test dist/*.test.js",\r
    "test:watch": "npm run build:test && node --watch --test dist/*.test.js",\r
    "coverage": "npm run build:test && NODE_V8_COVERAGE=.coverage node --test dist/*.test.js && node -e \\"console.log('Coverage in .coverage (use c8/istanbul if you want reports)')\\""\r
  },\r
  "dependencies": {\r
    "asljs-observable": "^0.5.3"\r
  },\r
  "devDependencies": {\r
    "@types/jsdom": "^21.1.7",\r
    "jsdom": "^26.1.0"\r
  }\r
}\r
`,_n=`{\r
  "name": "asljs-components",\r
  "version": "0.1.1",\r
  "description": "Web components for ASLJS applications.",\r
  "type": "module",\r
  "main": "dist/index.js",\r
  "types": "dist/index.d.ts",\r
  "exports": {\r
    ".": {\r
      "types": "./dist/index.d.ts",\r
      "default": "./dist/index.js"\r
    }\r
  },\r
  "files": [\r
    "dist/**",\r
    "README.md",\r
    "LICENSE.md"\r
  ],\r
  "scripts": {\r
    "clean": "node ../toolkit.js clean-dist",\r
    "build": "npx tsc -p tsconfig.build.json",\r
    "build:test": "npx tsc -p tsconfig.test.json",\r
    "lint": "npx eslint .",\r
    "lint:fix": "npx eslint . --fix",\r
    "guard:clean-git": "node ../toolkit.js ensure-clean-working-folder",\r
    "prepack": "npm run clean && npm run build",\r
    "prepublishOnly": "npm run guard:clean-git && npm run prepack",\r
    "postpublish": "node ../toolkit.js tag-commit-with-release-id",\r
    "test": "npm run build:test && node --test dist/*.test.js",\r
    "test:watch": "npm run build:test && node --watch --test dist/*.test.js"\r
  },\r
  "keywords": [\r
    "web-components",\r
    "lit",\r
    "ui",\r
    "javascript"\r
  ],\r
  "author": "\\"Alex Netkachov\\" <alex.netkachov@gmail.com>",\r
  "license": "MIT",\r
  "homepage": "https://github.com/AlexandriteSoftware/asljs#readme",\r
  "bugs": {\r
    "url": "https://github.com/AlexandriteSoftware/asljs/issues"\r
  },\r
  "repository": {\r
    "type": "git",\r
    "url": "git+https://github.com/AlexandriteSoftware/asljs.git"\r
  },\r
  "dependencies": {\r
    "asljs-data-binding": "^0.2.0",\r
    "asljs-eventful": "^0.4.8",\r
    "lit": "^3.3.1"\r
  }\r
}\r
`,Un=`{\r
  "name": "asljs-dali",\r
  "version": "0.1.2",\r
  "description": "IndexedDB data layer with a typed Table abstraction.",\r
  "type": "module",\r
  "main": "dist/index.js",\r
  "types": "dist/index.d.ts",\r
  "exports": {\r
    ".": {\r
      "types": "./dist/index.d.ts",\r
      "default": "./dist/index.js"\r
    }\r
  },\r
  "files": [\r
    "dist/**",\r
    "README.md",\r
    "LICENSE.md"\r
  ],\r
  "scripts": {\r
    "clean": "node ../toolkit.js clean-dist",\r
    "build": "npx tsc -p tsconfig.build.json",\r
    "build:test": "npx tsc -p tsconfig.test.json",\r
    "lint": "npx eslint .",\r
    "lint:fix": "npx eslint . --fix",\r
    "guard:clean-git": "node ../toolkit.js ensure-clean-working-folder",\r
    "prepack": "npm run clean && npm run build",\r
    "prepublishOnly": "npm run guard:clean-git && npm run prepack",\r
    "postpublish": "node ../toolkit.js tag-commit-with-release-id",\r
    "test": "npm run build:test && node --test dist/*.test.js",\r
    "test:watch": "npm run build:test && node --watch --test dist/*.test.js",\r
    "coverage": "npm run build:test && NODE_V8_COVERAGE=.coverage node --test dist/*.test.js && node -e \\"console.log('Coverage in .coverage (use c8/istanbul if you want reports)')\\""\r
  },\r
  "keywords": [\r
    "indexeddb",\r
    "table",\r
    "data-layer",\r
    "javascript"\r
  ],\r
  "author": "\\"Alex Netkachov\\" <alex.netkachov@gmail.com>",\r
  "license": "MIT",\r
  "homepage": "https://github.com/AlexandriteSoftware/asljs#readme",\r
  "bugs": {\r
    "url": "https://github.com/AlexandriteSoftware/asljs/issues"\r
  },\r
  "repository": {\r
    "type": "git",\r
    "url": "git+https://github.com/AlexandriteSoftware/asljs.git"\r
  },\r
  "dependencies": {\r
    "asljs-eventful": "^0.4.8",\r
    "asljs-observable": "^0.5.3"\r
  },\r
  "devDependencies": {\r
    "fake-indexeddb": "^6.2.4"\r
  }\r
}\r
`,Vn=[{type:"function",name:"listFileset",description:"List all file paths in the virtual filesystem.",parameters:{type:"object",properties:{},required:[],additionalProperties:!1},strict:!0},{type:"function",name:"readFile",description:"Read the full text content of a file.",parameters:{type:"object",properties:{path:{type:"string"}},required:["path"],additionalProperties:!1},strict:!0},{type:"function",name:"setFileContent",description:"Create or fully replace file content.",parameters:{type:"object",properties:{path:{type:"string"},content:{type:"string"}},required:["path","content"],additionalProperties:!1},strict:!0},{type:"function",name:"replaceFilePart",description:"Replace part of a file by exact search string.",parameters:{type:"object",properties:{path:{type:"string"},search:{type:"string"},replacement:{type:"string"},replaceAll:{type:"boolean"}},required:["path","search","replacement","replaceAll"],additionalProperties:!1},strict:!0},{type:"function",name:"deleteFile",description:"Delete a file from the virtual filesystem.",parameters:{type:"object",properties:{path:{type:"string"}},required:["path"],additionalProperties:!1},strict:!0},{type:"function",name:"evalInApp",description:"Evaluate JavaScript in the running app document context.",parameters:{type:"object",properties:{code:{type:"string"}},required:["code"],additionalProperties:!1},strict:!0}],Jn="https://api.openai.com/v1/responses",qn=W(Dn,"asljs-observable"),Wn=W(Bn,"asljs-eventful"),Gn=W($n,"asljs-data-binding"),Hn=W(_n,"asljs-components"),Kn=W(Un,"asljs-dali"),Ke=et(),zn="gpt-5.3-codex",J=20;function Yn(){return Ke}const Qn=12;async function Xn(e,n,t,s,r){var j;let a,i=e,u=Zn(r==null?void 0:r.initialToolStepLimit),g=0;for(;;){if(await _(r,`Step ${g+1}: requesting assistant response...`),g>=u){if(!(await((j=r==null?void 0:r.onToolStepLimit)==null?void 0:j.call(r,{stepsCompleted:g,stepLimit:u}))??!1))throw new Error("AI exceeded maximum tool steps without completing.");u+=Qn,await _(r,`Extended step limit to ${u}. Continuing...`)}const v=await fetch(Jn,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${n}`},body:JSON.stringify({model:t,instructions:Ke,temperature:.1,previous_response_id:a,input:i,tools:Vn})});if(!v.ok){const m=await v.json().catch(()=>({})),E=nt(m)??`OpenAI API error: ${v.status}`;throw new Error(E)}const y=await v.json();if(!Array.isArray(y.output))throw new Error("AI returned an unexpected response format.");const c=y.output.filter(st);if(c.length===0){await _(r,`Completed in ${g+1} step(s). Finalizing summary...`);const m=ot(y);return{summary:m===""?"Completed tool-based update.":m}}const b=[];for(const m of c){await _(r,`Step ${g+1}: running ${ze(m)}...`);const E=await tt(m,s);b.push({type:"function_call_output",call_id:at(m),output:E})}await _(r,`Step ${g+1}: submitted ${b.length} tool result(s).`),a=typeof y.id=="string"?y.id:a,i=b,g+=1}}function Zn(e){if(!Number.isFinite(e))return J;const n=Math.floor(e);return n>=1?n:J}async function _(e,n){(e==null?void 0:e.onProgress)!==void 0&&await Promise.resolve(e.onProgress(n))}function et(){const e=`
      Latest ASLJS package versions to use:
      - asljs-eventful@${Wn}
      - asljs-observable@${qn}
      - asljs-data-binding@${Gn}
      - asljs-components@${Hn}
      - asljs-dali@${Kn}
    `,n=[U("eventful",Tn,Cn),U("observable",Ln,Pn),U("data-binding",In,Rn),U("components",On,Fn),U("dali",Nn,Mn)].join(`

`);return`
You are an expert ASLJS app generator.

The generated app is a showcase of ASLJS libraries. Use ALL of these packages in useful, visible ways:
- asljs-eventful
- asljs-observable
- asljs-data-binding
- asljs-components
- asljs-dali

${e}

Response requirements:
- Use tool calls for file and runtime operations.
- Do not return a full files JSON snapshot.
- Return a short plain-text summary only after updates are complete.

Tool-first generation protocol (stability-first):
- Always work in small, incremental steps:
  1) inspect current files/state,
  2) edit one focused thing,
  3) verify app behavior,
  4) fix issues,
  5) repeat until stable.
- Prefer targeted updates (replace specific file parts) over full rewrites.
- Use setFileContent only when replaceFilePart is not suitable.
- Verify each major change using evalInApp.
- Use JSON only for explicit import/export content handled by the app itself.

Generation rules:
- Always include at least: index.html, style.css, app.js, package.json, README.md.
- package.json must include latest versions listed above.
- app.js must demonstrate practical usage of ALL five ASLJS packages.
- app.js is the app entry point.
- index.html must load app.js using <script type="module">.
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

Agent tool contract (virtual filesystem and runtime):
- Assume the generated app includes an agent that can use these tools:
  - listFileset(): returns all file paths in the virtual filesystem.
  - readFile(path): returns full text content for a file.
  - setFileContent(path, content): creates or replaces a file's content.
  - replaceFilePart(path, search, replacement, replaceAll?): replaces exact text in a file.
  - deleteFile(path): deletes a file from the virtual filesystem.
  - evalInApp(code): evaluates JavaScript in the context of the running app document.
- Generate app code and README so these tool names and behaviors are clear and usable.
- Keep the tool usage model deterministic and safe (no hidden magic paths).

In-app agent update protocol:
- For normal edits, the in-app agent must update files through tools:
  - inspect with listFileset/readFile
  - modify with replaceFilePart first; use setFileContent for create/full replace
  - remove with deleteFile when appropriate
- JSON should be used only for explicit export/import workflows.

Run/repair loop requirements for the generated agent behavior:
- The agent must treat app.js as the starting point for the app runtime.
- The agent must verify the app is running (for example by using evalInApp checks against the loaded document).
- If the app is not running, the agent must iteratively adjust files via setFileContent/deleteFile,
- If the app is not running, the agent must iteratively adjust files via replaceFilePart/setFileContent/deleteFile,
  then re-check until the app runs.
- The final generated code should reflect this workflow explicitly in app.js and/or README.

Use this package knowledge as source material when choosing APIs and patterns:
${n}
`.trim()}function U(e,n,t){return`
[${e}] README excerpt:
${Oe(n,9e3)}

[${e}] exported API/types excerpt:
${Oe(t,6e3)}
`.trim()}function Oe(e,n){return e.length<=n?e:`${e.slice(0,n)}
... [truncated]`}function W(e,n){try{return JSON.parse(e).version??"latest"}catch{return console.warn(`Failed to parse package metadata for ${n}.`),"latest"}}function nt(e){const n=e.error;return typeof(n==null?void 0:n.message)=="string"?n.message:null}async function tt(e,n){const t=ze(e),s=rt(e.arguments);try{switch(t){case"listFileset":{const r=await n.listFileset();return $(r)}case"readFile":{const r=await n.readFile(N(s,"path"));return $(r)}case"setFileContent":return await n.setFileContent(N(s,"path"),N(s,"content")),$("ok");case"replaceFilePart":return await n.replaceFilePart(N(s,"path"),N(s,"search"),N(s,"replacement"),it(s,"replaceAll",!1)),$("ok");case"deleteFile":return await n.deleteFile(N(s,"path")),$("ok");case"evalInApp":{const r=await n.evalInApp(N(s,"code"));return $(r)}default:return Ne(`Unknown tool: ${t}`)}}catch(r){return Ne(r instanceof Error?r.message:String(r))}}function rt(e){if(e===void 0)return{};if(typeof e=="object"&&e!==null)return e;if(typeof e!="string")throw new Error("Invalid tool arguments value.");try{const n=JSON.parse(e);if(typeof n!="object"||n===null)throw new Error("Tool arguments must be a JSON object.");return n}catch{throw new Error("Invalid tool arguments JSON.")}}function st(e){return e.type==="function_call"}function ze(e){if(typeof e.name!="string"||e.name.trim()==="")throw new Error("Tool call missing function name.");return e.name}function at(e){if(typeof e.call_id!="string"||e.call_id.trim()==="")throw new Error("Tool call missing call_id.");return e.call_id}function ot(e){return typeof e.output_text=="string"&&e.output_text.trim()!==""?e.output_text.trim():Array.isArray(e.output)?e.output.filter(t=>t.type==="message").flatMap(t=>t.content??[]).map(t=>t.text??"").map(t=>t.trim()).filter(t=>t!=="").join(`
`):""}function N(e,n){const t=e[n];if(typeof t!="string")throw new Error(`Tool argument "${n}" must be a string.`);return t}function it(e,n,t){const s=e[n];if(s===void 0)return t;if(typeof s!="boolean")throw new Error(`Tool argument "${n}" must be a boolean.`);return s}function $(e){return Ye({ok:!0,value:e})}function Ne(e){return Ye({ok:!1,error:e})}function Ye(e){try{return JSON.stringify(e)}catch{return'{"ok":false,"error":"Failed to serialize tool result."}'}}const we="asljs-app-builder:eval-request",Qe="asljs-app-builder:eval-response",Pe=`<script>
(() => {
  const REQUEST = '${we}';
  const RESPONSE = '${Qe}';

  window.addEventListener('message', async event => {
    const data = event.data;

    if (!data || data.type !== REQUEST) {
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
<\/script>`;function lt(e,n){if(n.length===0){e.removeAttribute("srcdoc"),e.src="about:blank";return}const t=n.find(a=>a.name==="index.html")??n.find(a=>a.name.endsWith(".html"))??null;if(t===null){e.removeAttribute("srcdoc"),e.src="about:blank";return}let s=t.content;const r=n.find(a=>a.name==="style.css")??n.find(a=>a.name.endsWith(".css"))??null;r!==null&&(s=s.replace(/<link[^>]+href=["']style\.css["'][^>]*>/gi,`<style>${r.content}</style>`),s=s.replace(/<link[^>]+href=["']([^"']+\.css)["'][^>]*>/gi,`<style>${r.content}</style>`));for(const a of n){if(!a.name.endsWith(".js"))continue;const i=a.name.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");s=s.replace(new RegExp(`(<script[^>]*?)\\s+src=["']${i}["']([^>]*)><\\/script>`,"gi"),(u,g,j)=>{const v=`${String(g)} ${String(j)}`;return/type=["']module["']/i.test(v)?`<script type="module">${a.content}<\/script>`:`<script>${a.content}<\/script>`})}s=dt(s,n),s=ct(s),e.srcdoc=s}async function Ce(e,n){const t=e.contentWindow;if(t===null)throw new Error("Preview frame is not available.");const s=crypto.randomUUID();return new Promise((r,a)=>{const i=window.setTimeout(()=>{g(),a(new Error("Timed out waiting for app evaluation result."))},5e3),u=j=>{if(j.source!==t)return;const v=j.data;if(!(v.type!==Qe||v.id!==s)){if(g(),v.ok===!0){r(v.value);return}a(new Error(v.error??"Unknown preview evaluation error."))}};function g(){window.clearTimeout(i),window.removeEventListener("message",u)}window.addEventListener("message",u),t.postMessage({type:we,id:s,code:n},"*")})}function ct(e){return e.includes(we)?e:e.includes("</body>")?e.replace("</body>",`${Pe}</body>`):`${e}
${Pe}`}function dt(e,n){if(/type=["']importmap["']/i.test(e))return e;const t=n.find(i=>i.name==="package.json")??null,s=pt(t==null?void 0:t.content),r=Object.fromEntries(s.map(([i,u])=>[i,`https://esm.sh/${i}@${u}?bundle`]));if(Object.keys(r).length===0)return e;const a=`<script type="importmap">${JSON.stringify({imports:r})}<\/script>`;return/<head[^>]*>/i.test(e)?e.replace(/<head[^>]*>/i,i=>`${i}
${a}`):`${a}
${e}`}function pt(e){if(e===void 0)return Re();try{const n=JSON.parse(e),t={...n.dependencies??{},...n.devDependencies??{}};return["asljs-eventful","asljs-observable","asljs-data-binding","asljs-components","asljs-dali"].map(a=>[a,ut(t[a])])}catch{return Re()}}function ut(e){if(typeof e!="string"||e.trim()==="")return"latest";const n=e.trim().replace(/^[~^<>=\s]+/,"");return n===""?"latest":n}function Re(){return[["asljs-eventful","latest"],["asljs-observable","latest"],["asljs-data-binding","latest"],["asljs-components","latest"],["asljs-dali","latest"]]}function K(){return crypto.randomUUID()}function F(){return new Date().toISOString()}function d(e){const n=document.getElementById(e);if(n===null)throw new Error(`Missing element #${e}`);return n}const Fe=d("app-list"),Me=d("empty-state"),De=d("app-workspace"),ft=d("app-name-display"),mt=d("panels"),Be=d("panel-editor"),I=d("file-select"),z=d("file-content"),V=d("chat-messages"),$e=d("chat-progress"),fe=d("chat-input"),me=d("btn-generate"),vt=d("btn-run"),bt=d("btn-refresh-preview"),Y=d("preview-frame"),gt=d("btn-new-app"),ht=d("btn-new-app-2"),yt=d("btn-rename"),wt=d("btn-delete-app"),jt=d("btn-export"),xt=d("btn-settings"),Et=d("btn-agent-instructions"),ve=d("btn-toggle-apps"),_e=d("apps-content"),be=d("btn-toggle-files"),Q=d("settings-modal"),St=d("btn-close-settings"),At=d("btn-save-settings"),kt=d("btn-cancel-settings"),ge=d("api-key-input"),Xe=d("model-select"),Ze=d("max-tool-steps-input"),M=d("name-modal"),en=d("name-modal-title"),P=d("app-name-input"),G=d("btn-confirm-name"),Lt=d("btn-cancel-name"),Tt=d("btn-close-name-modal"),X=d("import-file"),Z=d("agent-instructions-modal"),he=d("agent-instructions-text"),It=d("btn-close-agent-instructions"),Ot=d("btn-close-agent-instructions-2"),Nt=d("btn-copy-agent-instructions"),nn="asljs-app-builder-settings";function re(){try{const e=localStorage.getItem(nn)??"{}";return JSON.parse(e)}catch{return{}}}function Pt(e){localStorage.setItem(nn,JSON.stringify(e))}function tn(){return re().apiKey??""}function rn(){const e=re().model;return e==="gpt-5.3-codex"||e==="gpt-5.4"?e:zn}function sn(){const e=re().maxToolSteps;if(!Number.isFinite(e))return J;const n=Math.floor(e);return n<1?J:n}function Ct(){if(o.currentAppId===null)throw new Error("No active app. Create or open an app first.");return o.currentAppId}async function an(){return[...o.files].map(e=>e.name).sort((e,n)=>e.localeCompare(n))}async function je(e){const n=o.files.find(t=>t.name===e);if(n===void 0)throw new Error(`File not found: ${e}`);return n.content}async function xe(e,n){const t=Ct(),s=o.files.find(a=>a.name===e);if(s!==void 0){const a={...s,content:n};await ue(a),o.files=o.files.map(i=>i.id===a.id?a:i),o.activeFileName=a.name;return}const r={id:K(),appId:t,name:e,content:n};await ue(r),o.files=[...o.files,r],o.activeFileName=r.name}async function on(e){var s;const n=o.files.find(r=>r.name===e);if(n===void 0)return;await An(n.id);const t=o.files.filter(r=>r.id!==n.id);o.files=t,o.activeFileName===e&&(o.activeFileName=((s=t[0])==null?void 0:s.name)??null)}async function ln(e,n,t,s=!1){if(n==="")throw new Error("Search text cannot be empty.");const r=await je(e);if(!r.includes(n))throw new Error(`Search text not found in ${e}.`);let a=r;if(s)a=r.split(n).join(t);else{const i=r.indexOf(n);if(r.indexOf(n,i+n.length)!==-1)throw new Error("Search text is ambiguous. Use replaceAll=true or provide a more specific search block.");a=r.slice(0,i)+t+r.slice(i+n.length)}await xe(e,a)}async function cn(e){if(o.files.length===0)throw new Error("No files available to run.");q();try{return await Ce(Y,e)}catch{return q(),Ce(Y,e)}}function dn(){Fe.replaceChildren();const e=[...o.apps].sort((n,t)=>t.updatedAt.localeCompare(n.updatedAt));for(const n of e){const t=document.createElement("div");t.className="app-item"+(n.id===o.currentAppId?" active":""),t.dataset.id=n.id;const s=document.createElement("span");s.className="app-item-name",s.textContent=n.name,t.appendChild(s),t.addEventListener("click",()=>{ae(n.id)}),Fe.appendChild(t)}}function pn(){const e=o.apps.find(n=>n.id===o.currentAppId);if(e===void 0){Me.classList.remove("hidden"),De.classList.add("hidden");return}Me.classList.add("hidden"),De.classList.remove("hidden"),ft.textContent=e.name,Ee(),Se()}function Ee(){if(I.replaceChildren(),o.files.length===0){const n=document.createElement("option");n.value="",n.textContent="No files",I.appendChild(n),I.value="",I.disabled=!0;return}for(const n of o.files){const t=document.createElement("option");t.value=n.name,t.textContent=n.name,I.appendChild(t)}const e=o.activeFileName??o.files[0].name;I.value=e,I.disabled=!1}function Se(){const e=o.files.find(n=>n.name===o.activeFileName);z.value=(e==null?void 0:e.content)??"",z.disabled=e===void 0}function Ue(e){o.generating=e,me.disabled=e,me.innerHTML=e?'<span class="spinner"></span> Generating…':"Generate"}function de(e,n){$e.textContent=e,$e.classList.toggle("hidden",!n)}function C(e,n){const t=document.createElement("div");t.className=`chat-msg ${e}`;const s=document.createElement("div");s.className="chat-msg-role",s.textContent=e==="user"?"You":"Assistant";const r=document.createElement("div");r.className="chat-bubble",r.textContent=n,t.appendChild(s),t.appendChild(r),V.appendChild(t),V.scrollTop=V.scrollHeight}async function se(){if(o.activeFileName===null||o.currentAppId===null)return;const e=o.files.find(t=>t.name===o.activeFileName);if(e===void 0)return;const n=z.value;e.content!==n&&(e.content=n,await ue(e))}async function ae(e){var t;o.currentAppId=e;const n=await Sn(e);o.files=n,o.activeFileName=((t=n[0])==null?void 0:t.name)??null,V.replaceChildren()}function un(){en.textContent="New App",P.value="",M.classList.remove("hidden"),P.focus(),G.onclick=async()=>{const e=P.value.trim();if(e==="")return;M.classList.add("hidden");const n={id:K(),name:e,createdAt:F(),updatedAt:F()};await te(n),o.apps=[...o.apps,n],await ae(n.id)}}function Ae(){M.classList.add("hidden"),G.onclick=null}function Rt(){const e=o.apps.find(n=>n.id===o.currentAppId);e!==void 0&&(en.textContent="Rename App",P.value=e.name,M.classList.remove("hidden"),P.focus(),P.select(),G.onclick=async()=>{const n=P.value.trim();if(n==="")return;M.classList.add("hidden");const t={...e,name:n,updatedAt:F()};await te(t),o.apps=o.apps.map(s=>s.id===e.id?t:s)})}async function Ft(){const e=o.apps.find(n=>n.id===o.currentAppId);e!==void 0&&confirm(`Delete "${e.name}"? This cannot be undone.`)&&(await En(e.id),o.apps=o.apps.filter(n=>n.id!==e.id),o.currentAppId=null,o.files=[],o.activeFileName=null,V.replaceChildren(),Y.src="about:blank")}async function fn(){const e=fe.value.trim();if(e==="")return;const n=tn();if(n===""){C("assistant","No OpenAI API key set. Open Settings (⚙) to add your key. Generation is optional — you can also create files manually.");return}if(o.currentAppId===null){C("assistant","Please create or open an app first.");return}fe.value="",C("user",e),Ue(!0),de("Starting generation...",!0);try{const t=rn(),s=sn(),r=await Xn(e,n,t,{listFileset:an,readFile:je,setFileContent:xe,replaceFilePart:ln,deleteFile:on,evalInApp:cn},{initialToolStepLimit:s,onToolStepLimit:async({stepsCompleted:i})=>confirm(`AI reached ${i} tool steps without finishing. Continue for 12 more steps?`),onProgress:i=>{de(i,!0)}}),a=o.apps.find(i=>i.id===o.currentAppId);if(a!==void 0){const i={...a,updatedAt:F()};await te(i),o.apps=o.apps.map(u=>u.id===a.id?i:u)}C("assistant",r.summary),q()}catch(t){const s=t instanceof Error?t.message:String(t);C("assistant",`Error: ${s}`)}finally{de("",!1),Ue(!1)}}function q(){se().then(()=>{lt(Y,o.files)})}async function Mt(){const e=o.apps.find(a=>a.id===o.currentAppId);if(e===void 0)return;await se();const n={app:e,files:o.files,exportedAt:F()},t=new Blob([JSON.stringify(n,null,2)],{type:"application/json"}),s=URL.createObjectURL(t),r=document.createElement("a");r.href=s,r.download=`${e.name.replace(/\s+/g,"-")}.json`,r.click(),URL.revokeObjectURL(s)}function Dt(){X.value="",X.click()}async function Bt(){var n;const e=(n=X.files)==null?void 0:n[0];if(e!==void 0)try{const t=await e.text(),s=JSON.parse(t);if(s.app===void 0||typeof s.app.name!="string"||!Array.isArray(s.files))throw new Error("Invalid app JSON format.");const r=K(),a={id:r,name:`${s.app.name} (imported)`,createdAt:s.app.createdAt??F(),updatedAt:F()},i=s.files.filter(u=>typeof u.name=="string"&&typeof u.content=="string").map(u=>({id:K(),appId:r,name:u.name,content:u.content}));await te(a),await kn(r,i),o.apps=[...o.apps,a],await ae(r)}catch(t){const s=t instanceof Error?t.message:String(t);alert(`Import failed: ${s}`)}}function $t(){ge.value=tn(),Xe.value=rn(),Ze.value=String(sn()),Q.classList.remove("hidden"),ge.focus()}function oe(){Q.classList.add("hidden")}function _t(){const e=re();e.apiKey=ge.value.trim(),e.model=Xe.value==="gpt-5.4"?"gpt-5.4":"gpt-5.3-codex";const n=Number.parseInt(Ze.value,10);e.maxToolSteps=Number.isFinite(n)&&n>=1?n:J,Pt(e),oe()}function Ut(){he.value=Yn(),Z.classList.remove("hidden"),he.scrollTop=0}function ke(){Z.classList.add("hidden")}function Vt(){const e=!_e.classList.contains("collapsed");ve.textContent=e?"▸":"▾",ve.setAttribute("aria-expanded",e?"false":"true"),_e.classList.toggle("collapsed",e)}function Jt(){const e=!Be.classList.contains("collapsed");be.textContent=e?"Files ▸":"Files ▾",be.setAttribute("aria-expanded",e?"false":"true"),Be.classList.toggle("collapsed",e),mt.classList.toggle("files-collapsed",e)}async function qt(){const e=he.value;try{await navigator.clipboard.writeText(e),C("assistant","Agent instructions copied to clipboard.")}catch{C("assistant","Could not copy to clipboard automatically. You can still select and copy from the instructions modal.")}}o.on("set:apps",()=>dn());o.on("set:currentAppId",()=>{dn(),pn()});o.on("set:files",()=>{Ee(),Se()});o.on("set:activeFileName",()=>{Ee(),Se()});gt.addEventListener("click",un);ht.addEventListener("click",un);yt.addEventListener("click",Rt);wt.addEventListener("click",()=>{Ft()});jt.addEventListener("click",()=>{Mt()});me.addEventListener("click",()=>{fn()});vt.addEventListener("click",q);bt.addEventListener("click",q);xt.addEventListener("click",$t);Et.addEventListener("click",Ut);ve.addEventListener("click",Vt);be.addEventListener("click",Jt);St.addEventListener("click",oe);At.addEventListener("click",_t);kt.addEventListener("click",oe);Q.addEventListener("click",e=>{e.target===Q&&oe()});It.addEventListener("click",ke);Ot.addEventListener("click",ke);Nt.addEventListener("click",()=>{qt()});Z.addEventListener("click",e=>{e.target===Z&&ke()});G.addEventListener("click",()=>{});Lt.addEventListener("click",Ae);Tt.addEventListener("click",Ae);M.addEventListener("click",e=>{e.target===M&&Ae()});P.addEventListener("keydown",e=>{e.key==="Enter"&&G.click()});fe.addEventListener("keydown",e=>{e.key==="Enter"&&!e.shiftKey&&(e.preventDefault(),fn())});I.addEventListener("change",()=>{const e=I.value;e===""||e===o.activeFileName||(se(),o.activeFileName=e)});z.addEventListener("blur",()=>{se()});X.addEventListener("change",()=>{Bt()});const ie=document.createElement("button");ie.className="btn btn-ghost btn-full";ie.textContent="↑ Import";ie.addEventListener("click",Dt);const Ve=document.querySelector(".sidebar-footer");Ve!==null&&Ve.appendChild(ie);window.listFileset=an;window.readFile=je;window.setFileContent=xe;window.replaceFilePart=ln;window.deleteFile=on;window.evalInApp=cn;async function Wt(){const e=await xn();if(o.apps=e,e.length>0){const n=[...e].sort((t,s)=>s.updatedAt.localeCompare(t.updatedAt));await ae(n[0].id)}else pn()}Wt().catch(e=>{console.error("App Builder init failed:",e)});
