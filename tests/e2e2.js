// Voce, luoghi, tempo scaduto, disconnessioni, riavvio dell'host.
const assert = require('assert');
const fs = require('fs');
const { startServer, launch, newPlayer } = require('./harness');
const OUT = process.env.OUT || require('path').join(__dirname, 'shots'); fs.mkdirSync(OUT, { recursive: true });
const PORT = 8125, BASE = `http://localhost:${PORT}/`;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const log = (...a) => console.log('•', ...a);
async function until(fn, ms = 15000, label = 'condizione') {
  const t = Date.now();
  while (Date.now() - t < ms) { const r = await fn(); if (r) return r; await sleep(60); }
  throw new Error('Timeout: ' + label);
}
async function create(page, name) {
  await page.fill('#nameInput', name); await page.click('#createBtn');
  await page.waitForSelector('#lobby:not([hidden])');
  return page.$$eval('#codeCells span', s => s.map(x => x.textContent).join(''));
}
async function join(page, name, code) {
  await page.fill('#nameInput', name); await page.fill('#codeInput', code); await page.click('#joinBtn');
  await page.waitForSelector('#lobby:not([hidden])');
}
const audioState = p => p.evaluate(() => {
  const els = [...document.querySelectorAll('audio')];
  return els.map(a => ({ tracks: a.srcObject ? a.srcObject.getAudioTracks().length : 0, paused: a.paused, live: a.srcObject ? a.srcObject.getAudioTracks()[0].readyState : null }));
});
const peerPlaces = p => p.$$eval('.vlist li small', s => s.map(x => x.textContent));

(async () => {
  const srv = await startServer(PORT);
  const browser = await launch();
  let failed = false;
  try {
    /* SCENARIO VOCE: 3 nella stessa stanza + 1 a distanza */
    const a = await newPlayer(browser, BASE, { viewport: { width: 1440, height: 900 } });
    const b = await newPlayer(browser, BASE, { viewport: { width: 390, height: 844 }, touch: true });
    b.on('pageerror', e => console.log('ERRORE JS telefono:', e.message, (e.stack || '').split('\n')[1]));
    const c = await newPlayer(browser, BASE, { viewport: { width: 390, height: 844 }, touch: true });
    const d = await newPlayer(browser, BASE, { viewport: { width: 390, height: 844 }, touch: true });
    const code = await create(a, 'Francesco');
    await join(b, 'Marta', code); await join(c, 'Luca', code); await join(d, 'Remoto', code);
    await until(async () => (await a.$$('#pList li')).length === 4, 5000, '4 in sala');

    // I tre in presenza scelgono lo stesso luogo: A
    for (const p of [b, c]) {
      await p.click('#lobbyVoice');
      await p.click('.placepick [aria-label="Luogo A"]');
      await sleep(120);
      await p.click('#ovVoice .x');
    }
    await a.click('#lobbyVoice');
    await a.click('[data-a=voiceJoin]');
    await until(async () => (await peerPlaces(a)).some(t => t.includes('in voce')), 5000, 'host in voce');
    log('Francesco (stanza A) è in voce');

    // Un secondo dispositivo nella stessa stanza non può sovrapporsi
    await c.click('#lobbyVoice'); await c.click('[data-a=voiceJoin]');
    await c.waitForSelector('[data-a=voiceTake]', { timeout: 3000 });
    const busyText = await c.textContent('#voiceBody .note');
    assert(/Francesco/.test(busyText) && /luogo A/.test(busyText), busyText);
    log('blocco accavallamento:', busyText.trim().slice(0, 70));
    await c.screenshot({ path: `${OUT}/voice-busy-phone.png` });
    await c.click('[data-a=voiceCancel]'); await c.click('#ovVoice .x');

    // Il giocatore a distanza entra in voce
    await d.click('#lobbyVoice'); await d.click('[data-a=voiceJoin]');
    await until(async () => { const s = await audioState(d); return s.length === 1 && s[0].tracks === 1 && !s[0].paused; }, 8000, 'audio arrivato al remoto');
    await until(async () => { const s = await audioState(a); return s.length === 1 && s[0].tracks === 1 && !s[0].paused; }, 8000, 'audio arrivato all\'host');
    log('collegamento vocale stabilito tra stanza e remoto (audio in riproduzione su entrambi)');
    assert.equal((await audioState(b)).length, 0); assert.equal((await audioState(c)).length, 0);
    log('gli altri due in stanza non ricevono audio: niente sovrapposizioni');
    await sleep(600);
    const speakingSeen = await until(async () => a.evaluate(() => !!document.querySelector('.vlist li.speaking')), 6000, 'indicatore parlato');
    assert(speakingSeen); log('indicatore di chi parla attivo');
    await a.screenshot({ path: `${OUT}/voice-desktop.png` });
    await d.screenshot({ path: `${OUT}/voice-phone.png` });

    // Silenzia microfono
    await d.click('[data-a=voiceMute]');
    await until(async () => (await peerPlaces(a)).some(t => t.includes('microfono spento')), 4000, 'stato microfono spento');
    const enabled = await d.evaluate(() => true);
    log('microfono spento visibile agli altri');
    await d.click('[data-a=voiceMute]');

    // Passaggio di consegne: Marta prende il posto di Francesco
    await b.click('#lobbyVoice'); await b.click('[data-a=voiceJoin]');
    await b.waitForSelector('[data-a=voiceTake]');
    await b.click('[data-a=voiceTake]');
    await until(async () => (await audioState(a)).length === 0, 6000, 'host uscito');
    await until(async () => (await audioState(b)).length === 1, 8000, 'Marta collegata');
    log('un altro della stanza può prendere il posto in voce');
    await b.click('#ovVoice .x'); await a.click('#ovVoice .x'); await d.click('#ovVoice .x');

    /* TEMPO SCADUTO: 3 minuti esatti, poi previsione automatica */
    await a.click('#startBtn');
    await until(() => b.isVisible('#game'), 5000, 'partita avviata');
    const pages = [a, b, c, d];
    /* se esce un Mago come briscola, il mazziere sceglie il colore prima delle previsioni */
    await until(async () => { for (const p of pages) if (await p.isVisible('#trumpPanel')) { await p.click('#gems .gem', { force: true }).catch(() => {}); } return (await Promise.all(pages.map(p => p.isVisible('#bidPanel')))).some(Boolean); }, 12000, 'schermata previsione');
    // con l'host mandato avanti di 3 minuti il turno deve passare da solo
    const turnBefore = await b.evaluate(() => { const l = window.__log; return l[l.length - 1].turn; });
    const left = await b.evaluate(() => { const l = window.__log; return l[l.length - 1].timeLeft; });
    assert(left > 50000 && left <= 60000, 'tempo restante ' + left);
    await a.evaluate(() => { const S = window.__S; clearTimeout(S.core.t1); S.core.deadline = Date.now() + 50; S.core.schedule(); });
    await until(async () => { const v = await b.evaluate(() => { const l = window.__log; return l[l.length - 1]; }); return v.turn !== turnBefore || v.phase !== 'bid'; }, 4000, 'turno passato allo scadere');
    log('allo scadere del tempo la previsione viene inserita in automatico e il turno passa');

    /* DISCONNESSIONE: il telefono ricarica la pagina e rientra */
    await b.reload();
    await b.waitForSelector('[data-a=resumeClient]', { timeout: 4000 });
    await b.screenshot({ path: `${OUT}/resume-phone.png` });
    await until(async () => (await a.evaluate(() => window.__S.core.players[1].connected)) === false, 5000, 'host vede la disconnessione');
    await b.click('[data-a=resumeClient]');
    try { await until(() => b.isVisible('#game'), 6000, 'rientro'); } catch (e) { await b.screenshot({ path: `${OUT}/rientro-fallito.png` }); console.log('errori host:', a.errors, 'errori telefono:', b.errors); console.log('stato telefono:', await b.evaluate(() => ({ home: !document.querySelector('#home').hidden, lobby: !document.querySelector('#lobby').hidden, game: !document.querySelector('#game').hidden, busy: !document.querySelector('#ovBusy').hidden, conn: !document.querySelector('#ovConn').hidden, msg: document.querySelector('#homeMsg').textContent, view: window.__S.view && window.__S.view.phase }))); throw e; }
    assert.equal(await a.evaluate(() => window.__S.core.players[1].connected), true);
    const handBack = await b.$$('.hcard');
    assert(handBack.length >= 1, 'mano recuperata');
    log('chi ricarica la pagina rientra al suo posto con le sue carte');

    /* RIAVVIO DELL'HOST: la partita riprende */
    const roundBefore = await a.evaluate(() => window.__S.core.g.round);
    await a.evaluate(() => { window.onbeforeunload = null; });
    await a.reload();
    await a.waitForSelector('[data-a=resumeHost]', { timeout: 4000 });
    await until(() => c.isVisible('#ovConn'), 15000, 'clienti avvisati della caduta');
    await c.screenshot({ path: `${OUT}/conn-lost-phone.png` });
    log('i giocatori vedono l\'avviso di riconnessione');
    await a.click('[data-a=resumeHost]');
    await until(() => a.isVisible('#game'), 15000, 'host riaperto');
    await until(async () => !(await c.isVisible('#ovConn')), 20000, 'clienti ricollegati');
    assert.equal(await a.evaluate(() => window.__S.core.g.round), roundBefore);
    log('l\'host riapre e la partita riprende dalla stessa mano, i giocatori si ricollegano da soli');

    // Si continua a giocare dopo il riavvio
    const anyPanel = await until(async () => { for (const p of pages) if (await p.isVisible('#bidPanel')) return p; return null; }, 45000, 'previsione dopo riavvio');
    await anyPanel.click('#bidNums .bn:not([disabled])', { force: true }); await anyPanel.click('#bidOk', { force: true });
    log('il gioco prosegue dopo il riavvio');

    for (const p of pages) assert.deepEqual(p.errors, [], 'errori JS: ' + p.errors.join(' | '));
    log('nessun errore JavaScript');
  } catch (e) { failed = true; console.error('ERRORE', e); }
  finally { await browser.close(); srv.close(); }
  process.exit(failed ? 1 : 0);
})();
