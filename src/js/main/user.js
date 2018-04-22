/**
 * Handles user & related operations.
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
            console.log(new Date().toJSON(), appConstants.LOG_ERROR, "retrieveUser(): Unexpected Retrieval:", user);
            reject(null);
          }
        }
      });
    });
  },

  // Retrieve Reviewer List
  retrieveReviewerList: function(neDB, appConstants) {
    return new Promise(function(resolve, reject) {
      neDB.find({ type: "Reviewer" }, function(err, reviewerList) {
        if (err) {
          console.log(new Date().toJSON(), appConstants.LOG_ERROR, "retrieveReviewerList()", err);
          reject(null);
        } else {
          if (typeof reviewerList !== "undefined" && reviewerList !== null && reviewerList.length > 0) {
            console.log(new Date().toJSON(), appConstants.LOG_INFO, "retrieveReviewerList(): Retrieved:", reviewerList.length, "Reviewers.");
            resolve(reviewerList);
          } else {
            console.log(new Date().toJSON(), appConstants.LOG_ERROR, "retrieveReviewerList(): Unexpected Retrieval:", reviewerList);
            resolve([]);
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
          if (typeof project !== "undefined" && project !== null && project.length > 0 && project[0].projectKey !== null && project[0].projectKey.length > 0) {
            console.log(new Date().toJSON(), appConstants.LOG_INFO, "retrieveProjectKey(): Retrieved:", project[0].projectKey);
            resolve(project[0].projectKey);
          } else {
            console.log(new Date().toJSON(), appConstants.LOG_ERROR, "retrieveProjectKey(): Unexpected Retrieval:", project);
            resolve("");
          }
        }
      });
    });
  },

  /**
   * - GET User Info from Crucible.
   * - Save it to the DB.
   * - Send it up to the renderer.
   */
  saveUserInfo: function(neDB, apiConstants, appConstants, userID, crucibleServerInstance, mainWindow, requestPromise) {
    // Remove any existing user information
    neDB.remove({ type: "User" }, { multi: true }, function(err, numRemoved) {
      if (err) {
        console.log(new Date().toJSON(), appConstants.LOG_ERROR, "saveUserInfo()", err);
      } else {
        console.log(new Date().toJSON(), appConstants.LOG_INFO, "saveUserInfo()", "Removed Existing User.");

        // GET Parameters
        var userGET = {
          method: "GET",
          uri: crucibleServerInstance + apiConstants.CRUCIBLE_REST_BASE_URL + apiConstants.CRUCIBLE_REST_USERS + apiConstants.USER_ID + userID,
          json: true
        };

        // Handle GET Call
        requestPromise(userGET)
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
                  console.log(new Date().toJSON(), appConstants.LOG_ERROR, "saveUserInfo()", err);
                } else {
                  console.log(new Date().toJSON(), appConstants.LOG_INFO, "saveUserInfo()", userName);
                  mainWindow.webContents.send("user-info", userName, formattedName, userAvatarURL);
                }
              }
            );
          })
          .catch(function(err) {
            console.log(new Date().toJSON(), appConstants.LOG_ERROR, "saveUserInfo()", err);
          });
      }
    });
  },

  /**
   * Save Reviewers.
   */
  saveReviewerDetails: function(neDB, appConstants, currentReviewerList) {
    // Remove existing Reviewers
    neDB.remove({ type: "Reviewer" }, { multi: true }, function(err, numRemoved) {
      if (err) {
        console.log(new Date().toJSON(), appConstants.LOG_ERROR, "saveReviewerDetails()", err);
      } else {
        console.log(new Date().toJSON(), appConstants.LOG_INFO, "saveReviewerDetails()", "Removed " + numRemoved + " Existing Reviewer(s).");
      }
    });

    // Insert current Reviewers
    currentReviewerList.forEach(function(element) {
      neDB.insert(
        {
          type: "Reviewer",
          reviewer: element
        },
        function(err, insertedRecord) {
          if (err) {
            console.log(new Date().toJSON(), appConstants.LOG_ERROR, "saveReviewerDetails()", err);
          } else {
            console.log(new Date().toJSON(), appConstants.LOG_INFO, "saveReviewerDetails(): Saved Reviewer: " + insertedRecord.reviewer);
          }
        }
      );
    });
  },

  /**
   * Save Project Key.
   */
  saveProjectDetails: function(neDB, appConstants, projKey) {
    // Remove existing Project Key
    neDB.remove({ type: "ProjectKey" }, { multi: true }, function(err, numRemoved) {
      if (err) {
        console.log(new Date().toJSON(), appConstants.LOG_ERROR, "saveProjectDetails()", err);
      } else {
        console.log(new Date().toJSON(), appConstants.LOG_INFO, "saveProjectDetails()", "Removed Existing Project Key.");
      }
    });

    // Save current Project key
    neDB.insert(
      {
        type: "ProjectKey",
        projectKey: projKey
      },
      function(err, insertedRecord) {
        if (err) {
          console.log(new Date().toJSON(), appConstants.LOG_ERROR, "saveProjectDetails()", err);
        } else {
          console.log(new Date().toJSON(), appConstants.LOG_INFO, "saveProjectDetails(): Saved (" + projKey + ") Project Key!");
        }
      }
    );
  }
};
