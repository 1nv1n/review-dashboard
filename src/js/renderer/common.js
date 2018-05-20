/**
 * Reusable Functions
 */

/**
 * Adds the "circle-notch" Font Awesome Spinner to the provided element.
 */
function addSpinner(elementClassList) {
  elementClassList.add("fas");
  elementClassList.add("fa-circle-notch");
  elementClassList.add("fa-spin");
}

/**
 * Removes the "circle-notch" Font Awesome Spinner from the provided element.
 */
function removeSpinner(elementClassList) {
  elementClassList.remove("fas");
  elementClassList.remove("fa-circle-notch");
  elementClassList.remove("fa-spin");
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
 * Removes the 'Sync' icon & adds the spinner to the provided button.
 *
 * @param {*} button
 */
function startRetrievalSpinner(button) {
  // Remove the Sync Icon
  removeSyncIcon(document.getElementById(button).classList);

  // Add the spinner
  addSpinner(document.getElementById(button).classList);
}

/**
 * Adds the 'Sync' icon & removes the spinner to the provided button.
 *
 * @param {*} button
 */
function endRetrievalSpinner(button) {
  // Remove the spinner
  removeSpinner(document.getElementById(button).classList);

  // Add back the Sync Icon
  addSyncIcon(document.getElementById(button).classList);
}

/**
 * Removes the children of the given node.
 *
 * @param {*} node
 */
function removeChildren(node) {
  if (typeof node === "undefined" || node === null) {
    return;
  }

  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

/**
 * Hides the Button & Review Div Containers
 */
function hideContentContainer() {
  document.getElementById("mainButtonContainer").style.display = "none";
  document.getElementById("reviewContainer").style.display = "none";
}

/**
 * Show the Button & Review Div Containers
 */
function showContentContainer() {
  document.getElementById("mainButtonContainer").style.display = "block";
  document.getElementById("reviewContainer").style.display = "block";
}

/**
 * Checks whether the given number is even (0 is considered even).
 *
 * @param {*} num
 */
function isEven(num) {
  if (num === 0) {
    return true;
  }

  return num % 2 === 0;
}

/**
 * Checks whether the given number is a multiple of 4 (0 is considered a multiple of 4).
 *
 * @param {*} num
 */
function isMultipleOfFour(num) {
  if (num === 0) {
    return true;
  }

  return num % 4 === 0;
}

/**
 * Returns whether an element is hidden in the DOM.
 *
 * @param {*} element
 */
function isHidden(element) {
  return element.offsetParent === null;
}

/**
 * Populates the Crucible Server List for the provided Div.
 *
 * @param {String} crucibleServerRadioDiv
 */
function populateCrucibleServerRadioDiv(crucibleServerRadioDiv) {
  console.log(new Date().toJSON(), _GLOBAL_APP_CONSTANTS.LOG_INFO, "Populating Crucible Server Table.");

  // Remove existing
  const crucibleServerRadioDivNode = document.getElementById(crucibleServerRadioDiv);
  removeChildren(crucibleServerRadioDivNode);

  if (typeof _GLOBAL_CRUCIBLE_SERVER_LIST === "undefined" || _GLOBAL_CRUCIBLE_SERVER_LIST == null || _GLOBAL_CRUCIBLE_SERVER_LIST.length === 0) {
    console.log(new Date().toJSON(), _GLOBAL_APP_CONSTANTS.LOG_WARN, "_GLOBAL_CRUCIBLE_SERVER_LIST undefined!");
    createToast("Server list needs at least one entry.");
  } else {
    const SERVER_TABLE = createReviewServerTable();

    let serverTableRow;
    let serverIdx;
    for (serverIdx = 0; serverIdx < _GLOBAL_CRUCIBLE_SERVER_LIST.length; serverIdx++) {
      // If even,
      if (isEven(serverIdx)) {
        // Create row
        serverTableRow = document.createElement("tr");
      }

      const TABLE_DATA = createServerTableData();
      const OUTER_DIV = createServerTableOuterDiv();
      const MIDDLE_DIV = createServerTableMiddleDiv();
      const INNER_DIV = createServerTableInnerDiv();
      const INPUT_RADIO = createServerInputRadio(serverIdx);
      const DISABLED_TEXT = createServerDisabledText(_GLOBAL_CRUCIBLE_SERVER_LIST[serverIdx].instance);

      INNER_DIV.appendChild(INPUT_RADIO);
      MIDDLE_DIV.appendChild(INNER_DIV);
      OUTER_DIV.appendChild(MIDDLE_DIV);
      OUTER_DIV.appendChild(DISABLED_TEXT);
      TABLE_DATA.appendChild(OUTER_DIV);
      serverTableRow.appendChild(TABLE_DATA);
      SERVER_TABLE.appendChild(serverTableRow);
    }

    crucibleServerRadioDivNode.appendChild(SERVER_TABLE);
  }
}

/**
 * Shows the toast message.
 *
 * @param {*} message
 */
function createToast(message) {
  console.log(new Date().toJSON(), _GLOBAL_APP_CONSTANTS.LOG_INFO, "createToast()", message);
  const toastDiv = document.getElementById("toastDiv");
  document.getElementById("toastDesc").innerHTML = message;

  toastDiv.className = "show";
  setTimeout(() => {
    toastDiv.className = toastDiv.className.replace("show", "");
  }, 2000);
}