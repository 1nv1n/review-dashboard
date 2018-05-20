/**
 * Handles user & related operations.
 */

const API_CONSTANTS = require("../constants/api-constants");
const APP_CONSTANTS = require("../constants/app-constants");
const REQUEST_PROMISE = require("request-promise");

// Export all functions.
module.exports = {
  // Retrieve User
  retrieveUser: function retrieveUser(neDB) {
    console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "retrieveUser()");
    return new Promise((resolve, reject) => {
      neDB.find({
        type: "User"
      }, (err, user) => {
        if (err) {
          console.log(new Date().toJSON(), APP_CONSTANTS.LOG_ERROR, "retrieveUser()", err);
          reject(null);
        }

        if (typeof user !== "undefined" && user !== null && user.length === 1 && typeof user[0].userID !== "undefined" && user[0].userID !== null) {
          console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "retrieveUser(): Retrieved:", user[0].userID);
          resolve(user[0]);
        } else {
          console.log(new Date().toJSON(), APP_CONSTANTS.LOG_WARN, "retrieveUser(): Unexpected Retrieval:", user);
          reject(null);
        }
      });
    });
  },

  // Retrieve Reviewer List
  retrieveReviewerList: function retrieveReviewerList(neDB) {
    console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "retrieveReviewerList()");
    return new Promise((resolve, reject) => {
      neDB.find({
        type: "Reviewer"
      }, (err, reviewerList) => {
        if (err) {
          console.log(new Date().toJSON(), APP_CONSTANTS.LOG_ERROR, "retrieveReviewerList()", err);
          reject(null);
        }

        if (typeof reviewerList !== "undefined" && reviewerList !== null && reviewerList.length > 0) {
          console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "retrieveReviewerList(): Retrieved:", reviewerList.length, "Reviewers.");
          resolve(reviewerList);
        } else {
          console.log(new Date().toJSON(), APP_CONSTANTS.LOG_WARN, "retrieveReviewerList(): Unexpected Retrieval:", reviewerList);
          resolve([]);
        }
      });
    });
  },

  // Retrieve Project Key
  retrieveProjectKey: function retrieveProjectKey(neDB) {
    console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "retrieveProjectKey()");
    return new Promise((resolve, reject) => {
      neDB.find({
        type: "ProjectKey"
      }, (err, project) => {
        if (err) {
          console.log(new Date().toJSON(), APP_CONSTANTS.LOG_ERROR, "retrieveProjectKey()", err);
          reject(null);
        }

        if (typeof project !== "undefined" && project !== null && project.length > 0 && project[0].projectKey !== null && project[0].projectKey.length > 0) {
          console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "retrieveProjectKey(): Retrieved:", project[0].projectKey);
          resolve(project[0].projectKey);
        } else {
          console.log(new Date().toJSON(), APP_CONSTANTS.LOG_WARN, "retrieveProjectKey(): Unexpected Retrieval:", project);
          resolve("");
        }
      });
    });
  },

  /**
   * - GET User Info from Crucible.
   * - Save it to the DB.
   * - Send it up to the renderer.
   */
  saveUserInfo: function saveUserInfo(neDB, mainWindow, userID, crucibleServerInstance) {
    console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "saveUserInfo()");
    return new Promise((resolve, reject) => {
      // Remove any existing user information
      neDB.remove({
        type: "User"
      }, {
        multi: true
      }, (removeErr, numRemoved) => {
        if (removeErr) {
          console.log(new Date().toJSON(), APP_CONSTANTS.LOG_ERROR, "saveUserInfo()", removeErr);
          reject(null);
        } else {
          console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "saveUserInfo()", "Removed Existing User.");

          // GET Parameters
          const USER_GET_PARAMETERS = {
            method: "GET",
            uri: crucibleServerInstance +
              API_CONSTANTS.CRUCIBLE_REST_BASE_URL +
              API_CONSTANTS.CRUCIBLE_REST_USERS +
              API_CONSTANTS.USER_ID +
              userID,
            json: true
          };

          // Handle GET Call
          REQUEST_PROMISE(USER_GET_PARAMETERS).then((parsedBody) => {
            const USER_NAME = parsedBody.userData[0].userName;
            const FORMATTED_NAME = parsedBody.userData[0].displayName;
            const USER_AVATAR_URL = parsedBody.userData[0].avatarUrl;

            neDB.insert({
              type: "User",
              userID: USER_NAME,
              displayName: FORMATTED_NAME,
              avatarURL: USER_AVATAR_URL
            }, (insertErr, insertedRecord) => {
              if (insertErr) {
                console.log(new Date().toJSON(), APP_CONSTANTS.LOG_ERROR, "saveUserInfo()", insertErr);
                reject(null);
              } else {
                console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "saveUserInfo()", USER_NAME);
                mainWindow.webContents.send("user-info", USER_NAME, FORMATTED_NAME, USER_AVATAR_URL);
                resolve(insertedRecord);
              }
            });
          }).catch((err) => {
            console.log(new Date().toJSON(), APP_CONSTANTS.LOG_ERROR, "saveUserInfo()", err);
            reject(null);
          });
        }
      });
    });
  },

  /**
   * Save Reviewers.
   */
  saveReviewerDetails: (neDB, currentReviewerList) => {
    console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "saveReviewerDetails()");
    // Remove existing Reviewers
    neDB.remove({
      type: "Reviewer"
    }, {
      multi: true
    }, (removeErr, numRemoved) => {
      if (removeErr) {
        console.log(new Date().toJSON(), APP_CONSTANTS.LOG_ERROR, "saveReviewerDetails()", removeErr);
      } else {
        console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "saveReviewerDetails()", "Removed", numRemoved, " Existing Reviewer(s).");

        // Insert current Reviewers
        currentReviewerList.forEach((element) => {
          neDB.insert({
            type: "Reviewer",
            reviewer: element
          }, (insertErr, insertedRecord) => {
            if (insertErr) {
              console.log(new Date().toJSON(), APP_CONSTANTS.LOG_ERROR, "saveReviewerDetails()", insertErr);
            } else {
              console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "saveReviewerDetails(): Saved Reviewer:", insertedRecord.reviewer);
            }
          });
        });
      }
    });
  },

  /**
   * Save Project Key.
   */
  saveProjectDetails: (neDB, projKey) => {
    console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "saveProjectDetails()");
    // Remove existing Project Key
    neDB.remove({
      type: "ProjectKey"
    }, {
      multi: true
    }, (removeErr, numRemoved) => {
      if (removeErr) {
        console.log(new Date().toJSON(), APP_CONSTANTS.LOG_ERROR, "saveProjectDetails()", removeErr);
      } else {
        console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "saveProjectDetails()", "Removed Existing Project Key.");

        // Save current Project key
        neDB.insert({
          type: "ProjectKey",
          projectKey: projKey
        }, (insertErr, insertedRecord) => {
          if (insertErr) {
            console.log(new Date().toJSON(), APP_CONSTANTS.LOG_ERROR, "saveProjectDetails()", insertErr);
          } else {
            console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "saveProjectDetails(): Saved (", projKey, ") Project Key!");
          }
        });
      }
    });
  }
};