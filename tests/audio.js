// Controllo dei suoni: nessun errore, livelli sensati, niente distorsione. Misura musica ed effetti separatamente.
const { startServer, launch, newPlayer } = require('./harness');
const PORT = 8127, BASE = `http://localhost:${PORT}/`;
(async () => {
  const srv = await startServer(PORT), browser = await launch();
  const p = await newPlayer(browser, BASE, { viewport: { width: 800, height: 700 } });
  await p.click('body');
  const r = await p.evaluate(async () => {
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    Sound.unlock();
    const d = window.__soundDebug(), ctx = d.ctx;
    const an = ctx.createAnalyser(); an.fftSize = 2048; d.master.connect(an);
    const buf = new Float32Array(2048);
    async function measure(ms) {
      let sum = 0, n = 0, peak = 0; const t0 = performance.now();
      while (performance.now() - t0 < ms) { an.getFloatTimeDomainData(buf); for (const x of buf) { sum += x * x; n++; peak = Math.max(peak, Math.abs(x)); } await sleep(40); }
      return { rmsDb: +(10 * Math.log10(sum / n + 1e-12)).toFixed(1), peak: +peak.toFixed(3) };
    }
    const out = {};
    for (const th of ['none', 'r', 'b', 'g', 'y']) { Sound.music.theme(th); }
    out.music = await measure(9000);
    Sound.set('music', false); await sleep(1500);
    const names = ['card', 'deal', 'select', 'shuffle', 'gather', 'stamp', 'flip', 'turn', 'win', 'good', 'bad', 'wizard', 'jester', 'tick', 'ui', 'end'];
    out.sfx = {};
    for (const nm of names) { Sound.sfx(nm); out.sfx[nm] = await measure(nm === 'shuffle' || nm === 'end' || nm === 'good' ? 1600 : 700); }
    return out;
  });
  console.log('musica', r.music);
  Object.entries(r.sfx).forEach(([k, v]) => console.log(k.padEnd(8), v));
  console.log('errori', p.errors);
  await browser.close(); srv.close();
})().catch(e => { console.error(e); process.exit(1); });
