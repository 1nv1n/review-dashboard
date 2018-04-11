/**
 * Handles IPC
 */
// Import Electron Dependencies
const Electron = require("electron");
const IPC = Electron.ipcRenderer;
const {BrowserWindow} = require("electron").remote;

// Main list of Crucible Server instances
var crucibleServerList;

// Main user object
var user;

// Is App Maximized
var isAppMaximized = false;

/**
 * App Minimize
 */
function minimizeApp() {
  BrowserWindow.getFocusedWindow().minimize();
}

/**
 * App Maximize
 */
function maximizeApp() {
  if(isAppMaximized) {
    BrowserWindow.getFocusedWindow().restore();
    isAppMaximized = false;
  } else {
    BrowserWindow.getFocusedWindow().maximize();
    isAppMaximized = true;
  }
}

/**
 * App Maximize
 */
function closeApp() {
  BrowserWindow.getFocusedWindow().close();
}

/**
 * Triggered on App launch.
 */
IPC.on("initial-state", function(event, crucibleServerList, currentUser) {
  console.log(new Date().toJSON(), appConstants.LOG_INFO, "Retrieved: " + crucibleServerList.length + " Crucible Instances & User: " + currentUser.userID);

  var doesUserExist = false;
  if (typeof currentUser !== "undefined" && currentUser !== null) {
    console.log(new Date().toJSON(), appConstants.LOG_INFO, "User not defined!");
    user = currentUser;
    doesUserExist = true;
    setUserInfo(user.userID, user.displayName, user.avatarURL);
  }

  // Remove existing elements
  removeServerInput();

  // If any saved Crucible server instances were sent up, populate them onto the modal.
  // Else, prompt for them
  if(typeof crucibleServerList === "undefined" || crucibleServerList == null || crucibleServerList.length == 0) {
    // Launch the Server Modal
    launchServerModal();
    addServerInstanceInput(null);
  } else {
    // Add elements from the database
    for (var serverIdx in crucibleServerList) {
      addServerInstanceInput(crucibleServerList[serverIdx]);
    }
  }

  // If the User does not exist, wait for the Server Modal to close before prompting for login
  if(!doesUserExist) {
    $("#serverModal").on('hidden.bs.modal', function (e) {
      launchLoginModal();
    })
  }

  if((($("#serverModal").data('bs.modal') === undefined) || (($("#serverModal").data('bs.modal'))._isShown == false)) && (($("#loginModal").data('bs.modal') === undefined) || (($("#loginModal").data('bs.modal'))._isShown == false))) {
    removeBlackout();
  }
});

/**
 * Triggered on attempted authentication.
 */
IPC.on("log-in-attempted", function(event, isAuthenticated) {
  loginInAttempted(isAuthenticated);
});

/**
 * Triggered on user info retrieval.
 */
IPC.on("user-info", function(event, userID, displayName, avatarURL) {
  setUserInfo(userID, displayName, avatarURL);
});