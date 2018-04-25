/**
 * JS for operations on Reviews
 */

/**
 * Request the main process to retrieve (force-get) "Pending" reviews.
 */
function retrievePendingReviews() {
  IPC.send("retrieve-pending", true);
}

/**
 * Handle the retrieved Pending Reviews.
 *
 * @param {*} pendingReviewList
 */
function handlePendingRetrieval(pendingReviewList) {
  
}
