/**
 * Main JS for the "Renderer".
 * Look at IPC JS for operations stemming from events sent up from the server.
 */

// Is App Maximized
var isAppMaximized = false;

/**
 * App Minimize
 */
function minimizeApp() {
  console.log(new Date().toJSON(), appConstants.LOG_INFO, "Minimizing App.");
  BrowserWindow.getFocusedWindow().minimize();
}

/**
 * App Maximize
 */
function maximizeApp() {
  if (isAppMaximized) {
    console.log(new Date().toJSON(), appConstants.LOG_INFO, "Restoring App.");
    BrowserWindow.getFocusedWindow().restore();
    isAppMaximized = false;
  } else {
    console.log(new Date().toJSON(), appConstants.LOG_INFO, "Maximizing App.");
    BrowserWindow.getFocusedWindow().maximize();
    isAppMaximized = true;
  }
}

/**
 * Close the App.
 */
function closeApp() {
  console.log(new Date().toJSON(), appConstants.LOG_INFO, "Quitting App.");
  BrowserWindow.getFocusedWindow().close();
}

/**
 * Reload the current page (force-refresh)
 */
function reloadPage() {
  console.log(new Date().toJSON(), appConstants.LOG_INFO, "HTML Reload.");
  window.location.reload(true);
}

/**
 * Backout
 */
function blackout() {
  console.log(new Date().toJSON(), appConstants.LOG_INFO, "Blackout.");
  // Attempt to collapse the Sidebar only if it's currently open
  if (document.getElementById("sidebar").classList.contains("active")) {
    document.getElementById("sidebarCollapse").click();
    document.getElementById("sidebar").classList.add("sidebar-clicked");
  }

  var appWrapper = document.getElementById("appWrapper");
  if (!appWrapper.classList.contains("blackout")) {
    appWrapper.classList.add("blackout");
  }
}

/**
 * Remove Backout
 */
function removeBlackout() {
  console.log(new Date().toJSON(), appConstants.LOG_INFO, "Revert Blackout.");
  // Expand the Sidebar only if it was programmatically collapsed
  //if(!document.getElementById("sidebar").classList.contains("active") && document.getElementById("sidebar").classList.contains("sidebar-clicked")) {
  //  document.getElementById("sidebarCollapse").click();
  //  document.getElementById("sidebar").classList.remove("sidebar-clicked");
  //}

  var appWrapper = document.getElementById("appWrapper");
  if (appWrapper.classList.length > 0) {
    appWrapper.classList.remove("blackout");
  }
}

/**
 * Logout & clear DB
 */
function logout() {
  console.log(new Date().toJSON(), appConstants.LOG_INFO, "Logout Attempted.");
  IPC.send("logout", 1);

  // Remove existing elements
  removeServerInput();

  // Launch the Server Modal
  launchServerModal();
  addServerInstanceInput(null);

  // Login Modal after Server details are entered
  $("#serverModal").on("hidden.bs.modal", function(e) {
    launchLoginModal();
  });
}

/**
 * Sets the current user.
 *
 * @param {*} currentUser
 */
function setCurrentUser(currentUser) {
  if (typeof currentUser !== "undefined" && currentUser !== null) {
    console.log(new Date().toJSON(), appConstants.LOG_INFO, "Setting User:" + currentUser.userID);

    user = currentUser;
    setUserInfo(user.userID, user.displayName, user.avatarURL);
  } else {
    console.log(new Date().toJSON(), appConstants.LOG_INFO, "User not defined!");
  }
}

/**
 * Set the user information to the modal as a header.
 *
 * @param {String} userID
 * @param {String} displayName
 * @param {String} avatarURL
 */
function setUserInfo(userID, displayName, avatarURL) {
  document.getElementById("userIDLabel").innerHTML = userID;
  document.getElementById("profilePicture").src = avatarURL;
}

/**
 * Sets the current Reviewer list.
 * 
 * @param {*} currentReviewerList 
 */
function setCurrentReviewerList(currentReviewerList) {
  console.log(new Date().toJSON(), appConstants.LOG_INFO, "Setting" + currentReviewerList + "Reviewers.");
  reviewerList = [];
  currentReviewerList.forEach(function(element) {
    reviewerList.push(element.reviewer);
  });
}

/**
 * Toggles Particle JS
 */
function toggleParticles(toggle) {
  if (toggle) {
    console.log(new Date().toJSON(), appConstants.LOG_INFO, "Particles JS Enabled.");
    particlesJS.load("particles-js", "../src/js/vendor/particles.json", function() {});
  } else {
    console.log(new Date().toJSON(), appConstants.LOG_INFO, "Particles JS Disabled.");
    pJSDom[0].pJS.fn.vendors.destroypJS();
    pJSDom = [];
  }
}
