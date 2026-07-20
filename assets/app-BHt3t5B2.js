var e=Object.create,t=Object.defineProperty,n=Object.getOwnPropertyDescriptor,r=Object.getOwnPropertyNames,i=Object.getPrototypeOf,a=Object.prototype.hasOwnProperty,o=(e,t)=>()=>(t||(e((t={exports:{}}).exports,t),e=null),t.exports),s=(e,i,o,s)=>{if(i&&typeof i==`object`||typeof i==`function`)for(var c=r(i),l=0,u=c.length,d;l<u;l++)d=c[l],!a.call(e,d)&&d!==o&&t(e,d,{get:(e=>i[e]).bind(null,d),enumerable:!(s=n(i,d))||s.enumerable});return e},c=(n,r,a)=>(a=n==null?{}:e(i(n)),s(r||!n||!n.__esModule?t(a,`default`,{value:n,enumerable:!0}):a,n));(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();function l(e){if(typeof e!=`string`&&typeof e!=`symbol`)throw TypeError(`Expect event to be a string or symbol.`)}function u(e){return typeof e==`function`}function d(e){if(u(e))return e}function f(e){return typeof e==`object`&&!!e}function p(e){if(!u(e))throw TypeError(`Expect a function.`)}var m=class extends Error{error;object;event;listener;constructor(e,t,n,r,i){super(e),this.name=`ListenerError`,this.error=t,this.object=n,this.event=r,this.listener=i}},h=(e=Object.create(null),t={})=>{if(!f(e)&&!u(e))throw TypeError(`Expect an object or a function.`);for(let t of[`on`,`once`,`off`,`emit`,`emitAsync`,`has`])if(t in e)throw Error(`Method "${t}" already exists.`);let{strict:n=!1,trace:r=null,error:i=null}=t,a=d(r)??null,o=d(i)??null,s=e!==h,c=(e,t)=>{a?.(e,t),s&&h.emit(e,t)};c(`new`,{object:e});let g=new Set,_=new Map,v={enumerable:!1,configurable:!0,writable:!0};return Object.defineProperties(e,{on:Object.assign({value:ee},v),once:Object.assign({value:te},v),off:Object.assign({value:ne},v),emit:Object.assign({value:C},v),emitAsync:Object.assign({value:w},v),has:Object.assign({value:S},v)}),e;function y(e,t){let n=_.get(e);n||_.set(e,n=new Set),n.add(t)}function b(e,t){let n=_.get(e);if(!n)return!1;let r=n.delete(t);return n.size===0&&_.delete(e),r}function x(t,n,r){let i={error:r,object:e,event:t,listener:n};if(o?.(i),e===h&&t===`error`)throw new m(`Error in a global error listener.`,r,e,t,n);h.emit(`error`,i)}function ee(t,n){l(t),p(n),c(`on`,{object:e,event:t,listener:n}),y(t,n);let r=!0;return()=>r?(r=!1,b(t,n)):!1}function te(e,t){l(e),p(t);let n=ee(e,(...e)=>{n(),t(...e)});return n}function ne(t,n){return l(t),p(n),c(`off`,{object:e,event:t,listener:n}),b(t,n)}function S(e){return l(e),(_.get(e)?.size??0)>0}function C(t,...r){l(t);let i=_.get(t)||g;if(c(`emit`,{object:e,listeners:[...i],event:t,args:r}),i.size!==0)for(let e of i)try{e(...r)}catch(r){if(x(t,e,r),n)throw r}}async function w(t,...r){l(t);let i=_.get(t)||g;if(c(`emitAsync`,{object:e,listeners:[...i],event:t,args:r}),i.size===0)return;let a=[...i].map(async e=>{try{await e(...r)}catch(r){if(x(t,e,r),n)throw r}});await(n?Promise.all(a):Promise.allSettled(a))}};h(h);function g(e){return!f(e)&&!u(e)?!1:typeof e.on==`function`}function _(e){if(g(e))return e}function v(e){return typeof e==`function`}function y(e){return typeof e==`object`&&!!e}function b(e){if(!v(e))throw TypeError(`Expect a function.`)}function x(e){if(e.trim()===``)throw TypeError(`Expect watch path to be a non-empty string.`);let t=e.split(`.`);for(let e of t)if(e.trim()===``)throw TypeError(`Expect watch path segments to be non-empty.`);return e.split(`.`).map(e=>e.trim()).filter(e=>e!==``)}function ee(e,t){let n=x(t);if(n.length===0)return;let r=e;for(let e of n){if(!y(r)||!(e in r))return;r=r[e]}return r}var te=(e,t,n)=>{if(Array.isArray(e))throw TypeError(`Watching arrays is not supported.`);b(n);let r=typeof t==`string`?[t]:t;if(!Array.isArray(r))throw TypeError(`Expect properties to be a string or an array of strings.`);for(let e of r){if(typeof e!=`string`)throw TypeError(`Expect properties to be a string or an array of strings.`);x(e)}let i=()=>r.map(t=>ee(e,t)),a=[];for(let t of r){let r=x(t),o=null,s=()=>{let t=[],a=(e,c)=>{if(!y(e)||c>=r.length)return;let l=r[c],u=_(e);if(u){let e=u.on(`set:${l}`,()=>{n(...i()),c<r.length-1&&o&&(o(),o=s())});t.push(e)}c<r.length-1&&a(e[l],c+1)};return a(e,0),()=>t.reduce((e,t)=>t()||e,!1)};o=s(),a.push(()=>o?o():!1)}return n(...i()),()=>a.reduce((e,t)=>t()||e,!1)};function ne(e,t){`watch`in e||Object.defineProperty(e,"watch",{configurable:!0,writable:!0,enumerable:!1,value(e,n){return t(this,e,n)}})}function S(e,t){return Object.prototype.hasOwnProperty.call(e,t)}function C(e){if(typeof e==`symbol`)return!1;let t=typeof e==`number`?e:Number(e);return!Number.isInteger(t)||t<0||t>=4294967295?!1:typeof e==`number`||e===String(t)}function w(e){return _(e)?v(e.emit):!1}var re=(e,t={})=>{let{eventful:n=h,trace:r=null,shallow:i=!1}=t;b(n);let a=T.options,o=new WeakMap,s=e=>{if(i||!y(e)||w(e))return e;if(o.has(e))return o.get(e);let t=re(e,{eventful:n,trace:r,shallow:i});return o.set(e,t),t},c=e=>{if(!i){if(Array.isArray(e)){for(let t=0;t<e.length;t++)e[t]=s(e[t]);return}for(let t of Reflect.ownKeys(e))S(e,t)&&(e[t]=s(e[t]))}},l=e=>{let t=Array.isArray(e);c(e),ne(e,te);let i=null,o=new Proxy(e,{set(e,n,o,c){let l=t&&C(n),u=Reflect.get(e,n,c),d=Reflect.set(e,n,s(o),c);if(i&&d){let t=Reflect.get(e,n,c);if(!Object.is(u,t)){let e=l?{index:Number(n),value:t,previous:u}:{property:n,value:t,previous:u},o=r||a.trace;i.emit(`set:${String(n)}`,e),v(o)&&o(i,`set`,e),i.emit(`set`,e)}}return d},deleteProperty(e,n){let o=t&&C(n),s=S(e,n),c=s?e[n]:void 0,l=Reflect.deleteProperty(e,n);if(i&&l&&s){let e=o?{index:Number(n),previous:c}:{property:n,previous:c},t=r||a.trace;i.emit(`delete:${String(n)}`,e),v(t)&&t(i,`delete`,e),i.emit(`delete`,e)}return l},defineProperty(e,n,o){let c=Object.getOwnPropertyDescriptor(e,n)??null,l=Object.prototype.hasOwnProperty.call(o,`value`)?{...o,value:s(o.value)}:o,u=Reflect.defineProperty(e,n,l),d=t&&(n===`length`||C(n));if(i&&!d&&u){let e={property:n,descriptor:l,previous:c},t=r||a.trace;i.emit(`define:${String(n)}`,e),v(t)&&t(i,`define`,e),i.emit(`define`,e)}return u}});return i=v(e?.emit)?o:n(o),i},u=r||a.trace;if(Array.isArray(e)){let t=l(e);return v(u)&&u(t,`new`),t}if(typeof e==`object`&&e){let t=l(e);return v(u)&&u(t,`new`,{object:t}),t}let d=n({get value(){return e},set value(t){if(Object.is(t,e))return;let n=e;e=t;let r={property:`value`,value:e,previous:n};d.emit(`set:value`,r),v(u)&&u(d,`set`,r),d.emit(`set`,r)}});return v(u)&&u(d,`new`,{object:d}),d},T=re;T.options={trace:null},T.watch=te;var ie=globalThis,ae=ie.ShadowRoot&&(ie.ShadyCSS===void 0||ie.ShadyCSS.nativeShadow)&&`adoptedStyleSheets`in Document.prototype&&`replace`in CSSStyleSheet.prototype,E=Symbol(),D=new WeakMap,O=class{constructor(e,t,n){if(this._$cssResult$=!0,n!==E)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,t=this.t;if(ae&&e===void 0){let n=t!==void 0&&t.length===1;n&&(e=D.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),n&&D.set(t,e))}return e}toString(){return this.cssText}},oe=e=>new O(typeof e==`string`?e:e+``,void 0,E),se=(e,...t)=>new O(e.length===1?e[0]:t.reduce((t,n,r)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if(typeof e==`number`)return e;throw Error(`Value passed to 'css' function must be a 'css' function result: `+e+`. Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.`)})(n)+e[r+1],e[0]),e,E),ce=(e,t)=>{if(ae)e.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let n of t){let t=document.createElement(`style`),r=ie.litNonce;r!==void 0&&t.setAttribute(`nonce`,r),t.textContent=n.cssText,e.appendChild(t)}},le=ae?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t=``;for(let n of e.cssRules)t+=n.cssText;return oe(t)})(e):e,{is:ue,defineProperty:de,getOwnPropertyDescriptor:fe,getOwnPropertyNames:pe,getOwnPropertySymbols:k,getPrototypeOf:A}=Object,j=globalThis,me=j.trustedTypes,he=me?me.emptyScript:``,M=j.reactiveElementPolyfillSupport,ge=(e,t)=>e,_e={toAttribute(e,t){switch(t){case Boolean:e=e?he:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,t){let n=e;switch(t){case Boolean:n=e!==null;break;case Number:n=e===null?null:Number(e);break;case Object:case Array:try{n=JSON.parse(e)}catch{n=null}}return n}},ve=(e,t)=>!ue(e,t),ye={attribute:!0,type:String,converter:_e,reflect:!1,useDefault:!1,hasChanged:ve};Symbol.metadata??=Symbol(`metadata`),j.litPropertyMetadata??=new WeakMap;var be=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=ye){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let n=Symbol(),r=this.getPropertyDescriptor(e,n,t);r!==void 0&&de(this.prototype,e,r)}}static getPropertyDescriptor(e,t,n){let{get:r,set:i}=fe(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:r,set(t){let a=r?.call(this);i?.call(this,t),this.requestUpdate(e,a,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??ye}static _$Ei(){if(this.hasOwnProperty(ge(`elementProperties`)))return;let e=A(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(ge(`finalized`)))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(ge(`properties`))){let e=this.properties,t=[...pe(e),...k(e)];for(let n of t)this.createProperty(n,e[n])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[e,n]of t)this.elementProperties.set(e,n)}this._$Eh=new Map;for(let[e,t]of this.elementProperties){let n=this._$Eu(e,t);n!==void 0&&this._$Eh.set(n,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let n=new Set(e.flat(1/0).reverse());for(let e of n)t.unshift(le(e))}else e!==void 0&&t.push(le(e));return t}static _$Eu(e,t){let n=t.attribute;return!1===n?void 0:typeof n==`string`?n:typeof e==`string`?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let n of t.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return ce(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,n){this._$AK(e,n)}_$ET(e,t){let n=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,n);if(r!==void 0&&!0===n.reflect){let i=(n.converter?.toAttribute===void 0?_e:n.converter).toAttribute(t,n.type);this._$Em=e,i==null?this.removeAttribute(r):this.setAttribute(r,i),this._$Em=null}}_$AK(e,t){let n=this.constructor,r=n._$Eh.get(e);if(r!==void 0&&this._$Em!==r){let e=n.getPropertyOptions(r),i=typeof e.converter==`function`?{fromAttribute:e.converter}:e.converter?.fromAttribute===void 0?_e:e.converter;this._$Em=r;let a=i.fromAttribute(t,e.type);this[r]=a??this._$Ej?.get(r)??a,this._$Em=null}}requestUpdate(e,t,n,r=!1,i){if(e!==void 0){let a=this.constructor;if(!1===r&&(i=this[e]),n??=a.getPropertyOptions(e),!((n.hasChanged??ve)(i,t)||n.useDefault&&n.reflect&&i===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,n))))return;this.C(e,t,n)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:n,reflect:r,wrapped:i},a){n&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),!0!==i||a!==void 0)||(this._$AL.has(e)||(this.hasUpdated||n||(t=void 0),this._$AL.set(e,t)),!0===r&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}let e=this.constructor.elementProperties;if(e.size>0)for(let[t,n]of e){let{wrapped:e}=n,r=this[t];!0!==e||this._$AL.has(t)||r===void 0||this.C(t,void 0,n,r)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};be.elementStyles=[],be.shadowRootOptions={mode:`open`},be[ge(`elementProperties`)]=new Map,be[ge(`finalized`)]=new Map,M?.({ReactiveElement:be}),(j.reactiveElementVersions??=[]).push(`2.1.2`);var xe=globalThis,Se=e=>e,Ce=xe.trustedTypes,we=Ce?Ce.createPolicy(`lit-html`,{createHTML:e=>e}):void 0,Te=`$lit$`,N=`lit$${Math.random().toFixed(9).slice(2)}$`,Ee=`?`+N,De=`<${Ee}>`,P=document,Oe=()=>P.createComment(``),ke=e=>e===null||typeof e!=`object`&&typeof e!=`function`,Ae=Array.isArray,je=e=>Ae(e)||typeof e?.[Symbol.iterator]==`function`,Me=`[ 	
\f\r]`,Ne=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Pe=/-->/g,Fe=/>/g,Ie=RegExp(`>|${Me}(?:([^\\s"'>=/]+)(${Me}*=${Me}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,`g`),Le=/'/g,Re=/"/g,ze=/^(?:script|style|textarea|title)$/i,F=(e=>(t,...n)=>({_$litType$:e,strings:t,values:n}))(1),Be=Symbol.for(`lit-noChange`),I=Symbol.for(`lit-nothing`),Ve=new WeakMap,L=P.createTreeWalker(P,129);function He(e,t){if(!Ae(e)||!e.hasOwnProperty(`raw`))throw Error(`invalid template strings array`);return we===void 0?t:we.createHTML(t)}var Ue=(e,t)=>{let n=e.length-1,r=[],i,a=t===2?`<svg>`:t===3?`<math>`:``,o=Ne;for(let t=0;t<n;t++){let n=e[t],s,c,l=-1,u=0;for(;u<n.length&&(o.lastIndex=u,c=o.exec(n),c!==null);)u=o.lastIndex,o===Ne?c[1]===`!--`?o=Pe:c[1]===void 0?c[2]===void 0?c[3]!==void 0&&(o=Ie):(ze.test(c[2])&&(i=RegExp(`</`+c[2],`g`)),o=Ie):o=Fe:o===Ie?c[0]===`>`?(o=i??Ne,l=-1):c[1]===void 0?l=-2:(l=o.lastIndex-c[2].length,s=c[1],o=c[3]===void 0?Ie:c[3]===`"`?Re:Le):o===Re||o===Le?o=Ie:o===Pe||o===Fe?o=Ne:(o=Ie,i=void 0);let d=o===Ie&&e[t+1].startsWith(`/>`)?` `:``;a+=o===Ne?n+De:l>=0?(r.push(s),n.slice(0,l)+Te+n.slice(l)+N+d):n+N+(l===-2?t:d)}return[He(e,a+(e[n]||`<?>`)+(t===2?`</svg>`:t===3?`</math>`:``)),r]},We=class e{constructor({strings:t,_$litType$:n},r){let i;this.parts=[];let a=0,o=0,s=t.length-1,c=this.parts,[l,u]=Ue(t,n);if(this.el=e.createElement(l,r),L.currentNode=this.el.content,n===2||n===3){let e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;(i=L.nextNode())!==null&&c.length<s;){if(i.nodeType===1){if(i.hasAttributes())for(let e of i.getAttributeNames())if(e.endsWith(Te)){let t=u[o++],n=i.getAttribute(e).split(N),r=/([.?@])?(.*)/.exec(t);c.push({type:1,index:a,name:r[2],strings:n,ctor:r[1]===`.`?Ye:r[1]===`?`?Xe:r[1]===`@`?Ze:Je}),i.removeAttribute(e)}else e.startsWith(N)&&(c.push({type:6,index:a}),i.removeAttribute(e));if(ze.test(i.tagName)){let e=i.textContent.split(N),t=e.length-1;if(t>0){i.textContent=Ce?Ce.emptyScript:``;for(let n=0;n<t;n++)i.append(e[n],Oe()),L.nextNode(),c.push({type:2,index:++a});i.append(e[t],Oe())}}}else if(i.nodeType===8)if(i.data===Ee)c.push({type:2,index:a});else{let e=-1;for(;(e=i.data.indexOf(N,e+1))!==-1;)c.push({type:7,index:a}),e+=N.length-1}a++}}static createElement(e,t){let n=P.createElement(`template`);return n.innerHTML=e,n}};function Ge(e,t,n=e,r){if(t===Be)return t;let i=r===void 0?n._$Cl:n._$Co?.[r],a=ke(t)?void 0:t._$litDirective$;return i?.constructor!==a&&(i?._$AO?.(!1),a===void 0?i=void 0:(i=new a(e),i._$AT(e,n,r)),r===void 0?n._$Cl=i:(n._$Co??=[])[r]=i),i!==void 0&&(t=Ge(e,i._$AS(e,t.values),i,r)),t}var Ke=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:n}=this._$AD,r=(e?.creationScope??P).importNode(t,!0);L.currentNode=r;let i=L.nextNode(),a=0,o=0,s=n[0];for(;s!==void 0;){if(a===s.index){let t;s.type===2?t=new qe(i,i.nextSibling,this,e):s.type===1?t=new s.ctor(i,s.name,s.strings,this,e):s.type===6&&(t=new Qe(i,this,e)),this._$AV.push(t),s=n[++o]}a!==s?.index&&(i=L.nextNode(),a++)}return L.currentNode=P,r}p(e){let t=0;for(let n of this._$AV)n!==void 0&&(n.strings===void 0?n._$AI(e[t]):(n._$AI(e,n,t),t+=n.strings.length-2)),t++}},qe=class e{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,n,r){this.type=2,this._$AH=I,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=n,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=Ge(this,e,t),ke(e)?e===I||e==null||e===``?(this._$AH!==I&&this._$AR(),this._$AH=I):e!==this._$AH&&e!==Be&&this._(e):e._$litType$===void 0?e.nodeType===void 0?je(e)?this.k(e):this._(e):this.T(e):this.$(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==I&&ke(this._$AH)?this._$AA.nextSibling.data=e:this.T(P.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:n}=e,r=typeof n==`number`?this._$AC(e):(n.el===void 0&&(n.el=We.createElement(He(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===r)this._$AH.p(t);else{let e=new Ke(r,this),n=e.u(this.options);e.p(t),this.T(n),this._$AH=e}}_$AC(e){let t=Ve.get(e.strings);return t===void 0&&Ve.set(e.strings,t=new We(e)),t}k(t){Ae(this._$AH)||(this._$AH=[],this._$AR());let n=this._$AH,r,i=0;for(let a of t)i===n.length?n.push(r=new e(this.O(Oe()),this.O(Oe()),this,this.options)):r=n[i],r._$AI(a),i++;i<n.length&&(this._$AR(r&&r._$AB.nextSibling,i),n.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let t=Se(e).nextSibling;Se(e).remove(),e=t}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},Je=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,n,r,i){this.type=1,this._$AH=I,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=i,n.length>2||n[0]!==``||n[1]!==``?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=I}_$AI(e,t=this,n,r){let i=this.strings,a=!1;if(i===void 0)e=Ge(this,e,t,0),a=!ke(e)||e!==this._$AH&&e!==Be,a&&(this._$AH=e);else{let r=e,o,s;for(e=i[0],o=0;o<i.length-1;o++)s=Ge(this,r[n+o],t,o),s===Be&&(s=this._$AH[o]),a||=!ke(s)||s!==this._$AH[o],s===I?e=I:e!==I&&(e+=(s??``)+i[o+1]),this._$AH[o]=s}a&&!r&&this.j(e)}j(e){e===I?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??``)}},Ye=class extends Je{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===I?void 0:e}},Xe=class extends Je{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==I)}},Ze=class extends Je{constructor(e,t,n,r,i){super(e,t,n,r,i),this.type=5}_$AI(e,t=this){if((e=Ge(this,e,t,0)??I)===Be)return;let n=this._$AH,r=e===I&&n!==I||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,i=e!==I&&(n===I||r);r&&this.element.removeEventListener(this.name,this,n),i&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH==`function`?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},Qe=class{constructor(e,t,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){Ge(this,e)}},$e=xe.litHtmlPolyfillSupport;$e?.(We,qe),(xe.litHtmlVersions??=[]).push(`3.3.3`);var et=(e,t,n)=>{let r=n?.renderBefore??t,i=r._$litPart$;if(i===void 0){let e=n?.renderBefore??null;r._$litPart$=i=new qe(t.insertBefore(Oe(),e),e,void 0,n??{})}return i._$AI(e),i},tt=globalThis,R=class extends be{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=et(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return Be}};R._$litElement$=!0,R.finalized=!0,tt.litElementHydrateSupport?.({LitElement:R});var nt=tt.litElementPolyfillSupport;nt?.({LitElement:R}),(tt.litElementVersions??=[]).push(`4.2.2`);var z=e=>(t,n)=>{n===void 0?customElements.define(e,t):n.addInitializer(()=>{customElements.define(e,t)})},rt={attribute:!0,type:String,converter:_e,reflect:!1,hasChanged:ve},it=(e=rt,t,n)=>{let{kind:r,metadata:i}=n,a=globalThis.litPropertyMetadata.get(i);if(a===void 0&&globalThis.litPropertyMetadata.set(i,a=new Map),r===`setter`&&((e=Object.create(e)).wrapped=!0),a.set(n.name,e),r===`accessor`){let{name:r}=n;return{set(n){let i=t.get.call(this);t.set.call(this,n),this.requestUpdate(r,i,e,!0,n)},init(t){return t!==void 0&&this.C(r,void 0,e,t),t}}}if(r===`setter`){let{name:r}=n;return function(n){let i=this[r];t.call(this,n),this.requestUpdate(r,i,e,!0,n)}}throw Error(`Unsupported decorator location: `+r)};function B(e){return(t,n)=>typeof n==`object`?it(e,t,n):((e,t,n)=>{let r=t.hasOwnProperty(n);return t.constructor.createProperty(n,e),r?Object.getOwnPropertyDescriptor(t,n):void 0})(e,t,n)}var at={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},ot=e=>(...t)=>({_$litDirective$:e,values:t}),st=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,n){this._$Ct=e,this._$AM=t,this._$Ci=n}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}},ct=class extends st{constructor(e){if(super(e),this.it=I,e.type!==at.CHILD)throw Error(this.constructor.directiveName+`() can only be used in child bindings`)}render(e){if(e===I||e==null)return this._t=void 0,this.it=e;if(e===Be)return e;if(typeof e!=`string`)throw Error(this.constructor.directiveName+`() called with a non-string value`);if(e===this.it)return this._t;this.it=e;let t=[e];return t.raw=t,this._t={_$litType$:this.constructor.resultType,strings:t,values:[]}}};ct.directiveName=`unsafeHTML`,ct.resultType=1;var lt=ot(ct),ut=`asljs-theme-provider`,dt=`asljs-theme-changed`,ft={button:{variants:{add:{icon:`&#xF26E;`,text:`Add`},delete:{icon:`&#xF5DE;`,text:`Delete`},settings:{icon:`&#xF3E5;`,text:`Settings`}}}},pt={};function mt(e,t){if(!(e===void 0&&t===void 0))return{...e??{},...t??{}}}function ht(e,t){if(e===void 0&&t===void 0)return;let n=new Set([...Object.keys(e??{}),...Object.keys(t??{})]),r={};for(let i of n)r[i]=mt(e?.[i],t?.[i]);return r}function gt(e,t){if(!(e===void 0&&t===void 0))return{...e??{},...t??{},variants:ht(e?.variants,t?.variants)}}function _t(){return{button:gt(ft.button,pt.button),list:mt(ft.list,pt.list),textInput:mt(ft.textInput,pt.textInput),select:mt(ft.select,pt.select)}}function vt(e){return e.closest(ut)}function yt(e,t){if(e==null)return null;let n=typeof e==`function`?e(t):e;if(n==null)return null;if(typeof n==`string`){let e=document.createElement(`template`);return e.innerHTML=n,e}let r=document.createElement(`template`);return r.content.append(n.content.cloneNode(!0)),r}function bt(e,t){return e==null?null:(typeof e==`function`?e(t):e)??null}function V(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a}var xt=class extends R{#e=null;#t=``;get variant(){return this.#t}set variant(e){this.#t=e}#n=``;get icon(){return this.#n}set icon(e){this.#n=e}#r=``;get buttonClassName(){return this.#r}set buttonClassName(e){this.#r=e}#i=null;get theme(){return this.#i}set theme(e){this.#i=e}#a=``;get text(){return this.#a}set text(e){this.#a=e}#o=!1;get disabled(){return this.#o}set disabled(e){this.#o=e}#s=`button`;get type(){return this.#s}set type(e){this.#s=e}createRenderRoot(){return this}connectedCallback(){super.connectedCallback(),this.#d()}disconnectedCallback(){this.#f(),super.disconnectedCallback()}get resolvedIcon(){if(this.icon!==``)return this.icon;let e=this.#c(`icon`);return e===null?``:e}get resolvedButtonClassName(){return this.buttonClassName.trim()===``?this.#c(`className`)??``:this.buttonClassName.trim()}get resolvedText(){return this.text===``?this.#c(`text`)??``:this.text}updated(e){e.has(`theme`)&&this.#d()}render(){return F`
      <button
          class=${this.resolvedButtonClassName}
          ?disabled=${this.disabled}
          type=${this.type}
          style="display:inline-flex;align-items:center;gap:0.5rem;">
        <span class="icon"
              ?hidden=${this.resolvedIcon===``}
              aria-hidden="true">${lt(this.resolvedIcon)}</span>
        <span class="text"
              ?hidden=${this.resolvedText===``}>${this.resolvedText}</span>
      </button>
    `}#c(e){for(let t of this.#u()){let n=this.#l(t,e);if(n!==null)return n;let r=bt(t?.[e],this);if(r!==null&&r!==``)return r}return null}#l(e,t){let n=this.variant.trim();if(n===``)return null;let r=bt(e?.variants?.[n]?.[t],this);return r===null||r===``?null:r}#u(){return[this.theme?.button,this.#e?.theme?.button,_t().button]}#d(){this.#f(),this.#e=vt(this),this.#e?.addEventListener(dt,this.#p)}#f(){this.#e?.removeEventListener(dt,this.#p),this.#e=null}#p=()=>{this.requestUpdate()}};V([B({reflect:!0})],xt.prototype,`variant`,null),V([B({attribute:!1})],xt.prototype,`icon`,null),V([B({attribute:!1})],xt.prototype,`buttonClassName`,null),V([B({attribute:!1})],xt.prototype,`theme`,null),V([B({attribute:!1})],xt.prototype,`text`,null),V([B({reflect:!0})],xt.prototype,`disabled`,null),V([B({reflect:!0})],xt.prototype,`type`,null),xt=V([z(`asljs-button`)],xt);function St(e,t){return t===``?null:Ct(e)?e.get(t):wt(e,t)}function Ct(e){return typeof e.get==`function`}function wt(e,t){let n=t.split(`.`).map(e=>e.trim()).filter(e=>e!==``),r=e;for(let e of n){if(typeof r!=`object`||!r||!(e in r))return null;r=r[e]}return r}function Tt(e,t,n,r,i){let a=St(n,t.actionPath),o=()=>{a=St(n,t.actionPath)},s=o=>{if(typeof a!=`function`){i(`${r}:missing-action:${t.actionPath}`,`${r}: action '${t.actionPath}' is not a function`);return}try{a(o,n,e)}catch(e){i(`${r}:action-error:${t.actionPath}`,`${r}: action '${t.actionPath}' failed`,e)}};e.addEventListener(t.eventName,s);let c=null;if(t.actionPath!==``){let e=T.watch(n,t.actionPath,()=>o());typeof e==`function`&&(c=e)}return()=>{e.removeEventListener(t.eventName,s),c?.()}}function Et(e){return e==null?``:e instanceof Date?e.toISOString():String(e)}var Dt=[{token:`yyyy`,getter:e=>e.getFullYear().toString().padStart(4,`0`)},{token:`yy`,getter:e=>e.getFullYear().toString().substring(2).padStart(2,`0`)},{token:`MM`,getter:e=>(e.getMonth()+1).toString().padStart(2,`0`)},{token:`dd`,getter:e=>e.getDate().toString().padStart(2,`0`)},{token:`hh`,getter:e=>e.getHours().toString().padStart(2,`0`)},{token:`mm`,getter:e=>e.getMinutes().toString().padStart(2,`0`)},{token:`ss`,getter:e=>e.getSeconds().toString().padStart(2,`0`)}],Ot=new Map;function kt(e){let t=[],n=``;for(let r=0;r<e.length;){if(e[r]===`\\`){r+1<e.length?(n+=e[r+1],r+=2):(n+=e[r],r++);continue}let i=!1;for(let a of Dt)if(e.startsWith(a.token,r)){if(n.length>0){let e=n;t.push(()=>e),n=``}t.push(a.getter),r+=a.token.length,i=!0;break}i||(n+=e[r],r++)}return n.length>0&&t.push(()=>n),e=>t.map(t=>t(e)).join(``)}function At(e,t){if(!t)return e.toString();let n=Ot.get(t);return n||(n=kt(t),Ot.set(t,n)),n(e)}var jt=new Set([`short`,`medium`,`long`,`full`]);function Mt(e){return{string:e=>e==null?e:Et(e),number:t=>{if(t==null)return t;let n=Number(t);return Number.isFinite(n)?new Intl.NumberFormat(e).format(n):``},currency:(t,n=`USD`)=>{if(t==null)return t;let r=Number(t);return Number.isFinite(r)?new Intl.NumberFormat(e,{style:`currency`,currency:n}).format(r):``},date:(t,n=`short`)=>t==null?t:Pt(t,n,e,!1),datetime:(t,n=`short`)=>t==null?t:Pt(t,n,e,!0),fixed:(e,t=`2`)=>{if(e==null)return e;let n=Number(e),r=Number(t);return Number.isFinite(n)?!Number.isInteger(r)||r<0?n.toString():n.toFixed(r):``},upper:e=>e==null?e:Et(e).toUpperCase(),lower:e=>e==null?e:Et(e).toLowerCase(),json:(e,t=`0`)=>{if(e==null)return e;let n=Number(t);return JSON.stringify(e,null,Number.isInteger(n)&&n>=0?n:0)??``},default:(e,...t)=>e==null?e:e===``?t.join(`:`):e,safeHtml:e=>e}}function Nt(e){return{...Mt(),...e?.pipes??{}}}function Pt(e,t,n,r){let i=Ft(e);if(i===null)return``;if(jt.has(t)){let e=t;return r?new Intl.DateTimeFormat(n,{dateStyle:e,timeStyle:e}).format(i):new Intl.DateTimeFormat(n,{dateStyle:e}).format(i)}return At(i,t)}function Ft(e){if(e instanceof Date)return Number.isNaN(e.getTime())?null:e;if(typeof e==`string`||typeof e==`number`){let t=new Date(e);return Number.isNaN(t.getTime())?null:t}return null}function It(e,t,n){if(t.kind===`class`){e.classList.toggle(t.name,!!n);return}if(t.kind===`prop`){let r=t.name;e[r]=n;return}if(t.kind===`attr`){if(n==null){e.removeAttribute(t.name);return}e.setAttribute(t.name,Et(n));return}let r=Et(n);if(t.kind===`html`){e.innerHTML=r;return}e.textContent=r}function Lt(e,t,n,r){let i=Nt(r),a=Rt(t.pipes,i),o=()=>{let r=zt(St(n,t.path),a);It(e,t.target,r)};if(o(),t.path===``)return()=>{};let s=T.watch(n,t.path,()=>o());return typeof s==`function`?()=>s():()=>{}}function Rt(e,t){let n=[];for(let r of e){let e=t[r.name];if(!e)throw Error(`Unknown pipe: ${r.name}`);n.push({args:[...r.args],formatter:e})}return n}function zt(e,t){let n=e;for(let e of t)n=e.formatter(n,...e.args);return n}function Bt(e,t){let n=Wt(t,`|`).map(e=>e.trim()).filter(e=>e!==``);return{kind:`value`,target:e,path:n[0]??``,pipes:n.slice(1).map(Ht).filter(e=>e!==null)}}function Vt(e,t){return{kind:`event`,eventName:e,actionPath:t.trim()}}function Ht(e){let t=e.trim(),n=t.indexOf(`:`),r=(n<0?t:t.slice(0,n)).trim();return r===``?null:n<0?{name:r,args:[]}:{name:r,args:Ut(t,n+1)}}function Ut(e,t){let n=[],r=t;for(;r<e.length;){for(;r<e.length&&e[r]===` `;)r++;if(r>=e.length||e[r]===`|`)break;if(e[r]===`'`||e[r]===`"`){let t=e[r];r++;let i=``,a=!1;for(;r<e.length;){let n=e[r];if(a){i+=n,a=!1,r++;continue}if(n===`\\`){a=!0,r++;continue}if(n===t){r++;break}i+=n,r++}n.push(i)}else{let t=``;for(;r<e.length;){let n=e[r];if(n===`:`||n===`|`)break;t+=n,r++}n.push(t.trim())}for(;r<e.length&&e[r]===` `;)r++;if(r<e.length&&e[r]===`:`){r++;continue}if(r<e.length&&e[r]===`|`)break}return n}function Wt(e,t,n=!1){let r=[],i=``,a=null,o=!1;for(let s=0;s<e.length;s++){let c=e[s];if(o){i+=c,o=!1;continue}if(c===`\\`){n||(i+=c),o=!0;continue}if(a!==null){if(c===a){a=null,n||(i+=c);continue}i+=c;continue}if(c===`'`||c===`"`){a=c,n||(i+=c);continue}if(c===t){r.push(i),i=``;continue}i+=c}return r.push(i),r}var Gt=`data-bind-context`,Kt=`data-bind-`;function qt(e,t,n={}){let r=new Set,i=(e,t,n=null)=>{r.has(e)||(r.add(e),n===null?console.warn(t):console.warn(t,n))},a=0;return Jt(e,t,n,i,()=>`data-bind[${a++}]`)}function Jt(e,t,n,r,i){let a=[];for(let o of[...e.children]){let e=o.getAttribute(Gt);e===null?(Xt(o,t,n,r,i,a),a.push(Jt(o,t,n,r,i))):a.push(Yt(o,e,t,n,r,i))}return()=>{for(let e of a)e()}}function Yt(e,t,n,r,i,a){let o=[];Xt(e,n,r,i,a,o,Gt);let s=null,c=()=>{s?.();let o=St(n,t);s=Jt(e,typeof o==`object`&&o?o:{},r,i,a)};c();let l=null;if(t!==``){let e=T.watch(n,t,()=>c());typeof e==`function`&&(l=e)}return()=>{for(let e of o)e();s?.(),l?.()}}function Xt(e,t,n,r,i,a,o){for(let s of[...e.attributes]){if(!s.name.startsWith(Kt)||o!==void 0&&s.name===o)continue;let c=Zt(s.name.slice(10),s.value??``),l=i();try{c.kind===`value`?a.push(Lt(e,c,t,n)):a.push(Tt(e,c,t,l,r))}catch(e){if(c.kind===`value`)throw e;r(`${l}:bind-error`,`${l}: binding setup failed`,e)}}}function Zt(e,t){return e.startsWith(`on`)&&e.length>2?Vt(e.slice(2),t):Bt(Qt(e),t)}function Qt(e){return e===`text`?{kind:`text`}:e===`html`?{kind:`html`}:e.startsWith(`class-`)&&e.length>6?{kind:`class`,name:e.slice(6)}:e.startsWith(`prop-`)&&e.length>5?{kind:`prop`,name:e.slice(5)}:{kind:`attr`,name:e}}var H=class extends R{constructor(...e){super(...e),this.#e=null,this.#t=null,this.#n=null,this.#r=null,this.#i=null,this.#a=null,this.#o=``,this.#s=null,this.#c=null,this.#l=`asljs-select-${$t++}`,this.#u=T({label:``,description:``,errorMessage:``,hideLabel:!0,hideDescription:!0,hideError:!0,hasError:!1,isEmpty:!0,inputId:`${this.#l}-control`,descriptionId:`${this.#l}-description`,errorId:`${this.#l}-error`}),this.status=T({draftValue:``,isEmpty:!0,isValid:!0,errorMessage:null,dirty:!1}),this.#d=null,this.#f=null,this.#p=null,this.#m=null,this.#h=``,this.#g=null,this.#_=[],this.#v=!1,this.#y=``,this.#C=()=>{this.#E()}}#e;#t;#n;#r;#i;#a;#o;#s;#c;#l;#u;#d;get label(){return this.#d}set label(e){this.#d=e}#f;get description(){return this.#f}set description(e){this.#f=e}#p;get validator(){return this.#p}set validator(e){this.#p=e}#m;get theme(){return this.#m}set theme(e){this.#m=e}#h;get value(){return this.#h}set value(e){this.#h=e}#g;get placeholder(){return this.#g}set placeholder(e){this.#g=e}#_;get items(){return this.#_}set items(e){this.#_=e}#v;get disabled(){return this.#v}set disabled(e){this.#v=e}#y;get controlClassName(){return this.#y}set controlClassName(e){this.#y=e}get draftValue(){return this.status.draftValue}get isEmpty(){return this.status.isEmpty}get isValid(){return this.status.isValid}get errorMessage(){return this.status.errorMessage}createRenderRoot(){return this}connectedCallback(){super.connectedCallback(),this.#b(),this.#x(),this.#w()}disconnectedCallback(){this.#P(),this.#n?.(),this.#n=null,this.#r?.(),this.#r=null,this.#S(),super.disconnectedCallback()}render(){return F`
      <div data-role="template-host"></div>
    `}updated(e){if(e.has(`theme`)&&this.#x(),e.has(`value`)&&this.#w(),e.has(`label`)||e.has(`description`)||e.has(`theme`)){this.#E();return}(e.has(`placeholder`)||e.has(`disabled`)||e.has(`items`)||e.has(`controlClassName`))&&this.#j(),this.#T()}#b(){this.#e=an(this,`template`),this.#t=an(this,`select`)}#x(){this.#S(),this.#i=vt(this),this.#i!==null&&this.#i.addEventListener(dt,this.#C)}#S(){this.#i?.removeEventListener(dt,this.#C),this.#i=null}#C;#w(){this.status.draftValue=en(this.value),this.#T(),this.#j()}#T(){let e=tn(this.label),t=tn(this.description),n=null,r=this.validator;r!==null&&(n=r(this.status.draftValue));let i=this.status.draftValue===``,a=this.status.draftValue!==en(this.value);this.status.isEmpty=i,this.status.errorMessage=n,this.status.isValid=n===null,this.status.dirty=a,this.#u.label=e??``,this.#u.description=t??``,this.#u.errorMessage=n??``,this.#u.hideLabel=e===null,this.#u.hideDescription=t===null,this.#u.hideError=n===null,this.#u.hasError=n!==null,this.#u.isEmpty=i,this.#j()}#E(){let e=this.querySelector(`[data-role="template-host"]`);if(e===null)return;this.#n?.(),this.#n=null,this.#r?.(),this.#r=null,this.#P();let t=this.#D(`template`);if(t===null){e.replaceChildren();return}let n=t.content.cloneNode(!0);this.#n=qt(n,this.#u),e.replaceChildren(n),this.#A(),this.#T()}#D(e){return this.#O(e)??this.#k(e)??cn(e)}#O(e){return e===`template`?this.#e:this.#t}#k(e){let t=this.theme??this.#i?.theme??_t();return yt(e===`template`?t.select?.template:t.select?.select,this)}#A(){let e=this.querySelector(`[data-role="control-host"]`);if(e===null)return;let t=this.#M(e);this.#r=qt(t.fragment,this.#u),e.replaceChildren(t.fragment),this.#a=t.control,this.#o=t.className,this.#s=t.invalidClassName;let n=()=>{this.#a!==null&&(this.status.draftValue=this.#a.value,this.#T(),this.#N(`input`),this.#N(`change`))};this.#a.addEventListener(`change`,n),this.#c=()=>{this.#a?.removeEventListener(`change`,n)},this.#j()}#j(){let e=this.#a;if(e===null)return;e.replaceChildren();let t=tn(this.placeholder);if(t!==null){let n=document.createElement(`option`);n.value=``,n.textContent=t,e.appendChild(n)}for(let t of nn(this.items)){let n=document.createElement(`option`);n.value=t.value,n.textContent=t.label,n.disabled=t.disabled??!1,e.appendChild(n)}let n=Array.from(e.options).map(e=>e.value),r=n.includes(this.status.draftValue)?this.status.draftValue:t===null?n[0]??``:``;this.status.draftValue!==r&&(this.status.draftValue=r,this.#T()),e.value=r,e.id=this.#u.inputId,e.disabled=this.disabled,e.className=un(this.#o,this.controlClassName),this.#s!==null&&!this.status.isValid&&e.classList.add(this.#s),e.toggleAttribute(`aria-invalid`,!this.status.isValid),e.setAttribute(`aria-describedby`,rn(this.#u))}#M(e){let t=this.#D(`select`);if(t===null)return ln(e);let n=t.content.cloneNode(!0),r=n.querySelector(`select`);return r===null?ln(e):{fragment:n,control:r,className:on(r,e),invalidClassName:sn(r,e)}}#N(e){let t={value:this.status.draftValue,isEmpty:this.status.isEmpty,isValid:this.status.isValid,errorMessage:this.status.errorMessage,dirty:this.status.dirty};this.dispatchEvent(new CustomEvent(e,{detail:t,bubbles:!0,composed:!0}))}#P(){this.#c?.(),this.#c=null,this.#a=null,this.#o=``,this.#s=null,this.#r?.(),this.#r=null}};V([B({attribute:!1})],H.prototype,`label`,null),V([B({attribute:!1})],H.prototype,`description`,null),V([B({attribute:!1})],H.prototype,`validator`,null),V([B({attribute:!1})],H.prototype,`theme`,null),V([B({attribute:!1})],H.prototype,`value`,null),V([B({attribute:!1})],H.prototype,`placeholder`,null),V([B({attribute:!1})],H.prototype,`items`,null),V([B({attribute:!1})],H.prototype,`disabled`,null),V([B({attribute:!1})],H.prototype,`controlClassName`,null),H=V([z(`asljs-select`)],H);var $t=1;function en(e){return e??``}function tn(e){return e==null||e===``?null:e}function nn(e){return e.map(e=>({value:e.value,label:e.label,disabled:e.disabled??!1})).filter(e=>e.label.trim()!==``)}function rn(e){let t=[];return e.hideDescription||t.push(e.descriptionId),e.hideError||t.push(e.errorId),t.join(` `)}function an(e,t){let n=e.querySelector(`template[data-slot="${t}"]`);if(n===null)return null;let r=n,i=document.createElement(`template`);return i.content.append(r.content.cloneNode(!0)),i}function on(e,t){return e.className||t.getAttribute(`data-control-class`)||``}function sn(e,t){return e.getAttribute(`data-control-invalid-class`)??t.getAttribute(`data-control-invalid-class`)??null}function cn(e){let t=document.createElement(`template`);return t.innerHTML=e===`template`?`
          <div>
            <label
                   data-bind-text="label"
                   data-bind-prop-hidden="hideLabel"
                   data-bind-prop-for="inputId"></label>
            <div data-role="control-host"></div>
            <div
                 data-bind-text="description"
                 data-bind-prop-hidden="hideDescription"
                 data-bind-prop-id="descriptionId"></div>
            <div
                 data-bind-text="errorMessage"
                 data-bind-prop-hidden="hideError"
                 data-bind-prop-id="errorId"></div>
          </div>
        `:`<select></select>`,t}function ln(e){let t=document.createDocumentFragment(),n=document.createElement(`select`);return t.append(n),{fragment:t,control:n,className:on(n,e),invalidClassName:sn(n,e)}}function un(...e){return e.flatMap(e=>e.split(/\s+/)).map(e=>e.trim()).filter(e=>e!==``).join(` `)}var U=class extends R{constructor(...e){super(...e),this.#e=null,this.#t=null,this.#n=null,this.#r=null,this.#i=null,this.#a=null,this.#o=null,this.#s=``,this.#c=null,this.#l=null,this.#u=null,this.#d=null,this.#f=!1,this.#p=`asljs-text-input-${dn++}`,this.#m=T({label:``,description:``,errorMessage:``,hideLabel:!0,hideDescription:!0,hideError:!0,hasError:!1,isEmpty:!0,multiline:!1,inputId:`${this.#p}-control`,descriptionId:`${this.#p}-description`,errorId:`${this.#p}-error`}),this.status=T({draftValue:``,isEmpty:!0,isValid:!0,errorMessage:null,dirty:!1}),this.#h=null,this.#g=null,this.#_=null,this.#v=null,this.#y=``,this.#b=null,this.#x=`text`,this.#S=``,this.#C=!1,this.#w=!1,this.#T=null,this.#E=`finish`,this.#D=!1,this.#O=3,this.#M=()=>{this.#F()}}#e;#t;#n;#r;#i;#a;#o;#s;#c;#l;#u;#d;#f;#p;#m;#h;get label(){return this.#h}set label(e){this.#h=e}#g;get description(){return this.#g}set description(e){this.#g=e}#_;get validator(){return this.#_}set validator(e){this.#_=e}#v;get theme(){return this.#v}set theme(e){this.#v=e}#y;get value(){return this.#y}set value(e){this.#y=e}#b;get placeholder(){return this.#b}set placeholder(e){this.#b=e}#x;get inputType(){return this.#x}set inputType(e){this.#x=e}#S;get controlClassName(){return this.#S}set controlClassName(e){this.#S=e}#C;get multiline(){return this.#C}set multiline(e){this.#C=e}#w;get autoExtend(){return this.#w}set autoExtend(e){this.#w=e}#T;get autoExtendMaxRows(){return this.#T}set autoExtendMaxRows(e){this.#T=e}#E;get enterKeyBehavior(){return this.#E}set enterKeyBehavior(e){this.#E=e}#D;get disabled(){return this.#D}set disabled(e){this.#D=e}#O;get rows(){return this.#O}set rows(e){this.#O=e}get draftValue(){return this.status.draftValue}get isEmpty(){return this.status.isEmpty}get isValid(){return this.status.isValid}get errorMessage(){return this.status.errorMessage}createRenderRoot(){return this}connectedCallback(){super.connectedCallback(),this.#k(),this.#A(),this.#N()}disconnectedCallback(){this.#W(),this.#r?.(),this.#r=null,this.#i?.(),this.#i=null,this.#j(),super.disconnectedCallback()}render(){return F`
      <div data-role="template-host"></div>
    `}updated(e){if(e.has(`theme`)&&this.#A(),e.has(`value`)&&this.#N(),e.has(`label`)||e.has(`description`)||e.has(`multiline`)||e.has(`theme`)){this.#F();return}(e.has(`placeholder`)||e.has(`inputType`)||e.has(`controlClassName`)||e.has(`disabled`)||e.has(`rows`)||e.has(`autoExtend`)||e.has(`autoExtendMaxRows`)||e.has(`enterKeyBehavior`))&&this.#B(),this.#P()}#k(){this.#e=null,this.#t=null,this.#n=null,this.#e=gn(this,`template`),this.#t=gn(this,`input`),this.#n=gn(this,`textarea`)}#A(){this.#j(),this.#a=vt(this),this.#a!==null&&this.#a.addEventListener(dt,this.#M)}#j(){this.#a?.removeEventListener(dt,this.#M),this.#a=null}#M;#N(){let e=fn(this.value);this.status.draftValue=e,this.#P(),this.#B()}#P(){let e=pn(this.label),t=pn(this.description),n=null,r=this.validator;r!==null&&(n=r(this.status.draftValue));let i=this.status.draftValue===``,a=this.status.draftValue!==fn(this.value);this.status.isEmpty=i,this.status.errorMessage=n,this.status.isValid=n===null,this.status.dirty=a,this.#m.label=e??``,this.#m.description=t??``,this.#m.errorMessage=n??``,this.#m.hideLabel=e===null,this.#m.hideDescription=t===null,this.#m.hideError=n===null,this.#m.hasError=n!==null,this.#m.isEmpty=i,this.#m.multiline=this.multiline,this.#B()}#F(){let e=this.querySelector(`[data-role="template-host"]`);if(e===null)return;this.#r?.(),this.#r=null,this.#i?.(),this.#i=null,this.#W();let t=this.#I(`template`);if(t===null){e.replaceChildren();return}let n=t.content.cloneNode(!0);this.#r=qt(n,this.#m),e.replaceChildren(n),this.#z(),this.#P()}#I(e){return this.#L(e)??this.#R(e)??yn()}#L(e){switch(e){case`template`:return this.#e;case`input`:return this.#t;case`textarea`:return this.#n}}#R(e){let t=this.theme??this.#a?.theme??_t();return yt(e===`template`?t.textInput?.template:e===`input`?t.textInput?.input:t.textInput?.textarea,this)}#z(){let e=this.querySelector(`[data-role="control-host"]`);if(e===null)return;let t=this.#V(e),n=t.control;this.#i=qt(t.fragment,this.#m),e.replaceChildren(t.fragment),this.#o=n,this.#s=t.className,this.#c=t.invalidClassName;let r=()=>{this.status.draftValue=n.value,this.#P(),this.#U(`input`)},i=()=>{if(this.#f){this.#f=!1;return}this.#U(`change`)},a=e=>{let t=e;t.key===`Enter`&&(this.multiline&&!t.ctrlKey&&!t.metaKey&&this.enterKeyBehavior===`newline`||(t.preventDefault(),this.#f=!0,this.#U(`change`),n.blur()))};n.addEventListener(`input`,r),n.addEventListener(`blur`,i),n.addEventListener(`keydown`,a),this.#l=()=>{n.removeEventListener(`input`,r)},this.#u=()=>{n.removeEventListener(`blur`,i)},this.#d=()=>{n.removeEventListener(`keydown`,a)},this.#B()}#B(){let e=this.#o;if(e===null)return;e.value!==this.status.draftValue&&(e.value=this.status.draftValue),e.id=this.#m.inputId,e.placeholder=pn(this.placeholder)??``,e.disabled=this.disabled,e.className=wn(this.#s,this.controlClassName);let t=this.#c;if(e instanceof HTMLInputElement&&(e.type=this.inputType),t!==null&&!this.status.isValid&&e.classList.add(t),e.toggleAttribute(`aria-invalid`,!this.status.isValid),e.setAttribute(`aria-describedby`,mn(this.#m)),this.multiline&&e instanceof HTMLTextAreaElement){e.rows=Math.max(1,this.rows),this.#H(e);return}e.style.height=``,e.style.overflowY=``}#V(e){let t=this.multiline?`textarea`:`input`,n=this.#I(t);if(n===null)return Cn(this.multiline,e);let r=n.content.cloneNode(!0),i=this.multiline?r.querySelector(`textarea`):r.querySelector(`input`);return i===null?Cn(this.multiline,e):{fragment:r,control:i,className:_n(i,e),invalidClassName:vn(i,e)}}#H(e){if(!this.autoExtend){e.style.height=``,e.style.overflowY=``;return}e.style.height=`auto`;let t=hn(e,this.autoExtendMaxRows),n=t===null?e.scrollHeight:Math.min(e.scrollHeight,t);e.style.height=`${n}px`,e.style.overflowY=t!==null&&e.scrollHeight>t?`auto`:`hidden`}#U(e){let t={value:this.status.draftValue,isEmpty:this.status.isEmpty,isValid:this.status.isValid,errorMessage:this.status.errorMessage,dirty:this.status.dirty};this.dispatchEvent(new CustomEvent(e,{detail:t,bubbles:!0,composed:!0}))}#W(){this.#l?.(),this.#u?.(),this.#d?.(),this.#l=null,this.#u=null,this.#d=null,this.#o=null,this.#s=``,this.#c=null,this.#i?.(),this.#i=null}};V([B({attribute:!1})],U.prototype,`label`,null),V([B({attribute:!1})],U.prototype,`description`,null),V([B({attribute:!1})],U.prototype,`validator`,null),V([B({attribute:!1})],U.prototype,`theme`,null),V([B({attribute:!1})],U.prototype,`value`,null),V([B({attribute:!1})],U.prototype,`placeholder`,null),V([B({attribute:!1})],U.prototype,`inputType`,null),V([B({attribute:!1})],U.prototype,`controlClassName`,null),V([B({attribute:!1})],U.prototype,`multiline`,null),V([B({attribute:!1})],U.prototype,`autoExtend`,null),V([B({attribute:!1})],U.prototype,`autoExtendMaxRows`,null),V([B({attribute:!1})],U.prototype,`enterKeyBehavior`,null),V([B({attribute:!1})],U.prototype,`disabled`,null),V([B({attribute:!1})],U.prototype,`rows`,null),U=V([z(`asljs-text-input`)],U);var dn=1;function fn(e){return e??``}function pn(e){return e==null||e===``?null:e}function mn(e){let t=[];return e.hideDescription||t.push(e.descriptionId),e.hideError||t.push(e.errorId),t.join(` `)}function hn(e,t){if(t===null||t<=0)return null;let n=getComputedStyle(e),r=parseFloat(n.lineHeight);if(!Number.isFinite(r)||r<=0)return null;let i=parseFloat(n.borderTopWidth)||0,a=parseFloat(n.borderBottomWidth)||0,o=parseFloat(n.paddingTop)||0,s=parseFloat(n.paddingBottom)||0;return r*t+o+s+i+a}function gn(e,t){let n=e.querySelector(`template[data-slot="${t}"]`);if(n===null)return null;let r=n,i=document.createElement(`template`);return i.content.append(r.content.cloneNode(!0)),i}function _n(e,t){return e.className||t.getAttribute(`data-control-class`)||``}function vn(e,t){return e.getAttribute(`data-control-invalid-class`)??t.getAttribute(`data-control-invalid-class`)??null}function yn(){let e=document.createElement(`template`);return e.innerHTML=`
      <div>
        <label
               data-bind-text="label"
               data-bind-prop-hidden="hideLabel"
               data-bind-prop-for="inputId"></label>
        <div data-role="control-host"></div>
        <div
             data-bind-text="description"
             data-bind-prop-hidden="hideDescription"
             data-bind-prop-id="descriptionId"></div>
        <div
             data-bind-text="errorMessage"
             data-bind-prop-hidden="hideError"
             data-bind-prop-id="errorId"></div>
      </div>
    `,e}function bn(){let e=document.createElement(`input`);return e.type=`text`,e}function xn(){let e=document.createElement(`template`);return e.innerHTML=`<input type="text">`,e}function Sn(){let e=document.createElement(`template`);return e.innerHTML=`<textarea></textarea>`,e}function Cn(e,t){let n=document.createDocumentFragment(),r=(e?Sn():xn()).content.cloneNode(!0),i=e?r.querySelector(`textarea`):r.querySelector(`input`);if(i===null){let r=e?document.createElement(`textarea`):bn();return n.append(r),{fragment:n,control:r,className:_n(r,t),invalidClassName:vn(r,t)}}return n.append(r),{fragment:n,control:i,className:_n(i,t),invalidClassName:vn(i,t)}}function wn(...e){return e.flatMap(e=>e.split(/\s+/)).map(e=>e.trim()).filter(e=>e!==``).join(` `)}var Tn=24,En=`gpt-4.1-mini`,Dn=`OpenAI API key is not configured.`,On=6,kn=12,An=new WeakMap,jn=class{#e;constructor(e){this.#e=e}async postRequest(e){let t=await fetch(`https://api.openai.com/v1/responses`,{method:`POST`,headers:{"Content-Type":`application/json`,Authorization:`Bearer ${this.#e}`},body:JSON.stringify(e)});if(!t.ok){let e=await t.text();throw Error(`OpenAI request failed: ${t.status} ${e}`)}return await t.json()}};function Mn(e={}){let t=Kn(e.choicePrompt),n=qn(e.progress),r=T({messages:Nn(e.messages),promptDraft:e.promptDraft??``,messagesScrollTop:e.messagesScrollTop??0,hasMessagesScrollTop:e.hasMessagesScrollTop??!1,missingKeyMessageShown:e.missingKeyMessageShown??!1,lastResponseId:e.lastResponseId??null,choicePrompt:t===void 0?null:{message:t.message,options:t.options.map(e=>({value:e.value,label:e.label}))},progress:n===void 0?null:{message:n.message,visible:n.visible},sending:e.sending===!0});return An.set(r,{behavior:t?.behavior??`resolve`,resolver:null}),Object.defineProperties(r,{appendMessage:In((e,t)=>{r.messages.save(e,t)}),clearMessages:In(()=>{r.messages.clear(),r.lastResponseId=null}),clearProgress:In(()=>{r.progress=null}),dismissChoices:In(()=>{Rn(r,null)}),presentChoices:In(async(e,t,n=`resolve`)=>{let i=Ln(t);if(Rn(r,null),i.length===0)return r.choicePrompt=null,null;r.choicePrompt={message:e,options:i};let a=zn(r);return a.behavior=n,n===`send`?(a.resolver=null,null):new Promise(e=>{a.resolver=e})}),setProgress:In((e,t=!0)=>{r.progress=t?{message:e,visible:!0}:null})}),r}function Nn(e){let t=T((e??[]).map(e=>({role:e.role,content:e.content})));return{list:t,read:()=>t,save:(e,n)=>{t.push({role:e,content:n})},clear:()=>{t.splice(0,t.length)},toResponsesInput:()=>t.filter(e=>e.role===`user`||e.role===`assistant`).slice(-24).map(e=>({role:e.role,content:e.content}))}}function Pn(e){let t=e.choicePrompt,n=e.progress;return{messages:e.messages.read().map(e=>({role:e.role,content:e.content})),promptDraft:e.promptDraft,messagesScrollTop:e.messagesScrollTop,hasMessagesScrollTop:e.hasMessagesScrollTop,missingKeyMessageShown:e.missingKeyMessageShown,lastResponseId:e.lastResponseId,choicePrompt:t===null?null:{message:t.message,options:t.options.map(e=>({value:e.value,label:e.label})),behavior:zn(e).behavior},progress:n===null?null:{message:n.message,visible:n.visible},sending:e.sending}}var Fn=class extends R{#e=null;#t=Mn();#n=()=>{};#r=0;#i=!1;#a=!1;#o=null;get options(){return this.#o}set options(e){this.#o=e}get messages(){return this.#t.messages}set messages(e){this.#b(`messages`,e)}get promptDraft(){return this.#t.promptDraft}set promptDraft(e){this.#b(`promptDraft`,e)}get messagesScrollTop(){return this.#t.messagesScrollTop}set messagesScrollTop(e){this.#b(`messagesScrollTop`,e)}get hasMessagesScrollTop(){return this.#t.hasMessagesScrollTop}set hasMessagesScrollTop(e){this.#b(`hasMessagesScrollTop`,e)}get missingKeyMessageShown(){return this.#t.missingKeyMessageShown}set missingKeyMessageShown(e){this.#b(`missingKeyMessageShown`,e)}get lastResponseId(){return this.#t.lastResponseId}set lastResponseId(e){this.#b(`lastResponseId`,e)}get choicePrompt(){return this.#t.choicePrompt}set choicePrompt(e){this.#b(`choicePrompt`,e)}get progress(){return this.#t.progress}set progress(e){this.#b(`progress`,e)}get sending(){return this.#t.sending}set sending(e){this.#b(`sending`,e)}createRenderRoot(){return this}connectedCallback(){super.connectedCallback(),this.#s()}disconnectedCallback(){this.#c(),super.disconnectedCallback()}updated(e){e.has(`options`)&&this.#s(),this.#l()}render(){let e=this.#t,t=e.progress,n=e.choicePrompt;return F`
      <div class="asljs-ai-chat"
           style="display:flex;
                  flex-direction:column;
                  gap:0.75rem;
                  height:100%;
                  min-height:0;">
        <div class="asljs-ai-chat-window"
             data-role="window"
             style="display:flex;
                    flex-direction:column;
                    gap:0.75rem;
                    flex:1 1 auto;
                    min-height:12em;
                    overflow:hidden;">
          <div class="asljs-ai-chat-messages"
               data-role="messages"
               @scroll=${this.#p}
               style="display:flex;
                      flex-direction:column;
                      gap:0.75rem;
                      flex:1 1 auto;
                      overflow:auto;">
            ${e.messages.read().map(e=>F`
                  <div class=${`asljs-ai-chat-message asljs-ai-chat-message-${e.role}`}>
                    <div class="asljs-ai-chat-role">
                      ${e.role===`user`?`You`:e.role===`assistant`?`AI`:`System`}
                    </div>
                    <div class="asljs-ai-chat-bubble">
                      ${e.role===`assistant`?lt(er(e.content,this.options?.renderAssistantMessage)):e.content}
                    </div>
                  </div>
                `)}
          </div>
          <div class="asljs-ai-chat-progress"
               data-role="progress"
               style=${t===null||!t.visible?`display:none;`:``}>
            ${t?.message??``}
          </div>
          <div class="asljs-ai-chat-choice-panel"
               data-role="choices"
               style=${n===null||n.message.trim()===``||n.options.length===0?`display:none;`:``}>
            ${n===null||n.message.trim()===``||n.options.length===0?I:F`
                    <div class="asljs-ai-chat-choice-message">
                      ${n.message}
                    </div>
                    <div class="asljs-ai-chat-choice-options">
                      <asljs-select
                          data-role="choice-select"
                          .items=${n.options}
                          .value=${this.#v(n)}
                          .placeholder=${null}
                          .label=${null}
                          .disabled=${e.sending}
                          .controlClassName=${`asljs-ai-chat-select`}>
                      </asljs-select>
                      <asljs-button
                          data-role="choice-submit"
                          .type=${`button`}
                          .text=${zn(e).behavior===`send`?`Send`:`Choose`}
                          .disabled=${e.sending}
                          .buttonClassName=${tr(this,`asljs-ai-chat-button`,`asljs-ai-chat-choice-submit`)}
                          @click=${this.#_}>
                      </asljs-button>
                    </div>
                  `}
          </div>
        </div>
        <asljs-text-input
            data-role="prompt"
            .value=${e.promptDraft}
            .multiline=${!0}
            .rows=${3}
            .placeholder=${`Ask AI...`}
            .enterKeyBehavior=${`newline`}
            .disabled=${e.sending}
            .controlClassName=${`asljs-ai-chat-input`}
            @input=${this.#m}
            @keydown=${this.#h}>
        </asljs-text-input>
        <div class="asljs-ai-chat-actions"
             style="display:flex;
                    justify-content:flex-end;">
          <asljs-button
              data-role="send"
              .type=${`button`}
              .text=${`Send`}
              .disabled=${e.sending}
              .buttonClassName=${tr(this,`asljs-ai-chat-button`,`asljs-ai-chat-send`)}
              @click=${this.#g}>
          </asljs-button>
        </div>
      </div>
    `}async#s(){let e=this.#t,t=this.options?.stateStore??Wn(Hn(this)),n=++this.#r;this.#c(),this.#n=Vn(e,t),!(t&&(Bn(e,await t.load()),n!==this.#r))&&(this.#e=Jn(e,()=>{this.#i=!0,this.requestUpdate()},()=>{this.requestUpdate()},()=>{this.requestUpdate()},()=>{this.requestUpdate()},this.#n),await e.emitAsync(`initialize`,{model:e}),n===this.#r&&(this.#i=!0,this.requestUpdate()))}#c(){this.#e?.dispose(),this.#e=null,this.#n=()=>{}}#l(){let e=this.#u;if(e!==null){if(this.#a){this.#a=!1,e.scrollTop=e.scrollHeight,this.#p();return}this.#i&&(this.#i=!1,this.#t.hasMessagesScrollTop&&(e.scrollTop=this.#t.messagesScrollTop))}}get#u(){return this.querySelector(`[data-role="messages"]`)}get#d(){return this.querySelector(`[data-role="prompt"]`)}get#f(){return this.querySelector(`[data-role="choice-select"]`)}#p=()=>{let e=this.#u;e!==null&&(this.#t.messagesScrollTop=e.scrollTop,this.#t.hasMessagesScrollTop=!0,this.#n())};#m=()=>{this.#t.promptDraft=this.#d?.draftValue??``,this.#n()};#h=e=>{let t=e;t.key!==`Enter`||t.shiftKey||t.ctrlKey||t.metaKey||(t.preventDefault(),this.#y())};#g=()=>{this.#y()};#_=()=>{let e=(this.#f?.value??``).trim();if(e===``)return;let t=zn(this.#t).behavior;Rn(this.#t,t===`resolve`?e:null),this.#n(),t===`send`&&this.#y(e)};#v(e){let t=(this.#f?.value??``).trim();return e.options.some(e=>e.value===t)?t:e.options[0]?.value??``}async#y(e){let t=this.options,n=this.#t;if(t===null)return;let r=(e??this.#d?.draftValue??this.#d?.value??``).trim();if(r===``||n.sending)return;let i=t.transport??null;if(i===null){let e=(await t.provider.getOpenAiApiKey()).trim();if(e===``){n.missingKeyMessageShown||(n.appendMessage(`system`,t.missingKeyMessage??Dn),n.missingKeyMessageShown=!0,this.#n());return}i=new jn(e)}let a=(await t.provider.getChatModel()).trim()||En,o=await t.getRequestContext(),s=Yn(n,r,o,a);if(await n.emitAsync(`beforeSend`,s),s.canceled){s.cancelMessage!==null&&s.cancelMessage!==``&&n.appendMessage(`system`,s.cancelMessage),this.#n();return}let c=this.#u,l=(c===null?0:c.scrollHeight-(c.scrollTop+c.clientHeight))<=Tn;n.appendMessage(`user`,r),n.promptDraft=``,n.sending=!0,n.dismissChoices(),l&&(this.#a=!0),this.#n();try{n.setProgress(`Requesting assistant response...`);let e=await t.buildRequestInput({model:n,prompt:r,messages:n.messages,requestContext:o,chatModel:a}),s=await Xn(i,a,e,t.getTools?.()??[],n,t.executeTool,t.getToolsContext?await t.getToolsContext():void 0,t.provider,t.toolStepExtension??kn,n.lastResponseId),c=s.text;n.appendMessage(`assistant`,c),n.lastResponseId=s.responseId,await n.emitAsync(`afterResponse`,{model:n,prompt:r,responseText:c,requestContext:o,requestInput:e,chatModel:a})}catch(e){n.appendMessage(`system`,`Failed to send message: ${String(e)}`)}finally{n.sending=!1,n.clearProgress(),this.#n()}}#b(e,t){let n=this.#t;Object.is(n[e],t)||(n[e]=t,this.requestUpdate())}};V([B({attribute:!1})],Fn.prototype,`options`,null),Fn=V([z(`asljs-ai-chat`)],Fn);function In(e){return{value:e,enumerable:!1,configurable:!0,writable:!0}}function Ln(e){return e.map(e=>typeof e==`string`?{value:e,label:e}:{value:e.value,label:e.label}).filter(e=>e.value.trim()!==``&&e.label.trim()!==``)}function Rn(e,t){let n=zn(e),r=n.resolver;e.choicePrompt=null,n.resolver=null,n.behavior=`resolve`,r?.(t)}function zn(e){let t=An.get(e);if(t===void 0)throw Error(`AI chat model internal state is missing.`);return t}function Bn(e,t){if(Array.isArray(t.messages)&&e.messages.list.splice(0,e.messages.list.length,...t.messages.map(e=>({role:e.role,content:e.content}))),typeof t.promptDraft==`string`&&(e.promptDraft=t.promptDraft),typeof t.messagesScrollTop==`number`&&(e.messagesScrollTop=t.messagesScrollTop),typeof t.hasMessagesScrollTop==`boolean`&&(e.hasMessagesScrollTop=t.hasMessagesScrollTop),typeof t.missingKeyMessageShown==`boolean`&&(e.missingKeyMessageShown=t.missingKeyMessageShown),typeof t.lastResponseId==`string`?e.lastResponseId=t.lastResponseId:t.lastResponseId===null&&(e.lastResponseId=null),t.choicePrompt===null)Rn(e,null);else if(t.choicePrompt!==void 0){let n=zn(e);n.resolver=null,n.behavior=t.choicePrompt.behavior,e.choicePrompt={message:t.choicePrompt.message,options:t.choicePrompt.options.map(e=>({value:e.value,label:e.label}))}}t.progress===null?e.progress=null:t.progress!==void 0&&(e.progress={message:t.progress.message,visible:t.progress.visible}),typeof t.sending==`boolean`&&(e.sending=t.sending)}function Vn(e,t){if(t===void 0)return()=>{};let n=!1;return()=>{n||(n=!0,queueMicrotask(()=>{n=!1,t.save(Pn(e))}))}}function Hn(e){return`asljs-ai-chat:${typeof location<`u`&&location!==null&&typeof location.pathname==`string`?encodeURIComponent(location.pathname):``}:${e.id.trim()===``?`default-${Un(e)}`:encodeURIComponent(e.id.trim())}`}function Un(e){if(typeof document>`u`)return 0;let t=[...document.querySelectorAll(`asljs-ai-chat`)].indexOf(e);return t>=0?t:0}function Wn(e){if(!(typeof sessionStorage>`u`))return{load:async()=>{try{let t=sessionStorage.getItem(e);return!t||t.trim()===``?{}:Gn(JSON.parse(t))}catch{return{}}},save:async t=>{sessionStorage.setItem(e,JSON.stringify(t))}}}function Gn(e){if(!e||typeof e!=`object`)return{};let t=e;return{messages:Array.isArray(t.messages)?t.messages.filter(e=>!!e&&typeof e==`object`&&(e.role===`user`||e.role===`assistant`||e.role===`system`)&&typeof e.content==`string`).map(e=>({role:e.role,content:e.content})):void 0,promptDraft:typeof t.promptDraft==`string`?t.promptDraft:void 0,messagesScrollTop:typeof t.messagesScrollTop==`number`?t.messagesScrollTop:void 0,hasMessagesScrollTop:typeof t.hasMessagesScrollTop==`boolean`?t.hasMessagesScrollTop:void 0,missingKeyMessageShown:typeof t.missingKeyMessageShown==`boolean`?t.missingKeyMessageShown:void 0,lastResponseId:typeof t.lastResponseId==`string`||t.lastResponseId===null?t.lastResponseId:void 0,choicePrompt:t.choicePrompt===null?null:Kn(t.choicePrompt),progress:t.progress===null?null:qn(t.progress),sending:typeof t.sending==`boolean`?t.sending:void 0}}function Kn(e){if(!e||typeof e!=`object`)return;let t=e;if(typeof t.message!=`string`||!Array.isArray(t.options))return;let n=t.behavior===`resolve`||t.behavior===`send`?t.behavior:void 0;if(n===void 0)return;let r=t.options.filter(e=>!!e&&typeof e==`object`&&typeof e.value==`string`&&typeof e.label==`string`).map(e=>({value:e.value,label:e.label})).filter(e=>e.value.trim()!==``&&e.label.trim()!==``);return{message:t.message,options:r,behavior:n}}function qn(e){if(!e||typeof e!=`object`)return;let t=e;if(!(typeof t.message!=`string`||typeof t.visible!=`boolean`))return{message:t.message,visible:t.visible}}function Jn(e,t,n,r,i,a){let o=[],s=[],c=()=>{let n=e.messages.list;for(let e of s)e();s=[n.on(`set`,()=>{t(),a()}),n.on(`delete`,()=>{t(),a()}),n.on(`define`,()=>{t(),a()})]};return c(),o.push(e.on(`set:messages`,()=>{c(),t(),a()}),e.on(`set:progress`,()=>{n(),a()}),e.on(`set:choicePrompt`,()=>{r(),a()}),e.on(`set:promptDraft`,()=>{a()}),e.on(`set:missingKeyMessageShown`,()=>{a()}),e.on(`set:messagesScrollTop`,()=>{a()}),e.on(`set:hasMessagesScrollTop`,()=>{a()}),e.on(`set:lastResponseId`,()=>{a()}),e.on(`set:sending`,()=>{i(),a()})),{dispose:()=>{for(let e of s)e();for(let e of o)e()}}}function Yn(e,t,n,r){let i={model:e,prompt:t,requestContext:n,chatModel:r,apiKey:``,canceled:!1,cancelMessage:null,cancel:e=>{i.canceled=!0,i.cancelMessage=typeof e==`string`?e:null}};return i}async function Xn(e,t,n,r,i,a,o,s,c,l){let u={model:t,input:n,tools:r};l&&(u.previous_response_id=l);let d=await e.postRequest(u),f=await Zn(s),p=0;for(;;){let n=(Array.isArray(d.output)?d.output:[]).filter(e=>$n(e));if(n.length===0)return i.setProgress(`Completed in ${p} step(s).`),{text:rr(d),responseId:typeof d.id==`string`?d.id:null};if(a===void 0)throw Error(`Response requested function tools, but no executeTool callback was provided.`);if(p>=f){if(!await Qn(i,p,f,c))throw Error(`AI exceeded the current tool step limit.`);f+=c}let s=p+1;i.setProgress(`Step ${s}: running ${n.length} tool call(s)...`);let l=[];for(let e of n)try{let t=await a(String(e.name??``),String(e.arguments??``),o);l.push({type:`function_call_output`,call_id:e.call_id,output:typeof t==`string`?t:JSON.stringify(t)})}catch(t){l.push({type:`function_call_output`,call_id:e.call_id,output:JSON.stringify({error:String(t)})})}i.setProgress(`Step ${s}: submitting ${l.length} tool result(s)...`),d=await e.postRequest({model:t,previous_response_id:d.id,input:l,tools:r}),p+=1}}async function Zn(e){let t=await e.getInitialToolStepLimit?.()??null;if(!Number.isFinite(t))return On;let n=Math.floor(t);return n>=1?n:On}async function Qn(e,t,n,r){let i={model:e,stepsCompleted:t,stepLimit:n,extension:r,approved:null,approve:()=>{i.approved=!0},deny:()=>{i.approved=!1}};return await e.emitAsync(`toolStepLimit`,i),i.approved===null?await e.presentChoices(`AI reached the current tool step limit (${n}). Extend by ${r} more step(s)?`,[{value:`extend`,label:`Extend`},{value:`stop`,label:`Stop`}],`resolve`)===`extend`:i.approved}function $n(e){return!e||typeof e!=`object`?!1:e.type===`function_call`}function er(e,t){if(!t)return nr(e);try{return t(e)}catch{return nr(e)}}function tr(e,...t){return[bt(vt(e)?.theme?.button?.className,e)??bt(_t().button?.className,e)??``,...t].flatMap(e=>e.split(/\s+/u)).map(e=>e.trim()).filter((e,t,n)=>e!==``&&n.indexOf(e)===t).join(` `)}function nr(e){return e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`)}function rr(e){if(typeof e.output_text==`string`&&e.output_text!==``)return e.output_text;let t=Array.isArray(e.output)?e.output:[];for(let e of t){if(!e||typeof e!=`object`||e.type!==`message`)continue;let t=(Array.isArray(e.content)?e.content:[]).filter(e=>!!e&&typeof e==`object`&&(e.type===`output_text`||e.type===`text`)).map(e=>e.text).filter(e=>typeof e==`string`);if(t.length>0)return t.join(`
`)}return`No response text returned.`}var ir=class extends R{#e=`OpenAI API Key`;get label(){return this.#e}set label(e){this.#e=e}#t=`sk-…`;get placeholder(){return this.#t}set placeholder(e){this.#t=e}#n=`Save key`;get submitLabel(){return this.#n}set submitLabel(e){this.#n=e}#r=!1;get disabled(){return this.#r}set disabled(e){this.#r=e}createRenderRoot(){return this}render(){return F`
      <div class="asljs-ai-chat-key">
        <div class="asljs-ai-chat-key-label">
          ${this.label}
        </div>
        <div class="asljs-ai-chat-key-controls"
             style="display:flex;
                    gap:0.5rem;
                    align-items:flex-end;">
          <asljs-text-input
              data-role="key-input"
              .placeholder=${this.placeholder}
              .inputType=${`password`}
              .disabled=${this.disabled}
              @keydown=${this.#i}>
          </asljs-text-input>
          <asljs-button
              .text=${this.submitLabel}
              .disabled=${this.disabled}
              @click=${this.#a}>
          </asljs-button>
        </div>
      </div>
    `}#i=e=>{let t=e;t.key===`Enter`&&(t.preventDefault(),this.#o())};#a=()=>{this.#o()};#o(){let e=(this.querySelector(`[data-role="key-input"]`)?.draftValue??``).trim();e!==``&&this.dispatchEvent(new CustomEvent(`key-submit`,{detail:{key:e},bubbles:!0,composed:!0}))}};V([B({attribute:!1})],ir.prototype,`label`,null),V([B({attribute:!1})],ir.prototype,`placeholder`,null),V([B({attribute:!1})],ir.prototype,`submitLabel`,null),V([B({type:Boolean,attribute:!1})],ir.prototype,`disabled`,null),ir=V([z(`asljs-ai-chat-key`)],ir);var ar=[{value:`yes`,label:`Yes`},{value:`no`,label:`No`}],or={name:`PropertiesModelDefinition`,title:`Properties`,properties:[{name:`definition`,title:`Definition`,type:`object`,description:`Component model definition that drives the generated form.`},{name:`target`,title:`Target`,type:`object`,description:`Target object updated by the generated controls.`},{name:`theme`,title:`Theme`,type:`object`,description:`Theme forwarded to nested controls.`}]},sr=class extends R{static{this.modelDefinition=or}#e=null;get definition(){return this.#e}set definition(e){this.#e=e}#t=null;get target(){return this.#t}set target(e){this.#t=e}#n=null;get theme(){return this.#n}set theme(e){this.#n=e}createRenderRoot(){return this}render(){return this.definition===null||this.target===null?F``:F`
      <div class="asljs-properties"
           style="display:grid;gap:0.75rem;">
        ${this.definition.properties.map(e=>this.#r(e))}
      </div>
    `}#r(e){let t=this.target?.[e.name],n=e.title??e.name,r=e.description??`Type: ${e.type}`,i=e.editable??dr(e.type);return e.type===`boolean`?F`
        <asljs-select
            data-property-name=${e.name}
            .theme=${this.theme}
            .label=${n}
            .description=${r}
            .items=${ar}
            .value=${t===!0?`yes`:`no`}
            .disabled=${!i}
            @input=${t=>this.#i(e,t)}>
        </asljs-select>
      `:F`
      <asljs-text-input
          data-property-name=${e.name}
          .theme=${this.theme}
          .label=${n}
          .description=${r}
          .value=${ur(e.type,t)}
          .inputType=${e.type===`number`?`number`:`text`}
          .disabled=${!i}
          @input=${t=>this.#a(e,t)}>
      </asljs-text-input>
    `}#i(e,t){if(this.target===null||e.editable===!1)return;let n=t.detail,r=t.currentTarget,i=n?.value??r?.draftValue;i!==void 0&&(this.target[e.name]=i===`yes`,this.requestUpdate())}#a(e,t){if(this.target===null||e.editable===!1)return;let n=t.detail,r=t.currentTarget,i=n?.value??r?.draftValue;if(i===void 0)return;let a=lr(e.type,i,this.target[e.name]);a!==cr&&(this.target[e.name]=a,this.requestUpdate())}};V([B({attribute:!1})],sr.prototype,`definition`,null),V([B({attribute:!1})],sr.prototype,`target`,null),V([B({attribute:!1})],sr.prototype,`theme`,null),sr=V([z(`asljs-properties`)],sr);var cr=Symbol(`unchangedValue`);function lr(e,t,n){if(e===`number`){if(t.trim()===``)return cr;let e=Number(t);return Number.isFinite(e)?e:cr}return e===`string`?t:n}function ur(e,t){return e===`string`||e===`number`?t==null?``:String(t):e===`array`?Array.isArray(t)?`[${t.length} items]`:`[]`:e===`function`?typeof t==`function`?`[Function]`:``:e===`object`?t==null?``:`[Object]`:t===!0?`Yes`:`No`}function dr(e){return e===`boolean`||e===`number`||e===`string`}var fr=class extends R{#e=null;#t=0;#n=null;get provider(){return this.#n}set provider(e){this.#n=e}#r=[];get handlers(){return this.#r}set handlers(e){this.#r=e}#i=null;get fileName(){return this.#i}set fileName(e){this.#i=e}createRenderRoot(){return this}disconnectedCallback(){this.#o(),super.disconnectedCallback()}render(){return F`
      <div data-role="content"></div>
    `}updated(e){(e.has(`provider`)||e.has(`handlers`)||e.has(`fileName`))&&this.#a()}async#a(){let e=++this.#t;this.#o();let t=this.querySelector(`[data-role="content"]`);if(t===null)return;if(this.fileName===null||this.fileName.trim()===``){t.replaceChildren(_r(`Select a file to preview.`));return}let n=this.provider;if(n===null){t.replaceChildren(_r(`File provider is not configured.`));return}t.replaceChildren(_r(`Loading preview...`));let r=await n.loadFile(this.fileName);if(e!==this.#t)return;if(r===null){t.replaceChildren(_r(`File content is not available.`));return}let i=await gr(this.handlers,r);if(e!==this.#t)return;if(i===null){let e=yr(r);this.#e={dispose:e.dispose},t.replaceChildren(e.element);return}let a=await i.render({file:r,fileName:this.fileName,provider:n});if(e!==this.#t){a.dispose?.();return}this.#e={dispose:a.dispose},t.replaceChildren(a.element)}#o(){this.#e?.dispose?.(),this.#e=null}};V([B({attribute:!1})],fr.prototype,`provider`,null),V([B({attribute:!1})],fr.prototype,`handlers`,null),V([B({attribute:!1})],fr.prototype,`fileName`,null),fr=V([z(`asljs-file`)],fr);function pr(){return{canDisplay:e=>Sr(e),render:async({file:e})=>{let t=await br(e);if(t===null)return vr();let n=document.createElement(`iframe`);return n.src=`${t.url}#toolbar=1&navpanes=0`,n.title=e.name,n.referrerPolicy=`no-referrer`,n.style.width=`100%`,n.style.height=`100%`,n.style.minHeight=`32rem`,n.style.border=`0`,{element:n,dispose:t.dispose}}}}function mr(){return{canDisplay:e=>Cr(e),render:async({file:e})=>{let t=await br(e);if(t===null)return vr();let n=document.createElement(`img`);return n.src=t.url,n.alt=e.name,n.style.display=`block`,n.style.maxWidth=`100%`,n.style.maxHeight=`100%`,n.style.objectFit=`contain`,{element:n,dispose:t.dispose}}}}function hr(){return{canDisplay:e=>wr(e),render:async({file:e,fileName:t,provider:n})=>{let r=await xr(e);if(r===null)return vr();let i=document.createElement(`textarea`);return i.value=r,i.disabled=n.saveText===void 0,i.spellcheck=!1,i.style.width=`100%`,i.style.height=`100%`,i.style.minHeight=`16rem`,i.style.border=`0`,i.style.resize=`none`,i.style.padding=`0.75rem`,i.style.fontFamily=`SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace`,i.style.fontSize=`0.8rem`,i.style.lineHeight=`1.6`,i.style.boxSizing=`border-box`,n.saveText!==void 0&&i.addEventListener(`blur`,()=>{n.saveText?.(t,i.value)}),{element:i}}}}async function gr(e,t){for(let n of e)if(await n.canDisplay(t))return n;return null}function _r(e){let t=document.createElement(`div`);return t.textContent=e,t.style.color=`var(--bs-secondary-color, #6c757d)`,t}function vr(){return{element:_r(`Preview unavailable for this file type.`)}}function yr(e){let t=document.createElement(`div`);t.style.display=`flex`,t.style.alignItems=`center`,t.style.gap=`0.5rem`;let n=_r(`Preview unavailable for this file type.`);if(t.appendChild(n),e.blob||e.dataUrl){let n=document.createElement(`a`);if(n.textContent=`Open`,n.target=`_blank`,n.rel=`noopener noreferrer`,e.dataUrl)return n.href=e.dataUrl,t.appendChild(n),{element:t};let r=URL.createObjectURL(e.blob);return n.href=r,t.appendChild(n),{element:t,dispose:()=>{URL.revokeObjectURL(r)}}}return{element:t}}async function br(e){if(e.dataUrl)return{url:e.dataUrl};if(e.blob){if(Sr(e)&&Tr(e.mimeType??e.blob.type)!==`application/pdf`){let t=new Blob([await e.blob.arrayBuffer()],{type:`application/pdf`}),n=URL.createObjectURL(t);return{url:n,dispose:()=>{URL.revokeObjectURL(n)}}}let t=URL.createObjectURL(e.blob);return{url:t,dispose:()=>{URL.revokeObjectURL(t)}}}return null}async function xr(e){return typeof e.text==`string`?e.text:e.blob&&wr(e)?await e.blob.text():null}function Sr(e){return Tr(e.mimeType??e.blob?.type)===`application/pdf`||Er(e).endsWith(`.pdf`)}function Cr(e){return Tr(e.mimeType??e.blob?.type).startsWith(`image/`)||/\.(png|jpg|jpeg|gif|webp|svg)$/i.test(e.name)}function wr(e){if(typeof e.text==`string`)return!0;let t=Tr(e.mimeType??e.blob?.type);return t.startsWith(`text/`)||[`application/json`,`application/xml`,`image/svg+xml`].includes(t)||/\.(txt|csv|json|xml|html|htm|md|markdown|svg)$/i.test(e.name)}function Tr(e){return(e??``).trim().toLowerCase()}function Er(e){return e.name.toLowerCase()}var Dr=[{name:`characters`,title:`Characters`,type:`string`,description:`Allowed single-character keys. Empty means no filter.`}],Or=class extends R{constructor(...e){super(...e),this.#e=``,this.handleAssistedInputButtonClick=e=>{let t=e.currentTarget;if(t===null||t.disabled)return;let n=t.getAttribute(`data-action`);if(n!==null&&n!==``&&this.handleAction(n,e,t))return;let r=t.getAttribute(`data-key`);if(!(r===null||r===``)){if(r===`Enter`){this.dispatchSubmit();return}this.dispatchKey(r)}},this.handleAssistedInputPointerDown=e=>{e.preventDefault()}}#e;get characters(){return this.#e}set characters(e){this.#e=e}connectedCallback(){super.connectedCallback(),this.hasAttribute(`role`)||this.setAttribute(`role`,`group`),this.hasAttribute(`aria-label`)||this.setAttribute(`aria-label`,this.defaultAriaLabel)}isButtonAllowed(e){return e.action===void 0?e.key===void 0||e.key===``?!1:this.isKeyAllowed(e.key):!0}isKeyAllowed(e){return this.characters===``||e===`Backspace`||e===`Enter`||e.length===1&&this.characters.includes(e)}renderAssistedInputButton(e,t,n={}){let r=this.isButtonAllowed(e);return F`
      <button
          type="button"
          class=${[`key`,e.className??``,r?``:`disallowed`].filter(Boolean).join(` `)}
          data-action=${e.action??``}
          data-key=${e.key??``}
          aria-label=${n.ariaLabel??``}
          title=${n.title??``}
          ?disabled=${!r}
          tabindex="-1"
          @click=${this.handleAssistedInputButtonClick}
          @pointerdown=${this.handleAssistedInputPointerDown}>
        ${t}
      </button>
    `}dispatchKey(e){this.dispatchEvent(new CustomEvent(`key`,{detail:{key:e},bubbles:!0,composed:!0}))}dispatchSubmit(){this.dispatchEvent(new CustomEvent(`submit`,{detail:{},bubbles:!0,composed:!0}))}handleAction(e,t,n){return!1}};V([B({reflect:!0})],Or.prototype,`characters`,null);var kr=[[{key:`1`,label:`1`},{key:`2`,label:`2`},{key:`3`,label:`3`},{key:`4`,label:`4`},{key:`5`,label:`5`},{key:`6`,label:`6`},{key:`7`,label:`7`},{key:`8`,label:`8`},{key:`9`,label:`9`},{key:`0`,label:`0`},{key:`Backspace`,label:`⌫`,className:`wide backspace`}],[{key:`q`,label:`Q`},{key:`w`,label:`W`},{key:`e`,label:`E`},{key:`r`,label:`R`},{key:`t`,label:`T`},{key:`y`,label:`Y`},{key:`u`,label:`U`},{key:`i`,label:`I`},{key:`o`,label:`O`},{key:`p`,label:`P`}],[{key:`a`,label:`A`},{key:`s`,label:`S`},{key:`d`,label:`D`},{key:`f`,label:`F`},{key:`g`,label:`G`},{key:`h`,label:`H`},{key:`j`,label:`J`},{key:`k`,label:`K`},{key:`l`,label:`L`},{key:`'`,label:`'`},{key:`Enter`,label:`⏎`,className:`wide enter`}],[{key:`z`,label:`Z`},{key:`x`,label:`X`},{key:`c`,label:`C`},{key:`v`,label:`V`},{key:`b`,label:`B`},{key:`n`,label:`N`},{key:`m`,label:`M`},{key:`,`,label:`,`},{key:`.`,label:`.`},{key:`-`,label:`-`}],[{key:` `,label:`Space`,className:`space`}]],Ar=class extends Or{static{this.styles=se`
      :host {
        --key-bg: #ffffff;
        --key-bg-hover: #f0f0f0;
        --key-bg-disallowed: #f3f3f3;
        --key-bg-active: #e0e0e0;
        --key-color-disallowed: #9a9a9a;
        --key-border: #d0d0d0;
        --key-border-hover: #a0a0a0;
        --key-border-focus: black;
        --key-border-focus-offset: 2px;

        display: inline-flex;
        flex-direction: column;
        gap: 0.35rem;
        user-select: none;
        touch-action: manipulation;
      }

      .row {
        display: grid;
        grid-template-columns: repeat(20, minmax(0, 1fr));
        gap: 0;
      }

      .key {
        font: inherit;
        min-height: 2.5rem;
        padding: 0 0.35rem;
        border: 1px solid var(--key-border);
        background: var(--key-bg);
        cursor: pointer;
        line-height: 1;
        grid-column: span 2;
      }

      .key.wide {
        grid-column: span 4;
      }

      .key.space {
        grid-column: 4 / span 14;
      }

      .key.disallowed {
        background: var(--key-bg-disallowed);
        color: var(--key-color-disallowed);
        cursor: not-allowed;
      }

      .key:hover:not(.disallowed) {
        background: var(--key-bg-hover);
      }

      .key:active:not(.disallowed) {
        background: var(--key-bg-active);
      }

      .key:focus,
      .key:focus-visible {
        outline: 2px solid var(--key-border-focus);
        outline-offset: var(--key-border-focus-offset);
      }
    `}get defaultAriaLabel(){return`keyboard`}render(){return F`
      ${kr.map(e=>F`
          <div class="row">
            ${e.map(e=>this.#e(e))}
          </div>
        `)}
    `}#e(e){let t=e.key===` `?`Space`:void 0;return this.renderAssistedInputButton(e,F`<span class="label">${e.label??``}</span>`,{ariaLabel:t})}};Ar=V([z(`asljs-keyboard`)],Ar),[...Dr];var jr=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" aria-hidden="true" focusable="false"><path d="M96 208C96 172.7 124.7 144 160 144L480 144C515.3 144 544 172.7 544 208L544 432C544 467.3 515.3 496 480 496L160 496C124.7 496 96 467.3 96 432L96 208zM160 192C151.2 192 144 199.2 144 208L144 432C144 440.8 151.2 448 160 448L480 448C488.8 448 496 440.8 496 432L496 208C496 199.2 488.8 192 480 192L160 192zM176 240C176 231.2 183.2 224 192 224L224 224C232.8 224 240 231.2 240 240L240 272C240 280.8 232.8 288 224 288L192 288C183.2 288 176 280.8 176 272L176 240zM272 240C272 231.2 279.2 224 288 224L320 224C328.8 224 336 231.2 336 240L336 272C336 280.8 328.8 288 320 288L288 288C279.2 288 272 280.8 272 272L272 240zM368 240C368 231.2 375.2 224 384 224L416 224C424.8 224 432 231.2 432 240L432 272C432 280.8 424.8 288 416 288L384 288C375.2 288 368 280.8 368 272L368 240zM176 336C176 327.2 183.2 320 192 320L448 320C456.8 320 464 327.2 464 336L464 368C464 376.8 456.8 384 448 384L192 384C183.2 384 176 376.8 176 368L176 336z"/></svg>`,Mr=[{action:`toggle`,className:`toggle`},{key:`a`,label:`A`},{key:`b`,label:`B`},{key:`c`,label:`C`},{key:`d`,label:`D`},{key:`e`,label:`E`},{key:`f`,label:`F`},{key:`g`,label:`G`},{key:`h`,label:`H`},{key:`i`,label:`I`},{key:`j`,label:`J`},{key:`k`,label:`K`},{key:`l`,label:`L`},{key:`m`,label:`M`},{key:`n`,label:`N`},{key:`o`,label:`O`},{key:`p`,label:`P`},{key:`q`,label:`Q`},{key:`r`,label:`R`},{key:`Backspace`,label:`⌫`},{key:`s`,label:`S`},{key:`t`,label:`T`},{key:`u`,label:`U`},{key:`v`,label:`V`},{key:`Enter`,label:`⏎`,className:`enter`},{key:`w`,label:`W`},{key:`x`,label:`X`},{key:`y`,label:`Y`},{key:`z`,label:`Z`}],Nr=class extends Or{static{this.styles=se`
      :host {
        display: inline-block;
        user-select: none;
        touch-action: manipulation;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        grid-auto-rows: 2.2em;
        gap: 0;
      }

      .key {
        font: inherit;
        padding: 0;
        min-width: 2.2em;
        border: 1px solid lightgray;
        background: white;
        cursor: pointer;
        line-height: 1;
        position: relative;
      }

      .key.disallowed {
        background: #f3f3f3;
        border-color: #d0d0d0;
        color: #9a9a9a;
        cursor: not-allowed;
      }

      .key:focus,
      .key:focus-visible {
        outline: 2px solid black;
        outline-offset: 2px;
      }

      .key.toggle {
        border-color: black;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .key.toggle svg {
        width: 1.1em;
        height: 1.1em;
        fill: currentColor;
      }

      :host([collapsed]) .key:not(.toggle) {
        display: none;
      }

      .key.enter {
        grid-column: 5;
        grid-row: 5 / span 2;
      }
    `}#e=!1;get collapsed(){return this.#e}set collapsed(e){this.#e=e}get defaultAriaLabel(){return`letterpad`}render(){return F`
      <div class="grid" part="grid">
        ${Mr.map(e=>this.#t(e))}
      </div>
    `}handleAction(e,t,n){return e===`toggle`?(t.preventDefault(),t.stopPropagation(),this.collapsed=!this.collapsed,!0):!1}#t(e){return e.action===`toggle`?this.renderAssistedInputButton(e,lt(jr),{ariaLabel:this.#n,title:this.#n}):this.renderAssistedInputButton(e,F`<span class="label">${e.label??``}</span>`)}get#n(){return this.collapsed?`Show letterpad`:`Hide letterpad`}};V([B({reflect:!0,type:Boolean})],Nr.prototype,`collapsed`,null),Nr=V([z(`asljs-letterpad`)],Nr);var Pr=[{key:`Backspace`,label:`⌫`},{key:`/`,label:`÷`,className:`op`},{key:`*`,label:`×`,className:`op`},{key:`-`,label:`−`,className:`op`},{key:`7`,label:`7`},{key:`8`,label:`8`},{key:`9`,label:`9`},{key:`+`,label:`+`,className:`op plus`},{key:`4`,label:`4`},{key:`5`,label:`5`},{key:`6`,label:`6`},{key:`1`,label:`1`},{key:`2`,label:`2`},{key:`3`,label:`3`},{key:`Enter`,label:`⏎`,className:`enter`},{key:`0`,label:`0`,className:`zero`},{key:`.`,label:`.`}],Fr=class extends Or{static{this.styles=se`
      :host {
        --key-bg: #ffffff;
        --key-bg-hover: #f0f0f0;
        --key-bg-disallowed: #f3f3f3;
        --key-bg-active: #e0e0e0;
        --key-color-disallowed: #9a9a9a;
        --key-border: #d0d0d0;
        --key-border-hover: #a0a0a0;
        --key-border-focus: black;
        --key-border-focus-offset: 2px;

        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        user-select: none;
        touch-action: manipulation;
        container-type: size;
        overflow: hidden;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        grid-template-rows: repeat(5, 1fr);
        gap: 0;
        width: min(100cqw, calc(100cqh * 4 / 5));
        height: min(100cqh, calc(100cqw * 5 / 4));
        aspect-ratio: 4 / 5;
      }

      .key {
        aspect-ratio: 1 / 1;
        padding: 0;
        border: 1px solid var(--key-border);
        display: flex;
        justify-content: center;
        align-items: center;
        background: var(--key-bg);
        cursor: pointer;
        user-select: none;
        font-size: min(10cqw, 10cqh);
        font-weight: lighter;
      }

      .key.disallowed {
        background: var(--key-bg-disallowed);
        color: var(--key-color-disallowed);
        cursor: not-allowed;
      }

      .key:focus,
      .key:focus-visible {
        outline: 2px solid var(--key-border-focus);
        outline-offset: var(--key-border-focus-offset);
      }

      .key.plus {
        aspect-ratio: 1 / 2;
        grid-row: 2 / span 2;
        grid-column: 4 / 4;
      }

      .key.zero {
        grid-column: 1 / span 2;
        grid-row: 5 / 5;
        aspect-ratio: 2 / 1;
      }

      .key.enter {
        aspect-ratio: 1 / 2;
        grid-row: 4 / span 2;
        grid-column: 4 / 4;
      }

      .key:hover:not(.disallowed) {
        background: var(--key-bg-hover);
      }

      .key:active:not(.disallowed) {
        background: var(--key-bg-active);
      }
    `}get defaultAriaLabel(){return`numpad`}render(){return F`
      <div class="grid" part="grid">
        ${Pr.map(e=>this.#e(e))}
      </div>
    `}#e(e){return this.renderAssistedInputButton(e,F`<span class="label">${e.label??``}</span>`)}};Fr=V([z(`asljs-numpad`)],Fr);var Ir=class extends R{#e=null;#t=null;#n=null;#r=[];#i=null;#a=null;#o=!1;#s=!1;#c=()=>{this.requestUpdate()};#l=[];get items(){return this.#l}set items(e){this.#l=e}#u=void 0;get context(){return this.#u}set context(e){this.#u=e}#d=null;get theme(){return this.#d}set theme(e){this.#d=e}createRenderRoot(){return this}connectedCallback(){super.connectedCallback(),this.#f(),this.#C(),this.#T()}disconnectedCallback(){this.#w(),this.#S(),this.#E(),super.disconnectedCallback()}render(){let e=this.#_(`empty`),t=this.#_(`item`),n=this.#_(`container`);return this.items.length===0?e?F`
          <div data-role="empty-template-host"></div>
        `:I:t?n?F`
        <div data-role="container-template-host"></div>
      `:F`
      <div data-role="default-container-host">
      </div>
    `:I}updated(e){e.has(`items`)&&this.#C(),e.has(`theme`)&&this.#T(),this.#p()}#f(){this.#e=null,this.#t=null,this.#n=null,this.#o=!1,this.#s=!1;let e=this.querySelectorAll(`template[data-slot]`);for(let t of e){let e=t,n=e.getAttribute(`data-slot`),r=document.createElement(`template`);r.content.append(e.content.cloneNode(!0)),n===`empty`&&(this.#t=r),n===`item`&&(this.#n=r),n===`container`&&(this.#e=r)}}#p(){this.#m(),this.#h()}#m(){let e=this.#_(`empty`);if(!e||this.items.length>0)return;let t=this.querySelector(`[data-role="empty-template-host"]`);t&&t.replaceChildren(e.content.cloneNode(!0))}#h(){this.#S();let e=this.#_(`item`);if(!e||this.items.length===0){!e&&this.items.length>0&&this.#D();return}let t=this.#g();if(!t)return;let n=[],r=this.items.length;for(let t=0;t<this.items.length;t++){let i=this.items[t],a={item:i,index:t,context:this.#x(i,t),first:t===0,last:t===r-1,odd:t%2==1,even:t%2==0,count:r},o=e.content.cloneNode(!0);this.#b(o,a),n.push(...o.childNodes)}t.replaceChildren(...n)}#g(){let e=this.#_(`container`);if(e){let t=this.querySelector(`[data-role="container-template-host"]`);if(!t)return null;let n=e.content.cloneNode(!0),r=n.querySelector(`[data-role="items"]`);return t.replaceChildren(n),r||(this.#O(),null)}return this.querySelector(`[data-role="default-container-host"]`)}#_(e){return this.#v(e)??this.#y(e)}#v(e){return e===`container`?this.#e:e===`empty`?this.#t:this.#n}#y(e){return yt((this.theme??this.#a?.theme??_t()).list?.[e],this)}#b(e,t){let n=qt(e,t);this.#r.push(n)}#x(e,t){if(this.context===null||this.context===void 0||typeof this.context!=`object`)return this.context;let n=this.context,r=Object.create(n);r.item=e,r.index=t;for(let e of Object.keys(n)){let t=n[e];typeof t==`function`&&(r[e]=t.bind(r))}return r}#S(){for(let e of this.#r)e();this.#r=[]}#C(){this.#w();let e=Lr(this.items);if(!e)return;let t=[],n=()=>{this.requestUpdate()};for(let r of[`set`,`delete`,`define`]){let i=e.on(r,n);t.push(()=>{i()})}this.#i=()=>{for(let e of t)e()}}#w(){this.#i&&=(this.#i(),null)}#T(){let e=this.theme?null:vt(this);this.#a!==e&&(this.#E(),this.#a=e,this.#a?.addEventListener(dt,this.#c))}#E(){this.#a?.removeEventListener(dt,this.#c),this.#a=null}#D(){this.#o||(this.#o=!0,console.warn(`asljs-list: missing required template[data-slot="item"] for non-empty items.`))}#O(){this.#s||(this.#s=!0,console.warn(`asljs-list: container template must include [data-role="items"].`))}};V([B({attribute:!1})],Ir.prototype,`items`,null),V([B({attribute:!1})],Ir.prototype,`context`,null),V([B({attribute:!1})],Ir.prototype,`theme`,null),Ir=V([z(`asljs-list`)],Ir);function Lr(e){return _(e)??null}var Rr=globalThis.HTMLElement??class{},zr=class extends Rr{#e=null;get theme(){return this.#e}set theme(e){this.#e!==e&&(this.#e=e??null,typeof Event==`function`&&`dispatchEvent`in this&&this.dispatchEvent(new Event(dt,{bubbles:!1})))}};globalThis.customElements&&!customElements.get(`asljs-theme-provider`)&&customElements.define(`asljs-theme-provider`,zr);var Br=c(o(((e,t)=>{(e=>{var t=Object.defineProperty,n=Object.getOwnPropertyDescriptor,r=Object.getOwnPropertyNames,i=Object.prototype.hasOwnProperty,a=(e,n)=>{for(var r in n)t(e,r,{get:n[r],enumerable:!0})},o=(e,a,o,s)=>{if(a&&typeof a==`object`||typeof a==`function`)for(let c of r(a))!i.call(e,c)&&c!==o&&t(e,c,{get:()=>a[c],enumerable:!(s=n(a,c))||s.enumerable});return e},s=e=>o(t({},`__esModule`,{value:!0}),e),c=(e,t,n)=>new Promise((r,i)=>{var a=e=>{try{s(n.next(e))}catch(e){i(e)}},o=e=>{try{s(n.throw(e))}catch(e){i(e)}},s=e=>e.done?r(e.value):Promise.resolve(e.value).then(a,o);s((n=n.apply(e,t)).next())}),l={};a(l,{analyzeMetafile:()=>Re,analyzeMetafileSync:()=>I,build:()=>Pe,buildSync:()=>ze,context:()=>Fe,default:()=>qe,formatMessages:()=>Le,formatMessagesSync:()=>Be,initialize:()=>Ge,stop:()=>Ve,transform:()=>Ie,transformSync:()=>F,version:()=>Ne}),e.exports=s(l);function u(e){let t=e=>{if(e===null)n.write8(0);else if(typeof e==`boolean`)n.write8(1),n.write8(+e);else if(typeof e==`number`)n.write8(2),n.write32(e|0);else if(typeof e==`string`)n.write8(3),n.write(p(e));else if(e instanceof Uint8Array)n.write8(4),n.write(e);else if(e instanceof Array){n.write8(5),n.write32(e.length);for(let n of e)t(n)}else{let r=Object.keys(e);n.write8(6),n.write32(r.length);for(let i of r)n.write(p(i)),t(e[i])}},n=new f;return n.write32(0),n.write32(e.id<<1|!e.isRequest),t(e.value),_(n.buf,n.len-4,0),n.buf.subarray(0,n.len)}function d(e){let t=()=>{switch(n.read8()){case 0:return null;case 1:return!!n.read8();case 2:return n.read32();case 3:return m(n.read());case 4:return n.read();case 5:{let e=n.read32(),r=[];for(let n=0;n<e;n++)r.push(t());return r}case 6:{let e=n.read32(),r={};for(let i=0;i<e;i++)r[m(n.read())]=t();return r}default:throw Error(`Invalid packet`)}},n=new f(e),r=n.read32(),i=(r&1)==0;r>>>=1;let a=t();if(n.ptr!==e.length)throw Error(`Invalid packet`);return{id:r,isRequest:i,value:a}}var f=class{constructor(e=new Uint8Array(1024)){this.buf=e,this.len=0,this.ptr=0}_write(e){if(this.len+e>this.buf.length){let t=new Uint8Array((this.len+e)*2);t.set(this.buf),this.buf=t}return this.len+=e,this.len-e}write8(e){let t=this._write(1);this.buf[t]=e}write32(e){let t=this._write(4);_(this.buf,e,t)}write(e){let t=this._write(4+e.length);_(this.buf,e.length,t),this.buf.set(e,t+4)}_read(e){if(this.ptr+e>this.buf.length)throw Error(`Invalid packet`);return this.ptr+=e,this.ptr-e}read8(){return this.buf[this._read(1)]}read32(){return g(this.buf,this._read(4))}read(){let e=this.read32(),t=new Uint8Array(e),n=this._read(t.length);return t.set(this.buf.subarray(n,n+e)),t}},p,m,h;if(typeof TextEncoder<`u`&&typeof TextDecoder<`u`){let e=new TextEncoder,t=new TextDecoder;p=t=>e.encode(t),m=e=>t.decode(e),h=`new TextEncoder().encode("")`}else if(typeof Buffer<`u`)p=e=>Buffer.from(e),m=e=>{let{buffer:t,byteOffset:n,byteLength:r}=e;return Buffer.from(t,n,r).toString()},h=`Buffer.from("")`;else throw Error(`No UTF-8 codec found`);if(!(p(``)instanceof Uint8Array))throw Error(`Invariant violation: "${h} instanceof Uint8Array" is incorrectly false

This indicates that your JavaScript environment is broken. You cannot use
esbuild in this environment because esbuild relies on this invariant. This
is not a problem with esbuild. You need to fix your environment instead.
`);function g(e,t){return(e[t++]|e[t++]<<8|e[t++]<<16|e[t++]<<24)>>>0}function _(e,t,n){e[n++]=t,e[n++]=t>>8,e[n++]=t>>16,e[n++]=t>>24}var v=String.fromCharCode;function y(e,t,n){let r=e[t],i=1,a=0;for(let n=0;n<t;n++)e[n]===10?(i++,a=0):a++;throw SyntaxError(n||(t===e.length?`Unexpected end of input while parsing JSON`:r>=32&&r<=126?`Unexpected character ${v(r)} in JSON at position ${t} (line ${i}, column ${a})`:`Unexpected byte 0x${r.toString(16)} in JSON at position ${t} (line ${i}, column ${a})`))}function b(e){if(!(e instanceof Uint8Array))throw Error(`JSON input must be a Uint8Array`);let t=[],n=[],r=[],i=e.length,a=null,o=0,s,c=0;for(;c<i;){let l=e[c++];if(l<=32)continue;let u;switch(o===2&&a===null&&l!==34&&l!==125&&y(e,--c),l){case 116:(e[c++]!==114||e[c++]!==117||e[c++]!==101)&&y(e,--c),u=!0;break;case 102:(e[c++]!==97||e[c++]!==108||e[c++]!==115||e[c++]!==101)&&y(e,--c),u=!1;break;case 110:(e[c++]!==117||e[c++]!==108||e[c++]!==108)&&y(e,--c),u=null;break;case 45:case 46:case 48:case 49:case 50:case 51:case 52:case 53:case 54:case 55:case 56:case 57:{let t=c;for(u=v(l),l=e[c];;){switch(l){case 43:case 45:case 46:case 48:case 49:case 50:case 51:case 52:case 53:case 54:case 55:case 56:case 57:case 101:case 69:u+=v(l),l=e[++c];continue}break}u=+u,isNaN(u)&&y(e,--t,`Invalid number`);break}case 34:for(u=``;c>=i&&y(e,i),l=e[c++],l!==34;)if(l===92)switch(e[c++]){case 34:u+=`"`;break;case 47:u+=`/`;break;case 92:u+=`\\`;break;case 98:u+=`\b`;break;case 102:u+=`\f`;break;case 110:u+=`
`;break;case 114:u+=`\r`;break;case 116:u+=`	`;break;case 117:{let t=0;for(let n=0;n<4;n++)l=e[c++],t<<=4,l>=48&&l<=57?t|=l-48:l>=97&&l<=102?t|=l+-87:l>=65&&l<=70?t|=l+-55:y(e,--c);u+=v(t);break}default:y(e,--c);break}else if(l<=127)u+=v(l);else if((l&224)==192)u+=v((l&31)<<6|e[c++]&63);else if((l&240)==224)u+=v((l&15)<<12|(e[c++]&63)<<6|e[c++]&63);else if((l&248)==240){let t=(l&7)<<18|(e[c++]&63)<<12|(e[c++]&63)<<6|e[c++]&63;t>65535&&(t-=65536,u+=v(t>>10&1023|55296),t=56320|t&1023),u+=v(t)}u[0];break;case 91:u=[],t.push(a),n.push(s),r.push(o),a=null,s=u,o=1;continue;case 123:u={},t.push(a),n.push(s),r.push(o),a=null,s=u,o=2;continue;case 93:o!==1&&y(e,--c),u=s,a=t.pop(),s=n.pop(),o=r.pop();break;case 125:o!==2&&y(e,--c),u=s,a=t.pop(),s=n.pop(),o=r.pop();break;default:y(e,--c)}for(l=e[c];l<=32;)l=e[++c];switch(o){case 0:if(c===i)return u;break;case 1:if(s.push(u),l===44){c++;continue}if(l===93)continue;break;case 2:if(a===null){if(a=u,l===58){c++;continue}}else{if(s[a]=u,a=null,l===44){c++;continue}if(l===125)continue}break}break}y(e,c)}var x=JSON.stringify,ee=`warning`,te=`silent`;function ne(e,t){let n=[];for(let r of e){if(M(r,t),r.indexOf(`,`)>=0)throw Error(`Invalid ${t}: ${r}`);n.push(r)}return n.join(`,`)}var S=()=>null,C=e=>typeof e==`boolean`?null:`a boolean`,w=e=>typeof e==`string`?null:`a string`,re=e=>e instanceof RegExp?null:`a RegExp object`,T=e=>typeof e==`number`&&e===(e|0)?null:`an integer`,ie=e=>typeof e==`number`&&e===(e|0)&&e>=0&&e<=65535?null:`a valid port number`,ae=e=>typeof e==`function`?null:`a function`,E=e=>Array.isArray(e)?null:`an array`,D=e=>Array.isArray(e)&&e.every(e=>typeof e==`string`)?null:`an array of strings`,O=e=>typeof e==`object`&&e&&!Array.isArray(e)?null:`an object`,oe=e=>typeof e==`object`&&e?null:`an array or an object`,se=e=>e instanceof WebAssembly.Module?null:`a WebAssembly.Module`,ce=e=>typeof e==`object`&&!Array.isArray(e)?null:`an object or null`,le=e=>typeof e==`string`||typeof e==`boolean`?null:`a string or a boolean`,ue=e=>typeof e==`string`||typeof e==`object`&&e&&!Array.isArray(e)?null:`a string or an object`,de=e=>typeof e==`string`||Array.isArray(e)&&e.every(e=>typeof e==`string`)?null:`a string or an array of strings`,fe=e=>typeof e==`string`||e instanceof Uint8Array?null:`a string or a Uint8Array`,pe=e=>typeof e==`string`||e instanceof URL?null:`a string or a URL`;function k(e,t,n,r){let i=e[n];if(t[n+``]=!0,i===void 0)return;let a=r(i);if(a!==null)throw Error(`${x(n)} must be ${a}`);return i}function A(e,t,n){for(let r in e)if(!(r in t))throw Error(`Invalid option ${n}: ${x(r)}`)}function j(e){let t=Object.create(null),n=k(e,t,`wasmURL`,pe),r=k(e,t,`wasmModule`,se),i=k(e,t,`worker`,C);return A(e,t,`in initialize() call`),{wasmURL:n,wasmModule:r,worker:i}}function me(e){let t;if(e!==void 0){t=Object.create(null);for(let n in e){let r=e[n];if(typeof r==`string`||r===!1)t[n]=r;else throw Error(`Expected ${x(n)} in mangle cache to map to either a string or false`)}}return t}function he(e,t,n,r,i){let a=k(t,n,`color`,C),o=k(t,n,`logLevel`,w),s=k(t,n,`logLimit`,T);a===void 0?r&&e.push(`--color=true`):e.push(`--color=${a}`),e.push(`--log-level=${o||i}`),e.push(`--log-limit=${s||0}`)}function M(e,t,n){if(typeof e!=`string`)throw Error(`Expected value for ${t}${n===void 0?``:` `+x(n)} to be a string, got ${typeof e} instead`);return e}function ge(e,t,n){let r=k(t,n,`legalComments`,w),i=k(t,n,`sourceRoot`,w),a=k(t,n,`sourcesContent`,C),o=k(t,n,`target`,de),s=k(t,n,`format`,w),c=k(t,n,`globalName`,w),l=k(t,n,`mangleProps`,re),u=k(t,n,`reserveProps`,re),d=k(t,n,`mangleQuoted`,C),f=k(t,n,`minify`,C),p=k(t,n,`minifySyntax`,C),m=k(t,n,`minifyWhitespace`,C),h=k(t,n,`minifyIdentifiers`,C),g=k(t,n,`lineLimit`,T),_=k(t,n,`drop`,D),v=k(t,n,`dropLabels`,D),y=k(t,n,`charset`,w),b=k(t,n,`treeShaking`,C),ee=k(t,n,`ignoreAnnotations`,C),te=k(t,n,`jsx`,w),S=k(t,n,`jsxFactory`,w),ie=k(t,n,`jsxFragment`,w),ae=k(t,n,`jsxImportSource`,w),E=k(t,n,`jsxDev`,C),oe=k(t,n,`jsxSideEffects`,C),se=k(t,n,`define`,O),ce=k(t,n,`logOverride`,O),le=k(t,n,`supported`,O),fe=k(t,n,`pure`,D),pe=k(t,n,`keepNames`,C),A=k(t,n,`platform`,w),j=k(t,n,`tsconfigRaw`,ue),me=k(t,n,`absPaths`,D);if(r&&e.push(`--legal-comments=${r}`),i!==void 0&&e.push(`--source-root=${i}`),a!==void 0&&e.push(`--sources-content=${a}`),o&&e.push(`--target=${ne(Array.isArray(o)?o:[o],`target`)}`),s&&e.push(`--format=${s}`),c&&e.push(`--global-name=${c}`),A&&e.push(`--platform=${A}`),j&&e.push(`--tsconfig-raw=${typeof j==`string`?j:JSON.stringify(j)}`),f&&e.push(`--minify`),p&&e.push(`--minify-syntax`),m&&e.push(`--minify-whitespace`),h&&e.push(`--minify-identifiers`),g&&e.push(`--line-limit=${g}`),y&&e.push(`--charset=${y}`),b!==void 0&&e.push(`--tree-shaking=${b}`),ee&&e.push(`--ignore-annotations`),_)for(let t of _)e.push(`--drop:${M(t,`drop`)}`);if(v&&e.push(`--drop-labels=${ne(v,`drop label`)}`),me&&e.push(`--abs-paths=${ne(me,`abs paths`)}`),l&&e.push(`--mangle-props=${je(l)}`),u&&e.push(`--reserve-props=${je(u)}`),d!==void 0&&e.push(`--mangle-quoted=${d}`),te&&e.push(`--jsx=${te}`),S&&e.push(`--jsx-factory=${S}`),ie&&e.push(`--jsx-fragment=${ie}`),ae&&e.push(`--jsx-import-source=${ae}`),E&&e.push(`--jsx-dev`),oe&&e.push(`--jsx-side-effects`),se)for(let t in se){if(t.indexOf(`=`)>=0)throw Error(`Invalid define: ${t}`);e.push(`--define:${t}=${M(se[t],`define`,t)}`)}if(ce)for(let t in ce){if(t.indexOf(`=`)>=0)throw Error(`Invalid log override: ${t}`);e.push(`--log-override:${t}=${M(ce[t],`log override`,t)}`)}if(le)for(let t in le){if(t.indexOf(`=`)>=0)throw Error(`Invalid supported: ${t}`);let n=le[t];if(typeof n!=`boolean`)throw Error(`Expected value for supported ${x(t)} to be a boolean, got ${typeof n} instead`);e.push(`--supported:${t}=${n}`)}if(fe)for(let t of fe)e.push(`--pure:${M(t,`pure`)}`);pe&&e.push(`--keep-names`)}function _e(e,t,n,r,i){let a=[],o=[],s=Object.create(null),c=null,l=null;he(a,t,s,n,r),ge(a,t,s);let u=k(t,s,`sourcemap`,le),d=k(t,s,`bundle`,C),f=k(t,s,`splitting`,C),m=k(t,s,`preserveSymlinks`,C),h=k(t,s,`metafile`,C),g=k(t,s,`outfile`,w),_=k(t,s,`outdir`,w),v=k(t,s,`outbase`,w),y=k(t,s,`tsconfig`,w),b=k(t,s,`resolveExtensions`,D),x=k(t,s,`nodePaths`,D),ee=k(t,s,`mainFields`,D),te=k(t,s,`conditions`,D),S=k(t,s,`external`,D),re=k(t,s,`packages`,w),T=k(t,s,`alias`,O),ie=k(t,s,`loader`,O),ae=k(t,s,`outExtension`,O),E=k(t,s,`publicPath`,w),se=k(t,s,`entryNames`,w),ce=k(t,s,`chunkNames`,w),ue=k(t,s,`assetNames`,w),de=k(t,s,`inject`,D),pe=k(t,s,`banner`,O),j=k(t,s,`footer`,O),_e=k(t,s,`entryPoints`,oe),ve=k(t,s,`absWorkingDir`,w),ye=k(t,s,`stdin`,O),be=k(t,s,`write`,C)??i,xe=k(t,s,`allowOverwrite`,C),Se=k(t,s,`mangleCache`,O);if(s.plugins=!0,A(t,s,`in ${e}() call`),u&&a.push(`--sourcemap${u===!0?``:`=${u}`}`),d&&a.push(`--bundle`),xe&&a.push(`--allow-overwrite`),f&&a.push(`--splitting`),m&&a.push(`--preserve-symlinks`),h&&a.push(`--metafile`),g&&a.push(`--outfile=${g}`),_&&a.push(`--outdir=${_}`),v&&a.push(`--outbase=${v}`),y&&a.push(`--tsconfig=${y}`),re&&a.push(`--packages=${re}`),b&&a.push(`--resolve-extensions=${ne(b,`resolve extension`)}`),E&&a.push(`--public-path=${E}`),se&&a.push(`--entry-names=${se}`),ce&&a.push(`--chunk-names=${ce}`),ue&&a.push(`--asset-names=${ue}`),ee&&a.push(`--main-fields=${ne(ee,`main field`)}`),te&&a.push(`--conditions=${ne(te,`condition`)}`),S)for(let e of S)a.push(`--external:${M(e,`external`)}`);if(T)for(let e in T){if(e.indexOf(`=`)>=0)throw Error(`Invalid package name in alias: ${e}`);a.push(`--alias:${e}=${M(T[e],`alias`,e)}`)}if(pe)for(let e in pe){if(e.indexOf(`=`)>=0)throw Error(`Invalid banner file type: ${e}`);a.push(`--banner:${e}=${M(pe[e],`banner`,e)}`)}if(j)for(let e in j){if(e.indexOf(`=`)>=0)throw Error(`Invalid footer file type: ${e}`);a.push(`--footer:${e}=${M(j[e],`footer`,e)}`)}if(de)for(let e of de)a.push(`--inject:${M(e,`inject`)}`);if(ie)for(let e in ie){if(e.indexOf(`=`)>=0)throw Error(`Invalid loader extension: ${e}`);a.push(`--loader:${e}=${M(ie[e],`loader`,e)}`)}if(ae)for(let e in ae){if(e.indexOf(`=`)>=0)throw Error(`Invalid out extension: ${e}`);a.push(`--out-extension:${e}=${M(ae[e],`out extension`,e)}`)}if(_e)if(Array.isArray(_e))for(let e=0,t=_e.length;e<t;e++){let t=_e[e];if(typeof t==`object`&&t){let n=Object.create(null),r=k(t,n,`in`,w),i=k(t,n,`out`,w);if(A(t,n,`in entry point at index `+e),r===void 0)throw Error(`Missing property "in" for entry point at index `+e);if(i===void 0)throw Error(`Missing property "out" for entry point at index `+e);o.push([i,r])}else o.push([``,M(t,`entry point at index `+e)])}else for(let e in _e)o.push([e,M(_e[e],`entry point`,e)]);if(ye){let e=Object.create(null),t=k(ye,e,`contents`,fe),n=k(ye,e,`resolveDir`,w),r=k(ye,e,`sourcefile`,w),i=k(ye,e,`loader`,w);A(ye,e,`in "stdin" object`),r&&a.push(`--sourcefile=${r}`),i&&a.push(`--loader=${i}`),n&&(l=n),typeof t==`string`?c=p(t):t instanceof Uint8Array&&(c=t)}let Ce=[];if(x)for(let e of x)e+=``,Ce.push(e);return{entries:o,flags:a,write:be,stdinContents:c,stdinResolveDir:l,absWorkingDir:ve,nodePaths:Ce,mangleCache:me(Se)}}function ve(e,t,n,r){let i=[],a=Object.create(null);he(i,t,a,n,r),ge(i,t,a);let o=k(t,a,`sourcemap`,le),s=k(t,a,`sourcefile`,w),c=k(t,a,`loader`,w),l=k(t,a,`banner`,w),u=k(t,a,`footer`,w),d=k(t,a,`mangleCache`,O);return A(t,a,`in ${e}() call`),o&&i.push(`--sourcemap=${o===!0?`external`:o}`),s&&i.push(`--sourcefile=${s}`),c&&i.push(`--loader=${c}`),l&&i.push(`--banner=${l}`),u&&i.push(`--footer=${u}`),{flags:i,mangleCache:me(d)}}function ye(e){let t={},n={didClose:!1,reason:``},r={},i=0,a=0,o=new Uint8Array(16*1024),s=0,l=e=>{let t=s+e.length;if(t>o.length){let e=new Uint8Array(t*2);e.set(o),o=e}o.set(e,s),s+=e.length;let n=0;for(;n+4<=s;){let e=g(o,n);if(n+4+e>s)break;n+=4,y(o.subarray(n,n+e)),n+=e}n>0&&(o.copyWithin(0,n,s),s-=n)},f=e=>{n.didClose=!0,e&&(n.reason=`: `+(e.message||e));let t=`The service was stopped`+n.reason;for(let e in r)r[e](t,null);r={}},m=(t,a,o)=>{if(n.didClose)return o(`The service is no longer running`+n.reason,null);let s=i++;r[s]=(e,n)=>{try{o(e,n)}finally{t&&t.unref()}},t&&t.ref(),e.writeToStdin(u({id:s,isRequest:!0,value:a}))},h=(t,r)=>{if(n.didClose)throw Error(`The service is no longer running`+n.reason);e.writeToStdin(u({id:t,isRequest:!1,value:r}))},_=(n,r)=>c(null,null,function*(){try{if(r.command===`ping`){h(n,{});return}if(typeof r.key==`number`){let e=t[r.key];if(!e)return;let i=e[r.command];if(i){yield i(n,r);return}}throw Error(`Invalid command: `+r.command)}catch(t){let r=[we(t,e,null,void 0,``)];try{h(n,{errors:r})}catch{}}}),v=!0,y=e=>{if(v){v=!1;let t=String.fromCharCode(...e);if(t!==`0.28.1`)throw Error(`Cannot start service: Host version "0.28.1" does not match binary version ${x(t)}`);return}let t=d(e);if(t.isRequest)_(t.id,t.value);else{let e=r[t.id];delete r[t.id],t.value.error?e(t.value.error,{}):e(null,t.value)}};return{readFromStdout:l,afterClose:f,service:{buildOrContext:({callName:n,refs:r,options:i,isTTY:o,defaultWD:s,callback:c})=>{let l=0,u=a++,d={},f={ref(){++l===1&&r&&r.ref()},unref(){--l===0&&(delete t[u],r&&r.unref())}};t[u]=d,f.ref(),be(n,u,m,h,f,e,d,i,o,s,(e,t)=>{try{c(e,t)}finally{f.unref()}})},transform:({callName:t,refs:n,input:r,options:i,isTTY:a,fs:o,callback:s})=>{let c=Se(),l=l=>{try{if(typeof r!=`string`&&!(r instanceof Uint8Array))throw Error(`The input to "transform" must be a string or a Uint8Array`);let{flags:e,mangleCache:u}=ve(t,i,a,te),d={command:`transform`,flags:e,inputFS:l!==null,input:l===null?typeof r==`string`?p(r):r:p(l)};u&&(d.mangleCache=u),m(n,d,(e,t)=>{if(e)return s(Error(e),null);let n=Ee(t.errors,c),r=Ee(t.warnings,c),i=1,a=()=>{if(--i===0){let e={warnings:r,code:t.code,map:t.map,mangleCache:void 0,legalComments:void 0};`legalComments`in t&&(e.legalComments=t?.legalComments),t.mangleCache&&(e.mangleCache=t?.mangleCache),s(null,e)}};if(n.length>0)return s(N(`Transform failed`,n,r),null);t.codeFS&&(i++,o.readFile(t.code,(e,n)=>{e===null?(t.code=n,a()):s(e,null)})),t.mapFS&&(i++,o.readFile(t.map,(e,n)=>{e===null?(t.map=n,a()):s(e,null)})),a()})}catch(t){let r=[];try{he(r,i,{},a,te)}catch{}let o=we(t,e,c,void 0,``);m(n,{command:`error`,flags:r,error:o},()=>{o.detail=c.load(o.detail),s(N(`Transform failed`,[o],[]),null)})}};if((typeof r==`string`||r instanceof Uint8Array)&&r.length>1024*1024){let e=l;l=()=>o.writeFile(r,e)}l(null)},formatMessages:({callName:e,refs:t,messages:n,options:r,callback:i})=>{if(!r)throw Error(`Missing second argument in ${e}() call`);let a={},o=k(r,a,`kind`,w),s=k(r,a,`color`,C),c=k(r,a,`terminalWidth`,T);if(A(r,a,`in ${e}() call`),o===void 0)throw Error(`Missing "kind" in ${e}() call`);if(o!==`error`&&o!==`warning`)throw Error(`Expected "kind" to be "error" or "warning" in ${e}() call`);let l={command:`format-msgs`,messages:P(n,`messages`,null,``,c),isWarning:o===`warning`};s!==void 0&&(l.color=s),c!==void 0&&(l.terminalWidth=c),m(t,l,(e,t)=>{if(e)return i(Error(e),null);i(null,t.messages)})},analyzeMetafile:({callName:e,refs:t,metafile:n,options:r,callback:i})=>{r===void 0&&(r={});let a={},o=k(r,a,`color`,C),s=k(r,a,`verbose`,C);A(r,a,`in ${e}() call`);let c={command:`analyze-metafile`,metafile:n};o!==void 0&&(c.color=o),s!==void 0&&(c.verbose=s),m(t,c,(e,t)=>{if(e)return i(Error(e),null);i(null,t.result)})}}}}function be(e,t,n,r,i,a,o,s,c,l,u){let d=Se(),f=e===`context`,p=(e,t)=>{let r=[];try{he(r,s,{},c,ee)}catch{}let o=we(e,a,d,void 0,t);n(i,{command:`error`,flags:r,error:o},()=>{o.detail=d.load(o.detail),u(N(f?`Context failed`:`Build failed`,[o],[]),null)})},h;if(typeof s==`object`){let e=s.plugins;if(e!==void 0){if(!Array.isArray(e))return p(Error(`"plugins" must be an array`),``);h=e}}if(h&&h.length>0){if(a.isSync)return p(Error(`Cannot use plugins in synchronous API calls`),``);xe(t,n,r,i,a,o,s,h,d).then(e=>{if(!e.ok)return p(e.error,e.pluginName);try{g(e.requestPlugins,e.runOnEndCallbacks,e.scheduleOnDisposeCallbacks)}catch(e){p(e,``)}},e=>p(e,``));return}try{g(null,(e,t)=>t([],[]),()=>{})}catch(e){p(e,``)}function g(p,h,g){let _=a.hasFS,{entries:v,flags:y,write:b,stdinContents:x,stdinResolveDir:te,absWorkingDir:ne,nodePaths:S,mangleCache:C}=_e(e,s,c,ee,_);if(b&&!a.hasFS)throw Error(`The "write" option is unavailable in this environment`);let re={command:`build`,key:t,entries:v,flags:y,write:b,stdinContents:x,stdinResolveDir:te,absWorkingDir:ne||l,nodePaths:S,context:f};p&&(re.plugins=p),C&&(re.mangleCache=C);let E=(e,t)=>{let n={errors:Ee(e.errors,d),warnings:Ee(e.warnings,d),outputFiles:void 0,metafile:void 0,mangleCache:void 0},r=n.errors.slice(),i=n.warnings.slice();e.outputFiles&&(n.outputFiles=e.outputFiles.map(Ae)),e.metafile&&e.metafile.length&&(n.metafile=Me(e.metafile)),e.mangleCache&&(n.mangleCache=e.mangleCache),e.writeToStdout!==void 0&&console.log(m(e.writeToStdout).replace(/\n$/,``)),h(n,(e,a)=>{if(r.length>0||e.length>0)return t(N(`Build failed`,r.concat(e),i.concat(a)),null,e,a);t(null,n,e,a)})},D,oe;f&&(o[`on-end`]=(e,t)=>new Promise(n=>{E(t,(t,i,a,o)=>{let s={errors:a,warnings:o};oe&&oe(t,i),D=void 0,oe=void 0,r(e,s),n()})})),n(i,re,(e,s)=>{if(e)return u(Error(e),null);if(!f)return E(s,(e,t)=>(g(),u(e,t)));if(s.errors.length>0)return u(N(`Context failed`,s.errors,s.warnings),null);let c=!1;i.ref(),u(null,{rebuild:()=>(D||=new Promise((e,r)=>{let a;oe=(t,n)=>{a||=()=>t?r(t):e(n)};let o=()=>{n(i,{command:`rebuild`,key:t},(e,t)=>{e?r(Error(e)):a?a():o()})};o()}),D),watch:(e={})=>new Promise((r,o)=>{if(!a.hasFS)throw Error(`Cannot use the "watch" API in this environment`);let s={},c=k(e,s,`delay`,T);A(e,s,`in watch() call`);let l={command:`watch`,key:t};c&&(l.delay=c),n(i,l,e=>{e?o(Error(e)):r(void 0)})}),serve:(e={})=>new Promise((s,c)=>{if(!a.hasFS)throw Error(`Cannot use the "serve" API in this environment`);let l={},u=k(e,l,`port`,ie),d=k(e,l,`host`,w),f=k(e,l,`servedir`,w),p=k(e,l,`keyfile`,w),m=k(e,l,`certfile`,w),h=k(e,l,`fallback`,w),g=k(e,l,`cors`,O),_=k(e,l,`onRequest`,ae);A(e,l,`in serve() call`);let v={command:`serve`,key:t,onRequest:!!_};if(u!==void 0&&(v.port=u),d!==void 0&&(v.host=d),f!==void 0&&(v.servedir=f),p!==void 0&&(v.keyfile=p),m!==void 0&&(v.certfile=m),h!==void 0&&(v.fallback=h),g){let e={},t=k(g,e,`origin`,de);A(g,e,`on "cors" object`),Array.isArray(t)?v.corsOrigin=t:t!==void 0&&(v.corsOrigin=[t])}n(i,v,(e,t)=>{if(e)return c(Error(e));_&&(o[`serve-request`]=(e,t)=>{_(t.args),r(e,{})}),s(t)})}),cancel:()=>new Promise(e=>{if(c)return e();n(i,{command:`cancel`,key:t},()=>{e()})}),dispose:()=>new Promise(e=>{if(c)return e();c=!0,n(i,{command:`dispose`,key:t},()=>{e(),g(),i.unref()})})})})}}var xe=(e,t,n,r,i,a,o,s,l)=>c(null,null,function*(){let u=[],d=[],f={},m={},h=[],g=0,_=0,v=[],y=!1;s=[...s];for(let n of s){let a={};if(typeof n!=`object`)throw Error(`Plugin at index ${_} must be an object`);let s=k(n,a,`name`,w);if(typeof s!=`string`||s===``)throw Error(`Plugin at index ${_} is missing a name`);try{let c=k(n,a,`setup`,ae);if(typeof c!=`function`)throw Error(`Plugin is missing a setup function`);A(n,a,`on plugin ${x(s)}`);let p={name:s,onStart:!1,onEnd:!1,onResolve:[],onLoad:[]};_++;let b=c({initialOptions:o,resolve:(n,i={})=>{if(!y)throw Error(`Cannot call "resolve" before plugin setup has completed`);if(typeof n!=`string`)throw Error(`The path to resolve must be a string`);let a=Object.create(null),o=k(i,a,`pluginName`,w),c=k(i,a,`importer`,w),u=k(i,a,`namespace`,w),d=k(i,a,`resolveDir`,w),f=k(i,a,`kind`,w),p=k(i,a,`pluginData`,S),m=k(i,a,`with`,O);return A(i,a,`in resolve() call`),new Promise((i,a)=>{let h={command:`resolve`,path:n,key:e,pluginName:s};if(o!=null&&(h.pluginName=o),c!=null&&(h.importer=c),u!=null&&(h.namespace=u),d!=null&&(h.resolveDir=d),f!=null)h.kind=f;else throw Error(`Must specify "kind" when calling "resolve"`);p!=null&&(h.pluginData=l.store(p)),m!=null&&(h.with=ke(m,`with`)),t(r,h,(e,t)=>{e===null?i({errors:Ee(t.errors,l),warnings:Ee(t.warnings,l),path:t.path,external:t.external,sideEffects:t.sideEffects,namespace:t.namespace,suffix:t.suffix,pluginData:l.load(t.pluginData)}):a(Error(e))})})},onStart(e){let t=Ce(Error(`This error came from the "onStart" callback registered here:`),i,`onStart`);u.push({name:s,callback:e,note:t}),p.onStart=!0},onEnd(e){let t=Ce(Error(`This error came from the "onEnd" callback registered here:`),i,`onEnd`);d.push({name:s,callback:e,note:t}),p.onEnd=!0},onResolve(e,t){let n=Ce(Error(`This error came from the "onResolve" callback registered here:`),i,`onResolve`),r={},a=k(e,r,`filter`,re),o=k(e,r,`namespace`,w);if(A(e,r,`in onResolve() call for plugin ${x(s)}`),a==null)throw Error(`onResolve() call is missing a filter`);let c=g++;f[c]={name:s,callback:t,note:n},p.onResolve.push({id:c,filter:je(a),namespace:o||``})},onLoad(e,t){let n=Ce(Error(`This error came from the "onLoad" callback registered here:`),i,`onLoad`),r={},a=k(e,r,`filter`,re),o=k(e,r,`namespace`,w);if(A(e,r,`in onLoad() call for plugin ${x(s)}`),a==null)throw Error(`onLoad() call is missing a filter`);let c=g++;m[c]={name:s,callback:t,note:n},p.onLoad.push({id:c,filter:je(a),namespace:o||``})},onDispose(e){h.push(e)},esbuild:i.esbuild});b&&(yield b),v.push(p)}catch(e){return{ok:!1,error:e,pluginName:s}}}a[`on-start`]=(e,t)=>c(null,null,function*(){l.clear();let t={errors:[],warnings:[]};yield Promise.all(u.map(e=>c(null,[e],function*({name:e,callback:n,note:r}){try{let r=yield n();if(r!=null){if(typeof r!=`object`)throw Error(`Expected onStart() callback in plugin ${x(e)} to return an object`);let n={},i=k(r,n,`errors`,E),a=k(r,n,`warnings`,E);A(r,n,`from onStart() callback in plugin ${x(e)}`),i!=null&&t.errors.push(...P(i,`errors`,l,e,void 0)),a!=null&&t.warnings.push(...P(a,`warnings`,l,e,void 0))}}catch(n){t.errors.push(we(n,i,l,r&&r(),e))}}))),n(e,t)}),a[`on-resolve`]=(e,t)=>c(null,null,function*(){let r={},a=``,o,s;for(let e of t.ids)try{({name:a,callback:o,note:s}=f[e]);let n=yield o({path:t.path,importer:t.importer,namespace:t.namespace,resolveDir:t.resolveDir,kind:t.kind,pluginData:l.load(t.pluginData),with:t.with});if(n!=null){if(typeof n!=`object`)throw Error(`Expected onResolve() callback in plugin ${x(a)} to return an object`);let t={},i=k(n,t,`pluginName`,w),o=k(n,t,`path`,w),s=k(n,t,`namespace`,w),c=k(n,t,`suffix`,w),u=k(n,t,`external`,C),d=k(n,t,`sideEffects`,C),f=k(n,t,`pluginData`,S),p=k(n,t,`errors`,E),m=k(n,t,`warnings`,E),h=k(n,t,`watchFiles`,D),g=k(n,t,`watchDirs`,D);A(n,t,`from onResolve() callback in plugin ${x(a)}`),r.id=e,i!=null&&(r.pluginName=i),o!=null&&(r.path=o),s!=null&&(r.namespace=s),c!=null&&(r.suffix=c),u!=null&&(r.external=u),d!=null&&(r.sideEffects=d),f!=null&&(r.pluginData=l.store(f)),p!=null&&(r.errors=P(p,`errors`,l,a,void 0)),m!=null&&(r.warnings=P(m,`warnings`,l,a,void 0)),h!=null&&(r.watchFiles=Oe(h,`watchFiles`)),g!=null&&(r.watchDirs=Oe(g,`watchDirs`));break}}catch(t){r={id:e,errors:[we(t,i,l,s&&s(),a)]};break}n(e,r)}),a[`on-load`]=(e,t)=>c(null,null,function*(){let r={},a=``,o,s;for(let e of t.ids)try{({name:a,callback:o,note:s}=m[e]);let n=yield o({path:t.path,namespace:t.namespace,suffix:t.suffix,pluginData:l.load(t.pluginData),with:t.with});if(n!=null){if(typeof n!=`object`)throw Error(`Expected onLoad() callback in plugin ${x(a)} to return an object`);let t={},i=k(n,t,`pluginName`,w),o=k(n,t,`contents`,fe),s=k(n,t,`resolveDir`,w),c=k(n,t,`pluginData`,S),u=k(n,t,`loader`,w),d=k(n,t,`errors`,E),f=k(n,t,`warnings`,E),m=k(n,t,`watchFiles`,D),h=k(n,t,`watchDirs`,D);A(n,t,`from onLoad() callback in plugin ${x(a)}`),r.id=e,i!=null&&(r.pluginName=i),o instanceof Uint8Array?r.contents=o:o!=null&&(r.contents=p(o)),s!=null&&(r.resolveDir=s),c!=null&&(r.pluginData=l.store(c)),u!=null&&(r.loader=u),d!=null&&(r.errors=P(d,`errors`,l,a,void 0)),f!=null&&(r.warnings=P(f,`warnings`,l,a,void 0)),m!=null&&(r.watchFiles=Oe(m,`watchFiles`)),h!=null&&(r.watchDirs=Oe(h,`watchDirs`));break}}catch(t){r={id:e,errors:[we(t,i,l,s&&s(),a)]};break}n(e,r)});let b=(e,t)=>t([],[]);return d.length>0&&(b=(e,t)=>{c(null,null,function*(){let n=[],r=[];for(let{name:t,callback:a,note:o}of d){let s,c;try{let n=yield a(e);if(n!=null){if(typeof n!=`object`)throw Error(`Expected onEnd() callback in plugin ${x(t)} to return an object`);let e={},r=k(n,e,`errors`,E),i=k(n,e,`warnings`,E);A(n,e,`from onEnd() callback in plugin ${x(t)}`),r!=null&&(s=P(r,`errors`,l,t,void 0)),i!=null&&(c=P(i,`warnings`,l,t,void 0))}}catch(e){s=[we(e,i,l,o&&o(),t)]}if(s){n.push(...s);try{e.errors.push(...s)}catch{}}if(c){r.push(...c);try{e.warnings.push(...c)}catch{}}}t(n,r)})}),y=!0,{ok:!0,requestPlugins:v,runOnEndCallbacks:b,scheduleOnDisposeCallbacks:()=>{for(let e of h)setTimeout(()=>e(),0)}}});function Se(){let e=new Map,t=0;return{clear(){e.clear()},load(t){return e.get(t)},store(n){if(n===void 0)return-1;let r=t++;return e.set(r,n),r}}}function Ce(e,t,n){let r,i=!1;return()=>{if(i)return r;i=!0;try{let i=(e.stack+``).split(`
`);i.splice(1,1);let a=Te(t,i,n);if(a)return r={text:e.message,location:a},r}catch{}}}function we(e,t,n,r,i){let a=`Internal error`,o=null;try{a=(e&&e.message||e)+``}catch{}try{o=Te(t,(e.stack+``).split(`
`),``)}catch{}return{id:``,pluginName:i,text:a,location:o,notes:r?[r]:[],detail:n?n.store(e):-1}}function Te(e,t,n){let r=`    at `;if(e.readFileSync&&!t[0].startsWith(r)&&t[1].startsWith(r))for(let i=1;i<t.length;i++){let a=t[i];if(a.startsWith(r))for(a=a.slice(7);;){let r=/^(?:new |async )?\S+ \((.*)\)$/.exec(a);if(r){a=r[1];continue}if(r=/^eval at \S+ \((.*)\)(?:, \S+:\d+:\d+)?$/.exec(a),r){a=r[1];continue}if(r=/^(\S+):(\d+):(\d+)$/.exec(a),r){let i;try{i=e.readFileSync(r[1],`utf8`)}catch{break}let a=i.split(/\r\n|\r|\n|\u2028|\u2029/)[r[2]-1]||``,o=r[3]-1,s=a.slice(o,o+n.length)===n?n.length:0;return{file:r[1],namespace:`file`,line:+r[2],column:p(a.slice(0,o)).length,length:p(a.slice(o,o+s)).length,lineText:a+`
`+t.slice(1).join(`
`),suggestion:``}}break}}return null}function N(e,t,n){e+=t.length<1?``:` with ${t.length} error${t.length<2?``:`s`}:`+t.slice(0,6).map((e,t)=>{if(t===5)return`
...`;if(!e.location)return`
error: ${e.text}`;let{file:n,line:r,column:i}=e.location;return`
${n}:${r}:${i}: ERROR: ${e.pluginName?`[plugin: ${e.pluginName}] `:``}${e.text}`}).join(``);let r=Error(e);for(let[e,i]of[[`errors`,t],[`warnings`,n]])Object.defineProperty(r,e,{configurable:!0,enumerable:!0,get:()=>i,set:t=>Object.defineProperty(r,e,{configurable:!0,enumerable:!0,value:t})});return r}function Ee(e,t){for(let n of e)n.detail=t.load(n.detail);return e}function De(e,t,n){if(e==null)return null;let r={},i=k(e,r,`file`,w),a=k(e,r,`namespace`,w),o=k(e,r,`line`,T),s=k(e,r,`column`,T),c=k(e,r,`length`,T),l=k(e,r,`lineText`,w),u=k(e,r,`suggestion`,w);if(A(e,r,t),l){let e=l.slice(0,(s&&s>0?s:0)+(c&&c>0?c:0)+(n&&n>0?n:80));!/[\x7F-\uFFFF]/.test(e)&&!/\n/.test(l)&&(l=e)}return{file:i||``,namespace:a||``,line:o||0,column:s||0,length:c||0,lineText:l||``,suggestion:u||``}}function P(e,t,n,r,i){let a=[],o=0;for(let s of e){let e={},c=k(s,e,`id`,w),l=k(s,e,`pluginName`,w),u=k(s,e,`text`,w),d=k(s,e,`location`,ce),f=k(s,e,`notes`,E),p=k(s,e,`detail`,S),m=`in element ${o} of "${t}"`;A(s,e,m);let h=[];if(f)for(let e of f){let t={},n=k(e,t,`text`,w),r=k(e,t,`location`,ce);A(e,t,m),h.push({text:n||``,location:De(r,m,i)})}a.push({id:c||``,pluginName:l||r,text:u||``,location:De(d,m,i),notes:h,detail:n?n.store(p):-1}),o++}return a}function Oe(e,t){let n=[];for(let r of e){if(typeof r!=`string`)throw Error(`${x(t)} must be an array of strings`);n.push(r)}return n}function ke(e,t){let n=Object.create(null);for(let r in e){let i=e[r];if(typeof i!=`string`)throw Error(`key ${x(r)} in object ${x(t)} must be a string`);n[r]=i}return n}function Ae({path:e,contents:t,hash:n}){let r=null;return{path:e,contents:t,hash:n,get text(){let e=this.contents;return(r===null||e!==t)&&(t=e,r=m(e)),r}}}function je(e){let t=e.source;return e.flags&&(t=`(?${e.flags})${t}`),t}function Me(e){let t;try{t=m(e)}catch{return b(e)}return JSON.parse(t)}var Ne=`0.28.1`,Pe=e=>We().build(e),Fe=e=>We().context(e),Ie=(e,t)=>We().transform(e,t),Le=(e,t)=>We().formatMessages(e,t),Re=(e,t)=>We().analyzeMetafile(e,t),ze=()=>{throw Error(`The "buildSync" API only works in node`)},F=()=>{throw Error(`The "transformSync" API only works in node`)},Be=()=>{throw Error(`The "formatMessagesSync" API only works in node`)},I=()=>{throw Error(`The "analyzeMetafileSync" API only works in node`)},Ve=()=>(He&&He(),Promise.resolve()),L,He,Ue,We=()=>{if(Ue)return Ue;throw Error(L?`You need to wait for the promise returned from "initialize" to be resolved before calling this`:`You need to call "initialize" before calling this`)},Ge=e=>{e=j(e||{});let t=e.wasmURL,n=e.wasmModule,r=e.worker!==!1;if(!t&&!n)throw Error(`Must provide either the "wasmURL" option or the "wasmModule" option`);if(L)throw Error(`Cannot call "initialize" more than once`);return L=Ke(t||``,n,r),L.catch(()=>{L=void 0}),L},Ke=(e,t,n)=>c(null,null,function*(){let r,i,a=new Promise(e=>i=e);if(n){let e=new Blob([`onmessage=((postMessage) => {
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
        go.argv = ["", \`--service=\${"0.28.1"}\`];
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
    })(postMessage)`],{type:`text/javascript`});r=new Worker(URL.createObjectURL(e))}else{let e=(e=>{var t=(e,t,n)=>new Promise((r,i)=>{var a=e=>{try{s(n.next(e))}catch(e){i(e)}},o=e=>{try{s(n.throw(e))}catch(e){i(e)}},s=e=>e.done?r(e.value):Promise.resolve(e.value).then(a,o);s((n=n.apply(e,t)).next())});let n,r={};for(let e=self;e;e=Object.getPrototypeOf(e))for(let t of Object.getOwnPropertyNames(e))t in r||Object.defineProperty(r,t,{get:()=>self[t]});(()=>{let e=()=>{let e=Error(`not implemented`);return e.code=`ENOSYS`,e};if(!r.fs){let t=``;r.fs={constants:{O_WRONLY:-1,O_RDWR:-1,O_CREAT:-1,O_TRUNC:-1,O_APPEND:-1,O_EXCL:-1,O_DIRECTORY:-1},writeSync(e,n){t+=i.decode(n);let r=t.lastIndexOf(`
`);return r!=-1&&(console.log(t.substring(0,r)),t=t.substring(r+1)),n.length},write(t,n,r,i,a,o){if(r!==0||i!==n.length||a!==null){o(e());return}o(null,this.writeSync(t,n))},chmod(t,n,r){r(e())},chown(t,n,r,i){i(e())},close(t,n){n(e())},fchmod(t,n,r){r(e())},fchown(t,n,r,i){i(e())},fstat(t,n){n(e())},fsync(e,t){t(null)},ftruncate(t,n,r){r(e())},lchown(t,n,r,i){i(e())},link(t,n,r){r(e())},lstat(t,n){n(e())},mkdir(t,n,r){r(e())},open(t,n,r,i){i(e())},read(t,n,r,i,a,o){o(e())},readdir(t,n){n(e())},readlink(t,n){n(e())},rename(t,n,r){r(e())},rmdir(t,n){n(e())},stat(t,n){n(e())},symlink(t,n,r){r(e())},truncate(t,n,r){r(e())},unlink(t,n){n(e())},utimes(t,n,r,i){i(e())}}}if(r.process||={getuid(){return-1},getgid(){return-1},geteuid(){return-1},getegid(){return-1},getgroups(){throw e()},pid:-1,ppid:-1,umask(){throw e()},cwd(){throw e()},chdir(){throw e()}},r.path||={resolve(...e){return e.join(`/`)}},!r.crypto)throw Error(`globalThis.crypto is not available, polyfill required (crypto.getRandomValues only)`);if(!r.performance)throw Error(`globalThis.performance is not available, polyfill required (performance.now only)`);if(!r.TextEncoder)throw Error(`globalThis.TextEncoder is not available, polyfill required`);if(!r.TextDecoder)throw Error(`globalThis.TextDecoder is not available, polyfill required`);let n=new TextEncoder(`utf-8`),i=new TextDecoder(`utf-8`);r.Go=class{constructor(){this.argv=[`js`],this.env={},this.exit=e=>{e!==0&&console.warn(`exit code:`,e)},this._exitPromise=new Promise(e=>{this._resolveExitPromise=e}),this._pendingEvent=null,this._scheduledTimeouts=new Map,this._nextCallbackTimeoutID=1;let e=(e,t)=>{this.mem.setUint32(e+0,t,!0),this.mem.setUint32(e+4,Math.floor(t/4294967296),!0)},t=e=>this.mem.getUint32(e+0,!0)+this.mem.getInt32(e+4,!0)*4294967296,a=e=>{let t=this.mem.getFloat64(e,!0);if(t===0)return;if(!isNaN(t))return t;let n=this.mem.getUint32(e,!0);return this._values[n]},o=(e,t)=>{let n=2146959360;if(typeof t==`number`&&t!==0){if(isNaN(t)){this.mem.setUint32(e+4,n,!0),this.mem.setUint32(e,0,!0);return}this.mem.setFloat64(e,t,!0);return}if(t===void 0){this.mem.setFloat64(e,0,!0);return}let r=this._ids.get(t);r===void 0&&(r=this._idPool.pop(),r===void 0&&(r=this._values.length),this._values[r]=t,this._goRefCounts[r]=0,this._ids.set(t,r)),this._goRefCounts[r]++;let i=0;switch(typeof t){case`object`:t!==null&&(i=1);break;case`string`:i=2;break;case`symbol`:i=3;break;case`function`:i=4;break}this.mem.setUint32(e+4,n|i,!0),this.mem.setUint32(e,r,!0)},s=e=>{let n=t(e+0),r=t(e+8);return new Uint8Array(this._inst.exports.mem.buffer,n,r)},c=e=>{let n=t(e+0),r=t(e+8),i=Array(r);for(let e=0;e<r;e++)i[e]=a(n+e*8);return i},l=e=>{let n=t(e+0),r=t(e+8);return i.decode(new DataView(this._inst.exports.mem.buffer,n,r))},u=(e,t)=>(this._inst.exports.testExport0(),this._inst.exports.testExport(e,t)),d=Date.now()-performance.now();this.importObject={_gotest:{add:(e,t)=>e+t,callExport:u},gojs:{"runtime.wasmExit":e=>{e>>>=0;let t=this.mem.getInt32(e+8,!0);this.exited=!0,delete this._inst,delete this._values,delete this._goRefCounts,delete this._ids,delete this._idPool,this.exit(t)},"runtime.wasmWrite":e=>{e>>>=0;let n=t(e+8),i=t(e+16),a=this.mem.getInt32(e+24,!0);r.fs.writeSync(n,new Uint8Array(this._inst.exports.mem.buffer,i,a))},"runtime.resetMemoryDataView":e=>{e>>>=0,this.mem=new DataView(this._inst.exports.mem.buffer)},"runtime.nanotime1":t=>{t>>>=0,e(t+8,(d+performance.now())*1e6)},"runtime.walltime":t=>{t>>>=0;let n=new Date().getTime();e(t+8,n/1e3),this.mem.setInt32(t+16,n%1e3*1e6,!0)},"runtime.scheduleTimeoutEvent":e=>{e>>>=0;let n=this._nextCallbackTimeoutID;this._nextCallbackTimeoutID++,this._scheduledTimeouts.set(n,setTimeout(()=>{for(this._resume();this._scheduledTimeouts.has(n);)console.warn(`scheduleTimeoutEvent: missed timeout event`),this._resume()},t(e+8))),this.mem.setInt32(e+16,n,!0)},"runtime.clearTimeoutEvent":e=>{e>>>=0;let t=this.mem.getInt32(e+8,!0);clearTimeout(this._scheduledTimeouts.get(t)),this._scheduledTimeouts.delete(t)},"runtime.getRandomData":e=>{e>>>=0,crypto.getRandomValues(s(e+8))},"syscall/js.finalizeRef":e=>{e>>>=0;let t=this.mem.getUint32(e+8,!0);if(this._goRefCounts[t]--,this._goRefCounts[t]===0){let e=this._values[t];this._values[t]=null,this._ids.delete(e),this._idPool.push(t)}},"syscall/js.stringVal":e=>{e>>>=0,o(e+24,l(e+8))},"syscall/js.valueGet":e=>{e>>>=0;let t=Reflect.get(a(e+8),l(e+16));e=this._inst.exports.getsp()>>>0,o(e+32,t)},"syscall/js.valueSet":e=>{e>>>=0,Reflect.set(a(e+8),l(e+16),a(e+32))},"syscall/js.valueDelete":e=>{e>>>=0,Reflect.deleteProperty(a(e+8),l(e+16))},"syscall/js.valueIndex":e=>{e>>>=0,o(e+24,Reflect.get(a(e+8),t(e+16)))},"syscall/js.valueSetIndex":e=>{e>>>=0,Reflect.set(a(e+8),t(e+16),a(e+24))},"syscall/js.valueCall":e=>{e>>>=0;try{let t=a(e+8),n=Reflect.get(t,l(e+16)),r=c(e+32),i=Reflect.apply(n,t,r);e=this._inst.exports.getsp()>>>0,o(e+56,i),this.mem.setUint8(e+64,1)}catch(t){e=this._inst.exports.getsp()>>>0,o(e+56,t),this.mem.setUint8(e+64,0)}},"syscall/js.valueInvoke":e=>{e>>>=0;try{let t=a(e+8),n=c(e+16),r=Reflect.apply(t,void 0,n);e=this._inst.exports.getsp()>>>0,o(e+40,r),this.mem.setUint8(e+48,1)}catch(t){e=this._inst.exports.getsp()>>>0,o(e+40,t),this.mem.setUint8(e+48,0)}},"syscall/js.valueNew":e=>{e>>>=0;try{let t=a(e+8),n=c(e+16),r=Reflect.construct(t,n);e=this._inst.exports.getsp()>>>0,o(e+40,r),this.mem.setUint8(e+48,1)}catch(t){e=this._inst.exports.getsp()>>>0,o(e+40,t),this.mem.setUint8(e+48,0)}},"syscall/js.valueLength":t=>{t>>>=0,e(t+16,parseInt(a(t+8).length))},"syscall/js.valuePrepareString":t=>{t>>>=0;let r=n.encode(String(a(t+8)));o(t+16,r),e(t+24,r.length)},"syscall/js.valueLoadString":e=>{e>>>=0;let t=a(e+8);s(e+16).set(t)},"syscall/js.valueInstanceOf":e=>{e>>>=0,this.mem.setUint8(e+24,+(a(e+8)instanceof a(e+16)))},"syscall/js.copyBytesToGo":t=>{t>>>=0;let n=s(t+8),r=a(t+32);if(!(r instanceof Uint8Array||r instanceof Uint8ClampedArray)){this.mem.setUint8(t+48,0);return}let i=r.subarray(0,n.length);n.set(i),e(t+40,i.length),this.mem.setUint8(t+48,1)},"syscall/js.copyBytesToJS":t=>{t>>>=0;let n=a(t+8),r=s(t+16);if(!(n instanceof Uint8Array||n instanceof Uint8ClampedArray)){this.mem.setUint8(t+48,0);return}let i=r.subarray(0,n.length);n.set(i),e(t+40,i.length),this.mem.setUint8(t+48,1)},debug:e=>{console.log(e)}}}}run(e){return t(this,null,function*(){if(!(e instanceof WebAssembly.Instance))throw Error(`Go.run: WebAssembly.Instance expected`);this._inst=e,this.mem=new DataView(this._inst.exports.mem.buffer),this._values=[NaN,0,null,!0,!1,r,this],this._goRefCounts=Array(this._values.length).fill(1/0),this._ids=new Map([[0,1],[null,2],[!0,3],[!1,4],[r,5],[this,6]]),this._idPool=[],this.exited=!1;let t=4096,i=e=>{let r=t,i=n.encode(e+`\0`);return new Uint8Array(this.mem.buffer,t,i.length).set(i),t+=i.length,t%8!=0&&(t+=8-t%8),r},a=this.argv.length,o=[];this.argv.forEach(e=>{o.push(i(e))}),o.push(0),Object.keys(this.env).sort().forEach(e=>{o.push(i(`${e}=${this.env[e]}`))}),o.push(0);let s=t;if(o.forEach(e=>{this.mem.setUint32(t,e,!0),this.mem.setUint32(t+4,0,!0),t+=8}),t>=12288)throw Error(`total length of command line and environment variables exceeds limit`);this._inst.exports.run(a,s),this.exited&&this._resolveExitPromise(),yield this._exitPromise})}_resume(){if(this.exited)throw Error(`Go program has already exited`);this._inst.exports.resume(),this.exited&&this._resolveExitPromise()}_makeFuncWrapper(e){let t=this;return function(){let n={id:e,this:this,args:arguments};return t._pendingEvent=n,t._resume(),n.result}}}})(),n=({data:t})=>{let a=new TextDecoder,o=r.fs,s=``;o.writeSync=(t,n)=>{if(t===1)e(n);else if(t===2){s+=a.decode(n);let e=s.split(`
`);e.length>1&&console.log(e.slice(0,-1).join(`
`)),s=e[e.length-1]}else throw Error(`Bad write`);return n.length};let c=[],l,u=0;n=({data:e})=>(e.length>0&&(c.push(e),l&&l()),d),o.read=(e,t,n,r,i,a)=>{if(e!==0||n!==0||r!==t.length||i!==null)throw Error(`Bad read`);if(c.length===0){l=()=>o.read(e,t,n,r,i,a);return}let s=c[0],d=Math.max(0,Math.min(r,s.length-u));t.set(s.subarray(u,u+d),n),u+=d,u===s.length&&(c.shift(),u=0),a(null,d)};let d=new r.Go;return d.argv=[``,`--service=0.28.1`],i(t,d).then(t=>{e(null),d.run(t)},t=>{e(t)}),d};function i(e,n){return t(this,null,function*(){if(e instanceof WebAssembly.Module)return WebAssembly.instantiate(e,n.importObject);let t=yield fetch(e);if(!t.ok)throw Error(`Failed to download ${JSON.stringify(e)}`);if(`instantiateStreaming`in WebAssembly&&/^application\/wasm($|;)/i.test(t.headers.get(`Content-Type`)||``))return(yield WebAssembly.instantiateStreaming(t,n.importObject)).instance;let r=yield t.arrayBuffer();return(yield WebAssembly.instantiate(r,n.importObject)).instance})}return e=>n(e)})(e=>r.onmessage({data:e})),t;r={onmessage:null,postMessage:n=>setTimeout(()=>{try{t=e({data:n})}catch(e){i(e)}}),terminate(){if(t)for(let e of t._scheduledTimeouts.values())clearTimeout(e)}}}let o,s,c=new Promise((e,t)=>{o=e,s=t});r.onmessage=({data:e})=>{r.onmessage=({data:e})=>u(e),e?s(e):o()},r.postMessage(t||new URL(e,location.href).toString());let{readFromStdout:u,service:d}=ye({writeToStdin(e){r.postMessage(e)},isSync:!1,hasFS:!1,esbuild:l});yield c,He=()=>{r.terminate(),L=void 0,He=void 0,Ue=void 0},Ue={build:e=>new Promise((t,n)=>{a.then(n),d.buildOrContext({callName:`build`,refs:null,options:e,isTTY:!1,defaultWD:`/`,callback:(e,r)=>e?n(e):t(r)})}),context:e=>new Promise((t,n)=>{a.then(n),d.buildOrContext({callName:`context`,refs:null,options:e,isTTY:!1,defaultWD:`/`,callback:(e,r)=>e?n(e):t(r)})}),transform:(e,t)=>new Promise((n,r)=>{a.then(r),d.transform({callName:`transform`,refs:null,input:e,options:t||{},isTTY:!1,fs:{readFile(e,t){t(Error(`Internal error`),null)},writeFile(e,t){t(null)}},callback:(e,t)=>e?r(e):n(t)})}),formatMessages:(e,t)=>new Promise((n,r)=>{a.then(r),d.formatMessages({callName:`formatMessages`,refs:null,messages:e,options:t,callback:(e,t)=>e?r(e):n(t)})}),analyzeMetafile:(e,t)=>new Promise((n,r)=>{a.then(r),d.analyzeMetafile({callName:`analyzeMetafile`,refs:null,metafile:typeof e==`string`?e:JSON.stringify(e),options:t,callback:(e,t)=>e?r(e):n(t)})})}}),qe=l})(typeof t==`object`?t:{set exports(e){(typeof self<`u`?self:this).esbuild=e}})}))(),1),Vr=`/asljs/assets/esbuild-eina1h7z.wasm`;function W(e){return new Promise((t,n)=>{e.addEventListener(`success`,()=>{t(e.result)}),e.addEventListener(`error`,()=>{n(e.error??Error(`IndexedDB request failed`))})})}function Hr(e,t){return new Promise((n,r)=>{let i=indexedDB.open(e,t.length);i.addEventListener(`upgradeneeded`,e=>{let n=t.slice(e.oldVersion,e.newVersion??t.length);for(let e of n)e(i.result)}),i.addEventListener(`success`,()=>{n(i.result)}),i.addEventListener(`blocked`,()=>{r(Error(`Database opening is blocked`))}),i.addEventListener(`error`,()=>{r(i.error??Error(`Failed to open database`))})})}var Ur=`asljs-app-builder`,Wr=null;async function Gr(){return Wr===null&&(Wr=await Hr(Ur,[e=>{e.createObjectStore(`apps`,{keyPath:`id`}),e.createObjectStore(`files`,{keyPath:`id`}).createIndex(`byAppId`,`appId`,{unique:!1})},e=>{e.createObjectStore(`chatSecrets`,{keyPath:`appId`})},Kr])),Wr}function Kr(e){e.objectStoreNames.contains(`apps`)||e.createObjectStore(`apps`,{keyPath:`id`}),e.objectStoreNames.contains(`files`)||e.createObjectStore(`files`,{keyPath:`id`}).createIndex(`byAppId`,`appId`,{unique:!1}),e.objectStoreNames.contains(`chatSecrets`)||e.createObjectStore(`chatSecrets`,{keyPath:`appId`})}async function qr(){return W((await Gr()).transaction(`apps`,`readonly`).objectStore(`apps`).getAll())}async function Jr(e){await W((await Gr()).transaction(`apps`,`readwrite`).objectStore(`apps`).put(e))}async function Yr(e){let t=(await Gr()).transaction([`apps`,`files`,`chatSecrets`],`readwrite`);await W(t.objectStore(`apps`).delete(e));let n=t.objectStore(`files`),r=await W(n.index(`byAppId`).getAllKeys(e));for(let e of r)await W(n.delete(e));await W(t.objectStore(`chatSecrets`).delete(e))}async function Xr(e){return W((await Gr()).transaction(`files`,`readonly`).objectStore(`files`).index(`byAppId`).getAll(e))}async function Zr(e){await W((await Gr()).transaction(`files`,`readwrite`).objectStore(`files`).put(e))}async function Qr(e){await W((await Gr()).transaction(`files`,`readwrite`).objectStore(`files`).delete(e))}async function $r(e,t){let n=(await Gr()).transaction(`files`,`readwrite`).objectStore(`files`),r=await W(n.index(`byAppId`).getAllKeys(e));for(let e of r)await W(n.delete(e));for(let e of t)await W(n.put(e))}async function ei(e){let t=await W((await Gr()).transaction(`chatSecrets`,`readonly`).objectStore(`chatSecrets`).get(e));return typeof t?.openAiApiKey==`string`?t.openAiApiKey:``}async function ti(e,t){await W((await Gr()).transaction(`chatSecrets`,`readwrite`).objectStore(`chatSecrets`).put({appId:e,openAiApiKey:t}))}var ni=`asljs-app-builder:chat-state:`;function ri(e){return{getOpenAiApiKey:async()=>ei(e.appId),getChatModel:async()=>e.readChatModel(),getInitialToolStepLimit:async()=>e.readInitialToolStepLimit()}}function ii(e){let t=`${ni}${e}`;return{load:async()=>{try{let e=sessionStorage.getItem(t);return e===null||e.trim()===``?{}:JSON.parse(e)}catch{return{}}},save:async e=>{sessionStorage.setItem(t,JSON.stringify(e))}}}var ai='# ASLJS Components AI Guidance\n\n## Purpose\n\nUse this file as AI-facing guidance for `asljs-components`.\n\nThis package currently exports the `AssistedInput`, `Button`, `Keyboard`,\n`Letterpad`, `List`, `Numpad`, `Properties`, `Select`, and `TextInput` UI\nclasses/components, the `AiChat` custom element plus AI chat model helpers and\ntransport classes (`OpenAiTransport`), the `AiChatKeyPrompt` custom element for\nuser-supplied API key collection, the `FileView` web component plus file\nhandlers, runtime component model definitions, package theming helpers, a theme\nprovider custom element, and related types.\n\n## Package Scope\n\nExports from `src/index.ts`:\n\n- `AiChat`\n- `AiChatKeyPrompt`\n- `createAiChatModel`\n- `serializeAiChatModelState`\n- `OpenAiTransport`\n- `createBootstrapTheme`\n- `AiChatModelDefinition`\n- `AssistedInput`\n- `AssistedInputModelDefinition`\n- `Button`\n- `ButtonModelDefinition`\n- `FileView`\n- `FileViewModelDefinition`\n- `Keyboard`\n- `KeyboardModelDefinition`\n- `Letterpad`\n- `LetterpadModelDefinition`\n- `Numpad`\n- `NumpadModelDefinition`\n- `Properties`\n- `PropertiesModelDefinition`\n- `createPdfFileHandler`\n- `createImageFileHandler`\n- `createTextFileHandler`\n- `createTextEditorFileHandler`\n- `List`\n- `ListModelDefinition`\n- `Select`\n- `SelectModelDefinition`\n- `TextInput`\n- `TextInputModelDefinition`\n- `ThemeProvider`\n- `ThemeProviderModelDefinition`\n- `findThemeProvider`\n- `getComponentVariantList`\n- `getDefaultTheme`\n- `resolveThemeText`\n- `resolveThemeTemplate`\n- `setDefaultTheme`\n- `THEME_CHANGED_EVENT_NAME`\n- `THEME_PROVIDER_TAG_NAME`\n- `AiChatAfterResponseContext`\n- `AiChatBeforeSendContext`\n- `AiChatBuildRequestArgs`\n- `AiChatChoiceOption`\n- `AiChatChoicePrompt`\n- `AiChatInitializeContext`\n- `AiChatMessage`\n- `AiChatMessages`\n- `AiChatMessageRole`\n- `AiChatModel`\n- `AiChatOptions`\n- `AiChatTransport`\n- `AiChatProgressState`\n- `AiChatResponsesInputItem`\n- `AiChatSecretsAndSettingsProvider`\n- `AiChatSerializableState`\n- `AiChatStateStore`\n- `AiChatToolDefinition`\n- `AiChatToolStepLimitContext`\n- `AiChatKeySubmitDetail`\n- `AssistedInputButtonDefinition`\n- `AssistedInputKeyDetail`\n- `ComponentModelDefinition`\n- `ComponentModelPropertyDefinition`\n- `ComponentModelPropertyType`\n- `ButtonVariantThemeDefinition`\n- `ButtonThemeDefinition`\n- `ComponentsTheme`\n- `FileHandler`\n- `FileHandlerRenderContext`\n- `FileHandlerRenderResult`\n- `FileViewData`\n- `FileViewProvider`\n- `KeyboardKeyDetail`\n- `LetterpadKeyDetail`\n- `ListThemeDefinition`\n- `SelectChangeDetail`\n- `SelectItem`\n- `SelectStatus`\n- `SelectThemeDefinition`\n- `SelectValidator`\n- `NumpadKeyDetail`\n- `TextInputChangeDetail`\n- `TextInputEnterKeyBehavior`\n- `TextInputStatus`\n- `TextInputThemeDefinition`\n- `TextInputValidator`\n- `ThemeProviderLike`\n- `ThemeTextFactory`\n- `ThemeTextValue`\n- `ThemeTemplateValue`\n- `ThemeTemplateFactory`\n- `ListItem`\n- `ListItemsSource`\n- `ListRowContext`\n\nCurrent custom elements:\n\n- `asljs-ai-chat`\n- `asljs-ai-chat-key`\n- `asljs-file`\n- `asljs-list`\n- `asljs-button`\n- `asljs-properties`\n- `asljs-keyboard`\n- `asljs-numpad`\n- `asljs-letterpad`\n- `asljs-select`\n- `asljs-text-input`\n- `asljs-theme-provider`\n\nCurrent non-custom-element UI surface:\n\n- `AssistedInput`\n\n## AI Quick Reference\n\nComponent contract at a glance:\n\n- import with `import \'asljs-components\';`\n- custom elements: `asljs-ai-chat`, `asljs-ai-chat-key`, `asljs-button`,\n  `asljs-file`, `asljs-keyboard`, `asljs-letterpad`, `asljs-list`,\n  `asljs-numpad`, `asljs-properties`, `asljs-select`, `asljs-text-input`,\n  `asljs-theme-provider`\n- AI chat state lives on `asljs-ai-chat` direct properties (`messages`,\n  `promptDraft`, and related fields)\n- `options.transport` sets the HTTP transport for `asljs-ai-chat`; if omitted,\n  the component falls back to `options.provider.getOpenAiApiKey()`\n- `OpenAiTransport` is the built-in OpenAI Responses API transport class;\n  construct with an API key string\n- `asljs-ai-chat-key` is a small form component that collects an API key from\n  the user; it dispatches a `key-submit` event with `{ detail: { key } }` when\n  the user submits the key\n- `AssistedInput` is the shared Lit base for keyboard-like input surfaces\n- button rendering uses explicit `icon`, `text`, `buttonClassName`, and\n  optional `variant`; theme lookup checks variant-specific overrides first,\n  then base button defaults, with built-in package defaults for `add`,\n  `delete`, and `settings`\n- runtime model metadata is exported through `*ModelDefinition` values whose\n  `properties` arrays describe runtime-visible property names, types, and edit\n  metadata\n- `asljs-properties` renders generated editors from a model definition plus a\n  target object, using `asljs-text-input` for string/number and `asljs-select`\n  for boolean values\n- file viewing uses provider + ordered handler matching\n- keyboard uses a fixed QWERTY layout, a `characters` filter, and bubbling\n  `key` plus `submit` events\n- letterpad uses a fixed alphabetic layout, a `characters` filter, a\n  `collapsed` toggle, and bubbling `key` plus `submit` events\n- numpad uses a fixed keypad layout, a `characters` filter, and bubbling\n  `key` events\n- text input editing uses explicit properties plus `input` and `change`\n  events whose detail reports draft value, validity, and dirty state\n- theme provider element: `asljs-theme-provider`\n- required row template: `template[data-slot="item"]`\n- optional templates: `template[data-slot="empty"]` and\n  `template[data-slot="container"]`\n- optional text-input template: `template[data-slot="template"]`\n- optional text-input control templates: `template[data-slot="input"]` and\n  `template[data-slot="textarea"]`\n- optional select template: `template[data-slot="template"]`\n- optional select control template: `template[data-slot="select"]`\n- theme fallback order: local slot template -> `list.theme` -> nearest\n  `asljs-theme-provider` -> package default theme\n- container templates must include `[data-role="items"]`\n- text-input templates must include `[data-role="control-host"]`\n- text-input control templates must include a real `input` or `textarea`\n  element that matches the slot name\n- row bindings expose `item`, `index`, `first`, `last`, `odd`, `even`,\n  `count`, and `context`\n\nUse this package when:\n\n- you want reusable web components already designed for ASLJS patterns\n- you want a packaged UI surface with an explicit state contract and a custom\n  element tag\n- you specifically want `asljs-list` rather than raw DOM binding\n\nUse another package when:\n\n- you only need DOM binding -> `asljs-data-binding`\n- you need state reactivity -> `asljs-observable`\n- you need event primitives -> `asljs-eventful`\n\n## General Component Patterns\n\nThe package currently uses more than one component form.\n\n- `AssistedInput` is a shared Lit base class for keyboard-like inputs.\n- `FileView` is a Lit custom element driven by provider and handler properties.\n- `Keyboard` is a Lit custom element driven by a `characters` filter and event\n  dispatch through `AssistedInput`.\n- `Letterpad` is a Lit custom element driven by `characters`, `collapsed`, and\n  event dispatch through `AssistedInput`.\n- `List` is a Lit custom element with explicit properties.\n- `Button` is a Lit custom element driven by explicit icon/text properties,\n  an optional `variant`, and theme-backed defaults.\n- `Properties` is a Lit custom element that renders a generated property form\n  from runtime model metadata.\n- `Numpad` is a Lit custom element driven by a `characters` filter and key\n  event dispatch through `AssistedInput`.\n- `Select` is a Lit custom element with explicit items, validation, and\n  template properties.\n- `TextInput` is a Lit custom element with explicit reset-value, validation,\n  and template properties.\n- `ThemeProvider` is a lightweight `HTMLElement` provider.\n- `AiChat` is a Lit custom element with explicit state properties and `options`.\n- `AiChatKeyPrompt` is a Lit custom element that renders an API key input form;\n  it dispatches `key-submit` on the DOM when the user submits a non-empty key.\n\nPreserve the shared design rules across those forms.\n\n- keep state explicit on the custom element and separate from rendering\n- use the simplest rendering surface that fits the runtime need\n- keep model-to-view synchronization explicit\n- clean up subscriptions and listeners when components detach or rebind\n\n## Preferred Usage Patterns\n\n### Use ordered handlers for file display\n\nInside `asljs-file`, configure:\n\n- `provider.loadFile(fileName)` to return normalized file data\n- `handlers` ordered from most specific to most general\n- `fileName` for the selected file\n\nThe first handler whose `canDisplay(...)` returns true owns rendering.\n\nPrefer package handlers when they fit:\n\n- `createPdfFileHandler()`\n- `createImageFileHandler()`\n- `createTextFileHandler()`\n- `createTextEditorFileHandler()`\n\nIf text editing must persist, provide `provider.saveText(...)`.\n\n### Register components once\n\n```ts\nimport \'asljs-components\';\n```\n\nCreate and configure elements through normal DOM APIs.\n\n### Use the base button for icon-plus-text actions\n\nInside `asljs-button`, configure:\n\n- `icon` as an HTML string for the icon markup\n- `text` as the visible label\n- `variant` when the button should use theme-provided defaults such as `add`,\n  `delete`, or `settings`\n- `buttonClassName` when host CSS needs to target the inner native button\n- `type` and `disabled` for native button behavior\n\nPrefer `variant="add"`, `variant="delete"`, or `variant="settings"` when\ntheir defaults fit. Theme overrides live under\n`button.variants.<variantName>.icon`, `.text`, and `.className`. Explicit\n`icon`, `text`, and `buttonClassName` values still win over theme defaults.\n\nIf Bootstrap icon markup is desired, prefer `createBootstrapTheme()` over\nduplicating raw icon HTML literals at multiple call sites.\n\n### Use explicit reset-value semantics for text input\n\nInside `asljs-text-input`, configure:\n\n- `value` as the external set/reset value\n- `validator` to return an error message or `null`\n- `multiline` and `enterKeyBehavior` for editing behavior\n- `autoExtend` plus `autoExtendMaxRows` for textarea growth\n- `theme` or a local `template[data-slot="template"]` for layout override\n- local `template[data-slot="input"]` or `template[data-slot="textarea"]`\n  for themed native control markup override\n\nUser edits update `draftValue` and `status`; they do not mutate `value`\ndirectly. Consumers should listen for `input` or `change` and decide whether\nto persist or reset.\n\n### Use explicit items/value semantics for select\n\nInside `asljs-select`, configure:\n\n- `items` as explicit `{ value, label, disabled? }` entries\n- `value` as the external set/reset selection\n- `validator` to return an error message or `null`\n- `placeholder` when an empty prompt option should be shown first\n- `controlClassName` when host CSS needs to target the inner native `select`\n- `theme` or a local `template[data-slot="template"]` for layout override\n- local `template[data-slot="select"]` for themed control markup override\n\nUser selection updates `draftValue` and `status`; it does not mutate `value`\ndirectly. Consumers should listen for `input` or `change` and decide whether\nto persist or reset.\n\n### Use explicit state/options semantics for AI chat\n\nInside `asljs-ai-chat`, configure:\n\n- `messages`, `promptDraft`, and related chat state directly\n  on the custom element\n- `options` as the request/persistence/tool callbacks the chat runtime needs\n- `messages` as a store object (`save(...)`, `read()`, and `list`)\n- rely on default sessionStorage persistence when `options.stateStore` is omitted\n\nThe chat element owns the rendered conversation UI and the primary state\nsurface.\n\n### Keep text-input templates control-host based\n\nIf a local or themed template is used for `asljs-text-input`, it must include\n`[data-role="control-host"]`. That host is where the real `input` or\n`textarea` is mounted.\n\nIf a local or themed `template[data-slot="input"]` or\n`template[data-slot="textarea"]` is used, it must include the matching native\ncontrol element. Wrappers around that control are allowed.\n\nTemplate bindings may include any supported `asljs-data-binding` expressions\nneeded for label, description, error, or state classes.\n\n### Use slot templates for rendering\n\nInside `asljs-list`, use:\n\n- required: `template[data-slot="item"]`\n- optional: `template[data-slot="empty"]`\n- optional: `template[data-slot="container"]` with required\n  `[data-role="items"]`\n\nIf `items` is non-empty and no item template is provided, the component warns\nand renders nothing.\n\n### Use themes as template defaults\n\nThemes provide fallback templates. They do not replace slot-template authoring.\n\nPreferred resolution order:\n\n- local `template[data-slot]`\n- per-component theme such as `list.theme` or `textInput.theme`\n- nearest `asljs-theme-provider`\n- `setDefaultTheme(...)`\n\nIf a local slot template exists, it must continue to win over the active theme.\n\n### Use row bindings through `asljs-data-binding`\n\nRow binding context fields are:\n\n- `item`\n- `index`\n- `first`\n- `last`\n- `odd`\n- `even`\n- `count`\n- `context`\n\nPrefer path-based binding expressions such as:\n\n- `item.title`\n- `index`\n- `context.select`\n\n### Use `list.context` for shared row actions and state\n\n`List.context` is the shared base context. Row rendering derives a row-local\ncontext that includes row-specific `item` and `index` values and binds base\ncontext methods to that derived object.\n\nIf a handler needs row data, prefer the `context` plus `this` pattern.\n\n## How Row Actions Receive Row Data\n\n- handlers should usually be referenced as `context.someAction`\n- row-specific values arrive through the derived row-local `this` context\n- the derived row context includes at least `item` and `index`\n- do not invent inline argument syntax like `select(item.id)`\n\n## Common Wrong Assumptions\n\n- this is React-style callback rendering\n- this is template-expression syntax with inline function calls\n- row actions should pass arguments in attributes\n- any container template shape is acceptable\n- item rendering is driven by imperative callbacks instead of templates\n\n## Constraints To Preserve\n\n- Keep row rendering template-driven.\n- Keep theme behavior template-driven and slot-compatible.\n- Keep `TextInput.value` as a set/reset input, not the live mutable draft.\n- Keep event bindings path-based; do not add parameter-expression syntax.\n- Do not introduce custom invocation protocols such as `*-args` or inline call\n  expressions for bindings.\n- `template[data-slot="container"]` must keep `[data-role="items"]` as the\n  insertion point.\n- `template[data-slot="template"]` for `TextInput` must keep\n  `[data-role="control-host"]` as the insertion point.\n- `template[data-slot="input"]` and `template[data-slot="textarea"]` for\n  `TextInput` must keep a matching native control element.\n- `List.items` can be a plain array or an eventful-like collection; when the\n  source emits `set`, `delete`, or `define`, list rerender behavior is part of\n  the current design.\n\n## Safe Authoring Rules\n\n- keep row templates declarative\n- use themes only as fallback template sources\n- use `TextInput.status` or emitted events for live draft state\n- use `context` methods for shared row actions\n- avoid custom attribute protocols\n- do not mutate slot templates at runtime\n- update `list.items` or the source collection instead of rewriting row DOM\n\n## Change Safety Checklist\n\n- If touching row rendering, then preserve template-driven rendering.\n- If touching theming, then preserve fallback precedence and local-template\n  override behavior.\n- If touching container handling, then preserve `[data-role="items"]` as the\n  insertion point.\n- If touching text-input layout handling, then preserve\n  `[data-role="control-host"]` as the insertion point.\n- If touching text-input control templating, then preserve matching native\n  `input` or `textarea` lookup for the documented control slots.\n- If touching row context, then preserve the documented field names.\n- If touching event binding integration, then preserve path-based\n  `asljs-data-binding` handler rules.\n- If touching item sources, then preserve rerender behavior for arrays and\n  eventful-like collections.\n\n## Validation\n\n- `npm -w asljs-components run test`\n- `npm -w asljs-components run typecheck`\n- `npm -w asljs-components run lint`\n\nUpdate this file when AI-facing constraints, exported surface expectations, or\nvalidation commands change. Update `README.md` separately only when\nuser-facing usage or behavior changes.\n',oi=`# ASLJS Dali AI Guidance

## Purpose

Use this file as AI-facing guidance for \`asljs-dali\`.

\`asljs-dali\` is an IndexedDB data layer centered on typed \`Table<T>\` access,
cross-tab observation, live views, transaction helpers, event-source helpers,
and saga helpers.

## Package Scope

Package exports from \`src/index.ts\` include:

- DB helpers: \`dbOpen\`, \`dbDelete\`, \`dbRequestAsync\`
- Tables and live views: \`Table\`, \`LiveRecord\`, \`LiveRecordSet\`
- Observation and broadcast types
- Version and delete strategies
- Transaction helpers: \`txRead\`, \`txWrite\`, \`txDone\`, \`txEnsure\`,
  \`txReuseOrCreate\`, \`TxMode\`
- Event-source helpers and managers
- Saga helpers and managers

## AI Quick Reference

Choose this API when:

- you need a one-time single-row read -> \`getOne(key)\`
- you need a one-time filtered scan -> \`scan(predicate)\`
- you need live single-row tracking -> \`record(key)\`
- you need live filtered tracking -> \`recordset(predicate)\`
- you need local-only mutation notifications -> \`notify(...)\`
- you need local plus remote committed notifications -> \`observe(...)\`

Public contracts:

- \`notify(...)\` is local-only
- \`observe(...)\` includes remote committed changes
- broadcasts happen only after successful commit
- remote messages are not re-published
- \`record(key)\` is key-based only
- \`recordset(predicate)\` is client-side predicate filtering only

What not to assume:

- joins are available
- server-style query planners are available
- \`recordset(predicate)\` performs DB-level query composition
- live sets imply automatic ordering semantics
- remote messages are echoed back out again

## Preferred Usage Patterns

- Model stores through \`Table<T>\` instead of ad hoc request plumbing.
- Use \`notify(...)\` for local-only subscribers.
- Use \`observe(...)\` only when cross-tab or remote-origin events are needed.
- Use \`record(key)\` and \`recordset(predicate)\` for live-first consumers.
- Use snapshot methods like \`getOne(...)\` and \`scan(...)\` when reactivity is
  not needed.
- Keep broadcast delivery post-commit only.

## Common Wrong Assumptions

- \`recordset(predicate)\` is a database query planner
- \`notify(...)\` includes remote tab changes
- \`observe(...)\` re-broadcasts remote changes
- live views imply joins or rich query composition
- broadcast delivery happens during tentative mutations instead of after
  commit

## Constraints To Preserve

- \`notify(...)\` must remain local-only.
- \`observe(...)\` must continue to receive local and remote committed changes.
- Remote messages must not be re-published by receiving table instances.
- Broadcast loop prevention through per-instance origin handling is part of the
  current contract.
- \`record(key)\` is key-based only; do not imply join/query semantics.
- \`recordset(predicate)\` is client-side predicate filtering; do not imply DB
  query composition, ordering, or joins.
- Keep optimistic concurrency behavior aligned with the exported version
  strategies and conflict error type.

## Safe Usage Rules

- use \`Table<T>\` before dropping to raw transaction helpers
- prefer snapshot reads unless reactivity is actually needed
- use \`observe(...)\` only when remote-origin changes matter
- dispose live views when they are no longer needed
- do not describe \`recordset(predicate)\` as a full query engine

## Change Safety Checklist

- If touching observation, then re-check \`notify(...)\` vs \`observe(...)\`.
- If touching live views, then re-check snapshot alternatives and stated
  limits.
- If touching broadcast handling, then re-check post-commit-only behavior and
  echo suppression.
- If touching version strategies, then re-check documented conflict behavior.
- If touching live containers, then re-check their eventful and observable
  surfaces.

## Related Packages

- If the task is really about event primitives, move to \`asljs-eventful\`.
- If the task is really about path watching and reactive property access, move
  to \`asljs-observable\`.
- If the task is really about DOM binding on observable models, move to
  \`asljs-data-binding\`.

## Validation

- \`npm -w asljs-dali run test\`
- \`npm -w asljs-dali run typecheck\`
- \`npm -w asljs-dali run lint\`

Update this file when AI-facing constraints, exported surface expectations, or
validation commands change. Update \`README.md\` separately only when
user-facing behavior changes.
`,si=`# ASLJS Data Binding AI Guidance

## Purpose

Use this file as AI-facing guidance for \`asljs-data-binding\`.

This package provides declarative DOM binding through explicit
\`data-bind-*\` attributes and \`bindDataModel(root, model, options?)\`.

## Package Scope

Exports from \`src/index.ts\`:

- \`bindDataModel\`
- \`createBuiltInPipes\`
- \`BindDataModelOptions\`
- \`DataModel\`

Binding families in this package:

- value bindings
- event bindings
- context bindings

## AI Quick Reference

Binding contract at a glance:

- value bindings are path-based
- event bindings are path-based
- context bindings switch subtree model roots
- pipe args are static strings
- event actions are invoked as \`(event, model, element)\`
- missing actions warn instead of crashing the whole binding system

Choose this binding family when:

- you need text output -> \`data-bind-text\`
- you need HTML output -> \`data-bind-html\`
- you need an attribute value -> \`data-bind-<attr>\`
- you need a DOM property -> \`data-bind-prop-<name>\`
- you need a class toggle -> \`data-bind-class-<name>\`
- you need an event handler -> \`data-bind-on<event>\`
- you need a subtree context switch -> \`data-bind-context\`

Unsupported syntax:

- no inline function-call expressions like \`save(item.id)\`
- no computed expressions like \`price * qty\`
- no reactive pipe arguments
- no template-language control structures inside attributes
- no implicit two-way binding syntax

## Preferred Usage Patterns

- Keep bindings explicit through \`data-bind-*\` attributes.
- Use \`data-bind-context\` to switch descendant binding roots instead of
  repeating long model paths.
- Keep value bindings path-based and pipe-based.
- Keep event bindings path-based and resolve actions from the model.
- Use multiple bindings on the same element when they represent distinct
  concerns.

## Common Wrong Assumptions

- this is a general expression language
- binding attributes support arbitrary JavaScript
- event bindings resolve inline calls instead of model paths
- pipe arguments are reactive values
- reactivity comes from automatic dependency tracking instead of watched paths

## Constraints To Preserve

- Event bindings currently resolve a function and invoke it as
  \`(event, model, element)\`.
- Do not introduce expression-call syntax in binding attributes unless
  explicitly requested.
- Pipe arguments are static strings, not reactive model paths.
- \`data-bind-context\` rebinding must continue to dispose stale descendant
  watchers when context objects are replaced.
- Nullish behavior is part of the contract:
  text/html render empty string, nullish attributes are removed.
- Missing or non-function event handlers warn and keep bindings alive.

## Safe Authoring Rules

- keep each binding attribute focused on one concern
- prefer multiple binding attributes over overloaded single expressions
- use \`data-bind-context\` instead of repeating long nested paths
- keep handler names on the model
- keep pipe args literal unless a custom pipe expects string args

## Change Safety Checklist

- If changing event binding, then re-check invocation shape \`(event, model,
  element)\`.
- If changing context behavior, then re-check stale watcher disposal.
- If changing nullish behavior, then re-check text, html, and attribute cases.
- If changing syntax parsing, then re-check quoted pipe arguments.
- If changing value binding, then re-check that watch path subscriptions depend
  only on the main path.

## Related Packages

- If the task is really about model reactivity, move to \`asljs-observable\`.
- If the task is really about event primitives, move to \`asljs-eventful\`.
- If the task is really about reusable UI elements, move to
  \`asljs-components\`.

## Validation

- \`npm -w asljs-data-binding run test\`
- \`npm -w asljs-data-binding run typecheck\`
- \`npm -w asljs-data-binding run lint\`

Update this file when AI-facing binding constraints, preserved runtime
contracts, or validation commands change. Update \`README.md\` separately only
when user-facing binding usage or behavior changes.
`,ci="# ASLJS Eventful AI Guidance\n\n## Purpose\n\nUse this file as AI-facing guidance for `asljs-eventful`.\n\nThis package adds lightweight event methods to plain objects and provides a\nbase class for event-capable types.\n\n## Package Scope\n\nExports from `src/index.ts`:\n\n- `eventful`\n- `EventfulBase`\n- `EventfulLike`, `isEventfulLike`, `asEventfulLike`\n- event-related types and `ListenerError`\n\n## AI Quick Reference\n\nMain exports:\n\n- `eventful` to add event methods to an object or instance\n- `EventfulBase` for class hierarchies that should be event-capable by design\n- `isEventfulLike` and `asEventfulLike` for compatibility checks\n- `Eventful`, `EventMap`, `EventfulOptions`, `Listener`, and related types for\n  TypeScript usage\n- `ListenerError` for listener-failure handling\n\nChoose this API when:\n\n- plain object or existing instance needs events -> use `eventful(target)`\n- class hierarchy is under your control -> use `EventfulBase`\n- class cannot change inheritance -> call `eventful(this)` in the constructor\n- code needs to accept unknown values safely -> use `isEventfulLike` or\n  `asEventfulLike`\n- TypeScript event signatures matter -> define an event map and use the\n  exported eventful types\n\nStable public behaviors:\n\n- `eventful` adds `on`, `once`, `off`, `emit`, `emitAsync`, and `has`\n- the package-level `eventful` function is also a global emitter\n- strict mode propagates listener errors\n- non-strict mode routes listener failures through the configured error path\n- `trace`, `strict`, and `error` are public option behaviors\n\nSpecial behavior:\n\n- `eventful` is both the object enhancer and the package-level global emitter\n- lifecycle, trace, and listener-error changes must preserve that global\n  emitter contract\n\nDo not assume:\n\n- DOM `EventTarget` terminology or behavior maps directly to this package\n- event bubbling or capture semantics exist here\n- wildcard events are supported\n- listener return values control emit flow\n- strict mode is the default\n\nAvoid this when:\n\n- you are removing or bypassing the global-emitter behavior of `eventful`\n- you are introducing heavier abstractions where object enhancement is enough\n\nCommon mistakes:\n\n- treating `eventful(target)` and `EventfulBase` as interchangeable style only\n  rather than a design choice\n- forgetting that strict and non-strict error flows are intentionally different\n- changing trace or lifecycle behavior without preserving package-level\n  `eventful` events\n- using internal source files instead of the package-root export surface\n\n## Preferred Usage Patterns\n\n- Use `eventful(target)` to enhance plain objects or class instances.\n- Use `EventfulBase` when inheritance is already the natural design.\n- In TypeScript, declare event maps and use the exported `Eventful<...>` types\n  to preserve listener signatures.\n- Prefer package event semantics over DOM `EventTarget` semantics when working\n  inside this package.\n\n## Stable Behavior\n\nTreat these as public contract behaviors that should not drift silently:\n\n- `eventful` adds `on`, `once`, `off`, `emit`, `emitAsync`, and `has`\n- `eventful` also acts as a package-level global emitter\n- strict mode propagates listener errors\n- non-strict mode isolates listener failures through the configured error path\n- `ListenerError` protects against recursive failures in global error handling\n\n## Constraints To Preserve\n\n- The core object API is `on`, `once`, `off`, `emit`, `emitAsync`, and `has`.\n- The package-level `eventful` function is also a global emitter for lifecycle\n  and error events; do not remove that behavior silently.\n- `trace`, `strict`, and `error` options are documented public behavior.\n- Strict mode propagates listener errors; non-strict flows route them through\n  the configured error handler.\n- Keep the library lightweight and object-oriented; avoid introducing heavier\n  abstractions unless explicitly requested.\n\n## Change Safety Checklist\n\n- If changing error behavior, then verify both strict and non-strict flows.\n- If changing trace behavior, then verify both package-level and per-instance\n  trace paths.\n- If changing lifecycle events, then preserve the package-level global emitter\n  behavior.\n- If changing typing, then preserve listener signatures in the TypeScript\n  usage patterns.\n\n## Validation\n\n- `npm -w asljs-eventful run test`\n- `npm -w asljs-eventful run typecheck`\n- `npm -w asljs-eventful run lint`\n\n## Related Packages\n\n- If the task is really about property change tracking, move to\n  `asljs-observable`.\n- If the task is really about DOM binding or browser template updates, move to\n  `asljs-data-binding`.\n\nUpdate this file when AI-facing constraints, exported surface expectations, or\nvalidation commands change. Update `README.md` separately only when\nuser-facing behavior changes.\n",li=`# ASLJS Observable AI Guidance

## Purpose

Use this file as AI-facing guidance for \`asljs-observable\`.

This package makes objects, arrays, and primitive boxes emit change events and
supports path-based watching.

## Package Scope

Exports from \`src/index.ts\`:

- \`observable\`
- \`ObservableObject\`
- observable-related event, options, trace, and watch types

## Preferred Usage Patterns

- Use \`observable(value, options?)\` to wrap plain objects, arrays, or
  primitives.
- Use \`.watch(pathOrPaths, callback)\` for path-based reactive reads.
- Use \`ObservableObject\` when implementing a class with explicit getters and
  setters.
- Keep change notifications expressed through \`set\`, \`delete\`, and \`define\`
  events.

## Constraints To Preserve

- Objects, arrays, and primitive boxes have different payload shapes; do not
  merge them into a vague generic payload.
- More specific events fire before the generic event, for example \`set:a\`
  before \`set\`.
- \`watch(...)\` runs immediately with current values and returns an unsubscribe
  function.
- Nested path watching is supported where an observable/eventful segment exists
  along the path.
- Arrays are not supported by \`watch(...)\` yet and that limitation is part of
  current public guidance.
- \`shallow: true\` must remain top-level-only conversion.

## Validation

- \`npm -w asljs-observable run test\`
- \`npm -w asljs-observable run typecheck\`
- \`npm -w asljs-observable run lint\`

Update this file when AI-facing constraints, preserved payload semantics, or
validation commands change. Update \`README.md\` separately only when
user-facing behavior changes.
`,ui=`
You are an expert ASLJS app generator.

Your normal job is to execute a queued implementation cycle from CHANGE.md.

The generated app is a showcase of ASLJS libraries, but do not force every
package into every app. Choose the smallest set that fits the README.md
requirements.

Package selection decision list:
- If the app needs reactive state, state subscriptions, or derived UI updates, use asljs-eventful and asljs-observable together.
- If the app needs DOM bindings for text, form fields, visibility, classes, or action wiring, use asljs-data-binding.
- If the app needs reusable custom elements or richer packaged UI primitives, use asljs-components, usually together with asljs-data-binding.
- If the app needs local-first IndexedDB persistence, live queries, or stored records, use asljs-dali, usually together with asljs-observable.
- If plain browser APIs are enough for a feature, do not add an ASLJS package just to satisfy a checklist.

Response requirements:
- Use tool calls for file and runtime operations.
- Do not return a full files JSON snapshot.
- Return one short plain-text assistant message per turn.
- Keep the message lightweight and understandable for non-developers.
- Assume the user is about 8 years old unless their wording clearly shows they want more technical language.
- Match the user's level gently: simple words first, more technical only when the user shows they want that.

Conversation transcript rules:
- The user input may include a "Conversation transcript:" section.
- Use that transcript to understand follow-up replies like "yes", "2 players", "make it blue", or "that part is broken".
- Treat the last user line in the transcript as the newest request.

Implementation cycle:
- Stage 1: read README.md, PLAN.md, and CHANGE.md.
- Stage 2: treat CHANGE.md as the active queue and implement each pending item.
- Stage 3: update runtime files and README.md to match implemented behavior.
- Stage 4: validate by running diagnostics and app.tests.js, then repair issues.
- Stage 5: clear CHANGE.md when the cycle is complete.

Input interpretation rules:
- Treat user input as the queued implementation request for this cycle.
- CHANGE.md contains the actionable queue for this cycle; PLAN.md may include future ideas that should not be consumed unless moved into CHANGE.md.
- Prefer incremental edits to existing files over full rewrites.
- Do not start a nested planning loop in this lane.

Workflow source-of-truth rules:
- Treat README.md as the current implemented app state.
- Treat PLAN.md as pending ideas for upcoming cycles.
- Treat CHANGE.md as the active implementation queue for this cycle.
- If behavior changes due to implementation updates, update README.md so it stays accurate.
- If README.md requirements changed intentionally, treat that as a required app.tests.js update during the same implementation or repair pass.
- Do not add changelog/update-log sections to README.md unless the user explicitly requests one.

Execution-lane rules:
- Do not ask clarification questions in this lane.
- Do not call startGeneration() from this lane.
- Focus on implementing CHANGE.md, validating, and reporting completion.

Tool-first generation protocol (stability-first):
- Always work in small, incremental steps:
  1) inspect current files/state,
  2) edit one focused thing,
  3) verify app behavior,
  4) fix issues,
  5) repeat until stable.
- Prefer targeted updates (replace specific file parts) over full rewrites.
- Use setFileData for image or binary-safe asset files that should be referenced by path from HTML or CSS.
- Use choose when the next clarification step is a small finite pick.
- Use setFileContent only when replaceFilePart is not suitable.
- Verify each major change using evalInApp and diagnostics tools.
- Use JSON only for explicit import/export content handled by the app itself.

Per-turn workflow:
- Start by checking the files with listFileset().
- Prefer listFilesByMask/readFilesByMask for bounded multi-file inspection when you already know the area you need.
- Read README.md, PLAN.md, and CHANGE.md to understand implemented state, pending plans, and active queue.
- During this lane, implement from CHANGE.md, update code from requirements, update app.tests.js for README requirement changes, run the app, interact with it, repair issues, run the tests, then clear CHANGE.md.

Generation rules:
- Always include at least: index.html, style.css, app.js, package.json, README.md.
- During implementation, also create and maintain app.tests.js as the default executable test suite for the current README requirements.
- app.tests.js should contain normal JavaScript tests, not JSON-encoded test data.
- app.tests.js should export default either an array of tests or an object with a tests array.
- Each test should have a name and a run({ evalInApp, assertInApp, getAppDiagnostics, wait }) function.
- package.json must include the latest versions for the ASLJS packages that the app actually uses.
- app.js should demonstrate practical usage of the selected ASLJS packages when they are part of the solution.
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
- Prefer real app behavior over toy snippets (state, events, bindings, local persistence, and components when the app needs them).
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
- Verify that each imported ASLJS package has at least one concrete usage in the app.
- Verify UI behavior is primarily implemented with \`asljs-data-binding\` (not imperative DOM patching).
- Verify generated README explains how to run and what the agent tools do.
- Verify README.md matches the implemented behavior after modifications.
- Verify CHANGE.md is cleared only after successful implementation/testing.
- Verify app.tests.js still covers the main README requirements after behavior changes.
- Verify newly added or changed README requirements have matching app.tests.js coverage before ending an implementation or repair turn.

Agent tool contract (virtual filesystem and runtime):
- Assume the generated app includes an agent that can use these tools:
  - listFileset(): returns all file paths in the virtual filesystem.
  - listFilesByMask(mask, maxFiles?): returns matching file paths for targeted inspection.
  - readFile(path): returns full text content for a file.
  - readFiles(paths, maxCharsPerFile?): returns multiple file contents in one call.
  - readFilesByMask(mask, maxFiles?, maxCharsPerFile?): returns multiple matching file contents in one call.
  - readFileData(path): returns MIME type, base64 payload, and data URL for files stored as data URLs, or null for plain text files.
  - setFilesContent(files): creates or replaces several text files in one call using \`{ path, content }\` entries.
  - setFileData(path, mimeType, base64): creates or replaces an embeddable binary-safe file, such as an image asset.
  - setFileContent(path, content): creates or replaces a file's content.
  - replaceFilePart(path, search, replacement, replaceAll?): replaces exact text in a file.
  - deleteFile(path): deletes a file from the virtual filesystem.
  - grep(mask, pattern, flags?, maxMatches?): searches matching files with a regular expression.
  - choose(question, options): shows clickable choices for the user while still allowing a typed custom reply.
  - evalInApp(code): evaluates JavaScript in the context of the running app document.
  - assertInApp(code, message?): fails when an app check throws or returns false.
  - runAppTests(path?): runs the JavaScript test module and restarts the app before each test.
  - getAppDiagnostics(): returns runtime logs and errors from the running app.
  - runAppAndCollectDiagnostics(): runs app and returns startup/runtime logs and errors.
- Generate app code and README so these tool names and behaviors are clear and usable.
- Keep the tool usage model deterministic and safe (no hidden magic paths).
- Runtime host context available to generated app:
  - window.__ASLJS_APP_BUILDER_HOST__?.openAiApiKey
  - Value is provided by host app settings; it may be null.

In-app agent update protocol:
- For normal edits, the in-app agent must update files through tools:
  - inspect with listFileset/readFile or bounded multi-file tools when they reduce noise
  - create image assets with setFileData and then reference them by path from HTML or CSS
  - modify with replaceFilePart first; use setFileContent for create/full replace
  - remove with deleteFile when appropriate
- JSON should be used only for explicit export/import workflows.

Run/repair loop requirements for the generated agent behavior:
- The agent must treat app.js as the starting point for the app runtime.
- After each generation pass, the agent must run the app and collect diagnostics using runAppAndCollectDiagnostics().
- If diagnostics report runtime errors, the agent must iteratively fix files and re-run diagnostics until errors are resolved.
- The agent should use getAppDiagnostics() and evalInApp(...) for targeted debugging checks between edits.
- The agent should maintain app.tests.js as a lightweight executable suite derived from README requirements.
- When implementing an app that does not have app.tests.js yet, the agent should create it before concluding the first implementation pass.
- When README.md changes intentionally, the agent should update app.tests.js in the same implementation pass so each changed user-visible requirement still has at least one executable check.
- After implementation or repair work, the agent should run runAppTests() and fix failing tests or update stale tests when README requirements changed intentionally.
- If a test fails after a README change, the agent should decide whether the app is broken or the test is stale by checking README.md first, then either fix the app or update the test to match the new requirement.
- The agent should verify implemented functionality through realistic interactions, not only static checks:
  - trigger click handlers,
  - fill form inputs,
  - submit forms,
  - and assert expected visible or state outcomes.
- The final generated code should reflect this workflow explicitly in app.js and/or README.

Turn-ending rules:
- End with a short summary of what was implemented, what was tested, and whether CHANGE.md is now complete.

Use this package knowledge as source material when choosing APIs and patterns.
These imported package guides are generator context, not host app API:

[eventful] guide:

${ci}

[observable] guide:

${li}

[data-binding] guide:

${si}

[components] guide:

${ai}

[dali] guide:

${oi}
`;function di(e){let t=e.trim(),n=/^data:([^;,]+);base64,([a-z0-9+/]+=*)$/i.exec(t.replace(/\s+/g,``));return n===null?null:{mimeType:n[1].toLowerCase(),base64:n[2],dataUrl:t}}var fi=`modulepreload`,pi=function(e){return`/asljs/`+e},mi={},hi=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e=document.getElementsByTagName(`link`),i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}function s(e){return import.meta.resolve?import.meta.resolve(e):new URL(e,import.meta.url).href}r=o(t.map(t=>{if(t=pi(t,n),t=s(t),t in mi)return;mi[t]=!0;let r=t.endsWith(`.css`);for(let n=e.length-1;n>=0;n--){let i=e[n];if(i.href===t&&(!r||i.rel===`stylesheet`))return}let i=document.createElement(`link`);if(i.rel=r?`stylesheet`:fi,r||(i.as=`script`),i.crossOrigin=``,i.href=t,a&&i.setAttribute(`nonce`,a),document.head.appendChild(i),r)return new Promise((e,n)=>{i.addEventListener(`load`,e),i.addEventListener(`error`,()=>n(Error(`Unable to preload CSS for ${t}`)))})}))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})};function G(e,t,n,r){return{name:e,type:`function`,description:t,parameters:{type:`object`,properties:n||{},required:r||[],additionalProperties:!1},strict:!0}}var gi=[G(`listFileset`,`List all file paths in the virtual filesystem.`),G(`listFilesByMask`,`List file paths that match a glob-like mask such as src/*.js or assets/**/*.png.`,{mask:{type:`string`},maxFiles:{type:`number`}},[`mask`,`maxFiles`]),G(`readFile`,`Read the full text content of a file.`,{path:{type:`string`}},[`path`]),G(`readFiles`,`Read several files in one step. Use maxCharsPerFile to cap each returned file content.`,{paths:{type:`array`,items:{type:`string`}},maxCharsPerFile:{type:`number`}},[`paths`,`maxCharsPerFile`]),G(`readFilesByMask`,`Read all files that match a glob-like mask in one step. Use maxFiles and maxCharsPerFile to keep results bounded.`,{mask:{type:`string`},maxFiles:{type:`number`},maxCharsPerFile:{type:`number`}},[`mask`,`maxFiles`,`maxCharsPerFile`]),G(`readFileData`,`Read a binary-safe file stored as a data URL. Returns MIME type, base64 payload, and data URL, or null when the file is plain text.`,{path:{type:`string`}},[`path`]),G(`setFilesContent`,`Create or fully replace several text files in one step.`,{files:{type:`array`,items:{type:`object`,properties:{path:{type:`string`},content:{type:`string`}},required:[`path`,`content`],additionalProperties:!1}}},[`files`]),G(`setFileData`,`Create or replace a binary-safe file from base64 data. Use this for image assets that should be referenced by path from HTML or CSS.`,{path:{type:`string`},mimeType:{type:`string`},base64:{type:`string`}},[`path`,`mimeType`,`base64`]),G(`setFileContent`,`Create or fully replace file content.`,{path:{type:`string`},content:{type:`string`}},[`path`,`content`]),G(`replaceFilePart`,`Replace part of a file by exact search string.`,{path:{type:`string`},search:{type:`string`},replacement:{type:`string`},replaceAll:{type:`boolean`}},[`path`,`search`,`replacement`,`replaceAll`]),G(`deleteFile`,`Delete a file from the virtual filesystem.`,{path:{type:`string`}},[`path`]),G(`grep`,`Search matching files with a regular expression and return matching lines.`,{mask:{type:`string`},pattern:{type:`string`},flags:{type:`string`},maxMatches:{type:`number`}},[`mask`,`pattern`,`flags`,`maxMatches`]),G(`choose`,`Show a short list of clickable choices in the chat UI. Use this when asking the user to pick from a few clear options.`,{question:{type:`string`},options:{type:`array`,items:{type:`string`}}},[`question`,`options`]),G(`evalInApp`,`Evaluate JavaScript in the running app document context.`,{code:{type:`string`}},[`code`]),G(`assertInApp`,`Run a JavaScript check in the app context and fail if it throws or returns false.`,{code:{type:`string`},message:{type:`string`}},[`code`,`message`]),G(`runAppTests`,`Run the JavaScript test module stored in app.tests.js or another specified file. The app restarts before each test.`,{path:{type:`string`}},[`path`]),G(`startGeneration`,`Queue the generation lane to start after the current chat turn finishes.`),G(`getAppDiagnostics`,`Get current runtime logs and errors from the running app.`),G(`runAppAndCollectDiagnostics`,`Run the app and collect runtime logs and errors after startup.`)],_i=350;function vi(e){async function t(){return[...e.getFiles()].map(e=>e.name).sort((e,t)=>e.localeCompare(t))}async function n(t,n=100){return wi(e,t,n)}async function r(t){let n=Ni(e,t),r=n===null?void 0:e.getFiles().find(e=>e.name===n);if(r===void 0)throw Error(`File not found: ${t}`);return r.content}async function i(e,t=0){let n={};for(let i of e)n[i]=Ci(await r(i),t);return n}async function a(e,t=100,r=0){return i(await n(e,t),r)}async function o(e){return di(await r(e))}async function s(t,n){let r=yi(e),i=bi(t),a=Ni(e,i),o=e.getFiles().find(e=>e.name===(a??i));if(o!==void 0){let t={...o,content:n};await e.saveFile(t),e.setFiles(e.getFiles().map(e=>e.id===t.id?t:e)),e.setActiveFileName(t.name);return}let s={id:e.createFileId(),appId:r,name:i,content:n};await e.saveFile(s),e.setFiles([...e.getFiles(),s]),e.setActiveFileName(s.name)}async function c(e,t,n){await s(e,`data:${xi(t)};base64,${Si(n)}`)}async function l(e){for(let t of e)await s(t.path,t.content)}async function u(t){let n=Ni(e,t),r=n===null?void 0:e.getFiles().find(e=>e.name===n);if(r===void 0)return;await e.deleteFileById(r.id);let i=e.getFiles().filter(e=>e.id!==r.id);e.setFiles(i),e.getActiveFileName()===t&&e.setActiveFileName(Mi(i))}async function d(t,n,i,a=!1){if(n===``)throw Error(`Search text cannot be empty.`);let o=Ni(e,t);if(o===null)throw Error(`File not found: ${t}`);let c=await r(o);if(!c.includes(n))throw Error(`Search text not found in ${o}.`);let l=c;if(a)l=c.split(n).join(i);else{let e=c.indexOf(n);if(c.indexOf(n,e+n.length)!==-1)throw Error(`Search text is ambiguous. Use replaceAll=true or provide a more specific search block.`);l=c.slice(0,e)+i+c.slice(e+n.length)}await s(o,l)}async function f(t){if(e.getFiles().length===0)throw Error(`No files available to run.`);e.runApp();try{return await e.evaluateInApp(t)}catch{return e.runApp(),e.evaluateInApp(t)}}async function p(t,n,i=``,a=100){let o=[],s=Ei(n,i);for(let n of wi(e,t,2**53-1)){let e=(await r(n)).split(/\r?\n/);for(let t=0;t<e.length;t+=1)if(s.lastIndex=0,s.test(e[t])&&(o.push({path:n,line:t+1,text:e[t]}),o.length>=a))return o}return o}async function m(t,n){let r=t.trim(),i=n.map(e=>e.trim()).filter(e=>e!==``);if(r===``)throw Error(`Choice question cannot be empty.`);if(i.length<2)throw Error(`Choice options must include at least two items.`);e.showChoicePrompt(r,i)}async function h(e,t){let n=await f(e);if(n===!1)throw Error(t?.trim()||`App assertion returned false.`);return n}async function g(t=`app.tests.js`){let n=Ni(e,t);if(n===null)throw Error(`Test file not found: ${t}`);let i=await Oi(n,await r(n)),a=[];for(let t of i)try{e.runApp(),await e.wait(e.diagnosticsDelayMs??_i);let n={evalInApp:t=>e.evaluateInApp(t),assertInApp:async(t,n)=>{let r=await e.evaluateInApp(t);if(r===!1)throw Error(n?.trim()||`App assertion returned false.`);return r},getAppDiagnostics:_,wait:e.wait};await t.run(n),a.push({name:t.name,ok:!0})}catch(e){a.push({name:t.name,ok:!1,error:e instanceof Error?e.message:String(e)})}return{path:n,total:a.length,passed:a.filter(e=>e.ok).length,failed:a.filter(e=>!e.ok).length,results:a}}async function _(){return e.getAppDiagnostics()}async function v(){return e.runApp(),await e.wait(e.diagnosticsDelayMs??_i),e.getAppDiagnostics()}async function y(){if(e.startGeneration===void 0)throw Error(`Generation control is not available in this lane.`);return e.startGeneration()}return{listFileset:t,listFilesByMask:n,readFile:r,readFiles:i,readFilesByMask:a,readFileData:o,setFilesContent:l,setFileData:c,setFileContent:s,deleteFile:u,replaceFilePart:d,grep:p,choose:m,evalInApp:f,assertInApp:h,runAppTests:g,startGeneration:y,getAppDiagnostics:_,runAppAndCollectDiagnostics:v}}function yi(e){let t=e.getCurrentAppId();if(t===null)throw Error(`No active app. Create or open an app first.`);return t}function bi(e){let t=e.trim().replace(/\\/g,`/`).replace(/^\.\//,``).replace(/^\/+/,``);if(t===``)throw Error(`Path cannot be empty.`);if(t.includes(`..`))throw Error(`Parent path segments are not allowed.`);return t}function xi(e){let t=e.trim().toLowerCase();if(t===``)throw Error(`MIME type cannot be empty.`);if(!/^[a-z0-9!#$&^_.+-]+\/[a-z0-9!#$&^_.+-]+$/i.test(t))throw Error(`Invalid MIME type: ${e}`);return t}function Si(e){let t=e.trim().replace(/^data:[^,]+,/,``).replace(/\s+/g,``);if(t===``)throw Error(`Base64 data cannot be empty.`);if(!/^[a-z0-9+/]+=*$/i.test(t))throw Error(`Base64 data contains invalid characters.`);return t}function Ci(e,t){if(!Number.isFinite(t)||t<=0)return e;let n=Math.floor(t);return e.length<=n?e:`${e.slice(0,n)}\n...[truncated]`}function wi(e,t,n){let r=Ti(t),i=Di(n,100);return e.getFiles().map(e=>e.name).filter(e=>r.test(bi(e))).sort((e,t)=>e.localeCompare(t)).slice(0,i)}function Ti(e){let t=bi(e).replace(/[.+^${}()|[\]\\]/g,`\\$&`).replace(/\*\*/g,`::DOUBLE_STAR::`).replace(/\*/g,`[^/]*`).replace(/\?/g,`[^/]`).replace(/::DOUBLE_STAR::/g,`.*`);return RegExp(`^${t}$`,`i`)}function Ei(e,t){let n=Array.from(new Set(t.replace(/g/g,``).split(``))).join(``);return new RegExp(e,n)}function Di(e,t){return!Number.isFinite(e)||e<=0?t:Math.floor(e)}async function Oi(e,t){return e.toLowerCase().endsWith(`.json`)?ji(t):ki(t)}async function ki(e){let t=`data:text/javascript;charset=utf-8,${encodeURIComponent(e)}`,n=await hi(()=>import(t),[]),r=Array.isArray(n.default)?n.default:n.default?.tests;if(!Array.isArray(r))throw Error(`Test module must export an array or an object with a tests array as the default export.`);return r.map((e,t)=>Ai(e,t))}function Ai(e,t){if(typeof e!=`object`||!e)throw Error(`Invalid test case at index ${t}.`);let n=e;if(typeof n.name!=`string`||n.name.trim()===``)throw Error(`Test case ${t+1} is missing a name.`);if(typeof n.run!=`function`)throw Error(`Test case ${n.name} is missing run().`);let r=n.run;return{name:n.name,run:async e=>{await r(e)}}}function ji(e){let t;try{t=JSON.parse(e)}catch{throw Error(`Test suite file must be valid JSON.`)}let n=Array.isArray(t)?t:t.tests;if(!Array.isArray(n))throw Error(`Test suite file must be an array or an object with a tests array.`);return n.map((e,t)=>{if(typeof e!=`object`||!e)throw Error(`Invalid test case at index ${t}.`);let n=e;if(typeof n.name!=`string`||n.name.trim()===``)throw Error(`Test case ${t+1} is missing a name.`);if(typeof n.code!=`string`||n.code.trim()===``)throw Error(`Test case ${n.name} is missing code.`);return{name:n.name,run:async e=>{if(await e.evalInApp(n.code)===!1)throw Error(`Test returned false.`)}}})}function Mi(e){return e[0]?.name??null}function Ni(e,t){let n=bi(t);return e.getFiles().find(e=>bi(e.name).toLowerCase()===n.toLowerCase())?.name??null}function Pi(e){return typeof e!=`object`||!e?!1:e.type===`function_call`}function Fi(e){if(typeof e.name!=`string`||e.name.trim()===``)throw Error(`Tool call missing function name.`);return e.name}function Ii(e){if(typeof e.call_id!=`string`||e.call_id.trim()===``)throw Error(`Tool call missing call_id.`);return e.call_id}async function Li(e,t){let n=Fi(e),r=Ri(e.arguments);try{switch(n){case`listFileset`:return q(await t.listFileset());case`listFilesByMask`:return q(await t.listFilesByMask(K(r,`mask`),Vi(r,`maxFiles`,100)));case`readFile`:return q(await t.readFile(K(r,`path`)));case`readFiles`:return q(await t.readFiles(zi(r,`paths`),Vi(r,`maxCharsPerFile`,0)));case`readFilesByMask`:return q(await t.readFilesByMask(K(r,`mask`),Vi(r,`maxFiles`,100),Vi(r,`maxCharsPerFile`,0)));case`readFileData`:return q(await t.readFileData(K(r,`path`)));case`setFilesContent`:return await t.setFilesContent(Bi(r,`files`)),q(`ok`);case`setFileData`:return await t.setFileData(K(r,`path`),K(r,`mimeType`),K(r,`base64`)),q(`ok`);case`setFileContent`:return await t.setFileContent(K(r,`path`),K(r,`content`)),q(`ok`);case`replaceFilePart`:return await t.replaceFilePart(K(r,`path`),K(r,`search`),K(r,`replacement`),Hi(r,`replaceAll`,!1)),q(`ok`);case`deleteFile`:return await t.deleteFile(K(r,`path`)),q(`ok`);case`grep`:return q(await t.grep(K(r,`mask`),K(r,`pattern`),K(r,`flags`,``),Vi(r,`maxMatches`,100)));case`choose`:return await t.choose(K(r,`question`),zi(r,`options`)),q(`ok`);case`evalInApp`:return q(await t.evalInApp(K(r,`code`)));case`assertInApp`:return q(await t.assertInApp(K(r,`code`),K(r,`message`,``)));case`runAppTests`:return q(await t.runAppTests(K(r,`path`,`app.tests.js`)));case`startGeneration`:return q(await t.startGeneration());case`getAppDiagnostics`:return q(await t.getAppDiagnostics());case`runAppAndCollectDiagnostics`:return q(await t.runAppAndCollectDiagnostics());default:return Ui(`Unknown tool: ${n}`)}}catch(e){return Ui(e instanceof Error?e.message:String(e))}}function Ri(e){if(e===void 0)return{};if(typeof e==`object`&&e)return e;if(typeof e!=`string`)throw Error(`Invalid tool arguments value.`);try{let t=JSON.parse(e);if(typeof t!=`object`||!t)throw Error(`Tool arguments must be a JSON object.`);return t}catch{throw Error(`Invalid tool arguments JSON.`)}}function K(e,t,n){let r=e[t];if(r===void 0&&n!==void 0)return n;if(typeof r!=`string`)throw Error(`Tool argument "${t}" must be a string.`);return r}function zi(e,t){let n=e[t];if(!Array.isArray(n)||n.some(e=>typeof e!=`string`))throw Error(`Tool argument "${t}" must be an array of strings.`);return n}function Bi(e,t){let n=e[t];if(!Array.isArray(n))throw Error(`Tool argument "${t}" must be an array.`);return n.map((e,n)=>{if(typeof e!=`object`||!e||Array.isArray(e))throw Error(`Tool argument "${t}" entry ${n+1} must be an object.`);let r=e;if(typeof r.path!=`string`||typeof r.content!=`string`)throw Error(`Tool argument "${t}" entry ${n+1} must include string path and content fields.`);return{path:r.path,content:r.content}})}function Vi(e,t,n){let r=e[t];if(r===void 0)return n;if(typeof r!=`number`||Number.isNaN(r))throw Error(`Tool argument "${t}" must be a number.`);return r}function Hi(e,t,n){let r=e[t];if(r===void 0)return n;if(typeof r!=`boolean`)throw Error(`Tool argument "${t}" must be a boolean.`);return r}function q(e){return Wi({ok:!0,value:e})}function Ui(e){return Wi({ok:!1,error:e})}function Wi(e){try{return JSON.stringify(e)}catch{return`{"ok":false,"error":"Failed to serialize tool result."}`}}var Gi=`https://api.openai.com/v1/responses`,Ki=`gpt-5.3-codex`,qi=`AI exceeded maximum tool steps without completing.`,Ji=`Generation stopped by the user.`,Yi=12,Xi=class extends Error{stepsCompleted;stepLimit;constructor(e){super(qi),this.name=`ToolStepLimitExceededError`,this.stepsCompleted=e.stepsCompleted,this.stepLimit=e.stepLimit}},Zi=class extends Error{constructor(){super(Ji),this.name=`GenerationStoppedError`}},Qi={createResponse:async e=>{let t=await fetch(Gi,{method:`POST`,headers:{"Content-Type":`application/json`,Authorization:`Bearer ${e.apiKey}`},body:JSON.stringify({model:e.model,instructions:e.instructions,temperature:e.temperature,previous_response_id:e.previous_response_id,input:e.input,tools:e.tools})});if(!t.ok){let e=ia(await t.json().catch(()=>({})))??`OpenAI API error: ${t.status}`;throw Error(e)}return t.json()}},$i={listModels:async e=>{let t=await fetch(Gi.replace(`/responses`,`/models`),{method:`GET`,headers:{Authorization:`Bearer ${e}`}});if(!t.ok){let e=ia(await t.json().catch(()=>({})))??`OpenAI API error: ${t.status}`;throw Error(e)}let n=await t.json();if(!Array.isArray(n.data))throw Error(`OpenAI returned an unexpected model list format.`);return n.data.filter(e=>typeof e==`object`&&!!e).map(e=>({id:typeof e.id==`string`?e.id:``,created:typeof e.created==`number`?e.created:0})).filter(e=>e.id!==``)}};async function ea(e,t=$i){return e.trim()===``?[]:t.listModels(e)}async function ta(e,t,n,r,i){let a=i?.transport??Qi,o=i?.systemPrompt??`You are an expert ASLJS app generator.`,s,c=e,l=na(i?.initialToolStepLimit),u=0;for(;;){if(i?.shouldStop?.()===!0)throw new Zi;if(await ra(i,`Step ${u+1}: requesting assistant response...`),u>=l){if(!(await i?.onToolStepLimit({stepsCompleted:u,stepLimit:l})??!1))throw new Xi({stepsCompleted:u,stepLimit:l});l+=Yi,await ra(i,`Extended step limit to ${l}. Continuing...`)}let e=await a.createResponse({apiKey:t,model:n,instructions:o,temperature:.1,previous_response_id:s,input:c,tools:gi});if(!Array.isArray(e.output))throw Error(`AI returned an unexpected response format.`);let d=e.output.filter(Pi);if(d.length===0){await ra(i,`Completed in ${u+1} step(s). Finalizing summary...`);let t=aa(e);return{summary:t===``?`Completed tool-based update.`:t}}let f=[];for(let e of d){if(i?.shouldStop?.()===!0)throw new Zi;await ra(i,`Step ${u+1}: running ${Fi(e)}...`);let t=await Li(e,r);f.push({type:`function_call_output`,call_id:Ii(e),output:t})}await ra(i,`Step ${u+1}: submitted ${f.length} tool result(s).`),s=typeof e.id==`string`?e.id:s,c=f,u+=1}}function na(e){if(!Number.isFinite(e))return 20;let t=Math.floor(e);return t>=1?t:20}async function ra(e,t){e?.onProgress!==void 0&&await Promise.resolve(e.onProgress(t))}function ia(e){let t=e.error;return typeof t?.message==`string`?t.message:null}function aa(e){return typeof e.output_text==`string`&&e.output_text.trim()!==``?e.output_text.trim():Array.isArray(e.output)?e.output.filter(e=>e.type===`message`).flatMap(e=>e.content??[]).map(e=>e.text??``).map(e=>e.trim()).filter(e=>e!==``).join(`
`):``}var oa=`
You are the chat lane for the ASLJS app builder.

Your job is to help the user shape the next changeset without directly editing
the runtime app files during normal chat turns.

Workflow files:
- README.md is the current implemented app state and source of truth.
- PLAN.md is where the next changeset is drafted during chat.
- CHANGE.md is the active implementation queue for the generation lane.

Chat-lane rules:
- Read project files as needed for context.
- During normal chat turns, only edit PLAN.md.
- Do not edit README.md, app.js, index.html, style.css, package.json, or other
  runtime files in normal chat turns.
- If the user asks for a specific next implementation pass and the changes in
  PLAN.md are ready, call startGeneration().
- startGeneration() queues the generation lane to start after the current chat
  turn finishes. It does not run immediately while this chat response is still
  in flight.
- CHANGE.md may already contain an unfinished implementation queue from an
  earlier generation cycle. You may read it, but do not edit it.

Conversation style:
- Return one short plain-text assistant message per turn.
- Keep the wording lightweight and understandable for non-developers.
- Assume the user is about 8 years old unless they clearly want more technical
  language.
- Ask at most one focused follow-up question at a time.

How to use the workflow:
- Start by reading README.md and PLAN.md when they exist.
- Keep README.md as the picture of what already exists.
- Put new requested changes into PLAN.md as concise actionable notes.
- When the request is still vague, update PLAN.md and ask the next useful
  question instead of starting generation too early.
- When the user is clearly asking to build the pending changes now, call
  startGeneration().

Tool rules:
- Use listFileset(), listFilesByMask(), readFile(), readFiles(),
  readFilesByMask(), and grep() to inspect the current app.
- Use replaceFilePart(path, search, replacement, replaceAll?) and
  setFileContent(path, content) only for PLAN.md in this lane.
- Use choose(question, options) when a short option list helps.
- Do not use runAppTests(), evalInApp(), assertInApp(), setFileData(), or
  deleteFile() in normal chat turns.

Package selection decision list:
- If the app needs reactive state, state subscriptions, or derived UI updates,
  use asljs-eventful and asljs-observable together.
- If the app needs DOM bindings for text, form fields, visibility, classes, or
  action wiring, use asljs-data-binding.
- If the app needs reusable custom elements or richer packaged UI primitives,
  use asljs-components, usually together with asljs-data-binding.
- If the app needs local-first IndexedDB persistence, live queries, or stored
  records, use asljs-dali, usually together with asljs-observable.
- If plain browser APIs are enough for a feature, do not add an ASLJS package
  just to satisfy a checklist.

Conversation transcript rules:
- The user input may include a "Conversation transcript:" section.
- Use that transcript to understand short follow-up replies like "yes",
  "2 players", or "make it blue".
- Treat the last user line in the transcript as the newest request.

Use this package knowledge as source material when choosing APIs and patterns.
These imported package guides are generator context, not host app API:

[eventful] guide:

${ci}

[observable] guide:

${li}

[data-binding] guide:

${si}

[components] guide:

${ai}

[dali] guide:

${oi}
`,sa=`README.md`,ca=`PLAN.md`,la=`CHANGE.md`,ua=[sa,ca,la];function da(e,t,n){return ua.map(r=>({id:n(),appId:e,name:r,content:ga(r,t)}))}function fa(e){let t=new Set(e.files.map(e=>e.name.toLowerCase())),n=[...e.files],r=!1;for(let i of ua)t.has(i.toLowerCase())||(n.push({id:e.createId(),appId:e.appId,name:i,content:ga(i,e.appName)}),r=!0);return{files:ha(n),changed:r}}function pa(){return[`# PLAN`,``,`Pending changes for the next generation cycle go here.`].join(`
`)}function ma(){return[`# CHANGE`,``,`Active implementation changes for the current generation cycle go here.`].join(`
`)}function ha(e){let t=new Map(ua.map((e,t)=>[e,t]));return[...e].sort((e,n)=>{let r=t.get(e.name)??2**53-1,i=t.get(n.name)??2**53-1;return r===i?e.name.localeCompare(n.name):r-i})}function ga(e,t){switch(e){case sa:return[`# ${t}`,``,`## State`,``,`- This app is empty.`,`- No changes have been implemented yet.`].join(`
`);case ca:return pa();case la:return ma()}}function _a(e){return[`Conversation transcript:`,e.slice(-10).map(e=>`${va(e.role)}: ${e.text}`).join(`

`),``,`Use the transcript to resolve short follow-up answers such as "yes",`,`"2 players", or "make it blue". The last user message is the newest`,`request.`].join(`
`)}function va(e){return e===`assistant`?`Assistant`:`User`}var ya=`gpt-5-mini`,ba=`gpt-5.4`;function xa(e){let t=new Set,n=[];for(let r of e){let e=typeof r.id==`string`?r.id.trim():``;e===``||t.has(e.toLowerCase())||(t.add(e.toLowerCase()),n.push({id:e,created:Number.isFinite(r.created)?r.created:0}))}return n}function Sa(e){let t={};for(let n of e.files)t[n.name]=n.content;return{id:e.app.id,name:e.app.name,author:Ea(e.app.author),files:t}}function Ca(e){let t=JSON.parse(e);return Ta(t),t}function wa(e){Ta(e.payload);let t=e.existingApps.find(t=>t.id===e.payload.id);if(t!==void 0)return e.navigateToExistingById?{kind:`existing`,appId:t.id}:{kind:`duplicate`};let n={id:e.payload.id,uuid:e.createUuid(),name:e.payload.name,author:Ea(e.payload.author),createdAt:e.now,updatedAt:e.now};return{kind:`new`,app:n,files:Object.entries(e.payload.files).map(([t,r])=>({id:e.createId(),appId:n.id,name:t,content:r}))}}function Ta(e){if(typeof e.id!=`string`||e.id.trim()===``||typeof e.name!=`string`||e.name.trim()===``||e.files===null||typeof e.files!=`object`||!Da(e.author))throw Error(`Invalid app JSON format.`);for(let[t,n]of Object.entries(e.files))if(t.trim()===``||typeof n!=`string`)throw Error(`Invalid app JSON format.`)}function Ea(e){if(e===void 0)return;let t=typeof e.name==`string`?e.name.trim():``,n=typeof e.email==`string`?e.email.trim():``;if(!(t===``&&n===``))return{...t===``?{}:{name:t},...n===``?{}:{email:n}}}function Da(e){if(e===void 0)return!0;if(typeof e!=`object`||!e)return!1;let t=e;return!(t.name!==void 0&&typeof t.name!=`string`||t.email!==void 0&&typeof t.email!=`string`)}var Oa=[`{
  "id": "5935ae06-fe33-4019-86ab-afa78151e96c",
  "name": "TODO Sample",
  "files": {
    "app.js": "const form = document.getElementById('todo-form');\\nconst input = document.getElementById('todo-input');\\nconst list = document.getElementById('todo-list');\\nconst doneList = document.getElementById('done-list');\\n\\nif (!(form instanceof HTMLFormElement)\\n    || !(input instanceof HTMLInputElement)\\n    || !(list instanceof HTMLUListElement)\\n    || !(doneList instanceof HTMLUListElement))\\n{\\n  throw new Error('Missing TODO app elements.');\\n}\\n\\nconst state = {\\n  todos: [],\\n  done: [],\\n};\\n\\nfunction uid() {\\n  return crypto.randomUUID();\\n}\\n\\nfunction render() {\\n  list.replaceChildren();\\n  doneList.replaceChildren();\\n\\n  for (const todo of state.todos) {\\n    const item = document.createElement('li');\\n    item.className = 'todo-item';\\n\\n    const main = document.createElement('div');\\n    main.className = 'todo-main';\\n\\n    const text = document.createElement('span');\\n    text.className = 'todo-text';\\n    text.textContent = todo.text;\\n\\n    const actions = document.createElement('div');\\n\\n    const checkButton = document.createElement('button');\\n    checkButton.type = 'button';\\n    checkButton.className = 'check-btn';\\n    checkButton.textContent = '✓';\\n    checkButton.title = 'Mark done';\\n    checkButton.addEventListener('click', () => {\\n      state.todos = state.todos.filter(entry => entry.id !== todo.id);\\n      state.done.unshift(todo);\\n      render();\\n    });\\n\\n    main.appendChild(checkButton);\\n    main.appendChild(text);\\n\\n    const bin = document.createElement('button');\\n    bin.type = 'button';\\n    bin.className = 'bin-btn';\\n    bin.textContent = '🗑';\\n    bin.title = 'Delete todo';\\n    bin.addEventListener('click', () => {\\n      state.todos = state.todos.filter(entry => entry.id !== todo.id);\\n      render();\\n    });\\n\\n    actions.appendChild(checkButton);\\n    actions.appendChild(bin);\\n\\n    item.appendChild(main);\\n    item.appendChild(actions);\\n    list.appendChild(item);\\n  }\\n\\n  for (const todo of state.done) {\\n    const item = document.createElement('li');\\n    item.className = 'todo-item done';\\n\\n    const main = document.createElement('div');\\n    main.className = 'todo-main';\\n\\n    const text = document.createElement('span');\\n    text.className = 'todo-text';\\n    text.textContent = todo.text;\\n\\n    main.appendChild(text);\\n\\n    const actions = document.createElement('div');\\n\\n    const bin = document.createElement('button');\\n    bin.type = 'button';\\n    bin.className = 'bin-btn';\\n    bin.textContent = '🗑';\\n    bin.title = 'Delete todo';\\n    bin.addEventListener('click', () => {\\n      state.done = state.done.filter(entry => entry.id !== todo.id);\\n      render();\\n    });\\n\\n    actions.appendChild(bin);\\n\\n    item.appendChild(main);\\n    item.appendChild(actions);\\n    doneList.appendChild(item);\\n  }\\n\\n  if (state.todos.length === 0) {\\n    const empty = document.createElement('li');\\n    empty.className = 'todo-empty';\\n    empty.textContent = 'No active TODO items.';\\n    list.appendChild(empty);\\n  }\\n\\n  if (state.done.length === 0) {\\n    const emptyDone = document.createElement('li');\\n    emptyDone.className = 'todo-empty';\\n    emptyDone.textContent = 'No completed TODO items yet.';\\n    doneList.appendChild(emptyDone);\\n  }\\n}\\n\\nform.addEventListener('submit', event => {\\n  event.preventDefault();\\n\\n  const text = input.value.trim();\\n\\n  if (text === '') {\\n    return;\\n  }\\n\\n  state.todos.unshift({\\n    id: uid(),\\n    text,\\n  });\\n  input.value = '';\\n  input.focus();\\n  render();\\n});\\n\\nrender();",
    "README.md": "# TODO Sample\\n\\nSimple TODO sample application.\\n\\n## Usage\\n\\nOpen index.html and add items using the input.\\n\\n## Behavior\\n\\n- Add TODO item on submit.\\n- Active TODO items show Check and Bin actions.\\n- Clicking Check moves an item immediately to Done.\\n- Each item has a bin icon to delete it.\\n",
    "package.json": "{\\n  \\"name\\": \\"todo-sample\\",\\n  \\"version\\": \\"0.1.0\\",\\n  \\"private\\": true,\\n  \\"type\\": \\"module\\",\\n  \\"scripts\\": {\\n    \\"start\\": \\"echo \\"Open index.html in a browser\\"\\"\\n  }\\n}",
    "style.css": ":root {\\n  color-scheme: light dark;\\n}\\n\\nbody {\\n  margin: 0;\\n  font-family: system-ui, sans-serif;\\n  background: #0b1220;\\n  color: #e7edf7;\\n}\\n\\n.app {\\n  max-width: 560px;\\n  margin: 2rem auto;\\n  padding: 1rem;\\n  border: 1px solid #2b3954;\\n  border-radius: 8px;\\n  background: #121b2d;\\n}\\n\\n#todo-form {\\n  display: flex;\\n  gap: 0.5rem;\\n}\\n\\n#todo-input {\\n  flex: 1;\\n  padding: 0.5rem;\\n}\\n\\n.list-section {\\n  margin-top: 1rem;\\n}\\n\\n.list-section h2 {\\n  margin: 0 0 0.5rem;\\n  font-size: 1rem;\\n}\\n\\n.todo-list {\\n  margin: 0;\\n  padding: 0;\\n  list-style: none;\\n  display: grid;\\n  gap: 0.5rem;\\n}\\n\\n.todo-item {\\n  display: flex;\\n  align-items: center;\\n  justify-content: space-between;\\n  gap: 0.5rem;\\n  padding: 0.5rem 0.6rem;\\n  border: 1px solid #2b3954;\\n  border-radius: 6px;\\n  background: #0f1a2f;\\n}\\n\\n.todo-main {\\n  display: flex;\\n  align-items: center;\\n  gap: 0.5rem;\\n  min-width: 0;\\n}\\n\\n.todo-text {\\n  overflow: hidden;\\n  text-overflow: ellipsis;\\n  white-space: nowrap;\\n}\\n\\n.done .todo-text {\\n  text-decoration: line-through;\\n  opacity: 0.75;\\n}\\n\\n.bin-btn {\\n  border: 1px solid #3b4e7a;\\n  background: transparent;\\n  color: #e7edf7;\\n  border-radius: 6px;\\n  padding: 0.35rem 0.5rem;\\n  cursor: pointer;\\n}\\n\\n.check-btn {\\n  border: 1px solid #3b4e7a;\\n  background: #1b2b4b;\\n  color: #e7edf7;\\n  border-radius: 6px;\\n  padding: 0.35rem 0.55rem;\\n  cursor: pointer;\\n}\\n\\n.todo-empty {\\n  color: #9fb2d8;\\n  font-size: 0.9rem;\\n  padding: 0.25rem 0;\\n}",
    "index.html": "<!doctype html>\\n<html lang=\\"en\\">\\n<head>\\n  <meta charset=\\"UTF-8\\" />\\n  <meta name=\\"viewport\\" content=\\"width=device-width, initial-scale=1.0\\" />\\n  <title>TODO Sample</title>\\n  <link rel=\\"stylesheet\\" href=\\"style.css\\" />\\n</head>\\n<body>\\n  <main class=\\"app\\">\\n    <h1>TODO Sample</h1>\\n    <form id=\\"todo-form\\">\\n      <input id=\\"todo-input\\" type=\\"text\\" placeholder=\\"What needs doing?\\" required />\\n      <button type=\\"submit\\">Add</button>\\n    </form>\\n    <section class=\\"list-section\\">\\n      <h2>Todo</h2>\\n      <ul id=\\"todo-list\\" class=\\"todo-list\\"></ul>\\n    </section>\\n    <section class=\\"list-section\\">\\n      <h2>Done</h2>\\n      <ul id=\\"done-list\\" class=\\"todo-list\\"></ul>\\n    </section>\\n  </main>\\n  <script type=\\"module\\" src=\\"app.js\\"><\/script>\\n</body>\\n</html>"
  }
}`,`{
  "id": "e44d7e29-c40a-4731-9092-9407b0105624",
  "name": "PdfParser",
  "files": {
    "README.md": "# PDF Text Extractor\\n\\nA simple browser app that converts PDF pages into a text-only layout preview using a 100-column virtual buffer.\\n\\n## Features\\n\\n- Drag-and-drop or click-to-upload PDF input\\n- Text extraction with \`pdfjs-dist\`\\n- Page-by-page monospace preview\\n- Activity log and extraction stats\\n- IndexedDB session persistence with \`asljs-dali\`\\n- Saved-session history with restore support\\n- Declarative UI bindings with \`asljs-data-binding\`\\n- Observable app state with \`asljs-observable\`\\n- Event bus with \`asljs-eventful\`\\n- \`asljs-components\` list rendering for pages and activity\\n- Executable browser checks in \`app.tests.js\`\\n\\n## ASLJS package usage\\n\\n- \`asljs-eventful\`: app event bus for status, success, and error events\\n- \`asljs-observable\`: reactive state for UI, pages, stats, and activity\\n- \`asljs-data-binding\`: declarative bindings via \`data-bind-*\` attributes\\n- \`asljs-components\`: \`asljs-list\` for activity and extracted page rendering\\n- \`asljs-dali\`: IndexedDB-backed session table and live recordset observation\\n\\n## Files\\n\\n- \`index.html\`: app shell and declarative binding markup\\n- \`style.css\`: layout and visual styling\\n- \`app.js\`: app entry point and runtime logic\\n- \`app.tests.js\`: runtime test checks derived from the README\\n- \`package.json\`: scripts and required dependencies\\n\\n## Run\\n\\nUse a static server, for example:\\n\\n\`\`\`bash\\nnpm install\\nnpm run dev\\n\`\`\`\\n\\nThen open the served app in a modern browser.\\n\\n## Agent tool workflow\\n\\nThis project is intended to be updated through the app-builder tool workflow:\\n\\n- inspect files with \`listFileset()\`, \`listFilesByMask(...)\`, \`readFile(path)\`, or \`readFilesByMask(...)\`\\n- modify files with \`replaceFilePart(...)\`, \`setFileContent(...)\`, or \`setFilesContent([{ path, content }])\`\\n- ask short option questions with \`choose(question, options)\` when a small list is enough\\n- remove files with \`deleteFile(path)\`\\n- verify runtime with \`runAppAndCollectDiagnostics()\`, \`getAppDiagnostics()\`, \`assertInApp(...)\`, and \`runAppTests()\`\\n- perform targeted checks with \`evalInApp(code)\` or \`grep(...)\`\\n\\nThe app entry point is \`app.js\`, and \`index.html\` loads it with \`<script type=\\"module\\">\`.\\n\\n## Current behavior\\n\\n- Uploading a PDF extracts text from each page\\n- Each page is mapped into a fixed-width text buffer\\n- Extraction results are shown in a list of page cards\\n- Full extraction sessions are stored in IndexedDB\\n- Recent saved sessions can be restored into the page preview\\n- The activity log records app events and persistence updates\\n",
    "app.tests.js": "export default [\\n  {\\n    name: 'app bootstraps',\\n    async run({ assertInApp }) {\\n      await assertInApp(\\"Boolean(document.getElementById('app'))\\", 'Missing #app root.');\\n    }\\n  },\\n  {\\n    name: 'dropzone exists',\\n    async run({ assertInApp }) {\\n      await assertInApp(\\"Boolean(document.getElementById('dropzone'))\\", 'Missing #dropzone.');\\n    }\\n  },\\n  {\\n    name: 'pdf input exists',\\n    async run({ assertInApp }) {\\n      await assertInApp(\\"Boolean(document.getElementById('pdf-input'))\\", 'Missing #pdf-input.');\\n    }\\n  }\\n];",
    "app.js": "import { eventful } from 'https://cdn.jsdelivr.net/npm/asljs-eventful/+esm';\\nimport { observable } from 'https://cdn.jsdelivr.net/npm/asljs-observable/+esm';\\nimport { bindDataModel } from 'https://cdn.jsdelivr.net/npm/asljs-data-binding/+esm';\\nimport 'https://cdn.jsdelivr.net/npm/asljs-components/+esm';\\nimport { dbOpen, Table } from 'https://cdn.jsdelivr.net/npm/asljs-dali/+esm';\\nimport * as pdfjsLib from 'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.6.205/build/pdf.mjs';\\n\\npdfjsLib.GlobalWorkerOptions.workerSrc =\\n  'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.6.205/build/pdf.worker.mjs';\\n\\nconst BUFFER_WIDTH = 100;\\nconst DB_NAME = 'pdf-text-extractor-db';\\nconst STORE_NAME = 'sessions';\\nconst SAMPLE_MESSAGE = 'Drop a PDF file or click here to choose one. The app maps extracted text into a 100-column virtual text buffer per page.';\\nconst MAX_HISTORY = 8;\\n\\nlet booted = false;\\n\\nwindow.addEventListener('error', event => {\\n  console.error('Window error', event.error || event.message);\\n});\\n\\nwindow.addEventListener('unhandledrejection', event => {\\n  console.error('Unhandled rejection', event.reason);\\n});\\n\\nboot().catch(error => {\\n  console.error('Boot failed', error);\\n});\\n\\nasync function boot() {\\n  if (booted) return;\\n  booted = true;\\n  console.log('boot:start');\\n\\n  const root = document.getElementById('app');\\n  if (!root) throw new Error('Missing #app root element.');\\n\\n  const bus = eventful({ name: 'pdf-text-extractor-bus' });\\n  const state = observable({\\n    stats: {\\n      pages: 0,\\n      characters: 0,\\n      sessions: 0,\\n    },\\n    ui: {\\n      dragOver: false,\\n      busy: false,\\n      dropzoneTitle: 'Drop PDF here',\\n      dropzoneHint: SAMPLE_MESSAGE,\\n      status: {\\n        message: 'Ready for a PDF.',\\n        error: '',\\n      },\\n      loadSample() {\\n        state.ui.status.message = 'Instructions loaded. Now drop a PDF file.';\\n        state.ui.status.error = '';\\n        addLog('Instructions', SAMPLE_MESSAGE, true);\\n        bus.emit('status', state.ui.status.message);\\n      },\\n      clearOutput() {\\n        state.pages.length = 0;\\n        state.stats.pages = 0;\\n        state.stats.characters = 0;\\n        state.ui.status.message = 'Output cleared.';\\n        state.ui.status.error = '';\\n        addLog('Cleared', 'Removed extracted pages from the current view.', false);\\n        bus.emit('cleared');\\n      },\\n    },\\n    pages: observable([]),\\n    activity: observable([]),\\n    history: observable([]),\\n    selectedSessionId: null,\\n    lastSessionId: null,\\n    restoreSession(event, model, element) {\\n      const sessionId = element?.dataset?.sessionId;\\n      if (!sessionId) return;\\n      restoreSessionById(sessionId);\\n    },\\n    async clearHistory() {\\n      if (!sessions?.clear) return;\\n      await sessions.clear();\\n      state.history.splice(0, state.history.length);\\n      state.selectedSessionId = null;\\n      state.stats.sessions = 0;\\n      state.ui.status.message = 'Saved session history cleared.';\\n      state.ui.status.error = '';\\n      addLog('History cleared', 'Removed saved extraction sessions from IndexedDB.', true);\\n      bus.emit('status', state.ui.status.message);\\n    },\\n  });\\n\\n  let sessions = null;\\n  let liveSessions = null;\\n\\n  try {\\n    const db = await dbOpen(DB_NAME, [database => {\\n      if (!database.objectStoreNames.contains(STORE_NAME)) {\\n        database.createObjectStore(STORE_NAME, { keyPath: 'id' });\\n      }\\n    }]);\\n\\n    sessions = new Table(STORE_NAME, db, {});\\n\\n    const refreshHistory = async (logLatest = false) => {\\n      if (!sessions?.scan) return;\\n      const records = await sessions.scan(() => true);\\n      const sorted = [...records].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));\\n      state.history.splice(0, state.history.length, ...sorted.slice(0, MAX_HISTORY).map(record => ({\\n        id: record.id,\\n        fileName: record.fileName,\\n        pageCount: record.pageCount,\\n        characterCount: record.characterCount,\\n        createdAt: record.createdAt,\\n        selected: record.id === state.selectedSessionId,\\n        summary: \`\${record.pageCount} page(s) • \${record.characterCount} chars\`,\\n      })));\\n      state.stats.sessions = records.length;\\n\\n      const latest = sorted[0];\\n      if (!logLatest || !latest || latest.id === state.lastSessionId) return;\\n      state.lastSessionId = latest.id;\\n      addLog('Saved session', \`\${latest.fileName} (\${latest.pageCount} pages) stored in IndexedDB.\`, false);\\n    };\\n\\n    await refreshHistory(false);\\n    sessions.notify({\\n      add() {\\n        refreshHistory(true).catch(error => console.warn('History refresh failed', error));\\n      },\\n      put() {\\n        refreshHistory(true).catch(error => console.warn('History refresh failed', error));\\n      },\\n      update() {\\n        refreshHistory(false).catch(error => console.warn('History refresh failed', error));\\n      },\\n      delete() {\\n        refreshHistory(false).catch(error => console.warn('History refresh failed', error));\\n      },\\n      clear() {\\n        refreshHistory(false).catch(error => console.warn('History refresh failed', error));\\n      },\\n    });\\n  } catch (error) {\\n    console.warn('Persistence unavailable', error);\\n    state.ui.status.error = 'IndexedDB persistence unavailable in this environment.';\\n  }\\n\\n  bus.on('status', message => addLog('Status', message, false));\\n  bus.on('pdf-loaded', payload => addLog('PDF loaded', \`\${payload.fileName} with \${payload.pageCount} pages extracted.\`, true));\\n  bus.on('error', message => addLog('Error', message, true));\\n\\n  bindDataModel(root, state, {});\\n\\n  const pagesList = document.getElementById('pages-list');\\n  if (pagesList) {\\n    pagesList.items = state.pages;\\n    pagesList.context = state;\\n  }\\n\\n  const activityList = document.getElementById('activity-list');\\n  if (activityList) {\\n    activityList.items = state.activity;\\n    activityList.context = state;\\n  }\\n\\n  const historyList = document.getElementById('history-list');\\n  if (historyList) {\\n    historyList.items = state.history;\\n    historyList.context = state;\\n  }\\n\\n  wireFileInput(state, bus, sessions);\\n  wireDropzone(state, bus, sessions);\\n\\n  state.ui.status.message = 'Ready for a PDF. Drag and drop or click the dropzone.';\\n  addLog('Ready', 'Application booted successfully.', false);\\n\\n  window.__PDF_TEXT_EXTRACTOR__ = { state, bus, sessions };\\n\\n  async function restoreSessionById(sessionId) {\\n    if (!sessions?.getOne) return;\\n    try {\\n      const session = await sessions.getOne(sessionId);\\n      if (!session) {\\n        state.ui.status.error = 'Saved session not found.';\\n        bus.emit('error', state.ui.status.error);\\n        return;\\n      }\\n\\n      state.selectedSessionId = session.id;\\n      for (const item of state.history) {\\n        item.selected = item.id === session.id;\\n      }\\n\\n      state.pages.splice(0, state.pages.length, ...(session.pages || []));\\n      state.stats.pages = session.pageCount || 0;\\n      state.stats.characters = session.characterCount || 0;\\n      state.ui.status.message = \`Restored \${session.fileName} from saved history.\`;\\n      state.ui.status.error = '';\\n      addLog('Session restored', \`\${session.fileName} loaded from IndexedDB history.\`, true);\\n      bus.emit('status', state.ui.status.message);\\n    } catch (error) {\\n      console.error(error);\\n      state.ui.status.error = 'Failed to restore saved session.';\\n      bus.emit('error', state.ui.status.error);\\n    }\\n  }\\n\\n  function addLog(title, detail, highlight) {\\n    state.activity.unshift({\\n      id: crypto.randomUUID(),\\n      title,\\n      detail,\\n      highlight,\\n      time: new Date().toLocaleTimeString(),\\n    });\\n    if (state.activity.length > 12) {\\n      state.activity.length = 12;\\n    }\\n  }\\n}\\n\\nfunction wireFileInput(state, bus, sessions) {\\n  const input = document.getElementById('pdf-input');\\n  if (!input) return;\\n\\n  input.addEventListener('change', async event => {\\n    const file = event.target?.files?.[0];\\n    if (!file) return;\\n    await handlePdfFile(file, state, bus, sessions);\\n    input.value = '';\\n  });\\n}\\n\\nfunction wireDropzone(state, bus, sessions) {\\n  const dropzone = document.getElementById('dropzone');\\n  if (!dropzone) return;\\n\\n  ['dragenter', 'dragover'].forEach(type => {\\n    dropzone.addEventListener(type, event => {\\n      event.preventDefault();\\n      state.ui.dragOver = true;\\n    });\\n  });\\n\\n  ['dragleave', 'dragend'].forEach(type => {\\n    dropzone.addEventListener(type, () => {\\n      state.ui.dragOver = false;\\n    });\\n  });\\n\\n  dropzone.addEventListener('drop', async event => {\\n    event.preventDefault();\\n    state.ui.dragOver = false;\\n    const file = event.dataTransfer?.files?.[0];\\n    if (!file) return;\\n    await handlePdfFile(file, state, bus, sessions);\\n  });\\n}\\n\\nasync function handlePdfFile(file, state, bus, sessions) {\\n  if (file.type && file.type !== 'application/pdf') {\\n    state.ui.status.error = 'Please drop a valid PDF file.';\\n    bus.emit('error', state.ui.status.error);\\n    return;\\n  }\\n\\n  state.ui.busy = true;\\n  state.ui.status.message = \`Reading \${file.name}...\`;\\n  state.ui.status.error = '';\\n  bus.emit('status', state.ui.status.message);\\n\\n  try {\\n    const bytes = await file.arrayBuffer();\\n    const loadingTask = pdfjsLib.getDocument({ data: bytes });\\n    const pdf = await loadingTask.promise;\\n    const pages = [];\\n    let totalCharacters = 0;\\n\\n    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {\\n      const page = await pdf.getPage(pageNumber);\\n      const viewport = page.getViewport({ scale: 1 });\\n      const textContent = await page.getTextContent();\\n      const rendered = renderPageToBuffer(textContent.items, viewport.width, viewport.height);\\n      totalCharacters += rendered.replace(/\\\\n/g, '').length;\\n      pages.push({\\n        id: \`\${file.name}-\${pageNumber}\`,\\n        pageNumber,\\n        summary: \`\${rendered.length} chars\`,\\n        text: rendered,\\n      });\\n    }\\n\\n    state.pages.splice(0, state.pages.length, ...pages);\\n    state.stats.pages = pages.length;\\n    state.stats.characters = totalCharacters;\\n    state.ui.status.message = \`Extracted \${pages.length} page(s) from \${file.name}.\`;\\n    state.ui.status.error = '';\\n\\n    const session = {\\n      id: crypto.randomUUID(),\\n      fileName: file.name,\\n      pageCount: pages.length,\\n      characterCount: totalCharacters,\\n      createdAt: new Date().toISOString(),\\n      pages,\\n    };\\n\\n    if (sessions?.put) {\\n      await sessions.put(session);\\n    }\\n    bus.emit('pdf-loaded', { fileName: file.name, pageCount: pages.length });\\n  } catch (error) {\\n    console.error(error);\\n    state.ui.status.error = error?.message || 'Failed to extract PDF text.';\\n    bus.emit('error', state.ui.status.error);\\n  } finally {\\n    state.ui.busy = false;\\n  }\\n}\\n\\nfunction renderPageToBuffer(items, pageWidth, pageHeight) {\\n  const rows = [];\\n  const rowCount = Math.max(1, Math.ceil((pageHeight / pageWidth) * BUFFER_WIDTH * 1.6));\\n\\n  for (let i = 0; i < rowCount; i += 1) {\\n    rows.push(Array(BUFFER_WIDTH).fill(' '));\\n  }\\n\\n  for (const item of items) {\\n    const text = String(item.str || '');\\n    if (!text.trim()) continue;\\n\\n    const transform = item.transform || [1, 0, 0, 1, 0, 0];\\n    const x = Number(transform[4] || 0);\\n    const y = Number(transform[5] || 0);\\n    const col = clamp(Math.round((x / Math.max(pageWidth, 1)) * (BUFFER_WIDTH - 1)), 0, BUFFER_WIDTH - 1);\\n    const row = clamp(Math.round(((pageHeight - y) / Math.max(pageHeight, 1)) * (rowCount - 1)), 0, rowCount - 1);\\n\\n    for (let i = 0; i < text.length; i += 1) {\\n      const targetCol = col + i;\\n      if (targetCol >= BUFFER_WIDTH) break;\\n      rows[row][targetCol] = text[i];\\n    }\\n  }\\n\\n  return rows\\n    .map(chars => chars.join('').replace(/\\\\s+$/g, ''))\\n    .join('\\\\n')\\n    .replace(/\\\\n{3,}/g, '\\\\n\\\\n')\\n    .trimEnd();\\n}\\n\\nfunction clamp(value, min, max) {\\n  return Math.min(max, Math.max(min, value));\\n}\\n",
    "index.html": "<!doctype html>\\n<html lang=\\"en\\">\\n<head>\\n  <meta charset=\\"UTF-8\\">\\n  <meta name=\\"viewport\\" content=\\"width=device-width, initial-scale=1.0\\">\\n  <title>PDF Text Extractor</title>\\n  <link rel=\\"stylesheet\\" href=\\"./style.css\\">\\n</head>\\n<body>\\n  <div id=\\"app\\" class=\\"app-shell\\">\\n    <header class=\\"hero\\">\\n      <div>\\n        <h1>PDF Text Extractor</h1>\\n        <p class=\\"subtitle\\">Drop a PDF to build a text-only page layout preview using a 100-column virtual buffer.</p>\\n      </div>\\n      <div class=\\"hero-stats\\" data-bind-context=\\"stats\\">\\n        <div class=\\"stat-card\\">\\n          <span class=\\"stat-label\\">Pages</span>\\n          <strong data-bind-text=\\"pages\\"></strong>\\n        </div>\\n        <div class=\\"stat-card\\">\\n          <span class=\\"stat-label\\">Chars</span>\\n          <strong data-bind-text=\\"characters\\"></strong>\\n        </div>\\n        <div class=\\"stat-card\\">\\n          <span class=\\"stat-label\\">Sessions</span>\\n          <strong data-bind-text=\\"sessions\\"></strong>\\n        </div>\\n      </div>\\n    </header>\\n\\n    <main class=\\"workspace\\">\\n      <section class=\\"panel controls\\" data-bind-context=\\"ui\\">\\n        <label\\n          id=\\"dropzone\\"\\n          class=\\"dropzone\\"\\n          data-bind-class-dragover=\\"dragOver\\"\\n          data-bind-class-busy=\\"busy\\"\\n          for=\\"pdf-input\\"\\n        >\\n          <input id=\\"pdf-input\\" type=\\"file\\" accept=\\"application/pdf\\">\\n          <span class=\\"dropzone-title\\" data-bind-text=\\"dropzoneTitle\\"></span>\\n          <span class=\\"dropzone-hint\\" data-bind-text=\\"dropzoneHint\\"></span>\\n        </label>\\n\\n        <div class=\\"actions\\">\\n          <button class=\\"secondary\\" data-bind-onclick=\\"loadSample\\">Load sample instructions</button>\\n          <button class=\\"danger\\" data-bind-onclick=\\"clearOutput\\">Clear output</button>\\n        </div>\\n\\n        <section class=\\"status-card\\">\\n          <h2>Status</h2>\\n          <p class=\\"status-line\\" data-bind-text=\\"status.message\\"></p>\\n          <p class=\\"error-line\\" data-bind-text=\\"status.error\\"></p>\\n        </section>\\n\\n        <section class=\\"status-card\\">\\n          <h2>Saved Sessions</h2>\\n          <div class=\\"actions compact-actions\\">\\n            <button class=\\"secondary\\" data-bind-onclick=\\"clearHistory\\">Clear saved history</button>\\n          </div>\\n          <asljs-list id=\\"history-list\\">\\n            <template data-slot=\\"container\\">\\n              <div class=\\"log-list\\" data-role=\\"items\\"></div>\\n            </template>\\n            <template data-slot=\\"item\\">\\n              <button\\n                class=\\"history-entry\\"\\n                type=\\"button\\"\\n                data-bind-class-selected=\\"item.selected\\"\\n                data-bind-onclick=\\"context.restoreSession\\"\\n                data-bind-data-session-id=\\"item.id\\"\\n              >\\n                <div class=\\"log-entry-top\\">\\n                  <strong data-bind-text=\\"item.fileName\\"></strong>\\n                  <span data-bind-text=\\"item.createdAt\\"></span>\\n                </div>\\n                <span data-bind-text=\\"item.summary\\"></span>\\n              </button>\\n            </template>\\n            <template data-slot=\\"empty\\">\\n              <p class=\\"empty-state\\">No saved sessions yet.</p>\\n            </template>\\n          </asljs-list>\\n        </section>\\n\\n        <section class=\\"status-card\\">\\n          <h2>Activity Log</h2>\\n          <asljs-list id=\\"activity-list\\">\\n            <template data-slot=\\"container\\">\\n              <div class=\\"log-list\\" data-role=\\"items\\"></div>\\n            </template>\\n            <template data-slot=\\"item\\">\\n              <article class=\\"log-entry\\" data-bind-class-highlight=\\"item.highlight\\">\\n                <div class=\\"log-entry-top\\">\\n                  <strong data-bind-text=\\"item.title\\"></strong>\\n                  <span data-bind-text=\\"item.time\\"></span>\\n                </div>\\n                <p data-bind-text=\\"item.detail\\"></p>\\n              </article>\\n            </template>\\n            <template data-slot=\\"empty\\">\\n              <p class=\\"empty-state\\">No activity yet.</p>\\n            </template>\\n          </asljs-list>\\n        </section>\\n      </section>\\n\\n      <section class=\\"panel output-panel\\">\\n        <div class=\\"output-header\\">\\n          <h2>Extracted Text Layout</h2>\\n          <p>Whitespace preserved, 8pt monospace, all pages shown.</p>\\n        </div>\\n        <asljs-list id=\\"pages-list\\">\\n          <template data-slot=\\"container\\">\\n            <div class=\\"pages-list\\" data-role=\\"items\\"></div>\\n          </template>\\n          <template data-slot=\\"item\\">\\n            <section class=\\"page-card\\">\\n              <header class=\\"page-card-header\\">\\n                <h3>Page <span data-bind-text=\\"item.pageNumber\\"></span></h3>\\n                <span data-bind-text=\\"item.summary\\"></span>\\n              </header>\\n              <pre class=\\"page-text\\" data-bind-text=\\"item.text\\"></pre>\\n            </section>\\n          </template>\\n          <template data-slot=\\"empty\\">\\n            <div class=\\"empty-output\\">\\n              <h3>No PDF loaded</h3>\\n              <p>Drop a PDF file onto the zone to extract positioned text.</p>\\n            </div>\\n          </template>\\n        </asljs-list>\\n      </section>\\n    </main>\\n  </div>\\n\\n  <script type=\\"module\\" src=\\"app.js\\"><\/script>\\n</body>\\n</html>",
    "package.json": "{\\n  \\"name\\": \\"pdf-text-extractor\\",\\n  \\"version\\": \\"1.0.0\\",\\n  \\"private\\": true,\\n  \\"type\\": \\"module\\",\\n  \\"scripts\\": {\\n    \\"start\\": \\"npx serve .\\",\\n    \\"dev\\": \\"npx serve .\\"\\n  },\\n  \\"dependencies\\": {\\n    \\"asljs-components\\": \\"latest\\",\\n    \\"asljs-dali\\": \\"latest\\",\\n    \\"asljs-data-binding\\": \\"latest\\",\\n    \\"asljs-eventful\\": \\"latest\\",\\n    \\"asljs-observable\\": \\"latest\\"\\n  }\\n}",
    "style.css": ":root {\\n  color-scheme: light;\\n  --bg: #f4f7fb;\\n  --panel: #ffffff;\\n  --border: #d8e0ea;\\n  --text: #1f2937;\\n  --muted: #5f6b7a;\\n  --accent: #2563eb;\\n  --accent-soft: #dbeafe;\\n  --danger: #b91c1c;\\n  --shadow: 0 10px 30px rgba(15, 23, 42, 0.08);\\n}\\n\\n* {\\n  box-sizing: border-box;\\n}\\n\\nbody {\\n  margin: 0;\\n  font-family: Arial, Helvetica, sans-serif;\\n  background: var(--bg);\\n  color: var(--text);\\n}\\n\\n.app-shell {\\n  max-width: 1400px;\\n  margin: 0 auto;\\n  padding: 24px;\\n}\\n\\n.hero {\\n  display: flex;\\n  justify-content: space-between;\\n  gap: 16px;\\n  align-items: flex-start;\\n  margin-bottom: 24px;\\n}\\n\\n.hero h1 {\\n  margin: 0 0 8px;\\n}\\n\\n.subtitle {\\n  margin: 0;\\n  color: var(--muted);\\n}\\n\\n.hero-stats {\\n  display: flex;\\n  gap: 12px;\\n}\\n\\n.stat-card,\\n.panel,\\n.page-card,\\n.status-card,\\n.log-entry {\\n  background: var(--panel);\\n  border: 1px solid var(--border);\\n  border-radius: 14px;\\n  box-shadow: var(--shadow);\\n}\\n\\n.stat-card {\\n  min-width: 110px;\\n  padding: 14px;\\n}\\n\\n.stat-label {\\n  display: block;\\n  color: var(--muted);\\n  font-size: 12px;\\n  margin-bottom: 6px;\\n}\\n\\n.workspace {\\n  display: grid;\\n  grid-template-columns: 340px 1fr;\\n  gap: 20px;\\n}\\n\\n.panel {\\n  padding: 18px;\\n}\\n\\n.controls {\\n  display: flex;\\n  flex-direction: column;\\n  gap: 16px;\\n}\\n\\n.dropzone {\\n  display: flex;\\n  flex-direction: column;\\n  justify-content: center;\\n  align-items: center;\\n  min-height: 220px;\\n  border: 2px dashed #93c5fd;\\n  border-radius: 16px;\\n  background: #eff6ff;\\n  text-align: center;\\n  padding: 20px;\\n  cursor: pointer;\\n  transition: 0.2s ease;\\n}\\n\\n.dropzone.dragover {\\n  border-color: var(--accent);\\n  background: var(--accent-soft);\\n  transform: scale(1.01);\\n}\\n\\n.dropzone.busy {\\n  opacity: 0.7;\\n}\\n\\n.dropzone input {\\n  display: none;\\n}\\n\\n.dropzone-title {\\n  font-size: 20px;\\n  font-weight: 700;\\n  margin-bottom: 8px;\\n}\\n\\n.dropzone-hint {\\n  color: var(--muted);\\n  line-height: 1.5;\\n}\\n\\n.actions {\\n  display: flex;\\n  gap: 10px;\\n}\\n\\n.compact-actions {\\n  margin-bottom: 10px;\\n}\\n\\nbutton {\\n  border: 1px solid var(--border);\\n  background: white;\\n  color: var(--text);\\n  border-radius: 10px;\\n  padding: 10px 14px;\\n  cursor: pointer;\\n}\\n\\nbutton.secondary {\\n  background: #eff6ff;\\n}\\n\\nbutton.danger {\\n  color: white;\\n  background: var(--danger);\\n  border-color: var(--danger);\\n}\\n\\n.status-card {\\n  padding: 14px;\\n}\\n\\n.status-card h2,\\n.output-header h2 {\\n  margin-top: 0;\\n}\\n\\n.status-line,\\n.error-line,\\n.empty-state,\\n.empty-output p,\\n.output-header p,\\n.log-entry p {\\n  margin-bottom: 0;\\n}\\n\\n.error-line {\\n  color: var(--danger);\\n  min-height: 1.2em;\\n}\\n\\n.log-list,\\n.pages-list {\\n  display: flex;\\n  flex-direction: column;\\n  gap: 12px;\\n}\\n\\n.log-entry {\\n  padding: 12px;\\n}\\n\\n.history-entry {\\n  width: 100%;\\n  text-align: left;\\n  display: flex;\\n  flex-direction: column;\\n  gap: 6px;\\n}\\n\\n.history-entry.selected {\\n  border-color: var(--accent);\\n  background: var(--accent-soft);\\n}\\n\\n.log-entry.highlight {\\n  border-color: #93c5fd;\\n}\\n\\n.log-entry-top {\\n  display: flex;\\n  justify-content: space-between;\\n  gap: 12px;\\n  font-size: 12px;\\n  color: var(--muted);\\n}\\n\\n.output-panel {\\n  min-width: 0;\\n}\\n\\n.output-header {\\n  margin-bottom: 16px;\\n}\\n\\n.page-card {\\n  padding: 16px;\\n}\\n\\n.page-card-header {\\n  display: flex;\\n  justify-content: space-between;\\n  gap: 12px;\\n  align-items: baseline;\\n  margin-bottom: 12px;\\n}\\n\\n.page-card-header h3 {\\n  margin: 0;\\n}\\n\\n.page-text {\\n  margin: 0;\\n  white-space: pre-wrap;\\n  font-family: \\"Courier New\\", Courier, monospace;\\n  font-size: 8pt;\\n  line-height: 1.2;\\n  overflow: auto;\\n  background: #f8fafc;\\n  border: 1px solid var(--border);\\n  border-radius: 10px;\\n  padding: 12px;\\n}\\n\\n.empty-output {\\n  border: 1px dashed var(--border);\\n  border-radius: 14px;\\n  padding: 24px;\\n  text-align: center;\\n  background: #f8fafc;\\n}\\n\\n@media (max-width: 980px) {\\n  .hero,\\n  .workspace {\\n    grid-template-columns: 1fr;\\n    display: grid;\\n  }\\n\\n  .hero-stats {\\n    flex-wrap: wrap;\\n  }\\n}\\n"
  }
}`];function ka(){return Oa.map(Na).map(Ca)}function Aa(e){return ka().find(t=>t.name===e)??null}function ja(e){return ka().find(t=>t.id===e)??null}function Ma(e,t,n){return Object.entries(e.files).map(([e,r])=>({id:n(),appId:t,name:e,content:r}))}function Na(e){if(typeof e==`string`)return e;if(typeof e==`object`&&e)return JSON.stringify(e);throw Error(`Invalid sample source format.`)}function Pa(e){let t=Ia(e,`PLAN`);return t!==``&&t!==`Pending changes for the next generation cycle go here.`}function Fa(e){let t=Ia(e,`PLAN`).split(/\r?\n/).map(e=>e.trim()).filter(e=>e!==``);return t.length===0?`# CHANGE
`:[`# CHANGE`,``,`Current generation cycle:`,``,...t.map(e=>/^[-*]\s+/.test(e)?e:`- ${e}`)].join(`
`)}function Ia(e,t){return e.replace(RegExp(`^#\\s+${t}\\s*$`,`im`),``).trim()}var La=`asljs-app-builder:eval-request`,Ra=`asljs-app-builder:eval-response`,za=`asljs-app-builder:diagnostics-request`,Ba=`asljs-app-builder:diagnostics-response`,Va=`<script>
(() => {
  const REQUEST = '${La}';
  const RESPONSE = '${Ra}';
  const DIAG_REQUEST = '${za}';
  const DIAG_RESPONSE = '${Ba}';
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
<\/script>`;function Ha(e,t,n){if(t.length===0){e.removeAttribute(`srcdoc`),e.src=`about:blank`;return}let r=t.find(e=>e.name===`index.html`)??t.find(e=>e.name.endsWith(`.html`))??null;if(r===null){e.removeAttribute(`srcdoc`),e.src=`about:blank`;return}let i=r.content,a=Qa(t),o=t.find(e=>e.name===`style.css`)??t.find(e=>e.name.endsWith(`.css`))??null,s=o===null?null:to(o.content,o.name,a);o!==null&&(i=i.replace(/<link[^>]+href=["']style\.css["'][^>]*>/gi,`<style>${s}</style>`),i=i.replace(/<link[^>]+href=["']([^"']+\.css)["'][^>]*>/gi,`<style>${s}</style>`));for(let e of t){if(!e.name.endsWith(`.js`))continue;let t=e.name.replace(/[.*+?^${}()|[\]\\]/g,`\\$&`);i=i.replace(RegExp(`(<script[^>]*?)\\s+src=["']${t}["']([^>]*)><\\/script>`,`gi`),(t,n,r)=>{let i=`${String(n)} ${String(r)}`;return/type=["']module["']/i.test(i)?`<script type="module">${e.content}<\/script>`:`<script>${e.content}<\/script>`})}i=eo(i,r.name,a),i=qa(i,t),i=Za(i,n),i=Ka(i),e.srcdoc=i}async function Ua(e,t){let n=await Ga(e,La,{code:t},Ra);if(n.ok===!0)return n.value;throw Error(typeof n.error==`string`?n.error:`Unknown preview evaluation error.`)}async function Wa(e){let t=await Ga(e,za,{},Ba);if(t.ok!==!0)throw Error(typeof t.error==`string`?t.error:`Failed to read preview diagnostics.`);return t.diagnostics??{logs:[],errors:[]}}async function Ga(e,t,n,r){let i=e.contentWindow;if(i===null)throw Error(`Preview frame is not available.`);let a=crypto.randomUUID();return new Promise((e,o)=>{let s=window.setTimeout(()=>{l(),o(Error(`Timed out waiting for app evaluation result.`))},5e3),c=t=>{if(t.source!==i)return;let n=t.data;n.type!==r||n.id!==a||(l(),e(n))};function l(){window.clearTimeout(s),window.removeEventListener(`message`,c)}window.addEventListener(`message`,c),i.postMessage({type:t,id:a,...n},`*`)})}function Ka(e){return e.includes(La)?e:e.includes(`</body>`)?e.replace(`</body>`,`${Va}</body>`):`${e}\n${Va}`}function qa(e,t){if(/type=["']importmap["']/i.test(e))return e;let n=Ja((t.find(e=>e.name===`package.json`)??null)?.content),r=Object.fromEntries(n.map(([e,t])=>[e,`https://esm.sh/${e}@${t}?bundle`]));if(Object.keys(r).length===0)return e;let i=`<script type="importmap">${JSON.stringify({imports:r})}<\/script>`;return/<head[^>]*>/i.test(e)?e.replace(/<head[^>]*>/i,e=>`${e}\n${i}`):`${i}\n${e}`}function Ja(e){if(e===void 0)return Xa();try{let t=JSON.parse(e),n={...t.dependencies??{},...t.devDependencies??{}};return[`asljs-eventful`,`asljs-observable`,`asljs-data-binding`,`asljs-components`,`asljs-dali`,`openai`].map(e=>[e,Ya(n[e])])}catch{return Xa()}}function Ya(e){if(typeof e!=`string`||e.trim()===``)return`latest`;let t=e.trim().replace(/^[~^<>=\s]+/,``);return t===``?`latest`:t}function Xa(){return[[`asljs-eventful`,`latest`],[`asljs-observable`,`latest`],[`asljs-data-binding`,`latest`],[`asljs-components`,`latest`],[`asljs-dali`,`latest`],[`openai`,`latest`]]}function Za(e,t){if(e.includes(`__ASLJS_APP_BUILDER_HOST__`))return e;let n=`<script>window.__ASLJS_APP_BUILDER_HOST__ = ${JSON.stringify({openAiApiKey:t?.hostOpenAiApiKey===void 0||t.hostOpenAiApiKey.trim()===``?null:t.hostOpenAiApiKey})};<\/script>`;return e.includes(`</head>`)?e.replace(`</head>`,`${n}</head>`):e.includes(`<body`)?e.replace(/<body[^>]*>/i,e=>`${e}\n${n}`):`${n}\n${e}`}function Qa(e){let t=new Map;for(let n of e){let e=$a(n.content);e!==null&&t.set(ao(n.name),e)}return t}function $a(e){let t=e.trim();return/^data:[^,]+,.+/i.test(t)?t:null}function eo(e,t,n){return e.replace(/\b(src|href|poster)=(["'])([^"']+)\2/gi,(e,r,i,a)=>{let o=no(t,String(a),n);return o===null?e:`${String(r)}=${String(i)}${o}${String(i)}`})}function to(e,t,n){return e.replace(/url\(\s*(["']?)([^"')]+)\1\s*\)/gi,(e,r,i)=>{let a=no(t,String(i),n);return a===null?e:`url(${String(r)}${a}${String(r)})`})}function no(e,t,n){let r=t.trim();if(r===``||r.startsWith(`#`)||/^[a-z]+:/i.test(r)||r.startsWith(`//`))return null;let i=r.split(`#`,1)[0]??r,a=i.split(`?`,1)[0]??i,o=ao(io(ro(e),a));return n.get(o)??null}function ro(e){let t=ao(e).split(`/`);return t.pop(),t.join(`/`)}function io(e,t){return t.startsWith(`/`)||e===``?t:`${e}/${t}`}function ao(e){let t=e.replace(/\\/g,`/`).split(`/`),n=[];for(let e of t)if(!(e===``||e===`.`)){if(e===`..`){n.pop();continue}n.push(e)}return n.join(`/`)}var oo=6e3;function so(e){let t=Number.isFinite(e.timeoutMs)?Math.max(1,Math.floor(e.timeoutMs)):oo;async function n(n){let r=JSON.stringify(n),i=await vo(e.codec.compress(r),t,`Link compression timed out. Use Download export instead.`),a=`${e.baseUrl}${e.hashPrefix}${i}`;return{url:a,exceedsMaxUrlLength:a.length>e.maxUrlLength}}async function r(n){let r=await vo(e.codec.decompress(n),t,`Link decompression timed out.`);return JSON.parse(r)}function i(t){return t.startsWith(e.hashPrefix)?t.slice(e.hashPrefix.length):null}return{createShareUrl:n,parsePayloadFromToken:r,readTokenFromHash:i}}function co(){return{compress:lo,decompress:uo}}async function lo(e){return go(await fo(new TextEncoder().encode(e),`gzip`))}async function uo(e){let t=await po(_o(e),`gzip`);return new TextDecoder().decode(t)}async function fo(e,t){return ho(new Blob([mo(e)]).stream().pipeThrough(new CompressionStream(t)))}async function po(e,t){return ho(new Blob([mo(e)]).stream().pipeThrough(new DecompressionStream(t)))}function mo(e){let t=new Uint8Array(e.byteLength);return t.set(e),t}async function ho(e){let t=e.getReader(),n=[],r=0;for(;;){let{value:e,done:i}=await t.read();if(i)break;e!==void 0&&(n.push(e),r+=e.length)}let i=new Uint8Array(r),a=0;for(let e of n)i.set(e,a),a+=e.length;return i}function go(e){let t=32768,n=``;for(let r=0;r<e.length;r+=t){let i=e.subarray(r,r+t);n+=String.fromCharCode(...i)}return btoa(n).replace(/\+/g,`-`).replace(/\//g,`_`).replace(/=+$/g,``)}function _o(e){let t=e.replace(/-/g,`+`).replace(/_/g,`/`),n=t.length%4,r=n===0?t:`${t}${`=`.repeat(4-n)}`,i=``;try{i=atob(r)}catch{throw Error(`Invalid compressed share token.`)}let a=new Uint8Array(i.length);for(let e=0;e<i.length;e++)a[e]=i.charCodeAt(e);return a}async function vo(e,t,n){let r,i=new Promise((e,i)=>{r=globalThis.setTimeout(()=>{i(Error(n))},t)});try{return await Promise.race([e,i])}finally{r!==void 0&&globalThis.clearTimeout(r)}}async function yo(e,t){let n={...e.files};for(let[r,i]of Object.entries(e.files)){let e=bo(r);if(e!==null){n[r]=await t(i,e);continue}xo(r)&&(n[r]=So(i))}return{...e,files:n}}function bo(e){let t=e.toLowerCase();return t.endsWith(`.css`)?`css`:t.endsWith(`.ts`)?`ts`:t.endsWith(`.tsx`)?`tsx`:t.endsWith(`.jsx`)?`jsx`:t.endsWith(`.js`)||t.endsWith(`.mjs`)||t.endsWith(`.cjs`)?`js`:null}function xo(e){let t=e.toLowerCase();return t.endsWith(`.html`)||t.endsWith(`.htm`)}function So(e){let t=[];return e.replace(/<(pre|textarea|script|style)\b[\s\S]*?<\/\1>/gi,e=>`__ASLJS_HTML_BLOCK_${t.push(e)-1}__`).replace(/<!--([\s\S]*?)-->/g,``).replace(/>\s+</g,`><`).replace(/\s{2,}/g,` `).trim().replace(/__ASLJS_HTML_BLOCK_(\d+)__/g,(e,n)=>t[Number.parseInt(n,10)]??``)}var Co=`Use copy buttons to share as text or HTML.`;function wo(e){let t=e.trim();return/(?:^|\/)[^/]+\.test\.js$/i.test(t)||/(?:^|\/)(DEVELOP|CHANGE|PLAN)\.md$/i.test(t)}function To(e,t,n){let r=`Link is ready at ${e} characters. Practical working limit is about ${t}. `;return e>n?`${r}It is over the warning threshold of ${n}, so some apps may reject it.`:e>t?`${r}It may still work, but shorter links are safer.`:`${r}${Co}`}var J=T({apps:[],currentAppId:null,files:[],activeFileName:null,chatMessages:[],generating:!1,generationBusy:!1,generationStatus:``,error:null});function Eo(e){let t=e.selectElement,n=[...e.apps].sort((e,t)=>t.updatedAt.localeCompare(e.updatedAt)),r=n.map(e=>({value:e.id,label:e.name}));if(n.length>0&&r.push({value:`__separator__`,label:`────────`,disabled:!0}),r.push({value:e.newActionValue,label:`New...`},{value:e.importActionValue,label:`Import...`}),t.items=r,t.disabled=r.length===0,e.currentAppId!==null){t.value=e.currentAppId;return}t.value=r[0]?.value??``}function Y(e){let t=document.getElementById(e);if(t===null)throw Error(`Missing element #${e}`);return t}function X(e,t){e.type=`button`,e.buttonClassName=t.className,Do(e,{text:t.text??``,icon:t.icon??``})}function Do(e,t){e.text=t.text,e.icon=t.icon??``,e.localName===`button`&&(e.textContent=t.text)}function Oo(e,t){e.placeholder=t.placeholder??null,e.inputType=t.inputType??`text`,e.controlClassName=t.className??`form-control bootstrap-input`}function ko(e,t){e.controlClassName=t.className,e.items=t.items??[],e.placeholder=t.placeholder??null}function Z(e){return e.value??``}function Q(e,t){e.value=t}function Ao(e){let t=e.querySelector(`input, textarea, select, button`);if(t!==null){t.focus();return}e.focus()}function jo(e){let t=e.querySelector(`input, textarea`);t?.focus(),t?.select()}function Mo(){return`
    <div id="name-modal" class="hidden position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center p-3 app-modal-overlay">
      <div class="bg-body rounded-4 shadow border w-100" style="max-width: 32rem;">
        <div class="d-flex align-items-center justify-content-between gap-3 px-4 py-3 border-bottom">
          <h3 id="name-modal-title" class="h5 mb-0 d-flex align-items-center gap-2"><i class="bi bi-type"></i><span>New App</span></h3>
          <asljs-button id="btn-close-name-modal"></asljs-button>
        </div>
        <div class="d-flex flex-column gap-2 p-4">
          <label class="form-label mb-0">App name</label>
          <asljs-text-input id="app-name-input"></asljs-text-input>
        </div>
        <div class="d-flex justify-content-end gap-2 px-4 py-3 border-top bg-body-tertiary rounded-bottom-4">
          <asljs-button id="btn-confirm-name"></asljs-button>
          <asljs-button id="btn-cancel-name"></asljs-button>
        </div>
      </div>
    </div>
  `}function No(){let e=Y(`name-modal`),t=Y(`name-modal-title`),n=Y(`app-name-input`),r=Y(`btn-confirm-name`),i=Y(`btn-cancel-name`),a=Y(`btn-close-name-modal`),o=null;X(a,{icon:`<i class="bi bi-x-lg"></i>`,className:`btn btn-outline-secondary btn-sm`}),X(r,{text:`OK`,className:`btn btn-primary`}),X(i,{text:`Cancel`,className:`btn btn-outline-secondary`}),Oo(n,{placeholder:`My App`});function s(){o=null,e.classList.add(`hidden`)}async function c(){if(o===null)return;let e=Z(n).trim();if(e===``){Ao(n);return}let t=o;s(),await t.onConfirm(e)}return r.addEventListener(`click`,()=>{c()}),i.addEventListener(`click`,s),a.addEventListener(`click`,s),n.addEventListener(`keydown`,e=>{e.key===`Enter`&&(e.preventDefault(),c())}),e.addEventListener(`click`,t=>{t.target===e&&s()}),{open(r){if(o=r,t.textContent=r.title,Q(n,r.initialValue),e.classList.remove(`hidden`),r.selectText){jo(n);return}Ao(n)},close:s}}function Po(){return`
    <div id="project-settings-modal" class="hidden position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center p-3 app-modal-overlay">
      <div class="bg-body rounded-4 shadow border w-100" style="max-width: 36rem;">
        <div class="d-flex align-items-center justify-content-between gap-3 px-4 py-3 border-bottom">
          <h3 class="h5 mb-0 d-flex align-items-center gap-2"><i class="bi bi-sliders"></i><span>Project Settings</span></h3>
          <asljs-button id="btn-close-project-settings-x"></asljs-button>
        </div>
        <div class="d-flex flex-column gap-3 p-4">
          <div class="d-flex flex-column gap-2">
          <label class="form-label mb-0">Name</label>
          <asljs-text-input id="project-name-input"></asljs-text-input>
          </div>
          <div class="d-flex flex-column gap-2">
          <label class="form-label mb-0">Author name (optional)</label>
          <asljs-text-input id="project-author-name-input"></asljs-text-input>
          </div>
          <div class="d-flex flex-column gap-2">
          <label class="form-label mb-0">Author email (optional)</label>
          <asljs-text-input id="project-author-email-input"></asljs-text-input>
          </div>
        </div>
        <div class="d-flex justify-content-between align-items-center gap-2 flex-wrap px-4 py-3 border-top bg-body-tertiary rounded-bottom-4">
          <asljs-button id="btn-delete-project"></asljs-button>
          <div class="d-flex gap-2 flex-wrap justify-content-end">
          <asljs-button id="btn-save-project-settings"></asljs-button>
          <asljs-button id="btn-close-project-settings"></asljs-button>
          </div>
        </div>
      </div>
    </div>
  `}function Fo(e){let t=Y(`project-settings-modal`),n=Y(`project-name-input`),r=Y(`project-author-name-input`),i=Y(`project-author-email-input`),a=Y(`btn-save-project-settings`),o=Y(`btn-delete-project`),s=Y(`btn-close-project-settings`),c=Y(`btn-close-project-settings-x`);X(c,{icon:`<i class="bi bi-x-lg"></i>`,className:`btn btn-outline-secondary btn-sm`}),X(a,{text:`Save`,className:`btn btn-primary`}),X(o,{text:`Delete`,className:`btn btn-danger`}),X(s,{text:`Cancel`,className:`btn btn-outline-secondary`}),Oo(n,{placeholder:`Project name`}),Oo(r,{placeholder:`Jane Doe`}),Oo(i,{placeholder:`jane@example.com`,inputType:`email`});function l(){t.classList.add(`hidden`)}function u(){return{name:Z(n).trim(),authorName:Z(r).trim(),authorEmail:Z(i).trim()}}async function d(){let t=u();if(t.name===``){Ao(n);return}await e.onSave(t),l()}async function f(){l(),await e.onDelete()}return a.addEventListener(`click`,()=>{d()}),o.addEventListener(`click`,()=>{f()}),s.addEventListener(`click`,l),c.addEventListener(`click`,l),n.addEventListener(`keydown`,e=>{e.key===`Enter`&&(e.preventDefault(),d())}),t.addEventListener(`click`,e=>{e.target===t&&l()}),{open(e){Q(n,e.name),Q(r,e.authorName),Q(i,e.authorEmail),t.classList.remove(`hidden`),jo(n)},close:l}}function Io(){return`
    <div id="settings-modal" class="hidden position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center p-3 app-modal-overlay">
      <div class="bg-body rounded-4 shadow border w-100" style="max-width: 36rem;">
        <div class="d-flex align-items-center justify-content-between gap-3 px-4 py-3 border-bottom">
          <h3 class="h5 mb-0 d-flex align-items-center gap-2"><i class="bi bi-gear"></i><span>Settings</span></h3>
          <asljs-button id="btn-close-settings"></asljs-button>
        </div>
        <div class="d-flex flex-column gap-3 p-4">
          <div class="d-flex flex-column gap-2">
          <label class="form-label mb-0">OpenAI API Key</label>
          <asljs-text-input id="api-key-input"></asljs-text-input>
          </div>
          <p class="small text-body-secondary mb-0">
            Available models are loaded from OpenAI when the app starts. Choose
            the chat model in the chat panel header and the generation model
            below the chat window.
          </p>
          <div class="d-flex flex-column gap-2">
          <label class="form-label mb-0">Theme</label>
          <asljs-select id="theme-select"></asljs-select>
          </div>
          <div class="d-flex flex-column gap-2">
          <label class="form-label mb-0">Font size (px)</label>
          <asljs-text-input id="font-size-input"></asljs-text-input>
          </div>
          <div class="d-flex flex-column gap-2">
          <label class="form-label mb-0">Max tool steps (initial)</label>
          <asljs-text-input id="max-tool-steps-input"></asljs-text-input>
          </div>
          <p class="small text-body-secondary mb-0">
            Your key is stored only in this browser (IndexedDB). It is sent
            directly to OpenAI — no server proxy is involved. Leave blank to
            skip AI generation.
          </p>
        </div>
        <div class="d-flex justify-content-end gap-2 px-4 py-3 border-top bg-body-tertiary rounded-bottom-4">
          <asljs-button id="btn-save-settings"></asljs-button>
          <asljs-button id="btn-cancel-settings"></asljs-button>
        </div>
      </div>
    </div>
  `}function Lo(e){let t=Y(`settings-modal`),n=Y(`btn-close-settings`),r=Y(`btn-save-settings`),i=Y(`btn-cancel-settings`),a=Y(`api-key-input`),o=Y(`theme-select`),s=Y(`font-size-input`),c=Y(`max-tool-steps-input`);X(n,{icon:`<i class="bi bi-x-lg"></i>`,className:`btn btn-outline-secondary btn-sm`}),X(r,{text:`Save`,className:`btn btn-primary`}),X(i,{text:`Cancel`,className:`btn btn-outline-secondary`}),Oo(a,{placeholder:`sk-…  (optional, stored locally)`,inputType:`password`}),Oo(s,{placeholder:`14`,inputType:`number`}),Oo(c,{placeholder:`20`,inputType:`number`}),ko(o,{className:`form-select bootstrap-select`,items:[{value:`dark`,label:`Dark`},{value:`light`,label:`Light`}]});function l(){t.classList.add(`hidden`)}async function u(){await e.onSave({apiKey:Z(a).trim(),theme:Z(o),fontSizeText:Z(s),maxToolStepsText:Z(c)}),l()}return n.addEventListener(`click`,l),r.addEventListener(`click`,()=>{u()}),i.addEventListener(`click`,l),t.addEventListener(`click`,e=>{e.target===t&&l()}),{async open(){let n=await e.loadValues();Q(a,n.apiKey),Q(o,n.theme),Q(s,String(n.fontSize)),Q(c,String(n.maxToolSteps)),t.classList.remove(`hidden`),Ao(a)},close:l}}function Ro(){return`
    <div id="share-modal" class="hidden position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center p-3 app-modal-overlay">
      <div class="bg-body rounded-4 shadow border w-100" style="max-width: 44rem;">
        <div class="d-flex align-items-center justify-content-between gap-3 px-4 py-3 border-bottom">
          <h3 class="h5 mb-0 d-flex align-items-center gap-2"><i class="bi bi-share"></i><span>Share</span></h3>
          <asljs-button id="btn-close-share"></asljs-button>
        </div>
        <div class="d-flex flex-column gap-3 p-4">
          <div class="d-flex gap-2 flex-wrap">
            <asljs-button id="btn-share-link"></asljs-button>
            <asljs-button id="btn-share-download"></asljs-button>
          </div>
          <label class="form-check d-flex align-items-start gap-2 mb-0">
            <input id="share-minified-input" class="form-check-input mt-1 ms-0" type="checkbox" />
            <span class="form-check-label text-body-secondary small">
            Share minified (esbuild JS/CSS + compact HTML/CSS)
            </span>
          </label>
          <label class="form-check d-flex align-items-start gap-2 mb-0">
            <input id="share-exclude-tests-input" class="form-check-input mt-1 ms-0" type="checkbox" />
            <span class="form-check-label text-body-secondary small">
            Only application files
            </span>
          </label>
          <p id="share-link-status" class="small text-body-secondary mb-0"></p>
          <textarea
            id="share-link-output"
            class="form-control"
            style="min-height: 8rem;"
            readonly
            placeholder="Share link will appear here..."
          ></textarea>
          <div class="d-flex gap-2 flex-wrap">
            <asljs-button id="btn-share-copy-text"></asljs-button>
            <asljs-button id="btn-share-copy-html"></asljs-button>
          </div>
        </div>
        <div class="d-flex justify-content-end gap-2 px-4 py-3 border-top bg-body-tertiary rounded-bottom-4">
          <asljs-button id="btn-close-share-2"></asljs-button>
        </div>
      </div>
    </div>
  `}function zo(e){let t=Y(`share-modal`),n=Y(`btn-close-share`),r=Y(`btn-close-share-2`),i=Y(`btn-share-link`),a=Y(`btn-share-download`),o=Y(`btn-share-copy-text`),s=Y(`btn-share-copy-html`),c=Y(`share-minified-input`),l=Y(`share-exclude-tests-input`),u=Y(`share-link-status`),d=Y(`share-link-output`),f=0;X(n,{icon:`<i class="bi bi-x-lg"></i>`,className:`btn btn-outline-secondary btn-sm`}),X(i,{text:`Share with link`,className:`btn btn-primary`}),X(a,{text:`Download export`,className:`btn btn-outline-secondary`}),X(o,{text:`Copy as text link`,className:`btn btn-outline-secondary`}),X(s,{text:`Copy as HTML link`,className:`btn btn-outline-secondary`}),X(r,{text:`Close`,className:`btn btn-outline-secondary`});function p(){return{minified:c.checked,excludeNonApplicationFiles:l.checked}}async function m(){let t=++f;d.value=``,i.disabled=!0,o.disabled=!0,s.disabled=!0,u.textContent=`Preparing share link...`;try{let n=await e.prepareLink(p());if(t!==f)return;d.value=n.url,u.textContent=n.status,i.disabled=!1,o.disabled=!1,s.disabled=!1}catch(e){if(t!==f)return;u.textContent=e instanceof Error?e.message:String(e)}}function h(){f+=1,t.classList.add(`hidden`)}async function g(){if(d.value.trim()!==``)try{await navigator.clipboard.writeText(d.value),u.textContent=`Share link copied to clipboard.`}catch{d.focus(),d.select(),u.textContent=`Could not copy automatically. Link is selected, copy it manually.`}}async function _(){let t=d.value.trim();if(t===``)return;let n=e.readAppName().trim()||`Shared app`,r=`<a href="${v(t)}">${v(n)}</a>`;try{if(typeof ClipboardItem<`u`&&navigator.clipboard.write!==void 0){await navigator.clipboard.write([new ClipboardItem({"text/html":new Blob([r],{type:`text/html`}),"text/plain":new Blob([t],{type:`text/plain`})})]),u.textContent=`HTML link copied to clipboard.`;return}await navigator.clipboard.writeText(t),u.textContent=`HTML clipboard is unavailable here. URL copied as text.`}catch{d.focus(),d.select(),u.textContent=`Could not copy automatically. Link is selected, copy it manually.`}}function v(e){return e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`)}async function y(){await e.downloadExport(p())}return n.addEventListener(`click`,h),r.addEventListener(`click`,h),i.addEventListener(`click`,()=>{g()}),a.addEventListener(`click`,()=>{y()}),o.addEventListener(`click`,()=>{g()}),s.addEventListener(`click`,()=>{_()}),c.addEventListener(`change`,()=>{m()}),l.addEventListener(`change`,()=>{m()}),t.addEventListener(`click`,e=>{e.target===t&&h()}),{open(){e.canOpen()&&(t.classList.remove(`hidden`),m())},close:h}}function Bo(){return`
    <section id="first-app-setup" class="hidden d-flex flex-grow-1 align-items-center justify-content-center p-3 p-lg-5">
      <div class="card shadow-sm border-0 w-100" style="max-width: 42rem;">
        <div class="card-body d-flex flex-column gap-3 p-4 p-lg-5">
          <div class="d-flex align-items-center gap-3">
            <div class="rounded-circle bg-primary-subtle text-primary d-inline-flex align-items-center justify-content-center app-icon-circle">
              <i class="bi bi-stars"></i>
            </div>
            <div>
              <h2 class="h4 mb-1">Create Your First Application</h2>
              <p class="text-body-secondary mb-0">
                Start with a blank project or the built-in TODO sample.
              </p>
            </div>
          </div>
          <p class="text-body-secondary mb-0">
          This is a local-only application builder. App data is stored in your
          browser and is not submitted to any server. If you provide an OpenAI
          key, requests are sent directly to OpenAI only.
          </p>
          <div class="d-flex flex-column gap-2">
            <label class="form-label mb-0">OpenAI API Key</label>
            <asljs-text-input id="first-api-key-input"></asljs-text-input>
          </div>
          <div class="d-flex flex-column gap-2">
            <label class="form-label mb-0">Application Name</label>
            <asljs-text-input id="first-app-name-input"></asljs-text-input>
          </div>
          <p class="small text-body-secondary mb-0">
          Want a quick start? Create a TODO sample app and modify it.
          </p>
          <div class="d-flex flex-wrap gap-2">
          <asljs-button id="btn-create-first-app"></asljs-button>
          <asljs-button id="btn-create-todo-sample"></asljs-button>
        </div>
        </div>
      </div>
    </section>
  `}function Vo(e){let t=Y(`first-app-setup`),n=Y(`first-api-key-input`),r=Y(`first-app-name-input`),i=Y(`btn-create-first-app`),a=Y(`btn-create-todo-sample`);X(i,{text:`Create Application`,className:`btn btn-primary`}),X(a,{text:`Create TODO Sample App`,className:`btn btn-outline-secondary`}),Oo(n,{placeholder:`sk-...`,inputType:`password`}),Oo(r,{placeholder:`My App`});function o(){return{name:Z(r).trim(),apiKey:Z(n).trim()}}async function s(){let t=o();if(t.name===``){Ao(r);return}await e.onCreateApplication(t)}async function c(){await e.onCreateTodoSample(o())}function l(){Q(n,``),Q(r,``)}return i.addEventListener(`click`,()=>{s()}),a.addEventListener(`click`,()=>{c()}),r.addEventListener(`keydown`,e=>{e.key===`Enter`&&(e.preventDefault(),s())}),{show(){l(),t.classList.remove(`hidden`)},hide(){t.classList.add(`hidden`)}}}function Ho(){return`
    <main id="workspace" class="d-flex flex-column min-vh-100 bg-body-tertiary">
      <div id="app-workspace" class="d-flex flex-column flex-grow-1 min-vh-100">
        <div id="top-bar" class="navbar navbar-expand border-bottom bg-body px-3 py-2 gap-3 flex-nowrap shadow-sm">
          <div class="d-flex align-items-center gap-2 flex-grow-1 min-w-0 flex-wrap">
            <a href="../" class="navbar-brand d-inline-flex align-items-center gap-2 fw-semibold text-decoration-none me-1" title="Back to home">
              <i class="bi bi-boxes text-primary"></i>
              <strong>ASLJS</strong>
            </a>
            <asljs-button-settings id="btn-settings" title="Settings"></asljs-button-settings>
            <span class="vr d-none d-md-inline-flex"></span>
            <asljs-button id="btn-new-app" title="New application"></asljs-button>
            <asljs-button id="btn-import" title="Import application"></asljs-button>
            <asljs-select id="app-select" title="Select application"></asljs-select>
            <asljs-button-settings id="btn-project-settings" title="Project settings"></asljs-button-settings>
            <span class="vr d-none d-lg-inline-flex"></span>
            <asljs-button id="btn-toggle-chat" title="Show or hide chat"></asljs-button>
            <asljs-button id="btn-toggle-files" title="Show or hide files editor"></asljs-button>
          </div>
          <div class="d-flex align-items-center gap-2 flex-shrink-0 flex-wrap justify-content-end">
            <asljs-button id="btn-run"></asljs-button>
            <asljs-button id="btn-share" title="Share app"></asljs-button>
            <a
              href="https://github.com/AlexandriteSoftware/asljs"
              class="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1"
              target="_blank"
              rel="noopener noreferrer"
              title="GitHub repository"
            ><i class="bi bi-github"></i><span>GitHub</span></a>
            <a
              href="https://github.com/AlexandriteSoftware/asljs/issues"
              class="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1"
              target="_blank"
              rel="noopener noreferrer"
              title="Issues and questions"
            ><i class="bi bi-question-circle"></i><span>Issues</span></a>
            <iframe
              src="https://ghbtns.com/github-btn.html?user=AlexandriteSoftware&repo=asljs&type=star&size=small"
              frameborder="0"
              scrolling="0"
              width="100"
              height="20"
              title="GitHub"
            ></iframe>
          </div>
        </div>

        ${Bo()}

        <div id="panels" class="d-flex flex-grow-1 overflow-hidden app-panels">
          <section id="panel-chat" class="panel d-flex flex-column flex-fill min-w-0 border-end bg-body">
            <div class="panel-header d-flex align-items-center justify-content-between gap-2 px-3 py-2 border-bottom bg-body-tertiary text-secondary text-uppercase fw-semibold small">
              <div class="d-flex align-items-center gap-2 min-w-0">
                <i class="bi bi-chat-dots"></i>
                <span>Chat</span>
              </div>
              <asljs-select id="chat-model-select" title="Chat model"></asljs-select>
            </div>
            <div id="chat-root" class="chat-root d-flex flex-column flex-grow-1 min-h-0 p-3 gap-3"></div>
            <div class="d-flex flex-column gap-2 px-3 pb-3">
              <div class="d-flex align-items-center gap-2 flex-wrap">
                <asljs-select id="generation-model-select" title="Generation model"></asljs-select>
                <asljs-button id="btn-start-generation"></asljs-button>
                <asljs-button id="btn-stop-generation"></asljs-button>
              </div>
              <div id="generation-status" class="small text-body-secondary">Idle.</div>
            </div>
          </section>

          <section id="panel-editor" class="panel d-flex flex-column flex-fill min-w-0 border-end bg-body">
            <div class="panel-header d-flex align-items-center justify-content-between gap-2 px-3 py-2 border-bottom bg-body-tertiary text-secondary text-uppercase fw-semibold small">
              <div class="d-flex align-items-center gap-2 min-w-0">
                <i class="bi bi-folder2-open"></i>
                <span>Files</span>
              </div>
              <asljs-select id="file-select" title="Select file"></asljs-select>
            </div>
            <div id="editor-layout" class="d-flex flex-column flex-grow-1 min-h-0 p-3">
              <asljs-file
                id="file-view"
                class="file-preview-panel flex-grow-1"
              ></asljs-file>
            </div>
          </section>

          <section id="panel-preview" class="panel d-flex flex-column flex-fill min-w-0 bg-body">
            <div class="panel-header d-flex align-items-center justify-content-between gap-2 px-3 py-2 border-bottom bg-body-tertiary text-secondary text-uppercase fw-semibold small">
              <div class="d-flex align-items-center gap-2 min-w-0">
                <i class="bi bi-window"></i>
                <span id="panel-preview-title">Preview</span>
              </div>
            </div>
            <iframe
              id="preview-frame"
              class="preview-frame flex-grow-1 border-0 bg-body"
              sandbox="allow-scripts allow-same-origin allow-forms"
              title="App preview"
            ></iframe>
          </section>
        </div>
        <nav id="mobile-tab-bar" class="mobile-tab-bar border-top bg-body p-2 gap-2" aria-label="Workspace tabs">
          <asljs-button id="mobile-tab-chat" title="Chat tab" aria-label="Chat"></asljs-button>
          <asljs-button id="mobile-tab-files" title="Files tab" aria-label="Files"></asljs-button>
          <asljs-button id="mobile-tab-run" title="Run tab" aria-label="Run"></asljs-button>
        </nav>
      </div>
    </main>
  `}function Uo(){let e=document.getElementById(`app-builder-root`);if(e===null)throw Error(`Missing #app-builder-root.`);let t=document.createElement(`template`);t.innerHTML=`
    ${Ho()}
    ${Io()}
    ${Mo()}
    ${Po()}
    ${Ro()}
    <input id="import-file" class="d-none" type="file" accept=".json" />
  `,e.replaceChildren(t.content.cloneNode(!0))}function Wo(e){let t=e.selectElement,n=e.files;if(n.length===0){t.items=[{value:``,label:`No files`,disabled:!0}],t.value=``,t.disabled=!0;return}t.items=n.map(e=>({value:e.name,label:e.name})),t.value=e.activeFileName!==null&&n.some(t=>t.name===e.activeFileName)?e.activeFileName:n[0].name,t.disabled=!1}function Go(e){let t={loadFile:async t=>{let n=e.files.find(e=>e.name===t);if(n===void 0)return null;let r=di(n.content);return r===null?{name:n.name,text:n.content}:{name:n.name,mimeType:r.mimeType,dataUrl:r.dataUrl}}};e.onSaveText!==void 0&&(t.saveText=e.onSaveText),e.fileElement.provider=t,e.fileElement.handlers=[pr(),mr(),hr()],e.fileElement.fileName=e.activeFileName}function Ko(e){let t=!e.panelElement.classList.contains(`collapsed`),n=t?e.collapsedText:e.expandedText;return Do(e.toggleButtonElement,{text:n,icon:t?e.collapsedIcon:e.expandedIcon}),e.toggleButtonElement.setAttribute(`aria-expanded`,t?`false`:`true`),e.panelElement.classList.toggle(`collapsed`,t),e.panelsElement.classList.toggle(e.collapsedPanelsClass,t),t}Uo();function qo(){return crypto.randomUUID()}function Jo(){return new Date().toISOString()}var Yo=Y(`app-workspace`),Xo=Y(`panels`),Zo=Y(`panel-chat`),Qo=Y(`panel-editor`),$o=Y(`app-select`),es=Y(`file-select`),ts=Y(`file-view`),ns=Y(`chat-root`),rs=Y(`chat-model-select`),is=Y(`btn-run`),as=Y(`preview-frame`),os=Y(`panel-preview-title`),ss=Y(`generation-model-select`),cs=Y(`btn-start-generation`),ls=Y(`btn-stop-generation`),us=Y(`generation-status`),ds=Y(`btn-new-app`),fs=Y(`btn-import`),ps=Y(`btn-project-settings`),ms=Y(`btn-share`),hs=Y(`btn-settings`),gs=Y(`btn-toggle-chat`),_s=Y(`btn-toggle-files`),vs=Y(`mobile-tab-bar`),ys=Y(`mobile-tab-chat`),bs=Y(`mobile-tab-files`),xs=Y(`mobile-tab-run`),Ss=Y(`import-file`),Cs=`asljs-app-builder-settings`,ws=`light`,Ts=14,Es=`__new__`,Ds=`__import__`,Os=`#I!`,ks=5e3,As=4e3,js=1e4,Ms=`https://alexandritesoftware.github.io/asljs/app-builder`,Ns=null,Ps=!1,Fs=0,Is=null,Ls=[{id:ya},{id:ba},{id:Ki}],Rs=!1,zs=``,Bs=null;Ks(),Js(`chat`);var Vs=Vo({onCreateApplication:hc,onCreateTodoSample:gc}),Hs=No(),Us=Fo({onSave:Mc,onDelete:Nc}),Ws=Lo({loadValues:async()=>({apiKey:await $s(),theme:ic(),fontSize:ac(),maxToolSteps:rc()}),onSave:tl}),Gs=zo({canOpen:()=>uc()!==void 0,readAppName:()=>uc()?.name??`Shared app`,prepareLink:$c,downloadExport:el});function Ks(){X(hs,{className:`btn btn-outline-secondary btn-sm`}),X(ds,{text:`New`,icon:`<i class="bi bi-plus-lg"></i>`,className:`btn btn-outline-secondary btn-sm`}),X(fs,{text:`Import`,className:`btn btn-outline-secondary btn-sm`}),X(ps,{className:`btn btn-outline-secondary btn-sm`}),X(gs,{text:`Chat`,icon:`<i class="bi bi-chevron-down"></i>`,className:`btn btn-outline-secondary btn-sm`}),X(_s,{text:`Files`,icon:`<i class="bi bi-chevron-down"></i>`,className:`btn btn-outline-secondary btn-sm`}),X(is,{text:`Run`,icon:`<i class="bi bi-play-fill"></i>`,className:`btn btn-success btn-sm`}),X(ys,{text:`Chat`,icon:`<i class="bi bi-chat-dots"></i>`,className:`btn btn-outline-secondary flex-fill`}),X(bs,{text:`Files`,icon:`<i class="bi bi-folder2-open"></i>`,className:`btn btn-outline-secondary flex-fill`}),X(xs,{text:`Run`,icon:`<i class="bi bi-play-fill"></i>`,className:`btn btn-outline-secondary flex-fill`}),X(ms,{text:`Share`,className:`btn btn-outline-secondary btn-sm`}),X(cs,{text:`Generate`,className:`btn btn-primary btn-sm`}),X(ls,{text:`Stop`,className:`btn btn-outline-secondary btn-sm`}),ko($o,{className:`form-select form-select-sm bootstrap-select app-select`}),ko(es,{className:`form-select form-select-sm bootstrap-select file-select`}),ko(rs,{className:`form-select form-select-sm bootstrap-select lane-model-select`}),ko(ss,{className:`form-select form-select-sm bootstrap-select lane-model-select`})}function qs(){return window.getComputedStyle(vs).display!==`none`}function Js(e){Xo.classList.remove(`mobile-tab-chat`,`mobile-tab-files`,`mobile-tab-run`),Xo.classList.add(`mobile-tab-${e}`);let t=[{tab:`chat`,button:ys},{tab:`files`,button:bs},{tab:`run`,button:xs}];for(let n of t){let t=n.tab===e;n.button.buttonClassName=t?`btn btn-primary flex-fill`:`btn btn-outline-secondary flex-fill`,n.button.setAttribute(`aria-selected`,String(t))}}function Ys(){os.textContent=uc()?.name??`Preview`}function Xs(){return Ns??=so({codec:co(),baseUrl:Ms,hashPrefix:Os,maxUrlLength:ks}),Ns}function Zs(){try{let e=localStorage.getItem(Cs)??`{}`;return JSON.parse(e)}catch{return{}}}function Qs(e){localStorage.setItem(Cs,JSON.stringify(e))}async function $s(){return J.currentAppId===null?(zs=``,zs):(zs=await ei(J.currentAppId),zs)}function ec(){return zs}function tc(){return il(Zs().chatModel,ya)}function nc(){return il(Zs().generationModel,ba)}function rc(){let e=Zs().maxToolSteps;if(!Number.isFinite(e))return 20;let t=Math.floor(e);return t<1?20:t}function ic(){return Zs().theme===`light`?`light`:ws}function ac(){let e=Zs().fontSize;if(!Number.isFinite(e))return Ts;let t=Math.floor(e);return t<12||t>20?Ts:t}function oc(){document.documentElement.setAttribute(`data-bs-theme`,ic()),document.documentElement.style.fontSize=`${ac()}px`}function sc(e){if(typeof e!=`string`)return null;let t=e.trim();return t===``?null:t}function cc(){return crypto.randomUUID()}async function lc(e){let t=new Set,n=[];for(let r of e){let e=sc(r.uuid);if((e===null||t.has(e))&&(e=cc()),t.add(e),r.uuid===e){n.push(r);continue}let i={...r,uuid:e,updatedAt:r.updatedAt??Jo()};await Jr(i),n.push(i)}return n}function uc(){return J.apps.find(e=>e.id===J.currentAppId)}async function dc(e){await Jr(e),J.apps=J.apps.map(t=>t.id===e.id?e:t)}async function fc(){let e=uc();e!==void 0&&await dc({...e,uuid:cc(),updatedAt:Jo()})}var $=vi({getCurrentAppId:()=>J.currentAppId,getFiles:()=>J.files,setFiles:e=>{J.files=e},getActiveFileName:()=>J.activeFileName,setActiveFileName:e=>{J.activeFileName=e},createFileId:qo,saveFile:async e=>{await Zr(e),await fc()},deleteFileById:async e=>{await Qr(e),await fc()},runApp:Ic,evaluateInApp:e=>Ua(as,e),getAppDiagnostics:()=>Wa(as),showChoicePrompt:Sc,wait:e=>new Promise(t=>{window.setTimeout(t,e)})});function pc(){Eo({selectElement:$o,apps:J.apps,currentAppId:J.currentAppId,newActionValue:Es,importActionValue:Ds})}function mc(){Yo.classList.remove(`hidden`);let e=J.currentAppId!==null&&J.apps.some(e=>e.id===J.currentAppId);if(Xo.classList.toggle(`hidden`,!e),!e){Vs.show();return}Vs.hide(),_c(),vc(),Ys()}async function hc(e){let t={id:qo(),uuid:cc(),name:e.name,createdAt:Jo(),updatedAt:Jo()};await Jr(t),e.apiKey!==``&&await ti(t.id,e.apiKey),await $r(t.id,da(t.id,t.name,qo)),J.apps=[...J.apps,t],await Oc(t.id)}async function gc(e){let t=Aa(`TODO Sample`);if(t===null){alert(`TODO sample is not available.`);return}let n=e.name===``?t.name:e.name,r={id:qo(),uuid:cc(),name:n,author:t.author,createdAt:Jo(),updatedAt:Jo()},i=Ma(t,r.id,qo);await Jr(r),e.apiKey!==``&&await ti(r.id,e.apiKey),await $r(r.id,i),J.apps=[...J.apps,r],await Oc(r.id)}function _c(){Wo({selectElement:es,files:J.files,activeFileName:J.activeFileName})}function vc(){Go({fileElement:ts,files:J.files,activeFileName:J.activeFileName,onSaveText:async(e,t)=>{let n=J.files.find(t=>t.name===e);n===void 0||n.content===t||(n.content=t,await Zr(n),await fc())}})}function yc(e){J.generationBusy=e,cs.disabled=e||J.generating,ls.disabled=!e}function bc(e){J.generationStatus=e,us.textContent=e}function xc(e,t){Bs?.appendMessage(e,t),wc()}function Sc(e,t){Bs!==null&&Bs.presentChoices(e,t,`send`)}function Cc(){Bs?.clearMessages(),Bs?.dismissChoices(),Bs?.clearProgress(),wc()}function wc(){J.chatMessages=Bs===null?[]:Bs.messages.read().filter(Tc).map(e=>({role:e.role,text:e.content}))}function Tc(e){return e.role===`user`||e.role===`assistant`}async function Ec(){if(J.currentAppId===null){Bs=null,ns.replaceChildren(),J.chatMessages=[];return}let e=J.currentAppId;Bs=Mn();let t=t=>({provider:ri({appId:e,readChatModel:tc,readInitialToolStepLimit:rc}),...t===null?{}:{transport:t},stateStore:ii(e),getRequestContext:()=>({currentAppId:J.currentAppId}),buildRequestInput:({model:e})=>{let t=_a(e.messages.read().filter(Tc).map(e=>({role:e.role,text:e.content})));return[{role:`system`,content:oa},{role:`user`,content:t}]},getTools:()=>gi,executeTool:async(e,t)=>Li({type:`function_call`,name:e,arguments:t,call_id:`app-chat:${e}`},$)}),n=(await ei(e)).trim(),r=document.createElement(`asljs-ai-chat`);if(n!==``)r.options=t(new jn(n)),ns.replaceChildren(r);else{r.options=t(null);let n=document.createElement(`asljs-ai-chat-key`);n.label=`Enter your OpenAI API key to start chatting`,n.submitLabel=`Start chatting`,n.addEventListener(`key-submit`,i=>{let a=i.detail.key.trim();a!==``&&ti(e,a).then(()=>{zs=a,r.options=t(new jn(a)),n.remove()})});let i=document.createElement(`div`);i.className=`chat-key-container`,i.appendChild(n),i.appendChild(r),ns.replaceChildren(i)}wc()}async function Dc(){if(J.activeFileName===null||J.currentAppId===null)return;let e=J.files.find(e=>e.name===J.activeFileName);if(e===void 0)return;let t=ts.querySelector(`textarea`);if(!(t instanceof HTMLTextAreaElement))return;let n=t.value;e.content!==n&&(e.content=n,await Zr(e),await fc())}async function Oc(e){J.currentAppId=e;let t=fa({files:await Xr(e),appId:e,appName:J.apps.find(t=>t.id===e)?.name??`Untitled App`,createId:qo});t.changed&&await $r(e,t.files),J.files=t.files,J.activeFileName=kc(t.files),await $s(),await ll(),await Ec()}function kc(e){return e[0]?.name??null}function Ac(){Hs.open({title:`New App`,initialValue:``,selectText:!1,onConfirm:async e=>{let t={id:qo(),uuid:cc(),name:e,createdAt:Jo(),updatedAt:Jo()};await Jr(t),await $r(t.id,da(t.id,t.name,qo)),J.apps=[...J.apps,t],await Oc(t.id)}})}function jc(){let e=J.apps.find(e=>e.id===J.currentAppId);e!==void 0&&Us.open({name:e.name,authorName:e.author?.name??``,authorEmail:e.author?.email??``})}async function Mc(e){let t=J.apps.find(e=>e.id===J.currentAppId);if(t===void 0)return;let n=e.authorName!==``||e.authorEmail!==``?{...e.authorName===``?{}:{name:e.authorName},...e.authorEmail===``?{}:{email:e.authorEmail}}:void 0,r={...t,name:e.name,author:n,updatedAt:Jo()};await Jr(r),J.apps=J.apps.map(e=>e.id===t.id?r:e)}async function Nc(){let e=J.apps.find(e=>e.id===J.currentAppId);e!==void 0&&confirm(`Delete "${e.name}"? This cannot be undone.`)&&(await Yr(e.id),J.apps=J.apps.filter(t=>t.id!==e.id),J.currentAppId=null,J.files=[],J.activeFileName=null,Cc(),as.src=`about:blank`)}async function Pc(){if(J.generating){bc(`Wait for the chat response before starting generation.`);return}if(J.generationBusy)return;if(J.currentAppId===null){bc(`Open or create an app first.`);return}let e=ec();if(e===``){bc(`Add an OpenAI API key in Settings first.`);return}await Dc();let t=sl(ca);if(!Pa(t)){bc(`No pending changes in PLAN.md.`);return}await cl(la,Fa(t)),Rs=!1,yc(!0),bc(`Starting generation cycle...`);try{let t=await ta([`Implement the pending changes listed in CHANGE.md.`,`Use README.md as the current implemented app state.`,`Work through CHANGE.md, update app files, update README.md, and clear CHANGE.md when the cycle is complete.`,`Do not consume new changes that may later appear in PLAN.md during this cycle.`].join(`
`),e,nc(),$,{initialToolStepLimit:rc(),systemPrompt:ui,shouldStop:()=>Rs,onToolStepLimit:async({stepsCompleted:e})=>confirm(`Generation reached ${e} tool steps without finishing. Continue for 12 more steps?`),onProgress:e=>{bc(e)}});await cl(la,`# CHANGE
`),bc(t.summary),xc(`assistant`,t.summary),Ic()}catch(e){if(e instanceof Zi){bc(`Generation stopped.`);return}let t=e instanceof Error?e.message:String(e);bc(`Generation error: ${t}`),xc(`assistant`,`Generation error: ${t}`)}finally{Rs=!1,yc(!1)}}function Fc(){J.generationBusy&&(Rs=!0,bc(`Stopping generation after the current step...`))}function Ic(){qs()&&Js(`run`),Dc().then(()=>{Ha(as,J.files,{hostOpenAiApiKey:ec()})})}async function Lc(){await Dc();let e=uc();if(e===void 0)throw Error(`No app selected.`);return Sa({app:e,files:J.files})}function Rc(e){let t=new Blob([JSON.stringify(e)],{type:`application/json`}),n=URL.createObjectURL(t),r=document.createElement(`a`);r.href=n,r.download=`${e.name.replace(/\s+/g,`-`)}.json`,r.click(),URL.revokeObjectURL(n)}async function zc(e){let t=await Lc();return e.excludeNonApplicationFiles&&(t={...t,files:Object.fromEntries(Object.entries(t.files).filter(([e])=>!wo(e)))}),e.minified?yo(t,Bc):t}async function Bc(e,t){return(await(await Vc()).transform(e,{loader:t,minify:!0,target:`es2020`})).code.trim()}async function Vc(){return Is===null&&(Is=(async()=>(await Br.initialize({wasmURL:Vr,worker:!0}),{transform:Br.transform}))()),Is}function Hc(e){let t=e?.name?.trim()??``,n=e?.email?.trim()??``;return`Author: ${t===``?`Not provided`:t}\nEmail: ${n===``?`Not provided`:n}`}function Uc(e){return confirm(`Security warning: You are about to import an application.

${Hc(e.author)}\n\nAlthough apps run in an isolated browser context, imported code can still be harmful. Be vigilant and only open apps from sources you trust.

Do you want to continue?`)}function Wc(e){let t=e===`run`;Xo.classList.toggle(`chat-collapsed`,t),Xo.classList.toggle(`files-collapsed`,t),Do(gs,{text:`Chat`,icon:t?`<i class="bi bi-chevron-right"></i>`:`<i class="bi bi-chevron-down"></i>`}),Do(_s,{text:`Files`,icon:t?`<i class="bi bi-chevron-right"></i>`:`<i class="bi bi-chevron-down"></i>`}),gs.setAttribute(`aria-expanded`,String(!t)),_s.setAttribute(`aria-expanded`,String(!t)),qs()&&Js(e===`run`?`run`:`chat`)}function Gc(){return confirm(`You followed the application link.

Click OK to start the application.
Click Cancel to edit it.`)?`run`:`edit`}function Kc(){Ss.value=``,Ss.click()}async function qc(e,t){let n=wa({payload:e,existingApps:J.apps,navigateToExistingById:t.navigateToExistingById,now:Jo(),createId:qo,createUuid:cc});return n.kind===`duplicate`?(t.showDuplicateAlert&&alert(`Import stopped: an app with the same ID already exists.`),null):n.kind===`existing`?(await Oc(n.appId),n.appId):(await Jr(n.app),await $r(n.app.id,n.files),J.apps=[...J.apps,n.app],await Oc(n.app.id),n.app.id)}async function Jc(){let e=Ss.files?.[0];if(e!==void 0)try{let t=Ca(await e.text());if(!Uc(t))return;await qc(t,{navigateToExistingById:!1,showDuplicateAlert:!0})}catch(e){let t=e instanceof Error?e.message:String(e);alert(`Import failed: ${t}`)}}function Yc(){return Xs().readTokenFromHash(window.location.hash)}function Xc(){window.history.pushState(null,``,`${window.location.pathname}${window.location.search}`)}async function Zc(){let e=Yc();if(e===null||e.trim()===``)return!1;if(Ps)return!0;Ps=!0;try{let t=(()=>{try{return decodeURIComponent(e)}catch{return e}})(),n=ja(e)??ja(t);if(n!==null)return await qc(n,{navigateToExistingById:!0,showDuplicateAlert:!1})!==null&&(Gc()===`run`?(Wc(`run`),Ic()):Wc(`edit`)),Xc(),!0;try{let t=await Xs().parsePayloadFromToken(e);if(!Uc(t))return Xc(),!0;await qc(t,{navigateToExistingById:!0,showDuplicateAlert:!1})!==null&&(Gc()===`run`?(Wc(`run`),Ic()):Wc(`edit`))}catch(e){let t=e instanceof Error?e.message:String(e);alert(`Could not import from share link: ${t}`)}return Xc(),!0}finally{Ps=!1}}async function Qc(e,t,n){let r,i=new Promise((e,i)=>{r=globalThis.setTimeout(()=>{i(Error(n))},t)});try{return await Promise.race([e,i])}finally{r!==void 0&&globalThis.clearTimeout(r)}}async function $c(e){Fs+=1;let t=Fs,n=await Qc((async()=>{let t=await zc(e);return Xs().createShareUrl(t)})(),js,`Preparing share link timed out. Use Download export instead.`);if(t!==Fs)throw Error(`Share link preparation was superseded by a newer request.`);return{url:n.url,status:To(n.url.length,As,ks)}}async function el(e){Rc(await zc(e))}async function tl(e){let t=Zs();delete t.apiKey,t.theme=e.theme===`light`?`light`:ws;let n=Number.parseInt(e.fontSizeText,10);t.fontSize=Number.isFinite(n)&&n>=12&&n<=20?n:Ts;let r=Number.parseInt(e.maxToolStepsText,10);if(t.maxToolSteps=Number.isFinite(r)&&r>=1?r:20,Qs(t),J.currentAppId!==null){let t=zs;zs=e.apiKey,await ti(J.currentAppId,zs),t!==zs&&await Ec()}await ll(),oc()}function nl(e,t,n){let r=Z(e);if(e.items=t.map(e=>({value:e,label:e})),t.includes(r)){Q(e,r);return}Q(e,t.includes(n)?n:t[0]??n)}function rl(){let e=xa([...Ls,{id:tc()},{id:nc()}]).map(e=>e.id);nl(rs,e,tc()),nl(ss,e,nc())}function il(e,t){let n=xa(Ls).map(e=>e.id);return typeof e==`string`&&n.includes(e)?e:n.includes(t)?t:n[0]??t}function al(){let e=Zs();e.chatModel=Z(rs),Qs(e)}function ol(){let e=Zs();e.generationModel=Z(ss),Qs(e)}function sl(e){return J.files.find(t=>t.name===e)?.content??``}async function cl(e,t){if(J.currentAppId===null)return;let n=J.files.find(t=>t.name===e);if(n!==void 0){if(n.content===t)return;n.content=t,await Zr(n),await fc(),J.files=[...J.files];return}let r={id:qo(),appId:J.currentAppId,name:e,content:t};await Zr(r),await fc(),J.files=[...J.files,r]}async function ll(e=ec()){let t=e.trim();if(t===``){Ls=xa([{id:ya},{id:ba},{id:Ki}]),rl();return}try{Ls=xa([...await ea(t),{id:ya},{id:ba},{id:Ki}])}catch(e){console.warn(`Could not load OpenAI models:`,e),Ls=xa([...Ls,{id:ya},{id:ba},{id:Ki}])}rl()}function ul(){if(qs()){Js(`chat`);return}Ko({panelElement:Zo,toggleButtonElement:gs,panelsElement:Xo,collapsedPanelsClass:`chat-collapsed`,expandedText:`Chat`,collapsedText:`Chat`,expandedIcon:`<i class="bi bi-chevron-down"></i>`,collapsedIcon:`<i class="bi bi-chevron-right"></i>`})}function dl(){if(qs()){Js(`files`);return}Ko({panelElement:Qo,toggleButtonElement:_s,panelsElement:Xo,collapsedPanelsClass:`files-collapsed`,expandedText:`Files`,collapsedText:`Files`,expandedIcon:`<i class="bi bi-chevron-down"></i>`,collapsedIcon:`<i class="bi bi-chevron-right"></i>`})}J.on(`set:apps`,()=>{pc(),Ys()}),J.on(`set:currentAppId`,()=>{pc(),mc(),Ys()}),J.on(`set:files`,()=>{_c(),vc()}),J.on(`set:activeFileName`,()=>{_c(),vc()}),ds.addEventListener(`click`,Ac),fs.addEventListener(`click`,Kc),ps.addEventListener(`click`,jc),ms.addEventListener(`click`,()=>{Gs.open()}),cs.addEventListener(`click`,()=>{Pc()}),ls.addEventListener(`click`,Fc),is.addEventListener(`click`,Ic),hs.addEventListener(`click`,()=>{Ws.open()}),gs.addEventListener(`click`,ul),_s.addEventListener(`click`,dl),ys.addEventListener(`click`,()=>{Js(`chat`)}),bs.addEventListener(`click`,()=>{Js(`files`)}),xs.addEventListener(`click`,()=>{let e=Xo.classList.contains(`mobile-tab-run`);Js(`run`),e||Ic()}),rs.addEventListener(`change`,al),ss.addEventListener(`change`,ol),$o.addEventListener(`change`,()=>{let e=Z($o);if(e===Es){Ac(),pc();return}if(e===Ds){Kc(),pc();return}e!==``&&e!==J.currentAppId&&Oc(e)}),es.addEventListener(`change`,()=>{let e=Z(es);e===``||e===J.activeFileName||(Dc(),J.activeFileName=e)}),Ss.addEventListener(`change`,()=>{Jc()}),window.listFileset=$.listFileset,window.listFilesByMask=$.listFilesByMask,window.readFile=$.readFile,window.readFiles=$.readFiles,window.readFilesByMask=$.readFilesByMask,window.readFileData=$.readFileData,window.setFilesContent=$.setFilesContent,window.setFileData=$.setFileData,window.setFileContent=$.setFileContent,window.replaceFilePart=$.replaceFilePart,window.deleteFile=$.deleteFile,window.grep=$.grep,window.choose=$.choose,window.evalInApp=$.evalInApp,window.assertInApp=$.assertInApp,window.runAppTests=$.runAppTests,window.getAppDiagnostics=$.getAppDiagnostics,window.runAppAndCollectDiagnostics=$.runAppAndCollectDiagnostics,window.addEventListener(`hashchange`,()=>{Zc()});async function fl(){oc(),await ll(),yc(!1),bc(`Idle.`);let e=await lc(await qr());J.apps=e,!await Zc()&&(e.length>0?await Oc([...e].sort((e,t)=>t.updatedAt.localeCompare(e.updatedAt))[0].id):(J.currentAppId=null,J.files=[],J.activeFileName=null,J.chatMessages=[],mc()))}fl().catch(e=>{console.error(`App Builder init failed:`,e)});
//# sourceMappingURL=app-BHt3t5B2.js.map