const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('Electron', {
    download: (info) => ipcRenderer.send('download-file', info), // Using ipcRenderer to communicate with the main process
    onDownloadComplete: (callback) => ipcRenderer.on('download-complete', callback),
    //modifyJsonFile: (filePath) => ipcRenderer.send('modify-json-file', filePath),
});