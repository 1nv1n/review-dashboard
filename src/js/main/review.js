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
    instanceString,
    currentUser,
    projectKey,
    reviewName,
    reviewDescription,
    jiraIssue,
    allowReviewersToJoin,
    reviewerList
  ) {
    var createDate = new Date();
    var dueDate = new Date(createDate.getTime() + 604800000); // Default to a one week turnaround

    neDB.find(
      {
        type: "CrucibleToken",
        instance: instanceString
      },
      function(err, crucibleRecords) {
        if (err) {
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
                shell.openExternal(instanceString + apiConstants.CRUCIBLE_BASE_URL + parsedBody.permaId.id);
              })
              .catch(function(err) {
                console.log(new Date().toJSON(), appConstants.LOG_ERROR, "createReview()", "Error Creating Review: " + err);
              });
          }
        }
      }
    );
  }
};
