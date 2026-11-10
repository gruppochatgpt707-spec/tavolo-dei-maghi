/* Oggetti di scena: pane, lettere, ceste, attrezzi, strumenti, armi da parata e magie elementali. */
(function (root) {
  'use strict';
  var A = root.ART, f = A.f, mix = A.mix, dark = A.dark, light = A.light, add = A.add, sub = A.sub, mul = A.mul, lerp2 = A.lerp2, norm = A.norm, perp = A.perp;
  function S(pts, fill, o) { o = o || {}; o.fill = fill; return A.shape(pts, o); }
  function circ(c, r, fill, o) { return S(A.ellipsePts(c, r, r, 10), fill, o); }
  function rect(c, w, h, ang) { return [[-w, -h], [w, -h], [w, h], [-w, h]].map(function (p) { return add(c, A.rot(p, [0, 0], ang)); }); }
  function box(c, w, h, ang, rr) {
    var pts = [], k = rr || 0.25;
    [[-w, -h], [w, -h], [w, h], [-w, h]].forEach(function (p, i, arr) {
      var nx = arr[(i + 1) % 4], pv = arr[(i + 3) % 4];
      pts.push(A.lerp2(p, pv, k * 0.5)); pts.push(A.lerp2(p, nx, k * 0.5));
    });
    return pts.map(function (p) { return add(c, A.rot(p, [0, 0], ang)); });
  }
  function ang(d) { return Math.atan2(d[1], d[0]) * 180 / Math.PI; }
  var P = A.PROPS = {};

  P.loafUnder = function (F, i) {
    var u = F.u, s = F.s[i], c = add(F.sh[i], [s * 0.05 * u, 1.05 * u]);
    var pts = A.ellipsePts(c, 0.95 * u, 0.36 * u, 12, s * -14);
    var o = S(pts, '#c98640', { k: 6, rimColor: '#f3c27a', ink: 3, inner: function () { return '<ellipse cx="' + f(c[0]) + '" cy="' + f(c[1] - 0.12 * u) + '" rx="' + f(0.8 * u) + '" ry="' + f(0.14 * u) + '" fill="#e2a85c" transform="rotate(' + (s * -14) + ' ' + f(c[0]) + ' ' + f(c[1]) + ')"/>'; } });
    for (var k = -1; k <= 1; k++) { var p = A.rot(add(c, [k * 0.35 * u, -0.08 * u]), c, s * -14); o += A.inkLine([add(p, [-0.1 * u, -0.1 * u]), add(p, [0.08 * u, 0.12 * u])], 2.4, k + 5, '#7a4a20'); }
    return o;
  };
  P.letter = function (F, i) {
    var u = F.u, c = add(F.wr[i], mul(F.hd[i], 0.62 * u)), a = ang(F.hd[i]) + 90;
    return S(box(c, 0.5 * u, 0.34 * u, a, 0.15), '#f5ead0', { k: 4, ink: 2.6, inner: function () { return A.inkLine([A.add(c, A.rot([-0.4 * u, -0.25 * u], [0, 0], a)), c, A.add(c, A.rot([0.4 * u, -0.25 * u], [0, 0], a))], 1.6, 3, '#8a6a40'); } }) + circ(c, 0.13 * u, '#b8322a', { k: 2, rimColor: '#f07a60', ink: 2.2 }) + '<circle cx="' + f(c[0]) + '" cy="' + f(c[1]) + '" r="' + f(0.05 * u) + '" fill="#7a1a16"/>';
  };
  P.bag = function (side, color) {
    return function (F) {
      var u = F.u, o = F.s[side], a = F.sh[1 - side], b = add(F.hip[side], [o * 0.5 * u, 0.1 * u]);
      var bag = box(add(b, [0, 0.35 * u]), 0.48 * u, 0.42 * u, o * 8, 0.4);
      return '<path d="' + A.ribbon([add(a, [0, -0.05 * u]), lerp2(a, b, 0.5), b], false, 0.18 * u, 4, { taper: 0.05, vary: 0.2 }) + '" fill="' + dark(color, 0.2) + '" stroke="#3a2414" stroke-width="2"/>' +
        S(bag, color, { k: 6, ink: 3, inner: function () { return '<path d="' + A.poly([bag[0], bag[3], add(lerp2(bag[2], bag[5], 0.5), [0, 0.12 * u])], false) + '" fill="' + dark(color, 0.15) + '" stroke="#3a2414" stroke-width="2"/>'; } }) + circ(add(b, [0, 0.42 * u]), 0.07 * u, '#e2b04a', { k: 1, ink: 1.6 });
    };
  };
  P.basket = function (contents, colA, colB) {
    return function (F) {
      var u = F.u, m = lerp2(F.wr[0], F.wr[1], 0.5), c = add(m, [0, 0.28 * u]), w = Math.max(0.9 * u, Math.abs(F.wr[1][0] - F.wr[0][0]) * 0.55);
      var b = [[c[0] - w, c[1] - 0.3 * u], [c[0] + w, c[1] - 0.3 * u], [c[0] + w * 0.86, c[1] + 0.45 * u], [c[0], c[1] + 0.55 * u], [c[0] - w * 0.86, c[1] + 0.45 * u]];
      var o = '';
      o += P.contents(contents, [c[0], c[1] - 0.3 * u], w, u, colA, colB);
      o += S(b, '#b07a3a', { k: 6, rimColor: '#e8b676', ink: 3, inner: function () { var s = ''; for (var k = 0; k < 4; k++) s += A.inkLine([[c[0] - w * 1.1, c[1] - 0.15 * u + k * 0.2 * u], [c[0] + w * 1.1, c[1] - 0.15 * u + k * 0.2 * u]], 2, k + 20, '#7a4c22'); for (var j = 0; j < 7; j++) s += A.inkLine([[c[0] - w + j * w / 3, c[1] - 0.3 * u], [c[0] - w * 0.86 + j * w * 0.86 / 3, c[1] + 0.5 * u]], 1.6, j + 30, '#8a5a2a'); return s; } });
      o += '<path d="' + A.ribbon([[c[0] - w, c[1] - 0.25 * u], [c[0] - w * 1.08, c[1] - 0.05 * u], [c[0] - w * 0.9, c[1] + 0.05 * u]], false, 0.16 * u, 3, { taper: 0.2 }) + '" fill="#a06a30"/>';
      return o;
    };
  };
  P.contents = function (kind, top, w, u, cA, cB) {
    var o = '', k;
    if (kind === 'bread') for (k = 0; k < 4; k++) o += S(A.ellipsePts(add(top, [(-1.5 + k) * w * 0.5, -0.1 * u - (k % 2) * 0.15 * u]), 0.42 * u, 0.24 * u, 10, -20 + k * 14), k % 2 ? '#d29248' : '#c07a36', { k: 4, rimColor: '#f5c47c', ink: 2.6 });
    else if (kind === 'fish') for (k = 0; k < 4; k++) { var c = add(top, [(-1.5 + k) * w * 0.48, -0.08 * u - (k % 2) * 0.12 * u]), a = -30 + k * 22; o += S([A.rot(add(c, [-0.5 * u, 0]), c, a), A.rot(add(c, [-0.1 * u, -0.18 * u]), c, a), A.rot(add(c, [0.35 * u, -0.05 * u]), c, a), A.rot(add(c, [0.55 * u, -0.2 * u]), c, a), A.rot(add(c, [0.55 * u, 0.2 * u]), c, a), A.rot(add(c, [0.35 * u, 0.05 * u]), c, a), A.rot(add(c, [-0.1 * u, 0.18 * u]), c, a)], k % 2 ? '#9fb6c8' : '#c9d4da', { k: 3, ink: 2.2 }) + '<circle cx="' + f(A.rot(add(c, [-0.32 * u, -0.03 * u]), c, a)[0]) + '" cy="' + f(A.rot(add(c, [-0.32 * u, -0.03 * u]), c, a)[1]) + '" r="2.4" fill="#2a1a10"/>'; }
    else if (kind === 'mushroom') for (k = 0; k < 5; k++) { var m = add(top, [(-2 + k) * w * 0.38, -0.05 * u - (k % 2) * 0.16 * u]); o += S([add(m, [-0.07 * u, 0.2 * u]), add(m, [-0.06 * u, -0.05 * u]), add(m, [0.06 * u, -0.05 * u]), add(m, [0.07 * u, 0.2 * u])], '#f1e6cf', { k: 2, ink: 2 }) + S([add(m, [-0.26 * u, 0]), add(m, [-0.18 * u, -0.2 * u]), add(m, [0, -0.27 * u]), add(m, [0.18 * u, -0.2 * u]), add(m, [0.26 * u, 0])], k % 2 ? '#c9574f' : '#b0703a', { k: 3, ink: 2.4 }) + '<circle cx="' + f(m[0] - 0.08 * u) + '" cy="' + f(m[1] - 0.14 * u) + '" r="2.4" fill="#fff4e0"/>'; }
    else if (kind === 'flowers') for (k = 0; k < 4; k++) { var p = add(top, [(-1.5 + k) * w * 0.5, -0.2 * u - (k % 2) * 0.2 * u]); for (var q = 0; q < 8; q++) { var pp = A.polar(p, 0.2 * u, q * 45); o += '<ellipse cx="' + f(pp[0]) + '" cy="' + f(pp[1]) + '" rx="' + f(0.12 * u) + '" ry="' + f(0.06 * u) + '" transform="rotate(' + q * 45 + ' ' + f(pp[0]) + ' ' + f(pp[1]) + ')" fill="#f4b832" stroke="#3a2414" stroke-width="1.2"/>'; } o += circ(p, 0.12 * u, '#5a3412', { shade: false, ink: 1.6 }); }
    else for (k = 0; k < 6; k++) o += circ(add(top, [(-2.5 + k) * w * 0.32, -0.08 * u - (k % 2) * 0.14 * u]), 0.17 * u, k % 2 ? (cA || '#c8442b') : (cB || '#7a2a4a'), { k: 3, ink: 2.2 });
    return o;
  };
  P.net = function (side) {
    return function (F) {
      var u = F.u, s = F.s[side], a = add(F.sh[side], [s * 0.1 * u, -0.2 * u]);
      var pts = [a, add(a, [s * 0.9 * u, 0.4 * u]), add(a, [s * 1.3 * u, 2.2 * u]), add(a, [s * 0.7 * u, 3.4 * u]), add(a, [-s * 0.2 * u, 2.6 * u]), add(a, [-s * 0.3 * u, 0.6 * u])];
      return S(pts, '#c9a86a', { k: 6, ink: 2.6, inner: function () { var o = ''; for (var k = 0; k < 10; k++) { o += A.inkLine([add(a, [-s * 0.6 * u, k * 0.36 * u]), add(a, [s * 1.6 * u, k * 0.36 * u + 0.6 * u])], 1.4, k, '#6a4a28'); o += A.inkLine([add(a, [s * (k * 0.2 - 0.4) * u, -0.2 * u]), add(a, [s * (k * 0.2 - 0.8) * u, 3.6 * u])], 1.4, k + 20, '#6a4a28'); } return o; } }) + circ(add(a, [s * 1.1 * u, 1.4 * u]), 0.12 * u, '#e39a3a', { k: 2, ink: 1.8 }) + circ(add(a, [s * 0.6 * u, 2.7 * u]), 0.12 * u, '#e39a3a', { k: 2, ink: 1.8 });
    };
  };
  P.hammer = function (F, i) {
    var u = F.u, w = F.wr[i], d = F.hd[i], end = add(w, mul(d, 1.35 * u)), n = perp(d), back = sub(w, mul(d, 0.3 * u));
    var head = [add(end, mul(n, 0.5 * u)), add(add(end, mul(n, 0.5 * u)), mul(d, 0.42 * u)), add(sub(end, mul(n, 0.4 * u)), mul(d, 0.42 * u)), sub(end, mul(n, 0.4 * u))];
    return S(A.capsule(back, end, 0.11 * u, 0.1 * u), '#8a5a30', { k: 3, ink: 2.6 }) + S(head, '#5f646b', { k: 4, rimColor: '#e6e0d0', ink: 3 });
  };
  P.tongs = function (F, i) {
    var u = F.u, w = F.wr[i], d = F.hd[i], e1 = add(w, mul(A.rot(d, [0, 0], 6), 1.4 * u)), e2 = add(w, mul(A.rot(d, [0, 0], -6), 1.4 * u));
    return A.inkLine([w, e1], 5, 3, '#3d3b3a', { taper: 0.1 }) + A.inkLine([w, e2], 5, 4, '#4d4b4a', { taper: 0.1 }) + circ(lerp2(e1, e2, 0.5), 0.12 * u, '#ff8a3a', { k: 1, rimColor: '#ffe0a0', ink: 1.8 });
  };
  P.cloth = function (c1, c2) {
    return function (F, i) {
      var u = F.u, s = F.s[i], a = lerp2(F.el[i], F.wr[i], 0.3), b = lerp2(F.el[i], F.wr[i], 0.85);
      var pts = [add(a, [0, -0.1 * u]), add(b, [0, -0.1 * u]), add(b, [s * 0.15 * u, 1.9 * u]), add(lerp2(a, b, 0.5), [0, 2.15 * u]), add(a, [-s * 0.15 * u, 1.85 * u])];
      return S(pts, c1, { k: 8, ink: 3, inner: function () { var o = ''; for (var k = 0; k < 6; k++) o += A.inkLine([add(a, [-u, 0.3 * u + k * 0.32 * u]), add(b, [u, 0.4 * u + k * 0.32 * u])], 0.12 * u, k, k % 2 ? c2 : light(c1, 0.35), { taper: 0.1, vary: 0.2 }); return o + A.inkLine([lerp2(a, b, 0.4), add(lerp2(a, b, 0.45), [0, 2 * u])], 1.8, 9, dark(c1, 0.4)); } });
    };
  };
  P.scale = function (F, i) {
    var u = F.u, w = F.wr[i], top = add(w, [0, -0.85 * u]), L = add(top, [-0.8 * u, 0.05 * u]), R = add(top, [0.8 * u, -0.05 * u]);
    var o = A.inkLine([add(w, [0, 0.15 * u]), top], 4, 1, '#8a6a2a', { taper: 0.1 }) + A.inkLine([L, top, R], 4, 2, '#b8923a', { taper: 0.1 }) + circ(top, 0.08 * u, '#e3b24a', { k: 1, ink: 1.6 });
    [L, R].forEach(function (p, k) { var pan = add(p, [0, 0.7 * u]); o += '<path d="M' + f(p[0]) + ' ' + f(p[1]) + 'L' + f(pan[0] - 0.3 * u) + ' ' + f(pan[1]) + 'M' + f(p[0]) + ' ' + f(p[1]) + 'L' + f(pan[0] + 0.3 * u) + ' ' + f(pan[1]) + '" stroke="#3a2414" stroke-width="1.4"/>' + S([add(pan, [-0.36 * u, 0]), add(pan, [0.36 * u, 0]), add(pan, [0.2 * u, 0.14 * u]), add(pan, [-0.2 * u, 0.14 * u])], '#d9a840', { k: 2, ink: 2.2 }) + (k ? circ(add(pan, [0, -0.07 * u]), 0.09 * u, '#e9c45a', { k: 1, ink: 1.4 }) : ''); });
    return o;
  };
  P.lute = function (color) {
    return function (F) {
      var u = F.u, c = [F.cx + 0.32 * u, F.pelY - 0.95 * u], tip = F.wr[0], d = norm(sub(tip, c)), n = perp(d), a = ang(d);
      var body = A.ellipsePts(add(c, mul(d, -0.15 * u)), 0.85 * u, 0.62 * u, 14, a);
      var neckEnd = add(tip, mul(d, 0.25 * u));
      var o = S(A.capsule(add(c, mul(d, 0.5 * u)), neckEnd, 0.12 * u, 0.1 * u), '#6b3f22', { k: 2, ink: 2.4 });
      o += S([add(neckEnd, mul(n, 0.12 * u)), add(add(neckEnd, mul(d, 0.4 * u)), mul(n, 0.18 * u)), add(add(neckEnd, mul(d, 0.45 * u)), mul(n, -0.05 * u)), add(neckEnd, mul(n, -0.1 * u))], '#5a321a', { k: 2, ink: 2.4 });
      o += S(body, color || '#c98a3a', { k: 6, rimColor: '#f6d49a', ink: 3, inner: function () { return '<circle cx="' + f(c[0] + d[0] * 0.15 * u) + '" cy="' + f(c[1] + d[1] * 0.15 * u) + '" r="' + f(0.17 * u) + '" fill="#3a2414"/>' + '<circle cx="' + f(c[0] + d[0] * 0.15 * u) + '" cy="' + f(c[1] + d[1] * 0.15 * u) + '" r="' + f(0.24 * u) + '" fill="none" stroke="#7a4a20" stroke-width="2"/>'; } });
      for (var k = -1; k <= 1; k++) o += '<path d="M' + f(c[0] - d[0] * 0.5 * u + n[0] * k * 0.05 * u) + ' ' + f(c[1] - d[1] * 0.5 * u + n[1] * k * 0.05 * u) + 'L' + f(neckEnd[0] + n[0] * k * 0.04 * u) + ' ' + f(neckEnd[1] + n[1] * k * 0.04 * u) + '" stroke="#f6ead0" stroke-width="1.1"/>';
      return o;
    };
  };
  P.bowBack = function (F) {
    var u = F.u, a = add(F.sh[1], [0.5 * u, -1.0 * u]), b = add(F.hip[0], [-0.6 * u, 0.6 * u]), mid = add(lerp2(a, b, 0.5), mul(perp(norm(sub(b, a))), -0.7 * u));
    var q = add(F.sh[0], [-0.25 * u, -0.1 * u]);
    var o = S([add(q, [-0.25 * u, -0.3 * u]), add(q, [0.25 * u, -0.4 * u]), add(q, [0.55 * u, 1.6 * u]), add(q, [0.05 * u, 1.7 * u])], '#7a4a28', { k: 5, ink: 2.8 });
    for (var k = 0; k < 3; k++) { var t = add(q, [-0.1 * u + k * 0.18 * u, -0.5 * u]); o += S([add(t, [-0.08 * u, 0]), add(t, [0, -0.35 * u]), add(t, [0.08 * u, 0])], k % 2 ? '#e8d8b0' : '#c8442b', { k: 1, ink: 1.6 }); }
    return o + '<path d="' + A.ribbon([a, mid, b], false, 0.16 * u, 2, { taper: 0.5 }) + '" fill="#8a5a2a" stroke="#3a2414" stroke-width="2"/><path d="M' + f(a[0]) + ' ' + f(a[1]) + 'L' + f(b[0]) + ' ' + f(b[1]) + '" stroke="#efe2c4" stroke-width="1.4"/>';
  };
  P.helmet = function (plume) {
    return function (F, i) {
      var u = F.u, s = F.s[i], c = add(F.wr[i], [s * 0.15 * u, -0.25 * u]);
      var o = S(A.ellipsePts(add(c, [0, -0.15 * u]), 0.58 * u, 0.62 * u, 12, 0), '#9aa0a6', { k: 6, rimColor: '#f0ead8', ink: 3, inner: function () { return '<rect x="' + f(c[0] - 0.5 * u) + '" y="' + f(c[1] - 0.1 * u) + '" width="' + f(u) + '" height="' + f(0.1 * u) + '" fill="#2a2420"/><rect x="' + f(c[0] - 0.04 * u) + '" y="' + f(c[1] - 0.8 * u) + '" width="' + f(0.08 * u) + '" height="' + f(0.6 * u) + '" fill="#bfc4c8"/>'; } });
      return S([add(c, [-0.08 * u, -0.72 * u]), add(c, [-s * 0.6 * u, -1.25 * u]), add(c, [-s * 1.0 * u, -0.95 * u]), add(c, [-s * 0.4 * u, -0.6 * u])], plume || '#c8442b', { k: 4, ink: 2.4 }) + o;
    };
  };
  P.sword = function (F, i) {
    var u = F.u, w = F.wr[i], x = w[0], hilt = [x, w[1] + 0.2 * u], tip = [x + F.s[i] * 0.1 * u, F.base - 0.05 * u];
    var cross = [[x - 0.55 * u, hilt[1] + 0.25 * u], [x + 0.55 * u, hilt[1] + 0.25 * u], [x + 0.55 * u, hilt[1] + 0.38 * u], [x - 0.55 * u, hilt[1] + 0.38 * u]];
    return S([[x - 0.12 * u, hilt[1] + 0.35 * u], [x + 0.12 * u, hilt[1] + 0.35 * u], add(tip, [0.04 * u, -0.25 * u]), tip, add(tip, [-0.04 * u, -0.25 * u])], '#c9ced2', { k: 3, rimColor: '#ffffff', ink: 2.6 }) + S(cross, '#c98f2a', { k: 2, ink: 2.4 }) + circ([x, hilt[1] - 0.3 * u], 0.12 * u, '#c98f2a', { k: 1, ink: 2 });
  };
  P.flask = function (liquid, smoke) {
    return function (F, i) {
      var u = F.u, w = F.wr[i], c = add(w, [0, 0.55 * u]);
      var o = S(A.capsule(add(w, [0, -0.35 * u]), add(w, [0, 0.25 * u]), 0.1 * u, 0.1 * u), '#dfeee8', { k: 2, ink: 2.2 });
      o += S(A.ellipsePts(c, 0.36 * u, 0.36 * u, 12), '#e6f2ee', { k: 3, ink: 2.6, inner: function () { return '<rect x="' + f(c[0] - u) + '" y="' + f(c[1] - 0.05 * u) + '" width="' + f(2 * u) + '" height="' + f(u) + '" fill="' + liquid + '"/><circle cx="' + f(c[0] - 0.12 * u) + '" cy="' + f(c[1] - 0.14 * u) + '" r="' + f(0.07 * u) + '" fill="#fff"/>'; } });
      if (smoke !== false) { var t = add(w, [0, -0.4 * u]); o += '<g opacity=".85">' + [0, 1, 2].map(function (k) { var p = add(t, [Math.sin(k * 2) * 0.3 * u, -0.45 * u * (k + 1)]); return S(A.ellipsePts(p, (0.2 + k * 0.09) * u, (0.15 + k * 0.06) * u, 9, 0, 0.3, k + 7), light(liquid, 0.65), { shade: false, ink: 1.6, inkOp: 0.6 }); }).join('') + '</g>'; }
      return o;
    };
  };
  P.book = function (color) {
    return function (F, i) {
      var u = F.u, c = add(F.wr[i], [0, 0.25 * u]);
      return S(box(c, 0.45 * u, 0.55 * u, F.s[i] * 10, 0.2), color, { k: 4, ink: 2.8, inner: function () { return '<rect x="' + f(c[0] - 0.5 * u) + '" y="' + f(c[1] - 0.1 * u) + '" width="' + f(u) + '" height="' + f(0.08 * u) + '" fill="#e2b04a"/>'; } });
    };
  };
  P.scroll = function (F) {
    var u = F.u, a = add(F.wr[0], [0.15 * u, 0.1 * u]), b = add(F.wr[1], [-0.15 * u, 0.1 * u]), drop = 1.3 * u;
    var pts = [a, b, add(b, [0.05 * u, drop * 0.6]), add(lerp2(a, b, 0.5), [0, drop]), add(a, [-0.05 * u, drop * 0.7])];
    var o = S(pts, '#f3e4c0', { k: 6, ink: 2.6, inner: function () { var s = ''; for (var k = 0; k < 5; k++) s += A.inkLine([add(a, [0.2 * u, 0.25 * u + k * 0.2 * u]), add(b, [-0.25 * u, 0.25 * u + k * 0.2 * u])], 1.5, k, '#9a7a50', { vary: 0.9, freq: 14 }); return s; } });
    return o + S(A.capsule(add(a, [0, -0.15 * u]), add(a, [0, 0.9 * u]), 0.12 * u, 0.12 * u), '#e2cfa0', { k: 3, ink: 2.4 }) + S(A.capsule(add(b, [0, -0.15 * u]), add(b, [0, 0.7 * u]), 0.12 * u, 0.12 * u), '#e2cfa0', { k: 3, ink: 2.4 });
  };
  P.scepter = function (gem) {
    return function (F, i) {
      var u = F.u, w = F.wr[i], top = add(w, [0, -1.5 * u]);
      return S(A.capsule(add(w, [0, 0.45 * u]), top, 0.08 * u, 0.09 * u), '#c98f2a', { k: 2, rimColor: '#fff0b0', ink: 2.4 }) + circ(add(top, [0, -0.2 * u]), 0.24 * u, gem || '#c8442b', { k: 3, rimColor: '#ffe0d0', ink: 2.4 }) + circ(add(top, [0, -0.5 * u]), 0.08 * u, '#e3b24a', { k: 1, ink: 1.6 });
    };
  };
  P.staff = function (topper) {
    return function (F, i) {
      var u = F.u, w = F.wr[i], bot = [w[0] + F.s[i] * 0.1 * u, F.base - 0.1 * u], top = [w[0] - F.s[i] * 0.15 * u, w[1] - 1.9 * u];
      return S(A.capsule(bot, top, 0.11 * u, 0.13 * u), '#7a4a28', { k: 3, ink: 2.6 }) + (topper ? topper(top, u) : '');
    };
  };
  P.throne = function (side, cloth) {
    return function (F) {
      var u = F.u, x = F.cx + side * 1.75 * u, seat = F.pelY + 0.2 * u;
      var back = [[x - 0.85 * u, seat], [x - 0.95 * u, F.pelY - 3.1 * u], [x - 0.4 * u, F.pelY - 3.7 * u], [x, F.pelY - 3.95 * u], [x + 0.4 * u, F.pelY - 3.7 * u], [x + 0.95 * u, F.pelY - 3.1 * u], [x + 0.85 * u, seat]];
      var o = S(back, '#7a4a28', { k: 8, rimColor: '#e6b878', ink: 3.2, inner: function () { return S([[x - 0.55 * u, seat - 0.3 * u], [x - 0.6 * u, F.pelY - 2.9 * u], [x, F.pelY - 3.4 * u], [x + 0.6 * u, F.pelY - 2.9 * u], [x + 0.55 * u, seat - 0.3 * u]], cloth, { k: 5, ink: 2.4 }); } });
      o += S([[x - 1.05 * u, seat - 0.1 * u], [x + 1.05 * u, seat - 0.1 * u], [x + 1.0 * u, seat + 0.35 * u], [x - 1.0 * u, seat + 0.35 * u]], '#6b3f22', { k: 4, ink: 3 });
      o += S(A.capsule([x - 0.85 * u, seat + 0.3 * u], [x - 0.85 * u, F.base - 0.1 * u], 0.14 * u, 0.12 * u), '#5a3420', { k: 3, ink: 2.6 }) + S(A.capsule([x + 0.85 * u, seat + 0.3 * u], [x + 0.85 * u, F.base - 0.1 * u], 0.14 * u, 0.12 * u), '#5a3420', { k: 3, ink: 2.6 });
      o += circ([x, F.pelY - 3.95 * u], 0.16 * u, '#e3b24a', { k: 2, ink: 2.2 });
      /* spada appoggiata al trono */
      var hilt = [x - side * 0.2 * u, seat - 1.1 * u], tip = [x - side * 1.0 * u, F.base - 0.05 * u], d = norm(sub(tip, hilt)), n = perp(d);
      o += S([add(hilt, mul(n, 0.11 * u)), add(tip, mul(n, 0.03 * u)), tip, sub(tip, mul(n, 0.03 * u)), sub(hilt, mul(n, 0.11 * u))], '#c9ced2', { k: 3, rimColor: '#fff', ink: 2.6 });
      o += S([add(hilt, mul(n, 0.5 * u)), add(add(hilt, mul(n, 0.5 * u)), mul(d, 0.14 * u)), add(sub(hilt, mul(n, 0.5 * u)), mul(d, 0.14 * u)), sub(hilt, mul(n, 0.5 * u))], '#c98f2a', { k: 2, ink: 2.4 });
      o += S(A.capsule(hilt, sub(hilt, mul(d, 0.5 * u)), 0.08 * u, 0.08 * u), '#5a3420', { k: 1, ink: 2 }) + circ(sub(hilt, mul(d, 0.6 * u)), 0.11 * u, '#c98f2a', { k: 1, ink: 2 });
      return o;
    };
  };

  /* ---- Magie elementali: più luminose del resto della carta ---- */
  P.glow = function (c, r, col) {
    var id = 'gl' + (A.uid++);
    return '<radialGradient id="' + id + '"><stop offset="0" stop-color="#fffbe6" stop-opacity=".95"/><stop offset=".25" stop-color="' + col + '" stop-opacity=".7"/><stop offset="1" stop-color="' + col + '" stop-opacity="0"/></radialGradient><circle cx="' + f(c[0]) + '" cy="' + f(c[1]) + '" r="' + f(r) + '" fill="url(#' + id + ')"/>';
  };
  P.fire = function (c, s) {
    var o = P.glow(c, 3.2 * s, '#ff8a2a'), cols = ['#c8442b', '#f07a2a', '#fbbf4a', '#fff0b0'];
    for (var k = 0; k < 4; k++) {
      var h = s * (1.9 - k * 0.38), w = s * (0.95 - k * 0.2), b = add(c, [0, s * 0.7]);
      o += S([[b[0] - w, b[1]], [b[0] - w * 1.05, b[1] - h * 0.45], [b[0] - w * 0.35, b[1] - h * 0.7], [b[0] - w * 0.2, b[1] - h * 1.05], [b[0] + w * 0.1, b[1] - h * 0.62], [b[0] + w * 0.55, b[1] - h * 0.95], [b[0] + w * 1.05, b[1] - h * 0.4], [b[0] + w, b[1]], [b[0], b[1] + w * 0.35]], cols[k], { shade: false, ink: k < 2 ? 2.4 : 0 });
    }
    for (var e = 0; e < 7; e++) { var p = A.polar(c, s * (1.4 + (e % 3) * 0.5), -150 + e * 20); o += '<circle cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="' + f(2 + e % 3) + '" fill="#ffd27a"/>'; }
    return o;
  };
  P.water = function (c, s) {
    var o = P.glow(c, 3 * s, '#6fb6ff'), pts = [];
    for (var k = 0; k < 26; k++) { var a = k * 28, r = s * (0.2 + k * 0.055); pts.push(A.polar(c, r, a)); }
    o += '<path d="' + A.ribbon(pts, false, s * 0.5, 3, { taper: 0.7, vary: 0.3 }) + '" fill="#4b8fd8" stroke="#2a1a10" stroke-width="2"/>';
    o += '<path d="' + A.ribbon(pts, false, s * 0.18, 4, { taper: 0.7, vary: 0.3 }) + '" fill="#d8f0ff"/>';
    for (var d = 0; d < 6; d++) { var p = A.polar(c, s * (1.7 + (d % 2) * 0.3), d * 60 + 20); o += S([add(p, [0, -s * 0.22]), add(p, [s * 0.12, 0]), add(p, [0, s * 0.12]), add(p, [-s * 0.12, 0])], '#8fd0ff', { shade: false, ink: 1.6 }); }
    return o;
  };
  P.nature = function (c, s) {
    var o = P.glow(c, 3 * s, '#9be07a'), pts = [];
    for (var k = 0; k < 22; k++) { var a = -90 + k * 32, r = s * (1.6 - k * 0.06); pts.push(A.polar(c, r, a)); }
    o += '<path d="' + A.ribbon(pts, false, s * 0.16, 5, { taper: 0.6 }) + '" fill="#4a7a2a" stroke="#2a1a10" stroke-width="1.4"/>';
    pts.forEach(function (p, k) { if (k % 2) return; o += S(A.ellipsePts(p, s * 0.24, s * 0.12, 7, k * 32 + 40), k % 4 ? '#5fae5a' : '#8fd06a', { shade: false, ink: 1.6 }); });
    [0, 7, 14].forEach(function (k) { var p = pts[k]; for (var q = 0; q < 5; q++) { var pp = A.polar(p, s * 0.14, q * 72); o += '<circle cx="' + f(pp[0]) + '" cy="' + f(pp[1]) + '" r="' + f(s * 0.11) + '" fill="#f6c6d8" stroke="#3a2414" stroke-width="1"/>'; } o += '<circle cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="' + f(s * 0.07) + '" fill="#f4c860"/>'; });
    return o;
  };
  P.light = function (c, s) {
    var o = P.glow(c, 3.6 * s, '#ffe27a');
    for (var k = 0; k < 16; k++) { var a = k * 22.5, L = s * (k % 2 ? 1.6 : 2.6); o += '<path d="' + A.poly([A.polar(c, s * 0.4, a - 6), A.polar(c, L, a), A.polar(c, s * 0.4, a + 6)], true) + '" fill="#fff2b0" opacity=".85"/>'; }
    var st = [];
    for (var q = 0; q < 16; q++) st.push(A.polar(c, q % 2 ? s * 0.35 : s * 0.95, q * 22.5 - 90));
    return o + S(st, '#ffe066', { shade: false, ink: 2.4 }) + '<circle cx="' + f(c[0]) + '" cy="' + f(c[1]) + '" r="' + f(s * 0.28) + '" fill="#fffbe6"/>';
  };
  P.balls = function (cols) {
    return function (F) {
      var u = F.u, a = F.wr[0], b = F.wr[1], top = add(lerp2(a, b, 0.5), [0, -1.6 * u]);
      return cols.map(function (c, k) { var t = (k + 1) / (cols.length + 1); var p = add(lerp2(a, b, t), [0, -Math.sin(t * Math.PI) * 1.9 * u - 0.3 * u]); return circ(p, 0.22 * u, c, { k: 3, ink: 2.4 }); }).join('') + '<path d="' + A.path([add(a, [0, -0.3 * u]), top, add(b, [0, -0.3 * u])], false) + '" stroke="#fff2c0" stroke-width="2" fill="none" stroke-dasharray="3 7" opacity=".8"/>';
    };
  };
  P.marotte = function (c1, c2) {
    return function (F, i) {
      var u = F.u, w = F.wr[i], d = F.hd[i], top = add(w, mul(d, 1.2 * u)), bot = sub(w, mul(d, 0.6 * u));
      var o = S(A.capsule(bot, top, 0.07 * u, 0.08 * u), '#7a4a28', { k: 2, ink: 2.2 });
      o += S(A.ellipsePts(add(top, mul(d, 0.25 * u)), 0.28 * u, 0.28 * u, 10), '#f0d0b0', { k: 3, ink: 2.4 });
      var hc = add(top, mul(d, 0.55 * u));
      o += S([add(hc, [-0.35 * u, 0.1 * u]), add(hc, [-0.55 * u, -0.25 * u]), add(hc, [0, -0.15 * u]), add(hc, [0.55 * u, -0.25 * u]), add(hc, [0.35 * u, 0.1 * u])], c1, { k: 3, ink: 2.2 });
      o += circ(add(hc, [-0.55 * u, -0.25 * u]), 0.09 * u, '#f2c442', { k: 1, ink: 1.6 }) + circ(add(hc, [0.55 * u, -0.25 * u]), 0.09 * u, '#f2c442', { k: 1, ink: 1.6 });
      return o;
    };
  };
  P.tambourine = function (F, i) {
    var u = F.u, c = add(F.wr[i], mul(F.hd[i], 0.45 * u));
    var o = S(A.ellipsePts(c, 0.55 * u, 0.55 * u, 14), '#c98a3a', { k: 4, ink: 3, inner: function () { return '<circle cx="' + f(c[0]) + '" cy="' + f(c[1]) + '" r="' + f(0.42 * u) + '" fill="#f3e4c0"/>'; } });
    for (var k = 0; k < 6; k++) { var p = A.polar(c, 0.55 * u, k * 60); o += '<circle cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="' + f(0.08 * u) + '" fill="#e3b24a" stroke="#3a2414" stroke-width="1.4"/>'; }
    return o;
  };
})(typeof self !== 'undefined' ? self : this);
