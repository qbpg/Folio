# Folio

<p align="center">
  <img src="https://img.shields.io/badge/Manifest-V3-355e52?style=flat-square" alt="Manifest V3">
  <img src="https://img.shields.io/badge/Chrome%20%2F%20Chromium-extension-355e52?style=flat-square" alt="Chrome and Chromium extension">
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

## Permissions

`activeTab` grants temporary access to the tab you invoke Folio on. `scripting` injects the local page tools after a click. `storage` remembers language locally. `downloads` saves captures and PDFs. `debugger` is used only when you explicitly request a vector PDF; Chrome displays a temporary debugging notice. No blanket site access is requested.

## Privacy

No analytics, telemetry, accounts, remote scripts or servers. Folio does not transmit page data. Page modifications are temporary and disappear on reload. Media links displayed by the popup may refer to remote resources; opening them follows the website's own URL.

## Limits

Chrome internal pages and browser stores cannot be modified. The visible PNG covers the current viewport. PDF pagination follows the page's print CSS. Dark mode uses color inversion and may not suit every site. The media panel lists resources rather than downloading a ZIP. The color picker reports the clicked element's computed text color rather than sampling a rendered pixel. Editing complex apps can be overwritten by their own JavaScript.

## License

MIT. See [LICENSE](LICENSE).
