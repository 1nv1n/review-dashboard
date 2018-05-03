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

  // Determine & set the user if defined
  var isUserDefined = false;
  if (typeof currentUser !== "undefined" && currentUser !== null) {
    isUserDefined = true;
    setCurrentUser(currentUser);
  } else {
    setCurrentUser(null);
  }

  // Remove existing elements
  removeServerInput();

  // Determine & set the server list if defined
  var isServerListDefined = false;
  if (typeof _crucibleServerList !== "undefined" && _crucibleServerList !== null && _crucibleServerList.length > 0) {
    isServerListDefined = true;
    setCurrentServerList(_crucibleServerList);
  } else {
    setCurrentServerList([]);
  }

  // Set the current reviewer list
  setCurrentReviewerList(currentReviewerList);

  // Set the current project
  populateReviewInfoDiv(currentProjectKey);

  // If the User & the Server list is defined, set the Content & retrieve Pending & Open Reviews.
  if (isUserDefined && isServerListDefined) {
    // Restore Button & Review Div Containers
    showContentContainer();

    // Retrieve Pending & Open Reviews from the Database
    retrievePendingOpenReviews();
  }

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
IPC.on("save-server-list", function(event, currentCrucibleServerList) {
  handleServerListSave(currentCrucibleServerList);
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
 * Triggered on Pending Review retrieval.
 */
IPC.on("retrieved-pending", function(event, pendingReviewList) {
  handlePendingRetrieval(pendingReviewList);
});

/**
 * Triggered on Open Review retrieval.
 */
IPC.on("retrieved-open", function(event, openReviewList) {
  handleOpenRetrieval(openReviewList);
});

/**
 * Send the "clicked" item to the main process.
 *
 * @param {*} clickedItem
 */
function handleDoubleClick(clickedItem) {
  IPC.send("open-review", clickedItem.item.instance, clickedItem.item.reviewID);
}
