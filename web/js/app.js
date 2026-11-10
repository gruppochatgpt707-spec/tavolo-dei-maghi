/* Interfaccia: collega regole, rete, suoni e schermo. */
(function () {
  'use strict';
  var E = window.Engine, N = window.Net, C = window.Cards, PR = window.Profile, SND = window.Sound;
  var PREVIEW = !!window.__PREVIEW__;
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var store = {
    get: function (k) { try { return JSON.parse(localStorage.getItem('tavolo_' + k)); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem('tavolo_' + k, JSON.stringify(v)); } catch (e) {} },
    del: function (k) { try { localStorage.removeItem('tavolo_' + k); } catch (e) {} }
  };
  var ICON = {
    mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
    micoff: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 9v2a3 3 0 0 0 5 2.2M15 10V6a3 3 0 0 0-5.7-1.3M5 11a7 7 0 0 0 11.5 5.3M19 11a7 7 0 0 1-.6 2.8M12 18v3M3 3l18 18"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z"/></svg>',
    sheet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3h14v18H5zM5 9h14M5 15h14M12 3v18"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6c-2-1.5-5-2-8-1.5v14c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5v-14c-3-.5-6 0-8 1.5ZM12 6v14"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>',
    scroll: '<svg viewBox="0 0 40 40"><path d="M9 7h20a4 4 0 0 1 4 4v20a3 3 0 0 1-3 3H12a4 4 0 0 1-4-4V10" fill="#f3e4c0" stroke="#3a2414" stroke-width="2.4"/><path d="M8 10a3 3 0 0 1 6 0v3H8Z" fill="#e2cfa0" stroke="#3a2414" stroke-width="2.2"/><path d="M15 15h13M15 20h13M15 25h9" stroke="#9a7a50" stroke-width="2"/><path d="M27 4l7 7-12 12-4 1 1-4Z" fill="#fff4dc" stroke="#3a2414" stroke-width="2"/></svg>',
    token: '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" fill="#e3b24a" stroke="#3a2414" stroke-width="3"/><text x="20" y="26.5" text-anchor="middle" font-size="17" font-weight="700" fill="#3a2414" font-family="Lora,serif">M</text></svg>'
  };

  var S = {
    view: null, token: null, code: null, core: null, link: null, voice: null, name: '',
    sel: null, bidPick: null, chat: [], unread: 0, avatars: {},
    timerAt: 0, timeLeft: null, timeTotal: 0, dealing: false, tickSec: null, speaking: {}, voiceAskTakeover: null, statTab: 'real'
  };
  if (window.__TEST__) window.__S = S;
  function sfx(n, d) { SND.sfx(n, d); }

  /* ------------ Avatar ------------ */
  function avOf(p) {
    if (!p) return PR.avatarURL('p:monella');
    var av = S.avatars[p.pid];
    if (!av && S.view && p === S.view.players[S.view.me]) av = PR.get().av;
    return PR.avatarURL(av || 'p:monella');
  }
  function imgTag(p, cls) { return '<img class="' + (cls || '') + '" src="' + esc(avOf(p)) + '" alt="" draggable="false" decoding="async">'; }

  /* ------------ Comunicazione ------------ */
  function send(m) {
    if (S.core) S.core.onMessage(S.token, m);
    else if (S.link) S.link.send(m);
  }
  function hostOut(token, m) {
    if (token === S.token) onMsg(m);
    else if (S.link) S.link.send(token, m);
  }
  function onMsg(m) {
    switch (m.t) {
      case 'state': return applyView(m);
      case 'avatars': S.avatars = m.map || {}; if (S.view) refreshAvatars(); return;
      case 'toast': return toast(m.text, m.bad);
      case 'emote': return showEmote(m.p, m.e);
      case 'chat': return addChat(m.p, m.text);
      case 'reject': return onReject(m);
      case 'kicked': leave(); return homeMsg('Sei stato tolto dalla sala d\'attesa.');
      case 'ended': leave(); return homeMsg('Chi ha creato la partita l\'ha chiusa.');
      case 'voiceBusy': stopVoiceLocal(); S.voiceAskTakeover = m.name; renderVoice(); return;
      case 'voiceOff': stopVoiceLocal(); toast(m.by + ' è entrato in voce per il tuo luogo: sei uscito dalla chat vocale.'); return;
    }
  }
  function refreshAvatars() {
    var v = S.view;
    if (v.phase === 'lobby') renderLobby(v); else { renderSeats(v); renderStrip(v); }
    renderVoice();
  }

  function netError(e) {
    var t = e && e.type;
    if (t === 'lib') return 'Non riesco a caricare il modulo di collegamento. Controlla la connessione internet e riprova.';
    if (t === 'peer-unavailable') return 'Non trovo nessuna partita con questo codice. Controlla le lettere e riprova.';
    if (t === 'timeout') return 'Il tavolo non risponde. Verifica che chi ha creato la partita abbia la pagina aperta e riprova.';
    if (t === 'browser-incompatible') return 'Questo browser non supporta il gioco online. Prova con Chrome, Safari o Firefox aggiornati.';
    return 'Il servizio di collegamento non risponde. Controlla la connessione e riprova tra qualche secondo.';
  }
  function nameOrAsk() {
    var n = $('#nameInput').value.trim();
    if (!n) { homeMsg('Scrivi il tuo nome per sederti al tavolo.'); $('#nameInput').focus(); return null; }
    PR.save({ name: n }); renderProfileChip();
    return n;
  }
  function homeMsg(t) { $('#homeMsg').textContent = t || ''; }
  function busy(t, x) { $('#busyTitle').textContent = t; $('#busyText').textContent = x || ''; $('#ovBusy').hidden = false; }
  function unbusy() { $('#ovBusy').hidden = true; }

  function makeVoice() {
    S.voice = new N.Voice({
      getPeer: function () { return S.link && S.link.peer; },
      myPeerId: function () { return S.link && S.link.peer && S.link.peer.id; },
      audioCtx: function () { return SND.ctx(); },
      onSpeaking: applySpeaking,
      onChange: function () { renderVoice(); renderVoiceIcon(); SND.duck(!!(S.voice && S.voice.on)); },
      onBlocked: function () { $('#audioUnlock').hidden = false; }
    });
  }
  function hostCore(code, token, solo) {
    return new N.HostCore({ code: code, token: token, out: hostOut, solo: solo, persist: function (d) { if (d) store.set('host', d); else store.del('host'); } });
  }

  function createGame(forcedRetry, match) {
    var name = nameOrAsk();
    if (!name) return;
    if (PREVIEW) return startSolo(name);
    homeMsg('');
    busy(match ? 'Partita trovata' : 'Preparo il tavolo', match ? 'Preparo il tavolo per i giocatori trovati…' : 'Sto creando il codice della partita…');
    var code = match ? match.code : N.makeCode(), token = N.makeToken();
    S.token = token; S.code = code; S.name = name;
    S.core = hostCore(code, token, false);
    makeVoice();
    S.link = new N.HostLink(code, S.core, function (c) { S.voice.incoming(c); }, function () {});
    S.link.open(false).then(function (p) {
      unbusy();
      S.core.addPlayer(name, token, p.id, false, PR.get().av);
      S.core.after();
      if (match) autoStart(match);
    }).catch(function (e) {
      unbusy();
      var retry = e && e.type === 'unavailable-id' && !forcedRetry && !match;
      resetSession();
      if (retry) return createGame(true);
      homeMsg(netError(e));
    });
  }
  /* Partita nata dalla ricerca globale: parte da sola quando sono arrivati tutti (o dopo 25 secondi) */
  function autoStart(match) {
    S.matched = true;
    var until = Date.now() + 25000;
    var t = setInterval(function () {
      if (!S.core || S.core.g) return clearInterval(t);
      var humans = S.core.players.filter(function (p) { return !p.bot && p.connected; }).length;
      if (humans < match.humans && Date.now() < until) return;
      clearInterval(t);
      for (var k = S.core.players.length; k < 3; k++) send({ t: 'addBot' });
      send({ t: 'start' });
    }, 500);
  }

  /* ------------ Ricerca globale ------------ */
  function startSearch() {
    var name = nameOrAsk();
    if (!name) return;
    if (PREVIEW) { homeMsg('Dall\'anteprima non si può cercare online. Usa il sito o l\'app.'); return; }
    homeMsg('');
    $('#searchList').innerHTML = ''; $('#searchText').textContent = 'Cerco altri giocatori che stanno cercando una partita in questo momento…';
    $('#searchNow').disabled = true;
    openOverlay('#ovSearch');
    S.search = new window.Match.Search({ name: name, av: PR.get().av }, {
      status: function (st) {
        if (st.text) { $('#searchText').textContent = st.text; return; }
        var n = st.n;
        $('#searchText').textContent = n <= 1 ? 'Per ora ci sei solo tu. Resta in attesa: appena qualcuno cerca, vi metto allo stesso tavolo.' :
          n + ' giocatori trovati' + (st.left != null ? '. La partita parte tra ' + Math.ceil(st.left / 1000) + ' s' : '') + '.';
        $('#searchList').innerHTML = st.names.map(function (nm, i) { return '<li><span class="pn">' + esc(nm) + (i === 0 ? '<small>prepara il tavolo</small>' : '') + '</span></li>'; }).join('');
        $('#searchNow').disabled = n < 2;
      },
      go: function (m) {
        S.search = null;
        ($('#ovSearch').hidden = true);
        SND.sfx('good');
        if (m.host) createGame(true, m);
        else { S.matched = true; joinMatched(m.code, 0); }
      }
    });
    S.search.start().catch(function (e) { ($('#ovSearch').hidden = true); S.search = null; homeMsg(netError(e)); });
  }
  function joinMatched(code, tries) {
    /* chi prepara il tavolo può metterci un attimo ad aprirlo: riprovo qualche volta */
    setTimeout(function () {
      joinGame(code, undefined, function () { if (tries < 4) { joinMatched(code, tries + 1); return true; } return false; });
    }, tries === 0 ? 1200 : 1500);
  }
  function resumeHost(save) {
    S.name = (save.players.filter(function (p) { return p.token === save.hostToken; })[0] || {}).name || 'Host';
    busy('Riapro il tavolo', 'Riprendo la partita ' + save.code + '. Può servire qualche secondo.');
    S.token = save.hostToken; S.code = save.code;
    S.core = hostCore(save.code, save.hostToken, false);
    S.core.restore(save);
    makeVoice();
    S.link = new N.HostLink(save.code, S.core, function (c) { S.voice.incoming(c); }, function () {});
    S.link.open(true).then(function (p) {
      unbusy();
      var me = S.core.players[S.core.seatOf(save.hostToken)];
      me.connected = true; me.peerId = p.id;
      S.core.after();
    }).catch(function (e) { unbusy(); resetSession(); homeMsg(netError(e)); });
  }
  function startSolo(name) {
    var token = N.makeToken();
    S.token = token; S.code = 'SOLO'; S.name = name;
    S.core = hostCore('SOLO', token, true);
    S.core.addPlayer(name, token, null, false, PR.get().av);
    send({ t: 'addBot' }); send({ t: 'addBot' }); send({ t: 'addBot' });
  }
  function joinGame(code, claim, onFail) {
    var name = nameOrAsk();
    if (!name) return;
    if (PREVIEW) { homeMsg('Dall\'anteprima non ci si può collegare ad altri dispositivi. Usa il sito o l\'app.'); return; }
    code = code.toUpperCase().trim();
    if (code.length !== 5) { homeMsg('Il codice è formato da 5 caratteri.'); return; }
    homeMsg(''); $('#seatChoice').hidden = true;
    busy('Mi siedo al tavolo', 'Sto cercando la partita ' + code + '…');
    var saved = store.get('client');
    var token = saved && saved.code === code ? saved.token : N.makeToken();
    S.token = token; S.code = code; S.name = name;
    makeVoice();
    var msg = { t: 'join', name: name, token: token, av: PR.get().av };
    if (typeof claim === 'number') msg.claim = claim;
    S.link = new N.ClientLink(code, msg, { onMessage: onMsg, onCall: function (c) { S.voice.incoming(c); }, onStatus: onLinkStatus });
    S.link.start().then(function () {
      S.joinTimer = setTimeout(function () { if (!S.view) { unbusy(); resetSession(); homeMsg('Il tavolo non ha risposto. Riprova.'); } }, 9000);
    }).catch(function (e) { unbusy(); resetSession(); if (onFail && e && e.type === 'peer-unavailable' && onFail()) return; homeMsg(netError(e)); });
  }
  function onReject(m) {
    clearTimeout(S.joinTimer);
    var code = S.code;
    unbusy(); resetSession();
    if (m.why === 'full') return homeMsg('Il tavolo è al completo: massimo 6 giocatori.');
    if (m.why === 'started') return homeMsg('La partita è già iniziata e non ci sono posti liberi.');
    if (m.why === 'seats') {
      homeMsg('La partita è già iniziata. Riprendi il posto di chi si è disconnesso:');
      var box = $('#seatChoice');
      box.innerHTML = m.seats.map(function (s) { return '<button class="btn ink" data-a="claim" data-i="' + s.i + '" data-code="' + esc(code) + '">Riprendi il posto di ' + esc(s.name) + '</button>'; }).join('');
      box.hidden = false;
    }
  }
  function onLinkStatus(st) {
    if (st === 'lost') {
      $('#connTitle').textContent = 'Connessione persa';
      $('#connText').textContent = 'Provo a ricollegarmi al tavolo. Il tuo posto resta riservato.';
      $('#ovConn').hidden = false;
    } else if (st === 'retry') {
      $('#connText').textContent = 'Il tavolo non risponde ancora. Continuo a provare: chi ha creato la partita deve tenere la pagina aperta.';
    } else if (st === 'online') {
      $('#ovConn').hidden = true;
      toast('Di nuovo al tavolo.');
      if (S.voice && S.voice.on) send({ t: 'voice', on: true, muted: S.voice.muted, listen: S.voice.listen, takeover: true });
    }
  }
  function resetSession() {
    clearTimeout(S.joinTimer);
    if (S.voice && S.voice.on) S.voice.stop();
    if (S.link) { try { S.link.close(); } catch (e) {} }
    if (S.core) { clearTimeout(S.core.t1); clearTimeout(S.core.t2); }
    S.core = null; S.link = null; S.voice = null; S.view = null; S.token = null; S.code = null; S.matched = false;
    S.chat = []; S.unread = 0; S.sel = null; S.bidPick = null; S.voiceAskTakeover = null; S.avatars = {};
    $('#trick').innerHTML = ''; $('#hand').innerHTML = ''; $('#fx').innerHTML = ''; $('#seats').innerHTML = '';
    SND.duck(false); SND.music.theme('none');
    releaseWake();
  }
  function leave() {
    resetSession();
    $$('.overlay').forEach(function (o) { o.hidden = true; });
    showScreen('home');
    renderResumeBox();
  }
  function exitNow() {
    if (S.core && S.link) {
      S.core.broadcastRaw({ t: 'ended' });
      store.del('host');
      var link = S.link; S.link = null;
      setTimeout(function () { link.close(); }, 250);
    } else if (S.link) store.del('client');
    leave();
  }

  /* ------------ Stato ricevuto ------------ */
  function showScreen(id) { ['home', 'lobby', 'game'].forEach(function (x) { $('#' + x).hidden = x !== id; }); }

  function applyView(v) {
    clearTimeout(S.joinTimer);
    unbusy();
    var prev = S.view;
    S.view = v;
    S.timerAt = performance.now(); S.timeLeft = v.timeLeft; S.timeTotal = v.timeTotal;
    if (S.link && !S.core && !prev) store.set('client', { code: v.code, token: S.token, name: S.name, at: Date.now() });
    if (v.phase === 'lobby') {
      showScreen('lobby');
      $('#ovResult').hidden = true; $('#ovEnd').hidden = true;
      renderLobby(v);
      SND.music.theme('none');
    } else {
      if ($('#game').hidden) { showScreen('game'); requestWake(); }
      renderGame(v, prev);
    }
    if (S.voice) S.voice.reconcile(v.players);
    renderVoice(); renderVoiceIcon();
    applySpeaking(S.speaking);
  }

  function clockText(ms) { var t = Math.ceil(ms / 1000), m = Math.floor(t / 60), s = t % 60; return m + ':' + (s < 10 ? '0' : '') + s; }
  function timeNow() { return S.timeLeft === null ? null : Math.max(0, S.timeLeft - (performance.now() - S.timerAt)); }

  setInterval(function () {
    var v = S.view; if (!v) return;
    var left = timeNow(), gts = $$('.status .tt');
    if (left === null || !(v.phase === 'bid' || v.phase === 'play' || v.phase === 'trump')) gts.forEach(function (e) { e.textContent = ''; });
    var frac = S.timeTotal ? (left || 0) / S.timeTotal : 0, txt = left === null ? '' : clockText(left);
    if (!$('#bidPanel').hidden) setFuse('#bidFuse', '#bidTime', left === null ? 1 : frac, txt, left);
    if (!$('#trumpPanel').hidden) setFuse('#trumpFuse', '#trumpTime', left === null ? 1 : frac, txt, left);
    if (!$('#ovResult').hidden) $('#resFuse').style.width = (frac * 100) + '%';
    if (left !== null && (v.phase === 'bid' || v.phase === 'play' || v.phase === 'trump')) {
      gts.forEach(function (e) { e.textContent = txt; e.classList.toggle('urgent', left < 10000); });
      var sec = Math.ceil(left / 1000);
      if (v.turn === v.me && sec <= 5 && sec !== S.tickSec && sec > 0) { S.tickSec = sec; sfx('tick'); }
    }
  }, 200);
  function setFuse(f, t, frac, txt, left) {
    $(f).style.width = (frac * 100) + '%';
    var el = $(t); el.textContent = txt; el.classList.toggle('urgent', left !== null && left < 10000);
  }

  /* ------------ Sala d'attesa ------------ */
  function renderLobby(v) {
    $('#codeCells').innerHTML = v.code.split('').map(function (c) { return '<span>' + esc(c) + '</span>'; }).join('');
    $('#codeBox').hidden = v.solo; $('#lobbySub').hidden = v.solo;
    $('#pCount').textContent = v.players.length + ' di 6';
    $('#pList').innerHTML = v.players.map(function (p, i) {
      var tag = [];
      if (i === 0) tag.push('distribuisce per primo');
      if (p.isHost && !v.solo) tag.push('ha creato la partita');
      if (p.bot) tag.push('bot');
      if (i === v.me) tag.push('tu');
      var tools = '';
      if (v.amHost) {
        tools = '<button class="mini" data-a="move" data-i="' + i + '" data-d="-1" aria-label="Sposta ' + esc(p.name) + ' su"' + (i === 0 ? ' disabled' : '') + '>↑</button>' +
          '<button class="mini" data-a="move" data-i="' + i + '" data-d="1" aria-label="Sposta ' + esc(p.name) + ' giù"' + (i === v.players.length - 1 ? ' disabled' : '') + '>↓</button>';
        if (!p.isHost) tools += '<button class="mini" data-a="kick" data-i="' + i + '" aria-label="Togli ' + esc(p.name) + '">×</button>';
      }
      return '<li style="--hue:' + p.hue + '">' + imgTag(p) + '<span class="pn">' + esc(p.name) + '<small>' + tag.join(', ') + '</small></span>' + tools + '</li>';
    }).join('');
    $('#seatTools').hidden = !v.amHost;
    $('#optPM').checked = v.opts.plusMinus; $('#optPM').disabled = !v.amHost;
    $('#optPlay').value = String(v.opts.playSeconds); $('#optPlay').disabled = !v.amHost;
    $('#optBid').value = String(v.opts.bidSeconds); $('#optBid').disabled = !v.amHost;
    $('#startBtn').hidden = !v.amHost;
    $('#startBtn').disabled = v.players.length < 3;
    $('#startBtn').textContent = v.players.length < 3 ? 'Servono almeno 3 giocatori' : 'Inizia la partita';
    $('#waitMsg').textContent = S.matched ? 'Partita trovata con la ricerca globale: inizia da sola appena arrivano tutti.' : v.amHost ? '' : 'In attesa che chi ha creato la partita la faccia iniziare.';
    if (S.matched) $('#startBtn').hidden = true;
    $('#lobbyVoiceBox').hidden = v.solo;
  }

  /* ------------ Tavolo ------------ */
  function isWide() { return window.innerWidth >= 1000 && window.innerHeight >= 600; }
  function isLand() { return window.innerHeight < 500 && window.innerWidth > window.innerHeight; }
  function applyLayoutMode() { document.body.classList.toggle('wide', isWide()); document.body.classList.toggle('land', isLand()); }
  function gameRect() { return $('#game').getBoundingClientRect(); }
  function tableGeom() {
    var r = $('#table').getBoundingClientRect(), wide = isWide(), land = isLand(), v = S.view;
    var G = { w: r.width, h: r.height, left: r.left, top: r.top, cx: r.width / 2, cy: r.height * (wide ? 0.47 : land ? 0.5 : 0.46), rx: r.width * (wide ? 0.39 : land ? 0.4 : 0.37), ry: r.height * (wide ? 0.37 : land ? 0.36 : 0.37) };
    var probe = document.querySelector('.seat .avwrap'); G.av = probe ? probe.offsetHeight : (wide ? 60 : 46);
    G.yTop = G.av / 2 + 16; G.yBot = G.h - (wide ? 86 : 44);
    /* sul telefono la parte bassa del tavolo resta libera per la finestra della previsione */
    if (!wide && !land) G.yBot = Math.min(G.yBot, G.h - Math.min(G.h * 0.42, 260) - 34);
    if (v && v.players) {
      var n = v.players.length, hi = -1, lo = 1;
      for (var k = 1; k < n; k++) { var sn = Math.sin(Math.PI / 2 + k * 2 * Math.PI / n); hi = Math.max(hi, sn); lo = Math.min(lo, sn); }
      if (hi - lo > 0.1) {
        var ry = Math.min(G.ry, (G.yBot - G.yTop) / (hi - lo));
        if (G.cy + ry * hi > G.yBot || G.cy + ry * lo < G.yTop) { G.ry = ry; G.cy = G.yTop - ry * lo; }
      } else G.cy = Math.max(G.yTop - G.ry * lo, Math.min(G.cy, G.yBot - G.ry * hi));
    }
    return G;
  }
  function seatAngle(v, seat) { return Math.PI / 2 + ((seat - v.me + v.players.length) % v.players.length) * 2 * Math.PI / v.players.length; }
  function seatXY(v, i, G) {
    var a = seatAngle(v, i), x = G.cx + G.rx * Math.cos(a), y = G.cy + G.ry * Math.sin(a);
    var mx = isWide() ? 80 : 48;
    x = Math.max(mx, Math.min(G.w - mx, x)); y = Math.max(G.yTop, Math.min(G.yBot, y));
    /* sul telefono il vassoio della briscola sta in alto a sinistra: il posto si sposta per non coprirlo */
    var tray = $('#tray');
    if (!isWide() && tray) {
      var tr = tray.getBoundingClientRect(), tb = tr.bottom - G.top + 34, tx = tr.right - G.left + 44;
      if (y < tb && x < tx) { if (Math.abs(Math.cos(a)) > 0.5) y = tb; else x = tx; }
    }
    return { x: x, y: y, a: a };
  }
  function anchorOf(seat) {
    var g = gameRect(), v = S.view, r;
    if (seat === v.me) { r = $('#handzone').getBoundingClientRect(); return { x: r.left + r.width / 2 - g.left, y: r.top + r.height * 0.35 - g.top }; }
    var el = document.getElementById('seat-' + seat);
    el = el ? el.querySelector('.avwrap') : document.getElementById('chip-' + seat);
    if (!el) return { x: g.width / 2, y: 0 };
    r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2 - g.left, y: r.top + r.height / 2 - g.top };
  }
  function bidOrder(v) {
    var out = [], start = (v.dealer + 1) % v.players.length;
    for (var k = 0; k < v.players.length; k++) out.push((start + k) % v.players.length);
    return out;
  }

  function sealHTML(p, i, v) {
    var cls = 'seal', txt = '';
    if (p.bid === null) {
      if ((v.phase === 'bid' || v.phase === 'trump') && v.turn === i && v.phase === 'bid') cls += ' pending';
      else { cls += ' empty'; txt = (bidOrder(v).indexOf(i) + 1) + '°'; }
    } else {
      txt = p.bid;
      if (v.phase !== 'bid' && v.phase !== 'deal' && v.phase !== 'trump') { if (p.won === p.bid) cls += ' exact'; else if (p.won > p.bid) cls += ' over'; }
    }
    var lab = p.bid === null ? 'previsione non ancora fatta' : 'prevede ' + p.bid;
    return '<span class="' + cls + '" id="seal-' + i + '" title="' + lab + '" aria-label="' + lab + '">' + txt + '</span>';
  }
  function pileHTML(p, i) {
    var cls = 'pile' + (p.won === 0 ? ' zero' : '') + (p.bid !== null && p.won === p.bid ? ' ok' : '') + (p.bid !== null && p.won > p.bid ? ' over' : '');
    return '<span class="' + cls + '" id="pile-' + i + '" title="prese fatte: ' + p.won + '" aria-label="prese fatte: ' + p.won + '"><i></i><i></i><b>' + p.won + '</b></span>';
  }

  function renderSeats(v) {
    var G = tableGeom(), html = '';
    v.players.forEach(function (p, i) {
      if (i === v.me) return;
      var pos = seatXY(v, i, G);
      var active = (v.phase === 'bid' || v.phase === 'play' || v.phase === 'trump') && v.turn === i;
      var n = Math.min(p.cards, 10), backs = '';
      for (var k = 0; k < n; k++) backs += '<span style="left:' + (50 - (n * 7) / 2 - 10 + k * 7) + 'px;transform:rotate(' + ((k - n / 2) * 4) + 'deg)"></span>';
      var mic = p.voice ? '<i class="mic' + (p.muted ? ' mute' : '') + '">' + (p.muted ? ICON.micoff : ICON.mic) + '</i>' : '';
      var ord = v.phase === 'bid' && p.bid === null && !active ? '' : '';
      html += '<div class="seat' + (active ? ' turn' : '') + (p.connected ? '' : ' away') + '" id="seat-' + i + '" data-peer="' + esc(p.peerId || '') + '" style="left:' + pos.x.toFixed(1) + 'px;top:' + pos.y.toFixed(1) + 'px;--hue:' + p.hue + '">' +
        '<div class="avwrap">' + imgTag(p, 'ava') + sealHTML(p, i, v) + (v.phase !== 'bid' && v.phase !== 'deal' && v.phase !== 'trump' ? pileHTML(p, i) : '') + (v.dealer === i ? '<i class="dtok" title="Mazziere">M</i>' : '') + mic + ord + '</div>' +
        '<div class="tag">' + esc(p.name) + (p.connected ? '' : ' (assente)') + '</div><div class="backs">' + backs + '</div></div>';
    });
    $('#seats').innerHTML = html;
    $('#rune').style.top = G.cy + 'px';
    drawOrbit(v, G);
  }
  function drawOrbit(v, G) {
    var rx = G.rx * 0.86, ry = G.ry * 0.86, s = '', n = v.players.length;
    for (var k = 0; k < n; k++) {
      var a = Math.PI / 2 + (k + 0.5) * 2 * Math.PI / n, x = G.cx + rx * Math.cos(a), y = G.cy + ry * Math.sin(a);
      var tx = -rx * Math.sin(a), ty = ry * Math.cos(a), ang = Math.atan2(ty, tx) * 180 / Math.PI;
      s += '<path d="M-7 -6L5 0L-7 6" transform="translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') rotate(' + ang.toFixed(1) + ')" fill="none" stroke="#e3b455" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>';
    }
    $('#orbit').innerHTML = s;
  }

  function orderedSeats(v) { var a = [], n = v.players.length; for (var k = 1; k <= n; k++) a.push((v.me + k) % n); return a; }
  function chipHTML(p, i, v) {
    var cls = ['chip'], active = (v.phase === 'bid' || v.phase === 'play' || v.phase === 'trump') && v.turn === i;
    if (active) cls.push('turn');
    if (i === v.me) cls.push('me');
    if (!p.connected) cls.push('away');
    if (p.bid !== null && v.phase !== 'bid') { if (p.won === p.bid) cls.push('exact'); else if (p.won > p.bid) cls.push('over'); }
    var coin = v.dealer === i ? '<i class="dealer-coin" title="Mazziere">M</i>' : '';
    var tip = 'prese fatte ' + p.won + ', previste ' + (p.bid === null ? 'ancora nessuna' : p.bid) + ', punti ' + p.score;
    return '<div class="' + cls.join(' ') + '" id="chip-' + i + '" data-peer="' + esc(p.peerId || '') + '" title="' + tip + '" aria-label="' + esc(i === v.me ? 'Tu' : p.name) + ': ' + tip + '">' +
      '<span class="c-name"><i class="dot" style="background:' + p.hue + '"></i><em>' + esc(i === v.me ? 'Tu' : p.name) + '</em>' + coin + '</span>' +
      '<span class="c-tally">' + p.won + '<i>/' + (p.bid === null ? '–' : p.bid) + '</i></span>' +
      '<span class="c-score">' + p.score + '</span></div>';
  }
  function renderStrip(v, prev) {
    $('#stripBody').innerHTML = orderedSeats(v).map(function (i) { return chipHTML(v.players[i], i, v); }).join('');
    $('#stripSum').textContent = v.phase === 'deal' ? '' : 'previste ' + v.bidSum + ' su ' + v.round;
    if (prev && prev.players) v.players.forEach(function (p, i) {
      if (prev.players[i] && prev.round === v.round && p.won > prev.players[i].won) { var c = document.getElementById('chip-' + i); if (c) c.classList.add('bump'); }
    });
  }
  function renderStatus(v) {
    var st = $('#status'), name = function (i) { return esc(v.players[i].name); }, html = '', mine = false, tt = false;
    switch (v.phase) {
      case 'deal': html = v.dealer === v.me ? 'Distribuisci le carte' : name(v.dealer) + ' distribuisce le carte'; break;
      case 'trump': if (v.turn !== v.me) { html = name(v.dealer) + ' sceglie la briscola'; tt = true; } break;
      case 'bid': if (v.turn !== v.me) { html = name(v.turn) + ' sta facendo la previsione'; tt = v.opts.bidSeconds > 0; } break;
      case 'play':
        if (v.turn === v.me) {
          mine = true; tt = v.opts.playSeconds > 0; html = 'Tocca a te';
          if (v.lead && v.lead.suit && v.hand.some(function (c) { return E.suitOf(c) === v.lead.suit; })) html += ': rispondi a ' + E.SUIT_NAMES[v.lead.suit];
          else if (v.trick.length === 0) html += ': apri la presa';
        } else { html = 'Tocca a ' + name(v.turn); tt = v.opts.playSeconds > 0; }
        break;
      case 'trickEnd': html = v.trickWinner === v.me ? 'Hai vinto la presa' : name(v.trickWinner) + ' vince la presa'; break;
    }
    st.className = 'status' + (mine ? ' mine' : '');
    st.innerHTML = html ? html + (tt ? '<span class="tt"></span>' : '') : '';
  }

  function renderGame(v, prev) {
    applyLayoutMode();
    document.body.classList.toggle('crowded', v.players.length >= 5);
    $('#rNow').textContent = v.round; $('#rTot').textContent = v.totalRounds;
    renderTrumpInfo(v, prev);
    renderStrip(v, prev);
    renderSeats(v);
    renderHand(v, prev);
    renderTrick(v, prev);
    renderStatus(v);
    renderPanels(v, prev);
    runEffects(v, prev);
    if (!$('#ovSheet').hidden) renderSheet();
    if (prev && prev.players) v.players.forEach(function (p, i) {
      if (prev.players[i] && prev.round === v.round && p.won > prev.players[i].won) { var c = document.getElementById('pile-' + i); if (c) c.classList.add('bump'); }
    });
  }

  var traySig = '';
  function renderTrumpInfo(v, prev) {
    var dealing = v.phase === 'deal', chip = $('#trumpChip'), label = $('#trayLabel'), txt, chipHtml;
    if (dealing) { txt = ''; chipHtml = ''; }
    else if (v.phase === 'trump') { txt = 'Il mazziere sceglie'; chipHtml = '<span>Briscola da scegliere</span>'; }
    else if (v.trumpSuit) { var nm = E.SUIT_NAMES[v.trumpSuit]; txt = 'Briscola ' + nm; chipHtml = C.icon(v.trumpSuit) + '<span>' + nm + '</span>'; }
    else { txt = v.deckLeft === 0 ? 'Ultima mano: niente briscola' : 'Niente briscola'; chipHtml = '<span>Senza briscola</span>'; }
    chip.innerHTML = chipHtml; label.textContent = txt;
    document.documentElement.style.setProperty('--trump', v.trumpSuit && !dealing ? C.color(v.trumpSuit) : 'var(--none)');
    if (!dealing) SND.music.theme(v.trumpSuit || 'none');
    var sig = [v.round, dealing, v.trumpCard, v.trumpSuit].join('|');
    if (sig !== traySig) {
      traySig = sig;
      var slot = $('#deckSlot'), html = '';
      if (dealing) html = '<div class="card under">' + C.back() + '</div><div class="card">' + C.back() + '</div>';
      else if (v.trumpCard) html = '<div class="card under">' + C.back() + '</div><div class="card" id="trumpFace">' + C.face(v.trumpCard) + '</div>';
      slot.innerHTML = html;
      var face = $('#trumpFace');
      if (face && prev && prev.phase === 'deal') { face.animate([{ transform: 'rotateY(90deg) scale(1.2)' }, { transform: 'rotateY(0) scale(1)' }], { duration: 460, easing: 'ease-out' }); sfx('flip'); }
    }
  }

  function sortHand(hand, trump) {
    var order = function (c) {
      if (E.isWizard(c)) return 0;
      if (E.isJester(c)) return 900;
      var s = E.suitOf(c);
      return (s === trump ? 100 : 200 + E.SUITS.indexOf(s) * 100) + (14 - E.valueOf(c));
    };
    return hand.slice().sort(function (a, b) { return order(a) - order(b) || a.localeCompare(b); });
  }
  function handEl(id) { return document.getElementById('h-' + id); }
  function renderHand(v, prev) {
    var box = $('#hand'), sorted = sortHand(v.hand, v.phase === 'deal' ? null : v.trumpSuit);
    if (v.phase === 'deal' && prev && (prev.phase !== 'deal' || prev.round !== v.round)) S.dealing = true;
    S.staleHand = [];
    Array.prototype.slice.call(box.children).forEach(function (el) { if (sorted.indexOf(el.dataset.c) < 0) S.staleHand.push(el); });
    sorted.forEach(function (c, i) {
      var el = handEl(c);
      if (!el) {
        el = document.createElement('div');
        el.className = 'hcard card'; el.id = 'h-' + c; el.dataset.c = c;
        el.innerHTML = C.face(c);
        el.setAttribute('aria-label', E.cardName(c));
        if (S.dealing) el.classList.add('undealt');
        box.appendChild(el);
      }
      el.style.zIndex = i + 1;
    });
    S.handOrder = sorted;
    if (S.sel && sorted.indexOf(S.sel) < 0) S.sel = null;
    var myTurn = v.phase === 'play' && v.turn === v.me;
    sorted.forEach(function (c) { var el = handEl(c), legal = v.legal.indexOf(c) >= 0; el.classList.toggle('can', myTurn && legal); el.classList.toggle('dim', myTurn && !legal); });
    layoutHand();
  }
  function layoutHand() {
    var v = S.view; if (!v || !S.handOrder) return;
    var box = $('#hand'), order = S.handOrder, n = order.length, W = box.clientWidth;
    var first = n ? handEl(order[0]) : null, cw = first ? first.offsetWidth : 64, ch = cw * 1.5;
    var wide = isWide(), land = isLand(), rows = 1;
    if (n > 1 && !land && !wide && (W - cw) / (n - 1) < Math.max(25, cw * 0.4)) rows = 2;
    var maxArc = 0;
    if (wide && n > 1) { var mo = (n - 1) / 2; maxArc = mo * mo * Math.min(1.6, 14 / n) + cw * 0.1; }
    box.style.height = (rows === 2 ? ch * 1.6 : ch + maxArc) + 'px';
    var counts = rows === 2 ? [Math.ceil(n / 2), Math.floor(n / 2)] : [n], idx = 0;
    counts.forEach(function (m, r) {
      var step = m > 1 ? Math.min(cw * 1.05, (W - cw) / (m - 1)) : 0, total = cw + step * (m - 1), x0 = (W - total) / 2;
      for (var i = 0; i < m; i++) {
        var el = handEl(order[idx]), off = i - (m - 1) / 2;
        el._x = x0 + i * step; el._y = r * ch * 0.6 + (wide ? off * off * Math.min(1.6, 14 / m) : 0); el._r = wide ? off * Math.min(2.4, 22 / m) : 0;
        placeCard(el); idx++;
      }
    });
  }
  function placeCard(el, dx, dy) {
    var lift = S.sel === el.dataset.c ? -Math.min(24, el.offsetHeight * 0.2) : 0;
    el.style.transform = 'translate(' + (el._x + (dx || 0)) + 'px,' + (el._y + lift + (dy || 0)) + 'px) rotate(' + el._r + 'deg)';
  }
  function cardSeed(id) { var s = 0; for (var i = 0; i < id.length; i++) s = (s * 31 + id.charCodeAt(i)) % 997; return s; }
  function trickSlot(v, seat, id) {
    var G = tableGeom(), el = document.querySelector('.tcard'), tw = el ? el.offsetWidth : 70, th = tw * 1.5, a = seatAngle(v, seat);
    var crowded = v.players.length >= 5;
    var rx = Math.min(G.rx * 0.44, tw * (crowded ? 1.7 : 1.45)), ry = Math.min(G.ry * 0.4, th * (crowded ? 0.8 : 0.6));
    return { x: G.cx + rx * Math.cos(a) - tw / 2, y: G.cy + ry * Math.sin(a) - th / 2, r: (cardSeed(id) % 17) - 8 };
  }
  function renderTrick(v, prev) {
    var area = $('#trick'), existing = Array.prototype.slice.call(area.querySelectorAll('.tcard:not(.leaving)'));
    var ids = v.trick.map(function (e) { return e.c; }), tr = $('#table').getBoundingClientRect(), g = gameRect();
    existing.forEach(function (el) {
      if (ids.indexOf(el.dataset.c) >= 0) return;
      var w = prev && prev.trickWinner;
      if (w === null || w === undefined) { el.remove(); return; }
      el.classList.add('leaving');
      var a = anchorOf(w);
      var to = 'translate(' + (a.x - (tr.left - g.left) - el.offsetWidth / 2) + 'px,' + (a.y - (tr.top - g.top) - el.offsetHeight / 2) + 'px) rotate(12deg) scale(.25)';
      el.animate([{ transform: el.style.transform, opacity: 1 }, { transform: to, opacity: 0.3 }], { duration: 440, easing: 'cubic-bezier(.5,0,.7,.6)', fill: 'forwards' }).onfinish = function () { el.remove(); };
      if (!S._gathered) { S._gathered = true; sfx('gather'); setTimeout(function () { S._gathered = false; }, 300); }
    });
    var winnerNow = v.trick.length ? E.trickWinnerEntry(v.trick, v.trumpSuit) : null;
    v.trick.forEach(function (e, i) {
      var id = 't-' + e.c, el = document.getElementById(id), isNew = !el;
      if (!el) {
        el = document.createElement('div');
        el.className = 'tcard card'; el.id = id; el.dataset.c = e.c;
        el.innerHTML = C.face(e.c) + '<span class="who">' + esc(e.p === v.me ? 'Tu' : v.players[e.p].name) + '</span>';
        area.appendChild(el);
      }
      el.style.zIndex = i + 1;
      var s = trickSlot(v, e.p, e.c), target = 'translate(' + s.x + 'px,' + s.y + 'px) rotate(' + s.r + 'deg)';
      el.style.transform = target;
      el.classList.toggle('leading', !!(winnerNow && winnerNow.c === e.c && v.phase === 'play' && v.trick.length > 1));
      el.classList.toggle('win', v.phase === 'trickEnd' && v.trickWinner === e.p);
      if (isNew && prev && prev.phase !== 'lobby') {
        var from, h = e.p === v.me ? handEl(e.c) : null;
        if (h) { var hr = h.getBoundingClientRect(); from = 'translate(' + (hr.left - tr.left) + 'px,' + (hr.top - tr.top) + 'px) rotate(0deg) scale(' + (hr.width / el.offsetWidth) + ')'; }
        else { var a = anchorOf(e.p); from = 'translate(' + (a.x - (tr.left - g.left) - el.offsetWidth / 2) + 'px,' + (a.y - (tr.top - g.top) - el.offsetHeight / 2) + 'px) rotate(-14deg) scale(.45)'; }
        el.animate([{ transform: from }, { transform: target }], { duration: 320, easing: 'cubic-bezier(.2,.9,.3,1)' });
        sfx('card');
        if (E.isWizard(e.c)) setTimeout(function () { wizardFx(el); }, 280);
        else if (E.isJester(e.c)) setTimeout(function () { jesterFx(el); }, 280);
      }
    });
    (S.staleHand || []).forEach(function (el) { el.remove(); });
    S.staleHand = [];
  }
  function relayoutTrick() {
    var v = S.view; if (!v || !v.trick) return;
    v.trick.forEach(function (e) { var el = document.getElementById('t-' + e.c); if (!el) return; var s = trickSlot(v, e.p, e.c); el.style.transform = 'translate(' + s.x + 'px,' + s.y + 'px) rotate(' + s.r + 'deg)'; });
  }

  function renderPanels(v, prev) {
    var bidOn = v.phase === 'bid' && v.turn === v.me, bp = $('#bidPanel');
    if (bidOn && bp.hidden) { S.bidPick = null; S.tickSec = null; S.bidSig = null; }
    bp.hidden = !bidOn;
    if (bidOn) renderBidPanel(v);
    var trumpOn = v.phase === 'trump' && v.turn === v.me;
    $('#trumpPanel').hidden = !trumpOn;
    if (trumpOn && !$('#gems').firstChild) {
      $('#gems').innerHTML = E.SUITS.map(function (s) { return '<button class="gem" data-a="pickTrump" data-s="' + s + '" style="--c:' + C.color(s) + '">' + C.icon(s) + E.SUIT_NAMES[s] + '</button>'; }).join('');
    }
    if (v.phase === 'roundEnd') renderResult(v); else $('#ovResult').hidden = true;
    if (v.phase === 'gameOver') renderEnd(v); else $('#ovEnd').hidden = true;
  }
  function renderBidPanel(v) {
    var sig = [v.round, v.forbidden, v.bidSum, S.bidPick].join('|');
    if (S.bidSig === sig && $('#bidNums').firstChild) return;
    S.bidSig = sig;
    var opts = '';
    for (var n = 0; n <= v.round; n++) {
      var bad = v.forbidden === n;
      opts += '<button class="bn' + (S.bidPick === n ? ' sel' : '') + '" data-a="pickBid" data-n="' + n + '"' + (bad ? ' disabled aria-label="' + n + ' non consentito"' : '') + '>' + n + '</button>';
    }
    $('#bidNums').innerHTML = opts;
    var before = bidOrder(v).filter(function (i) { return v.players[i].bid !== null; }).map(function (i) { return esc(v.players[i].name) + ' ' + v.players[i].bid; });
    var bits = [v.round + (v.round === 1 ? ' presa in palio' : ' prese in palio')];
    if (before.length) bits.push('prima di te: ' + before.join(', ') + ' (totale ' + v.bidSum + ')');
    else bits.push('prevedi per primo');
    if (v.forbidden !== null) bits.push('con la variante non puoi dire ' + v.forbidden);
    $('#bidSub').innerHTML = bits.join(' · ');
    var ok = $('#bidOk');
    ok.disabled = S.bidPick === null;
    ok.textContent = S.bidPick === null ? 'Scegli un numero' : 'Prevedo ' + S.bidPick + (S.bidPick === 1 ? ' presa' : ' prese');
  }
  function renderResult(v) {
    var h = v.history[v.history.length - 1], entering = $('#ovResult').hidden;
    $('#resTitle').textContent = 'Mano ' + h.round + ' conclusa';
    var html = '<span class="th">Giocatore</span><span class="th num">Previste</span><span class="th num">Fatte</span><span class="th num">Punti</span><span class="th num">Totale</span>';
    v.players.forEach(function (p, i) {
      var d = h.deltas[i];
      html += '<div class="resrow" style="--i:' + (entering ? i : 0) + '"><span class="n">' + imgTag(p) + '<span>' + esc(i === v.me ? 'Tu' : p.name) + '</span></span><span class="num">' + h.bids[i] + '</span><span class="num">' + h.won[i] + '</span><span class="num ' + (d >= 0 ? 'up' : 'down') + '">' + (d > 0 ? '+' : '') + d + '</span><span class="num"><b>' + h.totals[i] + '</b></span></div>';
    });
    $('#resTable').innerHTML = html;
    var humans = v.players.filter(function (p) { return !p.bot && p.connected; }), ready = humans.filter(function (p) { return p.ready; }).length;
    $('#resReady').textContent = humans.length > 1 ? 'Pronti: ' + ready + ' su ' + humans.length : '';
    var me = v.players[v.me], last = v.round >= v.totalRounds;
    $('#readyBtn').disabled = me.ready;
    $('#readyBtn').textContent = me.ready ? 'In attesa degli altri' : last ? 'Vedi la classifica' : 'Prossima mano';
    $('#ovResult').hidden = false;
    if (entering) {
      var good = h.bids[v.me] === h.won[v.me];
      sfx(good ? 'good' : 'bad');
      if (good) { var g = gameRect(); burst(g.width / 2, g.height * 0.32, '#ffe9ad', 26); }
    }
  }
  function renderEnd(v) {
    var entering = $('#ovEnd').hidden, w = v.winners, names = w.map(function (i) { return i === v.me ? 'tu' : v.players[i].name; });
    $('#endTitle').textContent = w.length > 1 ? 'Parità! Vincono ' + names.join(' e ') : (w[0] === v.me ? 'Hai vinto!' : 'Ha vinto ' + names[0]);
    var ranking = v.players.map(function (p, i) { return { p: p, i: i }; }).sort(function (a, b) { return b.p.score - a.p.score; }), pos = 0, lastS = null;
    $('#podium').innerHTML = ranking.map(function (r, k) {
      if (r.p.score !== lastS) { pos = k + 1; lastS = r.p.score; }
      return '<div class="pod' + (pos === 1 ? ' first' : '') + '"><span class="pos">' + pos + '</span>' + imgTag(r.p) + '<span class="n">' + esc(r.i === v.me ? 'Tu' : r.p.name) + '</span><span class="pts">' + r.p.score + '</span></div>';
    }).join('');
    $('#rematchBtn').hidden = !v.amHost;
    $('#ovEnd').hidden = false;
    if (entering) {
      store.del('host'); store.del('client');
      var rec = PR.recordGame(v);
      $('#endStat').textContent = rec ? 'Partita salvata nelle tue statistiche ' + (rec.real ? 'con giocatori reali.' : 'contro i bot.') : '';
      sfx('end');
      var g = gameRect();
      [0, 350, 800, 1300].forEach(function (t, i) { setTimeout(function () { burst(g.width * (0.25 + i * 0.17), g.height * (0.28 + (i % 2) * 0.16), ['#ffe9ad', '#4b9be0', '#e8552f', '#4fb56a'][i], 30); }, t); });
    }
  }

  /* ------------ Effetti ------------ */
  function runEffects(v, prev) {
    if (!prev || prev.phase === 'lobby') {
      if (v.phase === 'deal' && prev) { animateDeal(v, null); showBanner(v); }
      else if (!prev) revealHand();
      return;
    }
    if (v.phase === 'deal' && (prev.phase !== 'deal' || prev.round !== v.round)) { animateDeal(v, prev.dealer); showBanner(v); }
    var justTurn = (v.phase === 'bid' || v.phase === 'play' || v.phase === 'trump') && v.turn === v.me && !(prev.turn === v.me && prev.phase === v.phase && prev.round === v.round);
    if (justTurn) yourTurn();
    /* il foglio delle previsioni passa di mano */
    if (v.phase === 'bid' || (prev.phase === 'bid' && v.phase === 'play')) {
      var from = null;
      if (prev.phase === 'bid' && prev.round === v.round && prev.turn !== v.turn) from = prev.turn;
      if ((prev.phase === 'deal' || prev.phase === 'trump') && v.phase === 'bid') from = v.dealer;
      if (prev.phase === 'bid' && prev.round === v.round) {
        v.players.forEach(function (p, i) { if (p.bid !== null && prev.players[i] && prev.players[i].bid === null) stampSeal(i); });
      }
      if (from !== null && v.phase === 'bid') flyIcon(ICON.scroll, from, v.turn, 520);
    }
    if (v.phase === 'trickEnd' && prev.phase !== 'trickEnd') {
      sfx('win'); flare();
      var el = document.querySelector('.tcard.win');
      if (el) { var g = gameRect(), r = el.getBoundingClientRect(); burst(r.left + r.width / 2 - g.left, r.top + r.height / 2 - g.top, '#ffe9ad', 16); }
    }
  }
  function stampSeal(i) {
    sfx('stamp');
    var el = document.getElementById('seal-' + i);
    if (el) { el.classList.remove('stamp'); void el.offsetWidth; el.classList.add('stamp'); }
  }
  function flyIcon(svg, a, b, dur) {
    if (a === b || a === null || b === null) return;
    var p = anchorOf(a), q = anchorOf(b), el = document.createElement('div');
    el.className = 'flyer'; el.innerHTML = svg;
    $('#fx').appendChild(el);
    var mid = { x: (p.x + q.x) / 2, y: Math.min(p.y, q.y) - 40 };
    el.animate([
      { transform: 'translate(' + (p.x - 17) + 'px,' + (p.y - 17) + 'px) scale(.6) rotate(-10deg)', opacity: 0.2 },
      { transform: 'translate(' + (mid.x - 17) + 'px,' + (mid.y - 17) + 'px) scale(1.15) rotate(8deg)', opacity: 1, offset: 0.5 },
      { transform: 'translate(' + (q.x - 17) + 'px,' + (q.y - 17) + 'px) scale(.8) rotate(0deg)', opacity: 0 }
    ], { duration: dur || 600, easing: 'ease-in-out' }).onfinish = function () { el.remove(); };
  }
  function showBanner(v) {
    var b = $('#banner'), n = v.players.length, nm = function (i) { return i === v.me ? 'tu' : esc(v.players[i].name); };
    var cap = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };
    b.innerHTML = '<h3>Mano ' + v.round + ' di ' + v.totalRounds + '</h3><p>' + v.round + (v.round === 1 ? ' carta' : ' carte') + ' a testa</p><p>Mazziere: <b>' + nm(v.dealer) + '</b></p><p>' + cap(nm((v.dealer + 1) % n)) + ' ' + ((v.dealer + 1) % n === v.me ? 'prevedi' : 'prevede') + ' per primo</p>';
    b.hidden = false; b.classList.remove('show'); void b.offsetWidth; b.classList.add('show');
    clearTimeout(S.bannerT); S.bannerT = setTimeout(function () { b.hidden = true; }, 2900);
  }
  function flare() { var t = $('#rune'); t.classList.remove('flare'); void t.offsetWidth; t.classList.add('flare'); }
  function revealHand() { S.dealing = false; $$('.hcard.undealt').forEach(function (e) { e.classList.remove('undealt'); }); }
  function animateDeal(v, oldDealer) {
    var n = v.players.length, step = E.dealStep(v.round, n), k = 0, fx = $('#fx'), g = gameRect();
    var ds = $('#deckSlot').getBoundingClientRect(), start = { x: ds.left + ds.width / 2 - g.left, y: ds.top + ds.height / 2 - g.top };
    var myIdx = 0, order = S.handOrder.slice();
    $('#trick').innerHTML = '';
    if (oldDealer !== null && oldDealer !== undefined && oldDealer !== v.dealer) flyIcon(ICON.token, oldDealer, v.dealer, 700);
    sfx('shuffle');
    var lead = 900;
    for (var r = 0; r < v.round; r++) for (var q = 1; q <= n; q++) {
      (function (seat, delay) {
        setTimeout(function () {
          if (!S.view) return;
          var el = document.createElement('div');
          el.className = 'ghost-card card'; el.innerHTML = C.back();
          fx.appendChild(el);
          var w = el.offsetWidth, h = el.offsetHeight, a = anchorOf(seat);
          el.animate([
            { transform: 'translate(' + (start.x - w / 2) + 'px,' + (start.y - h / 2) + 'px) rotate(0) scale(.7)' },
            { transform: 'translate(' + (a.x - w / 2) + 'px,' + (a.y - h / 2) + 'px) rotate(' + (seat * 40) + 'deg) scale(.45)' }
          ], { duration: 300, easing: 'ease-out' }).onfinish = function () {
            el.remove();
            if (seat === v.me) {
              var c = handEl(order[myIdx++]);
              if (c) { c.classList.remove('undealt'); c.animate([{ transform: 'translate(' + c._x + 'px,' + (c._y + 40) + 'px) rotateY(90deg)' }, { transform: c.style.transform }], { duration: 240, easing: 'ease-out' }); }
            }
          };
          sfx('deal');
        }, lead + delay);
      })((v.dealer + q) % n, k * step);
      k++;
    }
    setTimeout(revealHand, lead + k * step + 500);
  }
  function burst(x, y, color, n) {
    if (matchMedia('(prefers-reduced-motion:reduce)').matches || !SND.settings().fx) return;
    var fx = $('#fx');
    for (var i = 0; i < n; i++) {
      var s = document.createElement('div');
      s.className = 'spark'; s.style.background = color; s.style.boxShadow = '0 0 8px ' + color;
      fx.appendChild(s);
      var a = Math.random() * Math.PI * 2, d = 50 + Math.random() * 120;
      s.animate([{ transform: 'translate(' + x + 'px,' + y + 'px) scale(1)', opacity: 1 }, { transform: 'translate(' + (x + Math.cos(a) * d) + 'px,' + (y + Math.sin(a) * d + 30) + 'px) scale(.2)', opacity: 0 }], { duration: 560 + Math.random() * 480, easing: 'cubic-bezier(.1,.7,.3,1)' }).onfinish = (function (e) { return function () { e.remove(); }; })(s);
    }
  }
  function wizardFx(el) {
    if (!el.isConnected) return;
    sfx('wizard');
    var g = gameRect(), r = el.getBoundingClientRect(), x = r.left + r.width / 2 - g.left, y = r.top + r.height / 2 - g.top;
    if (SND.settings().fx) {
      var f = document.createElement('div'); f.className = 'flash'; f.style.setProperty('--x', x + 'px'); f.style.setProperty('--y', y + 'px');
      $('#fx').appendChild(f);
      f.animate([{ opacity: 0 }, { opacity: 1, offset: 0.16 }, { opacity: 0 }], { duration: 620 }).onfinish = function () { f.remove(); };
    }
    burst(x, y, '#ffe27a', 18); flare();
  }
  function jesterFx(el) {
    if (!el.isConnected) return;
    sfx('jester');
    var base = el.style.transform;
    el.animate([{ transform: base }, { transform: base + ' rotate(-11deg)' }, { transform: base + ' rotate(9deg)' }, { transform: base + ' rotate(-5deg)' }, { transform: base }], { duration: 560 });
  }
  function yourTurn() { sfx('turn'); SND.vibrate(90); if (document.hidden) flashTitle(); }
  var baseTitle = document.title, titleT = null;
  function flashTitle() {
    clearInterval(titleT);
    var on = false;
    titleT = setInterval(function () { on = !on; document.title = on ? 'Tocca a te!' : baseTitle; if (!document.hidden) { clearInterval(titleT); document.title = baseTitle; } }, 900);
  }
  function showEmote(p, e) {
    if (!S.view) return;
    var a = anchorOf(p), el = document.createElement('div');
    el.className = 'emote'; el.textContent = e;
    $('#bubbles').appendChild(el);
    el.animate([{ transform: 'translate(' + (a.x - 18) + 'px,' + a.y + 'px) scale(.5)', opacity: 0 }, { transform: 'translate(' + (a.x - 18) + 'px,' + (a.y - 30) + 'px) scale(1.25)', opacity: 1, offset: 0.2 }, { transform: 'translate(' + (a.x - 18) + 'px,' + (a.y - 70) + 'px) scale(1)', opacity: 0 }], { duration: 1900, easing: 'ease-out' }).onfinish = function () { el.remove(); };
  }
  function addChat(p, text) {
    var v = S.view; if (!v) return;
    S.chat.push({ p: p, text: text });
    if (S.chat.length > 60) S.chat.shift();
    renderChat();
    if ($('#ovChat').hidden) {
      S.unread++; renderChatPip();
      var b = document.createElement('div'); b.className = 'bubble';
      b.innerHTML = '<b>' + esc(v.players[p].name) + ':</b> ' + esc(text);
      $('#bubbles').appendChild(b);
      setTimeout(function () { b.remove(); }, 4200);
    }
  }
  function renderChat() {
    var v = S.view; if (!v) return;
    var log = $('#chatLog');
    log.innerHTML = S.chat.map(function (m) { return '<div><b>' + esc(v.players[m.p] ? v.players[m.p].name : '') + ':</b> ' + esc(m.text) + '</div>'; }).join('');
    log.scrollTop = log.scrollHeight;
  }
  function renderChatPip() {
    var b = $('#icChat'), p = b.querySelector('.pip');
    if (S.unread && !p) { p = document.createElement('i'); p.className = 'pip'; b.appendChild(p); }
    if (!S.unread && p) p.remove();
  }
  function toast(t, bad) {
    var d = document.createElement('div');
    d.className = 'toast' + (bad ? ' bad' : ''); d.textContent = t;
    $('#toasts').appendChild(d);
    setTimeout(function () { d.remove(); }, bad ? 3400 : 2800);
  }

  /* ------------ Giocare una carta: tocco o trascinamento ------------ */
  var drag = null;
  function canPlay(id) { var v = S.view; return v && v.phase === 'play' && v.turn === v.me && v.legal.indexOf(id) >= 0; }
  function playCard(id) { S.sel = null; send({ t: 'play', c: id }); }
  function explainIllegal() { var v = S.view; if (v && v.lead && v.lead.suit) toast('Devi rispondere a ' + E.SUIT_NAMES[v.lead.suit] + ', oppure giocare un Mago o un Giullare.', true); }
  function shake(el) { el.classList.add('shake'); setTimeout(function () { el.classList.remove('shake'); }, 340); }
  $('#hand').addEventListener('pointerdown', function (e) {
    var el = e.target.closest('.hcard');
    if (!el || el.classList.contains('undealt')) return;
    el.setPointerCapture(e.pointerId);
    drag = { el: el, id: el.dataset.c, sx: e.clientX, sy: e.clientY, moved: false, pid: e.pointerId };
  });
  $('#hand').addEventListener('pointermove', function (e) {
    if (!drag || e.pointerId !== drag.pid) return;
    var dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
    if (!drag.moved && Math.hypot(dx, dy) > 9) { drag.moved = true; drag.el.classList.add('dragging'); }
    if (drag.moved) placeCard(drag.el, dx, dy);
  });
  function endDrag(e) {
    if (!drag || e.pointerId !== drag.pid) return;
    var d = drag; drag = null;
    d.el.classList.remove('dragging');
    var v = S.view, myTurn = v.phase === 'play' && v.turn === v.me;
    if (d.moved) {
      if (e.clientY - d.sy < -d.el.offsetHeight * 0.55 && e.type === 'pointerup') {
        if (canPlay(d.id)) playCard(d.id);
        else { placeCard(d.el); if (myTurn) { shake(d.el); explainIllegal(); } }
      } else placeCard(d.el);
      return;
    }
    if (e.type !== 'pointerup') return;
    if (myTurn && !canPlay(d.id)) { shake(d.el); explainIllegal(); return; }
    if (S.sel === d.id && myTurn) { playCard(d.id); return; }
    S.sel = S.sel === d.id ? null : d.id;
    layoutHand();
    if (S.sel) sfx('select');
  }
  $('#hand').addEventListener('pointerup', endDrag);
  $('#hand').addEventListener('pointercancel', endDrag);

  /* ------------ Registro ------------ */
  function renderSheet() {
    var v = S.view; if (!v || !v.players || !v.round) { $('#scoreWrap').innerHTML = '<p>Il registro si riempie quando inizia la partita.</p>'; return; }
    var head = '<tr><th>Mano</th>' + v.players.map(function (p, i) { return '<th>' + imgTag(p) + esc(i === v.me ? 'Tu' : p.name) + '</th>'; }).join('') + '</tr>', rows = '';
    for (var r = 1; r <= v.totalRounds; r++) {
      var h = v.history[r - 1], cur = !h && r === v.round;
      rows += '<tr' + (cur ? ' class="cur"' : '') + '><th>' + r + '</th>';
      v.players.forEach(function (p, i) {
        if (h) rows += '<td><span class="' + (h.bids[i] === h.won[i] ? 'ok' : 'ko') + '">' + h.totals[i] + '</span><span class="pv">previste ' + h.bids[i] + ', fatte ' + h.won[i] + '</span></td>';
        else if (cur) rows += '<td><span class="pv">' + (p.bid === null ? '–' : 'previste ' + p.bid) + '</span></td>';
        else rows += '<td></td>';
      });
      rows += '</tr>';
    }
    $('#scoreWrap').innerHTML = '<table class="scoregrid"><thead>' + head + '</thead><tbody>' + rows + '</tbody></table>';
  }

  /* ------------ Regolamento e ricerca ------------ */
  function norm(s) { return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
  function hiRegex(terms) {
    var map = { a: '[aàá]', e: '[eèé]', i: '[iìí]', o: '[oòó]', u: '[uùú]' };
    return new RegExp('(' + terms.map(function (t) { return t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/[aeiou]/g, function (c) { return map[c]; }); }).join('|') + ')', 'gi');
  }
  function renderRules(q) {
    var terms = norm(q || '').split(/\s+/).filter(function (t) { return t.length > 1; }), re = terms.length ? hiRegex(terms) : null;
    var hi = function (s) { var e = esc(s); return re ? e.replace(re, '<mark>$1</mark>') : e; }, html = '', found = 0;
    window.RULES.forEach(function (sec) {
      var items = sec.items.filter(function (it) { if (!terms.length) return true; var hay = norm(sec.sec + ' ' + it.t + ' ' + it.a + ' ' + it.k); return terms.every(function (t) { return hay.indexOf(t) >= 0; }); });
      if (!items.length) return;
      found += items.length;
      html += '<section class="rulesec"><h3>' + esc(sec.sec) + '</h3>' + items.map(function (it) {
        var cards = it.cards ? '<div class="rulecards">' + it.cards.map(function (c) { return '<div class="card">' + C.face(c) + '</div>'; }).join('') + '</div>' : '';
        return '<div class="ruleitem"><b>' + hi(it.t) + '</b>' + hi(it.a) + cards + '</div>';
      }).join('') + '</section>';
    });
    $('#ruleList').innerHTML = found ? html : '<p class="empty">Nessuna regola trovata per questa ricerca. Prova con una parola sola, come «giullare» o «punti».</p>';
  }
  var QUICK = ['Giullare', 'Mago', 'Briscola', 'Seguire il colore', 'Punti', 'Mazziere', 'Ultima mano', 'Variante', 'Tempo', 'Connessione', 'Voce'];

  /* ------------ Chat vocale ------------ */
  function renderVoiceIcon() {
    var b = $('#icVoice');
    if (!S.view) return;
    var on = S.voice && S.voice.on;
    b.hidden = S.view.solo;
    b.innerHTML = on && S.voice.muted ? ICON.micoff : ICON.mic;
    b.classList.toggle('on', !!on && !S.voice.muted);
    b.classList.toggle('off', !!on && S.voice.muted);
  }
  function renderVoice() {
    var box = $('#voiceBody'), v = S.view;
    if ($('#ovVoice').hidden || !v) return;
    var vc = S.voice, on = vc && vc.on, me = v.players[v.me], html = '';
    if (S.voiceAskTakeover) html += '<div class="note">' + esc(S.voiceAskTakeover) + ' è già in voce per il luogo ' + me.place + '. Vuoi prendere il suo posto?<div class="row"><button class="btn ink small" data-a="voiceTake">Prendi il suo posto</button><button class="btn ghost small" data-a="voiceCancel">Annulla</button></div></div>';
    if (!on) html += '<p>Entra solo con il dispositivo che deve parlare e ascoltare per il vostro gruppo.</p><button class="btn gold big" data-a="voiceJoin">Entra nella chat vocale</button>';
    else {
      html += '<p>' + (vc.listen ? 'Sei in solo ascolto: il microfono non è disponibile.' : vc.muted ? 'Il microfono è spento: gli altri non ti sentono.' : 'Sei in voce: gli altri ti sentono.') + '</p><div class="row">';
      if (!vc.listen) html += '<button class="btn ' + (vc.muted ? 'gold' : 'ink') + '" data-a="voiceMute">' + (vc.muted ? 'Riaccendi il microfono' : 'Spegni il microfono') + '</button>';
      html += '<button class="btn danger" data-a="voiceLeave">Esci dalla voce</button></div>';
    }
    html += '<h3>Dove ti trovi?</h3><p class="hint">Chi è nello stesso posto sceglie la stessa lettera: un solo dispositivo per luogo può stare in voce, così l\'audio non si accavalla.</p><div class="placepick">' +
      N.PLACES.split('').map(function (l) { return '<button class="' + (me.place === l ? 'sel' : '') + '" data-a="place" data-l="' + l + '" aria-label="Luogo ' + l + '">' + l + '</button>'; }).join('') + '</div>';
    html += '<h3>Al tavolo</h3><ul class="vlist">' + v.players.map(function (p, i) {
      if (p.bot) return '';
      var isMe = i === v.me, st;
      if (!p.connected) st = 'assente'; else if (!p.voice) st = 'non in voce'; else if (p.listen) st = 'in ascolto'; else if (p.muted) st = 'microfono spento'; else st = 'in voce';
      if (p.voice && !isMe && on && vc.peerState(p.peerId) === 'connecting') st = 'mi sto collegando…';
      var mute = '';
      if (p.voice && !isMe && on) mute = '<button class="btn ghost small" data-a="peerMute" data-p="' + esc(p.peerId) + '">' + (vc.volumes[p.peerId] ? 'Riattiva' : 'Silenzia') + '</button>';
      return '<li data-peer="' + esc(p.peerId || '') + '">' + imgTag(p) + '<span class="pn">' + esc(isMe ? 'Tu' : p.name) + '<small>Luogo ' + p.place + ', ' + st + '</small></span>' + mute + '</li>';
    }).join('') + '</ul>';
    box.innerHTML = html;
    applySpeaking(S.speaking);
  }
  function applySpeaking(map) {
    S.speaking = map || {};
    $$('[data-peer]').forEach(function (el) { var id = el.getAttribute('data-peer'); el.classList.toggle('speaking', !!(id && S.speaking[id])); });
  }
  function stopVoiceLocal() { if (S.voice && S.voice.on) S.voice.stop(); else renderVoice(); }
  function voiceJoin(takeover) {
    var vc = S.voice, v = S.view;
    S.voiceAskTakeover = null;
    if (!vc || vc.on) return;
    var me = v.players[v.me];
    if (!takeover) {
      var other = v.players.filter(function (p, i) { return i !== v.me && p.voice && p.place === me.place; })[0];
      if (other) { S.voiceAskTakeover = other.name; renderVoice(); return; }
    }
    var go = function () { vc.on = true; vc.startMeters(); send({ t: 'voice', on: true, muted: false, listen: vc.listen, takeover: !!takeover }); renderVoice(); renderVoiceIcon(); SND.duck(true); };
    vc.acquire().then(go).catch(function (err) {
      if (err && err.name === 'NoSecure') { toast('La voce funziona solo su un sito con indirizzo https.', true); return; }
      vc.silentStream(); toast('Microfono non disponibile: entri in solo ascolto.', true); go();
    });
  }
  setInterval(function () { if (S.voice && S.voice.on && S.view) S.voice.reconcile(S.view.players); }, 4000);

  /* ------------ Profilo e statistiche ------------ */
  function renderProfileChip() {
    var p = PR.get();
    $('#pcAva').src = PR.avatarURL(p.av);
    $('#pcName').textContent = p.name || 'Il tuo profilo';
    var st = PR.stats(), g = st.real.games + st.bots.games;
    $('#pcSub').textContent = g ? g + (g === 1 ? ' partita giocata' : ' partite giocate') + ' · ' + (st.real.wins + st.bots.wins) + ' vinte' : 'Foto, nome e statistiche';
    if (!$('#nameInput').value && p.name) $('#nameInput').value = p.name;
  }
  function pct(a, b) { return b ? Math.round(a / b * 100) + '%' : '–'; }
  function renderProfile() {
    var p = PR.get(), st = PR.stats(), c = st[S.statTab];
    $('#prAva').src = PR.avatarURL(p.av);
    if (document.activeElement !== $('#prName')) $('#prName').value = p.name || '';
    $('#avGrid').innerHTML = PR.PRESETS.map(function (a) { return '<button class="' + (p.av === 'p:' + a[0] ? 'sel' : '') + '" data-a="pickAvatar" data-v="' + a[0] + '" aria-label="' + a[1] + '" title="' + a[1] + '"><img src="art/avatars/' + a[0] + '.webp" alt="" loading="lazy"></button>'; }).join('');
    $('#tabReal').classList.toggle('on', S.statTab === 'real'); $('#tabBots').classList.toggle('on', S.statTab === 'bots');
    $('#tabReal').setAttribute('aria-selected', S.statTab === 'real'); $('#tabBots').setAttribute('aria-selected', S.statTab === 'bots');
    var recent = st.recent.filter(function (r) { return r.real === (S.statTab === 'real'); });
    if (!c.games) { $('#statBody').innerHTML = '<p class="hint">' + (S.statTab === 'real' ? 'Ancora nessuna partita completa con altri giocatori. Le statistiche si aggiornano alla fine di ogni partita.' : 'Ancora nessuna partita completa contro i bot. Prova dalla pagina iniziale con «Prova contro i bot».') + '</p>'; return; }
    var cells = [[c.games, 'partite giocate'], [c.wins, 'vittorie'], [pct(c.wins, c.games), 'partite vinte'], [Math.round(c.points / c.games), 'punti in media'], [c.best, 'punteggio migliore'], [pct(c.exact, c.rounds), 'previsioni esatte'], [c.bestStreak, 'previsioni esatte di fila (record)'], [(c.places / c.games).toFixed(1), 'posizione media']];
    $('#statBody').innerHTML = '<div class="stats">' + cells.map(function (x) { return '<div class="stat"><b>' + x[0] + '</b><span>' + x[1] + '</span></div>'; }).join('') + '</div>' +
      (recent.length ? '<h3 style="margin-top:12px">Ultime partite</h3><ul class="recent">' + recent.slice(0, 6).map(function (r) { var d = new Date(r.at); return '<li><span>' + d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' }) + ' · ' + r.n + ' giocatori</span><span>' + (r.place === 1 ? 'Vinta' : r.place + '° posto') + ', ' + r.score + ' punti</span></li>'; }).join('') + '</ul>' : '');
  }
  function profileChanged() {
    renderProfileChip(); renderProfile();
    var p = PR.get();
    if (S.view) { S.avatars[(S.view.players[S.view.me] || {}).pid] = p.av; send({ t: 'profile', av: p.av, name: p.name }); }
  }

  /* ------------ Impostazioni ------------ */
  function renderSettings() {
    var s = SND.settings();
    $('#setMusic').checked = s.music; $('#setMusicVol').value = s.musicVol; $('#setMusicVol').disabled = !s.music;
    $('#setSfx').checked = s.sfx; $('#setSfxVol').value = s.sfxVol; $('#setSfxVol').disabled = !s.sfx;
    $('#setFx').checked = s.fx; $('#setVib').checked = s.vibrate;
  }

  /* ------------ Schermo sempre acceso durante la partita ------------ */
  var wake = null;
  function requestWake() { if (!navigator.wakeLock || wake) return; navigator.wakeLock.request('screen').then(function (w) { wake = w; w.addEventListener('release', function () { wake = null; }); }).catch(function () {}); }
  function releaseWake() { if (wake) { wake.release().catch(function () {}); wake = null; } }

  /* ------------ Azioni ------------ */
  var TRANSIENT = ['#ovSheet', '#ovRules', '#ovVoice', '#ovChat', '#ovMenu', '#ovSettings', '#ovProfile'];
  function openOverlay(id) { TRANSIENT.forEach(function (s) { if (s !== id) $(s).hidden = true; }); $(id).hidden = false; }
  function closeTransient() { TRANSIENT.forEach(function (s) { $(s).hidden = true; }); }
  function publicBase() {
    var web = /^https?:$/.test(location.protocol) && !/^(localhost|127\.0\.0\.1)$/.test(location.hostname);
    return web ? location.origin + location.pathname : (window.TAVOLO_URL || location.origin + location.pathname);
  }
  function shareLink() { return publicBase() + '?p=' + S.view.code; }
  function copyText(t, ok) {
    var done = function () { toast(ok); }, fail = function () { toast(t); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(done, fail); else fail();
  }

  var ACTIONS = {
    create: function () { createGame(false); },
    solo: function () { var n = $('#nameInput').value.trim() || PR.get().name || 'Apprendista'; PR.save({ name: n }); renderProfileChip(); startSolo(n); },
    rules: function () { $('#ruleSearch').value = ''; renderRules(''); openOverlay('#ovRules'); },
    rulesSearch: function () { $('#ruleSearch').value = ''; renderRules(''); openOverlay('#ovRules'); $('#ruleSearch').focus(); },
    quickRule: function (b) { $('#ruleSearch').value = b.dataset.q; renderRules(b.dataset.q); },
    close: closeTransient,
    copyCode: function () { copyText(S.view.code, 'Codice copiato.'); },
    copyLink: function () { copyText(shareLink(), 'Invito copiato.'); },
    move: function (b) { send({ t: 'move', i: +b.dataset.i, d: +b.dataset.d }); },
    kick: function (b) { send({ t: 'kick', i: +b.dataset.i }); },
    shuffle: function () { send({ t: 'shuffle' }); },
    addBot: function () { send({ t: 'addBot' }); },
    start: function () { send({ t: 'start' }); },
    search: function () { startSearch(); },
    searchNow: function () { if (S.search) S.search.startNow(); },
    searchCancel: function () { if (S.search) S.search.cancel(); S.search = null; ($('#ovSearch').hidden = true); },
    pickBid: function (b) { S.bidPick = +b.dataset.n; renderBidPanel(S.view); sfx('select'); },
    confirmBid: function () { if (S.bidPick !== null) send({ t: 'bid', n: S.bidPick }); },
    pickTrump: function (b) { send({ t: 'trump', s: b.dataset.s }); $('#gems').innerHTML = ''; },
    ready: function () { send({ t: 'ready' }); },
    rematch: function () { send({ t: 'rematch' }); },
    openSheet: function () { renderSheet(); openOverlay('#ovSheet'); },
    toggleStrip: function () { $('#strip').classList.toggle('closed'); },
    openVoice: function () { openOverlay('#ovVoice'); renderVoice(); },
    openChat: function () { S.unread = 0; renderChatPip(); renderChat(); openOverlay('#ovChat'); },
    openMenu: function () { $('#exitConfirm').hidden = true; $('#menuList').hidden = false; $('#menuInvite').hidden = !S.view || S.view.solo; openOverlay('#ovMenu'); },
    openSettings: function () { renderSettings(); openOverlay('#ovSettings'); },
    openProfile: function () { renderProfile(); openOverlay('#ovProfile'); },
    statTab: function (b) { S.statTab = b.dataset.k; renderProfile(); },
    pickAvatar: function (b) { PR.save({ av: 'p:' + b.dataset.v }); profileChanged(); },
    exportProfile: function () { copyText(PR.exportCode(), 'Profilo copiato: incollalo sull\'altro dispositivo.'); },
    importProfile: function () { try { PR.importCode($('#importBox').value); $('#importBox').value = ''; profileChanged(); toast('Profilo caricato.'); } catch (e) { toast(e.message, true); } },
    resetStats: function (b) { if (b.dataset.sure) { PR.resetStats(); delete b.dataset.sure; b.textContent = 'Azzera le statistiche'; renderProfile(); renderProfileChip(); toast('Statistiche azzerate.'); } else { b.dataset.sure = '1'; b.textContent = 'Tocca di nuovo per confermare'; } },
    fullscreen: function () {
      var d = document;
      if (d.fullscreenElement) d.exitFullscreen();
      else if (d.documentElement.requestFullscreen) d.documentElement.requestFullscreen().catch(function () { toast('Schermo intero non disponibile su questo dispositivo.'); });
      else toast('Schermo intero non disponibile su questo dispositivo.');
      closeTransient();
    },
    askExit: function () {
      $('#menuList').hidden = true;
      $('#exitText').textContent = S.core && S.link ? 'Hai creato tu la partita: se esci, finisce per tutti.' : S.core ? 'La partita di prova terminerà.' : 'Potrai rientrare inserendo di nuovo il codice.';
      $('#exitConfirm').hidden = false;
    },
    exitNow: exitNow,
    claim: function (b) { joinGame(b.dataset.code, +b.dataset.i); },
    resumeHost: function () { var s = store.get('host'); if (s) resumeHost(s); },
    resumeClient: function () { var s = store.get('client'); if (s) { $('#nameInput').value = s.name || $('#nameInput').value; joinGame(s.code); } },
    forget: function () { store.del('host'); store.del('client'); renderResumeBox(); },
    voiceJoin: function () { voiceJoin(false); },
    voiceTake: function () { voiceJoin(true); },
    voiceCancel: function () { S.voiceAskTakeover = null; renderVoice(); },
    voiceLeave: function () { S.voice.stop(); send({ t: 'voice', on: false }); renderVoice(); SND.duck(false); },
    voiceMute: function () { S.voice.setMuted(!S.voice.muted); send({ t: 'voice', on: true, muted: S.voice.muted, listen: S.voice.listen, takeover: true }); },
    peerMute: function (b) { var id = b.dataset.p; S.voice.setPeerMuted(id, !S.voice.volumes[id]); renderVoice(); },
    place: function (b) { send({ t: 'place', place: b.dataset.l }); },
    unlockAudio: function () { if (S.voice) Object.keys(S.voice.calls).forEach(function (k) { var a = S.voice.calls[k].audio; if (a) a.play().catch(function () {}); }); $('#audioUnlock').hidden = true; },
    emote: function (b) { send({ t: 'emote', e: b.dataset.e }); closeTransient(); }
  };
  var unlocked = false;
  document.addEventListener('pointerdown', function () { if (!unlocked) { unlocked = true; SND.unlock(); } }, true);
  document.addEventListener('keydown', function () { if (!unlocked) { unlocked = true; SND.unlock(); } }, true);
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-a]');
    if (b && ACTIONS[b.dataset.a] && !b.disabled) { if (b.dataset.a !== 'pickBid') sfx('ui'); ACTIONS[b.dataset.a](b, e); return; }
    if (e.target.classList && e.target.classList.contains('overlay') && TRANSIENT.indexOf('#' + e.target.id) >= 0) closeTransient();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeTransient(); });
  $('#joinForm').addEventListener('submit', function (e) { e.preventDefault(); joinGame($('#codeInput').value); });
  $('#chatForm').addEventListener('submit', function (e) { e.preventDefault(); var i = $('#chatInput'), t = i.value.trim(); if (t) { send({ t: 'chat', text: t }); i.value = ''; } });
  $('#ruleSearch').addEventListener('input', function (e) { renderRules(e.target.value); });
  $('#optPM').addEventListener('change', function (e) { send({ t: 'opt', k: 'plusMinus', v: e.target.checked }); });
  $('#optPlay').addEventListener('change', function (e) { send({ t: 'opt', k: 'playSeconds', v: +e.target.value }); });
  $('#optBid').addEventListener('change', function (e) { send({ t: 'opt', k: 'bidSeconds', v: +e.target.value }); });
  $('#codeInput').addEventListener('input', function (e) { e.target.value = e.target.value.toUpperCase().replace(/[^0-9A-Z]/g, ''); });
  $('#nameInput').addEventListener('change', function (e) { var n = e.target.value.trim(); if (n) { PR.save({ name: n }); renderProfileChip(); } });
  $('#prName').addEventListener('change', function (e) { var n = e.target.value.trim(); if (n) { PR.save({ name: n }); $('#nameInput').value = n; profileChanged(); } });
  $('#prPhoto').addEventListener('change', function (e) {
    var f = e.target.files && e.target.files[0];
    PR.processPhoto(f).then(function (url) { PR.save({ av: url }); profileChanged(); toast('Foto aggiornata.'); }).catch(function (err) { toast(err.message, true); });
    e.target.value = '';
  });
  [['#setMusic', 'music'], ['#setSfx', 'sfx'], ['#setFx', 'fx'], ['#setVib', 'vibrate']].forEach(function (x) { $(x[0]).addEventListener('change', function (e) { SND.set(x[1], e.target.checked); renderSettings(); }); });
  [['#setMusicVol', 'musicVol'], ['#setSfxVol', 'sfxVol']].forEach(function (x) { $(x[0]).addEventListener('input', function (e) { SND.set(x[1], +e.target.value); }); });
  $('#setSfxVol').addEventListener('change', function () { sfx('card'); });

  var rzT = null;
  window.addEventListener('resize', function () {
    clearTimeout(rzT);
    rzT = setTimeout(function () { applyLayoutMode(); if (S.view && S.view.phase !== 'lobby') { renderSeats(S.view); layoutHand(); relayoutTrick(); } }, 90);
  });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) return;
    if (S.link && S.link.checkNow) S.link.checkNow();
    if (S.view && S.view.phase !== 'lobby') requestWake();
  });
  window.addEventListener('beforeunload', function (e) { if (S.core && S.link && S.view && S.view.phase !== 'gameOver' && S.view.phase !== 'lobby') { e.preventDefault(); e.returnValue = ''; } });

  /* ------------ Avvio ------------ */
  function tear(el) {
    var p = [], n = 30, r = function () { return (Math.random() * 6).toFixed(1); }, i;
    for (i = 0; i <= n; i++) p.push((i / n * 100).toFixed(1) + '% ' + r() + 'px');
    for (i = 1; i < n; i++) p.push('calc(100% - ' + r() + 'px) ' + (i / n * 100).toFixed(1) + '%');
    for (i = n; i >= 0; i--) p.push((i / n * 100).toFixed(1) + '% calc(100% - ' + r() + 'px)');
    for (i = n - 1; i > 0; i--) p.push(r() + 'px ' + (i / n * 100).toFixed(1) + '%');
    el.style.clipPath = 'polygon(' + p.join(',') + ')';
  }
  function renderResumeBox() {
    var box = $('#resumeBox'), h = store.get('host'), c = store.get('client'), fresh = function (t) { return t && Date.now() - t < 12 * 3600 * 1000; }, html = '';
    if (!PREVIEW && h && fresh(h.savedAt) && h.g) html = 'Hai una partita in corso (codice ' + esc(h.code) + ').<div class="row"><button class="btn ink small" data-a="resumeHost">Riprendi la partita</button><button class="btn ghost small" data-a="forget">Dimentica</button></div>';
    else if (!PREVIEW && c && fresh(c.at)) html = 'Eri nella partita ' + esc(c.code) + '.<div class="row"><button class="btn ink small" data-a="resumeClient">Rientra</button><button class="btn ghost small" data-a="forget">Dimentica</button></div>';
    box.innerHTML = html; box.hidden = !html;
  }
  function runeSVG() {
    var s = '<svg viewBox="0 0 400 400" fill="none" stroke="currentColor" aria-hidden="true">';
    s += '<circle cx="200" cy="200" r="192" stroke-width="2"/><circle cx="200" cy="200" r="158" stroke-width="1.4"/><circle cx="200" cy="200" r="66" stroke-width="1.2" opacity=".6"/>';
    var glyphs = ['M0-11V11M0-11L8-3M0-2L8 6', 'M-7 11V-11L7 11V-11', 'M-7-11L7 0L-7 11', 'M0-11V11M-7-5L7 5', 'M-7-11V11M-7 0L7-11M-7 0L7 11', 'M-6-11L6 11M6-11L-6 11', 'M0-11L8 0L0 11L-8 0Z', 'M-7 11V-5L0-11L7-5V11', 'M0-11V11M0-11L-8-4M0-11L8-4'];
    for (var i = 0; i < 27; i++) s += '<path transform="rotate(' + (i / 27 * 360) + ' 200 200) translate(200 25)" d="' + glyphs[i % glyphs.length] + '" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>';
    for (var j = 0; j < 8; j++) s += '<path transform="rotate(' + (j * 45) + ' 200 200)" d="M200 42L212 134H188Z" stroke-width="1" opacity=".3"/>';
    return s + '</svg>';
  }
  function boot() {
    $('#rune').innerHTML = runeSVG();
    $$('.torn').forEach(tear);
    $('#icChat').innerHTML = ICON.chat; $('#icSheet').innerHTML = ICON.sheet; $('#icRules').innerHTML = ICON.book; $('#icMenu').innerHTML = ICON.menu; $('#icVoice').innerHTML = ICON.mic;
    var fan = [['W2', -30], ['r13', -15], ['y7', 0], ['b5', 15], ['J4', 30]];
    $('#homeFan').innerHTML = fan.map(function (f, i) { return '<div class="card" style="margin-left:calc(var(--w)/-2);transform:rotate(' + f[1] + 'deg);animation-delay:' + (i * 90) + 'ms">' + C.face(f[0]) + '</div>'; }).join('');
    $('#ruleQuick').innerHTML = QUICK.map(function (q) { return '<button data-a="quickRule" data-q="' + q + '">' + q + '</button>'; }).join('');
    $('#emotes').innerHTML = ['😂', '😱', '🔥', '👏', '🧙', '🤡', '😈', '🙏'].map(function (e) { return '<button data-a="emote" data-e="' + e + '" aria-label="Reazione ' + e + '">' + e + '</button>'; }).join('');
    if (PREVIEW) { $('#previewNote').hidden = false; $('#createBtn').hidden = true; $('#joinForm').hidden = true; $('#orLine').hidden = true; }
    var legacy = store.get('name'); if (legacy && !PR.get().name) PR.save({ name: legacy });
    renderProfileChip();
    var m = /[?&]p=([0-9A-Za-z]{5})/.exec(location.search);
    if (m) $('#codeInput').value = m[1].toUpperCase();
    renderResumeBox();
    applyLayoutMode();
    if ('serviceWorker' in navigator && location.protocol === 'https:' && location.hostname !== 'localhost' && !window.Capacitor && !PREVIEW) navigator.serviceWorker.register('sw.js').catch(function () {});
  }
  boot();
})();
