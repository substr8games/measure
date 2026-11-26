/* The Measure / Interactive Media Pipeline Rev01. Browser-native, no dependencies. */
(function installInteractiveMedia(global) {
  'use strict';
  const registry = new Map();
  const mounted = new WeakMap();
  let active = null;
  const make = (tag, cls, text) => { const e = document.createElement(tag); if(cls)e.className=cls; if(text!==undefined)e.textContent=text; return e; };
  const button = (text, action) => { const e=make('button','tm-im-button',text); e.type='button'; e.addEventListener('click',action); return e; };
  const css = `
.tm-im{margin:1.5rem 0;color:inherit;min-width:0;box-sizing:border-box;font:inherit}.article-shell>.tm-im{max-width:var(--article-width);margin-inline:auto}.tm-im [hidden],.tm-im-dialog [hidden]{display:none!important}
.tm-im-button{font:inherit;font-size:.75rem;letter-spacing:.08em;color:inherit;background:transparent;border:1px solid currentColor;padding:.5em .8em;cursor:pointer}.tm-im-button:focus-visible,.tm-im input:focus-visible{outline:3px solid #c6ab78;outline-offset:3px}
.tm-im-bar{display:flex;align-items:center;justify-content:space-between;gap:.6rem;margin:.5rem 0;flex-wrap:wrap;font-size:.75rem}.tm-im-caption{font-size:.85rem;opacity:.82;margin:.5rem 0}.tm-im-error{border:1px solid #b96d52;padding:.7rem;font-size:.9rem}.tm-im-stage{position:relative;isolation:isolate;overflow:hidden;width:100%;background:#18212b;user-select:none;--reveal:50%;aspect-ratio:var(--ratio, 16/9)}
.tm-im-stage img{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;object-fit:contain!important;object-position:center!important;margin:0!important;padding:0!important;border:0!important;max-width:none!important;max-height:none!important;pointer-events:none!important;display:block!important;border-radius:0!important;box-shadow:none!important}
.tm-im-before{clip-path:inset(0 calc(100% - var(--reveal)) 0 0)}.tm-im-after{clip-path:inset(0 0 0 var(--reveal))}.tm-im-stage.is-vertical .tm-im-before{clip-path:inset(0 0 calc(100% - var(--reveal)) 0)}.tm-im-stage.is-vertical .tm-im-after{clip-path:inset(var(--reveal) 0 0 0)}
.tm-im-divider{position:absolute;left:var(--reveal);top:0;bottom:0;width:2px;background:white;transform:translateX(-50%);pointer-events:none;box-shadow:0 0 4px #000}.tm-im-stage.is-vertical .tm-im-divider{top:var(--reveal);left:0;right:0;bottom:auto;height:2px;width:auto;transform:translateY(-50%)}
.tm-im-handle{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);border:2px solid white;color:white;background:#18212be6;border-radius:50%;width:42px;height:42px;display:grid;place-items:center;font:18px sans-serif;box-shadow:0 1px 8px #0008}.tm-im-label{position:absolute;top:8px;background:#101820d9;color:#fff;padding:4px 8px;font:600 11px sans-serif;pointer-events:none}.tm-im-label.before{left:8px}.tm-im-label.after{right:8px}.is-vertical .tm-im-label.after{top:auto;bottom:8px;right:8px}.tm-im-hit{position:absolute;inset:0;z-index:3;touch-action:none;cursor:ew-resize}.is-vertical .tm-im-hit{cursor:ns-resize}.tm-im-range{width:100%;accent-color:#c6ab78;margin:.6rem 0;display:block}.tm-im-stage:not(.is-ready) .tm-im-divider,.tm-im-stage:not(.is-ready) .tm-im-hit,.tm-im-stage:not(.is-ready) .tm-im-label{display:none}
.tm-im-dialog{box-sizing:border-box;width:min(1100px,calc(100% - 24px));max-width:none;max-height:calc(100% - 24px);overflow:auto;background:var(--panel,#202d39);color:var(--fg,#f3f4f1);border:1px solid var(--gold,#c6ab78);padding:16px;margin:auto;z-index:1000}.tm-im-dialog::backdrop{background:rgba(0,0,0,var(--tm-im-dim,.82))}.tm-im-dialog .tm-im{margin:0}.tm-im-dialog .tm-im-stage{max-width:100%;width:min(100%,calc(60dvh * var(--ratio, 1.7778)));margin:auto}.tm-im-dialog .tm-im-bar{margin:0 0 12px}.tm-im-dialog:fullscreen{width:100%;max-height:100%;height:100%;margin:0}.tm-im-print{display:none}
@media print{.tm-im-stage,.tm-im-range,.tm-im-bar,.tm-im-dialog,.tm-im-content>p.tm-im-caption{display:none!important}.tm-im .tm-im-content[hidden]{display:block!important}.tm-im-print{display:flex;gap:12px;break-inside:avoid}.tm-im-print>div{flex:1;min-width:0}.tm-im-print img{max-width:100%;height:auto}.tm-im-caption{color:#000}}
`;
  function style(){if(!document.getElementById('tm-im-style')){const s=make('style');s.id='tm-im-style';s.textContent=css;document.head.append(s);}}
  function relativeResource(input){
    if(typeof input!=='string'||!input.trim()||input!==input.trim()||/[\\\u0000-\u001f?#]/.test(input)||/^(?:[a-z][a-z0-9+.-]*:|\/)/i.test(input))throw Error('Expected a relative media resource');
    let decoded;try{decoded=decodeURIComponent(input);}catch{throw Error('Invalid resource encoding');}
    if(/[\\\u0000-\u001f?#]/.test(decoded)||/^(?:[a-z][a-z0-9+.-]*:|\/)/i.test(decoded)||decoded.split('/').includes('..'))throw Error('Resource escapes publication root');
    return input;
  }
  function register(type, factory, {assetKeys=[],staticAssets=null}={}){if(typeof type!=='string'||!type||typeof factory!=='function'||registry.has(type)||!Array.isArray(assetKeys)||assetKeys.some(key=>typeof key!=='string')||(staticAssets!==null&&typeof staticAssets!=='function'))throw Error('Invalid or duplicate media registration');registry.set(type,{factory,assetKeys:[...assetKeys],staticAssets});}
  function assetKeys(type){return [...(registry.get(type)?.assetKeys||[])];}
  function staticAssets(record){const normalized=normalize(record);return (registry.get(normalized.type)?.staticAssets?.(normalized)||[]).map(item=>({...item,path:relativeResource(item.path)}));}
  function normalize(raw){
    if(!raw||typeof raw!=='object'||Array.isArray(raw))throw Error('Media record must be an object');
    if(!/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(raw.id||''))throw Error('Missing or invalid media ID');
    const placement=raw.placement||'top', presentation=raw.presentation||'inline-expand';
    if(!['top','end'].includes(placement)&&!/^after-heading:[1-9]\d*$/.test(placement))throw Error('Invalid media placement');
    if(!['inline','modal','inline-expand'].includes(presentation))throw Error('Invalid media presentation');
    if(typeof raw.type!=='string'||!raw.type)throw Error('Missing media type');
    for(const key of ['assets','options'])if(raw[key]!==undefined&&(!raw[key]||typeof raw[key]!=='object'||Array.isArray(raw[key])))throw Error('Invalid media '+key);
    return {...raw,placement,presentation,assets:raw.assets||{},options:raw.options||{}};
  }
  function closeModal(){if(active){const session=active;session.dialog.close();session.restore();}}
  function present(host, content, opener, record){
    if(active)return;
    const dialog=make('dialog','tm-im-dialog');dialog.setAttribute('aria-label',record.caption||record.alt||'Expanded interactive media');
    const dim=record.options.modalOpacity;if(typeof dim==='number'&&Number.isFinite(dim))dialog.style.setProperty('--tm-im-dim',String(Math.min(1,Math.max(0,dim))));
    const bar=make('div','tm-im-bar');bar.append(make('span','',record.caption||record.type.toUpperCase()));
    const actions=make('div','tm-im-bar');
    if(typeof dialog.requestFullscreen==='function'&&document.fullscreenEnabled)actions.append(button('FULLSCREEN',()=>{const p=document.fullscreenElement===dialog?document.exitFullscreen():dialog.requestFullscreen();p.catch(e=>console.warn('Media fullscreen:',e));}));
    const close=button('CLOSE ×',closeModal);actions.append(close);bar.append(actions);
    const marker=document.createComment('interactive-media-home');content.before(marker);
    const scrollX=global.scrollX,scrollY=global.scrollY, oldOverflow=document.documentElement.style.overflow;
    dialog.append(bar,content);document.body.append(dialog);
    const session={dialog,host};active=session;
    const restore=()=>{if(active!==session)return;active=null;if(document.fullscreenElement===dialog)document.exitFullscreen().catch(()=>{});content.hidden=record.presentation==='modal';if(marker.isConnected)marker.replaceWith(content);else content.remove();dialog.remove();document.documentElement.style.overflow=oldOverflow;if(opener.isConnected){opener.focus({preventScroll:true});global.scrollTo({left:scrollX,top:scrollY,behavior:'instant'});}};
    session.restore=restore;
    dialog.addEventListener('close',restore,{once:true});dialog.addEventListener('cancel',e=>{e.preventDefault();closeModal();});dialog.addEventListener('click',e=>{if(e.target===dialog){const b=dialog.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)closeModal();}});
    try{dialog.showModal();document.documentElement.style.overflow='hidden';close.focus();}catch(e){restore();throw e;}
  }
  function comparison(record, resolve){
    const opts=record.options, assets=record.assets;
    const before=resolve(relativeResource(assets.before)),after=resolve(relativeResource(assets.after));
    if(!before||!after)throw Error('Both comparison images are required');
    const axis=opts.orientation||'horizontal';if(!['horizontal','vertical'].includes(axis))throw Error('Invalid comparison orientation');
    let ratio=null;if(opts.aspectRatio!==undefined){const r=String(opts.aspectRatio).match(/^(\d+(?:\.\d+)?)(?:\s*[:/]\s*(\d+(?:\.\d+)?))?$/);if(!r||!(Number(r[1])>0)||!(Number(r[2]||1)>0))throw Error('Invalid aspect ratio');ratio=Number(r[1])/Number(r[2]||1);}
    const content=make('div','tm-im-content'), stage=make('div','tm-im-stage'+(axis==='vertical'?' is-vertical':''));
    if(ratio)stage.style.setProperty('--ratio',String(ratio));
    const labelA=String(opts.beforeLabel||'BEFORE'),labelB=String(opts.afterLabel||'AFTER');
    const status=make('p','tm-im-caption','Loading comparison…');status.setAttribute('role','status');
    const a=make('img','tm-im-before'),b=make('img','tm-im-after');a.alt=record.alt?`${record.alt} — ${labelA}`:labelA;b.alt=record.alt?`${record.alt} — ${labelB}`:labelB;
    const divider=make('div','tm-im-divider');divider.append(make('span','tm-im-handle',axis==='vertical'?'↕':'↔'));
    const hit=make('div','tm-im-hit');hit.setAttribute('aria-hidden','true');
    const range=make('input','tm-im-range');range.type='range';range.min='0';range.max='100';range.step='1';range.disabled=true;range.setAttribute('aria-label',`Reveal ${labelA} versus ${labelB}`);
    const set=v=>{const n=Math.min(100,Math.max(0,Number(v)));stage.style.setProperty('--reveal',`${n}%`);range.value=String(n);range.setAttribute('aria-valuetext',`${Math.round(n)}% ${labelA}`);};
    set(typeof opts.initialPosition==='number'&&Number.isFinite(opts.initialPosition)?opts.initialPosition:50);
    range.addEventListener('input',()=>set(range.value));range.addEventListener('keydown',e=>{if(e.key==='Home'||e.key==='End'){e.preventDefault();set(e.key==='Home'?0:100);}});
    let pointer=null;const move=e=>{const r=stage.getBoundingClientRect();set(100*(axis==='vertical'?(e.clientY-r.top)/r.height:(e.clientX-r.left)/r.width));};
    hit.addEventListener('pointerdown',e=>{if(pointer!==null||!e.isPrimary||e.button!==0)return;e.preventDefault();pointer=e.pointerId;hit.setPointerCapture(pointer);move(e);});
    hit.addEventListener('pointermove',e=>{if(pointer===e.pointerId)move(e);});
    for(const event of ['pointerup','pointercancel','lostpointercapture'])hit.addEventListener(event,e=>{if(pointer===e.pointerId){if(event==='pointerup')move(e);pointer=null;}});
    stage.append(b,a,divider,make('span','tm-im-label before',labelA),make('span','tm-im-label after',labelB),hit);content.append(stage,range,status);
    let failed=false;const fail=message=>{if(failed)return;failed=true;stage.classList.remove('is-ready');stage.hidden=true;range.hidden=true;range.disabled=true;status.className='tm-im-error';status.textContent=message;};
    const ready=()=>{if(failed||!a.complete||!b.complete||!a.naturalWidth||!b.naturalWidth)return;const ra=a.naturalWidth/a.naturalHeight,rb=b.naturalWidth/b.naturalHeight;if(Math.abs(ra-rb)>Math.max(ra,rb)*.002){fail('Comparison unavailable: image aspect ratios differ. Supply aligned assets.');return;}if(ratio&&Math.abs(ra-ratio)>ra*.002){fail('Comparison unavailable: declared aspect ratio differs from images.');return;}stage.style.setProperty('--ratio',String(ra));stage.classList.add('is-ready');range.disabled=false;status.textContent='Drag the divider or use the keyboard slider.';};
    for(const img of [a,b]){img.addEventListener('load',ready);img.addEventListener('error',()=>fail('Comparison unavailable: an image could not be loaded.'));}
    a.src=before;b.src=after;ready();
    const print=make('div','tm-im-print');for(const [url,label] of [[before,labelA],[after,labelB]]){const item=make('div');item.append(make('div','',label));const img=make('img');img.alt=label;img.src=url;item.append(img);print.append(item);}content.append(print);
    return content;
  }
  register('image-comparison',comparison,{assetKeys:['before','after'],staticAssets:record=>[
    {path:record.assets.before,label:String(record.options.beforeLabel||'BEFORE'),alt:record.alt||''},
    {path:record.assets.after,label:String(record.options.afterLabel||'AFTER'),alt:record.alt||''}
  ]});
  function mount(article, records, resolve=relativeResource){
    if(!article)return;style();if(mounted.has(article))unmount(article);
    if(!records)return;const hosts=[], ids=new Set(), tails=new Map();mounted.set(article,hosts);
    const list=Array.isArray(records)?records:[null];
    const body=article.querySelector('.article-body');
    const place=(host,key)=>{let anchor=tails.get(key);if(!anchor&&key==='top')anchor=article.querySelector('.article-head,.article-header,.byline');if(!anchor&&key.startsWith('after-heading:'))anchor=body?.querySelectorAll('h2,h3,h4')[Number(key.split(':')[1])-1];if(anchor){anchor.after(host);}else if(key==='end'&&body){body.append(host);}else if(key==='top'){article.prepend(host);}else{throw Error('Media placement target not found');}tails.set(key,host);};
    for(const raw of list){const host=make('figure','tm-im');host.dataset.tmInteractive='true';hosts.push(host);let key='top';try{const record=normalize(raw);key=record.placement;if(ids.has(record.id))throw Error('Duplicate media ID: '+record.id);ids.add(record.id);host.dataset.mediaId=record.id;const entry=registry.get(record.type);if(!entry)throw Error('Unsupported media type: '+record.type);const content=entry.factory(record,resolve);if(!(content instanceof Element))throw Error('Invalid component result');const modalOnly=record.presentation==='modal';const bar=make('div','tm-im-bar');if((record.presentation!=='inline'&&record.options.expandable!==false)||modalOnly){const expand=button(modalOnly?'OPEN MEDIA ↗':'EXPAND ↗',()=>{if(active)return;content.hidden=false;try{present(host,content,expand,record);}catch(e){content.hidden=modalOnly;console.error('Media expansion failed:',e);const status=make('p','tm-im-error','Expanded presentation unavailable: '+e.message);host.append(status);}});bar.append(expand);}if(bar.childElementCount)host.append(bar);content.hidden=modalOnly;host.append(content);if(record.caption)host.append(make('figcaption','tm-im-caption',record.caption));place(host,key);}catch(e){host.replaceChildren(make('p','tm-im-error','Interactive media unavailable: '+e.message));try{place(host,key);}catch{place(host,'top');}}}
  }
  function unmount(article){if(!article)return;if(active&&article.contains(active.host))closeModal();for(const host of mounted.get(article)||[])host.remove();mounted.delete(article);}
  function boot(){const data=document.getElementById('tm-im-records');if(!data)return;const article=document.querySelector('article.entry,article.article-shell');try{mount(article,JSON.parse(data.textContent),data.dataset.preview==='true'?p=>{const map=JSON.parse(document.getElementById('tm-im-asset-map')?.textContent||'{}');return map[p]||p;}:relativeResource);}catch(e){console.error('Interactive media:',e);mount(article,[null]);}}
  global.MeasureInteractiveMedia={register,assetKeys,staticAssets,mount,unmount,closeModal,relativeResource,source:()=>`(${installInteractiveMedia.toString()})(window);`};
  global.addEventListener('beforeprint',closeModal);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})(window);
