import { app, BrowserWindow, ipcMain, session } from 'electron';
import { download } from 'electron-dl';  // Using import for electron-dl
import path from 'path';
import fs from 'fs';
import url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

let win;

async function createWindow() {
  win = new BrowserWindow({
    width: 900,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
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

  // ipcMain.on('modify-json-file', (event, filePath) => {
  //   fs.readFile(filePath, 'utf-8', (err, data) => {
  //     if (err) {
  //       console.error("Error reading file: ", err);
  //       return;
  //     }

  //     try {
  //       let jsonData = JSON.parse(data);
  //       console.log('Original data: ', jsonData);

  //       jsonData.modified = true;
  //       // modify data

  //       const modifiedJson = JSON.stringify(jsonData, null, 2);
        
  //       fs.writeFile(filePath, modifiedJson, 'utf-8', (err) => {
  //         if (err) {
  //           console.error('Error writing modified file: ', err);
  //           return;
  //         }
  //         console.log('File successfully modified!');
  //         event.reply('json-modified', 'File modified successfully!');
  //       });
  //     } catch (parseError) {
  //       console.error('Error parsing JSON: ', parseError);
  //     }
  //   });
  // });
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
  const downloadPath = path.join('C:\\Users\\dorothy.fanzhu\\Downloads', filename);

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