/**
 * Handles IPC
 */
// Import Electron Dependencies
const electron = require("electron");
const ipc = electron.ipcRenderer;

ipc.on("initial-state", function(event, statusFlag) {
  
});

// // Export all IPC functions.
// module.exports = {
//   // Fired when "initial-state" is sent up
//   initialState_IPC: ipc.on("initial-state", function(event, savedCrucibleRecords, savedReviewerList) {

//   }),

//   loginResponse_IPC: ipc.on("login-response", function(event, statusFlag) {

//   }),

//   retrievedCrucibleRecords_IPC: ipc.on("retrieved-crucible-records", function(event, savedCrucibleRecords, savedReviewerList) {
    
//   })
// }