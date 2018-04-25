/**
 * Handles IPC
 */
// Import Electron Dependencies
const Electron = require("electron");
const IPC = Electron.ipcRenderer;
const { BrowserWindow } = require("electron").remote;

/**
 * Triggered on App launch.
 */
IPC.on("initial-state", function(event, _crucibleServerList, currentUser, currentReviewerList, currentProjectKey) {
  console.log(new Date().toJSON(), appConstants.LOG_INFO, "Initial State");

  // Set user
  setCurrentUser(currentUser);

  // Remove existing elements
  removeServerInput();

  // Set the Crucible server list
  setCurrentServerList(_crucibleServerList);

  // Set the current reviewer list
  setCurrentReviewerList(currentReviewerList);

  // Set the current project
  populateReviewInfoDiv(currentProjectKey);

  // If the User does not exist, wait for the Server Modal to close before prompting for login
  $("#serverModal").on("hidden.bs.modal", function(event) {
    if (typeof user === "undefined" || user === null) {
      launchLoginModal();
    }
  });

  // Remove "blackout" if the Server & Login Modals are not open
  if (
    ($("#serverModal").data("bs.modal") === undefined || $("#serverModal").data("bs.modal")._isShown == false) &&
    ($("#loginModal").data("bs.modal") === undefined || $("#loginModal").data("bs.modal")._isShown == false)
  ) {
    removeBlackout();
  }
});

/**
 * Triggered on Ctrl+P hot-key
 */
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
IPC.on("user-info", function(event, _userID, _displayName, _avatarURL) {
  setCurrentUser({ type: "User", userID: _userID, displayName: _displayName, avatarURL: _avatarURL });
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

/**
 * Triggered on review search attempted.
 */
IPC.on("search-results", function(event, couldSearch, reviewData) {
  handleReviewSearch(couldSearch, reviewData);
});

/**
 * Triggered on pending Review retrieval.
 */
IPC.on("retrieved-pending", function(event, pendingReviewList) {
  handlePendingRetrieval(pendingReviewList);
});
