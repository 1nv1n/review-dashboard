/**
 * JS for operations on the 'Search' Modal
 */

/**
 * Launch the 'Search' modal.
 */
function launchSearchReviewModal() {
  console.log(new Date().toJSON(), _GLOBAL_APP_CONSTANTS.LOG_INFO, "Launching Search-Review Modal.");

  // Blackout before opening the Modal
  blackout();

  // jQuery
  $("#searchReviewModal").modal({
    backdrop: false,
    keyboard: false,
    focus: true,
    show: true
  });

  // Populate the Crucible serer instances
  populateCrucibleServerRadioDiv("searchCrucibleServerRadioDiv");
}

/**
 * Dismiss the 'Search' modal.
 */
function dismissSearchReviewModal() {
  console.log(new Date().toJSON(), _GLOBAL_APP_CONSTANTS.LOG_INFO, "Dismissing Search-Review Modal.");

  // jQuery
  $("#searchReviewModal").modal("hide");

  // Display App Wrapper
  removeBlackout();
}

/**
 * Adds the "Search" Font Awesome Icon to the provided element.
 */
function addSearchIcon(elementClassList) {
  elementClassList.add("fas");
  elementClassList.add("fa-search");
}

/**
 * Removes the "Search" Font Awesome Icon from the provided element.
 */
function removeSearchIcon(elementClassList) {
  elementClassList.remove("fas");
  elementClassList.remove("fa-search");
}

/**
 * Search for Reviews.
 */
function searchForReview() {
  console.log(new Date().toJSON(), _GLOBAL_APP_CONSTANTS.LOG_INFO, "Searching for Review.");

  // Remove existing search results
  removeChildren(document.getElementById("searchResultsDiv"));

  // Replace the 'Search' icon with a spinner
  removeSearchIcon(document.getElementById("searchForReviewIcon").classList);
  addSpinner(document.getElementById("searchForReviewIcon").classList);

  // Selected Crucible Server Index
  const SERVER_IDX = document.querySelector('input[name="crucibleServer"]:checked').value;

  // Send JIRA key to the main process to handle
  IPC.send("search-review", _GLOBAL_CRUCIBLE_SERVER_LIST[SERVER_IDX].instance, document.getElementById("jiraSearchKey").value);
}

/**
 * Handle Review Search.
 *
 * @param {*} couldSearch
 * @param {*} reviewData
 */
function handleReviewSearch(couldSearch, reviewData) {
  console.log(new Date().toJSON(), _GLOBAL_APP_CONSTANTS.LOG_INFO, "Review Search:", couldSearch);

  if (couldSearch) {
    // Set results to the modal's table
    populateSearchResult(reviewData);

    // Replace the spinner with the 'Search' icon.
    removeSpinner(document.getElementById("searchForReviewIcon").classList);
    addSearchIcon(document.getElementById("searchForReviewIcon").classList);
  } else {
    createToast("Search Failed.");
  }
}

/**
 * Sends the Review ID to the main process to open externally.
 */
function handleSearchResultOpen() {
  IPC.send("open-review", this.value, this.innerHTML);
}

/**
 * Creates the Search Result Table.
 */
function createSearchResultTable() {
  const SEARCH_RESULT_TABLE = document.createElement("table");
  SEARCH_RESULT_TABLE.classList.add("create-review-table");

  return SEARCH_RESULT_TABLE;
}

/**
 * Creates the Search Result Table Row.
 */
function createSearchResultTableRow() {
  const SEARCH_RESULT_TABLE_ROW = document.createElement("tr");
  return SEARCH_RESULT_TABLE_ROW;
}

/**
 * Creates the Search Result Review ID Table Data.
 *
 * @param {*} reviewID
 */
function createReviewIDTableData(reviewID) {
  const REVIEW_BUTTON = document.createElement("button");
  REVIEW_BUTTON.innerHTML = reviewID;
  REVIEW_BUTTON.onclick = handleSearchResultOpen;
  REVIEW_BUTTON.classList.add("btn");
  REVIEW_BUTTON.classList.add("btn-sm");
  REVIEW_BUTTON.classList.add("btn-primary");
  REVIEW_BUTTON.setAttribute("value", _GLOBAL_CRUCIBLE_SERVER_LIST[document.querySelector("input[name='crucibleServer']:checked").value].instance);

  const REVIEW_ID_TABLE_DATA = document.createElement("td");
  REVIEW_ID_TABLE_DATA.appendChild(REVIEW_BUTTON);
  REVIEW_ID_TABLE_DATA.style = "width:200px";

  return REVIEW_ID_TABLE_DATA;
}

/**
 * Creates the Search Result Review Name Table Data.
 *
 * @param {*} reviewName
 */
function createReviewNameTableData(reviewName) {
  const REVIEW_NAME_TABLE_DATA = document.createElement("td");
  REVIEW_NAME_TABLE_DATA.style = "width:400px";
  REVIEW_NAME_TABLE_DATA.innerHTML = reviewName;
  return REVIEW_NAME_TABLE_DATA;
}

/**
 * Creates the Search Result Review Author Table Data.
 *
 * @param {*} avatarURL
 * @param {*} displayName
 */
function createAuthorTableData(avatarURL, displayName) {
  const AUTHOR_TABLE_DATA = document.createElement("td");

  const AUTHOR_AVATAR_IMG = document.createElement("img");
  AUTHOR_AVATAR_IMG.alt = "ReviewAuthorAvatar";
  AUTHOR_AVATAR_IMG.title = displayName;
  AUTHOR_AVATAR_IMG.src = avatarURL;
  AUTHOR_AVATAR_IMG.setAttribute("height", "20px");
  AUTHOR_AVATAR_IMG.setAttribute("width", "20px");

  AUTHOR_TABLE_DATA.style = "width:50px";
  AUTHOR_TABLE_DATA.appendChild(AUTHOR_AVATAR_IMG);

  return AUTHOR_TABLE_DATA;
}

/**
 * Populates the search result to the modal's table.
 *
 * @param {*} reviewData
 */
function populateSearchResult(reviewData) {
  const SEARCH_RESULT_TABLE = createSearchResultTable();

  // Add from the main list
  reviewData.forEach((review) => {
    const SEARCH_RESULT_TABLE_ROW = createSearchResultTableRow();
    const REVIEW_ID_TABLE_DATA = createReviewIDTableData(review.permaId.id);
    const REVIEW_NAME_TABLE_DATA = createReviewNameTableData(review.name);
    const authorTableData = createAuthorTableData(review.author.avatarUrl, review.author.displayName);

    SEARCH_RESULT_TABLE_ROW.appendChild(authorTableData);
    SEARCH_RESULT_TABLE_ROW.appendChild(REVIEW_ID_TABLE_DATA);
    SEARCH_RESULT_TABLE_ROW.appendChild(REVIEW_NAME_TABLE_DATA);

    SEARCH_RESULT_TABLE.appendChild(SEARCH_RESULT_TABLE_ROW);
  });

  document.getElementById("searchResultsDiv").appendChild(SEARCH_RESULT_TABLE);
}