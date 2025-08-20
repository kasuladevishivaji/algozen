const { app, BrowserWindow, ipcMain, desktopCapturer, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 950,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('get-screen-sources', async () => {
  return await desktopCapturer.getSources({ types: ['window', 'screen'] });
});

ipcMain.handle('open-file-dialog', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
            { name: 'Code Files', extensions: ['js', 'py', 'java', 'c', 'cpp', 'html', 'css', 'ts', 'go', 'rs'] },
            { name: 'All Files', extensions: ['*'] }
        ]
    });
    if (canceled || filePaths.length === 0) return null;
    const filePath = filePaths[0];
    const content = fs.readFileSync(filePath, 'utf-8');
    return { path: filePath, content };
});