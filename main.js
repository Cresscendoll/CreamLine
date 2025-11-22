const { app, BrowserWindow, ipcMain, desktopCapturer } = require("electron");
const { autoUpdater } = require("electron-updater");
const path = require("path");

let win;

function createWindow() {
    win = new BrowserWindow({
        width: 1280,
        height: 720,
        frame: false,
        titleBarStyle: "hidden",
        backgroundColor: "#111",
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    win.loadFile("index.html");
}

// ---------- IPC ----------
ipcMain.on("window-minimize", () => win?.minimize());
ipcMain.on("window-maximize", () => {
    if (!win) return;
    win.isMaximized() ? win.unmaximize() : win.maximize();
});
ipcMain.on("window-close", () => win?.close());

ipcMain.handle("get-sources", async () => {
    return await desktopCapturer.getSources({ types: ["screen"] });
});

// ---------- AUTOUPDATE ----------
function setupAutoUpdater() {
    autoUpdater.autoDownload = true;

    autoUpdater.on("checking-for-update", () => {
        console.log("🔍 Проверяю обновления...");
    });

    autoUpdater.on("update-available", () => {
        console.log("⚡ Доступно новое обновление! Скачиваю...");
    });

    autoUpdater.on("update-not-available", () => {
        console.log("✔ Обновлений нет.");
    });

    autoUpdater.on("error", (err) => {
        console.log("❌ Ошибка автообновления:", err);
    });

    autoUpdater.on("download-progress", (p) => {
        console.log(`📥 Загрузка: ${Math.floor(p.percent)}%`);
    });

    autoUpdater.on("update-downloaded", () => {
        console.log("📦 Обновление скачано. Будет установлено при перезапуске.");
        autoUpdater.quitAndInstall();
    });

    autoUpdater.checkForUpdatesAndNotify();
}

// ---------- APP ----------
app.whenReady().then(() => {
    createWindow();
    setupAutoUpdater();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});
