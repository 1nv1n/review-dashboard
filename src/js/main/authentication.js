/**
 * Handle authentication operations.
 */

const API_CONSTANTS = require("../constants/api-constants");
const APP_CONSTANTS = require("../constants/app-constants");
const REQUEST_PROMISE = require("request-promise");
const SERVER_PROCESS = require("../main/server");

// Export all functions.
module.exports = {
  // Authenticate the user
  authenticateUser: function authenticateUser(neDB, mainWindow, userID, password) {
    console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "authenticateUser()", "Authenticating", userID);
    const AUTHENTICATION_OPTIONS = {
      method: "POST",
      uri: "",
      form: {
        userName: userID,
        password: password
      },
      json: false
    };

    SERVER_PROCESS.retrieveCrucibleServerList(neDB).then((crucibleServerList) => {
      if (crucibleServerList.length > 0) {
        // Begin authentication with Crucible via call-back functions after removing existing data - start fresh
        neDB.remove({
          type: "CrucibleToken"
        }, {
          multi: true
        }, (err, numRemoved) => {
          if (err) {
            console.log(new Date().toJSON(), APP_CONSTANTS.LOG_ERROR, "authenticateUser()", err);
          } else {
            console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "authenticateUser()", "Removed", numRemoved, "Existing Token(s)");
            authenticateCrucible(neDB, mainWindow, AUTHENTICATION_OPTIONS, crucibleServerList, 0);
          }
        });
      } else {
        console.log(new Date().toJSON(), APP_CONSTANTS.LOG_ERROR, "authenticateUser(): No server instances to authenticate against!");
      }
    }, (err) => {
      console.log(new Date().toJSON(), APP_CONSTANTS.LOG_ERROR, "authenticateUser()", err);
    });
  },

  // Clear the DB.
  logout: function logout(neDB) {
    neDB.remove({}, {
      multi: true
    }, (err, numRemoved) => {
      if (err) {
        console.log(new Date().toJSON(), APP_CONSTANTS.LOG_ERROR, "logout()", err);
      } else {
        console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "logout()", "Removed", numRemoved, "Records!");
      }
    });
  }
};

/**
 * The actual auth. process that happens for each instance.
 *
 * @param {*} neDB
 * @param {*} authenticationOptions
 * @param {*} crucibleServerList
 * @param {*} processedInstanceCount
 */
function authenticateCrucible(neDB, mainWindow, authenticationOptions, crucibleServerList, processedInstanceCount) {
  console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "authenticateCrucible()", "Authenticating against", crucibleServerList[processedInstanceCount].instance);
  if (processedInstanceCount < crucibleServerList.length) {
    authenticationOptions.uri = crucibleServerList[processedInstanceCount].instance +
      API_CONSTANTS.FE_CRU_REST_BASE_URL +
      API_CONSTANTS.CRUCIBLE_AUTH;

    REQUEST_PROMISE(authenticationOptions).then((parsedBody) => {
      insertCrucibleToken(neDB, crucibleServerList[processedInstanceCount].instance, JSON.parse(parsedBody).token);
      processedInstanceCount += 1;

      if (processedInstanceCount < crucibleServerList.length) {
        authenticateCrucible(neDB, mainWindow, authenticationOptions, crucibleServerList, processedInstanceCount);
      } else {
        console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "authenticateCrucible()", "Authenticated Successfully!");
        mainWindow.webContents.send("log-in-attempted", true);
      }
    }).catch((err) => {
      console.log(new Date().toJSON(), APP_CONSTANTS.LOG_ERROR, "authenticateCrucible()", err);
      mainWindow.webContents.send("log-in-attempted", false);
    });
  } else {
    console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "authenticateCrucible()", "Authentication Complete.");
  }
}

/**
 * Insert the token into the DB
 *
 * @param {*} neDB
 * @param {*} instanceString
 * @param {*} tokenValue
 */
function insertCrucibleToken(neDB, instanceString, tokenValue) {
  console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "insertCrucibleToken()", "Inserting Token for:", instanceString);
  neDB.insert({
    type: "CrucibleToken",
    instance: instanceString,
    token: tokenValue
  }, (err, insertedRecord) => {
    if (err) {
      console.log(new Date().toJSON(), APP_CONSTANTS.LOG_ERROR, "insertCrucibleToken()", err);
    } else {
      console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "insertCrucibleToken() Inserted Token for:", instanceString);
    }
  });
}