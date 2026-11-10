const assert = require('assert');
const E = require('../web/js/engine.js');

function seeded(s) { return () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296; }
const T = (arr) => arr.map((c, p) => ({ p, c }));
let count = 0;
function t(name, fn) { fn(); count++; }

t('mazzo da 60 carte', () => {
  const d = E.buildDeck();
  assert.equal(d.length, 60); assert.equal(new Set(d).size, 60);
  assert.equal(d.filter(E.isWizard).length, 4); assert.equal(d.filter(E.isJester).length, 4);
});
t('numero di mani per giocatori', () => {
  assert.deepEqual([3, 4, 5, 6].map(E.totalRounds), [20, 15, 12, 10]);
});

// Vincitore della presa: casi del regolamento
t('primo Mago vince', () => assert.equal(E.trickWinnerEntry(T(['r13', 'W1', 'W2']), 'r').p, 1));
t('briscola più alta batte il colore di uscita', () => assert.equal(E.trickWinnerEntry(T(['b13', 'r2', 'r5']), 'r').p, 2));
t('senza briscola vince il colore di uscita più alto', () => assert.equal(E.trickWinnerEntry(T(['b5', 'g13', 'b7']), 'r').p, 2));
t('esempio regole: blu 5, blu 3, Giullare con briscola rossa -> primo', () => assert.equal(E.trickWinnerEntry(T(['b5', 'b3', 'J1']), 'r').p, 0));
t('esempio regole: Mago di apertura vince', () => assert.equal(E.trickWinnerEntry(T(['W1', 'g11', 'b7']), 'r').p, 0));
t('esempio regole: Giullare, rosso 7, rosso 3 -> rosso 7', () => assert.equal(E.trickWinnerEntry(T(['J1', 'r7', 'r3']), 'b').p, 1));
t('solo Giullari: vince il primo', () => assert.equal(E.trickWinnerEntry(T(['J1', 'J2', 'J3']), 'b').p, 0));
t('Giullare perde anche contro carta di colore diverso dopo il Giullare', () => assert.equal(E.trickWinnerEntry(T(['J1', 'g2', 'J2']), null).p, 1));
t('nessuna briscola', () => assert.equal(E.trickWinnerEntry(T(['y2', 'r13', 'y3']), null).p, 2));

// Seguire il colore
function g4(hand, trick) { const g = E.newGame(3); g.round = 5; g.phase = 'play'; g.hands = [hand, [], []]; g.trick = trick; return g; }
t('devi seguire il colore se lo hai', () => {
  assert.deepEqual(E.legalCards(g4(['b3', 'r9', 'J1', 'W1'], T(['b5'])), 0).sort(), ['J1', 'W1', 'b3'].sort());
});
t('senza il colore puoi giocare tutto', () => {
  assert.equal(E.legalCards(g4(['g3', 'r9'], T(['b5'])), 0).length, 2);
});
t('dopo un Mago in apertura tutto è libero', () => {
  assert.equal(E.legalCards(g4(['b3', 'r9'], T(['W1'])), 0).length, 2);
});
t('dopo un Giullare il colore lo fissa la prima carta numerata', () => {
  assert.equal(E.legalCards(g4(['b3', 'r9'], T(['J1'])), 0).length, 2);
  assert.deepEqual(E.legalCards(g4(['b3', 'r9'], T(['J1', 'r2'])), 0), ['r9']);
});
t('Giullare poi Mago: libero', () => {
  assert.equal(E.legalCards(g4(['b3', 'r9'], T(['J1', 'W2'])), 0).length, 2);
});

// Punteggi
t('punteggi', () => {
  assert.equal(E.scoreFor(2, 2), 40);
  assert.equal(E.scoreFor(0, 0), 20);
  assert.equal(E.scoreFor(2, 1), -10);
  assert.equal(E.scoreFor(0, 3), -30);
});

// Briscola
t('briscola da carta girata', () => {
  for (let s = 1; s < 300; s++) {
    const g = E.newGame(4); E.startRound(g, seeded(s));
    if (E.isJester(g.trumpCard)) { assert.equal(g.trumpSuit, null); E.finishDeal(g); assert.equal(g.phase, 'bid'); }
    else if (E.isWizard(g.trumpCard)) { E.finishDeal(g); assert.equal(g.phase, 'trump'); assert.equal(g.turn, g.dealer); }
    else { assert.equal(g.trumpSuit, g.trumpCard[0]); }
  }
});
t('ultima mano senza briscola e senza mazzo residuo', () => {
  const g = E.newGame(4); g.round = 14; g.dealer = 0; E.startRound(g, seeded(9));
  assert.equal(g.round, 15); assert.equal(g.deckLeft, 0); assert.equal(g.trumpCard, null); assert.equal(g.trumpSuit, null);
});
t('la previsione parte dal vicino di sinistra del mazziere', () => {
  const g = E.newGame(4, { firstDealer: 2 }); E.startRound(g, seeded(3)); E.finishDeal(g);
  if (g.phase === 'trump') E.applyTrump(g, g.dealer, 'r');
  assert.equal(g.turn, 3);
});
t('il mazziere ruota in senso orario', () => {
  const g = E.newGame(3); E.startRound(g, seeded(1)); assert.equal(g.dealer, 0);
  g.phase = 'roundEnd'; E.nextRound(g, seeded(2)); assert.equal(g.dealer, 1);
});
t('variante ±1 vieta solo all\'ultimo il valore che pareggia', () => {
  const g = E.newGame(3, { plusMinus: true }); g.round = 4; g.phase = 'bid'; g.bids = [1, 1, null]; g.turn = 2; g.hands = [[], [], []]; g.dealer = 1;
  assert.equal(E.forbiddenBid(g), 2);
  assert.equal(E.applyBid(g, 2, 2).ok, false);
  assert.equal(E.applyBid(g, 2, 3).ok, true);
});
t('variante: se i precedenti superano già il totale nessun divieto', () => {
  const g = E.newGame(3, { plusMinus: true }); g.round = 2; g.phase = 'bid'; g.bids = [2, 1, null]; g.turn = 2;
  assert.equal(E.forbiddenBid(g), null);
});
t('senza variante nessun divieto', () => {
  const g = E.newGame(3); g.round = 4; g.phase = 'bid'; g.bids = [1, 1, null]; g.turn = 2;
  assert.equal(E.forbiddenBid(g), null);
});
t('rifiuta azioni fuori turno', () => {
  const g = E.newGame(3); E.startRound(g, seeded(5)); E.finishDeal(g);
  if (g.phase === 'trump') E.applyTrump(g, g.dealer, 'y');
  const wrong = (g.turn + 1) % 3;
  assert.equal(E.applyBid(g, wrong, 0).ok, false);
});

// Partite intere: invarianti
let games = 0;
for (const n of [3, 4, 5, 6]) for (const pm of [false, true]) for (let s = 1; s <= 60; s++) {
  const rng = seeded(s * 97 + n);
  const g = E.newGame(n, { plusMinus: pm, firstDealer: s % n });
  E.startRound(g, rng);
  let safety = 0;
  while (g.phase !== 'gameOver') {
    assert(++safety < 5000);
    if (g.phase === 'deal') {
      const all = g.hands.flat().concat(g.trumpCard ? [g.trumpCard] : []);
      assert.equal(new Set(all).size, all.length, 'carte duplicate');
      g.hands.forEach(h => assert.equal(h.length, g.round));
      E.finishDeal(g);
    } else if (g.phase === 'trump') {
      assert.equal(E.applyTrump(g, g.dealer, E.autoTrump(g, g.dealer)).ok, true);
    } else if (g.phase === 'bid') {
      const b = E.autoBid(g, g.turn);
      const r = E.applyBid(g, g.turn, b);
      assert.equal(r.ok, true, r.why + ' bid ' + b);
      if (g.phase === 'play' && pm) assert.notEqual(E.bidsSum(g), g.round, 'variante violata');
    } else if (g.phase === 'play') {
      const c = E.autoPlay(g, g.turn);
      assert(E.legalCards(g, g.turn).includes(c));
      const r = E.applyPlay(g, g.turn, c);
      assert.equal(r.ok, true, r.why);
    } else if (g.phase === 'trickEnd') {
      E.collectTrick(g);
    } else if (g.phase === 'roundEnd') {
      const h = g.history[g.history.length - 1];
      assert.equal(h.won.reduce((a, b) => a + b, 0), g.round);
      h.deltas.forEach((d, i) => assert.equal(d, E.scoreFor(h.bids[i], h.won[i])));
      E.nextRound(g, rng);
    }
  }
  assert.equal(g.history.length, E.totalRounds(n));
  const sum = g.history.reduce((acc, h) => acc.map((v, i) => v + h.deltas[i]), new Array(n).fill(0));
  assert.deepEqual(sum, g.scores);
  assert(E.winners(g).length >= 1);
  games++;
}
console.log(`OK: ${count} casi di regola, ${games} partite complete senza errori`);
