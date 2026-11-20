/* Lingue dell'app: italiano (predefinito), inglese, spagnolo, francese e tedesco.
   T('testo italiano') restituisce la traduzione nella lingua scelta; i testi fissi della pagina
   vengono tradotti al caricamento e a ogni cambio di lingua. */
(function (root) {
  'use strict';
  var LANGS = ['it', 'en', 'es', 'fr', 'de'];
  var NAMES = { it: 'Italiano', en: 'English', es: 'Español', fr: 'Français', de: 'Deutsch' };
  var LOCALE = { it: 'it-IT', en: 'en-GB', es: 'es-ES', fr: 'fr-FR', de: 'de-DE' };
  /* lettere sulle carte speciali e sul gettone del mazziere */
  var LETTERS = { it: { W: 'M', J: 'G', D: 'M' }, en: { W: 'W', J: 'J', D: 'D' }, es: { W: 'M', J: 'B', D: 'R' }, fr: { W: 'M', J: 'B', D: 'D' }, de: { W: 'Z', J: 'N', D: 'G' } };
  var maps = {};
  LANGS.slice(1).forEach(function (l, k) {
    var m = maps[l] = {};
    (root.I18N_ROWS || []).forEach(function (r) { if (r[k + 1] != null) m[r[0]] = r[k + 1]; });
  });
  var lang = 'it';
  try { var saved = localStorage.getItem('tavolo_lang'); if (LANGS.indexOf(saved) >= 0) lang = saved; } catch (e) {}

  function T(s, vars) {
    var r = s;
    if (lang !== 'it' && typeof s === 'string' && maps[lang][s] != null) r = maps[lang][s];
    if (vars) r = String(r).replace(/\{(\w+)\}/g, function (m, k) { return vars[k] != null ? vars[k] : m; });
    return r;
  }
  /* testi già composti in italiano da chi fa da tavolo */
  var PATTERNS = [[/^Con la variante attiva il totale non può essere (\d+)\.$/, 'Con la variante attiva il totale non può essere {n}.', ['n']]];
  function host(text) {
    if (lang === 'it' || !text) return text;
    if (maps[lang][text] != null) return maps[lang][text];
    for (var i = 0; i < PATTERNS.length; i++) {
      var m = PATTERNS[i][0].exec(text);
      if (m) { var v = {}; PATTERNS[i][2].forEach(function (k, j) { v[k] = m[j + 1]; }); return T(PATTERNS[i][1], v); }
    }
    return text;
  }

  var ATTRS = ['placeholder', 'aria-label', 'title', 'alt'];
  function norm(s) { return s.replace(/\s+/g, ' ').trim(); }
  function applyStatic(scope) {
    scope = scope || document.body;
    var w = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) { var p = n.parentNode && n.parentNode.nodeName; return p === 'SCRIPT' || p === 'STYLE' ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; }
    });
    var n;
    while ((n = w.nextNode())) {
      if (n.__it === undefined) {
        var k = norm(n.nodeValue);
        if (!k || !(k in maps.en)) { n.__it = null; continue; }
        n.__it = k; n.__pre = n.nodeValue.match(/^\s*/)[0]; n.__post = n.nodeValue.match(/\s*$/)[0];
      }
      if (n.__it) n.nodeValue = n.__pre + T(n.__it) + n.__post;
    }
    ATTRS.forEach(function (a) {
      Array.prototype.forEach.call(scope.querySelectorAll('[' + a + ']'), function (el) {
        var key = 'i18n' + a.replace('-', '');
        if (el.dataset[key] === undefined) { var v = norm(el.getAttribute(a) || ''); el.dataset[key] = v in maps.en ? v : ''; }
        if (el.dataset[key]) el.setAttribute(a, T(el.dataset[key]));
      });
    });
    document.documentElement.lang = lang;
  }
  function setLang(l) {
    if (LANGS.indexOf(l) < 0 || l === lang) return;
    lang = l;
    try { localStorage.setItem('tavolo_lang', l); } catch (e) {}
    applyStatic();
    try { root.dispatchEvent(new Event('langchange')); } catch (e) {}
  }

  root.T = T;
  root.I18N = {
    LANGS: LANGS, NAMES: NAMES, T: T, host: host, applyStatic: applyStatic, setLang: setLang,
    get lang() { return lang; },
    locale: function () { return LOCALE[lang]; },
    letter: function (k) { return LETTERS[lang][k]; }
  };
})(typeof self !== 'undefined' ? self : this);
