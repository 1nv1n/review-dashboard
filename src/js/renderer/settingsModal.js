/**
 * JS for operations on the Settings Modal
 */

/**
 * Launch the 'Settings' modal.
 */
function launchSettingsModal() {
  console.log(new Date().toJSON(), _GLOBAL_APP_CONSTANTS.LOG_INFO, "Launching Settings Modal.");

  // Blackout before opening the Modal
  blackout();

  // jQuery
  $("#settingsModal").modal({
    backdrop: false,
    keyboard: false,
    focus: true,
    show: true
  });
}

/**
 * Dismiss the 'Settings' modal.
 */
function dismissSettingsModal() {
  console.log(new Date().toJSON(), _GLOBAL_APP_CONSTANTS.LOG_INFO, "Dismising Settings Modal.");

  // jQuery
  $("#settingsModal").modal("hide");

  // Display App Wrapper
  removeBlackout();
}

/**
 * Save the settings
 */
function saveSettings() {
  console.log(new Date().toJSON(), _GLOBAL_APP_CONSTANTS.LOG_INFO, "Attempting to Save Settings.");
  // Save to server (app.js) needs implementation.

  // Dismiss the modal
  dismissSettingsModal();
}