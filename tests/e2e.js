const assert = require('assert');
const path = require('path');
const fs = require('fs');
const { startServer, launch, newPlayer } = require('./harness');
const OUT = process.env.OUT || path.join(__dirname, 'shots');
fs.mkdirSync(OUT, { recursive: true });
const PORT = 8123, BASE = `http://localhost:${PORT}/`;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const log = (...a) => console.log('•', ...a);

async function until(fn, ms = 15000, label = 'condizione') {
  const t = Date.now();
  while (Date.now() - t < ms) { const r = await fn(); if (r) return r; await sleep(60); }
  throw new Error('Timeout: ' + label);
}
async function create(page, name) {
  await page.fill('#nameInput', name);
  await page.click('#createBtn');
  await page.waitForSelector('#lobby:not([hidden])');
  return (await page.$$eval('#codeCells span', s => s.map(x => x.textContent).join('')));
}
async function join(page, name, code) {
  await page.fill('#nameInput', name);
  await page.fill('#codeInput', code);
  await page.click('#joinBtn');
  await page.waitForSelector('#lobby:not([hidden])');
}
const view = page => page.evaluate(() => window.__log[window.__log.length - 1] || null);

// Un giro di azioni: ogni pagina fa ciò che lo schermo le chiede
async function actAll(pages) {
  let acted = false;
  const safe = async fn => { try { await fn(); acted = true; } catch (e) { /* l'elemento è cambiato nel frattempo: si riprova al giro dopo */ } };
  for (const p of pages) {
    if (await p.isVisible('#bidPanel').catch(() => false)) await safe(async () => { await p.click('#bidNums .bn:not([disabled])', { force: true, timeout: 800 }); await p.click('#bidOk', { force: true, timeout: 800 }); });
    if (await p.isVisible('#trumpPanel').catch(() => false)) await safe(() => p.click('#gems .gem', { force: true, timeout: 800 }));
    const id = await p.$eval('.hcard.can', el => el.dataset.c).catch(() => null);
    if (id) await safe(async () => { await p.click('#h-' + id, { force: true, timeout: 800 }); await sleep(30); if (await p.$('#h-' + id)) await p.click('#h-' + id, { force: true, timeout: 800 }); });
    if (await p.isVisible('#ovResult').catch(() => false) && await p.isEnabled('#readyBtn').catch(() => false)) await safe(() => p.click('#readyBtn', { force: true, timeout: 800 }));
  }
  return acted;
}

(async () => {
  const srv = await startServer(PORT);
  const browser = await launch();
  let failed = false;
  try {
    /* 1. Ingresso con codice e partita multi-dispositivo */
    const speed = 12;
    const host = await newPlayer(browser, BASE, { viewport: { width: 1440, height: 900 }, speed });
    const p2 = await newPlayer(browser, BASE, { viewport: { width: 390, height: 844 }, touch: true, speed });
    const p3 = await newPlayer(browser, BASE, { viewport: { width: 360, height: 640 }, touch: true, speed });
    const p4 = await newPlayer(browser, BASE, { viewport: { width: 768, height: 1024 }, speed });
    const pages = [host, p2, p3, p4];
    await host.screenshot({ path: `${OUT}/home-desktop.png` });
    await p2.screenshot({ path: `${OUT}/home-phone.png` });

    const code = await create(host, 'Francesco');
    assert.match(code, /^[2-9A-Z]{5}$/);
    log('partita creata con codice', code);
    // codice sbagliato: messaggio chiaro
    await p3.fill('#nameInput', 'Luca'); await p3.fill('#codeInput', 'ZZZZZ'); await p3.click('#joinBtn');
    await until(async () => (await p3.textContent('#homeMsg')).includes('Non trovo'), 8000, 'errore codice');
    log('codice inesistente: errore chiaro mostrato');
    await join(p2, 'Marta', code); await join(p3, 'Luca', code); await join(p4, 'Sara', code);
    await until(async () => (await host.$$('#pList li')).length === 4, 5000, '4 in sala');
    log('4 giocatori entrati con il codice');
    await host.screenshot({ path: `${OUT}/lobby-desktop.png` });
    await p2.screenshot({ path: `${OUT}/lobby-phone.png`, fullPage: false });
    // solo l'host vede i comandi
    assert.equal(await p2.isVisible('#startBtn'), false);

    await host.click('#startBtn');
    await until(() => p2.isVisible('#game'), 5000, 'gioco avviato');

    /* Previsioni: vanno in ordine, una schermata alla volta, con 3 minuti */
    let seenBidOrder = [], guard = 0;
    await until(async () => (await view(p2)).phase === 'bid', 8000, 'fase previsioni');
    const v0 = await view(p2);
    assert(v0.timeTotal === 60000, '1 minuto di limite, trovato ' + v0.timeTotal);
    log('limite previsione predefinito', v0.timeTotal / 1000, 'secondi');
    const firstBidder = (v0.dealer + 1) % 4;
    assert.equal(v0.turn, firstBidder, 'inizia il vicino del mazziere');
    const seatPage = {};
    for (const p of pages) { const v = await view(p).catch(() => null); }
    // host: lo stato arriva direttamente, senza passare dal relay
    const visibleBid = await Promise.all(pages.map(p => p.isVisible('#bidPanel')));
    assert.equal(visibleBid.filter(Boolean).length, 1, 'una sola schermata previsione visibile alla volta');
    log('schermata previsione visibile a un solo giocatore per volta');
    const who = visibleBid.findIndex(Boolean);
    await sleep(120);
    await pages[who].screenshot({ path: `${OUT}/bid-${who}.png` });
    await p3.screenshot({ path: `${OUT}/bid-p3.png` });
    await p2.screenshot({ path: `${OUT}/bid-p2.png` });

    /* Partita completa fino alla classifica */
    const hiddenOK = async p => {
      const leak = await p.evaluate(() => window.__log.filter(v => {
        const s = JSON.stringify(v.players);
        return (v.hand || []).length !== (v.players[v.me] ? v.players[v.me].cards : 0) || /hands|"hand"/.test(s) || 'hands' in v;
      }).length);
      assert.equal(leak, 0, 'le carte degli altri non devono arrivare ai dispositivi');
    };
    let lastShot = 0, shotsTaken = new Set(), lastLog = 0;
    await until(async () => {
      guard++;
      if (Date.now() - lastLog > 15000) { lastLog = Date.now(); const vv = await view(p2); console.log('  …', vv && vv.phase, 'mano', vv && vv.round, 'turno', vv && vv.turn, 'errori', pages.map(x => x.errors.length).join(',')); if (pages.some(x => x.errors.length)) console.log(pages.map(x => x.errors.slice(0, 2))); }
      await actAll(pages);
      const v = await view(p2);
      if (v && v.phase === 'play' && v.round === 2 && !shotsTaken.has('play2') && v.trick.length >= 2) {
        shotsTaken.add('play2');
        await Promise.all([host.screenshot({ path: `${OUT}/play-desktop.png` }), p2.screenshot({ path: `${OUT}/play-phone.png` }), p3.screenshot({ path: `${OUT}/play-small.png` }), p4.screenshot({ path: `${OUT}/play-tablet.png` })]);
      }
      if (v && v.phase === 'roundEnd' && v.round === 3 && !shotsTaken.has('res')) {
        shotsTaken.add('res'); await sleep(80);
        await host.screenshot({ path: `${OUT}/result-desktop.png` }); await p2.screenshot({ path: `${OUT}/result-phone.png` });
      }
      return v && v.phase === 'gameOver';
    }, 640000, 'fine partita');
    await sleep(300);
    log('partita completa giocata fino alla classifica');
    for (const p of [p2, p3, p4]) await hiddenOK(p);
    log('nessuna carta altrui nei dati ricevuti');
    const end = await view(p2);
    assert.equal(end.history.length, 15);
    end.history.forEach(h => { assert.equal(h.won.reduce((a, b) => a + b, 0), h.round); });
    const total = [0, 1, 2, 3].map(i => end.history.reduce((a, h) => a + (h.bids[i] === h.won[i] ? 20 + 10 * h.won[i] : -10 * Math.abs(h.bids[i] - h.won[i])), 0));
    assert.deepEqual(total, end.players.map(x => x.score));
    log('punteggi automatici coerenti con il regolamento:', total.join(', '));
    await host.screenshot({ path: `${OUT}/end-desktop.png` });
    await p2.screenshot({ path: `${OUT}/end-phone.png` });

    /* Nuova partita con lo stesso gruppo */
    await host.click('#rematchBtn');
    await until(() => p3.isVisible('#lobby'), 4000, 'ritorno in sala');
    assert.equal((await p3.$$('#pList li')).length, 4);
    log('nuova partita: tutti di nuovo in sala con lo stesso codice');

    for (const p of pages) assert.deepEqual(p.errors, [], 'errori JS: ' + p.errors.join(' | '));
    await Promise.all(pages.map(p => p.context().close()));
    log('nessun errore JavaScript');
  } catch (e) {
    failed = true; console.error('ERRORE', e);
  } finally {
    await browser.close(); srv.close();
  }
  process.exit(failed ? 1 : 0);
})();
