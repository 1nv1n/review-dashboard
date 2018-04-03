/**
 * Handle operations on list of servers
 */

// Export all functions.
module.exports = {
  // Retrieve Server list & push it up to the renderer
  pushCrucibleServerList: function(neDB, AppConstants, mainWindow) {
    neDB.find({ type: "CrucibleServerInstance" }, function(err, crucibleServerList) {
      if (err) {
        console.log(new Date().toJSON(), AppConstants.LOG_ERROR, "pushCrucibleServerList()", err);
        mainWindow.webContents.send("initial-crucible-server-list", []);
      } else {
        console.log(new Date().toJSON(), AppConstants.LOG_INFO, "pushCrucibleServerList(): Retrieved:", crucibleServerList.length, "Crucible Instances!");
        mainWindow.webContents.send("initial-crucible-server-list", crucibleServerList);
      }
    });
  },

  // Saves the list of servers to the database
  saveCrucibleServerList: function(neDB, AppConstants, crucibleServerList) {
    // Remove existing servers
    neDB.remove({ type: "CrucibleServerInstance" }, { multi: true }, function(err, numRemoved) {
      if (err) {
        console.log(new Date().toJSON(), AppConstants.LOG_ERROR, "saveCrucibleServerList", err);
      } else {
        console.log(new Date().toJSON(), AppConstants.LOG_INFO, "saveCrucibleServerList: Removed:", numRemoved, "entry(s)!");
      }
    });

    // Insert passed-in server list
    for (var serverIdx in crucibleServerList) {
      console.log(serverIdx);
      neDB.insert(
        {
          type: "CrucibleServerInstance",
          instance: crucibleServerList[serverIdx]
        },
        function(err, insertedRecord) {
          if (err) {
            console.log(new Date().toJSON(), AppConstants.LOG_ERROR, "saveCrucibleServerList", err);
          } else {
            console.log(new Date().toJSON(), AppConstants.LOG_INFO, "saveCrucibleServerList: Saved:", insertedRecord.instance);
          }
        }
      );
    }
  }
};
