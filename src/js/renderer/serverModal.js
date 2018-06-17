/**
 * JS for operations on the Server Modal
 */

/**
 * Launch the 'Server Instances' modal.
 */
function launchServerModal() {
  console.log(new Date().toJSON(), _GLOBAL_APP_CONSTANTS.LOG_INFO, "Lauching the Server Modal.");

  // Blackout before opening the Modal
  blackout();

  // jQuery
  $("#serverModal").modal({
    backdrop: false,
    keyboard: false,
    focus: true,
    show: true
  });
  // TODO: Switch from jQuery to JavaScript
  // var serverModal = new Modal('#serverModal', {backdrop: true});
  // serverModal.show();
}

/**
 * Dismiss the Server Modal
 */
function dismissServerModal() {
  console.log(new Date().toJSON(), _GLOBAL_APP_CONSTANTS.LOG_INFO, "Dismissing the Server Modal.");

  // Remove empty inputs
  normalizeServerInput();

  // Display toast when there is no input & do not dismiss.
  if (isServerInputEmpty()) {
    createToast("Server list needs at least one entry.");
    return;
  }

  // jQuery
  $("#serverModal").modal("hide");

  // Remove blackout
  removeBlackout();
}

/**
 * Sets the provided server list as the main (global) server list.
 * @param {*} retrievedServerList
 */
function setCurrentServerList(retrievedServerList) {
  // If any saved Crucible server instances were sent up, populate them onto the modal.
  // Else, prompt for them
  if (typeof retrievedServerList === "undefined" || retrievedServerList == null || retrievedServerList.length === 0) {
    // Launch the Server Modal
    launchServerModal();
    addServerInstanceInput(null);
  } else {
    // Set to current list
    _GLOBAL_CRUCIBLE_SERVER_LIST = retrievedServerList;

    // Add elements from the database to the Modal
    retrievedServerList.forEach(function(element) {
      addServerInstanceInput(element);
    });
  }
}

/**
 * Adds an Input (text) field for additional Server inputs.
 */
function addServerInstanceInput(server) {
  console.log(new Date().toJSON(), _GLOBAL_APP_CONSTANTS.LOG_INFO, "Adding Server Instance Input.");

  const OUTER_DIV = createServerInputOuterDiv();
  const INNER_DIV = createServerInputInnerDiv();
  const SPAN_ELEMENT = createServerInputSpan();
  const INPUT_ELEMENT = createServerInputBox(server);

  INNER_DIV.appendChild(SPAN_ELEMENT);
  OUTER_DIV.appendChild(INNER_DIV);
  OUTER_DIV.appendChild(INPUT_ELEMENT);

  // Append to the modal's Div.
  document.getElementById("crucibleServerInputDiv").appendChild(OUTER_DIV);

  INPUT_ELEMENT.focus();
}

/**
 * Create the Server Input's Outer DIV.
 */
function createServerInputOuterDiv() {
  const OUTER_DIV = document.createElement("div");
  OUTER_DIV.classList.add("input-group");
  OUTER_DIV.classList.add("mb-3");

  return OUTER_DIV;
}

/**
 * Create the Server Input's Inner DIV.
 */
function createServerInputInnerDiv() {
  const INNER_DIV = document.createElement("div");
  INNER_DIV.className = "input-group-prepend";

  return INNER_DIV;
}

/**
 * Creates the Server Input's "Span" element.
 */
function createServerInputSpan() {
  const SPAN_ELEMENT = document.createElement("span");
  SPAN_ELEMENT.classList.add("input-group-text");
  SPAN_ELEMENT.classList.add("server-modal-input-https-span");
  SPAN_ELEMENT.id = "basic-addon3";

  if (document.getElementById("httpsCheckBox").checked === true) {
    SPAN_ELEMENT.innerHTML = "https://";
  } else {
    SPAN_ELEMENT.innerHTML = "http://";
  }

  return SPAN_ELEMENT;
}

/**
 * Creates the Server Input Box.
 *
 * @param {*} server
 */
function createServerInputBox(server) {
  const INPUT_ELEMENT = document.createElement("input");
  INPUT_ELEMENT.id = "basic-url";
  INPUT_ELEMENT.type = "text";
  INPUT_ELEMENT.classList.add("form-control");
  INPUT_ELEMENT.classList.add("crucible-server");
  INPUT_ELEMENT.classList.add("crucible-" + document.getElementsByClassName("crucible-server").length + 1);
  INPUT_ELEMENT.setAttribute("aria-describedby", "basic-addon3");

  if (typeof server !== "undefined" && server !== null && server.instance.length > 0) {
    console.log(new Date().toJSON(), _GLOBAL_APP_CONSTANTS.LOG_INFO, "Setting Server:", server.instance);

    if (server.instance.startsWith("http://")) {
      INPUT_ELEMENT.value = server.instance.substring(7);
    } else if (server.instance.startsWith("https://")) {
      INPUT_ELEMENT.value = server.instance.substring(8);
    } else {
      INPUT_ELEMENT.value = server.instance;
    }
  }

  return INPUT_ELEMENT;
}

/**
 * Remove existing server input elements.
 */
function clearServerInput() {
  const SERVER_INPUT_DIV = document.getElementById("crucibleServerInputDiv");
  while (SERVER_INPUT_DIV.firstChild) {
    SERVER_INPUT_DIV.removeChild(SERVER_INPUT_DIV.firstChild);
  }
}

/**
 * Returns "https://" if the modal's HTTPS checkbox is checked, "http://" otherwise.
 */
function getCurrentHTTP() {
  if (document.getElementById("httpsCheckBox").checked === true) {
    return "https://";
  }

  return "http://";
}

/**
 * Returns all the servers from the Modal in a list with the provided HTTP prefix.
 *
 * @param {*} hTTP
 */
function setServerList(hTTP) {
  const CURRENT_SERVER_LIST = [];
  Array.from(document.getElementsByClassName("crucible-server")).forEach(element => {
    if (element.value.substring(0, 7) === "http://") {
      element.value = element.value.slice(7);
    } else if (element.value.substring(0, 8) === "https://") {
      element.value = element.value.slice(8);
    }

    CURRENT_SERVER_LIST.push(hTTP + element.value);
  });
  return CURRENT_SERVER_LIST;
}

/**
 * Saves Server list
 */
function saveServerInput() {
  console.log(new Date().toJSON(), _GLOBAL_APP_CONSTANTS.LOG_INFO, "Attempting to save Server Input.");

  // Remove empty inputs
  normalizeServerInput();

  // Display toast when there is no input & do not dismiss.
  if (isServerInputEmpty()) {
    createToast("Server list needs at least one entry.");
    return;
  }

  // Add the spinner to the "Save" button
  addSpinner(document.getElementById("saveServerIcon").classList);

  // Set HTTP/S
  const CURRENT_HTTP = getCurrentHTTP();

  // Create the current Crucible server list
  const CURRENT_SERVER_LIST = setServerList(CURRENT_HTTP);

  // If the server list has been updated, re-authentication is necessary (to get tokens for the updated server instances)
  let hasServerListUpdated = false;
  if (_GLOBAL_CRUCIBLE_SERVER_LIST.length !== CURRENT_SERVER_LIST.length) {
    hasServerListUpdated = true;
  }

  if (isGlobalAndCurrentMisMatched(CURRENT_SERVER_LIST)) {
    hasServerListUpdated = true;
  }

  console.log(new Date().toJSON(), _GLOBAL_APP_CONSTANTS.LOG_INFO, "saveServerInput()", "Has the Server list been updated:", hasServerListUpdated);

  // Logout & launch the login modal if the Server list has been updated.
  if (hasServerListUpdated) {
    // For a new/updated server list; authentication needs to happen again to refresh tokens.
    // Unless this is the first time the App is launched, then we have not yet authenticated.
    if (typeof _GLOBAL_USER !== "undefined" && _GLOBAL_USER !== null) {
      IPC.send("logout", 1);
      _GLOBAL_USER = null;
    }

    // Clear existing data because new/updated data will be fetched from the updated server list.
    clearPendingReviewTable();
    clearOpenReviewTable();
    clearChartData();
    clearTableData();

    // Send the server list to the main process.
    IPC.send("save-crucible-server-list", CURRENT_SERVER_LIST);
  } else {
    // Remove the spinner from the "Save" button
    removeSpinner(document.getElementById("saveServerIcon").classList);
  }

  // Dismiss the Server Modal.
  dismissServerModal();
}

/**
 * Returns TRUE if there is a mis-match between the lists of the globally maintained & current Crucible server list.
 *
 * @param {*} CURRENT_SERVER_LIST
 */
function isGlobalAndCurrentMisMatched(CURRENT_SERVER_LIST) {
  _GLOBAL_CRUCIBLE_SERVER_LIST.forEach(element => {
    if (!CURRENT_SERVER_LIST.includes(element.instance)) {
      return true;
    }
  });

  return false;
}

/**
 * Remove empty input boxes & add a default one if none exist.
 */
function normalizeServerInput() {
  if (document.getElementsByClassName("crucible-server").length > 0) {
    Array.from(document.getElementsByClassName("crucible-server")).forEach(element => {
      if (element === null || element.value === null || element.value.length <= 0) {
        element.parentNode.parentNode.removeChild(element.parentNode);
      }
    });
  }

  if (document.getElementsByClassName("crucible-server").length === 0) {
    addServerInstanceInput(null);
  }
}

/**
 * Returns TRUE if the Crucible Server Input is currently empty (there are no crucible-server elements).
 */
function isServerInputEmpty() {
  if (document.getElementsByClassName("crucible-server").length === 0) {
    return true;
  }

  // Also return TRUE if there's only one server element & that element is blank
  if (document.getElementsByClassName("crucible-server").length === 1 && document.getElementsByClassName("crucible-server")[0].value.length === 0) {
    return true;
  }

  return false;
}

/**
 * Remove current server input element
 */
function removeCurrentServerInput() {
  console.log(this);
}

/**
 * Toggle HTTP-HTTPS checked.
 *
 * @param {*} checkbox
 */
function checkServerModalHTTPS(checkbox) {
  if (checkbox.checked === true) {
    console.log(new Date().toJSON(), _GLOBAL_APP_CONSTANTS.LOG_INFO, "Switching to HTTPS.");
    Array.from(document.getElementsByClassName("server-modal-input-https-span")).forEach(element => {
      element.innerHTML = "https://";
    });
  } else {
    console.log(new Date().toJSON(), _GLOBAL_APP_CONSTANTS.LOG_INFO, "Switching to HTTP.");
    Array.from(document.getElementsByClassName("server-modal-input-https-span")).forEach(element => {
      element.innerHTML = "http://";
    });
  }
}

/**
 * Handle Server List Save.
 *
 * @param {*} currentCrucibleServerList
 */
function handleServerListSave(currentCrucibleServerList) {
  console.log(new Date().toJSON(), _GLOBAL_APP_CONSTANTS.LOG_INFO, "handleServerListSave()", currentCrucibleServerList.length, "Server(s)");

  // Set to current list
  _GLOBAL_CRUCIBLE_SERVER_LIST = currentCrucibleServerList;

  // Remove the spinner from the "Save" button.
  removeSpinner(document.getElementById("saveServerIcon").classList);

  // Dismiss the Modal
  dismissServerModal();
}
