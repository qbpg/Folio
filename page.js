(() => {
  if (window.__folioReady) return;
  window.__folioReady = true;
  const state={editing:false,dark:false,scroll:null,select:null};
  const style=document.createElement('style');
  style.id='folio-style';
  style.textContent=`html.folio-dark{filter:invert(1) hue-rotate(180deg)!important;background:#111!important} html.folio-dark img,html.folio-dark video,html.folio-dark canvas,html.folio-dark svg{filter:invert(1) hue-rotate(180deg)!important} html.folio-edit [contenteditable="true"]{outline:1px dashed #4b7469;outline-offset:2px} .folio-hover{outline:2px solid #4b7469!important;cursor:crosshair!important} .folio-overlay{position:fixed!important;inset:0!important;z-index:2147483647!important;cursor:crosshair!important;background:transparent!important} .folio-box{position:fixed!important;border:2px solid #4b7469!important;background:#4b746933!important;pointer-events:none!important;z-index:2147483647!important}`;
  document.documentElement.append(style);
  function editable(on) {
    state.editing=on;
    document.documentElement.classList.toggle('folio-edit',on);
    document.body.contentEditable=on?'true':'false';
    return on;
  }
  function picker(kind) {
    if (state.select) state.select();
    const overlay=document.createElement('div'); overlay.className='folio-overlay';
    const box=document.createElement('div'); box.className='folio-box';
    document.documentElement.append(overlay,box);
    let start=null;
    const cleanup=()=>{overlay.remove();box.remove();document.removeEventListener('keydown',key);state.select=null};
    state.select=cleanup;
    const key=e=>{if(e.key==='Escape')cleanup()}; document.addEventListener('keydown',key);
    overlay.addEventListener('mousemove',e=>{
      if(kind==='element'||kind==='color') {
        document.querySelectorAll('.folio-hover').forEach(n=>n.classList.remove('folio-hover'));
        overlay.style.pointerEvents='none'; const target=document.elementFromPoint(e.clientX,e.clientY); overlay.style.pointerEvents='auto';
        target?.classList.add('folio-hover');
      } else if(start) {
        const x=Math.min(start.x,e.clientX),y=Math.min(start.y,e.clientY);
        Object.assign(box.style,{left:x+'px',top:y+'px',width:Math.abs(e.clientX-start.x)+'px',height:Math.abs(e.clientY-start.y)+'px'});
      }
    });
    overlay.addEventListener('mousedown',e=>{start={x:e.clientX,y:e.clientY};});
    overlay.addEventListener('mouseup',async e=>{
      overlay.style.pointerEvents='none'; const target=document.elementFromPoint(e.clientX,e.clientY); overlay.style.pointerEvents='auto';
      document.querySelectorAll('.folio-hover').forEach(n=>n.classList.remove('folio-hover'));
      let value;
      if(kind==='color') value=getComputedStyle(target||document.body).color;
      else if(kind==='element') { const r=target?.getBoundingClientRect(); value=r&&{x:r.x,y:r.y,width:r.width,height:r.height,scale:devicePixelRatio}; }
      else value={x:Math.min(start.x,e.clientX),y:Math.min(start.y,e.clientY),width:Math.abs(e.clientX-start.x),height:Math.abs(e.clientY-start.y),scale:devicePixelRatio};
      cleanup();
      if(kind==='color'&&value) navigator.clipboard?.writeText(value).catch(()=>{});
      chrome.runtime.sendMessage({type:'selection',kind,value});
    });
    return true;
  }
  chrome.runtime.onMessage.addListener((message,_sender,respond)=>{
    const {feature,payload}=message;
    try {
      let result;
      if(feature==='edit') result=editable(!state.editing);
      else if(feature==='dark') {state.dark=!state.dark;document.documentElement.classList.toggle('folio-dark',state.dark);result=state.dark;}
      else if(feature==='scroll') {if(state.scroll){clearInterval(state.scroll);state.scroll=null;result=false;} else {state.scroll=setInterval(()=>scrollBy(0,Number(payload)||2),16);result=true;}}
      else if(feature==='palette') {
        const count=new Map(); const elements=[...document.querySelectorAll('*')].slice(0,2500);
        for(const el of elements){const s=getComputedStyle(el);for(const c of [s.color,s.backgroundColor,s.borderTopColor]) if(c&&!/rgba?\(0, 0, 0, 0\)|transparent/.test(c))count.set(c,(count.get(c)||0)+1);}
        result=[...count].sort((a,b)=>b[1]-a[1]).slice(0,24).map(([color,uses])=>({color,uses}));
      }
      else if(feature==='media') {
        const urls=new Set(); const add=u=>{try{const v=new URL(u,location.href);if(/^https?:$/.test(v.protocol))urls.add(v.href)}catch{}};
        document.querySelectorAll('img,video,audio,source').forEach(el=>{if(el.currentSrc)add(el.currentSrc);if(el.src)add(el.src);if(el.srcset)el.srcset.split(',').forEach(x=>add(x.trim().split(/\s+/)[0]));});
        document.querySelectorAll('svg').forEach((_,i)=>urls.add('inline-svg:'+i));
        result=[...urls].slice(0,300);
      }
      else if(['color','zone','element'].includes(feature)) result=picker(feature);
      else throw Error('Unknown feature.');
      respond(result);
    } catch(error) {respond({error:String(error.message||error)})}
  });
})();
