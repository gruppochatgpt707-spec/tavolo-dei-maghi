/* Il cast: un personaggio diverso per ogni carta, con ruolo, posa, abiti e oggetti. */
(function (root) {
  'use strict';
  var A = root.ART, P = A.PROPS, mix = A.mix, dark = A.dark, light = A.light, add = A.add;
  var SUITS = ['r', 'b', 'g', 'y'];
  var ELEM = { 1: 'r', 2: 'b', 3: 'g', 4: 'y' };

  /* Aspetto: genere, pelle, capelli, barba, età, corporatura, naso, espressione, rotazione del volto */
  var CAST = {
    r1: { g: 'm', sk: 3, hs: 'curly', hc: 'dbr', age: 'child', n: 'button', e: 'grin', t: 0.3 },
    b1: { g: 'f', sk: 0, hs: 'bob', hc: 'gin', age: 'child', n: 'button', e: 'laugh', t: -0.25, fr: 1 },
    g1: { g: 'm', sk: 5, hs: 'afro', hc: 'blk', age: 'child', n: 'round', e: 'grin', t: 0.35 },
    y1: { g: 'f', sk: 2, hs: 'braids', hc: 'blk', age: 'child', n: 'button', e: 'smirk', t: -0.3 },
    r2: { g: 'f', sk: 4, hs: 'bun', hc: 'blk', n: 'long', e: 'smile', t: 0.25 },
    b2: { g: 'm', sk: 1, hs: 'short', hc: 'bln', n: 'round', e: 'grin', t: -0.2 },
    g2: { g: 'f', sk: 2, hs: 'long', hc: 'aub', n: 'button', e: 'calm', t: 0.3 },
    y2: { g: 'm', sk: 6, hs: 'short', hc: 'gry', age: 'mid', n: 'round', e: 'smile', t: -0.25, bd: 'goatee' },
    r3: { g: 'f', sk: 3, hs: 'bun', hc: 'gry', age: 'old', n: 'hook', e: 'smile', t: 0.2, bw: 1.15 },
    b3: { g: 'm', sk: 1, hs: 'short', hc: 'dbr', bd: 'full', n: 'round', e: 'laugh', bw: 1.3, t: -0.2 },
    g3: { g: 'm', sk: 4, hs: 'curly', hc: 'blk', n: 'long', e: 'calm', t: 0.3 },
    y3: { g: 'f', sk: 0, hs: 'braid', hc: 'bln', n: 'button', e: 'smile', t: -0.3, fr: 1 },
    r4: { g: 'm', sk: 2, hs: 'bald', hc: 'dbr', bd: 'mustache', bw: 1.35, n: 'round', e: 'grin', t: 0.2 },
    b4: { g: 'f', sk: 5, hs: 'curly', hc: 'blk', bw: 1.25, n: 'round', e: 'laugh', t: -0.2 },
    g4: { g: 'm', sk: 0, hs: 'bald', hc: 'wht', bd: 'mustache', age: 'old', n: 'long', e: 'smile', bw: 1.1, t: 0.25 },
    y4: { g: 'f', sk: 3, hs: 'curly', hc: 'dbr', n: 'button', e: 'smile', t: -0.3 },
    r5: { g: 'f', sk: 1, hs: 'ponytail', hc: 'gin', n: 'button', e: 'determined', bw: 1.1, fr: 1, t: 0.2 },
    b5: { g: 'm', sk: 6, hs: 'short', hc: 'blk', n: 'round', e: 'determined', bw: 1.15, t: -0.25 },
    g5: { g: 'm', sk: 2, hs: 'curly', hc: 'blk', n: 'round', e: 'grin', bw: 1.3, t: 0.3 },
    y5: { g: 'f', sk: 4, hs: 'short', hc: 'blk', n: 'long', e: 'determined', bw: 1.05, t: -0.2 },
    r6: { g: 'm', sk: 3, hs: 'short', hc: 'blk', bd: 'full', age: 'mid', n: 'hook', e: 'smirk', t: 0.25 },
    b6: { g: 'f', sk: 0, hs: 'bun', hc: 'aub', n: 'long', e: 'smile', t: -0.3 },
    g6: { g: 'm', sk: 1, hs: 'short', hc: 'brn', bd: 'full', bw: 1.35, n: 'round', e: 'grin', t: 0.2 },
    y6: { g: 'f', sk: 5, hs: 'curly', hc: 'gry', age: 'old', n: 'round', e: 'smile', bw: 1.15, t: -0.25 },
    r7: { g: 'f', sk: 2, hs: 'long', hc: 'blk', n: 'button', e: 'laugh', t: 0.3 },
    b7: { g: 'm', sk: 4, hs: 'short', hc: 'dbr', bd: 'goatee', n: 'long', e: 'grin', t: -0.3 },
    g7: { g: 'm', sk: 0, hs: 'long', hc: 'bln', n: 'button', e: 'surprised', t: 0.25 },
    y7: { g: 'f', sk: 6, hs: 'afro', hc: 'blk', n: 'round', e: 'laugh', t: -0.2 },
    r8: { g: 'f', sk: 4, hs: 'braid', hc: 'blk', n: 'long', e: 'determined', t: 0.45 },
    b8: { g: 'f', sk: 1, hs: 'long', hc: 'gin', n: 'button', e: 'calm', fr: 1, t: -0.45 },
    g8: { g: 'f', sk: 3, hs: 'braid', hc: 'gry', age: 'old', n: 'hook', e: 'calm', t: 0.45 },
    y8: { g: 'f', sk: 0, hs: 'ponytail', hc: 'bln', n: 'button', e: 'smile', t: -0.45 },
    r9: { g: 'm', sk: 5, hs: 'short', hc: 'gry', bd: 'full', age: 'mid', n: 'round', e: 'calm', t: 0.2 },
    b9: { g: 'f', sk: 2, hs: 'short', hc: 'blk', n: 'long', e: 'determined', t: -0.25 },
    g9: { g: 'm', sk: 0, hs: 'curly', hc: 'gin', n: 'button', e: 'smile', fr: 1, t: 0.25 },
    y9: { g: 'm', sk: 3, hs: 'bald', hc: 'brn', bd: 'long', bw: 1.3, n: 'round', e: 'grin', t: -0.2 },
    r10: { g: 'f', sk: 1, hs: 'bun', hc: 'wht', age: 'old', n: 'hook', e: 'grin', t: 0.3 },
    b10: { g: 'm', sk: 3, hs: 'short', hc: 'blk', n: 'long', e: 'surprised', glasses: 1, t: -0.25 },
    g10: { g: 'm', sk: 4, hs: 'bald', hc: 'wht', bd: 'long', age: 'old', n: 'long', e: 'smile', t: 0.25 },
    y10: { g: 'f', sk: 5, hs: 'curly', hc: 'blk', n: 'button', e: 'grin', t: -0.3 },
    r11: { g: 'm', sk: 0, hs: 'short', hc: 'gry', age: 'mid', n: 'long', e: 'calm', bw: 0.85, t: 0.3 },
    b11: { g: 'm', sk: 5, hs: 'short', hc: 'wht', age: 'old', n: 'round', e: 'smile', bd: 'goatee', t: -0.2 },
    g11: { g: 'f', sk: 2, hs: 'bun', hc: 'dbr', n: 'long', e: 'calm', t: 0.25 },
    y11: { g: 'm', sk: 3, hs: 'short', hc: 'blk', bd: 'mustache', n: 'hook', e: 'smirk', bw: 1.1, t: -0.3 },
    r12: { g: 'f', sk: 4, hs: 'long', hc: 'blk', n: 'long', e: 'calm', t: 0.2 },
    b12: { g: 'f', sk: 0, hs: 'bun', hc: 'wht', age: 'old', n: 'hook', e: 'smile', t: -0.2 },
    g12: { g: 'f', sk: 6, hs: 'afro', hc: 'blk', n: 'round', e: 'smile', t: 0.15 },
    y12: { g: 'f', sk: 1, hs: 'wavy', hc: 'gin', n: 'button', e: 'smile', fr: 1, t: -0.25 },
    r13: { g: 'm', sk: 2, hs: 'short', hc: 'wht', bd: 'long', age: 'old', n: 'hook', e: 'calm', t: 0.2 },
    b13: { g: 'm', sk: 5, hs: 'short', hc: 'blk', bd: 'full', n: 'round', e: 'smile', t: -0.2 },
    g13: { g: 'm', sk: 1, hs: 'curly', hc: 'brn', n: 'button', e: 'smile', t: 0.2 },
    y13: { g: 'm', sk: 3, hs: 'bald', hc: 'gry', bd: 'full', bw: 1.4, n: 'round', e: 'laugh', t: -0.2 },
    W1: { g: 'f', sk: 1, hs: 'long', hc: 'wht', age: 'old', n: 'hook', e: 'grin', t: 0 },
    W2: { g: 'm', sk: 5, hs: 'short', hc: 'blk', n: 'button', e: 'calm', t: 0.15 },
    W3: { g: 'm', sk: 3, hs: 'long', hc: 'gry', bd: 'long', age: 'old', n: 'long', e: 'smile', t: -0.15 },
    W4: { g: 'f', sk: 6, hs: 'bun', hc: 'blk', age: 'mid', n: 'round', e: 'smile', t: 0.1 },
    J1: { g: 'm', sk: 2, hs: 'short', hc: 'dbr', n: 'long', e: 'wink', t: 0 },
    J2: { g: 'f', sk: 4, hs: 'bob', hc: 'blk', n: 'button', e: 'wink', t: 0 },
    J3: { g: 'm', sk: 0, hs: 'curly', hc: 'gin', n: 'round', e: 'wink', fr: 1, t: 0 },
    J4: { g: 'f', sk: 5, hs: 'short', hc: 'blk', n: 'round', e: 'smirk', t: 0 }
  };

  function arm(a1, a2, hand, behind) { return { a1: a1, a2: a2, hand: hand || 'fist', behind: !!behind }; }
  function leg(a1, a2) { return { a1: a1, a2: a2 }; }

  /* Ruoli: abiti, posa e oggetti. v = indice del seme, per variare le pose */
  var ROLES = {
    1: function (v, P, c) {
      return { child: true, H: 430, base: 770, garment: { type: 'tunic', main: P.cloth[v % 2 ? 2 : 0], accent: P.accent, trousers: '#6b5a44', boots: '#5a3a24', belt: '#6b4a2a', hem: 1.1, sleeves: 'short', patch: 1, barefoot: v === 2 },
        pose: { tilt: -6, legs: [leg(48, -12), leg(8, 22)], arms: [arm(22, -62), arm(70, 110, 'open')], headTilt: 8 },
        props: { under: [P_.loafUnder, null] }, hat: v === 3 ? { type: 'none' } : { type: 'none' }, mirror: v % 2 === 1, airborne: true };
    },
    2: function (v, P) {
      return { garment: { type: v === 2 ? 'dress' : 'tunic', main: P.cloth[0], accent: P.accent, trim: P.accent2, trousers: dark(P.cloth[3], 0.1), boots: '#6b4426', belt: '#5a3a24' },
        pose: { legs: [leg(12, 5), leg(3, -2)], arms: [arm(14, -28), arm(58, 78)] },
        props: { body: P_.bag(0, '#8a5a30'), hand: [null, P_.letter] }, hat: { type: 'cap', color: P.cloth[3], accent: P.accent2 }, mirror: v % 2 === 0 };
    },
    3: function (v, P, c) {
      var basket = { r: 'fruit', g: 'mushroom', y: 'flowers', b: 'fish' }[SUITS[v]];
      if (SUITS[v] === 'b') return { garment: { type: 'tunic', main: P.cloth[1], accent: P.accent, trousers: '#5a5248', boots: '#3a3028', belt: '#6b4a2a', sleeves: 'short' },
        pose: { legs: [leg(10, 4), leg(8, 3)], arms: [arm(28, 158, 'fist'), arm(42, -64)] }, props: { back: P_.net(0) }, hat: { type: 'kerchief', color: P.accent, accent: '#f6e6c0' } };
      return { garment: { type: c.g === 'f' ? 'dress' : 'tunic', main: P.cloth[v % 2 ? 0 : 2], accent: P.accent, trousers: dark(P.cloth[3], 0.1), apron: '#efe2c4', belt: c.g === 'f' ? null : '#5a3a24' },
        pose: { legs: [leg(7, 3), leg(7, 3)], arms: [arm(16, -56), arm(16, -56)] }, props: { front: P_.basket(basket, P.accent2, P.cloth[1]) },
        hat: c.g === 'f' ? { type: 'kerchief', color: P.accent, accent: '#f6e6c0' } : { type: 'none' } };
    },
    4: function (v, P, c) {
      return { flour: true, garment: { type: c.g === 'f' ? 'dress' : 'tunic', main: P.cloth[v % 2 ? 2 : 1], accent: P.accent, trousers: '#6b5a44', apron: '#f7efdc', apronPocket: 1, belt: null, sleeves: 'short' },
        pose: { legs: [leg(8, 3), leg(8, 3)], arms: [arm(18, -52, 'fist'), arm(18, -52, 'fist')], headTilt: v % 2 ? -4 : 4 },
        props: { front: P_.basket('bread') }, hat: c.g === 'f' ? { type: 'kerchief', color: '#f7efdc', accent: P.accent } : { type: 'toque', color: '#fbf6ea' } };
    },
    5: function (v, P) {
      return { garment: { type: 'tunic', main: P.cloth[3], accent: P.accent, trousers: '#5a4a3a', boots: '#3a2a1e', apron: '#7a4a28', belt: '#4a2a18', sleeves: 'short' },
        pose: { legs: [leg(14, 6), leg(10, 4)], arms: [arm(140, 168), arm(18, 8)], tilt: 4 },
        props: { hand: [P_.hammer, P_.tongs] }, hat: { type: 'none' }, mirror: v % 2 === 1 };
    },
    6: function (v, P, c) {
      return { garment: { type: c.g === 'f' ? 'dress' : 'robe', main: P.cloth[0], second: P.cloth[2], accent: P.accent2, trim: P.accent, belt: '#e2b04a', sleeves: 'bell' },
        pose: { legs: [leg(6, 3), leg(6, 3)], arms: [arm(34, -66, 'open'), arm(42, 168)] },
        props: { hand: [P_.cloth(P.accent, P.accent2), P_.scale] }, hat: c.g === 'f' ? { type: 'none' } : { type: 'turban', color: P.accent2, accent: P.accent }, mirror: v % 2 === 1 };
    },
    7: function (v, P) {
      return { garment: { type: 'tunic', main: P.cloth[2], accent: P.accent, trim: P.accent2, trousers: P.accent, boots: '#6b4426', belt: '#5a3a24', sleeves: 'puffy', cape: { color: P.accent, lining: P.accent2, wind: 30 } },
        pose: { legs: [leg(12, 6), leg(2, -4)], arms: [arm(48, 72, 'open'), arm(14, -72, 'open')], headTilt: -8 },
        props: { mid: P_.lute('#c98a3a') }, hat: { type: 'feather', color: P.cloth[3], accent: P.accent2, feather: v === 1 ? '#e39a3a' : '#f3e6c8' }, mirror: v % 2 === 0 };
    },
    8: function (v, P, c) {
      return { garment: { type: 'tunic', main: P.cloth[3], accent: P.accent, trousers: '#6b5a44', boots: '#5a3a24', belt: '#5a3a24', hem: 1.15 },
        pose: { legs: [leg(12, 6), leg(4, 2)], arms: [arm(118, -96, 'open'), arm(10, -22)], headTilt: -4 },
        props: { back: P_.bowBack }, hat: c.age === 'old' ? { type: 'hood', color: P.cloth[1] } : { type: 'none' }, mirror: v % 2 === 1, face: { look: 1 } };
    },
    9: function (v, P) {
      return { garment: { type: 'armor', main: P.cloth[0], accent: P.accent2, boots: '#5f646b', cape: { color: dark(P.cloth[0], 0.2), lining: P.accent, wind: 10 } },
        pose: { legs: [leg(10, 4), leg(10, 4)], arms: [arm(16, -28), arm(18, -52)] },
        props: { hand: [P_.helmet(P.accent), P_.sword] }, hat: { type: 'none' }, mirror: v % 2 === 0 };
    },
    10: function (v, P, c) {
      var liq = ['#8fd06a', '#e86a5a', '#c08ae8', '#6ac8e8'][v];
      return { garment: { type: 'robe', main: P.cloth[1], accent: P.accent, trim: P.accent2, belt: '#5a3a24', sleeves: 'long', apron: '#d8c49a' },
        pose: { legs: [leg(6, 3), leg(6, 3)], arms: [arm(128, 164), arm(16, -46)] },
        props: { hand: [P_.flask(liq), v % 2 ? P_.book('#7a2a2a') : P_.flask(['#f4c860', '#8fd06a', '#e86a5a', '#c08ae8'][v], false)] },
        hat: { type: 'goggles', lens: liq }, mirror: v % 2 === 1, face: { glasses: c.glasses } };
    },
    11: function (v, P) {
      return { garment: { type: 'robe', main: P.cloth[3], second: P.cloth[0], panel: 1, accent: P.accent2, trim: P.accent2, belt: P.accent, sleeves: 'bell' },
        pose: { legs: [leg(5, 2), leg(5, 2)], arms: [arm(22, -62), arm(22, -62)], headTilt: 6 },
        props: { front: P_.scroll }, hat: { type: 'tall', color: P.cloth[3], accent: P.accent2 } };
    },
    12: function (v, P, c) {
      return { garment: { type: 'dress', main: P.cloth[0], second: P.cloth[2], accent: '#e3b24a', trim: '#e3b24a', belt: '#e3b24a', sleeves: 'bell', cape: { color: P.cloth[3], lining: light(P.cloth[2], 0.3), wind: 16 } },
        pose: { legs: [leg(5, 2), leg(5, 2)], arms: [arm(18, -38), arm(36, -70, 'open')], headTilt: -5 },
        props: { hand: [P_.scepter(P.accent), null] }, hat: { type: 'crown', accent: P.accent }, mirror: v % 2 === 0 };
    },
    13: function (v, P) {
      return { garment: { type: 'robe', main: P.cloth[0], accent: '#e3b24a', trim: '#e3b24a', belt: '#e3b24a', fur: 1, cape: { color: dark(P.cloth[0], 0.15), lining: '#f4ecdc', wind: 8 } },
        pose: { legs: [leg(6, 3), leg(6, 3)], arms: [arm(20, -40), arm(68, 30, 'open')] },
        props: { back: P_.throne(1, P.accent) }, hat: { type: 'kingCrown', accent: P.accent }, bw: 1.15, mirror: v % 2 === 1, cx: 270 };
    },
    W: function (n, P) {
      var E = [null,
        { arms: [arm(34, -62, 'open'), arm(34, -62, 'open')], el: 'fire', at: function (F) { return [F.cx, F.pelY - 1.05 * F.u]; }, s: 0.62, hat: { type: 'wizard', color: '#3b2366', accent: '#e3b24a', bend: 1 } },
        { arms: [arm(18, -6), arm(150, 172, 'open')], el: 'water', at: function (F) { return add(F.wr[1], [0, -0.85 * F.u]); }, s: 0.5, hood: '#2e2258', staff: 0 },
        { arms: [arm(74, 104, 'open'), arm(74, 104, 'open')], el: 'nature', at: function (F) { return [F.cx, F.headC[1] - 1.7 * F.u]; }, s: 0.75, hat: { type: 'leaves' } },
        { arms: [arm(162, 178, 'open'), arm(28, 34, 'open')], el: 'light', at: function (F) { return add(F.wr[0], [0, -0.75 * F.u]); }, s: 0.55, hat: { type: 'wizard', color: '#3a2a6a', accent: '#e3b24a', bend: -1 } }
      ][n];
      var robe = [null, '#5B3A8C', '#3f2a6e', '#7a5aa8', '#4a2f70'][n];
      var g = { type: 'robe', main: robe, accent: P.accent2, trim: '#d8c9ff', belt: '#e3b24a', sleeves: 'bell', cape: n === 1 || n === 4 ? { color: dark(robe, 0.35), lining: '#d8c9ff', wind: 24 } : null };
      var props = { front: function (F) { return A.PROPS[E.el](E.at(F), E.s * F.u * 1.6); } };
      if (n === 2) props.hand = [P_.staff(function (top, u) { return '<circle cx="' + A.f(top[0]) + '" cy="' + A.f(top[1]) + '" r="' + A.f(0.22 * u) + '" fill="#bfe6ff" stroke="#3a2414" stroke-width="2.4"/>'; }), null];
      return { H: 500, base: 815, garment: g, pose: { legs: [leg(8, 4), leg(8, 4)], arms: E.arms, headTilt: n === 3 ? -6 : 0 }, props: props, hat: E.hat || { type: 'none' }, hood: E.hood, element: E.el, face: n === 4 ? { look: -0.5, brows: 'up' } : {} };
    },
    J: function (n, P) {
      var Q = { cloth: [[null, '#f1ece2', '#2b272b', '#f1ece2', '#2b272b'][n], 0, 0, '#1f1c1f'], accent2: '#d4af37', main: '#2b272b' };
      var alt = [null, '#2b272b', '#f1ece2', '#8a8490', '#f1ece2'][n];
      var arms = [
        [arm(42, 150, 'open'), arm(42, 150, 'open')],
        [arm(48, -64), arm(118, 152)],
        [arm(46, -62), arm(150, 170, 'open')],
        [arm(52, -66), arm(104, 130, 'open')]
      ][n - 1];
      var props = [{ front: P_.balls([Q.accent2, alt, '#f4ecdc']) }, { hand: [null, P_.marotte(alt, Q.main)] }, { hand: [null, P_.tambourine] }, {}][n - 1];
      return { H: 505, base: 815, garment: { type: 'tunic', pattern: 'diamond', main: Q.cloth[0], second: alt, accent: '#f2c442', trim: '#f2c442', trousers: alt, boots: Q.cloth[3], bellsShoes: 1, sleeves: 'puffy', sleeveColor: alt, hem: 1.0, neckline: 'round' },
        pose: { tilt: 7, headTilt: -14, legs: [leg(-12, -26), leg(12, 6)], arms: arms }, props: props,
        hat: { type: 'jester', color: Q.cloth[0], second: alt, accent: '#f2c442', bells: '#f2c442' }, mirror: n % 2 === 0, face: { turn: 0, winkSide: 1, brows: 'sly' } };
    }
  };
  var P_ = P;

  function build(id) {
    var c = CAST[id], special = id[0] === 'W' || id[0] === 'J';
    var suit = special ? (id[0] === 'W' ? 'w' : 'j') : id[0], v = special ? 0 : SUITS.indexOf(suit), rank = special ? 0 : +id.slice(1);
    var Pal = A.PAL[suit];
    var role = special ? ROLES[id[0]](+id[1], Pal, c) : ROLES[rank](v, Pal, c);
    var female = c.g === 'f';
    var sp = {
      cx: role.cx || 300, base: role.base || 812, H: role.H || 540, child: !!role.child,
      bw: (role.bw || 1) * (c.bw || 1), waist: female ? 0.84 : 1, hip: female ? 1.08 : 1,
      skin: A.SKIN[c.sk], age: c.age === 'old' ? 'old' : c.age,
      hair: { style: c.hs, color: A.HAIR[c.hc], len: c.hs === 'wavy' ? 1.9 : 1.5, side: 1 },
      beard: c.bd ? { style: c.bd === 'mustache' ? 'mustache' : c.bd, color: A.HAIR[c.bc || c.hc] } : null,
      face: Object.assign({ nose: c.n, expr: c.e, turn: c.t || 0, freckles: c.fr, lids: c.age === 'mid', thickBrows: c.g === 'm' && c.age !== 'child', glasses: c.glasses }, role.face || {}),
      lashes: female && c.age !== 'child',
      garment: role.garment, hat: role.hat, pose: role.pose, props: role.props, mirror: !!role.mirror, flour: role.flour, hood: role.hood
    };
    if (sp.hair.style === 'wavy') sp.hair.style = 'long';
    if (sp.beard && sp.beard.style === 'mustache') sp.beard = { style: 'goatee', color: sp.beard.color, mustache: true, only: true };
    return { sp: sp, suit: suit, v: v, rank: rank, special: special, role: role };
  }

  A.card = function (id) {
    A.uid = 0;
    var seed = A.hash(id), r = A.rng(seed), b = build(id);
    var idx = b.special ? +id[1] : b.rank;
    var sunLeft = ((idx + b.v) % 2 === 0);
    var motifSide = r() < 0.5 ? -1 : 1;
    if (b.sp.mirror) motifSide = -motifSide;
    var sc = A.scene(b.suit, r, { sunLeft: sunLeft, motifSide: motifSide, variant: idx % 3 });
    var sunWorld = A.norm([sc.sun[0] - 300, sc.sun[1] - 470]);
    var fig = A.figure(b.sp, sunWorld);
    var F = fig.F;
    var footW = 0.9 * F.u * F.bw;
    var shadowBase = b.role.airborne ? b.sp.base + 50 : b.sp.base;
    var out = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900" width="600" height="900">' + A.defs(seed);
    out += '<g filter="url(#rough)">' + sc.back + '</g>';
    out += sc.shadow(b.sp.cx, shadowBase, footW);
    if (b.special && b.role.element) out += '<rect width="600" height="900" fill="' + { fire: '#ff7a2a', water: '#4fa0ff', nature: '#8fe07a', light: '#ffe27a' }[b.role.element] + '" opacity=".12" style="mix-blend-mode:screen"/>';
    /* luce calda radente dal lato del sole */
    var wid = 'wl' + (A.uid++);
    out += '<linearGradient id="' + wid + '" x1="' + (sunLeft ? 0 : 1) + '" y1="0" x2="' + (sunLeft ? 1 : 0) + '" y2="0"><stop offset="0" stop-color="#ffb860" stop-opacity=".0"/><stop offset=".35" stop-color="#ffb860" stop-opacity=".0"/><stop offset="1" stop-color="#2a1840" stop-opacity=".0"/></linearGradient>';
    out += fig.svg;
    out += '<rect width="600" height="900" fill="#ffb45a" opacity=".07" style="mix-blend-mode:soft-light"/>';
    out += '<g filter="url(#rough)">' + sc.fore + '</g>';
    out += A.paper();
    out += '</svg>';
    /* identificativi unici per carta, così più carte convivono nella stessa pagina */
    var pre = id + '-';
    return out.replace(/id="([^"]+)"/g, 'id="' + pre + '$1"').replace(/url\(#([^)]+)\)/g, 'url(#' + pre + '$1)').replace(/href="#([^"]+)"/g, 'href="#' + pre + '$1"');
  };
  A.cardHead = function (id) {
    var b = build(id), F = A.skeleton(b.sp), c = F.headC;
    return { x: b.sp.mirror ? 2 * b.sp.cx - c[0] : c[0], y: c[1], u: F.u };
  };
  A.CAST = CAST;
  A.cardIds = function () {
    var ids = [];
    SUITS.forEach(function (s) { for (var v = 1; v <= 13; v++) ids.push(s + v); });
    for (var i = 1; i <= 4; i++) { ids.push('W' + i); ids.push('J' + i); }
    return ids;
  };
})(typeof self !== 'undefined' ? self : this);
