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
            console.log(
              new Date().toJSON(),
              appConstants.LOG_INFO,
              "getPending()",
              "Found",
              crucibleRecords.length,
              "Crucible instances to query for Pending Reviews."
            );
            var processedInstanceCount = 0;
            getPendingReviews(neDB, processedInstanceCount, crucibleRecords, apiConstants, appConstants, requestPromise, mainWindow, []);
          }
        });
      }
    });
  },

  /**
   * Remove existing "Open" Reviews.
   * GET "Open" Reviews.
   * Save "Open" Reviews.
   * Send "Open" Reviews up to the Renderer.
   */
  getOpen: function(neDB, apiConstants, appConstants, requestPromise, mainWindow) {
    neDB.remove({ type: "Open" }, { multi: true }, function(err, numRemoved) {
      if (err) {
        console.log(new Date().toJSON(), appConstants.LOG_ERROR, "getOpen()", err);
      } else {
        console.log(new Date().toJSON(), appConstants.LOG_INFO, "getOpen()", "Removed", numRemoved, "Existing Open Review(s).");
        neDB.find({ type: "CrucibleToken" }, function(err, crucibleRecords) {
          if (err) {
            console.log(new Date().toJSON(), appConstants.LOG_ERROR, "getOpen()", err);
          } else {
            console.log(
              new Date().toJSON(),
              appConstants.LOG_INFO,
              "getOpen()",
              "Found",
              crucibleRecords.length,
              "Crucible instances to query for Open Reviews."
            );
            var processedInstanceCount = 0;
            getOpenReviews(neDB, processedInstanceCount, crucibleRecords, apiConstants, appConstants, requestPromise, mainWindow, []);
          }
        });
      }
    });
  },

  /**
   * Remove existing Review Statistics.
   * GET Reviews.
   * Save Reviews.
   * Send Review Statistics up to the Renderer.
   */
  getStats: function(neDB, apiConstants, appConstants, requestPromise, mainWindow, currentUser) {
    neDB.remove({ type: { $in: ["ReviewStat", "ReviewerStat"] } }, { multi: true }, function(err, numRemoved) {
      if (err) {
        console.log(new Date().toJSON(), appConstants.LOG_ERROR, "getStats()", err);
      } else {
        console.log(new Date().toJSON(), appConstants.LOG_INFO, "getStats()", "Removed", numRemoved, "Statistics.");
        neDB.find({ type: "CrucibleToken" }, function(err, crucibleRecords) {
          if (err) {
            console.log(new Date().toJSON(), appConstants.LOG_ERROR, "getStats()", err);
          } else {
            console.log(new Date().toJSON(), appConstants.LOG_INFO, "getStats()", "Found", crucibleRecords.length, "Crucible instances to query for Reviews.");
            var processedInstanceCount = 0;
            getReviewStatistics(neDB, processedInstanceCount, crucibleRecords, apiConstants, appConstants, requestPromise, mainWindow, currentUser, [], []);
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
  },

  // Retrieves "Open" Reviews from the Database & sends them up to the renderer.
  retrieveOpen: function(neDB, appConstants, mainWindow) {
    neDB.find({ type: "Open" }, function(err, openReviewList) {
      if (err) {
        console.log(new Date().toJSON(), appConstants.LOG_ERROR, "retrieveOpen()", err);
      } else {
        console.log(new Date().toJSON(), appConstants.LOG_INFO, "retrieveOpen()", "Retrieved", openReviewList.length, "Reviews!");
        mainWindow.webContents.send("retrieved-open", openReviewList);
      }
    });
  },

  // Retrieves Review Statistics from the Database & sends them up to the renderer.
  retrieveStats: function(neDB, appConstants, mainWindow) {
    neDB.find({ type: "ReviewStat" }, function(err, reviewList) {
      if (err) {
        console.log(new Date().toJSON(), appConstants.LOG_ERROR, "retrieveStats()", err);
      } else {
        console.log(new Date().toJSON(), appConstants.LOG_INFO, "retrieveStats()", "Retrieved Statistics from", reviewList.length, "Reviews!");
        mainWindow.webContents.send("retrieved-review-statistics", reviewList);
      }
    });

    neDB.find({ type: "ReviewerStat" }, function(err, reviewerList) {
      if (err) {
        console.log(new Date().toJSON(), appConstants.LOG_ERROR, "retrieveStats()", err);
      } else {
        console.log(new Date().toJSON(), appConstants.LOG_INFO, "retrieveStats()", "Retrieved Statistics from", reviewerList.length, "Reviewers!");
        mainWindow.webContents.send("retrieved-reviewer-statistics", reviewerList);
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
  console.log(
    new Date().toJSON(),
    appConstants.LOG_INFO,
    "getPendingReviews()",
    "Querying",
    crucibleRecords[processedInstanceCount].instance,
    "for Pending Reviews."
  );
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

          console.log(new Date().toJSON(), appConstants.LOG_INFO, "getPendingReviews()", "Saving Pending Review:", parsedBody.reviewData[review].permaId.id);
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
            reviewID: parsedBody.reviewData[review].permaId.id,
            reviewName: parsedBody.reviewData[review].name,
            reviewAuthor: parsedBody.reviewData[review].author.displayName,
            createDt: strDate
          };
          pendingReviewList.push(pendingReview);
        }
      }
      processedInstanceCount = processedInstanceCount + 1;
      if (processedInstanceCount < crucibleRecords.length) {
        getPendingReviews(neDB, processedInstanceCount, crucibleRecords, apiConstants, appConstants, requestPromise, mainWindow, pendingReviewList);
      } else {
        console.log(new Date().toJSON(), appConstants.LOG_INFO, "getPendingReviews()", "Retrieved", pendingReviewList.length, "Reviews!");
        mainWindow.webContents.send("retrieved-pending", pendingReviewList);
      }
    })
    .catch(function(err) {
      console.log(new Date().toJSON(), appConstants.LOG_ERROR, "getPendingReviews()", err);
    });
}

/**
 * Retrieves Open Reviews using Crucible's API.
 *
 * @param {*} neDB
 * @param {*} processedInstanceCount
 * @param {*} crucibleRecords
 * @param {*} apiConstants
 * @param {*} appConstants
 * @param {*} requestPromise
 * @param {*} mainWindow
 * @param {*} openReviewList
 */
function getOpenReviews(neDB, processedInstanceCount, crucibleRecords, apiConstants, appConstants, requestPromise, mainWindow, openReviewList) {
  console.log(
    new Date().toJSON(),
    appConstants.LOG_INFO,
    "getOpenReviews()",
    "Querying",
    crucibleRecords[processedInstanceCount].instance,
    "for Open Reviews."
  );
  var retrieveOptions = {
    uri:
      crucibleRecords[processedInstanceCount].instance +
      apiConstants.CRUCIBLE_REST_BASE_URL +
      apiConstants.CRUCIBLE_REST_REVIEWS +
      apiConstants.OPEN_REVIEWS_SIMPLE_FILTER +
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

          console.log(new Date().toJSON(), appConstants.LOG_INFO, "getOpenReviews()", "Saving Open Review:", parsedBody.reviewData[review].permaId.id);
          insertOpenReview(
            neDB,
            appConstants,
            crucibleRecords[processedInstanceCount].instance,
            parsedBody.reviewData[review].permaId.id,
            parsedBody.reviewData[review].name,
            strDate
          );

          var openReview = {
            reviewID: parsedBody.reviewData[review].permaId.id,
            reviewName: parsedBody.reviewData[review].name,
            reviewAuthor: parsedBody.reviewData[review].author.displayName,
            createDt: strDate
          };
          openReviewList.push(openReview);
        }
      }
      processedInstanceCount = processedInstanceCount + 1;
      if (processedInstanceCount < crucibleRecords.length) {
        getOpenReviews(neDB, processedInstanceCount, crucibleRecords, apiConstants, appConstants, requestPromise, mainWindow, openReviewList);
      } else {
        console.log(new Date().toJSON(), appConstants.LOG_INFO, "getOpenReviews()", "Retrieved", openReviewList.length, "Reviews!");
        mainWindow.webContents.send("retrieved-open", openReviewList);
      }
    })
    .catch(function(err) {
      console.log(new Date().toJSON(), appConstants.LOG_ERROR, "getOpenReviews()", err);
    });
}

/**
 * Retrieves Review Statistics using Crucible's API.
 *
 * @param {*} neDB
 * @param {*} processedInstanceCount
 * @param {*} crucibleRecords
 * @param {*} apiConstants
 * @param {*} appConstants
 * @param {*} requestPromise
 * @param {*} mainWindow
 * @param {*} currentUser
 * @param {*} reviewStatistics
 * @param {*} reviewerStatistics
 */
function getReviewStatistics(
  neDB,
  processedInstanceCount,
  crucibleRecords,
  apiConstants,
  appConstants,
  requestPromise,
  mainWindow,
  currentUser,
  reviewStatistics,
  reviewerStatistics
) {
  console.log(
    new Date().toJSON(),
    appConstants.LOG_INFO,
    "getReviewStatistics()",
    "Querying",
    crucibleRecords[processedInstanceCount].instance,
    "to gather Review Statistics."
  );

  var retrieveOptions = {
    uri:
      crucibleRecords[processedInstanceCount].instance +
      apiConstants.CRUCIBLE_REST_BASE_URL +
      apiConstants.CRUCIBLE_REST_REVIEWS +
      apiConstants.FILTER_DETAILS +
      apiConstants.FEAUTH +
      crucibleRecords[processedInstanceCount].token +
      apiConstants.CREATOR +
      currentUser.userID,
    headers: {
      "User-Agent": "Request-Promise"
    },
    json: true // Automatically parses the JSON string in the response
  };
  requestPromise(retrieveOptions)
    .then(function(parsedBody) {
      if (parsedBody.detailedReviewData.length > 0) {
        for (var reviewIdx in parsedBody.detailedReviewData) {
          var currentReview = {};
          var utcDate;

          utcDate = new Date(parsedBody.detailedReviewData[reviewIdx].createDate);
          currentReview.createDate = "Y-m-d"
            .replace("Y", utcDate.getFullYear())
            .replace("m", utcDate.getMonth() + 1)
            .replace("d", utcDate.getDate());

          if (parsedBody.detailedReviewData[reviewIdx].hasOwnProperty("dueDate")) {
            utcDate = new Date(parsedBody.detailedReviewData[reviewIdx].dueDate);
            currentReview.dueDate = "Y-m-d"
              .replace("Y", utcDate.getFullYear())
              .replace("m", utcDate.getMonth() + 1)
              .replace("d", utcDate.getDate());
          }

          if (parsedBody.detailedReviewData[reviewIdx].hasOwnProperty("closeDate")) {
            currentReview.closeDate = new Date(parsedBody.detailedReviewData[reviewIdx].closeDate);
          }

          if (parsedBody.detailedReviewData[reviewIdx].hasOwnProperty("jiraIssueKey")) {
            currentReview.jiraIssueKey = parsedBody.detailedReviewData[reviewIdx].jiraIssueKey;
          }

          if (parsedBody.detailedReviewData[reviewIdx].hasOwnProperty("name")) {
            currentReview.name = new Date(parsedBody.detailedReviewData[reviewIdx].jiraIssueKey);
          }

          currentReview.id = parsedBody.detailedReviewData[reviewIdx].permaId.id;

          if (parsedBody.detailedReviewData[reviewIdx].hasOwnProperty("stats")) {
            for (commentIdx in parsedBody.detailedReviewData[reviewIdx].stats) {
              setUserCommentStatistics(reviewerStatistics, parsedBody.detailedReviewData[reviewIdx].stats[commentIdx], appConstants);
            }
          }

          if (
            parsedBody.detailedReviewData[reviewIdx].hasOwnProperty("generalComments") &&
            parsedBody.detailedReviewData[reviewIdx].generalComments.hasOwnProperty("comments")
          ) {
            for (commentIdx in parsedBody.detailedReviewData[reviewIdx].generalComments.comments) {
              setGeneralCommentStatistics(reviewerStatistics, parsedBody.detailedReviewData[reviewIdx].generalComments.comments[commentIdx], appConstants);
            }
          }

          if (
            parsedBody.detailedReviewData[reviewIdx].hasOwnProperty("reviewers") &&
            parsedBody.detailedReviewData[reviewIdx].reviewers.hasOwnProperty("reviewer")
          ) {
            for (reviewerIdx in parsedBody.detailedReviewData[reviewIdx].reviewers.reviewer) {
              setReviewerStatistics(reviewerStatistics, parsedBody.detailedReviewData[reviewIdx].reviewers.reviewer[reviewerIdx], appConstants);
            }
          }

          console.log(new Date().toJSON(), appConstants.LOG_INFO, "getReviewStatistics()", "Saving Statistics for Review:", currentReview.id);
          insertReviewStat(neDB, appConstants, crucibleRecords[processedInstanceCount].instance, currentReview);
          reviewStatistics.push(currentReview);
        }
      }
      processedInstanceCount = processedInstanceCount + 1;
      if (processedInstanceCount < crucibleRecords.length) {
        getReviewStatistics(
          neDB,
          processedInstanceCount,
          crucibleRecords,
          apiConstants,
          appConstants,
          requestPromise,
          mainWindow,
          currentUser,
          reviewStatistics,
          reviewerStatistics
        );
      } else {
        console.log(new Date().toJSON(), appConstants.LOG_INFO, "getReviewStatistics()", "Saving Statistics for", reviewerStatistics.length, " Reviewers.");
        insertReviewerStat(neDB, appConstants, reviewerStatistics);
        mainWindow.webContents.send("retrieved-review-statistics", reviewStatistics);
        mainWindow.webContents.send("retrieved-reviewer-statistics", reviewerStatistics);
      }
    })
    .catch(function(err) {
      console.log(new Date().toJSON(), appConstants.LOG_ERROR, "getReviewStatistics()", err);
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

/**
 * Inserts an Open Review into the Database.
 *
 * @param {*} neDB
 * @param {*} appConstants
 * @param {*} instanceString
 * @param {*} reviewID
 * @param {*} reviewName
 * @param {*} createDt
 */
function insertOpenReview(neDB, appConstants, instanceString, reviewID, reviewName, createDt) {
  neDB.insert(
    {
      type: "Open",
      instance: instanceString,
      reviewID: reviewID,
      reviewName: reviewName,
      createDt: createDt
    },
    function(err, insertedRecord) {
      if (err) {
        console.log(new Date().toJSON(), appConstants.LOG_ERROR, "insertOpenReview()", err);
      } else {
        console.log(new Date().toJSON(), appConstants.LOG_INFO, "insertOpenReview() Inserted Open Review:", reviewID);
      }
    }
  );
}

/**
 * Inserts a Review's statistics into the Database.
 *
 * @param {*} neDB
 * @param {*} appConstants
 * @param {*} instanceString
 * @param {*} review
 */
function insertReviewStat(neDB, appConstants, instanceString, review) {
  neDB.insert(
    {
      type: "ReviewStat",
      instance: instanceString,
      review: review
    },
    function(err, insertedRecord) {
      if (err) {
        console.log(new Date().toJSON(), appConstants.LOG_ERROR, "insertReviewStat()", err);
      } else {
        console.log(new Date().toJSON(), appConstants.LOG_INFO, "insertReviewStat() Inserted Review:", review.id);
      }
    }
  );
}

/**
 * Inserts Reviewer statistics into the Database.
 *
 * @param {*} neDB
 * @param {*} appConstants
 * @param {*} reviewerStatistics
 */
function insertReviewerStat(neDB, appConstants, reviewerStatistics) {
  reviewerStatistics.forEach(function(reviewer) {
    neDB.insert(
      {
        type: "ReviewerStat",
        defectCommentCount: reviewer.defectCommentCount,
        draftCommentCount: reviewer.draftCommentCount,
        leaveUnreadCommentCount: reviewer.leaveUnreadCommentCount,
        publishedCommentCount: reviewer.publishedCommentCount,
        readCommentCount: reviewer.readCommentCount,
        unreadCommentCount: reviewer.unreadCommentCount,
        userName: reviewer.userName,
        completedReviewCount: reviewer.completedReviewCount,
        avatarURL: reviewer.avatarURL,
        displayName: reviewer.displayName,
        reviewCount: reviewer.reviewCount,
        avgTimeSpent: reviewer.avgTimeSpent,
        timeSpent: reviewer.timeSpent
      },
      function(err, insertedRecord) {
        if (err) {
          console.log(new Date().toJSON(), appConstants.LOG_ERROR, "insertReviewStat()", err);
        } else {
          console.log(new Date().toJSON(), appConstants.LOG_INFO, "insertReviewStat() Inserted Reviewer:", reviewer.userName);
        }
      }
    );
  });
  console.log(reviewerStatistics[0]);
}

/**
 * Set data from the provided comment to the user in the provided user list.
 *
 * @param {*} userList
 * @param {*} comment
 * @param {*} appConstants
 */
function setUserCommentStatistics(userList, comment, appConstants) {
  var currentUser = {};
  var filteredUserList = userList.filter(user => user.userName === comment.user);
  if (filteredUserList.length === 1) {
    console.log(new Date().toJSON(), appConstants.LOG_INFO, "setReviewerStatistics() Updating Comment Stats for:", comment.user);
    currentUser = filteredUserList[0];

    if (typeof currentUser.draftCommentCount === "undefined" || currentUser.draftCommentCount === null) {
      currentUser.draftCommentCount = 0;
    }
    if (typeof currentUser.defectCommentCount === "undefined" || currentUser.defectCommentCount === null) {
      currentUser.defectCommentCount = 0;
    }
    if (typeof currentUser.publishedCommentCount === "undefined" || currentUser.publishedCommentCount === null) {
      currentUser.publishedCommentCount = 0;
    }
    if (typeof currentUser.readCommentCount === "undefined" || currentUser.readCommentCount === null) {
      currentUser.readCommentCount = 0;
    }
    if (typeof currentUser.unreadCommentCount === "undefined" || currentUser.unreadCommentCount === null) {
      currentUser.unreadCommentCount = 0;
    }
    if (typeof currentUser.leaveUnreadCommentCount === "undefined" || currentUser.leaveUnreadCommentCount === null) {
      currentUser.leaveUnreadCommentCount = 0;
    }

    if (comment.hasOwnProperty("published")) {
      currentUser.publishedCommentCount += comment.published;
    }

    if (comment.hasOwnProperty("drafts")) {
      currentUser.draftCommentCount += comment.drafts;
    }

    if (comment.hasOwnProperty("defects")) {
      currentUser.defectCommentCount += comment.defects;
    }

    if (comment.hasOwnProperty("read")) {
      currentUser.readCommentCount += comment.read;
    }

    if (comment.hasOwnProperty("unread")) {
      currentUser.unreadCommentCount += comment.unread;
    }

    if (comment.hasOwnProperty("leaveUnread")) {
      currentUser.leaveUnreadCommentCount += comment.leaveUnread;
    }
  } else if (filteredUserList.length === 0) {
    console.log(new Date().toJSON(), appConstants.LOG_INFO, "setReviewerStatistics() Setting Comment Stats for:", comment.user);
    currentUser.userName = comment.user;
    if (comment.hasOwnProperty("published")) {
      currentUser.publishedCommentCount = comment.published;
    } else {
      currentUser.publishedCommentCount = 0;
    }

    if (comment.hasOwnProperty("drafts")) {
      currentUser.draftCommentCount = comment.drafts;
    } else {
      currentUser.draftCommentCount = 0;
    }

    if (comment.hasOwnProperty("defects")) {
      currentUser.defectCommentCount = comment.defects;
    } else {
      currentUser.defectCommentCount = 0;
    }

    if (comment.hasOwnProperty("read")) {
      currentUser.readCommentCount = comment.read;
    } else {
      currentUser.readCommentCount = 0;
    }

    if (comment.hasOwnProperty("unread")) {
      currentUser.unreadCommentCount = comment.unread;
    } else {
      currentUser.unreadCommentCount = 0;
    }

    if (comment.hasOwnProperty("leaveUnread")) {
      currentUser.leaveUnreadCommentCount = comment.leaveUnread;
    } else {
      currentUser.leaveUnreadCommentCount = 0;
    }

    userList.push(currentUser);
  } else {
    console.log(new Date().toJSON(), appConstants.LOG_ERROR, "setReviewerStatistics()", "userList contains duplicates (", comment.user, ")");
  }
}

/**
 * Set data from the provided comment to the user in the provided user list.
 *
 * @param {*} userList
 * @param {*} comment
 * @param {*} appConstants
 */
function setGeneralCommentStatistics(userList, comment, appConstants) {
  var currentUser = {};
  var filteredUserList = userList.filter(user => user.userName === comment.user.userName);
  if (filteredUserList.length === 1) {
    console.log(new Date().toJSON(), appConstants.LOG_INFO, "setReviewerStatistics() Updating Gen. Comment Stats for:", comment.user.userName);
    currentUser = filteredUserList[0];

    if (typeof currentUser.draftCommentCount === "undefined" || currentUser.draftCommentCount === null) {
      currentUser.draftCommentCount = 0;
    }
    if (typeof currentUser.defectCommentCount === "undefined" || currentUser.defectCommentCount === null) {
      currentUser.defectCommentCount = 0;
    }
    if (typeof currentUser.publishedCommentCount === "undefined" || currentUser.publishedCommentCount === null) {
      currentUser.publishedCommentCount = 0;
    }
    if (typeof currentUser.readCommentCount === "undefined" || currentUser.readCommentCount === null) {
      currentUser.readCommentCount = 0;
    }
    if (typeof currentUser.unreadCommentCount === "undefined" || currentUser.unreadCommentCount === null) {
      currentUser.unreadCommentCount = 0;
    }

    if (comment.hasOwnProperty("draft") && comment.draft) {
      currentUser.draftCommentCount++;
    } else if (comment.hasOwnProperty("defectRaised") && comment.defectRaised) {
      currentUser.defectCommentCount++;
    } else {
      currentUser.publishedCommentCount++;
    }

    if (comment.hasOwnProperty("readStatus") && comment.readStatus === "READ") {
      currentUser.readCommentCount++;
    } else {
      currentUser.unreadCommentCount++;
    }
  } else if (filteredUserList.length === 0) {
    console.log(new Date().toJSON(), appConstants.LOG_INFO, "setReviewerStatistics() Setting Gen. Comment Stats for:", comment.user.userName);
    currentUser.userName = comment.user.userName;

    if (comment.hasOwnProperty("draft") && comment.draft) {
      currentUser.draftCommentCount = 1;
      currentUser.defectCommentCount = 0;
      currentUser.publishedCommentCount = 0;
    } else if (comment.hasOwnProperty("defectRaised") && comment.defectRaised) {
      currentUser.draftCommentCount = 0;
      currentUser.defectCommentCount = 1;
      currentUser.publishedCommentCount = 0;
    } else {
      currentUser.draftCommentCount = 0;
      currentUser.defectCommentCount = 0;
      currentUser.publishedCommentCount = 1;
    }

    if (comment.hasOwnProperty("readStatus") && comment.readStatus === "READ") {
      currentUser.readCommentCount = 1;
      currentUser.unreadCommentCount = 0;
    } else {
      currentUser.readCommentCount = 0;
      currentUser.unreadCommentCount = 1;
    }

    userList.push(currentUser);
  } else {
    console.log(new Date().toJSON(), appConstants.LOG_ERROR, "setReviewerStatistics()", "userList contains duplicates (", comment.user.userName, ")");
  }
}

/**
 * Sets/Updates reviewer statistics to the list.
 *
 * @param {*} userList
 * @param {*} comment
 * @param {*} appConstants
 */
function setReviewerStatistics(userList, reviewer, appConstants) {
  var currentUser = {};
  var filteredUserList = userList.filter(user => user.userName === reviewer.userName);
  if (filteredUserList.length === 1) {
    console.log(new Date().toJSON(), appConstants.LOG_INFO, "setReviewerStatistics() Updating Stats for:", reviewer.userName);
    currentUser = filteredUserList[0];
    currentUser.reviewCount++;

    if (typeof currentUser.timeSpent === "undefined" || currentUser.timeSpent === null) {
      currentUser.timeSpent = 0;
      currentUser.avgTimeSpent = 0;
      currentUser.timeSpentReviewCnt = 0;
    }
    if (typeof currentUser.completedReviewCount === "undefined" || currentUser.completedReviewCount === null) {
      currentUser.completedReviewCount = 0;
    }

    if (reviewer.hasOwnProperty("timeSpent") && reviewer.timeSpent > 0) {
      currentUser.timeSpentReviewCnt++;
      currentUser.timeSpent += reviewer.timeSpent;
      if (currentUser.timeSpentReviewCnt == 1) {
        currentUser.avgTimeSpent = reviewer.timeSpent;
      } else {
        currentUser.avgTimeSpent = currentUser.timeSpent / currentUser.timeSpentReviewCnt;
      }
    }

    if (reviewer.hasOwnProperty("completed") && reviewer.completed) {
      currentUser.completedReviewCount++;
    }

    if (typeof currentUser.displayName === "undefined" || currentUser.displayName === null) {
      currentUser.displayName = reviewer.displayName;
    }

    if (typeof currentUser.avatarURL === "undefined" || currentUser.avatarURL === null) {
      currentUser.avatarURL = reviewer.avatarURL;
    }
  } else if (filteredUserList.length === 0) {
    console.log(new Date().toJSON(), appConstants.LOG_INFO, "setReviewerStatistics() Setting Stats for:", reviewer.userName);
    currentUser.userName = reviewer.userName;
    currentUser.displayName = reviewer.displayName;
    currentUser.avatarURL = reviewer.avatarUrl;

    if (reviewer.completed) {
      currentUser.completedReviewCount = 1;
    }

    if (reviewer.hasOwnProperty("timeSpent") && reviewer.timeSpent > 0) {
      currentUser.timeSpent = reviewer.timeSpent;
      currentUser.avgTimeSpent = reviewer.timeSpent;
      currentUser.timeSpentReviewCnt = 1;
    } else {
      currentUser.timeSpent = 0;
      currentUser.avgTimeSpent = 0;
      currentUser.timeSpentReviewCnt = 0;
    }

    currentUser.reviewCount = 1;

    userList.push(currentUser);
  } else {
    console.log(new Date().toJSON(), appConstants.LOG_ERROR, "setReviewerStatistics()", "userList contains duplicates (", reviewer.userName, ")");
  }
}
