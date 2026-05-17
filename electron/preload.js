const { contextBridge, ipcRenderer } = require('electron');

// Secure context bridge exposure
contextBridge.exposeInMainWorld('electronAPI', {
    ping: () => ipcRenderer.invoke('ping'),
    closeApp: () => ipcRenderer.send('close-app'),
    onBackendReady: (callback) => ipcRenderer.on('backend-ready', callback)
});
