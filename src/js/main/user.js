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
          if (typeof user !== "undefined" && user !== null && user.length == 1 && typeof user[0].userID !== "undefined" && user[0].userID !== null) {
            console.log(new Date().toJSON(), appConstants.LOG_INFO, "retrieveUser(): Retrieved:", user[0].userID);
            resolve(user[0]);
          } else {
            reject(null);
          }
        }
      });
    });
  },

  // Retrieve ReviewerList
  retrieveReviewerList: function(neDB, appConstants) {
    return new Promise(function(resolve, reject) {
      neDB.find({ type: "ReviewerList" }, function(err, reviewer) {
        if (err) {
          console.log(new Date().toJSON(), appConstants.LOG_ERROR, "retrieveReviewerList()", err);
          reject(null);
        } else {
          if (typeof reviewer !== "undefined" && reviewer !== null) {
            console.log(new Date().toJSON(), appConstants.LOG_INFO, "retrieveReviewerList(): Retrieved:", reviewer[0].reviewerList.length, "Reviewers.");
            resolve(reviewer[0].reviewerList);
          } else {
            reject(null);
          }
        }
      });
    });
  },

  // Retrieve Project Key
  retrieveProjectKey: function(neDB, appConstants) {
    return new Promise(function(resolve, reject) {
      neDB.find({ type: "ProjectKey" }, function(err, project) {
        if (err) {
          console.log(new Date().toJSON(), appConstants.LOG_ERROR, "retrieveProjectKey()", err);
          reject(null);
        } else {
          if (typeof project !== "undefined" && project !== null) {
            console.log(new Date().toJSON(), appConstants.LOG_INFO, "retrieveProjectKey(): Retrieved:", project[0].projectKey);
            resolve(project[0].projectKey);
          } else {
            reject(null);
          }
        }
      });
    });
  },

  /**
   * - GET User Info from Crucible.
   * - Save it to the DB
   * - Send it up to the renderer
   */
  saveUserInfo: function(neDB, apiConstants, appConstants, userID, crucibleServerInstance, mainWindow, requestPromise) {
    // Remove any existing user information
    neDB.remove({ type: "User" }, { multi: true }, function(err, numRemoved) {
      if (err) {
        console.log(new Date().toJSON(), appConstants.LOG_ERROR, "saveUserInfo", err);
      } else {
        console.log(new Date().toJSON(), appConstants.LOG_INFO, "saveUserInfo", "Removed Existing User.");

        // GET Parameters
        var userInfoOptions = {
          method: "GET",
          uri: crucibleServerInstance + apiConstants.CRUCIBLE_REST_BASE_URL + apiConstants.CRUCIBLE_REST_USERS + apiConstants.USER_ID + userID,
          json: true
        };

        // Handle GET Call
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
  },

  /**
   * Save Reviewers.
   */
  saveReviewerDetails: function(neDB, appConstants, reviewerList) {
    neDB.insert(
      {
        type: "ReviewerList",
        reviewerList: reviewerList
      },
      function(err, insertedRecord) {
        if (err) {
          console.log(new Date().toJSON(), appConstants.LOG_ERROR, "saveReviewerDetails", err);
        } else {
          console.log(new Date().toJSON(), appConstants.LOG_INFO, "saveReviewerDetails: Saved Reviewer List!");
        }
      }
    );
  },

  /**
   * Save Project Key.
   */
  saveProjectDetails: function(neDB, appConstants, projKey) {
    neDB.insert(
      {
        type: "ProjectKey",
        projectKey: projKey
      },
      function(err, insertedRecord) {
        if (err) {
          console.log(new Date().toJSON(), appConstants.LOG_ERROR, "saveProjectDetails", err);
        } else {
          console.log(new Date().toJSON(), appConstants.LOG_INFO, "saveProjectDetails: Saved Project Key!");
        }
      }
    );
  }
};
