/**
 * JS for operations on the 'Create Review' Modal
 */

// Counter for the cells in the Reviewer table.
let insertedCellCnt = -1;

// Index for the last-inserted cell in the Reviewer table.
let lastInsertedCell = 0;

/**
 * Launch the 'Create Review' modal.
 */
function launchCreateReviewModal() {
  console.log(new Date().toJSON(), _GLOBAL_APP_CONSTANTS.LOG_INFO, "Launching 'Create Review' Modal.");

  // Blackout before opening the Modal
  blackout();

  // jQuery
  $("#createReviewModal").modal({
    backdrop: false,
    keyboard: false,
    focus: true,
    show: true
  });

  // Populate the Crucible serer instances
  populateCrucibleServerRadioDiv("crucibleServerRadioDiv");

  // Populate the Reviewer List
  populateReviewerList();
}

/**
 * Dismiss the 'Create Review' modal.
 */
function dismissCreateReviewModal() {
  console.log(new Date().toJSON(), _GLOBAL_APP_CONSTANTS.LOG_INFO, "Dismissing 'Create Review' Modal.");

  // jQuery
  $("#createReviewModal").modal("hide");

  // Display App Wrapper
  removeBlackout();
}

/**
 * Creates the Server Table used for Review Creation.
 */
function createReviewServerTable() {
  const SERVER_TABLE = document.createElement("table");
  SERVER_TABLE.classList.add("create-review-table");

  return SERVER_TABLE;
}

/**
 * Creates the Server Table Data.
 */
function createServerTableData() {
  const TABLE_DATA = document.createElement("td");
  TABLE_DATA.style = "width:350px";

  return TABLE_DATA;
}

/**
 * Creates the Outer Div for the Server Table.
 */
function createServerTableOuterDiv() {
  const OUTER_DIV = document.createElement("div");
  OUTER_DIV.classList.add("input-group");
  OUTER_DIV.classList.add("radio-input-group");

  return OUTER_DIV;
}

/**
 * Creates the Middle Div for the Server Table.
 */
function createServerTableMiddleDiv() {
  const MIDDLE_DIV = document.createElement("div");
  MIDDLE_DIV.classList.add("input-group-prepend");

  return MIDDLE_DIV;
}

/**
 * Creates the Inner Div for the Server Table.
 */
function createServerTableInnerDiv() {
  const INNER_DIV = document.createElement("div");
  INNER_DIV.classList.add("input-group-text");

  return INNER_DIV;
}

/**
 * Creates the Radio Input for the Crucible Servers.
 *
 * @param {*} serverIdx
 */
function createServerInputRadio(serverIdx) {
  const INPUT_RADIO = document.createElement("input");
  INPUT_RADIO.type = "radio";
  INPUT_RADIO.name = "crucibleServer";
  INPUT_RADIO.value = serverIdx;
  INPUT_RADIO.setAttribute("aria-label", "Radio For Server");

  // Auto-check the first option by default
  if (serverIdx === 0) {
    INPUT_RADIO.checked = true;
  }

  return INPUT_RADIO;
}

/**
 * Creates the 'Disabled Text' that has the value of the Crucible Server instance.
 *
 * @param {*} crucibleInstance
 */
function createServerDisabledText(crucibleInstance) {
  const DIABLED_TEXT = document.createElement("input");
  DIABLED_TEXT.type = "text";
  DIABLED_TEXT.value = crucibleInstance;
  DIABLED_TEXT.classList.add("form-control");
  DIABLED_TEXT.classList.add("form-control-sm");
  DIABLED_TEXT.classList.add("server-input-disabled");
  DIABLED_TEXT.setAttribute("aria-label", "Radio Button Text");
  DIABLED_TEXT.setAttribute("disabled", "disabled");

  return DIABLED_TEXT;
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
  _GLOBAL_REVIEWER_LIST.forEach((reviewer) => {
    addReviewer(reviewer);
  });
}

/**
 * Creates the Reviewer Table & sets it to the Reviewer List Div.
 * Additionally, creates the Reviewer Table Body.
 *
 * If the table exists, returns it.
 */
function createReviewerTable() {
  let reviewerTable = document.getElementById("reviewerTable");
  if (typeof reviewerTable === "undefined" || reviewerTable === null) {
    reviewerTable = document.createElement("table");
    reviewerTable.id = "reviewerTable";

    const REVIEWER_TABLE_BODY = document.createElement("tbody");
    REVIEWER_TABLE_BODY.classList.add("create-review-table");
    reviewerTable.appendChild(REVIEWER_TABLE_BODY);

    document.getElementById("reviewerListDiv").appendChild(reviewerTable);
  }

  return reviewerTable;
}

/**
 * Creates the Outer Div for the Reviewer Table.
 */
function createReviewerTableOuterDiv() {
  const OUTER_DIV = document.createElement("div");
  OUTER_DIV.classList.add("input-group");
  OUTER_DIV.classList.add("mb-2");

  return OUTER_DIV;
}

/**
 * Creates the Table Row for a Reviewer.
 */
function createReviewerTableRow() {
  let reviewerTableRow;

  insertedCellCnt += 1;
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
  const INPUT_ELEMENT = document.createElement("input");
  INPUT_ELEMENT.id = "reviewerIdx" + insertedCellCnt;
  INPUT_ELEMENT.type = "text";
  INPUT_ELEMENT.placeholder = "ID";
  INPUT_ELEMENT.classList.add("form-control");
  INPUT_ELEMENT.classList.add("form-control-sm");
  INPUT_ELEMENT.classList.add("reviewer");
  INPUT_ELEMENT.classList.add("reviewer-" + insertedCellCnt);
  INPUT_ELEMENT.setAttribute("aria-describedby", "basic-addon3");

  if (typeof reviewer !== "undefined" || reviewer !== null) {
    INPUT_ELEMENT.value = reviewer;
  }

  return INPUT_ELEMENT;
}

/**
 * Adds a reviewer to the list
 */
function addReviewer(reviewer) {
  const REVIEWER_TABLE = createReviewerTable();
  const TABLE_DATA = document.createElement("td");
  const OUTER_DIV = createReviewerTableOuterDiv();
  const REVIEWER_TABLE_ROW = createReviewerTableRow();
  const INPUT_ELEMENT = createReviewerInput(reviewer);

  OUTER_DIV.appendChild(INPUT_ELEMENT);
  TABLE_DATA.appendChild(OUTER_DIV);
  REVIEWER_TABLE_ROW.appendChild(TABLE_DATA);
  REVIEWER_TABLE.appendChild(REVIEWER_TABLE_ROW);

  INPUT_ELEMENT.focus();
}

/**
 * Loop through the current reviewer div, set the reviewer list & remove empty/invalid elements.
 */
function consolidateReviewerList() {
  // Clear out the existing list prior to consolidation.
  _GLOBAL_REVIEWER_LIST = [];

  // Set the reviewer list & remove empty/invalid elements.
  Array.from(document.getElementsByClassName("reviewer")).forEach((element) => {
    if (typeof element === "undefined" || element === null || element.value.length <= 0) {
      element.parentNode.parentNode.removeChild(element.parentNode);
    } else {
      _GLOBAL_REVIEWER_LIST.push(element.value);
    }
  });
}

/**
 * Creates a Review.
 */
function createReview() {
  console.log(new Date().toJSON(), _GLOBAL_APP_CONSTANTS.LOG_INFO, "Creating Review.");

  // Add the spinner
  addSpinner(document.getElementById("createReviewIcon").classList);

  // Consolidate Reviewers
  consolidateReviewerList();

  // Get Review Information (ToDo: Validation)
  const serverIdx = document.querySelector('input[name="crucibleServer"]:checked').value;
  const projectKey = document.getElementById("projectKey").value;
  const reviewName = document.getElementById("reviewName").value;
  const reviewDesc = document.getElementById("reviewDesc").value;
  const jiraKey = document.getElementById("jiraKey").value;
  const allowReviewersCheck = document.getElementById("allowReviewerJoinCheck").checked;

  // Send Review Data to the Main Process
  IPC.send("create-review", _GLOBAL_CRUCIBLE_SERVER_LIST[serverIdx].instance, projectKey, reviewName, reviewDesc, jiraKey, allowReviewersCheck, _GLOBAL_REVIEWER_LIST);
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
 * Handle 'Create Review'
 *
 * @param {bool} isCreated
 * @param {String} reviewID
 */
function handleReviewCreated(isCreated, reviewID) {
  console.log(new Date().toJSON(), _GLOBAL_APP_CONSTANTS.LOG_INFO, "handleReviewCreated():isCreated", isCreated, ":reviewID:", reviewID);

  // Remove the spinner
  removeSpinner(document.getElementById("createReviewIcon").classList);

  if (isCreated) {
    // Clear out review-specific fields
    clearReviewSpecificInput();

    // Dismiss the Modal
    dismissCreateReviewModal();
  } else {
    createToast("Failed to create Review.");
  }
}