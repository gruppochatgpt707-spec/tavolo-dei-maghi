/* Facce delle carte: illustrazione dipinta + cornice, numeri e simbolo del seme aggiunti dall'app. */
(function (root) {
  'use strict';
  var E = root.Engine;
  var COL = { r: '#C8442B', b: '#2F5FA8', g: '#3E8A4F', y: '#E0A526' };
  var DEEP = { r: '#7d2616', b: '#1b3a6e', g: '#21522d', y: '#8c5f0c' };
  /* Il motivo ricorrente di ogni seme fa anche da simbolo: falco, vela, lanterna, farfalla */
  var ICON = {
    r: '<path d="M1.5 12.5C5 8 8.5 7.4 11.2 10.6L12 9.4l.8 1.2C15.5 7.4 19 8 22.5 12.5 19 11.6 15.6 12.4 13.2 15.2L12 17l-1.2-1.8C8.4 12.4 5 11.6 1.5 12.5Z"/>',
    b: '<path d="M11.3 2.5v13.4H4.2L11.3 2.5Zm1.6 2.6 6.8 10.8h-6.8V5.1ZM3 17.6h18l-2.6 3.6H5.8L3 17.6Z"/>',
    g: '<path d="M9.5 1.8h5v2h-5zM7.6 4.6h8.8l1.4 3.4v9.2l-1.4 3.6H7.6l-1.4-3.6V8l1.4-3.4Zm4.4 4.2c-1.5 1.6-2.3 3-2.3 4.4a2.3 2.3 0 0 0 4.6 0c0-1.4-.8-2.8-2.3-4.4Z" fill-rule="evenodd"/>',
    y: '<path d="M12 9.2C10 4.2 3.6 2.8 3.2 7.6c-.3 3.6 3 4.9 6.4 4.4C6 13.6 5 17.8 7.8 19.6 10 21 11.6 17 12 14c.4 3 2 7 4.2 5.6 2.8-1.8 1.8-6-1.8-7.6 3.4.5 6.7-.8 6.4-4.4C20.4 2.8 14 4.2 12 9.2Z"/>'
  };
  var STAR = '<path d="M12 1.8l2.9 6.4 7 .7-5.3 4.7 1.6 6.9L12 17l-6.2 3.5 1.6-6.9L2.1 8.9l7-.7Z"/>';
  var BELL = '<path d="M12 3a2 2 0 0 1 2 2v.3A6 6 0 0 1 18 11v4l2 2.5H4L6 15v-4a6 6 0 0 1 4-5.7V5a2 2 0 0 1 2-2Zm-2.6 16h5.2a2.6 2.6 0 0 1-5.2 0Z"/>';

  function icon(s, extra) {
    var body = s === 'W' ? STAR : s === 'J' ? BELL : ICON[s];
    return '<svg viewBox="0 0 24 24" aria-hidden="true"' + (extra || '') + '>' + body + '</svg>';
  }
  /* Riquadro d'angolo: numero grande nel colore del seme, bordo dello stesso colore.
     Maghi e Giullari: riquadro bianco con la lettera scura, per non confonderli con nessun seme. */
  var TXT = { r: '#b8381f', b: '#2a55a0', g: '#2f7a40', y: '#c98a0c' };
  function cartouche(label, s) {
    var two = label.length > 1, special = s === 'W' || s === 'J';
    var fill = special ? '#fffdf8' : '#f7ecd2', edge = special ? '#2a1a0c' : COL[s], txt = special ? '#2a1a0c' : TXT[s];
    var out = '<rect x="7" y="7" width="52" height="78" rx="11" fill="' + fill + '" stroke="#2a1a0c" stroke-width="2"/>' +
      '<rect x="10" y="10" width="46" height="72" rx="8.5" fill="none" stroke="' + edge + '" stroke-width="' + (special ? 1.4 : 3.2) + '"/>' +
      '<text x="33" y="' + (two ? 46 : 48) + '" text-anchor="middle" font-size="' + (two ? 34 : 41) + '" font-weight="800"' + (two ? ' letter-spacing="-2"' : '') +
      ' fill="' + txt + '" stroke="#2a1a0c" stroke-width="' + (special ? 0 : 1.1) + '" paint-order="stroke" style="font-variant-numeric:lining-nums;font-family:\'TdmAlegreya\',\'Alegreya\',\'Lora\',Georgia,serif">' + label + '</text>';
    var ic = s === 'W' ? STAR : s === 'J' ? BELL : ICON[s];
    out += '<g transform="translate(20.5 54) scale(1.08)" fill="' + (special ? (s === 'W' ? '#7b5cc4' : '#8a8490') : COL[s]) + '" stroke="#2a1a0c" stroke-width="1.1">' + ic + '</g>';
    return out;
  }
  var cache = {};
  function frameSVG(id) {
    if (cache[id]) return cache[id];
    var s, label, band, color;
    if (E.isWizard(id)) { s = 'W'; label = 'M'; band = '#2c1f55'; }
    else if (E.isJester(id)) { s = 'J'; label = 'G'; band = '#26232a'; }
    else { s = E.suitOf(id); label = String(E.valueOf(id)); band = DEEP[s]; }
    var out = '<svg class="frame" viewBox="0 0 200 300" aria-hidden="true">' +
      '<path d="M12 1.5h176A10.5 10.5 0 0 1 198.5 12v276a10.5 10.5 0 0 1-10.5 10.5H12A10.5 10.5 0 0 1 1.5 288V12A10.5 10.5 0 0 1 12 1.5ZM14 8a6 6 0 0 0-6 6v272a6 6 0 0 0 6 6h172a6 6 0 0 0 6-6V14a6 6 0 0 0-6-6Z" fill="' + band + '" fill-rule="evenodd"/>' +
      '<rect x="1.5" y="1.5" width="197" height="297" rx="10.5" fill="none" stroke="#2a1a0c" stroke-width="3"/>' +
      '<rect x="8" y="8" width="184" height="284" rx="6" fill="none" stroke="#e9c46a" stroke-width="1.3" opacity=".9"/>';
    if (s === 'J') for (var k = 0; k < 14; k++) out += '<rect x="' + (14 + k * 13) + '" y="2.5" width="5" height="5" transform="rotate(45 ' + (16.5 + k * 13) + ' 5)" fill="' + (k % 2 ? '#f4efe6' : '#8a8490') + '"/><rect x="' + (14 + k * 13) + '" y="292.5" width="5" height="5" transform="rotate(45 ' + (16.5 + k * 13) + ' 295)" fill="' + (k % 2 ? '#8a8490' : '#f4efe6') + '"/>';
    if (s === 'W') [[100, 5], [100, 295], [4.8, 150], [195.2, 150]].forEach(function (p) { out += '<g transform="translate(' + (p[0] - 4.5) + ' ' + (p[1] - 4.5) + ') scale(.375)" fill="#c9b8ff">' + STAR + '</g>'; });
    out += cartouche(label, s) + '<g transform="rotate(180 100 150)">' + cartouche(label, s) + '</g></svg>';
    cache[id] = out;
    return out;
  }
  function face(id) {
    return '<img class="art" src="art/cards/' + id + '.webp" alt="" draggable="false" decoding="async">' + frameSVG(id);
  }
  function back() {
    return '<img class="art" src="art/ui/back.webp" alt="" draggable="false" decoding="async"><svg class="frame" viewBox="0 0 200 300" aria-hidden="true"><rect x="1.5" y="1.5" width="197" height="297" rx="10.5" fill="none" stroke="#2a1a0c" stroke-width="3"/><rect x="8" y="8" width="184" height="284" rx="6" fill="none" stroke="#e9c46a" stroke-width="1.6"/></svg>';
  }
  function suitColor(s) { return COL[s] || '#7a6a9a'; }
  root.Cards = { face: face, back: back, icon: icon, color: suitColor, COL: COL };
})(typeof self !== 'undefined' ? self : this);
