import { app, BrowserWindow, ipcMain, session } from 'electron';
import path from 'path';
import url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

let win;

async function createWindow() {
  win = new BrowserWindow({
    width: 900,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
      devTools: true
    }
  });

  win.loadFile('index.html');

  ipcMain.on('download-file', (event, { url, filename }) => {
    console.log('Download request received:', url, filename);
    downloadFile(url, filename);
  });
}

app.whenReady().then(createWindow);

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

function downloadFile(url, filename) {
  // Define download path (you can modify this to a custom directory)
  const downloadPath = path.join(app.getPath('downloads'), filename);

  session.defaultSession.downloadURL(url);

  // Listen for download completion
  session.defaultSession.on('will-download', (event, item) => {
    item.setSavePath(downloadPath); // Set the save path for the download
    item.on('done', (event, state) => {
      if (state === 'completed') {
        console.log(`Download completed: ${downloadPath}`);
        win.webContents.send('download-complete', 'Download completed!');
      } else {
        console.log(`Download failed: ${state}`);
        win.webContents.send('download-complete', 'Download failed!');
      }
    });
  });
}
