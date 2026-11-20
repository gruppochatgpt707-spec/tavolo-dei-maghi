/* Collegamento di riserva quando due dispositivi non riescono a parlarsi direttamente
   (succede spesso con gli iPhone e con i dati del telefono).
   I messaggi passano da servizi pubblici di messaggistica MQTT, raggiunti come una normale pagina web sicura.
   Ogni messaggio è cifrato con una chiave che nasce dal codice della partita: chi non lo conosce non legge nulla.
   Verso il resto del gioco si comporta come un collegamento diretto: on('open'|'data'|'close'|'error'), send(), close(). */
(function (root) {
  'use strict';
  var BROKERS = root.TAVOLO_BROKERS || ['wss://broker.hivemq.com:8884/mqtt', 'wss://broker.emqx.io:8084/mqtt'];
  var NS = 'tdm1/';
  var enc = new TextEncoder(), dec = new TextDecoder();

  /* ---------------- client MQTT 3.1.1 minimo, su WebSocket ---------------- */
  function vlen(n) { var out = []; do { var b = n % 128; n = Math.floor(n / 128); if (n > 0) b |= 128; out.push(b); } while (n > 0); return out; }
  function str(s) { var b = enc.encode(s); return [b.length >> 8, b.length & 255].concat(Array.from(b)); }
  function packet(type, body) { var head = [type].concat(vlen(body.length)), out = new Uint8Array(head.length + body.length); out.set(head, 0); out.set(body, head.length); return out; }

  function Broker(url, hub) {
    this.url = url; this.hub = hub; this.ws = null; this.ready = false; this.buf = new Uint8Array(0); this.pid = 1;
    this.retry = 0; this.ka = null; this.dead = false;
    this.connect();
  }
  var B = Broker.prototype;
  B.connect = function () {
    var self = this;
    if (this.dead) return;
    var ws;
    try { ws = new WebSocket(this.url, 'mqtt'); } catch (e) { return this.later(); }
    ws.binaryType = 'arraybuffer';
    this.ws = ws; this.ready = false; this.buf = new Uint8Array(0);
    ws.onopen = function () {
      var id = 'tdm' + Math.random().toString(36).slice(2, 12);
      var body = str('MQTT').concat([4, 2, 0, 40]).concat(str(id));
      ws.send(packet(0x10, body));
    };
    ws.onmessage = function (ev) { self.feed(new Uint8Array(ev.data)); };
    ws.onclose = function () { self.ready = false; clearInterval(self.ka); self.hub.changed(); self.later(); };
    ws.onerror = function () {};
  };
  B.later = function () {
    var self = this;
    if (this.dead) return;
    this.retry++;
    setTimeout(function () { self.connect(); }, Math.min(15000, 600 * this.retry + Math.random() * 600));
  };
  B.feed = function (chunk) {
    var b = new Uint8Array(this.buf.length + chunk.length); b.set(this.buf, 0); b.set(chunk, this.buf.length); this.buf = b;
    for (;;) {
      if (this.buf.length < 2) return;
      var mul = 1, len = 0, i = 1, byte;
      do { if (i >= this.buf.length) return; byte = this.buf[i++]; len += (byte & 127) * mul; mul *= 128; } while (byte & 128);
      if (this.buf.length < i + len) return;
      var type = this.buf[0], body = this.buf.subarray(i, i + len);
      this.buf = this.buf.slice(i + len);
      this.handle(type, body);
    }
  };
  B.handle = function (type, body) {
    var self = this, kind = type >> 4;
    if (kind === 2) { /* CONNACK */
      if (body[1] !== 0) { try { this.ws.close(); } catch (e) {} return; }
      this.ready = true; this.retry = 0;
      Object.keys(this.hub.subs).forEach(function (t) { self.subscribe(t); });
      clearInterval(this.ka);
      this.ka = setInterval(function () { try { self.ws.send(new Uint8Array([0xC0, 0])); } catch (e) {} }, 20000);
      this.hub.changed();
    } else if (kind === 3) { /* PUBLISH */
      var tl = (body[0] << 8) | body[1], topic = dec.decode(body.subarray(2, 2 + tl)), off = 2 + tl;
      if ((type >> 1) & 3) off += 2;
      this.hub.deliver(topic, body.slice(off));
    }
  };
  B.subscribe = function (topic) {
    if (!this.ready) return;
    var id = this.pid = (this.pid % 65000) + 1;
    try { this.ws.send(packet(0x82, [id >> 8, id & 255].concat(str(topic)).concat([0]))); } catch (e) {}
  };
  B.unsubscribe = function (topic) {
    if (!this.ready) return;
    var id = this.pid = (this.pid % 65000) + 1;
    try { this.ws.send(packet(0xA2, [id >> 8, id & 255].concat(str(topic)))); } catch (e) {}
  };
  B.publish = function (topic, bytes) {
    if (!this.ready) return false;
    var t = str(topic), body = new Uint8Array(t.length + bytes.length); body.set(t, 0); body.set(bytes, t.length);
    try { this.ws.send(packet(0x30, body)); return true; } catch (e) { return false; }
  };

  /* Tutti i collegamenti di riserva condividono le stesse connessioni ai servizi. */
  var hub = {
    brokers: null, subs: {}, waiters: [],
    start: function () { if (!this.brokers) this.brokers = BROKERS.map(function (u) { return new Broker(u, hub); }); },
    anyReady: function () { return this.brokers && this.brokers.some(function (b) { return b.ready; }); },
    changed: function () { if (this.anyReady()) { var w = this.waiters; this.waiters = []; w.forEach(function (f) { f(); }); } },
    whenReady: function (ms) {
      var self = this; this.start();
      if (this.anyReady()) return Promise.resolve();
      return new Promise(function (res, rej) { self.waiters.push(res); setTimeout(function () { rej({ type: 'relay-unreachable' }); }, ms || 8000); });
    },
    sub: function (topic, fn) {
      this.start();
      var list = this.subs[topic] || (this.subs[topic] = []);
      list.push(fn);
      if (list.length === 1) this.brokers.forEach(function (b) { b.subscribe(topic); });
    },
    unsub: function (topic, fn) {
      var list = this.subs[topic]; if (!list) return;
      list.splice(list.indexOf(fn), 1);
      if (!list.length) { delete this.subs[topic]; this.brokers.forEach(function (b) { b.unsubscribe(topic); }); }
    },
    pub: function (topic, bytes) { this.start(); var ok = false; this.brokers.forEach(function (b) { ok = b.publish(topic, bytes) || ok; }); return ok; },
    deliver: function (topic, bytes) { (this.subs[topic] || []).slice().forEach(function (fn) { fn(bytes); }); }
  };

  /* ---------------- cifratura legata al nome del tavolo ---------------- */
  var keys = {};
  function hex(buf) { return Array.from(new Uint8Array(buf)).map(function (b) { return ('0' + b.toString(16)).slice(-2); }).join(''); }
  function material(id) {
    if (keys[id]) return keys[id];
    var c = root.crypto.subtle;
    keys[id] = Promise.all([
      c.digest('SHA-256', enc.encode('tdm-topic|' + id)),
      c.importKey('raw', enc.encode(id), 'PBKDF2', false, ['deriveKey']).then(function (base) {
        return c.deriveKey({ name: 'PBKDF2', salt: enc.encode('tavolo-dei-maghi-relay-1'), iterations: 60000, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
      })
    ]).then(function (r) { return { topic: NS + hex(r[0]).slice(0, 28), key: r[1] }; });
    return keys[id];
  }
  function seal(key, obj) {
    var iv = root.crypto.getRandomValues(new Uint8Array(12));
    return root.crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, key, enc.encode(JSON.stringify(obj))).then(function (ct) {
      var out = new Uint8Array(12 + ct.byteLength); out.set(iv, 0); out.set(new Uint8Array(ct), 12); return out;
    });
  }
  function open(key, bytes) {
    if (bytes.length < 13) return Promise.reject();
    return root.crypto.subtle.decrypt({ name: 'AES-GCM', iv: bytes.subarray(0, 12) }, key, bytes.subarray(12)).then(function (pt) { return JSON.parse(dec.decode(pt)); });
  }

  /* ---------------- collegamento di riserva ---------------- */
  function Emitter() { this._h = {}; }
  Emitter.prototype.on = function (ev, fn) { (this._h[ev] || (this._h[ev] = [])).push(fn); return this; };
  Emitter.prototype.emit = function (ev, a) { (this._h[ev] || []).slice().forEach(function (fn) { try { fn(a); } catch (e) { setTimeout(function () { throw e; }); } }); };

  /* side: 'host' (chi ascolta) o 'guest' (chi si collega). me / other = identificativi delle due parti. */
  function Conn(mat, me, other, side) {
    Emitter.call(this);
    this.mat = mat; this.me = me; this.peer = other; this.side = side; this.relay = true;
    this.open = false; this.closed = false; this.seq = 0; this.last = 0; this.heard = Date.now();
    this.outTopic = side === 'host' ? mat.topic + '/g/' + other : mat.topic + '/in';
    this.sendQ = Promise.resolve();
    var self = this;
    this.ka = setInterval(function () {
      if (self.closed) return;
      if (Date.now() - self.heard > 13000) { self.emit('error', { type: 'relay-timeout' }); self.close(true); return; }
      self.raw('ka');
    }, 4000);
  }
  Conn.prototype = Object.create(Emitter.prototype);
  Conn.prototype.raw = function (k, d) {
    var self = this, msg = { f: this.me, s: ++this.seq, k: k };
    if (d !== undefined) msg.d = d;
    this.sendQ = this.sendQ.then(function () { return seal(self.mat.key, msg); }).then(function (b) { hub.pub(self.outTopic, b); }).catch(function () {});
  };
  Conn.prototype.got = function (m) {
    if (this.closed || m.s <= this.last) return;
    this.last = m.s; this.heard = Date.now();
    if (m.k === 'ok' && !this.open) { this.open = true; this.emit('open'); }
    else if (m.k === 'd' && this.open) this.emit('data', m.d);
    else if (m.k === 'bye') this.close(true);
  };
  Conn.prototype.send = function (obj) { if (!this.open || this.closed) throw new Error('chiuso'); this.raw('d', obj); };
  Conn.prototype.close = function (quiet) {
    if (this.closed) return;
    if (!quiet) this.raw('bye');
    this.closed = true; this.open = false; clearInterval(this.ka);
    if (this.cleanup) this.cleanup();
    this.emit('close');
  };

  /* Chi crea il tavolo ascolta anche dal collegamento di riserva. */
  function listen(id, onConn) {
    var conns = {}, stopped = false, mat = null, q = Promise.resolve(), me = 'h' + Math.random().toString(36).slice(2, 10);
    var handler = function (bytes) {
      q = q.then(function () { return open(mat.key, bytes); }).then(function (m) {
        if (stopped || !m || !m.f) return;
        var c = conns[m.f];
        if (m.k === 'hello') {
          if (c && !c.closed) { c.raw('ok'); return; }
          c = conns[m.f] = new Conn(mat, me, m.f, 'host');
          c.last = m.s; c.open = true;
          c.cleanup = function () { if (conns[m.f] === c) delete conns[m.f]; };
          c.raw('ok');
          onConn(c);
          return;
        }
        if (c) c.got(m);
      }).catch(function () {});
    };
    var ready = material(id).then(function (m) { mat = m; if (!stopped) hub.sub(m.topic + '/in', handler); });
    return {
      ready: ready,
      close: function () {
        stopped = true;
        Object.keys(conns).forEach(function (k) { conns[k].close(); });
        if (mat) hub.unsub(mat.topic + '/in', handler);
      }
    };
  }

  /* Chi entra si collega al tavolo: dopo il saluto il tavolo risponde "ok" e il collegamento è aperto. */
  function connect(id) {
    var me = 'g' + Math.random().toString(36).slice(2, 12), c = null, handler = null;
    var shell = new Emitter(); /* finché la chiave non è pronta */
    material(id).then(function (mat) {
      c = new Conn(mat, me, id, 'guest');
      var q = Promise.resolve(), topic = mat.topic + '/g/' + me;
      handler = function (bytes) { q = q.then(function () { return open(mat.key, bytes); }).then(function (m) { if (m) c.got(m); }).catch(function () {}); };
      hub.sub(topic, handler);
      c.cleanup = function () { hub.unsub(topic, handler); };
      ['open', 'data', 'close', 'error'].forEach(function (ev) { c.on(ev, function (a) { shell.open = c.open; shell.emit(ev, a); }); });
      shell.c = c;
      if (shell.wantClose) return c.close();
      hub.whenReady(8000).then(function () {
        var tries = 0;
        (function hello() { if (c.open || c.closed || tries++ > 5) return; c.raw('hello'); setTimeout(hello, 1500); })();
      }).catch(function (e) { shell.emit('error', e); c.close(true); });
    }).catch(function () { shell.emit('error', { type: 'relay-crypto' }); });
    shell.relay = true; shell.peer = id; shell.open = false;
    shell.send = function (o) { if (!c) throw new Error('chiuso'); c.send(o); };
    shell.close = function () { if (c) c.close(); else shell.wantClose = true; };
    return shell;
  }

  root.Relay = { listen: listen, connect: connect, warm: function () { hub.start(); }, hub: hub };
})(typeof self !== 'undefined' ? self : this);
