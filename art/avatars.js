/* Avatar predefiniti: ritratti ritagliati dalle carte, più le texture dell'interfaccia. */
(function (root) {
  'use strict';
  var A = root.ART, f = A.f;
  var AV = [['mago-fuoco', 'W1'], ['maga-luce', 'W4'], ['pescatore', 'b3'], ['giullare', 'J1'], ['giullara', 'J2'], ['regina', 'g12'], ['re', 'r13'], ['bardo', 'b7'], ['cacciatrice', 'b8'], ['alchimista', 'y10'], ['cavaliera', 'b9'], ['fornaio', 'g4'], ['mercante', 'r6'], ['messaggera', 'g2'], ['fabbra', 'r5'], ['monella', 'y1']];
  A.avatarIds = function () { return AV.map(function (a) { return a[0]; }); };
  A.avatar = function (name) {
    var id = AV.filter(function (a) { return a[0] === name; })[0][1];
    var svg = A.card(id), h = A.cardHead(id), s = h.u * 3.3;
    return svg.replace('viewBox="0 0 600 900" width="600" height="900"', 'viewBox="' + f(h.x - s / 2) + ' ' + f(h.y - s * 0.46) + ' ' + f(s) + ' ' + f(s) + '" width="300" height="300"');
  };
  /* Texture: legno del tavolo e carta */
  A.texture = function (name) {
    A.uid = 0;
    var r = A.rng(A.hash(name)), s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">' + A.defs(7);
    if (name === 'wood') {
      var cols = ['#8a5a33', '#7c4f2c', '#93613a', '#83552f', '#7a4b2a'];
      s += '<g filter="url(#rough)">';
      for (var p = 0; p < 6; p++) {
        var x0 = p * 100 - 2, c = cols[p % 5];
        s += A.shape([[x0, -10], [x0 + 104, -10], [x0 + 104, 610], [x0, 610]], { fill: c, k: 4, rim: 2, ink: 2.6, inkOp: 0.75, dk: 0.12, inner: function () {
          var g = '';
          for (var k = 0; k < 9; k++) { var xx = x0 + 8 + k * 10 + r() * 6; g += A.inkLine([[xx, -10], [xx + (r() - 0.5) * 14, 200], [xx + (r() - 0.5) * 16, 420], [xx + (r() - 0.5) * 12, 610]], 1.4 + r() * 2, k + p * 11, k % 2 ? A.dark(c, 0.22) : A.light(c, 0.12), { vary: 0.9, freq: 8 }); }
          if (r() < 0.7) { var ky = 80 + r() * 440, kx = x0 + 30 + r() * 40; g += '<ellipse cx="' + f(kx) + '" cy="' + f(ky) + '" rx="9" ry="16" fill="' + A.dark(c, 0.35) + '"/><ellipse cx="' + f(kx) + '" cy="' + f(ky) + '" rx="16" ry="28" fill="none" stroke="' + A.dark(c, 0.2) + '" stroke-width="2"/>'; }
          return g;
        } });
      }
      s += '</g>';
    } else if (name === 'back') {
      s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="400" height="600">' + A.defs(9);
      s += '<rect width="400" height="600" fill="#24386e"/>';
      s += '<g filter="url(#rough)">';
      s += A.brush(r, [0, 0, 400, 600], '#2f4a8a', 60, 90, 14, 70, 0.35) + A.brush(r, [0, 0, 400, 600], '#1b2a55', 40, 80, 12, 110, 0.35);
      var cc = [200, 300], ray = '';
      for (var k = 0; k < 24; k++) { var a = k * 15; ray += '<path d="' + A.poly([A.polar(cc, 70, a - 4), A.polar(cc, k % 2 ? 140 : 190, a), A.polar(cc, 70, a + 4)], true) + '" fill="#d9a43a" opacity="' + (k % 2 ? 0.55 : 0.85) + '" stroke="#3a2414" stroke-width="1.6"/>'; }
      s += ray;
      s += A.shape(A.ellipsePts(cc, 78, 78, 16), { fill: '#1b2a55', k: 6, ink: 3, rimColor: '#e9c46a' });
      s += A.shape([[150, 340], [178, 300], [195, 262], [214, 230], [232, 214], [222, 246], [228, 300], [254, 340]], { fill: '#d9a43a', k: 8, ink: 3, rimColor: '#ffe9a8' });
      s += A.shape([[128, 344], [272, 344], [262, 358], [138, 358]], { fill: '#c98f2a', k: 4, ink: 2.6 });
      [[40, 60], [360, 60], [40, 540], [360, 540], [200, 80], [200, 520], [70, 300], [330, 300]].forEach(function (p2, i) { var st = []; for (var q = 0; q < 10; q++) st.push(A.polar(p2, q % 2 ? 5 : 13, q * 36 - 90)); s += A.shape(st, { fill: '#f2d27a', shade: false, ink: 1.6 }); });
      s += '</g>';
      s += '<rect width="400" height="600" filter="url(#mottle)" opacity="0.25" style="mix-blend-mode:multiply"/><rect width="400" height="600" filter="url(#grain)" opacity="0.5" style="mix-blend-mode:multiply"/></svg>';
      return s;
    } else if (name === 'icon') {
      s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">' + A.defs(4);
      var gid = 'ig';
      s += '<linearGradient id="' + gid + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b4a8f"/><stop offset=".62" stop-color="#c8603a"/><stop offset="1" stop-color="#f2c06a"/></linearGradient><rect width="512" height="512" fill="url(#' + gid + ')"/>';
      s += '<g filter="url(#rough)"><circle cx="256" cy="330" r="120" fill="#fff0c0" opacity=".55" filter="url(#soft2)"/>';
      s += A.shape([[110, 420], [150, 330], [200, 230], [250, 140], [300, 90], [350, 70], [318, 130], [312, 220], [330, 330], [402, 420]], { fill: '#2a2262', k: 14, ink: 7, rimColor: '#ffd98a', rim: 6 });
      s += A.shape([[60, 430], [452, 430], [420, 470], [92, 470]], { fill: '#d9a43a', k: 8, ink: 7, rimColor: '#fff0b0' });
      s += A.shape([[150, 360], [362, 360], [372, 392], [140, 392]], { fill: '#c8442b', k: 6, ink: 6 });
      var st2 = []; for (var q2 = 0; q2 < 10; q2++) st2.push(A.polar([256, 270], q2 % 2 ? 16 : 40, q2 * 36 - 90));
      s += A.shape(st2, { fill: '#ffe066', k: 5, ink: 5 });
      s += '</g><rect width="512" height="512" filter="url(#grain)" opacity=".4" style="mix-blend-mode:multiply"/></svg>';
      return s;
    } else {
      s += '<rect width="600" height="600" fill="#f0e2c0"/>';
    }
    s += '<rect width="600" height="600" filter="url(#mottle)" opacity="0.2" style="mix-blend-mode:multiply"/><rect width="600" height="600" filter="url(#fiber)" opacity="0.25" style="mix-blend-mode:multiply"/><rect width="600" height="600" filter="url(#grain)" opacity="0.45" style="mix-blend-mode:multiply"/></svg>';
    return s;
  };
})(typeof self !== 'undefined' ? self : this);
