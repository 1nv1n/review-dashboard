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
const ElectronMenu = Electron.Menu;
const ElectronTray = Electron.Tray;
const ElectronShell = Electron.shell;
const ElectronBroswerWindow = Electron.BrowserWindow;

// Vendor Imports
const NEDB = require("nedb");
const RequestPromise = require("request-promise");

// App Constants
const APIConstants = require("../js/constants/api-constants");
const AppConstants = require("../js/constants/app-constants");
const AppStringConstants = require("../js/constants/app-strings");

// Main (Background) Processes
const serverProcess = require("../js/main/server");
const authProcess = require("../js/main/authentication");
const userProcess = require("../js/main/user");

// Log Constants
const LogFile = FS.createWriteStream("debug.log", {
  flags: "w"
});
const LogStdOut = process.stdout;
console.log = function() {
  LogFile.write(Util.format.apply(null, arguments) + "\n");
  LogStdOut.write(Util.format.apply(null, arguments) + "\n");
};
console.error = console.log;
console.log(new Date().toJSON(), AppConstants.LOG_INFO, "Logging Initialized.");

const ElectronContextMenu = ElectronMenu.buildFromTemplate([
  {
    label: AppStringConstants.APP_NAME,
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

// App's system tray variable
var appTray;

// App's titlebar
var appTitlebar;

// Keep a global reference of the window object otherwise the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow;

// Create/Autoload the Database at the 'User Data' directory.
// On Windows: "C:\Users\<USER>\AppData\Roaming\CrucibleDashboard"
var neDB = new NEDB({
  filename: App.getPath("userData") + "/crucible-dash.db",
  autoload: true
});

// Saves the default (or first) instance server string
var crucibleServerInstance;

// Create the main browser window
var createMainWindow = function() {
  mainWindow = new ElectronBroswerWindow({
    width: 1900, //1920
    minWidth: 1280,
    height: 1000, // 1080
    minHeight: 720,
    icon: Path.join(__dirname, "../../resources/icons", "app.ico"),
    show: false,
    backgroundColor: "#333333",
    toolbar: false,
    frame: false,
    titleBarStyle: 'hidden-inset'
  });

  //const menu = Menu.buildFromTemplate(null);
  ElectronMenu.setApplicationMenu(null);

  appTray = new ElectronTray(Path.join(__dirname, "../../resources/icons", "app.ico"));
  appTray.setContextMenu(ElectronContextMenu);
  appTray.setToolTip("Crucible Dashboard");
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
    initialize();
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
    ElectronShell.openExternal(url);
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

  mainWindow.webContents.on('will-navigate', (event, url) => {
    event.preventDefault();
    ElectronShell.openExternal(url);
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

/**
 * Launched when the Main Window is "ready-to-show".
 */
function initialize() {
  // Start by attempting to retrieve the list of Crucible Servers
  serverProcess.retrieveCrucibleServerList(neDB, AppConstants).then(
    function(crucibleServerList) {
      userProcess.retrieveUser(neDB, AppConstants).then(
        function(user) {
          mainWindow.webContents.send("initial-state", crucibleServerList, user);
        },
        function(err) {
          console.log(new Date().toJSON(), AppConstants.LOG_ERROR, "initialize()", err);
          mainWindow.webContents.send("initial-state", [], null);
        }
      );
    },
    function(err) {
      console.log(new Date().toJSON(), AppConstants.LOG_ERROR, "initialize()", err);
      mainWindow.webContents.send("initial-state", [], null);
    }
  );
}

/**
 * Save the input Crucible server list
 */
IPC.on("save-crucible-server-list", function(event, crucibleServerList) {
  crucibleServerInstance = crucibleServerList[0];
  serverProcess.saveCrucibleServerList(neDB, AppConstants, crucibleServerList, mainWindow);
});

/**
 * Attemt to log the user in & save the authentication token.
 */
IPC.on("login-attempt", function(event, userID, password) {
  authProcess.authenticateUser(neDB, APIConstants, AppConstants, userID, password, mainWindow, RequestPromise, serverProcess);
  userProcess.saveUserInfo(neDB, APIConstants, AppConstants, userID, crucibleServerInstance, mainWindow, RequestPromise);
});

/**
 * Clear all user details
 */
IPC.on("logout", function(event, flag) {
  authProcess.logout(neDB, AppConstants);
});