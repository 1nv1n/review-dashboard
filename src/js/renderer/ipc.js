/**
 * Handles IPC
 */
// Import Electron Dependencies
const electron = require("electron");
const ipc = electron.ipcRenderer;

// Main list of Crucible Server instances
var crucibleServerList;

// Main user object
var user;

/**
 * Triggered on App launch.
 */
ipc.on("initial-state", function(event, crucibleServerList, currentUser) {
  console.log(new Date().toJSON(), AppConstants.LOG_INFO, "Retrieved: " + crucibleServerList.length + " Crucible Instances!");

  var doesUserExist = false;
  if (typeof currentUser !== "undefined" && currentUser !== null) {
    user = currentUser;
    doesUserExist = true;
  }

  // Remove existing elements
  var crucibleServerInputDivNode = document.getElementById("crucibleServerInputDiv");
  while (crucibleServerInputDivNode.firstChild) {
    crucibleServerInputDivNode.removeChild(crucibleServerInputDivNode.firstChild);
  }

  // If any saved Crucible server instances were sent up, populate them onto the modal.
  // Else, prompt for them
  if(typeof crucibleServerList === "undefined" || crucibleServerList == null || crucibleServerList.length == 0) {
    // Launch the Server Modal
    launchServerModal();
  } else {
    // Add elements from the database
    for (var serverIdx in crucibleServerList) {
      addServerInstanceInput(crucibleServerList[serverIdx]);
    }
  }

  // If the User does not exist, wait for the Server Modal to close before prompting for login
  if(!doesUserExist) {
    $("#serverModal").on('hidden.bs.modal', function (e) {
      launchLoginModal();
    })
  }
});

ipc.on("log-in-attempted", function(event, isAuthenticated) {
  console.log(new Date().toJSON(), AppConstants.LOG_INFO, "log-in-attempted: " + isAuthenticated);
  if(isAuthenticated) {
    dismissLoginModal();
  } else {
    // TODO
  }
});