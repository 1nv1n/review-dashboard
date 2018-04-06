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

ipc.on("initial-state", function(event, crucibleServerList, currentUser) {
  console.log(new Date().toJSON(), AppConstants.LOG_INFO, "Retrieved: " + crucibleServerList.length + " Crucible Instances!");

  // Remove existing elements
  var crucibleServerInputDivNode = document.getElementById("crucibleServerInputDiv");
  while (crucibleServerInputDivNode.firstChild) {
    crucibleServerInputDivNode.removeChild(crucibleServerInputDivNode.firstChild);
  }

  // If we have a valid user, populate related data
  if (typeof currentUser !== "undefined" && currentUser !== null) {
    user = currentUser;

    // Add elements from the database
    for (var serverIdx in crucibleServerList) {
      addServerInstanceInput(crucibleServerList[serverIdx]);
    }
  } else {
    // If user does not exist, or is invalid; open the login prompt
    launchLoginModal();
  }
});
