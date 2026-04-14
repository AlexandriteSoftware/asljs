(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))r(s);new MutationObserver(s=>{for(const o of s)if(o.type==="childList")for(const i of o.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&r(i)}).observe(document,{childList:!0,subtree:!0});function t(s){const o={};return s.integrity&&(o.integrity=s.integrity),s.referrerPolicy&&(o.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?o.credentials="include":s.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function r(s){if(s.ep)return;s.ep=!0;const o=t(s);fetch(s.href,o)}})();class on extends Error{constructor(n,t,r,s,o){super(n),this.name="ListenerError",this.error=t,this.object=r,this.event=s,this.listener=o}}function D(e){if(typeof e!="string"&&typeof e!="symbol")throw new TypeError("Expect event to be a string or symbol.")}function Z(e){return typeof e=="function"}function Se(e){if(Z(e))return e}function De(e){return typeof e=="object"&&e!==null}function ie(e){if(!Z(e))throw new TypeError("Expect a function.")}const ln=(e=Object.create(null),n={})=>{if(!De(e)&&!Z(e))throw new TypeError("Expect an object or a function.");for(const l of["on","once","off","emit","emitAsync","has"])if(l in e)throw new Error(`Method "${l}" already exists.`);const{strict:t=!1,trace:r=null,error:s=null}=n,o=Se(r)??null,i=Se(s)??null,f=e!==R,y=(l,d)=>{o==null||o(l,d),f&&R.emit(l,d)};y("new",{object:e});const x=new Set,b=new Map,h={enumerable:!1,configurable:!0,writable:!0};return Object.defineProperties(e,{on:Object.assign({value:j},h),once:Object.assign({value:E},h),off:Object.assign({value:g},h),emit:Object.assign({value:k},h),emitAsync:Object.assign({value:T},h),has:Object.assign({value:A},h)}),e;function c(l,d){let u=b.get(l);u||b.set(l,u=new Set),u.add(d)}function v(l,d){const u=b.get(l);if(!u)return!1;const w=u.delete(d);return u.size===0&&b.delete(l),w}function m(l,d,u){const w={error:u,object:e,event:l,listener:d};if(i==null||i(w),e===R&&l==="error")throw new on("Error in a global error listener.",u,e,l,d);R.emit("error",w)}function j(l,d){D(l),ie(d),y("on",{object:e,event:l,listener:d}),c(l,d);let u=!0;return()=>u?(u=!1,v(l,d)):!1}function E(l,d){D(l),ie(d);const u=j(l,(...w)=>{u(),d(...w)});return u}function g(l,d){return D(l),ie(d),y("off",{object:e,event:l,listener:d}),v(l,d)}function A(l){var d;return D(l),(((d=b.get(l))==null?void 0:d.size)??0)>0}function k(l,...d){D(l);const u=b.get(l)||x;if(y("emit",{object:e,listeners:[...u],event:l,args:d}),u.size!==0)for(const w of u)try{w(...d)}catch(I){if(m(l,w,I),t)throw I}}async function T(l,...d){D(l);const u=b.get(l)||x;if(y("emitAsync",{object:e,listeners:[...u],event:l,args:d}),u.size===0)return;const w=[...u].map(async I=>{try{await I(...d)}catch(je){if(m(l,I,je),t)throw je}});await(t?Promise.all(w):Promise.allSettled(w))}},R=ln;R(R);function cn(e){return!De(e)&&!Z(e)?!1:typeof e.on=="function"}function Be(e){if(cn(e))return e}function L(e){return typeof e=="function"}function be(e){return typeof e=="object"&&e!==null}function $e(e){if(!L(e))throw new TypeError("Expect a function.")}function ce(e){if(e.trim()==="")throw new TypeError("Expect watch path to be a non-empty string.");const n=e.split(".");for(const t of n)if(t.trim()==="")throw new TypeError("Expect watch path segments to be non-empty.");return e.split(".").map(t=>t.trim()).filter(t=>t!=="")}function dn(e,n){const t=ce(n);if(t.length===0)return;let r=e;for(const s of t){if(!be(r)||!(s in r))return;r=r[s]}return r}const Ue=(e,n,t)=>{if(Array.isArray(e))throw new TypeError("Watching arrays is not supported.");$e(t);const r=typeof n=="string"?[n]:n;if(!Array.isArray(r))throw new TypeError("Expect properties to be a string or an array of strings.");for(const i of r){if(typeof i!="string")throw new TypeError("Expect properties to be a string or an array of strings.");ce(i)}const s=()=>r.map(i=>dn(e,i)),o=[];for(const i of r){const f=ce(i);let y=null;const x=()=>{const b=[],h=(c,v)=>{if(!be(c)||v>=f.length)return;const m=f[v],j=Be(c);if(j){const E=j.on(`set:${m}`,()=>{t(...s()),v<f.length-1&&y&&(y(),y=x())});b.push(E)}v<f.length-1&&h(c[m],v+1)};return h(e,0),()=>b.reduce((c,v)=>v()||c,!1)};y=x(),o.push(()=>y?y():!1)}return t(...s()),()=>o.reduce((i,f)=>f()||i,!1)};function pn(e,n){"watch"in e||Object.defineProperty(e,"watch",{configurable:!0,writable:!0,enumerable:!1,value(t,r){return n(typeof t=="string"?this:this,t,r)}})}function Ae(e,n){return Object.prototype.hasOwnProperty.call(e,n)}function le(e){if(typeof e=="symbol")return!1;const n=typeof e=="number"?e:Number(e);return!Number.isInteger(n)||n<0||n>=4294967295?!1:typeof e=="number"||e===String(n)}function un(e){return Be(e)?L(e.emit):!1}const _e=(e,n={})=>{const{eventful:t=R,trace:r=null,shallow:s=!1}=n;$e(t);const o=ee.options,i=new WeakMap,f=c=>{if(s||!be(c)||un(c))return c;if(i.has(c))return i.get(c);const v=_e(c,{eventful:t,trace:r,shallow:s});return i.set(c,v),v},y=c=>{if(!s){if(Array.isArray(c)){for(let v=0;v<c.length;v++)c[v]=f(c[v]);return}for(const v of Reflect.ownKeys(c))Ae(c,v)&&(c[v]=f(c[v]))}},x=c=>{const v=Array.isArray(c);y(c),pn(c,Ue);let m;const j=new Proxy(c,{set(E,g,A,k){const T=v&&le(g),l=Reflect.get(E,g,k),d=Reflect.set(E,g,f(A),k);if(m&&d){const u=Reflect.get(E,g,k);if(!Object.is(l,u)){const w=T?{index:Number(g),value:u,previous:l}:{property:g,value:u,previous:l},I=r||o.trace;m.emit(`set:${String(g)}`,w),L(I)&&I(m,"set",w),m.emit("set",w)}}return d},deleteProperty(E,g){const A=v&&le(g),k=Ae(E,g),T=k?E[g]:void 0,l=Reflect.deleteProperty(E,g);if(m&&l&&k){const d=A?{index:Number(g),previous:T}:{property:g,previous:T},u=r||o.trace;m.emit(`delete:${String(g)}`,d),L(u)&&u(m,"delete",d),m.emit("delete",d)}return l},defineProperty(E,g,A){const k=Object.getOwnPropertyDescriptor(E,g)??null,T=Object.prototype.hasOwnProperty.call(A,"value")?{...A,value:f(A.value)}:A,l=Reflect.defineProperty(E,g,T),d=v&&(g==="length"||le(g));if(m&&!d&&l){const u={property:g,descriptor:T,previous:k},w=r||o.trace;m.emit(`define:${String(g)}`,u),L(w)&&w(m,"define",u),m.emit("define",u)}return l}});return m=L(c==null?void 0:c.emit)?j:t(j),m},b=r||o.trace;if(Array.isArray(e)){const c=x(e);return L(b)&&b(c,"new"),c}if(e!==null&&typeof e=="object"){const c=x(e);return L(b)&&b(c,"new",{object:c}),c}const h=t({get value(){return e},set value(c){if(Object.is(c,e))return;const v=e;e=c;const m={property:"value",value:e,previous:v};h.emit("set:value",m),L(b)&&b(h,"set",m),h.emit("set",m)}});return L(b)&&b(h,"new",{object:h}),h},ee=_e;ee.options={trace:null};ee.watch=Ue;const a=ee({apps:[],currentAppId:null,files:[],activeFileName:null,generating:!1,error:null});function S(e){return new Promise((n,t)=>{e.addEventListener("success",()=>{n(e.result)}),e.addEventListener("error",()=>{t(e.error??new Error("IndexedDB request failed"))})})}function fn(e,n){return new Promise((t,r)=>{const s=indexedDB.open(e,n.length);s.addEventListener("upgradeneeded",o=>{const i=n.slice(o.oldVersion-1,o.newVersion??n.length-1);for(const f of i)f(s.result)}),s.addEventListener("success",()=>{t(s.result)}),s.addEventListener("blocked",()=>{r(new Error("Database opening is blocked"))}),s.addEventListener("error",()=>{r(s.error??new Error("Failed to open database"))})})}const mn="asljs-app-builder";let G=null;async function M(){return G!==null||(G=await fn(mn,[e=>{e.createObjectStore("apps",{keyPath:"id"}),e.createObjectStore("files",{keyPath:"id"}).createIndex("byAppId","appId",{unique:!1})}])),G}async function bn(){const n=(await M()).transaction("apps","readonly");return S(n.objectStore("apps").getAll())}async function ne(e){const t=(await M()).transaction("apps","readwrite");await S(t.objectStore("apps").put(e))}async function vn(e){const t=(await M()).transaction(["apps","files"],"readwrite");await S(t.objectStore("apps").delete(e));const r=t.objectStore("files"),s=await S(r.index("byAppId").getAllKeys(e));for(const o of s)await S(r.delete(o))}async function hn(e){const t=(await M()).transaction("files","readonly");return S(t.objectStore("files").index("byAppId").getAll(e))}async function de(e){const t=(await M()).transaction("files","readwrite");await S(t.objectStore("files").put(e))}async function gn(e){const t=(await M()).transaction("files","readwrite");await S(t.objectStore("files").delete(e))}async function yn(e,n){const s=(await M()).transaction("files","readwrite").objectStore("files"),o=await S(s.index("byAppId").getAllKeys(e));for(const i of o)await S(s.delete(i));for(const i of n)await S(s.put(i))}const wn=`# observable\r
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
`,xn=`# eventful\r
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
`,En=`# data-binding\r
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
`,jn=`# components\r
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
`,Sn=`# dali\r
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
`,An=`export {\r
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
`,kn=`export {\r
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
`,Ln=`export {\r
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
`,Tn=`export {\r
    List,\r
    type ListItem,\r
    type ListItemsSource,\r
    type ListRowContext,\r
  } from './list.js';\r
`,In=`export {\r
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
`,On=`{
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
`,Nn=`{\r
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
`,Pn=`{\r
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
`,Rn=`{\r
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
`,Cn=`{\r
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
`,Fn=[{type:"function",name:"listFileset",description:"List all file paths in the virtual filesystem.",parameters:{type:"object",properties:{},required:[],additionalProperties:!1},strict:!0},{type:"function",name:"readFile",description:"Read the full text content of a file.",parameters:{type:"object",properties:{path:{type:"string"}},required:["path"],additionalProperties:!1},strict:!0},{type:"function",name:"setFileContent",description:"Create or fully replace file content.",parameters:{type:"object",properties:{path:{type:"string"},content:{type:"string"}},required:["path","content"],additionalProperties:!1},strict:!0},{type:"function",name:"replaceFilePart",description:"Replace part of a file by exact search string.",parameters:{type:"object",properties:{path:{type:"string"},search:{type:"string"},replacement:{type:"string"},replaceAll:{type:"boolean"}},required:["path","search","replacement","replaceAll"],additionalProperties:!1},strict:!0},{type:"function",name:"deleteFile",description:"Delete a file from the virtual filesystem.",parameters:{type:"object",properties:{path:{type:"string"}},required:["path"],additionalProperties:!1},strict:!0},{type:"function",name:"evalInApp",description:"Evaluate JavaScript in the running app document context.",parameters:{type:"object",properties:{code:{type:"string"}},required:["code"],additionalProperties:!1},strict:!0}],Mn="https://api.openai.com/v1/responses",Dn=W(On,"asljs-observable"),Bn=W(Nn,"asljs-eventful"),$n=W(Pn,"asljs-data-binding"),Un=W(Rn,"asljs-components"),_n=W(Cn,"asljs-dali"),Je=Hn(),Jn="gpt-5.3-codex",J=20;function Vn(){return Je}const Wn=12;async function qn(e,n,t,r,s){var x;let o,i=e,f=Gn(s==null?void 0:s.initialToolStepLimit),y=0;for(;;){if(y>=f){if(!(await((x=s==null?void 0:s.onToolStepLimit)==null?void 0:x.call(s,{stepsCompleted:y,stepLimit:f}))??!1))throw new Error("AI exceeded maximum tool steps without completing.");f+=Wn}const b=await fetch(Mn,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${n}`},body:JSON.stringify({model:t,instructions:Je,temperature:.1,previous_response_id:o,input:i,tools:Fn})});if(!b.ok){const m=await b.json().catch(()=>({})),j=Kn(m)??`OpenAI API error: ${b.status}`;throw new Error(j)}const h=await b.json();if(!Array.isArray(h.output))throw new Error("AI returned an unexpected response format.");const c=h.output.filter(Qn);if(c.length===0){const m=et(h);return{summary:m===""?"Completed tool-based update.":m}}const v=[];for(const m of c){const j=await zn(m,r);v.push({type:"function_call_output",call_id:Zn(m),output:j})}o=typeof h.id=="string"?h.id:o,i=v,y+=1}}function Gn(e){if(!Number.isFinite(e))return J;const n=Math.floor(e);return n>=1?n:J}function Hn(){const e=`
      Latest ASLJS package versions to use:
      - asljs-eventful@${Bn}
      - asljs-observable@${Dn}
      - asljs-data-binding@${$n}
      - asljs-components@${Un}
      - asljs-dali@${_n}
    `,n=[$("eventful",xn,kn),$("observable",wn,An),$("data-binding",En,Ln),$("components",jn,Tn),$("dali",Sn,In)].join(`

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
`.trim()}function $(e,n,t){return`
[${e}] README excerpt:
${ke(n,9e3)}

[${e}] exported API/types excerpt:
${ke(t,6e3)}
`.trim()}function ke(e,n){return e.length<=n?e:`${e.slice(0,n)}
... [truncated]`}function W(e,n){try{return JSON.parse(e).version??"latest"}catch{return console.warn(`Failed to parse package metadata for ${n}.`),"latest"}}function Kn(e){const n=e.error;return typeof(n==null?void 0:n.message)=="string"?n.message:null}async function zn(e,n){const t=Xn(e),r=Yn(e.arguments);try{switch(t){case"listFileset":{const s=await n.listFileset();return B(s)}case"readFile":{const s=await n.readFile(O(r,"path"));return B(s)}case"setFileContent":return await n.setFileContent(O(r,"path"),O(r,"content")),B("ok");case"replaceFilePart":return await n.replaceFilePart(O(r,"path"),O(r,"search"),O(r,"replacement"),nt(r,"replaceAll",!1)),B("ok");case"deleteFile":return await n.deleteFile(O(r,"path")),B("ok");case"evalInApp":{const s=await n.evalInApp(O(r,"code"));return B(s)}default:return Le(`Unknown tool: ${t}`)}}catch(s){return Le(s instanceof Error?s.message:String(s))}}function Yn(e){if(e===void 0)return{};if(typeof e=="object"&&e!==null)return e;if(typeof e!="string")throw new Error("Invalid tool arguments value.");try{const n=JSON.parse(e);if(typeof n!="object"||n===null)throw new Error("Tool arguments must be a JSON object.");return n}catch{throw new Error("Invalid tool arguments JSON.")}}function Qn(e){return e.type==="function_call"}function Xn(e){if(typeof e.name!="string"||e.name.trim()==="")throw new Error("Tool call missing function name.");return e.name}function Zn(e){if(typeof e.call_id!="string"||e.call_id.trim()==="")throw new Error("Tool call missing call_id.");return e.call_id}function et(e){return typeof e.output_text=="string"&&e.output_text.trim()!==""?e.output_text.trim():Array.isArray(e.output)?e.output.filter(t=>t.type==="message").flatMap(t=>t.content??[]).map(t=>t.text??"").map(t=>t.trim()).filter(t=>t!=="").join(`
`):""}function O(e,n){const t=e[n];if(typeof t!="string")throw new Error(`Tool argument "${n}" must be a string.`);return t}function nt(e,n,t){const r=e[n];if(r===void 0)return t;if(typeof r!="boolean")throw new Error(`Tool argument "${n}" must be a boolean.`);return r}function B(e){return Ve({ok:!0,value:e})}function Le(e){return Ve({ok:!1,error:e})}function Ve(e){try{return JSON.stringify(e)}catch{return'{"ok":false,"error":"Failed to serialize tool result."}'}}let U=null;const ve="asljs-app-builder:eval-request",We="asljs-app-builder:eval-response",Te=`<script>
(() => {
  const REQUEST = '${ve}';
  const RESPONSE = '${We}';

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
<\/script>`;function tt(e,n){if(U!==null&&(URL.revokeObjectURL(U),U=null),n.length===0){e.src="about:blank";return}const t=n.find(i=>i.name==="index.html")??n.find(i=>i.name.endsWith(".html"))??null;if(t===null){e.src="about:blank";return}let r=t.content;const s=n.find(i=>i.name==="style.css")??n.find(i=>i.name.endsWith(".css"))??null;s!==null&&(r=r.replace(/<link[^>]+href=["']style\.css["'][^>]*>/gi,`<style>${s.content}</style>`),r=r.replace(/<link[^>]+href=["']([^"']+\.css)["'][^>]*>/gi,`<style>${s.content}</style>`));for(const i of n){if(!i.name.endsWith(".js"))continue;const f=i.name.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");r=r.replace(new RegExp(`(<script[^>]*?)\\s+src=["']${f}["']([^>]*)><\\/script>`,"gi"),(y,x,b)=>{const h=`${String(x)} ${String(b)}`;return/type=["']module["']/i.test(h)?`<script type="module">${i.content}<\/script>`:`<script>${i.content}<\/script>`})}r=rt(r);const o=new Blob([r],{type:"text/html"});U=URL.createObjectURL(o),e.src=U}async function Ie(e,n){const t=e.contentWindow;if(t===null)throw new Error("Preview frame is not available.");const r=crypto.randomUUID();return new Promise((s,o)=>{const i=window.setTimeout(()=>{y(),o(new Error("Timed out waiting for app evaluation result."))},5e3),f=x=>{if(x.source!==t)return;const b=x.data;if(!(b.type!==We||b.id!==r)){if(y(),b.ok===!0){s(b.value);return}o(new Error(b.error??"Unknown preview evaluation error."))}};function y(){window.clearTimeout(i),window.removeEventListener("message",f)}window.addEventListener("message",f),t.postMessage({type:ve,id:r,code:n},"*")})}function rt(e){return e.includes(ve)?e:e.includes("</body>")?e.replace("</body>",`${Te}</body>`):`${e}
${Te}`}function H(){return crypto.randomUUID()}function C(){return new Date().toISOString()}function p(e){const n=document.getElementById(e);if(n===null)throw new Error(`Missing element #${e}`);return n}const Oe=p("app-list"),Ne=p("empty-state"),Pe=p("app-workspace"),st=p("app-name-display"),Re=p("file-tabs"),K=p("file-content"),_=p("chat-messages"),pe=p("chat-input"),ue=p("btn-generate"),at=p("btn-run"),ot=p("btn-refresh-preview"),z=p("preview-frame"),it=p("btn-new-app"),lt=p("btn-new-app-2"),ct=p("btn-rename"),dt=p("btn-delete-app"),pt=p("btn-export"),ut=p("btn-settings"),ft=p("btn-agent-instructions"),Y=p("settings-modal"),mt=p("btn-close-settings"),bt=p("btn-save-settings"),vt=p("btn-cancel-settings"),fe=p("api-key-input"),qe=p("model-select"),Ge=p("max-tool-steps-input"),F=p("name-modal"),He=p("name-modal-title"),N=p("app-name-input"),q=p("btn-confirm-name"),ht=p("btn-cancel-name"),gt=p("btn-close-name-modal"),Q=p("import-file"),X=p("agent-instructions-modal"),me=p("agent-instructions-text"),yt=p("btn-close-agent-instructions"),wt=p("btn-close-agent-instructions-2"),xt=p("btn-copy-agent-instructions"),Ke="asljs-app-builder-settings";function te(){try{const e=localStorage.getItem(Ke)??"{}";return JSON.parse(e)}catch{return{}}}function Et(e){localStorage.setItem(Ke,JSON.stringify(e))}function ze(){return te().apiKey??""}function Ye(){const e=te().model;return e==="gpt-5.3-codex"||e==="gpt-5.4"?e:Jn}function Qe(){const e=te().maxToolSteps;if(!Number.isFinite(e))return J;const n=Math.floor(e);return n<1?J:n}function jt(){if(a.currentAppId===null)throw new Error("No active app. Create or open an app first.");return a.currentAppId}async function Xe(){return[...a.files].map(e=>e.name).sort((e,n)=>e.localeCompare(n))}async function he(e){const n=a.files.find(t=>t.name===e);if(n===void 0)throw new Error(`File not found: ${e}`);return n.content}async function ge(e,n){const t=jt(),r=a.files.find(o=>o.name===e);if(r!==void 0){const o={...r,content:n};await de(o),a.files=a.files.map(i=>i.id===o.id?o:i),a.activeFileName=o.name;return}const s={id:H(),appId:t,name:e,content:n};await de(s),a.files=[...a.files,s],a.activeFileName=s.name}async function Ze(e){var r;const n=a.files.find(s=>s.name===e);if(n===void 0)return;await gn(n.id);const t=a.files.filter(s=>s.id!==n.id);a.files=t,a.activeFileName===e&&(a.activeFileName=((r=t[0])==null?void 0:r.name)??null)}async function en(e,n,t,r=!1){if(n==="")throw new Error("Search text cannot be empty.");const s=await he(e);if(!s.includes(n))throw new Error(`Search text not found in ${e}.`);let o=s;if(r)o=s.split(n).join(t);else{const i=s.indexOf(n);if(s.indexOf(n,i+n.length)!==-1)throw new Error("Search text is ambiguous. Use replaceAll=true or provide a more specific search block.");o=s.slice(0,i)+t+s.slice(i+n.length)}await ge(e,o)}async function nn(e){if(a.files.length===0)throw new Error("No files available to run.");V();try{return await Ie(z,e)}catch{return V(),Ie(z,e)}}function tn(){Oe.replaceChildren();const e=[...a.apps].sort((n,t)=>t.updatedAt.localeCompare(n.updatedAt));for(const n of e){const t=document.createElement("div");t.className="app-item"+(n.id===a.currentAppId?" active":""),t.dataset.id=n.id;const r=document.createElement("span");r.className="app-item-name",r.textContent=n.name,t.appendChild(r),t.addEventListener("click",()=>{se(n.id)}),Oe.appendChild(t)}}function rn(){const e=a.apps.find(n=>n.id===a.currentAppId);if(e===void 0){Ne.classList.remove("hidden"),Pe.classList.add("hidden");return}Ne.classList.add("hidden"),Pe.classList.remove("hidden"),st.textContent=e.name,ye(),we()}function ye(){Re.replaceChildren();for(const e of a.files){const n=document.createElement("div");n.className="file-tab"+(e.name===a.activeFileName?" active":""),n.textContent=e.name,n.addEventListener("click",()=>{re(),a.activeFileName=e.name}),Re.appendChild(n)}}function we(){const e=a.files.find(n=>n.name===a.activeFileName);K.value=(e==null?void 0:e.content)??"",K.disabled=e===void 0}function Ce(e){a.generating=e,ue.disabled=e,ue.innerHTML=e?'<span class="spinner"></span> Generating…':"Generate"}function P(e,n){const t=document.createElement("div");t.className=`chat-msg ${e}`;const r=document.createElement("div");r.className="chat-msg-role",r.textContent=e==="user"?"You":"Assistant";const s=document.createElement("div");s.className="chat-bubble",s.textContent=n,t.appendChild(r),t.appendChild(s),_.appendChild(t),_.scrollTop=_.scrollHeight}async function re(){if(a.activeFileName===null||a.currentAppId===null)return;const e=a.files.find(t=>t.name===a.activeFileName);if(e===void 0)return;const n=K.value;e.content!==n&&(e.content=n,await de(e))}async function se(e){var t;a.currentAppId=e;const n=await hn(e);a.files=n,a.activeFileName=((t=n[0])==null?void 0:t.name)??null,_.replaceChildren()}function sn(){He.textContent="New App",N.value="",F.classList.remove("hidden"),N.focus(),q.onclick=async()=>{const e=N.value.trim();if(e==="")return;F.classList.add("hidden");const n={id:H(),name:e,createdAt:C(),updatedAt:C()};await ne(n),a.apps=[...a.apps,n],await se(n.id)}}function xe(){F.classList.add("hidden"),q.onclick=null}function St(){const e=a.apps.find(n=>n.id===a.currentAppId);e!==void 0&&(He.textContent="Rename App",N.value=e.name,F.classList.remove("hidden"),N.focus(),N.select(),q.onclick=async()=>{const n=N.value.trim();if(n==="")return;F.classList.add("hidden");const t={...e,name:n,updatedAt:C()};await ne(t),a.apps=a.apps.map(r=>r.id===e.id?t:r)})}async function At(){const e=a.apps.find(n=>n.id===a.currentAppId);e!==void 0&&confirm(`Delete "${e.name}"? This cannot be undone.`)&&(await vn(e.id),a.apps=a.apps.filter(n=>n.id!==e.id),a.currentAppId=null,a.files=[],a.activeFileName=null,_.replaceChildren(),z.src="about:blank")}async function an(){const e=pe.value.trim();if(e==="")return;const n=ze();if(n===""){P("assistant","No OpenAI API key set. Open Settings (⚙) to add your key. Generation is optional — you can also create files manually.");return}if(a.currentAppId===null){P("assistant","Please create or open an app first.");return}pe.value="",P("user",e),Ce(!0);try{const t=Ye(),r=Qe(),s=await qn(e,n,t,{listFileset:Xe,readFile:he,setFileContent:ge,replaceFilePart:en,deleteFile:Ze,evalInApp:nn},{initialToolStepLimit:r,onToolStepLimit:async({stepsCompleted:i})=>confirm(`AI reached ${i} tool steps without finishing. Continue for 12 more steps?`)}),o=a.apps.find(i=>i.id===a.currentAppId);if(o!==void 0){const i={...o,updatedAt:C()};await ne(i),a.apps=a.apps.map(f=>f.id===o.id?i:f)}P("assistant",s.summary),V()}catch(t){const r=t instanceof Error?t.message:String(t);P("assistant",`Error: ${r}`)}finally{Ce(!1)}}function V(){re().then(()=>{tt(z,a.files)})}async function kt(){const e=a.apps.find(o=>o.id===a.currentAppId);if(e===void 0)return;await re();const n={app:e,files:a.files,exportedAt:C()},t=new Blob([JSON.stringify(n,null,2)],{type:"application/json"}),r=URL.createObjectURL(t),s=document.createElement("a");s.href=r,s.download=`${e.name.replace(/\s+/g,"-")}.json`,s.click(),URL.revokeObjectURL(r)}function Lt(){Q.value="",Q.click()}async function Tt(){var n;const e=(n=Q.files)==null?void 0:n[0];if(e!==void 0)try{const t=await e.text(),r=JSON.parse(t);if(r.app===void 0||typeof r.app.name!="string"||!Array.isArray(r.files))throw new Error("Invalid app JSON format.");const s=H(),o={id:s,name:`${r.app.name} (imported)`,createdAt:r.app.createdAt??C(),updatedAt:C()},i=r.files.filter(f=>typeof f.name=="string"&&typeof f.content=="string").map(f=>({id:H(),appId:s,name:f.name,content:f.content}));await ne(o),await yn(s,i),a.apps=[...a.apps,o],await se(s)}catch(t){const r=t instanceof Error?t.message:String(t);alert(`Import failed: ${r}`)}}function It(){fe.value=ze(),qe.value=Ye(),Ge.value=String(Qe()),Y.classList.remove("hidden"),fe.focus()}function ae(){Y.classList.add("hidden")}function Ot(){const e=te();e.apiKey=fe.value.trim(),e.model=qe.value==="gpt-5.4"?"gpt-5.4":"gpt-5.3-codex";const n=Number.parseInt(Ge.value,10);e.maxToolSteps=Number.isFinite(n)&&n>=1?n:J,Et(e),ae()}function Nt(){me.value=Vn(),X.classList.remove("hidden"),me.scrollTop=0}function Ee(){X.classList.add("hidden")}async function Pt(){const e=me.value;try{await navigator.clipboard.writeText(e),P("assistant","Agent instructions copied to clipboard.")}catch{P("assistant","Could not copy to clipboard automatically. You can still select and copy from the instructions modal.")}}a.on("set:apps",()=>tn());a.on("set:currentAppId",()=>{tn(),rn()});a.on("set:files",()=>{ye(),we()});a.on("set:activeFileName",()=>{ye(),we()});it.addEventListener("click",sn);lt.addEventListener("click",sn);ct.addEventListener("click",St);dt.addEventListener("click",()=>{At()});pt.addEventListener("click",()=>{kt()});ue.addEventListener("click",()=>{an()});at.addEventListener("click",V);ot.addEventListener("click",V);ut.addEventListener("click",It);ft.addEventListener("click",Nt);mt.addEventListener("click",ae);bt.addEventListener("click",Ot);vt.addEventListener("click",ae);Y.addEventListener("click",e=>{e.target===Y&&ae()});yt.addEventListener("click",Ee);wt.addEventListener("click",Ee);xt.addEventListener("click",()=>{Pt()});X.addEventListener("click",e=>{e.target===X&&Ee()});q.addEventListener("click",()=>{});ht.addEventListener("click",xe);gt.addEventListener("click",xe);F.addEventListener("click",e=>{e.target===F&&xe()});N.addEventListener("keydown",e=>{e.key==="Enter"&&q.click()});pe.addEventListener("keydown",e=>{e.key==="Enter"&&!e.shiftKey&&(e.preventDefault(),an())});K.addEventListener("blur",()=>{re()});Q.addEventListener("change",()=>{Tt()});const oe=document.createElement("button");oe.className="btn btn-ghost btn-full";oe.textContent="↑ Import";oe.addEventListener("click",Lt);const Fe=document.querySelector(".sidebar-footer"),Me=document.getElementById("btn-settings");Fe!==null&&Me!==null&&Fe.insertBefore(oe,Me);window.listFileset=Xe;window.readFile=he;window.setFileContent=ge;window.replaceFilePart=en;window.deleteFile=Ze;window.evalInApp=nn;async function Rt(){const e=await bn();if(a.apps=e,e.length>0){const n=[...e].sort((t,r)=>r.updatedAt.localeCompare(t.updatedAt));await se(n[0].id)}else rn()}Rt().catch(e=>{console.error("App Builder init failed:",e)});
