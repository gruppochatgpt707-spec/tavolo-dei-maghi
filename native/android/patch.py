#!/usr/bin/env python3
"""Sistema il progetto Android generato da Capacitor: permessi, icone, schermata d'avvio, versione e firma."""
import os, re, sys, glob
from pathlib import Path
from PIL import Image

app = Path(sys.argv[1])            # cartella del progetto Capacitor (contiene android/)
icon = Image.open(sys.argv[2]).convert('RGBA')   # icona 1024 px
android = app / 'android' / 'app' / 'src' / 'main'
BG = (43, 74, 143, 255)

# Permessi: microfono per la chat vocale
man = android / 'AndroidManifest.xml'
m = man.read_text()
for perm in ['android.permission.RECORD_AUDIO', 'android.permission.MODIFY_AUDIO_SETTINGS', 'android.permission.INTERNET']:
    if perm not in m:
        m = m.replace('</manifest>', f'    <uses-permission android:name="{perm}" />\n</manifest>')
m = re.sub(r'android:configChanges="([^"]*)"', lambda x: 'android:configChanges="' + (x.group(1) if 'density' in x.group(1) else x.group(1) + '|density') + '"', m)
man.write_text(m)

# Icone dell'app (normale, tonda e adattiva)
sizes = {'mdpi': 48, 'hdpi': 72, 'xhdpi': 96, 'xxhdpi': 144, 'xxxhdpi': 192}
for d, s in sizes.items():
    folder = android / 'res' / f'mipmap-{d}'
    folder.mkdir(parents=True, exist_ok=True)
    sq = icon.resize((s, s), Image.LANCZOS)
    sq.save(folder / 'ic_launcher.png')
    mask = Image.new('L', (s, s), 0)
    from PIL import ImageDraw
    ImageDraw.Draw(mask).ellipse((0, 0, s - 1, s - 1), fill=255)
    rnd = Image.new('RGBA', (s, s), (0, 0, 0, 0)); rnd.paste(sq, (0, 0), mask)
    rnd.save(folder / 'ic_launcher_round.png')
    fg = int(s * 108 / 48)
    canvas = Image.new('RGBA', (fg, fg), BG)
    inner = icon.resize((int(fg * 0.72), int(fg * 0.72)), Image.LANCZOS)
    canvas.paste(inner, ((fg - inner.width) // 2, (fg - inner.height) // 2), inner)
    canvas.save(folder / 'ic_launcher_foreground.png')
bgxml = android / 'res' / 'values' / 'ic_launcher_background.xml'
bgxml.parent.mkdir(parents=True, exist_ok=True)
bgxml.write_text('<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#2B4A8F</color>\n</resources>\n')

# Schermata d'avvio: legno scuro con l'icona al centro, al posto del logo standard
for f in glob.glob(str(android / 'res' / 'drawable*' / 'splash.png')):
    im = Image.open(f); w, h = im.size
    sp = Image.new('RGBA', (w, h), (11, 14, 26, 255))
    side = int(min(w, h) * 0.32)
    ic = icon.resize((side, side), Image.LANCZOS)
    sp.paste(ic, ((w - side) // 2, (h - side) // 2), ic)
    sp.convert('RGB').save(f)

# Versione e firma
gradle = app / 'android' / 'app' / 'build.gradle'
g = gradle.read_text()
code = os.environ.get('VERSION_CODE', '1'); name = os.environ.get('VERSION_NAME', '1.0.0')
g = re.sub(r'versionCode\s*=?\s*\d+', f'versionCode = {code}', g)
g = re.sub(r'versionName\s*=?\s*"[^"]*"', f'versionName = "{name}"', g)
if 'signingConfigs' not in g:
    g = g.replace('    buildTypes {', '''    signingConfigs {
        release {
            storeFile = file(System.getenv("KEYSTORE_FILE"))
            storePassword = System.getenv("KEYSTORE_PASSWORD")
            keyAlias = System.getenv("KEY_ALIAS")
            keyPassword = System.getenv("KEY_PASSWORD")
        }
    }
    buildTypes {''', 1)
    g = re.sub(r'(release\s*\{\s*\n\s*minifyEnabled)', r'release {\n            signingConfig = signingConfigs.release\n            minifyEnabled', g, count=1)
gradle.write_text(g)
print('progetto Android sistemato: versione', name, '(' + code + ')')
