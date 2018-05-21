/**
 * Handle operations on the Review
 */

const API_CONSTANTS = require("../constants/api-constants");
const APP_CONSTANTS = require("../constants/app-constants");
const REQUEST_PROMISE = require("request-promise");
const ELECTRON = require("electron");

const ELECTRON_SHELL = ELECTRON.shell;

// Export all functions.
module.exports = {
  // Create Review
  createReview: function createReview(
    neDB,
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
    console.log(new Date().toJSON(), API_CONSTANTS.LOG_INFO, "createReview()");

    const CREATE_DATE = new Date();
    const DUE_DATE = new Date(CREATE_DATE.getTime() + 604800000); // Default to a one week turnaround

    neDB.find({
      type: "CrucibleToken",
      instance: instanceString
    }, (findErr, crucibleRecords) => {
      if (findErr) {
        console.log(new Date().toJSON(), API_CONSTANTS.LOG_ERROR, "createReview()", findErr);
        return;
      }

      if (crucibleRecords.length === 0) {
        console.log(new Date().toJSON(), API_CONSTANTS.LOG_ERROR, "createReview()", "No Crucible records found while attempting to create the review.");
      } else if (crucibleRecords.length > 1) {
        console.log(
          new Date().toJSON(),
          API_CONSTANTS.LOG_ERROR,
          "createReview()",
          "Multiple Crucible records found while attempting to create the review."
        );
      } else {
        const CREATE_REVIEW_OPTIONS = {
          method: "POST",
          uri: instanceString +
            API_CONSTANTS.CRUCIBLE_REST_BASE_URL +
            API_CONSTANTS.CRUCIBLE_REST_REVIEWS +
            API_CONSTANTS.FEAUTH + crucibleRecords[0].token,
          headers: {
            "User-Agent": "Request-Promise"
          },
          body: {},
          json: true
        };

        if (typeof reviewerList === "undefined" || reviewerList === null || reviewerList.length <= 0) {
          CREATE_REVIEW_OPTIONS.body = {
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
              createDate: CREATE_DATE,
              dueDate: DUE_DATE,
              jiraIssueKey: jiraIssue
            }
          };
        } else {
          CREATE_REVIEW_OPTIONS.body = {
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
              createDate: CREATE_DATE,
              dueDate: DUE_DATE,
              jiraIssueKey: jiraIssue,
              reviewers: {
                reviewer: []
              }
            }
          };

          reviewerList.forEach((element) => {
            CREATE_REVIEW_OPTIONS.body.detailedReviewData.reviewers.reviewer.push({
              userName: element
            });
          });
        }

        REQUEST_PROMISE(CREATE_REVIEW_OPTIONS).then((parsedBody) => {
          console.log(new Date().toJSON(), API_CONSTANTS.LOG_INFO, "createReview()", "Created Review: ", parsedBody.permaId.id);
          mainWindow.webContents.send("review-created", true, parsedBody.permaId.id);
          ELECTRON_SHELL.openExternal(instanceString + API_CONSTANTS.CRUCIBLE_BASE_URL + parsedBody.permaId.id);
        }).catch((err) => {
          console.log(new Date().toJSON(), API_CONSTANTS.LOG_ERROR, "createReview()", "Error Creating Review: ", err);
          mainWindow.webContents.send("review-created", false, "");
        });
      }
    });
  },

  // Search for Reviews by JIRA
  searchByJIRA: function searchByJIRA(mainWindow, instanceString, jiraIssue) {
    console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "searchByJIRA()", "Searching for reviews associated to:", jiraIssue, "on", instanceString);

    const SEARCH_JIRA_OPTIONS = {
      method: "GET",
      uri: instanceString + API_CONSTANTS.CRUCIBLE_REST_BASE_URL + API_CONSTANTS.SEARCH_BY_ISSUE + jiraIssue,
      headers: {
        "User-Agent": "Request-Promise"
      },
      json: true
    };

    REQUEST_PROMISE(SEARCH_JIRA_OPTIONS).then((parsedBody) => {
      if (typeof parsedBody !== "undefined" && parsedBody !== null && parsedBody.reviewData !== null && parsedBody.reviewData.length >= 0) {
        console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "searchByJIRA()", "Found", parsedBody.reviewData.length, "Reviews!");
        mainWindow.webContents.send("search-results", true, parsedBody.reviewData);
      } else {
        console.log(new Date().toJSON(), APP_CONSTANTS.LOG_ERROR, "searchByJIRA()", "Unexpected:", parsedBody);
        mainWindow.webContents.send("search-results", false, "");
      }
    }).catch((err) => {
      console.log(new Date().toJSON(), APP_CONSTANTS.LOG_ERROR, "searchByJIRA()", err);
      mainWindow.webContents.send("search-results", false, "");
    });
  },

  /**
   * Remove existing "Pending" Reviews.
   * GET "Pending" Reviews.
   * Save "Pending" Reviews.
   * Send "Pending" Reviews up to the Renderer.
   */
  getPending: function getPending(neDB, mainWindow) {
    console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "getPending()");
    neDB.remove({
      type: "Pending"
    }, {
      multi: true
    }, (removeErr, numRemoved) => {
      if (removeErr) {
        console.log(new Date().toJSON(), APP_CONSTANTS.LOG_ERROR, "getPending()", removeErr);
      } else {
        console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "getPending()", "Removed", numRemoved, "Existing Pending Review(s).");
        neDB.find({
          type: "CrucibleToken"
        }, (findErr, crucibleRecords) => {
          if (findErr) {
            console.log(new Date().toJSON(), APP_CONSTANTS.LOG_ERROR, "getPending()", findErr);
          } else {
            console.log(
              new Date().toJSON(),
              APP_CONSTANTS.LOG_INFO,
              "getPending()",
              "Found",
              crucibleRecords.length,
              "Crucible instances to query for Pending Reviews."
            );
            var processedInstanceCount = 0;
            getPendingReviews(neDB, mainWindow, processedInstanceCount, crucibleRecords, []);
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
  getOpen: function getOpen(neDB, mainWindow) {
    console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "getOpen()");
    neDB.remove({
      type: "Open"
    }, {
      multi: true
    }, (removeErr, numRemoved) => {
      if (removeErr) {
        console.log(new Date().toJSON(), APP_CONSTANTS.LOG_ERROR, "getOpen()", removeErr);
      } else {
        console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "getOpen()", "Removed", numRemoved, "Existing Open Review(s).");
        neDB.find({
          type: "CrucibleToken"
        }, (findErr, crucibleRecords) => {
          if (findErr) {
            console.log(new Date().toJSON(), APP_CONSTANTS.LOG_ERROR, "getOpen()", findErr);
          } else {
            console.log(
              new Date().toJSON(),
              APP_CONSTANTS.LOG_INFO,
              "getOpen()",
              "Found",
              crucibleRecords.length,
              "Crucible instances to query for Open Reviews."
            );
            var processedInstanceCount = 0;
            getOpenReviews(neDB, mainWindow, processedInstanceCount, crucibleRecords, []);
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
  getStats: function getStats(neDB, mainWindow, currentUser) {
    console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "getStats()");
    neDB.remove({
      type: {
        $in: ["ReviewStat", "ReviewerStat"]
      }
    }, {
      multi: true
    }, (removeErr, numRemoved) => {
      if (removeErr) {
        console.log(new Date().toJSON(), APP_CONSTANTS.LOG_ERROR, "getStats()", removeErr);
      } else {
        console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "getStats()", "Removed", numRemoved, "Statistics.");
        neDB.find({
          type: "CrucibleToken"
        }, (findErr, crucibleRecords) => {
          if (findErr) {
            console.log(new Date().toJSON(), APP_CONSTANTS.LOG_ERROR, "getStats()", findErr);
          } else {
            console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "getStats()", "Found", crucibleRecords.length, "Crucible instances to query for Reviews.");
            var processedInstanceCount = 0;
            getReviewStatistics(neDB, mainWindow, processedInstanceCount, crucibleRecords, currentUser, [], []);
          }
        });
      }
    });
  },

  // Retrieves "Pending" Reviews from the Database & sends them up to the renderer.
  retrievePending: function retrievePending(neDB, mainWindow) {
    neDB.find({
      type: "Pending"
    }, (findErr, pendingReviewList) => {
      if (findErr) {
        console.log(new Date().toJSON(), APP_CONSTANTS.LOG_ERROR, "retrievePending()", findErr);
      } else {
        console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "retrievePending()", "Retrieved", pendingReviewList.length, "Reviews!");
        mainWindow.webContents.send("retrieved-pending", pendingReviewList);
      }
    });
  },

  // Retrieves "Open" Reviews from the Database & sends them up to the renderer.
  retrieveOpen: function retrieveOpen(neDB, mainWindow) {
    neDB.find({
      type: "Open"
    }, (findErr, openReviewList) => {
      if (findErr) {
        console.log(new Date().toJSON(), APP_CONSTANTS.LOG_ERROR, "retrieveOpen()", findErr);
      } else {
        console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "retrieveOpen()", "Retrieved", openReviewList.length, "Reviews!");
        mainWindow.webContents.send("retrieved-open", openReviewList);
      }
    });
  },

  // Retrieves Review Statistics from the Database & sends them up to the renderer.
  retrieveStats: function retrieveStats(neDB, mainWindow) {
    neDB.find({
      type: "ReviewStat"
    }, (findErr, reviewList) => {
      if (findErr) {
        console.log(new Date().toJSON(), APP_CONSTANTS.LOG_ERROR, "retrieveStats()", findErr);
      } else {
        console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "retrieveStats()", "Retrieved Statistics from", reviewList.length, "Reviews!");
        mainWindow.webContents.send("retrieved-review-statistics", reviewList);
      }
    });

    neDB.find({
      type: "ReviewerStat"
    }, (findErr, reviewerList) => {
      if (findErr) {
        console.log(new Date().toJSON(), APP_CONSTANTS.LOG_ERROR, "retrieveStats()", findErr);
      } else {
        console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "retrieveStats()", "Retrieved Statistics from", reviewerList.length, "Reviewers!");
        mainWindow.webContents.send("retrieved-reviewer-statistics", reviewerList);
      }
    });
  },

  // Completes a review.
  completeReview: function completeReview(neDB, mainWindow, instanceString, reviewID) {
    console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "completeReview()", "Completing Review:", reviewID, "on", instanceString);

    neDB.find({
      type: "CrucibleToken",
      instance: instanceString
    }, (findErr, crucibleRecordList) => {
      if (findErr) {
        console.log(new Date().toJSON(), APP_CONSTANTS.LOG_ERROR, "completeReview()", "Errored out on fetching token.", findErr);
      } else {
        if (typeof crucibleRecordList === "undefined" || crucibleRecordList === null || crucibleRecordList.length !== 1) {
          console.log(new Date().toJSON(), APP_CONSTANTS.LOG_ERROR, "completeReview()", "Multiple records found for", instanceString);
          mainWindow.webContents.send("complete-review-failed", reviewID);
          return;
        }

        console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "completeReview()", "Retrieved token for", instanceString);
        const COMPLETE_REVIEW_OPTIONS = {
          method: "POST",
          uri: instanceString +
            API_CONSTANTS.CRUCIBLE_REST_BASE_URL +
            API_CONSTANTS.CRUCIBLE_REST_REVIEWS +
            reviewID +
            API_CONSTANTS.COMPLETE_REVIEW +
            API_CONSTANTS.FEAUTH +
            crucibleRecordList[0].token +
            API_CONSTANTS.COMPLETE_IGNORE_WARN,
          headers: {
            "User-Agent": "Request-Promise"
          },
          body: {},
          json: true
        };

        REQUEST_PROMISE(COMPLETE_REVIEW_OPTIONS).then((parsedBody) => {
          console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "completeReview()", "Completed Review.");
          mainWindow.webContents.send("handle-toast", "Completed Review!");

          // Remove the Pending Review from the DB
          neDB.remove({
            type: "Pending",
            reviewID: reviewID
          }, {
            multi: false
          }, (removeErr, numRemoved) => {
            if (removeErr) {
              console.log(new Date().toJSON(), APP_CONSTANTS.LOG_ERROR, "completeReview()", "Failed to remove Pending Review:", reviewID, removeErr);
            } else {
              console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "completeReview()", "Removed Pending Review:", reviewID);
            }
          });
        }).catch((err) => {
          console.log(new Date().toJSON(), APP_CONSTANTS.LOG_ERROR, "completeReview()", err);
          mainWindow.webContents.send("complete-review-failed", reviewID);
        });
      }
    });
  },

  // Closes a review.
  closeReview: function closeReview(neDB, mainWindow, instanceString, reviewID) {
    console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "closeReview()", "Closing Review:", reviewID, "on", instanceString);

    neDB.find({
      type: "CrucibleToken",
      instance: instanceString
    }, (findErr, crucibleRecordList) => {
      if (findErr) {
        console.log(new Date().toJSON(), APP_CONSTANTS.LOG_ERROR, "closeReview()", "Errored out on fetching token.", findErr);
      } else {
        if (typeof crucibleRecordList === "undefined" || crucibleRecordList === null || crucibleRecordList.length !== 1) {
          console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "closeReview()", "Multiple records found for", instanceString);
          mainWindow.webContents.send("close-review-failed", reviewID);
          return;
        }

        console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "closeReview()", "Retrieved token for", instanceString);
        const CLOSE_REVIEW_OPTIONS = {
          method: "POST",
          uri: instanceString +
            API_CONSTANTS.CRUCIBLE_REST_BASE_URL +
            API_CONSTANTS.CRUCIBLE_REST_REVIEWS +
            reviewID +
            API_CONSTANTS.CLOSE_REVIEW +
            API_CONSTANTS.FEAUTH +
            crucibleRecordList[0].token,
          headers: {
            "User-Agent": "Request-Promise"
          },
          body: {},
          json: true
        };

        REQUEST_PROMISE(CLOSE_REVIEW_OPTIONS).then((parsedBody) => {
          console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "closeReview()", "Closed Review.");
          mainWindow.webContents.send("handle-toast", "Closed Review!");

          // Remove the Open Review from the DB
          neDB.remove({
            type: "Open",
            reviewID: reviewID
          }, {
            multi: false
          }, (removeErr, numRemoved) => {
            if (removeErr) {
              console.log(new Date().toJSON(), APP_CONSTANTS.LOG_ERROR, "closeReview()", "Failed to remove Open Review:", reviewID, removeErr);
            } else {
              console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "closeReview()", "Removed Open Review:", reviewID);
            }
          });
        }).catch((err) => {
          console.log(new Date().toJSON(), APP_CONSTANTS.LOG_ERROR, "closeReview()", err);
          mainWindow.webContents.send("close-review-failed", reviewID);
        });
      }
    });
  },

  // Remind reviewers.
  remindReviewers: function remindReviewers(neDB, mainWindow, instanceString, reviewID) {
    console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "remindReviewers()", "Reminding Reviewers on Review:", reviewID, "on", instanceString);

    neDB.find({
      type: "CrucibleToken",
      instance: instanceString
    }, (findErr, crucibleRecordList) => {
      if (findErr) {
        console.log(new Date().toJSON(), APP_CONSTANTS.LOG_ERROR, "remindReviewers()", "Errored out on fetching token.", findErr);
      } else {
        if (typeof crucibleRecordList === "undefined" || crucibleRecordList === null || crucibleRecordList.length !== 1) {
          console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "remindReviewers()", "Multiple records found for", instanceString);
          mainWindow.webContents.send("remind-reviewers-failed", reviewID);
          return;
        }

        console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "remindReviewers()", "Retrieved token for", instanceString);
        const REMIND_REVIEWERS_OPTIONS = {
          method: "POST",
          uri: instanceString +
            API_CONSTANTS.CRUCIBLE_REST_BASE_URL +
            API_CONSTANTS.CRUCIBLE_REST_REVIEWS +
            reviewID +
            API_CONSTANTS.REMIND_ABOUT_REVIEW +
            API_CONSTANTS.FEAUTH +
            crucibleRecordList[0].token,
          headers: {
            "User-Agent": "Request-Promise"
          },
          body: {},
          json: true
        };

        REQUEST_PROMISE(REMIND_REVIEWERS_OPTIONS).then((parsedBody) => {
          console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "remindReviewers()", "Reminded Reviewers.");
          mainWindow.webContents.send("handle-toast", "Reminded Reviewers!");
        }).catch((err) => {
          console.log(new Date().toJSON(), APP_CONSTANTS.LOG_ERROR, "remindReviewers()", err);
          mainWindow.webContents.send("remind-reviewers-failed", reviewID);
        });
      }
    });
  }
};

/**
 * Retrieves Pending Reviews using Crucible's API.
 *
 * @param {*} neDB
 * @param {*} mainWindow
 * @param {*} processedInstanceCount
 * @param {*} crucibleRecords
 * @param {*} pendingReviewList
 */
function getPendingReviews(neDB, mainWindow, processedInstanceCount, crucibleRecords, pendingReviewList) {
  console.log(
    new Date().toJSON(),
    APP_CONSTANTS.LOG_INFO,
    "getPendingReviews()",
    "Querying",
    crucibleRecords[processedInstanceCount].instance,
    "for Pending Reviews."
  );

  const RETRIEVE_PENDING_OPTIONS = {
    uri: crucibleRecords[processedInstanceCount].instance +
      API_CONSTANTS.CRUCIBLE_REST_BASE_URL +
      API_CONSTANTS.CRUCIBLE_REST_REVIEWS +
      API_CONSTANTS.PENDING_REVIEWS_SIMPLE_FILTER +
      API_CONSTANTS.FEAUTH +
      crucibleRecords[processedInstanceCount].token,
    headers: {
      "User-Agent": "Request-Promise"
    },
    json: true // Automatically parses the JSON string in the response
  };

  REQUEST_PROMISE(RETRIEVE_PENDING_OPTIONS).then((parsedBody) => {
    if (parsedBody.reviewData.length > 0) {
      let utcDate;
      let strDate;

      parsedBody.reviewData.forEach((element) => {
        utcDate = new Date(element.createDate);
        strDate = "Y-m-d"
          .replace("Y", utcDate.getFullYear())
          .replace("m", utcDate.getMonth() + 1)
          .replace("d", utcDate.getDate());

        console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "getPendingReviews()", "Saving Pending Review:", element.permaId.id);
        insertPendingReview(
          neDB,
          crucibleRecords[processedInstanceCount].instance,
          element.permaId.id,
          element.name,
          element.author.displayName,
          strDate
        );

        const PENDING_REVIEW = {
          instance: crucibleRecords[processedInstanceCount].instance,
          reviewID: element.permaId.id,
          reviewName: element.name,
          reviewAuthor: element.author.displayName,
          createDt: strDate
        };
        pendingReviewList.push(PENDING_REVIEW);
      });
    }

    processedInstanceCount += 1;
    if (processedInstanceCount < crucibleRecords.length) {
      getPendingReviews(neDB, mainWindow, processedInstanceCount, crucibleRecords, pendingReviewList);
    } else {
      console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "getPendingReviews()", "Retrieved", pendingReviewList.length, "Reviews!");
      mainWindow.webContents.send("retrieved-pending", pendingReviewList);
    }
  }).catch((err) => {
    console.log(new Date().toJSON(), APP_CONSTANTS.LOG_ERROR, "getPendingReviews()", err);
  });
}

/**
 * Retrieves Open Reviews using Crucible's API.
 *
 * @param {*} neDB
 * @param {*} mainWindow
 * @param {*} processedInstanceCount
 * @param {*} crucibleRecords
 * @param {*} openReviewList
 */
function getOpenReviews(neDB, mainWindow, processedInstanceCount, crucibleRecords, openReviewList) {
  console.log(
    new Date().toJSON(),
    APP_CONSTANTS.LOG_INFO,
    "getOpenReviews()",
    "Querying",
    crucibleRecords[processedInstanceCount].instance,
    "for Open Reviews."
  );

  const RETRIEVE_OPEN_OPTIONS = {
    uri: crucibleRecords[processedInstanceCount].instance +
      API_CONSTANTS.CRUCIBLE_REST_BASE_URL +
      API_CONSTANTS.CRUCIBLE_REST_REVIEWS +
      API_CONSTANTS.OPEN_REVIEWS_SIMPLE_FILTER +
      API_CONSTANTS.FEAUTH +
      crucibleRecords[processedInstanceCount].token,
    headers: {
      "User-Agent": "Request-Promise"
    },
    json: true // Automatically parses the JSON string in the response
  };

  REQUEST_PROMISE(RETRIEVE_OPEN_OPTIONS).then((parsedBody) => {
    if (parsedBody.reviewData.length > 0) {
      let utcDate;
      let strDate;

      parsedBody.reviewData.forEach((element) => {
        utcDate = new Date(element.createDate);
        strDate = "Y-m-d"
          .replace("Y", utcDate.getFullYear())
          .replace("m", utcDate.getMonth() + 1)
          .replace("d", utcDate.getDate());

        console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "getOpenReviews()", "Saving Open Review:", element.permaId.id);
        insertOpenReview(
          neDB,
          crucibleRecords[processedInstanceCount].instance,
          element.permaId.id,
          element.name,
          strDate
        );

        const OPEN_REVIEW = {
          instance: crucibleRecords[processedInstanceCount].instance,
          reviewID: element.permaId.id,
          reviewName: element.name,
          reviewAuthor: element.author.displayName,
          createDt: strDate
        };
        openReviewList.push(OPEN_REVIEW);
      });
    }

    processedInstanceCount += 1;
    if (processedInstanceCount < crucibleRecords.length) {
      getOpenReviews(neDB, mainWindow, processedInstanceCount, crucibleRecords, openReviewList);
    } else {
      console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "getOpenReviews()", "Retrieved", openReviewList.length, "Reviews!");
      mainWindow.webContents.send("retrieved-open", openReviewList);
    }
  }).catch((err) => {
    console.log(new Date().toJSON(), APP_CONSTANTS.LOG_ERROR, "getOpenReviews()", err);
  });
}

/**
 * Retrieves Review Statistics using Crucible's API.
 *
 * @param {*} neDB
 * @param {*} mainWindow
 * @param {*} processedInstanceCount
 * @param {*} crucibleRecords
 * @param {*} currentUser
 * @param {*} reviewStatistics
 * @param {*} reviewerStatistics
 */
function getReviewStatistics(
  neDB,
  mainWindow,
  processedInstanceCount,
  crucibleRecords,
  currentUser,
  reviewStatistics,
  reviewerStatistics
) {
  console.log(
    new Date().toJSON(),
    APP_CONSTANTS.LOG_INFO,
    "getReviewStatistics()",
    "Querying",
    crucibleRecords[processedInstanceCount].instance,
    "to gather Review Statistics."
  );

  const RETRIEVE_ALL_OPTIONS = {
    uri: crucibleRecords[processedInstanceCount].instance +
      API_CONSTANTS.CRUCIBLE_REST_BASE_URL +
      API_CONSTANTS.CRUCIBLE_REST_REVIEWS +
      API_CONSTANTS.FILTER_DETAILS +
      API_CONSTANTS.FEAUTH +
      crucibleRecords[processedInstanceCount].token +
      API_CONSTANTS.CREATOR +
      currentUser.userID,
    headers: {
      "User-Agent": "Request-Promise"
    },
    json: true // Automatically parses the JSON string in the response
  };

  REQUEST_PROMISE(RETRIEVE_ALL_OPTIONS).then((parsedBody) => {
    if (parsedBody.detailedReviewData.length > 0) {
      parsedBody.detailedReviewData.forEach((element) => {
        const CURRENT_REVIEW = {};
        let utcDate;

        utcDate = new Date(element.createDate);
        CURRENT_REVIEW.createDate = "Y-m-d"
          .replace("Y", utcDate.getFullYear())
          .replace("m", utcDate.getMonth() + 1)
          .replace("d", utcDate.getDate());

        if (element.hasOwnProperty("dueDate")) {
          utcDate = new Date(element.dueDate);
          CURRENT_REVIEW.dueDate = "Y-m-d"
            .replace("Y", utcDate.getFullYear())
            .replace("m", utcDate.getMonth() + 1)
            .replace("d", utcDate.getDate());
        }

        if (element.hasOwnProperty("closeDate")) {
          CURRENT_REVIEW.closeDate = new Date(element.closeDate);
        }

        if (element.hasOwnProperty("jiraIssueKey")) {
          CURRENT_REVIEW.jiraIssueKey = element.jiraIssueKey;
        }

        if (element.hasOwnProperty("name")) {
          CURRENT_REVIEW.name = new Date(element.jiraIssueKey);
        }

        CURRENT_REVIEW.id = element.permaId.id;

        if (element.hasOwnProperty("stats")) {
          element.stats.forEach((statComment) => {
            if (statComment.user !== currentUser.userID) {
              setUserCommentStatistics(reviewerStatistics, statComment);
            }
          });
        }

        if (element.hasOwnProperty("generalComments") && element.generalComments.hasOwnProperty("comments")) {
          element.generalComments.comments.forEach((genComment) => {
            if (genComment.user.userName !== currentUser.userID) {
              setGeneralCommentStatistics(reviewerStatistics, genComment);
            }
          });
        }

        if (element.hasOwnProperty("reviewers") && element.reviewers.hasOwnProperty("reviewer")) {
          element.reviewers.reviewer.forEach((reviewerElement) => {
            if (reviewerElement.userName !== currentUser.userID) {
              setReviewerStatistics(reviewerStatistics, reviewerElement);
            }
          });
        }

        console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "getReviewStatistics()", "Saving Statistics for Review:", CURRENT_REVIEW.id);
        insertReviewStat(neDB, crucibleRecords[processedInstanceCount].instance, CURRENT_REVIEW);
        reviewStatistics.push(CURRENT_REVIEW);
      });
    }

    processedInstanceCount += 1;
    if (processedInstanceCount < crucibleRecords.length) {
      getReviewStatistics(
        neDB,
        mainWindow,
        processedInstanceCount,
        crucibleRecords,
        currentUser,
        reviewStatistics,
        reviewerStatistics
      );
    } else {
      console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "getReviewStatistics()", "Saving Statistics for", reviewerStatistics.length, " Reviewers.");
      insertReviewerStat(neDB, reviewerStatistics);
      mainWindow.webContents.send("retrieved-review-statistics", reviewStatistics);
      mainWindow.webContents.send("retrieved-reviewer-statistics", reviewerStatistics);
    }
  }).catch((err) => {
    console.log(new Date().toJSON(), APP_CONSTANTS.LOG_ERROR, "getReviewStatistics()", err);
  });
}

/**
 * Inserts a Pending Review into the Database.
 *
 * @param {*} neDB
 * @param {*} instanceString
 * @param {*} reviewID
 * @param {*} reviewName
 * @param {*} reviewAuthor
 * @param {*} createDt
 */
function insertPendingReview(neDB, instanceString, reviewID, reviewName, reviewAuthor, createDt) {
  console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "insertPendingReview()", "Inserting:", reviewID);
  neDB.insert({
    type: "Pending",
    instance: instanceString,
    reviewID: reviewID,
    reviewName: reviewName,
    reviewAuthor: reviewAuthor,
    createDt: createDt
  }, (err, insertedRecord) => {
    if (err) {
      console.log(new Date().toJSON(), APP_CONSTANTS.LOG_ERROR, "insertPendingReview()", err);
    } else {
      console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "insertPendingReview()", "Inserted Pending Review.", insertedRecord.reviewID);
    }
  });
}

/**
 * Inserts an Open Review into the Database.
 *
 * @param {*} neDB
 * @param {*} instanceString
 * @param {*} reviewID
 * @param {*} reviewName
 * @param {*} createDt
 */
function insertOpenReview(neDB, instanceString, reviewID, reviewName, createDt) {
  console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "insertPendingReview()", "Inserting:", reviewID);
  neDB.insert({
    type: "Open",
    instance: instanceString,
    reviewID: reviewID,
    reviewName: reviewName,
    createDt: createDt
  }, (err, insertedRecord) => {
    if (err) {
      console.log(new Date().toJSON(), APP_CONSTANTS.LOG_ERROR, "insertOpenReview()", err);
    } else {
      console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "insertOpenReview()", "Inserted Open Review:", insertedRecord.reviewID);
    }
  });
}

/**
 * Inserts a Review's statistics into the Database.
 *
 * @param {*} neDB
 * @param {*} instanceString
 * @param {*} review
 */
function insertReviewStat(neDB, instanceString, review) {
  console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "insertPendingReview()", "Inserting:", review.id);
  neDB.insert({
    type: "ReviewStat",
    instance: instanceString,
    review: review
  }, (err, insertedRecord) => {
    if (err) {
      console.log(new Date().toJSON(), APP_CONSTANTS.LOG_ERROR, "insertReviewStat()", err);
    } else {
      console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "insertReviewStat()", "Inserted Review:", insertedRecord.review.id);
    }
  });
}

/**
 * Inserts Reviewer statistics into the Database.
 *
 * @param {*} neDB
 * @param {*} reviewerStatistics
 */
function insertReviewerStat(neDB, reviewerStatistics) {
  reviewerStatistics.forEach((reviewer) => {
    neDB.insert({
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
    }, (err, insertedRecord) => {
      if (err) {
        console.log(new Date().toJSON(), APP_CONSTANTS.LOG_ERROR, "insertReviewStat()", err);
      } else {
        console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "insertReviewStat()", "Inserted Reviewer:", insertedRecord.userName);
      }
    });
  });
}

/**
 * Set data from the provided comment to the user in the provided user list.
 *
 * @param {*} userList
 * @param {*} comment
 */
function setUserCommentStatistics(userList, comment) {
  let currentUser = {};
  const FILTERED_USER_LIST = userList.filter(user => user.userName === comment.user);
  if (FILTERED_USER_LIST.length === 1) {
    console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "setReviewerStatistics() Updating Comment Stats for:", comment.user);
    currentUser = FILTERED_USER_LIST[0];

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
  } else if (FILTERED_USER_LIST.length === 0) {
    console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "setReviewerStatistics() Setting Comment Stats for:", comment.user);
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
    console.log(new Date().toJSON(), APP_CONSTANTS.LOG_ERROR, "setReviewerStatistics()", "userList contains duplicates (", comment.user, ")");
  }
}

/**
 * Set data from the provided comment to the user in the provided user list.
 *
 * @param {*} userList
 * @param {*} comment
 */
function setGeneralCommentStatistics(userList, comment) {
  let currentUser = {};
  const FILTERED_USER_LIST = userList.filter(user => user.userName === comment.user.userName);
  if (FILTERED_USER_LIST.length === 1) {
    console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "setReviewerStatistics() Updating Gen. Comment Stats for:", comment.user.userName);
    currentUser = FILTERED_USER_LIST[0];

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
      currentUser.draftCommentCount += 1;
    } else if (comment.hasOwnProperty("defectRaised") && comment.defectRaised) {
      currentUser.defectCommentCount += 1;
    } else {
      currentUser.publishedCommentCount += 1;
    }

    if (comment.hasOwnProperty("readStatus") && comment.readStatus === "READ") {
      currentUser.readCommentCount += 1;
    } else {
      currentUser.unreadCommentCount += 1;
    }
  } else if (FILTERED_USER_LIST.length === 0) {
    console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "setReviewerStatistics() Setting Gen. Comment Stats for:", comment.user.userName);
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
    console.log(new Date().toJSON(), APP_CONSTANTS.LOG_ERROR, "setReviewerStatistics()", "userList contains duplicates (", comment.user.userName, ")");
  }
}

/**
 * Sets/Updates reviewer statistics to the list.
 *
 * @param {*} userList
 * @param {*} comment
 */
function setReviewerStatistics(userList, reviewer) {
  let currentUser = {};
  const FILTERED_USER_LIST = userList.filter(user => user.userName === reviewer.userName);
  if (FILTERED_USER_LIST.length === 1) {
    console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "setReviewerStatistics() Updating Stats for:", reviewer.userName);
    currentUser = FILTERED_USER_LIST[0];
    currentUser.reviewCount += 1;

    if (typeof currentUser.timeSpent === "undefined" || currentUser.timeSpent === null) {
      currentUser.timeSpent = 0;
      currentUser.avgTimeSpent = 0;
      currentUser.timeSpentReviewCnt = 0;
    }
    if (typeof currentUser.completedReviewCount === "undefined" || currentUser.completedReviewCount === null) {
      currentUser.completedReviewCount = 0;
    }

    if (reviewer.hasOwnProperty("timeSpent") && reviewer.timeSpent > 0) {
      currentUser.timeSpentReviewCnt += 1;
      currentUser.timeSpent += reviewer.timeSpent;
      if (currentUser.timeSpentReviewCnt === 1) {
        currentUser.avgTimeSpent = reviewer.timeSpent;
      } else {
        currentUser.avgTimeSpent = currentUser.timeSpent / currentUser.timeSpentReviewCnt;
      }
    }

    if (reviewer.hasOwnProperty("completed") && reviewer.completed) {
      currentUser.completedReviewCount += 1;
    }

    if (typeof currentUser.displayName === "undefined" || currentUser.displayName === null) {
      currentUser.displayName = reviewer.displayName;
    }

    if (typeof currentUser.avatarURL === "undefined" || currentUser.avatarURL === null) {
      currentUser.avatarURL = reviewer.avatarURL;
    }
  } else if (FILTERED_USER_LIST.length === 0) {
    console.log(new Date().toJSON(), APP_CONSTANTS.LOG_INFO, "setReviewerStatistics() Setting Stats for:", reviewer.userName);
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
    console.log(new Date().toJSON(), APP_CONSTANTS.LOG_ERROR, "setReviewerStatistics()", "userList contains duplicates (", reviewer.userName, ")");
  }
}