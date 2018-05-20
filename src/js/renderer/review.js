/**
 * JS for operations on Reviews
 */

/**
 * Request the main process to retrieve from the Database:
 * - Pending Reviews
 * - Open Reviews
 * - Review Statistics
 */
function retrieveReviewData() {
  retrievePendingReviews();
  retrieveOpenReviews();
  retrieveReviewStatistics();

  // Show Pending Reviews after initial retrieval.
  showPendingReviewDiv();
}

/**
 * Request the main process to force-get from Crucible:
 * - Pending Reviews
 * - Open Reviews
 * - Review Statistics
 */
function getReviewData() {
  getPendingReviews();
  getOpenReviews();
  getReviewStatistics();

  // Show Pending Reviews after initial retrieval.
  showPendingReviewDiv();
}

/**
 * Request the main process to retrieve "Pending" reviews from the Database.
 */
function retrievePendingReviews() {
  startRetrievalSpinner("refreshPendingIcon");
  IPC.send("retrieve-pending", false);
}

/**
 * Request the main process to retrieve "Open" reviews from the Database.
 */
function retrieveOpenReviews() {
  startRetrievalSpinner("refreshOpenIcon");
  IPC.send("retrieve-open", false);
}

/**
 * Request the main process to retrieve review statistics from the Database.
 */
function retrieveReviewStatistics() {
  startRetrievalSpinner("refreshStatisticsIcon");
  IPC.send("retrieve-statistics", false);
}

/**
 * Request the main process to (force-get) "Pending" reviews.
 */
function getPendingReviews() {
  startRetrievalSpinner("refreshPendingIcon");
  IPC.send("retrieve-pending", true);
}

/**
 * Request the main process to (force-get) "Open" reviews.
 */
function getOpenReviews() {
  startRetrievalSpinner("refreshOpenIcon");
  IPC.send("retrieve-open", true);
}

/**
 * Request the main process to (force-get) review staticstics.
 */
function getReviewStatistics() {
  startRetrievalSpinner("refreshStatisticsIcon");
  IPC.send("retrieve-statistics", true);
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
 * Toggles the visibility of the Pending Reviews container.
 * Hides the other two Divs.
 */
function togglePendingReviewsContainter() {
  hideOpenReviewDiv();
  hideReviewStatisticsDiv();

  if (!isPendingReviewDivVisible()) {
    showPendingReviewDiv();
  }
}

/**
 * Toggles the visibility of the Open Reviews container.
 */
function toggleOpenReviewsContainter() {
  hidePendingReviewDiv();
  hideReviewStatisticsDiv();

  if (!isOpenReviewDivVisible()) {
    showOpenReviewDiv();
  }
}

/**
 * Toggles the visibility of the Review Statistics container.
 */
function toggleStatisticsContainer() {
  hideOpenReviewDiv();
  hidePendingReviewDiv();

  if (!isReviewStatisticsDivVisible()) {
    showReviewStatisticsDiv();
  }
}

/**
 * Returns whether the Pending Review Div is visible.
 */
function isPendingReviewDivVisible() {
  return document.getElementById("pendingReviewContainer").style.display === "block";
}

/**
 * Show the Pending Review Div.
 */
function showPendingReviewDiv() {
  document.getElementById("pendingReviewContainer").style.display = "block";
}

/**
 * Hides the Pending Review Div.
 */
function hidePendingReviewDiv() {
  document.getElementById("pendingReviewContainer").style.display = "none";
}

/**
 * Returns whether the Open Review Div is visible.
 */
function isOpenReviewDivVisible() {
  return document.getElementById("openReviewContainer").style.display === "block";
}

/**
 * Show the Open Review Div.
 */
function showOpenReviewDiv() {
  document.getElementById("openReviewContainer").style.display = "block";
}

/**
 * Hides the Open Review Div.
 */
function hideOpenReviewDiv() {
  document.getElementById("openReviewContainer").style.display = "none";
}

/**
 * Returns whether the Review Statistics Div is visible.
 */
function isReviewStatisticsDivVisible() {
  return document.getElementById("reviewStatisticsContainer").style.display === "block";
}

/**
 * Show the Review Statistics Div.
 */
function showReviewStatisticsDiv() {
  document.getElementById("reviewStatisticsContainer").style.display = "block";
  setChart();
}

/**
 * Hides the Review Statistics Div.
 */
function hideReviewStatisticsDiv() {
  document.getElementById("reviewStatisticsContainer").style.display = "none";
}

/**
 * Set an empty array to the Pending review table.
 */
function clearPendingReviewTable() {
  handlePendingRetrieval([]);
}

/**
 * Set an empty array to the Open review table.
 */
function clearOpenReviewTable() {
  handleOpenRetrieval([]);
}

/**
 * Handle the retrieved Pending Reviews.
 *
 * @param {*} pendingReviewList
 */
function handlePendingRetrieval(pendingReviewList) {
  console.log(new Date().toJSON(), _GLOBAL_APP_CONSTANTS.LOG_INFO, "handlePendingRetrieval()", "Setting", pendingReviewList.length, "Pending Review(s).");

  endRetrievalSpinner("refreshPendingIcon");

  // Update the count on the badge
  document.getElementById("pendingBadge").innerHTML = pendingReviewList.length;

  // Add Pending Reviews into the grid
  $("#pendingReviewsTable").jsGrid({
    width: "100%",
    heading: true,
    filtering: true,
    editing: false,
    inserting: false,
    sorting: true,
    paging: true,
    pageSize: 10,
    pageLoading: false,
    data: pendingReviewList,
    autoload: false,
    confirmDeleting: false,
    loadIndication: true,
    loadMessage: "<p style='color: #FFFFFF'>Retrieving Pending Reviews...</p>",
    noDataContent: "<p style='color: #FFFFFF'>No Pending Reviews!</p>",
    rowDoubleClick: handleDoubleClick,
    fields: [{
      title: "ID",
      align: "left",
      name: "reviewID",
      type: "text",
      width: 100
    }, {
      title: "Review Title",
      align: "left",
      name: "reviewName",
      type: "text",
      width: 375
    }, {
      title: "Author",
      align: "left",
      name: "reviewAuthor",
      type: "text",
      width: 125
    }, {
      title: "Creation",
      align: "left",
      name: "createDt",
      type: "text",
      width: 40
    }, {
      type: "pendingReviewControl"
    }],
    controller: {
      loadData: function (filter) {
        return $.grep(pendingReviewList, function (item) {
          return ((!filter.ID || item.ID.indexOf(filter.ID) > -1) &&
            (!filter.Name || item.Name.indexOf(filter.Name) > -1) &&
            (!filter.Author || item.Author.indexOf(filter.Author) > -1) &&
            (!filter.Created || item.Created.indexOf(filter.Created) > -1));
        });
      }
    }
  });
  $("#pendingReviewsTable").jsGrid("option", "filtering", false);
}

/**
 * Handle the retrieved Open Reviews.
 *
 * @param {*} openReviewList
 */
function handleOpenRetrieval(openReviewList) {
  console.log(new Date().toJSON(), _GLOBAL_APP_CONSTANTS.LOG_INFO, "handleOpenRetrieval()", "Setting", openReviewList.length, "Open Review(s).");

  endRetrievalSpinner("refreshOpenIcon");

  // Update the count on the badge
  document.getElementById("openBadge").innerHTML = openReviewList.length;

  // Add Open Reviews into the grid
  $("#openReviewsTable").jsGrid({
    width: "100%",
    heading: true,
    filtering: true,
    editing: false,
    inserting: false,
    sorting: true,
    paging: true,
    pageSize: 10,
    pageLoading: false,
    data: openReviewList,
    autoload: false,
    confirmDeleting: false,
    rowDoubleClick: handleDoubleClick,
    loadMessage: "<p style='color: #FFFFFF'>Retrieving Open Reviews...</p>",
    noDataContent: "<p style='color: #FFFFFF'>No Open Reviews!</p>",
    fields: [{
      title: "ID",
      align: "left",
      name: "reviewID",
      type: "text",
      width: 100
    }, {
      title: "Review Title",
      align: "left",
      name: "reviewName",
      type: "text",
      width: 450
    }, {
      title: "Creation",
      align: "left",
      name: "createDt",
      type: "text",
      width: 40
    }, {
      type: "openReviewControl"
    }],
    controller: {
      loadData: function (filter) {
        return $.grep(openReviewList, function (item) {
          return ((!filter.ID || item.ID.indexOf(filter.ID) > -1) &&
            (!filter.Name || item.Name.indexOf(filter.Name) > -1) &&
            (!filter.Created || item.Created.indexOf(filter.Created) > -1));
        });
      }
    }
  });
  $("#openReviewsTable").jsGrid("option", "filtering", false);
}