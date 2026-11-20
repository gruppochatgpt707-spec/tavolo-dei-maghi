// Lingue: ogni schermata, passata in un'altra lingua, non deve lasciare testi italiani.
const assert = require('assert');
const path = require('path');
const { startServer, launch, newPlayer } = require('./harness');
const PORT = 8131, BASE = `http://localhost:${PORT}/`;
const OUT = process.env.OUT || path.join(__dirname, 'shots');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const IT = /\b(il|della|delle|che|non|per|una|sono|partita|carte|giocatori|previste|fatte|mano|briscola|mazziere|sei|chi|tocca|presa|prese|punti|giullare|nessun\w*|scegli|entra|crea|cerca)\b/i;
async function leftovers(p) {
  return p.evaluate((src) => {
    const re = new RegExp(src, 'i'), out = [];
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n; while ((n = w.nextNode())) {
      const t = n.nodeValue.replace(/\s+/g, ' ').trim(), par = n.parentNode;
      if (!t || ['SCRIPT', 'STYLE'].includes(par.nodeName) || par.closest('.legal,.pn,.chatlog,.who,#pList,.wordmark,[lang="it"]')) continue;
      if (re.test(t)) out.push(t);
    }
    document.querySelectorAll('[placeholder],[aria-label],[title]').forEach(el => ['placeholder', 'aria-label', 'title'].forEach(a => { const v = el.getAttribute(a); if (v && re.test(v) && !el.closest('[lang="it"]')) out.push('@' + a + ': ' + v); }));
    return [...new Set(out)];
  }, IT.source);
}
(async () => {
  const srv = await startServer(PORT), browser = await launch(); let failed = false;
  try {
    const p = await newPlayer(browser, BASE, { viewport: { width: 412, height: 860 }, touch: true });
    await sleep(600);
    assert.strictEqual(await p.textContent('#searchBtn'), 'Cerca giocatori online'); console.log('• italiano predefinito');
    await p.click('.home-form [data-l="en"]'); await sleep(300);
    assert.strictEqual(await p.textContent('#searchBtn'), 'Find players online');
    let left = await leftovers(p); console.log('• home EN, testi italiani rimasti:', left);
    await p.screenshot({ path: path.join(OUT, 'i18n-en-home.png') });
    await p.click('[data-a="rules"]'); await sleep(300);
    assert((await p.textContent('#ruleList')).includes('Order of strength')); await p.click('#ruleQuick button >> nth=0'); await sleep(200);
    assert((await p.textContent('#ruleList')).toLowerCase().includes('jester'), 'ricerca rapida in inglese');
    left = left.concat(await leftovers(p)); await p.click('#ovRules [data-a="close"]');
    await p.click('#profileChip'); await sleep(300); left = left.concat(await leftovers(p)); await p.click('#ovProfile [data-a="close"]');
    await p.fill('#nameInput', 'Ann'); await p.click('[data-a="solo"]'); await p.waitForSelector('#lobby:not([hidden])'); await sleep(400);
    left = left.concat(await leftovers(p)); await p.screenshot({ path: path.join(OUT, 'i18n-en-lobby.png') });
    await p.evaluate(() => window.__S.core.start());
    await p.waitForFunction(() => window.__S.view && window.__S.view.phase === 'bid', null, { timeout: 15000 }); await sleep(1500);
    left = left.concat(await leftovers(p)); await p.screenshot({ path: path.join(OUT, 'i18n-en-game.png') });
    /* cambio lingua a partita in corso */
    for (const l of ['de', 'fr', 'es']) {
      await p.evaluate(l => I18N.setLang(l), l); await sleep(400);
      await p.screenshot({ path: path.join(OUT, 'i18n-' + l + '-game.png') });
    }
    const bidTitle = await p.textContent('#bidPanel'); console.log('• pannello previsione in spagnolo:', bidTitle.replace(/\s+/g, ' ').slice(0, 90));
    await p.evaluate(() => I18N.setLang('it')); await sleep(300);
    assert.strictEqual(await p.evaluate(() => document.documentElement.lang), 'it');
    const uniq = [...new Set(left)]; console.log('• testi italiani rimasti in inglese:', uniq.length ? uniq : 'nessuno');
    assert.deepStrictEqual(p.errors || [], [], 'errori JS');
  } catch (e) { failed = true; console.error('ERRORE', e); }
  await browser.close(); srv.close(); process.exit(failed ? 1 : 0);
})();
