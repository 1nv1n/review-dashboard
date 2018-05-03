/**
 * Handle operations on list of servers
 */

// Export all functions.
module.exports = {
  // Retrieve Crucible Server list
  retrieveCrucibleServerList: function(neDB, appConstants) {
    return new Promise(function(resolve, reject) {
      neDB.find({ type: "CrucibleServerInstance" }, function(err, crucibleServerList) {
        if (err) {
          console.log(new Date().toJSON(), appConstants.LOG_ERROR, "retrieveCrucibleServerList()", err);
          reject([]);
        } else {
          console.log(new Date().toJSON(), appConstants.LOG_INFO, "retrieveCrucibleServerList(): Retrieved:", crucibleServerList.length, "Crucible Instances!");
          resolve(crucibleServerList);
        }
      });
    });
  },

  // Saves the list of servers to the database
  saveCrucibleServerList: function(neDB, appConstants, crucibleServerList, mainWindow) {
    // Remove existing servers
    neDB.remove({ type: "CrucibleServerInstance" }, { multi: true }, function(err, numRemoved) {
      if (err) {
        console.log(new Date().toJSON(), appConstants.LOG_ERROR, "saveCrucibleServerList", err);
      } else {
        console.log(new Date().toJSON(), appConstants.LOG_INFO, "saveCrucibleServerList: Removed:", numRemoved, "entry(s)!");

        // Insert passed-in server list
        for (var serverIdx in crucibleServerList) {
          neDB.insert(
            {
              type: "CrucibleServerInstance",
              instance: crucibleServerList[serverIdx]
            },
            function(err, insertedRecord) {
              if (err) {
                console.log(new Date().toJSON(), appConstants.LOG_ERROR, "saveCrucibleServerList", err);
                mainWindow.webContents.send("save-server-list", []);
              } else {
                console.log(new Date().toJSON(), appConstants.LOG_INFO, "saveCrucibleServerList: Saved:", insertedRecord.instance);
              }
            }
          );
        }

        neDB.find({ type: "CrucibleServerInstance" }, function(err, crucibleServerList) {
          if (err) {
            console.log(new Date().toJSON(), appConstants.LOG_ERROR, "retrieveCrucibleServerList()", err);
            mainWindow.webContents.send("save-server-list", []);
          } else {
            console.log(new Date().toJSON(), appConstants.LOG_INFO, "retrieveCrucibleServerList(): Retrieved:", crucibleServerList.length, "Crucible Instances!");
            mainWindow.webContents.send("save-server-list", crucibleServerList);
          }
        });
      }
    });
  }
};
