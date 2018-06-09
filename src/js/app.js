console.time("Startup Time");

// Constants
const FS = require("fs");
const UTIL = require("util");
const URL = require("url");
const PATH = require("path");
const ELECTRON = require("electron");

// Electron Module Imports
const APP = ELECTRON.app;
const IPC = ELECTRON.ipcMain;
const ELECTRON_MENU = ELECTRON.Menu;
const ELECTRON_TRAY = ELECTRON.Tray;
const ELECTRON_SHELL = ELECTRON.shell;
const GLOBAL_SHORTCUT = ELECTRON.globalShortcut;
const ELECTRON_BROWSER_WINDOW = ELECTRON.BrowserWindow;

// Vendor Imports
const NEDB = require("nedb");

// App Constants
const API_CONSTANTS = require("../js/constants/api-constants");
const APP_CONSTANTS = require("../js/constants/app-constants");
const APP_STRING_CONSTANTS = require("../js/constants/app-strings");

// Main (Background) Processes
const SERVER_PROCESS = require("../js/main/server");
const AUTH_PROCESS = require("../js/main/authentication");
const USER_PROCESS = require("../js/main/user");
const REVIEW_PROCESS = require("../js/main/review");

// Log Constants
const LOG_FILE = FS.createWriteStream("debug.log", {
  flags: "w"
});
const LOG_STD_OUT = process.stdout;
console.log = function formatConsoleLog() {
  LOG_FILE.write(UTIL.format.apply(null, arguments) + "\n");
  LOG_STD_OUT.write(UTIL.format.apply(null, arguments) + "\n");
};
console.error = console.log;
console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "Logging Initialized.");

// Uncomment for hot-reload:
// import { enableLiveReload } from 'electron-compile';
// enableLiveReload();

// App's system tray variable
let appTray;

// Keep a global reference of the window object otherwise the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

const ElectronContextMenu = ELECTRON_MENU.buildFromTemplate([{
  label: APP_STRING_CONSTANTS.APP_NAME,
  click: () => {
    mainWindow.show();
  }
}, {
  label: "Quit",
  click: () => {
    APP.isQuiting = true;
    APP.quit();
  }
}]);

// Create/Autoload the Database at the 'User Data' directory.
// On Windows: "C:\Users\<USER>\AppData\Roaming\ReviewDashboard"
const neDB = new NEDB({
  filename: APP.getPath("userData") + "/review-dash.db",
  autoload: true
});

// Save the default (or first) instance server string
let crucibleServerInstance;

// Save the current user
let currentUser;

// Particles
let particlesEnabled = false;

/**
 * Launched when the Main Window is "ready-to-show".
 */
function initialize() {
  console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "createMainWindow()");
  // TODO: Refactor to not have so many nested calls.
  // Start by attempting to retrieve the list of Crucible Servers
  SERVER_PROCESS.retrieveCrucibleServerList(neDB, APP_CONSTANTS).then((crucibleServerList) => {
    // Then, retrieve the user information
    USER_PROCESS.retrieveUser(neDB).then((user) => {
      currentUser = user;
      // Then, retrieve the list of saved reviewers
      USER_PROCESS.retrieveReviewerList(neDB).then((reviewerList) => {
        // Then, retrieve the saved Project Type key
        USER_PROCESS.retrieveProjectKey(neDB).then((projectKey) => {
          mainWindow.webContents.send("initial-state", crucibleServerList, user, reviewerList, projectKey);
        }, (err) => {
          console.log(new Date().toJSON(), APP_CONSTANTS.LOG_ERROR, "initialize():retrieveProjectKey:", err);
          mainWindow.webContents.send("initial-state", [], null, [], null);
        });
      }, (err) => {
        console.log(new Date().toJSON(), APP_CONSTANTS.LOG_ERROR, "initialize():retrieveReviewerList:", err);
        mainWindow.webContents.send("initial-state", [], null, [], null);
      });
    }, (err) => {
      console.log(new Date().toJSON(), APP_CONSTANTS.LOG_ERROR, "initialize():retrieveUser:", err);
      mainWindow.webContents.send("initial-state", [], null, [], null);
    });
  }, (err) => {
    console.log(new Date().toJSON(), APP_CONSTANTS.LOG_ERROR, "initialize():retrieveCrucibleServerList:", err);
    mainWindow.webContents.send("initial-state", [], null, [], null);
  });
}

// Create the main browser window
function createMainWindow() {
  console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "createMainWindow()");
  mainWindow = new ELECTRON_BROWSER_WINDOW({
    width: 1860, // 1920
    minWidth: 1860,
    height: 840, // 1080
    minHeight: 840,
    icon: PATH.join(__dirname, "../../resources/icons", "app.ico"),
    show: false,
    backgroundColor: "#1E1E1E",
    toolbar: false,
    frame: false,
    titleBarStyle: "hidden-inset"
  });

  ELECTRON_MENU.setApplicationMenu(null);

  appTray = new ELECTRON_TRAY(PATH.join(__dirname, "../../resources/icons", "app.ico"));
  appTray.setContextMenu(ElectronContextMenu);
  appTray.setToolTip("Review Dashboard");

  appTray.on("click", () => {
    console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "appTray", "click");
    mainWindow.show();
  });

  appTray.on("double-click", () => {
    console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "appTray", "double-click");
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
    console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "mainWindow", "ready-to-show");
    mainWindow.show();
    mainWindow.focus();
    initialize();
  });

  // Emitted when external links are clicked
  mainWindow.webContents.on("new-window", (functionEvent, url) => {
    console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "mainWindow", "new-window");
    let urlToOpen = url;
    const APP_URL = URL.format({
      pathname: PATH.join(__dirname, "/"),
      protocol: "file:",
      slashes: true
    }).replace(/\\/g, "/");

    urlToOpen = url.substring(APP_URL.length + 3);
    urlToOpen = url.slice(0, -3);
    functionEvent.preventDefault();
    ELECTRON_SHELL.openExternal(urlToOpen);
  });

  // Emitted on '-' (Minimize) Click on the Main Window
  mainWindow.on("minimize", (event) => {
    console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "mainWindow", "minimize");
    event.preventDefault();
    mainWindow.hide();
  });

  // Emitted when the Main Window is going to be closed
  mainWindow.on("close", (event) => {
    console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "mainWindow", "close");
    // if (!App.isQuiting) {
    //   event.preventDefault();
    //   mainWindow.hide();
    // }
    // return false;

    APP.isQuiting = true;
    APP.quit();
  });

  // Emitted when the window is closed.
  mainWindow.on("closed", (mainWindowOnClosed) => {
    console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "mainWindow", "closed");
    // Dereference the window object.
    mainWindow = null;
  });

  mainWindow.webContents.on("will-navigate", (event, url) => {
    console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "mainWindow", "will-navigate", url);
    event.preventDefault();
    ELECTRON_SHELL.openExternal(url);
  });
};

// Register Global Shortcut Commands
function registerGlobalShortcuts() {
  console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "registerGlobalShortcuts()", "Registering Global Shortcuts");

  // Register the Debug (Ctrl+D) shortcut
  GLOBAL_SHORTCUT.register("CommandOrControl+D", () => {
    // Launch DevTools if it is not currently open, close it if it is open.
    if (mainWindow.webContents.isDevToolsOpened()) {
      mainWindow.webContents.closeDevTools();
    } else {
      mainWindow.webContents.openDevTools({
        mode: "detach"
      });
    }
  });

  // Register the Particles JS (Ctrl+P) shortcut
  GLOBAL_SHORTCUT.register("CommandOrControl+P", () => {
    particlesEnabled = !particlesEnabled;
    mainWindow.webContents.send("toggle-particles", particlesEnabled);
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
APP.on("ready", (appReady) => {
  console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "app-ready");

  APP.setAppUserModelId("com.reviewdashboard");

  // Create the Main Window
  createMainWindow();

  // Register Global Shortcuts
  registerGlobalShortcuts();

  // Clear out thumbnail toolbar buttons
  mainWindow.setThumbarButtons([]);

  // Clear App Taskbar Tasks
  APP.setUserTasks([]);

  // Enforce single instance
  APP.makeSingleInstance((commandLine, workingDirectory) => {
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }

    mainWindow.focus();
  });

  // End Init Time Log
  console.timeEnd("Startup Time");
});

// Quit when all windows are closed.
APP.on("window-all-closed", (appAllWindowsClosed) => {
  console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "APP", "window-all-closed");

  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    APP.quit();
  }
});

APP.on("activate", (appActivate) => {
  console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "APP", "activate");

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (process.platform === "darwin" && mainWindow === null) {
    createMainWindow();
  }
});

/**
 * Save the input Crucible server list
 */
IPC.on("save-crucible-server-list", (event, crucibleServerList) => {
  console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "IPC", "save-crucible-server-list");
  crucibleServerInstance = crucibleServerList[0];
  SERVER_PROCESS.saveCrucibleServerList(neDB, mainWindow, crucibleServerList);
});

/**
 * Attemt to log the user in & save the authentication token.
 */
IPC.on("login-attempt", (event, userID, password) => {
  console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "IPC", "login-attempt");
  AUTH_PROCESS.authenticateUser(neDB, mainWindow, userID, password);
  USER_PROCESS.saveUserInfo(neDB, mainWindow, userID, crucibleServerInstance).then(
    (user) => {
      currentUser = user;
    },
    (err) => {
      console.log(new Date().toJSON(), APP_CONSTANTS.LOG_ERROR, "IPC", "login-attempt", err);
    }
  );
});

/**
 * Attemt to create a review.
 */
IPC.on("create-review", (event, currentCrucibleServerInstance, projectKey, reviewName, reviewDesc, jiraKey, allowReviewersToJoin, reviewerList) => {
  console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "IPC", "create-review");
  USER_PROCESS.saveReviewerDetails(neDB, reviewerList);
  USER_PROCESS.saveProjectDetails(neDB, projectKey);
  REVIEW_PROCESS.createReview(
    neDB,
    mainWindow,
    currentCrucibleServerInstance,
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
IPC.on("search-review", (event, instanceString, jiraIssue) => {
  console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "IPC", "search-review");
  REVIEW_PROCESS.searchByJIRA(mainWindow, instanceString, jiraIssue);
});

/**
 * Open Review
 */
IPC.on("open-review", (event, instanceString, reviewID) => {
  console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "IPC", "Opening Review:", instanceString + API_CONSTANTS.CRUCIBLE_BASE_URL + reviewID);
  ELECTRON_SHELL.openExternal(instanceString + API_CONSTANTS.CRUCIBLE_BASE_URL + reviewID);
});

/**
 * Retrieve Pending Reviews
 */
IPC.on("retrieve-pending", (event, flag) => {
  console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "IPC", "retrieve-pending");
  if (flag) {
    REVIEW_PROCESS.getPending(neDB, mainWindow);
  } else {
    REVIEW_PROCESS.retrievePending(neDB, mainWindow);
  }
});

/**
 * Retrieve Open Reviews
 */
IPC.on("retrieve-open", (event, flag) => {
  console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "IPC", "retrieve-open");
  if (flag) {
    REVIEW_PROCESS.getOpen(neDB, mainWindow);
  } else {
    REVIEW_PROCESS.retrieveOpen(neDB, mainWindow);
  }
});

/**
 * Retrieve Review Statistics
 */
IPC.on("retrieve-statistics", (event, flag) => {
  console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "IPC", "retrieve-statistics");
  if (flag) {
    REVIEW_PROCESS.getStats(neDB, mainWindow, currentUser);
  } else {
    REVIEW_PROCESS.retrieveStats(neDB, mainWindow);
  }
});

/**
 * Complete a Review
 */
IPC.on("complete-review", (event, instanceString, reviewID) => {
  REVIEW_PROCESS.completeReview(neDB, mainWindow, instanceString, reviewID);
});

/**
 * Close a Review
 */
IPC.on("close-review", (event, instanceString, reviewID) => {
  REVIEW_PROCESS.closeReview(neDB, mainWindow, instanceString, reviewID);
});

/**
 * Remind Reviewers
 */
IPC.on("remind-reviewers", (event, instanceString, reviewID) => {
  REVIEW_PROCESS.remindReviewers(neDB, mainWindow, instanceString, reviewID);
});

/**
 * Clear all user details.
 */
IPC.on("logout", (event, flag) => {
  console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "IPC", "logout");
  AUTH_PROCESS.logout(neDB);
});