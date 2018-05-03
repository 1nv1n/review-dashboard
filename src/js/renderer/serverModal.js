/**
 * JS for operations on the Server Modal
 */

/**
 * Launch the 'Server Instances' modal.
 */
function launchServerModal() {
  console.log(new Date().toJSON(), appConstants.LOG_INFO, "Lauching the Server Modal.");

  // Blackout before opening the Modal
  blackout();

  // jQuery
  $("#serverModal").modal({ backdrop: false, keyboard: false, focus: true, show: true });
  // To Do: Switch to JavaScript
  // var serverModal = new Modal('#serverModal', {backdrop: true});
  // serverModal.show();
}

/**
 * Dismiss the Server Modal
 */
function dismissServerModal() {
  console.log(new Date().toJSON(), appConstants.LOG_INFO, "Dismissing the Server Modal.");

  // TODO: Disable dismiss & display toast when there is no input.

  // Remove empty inputs
  normalizeServerInput();

  // jQuery
  $("#serverModal").modal("hide");

  // Display App Wrapper
  removeBlackout();
}

/**
 * Sets the provided server list as the main (global) server list.
 * @param {*} _crucibleServerList 
 */
function setCurrentServerList(_crucibleServerList) {
  // If any saved Crucible server instances were sent up, populate them onto the modal.
  // Else, prompt for them
  if (typeof _crucibleServerList === "undefined" || _crucibleServerList == null || _crucibleServerList.length == 0) {
    // Launch the Server Modal
    launchServerModal();
    addServerInstanceInput(null);
  } else {
    // Set to current list
    crucibleServerList = _crucibleServerList;

    // Add elements from the database to the Modal
    _crucibleServerList.forEach(function(element) {
      addServerInstanceInput(element);
    });
  }
}

/**
 * Adds an Input (text) field for additional Server inputs
 */
function addServerInstanceInput(server) {
  console.log(new Date().toJSON(), appConstants.LOG_INFO, "Adding Server Instance Input.");

  var outerDiv = createServerInputOuterDiv();
  var innerDiv = createServerInputInnerDiv();
  var span = createServerInputSpan();
  var input = createServerInputBox(server);

  innerDiv.appendChild(span);
  outerDiv.appendChild(innerDiv);
  outerDiv.appendChild(input);

  document.getElementById("crucibleServerInputDiv").appendChild(outerDiv);

  input.focus();
}

/**
 * Create the Server Input's Outer DIV.
 */
function createServerInputOuterDiv() {
  var outerDiv = document.createElement("div");
  outerDiv.classList.add("input-group");
  outerDiv.classList.add("mb-3");

  return outerDiv;
}

/**
 * Create the Server Input's Inner DIV.
 */
function createServerInputInnerDiv() {
  var innerDiv = document.createElement("div");
  innerDiv.className = "input-group-prepend";

  return innerDiv;
}

/**
 * Creates the Server Input's "Span" element.
 */
function createServerInputSpan() {
  var span = document.createElement("span");
  span.classList.add("input-group-text");
  span.classList.add("server-modal-input-https-span");
  span.id = "basic-addon3";

  if (document.getElementById("httpsCheckBox").checked == true) {
    span.innerHTML = "https://";
  } else {
    span.innerHTML = "http://";
  }

  return span;
}

/**
 * Creates the Server Input Box.
 *
 * @param {*} server
 */
function createServerInputBox(server) {
  var input = document.createElement("input");
  input.id = "basic-url";
  input.type = "text";
  input.classList.add("form-control");
  input.classList.add("crucible-server");
  input.classList.add("crucible-" + document.getElementsByClassName("crucible-server").length + 1);
  input.setAttribute("aria-describedby", "basic-addon3");

  if (typeof server !== "undefined" && server !== null && server.instance.length > 0) {
    console.log(new Date().toJSON(), appConstants.LOG_INFO, "Setting Server: " + server.instance);

    if (server.instance.startsWith("http://")) {
      input.value = server.instance.substring(7);
    } else if (server.instance.startsWith("https://")) {
      input.value = server.instance.substring(8);
    } else {
      input.value = server.instance;
    }
  }

  return input;
}

/**
 * Remove existing server input elements & add a default one.
 */
function removeServerInput() {
  var crucibleServerInputDivNode = document.getElementById("crucibleServerInputDiv");
  while (crucibleServerInputDivNode.firstChild) {
    crucibleServerInputDivNode.removeChild(crucibleServerInputDivNode.firstChild);
  }
}

/**
 * Saves Server list
 */
function saveServerInput() {
  console.log(new Date().toJSON(), appConstants.LOG_INFO, "Attempting to save Server Input.");

  // Add the spinner to the "Save" button
  addSpinner(document.getElementById("saveServerIcon").classList);

  // Set HTTP/S
  var httpProtocol = setHTTPProtocol();

  // Remove empty inputs
  normalizeServerInput();

  // Create the current Crucible server list
  var currentServerList = setServerList(httpProtocol);

  // Send the server list to the main process
  IPC.send("save-crucible-server-list", currentServerList);
}

/**
 * Returns "https://" if the modal's HTTPS checkbox is checked, "http://" otherwise.
 */
function setHTTPProtocol() {
  if (document.getElementById("httpsCheckBox").checked == true) {
    return "https://";
  } else {
    return "http://";
  }
}

/**
 * Returns all the servers from the Modal in a list with the provided HTTP protocol prefix.
 *
 * @param {*} httpProtocol
 */
function setServerList(httpProtocol) {
  var currentServerList = [];
  Array.from(document.getElementsByClassName("crucible-server")).forEach(function(element) {
    currentServerList.push(httpProtocol + element.value);
  });
  return currentServerList;
}

/**
 * Remove empty input boxes & add a default one if none exist.
 */
function normalizeServerInput() {
  if (document.getElementsByClassName("crucible-server").length === 0) {
    addServerInstanceInput(null);
  } else {
    Array.from(document.getElementsByClassName("crucible-server")).forEach(function(element) {
      if (element === null || element.value === null || element.value.length <= 0) {
        element.parentNode.parentNode.removeChild(element.parentNode);
      }
    });
  }
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
  if (checkbox.checked == true) {
    console.log(new Date().toJSON(), appConstants.LOG_INFO, "Switching to HTTPS.");
    Array.from(document.getElementsByClassName("server-modal-input-https-span")).forEach(function(element) {
      element.innerHTML = "https://";
    });
  } else {
    console.log(new Date().toJSON(), appConstants.LOG_INFO, "Switching to HTTP.");
    Array.from(document.getElementsByClassName("server-modal-input-https-span")).forEach(function(element) {
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
  console.log(new Date().toJSON(), appConstants.LOG_INFO, "handleServerListSave()", currentCrucibleServerList.length, "Server(s)");

  // Set to current list
  crucibleServerList = currentCrucibleServerList;

  // Remove the spinner from the "Save" button.
  removeSpinner(document.getElementById("saveServerIcon").classList);

  // Dismiss the Modal
  dismissServerModal();
}
