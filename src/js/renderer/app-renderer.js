/**
 * Reload the current page (force-refresh)
 */
function reloadPage() {
  window.location.reload(true);
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
