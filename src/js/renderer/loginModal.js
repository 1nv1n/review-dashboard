/**
 * JS for operations on the Login Modal
 */

/**
 * Launch the 'Login' modal.
 */
function launchLoginModal() {
  console.log(new Date().toJSON(), appConstants.LOG_INFO, "Launching the Login Modal.");

  // Blackout before opening the Modal
  blackout();

  // jQuery
  $("#loginModal").modal({ backdrop: false, keyboard: false, focus: true, show: true });
  $("#loginModal").on("shown.bs.modal", function(event) {
    document.getElementById("userID").focus();
  });
}

/**
 * Dismiss the 'Login' modal.
 */
function dismissLoginModal() {
  console.log(new Date().toJSON(), appConstants.LOG_INFO, "Dismissing the Login Modal.");

  // jQuery
  $("#loginModal").modal("hide");

  // Display App Wrapper
  removeBlackout();
}

/**
 * Attempt to log in using the provided credentials
 */
function login() {
  console.log(new Date().toJSON(), appConstants.LOG_INFO, "Attempting to Login.");

  // Send the user:pass to the background process for authentication
  IPC.send("login-attempt", document.getElementById("userID").value, document.getElementById("password").value);

  // Remove the 'Sign In' Icon
  removeSignInIcon(document.getElementById("loginIcon").classList);

  // Add the spinner
  addSpinner(document.getElementById("loginIcon").classList);
}

/**
 * Sets the User ID & the Password Input boxes to "".
 */
function clearIDPassInput() {
  document.getElementById("userID").value = "";
  document.getElementById("password").value = "";
}

/**
 * Handle the attempted log-in
 */
function loginInAttempted(isAuthenticated) {
  console.log(new Date().toJSON(), appConstants.LOG_INFO, "Login Response: " + isAuthenticated);

  // Remove the spinner
  removeSpinner(document.getElementById("loginIcon").classList);

  // Add the 'Sign In' Icon
  addSignInIcon(document.getElementById("loginIcon").classList);

  // If authenticated, dismiss the Modal
  if (isAuthenticated) {
    // Clear username & password values
    clearIDPassInput();

    // Restore Button & Review Div Containers
    showContentContainer();

    // Retrieve Pending & Open Reviews from the Database
    getPendingOpenReviews();

    // Dismiss the Modal.
    dismissLoginModal();
  } else {
    // TODO
  }
}

/**
 * Adds the Font Awesome 'Sign In' icon to the provided element.
 *
 * @param {*} elementClassList
 */
function addSignInIcon(elementClassList) {
  elementClassList.add("fa");
  elementClassList.add("fa-sign-in");
}

/**
 * Removes the Font Awesome 'Sign In' icon from the provided element.
 *
 * @param {*} elementClassList
 */
function removeSignInIcon(elementClassList) {
  elementClassList.remove("fa");
  elementClassList.remove("fa-sign-in");
}
