var u=(s,...t)=>String.raw({raw:s},...t),h=u;var c=class extends HTMLElement{static tag="";static attrs={};static events=[];static define(s=this.tag){if(!s)throw new Error("Custom element must specify a tag name");customElements.define(s,this)}static get observedAttributes(){return Object.keys(this.attrs)}get styles(){}get template(){throw new Error("Custom element must specify a template")}attrs;get#t(){return this.shadowRoot??this}constructor(){super();try{this.attachShadow({mode:"open"})}catch{}}connectedCallback(){this.#c(),this.#e(),this.#a(),this.#s()}ref(s){let t=this.maybeRef(s);if(!t)throw new Error(`Ref with name ${String(s)} was not found`);return t}maybeRef(s){return this.#t.querySelector(`[data-ref="${String(s)}"]`)??void 0}refs(){let s={};return this.#t.querySelectorAll("[data-ref]").forEach(t=>{t instanceof HTMLElement&&t.dataset.ref&&(s[t.dataset.ref]=t)}),s}emit(s,t){let e=new CustomEvent(String(s),{bubbles:!0,cancelable:!0,composed:!0,detail:t});this.dispatchEvent(e)}#c(){let s;if(this.template.startsWith("#")){if(s=document.querySelector(this.template),!(s instanceof HTMLTemplateElement))throw new Error(`${this.template} is not a template element`)}else s=document.createElement("template"),s.innerHTML=this.template;this.#t.appendChild(s.content.cloneNode(!0))}#e(){if(!this.styles)return;if(!(this.#t instanceof ShadowRoot))throw new Error('CSS is not supported when "shadow" is disabled');let s=new CSSStyleSheet;s.replaceSync(this.styles),this.#t.adoptedStyleSheets.push(s)}#s(){let{events:s}=this.constructor;s.forEach(t=>{this.#t.addEventListener(t,e=>{if(!(e.target instanceof HTMLElement))return;let r=e.target,i=`on:${e.type}`,a=`[data-${i.replace(":","\\:")}]`,n=r.dataset[i];!n&&(r=r.closest(a))&&(n=r.dataset[i]),this[n]?.(e)})})}#a(){let{attrs:s}=this.constructor;this.attrs??={},Object.entries(s).forEach(([t,e])=>{let r=e.stringify??(a=>a?.toString()??""),i=e.parse??(a=>a);Object.defineProperty(this.attrs,t,{get:()=>i(this.getAttribute(t)),set:a=>this.setAttribute(t,r(a))}),e.default&&!this.getAttribute(t)&&this.setAttribute(t,e.default())})}};var f='<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-frown"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg>';function y(s){return new DOMParser().parseFromString(s,"image/svg+xml").documentElement}var d=class s extends c{static tag="command-bar";static disabledFeatures=["shadow"];static attrs={allowRepeat:{parse:Boolean,default:()=>"true"},emptyMessage:{parse:String,default:()=>"Sorry, couldn\u02BCt find anything."},limitResults:{parse:Number,default:()=>"10"},placeholder:{parse:String,default:()=>"Search..."},hotkey:{parse:JSON.parse,stringify:JSON.stringify,default:()=>'{"key":"k","metaKey":true}'}};static events=["close","input","click"];get template(){return h`
      <dialog class="cb__dialog" data-ref="host" data-on:close="onDialogClose">
        <header class="cb__header">
          <label>
            <span data-hidden data-ref="searchLabel"></span>
            <input
              type="search"
              data-ref="search"
              data-on:input="onSearch"
              required
            />
          </label>
        </header>

        <div class="cb__body" data-with-fallback>
          <ul class="cb__results-list" data-ref="results"></ul>

          <div data-when="empty">
            <p>${f}</p>
            <p data-ref="emptyMessage"></p>
          </div>
        </div>
      </dialog>
    `}static get instance(){let t=document.querySelectorAll(this.tag);if(t[0]instanceof s)return t.length>1&&console.warn("Found multiple CommandBars. Only the first is returned."),t[0];throw new Error("No CommandBar instance found.")}#t=new AbortController;connectedCallback(){super.connectedCallback(),addEventListener("keydown",t=>this.#g(t),{signal:this.#t.signal}),addEventListener("keydown",t=>this.#c(t),{signal:this.#t.signal}),this.updatePlaceholder(),this.updateEmptyMessage()}disconnectedCallback(){this.#t.abort()}attributeChangedCallback(t){switch(t.toLowerCase()){case"placeholder":this.updatePlaceholder();break;case"emptymessage":this.updateEmptyMessage();break}}#c(t){if(!this.#e)return;let e=!0;t.key==="Escape"?this.#m():t.key==="."&&t.metaKey?this.#C():t.key==="ArrowUp"?this.#b():t.key==="ArrowDown"?this.#y():t.key==="Enter"?this.#w():e=!1,e&&t.preventDefault()}#e=!1;#s=[];#a=new Map;#r=null;#i="";#n=0;#o(t){this.#i=t,this.#l(0),this.ref("search").value=t,this.#f()}#l(t){this.#n=t,this.ref("results").querySelectorAll("button").forEach((r,i)=>{i===t?r.classList.add("cb__result--focused"):r.classList.remove("cb__result--focused")})}#h(t=!this.#e){t!==this.#e&&(t?(this.ref("host").showModal(),this.#e=!0):(this.ref("host").close(),this.#l(0),this.#r=null,this.#e=!1,this.#o("")))}updatePlaceholder(){this.ref("searchLabel").textContent=this.attrs.placeholder,this.ref("search").setAttribute("placeholder",this.attrs.placeholder)}updateEmptyMessage(){this.ref("emptyMessage").textContent=this.attrs.emptyMessage}#f(){this.ref("results").innerHTML="",this.#d().forEach((t,e)=>{let r=this.#p(t,{focused:e===this.#n,chordMatch:this.#i===t.chord});this.ref("results").appendChild(r)})}#p(t,e){let r=["cb__result",e.focused&&"cb__result--focused",e.chordMatch&&"cb__result--chord-match"],i=document.createElement("li"),a=document.createElement("button");if(a.classList.add(...r.filter(o=>!!o)),a.addEventListener("click",()=>this.#u(t)),t.icon&&a.append(t.icon),t.groupName){let o=document.createElement("span");o.classList.add("cb__group-name"),o.textContent=t.groupName,a.appendChild(o);let l=document.createElement("span");l.classList.add("cb__group-name"),l.textContent="\u203A",a.appendChild(l)}let n=document.createElement("span");if(n.dataset.clamp="",n.title=t.name,n.textContent=t.name,a.appendChild(n),t.chord){let o=document.createElement("span");o.classList.add("cb__chord"),o.textContent=t.chord,a.appendChild(o)}return i.appendChild(a),i}open(t=""){this.#h(!0),this.#o(t)}onDialogClose(){this.#e=!1}#m(){this.#i?this.#o(""):this.#h(!1)}#g(t){let e=Object.assign({altKey:!1,ctrlKey:!1,metaKey:!1,shiftKey:!1,key:""},this.attrs.hotkey);Object.entries(e).reduce((i,[a,n])=>i&&t[a]===n,!0)&&(this.#h(),t.preventDefault(),t.stopPropagation())}registerCommand(...t){let e=t.map(r=>r.id);return this.removeCommand(...e),this.#s=[...this.#s,...t],t.forEach(r=>{r.chord&&this.#a.set(r.chord,r)}),()=>{this.removeCommand(...e)}}removeCommand(...t){this.#s=this.#s.filter(e=>!t.includes(e.id)),this.#a.forEach((e,r)=>{t.includes(e.id)&&this.#a.delete(r)}),this.#r&&t.includes(this.#r.id)&&(this.#r=null)}onSearch(t){t.target instanceof HTMLInputElement&&this.#o(t.target.value)}#d(){if(!this.#i)return[];let t=this.#a.get(this.#i),e=this.#i.toLowerCase().split(" "),r=this.#s.filter(i=>{if(t&&t.id===i.id)return!1;let a=[i.name,...i.alias??[],i.groupName??""].join(" ").toLowerCase();return e.every(n=>a.includes(n))}).slice(0,this.attrs.limitResults).sort((i,a)=>(a.weight??0)-(i.weight??0));return t&&r.unshift(t),r}#y(){let t=this.#d().length;if(t===0)return;let e=this.#n+1;this.#l(Math.min(t-1,e))}#b(){this.#l(Math.max(this.#n-1,0))}#w(){let t=this.#d().at(this.#n);t&&this.#u(t)}#C(){this.#r&&this.#u(this.#r)}#u(t){t.action(),this.#r=t,this.#h(!1)}};export{d as CommandBar,y as renderSvgFromString};
//# sourceMappingURL=lib.js.map
