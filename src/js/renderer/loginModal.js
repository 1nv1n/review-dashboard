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

  dismissLoginModal();
}