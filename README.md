# Folio

![Bannière Folio](assets/folio-banner.png)

Folio est une extension locale pour Chrome et Chromium qui permet de modifier temporairement une page, d’inspecter ses couleurs et médias, et de faire des captures. L’interface est disponible en français et en anglais.

Le logo, la bannière et les icônes proviennent de la [planche visuelle d’origine](assets/folio-brand-sheet.png), sans redessiner son symbole.

Les fichiers visuels séparés (logos clair et sombre, symbole, icône et bannières) se trouvent dans [branding](branding/README.md). / Separate visual assets are available in [branding](branding/README.md).

<p align="center">
  <img src="https://img.shields.io/badge/Manifest-V3-355e52?style=flat-square" alt="Manifest V3">
  <img src="https://img.shields.io/badge/Chrome%20%2F%20Firefox-extension-355e52?style=flat-square" alt="Chrome and Firefox extension">
  <img src="https://img.shields.io/badge/License-MIT-355e52?style=flat-square" alt="MIT license">
  <a href="https://qbpg.space/"><img src="https://img.shields.io/badge/Portfolio-qbpg.space-24312d?style=flat-square" alt="Visit qbpg's portfolio"></a>
</p>

Folio is an original, privacy minded Chrome/Chromium page toolkit. It helps with quick copy mockups, inspection and capture without an account or remote service. Its design and source are independent of EditAll.

## Features

- Edit visible page text temporarily (reload to revert).
- Toggle a page wide dark treatment and automatic scrolling.
- Save a visible area PNG or a vector PDF through Chrome's print engine.
- Inspect an element's computed text color and copy it.
- Scan commonly used CSS colors and browse page media URLs.
- English and French popup, with the choice stored locally.
- Keyboard shortcuts: `Alt+Shift+E` edit, `Alt+Shift+D` dark mode, `Alt+Shift+S` visible capture. Customize at `chrome://extensions/shortcuts`.

## Install locally

1. Download or clone this repository.
2. Open `chrome://extensions` in Chrome or Chromium and enable **Developer mode**.
3. Select **Load unpacked** and choose the `folio` folder.
4. Open a normal `http` or `https` page and click the Folio icon.

## Installation en français

1. Téléchargez ou clonez ce dépôt.
2. Ouvrez `chrome://extensions` dans Chrome ou Chromium et activez le **mode développeur**.
3. Cliquez sur **Charger l’extension non empaquetée** et sélectionnez le dossier du projet.
4. Ouvrez une page `http` ou `https`, puis cliquez sur l’icône Folio. Le bouton de langue dans la fenêtre de l’extension permet de choisir le français ou l’anglais.

## Firefox / LibreWolf

The Firefox 142+ package is built from the same interface and page tools, with a Firefox background script and native **Save as PDF** dialog. Run `python tools/build_firefox.py` to create `dist/folio-firefox-1.0.0.zip` for Mozilla Add-ons. Firefox requires a signed add-on for permanent installation; during development, load the ZIP temporarily through `about:debugging` → **This Firefox** → **Load Temporary Add-on**. LibreWolf can use Firefox-compatible add-ons. LibreOffice is a separate office suite and cannot install a browser extension.

La version Firefox utilise les mêmes outils et ouvre la boîte de dialogue PDF native. Exécutez `python tools/build_firefox.py` pour créer l’archive destinée à Mozilla Add-ons. Pour un essai temporaire, ouvrez `about:debugging` → **Ce Firefox** → **Charger un module complémentaire temporaire**.

## Permissions

`activeTab` grants temporary access to the tab you invoke Folio on. `scripting` injects the local page tools after a click. `storage` remembers language locally. `downloads` saves captures and PDFs. `debugger` is used only when you explicitly request a vector PDF; Chrome displays a temporary debugging notice. No blanket site access is requested.

## Privacy

No analytics, telemetry, accounts, remote scripts or servers. Folio does not transmit page data. Page modifications are temporary and disappear on reload. Media links displayed by the popup may refer to remote resources; opening them follows the website's own URL.

## Limits

Chrome internal pages and browser stores cannot be modified. The visible PNG covers the current viewport. PDF pagination follows the page's print CSS. Dark mode uses color inversion and may not suit every site. The media panel lists resources rather than downloading a ZIP. The color picker reports the clicked element's computed text color rather than sampling a rendered pixel. Editing complex apps can be overwritten by their own JavaScript.

## License

MIT. See [LICENSE](LICENSE).
