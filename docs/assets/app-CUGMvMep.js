(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))r(s);new MutationObserver(s=>{for(const o of s)if(o.type==="childList")for(const i of o.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&r(i)}).observe(document,{childList:!0,subtree:!0});function t(s){const o={};return s.integrity&&(o.integrity=s.integrity),s.referrerPolicy&&(o.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?o.credentials="include":s.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function r(s){if(s.ep)return;s.ep=!0;const o=t(s);fetch(s.href,o)}})();class nn extends Error{constructor(n,t,r,s,o){super(n),this.name="ListenerError",this.error=t,this.object=r,this.event=s,this.listener=o}}function D(e){if(typeof e!="string"&&typeof e!="symbol")throw new TypeError("Expect event to be a string or symbol.")}function X(e){return typeof e=="function"}function Ee(e){if(X(e))return e}function Fe(e){return typeof e=="object"&&e!==null}function ae(e){if(!X(e))throw new TypeError("Expect a function.")}const tn=(e=Object.create(null),n={})=>{if(!Fe(e)&&!X(e))throw new TypeError("Expect an object or a function.");for(const l of["on","once","off","emit","emitAsync","has"])if(l in e)throw new Error(`Method "${l}" already exists.`);const{strict:t=!1,trace:r=null,error:s=null}=n,o=Ee(r)??null,i=Ee(s)??null,f=e!==R,y=(l,d)=>{o==null||o(l,d),f&&R.emit(l,d)};y("new",{object:e});const j=new Set,m=new Map,v={enumerable:!1,configurable:!0,writable:!0};return Object.defineProperties(e,{on:Object.assign({value:T},v),once:Object.assign({value:E},v),off:Object.assign({value:g},v),emit:Object.assign({value:A},v),emitAsync:Object.assign({value:L},v),has:Object.assign({value:S},v)}),e;function c(l,d){let u=m.get(l);u||m.set(l,u=new Set),u.add(d)}function b(l,d){const u=m.get(l);if(!u)return!1;const w=u.delete(d);return u.size===0&&m.delete(l),w}function h(l,d,u){const w={error:u,object:e,event:l,listener:d};if(i==null||i(w),e===R&&l==="error")throw new nn("Error in a global error listener.",u,e,l,d);R.emit("error",w)}function T(l,d){D(l),ae(d),y("on",{object:e,event:l,listener:d}),c(l,d);let u=!0;return()=>u?(u=!1,b(l,d)):!1}function E(l,d){D(l),ae(d);const u=T(l,(...w)=>{u(),d(...w)});return u}function g(l,d){return D(l),ae(d),y("off",{object:e,event:l,listener:d}),b(l,d)}function S(l){var d;return D(l),(((d=m.get(l))==null?void 0:d.size)??0)>0}function A(l,...d){D(l);const u=m.get(l)||j;if(y("emit",{object:e,listeners:[...u],event:l,args:d}),u.size!==0)for(const w of u)try{w(...d)}catch(I){if(h(l,w,I),t)throw I}}async function L(l,...d){D(l);const u=m.get(l)||j;if(y("emitAsync",{object:e,listeners:[...u],event:l,args:d}),u.size===0)return;const w=[...u].map(async I=>{try{await I(...d)}catch(je){if(h(l,I,je),t)throw je}});await(t?Promise.all(w):Promise.allSettled(w))}},R=tn;R(R);function rn(e){return!Fe(e)&&!X(e)?!1:typeof e.on=="function"}function Me(e){if(rn(e))return e}function k(e){return typeof e=="function"}function fe(e){return typeof e=="object"&&e!==null}function De(e){if(!k(e))throw new TypeError("Expect a function.")}function ie(e){if(e.trim()==="")throw new TypeError("Expect watch path to be a non-empty string.");const n=e.split(".");for(const t of n)if(t.trim()==="")throw new TypeError("Expect watch path segments to be non-empty.");return e.split(".").map(t=>t.trim()).filter(t=>t!=="")}function sn(e,n){const t=ie(n);if(t.length===0)return;let r=e;for(const s of t){if(!fe(r)||!(s in r))return;r=r[s]}return r}const Be=(e,n,t)=>{if(Array.isArray(e))throw new TypeError("Watching arrays is not supported.");De(t);const r=typeof n=="string"?[n]:n;if(!Array.isArray(r))throw new TypeError("Expect properties to be a string or an array of strings.");for(const i of r){if(typeof i!="string")throw new TypeError("Expect properties to be a string or an array of strings.");ie(i)}const s=()=>r.map(i=>sn(e,i)),o=[];for(const i of r){const f=ie(i);let y=null;const j=()=>{const m=[],v=(c,b)=>{if(!fe(c)||b>=f.length)return;const h=f[b],T=Me(c);if(T){const E=T.on(`set:${h}`,()=>{t(...s()),b<f.length-1&&y&&(y(),y=j())});m.push(E)}b<f.length-1&&v(c[h],b+1)};return v(e,0),()=>m.reduce((c,b)=>b()||c,!1)};y=j(),o.push(()=>y?y():!1)}return t(...s()),()=>o.reduce((i,f)=>f()||i,!1)};function an(e,n){"watch"in e||Object.defineProperty(e,"watch",{configurable:!0,writable:!0,enumerable:!1,value(t,r){return n(typeof t=="string"?this:this,t,r)}})}function xe(e,n){return Object.prototype.hasOwnProperty.call(e,n)}function oe(e){if(typeof e=="symbol")return!1;const n=typeof e=="number"?e:Number(e);return!Number.isInteger(n)||n<0||n>=4294967295?!1:typeof e=="number"||e===String(n)}function on(e){return Me(e)?k(e.emit):!1}const $e=(e,n={})=>{const{eventful:t=R,trace:r=null,shallow:s=!1}=n;De(t);const o=Z.options,i=new WeakMap,f=c=>{if(s||!fe(c)||on(c))return c;if(i.has(c))return i.get(c);const b=$e(c,{eventful:t,trace:r,shallow:s});return i.set(c,b),b},y=c=>{if(!s){if(Array.isArray(c)){for(let b=0;b<c.length;b++)c[b]=f(c[b]);return}for(const b of Reflect.ownKeys(c))xe(c,b)&&(c[b]=f(c[b]))}},j=c=>{const b=Array.isArray(c);y(c),an(c,Be);let h;const T=new Proxy(c,{set(E,g,S,A){const L=b&&oe(g),l=Reflect.get(E,g,A),d=Reflect.set(E,g,f(S),A);if(h&&d){const u=Reflect.get(E,g,A);if(!Object.is(l,u)){const w=L?{index:Number(g),value:u,previous:l}:{property:g,value:u,previous:l},I=r||o.trace;h.emit(`set:${String(g)}`,w),k(I)&&I(h,"set",w),h.emit("set",w)}}return d},deleteProperty(E,g){const S=b&&oe(g),A=xe(E,g),L=A?E[g]:void 0,l=Reflect.deleteProperty(E,g);if(h&&l&&A){const d=S?{index:Number(g),previous:L}:{property:g,previous:L},u=r||o.trace;h.emit(`delete:${String(g)}`,d),k(u)&&u(h,"delete",d),h.emit("delete",d)}return l},defineProperty(E,g,S){const A=Object.getOwnPropertyDescriptor(E,g)??null,L=Object.prototype.hasOwnProperty.call(S,"value")?{...S,value:f(S.value)}:S,l=Reflect.defineProperty(E,g,L),d=b&&(g==="length"||oe(g));if(h&&!d&&l){const u={property:g,descriptor:L,previous:A},w=r||o.trace;h.emit(`define:${String(g)}`,u),k(w)&&w(h,"define",u),h.emit("define",u)}return l}});return h=k(c==null?void 0:c.emit)?T:t(T),h},m=r||o.trace;if(Array.isArray(e)){const c=j(e);return k(m)&&m(c,"new"),c}if(e!==null&&typeof e=="object"){const c=j(e);return k(m)&&m(c,"new",{object:c}),c}const v=t({get value(){return e},set value(c){if(Object.is(c,e))return;const b=e;e=c;const h={property:"value",value:e,previous:b};v.emit("set:value",h),k(m)&&m(v,"set",h),v.emit("set",h)}});return k(m)&&m(v,"new",{object:v}),v},Z=$e;Z.options={trace:null};Z.watch=Be;const a=Z({apps:[],currentAppId:null,files:[],activeFileName:null,generating:!1,error:null});function x(e){return new Promise((n,t)=>{e.addEventListener("success",()=>{n(e.result)}),e.addEventListener("error",()=>{t(e.error??new Error("IndexedDB request failed"))})})}function ln(e,n){return new Promise((t,r)=>{const s=indexedDB.open(e,n.length);s.addEventListener("upgradeneeded",o=>{const i=n.slice(o.oldVersion-1,o.newVersion??n.length-1);for(const f of i)f(s.result)}),s.addEventListener("success",()=>{t(s.result)}),s.addEventListener("blocked",()=>{r(new Error("Database opening is blocked"))}),s.addEventListener("error",()=>{r(s.error??new Error("Failed to open database"))})})}const cn="asljs-app-builder";let q=null;async function M(){return q!==null||(q=await ln(cn,[e=>{e.createObjectStore("apps",{keyPath:"id"}),e.createObjectStore("files",{keyPath:"id"}).createIndex("byAppId","appId",{unique:!1})}])),q}async function dn(){const n=(await M()).transaction("apps","readonly");return x(n.objectStore("apps").getAll())}async function ee(e){const t=(await M()).transaction("apps","readwrite");await x(t.objectStore("apps").put(e))}async function pn(e){const t=(await M()).transaction(["apps","files"],"readwrite");await x(t.objectStore("apps").delete(e));const r=t.objectStore("files"),s=await x(r.index("byAppId").getAllKeys(e));for(const o of s)await x(r.delete(o))}async function un(e){const t=(await M()).transaction("files","readonly");return x(t.objectStore("files").index("byAppId").getAll(e))}async function le(e){const t=(await M()).transaction("files","readwrite");await x(t.objectStore("files").put(e))}async function fn(e){const t=(await M()).transaction("files","readwrite");await x(t.objectStore("files").delete(e))}async function mn(e,n){const s=(await M()).transaction("files","readwrite").objectStore("files"),o=await x(s.index("byAppId").getAllKeys(e));for(const i of o)await x(s.delete(i));for(const i of n)await x(s.put(i))}const bn=`# observable\r
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
`,vn=`# eventful\r
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
`,hn=`# data-binding\r
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
`,gn=`# components\r
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
`,yn=`# dali\r
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
`,wn=`export {\r
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
`,jn=`export {\r
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
`,En=`export {\r
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
`,xn=`export {\r
    List,\r
    type ListItem,\r
    type ListItemsSource,\r
    type ListRowContext,\r
  } from './list.js';\r
`,Sn=`export {\r
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
`,An=`{
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
`,kn=`{\r
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
`,Ln=`{\r
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
`,Tn=`{\r
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
`,In=`{\r
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
`,On=[{type:"function",function:{name:"listFileset",description:"List all file paths in the virtual filesystem.",parameters:{type:"object",properties:{},required:[],additionalProperties:!1},strict:!0}},{type:"function",function:{name:"readFile",description:"Read the full text content of a file.",parameters:{type:"object",properties:{path:{type:"string"}},required:["path"],additionalProperties:!1},strict:!0}},{type:"function",function:{name:"setFileContent",description:"Create or fully replace file content.",parameters:{type:"object",properties:{path:{type:"string"},content:{type:"string"}},required:["path","content"],additionalProperties:!1},strict:!0}},{type:"function",function:{name:"replaceFilePart",description:"Replace part of a file by exact search string.",parameters:{type:"object",properties:{path:{type:"string"},search:{type:"string"},replacement:{type:"string"},replaceAll:{type:"boolean"}},required:["path","search","replacement","replaceAll"],additionalProperties:!1},strict:!0}},{type:"function",function:{name:"deleteFile",description:"Delete a file from the virtual filesystem.",parameters:{type:"object",properties:{path:{type:"string"}},required:["path"],additionalProperties:!1},strict:!0}},{type:"function",function:{name:"evalInApp",description:"Evaluate JavaScript in the running app document context.",parameters:{type:"object",properties:{code:{type:"string"}},required:["code"],additionalProperties:!1},strict:!0}}],Nn="https://api.openai.com/v1/chat/completions",Pn=_(An,"asljs-observable"),Rn=_(kn,"asljs-eventful"),Cn=_(Ln,"asljs-data-binding"),Fn=_(Tn,"asljs-components"),Mn=_(In,"asljs-dali"),Ue=Un();function Dn(){return Ue}const Bn=24;async function $n(e,n,t){var s,o;const r=[{role:"system",content:Ue},{role:"user",content:e}];for(let i=0;i<Bn;i+=1){const f=await fetch(Nn,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${n}`},body:JSON.stringify({model:"gpt-4o-mini",temperature:.1,messages:r,tools:On,tool_choice:"auto"})});if(!f.ok){const v=await f.json().catch(()=>({})),c=Jn(v)??`OpenAI API error: ${f.status}`;throw new Error(c)}const j=(o=(s=(await f.json()).choices)==null?void 0:s[0])==null?void 0:o.message;if(j===void 0)throw new Error("AI returned an unexpected response format.");const m=j.tool_calls??[];if(m.length===0){const v=j.content.trim();return{summary:v===""?"Completed tool-based update.":v}}r.push({role:"assistant",content:j.content,tool_calls:m});for(const v of m){const c=await Vn(v,t);r.push({role:"tool",tool_call_id:v.id,content:c})}}throw new Error("AI exceeded maximum tool steps without completing.")}function Un(){const e=`
      Latest ASLJS package versions to use:
      - asljs-eventful@${Rn}
      - asljs-observable@${Pn}
      - asljs-data-binding@${Cn}
      - asljs-components@${Fn}
      - asljs-dali@${Mn}
    `,n=[$("eventful",vn,jn),$("observable",bn,wn),$("data-binding",hn,En),$("components",gn,xn),$("dali",yn,Sn)].join(`

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
${Se(n,9e3)}

[${e}] exported API/types excerpt:
${Se(t,6e3)}
`.trim()}function Se(e,n){return e.length<=n?e:`${e.slice(0,n)}
... [truncated]`}function _(e,n){try{return JSON.parse(e).version??"latest"}catch{return console.warn(`Failed to parse package metadata for ${n}.`),"latest"}}function Jn(e){const n=e.error;return typeof(n==null?void 0:n.message)=="string"?n.message:null}async function Vn(e,n){const t=e.function.name,r=_n(e.function.arguments);try{switch(t){case"listFileset":{const s=await n.listFileset();return B(s)}case"readFile":{const s=await n.readFile(O(r,"path"));return B(s)}case"setFileContent":return await n.setFileContent(O(r,"path"),O(r,"content")),B("ok");case"replaceFilePart":return await n.replaceFilePart(O(r,"path"),O(r,"search"),O(r,"replacement"),Wn(r,"replaceAll",!1)),B("ok");case"deleteFile":return await n.deleteFile(O(r,"path")),B("ok");case"evalInApp":{const s=await n.evalInApp(O(r,"code"));return B(s)}default:return Ae(`Unknown tool: ${t}`)}}catch(s){return Ae(s instanceof Error?s.message:String(s))}}function _n(e){try{const n=JSON.parse(e);if(typeof n!="object"||n===null)throw new Error("Tool arguments must be a JSON object.");return n}catch{throw new Error("Invalid tool arguments JSON.")}}function O(e,n){const t=e[n];if(typeof t!="string")throw new Error(`Tool argument "${n}" must be a string.`);return t}function Wn(e,n,t){const r=e[n];if(r===void 0)return t;if(typeof r!="boolean")throw new Error(`Tool argument "${n}" must be a boolean.`);return r}function B(e){return Je({ok:!0,value:e})}function Ae(e){return Je({ok:!1,error:e})}function Je(e){try{return JSON.stringify(e)}catch{return'{"ok":false,"error":"Failed to serialize tool result."}'}}let U=null;const me="asljs-app-builder:eval-request",Ve="asljs-app-builder:eval-response",ke=`<script>
(() => {
  const REQUEST = '${me}';
  const RESPONSE = '${Ve}';

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
<\/script>`;function qn(e,n){if(U!==null&&(URL.revokeObjectURL(U),U=null),n.length===0){e.src="about:blank";return}const t=n.find(i=>i.name==="index.html")??n.find(i=>i.name.endsWith(".html"))??null;if(t===null){e.src="about:blank";return}let r=t.content;const s=n.find(i=>i.name==="style.css")??n.find(i=>i.name.endsWith(".css"))??null;s!==null&&(r=r.replace(/<link[^>]+href=["']style\.css["'][^>]*>/gi,`<style>${s.content}</style>`),r=r.replace(/<link[^>]+href=["']([^"']+\.css)["'][^>]*>/gi,`<style>${s.content}</style>`));for(const i of n){if(!i.name.endsWith(".js"))continue;const f=i.name.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");r=r.replace(new RegExp(`(<script[^>]*?)\\s+src=["']${f}["']([^>]*)><\\/script>`,"gi"),(y,j,m)=>{const v=`${String(j)} ${String(m)}`;return/type=["']module["']/i.test(v)?`<script type="module">${i.content}<\/script>`:`<script>${i.content}<\/script>`})}r=Gn(r);const o=new Blob([r],{type:"text/html"});U=URL.createObjectURL(o),e.src=U}async function Le(e,n){const t=e.contentWindow;if(t===null)throw new Error("Preview frame is not available.");const r=crypto.randomUUID();return new Promise((s,o)=>{const i=window.setTimeout(()=>{y(),o(new Error("Timed out waiting for app evaluation result."))},5e3),f=j=>{if(j.source!==t)return;const m=j.data;if(!(m.type!==Ve||m.id!==r)){if(y(),m.ok===!0){s(m.value);return}o(new Error(m.error??"Unknown preview evaluation error."))}};function y(){window.clearTimeout(i),window.removeEventListener("message",f)}window.addEventListener("message",f),t.postMessage({type:me,id:r,code:n},"*")})}function Gn(e){return e.includes(me)?e:e.includes("</body>")?e.replace("</body>",`${ke}</body>`):`${e}
${ke}`}function G(){return crypto.randomUUID()}function C(){return new Date().toISOString()}function p(e){const n=document.getElementById(e);if(n===null)throw new Error(`Missing element #${e}`);return n}const Te=p("app-list"),Ie=p("empty-state"),Oe=p("app-workspace"),Hn=p("app-name-display"),Ne=p("file-tabs"),H=p("file-content"),J=p("chat-messages"),ce=p("chat-input"),de=p("btn-generate"),Kn=p("btn-run"),zn=p("btn-refresh-preview"),K=p("preview-frame"),Yn=p("btn-new-app"),Qn=p("btn-new-app-2"),Xn=p("btn-rename"),Zn=p("btn-delete-app"),et=p("btn-export"),nt=p("btn-settings"),tt=p("btn-agent-instructions"),z=p("settings-modal"),rt=p("btn-close-settings"),st=p("btn-save-settings"),at=p("btn-cancel-settings"),pe=p("api-key-input"),F=p("name-modal"),_e=p("name-modal-title"),N=p("app-name-input"),W=p("btn-confirm-name"),ot=p("btn-cancel-name"),it=p("btn-close-name-modal"),Y=p("import-file"),Q=p("agent-instructions-modal"),ue=p("agent-instructions-text"),lt=p("btn-close-agent-instructions"),ct=p("btn-close-agent-instructions-2"),dt=p("btn-copy-agent-instructions"),We="asljs-app-builder-settings";function qe(){try{const e=localStorage.getItem(We)??"{}";return JSON.parse(e)}catch{return{}}}function pt(e){localStorage.setItem(We,JSON.stringify(e))}function Ge(){return qe().apiKey??""}function ut(){if(a.currentAppId===null)throw new Error("No active app. Create or open an app first.");return a.currentAppId}async function He(){return[...a.files].map(e=>e.name).sort((e,n)=>e.localeCompare(n))}async function be(e){const n=a.files.find(t=>t.name===e);if(n===void 0)throw new Error(`File not found: ${e}`);return n.content}async function ve(e,n){const t=ut(),r=a.files.find(o=>o.name===e);if(r!==void 0){const o={...r,content:n};await le(o),a.files=a.files.map(i=>i.id===o.id?o:i),a.activeFileName=o.name;return}const s={id:G(),appId:t,name:e,content:n};await le(s),a.files=[...a.files,s],a.activeFileName=s.name}async function Ke(e){var r;const n=a.files.find(s=>s.name===e);if(n===void 0)return;await fn(n.id);const t=a.files.filter(s=>s.id!==n.id);a.files=t,a.activeFileName===e&&(a.activeFileName=((r=t[0])==null?void 0:r.name)??null)}async function ze(e,n,t,r=!1){if(n==="")throw new Error("Search text cannot be empty.");const s=await be(e);if(!s.includes(n))throw new Error(`Search text not found in ${e}.`);let o=s;if(r)o=s.split(n).join(t);else{const i=s.indexOf(n);if(s.indexOf(n,i+n.length)!==-1)throw new Error("Search text is ambiguous. Use replaceAll=true or provide a more specific search block.");o=s.slice(0,i)+t+s.slice(i+n.length)}await ve(e,o)}async function Ye(e){if(a.files.length===0)throw new Error("No files available to run.");V();try{return await Le(K,e)}catch{return V(),Le(K,e)}}function Qe(){Te.replaceChildren();const e=[...a.apps].sort((n,t)=>t.updatedAt.localeCompare(n.updatedAt));for(const n of e){const t=document.createElement("div");t.className="app-item"+(n.id===a.currentAppId?" active":""),t.dataset.id=n.id;const r=document.createElement("span");r.className="app-item-name",r.textContent=n.name,t.appendChild(r),t.addEventListener("click",()=>{te(n.id)}),Te.appendChild(t)}}function Xe(){const e=a.apps.find(n=>n.id===a.currentAppId);if(e===void 0){Ie.classList.remove("hidden"),Oe.classList.add("hidden");return}Ie.classList.add("hidden"),Oe.classList.remove("hidden"),Hn.textContent=e.name,he(),ge()}function he(){Ne.replaceChildren();for(const e of a.files){const n=document.createElement("div");n.className="file-tab"+(e.name===a.activeFileName?" active":""),n.textContent=e.name,n.addEventListener("click",()=>{ne(),a.activeFileName=e.name}),Ne.appendChild(n)}}function ge(){const e=a.files.find(n=>n.name===a.activeFileName);H.value=(e==null?void 0:e.content)??"",H.disabled=e===void 0}function Pe(e){a.generating=e,de.disabled=e,de.innerHTML=e?'<span class="spinner"></span> Generating…':"Generate"}function P(e,n){const t=document.createElement("div");t.className=`chat-msg ${e}`;const r=document.createElement("div");r.className="chat-msg-role",r.textContent=e==="user"?"You":"Assistant";const s=document.createElement("div");s.className="chat-bubble",s.textContent=n,t.appendChild(r),t.appendChild(s),J.appendChild(t),J.scrollTop=J.scrollHeight}async function ne(){if(a.activeFileName===null||a.currentAppId===null)return;const e=a.files.find(t=>t.name===a.activeFileName);if(e===void 0)return;const n=H.value;e.content!==n&&(e.content=n,await le(e))}async function te(e){var t;a.currentAppId=e;const n=await un(e);a.files=n,a.activeFileName=((t=n[0])==null?void 0:t.name)??null,J.replaceChildren()}function Ze(){_e.textContent="New App",N.value="",F.classList.remove("hidden"),N.focus(),W.onclick=async()=>{const e=N.value.trim();if(e==="")return;F.classList.add("hidden");const n={id:G(),name:e,createdAt:C(),updatedAt:C()};await ee(n),a.apps=[...a.apps,n],await te(n.id)}}function ye(){F.classList.add("hidden"),W.onclick=null}function ft(){const e=a.apps.find(n=>n.id===a.currentAppId);e!==void 0&&(_e.textContent="Rename App",N.value=e.name,F.classList.remove("hidden"),N.focus(),N.select(),W.onclick=async()=>{const n=N.value.trim();if(n==="")return;F.classList.add("hidden");const t={...e,name:n,updatedAt:C()};await ee(t),a.apps=a.apps.map(r=>r.id===e.id?t:r)})}async function mt(){const e=a.apps.find(n=>n.id===a.currentAppId);e!==void 0&&confirm(`Delete "${e.name}"? This cannot be undone.`)&&(await pn(e.id),a.apps=a.apps.filter(n=>n.id!==e.id),a.currentAppId=null,a.files=[],a.activeFileName=null,J.replaceChildren(),K.src="about:blank")}async function en(){const e=ce.value.trim();if(e==="")return;const n=Ge();if(n===""){P("assistant","No OpenAI API key set. Open Settings (⚙) to add your key. Generation is optional — you can also create files manually.");return}if(a.currentAppId===null){P("assistant","Please create or open an app first.");return}ce.value="",P("user",e),Pe(!0);try{const t=await $n(e,n,{listFileset:He,readFile:be,setFileContent:ve,replaceFilePart:ze,deleteFile:Ke,evalInApp:Ye}),r=a.apps.find(s=>s.id===a.currentAppId);if(r!==void 0){const s={...r,updatedAt:C()};await ee(s),a.apps=a.apps.map(o=>o.id===r.id?s:o)}P("assistant",t.summary),V()}catch(t){const r=t instanceof Error?t.message:String(t);P("assistant",`Error: ${r}`)}finally{Pe(!1)}}function V(){ne().then(()=>{qn(K,a.files)})}async function bt(){const e=a.apps.find(o=>o.id===a.currentAppId);if(e===void 0)return;await ne();const n={app:e,files:a.files,exportedAt:C()},t=new Blob([JSON.stringify(n,null,2)],{type:"application/json"}),r=URL.createObjectURL(t),s=document.createElement("a");s.href=r,s.download=`${e.name.replace(/\s+/g,"-")}.json`,s.click(),URL.revokeObjectURL(r)}function vt(){Y.value="",Y.click()}async function ht(){var n;const e=(n=Y.files)==null?void 0:n[0];if(e!==void 0)try{const t=await e.text(),r=JSON.parse(t);if(r.app===void 0||typeof r.app.name!="string"||!Array.isArray(r.files))throw new Error("Invalid app JSON format.");const s=G(),o={id:s,name:`${r.app.name} (imported)`,createdAt:r.app.createdAt??C(),updatedAt:C()},i=r.files.filter(f=>typeof f.name=="string"&&typeof f.content=="string").map(f=>({id:G(),appId:s,name:f.name,content:f.content}));await ee(o),await mn(s,i),a.apps=[...a.apps,o],await te(s)}catch(t){const r=t instanceof Error?t.message:String(t);alert(`Import failed: ${r}`)}}function gt(){pe.value=Ge(),z.classList.remove("hidden"),pe.focus()}function re(){z.classList.add("hidden")}function yt(){const e=qe();e.apiKey=pe.value.trim(),pt(e),re()}function wt(){ue.value=Dn(),Q.classList.remove("hidden"),ue.scrollTop=0}function we(){Q.classList.add("hidden")}async function jt(){const e=ue.value;try{await navigator.clipboard.writeText(e),P("assistant","Agent instructions copied to clipboard.")}catch{P("assistant","Could not copy to clipboard automatically. You can still select and copy from the instructions modal.")}}a.on("set:apps",()=>Qe());a.on("set:currentAppId",()=>{Qe(),Xe()});a.on("set:files",()=>{he(),ge()});a.on("set:activeFileName",()=>{he(),ge()});Yn.addEventListener("click",Ze);Qn.addEventListener("click",Ze);Xn.addEventListener("click",ft);Zn.addEventListener("click",()=>{mt()});et.addEventListener("click",()=>{bt()});de.addEventListener("click",()=>{en()});Kn.addEventListener("click",V);zn.addEventListener("click",V);nt.addEventListener("click",gt);tt.addEventListener("click",wt);rt.addEventListener("click",re);st.addEventListener("click",yt);at.addEventListener("click",re);z.addEventListener("click",e=>{e.target===z&&re()});lt.addEventListener("click",we);ct.addEventListener("click",we);dt.addEventListener("click",()=>{jt()});Q.addEventListener("click",e=>{e.target===Q&&we()});W.addEventListener("click",()=>{});ot.addEventListener("click",ye);it.addEventListener("click",ye);F.addEventListener("click",e=>{e.target===F&&ye()});N.addEventListener("keydown",e=>{e.key==="Enter"&&W.click()});ce.addEventListener("keydown",e=>{e.key==="Enter"&&!e.shiftKey&&(e.preventDefault(),en())});H.addEventListener("blur",()=>{ne()});Y.addEventListener("change",()=>{ht()});const se=document.createElement("button");se.className="btn btn-ghost btn-full";se.textContent="↑ Import";se.addEventListener("click",vt);const Re=document.querySelector(".sidebar-footer"),Ce=document.getElementById("btn-settings");Re!==null&&Ce!==null&&Re.insertBefore(se,Ce);window.listFileset=He;window.readFile=be;window.setFileContent=ve;window.replaceFilePart=ze;window.deleteFile=Ke;window.evalInApp=Ye;async function Et(){const e=await dn();if(a.apps=e,e.length>0){const n=[...e].sort((t,r)=>r.updatedAt.localeCompare(t.updatedAt));await te(n[0].id)}else Xe()}Et().catch(e=>{console.error("App Builder init failed:",e)});
