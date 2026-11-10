/* Regia della partita (host), collegamento tra dispositivi e chat vocale. */
(function (root) {
  'use strict';
  var E = root.Engine;

  var PREFIX = 'tavolo-maghi-v1-';
  var CODE_CHARS = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  var BOT_NAMES = ['Merlino', 'Morgana', 'Circe', 'Prospero', 'Nimue', 'Medea', 'Faust', 'Viviana'];
  var BOT_AV = ['p:mago-fuoco', 'p:maga-luce', 'p:alchimista', 'p:giullare', 'p:re', 'p:regina', 'p:bardo', 'p:cacciatrice'];
  function cleanAv(av) {
    av = String(av || '');
    if (/^p:[a-z-]{2,20}$/.test(av)) return av;
    if (/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(av) && av.length < 60000) return av;
    return 'p:monella';
  }
  function makePid() { return 'u' + Math.random().toString(36).slice(2, 9); }
  var HUES = ['#d4a02c', '#c5432f', '#2f8f57', '#2f76c5', '#8a56c2', '#cf6f9b'];
  var PLACES = 'ABCDEF';
  var GRACE = 30000;

  function makeCode() {
    var s = '';
    for (var i = 0; i < 5; i++) s += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
    return s;
  }
  function makeToken() {
    return 't' + Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
  function cleanName(n) {
    return String(n || '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 14) || 'Apprendista';
  }

  /* ------------------------------------------------------------------ */
  /* HostCore: tiene lo stato vero della partita e decide tutto.          */
  /* ------------------------------------------------------------------ */
  function HostCore(cfg) {
    this.code = cfg.code;
    this.out = cfg.out;           /* out(token, msg) */
    this.persist = cfg.persist || function () {};
    this.rng = cfg.rng || Math.random;
    this.solo = !!cfg.solo;
    this.players = [];
    this.g = null;
    this.opts = { plusMinus: false, bidSeconds: 60, playSeconds: 30, firstDealer: 0 };
    this.avSig = '';
    this.hostToken = cfg.token;
    this.key = null; this.deadline = null; this.total = 0;
    this.t1 = null; this.t2 = null;
    this.seq = 0;
  }
  var H = HostCore.prototype;

  H.seatOf = function (token) {
    for (var i = 0; i < this.players.length; i++) if (this.players[i].token === token) return i;
    return -1;
  };

  H.addPlayer = function (name, token, peerId, bot, av) {
    var taken = this.players.map(function (p) { return p.name.toLowerCase(); });
    var base = cleanName(name), nm = base, k = 2;
    while (taken.indexOf(nm.toLowerCase()) >= 0) { nm = base.slice(0, 12) + ' ' + k; k++; }
    var used = this.players.map(function (p) { return p.place; });
    var place = PLACES.split('').filter(function (l) { return used.indexOf(l) < 0; })[0] || 'A';
    var usedHue = this.players.map(function (p) { return p.hue; });
    var hue = HUES.filter(function (h) { return usedHue.indexOf(h) < 0; })[0] || HUES[0];
    if (bot && !av) {
      var usedAv = this.players.map(function (x) { return x.av; });
      av = BOT_AV.filter(function (a) { return usedAv.indexOf(a) < 0; })[0] || BOT_AV[0];
    }
    var p = { token: token, name: nm, hue: hue, peerId: peerId || null, connected: true, bot: !!bot, pid: makePid(), av: cleanAv(av), avv: 1,
      place: place, voice: false, muted: false, listen: false, ready: false, lostAt: 0 };
    this.players.push(p);
    return p;
  };

  /* Un dispositivo chiede di entrare o rientrare. reply(msg) risponde solo a lui. */
  H.join = function (msg, reply) {
    var token = msg.token, seat = this.seatOf(token), self = this;
    if (seat >= 0) {
      var p = this.players[seat];
      p.connected = true; p.lostAt = 0; p.peerId = msg.peerId || p.peerId;
      if (msg.av) { var na = cleanAv(msg.av); if (na !== p.av) { p.av = na; p.avv++; } }
      p.voice = false; p.muted = false; p.listen = false;
      this.after();
      return token;
    }
    if (this.g) {
      if (typeof msg.claim === 'number' && this.players[msg.claim] && !this.players[msg.claim].connected && !this.players[msg.claim].bot) {
        var q = this.players[msg.claim];
        q.token = token; q.peerId = msg.peerId; q.connected = true; q.lostAt = 0;
        if (msg.av) { q.av = cleanAv(msg.av); q.avv++; }
        this.after();
        return token;
      }
      var free = [];
      this.players.forEach(function (pl, i) { if (!pl.connected && !pl.bot) free.push({ i: i, name: pl.name }); });
      reply({ t: 'reject', why: free.length ? 'seats' : 'started', seats: free });
      return null;
    }
    if (this.players.length >= 6) { reply({ t: 'reject', why: 'full' }); return null; }
    this.addPlayer(msg.name, token, msg.peerId, false, msg.av);
    self.after();
    return token;
  };

  H.lost = function (token) {
    var s = this.seatOf(token);
    if (s < 0) return;
    var p = this.players[s];
    p.voice = false; p.muted = false; p.listen = false;
    if (!this.g) {
      /* In sala d'attesa chi esce libera il posto (l'host resta sempre). */
      if (token !== this.hostToken) this.players.splice(s, 1);
      this.after();
      return;
    }
    p.connected = false; p.lostAt = Date.now();
    this.after();
  };

  H.isHost = function (token) { return token === this.hostToken; };

  H.onMessage = function (token, m) {
    var seat = this.seatOf(token);
    if (seat < 0 || !m) return;
    var g = this.g, p = this.players[seat], r;
    switch (m.t) {
      case 'bid':
        if (!g) return;
        r = E.applyBid(g, seat, m.n);
        if (!r.ok) return this.out(token, { t: 'toast', text: r.why, bad: true });
        return this.after();
      case 'trump':
        if (!g) return;
        r = E.applyTrump(g, seat, m.s);
        if (!r.ok) return this.out(token, { t: 'toast', text: r.why, bad: true });
        return this.after();
      case 'play':
        if (!g) return;
        r = E.applyPlay(g, seat, m.c);
        if (!r.ok) return this.out(token, { t: 'toast', text: r.why, bad: true });
        return this.after();
      case 'ready':
        if (!g || g.phase !== 'roundEnd') return;
        p.ready = true;
        if (this.players.every(function (x) { return x.bot || !x.connected || x.ready; })) return this.advanceRound();
        return this.after();
      case 'emote':
        return this.broadcastRaw({ t: 'emote', p: seat, e: String(m.e).slice(0, 8) });
      case 'chat':
        var text = String(m.text || '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, 240);
        if (text) this.broadcastRaw({ t: 'chat', p: seat, text: text });
        return;
      case 'place':
        if (PLACES.indexOf(m.place) < 0) return;
        p.place = m.place;
        if (p.voice && this.voiceOwner(p.place, token)) {
          p.voice = false; p.muted = false; p.listen = false;
          this.out(token, { t: 'voiceOff', by: this.voiceOwner(p.place, token).name });
        }
        return this.after();
      case 'voice':
        return this.onVoice(token, p, m);
      case 'profile':
        if (m.av) { var na = cleanAv(m.av); if (na !== p.av) { p.av = na; p.avv++; } }
        if (m.name && !this.g) {
          var nn = cleanName(m.name), clash = this.players.some(function (x) { return x !== p && x.name.toLowerCase() === nn.toLowerCase(); });
          if (!clash) p.name = nn;
        }
        return this.after();
    }
    if (!this.isHost(token)) return;
    /* Comandi riservati a chi ha creato la partita */
    switch (m.t) {
      case 'opt':
        if (this.g) return;
        if (m.k === 'plusMinus') this.opts.plusMinus = !!m.v;
        if (m.k === 'playSeconds' && [0, 15, 30, 60, 120].indexOf(m.v) >= 0) this.opts.playSeconds = m.v;
        if (m.k === 'bidSeconds' && [0, 30, 60, 90, 120, 180].indexOf(m.v) >= 0) this.opts.bidSeconds = m.v;
        return this.after();
      case 'move':
        if (this.g) return;
        var j = m.i + m.d;
        if (j < 0 || j >= this.players.length || !this.players[m.i]) return;
        var tmp = this.players[m.i]; this.players[m.i] = this.players[j]; this.players[j] = tmp;
        return this.after();
      case 'shuffle':
        if (this.g) return;
        E.shuffle(this.players, this.rng);
        return this.after();
      case 'addBot':
        if (this.g || this.players.length >= 6) return;
        var names = this.players.map(function (x) { return x.name; });
        var nm = BOT_NAMES.filter(function (b) { return names.indexOf(b) < 0; })[0];
        this.addPlayer(nm, 'bot' + makeToken(), null, true);
        return this.after();
      case 'kick':
        if (this.g || !this.players[m.i] || this.players[m.i].token === this.hostToken) return;
        var out = this.players[m.i];
        this.players.splice(m.i, 1);
        if (!out.bot) this.out(out.token, { t: 'kicked' });
        return this.after();
      case 'start':
        return this.start();
      case 'rematch':
        if (!this.g || this.g.phase !== 'gameOver') return;
        this.g = null;
        this.players.forEach(function (x) { x.ready = false; });
        this.key = null;
        return this.after();
    }
  };

  H.voiceOwner = function (place, exceptToken) {
    for (var i = 0; i < this.players.length; i++) {
      var p = this.players[i];
      if (p.voice && p.place === place && p.token !== exceptToken) return p;
    }
    return null;
  };

  H.onVoice = function (token, p, m) {
    if (m.on) {
      var other = this.voiceOwner(p.place, token);
      if (other && !m.takeover) { this.out(token, { t: 'voiceBusy', name: other.name }); return; }
      if (other) {
        other.voice = false; other.muted = false; other.listen = false;
        this.out(other.token, { t: 'voiceOff', by: p.name });
      }
      p.voice = true;
      p.muted = !!m.muted;
      p.listen = !!m.listen;
    } else {
      p.voice = false; p.muted = false; p.listen = false;
    }
    this.after();
  };

  H.start = function () {
    if (this.g || this.players.length < 3) return;
    this.g = E.newGame(this.players.length, { plusMinus: this.opts.plusMinus, firstDealer: 0 });
    this.g.id = this.code + '-' + Date.now().toString(36);
    this.players.forEach(function (p) { p.ready = false; });
    E.startRound(this.g, this.rng);
    this.after();
  };

  H.advanceRound = function () {
    var g = this.g;
    if (!g || g.phase !== 'roundEnd') return;
    this.players.forEach(function (p) { p.ready = false; });
    E.nextRound(g, this.rng);
    this.after();
  };

  H.after = function () {
    this.schedule();
    this.sendAvatars();
    this.broadcast();
    this.save();
  };

  H.schedule = function () {
    clearTimeout(this.t1); clearTimeout(this.t2);
    var g = this.g, self = this;
    if (!g || g.phase === 'gameOver') { this.deadline = null; this.total = 0; this.key = null; return; }
    var now = Date.now();
    var key = [g.phase, g.round, g.turn, g.trick.length].join('|');
    if (key !== this.key) {
      this.key = key;
      var limit = 0;
      if (g.phase === 'deal') limit = E.dealDuration(g.round, g.n);
      else if (g.phase === 'trump') limit = 60000;
      else if (g.phase === 'bid') limit = this.opts.bidSeconds * 1000;
      else if (g.phase === 'play') limit = this.opts.playSeconds * 1000;
      else if (g.phase === 'trickEnd') limit = 2500;
      else if (g.phase === 'roundEnd') limit = 60000;
      this.total = limit;
      this.deadline = limit ? now + limit : null;
    }
    if (this.deadline) {
      this.t1 = setTimeout(function () { self.onDeadline(); }, Math.max(0, this.deadline - now));
    }
    if (g.phase === 'trump' || g.phase === 'bid' || g.phase === 'play') {
      var p = this.players[g.turn], delay = null;
      if (p.bot) delay = 900 + this.rng() * 900;
      else if (!p.connected) delay = Math.max(4000, (p.lostAt || now) + GRACE - now);
      if (delay !== null) this.t2 = setTimeout(function () { self.autoAct(false); }, delay);
    }
  };

  H.onDeadline = function () {
    var g = this.g;
    if (!g) return;
    if (g.phase === 'deal') { E.finishDeal(g); return this.after(); }
    if (g.phase === 'trickEnd') { E.collectTrick(g); return this.after(); }
    if (g.phase === 'roundEnd') return this.advanceRound();
    this.autoAct(true);
  };

  /* Scelta automatica per bot, tempo scaduto o giocatore assente. */
  H.autoAct = function (expired) {
    var g = this.g;
    if (!g) return;
    var seat = g.turn, p = this.players[seat], what = '';
    if (g.phase === 'trump') { E.applyTrump(g, seat, E.autoTrump(g, seat)); what = 'la briscola'; }
    else if (g.phase === 'bid') { E.applyBid(g, seat, E.autoBid(g, seat)); what = 'la previsione'; }
    else if (g.phase === 'play') { E.applyPlay(g, seat, E.autoPlay(g, seat)); what = 'la carta'; }
    else return;
    if (!p.bot) {
      this.broadcastRaw({ t: 'toast', text: (expired ? 'Tempo scaduto: ' : p.name + ' è assente: ') + what + (expired ? ' di ' + p.name : '') + ' è stata scelta in automatico.' });
    }
    this.after();
  };

  /* Le foto profilo viaggiano a parte, solo quando cambiano: lo stato resta leggero */
  H.sendAvatars = function (force) {
    var sig = this.players.map(function (p) { return p.pid + ':' + p.avv; }).join('|');
    if (sig === this.avSig && !force) return;
    this.avSig = sig;
    var map = {};
    this.players.forEach(function (p) { map[p.pid] = p.av; });
    this.broadcastRaw({ t: 'avatars', map: map });
  };

  H.viewFor = function (seat) {
    var g = this.g, self = this;
    var v = {
      t: 'state', code: this.code, seq: ++this.seq, phase: g ? g.phase : 'lobby', me: seat,
      amHost: this.players[seat] && this.players[seat].token === this.hostToken, solo: this.solo,
      opts: this.opts,
      players: this.players.map(function (p, i) {
        return { name: p.name, hue: p.hue, connected: p.connected, bot: p.bot, place: p.place, voice: p.voice, pid: p.pid, avv: p.avv,
          muted: p.muted, listen: p.listen, peerId: p.peerId, ready: p.ready,
          isHost: p.token === self.hostToken,
          cards: g ? g.hands[i].length : 0, bid: g ? g.bids[i] : null, won: g ? g.won[i] : 0, score: g ? g.scores[i] : 0 };
      })
    };
    if (g) {
      v.round = g.round; v.totalRounds = g.totalRounds; v.dealer = g.dealer; v.turn = g.turn;
      v.trumpCard = g.trumpCard; v.trumpSuit = g.trumpSuit; v.trumpChosen = g.trumpChosen; v.deckLeft = g.deckLeft;
      v.hand = g.hands[seat].slice();
      v.trick = g.trick; v.trickWinner = g.trickWinner; v.leader = g.leader;
      v.legal = g.phase === 'play' && g.turn === seat ? E.legalCards(g, seat) : [];
      v.lead = E.leadInfo(g.trick);
      v.forbidden = g.phase === 'bid' && g.turn === seat ? E.forbiddenBid(g) : null;
      v.bidSum = E.bidsSum(g);
      v.history = g.history;
      v.plusMinus = g.plusMinus;
      v.gameId = g.id;
      if (g.phase === 'gameOver') v.winners = E.winners(g);
    }
    v.timeLeft = this.deadline ? Math.max(0, this.deadline - Date.now()) : null;
    v.timeTotal = this.total;
    return v;
  };

  H.broadcast = function () {
    var self = this;
    this.players.forEach(function (p, i) {
      if (!p.bot && p.connected) self.out(p.token, self.viewFor(i));
    });
  };
  H.broadcastRaw = function (m) {
    var self = this;
    this.players.forEach(function (p) { if (!p.bot && p.connected) self.out(p.token, m); });
  };

  H.save = function () {
    if (this.solo) return;
    if (this.g && this.g.phase === 'gameOver') { this.persist(null); return; }
    this.persist({
      code: this.code, g: this.g, opts: this.opts, hostToken: this.hostToken, key: null, savedAt: Date.now(),
      players: this.players.map(function (p) {
        return { token: p.token, name: p.name, hue: p.hue, peerId: null, connected: p.bot, bot: p.bot, place: p.place, pid: p.pid, av: p.av, avv: p.avv,
          voice: false, muted: false, listen: false, ready: p.ready, lostAt: p.bot ? 0 : Date.now() };
      })
    });
  };

  H.restore = function (s) {
    this.g = s.g; this.opts = s.opts; this.players = s.players; this.hostToken = s.hostToken;
    this.players.forEach(function (p) { if (!p.pid) p.pid = makePid(); if (!p.av) p.av = 'p:monella'; p.avv = (p.avv || 1) + 1; });
  };

  /* ------------------------------------------------------------------ */
  /* Libreria di collegamento                                            */
  /* ------------------------------------------------------------------ */
  var PEER_URLS = [
    'vendor/peerjs.min.js',
    'https://cdn.jsdelivr.net/npm/peerjs@1.5.5/dist/peerjs.min.js',
    'https://unpkg.com/peerjs@1.5.5/dist/peerjs.min.js'
  ];
  var peerLibPromise = null;
  function loadPeerLib() {
    if (root.Peer) return Promise.resolve();
    if (peerLibPromise) return peerLibPromise;
    peerLibPromise = new Promise(function (res, rej) {
      var i = 0;
      (function next() {
        if (i >= PEER_URLS.length) { peerLibPromise = null; rej({ type: 'lib' }); return; }
        var s = document.createElement('script');
        s.src = PEER_URLS[i++];
        s.onload = function () { res(); };
        s.onerror = function () { s.remove(); next(); };
        document.head.appendChild(s);
      })();
    });
    return peerLibPromise;
  }

  var PEER_OPTS = {
    debug: 1,
    config: {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun.cloudflare.com:3478' },
        { urls: ['turn:eu-0.turn.peerjs.com:3478', 'turn:us-0.turn.peerjs.com:3478'], username: 'peerjs', credential: 'peerjsp' }
      ],
      sdpSemantics: 'unified-plan'
    }
  };

  /* Lato host: accetta i dispositivi e li collega a HostCore. */
  function HostLink(code, core, onCall, onStatus) {
    this.code = code; this.core = core; this.onCall = onCall; this.onStatus = onStatus || function () {};
    this.peer = null; this.byToken = {}; this.conns = [];
    this.hb = null;
  }
  HostLink.prototype.open = function (isResume) {
    var self = this;
    return loadPeerLib().then(function () {
      return new Promise(function (res, rej) {
        var attempts = 0;
        (function tryOpen() {
          var p = new root.Peer(PREFIX + self.code.toLowerCase(), PEER_OPTS);
          var opened = false;
          p.on('open', function () { opened = true; self.peer = p; self.startHeartbeat(); res(p); });
          p.on('connection', function (c) { self.adopt(c); });
          p.on('call', function (c) { self.onCall(c); });
          p.on('disconnected', function () {
            if (p.destroyed) return;
            setTimeout(function () { if (!p.destroyed && p.disconnected) { try { p.reconnect(); } catch (e) {} } }, 2000);
          });
          p.on('error', function (e) {
            if (!opened && e.type === 'unavailable-id') {
              p.destroy();
              if (isResume && attempts++ < 30) { setTimeout(tryOpen, 3000); return; }
              rej(e);
            } else if (!opened) { p.destroy(); rej(e); }
            else if (e.type !== 'peer-unavailable') { self.onStatus('warn', e.type); }
          });
        })();
      });
    });
  };
  HostLink.prototype.adopt = function (c) {
    var self = this, token = null;
    c.lastSeen = Date.now();
    this.conns.push(c);
    c.on('data', function (m) {
      c.lastSeen = Date.now();
      if (!m || m.t === 'pong') return;
      if (m.t === 'join') {
        var prev = self.byToken[m.token];
        if (prev && prev !== c) { prev.replaced = true; try { prev.close(); } catch (e) {} }
        var got = self.core.join(m, function (r) { try { c.send(r); } catch (e) {} });
        if (got) { token = got; c.token = got; self.byToken[got] = c; self.core.avSig = ''; self.core.after(); }
        return;
      }
      if (token) self.core.onMessage(token, m);
    });
    function gone() {
      self.conns = self.conns.filter(function (x) { return x !== c; });
      if (c.replaced || !token || self.byToken[token] !== c) return;
      delete self.byToken[token];
      self.core.lost(token);
    }
    c.on('close', gone);
    c.on('error', function () {});
    c.drop = gone;
  };
  HostLink.prototype.startHeartbeat = function () {
    var self = this;
    clearInterval(this.hb);
    this.hb = setInterval(function () {
      var now = Date.now();
      /* Se si perde il contatto con il servizio di collegamento, chi vuole entrare non troverebbe il tavolo */
      if (self.peer && !self.peer.destroyed && self.peer.disconnected) { try { self.peer.reconnect(); } catch (e) {} }
      self.conns.slice().forEach(function (c) {
        if (now - c.lastSeen > 14000) { try { c.close(); } catch (e) {} c.drop(); return; }
        try { if (c.open) c.send({ t: 'ping' }); } catch (e) {}
      });
    }, 3000);
  };
  HostLink.prototype.send = function (token, m) {
    var c = this.byToken[token];
    if (c && c.open) { try { c.send(m); } catch (e) {} }
  };
  HostLink.prototype.close = function () {
    clearInterval(this.hb);
    if (this.peer) this.peer.destroy();
  };

  /* Lato giocatore: entra con il codice e si ricollega da solo. */
  function ClientLink(code, joinMsg, handlers) {
    this.code = code; this.joinMsg = joinMsg; this.h = handlers;
    this.peer = null; this.conn = null; this.closed = false; this.online = false; this.lastSeen = 0;
    this.everJoined = false; this.loop = false; this.wd = null;
  }
  var C = ClientLink.prototype;
  C.hostId = function () { return PREFIX + this.code.toLowerCase(); };
  C.makePeer = function () {
    var self = this;
    return loadPeerLib().then(function () {
      return new Promise(function (res, rej) {
        var p = new root.Peer(PEER_OPTS), opened = false;
        p.on('open', function (id) { opened = true; self.peer = p; self.joinMsg.peerId = id; res(p); });
        p.on('call', function (c) { self.h.onCall(c); });
        p.on('disconnected', function () {
          if (p.destroyed || self.closed) return;
          setTimeout(function () { if (!p.destroyed && p.disconnected) { try { p.reconnect(); } catch (e) {} } }, 1500);
        });
        p.on('error', function (e) {
          if (!opened) { p.destroy(); rej(e); return; }
          if (e.type === 'peer-unavailable' && self.pendingReject) { var r = self.pendingReject; self.pendingReject = null; r(e); }
        });
      });
    });
  };
  C.openConn = function () {
    var self = this;
    return new Promise(function (res, rej) {
      var c = self.peer.connect(self.hostId(), { reliable: true, serialization: 'json' });
      var settled = false;
      function fail(e) { if (settled) return; settled = true; self.pendingReject = null; clearTimeout(to); try { c.close(); } catch (x) {} rej(e); }
      var to = setTimeout(function () { fail({ type: 'timeout' }); }, 14000);
      self.pendingReject = fail;
      c.on('open', function () {
        if (settled) return;
        settled = true; self.pendingReject = null; clearTimeout(to);
        self.conn = c; self.lastSeen = Date.now(); self.online = true;
        c.send(self.joinMsg);
        self.startWatchdog();
        res();
      });
      c.on('data', function (m) {
        if (c !== self.conn) return;
        self.lastSeen = Date.now();
        if (m.t === 'ping') { try { c.send({ t: 'pong' }); } catch (e) {} return; }
        self.h.onMessage(m);
      });
      c.on('close', function () { if (c === self.conn) self.onDrop(); });
      c.on('error', function () {});
    });
  };
  C.start = function () {
    var self = this;
    return this.makePeer().then(function () { return self.openConn(); });
  };
  C.startWatchdog = function () {
    var self = this;
    clearInterval(this.wd);
    this.wd = setInterval(function () {
      if (self.online && Date.now() - self.lastSeen > 12000) self.onDrop();
    }, 2000);
  };
  C.checkNow = function () { if (this.online && Date.now() - this.lastSeen > 8000) this.onDrop(); };
  C.onDrop = function () {
    if (this.closed || !this.online) return;
    this.online = false; this.conn = null;
    clearInterval(this.wd);
    this.h.onStatus('lost');
    this.reconnect();
  };
  C.reconnect = function () {
    if (this.loop || this.closed) return;
    this.loop = true;
    var self = this, attempt = 0;
    (function step() {
      if (self.closed) { self.loop = false; return; }
      var ready = self.peer && !self.peer.destroyed && !self.peer.disconnected ? Promise.resolve()
        : (self.peer && !self.peer.destroyed ? (self.peer.destroy(), self.makePeer()) : self.makePeer());
      ready.then(function () { return self.openConn(); }).then(function () {
        self.loop = false;
        self.h.onStatus('online');
      }).catch(function () {
        attempt++;
        self.h.onStatus('retry', attempt);
        setTimeout(step, Math.min(1500 + attempt * 700, 5000));
      });
    })();
  };
  C.send = function (m) {
    if (this.conn && this.conn.open) { try { this.conn.send(m); return true; } catch (e) {} }
    return false;
  };
  C.close = function () {
    this.closed = true; clearInterval(this.wd);
    if (this.peer) this.peer.destroy();
  };

  /* ------------------------------------------------------------------ */
  /* Chat vocale: ogni dispositivo in voce parla direttamente agli altri. */
  /* ------------------------------------------------------------------ */
  function Voice(api) {
    this.api = api;           /* {getPeer, myPeerId, audioCtx, onSpeaking, onChange, onBlocked} */
    this.stream = null; this.on = false; this.muted = false; this.listen = false;
    this.calls = {};          /* peerId -> {call, audio, stream, analyser, retryAt} */
    this.volumes = {};        /* peerId -> muted */
    this.meter = null; this.localAnalyser = null;
  }
  var V = Voice.prototype;

  V.acquire = function () {
    var self = this;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return Promise.reject({ name: 'NoSecure' });
    }
    return navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }, video: false
    }).then(function (s) { self.stream = s; self.listen = false; return s; });
  };

  /* Traccia muta per chi ascolta soltanto (microfono negato o assente). */
  V.silentStream = function () {
    var ctx = this.api.audioCtx();
    var dest = ctx.createMediaStreamDestination();
    var osc = ctx.createConstantSource ? ctx.createConstantSource() : ctx.createOscillator();
    var g = ctx.createGain(); g.gain.value = 0;
    osc.connect(g); g.connect(dest); osc.start();
    this.stream = dest.stream; this.listen = true;
    return dest.stream;
  };

  V.startMeters = function () {
    var self = this, ctx = this.api.audioCtx();
    if (!this.listen && this.stream) {
      try {
        var src = ctx.createMediaStreamSource(this.stream);
        this.localAnalyser = ctx.createAnalyser(); this.localAnalyser.fftSize = 512;
        src.connect(this.localAnalyser);
      } catch (e) { this.localAnalyser = null; }
    }
    clearInterval(this.meter);
    this.meter = setInterval(function () {
      var map = {};
      if (self.localAnalyser && !self.muted) map[self.api.myPeerId()] = level(self.localAnalyser) > 0.035;
      Object.keys(self.calls).forEach(function (id) {
        var c = self.calls[id];
        if (c.analyser) map[id] = level(c.analyser) > 0.035;
      });
      self.api.onSpeaking(map);
    }, 140);
  };
  function level(an) {
    var d = new Uint8Array(an.fftSize);
    an.getByteTimeDomainData(d);
    var s = 0;
    for (var i = 0; i < d.length; i++) { var x = (d[i] - 128) / 128; s += x * x; }
    return Math.sqrt(s / d.length);
  }

  V.stop = function () {
    var self = this;
    this.on = false;
    Object.keys(this.calls).forEach(function (id) { self.drop(id); });
    if (this.stream) this.stream.getTracks().forEach(function (t) { t.stop(); });
    this.stream = null; this.localAnalyser = null; this.muted = false; this.listen = false;
    clearInterval(this.meter);
    this.api.onSpeaking({});
    this.api.onChange();
  };

  V.setMuted = function (b) {
    this.muted = b;
    if (this.stream && !this.listen) this.stream.getAudioTracks().forEach(function (t) { t.enabled = !b; });
    this.api.onChange();
  };

  V.setPeerMuted = function (id, b) {
    this.volumes[id] = b;
    if (this.calls[id] && this.calls[id].audio) this.calls[id].audio.muted = b;
  };

  V.drop = function (id) {
    var c = this.calls[id];
    if (!c) return;
    delete this.calls[id];
    try { c.call.close(); } catch (e) {}
    if (c.audio) { c.audio.srcObject = null; c.audio.remove(); }
    this.api.onChange();
  };

  V.attach = function (id, call) {
    var self = this;
    var entry = { call: call, audio: null, stream: null, analyser: null, state: 'connecting', at: Date.now() };
    this.calls[id] = entry;
    call.on('stream', function (remote) {
      if (self.calls[id] !== entry || entry.stream === remote) return;
      entry.stream = remote;
      entry.state = 'live';
      var a = document.createElement('audio');
      a.autoplay = true; a.setAttribute('playsinline', ''); a.srcObject = remote;
      a.muted = !!self.volumes[id];
      a.style.display = 'none';
      document.body.appendChild(a);
      entry.audio = a;
      var p = a.play();
      if (p && p.catch) p.catch(function () { self.api.onBlocked(); });
      try {
        var ctx = self.api.audioCtx();
        var src = ctx.createMediaStreamSource(remote);
        entry.analyser = ctx.createAnalyser(); entry.analyser.fftSize = 512;
        src.connect(entry.analyser);
      } catch (e) {}
      self.api.onChange();
    });
    function ended() {
      if (self.calls[id] === entry) { self.drop(id); self.retry[id] = Date.now() + 4000; }
    }
    call.on('close', ended);
    call.on('error', ended);
    this.api.onChange();
  };
  V.retry = {};

  V.incoming = function (call) {
    if (!this.on || !this.stream) { try { call.close(); } catch (e) {} return; }
    var id = call.peer;
    if (this.calls[id]) this.drop(id);
    call.answer(this.stream);
    this.attach(id, call);
  };

  /* Allinea le chiamate con chi risulta in voce nello stato di gioco. */
  V.reconcile = function (players) {
    if (!this.on || !this.stream) return;
    var me = this.api.myPeerId(), self = this, peer = this.api.getPeer();
    if (!me || !peer) return;
    var want = {};
    players.forEach(function (p) { if (p.voice && p.peerId && p.peerId !== me) want[p.peerId] = true; });
    Object.keys(this.calls).forEach(function (id) {
      var c = self.calls[id];
      if (!want[id] || (c.state === 'connecting' && Date.now() - c.at > 15000)) self.drop(id);
    });
    Object.keys(want).forEach(function (id) {
      if (self.calls[id]) return;
      if (me > id) return; /* chiama sempre chi ha l'identificativo minore: niente doppie chiamate */
      if (self.retry[id] && Date.now() < self.retry[id]) return;
      self.retry[id] = Date.now() + 5000;
      var call = peer.call(id, self.stream);
      if (call) self.attach(id, call);
    });
  };

  V.peerState = function (id) { return this.calls[id] ? this.calls[id].state : null; };

  root.Net = {
    makeCode: makeCode, makeToken: makeToken, cleanName: cleanName, HostCore: HostCore, HostLink: HostLink,
    ClientLink: ClientLink, Voice: Voice, loadPeerLib: loadPeerLib, PREFIX: PREFIX, PLACES: PLACES, HUES: HUES, PEER_OPTS: PEER_OPTS
  };
})(typeof self !== 'undefined' ? self : this);
