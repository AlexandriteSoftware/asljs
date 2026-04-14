(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))s(a);new MutationObserver(a=>{for(const r of a)if(r.type==="childList")for(const i of r.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&s(i)}).observe(document,{childList:!0,subtree:!0});function t(a){const r={};return a.integrity&&(r.integrity=a.integrity),a.referrerPolicy&&(r.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?r.credentials="include":a.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function s(a){if(a.ep)return;a.ep=!0;const r=t(a);fetch(a.href,r)}})();class Mn extends Error{constructor(n,t,s,a,r){super(n),this.name="ListenerError",this.error=t,this.object=s,this.event=a,this.listener=r}}function B(e){if(typeof e!="string"&&typeof e!="symbol")throw new TypeError("Expect event to be a string or symbol.")}function le(e){return typeof e=="function"}function _e(e){if(le(e))return e}function He(e){return typeof e=="object"&&e!==null}function me(e){if(!le(e))throw new TypeError("Expect a function.")}const Dn=(e=Object.create(null),n={})=>{if(!He(e)&&!le(e))throw new TypeError("Expect an object or a function.");for(const d of["on","once","off","emit","emitAsync","has"])if(d in e)throw new Error(`Method "${d}" already exists.`);const{strict:t=!1,trace:s=null,error:a=null}=n,r=_e(s)??null,i=_e(a)??null,p=e!==M,g=(d,u)=>{r==null||r(d,u),p&&M.emit(d,u)};g("new",{object:e});const E=new Set,b=new Map,h={enumerable:!1,configurable:!0,writable:!0};return Object.defineProperties(e,{on:Object.assign({value:S},h),once:Object.assign({value:j},h),off:Object.assign({value:y},h),emit:Object.assign({value:T},h),emitAsync:Object.assign({value:L},h),has:Object.assign({value:A},h)}),e;function c(d,u){let f=b.get(d);f||b.set(d,f=new Set),f.add(u)}function v(d,u){const f=b.get(d);if(!f)return!1;const w=f.delete(u);return f.size===0&&b.delete(d),w}function m(d,u,f){const w={error:f,object:e,event:d,listener:u};if(i==null||i(w),e===M&&d==="error")throw new Mn("Error in a global error listener.",f,e,d,u);M.emit("error",w)}function S(d,u){B(d),me(u),g("on",{object:e,event:d,listener:u}),c(d,u);let f=!0;return()=>f?(f=!1,v(d,u)):!1}function j(d,u){B(d),me(u);const f=S(d,(...w)=>{f(),u(...w)});return f}function y(d,u){return B(d),me(u),g("off",{object:e,event:d,listener:u}),v(d,u)}function A(d){var u;return B(d),(((u=b.get(d))==null?void 0:u.size)??0)>0}function T(d,...u){B(d);const f=b.get(d)||E;if(g("emit",{object:e,listeners:[...f],event:d,args:u}),f.size!==0)for(const w of f)try{w(...u)}catch(P){if(m(d,w,P),t)throw P}}async function L(d,...u){B(d);const f=b.get(d)||E;if(g("emitAsync",{object:e,listeners:[...f],event:d,args:u}),f.size===0)return;const w=[...f].map(async P=>{try{await P(...u)}catch(De){if(m(d,P,De),t)throw De}});await(t?Promise.all(w):Promise.allSettled(w))}},M=Dn;M(M);function _n(e){return!He(e)&&!le(e)?!1:typeof e.on=="function"}function Ye(e){if(_n(e))return e}function k(e){return typeof e=="function"}function ke(e){return typeof e=="object"&&e!==null}function Qe(e){if(!k(e))throw new TypeError("Expect a function.")}function be(e){if(e.trim()==="")throw new TypeError("Expect watch path to be a non-empty string.");const n=e.split(".");for(const t of n)if(t.trim()==="")throw new TypeError("Expect watch path segments to be non-empty.");return e.split(".").map(t=>t.trim()).filter(t=>t!=="")}function Bn(e,n){const t=be(n);if(t.length===0)return;let s=e;for(const a of t){if(!ke(s)||!(a in s))return;s=s[a]}return s}const Xe=(e,n,t)=>{if(Array.isArray(e))throw new TypeError("Watching arrays is not supported.");Qe(t);const s=typeof n=="string"?[n]:n;if(!Array.isArray(s))throw new TypeError("Expect properties to be a string or an array of strings.");for(const i of s){if(typeof i!="string")throw new TypeError("Expect properties to be a string or an array of strings.");be(i)}const a=()=>s.map(i=>Bn(e,i)),r=[];for(const i of s){const p=be(i);let g=null;const E=()=>{const b=[],h=(c,v)=>{if(!ke(c)||v>=p.length)return;const m=p[v],S=Ye(c);if(S){const j=S.on(`set:${m}`,()=>{t(...a()),v<p.length-1&&g&&(g(),g=E())});b.push(j)}v<p.length-1&&h(c[m],v+1)};return h(e,0),()=>b.reduce((c,v)=>v()||c,!1)};g=E(),r.push(()=>g?g():!1)}return t(...a()),()=>r.reduce((i,p)=>p()||i,!1)};function $n(e,n){"watch"in e||Object.defineProperty(e,"watch",{configurable:!0,writable:!0,enumerable:!1,value(t,s){return n(typeof t=="string"?this:this,t,s)}})}function Be(e,n){return Object.prototype.hasOwnProperty.call(e,n)}function ve(e){if(typeof e=="symbol")return!1;const n=typeof e=="number"?e:Number(e);return!Number.isInteger(n)||n<0||n>=4294967295?!1:typeof e=="number"||e===String(n)}function Un(e){return Ye(e)?k(e.emit):!1}const Ze=(e,n={})=>{const{eventful:t=M,trace:s=null,shallow:a=!1}=n;Qe(t);const r=ce.options,i=new WeakMap,p=c=>{if(a||!ke(c)||Un(c))return c;if(i.has(c))return i.get(c);const v=Ze(c,{eventful:t,trace:s,shallow:a});return i.set(c,v),v},g=c=>{if(!a){if(Array.isArray(c)){for(let v=0;v<c.length;v++)c[v]=p(c[v]);return}for(const v of Reflect.ownKeys(c))Be(c,v)&&(c[v]=p(c[v]))}},E=c=>{const v=Array.isArray(c);g(c),$n(c,Xe);let m;const S=new Proxy(c,{set(j,y,A,T){const L=v&&ve(y),d=Reflect.get(j,y,T),u=Reflect.set(j,y,p(A),T);if(m&&u){const f=Reflect.get(j,y,T);if(!Object.is(d,f)){const w=L?{index:Number(y),value:f,previous:d}:{property:y,value:f,previous:d},P=s||r.trace;m.emit(`set:${String(y)}`,w),k(P)&&P(m,"set",w),m.emit("set",w)}}return u},deleteProperty(j,y){const A=v&&ve(y),T=Be(j,y),L=T?j[y]:void 0,d=Reflect.deleteProperty(j,y);if(m&&d&&T){const u=A?{index:Number(y),previous:L}:{property:y,previous:L},f=s||r.trace;m.emit(`delete:${String(y)}`,u),k(f)&&f(m,"delete",u),m.emit("delete",u)}return d},defineProperty(j,y,A){const T=Object.getOwnPropertyDescriptor(j,y)??null,L=Object.prototype.hasOwnProperty.call(A,"value")?{...A,value:p(A.value)}:A,d=Reflect.defineProperty(j,y,L),u=v&&(y==="length"||ve(y));if(m&&!u&&d){const f={property:y,descriptor:L,previous:T},w=s||r.trace;m.emit(`define:${String(y)}`,f),k(w)&&w(m,"define",f),m.emit("define",f)}return d}});return m=k(c==null?void 0:c.emit)?S:t(S),m},b=s||r.trace;if(Array.isArray(e)){const c=E(e);return k(b)&&b(c,"new"),c}if(e!==null&&typeof e=="object"){const c=E(e);return k(b)&&b(c,"new",{object:c}),c}const h=t({get value(){return e},set value(c){if(Object.is(c,e))return;const v=e;e=c;const m={property:"value",value:e,previous:v};h.emit("set:value",m),k(b)&&b(h,"set",m),h.emit("set",m)}});return k(b)&&b(h,"new",{object:h}),h},ce=Ze;ce.options={trace:null};ce.watch=Xe;const o=ce({apps:[],currentAppId:null,files:[],activeFileName:null,generating:!1,error:null});function x(e){return new Promise((n,t)=>{e.addEventListener("success",()=>{n(e.result)}),e.addEventListener("error",()=>{t(e.error??new Error("IndexedDB request failed"))})})}function Jn(e,n){return new Promise((t,s)=>{const a=indexedDB.open(e,n.length);a.addEventListener("upgradeneeded",r=>{const i=n.slice(r.oldVersion-1,r.newVersion??n.length-1);for(const p of i)p(a.result)}),a.addEventListener("success",()=>{t(a.result)}),a.addEventListener("blocked",()=>{s(new Error("Database opening is blocked"))}),a.addEventListener("error",()=>{s(a.error??new Error("Failed to open database"))})})}const Vn="asljs-app-builder";let ee=null;async function D(){return ee!==null||(ee=await Jn(Vn,[e=>{e.createObjectStore("apps",{keyPath:"id"}),e.createObjectStore("files",{keyPath:"id"}).createIndex("byAppId","appId",{unique:!1})}])),ee}async function Gn(){const n=(await D()).transaction("apps","readonly");return x(n.objectStore("apps").getAll())}async function Y(e){const t=(await D()).transaction("apps","readwrite");await x(t.objectStore("apps").put(e))}async function qn(e){const t=(await D()).transaction(["apps","files"],"readwrite");await x(t.objectStore("apps").delete(e));const s=t.objectStore("files"),a=await x(s.index("byAppId").getAllKeys(e));for(const r of a)await x(s.delete(r))}async function Wn(e){const t=(await D()).transaction("files","readonly");return x(t.objectStore("files").index("byAppId").getAll(e))}async function he(e){const t=(await D()).transaction("files","readwrite");await x(t.objectStore("files").put(e))}async function zn(e){const t=(await D()).transaction("files","readwrite");await x(t.objectStore("files").delete(e))}async function Kn(e,n){const a=(await D()).transaction("files","readwrite").objectStore("files"),r=await x(a.index("byAppId").getAllKeys(e));for(const i of r)await x(a.delete(i));for(const i of n)await x(a.put(i))}const Hn=`# observable

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
`,Yn=`# eventful

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
`,Qn=`# data-binding

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
`,Xn=`# components

> Part of [Alexandrite Software Library][#1] - a set of high-quality,
performant JavaScript libraries for everyday use.

## Overview

\`asljs-components\` is a catalog of reusable UI components for web applications
in the ASLJS monorepo.

This package is component-oriented: each component has a custom element name,
purpose, and usage pattern.

## Installation

\`\`\`bash
npm install asljs-components
\`\`\`

NPM Package: [asljs-components](https://www.npmjs.com/package/asljs-components)

## Components

### List

- Name: \`List\`
- Custom element: \`asljs-list\`
- Purpose: render collections from templates with row context binding.

Notes:

- Uses \`template[data-slot="item"]\` for row rendering.
- Supports optional \`template[data-slot="empty"]\` for empty state.
- Supports optional \`template[data-slot="container"]\` with required
  \`data-role="items"\` insertion point.

\`\`\`ts
import 'asljs-components';

const list =
  document.createElement('asljs-list');

list.innerHTML = \`
  <template data-slot="container">
    <section class="rows" data-role="items"></section>
  </template>

  <template data-slot="empty">
    <div>No items</div>
  </template>

  <template data-slot="item">
    <div>
      <a data-bind-href="item.url"
         data-bind-text="item.title"></a>
    </div>
  </template>
\`;

list.items =
  [ { title: 'First', url: '/first' },
    { title: 'Second', url: '/second' } ];
\`\`\`

### List API Reference

Exports:

- \`List\`
- \`ListItem\` type
- \`ListItemsSource\` type
- \`ListRowContext\` type

## License

MIT License. See [LICENSE](LICENSE.md) for details.

[#1]: https://github.com/AlexandriteSoftware/asljs
`,Zn=`# dali

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
`,et=`export {
    observable
  } from './observable.js';

export {
    ObservableObject
  } from './observable-object.js';

export type {
    Observable,
    ObservableEventsArray,
    ObservableEventsObject,
    ObservableEventsPrimitive,
    ObservableFn,
    ObservableGlobalOptions,
    ObservableOptions,
    ObservableTraceFn,
    ObservableWatchFn,
    WatchedValues,
  } from './types.js';
`,nt=`export {
    eventful
  } from './eventful.js';

export {
    type EventfulLike,
    isEventfulLike,
    asEventfulLike,
  } from './eventful-like.js';

export {
    EventfulBase
  } from './eventful-base.js';

export {
    type EventName,
    type EventMap,
    type Eventful,
    type EventfulFactory,
    type EventfulOptions,
    type Listener,
    ListenerError,
    type TraceFn
  } from './types.js';
`,tt=`export {
    bindDataModel
  } from './bind-data-model.js';

export {
    createBuiltInPipes
  } from './pipes.js';

export type {
    BindDataModelOptions,
    DataModel,
  } from './types.js';
`,st=`export {
    List,
    type ListItem,
    type ListItemsSource,
    type ListRowContext,
  } from './list.js';
`,at=`export {
    dbDelete,
    dbOpen,
    dbRequestAsync,
  } from './db.js';

export {
    EVENT_SOURCE_STORE_NAME,
  EVENT_SOURCE_PROJECTION_STORE_NAME,
    eventSourceGetAll,
  eventSourceProjectionGet,
  eventSourceProjectionSet,
  eventSourceProjectionSetup,
    eventSourceSetup,
  EventSourceManager,
  IndexedDbEventSourceAdapter,
  EventSourceProjectionManager,
  EventSourceConflictError,
  type EventSourceAdapter,
  type EventSourceEvent,
  type EventSourceProjection,
  type EventSourceTransaction,
  } from './event-source.js';

export {
    SagaManager,
    SAGA_ENTRIES_STORE_NAME,
    SAGA_STORE_NAME,
    sagaEntriesGetAll,
    sagaGetAll,
    sagaSetup,
    type SagaEntryRecord,
    type SagaForwardOperation,
    type SagaStatus,
    type SagaTransactionRecord,
    type SagaUndoOperation,
  } from './saga.js';

export {
    IncrementVersionStrategy as IncrementTableVersionStrategy,
  } from './version-strategy-increment.js';

export {
    type DeleteStrategy as TableDeleteStrategy,
  } from './delete-strategy.js';

export {
    Table,
    LiveRecord,
    LiveRecordSet,
    type TableBroadcastMessage,
    type TableBroadcastService,
    type TableEvents,
    type TableEventsReceiver,
    type TableObservedEvent,
    type TableObservedReceiver,
  } from './table.js';

export {
    type LiveRecordEvents,
    type LiveRecordSetPayload,
  } from './live-record.js';

export {
    type LiveRecordSetEvents,
    type LiveRecordSetSetPayload,
  } from './live-recordset.js';

export {
    VersionConflictError as TableVersionConflictError,
  } from './version-conflict-error.js';

export {
    type VersionStrategy as TableVersionStrategy,
  } from './version-strategy.js';

export {
    txDone,
    txRead,
    txReuseOrCreate,
    txWrite,
    TxMode,
    txEnsure,
  } from './transactions.js';

export {
    UuidSoftDeleteStrategy as UuidSoftDeleteTableDeleteStrategy,
  } from './delete-strategy-uuid-soft-delete-strategy.js';

export {
    UuidVersionStrategy as UuidTableVersionStrategy,
  } from './version-strategy-uuid.js';
`,rt=`{
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
`,ot=`{
  "name": "asljs-eventful",
  "version": "0.4.8",
  "description": "Lightweight event helper adding on/off/emit to any object.",
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
  "directories": {
    "doc": "docs"
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
  }
}
`,it=`{
  "name": "asljs-data-binding",
  "version": "0.2.3",
  "description": "Declarative data-bind-* bindings for DOM elements with value pipes and event middleware.",
  "files": [
    "dist/**",
    "README.md",
    "LICENSE.md"
  ],
  "keywords": [
    "data-binding",
    "dom",
    "observable",
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
    "asljs-observable": "^0.5.3"
  },
  "devDependencies": {
    "@types/jsdom": "^21.1.7",
    "jsdom": "^26.1.0"
  }
}
`,lt=`{
  "name": "asljs-components",
  "version": "0.1.1",
  "description": "Web components for ASLJS applications.",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    }
  },
  "files": [
    "dist/**",
    "README.md",
    "LICENSE.md"
  ],
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
    "test:watch": "npm run build:test && node --watch --test dist/*.test.js"
  },
  "keywords": [
    "web-components",
    "lit",
    "ui",
    "javascript"
  ],
  "author": "\\"Alex Netkachov\\" <alex.netkachov@gmail.com>",
  "license": "MIT",
  "homepage": "https://github.com/AlexandriteSoftware/asljs#readme",
  "bugs": {
    "url": "https://github.com/AlexandriteSoftware/asljs/issues"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/AlexandriteSoftware/asljs.git"
  },
  "dependencies": {
    "asljs-data-binding": "^0.2.0",
    "asljs-eventful": "^0.4.8",
    "lit": "^3.3.1"
  }
}
`,ct=`{
  "name": "asljs-dali",
  "version": "0.1.2",
  "description": "IndexedDB data layer with a typed Table abstraction.",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    }
  },
  "files": [
    "dist/**",
    "README.md",
    "LICENSE.md"
  ],
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
  "keywords": [
    "indexeddb",
    "table",
    "data-layer",
    "javascript"
  ],
  "author": "\\"Alex Netkachov\\" <alex.netkachov@gmail.com>",
  "license": "MIT",
  "homepage": "https://github.com/AlexandriteSoftware/asljs#readme",
  "bugs": {
    "url": "https://github.com/AlexandriteSoftware/asljs/issues"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/AlexandriteSoftware/asljs.git"
  },
  "dependencies": {
    "asljs-eventful": "^0.4.8",
    "asljs-observable": "^0.5.3"
  },
  "devDependencies": {
    "fake-indexeddb": "^6.2.4"
  }
}
`,dt=[{type:"function",name:"listFileset",description:"List all file paths in the virtual filesystem.",parameters:{type:"object",properties:{},required:[],additionalProperties:!1},strict:!0},{type:"function",name:"readFile",description:"Read the full text content of a file.",parameters:{type:"object",properties:{path:{type:"string"}},required:["path"],additionalProperties:!1},strict:!0},{type:"function",name:"setFileContent",description:"Create or fully replace file content.",parameters:{type:"object",properties:{path:{type:"string"},content:{type:"string"}},required:["path","content"],additionalProperties:!1},strict:!0},{type:"function",name:"replaceFilePart",description:"Replace part of a file by exact search string.",parameters:{type:"object",properties:{path:{type:"string"},search:{type:"string"},replacement:{type:"string"},replaceAll:{type:"boolean"}},required:["path","search","replacement","replaceAll"],additionalProperties:!1},strict:!0},{type:"function",name:"deleteFile",description:"Delete a file from the virtual filesystem.",parameters:{type:"object",properties:{path:{type:"string"}},required:["path"],additionalProperties:!1},strict:!0},{type:"function",name:"evalInApp",description:"Evaluate JavaScript in the running app document context.",parameters:{type:"object",properties:{code:{type:"string"}},required:["code"],additionalProperties:!1},strict:!0},{type:"function",name:"getAppDiagnostics",description:"Get current runtime logs and errors from the running app.",parameters:{type:"object",properties:{},required:[],additionalProperties:!1},strict:!0},{type:"function",name:"runAppAndCollectDiagnostics",description:"Run the app and collect runtime logs and errors after startup.",parameters:{type:"object",properties:{},required:[],additionalProperties:!1},strict:!0}],pt="https://api.openai.com/v1/responses",ut=Q(rt,"asljs-observable"),ft=Q(ot,"asljs-eventful"),mt=Q(it,"asljs-data-binding"),vt=Q(lt,"asljs-components"),gt=Q(ct,"asljs-dali"),en=jt(),bt="gpt-5.3-codex",W=20;function ht(){return en}const yt=12;async function wt(e,n,t,s,a){var E;let r,i=e,p=Et(a==null?void 0:a.initialToolStepLimit),g=0;for(;;){if(await V(a,`Step ${g+1}: requesting assistant response...`),g>=p){if(!(await((E=a==null?void 0:a.onToolStepLimit)==null?void 0:E.call(a,{stepsCompleted:g,stepLimit:p}))??!1))throw new Error("AI exceeded maximum tool steps without completing.");p+=yt,await V(a,`Extended step limit to ${p}. Continuing...`)}const b=await fetch(pt,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${n}`},body:JSON.stringify({model:t,instructions:en,temperature:.1,previous_response_id:r,input:i,tools:dt})});if(!b.ok){const m=await b.json().catch(()=>({})),S=St(m)??`OpenAI API error: ${b.status}`;throw new Error(S)}const h=await b.json();if(!Array.isArray(h.output))throw new Error("AI returned an unexpected response format.");const c=h.output.filter(Tt);if(c.length===0){await V(a,`Completed in ${g+1} step(s). Finalizing summary...`);const m=Lt(h);return{summary:m===""?"Completed tool-based update.":m}}const v=[];for(const m of c){await V(a,`Step ${g+1}: running ${nn(m)}...`);const S=await xt(m,s);v.push({type:"function_call_output",call_id:kt(m),output:S})}await V(a,`Step ${g+1}: submitted ${v.length} tool result(s).`),r=typeof h.id=="string"?h.id:r,i=v,g+=1}}function Et(e){if(!Number.isFinite(e))return W;const n=Math.floor(e);return n>=1?n:W}async function V(e,n){(e==null?void 0:e.onProgress)!==void 0&&await Promise.resolve(e.onProgress(n))}function jt(){const e=`
      Latest ASLJS package versions to use:
      - asljs-eventful@${ft}
      - asljs-observable@${ut}
      - asljs-data-binding@${mt}
      - asljs-components@${vt}
      - asljs-dali@${gt}
    `,n=[G("eventful",Yn,nt),G("observable",Hn,et),G("data-binding",Qn,tt),G("components",Xn,st),G("dali",Zn,at)].join(`

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

Input interpretation rules:
- Treat user input as an app modification request by default.
- If user input looks command-like (for example: "add", "change", "replace", "remove", "rename", "fix", "update", "move", "create"), interpret it as instructions to modify the existing project files.
- If user input looks like project artifacts or descriptive specs (feature bullets, acceptance criteria, user stories, TODO lists, changelog-style notes, issue-like descriptions, README snippets, architecture notes), treat it as actionable requirements to implement in the current app.
- Do not just echo or summarize artifact-like input; apply it as code/file changes unless the user explicitly asks only for explanation.
- Prefer incremental edits to existing files over full rewrites when handling these requests.

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
  - getAppDiagnostics(): returns runtime logs and errors from the running app.
  - runAppAndCollectDiagnostics(): runs app and returns startup/runtime logs and errors.
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
- After each generation pass, the agent must run the app and collect diagnostics using runAppAndCollectDiagnostics().
- If diagnostics report runtime errors, the agent must iteratively fix files and re-run diagnostics until errors are resolved.
- The agent should use getAppDiagnostics() and evalInApp(...) for targeted debugging checks between edits.
- The final generated code should reflect this workflow explicitly in app.js and/or README.

Use this package knowledge as source material when choosing APIs and patterns:
${n}
`.trim()}function G(e,n,t){return`
[${e}] README excerpt:
${$e(n,9e3)}

[${e}] exported API/types excerpt:
${$e(t,6e3)}
`.trim()}function $e(e,n){return e.length<=n?e:`${e.slice(0,n)}
... [truncated]`}function Q(e,n){try{return JSON.parse(e).version??"latest"}catch{return console.warn(`Failed to parse package metadata for ${n}.`),"latest"}}function St(e){const n=e.error;return typeof(n==null?void 0:n.message)=="string"?n.message:null}async function xt(e,n){const t=nn(e),s=At(e.arguments);try{switch(t){case"listFileset":{const a=await n.listFileset();return C(a)}case"readFile":{const a=await n.readFile(N(s,"path"));return C(a)}case"setFileContent":return await n.setFileContent(N(s,"path"),N(s,"content")),C("ok");case"replaceFilePart":return await n.replaceFilePart(N(s,"path"),N(s,"search"),N(s,"replacement"),It(s,"replaceAll",!1)),C("ok");case"deleteFile":return await n.deleteFile(N(s,"path")),C("ok");case"evalInApp":{const a=await n.evalInApp(N(s,"code"));return C(a)}case"getAppDiagnostics":{const a=await n.getAppDiagnostics();return C(a)}case"runAppAndCollectDiagnostics":{const a=await n.runAppAndCollectDiagnostics();return C(a)}default:return Ue(`Unknown tool: ${t}`)}}catch(a){return Ue(a instanceof Error?a.message:String(a))}}function At(e){if(e===void 0)return{};if(typeof e=="object"&&e!==null)return e;if(typeof e!="string")throw new Error("Invalid tool arguments value.");try{const n=JSON.parse(e);if(typeof n!="object"||n===null)throw new Error("Tool arguments must be a JSON object.");return n}catch{throw new Error("Invalid tool arguments JSON.")}}function Tt(e){return e.type==="function_call"}function nn(e){if(typeof e.name!="string"||e.name.trim()==="")throw new Error("Tool call missing function name.");return e.name}function kt(e){if(typeof e.call_id!="string"||e.call_id.trim()==="")throw new Error("Tool call missing call_id.");return e.call_id}function Lt(e){return typeof e.output_text=="string"&&e.output_text.trim()!==""?e.output_text.trim():Array.isArray(e.output)?e.output.filter(t=>t.type==="message").flatMap(t=>t.content??[]).map(t=>t.text??"").map(t=>t.trim()).filter(t=>t!=="").join(`
`):""}function N(e,n){const t=e[n];if(typeof t!="string")throw new Error(`Tool argument "${n}" must be a string.`);return t}function It(e,n,t){const s=e[n];if(s===void 0)return t;if(typeof s!="boolean")throw new Error(`Tool argument "${n}" must be a boolean.`);return s}function C(e){return tn({ok:!0,value:e})}function Ue(e){return tn({ok:!1,error:e})}function tn(e){try{return JSON.stringify(e)}catch{return'{"ok":false,"error":"Failed to serialize tool result."}'}}const Le="asljs-app-builder:eval-request",sn="asljs-app-builder:eval-response",an="asljs-app-builder:diagnostics-request",rn="asljs-app-builder:diagnostics-response",Je=`<script>
(() => {
  const REQUEST = '${Le}';
  const RESPONSE = '${sn}';
  const DIAG_REQUEST = '${an}';
  const DIAG_RESPONSE = '${rn}';
  const DIAG_KEY = '__asljs_app_builder_diagnostics';
  const MAX_ENTRIES = 250;

  const diagnostics =
    window[DIAG_KEY]
    ?? { logs: [], errors: [] };

  window[DIAG_KEY] = diagnostics;

  const toText = (value) => {
    if (typeof value === 'string') {
      return value;
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
      addError(event.message || 'Unknown runtime error');
    });

    window.addEventListener('unhandledrejection', event => {
      addError(event.reason instanceof Error
        ? event.reason.message
        : toText(event.reason));
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
<\/script>`;function Ot(e,n){if(n.length===0){e.removeAttribute("srcdoc"),e.src="about:blank";return}const t=n.find(r=>r.name==="index.html")??n.find(r=>r.name.endsWith(".html"))??null;if(t===null){e.removeAttribute("srcdoc"),e.src="about:blank";return}let s=t.content;const a=n.find(r=>r.name==="style.css")??n.find(r=>r.name.endsWith(".css"))??null;a!==null&&(s=s.replace(/<link[^>]+href=["']style\.css["'][^>]*>/gi,`<style>${a.content}</style>`),s=s.replace(/<link[^>]+href=["']([^"']+\.css)["'][^>]*>/gi,`<style>${a.content}</style>`));for(const r of n){if(!r.name.endsWith(".js"))continue;const i=r.name.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");s=s.replace(new RegExp(`(<script[^>]*?)\\s+src=["']${i}["']([^>]*)><\\/script>`,"gi"),(p,g,E)=>{const b=`${String(g)} ${String(E)}`;return/type=["']module["']/i.test(b)?`<script type="module">${r.content}<\/script>`:`<script>${r.content}<\/script>`})}s=Nt(s,n),s=Pt(s),e.srcdoc=s}async function Ve(e,n){const t=await ln(e,Le,{code:n},sn);if(t.ok===!0)return t.value;throw new Error(typeof t.error=="string"?t.error:"Unknown preview evaluation error.")}async function on(e){const n=await ln(e,an,{},rn);if(n.ok!==!0)throw new Error(typeof n.error=="string"?n.error:"Failed to read preview diagnostics.");return n.diagnostics??{logs:[],errors:[]}}async function ln(e,n,t,s){const a=e.contentWindow;if(a===null)throw new Error("Preview frame is not available.");const r=crypto.randomUUID();return new Promise((i,p)=>{const g=window.setTimeout(()=>{b(),p(new Error("Timed out waiting for app evaluation result."))},5e3),E=h=>{if(h.source!==a)return;const c=h.data;c.type!==s||c.id!==r||(b(),i(c))};function b(){window.clearTimeout(g),window.removeEventListener("message",E)}window.addEventListener("message",E),a.postMessage({type:n,id:r,...t},"*")})}function Pt(e){return e.includes(Le)?e:e.includes("</body>")?e.replace("</body>",`${Je}</body>`):`${e}
${Je}`}function Nt(e,n){if(/type=["']importmap["']/i.test(e))return e;const t=n.find(i=>i.name==="package.json")??null,s=Ct(t==null?void 0:t.content),a=Object.fromEntries(s.map(([i,p])=>[i,`https://esm.sh/${i}@${p}?bundle`]));if(Object.keys(a).length===0)return e;const r=`<script type="importmap">${JSON.stringify({imports:a})}<\/script>`;return/<head[^>]*>/i.test(e)?e.replace(/<head[^>]*>/i,i=>`${i}
${r}`):`${r}
${e}`}function Ct(e){if(e===void 0)return Ge();try{const n=JSON.parse(e),t={...n.dependencies??{},...n.devDependencies??{}};return["asljs-eventful","asljs-observable","asljs-data-binding","asljs-components","asljs-dali"].map(r=>[r,Rt(t[r])])}catch{return Ge()}}function Rt(e){if(typeof e!="string"||e.trim()==="")return"latest";const n=e.trim().replace(/^[~^<>=\s]+/,"");return n===""?"latest":n}function Ge(){return[["asljs-eventful","latest"],["asljs-observable","latest"],["asljs-data-binding","latest"],["asljs-components","latest"],["asljs-dali","latest"]]}function z(){return crypto.randomUUID()}function O(){return new Date().toISOString()}function l(e){const n=document.getElementById(e);if(n===null)throw new Error(`Missing element #${e}`);return n}const Ft=l("app-workspace"),Mt=l("first-app-setup"),cn=l("first-api-key-input"),K=l("first-app-name-input"),Dt=l("btn-create-first-app"),Ie=l("panels"),qe=l("panel-chat"),We=l("panel-editor"),R=l("app-select"),I=l("file-select"),te=l("file-content"),q=l("chat-messages"),ze=l("chat-progress"),ye=l("chat-input"),we=l("btn-generate"),_t=l("btn-run"),Bt=l("btn-refresh-preview"),U=l("preview-frame"),$t=l("btn-new-app"),Ut=l("btn-import"),Jt=l("btn-project-settings"),Vt=l("btn-export"),Gt=l("btn-settings"),qt=l("btn-agent-instructions"),Ee=l("btn-toggle-chat"),je=l("btn-toggle-files"),se=l("settings-modal"),Wt=l("btn-close-settings"),zt=l("btn-save-settings"),Kt=l("btn-cancel-settings"),Se=l("api-key-input"),dn=l("model-select"),pn=l("theme-select"),un=l("font-size-input"),fn=l("max-tool-steps-input"),H=l("name-modal"),Ht=l("name-modal-title"),ne=l("app-name-input"),de=l("btn-confirm-name"),Yt=l("btn-cancel-name"),Qt=l("btn-close-name-modal"),ae=l("project-settings-modal"),$=l("project-name-input"),Xt=l("btn-save-project-settings"),Zt=l("btn-delete-project"),es=l("btn-close-project-settings"),ns=l("btn-close-project-settings-x"),re=l("import-file"),oe=l("agent-instructions-modal"),xe=l("agent-instructions-text"),ts=l("btn-close-agent-instructions"),ss=l("btn-close-agent-instructions-2"),as=l("btn-copy-agent-instructions"),mn="asljs-app-builder-settings",vn="light",Ae=14,gn="__new__",bn="__import__";function _(){try{const e=localStorage.getItem(mn)??"{}";return JSON.parse(e)}catch{return{}}}function hn(e){localStorage.setItem(mn,JSON.stringify(e))}function Oe(){return _().apiKey??""}function yn(){const e=_().model;return e==="gpt-5.3-codex"||e==="gpt-5.4"?e:bt}function wn(){const e=_().maxToolSteps;if(!Number.isFinite(e))return W;const n=Math.floor(e);return n<1?W:n}function En(){return _().theme==="light"?"light":vn}function jn(){const e=_().fontSize;if(!Number.isFinite(e))return Ae;const n=Math.floor(e);return n<12||n>20?Ae:n}function Sn(){document.body.dataset.theme=En(),document.documentElement.style.fontSize=`${jn()}px`}function rs(){if(o.currentAppId===null)throw new Error("No active app. Create or open an app first.");return o.currentAppId}function Te(e){const n=e.trim().replace(/\\/g,"/").replace(/^\.\//,"").replace(/^\/+/,"");if(n==="")throw new Error("Path cannot be empty.");if(n.includes(".."))throw new Error("Parent path segments are not allowed.");return n}function pe(e){const n=Te(e),t=o.files.find(s=>Te(s.name).toLowerCase()===n.toLowerCase());return(t==null?void 0:t.name)??null}async function xn(){return[...o.files].map(e=>e.name).sort((e,n)=>e.localeCompare(n))}async function Pe(e){const n=pe(e),t=n===null?void 0:o.files.find(s=>s.name===n);if(t===void 0)throw new Error(`File not found: ${e}`);return t.content}async function Ne(e,n){const t=rs(),s=Te(e),a=pe(s),r=o.files.find(p=>p.name===(a??s));if(r!==void 0){const p={...r,content:n};await he(p),o.files=o.files.map(g=>g.id===p.id?p:g),o.activeFileName=p.name;return}const i={id:z(),appId:t,name:s,content:n};await he(i),o.files=[...o.files,i],o.activeFileName=i.name}async function An(e){var a;const n=pe(e),t=n===null?void 0:o.files.find(r=>r.name===n);if(t===void 0)return;await zn(t.id);const s=o.files.filter(r=>r.id!==t.id);o.files=s,o.activeFileName===e&&(o.activeFileName=((a=s[0])==null?void 0:a.name)??null)}async function Tn(e,n,t,s=!1){if(n==="")throw new Error("Search text cannot be empty.");const a=pe(e);if(a===null)throw new Error(`File not found: ${e}`);const r=await Pe(a);if(!r.includes(n))throw new Error(`Search text not found in ${a}.`);let i=r;if(s)i=r.split(n).join(t);else{const p=r.indexOf(n);if(r.indexOf(n,p+n.length)!==-1)throw new Error("Search text is ambiguous. Use replaceAll=true or provide a more specific search block.");i=r.slice(0,p)+t+r.slice(p+n.length)}await Ne(a,i)}async function kn(e){if(o.files.length===0)throw new Error("No files available to run.");J();try{return await Ve(U,e)}catch{return J(),Ve(U,e)}}async function Ln(){return on(U)}async function In(){return J(),await os(350),on(U)}function os(e){return new Promise(n=>{window.setTimeout(n,e)})}function ie(){R.replaceChildren();const e=[...o.apps].sort((s,a)=>a.updatedAt.localeCompare(s.updatedAt));for(const s of e){const a=document.createElement("option");a.value=s.id,a.textContent=s.name,R.appendChild(a)}if(e.length>0){const s=document.createElement("option");s.value="__separator__",s.textContent="────────",s.disabled=!0,R.appendChild(s)}const n=document.createElement("option");n.value=gn,n.textContent="New...",R.appendChild(n);const t=document.createElement("option");t.value=bn,t.textContent="Import...",R.appendChild(t),o.currentAppId!==null&&(R.value=o.currentAppId)}function On(){Ft.classList.remove("hidden");const e=o.currentAppId!==null&&o.apps.some(n=>n.id===o.currentAppId);if(Mt.classList.toggle("hidden",e),Ie.classList.toggle("hidden",!e),!e){cn.value=Oe(),K.value="";return}Ce(),Re()}async function Pn(){const e=K.value.trim();if(e===""){K.focus();return}const n=cn.value.trim();if(n!==""){const s=_();s.apiKey=n,hn(s)}const t={id:z(),name:e,createdAt:O(),updatedAt:O()};await Y(t),o.apps=[...o.apps,t],await X(t.id)}function Ce(){if(I.replaceChildren(),o.files.length===0){const n=document.createElement("option");n.value="",n.textContent="No files",I.appendChild(n),I.value="",I.disabled=!0;return}for(const n of o.files){const t=document.createElement("option");t.value=n.name,t.textContent=n.name,I.appendChild(t)}const e=o.activeFileName??o.files[0].name;I.value=e,I.disabled=!1}function Re(){const e=o.files.find(n=>n.name===o.activeFileName);te.value=(e==null?void 0:e.content)??"",te.disabled=e===void 0}function Ke(e){o.generating=e,we.disabled=e,we.innerHTML=e?'<span class="spinner"></span> Sending…':"Send"}function ge(e,n){ze.textContent=e,ze.classList.toggle("hidden",!n)}function F(e,n){const t=document.createElement("div");t.className=`chat-msg ${e}`;const s=document.createElement("div");s.className="chat-msg-role",s.textContent=e==="user"?"You":"Assistant";const a=document.createElement("div");a.className="chat-bubble",a.textContent=n,t.appendChild(s),t.appendChild(a),q.appendChild(t),q.scrollTop=q.scrollHeight}async function ue(){if(o.activeFileName===null||o.currentAppId===null)return;const e=o.files.find(t=>t.name===o.activeFileName);if(e===void 0)return;const n=te.value;e.content!==n&&(e.content=n,await he(e))}async function X(e){var t;o.currentAppId=e;const n=await Wn(e);o.files=n,o.activeFileName=((t=n[0])==null?void 0:t.name)??null,q.replaceChildren()}function Nn(){Ht.textContent="New App",ne.value="",H.classList.remove("hidden"),ne.focus(),de.onclick=async()=>{const e=ne.value.trim();if(e==="")return;H.classList.add("hidden");const n={id:z(),name:e,createdAt:O(),updatedAt:O()};await Y(n),o.apps=[...o.apps,n],await X(n.id)}}function Fe(){H.classList.add("hidden"),de.onclick=null}function is(){const e=o.apps.find(n=>n.id===o.currentAppId);e!==void 0&&($.value=e.name,ae.classList.remove("hidden"),$.focus(),$.select())}function Z(){ae.classList.add("hidden")}async function Cn(){const e=o.apps.find(s=>s.id===o.currentAppId);if(e===void 0)return;const n=$.value.trim();if(n===""){$.focus();return}const t={...e,name:n,updatedAt:O()};await Y(t),o.apps=o.apps.map(s=>s.id===e.id?t:s),Z()}async function ls(){Z(),await cs()}async function cs(){const e=o.apps.find(n=>n.id===o.currentAppId);e!==void 0&&confirm(`Delete "${e.name}"? This cannot be undone.`)&&(await qn(e.id),o.apps=o.apps.filter(n=>n.id!==e.id),o.currentAppId=null,o.files=[],o.activeFileName=null,q.replaceChildren(),U.src="about:blank")}async function Rn(){const e=ye.value.trim();if(e==="")return;const n=Oe();if(n===""){F("assistant","No OpenAI API key set. Open Settings (⚙) to add your key. Generation is optional — you can also create files manually.");return}if(o.currentAppId===null){F("assistant","Please create or open an app first.");return}ye.value="",F("user",e),Ke(!0),ge("Starting generation...",!0);try{const t=yn(),s=wn(),a=await wt(e,n,t,{listFileset:xn,readFile:Pe,setFileContent:Ne,replaceFilePart:Tn,deleteFile:An,evalInApp:kn,getAppDiagnostics:Ln,runAppAndCollectDiagnostics:In},{initialToolStepLimit:s,onToolStepLimit:async({stepsCompleted:i})=>confirm(`AI reached ${i} tool steps without finishing. Continue for 12 more steps?`),onProgress:i=>{ge(i,!0)}}),r=o.apps.find(i=>i.id===o.currentAppId);if(r!==void 0){const i={...r,updatedAt:O()};await Y(i),o.apps=o.apps.map(p=>p.id===r.id?i:p)}F("assistant",a.summary),J()}catch(t){const s=t instanceof Error?t.message:String(t);F("assistant",`Error: ${s}`)}finally{ge("",!1),Ke(!1)}}function J(){ue().then(()=>{Ot(U,o.files)})}async function ds(){const e=o.apps.find(r=>r.id===o.currentAppId);if(e===void 0)return;await ue();const n={app:e,files:o.files,exportedAt:O()},t=new Blob([JSON.stringify(n,null,2)],{type:"application/json"}),s=URL.createObjectURL(t),a=document.createElement("a");a.href=s,a.download=`${e.name.replace(/\s+/g,"-")}.json`,a.click(),URL.revokeObjectURL(s)}function Fn(){re.value="",re.click()}async function ps(){var n;const e=(n=re.files)==null?void 0:n[0];if(e!==void 0)try{const t=await e.text(),s=JSON.parse(t);if(s.app===void 0||typeof s.app.name!="string"||!Array.isArray(s.files))throw new Error("Invalid app JSON format.");const a=z(),r={id:a,name:`${s.app.name} (imported)`,createdAt:s.app.createdAt??O(),updatedAt:O()},i=s.files.filter(p=>typeof p.name=="string"&&typeof p.content=="string").map(p=>({id:z(),appId:a,name:p.name,content:p.content}));await Y(r),await Kn(a,i),o.apps=[...o.apps,r],await X(a)}catch(t){const s=t instanceof Error?t.message:String(t);alert(`Import failed: ${s}`)}}function us(){Se.value=Oe(),dn.value=yn(),pn.value=En(),un.value=String(jn()),fn.value=String(wn()),se.classList.remove("hidden"),Se.focus()}function fe(){se.classList.add("hidden")}function fs(){const e=_();e.apiKey=Se.value.trim(),e.model=dn.value==="gpt-5.4"?"gpt-5.4":"gpt-5.3-codex",e.theme=pn.value==="light"?"light":vn;const n=Number.parseInt(un.value,10);e.fontSize=Number.isFinite(n)&&n>=12&&n<=20?n:Ae;const t=Number.parseInt(fn.value,10);e.maxToolSteps=Number.isFinite(t)&&t>=1?t:W,hn(e),Sn(),fe()}function ms(){xe.value=ht(),oe.classList.remove("hidden"),xe.scrollTop=0}function Me(){oe.classList.add("hidden")}function vs(){const e=!qe.classList.contains("collapsed");Ee.textContent=e?"Chat ▸":"Chat ▾",Ee.setAttribute("aria-expanded",e?"false":"true"),qe.classList.toggle("collapsed",e),Ie.classList.toggle("chat-collapsed",e)}function gs(){const e=!We.classList.contains("collapsed");je.textContent=e?"Files ▸":"Files ▾",je.setAttribute("aria-expanded",e?"false":"true"),We.classList.toggle("collapsed",e),Ie.classList.toggle("files-collapsed",e)}async function bs(){const e=xe.value;try{await navigator.clipboard.writeText(e),F("assistant","Agent instructions copied to clipboard.")}catch{F("assistant","Could not copy to clipboard automatically. You can still select and copy from the instructions modal.")}}o.on("set:apps",()=>ie());o.on("set:currentAppId",()=>{ie(),On()});o.on("set:files",()=>{Ce(),Re()});o.on("set:activeFileName",()=>{Ce(),Re()});$t.addEventListener("click",Nn);Ut.addEventListener("click",Fn);Jt.addEventListener("click",is);Vt.addEventListener("click",()=>{ds()});we.addEventListener("click",()=>{Rn()});_t.addEventListener("click",J);Bt.addEventListener("click",J);Gt.addEventListener("click",us);qt.addEventListener("click",ms);Ee.addEventListener("click",vs);je.addEventListener("click",gs);Wt.addEventListener("click",fe);zt.addEventListener("click",fs);Kt.addEventListener("click",fe);se.addEventListener("click",e=>{e.target===se&&fe()});ts.addEventListener("click",Me);ss.addEventListener("click",Me);as.addEventListener("click",()=>{bs()});oe.addEventListener("click",e=>{e.target===oe&&Me()});de.addEventListener("click",()=>{});Yt.addEventListener("click",Fe);Qt.addEventListener("click",Fe);H.addEventListener("click",e=>{e.target===H&&Fe()});Xt.addEventListener("click",()=>{Cn()});Zt.addEventListener("click",()=>{ls()});es.addEventListener("click",Z);ns.addEventListener("click",Z);ae.addEventListener("click",e=>{e.target===ae&&Z()});ne.addEventListener("keydown",e=>{e.key==="Enter"&&de.click()});$.addEventListener("keydown",e=>{e.key==="Enter"&&(e.preventDefault(),Cn())});Dt.addEventListener("click",()=>{Pn()});K.addEventListener("keydown",e=>{e.key==="Enter"&&(e.preventDefault(),Pn())});ye.addEventListener("keydown",e=>{e.key==="Enter"&&!e.shiftKey&&(e.preventDefault(),Rn())});R.addEventListener("change",()=>{const e=R.value;if(e===gn){Nn(),ie();return}if(e===bn){Fn(),ie();return}e!==""&&e!==o.currentAppId&&X(e)});I.addEventListener("change",()=>{const e=I.value;e===""||e===o.activeFileName||(ue(),o.activeFileName=e)});te.addEventListener("blur",()=>{ue()});re.addEventListener("change",()=>{ps()});window.listFileset=xn;window.readFile=Pe;window.setFileContent=Ne;window.replaceFilePart=Tn;window.deleteFile=An;window.evalInApp=kn;window.getAppDiagnostics=Ln;window.runAppAndCollectDiagnostics=In;async function hs(){Sn();const e=await Gn();if(o.apps=e,e.length>0){const n=[...e].sort((t,s)=>s.updatedAt.localeCompare(t.updatedAt));await X(n[0].id)}else o.currentAppId=null,o.files=[],o.activeFileName=null,On(),K.focus()}hs().catch(e=>{console.error("App Builder init failed:",e)});
