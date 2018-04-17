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
  var appWrapper = document.getElementById("appWrapper");
  if(!appWrapper.classList.contains("blackout")) {
    appWrapper.classList.add("blackout");
  }
}

/**
 * Remove Backout
 */
function removeBlackout() {
  var appWrapper = document.getElementById("appWrapper");
  if(appWrapper.classList.length > 0) {
    appWrapper.classList.remove("blackout");
  }
}
