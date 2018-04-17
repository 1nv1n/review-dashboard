/**
 * JS for operations on the Login Modal
 */

/**
 * Launch the 'Login' modal.
 */
function launchLoginModal() {
  // jQuery
  $("#loginModal").modal({ backdrop: false, keyboard: false, show: true });
  // JavaScript
  // var loginModal = new Modal('#loginModal', {backdrop: true});
  // loginModal.show();

  // Blackout before opening the Modal
  blackout();
}

/**
 * Dismiss the 'Login' modal.
 */
function dismissLoginModal() {
  // jQuery
  $("#loginModal").modal('hide');

  // Display App Wrapper
  removeBlackout();
}

/**
 * Attempt to log in using the provided credentials
 */
function login() {
   // Send the user:pass to the background process for authentication
   IPC.send("login-attempt", document.getElementById("userID").value, document.getElementById("password").value);

  // Clear username & password values
  document.getElementById("userID").value = "";
  document.getElementById("password").value = "";
}

/**
 * Handle the attempted log-in
 */
function loginInAttempted(isAuthenticated) {
  console.log(new Date().toJSON(), appConstants.LOG_INFO, "LoginIn Attempt Response: " + isAuthenticated);
  if(isAuthenticated) {
    dismissLoginModal();
  } else {
    // TODO
  }
}