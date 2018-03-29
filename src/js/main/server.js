/**
 * Handle operations on list of servers
 */
// Import Electron Dependencies
const electron = require("electron");

// Export all functions.
module.exports = {
  // Saves the list of servers to the database
  saveServerList: function(neDB, AppConstants, serverList) {
    console.log(serverList);

    // Remove existing servers
    neDB.remove({ type: "ServerInstance" }, {}, function(err, numRemoved) {
      if (err) {
        console.log(new Date().toJSON(), AppConstants.LOG_ERROR, "saveServerList", err);
      } else {
        console.log(new Date().toJSON(), AppConstants.LOG_INFO, "saveServerList: Removed:", numRemoved, " entries!");
      }
    });

    // Insert passed-in server list
    for (var instance in serverList) {
      neDB.insert(
        {
          type: "ServerInstance",
          instance: serverList[instance]
        },
        function(err, insertedRecord) {
          if (err) {
            console.log(new Date().toJSON(), AppConstants.LOG_ERROR, "saveServerList", err);
          } else {
            console.log(new Date().toJSON(), AppConstants.LOG_INFO, "saveServerList:Saved: ", serverList[instance]);
          }
        }
      );
    }
  }
};
