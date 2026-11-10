/* Profilo del giocatore e statistiche, salvati su questo dispositivo. */
(function (root) {
  'use strict';
  var KEY = 'tavolo_profile', SKEY = 'tavolo_stats';
  var PRESETS = [
    ['mago-fuoco', 'Maga del fuoco'], ['maga-luce', 'Maga della luce'], ['alchimista', 'Alchimista'], ['giullare', 'Giullare'],
    ['giullara', 'Giullara'], ['regina', 'Regina'], ['re', 'Re'], ['bardo', 'Bardo'], ['cacciatrice', 'Cacciatrice'],
    ['cavaliera', 'Cavaliera'], ['fornaio', 'Fornaio'], ['mercante', 'Mercante'], ['messaggera', 'Messaggera'],
    ['fabbra', 'Fabbra'], ['monella', 'Monella'], ['pescatore', 'Pescatore']
  ];
  function read(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
  function write(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }

  function emptyCat() { return { games: 0, wins: 0, points: 0, best: null, worst: null, rounds: 0, exact: 0, streak: 0, bestStreak: 0, places: 0, tricks: 0 }; }
  function get() {
    var p = read(KEY);
    if (!p || !p.id) {
      p = { id: 'g' + Math.random().toString(36).slice(2, 10), name: read('tavolo_name') || '', av: 'p:' + PRESETS[Math.floor(Math.random() * PRESETS.length)][0], created: Date.now() };
      write(KEY, p);
    }
    return p;
  }
  function save(patch) { var p = get(); Object.keys(patch).forEach(function (k) { p[k] = patch[k]; }); write(KEY, p); return p; }
  function stats() {
    var s = read(SKEY);
    if (!s || !s.real) s = { real: emptyCat(), bots: emptyCat(), recent: [], recorded: [] };
    return s;
  }

  /* A fine partita: ogni dispositivo registra i numeri del proprio posto */
  function recordGame(v) {
    if (!v || !v.history || !v.history.length || !v.gameId) return null;
    var s = stats();
    if (s.recorded.indexOf(v.gameId) >= 0) return null;
    var me = v.me, real = v.players.some(function (p, i) { return i !== me && !p.bot; });
    var c = real ? s.real : s.bots;
    var scores = v.players.map(function (p) { return p.score; }), mine = scores[me];
    var place = 1 + scores.filter(function (x) { return x > mine; }).length;
    c.games++; if (place === 1) c.wins++;
    c.points += mine; c.places += place;
    c.best = c.best === null ? mine : Math.max(c.best, mine);
    c.worst = c.worst === null ? mine : Math.min(c.worst, mine);
    v.history.forEach(function (h) {
      c.rounds++; c.tricks += h.won[me];
      if (h.bids[me] === h.won[me]) { c.exact++; c.streak++; c.bestStreak = Math.max(c.bestStreak, c.streak); } else c.streak = 0;
    });
    var top = Math.max.apply(null, scores);
    s.recent.unshift({ at: Date.now(), real: real, n: v.players.length, place: place, score: mine, winner: v.players[scores.indexOf(top)].name, me: place === 1 });
    s.recent = s.recent.slice(0, 12);
    s.recorded.push(v.gameId); s.recorded = s.recorded.slice(-40);
    write(SKEY, s);
    return { place: place, real: real };
  }

  function avatarURL(av) {
    if (av && av.indexOf('data:image/') === 0) return av;
    var n = av && av.indexOf('p:') === 0 ? av.slice(2) : 'monella';
    return 'art/avatars/' + n + '.webp';
  }

  /* Foto: ritaglio quadrato al centro, 160 px, JPEG leggero per viaggiare tra i dispositivi */
  function processPhoto(file) {
    return new Promise(function (res, rej) {
      if (!file || !/^image\//.test(file.type)) { rej(new Error('Scegli un file immagine (JPG o PNG).')); return; }
      var url = URL.createObjectURL(file), img = new Image();
      img.onload = function () {
        var side = Math.min(img.naturalWidth, img.naturalHeight), sx = (img.naturalWidth - side) / 2, sy = (img.naturalHeight - side) / 2;
        var c = document.createElement('canvas'); c.width = c.height = 160;
        var g = c.getContext('2d'); g.imageSmoothingQuality = 'high';
        g.drawImage(img, sx, sy, side, side, 0, 0, 160, 160);
        URL.revokeObjectURL(url);
        var q = 0.8, out = c.toDataURL('image/jpeg', q);
        while (out.length > 40000 && q > 0.4) { q -= 0.1; out = c.toDataURL('image/jpeg', q); }
        res(out);
      };
      img.onerror = function () { URL.revokeObjectURL(url); rej(new Error('Non riesco a leggere questa immagine. Prova con un altro file.')); };
      img.src = url;
    });
  }

  /* Copia di sicurezza: un testo da incollare su un altro dispositivo */
  function exportCode() {
    var data = { v: 1, profile: get(), stats: stats() };
    return 'TAVOLO1:' + btoa(unescape(encodeURIComponent(JSON.stringify(data))));
  }
  function importCode(txt) {
    txt = String(txt || '').trim();
    if (txt.indexOf('TAVOLO1:') !== 0) throw new Error('Questo testo non è una copia del profilo.');
    var data = JSON.parse(decodeURIComponent(escape(atob(txt.slice(8)))));
    if (!data.profile || !data.stats) throw new Error('La copia del profilo è incompleta.');
    write(KEY, data.profile); write(SKEY, data.stats);
    return data.profile;
  }
  function resetStats() { write(SKEY, { real: emptyCat(), bots: emptyCat(), recent: [], recorded: stats().recorded }); }

  root.Profile = { PRESETS: PRESETS, get: get, save: save, stats: stats, recordGame: recordGame, avatarURL: avatarURL, processPhoto: processPhoto, exportCode: exportCode, importCode: importCode, resetStats: resetStats };
})(typeof self !== 'undefined' ? self : this);
