const isWeb = url => /^https?:\/\//.test(url || '');
async function run(tabId, feature, payload) {
  const tab = await browser.tabs.get(tabId);
  if (!isWeb(tab.url)) throw new Error('Open a regular web page first.');
  await browser.scripting.executeScript({target: {tabId}, files: ['page.js']});
  return browser.tabs.sendMessage(tabId, {feature, payload});
}
function download(dataUrl, filename) {
  return browser.downloads.download({url: dataUrl, filename, saveAs: true});
}
async function capture(tabId) {
  const tab = await browser.tabs.get(tabId);
  if (!isWeb(tab.url)) throw new Error('Open a regular web page first.');
  return browser.tabs.captureVisibleTab(tab.windowId, {format: 'png'});
}
async function pdf(tabId) {
  const tab = await browser.tabs.get(tabId);
  if (!isWeb(tab.url)) throw new Error('Open a regular web page first.');
  return browser.tabs.saveAsPDF({});
}
browser.runtime.onMessage.addListener((message, sender) => {
  const tabId = message.tabId ?? sender.tab?.id;
  if (!tabId) return Promise.resolve({ok: false, error: 'No active tab.'});
  return (async () => {
    switch (message.action) {
      case 'run': return run(tabId, message.feature, message.payload);
      case 'capture': {
        const data = await capture(tabId);
        await download(data, 'folio-capture.png');
        return true;
      }
      case 'pdf': return pdf(tabId);
      default: throw new Error('Unknown action.');
    }
  })().then(value => ({ok: true, value}), error => ({ok: false, error: String(error.message || error)}));
});
browser.commands.onCommand.addListener(async command => {
  try {
    const [tab] = await browser.tabs.query({active: true, currentWindow: true});
    if (!tab?.id) return;
    if (command === 'capture-visible') {
      const data = await capture(tab.id);
      await download(data, 'folio-capture.png');
    } else await run(tab.id, command === 'toggle-edit' ? 'edit' : 'dark');
  } catch (error) { console.warn('Folio:', error); }
});
