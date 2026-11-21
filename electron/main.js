const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
function create() {
  const w = new BrowserWindow({ width: 1100, height: 820, minWidth: 380, title: 'شؤون الموظفين', backgroundColor: '#10253f' });
  if (process.platform !== 'darwin') Menu.setApplicationMenu(null);
  w.loadFile(path.join(__dirname, '..', 'www', 'index.html'));
}
app.whenReady().then(() => { create(); app.on('activate', () => { if (!BrowserWindow.getAllWindows().length) create(); }); });
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
