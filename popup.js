const copy={en:{tagline:'Tools for the current page',page:'Page',edit:'Edit text',dark:'Dark mode',scroll:'Auto scroll',capture:'Capture',visible:'Visible PNG',pdf:'Vector PDF',inspect:'Inspect',picker:'Pick color',palette:'Color palette',media:'Page media',local:'Local by design · No analytics',ready:'Ready',choose:'Click an element, or press Esc to cancel.',restricted:'Open a regular web page first.',copied:'Copied to clipboard'},fr:{tagline:'Outils pour la page actuelle',page:'Page',edit:'Modifier le texte',dark:'Mode sombre',scroll:'Défilement auto',capture:'Capture',visible:'PNG visible',pdf:'PDF vectoriel',inspect:'Inspection',picker:'Pipette',palette:'Palette',media:'Médias de la page',local:'Local par conception · Sans suivi',ready:'Prêt',choose:'Cliquez un élément ou appuyez sur Échap.',restricted:'Ouvrez une page web ordinaire.',copied:'Copié dans le presse-papiers'}};
let language='en'; const result=document.querySelector('#result');
copy.en.mediaCount=n=>`${n} media URLs`;
copy.fr.mediaCount=n=>`${n} URL de médias`;
copy.en.languageLabel='Change language';
copy.fr.languageLabel='Changer de langue';
function render(){document.documentElement.lang=language;document.querySelectorAll('[data-i]').forEach(el=>el.textContent=copy[language][el.dataset.i]);document.querySelector('#tagline').textContent=copy[language].tagline;document.querySelector('#lang').textContent=language==='en'?'FR':'EN';document.querySelector('#lang').setAttribute('aria-label',copy[language].languageLabel);}
function say(value,error=false){result.className=error?'error':'';result.textContent=value;}
async function activeTab(){const [tab]=await chrome.tabs.query({active:true,currentWindow:true});if(!/^https?:\/\//.test(tab?.url||''))throw Error(copy[language].restricted);return tab;}
async function ask(message){const reply=await chrome.runtime.sendMessage(message);if(!reply?.ok)throw Error(reply?.error||'Action failed');if(reply.value?.error)throw Error(reply.value.error);return reply.value;}
document.querySelector('#lang').onclick=async()=>{language=language==='en'?'fr':'en';await chrome.storage.local.set({language});render();};
document.querySelectorAll('[data-feature],[data-action]').forEach(button=>button.onclick=async()=>{
  try{const tab=await activeTab();const feature=button.dataset.feature;let value;
    if(feature){value=await ask({action:'run',tabId:tab.id,feature});}
    else value=await ask({action:button.dataset.action,tabId:tab.id});
    if(feature==='palette'){
      result.replaceChildren(); for(const item of value){const chip=document.createElement('button');chip.className='swatch';const dot=document.createElement('i');dot.style.background=item.color;chip.append(dot,document.createTextNode(item.color));chip.onclick=async()=>{await navigator.clipboard.writeText(item.color);say(copy[language].copied)};result.append(chip)}
    } else if(feature==='media'){
      result.replaceChildren();const count=document.createElement('p');count.textContent=copy[language].mediaCount(value.length);result.append(count);for(const url of value){if(url.startsWith('inline-svg:'))continue;const a=document.createElement('a');a.href=url;a.textContent=url.split('/').pop()?.slice(0,45)||url;a.target='_blank';a.rel='noopener';result.append(a,document.createElement('br'))}
    } else say(['color','zone','element'].includes(feature)?copy[language].choose:copy[language].ready);
  }catch(error){say(error.message,true)}
});
chrome.storage.local.get('language').then(data=>{language=data.language==='fr'?'fr':'en';render()});
