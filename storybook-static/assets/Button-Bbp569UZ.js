import{E as u,d as l}from"./iframe-I1iEau3p.js";const c={ATTRIBUTE:1},d=o=>(...t)=>({_$litDirective$:o,values:t});let a=class{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,s){this._$Ct=t,this._$AM=e,this._$Ci=s}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}};const i="important",b=" !"+i,h=d(class extends a{constructor(o){if(super(o),o.type!==c.ATTRIBUTE||o.name!=="style"||o.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(o){return Object.keys(o).reduce((t,e)=>{const s=o[e];return s==null?t:t+`${e=e.includes("-")?e:e.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${s};`},"")}update(o,[t]){const{style:e}=o.element;if(this.ft===void 0)return this.ft=new Set(Object.keys(t)),this.render(t);for(const s of this.ft)t[s]==null&&(this.ft.delete(s),s.includes("-")?e.removeProperty(s):e[s]=null);for(const s in t){const n=t[s];if(n!=null){this.ft.add(s);const r=typeof n=="string"&&n.endsWith(b);s.includes("-")||r?e.setProperty(s,r?n.slice(0,-11):n,r?i:""):e[s]=n}}return u}}),$=({primary:o,backgroundColor:t,size:e,label:s,onClick:n})=>{const r=o?"storybook-button--primary":"storybook-button--subtle";return l`
    <button
      type="button"
      class=${["storybook-button",`storybook-button--${e||"medium"}`,r].join(" ")}
      style=${h({backgroundColor:t})}
      @click=${n}
    >
      ${s}
    </button>
  `};export{$ as B};
