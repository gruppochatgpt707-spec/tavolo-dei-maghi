/* Paesaggi a strati per i quattro semi: canyon, costa, foresta, colline di girasoli. */
(function (root) {
  'use strict';
  var A = root.ART, f = A.f, mix = A.mix, dark = A.dark, light = A.light;

  A.PAL = {
    r: { name: 'canyon', main: '#C8442B', skyTop: '#B9492F', skyMid: '#DD7A4C', horizon: '#F6CB86', far: '#DE9670', far2: '#D07A57', mid: '#C8442B', mid2: '#A63621',
      ground: '#C65E37', ground2: '#B04A2A', fore: '#9A3A22', accent: '#3E8E8A', accent2: '#E9C46A', cloth: ['#C8442B', '#A83A24', '#D9603C', '#8E2E1C'] },
    b: { name: 'costa', main: '#2F5FA8', skyTop: '#2B528F', skyMid: '#5778B5', horizon: '#F1C487', far: '#7D93C6', far2: '#6680B9', mid: '#2F5FA8', mid2: '#27508F',
      ground: '#4C6FAE', ground2: '#3A5C98', fore: '#294A85', sea: '#2F5FA8', accent: '#E39A3A', accent2: '#F2D7A2', cloth: ['#2F5FA8', '#264D8C', '#4A79C0', '#1E3C70'] },
    g: { name: 'foresta', main: '#3E8A4F', skyTop: '#8BB77E', skyMid: '#B9D08A', horizon: '#F2DE98', far: '#8CB78B', far2: '#6EA174', mid: '#3E8A4F', mid2: '#2F6F40',
      ground: '#4B8A4E', ground2: '#3A7440', fore: '#2A5C35', canopy: '#2C5C38', accent: '#C9574F', accent2: '#F4C860', cloth: ['#3E8A4F', '#33733F', '#58A063', '#285C34'] },
    y: { name: 'girasoli', main: '#E0A526', skyTop: '#DE9A33', skyMid: '#EDBA4C', horizon: '#FCE6A6', far: '#EED08C', far2: '#E8C06A', mid: '#E0A526', mid2: '#C98E1E',
      ground: '#D69A2A', ground2: '#BE8420', fore: '#A8731C', accent: '#5B4E9A', accent2: '#8C5A9E', cloth: ['#E0A526', '#C98E1E', '#EDBE52', '#A8731C'] },
    /* Maghi: notte stellata viola, nessun colore dei semi */
    w: { name: 'notte', main: '#5B3A8C', skyTop: '#140f2e', skyMid: '#2f2163', horizon: '#9a7cc8', far: '#4d3a86', far2: '#3c2d6e', mid: '#5B3A8C', mid2: '#3e2a66',
      ground: '#35285f', ground2: '#2a1f4e', fore: '#211840', accent: '#c9b8ff', accent2: '#e8e2f6', cloth: ['#5B3A8C', '#3f2a6e', '#7a5aa8', '#2e2050'] },
    /* Giullari: palcoscenico bianco e nero, argento e oro */
    j: { name: 'palco', main: '#2b272b', skyTop: '#4a4648', skyMid: '#9d968e', horizon: '#f1e9d8', far: '#d8cfbf', far2: '#c9bfae', mid: '#2b272b', mid2: '#3a3438',
      ground: '#d9cfbd', ground2: '#b9ae9c', fore: '#8f8678', accent: '#d4af37', accent2: '#f4efe6', cloth: ['#f1ece2', '#2b272b', '#bdb6ac', '#1f1c1f'] }
  };

  function ridge(r, y, amp, freq, x0, x1, bottom) {
    var pts = [], nz = A.noise1(Math.floor(r() * 9999)), step = 40, ph = r() * 20;
    pts.push([x0, bottom || 940]);
    for (var x = x0; x <= x1 + 0.1; x += step) pts.push([x, y + (nz(x / 600 * freq + ph) - 0.5) * 2 * amp]);
    pts.push([x1, bottom || 940]);
    return pts;
  }
  /* Disegna uno strato di paesaggio con pennellate, luce sul bordo alto e contorno leggero */
  function land(pts, color, r, o) {
    o = o || {};
    var box = [0, Math.min.apply(null, pts.map(function (p) { return p[1]; })), 600, 900];
    return A.shape(pts, {
      fill: color, k: o.k || 6, rim: o.rim === undefined ? 2.5 : o.rim, ink: o.ink === undefined ? 2 : o.ink, inkOp: o.inkOp || 0.85, dk: o.dk || 0.18,
      rimColor: o.rimColor, inner: function () {
        return A.brush(r, box, light(color, 0.25), o.strokes || 14, 60, 5, o.angle || 0, 0.28) + A.brush(r, box, dark(color, 0.2), (o.strokes || 14) / 2, 50, 4, o.angle || 0, 0.25) + (o.extra || '');
      }
    });
  }

  function sky(P, sun, hy, r) {
    var id = 'sky' + (A.uid++), g = 'sg' + (A.uid++);
    var s = '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + P.skyTop + '"/><stop offset=".45" stop-color="' + P.skyMid + '"/><stop offset="' + f(hy / 900) + '" stop-color="' + P.horizon + '"/><stop offset="1" stop-color="' + P.horizon + '"/></linearGradient>';
    s += '<radialGradient id="' + g + '" cx="' + f(sun[0] / 600) + '" cy="' + f(sun[1] / 900) + '" r=".62" gradientTransform="translate(' + f(sun[0] / 600) + ' ' + f(sun[1] / 900) + ') scale(1 .667) translate(' + f(-sun[0] / 600) + ' ' + f(-sun[1] / 900) + ')"><stop offset="0" stop-color="#fff4cf" stop-opacity=".95"/><stop offset=".18" stop-color="' + light(P.horizon, 0.3) + '" stop-opacity=".6"/><stop offset="1" stop-color="' + P.horizon + '" stop-opacity="0"/></radialGradient>';
    s += '<rect width="600" height="900" fill="url(#' + id + ')"/><rect width="600" height="900" fill="url(#' + g + ')"/>';
    /* nuvole piatte ai lati, illuminate da sotto */
    for (var i = 0; i < 3; i++) {
      var left = i % 2 === 0, cx = left ? 70 + r() * 130 : 400 + r() * 140, cy = 300 + r() * (hy - 380);
      if (Math.abs(cx - 300) < 120) continue;
      var w = 70 + r() * 70, pts = [];
      for (var k = 0; k < 9; k++) {
        var a = Math.PI + k / 8 * Math.PI, bump = 0.75 + r() * 0.45;
        pts.push([cx + Math.cos(a) * w, cy + Math.sin(a) * w * 0.28 * bump]);
      }
      pts.push([cx + w * 0.8, cy + 7]); pts.push([cx - w * 0.8, cy + 7]);
      s += A.shape(pts, { fill: A.warm(mix(P.skyMid, P.horizon, 0.6), 0.18), k: 4, rim: 3, rimColor: '#fff2c2', ink: 1.6, inkOp: 0.45, dk: 0.1 });
    }
    s += '<circle cx="' + f(sun[0]) + '" cy="' + f(sun[1]) + '" r="34" fill="#fff3c8" filter="url(#soft)"/><circle cx="' + f(sun[0]) + '" cy="' + f(sun[1]) + '" r="27" fill="#fff8de"/>';
    return s;
  }

  function stage(P, sun, hy) {
    var id = 'st' + (A.uid++), g = 'sp' + (A.uid++);
    var s = '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + P.skyTop + '"/><stop offset=".5" stop-color="' + P.skyMid + '"/><stop offset="' + f(hy / 900) + '" stop-color="' + P.horizon + '"/><stop offset="1" stop-color="' + P.horizon + '"/></linearGradient>';
    s += '<radialGradient id="' + g + '" cx=".5" cy=".55" r=".55"><stop offset="0" stop-color="#fff8e6" stop-opacity=".9"/><stop offset=".55" stop-color="#fff1d0" stop-opacity=".35"/><stop offset="1" stop-color="#fff1d0" stop-opacity="0"/></radialGradient>';
    return s + '<rect width="600" height="900" fill="url(#' + id + ')"/><rect width="600" height="900" fill="url(#' + g + ')"/>';
  }

  function longShadow(cx, base, P, sunX, w) {
    var dir = sunX < 300 ? 1 : -1, len = 270;
    var pts = [[cx - w * 0.9, base - 6], [cx + w * 0.9, base - 6], [cx + w + dir * len * 0.9, base + 26], [cx + dir * len, base + 40], [cx - w + dir * len * 0.7, base + 34]];
    return '<path d="' + A.path(pts, true) + '" fill="' + dark(P.ground2, 0.55) + '" opacity=".6" filter="url(#soft)"/>';
  }

  /* ---- Motivi ricorrenti ---- */
  A.falcon = function (x, y, s, flip, P) {
    var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (flip ? -s : s) + ' ' + s + ')">';
    var body = [[-14, 0], [-4, -6], [10, -5], [22, -2], [12, 3], [-2, 5]];
    var w1 = [[-2, -3], [-12, -22], [-26, -30], [-40, -28], [-22, -14], [-8, 0]];
    var w2 = [[4, -4], [14, -24], [30, -34], [44, -30], [26, -14], [10, -1]];
    g += A.shape(w1, { fill: '#6b3b22', shade: false, ink: 1.6 }) + A.shape(w2, { fill: '#7a4528', shade: false, ink: 1.6 }) + A.shape(body, { fill: '#5b3220', shade: false, ink: 1.6 });
    g += '<path d="M-14 0 L-24 -3 L-24 4Z" fill="#4a2a1a"/><circle cx="16" cy="-2.5" r="1.3" fill="#fff1c0"/>';
    return g + '</g>';
  };
  A.sail = function (x, y, s, flip) {
    var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (flip ? -s : s) + ' ' + s + ')">';
    g += A.shape([[-26, 0], [26, 0], [18, 9], [-20, 9]], { fill: '#6b3b22', shade: false, ink: 1.6 });
    g += '<path d="M0 0V-50" stroke="#3a2414" stroke-width="2.4"/>';
    g += A.shape([[2, -48], [30, -6], [2, -4]], { fill: '#f6e6c0', shade: false, ink: 1.6 }) + A.shape([[-2, -40], [-22, -6], [-2, -5]], { fill: '#e8cf9a', shade: false, ink: 1.5 });
    return g + '</g>';
  };
  A.lantern = function (x, y, s) {
    var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')">';
    g += '<circle cx="0" cy="18" r="34" fill="#ffd47a" opacity=".45" filter="url(#soft)"/>';
    g += '<path d="M0 -40V-6" stroke="#3a2414" stroke-width="2" stroke-dasharray="4 3"/>';
    g += A.shape([[-10, -6], [10, -6], [6, -12], [-6, -12]], { fill: '#4a3424', shade: false, ink: 1.6 });
    g += A.shape([[-11, -6], [11, -6], [13, 30], [-13, 30]], { fill: '#ffd06a', shade: false, ink: 2, inner: function () { return '<path d="M0 -4V30M-12 12H12" stroke="#5a3a20" stroke-width="2"/><circle cx="0" cy="13" r="6" fill="#fff6d0"/>'; } });
    g += A.shape([[-14, 30], [14, 30], [10, 37], [-10, 37]], { fill: '#4a3424', shade: false, ink: 1.6 });
    return g + '</g>';
  };
  A.butterfly = function (x, y, s, rotd, c1, c2) {
    var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + (rotd || 0) + ') scale(' + s + ')">';
    g += A.shape([[0, -2], [-14, -18], [-24, -12], [-18, 2]], { fill: c1, shade: false, ink: 1.4 }) + A.shape([[0, -2], [14, -18], [24, -12], [18, 2]], { fill: c1, shade: false, ink: 1.4 });
    g += A.shape([[0, 0], [-16, 4], [-12, 16], [-2, 8]], { fill: c2, shade: false, ink: 1.3 }) + A.shape([[0, 0], [16, 4], [12, 16], [2, 8]], { fill: c2, shade: false, ink: 1.3 });
    g += '<path d="M0 -8V10" stroke="#3a2414" stroke-width="3" stroke-linecap="round"/><path d="M0 -8Q-4 -16 -7 -18M0 -8Q4 -16 7 -18" stroke="#3a2414" stroke-width="1.2" fill="none"/>';
    g += '<circle cx="-15" cy="-11" r="2.4" fill="#fff0c8"/><circle cx="15" cy="-11" r="2.4" fill="#fff0c8"/>';
    return g + '</g>';
  };

  function sunflower(x, y, s, facing) {
    var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')">';
    g += '<path d="M0 6 Q' + (facing * 4) + ' 40 0 80" stroke="#5c7a2a" stroke-width="5" fill="none"/>';
    g += A.shape([[0, 44], [-20, 34], [-30, 40], [-12, 52]], { fill: '#6f8f30', shade: false, ink: 1.4 });
    var petals = '';
    for (var i = 0; i < 12; i++) {
      var a = i * 30, p = A.polar([0, 0], 16, a);
      petals += '<ellipse cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" rx="8" ry="4.2" transform="rotate(' + a + ' ' + f(p[0]) + ' ' + f(p[1]) + ')" fill="#f2b632" stroke="#3a2414" stroke-width="1.1"/>';
    }
    g += '<g transform="translate(' + (facing * 2) + ' 0) scale(' + (1 - Math.abs(facing) * 0.12) + ' 1)">' + petals + '<circle r="10" fill="#5a3412" stroke="#3a2414" stroke-width="1.4"/><circle r="5" fill="#3d220c" opacity=".6"/></g>';
    return g + '</g>';
  }
  function fern(x, y, s, flip, color) {
    var g = '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + (flip ? -s : s) + ' ' + s + ')">';
    for (var k = 0; k < 4; k++) {
      var a = -150 + k * 28, tip = A.polar([0, 0], 70 - k * 6, a), mid = A.polar([0, 0], 38, a + 8);
      g += A.inkLine([[0, 0], mid, tip], 3, k + 3, dark(color, 0.3));
      for (var j = 1; j < 7; j++) {
        var b = A.lerp2([0, 0], tip, j / 7), l = 14 - j;
        g += A.shape(A.ellipsePts(A.polar(b, l * 0.6, a - 70), l, 3.5, 6, a - 70), { fill: color, shade: false, ink: 1 }) + A.shape(A.ellipsePts(A.polar(b, l * 0.6, a + 70), l, 3.5, 6, a + 70), { fill: light(color, 0.12), shade: false, ink: 1 });
      }
    }
    return g + '</g>';
  }
  function rock(c, w, h, color, r) {
    var pts = [[c[0] - w, c[1]], [c[0] - w * 0.85, c[1] - h * 0.7], [c[0] - w * 0.2, c[1] - h], [c[0] + w * 0.5, c[1] - h * 0.85], [c[0] + w, c[1] - h * 0.3], [c[0] + w * 0.9, c[1] + 4], [c[0], c[1] + 6]];
    return A.shape(pts.map(function (p) { return [p[0] + (r() - 0.5) * 6, p[1] + (r() - 0.5) * 4]; }), { fill: color, k: 7, rim: 3, ink: 2.4, dk: 0.25 });
  }
  function tuft(x, y, s, color) {
    var g = '';
    for (var i = 0; i < 6; i++) {
      var a = -90 + (i - 2.5) * 16, tip = A.polar([x, y], 22 * s * (0.7 + (i % 3) * 0.2), a);
      g += A.inkLine([[x + (i - 2.5) * 2, y], A.lerp2([x, y], tip, 0.5), tip], 3.2 * s, i + 9, color, { taper: 0.9 });
    }
    return g;
  }

  /* ---- Scene ---- */
  A.scene = function (suit, r, o) {
    var P = A.PAL[suit], sunLeft = o.sunLeft, hy = o.hy || 560 + r() * 30;
    var sun = [sunLeft ? 150 + r() * 70 : 450 - r() * 70, hy - 30 - r() * 50];
    var back = suit === 'j' ? stage(P, sun, hy) : sky(P, sun, hy, r), fore = '', side = sunLeft ? 1 : -1, motifSide = o.motifSide;
    var mx = motifSide < 0 ? 110 + r() * 50 : 490 - r() * 50, V = o.variant || 0;

    if (suit === 'w') {
      /* cielo stellato con luna, via lattea e la torre del mago */
      back += '<path d="' + A.ribbon([[-30, 150 + r() * 60], [300, 210], [630, 100 + r() * 60]], false, 110, 3, { taper: 0.2, vary: 0.4 }) + '" fill="#cdb6ff" opacity=".14" filter="url(#soft)"/>';
      for (var st = 0; st < 80; st++) { var sx = r() * 600, sy = r() * (hy - 60); back += '<circle cx="' + f(sx) + '" cy="' + f(sy) + '" r="' + f(0.8 + r() * 1.8) + '" fill="#fff6dc" opacity="' + f(0.45 + r() * 0.55) + '"/>'; }
      for (var sk = 0; sk < 7; sk++) { var kx = 30 + r() * 540, ky = 40 + r() * (hy - 200), kz = 4 + r() * 5; if (Math.abs(kx - 300) < 90 && ky > 200) continue; back += '<path d="M' + f(kx) + ' ' + f(ky - kz) + 'L' + f(kx + kz * 0.25) + ' ' + f(ky - kz * 0.25) + 'L' + f(kx + kz) + ' ' + f(ky) + 'L' + f(kx + kz * 0.25) + ' ' + f(ky + kz * 0.25) + 'L' + f(kx) + ' ' + f(ky + kz) + 'L' + f(kx - kz * 0.25) + ' ' + f(ky + kz * 0.25) + 'L' + f(kx - kz) + ' ' + f(ky) + 'L' + f(kx - kz * 0.25) + ' ' + f(ky - kz * 0.25) + 'Z" fill="#fff3c4"/>'; }
      back += '<circle cx="' + f(sun[0] + 11) + '" cy="' + f(sun[1] - 8) + '" r="25" fill="' + P.skyMid + '"/>';
      back += land(ridge(r, hy - 80, 64, 2, -20, 620), mix(P.far, P.horizon, 0.18), r, { ink: 0, rim: 1.5, rimColor: '#d9c8ff', strokes: 6 });
      back += land(ridge(r, hy - 14, 34, 3, -20, 620), P.far2, r, { ink: 1.4, inkOp: 0.5, rimColor: '#c9b8ff', strokes: 8 });
      var tx = mx, tb = hy + 30;
      back += '<circle cx="' + f(tx) + '" cy="' + f(tb - 120) + '" r="40" fill="#ffd77a" opacity=".28" filter="url(#soft)"/>';
      back += A.shape([[tx - 24, tb], [tx - 19, tb - 150], [tx + 19, tb - 150], [tx + 24, tb]], { fill: '#4a3a6e', k: 6, ink: 2.4, inner: function () { return '<rect x="' + f(tx - 6) + '" y="' + f(tb - 128) + '" width="12" height="18" rx="6" fill="#ffd77a" stroke="#2a1a0c" stroke-width="1.6"/><rect x="' + f(tx - 5) + '" y="' + f(tb - 70) + '" width="10" height="14" rx="5" fill="#ffd77a" stroke="#2a1a0c" stroke-width="1.4"/>'; } });
      back += A.shape([[tx - 32, tb - 146], [tx + 2, tb - 222], [tx + 32, tb - 146]], { fill: '#2e2050', k: 4, ink: 2.4 }) + '<path d="M' + f(tx + 2) + ' ' + f(tb - 222) + 'l10 -12" stroke="#2a1a0c" stroke-width="2"/><circle cx="' + f(tx + 13) + '" cy="' + f(tb - 236) + '" r="4" fill="#fff3c4"/>';
      back += land(ridge(r, hy + 70, 16, 2, -20, 620), P.ground, r, { k: 8, ink: 2.4, rimColor: '#b9a2ee', strokes: 18 });
      back += land(ridge(r, hy + 150, 12, 2, -20, 620), P.ground2, r, { k: 8, ink: 2.2, rimColor: '#a48ad8', strokes: 20, angle: 4 });
      for (var ff = 0; ff < 12; ff++) { var fx2 = r() * 600, fy2 = hy + 40 + r() * 220; if (Math.abs(fx2 - 300) < 80) continue; back += '<circle cx="' + f(fx2) + '" cy="' + f(fy2) + '" r="7" fill="#ffe680" opacity=".25" filter="url(#soft)"/><circle cx="' + f(fx2) + '" cy="' + f(fy2) + '" r="2.2" fill="#fff4b0"/>'; }
      fore += rock([sunLeft ? 500 : 100, 742], 46, 40, P.fore, r) + rock([sunLeft ? 90 : 510, 700], 30, 26, mix(P.fore, P.ground, 0.4), r);
      fore += tuft(sunLeft ? 140 : 460, 720, 1, '#6a5c9a') + tuft(sunLeft ? 452 : 152, 760, 0.8, '#5a4e88');
    } else if (suit === 'j') {
      /* palcoscenico: sipario scuro, pavimento a scacchi, festone di bandierine */
      var fy0 = hy + 30, Vy = fy0 - 300, X = function (u, y) { return 300 + u * 64 * (y - Vy) / (900 - Vy); };
      back += '<rect y="' + f(fy0) + '" width="600" height="' + f(900 - fy0) + '" fill="#efe6d4"/>';
      var rows = [0, 0.07, 0.16, 0.28, 0.43, 0.62, 0.86, 1.15], tiles = '';
      for (var ro = 0; ro < rows.length - 1; ro++) {
        var y1 = fy0 + (900 - fy0) * rows[ro], y2 = fy0 + (900 - fy0) * rows[ro + 1];
        for (var u = -9; u < 9; u++) if ((u + ro) % 2 === 0) tiles += '<path d="M' + f(X(u, y1)) + ' ' + f(y1) + 'L' + f(X(u + 1, y1)) + ' ' + f(y1) + 'L' + f(X(u + 1, y2)) + ' ' + f(y2) + 'L' + f(X(u, y2)) + ' ' + f(y2) + 'Z"/>';
      }
      back += '<g fill="#2b272b" opacity=".85" stroke="#2a1a0c" stroke-width="1.2">' + tiles + '</g>';
      back += '<path d="M0 ' + f(fy0) + 'H600" stroke="#2a1a0c" stroke-width="3"/>';
      back += '<path d="M230 -10H370L560 ' + f(fy0 + 120) + 'H40Z" fill="#fff7e2" opacity=".2" filter="url(#soft)"/>';
      [1, -1].forEach(function (sd) {
        var x0 = sd > 0 ? -20 : 620, x1 = sd > 0 ? 128 : 472, pts = [[x0, -20], [x1, -20], [x1 - sd * 18, 160], [x1 - sd * 44, 380], [x1 - sd * 70, 520], [x1 - sd * 40, fy0 + 40], [x0, fy0 + 40]];
        back += land(pts, P.mid, r, { k: 8, rim: 2.5, rimColor: '#8a8490', ink: 2.4, strokes: 6, angle: 90, extra: (function () { var q = ''; for (var j = 0; j < 5; j++) { var xx = x0 + sd * (22 + j * 26); q += A.inkLine([[xx, -10], [xx + sd * (j * 2), 300], [xx - sd * (10 + j * 6), fy0 + 30]], 5, j + (sd > 0 ? 0 : 20), j % 2 ? '#1c191c' : '#4a444a', { vary: 0.6, taper: 0.3 }); } return q; })() });
        back += A.shape([[x1 - sd * 84, 504], [x1 - sd * 50, 490], [x1 - sd * 46, 530], [x1 - sd * 82, 540]], { fill: P.accent, shade: false, ink: 1.8 });
      });
      var val = '';
      for (var vk = 0; vk < 8; vk++) { var vx = vk * 80 - 10; val += '<path d="M' + vx + ' 52Q' + (vx + 40) + ' 96 ' + (vx + 80) + ' 52" fill="' + P.mid2 + '" stroke="#2a1a0c" stroke-width="2"/>'; }
      back += '<rect x="-10" y="-10" width="620" height="64" fill="' + P.mid2 + '" stroke="#2a1a0c" stroke-width="2"/>' + val + '<path d="M-10 54H610" stroke="' + P.accent + '" stroke-width="4"/>';
      var bunt = '', by = function (x) { return 150 + Math.sin((x + 20) / 640 * Math.PI) * 60; };
      bunt += '<path d="M-10 ' + f(by(-10)) + ' Q300 ' + f(by(300) + 60) + ' 610 ' + f(by(610)) + '" fill="none" stroke="#2a1a0c" stroke-width="2"/>';
      for (var bk = 0; bk < 14; bk++) { var bx2 = 10 + bk * 44, byy = (function (x) { var t = (x + 10) / 620; return (1 - t) * (1 - t) * by(-10) + 2 * (1 - t) * t * (by(300) + 60) + t * t * by(610); })(bx2); bunt += '<path d="M' + f(bx2 - 13) + ' ' + f(byy) + 'L' + f(bx2 + 13) + ' ' + f(byy) + 'L' + f(bx2) + ' ' + f(byy + 30) + 'Z" fill="' + ['#f4efe6', '#2b272b', '#d4af37'][bk % 3] + '" stroke="#2a1a0c" stroke-width="1.5"/>'; }
      back += bunt;
      for (var cf = 0; cf < 16; cf++) { var cx3 = r() * 600, cy3 = fy0 + 30 + r() * 300; if (Math.abs(cx3 - 300) < 70) continue; back += '<rect x="' + f(cx3) + '" y="' + f(cy3) + '" width="7" height="7" transform="rotate(45 ' + f(cx3 + 3.5) + ' ' + f(cy3 + 3.5) + ')" fill="' + ['#f4efe6', '#2b272b', '#d4af37', '#9a94a0'][cf % 4] + '" stroke="#2a1a0c" stroke-width=".8"/>'; }
    } else if (suit === 'r') {
      /* mesas lontane */
      for (var i = 0; i < 3; i++) {
        var x0 = -40 + i * 220 + r() * 60, w = 120 + r() * 90, top = hy - 30 - r() * 50;
        back += land([[x0, hy + 20], [x0 + 8, top + 18], [x0 + 22, top], [x0 + w - 24, top], [x0 + w - 10, top + 16], [x0 + w, hy + 20]], mix(P.far, P.horizon, 0.25 + i * 0.05), r, { ink: 0, rim: 1.5, strokes: 6 });
      }
      back += land(ridge(r, hy + 10, 10, 3, -20, 620), P.far2, r, { ink: 1.4, inkOp: 0.5, strokes: 8 });
      /* grande rupe a strati sul lato opposto al sole */
      if (V === 1) {
        /* pinnacoli e arco di roccia */
        for (var hd = 0; hd < 3; hd++) {
          var hx = (sunLeft ? 380 : 40) + hd * 62 + r() * 20, top2 = 360 + r() * 90 + hd * 20, hw2 = 18 + r() * 10;
          back += land([[hx - hw2, hy + 110], [hx - hw2 * 0.8, top2 + 40], [hx - hw2 * 0.6, top2 + 10], [hx + hw2 * 0.6, top2 + 6], [hx + hw2 * 0.85, top2 + 40], [hx + hw2, hy + 110]], hd % 2 ? P.mid2 : P.mid, r, { k: 8, ink: 2.4, strokes: 5, angle: 90 });
          back += A.shape([[hx - hw2 * 1.4, top2 + 12], [hx - hw2 * 1.1, top2 - 12], [hx + hw2 * 1.1, top2 - 14], [hx + hw2 * 1.4, top2 + 10], [hx, top2 + 18]], { fill: dark(P.mid, 0.12), k: 5, ink: 2.2 });
        }
        var ax2 = sunLeft ? 90 : 420;
        back += land([[ax2 - 60, hy + 10], [ax2 - 52, hy - 60], [ax2, hy - 78], [ax2 + 56, hy - 60], [ax2 + 64, hy + 10], [ax2 + 34, hy + 10], [ax2 + 30, hy - 30], [ax2, hy - 44], [ax2 - 30, hy - 30], [ax2 - 34, hy + 10]], mix(P.far2, P.horizon, 0.15), r, { ink: 1.4, inkOp: 0.6, strokes: 4 });
      } else if (V === 2) {
        /* pareti del canyon ai due lati, con il fiume sul fondo */
        [[-30, 96, 360], [504, 630, 380]].forEach(function (wl, k) {
          var x0 = wl[0], x1 = wl[1], tt = wl[2] + r() * 40;
          var pts = k === 0 ? [[x0, hy + 160], [x0, tt], [x1 - 20, tt + 6], [x1, tt + 60], [x1 - 10, hy + 40], [x1 + 30, hy + 160]] : [[x1, hy + 160], [x1, tt], [x0 + 20, tt + 6], [x0, tt + 60], [x0 + 10, hy + 40], [x0 - 30, hy + 160]];
          back += land(pts, k ? P.mid2 : P.mid, r, { k: 10, rim: 3.5, ink: 2.6, strokes: 10, extra: (function () { var q = ''; for (var j = 0; j < 8; j++) { var yy = tt + 24 + j * 30; q += A.inkLine([[x0 - 20, yy], [x1 + 20, yy + (r() - 0.5) * 10]], 7 + r() * 5, j + k * 9, j % 2 ? dark(P.mid, 0.18) : light(P.mid, 0.1), { vary: 0.9, taper: 0.2 }); } return q; })() });
        });
      } else {
      var bx = sunLeft ? 410 + r() * 40 : -30 + r() * 40, bw = 230, bt = 400 + r() * 50;
      var butte = [[bx, hy + 120], [bx + 14, bt + 50], [bx + 34, bt + 8], [bx + 60, bt], [bx + bw - 50, bt + 4], [bx + bw - 26, bt + 30], [bx + bw, bt + 90], [bx + bw + 10, hy + 120]];
      back += land(butte, P.mid, r, { k: 10, rim: 3.5, ink: 2.6, strokes: 10, extra: (function () {
        var s = '';
        for (var k = 0; k < 7; k++) { var yy = bt + 30 + k * 26 + r() * 8; s += A.inkLine([[bx - 10, yy], [bx + bw / 2, yy + (r() - 0.5) * 10], [bx + bw + 20, yy + (r() - 0.5) * 8]], 6 + r() * 6, k * 7 + 1, k % 2 ? dark(P.mid, 0.18) : light(P.mid, 0.12), { vary: 0.9, taper: 0.2 }); }
        return s;
      })() });
      }
      back += land(ridge(r, hy + 70, 16, 2, -20, 620), P.ground, r, { k: 8, ink: 2.4, strokes: 18 });
      if (V === 2) back += '<path d="' + A.ribbon([[300 + side * 60, hy + 80], [300 - side * 80, hy + 140], [300 + side * 120, hy + 230], [300 - side * 160, 940]], false, 70, 8, { taper: 1.2, vary: 0.3 }) + '" fill="#4f9a9a" opacity=".85"/>';
      back += land(ridge(r, hy + 150, 12, 2, -20, 620), P.ground2, r, { k: 8, ink: 2.2, strokes: 20, angle: 4 });
      back += A.falcon(mx, 330 + r() * 90, 0.95, motifSide > 0, P);
      fore += rock([sunLeft ? 500 : 100, 742], 46, 40, P.fore, r) + rock([sunLeft ? 90 : 510, 700], 30, 26, mix(P.fore, P.ground, 0.4), r);
      fore += tuft(sunLeft ? 140 : 460, 720, 1, '#5f8a68') + tuft(sunLeft ? 452 : 152, 760, 0.8, '#4f7d64');
    } else if (suit === 'b') {
      /* mare, promontorio lontano con faro, porto */
      back += '<rect y="' + f(hy) + '" width="600" height="' + f(900 - hy) + '" fill="' + P.sea + '"/>';
      for (var w2 = 0; w2 < 22; w2++) {
        var yy = hy + 8 + w2 * w2 * 0.55 + r() * 4, xx = r() * 600, ll = 20 + w2 * 3;
        back += A.inkLine([[xx - ll, yy], [xx, yy - 1.5], [xx + ll, yy]], 2 + w2 * 0.18, w2, light(P.sea, 0.35), { vary: 0.5 });
      }
      for (var gl = 0; gl < 12; gl++) {
        var gy = hy + 6 + gl * 9, gx = sun[0] + (r() - 0.5) * (20 + gl * 6);
        back += A.inkLine([[gx - 10 - gl, gy], [gx + 10 + gl, gy]], 3, gl + 40, '#ffe4a8', { vary: 0.4 });
      }
      var hx0 = sunLeft ? 360 : -20;
      back += land([[hx0, hy + 2], [hx0 + 30, hy - 26], [hx0 + 120, hy - 34], [hx0 + 200, hy - 18], [hx0 + 260, hy + 2]], mix(P.far, P.horizon, 0.3), r, { ink: 0, rim: 1.5, strokes: 5 });
      var lx = hx0 + 150;
      back += A.shape([[lx - 5, hy - 30], [lx + 5, hy - 30], [lx + 4, hy - 62], [lx - 4, hy - 62]], { fill: '#f1e2c2', shade: false, ink: 1.2 }) + '<circle cx="' + f(lx) + '" cy="' + f(hy - 66) + '" r="9" fill="#fff0b0" opacity=".8" filter="url(#soft)"/>';
      for (var hh = 0; hh < 5; hh++) {
        var hxx = hx0 + 50 + hh * 16, hyy = hy - 30 + (hh % 2) * 4;
        back += A.shape([[hxx, hyy], [hxx + 12, hyy], [hxx + 12, hyy - 10], [hxx + 6, hyy - 16], [hxx, hyy - 10]], { fill: hh % 2 ? '#e9d6b0' : '#d8b98a', shade: false, ink: 1 });
      }
      back += A.sail(mx, hy + 2, 0.8, motifSide > 0);
      if (V === 1) {
        /* porticciolo: case sul colle e pontile di legno */
        var px = sunLeft ? 380 : 0;
        back += land([[px - 20, 760], [px, hy - 10], [px + 90, hy - 40], [px + 240, hy - 20], [px + 240, 760]], P.mid2, r, { k: 8, ink: 2.4, strokes: 8 });
        for (var hs2 = 0; hs2 < 5; hs2++) {
          var hx2 = px + 20 + hs2 * 40 + r() * 8, hy2 = hy - 14 - (hs2 % 3) * 12, hw3 = 16 + r() * 6;
          back += A.shape([[hx2 - hw3, hy2 + 30], [hx2 - hw3, hy2], [hx2 + hw3, hy2], [hx2 + hw3, hy2 + 30]], { fill: hs2 % 2 ? '#efe0bf' : '#e2cba0', k: 4, ink: 2 }) + A.shape([[hx2 - hw3 - 4, hy2 + 2], [hx2, hy2 - 18], [hx2 + hw3 + 4, hy2 + 2]], { fill: hs2 % 2 ? P.accent : '#b8562a', k: 3, ink: 2 }) + '<rect x="' + f(hx2 - 4) + '" y="' + f(hy2 + 10) + '" width="8" height="9" fill="#ffd27a" stroke="#3a2414" stroke-width="1.4"/>';
        }
        var pier = sunLeft ? [380, 600] : [0, 220];
        for (var pp2 = 0; pp2 < 6; pp2++) back += A.shape([[pier[0] + pp2 * 38, 700], [pier[0] + pp2 * 38 + 8, 700], [pier[0] + pp2 * 38 + 8, 640], [pier[0] + pp2 * 38, 640]], { fill: '#6b4426', k: 3, ink: 2 });
        back += A.shape([[pier[0] - 10, 646], [pier[1] + 10, 640], [pier[1] + 10, 654], [pier[0] - 10, 660]], { fill: '#9a6a3a', k: 4, ink: 2.4 });
        var bt2 = sunLeft ? 330 : 270;
        back += A.shape([[bt2 - 50, 660], [bt2 + 50, 660], [bt2 + 36, 684], [bt2 - 38, 684]], { fill: '#7a4a28', k: 5, ink: 2.4, inner: function () { return '<rect x="0" y="664" width="600" height="5" fill="' + P.accent + '"/>'; } });
        back += '<path d="M' + f(bt2) + ' 660V590" stroke="#3a2414" stroke-width="3"/>';
      } else if (V === 2) {
        /* faraglioni in mare e faro vicino */
        for (var st2 = 0; st2 < 2; st2++) {
          var sx2 = (sunLeft ? 430 : 60) + st2 * 70, sw2 = 26 + r() * 10, stt = 470 + r() * 50 + st2 * 30;
          back += land([[sx2 - sw2, hy + 40], [sx2 - sw2 * 0.7, stt + 20], [sx2 - sw2 * 0.2, stt], [sx2 + sw2 * 0.5, stt + 8], [sx2 + sw2, hy + 40]], st2 ? P.mid2 : P.mid, r, { k: 8, ink: 2.4, strokes: 5, angle: 90 });
          back += A.inkLine([[sx2 - sw2 - 10, hy + 38], [sx2 + sw2 + 10, hy + 38]], 5, st2 + 60, '#f4ead2', { vary: 0.9 });
        }
        var lh = sunLeft ? 150 : 450, lhb = 690;
        back += A.shape([[lh - 22, lhb], [lh - 15, lhb - 150], [lh + 15, lhb - 150], [lh + 22, lhb]], { fill: '#f1e2c2', k: 6, ink: 2.4, inner: function () { return '<rect x="0" y="' + (lhb - 110) + '" width="600" height="16" fill="#c8442b"/><rect x="0" y="' + (lhb - 60) + '" width="600" height="16" fill="#c8442b"/>'; } });
        back += A.shape([[lh - 20, lhb - 150], [lh + 20, lhb - 150], [lh + 12, lhb - 176], [lh - 12, lhb - 176]], { fill: '#ffe08a', k: 3, ink: 2.2 }) + A.shape([[lh - 16, lhb - 176], [lh, lhb - 196], [lh + 16, lhb - 176]], { fill: '#3a2a20', k: 2, ink: 2 }) + '<circle cx="' + lh + '" cy="' + (lhb - 163) + '" r="34" fill="#fff0b0" opacity=".45" filter="url(#soft)"/>';
      } else {
      /* scogliera alta sul lato opposto al sole */
      var cx0 = sunLeft ? 420 + r() * 30 : -20 - r() * 30, ct = 390 + r() * 40;
      back += land([[cx0, 760], [cx0 + 6, ct + 80], [cx0 + 30, ct + 20], [cx0 + 70, ct], [cx0 + 200, ct + 10], [cx0 + 220, 760]], P.mid2, r, { k: 10, rim: 3.5, ink: 2.6, strokes: 12, angle: 80, extra: A.inkLine([[cx0 + 70, ct - 2], [cx0 + 140, ct - 10], [cx0 + 210, ct + 6]], 9, 3, '#5f8f6a', { taper: 0.3 }) });
      }
      /* riva rocciosa con schiuma */
      var shore = ridge(r, 692, 14, 3, -20, 620);
      back += land(shore, P.ground, r, { k: 8, ink: 2.4, strokes: 16 });
      back += A.inkLine(shore.slice(1, -1).map(function (p) { return [p[0], p[1] - 3]; }), 5, 17, '#f4ead2', { vary: 0.9, freq: 12 });
      back += land(ridge(r, 770, 10, 2, -20, 620), P.ground2, r, { k: 8, ink: 2.2, strokes: 16 });
      fore += rock([sunLeft ? 480 : 120, 748], 52, 42, P.fore, r) + rock([sunLeft ? 100 : 500, 716], 28, 24, mix(P.fore, P.ground, 0.4), r);
      fore += tuft(sunLeft ? 130 : 470, 730, 0.9, '#6f9a7a');
    } else if (suit === 'g') {
      /* tronchi lontani, rovine con l'edera, chioma che incornicia */
      for (var t = 0; t < 7; t++) {
        var tx = 30 + t * 90 + r() * 30, tw = 12 + r() * 10;
        back += A.shape([[tx - tw, hy + 40], [tx - tw * 0.7, 180], [tx + tw * 0.7, 180], [tx + tw, hy + 40]], { fill: mix(P.far, P.horizon, 0.3), shade: false, ink: 0 });
      }
      back += land(ridge(r, hy - 30, 24, 3, -20, 620), mix(P.far, P.horizon, 0.15), r, { ink: 0, rim: 1, strokes: 6 });
      if (V === 1) {
        /* cerchio di pietre erette e colonna caduta */
        for (var ms = 0; ms < 5; ms++) {
          var mxs = 70 + ms * 115 + r() * 20, mh = 90 + r() * 60 - Math.abs(ms - 2) * 10, mw = 22 + r() * 8, mby = hy + 70 - Math.abs(ms - 2) * 6;
          if (Math.abs(mxs - 300) < 50) continue;
          back += A.shape([[mxs - mw, mby], [mxs - mw * 0.85, mby - mh * 0.8], [mxs - mw * 0.3, mby - mh], [mxs + mw * 0.6, mby - mh * 0.92], [mxs + mw, mby]], { fill: ms % 2 ? '#8f9a80' : '#a3ad94', k: 8, ink: 2.4, inner: function () { return A.brush(r, [mxs - mw, mby - mh, mxs + mw, mby], '#4f8a50', 6, 18, 5, 90, 0.55); } });
        }
        back += A.shape([[300 - 140, hy + 96], [300 - 130, hy + 70], [300 + 60, hy + 64], [300 + 70, hy + 92]], { fill: '#a3ad94', k: 6, ink: 2.4, inner: function () { var q = ''; for (var k2 = 0; k2 < 6; k2++) q += A.inkLine([[300 - 120 + k2 * 32, hy + 66], [300 - 118 + k2 * 32, hy + 94]], 1.6, k2, '#6f7a60'); return q; } });
      } else if (V === 2) {
        /* torre in rovina con l'edera e ruscello */
        var tx2 = sunLeft ? 420 : 80, tb = hy + 70;
        back += A.shape([[tx2 - 50, tb], [tx2 - 46, tb - 230], [tx2 - 20, tb - 250], [tx2 + 6, tb - 232], [tx2 + 26, tb - 262], [tx2 + 48, tb - 240], [tx2 + 52, tb]], { fill: '#9aa488', k: 10, ink: 2.6, inner: function () {
          var q = '';
          for (var b2 = 0; b2 < 9; b2++) q += A.inkLine([[tx2 - 60, tb - 20 - b2 * 26], [tx2 + 60, tb - 22 - b2 * 26]], 1.4, b2, '#6f7a60');
          q += '<path d="M' + (tx2 - 12) + ' ' + (tb - 120) + 'v-34a12 12 0 0 1 24 0v34z" fill="#3a3a2a"/>';
          for (var iv2 = 0; iv2 < 22; iv2++) q += A.shape(A.ellipsePts([tx2 - 50 + r() * 60, tb - 220 + r() * 220], 8, 5, 6, r() * 180, 0.3, iv2), { fill: iv2 % 3 ? '#2f6e3c' : '#4f9555', shade: false, ink: 1.1 });
          return q;
        } });
      } else {
      /* arco in rovina */
      var ax = 300 + (sunLeft ? 40 : -40) + (r() - 0.5) * 40, at = 380 + r() * 30, aw = 115;
      var stone = '#9aa488';
      back += A.shape([[ax - aw - 26, hy + 60], [ax - aw - 26, at + 70], [ax - aw + 8, at + 70], [ax - aw + 8, hy + 60]], { fill: stone, k: 8, ink: 2.4 });
      back += A.shape([[ax + aw - 8, hy + 60], [ax + aw - 8, at + 100], [ax + aw + 26, at + 90], [ax + aw + 26, hy + 60]], { fill: mix(stone, '#6f7a60', 0.3), k: 8, ink: 2.4 });
      back += A.shape([[ax - aw - 30, at + 72], [ax - aw - 20, at + 10], [ax - 40, at - 40], [ax + 20, at - 44], [ax + 30, at - 10], [ax - 20, at - 6], [ax - aw + 10, at + 40], [ax - aw + 12, at + 72]], { fill: stone, k: 8, ink: 2.4 });
      var ivy = '';
      for (var iv = 0; iv < 26; iv++) {
        var ip = [ax - aw - 20 + r() * 150, at - 30 + r() * 220];
        if (r() < 0.4) ip = [ax + aw + r() * 26 - 10, at + 90 + r() * 120];
        ivy += A.shape(A.ellipsePts(ip, 7, 5, 6, r() * 180, 0.3, iv), { fill: iv % 3 ? '#2f6e3c' : '#4f9555', shade: false, ink: 1.2 });
      }
      back += ivy;
      }
      back += land(ridge(r, hy + 60, 14, 2, -20, 620), P.ground, r, { k: 8, ink: 2.4, strokes: 18 });
      back += land(ridge(r, hy + 150, 10, 2, -20, 620), P.ground2, r, { k: 8, ink: 2.2, strokes: 18 });
      if (V === 2) { back += '<path d="' + A.ribbon([[300 - side * 260, hy + 120], [300 - side * 60, hy + 170], [300 + side * 80, hy + 240], [300 + side * 300, hy + 300]], false, 46, 9, { taper: 0.4, vary: 0.3 }) + '" fill="#5fa6a0" opacity=".9"/>'; for (var ss = 0; ss < 3; ss++) back += A.shape(A.ellipsePts([300 - side * 120 + ss * side * 90, hy + 160 + ss * 34], 16, 8, 8), { fill: '#a3ad94', k: 3, ink: 2 }); }
      /* raggi di luce */
      for (var sh = 0; sh < 3; sh++) {
        var sx0 = sun[0] + (sh - 1) * 50;
        back += '<path d="M' + f(sx0 - 20) + ' 150L' + f(sx0 + 24) + ' 150L' + f(sx0 + side * 260 + 60) + ' 900L' + f(sx0 + side * 260 - 40) + ' 900Z" fill="#fff2b8" opacity=".14"/>';
      }
      /* tronchi grandi ai lati e chioma in alto */
      var trunkC = '#3a5a34';
      var tA = 40 + r() * 30, tB = 34 + r() * 30;
      back += A.shape([[-10, 900], [-10, 170], [tA - 10, 190], [tA + 4, 420], [tA - 6, 700], [tA + 22, 900]], { fill: trunkC, k: 10, ink: 2.8, inner: function () { return A.brush(r, [0, 200, 80, 900], '#4f7a45', 14, 50, 6, 90, 0.4); } });
      back += A.shape([[610, 900], [610, 170], [600 - tB, 186], [596 - tB - 8, 430], [600 - tB, 720], [580 - tB, 900]], { fill: dark(trunkC, 0.1), k: 10, ink: 2.8, inner: function () { return A.brush(r, [520, 200, 600, 900], '#4f7a45', 14, 50, 6, 90, 0.4); } });
      var can = [[-20, -20], [620, -20]];
      for (var cp = 0; cp <= 16; cp++) { var cxp = 620 - cp * 40, dip = Math.abs(cxp - 300) / 300; can.push([cxp, 96 + dip * 120 + (cp % 2 ? 22 : -6) + r() * 16]); }
      back += A.shape(can, { fill: P.canopy, k: 6, rim: 2, ink: 2.6, dk: 0.12, inner: function () {
        var s = '';
        for (var lv = 0; lv < 40; lv++) { var pp = [r() * 600, 20 + r() * 190]; if (Math.abs(pp[0] - 300) < 90 && pp[1] > 70) continue; s += A.shape(A.ellipsePts(pp, 12, 7, 6, r() * 180, 0.3, lv), { fill: lv % 2 ? '#3b7446' : '#244d2f', shade: false, ink: 0 }); }
        return s;
      } });
      var bry = 380 + r() * 40, brx = motifSide < 0 ? 60 : 540;
      back += A.inkLine([[brx, bry], [brx - motifSide * 60, bry + 6], [mx, bry + 14]], 10, 5, '#3a2414', { taper: 0.4 });
      back += A.lantern(mx - motifSide * 6, bry + 54, 1);
      fore += fern(sunLeft ? 470 : 130, 750, 1, sunLeft, '#3d8a4a') + fern(sunLeft ? 120 : 480, 720, 0.8, !sunLeft, '#4f9a55');
      fore += A.shape(A.ellipsePts([sunLeft ? 158 : 442, 742], 10, 6, 8, 0), { fill: '#c9574f', shade: false, ink: 1.4 }) + '<path d="M' + (sunLeft ? 158 : 442) + ' 746v12" stroke="#f1e2c2" stroke-width="4"/>';
    } else {
      /* colline, mulino, campi di girasoli, sentiero */
      back += land(ridge(r, hy - 10, 26, 2, -20, 620), mix(P.far, P.horizon, 0.3), r, { ink: 0, rim: 1.5, strokes: 6 });
      var hill = ridge(r, hy + 20, 30, 2, -20, 620);
      back += land(hill, P.far2, r, { ink: 1.6, inkOp: 0.6, strokes: 10 });
      var mxw = sunLeft ? 470 + r() * 40 : 90 + r() * 40, mb = hy + 10, wmScale = V === 1 ? 0.55 : 1;
      if (V === 1) { mb = hy - 12; mxw = sunLeft ? 430 : 170; }
      var windmill = function (mxw, mb, sc2) {
      var back = '<g transform="translate(' + f(mxw) + ' ' + f(mb) + ') scale(' + sc2 + ') translate(' + f(-mxw) + ' ' + f(-mb) + ')">';
      back += A.shape([[mxw - 22, mb], [mxw - 14, mb - 96], [mxw + 14, mb - 96], [mxw + 22, mb]], { fill: '#f2e2b8', k: 6, ink: 2.2 });
      back += A.shape([[mxw - 18, mb - 94], [mxw, mb - 124], [mxw + 18, mb - 94]], { fill: '#7a4a28', k: 4, ink: 2.2 });
      back += A.shape([[mxw - 6, mb - 8], [mxw + 6, mb - 8], [mxw + 6, mb - 30], [mxw - 6, mb - 30]], { fill: '#5a3a20', shade: false, ink: 1.6 });
      var hub = [mxw, mb - 100], ang = r() * 90;
      for (var bl = 0; bl < 4; bl++) {
        var a = ang + bl * 90, tip = A.polar(hub, 84, a), n2 = A.perp(A.norm(A.sub(tip, hub)));
        var q = [A.polar(hub, 18, a), tip, A.add(tip, A.mul(n2, 16)), A.add(A.polar(hub, 18, a), A.mul(n2, 12))];
        back += '<path d="' + A.poly(q, true) + '" fill="#f6ead0" opacity=".9"/>' + A.inkLine([hub, tip], 3, bl, '#3a2414') + '<path d="' + A.poly(q, true) + '" fill="none" stroke="#3a2414" stroke-width="1.4"/>';
      }
      back += '<circle cx="' + f(hub[0]) + '" cy="' + f(hub[1]) + '" r="5" fill="#3a2414"/>';
      return back + '</g>';
      };
      if (V === 2) {
        /* casale con il tetto viola, albero e staccionata */
        var fx = sunLeft ? 440 : 70, fb = hy + 30;
        back += A.shape([[fx - 60, fb], [fx - 60, fb - 60], [fx + 60, fb - 60], [fx + 60, fb]], { fill: '#f2e2b8', k: 6, ink: 2.4, inner: function () { return '<rect x="' + (fx - 40) + '" y="' + (fb - 44) + '" width="18" height="18" fill="#ffd27a" stroke="#3a2414" stroke-width="2"/><rect x="' + (fx + 10) + '" y="' + (fb - 36) + '" width="20" height="36" fill="#7a4a28" stroke="#3a2414" stroke-width="2"/>'; } });
        back += A.shape([[fx - 72, fb - 56], [fx - 20, fb - 104], [fx + 40, fb - 104], [fx + 72, fb - 56]], { fill: P.accent, k: 5, ink: 2.4 });
        var tx3 = sunLeft ? 120 : 480;
        back += A.shape(A.capsule([tx3, hy + 60], [tx3 + 4, hy - 40], 10, 7), { fill: '#6b4426', k: 4, ink: 2.2 }) + A.shape(A.ellipsePts([tx3, hy - 80], 62, 52, 14, 0, 0.25, 7), { fill: '#7f9a3a', k: 10, ink: 2.4, inner: function () { return A.brush(r, [tx3 - 60, hy - 130, tx3 + 60, hy - 30], '#a6b84a', 12, 26, 6, 30, 0.5); } });
        for (var fe = 0; fe < 7; fe++) back += '<path d="M' + f(sunLeft ? 300 + fe * 30 : 40 + fe * 30) + ' ' + f(hy + 66) + 'v-30" stroke="#6b4426" stroke-width="5"/>';
        back += '<path d="M' + (sunLeft ? 296 : 36) + ' ' + (hy + 46) + 'h190M' + (sunLeft ? 296 : 36) + ' ' + (hy + 58) + 'h190" stroke="#6b4426" stroke-width="3"/>';
      } else {
        back += windmill(mxw, mb, wmScale);
        if (V === 1) {
          back += windmill(sunLeft ? 120 : 480, hy - 4, 0.42);
          for (var hk = 0; hk < 4; hk++) { var hkx = 60 + hk * 150 + r() * 40, hky = hy + 100 + (hk % 2) * 20; if (Math.abs(hkx - 300) < 70) continue; back += A.shape([[hkx - 30, hky], [hkx - 26, hky - 26], [hkx, hky - 38], [hkx + 26, hky - 26], [hkx + 30, hky]], { fill: '#e8c060', k: 6, ink: 2.2, inner: function () { return A.brush(r, [hkx - 30, hky - 40, hkx + 30, hky], '#c99a3a', 6, 20, 3, 70, 0.5); } }); }
        }
      }
      var field = ridge(r, hy + 80, 20, 2, -20, 620);
      back += land(field, P.mid, r, { k: 8, ink: 2.3, strokes: 20 });
      for (var sf = 0; sf < 46; sf++) {
        var sxp = r() * 600, syp = hy + 70 + r() * 70;
        back += '<circle cx="' + f(sxp) + '" cy="' + f(syp) + '" r="' + f(3 + (syp - hy) * 0.03) + '" fill="#f6bf35" stroke="#5a3412" stroke-width="1"/><circle cx="' + f(sxp) + '" cy="' + f(syp) + '" r="1.6" fill="#5a3412"/>';
      }
      var path = [[300 + side * 20, 940], [300 - side * 40, 800], [300 + side * 30, 720], [300 + side * 10, hy + 120]];
      back += land(ridge(r, hy + 170, 12, 2, -20, 620), P.ground, r, { k: 8, ink: 2.2, strokes: 18 });
      back += '<path d="' + A.ribbon(path, false, 90, 5, { taper: 1.4, vary: 0.3 }) + '" fill="#c98a3a" opacity=".75"/>';
      back += A.butterfly(mx, 420 + r() * 60, 1, motifSide * 20, P.accent, P.accent2);
      fore += sunflower(sunLeft ? 470 : 130, 680, 1.2, sunLeft ? -0.8 : 0.8) + sunflower(sunLeft ? 520 : 80, 712, 1, sunLeft ? -0.8 : 0.8) + sunflower(sunLeft ? 100 : 500, 690, 0.95, sunLeft ? -0.8 : 0.8);
    }
    return { back: back, fore: fore, sun: sun, hy: hy, shadow: function (cx, base, w) { return longShadow(cx, base, P, sun[0], w); } };
  };
})(typeof self !== 'undefined' ? self : this);
