// Banco di prova: serve la pagina e sostituisce il servizio di collegamento con uno locale.
// La voce usa WebRTC vero con microfono simulato; i dati passano dal relay locale.
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const DIST = path.join(__dirname, '..', 'web');
const TYPES = { woff2: 'font/woff2', html: 'text/html; charset=utf-8', js: 'text/javascript', css: 'text/css', webp: 'image/webp', png: 'image/png', ttf: 'font/ttf', webmanifest: 'application/manifest+json', json: 'application/json' };

function startServer(port) {
  const peers = new Map();
  const srv = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://x');
    if (url.pathname === '/sse') {
      const id = url.searchParams.get('id');
      if (peers.has(id)) { res.writeHead(409); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' });
      res.write(': hi\n\n');
      peers.set(id, res);
      req.on('close', () => {
        if (peers.get(id) === res) {
          peers.delete(id);
          for (const r of peers.values()) r.write(`data: ${JSON.stringify({ type: 'gone', id })}\n\n`);
        }
      });
      return;
    }
    if (url.pathname === '/relay' && req.method === 'POST') {
      let b = '';
      req.on('data', c => b += c);
      req.on('end', () => {
        const m = JSON.parse(b);
        const r = peers.get(m.to);
        if (r) r.write(`data: ${b}\n\n`);
        else if (m.type === 'conn' || m.type === 'offer') {
          const f = peers.get(m.from);
          if (f) f.write(`data: ${JSON.stringify({ type: 'no-peer', connId: m.connId, id: m.to })}\n\n`);
        }
        res.writeHead(200); res.end('ok');
      });
      return;
    }
    const file = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname.slice(1));
    const fp = path.join(process.env.WEBROOT || DIST, file);
    if (!fs.existsSync(fp) || fs.statSync(fp).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': TYPES[file.split('.').pop()] || 'application/octet-stream' });
    res.end(fs.readFileSync(fp));
  });
  return new Promise(r => srv.listen(port, () => r(srv)));
}

// Script iniettato al posto della libreria di collegamento reale, con la stessa interfaccia.
const SHIM = String(function () {
  function Em() { this._h = {}; }
  Em.prototype.on = function (e, f) { (this._h[e] = this._h[e] || []).push(f); return this; };
  Em.prototype.emit = function (e) { var a = [].slice.call(arguments, 1); (this._h[e] || []).slice().forEach(function (f) { f.apply(null, a); }); };
  var q = Promise.resolve();
  function post(m) { q = q.then(function () { return fetch('/relay', { method: 'POST', body: JSON.stringify(m) }).catch(function () {}); }); }
  window.__log = [];

  function Conn(peer, other, id) { Em.call(this); this.peerObj = peer; this.peer = other; this.connId = id; this.open = false; }
  Conn.prototype = Object.create(Em.prototype);
  Conn.prototype.send = function (d) { if (!this.open) throw new Error('closed'); post({ to: this.peer, from: this.peerObj.id, type: 'data', connId: this.connId, data: d }); };
  Conn.prototype.close = function () { if (!this.open) return; this.open = false; post({ to: this.peer, from: this.peerObj.id, type: 'close', connId: this.connId }); this.emit('close'); };

  function Call(peer, other, id) { Em.call(this); this.peerObj = peer; this.peer = other; this.callId = id; this.pc = null; }
  Call.prototype = Object.create(Em.prototype);
  Call.prototype._pc = function (stream) {
    var self = this, pc = new RTCPeerConnection({ iceServers: [] });
    this.pc = pc;
    stream.getTracks().forEach(function (t) { pc.addTrack(t, stream); });
    pc.ontrack = function (e) { self.emit('stream', e.streams[0]); };
    pc.onicecandidate = function (e) { if (e.candidate) post({ to: self.peer, from: self.peerObj.id, type: 'ice', callId: self.callId, c: e.candidate }); };
    pc.onconnectionstatechange = function () { if (pc.connectionState === 'failed') self.close(); };
    return pc;
  };
  Call.prototype.answer = function (stream) {
    var self = this, pc = this._pc(stream);
    pc.setRemoteDescription(this._offer).then(function () { return pc.createAnswer(); }).then(function (a) { return pc.setLocalDescription(a); }).then(function () {
      post({ to: self.peer, from: self.peerObj.id, type: 'answer', callId: self.callId, sdp: pc.localDescription });
      (self._iceq || []).forEach(function (c) { pc.addIceCandidate(c); });
      self._iceq = null;
    });
  };
  Call.prototype.close = function () { if (this.closed) return; this.closed = true; if (this.pc) this.pc.close(); post({ to: this.peer, from: this.peerObj.id, type: 'hang', callId: this.callId }); this.emit('close'); };

  function Peer(id, opts) {
    Em.call(this);
    if (typeof id === 'object') { opts = id; id = null; }
    this.id = id || ('p' + Math.random().toString(36).slice(2, 10));
    this.destroyed = false; this.disconnected = false; this.conns = {}; this.calls = {};
    var self = this;
    fetch('/sse-check').catch(function () {});
    var es = new EventSource('/sse?id=' + encodeURIComponent(this.id));
    this.es = es; var opened = false;
    es.onopen = function () { opened = true; self.emit('open', self.id); };
    es.onerror = function () { if (!opened && !self.destroyed) { es.close(); self.emit('error', { type: 'unavailable-id' }); } };
    es.onmessage = function (ev) { self._on(JSON.parse(ev.data)); };
  }
  Peer.prototype = Object.create(Em.prototype);
  Peer.prototype._on = function (m) {
    var self = this, c;
    if (m.type === 'conn') { c = new Conn(this, m.from, m.connId); this.conns[m.connId] = c; this.emit('connection', c); c.open = true; c.emit('open'); post({ to: m.from, from: this.id, type: 'conn-ok', connId: m.connId }); }
    else if (m.type === 'conn-ok') { c = this.conns[m.connId]; if (c) { c.open = true; c.emit('open'); } }
    else if (m.type === 'no-peer') { this.emit('error', { type: 'peer-unavailable' }); }
    else if (m.type === 'data') { c = this.conns[m.connId]; if (c && c.open) { if (m.data && m.data.t === 'state') window.__log.push(m.data); c.emit('data', m.data); } }
    else if (m.type === 'close') { c = this.conns[m.connId]; if (c) { c.open = false; c.emit('close'); } }
    else if (m.type === 'gone') { Object.keys(this.conns).forEach(function (k) { var x = self.conns[k]; if (x.peer === m.id && x.open) { x.open = false; x.emit('close'); } }); Object.keys(this.calls).forEach(function (k) { var x = self.calls[k]; if (x.peer === m.id && !x.closed) { x.closed = true; if (x.pc) x.pc.close(); x.emit('close'); } }); }
    else if (m.type === 'offer') { var call = new Call(this, m.from, m.callId); call._offer = m.sdp; call._iceq = []; this.calls[m.callId] = call; this.emit('call', call); }
    else if (m.type === 'answer') { var a = this.calls[m.callId]; if (a) a.pc.setRemoteDescription(m.sdp); }
    else if (m.type === 'ice') { var b = this.calls[m.callId]; if (b) { if (b._iceq) b._iceq.push(m.c); else if (b.pc) b.pc.addIceCandidate(m.c); } }
    else if (m.type === 'hang') { var d = this.calls[m.callId]; if (d && !d.closed) { d.closed = true; if (d.pc) d.pc.close(); d.emit('close'); } }
  };
  Peer.prototype.connect = function (dest) {
    var id = 'c' + Math.random().toString(36).slice(2), c = new Conn(this, dest, id);
    this.conns[id] = c;
    post({ to: dest, from: this.id, type: 'conn', connId: id });
    return c;
  };
  Peer.prototype.call = function (dest, stream) {
    var id = 'k' + Math.random().toString(36).slice(2), call = new Call(this, dest, id), self = this;
    this.calls[id] = call;
    var pc = call._pc(stream);
    call._iceq = null;
    pc.createOffer().then(function (o) { return pc.setLocalDescription(o); }).then(function () {
      post({ to: dest, from: self.id, type: 'offer', callId: id, sdp: pc.localDescription });
    });
    return call;
  };
  Peer.prototype.reconnect = function () {};
  Peer.prototype.destroy = function () {
    if (this.destroyed) return;
    this.destroyed = true; this.es.close();
    var self = this;
    Object.keys(this.conns).forEach(function (k) { var c = self.conns[k]; if (c.open) c.close(); });
    Object.keys(this.calls).forEach(function (k) { self.calls[k].close(); });
    this.emit('close');
  };
  window.Peer = Peer;
});

// Rende i timer dell'host più rapidi senza toccare il codice del gioco.
function speedScript(factor) {
  return `(function(){var st=window.setTimeout;window.setTimeout=function(f,d){var a=[].slice.call(arguments,2);return st.apply(window,[f,(d||0)/${factor}].concat(a));};})();`;
}

async function launch() {
  return chromium.launch({ args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream', '--autoplay-policy=no-user-gesture-required'] });
}

async function newPlayer(browser, base, opts = {}) {
  const ctx = await browser.newContext({
    viewport: opts.viewport || { width: 390, height: 844 },
    deviceScaleFactor: opts.dpr || 1,
    hasTouch: !!opts.touch,
    permissions: ['microphone']
  });
  const page = await ctx.newPage();
  page.errors = [];
  page.on('pageerror', e => page.errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error' && !/fonts\.g|ERR_|Failed to load resource/.test(m.text())) page.errors.push(m.text()); });
  await page.addInitScript(`(${SHIM})();`);
  await page.addInitScript('window.__TEST__=true;');
  if (opts.speed) await page.addInitScript(speedScript(opts.speed));
  await page.goto(base);
  return page;
}

module.exports = { startServer, launch, newPlayer };
