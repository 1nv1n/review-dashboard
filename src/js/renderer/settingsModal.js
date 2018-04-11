/**
 * JS for operations on the Settings Modal
 */

/**
 * Launch the 'Settings' modal.
 */
function launchSettingsModal() {
  // Blackout before opening the Modal
  blackout();
  
  // jQuery
  $("#settingsModal").modal({backdrop: false, keyboard: false, show: true});
  // JavaScript var settingsModal = new Modal('#settingsModal', {backdrop: true});
  // settingsModal.show();
}

function dismissSettingsModal() {
  // jQuery
  $("#settingsModal").modal('hide');

  // Display App Wrapper
  removeBlackout();
}

function saveSettings() {
  dismissSettingsModal();
}

function setUserInfo(userID, displayName, avatarURL) {
  console.log(new Date().toJSON(), appConstants.LOG_INFO, "Setting User Info (" + userID + ")");
  document.getElementById("settingUserCardTitle").innerHTML = userID;
  document.getElementById("settingUserCardText").innerHTML = displayName;
  document.getElementById("profilePicture").src = avatarURL;
}