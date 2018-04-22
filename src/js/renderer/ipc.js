/**
 * Handles IPC
 */
// Import Electron Dependencies
const Electron = require("electron");
const IPC = Electron.ipcRenderer;
const {BrowserWindow} = require("electron").remote;

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
IPC.on("initial-state", function(event, _crucibleServerList, currentUser, currentReviewerList, currentProjectKey) {
  console.log(new Date().toJSON(), appConstants.LOG_INFO, "Retrieved: " + _crucibleServerList.length + " Crucible Instances.");

  if (typeof currentUser !== "undefined" && currentUser !== null) {
    console.log(new Date().toJSON(), appConstants.LOG_INFO, "Retrieved User:" + currentUser.userID);
    
    user = currentUser;
    setUserInfo(user.userID, user.displayName, user.avatarURL);
  } else {
    console.log(new Date().toJSON(), appConstants.LOG_INFO, "User not defined!");
  }

  // Remove existing elements
  removeServerInput();

  // If any saved Crucible server instances were sent up, populate them onto the modal.
  // Else, prompt for them
  if(typeof _crucibleServerList === "undefined" || _crucibleServerList == null || _crucibleServerList.length == 0) {
    // Launch the Server Modal
    launchServerModal();
    addServerInstanceInput(null);
  } else {
    // Set to current list
    crucibleServerList = _crucibleServerList;
    // Add elements from the database
    for (var serverIdx in _crucibleServerList) {
      addServerInstanceInput(_crucibleServerList[serverIdx]);
    }
  }

  // Set the current reviewer list
  reviewerList = currentReviewerList;

  // Set the current project
  populateReviewInfoDiv(currentProjectKey);

  // If the User does not exist, wait for the Server Modal to close before prompting for login
  $("#serverModal").on('hidden.bs.modal', function (e) {
    if(typeof user === "undefined" || user === null) {
      launchLoginModal();
    }
  })

  if((($("#serverModal").data('bs.modal') === undefined) || (($("#serverModal").data('bs.modal'))._isShown == false)) && (($("#loginModal").data('bs.modal') === undefined) || (($("#loginModal").data('bs.modal'))._isShown == false))) {
    removeBlackout();
  }
});

/**
 * Logout & clear DB
 */
function logout() {
  IPC.send("logout", 1);

  // Remove existing elements
  removeServerInput();

  // Launch the Server Modal
  launchServerModal();
  addServerInstanceInput(null);

  // Login Modal after Server details are entered
  $("#serverModal").on('hidden.bs.modal', function (e) {
    launchLoginModal();
  });
}

IPC.on("toggle-particles", function(event, toggle) {
  toggleParticles(toggle);
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

/**
 * Triggered on server-list save.
 */
IPC.on("save-server-list", function(event, isSaved) {
  handleServerListSave(isSaved);
});

/**
 * Triggered on review creation attempted.
 */
IPC.on("review-created", function(event, isCreated, reviewID) {
  handleReviewCreated(isCreated, reviewID);
});