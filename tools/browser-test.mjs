const endpoint='http://127.0.0.1:9224';
const targets=await (await fetch(endpoint+'/json')).json();
const worker=targets.find(t=>t.type==='page'&&t.url.endsWith('/popup.html'));
const page=targets.find(t=>t.type==='page'&&t.url.includes('test-page.html'));
if(!worker||!page) throw Error('Folio extension or test page did not load');
function connect(target){
  const socket=new WebSocket(target.webSocketDebuggerUrl);let next=0;const pending=new Map();
  const ready=new Promise((ok,bad)=>{socket.onopen=ok;socket.onerror=bad});
  socket.onmessage=event=>{const data=JSON.parse(event.data);if(data.id&&pending.has(data.id)){pending.get(data.id)(data);pending.delete(data.id)}};
  return {ready,async evaluate(expression){await ready;const id=++next;const result=new Promise(resolve=>pending.set(id,resolve));socket.send(JSON.stringify({id,method:'Runtime.evaluate',params:{expression,awaitPromise:true,returnByValue:true}}));const answer=await result;if(answer.error||answer.result?.exceptionDetails)throw Error(JSON.stringify(answer));return answer.result.result.value},close(){socket.close()}};
}
const bg=connect(worker),tab=connect(page);
const script=await (await import('node:fs/promises')).readFile(new URL('../page.js',import.meta.url),'utf8');
try{
  console.log('Extension:',worker.url);
  const ui=await bg.evaluate(`({name:document.title,buttons:document.querySelectorAll('button').length,errors:document.querySelector('#result').textContent})`);
  console.log('Popup:',ui);
  await tab.evaluate(`window.chrome={runtime:{onMessage:{addListener:fn=>window.__folioMessage=fn},sendMessage:()=>{}}};${script}`);
  for(const feature of ['edit','dark','palette','media','scroll','scroll']){
    const value=await tab.evaluate(`new Promise(resolve=>window.__folioMessage({feature:${JSON.stringify(feature)}},null,resolve))`);
    if(value?.error)throw Error(feature+': '+value.error);
    console.log(feature,JSON.stringify(value).slice(0,180));
  }
  const state=await tab.evaluate(`({editable:document.body.isContentEditable,dark:document.documentElement.classList.contains('folio-dark'),title:document.title})`);
  console.log('Page state:',state);
  if(!state.editable||!state.dark)throw Error('Page actions did not apply');
}finally{bg.close();tab.close()}
