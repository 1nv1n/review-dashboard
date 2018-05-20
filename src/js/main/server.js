/**
 * Handle operations on list of servers
 */

const APP_CONSTANTS = require("../constants/app-constants");

// Export all functions.
module.exports = {
  // Retrieve Crucible Server list
  retrieveCrucibleServerList: function retrieveCrucibleServerList(neDB) {
    console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "retrieveCrucibleServerList()");
    return new Promise((resolve, reject) => {
      neDB.find({
        type: "CrucibleServerInstance"
      }, (err, crucibleServerList) => {
        if (err) {
          console.log(new Date().toJSON(), APP_CONSTANTS.LOG_ERROR, "retrieveCrucibleServerList()", err);
          reject([]);
        } else {
          console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "retrieveCrucibleServerList(): Retrieved:", crucibleServerList.length, "Crucible Instances!");
          resolve(crucibleServerList);
        }
      });
    });
  },

  // Saves the list of servers to the database
  saveCrucibleServerList: function saveCrucibleServerList(neDB, mainWindow, crucibleServerList) {
    console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "saveCrucibleServerList()");
    // Remove existing servers
    neDB.remove({
      type: "CrucibleServerInstance"
    }, {
      multi: true
    }, (removeErr, numRemoved) => {
      if (removeErr) {
        console.log(new Date().toJSON(), APP_CONSTANTS.LOG_ERROR, "saveCrucibleServerList", removeErr);
      } else {
        console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "saveCrucibleServerList: Removed:", numRemoved, "entry(s)!");

        // Insert passed-in server list
        crucibleServerList.forEach((element) => {
          neDB.insert({
            type: "CrucibleServerInstance",
            instance: element
          }, (insertErr, insertedRecord) => {
            if (insertErr) {
              console.log(new Date().toJSON(), APP_CONSTANTS.LOG_ERROR, "saveCrucibleServerList", insertErr);
              mainWindow.webContents.send("save-server-list", []);
            } else {
              console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "saveCrucibleServerList: Saved:", insertedRecord.instance);
            }
          });
        });

        neDB.find({
          type: "CrucibleServerInstance"
        }, (findErr, retrievedCrucibleServerList) => {
          if (findErr) {
            console.log(new Date().toJSON(), APP_CONSTANTS.LOG_ERROR, "retrieveCrucibleServerList()", findErr);
            mainWindow.webContents.send("save-server-list", []);
          } else {
            console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "retrieveCrucibleServerList(): Retrieved:", retrievedCrucibleServerList.length, "Crucible Instances!");
            mainWindow.webContents.send("save-server-list", retrievedCrucibleServerList);
          }
        });
      }
    });
  }
};