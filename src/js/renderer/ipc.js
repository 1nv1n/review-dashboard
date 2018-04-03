/**
 * Handles IPC
 */
// Import Electron Dependencies
const electron = require("electron");
const ipc = electron.ipcRenderer;

ipc.on("initial-crucible-server-list", function(event, crucibleServerList) {
  console.log(new Date().toJSON(), AppConstants.LOG_INFO, "Retrieved: " + crucibleServerList.length + " Crucible Instances!");

  // Remove existing elements
  var crucibleServerInputDivNode = document.getElementById("crucibleServerInputDiv");
  while (crucibleServerInputDivNode.firstChild) {
    crucibleServerInputDivNode.removeChild(crucibleServerInputDivNode.firstChild);
  }

  // Add elements from the database
  for (var serverIdx in crucibleServerList) {
    addServerInstanceInput(crucibleServerList[serverIdx]);
  }
});