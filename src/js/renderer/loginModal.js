/**
 * JS for operations on the Login Modal
 */

/**
 * Launch the 'Login' modal.
 */
function launchLoginModal() {
  // jQuery
  $("#loginModal").modal({ backdrop: false, keyboard: false, show: true });

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

   // Add the spinner
   var loginIconClassList = document.getElementById("loginIcon").classList;
   loginIconClassList.remove("fa");
   loginIconClassList.remove("fa-sign-in");
   loginIconClassList.add("fas");
   loginIconClassList.add("fa-circle-notch");
   loginIconClassList.add("fa-spin");

  // Clear username & password values
  document.getElementById("userID").value = "";
  document.getElementById("password").value = "";
}

/**
 * Handle the attempted log-in
 */
function loginInAttempted(isAuthenticated) {
  console.log(new Date().toJSON(), appConstants.LOG_INFO, "LoginIn Attempt Response: " + isAuthenticated);

  // Remove the spinner
  var loginIconClassList = document.getElementById("loginIcon").classList;
  loginIconClassList.remove("fas");
  loginIconClassList.remove("fa-circle-notch");
  loginIconClassList.remove("fa-spin");
  loginIconClassList.add("fa");
  loginIconClassList.add("fa-sign-in");

  // If authenticated, dismiss the Modal
  if(isAuthenticated) {
    dismissLoginModal();
  } else {
    // TODO
  }
}