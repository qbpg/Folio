import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const calls = [];
let listener;
let tabUrl = 'https://example.com/';
const browser = {
  tabs: {
    get: async id => ({id, url: tabUrl, windowId: 1}),
    query: async () => [{id: 3}],
    sendMessage: async (id, message) => { calls.push(['message', id, message.feature]); return true; },
    captureVisibleTab: async () => { calls.push(['capture']); return 'data:image/png;base64,AA=='; },
    saveAsPDF: async () => { calls.push(['pdf']); return 'saved'; },
  },
  scripting: {executeScript: async ({target, files}) => calls.push(['inject', target.tabId, files[0]])},
  downloads: {download: async ({filename}) => calls.push(['download', filename])},
  runtime: {onMessage: {addListener: callback => { listener = callback; }}},
  commands: {onCommand: {addListener: () => {}}},
};
const source = await readFile(new URL('../firefox/background.js', import.meta.url), 'utf8');
vm.runInNewContext(source, {browser, console, Error});
assert.equal((await listener({action: 'run', tabId: 3, feature: 'edit'}, {})).ok, true);
assert.deepEqual(calls.slice(0, 2), [['inject', 3, 'page.js'], ['message', 3, 'edit']]);
assert.equal((await listener({action: 'capture', tabId: 3}, {})).ok, true);
assert.deepEqual(calls.slice(2, 4), [['capture'], ['download', 'folio-capture.png']]);
const pdfResult = await listener({action: 'pdf', tabId: 3}, {});
assert.equal(pdfResult.ok, true);
assert.equal(pdfResult.value, 'saved');
tabUrl = 'about:config';
assert.equal((await listener({action: 'run', tabId: 3, feature: 'dark'}, {})).ok, false);
console.log('Firefox background actions: OK');
