console.time("Startup Time");

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
const GlobalShortcut = Electron.globalShortcut;
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
const reviewProcess = require("../js/main/review");

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

// Save the default (or first) instance server string
var crucibleServerInstance;

// Save the current user
var currentUser;

// Particles
var particlesEnabled = false;

// Create the main browser window
var createMainWindow = function() {
  mainWindow = new ElectronBroswerWindow({
    width: 1900, //1920
    minWidth: 1280,
    height: 1000, // 1080
    minHeight: 720,
    icon: Path.join(__dirname, "../../resources/icons", "app.ico"),
    show: false,
    backgroundColor: "#1E1E1E",
    toolbar: false,
    frame: false,
    titleBarStyle: "hidden-inset"
  });

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

  mainWindow.webContents.on("will-navigate", (event, url) => {
    event.preventDefault();
    ElectronShell.openExternal(url);
  });
};

// Register Global Shortcut Commands
var registerGlobalShortcuts = function() {
  // Register the Debug (Ctrl+D) shortcut
  GlobalShortcut.register("CommandOrControl+D", () => {
    // Launch DevTools if it is not currently open, close it if it is open.
    if (mainWindow.webContents.isDevToolsOpened()) {
      mainWindow.webContents.closeDevTools();
    } else {
      mainWindow.webContents.openDevTools({ mode: "detach" });
    }
  });

  // Register the Particles JS (Ctrl+P) shortcut
  GlobalShortcut.register("CommandOrControl+P", () => {
    particlesEnabled = !particlesEnabled;
    mainWindow.webContents.send("toggle-particles", particlesEnabled);
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
App.on("ready", appReady => {
  // Create the Main Window
  createMainWindow();

  // Register Global Shortcuts
  registerGlobalShortcuts();

  // End Init Time Log
  console.timeEnd("Startup Time");
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
  // TODO: Refactor to not have so many nested calls.
  // Start by attempting to retrieve the list of Crucible Servers
  serverProcess.retrieveCrucibleServerList(neDB, AppConstants).then(
    function(crucibleServerList) {
      // Then, retrieve the user information
      userProcess.retrieveUser(neDB, AppConstants).then(
        function(user) {
          currentUser = user;
          // Then, retrieve the list of saved reviewers
          userProcess.retrieveReviewerList(neDB, AppConstants).then(
            function(reviewerList) {
              // Then, retrieve the saved Project Type key
              userProcess.retrieveProjectKey(neDB, AppConstants).then(
                function(projectKey) {
                  mainWindow.webContents.send("initial-state", crucibleServerList, user, reviewerList, projectKey);
                },
                function(err) {
                  console.log(new Date().toJSON(), AppConstants.LOG_ERROR, "initialize():retrieveProjectKey:", err);
                  mainWindow.webContents.send("initial-state", [], null, [], null);
                }
              );
            },
            function(err) {
              console.log(new Date().toJSON(), AppConstants.LOG_ERROR, "initialize():retrieveReviewerList:", err);
              mainWindow.webContents.send("initial-state", [], null, [], null);
            }
          );
        },
        function(err) {
          console.log(new Date().toJSON(), AppConstants.LOG_ERROR, "initialize():retrieveUser:", err);
          mainWindow.webContents.send("initial-state", [], null, [], null);
        }
      );
    },
    function(err) {
      console.log(new Date().toJSON(), AppConstants.LOG_ERROR, "initialize():retrieveCrucibleServerList:", err);
      mainWindow.webContents.send("initial-state", [], null, [], null);
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
  currentUser = userProcess.saveUserInfo(neDB, APIConstants, AppConstants, userID, crucibleServerInstance, mainWindow, RequestPromise);
});

/**
 * Attemt to create a review.
 */
IPC.on("create-review", function(event, crucibleServerInstance, projectKey, reviewName, reviewDesc, jiraKey, allowReviewersToJoin, reviewerList) {
  userProcess.saveReviewerDetails(neDB, AppConstants, reviewerList);
  userProcess.saveProjectDetails(neDB, AppConstants, projectKey);
  reviewProcess.createReview(
    neDB,
    AppConstants,
    APIConstants,
    RequestPromise,
    ElectronShell,
    mainWindow,
    crucibleServerInstance,
    currentUser,
    projectKey,
    reviewName,
    reviewDesc,
    jiraKey,
    allowReviewersToJoin,
    reviewerList
  );
});

/**
 * Search for reviews.
 */
IPC.on("search-review", function(event, instanceString, jiraIssue) {
  reviewProcess.searchByJIRA(APIConstants, AppConstants, RequestPromise, mainWindow, instanceString, jiraIssue);
});

/**
 * Retrieve Pending Reviews
 */
IPC.on("retrieve-pending", function(event, flag) {
  if (flag) {
    reviewProcess.getPending(neDB, APIConstants, AppConstants, RequestPromise, mainWindow);
  } else {
    reviewProcess.retrievePending(neDB, AppConstants, mainWindow);
  }
});

/**
 * Open Review
 */
IPC.on("open-review", function(event, instanceString, reviewID) {
  console.log(new Date().toJSON(), AppConstants.LOG_INFO, "Opening Review:", instanceString + APIConstants.CRUCIBLE_BASE_URL + reviewID);
  ElectronShell.openExternal(instanceString + APIConstants.CRUCIBLE_BASE_URL + reviewID);
});

/**
 * Retrieve Open Reviews
 */
IPC.on("retrieve-open", function(event, flag) {
  if (flag) {
    reviewProcess.getOpen(neDB, APIConstants, AppConstants, RequestPromise, mainWindow);
  } else {
    reviewProcess.retrieveOpen(neDB, AppConstants, mainWindow);
  }
});

/**
 * Retrieve Review Statistics
 */
IPC.on("retrieve-statistics", function(event, flag) {
  if (flag) {
    reviewProcess.getStatistics(neDB, APIConstants, AppConstants, RequestPromise, mainWindow);
  } else {
    reviewProcess.retrieveStatistics(neDB, AppConstants, mainWindow);
  }
});

/**
 * Clear all user details.
 */
IPC.on("logout", function(event, flag) {
  authProcess.logout(neDB, AppConstants);
});
