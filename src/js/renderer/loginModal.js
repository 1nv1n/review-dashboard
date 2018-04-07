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
  // var serverModal = new Modal('#serverModal', {backdrop: true});
  // serverModal.show();
}

/**
 * Dismiss the 'Login' modal.
 */
function dismissLoginModal() {
  // jQuery
  $("#loginModal").modal('hide');
}

/**
 * Attempt to log in using the provided credentials
 */
function login() {
   // Send the user:pass to the background process for authentication
  ipc.send("login-attempt", document.getElementById("userID").value, document.getElementById("password").value);

  // Clear username & password values
  document.getElementById("userID").value = "";
  document.getElementById("password").value = "";
}