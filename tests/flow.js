// Una mano a velocità reale contro i bot: fotogrammi di distribuzione, presa vinta e riepilogo.
const { startServer, launch, newPlayer } = require('./harness');
const OUT = process.env.OUT, PORT = 8126, BASE = `http://localhost:${PORT}/`;
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const srv = await startServer(PORT), browser = await launch();
  const p = await newPlayer(browser, BASE, { viewport: { width: 390, height: 844 }, touch: true });
  await p.fill('#nameInput', 'Francesco'); await p.click('text=Prova contro i bot');
  await p.waitForSelector('#lobby:not([hidden])');
  await p.click('#startBtn');
  await p.evaluate(() => { const S = window.__S; S.core.g.round = 2; S.core.g.dealer = 0; clearTimeout(S.core.t1); window.Engine.startRound(S.core.g); S.core.key = null; S.view = Object.assign({}, S.view, { round: 1, phase: 'lobby' }); S.core.after(); });
  await sleep(620);
  await p.screenshot({ path: `${OUT}/flow-deal.png` });
  await p.waitForSelector('#game:not([hidden])');
  // Gioca finché la mano finisce
  let trick = false, t0 = Date.now();
  while (Date.now() - t0 < 60000) {
    if (await p.isVisible('#ovResult')) break;
    if (await p.isVisible('#bidPanel')) { await p.click('#bidNums .bn:nth-child(2)', { force: true }); await p.click('#bidOk', { force: true }); }
    if (await p.isVisible('#trumpPanel')) await p.click('#gems .gem', { force: true });
    const c = await p.$('.hcard.can');
    if (c) { const id = await c.getAttribute('data-c'); await p.click(`#h-${id}`, { force: true }); await sleep(60); await p.click(`#h-${id}`, { force: true }).catch(() => {}); }
    if (!trick && await p.$('.tcard.win')) { trick = true; await sleep(350); await p.screenshot({ path: `${OUT}/flow-win.png` }); }
    await sleep(90);
  }
  await sleep(900);
  await p.screenshot({ path: `${OUT}/flow-result.png` });
  console.log('errori', p.errors);
  await browser.close(); srv.close();
})().catch(e => { console.error(e); process.exit(1); });
