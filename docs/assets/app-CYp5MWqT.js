(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))r(s);new MutationObserver(s=>{for(const o of s)if(o.type==="childList")for(const i of o.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&r(i)}).observe(document,{childList:!0,subtree:!0});function t(s){const o={};return s.integrity&&(o.integrity=s.integrity),s.referrerPolicy&&(o.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?o.credentials="include":s.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function r(s){if(s.ep)return;s.ep=!0;const o=t(s);fetch(s.href,o)}})();class rn extends Error{constructor(n,t,r,s,o){super(n),this.name="ListenerError",this.error=t,this.object=r,this.event=s,this.listener=o}}function D(e){if(typeof e!="string"&&typeof e!="symbol")throw new TypeError("Expect event to be a string or symbol.")}function X(e){return typeof e=="function"}function Ee(e){if(X(e))return e}function Fe(e){return typeof e=="object"&&e!==null}function ae(e){if(!X(e))throw new TypeError("Expect a function.")}const sn=(e=Object.create(null),n={})=>{if(!Fe(e)&&!X(e))throw new TypeError("Expect an object or a function.");for(const c of["on","once","off","emit","emitAsync","has"])if(c in e)throw new Error(`Method "${c}" already exists.`);const{strict:t=!1,trace:r=null,error:s=null}=n,o=Ee(r)??null,i=Ee(s)??null,b=e!==R,g=(c,d)=>{o==null||o(c,d),b&&R.emit(c,d)};g("new",{object:e});const j=new Set,f=new Map,y={enumerable:!1,configurable:!0,writable:!0};return Object.defineProperties(e,{on:Object.assign({value:T},y),once:Object.assign({value:x},y),off:Object.assign({value:h},y),emit:Object.assign({value:A},y),emitAsync:Object.assign({value:L},y),has:Object.assign({value:S},y)}),e;function l(c,d){let u=f.get(c);u||f.set(c,u=new Set),u.add(d)}function m(c,d){const u=f.get(c);if(!u)return!1;const w=u.delete(d);return u.size===0&&f.delete(c),w}function v(c,d,u){const w={error:u,object:e,event:c,listener:d};if(i==null||i(w),e===R&&c==="error")throw new rn("Error in a global error listener.",u,e,c,d);R.emit("error",w)}function T(c,d){D(c),ae(d),g("on",{object:e,event:c,listener:d}),l(c,d);let u=!0;return()=>u?(u=!1,m(c,d)):!1}function x(c,d){D(c),ae(d);const u=T(c,(...w)=>{u(),d(...w)});return u}function h(c,d){return D(c),ae(d),g("off",{object:e,event:c,listener:d}),m(c,d)}function S(c){var d;return D(c),(((d=f.get(c))==null?void 0:d.size)??0)>0}function A(c,...d){D(c);const u=f.get(c)||j;if(g("emit",{object:e,listeners:[...u],event:c,args:d}),u.size!==0)for(const w of u)try{w(...d)}catch(I){if(v(c,w,I),t)throw I}}async function L(c,...d){D(c);const u=f.get(c)||j;if(g("emitAsync",{object:e,listeners:[...u],event:c,args:d}),u.size===0)return;const w=[...u].map(async I=>{try{await I(...d)}catch(xe){if(v(c,I,xe),t)throw xe}});await(t?Promise.all(w):Promise.allSettled(w))}},R=sn;R(R);function an(e){return!Fe(e)&&!X(e)?!1:typeof e.on=="function"}function De(e){if(an(e))return e}function k(e){return typeof e=="function"}function fe(e){return typeof e=="object"&&e!==null}function Be(e){if(!k(e))throw new TypeError("Expect a function.")}function ie(e){if(e.trim()==="")throw new TypeError("Expect watch path to be a non-empty string.");const n=e.split(".");for(const t of n)if(t.trim()==="")throw new TypeError("Expect watch path segments to be non-empty.");return e.split(".").map(t=>t.trim()).filter(t=>t!=="")}function on(e,n){const t=ie(n);if(t.length===0)return;let r=e;for(const s of t){if(!fe(r)||!(s in r))return;r=r[s]}return r}const $e=(e,n,t)=>{if(Array.isArray(e))throw new TypeError("Watching arrays is not supported.");Be(t);const r=typeof n=="string"?[n]:n;if(!Array.isArray(r))throw new TypeError("Expect properties to be a string or an array of strings.");for(const i of r){if(typeof i!="string")throw new TypeError("Expect properties to be a string or an array of strings.");ie(i)}const s=()=>r.map(i=>on(e,i)),o=[];for(const i of r){const b=ie(i);let g=null;const j=()=>{const f=[],y=(l,m)=>{if(!fe(l)||m>=b.length)return;const v=b[m],T=De(l);if(T){const x=T.on(`set:${v}`,()=>{t(...s()),m<b.length-1&&g&&(g(),g=j())});f.push(x)}m<b.length-1&&y(l[v],m+1)};return y(e,0),()=>f.reduce((l,m)=>m()||l,!1)};g=j(),o.push(()=>g?g():!1)}return t(...s()),()=>o.reduce((i,b)=>b()||i,!1)};function ln(e,n){"watch"in e||Object.defineProperty(e,"watch",{configurable:!0,writable:!0,enumerable:!1,value(t,r){return n(typeof t=="string"?this:this,t,r)}})}function Se(e,n){return Object.prototype.hasOwnProperty.call(e,n)}function oe(e){if(typeof e=="symbol")return!1;const n=typeof e=="number"?e:Number(e);return!Number.isInteger(n)||n<0||n>=4294967295?!1:typeof e=="number"||e===String(n)}function cn(e){return De(e)?k(e.emit):!1}const Ue=(e,n={})=>{const{eventful:t=R,trace:r=null,shallow:s=!1}=n;Be(t);const o=Z.options,i=new WeakMap,b=l=>{if(s||!fe(l)||cn(l))return l;if(i.has(l))return i.get(l);const m=Ue(l,{eventful:t,trace:r,shallow:s});return i.set(l,m),m},g=l=>{if(!s){if(Array.isArray(l)){for(let m=0;m<l.length;m++)l[m]=b(l[m]);return}for(const m of Reflect.ownKeys(l))Se(l,m)&&(l[m]=b(l[m]))}},j=l=>{const m=Array.isArray(l);g(l),ln(l,$e);let v;const T=new Proxy(l,{set(x,h,S,A){const L=m&&oe(h),c=Reflect.get(x,h,A),d=Reflect.set(x,h,b(S),A);if(v&&d){const u=Reflect.get(x,h,A);if(!Object.is(c,u)){const w=L?{index:Number(h),value:u,previous:c}:{property:h,value:u,previous:c},I=r||o.trace;v.emit(`set:${String(h)}`,w),k(I)&&I(v,"set",w),v.emit("set",w)}}return d},deleteProperty(x,h){const S=m&&oe(h),A=Se(x,h),L=A?x[h]:void 0,c=Reflect.deleteProperty(x,h);if(v&&c&&A){const d=S?{index:Number(h),previous:L}:{property:h,previous:L},u=r||o.trace;v.emit(`delete:${String(h)}`,d),k(u)&&u(v,"delete",d),v.emit("delete",d)}return c},defineProperty(x,h,S){const A=Object.getOwnPropertyDescriptor(x,h)??null,L=Object.prototype.hasOwnProperty.call(S,"value")?{...S,value:b(S.value)}:S,c=Reflect.defineProperty(x,h,L),d=m&&(h==="length"||oe(h));if(v&&!d&&c){const u={property:h,descriptor:L,previous:A},w=r||o.trace;v.emit(`define:${String(h)}`,u),k(w)&&w(v,"define",u),v.emit("define",u)}return c}});return v=k(l==null?void 0:l.emit)?T:t(T),v},f=r||o.trace;if(Array.isArray(e)){const l=j(e);return k(f)&&f(l,"new"),l}if(e!==null&&typeof e=="object"){const l=j(e);return k(f)&&f(l,"new",{object:l}),l}const y=t({get value(){return e},set value(l){if(Object.is(l,e))return;const m=e;e=l;const v={property:"value",value:e,previous:m};y.emit("set:value",v),k(f)&&f(y,"set",v),y.emit("set",v)}});return k(f)&&f(y,"new",{object:y}),y},Z=Ue;Z.options={trace:null};Z.watch=$e;const a=Z({apps:[],currentAppId:null,files:[],activeFileName:null,generating:!1,error:null});function E(e){return new Promise((n,t)=>{e.addEventListener("success",()=>{n(e.result)}),e.addEventListener("error",()=>{t(e.error??new Error("IndexedDB request failed"))})})}function dn(e,n){return new Promise((t,r)=>{const s=indexedDB.open(e,n.length);s.addEventListener("upgradeneeded",o=>{const i=n.slice(o.oldVersion-1,o.newVersion??n.length-1);for(const b of i)b(s.result)}),s.addEventListener("success",()=>{t(s.result)}),s.addEventListener("blocked",()=>{r(new Error("Database opening is blocked"))}),s.addEventListener("error",()=>{r(s.error??new Error("Failed to open database"))})})}const pn="asljs-app-builder";let q=null;async function F(){return q!==null||(q=await dn(pn,[e=>{e.createObjectStore("apps",{keyPath:"id"}),e.createObjectStore("files",{keyPath:"id"}).createIndex("byAppId","appId",{unique:!1})}])),q}async function un(){const n=(await F()).transaction("apps","readonly");return E(n.objectStore("apps").getAll())}async function ee(e){const t=(await F()).transaction("apps","readwrite");await E(t.objectStore("apps").put(e))}async function fn(e){const t=(await F()).transaction(["apps","files"],"readwrite");await E(t.objectStore("apps").delete(e));const r=t.objectStore("files"),s=await E(r.index("byAppId").getAllKeys(e));for(const o of s)await E(r.delete(o))}async function mn(e){const t=(await F()).transaction("files","readonly");return E(t.objectStore("files").index("byAppId").getAll(e))}async function le(e){const t=(await F()).transaction("files","readwrite");await E(t.objectStore("files").put(e))}async function bn(e){const t=(await F()).transaction("files","readwrite");await E(t.objectStore("files").delete(e))}async function vn(e,n){const s=(await F()).transaction("files","readwrite").objectStore("files"),o=await E(s.index("byAppId").getAllKeys(e));for(const i of o)await E(s.delete(i));for(const i of n)await E(s.put(i))}const hn=`# observable\r
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
`,gn=`# eventful\r
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
`,yn=`# data-binding\r
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
`,wn=`# components\r
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
`,jn=`# dali\r
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
`,xn=`export {\r
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
`,En=`export {\r
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
`,Sn=`export {\r
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
`,An=`export {\r
    List,\r
    type ListItem,\r
    type ListItemsSource,\r
    type ListRowContext,\r
  } from './list.js';\r
`,kn=`export {\r
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
`,Ln=`{
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
`,Tn=`{\r
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
`,In=`{\r
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
`,On=`{\r
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
`,Nn=`{\r
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
`,Pn=[{type:"function",function:{name:"listFileset",description:"List all file paths in the virtual filesystem.",parameters:{type:"object",properties:{},required:[],additionalProperties:!1},strict:!0}},{type:"function",function:{name:"readFile",description:"Read the full text content of a file.",parameters:{type:"object",properties:{path:{type:"string"}},required:["path"],additionalProperties:!1},strict:!0}},{type:"function",function:{name:"setFileContent",description:"Create or fully replace file content.",parameters:{type:"object",properties:{path:{type:"string"},content:{type:"string"}},required:["path","content"],additionalProperties:!1},strict:!0}},{type:"function",function:{name:"replaceFilePart",description:"Replace part of a file by exact search string.",parameters:{type:"object",properties:{path:{type:"string"},search:{type:"string"},replacement:{type:"string"},replaceAll:{type:"boolean"}},required:["path","search","replacement","replaceAll"],additionalProperties:!1},strict:!0}},{type:"function",function:{name:"deleteFile",description:"Delete a file from the virtual filesystem.",parameters:{type:"object",properties:{path:{type:"string"}},required:["path"],additionalProperties:!1},strict:!0}},{type:"function",function:{name:"evalInApp",description:"Evaluate JavaScript in the running app document context.",parameters:{type:"object",properties:{code:{type:"string"}},required:["code"],additionalProperties:!1},strict:!0}}],Rn="https://api.openai.com/v1/chat/completions",Cn=_(Ln,"asljs-observable"),Mn=_(Tn,"asljs-eventful"),Fn=_(In,"asljs-data-binding"),Dn=_(On,"asljs-components"),Bn=_(Nn,"asljs-dali"),Je=_n(),$n="gpt-5.3-codex";function Un(){return Je}const Jn=24;async function Vn(e,n,t,r){var o,i;const s=[{role:"system",content:Je},{role:"user",content:e}];for(let b=0;b<Jn;b+=1){const g=await fetch(Rn,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${n}`},body:JSON.stringify({model:t,temperature:.1,messages:s,tools:Pn,tool_choice:"auto"})});if(!g.ok){const l=await g.json().catch(()=>({})),m=Wn(l)??`OpenAI API error: ${g.status}`;throw new Error(m)}const f=(i=(o=(await g.json()).choices)==null?void 0:o[0])==null?void 0:i.message;if(f===void 0)throw new Error("AI returned an unexpected response format.");const y=f.tool_calls??[];if(y.length===0){const l=f.content.trim();return{summary:l===""?"Completed tool-based update.":l}}s.push({role:"assistant",content:f.content,tool_calls:y});for(const l of y){const m=await qn(l,r);s.push({role:"tool",tool_call_id:l.id,content:m})}}throw new Error("AI exceeded maximum tool steps without completing.")}function _n(){const e=`
      Latest ASLJS package versions to use:
      - asljs-eventful@${Mn}
      - asljs-observable@${Cn}
      - asljs-data-binding@${Fn}
      - asljs-components@${Dn}
      - asljs-dali@${Bn}
    `,n=[$("eventful",gn,En),$("observable",hn,xn),$("data-binding",yn,Sn),$("components",wn,An),$("dali",jn,kn)].join(`

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
${Ae(n,9e3)}

[${e}] exported API/types excerpt:
${Ae(t,6e3)}
`.trim()}function Ae(e,n){return e.length<=n?e:`${e.slice(0,n)}
... [truncated]`}function _(e,n){try{return JSON.parse(e).version??"latest"}catch{return console.warn(`Failed to parse package metadata for ${n}.`),"latest"}}function Wn(e){const n=e.error;return typeof(n==null?void 0:n.message)=="string"?n.message:null}async function qn(e,n){const t=e.function.name,r=Gn(e.function.arguments);try{switch(t){case"listFileset":{const s=await n.listFileset();return B(s)}case"readFile":{const s=await n.readFile(O(r,"path"));return B(s)}case"setFileContent":return await n.setFileContent(O(r,"path"),O(r,"content")),B("ok");case"replaceFilePart":return await n.replaceFilePart(O(r,"path"),O(r,"search"),O(r,"replacement"),Hn(r,"replaceAll",!1)),B("ok");case"deleteFile":return await n.deleteFile(O(r,"path")),B("ok");case"evalInApp":{const s=await n.evalInApp(O(r,"code"));return B(s)}default:return ke(`Unknown tool: ${t}`)}}catch(s){return ke(s instanceof Error?s.message:String(s))}}function Gn(e){try{const n=JSON.parse(e);if(typeof n!="object"||n===null)throw new Error("Tool arguments must be a JSON object.");return n}catch{throw new Error("Invalid tool arguments JSON.")}}function O(e,n){const t=e[n];if(typeof t!="string")throw new Error(`Tool argument "${n}" must be a string.`);return t}function Hn(e,n,t){const r=e[n];if(r===void 0)return t;if(typeof r!="boolean")throw new Error(`Tool argument "${n}" must be a boolean.`);return r}function B(e){return Ve({ok:!0,value:e})}function ke(e){return Ve({ok:!1,error:e})}function Ve(e){try{return JSON.stringify(e)}catch{return'{"ok":false,"error":"Failed to serialize tool result."}'}}let U=null;const me="asljs-app-builder:eval-request",_e="asljs-app-builder:eval-response",Le=`<script>
(() => {
  const REQUEST = '${me}';
  const RESPONSE = '${_e}';

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
<\/script>`;function Kn(e,n){if(U!==null&&(URL.revokeObjectURL(U),U=null),n.length===0){e.src="about:blank";return}const t=n.find(i=>i.name==="index.html")??n.find(i=>i.name.endsWith(".html"))??null;if(t===null){e.src="about:blank";return}let r=t.content;const s=n.find(i=>i.name==="style.css")??n.find(i=>i.name.endsWith(".css"))??null;s!==null&&(r=r.replace(/<link[^>]+href=["']style\.css["'][^>]*>/gi,`<style>${s.content}</style>`),r=r.replace(/<link[^>]+href=["']([^"']+\.css)["'][^>]*>/gi,`<style>${s.content}</style>`));for(const i of n){if(!i.name.endsWith(".js"))continue;const b=i.name.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");r=r.replace(new RegExp(`(<script[^>]*?)\\s+src=["']${b}["']([^>]*)><\\/script>`,"gi"),(g,j,f)=>{const y=`${String(j)} ${String(f)}`;return/type=["']module["']/i.test(y)?`<script type="module">${i.content}<\/script>`:`<script>${i.content}<\/script>`})}r=zn(r);const o=new Blob([r],{type:"text/html"});U=URL.createObjectURL(o),e.src=U}async function Te(e,n){const t=e.contentWindow;if(t===null)throw new Error("Preview frame is not available.");const r=crypto.randomUUID();return new Promise((s,o)=>{const i=window.setTimeout(()=>{g(),o(new Error("Timed out waiting for app evaluation result."))},5e3),b=j=>{if(j.source!==t)return;const f=j.data;if(!(f.type!==_e||f.id!==r)){if(g(),f.ok===!0){s(f.value);return}o(new Error(f.error??"Unknown preview evaluation error."))}};function g(){window.clearTimeout(i),window.removeEventListener("message",b)}window.addEventListener("message",b),t.postMessage({type:me,id:r,code:n},"*")})}function zn(e){return e.includes(me)?e:e.includes("</body>")?e.replace("</body>",`${Le}</body>`):`${e}
${Le}`}function G(){return crypto.randomUUID()}function C(){return new Date().toISOString()}function p(e){const n=document.getElementById(e);if(n===null)throw new Error(`Missing element #${e}`);return n}const Ie=p("app-list"),Oe=p("empty-state"),Ne=p("app-workspace"),Yn=p("app-name-display"),Pe=p("file-tabs"),H=p("file-content"),J=p("chat-messages"),ce=p("chat-input"),de=p("btn-generate"),Qn=p("btn-run"),Xn=p("btn-refresh-preview"),K=p("preview-frame"),Zn=p("btn-new-app"),et=p("btn-new-app-2"),nt=p("btn-rename"),tt=p("btn-delete-app"),rt=p("btn-export"),st=p("btn-settings"),at=p("btn-agent-instructions"),z=p("settings-modal"),ot=p("btn-close-settings"),it=p("btn-save-settings"),lt=p("btn-cancel-settings"),pe=p("api-key-input"),We=p("model-select"),M=p("name-modal"),qe=p("name-modal-title"),N=p("app-name-input"),W=p("btn-confirm-name"),ct=p("btn-cancel-name"),dt=p("btn-close-name-modal"),Y=p("import-file"),Q=p("agent-instructions-modal"),ue=p("agent-instructions-text"),pt=p("btn-close-agent-instructions"),ut=p("btn-close-agent-instructions-2"),ft=p("btn-copy-agent-instructions"),Ge="asljs-app-builder-settings";function be(){try{const e=localStorage.getItem(Ge)??"{}";return JSON.parse(e)}catch{return{}}}function mt(e){localStorage.setItem(Ge,JSON.stringify(e))}function He(){return be().apiKey??""}function Ke(){const e=be().model;return e==="gpt-5.3-codex"||e==="gpt-5.4"?e:$n}function bt(){if(a.currentAppId===null)throw new Error("No active app. Create or open an app first.");return a.currentAppId}async function ze(){return[...a.files].map(e=>e.name).sort((e,n)=>e.localeCompare(n))}async function ve(e){const n=a.files.find(t=>t.name===e);if(n===void 0)throw new Error(`File not found: ${e}`);return n.content}async function he(e,n){const t=bt(),r=a.files.find(o=>o.name===e);if(r!==void 0){const o={...r,content:n};await le(o),a.files=a.files.map(i=>i.id===o.id?o:i),a.activeFileName=o.name;return}const s={id:G(),appId:t,name:e,content:n};await le(s),a.files=[...a.files,s],a.activeFileName=s.name}async function Ye(e){var r;const n=a.files.find(s=>s.name===e);if(n===void 0)return;await bn(n.id);const t=a.files.filter(s=>s.id!==n.id);a.files=t,a.activeFileName===e&&(a.activeFileName=((r=t[0])==null?void 0:r.name)??null)}async function Qe(e,n,t,r=!1){if(n==="")throw new Error("Search text cannot be empty.");const s=await ve(e);if(!s.includes(n))throw new Error(`Search text not found in ${e}.`);let o=s;if(r)o=s.split(n).join(t);else{const i=s.indexOf(n);if(s.indexOf(n,i+n.length)!==-1)throw new Error("Search text is ambiguous. Use replaceAll=true or provide a more specific search block.");o=s.slice(0,i)+t+s.slice(i+n.length)}await he(e,o)}async function Xe(e){if(a.files.length===0)throw new Error("No files available to run.");V();try{return await Te(K,e)}catch{return V(),Te(K,e)}}function Ze(){Ie.replaceChildren();const e=[...a.apps].sort((n,t)=>t.updatedAt.localeCompare(n.updatedAt));for(const n of e){const t=document.createElement("div");t.className="app-item"+(n.id===a.currentAppId?" active":""),t.dataset.id=n.id;const r=document.createElement("span");r.className="app-item-name",r.textContent=n.name,t.appendChild(r),t.addEventListener("click",()=>{te(n.id)}),Ie.appendChild(t)}}function en(){const e=a.apps.find(n=>n.id===a.currentAppId);if(e===void 0){Oe.classList.remove("hidden"),Ne.classList.add("hidden");return}Oe.classList.add("hidden"),Ne.classList.remove("hidden"),Yn.textContent=e.name,ge(),ye()}function ge(){Pe.replaceChildren();for(const e of a.files){const n=document.createElement("div");n.className="file-tab"+(e.name===a.activeFileName?" active":""),n.textContent=e.name,n.addEventListener("click",()=>{ne(),a.activeFileName=e.name}),Pe.appendChild(n)}}function ye(){const e=a.files.find(n=>n.name===a.activeFileName);H.value=(e==null?void 0:e.content)??"",H.disabled=e===void 0}function Re(e){a.generating=e,de.disabled=e,de.innerHTML=e?'<span class="spinner"></span> Generating…':"Generate"}function P(e,n){const t=document.createElement("div");t.className=`chat-msg ${e}`;const r=document.createElement("div");r.className="chat-msg-role",r.textContent=e==="user"?"You":"Assistant";const s=document.createElement("div");s.className="chat-bubble",s.textContent=n,t.appendChild(r),t.appendChild(s),J.appendChild(t),J.scrollTop=J.scrollHeight}async function ne(){if(a.activeFileName===null||a.currentAppId===null)return;const e=a.files.find(t=>t.name===a.activeFileName);if(e===void 0)return;const n=H.value;e.content!==n&&(e.content=n,await le(e))}async function te(e){var t;a.currentAppId=e;const n=await mn(e);a.files=n,a.activeFileName=((t=n[0])==null?void 0:t.name)??null,J.replaceChildren()}function nn(){qe.textContent="New App",N.value="",M.classList.remove("hidden"),N.focus(),W.onclick=async()=>{const e=N.value.trim();if(e==="")return;M.classList.add("hidden");const n={id:G(),name:e,createdAt:C(),updatedAt:C()};await ee(n),a.apps=[...a.apps,n],await te(n.id)}}function we(){M.classList.add("hidden"),W.onclick=null}function vt(){const e=a.apps.find(n=>n.id===a.currentAppId);e!==void 0&&(qe.textContent="Rename App",N.value=e.name,M.classList.remove("hidden"),N.focus(),N.select(),W.onclick=async()=>{const n=N.value.trim();if(n==="")return;M.classList.add("hidden");const t={...e,name:n,updatedAt:C()};await ee(t),a.apps=a.apps.map(r=>r.id===e.id?t:r)})}async function ht(){const e=a.apps.find(n=>n.id===a.currentAppId);e!==void 0&&confirm(`Delete "${e.name}"? This cannot be undone.`)&&(await fn(e.id),a.apps=a.apps.filter(n=>n.id!==e.id),a.currentAppId=null,a.files=[],a.activeFileName=null,J.replaceChildren(),K.src="about:blank")}async function tn(){const e=ce.value.trim();if(e==="")return;const n=He();if(n===""){P("assistant","No OpenAI API key set. Open Settings (⚙) to add your key. Generation is optional — you can also create files manually.");return}if(a.currentAppId===null){P("assistant","Please create or open an app first.");return}ce.value="",P("user",e),Re(!0);try{const t=Ke(),r=await Vn(e,n,t,{listFileset:ze,readFile:ve,setFileContent:he,replaceFilePart:Qe,deleteFile:Ye,evalInApp:Xe}),s=a.apps.find(o=>o.id===a.currentAppId);if(s!==void 0){const o={...s,updatedAt:C()};await ee(o),a.apps=a.apps.map(i=>i.id===s.id?o:i)}P("assistant",r.summary),V()}catch(t){const r=t instanceof Error?t.message:String(t);P("assistant",`Error: ${r}`)}finally{Re(!1)}}function V(){ne().then(()=>{Kn(K,a.files)})}async function gt(){const e=a.apps.find(o=>o.id===a.currentAppId);if(e===void 0)return;await ne();const n={app:e,files:a.files,exportedAt:C()},t=new Blob([JSON.stringify(n,null,2)],{type:"application/json"}),r=URL.createObjectURL(t),s=document.createElement("a");s.href=r,s.download=`${e.name.replace(/\s+/g,"-")}.json`,s.click(),URL.revokeObjectURL(r)}function yt(){Y.value="",Y.click()}async function wt(){var n;const e=(n=Y.files)==null?void 0:n[0];if(e!==void 0)try{const t=await e.text(),r=JSON.parse(t);if(r.app===void 0||typeof r.app.name!="string"||!Array.isArray(r.files))throw new Error("Invalid app JSON format.");const s=G(),o={id:s,name:`${r.app.name} (imported)`,createdAt:r.app.createdAt??C(),updatedAt:C()},i=r.files.filter(b=>typeof b.name=="string"&&typeof b.content=="string").map(b=>({id:G(),appId:s,name:b.name,content:b.content}));await ee(o),await vn(s,i),a.apps=[...a.apps,o],await te(s)}catch(t){const r=t instanceof Error?t.message:String(t);alert(`Import failed: ${r}`)}}function jt(){pe.value=He(),We.value=Ke(),z.classList.remove("hidden"),pe.focus()}function re(){z.classList.add("hidden")}function xt(){const e=be();e.apiKey=pe.value.trim(),e.model=We.value==="gpt-5.4"?"gpt-5.4":"gpt-5.3-codex",mt(e),re()}function Et(){ue.value=Un(),Q.classList.remove("hidden"),ue.scrollTop=0}function je(){Q.classList.add("hidden")}async function St(){const e=ue.value;try{await navigator.clipboard.writeText(e),P("assistant","Agent instructions copied to clipboard.")}catch{P("assistant","Could not copy to clipboard automatically. You can still select and copy from the instructions modal.")}}a.on("set:apps",()=>Ze());a.on("set:currentAppId",()=>{Ze(),en()});a.on("set:files",()=>{ge(),ye()});a.on("set:activeFileName",()=>{ge(),ye()});Zn.addEventListener("click",nn);et.addEventListener("click",nn);nt.addEventListener("click",vt);tt.addEventListener("click",()=>{ht()});rt.addEventListener("click",()=>{gt()});de.addEventListener("click",()=>{tn()});Qn.addEventListener("click",V);Xn.addEventListener("click",V);st.addEventListener("click",jt);at.addEventListener("click",Et);ot.addEventListener("click",re);it.addEventListener("click",xt);lt.addEventListener("click",re);z.addEventListener("click",e=>{e.target===z&&re()});pt.addEventListener("click",je);ut.addEventListener("click",je);ft.addEventListener("click",()=>{St()});Q.addEventListener("click",e=>{e.target===Q&&je()});W.addEventListener("click",()=>{});ct.addEventListener("click",we);dt.addEventListener("click",we);M.addEventListener("click",e=>{e.target===M&&we()});N.addEventListener("keydown",e=>{e.key==="Enter"&&W.click()});ce.addEventListener("keydown",e=>{e.key==="Enter"&&!e.shiftKey&&(e.preventDefault(),tn())});H.addEventListener("blur",()=>{ne()});Y.addEventListener("change",()=>{wt()});const se=document.createElement("button");se.className="btn btn-ghost btn-full";se.textContent="↑ Import";se.addEventListener("click",yt);const Ce=document.querySelector(".sidebar-footer"),Me=document.getElementById("btn-settings");Ce!==null&&Me!==null&&Ce.insertBefore(se,Me);window.listFileset=ze;window.readFile=ve;window.setFileContent=he;window.replaceFilePart=Qe;window.deleteFile=Ye;window.evalInApp=Xe;async function At(){const e=await un();if(a.apps=e,e.length>0){const n=[...e].sort((t,r)=>r.updatedAt.localeCompare(t.updatedAt));await te(n[0].id)}else en()}At().catch(e=>{console.error("App Builder init failed:",e)});
