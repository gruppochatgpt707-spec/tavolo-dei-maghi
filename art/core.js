/* Strumenti di base del pittore: numeri casuali ripetibili, colori, curve morbide, tratti d'inchiostro. */
(function (root) {
  'use strict';
  var A = root.ART = root.ART || {};
  A.W = 600; A.H = 900;
  A.INK = '#3a2414';
  A.uid = 0;

  A.rng = function (seed) {
    var s = (seed >>> 0) || 1;
    return function () { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
  };
  A.hash = function (t) {
    var h = 2166136261;
    for (var i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  };
  A.noise1 = function (seed) {
    var r = A.rng(seed), tab = [];
    for (var i = 0; i < 64; i++) tab.push(r());
    return function (t) {
      var x = ((t % 64) + 64) % 64, i0 = Math.floor(x), f = x - i0, u = f * f * (3 - 2 * f);
      return tab[i0] + (tab[(i0 + 1) % 64] - tab[i0]) * u;
    };
  };
  var f = A.f = function (n) { return (Math.round(n * 10) / 10).toString(); };

  /* ---- Colori ---- */
  function hx(c) { c = c.replace('#', ''); return [parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16)]; }
  function toHex(a) { return '#' + a.map(function (v) { v = Math.max(0, Math.min(255, Math.round(v))); return (v < 16 ? '0' : '') + v.toString(16); }).join(''); }
  A.mix = function (a, b, t) { var X = hx(a), Y = hx(b); return toHex(X.map(function (v, i) { return v + (Y[i] - v) * t; })); };
  /* Ombre fredde e viola, luci calde: come nel guazzo dipinto al tramonto */
  A.dark = function (c, t) { return A.mix(c, '#2a1830', t === undefined ? 0.32 : t); };
  A.light = function (c, t) { return A.mix(c, '#fff0c4', t === undefined ? 0.45 : t); };
  A.warm = function (c, t) { return A.mix(c, '#ffb35a', t === undefined ? 0.3 : t); };

  /* ---- Geometria ---- */
  A.add = function (a, b) { return [a[0] + b[0], a[1] + b[1]]; };
  A.sub = function (a, b) { return [a[0] - b[0], a[1] - b[1]]; };
  A.mul = function (a, k) { return [a[0] * k, a[1] * k]; };
  A.len = function (a) { return Math.hypot(a[0], a[1]); };
  A.norm = function (a) { var l = Math.hypot(a[0], a[1]) || 1; return [a[0] / l, a[1] / l]; };
  A.perp = function (a) { return [-a[1], a[0]]; };
  A.lerp2 = function (a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; };
  A.rot = function (p, c, deg) {
    var r = deg * Math.PI / 180, s = Math.sin(r), k = Math.cos(r), x = p[0] - c[0], y = p[1] - c[1];
    return [c[0] + x * k - y * s, c[1] + x * s + y * k];
  };
  A.polar = function (c, r, deg) { var a = deg * Math.PI / 180; return [c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]; };

  /* Curva di Catmull-Rom trasformata in Bézier: forme morbide da pochi punti */
  A.path = function (pts, closed) {
    var n = pts.length, d = 'M' + f(pts[0][0]) + ' ' + f(pts[0][1]);
    if (n < 3) { for (var k = 1; k < n; k++) d += 'L' + f(pts[k][0]) + ' ' + f(pts[k][1]); return d + (closed ? 'Z' : ''); }
    var last = closed ? n : n - 1;
    for (var i = 0; i < last; i++) {
      var p0 = pts[closed ? (i - 1 + n) % n : Math.max(i - 1, 0)], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[closed ? (i + 2) % n : Math.min(i + 2, n - 1)];
      d += 'C' + f(p1[0] + (p2[0] - p0[0]) / 6) + ' ' + f(p1[1] + (p2[1] - p0[1]) / 6) + ' ' + f(p2[0] - (p3[0] - p1[0]) / 6) + ' ' + f(p2[1] - (p3[1] - p1[1]) / 6) + ' ' + f(p2[0]) + ' ' + f(p2[1]);
    }
    return closed ? d + 'Z' : d;
  };
  A.poly = function (pts, closed) {
    return 'M' + pts.map(function (p) { return f(p[0]) + ' ' + f(p[1]); }).join('L') + (closed ? 'Z' : '');
  };
  function cr(p0, p1, p2, p3, t) {
    var t2 = t * t, t3 = t2 * t;
    return [0, 1].map(function (k) {
      return 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3);
    });
  }
  A.sample = function (pts, closed, per) {
    per = per || 9;
    var n = pts.length, out = [], last = closed ? n : n - 1;
    if (n < 3) {
      for (var a = 0; a < n - 1; a++) for (var b = 0; b < per; b++) out.push(A.lerp2(pts[a], pts[a + 1], b / per));
      out.push(pts[n - 1]);
      return out;
    }
    for (var i = 0; i < last; i++) {
      var p0 = pts[closed ? (i - 1 + n) % n : Math.max(i - 1, 0)], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[closed ? (i + 2) % n : Math.min(i + 2, n - 1)];
      var seg = Math.max(2, Math.round(per * Math.min(3, A.len(A.sub(p2, p1)) / 30 + 0.4)));
      for (var j = 0; j < seg; j++) out.push(cr(p0, p1, p2, p3, j / seg));
    }
    if (!closed) out.push(pts[n - 1]);
    return out;
  };

  /* Tratto d'inchiostro a spessore variabile, assottigliato alle estremità */
  A.ribbon = function (pts, closed, w, seed, opt) {
    opt = opt || {};
    var s = A.sample(pts, closed, 7), n = s.length, nz = A.noise1(seed || 7), L = [], Rr = [];
    var vary = opt.vary === undefined ? 0.65 : opt.vary;
    for (var i = 0; i < n; i++) {
      var a = s[closed ? (i - 1 + n) % n : Math.max(i - 1, 0)], b = s[closed ? (i + 1) % n : Math.min(i + 1, n - 1)];
      var d = A.norm(A.sub(b, a)), nn = A.perp(d), t = i / Math.max(1, n - 1);
      var p = closed ? 1 : 0.12 + 0.88 * Math.pow(Math.sin(Math.PI * Math.min(1, Math.max(0, t))), opt.taper || 0.55);
      var ww = w * p * (1 - vary / 2 + vary * nz(t * (opt.freq || 5) + (seed || 0) % 17));
      L.push(A.add(s[i], A.mul(nn, ww / 2)));
      Rr.push(A.sub(s[i], A.mul(nn, ww / 2)));
    }
    if (closed) return A.poly(L, true) + A.poly(Rr.reverse(), true);
    return A.poly(L.concat(Rr.reverse()), true);
  };
  A.inkLine = function (pts, w, seed, color, opt) {
    return '<path d="' + A.ribbon(pts, false, w, seed, opt) + '" fill="' + (color || A.INK) + '"/>';
  };

  /* Forma dipinta: tinta piatta, ombra sul lato opposto al sole, filo di luce sul lato del sole, contorno a inchiostro. */
  A.sun = [-0.9, -0.35];
  A.shape = function (pts, o) {
    var d = A.path(pts, o.closed !== false), out = '', fill = o.fill;
    var sh = o.shade === undefined ? true : o.shade;
    if (sh) {
      var id = 'c' + (A.uid++), k = o.k || 9, r = o.rim === undefined ? 3 : o.rim, sx = A.sun[0], sy = A.sun[1];
      out += '<clipPath id="' + id + '"><path d="' + d + '"/></clipPath>';
      out += '<path d="' + d + '" fill="' + (o.shadow || A.dark(fill, o.dk === undefined ? 0.3 : o.dk)) + '"/>';
      out += '<g clip-path="url(#' + id + ')"><path d="' + d + '" fill="' + fill + '" transform="translate(' + f(sx * k) + ' ' + f(sy * k * 0.6) + ')"/>';
      if (o.inner) out += o.inner(id);
      if (r > 0) out += '<path d="' + d + '" fill="none" stroke="' + (o.rimColor || A.light(fill, 0.55)) + '" stroke-width="' + f(r * 2) + '" transform="translate(' + f(-sx * r) + ' ' + f(-sy * r) + ')" opacity="' + (o.rimOp || 0.85) + '"/>';
      out += '</g>';
    } else {
      out += '<path d="' + d + '" fill="' + fill + '"' + (o.opacity ? ' opacity="' + o.opacity + '"' : '') + '/>';
      if (o.inner) { var id2 = 'c' + (A.uid++); out += '<clipPath id="' + id2 + '"><path d="' + d + '"/></clipPath><g clip-path="url(#' + id2 + ')">' + o.inner(id2) + '</g>'; }
    }
    if (o.ink !== 0) out += '<path d="' + A.ribbon(pts, o.closed !== false, o.ink || 3.4, o.seed || pts.length * 13 + Math.round(pts[0][0]), { vary: o.vary }) + '" fill="' + (o.inkColor || A.INK) + '" fill-rule="evenodd"' + (o.inkOp ? ' opacity="' + o.inkOp + '"' : '') + '/>';
    return out;
  };

  /* Capsula affusolata da a a b: braccia, gambe, colli, manici */
  A.capsule = function (a, b, wa, wb) {
    var d = A.norm(A.sub(b, a)), n = A.perp(d), m = A.lerp2(a, b, 0.5), wm = (wa + wb) / 2 * 1.02;
    return [A.add(a, A.mul(n, wa)), A.add(m, A.mul(n, wm)), A.add(b, A.mul(n, wb)), A.add(b, A.mul(d, wb * 0.85)),
      A.sub(b, A.mul(n, wb)), A.sub(m, A.mul(n, wm)), A.sub(a, A.mul(n, wa)), A.sub(a, A.mul(d, wa * 0.85))];
  };
  /* Arto continuo a tre punti (spalla-gomito-polso): un solo contorno, niente giunture visibili */
  A.limb = function (a, b, c, wa, wb, wc) {
    var d1 = A.norm(A.sub(b, a)), d2 = A.norm(A.sub(c, b)), n1 = A.perp(d1), n2 = A.perp(d2), nb = A.norm(A.add(n1, n2));
    var k = 1 / Math.max(0.6, n1[0] * nb[0] + n1[1] * nb[1]);
    var m1 = A.lerp2(a, b, 0.5), m2 = A.lerp2(b, c, 0.5);
    var L = [A.add(a, A.mul(n1, wa)), A.add(m1, A.mul(n1, (wa + wb) / 2 * 1.04)), A.add(b, A.mul(nb, wb * k)), A.add(m2, A.mul(n2, (wb + wc) / 2 * 1.02)), A.add(c, A.mul(n2, wc))];
    var R = [A.sub(c, A.mul(n2, wc)), A.sub(m2, A.mul(n2, (wb + wc) / 2 * 1.02)), A.sub(b, A.mul(nb, wb * k)), A.sub(m1, A.mul(n1, (wa + wb) / 2 * 1.04)), A.sub(a, A.mul(n1, wa))];
    return L.concat([A.add(c, A.mul(d2, wc * 0.8))], R, [A.sub(a, A.mul(d1, wa * 0.8))]);
  };
  A.ellipsePts = function (c, rx, ry, n, rotDeg, jitter, seed) {
    var out = [], r = A.rng(seed || 3);
    n = n || 10;
    for (var i = 0; i < n; i++) {
      var a = i / n * Math.PI * 2, j = 1 + (jitter || 0) * (r() - 0.5);
      var p = [c[0] + Math.cos(a) * rx * j, c[1] + Math.sin(a) * ry * j];
      out.push(rotDeg ? A.rot(p, c, rotDeg) : p);
    }
    return out;
  };

  /* Pennellate secche dentro una forma, per la grana del colore */
  A.brush = function (r, box, color, n, len, wid, angle, op) {
    var s = '';
    for (var i = 0; i < n; i++) {
      var x = box[0] + r() * (box[2] - box[0]), y = box[1] + r() * (box[3] - box[1]);
      var L = len * (0.5 + r()), a = angle + (r() - 0.5) * 16;
      var p0 = A.polar([x, y], -L / 2, a), p1 = A.polar([x, y], L / 2, a), mid = A.add(A.polar([x, y], 0, a), [0, (r() - 0.5) * 4]);
      s += '<path d="' + A.ribbon([p0, mid, p1], false, wid * (0.6 + r() * 0.8), Math.floor(r() * 999), { vary: 0.5 }) + '" fill="' + color + '" opacity="' + f((op || 0.35) * (0.6 + r() * 0.6)) + '"/>';
    }
    return s;
  };

  /* Filtri comuni: bordi irregolari, grana della carta, macchie di pigmento */
  A.defs = function (seed) {
    return '<defs>' +
      '<filter id="rough" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="' + (seed % 97) + '"/><feDisplacementMap in="SourceGraphic" scale="7" xChannelSelector="R" yChannelSelector="G"/></filter>' +
      '<filter id="roughFig" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="' + ((seed + 11) % 97) + '"/><feDisplacementMap in="SourceGraphic" scale="3.2" xChannelSelector="R" yChannelSelector="G"/></filter>' +
      '<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="' + (seed % 50) + '"/><feColorMatrix type="matrix" values="0 0 0 0 0.42  0 0 0 0 0.31  0 0 0 0 0.2  -0.9 -0.9 -0.9 0 1.55"/></filter>' +
      '<filter id="fiber" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.012 0.06" numOctaves="3" seed="' + ((seed + 5) % 50) + '"/><feColorMatrix type="matrix" values="0 0 0 0 0.5  0 0 0 0 0.36  0 0 0 0 0.22  -1.1 -1.1 -1.1 0 1.7"/></filter>' +
      '<filter id="mottle" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.011" numOctaves="3" seed="' + ((seed + 23) % 50) + '"/><feColorMatrix type="matrix" values="0 0 0 0 0.42  0 0 0 0 0.26  0 0 0 0 0.16  -1.4 -1.4 -1.4 0 2.2"/></filter>' +
      '<filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5"/></filter>' +
      '<filter id="soft2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14"/></filter>' +
      '<filter id="glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="9" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
      '</defs>';
  };
  A.paper = function () {
    return '<rect width="600" height="900" filter="url(#mottle)" opacity="0.16" style="mix-blend-mode:multiply"/>' +
      '<rect width="600" height="900" filter="url(#fiber)" opacity="0.22" style="mix-blend-mode:multiply"/>' +
      '<rect width="600" height="900" filter="url(#grain)" opacity="0.4" style="mix-blend-mode:multiply"/>';
  };
})(typeof self !== 'undefined' ? self : this);
