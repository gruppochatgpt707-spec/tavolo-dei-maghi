// Ricerca globale: chi cerca nello stesso momento finisce allo stesso tavolo.
const assert = require('assert');
const { startServer, launch, newPlayer } = require('./harness');
const PORT = 8126, BASE = `http://localhost:${PORT}/`;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const log = (...a) => console.log('•', ...a);
async function until(fn, ms = 15000, label = 'condizione') {
  const t = Date.now();
  while (Date.now() - t < ms) { const r = await fn(); if (r) return r; await sleep(100); }
  throw new Error('Timeout: ' + label);
}
async function search(page, name) { await page.fill('#nameInput', name); await page.click('#searchBtn'); await page.waitForSelector('#ovSearch:not([hidden])'); }
const where = p => p.evaluate(() => ({ lobby: !document.querySelector('#lobby').hidden, game: !document.querySelector('#game').hidden, code: window.__S.code, names: window.__S.view ? window.__S.view.players.map(x => x.name + (x.bot ? '*' : '')) : null, msg: document.querySelector('#homeMsg').textContent }));

(async () => {
  const srv = await startServer(PORT), browser = await launch();
  let failed = false;
  try {
    /* 4 giocatori cercano a pochi secondi di distanza */
    const names = ['Anna', 'Bruno', 'Carla', 'Dario'], ps = [];
    for (const n of names) { const p = await newPlayer(browser, BASE, { viewport: { width: 412, height: 860 } }); ps.push(p); await search(p, n); await sleep(700); }
    await until(async () => (await ps[0].textContent('#searchText')).includes('4 giocatori'), 8000, 'tutti e 4 nella ricerca');
    log('4 giocatori nella stessa ricerca:', await ps[0].textContent('#searchText'));
    await until(async () => (await Promise.all(ps.map(where))).every(w => w.game), 45000, 'partita iniziata per tutti');
    const ws = await Promise.all(ps.map(where));
    assert(ws.every(w => w.code === ws[0].code), 'stesso codice per tutti');
    assert.strictEqual(ws[0].names.length, 4); assert(!ws[0].names.some(n => n.endsWith('*')), 'nessun bot');
    log('partita partita da sola con lo stesso codice', ws[0].code, ws[0].names.join(', '));

    /* 2 giocatori: "Inizia subito" e un bot completa il tavolo */
    const q = [];
    for (const n of ['Elena', 'Fabio']) { const p = await newPlayer(browser, BASE, { viewport: { width: 1280, height: 800 } }); q.push(p); await search(p, n); await sleep(500); }
    await until(async () => !(await q[1].isDisabled('#searchNow')), 8000, 'pulsante inizia subito');
    log('nuova ricerca separata dalla prima:', await q[1].textContent('#searchText'));
    await q[1].click('#searchNow');
    await until(async () => (await Promise.all(q.map(where))).every(w => w.game), 40000, 'partita in due con bot');
    const w2 = await Promise.all(q.map(where));
    assert(w2[0].code === w2[1].code && w2[0].code !== ws[0].code);
    assert.strictEqual(w2[0].names.filter(n => n.endsWith('*')).length, 1, 'un bot');
    log('in due: partita con un bot', w2[0].names.join(', '));

    /* se chi organizza la ricerca la annulla, gli altri si ritrovano da soli */
    const t = [];
    for (const n of ['Ivo', 'Lia', 'Max']) { const p = await newPlayer(browser, BASE, { viewport: { width: 412, height: 860 } }); t.push(p); await search(p, n); await sleep(600); }
    await until(async () => (await t[2].textContent('#searchText')).includes('3 giocatori'), 8000, 'in 3 nella ricerca');
    await t[0].click('[data-a="searchCancel"]');
    await until(async () => (await t[1].textContent('#searchText')).includes('2 giocatori') && (await t[2].textContent('#searchText')).includes('2 giocatori'), 15000, 'gli altri due si ritrovano');
    log('chi organizzava ha annullato: gli altri due si sono ritrovati');
    await t[1].click('[data-a="searchCancel"]'); await t[2].click('[data-a="searchCancel"]');

    /* annullare la ricerca la chiude davvero */
    const r = await newPlayer(browser, BASE, { viewport: { width: 412, height: 860 } });
    await search(r, 'Gina'); await sleep(1500); await r.click('[data-a="searchCancel"]');
    assert(await r.isHidden('#ovSearch')); log('ricerca annullata');
    const errs = [...ps, ...q, ...t, r].flatMap(p => p.errors || []);
    assert.deepStrictEqual(errs, [], 'errori JS: ' + errs.join(' | '));
    log('nessun errore JavaScript');
  } catch (e) { failed = true; console.error('ERRORE', e); }
  await browser.close(); srv.close();
  process.exit(failed ? 1 : 0);
})();
