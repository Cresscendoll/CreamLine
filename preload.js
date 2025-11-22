const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
    // управление окном
    minimize: () => ipcRenderer.send("window-minimize"),
    maximize: () => ipcRenderer.send("window-maximize"),
    close:    () => ipcRenderer.send("window-close"),

    // список доступных экранов (из main.js через desktopCapturer)
    getSources: () => ipcRenderer.invoke("get-sources")
});

