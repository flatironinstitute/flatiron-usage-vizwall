"use strict";
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

   ____ __   __  __ ___   __  ___  _      __ ___  ______ _____ __ __
  / __// /  / / / // _ \ /  |/  / | | /| / // _ |/_  __// ___// // /
 _\ \ / /__/ /_/ // , _// /|_/ /  | |/ |/ // __ | / /  / /__ / _  /
/___//____/\____//_/|_|/_/  /_/   |__/|__//_/ |_|/_/   \___//_//_/

⚡Slurm Watch⚡: This is an application built with Electron.

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
exports.__esModule = true;
var electron_1 = require("electron");
var path = require("path");
// import environmental variables from our variables.env file
require("dotenv").config({ path: "variables.env" });
var mainWindow;
function createWindow() {
    // Create the browser window.
    mainWindow = new electron_1.BrowserWindow({
        // backgroundColor: "#002b36",
        // transparent: false,
        transparent: true,
        frame: false,
        fullscreen: true,
        webPreferences: {
            preload: path.join(__dirname, "preload.js")
        }
    });
    // and load the index.html of the app.
    mainWindow.loadFile(path.join(__dirname, "../index.html"));
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
    // Emitted when the window is closed.
    mainWindow.on("closed", function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
electron_1.app.on("ready", createWindow);
// Quit when all windows are closed.
electron_1.app.on("window-all-closed", function () {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
electron_1.app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});
//# sourceMappingURL=main.js.map