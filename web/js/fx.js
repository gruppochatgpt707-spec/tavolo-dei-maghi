/* Piccoli effetti al tocco: polvere dorata e un'onda d'inchiostro, disattivabili. */
(function (root) {
  'use strict';
  var layer = null, reduce = root.matchMedia && matchMedia('(prefers-reduced-motion: reduce)');
  var COLS = ['#f2c64e', '#ffe9a8', '#e8943a', '#fff6d8'];
  function ensure() {
    if (!layer) { layer = document.createElement('div'); layer.id = 'tapfx'; layer.setAttribute('aria-hidden', 'true'); document.body.appendChild(layer); }
    return layer;
  }
  function burst(x, y, big) {
    if ((reduce && reduce.matches) || !root.Sound || !root.Sound.settings().fx) return;
    var L = ensure(), n = big ? 10 : 6;
    var ring = document.createElement('i'); ring.className = 'tf-ring'; ring.style.left = x + 'px'; ring.style.top = y + 'px';
    L.appendChild(ring);
    ring.animate([{ transform: 'translate(-50%,-50%) scale(.2)', opacity: 0.6 }, { transform: 'translate(-50%,-50%) scale(1)', opacity: 0 }], { duration: 420, easing: 'cubic-bezier(.2,.7,.3,1)' }).onfinish = function () { ring.remove(); };
    for (var i = 0; i < n; i++) {
      var d = document.createElement('i'); d.className = 'tf-dot';
      var c = COLS[i % COLS.length], a = Math.random() * Math.PI * 2, r = (big ? 30 : 16) + Math.random() * (big ? 30 : 18);
      d.style.background = c; d.style.left = x + 'px'; d.style.top = y + 'px';
      L.appendChild(d);
      d.animate([{ transform: 'translate(-50%,-50%) scale(1)', opacity: 1 }, { transform: 'translate(calc(-50% + ' + (Math.cos(a) * r).toFixed(1) + 'px), calc(-50% + ' + (Math.sin(a) * r - 8).toFixed(1) + 'px)) scale(.2)', opacity: 0 }], { duration: 380 + Math.random() * 260, easing: 'cubic-bezier(.15,.7,.35,1)' }).onfinish = (function (e) { return function () { e.remove(); }; })(d);
    }
  }
  document.addEventListener('pointerdown', function (e) {
    var t = e.target.closest && e.target.closest('button,[data-a],.hcard,label.toggle,select,.bn,.gem');
    if (!t || t.disabled) return;
    burst(e.clientX, e.clientY, t.classList.contains('gold'));
  }, { passive: true });
  root.TapFX = { burst: burst };
})(typeof self !== 'undefined' ? self : this);
