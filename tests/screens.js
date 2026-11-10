// Schermate di controllo: pagina iniziale, sala d'attesa, profilo, risultati della mano.
const { startServer, launch, newPlayer } = require('./harness');
const path = require('path');
const OUT = process.env.OUT || path.join(__dirname, 'shots');
const PORT = 8130, BASE = `http://localhost:${PORT}/`;
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const srv = await startServer(PORT), browser = await launch(), errs = [];
  for (const [n, w, h] of [['phone', 412, 860], ['mac', 1440, 820]]) {
    const p = await newPlayer(browser, BASE, { viewport: { width: w, height: h }, touch: n === 'phone' });
    p.on('pageerror', e => errs.push(e.message));
    await sleep(900); await p.screenshot({ path: path.join(OUT, n + '-home.png') });
    await p.click('#profileChip'); await sleep(600); await p.screenshot({ path: path.join(OUT, n + '-profile.png') });
    await p.click('#ovProfile [data-a="close"]');
    await p.click('text=Prova contro i bot'); await p.waitForSelector('#lobby:not([hidden])'); await sleep(500);
    await p.screenshot({ path: path.join(OUT, n + '-lobby.png') });
    await p.evaluate(() => {
      const S = window.__S, E = window.Engine; S.core.start(); const g = S.core.g; clearTimeout(S.core.t1); clearTimeout(S.core.t2);
      g.round = 2; E.startRound(g); E.finishDeal(g); if (g.phase === 'trump') E.applyTrump(g, g.dealer, 'r');
      while (g.phase === 'bid') E.applyBid(g, g.turn, E.autoBid(g, g.turn));
      while (g.phase === 'play' || g.phase === 'trickEnd') { if (g.phase === 'trickEnd') E.collectTrick(g); else E.applyPlay(g, g.turn, E.autoPlay(g, g.turn)); }
      S.core.schedule = function () {}; S.view = null; S.core.after();
    });
    await sleep(1500); await p.screenshot({ path: path.join(OUT, n + '-result.png') });
    await p.context().close();
  }
  console.log('errori JS:', errs.length ? errs : 'nessuno');
  await browser.close(); srv.close();
})().catch(e => { console.error(e); process.exit(1); });
