var dc=e=>{throw TypeError(e)};var Ua=(e,t,n)=>t.has(e)||dc("Cannot "+n);var Li=(e,t,n)=>(Ua(e,t,"read from private field"),n?n.call(e):t.get(e)),hs=(e,t,n)=>t.has(e)?dc("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(e):t.set(e,n),Ba=(e,t,n,s)=>(Ua(e,t,"write to private field"),s?s.call(e,n):t.set(e,n),n),Wa=(e,t,n)=>(Ua(e,t,"access private method"),n);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))s(i);new MutationObserver(i=>{for(const a of i)if(a.type==="childList")for(const r of a.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&s(r)}).observe(document,{childList:!0,subtree:!0});function n(i){const a={};return i.integrity&&(a.integrity=i.integrity),i.referrerPolicy&&(a.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?a.credentials="include":i.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function s(i){if(i.ep)return;i.ep=!0;const a=n(i);fetch(i.href,a)}})();class Af extends Error{constructor(t,n,s,i,a){super(t),this.name="ListenerError",this.error=n,this.object=s,this.event=i,this.listener=a}}function Mn(e){if(typeof e!="string"&&typeof e!="symbol")throw new TypeError("Expect event to be a string or symbol.")}function va(e){return typeof e=="function"}function uc(e){if(va(e))return e}function dd(e){return typeof e=="object"&&e!==null}function za(e){if(!va(e))throw new TypeError("Expect a function.")}const Sf=(e=Object.create(null),t={})=>{if(!dd(e)&&!va(e))throw new TypeError("Expect an object or a function.");for(const x of["on","once","off","emit","emitAsync","has"])if(x in e)throw new Error(`Method "${x}" already exists.`);const{strict:n=!1,trace:s=null,error:i=null}=t,a=uc(s)??null,r=uc(i)??null,l=e!==mn,m=(x,O)=>{a==null||a(x,O),l&&mn.emit(x,O)};m("new",{object:e});const h=new Set,y=new Map,o={enumerable:!1,configurable:!0,writable:!0};return Object.defineProperties(e,{on:Object.assign({value:te},o),once:Object.assign({value:ne},o),off:Object.assign({value:X},o),emit:Object.assign({value:H},o),emitAsync:Object.assign({value:u},o),has:Object.assign({value:_},o)}),e;function k(x,O){let Q=y.get(x);Q||y.set(x,Q=new Set),Q.add(O)}function g(x,O){const Q=y.get(x);if(!Q)return!1;const re=Q.delete(O);return Q.size===0&&y.delete(x),re}function $(x,O,Q){const re={error:Q,object:e,event:x,listener:O};if(r==null||r(re),e===mn&&x==="error")throw new Af("Error in a global error listener.",Q,e,x,O);mn.emit("error",re)}function te(x,O){Mn(x),za(O),m("on",{object:e,event:x,listener:O}),k(x,O);let Q=!0;return()=>Q?(Q=!1,g(x,O)):!1}function ne(x,O){Mn(x),za(O);const Q=te(x,(...re)=>{Q(),O(...re)});return Q}function X(x,O){return Mn(x),za(O),m("off",{object:e,event:x,listener:O}),g(x,O)}function _(x){var O;return Mn(x),(((O=y.get(x))==null?void 0:O.size)??0)>0}function H(x,...O){Mn(x);const Q=y.get(x)||h;if(m("emit",{object:e,listeners:[...Q],event:x,args:O}),Q.size!==0)for(const re of Q)try{re(...O)}catch(be){if($(x,re,be),n)throw be}}async function u(x,...O){Mn(x);const Q=y.get(x)||h;if(m("emitAsync",{object:e,listeners:[...Q],event:x,args:O}),Q.size===0)return;const re=[...Q].map(async be=>{try{await be(...O)}catch(Fe){if($(x,be,Fe),n)throw Fe}});await(n?Promise.all(re):Promise.allSettled(re))}},mn=Sf;mn(mn);function $f(e){return!dd(e)&&!va(e)?!1:typeof e.on=="function"}function Gr(e){if($f(e))return e}function Mt(e){return typeof e=="function"}function Jr(e){return typeof e=="object"&&e!==null}function ud(e){if(!Mt(e))throw new TypeError("Expect a function.")}function nr(e){if(e.trim()==="")throw new TypeError("Expect watch path to be a non-empty string.");const t=e.split(".");for(const n of t)if(n.trim()==="")throw new TypeError("Expect watch path segments to be non-empty.");return e.split(".").map(n=>n.trim()).filter(n=>n!=="")}function Cf(e,t){const n=nr(t);if(n.length===0)return;let s=e;for(const i of n){if(!Jr(s)||!(i in s))return;s=s[i]}return s}const pd=(e,t,n)=>{if(Array.isArray(e))throw new TypeError("Watching arrays is not supported.");ud(n);const s=typeof t=="string"?[t]:t;if(!Array.isArray(s))throw new TypeError("Expect properties to be a string or an array of strings.");for(const r of s){if(typeof r!="string")throw new TypeError("Expect properties to be a string or an array of strings.");nr(r)}const i=()=>s.map(r=>Cf(e,r)),a=[];for(const r of s){const l=nr(r);let m=null;const h=()=>{const y=[],o=(k,g)=>{if(!Jr(k)||g>=l.length)return;const $=l[g],te=Gr(k);if(te){const ne=te.on(`set:${$}`,()=>{n(...i()),g<l.length-1&&m&&(m(),m=h())});y.push(ne)}g<l.length-1&&o(k[$],g+1)};return o(e,0),()=>y.reduce((k,g)=>g()||k,!1)};m=h(),a.push(()=>m?m():!1)}return n(...i()),()=>a.reduce((r,l)=>l()||r,!1)};function Tf(e,t){"watch"in e||Object.defineProperty(e,"watch",{configurable:!0,writable:!0,enumerable:!1,value(n,s){return t(typeof n=="string"?this:this,n,s)}})}function pc(e,t){return Object.prototype.hasOwnProperty.call(e,t)}function Va(e){if(typeof e=="symbol")return!1;const t=typeof e=="number"?e:Number(e);return!Number.isInteger(t)||t<0||t>=4294967295?!1:typeof e=="number"||e===String(t)}function If(e){return Gr(e)?Mt(e.emit):!1}const hd=(e,t={})=>{const{eventful:n=mn,trace:s=null,shallow:i=!1}=t;ud(n);const a=ft.options,r=new WeakMap,l=k=>{if(i||!Jr(k)||If(k))return k;if(r.has(k))return r.get(k);const g=hd(k,{eventful:n,trace:s,shallow:i});return r.set(k,g),g},m=k=>{if(!i){if(Array.isArray(k)){for(let g=0;g<k.length;g++)k[g]=l(k[g]);return}for(const g of Reflect.ownKeys(k))pc(k,g)&&(k[g]=l(k[g]))}},h=k=>{const g=Array.isArray(k);m(k),Tf(k,pd);let $=null;const te=new Proxy(k,{set(ne,X,_,H){const u=g&&Va(X),x=Reflect.get(ne,X,H),O=Reflect.set(ne,X,l(_),H);if($&&O){const Q=Reflect.get(ne,X,H);if(!Object.is(x,Q)){const re=u?{index:Number(X),value:Q,previous:x}:{property:X,value:Q,previous:x},be=s||a.trace;$.emit(`set:${String(X)}`,re),Mt(be)&&be($,"set",re),$.emit("set",re)}}return O},deleteProperty(ne,X){const _=g&&Va(X),H=pc(ne,X),u=H?ne[X]:void 0,x=Reflect.deleteProperty(ne,X);if($&&x&&H){const O=_?{index:Number(X),previous:u}:{property:X,previous:u},Q=s||a.trace;$.emit(`delete:${String(X)}`,O),Mt(Q)&&Q($,"delete",O),$.emit("delete",O)}return x},defineProperty(ne,X,_){const H=Object.getOwnPropertyDescriptor(ne,X)??null,u=Object.prototype.hasOwnProperty.call(_,"value")?{..._,value:l(_.value)}:_,x=Reflect.defineProperty(ne,X,u),O=g&&(X==="length"||Va(X));if($&&!O&&x){const Q={property:X,descriptor:u,previous:H},re=s||a.trace;$.emit(`define:${String(X)}`,Q),Mt(re)&&re($,"define",Q),$.emit("define",Q)}return x}});return $=Mt(k==null?void 0:k.emit)?te:n(te),$},y=s||a.trace;if(Array.isArray(e)){const k=h(e);return Mt(y)&&y(k,"new"),k}if(e!==null&&typeof e=="object"){const k=h(e);return Mt(y)&&y(k,"new",{object:k}),k}const o=n({get value(){return e},set value(k){if(Object.is(k,e))return;const g=e;e=k;const $={property:"value",value:e,previous:g};o.emit("set:value",$),Mt(y)&&y(o,"set",$),o.emit("set",$)}});return Mt(y)&&y(o,"new",{object:o}),o},ft=hd;ft.options={trace:null};ft.watch=pd;const D=ft({apps:[],currentAppId:null,files:[],activeFileName:null,chatMessages:[],generating:!1,generationBusy:!1,generationStatus:"",error:null});function Et(e,t){return{name:e,title:jf(e),properties:t.map(n=>({...n,title:n.title??Mf(n.name)}))}}function jf(e){return e.replace(/ModelDefinition$/,"").replace(/([a-z0-9])([A-Z])/g,"$1 $2")}function Mf(e){return e.replace(/([a-z0-9])([A-Z])/g,"$1 $2").replace(/^./,t=>t.toUpperCase())}const wa=[{name:"characters",type:"string",description:"Allowed single-character keys. Empty means no filter."}];Et("AssistedInputModelDefinition",wa);Et("AiChatModelDefinition",[{name:"messages",type:"object",description:"Chat messages store with read/save methods and list access."},{name:"promptDraft",type:"string",description:"Current prompt draft text."},{name:"messagesScrollTop",type:"number",title:"Messages scroll top",description:"Current persisted message list scroll position."},{name:"hasMessagesScrollTop",type:"boolean",title:"Has messages scroll top",description:"Whether a persisted scroll position has been captured."},{name:"missingKeyMessageShown",type:"boolean",title:"Missing key message shown",description:"Whether the missing-credentials warning has been shown."},{name:"lastResponseId",type:"string",title:"Last response id",description:"Persisted response id used to reconnect OpenAI response sessions."},{name:"choicePrompt",type:"object",description:"Current choice prompt state.",editable:!1},{name:"progress",type:"object",description:"Current in-progress request state.",editable:!1},{name:"sending",type:"boolean",description:"Whether a request is currently in-flight.",editable:!1},{name:"options",type:"object",description:"Provider, request, and persistence callbacks."}]);Et("ButtonModelDefinition",[{name:"variant",type:"string",description:"Variant key used to resolve theme defaults such as add or delete."},{name:"icon",type:"string",description:"HTML markup string for the icon."},{name:"buttonClassName",type:"string",title:"Button class name",description:"Class name applied to the native button."},{name:"theme",type:"object",description:"Per-instance components theme override."},{name:"text",type:"string",description:"Visible button label."},{name:"disabled",type:"boolean",description:"Native disabled state."},{name:"type",type:"string",description:"Native button type such as button, submit, or reset."}]);Et("FileViewModelDefinition",[{name:"provider",type:"object",description:"File provider used to load and optionally save files."},{name:"handlers",type:"array",description:"Ordered file handlers from most specific to most general."},{name:"fileName",type:"string",title:"File name",description:"Selected file name to preview."}]);Et("KeyboardModelDefinition",wa);Et("LetterpadModelDefinition",[...wa,{name:"collapsed",type:"boolean",description:"Whether the letterpad is collapsed."}]);Et("ListModelDefinition",[{name:"items",type:"array",description:"Rows rendered by the list."},{name:"context",type:"object",description:"Shared row binding context."},{name:"theme",type:"object",description:"Per-instance components theme override."}]);Et("NumpadModelDefinition",wa);const Pf=Et("PropertiesModelDefinition",[{name:"definition",type:"object",description:"Component model definition that drives the generated form."},{name:"target",type:"object",description:"Target object updated by the generated controls."},{name:"theme",type:"object",description:"Theme forwarded to nested controls."}]);Et("SelectModelDefinition",[{name:"label",type:"string"},{name:"description",type:"string"},{name:"validator",type:"function",description:"Validation function that returns an error message or null."},{name:"theme",type:"object",description:"Per-instance components theme override."},{name:"value",type:"string"},{name:"placeholder",type:"string"},{name:"items",type:"array"},{name:"disabled",type:"boolean"},{name:"controlClassName",type:"string",title:"Control class name"},{name:"status",type:"object",description:"Observable draft status object.",editable:!1},{name:"draftValue",type:"string",title:"Draft value",description:"Current in-progress selection.",editable:!1},{name:"isEmpty",type:"boolean",title:"Is empty",editable:!1},{name:"isValid",type:"boolean",title:"Is valid",editable:!1},{name:"errorMessage",type:"string",title:"Error message",description:"Current validation message or null.",editable:!1}]);Et("TextInputModelDefinition",[{name:"label",type:"string"},{name:"description",type:"string"},{name:"validator",type:"function",description:"Validation function that returns an error message or null."},{name:"theme",type:"object",description:"Per-instance components theme override."},{name:"value",type:"string"},{name:"placeholder",type:"string"},{name:"inputType",type:"string",title:"Input type"},{name:"controlClassName",type:"string",title:"Control class name"},{name:"multiline",type:"boolean"},{name:"autoExtend",type:"boolean",title:"Auto extend"},{name:"autoExtendMaxRows",type:"number",title:"Auto extend max rows",description:"Maximum rows when auto extend is enabled."},{name:"enterKeyBehavior",type:"string",title:"Enter key behavior"},{name:"disabled",type:"boolean"},{name:"rows",type:"number"},{name:"status",type:"object",description:"Observable draft status object.",editable:!1},{name:"draftValue",type:"string",title:"Draft value",description:"Current in-progress text.",editable:!1},{name:"isEmpty",type:"boolean",title:"Is empty",editable:!1},{name:"isValid",type:"boolean",title:"Is valid",editable:!1},{name:"errorMessage",type:"string",title:"Error message",description:"Current validation message or null.",editable:!1}]);Et("ThemeProviderModelDefinition",[{name:"theme",type:"object",description:"Active components theme."}]);/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Vi=globalThis,Yr=Vi.ShadowRoot&&(Vi.ShadyCSS===void 0||Vi.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Xr=Symbol(),hc=new WeakMap;let fd=class{constructor(t,n,s){if(this._$cssResult$=!0,s!==Xr)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=n}get styleSheet(){let t=this.o;const n=this.t;if(Yr&&t===void 0){const s=n!==void 0&&n.length===1;s&&(t=hc.get(n)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),s&&hc.set(n,t))}return t}toString(){return this.cssText}};const Nf=e=>new fd(typeof e=="string"?e:e+"",void 0,Xr),Qr=(e,...t)=>{const n=e.length===1?e[0]:t.reduce((s,i,a)=>s+(r=>{if(r._$cssResult$===!0)return r.cssText;if(typeof r=="number")return r;throw Error("Value passed to 'css' function must be a 'css' function result: "+r+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+e[a+1],e[0]);return new fd(n,e,Xr)},Of=(e,t)=>{if(Yr)e.adoptedStyleSheets=t.map(n=>n instanceof CSSStyleSheet?n:n.styleSheet);else for(const n of t){const s=document.createElement("style"),i=Vi.litNonce;i!==void 0&&s.setAttribute("nonce",i),s.textContent=n.cssText,e.appendChild(s)}},fc=Yr?e=>e:e=>e instanceof CSSStyleSheet?(t=>{let n="";for(const s of t.cssRules)n+=s.cssText;return Nf(n)})(e):e;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:Df,defineProperty:Lf,getOwnPropertyDescriptor:Ff,getOwnPropertyNames:Rf,getOwnPropertySymbols:Uf,getPrototypeOf:Bf}=Object,Zt=globalThis,mc=Zt.trustedTypes,Wf=mc?mc.emptyScript:"",Ha=Zt.reactiveElementPolyfillSupport,js=(e,t)=>e,Qi={toAttribute(e,t){switch(t){case Boolean:e=e?Wf:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,t){let n=e;switch(t){case Boolean:n=e!==null;break;case Number:n=e===null?null:Number(e);break;case Object:case Array:try{n=JSON.parse(e)}catch{n=null}}return n}},Zr=(e,t)=>!Df(e,t),gc={attribute:!0,type:String,converter:Qi,reflect:!1,useDefault:!1,hasChanged:Zr};Symbol.metadata??(Symbol.metadata=Symbol("metadata")),Zt.litPropertyMetadata??(Zt.litPropertyMetadata=new WeakMap);let On=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??(this.l=[])).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,n=gc){if(n.state&&(n.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((n=Object.create(n)).wrapped=!0),this.elementProperties.set(t,n),!n.noAccessor){const s=Symbol(),i=this.getPropertyDescriptor(t,s,n);i!==void 0&&Lf(this.prototype,t,i)}}static getPropertyDescriptor(t,n,s){const{get:i,set:a}=Ff(this.prototype,t)??{get(){return this[n]},set(r){this[n]=r}};return{get:i,set(r){const l=i==null?void 0:i.call(this);a==null||a.call(this,r),this.requestUpdate(t,l,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??gc}static _$Ei(){if(this.hasOwnProperty(js("elementProperties")))return;const t=Bf(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(js("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(js("properties"))){const n=this.properties,s=[...Rf(n),...Uf(n)];for(const i of s)this.createProperty(i,n[i])}const t=this[Symbol.metadata];if(t!==null){const n=litPropertyMetadata.get(t);if(n!==void 0)for(const[s,i]of n)this.elementProperties.set(s,i)}this._$Eh=new Map;for(const[n,s]of this.elementProperties){const i=this._$Eu(n,s);i!==void 0&&this._$Eh.set(i,n)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const n=[];if(Array.isArray(t)){const s=new Set(t.flat(1/0).reverse());for(const i of s)n.unshift(fc(i))}else t!==void 0&&n.push(fc(t));return n}static _$Eu(t,n){const s=n.attribute;return s===!1?void 0:typeof s=="string"?s:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){var t;this._$ES=new Promise(n=>this.enableUpdating=n),this._$AL=new Map,this._$E_(),this.requestUpdate(),(t=this.constructor.l)==null||t.forEach(n=>n(this))}addController(t){var n;(this._$EO??(this._$EO=new Set)).add(t),this.renderRoot!==void 0&&this.isConnected&&((n=t.hostConnected)==null||n.call(t))}removeController(t){var n;(n=this._$EO)==null||n.delete(t)}_$E_(){const t=new Map,n=this.constructor.elementProperties;for(const s of n.keys())this.hasOwnProperty(s)&&(t.set(s,this[s]),delete this[s]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Of(t,this.constructor.elementStyles),t}connectedCallback(){var t;this.renderRoot??(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),(t=this._$EO)==null||t.forEach(n=>{var s;return(s=n.hostConnected)==null?void 0:s.call(n)})}enableUpdating(t){}disconnectedCallback(){var t;(t=this._$EO)==null||t.forEach(n=>{var s;return(s=n.hostDisconnected)==null?void 0:s.call(n)})}attributeChangedCallback(t,n,s){this._$AK(t,s)}_$ET(t,n){var a;const s=this.constructor.elementProperties.get(t),i=this.constructor._$Eu(t,s);if(i!==void 0&&s.reflect===!0){const r=(((a=s.converter)==null?void 0:a.toAttribute)!==void 0?s.converter:Qi).toAttribute(n,s.type);this._$Em=t,r==null?this.removeAttribute(i):this.setAttribute(i,r),this._$Em=null}}_$AK(t,n){var a,r;const s=this.constructor,i=s._$Eh.get(t);if(i!==void 0&&this._$Em!==i){const l=s.getPropertyOptions(i),m=typeof l.converter=="function"?{fromAttribute:l.converter}:((a=l.converter)==null?void 0:a.fromAttribute)!==void 0?l.converter:Qi;this._$Em=i;const h=m.fromAttribute(n,l.type);this[i]=h??((r=this._$Ej)==null?void 0:r.get(i))??h,this._$Em=null}}requestUpdate(t,n,s,i=!1,a){var r;if(t!==void 0){const l=this.constructor;if(i===!1&&(a=this[t]),s??(s=l.getPropertyOptions(t)),!((s.hasChanged??Zr)(a,n)||s.useDefault&&s.reflect&&a===((r=this._$Ej)==null?void 0:r.get(t))&&!this.hasAttribute(l._$Eu(t,s))))return;this.C(t,n,s)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,n,{useDefault:s,reflect:i,wrapped:a},r){s&&!(this._$Ej??(this._$Ej=new Map)).has(t)&&(this._$Ej.set(t,r??n??this[t]),a!==!0||r!==void 0)||(this._$AL.has(t)||(this.hasUpdated||s||(n=void 0),this._$AL.set(t,n)),i===!0&&this._$Em!==t&&(this._$Eq??(this._$Eq=new Set)).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(n){Promise.reject(n)}const t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var s;if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??(this.renderRoot=this.createRenderRoot()),this._$Ep){for(const[a,r]of this._$Ep)this[a]=r;this._$Ep=void 0}const i=this.constructor.elementProperties;if(i.size>0)for(const[a,r]of i){const{wrapped:l}=r,m=this[a];l!==!0||this._$AL.has(a)||m===void 0||this.C(a,void 0,r,m)}}let t=!1;const n=this._$AL;try{t=this.shouldUpdate(n),t?(this.willUpdate(n),(s=this._$EO)==null||s.forEach(i=>{var a;return(a=i.hostUpdate)==null?void 0:a.call(i)}),this.update(n)):this._$EM()}catch(i){throw t=!1,this._$EM(),i}t&&this._$AE(n)}willUpdate(t){}_$AE(t){var n;(n=this._$EO)==null||n.forEach(s=>{var i;return(i=s.hostUpdated)==null?void 0:i.call(s)}),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&(this._$Eq=this._$Eq.forEach(n=>this._$ET(n,this[n]))),this._$EM()}updated(t){}firstUpdated(t){}};On.elementStyles=[],On.shadowRootOptions={mode:"open"},On[js("elementProperties")]=new Map,On[js("finalized")]=new Map,Ha==null||Ha({ReactiveElement:On}),(Zt.reactiveElementVersions??(Zt.reactiveElementVersions=[])).push("2.1.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Ms=globalThis,bc=e=>e,Zi=Ms.trustedTypes,yc=Zi?Zi.createPolicy("lit-html",{createHTML:e=>e}):void 0,md="$lit$",Qt=`lit$${Math.random().toFixed(9).slice(2)}$`,gd="?"+Qt,zf=`<${gd}>`,xn=document,Us=()=>xn.createComment(""),Bs=e=>e===null||typeof e!="object"&&typeof e!="function",eo=Array.isArray,Vf=e=>eo(e)||typeof(e==null?void 0:e[Symbol.iterator])=="function",qa=`[ 	
\f\r]`,fs=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,vc=/-->/g,wc=/>/g,dn=RegExp(`>|${qa}(?:([^\\s"'>=/]+)(${qa}*=${qa}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),_c=/'/g,xc=/"/g,bd=/^(?:script|style|textarea|title)$/i,Hf=e=>(t,...n)=>({_$litType$:e,strings:t,values:n}),Le=Hf(1),kn=Symbol.for("lit-noChange"),De=Symbol.for("lit-nothing"),kc=new WeakMap,gn=xn.createTreeWalker(xn,129);function yd(e,t){if(!eo(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return yc!==void 0?yc.createHTML(t):t}const qf=(e,t)=>{const n=e.length-1,s=[];let i,a=t===2?"<svg>":t===3?"<math>":"",r=fs;for(let l=0;l<n;l++){const m=e[l];let h,y,o=-1,k=0;for(;k<m.length&&(r.lastIndex=k,y=r.exec(m),y!==null);)k=r.lastIndex,r===fs?y[1]==="!--"?r=vc:y[1]!==void 0?r=wc:y[2]!==void 0?(bd.test(y[2])&&(i=RegExp("</"+y[2],"g")),r=dn):y[3]!==void 0&&(r=dn):r===dn?y[0]===">"?(r=i??fs,o=-1):y[1]===void 0?o=-2:(o=r.lastIndex-y[2].length,h=y[1],r=y[3]===void 0?dn:y[3]==='"'?xc:_c):r===xc||r===_c?r=dn:r===vc||r===wc?r=fs:(r=dn,i=void 0);const g=r===dn&&e[l+1].startsWith("/>")?" ":"";a+=r===fs?m+zf:o>=0?(s.push(h),m.slice(0,o)+md+m.slice(o)+Qt+g):m+Qt+(o===-2?l:g)}return[yd(e,a+(e[n]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),s]};class Ws{constructor({strings:t,_$litType$:n},s){let i;this.parts=[];let a=0,r=0;const l=t.length-1,m=this.parts,[h,y]=qf(t,n);if(this.el=Ws.createElement(h,s),gn.currentNode=this.el.content,n===2||n===3){const o=this.el.content.firstChild;o.replaceWith(...o.childNodes)}for(;(i=gn.nextNode())!==null&&m.length<l;){if(i.nodeType===1){if(i.hasAttributes())for(const o of i.getAttributeNames())if(o.endsWith(md)){const k=y[r++],g=i.getAttribute(o).split(Qt),$=/([.?@])?(.*)/.exec(k);m.push({type:1,index:a,name:$[2],strings:g,ctor:$[1]==="."?Gf:$[1]==="?"?Jf:$[1]==="@"?Yf:_a}),i.removeAttribute(o)}else o.startsWith(Qt)&&(m.push({type:6,index:a}),i.removeAttribute(o));if(bd.test(i.tagName)){const o=i.textContent.split(Qt),k=o.length-1;if(k>0){i.textContent=Zi?Zi.emptyScript:"";for(let g=0;g<k;g++)i.append(o[g],Us()),gn.nextNode(),m.push({type:2,index:++a});i.append(o[k],Us())}}}else if(i.nodeType===8)if(i.data===gd)m.push({type:2,index:a});else{let o=-1;for(;(o=i.data.indexOf(Qt,o+1))!==-1;)m.push({type:7,index:a}),o+=Qt.length-1}a++}}static createElement(t,n){const s=xn.createElement("template");return s.innerHTML=t,s}}function Bn(e,t,n=e,s){var r,l;if(t===kn)return t;let i=s!==void 0?(r=n._$Co)==null?void 0:r[s]:n._$Cl;const a=Bs(t)?void 0:t._$litDirective$;return(i==null?void 0:i.constructor)!==a&&((l=i==null?void 0:i._$AO)==null||l.call(i,!1),a===void 0?i=void 0:(i=new a(e),i._$AT(e,n,s)),s!==void 0?(n._$Co??(n._$Co=[]))[s]=i:n._$Cl=i),i!==void 0&&(t=Bn(e,i._$AS(e,t.values),i,s)),t}class Kf{constructor(t,n){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=n}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:n},parts:s}=this._$AD,i=((t==null?void 0:t.creationScope)??xn).importNode(n,!0);gn.currentNode=i;let a=gn.nextNode(),r=0,l=0,m=s[0];for(;m!==void 0;){if(r===m.index){let h;m.type===2?h=new yi(a,a.nextSibling,this,t):m.type===1?h=new m.ctor(a,m.name,m.strings,this,t):m.type===6&&(h=new Xf(a,this,t)),this._$AV.push(h),m=s[++l]}r!==(m==null?void 0:m.index)&&(a=gn.nextNode(),r++)}return gn.currentNode=xn,i}p(t){let n=0;for(const s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(t,s,n),n+=s.strings.length-2):s._$AI(t[n])),n++}}class yi{get _$AU(){var t;return((t=this._$AM)==null?void 0:t._$AU)??this._$Cv}constructor(t,n,s,i){this.type=2,this._$AH=De,this._$AN=void 0,this._$AA=t,this._$AB=n,this._$AM=s,this.options=i,this._$Cv=(i==null?void 0:i.isConnected)??!0}get parentNode(){let t=this._$AA.parentNode;const n=this._$AM;return n!==void 0&&(t==null?void 0:t.nodeType)===11&&(t=n.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,n=this){t=Bn(this,t,n),Bs(t)?t===De||t==null||t===""?(this._$AH!==De&&this._$AR(),this._$AH=De):t!==this._$AH&&t!==kn&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):Vf(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==De&&Bs(this._$AH)?this._$AA.nextSibling.data=t:this.T(xn.createTextNode(t)),this._$AH=t}$(t){var a;const{values:n,_$litType$:s}=t,i=typeof s=="number"?this._$AC(t):(s.el===void 0&&(s.el=Ws.createElement(yd(s.h,s.h[0]),this.options)),s);if(((a=this._$AH)==null?void 0:a._$AD)===i)this._$AH.p(n);else{const r=new Kf(i,this),l=r.u(this.options);r.p(n),this.T(l),this._$AH=r}}_$AC(t){let n=kc.get(t.strings);return n===void 0&&kc.set(t.strings,n=new Ws(t)),n}k(t){eo(this._$AH)||(this._$AH=[],this._$AR());const n=this._$AH;let s,i=0;for(const a of t)i===n.length?n.push(s=new yi(this.O(Us()),this.O(Us()),this,this.options)):s=n[i],s._$AI(a),i++;i<n.length&&(this._$AR(s&&s._$AB.nextSibling,i),n.length=i)}_$AR(t=this._$AA.nextSibling,n){var s;for((s=this._$AP)==null?void 0:s.call(this,!1,!0,n);t!==this._$AB;){const i=bc(t).nextSibling;bc(t).remove(),t=i}}setConnected(t){var n;this._$AM===void 0&&(this._$Cv=t,(n=this._$AP)==null||n.call(this,t))}}class _a{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,n,s,i,a){this.type=1,this._$AH=De,this._$AN=void 0,this.element=t,this.name=n,this._$AM=i,this.options=a,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=De}_$AI(t,n=this,s,i){const a=this.strings;let r=!1;if(a===void 0)t=Bn(this,t,n,0),r=!Bs(t)||t!==this._$AH&&t!==kn,r&&(this._$AH=t);else{const l=t;let m,h;for(t=a[0],m=0;m<a.length-1;m++)h=Bn(this,l[s+m],n,m),h===kn&&(h=this._$AH[m]),r||(r=!Bs(h)||h!==this._$AH[m]),h===De?t=De:t!==De&&(t+=(h??"")+a[m+1]),this._$AH[m]=h}r&&!i&&this.j(t)}j(t){t===De?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class Gf extends _a{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===De?void 0:t}}class Jf extends _a{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==De)}}class Yf extends _a{constructor(t,n,s,i,a){super(t,n,s,i,a),this.type=5}_$AI(t,n=this){if((t=Bn(this,t,n,0)??De)===kn)return;const s=this._$AH,i=t===De&&s!==De||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,a=t!==De&&(s===De||i);i&&this.element.removeEventListener(this.name,this,s),a&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){var n;typeof this._$AH=="function"?this._$AH.call(((n=this.options)==null?void 0:n.host)??this.element,t):this._$AH.handleEvent(t)}}class Xf{constructor(t,n,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=n,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(t){Bn(this,t)}}const Ka=Ms.litHtmlPolyfillSupport;Ka==null||Ka(Ws,yi),(Ms.litHtmlVersions??(Ms.litHtmlVersions=[])).push("3.3.2");const Qf=(e,t,n)=>{const s=(n==null?void 0:n.renderBefore)??t;let i=s._$litPart$;if(i===void 0){const a=(n==null?void 0:n.renderBefore)??null;s._$litPart$=i=new yi(t.insertBefore(Us(),a),a,void 0,n??{})}return i._$AI(e),i};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const bn=globalThis;let ht=class extends On{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var n;const t=super.createRenderRoot();return(n=this.renderOptions).renderBefore??(n.renderBefore=t.firstChild),t}update(t){const n=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=Qf(n,this.renderRoot,this.renderOptions)}connectedCallback(){var t;super.connectedCallback(),(t=this._$Do)==null||t.setConnected(!0)}disconnectedCallback(){var t;super.disconnectedCallback(),(t=this._$Do)==null||t.setConnected(!1)}render(){return kn}};var cd;ht._$litElement$=!0,ht.finalized=!0,(cd=bn.litElementHydrateSupport)==null||cd.call(bn,{LitElement:ht});const Ga=bn.litElementPolyfillSupport;Ga==null||Ga({LitElement:ht});(bn.litElementVersions??(bn.litElementVersions=[])).push("4.2.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const $t=e=>(t,n)=>{n!==void 0?n.addInitializer(()=>{customElements.define(e,t)}):customElements.define(e,t)};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Zf={attribute:!0,type:String,converter:Qi,reflect:!1,hasChanged:Zr},em=(e=Zf,t,n)=>{const{kind:s,metadata:i}=n;let a=globalThis.litPropertyMetadata.get(i);if(a===void 0&&globalThis.litPropertyMetadata.set(i,a=new Map),s==="setter"&&((e=Object.create(e)).wrapped=!0),a.set(n.name,e),s==="accessor"){const{name:r}=n;return{set(l){const m=t.get.call(this);t.set.call(this,l),this.requestUpdate(r,m,e,!0,l)},init(l){return l!==void 0&&this.C(r,void 0,e,l),l}}}if(s==="setter"){const{name:r}=n;return function(l){const m=this[r];t.call(this,l),this.requestUpdate(r,m,e,!0,l)}}throw Error("Unsupported decorator location: "+s)};function le(e){return(t,n)=>typeof n=="object"?em(e,t,n):((s,i,a)=>{const r=i.hasOwnProperty(a);return i.constructor.createProperty(a,s),r?Object.getOwnPropertyDescriptor(i,a):void 0})(e,t,n)}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const tm={CHILD:2},nm=e=>(...t)=>({_$litDirective$:e,values:t});class sm{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,n,s){this._$Ct=t,this._$AM=n,this._$Ci=s}_$AS(t,n){return this.update(t,n)}update(t,n){return this.render(...n)}}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */class sr extends sm{constructor(t){if(super(t),this.it=De,t.type!==tm.CHILD)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(t){if(t===De||t==null)return this._t=void 0,this.it=t;if(t===kn)return t;if(typeof t!="string")throw Error(this.constructor.directiveName+"() called with a non-string value");if(t===this.it)return this._t;this.it=t;const n=[t];return n.raw=n,this._t={_$litType$:this.constructor.resultType,strings:n,values:[]}}}sr.directiveName="unsafeHTML",sr.resultType=1;const to=nm(sr),im="asljs-theme-provider",Yt="asljs-theme-changed",Fi={button:{variants:{add:{icon:"&#xF26E;",text:"Add"},delete:{icon:"&#xF5DE;",text:"Delete"},settings:{icon:"&#xF3E5;",text:"Settings"}}}};let Ri={};function Hi(e,t){if(!(e===void 0&&t===void 0))return{...e??{},...t??{}}}function am(e,t){if(e===void 0&&t===void 0)return;const n=new Set([...Object.keys(e??{}),...Object.keys(t??{})]),s={};for(const i of n)s[i]=Hi(e==null?void 0:e[i],t==null?void 0:t[i]);return s}function rm(e,t){if(!(e===void 0&&t===void 0))return{...e??{},...t??{},variants:am(e==null?void 0:e.variants,t==null?void 0:t.variants)}}function xa(){return{button:rm(Fi.button,Ri.button),list:Hi(Fi.list,Ri.list),textInput:Hi(Fi.textInput,Ri.textInput),select:Hi(Fi.select,Ri.select)}}function ka(e){return e.closest(im)}function no(e,t){if(e==null)return null;const n=typeof e=="function"?e(t):e;if(n==null)return null;if(typeof n=="string"){const i=document.createElement("template");return i.innerHTML=n,i}const s=document.createElement("template");return s.content.append(n.content.cloneNode(!0)),s}function vd(e,t){return e==null?null:(typeof e=="function"?e(t):e)??null}var om=Object.create,so=Object.defineProperty,lm=Object.getOwnPropertyDescriptor,wd=(e,t)=>(t=Symbol[e])?t:Symbol.for("Symbol."+e),Zn=e=>{throw TypeError(e)},cm=(e,t,n)=>t in e?so(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,Ec=(e,t)=>so(e,"name",{value:t,configurable:!0}),dm=e=>[,,,om((e==null?void 0:e[wd("metadata")])??null)],_d=["class","method","getter","setter","accessor","field","value","get","set"],ys=e=>e!==void 0&&typeof e!="function"?Zn("Function expected"):e,um=(e,t,n,s,i)=>({kind:_d[e],name:t,metadata:s,addInitializer:a=>n._?Zn("Already initialized"):i.push(ys(a||null))}),pm=(e,t)=>cm(t,wd("metadata"),e[3]),et=(e,t,n,s)=>{for(var i=0,a=e[t>>1],r=a&&a.length;i<r;i++)t&1?a[i].call(n):s=a[i].call(n,s);return s},an=(e,t,n,s,i,a)=>{var r,l,m,h,y,o=t&7,k=!!(t&8),g=!!(t&16),$=o>3?e.length+1:o?k?1:2:0,te=_d[o+5],ne=o>3&&(e[$-1]=[]),X=e[$]||(e[$]=[]),_=o&&(!g&&!k&&(i=i.prototype),o<5&&(o>3||!g)&&lm(o<4?i:{get[n](){return En(this,a)},set[n](u){return ea(this,a,u)}},n));o?g&&o<4&&Ec(a,(o>2?"set ":o>1?"get ":"")+n):Ec(i,n);for(var H=s.length-1;H>=0;H--)h=um(o,n,m={},e[3],X),o&&(h.static=k,h.private=g,y=h.access={has:g?u=>hm(i,u):u=>n in u},o^3&&(y.get=g?u=>(o^1?En:Pt)(u,i,o^4?a:_.get):u=>u[n]),o>2&&(y.set=g?(u,x)=>ea(u,i,x,o^4?a:_.set):(u,x)=>u[n]=x)),l=(0,s[H])(o?o<4?g?a:_[te]:o>4?void 0:{get:_.get,set:_.set}:i,h),m._=1,o^4||l===void 0?ys(l)&&(o>4?ne.unshift(l):o?g?a=l:_[te]=l:i=l):typeof l!="object"||l===null?Zn("Object expected"):(ys(r=l.get)&&(_.get=r),ys(r=l.set)&&(_.set=r),ys(r=l.init)&&ne.unshift(r));return o||pm(e,i),_&&so(i,n,_),g?o^4?a:_:i},io=(e,t,n)=>t.has(e)||Zn("Cannot "+n),hm=(e,t)=>Object(t)!==t?Zn('Cannot use the "in" operator on this value'):e.has(t),En=(e,t,n)=>(io(e,t,"read from private field"),n?n.call(e):t.get(e)),It=(e,t,n)=>t.has(e)?Zn("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(e):t.set(e,n),ea=(e,t,n,s)=>(io(e,t,"write to private field"),s?s.call(e,n):t.set(e,n),n),Pt=(e,t,n)=>(io(e,t,"access private method"),n),xd,kd,Ed,Ad,Sd,$d,Cd,ir,Td,An,Ne,ao,ro,oo,lo,co,uo,po,St,qi,Id,jd,ar,ho,Ea;Td=[$t("asljs-button")];class Ot extends(ir=ht,Cd=[le({reflect:!0})],$d=[le({attribute:!1})],Sd=[le({attribute:!1})],Ad=[le({attribute:!1})],Ed=[le({attribute:!1})],kd=[le({reflect:!0})],xd=[le({reflect:!0})],ir){constructor(){super(...arguments),It(this,St),It(this,An,null),It(this,ao,et(Ne,8,this,"")),et(Ne,11,this),It(this,ro,et(Ne,12,this,"")),et(Ne,15,this),It(this,oo,et(Ne,16,this,"")),et(Ne,19,this),It(this,lo,et(Ne,20,this,null)),et(Ne,23,this),It(this,co,et(Ne,24,this,"")),et(Ne,27,this),It(this,uo,et(Ne,28,this,!1)),et(Ne,31,this),It(this,po,et(Ne,32,this,"button")),et(Ne,35,this),It(this,Ea,()=>{this.requestUpdate()})}createRenderRoot(){return this}connectedCallback(){super.connectedCallback(),Pt(this,St,ar).call(this)}disconnectedCallback(){Pt(this,St,ho).call(this),super.disconnectedCallback()}get resolvedIcon(){if(this.icon!=="")return this.icon;const t=Pt(this,St,qi).call(this,"icon");return t!==null?t:""}get resolvedButtonClassName(){return this.buttonClassName.trim()!==""?this.buttonClassName.trim():Pt(this,St,qi).call(this,"className")??""}get resolvedText(){return this.text!==""?this.text:Pt(this,St,qi).call(this,"text")??""}updated(t){t.has("theme")&&Pt(this,St,ar).call(this)}render(){return Le`
      <button
          class=${this.resolvedButtonClassName}
          ?disabled=${this.disabled}
          type=${this.type}
          style="display:inline-flex;align-items:center;gap:0.5rem;">
        <span class="icon"
              ?hidden=${this.resolvedIcon===""}
              aria-hidden="true">${to(this.resolvedIcon)}</span>
        <span class="text"
              ?hidden=${this.resolvedText===""}>${this.resolvedText}</span>
      </button>
    `}}Ne=dm(ir);An=new WeakMap;ao=new WeakMap;ro=new WeakMap;oo=new WeakMap;lo=new WeakMap;co=new WeakMap;uo=new WeakMap;po=new WeakMap;St=new WeakSet;qi=function(e){for(const t of Pt(this,St,jd).call(this)){const n=Pt(this,St,Id).call(this,t,e);if(n!==null)return n;const s=vd(t==null?void 0:t[e],this);if(s!==null&&s!=="")return s}return null};Id=function(e,t){var i,a;const n=this.variant.trim();if(n==="")return null;const s=vd((a=(i=e==null?void 0:e.variants)==null?void 0:i[n])==null?void 0:a[t],this);return s===null||s===""?null:s};jd=function(){var e,t,n;return[(e=this.theme)==null?void 0:e.button,(n=(t=En(this,An))==null?void 0:t.theme)==null?void 0:n.button,xa().button]};ar=function(){var e;Pt(this,St,ho).call(this),ea(this,An,ka(this)),(e=En(this,An))==null||e.addEventListener(Yt,En(this,Ea))};ho=function(){var e;(e=En(this,An))==null||e.removeEventListener(Yt,En(this,Ea)),ea(this,An,null)};Ea=new WeakMap;an(Ne,4,"variant",Cd,Ot,ao);an(Ne,4,"icon",$d,Ot,ro);an(Ne,4,"buttonClassName",Sd,Ot,oo);an(Ne,4,"theme",Ad,Ot,lo);an(Ne,4,"text",Ed,Ot,co);an(Ne,4,"disabled",kd,Ot,uo);an(Ne,4,"type",xd,Ot,po);Ot=an(Ne,0,"Button",Td,Ot);et(Ne,1,Ot);function ta(e,t){return t===""?null:fm(e)?e.get(t):mm(e,t)}function fm(e){return typeof e.get=="function"}function mm(e,t){const n=t.split(".").map(i=>i.trim()).filter(i=>i!=="");let s=e;for(const i of n){if(typeof s!="object"||s===null||!(i in s))return null;s=s[i]}return s}function gm(e,t,n,s,i){let a=ta(n,t.actionPath);const r=()=>{a=ta(n,t.actionPath)},l=h=>{if(typeof a!="function"){i(`${s}:missing-action:${t.actionPath}`,`${s}: action '${t.actionPath}' is not a function`);return}try{a(h,n,e)}catch(y){i(`${s}:action-error:${t.actionPath}`,`${s}: action '${t.actionPath}' failed`,y)}};e.addEventListener(t.eventName,l);let m=null;if(t.actionPath!==""){const h=ft.watch(n,t.actionPath,()=>r());typeof h=="function"&&(m=h)}return()=>{e.removeEventListener(t.eventName,l),m==null||m()}}const bm=[{token:"yyyy",getter:e=>e.getFullYear().toString().padStart(4,"0")},{token:"yy",getter:e=>e.getFullYear().toString().substring(2).padStart(2,"0")},{token:"MM",getter:e=>(e.getMonth()+1).toString().padStart(2,"0")},{token:"dd",getter:e=>e.getDate().toString().padStart(2,"0")},{token:"hh",getter:e=>e.getHours().toString().padStart(2,"0")},{token:"mm",getter:e=>e.getMinutes().toString().padStart(2,"0")},{token:"ss",getter:e=>e.getSeconds().toString().padStart(2,"0")}],Ac=new Map;function ym(e){const t=[];let n="";for(let s=0;s<e.length;){if(e[s]==="\\"){s+1<e.length?(n+=e[s+1],s+=2):(n+=e[s],s++);continue}let i=!1;for(const a of bm)if(e.startsWith(a.token,s)){if(n.length>0){const r=n;t.push(()=>r),n=""}t.push(a.getter),s+=a.token.length,i=!0;break}i||(n+=e[s],s++)}return n.length>0&&t.push(()=>n),s=>t.map(i=>i(s)).join("")}function vm(e,t){if(!t)return e.toString();let n=Ac.get(t);return n||(n=ym(t),Ac.set(t,n)),n(e)}function Ps(e){return e==null?"":e instanceof Date?e.toISOString():String(e)}const wm=new Set(["short","medium","long","full"]);function _m(e){return{string:t=>t==null?t:Ps(t),number:t=>{if(t==null)return t;const n=Number(t);return Number.isFinite(n)?new Intl.NumberFormat(e).format(n):""},currency:(t,n="USD")=>{if(t==null)return t;const s=Number(t);return Number.isFinite(s)?new Intl.NumberFormat(e,{style:"currency",currency:n}).format(s):""},date:(t,n="short")=>t==null?t:Sc(t,n,e,!1),datetime:(t,n="short")=>t==null?t:Sc(t,n,e,!0),fixed:(t,n="2")=>{if(t==null)return t;const s=Number(t),i=Number(n);return Number.isFinite(s)?!Number.isInteger(i)||i<0?s.toString():s.toFixed(i):""},upper:t=>t==null?t:Ps(t).toUpperCase(),lower:t=>t==null?t:Ps(t).toLowerCase(),json:(t,n="0")=>{if(t==null)return t;const s=Number(n);return JSON.stringify(t,null,Number.isInteger(s)&&s>=0?s:0)??""},default:(t,...n)=>t==null?t:t===""?n.join(":"):t,safeHtml:t=>t}}function xm(e){return{..._m(),...(e==null?void 0:e.pipes)??{}}}function Sc(e,t,n,s){const i=km(e);if(i===null)return"";if(wm.has(t)){const a=t;return s?new Intl.DateTimeFormat(n,{dateStyle:a,timeStyle:a}).format(i):new Intl.DateTimeFormat(n,{dateStyle:a}).format(i)}return vm(i,t)}function km(e){if(e instanceof Date)return Number.isNaN(e.getTime())?null:e;if(typeof e=="string"||typeof e=="number"){const t=new Date(e);return Number.isNaN(t.getTime())?null:t}return null}function Em(e,t,n){if(t.kind==="class"){e.classList.toggle(t.name,!!n);return}if(t.kind==="prop"){const i=t.name;e[i]=n;return}if(t.kind==="attr"){if(n==null){e.removeAttribute(t.name);return}e.setAttribute(t.name,Ps(n));return}const s=Ps(n);if(t.kind==="html"){e.innerHTML=s;return}e.textContent=s}function Am(e,t,n,s){const i=xm(s),a=Sm(t.pipes,i),r=()=>{const m=ta(n,t.path),h=$m(m,a);Em(e,t.target,h)};if(r(),t.path==="")return()=>{};const l=ft.watch(n,t.path,()=>r());return typeof l!="function"?()=>{}:()=>l()}function Sm(e,t){const n=[];for(const s of e){const i=t[s.name];if(!i)throw new Error(`Unknown pipe: ${s.name}`);n.push({args:[...s.args],formatter:i})}return n}function $m(e,t){let n=e;for(const s of t)n=s.formatter(n,...s.args);return n}function Cm(e,t){const n=Mm(t,"|").map(a=>a.trim()).filter(a=>a!==""),s=n[0]??"",i=n.slice(1).map(Im).filter(a=>a!==null);return{kind:"value",target:e,path:s,pipes:i}}function Tm(e,t){const n=t.trim();return{kind:"event",eventName:e,actionPath:n}}function Im(e){const t=e.trim(),n=t.indexOf(":"),s=(n<0?t:t.slice(0,n)).trim();if(s==="")return null;if(n<0)return{name:s,args:[]};const i=jm(t,n+1);return{name:s,args:i}}function jm(e,t){const n=[];let s=t;for(;s<e.length;){for(;s<e.length&&e[s]===" ";)s++;if(s>=e.length||e[s]==="|")break;if(e[s]==="'"||e[s]==='"'){const i=e[s];s++;let a="",r=!1;for(;s<e.length;){const l=e[s];if(r){a+=l,r=!1,s++;continue}if(l==="\\"){r=!0,s++;continue}if(l===i){s++;break}a+=l,s++}n.push(a)}else{let i="";for(;s<e.length;){const a=e[s];if(a===":"||a==="|")break;i+=a,s++}n.push(i.trim())}for(;s<e.length&&e[s]===" ";)s++;if(s<e.length&&e[s]===":"){s++;continue}if(s<e.length&&e[s]==="|")break}return n}function Mm(e,t,n=!1){const s=[];let i="",a=null,r=!1;for(let l=0;l<e.length;l++){const m=e[l];if(r){i+=m,r=!1;continue}if(m==="\\"){n||(i+=m),r=!0;continue}if(a!==null){if(m===a){a=null,n||(i+=m);continue}i+=m;continue}if(m==="'"||m==='"'){a=m,n||(i+=m);continue}if(m===t){s.push(i),i="";continue}i+=m}return s.push(i),s}const Md="data-bind-context",$c="data-bind-";function vi(e,t,n={}){const s=new Set,i=(l,m,h=null)=>{s.has(l)||(s.add(l),h===null?console.warn(m):console.warn(m,h))};let a=0;return fo(e,t,n,i,()=>`data-bind[${a++}]`)}function fo(e,t,n,s,i){const a=[];for(const r of[...e.children]){const l=r.getAttribute(Md);l!==null?a.push(Pm(r,l,t,n,s,i)):(Pd(r,t,n,s,i,a),a.push(fo(r,t,n,s,i)))}return()=>{for(const r of a)r()}}function Pm(e,t,n,s,i,a){const r=[];Pd(e,n,s,i,a,r,Md);let l=null;const m=()=>{l==null||l();const y=ta(n,t),o=y!=null&&typeof y=="object"?y:{};l=fo(e,o,s,i,a)};m();let h=null;if(t!==""){const y=ft.watch(n,t,()=>m());typeof y=="function"&&(h=y)}return()=>{for(const y of r)y();l==null||l(),h==null||h()}}function Pd(e,t,n,s,i,a,r){for(const l of[...e.attributes]){if(!l.name.startsWith($c)||r!==void 0&&l.name===r)continue;const m=l.name.slice($c.length),h=l.value??"",y=Nm(m,h),o=i();try{y.kind==="value"?a.push(Am(e,y,t,n)):a.push(gm(e,y,t,o,s))}catch(k){if(y.kind==="value")throw k;s(`${o}:bind-error`,`${o}: binding setup failed`,k)}}}function Nm(e,t){return e.startsWith("on")&&e.length>2?Tm(e.slice(2),t):Cm(Om(e),t)}function Om(e){return e==="text"?{kind:"text"}:e==="html"?{kind:"html"}:e.startsWith("class-")&&e.length>6?{kind:"class",name:e.slice(6)}:e.startsWith("prop-")&&e.length>5?{kind:"prop",name:e.slice(5)}:{kind:"attr",name:e}}var Dm=Object.create,mo=Object.defineProperty,Lm=Object.getOwnPropertyDescriptor,Nd=(e,t)=>(t=Symbol[e])?t:Symbol.for("Symbol."+e),es=e=>{throw TypeError(e)},Fm=(e,t,n)=>t in e?mo(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,Cc=(e,t)=>mo(e,"name",{value:t,configurable:!0}),Rm=e=>[,,,Dm((e==null?void 0:e[Nd("metadata")])??null)],Od=["class","method","getter","setter","accessor","field","value","get","set"],vs=e=>e!==void 0&&typeof e!="function"?es("Function expected"):e,Um=(e,t,n,s,i)=>({kind:Od[e],name:t,metadata:s,addInitializer:a=>n._?es("Already initialized"):i.push(vs(a||null))}),Bm=(e,t)=>Fm(t,Nd("metadata"),e[3]),Ge=(e,t,n,s)=>{for(var i=0,a=e[t>>1],r=a&&a.length;i<r;i++)t&1?a[i].call(n):s=a[i].call(n,s);return s},Ft=(e,t,n,s,i,a)=>{var r,l,m,h,y,o=t&7,k=!!(t&8),g=!!(t&16),$=o>3?e.length+1:o?k?1:2:0,te=Od[o+5],ne=o>3&&(e[$-1]=[]),X=e[$]||(e[$]=[]),_=o&&(!g&&!k&&(i=i.prototype),o<5&&(o>3||!g)&&Lm(o<4?i:{get[n](){return he(this,a)},set[n](u){return Ve(this,a,u)}},n));o?g&&o<4&&Cc(a,(o>2?"set ":o>1?"get ":"")+n):Cc(i,n);for(var H=s.length-1;H>=0;H--)h=Um(o,n,m={},e[3],X),o&&(h.static=k,h.private=g,y=h.access={has:g?u=>Wm(i,u):u=>n in u},o^3&&(y.get=g?u=>(o^1?he:Ie)(u,i,o^4?a:_.get):u=>u[n]),o>2&&(y.set=g?(u,x)=>Ve(u,i,x,o^4?a:_.set):(u,x)=>u[n]=x)),l=(0,s[H])(o?o<4?g?a:_[te]:o>4?void 0:{get:_.get,set:_.set}:i,h),m._=1,o^4||l===void 0?vs(l)&&(o>4?ne.unshift(l):o?g?a=l:_[te]=l:i=l):typeof l!="object"||l===null?es("Object expected"):(vs(r=l.get)&&(_.get=r),vs(r=l.set)&&(_.set=r),vs(r=l.init)&&ne.unshift(r));return o||Bm(e,i),_&&mo(i,n,_),g?o^4?a:_:i},go=(e,t,n)=>t.has(e)||es("Cannot "+n),Wm=(e,t)=>Object(t)!==t?es('Cannot use the "in" operator on this value'):e.has(t),he=(e,t,n)=>(go(e,t,"read from private field"),n?n.call(e):t.get(e)),Re=(e,t,n)=>t.has(e)?es("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(e):t.set(e,n),Ve=(e,t,n,s)=>(go(e,t,"write to private field"),s?s.call(e,n):t.set(e,n),n),Ie=(e,t,n)=>(go(e,t,"access private method"),n),Dd,Ld,Fd,Rd,Ud,Bd,Wd,zd,Vd,rr,Hd,Aa,Sa,yn,qt,en,Ht,wi,Wn,zs,ws,lt,Ae,bo,yo,vo,wo,_o,xo,ko,Eo,Ao,Se,qd,or,So,$a,lr,ts,cr,$o,Kd,Gd,Jd,_i,Yd,dr,Co;Hd=[$t("asljs-select")];class kt extends(rr=ht,Vd=[le({attribute:!1})],zd=[le({attribute:!1})],Wd=[le({attribute:!1})],Bd=[le({attribute:!1})],Ud=[le({attribute:!1})],Rd=[le({attribute:!1})],Fd=[le({attribute:!1})],Ld=[le({attribute:!1})],Dd=[le({attribute:!1})],rr){constructor(){super(...arguments),Re(this,Se),Re(this,Aa,null),Re(this,Sa,null),Re(this,yn,null),Re(this,qt,null),Re(this,en,null),Re(this,Ht,null),Re(this,wi,""),Re(this,Wn,null),Re(this,zs,null),Re(this,ws,`asljs-select-${zm++}`),Re(this,lt,ft({label:"",description:"",errorMessage:"",hideLabel:!0,hideDescription:!0,hideError:!0,hasError:!1,isEmpty:!0,inputId:`${he(this,ws)}-control`,descriptionId:`${he(this,ws)}-description`,errorId:`${he(this,ws)}-error`})),this.status=ft({draftValue:"",isEmpty:!0,isValid:!0,errorMessage:null,dirty:!1}),Re(this,bo,Ge(Ae,8,this,null)),Ge(Ae,11,this),Re(this,yo,Ge(Ae,12,this,null)),Ge(Ae,15,this),Re(this,vo,Ge(Ae,16,this,null)),Ge(Ae,19,this),Re(this,wo,Ge(Ae,20,this,null)),Ge(Ae,23,this),Re(this,_o,Ge(Ae,24,this,"")),Ge(Ae,27,this),Re(this,xo,Ge(Ae,28,this,null)),Ge(Ae,31,this),Re(this,ko,Ge(Ae,32,this,[])),Ge(Ae,35,this),Re(this,Eo,Ge(Ae,36,this,!1)),Ge(Ae,39,this),Re(this,Ao,Ge(Ae,40,this,"")),Ge(Ae,43,this),Re(this,$a,()=>{Ie(this,Se,cr).call(this)})}get draftValue(){return this.status.draftValue}get isEmpty(){return this.status.isEmpty}get isValid(){return this.status.isValid}get errorMessage(){return this.status.errorMessage}createRenderRoot(){return this}connectedCallback(){super.connectedCallback(),Ie(this,Se,qd).call(this),Ie(this,Se,or).call(this),Ie(this,Se,lr).call(this)}disconnectedCallback(){var t,n;Ie(this,Se,Co).call(this),(t=he(this,yn))==null||t.call(this),Ve(this,yn,null),(n=he(this,qt))==null||n.call(this),Ve(this,qt,null),Ie(this,Se,So).call(this),super.disconnectedCallback()}render(){return Le`
      <div data-role="template-host"></div>
    `}updated(t){if(t.has("theme")&&Ie(this,Se,or).call(this),t.has("value")&&Ie(this,Se,lr).call(this),t.has("label")||t.has("description")||t.has("theme")){Ie(this,Se,cr).call(this);return}(t.has("placeholder")||t.has("disabled")||t.has("items")||t.has("controlClassName"))&&Ie(this,Se,_i).call(this),Ie(this,Se,ts).call(this)}}Ae=Rm(rr);Aa=new WeakMap;Sa=new WeakMap;yn=new WeakMap;qt=new WeakMap;en=new WeakMap;Ht=new WeakMap;wi=new WeakMap;Wn=new WeakMap;zs=new WeakMap;ws=new WeakMap;lt=new WeakMap;bo=new WeakMap;yo=new WeakMap;vo=new WeakMap;wo=new WeakMap;_o=new WeakMap;xo=new WeakMap;ko=new WeakMap;Eo=new WeakMap;Ao=new WeakMap;Se=new WeakSet;qd=function(){Ve(this,Aa,Tc(this,"template")),Ve(this,Sa,Tc(this,"select"))};or=function(){Ie(this,Se,So).call(this),Ve(this,en,ka(this)),he(this,en)!==null&&he(this,en).addEventListener(Yt,he(this,$a))};So=function(){var e;(e=he(this,en))==null||e.removeEventListener(Yt,he(this,$a)),Ve(this,en,null)};$a=new WeakMap;lr=function(){this.status.draftValue=Xd(this.value),Ie(this,Se,ts).call(this),Ie(this,Se,_i).call(this)};ts=function(){var a;const e=ur(this.label),t=ur(this.description),n=((a=this.validator)==null?void 0:a.call(this,this.status.draftValue))??null,s=this.status.draftValue==="",i=this.status.draftValue!==Xd(this.value);this.status.isEmpty=s,this.status.errorMessage=n,this.status.isValid=n===null,this.status.dirty=i,he(this,lt).label=e??"",he(this,lt).description=t??"",he(this,lt).errorMessage=n??"",he(this,lt).hideLabel=e===null,he(this,lt).hideDescription=t===null,he(this,lt).hideError=n===null,he(this,lt).hasError=n!==null,he(this,lt).isEmpty=s,Ie(this,Se,_i).call(this)};cr=function(){var e,t;const n=this.querySelector('[data-role="template-host"]');if(n===null)return;(e=he(this,yn))==null||e.call(this),Ve(this,yn,null),(t=he(this,qt))==null||t.call(this),Ve(this,qt,null),Ie(this,Se,Co).call(this);const s=Ie(this,Se,$o).call(this,"template");if(s===null){n.replaceChildren();return}const i=s.content.cloneNode(!0);Ve(this,yn,vi(i,he(this,lt))),n.replaceChildren(i),Ie(this,Se,Jd).call(this),Ie(this,Se,ts).call(this)};$o=function(e){return Ie(this,Se,Kd).call(this,e)??Ie(this,Se,Gd).call(this,e)??qm(e)};Kd=function(e){return e==="template"?he(this,Aa):he(this,Sa)};Gd=function(e){var n,s,i;const t=this.theme??((n=he(this,en))==null?void 0:n.theme)??xa();return no(e==="template"?(s=t.select)==null?void 0:s.template:(i=t.select)==null?void 0:i.select,this)};Jd=function(){const e=this.querySelector('[data-role="control-host"]');if(e===null)return;const t=Ie(this,Se,Yd).call(this,e);Ve(this,qt,vi(t.fragment,he(this,lt))),e.replaceChildren(t.fragment),Ve(this,Ht,t.control),Ve(this,wi,t.className),Ve(this,Wn,t.invalidClassName);const n=()=>{he(this,Ht)!==null&&(this.status.draftValue=he(this,Ht).value,Ie(this,Se,ts).call(this),Ie(this,Se,dr).call(this,"input"),Ie(this,Se,dr).call(this,"change"))};he(this,Ht).addEventListener("change",n),Ve(this,zs,()=>{var s;(s=he(this,Ht))==null||s.removeEventListener("change",n)}),Ie(this,Se,_i).call(this)};_i=function(){const e=he(this,Ht);if(e===null)return;e.replaceChildren();const t=ur(this.placeholder);if(t!==null){const i=document.createElement("option");i.value="",i.textContent=t,e.appendChild(i)}for(const i of Vm(this.items)){const a=document.createElement("option");a.value=i.value,a.textContent=i.label,a.disabled=i.disabled??!1,e.appendChild(a)}const n=Array.from(e.options).map(i=>i.value),s=n.includes(this.status.draftValue)?this.status.draftValue:t!==null?"":n[0]??"";this.status.draftValue!==s&&(this.status.draftValue=s,Ie(this,Se,ts).call(this)),e.value=s,e.id=he(this,lt).inputId,e.disabled=this.disabled,e.className=Km(he(this,wi),this.controlClassName),he(this,Wn)!==null&&!this.status.isValid&&e.classList.add(he(this,Wn)),e.toggleAttribute("aria-invalid",!this.status.isValid),e.setAttribute("aria-describedby",Hm(he(this,lt)))};Yd=function(e){const t=Ie(this,Se,$o).call(this,"select");if(t===null)return Ic(e);const n=t.content.cloneNode(!0),s=n.querySelector("select");return s===null?Ic(e):{fragment:n,control:s,className:Qd(s,e),invalidClassName:Zd(s,e)}};dr=function(e){const t={value:this.status.draftValue,isEmpty:this.status.isEmpty,isValid:this.status.isValid,errorMessage:this.status.errorMessage,dirty:this.status.dirty};this.dispatchEvent(new CustomEvent(e,{detail:t,bubbles:!0,composed:!0}))};Co=function(){var e,t;(e=he(this,zs))==null||e.call(this),Ve(this,zs,null),Ve(this,Ht,null),Ve(this,wi,""),Ve(this,Wn,null),(t=he(this,qt))==null||t.call(this),Ve(this,qt,null)};Ft(Ae,4,"label",Vd,kt,bo);Ft(Ae,4,"description",zd,kt,yo);Ft(Ae,4,"validator",Wd,kt,vo);Ft(Ae,4,"theme",Bd,kt,wo);Ft(Ae,4,"value",Ud,kt,_o);Ft(Ae,4,"placeholder",Rd,kt,xo);Ft(Ae,4,"items",Fd,kt,ko);Ft(Ae,4,"disabled",Ld,kt,Eo);Ft(Ae,4,"controlClassName",Dd,kt,Ao);kt=Ft(Ae,0,"Select",Hd,kt);Ge(Ae,1,kt);let zm=1;function Xd(e){return e??""}function ur(e){return e==null||e===""?null:e}function Vm(e){return e.map(t=>({value:t.value,label:t.label,disabled:t.disabled??!1})).filter(t=>t.label.trim()!=="")}function Hm(e){const t=[];return e.hideDescription||t.push(e.descriptionId),e.hideError||t.push(e.errorId),t.join(" ")}function Tc(e,t){const n=e.querySelector(`template[data-slot="${t}"]`);if(n===null)return null;const s=document.createElement("template");return s.content.append(n.content.cloneNode(!0)),s}function Qd(e,t){return e.className||t.getAttribute("data-control-class")||""}function Zd(e,t){return e.getAttribute("data-control-invalid-class")??t.getAttribute("data-control-invalid-class")??null}function qm(e){const t=document.createElement("template");return t.innerHTML=e==="template"?`
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
        `:"<select></select>",t}function Ic(e){const t=document.createDocumentFragment(),n=document.createElement("select");return t.append(n),{fragment:t,control:n,className:Qd(n,e),invalidClassName:Zd(n,e)}}function Km(...e){return e.flatMap(t=>t.split(/\s+/)).map(t=>t.trim()).filter(t=>t!=="").join(" ")}var Gm=Object.create,To=Object.defineProperty,Jm=Object.getOwnPropertyDescriptor,eu=(e,t)=>(t=Symbol[e])?t:Symbol.for("Symbol."+e),ns=e=>{throw TypeError(e)},Ym=(e,t,n)=>t in e?To(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,jc=(e,t)=>To(e,"name",{value:t,configurable:!0}),Xm=e=>[,,,Gm((e==null?void 0:e[eu("metadata")])??null)],tu=["class","method","getter","setter","accessor","field","value","get","set"],_s=e=>e!==void 0&&typeof e!="function"?ns("Function expected"):e,Qm=(e,t,n,s,i)=>({kind:tu[e],name:t,metadata:s,addInitializer:a=>n._?ns("Already initialized"):i.push(_s(a||null))}),Zm=(e,t)=>Ym(t,eu("metadata"),e[3]),Ce=(e,t,n,s)=>{for(var i=0,a=e[t>>1],r=a&&a.length;i<r;i++)t&1?a[i].call(n):s=a[i].call(n,s);return s},it=(e,t,n,s,i,a)=>{var r,l,m,h,y,o=t&7,k=!!(t&8),g=!!(t&16),$=o>3?e.length+1:o?k?1:2:0,te=tu[o+5],ne=o>3&&(e[$-1]=[]),X=e[$]||(e[$]=[]),_=o&&(!g&&!k&&(i=i.prototype),o<5&&(o>3||!g)&&Jm(o<4?i:{get[n](){return pe(this,a)},set[n](u){return Ee(this,a,u)}},n));o?g&&o<4&&jc(a,(o>2?"set ":o>1?"get ":"")+n):jc(i,n);for(var H=s.length-1;H>=0;H--)h=Qm(o,n,m={},e[3],X),o&&(h.static=k,h.private=g,y=h.access={has:g?u=>eg(i,u):u=>n in u},o^3&&(y.get=g?u=>(o^1?pe:$e)(u,i,o^4?a:_.get):u=>u[n]),o>2&&(y.set=g?(u,x)=>Ee(u,i,x,o^4?a:_.set):(u,x)=>u[n]=x)),l=(0,s[H])(o?o<4?g?a:_[te]:o>4?void 0:{get:_.get,set:_.set}:i,h),m._=1,o^4||l===void 0?_s(l)&&(o>4?ne.unshift(l):o?g?a=l:_[te]=l:i=l):typeof l!="object"||l===null?ns("Object expected"):(_s(r=l.get)&&(_.get=r),_s(r=l.set)&&(_.set=r),_s(r=l.init)&&ne.unshift(r));return o||Zm(e,i),_&&To(i,n,_),g?o^4?a:_:i},Io=(e,t,n)=>t.has(e)||ns("Cannot "+n),eg=(e,t)=>Object(t)!==t?ns('Cannot use the "in" operator on this value'):e.has(t),pe=(e,t,n)=>(Io(e,t,"read from private field"),n?n.call(e):t.get(e)),_e=(e,t,n)=>t.has(e)?ns("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(e):t.set(e,n),Ee=(e,t,n,s)=>(Io(e,t,"write to private field"),s?s.call(e,n):t.set(e,n),n),$e=(e,t,n)=>(Io(e,t,"access private method"),n),nu,su,iu,au,ru,ou,lu,cu,du,uu,pu,hu,fu,mu,pr,gu,Vs,Hs,qs,vn,Kt,tn,xi,ki,Ei,Ks,Gs,Js,Ns,xs,tt,ce,jo,Mo,Po,No,Oo,Do,Lo,Fo,Ro,Uo,Bo,Wo,zo,Vo,ke,bu,hr,Ho,Ca,fr,Ai,mr,qo,yu,vu,wu,Si,_u,xu,Ki,Ko;gu=[$t("asljs-text-input")];class Ze extends(pr=ht,mu=[le({attribute:!1})],fu=[le({attribute:!1})],hu=[le({attribute:!1})],pu=[le({attribute:!1})],uu=[le({attribute:!1})],du=[le({attribute:!1})],cu=[le({attribute:!1})],lu=[le({attribute:!1})],ou=[le({attribute:!1})],ru=[le({attribute:!1})],au=[le({attribute:!1})],iu=[le({attribute:!1})],su=[le({attribute:!1})],nu=[le({attribute:!1})],pr){constructor(){super(...arguments),_e(this,ke),_e(this,Vs,null),_e(this,Hs,null),_e(this,qs,null),_e(this,vn,null),_e(this,Kt,null),_e(this,tn,null),_e(this,xi,null),_e(this,ki,""),_e(this,Ei,null),_e(this,Ks,null),_e(this,Gs,null),_e(this,Js,null),_e(this,Ns,!1),_e(this,xs,`asljs-text-input-${tg++}`),_e(this,tt,ft({label:"",description:"",errorMessage:"",hideLabel:!0,hideDescription:!0,hideError:!0,hasError:!1,isEmpty:!0,multiline:!1,inputId:`${pe(this,xs)}-control`,descriptionId:`${pe(this,xs)}-description`,errorId:`${pe(this,xs)}-error`})),this.status=ft({draftValue:"",isEmpty:!0,isValid:!0,errorMessage:null,dirty:!1}),_e(this,jo,Ce(ce,8,this,null)),Ce(ce,11,this),_e(this,Mo,Ce(ce,12,this,null)),Ce(ce,15,this),_e(this,Po,Ce(ce,16,this,null)),Ce(ce,19,this),_e(this,No,Ce(ce,20,this,null)),Ce(ce,23,this),_e(this,Oo,Ce(ce,24,this,"")),Ce(ce,27,this),_e(this,Do,Ce(ce,28,this,null)),Ce(ce,31,this),_e(this,Lo,Ce(ce,32,this,"text")),Ce(ce,35,this),_e(this,Fo,Ce(ce,36,this,"")),Ce(ce,39,this),_e(this,Ro,Ce(ce,40,this,!1)),Ce(ce,43,this),_e(this,Uo,Ce(ce,44,this,!1)),Ce(ce,47,this),_e(this,Bo,Ce(ce,48,this,null)),Ce(ce,51,this),_e(this,Wo,Ce(ce,52,this,"finish")),Ce(ce,55,this),_e(this,zo,Ce(ce,56,this,!1)),Ce(ce,59,this),_e(this,Vo,Ce(ce,60,this,3)),Ce(ce,63,this),_e(this,Ca,()=>{$e(this,ke,mr).call(this)})}get draftValue(){return this.status.draftValue}get isEmpty(){return this.status.isEmpty}get isValid(){return this.status.isValid}get errorMessage(){return this.status.errorMessage}createRenderRoot(){return this}connectedCallback(){super.connectedCallback(),$e(this,ke,bu).call(this),$e(this,ke,hr).call(this),$e(this,ke,fr).call(this)}disconnectedCallback(){var t,n;$e(this,ke,Ko).call(this),(t=pe(this,vn))==null||t.call(this),Ee(this,vn,null),(n=pe(this,Kt))==null||n.call(this),Ee(this,Kt,null),$e(this,ke,Ho).call(this),super.disconnectedCallback()}render(){return Le`
      <div data-role="template-host"></div>
    `}updated(t){if(t.has("theme")&&$e(this,ke,hr).call(this),t.has("value")&&$e(this,ke,fr).call(this),t.has("label")||t.has("description")||t.has("multiline")||t.has("theme")){$e(this,ke,mr).call(this);return}(t.has("placeholder")||t.has("inputType")||t.has("controlClassName")||t.has("disabled")||t.has("rows")||t.has("autoExtend")||t.has("autoExtendMaxRows")||t.has("enterKeyBehavior"))&&$e(this,ke,Si).call(this),$e(this,ke,Ai).call(this)}}ce=Xm(pr);Vs=new WeakMap;Hs=new WeakMap;qs=new WeakMap;vn=new WeakMap;Kt=new WeakMap;tn=new WeakMap;xi=new WeakMap;ki=new WeakMap;Ei=new WeakMap;Ks=new WeakMap;Gs=new WeakMap;Js=new WeakMap;Ns=new WeakMap;xs=new WeakMap;tt=new WeakMap;jo=new WeakMap;Mo=new WeakMap;Po=new WeakMap;No=new WeakMap;Oo=new WeakMap;Do=new WeakMap;Lo=new WeakMap;Fo=new WeakMap;Ro=new WeakMap;Uo=new WeakMap;Bo=new WeakMap;Wo=new WeakMap;zo=new WeakMap;Vo=new WeakMap;ke=new WeakSet;bu=function(){Ee(this,Vs,null),Ee(this,Hs,null),Ee(this,qs,null),Ee(this,Vs,Ja(this,"template")),Ee(this,Hs,Ja(this,"input")),Ee(this,qs,Ja(this,"textarea"))};hr=function(){$e(this,ke,Ho).call(this),Ee(this,tn,ka(this)),pe(this,tn)!==null&&pe(this,tn).addEventListener(Yt,pe(this,Ca))};Ho=function(){var e;(e=pe(this,tn))==null||e.removeEventListener(Yt,pe(this,Ca)),Ee(this,tn,null)};Ca=new WeakMap;fr=function(){const e=ku(this.value);this.status.draftValue=e,$e(this,ke,Ai).call(this),$e(this,ke,Si).call(this)};Ai=function(){var a;const e=gr(this.label),t=gr(this.description),n=((a=this.validator)==null?void 0:a.call(this,this.status.draftValue))??null,s=this.status.draftValue==="",i=this.status.draftValue!==ku(this.value);this.status.isEmpty=s,this.status.errorMessage=n,this.status.isValid=n===null,this.status.dirty=i,pe(this,tt).label=e??"",pe(this,tt).description=t??"",pe(this,tt).errorMessage=n??"",pe(this,tt).hideLabel=e===null,pe(this,tt).hideDescription=t===null,pe(this,tt).hideError=n===null,pe(this,tt).hasError=n!==null,pe(this,tt).isEmpty=s,pe(this,tt).multiline=this.multiline,$e(this,ke,Si).call(this)};mr=function(){var e,t;const n=this.querySelector('[data-role="template-host"]');if(n===null)return;(e=pe(this,vn))==null||e.call(this),Ee(this,vn,null),(t=pe(this,Kt))==null||t.call(this),Ee(this,Kt,null),$e(this,ke,Ko).call(this);const s=$e(this,ke,qo).call(this,"template");if(s===null){n.replaceChildren();return}const i=s.content.cloneNode(!0);Ee(this,vn,vi(i,pe(this,tt))),n.replaceChildren(i),$e(this,ke,wu).call(this),$e(this,ke,Ai).call(this)};qo=function(e){return $e(this,ke,yu).call(this,e)??$e(this,ke,vu).call(this,e)??ig()};yu=function(e){switch(e){case"template":return pe(this,Vs);case"input":return pe(this,Hs);case"textarea":return pe(this,qs)}};vu=function(e){var n,s,i,a;const t=this.theme??((n=pe(this,tn))==null?void 0:n.theme)??xa();return no(e==="template"?(s=t.textInput)==null?void 0:s.template:e==="input"?(i=t.textInput)==null?void 0:i.input:(a=t.textInput)==null?void 0:a.textarea,this)};wu=function(){const e=this.querySelector('[data-role="control-host"]');if(e===null)return;const t=$e(this,ke,_u).call(this,e),n=t.control;Ee(this,Kt,vi(t.fragment,pe(this,tt))),e.replaceChildren(t.fragment),Ee(this,xi,n),Ee(this,ki,t.className),Ee(this,Ei,t.invalidClassName);const s=()=>{this.status.draftValue=n.value,$e(this,ke,Ai).call(this),$e(this,ke,Ki).call(this,"input")},i=()=>{if(pe(this,Ns)){Ee(this,Ns,!1);return}$e(this,ke,Ki).call(this,"change")},a=r=>{const l=r;l.key==="Enter"&&(this.multiline&&!l.ctrlKey&&!l.metaKey&&this.enterKeyBehavior==="newline"||(l.preventDefault(),Ee(this,Ns,!0),$e(this,ke,Ki).call(this,"change"),n.blur()))};n.addEventListener("input",s),n.addEventListener("blur",i),n.addEventListener("keydown",a),Ee(this,Ks,()=>{n.removeEventListener("input",s)}),Ee(this,Gs,()=>{n.removeEventListener("blur",i)}),Ee(this,Js,()=>{n.removeEventListener("keydown",a)}),$e(this,ke,Si).call(this)};Si=function(){const e=pe(this,xi);if(e===null)return;e.value!==this.status.draftValue&&(e.value=this.status.draftValue),e.id=pe(this,tt).inputId,e.placeholder=gr(this.placeholder)??"",e.disabled=this.disabled,e.className=lg(pe(this,ki),this.controlClassName);const t=pe(this,Ei);if(e instanceof HTMLInputElement&&(e.type=this.inputType),t!==null&&!this.status.isValid&&e.classList.add(t),e.toggleAttribute("aria-invalid",!this.status.isValid),e.setAttribute("aria-describedby",ng(pe(this,tt))),this.multiline&&e instanceof HTMLTextAreaElement){e.rows=Math.max(1,this.rows),$e(this,ke,xu).call(this,e);return}e.style.height="",e.style.overflowY=""};_u=function(e){const t=this.multiline?"textarea":"input",n=$e(this,ke,qo).call(this,t);if(n===null)return Mc(this.multiline,e);const s=n.content.cloneNode(!0),i=this.multiline?s.querySelector("textarea"):s.querySelector("input");return i===null?Mc(this.multiline,e):{fragment:s,control:i,className:br(i,e),invalidClassName:yr(i,e)}};xu=function(e){if(!this.autoExtend){e.style.height="",e.style.overflowY="";return}e.style.height="auto";const t=sg(e,this.autoExtendMaxRows),n=t===null?e.scrollHeight:Math.min(e.scrollHeight,t);e.style.height=`${n}px`,e.style.overflowY=t!==null&&e.scrollHeight>t?"auto":"hidden"};Ki=function(e){const t={value:this.status.draftValue,isEmpty:this.status.isEmpty,isValid:this.status.isValid,errorMessage:this.status.errorMessage,dirty:this.status.dirty};this.dispatchEvent(new CustomEvent(e,{detail:t,bubbles:!0,composed:!0}))};Ko=function(){var e,t,n,s;(e=pe(this,Ks))==null||e.call(this),(t=pe(this,Gs))==null||t.call(this),(n=pe(this,Js))==null||n.call(this),Ee(this,Ks,null),Ee(this,Gs,null),Ee(this,Js,null),Ee(this,xi,null),Ee(this,ki,""),Ee(this,Ei,null),(s=pe(this,Kt))==null||s.call(this),Ee(this,Kt,null)};it(ce,4,"label",mu,Ze,jo);it(ce,4,"description",fu,Ze,Mo);it(ce,4,"validator",hu,Ze,Po);it(ce,4,"theme",pu,Ze,No);it(ce,4,"value",uu,Ze,Oo);it(ce,4,"placeholder",du,Ze,Do);it(ce,4,"inputType",cu,Ze,Lo);it(ce,4,"controlClassName",lu,Ze,Fo);it(ce,4,"multiline",ou,Ze,Ro);it(ce,4,"autoExtend",ru,Ze,Uo);it(ce,4,"autoExtendMaxRows",au,Ze,Bo);it(ce,4,"enterKeyBehavior",iu,Ze,Wo);it(ce,4,"disabled",su,Ze,zo);it(ce,4,"rows",nu,Ze,Vo);Ze=it(ce,0,"TextInput",gu,Ze);Ce(ce,1,Ze);let tg=1;function ku(e){return e??""}function gr(e){return e==null||e===""?null:e}function ng(e){const t=[];return e.hideDescription||t.push(e.descriptionId),e.hideError||t.push(e.errorId),t.join(" ")}function sg(e,t){if(t===null||t<=0)return null;const n=getComputedStyle(e),s=parseFloat(n.lineHeight);if(!Number.isFinite(s)||s<=0)return null;const i=parseFloat(n.borderTopWidth)||0,a=parseFloat(n.borderBottomWidth)||0,r=parseFloat(n.paddingTop)||0,l=parseFloat(n.paddingBottom)||0;return s*t+r+l+i+a}function Ja(e,t){const n=e.querySelector(`template[data-slot="${t}"]`);if(n===null)return null;const s=document.createElement("template");return s.content.append(n.content.cloneNode(!0)),s}function br(e,t){return e.className||t.getAttribute("data-control-class")||""}function yr(e,t){return e.getAttribute("data-control-invalid-class")??t.getAttribute("data-control-invalid-class")??null}function ig(){const e=document.createElement("template");return e.innerHTML=`
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
    `,e}function ag(){const e=document.createElement("input");return e.type="text",e}function rg(){const e=document.createElement("template");return e.innerHTML='<input type="text">',e}function og(){const e=document.createElement("template");return e.innerHTML="<textarea></textarea>",e}function Mc(e,t){const n=document.createDocumentFragment(),i=(e?og():rg()).content.cloneNode(!0),a=e?i.querySelector("textarea"):i.querySelector("input");if(a===null){const r=e?document.createElement("textarea"):ag();return n.append(r),{fragment:n,control:r,className:br(r,t),invalidClassName:yr(r,t)}}return n.append(i),{fragment:n,control:a,className:br(a,t),invalidClassName:yr(a,t)}}function lg(...e){return e.flatMap(t=>t.split(/\s+/)).map(t=>t.trim()).filter(t=>t!=="").join(" ")}var cg=Object.create,Go=Object.defineProperty,dg=Object.getOwnPropertyDescriptor,Eu=(e,t)=>(t=Symbol[e])?t:Symbol.for("Symbol."+e),ss=e=>{throw TypeError(e)},ug=(e,t,n)=>t in e?Go(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,Pc=(e,t)=>Go(e,"name",{value:t,configurable:!0}),pg=e=>[,,,cg((e==null?void 0:e[Eu("metadata")])??null)],Au=["class","method","getter","setter","accessor","field","value","get","set"],ks=e=>e!==void 0&&typeof e!="function"?ss("Function expected"):e,hg=(e,t,n,s,i)=>({kind:Au[e],name:t,metadata:s,addInitializer:a=>n._?ss("Already initialized"):i.push(ks(a||null))}),fg=(e,t)=>ug(t,Eu("metadata"),e[3]),vr=(e,t,n,s)=>{for(var i=0,a=e[t>>1],r=a&&a.length;i<r;i++)t&1?a[i].call(n):s=a[i].call(n,s);return s},Su=(e,t,n,s,i,a)=>{var r,l,m,h,y,o=t&7,k=!!(t&8),g=!!(t&16),$=o>3?e.length+1:o?k?1:2:0,te=Au[o+5],ne=o>3&&(e[$-1]=[]),X=e[$]||(e[$]=[]),_=o&&(!g&&!k&&(i=i.prototype),o<5&&(o>3||!g)&&dg(o<4?i:{get[n](){return oe(this,a)},set[n](u){return wt(this,a,u)}},n));o?g&&o<4&&Pc(a,(o>2?"set ":o>1?"get ":"")+n):Pc(i,n);for(var H=s.length-1;H>=0;H--)h=hg(o,n,m={},e[3],X),o&&(h.static=k,h.private=g,y=h.access={has:g?u=>mg(i,u):u=>n in u},o^3&&(y.get=g?u=>(o^1?oe:Je)(u,i,o^4?a:_.get):u=>u[n]),o>2&&(y.set=g?(u,x)=>wt(u,i,x,o^4?a:_.set):(u,x)=>u[n]=x)),l=(0,s[H])(o?o<4?g?a:_[te]:o>4?void 0:{get:_.get,set:_.set}:i,h),m._=1,o^4||l===void 0?ks(l)&&(o>4?ne.unshift(l):o?g?a=l:_[te]=l:i=l):typeof l!="object"||l===null?ss("Object expected"):(ks(r=l.get)&&(_.get=r),ks(r=l.set)&&(_.set=r),ks(r=l.init)&&ne.unshift(r));return o||fg(e,i),_&&Go(i,n,_),g?o^4?a:_:i},Jo=(e,t,n)=>t.has(e)||ss("Cannot "+n),mg=(e,t)=>Object(t)!==t?ss('Cannot use the "in" operator on this value'):e.has(t),oe=(e,t,n)=>(Jo(e,t,"read from private field"),n?n.call(e):t.get(e)),ut=(e,t,n)=>t.has(e)?ss("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(e):t.set(e,n),wt=(e,t,n,s)=>(Jo(e,t,"write to private field"),s?s.call(e,n):t.set(e,n),n),Je=(e,t,n)=>(Jo(e,t,"access private method"),n),gg=(e,t,n,s)=>({set _(i){wt(e,t,i,n)},get _(){return oe(e,t,s)}}),$u,wr,Cu,Ys,Ue,_t,Os,zn,Xs,Vn,Yo,je,_r,Xo,Tu,Ta,na,Qo,sa,xr,kr,Er,Ar,Iu,Gi,jt;const bg=24,yg="gpt-4.1-mini",vg="OpenAI API key is not configured.",Nc=6,wg=12,ju=new WeakMap;var bi;class Sr{constructor(t){hs(this,bi);Ba(this,bi,t)}async postRequest(t){const n=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${Li(this,bi)}`},body:JSON.stringify(t)});if(!n.ok){const s=await n.text();throw new Error(`OpenAI request failed: ${n.status} ${s}`)}return await n.json()}}bi=new WeakMap;function Mu(e={}){const t=Pu(e.choicePrompt),n=Nu(e.progress),s=_g(e.messages),i=ft({messages:s,promptDraft:e.promptDraft??"",messagesScrollTop:e.messagesScrollTop??0,hasMessagesScrollTop:e.hasMessagesScrollTop??!1,missingKeyMessageShown:e.missingKeyMessageShown??!1,lastResponseId:e.lastResponseId??null,choicePrompt:t===void 0?null:{message:t.message,options:t.options.map(a=>({value:a.value,label:a.label}))},progress:n===void 0?null:{message:n.message,visible:n.visible},sending:e.sending===!0});return ju.set(i,{behavior:(t==null?void 0:t.behavior)??"resolve",resolver:null}),Object.defineProperties(i,{appendMessage:Pn((a,r)=>{i.messages.save(a,r)}),clearMessages:Pn(()=>{i.messages.clear(),i.lastResponseId=null}),clearProgress:Pn(()=>{i.progress=null}),dismissChoices:Pn(()=>{aa(i,null)}),presentChoices:Pn(async(a,r,l="resolve")=>{const m=kg(r);if(aa(i,null),m.length===0)return i.choicePrompt=null,null;i.choicePrompt={message:a,options:m};const h=Hn(i);return h.behavior=l,l==="send"?(h.resolver=null,null):new Promise(y=>{h.resolver=y})}),setProgress:Pn((a,r=!0)=>{i.progress=r?{message:a,visible:!0}:null})}),i}function _g(e){const t=ft((e??[]).map(n=>({role:n.role,content:n.content})));return{list:t,read:()=>t,save:(n,s)=>{t.push({role:n,content:s})},clear:()=>{t.splice(0,t.length)},toResponsesInput:()=>t.filter(n=>n.role==="user"||n.role==="assistant").slice(-24).map(n=>({role:n.role,content:n.content}))}}function xg(e){const t=e.choicePrompt,n=e.progress;return{messages:e.messages.read().map(s=>({role:s.role,content:s.content})),promptDraft:e.promptDraft,messagesScrollTop:e.messagesScrollTop,hasMessagesScrollTop:e.hasMessagesScrollTop,missingKeyMessageShown:e.missingKeyMessageShown,lastResponseId:e.lastResponseId,choicePrompt:t===null?null:{message:t.message,options:t.options.map(s=>({value:s.value,label:s.label})),behavior:Hn(e).behavior},progress:n===null?null:{message:n.message,visible:n.visible},sending:e.sending}}Cu=[$t("asljs-ai-chat")];class ia extends(wr=ht,$u=[le({attribute:!1})],wr){constructor(){super(...arguments),ut(this,je),ut(this,Ys,null),ut(this,Ue,Mu()),ut(this,_t,()=>{}),ut(this,Os,0),ut(this,zn,!1),ut(this,Xs,!1),ut(this,Yo,vr(Vn,8,this,null)),vr(Vn,11,this),ut(this,sa,()=>{const t=oe(this,je,Ta);t!==null&&(oe(this,Ue).messagesScrollTop=t.scrollTop,oe(this,Ue).hasMessagesScrollTop=!0,oe(this,_t).call(this))}),ut(this,xr,()=>{var t;oe(this,Ue).promptDraft=((t=oe(this,je,na))==null?void 0:t.draftValue)??"",oe(this,_t).call(this)}),ut(this,kr,t=>{const n=t;n.key!=="Enter"||n.shiftKey||n.ctrlKey||n.metaKey||(n.preventDefault(),Je(this,je,Gi).call(this))}),ut(this,Er,()=>{Je(this,je,Gi).call(this)}),ut(this,Ar,()=>{var i;const t=(((i=oe(this,je,Qo))==null?void 0:i.value)??"").trim();if(t==="")return;const s=Hn(oe(this,Ue)).behavior;aa(oe(this,Ue),s==="resolve"?t:null),oe(this,_t).call(this),s==="send"&&Je(this,je,Gi).call(this,t)})}get messages(){return oe(this,Ue).messages}set messages(t){Je(this,je,jt).call(this,"messages",t)}get promptDraft(){return oe(this,Ue).promptDraft}set promptDraft(t){Je(this,je,jt).call(this,"promptDraft",t)}get messagesScrollTop(){return oe(this,Ue).messagesScrollTop}set messagesScrollTop(t){Je(this,je,jt).call(this,"messagesScrollTop",t)}get hasMessagesScrollTop(){return oe(this,Ue).hasMessagesScrollTop}set hasMessagesScrollTop(t){Je(this,je,jt).call(this,"hasMessagesScrollTop",t)}get missingKeyMessageShown(){return oe(this,Ue).missingKeyMessageShown}set missingKeyMessageShown(t){Je(this,je,jt).call(this,"missingKeyMessageShown",t)}get lastResponseId(){return oe(this,Ue).lastResponseId}set lastResponseId(t){Je(this,je,jt).call(this,"lastResponseId",t)}get choicePrompt(){return oe(this,Ue).choicePrompt}set choicePrompt(t){Je(this,je,jt).call(this,"choicePrompt",t)}get progress(){return oe(this,Ue).progress}set progress(t){Je(this,je,jt).call(this,"progress",t)}get sending(){return oe(this,Ue).sending}set sending(t){Je(this,je,jt).call(this,"sending",t)}createRenderRoot(){return this}connectedCallback(){super.connectedCallback(),Je(this,je,_r).call(this)}disconnectedCallback(){Je(this,je,Xo).call(this),super.disconnectedCallback()}updated(t){t.has("options")&&Je(this,je,_r).call(this),Je(this,je,Tu).call(this)}render(){const t=oe(this,Ue),n=t.progress,s=t.choicePrompt;return Le`
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
               @scroll=${oe(this,sa)}
               style="display:flex;
                      flex-direction:column;
                      gap:0.75rem;
                      flex:1 1 auto;
                      overflow:auto;">
            ${t.messages.read().map(i=>{var a;return Le`
                  <div class=${`asljs-ai-chat-message asljs-ai-chat-message-${i.role}`}>
                    <div class="asljs-ai-chat-role">
                      ${i.role==="user"?"You":i.role==="assistant"?"AI":"System"}
                    </div>
                    <div class="asljs-ai-chat-bubble">
                      ${i.role==="assistant"?to(Dg(i.content,(a=this.options)==null?void 0:a.renderAssistantMessage)):i.content}
                    </div>
                  </div>
                `})}
          </div>
          <div class="asljs-ai-chat-progress"
               data-role="progress"
               style=${n===null||!n.visible?"display:none;":""}>
            ${(n==null?void 0:n.message)??""}
          </div>
          <div class="asljs-ai-chat-choice-panel"
               data-role="choices"
               style=${s===null||s.message.trim()===""||s.options.length===0?"display:none;":""}>
            ${s===null||s.message.trim()===""||s.options.length===0?De:Le`
                    <div class="asljs-ai-chat-choice-message">
                      ${s.message}
                    </div>
                    <div class="asljs-ai-chat-choice-options">
                      <asljs-select
                          data-role="choice-select"
                          .items=${s.options}
                          .value=${Je(this,je,Iu).call(this,s)}
                          .placeholder=${null}
                          .label=${null}
                          .disabled=${t.sending}
                          .controlClassName=${"asljs-ai-chat-select"}>
                      </asljs-select>
                      <asljs-button
                          data-role="choice-submit"
                          .type=${"button"}
                          .text=${Hn(t).behavior==="send"?"Send":"Choose"}
                          .disabled=${t.sending}
                          .buttonClassName=${"asljs-ai-chat-button asljs-ai-chat-choice-submit"}
                          @click=${oe(this,Ar)}>
                      </asljs-button>
                    </div>
                  `}
          </div>
        </div>
        <asljs-text-input
            data-role="prompt"
            .value=${t.promptDraft}
            .multiline=${!0}
            .rows=${3}
            .placeholder=${"Ask AI..."}
            .enterKeyBehavior=${"newline"}
            .disabled=${t.sending}
            .controlClassName=${"asljs-ai-chat-input"}
            @input=${oe(this,xr)}
            @keydown=${oe(this,kr)}>
        </asljs-text-input>
        <div class="asljs-ai-chat-actions"
             style="display:flex;
                    justify-content:flex-end;">
          <asljs-button
              data-role="send"
              .type=${"button"}
              .text=${"Send"}
              .disabled=${t.sending}
              .buttonClassName=${"asljs-ai-chat-button asljs-ai-chat-send"}
              @click=${oe(this,Er)}>
          </asljs-button>
        </div>
      </div>
    `}}Vn=pg(wr);Ys=new WeakMap;Ue=new WeakMap;_t=new WeakMap;Os=new WeakMap;zn=new WeakMap;Xs=new WeakMap;Yo=new WeakMap;je=new WeakSet;_r=async function(){const e=oe(this,Ue),t=this.options,n=(t==null?void 0:t.stateStore)??Cg(Sg(this)),s=++gg(this,Os)._;Je(this,je,Xo).call(this),wt(this,_t,Ag(e,n)),!(n&&(Eg(e,await n.load()),s!==oe(this,Os)))&&(wt(this,Ys,Ig(e,()=>{wt(this,zn,!0),this.requestUpdate()},()=>{this.requestUpdate()},()=>{this.requestUpdate()},()=>{this.requestUpdate()},oe(this,_t))),await e.emitAsync("initialize",{model:e}),s===oe(this,Os)&&(wt(this,zn,!0),this.requestUpdate()))};Xo=function(){var e;(e=oe(this,Ys))==null||e.dispose(),wt(this,Ys,null),wt(this,_t,()=>{})};Tu=function(){const e=oe(this,je,Ta);if(e!==null){if(oe(this,Xs)){wt(this,Xs,!1),e.scrollTop=e.scrollHeight,oe(this,sa).call(this);return}oe(this,zn)&&(wt(this,zn,!1),oe(this,Ue).hasMessagesScrollTop&&(e.scrollTop=oe(this,Ue).messagesScrollTop))}};Ta=function(){return this.querySelector('[data-role="messages"]')};na=function(){return this.querySelector('[data-role="prompt"]')};Qo=function(){return this.querySelector('[data-role="choice-select"]')};sa=new WeakMap;xr=new WeakMap;kr=new WeakMap;Er=new WeakMap;Ar=new WeakMap;Iu=function(e){var n,s;const t=(((n=oe(this,je,Qo))==null?void 0:n.value)??"").trim();return e.options.some(i=>i.value===t)?t:((s=e.options[0])==null?void 0:s.value)??""};Gi=async function(e){var o,k,g;const t=this.options,n=oe(this,Ue);if(t===null)return;const s=(e??((o=oe(this,je,na))==null?void 0:o.draftValue)??((k=oe(this,je,na))==null?void 0:k.value)??"").trim();if(s===""||n.sending)return;let i=t.transport??null;if(i===null){const $=(await t.provider.getOpenAiApiKey()).trim();if($===""){n.missingKeyMessageShown||(n.appendMessage("system",t.missingKeyMessage??vg),n.missingKeyMessageShown=!0,oe(this,_t).call(this));return}i=new Sr($)}const a=(await t.provider.getChatModel()).trim()||yg,r=await t.getRequestContext(),l=jg(n,s,r,a);if(await n.emitAsync("beforeSend",l),l.canceled){l.cancelMessage!==null&&l.cancelMessage!==""&&n.appendMessage("system",l.cancelMessage),oe(this,_t).call(this);return}const m=oe(this,je,Ta),y=(m===null?0:m.scrollHeight-(m.scrollTop+m.clientHeight))<=bg;n.appendMessage("user",s),n.promptDraft="",n.sending=!0,n.dismissChoices(),y&&wt(this,Xs,!0),oe(this,_t).call(this);try{n.setProgress("Requesting assistant response...");const $=await t.buildRequestInput({model:n,prompt:s,messages:n.messages,requestContext:r,chatModel:a}),te=await Mg(i,a,$,((g=t.getTools)==null?void 0:g.call(t))??[],n,t.executeTool,t.getToolsContext?await t.getToolsContext():void 0,t.provider,t.toolStepExtension??wg,n.lastResponseId),ne=te.text;n.appendMessage("assistant",ne),n.lastResponseId=te.responseId,await n.emitAsync("afterResponse",{model:n,prompt:s,responseText:ne,requestContext:r,requestInput:$,chatModel:a})}catch($){n.appendMessage("system",`Failed to send message: ${String($)}`)}finally{n.sending=!1,n.clearProgress(),oe(this,_t).call(this)}};jt=function(e,t){const n=oe(this,Ue);Object.is(n[e],t)||(n[e]=t,this.requestUpdate())};Su(Vn,4,"options",$u,ia,Yo);ia=Su(Vn,0,"AiChat",Cu,ia);vr(Vn,1,ia);function Pn(e){return{value:e,enumerable:!1,configurable:!0,writable:!0}}function kg(e){return e.map(t=>typeof t=="string"?{value:t,label:t}:{value:t.value,label:t.label}).filter(t=>t.value.trim()!==""&&t.label.trim()!=="")}function aa(e,t){const n=Hn(e),s=n.resolver;e.choicePrompt=null,n.resolver=null,n.behavior="resolve",s==null||s(t)}function Hn(e){const t=ju.get(e);if(t===void 0)throw new Error("AI chat model internal state is missing.");return t}function Eg(e,t){if(Array.isArray(t.messages)&&e.messages.list.splice(0,e.messages.list.length,...t.messages.map(n=>({role:n.role,content:n.content}))),typeof t.promptDraft=="string"&&(e.promptDraft=t.promptDraft),typeof t.messagesScrollTop=="number"&&(e.messagesScrollTop=t.messagesScrollTop),typeof t.hasMessagesScrollTop=="boolean"&&(e.hasMessagesScrollTop=t.hasMessagesScrollTop),typeof t.missingKeyMessageShown=="boolean"&&(e.missingKeyMessageShown=t.missingKeyMessageShown),typeof t.lastResponseId=="string"?e.lastResponseId=t.lastResponseId:t.lastResponseId===null&&(e.lastResponseId=null),t.choicePrompt===null)aa(e,null);else if(t.choicePrompt!==void 0){const n=Hn(e);n.resolver=null,n.behavior=t.choicePrompt.behavior,e.choicePrompt={message:t.choicePrompt.message,options:t.choicePrompt.options.map(s=>({value:s.value,label:s.label}))}}t.progress===null?e.progress=null:t.progress!==void 0&&(e.progress={message:t.progress.message,visible:t.progress.visible}),typeof t.sending=="boolean"&&(e.sending=t.sending)}function Ag(e,t){if(t===void 0)return()=>{};let n=!1;return()=>{n||(n=!0,queueMicrotask(()=>{n=!1,t.save(xg(e))}))}}function Sg(e){const t=typeof location<"u"&&location!==null&&typeof location.pathname=="string"?encodeURIComponent(location.pathname):"",n=e.id.trim()!==""?encodeURIComponent(e.id.trim()):`default-${$g(e)}`;return`asljs-ai-chat:${t}:${n}`}function $g(e){if(typeof document>"u")return 0;const n=[...document.querySelectorAll("asljs-ai-chat")].indexOf(e);return n>=0?n:0}function Cg(e){if(!(typeof sessionStorage>"u"))return{load:async()=>{try{const t=sessionStorage.getItem(e);return!t||t.trim()===""?{}:Tg(JSON.parse(t))}catch{return{}}},save:async t=>{sessionStorage.setItem(e,JSON.stringify(t))}}}function Tg(e){if(!e||typeof e!="object")return{};const t=e;return{messages:Array.isArray(t.messages)?t.messages.filter(n=>!!n&&typeof n=="object"&&(n.role==="user"||n.role==="assistant"||n.role==="system")&&typeof n.content=="string").map(n=>({role:n.role,content:n.content})):void 0,promptDraft:typeof t.promptDraft=="string"?t.promptDraft:void 0,messagesScrollTop:typeof t.messagesScrollTop=="number"?t.messagesScrollTop:void 0,hasMessagesScrollTop:typeof t.hasMessagesScrollTop=="boolean"?t.hasMessagesScrollTop:void 0,missingKeyMessageShown:typeof t.missingKeyMessageShown=="boolean"?t.missingKeyMessageShown:void 0,lastResponseId:typeof t.lastResponseId=="string"||t.lastResponseId===null?t.lastResponseId:void 0,choicePrompt:t.choicePrompt===null?null:Pu(t.choicePrompt),progress:t.progress===null?null:Nu(t.progress),sending:typeof t.sending=="boolean"?t.sending:void 0}}function Pu(e){if(!e||typeof e!="object")return;const t=e;if(typeof t.message!="string"||!Array.isArray(t.options))return;const n=t.behavior==="resolve"||t.behavior==="send"?t.behavior:void 0;if(n===void 0)return;const s=t.options.filter(i=>!!i&&typeof i=="object"&&typeof i.value=="string"&&typeof i.label=="string").map(i=>({value:i.value,label:i.label})).filter(i=>i.value.trim()!==""&&i.label.trim()!=="");return{message:t.message,options:s,behavior:n}}function Nu(e){if(!e||typeof e!="object")return;const t=e;if(!(typeof t.message!="string"||typeof t.visible!="boolean"))return{message:t.message,visible:t.visible}}function Ig(e,t,n,s,i,a){const r=[];let l=[];const m=()=>{const h=e.messages.list;for(const y of l)y();l=[h.on("set",()=>{t(),a()}),h.on("delete",()=>{t(),a()}),h.on("define",()=>{t(),a()})]};return m(),r.push(e.on("set:messages",()=>{m(),t(),a()}),e.on("set:progress",()=>{n(),a()}),e.on("set:choicePrompt",()=>{s(),a()}),e.on("set:promptDraft",()=>{a()}),e.on("set:missingKeyMessageShown",()=>{a()}),e.on("set:messagesScrollTop",()=>{a()}),e.on("set:hasMessagesScrollTop",()=>{a()}),e.on("set:lastResponseId",()=>{a()}),e.on("set:sending",()=>{i(),a()})),{dispose:()=>{for(const h of l)h();for(const h of r)h()}}}function jg(e,t,n,s){const i={model:e,prompt:t,requestContext:n,chatModel:s,apiKey:"",canceled:!1,cancelMessage:null,cancel:a=>{i.canceled=!0,i.cancelMessage=typeof a=="string"?a:null}};return i}async function Mg(e,t,n,s,i,a,r,l,m,h){const y={model:t,input:n,tools:s};h&&(y.previous_response_id=h);let o=await e.postRequest(y),k=await Pg(l),g=0;for(;;){const te=(Array.isArray(o.output)?o.output:[]).filter(_=>Og(_));if(te.length===0)return i.setProgress(`Completed in ${g} step(s).`),{text:Lg(o),responseId:typeof o.id=="string"?o.id:null};if(a===void 0)throw new Error("Response requested function tools, but no executeTool callback was provided.");if(g>=k){if(!await Ng(i,g,k,m))throw new Error("AI exceeded the current tool step limit.");k+=m}const ne=g+1;i.setProgress(`Step ${ne}: running ${te.length} tool call(s)...`);const X=[];for(const _ of te)try{const H=await a(String(_.name??""),String(_.arguments??""),r);X.push({type:"function_call_output",call_id:_.call_id,output:typeof H=="string"?H:JSON.stringify(H)})}catch(H){X.push({type:"function_call_output",call_id:_.call_id,output:JSON.stringify({error:String(H)})})}i.setProgress(`Step ${ne}: submitting ${X.length} tool result(s)...`),o=await e.postRequest({model:t,previous_response_id:o.id,input:X,tools:s}),g+=1}}async function Pg(e){var s;const t=await((s=e.getInitialToolStepLimit)==null?void 0:s.call(e))??null;if(!Number.isFinite(t))return Nc;const n=Math.floor(t);return n>=1?n:Nc}async function Ng(e,t,n,s){const i={model:e,stepsCompleted:t,stepLimit:n,extension:s,approved:null,approve:()=>{i.approved=!0},deny:()=>{i.approved=!1}};return await e.emitAsync("toolStepLimit",i),i.approved!==null?i.approved:await e.presentChoices(`AI reached the current tool step limit (${n}). Extend by ${s} more step(s)?`,[{value:"extend",label:"Extend"},{value:"stop",label:"Stop"}],"resolve")==="extend"}function Og(e){return!e||typeof e!="object"?!1:e.type==="function_call"}function Dg(e,t){if(!t)return Oc(e);try{return t(e)}catch{return Oc(e)}}function Oc(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function Lg(e){if(typeof e.output_text=="string"&&e.output_text!=="")return e.output_text;const t=Array.isArray(e.output)?e.output:[];for(const n of t){if(!n||typeof n!="object"||n.type!=="message")continue;const i=(Array.isArray(n.content)?n.content:[]).filter(a=>!!a&&typeof a=="object"&&(a.type==="output_text"||a.type==="text")).map(a=>a.text).filter(a=>typeof a=="string");if(i.length>0)return i.join(`
`)}return"No response text returned."}var Fg=Object.create,Zo=Object.defineProperty,Rg=Object.getOwnPropertyDescriptor,Ou=(e,t)=>(t=Symbol[e])?t:Symbol.for("Symbol."+e),is=e=>{throw TypeError(e)},Ug=(e,t,n)=>t in e?Zo(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,Dc=(e,t)=>Zo(e,"name",{value:t,configurable:!0}),Bg=e=>[,,,Fg((e==null?void 0:e[Ou("metadata")])??null)],Du=["class","method","getter","setter","accessor","field","value","get","set"],Es=e=>e!==void 0&&typeof e!="function"?is("Function expected"):e,Wg=(e,t,n,s,i)=>({kind:Du[e],name:t,metadata:s,addInitializer:a=>n._?is("Already initialized"):i.push(Es(a||null))}),zg=(e,t)=>Ug(t,Ou("metadata"),e[3]),Vt=(e,t,n,s)=>{for(var i=0,a=e[t>>1],r=a&&a.length;i<r;i++)t&1?a[i].call(n):s=a[i].call(n,s);return s},$i=(e,t,n,s,i,a)=>{var r,l,m,h,y,o=t&7,k=!!(t&8),g=!!(t&16),$=o>3?e.length+1:o?k?1:2:0,te=Du[o+5],ne=o>3&&(e[$-1]=[]),X=e[$]||(e[$]=[]),_=o&&(!g&&!k&&(i=i.prototype),o<5&&(o>3||!g)&&Rg(o<4?i:{get[n](){return ra(this,a)},set[n](u){return Lc(this,a,u)}},n));o?g&&o<4&&Dc(a,(o>2?"set ":o>1?"get ":"")+n):Dc(i,n);for(var H=s.length-1;H>=0;H--)h=Wg(o,n,m={},e[3],X),o&&(h.static=k,h.private=g,y=h.access={has:g?u=>Vg(i,u):u=>n in u},o^3&&(y.get=g?u=>(o^1?ra:$r)(u,i,o^4?a:_.get):u=>u[n]),o>2&&(y.set=g?(u,x)=>Lc(u,i,x,o^4?a:_.set):(u,x)=>u[n]=x)),l=(0,s[H])(o?o<4?g?a:_[te]:o>4?void 0:{get:_.get,set:_.set}:i,h),m._=1,o^4||l===void 0?Es(l)&&(o>4?ne.unshift(l):o?g?a=l:_[te]=l:i=l):typeof l!="object"||l===null?is("Object expected"):(Es(r=l.get)&&(_.get=r),Es(r=l.set)&&(_.set=r),Es(r=l.init)&&ne.unshift(r));return o||zg(e,i),_&&Zo(i,n,_),g?o^4?a:_:i},el=(e,t,n)=>t.has(e)||is("Cannot "+n),Vg=(e,t)=>Object(t)!==t?is('Cannot use the "in" operator on this value'):e.has(t),ra=(e,t,n)=>(el(e,t,"read from private field"),n?n.call(e):t.get(e)),un=(e,t,n)=>t.has(e)?is("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(e):t.set(e,n),Lc=(e,t,n,s)=>(el(e,t,"write to private field"),s?s.call(e,n):t.set(e,n),n),$r=(e,t,n)=>(el(e,t,"access private method"),n),Lu,Fu,Ru,Uu,Cr,Bu,nt,tl,nl,sl,il,Tr,Ir,Ji,jr;Bu=[$t("asljs-ai-chat-key")];class Sn extends(Cr=ht,Uu=[le({attribute:!1})],Ru=[le({attribute:!1})],Fu=[le({attribute:!1})],Lu=[le({type:Boolean,attribute:!1})],Cr){constructor(){super(...arguments),un(this,Ji),un(this,tl,Vt(nt,8,this,"OpenAI API Key")),Vt(nt,11,this),un(this,nl,Vt(nt,12,this,"sk-…")),Vt(nt,15,this),un(this,sl,Vt(nt,16,this,"Save key")),Vt(nt,19,this),un(this,il,Vt(nt,20,this,!1)),Vt(nt,23,this),un(this,Tr,t=>{const n=t;n.key==="Enter"&&(n.preventDefault(),$r(this,Ji,jr).call(this))}),un(this,Ir,()=>{$r(this,Ji,jr).call(this)})}createRenderRoot(){return this}render(){return Le`
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
              .inputType=${"password"}
              .disabled=${this.disabled}
              @keydown=${ra(this,Tr)}>
          </asljs-text-input>
          <asljs-button
              .text=${this.submitLabel}
              .disabled=${this.disabled}
              @click=${ra(this,Ir)}>
          </asljs-button>
        </div>
      </div>
    `}}nt=Bg(Cr);tl=new WeakMap;nl=new WeakMap;sl=new WeakMap;il=new WeakMap;Tr=new WeakMap;Ir=new WeakMap;Ji=new WeakSet;jr=function(){const e=this.querySelector('[data-role="key-input"]'),t=((e==null?void 0:e.draftValue)??"").trim();t!==""&&this.dispatchEvent(new CustomEvent("key-submit",{detail:{key:t},bubbles:!0,composed:!0}))};$i(nt,4,"label",Uu,Sn,tl);$i(nt,4,"placeholder",Ru,Sn,nl);$i(nt,4,"submitLabel",Fu,Sn,sl);$i(nt,4,"disabled",Lu,Sn,il);Sn=$i(nt,0,"AiChatKeyPrompt",Bu,Sn);Vt(nt,1,Sn);var Hg=Object.create,al=Object.defineProperty,qg=Object.getOwnPropertyDescriptor,Wu=(e,t)=>(t=Symbol[e])?t:Symbol.for("Symbol."+e),as=e=>{throw TypeError(e)},Kg=(e,t,n)=>t in e?al(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,Fc=(e,t)=>al(e,"name",{value:t,configurable:!0}),Gg=e=>[,,,Hg((e==null?void 0:e[Wu("metadata")])??null)],zu=["class","method","getter","setter","accessor","field","value","get","set"],As=e=>e!==void 0&&typeof e!="function"?as("Function expected"):e,Jg=(e,t,n,s,i)=>({kind:zu[e],name:t,metadata:s,addInitializer:a=>n._?as("Already initialized"):i.push(As(a||null))}),Yg=(e,t)=>Kg(t,Wu("metadata"),e[3]),pn=(e,t,n,s)=>{for(var i=0,a=e[t>>1],r=a&&a.length;i<r;i++)t&1?a[i].call(n):s=a[i].call(n,s);return s},Ia=(e,t,n,s,i,a)=>{var r,l,m,h,y,o=t&7,k=!!(t&8),g=!!(t&16),$=o>3?e.length+1:o?k?1:2:0,te=zu[o+5],ne=o>3&&(e[$-1]=[]),X=e[$]||(e[$]=[]),_=o&&(!g&&!k&&(i=i.prototype),o<5&&(o>3||!g)&&qg(o<4?i:{get[n](){return Rc(this,a)},set[n](u){return Uc(this,a,u)}},n));o?g&&o<4&&Fc(a,(o>2?"set ":o>1?"get ":"")+n):Fc(i,n);for(var H=s.length-1;H>=0;H--)h=Jg(o,n,m={},e[3],X),o&&(h.static=k,h.private=g,y=h.access={has:g?u=>Xg(i,u):u=>n in u},o^3&&(y.get=g?u=>(o^1?Rc:oa)(u,i,o^4?a:_.get):u=>u[n]),o>2&&(y.set=g?(u,x)=>Uc(u,i,x,o^4?a:_.set):(u,x)=>u[n]=x)),l=(0,s[H])(o?o<4?g?a:_[te]:o>4?void 0:{get:_.get,set:_.set}:i,h),m._=1,o^4||l===void 0?As(l)&&(o>4?ne.unshift(l):o?g?a=l:_[te]=l:i=l):typeof l!="object"||l===null?as("Object expected"):(As(r=l.get)&&(_.get=r),As(r=l.set)&&(_.set=r),As(r=l.init)&&ne.unshift(r));return o||Yg(e,i),_&&al(i,n,_),g?o^4?a:_:i},rl=(e,t,n)=>t.has(e)||as("Cannot "+n),Xg=(e,t)=>Object(t)!==t?as('Cannot use the "in" operator on this value'):e.has(t),Rc=(e,t,n)=>(rl(e,t,"read from private field"),n?n.call(e):t.get(e)),Ui=(e,t,n)=>t.has(e)?as("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(e):t.set(e,n),Uc=(e,t,n,s)=>(rl(e,t,"write to private field"),s?s.call(e,n):t.set(e,n),n),oa=(e,t,n)=>(rl(e,t,"access private method"),n),Vu,Hu,qu,Mr,Ku,bt,ol,ll,cl,Qs,Gu,Ju,Yu;const Qg=[{value:"yes",label:"Yes"},{value:"no",label:"No"}];Ku=[$t("asljs-properties")];class $n extends(Mr=ht,qu=[le({attribute:!1})],Hu=[le({attribute:!1})],Vu=[le({attribute:!1})],Mr){constructor(){super(...arguments),Ui(this,Qs),Ui(this,ol,pn(bt,8,this,null)),pn(bt,11,this),Ui(this,ll,pn(bt,12,this,null)),pn(bt,15,this),Ui(this,cl,pn(bt,16,this,null)),pn(bt,19,this)}createRenderRoot(){return this}render(){return this.definition===null||this.target===null?Le``:Le`
      <div class="asljs-properties"
           style="display:grid;gap:0.75rem;">
        ${this.definition.properties.map(t=>oa(this,Qs,Gu).call(this,t))}
      </div>
    `}}bt=Gg(Mr);ol=new WeakMap;ll=new WeakMap;cl=new WeakMap;Qs=new WeakSet;Gu=function(e){var a;const t=(a=this.target)==null?void 0:a[e.name],n=e.title??e.name,s=e.description??`Type: ${e.type}`,i=e.editable??tb(e.type);return e.type==="boolean"?Le`
        <asljs-select
            data-property-name=${e.name}
            .theme=${this.theme}
            .label=${n}
            .description=${s}
            .items=${Qg}
            .value=${t===!0?"yes":"no"}
            .disabled=${!i}
            @input=${r=>oa(this,Qs,Ju).call(this,e,r)}>
        </asljs-select>
      `:Le`
      <asljs-text-input
          data-property-name=${e.name}
          .theme=${this.theme}
          .label=${n}
          .description=${s}
          .value=${eb(e.type,t)}
          .inputType=${e.type==="number"?"number":"text"}
          .disabled=${!i}
          @input=${r=>oa(this,Qs,Yu).call(this,e,r)}>
      </asljs-text-input>
    `};Ju=function(e,t){if(this.target===null||e.editable===!1)return;const n=t.detail,s=t.currentTarget,i=(n==null?void 0:n.value)??(s==null?void 0:s.draftValue);i!==void 0&&(this.target[e.name]=i==="yes",this.requestUpdate())};Yu=function(e,t){if(this.target===null||e.editable===!1)return;const n=t.detail,s=t.currentTarget,i=(n==null?void 0:n.value)??(s==null?void 0:s.draftValue);if(i===void 0)return;const a=Zg(e.type,i,this.target[e.name]);a!==Pr&&(this.target[e.name]=a,this.requestUpdate())};Ia(bt,4,"definition",qu,$n,ol);Ia(bt,4,"target",Hu,$n,ll);Ia(bt,4,"theme",Vu,$n,cl);$n=Ia(bt,0,"Properties",Ku,$n);$n.modelDefinition=Pf;pn(bt,1,$n);const Pr=Symbol("unchangedValue");function Zg(e,t,n){if(e==="number"){if(t.trim()==="")return Pr;const s=Number(t);return Number.isFinite(s)?s:Pr}return e==="string"?t:n}function eb(e,t){return e==="string"||e==="number"?t==null?"":String(t):e==="array"?Array.isArray(t)?`[${t.length} items]`:"[]":e==="function"?typeof t=="function"?"[Function]":"":e==="object"?t==null?"":"[Object]":t===!0?"Yes":"No"}function tb(e){return e==="boolean"||e==="number"||e==="string"}var nb=Object.create,dl=Object.defineProperty,sb=Object.getOwnPropertyDescriptor,Xu=(e,t)=>(t=Symbol[e])?t:Symbol.for("Symbol."+e),rs=e=>{throw TypeError(e)},ib=(e,t,n)=>t in e?dl(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,Bc=(e,t)=>dl(e,"name",{value:t,configurable:!0}),ab=e=>[,,,nb((e==null?void 0:e[Xu("metadata")])??null)],Qu=["class","method","getter","setter","accessor","field","value","get","set"],Ss=e=>e!==void 0&&typeof e!="function"?rs("Function expected"):e,rb=(e,t,n,s,i)=>({kind:Qu[e],name:t,metadata:s,addInitializer:a=>n._?rs("Already initialized"):i.push(Ss(a||null))}),ob=(e,t)=>ib(t,Xu("metadata"),e[3]),hn=(e,t,n,s)=>{for(var i=0,a=e[t>>1],r=a&&a.length;i<r;i++)t&1?a[i].call(n):s=a[i].call(n,s);return s},ja=(e,t,n,s,i,a)=>{var r,l,m,h,y,o=t&7,k=!!(t&8),g=!!(t&16),$=o>3?e.length+1:o?k?1:2:0,te=Qu[o+5],ne=o>3&&(e[$-1]=[]),X=e[$]||(e[$]=[]),_=o&&(!g&&!k&&(i=i.prototype),o<5&&(o>3||!g)&&sb(o<4?i:{get[n](){return wn(this,a)},set[n](u){return qn(this,a,u)}},n));o?g&&o<4&&Bc(a,(o>2?"set ":o>1?"get ":"")+n):Bc(i,n);for(var H=s.length-1;H>=0;H--)h=rb(o,n,m={},e[3],X),o&&(h.static=k,h.private=g,y=h.access={has:g?u=>lb(i,u):u=>n in u},o^3&&(y.get=g?u=>(o^1?wn:la)(u,i,o^4?a:_.get):u=>u[n]),o>2&&(y.set=g?(u,x)=>qn(u,i,x,o^4?a:_.set):(u,x)=>u[n]=x)),l=(0,s[H])(o?o<4?g?a:_[te]:o>4?void 0:{get:_.get,set:_.set}:i,h),m._=1,o^4||l===void 0?Ss(l)&&(o>4?ne.unshift(l):o?g?a=l:_[te]=l:i=l):typeof l!="object"||l===null?rs("Object expected"):(Ss(r=l.get)&&(_.get=r),Ss(r=l.set)&&(_.set=r),Ss(r=l.init)&&ne.unshift(r));return o||ob(e,i),_&&dl(i,n,_),g?o^4?a:_:i},ul=(e,t,n)=>t.has(e)||rs("Cannot "+n),lb=(e,t)=>Object(t)!==t?rs('Cannot use the "in" operator on this value'):e.has(t),wn=(e,t,n)=>(ul(e,t,"read from private field"),n?n.call(e):t.get(e)),Nn=(e,t,n)=>t.has(e)?rs("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(e):t.set(e,n),qn=(e,t,n,s)=>(ul(e,t,"write to private field"),s?s.call(e,n):t.set(e,n),n),la=(e,t,n)=>(ul(e,t,"access private method"),n),cb=(e,t,n,s)=>({set _(i){qn(e,t,i,n)},get _(){return wn(e,t,s)}}),Zu,ep,tp,Nr,np,Kn,Dn,yt,pl,hl,fl,Ds,sp,ml;np=[$t("asljs-file")];class Gn extends(Nr=ht,tp=[le({attribute:!1})],ep=[le({attribute:!1})],Zu=[le({attribute:!1})],Nr){constructor(){super(...arguments),Nn(this,Ds),Nn(this,Kn,null),Nn(this,Dn,0),Nn(this,pl,hn(yt,8,this,null)),hn(yt,11,this),Nn(this,hl,hn(yt,12,this,[])),hn(yt,15,this),Nn(this,fl,hn(yt,16,this,null)),hn(yt,19,this)}createRenderRoot(){return this}disconnectedCallback(){la(this,Ds,ml).call(this),super.disconnectedCallback()}render(){return Le`
      <div data-role="content"></div>
    `}updated(t){(t.has("provider")||t.has("handlers")||t.has("fileName"))&&la(this,Ds,sp).call(this)}}yt=ab(Nr);Kn=new WeakMap;Dn=new WeakMap;pl=new WeakMap;hl=new WeakMap;fl=new WeakMap;Ds=new WeakSet;sp=async function(){var r;const e=++cb(this,Dn)._;la(this,Ds,ml).call(this);const t=this.querySelector('[data-role="content"]');if(t===null)return;if(this.fileName===null||this.fileName.trim()===""){t.replaceChildren(Ln("Select a file to preview."));return}const n=this.provider;if(n===null){t.replaceChildren(Ln("File provider is not configured."));return}t.replaceChildren(Ln("Loading preview..."));const s=await n.loadFile(this.fileName);if(e!==wn(this,Dn))return;if(s===null){t.replaceChildren(Ln("File content is not available."));return}const i=await hb(this.handlers,s);if(e!==wn(this,Dn))return;if(i===null){const l=fb(s);qn(this,Kn,{dispose:l.dispose}),t.replaceChildren(l.element);return}const a=await i.render({file:s,fileName:this.fileName,provider:n});if(e!==wn(this,Dn)){(r=a.dispose)==null||r.call(a);return}qn(this,Kn,{dispose:a.dispose}),t.replaceChildren(a.element)};ml=function(){var e,t;(t=(e=wn(this,Kn))==null?void 0:e.dispose)==null||t.call(e),qn(this,Kn,null)};ja(yt,4,"provider",tp,Gn,pl);ja(yt,4,"handlers",ep,Gn,hl);ja(yt,4,"fileName",Zu,Gn,fl);Gn=ja(yt,0,"FileView",np,Gn);hn(yt,1,Gn);function db(){return{canDisplay:e=>ap(e),render:async({file:e})=>{const t=await ip(e);if(t===null)return gl();const n=document.createElement("iframe");return n.src=`${t.url}#toolbar=1&navpanes=0`,n.title=e.name,n.referrerPolicy="no-referrer",n.style.width="100%",n.style.height="100%",n.style.minHeight="32rem",n.style.border="0",{element:n,dispose:t.dispose}}}}function ub(){return{canDisplay:e=>gb(e),render:async({file:e})=>{const t=await ip(e);if(t===null)return gl();const n=document.createElement("img");return n.src=t.url,n.alt=e.name,n.style.display="block",n.style.maxWidth="100%",n.style.maxHeight="100%",n.style.objectFit="contain",{element:n,dispose:t.dispose}}}}function pb(){return{canDisplay:e=>rp(e),render:async({file:e,fileName:t,provider:n})=>{const s=await mb(e);if(s===null)return gl();const i=document.createElement("textarea");return i.value=s,i.disabled=n.saveText===void 0,i.spellcheck=!1,i.style.width="100%",i.style.height="100%",i.style.minHeight="16rem",i.style.border="0",i.style.resize="none",i.style.padding="0.75rem",i.style.fontFamily="SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace",i.style.fontSize="0.8rem",i.style.lineHeight="1.6",i.style.boxSizing="border-box",n.saveText!==void 0&&i.addEventListener("blur",()=>{var a;(a=n.saveText)==null||a.call(n,t,i.value)}),{element:i}}}}async function hb(e,t){for(const n of e)if(await n.canDisplay(t))return n;return null}function Ln(e){const t=document.createElement("div");return t.textContent=e,t.style.color="var(--bs-secondary-color, #6c757d)",t}function gl(){return{element:Ln("Preview unavailable for this file type.")}}function fb(e){const t=document.createElement("div");t.style.display="flex",t.style.alignItems="center",t.style.gap="0.5rem";const n=Ln("Preview unavailable for this file type.");if(t.appendChild(n),e.blob||e.dataUrl){const s=document.createElement("a");if(s.textContent="Open",s.target="_blank",s.rel="noopener noreferrer",e.dataUrl)return s.href=e.dataUrl,t.appendChild(s),{element:t};const i=URL.createObjectURL(e.blob);return s.href=i,t.appendChild(s),{element:t,dispose:()=>{URL.revokeObjectURL(i)}}}return{element:t}}async function ip(e){if(e.dataUrl)return{url:e.dataUrl};if(e.blob){if(ap(e)&&Ma(e.mimeType??e.blob.type)!=="application/pdf"){const n=new Blob([await e.blob.arrayBuffer()],{type:"application/pdf"}),s=URL.createObjectURL(n);return{url:s,dispose:()=>{URL.revokeObjectURL(s)}}}const t=URL.createObjectURL(e.blob);return{url:t,dispose:()=>{URL.revokeObjectURL(t)}}}return null}async function mb(e){return typeof e.text=="string"?e.text:e.blob&&rp(e)?await e.blob.text():null}function ap(e){var t;return Ma(e.mimeType??((t=e.blob)==null?void 0:t.type))==="application/pdf"||bb(e).endsWith(".pdf")}function gb(e){var n;return Ma(e.mimeType??((n=e.blob)==null?void 0:n.type)).startsWith("image/")||/\.(png|jpg|jpeg|gif|webp|svg)$/i.test(e.name)}function rp(e){var n;if(typeof e.text=="string")return!0;const t=Ma(e.mimeType??((n=e.blob)==null?void 0:n.type));return t.startsWith("text/")||["application/json","application/xml","image/svg+xml"].includes(t)||/\.(txt|csv|json|xml|html|htm|md|markdown|svg)$/i.test(e.name)}function Ma(e){return(e??"").trim().toLowerCase()}function bb(e){return e.name.toLowerCase()}var yb=Object.create,op=Object.defineProperty,vb=Object.getOwnPropertyDescriptor,lp=(e,t)=>(t=Symbol[e])?t:Symbol.for("Symbol."+e),Ci=e=>{throw TypeError(e)},wb=(e,t,n)=>t in e?op(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,_b=e=>[,,,yb((e==null?void 0:e[lp("metadata")])??null)],cp=["class","method","getter","setter","accessor","field","value","get","set"],$s=e=>e!==void 0&&typeof e!="function"?Ci("Function expected"):e,xb=(e,t,n,s,i)=>({kind:cp[e],name:t,metadata:s,addInitializer:a=>n._?Ci("Already initialized"):i.push($s(a||null))}),kb=(e,t)=>wb(t,lp("metadata"),e[3]),Wc=(e,t,n,s)=>{for(var i=0,a=e[t>>1],r=a&&a.length;i<r;i++)t&1?a[i].call(n):s=a[i].call(n,s);return s},Eb=(e,t,n,s,i,a)=>{for(var r,l,m,h,y,o=t&7,k=!1,g=!1,$=e.length+1,te=cp[o+5],ne=e[$-1]=[],X=e[$]||(e[$]=[]),_=(i=i.prototype,vb({get[n](){return Ab(this,a)},set[n](u){return $b(this,a,u)}},n)),H=s.length-1;H>=0;H--)h=xb(o,n,m={},e[3],X),h.static=k,h.private=g,y=h.access={has:u=>n in u},y.get=u=>u[n],y.set=(u,x)=>u[n]=x,l=(0,s[H])({get:_.get,set:_.set},h),m._=1,l===void 0?$s(l)&&(_[te]=l):typeof l!="object"||l===null?Ci("Object expected"):($s(r=l.get)&&(_.get=r),$s(r=l.set)&&(_.set=r),$s(r=l.init)&&ne.unshift(r));return _&&op(i,n,_),i},dp=(e,t,n)=>t.has(e)||Ci("Cannot "+n),Ab=(e,t,n)=>(dp(e,t,"read from private field"),t.get(e)),Sb=(e,t,n)=>t.has(e)?Ci("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(e):t.set(e,n),$b=(e,t,n,s)=>(dp(e,t,"write to private field"),t.set(e,n),n),up,Or,Zs,bl;class Ti extends(Or=ht,up=[le({reflect:!0})],Or){constructor(){super(...arguments),Sb(this,bl,Wc(Zs,8,this,"")),Wc(Zs,11,this),this.handleAssistedInputButtonClick=t=>{const n=t.currentTarget;if(n===null||n.disabled)return;const s=n.getAttribute("data-action");if(s!==null&&s!==""&&this.handleAction(s,t,n))return;const i=n.getAttribute("data-key");if(!(i===null||i==="")){if(i==="Enter"){this.dispatchSubmit();return}this.dispatchKey(i)}},this.handleAssistedInputPointerDown=t=>{t.preventDefault()}}connectedCallback(){super.connectedCallback(),this.hasAttribute("role")||this.setAttribute("role","group"),this.hasAttribute("aria-label")||this.setAttribute("aria-label",this.defaultAriaLabel)}isButtonAllowed(t){return t.action!==void 0?!0:t.key===void 0||t.key===""?!1:this.isKeyAllowed(t.key)}isKeyAllowed(t){return this.characters===""||t==="Backspace"||t==="Enter"?!0:t.length===1&&this.characters.includes(t)}renderAssistedInputButton(t,n,s={}){const i=this.isButtonAllowed(t),a=["key",t.className??"",i?"":"disallowed"].filter(Boolean).join(" ");return Le`
      <button
          type="button"
          class=${a}
          data-action=${t.action??""}
          data-key=${t.key??""}
          aria-label=${s.ariaLabel??""}
          title=${s.title??""}
          ?disabled=${!i}
          tabindex="-1"
          @click=${this.handleAssistedInputButtonClick}
          @pointerdown=${this.handleAssistedInputPointerDown}>
        ${n}
      </button>
    `}dispatchKey(t){this.dispatchEvent(new CustomEvent("key",{detail:{key:t},bubbles:!0,composed:!0}))}dispatchSubmit(){this.dispatchEvent(new CustomEvent("submit",{detail:{},bubbles:!0,composed:!0}))}handleAction(t,n,s){return!1}}Zs=_b(Or);bl=new WeakMap;Eb(Zs,4,"characters",up,Ti,bl);kb(Zs,Ti);var Cb=Object.create,yl=Object.defineProperty,Tb=Object.getOwnPropertyDescriptor,pp=(e,t)=>(t=Symbol[e])?t:Symbol.for("Symbol."+e),hp=e=>{throw TypeError(e)},Ib=(e,t,n)=>t in e?yl(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,jb=(e,t)=>yl(e,"name",{value:t,configurable:!0}),Mb=e=>[,,,Cb((e==null?void 0:e[pp("metadata")])??null)],Pb=["class","method","getter","setter","accessor","field","value","get","set"],fp=e=>e!==void 0&&typeof e!="function"?hp("Function expected"):e,Nb=(e,t,n,s,i)=>({kind:Pb[e],name:t,metadata:s,addInitializer:a=>n._?hp("Already initialized"):i.push(fp(a||null))}),Ob=(e,t)=>Ib(t,pp("metadata"),e[3]),Db=(e,t,n,s)=>{for(var i=0,a=e[t>>1],r=a&&a.length;i<r;i++)a[i].call(n);return s},Lb=(e,t,n,s,i,a)=>{var r,l,m,h=t&7,y=!1,o=0,k=e[o]||(e[o]=[]),g=h&&(i=i.prototype,h<5&&(h>3||!y)&&Tb(i,n));jb(i,n);for(var $=s.length-1;$>=0;$--)m=Nb(h,n,l={},e[3],k),r=(0,s[$])(i,m),l._=1,fp(r)&&(i=r);return Ob(e,i),g&&yl(i,n,g),y?h^4?a:g:i},mp,vl,gp;const Fb=[[{key:"1",label:"1"},{key:"2",label:"2"},{key:"3",label:"3"},{key:"4",label:"4"},{key:"5",label:"5"},{key:"6",label:"6"},{key:"7",label:"7"},{key:"8",label:"8"},{key:"9",label:"9"},{key:"0",label:"0"},{key:"Backspace",label:"⌫",className:"wide backspace"}],[{key:"q",label:"Q"},{key:"w",label:"W"},{key:"e",label:"E"},{key:"r",label:"R"},{key:"t",label:"T"},{key:"y",label:"Y"},{key:"u",label:"U"},{key:"i",label:"I"},{key:"o",label:"O"},{key:"p",label:"P"}],[{key:"a",label:"A"},{key:"s",label:"S"},{key:"d",label:"D"},{key:"f",label:"F"},{key:"g",label:"G"},{key:"h",label:"H"},{key:"j",label:"J"},{key:"k",label:"K"},{key:"l",label:"L"},{key:"'",label:"'"},{key:"Enter",label:"⏎",className:"wide enter"}],[{key:"z",label:"Z"},{key:"x",label:"X"},{key:"c",label:"C"},{key:"v",label:"V"},{key:"b",label:"B"},{key:"n",label:"N"},{key:"m",label:"M"},{key:",",label:","},{key:".",label:"."},{key:"-",label:"-"}],[{key:" ",label:"Space",className:"space"}]];mp=[$t("asljs-keyboard")];var ba,bp;const Ql=class Ql extends(gp=Ti){constructor(){super(...arguments);hs(this,ba)}get defaultAriaLabel(){return"keyboard"}render(){return Le`
      ${Fb.map(n=>Le`
          <div class="row">
            ${n.map(s=>Wa(this,ba,bp).call(this,s))}
          </div>
        `)}
    `}};ba=new WeakSet,bp=function(n){const s=n.key===" "?"Space":void 0;return this.renderAssistedInputButton(n,Le`<span class="label">${n.label??""}</span>`,{ariaLabel:s})},Ql.styles=Qr`
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
    `;let ei=Ql;vl=Mb(gp);ei=Lb(vl,0,"Keyboard",mp,ei);Db(vl,1,ei);var Rb=Object.create,wl=Object.defineProperty,Ub=Object.getOwnPropertyDescriptor,yp=(e,t)=>(t=Symbol[e])?t:Symbol.for("Symbol."+e),os=e=>{throw TypeError(e)},Bb=(e,t,n)=>t in e?wl(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,zc=(e,t)=>wl(e,"name",{value:t,configurable:!0}),Wb=e=>[,,,Rb((e==null?void 0:e[yp("metadata")])??null)],vp=["class","method","getter","setter","accessor","field","value","get","set"],Cs=e=>e!==void 0&&typeof e!="function"?os("Function expected"):e,zb=(e,t,n,s,i)=>({kind:vp[e],name:t,metadata:s,addInitializer:a=>n._?os("Already initialized"):i.push(Cs(a||null))}),Vb=(e,t)=>Bb(t,yp("metadata"),e[3]),Dr=(e,t,n,s)=>{for(var i=0,a=e[t>>1],r=a&&a.length;i<r;i++)t&1?a[i].call(n):s=a[i].call(n,s);return s},wp=(e,t,n,s,i,a)=>{var r,l,m,h,y,o=t&7,k=!!(t&8),g=!!(t&16),$=o>3?e.length+1:o?k?1:2:0,te=vp[o+5],ne=o>3&&(e[$-1]=[]),X=e[$]||(e[$]=[]),_=o&&(!g&&!k&&(i=i.prototype),o<5&&(o>3||!g)&&Ub(o<4?i:{get[n](){return ca(this,a)},set[n](u){return Hc(this,a,u)}},n));o?g&&o<4&&zc(a,(o>2?"set ":o>1?"get ":"")+n):zc(i,n);for(var H=s.length-1;H>=0;H--)h=zb(o,n,m={},e[3],X),o&&(h.static=k,h.private=g,y=h.access={has:g?u=>Hb(i,u):u=>n in u},o^3&&(y.get=g?u=>(o^1?ca:_p)(u,i,o^4?a:_.get):u=>u[n]),o>2&&(y.set=g?(u,x)=>Hc(u,i,x,o^4?a:_.set):(u,x)=>u[n]=x)),l=(0,s[H])(o?o<4?g?a:_[te]:o>4?void 0:{get:_.get,set:_.set}:i,h),m._=1,o^4||l===void 0?Cs(l)&&(o>4?ne.unshift(l):o?g?a=l:_[te]=l:i=l):typeof l!="object"||l===null?os("Object expected"):(Cs(r=l.get)&&(_.get=r),Cs(r=l.set)&&(_.set=r),Cs(r=l.init)&&ne.unshift(r));return o||Vb(e,i),_&&wl(i,n,_),g?o^4?a:_:i},_l=(e,t,n)=>t.has(e)||os("Cannot "+n),Hb=(e,t)=>Object(t)!==t?os('Cannot use the "in" operator on this value'):e.has(t),ca=(e,t,n)=>(_l(e,t,"read from private field"),n?n.call(e):t.get(e)),Vc=(e,t,n)=>t.has(e)?os("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(e):t.set(e,n),Hc=(e,t,n,s)=>(_l(e,t,"write to private field"),s?s.call(e,n):t.set(e,n),n),_p=(e,t,n)=>(_l(e,t,"access private method"),n),xp,Lr,kp,Jn,xl,ti,Ep,Fr;const qb='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" aria-hidden="true" focusable="false"><path d="M96 208C96 172.7 124.7 144 160 144L480 144C515.3 144 544 172.7 544 208L544 432C544 467.3 515.3 496 480 496L160 496C124.7 496 96 467.3 96 432L96 208zM160 192C151.2 192 144 199.2 144 208L144 432C144 440.8 151.2 448 160 448L480 448C488.8 448 496 440.8 496 432L496 208C496 199.2 488.8 192 480 192L160 192zM176 240C176 231.2 183.2 224 192 224L224 224C232.8 224 240 231.2 240 240L240 272C240 280.8 232.8 288 224 288L192 288C183.2 288 176 280.8 176 272L176 240zM272 240C272 231.2 279.2 224 288 224L320 224C328.8 224 336 231.2 336 240L336 272C336 280.8 328.8 288 320 288L288 288C279.2 288 272 280.8 272 272L272 240zM368 240C368 231.2 375.2 224 384 224L416 224C424.8 224 432 231.2 432 240L432 272C432 280.8 424.8 288 416 288L384 288C375.2 288 368 280.8 368 272L368 240zM176 336C176 327.2 183.2 320 192 320L448 320C456.8 320 464 327.2 464 336L464 368C464 376.8 456.8 384 448 384L192 384C183.2 384 176 376.8 176 368L176 336z"/></svg>',Kb=[{action:"toggle",className:"toggle"},{key:"a",label:"A"},{key:"b",label:"B"},{key:"c",label:"C"},{key:"d",label:"D"},{key:"e",label:"E"},{key:"f",label:"F"},{key:"g",label:"G"},{key:"h",label:"H"},{key:"i",label:"I"},{key:"j",label:"J"},{key:"k",label:"K"},{key:"l",label:"L"},{key:"m",label:"M"},{key:"n",label:"N"},{key:"o",label:"O"},{key:"p",label:"P"},{key:"q",label:"Q"},{key:"r",label:"R"},{key:"Backspace",label:"⌫"},{key:"s",label:"S"},{key:"t",label:"T"},{key:"u",label:"U"},{key:"v",label:"V"},{key:"Enter",label:"⏎",className:"enter"},{key:"w",label:"W"},{key:"x",label:"X"},{key:"y",label:"Y"},{key:"z",label:"Z"}];kp=[$t("asljs-letterpad")];class ni extends(Lr=Ti,xp=[le({reflect:!0,type:Boolean})],Lr){constructor(){super(...arguments),Vc(this,ti),Vc(this,xl,Dr(Jn,8,this,!1)),Dr(Jn,11,this)}get defaultAriaLabel(){return"letterpad"}render(){return Le`
      <div class="grid" part="grid">
        ${Kb.map(t=>_p(this,ti,Ep).call(this,t))}
      </div>
    `}handleAction(t,n,s){return t!=="toggle"?!1:(n.preventDefault(),n.stopPropagation(),this.collapsed=!this.collapsed,!0)}}Jn=Wb(Lr);xl=new WeakMap;ti=new WeakSet;Ep=function(e){return e.action==="toggle"?this.renderAssistedInputButton(e,to(qb),{ariaLabel:ca(this,ti,Fr),title:ca(this,ti,Fr)}):this.renderAssistedInputButton(e,Le`<span class="label">${e.label??""}</span>`)};Fr=function(){return this.collapsed?"Show letterpad":"Hide letterpad"};wp(Jn,4,"collapsed",xp,ni,xl);ni=wp(Jn,0,"Letterpad",kp,ni);ni.styles=Qr`
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
    `;Dr(Jn,1,ni);var Gb=Object.create,kl=Object.defineProperty,Jb=Object.getOwnPropertyDescriptor,Ap=(e,t)=>(t=Symbol[e])?t:Symbol.for("Symbol."+e),Sp=e=>{throw TypeError(e)},Yb=(e,t,n)=>t in e?kl(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,Xb=(e,t)=>kl(e,"name",{value:t,configurable:!0}),Qb=e=>[,,,Gb((e==null?void 0:e[Ap("metadata")])??null)],Zb=["class","method","getter","setter","accessor","field","value","get","set"],$p=e=>e!==void 0&&typeof e!="function"?Sp("Function expected"):e,ey=(e,t,n,s,i)=>({kind:Zb[e],name:t,metadata:s,addInitializer:a=>n._?Sp("Already initialized"):i.push($p(a||null))}),ty=(e,t)=>Yb(t,Ap("metadata"),e[3]),ny=(e,t,n,s)=>{for(var i=0,a=e[t>>1],r=a&&a.length;i<r;i++)a[i].call(n);return s},sy=(e,t,n,s,i,a)=>{var r,l,m,h=t&7,y=!1,o=0,k=e[o]||(e[o]=[]),g=h&&(i=i.prototype,h<5&&(h>3||!y)&&Jb(i,n));Xb(i,n);for(var $=s.length-1;$>=0;$--)m=ey(h,n,l={},e[3],k),r=(0,s[$])(i,m),l._=1,$p(r)&&(i=r);return ty(e,i),g&&kl(i,n,g),y?h^4?a:g:i},Cp,El,Tp;const iy=[{key:"Backspace",label:"⌫"},{key:"/",label:"÷",className:"op"},{key:"*",label:"×",className:"op"},{key:"-",label:"−",className:"op"},{key:"7",label:"7"},{key:"8",label:"8"},{key:"9",label:"9"},{key:"+",label:"+",className:"op plus"},{key:"4",label:"4"},{key:"5",label:"5"},{key:"6",label:"6"},{key:"1",label:"1"},{key:"2",label:"2"},{key:"3",label:"3"},{key:"Enter",label:"⏎",className:"enter"},{key:"0",label:"0",className:"zero"},{key:".",label:"."}];Cp=[$t("asljs-numpad")];var ya,Ip;const Zl=class Zl extends(Tp=Ti){constructor(){super(...arguments);hs(this,ya)}get defaultAriaLabel(){return"numpad"}render(){return Le`
      <div class="grid" part="grid">
        ${iy.map(n=>Wa(this,ya,Ip).call(this,n))}
      </div>
    `}};ya=new WeakSet,Ip=function(n){return this.renderAssistedInputButton(n,Le`<span class="label">${n.label??""}</span>`)},Zl.styles=Qr`
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
    `;let si=Zl;El=Qb(Tp);si=sy(El,0,"Numpad",Cp,si);ny(El,1,si);var ay=Object.create,Al=Object.defineProperty,ry=Object.getOwnPropertyDescriptor,jp=(e,t)=>(t=Symbol[e])?t:Symbol.for("Symbol."+e),ls=e=>{throw TypeError(e)},oy=(e,t,n)=>t in e?Al(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,qc=(e,t)=>Al(e,"name",{value:t,configurable:!0}),ly=e=>[,,,ay((e==null?void 0:e[jp("metadata")])??null)],Mp=["class","method","getter","setter","accessor","field","value","get","set"],Ts=e=>e!==void 0&&typeof e!="function"?ls("Function expected"):e,cy=(e,t,n,s,i)=>({kind:Mp[e],name:t,metadata:s,addInitializer:a=>n._?ls("Already initialized"):i.push(Ts(a||null))}),dy=(e,t)=>oy(t,jp("metadata"),e[3]),fn=(e,t,n,s)=>{for(var i=0,a=e[t>>1],r=a&&a.length;i<r;i++)t&1?a[i].call(n):s=a[i].call(n,s);return s},Pa=(e,t,n,s,i,a)=>{var r,l,m,h,y,o=t&7,k=!!(t&8),g=!!(t&16),$=o>3?e.length+1:o?k?1:2:0,te=Mp[o+5],ne=o>3&&(e[$-1]=[]),X=e[$]||(e[$]=[]),_=o&&(!g&&!k&&(i=i.prototype),o<5&&(o>3||!g)&&ry(o<4?i:{get[n](){return Qe(this,a)},set[n](u){return Xe(this,a,u)}},n));o?g&&o<4&&qc(a,(o>2?"set ":o>1?"get ":"")+n):qc(i,n);for(var H=s.length-1;H>=0;H--)h=cy(o,n,m={},e[3],X),o&&(h.static=k,h.private=g,y=h.access={has:g?u=>uy(i,u):u=>n in u},o^3&&(y.get=g?u=>(o^1?Qe:Me)(u,i,o^4?a:_.get):u=>u[n]),o>2&&(y.set=g?(u,x)=>Xe(u,i,x,o^4?a:_.set):(u,x)=>u[n]=x)),l=(0,s[H])(o?o<4?g?a:_[te]:o>4?void 0:{get:_.get,set:_.set}:i,h),m._=1,o^4||l===void 0?Ts(l)&&(o>4?ne.unshift(l):o?g?a=l:_[te]=l:i=l):typeof l!="object"||l===null?ls("Object expected"):(Ts(r=l.get)&&(_.get=r),Ts(r=l.set)&&(_.set=r),Ts(r=l.init)&&ne.unshift(r));return o||dy(e,i),_&&Al(i,n,_),g?o^4?a:_:i},Sl=(e,t,n)=>t.has(e)||ls("Cannot "+n),uy=(e,t)=>Object(t)!==t?ls('Cannot use the "in" operator on this value'):e.has(t),Qe=(e,t,n)=>(Sl(e,t,"read from private field"),n?n.call(e):t.get(e)),pt=(e,t,n)=>t.has(e)?ls("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(e):t.set(e,n),Xe=(e,t,n,s)=>(Sl(e,t,"write to private field"),s?s.call(e,n):t.set(e,n),n),Me=(e,t,n)=>(Sl(e,t,"access private method"),n),Pp,Np,Op,Rr,Dp,ii,ai,ri,oi,Rn,nn,li,ci,Na,vt,$l,Cl,Tl,Te,Lp,Fp,Rp,Up,Bp,_n,Wp,zp,Vp,Hp,Il,Ur,jl,Br,Ml,qp,Kp;Dp=[$t("asljs-list")];class Yn extends(Rr=ht,Op=[le({attribute:!1})],Np=[le({attribute:!1})],Pp=[le({attribute:!1})],Rr){constructor(){super(...arguments),pt(this,Te),pt(this,ii,null),pt(this,ai,null),pt(this,ri,null),pt(this,oi,[]),pt(this,Rn,null),pt(this,nn,null),pt(this,li,!1),pt(this,ci,!1),pt(this,Na,()=>{this.requestUpdate()}),pt(this,$l,fn(vt,8,this,[])),fn(vt,11,this),pt(this,Cl,fn(vt,12,this)),fn(vt,15,this),pt(this,Tl,fn(vt,16,this,null)),fn(vt,19,this)}createRenderRoot(){return this}connectedCallback(){super.connectedCallback(),Me(this,Te,Lp).call(this),Me(this,Te,Ur).call(this),Me(this,Te,Br).call(this)}disconnectedCallback(){Me(this,Te,jl).call(this),Me(this,Te,Il).call(this),Me(this,Te,Ml).call(this),super.disconnectedCallback()}render(){const t=Me(this,Te,_n).call(this,"empty"),n=Me(this,Te,_n).call(this,"item"),s=Me(this,Te,_n).call(this,"container");return this.items.length===0?t?Le`
          <div data-role="empty-template-host"></div>
        `:De:n?s?Le`
        <div data-role="container-template-host"></div>
      `:Le`
      <div data-role="default-container-host">
      </div>
    `:De}updated(t){t.has("items")&&Me(this,Te,Ur).call(this),t.has("theme")&&Me(this,Te,Br).call(this),Me(this,Te,Fp).call(this)}}vt=ly(Rr);ii=new WeakMap;ai=new WeakMap;ri=new WeakMap;oi=new WeakMap;Rn=new WeakMap;nn=new WeakMap;li=new WeakMap;ci=new WeakMap;Na=new WeakMap;$l=new WeakMap;Cl=new WeakMap;Tl=new WeakMap;Te=new WeakSet;Lp=function(){Xe(this,ii,null),Xe(this,ai,null),Xe(this,ri,null),Xe(this,li,!1),Xe(this,ci,!1);const e=this.querySelectorAll("template[data-slot]");for(const t of e){const n=t.getAttribute("data-slot"),s=document.createElement("template");s.content.append(t.content.cloneNode(!0)),n==="empty"&&Xe(this,ai,s),n==="item"&&Xe(this,ri,s),n==="container"&&Xe(this,ii,s)}};Fp=function(){Me(this,Te,Rp).call(this),Me(this,Te,Up).call(this)};Rp=function(){const e=Me(this,Te,_n).call(this,"empty");if(!e||this.items.length>0)return;const t=this.querySelector('[data-role="empty-template-host"]');t&&t.replaceChildren(e.content.cloneNode(!0))};Up=function(){Me(this,Te,Il).call(this);const e=Me(this,Te,_n).call(this,"item");if(!e||this.items.length===0){!e&&this.items.length>0&&Me(this,Te,qp).call(this);return}const t=Me(this,Te,Bp).call(this);if(!t)return;const n=[],s=this.items.length;for(let i=0;i<this.items.length;i++){const a=this.items[i],r={item:a,index:i,context:Me(this,Te,Hp).call(this,a,i),first:i===0,last:i===s-1,odd:i%2===1,even:i%2===0,count:s},l=e.content.cloneNode(!0);Me(this,Te,Vp).call(this,l,r),n.push(...l.childNodes)}t.replaceChildren(...n)};Bp=function(){const e=Me(this,Te,_n).call(this,"container");if(e){const n=this.querySelector('[data-role="container-template-host"]');if(!n)return null;const s=e.content.cloneNode(!0),i=s.querySelector('[data-role="items"]');return n.replaceChildren(s),i||(Me(this,Te,Kp).call(this),null)}return this.querySelector('[data-role="default-container-host"]')};_n=function(e){return Me(this,Te,Wp).call(this,e)??Me(this,Te,zp).call(this,e)};Wp=function(e){return e==="container"?Qe(this,ii):e==="empty"?Qe(this,ai):Qe(this,ri)};zp=function(e){var n,s;const t=this.theme??((n=Qe(this,nn))==null?void 0:n.theme)??xa();return no((s=t.list)==null?void 0:s[e],this)};Vp=function(e,t){const n=vi(e,t);Qe(this,oi).push(n)};Hp=function(e,t){if(this.context===null||this.context===void 0||typeof this.context!="object")return this.context;const n=this.context,s=Object.create(n);s.item=e,s.index=t;for(const i of Object.keys(n)){const a=n[i];typeof a=="function"&&(s[i]=a.bind(s))}return s};Il=function(){for(const e of Qe(this,oi))e();Xe(this,oi,[])};Ur=function(){Me(this,Te,jl).call(this);const e=py(this.items);if(!e)return;const t=[],n=()=>{this.requestUpdate()};for(const s of["set","delete","define"]){const i=e.on(s,n);t.push(()=>{i()})}Xe(this,Rn,()=>{for(const s of t)s()})};jl=function(){Qe(this,Rn)&&(Qe(this,Rn).call(this),Xe(this,Rn,null))};Br=function(){var t;const e=this.theme?null:ka(this);Qe(this,nn)!==e&&(Me(this,Te,Ml).call(this),Xe(this,nn,e),(t=Qe(this,nn))==null||t.addEventListener(Yt,Qe(this,Na)))};Ml=function(){var e;(e=Qe(this,nn))==null||e.removeEventListener(Yt,Qe(this,Na)),Xe(this,nn,null)};qp=function(){Qe(this,li)||(Xe(this,li,!0),console.warn('asljs-list: missing required template[data-slot="item"] for non-empty items.'))};Kp=function(){Qe(this,ci)||(Xe(this,ci,!0),console.warn('asljs-list: container template must include [data-role="items"].'))};Pa(vt,4,"items",Op,Yn,$l);Pa(vt,4,"context",Np,Yn,Cl);Pa(vt,4,"theme",Pp,Yn,Tl);Yn=Pa(vt,0,"List",Dp,Yn);fn(vt,1,Yn);function py(e){return Gr(e)??null}const hy=globalThis.HTMLElement??class{};var Un;class fy extends hy{constructor(){super(...arguments);hs(this,Un,null)}get theme(){return Li(this,Un)}set theme(n){Li(this,Un)!==n&&(Ba(this,Un,n??null),typeof Event=="function"&&"dispatchEvent"in this&&this.dispatchEvent(new Event(Yt,{bubbles:!1})))}}Un=new WeakMap;globalThis.customElements&&!customElements.get("asljs-theme-provider")&&customElements.define("asljs-theme-provider",fy);function ct(e){return new Promise((t,n)=>{e.addEventListener("success",()=>{t(e.result)}),e.addEventListener("error",()=>{n(e.error??new Error("IndexedDB request failed"))})})}function my(e,t){return new Promise((n,s)=>{const i=indexedDB.open(e,t.length);i.addEventListener("upgradeneeded",a=>{const r=t.slice(a.oldVersion,a.newVersion??t.length);for(const l of r)l(i.result)}),i.addEventListener("success",()=>{n(i.result)}),i.addEventListener("blocked",()=>{s(new Error("Database opening is blocked"))}),i.addEventListener("error",()=>{s(i.error??new Error("Failed to open database"))})})}const gy="asljs-app-builder";let Bi=null;async function Xt(){return Bi!==null||(Bi=await my(gy,[e=>{e.createObjectStore("apps",{keyPath:"id"}),e.createObjectStore("files",{keyPath:"id"}).createIndex("byAppId","appId",{unique:!1})},e=>{e.createObjectStore("chatSecrets",{keyPath:"appId"})},by])),Bi}function by(e){e.objectStoreNames.contains("apps")||e.createObjectStore("apps",{keyPath:"id"}),e.objectStoreNames.contains("files")||e.createObjectStore("files",{keyPath:"id"}).createIndex("byAppId","appId",{unique:!1}),e.objectStoreNames.contains("chatSecrets")||e.createObjectStore("chatSecrets",{keyPath:"appId"})}async function yy(){const t=(await Xt()).transaction("apps","readonly");return ct(t.objectStore("apps").getAll())}async function Tn(e){const n=(await Xt()).transaction("apps","readwrite");await ct(n.objectStore("apps").put(e))}async function vy(e){const n=(await Xt()).transaction(["apps","files","chatSecrets"],"readwrite");await ct(n.objectStore("apps").delete(e));const s=n.objectStore("files"),i=await ct(s.index("byAppId").getAllKeys(e));for(const a of i)await ct(s.delete(a));await ct(n.objectStore("chatSecrets").delete(e))}async function wy(e){const n=(await Xt()).transaction("files","readonly");return ct(n.objectStore("files").index("byAppId").getAll(e))}async function di(e){const n=(await Xt()).transaction("files","readwrite");await ct(n.objectStore("files").put(e))}async function _y(e){const n=(await Xt()).transaction("files","readwrite");await ct(n.objectStore("files").delete(e))}async function Ii(e,t){const i=(await Xt()).transaction("files","readwrite").objectStore("files"),a=await ct(i.index("byAppId").getAllKeys(e));for(const r of a)await ct(i.delete(r));for(const r of t)await ct(i.put(r))}async function Pl(e){const n=(await Xt()).transaction("chatSecrets","readonly"),s=await ct(n.objectStore("chatSecrets").get(e));return typeof(s==null?void 0:s.openAiApiKey)=="string"?s.openAiApiKey:""}async function Oa(e,t){const s=(await Xt()).transaction("chatSecrets","readwrite");await ct(s.objectStore("chatSecrets").put({appId:e,openAiApiKey:t}))}function Gp(e){const t=e.trim(),n=/^data:([^;,]+);base64,([a-z0-9+/]+=*)$/i.exec(t.replace(/\s+/g,""));return n===null?null:{mimeType:n[1].toLowerCase(),base64:n[2],dataUrl:t}}function qe(e,t,n,s){return{name:e,type:"function",description:t,parameters:{type:"object",properties:n||{},required:s||[],additionalProperties:!1},strict:!0}}const Jp=[qe("listFileset","List all file paths in the virtual filesystem."),qe("listFilesByMask","List file paths that match a glob-like mask such as src/*.js or assets/**/*.png.",{mask:{type:"string"},maxFiles:{type:"number"}},["mask","maxFiles"]),qe("readFile","Read the full text content of a file.",{path:{type:"string"}},["path"]),qe("readFiles","Read several files in one step. Use maxCharsPerFile to cap each returned file content.",{paths:{type:"array",items:{type:"string"}},maxCharsPerFile:{type:"number"}},["paths","maxCharsPerFile"]),qe("readFilesByMask","Read all files that match a glob-like mask in one step. Use maxFiles and maxCharsPerFile to keep results bounded.",{mask:{type:"string"},maxFiles:{type:"number"},maxCharsPerFile:{type:"number"}},["mask","maxFiles","maxCharsPerFile"]),qe("readFileData","Read a binary-safe file stored as a data URL. Returns MIME type, base64 payload, and data URL, or null when the file is plain text.",{path:{type:"string"}},["path"]),qe("setFilesContent","Create or fully replace several text files in one step.",{files:{type:"array",items:{type:"object",properties:{path:{type:"string"},content:{type:"string"}},required:["path","content"],additionalProperties:!1}}},["files"]),qe("setFileData","Create or replace a binary-safe file from base64 data. Use this for image assets that should be referenced by path from HTML or CSS.",{path:{type:"string"},mimeType:{type:"string"},base64:{type:"string"}},["path","mimeType","base64"]),qe("setFileContent","Create or fully replace file content.",{path:{type:"string"},content:{type:"string"}},["path","content"]),qe("replaceFilePart","Replace part of a file by exact search string.",{path:{type:"string"},search:{type:"string"},replacement:{type:"string"},replaceAll:{type:"boolean"}},["path","search","replacement","replaceAll"]),qe("deleteFile","Delete a file from the virtual filesystem.",{path:{type:"string"}},["path"]),qe("grep","Search matching files with a regular expression and return matching lines.",{mask:{type:"string"},pattern:{type:"string"},flags:{type:"string"},maxMatches:{type:"number"}},["mask","pattern","flags","maxMatches"]),qe("choose","Show a short list of clickable choices in the chat UI. Use this when asking the user to pick from a few clear options.",{question:{type:"string"},options:{type:"array",items:{type:"string"}}},["question","options"]),qe("evalInApp","Evaluate JavaScript in the running app document context.",{code:{type:"string"}},["code"]),qe("assertInApp","Run a JavaScript check in the app context and fail if it throws or returns false.",{code:{type:"string"},message:{type:"string"}},["code","message"]),qe("runAppTests","Run the JavaScript test module stored in app.tests.js or another specified file. The app restarts before each test.",{path:{type:"string"}},["path"]),qe("startGeneration","Queue the generation lane to start after the current chat turn finishes."),qe("getAppDiagnostics","Get current runtime logs and errors from the running app."),qe("runAppAndCollectDiagnostics","Run the app and collect runtime logs and errors after startup.")],Kc=350;function xy(e){async function t(){return[...e.getFiles()].map(u=>u.name).sort((u,x)=>u.localeCompare(x))}async function n(u,x=100){return Gc(e,u,x)}async function s(u){const x=ms(e,u),O=x===null?void 0:e.getFiles().find(Q=>Q.name===x);if(O===void 0)throw new Error(`File not found: ${u}`);return O.content}async function i(u,x=0){const O={};for(const Q of u)O[Q]=Sy(await s(Q),x);return O}async function a(u,x=100,O=0){return i(await n(u,x),O)}async function r(u){return Gp(await s(u))}async function l(u,x){const O=ky(e),Q=ui(u),re=ms(e,Q),be=e.getFiles().find(ue=>ue.name===(re??Q));if(be!==void 0){const ue={...be,content:x};await e.saveFile(ue),e.setFiles(e.getFiles().map(q=>q.id===ue.id?ue:q)),e.setActiveFileName(ue.name);return}const Fe={id:e.createFileId(),appId:O,name:Q,content:x};await e.saveFile(Fe),e.setFiles([...e.getFiles(),Fe]),e.setActiveFileName(Fe.name)}async function m(u,x,O){await l(u,`data:${Ey(x)};base64,${Ay(O)}`)}async function h(u){for(const x of u)await l(x.path,x.content)}async function y(u){const x=ms(e,u),O=x===null?void 0:e.getFiles().find(re=>re.name===x);if(O===void 0)return;await e.deleteFileById(O.id);const Q=e.getFiles().filter(re=>re.id!==O.id);e.setFiles(Q),e.getActiveFileName()===u&&e.setActiveFileName(Ny(Q))}async function o(u,x,O,Q=!1){if(x==="")throw new Error("Search text cannot be empty.");const re=ms(e,u);if(re===null)throw new Error(`File not found: ${u}`);const be=await s(re);if(!be.includes(x))throw new Error(`Search text not found in ${re}.`);let Fe=be;if(Q)Fe=be.split(x).join(O);else{const ue=be.indexOf(x);if(be.indexOf(x,ue+x.length)!==-1)throw new Error("Search text is ambiguous. Use replaceAll=true or provide a more specific search block.");Fe=be.slice(0,ue)+O+be.slice(ue+x.length)}await l(re,Fe)}async function k(u){if(e.getFiles().length===0)throw new Error("No files available to run.");e.runApp();try{return await e.evaluateInApp(u)}catch{return e.runApp(),e.evaluateInApp(u)}}async function g(u,x,O="",Q=100){const re=[],be=Cy(x,O);for(const Fe of Gc(e,u,Number.MAX_SAFE_INTEGER)){const q=(await s(Fe)).split(/\r?\n/);for(let Ct=0;Ct<q.length;Ct+=1)if(be.lastIndex=0,!!be.test(q[Ct])&&(re.push({path:Fe,line:Ct+1,text:q[Ct]}),re.length>=Q))return re}return re}async function $(u,x){const O=u.trim(),Q=x.map(re=>re.trim()).filter(re=>re!=="");if(O==="")throw new Error("Choice question cannot be empty.");if(Q.length<2)throw new Error("Choice options must include at least two items.");e.showChoicePrompt(O,Q)}async function te(u,x){const O=await k(u);if(O===!1)throw new Error((x==null?void 0:x.trim())||"App assertion returned false.");return O}async function ne(u="app.tests.js"){const x=ms(e,u);if(x===null)throw new Error(`Test file not found: ${u}`);const O=await Iy(x,await s(x)),Q=[];for(const re of O)try{e.runApp(),await e.wait(e.diagnosticsDelayMs??Kc);const be={evalInApp:Fe=>e.evaluateInApp(Fe),assertInApp:async(Fe,ue)=>{const q=await e.evaluateInApp(Fe);if(q===!1)throw new Error((ue==null?void 0:ue.trim())||"App assertion returned false.");return q},getAppDiagnostics:X,wait:e.wait};await re.run(be),Q.push({name:re.name,ok:!0})}catch(be){Q.push({name:re.name,ok:!1,error:be instanceof Error?be.message:String(be)})}return{path:x,total:Q.length,passed:Q.filter(re=>re.ok).length,failed:Q.filter(re=>!re.ok).length,results:Q}}async function X(){return e.getAppDiagnostics()}async function _(){return e.runApp(),await e.wait(e.diagnosticsDelayMs??Kc),e.getAppDiagnostics()}async function H(){if(e.startGeneration===void 0)throw new Error("Generation control is not available in this lane.");return e.startGeneration()}return{listFileset:t,listFilesByMask:n,readFile:s,readFiles:i,readFilesByMask:a,readFileData:r,setFilesContent:h,setFileData:m,setFileContent:l,deleteFile:y,replaceFilePart:o,grep:g,choose:$,evalInApp:k,assertInApp:te,runAppTests:ne,startGeneration:H,getAppDiagnostics:X,runAppAndCollectDiagnostics:_}}function ky(e){const t=e.getCurrentAppId();if(t===null)throw new Error("No active app. Create or open an app first.");return t}function ui(e){const t=e.trim().replace(/\\/g,"/").replace(/^\.\//,"").replace(/^\/+/,"");if(t==="")throw new Error("Path cannot be empty.");if(t.includes(".."))throw new Error("Parent path segments are not allowed.");return t}function Ey(e){const t=e.trim().toLowerCase();if(t==="")throw new Error("MIME type cannot be empty.");if(!/^[a-z0-9!#$&^_.+-]+\/[a-z0-9!#$&^_.+-]+$/i.test(t))throw new Error(`Invalid MIME type: ${e}`);return t}function Ay(e){const t=e.trim().replace(/^data:[^,]+,/,"").replace(/\s+/g,"");if(t==="")throw new Error("Base64 data cannot be empty.");if(!/^[a-z0-9+/]+=*$/i.test(t))throw new Error("Base64 data contains invalid characters.");return t}function Sy(e,t){if(!Number.isFinite(t)||t<=0)return e;const n=Math.floor(t);return e.length<=n?e:`${e.slice(0,n)}
...[truncated]`}function Gc(e,t,n){const s=$y(t),i=Ty(n,100);return e.getFiles().map(a=>a.name).filter(a=>s.test(ui(a))).sort((a,r)=>a.localeCompare(r)).slice(0,i)}function $y(e){const n=ui(e).replace(/[.+^${}()|[\]\\]/g,"\\$&").replace(/\*\*/g,"::DOUBLE_STAR::").replace(/\*/g,"[^/]*").replace(/\?/g,"[^/]").replace(/::DOUBLE_STAR::/g,".*");return new RegExp(`^${n}$`,"i")}function Cy(e,t){const n=Array.from(new Set(t.replace(/g/g,"").split(""))).join("");return new RegExp(e,n)}function Ty(e,t){return!Number.isFinite(e)||e<=0?t:Math.floor(e)}async function Iy(e,t){return e.toLowerCase().endsWith(".json")?Py(t):jy(t)}async function jy(e){var i;const n=await import(`data:text/javascript;charset=utf-8,${encodeURIComponent(e)}`),s=Array.isArray(n.default)?n.default:(i=n.default)==null?void 0:i.tests;if(!Array.isArray(s))throw new Error("Test module must export an array or an object with a tests array as the default export.");return s.map((a,r)=>My(a,r))}function My(e,t){if(e===null||typeof e!="object")throw new Error(`Invalid test case at index ${t}.`);const n=e;if(typeof n.name!="string"||n.name.trim()==="")throw new Error(`Test case ${t+1} is missing a name.`);if(typeof n.run!="function")throw new Error(`Test case ${n.name} is missing run().`);const s=n.run;return{name:n.name,run:async i=>{await s(i)}}}function Py(e){let t;try{t=JSON.parse(e)}catch{throw new Error("Test suite file must be valid JSON.")}const n=Array.isArray(t)?t:t.tests;if(!Array.isArray(n))throw new Error("Test suite file must be an array or an object with a tests array.");return n.map((s,i)=>{if(s===null||typeof s!="object")throw new Error(`Invalid test case at index ${i}.`);const a=s;if(typeof a.name!="string"||a.name.trim()==="")throw new Error(`Test case ${i+1} is missing a name.`);if(typeof a.code!="string"||a.code.trim()==="")throw new Error(`Test case ${a.name} is missing code.`);return{name:a.name,run:async r=>{if(await r.evalInApp(a.code)===!1)throw new Error("Test returned false.")}}})}function Ny(e){var t;return((t=e[0])==null?void 0:t.name)??null}function ms(e,t){const n=ui(t),s=e.getFiles().find(i=>ui(i.name).toLowerCase()===n.toLowerCase());return(s==null?void 0:s.name)??null}function Oy(e){return typeof e!="object"||e===null?!1:e.type==="function_call"}function Yp(e){if(typeof e.name!="string"||e.name.trim()==="")throw new Error("Tool call missing function name.");return e.name}function Dy(e){if(typeof e.call_id!="string"||e.call_id.trim()==="")throw new Error("Tool call missing call_id.");return e.call_id}async function Xp(e,t){const n=Yp(e),s=Ly(e.arguments);try{switch(n){case"listFileset":{const i=await t.listFileset();return Ke(i)}case"listFilesByMask":{const i=await t.listFilesByMask(ze(s,"mask"),gs(s,"maxFiles",100));return Ke(i)}case"readFile":{const i=await t.readFile(ze(s,"path"));return Ke(i)}case"readFiles":{const i=await t.readFiles(Jc(s,"paths"),gs(s,"maxCharsPerFile",0));return Ke(i)}case"readFilesByMask":{const i=await t.readFilesByMask(ze(s,"mask"),gs(s,"maxFiles",100),gs(s,"maxCharsPerFile",0));return Ke(i)}case"readFileData":{const i=await t.readFileData(ze(s,"path"));return Ke(i)}case"setFilesContent":return await t.setFilesContent(Fy(s,"files")),Ke("ok");case"setFileData":return await t.setFileData(ze(s,"path"),ze(s,"mimeType"),ze(s,"base64")),Ke("ok");case"setFileContent":return await t.setFileContent(ze(s,"path"),ze(s,"content")),Ke("ok");case"replaceFilePart":return await t.replaceFilePart(ze(s,"path"),ze(s,"search"),ze(s,"replacement"),Ry(s,"replaceAll",!1)),Ke("ok");case"deleteFile":return await t.deleteFile(ze(s,"path")),Ke("ok");case"grep":{const i=await t.grep(ze(s,"mask"),ze(s,"pattern"),ze(s,"flags",""),gs(s,"maxMatches",100));return Ke(i)}case"choose":return await t.choose(ze(s,"question"),Jc(s,"options")),Ke("ok");case"evalInApp":{const i=await t.evalInApp(ze(s,"code"));return Ke(i)}case"assertInApp":{const i=await t.assertInApp(ze(s,"code"),ze(s,"message",""));return Ke(i)}case"runAppTests":{const i=await t.runAppTests(ze(s,"path","app.tests.js"));return Ke(i)}case"startGeneration":{const i=await t.startGeneration();return Ke(i)}case"getAppDiagnostics":{const i=await t.getAppDiagnostics();return Ke(i)}case"runAppAndCollectDiagnostics":{const i=await t.runAppAndCollectDiagnostics();return Ke(i)}default:return Yc(`Unknown tool: ${n}`)}}catch(i){return Yc(i instanceof Error?i.message:String(i))}}function Ly(e){if(e===void 0)return{};if(typeof e=="object"&&e!==null)return e;if(typeof e!="string")throw new Error("Invalid tool arguments value.");try{const t=JSON.parse(e);if(typeof t!="object"||t===null)throw new Error("Tool arguments must be a JSON object.");return t}catch{throw new Error("Invalid tool arguments JSON.")}}function ze(e,t,n){const s=e[t];if(s===void 0&&n!==void 0)return n;if(typeof s!="string")throw new Error(`Tool argument "${t}" must be a string.`);return s}function Jc(e,t){const n=e[t];if(!Array.isArray(n)||n.some(s=>typeof s!="string"))throw new Error(`Tool argument "${t}" must be an array of strings.`);return n}function Fy(e,t){const n=e[t];if(!Array.isArray(n))throw new Error(`Tool argument "${t}" must be an array.`);return n.map((s,i)=>{if(typeof s!="object"||s===null||Array.isArray(s))throw new Error(`Tool argument "${t}" entry ${i+1} must be an object.`);const a=s;if(typeof a.path!="string"||typeof a.content!="string")throw new Error(`Tool argument "${t}" entry ${i+1} must include string path and content fields.`);return{path:a.path,content:a.content}})}function gs(e,t,n){const s=e[t];if(s===void 0)return n;if(typeof s!="number"||Number.isNaN(s))throw new Error(`Tool argument "${t}" must be a number.`);return s}function Ry(e,t,n){const s=e[t];if(s===void 0)return n;if(typeof s!="boolean")throw new Error(`Tool argument "${t}" must be a boolean.`);return s}function Ke(e){return Qp({ok:!0,value:e})}function Yc(e){return Qp({ok:!1,error:e})}function Qp(e){try{return JSON.stringify(e)}catch{return'{"ok":false,"error":"Failed to serialize tool result."}'}}const Zp="https://api.openai.com/v1/responses",Yi="gpt-5.3-codex",pi=20,Uy="You are an expert ASLJS app generator.",By="AI exceeded maximum tool steps without completing.",Wy="Generation stopped by the user.",zy=12;class Vy extends Error{constructor(t){super(By),this.name="ToolStepLimitExceededError",this.stepsCompleted=t.stepsCompleted,this.stepLimit=t.stepLimit}}class Wr extends Error{constructor(){super(Wy),this.name="GenerationStoppedError"}}const Hy={createResponse:async e=>{const t=await fetch(Zp,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${e.apiKey}`},body:JSON.stringify({model:e.model,instructions:e.instructions,temperature:e.temperature,previous_response_id:e.previous_response_id,input:e.input,tools:e.tools})});if(!t.ok){const n=await t.json().catch(()=>({})),s=eh(n)??`OpenAI API error: ${t.status}`;throw new Error(s)}return t.json()}},qy={listModels:async e=>{const t=await fetch(Zp.replace("/responses","/models"),{method:"GET",headers:{Authorization:`Bearer ${e}`}});if(!t.ok){const s=await t.json().catch(()=>({})),i=eh(s)??`OpenAI API error: ${t.status}`;throw new Error(i)}const n=await t.json();if(!Array.isArray(n.data))throw new Error("OpenAI returned an unexpected model list format.");return n.data.filter(s=>typeof s=="object"&&s!==null).map(s=>({id:typeof s.id=="string"?s.id:"",created:typeof s.created=="number"?s.created:0})).filter(s=>s.id!=="")}};async function Ky(e,t=qy){return e.trim()===""?[]:t.listModels(e)}async function Gy(e,t,n,s,i){var o,k,g;const a=(i==null?void 0:i.transport)??Hy,r=(i==null?void 0:i.systemPrompt)??Uy;let l,m=e,h=Jy(i==null?void 0:i.initialToolStepLimit),y=0;for(;;){if(((o=i==null?void 0:i.shouldStop)==null?void 0:o.call(i))===!0)throw new Wr;if(await bs(i,`Step ${y+1}: requesting assistant response...`),y>=h){if(!(await((k=i==null?void 0:i.onToolStepLimit)==null?void 0:k.call(i,{stepsCompleted:y,stepLimit:h}))??!1))throw new Vy({stepsCompleted:y,stepLimit:h});h+=zy,await bs(i,`Extended step limit to ${h}. Continuing...`)}const $=await a.createResponse({apiKey:t,model:n,instructions:r,temperature:.1,previous_response_id:l,input:m,tools:Jp});if(!Array.isArray($.output))throw new Error("AI returned an unexpected response format.");const te=$.output.filter(Oy);if(te.length===0){await bs(i,`Completed in ${y+1} step(s). Finalizing summary...`);const X=Yy($);return{summary:X===""?"Completed tool-based update.":X}}const ne=[];for(const X of te){if(((g=i==null?void 0:i.shouldStop)==null?void 0:g.call(i))===!0)throw new Wr;await bs(i,`Step ${y+1}: running ${Yp(X)}...`);const _=await Xp(X,s);ne.push({type:"function_call_output",call_id:Dy(X),output:_})}await bs(i,`Step ${y+1}: submitted ${ne.length} tool result(s).`),l=typeof $.id=="string"?$.id:l,m=ne,y+=1}}function Jy(e){if(!Number.isFinite(e))return pi;const t=Math.floor(e);return t>=1?t:pi}async function bs(e,t){(e==null?void 0:e.onProgress)!==void 0&&await Promise.resolve(e.onProgress(t))}function eh(e){const t=e.error;return typeof(t==null?void 0:t.message)=="string"?t.message:null}function Yy(e){return typeof e.output_text=="string"&&e.output_text.trim()!==""?e.output_text.trim():Array.isArray(e.output)?e.output.filter(n=>n.type==="message").flatMap(n=>n.content??[]).map(n=>n.text??"").map(n=>n.trim()).filter(n=>n!=="").join(`
`):""}const th=`# ASLJS Observable AI Guidance

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
`,nh="# ASLJS Eventful AI Guidance\n\n## Purpose\n\nUse this file as AI-facing guidance for `asljs-eventful`.\n\nThis package adds lightweight event methods to plain objects and provides a\nbase class for event-capable types.\n\n## Package Scope\n\nExports from `src/index.ts`:\n\n- `eventful`\n- `EventfulBase`\n- `EventfulLike`, `isEventfulLike`, `asEventfulLike`\n- event-related types and `ListenerError`\n\n## AI Quick Reference\n\nMain exports:\n\n- `eventful` to add event methods to an object or instance\n- `EventfulBase` for class hierarchies that should be event-capable by design\n- `isEventfulLike` and `asEventfulLike` for compatibility checks\n- `Eventful`, `EventMap`, `EventfulOptions`, `Listener`, and related types for\n  TypeScript usage\n- `ListenerError` for listener-failure handling\n\nChoose this API when:\n\n- plain object or existing instance needs events -> use `eventful(target)`\n- class hierarchy is under your control -> use `EventfulBase`\n- class cannot change inheritance -> call `eventful(this)` in the constructor\n- code needs to accept unknown values safely -> use `isEventfulLike` or\n  `asEventfulLike`\n- TypeScript event signatures matter -> define an event map and use the\n  exported eventful types\n\nStable public behaviors:\n\n- `eventful` adds `on`, `once`, `off`, `emit`, `emitAsync`, and `has`\n- the package-level `eventful` function is also a global emitter\n- strict mode propagates listener errors\n- non-strict mode routes listener failures through the configured error path\n- `trace`, `strict`, and `error` are public option behaviors\n\nSpecial behavior:\n\n- `eventful` is both the object enhancer and the package-level global emitter\n- lifecycle, trace, and listener-error changes must preserve that global\n  emitter contract\n\nDo not assume:\n\n- DOM `EventTarget` terminology or behavior maps directly to this package\n- event bubbling or capture semantics exist here\n- wildcard events are supported\n- listener return values control emit flow\n- strict mode is the default\n\nAvoid this when:\n\n- you are removing or bypassing the global-emitter behavior of `eventful`\n- you are introducing heavier abstractions where object enhancement is enough\n\nCommon mistakes:\n\n- treating `eventful(target)` and `EventfulBase` as interchangeable style only\n  rather than a design choice\n- forgetting that strict and non-strict error flows are intentionally different\n- changing trace or lifecycle behavior without preserving package-level\n  `eventful` events\n- using internal source files instead of the package-root export surface\n\n## Preferred Usage Patterns\n\n- Use `eventful(target)` to enhance plain objects or class instances.\n- Use `EventfulBase` when inheritance is already the natural design.\n- In TypeScript, declare event maps and use the exported `Eventful<...>` types\n  to preserve listener signatures.\n- Prefer package event semantics over DOM `EventTarget` semantics when working\n  inside this package.\n\n## Stable Behavior\n\nTreat these as public contract behaviors that should not drift silently:\n\n- `eventful` adds `on`, `once`, `off`, `emit`, `emitAsync`, and `has`\n- `eventful` also acts as a package-level global emitter\n- strict mode propagates listener errors\n- non-strict mode isolates listener failures through the configured error path\n- `ListenerError` protects against recursive failures in global error handling\n\n## Constraints To Preserve\n\n- The core object API is `on`, `once`, `off`, `emit`, `emitAsync`, and `has`.\n- The package-level `eventful` function is also a global emitter for lifecycle\n  and error events; do not remove that behavior silently.\n- `trace`, `strict`, and `error` options are documented public behavior.\n- Strict mode propagates listener errors; non-strict flows route them through\n  the configured error handler.\n- Keep the library lightweight and object-oriented; avoid introducing heavier\n  abstractions unless explicitly requested.\n\n## Change Safety Checklist\n\n- If changing error behavior, then verify both strict and non-strict flows.\n- If changing trace behavior, then verify both package-level and per-instance\n  trace paths.\n- If changing lifecycle events, then preserve the package-level global emitter\n  behavior.\n- If changing typing, then preserve listener signatures in the TypeScript\n  usage patterns.\n\n## Validation\n\n- `npm -w asljs-eventful run test`\n- `npm -w asljs-eventful run typecheck`\n- `npm -w asljs-eventful run lint`\n\n## Related Packages\n\n- If the task is really about property change tracking, move to\n  `asljs-observable`.\n- If the task is really about DOM binding or browser template updates, move to\n  `asljs-data-binding`.\n\nUpdate this file when AI-facing constraints, exported surface expectations, or\nvalidation commands change. Update `README.md` separately only when\nuser-facing behavior changes.\n",sh=`# ASLJS Data Binding AI Guidance

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
`,ih='# ASLJS Components AI Guidance\n\n## Purpose\n\nUse this file as AI-facing guidance for `asljs-components`.\n\nThis package currently exports the `AssistedInput`, `Button`, `Keyboard`,\n`Letterpad`, `List`, `Numpad`, `Properties`, `Select`, and `TextInput` UI\nclasses/components, the `AiChat` custom element plus AI chat model helpers and\ntransport classes (`OpenAiTransport`), the `AiChatKeyPrompt` custom element for\nuser-supplied API key collection, the `FileView` web component plus file\nhandlers, runtime component model definitions, package theming helpers, a theme\nprovider custom element, and related types.\n\n## Package Scope\n\nExports from `src/index.ts`:\n\n- `AiChat`\n- `AiChatKeyPrompt`\n- `createAiChatModel`\n- `serializeAiChatModelState`\n- `OpenAiTransport`\n- `createBootstrapTheme`\n- `AiChatModelDefinition`\n- `AllComponentModelDefinitions`\n- `AssistedInput`\n- `AssistedInputModelDefinition`\n- `Button`\n- `ButtonModelDefinition`\n- `FileView`\n- `FileViewModelDefinition`\n- `Keyboard`\n- `KeyboardModelDefinition`\n- `Letterpad`\n- `LetterpadModelDefinition`\n- `Numpad`\n- `NumpadModelDefinition`\n- `Properties`\n- `PropertiesModelDefinition`\n- `createPdfFileHandler`\n- `createImageFileHandler`\n- `createTextFileHandler`\n- `createTextEditorFileHandler`\n- `List`\n- `ListModelDefinition`\n- `Select`\n- `SelectModelDefinition`\n- `TextInput`\n- `TextInputModelDefinition`\n- `ThemeProvider`\n- `ThemeProviderModelDefinition`\n- `findThemeProvider`\n- `getComponentVariantList`\n- `getDefaultTheme`\n- `resolveThemeText`\n- `resolveThemeTemplate`\n- `setDefaultTheme`\n- `THEME_CHANGED_EVENT_NAME`\n- `THEME_PROVIDER_TAG_NAME`\n- `AiChatAfterResponseContext`\n- `AiChatBeforeSendContext`\n- `AiChatBuildRequestArgs`\n- `AiChatChoiceOption`\n- `AiChatChoicePrompt`\n- `AiChatInitializeContext`\n- `AiChatMessage`\n- `AiChatMessages`\n- `AiChatMessageRole`\n- `AiChatModel`\n- `AiChatOptions`\n- `AiChatTransport`\n- `AiChatProgressState`\n- `AiChatResponsesInputItem`\n- `AiChatSecretsAndSettingsProvider`\n- `AiChatSerializableState`\n- `AiChatStateStore`\n- `AiChatToolDefinition`\n- `AiChatToolStepLimitContext`\n- `AiChatKeySubmitDetail`\n- `AssistedInputButtonDefinition`\n- `AssistedInputKeyDetail`\n- `ComponentModelDefinition`\n- `ComponentModelPropertyDefinition`\n- `ComponentModelPropertyType`\n- `ButtonVariantThemeDefinition`\n- `ButtonThemeDefinition`\n- `ComponentsTheme`\n- `FileHandler`\n- `FileHandlerRenderContext`\n- `FileHandlerRenderResult`\n- `FileViewData`\n- `FileViewProvider`\n- `KeyboardKeyDetail`\n- `LetterpadKeyDetail`\n- `ListThemeDefinition`\n- `SelectChangeDetail`\n- `SelectItem`\n- `SelectStatus`\n- `SelectThemeDefinition`\n- `SelectValidator`\n- `NumpadKeyDetail`\n- `TextInputChangeDetail`\n- `TextInputEnterKeyBehavior`\n- `TextInputStatus`\n- `TextInputThemeDefinition`\n- `TextInputValidator`\n- `ThemeProviderLike`\n- `ThemeTextFactory`\n- `ThemeTextValue`\n- `ThemeTemplateValue`\n- `ThemeTemplateFactory`\n- `ListItem`\n- `ListItemsSource`\n- `ListRowContext`\n\nCurrent custom elements:\n\n- `asljs-ai-chat`\n- `asljs-ai-chat-key`\n- `asljs-file`\n- `asljs-list`\n- `asljs-button`\n- `asljs-properties`\n- `asljs-keyboard`\n- `asljs-numpad`\n- `asljs-letterpad`\n- `asljs-select`\n- `asljs-text-input`\n- `asljs-theme-provider`\n\nCurrent non-custom-element UI surface:\n\n- `AssistedInput`\n\n## AI Quick Reference\n\nComponent contract at a glance:\n\n- import with `import \'asljs-components\';`\n- custom elements: `asljs-ai-chat`, `asljs-ai-chat-key`, `asljs-button`,\n  `asljs-file`, `asljs-keyboard`, `asljs-letterpad`, `asljs-list`,\n  `asljs-numpad`, `asljs-properties`, `asljs-select`, `asljs-text-input`,\n  `asljs-theme-provider`\n- AI chat state lives on `asljs-ai-chat` direct properties (`messages`,\n  `promptDraft`, and related fields)\n- `options.transport` sets the HTTP transport for `asljs-ai-chat`; if omitted,\n  the component falls back to `options.provider.getOpenAiApiKey()`\n- `OpenAiTransport` is the built-in OpenAI Responses API transport class;\n  construct with an API key string\n- `asljs-ai-chat-key` is a small form component that collects an API key from\n  the user; it dispatches a `key-submit` event with `{ detail: { key } }` when\n  the user submits the key\n- `AssistedInput` is the shared Lit base for keyboard-like input surfaces\n- button rendering uses explicit `icon`, `text`, `buttonClassName`, and\n  optional `variant`; theme lookup checks variant-specific overrides first,\n  then base button defaults, with built-in package defaults for `add`,\n  `delete`, and `settings`\n- runtime model metadata is exported through `*ModelDefinition` values whose\n  `properties` arrays describe runtime-visible property names, types, and edit\n  metadata\n- `asljs-properties` renders generated editors from a model definition plus a\n  target object, using `asljs-text-input` for string/number and `asljs-select`\n  for boolean values\n- file viewing uses provider + ordered handler matching\n- keyboard uses a fixed QWERTY layout, a `characters` filter, and bubbling\n  `key` plus `submit` events\n- letterpad uses a fixed alphabetic layout, a `characters` filter, a\n  `collapsed` toggle, and bubbling `key` plus `submit` events\n- numpad uses a fixed keypad layout, a `characters` filter, and bubbling\n  `key` events\n- text input editing uses explicit properties plus `input` and `change`\n  events whose detail reports draft value, validity, and dirty state\n- theme provider element: `asljs-theme-provider`\n- required row template: `template[data-slot="item"]`\n- optional templates: `template[data-slot="empty"]` and\n  `template[data-slot="container"]`\n- optional text-input template: `template[data-slot="template"]`\n- optional text-input control templates: `template[data-slot="input"]` and\n  `template[data-slot="textarea"]`\n- optional select template: `template[data-slot="template"]`\n- optional select control template: `template[data-slot="select"]`\n- theme fallback order: local slot template -> `list.theme` -> nearest\n  `asljs-theme-provider` -> package default theme\n- container templates must include `[data-role="items"]`\n- text-input templates must include `[data-role="control-host"]`\n- text-input control templates must include a real `input` or `textarea`\n  element that matches the slot name\n- row bindings expose `item`, `index`, `first`, `last`, `odd`, `even`,\n  `count`, and `context`\n\nUse this package when:\n\n- you want reusable web components already designed for ASLJS patterns\n- you want a packaged UI surface with an explicit state contract and a custom\n  element tag\n- you specifically want `asljs-list` rather than raw DOM binding\n\nUse another package when:\n\n- you only need DOM binding -> `asljs-data-binding`\n- you need state reactivity -> `asljs-observable`\n- you need event primitives -> `asljs-eventful`\n\n## General Component Patterns\n\nThe package currently uses more than one component form.\n\n- `AssistedInput` is a shared Lit base class for keyboard-like inputs.\n- `FileView` is a Lit custom element driven by provider and handler properties.\n- `Keyboard` is a Lit custom element driven by a `characters` filter and event\n  dispatch through `AssistedInput`.\n- `Letterpad` is a Lit custom element driven by `characters`, `collapsed`, and\n  event dispatch through `AssistedInput`.\n- `List` is a Lit custom element with explicit properties.\n- `Button` is a Lit custom element driven by explicit icon/text properties,\n  an optional `variant`, and theme-backed defaults.\n- `Properties` is a Lit custom element that renders a generated property form\n  from runtime model metadata.\n- `Numpad` is a Lit custom element driven by a `characters` filter and key\n  event dispatch through `AssistedInput`.\n- `Select` is a Lit custom element with explicit items, validation, and\n  template properties.\n- `TextInput` is a Lit custom element with explicit reset-value, validation,\n  and template properties.\n- `ThemeProvider` is a lightweight `HTMLElement` provider.\n- `AiChat` is a Lit custom element with explicit state properties and `options`.\n- `AiChatKeyPrompt` is a Lit custom element that renders an API key input form;\n  it dispatches `key-submit` on the DOM when the user submits a non-empty key.\n\nPreserve the shared design rules across those forms.\n\n- keep state explicit on the custom element and separate from rendering\n- use the simplest rendering surface that fits the runtime need\n- keep model-to-view synchronization explicit\n- clean up subscriptions and listeners when components detach or rebind\n\n## Preferred Usage Patterns\n\n### Use ordered handlers for file display\n\nInside `asljs-file`, configure:\n\n- `provider.loadFile(fileName)` to return normalized file data\n- `handlers` ordered from most specific to most general\n- `fileName` for the selected file\n\nThe first handler whose `canDisplay(...)` returns true owns rendering.\n\nPrefer package handlers when they fit:\n\n- `createPdfFileHandler()`\n- `createImageFileHandler()`\n- `createTextFileHandler()`\n- `createTextEditorFileHandler()`\n\nIf text editing must persist, provide `provider.saveText(...)`.\n\n### Register components once\n\n```ts\nimport \'asljs-components\';\n```\n\nCreate and configure elements through normal DOM APIs.\n\n### Use the base button for icon-plus-text actions\n\nInside `asljs-button`, configure:\n\n- `icon` as an HTML string for the icon markup\n- `text` as the visible label\n- `variant` when the button should use theme-provided defaults such as `add`,\n  `delete`, or `settings`\n- `buttonClassName` when host CSS needs to target the inner native button\n- `type` and `disabled` for native button behavior\n\nPrefer `variant="add"`, `variant="delete"`, or `variant="settings"` when\ntheir defaults fit. Theme overrides live under\n`button.variants.<variantName>.icon`, `.text`, and `.className`. Explicit\n`icon`, `text`, and `buttonClassName` values still win over theme defaults.\n\nIf Bootstrap icon markup is desired, prefer `createBootstrapTheme()` over\nduplicating raw icon HTML literals at multiple call sites.\n\n### Use explicit reset-value semantics for text input\n\nInside `asljs-text-input`, configure:\n\n- `value` as the external set/reset value\n- `validator` to return an error message or `null`\n- `multiline` and `enterKeyBehavior` for editing behavior\n- `autoExtend` plus `autoExtendMaxRows` for textarea growth\n- `theme` or a local `template[data-slot="template"]` for layout override\n- local `template[data-slot="input"]` or `template[data-slot="textarea"]`\n  for themed native control markup override\n\nUser edits update `draftValue` and `status`; they do not mutate `value`\ndirectly. Consumers should listen for `input` or `change` and decide whether\nto persist or reset.\n\n### Use explicit items/value semantics for select\n\nInside `asljs-select`, configure:\n\n- `items` as explicit `{ value, label, disabled? }` entries\n- `value` as the external set/reset selection\n- `validator` to return an error message or `null`\n- `placeholder` when an empty prompt option should be shown first\n- `controlClassName` when host CSS needs to target the inner native `select`\n- `theme` or a local `template[data-slot="template"]` for layout override\n- local `template[data-slot="select"]` for themed control markup override\n\nUser selection updates `draftValue` and `status`; it does not mutate `value`\ndirectly. Consumers should listen for `input` or `change` and decide whether\nto persist or reset.\n\n### Use explicit state/options semantics for AI chat\n\nInside `asljs-ai-chat`, configure:\n\n- `messages`, `promptDraft`, and related chat state directly\n  on the custom element\n- `options` as the request/persistence/tool callbacks the chat runtime needs\n- `messages` as a store object (`save(...)`, `read()`, and `list`)\n- rely on default sessionStorage persistence when `options.stateStore` is omitted\n\nThe chat element owns the rendered conversation UI and the primary state\nsurface.\n\n### Keep text-input templates control-host based\n\nIf a local or themed template is used for `asljs-text-input`, it must include\n`[data-role="control-host"]`. That host is where the real `input` or\n`textarea` is mounted.\n\nIf a local or themed `template[data-slot="input"]` or\n`template[data-slot="textarea"]` is used, it must include the matching native\ncontrol element. Wrappers around that control are allowed.\n\nTemplate bindings may include any supported `asljs-data-binding` expressions\nneeded for label, description, error, or state classes.\n\n### Use slot templates for rendering\n\nInside `asljs-list`, use:\n\n- required: `template[data-slot="item"]`\n- optional: `template[data-slot="empty"]`\n- optional: `template[data-slot="container"]` with required\n  `[data-role="items"]`\n\nIf `items` is non-empty and no item template is provided, the component warns\nand renders nothing.\n\n### Use themes as template defaults\n\nThemes provide fallback templates. They do not replace slot-template authoring.\n\nPreferred resolution order:\n\n- local `template[data-slot]`\n- per-component theme such as `list.theme` or `textInput.theme`\n- nearest `asljs-theme-provider`\n- `setDefaultTheme(...)`\n\nIf a local slot template exists, it must continue to win over the active theme.\n\n### Use row bindings through `asljs-data-binding`\n\nRow binding context fields are:\n\n- `item`\n- `index`\n- `first`\n- `last`\n- `odd`\n- `even`\n- `count`\n- `context`\n\nPrefer path-based binding expressions such as:\n\n- `item.title`\n- `index`\n- `context.select`\n\n### Use `list.context` for shared row actions and state\n\n`List.context` is the shared base context. Row rendering derives a row-local\ncontext that includes row-specific `item` and `index` values and binds base\ncontext methods to that derived object.\n\nIf a handler needs row data, prefer the `context` plus `this` pattern.\n\n## How Row Actions Receive Row Data\n\n- handlers should usually be referenced as `context.someAction`\n- row-specific values arrive through the derived row-local `this` context\n- the derived row context includes at least `item` and `index`\n- do not invent inline argument syntax like `select(item.id)`\n\n## Common Wrong Assumptions\n\n- this is React-style callback rendering\n- this is template-expression syntax with inline function calls\n- row actions should pass arguments in attributes\n- any container template shape is acceptable\n- item rendering is driven by imperative callbacks instead of templates\n\n## Constraints To Preserve\n\n- Keep row rendering template-driven.\n- Keep theme behavior template-driven and slot-compatible.\n- Keep `TextInput.value` as a set/reset input, not the live mutable draft.\n- Keep event bindings path-based; do not add parameter-expression syntax.\n- Do not introduce custom invocation protocols such as `*-args` or inline call\n  expressions for bindings.\n- `template[data-slot="container"]` must keep `[data-role="items"]` as the\n  insertion point.\n- `template[data-slot="template"]` for `TextInput` must keep\n  `[data-role="control-host"]` as the insertion point.\n- `template[data-slot="input"]` and `template[data-slot="textarea"]` for\n  `TextInput` must keep a matching native control element.\n- `List.items` can be a plain array or an eventful-like collection; when the\n  source emits `set`, `delete`, or `define`, list rerender behavior is part of\n  the current design.\n\n## Safe Authoring Rules\n\n- keep row templates declarative\n- use themes only as fallback template sources\n- use `TextInput.status` or emitted events for live draft state\n- use `context` methods for shared row actions\n- avoid custom attribute protocols\n- do not mutate slot templates at runtime\n- update `list.items` or the source collection instead of rewriting row DOM\n\n## Change Safety Checklist\n\n- If touching row rendering, then preserve template-driven rendering.\n- If touching theming, then preserve fallback precedence and local-template\n  override behavior.\n- If touching container handling, then preserve `[data-role="items"]` as the\n  insertion point.\n- If touching text-input layout handling, then preserve\n  `[data-role="control-host"]` as the insertion point.\n- If touching text-input control templating, then preserve matching native\n  `input` or `textarea` lookup for the documented control slots.\n- If touching row context, then preserve the documented field names.\n- If touching event binding integration, then preserve path-based\n  `asljs-data-binding` handler rules.\n- If touching item sources, then preserve rerender behavior for arrays and\n  eventful-like collections.\n\n## Validation\n\n- `npm -w asljs-components run test`\n- `npm -w asljs-components run typecheck`\n- `npm -w asljs-components run lint`\n\nUpdate this file when AI-facing constraints, exported surface expectations, or\nvalidation commands change. Update `README.md` separately only when\nuser-facing usage or behavior changes.\n',ah=`# ASLJS Dali AI Guidance

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
`,Xy=`
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

${nh}

[observable] guide:

${th}

[data-binding] guide:

${sh}

[components] guide:

${ih}

[dali] guide:

${ah}
`,Qy=`
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

${nh}

[observable] guide:

${th}

[data-binding] guide:

${sh}

[components] guide:

${ih}

[dali] guide:

${ah}
`,rh="README.md",Nl="PLAN.md",da="CHANGE.md",Ol=[rh,Nl,da];function oh(e,t,n){return Ol.map(s=>({id:n(),appId:e,name:s,content:lh(s,t)}))}function Zy(e){const t=new Set(e.files.map(i=>i.name.toLowerCase())),n=[...e.files];let s=!1;for(const i of Ol)t.has(i.toLowerCase())||(n.push({id:e.createId(),appId:e.appId,name:i,content:lh(i,e.appName)}),s=!0);return{files:nv(n),changed:s}}function ev(){return["# PLAN","","Pending changes for the next generation cycle go here."].join(`
`)}function tv(){return["# CHANGE","","Active implementation changes for the current generation cycle go here."].join(`
`)}function nv(e){const t=new Map(Ol.map((n,s)=>[n,s]));return[...e].sort((n,s)=>{const i=t.get(n.name)??Number.MAX_SAFE_INTEGER,a=t.get(s.name)??Number.MAX_SAFE_INTEGER;return i!==a?i-a:n.name.localeCompare(s.name)})}function lh(e,t){switch(e){case rh:return[`# ${t}`,"","## State","","- This app is empty.","- No changes have been implemented yet."].join(`
`);case Nl:return ev();case da:return tv()}}function sv(e){return["Conversation transcript:",e.slice(-10).map(n=>`${iv(n.role)}: ${n.text}`).join(`

`),"",'Use the transcript to resolve short follow-up answers such as "yes",','"2 players", or "make it blue". The last user message is the newest',"request."].join(`
`)}function iv(e){return e==="assistant"?"Assistant":"User"}const Dl="asljs-app-builder:eval-request",ch="asljs-app-builder:eval-response",dh="asljs-app-builder:diagnostics-request",uh="asljs-app-builder:diagnostics-response",Xc=`<script>
(() => {
  const REQUEST = '${Dl}';
  const RESPONSE = '${ch}';
  const DIAG_REQUEST = '${dh}';
  const DIAG_RESPONSE = '${uh}';
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
<\/script>`;function av(e,t,n){if(t.length===0){e.removeAttribute("srcdoc"),e.src="about:blank";return}const s=t.find(m=>m.name==="index.html")??t.find(m=>m.name.endsWith(".html"))??null;if(s===null){e.removeAttribute("srcdoc"),e.src="about:blank";return}let i=s.content;const a=hv(t),r=t.find(m=>m.name==="style.css")??t.find(m=>m.name.endsWith(".css"))??null,l=r===null?null:gv(r.content,r.name,a);r!==null&&(i=i.replace(/<link[^>]+href=["']style\.css["'][^>]*>/gi,`<style>${l}</style>`),i=i.replace(/<link[^>]+href=["']([^"']+\.css)["'][^>]*>/gi,`<style>${l}</style>`));for(const m of t){if(!m.name.endsWith(".js"))continue;const h=m.name.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");i=i.replace(new RegExp(`(<script[^>]*?)\\s+src=["']${h}["']([^>]*)><\\/script>`,"gi"),(y,o,k)=>{const g=`${String(o)} ${String(k)}`;return/type=["']module["']/i.test(g)?`<script type="module">${m.content}<\/script>`:`<script>${m.content}<\/script>`})}i=mv(i,s.name,a),i=cv(i,t),i=pv(i,n),i=lv(i),e.srcdoc=i}async function rv(e,t){const n=await ph(e,Dl,{code:t},ch);if(n.ok===!0)return n.value;throw new Error(typeof n.error=="string"?n.error:"Unknown preview evaluation error.")}async function ov(e){const t=await ph(e,dh,{},uh);if(t.ok!==!0)throw new Error(typeof t.error=="string"?t.error:"Failed to read preview diagnostics.");return t.diagnostics??{logs:[],errors:[]}}async function ph(e,t,n,s){const i=e.contentWindow;if(i===null)throw new Error("Preview frame is not available.");const a=crypto.randomUUID();return new Promise((r,l)=>{const m=window.setTimeout(()=>{y(),l(new Error("Timed out waiting for app evaluation result."))},5e3),h=o=>{if(o.source!==i)return;const k=o.data;k.type!==s||k.id!==a||(y(),r(k))};function y(){window.clearTimeout(m),window.removeEventListener("message",h)}window.addEventListener("message",h),i.postMessage({type:t,id:a,...n},"*")})}function lv(e){return e.includes(Dl)?e:e.includes("</body>")?e.replace("</body>",`${Xc}</body>`):`${e}
${Xc}`}function cv(e,t){if(/type=["']importmap["']/i.test(e))return e;const n=t.find(r=>r.name==="package.json")??null,s=dv(n==null?void 0:n.content),i=Object.fromEntries(s.map(([r,l])=>[r,`https://esm.sh/${r}@${l}?bundle`]));if(Object.keys(i).length===0)return e;const a=`<script type="importmap">${JSON.stringify({imports:i})}<\/script>`;return/<head[^>]*>/i.test(e)?e.replace(/<head[^>]*>/i,r=>`${r}
${a}`):`${a}
${e}`}function dv(e){if(e===void 0)return Qc();try{const t=JSON.parse(e),n={...t.dependencies??{},...t.devDependencies??{}};return["asljs-eventful","asljs-observable","asljs-data-binding","asljs-components","asljs-dali","openai"].map(a=>[a,uv(n[a])])}catch{return Qc()}}function uv(e){if(typeof e!="string"||e.trim()==="")return"latest";const t=e.trim().replace(/^[~^<>=\s]+/,"");return t===""?"latest":t}function Qc(){return[["asljs-eventful","latest"],["asljs-observable","latest"],["asljs-data-binding","latest"],["asljs-components","latest"],["asljs-dali","latest"],["openai","latest"]]}function pv(e,t){if(e.includes("__ASLJS_APP_BUILDER_HOST__"))return e;const n=`<script>window.__ASLJS_APP_BUILDER_HOST__ = ${JSON.stringify({openAiApiKey:(t==null?void 0:t.hostOpenAiApiKey)===void 0||t.hostOpenAiApiKey.trim()===""?null:t.hostOpenAiApiKey})};<\/script>`;return e.includes("</head>")?e.replace("</head>",`${n}</head>`):e.includes("<body")?e.replace(/<body[^>]*>/i,s=>`${s}
${n}`):`${n}
${e}`}function hv(e){const t=new Map;for(const n of e){const s=fv(n.content);s!==null&&t.set(Ll(n.name),s)}return t}function fv(e){const t=e.trim();return/^data:[^,]+,.+/i.test(t)?t:null}function mv(e,t,n){return e.replace(/\b(src|href|poster)=(["'])([^"']+)\2/gi,(s,i,a,r)=>{const l=hh(t,String(r),n);return l===null?s:`${String(i)}=${String(a)}${l}${String(a)}`})}function gv(e,t,n){return e.replace(/url\(\s*(["']?)([^"')]+)\1\s*\)/gi,(s,i,a)=>{const r=hh(t,String(a),n);return r===null?s:`url(${String(i)}${r}${String(i)})`})}function hh(e,t,n){const s=t.trim();if(s===""||s.startsWith("#")||/^[a-z]+:/i.test(s)||s.startsWith("//"))return null;const i=s.split("#",1)[0]??s,a=i.split("?",1)[0]??i,r=Ll(yv(bv(e),a));return n.get(r)??null}function bv(e){const t=Ll(e).split("/");return t.pop(),t.join("/")}function yv(e,t){return t.startsWith("/")||e===""?t:`${e}/${t}`}function Ll(e){const t=e.replace(/\\/g,"/").split("/"),n=[];for(const s of t)if(!(s===""||s===".")){if(s===".."){n.pop();continue}n.push(s)}return n.join("/")}const Ls="gpt-5-mini",Fs="gpt-5.4";function Rs(e){const t=new Set,n=[];for(const s of e){const i=typeof s.id=="string"?s.id.trim():"";i===""||t.has(i.toLowerCase())||(t.add(i.toLowerCase()),n.push({id:i,created:Number.isFinite(s.created)?s.created:0}))}return n}function vv(e){var i;const t=e.selectElement,n=[...e.apps].sort((a,r)=>r.updatedAt.localeCompare(a.updatedAt)),s=n.map(a=>({value:a.id,label:a.name}));if(n.length>0&&s.push({value:"__separator__",label:"────────",disabled:!0}),s.push({value:e.newActionValue,label:"New..."},{value:e.importActionValue,label:"Import..."}),t.items=s,t.disabled=s.length===0,e.currentAppId!==null){t.value=e.currentAppId;return}t.value=((i=s[0])==null?void 0:i.value)??""}function wv(e){const t=e.selectElement,n=e.files;if(n.length===0){t.items=[{value:"",label:"No files",disabled:!0}],t.value="",t.disabled=!0;return}t.items=n.map(i=>({value:i.name,label:i.name}));const s=e.activeFileName!==null&&n.some(i=>i.name===e.activeFileName)?e.activeFileName:n[0].name;t.value=s,t.disabled=!1}function _v(e){const t={loadFile:async n=>{const s=e.files.find(a=>a.name===n);if(s===void 0)return null;const i=Gp(s.content);return i!==null?{name:s.name,mimeType:i.mimeType,dataUrl:i.dataUrl}:{name:s.name,text:s.content}}};e.onSaveText!==void 0&&(t.saveText=e.onSaveText),e.fileElement.provider=t,e.fileElement.handlers=[db(),ub(),pb()],e.fileElement.fileName=e.activeFileName}const xv="asljs-app-builder:chat-state:";function kv(e){return{getOpenAiApiKey:async()=>Pl(e.appId),getChatModel:async()=>e.readChatModel(),getInitialToolStepLimit:async()=>e.readInitialToolStepLimit()}}function Ev(e){const t=`${xv}${e}`;return{load:async()=>{try{const n=sessionStorage.getItem(t);return n===null||n.trim()===""?{}:JSON.parse(n)}catch{return{}}},save:async n=>{sessionStorage.setItem(t,JSON.stringify(n))}}}function Y(e){const t=document.getElementById(e);if(t===null)throw new Error(`Missing element #${e}`);return t}function xe(e,t){e.type="button",e.buttonClassName=t.className,ua(e,{text:t.text??"",icon:t.icon??""})}function ua(e,t){e.text=t.text,e.icon=t.icon??"",e.localName==="button"&&(e.textContent=t.text)}function Gt(e,t){e.placeholder=t.placeholder??null,e.inputType=t.inputType??"text",e.controlClassName=t.className??"form-control bootstrap-input"}function Is(e,t){e.controlClassName=t.className,e.items=t.items??[],e.placeholder=t.placeholder??null}function st(e){return e.value??""}function xt(e,t){e.value=t}function hi(e){const t=e.querySelector("input, textarea, select, button");if(t!==null){t.focus();return}e.focus()}function fh(e){const t=e.querySelector("input, textarea");t==null||t.focus(),t==null||t.select()}function mh(e){const t=!e.panelElement.classList.contains("collapsed"),n=t?e.collapsedText:e.expandedText;return ua(e.toggleButtonElement,{text:n,icon:t?e.collapsedIcon:e.expandedIcon}),e.toggleButtonElement.setAttribute("aria-expanded",t?"false":"true"),e.panelElement.classList.toggle("collapsed",t),e.panelsElement.classList.toggle(e.collapsedPanelsClass,t),t}const Av=`{
  "id": "5935ae06-fe33-4019-86ab-afa78151e96c",
  "name": "TODO Sample",
  "files": {
    "app.js": "const form = document.getElementById('todo-form');\\nconst input = document.getElementById('todo-input');\\nconst list = document.getElementById('todo-list');\\nconst doneList = document.getElementById('done-list');\\n\\nif (!(form instanceof HTMLFormElement)\\n    || !(input instanceof HTMLInputElement)\\n    || !(list instanceof HTMLUListElement)\\n    || !(doneList instanceof HTMLUListElement))\\n{\\n  throw new Error('Missing TODO app elements.');\\n}\\n\\nconst state = {\\n  todos: [],\\n  done: [],\\n};\\n\\nfunction uid() {\\n  return crypto.randomUUID();\\n}\\n\\nfunction render() {\\n  list.replaceChildren();\\n  doneList.replaceChildren();\\n\\n  for (const todo of state.todos) {\\n    const item = document.createElement('li');\\n    item.className = 'todo-item';\\n\\n    const main = document.createElement('div');\\n    main.className = 'todo-main';\\n\\n    const text = document.createElement('span');\\n    text.className = 'todo-text';\\n    text.textContent = todo.text;\\n\\n    const actions = document.createElement('div');\\n\\n    const checkButton = document.createElement('button');\\n    checkButton.type = 'button';\\n    checkButton.className = 'check-btn';\\n    checkButton.textContent = '✓';\\n    checkButton.title = 'Mark done';\\n    checkButton.addEventListener('click', () => {\\n      state.todos = state.todos.filter(entry => entry.id !== todo.id);\\n      state.done.unshift(todo);\\n      render();\\n    });\\n\\n    main.appendChild(checkButton);\\n    main.appendChild(text);\\n\\n    const bin = document.createElement('button');\\n    bin.type = 'button';\\n    bin.className = 'bin-btn';\\n    bin.textContent = '🗑';\\n    bin.title = 'Delete todo';\\n    bin.addEventListener('click', () => {\\n      state.todos = state.todos.filter(entry => entry.id !== todo.id);\\n      render();\\n    });\\n\\n    actions.appendChild(checkButton);\\n    actions.appendChild(bin);\\n\\n    item.appendChild(main);\\n    item.appendChild(actions);\\n    list.appendChild(item);\\n  }\\n\\n  for (const todo of state.done) {\\n    const item = document.createElement('li');\\n    item.className = 'todo-item done';\\n\\n    const main = document.createElement('div');\\n    main.className = 'todo-main';\\n\\n    const text = document.createElement('span');\\n    text.className = 'todo-text';\\n    text.textContent = todo.text;\\n\\n    main.appendChild(text);\\n\\n    const actions = document.createElement('div');\\n\\n    const bin = document.createElement('button');\\n    bin.type = 'button';\\n    bin.className = 'bin-btn';\\n    bin.textContent = '🗑';\\n    bin.title = 'Delete todo';\\n    bin.addEventListener('click', () => {\\n      state.done = state.done.filter(entry => entry.id !== todo.id);\\n      render();\\n    });\\n\\n    actions.appendChild(bin);\\n\\n    item.appendChild(main);\\n    item.appendChild(actions);\\n    doneList.appendChild(item);\\n  }\\n\\n  if (state.todos.length === 0) {\\n    const empty = document.createElement('li');\\n    empty.className = 'todo-empty';\\n    empty.textContent = 'No active TODO items.';\\n    list.appendChild(empty);\\n  }\\n\\n  if (state.done.length === 0) {\\n    const emptyDone = document.createElement('li');\\n    emptyDone.className = 'todo-empty';\\n    emptyDone.textContent = 'No completed TODO items yet.';\\n    doneList.appendChild(emptyDone);\\n  }\\n}\\n\\nform.addEventListener('submit', event => {\\n  event.preventDefault();\\n\\n  const text = input.value.trim();\\n\\n  if (text === '') {\\n    return;\\n  }\\n\\n  state.todos.unshift({\\n    id: uid(),\\n    text,\\n  });\\n  input.value = '';\\n  input.focus();\\n  render();\\n});\\n\\nrender();",
    "README.md": "# TODO Sample\\n\\nSimple TODO sample application.\\n\\n## Usage\\n\\nOpen index.html and add items using the input.\\n\\n## Behavior\\n\\n- Add TODO item on submit.\\n- Active TODO items show Check and Bin actions.\\n- Clicking Check moves an item immediately to Done.\\n- Each item has a bin icon to delete it.\\n",
    "package.json": "{\\n  \\"name\\": \\"todo-sample\\",\\n  \\"version\\": \\"0.1.0\\",\\n  \\"private\\": true,\\n  \\"type\\": \\"module\\",\\n  \\"scripts\\": {\\n    \\"start\\": \\"echo \\"Open index.html in a browser\\"\\"\\n  }\\n}",
    "style.css": ":root {\\n  color-scheme: light dark;\\n}\\n\\nbody {\\n  margin: 0;\\n  font-family: system-ui, sans-serif;\\n  background: #0b1220;\\n  color: #e7edf7;\\n}\\n\\n.app {\\n  max-width: 560px;\\n  margin: 2rem auto;\\n  padding: 1rem;\\n  border: 1px solid #2b3954;\\n  border-radius: 8px;\\n  background: #121b2d;\\n}\\n\\n#todo-form {\\n  display: flex;\\n  gap: 0.5rem;\\n}\\n\\n#todo-input {\\n  flex: 1;\\n  padding: 0.5rem;\\n}\\n\\n.list-section {\\n  margin-top: 1rem;\\n}\\n\\n.list-section h2 {\\n  margin: 0 0 0.5rem;\\n  font-size: 1rem;\\n}\\n\\n.todo-list {\\n  margin: 0;\\n  padding: 0;\\n  list-style: none;\\n  display: grid;\\n  gap: 0.5rem;\\n}\\n\\n.todo-item {\\n  display: flex;\\n  align-items: center;\\n  justify-content: space-between;\\n  gap: 0.5rem;\\n  padding: 0.5rem 0.6rem;\\n  border: 1px solid #2b3954;\\n  border-radius: 6px;\\n  background: #0f1a2f;\\n}\\n\\n.todo-main {\\n  display: flex;\\n  align-items: center;\\n  gap: 0.5rem;\\n  min-width: 0;\\n}\\n\\n.todo-text {\\n  overflow: hidden;\\n  text-overflow: ellipsis;\\n  white-space: nowrap;\\n}\\n\\n.done .todo-text {\\n  text-decoration: line-through;\\n  opacity: 0.75;\\n}\\n\\n.bin-btn {\\n  border: 1px solid #3b4e7a;\\n  background: transparent;\\n  color: #e7edf7;\\n  border-radius: 6px;\\n  padding: 0.35rem 0.5rem;\\n  cursor: pointer;\\n}\\n\\n.check-btn {\\n  border: 1px solid #3b4e7a;\\n  background: #1b2b4b;\\n  color: #e7edf7;\\n  border-radius: 6px;\\n  padding: 0.35rem 0.55rem;\\n  cursor: pointer;\\n}\\n\\n.todo-empty {\\n  color: #9fb2d8;\\n  font-size: 0.9rem;\\n  padding: 0.25rem 0;\\n}",
    "index.html": "<!doctype html>\\n<html lang=\\"en\\">\\n<head>\\n  <meta charset=\\"UTF-8\\" />\\n  <meta name=\\"viewport\\" content=\\"width=device-width, initial-scale=1.0\\" />\\n  <title>TODO Sample</title>\\n  <link rel=\\"stylesheet\\" href=\\"style.css\\" />\\n</head>\\n<body>\\n  <main class=\\"app\\">\\n    <h1>TODO Sample</h1>\\n    <form id=\\"todo-form\\">\\n      <input id=\\"todo-input\\" type=\\"text\\" placeholder=\\"What needs doing?\\" required />\\n      <button type=\\"submit\\">Add</button>\\n    </form>\\n    <section class=\\"list-section\\">\\n      <h2>Todo</h2>\\n      <ul id=\\"todo-list\\" class=\\"todo-list\\"></ul>\\n    </section>\\n    <section class=\\"list-section\\">\\n      <h2>Done</h2>\\n      <ul id=\\"done-list\\" class=\\"todo-list\\"></ul>\\n    </section>\\n  </main>\\n  <script type=\\"module\\" src=\\"app.js\\"><\/script>\\n</body>\\n</html>"
  }
}`,Sv=`{
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
}`;function $v(e){const t={};for(const n of e.files)t[n.name]=n.content;return{id:e.app.id,name:e.app.name,author:yh(e.app.author),files:t}}function gh(e){const t=JSON.parse(e);return bh(t),t}function Cv(e){bh(e.payload);const t=e.existingApps.find(i=>i.id===e.payload.id);if(t!==void 0)return e.navigateToExistingById?{kind:"existing",appId:t.id}:{kind:"duplicate"};const n={id:e.payload.id,uuid:e.createUuid(),name:e.payload.name,author:yh(e.payload.author),createdAt:e.now,updatedAt:e.now},s=Object.entries(e.payload.files).map(([i,a])=>({id:e.createId(),appId:n.id,name:i,content:a}));return{kind:"new",app:n,files:s}}function bh(e){if(typeof e.id!="string"||e.id.trim()==="")throw new Error("Invalid app JSON format.");if(typeof e.name!="string"||e.name.trim()==="")throw new Error("Invalid app JSON format.");if(e.files===null||typeof e.files!="object")throw new Error("Invalid app JSON format.");if(!Tv(e.author))throw new Error("Invalid app JSON format.");for(const[t,n]of Object.entries(e.files))if(t.trim()===""||typeof n!="string")throw new Error("Invalid app JSON format.")}function yh(e){if(e===void 0)return;const t=typeof e.name=="string"?e.name.trim():"",n=typeof e.email=="string"?e.email.trim():"";if(!(t===""&&n===""))return{...t!==""?{name:t}:{},...n!==""?{email:n}:{}}}function Tv(e){if(e===void 0)return!0;if(e===null||typeof e!="object")return!1;const t=e;return!(t.name!==void 0&&typeof t.name!="string"||t.email!==void 0&&typeof t.email!="string")}const Iv=[Av,Sv];function vh(){return Iv.map(Pv).map(gh)}function jv(e){return vh().find(n=>n.name===e)??null}function Zc(e){return vh().find(n=>n.id===e)??null}function Mv(e,t,n){return Object.entries(e.files).map(([s,i])=>({id:n(),appId:t,name:s,content:i}))}function Pv(e){if(typeof e=="string")return e;if(e!==null&&typeof e=="object")return JSON.stringify(e);throw new Error("Invalid sample source format.")}function Nv(e){const t=wh(e,"PLAN");return t!==""&&t!=="Pending changes for the next generation cycle go here."}function Ov(e){const t=wh(e,"PLAN").split(/\r?\n/).map(s=>s.trim()).filter(s=>s!=="");return t.length===0?`# CHANGE
`:["# CHANGE","","Current generation cycle:","",...t.map(s=>/^[-*]\s+/.test(s)?s:`- ${s}`)].join(`
`)}function wh(e,t){return e.replace(new RegExp(`^#\\s+${t}\\s*$`,"im"),"").trim()}const Dv=6e3;function Lv(e){const t=Number.isFinite(e.timeoutMs)?Math.max(1,Math.floor(e.timeoutMs)):Dv;async function n(a){const r=JSON.stringify(a),l=await ed(e.codec.compress(r),t,"Link compression timed out. Use Download export instead."),m=`${e.baseUrl}${e.hashPrefix}${l}`;return{url:m,exceedsMaxUrlLength:m.length>e.maxUrlLength}}async function s(a){const r=await ed(e.codec.decompress(a),t,"Link decompression timed out.");return JSON.parse(r)}function i(a){return a.startsWith(e.hashPrefix)?a.slice(e.hashPrefix.length):null}return{createShareUrl:n,parsePayloadFromToken:s,readTokenFromHash:i}}function Fv(){return{compress:Rv,decompress:Uv}}async function Rv(e){const t=new TextEncoder().encode(e),n=await Bv(t,"gzip");return zv(n)}async function Uv(e){const t=Vv(e),n=await Wv(t,"gzip");return new TextDecoder().decode(n)}async function Bv(e,t){const n=new Blob([_h(e)]).stream().pipeThrough(new CompressionStream(t));return xh(n)}async function Wv(e,t){const n=new Blob([_h(e)]).stream().pipeThrough(new DecompressionStream(t));return xh(n)}function _h(e){const t=new Uint8Array(e.byteLength);return t.set(e),t}async function xh(e){const t=e.getReader(),n=[];let s=0;for(;;){const{value:r,done:l}=await t.read();if(l)break;r!==void 0&&(n.push(r),s+=r.length)}const i=new Uint8Array(s);let a=0;for(const r of n)i.set(r,a),a+=r.length;return i}function zv(e){let n="";for(let s=0;s<e.length;s+=32768){const i=e.subarray(s,s+32768);n+=String.fromCharCode(...i)}return btoa(n).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,"")}function Vv(e){const t=e.replace(/-/g,"+").replace(/_/g,"/"),n=t.length%4,s=n===0?t:`${t}${"=".repeat(4-n)}`;let i="";try{i=atob(s)}catch{throw new Error("Invalid compressed share token.")}const a=new Uint8Array(i.length);for(let r=0;r<i.length;r++)a[r]=i.charCodeAt(r);return a}async function ed(e,t,n){let s;const i=new Promise((a,r)=>{s=globalThis.setTimeout(()=>{r(new Error(n))},t)});try{return await Promise.race([e,i])}finally{s!==void 0&&globalThis.clearTimeout(s)}}async function Hv(e,t){const n={...e.files};for(const[s,i]of Object.entries(e.files)){const a=qv(s);if(a!==null){n[s]=await t(i,a);continue}Kv(s)&&(n[s]=Gv(i))}return{...e,files:n}}function qv(e){const t=e.toLowerCase();return t.endsWith(".css")?"css":t.endsWith(".ts")?"ts":t.endsWith(".tsx")?"tsx":t.endsWith(".jsx")?"jsx":t.endsWith(".js")||t.endsWith(".mjs")||t.endsWith(".cjs")?"js":null}function Kv(e){const t=e.toLowerCase();return t.endsWith(".html")||t.endsWith(".htm")}function Gv(e){const t=[];return e.replace(/<(pre|textarea|script|style)\b[\s\S]*?<\/\1>/gi,i=>`__ASLJS_HTML_BLOCK_${t.push(i)-1}__`).replace(/<!--([\s\S]*?)-->/g,"").replace(/>\s+</g,"><").replace(/\s{2,}/g," ").trim().replace(/__ASLJS_HTML_BLOCK_(\d+)__/g,(i,a)=>t[Number.parseInt(a,10)]??"")}const Jv="Use copy buttons to share as text or HTML.";function Yv(e){const t=e.trim();return/(?:^|\/)[^/]+\.test\.js$/i.test(t)||/(?:^|\/)(DEVELOP|CHANGE|PLAN)\.md$/i.test(t)}function Xv(e,t,n){const s=`Link is ready at ${e} characters. Practical working limit is about ${t}. `;return e>n?`${s}It is over the warning threshold of ${n}, so some apps may reject it.`:e>t?`${s}It may still work, but shorter links are safer.`:`${s}${Jv}`}function Qv(){return`
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
  `}function Zv(){const e=Y("name-modal"),t=Y("name-modal-title"),n=Y("app-name-input"),s=Y("btn-confirm-name"),i=Y("btn-cancel-name"),a=Y("btn-close-name-modal");let r=null;xe(a,{icon:'<i class="bi bi-x-lg"></i>',className:"btn btn-outline-secondary btn-sm"}),xe(s,{text:"OK",className:"btn btn-primary"}),xe(i,{text:"Cancel",className:"btn btn-outline-secondary"}),Gt(n,{placeholder:"My App"});function l(){r=null,e.classList.add("hidden")}async function m(){if(r===null)return;const h=st(n).trim();if(h===""){hi(n);return}const y=r;l(),await y.onConfirm(h)}return s.addEventListener("click",()=>{m()}),i.addEventListener("click",l),a.addEventListener("click",l),n.addEventListener("keydown",h=>{h.key==="Enter"&&(h.preventDefault(),m())}),e.addEventListener("click",h=>{h.target===e&&l()}),{open(h){if(r=h,t.textContent=h.title,xt(n,h.initialValue),e.classList.remove("hidden"),h.selectText){fh(n);return}hi(n)},close:l}}function ew(){return`
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
  `}function tw(e){const t=Y("project-settings-modal"),n=Y("project-name-input"),s=Y("project-author-name-input"),i=Y("project-author-email-input"),a=Y("btn-save-project-settings"),r=Y("btn-delete-project"),l=Y("btn-close-project-settings"),m=Y("btn-close-project-settings-x");xe(m,{icon:'<i class="bi bi-x-lg"></i>',className:"btn btn-outline-secondary btn-sm"}),xe(a,{text:"Save",className:"btn btn-primary"}),xe(r,{text:"Delete",className:"btn btn-danger"}),xe(l,{text:"Cancel",className:"btn btn-outline-secondary"}),Gt(n,{placeholder:"Project name"}),Gt(s,{placeholder:"Jane Doe"}),Gt(i,{placeholder:"jane@example.com",inputType:"email"});function h(){t.classList.add("hidden")}function y(){return{name:st(n).trim(),authorName:st(s).trim(),authorEmail:st(i).trim()}}async function o(){const g=y();if(g.name===""){hi(n);return}await e.onSave(g),h()}async function k(){h(),await e.onDelete()}return a.addEventListener("click",()=>{o()}),r.addEventListener("click",()=>{k()}),l.addEventListener("click",h),m.addEventListener("click",h),n.addEventListener("keydown",g=>{g.key==="Enter"&&(g.preventDefault(),o())}),t.addEventListener("click",g=>{g.target===t&&h()}),{open(g){xt(n,g.name),xt(s,g.authorName),xt(i,g.authorEmail),t.classList.remove("hidden"),fh(n)},close:h}}function nw(){return`
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
  `}function sw(e){const t=Y("settings-modal"),n=Y("btn-close-settings"),s=Y("btn-save-settings"),i=Y("btn-cancel-settings"),a=Y("api-key-input"),r=Y("theme-select"),l=Y("font-size-input"),m=Y("max-tool-steps-input");xe(n,{icon:'<i class="bi bi-x-lg"></i>',className:"btn btn-outline-secondary btn-sm"}),xe(s,{text:"Save",className:"btn btn-primary"}),xe(i,{text:"Cancel",className:"btn btn-outline-secondary"}),Gt(a,{placeholder:"sk-…  (optional, stored locally)",inputType:"password"}),Gt(l,{placeholder:"14",inputType:"number"}),Gt(m,{placeholder:"20",inputType:"number"}),Is(r,{className:"form-select bootstrap-select",items:[{value:"dark",label:"Dark"},{value:"light",label:"Light"}]});function h(){t.classList.add("hidden")}async function y(){await e.onSave({apiKey:st(a).trim(),theme:st(r),fontSizeText:st(l),maxToolStepsText:st(m)}),h()}return n.addEventListener("click",h),s.addEventListener("click",()=>{y()}),i.addEventListener("click",h),t.addEventListener("click",o=>{o.target===t&&h()}),{async open(){const o=await e.loadValues();xt(a,o.apiKey),xt(r,o.theme),xt(l,String(o.fontSize)),xt(m,String(o.maxToolSteps)),t.classList.remove("hidden"),hi(a)},close:h}}function iw(){return`
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
  `}function aw(e){const t=Y("share-modal"),n=Y("btn-close-share"),s=Y("btn-close-share-2"),i=Y("btn-share-link"),a=Y("btn-share-download"),r=Y("btn-share-copy-text"),l=Y("btn-share-copy-html"),m=Y("share-minified-input"),h=Y("share-exclude-tests-input"),y=Y("share-link-status"),o=Y("share-link-output");let k=0;xe(n,{icon:'<i class="bi bi-x-lg"></i>',className:"btn btn-outline-secondary btn-sm"}),xe(i,{text:"Share with link",className:"btn btn-primary"}),xe(a,{text:"Download export",className:"btn btn-outline-secondary"}),xe(r,{text:"Copy as text link",className:"btn btn-outline-secondary"}),xe(l,{text:"Copy as HTML link",className:"btn btn-outline-secondary"}),xe(s,{text:"Close",className:"btn btn-outline-secondary"});function g(){return{minified:m.checked,excludeNonApplicationFiles:h.checked}}async function $(){const u=++k;o.value="",i.disabled=!0,r.disabled=!0,l.disabled=!0,y.textContent="Preparing share link...";try{const x=await e.prepareLink(g());if(u!==k)return;o.value=x.url,y.textContent=x.status,i.disabled=!1,r.disabled=!1,l.disabled=!1}catch(x){if(u!==k)return;y.textContent=x instanceof Error?x.message:String(x)}}function te(){k+=1,t.classList.add("hidden")}async function ne(){if(o.value.trim()!=="")try{await navigator.clipboard.writeText(o.value),y.textContent="Share link copied to clipboard."}catch{o.focus(),o.select(),y.textContent="Could not copy automatically. Link is selected, copy it manually."}}async function X(){const u=o.value.trim();if(u==="")return;const x=e.readAppName().trim()||"Shared app",O=`<a href="${_(u)}">${_(x)}</a>`;try{if(typeof ClipboardItem<"u"&&navigator.clipboard.write!==void 0){await navigator.clipboard.write([new ClipboardItem({"text/html":new Blob([O],{type:"text/html"}),"text/plain":new Blob([u],{type:"text/plain"})})]),y.textContent="HTML link copied to clipboard.";return}await navigator.clipboard.writeText(u),y.textContent="HTML clipboard is unavailable here. URL copied as text."}catch{o.focus(),o.select(),y.textContent="Could not copy automatically. Link is selected, copy it manually."}}function _(u){return u.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}async function H(){await e.downloadExport(g())}return n.addEventListener("click",te),s.addEventListener("click",te),i.addEventListener("click",()=>{ne()}),a.addEventListener("click",()=>{H()}),r.addEventListener("click",()=>{ne()}),l.addEventListener("click",()=>{X()}),m.addEventListener("change",()=>{$()}),h.addEventListener("change",()=>{$()}),t.addEventListener("click",u=>{u.target===t&&te()}),{open(){e.canOpen()&&(t.classList.remove("hidden"),$())},close:te}}function rw(){return`
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
  `}function ow(e){const t=Y("first-app-setup"),n=Y("first-api-key-input"),s=Y("first-app-name-input"),i=Y("btn-create-first-app"),a=Y("btn-create-todo-sample");xe(i,{text:"Create Application",className:"btn btn-primary"}),xe(a,{text:"Create TODO Sample App",className:"btn btn-outline-secondary"}),Gt(n,{placeholder:"sk-...",inputType:"password"}),Gt(s,{placeholder:"My App"});function r(){return{name:st(s).trim(),apiKey:st(n).trim()}}async function l(){const y=r();if(y.name===""){hi(s);return}await e.onCreateApplication(y)}async function m(){await e.onCreateTodoSample(r())}function h(){xt(n,""),xt(s,"")}return i.addEventListener("click",()=>{l()}),a.addEventListener("click",()=>{m()}),s.addEventListener("keydown",y=>{y.key==="Enter"&&(y.preventDefault(),l())}),{show(){h(),t.classList.remove("hidden")},hide(){t.classList.add("hidden")}}}function lw(){return`
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

        ${rw()}

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
  `}function cw(){const e=document.getElementById("app-builder-root");if(e===null)throw new Error("Missing #app-builder-root.");const t=document.createElement("template");t.innerHTML=`
    ${lw()}
    ${nw()}
    ${Qv()}
    ${ew()}
    ${iw()}
    <input id="import-file" class="d-none" type="file" accept=".json" />
  `,e.replaceChildren(t.content.cloneNode(!0))}var Ya={exports:{}},td;function dw(){return td||(td=1,(function(e){(t=>{var n=Object.defineProperty,s=Object.getOwnPropertyDescriptor,i=Object.getOwnPropertyNames,a=Object.prototype.hasOwnProperty,r=(c,d)=>{for(var f in d)n(c,f,{get:d[f],enumerable:!0})},l=(c,d,f,E)=>{if(d&&typeof d=="object"||typeof d=="function")for(let M of i(d))!a.call(c,M)&&M!==f&&n(c,M,{get:()=>d[M],enumerable:!(E=s(d,M))||E.enumerable});return c},m=c=>l(n({},"__esModule",{value:!0}),c),h=(c,d,f)=>new Promise((E,M)=>{var P=w=>{try{R(f.next(w))}catch(F){M(F)}},T=w=>{try{R(f.throw(w))}catch(F){M(F)}},R=w=>w.done?E(w.value):Promise.resolve(w.value).then(P,T);R((f=f.apply(c,d)).next())}),y={};r(y,{analyzeMetafile:()=>ff,analyzeMetafileSync:()=>yf,build:()=>df,buildSync:()=>mf,context:()=>uf,default:()=>xf,formatMessages:()=>hf,formatMessagesSync:()=>bf,initialize:()=>wf,stop:()=>vf,transform:()=>pf,transformSync:()=>gf,version:()=>cf}),t.exports=m(y);function o(c){let d=E=>{if(E===null)f.write8(0);else if(typeof E=="boolean")f.write8(1),f.write8(+E);else if(typeof E=="number")f.write8(2),f.write32(E|0);else if(typeof E=="string")f.write8(3),f.write($(E));else if(E instanceof Uint8Array)f.write8(4),f.write(E);else if(E instanceof Array){f.write8(5),f.write32(E.length);for(let M of E)d(M)}else{let M=Object.keys(E);f.write8(6),f.write32(M.length);for(let P of M)f.write($(P)),d(E[P])}},f=new g;return f.write32(0),f.write32(c.id<<1|+!c.isRequest),d(c.value),_(f.buf,f.len-4,0),f.buf.subarray(0,f.len)}function k(c){let d=()=>{switch(f.read8()){case 0:return null;case 1:return!!f.read8();case 2:return f.read32();case 3:return te(f.read());case 4:return f.read();case 5:{let T=f.read32(),R=[];for(let w=0;w<T;w++)R.push(d());return R}case 6:{let T=f.read32(),R={};for(let w=0;w<T;w++)R[te(f.read())]=d();return R}default:throw new Error("Invalid packet")}},f=new g(c),E=f.read32(),M=(E&1)===0;E>>>=1;let P=d();if(f.ptr!==c.length)throw new Error("Invalid packet");return{id:E,isRequest:M,value:P}}var g=class{constructor(c=new Uint8Array(1024)){this.buf=c,this.len=0,this.ptr=0}_write(c){if(this.len+c>this.buf.length){let d=new Uint8Array((this.len+c)*2);d.set(this.buf),this.buf=d}return this.len+=c,this.len-c}write8(c){let d=this._write(1);this.buf[d]=c}write32(c){let d=this._write(4);_(this.buf,c,d)}write(c){let d=this._write(4+c.length);_(this.buf,c.length,d),this.buf.set(c,d+4)}_read(c){if(this.ptr+c>this.buf.length)throw new Error("Invalid packet");return this.ptr+=c,this.ptr-c}read8(){return this.buf[this._read(1)]}read32(){return X(this.buf,this._read(4))}read(){let c=this.read32(),d=new Uint8Array(c),f=this._read(d.length);return d.set(this.buf.subarray(f,f+c)),d}},$,te,ne;if(typeof TextEncoder<"u"&&typeof TextDecoder<"u"){let c=new TextEncoder,d=new TextDecoder;$=f=>c.encode(f),te=f=>d.decode(f),ne='new TextEncoder().encode("")'}else if(typeof Buffer<"u")$=c=>Buffer.from(c),te=c=>{let{buffer:d,byteOffset:f,byteLength:E}=c;return Buffer.from(d,f,E).toString()},ne='Buffer.from("")';else throw new Error("No UTF-8 codec found");if(!($("")instanceof Uint8Array))throw new Error(`Invariant violation: "${ne} instanceof Uint8Array" is incorrectly false

This indicates that your JavaScript environment is broken. You cannot use
esbuild in this environment because esbuild relies on this invariant. This
is not a problem with esbuild. You need to fix your environment instead.
`);function X(c,d){return(c[d++]|c[d++]<<8|c[d++]<<16|c[d++]<<24)>>>0}function _(c,d,f){c[f++]=d,c[f++]=d>>8,c[f++]=d>>16,c[f++]=d>>24}var H=String.fromCharCode;function u(c,d,f){const E=c[d];let M=1,P=0;for(let T=0;T<d;T++)c[T]===10?(M++,P=0):P++;throw new SyntaxError(f||(d===c.length?"Unexpected end of input while parsing JSON":E>=32&&E<=126?`Unexpected character ${H(E)} in JSON at position ${d} (line ${M}, column ${P})`:`Unexpected byte 0x${E.toString(16)} in JSON at position ${d} (line ${M}, column ${P})`))}function x(c){if(!(c instanceof Uint8Array))throw new Error("JSON input must be a Uint8Array");const d=[],f=[],E=[],M=c.length;let P=null,T=0,R,w=0;for(;w<M;){let F=c[w++];if(F<=32)continue;let W;switch(T===2&&P===null&&F!==34&&F!==125&&u(c,--w),F){case 116:{(c[w++]!==114||c[w++]!==117||c[w++]!==101)&&u(c,--w),W=!0;break}case 102:{(c[w++]!==97||c[w++]!==108||c[w++]!==115||c[w++]!==101)&&u(c,--w),W=!1;break}case 110:{(c[w++]!==117||c[w++]!==108||c[w++]!==108)&&u(c,--w),W=null;break}case 45:case 46:case 48:case 49:case 50:case 51:case 52:case 53:case 54:case 55:case 56:case 57:{let J=w;for(W=H(F),F=c[w];;){switch(F){case 43:case 45:case 46:case 48:case 49:case 50:case 51:case 52:case 53:case 54:case 55:case 56:case 57:case 101:case 69:{W+=H(F),F=c[++w];continue}}break}W=+W,isNaN(W)&&u(c,--J,"Invalid number");break}case 34:{for(W="";w>=M&&u(c,M),F=c[w++],F!==34;)if(F===92)switch(c[w++]){case 34:W+='"';break;case 47:W+="/";break;case 92:W+="\\";break;case 98:W+="\b";break;case 102:W+="\f";break;case 110:W+=`
`;break;case 114:W+="\r";break;case 116:W+="	";break;case 117:{let J=0;for(let me=0;me<4;me++)F=c[w++],J<<=4,F>=48&&F<=57?J|=F-48:F>=97&&F<=102?J|=F+-87:F>=65&&F<=70?J|=F+-55:u(c,--w);W+=H(J);break}default:u(c,--w);break}else if(F<=127)W+=H(F);else if((F&224)===192)W+=H((F&31)<<6|c[w++]&63);else if((F&240)===224)W+=H((F&15)<<12|(c[w++]&63)<<6|c[w++]&63);else if((F&248)==240){let J=(F&7)<<18|(c[w++]&63)<<12|(c[w++]&63)<<6|c[w++]&63;J>65535&&(J-=65536,W+=H(J>>10&1023|55296),J=56320|J&1023),W+=H(J)}W[0];break}case 91:{W=[],d.push(P),f.push(R),E.push(T),P=null,R=W,T=1;continue}case 123:{W={},d.push(P),f.push(R),E.push(T),P=null,R=W,T=2;continue}case 93:{T!==1&&u(c,--w),W=R,P=d.pop(),R=f.pop(),T=E.pop();break}case 125:{T!==2&&u(c,--w),W=R,P=d.pop(),R=f.pop(),T=E.pop();break}default:u(c,--w)}for(F=c[w];F<=32;)F=c[++w];switch(T){case 0:{if(w===M)return W;break}case 1:{if(R.push(W),F===44){w++;continue}if(F===93)continue;break}case 2:{if(P===null){if(P=W,F===58){w++;continue}}else{if(R[P]=W,P=null,F===44){w++;continue}if(F===125)continue}break}}break}u(c,w)}var O=JSON.stringify,Q="warning",re="silent";function be(c,d){const f=[];for(const E of c){if(rt(E,d),E.indexOf(",")>=0)throw new Error(`Invalid ${d}: ${E}`);f.push(E)}return f.join(",")}var Fe=()=>null,ue=c=>typeof c=="boolean"?null:"a boolean",q=c=>typeof c=="string"?null:"a string",Ct=c=>c instanceof RegExp?null:"a RegExp object",on=c=>typeof c=="number"&&c===(c|0)?null:"an integer",Gh=c=>typeof c=="number"&&c===(c|0)&&c>=0&&c<=65535?null:"a valid port number",ec=c=>typeof c=="function"?null:"a function",Rt=c=>Array.isArray(c)?null:"an array",at=c=>Array.isArray(c)&&c.every(d=>typeof d=="string")?null:"an array of strings",dt=c=>typeof c=="object"&&c!==null&&!Array.isArray(c)?null:"an object",Jh=c=>typeof c=="object"&&c!==null?null:"an array or an object",Yh=c=>c instanceof WebAssembly.Module?null:"a WebAssembly.Module",tc=c=>typeof c=="object"&&!Array.isArray(c)?null:"an object or null",nc=c=>typeof c=="string"||typeof c=="boolean"?null:"a string or a boolean",Xh=c=>typeof c=="string"||typeof c=="object"&&c!==null&&!Array.isArray(c)?null:"a string or an object",sc=c=>typeof c=="string"||Array.isArray(c)&&c.every(d=>typeof d=="string")?null:"a string or an array of strings",ic=c=>typeof c=="string"||c instanceof Uint8Array?null:"a string or a Uint8Array",Qh=c=>typeof c=="string"||c instanceof URL?null:"a string or a URL";function v(c,d,f,E){let M=c[f];if(d[f+""]=!0,M===void 0)return;let P=E(M);if(P!==null)throw new Error(`${O(f)} must be ${P}`);return M}function Be(c,d,f){for(let E in c)if(!(E in d))throw new Error(`Invalid option ${f}: ${O(E)}`)}function Zh(c){let d=Object.create(null),f=v(c,d,"wasmURL",Qh),E=v(c,d,"wasmModule",Yh),M=v(c,d,"worker",ue);return Be(c,d,"in initialize() call"),{wasmURL:f,wasmModule:E,worker:M}}function ac(c){let d;if(c!==void 0){d=Object.create(null);for(let f in c){let E=c[f];if(typeof E=="string"||E===!1)d[f]=E;else throw new Error(`Expected ${O(f)} in mangle cache to map to either a string or false`)}}return d}function ji(c,d,f,E,M){let P=v(d,f,"color",ue),T=v(d,f,"logLevel",q),R=v(d,f,"logLimit",on);P!==void 0?c.push(`--color=${P}`):E&&c.push("--color=true"),c.push(`--log-level=${T||M}`),c.push(`--log-limit=${R||0}`)}function rt(c,d,f){if(typeof c!="string")throw new Error(`Expected value for ${d}${f!==void 0?" "+O(f):""} to be a string, got ${typeof c} instead`);return c}function rc(c,d,f){let E=v(d,f,"legalComments",q),M=v(d,f,"sourceRoot",q),P=v(d,f,"sourcesContent",ue),T=v(d,f,"target",sc),R=v(d,f,"format",q),w=v(d,f,"globalName",q),F=v(d,f,"mangleProps",Ct),W=v(d,f,"reserveProps",Ct),J=v(d,f,"mangleQuoted",ue),me=v(d,f,"minify",ue),de=v(d,f,"minifySyntax",ue),ye=v(d,f,"minifyWhitespace",ue),ve=v(d,f,"minifyIdentifiers",ue),se=v(d,f,"lineLimit",on),Oe=v(d,f,"drop",at),ee=v(d,f,"dropLabels",at),Z=v(d,f,"charset",q),L=v(d,f,"treeShaking",ue),I=v(d,f,"ignoreAnnotations",ue),b=v(d,f,"jsx",q),S=v(d,f,"jsxFactory",q),j=v(d,f,"jsxFragment",q),z=v(d,f,"jsxImportSource",q),K=v(d,f,"jsxDev",ue),C=v(d,f,"jsxSideEffects",ue),N=v(d,f,"define",dt),V=v(d,f,"logOverride",dt),p=v(d,f,"supported",dt),A=v(d,f,"pure",at),B=v(d,f,"keepNames",ue),U=v(d,f,"platform",q),ae=v(d,f,"tsconfigRaw",Xh),Pe=v(d,f,"absPaths",at);if(E&&c.push(`--legal-comments=${E}`),M!==void 0&&c.push(`--source-root=${M}`),P!==void 0&&c.push(`--sources-content=${P}`),T&&c.push(`--target=${be(Array.isArray(T)?T:[T],"target")}`),R&&c.push(`--format=${R}`),w&&c.push(`--global-name=${w}`),U&&c.push(`--platform=${U}`),ae&&c.push(`--tsconfig-raw=${typeof ae=="string"?ae:JSON.stringify(ae)}`),me&&c.push("--minify"),de&&c.push("--minify-syntax"),ye&&c.push("--minify-whitespace"),ve&&c.push("--minify-identifiers"),se&&c.push(`--line-limit=${se}`),Z&&c.push(`--charset=${Z}`),L!==void 0&&c.push(`--tree-shaking=${L}`),I&&c.push("--ignore-annotations"),Oe)for(let G of Oe)c.push(`--drop:${rt(G,"drop")}`);if(ee&&c.push(`--drop-labels=${be(ee,"drop label")}`),Pe&&c.push(`--abs-paths=${be(Pe,"abs paths")}`),F&&c.push(`--mangle-props=${Ni(F)}`),W&&c.push(`--reserve-props=${Ni(W)}`),J!==void 0&&c.push(`--mangle-quoted=${J}`),b&&c.push(`--jsx=${b}`),S&&c.push(`--jsx-factory=${S}`),j&&c.push(`--jsx-fragment=${j}`),z&&c.push(`--jsx-import-source=${z}`),K&&c.push("--jsx-dev"),C&&c.push("--jsx-side-effects"),N)for(let G in N){if(G.indexOf("=")>=0)throw new Error(`Invalid define: ${G}`);c.push(`--define:${G}=${rt(N[G],"define",G)}`)}if(V)for(let G in V){if(G.indexOf("=")>=0)throw new Error(`Invalid log override: ${G}`);c.push(`--log-override:${G}=${rt(V[G],"log override",G)}`)}if(p)for(let G in p){if(G.indexOf("=")>=0)throw new Error(`Invalid supported: ${G}`);const we=p[G];if(typeof we!="boolean")throw new Error(`Expected value for supported ${O(G)} to be a boolean, got ${typeof we} instead`);c.push(`--supported:${G}=${we}`)}if(A)for(let G of A)c.push(`--pure:${rt(G,"pure")}`);B&&c.push("--keep-names")}function ef(c,d,f,E,M){var P;let T=[],R=[],w=Object.create(null),F=null,W=null;ji(T,d,w,f,E),rc(T,d,w);let J=v(d,w,"sourcemap",nc),me=v(d,w,"bundle",ue),de=v(d,w,"splitting",ue),ye=v(d,w,"preserveSymlinks",ue),ve=v(d,w,"metafile",ue),se=v(d,w,"outfile",q),Oe=v(d,w,"outdir",q),ee=v(d,w,"outbase",q),Z=v(d,w,"tsconfig",q),L=v(d,w,"resolveExtensions",at),I=v(d,w,"nodePaths",at),b=v(d,w,"mainFields",at),S=v(d,w,"conditions",at),j=v(d,w,"external",at),z=v(d,w,"packages",q),K=v(d,w,"alias",dt),C=v(d,w,"loader",dt),N=v(d,w,"outExtension",dt),V=v(d,w,"publicPath",q),p=v(d,w,"entryNames",q),A=v(d,w,"chunkNames",q),B=v(d,w,"assetNames",q),U=v(d,w,"inject",at),ae=v(d,w,"banner",dt),Pe=v(d,w,"footer",dt),G=v(d,w,"entryPoints",Jh),we=v(d,w,"absWorkingDir",q),ge=v(d,w,"stdin",dt),fe=(P=v(d,w,"write",ue))!=null?P:M,ot=v(d,w,"allowOverwrite",ue),We=v(d,w,"mangleCache",dt);if(w.plugins=!0,Be(d,w,`in ${c}() call`),J&&T.push(`--sourcemap${J===!0?"":`=${J}`}`),me&&T.push("--bundle"),ot&&T.push("--allow-overwrite"),de&&T.push("--splitting"),ye&&T.push("--preserve-symlinks"),ve&&T.push("--metafile"),se&&T.push(`--outfile=${se}`),Oe&&T.push(`--outdir=${Oe}`),ee&&T.push(`--outbase=${ee}`),Z&&T.push(`--tsconfig=${Z}`),z&&T.push(`--packages=${z}`),L&&T.push(`--resolve-extensions=${be(L,"resolve extension")}`),V&&T.push(`--public-path=${V}`),p&&T.push(`--entry-names=${p}`),A&&T.push(`--chunk-names=${A}`),B&&T.push(`--asset-names=${B}`),b&&T.push(`--main-fields=${be(b,"main field")}`),S&&T.push(`--conditions=${be(S,"condition")}`),j)for(let ie of j)T.push(`--external:${rt(ie,"external")}`);if(K)for(let ie in K){if(ie.indexOf("=")>=0)throw new Error(`Invalid package name in alias: ${ie}`);T.push(`--alias:${ie}=${rt(K[ie],"alias",ie)}`)}if(ae)for(let ie in ae){if(ie.indexOf("=")>=0)throw new Error(`Invalid banner file type: ${ie}`);T.push(`--banner:${ie}=${rt(ae[ie],"banner",ie)}`)}if(Pe)for(let ie in Pe){if(ie.indexOf("=")>=0)throw new Error(`Invalid footer file type: ${ie}`);T.push(`--footer:${ie}=${rt(Pe[ie],"footer",ie)}`)}if(U)for(let ie of U)T.push(`--inject:${rt(ie,"inject")}`);if(C)for(let ie in C){if(ie.indexOf("=")>=0)throw new Error(`Invalid loader extension: ${ie}`);T.push(`--loader:${ie}=${rt(C[ie],"loader",ie)}`)}if(N)for(let ie in N){if(ie.indexOf("=")>=0)throw new Error(`Invalid out extension: ${ie}`);T.push(`--out-extension:${ie}=${rt(N[ie],"out extension",ie)}`)}if(G)if(Array.isArray(G))for(let ie=0,Wt=G.length;ie<Wt;ie++){let mt=G[ie];if(typeof mt=="object"&&mt!==null){let Tt=Object.create(null),zt=v(mt,Tt,"in",q),gt=v(mt,Tt,"out",q);if(Be(mt,Tt,"in entry point at index "+ie),zt===void 0)throw new Error('Missing property "in" for entry point at index '+ie);if(gt===void 0)throw new Error('Missing property "out" for entry point at index '+ie);R.push([gt,zt])}else R.push(["",rt(mt,"entry point at index "+ie)])}else for(let ie in G)R.push([ie,rt(G[ie],"entry point",ie)]);if(ge){let ie=Object.create(null),Wt=v(ge,ie,"contents",ic),mt=v(ge,ie,"resolveDir",q),Tt=v(ge,ie,"sourcefile",q),zt=v(ge,ie,"loader",q);Be(ge,ie,'in "stdin" object'),Tt&&T.push(`--sourcefile=${Tt}`),zt&&T.push(`--loader=${zt}`),mt&&(W=mt),typeof Wt=="string"?F=$(Wt):Wt instanceof Uint8Array&&(F=Wt)}let Bt=[];if(I)for(let ie of I)ie+="",Bt.push(ie);return{entries:R,flags:T,write:fe,stdinContents:F,stdinResolveDir:W,absWorkingDir:we,nodePaths:Bt,mangleCache:ac(We)}}function tf(c,d,f,E){let M=[],P=Object.create(null);ji(M,d,P,f,E),rc(M,d,P);let T=v(d,P,"sourcemap",nc),R=v(d,P,"sourcefile",q),w=v(d,P,"loader",q),F=v(d,P,"banner",q),W=v(d,P,"footer",q),J=v(d,P,"mangleCache",dt);return Be(d,P,`in ${c}() call`),T&&M.push(`--sourcemap=${T===!0?"external":T}`),R&&M.push(`--sourcefile=${R}`),w&&M.push(`--loader=${w}`),F&&M.push(`--banner=${F}`),W&&M.push(`--footer=${W}`),{flags:M,mangleCache:ac(J)}}function nf(c){const d={},f={didClose:!1,reason:""};let E={},M=0,P=0,T=new Uint8Array(16*1024),R=0,w=Z=>{let L=R+Z.length;if(L>T.length){let b=new Uint8Array(L*2);b.set(T),T=b}T.set(Z,R),R+=Z.length;let I=0;for(;I+4<=R;){let b=X(T,I);if(I+4+b>R)break;I+=4,ye(T.subarray(I,I+b)),I+=b}I>0&&(T.copyWithin(0,I,R),R-=I)},F=Z=>{f.didClose=!0,Z&&(f.reason=": "+(Z.message||Z));const L="The service was stopped"+f.reason;for(let I in E)E[I](L,null);E={}},W=(Z,L,I)=>{if(f.didClose)return I("The service is no longer running"+f.reason,null);let b=M++;E[b]=(S,j)=>{try{I(S,j)}finally{Z&&Z.unref()}},Z&&Z.ref(),c.writeToStdin(o({id:b,isRequest:!0,value:L}))},J=(Z,L)=>{if(f.didClose)throw new Error("The service is no longer running"+f.reason);c.writeToStdin(o({id:Z,isRequest:!1,value:L}))},me=(Z,L)=>h(null,null,function*(){try{if(L.command==="ping"){J(Z,{});return}if(typeof L.key=="number"){const I=d[L.key];if(!I)return;const b=I[L.command];if(b){yield b(Z,L);return}}throw new Error("Invalid command: "+L.command)}catch(I){const b=[ln(I,c,null,void 0,"")];try{J(Z,{errors:b})}catch{}}}),de=!0,ye=Z=>{if(de){de=!1;let I=String.fromCharCode(...Z);if(I!=="0.27.7")throw new Error(`Cannot start service: Host version "0.27.7" does not match binary version ${O(I)}`);return}let L=k(Z);if(L.isRequest)me(L.id,L.value);else{let I=E[L.id];delete E[L.id],L.value.error?I(L.value.error,{}):I(null,L.value)}};return{readFromStdout:w,afterClose:F,service:{buildOrContext:({callName:Z,refs:L,options:I,isTTY:b,defaultWD:S,callback:j})=>{let z=0;const K=P++,C={},N={ref(){++z===1&&L&&L.ref()},unref(){--z===0&&(delete d[K],L&&L.unref())}};d[K]=C,N.ref(),sf(Z,K,W,J,N,c,C,I,b,S,(V,p)=>{try{j(V,p)}finally{N.unref()}})},transform:({callName:Z,refs:L,input:I,options:b,isTTY:S,fs:j,callback:z})=>{const K=oc();let C=N=>{try{if(typeof I!="string"&&!(I instanceof Uint8Array))throw new Error('The input to "transform" must be a string or a Uint8Array');let{flags:V,mangleCache:p}=tf(Z,b,S,re),A={command:"transform",flags:V,inputFS:N!==null,input:N!==null?$(N):typeof I=="string"?$(I):I};p&&(A.mangleCache=p),W(L,A,(B,U)=>{if(B)return z(new Error(B),null);let ae=In(U.errors,K),Pe=In(U.warnings,K),G=1,we=()=>{if(--G===0){let ge={warnings:Pe,code:U.code,map:U.map,mangleCache:void 0,legalComments:void 0};"legalComments"in U&&(ge.legalComments=U==null?void 0:U.legalComments),U.mangleCache&&(ge.mangleCache=U==null?void 0:U.mangleCache),z(null,ge)}};if(ae.length>0)return z(ds("Transform failed",ae,Pe),null);U.codeFS&&(G++,j.readFile(U.code,(ge,fe)=>{ge!==null?z(ge,null):(U.code=fe,we())})),U.mapFS&&(G++,j.readFile(U.map,(ge,fe)=>{ge!==null?z(ge,null):(U.map=fe,we())})),we()})}catch(V){let p=[];try{ji(p,b,{},S,re)}catch{}const A=ln(V,c,K,void 0,"");W(L,{command:"error",flags:p,error:A},()=>{A.detail=K.load(A.detail),z(ds("Transform failed",[A],[]),null)})}};if((typeof I=="string"||I instanceof Uint8Array)&&I.length>1024*1024){let N=C;C=()=>j.writeFile(I,N)}C(null)},formatMessages:({callName:Z,refs:L,messages:I,options:b,callback:S})=>{if(!b)throw new Error(`Missing second argument in ${Z}() call`);let j={},z=v(b,j,"kind",q),K=v(b,j,"color",ue),C=v(b,j,"terminalWidth",on);if(Be(b,j,`in ${Z}() call`),z===void 0)throw new Error(`Missing "kind" in ${Z}() call`);if(z!=="error"&&z!=="warning")throw new Error(`Expected "kind" to be "error" or "warning" in ${Z}() call`);let N={command:"format-msgs",messages:Ut(I,"messages",null,"",C),isWarning:z==="warning"};K!==void 0&&(N.color=K),C!==void 0&&(N.terminalWidth=C),W(L,N,(V,p)=>{if(V)return S(new Error(V),null);S(null,p.messages)})},analyzeMetafile:({callName:Z,refs:L,metafile:I,options:b,callback:S})=>{b===void 0&&(b={});let j={},z=v(b,j,"color",ue),K=v(b,j,"verbose",ue);Be(b,j,`in ${Z}() call`);let C={command:"analyze-metafile",metafile:I};z!==void 0&&(C.color=z),K!==void 0&&(C.verbose=K),W(L,C,(N,V)=>{if(N)return S(new Error(N),null);S(null,V.result)})}}}}function sf(c,d,f,E,M,P,T,R,w,F,W){const J=oc(),me=c==="context",de=(se,Oe)=>{const ee=[];try{ji(ee,R,{},w,Q)}catch{}const Z=ln(se,P,J,void 0,Oe);f(M,{command:"error",flags:ee,error:Z},()=>{Z.detail=J.load(Z.detail),W(ds(me?"Context failed":"Build failed",[Z],[]),null)})};let ye;if(typeof R=="object"){const se=R.plugins;if(se!==void 0){if(!Array.isArray(se))return de(new Error('"plugins" must be an array'),"");ye=se}}if(ye&&ye.length>0){if(P.isSync)return de(new Error("Cannot use plugins in synchronous API calls"),"");af(d,f,E,M,P,T,R,ye,J).then(se=>{if(!se.ok)return de(se.error,se.pluginName);try{ve(se.requestPlugins,se.runOnEndCallbacks,se.scheduleOnDisposeCallbacks)}catch(Oe){de(Oe,"")}},se=>de(se,""));return}try{ve(null,(se,Oe)=>Oe([],[]),()=>{})}catch(se){de(se,"")}function ve(se,Oe,ee){const Z=P.hasFS,{entries:L,flags:I,write:b,stdinContents:S,stdinResolveDir:j,absWorkingDir:z,nodePaths:K,mangleCache:C}=ef(c,R,w,Q,Z);if(b&&!P.hasFS)throw new Error('The "write" option is unavailable in this environment');const N={command:"build",key:d,entries:L,flags:I,write:b,stdinContents:S,stdinResolveDir:j,absWorkingDir:z||F,nodePaths:K,context:me};se&&(N.plugins=se),C&&(N.mangleCache=C);const V=(B,U)=>{const ae={errors:In(B.errors,J),warnings:In(B.warnings,J),outputFiles:void 0,metafile:void 0,mangleCache:void 0},Pe=ae.errors.slice(),G=ae.warnings.slice();B.outputFiles&&(ae.outputFiles=B.outputFiles.map(of)),B.metafile&&B.metafile.length&&(ae.metafile=lf(B.metafile)),B.mangleCache&&(ae.mangleCache=B.mangleCache),B.writeToStdout!==void 0&&console.log(te(B.writeToStdout).replace(/\n$/,"")),Oe(ae,(we,ge)=>{if(Pe.length>0||we.length>0){const fe=ds("Build failed",Pe.concat(we),G.concat(ge));return U(fe,null,we,ge)}U(null,ae,we,ge)})};let p,A;me&&(T["on-end"]=(B,U)=>new Promise(ae=>{V(U,(Pe,G,we,ge)=>{const fe={errors:we,warnings:ge};A&&A(Pe,G),p=void 0,A=void 0,E(B,fe),ae()})})),f(M,N,(B,U)=>{if(B)return W(new Error(B),null);if(!me)return V(U,(G,we)=>(ee(),W(G,we)));if(U.errors.length>0)return W(ds("Context failed",U.errors,U.warnings),null);let ae=!1;const Pe={rebuild:()=>(p||(p=new Promise((G,we)=>{let ge;A=(ot,We)=>{ge||(ge=()=>ot?we(ot):G(We))};const fe=()=>{f(M,{command:"rebuild",key:d},(We,Bt)=>{We?we(new Error(We)):ge?ge():fe()})};fe()})),p),watch:(G={})=>new Promise((we,ge)=>{if(!P.hasFS)throw new Error('Cannot use the "watch" API in this environment');const fe={},ot=v(G,fe,"delay",on);Be(G,fe,"in watch() call");const We={command:"watch",key:d};ot&&(We.delay=ot),f(M,We,Bt=>{Bt?ge(new Error(Bt)):we(void 0)})}),serve:(G={})=>new Promise((we,ge)=>{if(!P.hasFS)throw new Error('Cannot use the "serve" API in this environment');const fe={},ot=v(G,fe,"port",Gh),We=v(G,fe,"host",q),Bt=v(G,fe,"servedir",q),ie=v(G,fe,"keyfile",q),Wt=v(G,fe,"certfile",q),mt=v(G,fe,"fallback",q),Tt=v(G,fe,"cors",dt),zt=v(G,fe,"onRequest",ec);Be(G,fe,"in serve() call");const gt={command:"serve",key:d,onRequest:!!zt};if(ot!==void 0&&(gt.port=ot),We!==void 0&&(gt.host=We),Bt!==void 0&&(gt.servedir=Bt),ie!==void 0&&(gt.keyfile=ie),Wt!==void 0&&(gt.certfile=Wt),mt!==void 0&&(gt.fallback=mt),Tt){const ps={},jn=v(Tt,ps,"origin",sc);Be(Tt,ps,'on "cors" object'),Array.isArray(jn)?gt.corsOrigin=jn:jn!==void 0&&(gt.corsOrigin=[jn])}f(M,gt,(ps,jn)=>{if(ps)return ge(new Error(ps));zt&&(T["serve-request"]=(kf,Ef)=>{zt(Ef.args),E(kf,{})}),we(jn)})}),cancel:()=>new Promise(G=>{if(ae)return G();f(M,{command:"cancel",key:d},()=>{G()})}),dispose:()=>new Promise(G=>{if(ae)return G();ae=!0,f(M,{command:"dispose",key:d},()=>{G(),ee(),M.unref()})})};M.ref(),W(null,Pe)})}}var af=(c,d,f,E,M,P,T,R,w)=>h(null,null,function*(){let F=[],W=[],J={},me={},de=[],ye=0,ve=0,se=[],Oe=!1;R=[...R];for(let L of R){let I={};if(typeof L!="object")throw new Error(`Plugin at index ${ve} must be an object`);const b=v(L,I,"name",q);if(typeof b!="string"||b==="")throw new Error(`Plugin at index ${ve} is missing a name`);try{let S=v(L,I,"setup",ec);if(typeof S!="function")throw new Error("Plugin is missing a setup function");Be(L,I,`on plugin ${O(b)}`);let j={name:b,onStart:!1,onEnd:!1,onResolve:[],onLoad:[]};ve++;let K=S({initialOptions:T,resolve:(C,N={})=>{if(!Oe)throw new Error('Cannot call "resolve" before plugin setup has completed');if(typeof C!="string")throw new Error("The path to resolve must be a string");let V=Object.create(null),p=v(N,V,"pluginName",q),A=v(N,V,"importer",q),B=v(N,V,"namespace",q),U=v(N,V,"resolveDir",q),ae=v(N,V,"kind",q),Pe=v(N,V,"pluginData",Fe),G=v(N,V,"with",dt);return Be(N,V,"in resolve() call"),new Promise((we,ge)=>{const fe={command:"resolve",path:C,key:c,pluginName:b};if(p!=null&&(fe.pluginName=p),A!=null&&(fe.importer=A),B!=null&&(fe.namespace=B),U!=null&&(fe.resolveDir=U),ae!=null)fe.kind=ae;else throw new Error('Must specify "kind" when calling "resolve"');Pe!=null&&(fe.pluginData=w.store(Pe)),G!=null&&(fe.with=rf(G,"with")),d(E,fe,(ot,We)=>{ot!==null?ge(new Error(ot)):we({errors:In(We.errors,w),warnings:In(We.warnings,w),path:We.path,external:We.external,sideEffects:We.sideEffects,namespace:We.namespace,suffix:We.suffix,pluginData:w.load(We.pluginData)})})})},onStart(C){let N='This error came from the "onStart" callback registered here:',V=Mi(new Error(N),M,"onStart");F.push({name:b,callback:C,note:V}),j.onStart=!0},onEnd(C){let N='This error came from the "onEnd" callback registered here:',V=Mi(new Error(N),M,"onEnd");W.push({name:b,callback:C,note:V}),j.onEnd=!0},onResolve(C,N){let V='This error came from the "onResolve" callback registered here:',p=Mi(new Error(V),M,"onResolve"),A={},B=v(C,A,"filter",Ct),U=v(C,A,"namespace",q);if(Be(C,A,`in onResolve() call for plugin ${O(b)}`),B==null)throw new Error("onResolve() call is missing a filter");let ae=ye++;J[ae]={name:b,callback:N,note:p},j.onResolve.push({id:ae,filter:Ni(B),namespace:U||""})},onLoad(C,N){let V='This error came from the "onLoad" callback registered here:',p=Mi(new Error(V),M,"onLoad"),A={},B=v(C,A,"filter",Ct),U=v(C,A,"namespace",q);if(Be(C,A,`in onLoad() call for plugin ${O(b)}`),B==null)throw new Error("onLoad() call is missing a filter");let ae=ye++;me[ae]={name:b,callback:N,note:p},j.onLoad.push({id:ae,filter:Ni(B),namespace:U||""})},onDispose(C){de.push(C)},esbuild:M.esbuild});K&&(yield K),se.push(j)}catch(S){return{ok:!1,error:S,pluginName:b}}}P["on-start"]=(L,I)=>h(null,null,function*(){w.clear();let b={errors:[],warnings:[]};yield Promise.all(F.map(S=>h(null,[S],function*({name:j,callback:z,note:K}){try{let C=yield z();if(C!=null){if(typeof C!="object")throw new Error(`Expected onStart() callback in plugin ${O(j)} to return an object`);let N={},V=v(C,N,"errors",Rt),p=v(C,N,"warnings",Rt);Be(C,N,`from onStart() callback in plugin ${O(j)}`),V!=null&&b.errors.push(...Ut(V,"errors",w,j,void 0)),p!=null&&b.warnings.push(...Ut(p,"warnings",w,j,void 0))}}catch(C){b.errors.push(ln(C,M,w,K&&K(),j))}}))),f(L,b)}),P["on-resolve"]=(L,I)=>h(null,null,function*(){let b={},S="",j,z;for(let K of I.ids)try{({name:S,callback:j,note:z}=J[K]);let C=yield j({path:I.path,importer:I.importer,namespace:I.namespace,resolveDir:I.resolveDir,kind:I.kind,pluginData:w.load(I.pluginData),with:I.with});if(C!=null){if(typeof C!="object")throw new Error(`Expected onResolve() callback in plugin ${O(S)} to return an object`);let N={},V=v(C,N,"pluginName",q),p=v(C,N,"path",q),A=v(C,N,"namespace",q),B=v(C,N,"suffix",q),U=v(C,N,"external",ue),ae=v(C,N,"sideEffects",ue),Pe=v(C,N,"pluginData",Fe),G=v(C,N,"errors",Rt),we=v(C,N,"warnings",Rt),ge=v(C,N,"watchFiles",at),fe=v(C,N,"watchDirs",at);Be(C,N,`from onResolve() callback in plugin ${O(S)}`),b.id=K,V!=null&&(b.pluginName=V),p!=null&&(b.path=p),A!=null&&(b.namespace=A),B!=null&&(b.suffix=B),U!=null&&(b.external=U),ae!=null&&(b.sideEffects=ae),Pe!=null&&(b.pluginData=w.store(Pe)),G!=null&&(b.errors=Ut(G,"errors",w,S,void 0)),we!=null&&(b.warnings=Ut(we,"warnings",w,S,void 0)),ge!=null&&(b.watchFiles=Pi(ge,"watchFiles")),fe!=null&&(b.watchDirs=Pi(fe,"watchDirs"));break}}catch(C){b={id:K,errors:[ln(C,M,w,z&&z(),S)]};break}f(L,b)}),P["on-load"]=(L,I)=>h(null,null,function*(){let b={},S="",j,z;for(let K of I.ids)try{({name:S,callback:j,note:z}=me[K]);let C=yield j({path:I.path,namespace:I.namespace,suffix:I.suffix,pluginData:w.load(I.pluginData),with:I.with});if(C!=null){if(typeof C!="object")throw new Error(`Expected onLoad() callback in plugin ${O(S)} to return an object`);let N={},V=v(C,N,"pluginName",q),p=v(C,N,"contents",ic),A=v(C,N,"resolveDir",q),B=v(C,N,"pluginData",Fe),U=v(C,N,"loader",q),ae=v(C,N,"errors",Rt),Pe=v(C,N,"warnings",Rt),G=v(C,N,"watchFiles",at),we=v(C,N,"watchDirs",at);Be(C,N,`from onLoad() callback in plugin ${O(S)}`),b.id=K,V!=null&&(b.pluginName=V),p instanceof Uint8Array?b.contents=p:p!=null&&(b.contents=$(p)),A!=null&&(b.resolveDir=A),B!=null&&(b.pluginData=w.store(B)),U!=null&&(b.loader=U),ae!=null&&(b.errors=Ut(ae,"errors",w,S,void 0)),Pe!=null&&(b.warnings=Ut(Pe,"warnings",w,S,void 0)),G!=null&&(b.watchFiles=Pi(G,"watchFiles")),we!=null&&(b.watchDirs=Pi(we,"watchDirs"));break}}catch(C){b={id:K,errors:[ln(C,M,w,z&&z(),S)]};break}f(L,b)});let ee=(L,I)=>I([],[]);W.length>0&&(ee=(L,I)=>{h(null,null,function*(){const b=[],S=[];for(const{name:j,callback:z,note:K}of W){let C,N;try{const V=yield z(L);if(V!=null){if(typeof V!="object")throw new Error(`Expected onEnd() callback in plugin ${O(j)} to return an object`);let p={},A=v(V,p,"errors",Rt),B=v(V,p,"warnings",Rt);Be(V,p,`from onEnd() callback in plugin ${O(j)}`),A!=null&&(C=Ut(A,"errors",w,j,void 0)),B!=null&&(N=Ut(B,"warnings",w,j,void 0))}}catch(V){C=[ln(V,M,w,K&&K(),j)]}if(C){b.push(...C);try{L.errors.push(...C)}catch{}}if(N){S.push(...N);try{L.warnings.push(...N)}catch{}}}I(b,S)})});let Z=()=>{for(const L of de)setTimeout(()=>L(),0)};return Oe=!0,{ok:!0,requestPlugins:se,runOnEndCallbacks:ee,scheduleOnDisposeCallbacks:Z}});function oc(){const c=new Map;let d=0;return{clear(){c.clear()},load(f){return c.get(f)},store(f){if(f===void 0)return-1;const E=d++;return c.set(E,f),E}}}function Mi(c,d,f){let E,M=!1;return()=>{if(M)return E;M=!0;try{let P=(c.stack+"").split(`
`);P.splice(1,1);let T=lc(d,P,f);if(T)return E={text:c.message,location:T},E}catch{}}}function ln(c,d,f,E,M){let P="Internal error",T=null;try{P=(c&&c.message||c)+""}catch{}try{T=lc(d,(c.stack+"").split(`
`),"")}catch{}return{id:"",pluginName:M,text:P,location:T,notes:E?[E]:[],detail:f?f.store(c):-1}}function lc(c,d,f){let E="    at ";if(c.readFileSync&&!d[0].startsWith(E)&&d[1].startsWith(E))for(let M=1;M<d.length;M++){let P=d[M];if(P.startsWith(E))for(P=P.slice(E.length);;){let T=/^(?:new |async )?\S+ \((.*)\)$/.exec(P);if(T){P=T[1];continue}if(T=/^eval at \S+ \((.*)\)(?:, \S+:\d+:\d+)?$/.exec(P),T){P=T[1];continue}if(T=/^(\S+):(\d+):(\d+)$/.exec(P),T){let R;try{R=c.readFileSync(T[1],"utf8")}catch{break}let w=R.split(/\r\n|\r|\n|\u2028|\u2029/)[+T[2]-1]||"",F=+T[3]-1,W=w.slice(F,F+f.length)===f?f.length:0;return{file:T[1],namespace:"file",line:+T[2],column:$(w.slice(0,F)).length,length:$(w.slice(F,F+W)).length,lineText:w+`
`+d.slice(1).join(`
`),suggestion:""}}break}}return null}function ds(c,d,f){let E=5;c+=d.length<1?"":` with ${d.length} error${d.length<2?"":"s"}:`+d.slice(0,E+1).map((P,T)=>{if(T===E)return`
...`;if(!P.location)return`
error: ${P.text}`;let{file:R,line:w,column:F}=P.location,W=P.pluginName?`[plugin: ${P.pluginName}] `:"";return`
${R}:${w}:${F}: ERROR: ${W}${P.text}`}).join("");let M=new Error(c);for(const[P,T]of[["errors",d],["warnings",f]])Object.defineProperty(M,P,{configurable:!0,enumerable:!0,get:()=>T,set:R=>Object.defineProperty(M,P,{configurable:!0,enumerable:!0,value:R})});return M}function In(c,d){for(const f of c)f.detail=d.load(f.detail);return c}function cc(c,d,f){if(c==null)return null;let E={},M=v(c,E,"file",q),P=v(c,E,"namespace",q),T=v(c,E,"line",on),R=v(c,E,"column",on),w=v(c,E,"length",on),F=v(c,E,"lineText",q),W=v(c,E,"suggestion",q);if(Be(c,E,d),F){const J=F.slice(0,(R&&R>0?R:0)+(w&&w>0?w:0)+(f&&f>0?f:80));!/[\x7F-\uFFFF]/.test(J)&&!/\n/.test(F)&&(F=J)}return{file:M||"",namespace:P||"",line:T||0,column:R||0,length:w||0,lineText:F||"",suggestion:W||""}}function Ut(c,d,f,E,M){let P=[],T=0;for(const R of c){let w={},F=v(R,w,"id",q),W=v(R,w,"pluginName",q),J=v(R,w,"text",q),me=v(R,w,"location",tc),de=v(R,w,"notes",Rt),ye=v(R,w,"detail",Fe),ve=`in element ${T} of "${d}"`;Be(R,w,ve);let se=[];if(de)for(const Oe of de){let ee={},Z=v(Oe,ee,"text",q),L=v(Oe,ee,"location",tc);Be(Oe,ee,ve),se.push({text:Z||"",location:cc(L,ve,M)})}P.push({id:F||"",pluginName:W||E,text:J||"",location:cc(me,ve,M),notes:se,detail:f?f.store(ye):-1}),T++}return P}function Pi(c,d){const f=[];for(const E of c){if(typeof E!="string")throw new Error(`${O(d)} must be an array of strings`);f.push(E)}return f}function rf(c,d){const f=Object.create(null);for(const E in c){const M=c[E];if(typeof M!="string")throw new Error(`key ${O(E)} in object ${O(d)} must be a string`);f[E]=M}return f}function of({path:c,contents:d,hash:f}){let E=null;return{path:c,contents:d,hash:f,get text(){const M=this.contents;return(E===null||M!==d)&&(d=M,E=te(M)),E}}}function Ni(c){let d=c.source;return c.flags&&(d=`(?${c.flags})${d}`),d}function lf(c){let d;try{d=te(c)}catch{return x(c)}return JSON.parse(d)}var cf="0.27.7",df=c=>us().build(c),uf=c=>us().context(c),pf=(c,d)=>us().transform(c,d),hf=(c,d)=>us().formatMessages(c,d),ff=(c,d)=>us().analyzeMetafile(c,d),mf=()=>{throw new Error('The "buildSync" API only works in node')},gf=()=>{throw new Error('The "transformSync" API only works in node')},bf=()=>{throw new Error('The "formatMessagesSync" API only works in node')},yf=()=>{throw new Error('The "analyzeMetafileSync" API only works in node')},vf=()=>(Oi&&Oi(),Promise.resolve()),cn,Oi,Di,us=()=>{if(Di)return Di;throw cn?new Error('You need to wait for the promise returned from "initialize" to be resolved before calling this'):new Error('You need to call "initialize" before calling this')},wf=c=>{c=Zh(c||{});let d=c.wasmURL,f=c.wasmModule,E=c.worker!==!1;if(!d&&!f)throw new Error('Must provide either the "wasmURL" option or the "wasmModule" option');if(cn)throw new Error('Cannot call "initialize" more than once');return cn=_f(d||"",f,E),cn.catch(()=>{cn=void 0}),cn},_f=(c,d,f)=>h(null,null,function*(){let E,M;const P=new Promise(J=>M=J);if(f){let J=new Blob([`onmessage=((postMessage) => {
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
        go.argv = ["", \`--service=\${"0.27.7"}\`];
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
    })(postMessage)`],{type:"text/javascript"});E=new Worker(URL.createObjectURL(J))}else{let J=(de=>{var ye=(ee,Z,L)=>new Promise((I,b)=>{var S=K=>{try{z(L.next(K))}catch(C){b(C)}},j=K=>{try{z(L.throw(K))}catch(C){b(C)}},z=K=>K.done?I(K.value):Promise.resolve(K.value).then(S,j);z((L=L.apply(ee,Z)).next())});let ve,se={};for(let ee=self;ee;ee=Object.getPrototypeOf(ee))for(let Z of Object.getOwnPropertyNames(ee))Z in se||Object.defineProperty(se,Z,{get:()=>self[Z]});(()=>{const ee=()=>{const I=new Error("not implemented");return I.code="ENOSYS",I};if(!se.fs){let I="";se.fs={constants:{O_WRONLY:-1,O_RDWR:-1,O_CREAT:-1,O_TRUNC:-1,O_APPEND:-1,O_EXCL:-1,O_DIRECTORY:-1},writeSync(b,S){I+=L.decode(S);const j=I.lastIndexOf(`
`);return j!=-1&&(console.log(I.substring(0,j)),I=I.substring(j+1)),S.length},write(b,S,j,z,K,C){if(j!==0||z!==S.length||K!==null){C(ee());return}const N=this.writeSync(b,S);C(null,N)},chmod(b,S,j){j(ee())},chown(b,S,j,z){z(ee())},close(b,S){S(ee())},fchmod(b,S,j){j(ee())},fchown(b,S,j,z){z(ee())},fstat(b,S){S(ee())},fsync(b,S){S(null)},ftruncate(b,S,j){j(ee())},lchown(b,S,j,z){z(ee())},link(b,S,j){j(ee())},lstat(b,S){S(ee())},mkdir(b,S,j){j(ee())},open(b,S,j,z){z(ee())},read(b,S,j,z,K,C){C(ee())},readdir(b,S){S(ee())},readlink(b,S){S(ee())},rename(b,S,j){j(ee())},rmdir(b,S){S(ee())},stat(b,S){S(ee())},symlink(b,S,j){j(ee())},truncate(b,S,j){j(ee())},unlink(b,S){S(ee())},utimes(b,S,j,z){z(ee())}}}if(se.process||(se.process={getuid(){return-1},getgid(){return-1},geteuid(){return-1},getegid(){return-1},getgroups(){throw ee()},pid:-1,ppid:-1,umask(){throw ee()},cwd(){throw ee()},chdir(){throw ee()}}),se.path||(se.path={resolve(...I){return I.join("/")}}),!se.crypto)throw new Error("globalThis.crypto is not available, polyfill required (crypto.getRandomValues only)");if(!se.performance)throw new Error("globalThis.performance is not available, polyfill required (performance.now only)");if(!se.TextEncoder)throw new Error("globalThis.TextEncoder is not available, polyfill required");if(!se.TextDecoder)throw new Error("globalThis.TextDecoder is not available, polyfill required");const Z=new TextEncoder("utf-8"),L=new TextDecoder("utf-8");se.Go=class{constructor(){this.argv=["js"],this.env={},this.exit=p=>{p!==0&&console.warn("exit code:",p)},this._exitPromise=new Promise(p=>{this._resolveExitPromise=p}),this._pendingEvent=null,this._scheduledTimeouts=new Map,this._nextCallbackTimeoutID=1;const I=(p,A)=>{this.mem.setUint32(p+0,A,!0),this.mem.setUint32(p+4,Math.floor(A/4294967296),!0)},b=p=>{const A=this.mem.getUint32(p+0,!0),B=this.mem.getInt32(p+4,!0);return A+B*4294967296},S=p=>{const A=this.mem.getFloat64(p,!0);if(A===0)return;if(!isNaN(A))return A;const B=this.mem.getUint32(p,!0);return this._values[B]},j=(p,A)=>{if(typeof A=="number"&&A!==0){if(isNaN(A)){this.mem.setUint32(p+4,2146959360,!0),this.mem.setUint32(p,0,!0);return}this.mem.setFloat64(p,A,!0);return}if(A===void 0){this.mem.setFloat64(p,0,!0);return}let U=this._ids.get(A);U===void 0&&(U=this._idPool.pop(),U===void 0&&(U=this._values.length),this._values[U]=A,this._goRefCounts[U]=0,this._ids.set(A,U)),this._goRefCounts[U]++;let ae=0;switch(typeof A){case"object":A!==null&&(ae=1);break;case"string":ae=2;break;case"symbol":ae=3;break;case"function":ae=4;break}this.mem.setUint32(p+4,2146959360|ae,!0),this.mem.setUint32(p,U,!0)},z=p=>{const A=b(p+0),B=b(p+8);return new Uint8Array(this._inst.exports.mem.buffer,A,B)},K=p=>{const A=b(p+0),B=b(p+8),U=new Array(B);for(let ae=0;ae<B;ae++)U[ae]=S(A+ae*8);return U},C=p=>{const A=b(p+0),B=b(p+8);return L.decode(new DataView(this._inst.exports.mem.buffer,A,B))},N=(p,A)=>(this._inst.exports.testExport0(),this._inst.exports.testExport(p,A)),V=Date.now()-performance.now();this.importObject={_gotest:{add:(p,A)=>p+A,callExport:N},gojs:{"runtime.wasmExit":p=>{p>>>=0;const A=this.mem.getInt32(p+8,!0);this.exited=!0,delete this._inst,delete this._values,delete this._goRefCounts,delete this._ids,delete this._idPool,this.exit(A)},"runtime.wasmWrite":p=>{p>>>=0;const A=b(p+8),B=b(p+16),U=this.mem.getInt32(p+24,!0);se.fs.writeSync(A,new Uint8Array(this._inst.exports.mem.buffer,B,U))},"runtime.resetMemoryDataView":p=>{this.mem=new DataView(this._inst.exports.mem.buffer)},"runtime.nanotime1":p=>{p>>>=0,I(p+8,(V+performance.now())*1e6)},"runtime.walltime":p=>{p>>>=0;const A=new Date().getTime();I(p+8,A/1e3),this.mem.setInt32(p+16,A%1e3*1e6,!0)},"runtime.scheduleTimeoutEvent":p=>{p>>>=0;const A=this._nextCallbackTimeoutID;this._nextCallbackTimeoutID++,this._scheduledTimeouts.set(A,setTimeout(()=>{for(this._resume();this._scheduledTimeouts.has(A);)console.warn("scheduleTimeoutEvent: missed timeout event"),this._resume()},b(p+8))),this.mem.setInt32(p+16,A,!0)},"runtime.clearTimeoutEvent":p=>{p>>>=0;const A=this.mem.getInt32(p+8,!0);clearTimeout(this._scheduledTimeouts.get(A)),this._scheduledTimeouts.delete(A)},"runtime.getRandomData":p=>{p>>>=0,crypto.getRandomValues(z(p+8))},"syscall/js.finalizeRef":p=>{p>>>=0;const A=this.mem.getUint32(p+8,!0);if(this._goRefCounts[A]--,this._goRefCounts[A]===0){const B=this._values[A];this._values[A]=null,this._ids.delete(B),this._idPool.push(A)}},"syscall/js.stringVal":p=>{p>>>=0,j(p+24,C(p+8))},"syscall/js.valueGet":p=>{p>>>=0;const A=Reflect.get(S(p+8),C(p+16));p=this._inst.exports.getsp()>>>0,j(p+32,A)},"syscall/js.valueSet":p=>{p>>>=0,Reflect.set(S(p+8),C(p+16),S(p+32))},"syscall/js.valueDelete":p=>{p>>>=0,Reflect.deleteProperty(S(p+8),C(p+16))},"syscall/js.valueIndex":p=>{p>>>=0,j(p+24,Reflect.get(S(p+8),b(p+16)))},"syscall/js.valueSetIndex":p=>{p>>>=0,Reflect.set(S(p+8),b(p+16),S(p+24))},"syscall/js.valueCall":p=>{p>>>=0;try{const A=S(p+8),B=Reflect.get(A,C(p+16)),U=K(p+32),ae=Reflect.apply(B,A,U);p=this._inst.exports.getsp()>>>0,j(p+56,ae),this.mem.setUint8(p+64,1)}catch(A){p=this._inst.exports.getsp()>>>0,j(p+56,A),this.mem.setUint8(p+64,0)}},"syscall/js.valueInvoke":p=>{p>>>=0;try{const A=S(p+8),B=K(p+16),U=Reflect.apply(A,void 0,B);p=this._inst.exports.getsp()>>>0,j(p+40,U),this.mem.setUint8(p+48,1)}catch(A){p=this._inst.exports.getsp()>>>0,j(p+40,A),this.mem.setUint8(p+48,0)}},"syscall/js.valueNew":p=>{p>>>=0;try{const A=S(p+8),B=K(p+16),U=Reflect.construct(A,B);p=this._inst.exports.getsp()>>>0,j(p+40,U),this.mem.setUint8(p+48,1)}catch(A){p=this._inst.exports.getsp()>>>0,j(p+40,A),this.mem.setUint8(p+48,0)}},"syscall/js.valueLength":p=>{p>>>=0,I(p+16,parseInt(S(p+8).length))},"syscall/js.valuePrepareString":p=>{p>>>=0;const A=Z.encode(String(S(p+8)));j(p+16,A),I(p+24,A.length)},"syscall/js.valueLoadString":p=>{p>>>=0;const A=S(p+8);z(p+16).set(A)},"syscall/js.valueInstanceOf":p=>{p>>>=0,this.mem.setUint8(p+24,S(p+8)instanceof S(p+16)?1:0)},"syscall/js.copyBytesToGo":p=>{p>>>=0;const A=z(p+8),B=S(p+32);if(!(B instanceof Uint8Array||B instanceof Uint8ClampedArray)){this.mem.setUint8(p+48,0);return}const U=B.subarray(0,A.length);A.set(U),I(p+40,U.length),this.mem.setUint8(p+48,1)},"syscall/js.copyBytesToJS":p=>{p>>>=0;const A=S(p+8),B=z(p+16);if(!(A instanceof Uint8Array||A instanceof Uint8ClampedArray)){this.mem.setUint8(p+48,0);return}const U=B.subarray(0,A.length);A.set(U),I(p+40,U.length),this.mem.setUint8(p+48,1)},debug:p=>{console.log(p)}}}}run(I){return ye(this,null,function*(){if(!(I instanceof WebAssembly.Instance))throw new Error("Go.run: WebAssembly.Instance expected");this._inst=I,this.mem=new DataView(this._inst.exports.mem.buffer),this._values=[NaN,0,null,!0,!1,se,this],this._goRefCounts=new Array(this._values.length).fill(1/0),this._ids=new Map([[0,1],[null,2],[!0,3],[!1,4],[se,5],[this,6]]),this._idPool=[],this.exited=!1;let b=4096;const S=V=>{const p=b,A=Z.encode(V+"\0");return new Uint8Array(this.mem.buffer,b,A.length).set(A),b+=A.length,b%8!==0&&(b+=8-b%8),p},j=this.argv.length,z=[];this.argv.forEach(V=>{z.push(S(V))}),z.push(0),Object.keys(this.env).sort().forEach(V=>{z.push(S(`${V}=${this.env[V]}`))}),z.push(0);const C=b;if(z.forEach(V=>{this.mem.setUint32(b,V,!0),this.mem.setUint32(b+4,0,!0),b+=8}),b>=12288)throw new Error("total length of command line and environment variables exceeds limit");this._inst.exports.run(j,C),this.exited&&this._resolveExitPromise(),yield this._exitPromise})}_resume(){if(this.exited)throw new Error("Go program has already exited");this._inst.exports.resume(),this.exited&&this._resolveExitPromise()}_makeFuncWrapper(I){const b=this;return function(){const S={id:I,this:this,args:arguments};return b._pendingEvent=S,b._resume(),S.result}}}})(),ve=({data:ee})=>{let Z=new TextDecoder,L=se.fs,I="";L.writeSync=(K,C)=>{if(K===1)de(C);else if(K===2){I+=Z.decode(C);let N=I.split(`
`);N.length>1&&console.log(N.slice(0,-1).join(`
`)),I=N[N.length-1]}else throw new Error("Bad write");return C.length};let b=[],S,j=0;ve=({data:K})=>(K.length>0&&(b.push(K),S&&S()),z),L.read=(K,C,N,V,p,A)=>{if(K!==0||N!==0||V!==C.length||p!==null)throw new Error("Bad read");if(b.length===0){S=()=>L.read(K,C,N,V,p,A);return}let B=b[0],U=Math.max(0,Math.min(V,B.length-j));C.set(B.subarray(j,j+U),N),j+=U,j===B.length&&(b.shift(),j=0),A(null,U)};let z=new se.Go;return z.argv=["","--service=0.27.7"],Oe(ee,z).then(K=>{de(null),z.run(K)},K=>{de(K)}),z};function Oe(ee,Z){return ye(this,null,function*(){if(ee instanceof WebAssembly.Module)return WebAssembly.instantiate(ee,Z.importObject);const L=yield fetch(ee);if(!L.ok)throw new Error(`Failed to download ${JSON.stringify(ee)}`);if("instantiateStreaming"in WebAssembly&&/^application\/wasm($|;)/i.test(L.headers.get("Content-Type")||""))return(yield WebAssembly.instantiateStreaming(L,Z.importObject)).instance;const I=yield L.arrayBuffer();return(yield WebAssembly.instantiate(I,Z.importObject)).instance})}return ee=>ve(ee)})(de=>E.onmessage({data:de})),me;E={onmessage:null,postMessage:de=>setTimeout(()=>{try{me=J({data:de})}catch(ye){M(ye)}}),terminate(){if(me)for(let de of me._scheduledTimeouts.values())clearTimeout(de)}}}let T,R;const w=new Promise((J,me)=>{T=J,R=me});E.onmessage=({data:J})=>{E.onmessage=({data:me})=>F(me),J?R(J):T()},E.postMessage(d||new URL(c,location.href).toString());let{readFromStdout:F,service:W}=nf({writeToStdin(J){E.postMessage(J)},isSync:!1,hasFS:!1,esbuild:y});yield w,Oi=()=>{E.terminate(),cn=void 0,Oi=void 0,Di=void 0},Di={build:J=>new Promise((me,de)=>{P.then(de),W.buildOrContext({callName:"build",refs:null,options:J,isTTY:!1,defaultWD:"/",callback:(ye,ve)=>ye?de(ye):me(ve)})}),context:J=>new Promise((me,de)=>{P.then(de),W.buildOrContext({callName:"context",refs:null,options:J,isTTY:!1,defaultWD:"/",callback:(ye,ve)=>ye?de(ye):me(ve)})}),transform:(J,me)=>new Promise((de,ye)=>{P.then(ye),W.transform({callName:"transform",refs:null,input:J,options:me||{},isTTY:!1,fs:{readFile(ve,se){se(new Error("Internal error"),null)},writeFile(ve,se){se(null)}},callback:(ve,se)=>ve?ye(ve):de(se)})}),formatMessages:(J,me)=>new Promise((de,ye)=>{P.then(ye),W.formatMessages({callName:"formatMessages",refs:null,messages:J,options:me,callback:(ve,se)=>ve?ye(ve):de(se)})}),analyzeMetafile:(J,me)=>new Promise((de,ye)=>{P.then(ye),W.analyzeMetafile({callName:"analyzeMetafile",refs:null,metafile:typeof J=="string"?J:JSON.stringify(J),options:me,callback:(ve,se)=>ve?ye(ve):de(se)})})}}),xf=y})(e)})(Ya)),Ya.exports}var nd=dw();const uw="/asljs/assets/esbuild-B7pGHhMe.wasm";cw();function Dt(){return crypto.randomUUID()}function Lt(){return new Date().toISOString()}const pw=Y("app-workspace"),sn=Y("panels"),hw=Y("panel-chat"),fw=Y("panel-editor"),pa=Y("app-select"),ha=Y("file-select"),kh=Y("file-view"),Xa=Y("chat-root"),Da=Y("chat-model-select"),Eh=Y("btn-run"),fa=Y("preview-frame"),mw=Y("panel-preview-title"),La=Y("generation-model-select"),Fl=Y("btn-start-generation"),Rl=Y("btn-stop-generation"),gw=Y("generation-status"),Ah=Y("btn-new-app"),Sh=Y("btn-import"),$h=Y("btn-project-settings"),Ch=Y("btn-share"),Th=Y("btn-settings"),fi=Y("btn-toggle-chat"),mi=Y("btn-toggle-files"),bw=Y("mobile-tab-bar"),Ul=Y("mobile-tab-chat"),Bl=Y("mobile-tab-files"),Wl=Y("mobile-tab-run"),ma=Y("import-file"),Ih="asljs-app-builder-settings",jh="light",zr=14,Mh="__new__",Ph="__import__",yw="#I!",Nh=5e3,vw=4e3,ww=1e4,_w="https://alexandritesoftware.github.io/asljs/app-builder";let Qa=null,Za=!1,er=0,Wi=null,Fn=[{id:Ls},{id:Fs},{id:Yi}],Xi=!1,Nt="",Ye=null;Sw();Jt("chat");const sd=ow({onCreateApplication:Iw,onCreateTodoSample:jw}),xw=Zv(),kw=tw({onSave:Dw,onDelete:Lw}),Ew=sw({loadValues:async()=>({apiKey:await Oh(),theme:Dh(),fontSize:Lh(),maxToolSteps:Kl()}),onSave:Yw}),Aw=aw({canOpen:()=>gi()!==void 0,readAppName:()=>{var e;return((e=gi())==null?void 0:e.name)??"Shared app"},prepareLink:Gw,downloadExport:Jw});function Sw(){xe(Th,{className:"btn btn-outline-secondary btn-sm"}),xe(Ah,{text:"New",icon:'<i class="bi bi-plus-lg"></i>',className:"btn btn-outline-secondary btn-sm"}),xe(Sh,{text:"Import",className:"btn btn-outline-secondary btn-sm"}),xe($h,{className:"btn btn-outline-secondary btn-sm"}),xe(fi,{text:"Chat",icon:'<i class="bi bi-chevron-down"></i>',className:"btn btn-outline-secondary btn-sm"}),xe(mi,{text:"Files",icon:'<i class="bi bi-chevron-down"></i>',className:"btn btn-outline-secondary btn-sm"}),xe(Eh,{text:"Run",icon:'<i class="bi bi-play-fill"></i>',className:"btn btn-success btn-sm"}),xe(Ul,{text:"Chat",icon:'<i class="bi bi-chat-dots"></i>',className:"btn btn-outline-secondary flex-fill"}),xe(Bl,{text:"Files",icon:'<i class="bi bi-folder2-open"></i>',className:"btn btn-outline-secondary flex-fill"}),xe(Wl,{text:"Run",icon:'<i class="bi bi-play-fill"></i>',className:"btn btn-outline-secondary flex-fill"}),xe(Ch,{text:"Share",className:"btn btn-outline-secondary btn-sm"}),xe(Fl,{text:"Generate",className:"btn btn-primary btn-sm"}),xe(Rl,{text:"Stop",className:"btn btn-outline-secondary btn-sm"}),Is(pa,{className:"form-select form-select-sm bootstrap-select app-select"}),Is(ha,{className:"form-select form-select-sm bootstrap-select file-select"}),Is(Da,{className:"form-select form-select-sm bootstrap-select lane-model-select"}),Is(La,{className:"form-select form-select-sm bootstrap-select lane-model-select"})}function Fa(){return window.getComputedStyle(bw).display!=="none"}function Jt(e){sn.classList.remove("mobile-tab-chat","mobile-tab-files","mobile-tab-run"),sn.classList.add(`mobile-tab-${e}`);const t=[{tab:"chat",button:Ul},{tab:"files",button:Bl},{tab:"run",button:Wl}];for(const n of t){const s=n.tab===e;n.button.buttonClassName=s?"btn btn-primary flex-fill":"btn btn-outline-secondary flex-fill",n.button.setAttribute("aria-selected",String(s))}}function zl(){var e;mw.textContent=((e=gi())==null?void 0:e.name)??"Preview"}function Vl(){return Qa=Qa??Lv({codec:Fv(),baseUrl:_w,hashPrefix:yw,maxUrlLength:Nh}),Qa}function rn(){try{const e=localStorage.getItem(Ih)??"{}";return JSON.parse(e)}catch{return{}}}function Hl(e){localStorage.setItem(Ih,JSON.stringify(e))}async function Oh(){return D.currentAppId===null?(Nt="",Nt):(Nt=await Pl(D.currentAppId),Nt)}function ql(){return Nt}function Vr(){return Kh(rn().chatModel,Ls)}function Hr(){return Kh(rn().generationModel,Fs)}function Kl(){const e=rn().maxToolSteps;if(!Number.isFinite(e))return pi;const t=Math.floor(e);return t<1?pi:t}function Dh(){return rn().theme==="light"?"light":jh}function Lh(){const e=rn().fontSize;if(!Number.isFinite(e))return zr;const t=Math.floor(e);return t<12||t>20?zr:t}function Fh(){document.documentElement.setAttribute("data-bs-theme",Dh()),document.documentElement.style.fontSize=`${Lh()}px`}function $w(e){if(typeof e!="string")return null;const t=e.trim();return t===""?null:t}function cs(){return crypto.randomUUID()}async function Cw(e){const t=new Set,n=[];for(const s of e){let i=$w(s.uuid);if((i===null||t.has(i))&&(i=cs()),t.add(i),s.uuid===i){n.push(s);continue}const a={...s,uuid:i,updatedAt:s.updatedAt??Lt()};await Tn(a),n.push(a)}return n}function gi(){return D.apps.find(e=>e.id===D.currentAppId)}async function Tw(e){await Tn(e),D.apps=D.apps.map(t=>t.id===e.id?e:t)}async function Xn(){const e=gi();if(e===void 0)return;const t={...e,uuid:cs(),updatedAt:Lt()};await Tw(t)}const He=xy({getCurrentAppId:()=>D.currentAppId,getFiles:()=>D.files,setFiles:e=>{D.files=e},getActiveFileName:()=>D.activeFileName,setActiveFileName:e=>{D.activeFileName=e},createFileId:Dt,saveFile:async e=>{await di(e),await Xn()},deleteFileById:async e=>{await _y(e),await Xn()},runApp:Qn,evaluateInApp:e=>rv(fa,e),getAppDiagnostics:()=>ov(fa),showChoicePrompt:Mw,wait:e=>new Promise(t=>{window.setTimeout(t,e)})});function ga(){vv({selectElement:pa,apps:D.apps,currentAppId:D.currentAppId,newActionValue:Mh,importActionValue:Ph})}function Rh(){pw.classList.remove("hidden");const e=D.currentAppId!==null&&D.apps.some(t=>t.id===D.currentAppId);if(sn.classList.toggle("hidden",!e),!e){sd.show();return}sd.hide(),Gl(),Jl(),zl()}async function Iw(e){const t={id:Dt(),uuid:cs(),name:e.name,createdAt:Lt(),updatedAt:Lt()};await Tn(t),e.apiKey!==""&&await Oa(t.id,e.apiKey),await Ii(t.id,oh(t.id,t.name,Dt)),D.apps=[...D.apps,t],await Cn(t.id)}async function jw(e){const t=jv("TODO Sample");if(t===null){alert("TODO sample is not available.");return}const n=e.name===""?t.name:e.name,s={id:Dt(),uuid:cs(),name:n,author:t.author,createdAt:Lt(),updatedAt:Lt()},i=Mv(t,s.id,Dt);await Tn(s),e.apiKey!==""&&await Oa(s.id,e.apiKey),await Ii(s.id,i),D.apps=[...D.apps,s],await Cn(s.id)}function Gl(){wv({selectElement:ha,files:D.files,activeFileName:D.activeFileName})}function Jl(){_v({fileElement:kh,files:D.files,activeFileName:D.activeFileName,onSaveText:async(e,t)=>{const n=D.files.find(s=>s.name===e);n===void 0||n.content===t||(n.content=t,await di(n),await Xn())}})}function qr(e){D.generationBusy=e,Fl.disabled=e||D.generating,Rl.disabled=!e}function At(e){D.generationStatus=e,gw.textContent=e}function id(e,t){Ye==null||Ye.appendMessage(e,t),Yl()}function Mw(e,t){Ye!==null&&Ye.presentChoices(e,t,"send")}function Pw(){Ye==null||Ye.clearMessages(),Ye==null||Ye.dismissChoices(),Ye==null||Ye.clearProgress(),Yl()}function Yl(){D.chatMessages=Ye===null?[]:Ye.messages.read().filter(Uh).map(e=>({role:e.role,text:e.content}))}function Uh(e){return e.role==="user"||e.role==="assistant"}async function Bh(){if(D.currentAppId===null){Ye=null,Xa.replaceChildren(),D.chatMessages=[];return}const e=D.currentAppId;Ye=Mu();const n=a=>({provider:kv({appId:e,readChatModel:Vr,readInitialToolStepLimit:Kl}),...a!==null?{transport:a}:{},stateStore:Ev(e),getRequestContext:()=>({currentAppId:D.currentAppId}),buildRequestInput:({model:r})=>{const l=sv(r.messages.read().filter(Uh).map(m=>({role:m.role,text:m.content})));return[{role:"system",content:Qy},{role:"user",content:l}]},getTools:()=>Jp,executeTool:async(r,l)=>Xp({name:r,arguments:l},He)}),s=(await Pl(e)).trim(),i=document.createElement("asljs-ai-chat");if(s!=="")i.options=n(new Sr(s)),Xa.replaceChildren(i);else{i.options=n(null);const a=document.createElement("asljs-ai-chat-key");a.label="Enter your OpenAI API key to start chatting",a.submitLabel="Start chatting",a.addEventListener("key-submit",l=>{const h=l.detail.key.trim();h!==""&&Oa(e,h).then(()=>{Nt=h,i.options=n(new Sr(h)),a.remove()})});const r=document.createElement("div");r.className="chat-key-container",r.appendChild(a),r.appendChild(i),Xa.replaceChildren(r)}Yl()}async function Ra(){if(D.activeFileName===null||D.currentAppId===null)return;const e=D.files.find(s=>s.name===D.activeFileName);if(e===void 0)return;const t=kh.querySelector("textarea");if(!(t instanceof HTMLTextAreaElement))return;const n=t.value;e.content!==n&&(e.content=n,await di(e),await Xn())}async function Cn(e){D.currentAppId=e;const t=await wy(e),n=D.apps.find(i=>i.id===e),s=Zy({files:t,appId:e,appName:(n==null?void 0:n.name)??"Untitled App",createId:Dt});s.changed&&await Ii(e,s.files),D.files=s.files,D.activeFileName=Nw(s.files),await Oh(),await Xl(),await Bh()}function Nw(e){var t;return((t=e[0])==null?void 0:t.name)??null}function Wh(){xw.open({title:"New App",initialValue:"",selectText:!1,onConfirm:async e=>{const t={id:Dt(),uuid:cs(),name:e,createdAt:Lt(),updatedAt:Lt()};await Tn(t),await Ii(t.id,oh(t.id,t.name,Dt)),D.apps=[...D.apps,t],await Cn(t.id)}})}function Ow(){var t,n;const e=D.apps.find(s=>s.id===D.currentAppId);e!==void 0&&kw.open({name:e.name,authorName:((t=e.author)==null?void 0:t.name)??"",authorEmail:((n=e.author)==null?void 0:n.email)??""})}async function Dw(e){const t=D.apps.find(i=>i.id===D.currentAppId);if(t===void 0)return;const n=e.authorName!==""||e.authorEmail!==""?{...e.authorName!==""?{name:e.authorName}:{},...e.authorEmail!==""?{email:e.authorEmail}:{}}:void 0,s={...t,name:e.name,author:n,updatedAt:Lt()};await Tn(s),D.apps=D.apps.map(i=>i.id===t.id?s:i)}async function Lw(){const e=D.apps.find(t=>t.id===D.currentAppId);e!==void 0&&confirm(`Delete "${e.name}"? This cannot be undone.`)&&(await vy(e.id),D.apps=D.apps.filter(t=>t.id!==e.id),D.currentAppId=null,D.files=[],D.activeFileName=null,Pw(),fa.src="about:blank")}async function Fw(){if(D.generating){At("Wait for the chat response before starting generation.");return}if(D.generationBusy)return;if(D.currentAppId===null){At("Open or create an app first.");return}const e=ql();if(e===""){At("Add an OpenAI API key in Settings first.");return}await Ra();const t=Zw(Nl);if(!Nv(t)){At("No pending changes in PLAN.md.");return}const n=Ov(t);await ld(da,n),Xi=!1,qr(!0),At("Starting generation cycle...");try{const s=await Gy(["Implement the pending changes listed in CHANGE.md.","Use README.md as the current implemented app state.","Work through CHANGE.md, update app files, update README.md, and clear CHANGE.md when the cycle is complete.","Do not consume new changes that may later appear in PLAN.md during this cycle."].join(`
`),e,Hr(),He,{initialToolStepLimit:Kl(),systemPrompt:Xy,shouldStop:()=>Xi,onToolStepLimit:async({stepsCompleted:i})=>confirm(`Generation reached ${i} tool steps without finishing. Continue for 12 more steps?`),onProgress:i=>{At(i)}});await ld(da,`# CHANGE
`),At(s.summary),id("assistant",s.summary),Qn()}catch(s){if(s instanceof Wr){At("Generation stopped.");return}const i=s instanceof Error?s.message:String(s);At(`Generation error: ${i}`),id("assistant",`Generation error: ${i}`)}finally{Xi=!1,qr(!1)}}function Rw(){D.generationBusy&&(Xi=!0,At("Stopping generation after the current step..."))}function Qn(){Fa()&&Jt("run"),Ra().then(()=>{av(fa,D.files,{hostOpenAiApiKey:ql()})})}async function Uw(){await Ra();const e=gi();if(e===void 0)throw new Error("No app selected.");return $v({app:e,files:D.files})}function Bw(e){const t=new Blob([JSON.stringify(e)],{type:"application/json"}),n=URL.createObjectURL(t),s=document.createElement("a");s.href=n,s.download=`${e.name.replace(/\s+/g,"-")}.json`,s.click(),URL.revokeObjectURL(n)}async function zh(e){let t=await Uw();return e.excludeNonApplicationFiles&&(t={...t,files:Object.fromEntries(Object.entries(t.files).filter(([n])=>!Yv(n)))}),e.minified?Hv(t,Ww):t}async function Ww(e,t){return(await(await zw()).transform(e,{loader:t,minify:!0,target:"es2020"})).code.trim()}async function zw(){return Wi!==null||(Wi=(async()=>(await nd.initialize({wasmURL:uw,worker:!0}),{transform:nd.transform}))()),Wi}function Vw(e){var a,r;const t=((a=e==null?void 0:e.name)==null?void 0:a.trim())??"",n=((r=e==null?void 0:e.email)==null?void 0:r.trim())??"";return`Author: ${t===""?"Not provided":t}
Email: ${n===""?"Not provided":n}`}function Vh(e){return confirm(`Security warning: You are about to import an application.

${Vw(e.author)}

Although apps run in an isolated browser context, imported code can still be harmful. Be vigilant and only open apps from sources you trust.

Do you want to continue?`)}function zi(e){const t=e==="run";sn.classList.toggle("chat-collapsed",t),sn.classList.toggle("files-collapsed",t),ua(fi,{text:"Chat",icon:t?'<i class="bi bi-chevron-right"></i>':'<i class="bi bi-chevron-down"></i>'}),ua(mi,{text:"Files",icon:t?'<i class="bi bi-chevron-right"></i>':'<i class="bi bi-chevron-down"></i>'}),fi.setAttribute("aria-expanded",String(!t)),mi.setAttribute("aria-expanded",String(!t)),Fa()&&Jt(e==="run"?"run":"chat")}function ad(){return confirm(`You followed the application link.

Click OK to start the application.
Click Cancel to edit it.`)?"run":"edit"}function Hh(){ma.value="",ma.click()}async function Kr(e,t){const n=Cv({payload:e,existingApps:D.apps,navigateToExistingById:t.navigateToExistingById,now:Lt(),createId:Dt,createUuid:cs});return n.kind==="duplicate"?(t.showDuplicateAlert&&alert("Import stopped: an app with the same ID already exists."),null):n.kind==="existing"?(await Cn(n.appId),n.appId):(await Tn(n.app),await Ii(n.app.id,n.files),D.apps=[...D.apps,n.app],await Cn(n.app.id),n.app.id)}async function Hw(){var t;const e=(t=ma.files)==null?void 0:t[0];if(e!==void 0)try{const n=await e.text(),s=gh(n);if(!Vh(s))return;await Kr(s,{navigateToExistingById:!1,showDuplicateAlert:!0})}catch(n){const s=n instanceof Error?n.message:String(n);alert(`Import failed: ${s}`)}}function qw(){return Vl().readTokenFromHash(window.location.hash)}function tr(){window.history.pushState(null,"",`${window.location.pathname}${window.location.search}`)}async function qh(){const e=qw();if(e===null||e.trim()==="")return!1;if(Za)return!0;Za=!0;try{const t=(()=>{try{return decodeURIComponent(e)}catch{return e}})(),n=Zc(e)??Zc(t);if(n!==null)return await Kr(n,{navigateToExistingById:!0,showDuplicateAlert:!1})!==null&&(ad()==="run"?(zi("run"),Qn()):zi("edit")),tr(),!0;try{const s=await Vl().parsePayloadFromToken(e);if(!Vh(s))return tr(),!0;await Kr(s,{navigateToExistingById:!0,showDuplicateAlert:!1})!==null&&(ad()==="run"?(zi("run"),Qn()):zi("edit"))}catch(s){const i=s instanceof Error?s.message:String(s);alert(`Could not import from share link: ${i}`)}return tr(),!0}finally{Za=!1}}async function Kw(e,t,n){let s;const i=new Promise((a,r)=>{s=globalThis.setTimeout(()=>{r(new Error(n))},t)});try{return await Promise.race([e,i])}finally{s!==void 0&&globalThis.clearTimeout(s)}}async function Gw(e){er+=1;const t=er,n=await Kw((async()=>{const s=await zh(e);return Vl().createShareUrl(s)})(),ww,"Preparing share link timed out. Use Download export instead.");if(t!==er)throw new Error("Share link preparation was superseded by a newer request.");return{url:n.url,status:Xv(n.url.length,vw,Nh)}}async function Jw(e){const t=await zh(e);Bw(t)}async function Yw(e){const t=rn();delete t.apiKey,t.theme=e.theme==="light"?"light":jh;const n=Number.parseInt(e.fontSizeText,10);t.fontSize=Number.isFinite(n)&&n>=12&&n<=20?n:zr;const s=Number.parseInt(e.maxToolStepsText,10);if(t.maxToolSteps=Number.isFinite(s)&&s>=1?s:pi,Hl(t),D.currentAppId!==null){const i=Nt;Nt=e.apiKey,await Oa(D.currentAppId,Nt),i!==Nt&&await Bh()}await Xl(),Fh()}function rd(e,t,n){const s=st(e);if(e.items=t.map(i=>({value:i,label:i})),t.includes(s)){xt(e,s);return}xt(e,t.includes(n)?n:t[0]??n)}function od(){const e=Rs([...Fn,{id:Vr()},{id:Hr()}]).map(t=>t.id);rd(Da,e,Vr()),rd(La,e,Hr())}function Kh(e,t){const n=Rs(Fn).map(s=>s.id);return typeof e=="string"&&n.includes(e)?e:n.includes(t)?t:n[0]??t}function Xw(){const e=rn();e.chatModel=st(Da),Hl(e)}function Qw(){const e=rn();e.generationModel=st(La),Hl(e)}function Zw(e){var t;return((t=D.files.find(n=>n.name===e))==null?void 0:t.content)??""}async function ld(e,t){if(D.currentAppId===null)return;const n=D.files.find(i=>i.name===e);if(n!==void 0){if(n.content===t)return;n.content=t,await di(n),await Xn(),D.files=[...D.files];return}const s={id:Dt(),appId:D.currentAppId,name:e,content:t};await di(s),await Xn(),D.files=[...D.files,s]}async function Xl(e=ql()){const t=e.trim();if(t===""){Fn=Rs([{id:Ls},{id:Fs},{id:Yi}]),od();return}try{const n=await Ky(t);Fn=Rs([...n,{id:Ls},{id:Fs},{id:Yi}])}catch(n){console.warn("Could not load OpenAI models:",n),Fn=Rs([...Fn,{id:Ls},{id:Fs},{id:Yi}])}od()}function e_(){if(Fa()){Jt("chat");return}mh({panelElement:hw,toggleButtonElement:fi,panelsElement:sn,collapsedPanelsClass:"chat-collapsed",expandedText:"Chat",collapsedText:"Chat",expandedIcon:'<i class="bi bi-chevron-down"></i>',collapsedIcon:'<i class="bi bi-chevron-right"></i>'})}function t_(){if(Fa()){Jt("files");return}mh({panelElement:fw,toggleButtonElement:mi,panelsElement:sn,collapsedPanelsClass:"files-collapsed",expandedText:"Files",collapsedText:"Files",expandedIcon:'<i class="bi bi-chevron-down"></i>',collapsedIcon:'<i class="bi bi-chevron-right"></i>'})}D.on("set:apps",()=>{ga(),zl()});D.on("set:currentAppId",()=>{ga(),Rh(),zl()});D.on("set:files",()=>{Gl(),Jl()});D.on("set:activeFileName",()=>{Gl(),Jl()});Ah.addEventListener("click",Wh);Sh.addEventListener("click",Hh);$h.addEventListener("click",Ow);Ch.addEventListener("click",()=>{Aw.open()});Fl.addEventListener("click",()=>{Fw()});Rl.addEventListener("click",Rw);Eh.addEventListener("click",Qn);Th.addEventListener("click",()=>{Ew.open()});fi.addEventListener("click",e_);mi.addEventListener("click",t_);Ul.addEventListener("click",()=>{Jt("chat")});Bl.addEventListener("click",()=>{Jt("files")});Wl.addEventListener("click",()=>{const e=sn.classList.contains("mobile-tab-run");Jt("run"),e||Qn()});Da.addEventListener("change",Xw);La.addEventListener("change",Qw);pa.addEventListener("change",()=>{const e=st(pa);if(e===Mh){Wh(),ga();return}if(e===Ph){Hh(),ga();return}e!==""&&e!==D.currentAppId&&Cn(e)});ha.addEventListener("change",()=>{const e=st(ha);e===""||e===D.activeFileName||(Ra(),D.activeFileName=e)});ma.addEventListener("change",()=>{Hw()});window.listFileset=He.listFileset;window.listFilesByMask=He.listFilesByMask;window.readFile=He.readFile;window.readFiles=He.readFiles;window.readFilesByMask=He.readFilesByMask;window.readFileData=He.readFileData;window.setFilesContent=He.setFilesContent;window.setFileData=He.setFileData;window.setFileContent=He.setFileContent;window.replaceFilePart=He.replaceFilePart;window.deleteFile=He.deleteFile;window.grep=He.grep;window.choose=He.choose;window.evalInApp=He.evalInApp;window.assertInApp=He.assertInApp;window.runAppTests=He.runAppTests;window.getAppDiagnostics=He.getAppDiagnostics;window.runAppAndCollectDiagnostics=He.runAppAndCollectDiagnostics;window.addEventListener("hashchange",()=>{qh()});async function n_(){Fh(),await Xl(),qr(!1),At("Idle.");const e=await Cw(await yy());if(D.apps=e,!await qh())if(e.length>0){const n=[...e].sort((s,i)=>i.updatedAt.localeCompare(s.updatedAt));await Cn(n[0].id)}else D.currentAppId=null,D.files=[],D.activeFileName=null,D.chatMessages=[],Rh()}n_().catch(e=>{console.error("App Builder init failed:",e)});
//# sourceMappingURL=app-Bd-q-x55.js.map
