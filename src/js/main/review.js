/**
 * Handle operations on the Review
 */

// Export all functions.
module.exports = {
  // Create Review
  createReview: function(
    neDB,
    appConstants,
    apiConstants,
    requestPromise,
    shell,
    mainWindow,
    instanceString,
    currentUser,
    projectKey,
    reviewName,
    reviewDescription,
    jiraIssue,
    allowReviewersToJoin,
    reviewerList
  ) {
    console.log(new Date().toJSON(), appConstants.LOG_INFO, "createReview(): For:", jiraIssue);

    var createDate = new Date();
    var dueDate = new Date(createDate.getTime() + 604800000); // Default to a one week turnaround

    neDB.find(
      {
        type: "CrucibleToken",
        instance: instanceString
      },
      function(err, crucibleRecords) {
        if (err) {
          console.log(new Date().toJSON(), appConstants.LOG_ERROR, "createReview()", err);
        } else {
          if (crucibleRecords.length === 0) {
            console.log(new Date().toJSON(), appConstants.LOG_ERROR, "createReview()", "No Crucible records found while attempting to create the review.");
          } else if (crucibleRecords.length > 1) {
            console.log(
              new Date().toJSON(),
              appConstants.LOG_ERROR,
              "createReview()",
              "Multiple Crucible records found while attempting to create the review."
            );
          } else {
            var createOptions = {
              method: "POST",
              uri: instanceString + apiConstants.CRUCIBLE_REST_BASE_URL + apiConstants.CRUCIBLE_REST_REVIEWS + apiConstants.FEAUTH + crucibleRecords[0].token,
              headers: {
                "User-Agent": "Request-Promise"
              },
              body: {},
              json: true
            };

            if (typeof reviewerList === "undefined" || reviewerList === null || reviewerList.length <= 0) {
              createOptions.body = {
                reviewData: {
                  projectKey: projectKey,
                  name: reviewName,
                  description: reviewDescription,
                  author: {
                    userName: currentUser.userID,
                    displayName: currentUser.displayName,
                    avatarUrl: currentUser.avatarURL
                  },
                  moderator: {
                    userName: currentUser.userID,
                    displayName: currentUser.displayName,
                    avatarUrl: currentUser.avatarURL
                  },
                  creator: {
                    userName: currentUser.userID,
                    displayName: currentUser.displayName,
                    avatarUrl: currentUser.avatarURL
                  },
                  state: "Review",
                  type: "REVIEW",
                  allowReviewersToJoin: allowReviewersToJoin,
                  metricsVersion: 4,
                  createDate: createDate,
                  dueDate: dueDate,
                  jiraIssueKey: jiraIssue
                }
              };
            } else {
              createOptions.body = {
                detailedReviewData: {
                  projectKey: projectKey,
                  name: reviewName,
                  description: reviewDescription,
                  author: {
                    userName: currentUser.userID,
                    displayName: currentUser.displayName,
                    avatarUrl: currentUser.avatarURL
                  },
                  moderator: {
                    userName: currentUser.userID,
                    displayName: currentUser.displayName,
                    avatarUrl: currentUser.avatarURL
                  },
                  creator: {
                    userName: currentUser.userID,
                    displayName: currentUser.displayName,
                    avatarUrl: currentUser.avatarURL
                  },
                  state: "Review",
                  type: "REVIEW",
                  allowReviewersToJoin: allowReviewersToJoin,
                  metricsVersion: 4,
                  createDate: createDate,
                  dueDate: dueDate,
                  jiraIssueKey: jiraIssue,
                  reviewers: {
                    reviewer: []
                  }
                }
              };

              for (var reviewIdx in reviewerList) {
                createOptions.body.detailedReviewData.reviewers.reviewer.push({
                  userName: reviewerList[reviewIdx]
                });
              }
            }

            requestPromise(createOptions)
              .then(function(parsedBody) {
                console.log(new Date().toJSON(), appConstants.LOG_INFO, "createReview()", "Created Review: " + parsedBody.permaId.id);
                mainWindow.webContents.send("review-created", true, parsedBody.permaId.id);
                shell.openExternal(instanceString + apiConstants.CRUCIBLE_BASE_URL + parsedBody.permaId.id);
              })
              .catch(function(err) {
                console.log(new Date().toJSON(), appConstants.LOG_ERROR, "createReview()", "Error Creating Review: " + err);
                mainWindow.webContents.send("review-created", false, "");
              });
          }
        }
      }
    );
  },

  // Search for Reviews by JIRA
  searchByJIRA: function(apiConstants, appConstants, requestPromise, mainWindow, instanceString, jiraIssue) {
    console.log(new Date().toJSON(), appConstants.LOG_INFO, "searchByJIRA()", "Searching for reviews associated to:", jiraIssue, "on", instanceString);

    var searchOptions = {
      method: "GET",
      uri: instanceString + apiConstants.CRUCIBLE_REST_BASE_URL + apiConstants.SEARCH_BY_ISSUE + jiraIssue,
      headers: {
        "User-Agent": "Request-Promise"
      },
      json: true
    };
    requestPromise(searchOptions)
      .then(function(parsedBody) {
        if (typeof parsedBody !== "undefined" && parsedBody !== null && parsedBody.reviewData !== null && parsedBody.reviewData.length >= 0) {
          console.log(new Date().toJSON(), appConstants.LOG_INFO, "searchByJIRA()", "Found", parsedBody.reviewData.length, "Reviews!");
          mainWindow.webContents.send("search-results", true, parsedBody.reviewData);
        } else {
          console.log(new Date().toJSON(), appConstants.LOG_ERROR, "searchByJIRA()", "Unexpected:", parsedBody);
          mainWindow.webContents.send("search-results", false, "");
        }
      })
      .catch(function(err) {
        console.log(new Date().toJSON(), appConstants.LOG_ERROR, "searchByJIRA()", err);
        mainWindow.webContents.send("search-results", false, "");
      });
  },

  /**
   * Remove existing "Pending" Reviews.
   * GET "Pending" Reviews.
   * Save "Pending" Reviews.
   * Send "Pending" Reviews up to the Renderer.
   */
  getPending: function(neDB, apiConstants, appConstants, requestPromise, mainWindow) {
    neDB.remove({ type: "Pending" }, { multi: true }, function(err, numRemoved) {
      if (err) {
        console.log(new Date().toJSON(), appConstants.LOG_ERROR, "getPending()", err);
      } else {
        console.log(new Date().toJSON(), appConstants.LOG_INFO, "getPending()", "Removed", numRemoved, "Existing Pending Review(s).");
        neDB.find({ type: "CrucibleToken" }, function(err, crucibleRecords) {
          if (err) {
            console.log(new Date().toJSON(), appConstants.LOG_ERROR, "getPending()", err);
          } else {
            var processedInstanceCount = 0;
            getPendingReviews(neDB, processedInstanceCount, crucibleRecords, apiConstants, appConstants, requestPromise, mainWindow, []);
          }
        });
      }
    });
  },

  // Retrieves "Pending" Reviews from the Database & sends them up to the renderer.
  retrievePending: function(neDB, appConstants, mainWindow) {
    neDB.find({ type: "Pending" }, function(err, pendingReviewList) {
      if (err) {
        console.log(new Date().toJSON(), appConstants.LOG_ERROR, "retrievePending()", err);
      } else {
        console.log(new Date().toJSON(), appConstants.LOG_INFO, "retrievePending()", "Retrieved", pendingReviewList.length, "Reviews!");
        mainWindow.webContents.send("retrieved-pending", pendingReviewList);
      }
    });
  }
};

/**
 * Retrieves Pending Reviews using Crucible's API.
 *
 * @param {*} neDB
 * @param {*} processedInstanceCount
 * @param {*} crucibleRecords
 * @param {*} apiConstants
 * @param {*} appConstants
 * @param {*} requestPromise
 * @param {*} mainWindow
 * @param {*} pendingReviewList
 */
function getPendingReviews(neDB, processedInstanceCount, crucibleRecords, apiConstants, appConstants, requestPromise, mainWindow, pendingReviewList) {
  var retrieveOptions = {
    uri:
      crucibleRecords[processedInstanceCount].instance +
      apiConstants.CRUCIBLE_REST_BASE_URL +
      apiConstants.CRUCIBLE_REST_REVIEWS +
      apiConstants.PENDING_REVIEWS_SIMPLE_FILTER +
      apiConstants.FEAUTH +
      crucibleRecords[processedInstanceCount].token,
    headers: {
      "User-Agent": "Request-Promise"
    },
    json: true // Automatically parses the JSON string in the response
  };
  requestPromise(retrieveOptions)
    .then(function(parsedBody) {
      if (parsedBody.reviewData.length > 0) {
        var utcDate;
        var strDate;
        for (var review in parsedBody.reviewData) {
          utcDate = new Date(parsedBody.reviewData[review].createDate);
          strDate = "Y-m-d"
            .replace("Y", utcDate.getFullYear())
            .replace("m", utcDate.getMonth() + 1)
            .replace("d", utcDate.getDate());

          insertPendingReview(
            neDB,
            appConstants,
            crucibleRecords[processedInstanceCount].instance,
            parsedBody.reviewData[review].permaId.id,
            parsedBody.reviewData[review].name,
            parsedBody.reviewData[review].author.displayName,
            strDate
          );

          var pendingReview = {
            ID: parsedBody.reviewData[review].permaId.id,
            Name: parsedBody.reviewData[review].name,
            Author: parsedBody.reviewData[review].author.displayName,
            Created: strDate
          };
          pendingReviewList.push(pendingReview);
        }
        processedInstanceCount = processedInstanceCount + 1;
        if (processedInstanceCount < crucibleRecords.length) {
          getPendingReviews(neDB, processedInstanceCount, crucibleRecords, apiConstants, appConstants, requestPromise, mainWindow, pendingReviewList);
        } else {
          console.log(new Date().toJSON(), appConstants.LOG_INFO, "getPendingReviews()", "Retrieved", pendingReviewList.length, "Reviews!");
          mainWindow.webContents.send("retrieved-pending", pendingReviewList);
        }
      }
    })
    .catch(function(err) {
      console.log(new Date().toJSON(), appConstants.LOG_ERROR, "getPendingReviews()", err);
    });
}

/**
 * Inserts a Pending Review into the Database.
 *
 * @param {*} neDB
 * @param {*} appConstants
 * @param {*} instanceString
 * @param {*} reviewID
 * @param {*} reviewName
 * @param {*} reviewAuthor
 * @param {*} createDt
 */
function insertPendingReview(neDB, appConstants, instanceString, reviewID, reviewName, reviewAuthor, createDt) {
  neDB.insert(
    {
      type: "Pending",
      instance: instanceString,
      reviewID: reviewID,
      reviewName: reviewName,
      reviewAuthor: reviewAuthor,
      createDt: createDt
    },
    function(err, insertedRecord) {
      if (err) {
        console.log(new Date().toJSON(), appConstants.LOG_ERROR, "insertPendingReview()", err);
      } else {
        console.log(new Date().toJSON(), appConstants.LOG_INFO, "insertPendingReview() Inserted Pending Review:", reviewID);
      }
    }
  );
}
