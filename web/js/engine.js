/* Motore di gioco: regole pure, nessun DOM e nessuna rete. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Engine = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var SUITS = ['y', 'r', 'g', 'b'];
  var SUIT_NAMES = { y: 'Giallo', r: 'Rosso', g: 'Verde', b: 'Blu' };

  function buildDeck() {
    var d = [];
    SUITS.forEach(function (s) {
      for (var v = 1; v <= 13; v++) d.push(s + v);
    });
    for (var i = 1; i <= 4; i++) { d.push('W' + i); d.push('J' + i); }
    return d;
  }
  function isWizard(c) { return c[0] === 'W'; }
  function isJester(c) { return c[0] === 'J'; }
  function isNumber(c) { return !isWizard(c) && !isJester(c); }
  function suitOf(c) { return isNumber(c) ? c[0] : null; }
  function valueOf(c) { return isNumber(c) ? parseInt(c.slice(1), 10) : 0; }
  function cardName(c) {
    if (isWizard(c)) return 'Mago';
    if (isJester(c)) return 'Giullare';
    return valueOf(c) + ' ' + SUIT_NAMES[suitOf(c)];
  }
  function totalRounds(n) { return Math.floor(60 / n); }

  function shuffle(a, rng) {
    var r = rng || Math.random;
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(r() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function fill(n, v) { var a = []; for (var i = 0; i < n; i++) a.push(v); return a; }

  /* Durata dell'animazione di distribuzione, uguale per host e client. */
  function dealStep(round, n) { return Math.min(110, Math.round(2300 / (round * n))); }
  function dealDuration(round, n) { return round * n * dealStep(round, n) + 1300; }

  function newGame(n, opts) {
    opts = opts || {};
    return {
      n: n,
      plusMinus: !!opts.plusMinus,
      firstDealer: opts.firstDealer || 0,
      round: 0,
      totalRounds: totalRounds(n),
      dealer: opts.firstDealer || 0,
      phase: 'idle',
      hands: [],
      trumpCard: null,
      trumpSuit: null,
      trumpChosen: false,
      deckLeft: 0,
      bids: fill(n, null),
      won: fill(n, 0),
      trick: [],
      leader: 0,
      turn: 0,
      trickWinner: null,
      scores: fill(n, 0),
      history: []
    };
  }

  function startRound(g, rng) {
    g.round += 1;
    if (g.round > 1) g.dealer = (g.dealer + 1) % g.n;
    var deck = shuffle(buildDeck(), rng);
    g.hands = [];
    for (var p = 0; p < g.n; p++) g.hands.push([]);
    var idx = 0;
    /* Si distribuisce a partire dal vicino di sinistra del mazziere. */
    for (var r = 0; r < g.round; r++) {
      for (var q = 1; q <= g.n; q++) {
        g.hands[(g.dealer + q) % g.n].push(deck[idx++]);
      }
    }
    g.deckLeft = 60 - idx;
    g.trumpCard = g.deckLeft > 0 ? deck[idx] : null;
    g.trumpSuit = g.trumpCard ? suitOf(g.trumpCard) : null;
    g.trumpChosen = false;
    g.bids = fill(g.n, null);
    g.won = fill(g.n, 0);
    g.trick = [];
    g.trickWinner = null;
    g.leader = (g.dealer + 1) % g.n;
    g.turn = g.leader;
    g.phase = 'deal';
    return g;
  }

  /* Fine dell'animazione: si passa alla scelta della briscola o alle previsioni. */
  function finishDeal(g) {
    if (g.phase !== 'deal') return g;
    if (g.trumpCard && isWizard(g.trumpCard)) {
      g.phase = 'trump';
      g.turn = g.dealer;
    } else {
      g.phase = 'bid';
      g.turn = (g.dealer + 1) % g.n;
    }
    return g;
  }

  function applyTrump(g, seat, suit) {
    if (g.phase !== 'trump') return { ok: false, why: 'Non è il momento di scegliere la briscola.' };
    if (seat !== g.dealer) return { ok: false, why: 'La briscola la sceglie il mazziere.' };
    if (SUITS.indexOf(suit) < 0) return { ok: false, why: 'Colore non valido.' };
    g.trumpSuit = suit;
    g.trumpChosen = true;
    g.phase = 'bid';
    g.turn = (g.dealer + 1) % g.n;
    return { ok: true };
  }

  function bidsPlaced(g) {
    return g.bids.filter(function (b) { return b !== null; }).length;
  }
  function bidsSum(g) {
    return g.bids.reduce(function (a, b) { return a + (b || 0); }, 0);
  }

  /* Variante "più o meno uno": l'ultimo a prevedere non può far tornare il totale. */
  function forbiddenBid(g) {
    if (!g.plusMinus || g.phase !== 'bid') return null;
    if (bidsPlaced(g) !== g.n - 1) return null;
    var f = g.round - bidsSum(g);
    return f >= 0 && f <= g.round ? f : null;
  }

  function applyBid(g, seat, n) {
    if (g.phase !== 'bid') return { ok: false, why: 'Non è il momento delle previsioni.' };
    if (seat !== g.turn) return { ok: false, why: 'Non è il tuo turno di prevedere.' };
    if (n !== Math.floor(n) || n < 0 || n > g.round) return { ok: false, why: 'Previsione non valida.' };
    if (forbiddenBid(g) === n) return { ok: false, why: 'Con la variante attiva il totale non può essere ' + g.round + '.' };
    g.bids[seat] = n;
    if (bidsPlaced(g) === g.n) {
      g.phase = 'play';
      g.leader = (g.dealer + 1) % g.n;
      g.turn = g.leader;
    } else {
      g.turn = (g.turn + 1) % g.n;
    }
    return { ok: true };
  }

  /* Colore da seguire nella presa in corso. free=true: si può giocare qualunque carta. */
  function leadInfo(trick) {
    for (var i = 0; i < trick.length; i++) {
      var c = trick[i].c;
      if (isJester(c)) continue;
      if (isWizard(c)) return { free: true, suit: null };
      return { free: false, suit: suitOf(c) };
    }
    return { free: true, suit: null };
  }

  function legalCards(g, seat) {
    var hand = g.hands[seat] || [];
    var lead = leadInfo(g.trick);
    if (lead.free) return hand.slice();
    var hasSuit = hand.some(function (c) { return suitOf(c) === lead.suit; });
    if (!hasSuit) return hand.slice();
    return hand.filter(function (c) { return suitOf(c) === lead.suit || !isNumber(c); });
  }

  /* Restituisce la voce vincente della presa (anche parziale). */
  function trickWinnerEntry(trick, trumpSuit) {
    var i, best = null;
    for (i = 0; i < trick.length; i++) if (isWizard(trick[i].c)) return trick[i];
    if (trumpSuit) {
      for (i = 0; i < trick.length; i++) {
        if (suitOf(trick[i].c) === trumpSuit && (!best || valueOf(trick[i].c) > valueOf(best.c))) best = trick[i];
      }
      if (best) return best;
    }
    var lead = leadInfo(trick);
    if (lead.suit) {
      for (i = 0; i < trick.length; i++) {
        if (suitOf(trick[i].c) === lead.suit && (!best || valueOf(trick[i].c) > valueOf(best.c))) best = trick[i];
      }
      if (best) return best;
    }
    return trick[0] || null; /* solo Giullari: vince il primo */
  }

  function applyPlay(g, seat, card) {
    if (g.phase !== 'play') return { ok: false, why: 'Non è il momento di giocare.' };
    if (seat !== g.turn) return { ok: false, why: 'Non è il tuo turno.' };
    var hand = g.hands[seat];
    var at = hand.indexOf(card);
    if (at < 0) return { ok: false, why: 'Questa carta non è nella tua mano.' };
    if (legalCards(g, seat).indexOf(card) < 0) return { ok: false, why: 'Devi seguire il colore richiesto.' };
    hand.splice(at, 1);
    g.trick.push({ p: seat, c: card });
    if (g.trick.length === g.n) {
      g.trickWinner = trickWinnerEntry(g.trick, g.trumpSuit).p;
      g.phase = 'trickEnd';
    } else {
      g.turn = (g.turn + 1) % g.n;
    }
    return { ok: true };
  }

  function scoreFor(bid, won) {
    return bid === won ? 20 + 10 * won : -10 * Math.abs(bid - won);
  }

  function scoreRound(g) {
    var deltas = [];
    for (var p = 0; p < g.n; p++) {
      var d = scoreFor(g.bids[p], g.won[p]);
      deltas.push(d);
      g.scores[p] += d;
    }
    g.history.push({
      round: g.round,
      dealer: g.dealer,
      trumpSuit: g.trumpSuit,
      bids: g.bids.slice(),
      won: g.won.slice(),
      deltas: deltas,
      totals: g.scores.slice()
    });
    g.phase = 'roundEnd';
  }

  function collectTrick(g) {
    if (g.phase !== 'trickEnd') return g;
    var w = g.trickWinner;
    g.won[w] += 1;
    g.trick = [];
    g.trickWinner = null;
    g.leader = w;
    g.turn = w;
    if (g.hands[w].length === 0) scoreRound(g);
    else g.phase = 'play';
    return g;
  }

  function nextRound(g, rng) {
    if (g.phase !== 'roundEnd') return g;
    if (g.round >= g.totalRounds) { g.phase = 'gameOver'; return g; }
    return startRound(g, rng);
  }

  function winners(g) {
    var top = Math.max.apply(null, g.scores);
    var w = [];
    g.scores.forEach(function (s, i) { if (s === top) w.push(i); });
    return w;
  }

  /* ---- Scelte automatiche: bot, tempo scaduto, giocatore disconnesso ---- */

  function autoTrump(g, seat) {
    var count = { y: 0, r: 0, g: 0, b: 0 };
    g.hands[seat].forEach(function (c) { var s = suitOf(c); if (s) count[s] += 1 + valueOf(c) / 13; });
    return SUITS.slice().sort(function (a, b) { return count[b] - count[a]; })[0];
  }

  function estimateTricks(g, seat) {
    var t = g.trumpSuit, est = 0;
    var crowd = 4 / g.n; /* più giocatori, carte alte meno sicure */
    g.hands[seat].forEach(function (c) {
      if (isWizard(c)) est += 0.95;
      else if (isJester(c)) est += 0;
      else if (suitOf(c) === t) est += valueOf(c) >= 10 ? 0.8 : valueOf(c) >= 6 ? 0.45 : 0.22;
      else if (valueOf(c) === 13) est += 0.6 * crowd;
      else if (valueOf(c) === 12) est += 0.38 * crowd;
      else if (valueOf(c) === 11) est += 0.18 * crowd;
    });
    return est;
  }

  function autoBid(g, seat) {
    var b = Math.min(g.round, Math.max(0, Math.round(estimateTricks(g, seat))));
    var forb = forbiddenBid(g);
    if (forb === b) b = b > 0 ? b - 1 : b + 1;
    if (b > g.round) b = g.round - 1;
    return b;
  }

  function power(c, trump) {
    if (isWizard(c)) return 100;
    if (isJester(c)) return -1;
    return (suitOf(c) === trump ? 30 : 0) + valueOf(c);
  }

  function wouldWin(g, seat, card) {
    return trickWinnerEntry(g.trick.concat([{ p: seat, c: card }]), g.trumpSuit).p === seat;
  }

  function autoPlay(g, seat) {
    var legal = legalCards(g, seat);
    var byPower = legal.slice().sort(function (a, b) { return power(a, g.trumpSuit) - power(b, g.trumpSuit); });
    var need = (g.bids[seat] || 0) - g.won[seat];
    var leading = g.trick.length === 0;
    if (need > 0) {
      if (leading) return byPower[byPower.length - 1];
      var win = byPower.filter(function (c) { return wouldWin(g, seat, c); });
      return win.length ? win[0] : byPower[0];
    }
    if (leading) return byPower[0];
    var lose = byPower.filter(function (c) { return !wouldWin(g, seat, c); });
    return lose.length ? lose[lose.length - 1] : byPower[0];
  }

  return {
    SUITS: SUITS, SUIT_NAMES: SUIT_NAMES,
    buildDeck: buildDeck, isWizard: isWizard, isJester: isJester, isNumber: isNumber,
    suitOf: suitOf, valueOf: valueOf, cardName: cardName, totalRounds: totalRounds, shuffle: shuffle,
    dealStep: dealStep, dealDuration: dealDuration,
    newGame: newGame, startRound: startRound, finishDeal: finishDeal, applyTrump: applyTrump,
    applyBid: applyBid, bidsPlaced: bidsPlaced, bidsSum: bidsSum, forbiddenBid: forbiddenBid,
    leadInfo: leadInfo, legalCards: legalCards, trickWinnerEntry: trickWinnerEntry, applyPlay: applyPlay,
    scoreFor: scoreFor, collectTrick: collectTrick, nextRound: nextRound, winners: winners,
    autoTrump: autoTrump, autoBid: autoBid, autoPlay: autoPlay, power: power
  };
});
