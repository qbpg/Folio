"""Build the Firefox AMO package from the shared Folio extension sources."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import json

root = Path(__file__).resolve().parents[1]
manifest = json.loads((root / 'firefox' / 'manifest.json').read_text(encoding='utf-8'))
version = manifest['version']
output = root / 'dist' / f'folio-firefox-{version}.zip'
output.parent.mkdir(exist_ok=True)
shared = ['popup.html', 'popup.css', 'popup-brand.css', 'popup.js', 'page.js', 'LICENSE']
shared += [str(p.relative_to(root)).replace('\\', '/') for folder in ('icons', '_locales') for p in (root / folder).rglob('*') if p.is_file()]
with ZipFile(output, 'w', ZIP_DEFLATED) as archive:
    archive.write(root / 'firefox' / 'manifest.json', 'manifest.json')
    archive.write(root / 'firefox' / 'background.js', 'background.js')
    for name in shared:
        archive.write(root / name, name)
print(output)
