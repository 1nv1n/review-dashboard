/**
 * Handle user operations.
 */

// Export all functions.
module.exports = {
  // Retrieve User
  retrieveUser: function(neDB, appConstants) {
    return new Promise(function(resolve, reject) {
      neDB.find({ type: "User" }, function(err, user) {
        if (err) {
          console.log(new Date().toJSON(), appConstants.LOG_ERROR, "retrieveUser()", err);
          reject(null);
        } else {
          console.log(new Date().toJSON(), appConstants.LOG_INFO, "retrieveUser(): Retrieved:", user[0].userID);
          resolve(user[0]);
        }
      });
    });
  },

  // GET & Save User Info
  saveUserInfo: function(neDB, apiConstants, appConstants, userID, crucibleServerInstance, mainWindow, requestPromise) {
    // Remove any existing user information
    neDB.remove({ type: "User" }, { multi: true }, function(err, numRemoved) {
      if (err) {
        console.log(new Date().toJSON(), appConstants.LOG_ERROR, "saveUserInfo", err);
      } else {
        console.log(new Date().toJSON(), appConstants.LOG_INFO, "saveUserInfo", "Removed Existing User.");

        var userInfoOptions = {
          method: "GET",
          uri: crucibleServerInstance + apiConstants.CRUCIBLE_REST_BASE_URL + apiConstants.CRUCIBLE_REST_USERS + apiConstants.USER_ID + userID,
          json: true
        };

        requestPromise(userInfoOptions)
          .then(function(parsedBody) {
            var userName = parsedBody.userData[0].userName;
            var formattedName = parsedBody.userData[0].displayName;
            var userAvatarURL = parsedBody.userData[0].avatarUrl;

            neDB.insert(
              {
                type: "User",
                userID: userName,
                displayName: formattedName,
                avatarURL: userAvatarURL
              },
              function(err, insertedRecord) {
                if (err) {
                  console.log(new Date().toJSON(), appConstants.LOG_ERROR, "saveUserInfo", err);
                } else {
                  console.log(new Date().toJSON(), appConstants.LOG_INFO, "saveUserInfo", userName);
                  mainWindow.webContents.send("user-info", userName, formattedName, userAvatarURL);
                }
              }
            );
          })
          .catch(function(err) {
            console.log(new Date().toJSON(), appConstants.LOG_ERROR, "saveUserInfo", err);
          });
      }
    });
  }
};
