/**
 * Handle authentication operations.
 */

// Import Server operations
const serverProcess = require("../main/server");
const RequestPromise = require("request-promise");

var _mainWindow;
var _APIConstants;
var _AppConstants;
var _crucibleServerList;
var _neDB;

// Export all functions.
module.exports = {
  // AUthenticate the user
  authenticateUser: function(neDB, APIConstants, AppConstants, userID, password, mainWindow) {
    var authenticationOptions = {
      method: "POST",
      uri: "",
      form: {
        userName: userID,
        password: password
      },
      json: false
    };

    _neDB = neDB;
    _mainWindow = mainWindow;
    _AppConstants = AppConstants;
    _APIConstants = APIConstants;

    serverProcess.retrieveCrucibleServerList(neDB, AppConstants).then(
      function(crucibleServerList) {
        if (crucibleServerList.length > 0) {
          _crucibleServerList = crucibleServerList;
          // Save the user's information from the first Crucible Instance
          //saveUserInfo(crucibleServerList[0], userID);

          // Begin authentication with Crucible via call-back functions after removing existing data
          neDB.remove({ type: "CrucibleToken" }, { multi: true }, function(err, numRemoved) {
            if (err) {
              console.log(new Date().toJSON(), AppConstants.LOG_ERROR, "authenticateUser", err);
            } else {
              console.log(new Date().toJSON(), AppConstants.LOG_INFO, "authenticateUser", "Removed Existing Tokens");
              authenticateCrucible(authenticationOptions, 0);
            }
          });
        }
      },
      function(err) {
        console.log(new Date().toJSON(), AppConstants.LOG_ERROR, "authenticateUser()", err);
      }
    );
  }
};

function authenticateCrucible(authenticationOptions, processedInstanceCount) {
  if (processedInstanceCount < _crucibleServerList.length) {
    authenticationOptions.uri = _crucibleServerList[processedInstanceCount].instance + _APIConstants.FE_CRU_REST_BASE_URL + _APIConstants.CRUCIBLE_AUTH;

    RequestPromise(authenticationOptions).then(function(parsedBody) {
      insertCrucibleToken(_crucibleServerList[processedInstanceCount], JSON.parse(parsedBody).token);
      processedInstanceCount = processedInstanceCount + 1;
      
      if (processedInstanceCount < _crucibleServerList.length) {
        authenticateCrucible(authenticationOptions, processedInstanceCount);
      } else {
        console.log(new Date().toJSON(), _AppConstants.LOG_INFO, "authenticateCrucible", "Authenticated Successfully!");
        _mainWindow.webContents.send("log-in-attempted", true);
      }
    }).catch(function(err) {
      console.log(new Date().toJSON(), _AppConstants.LOG_ERROR, "authenticateCrucible", err);
      _mainWindow.webContents.send("log-in-attempted", false);
    });
  } else {
    console.log(new Date().toJSON(), _AppConstants.LOG_INFO, "authenticateCrucible", "Authenticated Successfully!");
    _mainWindow.webContents.send("log-in-attempted", true); // 1=TRUE=SUCCESS
  }
}

function insertCrucibleToken(instanceString, tokenValue) {
  _neDB.insert(
    {
      type: "CrucibleToken",
      instance: instanceString,
      token: tokenValue
    },
    function(err, insertedRecord) {
      if (err) {
        console.log(new Date().toJSON(), _AppConstants.LOG_ERROR, "insertCrucibleToken", err);
      } else {
        console.log(new Date().toJSON(), _AppConstants.LOG_INFO, "insertCrucibleToken Inserted Token for: ", instanceString);
      }
    }
  );
}
