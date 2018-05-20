/**
 * Handles IPC
 */

// Import Electron Dependencies
const ELECTRON = require("electron");

const IPC = ELECTRON.ipcRenderer;

/**
 * Triggered on App launch.
 */
IPC.on("initial-state", (event, retrievedServerList, currentUser, currentReviewerList, currentProjectKey) => {
  console.log(new Date().toJSON(), _GLOBAL_APP_CONSTANTS.LOG_INFO, "IPC", "Initial State");

  // Determine & set the user if defined
  let isUserDefined = false;
  if (typeof currentUser !== "undefined" && currentUser !== null) {
    isUserDefined = true;
    setCurrentUser(currentUser);
  } else {
    setCurrentUser(null);
  }

  // Remove existing elements
  removeServerInput();

  // Determine & set the server list if defined
  let isServerListDefined = false;
  if (typeof retrievedServerList !== "undefined" && retrievedServerList !== null && retrievedServerList.length > 0) {
    isServerListDefined = true;
    setCurrentServerList(retrievedServerList);
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

    // Retrieve Review Data from the Database
    retrieveReviewData();
  }

  // If the User does not exist, wait for the Server Modal to close before prompting for login
  $("#serverModal").on("hidden.bs.modal", function onServerModalHide(event) {
    console.log(new Date().toJSON(), _GLOBAL_APP_CONSTANTS.LOG_INFO, "onServerModalHide");
    if (typeof _GLOBAL_USER === "undefined" || _GLOBAL_USER === null) {
      launchLoginModal();
    }
  });

  // Remove "blackout" if the Server & Login Modals are not open
  if (
    ($("#serverModal").data("bs.modal") === undefined || $("#serverModal").data("bs.modal")._isShown === false) &&
    ($("#loginModal").data("bs.modal") === undefined || $("#loginModal").data("bs.modal")._isShown === false)
  ) {
    removeBlackout();
  }
});

/**
 * Triggered on Ctrl+P hot-key
 */
IPC.on("toggle-particles", (event, toggle) => {
  toggleParticles(toggle);
});

/**
 * Triggered on attempted authentication.
 */
IPC.on("log-in-attempted", (event, isAuthenticated) => {
  loginInAttempted(isAuthenticated);
});

/**
 * Triggered on user info retrieval.
 */
IPC.on("user-info", (event, _userID, _displayName, _avatarURL) => {
  setCurrentUser({
    type: "User",
    userID: _userID,
    displayName: _displayName,
    avatarURL: _avatarURL
  });
});

/**
 * Triggered on server-list save.
 */
IPC.on("save-server-list", (event, currentCrucibleServerList) => {
  handleServerListSave(currentCrucibleServerList);
});

/**
 * Triggered on review creation attempted.
 */
IPC.on("review-created", (event, isCreated, reviewID) => {
  handleReviewCreated(isCreated, reviewID);
});

/**
 * Triggered on review search attempted.
 */
IPC.on("search-results", (event, couldSearch, reviewData) => {
  handleReviewSearch(couldSearch, reviewData);
});

/**
 * Triggered on Pending Review retrieval.
 */
IPC.on("retrieved-pending", (event, pendingReviewList) => {
  handlePendingRetrieval(pendingReviewList);
});

/**
 * Triggered on Open Review retrieval.
 */
IPC.on("retrieved-open", (event, openReviewList) => {
  handleOpenRetrieval(openReviewList);
});

/**
 * Triggered on Reviewer Statistics retrieval.
 */
IPC.on("retrieved-reviewer-statistics", (event, reviewerList) => {
  handleStatRetrieval(reviewerList);
});

/**
 * Triggered on Review Statistics retrieval.
 */
IPC.on("retrieved-review-statistics", (event, reviewList) => {
  handleReviewStatRetrieval(reviewList);
});

/**
 * Send the "clicked" item to the main process.
 *
 * @param {*} clickedItem
 */
function handleDoubleClick(clickedItem) {
  IPC.send("open-review", clickedItem.item.instance, clickedItem.item.reviewID);
}