/* Il personaggio: scheletro, vestiti, testa e volto, capelli, cappelli. Proporzioni da libro illustrato, mani grandi. */
(function (root) {
  'use strict';
  var A = root.ART, f = A.f, mix = A.mix, dark = A.dark, light = A.light, add = A.add, sub = A.sub, mul = A.mul, lerp2 = A.lerp2, norm = A.norm, perp = A.perp;

  function S(pts, fill, o) { o = o || {}; o.fill = fill; return A.shape(pts, o); }
  function dirv(a, s) { var r = a * Math.PI / 180; return [s * Math.sin(r), Math.cos(r)]; }
  function circle(c, r, fill, o) { return S(A.ellipsePts(c, r, r, 10), fill, o); }

  A.SKIN = ['#F3D2BA', '#E8B996', '#D69E76', '#BE8257', '#9C6440', '#78482B', '#56331E'];
  A.HAIR = { blk: '#211712', dbr: '#3d2617', brn: '#6b4024', aub: '#8f3d1f', gin: '#c4622a', bln: '#dcb562', gry: '#a19b94', wht: '#ece7dd' };

  A.skeleton = function (sp) {
    var u = sp.H / 8.2, hs = sp.child ? 1.28 : 1.12, bw = sp.bw || 1, cx = sp.cx, base = sp.base;
    var legLen = (sp.child ? 3.0 : 3.75) * u;
    var pelY = base - 0.2 * u - legLen * 0.98;
    var tilt = (sp.pose && sp.pose.tilt) || 0, pel = [cx, pelY];
    var P = function (dx, dy) { return A.rot([cx + dx, pelY + dy], pel, tilt); };
    var F = { u: u, hs: hs, bw: bw, cx: cx, base: base, pelY: pelY, P: P, legLen: legLen, sp: sp, s: [-1, 1] };
    var pose = sp.pose || {}, legs = pose.legs || [{ a1: 6, a2: 3 }, { a1: 6, a2: 3 }], arms = pose.arms || [{ a1: 12, a2: 6 }, { a1: 12, a2: 6 }];
    F.hip = []; F.knee = []; F.ankle = []; F.sh = []; F.el = []; F.wr = []; F.hd = []; F.arms = arms; F.legs = legs;
    for (var i = 0; i < 2; i++) {
      var s = F.s[i];
      F.hip[i] = [cx + s * 0.4 * u * bw, pelY];
      F.knee[i] = add(F.hip[i], mul(dirv(legs[i].a1, s), legLen * 0.52));
      F.ankle[i] = add(F.knee[i], mul(dirv(legs[i].a2, s), legLen * 0.47));
      F.sh[i] = P(s * 0.9 * u * bw, -2.45 * u * (sp.child ? 0.86 : 1));
      F.el[i] = add(F.sh[i], mul(dirv(arms[i].a1, s), (sp.child ? 1.2 : 1.42) * u));
      F.wr[i] = add(F.el[i], mul(dirv(arms[i].a2, s), (sp.child ? 1.1 : 1.3) * u));
      F.hd[i] = dirv(arms[i].a2, s);
    }
    var torsoTop = sp.child ? -2.1 * u : -2.72 * u;
    F.neck = P(0, torsoTop);
    F.headC = A.rot(P(0, torsoTop - 0.82 * u * hs), F.neck, pose.headTilt || 0);
    F.hw = 0.56 * u * hs * ((sp.face && sp.face.w) || 1);
    F.torsoTop = torsoTop;
    return F;
  };

  /* ---------- Mani ---------- */
  A.hand = function (F, i, type, skin) {
    var u = F.u, s = F.s[i], w = F.wr[i], d = F.hd[i], ang = Math.atan2(d[0], d[1]) * -180 / Math.PI;
    var k = 1.05 * u * (F.sp.handScale || 1), inner = -s;
    var T = function (x, y) { return add(w, A.rot([x * k, y * k], [0, 0], ang)); };
    var out = '';
    if (type === 'open') {
      out += S([T(-0.24, 0), T(-0.3, 0.24), T(-0.28, 0.5), T(-0.16, 0.66), T(0, 0.7), T(0.16, 0.64), T(0.27, 0.44), T(0.27, 0.12), T(0.2, -0.02)], skin, { k: 4, rim: 2, ink: 2.8 });
      out += A.inkLine([T(-0.08, 0.45), T(-0.07, 0.64)], 1.6, 3) + A.inkLine([T(0.07, 0.43), T(0.08, 0.62)], 1.6, 4);
      out += S([T(inner * 0.18, 0.08), T(inner * 0.38, 0.2), T(inner * 0.44, 0.38), T(inner * 0.34, 0.42), T(inner * 0.18, 0.28)], skin, { k: 3, rim: 1.5, ink: 2.4 });
    } else if (type === 'point') {
      out += S([T(-0.24, 0), T(-0.28, 0.24), T(-0.22, 0.46), T(0.2, 0.46), T(0.27, 0.22), T(0.2, -0.02)], skin, { k: 4, rim: 2, ink: 2.8 });
      out += S([T(-0.06, 0.4), T(-0.08, 0.86), T(0.04, 0.9), T(0.08, 0.42)], skin, { k: 2, rim: 1.5, ink: 2.4 });
    } else {
      out += S([T(-0.25, -0.02), T(-0.31, 0.2), T(-0.27, 0.44), T(0, 0.52), T(0.27, 0.44), T(0.31, 0.2), T(0.24, -0.02)], skin, { k: 4, rim: 2, ink: 2.8 });
      out += A.inkLine([T(-0.14, 0.28), T(-0.12, 0.48)], 1.6, 5) + A.inkLine([T(0.02, 0.3), T(0.02, 0.5)], 1.6, 6) + A.inkLine([T(0.16, 0.28), T(0.15, 0.46)], 1.6, 7);
      out += S([T(inner * 0.2, 0.06), T(inner * 0.34, 0.22), T(inner * 0.1, 0.36), T(inner * 0.02, 0.28)], skin, { k: 3, rim: 1.2, ink: 2.2 });
    }
    if (F.sp.flour) out += '<g opacity=".8">' + [0.2, 0.35, 0.5].map(function (t, n) { var p = T((n - 1) * 0.12, t); return '<circle cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="' + f(3 + n) + '" fill="#fbf6ea"/>'; }).join('') + '</g>';
    return out;
  };

  /* ---------- Braccia ---------- */
  A.arm = function (F, i, g) {
    var u = F.u, sh = F.sh[i], el = F.el[i], wr = F.wr[i], bw = F.bw, skin = F.sp.skin, out = '';
    var sleeve = g.sleeves || 'long', col = g.sleeveColor || g.main, end = lerp2(el, wr, 0.86);
    if (g.type === 'armor') {
      out += S(A.limb(sh, el, end, 0.3 * u * bw, 0.25 * u, 0.24 * u), '#8d939a', { k: 6, ink: 3.2 });
      out += S(A.capsule(lerp2(el, wr, 0.25), end, 0.27 * u, 0.26 * u), '#a7adb3', { k: 4, ink: 2.8 });
      out += S(A.ellipsePts(el, 0.21 * u, 0.19 * u, 9), '#b7bcc1', { k: 3, ink: 2.6 });
    } else if (sleeve === 'short') {
      out += S(A.limb(lerp2(sh, el, 0.3), el, wr, 0.21 * u, 0.18 * u, 0.15 * u), skin, { k: 5, ink: 3 });
      out += S(A.capsule(sh, lerp2(sh, el, 0.6), 0.35 * u * bw, 0.28 * u), col, { k: 7, ink: 3.2, inner: function () { return '<path d="' + A.path([lerp2(sh, el, 0.55), lerp2(sh, el, 0.62)], false) + '" stroke="' + (g.trim || g.accent) + '" stroke-width="' + f(0.6 * u) + '"/>'; } });
    } else {
      var puff = sleeve === 'puffy' ? 1.32 : 1, bell = sleeve === 'bell' ? 1.55 : 1;
      var sl = A.limb(sh, el, end, 0.32 * u * bw * puff, 0.25 * u * (puff > 1 ? 1.12 : 1), 0.23 * u * bell);
      out += S(sl, col, { k: 7, ink: 3.3, inner: function () {
        return '<path d="' + A.path([lerp2(el, wr, 0.74), lerp2(el, wr, 0.9)], false) + '" stroke="' + (g.trim || g.accent) + '" stroke-width="' + f(0.6 * u * bell) + '"/>' +
          A.inkLine([lerp2(sh, el, 0.45), lerp2(sh, el, 0.85)], 1.8, i + 31, dark(col, 0.45)) + A.inkLine([lerp2(el, wr, 0.2), lerp2(el, wr, 0.6)], 1.6, i + 33, dark(col, 0.45));
      } });
    }
    return out;
  };

  /* ---------- Gambe e calzature ---------- */
  A.legsSVG = function (F, g) {
    var u = F.u, bw = F.bw, out = '', tr = g.trousers || dark(g.main, 0.25), boot = g.boots || '#5a3a24';
    var covered = g.type === 'robe' || g.type === 'dress';
    for (var i = 0; i < 2; i++) {
      var s = F.s[i], h = F.hip[i], k = F.knee[i], a = F.ankle[i];
      if (!covered) {
        var legCol = g.type === 'armor' ? '#8d939a' : tr;
        out += S(A.limb(h, k, a, 0.37 * u * bw, 0.26 * u, 0.2 * u), legCol, { k: 7, ink: 3.2, inner: function () { return A.inkLine([lerp2(h, k, 0.3), lerp2(h, k, 0.8)], 1.6, i + 70, dark(legCol, 0.4)); } });
        if (g.type === 'armor') out += circle(k, 0.2 * u, '#b7bcc1', { k: 4, ink: 2.6 }) + S(A.capsule(lerp2(k, a, 0.2), lerp2(k, a, 0.85), 0.24 * u, 0.21 * u), '#a7adb3', { k: 4, ink: 2.6 });
        if (g.patch && i === 0) out += S(A.ellipsePts(lerp2(h, k, 0.75), 0.13 * u, 0.11 * u, 6, 15), light(tr, 0.3), { k: 2, rim: 0, ink: 1.8 });
        if (!g.barefoot) out += S(A.capsule(lerp2(k, a, 0.42), a, 0.255 * u, 0.225 * u), boot, { k: 5, ink: 3, inner: function () { return '<path d="' + A.path([lerp2(k, a, 0.42), lerp2(k, a, 0.5)], false) + '" stroke="' + light(boot, 0.25) + '" stroke-width="' + f(0.6 * u) + '"/>'; } });
      }
      var shin = norm(sub(a, k)), up = Math.abs(shin[0]) > 0.7;
      var foot = up ? [add(a, [-0.15 * u, -0.1 * u]), add(a, [0.15 * u, -0.1 * u]), add(a, mul(shin, 0.42 * u)), add(add(a, mul(shin, 0.38 * u)), [0, 0.14 * u])]
        : [[a[0] - s * 0.17 * u, a[1] - 0.06 * u], [a[0] + s * 0.14 * u, a[1] - 0.07 * u], [a[0] + s * 0.44 * u, a[1] + 0.08 * u], [a[0] + s * 0.4 * u, a[1] + 0.2 * u], [a[0] - s * 0.19 * u, a[1] + 0.2 * u]];
      out += S(foot, g.barefoot ? F.sp.skin : boot, { k: 4, ink: 3 });
      if (g.bellsShoes) { var tip = foot[2]; out += circle(add(tip, [s * 4, -6]), 6, '#f2c442', { k: 2, ink: 1.8 }); }
    }
    return out;
  };

  /* ---------- Busto e abito ---------- */
  A.torso = function (F, g) {
    var u = F.u, P = F.P, bw = F.bw, sp = F.sp, out = '';
    var sw = 0.9 * u * bw, ww = 0.68 * u * bw * (sp.waist || 1), hp = 0.78 * u * bw * (sp.hip || 1), top = F.torsoTop;
    var hemY, hemW;
    if (g.type === 'robe') { hemY = F.legLen * 0.97; hemW = hp * 1.55; }
    else if (g.type === 'dress') { hemY = F.legLen; hemW = hp * 1.9; }
    else { hemY = (g.hem || 1.3) * u; hemW = hp * 1.2; }
    var L = [P(-0.34 * u, top - 0.04 * u), P(-sw * 0.92, top + 0.14 * u), P(-sw * 1.07, top + 0.42 * u), P(-sw * 0.97, top + 0.95 * u), P(-ww, -0.8 * u), P(-hp, -0.05 * u)];
    var hem = [P(-hemW, hemY), P(-hemW * 0.5, hemY + 0.1 * u), P(0, hemY + 0.13 * u), P(hemW * 0.5, hemY + 0.1 * u), P(hemW, hemY)];
    var Rr = L.map(function (p) { var q = A.rot(p, [F.cx, F.pelY], -((sp.pose && sp.pose.tilt) || 0)); return A.rot([2 * F.cx - q[0], q[1]], [F.cx, F.pelY], (sp.pose && sp.pose.tilt) || 0); }).reverse();
    var body = L.concat(hem, Rr);
    F.body = body; F.hemY = hemY; F.hem = hem;
    if (g.cape) {
      var c = g.cape, wind = c.wind || 0;
      var cp = [add(F.sh[0], [-0.1 * u, -0.25 * u]), [F.cx - sw * 1.55 - wind, F.base - 0.5 * u], [F.cx - sw * 0.7, F.base - 0.12 * u], [F.cx + 0.1 * u, F.base - 0.25 * u], [F.cx + sw * 0.8, F.base - 0.08 * u], [F.cx + sw * 1.6 + wind * 0.4, F.base - 0.45 * u], add(F.sh[1], [0.1 * u, -0.25 * u])];
      F.capeSVG = S(cp, c.color, { k: 14, rim: 3.5, ink: 3.4, inner: function () { return '<path d="' + A.path([add(cp[0], [10, 40]), cp[1], cp[2]], false) + '" stroke="' + (c.lining || light(c.color, 0.3)) + '" stroke-width="' + f(0.5 * u) + '" fill="none" opacity=".9"/>' + A.inkLine([lerp2(cp[0], cp[2], 0.3), lerp2(cp[0], cp[2], 0.95)], 2, 8, dark(c.color, 0.4)) + A.inkLine([lerp2(cp[6], cp[4], 0.3), lerp2(cp[6], cp[4], 0.95)], 2, 9, dark(c.color, 0.4)); } });
    }
    var main = g.type === 'armor' ? '#9aa1a8' : g.main;
    out += S(body, main, { k: 12, rim: 3.5, ink: 3.6, inner: function () {
      var s = '';
      if (g.pattern === 'diamond') s += diamonds(body, g.main, g.second, u);
      if (g.second && g.type !== 'armor' && g.pattern !== 'diamond') s += '<path d="' + A.poly([P(-0.32 * u, top), P(0.32 * u, top), P(0.2 * u, hemY + 0.3 * u), P(-0.2 * u, hemY + 0.3 * u)], true) + '" fill="' + g.second + '" opacity="' + (g.panel ? 1 : 0) + '"/>';
      s += '<path d="' + A.path(hem, false) + '" stroke="' + (g.trim || g.accent) + '" stroke-width="' + f(0.34 * u) + '" fill="none"/>';
      if (g.type !== 'armor') {
        s += A.inkLine([P(-hp * 0.45, -0.3 * u), P(-hemW * 0.4, hemY)], 2, 11, dark(main, 0.42)) + A.inkLine([P(hp * 0.35, -0.2 * u), P(hemW * 0.42, hemY)], 2, 12, dark(main, 0.42));
        if (g.type === 'robe' || g.type === 'dress') s += A.inkLine([P(0, -0.2 * u), P(-0.05 * u, hemY)], 1.8, 13, dark(main, 0.38));
      } else {
        for (var k = 0; k < 4; k++) s += A.inkLine([P(-hp * 1.2, -0.1 * u + k * 0.36 * u), P(hp * 1.2, -0.1 * u + k * 0.36 * u)], 2.2, 20 + k, '#5d636a');
        s += '<circle cx="' + f(P(-0.3 * u, -1.6 * u)[0]) + '" cy="' + f(P(-0.3 * u, -1.6 * u)[1]) + '" r="' + f(0.12 * u) + '" fill="#6f757c"/><circle cx="' + f(P(0.35 * u, -1.1 * u)[0]) + '" cy="' + f(P(0.35 * u, -1.1 * u)[1]) + '" r="' + f(0.08 * u) + '" fill="#b06a3a" opacity=".7"/>';
      }
      return s;
    } });
    if (g.type === 'armor') {
      var tab = [P(-0.48 * u, top + 0.5 * u), P(0.48 * u, top + 0.5 * u), P(0.56 * u, hemY + 0.28 * u), P(0, hemY + 0.45 * u), P(-0.56 * u, hemY + 0.28 * u)];
      out += S(tab, g.main, { k: 6, ink: 3, inner: function () { return '<path d="' + A.path([tab[2], tab[3], tab[4]], false) + '" stroke="' + g.accent + '" stroke-width="' + f(0.2 * u) + '" fill="none"/>' + S(A.ellipsePts(P(0, -1.3 * u), 0.22 * u, 0.26 * u, 8), g.accent, { k: 2, ink: 2 }); } });
      for (var j = 0; j < 2; j++) {
        var c2 = F.sh[j], s2 = F.s[j];
        out += S([add(c2, [-s2 * 0.5 * u, -0.05 * u]), add(c2, [-s2 * 0.1 * u, -0.38 * u]), add(c2, [s2 * 0.45 * u, -0.22 * u]), add(c2, [s2 * 0.5 * u, 0.3 * u]), add(c2, [-s2 * 0.2 * u, 0.25 * u])], '#b3b9be', { k: 5, ink: 3 });
      }
    }
    if (g.apron) {
      var ap = [P(-0.55 * u, -1.95 * u), P(0.55 * u, -1.95 * u), P(0.72 * u, 1.35 * u), P(0, 1.42 * u), P(-0.72 * u, 1.35 * u)];
      out += S(ap, g.apron, { k: 8, ink: 3, inner: function () { return A.inkLine([P(-0.4 * u, -0.6 * u), P(0.4 * u, -0.6 * u)], 2, 3, dark(g.apron, 0.4)) + (g.apronPocket ? S([P(-0.3 * u, 0.1 * u), P(0.3 * u, 0.1 * u), P(0.28 * u, 0.6 * u), P(-0.28 * u, 0.6 * u)], dark(g.apron, 0.1), { k: 2, ink: 2 }) : ''); } });
      out += A.inkLine([P(-0.5 * u, -1.95 * u), P(-0.25 * u, top + 0.02 * u)], 3.4, 4, dark(g.apron, 0.4)) + A.inkLine([P(0.5 * u, -1.95 * u), P(0.25 * u, top + 0.02 * u)], 3.4, 5, dark(g.apron, 0.4));
    }
    if (g.belt) {
      var b = [P(-ww * 1.04, -0.95 * u), P(ww * 1.04, -0.95 * u), P(ww * 1.06, -0.66 * u), P(-ww * 1.06, -0.66 * u)];
      out += S(b, g.belt, { k: 3, rim: 1.5, ink: 2.6 }) + S([P(-0.14 * u, -0.98 * u), P(0.14 * u, -0.98 * u), P(0.14 * u, -0.62 * u), P(-0.14 * u, -0.62 * u)], '#e2b04a', { k: 2, rim: 1, ink: 2.2 });
    }
    if (g.neckline !== 'none' && g.type !== 'armor') {
      var nk = [P(-0.3 * u, top - 0.02 * u), P(0.3 * u, top - 0.02 * u), P(0, top + (g.neckline === 'v' ? 0.62 : 0.3) * u)];
      out += S(nk, sp.skin, { k: 3, rim: 1, ink: 2.4 });
      out += '<path d="' + A.ribbon([nk[0], nk[2], nk[1]], false, 0.16 * u, 9, { taper: 0.2 }) + '" fill="' + (g.trim || g.accent) + '"/>';
    }
    if (g.fur) {
      var fc = [add(F.sh[0], [-0.25 * u, 0.05 * u]), P(-0.45 * u, top - 0.25 * u), P(0.45 * u, top - 0.25 * u), add(F.sh[1], [0.25 * u, 0.05 * u]), add(F.sh[1], [0.05 * u, 0.42 * u]), P(0, top + 0.6 * u), add(F.sh[0], [-0.05 * u, 0.42 * u])];
      out += S(fc, '#f4ecdc', { k: 5, ink: 3, inner: function () { var s = ''; for (var q = 0; q < 9; q++) { var p = lerp2(fc[q % 7], fc[(q + 3) % 7], 0.4 + (q % 3) * 0.1); s += '<path d="M' + f(p[0]) + ' ' + f(p[1]) + 'l3 7l-6 0z" fill="#2a1a12"/>'; } return s; } });
    }
    return out;
  };
  function diamonds(body, c1, c2, u) {
    /* motivo a rombi da giullare: scacchiera ruotata di 45 gradi */
    var s = '<g transform="rotate(45 300 450)">', d = 0.5 * u;
    for (var i = -30; i < 30; i++) for (var j = -30; j < 30; j++) if ((i + j) % 2 === 0) s += '<rect x="' + f(300 + i * d) + '" y="' + f(450 + j * d) + '" width="' + f(d) + '" height="' + f(d) + '" fill="' + c2 + '"/>';
    return s + '</g>';
  }
  /* ---------- Testa ---------- */
  A.headSVG = function (F) {
    var sp = F.sp, fa = sp.face || {}, u = F.u, hs = F.hs, c = F.headC, hw = F.hw, skin = sp.skin, t = fa.turn || 0;
    var ht = 0.7 * u * hs * (fa.long || 1), hb = 0.62 * u * hs * (fa.long || 1), jaw = fa.jaw || 1;
    var head = [[c[0] + t * 0.05 * u, c[1] - ht], [c[0] + hw * 0.76, c[1] - ht * 0.86], [c[0] + hw * (1 - Math.max(0, t) * 0.08), c[1] - ht * 0.2], [c[0] + hw * 0.95, c[1] + hb * 0.35], [c[0] + hw * 0.68 * jaw, c[1] + hb * 0.82], [c[0] + t * 0.12 * u, c[1] + hb * (fa.chin || 1)], [c[0] - hw * 0.68 * jaw, c[1] + hb * 0.82], [c[0] - hw * 0.95, c[1] + hb * 0.35], [c[0] - hw * (1 + Math.min(0, t) * 0.08), c[1] - ht * 0.2], [c[0] - hw * 0.76, c[1] - ht * 0.86]];
    F.headPts = head; F.ht = ht; F.hb = hb;
    var out = '';
    out += S(A.capsule(F.neck, add(c, [0, 0.35 * u]), 0.24 * u * Math.min(1.25, F.bw), 0.22 * u), skin, { k: 5, ink: 3 });
    for (var e = -1; e <= 1; e += 2) {
      if (t * e > 0.3) continue;
      out += S(A.ellipsePts([c[0] + e * hw * 0.97, c[1] + 0.06 * u], 0.13 * u, 0.21 * u, 8, 0), skin, { k: 3, rim: 1.5, ink: 2.6 });
    }
    out += S(head, skin, { k: 9, rim: 3, ink: 3.4 });
    return out;
  };
  A.faceSVG = function (F) {
    var sp = F.sp, fa = sp.face || {}, u = F.u * F.hs, c = F.headC, t = fa.turn || 0, skin = sp.skin, out = '';
    var ex = 0.21 * u * (1 - Math.abs(t) * 0.18), cxF = c[0] + t * 0.22 * u, ey = c[1] + 0.02 * u, look = (fa.look || 0) * 0.03 * u;
    var expr = fa.expr || 'smile', browCol = dark(sp.hair ? sp.hair.color : '#3a2414', 0.35);
    if (sp.hair && sp.hair.color === A.HAIR.wht) browCol = '#bdb3a6';
    /* guance */
    out += '<g opacity=".38" filter="url(#soft)"><circle cx="' + f(cxF - ex - 0.05 * u) + '" cy="' + f(ey + 0.24 * u) + '" r="' + f(0.11 * u) + '" fill="#e0705a"/><circle cx="' + f(cxF + ex + 0.05 * u) + '" cy="' + f(ey + 0.24 * u) + '" r="' + f(0.11 * u) + '" fill="#e0705a"/></g>';
    for (var e = -1; e <= 1; e += 2) {
      var x = cxF + e * ex + look, y = ey;
      var closed = expr === 'laugh' || (expr === 'wink' && e === (fa.winkSide || 1)) || fa.eyesClosed;
      if (closed) out += A.inkLine([[x - 0.07 * u, y + 0.01 * u], [x, y - 0.05 * u], [x + 0.07 * u, y + 0.01 * u]], 2.6, e + 40);
      else {
        out += '<ellipse cx="' + f(x) + '" cy="' + f(y) + '" rx="' + f(0.068 * u) + '" ry="' + f(0.094 * u) + '" fill="#2a1a10"/><circle cx="' + f(x + 0.022 * u) + '" cy="' + f(y - 0.035 * u) + '" r="' + f(0.025 * u) + '" fill="#fff8ea"/>' + (sp.lashes ? A.inkLine([[x + e * 0.06 * u, y - 0.06 * u], [x + e * 0.12 * u, y - 0.1 * u]], 2, e + 44) : '');
        if (fa.lids || sp.age === 'old') out += A.inkLine([[x - 0.09 * u, y - 0.05 * u], [x, y - 0.1 * u], [x + 0.09 * u, y - 0.06 * u]], 2, e + 50);
      }
      if (fa.glasses) out += '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(0.13 * u) + '" fill="#fff8e0" fill-opacity=".18" stroke="#3a2414" stroke-width="2.4"/>';
      /* sopracciglia: l'estremo interno si alza o si abbassa con l'espressione */
      var bi = { up: -0.04, down: 0.05, worried: -0.06, flat: 0, sly: e > 0 ? -0.06 : 0.03 }[fa.brows || (expr === 'determined' ? 'down' : expr === 'surprised' ? 'up' : 'flat')] * u;
      var bo = (fa.brows === 'up' ? -0.03 : 0) * u, by = y - 0.17 * u;
      var bIn = [x - e * 0.09 * u, by + bi], bOut = [x + e * 0.1 * u, by + bo + (fa.brows === 'worried' ? 0.03 * u : 0)];
      out += A.inkLine([bIn, lerp2(bIn, bOut, 0.5).map(function (v, k) { return k ? v - 0.025 * u : v; }), bOut], (fa.thickBrows ? 5.4 : 3.6), e + 60, browCol, { taper: 0.4 });
    }
    if (sp.age === 'old') {
      out += A.inkLine([[c[0] - 0.22 * u, c[1] - 0.38 * u], [c[0], c[1] - 0.41 * u], [c[0] + 0.22 * u, c[1] - 0.38 * u]], 1.5, 71, dark(skin, 0.4));
      out += A.inkLine([[cxF - ex - 0.13 * u, ey - 0.02 * u], [cxF - ex - 0.18 * u, ey + 0.04 * u]], 1.4, 72, dark(skin, 0.45)) + A.inkLine([[cxF + ex + 0.13 * u, ey - 0.02 * u], [cxF + ex + 0.18 * u, ey + 0.04 * u]], 1.4, 73, dark(skin, 0.45));
      out += A.inkLine([[cxF - 0.15 * u, ey + 0.24 * u], [cxF - 0.2 * u, ey + 0.4 * u]], 1.6, 74, dark(skin, 0.4)) + A.inkLine([[cxF + 0.15 * u, ey + 0.24 * u], [cxF + 0.2 * u, ey + 0.4 * u]], 1.6, 75, dark(skin, 0.4));
    }
    if (fa.freckles) for (var q = 0; q < 9; q++) out += '<circle cx="' + f(cxF + (q % 2 ? 1 : -1) * (0.12 + (q % 4) * 0.04) * u) + '" cy="' + f(ey + (0.14 + (q % 3) * 0.04) * u) + '" r="1.3" fill="' + dark(skin, 0.5) + '"/>';
    /* naso */
    var nx = c[0] + t * 0.34 * u, ny = c[1] + 0.2 * u, ns = fa.nose || 'round', sg = t >= 0 ? 1 : -1, nc = mix(skin, '#c8604a', 0.18);
    if (ns === 'round') out += S(A.ellipsePts([nx, ny], 0.11 * u, 0.095 * u, 8), nc, { k: 2, rim: 1.5, ink: 2.4 });
    else if (ns === 'button') out += S(A.ellipsePts([nx, ny], 0.075 * u, 0.065 * u, 8), nc, { k: 2, rim: 1.2, ink: 2.2 });
    else if (ns === 'long') out += S([[nx - 0.04 * u, ny - 0.26 * u], [nx + sg * 0.12 * u, ny + 0.03 * u], [nx + sg * 0.05 * u, ny + 0.1 * u], [nx - sg * 0.07 * u, ny + 0.08 * u]], nc, { k: 2, rim: 1.2, ink: 2.4 });
    else out += S([[nx - 0.03 * u, ny - 0.27 * u], [nx + sg * 0.09 * u, ny - 0.1 * u], [nx + sg * 0.13 * u, ny + 0.04 * u], [nx + sg * 0.02 * u, ny + 0.11 * u], [nx - sg * 0.08 * u, ny + 0.07 * u]], nc, { k: 2, rim: 1.2, ink: 2.4 });
    /* bocca */
    var mx = c[0] + t * 0.26 * u, my = c[1] + 0.43 * u, mw = 0.17 * u * (fa.mouthW || 1);
    if (expr === 'grin' || expr === 'laugh') {
      var open = expr === 'laugh' ? 0.17 : 0.12;
      out += S([[mx - mw, my - 0.03 * u], [mx + mw, my - 0.03 * u], [mx + mw * 0.6, my + open * 0.8 * u], [mx, my + open * u], [mx - mw * 0.6, my + open * 0.8 * u]], '#6a2520', { shade: false, ink: 2.6 });
      out += '<path d="M' + f(mx - mw * 0.85) + ' ' + f(my - 0.025 * u) + 'H' + f(mx + mw * 0.85) + 'V' + f(my + 0.02 * u) + 'H' + f(mx - mw * 0.85) + 'Z" fill="#fff8ec"/>';
      if (expr === 'laugh') out += '<ellipse cx="' + f(mx) + '" cy="' + f(my + 0.11 * u) + '" rx="' + f(mw * 0.45) + '" ry="' + f(0.04 * u) + '" fill="#d0605a"/>';
    } else if (expr === 'surprised') out += S(A.ellipsePts([mx, my + 0.02 * u], 0.05 * u, 0.07 * u, 8), '#6a2520', { shade: false, ink: 2.4 });
    else if (expr === 'determined') out += A.inkLine([[mx - mw * 0.8, my + 0.02 * u], [mx, my], [mx + mw * 0.8, my + 0.02 * u]], 2.8, 81);
    else if (expr === 'smirk' || expr === 'wink') out += A.inkLine([[mx - mw * 0.8, my + 0.01 * u], [mx + 0.02 * u, my + 0.045 * u], [mx + mw, my - 0.06 * u]], 2.8, 82);
    else if (expr === 'calm') out += A.inkLine([[mx - mw * 0.6, my], [mx, my + 0.03 * u], [mx + mw * 0.6, my]], 2.6, 83);
    else out += A.inkLine([[mx - mw, my - 0.03 * u], [mx - mw * 0.3, my + 0.05 * u], [mx + mw * 0.3, my + 0.05 * u], [mx + mw, my - 0.03 * u]], 2.8, 84);
    return out;
  };

  A.beardSVG = function (F) {
    var b = F.sp.beard; if (!b) return '';
    var u = F.u, c = F.headC, hw = F.hw, col = b.color, t = (F.sp.face && F.sp.face.turn) || 0, out = '', mx = c[0] + t * 0.26 * u;
    if (b.style === 'full' || b.style === 'long') {
      var len = b.style === 'long' ? 1.05 * u : 0.32 * u;
      var pts = [[c[0] - hw * 0.98, c[1] + 0.05 * u], [c[0] - hw * 0.92, c[1] + 0.5 * u], [c[0] - hw * 0.55, c[1] + 0.75 * u + len * 0.7], [mx, c[1] + 0.85 * u + len], [c[0] + hw * 0.55, c[1] + 0.75 * u + len * 0.7], [c[0] + hw * 0.92, c[1] + 0.5 * u], [c[0] + hw * 0.98, c[1] + 0.05 * u], [c[0] + hw * 0.62, c[1] + 0.32 * u], [mx + 0.18 * u, c[1] + 0.52 * u], [mx - 0.18 * u, c[1] + 0.52 * u], [c[0] - hw * 0.62, c[1] + 0.32 * u]];
      out += S(pts, col, { k: 7, rim: 2.5, ink: 3, inner: function () { var s = ''; for (var k = 0; k < 6; k++) s += A.inkLine([[c[0] - hw * 0.5 + k * hw * 0.2, c[1] + 0.6 * u], [c[0] - hw * 0.45 + k * hw * 0.2, c[1] + 0.8 * u + len * 0.8]], 1.6, k + 90, dark(col, 0.35)); return s; } });
    }
    if (b.style === 'goatee' && !b.only) out += S([[mx - 0.13 * u, c[1] + 0.55 * u], [mx + 0.13 * u, c[1] + 0.55 * u], [mx + 0.05 * u, c[1] + 0.95 * u], [mx - 0.05 * u, c[1] + 0.95 * u]], col, { k: 3, ink: 2.4 });
    if (b.style !== 'goatee' || b.mustache) {
      var my = c[1] + 0.36 * u;
      out += S([[mx, my - 0.03 * u], [mx + 0.24 * u, my - 0.02 * u], [mx + 0.34 * u, my + 0.1 * u], [mx + 0.12 * u, my + 0.07 * u], [mx, my + 0.04 * u], [mx - 0.12 * u, my + 0.07 * u], [mx - 0.34 * u, my + 0.1 * u], [mx - 0.24 * u, my - 0.02 * u]], col, { k: 3, rim: 1.5, ink: 2.6 });
    }
    return out;
  };

  /* ---------- Capelli ---------- */
  function cap(F, bump, low) {
    var c = F.headC, hw = F.hw * 1.08, ht = F.ht * 1.14, pts = [], u = F.u, t = (F.sp.face && F.sp.face.turn) || 0;
    for (var k = 0; k <= 10; k++) {
      var a = Math.PI + k / 10 * Math.PI, r = 1 + (bump ? (k % 2 ? 0.07 : -0.03) : 0);
      pts.push([c[0] + Math.cos(a) * hw * r, c[1] + Math.sin(a) * ht * r - 0.05 * u]);
    }
    var fy = c[1] - (low ? 0.2 : 0.32) * u;
    pts.push([c[0] + hw * 0.92, c[1] + 0.1 * u]);
    pts.push([c[0] + hw * 0.62, fy + 0.04 * u]);
    pts.push([c[0] + t * 0.2 * u + 0.15 * u, fy - 0.04 * u]);
    pts.push([c[0] + t * 0.2 * u - 0.2 * u, fy + 0.06 * u]);
    pts.push([c[0] - hw * 0.62, fy]);
    pts.push([c[0] - hw * 0.92, c[1] + 0.1 * u]);
    return pts;
  }
  A.hairBack = function (F) {
    var h = F.sp.hair; if (!h) return '';
    var c = F.headC, hw = F.hw, u = F.u, col = h.color, out = '';
    if (h.style === 'long' || h.style === 'wavy') {
      var L = h.len || 1.5;
      out += S([[c[0] - hw * 1.05, c[1] - 0.3 * u], [c[0] - hw * 1.25, c[1] + 0.6 * u], [c[0] - hw * 1.2, c[1] + L * u], [c[0] - hw * 0.3, c[1] + (L - 0.25) * u], [c[0] + hw * 0.3, c[1] + (L - 0.25) * u], [c[0] + hw * 1.2, c[1] + L * u], [c[0] + hw * 1.25, c[1] + 0.6 * u], [c[0] + hw * 1.05, c[1] - 0.3 * u], [c[0], c[1] - F.ht * 1.1]], col, { k: 8, ink: 3 });
    } else if (h.style === 'afro') {
      out += S(A.ellipsePts([c[0], c[1] - 0.25 * u], hw * 1.55, F.ht * 1.45, 18, 0, 0.12, 5), col, { k: 9, ink: 3, inner: function () { var s = ''; for (var k = 0; k < 18; k++) { var p = A.polar([c[0], c[1] - 0.25 * u], hw * (0.6 + (k % 3) * 0.3), k * 40); s += '<circle cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="' + f(0.12 * u) + '" fill="none" stroke="' + dark(col, 0.3) + '" stroke-width="1.6"/>'; } return s; } });
    } else if (h.style === 'bob') {
      out += S([[c[0] - hw * 1.1, c[1] - 0.3 * u], [c[0] - hw * 1.2, c[1] + 0.45 * u], [c[0] - hw * 0.9, c[1] + 0.62 * u], [c[0] + hw * 0.9, c[1] + 0.62 * u], [c[0] + hw * 1.2, c[1] + 0.45 * u], [c[0] + hw * 1.1, c[1] - 0.3 * u], [c[0], c[1] - F.ht * 1.1]], col, { k: 7, ink: 3 });
    } else if (h.style === 'ponytail') {
      var s = h.side || 1;
      out += S([[c[0] + s * hw * 0.7, c[1] - 0.5 * u], [c[0] + s * hw * 1.5, c[1] - 0.1 * u], [c[0] + s * hw * 1.7, c[1] + 0.8 * u], [c[0] + s * hw * 1.35, c[1] + 1.3 * u], [c[0] + s * hw * 1.2, c[1] + 0.5 * u], [c[0] + s * hw * 0.9, c[1] - 0.1 * u]], col, { k: 6, ink: 3 });
    }
    return out;
  };
  A.hairFront = function (F) {
    var h = F.sp.hair; if (!h) return '';
    var c = F.headC, hw = F.hw, u = F.u, col = h.color, out = '', st = h.style;
    if (st === 'bald') {
      for (var e = -1; e <= 1; e += 2) out += S([[c[0] + e * hw * 0.98, c[1] - 0.25 * u], [c[0] + e * hw * 1.1, c[1] + 0.05 * u], [c[0] + e * hw * 1.0, c[1] + 0.3 * u], [c[0] + e * hw * 0.86, c[1] - 0.05 * u]], col, { k: 3, ink: 2.4 });
      out += '<ellipse cx="' + f(c[0] - hw * 0.3) + '" cy="' + f(c[1] - F.ht * 0.7) + '" rx="' + f(hw * 0.22) + '" ry="' + f(0.07 * u) + '" fill="#fff6e0" opacity=".45"/>';
      return out;
    }
    if (st === 'none') return '';
    out += S(cap(F, st === 'curly' || st === 'afro', st === 'bob' || st === 'long'), col, { k: 7, rim: 3, ink: 3.2, inner: function () {
      return A.inkLine([[c[0] - hw * 0.5, c[1] - F.ht * 0.7], [c[0] - hw * 0.2, c[1] - F.ht * 0.5]], 1.8, 91, dark(col, 0.35)) + A.inkLine([[c[0] + hw * 0.1, c[1] - F.ht * 0.9], [c[0] + hw * 0.4, c[1] - F.ht * 0.6]], 1.8, 92, dark(col, 0.35));
    } });
    if (st === 'bun') out += circle([c[0] + (h.side || 0) * hw * 0.5, c[1] - F.ht * 1.18], 0.3 * u, col, { k: 4, ink: 3 });
    if (st === 'braids' || st === 'braid') {
      var sides = st === 'braids' ? [-1, 1] : [h.side || 1];
      sides.forEach(function (e) {
        for (var k = 0; k < 5; k++) out += S(A.ellipsePts([c[0] + e * hw * 1.05, c[1] + 0.3 * u + k * 0.3 * u], 0.15 * u, 0.18 * u, 8), col, { k: 3, ink: 2.4 });
        out += circle([c[0] + e * hw * 1.05, c[1] + 1.85 * u], 0.1 * u, h.tie || '#c8442b', { k: 2, ink: 2 });
      });
    }
    return out;
  };

  /* ---------- Cappelli ---------- */
  A.hatSVG = function (F) {
    var h = F.sp.hat; if (!h || h.type === 'none') return '';
    var c = F.headC, hw = F.hw, u = F.u, ht = F.ht, col = h.color, acc = h.accent || '#e2b04a', out = '', top = c[1] - ht;
    switch (h.type) {
      case 'cap':
        out += S([[c[0] - hw * 1.15, top + 0.28 * u], [c[0] - hw * 0.9, top - 0.1 * u], [c[0] + hw * 0.4, top - 0.22 * u], [c[0] + hw * 1.35, top + 0.02 * u], [c[0] + hw * 1.25, top + 0.32 * u], [c[0], top + 0.36 * u]], col, { k: 6, ink: 3 });
        out += A.inkLine([[c[0] + hw * 0.6, top - 0.05 * u], [c[0] + hw * 1.2, top - 0.6 * u], [c[0] + hw * 1.8, top - 0.75 * u]], 0.24 * u, 3, acc, { taper: 0.8 }) + A.inkLine([[c[0] + hw * 0.6, top - 0.05 * u], [c[0] + hw * 1.2, top - 0.6 * u], [c[0] + hw * 1.8, top - 0.75 * u]], 2, 4);
        break;
      case 'toque':
        out += S([[c[0] - hw * 0.95, top + 0.4 * u], [c[0] - hw * 0.9, top - 0.1 * u], [c[0] + hw * 0.9, top - 0.1 * u], [c[0] + hw * 0.95, top + 0.4 * u]], col, { k: 5, ink: 3 });
        out += S([[c[0] - hw * 0.9, top], [c[0] - hw * 1.25, top - 0.45 * u], [c[0] - hw * 0.7, top - 0.95 * u], [c[0], top - 0.75 * u], [c[0] + hw * 0.7, top - 1.0 * u], [c[0] + hw * 1.25, top - 0.45 * u], [c[0] + hw * 0.9, top]], col, { k: 7, ink: 3 });
        break;
      case 'kerchief':
        out += S([[c[0] - hw * 1.1, c[1] - 0.1 * u], [c[0] - hw * 0.95, top - 0.1 * u], [c[0] + hw * 0.4, top - 0.2 * u], [c[0] + hw * 1.1, top + 0.15 * u], [c[0] + hw * 1.1, c[1] - 0.1 * u], [c[0], c[1] - 0.38 * u]], col, { k: 6, ink: 3, inner: function () { var s = ''; for (var k = 0; k < 8; k++) s += '<circle cx="' + f(c[0] - hw + k * hw * 0.3) + '" cy="' + f(top + 0.2 * u + (k % 2) * 0.2 * u) + '" r="3" fill="' + acc + '"/>'; return s; } });
        out += S([[c[0] + hw * 1.0, c[1] - 0.2 * u], [c[0] + hw * 1.55, c[1] - 0.05 * u], [c[0] + hw * 1.45, c[1] + 0.25 * u], [c[0] + hw * 1.1, c[1] + 0.05 * u]], col, { k: 3, ink: 2.4 });
        break;
      case 'hood':
        out += '<path d="' + A.ribbon([[c[0] - hw * 1.12, c[1] + 0.55 * u], [c[0] - hw * 1.2, c[1] - 0.3 * u], [c[0] - hw * 0.5, top - 0.08 * u], [c[0] + hw * 0.5, top - 0.08 * u], [c[0] + hw * 1.2, c[1] - 0.3 * u], [c[0] + hw * 1.12, c[1] + 0.55 * u]], false, 0.42 * u, 7, { taper: 0.25, vary: 0.2 }) + '" fill="' + col + '" stroke="#3a2414" stroke-width="2.6"/>';
        break;
      case 'feather':
        out += S([[c[0] - hw * 1.8, top + 0.3 * u], [c[0] - hw * 0.8, top + 0.05 * u], [c[0] + hw * 0.9, top + 0.0 * u], [c[0] + hw * 1.9, top + 0.15 * u], [c[0] + hw * 1.6, top + 0.42 * u], [c[0], top + 0.42 * u]], col, { k: 6, ink: 3 });
        out += S([[c[0] - hw * 0.75, top + 0.15 * u], [c[0] - hw * 0.6, top - 0.55 * u], [c[0] + hw * 0.5, top - 0.62 * u], [c[0] + hw * 0.8, top + 0.1 * u]], col, { k: 6, ink: 3 });
        out += '<path d="' + A.ribbon([[c[0] - hw * 0.72, top + 0.05 * u], [c[0] + hw * 0.78, top + 0.02 * u]], false, 0.18 * u, 5, { taper: 0.1 }) + '" fill="' + acc + '"/>';
        out += S([[c[0] + hw * 0.4, top - 0.3 * u], [c[0] + hw * 1.1, top - 1.2 * u], [c[0] + hw * 1.9, top - 1.55 * u], [c[0] + hw * 1.3, top - 0.75 * u]], h.feather || '#f2e6c8', { k: 4, ink: 2.4, inner: function () { return A.inkLine([[c[0] + hw * 0.5, top - 0.3 * u], [c[0] + hw * 1.8, top - 1.5 * u]], 1.5, 6); } });
        break;
      case 'tall':
        out += S([[c[0] - hw * 0.95, top + 0.35 * u], [c[0] - hw * 0.85, top - 0.95 * u], [c[0] + hw * 0.85, top - 1.0 * u], [c[0] + hw * 0.95, top + 0.35 * u]], col, { k: 6, ink: 3, inner: function () { return '<rect x="0" y="' + f(top - 0.05 * u) + '" width="600" height="' + f(0.25 * u) + '" fill="' + acc + '"/>'; } });
        break;
      case 'crown':
      case 'kingCrown':
        var tall = h.type === 'kingCrown' ? 0.62 : 0.36, pts = [[c[0] - hw * 0.9, top + 0.3 * u]];
        for (var k = 0; k <= 4; k++) { var x = c[0] - hw * 0.9 + k * hw * 0.45; pts.push([x, top - tall * u]); if (k < 4) pts.push([x + hw * 0.225, top - 0.02 * u]); }
        pts.push([c[0] + hw * 0.9, top + 0.3 * u]);
        out += S(pts, '#e3b24a', { k: 5, rimColor: '#fff2b8', ink: 2.8, inner: function () { return '<rect x="0" y="' + f(top + 0.1 * u) + '" width="600" height="' + f(0.15 * u) + '" fill="#c98f2a"/>'; } });
        out += circle([c[0], top + 0.1 * u], 0.09 * u, acc, { k: 1, ink: 1.8 });
        break;
      case 'wizard':
        var bend = h.bend || 1;
        out += S([[c[0] - hw * 1.6, top + 0.35 * u], [c[0] - hw * 0.6, top + 0.1 * u], [c[0] + hw * 0.6, top + 0.1 * u], [c[0] + hw * 1.6, top + 0.35 * u], [c[0] + hw * 0.8, top + 0.55 * u], [c[0] - hw * 0.8, top + 0.55 * u]], col, { k: 6, ink: 3 });
        out += S([[c[0] - hw * 0.85, top + 0.3 * u], [c[0] - hw * 0.4, top - 0.9 * u], [c[0] + bend * hw * 0.4, top - 1.7 * u], [c[0] + bend * hw * 1.3, top - 1.95 * u], [c[0] + bend * hw * 0.6, top - 1.2 * u], [c[0] + hw * 0.85, top + 0.3 * u]], col, { k: 8, ink: 3, inner: function () { return '<rect x="0" y="' + f(top - 0.05 * u) + '" width="600" height="' + f(0.22 * u) + '" fill="' + acc + '"/>'; } });
        break;
      case 'jester':
        var bells = h.bells || '#f2c442';
        out += S([[c[0] - hw * 1.05, top + 0.35 * u], [c[0] - hw * 1.3, top - 0.2 * u], [c[0] - hw * 2.1, top - 0.1 * u], [c[0] - hw * 1.0, top - 0.55 * u], [c[0] - hw * 0.3, top - 1.5 * u], [c[0] + hw * 0.1, top - 0.6 * u], [c[0] + hw * 1.0, top - 1.1 * u], [c[0] + hw * 1.0, top - 0.3 * u], [c[0] + hw * 2.1, top - 0.2 * u], [c[0] + hw * 1.15, top + 0.35 * u]], col, { k: 7, ink: 3, inner: function () { return '<path d="M' + f(c[0]) + ' ' + f(top - 2 * u) + 'V' + f(top + u) + 'H700V' + f(top - 2 * u) + 'Z" fill="' + (h.second || acc) + '"/>'; } });
        out += S([[c[0] - hw * 1.1, top + 0.2 * u], [c[0] + hw * 1.1, top + 0.2 * u], [c[0] + hw * 1.15, top + 0.5 * u], [c[0] - hw * 1.15, top + 0.5 * u]], acc, { k: 3, ink: 2.6 });
        [[c[0] - hw * 2.1, top - 0.1 * u], [c[0] - hw * 0.3, top - 1.5 * u], [c[0] + hw * 1.0, top - 1.1 * u], [c[0] + hw * 2.1, top - 0.2 * u]].forEach(function (p) { out += circle(p, 0.15 * u, bells, { k: 2, ink: 2.2 }) + '<path d="M' + f(p[0] - 0.08 * u) + ' ' + f(p[1] + 0.03 * u) + 'h' + f(0.16 * u) + '" stroke="#3a2414" stroke-width="2"/>'; });
        break;
      case 'goggles':
        out += '<path d="' + A.ribbon([[c[0] - hw * 1.02, c[1] - 0.25 * u], [c[0], c[1] - 0.46 * u], [c[0] + hw * 1.02, c[1] - 0.25 * u]], false, 0.15 * u, 3, { taper: 0.05 }) + '" fill="#5a3a24"/>';
        for (var e = -1; e <= 1; e += 2) out += circle([c[0] + e * 0.24 * u, c[1] - 0.45 * u], 0.17 * u, '#c9a24a', { k: 2, ink: 2.6 }) + '<circle cx="' + f(c[0] + e * 0.24 * u) + '" cy="' + f(c[1] - 0.45 * u) + '" r="' + f(0.1 * u) + '" fill="' + (h.lens || '#7fc2c4') + '" stroke="#3a2414" stroke-width="1.6"/>';
        break;
      case 'turban':
        out += S([[c[0] - hw * 1.15, c[1] - 0.15 * u], [c[0] - hw * 1.2, top - 0.3 * u], [c[0], top - 0.62 * u], [c[0] + hw * 1.2, top - 0.3 * u], [c[0] + hw * 1.15, c[1] - 0.15 * u], [c[0], c[1] - 0.35 * u]], col, { k: 7, ink: 3, inner: function () { var s = ''; for (var k = 0; k < 3; k++) s += A.inkLine([[c[0] - hw * 1.2, top + k * 0.25 * u], [c[0] + hw * 1.2, top - 0.4 * u + k * 0.28 * u]], 2, 30 + k, dark(col, 0.35)); return s; } });
        out += circle([c[0], top - 0.05 * u], 0.12 * u, acc, { k: 2, ink: 2 });
        break;
      case 'leaves':
        for (var lv = 0; lv < 9; lv++) { var p = [c[0] - hw * 1.05 + lv * hw * 0.26, top + 0.12 * u + Math.abs(lv - 4) * 0.05 * u]; out += S(A.ellipsePts(p, 0.17 * u, 0.09 * u, 6, -60 + lv * 15), lv % 2 ? '#5aa060' : '#3e8a4f', { shade: false, ink: 1.8 }); }
        break;
    }
    return out;
  };

  /* ---------- Composizione del personaggio ---------- */
  A.figure = function (sp, sunWorld) {
    var F = A.skeleton(sp), g = sp.garment, out = '';
    var prev = A.sun;
    A.sun = sp.mirror ? [-sunWorld[0], sunWorld[1]] : sunWorld;
    var props = sp.props || {};
    var torso = A.torso(F, g);
    if (F.capeSVG) out += F.capeSVG;
    if (props.back) out += props.back(F);
    if (sp.hood) out += S(A.ellipsePts(add(F.headC, [0, 0.1 * F.u]), F.hw * 1.45, F.ht * 1.4, 12), sp.hood, { k: 8, ink: 3 });
    for (var i = 0; i < 2; i++) if (F.arms[i].behind) { out += A.arm(F, i, g); if (props.hand && props.hand[i]) out += props.hand[i](F, i); out += A.hand(F, i, F.arms[i].hand || 'fist', sp.skin); }
    out += A.legsSVG(F, g);
    out += torso;
    if (props.body) out += props.body(F);
    out += A.hairBack(F);
    out += A.headSVG(F);
    out += A.faceSVG(F);
    out += A.beardSVG(F);
    out += A.hairFront(F);
    out += A.hatSVG(F);
    if (props.mid) out += props.mid(F);
    for (var j = 0; j < 2; j++) if (!F.arms[j].behind) { if (props.under && props.under[j]) out += props.under[j](F, j); out += A.arm(F, j, g); if (props.hand && props.hand[j]) out += props.hand[j](F, j); out += A.hand(F, j, F.arms[j].hand || 'fist', sp.skin); }
    if (props.front) out += props.front(F);
    A.sun = prev;
    var wrap = '<g filter="url(#roughFig)">' + out + '</g>';
    if (sp.mirror) wrap = '<g transform="translate(' + f(2 * sp.cx) + ' 0) scale(-1 1)">' + wrap + '</g>';
    return { svg: wrap, F: F };
  };
})(typeof self !== 'undefined' ? self : this);
