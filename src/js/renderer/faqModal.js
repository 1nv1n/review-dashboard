/**
 * JS for operations on the FAQ Modal
 */

/**
 * Launch the 'FAQ' modal.
 */
function launchFAQModal() {
  console.log(new Date().toJSON(), _GLOBAL_APP_CONSTANTS.LOG_INFO, "Launching FAQ Modal.");

  // Blackout before opening the Modal
  blackout();

  // jQuery
  $("#faqModal").modal({
    backdrop: false,
    keyboard: false,
    focus: true,
    show: true
  });
}

/**
 * Dismiss the 'FAQ' modal.
 */
function dismissFAQModal() {
  console.log(new Date().toJSON(), _GLOBAL_APP_CONSTANTS.LOG_INFO, "Dismising FAQ Modal.");

  // jQuery
  $("#faqModal").modal("hide");

  // Display App Wrapper
  removeBlackout();
}