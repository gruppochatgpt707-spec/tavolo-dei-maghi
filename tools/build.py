#!/usr/bin/env python3
"""Prepara il sito: elenco dei file per il funzionamento offline e anteprima per Claude."""
import hashlib, json, os, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
WEB = ROOT / 'web'
files, h = [], hashlib.sha256()
for p in sorted(WEB.rglob('*')):
    if p.is_file() and p.name not in ('sw.js',) and not p.name.startswith('.') and '.well-known' not in p.parts:
        rel = p.relative_to(WEB).as_posix()
        if rel == 'privacy.html':
            continue
        files.append(rel); h.update(rel.encode()); h.update(p.read_bytes())
files = ['./'] + files
version = 'tavolo-' + h.hexdigest()[:10]
tpl = (ROOT / 'tools' / 'sw.template.js').read_text()
(WEB / 'sw.js').write_text(tpl.replace('__VERSION__', version).replace('__FILES__', json.dumps(files, indent=0)))
print('sw.js', version, len(files), 'file')
if '--preview' in sys.argv:
    out = ROOT / 'dist' / 'preview'
    out.mkdir(parents=True, exist_ok=True)
    html = (WEB / 'index.html').read_text()
    html = html.replace('<script src="js/config.js"></script>', '<script>window.__PREVIEW__=true;</script>\n<script src="js/config.js"></script>')
    (out / 'index.html').write_text(html)
    print('anteprima pronta in', out)
