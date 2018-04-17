/**
 * Handle authentication operations.
 */

var neDB;
var mainWindow;
var apiConstants;
var appConstants;
var serverProcess;
var requestPromise;
var crucibleServerList;

// Export all functions.
module.exports = {
  // Authenticate the user
  authenticateUser: function(_neDB, _apiConstants, _appConstants, userID, password, _mainWindow, _RequestPromise, _serverProcess) {
    neDB = _neDB;
    mainWindow = _mainWindow;
    appConstants = _appConstants;
    apiConstants = _apiConstants;
    serverProcess = _serverProcess;
    requestPromise = _RequestPromise;

    var authenticationOptions = {
      method: "POST",
      uri: "",
      form: {
        userName: userID,
        password: password
      },
      json: false
    };

    serverProcess.retrieveCrucibleServerList(neDB, appConstants).then(
      function(_crucibleServerList) {
        if (_crucibleServerList.length > 0) {
          crucibleServerList = _crucibleServerList;

          // Begin authentication with Crucible via call-back functions after removing existing data - start fresh
          neDB.remove({ type: "CrucibleToken" }, { multi: true }, function(err, numRemoved) {
            if (err) {
              console.log(new Date().toJSON(), appConstants.LOG_ERROR, "authenticateUser", err);
            } else {
              console.log(new Date().toJSON(), appConstants.LOG_INFO, "authenticateUser", "Removed Existing Tokens");
              authenticateCrucible(authenticationOptions, 0);
            }
          });
        }
      },
      function(err) {
        console.log(new Date().toJSON(), appConstants.LOG_ERROR, "authenticateUser()", err);
      }
    );
  },

  // Clear the DB.
  logout: function(neDB, appConstants) {
    neDB.remove(
      {},
      {
        multi: true
      },
      function(err, numRemoved) {
        if (err) {
          console.log(new Date().toJSON(), appConstants.LOG_ERROR, "logout()", err);
        } else {
          console.log(new Date().toJSON(), appConstants.LOG_INFO, "logout()", "Removed", numRemoved, "Records!");
        }
      }
    );
  }
};

/**
 * The actual auth process that happens for each instance.
 *
 * @param {*} authenticationOptions
 * @param {*} processedInstanceCount
 */
function authenticateCrucible(authenticationOptions, processedInstanceCount) {
  if (processedInstanceCount < crucibleServerList.length) {
    authenticationOptions.uri = crucibleServerList[processedInstanceCount].instance + apiConstants.FE_CRU_REST_BASE_URL + apiConstants.CRUCIBLE_AUTH;

    requestPromise(authenticationOptions)
      .then(function(parsedBody) {
        console.log(new Date().toJSON(), appConstants.LOG_INFO, parsedBody);
        insertCrucibleToken(crucibleServerList[processedInstanceCount].instance, JSON.parse(parsedBody).token);
        processedInstanceCount = processedInstanceCount + 1;

        if (processedInstanceCount < crucibleServerList.length) {
          authenticateCrucible(authenticationOptions, processedInstanceCount);
        } else {
          console.log(new Date().toJSON(), appConstants.LOG_INFO, "authenticateCrucible", "Authenticated Successfully!");
          mainWindow.webContents.send("log-in-attempted", true);
        }
      })
      .catch(function(err) {
        console.log(new Date().toJSON(), appConstants.LOG_ERROR, "authenticateCrucible", err);
        mainWindow.webContents.send("log-in-attempted", false);
      });
  } else {
    console.log(new Date().toJSON(), appConstants.LOG_INFO, "authenticateCrucible", "Authenticated Successfully!");
    mainWindow.webContents.send("log-in-attempted", true);
  }
}

/**
 * Insert the token into the DB
 *
 * @param {*} instanceString
 * @param {*} tokenValue
 */
function insertCrucibleToken(instanceString, tokenValue) {
  neDB.insert(
    {
      type: "CrucibleToken",
      instance: instanceString,
      token: tokenValue
    },
    function(err, insertedRecord) {
      if (err) {
        console.log(new Date().toJSON(), appConstants.LOG_ERROR, "insertCrucibleToken", err);
      } else {
        console.log(new Date().toJSON(), appConstants.LOG_INFO, "insertCrucibleToken Inserted Token for: ", instanceString);
      }
    }
  );
}
