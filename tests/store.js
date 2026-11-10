// Immagini per la scheda del Play Store: grafica in evidenza e schermate del telefono in 9:16.
const { startServer, launch, newPlayer } = require('./harness');
const path = require('path');
const OUT = path.join(__dirname, '..', 'store');
const PORT = 8128, BASE = `http://localhost:${PORT}/`;
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const srv = await startServer(PORT), browser = await launch();
  const ctx = await browser.newContext({ viewport: { width: 1024, height: 500 }, deviceScaleFactor: 1 });
  const g = await ctx.newPage();
  await g.goto(BASE + 'index.html');
  await g.evaluate(() => {
    document.body.innerHTML = '<div id="fg" style="position:fixed;inset:0;display:flex;align-items:center;gap:40px;padding:0 60px;background:radial-gradient(ellipse at 60% 50%,rgba(255,196,110,.5),rgba(20,8,0,.6) 80%),url(art/ui/wood.webp) center/380px"><div class="sheet-paper" style="padding:26px 34px;border-radius:6px;max-width:430px"><h1 class="wordmark" style="font-size:66px;text-align:left">Il Tavolo<br>dei Maghi</h1><p style="font:italic 22px/1.3 Lora,serif;color:#6b4a2e;margin-top:10px">Prevedi le tue prese. Gioca con gli amici, anche a distanza.</p></div><div class="fan" style="position:relative;flex:1;height:420px"></div></div>';
    const fan = document.querySelector('#fg .fan');
    [['W1', -24], ['r12', -12], ['b9', 0], ['g7', 12], ['J3', 24]].forEach(([id, a], i) => { const d = document.createElement('div'); d.className = 'card'; d.style.cssText = `position:absolute;left:50%;bottom:-40px;width:190px;margin-left:-95px;transform-origin:50% 120%;transform:rotate(${a}deg);filter:drop-shadow(0 8px 12px rgba(0,0,0,.5))`; d.innerHTML = Cards.face(id); fan.appendChild(d); });
  });
  await sleep(800);
  await g.screenshot({ path: path.join(OUT, 'grafica-in-evidenza-1024x500.png') });
  await ctx.close();
  // schermate 9:16
  const shots = [['home', null], ['partita', 'play'], ['previsione', 'bid'], ['profilo', 'profile']];
  for (const [name, mode] of shots) {
    const p = await newPlayer(browser, BASE, { viewport: { width: 412, height: 732 }, touch: true, dpr: 2.625 });
    await p.evaluate(() => { try { localStorage.setItem('tavolo_profile', JSON.stringify({ id: 'gx', name: 'Francesco', av: 'p:bardo', created: 1 })); } catch (e) {} });
    await p.reload(); await sleep(700);
    if (mode === 'profile') { await p.click('#profileChip'); await sleep(500); }
    if (mode === 'play' || mode === 'bid') {
      await p.click('text=Prova contro i bot'); await p.waitForSelector('#lobby:not([hidden])');
      await p.evaluate((mode) => {
        const S = window.__S, E = window.Engine; S.core.start(); const g = S.core.g; clearTimeout(S.core.t1); clearTimeout(S.core.t2);
        g.round = 5; g.dealer = 2; g.scores = [90, 40, 130, -20]; E.startRound(g); E.finishDeal(g); if (g.phase === 'trump') E.applyTrump(g, g.dealer, 'b');
        if (mode === 'bid') { while (g.turn !== 0) E.applyBid(g, g.turn, E.autoBid(g, g.turn)); }
        else { while (g.phase === 'bid') E.applyBid(g, g.turn, E.autoBid(g, g.turn)); g.turn = 1; g.leader = 1; for (let i = 0; i < 3; i++) E.applyPlay(g, g.turn, E.autoPlay(g, g.turn)); g.won = [1, 0, 2, 1]; }
        S.core.schedule = function () {}; S.core.deadline = Date.now() + 40000; S.core.total = 60000; S.view = null; S.core.after();
      }, mode);
      await sleep(3400);
    }
    await p.screenshot({ path: path.join(OUT, `telefono-${name}.png`), scale: 'device' });
    await p.context().close();
  }
  await browser.close(); srv.close();
  console.log('immagini pronte in', OUT);
})().catch(e => { console.error(e); process.exit(1); });
