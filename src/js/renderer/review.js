/**
 * JS for operations on Reviews
 */

/**
 * Request the main process to retrieve (force-get) "Pending" reviews.
 */
function retrievePendingReviews() {
  // Remove the Sync Icon
  removeSyncIcon(document.getElementById("refreshPendingIcon").classList);

  // Add the spinner
  addSpinner(document.getElementById("refreshPendingIcon").classList);

  // Retrieve
  IPC.send("retrieve-pending", true);
}

/**
 * Send the Review ID to the main process to "Complete".
 * 
 * @param {*} reviewID 
 */
function completeSelectedReview(reviewID) {
  IPC.send("complete-review", reviewID);
}

/**
 * Adds the "Sync" Font Awesome Icon to the provided element.
 */
function addSyncIcon(elementClassList) {
  elementClassList.add("fas");
  elementClassList.add("fa-sync");
}

/**
 * Removes the "Sync" Font Awesome Icon from the provided element.
 */
function removeSyncIcon(elementClassList) {
  elementClassList.remove("fas");
  elementClassList.remove("fa-sync");
}

/**
 * Handle the retrieved Pending Reviews.
 *
 * @param {*} pendingReviewList
 */
function handlePendingRetrieval(pendingReviewList) {
  console.log(new Date().toJSON(), appConstants.LOG_INFO, "handlePendingRetrieval()", "Setting", pendingReviewList.length, "Pending Reviews.");

  // Remove the spinner
  removeSpinner(document.getElementById("refreshPendingIcon").classList);

  // Add back the Sync Icon
  addSyncIcon(document.getElementById("refreshPendingIcon").classList);

  // Update the count on the badge
  document.getElementById("pendingBadge").innerHTML = pendingReviewList.length;

  // Add into the grid
  $("#pendingReviewsTable").jsGrid({
    width: "100%",
    heading: true,
    filtering: true,
    editing: false,
    inserting: false,
    sorting: true,
    paging: true,
    pageSize: 5,
    pageLoading: false,
    data: pendingReviewList,
    autoload: false,
    confirmDeleting: false,
    loadMessage: "Retrieving Pending Reviews...",
    noDataContent: "No Pending Reviews!",
    rowDoubleClick: handleDoubleClick,
    fields: [
      {
        title: "ID",
        align: "left",
        headercss: "table-header",
        name: "ID",
        type: "text",
        width: 75
      },
      {
        title: "Review Title",
        align: "left",
        headercss: "table-header",
        name: "Name",
        type: "text",
        width: 275
      },
      {
        title: "Author",
        align: "left",
        headercss: "table-header",
        name: "Author",
        type: "text",
        width: 100
      },
      {
        title: "Creation",
        align: "left",
        headercss: "table-header",
        name: "Created",
        type: "text",
        width: 50
      },
      {
        type: "pendingReviewControl"
      }
    ],
    controller: {
      loadData: function(filter) {
        return $.grep(pendingReviewList, function(item) {
          return (
            (!filter.ID      || item.ID.indexOf(filter.ID) > -1) &&
            (!filter.Name    || item.Name.indexOf(filter.Name) > -1) &&
            (!filter.Author  || item.Author.indexOf(filter.Author) > -1) &&
            (!filter.Created || item.Created.indexOf(filter.Created) > -1)
          );
        });
      }
    }
  });
  $("#pendingReviewsTable").jsGrid("option", "filtering", false);
}
