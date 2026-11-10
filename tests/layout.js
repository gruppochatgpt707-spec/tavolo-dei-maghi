// Schermate di controllo dell'impaginazione: telefono, telefono orizzontale e computer, con 4 e 6 giocatori.
const { startServer, launch, newPlayer } = require('./harness');
const path = require('path');
const OUT = process.env.OUT || path.join(__dirname, 'shots');
const PORT = 8129, BASE = `http://localhost:${PORT}/`;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const sizes = (process.env.SIZES || 'phone:412x860,mac:1440x820,land:860x400').split(',').map(s => { const [n, d] = s.split(':'); const [w, h] = d.split('x').map(Number); return { n, w, h }; });
const modes = (process.env.MODES || 'bid,play').split(',');
const counts = (process.env.COUNTS || '4,6').split(',').map(Number);
(async () => {
  const srv = await startServer(PORT), browser = await launch();
  const errs = [];
  for (const z of sizes) for (const np of counts) for (const mode of modes) {
    const p = await newPlayer(browser, BASE, { viewport: { width: z.w, height: z.h }, touch: z.n !== 'mac' });
    p.on('pageerror', e => errs.push(z.n + ' ' + e.message));
    await p.click('text=Prova contro i bot'); await p.waitForSelector('#lobby:not([hidden])');
    for (let k = 4; k < np; k++) await p.click('[data-a="addBot"]');
    await p.evaluate((mode) => {
      const S = window.__S, E = window.Engine; S.core.start(); const g = S.core.g; clearTimeout(S.core.t1); clearTimeout(S.core.t2);
      g.round = 5; g.dealer = 2; g.scores = g.scores.map((x, i) => [90, 40, 130, -20, 60, 10][i]); E.startRound(g); E.finishDeal(g); if (g.phase === 'trump') E.applyTrump(g, g.dealer, 'b');
      if (mode === 'bid') { while (g.turn !== 0) E.applyBid(g, g.turn, E.autoBid(g, g.turn)); }
      else { while (g.phase === 'bid') E.applyBid(g, g.turn, E.autoBid(g, g.turn)); const n = g.scores.length; g.turn = 1; g.leader = 1; for (let i = 0; i < n - 1; i++) E.applyPlay(g, g.turn, E.autoPlay(g, g.turn)); }
      S.core.schedule = function () {}; S.core.deadline = Date.now() + 40000; S.core.total = 60000; S.view = null; S.core.after();
    }, mode);
    await sleep(3600);
    const f = path.join(OUT, `${z.n}-${np}-${mode}.png`);
    await p.screenshot({ path: f });
    // controllo sovrapposizioni: icone dei giocatori, vassoio della briscola, carte sul tavolo
    const bad = await p.evaluate(() => {
      const R = e => e.getBoundingClientRect(), hit = (a, b) => a.left < b.right - 2 && b.left < a.right - 2 && a.top < b.bottom - 2 && b.top < a.bottom - 2;
      const seats = [...document.querySelectorAll('.seat .avwrap')].map(R), tray = R(document.querySelector('#tray .deckslot')), out = [];
      const tag = [...document.querySelectorAll('.seat')].map(R);
      seats.forEach((s, i) => { if (hit(s, tray)) out.push('posto ' + i + ' sul vassoio'); seats.forEach((t, j) => { if (j > i && hit(tag[i], tag[j])) out.push('posti ' + i + ' e ' + j + ' sovrapposti'); }); });
      const tb = R(document.querySelector('#table'));
      tag.forEach((s, i) => { if (s.left < tb.left - 1 || s.right > tb.right + 1 || s.top < tb.top - 1 || s.bottom > tb.bottom + 1) out.push('posto ' + i + ' fuori dal tavolo'); });
      [...document.querySelectorAll('.tcard')].map(R).forEach((c, i) => { if (c.left < tb.left || c.right > tb.right || c.top < tb.top || c.bottom > tb.bottom) out.push('carta ' + i + ' fuori dal tavolo'); seats.forEach((s, j) => { if (hit(c, s)) out.push('carta ' + i + ' copre il posto ' + j); }); });
      return out;
    });
    console.log(path.basename(f), bad.length ? bad.join('; ') : 'ok');
    await p.context().close();
  }
  console.log('errori JS:', errs.length ? errs : 'nessuno');
  await browser.close(); srv.close();
})().catch(e => { console.error(e); process.exit(1); });
