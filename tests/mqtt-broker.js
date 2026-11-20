// Servizio di messaggi MQTT minimo (su WebSocket) per le prove: fa le veci dei servizi pubblici.
const crypto = require('crypto');
function attach(server, path = '/mqtt') {
  const subs = new Map(); // topic -> Set(client)
  const stats = { published: 0 };
  server.on('upgrade', (req, sock) => {
    if (!req.url.startsWith(path)) { sock.destroy(); return; }
    const accept = crypto.createHash('sha1').update(req.headers['sec-websocket-key'] + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
    sock.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ' + accept + '\r\nSec-WebSocket-Protocol: mqtt\r\n\r\n');
    const client = { sock, topics: new Set(), buf: Buffer.alloc(0), mbuf: Buffer.alloc(0) };
    const sendWs = data => {
      const len = data.length; let head;
      if (len < 126) head = Buffer.from([0x82, len]);
      else if (len < 65536) { head = Buffer.alloc(4); head[0] = 0x82; head[1] = 126; head.writeUInt16BE(len, 2); }
      else { head = Buffer.alloc(10); head[0] = 0x82; head[1] = 127; head.writeBigUInt64BE(BigInt(len), 2); }
      try { sock.write(Buffer.concat([head, data])); } catch (e) {}
    };
    const pkt = (type, body) => { const l = []; let n = body.length; do { let b = n % 128; n = Math.floor(n / 128); if (n) b |= 128; l.push(b); } while (n); return Buffer.concat([Buffer.from([type, ...l]), body]); };
    const onMqtt = (type, body) => {
      const kind = type >> 4;
      if (kind === 1) sendWs(pkt(0x20, Buffer.from([0, 0])));
      else if (kind === 8) {
        const id = body.slice(0, 2); let off = 2;
        while (off < body.length) { const tl = body.readUInt16BE(off); const t = body.slice(off + 2, off + 2 + tl).toString(); off += 3 + tl; client.topics.add(t); if (!subs.has(t)) subs.set(t, new Set()); subs.get(t).add(client); }
        sendWs(pkt(0x90, Buffer.concat([id, Buffer.from([0])])));
      } else if (kind === 10) {
        const id = body.slice(0, 2); let off = 2;
        while (off < body.length) { const tl = body.readUInt16BE(off); const t = body.slice(off + 2, off + 2 + tl).toString(); off += 2 + tl; client.topics.delete(t); if (subs.has(t)) subs.get(t).delete(client); }
        sendWs(pkt(0xB0, id));
      } else if (kind === 3) {
        const tl = body.readUInt16BE(0), t = body.slice(2, 2 + tl).toString();
        stats.published++;
        const out = pkt(0x30, body);
        for (const c of (subs.get(t) || [])) c.send(out);
      } else if (kind === 12) sendWs(Buffer.from([0xD0, 0]));
      else if (kind === 14) sock.end();
    };
    client.send = sendWs;
    const feedMqtt = d => {
      client.mbuf = Buffer.concat([client.mbuf, d]);
      for (;;) {
        if (client.mbuf.length < 2) return;
        let mul = 1, len = 0, i = 1, b;
        do { if (i >= client.mbuf.length) return; b = client.mbuf[i++]; len += (b & 127) * mul; mul *= 128; } while (b & 128);
        if (client.mbuf.length < i + len) return;
        const type = client.mbuf[0], body = client.mbuf.slice(i, i + len);
        client.mbuf = client.mbuf.slice(i + len);
        onMqtt(type, body);
      }
    };
    sock.on('data', d => {
      client.buf = Buffer.concat([client.buf, d]);
      for (;;) {
        const b = client.buf; if (b.length < 2) return;
        const op = b[0] & 15, masked = b[1] & 128; let len = b[1] & 127, off = 2;
        if (len === 126) { if (b.length < 4) return; len = b.readUInt16BE(2); off = 4; }
        else if (len === 127) { if (b.length < 10) return; len = Number(b.readBigUInt64BE(2)); off = 10; }
        const mo = off; if (masked) off += 4;
        if (b.length < off + len) return;
        let data = b.slice(off, off + len);
        if (masked) { const m = b.slice(mo, mo + 4); data = Buffer.from(data.map((x, i) => x ^ m[i % 4])); }
        client.buf = b.slice(off + len);
        if (op === 8) { sock.end(); return; }
        if (op === 9) continue;
        if (op === 2 || op === 0) feedMqtt(data);
      }
    });
    const drop = () => { for (const t of client.topics) if (subs.has(t)) subs.get(t).delete(client); };
    sock.on('close', drop); sock.on('error', drop);
  });
  return stats;
}
module.exports = { attach };
