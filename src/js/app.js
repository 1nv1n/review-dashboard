console.time("Init Time");

// Constants
const FS = require("fs");
const UTIL = require("util");
const URL = require("url");
const PATH = require("path");
const ELECTRON = require("electron");
const REQUEST_PROMISE = require("request-promise");

// Electron Module Imports
const APP = ELECTRON.app;
const IPC = ELECTRON.ipcMain;
const MENU = ELECTRON.Menu;
const TRAY = ELECTRON.Tray;
const SHELL = ELECTRON.shell;
const BROWSER_WINDOW = ELECTRON.BrowserWindow;

// Vendor Imports
const NEDB_DATA_STORE = require("nedb");
const REQUEST_PROMISE = require("request-promise");

// App Constants
const API_CONSTANTS = require("../js/constants/api-constants");
const APP_CONSTANTS = require("../js/constants/app-constants");
const APP_STRING_CONSTANTS = require("../js/constants/app-strings");

// Main (Background) Processes
const serverProcess = require("../js/main/server");
const authProcess = require("../js/main/authentication");
const userProcess = require("../js/main/user");

// Log Constants
const LOG_FILE = FS.createWriteStream("debug.log", {
  flags: "w"
});
const LOG_STD_OUT = process.stdout;
console.log = function() {
  LOG_FILE.write(UTIL.format.apply(null, arguments) + "\n");
  LOG_STD_OUT.write(UTIL.format.apply(null, arguments) + "\n");
};
console.error = console.log;
console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "Logging Initialized.");

const CONTEXT_MENU = MENU.buildFromTemplate([
  {
    label: APP_STRING_CONSTANTS.APP_NAME,
    click: function() {
      mainWindow.show();
    }
  },
  {
    label: "Quit",
    click: function() {
      APP.isQuiting = true;
      APP.quit();
    }
  }
]);

// App's system tray variable
var appTray;

// Keep a global reference of the window object otherwise the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

// Create/Autoload the Database at the 'User Data' directory.
// On Windows: "C:\Users\<USER>\AppData\Roaming\CrucibleDashboard"
let neDB = new NEDB_DATA_STORE({
  filename: APP.getPath("userData") + "/crucible-dash.db",
  autoload: true
});

// Create the main browser window
var createMainWindow = function() {
  mainWindow = new BROWSER_WINDOW({
    width: 1920,
    height: 1080,
    icon: PATH.join(__dirname, "../../resources/icons", "app.ico"),
    show: false,
    backgroundColor: "#333333",
    toolbar: false
  });

  //const menu = Menu.buildFromTemplate(null);
  MENU.setApplicationMenu(null);

  appTray = new TRAY(PATH.join(__dirname, "../../resources/icons", "app.ico"));
  appTray.setContextMenu(CONTEXT_MENU);
  appTray.setToolTip("Crucible Dashboard");
  appTray.on("click", () => {
    mainWindow.show();
  });
  appTray.on("double-click", () => {
    mainWindow.show();
  });

  mainWindow.loadURL(
    URL.format({
      pathname: PATH.join(__dirname, "../app.html"),
      protocol: "file:",
      slashes: true
    })
  );

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    mainWindow.focus();
    initialize();
  });

  // Launch DevTools
  mainWindow.webContents.openDevTools("undocked");

  // Emitted when external links are clicked
  mainWindow.webContents.on("new-window", function(functionEvent, url) {
    var urlToOpen;
    var appURL = URL.format({
      pathname: PATH.join(__dirname, "/"),
      protocol: "file:",
      slashes: true
    }).replace(/\\/g, "/");
    url = url.substring(appURL.length + 3);
    url = url.slice(0, -3);
    functionEvent.preventDefault();
    SHELL.openExternal(url);
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

    APP.isQuiting = true;
    APP.quit();
  });

  // Emitted when the window is closed.
  mainWindow.on("closed", mainWindowOnClosed => {
    // Dereference the window object.
    mainWindow = null;
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
APP.on("ready", appReady => {
  createMainWindow();
  console.timeEnd("Init Time");
});

// Quit when all windows are closed.
APP.on("window-all-closed", appAllWindowsClosed => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    APP.quit();
  }
});

APP.on("activate", appActivate => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (process.platform === "darwin" && mainWindow === null) {
    createMainWindow();
  }
});

/**
 * Launched when the Main Window is "ready-to-show".
 */
function initialize() {
  // Start by attempting to retrieve the list of Crucible Servers
  serverProcess.retrieveCrucibleServerList(neDB, APP_CONSTANTS).then(
    function(crucibleServerList) {
      userProcess.retrieveUser(neDB, APP_CONSTANTS).then(
        function(user) {
          mainWindow.webContents.send("initial-state", crucibleServerList, user);
        },
        function(err) {
          console.log(new Date().toJSON(), APP_CONSTANTS.LOG_ERROR, "initialize()", err);
          mainWindow.webContents.send("initial-state", [], null);
        }
      );
    },
    function(err) {
      console.log(new Date().toJSON(), APP_CONSTANTS.LOG_ERROR, "initialize()", err);
      mainWindow.webContents.send("initial-state", [], null);
    }
  );
}

/**
 * Save the input Crucible server list
 */
IPC.on("save-crucible-server-list", function(event, crucibleServerList) {
  serverProcess.saveCrucibleServerList(neDB, APP_CONSTANTS, crucibleServerList);
});

/**
 * Attemt to log the user in & save the authentication token.
 */
IPC.on("login-attempt", function(event, userID, password) {
  authProcess.authenticateUser(neDB, API_CONSTANTS, APP_CONSTANTS, userID, password, mainWindow, REQUEST_PROMISE, serverProcess);
});
