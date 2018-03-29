console.time("Init Time");

// Constants
const FS = require("fs");
const Util = require("util");
const URL = require("url");
const Path = require("path");
const Electron = require("electron");

// Electron Module Imports
const App = Electron.app;
const IPC = Electron.ipcMain;
const Menu = Electron.Menu;
const Tray = Electron.Tray;
const Shell = Electron.shell;
const BrowserWindow = Electron.BrowserWindow;

// Vendor Imports
const Datastore = require("nedb");
const RequestPromise = require("request-promise");

// App Constants
const AppConstants = require("../js/constants/app-constants");
const APIConstants = require("../js/constants/api-constants");
const Strings = require("../js/constants/app-strings");

// Log Constants
const logFile = FS.createWriteStream("debug.log", {
  flags: "w"
});
const logStdout = process.stdout;
console.log = function() {
  logFile.write(Util.format.apply(null, arguments) + "\n");
  logStdout.write(Util.format.apply(null, arguments) + "\n");
};
console.error = console.log;
console.log(new Date().toJSON(), AppConstants.LOG_INFO, "Log Started.");

const contextMenu = Menu.buildFromTemplate([
  {
    label: Strings.APP_NAME,
    click: function() {
      mainWindow.show();
    }
  },
  {
    label: "Quit",
    click: function() {
      App.isQuiting = true;
      App.quit();
    }
  }
]);

// App's tray variable
var appTray;

// Keep a global reference of the window object otherwise the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

// Create/Autoload the Database at the 'User Data' directory.
let neDB = new Datastore({
  filename: App.getPath("userData") + "atlassian-tools.db",
  autoload: true
});

// Create the main browser window
var createMainWindow = function() {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    icon: Path.join(__dirname, "../../resources/icons", "favicon-rocket.ico"),
    show: false,
    backgroundColor: "#333333",
    toolbar: false
  });

  //const menu = Menu.buildFromTemplate(null);
  Menu.setApplicationMenu(null);

  appTray = new Tray(Path.join(__dirname, "../../resources/icons", "favicon-rocket.ico"));
  appTray.setContextMenu(contextMenu);
  appTray.setToolTip("Atlassian Tools");
  appTray.on("click", () => {
    mainWindow.show();
  });
  appTray.on("double-click", () => {
    mainWindow.show();
  });

  mainWindow.loadURL(
    URL.format({
      pathname: Path.join(__dirname, "../app.html"),
      protocol: "file:",
      slashes: true
    })
  );

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    mainWindow.focus();
  });

  // Launch DevTools
  mainWindow.webContents.openDevTools("undocked");

  // Emitted when external links are clicked
  mainWindow.webContents.on("new-window", function(functionEvent, url) {
    var urlToOpen;
    var appURL = URL.format({
      pathname: Path.join(__dirname, "/"),
      protocol: "file:",
      slashes: true
    }).replace(/\\/g, "/");
    url = url.substring(appURL.length + 3);
    url = url.slice(0, -3);
    functionEvent.preventDefault();
    Shell.openExternal(url);
  });

  // Emitted on '-' (Minimize) Click on the Main Window
  mainWindow.on("minimize", function(event) {
    event.preventDefault();
    mainWindow.hide();
  });

  // Emitted when the Main Window is going to be closed
  mainWindow.on("close", function(event) {
    // if (!App.isQuiting) {
    //   event.preventDefault();
    //   mainWindow.hide();
    // }
    // return false;

    App.isQuiting = true;
    App.quit();
  });

  // Emitted when the window is closed.
  mainWindow.on("closed", mainWindowOnClosed => {
    // Dereference the window object.
    mainWindow = null;
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
App.on("ready", appReady => {
  createMainWindow();
  console.timeEnd("Init Time");
});

// Quit when all windows are closed.
App.on("window-all-closed", appAllWindowsClosed => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    App.quit();
  }
});

App.on("activate", appActivate => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (process.platform === "darwin" && mainWindow === null) {
    createMainWindow();
  }
});

