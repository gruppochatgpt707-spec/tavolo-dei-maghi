// iPhone e Android insieme: quando la strada diretta non si apre, la partita passa dal collegamento di riserva.
const assert = require('assert');
const { startServer, launch, newPlayer } = require('./harness');
const PORT = 8127, BASE = `http://localhost:${PORT}/`;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const log = (...a) => console.log('•', ...a);
async function until(fn, ms = 15000, label = 'condizione') {
  const t = Date.now();
  while (Date.now() - t < ms) { const r = await fn(); if (r) return r; await sleep(100); }
  throw new Error('Timeout: ' + label);
}
async function create(page, name) {
  await page.fill('#nameInput', name); await page.click('#createBtn');
  await page.waitForSelector('#lobby:not([hidden])');
  return page.$$eval('#codeCells span', s => s.map(x => x.textContent).join(''));
}
async function join(page, name, code) {
  await page.fill('#nameInput', name); await page.fill('#codeInput', code); await page.click('#joinBtn');
  await page.waitForSelector('#lobby:not([hidden])', { timeout: 25000 });
}
/* foto profilo grande: il messaggio supera i 16 KB che la libreria accetta in un pezzo solo */
async function bigPhoto(page) {
  await page.evaluate(() => {
    const c = document.createElement('canvas'); c.width = c.height = 160; const x = c.getContext('2d');
    for (let i = 0; i < 4000; i++) { x.fillStyle = `hsl(${Math.random() * 360},70%,50%)`; x.fillRect(Math.random() * 160, Math.random() * 160, 3, 3); }
    const url = c.toDataURL('image/jpeg', 0.95);
    const p = JSON.parse(localStorage.getItem('tavolo_profile') || '{}'); p.av = url; localStorage.setItem('tavolo_profile', JSON.stringify(p));
    window.__photoLen = url.length;
  });
  await page.reload();
  return page.evaluate(() => JSON.parse(localStorage.getItem('tavolo_profile')).av.length);
}
const via = p => p.evaluate(() => window.__S.link && window.__S.link.via);

(async () => {
  const srv = await startServer(PORT), browser = await launch();
  let failed = false;
  try {
    /* Android crea, iPhone (senza strada diretta) entra; poi un secondo Android */
    const android = await newPlayer(browser, BASE, { viewport: { width: 412, height: 860 } });
    const iphone = await newPlayer(browser, BASE, { viewport: { width: 390, height: 844 }, noDirect: true });
    const android2 = await newPlayer(browser, BASE, { viewport: { width: 412, height: 860 } });
    const len = await bigPhoto(iphone); log('foto profilo dell\'iPhone:', Math.round(len / 1024), 'KB');
    const code = await create(android, 'Anna');
    const t0 = Date.now();
    await join(iphone, 'Ines', code);
    log('l\'iPhone entra con il codice in', ((Date.now() - t0) / 1000).toFixed(1), 's, strada:', await via(iphone));
    assert.strictEqual(await via(iphone), 'relay');
    await join(android2, 'Bruno', code);
    assert.strictEqual(await via(android2), 'direct'); log('il secondo Android usa la strada diretta');
    await until(() => android.evaluate(() => document.querySelectorAll('#pList img').length === 3), 8000, '3 in sala');
    const photoOk = await until(() => android2.evaluate(() => [...document.querySelectorAll('#pList img')].some(i => i.src.startsWith('data:image/jpeg'))), 8000, 'foto arrivata');
    log('la foto grande dell\'iPhone arriva agli altri (messaggio spezzato e ricomposto)');
    await android.click('#startBtn');
    for (const p of [android, iphone, android2]) await p.waitForSelector('#game:not([hidden])', { timeout: 15000 });
    /* giochiamo due mani lasciando fare al tempo scaduto: basta che la partita avanzi per tutti */
    await android.evaluate(() => { window.__S.core.opts.bidSeconds = 1; window.__S.core.opts.playSeconds = 1; });
    let last = '';
    await until(async () => { const st = await Promise.all([android, iphone, android2].map(p => p.evaluate(() => window.__S.view ? window.__S.view.round + ':' + window.__S.view.phase + ':' + window.__S.view.turn : '-'))); const k = st.join(' '); last = k; return st.every(r => parseInt(r) >= 3); }, 240000, 'terza mano per tutti');
    log('la partita avanza per tutti fino alla terza mano');

    /* l'iPhone crea, l'Android entra */
    const ip2 = await newPlayer(browser, BASE, { viewport: { width: 390, height: 844 }, noDirect: true });
    const an3 = await newPlayer(browser, BASE, { viewport: { width: 412, height: 860 } });
    const code2 = await create(ip2, 'Iris');
    await join(an3, 'Carlo', code2);
    log('l\'iPhone crea e l\'Android entra, strada:', await via(an3));
    assert.strictEqual(await via(an3), 'relay');

    /* codice sbagliato: errore chiaro e veloce anche dall'iPhone */
    const ip3 = await newPlayer(browser, BASE, { viewport: { width: 390, height: 844 }, noDirect: true });
    await ip3.fill('#nameInput', 'Ugo'); await ip3.fill('#codeInput', 'ZZZZZ'); await ip3.click('#joinBtn');
    await until(async () => (await ip3.textContent('#homeMsg')).length > 5, 8000, 'messaggio codice sbagliato');
    log('codice inesistente:', await ip3.textContent('#homeMsg'));

    /* ricerca globale con un iPhone */
    const s1 = await newPlayer(browser, BASE, { viewport: { width: 412, height: 860 } });
    const s2 = await newPlayer(browser, BASE, { viewport: { width: 390, height: 844 }, noDirect: true });
    for (const [p, n] of [[s1, 'Sara'], [s2, 'Ivo']]) { await p.fill('#nameInput', n); await p.click('#searchBtn'); await p.click('#searchGo').catch(() => {}); await sleep(600); }
    await until(async () => !(await s2.isDisabled('#searchNow')), 15000, 'iPhone trovato nella ricerca');
    await s2.click('#searchNow');
    await until(async () => (await Promise.all([s1, s2].map(p => p.isVisible('#game')))).every(Boolean), 40000, 'partita dalla ricerca con l\'iPhone');
    log('ricerca globale: Android e iPhone allo stesso tavolo');

    const errs = [android, iphone, android2, ip2, an3, ip3, s1, s2].flatMap(p => p.errors || []);
    assert.deepStrictEqual(errs, [], errs.join(' | ')); log('nessun errore JavaScript');
  } catch (e) { failed = true; console.error('ERRORE', e); }
  await browser.close(); srv.close();
  process.exit(failed ? 1 : 0);
})();
