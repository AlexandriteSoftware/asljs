(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))s(a);new MutationObserver(a=>{for(const r of a)if(r.type==="childList")for(const i of r.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&s(i)}).observe(document,{childList:!0,subtree:!0});function t(a){const r={};return a.integrity&&(r.integrity=a.integrity),a.referrerPolicy&&(r.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?r.credentials="include":a.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function s(a){if(a.ep)return;a.ep=!0;const r=t(a);fetch(a.href,r)}})();class on extends Error{constructor(n,t,s,a,r){super(n),this.name="ListenerError",this.error=t,this.object=s,this.event=a,this.listener=r}}function D(e){if(typeof e!="string"&&typeof e!="symbol")throw new TypeError("Expect event to be a string or symbol.")}function X(e){return typeof e=="function"}function Ee(e){if(X(e))return e}function De(e){return typeof e=="object"&&e!==null}function oe(e){if(!X(e))throw new TypeError("Expect a function.")}const ln=(e=Object.create(null),n={})=>{if(!De(e)&&!X(e))throw new TypeError("Expect an object or a function.");for(const l of["on","once","off","emit","emitAsync","has"])if(l in e)throw new Error(`Method "${l}" already exists.`);const{strict:t=!1,trace:s=null,error:a=null}=n,r=Ee(s)??null,i=Ee(a)??null,u=e!==R,g=(l,d)=>{r==null||r(l,d),u&&R.emit(l,d)};g("new",{object:e});const j=new Set,v=new Map,y={enumerable:!1,configurable:!0,writable:!0};return Object.defineProperties(e,{on:Object.assign({value:E},y),once:Object.assign({value:x},y),off:Object.assign({value:h},y),emit:Object.assign({value:k},y),emitAsync:Object.assign({value:L},y),has:Object.assign({value:A},y)}),e;function c(l,d){let f=v.get(l);f||v.set(l,f=new Set),f.add(d)}function b(l,d){const f=v.get(l);if(!f)return!1;const w=f.delete(d);return f.size===0&&v.delete(l),w}function m(l,d,f){const w={error:f,object:e,event:l,listener:d};if(i==null||i(w),e===R&&l==="error")throw new on("Error in a global error listener.",f,e,l,d);R.emit("error",w)}function E(l,d){D(l),oe(d),g("on",{object:e,event:l,listener:d}),c(l,d);let f=!0;return()=>f?(f=!1,b(l,d)):!1}function x(l,d){D(l),oe(d);const f=E(l,(...w)=>{f(),d(...w)});return f}function h(l,d){return D(l),oe(d),g("off",{object:e,event:l,listener:d}),b(l,d)}function A(l){var d;return D(l),(((d=v.get(l))==null?void 0:d.size)??0)>0}function k(l,...d){D(l);const f=v.get(l)||j;if(g("emit",{object:e,listeners:[...f],event:l,args:d}),f.size!==0)for(const w of f)try{w(...d)}catch(I){if(m(l,w,I),t)throw I}}async function L(l,...d){D(l);const f=v.get(l)||j;if(g("emitAsync",{object:e,listeners:[...f],event:l,args:d}),f.size===0)return;const w=[...f].map(async I=>{try{await I(...d)}catch(xe){if(m(l,I,xe),t)throw xe}});await(t?Promise.all(w):Promise.allSettled(w))}},R=ln;R(R);function cn(e){return!De(e)&&!X(e)?!1:typeof e.on=="function"}function Be(e){if(cn(e))return e}function T(e){return typeof e=="function"}function me(e){return typeof e=="object"&&e!==null}function $e(e){if(!T(e))throw new TypeError("Expect a function.")}function le(e){if(e.trim()==="")throw new TypeError("Expect watch path to be a non-empty string.");const n=e.split(".");for(const t of n)if(t.trim()==="")throw new TypeError("Expect watch path segments to be non-empty.");return e.split(".").map(t=>t.trim()).filter(t=>t!=="")}function dn(e,n){const t=le(n);if(t.length===0)return;let s=e;for(const a of t){if(!me(s)||!(a in s))return;s=s[a]}return s}const _e=(e,n,t)=>{if(Array.isArray(e))throw new TypeError("Watching arrays is not supported.");$e(t);const s=typeof n=="string"?[n]:n;if(!Array.isArray(s))throw new TypeError("Expect properties to be a string or an array of strings.");for(const i of s){if(typeof i!="string")throw new TypeError("Expect properties to be a string or an array of strings.");le(i)}const a=()=>s.map(i=>dn(e,i)),r=[];for(const i of s){const u=le(i);let g=null;const j=()=>{const v=[],y=(c,b)=>{if(!me(c)||b>=u.length)return;const m=u[b],E=Be(c);if(E){const x=E.on(`set:${m}`,()=>{t(...a()),b<u.length-1&&g&&(g(),g=j())});v.push(x)}b<u.length-1&&y(c[m],b+1)};return y(e,0),()=>v.reduce((c,b)=>b()||c,!1)};g=j(),r.push(()=>g?g():!1)}return t(...a()),()=>r.reduce((i,u)=>u()||i,!1)};function pn(e,n){"watch"in e||Object.defineProperty(e,"watch",{configurable:!0,writable:!0,enumerable:!1,value(t,s){return n(typeof t=="string"?this:this,t,s)}})}function Se(e,n){return Object.prototype.hasOwnProperty.call(e,n)}function ie(e){if(typeof e=="symbol")return!1;const n=typeof e=="number"?e:Number(e);return!Number.isInteger(n)||n<0||n>=4294967295?!1:typeof e=="number"||e===String(n)}function un(e){return Be(e)?T(e.emit):!1}const Ue=(e,n={})=>{const{eventful:t=R,trace:s=null,shallow:a=!1}=n;$e(t);const r=Z.options,i=new WeakMap,u=c=>{if(a||!me(c)||un(c))return c;if(i.has(c))return i.get(c);const b=Ue(c,{eventful:t,trace:s,shallow:a});return i.set(c,b),b},g=c=>{if(!a){if(Array.isArray(c)){for(let b=0;b<c.length;b++)c[b]=u(c[b]);return}for(const b of Reflect.ownKeys(c))Se(c,b)&&(c[b]=u(c[b]))}},j=c=>{const b=Array.isArray(c);g(c),pn(c,_e);let m;const E=new Proxy(c,{set(x,h,A,k){const L=b&&ie(h),l=Reflect.get(x,h,k),d=Reflect.set(x,h,u(A),k);if(m&&d){const f=Reflect.get(x,h,k);if(!Object.is(l,f)){const w=L?{index:Number(h),value:f,previous:l}:{property:h,value:f,previous:l},I=s||r.trace;m.emit(`set:${String(h)}`,w),T(I)&&I(m,"set",w),m.emit("set",w)}}return d},deleteProperty(x,h){const A=b&&ie(h),k=Se(x,h),L=k?x[h]:void 0,l=Reflect.deleteProperty(x,h);if(m&&l&&k){const d=A?{index:Number(h),previous:L}:{property:h,previous:L},f=s||r.trace;m.emit(`delete:${String(h)}`,d),T(f)&&f(m,"delete",d),m.emit("delete",d)}return l},defineProperty(x,h,A){const k=Object.getOwnPropertyDescriptor(x,h)??null,L=Object.prototype.hasOwnProperty.call(A,"value")?{...A,value:u(A.value)}:A,l=Reflect.defineProperty(x,h,L),d=b&&(h==="length"||ie(h));if(m&&!d&&l){const f={property:h,descriptor:L,previous:k},w=s||r.trace;m.emit(`define:${String(h)}`,f),T(w)&&w(m,"define",f),m.emit("define",f)}return l}});return m=T(c==null?void 0:c.emit)?E:t(E),m},v=s||r.trace;if(Array.isArray(e)){const c=j(e);return T(v)&&v(c,"new"),c}if(e!==null&&typeof e=="object"){const c=j(e);return T(v)&&v(c,"new",{object:c}),c}const y=t({get value(){return e},set value(c){if(Object.is(c,e))return;const b=e;e=c;const m={property:"value",value:e,previous:b};y.emit("set:value",m),T(v)&&v(y,"set",m),y.emit("set",m)}});return T(v)&&v(y,"new",{object:y}),y},Z=Ue;Z.options={trace:null};Z.watch=_e;const o=Z({apps:[],currentAppId:null,files:[],activeFileName:null,generating:!1,error:null});function S(e){return new Promise((n,t)=>{e.addEventListener("success",()=>{n(e.result)}),e.addEventListener("error",()=>{t(e.error??new Error("IndexedDB request failed"))})})}function fn(e,n){return new Promise((t,s)=>{const a=indexedDB.open(e,n.length);a.addEventListener("upgradeneeded",r=>{const i=n.slice(r.oldVersion-1,r.newVersion??n.length-1);for(const u of i)u(a.result)}),a.addEventListener("success",()=>{t(a.result)}),a.addEventListener("blocked",()=>{s(new Error("Database opening is blocked"))}),a.addEventListener("error",()=>{s(a.error??new Error("Failed to open database"))})})}const mn="asljs-app-builder";let q=null;async function F(){return q!==null||(q=await fn(mn,[e=>{e.createObjectStore("apps",{keyPath:"id"}),e.createObjectStore("files",{keyPath:"id"}).createIndex("byAppId","appId",{unique:!1})}])),q}async function vn(){const n=(await F()).transaction("apps","readonly");return S(n.objectStore("apps").getAll())}async function ee(e){const t=(await F()).transaction("apps","readwrite");await S(t.objectStore("apps").put(e))}async function bn(e){const t=(await F()).transaction(["apps","files"],"readwrite");await S(t.objectStore("apps").delete(e));const s=t.objectStore("files"),a=await S(s.index("byAppId").getAllKeys(e));for(const r of a)await S(s.delete(r))}async function hn(e){const t=(await F()).transaction("files","readonly");return S(t.objectStore("files").index("byAppId").getAll(e))}async function ce(e){const t=(await F()).transaction("files","readwrite");await S(t.objectStore("files").put(e))}async function gn(e){const t=(await F()).transaction("files","readwrite");await S(t.objectStore("files").delete(e))}async function yn(e,n){const a=(await F()).transaction("files","readwrite").objectStore("files"),r=await S(a.index("byAppId").getAllKeys(e));for(const i of r)await S(a.delete(i));for(const i of n)await S(a.put(i))}const wn=`# observable

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
`,jn=`# eventful

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
`,xn=`# data-binding

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
`,En=`# components

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
`,Tn=`export {
    bindDataModel
  } from './bind-data-model.js';

export {
    createBuiltInPipes
  } from './pipes.js';

export type {
    BindDataModelOptions,
    DataModel,
  } from './types.js';
`,Ln=`export {
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
`,Mn=[{type:"function",name:"listFileset",description:"List all file paths in the virtual filesystem.",parameters:{type:"object",properties:{},required:[],additionalProperties:!1},strict:!0},{type:"function",name:"readFile",description:"Read the full text content of a file.",parameters:{type:"object",properties:{path:{type:"string"}},required:["path"],additionalProperties:!1},strict:!0},{type:"function",name:"setFileContent",description:"Create or fully replace file content.",parameters:{type:"object",properties:{path:{type:"string"},content:{type:"string"}},required:["path","content"],additionalProperties:!1},strict:!0},{type:"function",name:"replaceFilePart",description:"Replace part of a file by exact search string.",parameters:{type:"object",properties:{path:{type:"string"},search:{type:"string"},replacement:{type:"string"},replaceAll:{type:"boolean"}},required:["path","search","replacement","replaceAll"],additionalProperties:!1},strict:!0},{type:"function",name:"deleteFile",description:"Delete a file from the virtual filesystem.",parameters:{type:"object",properties:{path:{type:"string"}},required:["path"],additionalProperties:!1},strict:!0},{type:"function",name:"evalInApp",description:"Evaluate JavaScript in the running app document context.",parameters:{type:"object",properties:{code:{type:"string"}},required:["code"],additionalProperties:!1},strict:!0}],Fn="https://api.openai.com/v1/responses",Dn=J(On,"asljs-observable"),Bn=J(Nn,"asljs-eventful"),$n=J(Pn,"asljs-data-binding"),_n=J(Rn,"asljs-components"),Un=J(Cn,"asljs-dali"),Ve=Hn(),Vn="gpt-5.3-codex",U=20;function Jn(){return Ve}const Wn=12;async function qn(e,n,t,s,a){var j;let r,i=e,u=Gn(a==null?void 0:a.initialToolStepLimit),g=0;for(;;){if(g>=u){if(!(await((j=a==null?void 0:a.onToolStepLimit)==null?void 0:j.call(a,{stepsCompleted:g,stepLimit:u}))??!1))throw new Error("AI exceeded maximum tool steps without completing.");u+=Wn}const v=await fetch(Fn,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${n}`},body:JSON.stringify({model:t,instructions:Ve,temperature:.1,previous_response_id:r,input:i,tools:Mn})});if(!v.ok){const m=await v.json().catch(()=>({})),E=Kn(m)??`OpenAI API error: ${v.status}`;throw new Error(E)}const y=await v.json();if(!Array.isArray(y.output))throw new Error("AI returned an unexpected response format.");const c=y.output.filter(Qn);if(c.length===0){const m=et(y);return{summary:m===""?"Completed tool-based update.":m}}const b=[];for(const m of c){const E=await zn(m,s);b.push({type:"function_call_output",call_id:Zn(m),output:E})}r=typeof y.id=="string"?y.id:r,i=b,g+=1}}function Gn(e){if(!Number.isFinite(e))return U;const n=Math.floor(e);return n>=1?n:U}function Hn(){const e=`
      Latest ASLJS package versions to use:
      - asljs-eventful@${Bn}
      - asljs-observable@${Dn}
      - asljs-data-binding@${$n}
      - asljs-components@${_n}
      - asljs-dali@${Un}
    `,n=[$("eventful",jn,kn),$("observable",wn,An),$("data-binding",xn,Tn),$("components",En,Ln),$("dali",Sn,In)].join(`

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
... [truncated]`}function J(e,n){try{return JSON.parse(e).version??"latest"}catch{return console.warn(`Failed to parse package metadata for ${n}.`),"latest"}}function Kn(e){const n=e.error;return typeof(n==null?void 0:n.message)=="string"?n.message:null}async function zn(e,n){const t=Xn(e),s=Yn(e.arguments);try{switch(t){case"listFileset":{const a=await n.listFileset();return B(a)}case"readFile":{const a=await n.readFile(O(s,"path"));return B(a)}case"setFileContent":return await n.setFileContent(O(s,"path"),O(s,"content")),B("ok");case"replaceFilePart":return await n.replaceFilePart(O(s,"path"),O(s,"search"),O(s,"replacement"),nt(s,"replaceAll",!1)),B("ok");case"deleteFile":return await n.deleteFile(O(s,"path")),B("ok");case"evalInApp":{const a=await n.evalInApp(O(s,"code"));return B(a)}default:return ke(`Unknown tool: ${t}`)}}catch(a){return ke(a instanceof Error?a.message:String(a))}}function Yn(e){if(e===void 0)return{};if(typeof e=="object"&&e!==null)return e;if(typeof e!="string")throw new Error("Invalid tool arguments value.");try{const n=JSON.parse(e);if(typeof n!="object"||n===null)throw new Error("Tool arguments must be a JSON object.");return n}catch{throw new Error("Invalid tool arguments JSON.")}}function Qn(e){return e.type==="function_call"}function Xn(e){if(typeof e.name!="string"||e.name.trim()==="")throw new Error("Tool call missing function name.");return e.name}function Zn(e){if(typeof e.call_id!="string"||e.call_id.trim()==="")throw new Error("Tool call missing call_id.");return e.call_id}function et(e){return typeof e.output_text=="string"&&e.output_text.trim()!==""?e.output_text.trim():Array.isArray(e.output)?e.output.filter(t=>t.type==="message").flatMap(t=>t.content??[]).map(t=>t.text??"").map(t=>t.trim()).filter(t=>t!=="").join(`
`):""}function O(e,n){const t=e[n];if(typeof t!="string")throw new Error(`Tool argument "${n}" must be a string.`);return t}function nt(e,n,t){const s=e[n];if(s===void 0)return t;if(typeof s!="boolean")throw new Error(`Tool argument "${n}" must be a boolean.`);return s}function B(e){return Je({ok:!0,value:e})}function ke(e){return Je({ok:!1,error:e})}function Je(e){try{return JSON.stringify(e)}catch{return'{"ok":false,"error":"Failed to serialize tool result."}'}}const ve="asljs-app-builder:eval-request",We="asljs-app-builder:eval-response",Te=`<script>
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
<\/script>`;function tt(e,n){if(n.length===0){e.removeAttribute("srcdoc"),e.src="about:blank";return}const t=n.find(r=>r.name==="index.html")??n.find(r=>r.name.endsWith(".html"))??null;if(t===null){e.removeAttribute("srcdoc"),e.src="about:blank";return}let s=t.content;const a=n.find(r=>r.name==="style.css")??n.find(r=>r.name.endsWith(".css"))??null;a!==null&&(s=s.replace(/<link[^>]+href=["']style\.css["'][^>]*>/gi,`<style>${a.content}</style>`),s=s.replace(/<link[^>]+href=["']([^"']+\.css)["'][^>]*>/gi,`<style>${a.content}</style>`));for(const r of n){if(!r.name.endsWith(".js"))continue;const i=r.name.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");s=s.replace(new RegExp(`(<script[^>]*?)\\s+src=["']${i}["']([^>]*)><\\/script>`,"gi"),(u,g,j)=>{const v=`${String(g)} ${String(j)}`;return/type=["']module["']/i.test(v)?`<script type="module">${r.content}<\/script>`:`<script>${r.content}<\/script>`})}s=at(s,n),s=st(s),e.srcdoc=s}async function Le(e,n){const t=e.contentWindow;if(t===null)throw new Error("Preview frame is not available.");const s=crypto.randomUUID();return new Promise((a,r)=>{const i=window.setTimeout(()=>{g(),r(new Error("Timed out waiting for app evaluation result."))},5e3),u=j=>{if(j.source!==t)return;const v=j.data;if(!(v.type!==We||v.id!==s)){if(g(),v.ok===!0){a(v.value);return}r(new Error(v.error??"Unknown preview evaluation error."))}};function g(){window.clearTimeout(i),window.removeEventListener("message",u)}window.addEventListener("message",u),t.postMessage({type:ve,id:s,code:n},"*")})}function st(e){return e.includes(ve)?e:e.includes("</body>")?e.replace("</body>",`${Te}</body>`):`${e}
${Te}`}function at(e,n){if(/type=["']importmap["']/i.test(e))return e;const t=n.find(i=>i.name==="package.json")??null,s=rt(t==null?void 0:t.content),a=Object.fromEntries(s.map(([i,u])=>[i,`https://esm.sh/${i}@${u}?bundle`]));if(Object.keys(a).length===0)return e;const r=`<script type="importmap">${JSON.stringify({imports:a})}<\/script>`;return/<head[^>]*>/i.test(e)?e.replace(/<head[^>]*>/i,i=>`${i}
${r}`):`${r}
${e}`}function rt(e){if(e===void 0)return Ie();try{const n=JSON.parse(e),t={...n.dependencies??{},...n.devDependencies??{}};return["asljs-eventful","asljs-observable","asljs-data-binding","asljs-components","asljs-dali"].map(r=>[r,ot(t[r])])}catch{return Ie()}}function ot(e){if(typeof e!="string"||e.trim()==="")return"latest";const n=e.trim().replace(/^[~^<>=\s]+/,"");return n===""?"latest":n}function Ie(){return[["asljs-eventful","latest"],["asljs-observable","latest"],["asljs-data-binding","latest"],["asljs-components","latest"],["asljs-dali","latest"]]}function G(){return crypto.randomUUID()}function C(){return new Date().toISOString()}function p(e){const n=document.getElementById(e);if(n===null)throw new Error(`Missing element #${e}`);return n}const Oe=p("app-list"),Ne=p("empty-state"),Pe=p("app-workspace"),it=p("app-name-display"),Re=p("file-tabs"),H=p("file-content"),_=p("chat-messages"),de=p("chat-input"),pe=p("btn-generate"),lt=p("btn-run"),ct=p("btn-refresh-preview"),K=p("preview-frame"),dt=p("btn-new-app"),pt=p("btn-new-app-2"),ut=p("btn-rename"),ft=p("btn-delete-app"),mt=p("btn-export"),vt=p("btn-settings"),bt=p("btn-agent-instructions"),z=p("settings-modal"),ht=p("btn-close-settings"),gt=p("btn-save-settings"),yt=p("btn-cancel-settings"),ue=p("api-key-input"),qe=p("model-select"),Ge=p("max-tool-steps-input"),M=p("name-modal"),He=p("name-modal-title"),N=p("app-name-input"),W=p("btn-confirm-name"),wt=p("btn-cancel-name"),jt=p("btn-close-name-modal"),Y=p("import-file"),Q=p("agent-instructions-modal"),fe=p("agent-instructions-text"),xt=p("btn-close-agent-instructions"),Et=p("btn-close-agent-instructions-2"),St=p("btn-copy-agent-instructions"),Ke="asljs-app-builder-settings";function ne(){try{const e=localStorage.getItem(Ke)??"{}";return JSON.parse(e)}catch{return{}}}function At(e){localStorage.setItem(Ke,JSON.stringify(e))}function ze(){return ne().apiKey??""}function Ye(){const e=ne().model;return e==="gpt-5.3-codex"||e==="gpt-5.4"?e:Vn}function Qe(){const e=ne().maxToolSteps;if(!Number.isFinite(e))return U;const n=Math.floor(e);return n<1?U:n}function kt(){if(o.currentAppId===null)throw new Error("No active app. Create or open an app first.");return o.currentAppId}async function Xe(){return[...o.files].map(e=>e.name).sort((e,n)=>e.localeCompare(n))}async function be(e){const n=o.files.find(t=>t.name===e);if(n===void 0)throw new Error(`File not found: ${e}`);return n.content}async function he(e,n){const t=kt(),s=o.files.find(r=>r.name===e);if(s!==void 0){const r={...s,content:n};await ce(r),o.files=o.files.map(i=>i.id===r.id?r:i),o.activeFileName=r.name;return}const a={id:G(),appId:t,name:e,content:n};await ce(a),o.files=[...o.files,a],o.activeFileName=a.name}async function Ze(e){var s;const n=o.files.find(a=>a.name===e);if(n===void 0)return;await gn(n.id);const t=o.files.filter(a=>a.id!==n.id);o.files=t,o.activeFileName===e&&(o.activeFileName=((s=t[0])==null?void 0:s.name)??null)}async function en(e,n,t,s=!1){if(n==="")throw new Error("Search text cannot be empty.");const a=await be(e);if(!a.includes(n))throw new Error(`Search text not found in ${e}.`);let r=a;if(s)r=a.split(n).join(t);else{const i=a.indexOf(n);if(a.indexOf(n,i+n.length)!==-1)throw new Error("Search text is ambiguous. Use replaceAll=true or provide a more specific search block.");r=a.slice(0,i)+t+a.slice(i+n.length)}await he(e,r)}async function nn(e){if(o.files.length===0)throw new Error("No files available to run.");V();try{return await Le(K,e)}catch{return V(),Le(K,e)}}function tn(){Oe.replaceChildren();const e=[...o.apps].sort((n,t)=>t.updatedAt.localeCompare(n.updatedAt));for(const n of e){const t=document.createElement("div");t.className="app-item"+(n.id===o.currentAppId?" active":""),t.dataset.id=n.id;const s=document.createElement("span");s.className="app-item-name",s.textContent=n.name,t.appendChild(s),t.addEventListener("click",()=>{se(n.id)}),Oe.appendChild(t)}}function sn(){const e=o.apps.find(n=>n.id===o.currentAppId);if(e===void 0){Ne.classList.remove("hidden"),Pe.classList.add("hidden");return}Ne.classList.add("hidden"),Pe.classList.remove("hidden"),it.textContent=e.name,ge(),ye()}function ge(){Re.replaceChildren();for(const e of o.files){const n=document.createElement("div");n.className="file-tab"+(e.name===o.activeFileName?" active":""),n.textContent=e.name,n.addEventListener("click",()=>{te(),o.activeFileName=e.name}),Re.appendChild(n)}}function ye(){const e=o.files.find(n=>n.name===o.activeFileName);H.value=(e==null?void 0:e.content)??"",H.disabled=e===void 0}function Ce(e){o.generating=e,pe.disabled=e,pe.innerHTML=e?'<span class="spinner"></span> Generating…':"Generate"}function P(e,n){const t=document.createElement("div");t.className=`chat-msg ${e}`;const s=document.createElement("div");s.className="chat-msg-role",s.textContent=e==="user"?"You":"Assistant";const a=document.createElement("div");a.className="chat-bubble",a.textContent=n,t.appendChild(s),t.appendChild(a),_.appendChild(t),_.scrollTop=_.scrollHeight}async function te(){if(o.activeFileName===null||o.currentAppId===null)return;const e=o.files.find(t=>t.name===o.activeFileName);if(e===void 0)return;const n=H.value;e.content!==n&&(e.content=n,await ce(e))}async function se(e){var t;o.currentAppId=e;const n=await hn(e);o.files=n,o.activeFileName=((t=n[0])==null?void 0:t.name)??null,_.replaceChildren()}function an(){He.textContent="New App",N.value="",M.classList.remove("hidden"),N.focus(),W.onclick=async()=>{const e=N.value.trim();if(e==="")return;M.classList.add("hidden");const n={id:G(),name:e,createdAt:C(),updatedAt:C()};await ee(n),o.apps=[...o.apps,n],await se(n.id)}}function we(){M.classList.add("hidden"),W.onclick=null}function Tt(){const e=o.apps.find(n=>n.id===o.currentAppId);e!==void 0&&(He.textContent="Rename App",N.value=e.name,M.classList.remove("hidden"),N.focus(),N.select(),W.onclick=async()=>{const n=N.value.trim();if(n==="")return;M.classList.add("hidden");const t={...e,name:n,updatedAt:C()};await ee(t),o.apps=o.apps.map(s=>s.id===e.id?t:s)})}async function Lt(){const e=o.apps.find(n=>n.id===o.currentAppId);e!==void 0&&confirm(`Delete "${e.name}"? This cannot be undone.`)&&(await bn(e.id),o.apps=o.apps.filter(n=>n.id!==e.id),o.currentAppId=null,o.files=[],o.activeFileName=null,_.replaceChildren(),K.src="about:blank")}async function rn(){const e=de.value.trim();if(e==="")return;const n=ze();if(n===""){P("assistant","No OpenAI API key set. Open Settings (⚙) to add your key. Generation is optional — you can also create files manually.");return}if(o.currentAppId===null){P("assistant","Please create or open an app first.");return}de.value="",P("user",e),Ce(!0);try{const t=Ye(),s=Qe(),a=await qn(e,n,t,{listFileset:Xe,readFile:be,setFileContent:he,replaceFilePart:en,deleteFile:Ze,evalInApp:nn},{initialToolStepLimit:s,onToolStepLimit:async({stepsCompleted:i})=>confirm(`AI reached ${i} tool steps without finishing. Continue for 12 more steps?`)}),r=o.apps.find(i=>i.id===o.currentAppId);if(r!==void 0){const i={...r,updatedAt:C()};await ee(i),o.apps=o.apps.map(u=>u.id===r.id?i:u)}P("assistant",a.summary),V()}catch(t){const s=t instanceof Error?t.message:String(t);P("assistant",`Error: ${s}`)}finally{Ce(!1)}}function V(){te().then(()=>{tt(K,o.files)})}async function It(){const e=o.apps.find(r=>r.id===o.currentAppId);if(e===void 0)return;await te();const n={app:e,files:o.files,exportedAt:C()},t=new Blob([JSON.stringify(n,null,2)],{type:"application/json"}),s=URL.createObjectURL(t),a=document.createElement("a");a.href=s,a.download=`${e.name.replace(/\s+/g,"-")}.json`,a.click(),URL.revokeObjectURL(s)}function Ot(){Y.value="",Y.click()}async function Nt(){var n;const e=(n=Y.files)==null?void 0:n[0];if(e!==void 0)try{const t=await e.text(),s=JSON.parse(t);if(s.app===void 0||typeof s.app.name!="string"||!Array.isArray(s.files))throw new Error("Invalid app JSON format.");const a=G(),r={id:a,name:`${s.app.name} (imported)`,createdAt:s.app.createdAt??C(),updatedAt:C()},i=s.files.filter(u=>typeof u.name=="string"&&typeof u.content=="string").map(u=>({id:G(),appId:a,name:u.name,content:u.content}));await ee(r),await yn(a,i),o.apps=[...o.apps,r],await se(a)}catch(t){const s=t instanceof Error?t.message:String(t);alert(`Import failed: ${s}`)}}function Pt(){ue.value=ze(),qe.value=Ye(),Ge.value=String(Qe()),z.classList.remove("hidden"),ue.focus()}function ae(){z.classList.add("hidden")}function Rt(){const e=ne();e.apiKey=ue.value.trim(),e.model=qe.value==="gpt-5.4"?"gpt-5.4":"gpt-5.3-codex";const n=Number.parseInt(Ge.value,10);e.maxToolSteps=Number.isFinite(n)&&n>=1?n:U,At(e),ae()}function Ct(){fe.value=Jn(),Q.classList.remove("hidden"),fe.scrollTop=0}function je(){Q.classList.add("hidden")}async function Mt(){const e=fe.value;try{await navigator.clipboard.writeText(e),P("assistant","Agent instructions copied to clipboard.")}catch{P("assistant","Could not copy to clipboard automatically. You can still select and copy from the instructions modal.")}}o.on("set:apps",()=>tn());o.on("set:currentAppId",()=>{tn(),sn()});o.on("set:files",()=>{ge(),ye()});o.on("set:activeFileName",()=>{ge(),ye()});dt.addEventListener("click",an);pt.addEventListener("click",an);ut.addEventListener("click",Tt);ft.addEventListener("click",()=>{Lt()});mt.addEventListener("click",()=>{It()});pe.addEventListener("click",()=>{rn()});lt.addEventListener("click",V);ct.addEventListener("click",V);vt.addEventListener("click",Pt);bt.addEventListener("click",Ct);ht.addEventListener("click",ae);gt.addEventListener("click",Rt);yt.addEventListener("click",ae);z.addEventListener("click",e=>{e.target===z&&ae()});xt.addEventListener("click",je);Et.addEventListener("click",je);St.addEventListener("click",()=>{Mt()});Q.addEventListener("click",e=>{e.target===Q&&je()});W.addEventListener("click",()=>{});wt.addEventListener("click",we);jt.addEventListener("click",we);M.addEventListener("click",e=>{e.target===M&&we()});N.addEventListener("keydown",e=>{e.key==="Enter"&&W.click()});de.addEventListener("keydown",e=>{e.key==="Enter"&&!e.shiftKey&&(e.preventDefault(),rn())});H.addEventListener("blur",()=>{te()});Y.addEventListener("change",()=>{Nt()});const re=document.createElement("button");re.className="btn btn-ghost btn-full";re.textContent="↑ Import";re.addEventListener("click",Ot);const Me=document.querySelector(".sidebar-footer"),Fe=document.getElementById("btn-settings");Me!==null&&Fe!==null&&Me.insertBefore(re,Fe);window.listFileset=Xe;window.readFile=be;window.setFileContent=he;window.replaceFilePart=en;window.deleteFile=Ze;window.evalInApp=nn;async function Ft(){const e=await vn();if(o.apps=e,e.length>0){const n=[...e].sort((t,s)=>s.updatedAt.localeCompare(t.updatedAt));await se(n[0].id)}else sn()}Ft().catch(e=>{console.error("App Builder init failed:",e)});
