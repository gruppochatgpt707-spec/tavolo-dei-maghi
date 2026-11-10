/* App per computer (Mac e Windows): apre il gioco in una finestra propria, con i file inclusi nell'app. */
const { app, BrowserWindow, protocol, net, session, shell, systemPreferences, Menu } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');

protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true, corsEnabled: true } }]);

if (!app.requestSingleInstanceLock()) app.quit();

function createWindow() {
  const win = new BrowserWindow({
    width: 1280, height: 820, minWidth: 360, minHeight: 560,
    backgroundColor: '#3a2211', title: 'Il Tavolo dei Maghi', autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, sandbox: true }
  });
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:/.test(url)) shell.openExternal(url); return { action: 'deny' }; });
  win.webContents.on('will-navigate', (e, url) => { if (!url.startsWith('app://')) { e.preventDefault(); if (/^https?:/.test(url)) shell.openExternal(url); } });
  win.loadURL('app://tavolo/index.html');
  return win;
}

app.whenReady().then(() => {
  const root = path.join(__dirname, 'web');
  protocol.handle('app', req => {
    let p = decodeURIComponent(new URL(req.url).pathname);
    if (p === '/' || p === '') p = '/index.html';
    const fp = path.normalize(path.join(root, p));
    if (!fp.startsWith(root)) return new Response('Non trovato', { status: 404 });
    return net.fetch(pathToFileURL(fp).toString());
  });
  /* Il microfono serve solo per la chat vocale */
  session.defaultSession.setPermissionRequestHandler((wc, perm, cb, details) => {
    if (perm === 'media') {
      const wantsVideo = details && details.mediaTypes && details.mediaTypes.includes('video');
      if (wantsVideo) return cb(false);
      if (process.platform === 'darwin') systemPreferences.askForMediaAccess('microphone').then(ok => cb(ok)).catch(() => cb(false));
      else cb(true);
      return;
    }
    cb(perm === 'fullscreen' || perm === 'clipboard-sanitized-write' || perm === 'screen-wake-lock');
  });
  session.defaultSession.setPermissionCheckHandler((wc, perm) => perm === 'media' || perm === 'clipboard-sanitized-write' || perm === 'screen-wake-lock');
  if (process.platform === 'darwin') {
    Menu.setApplicationMenu(Menu.buildFromTemplate([
      { label: 'Tavolo dei Maghi', submenu: [{ role: 'about', label: 'Informazioni' }, { type: 'separator' }, { role: 'hide', label: 'Nascondi' }, { role: 'quit', label: 'Esci' }] },
      { label: 'Modifica', submenu: [{ role: 'undo', label: 'Annulla' }, { role: 'redo', label: 'Ripeti' }, { type: 'separator' }, { role: 'cut', label: 'Taglia' }, { role: 'copy', label: 'Copia' }, { role: 'paste', label: 'Incolla' }, { role: 'selectAll', label: 'Seleziona tutto' }] },
      { label: 'Vista', submenu: [{ role: 'togglefullscreen', label: 'Schermo intero' }, { role: 'resetZoom', label: 'Dimensione reale' }, { role: 'zoomIn', label: 'Ingrandisci' }, { role: 'zoomOut', label: 'Riduci' }] },
      { label: 'Finestra', submenu: [{ role: 'minimize', label: 'Riduci a icona' }, { role: 'close', label: 'Chiudi' }] }
    ]));
  } else Menu.setApplicationMenu(null);
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('second-instance', () => { const w = BrowserWindow.getAllWindows()[0]; if (w) { if (w.isMinimized()) w.restore(); w.focus(); } });
app.on('window-all-closed', () => app.quit());
