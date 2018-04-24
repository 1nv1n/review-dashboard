/**
 * JS for operations on the 'Search' Modal
 */

/**
 * Launch the 'Search' modal.
 */
function launchSearchReviewModal() {
  console.log(new Date().toJSON(), appConstants.LOG_INFO, "Launching Search-Review Modal.");

  // Blackout before opening the Modal
  blackout();

  // jQuery
  $("#searchReviewModal").modal({ backdrop: false, keyboard: false, focus: true, show: true });

  // Populate the Crucible serer instances
  populateCrucibleServerRadioDiv("searchCrucibleServerRadioDiv");
}

/**
 * Dismiss the 'Search' modal.
 */
function dismissSearchReviewModal() {
  console.log(new Date().toJSON(), appConstants.LOG_INFO, "Dismissing Search-Review Modal.");

  // jQuery
  $("#searchReviewModal").modal("hide");

  // Display App Wrapper
  removeBlackout();
}

/**
 * Search for Reviews.
 */
function searchForReview() {
  console.log(new Date().toJSON(), appConstants.LOG_INFO, "Searching for Review.");

  // Remove existing search results
  removeChildren(document.getElementById("searchResultsDiv"));

  // Replace the 'Search' icon with a spinner
  removeSearchIcon(document.getElementById("searchForReviewIcon").classList);
  addSpinner(document.getElementById("searchForReviewIcon").classList);

  // Selected Crucible Server Index
  var serverIdx = document.querySelector('input[name="crucibleServer"]:checked').value;

  // Send JIRA key to the main process to handle
  IPC.send("search-review", crucibleServerList[serverIdx].instance, document.getElementById("jiraSearchKey").value);
}

/**
 * Adds the "search" Font Awesome Icon to the provided element.
 */
function addSearchIcon(elementClassList) {
  elementClassList.add("fas");
  elementClassList.add("fa-search");
}

/**
 * Removes the "search" Font Awesome Icon from the provided element.
 */
function removeSearchIcon(elementClassList) {
  elementClassList.remove("fas");
  elementClassList.remove("fa-search");
}

/**
 * Handle Review Search.
 *
 * @param {*} couldSearch
 * @param {*} reviewData
 */
function handleReviewSearch(couldSearch, reviewData) {
  console.log(new Date().toJSON(), appConstants.LOG_INFO, "Review Search:", couldSearch);

  if (couldSearch) {
    // Set results to the modal's table
    populateSearchResult(reviewData);

    // Replace the spinner with the 'Search' icon.
    removeSpinner(document.getElementById("searchForReviewIcon").classList);
    addSearchIcon(document.getElementById("searchForReviewIcon").classList);
  } else {
    // ToDo: Handle/Display Toast
  }
}

/**
 * Populates the search result to the modal's table.
 *
 * @param {*} reviewData
 */
function populateSearchResult(reviewData) {
  var searchResultTable = createSearchResultTable();

  // Add from the main list
  reviewData.forEach(function(review) {
    var searchResultTableRow = createSearchResultTableRow();
    var reviewIDTableData = createReviewIDTableData(review.permaId.id);
    var reviewNameTableData = createReviewNameTableData(review.name);
    var authorTableData = createAuthorTableData(review.author.avatarUrl, review.author.displayName);

    searchResultTableRow.appendChild(reviewIDTableData);
    searchResultTableRow.appendChild(reviewNameTableData);
    searchResultTableRow.appendChild(authorTableData);

    searchResultTable.appendChild(searchResultTableRow);
  });

  document.getElementById("searchResultsDiv").appendChild(searchResultTable);
}

/**
 * Creates the Search Result Table.
 */
function createSearchResultTable() {
  var searchResultTable = document.createElement("table");
  searchResultTable.classList.add("create-review-table");

  return searchResultTable;
}

/**
 * Creates the Search Result Table Row.
 */
function createSearchResultTableRow() {
  var searchResultTableRow = document.createElement("tr");
  return searchResultTableRow;
}

/**
 * Creates the Search Result Review ID Table Data.
 *
 * @param {*} reviewID
 */
function createReviewIDTableData(reviewID) {
  var reviewIDTableData = document.createElement("td");
  reviewIDTableData.style = "width:150px";
  reviewIDTableData.innerHTML = reviewID;
  return reviewIDTableData;
}

/**
 * Creates the Search Result Review Name Table Data.
 *
 * @param {*} reviewName
 */
function createReviewNameTableData(reviewName) {
  var reviewNameTableData = document.createElement("td");
  reviewNameTableData.style = "width:400px";
  reviewNameTableData.innerHTML = reviewName;
  return reviewNameTableData;
}

/**
 * Creates the Search Result Review Author Table Data.
 *
 * @param {*} avatarURL
 * @param {*} displayName
 */
function createAuthorTableData(avatarURL, displayName) {
  var reviewAuthorTableData = document.createElement("td");

  var authorAvatar = document.createElement("img");
  authorAvatar.alt = "ReviewAuthorAvatar";
  authorAvatar.title = displayName;
  authorAvatar.src = avatarURL;
  authorAvatar.setAttribute("height", "20px");
  authorAvatar.setAttribute("width", "20px");

  reviewAuthorTableData.style = "width:50px";
  reviewAuthorTableData.appendChild(authorAvatar);

  return reviewAuthorTableData;
}
