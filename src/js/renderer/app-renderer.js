/**
 * Main JS for the "Renderer".
 * Look at IPC JS for operations stemming from events sent up from the server.
 */

/**
 * Reload the current page (force-refresh)
 */
function reloadPage() {
  window.location.reload(true);
}

/**
 * Backout
 */
function blackout() {
  // Collapse the Sidebar only if it's currently open
  if(document.getElementById("sidebar").classList.contains("active")) {
    document.getElementById("sidebarCollapse").click();
    document.getElementById("sidebar").classList.add("sidebar-clicked");
  }

  var appWrapper = document.getElementById("appWrapper");
  if(!appWrapper.classList.contains("blackout")) {
    appWrapper.classList.add("blackout");
  }
}

/**
 * Remove Backout
 */
function removeBlackout() {
  // Expand the Sidebar only if it was programmatically collapsed
  if(!document.getElementById("sidebar").classList.contains("active") && document.getElementById("sidebar").classList.contains("sidebar-clicked")) {
    document.getElementById("sidebarCollapse").click();
    document.getElementById("sidebar").classList.remove("sidebar-clicked");
  }

  var appWrapper = document.getElementById("appWrapper");
  if(appWrapper.classList.length > 0) {
    appWrapper.classList.remove("blackout");
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
  console.log(new Date().toJSON(), appConstants.LOG_INFO, "Setting User Info (" + userID + ")");
  document.getElementById("userIDLabel").innerHTML = userID;
  document.getElementById("profilePicture").src = avatarURL;
}

/**
 * Toggles Particle JS
 */
function toggleParticles(toggle) {
  if (toggle) {
    particlesJS.load("particles-js", "../src/js/vendor/particles.json", function () {});
  } else {
    pJSDom[0].pJS.fn.vendors.destroypJS();
    pJSDom = [];
  }
}
