#!/usr/bin/env python3
"""Sistema il progetto iPhone generato da Capacitor: permesso del microfono, nome, icona e schermata d'avvio."""
import sys, glob, json, plistlib
from pathlib import Path
from PIL import Image

app = Path(sys.argv[1]) / 'ios' / 'App' / 'App'
icon = Image.open(sys.argv[2]).convert('RGBA')

info = app / 'Info.plist'
with open(info, 'rb') as f:
    p = plistlib.load(f)
p['NSMicrophoneUsageDescription'] = 'Il microfono serve solo per la chat vocale con gli altri giocatori.'
p['CFBundleDisplayName'] = 'Tavolo Maghi'
p['UIRequiresFullScreen'] = True
p['UIStatusBarStyle'] = 'UIStatusBarStyleLightContent'
p['UIViewControllerBasedStatusBarAppearance'] = False
p['ITSAppUsesNonExemptEncryption'] = False
p['CFBundleDevelopmentRegion'] = 'it'
with open(info, 'wb') as f:
    plistlib.dump(p, f)

# Icona: Xcode accetta una sola immagine da 1024 px, senza trasparenza
ico_dir = app / 'Assets.xcassets' / 'AppIcon.appiconset'
flat = Image.new('RGB', icon.size, (11, 14, 26)); flat.paste(icon, (0, 0), icon)
flat = flat.resize((1024, 1024), Image.LANCZOS)
for old in ico_dir.glob('*.png'):
    old.unlink()
flat.save(ico_dir / 'AppIcon-1024.png')
(ico_dir / 'Contents.json').write_text(json.dumps({
    'images': [{ 'filename': 'AppIcon-1024.png', 'idiom': 'universal', 'platform': 'ios', 'size': '1024x1024' }],
    'info': { 'author': 'xcode', 'version': 1 }
}, indent=2))

# Schermata d'avvio: notte scura con l'icona al centro
for f in glob.glob(str(app / 'Assets.xcassets' / 'Splash.imageset' / '*.png')):
    w, h = Image.open(f).size
    sp = Image.new('RGB', (w, h), (11, 14, 26))
    side = int(min(w, h) * 0.22)
    ic = icon.resize((side, side), Image.LANCZOS)
    sp.paste(ic, ((w - side) // 2, (h - side) // 2), ic)
    sp.save(f)
print('progetto iPhone sistemato')
