(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))a(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const i of r.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&a(i)}).observe(document,{childList:!0,subtree:!0});function t(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function a(s){if(s.ep)return;s.ep=!0;const r=t(s);fetch(s.href,r)}})();class Fn extends Error{constructor(n,t,a,s,r){super(n),this.name="ListenerError",this.error=t,this.object=a,this.event=s,this.listener=r}}function $(e){if(typeof e!="string"&&typeof e!="symbol")throw new TypeError("Expect event to be a string or symbol.")}function le(e){return typeof e=="function"}function $e(e){if(le(e))return e}function Qe(e){return typeof e=="object"&&e!==null}function ve(e){if(!le(e))throw new TypeError("Expect a function.")}const _n=(e=Object.create(null),n={})=>{if(!Qe(e)&&!le(e))throw new TypeError("Expect an object or a function.");for(const d of["on","once","off","emit","emitAsync","has"])if(d in e)throw new Error(`Method "${d}" already exists.`);const{strict:t=!1,trace:a=null,error:s=null}=n,r=$e(a)??null,i=$e(s)??null,p=e!==_,g=(d,u)=>{r==null||r(d,u),p&&_.emit(d,u)};g("new",{object:e});const E=new Set,b=new Map,h={enumerable:!1,configurable:!0,writable:!0};return Object.defineProperties(e,{on:Object.assign({value:S},h),once:Object.assign({value:x},h),off:Object.assign({value:y},h),emit:Object.assign({value:L},h),emitAsync:Object.assign({value:O},h),has:Object.assign({value:T},h)}),e;function c(d,u){let m=b.get(d);m||b.set(d,m=new Set),m.add(u)}function v(d,u){const m=b.get(d);if(!m)return!1;const w=m.delete(u);return m.size===0&&b.delete(d),w}function f(d,u,m){const w={error:m,object:e,event:d,listener:u};if(i==null||i(w),e===_&&d==="error")throw new Fn("Error in a global error listener.",m,e,d,u);_.emit("error",w)}function S(d,u){$(d),ve(u),g("on",{object:e,event:d,listener:u}),c(d,u);let m=!0;return()=>m?(m=!1,v(d,u)):!1}function x(d,u){$(d),ve(u);const m=S(d,(...w)=>{m(),u(...w)});return m}function y(d,u){return $(d),ve(u),g("off",{object:e,event:d,listener:u}),v(d,u)}function T(d){var u;return $(d),(((u=b.get(d))==null?void 0:u.size)??0)>0}function L(d,...u){$(d);const m=b.get(d)||E;if(g("emit",{object:e,listeners:[...m],event:d,args:u}),m.size!==0)for(const w of m)try{w(...u)}catch(C){if(f(d,w,C),t)throw C}}async function O(d,...u){$(d);const m=b.get(d)||E;if(g("emitAsync",{object:e,listeners:[...m],event:d,args:u}),m.size===0)return;const w=[...m].map(async C=>{try{await C(...u)}catch(Be){if(f(d,C,Be),t)throw Be}});await(t?Promise.all(w):Promise.allSettled(w))}},_=_n;_(_);function Bn(e){return!Qe(e)&&!le(e)?!1:typeof e.on=="function"}function Xe(e){if(Bn(e))return e}function I(e){return typeof e=="function"}function Le(e){return typeof e=="object"&&e!==null}function Ze(e){if(!I(e))throw new TypeError("Expect a function.")}function he(e){if(e.trim()==="")throw new TypeError("Expect watch path to be a non-empty string.");const n=e.split(".");for(const t of n)if(t.trim()==="")throw new TypeError("Expect watch path segments to be non-empty.");return e.split(".").map(t=>t.trim()).filter(t=>t!=="")}function $n(e,n){const t=he(n);if(t.length===0)return;let a=e;for(const s of t){if(!Le(a)||!(s in a))return;a=a[s]}return a}const en=(e,n,t)=>{if(Array.isArray(e))throw new TypeError("Watching arrays is not supported.");Ze(t);const a=typeof n=="string"?[n]:n;if(!Array.isArray(a))throw new TypeError("Expect properties to be a string or an array of strings.");for(const i of a){if(typeof i!="string")throw new TypeError("Expect properties to be a string or an array of strings.");he(i)}const s=()=>a.map(i=>$n(e,i)),r=[];for(const i of a){const p=he(i);let g=null;const E=()=>{const b=[],h=(c,v)=>{if(!Le(c)||v>=p.length)return;const f=p[v],S=Xe(c);if(S){const x=S.on(`set:${f}`,()=>{t(...s()),v<p.length-1&&g&&(g(),g=E())});b.push(x)}v<p.length-1&&h(c[f],v+1)};return h(e,0),()=>b.reduce((c,v)=>v()||c,!1)};g=E(),r.push(()=>g?g():!1)}return t(...s()),()=>r.reduce((i,p)=>p()||i,!1)};function Un(e,n){"watch"in e||Object.defineProperty(e,"watch",{configurable:!0,writable:!0,enumerable:!1,value(t,a){return n(typeof t=="string"?this:this,t,a)}})}function Ue(e,n){return Object.prototype.hasOwnProperty.call(e,n)}function ge(e){if(typeof e=="symbol")return!1;const n=typeof e=="number"?e:Number(e);return!Number.isInteger(n)||n<0||n>=4294967295?!1:typeof e=="number"||e===String(n)}function Jn(e){return Xe(e)?I(e.emit):!1}const nn=(e,n={})=>{const{eventful:t=_,trace:a=null,shallow:s=!1}=n;Ze(t);const r=ce.options,i=new WeakMap,p=c=>{if(s||!Le(c)||Jn(c))return c;if(i.has(c))return i.get(c);const v=nn(c,{eventful:t,trace:a,shallow:s});return i.set(c,v),v},g=c=>{if(!s){if(Array.isArray(c)){for(let v=0;v<c.length;v++)c[v]=p(c[v]);return}for(const v of Reflect.ownKeys(c))Ue(c,v)&&(c[v]=p(c[v]))}},E=c=>{const v=Array.isArray(c);g(c),Un(c,en);let f;const S=new Proxy(c,{set(x,y,T,L){const O=v&&ge(y),d=Reflect.get(x,y,L),u=Reflect.set(x,y,p(T),L);if(f&&u){const m=Reflect.get(x,y,L);if(!Object.is(d,m)){const w=O?{index:Number(y),value:m,previous:d}:{property:y,value:m,previous:d},C=a||r.trace;f.emit(`set:${String(y)}`,w),I(C)&&C(f,"set",w),f.emit("set",w)}}return u},deleteProperty(x,y){const T=v&&ge(y),L=Ue(x,y),O=L?x[y]:void 0,d=Reflect.deleteProperty(x,y);if(f&&d&&L){const u=T?{index:Number(y),previous:O}:{property:y,previous:O},m=a||r.trace;f.emit(`delete:${String(y)}`,u),I(m)&&m(f,"delete",u),f.emit("delete",u)}return d},defineProperty(x,y,T){const L=Object.getOwnPropertyDescriptor(x,y)??null,O=Object.prototype.hasOwnProperty.call(T,"value")?{...T,value:p(T.value)}:T,d=Reflect.defineProperty(x,y,O),u=v&&(y==="length"||ge(y));if(f&&!u&&d){const m={property:y,descriptor:O,previous:L},w=a||r.trace;f.emit(`define:${String(y)}`,m),I(w)&&w(f,"define",m),f.emit("define",m)}return d}});return f=I(c==null?void 0:c.emit)?S:t(S),f},b=a||r.trace;if(Array.isArray(e)){const c=E(e);return I(b)&&b(c,"new"),c}if(e!==null&&typeof e=="object"){const c=E(e);return I(b)&&b(c,"new",{object:c}),c}const h=t({get value(){return e},set value(c){if(Object.is(c,e))return;const v=e;e=c;const f={property:"value",value:e,previous:v};h.emit("set:value",f),I(b)&&b(h,"set",f),h.emit("set",f)}});return I(b)&&b(h,"new",{object:h}),h},ce=nn;ce.options={trace:null};ce.watch=en;const o=ce({apps:[],currentAppId:null,files:[],activeFileName:null,generating:!1,error:null});function A(e){return new Promise((n,t)=>{e.addEventListener("success",()=>{n(e.result)}),e.addEventListener("error",()=>{t(e.error??new Error("IndexedDB request failed"))})})}function Vn(e,n){return new Promise((t,a)=>{const s=indexedDB.open(e,n.length);s.addEventListener("upgradeneeded",r=>{const i=n.slice(r.oldVersion-1,r.newVersion??n.length-1);for(const p of i)p(s.result)}),s.addEventListener("success",()=>{t(s.result)}),s.addEventListener("blocked",()=>{a(new Error("Database opening is blocked"))}),s.addEventListener("error",()=>{a(s.error??new Error("Failed to open database"))})})}const qn="asljs-app-builder";let ee=null;async function B(){return ee!==null||(ee=await Vn(qn,[e=>{e.createObjectStore("apps",{keyPath:"id"}),e.createObjectStore("files",{keyPath:"id"}).createIndex("byAppId","appId",{unique:!1})}])),ee}async function Gn(){const n=(await B()).transaction("apps","readonly");return A(n.objectStore("apps").getAll())}async function G(e){const t=(await B()).transaction("apps","readwrite");await A(t.objectStore("apps").put(e))}async function Wn(e){const t=(await B()).transaction(["apps","files"],"readwrite");await A(t.objectStore("apps").delete(e));const a=t.objectStore("files"),s=await A(a.index("byAppId").getAllKeys(e));for(const r of s)await A(a.delete(r))}async function Kn(e){const t=(await B()).transaction("files","readonly");return A(t.objectStore("files").index("byAppId").getAll(e))}async function ye(e){const t=(await B()).transaction("files","readwrite");await A(t.objectStore("files").put(e))}async function Hn(e){const t=(await B()).transaction("files","readwrite");await A(t.objectStore("files").delete(e))}async function tn(e,n){const s=(await B()).transaction("files","readwrite").objectStore("files"),r=await A(s.index("byAppId").getAllKeys(e));for(const i of r)await A(s.delete(i));for(const i of n)await A(s.put(i))}const zn=`# observable

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
`,ot=`{
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
`,rt=`{
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
`,dt=[{type:"function",name:"listFileset",description:"List all file paths in the virtual filesystem.",parameters:{type:"object",properties:{},required:[],additionalProperties:!1},strict:!0},{type:"function",name:"readFile",description:"Read the full text content of a file.",parameters:{type:"object",properties:{path:{type:"string"}},required:["path"],additionalProperties:!1},strict:!0},{type:"function",name:"setFileContent",description:"Create or fully replace file content.",parameters:{type:"object",properties:{path:{type:"string"},content:{type:"string"}},required:["path","content"],additionalProperties:!1},strict:!0},{type:"function",name:"replaceFilePart",description:"Replace part of a file by exact search string.",parameters:{type:"object",properties:{path:{type:"string"},search:{type:"string"},replacement:{type:"string"},replaceAll:{type:"boolean"}},required:["path","search","replacement","replaceAll"],additionalProperties:!1},strict:!0},{type:"function",name:"deleteFile",description:"Delete a file from the virtual filesystem.",parameters:{type:"object",properties:{path:{type:"string"}},required:["path"],additionalProperties:!1},strict:!0},{type:"function",name:"evalInApp",description:"Evaluate JavaScript in the running app document context.",parameters:{type:"object",properties:{code:{type:"string"}},required:["code"],additionalProperties:!1},strict:!0},{type:"function",name:"getAppDiagnostics",description:"Get current runtime logs and errors from the running app.",parameters:{type:"object",properties:{},required:[],additionalProperties:!1},strict:!0},{type:"function",name:"runAppAndCollectDiagnostics",description:"Run the app and collect runtime logs and errors after startup.",parameters:{type:"object",properties:{},required:[],additionalProperties:!1},strict:!0}],pt="https://api.openai.com/v1/responses",ut=X(ot,"asljs-observable"),mt=X(rt,"asljs-eventful"),ft=X(it,"asljs-data-binding"),vt=X(lt,"asljs-components"),gt=X(ct,"asljs-dali"),sn=xt(),bt="gpt-5.3-codex",Y=20;function ht(){return sn}const yt=12;async function wt(e,n,t,a,s){var E;let r,i=e,p=Et(s==null?void 0:s.initialToolStepLimit),g=0;for(;;){if(await K(s,`Step ${g+1}: requesting assistant response...`),g>=p){if(!(await((E=s==null?void 0:s.onToolStepLimit)==null?void 0:E.call(s,{stepsCompleted:g,stepLimit:p}))??!1))throw new Error("AI exceeded maximum tool steps without completing.");p+=yt,await K(s,`Extended step limit to ${p}. Continuing...`)}const b=await fetch(pt,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${n}`},body:JSON.stringify({model:t,instructions:sn,temperature:.1,previous_response_id:r,input:i,tools:dt})});if(!b.ok){const f=await b.json().catch(()=>({})),S=St(f)??`OpenAI API error: ${b.status}`;throw new Error(S)}const h=await b.json();if(!Array.isArray(h.output))throw new Error("AI returned an unexpected response format.");const c=h.output.filter(kt);if(c.length===0){await K(s,`Completed in ${g+1} step(s). Finalizing summary...`);const f=Lt(h);return{summary:f===""?"Completed tool-based update.":f}}const v=[];for(const f of c){await K(s,`Step ${g+1}: running ${an(f)}...`);const S=await jt(f,a);v.push({type:"function_call_output",call_id:Tt(f),output:S})}await K(s,`Step ${g+1}: submitted ${v.length} tool result(s).`),r=typeof h.id=="string"?h.id:r,i=v,g+=1}}function Et(e){if(!Number.isFinite(e))return Y;const n=Math.floor(e);return n>=1?n:Y}async function K(e,n){(e==null?void 0:e.onProgress)!==void 0&&await Promise.resolve(e.onProgress(n))}function xt(){const e=`
      Latest ASLJS package versions to use:
      - asljs-eventful@${mt}
      - asljs-observable@${ut}
      - asljs-data-binding@${ft}
      - asljs-components@${vt}
      - asljs-dali@${gt}
    `,n=[H("eventful",Yn,nt),H("observable",zn,et),H("data-binding",Qn,tt),H("components",Xn,st),H("dali",Zn,at)].join(`

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
${n}
`.trim()}function H(e,n,t){return`
[${e}] README excerpt:
${Je(n,9e3)}

[${e}] exported API/types excerpt:
${Je(t,6e3)}
`.trim()}function Je(e,n){return e.length<=n?e:`${e.slice(0,n)}
... [truncated]`}function X(e,n){try{return JSON.parse(e).version??"latest"}catch{return console.warn(`Failed to parse package metadata for ${n}.`),"latest"}}function St(e){const n=e.error;return typeof(n==null?void 0:n.message)=="string"?n.message:null}async function jt(e,n){const t=an(e),a=At(e.arguments);try{switch(t){case"listFileset":{const s=await n.listFileset();return D(s)}case"readFile":{const s=await n.readFile(N(a,"path"));return D(s)}case"setFileContent":return await n.setFileContent(N(a,"path"),N(a,"content")),D("ok");case"replaceFilePart":return await n.replaceFilePart(N(a,"path"),N(a,"search"),N(a,"replacement"),It(a,"replaceAll",!1)),D("ok");case"deleteFile":return await n.deleteFile(N(a,"path")),D("ok");case"evalInApp":{const s=await n.evalInApp(N(a,"code"));return D(s)}case"getAppDiagnostics":{const s=await n.getAppDiagnostics();return D(s)}case"runAppAndCollectDiagnostics":{const s=await n.runAppAndCollectDiagnostics();return D(s)}default:return Ve(`Unknown tool: ${t}`)}}catch(s){return Ve(s instanceof Error?s.message:String(s))}}function At(e){if(e===void 0)return{};if(typeof e=="object"&&e!==null)return e;if(typeof e!="string")throw new Error("Invalid tool arguments value.");try{const n=JSON.parse(e);if(typeof n!="object"||n===null)throw new Error("Tool arguments must be a JSON object.");return n}catch{throw new Error("Invalid tool arguments JSON.")}}function kt(e){return e.type==="function_call"}function an(e){if(typeof e.name!="string"||e.name.trim()==="")throw new Error("Tool call missing function name.");return e.name}function Tt(e){if(typeof e.call_id!="string"||e.call_id.trim()==="")throw new Error("Tool call missing call_id.");return e.call_id}function Lt(e){return typeof e.output_text=="string"&&e.output_text.trim()!==""?e.output_text.trim():Array.isArray(e.output)?e.output.filter(t=>t.type==="message").flatMap(t=>t.content??[]).map(t=>t.text??"").map(t=>t.trim()).filter(t=>t!=="").join(`
`):""}function N(e,n){const t=e[n];if(typeof t!="string")throw new Error(`Tool argument "${n}" must be a string.`);return t}function It(e,n,t){const a=e[n];if(a===void 0)return t;if(typeof a!="boolean")throw new Error(`Tool argument "${n}" must be a boolean.`);return a}function D(e){return on({ok:!0,value:e})}function Ve(e){return on({ok:!1,error:e})}function on(e){try{return JSON.stringify(e)}catch{return'{"ok":false,"error":"Failed to serialize tool result."}'}}const Ie="asljs-app-builder:eval-request",rn="asljs-app-builder:eval-response",ln="asljs-app-builder:diagnostics-request",cn="asljs-app-builder:diagnostics-response",qe=`<script>
(() => {
  const REQUEST = '${Ie}';
  const RESPONSE = '${rn}';
  const DIAG_REQUEST = '${ln}';
  const DIAG_RESPONSE = '${cn}';
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
<\/script>`;function Ot(e,n,t){if(n.length===0){e.removeAttribute("srcdoc"),e.src="about:blank";return}const a=n.find(i=>i.name==="index.html")??n.find(i=>i.name.endsWith(".html"))??null;if(a===null){e.removeAttribute("srcdoc"),e.src="about:blank";return}let s=a.content;const r=n.find(i=>i.name==="style.css")??n.find(i=>i.name.endsWith(".css"))??null;r!==null&&(s=s.replace(/<link[^>]+href=["']style\.css["'][^>]*>/gi,`<style>${r.content}</style>`),s=s.replace(/<link[^>]+href=["']([^"']+\.css)["'][^>]*>/gi,`<style>${r.content}</style>`));for(const i of n){if(!i.name.endsWith(".js"))continue;const p=i.name.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");s=s.replace(new RegExp(`(<script[^>]*?)\\s+src=["']${p}["']([^>]*)><\\/script>`,"gi"),(g,E,b)=>{const h=`${String(E)} ${String(b)}`;return/type=["']module["']/i.test(h)?`<script type="module">${i.content}<\/script>`:`<script>${i.content}<\/script>`})}s=Ct(s,n),s=Rt(s,t),s=Pt(s),e.srcdoc=s}async function Ge(e,n){const t=await pn(e,Ie,{code:n},rn);if(t.ok===!0)return t.value;throw new Error(typeof t.error=="string"?t.error:"Unknown preview evaluation error.")}async function dn(e){const n=await pn(e,ln,{},cn);if(n.ok!==!0)throw new Error(typeof n.error=="string"?n.error:"Failed to read preview diagnostics.");return n.diagnostics??{logs:[],errors:[]}}async function pn(e,n,t,a){const s=e.contentWindow;if(s===null)throw new Error("Preview frame is not available.");const r=crypto.randomUUID();return new Promise((i,p)=>{const g=window.setTimeout(()=>{b(),p(new Error("Timed out waiting for app evaluation result."))},5e3),E=h=>{if(h.source!==s)return;const c=h.data;c.type!==a||c.id!==r||(b(),i(c))};function b(){window.clearTimeout(g),window.removeEventListener("message",E)}window.addEventListener("message",E),s.postMessage({type:n,id:r,...t},"*")})}function Pt(e){return e.includes(Ie)?e:e.includes("</body>")?e.replace("</body>",`${qe}</body>`):`${e}
${qe}`}function Ct(e,n){if(/type=["']importmap["']/i.test(e))return e;const t=n.find(i=>i.name==="package.json")??null,a=Nt(t==null?void 0:t.content),s=Object.fromEntries(a.map(([i,p])=>[i,`https://esm.sh/${i}@${p}?bundle`]));if(Object.keys(s).length===0)return e;const r=`<script type="importmap">${JSON.stringify({imports:s})}<\/script>`;return/<head[^>]*>/i.test(e)?e.replace(/<head[^>]*>/i,i=>`${i}
${r}`):`${r}
${e}`}function Nt(e){if(e===void 0)return We();try{const n=JSON.parse(e),t={...n.dependencies??{},...n.devDependencies??{}};return["asljs-eventful","asljs-observable","asljs-data-binding","asljs-components","asljs-dali","openai"].map(r=>[r,Dt(t[r])])}catch{return We()}}function Dt(e){if(typeof e!="string"||e.trim()==="")return"latest";const n=e.trim().replace(/^[~^<>=\s]+/,"");return n===""?"latest":n}function We(){return[["asljs-eventful","latest"],["asljs-observable","latest"],["asljs-data-binding","latest"],["asljs-components","latest"],["asljs-dali","latest"],["openai","latest"]]}function Rt(e,n){if(e.includes("__ASLJS_APP_BUILDER_HOST__"))return e;const t=`<script>window.__ASLJS_APP_BUILDER_HOST__ = ${JSON.stringify({openAiApiKey:(n==null?void 0:n.hostOpenAiApiKey)===void 0||n.hostOpenAiApiKey.trim()===""?null:n.hostOpenAiApiKey})};<\/script>`;return e.includes("</head>")?e.replace("</head>",`${t}</head>`):e.includes("<body")?e.replace(/<body[^>]*>/i,a=>`${a}
${t}`):`${t}
${e}`}function j(){return crypto.randomUUID()}function k(){return new Date().toISOString()}function l(e){const n=document.getElementById(e);if(n===null)throw new Error(`Missing element #${e}`);return n}const Mt=l("app-workspace"),Ft=l("first-app-setup"),Oe=l("first-api-key-input"),J=l("first-app-name-input"),_t=l("btn-create-first-app"),Bt=l("btn-create-todo-sample"),Pe=l("panels"),Ke=l("panel-chat"),He=l("panel-editor"),R=l("app-select"),P=l("file-select"),te=l("file-content"),z=l("chat-messages"),ze=l("chat-progress"),we=l("chat-input"),Ee=l("btn-generate"),$t=l("btn-run"),Ut=l("btn-refresh-preview"),V=l("preview-frame"),Jt=l("btn-new-app"),Vt=l("btn-import"),qt=l("btn-project-settings"),Gt=l("btn-export"),Wt=l("btn-settings"),Kt=l("btn-agent-instructions"),xe=l("btn-toggle-chat"),Se=l("btn-toggle-files"),se=l("settings-modal"),Ht=l("btn-close-settings"),zt=l("btn-save-settings"),Yt=l("btn-cancel-settings"),je=l("api-key-input"),un=l("model-select"),mn=l("theme-select"),fn=l("font-size-input"),vn=l("max-tool-steps-input"),Q=l("name-modal"),Qt=l("name-modal-title"),ne=l("app-name-input"),de=l("btn-confirm-name"),Xt=l("btn-cancel-name"),Zt=l("btn-close-name-modal"),ae=l("project-settings-modal"),U=l("project-name-input"),es=l("btn-save-project-settings"),ns=l("btn-delete-project"),ts=l("btn-close-project-settings"),ss=l("btn-close-project-settings-x"),oe=l("import-file"),re=l("agent-instructions-modal"),Ae=l("agent-instructions-text"),as=l("btn-close-agent-instructions"),os=l("btn-close-agent-instructions-2"),rs=l("btn-copy-agent-instructions"),gn="asljs-app-builder-settings",bn="light",ke=14,hn="__new__",yn="__import__";function M(){try{const e=localStorage.getItem(gn)??"{}";return JSON.parse(e)}catch{return{}}}function Ce(e){localStorage.setItem(gn,JSON.stringify(e))}function pe(){return M().apiKey??""}function wn(){const e=M().model;return e==="gpt-5.3-codex"||e==="gpt-5.4"?e:bt}function En(){const e=M().maxToolSteps;if(!Number.isFinite(e))return Y;const n=Math.floor(e);return n<1?Y:n}function xn(){return M().theme==="light"?"light":bn}function Sn(){const e=M().fontSize;if(!Number.isFinite(e))return ke;const n=Math.floor(e);return n<12||n>20?ke:n}function jn(){document.body.dataset.theme=xn(),document.documentElement.style.fontSize=`${Sn()}px`}function is(){if(o.currentAppId===null)throw new Error("No active app. Create or open an app first.");return o.currentAppId}function Te(e){const n=e.trim().replace(/\\/g,"/").replace(/^\.\//,"").replace(/^\/+/,"");if(n==="")throw new Error("Path cannot be empty.");if(n.includes(".."))throw new Error("Parent path segments are not allowed.");return n}function ue(e){const n=Te(e),t=o.files.find(a=>Te(a.name).toLowerCase()===n.toLowerCase());return(t==null?void 0:t.name)??null}async function An(){return[...o.files].map(e=>e.name).sort((e,n)=>e.localeCompare(n))}async function Ne(e){const n=ue(e),t=n===null?void 0:o.files.find(a=>a.name===n);if(t===void 0)throw new Error(`File not found: ${e}`);return t.content}async function De(e,n){const t=is(),a=Te(e),s=ue(a),r=o.files.find(p=>p.name===(s??a));if(r!==void 0){const p={...r,content:n};await ye(p),o.files=o.files.map(g=>g.id===p.id?p:g),o.activeFileName=p.name;return}const i={id:j(),appId:t,name:a,content:n};await ye(i),o.files=[...o.files,i],o.activeFileName=i.name}async function kn(e){var s;const n=ue(e),t=n===null?void 0:o.files.find(r=>r.name===n);if(t===void 0)return;await Hn(t.id);const a=o.files.filter(r=>r.id!==t.id);o.files=a,o.activeFileName===e&&(o.activeFileName=((s=a[0])==null?void 0:s.name)??null)}async function Tn(e,n,t,a=!1){if(n==="")throw new Error("Search text cannot be empty.");const s=ue(e);if(s===null)throw new Error(`File not found: ${e}`);const r=await Ne(s);if(!r.includes(n))throw new Error(`Search text not found in ${s}.`);let i=r;if(a)i=r.split(n).join(t);else{const p=r.indexOf(n);if(r.indexOf(n,p+n.length)!==-1)throw new Error("Search text is ambiguous. Use replaceAll=true or provide a more specific search block.");i=r.slice(0,p)+t+r.slice(p+n.length)}await De(s,i)}async function Ln(e){if(o.files.length===0)throw new Error("No files available to run.");q();try{return await Ge(V,e)}catch{return q(),Ge(V,e)}}async function In(){return dn(V)}async function On(){return q(),await ls(350),dn(V)}function ls(e){return new Promise(n=>{window.setTimeout(n,e)})}function ie(){R.replaceChildren();const e=[...o.apps].sort((a,s)=>s.updatedAt.localeCompare(a.updatedAt));for(const a of e){const s=document.createElement("option");s.value=a.id,s.textContent=a.name,R.appendChild(s)}if(e.length>0){const a=document.createElement("option");a.value="__separator__",a.textContent="────────",a.disabled=!0,R.appendChild(a)}const n=document.createElement("option");n.value=hn,n.textContent="New...",R.appendChild(n);const t=document.createElement("option");t.value=yn,t.textContent="Import...",R.appendChild(t),o.currentAppId!==null&&(R.value=o.currentAppId)}function Pn(){Mt.classList.remove("hidden");const e=o.currentAppId!==null&&o.apps.some(n=>n.id===o.currentAppId);if(Ft.classList.toggle("hidden",e),Pe.classList.toggle("hidden",!e),!e){Oe.value=pe(),J.value="";return}Re(),Me()}async function Cn(){const e=J.value.trim();if(e===""){J.focus();return}const n=Oe.value.trim();if(n!==""){const a=M();a.apiKey=n,Ce(a)}const t={id:j(),name:e,createdAt:k(),updatedAt:k()};await G(t),o.apps=[...o.apps,t],await W(t.id)}async function cs(){const e=J.value.trim(),n=e===""?"TODO Sample":e,t=Oe.value.trim();if(t!==""){const i=M();i.apiKey=t,Ce(i)}const a=j(),s={id:a,name:n,createdAt:k(),updatedAt:k()},r=ds(a);await G(s),await tn(a,r),o.apps=[...o.apps,s],await W(a)}function ds(e){return[{id:j(),appId:e,name:"index.html",content:`<!doctype html>
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
</html>`},{id:j(),appId:e,name:"style.css",content:`:root {
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
}`},{id:j(),appId:e,name:"app.js",content:`const form = document.getElementById('todo-form');
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

render();`},{id:j(),appId:e,name:"package.json",content:`{
  "name": "todo-sample",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "start": "echo "Open index.html in a browser""
  }
}`},{id:j(),appId:e,name:"README.md",content:`# TODO Sample

Simple TODO sample application.

## Usage

Open index.html and add items using the input.

## Behavior

- Add TODO item on submit.
- Active TODO items show Check and Bin actions.
- Clicking Check moves an item immediately to Done.
- Each item has a bin icon to delete it.
`}]}function Re(){if(P.replaceChildren(),o.files.length===0){const n=document.createElement("option");n.value="",n.textContent="No files",P.appendChild(n),P.value="",P.disabled=!0;return}for(const n of o.files){const t=document.createElement("option");t.value=n.name,t.textContent=n.name,P.appendChild(t)}const e=o.activeFileName??o.files[0].name;P.value=e,P.disabled=!1}function Me(){const e=o.files.find(n=>n.name===o.activeFileName);te.value=(e==null?void 0:e.content)??"",te.disabled=e===void 0}function Ye(e){o.generating=e,Ee.disabled=e,Ee.innerHTML=e?'<span class="spinner"></span> Sending…':"Send"}function be(e,n){ze.textContent=e,ze.classList.toggle("hidden",!n)}function F(e,n){const t=document.createElement("div");t.className=`chat-msg ${e}`;const a=document.createElement("div");a.className="chat-msg-role",a.textContent=e==="user"?"You":"Assistant";const s=document.createElement("div");s.className="chat-bubble",s.textContent=n,t.appendChild(a),t.appendChild(s),z.appendChild(t),z.scrollTop=z.scrollHeight}async function me(){if(o.activeFileName===null||o.currentAppId===null)return;const e=o.files.find(t=>t.name===o.activeFileName);if(e===void 0)return;const n=te.value;e.content!==n&&(e.content=n,await ye(e))}async function W(e){var t;o.currentAppId=e;const n=await Kn(e);o.files=n,o.activeFileName=((t=n[0])==null?void 0:t.name)??null,z.replaceChildren()}function Nn(){Qt.textContent="New App",ne.value="",Q.classList.remove("hidden"),ne.focus(),de.onclick=async()=>{const e=ne.value.trim();if(e==="")return;Q.classList.add("hidden");const n={id:j(),name:e,createdAt:k(),updatedAt:k()};await G(n),o.apps=[...o.apps,n],await W(n.id)}}function Fe(){Q.classList.add("hidden"),de.onclick=null}function ps(){const e=o.apps.find(n=>n.id===o.currentAppId);e!==void 0&&(U.value=e.name,ae.classList.remove("hidden"),U.focus(),U.select())}function Z(){ae.classList.add("hidden")}async function Dn(){const e=o.apps.find(a=>a.id===o.currentAppId);if(e===void 0)return;const n=U.value.trim();if(n===""){U.focus();return}const t={...e,name:n,updatedAt:k()};await G(t),o.apps=o.apps.map(a=>a.id===e.id?t:a),Z()}async function us(){Z(),await ms()}async function ms(){const e=o.apps.find(n=>n.id===o.currentAppId);e!==void 0&&confirm(`Delete "${e.name}"? This cannot be undone.`)&&(await Wn(e.id),o.apps=o.apps.filter(n=>n.id!==e.id),o.currentAppId=null,o.files=[],o.activeFileName=null,z.replaceChildren(),V.src="about:blank")}async function Rn(){const e=we.value.trim();if(e==="")return;const n=pe();if(n===""){F("assistant","No OpenAI API key set. Open Settings (⚙) to add your key. Generation is optional — you can also create files manually.");return}if(o.currentAppId===null){F("assistant","Please create or open an app first.");return}we.value="",F("user",e),Ye(!0),be("Starting generation...",!0);try{const t=wn(),a=En(),s=await wt(e,n,t,{listFileset:An,readFile:Ne,setFileContent:De,replaceFilePart:Tn,deleteFile:kn,evalInApp:Ln,getAppDiagnostics:In,runAppAndCollectDiagnostics:On},{initialToolStepLimit:a,onToolStepLimit:async({stepsCompleted:i})=>confirm(`AI reached ${i} tool steps without finishing. Continue for 12 more steps?`),onProgress:i=>{be(i,!0)}}),r=o.apps.find(i=>i.id===o.currentAppId);if(r!==void 0){const i={...r,updatedAt:k()};await G(i),o.apps=o.apps.map(p=>p.id===r.id?i:p)}F("assistant",s.summary),q()}catch(t){const a=t instanceof Error?t.message:String(t);F("assistant",`Error: ${a}`)}finally{be("",!1),Ye(!1)}}function q(){me().then(()=>{Ot(V,o.files,{hostOpenAiApiKey:pe()})})}async function fs(){const e=o.apps.find(r=>r.id===o.currentAppId);if(e===void 0)return;await me();const n={app:e,files:o.files,exportedAt:k()},t=new Blob([JSON.stringify(n,null,2)],{type:"application/json"}),a=URL.createObjectURL(t),s=document.createElement("a");s.href=a,s.download=`${e.name.replace(/\s+/g,"-")}.json`,s.click(),URL.revokeObjectURL(a)}function Mn(){oe.value="",oe.click()}async function vs(){var n;const e=(n=oe.files)==null?void 0:n[0];if(e!==void 0)try{const t=await e.text(),a=JSON.parse(t);if(a.app===void 0||typeof a.app.name!="string"||!Array.isArray(a.files))throw new Error("Invalid app JSON format.");const s=j(),r={id:s,name:`${a.app.name} (imported)`,createdAt:a.app.createdAt??k(),updatedAt:k()},i=a.files.filter(p=>typeof p.name=="string"&&typeof p.content=="string").map(p=>({id:j(),appId:s,name:p.name,content:p.content}));await G(r),await tn(s,i),o.apps=[...o.apps,r],await W(s)}catch(t){const a=t instanceof Error?t.message:String(t);alert(`Import failed: ${a}`)}}function gs(){je.value=pe(),un.value=wn(),mn.value=xn(),fn.value=String(Sn()),vn.value=String(En()),se.classList.remove("hidden"),je.focus()}function fe(){se.classList.add("hidden")}function bs(){const e=M();e.apiKey=je.value.trim(),e.model=un.value==="gpt-5.4"?"gpt-5.4":"gpt-5.3-codex",e.theme=mn.value==="light"?"light":bn;const n=Number.parseInt(fn.value,10);e.fontSize=Number.isFinite(n)&&n>=12&&n<=20?n:ke;const t=Number.parseInt(vn.value,10);e.maxToolSteps=Number.isFinite(t)&&t>=1?t:Y,Ce(e),jn(),fe()}function hs(){Ae.value=ht(),re.classList.remove("hidden"),Ae.scrollTop=0}function _e(){re.classList.add("hidden")}function ys(){const e=!Ke.classList.contains("collapsed");xe.textContent=e?"Chat ▸":"Chat ▾",xe.setAttribute("aria-expanded",e?"false":"true"),Ke.classList.toggle("collapsed",e),Pe.classList.toggle("chat-collapsed",e)}function ws(){const e=!He.classList.contains("collapsed");Se.textContent=e?"Files ▸":"Files ▾",Se.setAttribute("aria-expanded",e?"false":"true"),He.classList.toggle("collapsed",e),Pe.classList.toggle("files-collapsed",e)}async function Es(){const e=Ae.value;try{await navigator.clipboard.writeText(e),F("assistant","Agent instructions copied to clipboard.")}catch{F("assistant","Could not copy to clipboard automatically. You can still select and copy from the instructions modal.")}}o.on("set:apps",()=>ie());o.on("set:currentAppId",()=>{ie(),Pn()});o.on("set:files",()=>{Re(),Me()});o.on("set:activeFileName",()=>{Re(),Me()});Jt.addEventListener("click",Nn);Vt.addEventListener("click",Mn);qt.addEventListener("click",ps);Gt.addEventListener("click",()=>{fs()});Ee.addEventListener("click",()=>{Rn()});$t.addEventListener("click",q);Ut.addEventListener("click",q);Wt.addEventListener("click",gs);Kt.addEventListener("click",hs);xe.addEventListener("click",ys);Se.addEventListener("click",ws);Ht.addEventListener("click",fe);zt.addEventListener("click",bs);Yt.addEventListener("click",fe);se.addEventListener("click",e=>{e.target===se&&fe()});as.addEventListener("click",_e);os.addEventListener("click",_e);rs.addEventListener("click",()=>{Es()});re.addEventListener("click",e=>{e.target===re&&_e()});de.addEventListener("click",()=>{});Xt.addEventListener("click",Fe);Zt.addEventListener("click",Fe);Q.addEventListener("click",e=>{e.target===Q&&Fe()});es.addEventListener("click",()=>{Dn()});ns.addEventListener("click",()=>{us()});ts.addEventListener("click",Z);ss.addEventListener("click",Z);ae.addEventListener("click",e=>{e.target===ae&&Z()});ne.addEventListener("keydown",e=>{e.key==="Enter"&&de.click()});U.addEventListener("keydown",e=>{e.key==="Enter"&&(e.preventDefault(),Dn())});_t.addEventListener("click",()=>{Cn()});Bt.addEventListener("click",()=>{cs()});J.addEventListener("keydown",e=>{e.key==="Enter"&&(e.preventDefault(),Cn())});we.addEventListener("keydown",e=>{e.key==="Enter"&&!e.shiftKey&&(e.preventDefault(),Rn())});R.addEventListener("change",()=>{const e=R.value;if(e===hn){Nn(),ie();return}if(e===yn){Mn(),ie();return}e!==""&&e!==o.currentAppId&&W(e)});P.addEventListener("change",()=>{const e=P.value;e===""||e===o.activeFileName||(me(),o.activeFileName=e)});te.addEventListener("blur",()=>{me()});oe.addEventListener("change",()=>{vs()});window.listFileset=An;window.readFile=Ne;window.setFileContent=De;window.replaceFilePart=Tn;window.deleteFile=kn;window.evalInApp=Ln;window.getAppDiagnostics=In;window.runAppAndCollectDiagnostics=On;async function xs(){jn();const e=await Gn();if(o.apps=e,e.length>0){const n=[...e].sort((t,a)=>a.updatedAt.localeCompare(t.updatedAt));await W(n[0].id)}else o.currentAppId=null,o.files=[],o.activeFileName=null,Pn(),J.focus()}xs().catch(e=>{console.error("App Builder init failed:",e)});
