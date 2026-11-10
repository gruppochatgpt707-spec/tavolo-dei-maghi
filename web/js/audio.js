/* Suoni: colonna sonora generativa a tema e rumori realistici delle carte, tutto sintetizzato. */
(function (root) {
  'use strict';
  var KEY = 'tavolo_settings';
  var DEF = { music: true, musicVol: 0.5, sfx: true, sfxVol: 0.8, fx: true, vibrate: true };
  var set = (function () { try { var s = JSON.parse(localStorage.getItem(KEY)); return Object.assign({}, DEF, s || {}); } catch (e) { return Object.assign({}, DEF); } })();
  function saveSet() { try { localStorage.setItem(KEY, JSON.stringify(set)); } catch (e) {} }

  var ctx = null, master, musicBus, sfxBus, verb, NOISE, duckLevel = 1, hidden = false;
  function ensure() {
    var AC = root.AudioContext || root.webkitAudioContext;
    if (!AC) return null;
    if (!ctx) {
      ctx = new AC();
      var comp = ctx.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 3;
      master = ctx.createGain(); master.gain.value = 0.9; master.connect(comp); comp.connect(ctx.destination);
      verb = ctx.createConvolver(); verb.buffer = impulse(2.8); var vg = ctx.createGain(); vg.gain.value = 0.55; verb.connect(vg); vg.connect(master);
      musicBus = ctx.createGain(); var mf = ctx.createBiquadFilter(); mf.type = 'lowpass'; mf.frequency.value = 5200;
      musicBus.connect(mf); mf.connect(master); var ms = ctx.createGain(); ms.gain.value = 0.7; mf.connect(ms); ms.connect(verb);
      sfxBus = ctx.createGain(); sfxBus.connect(master); var ss = ctx.createGain(); ss.gain.value = 0.12; sfxBus.connect(ss); ss.connect(verb);
      var n = ctx.sampleRate * 2; NOISE = ctx.createBuffer(1, n, ctx.sampleRate); var d = NOISE.getChannelData(0);
      for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      applyVolumes();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function impulse(sec) {
    var sr = ctx.sampleRate, n = Math.floor(sr * sec), b = ctx.createBuffer(2, n, sr);
    for (var c = 0; c < 2; c++) {
      var d = b.getChannelData(c), lp = 0;
      for (var i = 0; i < n; i++) { var t = i / sr, x = (Math.random() * 2 - 1) * Math.exp(-t / 0.7); lp += 0.35 * (x - lp); d[i] = lp * (i < sr * 0.01 ? i / (sr * 0.01) : 1); }
    }
    return b;
  }
  function applyVolumes() {
    if (!ctx) return;
    var t = ctx.currentTime;
    musicBus.gain.setTargetAtTime(set.music && !hidden ? set.musicVol * 0.6 * duckLevel : 0, t, 0.4);
    sfxBus.gain.setTargetAtTime(set.sfx ? set.sfxVol : 0, t, 0.05);
  }

  /* ---- Corda pizzicata (Karplus-Strong): arpa e liuto ---- */
  var plucks = {};
  function mtof(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  function pluckBuf(m) {
    if (plucks[m]) return plucks[m];
    var sr = ctx.sampleRate, f = mtof(m), dur = Math.max(1.2, 3.2 - (m - 48) * 0.04), n = Math.floor(sr * dur);
    var b = ctx.createBuffer(1, n, sr), d = b.getChannelData(0), N = Math.max(2, Math.round(sr / f)), line = new Float32Array(N), prev = 0, i;
    for (i = 0; i < N; i++) { prev += 0.45 * ((Math.random() * 2 - 1) - prev); line[i] = prev; }
    var rho = 0.9965 + Math.min(0.003, 30 / f * 0.01), p = 0, last = 0, peak = 0;
    for (i = 0; i < n; i++) {
      var cur = line[p], nx = line[(p + 1) % N], y = rho * 0.5 * (cur + nx);
      line[p] = y; p = (p + 1) % N;
      var out = cur * 0.7 + last * 0.3; last = cur;
      if (i > n - sr * 0.3) out *= (n - i) / (sr * 0.3);
      d[i] = out; if (Math.abs(out) > peak) peak = Math.abs(out);
    }
    for (i = 0; i < n; i++) d[i] /= peak || 1;
    plucks[m] = b;
    return b;
  }
  function pluck(m, t, vol, bus, bright) {
    var s = ctx.createBufferSource(); s.buffer = pluckBuf(m);
    var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = bright || 3200;
    var g = ctx.createGain(); g.gain.value = vol;
    var pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    s.connect(lp); lp.connect(g);
    if (pan) { pan.pan.value = Math.max(-0.6, Math.min(0.6, (m - 64) / 30)); g.connect(pan); pan.connect(bus); } else g.connect(bus);
    s.start(t);
  }
  function bell(m, t, vol, bus) {
    var f = mtof(m), car = ctx.createOscillator(), mod = ctx.createOscillator(), mg = ctx.createGain(), g = ctx.createGain();
    car.frequency.value = f; mod.frequency.value = f * 3.5;
    mg.gain.setValueAtTime(f * 1.6, t); mg.gain.exponentialRampToValueAtTime(1, t + 1.4);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.4);
    mod.connect(mg); mg.connect(car.frequency); car.connect(g); g.connect(bus);
    car.start(t); mod.start(t); car.stop(t + 2.5); mod.stop(t + 2.5);
  }
  function flute(m, t, dur, vol) {
    var f = mtof(m), o = ctx.createOscillator(), o2 = ctx.createOscillator(), lp = ctx.createBiquadFilter(), g = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain();
    o.type = 'sine'; o2.type = 'triangle'; o.frequency.value = f; o2.frequency.value = f;
    lfo.frequency.value = 5.2; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(f * 0.005, t + 0.4);
    lfo.connect(lg); lg.connect(o.frequency); lg.connect(o2.frequency);
    lp.type = 'lowpass'; lp.frequency.value = 2400;
    var o2g = ctx.createGain(); o2g.gain.value = 0.35;
    o.connect(lp); o2.connect(o2g); o2g.connect(lp); lp.connect(g); g.connect(musicBus);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.09); g.gain.setValueAtTime(vol * 0.9, t + dur - 0.12); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.15);
    var n = ctx.createBufferSource(); n.buffer = NOISE; var bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = f * 2; bp.Q.value = 3; var ng = ctx.createGain(); ng.gain.setValueAtTime(0, t); ng.gain.linearRampToValueAtTime(vol * 0.25, t + 0.05); ng.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    n.connect(bp); bp.connect(ng); ng.connect(musicBus);
    [o, o2, lfo].forEach(function (x) { x.start(t); x.stop(t + dur + 0.2); }); n.start(t, Math.random(), dur + 0.1);
  }
  function pad(notes, t, dur, vol) {
    var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 850; lp.Q.value = 0.4;
    var g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 1.6); g.gain.setValueAtTime(vol, t + dur - 0.2); g.gain.linearRampToValueAtTime(0.0001, t + dur + 2.2);
    lp.connect(g); g.connect(musicBus);
    notes.forEach(function (m) {
      [-6, 6].forEach(function (cents) { var o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = mtof(m); o.detune.value = cents; o.connect(lp); o.start(t); o.stop(t + dur + 2.4); });
    });
  }

  /* ---- Colonna sonora: modi e giri d'accordi cambiano con la briscola ---- */
  var THEMES = {
    none: { root: 50, mode: [0, 2, 3, 5, 7, 9, 10], prog: [0, 6, 3, 0] },
    r: { root: 52, mode: [0, 1, 3, 5, 7, 8, 10], prog: [0, 1, 6, 0] },
    b: { root: 50, mode: [0, 2, 3, 5, 7, 8, 10], prog: [0, 5, 2, 6] },
    g: { root: 57, mode: [0, 2, 3, 5, 7, 9, 10], prog: [0, 6, 3, 4] },
    y: { root: 55, mode: [0, 2, 4, 6, 7, 9, 11], prog: [0, 1, 0, 4] }
  };
  var PAT = [[0, 1, 2, 3, 2, 1], [0, 2, 3, 4, 3, 2], [0, null, 2, 3, null, 4], [0, 1, 2, 1, 3, 2]];
  var EIGHTH = 60 / (66 * 3);
  var M = { on: false, theme: 'none', want: 'none', next: 0, step: 0, phrase: 0, timer: null, pat: PAT[0], motif: null };
  function deg(T, d, oct) { var o = Math.floor(d / 7); return T.root + T.mode[((d % 7) + 7) % 7] + 12 * (o + (oct || 0)); }
  function newMotif() {
    var rhythms = [[3, 3], [2, 1, 3], [1, 1, 1, 3], [4, 2], [2, 2, 2]], m = [];
    for (var b = 0; b < 4; b++) {
      var r = rhythms[Math.floor(Math.random() * rhythms.length)], dd = [], cur = [0, 2, 4][Math.floor(Math.random() * 3)];
      r.forEach(function (len, k) { dd.push({ len: len, d: k === 0 ? cur : cur + [-1, 1, 2, -2][Math.floor(Math.random() * 4)] }); cur = dd[dd.length - 1].d; });
      m.push(dd);
    }
    return m;
  }
  function scheduleStep(t) {
    var T = THEMES[M.theme], s = M.step, inBar = s % 6, bar = Math.floor(s / 6), barInPhrase = bar % 8;
    if (s % 48 === 0) {
      M.phrase++;
      if (M.want !== M.theme) { M.theme = M.want; T = THEMES[M.theme]; }
      M.pat = PAT[Math.floor(Math.random() * PAT.length)];
      if (M.phrase % 2 === 0) M.motif = newMotif();
      if (Math.random() < 0.6) [0, 2, 4].forEach(function (k, i) { bell(deg(T, T.prog[0] + k, 2), t + i * 0.12, 0.018, musicBus); });
    }
    var section = M.phrase % 4, chordDeg = T.prog[Math.floor(barInPhrase / 2) % 4];
    if (inBar === 0 && bar % 2 === 0) pad([deg(T, chordDeg, 0), deg(T, chordDeg + 2, 0), deg(T, chordDeg + 4, 0)], t, EIGHTH * 12, section === 3 ? 0.03 : 0.022);
    if (inBar === 0) pluck(deg(T, chordDeg, -1), t, 0.28, musicBus, 1800);
    var pat = section === 3 ? PAT[2] : M.pat, k = pat[inBar];
    if (k !== null && k !== undefined && !(section === 3 && Math.random() < 0.4)) {
      var tones = [0, 2, 4, 7, 9];
      var v = (inBar === 0 ? 0.26 : inBar === 3 ? 0.22 : 0.15) * (0.85 + Math.random() * 0.3);
      pluck(deg(T, chordDeg + tones[k], 1), t + (Math.random() - 0.5) * 0.012, v, musicBus, 3200);
    }
    if ((section === 1 || section === 2) && M.motif && inBar === 0) {
      var line = M.motif[barInPhrase % 4], at = t;
      if (section === 2 && barInPhrase >= 6) line = [{ len: 6, d: chordDeg + (barInPhrase === 7 ? 0 : 2) }];
      line.forEach(function (n) { if (Math.random() < 0.9) flute(deg(T, n.d, 2), at, n.len * EIGHTH * 0.95, 0.05); at += n.len * EIGHTH; });
    }
  }
  function tick() {
    if (!ctx || hidden) return;
    while (M.next < ctx.currentTime + 0.6) { scheduleStep(M.next); M.next += EIGHTH; M.step++; }
  }
  var music = {
    start: function () {
      if (!set.music || M.on) return;
      if (!ensure()) return;
      M.on = true; M.next = ctx.currentTime + 0.3; M.step = 0; M.phrase = -1; M.motif = newMotif();
      M.timer = setInterval(tick, 120); applyVolumes();
    },
    stop: function () { M.on = false; clearInterval(M.timer); if (ctx) applyVolumes(); },
    theme: function (s) { M.want = THEMES[s] ? s : 'none'; },
    get playing() { return M.on; }
  };

  /* ---- Rumori delle carte: carta che striscia sul legno, schiocco sul tavolo, mescolata ---- */
  function nsrc(t, dur) { var s = ctx.createBufferSource(); s.buffer = NOISE; s.start(t, Math.random() * 1.6, dur + 0.05); return s; }
  function slide(t, vol, dur, f) {
    var s = nsrc(t, dur), hp = ctx.createBiquadFilter(), bp = ctx.createBiquadFilter(), g = ctx.createGain();
    hp.type = 'highpass'; hp.frequency.value = 700;
    bp.type = 'bandpass'; bp.Q.value = 0.7; bp.frequency.setValueAtTime(f, t); bp.frequency.linearRampToValueAtTime(f * 0.62, t + dur);
    var curve = new Float32Array(40);
    for (var i = 0; i < 40; i++) { var x = i / 39, envv = x < 0.12 ? x / 0.12 : Math.pow(1 - (x - 0.12) / 0.88, 1.6); curve[i] = Math.max(0.0001, vol * envv * (0.65 + Math.random() * 0.35)); }
    g.gain.setValueAtTime(0.0001, t); g.gain.setValueCurveAtTime(curve, t + 0.001, dur);
    s.connect(hp); hp.connect(bp); bp.connect(g); g.connect(sfxBus);
  }
  function tap(t, vol, low) {
    var s = nsrc(t, 0.02), hp = ctx.createBiquadFilter(), g = ctx.createGain();
    hp.type = 'highpass'; hp.frequency.value = 1800;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol * 0.55, t + 0.0012); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.016);
    s.connect(hp); hp.connect(g); g.connect(sfxBus);
    var o = ctx.createOscillator(), og = ctx.createGain(); o.frequency.setValueAtTime(low || 210, t); o.frequency.exponentialRampToValueAtTime((low || 210) * 0.55, t + 0.045);
    og.gain.setValueAtTime(0.0001, t); og.gain.linearRampToValueAtTime(vol * 0.32, t + 0.002); og.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
    o.connect(og); og.connect(sfxBus); o.start(t); o.stop(t + 0.08);
    var s2 = nsrc(t, 0.05), lp = ctx.createBiquadFilter(), g2 = ctx.createGain(); lp.type = 'lowpass'; lp.frequency.value = 750;
    g2.gain.setValueAtTime(0.0001, t); g2.gain.linearRampToValueAtTime(vol * 0.45, t + 0.002); g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);
    s2.connect(lp); lp.connect(g2); g2.connect(sfxBus);
  }
  function click(t, vol, f, q) {
    var s = nsrc(t, 0.01), bp = ctx.createBiquadFilter(), g = ctx.createGain();
    bp.type = 'bandpass'; bp.frequency.value = f; bp.Q.value = q || 1.4;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.001); g.gain.exponentialRampToValueAtTime(0.0001, t + (q > 5 ? 0.06 : 0.006));
    s.connect(bp); bp.connect(g); g.connect(sfxBus);
  }
  function jingle(t, vol) {
    [0, 0.11, 0.19].forEach(function (dt, k) {
      var s = nsrc(t + dt, 0.2), g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t + dt); g.gain.linearRampToValueAtTime(vol * (1 - k * 0.2), t + dt + 0.003); g.gain.exponentialRampToValueAtTime(0.0001, t + dt + 0.18);
      [5300, 7400, 9700].forEach(function (f) { var bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = f * (0.97 + Math.random() * 0.06); bp.Q.value = 14; s.connect(bp); bp.connect(g); });
      g.connect(sfxBus);
    });
  }
  function whoosh(t, vol, dur, f0, f1) {
    var s = nsrc(t, dur), bp = ctx.createBiquadFilter(), g = ctx.createGain();
    bp.type = 'bandpass'; bp.Q.value = 1.2; bp.frequency.setValueAtTime(f0, t); bp.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + dur * 0.4); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(bp); bp.connect(g); g.connect(sfxBus);
  }
  function chord() { var T = THEMES[M.theme] || THEMES.none; return [0, 2, 4, 7].map(function (k) { return deg(T, T.prog[0] + k, 1); }); }

  var SFX = {
    card: function (t) { slide(t, 0.45, 0.085, 3200); tap(t + 0.075, 0.55); },
    deal: function (t) { slide(t, 0.22, 0.055, 3800); tap(t + 0.045, 0.26, 260); },
    select: function (t) { slide(t, 0.13, 0.045, 2400); },
    shuffle: function (t) {
      for (var i = 0; i < 34; i++) click(t + i * 0.021 + Math.random() * 0.006, 0.12 + Math.random() * 0.14, 2600 + Math.random() * 3200);
      slide(t + 0.74, 0.32, 0.26, 1900); tap(t + 1.0, 0.35, 160);
    },
    gather: function (t) { slide(t, 0.25, 0.07, 3000); slide(t + 0.05, 0.22, 0.07, 2700); slide(t + 0.1, 0.25, 0.09, 2500); tap(t + 0.19, 0.4, 170); },
    stamp: function (t) { tap(t, 0.7, 130); slide(t + 0.01, 0.12, 0.05, 1800); },
    flip: function (t) { slide(t, 0.3, 0.07, 2200); tap(t + 0.06, 0.35); },
    turn: function (t) { var c = chord(); pluck(c[2] + 12, t, 0.34, sfxBus, 4200); pluck(c[3] + 12, t + 0.13, 0.3, sfxBus, 4200); },
    win: function (t) { var c = chord(); c.slice(0, 3).forEach(function (m, i) { pluck(m + 12, t + i * 0.07, 0.3, sfxBus, 4000); }); },
    good: function (t) { var c = chord(); c.forEach(function (m, i) { pluck(m + 12, t + i * 0.09, 0.34, sfxBus, 4200); }); bell(c[0] + 24, t + 0.4, 0.05, sfxBus); },
    bad: function (t) { var c = chord(); [c[2], c[1], c[0] - 1].forEach(function (m, i) { pluck(m, t + i * 0.16, 0.4, sfxBus, 1800); }); },
    wizard: function (t) { whoosh(t, 0.16, 0.6, 700, 5200); var c = chord(); c.forEach(function (m, i) { bell(m + 24, t + 0.05 + i * 0.06, 0.05, sfxBus); }); },
    jester: function (t) { jingle(t, 0.45); },
    tick: function (t) { click(t, 0.5, 1850, 9); },
    ui: function (t) { click(t, 0.12, 3000, 1.2); },
    end: function (t) { var c = chord(); c.concat([c[0] + 12, c[2] + 12]).forEach(function (m, i) { pluck(m + 12, t + i * 0.1, 0.32, sfxBus, 4400); }); [0, 1, 2].forEach(function (i) { bell(c[i] + 24, t + 0.7 + i * 0.15, 0.04, sfxBus); }); }
  };
  function sfx(name, delay) {
    if (!set.sfx || !ctx || ctx.state !== 'running' || !SFX[name]) return;
    SFX[name](ctx.currentTime + 0.005 + (delay || 0));
  }

  document.addEventListener('visibilitychange', function () {
    hidden = document.hidden;
    if (!ctx) return;
    if (!hidden && M.on) M.next = Math.max(M.next, ctx.currentTime + 0.2);
    applyVolumes();
  });

  root.Sound = {
    unlock: function () { ensure(); if (set.music) music.start(); },
    sfx: sfx, music: music,
    settings: function () { return Object.assign({}, set); },
    set: function (k, v) {
      set[k] = v; saveSet();
      if (k === 'music') { if (v) { ensure(); music.start(); } else music.stop(); }
      applyVolumes();
    },
    duck: function (on) { duckLevel = on ? 0.3 : 1; applyVolumes(); },
    vibrate: function (ms) { if (set.vibrate && navigator.vibrate) { try { navigator.vibrate(ms); } catch (e) {} } },
    ctx: function () { return ensure(); }
  };
})(typeof self !== 'undefined' ? self : this);
