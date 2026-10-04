const isWeb = url => /^https?:\/\//.test(url || '');
async function run(tabId, feature, payload) {
  const tab = await chrome.tabs.get(tabId);
  if (!isWeb(tab.url)) throw new Error('Open a regular web page first.');
  await chrome.scripting.executeScript({target:{tabId},files:['page.js']});
  return chrome.tabs.sendMessage(tabId,{feature,payload});
}
function download(dataUrl, filename) { return chrome.downloads.download({url:dataUrl,filename,saveAs:true}); }
async function capture(tabId) {
  const tab=await chrome.tabs.get(tabId);
  if (!isWeb(tab.url)) throw new Error('Open a regular web page first.');
  return chrome.tabs.captureVisibleTab(tab.windowId,{format:'png'});
}
async function pdf(tabId) {
  const target={tabId};
  await chrome.debugger.attach(target,'1.3');
  try {
    const result=await chrome.debugger.sendCommand(target,'Page.printToPDF',{printBackground:true,preferCSSPageSize:true});
    return download('data:application/pdf;base64,'+result.data,'folio-page.pdf');
  } finally { await chrome.debugger.detach(target); }
}
chrome.runtime.onMessage.addListener((message,sender,sendResponse)=>{
  (async()=>{
    const tabId=message.tabId ?? sender.tab?.id;
    if (!tabId) throw new Error('No active tab.');
    switch(message.action) {
      case 'run': return run(tabId,message.feature,message.payload);
      case 'capture': {
        const data=await capture(tabId); await download(data,'folio-capture.png'); return true;
      }
      case 'pdf': return pdf(tabId);
      default: throw new Error('Unknown action.');
    }
  })().then(value=>sendResponse({ok:true,value}),error=>sendResponse({ok:false,error:String(error.message||error)}));
  return true;
});
chrome.commands.onCommand.addListener(async command=>{
  try {
    const [tab]=await chrome.tabs.query({active:true,currentWindow:true});
    if (!tab?.id) return;
    if (command==='capture-visible') { const data=await capture(tab.id); await download(data,'folio-capture.png'); }
    else await run(tab.id,command==='toggle-edit'?'edit':'dark');
  } catch(error) { console.warn('Folio:',error); }
});
