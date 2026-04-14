(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))s(a);new MutationObserver(a=>{for(const o of a)if(o.type==="childList")for(const i of o.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&s(i)}).observe(document,{childList:!0,subtree:!0});function t(a){const o={};return a.integrity&&(o.integrity=a.integrity),a.referrerPolicy&&(o.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?o.credentials="include":a.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function s(a){if(a.ep)return;a.ep=!0;const o=t(a);fetch(a.href,o)}})();class on extends Error{constructor(n,t,s,a,o){super(n),this.name="ListenerError",this.error=t,this.object=s,this.event=a,this.listener=o}}function D(e){if(typeof e!="string"&&typeof e!="symbol")throw new TypeError("Expect event to be a string or symbol.")}function Z(e){return typeof e=="function"}function Se(e){if(Z(e))return e}function De(e){return typeof e=="object"&&e!==null}function ie(e){if(!Z(e))throw new TypeError("Expect a function.")}const ln=(e=Object.create(null),n={})=>{if(!De(e)&&!Z(e))throw new TypeError("Expect an object or a function.");for(const l of["on","once","off","emit","emitAsync","has"])if(l in e)throw new Error(`Method "${l}" already exists.`);const{strict:t=!1,trace:s=null,error:a=null}=n,o=Se(s)??null,i=Se(a)??null,f=e!==R,y=(l,d)=>{o==null||o(l,d),f&&R.emit(l,d)};y("new",{object:e});const x=new Set,b=new Map,h={enumerable:!1,configurable:!0,writable:!0};return Object.defineProperties(e,{on:Object.assign({value:j},h),once:Object.assign({value:E},h),off:Object.assign({value:g},h),emit:Object.assign({value:k},h),emitAsync:Object.assign({value:T},h),has:Object.assign({value:A},h)}),e;function c(l,d){let u=b.get(l);u||b.set(l,u=new Set),u.add(d)}function v(l,d){const u=b.get(l);if(!u)return!1;const w=u.delete(d);return u.size===0&&b.delete(l),w}function m(l,d,u){const w={error:u,object:e,event:l,listener:d};if(i==null||i(w),e===R&&l==="error")throw new on("Error in a global error listener.",u,e,l,d);R.emit("error",w)}function j(l,d){D(l),ie(d),y("on",{object:e,event:l,listener:d}),c(l,d);let u=!0;return()=>u?(u=!1,v(l,d)):!1}function E(l,d){D(l),ie(d);const u=j(l,(...w)=>{u(),d(...w)});return u}function g(l,d){return D(l),ie(d),y("off",{object:e,event:l,listener:d}),v(l,d)}function A(l){var d;return D(l),(((d=b.get(l))==null?void 0:d.size)??0)>0}function k(l,...d){D(l);const u=b.get(l)||x;if(y("emit",{object:e,listeners:[...u],event:l,args:d}),u.size!==0)for(const w of u)try{w(...d)}catch(I){if(m(l,w,I),t)throw I}}async function T(l,...d){D(l);const u=b.get(l)||x;if(y("emitAsync",{object:e,listeners:[...u],event:l,args:d}),u.size===0)return;const w=[...u].map(async I=>{try{await I(...d)}catch(je){if(m(l,I,je),t)throw je}});await(t?Promise.all(w):Promise.allSettled(w))}},R=ln;R(R);function cn(e){return!De(e)&&!Z(e)?!1:typeof e.on=="function"}function Be(e){if(cn(e))return e}function L(e){return typeof e=="function"}function be(e){return typeof e=="object"&&e!==null}function $e(e){if(!L(e))throw new TypeError("Expect a function.")}function ce(e){if(e.trim()==="")throw new TypeError("Expect watch path to be a non-empty string.");const n=e.split(".");for(const t of n)if(t.trim()==="")throw new TypeError("Expect watch path segments to be non-empty.");return e.split(".").map(t=>t.trim()).filter(t=>t!=="")}function dn(e,n){const t=ce(n);if(t.length===0)return;let s=e;for(const a of t){if(!be(s)||!(a in s))return;s=s[a]}return s}const Ue=(e,n,t)=>{if(Array.isArray(e))throw new TypeError("Watching arrays is not supported.");$e(t);const s=typeof n=="string"?[n]:n;if(!Array.isArray(s))throw new TypeError("Expect properties to be a string or an array of strings.");for(const i of s){if(typeof i!="string")throw new TypeError("Expect properties to be a string or an array of strings.");ce(i)}const a=()=>s.map(i=>dn(e,i)),o=[];for(const i of s){const f=ce(i);let y=null;const x=()=>{const b=[],h=(c,v)=>{if(!be(c)||v>=f.length)return;const m=f[v],j=Be(c);if(j){const E=j.on(`set:${m}`,()=>{t(...a()),v<f.length-1&&y&&(y(),y=x())});b.push(E)}v<f.length-1&&h(c[m],v+1)};return h(e,0),()=>b.reduce((c,v)=>v()||c,!1)};y=x(),o.push(()=>y?y():!1)}return t(...a()),()=>o.reduce((i,f)=>f()||i,!1)};function pn(e,n){"watch"in e||Object.defineProperty(e,"watch",{configurable:!0,writable:!0,enumerable:!1,value(t,s){return n(typeof t=="string"?this:this,t,s)}})}function Ae(e,n){return Object.prototype.hasOwnProperty.call(e,n)}function le(e){if(typeof e=="symbol")return!1;const n=typeof e=="number"?e:Number(e);return!Number.isInteger(n)||n<0||n>=4294967295?!1:typeof e=="number"||e===String(n)}function un(e){return Be(e)?L(e.emit):!1}const _e=(e,n={})=>{const{eventful:t=R,trace:s=null,shallow:a=!1}=n;$e(t);const o=ee.options,i=new WeakMap,f=c=>{if(a||!be(c)||un(c))return c;if(i.has(c))return i.get(c);const v=_e(c,{eventful:t,trace:s,shallow:a});return i.set(c,v),v},y=c=>{if(!a){if(Array.isArray(c)){for(let v=0;v<c.length;v++)c[v]=f(c[v]);return}for(const v of Reflect.ownKeys(c))Ae(c,v)&&(c[v]=f(c[v]))}},x=c=>{const v=Array.isArray(c);y(c),pn(c,Ue);let m;const j=new Proxy(c,{set(E,g,A,k){const T=v&&le(g),l=Reflect.get(E,g,k),d=Reflect.set(E,g,f(A),k);if(m&&d){const u=Reflect.get(E,g,k);if(!Object.is(l,u)){const w=T?{index:Number(g),value:u,previous:l}:{property:g,value:u,previous:l},I=s||o.trace;m.emit(`set:${String(g)}`,w),L(I)&&I(m,"set",w),m.emit("set",w)}}return d},deleteProperty(E,g){const A=v&&le(g),k=Ae(E,g),T=k?E[g]:void 0,l=Reflect.deleteProperty(E,g);if(m&&l&&k){const d=A?{index:Number(g),previous:T}:{property:g,previous:T},u=s||o.trace;m.emit(`delete:${String(g)}`,d),L(u)&&u(m,"delete",d),m.emit("delete",d)}return l},defineProperty(E,g,A){const k=Object.getOwnPropertyDescriptor(E,g)??null,T=Object.prototype.hasOwnProperty.call(A,"value")?{...A,value:f(A.value)}:A,l=Reflect.defineProperty(E,g,T),d=v&&(g==="length"||le(g));if(m&&!d&&l){const u={property:g,descriptor:T,previous:k},w=s||o.trace;m.emit(`define:${String(g)}`,u),L(w)&&w(m,"define",u),m.emit("define",u)}return l}});return m=L(c==null?void 0:c.emit)?j:t(j),m},b=s||o.trace;if(Array.isArray(e)){const c=x(e);return L(b)&&b(c,"new"),c}if(e!==null&&typeof e=="object"){const c=x(e);return L(b)&&b(c,"new",{object:c}),c}const h=t({get value(){return e},set value(c){if(Object.is(c,e))return;const v=e;e=c;const m={property:"value",value:e,previous:v};h.emit("set:value",m),L(b)&&b(h,"set",m),h.emit("set",m)}});return L(b)&&b(h,"new",{object:h}),h},ee=_e;ee.options={trace:null};ee.watch=Ue;const r=ee({apps:[],currentAppId:null,files:[],activeFileName:null,generating:!1,error:null});function S(e){return new Promise((n,t)=>{e.addEventListener("success",()=>{n(e.result)}),e.addEventListener("error",()=>{t(e.error??new Error("IndexedDB request failed"))})})}function fn(e,n){return new Promise((t,s)=>{const a=indexedDB.open(e,n.length);a.addEventListener("upgradeneeded",o=>{const i=n.slice(o.oldVersion-1,o.newVersion??n.length-1);for(const f of i)f(a.result)}),a.addEventListener("success",()=>{t(a.result)}),a.addEventListener("blocked",()=>{s(new Error("Database opening is blocked"))}),a.addEventListener("error",()=>{s(a.error??new Error("Failed to open database"))})})}const mn="asljs-app-builder";let G=null;async function M(){return G!==null||(G=await fn(mn,[e=>{e.createObjectStore("apps",{keyPath:"id"}),e.createObjectStore("files",{keyPath:"id"}).createIndex("byAppId","appId",{unique:!1})}])),G}async function bn(){const n=(await M()).transaction("apps","readonly");return S(n.objectStore("apps").getAll())}async function ne(e){const t=(await M()).transaction("apps","readwrite");await S(t.objectStore("apps").put(e))}async function vn(e){const t=(await M()).transaction(["apps","files"],"readwrite");await S(t.objectStore("apps").delete(e));const s=t.objectStore("files"),a=await S(s.index("byAppId").getAllKeys(e));for(const o of a)await S(s.delete(o))}async function hn(e){const t=(await M()).transaction("files","readonly");return S(t.objectStore("files").index("byAppId").getAll(e))}async function de(e){const t=(await M()).transaction("files","readwrite");await S(t.objectStore("files").put(e))}async function gn(e){const t=(await M()).transaction("files","readwrite");await S(t.objectStore("files").delete(e))}async function yn(e,n){const a=(await M()).transaction("files","readwrite").objectStore("files"),o=await S(a.index("byAppId").getAllKeys(e));for(const i of o)await S(a.delete(i));for(const i of n)await S(a.put(i))}const wn=`# observable

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
`,xn=`# eventful

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
`,En=`# data-binding

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
`,jn=`# components

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
`,Sn=`# dali

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
`,An=`export {
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
`,kn=`export {
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
`,Ln=`export {
    bindDataModel
  } from './bind-data-model.js';

export {
    createBuiltInPipes
  } from './pipes.js';

export type {
    BindDataModelOptions,
    DataModel,
  } from './types.js';
`,Tn=`export {
    List,
    type ListItem,
    type ListItemsSource,
    type ListRowContext,
  } from './list.js';
`,In=`export {
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
`,Nn=`{
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
`,Pn=`{
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
`,Rn=`{
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
`,Cn=`{
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
`,Fn=[{type:"function",name:"listFileset",description:"List all file paths in the virtual filesystem.",parameters:{type:"object",properties:{},required:[],additionalProperties:!1},strict:!0},{type:"function",name:"readFile",description:"Read the full text content of a file.",parameters:{type:"object",properties:{path:{type:"string"}},required:["path"],additionalProperties:!1},strict:!0},{type:"function",name:"setFileContent",description:"Create or fully replace file content.",parameters:{type:"object",properties:{path:{type:"string"},content:{type:"string"}},required:["path","content"],additionalProperties:!1},strict:!0},{type:"function",name:"replaceFilePart",description:"Replace part of a file by exact search string.",parameters:{type:"object",properties:{path:{type:"string"},search:{type:"string"},replacement:{type:"string"},replaceAll:{type:"boolean"}},required:["path","search","replacement","replaceAll"],additionalProperties:!1},strict:!0},{type:"function",name:"deleteFile",description:"Delete a file from the virtual filesystem.",parameters:{type:"object",properties:{path:{type:"string"}},required:["path"],additionalProperties:!1},strict:!0},{type:"function",name:"evalInApp",description:"Evaluate JavaScript in the running app document context.",parameters:{type:"object",properties:{code:{type:"string"}},required:["code"],additionalProperties:!1},strict:!0}],Mn="https://api.openai.com/v1/responses",Dn=W(On,"asljs-observable"),Bn=W(Nn,"asljs-eventful"),$n=W(Pn,"asljs-data-binding"),Un=W(Rn,"asljs-components"),_n=W(Cn,"asljs-dali"),Je=Hn(),Jn="gpt-5.3-codex",J=20;function Vn(){return Je}const Wn=12;async function qn(e,n,t,s,a){var x;let o,i=e,f=Gn(a==null?void 0:a.initialToolStepLimit),y=0;for(;;){if(y>=f){if(!(await((x=a==null?void 0:a.onToolStepLimit)==null?void 0:x.call(a,{stepsCompleted:y,stepLimit:f}))??!1))throw new Error("AI exceeded maximum tool steps without completing.");f+=Wn}const b=await fetch(Mn,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${n}`},body:JSON.stringify({model:t,instructions:Je,temperature:.1,previous_response_id:o,input:i,tools:Fn})});if(!b.ok){const m=await b.json().catch(()=>({})),j=Kn(m)??`OpenAI API error: ${b.status}`;throw new Error(j)}const h=await b.json();if(!Array.isArray(h.output))throw new Error("AI returned an unexpected response format.");const c=h.output.filter(Qn);if(c.length===0){const m=et(h);return{summary:m===""?"Completed tool-based update.":m}}const v=[];for(const m of c){const j=await zn(m,s);v.push({type:"function_call_output",call_id:Zn(m),output:j})}o=typeof h.id=="string"?h.id:o,i=v,y+=1}}function Gn(e){if(!Number.isFinite(e))return J;const n=Math.floor(e);return n>=1?n:J}function Hn(){const e=`
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
... [truncated]`}function W(e,n){try{return JSON.parse(e).version??"latest"}catch{return console.warn(`Failed to parse package metadata for ${n}.`),"latest"}}function Kn(e){const n=e.error;return typeof(n==null?void 0:n.message)=="string"?n.message:null}async function zn(e,n){const t=Xn(e),s=Yn(e.arguments);try{switch(t){case"listFileset":{const a=await n.listFileset();return B(a)}case"readFile":{const a=await n.readFile(O(s,"path"));return B(a)}case"setFileContent":return await n.setFileContent(O(s,"path"),O(s,"content")),B("ok");case"replaceFilePart":return await n.replaceFilePart(O(s,"path"),O(s,"search"),O(s,"replacement"),nt(s,"replaceAll",!1)),B("ok");case"deleteFile":return await n.deleteFile(O(s,"path")),B("ok");case"evalInApp":{const a=await n.evalInApp(O(s,"code"));return B(a)}default:return Le(`Unknown tool: ${t}`)}}catch(a){return Le(a instanceof Error?a.message:String(a))}}function Yn(e){if(e===void 0)return{};if(typeof e=="object"&&e!==null)return e;if(typeof e!="string")throw new Error("Invalid tool arguments value.");try{const n=JSON.parse(e);if(typeof n!="object"||n===null)throw new Error("Tool arguments must be a JSON object.");return n}catch{throw new Error("Invalid tool arguments JSON.")}}function Qn(e){return e.type==="function_call"}function Xn(e){if(typeof e.name!="string"||e.name.trim()==="")throw new Error("Tool call missing function name.");return e.name}function Zn(e){if(typeof e.call_id!="string"||e.call_id.trim()==="")throw new Error("Tool call missing call_id.");return e.call_id}function et(e){return typeof e.output_text=="string"&&e.output_text.trim()!==""?e.output_text.trim():Array.isArray(e.output)?e.output.filter(t=>t.type==="message").flatMap(t=>t.content??[]).map(t=>t.text??"").map(t=>t.trim()).filter(t=>t!=="").join(`
`):""}function O(e,n){const t=e[n];if(typeof t!="string")throw new Error(`Tool argument "${n}" must be a string.`);return t}function nt(e,n,t){const s=e[n];if(s===void 0)return t;if(typeof s!="boolean")throw new Error(`Tool argument "${n}" must be a boolean.`);return s}function B(e){return Ve({ok:!0,value:e})}function Le(e){return Ve({ok:!1,error:e})}function Ve(e){try{return JSON.stringify(e)}catch{return'{"ok":false,"error":"Failed to serialize tool result."}'}}let U=null;const ve="asljs-app-builder:eval-request",We="asljs-app-builder:eval-response",Te=`<script>
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
<\/script>`;function tt(e,n){if(U!==null&&(URL.revokeObjectURL(U),U=null),n.length===0){e.src="about:blank";return}const t=n.find(i=>i.name==="index.html")??n.find(i=>i.name.endsWith(".html"))??null;if(t===null){e.src="about:blank";return}let s=t.content;const a=n.find(i=>i.name==="style.css")??n.find(i=>i.name.endsWith(".css"))??null;a!==null&&(s=s.replace(/<link[^>]+href=["']style\.css["'][^>]*>/gi,`<style>${a.content}</style>`),s=s.replace(/<link[^>]+href=["']([^"']+\.css)["'][^>]*>/gi,`<style>${a.content}</style>`));for(const i of n){if(!i.name.endsWith(".js"))continue;const f=i.name.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");s=s.replace(new RegExp(`(<script[^>]*?)\\s+src=["']${f}["']([^>]*)><\\/script>`,"gi"),(y,x,b)=>{const h=`${String(x)} ${String(b)}`;return/type=["']module["']/i.test(h)?`<script type="module">${i.content}<\/script>`:`<script>${i.content}<\/script>`})}s=st(s);const o=new Blob([s],{type:"text/html"});U=URL.createObjectURL(o),e.src=U}async function Ie(e,n){const t=e.contentWindow;if(t===null)throw new Error("Preview frame is not available.");const s=crypto.randomUUID();return new Promise((a,o)=>{const i=window.setTimeout(()=>{y(),o(new Error("Timed out waiting for app evaluation result."))},5e3),f=x=>{if(x.source!==t)return;const b=x.data;if(!(b.type!==We||b.id!==s)){if(y(),b.ok===!0){a(b.value);return}o(new Error(b.error??"Unknown preview evaluation error."))}};function y(){window.clearTimeout(i),window.removeEventListener("message",f)}window.addEventListener("message",f),t.postMessage({type:ve,id:s,code:n},"*")})}function st(e){return e.includes(ve)?e:e.includes("</body>")?e.replace("</body>",`${Te}</body>`):`${e}
${Te}`}function H(){return crypto.randomUUID()}function C(){return new Date().toISOString()}function p(e){const n=document.getElementById(e);if(n===null)throw new Error(`Missing element #${e}`);return n}const Oe=p("app-list"),Ne=p("empty-state"),Pe=p("app-workspace"),at=p("app-name-display"),Re=p("file-tabs"),K=p("file-content"),_=p("chat-messages"),pe=p("chat-input"),ue=p("btn-generate"),rt=p("btn-run"),ot=p("btn-refresh-preview"),z=p("preview-frame"),it=p("btn-new-app"),lt=p("btn-new-app-2"),ct=p("btn-rename"),dt=p("btn-delete-app"),pt=p("btn-export"),ut=p("btn-settings"),ft=p("btn-agent-instructions"),Y=p("settings-modal"),mt=p("btn-close-settings"),bt=p("btn-save-settings"),vt=p("btn-cancel-settings"),fe=p("api-key-input"),qe=p("model-select"),Ge=p("max-tool-steps-input"),F=p("name-modal"),He=p("name-modal-title"),N=p("app-name-input"),q=p("btn-confirm-name"),ht=p("btn-cancel-name"),gt=p("btn-close-name-modal"),Q=p("import-file"),X=p("agent-instructions-modal"),me=p("agent-instructions-text"),yt=p("btn-close-agent-instructions"),wt=p("btn-close-agent-instructions-2"),xt=p("btn-copy-agent-instructions"),Ke="asljs-app-builder-settings";function te(){try{const e=localStorage.getItem(Ke)??"{}";return JSON.parse(e)}catch{return{}}}function Et(e){localStorage.setItem(Ke,JSON.stringify(e))}function ze(){return te().apiKey??""}function Ye(){const e=te().model;return e==="gpt-5.3-codex"||e==="gpt-5.4"?e:Jn}function Qe(){const e=te().maxToolSteps;if(!Number.isFinite(e))return J;const n=Math.floor(e);return n<1?J:n}function jt(){if(r.currentAppId===null)throw new Error("No active app. Create or open an app first.");return r.currentAppId}async function Xe(){return[...r.files].map(e=>e.name).sort((e,n)=>e.localeCompare(n))}async function he(e){const n=r.files.find(t=>t.name===e);if(n===void 0)throw new Error(`File not found: ${e}`);return n.content}async function ge(e,n){const t=jt(),s=r.files.find(o=>o.name===e);if(s!==void 0){const o={...s,content:n};await de(o),r.files=r.files.map(i=>i.id===o.id?o:i),r.activeFileName=o.name;return}const a={id:H(),appId:t,name:e,content:n};await de(a),r.files=[...r.files,a],r.activeFileName=a.name}async function Ze(e){var s;const n=r.files.find(a=>a.name===e);if(n===void 0)return;await gn(n.id);const t=r.files.filter(a=>a.id!==n.id);r.files=t,r.activeFileName===e&&(r.activeFileName=((s=t[0])==null?void 0:s.name)??null)}async function en(e,n,t,s=!1){if(n==="")throw new Error("Search text cannot be empty.");const a=await he(e);if(!a.includes(n))throw new Error(`Search text not found in ${e}.`);let o=a;if(s)o=a.split(n).join(t);else{const i=a.indexOf(n);if(a.indexOf(n,i+n.length)!==-1)throw new Error("Search text is ambiguous. Use replaceAll=true or provide a more specific search block.");o=a.slice(0,i)+t+a.slice(i+n.length)}await ge(e,o)}async function nn(e){if(r.files.length===0)throw new Error("No files available to run.");V();try{return await Ie(z,e)}catch{return V(),Ie(z,e)}}function tn(){Oe.replaceChildren();const e=[...r.apps].sort((n,t)=>t.updatedAt.localeCompare(n.updatedAt));for(const n of e){const t=document.createElement("div");t.className="app-item"+(n.id===r.currentAppId?" active":""),t.dataset.id=n.id;const s=document.createElement("span");s.className="app-item-name",s.textContent=n.name,t.appendChild(s),t.addEventListener("click",()=>{ae(n.id)}),Oe.appendChild(t)}}function sn(){const e=r.apps.find(n=>n.id===r.currentAppId);if(e===void 0){Ne.classList.remove("hidden"),Pe.classList.add("hidden");return}Ne.classList.add("hidden"),Pe.classList.remove("hidden"),at.textContent=e.name,ye(),we()}function ye(){Re.replaceChildren();for(const e of r.files){const n=document.createElement("div");n.className="file-tab"+(e.name===r.activeFileName?" active":""),n.textContent=e.name,n.addEventListener("click",()=>{se(),r.activeFileName=e.name}),Re.appendChild(n)}}function we(){const e=r.files.find(n=>n.name===r.activeFileName);K.value=(e==null?void 0:e.content)??"",K.disabled=e===void 0}function Ce(e){r.generating=e,ue.disabled=e,ue.innerHTML=e?'<span class="spinner"></span> Generating…':"Generate"}function P(e,n){const t=document.createElement("div");t.className=`chat-msg ${e}`;const s=document.createElement("div");s.className="chat-msg-role",s.textContent=e==="user"?"You":"Assistant";const a=document.createElement("div");a.className="chat-bubble",a.textContent=n,t.appendChild(s),t.appendChild(a),_.appendChild(t),_.scrollTop=_.scrollHeight}async function se(){if(r.activeFileName===null||r.currentAppId===null)return;const e=r.files.find(t=>t.name===r.activeFileName);if(e===void 0)return;const n=K.value;e.content!==n&&(e.content=n,await de(e))}async function ae(e){var t;r.currentAppId=e;const n=await hn(e);r.files=n,r.activeFileName=((t=n[0])==null?void 0:t.name)??null,_.replaceChildren()}function an(){He.textContent="New App",N.value="",F.classList.remove("hidden"),N.focus(),q.onclick=async()=>{const e=N.value.trim();if(e==="")return;F.classList.add("hidden");const n={id:H(),name:e,createdAt:C(),updatedAt:C()};await ne(n),r.apps=[...r.apps,n],await ae(n.id)}}function xe(){F.classList.add("hidden"),q.onclick=null}function St(){const e=r.apps.find(n=>n.id===r.currentAppId);e!==void 0&&(He.textContent="Rename App",N.value=e.name,F.classList.remove("hidden"),N.focus(),N.select(),q.onclick=async()=>{const n=N.value.trim();if(n==="")return;F.classList.add("hidden");const t={...e,name:n,updatedAt:C()};await ne(t),r.apps=r.apps.map(s=>s.id===e.id?t:s)})}async function At(){const e=r.apps.find(n=>n.id===r.currentAppId);e!==void 0&&confirm(`Delete "${e.name}"? This cannot be undone.`)&&(await vn(e.id),r.apps=r.apps.filter(n=>n.id!==e.id),r.currentAppId=null,r.files=[],r.activeFileName=null,_.replaceChildren(),z.src="about:blank")}async function rn(){const e=pe.value.trim();if(e==="")return;const n=ze();if(n===""){P("assistant","No OpenAI API key set. Open Settings (⚙) to add your key. Generation is optional — you can also create files manually.");return}if(r.currentAppId===null){P("assistant","Please create or open an app first.");return}pe.value="",P("user",e),Ce(!0);try{const t=Ye(),s=Qe(),a=await qn(e,n,t,{listFileset:Xe,readFile:he,setFileContent:ge,replaceFilePart:en,deleteFile:Ze,evalInApp:nn},{initialToolStepLimit:s,onToolStepLimit:async({stepsCompleted:i})=>confirm(`AI reached ${i} tool steps without finishing. Continue for 12 more steps?`)}),o=r.apps.find(i=>i.id===r.currentAppId);if(o!==void 0){const i={...o,updatedAt:C()};await ne(i),r.apps=r.apps.map(f=>f.id===o.id?i:f)}P("assistant",a.summary),V()}catch(t){const s=t instanceof Error?t.message:String(t);P("assistant",`Error: ${s}`)}finally{Ce(!1)}}function V(){se().then(()=>{tt(z,r.files)})}async function kt(){const e=r.apps.find(o=>o.id===r.currentAppId);if(e===void 0)return;await se();const n={app:e,files:r.files,exportedAt:C()},t=new Blob([JSON.stringify(n,null,2)],{type:"application/json"}),s=URL.createObjectURL(t),a=document.createElement("a");a.href=s,a.download=`${e.name.replace(/\s+/g,"-")}.json`,a.click(),URL.revokeObjectURL(s)}function Lt(){Q.value="",Q.click()}async function Tt(){var n;const e=(n=Q.files)==null?void 0:n[0];if(e!==void 0)try{const t=await e.text(),s=JSON.parse(t);if(s.app===void 0||typeof s.app.name!="string"||!Array.isArray(s.files))throw new Error("Invalid app JSON format.");const a=H(),o={id:a,name:`${s.app.name} (imported)`,createdAt:s.app.createdAt??C(),updatedAt:C()},i=s.files.filter(f=>typeof f.name=="string"&&typeof f.content=="string").map(f=>({id:H(),appId:a,name:f.name,content:f.content}));await ne(o),await yn(a,i),r.apps=[...r.apps,o],await ae(a)}catch(t){const s=t instanceof Error?t.message:String(t);alert(`Import failed: ${s}`)}}function It(){fe.value=ze(),qe.value=Ye(),Ge.value=String(Qe()),Y.classList.remove("hidden"),fe.focus()}function re(){Y.classList.add("hidden")}function Ot(){const e=te();e.apiKey=fe.value.trim(),e.model=qe.value==="gpt-5.4"?"gpt-5.4":"gpt-5.3-codex";const n=Number.parseInt(Ge.value,10);e.maxToolSteps=Number.isFinite(n)&&n>=1?n:J,Et(e),re()}function Nt(){me.value=Vn(),X.classList.remove("hidden"),me.scrollTop=0}function Ee(){X.classList.add("hidden")}async function Pt(){const e=me.value;try{await navigator.clipboard.writeText(e),P("assistant","Agent instructions copied to clipboard.")}catch{P("assistant","Could not copy to clipboard automatically. You can still select and copy from the instructions modal.")}}r.on("set:apps",()=>tn());r.on("set:currentAppId",()=>{tn(),sn()});r.on("set:files",()=>{ye(),we()});r.on("set:activeFileName",()=>{ye(),we()});it.addEventListener("click",an);lt.addEventListener("click",an);ct.addEventListener("click",St);dt.addEventListener("click",()=>{At()});pt.addEventListener("click",()=>{kt()});ue.addEventListener("click",()=>{rn()});rt.addEventListener("click",V);ot.addEventListener("click",V);ut.addEventListener("click",It);ft.addEventListener("click",Nt);mt.addEventListener("click",re);bt.addEventListener("click",Ot);vt.addEventListener("click",re);Y.addEventListener("click",e=>{e.target===Y&&re()});yt.addEventListener("click",Ee);wt.addEventListener("click",Ee);xt.addEventListener("click",()=>{Pt()});X.addEventListener("click",e=>{e.target===X&&Ee()});q.addEventListener("click",()=>{});ht.addEventListener("click",xe);gt.addEventListener("click",xe);F.addEventListener("click",e=>{e.target===F&&xe()});N.addEventListener("keydown",e=>{e.key==="Enter"&&q.click()});pe.addEventListener("keydown",e=>{e.key==="Enter"&&!e.shiftKey&&(e.preventDefault(),rn())});K.addEventListener("blur",()=>{se()});Q.addEventListener("change",()=>{Tt()});const oe=document.createElement("button");oe.className="btn btn-ghost btn-full";oe.textContent="↑ Import";oe.addEventListener("click",Lt);const Fe=document.querySelector(".sidebar-footer"),Me=document.getElementById("btn-settings");Fe!==null&&Me!==null&&Fe.insertBefore(oe,Me);window.listFileset=Xe;window.readFile=he;window.setFileContent=ge;window.replaceFilePart=en;window.deleteFile=Ze;window.evalInApp=nn;async function Rt(){const e=await bn();if(r.apps=e,e.length>0){const n=[...e].sort((t,s)=>s.updatedAt.localeCompare(t.updatedAt));await ae(n[0].id)}else sn()}Rt().catch(e=>{console.error("App Builder init failed:",e)});
