(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))t(s);new MutationObserver(s=>{for(const o of s)if(o.type==="childList")for(const i of o.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&t(i)}).observe(document,{childList:!0,subtree:!0});function r(s){const o={};return s.integrity&&(o.integrity=s.integrity),s.referrerPolicy&&(o.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?o.credentials="include":s.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function t(s){if(s.ep)return;s.ep=!0;const o=r(s);fetch(s.href,o)}})();class _e extends Error{constructor(n,r,t,s,o){super(n),this.name="ListenerError",this.error=r,this.object=t,this.event=s,this.listener=o}}function M(e){if(typeof e!="string"&&typeof e!="symbol")throw new TypeError("Expect event to be a string or symbol.")}function Y(e){return typeof e=="function"}function ve(e){if(Y(e))return e}function Le(e){return typeof e=="object"&&e!==null}function re(e){if(!Y(e))throw new TypeError("Expect a function.")}const Ge=(e=Object.create(null),n={})=>{if(!Le(e)&&!Y(e))throw new TypeError("Expect an object or a function.");for(const l of["on","once","off","emit","emitAsync","has"])if(l in e)throw new Error(`Method "${l}" already exists.`);const{strict:r=!1,trace:t=null,error:s=null}=n,o=ve(t)??null,i=ve(s)??null,u=e!==N,y=(l,d)=>{o==null||o(l,d),u&&N.emit(l,d)};y("new",{object:e});const E=new Set,v=new Map,w={enumerable:!1,configurable:!0,writable:!0};return Object.defineProperties(e,{on:Object.assign({value:T},w),once:Object.assign({value:j},w),off:Object.assign({value:h},w),emit:Object.assign({value:A},w),emitAsync:Object.assign({value:L},w),has:Object.assign({value:S},w)}),e;function c(l,d){let p=v.get(l);p||v.set(l,p=new Set),p.add(d)}function m(l,d){const p=v.get(l);if(!p)return!1;const g=p.delete(d);return p.size===0&&v.delete(l),g}function b(l,d,p){const g={error:p,object:e,event:l,listener:d};if(i==null||i(g),e===N&&l==="error")throw new _e("Error in a global error listener.",p,e,l,d);N.emit("error",g)}function T(l,d){M(l),re(d),y("on",{object:e,event:l,listener:d}),c(l,d);let p=!0;return()=>p?(p=!1,m(l,d)):!1}function j(l,d){M(l),re(d);const p=T(l,(...g)=>{p(),d(...g)});return p}function h(l,d){return M(l),re(d),y("off",{object:e,event:l,listener:d}),m(l,d)}function S(l){var d;return M(l),(((d=v.get(l))==null?void 0:d.size)??0)>0}function A(l,...d){M(l);const p=v.get(l)||E;if(y("emit",{object:e,listeners:[...p],event:l,args:d}),p.size!==0)for(const g of p)try{g(...d)}catch(O){if(b(l,g,O),r)throw O}}async function L(l,...d){M(l);const p=v.get(l)||E;if(y("emitAsync",{object:e,listeners:[...p],event:l,args:d}),p.size===0)return;const g=[...p].map(async O=>{try{await O(...d)}catch(me){if(b(l,O,me),r)throw me}});await(r?Promise.all(g):Promise.allSettled(g))}},N=Ge;N(N);function We(e){return!Le(e)&&!Y(e)?!1:typeof e.on=="function"}function Te(e){if(We(e))return e}function k(e){return typeof e=="function"}function ce(e){return typeof e=="object"&&e!==null}function Oe(e){if(!k(e))throw new TypeError("Expect a function.")}function se(e){if(e.trim()==="")throw new TypeError("Expect watch path to be a non-empty string.");const n=e.split(".");for(const r of n)if(r.trim()==="")throw new TypeError("Expect watch path segments to be non-empty.");return e.split(".").map(r=>r.trim()).filter(r=>r!=="")}function qe(e,n){const r=se(n);if(r.length===0)return;let t=e;for(const s of r){if(!ce(t)||!(s in t))return;t=t[s]}return t}const Ie=(e,n,r)=>{if(Array.isArray(e))throw new TypeError("Watching arrays is not supported.");Oe(r);const t=typeof n=="string"?[n]:n;if(!Array.isArray(t))throw new TypeError("Expect properties to be a string or an array of strings.");for(const i of t){if(typeof i!="string")throw new TypeError("Expect properties to be a string or an array of strings.");se(i)}const s=()=>t.map(i=>qe(e,i)),o=[];for(const i of t){const u=se(i);let y=null;const E=()=>{const v=[],w=(c,m)=>{if(!ce(c)||m>=u.length)return;const b=u[m],T=Te(c);if(T){const j=T.on(`set:${b}`,()=>{r(...s()),m<u.length-1&&y&&(y(),y=E())});v.push(j)}m<u.length-1&&w(c[b],m+1)};return w(e,0),()=>v.reduce((c,m)=>m()||c,!1)};y=E(),o.push(()=>y?y():!1)}return r(...s()),()=>o.reduce((i,u)=>u()||i,!1)};function He(e,n){"watch"in e||Object.defineProperty(e,"watch",{configurable:!0,writable:!0,enumerable:!1,value(r,t){return n(typeof r=="string"?this:this,r,t)}})}function be(e,n){return Object.prototype.hasOwnProperty.call(e,n)}function te(e){if(typeof e=="symbol")return!1;const n=typeof e=="number"?e:Number(e);return!Number.isInteger(n)||n<0||n>=4294967295?!1:typeof e=="number"||e===String(n)}function Ke(e){return Te(e)?k(e.emit):!1}const Ne=(e,n={})=>{const{eventful:r=N,trace:t=null,shallow:s=!1}=n;Oe(r);const o=z.options,i=new WeakMap,u=c=>{if(s||!ce(c)||Ke(c))return c;if(i.has(c))return i.get(c);const m=Ne(c,{eventful:r,trace:t,shallow:s});return i.set(c,m),m},y=c=>{if(!s){if(Array.isArray(c)){for(let m=0;m<c.length;m++)c[m]=u(c[m]);return}for(const m of Reflect.ownKeys(c))be(c,m)&&(c[m]=u(c[m]))}},E=c=>{const m=Array.isArray(c);y(c),He(c,Ie);let b;const T=new Proxy(c,{set(j,h,S,A){const L=m&&te(h),l=Reflect.get(j,h,A),d=Reflect.set(j,h,u(S),A);if(b&&d){const p=Reflect.get(j,h,A);if(!Object.is(l,p)){const g=L?{index:Number(h),value:p,previous:l}:{property:h,value:p,previous:l},O=t||o.trace;b.emit(`set:${String(h)}`,g),k(O)&&O(b,"set",g),b.emit("set",g)}}return d},deleteProperty(j,h){const S=m&&te(h),A=be(j,h),L=A?j[h]:void 0,l=Reflect.deleteProperty(j,h);if(b&&l&&A){const d=S?{index:Number(h),previous:L}:{property:h,previous:L},p=t||o.trace;b.emit(`delete:${String(h)}`,d),k(p)&&p(b,"delete",d),b.emit("delete",d)}return l},defineProperty(j,h,S){const A=Object.getOwnPropertyDescriptor(j,h)??null,L=Object.prototype.hasOwnProperty.call(S,"value")?{...S,value:u(S.value)}:S,l=Reflect.defineProperty(j,h,L),d=m&&(h==="length"||te(h));if(b&&!d&&l){const p={property:h,descriptor:L,previous:A},g=t||o.trace;b.emit(`define:${String(h)}`,p),k(g)&&g(b,"define",p),b.emit("define",p)}return l}});return b=k(c==null?void 0:c.emit)?T:r(T),b},v=t||o.trace;if(Array.isArray(e)){const c=E(e);return k(v)&&v(c,"new"),c}if(e!==null&&typeof e=="object"){const c=E(e);return k(v)&&v(c,"new",{object:c}),c}const w=r({get value(){return e},set value(c){if(Object.is(c,e))return;const m=e;e=c;const b={property:"value",value:e,previous:m};w.emit("set:value",b),k(v)&&v(w,"set",b),w.emit("set",b)}});return k(v)&&v(w,"new",{object:w}),w},z=Ne;z.options={trace:null};z.watch=Ie;const a=z({apps:[],currentAppId:null,files:[],activeFileName:null,generating:!1,error:null});function x(e){return new Promise((n,r)=>{e.addEventListener("success",()=>{n(e.result)}),e.addEventListener("error",()=>{r(e.error??new Error("IndexedDB request failed"))})})}function Ye(e,n){return new Promise((r,t)=>{const s=indexedDB.open(e,n.length);s.addEventListener("upgradeneeded",o=>{const i=n.slice(o.oldVersion-1,o.newVersion??n.length-1);for(const u of i)u(s.result)}),s.addEventListener("success",()=>{r(s.result)}),s.addEventListener("blocked",()=>{t(new Error("Database opening is blocked"))}),s.addEventListener("error",()=>{t(s.error??new Error("Failed to open database"))})})}const ze="asljs-app-builder";let G=null;async function P(){return G!==null||(G=await Ye(ze,[e=>{e.createObjectStore("apps",{keyPath:"id"}),e.createObjectStore("files",{keyPath:"id"}).createIndex("byAppId","appId",{unique:!1})}])),G}async function Qe(){const n=(await P()).transaction("apps","readonly");return x(n.objectStore("apps").getAll())}async function Q(e){const r=(await P()).transaction("apps","readwrite");await x(r.objectStore("apps").put(e))}async function Xe(e){const r=(await P()).transaction(["apps","files"],"readwrite");await x(r.objectStore("apps").delete(e));const t=r.objectStore("files"),s=await x(t.index("byAppId").getAllKeys(e));for(const o of s)await x(t.delete(o))}async function Ze(e){const r=(await P()).transaction("files","readonly");return x(r.objectStore("files").index("byAppId").getAll(e))}async function ae(e){const r=(await P()).transaction("files","readwrite");await x(r.objectStore("files").put(e))}async function en(e){const r=(await P()).transaction("files","readwrite");await x(r.objectStore("files").delete(e))}async function Re(e,n){const s=(await P()).transaction("files","readwrite").objectStore("files"),o=await x(s.index("byAppId").getAllKeys(e));for(const i of o)await x(s.delete(i));for(const i of n)await x(s.put(i))}const nn=`# observable\r
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
`,rn=`# eventful\r
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
`,tn=`# data-binding\r
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
`,sn=`# components\r
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
`,an=`# dali\r
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
`,on=`export {\r
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
`,ln=`export {\r
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
`,cn=`export {\r
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
`,dn=`export {\r
    List,\r
    type ListItem,\r
    type ListItemsSource,\r
    type ListRowContext,\r
  } from './list.js';\r
`,pn=`export {\r
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
`,un=`{
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
`,fn=`{\r
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
`,mn=`{\r
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
`,vn=`{\r
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
`,bn=`{\r
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
`,hn="https://api.openai.com/v1/chat/completions",gn=V(un,"asljs-observable"),yn=V(fn,"asljs-eventful"),wn=V(mn,"asljs-data-binding"),jn=V(vn,"asljs-components"),En=V(bn,"asljs-dali"),xn=An();async function Sn(e,n){const r=await fetch(hn,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${n}`},body:JSON.stringify({model:"gpt-4o-mini",temperature:.2,messages:[{role:"system",content:xn},{role:"user",content:e}]})});if(!r.ok){const i=await r.json().catch(()=>({})),u=kn(i)??`OpenAI API error: ${r.status}`;throw new Error(u)}const t=await r.json(),s=Ln(t),o=Tn(s);if(o.files.length===0)throw new Error("AI returned no files.");return o}function An(){const e=`
      Latest ASLJS package versions to use:
      - asljs-eventful@${yn}
      - asljs-observable@${gn}
      - asljs-data-binding@${wn}
      - asljs-components@${jn}
      - asljs-dali@${En}
    `,n=[B("eventful",rn,ln),B("observable",nn,on),B("data-binding",tn,cn),B("components",sn,dn),B("dali",an,pn)].join(`

`);return`
You are an expert ASLJS app generator.

The generated app is a showcase of ASLJS libraries. Use ALL of these packages in useful, visible ways:
- asljs-eventful
- asljs-observable
- asljs-data-binding
- asljs-components
- asljs-dali

${e}

Output requirements:
- Return JSON only (no markdown, no prose), with this exact shape:
  {
    "description": "one-sentence description",
    "files": [
      { "name": "index.html", "content": "..." },
      { "name": "style.css", "content": "..." },
      { "name": "app.js", "content": "..." },
      { "name": "package.json", "content": "..." },
      { "name": "README.md", "content": "..." }
    ]
  }

Generation rules:
- Always include at least: index.html, style.css, app.js, package.json, README.md.
- package.json must include latest versions listed above.
- app.js must demonstrate practical usage of ALL five ASLJS packages.
- app.js is the app entry point.
- index.html must load app.js using <script type="module">.
- Prefer real app behavior over toy snippets (state, events, bindings, local persistence, and at least one ASLJS component).
- Keep code concise, runnable in modern browser, and readable.

Agent tool contract (virtual filesystem and runtime):
- Assume the generated app includes an agent that can use these tools:
  - listFileset(): returns all file paths in the virtual filesystem.
  - readFile(path): returns full text content for a file.
  - setFileContent(path, content): creates or replaces a file's content.
  - deleteFile(path): deletes a file from the virtual filesystem.
  - evalInApp(code): evaluates JavaScript in the context of the running app document.
- Generate app code and README so these tool names and behaviors are clear and usable.
- Keep the tool usage model deterministic and safe (no hidden magic paths).

Run/repair loop requirements for the generated agent behavior:
- The agent must treat app.js as the starting point for the app runtime.
- The agent must verify the app is running (for example by using evalInApp checks against the loaded document).
- If the app is not running, the agent must iteratively adjust files via setFileContent/deleteFile,
  then re-check until the app runs.
- The final generated code should reflect this workflow explicitly in app.js and/or README.

Use this package knowledge as source material when choosing APIs and patterns:
${n}
`.trim()}function B(e,n,r){return`
[${e}] README excerpt:
${he(n,9e3)}

[${e}] exported API/types excerpt:
${he(r,6e3)}
`.trim()}function he(e,n){return e.length<=n?e:`${e.slice(0,n)}
... [truncated]`}function V(e,n){try{return JSON.parse(e).version??"latest"}catch{return console.warn(`Failed to parse package metadata for ${n}.`),"latest"}}function kn(e){const n=e.error;return typeof(n==null?void 0:n.message)=="string"?n.message:null}function Ln(e){const n=e.choices,r=n==null?void 0:n[0],t=r==null?void 0:r.message,s=t==null?void 0:t.content;if(typeof s!="string")throw new Error("AI returned an unexpected response format.");return s}function Tn(e){let n;try{n=JSON.parse(e)}catch{throw new Error("AI returned invalid JSON.")}if(!On(n))throw new Error("AI returned an unexpected response shape.");return n}function On(e){if(typeof e!="object"||e===null)return!1;const n=e;return typeof n.description!="string"||!Array.isArray(n.files)?!1:n.files.every(In)}function In(e){if(typeof e!="object"||e===null)return!1;const n=e;return typeof n.name=="string"&&typeof n.content=="string"}let D=null;const de="asljs-app-builder:eval-request",Ce="asljs-app-builder:eval-response",ge=`<script>
(() => {
  const REQUEST = '${de}';
  const RESPONSE = '${Ce}';

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
<\/script>`;function Pe(e,n){if(D!==null&&(URL.revokeObjectURL(D),D=null),n.length===0){e.src="about:blank";return}const r=n.find(i=>i.name==="index.html")??n.find(i=>i.name.endsWith(".html"))??null;if(r===null){e.src="about:blank";return}let t=r.content;const s=n.find(i=>i.name==="style.css")??n.find(i=>i.name.endsWith(".css"))??null;s!==null&&(t=t.replace(/<link[^>]+href=["']style\.css["'][^>]*>/gi,`<style>${s.content}</style>`),t=t.replace(/<link[^>]+href=["']([^"']+\.css)["'][^>]*>/gi,`<style>${s.content}</style>`));for(const i of n){if(!i.name.endsWith(".js"))continue;const u=i.name.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");t=t.replace(new RegExp(`(<script[^>]*?)\\s+src=["']${u}["']([^>]*)><\\/script>`,"gi"),(y,E,v)=>{const w=`${String(E)} ${String(v)}`;return/type=["']module["']/i.test(w)?`<script type="module">${i.content}<\/script>`:`<script>${i.content}<\/script>`})}t=Nn(t);const o=new Blob([t],{type:"text/html"});D=URL.createObjectURL(o),e.src=D}async function ye(e,n){const r=e.contentWindow;if(r===null)throw new Error("Preview frame is not available.");const t=crypto.randomUUID();return new Promise((s,o)=>{const i=window.setTimeout(()=>{y(),o(new Error("Timed out waiting for app evaluation result."))},5e3),u=E=>{if(E.source!==r)return;const v=E.data;if(!(v.type!==Ce||v.id!==t)){if(y(),v.ok===!0){s(v.value);return}o(new Error(v.error??"Unknown preview evaluation error."))}};function y(){window.clearTimeout(i),window.removeEventListener("message",u)}window.addEventListener("message",u),r.postMessage({type:de,id:t,code:n},"*")})}function Nn(e){return e.includes(de)?e:e.includes("</body>")?e.replace("</body>",`${ge}</body>`):`${e}
${ge}`}function U(){return crypto.randomUUID()}function R(){return new Date().toISOString()}function f(e){const n=document.getElementById(e);if(n===null)throw new Error(`Missing element #${e}`);return n}const we=f("app-list"),je=f("empty-state"),Ee=f("app-workspace"),Rn=f("app-name-display"),xe=f("file-tabs"),W=f("file-content"),$=f("chat-messages"),oe=f("chat-input"),ie=f("btn-generate"),Cn=f("btn-run"),Pn=f("btn-refresh-preview"),J=f("preview-frame"),Mn=f("btn-new-app"),Bn=f("btn-new-app-2"),Dn=f("btn-rename"),Fn=f("btn-delete-app"),$n=f("btn-export"),Un=f("btn-settings"),q=f("settings-modal"),Jn=f("btn-close-settings"),Vn=f("btn-save-settings"),_n=f("btn-cancel-settings"),le=f("api-key-input"),C=f("name-modal"),Me=f("name-modal-title"),I=f("app-name-input"),_=f("btn-confirm-name"),Gn=f("btn-cancel-name"),Wn=f("btn-close-name-modal"),H=f("import-file"),Be="asljs-app-builder-settings";function De(){try{const e=localStorage.getItem(Be)??"{}";return JSON.parse(e)}catch{return{}}}function qn(e){localStorage.setItem(Be,JSON.stringify(e))}function Fe(){return De().apiKey??""}function Hn(){if(a.currentAppId===null)throw new Error("No active app. Create or open an app first.");return a.currentAppId}async function Kn(){return[...a.files].map(e=>e.name).sort((e,n)=>e.localeCompare(n))}async function Yn(e){const n=a.files.find(r=>r.name===e);if(n===void 0)throw new Error(`File not found: ${e}`);return n.content}async function zn(e,n){const r=Hn(),t=a.files.find(o=>o.name===e);if(t!==void 0){const o={...t,content:n};await ae(o),a.files=a.files.map(i=>i.id===o.id?o:i),a.activeFileName=o.name;return}const s={id:U(),appId:r,name:e,content:n};await ae(s),a.files=[...a.files,s],a.activeFileName=s.name}async function Qn(e){var t;const n=a.files.find(s=>s.name===e);if(n===void 0)return;await en(n.id);const r=a.files.filter(s=>s.id!==n.id);a.files=r,a.activeFileName===e&&(a.activeFileName=((t=r[0])==null?void 0:t.name)??null)}async function Xn(e){if(a.files.length===0)throw new Error("No files available to run.");K();try{return await ye(J,e)}catch{return K(),ye(J,e)}}function $e(){we.replaceChildren();const e=[...a.apps].sort((n,r)=>r.updatedAt.localeCompare(n.updatedAt));for(const n of e){const r=document.createElement("div");r.className="app-item"+(n.id===a.currentAppId?" active":""),r.dataset.id=n.id;const t=document.createElement("span");t.className="app-item-name",t.textContent=n.name,r.appendChild(t),r.addEventListener("click",()=>{Z(n.id)}),we.appendChild(r)}}function Ue(){const e=a.apps.find(n=>n.id===a.currentAppId);if(e===void 0){je.classList.remove("hidden"),Ee.classList.add("hidden");return}je.classList.add("hidden"),Ee.classList.remove("hidden"),Rn.textContent=e.name,pe(),ue()}function pe(){xe.replaceChildren();for(const e of a.files){const n=document.createElement("div");n.className="file-tab"+(e.name===a.activeFileName?" active":""),n.textContent=e.name,n.addEventListener("click",()=>{X(),a.activeFileName=e.name}),xe.appendChild(n)}}function ue(){const e=a.files.find(n=>n.name===a.activeFileName);W.value=(e==null?void 0:e.content)??"",W.disabled=e===void 0}function Se(e){a.generating=e,ie.disabled=e,ie.innerHTML=e?'<span class="spinner"></span> Generating…':"Generate"}function F(e,n){const r=document.createElement("div");r.className=`chat-msg ${e}`;const t=document.createElement("div");t.className="chat-msg-role",t.textContent=e==="user"?"You":"Assistant";const s=document.createElement("div");s.className="chat-bubble",s.textContent=n,r.appendChild(t),r.appendChild(s),$.appendChild(r),$.scrollTop=$.scrollHeight}async function X(){if(a.activeFileName===null||a.currentAppId===null)return;const e=a.files.find(r=>r.name===a.activeFileName);if(e===void 0)return;const n=W.value;e.content!==n&&(e.content=n,await ae(e))}async function Z(e){var r;a.currentAppId=e;const n=await Ze(e);a.files=n,a.activeFileName=((r=n[0])==null?void 0:r.name)??null,$.replaceChildren()}function Je(){Me.textContent="New App",I.value="",C.classList.remove("hidden"),I.focus(),_.onclick=async()=>{const e=I.value.trim();if(e==="")return;C.classList.add("hidden");const n={id:U(),name:e,createdAt:R(),updatedAt:R()};await Q(n),a.apps=[...a.apps,n],await Z(n.id)}}function fe(){C.classList.add("hidden"),_.onclick=null}function Zn(){const e=a.apps.find(n=>n.id===a.currentAppId);e!==void 0&&(Me.textContent="Rename App",I.value=e.name,C.classList.remove("hidden"),I.focus(),I.select(),_.onclick=async()=>{const n=I.value.trim();if(n==="")return;C.classList.add("hidden");const r={...e,name:n,updatedAt:R()};await Q(r),a.apps=a.apps.map(t=>t.id===e.id?r:t)})}async function er(){const e=a.apps.find(n=>n.id===a.currentAppId);e!==void 0&&confirm(`Delete "${e.name}"? This cannot be undone.`)&&(await Xe(e.id),a.apps=a.apps.filter(n=>n.id!==e.id),a.currentAppId=null,a.files=[],a.activeFileName=null,$.replaceChildren(),J.src="about:blank")}async function Ve(){var r;const e=oe.value.trim();if(e==="")return;const n=Fe();if(n===""){F("assistant","No OpenAI API key set. Open Settings (⚙) to add your key. Generation is optional — you can also create files manually.");return}if(a.currentAppId===null){F("assistant","Please create or open an app first.");return}oe.value="",F("user",e),Se(!0);try{const t=await Sn(e,n),s=t.files.map(i=>({id:U(),appId:a.currentAppId,name:i.name,content:i.content}));await Re(a.currentAppId,s),a.files=s,a.activeFileName=((r=s[0])==null?void 0:r.name)??null;const o=a.apps.find(i=>i.id===a.currentAppId);if(o!==void 0){const i={...o,updatedAt:R()};await Q(i),a.apps=a.apps.map(u=>u.id===o.id?i:u)}F("assistant",`Generated ${s.length} file(s). ${t.description}`.trim()),Pe(J,s)}catch(t){const s=t instanceof Error?t.message:String(t);F("assistant",`Error: ${s}`)}finally{Se(!1)}}function K(){X().then(()=>{Pe(J,a.files)})}async function nr(){const e=a.apps.find(o=>o.id===a.currentAppId);if(e===void 0)return;await X();const n={app:e,files:a.files,exportedAt:R()},r=new Blob([JSON.stringify(n,null,2)],{type:"application/json"}),t=URL.createObjectURL(r),s=document.createElement("a");s.href=t,s.download=`${e.name.replace(/\s+/g,"-")}.json`,s.click(),URL.revokeObjectURL(t)}function rr(){H.value="",H.click()}async function tr(){var n;const e=(n=H.files)==null?void 0:n[0];if(e!==void 0)try{const r=await e.text(),t=JSON.parse(r);if(t.app===void 0||typeof t.app.name!="string"||!Array.isArray(t.files))throw new Error("Invalid app JSON format.");const s=U(),o={id:s,name:`${t.app.name} (imported)`,createdAt:t.app.createdAt??R(),updatedAt:R()},i=t.files.filter(u=>typeof u.name=="string"&&typeof u.content=="string").map(u=>({id:U(),appId:s,name:u.name,content:u.content}));await Q(o),await Re(s,i),a.apps=[...a.apps,o],await Z(s)}catch(r){const t=r instanceof Error?r.message:String(r);alert(`Import failed: ${t}`)}}function sr(){le.value=Fe(),q.classList.remove("hidden"),le.focus()}function ee(){q.classList.add("hidden")}function ar(){const e=De();e.apiKey=le.value.trim(),qn(e),ee()}a.on("set:apps",()=>$e());a.on("set:currentAppId",()=>{$e(),Ue()});a.on("set:files",()=>{pe(),ue()});a.on("set:activeFileName",()=>{pe(),ue()});Mn.addEventListener("click",Je);Bn.addEventListener("click",Je);Dn.addEventListener("click",Zn);Fn.addEventListener("click",()=>{er()});$n.addEventListener("click",()=>{nr()});ie.addEventListener("click",()=>{Ve()});Cn.addEventListener("click",K);Pn.addEventListener("click",K);Un.addEventListener("click",sr);Jn.addEventListener("click",ee);Vn.addEventListener("click",ar);_n.addEventListener("click",ee);q.addEventListener("click",e=>{e.target===q&&ee()});_.addEventListener("click",()=>{});Gn.addEventListener("click",fe);Wn.addEventListener("click",fe);C.addEventListener("click",e=>{e.target===C&&fe()});I.addEventListener("keydown",e=>{e.key==="Enter"&&_.click()});oe.addEventListener("keydown",e=>{e.key==="Enter"&&!e.shiftKey&&(e.preventDefault(),Ve())});W.addEventListener("blur",()=>{X()});H.addEventListener("change",()=>{tr()});const ne=document.createElement("button");ne.className="btn btn-ghost btn-full";ne.textContent="↑ Import";ne.addEventListener("click",rr);const Ae=document.querySelector(".sidebar-footer"),ke=document.getElementById("btn-settings");Ae!==null&&ke!==null&&Ae.insertBefore(ne,ke);window.listFileset=Kn;window.readFile=Yn;window.setFileContent=zn;window.deleteFile=Qn;window.evalInApp=Xn;async function or(){const e=await Qe();if(a.apps=e,e.length>0){const n=[...e].sort((r,t)=>t.updatedAt.localeCompare(r.updatedAt));await Z(n[0].id)}else Ue()}or().catch(e=>{console.error("App Builder init failed:",e)});
