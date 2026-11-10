// Schermate di situazioni preparate, contro i bot.
const { startServer, launch, newPlayer } = require('./harness');
const OUT = process.env.OUT;
const PORT = 8124, BASE = `http://localhost:${PORT}/`;
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function solo(browser, viewport, players) {
  const p = await newPlayer(browser, BASE, { viewport, touch: viewport.width < 900 });
  await p.fill('#nameInput', 'Francesco');
  await p.click('text=Prova contro i bot');
  await p.waitForSelector('#lobby:not([hidden])');
  for (let i = 4; i < players; i++) await p.click('text=Aggiungi un bot');
  for (let i = players; i < 4; i++) await p.click('#pList li:last-child [aria-label^="Togli"]');
  return p;
}
const toRound = (p, r, k, phase) => p.evaluate(({ r, k, phase }) => {
  const S = window.__S, E = window.Engine;
  S.core.start();
  const g = S.core.g;
  clearTimeout(S.core.t1); clearTimeout(S.core.t2);
  g.round = r - 1; g.dealer = 2 % g.n; g.scores = g.scores.map((_, i) => [120, -30, 240, 60, 90, 10][i]);
  E.startRound(g); E.finishDeal(g);
  if (g.phase === 'trump') E.applyTrump(g, g.dealer, 'r');
  if (phase === 'bid') { while (g.turn !== 0) E.applyBid(g, g.turn, E.autoBid(g, g.turn)); }
  else {
    while (g.phase === 'bid') E.applyBid(g, g.turn, E.autoBid(g, g.turn));
    g.turn = 1 % g.n; g.leader = g.turn;
    for (let i = 0; i < k && g.phase === 'play' && g.turn !== 0; i++) E.applyPlay(g, g.turn, E.autoPlay(g, g.turn));
    if (r >= 3) g.won = g.won.map((_, i) => [1, 0, 2, 1, 0, 1][i]);
  }
  S.core.schedule = function () {};
  S.core.deadline = Date.now() + (phase === 'bid' ? 42000 : 21000); S.core.total = phase === 'bid' ? 60000 : 30000;
  S.view = null;
  S.core.after();
}, { r, k, phase });
(async () => {
  const srv = await startServer(PORT);
  const browser = await launch();
  const scenes = (process.env.SCENES || 'phone-bid4,phone-play4,phone-play6,small-play6,desk-play4,desk-play6,desk-bid5,tablet-play5,land-play4').split(',');
  const DEF = {
    'phone-bid4': [{ width: 390, height: 844 }, 4, 5, 3, 'bid'], 'phone-play4': [{ width: 390, height: 844 }, 4, 6, 3, 'play'],
    'phone-play6': [{ width: 390, height: 844 }, 6, 9, 5, 'play'], 'small-play6': [{ width: 360, height: 640 }, 6, 10, 5, 'play'],
    'desk-play4': [{ width: 1440, height: 900 }, 4, 7, 3, 'play'], 'desk-play6': [{ width: 1440, height: 900 }, 6, 8, 5, 'play'],
    'desk-bid5': [{ width: 1366, height: 768 }, 5, 6, 3, 'bid'], 'tablet-play5': [{ width: 820, height: 1180 }, 5, 11, 4, 'play'],
    'land-play4': [{ width: 844, height: 390 }, 4, 8, 3, 'play'], 'phone-play20': [{ width: 390, height: 844 }, 3, 20, 2, 'play']
  };
  for (const name of scenes) {
    const [vp, n, r, k, phase] = DEF[name];
    const p = await solo(browser, vp, n);
    await toRound(p, r, k, phase);
    await sleep(1500);
    await p.screenshot({ path: `${OUT}/${name}.png` });
    const over = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    console.log(name, 'overflow:', over, 'errori:', p.errors.length ? p.errors : 0);
    if (name === 'phone-play4' && process.env.EXTRA) {
      for (const [sel, file] of [['#icRules', 'rules'], ['#icSheet', 'sheet'], ['#icMenu', 'menu']]) {
        await p.click(sel); await sleep(350); await p.screenshot({ path: `${OUT}/${file}-phone.png` }); await p.keyboard.press('Escape');
      }
    }
    await p.context().close();
  }
  if (process.env.EXTRA) {
    const h = await newPlayer(browser, BASE, { viewport: { width: 390, height: 844 }, touch: true });
    await sleep(900); await h.screenshot({ path: `${OUT}/home-phone.png` });
    await h.click('#profileChip'); await sleep(400); await h.screenshot({ path: `${OUT}/profile-phone.png` });
    await h.context().close();
    const d = await newPlayer(browser, BASE, { viewport: { width: 1440, height: 900 } });
    await sleep(900); await d.screenshot({ path: `${OUT}/home-desk.png` });
    await d.fill('#nameInput', 'Francesco'); await d.click('text=Prova contro i bot'); await sleep(500); await d.screenshot({ path: `${OUT}/lobby-desk.png` });
    await d.context().close();
  }
  await browser.close(); srv.close();
})().catch(e => { console.error(e); process.exit(1); });
