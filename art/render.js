// Dipinge le carte nel browser e salva le immagini. Uso: node render.js sheet ID,ID,...  |  node render.js all
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const DIR = __dirname, OUT = path.join(DIR, 'out');
const scripts = ['core.js', 'scenes.js', 'figure.js', 'props.js', 'cards.js', 'avatars.js'].filter(f => fs.existsSync(path.join(DIR, f))).map(f => fs.readFileSync(path.join(DIR, f), 'utf8')).join('\n');
(async () => {
  const mode = process.argv[2] || 'sheet';
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 1 });
  const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.setContent('<html><body style="margin:0;background:#222"><div id="g"></div></body></html>');
  await page.addScriptTag({ content: scripts });
  if (mode === 'sheet') {
    const ids = (process.argv[3] || 'r1,b2,g3,y4').split(',');
    const cols = Math.min(ids.length, +(process.argv[5] || 5)), w = +(process.argv[4] || 300);
    await page.setViewportSize({ width: cols * (w + 6), height: Math.ceil(ids.length / cols) * (w * 1.5 + 6) });
    await page.evaluate(({ ids, w }) => {
      const g = document.getElementById('g'); g.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px';
      ids.forEach(id => { const d = document.createElement('div'); d.style.cssText = `width:${w}px;height:${w * 1.5}px`; try { d.innerHTML = ART.card(id).replace('width="600" height="900"', 'width="100%" height="100%"'); } catch (e) { d.textContent = id + ' ' + e.message; d.style.color = '#fff'; } g.appendChild(d); });
    }, { ids, w });
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(OUT, process.argv[6] || 'sheet.png'), fullPage: true });
  } else if (mode === 'all' || mode === 'some') {
    const ids = mode === 'all' ? await page.evaluate(() => ART.cardIds()) : process.argv[3].split(',');
    const dest = process.argv[mode === 'all' ? 3 : 4] || path.join(OUT, 'cards');
    fs.mkdirSync(dest, { recursive: true });
    await page.setViewportSize({ width: 960, height: 1440 });
    for (const id of ids) {
      await page.evaluate(id => { document.getElementById('g').innerHTML = ART.card(id).replace('width="600" height="900"', 'width="960" height="1440" style="display:block"'); }, id);
      await page.screenshot({ path: path.join(dest, id + '.png'), clip: { x: 0, y: 0, width: 960, height: 1440 } });
    }
  } else if (mode === 'avatars') {
    const dest = process.argv[3] || path.join(OUT, 'avatars');
    fs.mkdirSync(dest, { recursive: true });
    await page.setViewportSize({ width: 512, height: 512 });
    const n = await page.evaluate(() => ART.avatarIds().length);
    const ids = await page.evaluate(() => ART.avatarIds());
    for (const id of ids) {
      await page.evaluate(id => { document.getElementById('g').innerHTML = ART.avatar(id).replace('width="300" height="300"', 'width="512" height="512" style="display:block"'); }, id);
      await page.screenshot({ path: path.join(dest, id + '.png'), clip: { x: 0, y: 0, width: 512, height: 512 } });
    }
  }
  if (mode === 'textures') {
    const dest = process.argv[3] || path.join(OUT, 'ui');
    fs.mkdirSync(dest, { recursive: true });
    await page.setViewportSize({ width: 600, height: 600 });
    for (const t of ['wood', 'paper', 'back', 'icon']) {
      const sz = t === 'back' ? [800, 1200] : t === 'icon' ? [1024, 1024] : [600, 600];
      await page.setViewportSize({ width: sz[0], height: sz[1] });
      await page.evaluate(({ t, sz }) => { document.getElementById('g').innerHTML = ART.texture(t).replace(/width="\d+" height="\d+"/, 'width="' + sz[0] + '" height="' + sz[1] + '" style="display:block"'); }, { t, sz });
      await page.screenshot({ path: path.join(dest, t + '.png'), clip: { x: 0, y: 0, width: sz[0], height: sz[1] } });
    }
  }
  if (errs.length) console.log('ERRORI', errs);
  await browser.close();
})();
