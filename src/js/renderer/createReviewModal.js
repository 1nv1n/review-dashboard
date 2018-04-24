/**
 * JS for operations on the 'Create Review' Modal
 */

// Counter for the cells in the Reviewer table.
var insertedCellCnt = -1;
// Index for the last-inserted cell in the Reviewer table.
var lastInsertedCell = 0;

/**
 * Launch the 'Create Review' modal.
 */
function launchCreateReviewModal() {
  console.log(new Date().toJSON(), appConstants.LOG_INFO, "Launching Create-Review Modal.");

  // Blackout before opening the Modal
  blackout();

  // jQuery
  $("#createReviewModal").modal({ backdrop: false, keyboard: false, focus: true, show: true });

  // Populate the Crucible serer instances
  populateCrucibleServerRadioDiv("crucibleServerRadioDiv");

  // Populate the Reviewer List
  populateReviewerList();
}

/**
 * Dismiss the 'Create Review' modal.
 */
function dismissCreateReviewModal() {
  console.log(new Date().toJSON(), appConstants.LOG_INFO, "Dismissing Create-Review Modal.");

  // jQuery
  $("#createReviewModal").modal("hide");

  // Display App Wrapper
  removeBlackout();
}

/**
 * Creates the Server Table used for Review Creation.
 */
function createReviewServerTable() {
  var serverTable = document.createElement("table");
  serverTable.classList.add("create-review-table");

  return serverTable;
}

/**
 * Creates the Server Table Data.
 */
function createServerTableData() {
  var tableData = document.createElement("td");
  tableData.style = "width:350px";

  return tableData;
}

/**
 * Creates the Outer Div for the Server Table.
 */
function createServerTableOuterDiv() {
  var outerDiv = document.createElement("div");
  outerDiv.classList.add("input-group");
  outerDiv.classList.add("radio-input-group");

  return outerDiv;
}

/**
 * Creates the Middle Div for the Server Table.
 */
function createServerTableMiddleDiv() {
  var middleDiv = document.createElement("div");
  middleDiv.classList.add("input-group-prepend");

  return middleDiv;
}

/**
 * Creates the Inner Div for the Server Table.
 */
function createServerTableInnerDiv() {
  var innerDiv = document.createElement("div");
  innerDiv.classList.add("input-group-text");

  return innerDiv;
}

/**
 * Creates the Radio Input for the Crucible Servers.
 *
 * @param {*} serverIdx
 */
function createServerInputRadio(serverIdx) {
  var inputRadio = document.createElement("input");
  inputRadio.type = "radio";
  inputRadio.name = "crucibleServer";
  inputRadio.value = serverIdx;
  inputRadio.setAttribute("aria-label", "Radio For Server");

  // Auto-check the first option by default
  if (serverIdx == 0) {
    inputRadio.checked = true;
  }

  return inputRadio;
}

/**
 * Creates the 'Disabled Text' that has the value of the Crucible Server instance.
 *
 * @param {*} crucibleInstance
 */
function createServerDisabledText(crucibleInstance) {
  var disabledText = document.createElement("input");
  disabledText.type = "text";
  disabledText.value = crucibleInstance;
  disabledText.classList.add("form-control");
  disabledText.classList.add("form-control-sm");
  disabledText.classList.add("server-input-disabled");
  disabledText.setAttribute("aria-label", "Radio Button Text");
  disabledText.setAttribute("disabled", "disabled");

  return disabledText;
}

/**
 * Populates the Review Info Div.
 */
function populateReviewInfoDiv(projectKey) {
  if (typeof projectKey !== "undefined" && projectKey !== null) {
    document.getElementById("projectKey").value = projectKey;
  }
}

/**
 * Populates the Reviewer List
 */
function populateReviewerList() {
  // Remove existing from the Modal.
  removeChildren(document.getElementById("reviewerListDiv"));

  // Reset counters
  insertedCellCnt = -1;
  lastInsertedCell = 0;

  // Add from the main list
  reviewerList.forEach(function(reviewer) {
    addReviewer(reviewer);
  });
}

/**
 * Adds a reviewer to the list
 */
function addReviewer(reviewer) {
  var reviewerTable = createReviewerTable();
  var tableData = document.createElement("td");
  var outerDiv = createReviewerTableOuterDiv();
  var reviewerTableRow = createReviewerTableRow();
  var input = createReviewerInput(reviewer);

  outerDiv.appendChild(input);
  tableData.appendChild(outerDiv);
  reviewerTableRow.appendChild(tableData);
  reviewerTable.appendChild(reviewerTableRow);

  input.focus();
}

/**
 * Creates the Reviewer Table & sets it to the Reviewer List Div.
 * Additionally, creates the Reviewer Table Body.
 *
 * If the table exists, returns it.
 */
function createReviewerTable() {
  var reviewerTable = document.getElementById("reviewerTable");
  if (typeof reviewerTable === "undefined" || reviewerTable === null) {
    reviewerTable = document.createElement("table");
    reviewerTable.id = "reviewerTable";

    var reviewerTableBody = document.createElement("tbody");
    reviewerTableBody.classList.add("create-review-table");
    reviewerTable.appendChild(reviewerTableBody);

    document.getElementById("reviewerListDiv").appendChild(reviewerTable);
  }

  return reviewerTable;
}

/**
 * Creates the Outer Div for the Reviewer Table.
 */
function createReviewerTableOuterDiv() {
  var outerDiv = document.createElement("div");
  outerDiv.classList.add("input-group");
  outerDiv.classList.add("mb-2");

  return outerDiv;
}

/**
 * Creates the Table Row for a Reviewer.
 */
function createReviewerTableRow() {
  var reviewerTableRow;

  insertedCellCnt++;
  if (isMultipleOfFour(insertedCellCnt)) {
    // Create row
    reviewerTableRow = document.createElement("tr");
    reviewerTableRow.id = "revIdx" + insertedCellCnt;
    lastInsertedCell = insertedCellCnt;
  } else {
    // Get last row
    reviewerTableRow = document.getElementById("revIdx" + lastInsertedCell);
  }

  return reviewerTableRow;
}

/**
 * Creates the Reviewer Input for the provided reviewer.
 *
 * @param {*} reviewer
 */
function createReviewerInput(reviewer) {
  var input = document.createElement("input");
  input.id = "reviewerIdx" + insertedCellCnt;
  input.type = "text";
  input.placeholder = "ID";
  input.classList.add("form-control");
  input.classList.add("form-control-sm");
  input.classList.add("reviewer");
  input.classList.add("reviewer-" + insertedCellCnt);
  input.setAttribute("aria-describedby", "basic-addon3");

  if (typeof reviewer !== "undefined" || reviewer !== null) {
    input.value = reviewer;
  }

  return input;
}

/**
 * Creates a Review.
 */
function createReview() {
  console.log(new Date().toJSON(), appConstants.LOG_INFO, "Creating Review.");

  // Add the spinner
  addSpinner(document.getElementById("createReviewIcon").classList);

  // Consolidate Reviewers
  consolidateReviewerList();

  // Get Review Information (ToDo: Validation)
  var serverIdx = document.querySelector('input[name="crucibleServer"]:checked').value;
  var projectKey = document.getElementById("projectKey").value;
  var reviewName = document.getElementById("reviewName").value;
  var reviewDesc = document.getElementById("reviewDesc").value;
  var jiraKey = document.getElementById("jiraKey").value;
  var allowReviewersCheck = document.getElementById("allowReviewerJoinCheck").checked;

  // Send Review Data to the Main Process
  IPC.send("create-review", crucibleServerList[serverIdx].instance, projectKey, reviewName, reviewDesc, jiraKey, allowReviewersCheck, reviewerList);
}

/**
 * Clear review specific inputs (Fields that do not apply for the next review creation).
 */
function clearReviewSpecificInput() {
  document.getElementById("reviewName").value = "";
  document.getElementById("reviewDesc").value = "";
  document.getElementById("jiraKey").value = "";
}

/**
 * Loop through the current reviewer div, set the reviewer list & remove empty/invalid elements.
 */
function consolidateReviewerList() {
  // Clear out the existing list prior to consolidation.
  reviewerList = [];

  // Set the reviewer list & remove empty/invalid elements.
  Array.from(document.getElementsByClassName("reviewer")).forEach(function(element) {
    if (typeof element === "undefined" || element === null || element.value.length <= 0) {
      element.parentNode.parentNode.removeChild(element.parentNode);
    } else {
      reviewerList.push(element.value);
    }
  });
}

/**
 * Handle 'Create Review'
 *
 * @param {bool} isCreated
 * @param {String} reviewID
 */
function handleReviewCreated(isCreated, reviewID) {
  console.log(new Date().toJSON(), appConstants.LOG_INFO, "handleReviewCreated():isCreated", isCreated, ":reviewID:", reviewID);

  // Remove the spinner
  removeSpinner(document.getElementById("createReviewIcon").classList);

  if (isCreated) {
    // Clear out review-specific fields
    clearReviewSpecificInput();

    // Dismiss the Modal
    dismissCreateReviewModal();
  } else {
    // TODO: Display Toast.
  }
}
