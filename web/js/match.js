/* Ricerca globale: fa incontrare chi sta cercando una partita nello stesso momento.
   Non serve un server nostro. Il servizio di collegamento accetta un solo dispositivo per ogni nome,
   quindi il primo che cerca prende il nome fisso della "sala di ricerca" e fa da smistatore;
   gli altri si collegano a lui. Quando il gruppo è pronto, lo smistatore crea una partita normale,
   manda il codice a tutti e libera il nome, così chi arriva dopo forma un nuovo gruppo. */
(function (root) {
  'use strict';
  var N = root.Net;
  var ROOM = N.PREFIX + 'cerca-v1';
  var MAX = 6, MIN = 3, CALM_MS = 15000, PAIR_MS = 45000;

  function Search(me, cb) {
    this.me = me; this.cb = cb; this.stopped = false; this.peer = null; this.conn = null; this.list = [];
    this.role = null; this.lastJoin = 0; this.tick = null; this.fails = 0;
  }
  var P = Search.prototype;

  P.start = function () {
    var self = this;
    return N.loadPeerLib().then(function () { self.claim(); });
  };

  /* prova a diventare lo smistatore; se il nome è già preso, si collega a chi lo ha */
  P.claim = function () {
    if (this.stopped) return;
    var self = this, p = new root.Peer(ROOM, N.PEER_OPTS), opened = false;
    this.peer = p;
    p.on('open', function () { opened = true; self.fails = 0; self.lead(); });
    p.on('connection', function (c) { self.adopt(c); });
    p.on('error', function (e) {
      if (opened) return;
      try { p.destroy(); } catch (x) {}
      if (self.stopped) return;
      if (e.type === 'unavailable-id') self.seek();
      else self.retry();
    });
  };
  P.retry = function () {
    var self = this;
    if (this.stopped) return;
    this.fails++;
    this.cb.status({ role: 'wait', n: 0, names: [], text: 'Il servizio di collegamento non risponde: riprovo…' });
    setTimeout(function () { self.claim(); }, Math.min(8000, 800 + this.fails * 1200 + Math.random() * 800));
  };

  /* ---- smistatore ---- */
  P.lead = function () {
    var self = this;
    this.role = 'lead';
    this.list = [{ id: 'me', name: this.me.name, av: this.me.av, conn: null }];
    this.lastJoin = Date.now();
    this.tick = setInterval(function () { self.check(); }, 1000);
    this.announce();
  };
  P.adopt = function (c) {
    var self = this;
    c.on('data', function (m) {
      if (!m || self.stopped) return;
      if (m.t === 'hi' && !self.list.some(function (x) { return x.conn === c; })) {
        if (self.list.length >= MAX) { try { c.send({ t: 'full' }); } catch (e) {} return; }
        self.list.push({ id: c.peer, name: N.cleanName(m.name) || 'Giocatore', av: m.av, conn: c });
        self.lastJoin = Date.now();
        self.announce();
        if (self.list.length >= MAX) self.go();
      } else if (m.t === 'now' && self.list.length >= 2) self.go();
    });
    c.on('close', function () { self.drop(c); });
    c.on('error', function () { self.drop(c); });
  };
  P.drop = function (c) {
    var before = this.list.length;
    this.list = this.list.filter(function (x) { return x.conn !== c; });
    if (this.list.length !== before && !this.stopped && this.role === 'lead') this.announce();
  };
  P.left = function () {
    var n = this.list.length, since = Date.now() - this.lastJoin;
    if (n >= MIN) return Math.max(0, CALM_MS - since);
    if (n === 2) return Math.max(0, PAIR_MS - since);
    return null;
  };
  P.check = function () {
    if (this.stopped || this.role !== 'lead') return;
    var l = this.left();
    if (l === 0) return this.go();
    this.announce(true);
  };
  P.announce = function (quiet) {
    var names = this.list.map(function (x) { return x.name; }), l = this.left();
    var msg = { t: 'count', n: names.length, names: names, left: l };
    this.list.forEach(function (x) { if (x.conn) { try { x.conn.send(msg); } catch (e) {} } });
    this.cb.status({ role: 'lead', n: names.length, names: names, left: l });
  };
  P.go = function () {
    if (this.stopped || this.role !== 'lead') return;
    var code = N.makeCode(), humans = this.list.length, self = this;
    this.list.forEach(function (x) { if (x.conn) { try { x.conn.send({ t: 'go', code: code, n: humans }); } catch (e) {} } });
    this.stopped = true; clearInterval(this.tick);
    setTimeout(function () { self.close(); }, 1500);
    this.cb.go({ code: code, host: true, humans: humans });
  };

  /* ---- chi cerca e si collega allo smistatore ---- */
  P.seek = function () {
    var self = this;
    this.role = 'seek';
    var p = new root.Peer(N.PEER_OPTS), done = false;
    this.peer = p;
    var again = function () {
      if (done || self.stopped) return; done = true;
      try { p.destroy(); } catch (e) {}
      setTimeout(function () { self.claim(); }, 300 + Math.random() * 1500);
    };
    p.on('open', function () {
      var c = p.connect(ROOM, { reliable: true });
      self.conn = c;
      var to = setTimeout(again, 8000);
      c.on('open', function () { clearTimeout(to); self.fails = 0; c.send({ t: 'hi', name: self.me.name, av: self.me.av }); });
      c.on('data', function (m) {
        if (!m || self.stopped) return;
        if (m.t === 'count') self.cb.status({ role: 'seek', n: m.n, names: m.names, left: m.left });
        else if (m.t === 'full') again();
        else if (m.t === 'go') {
          done = true; self.stopped = true;
          setTimeout(function () { self.close(); }, 400);
          self.cb.go({ code: m.code, host: false, humans: m.n });
        }
      });
      c.on('close', again);
      c.on('error', again);
    });
    p.on('error', function (e) { if (e.type === 'peer-unavailable' || !self.conn || !self.conn.open) again(); });
  };
  P.startNow = function () { if (this.role === 'lead') this.go(); else if (this.conn && this.conn.open) { try { this.conn.send({ t: 'now' }); } catch (e) {} } };

  P.close = function () {
    clearInterval(this.tick);
    if (this.peer) { try { this.peer.destroy(); } catch (e) {} }
    this.peer = null; this.conn = null;
  };
  P.cancel = function () { this.stopped = true; this.close(); };

  root.Match = { Search: Search, MIN: MIN, MAX: MAX };
})(typeof self !== 'undefined' ? self : this);
