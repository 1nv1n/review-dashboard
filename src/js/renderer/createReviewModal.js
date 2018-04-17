/**
 * JS for operations on the 'Create Review' Modal
 */

/**
 * Launch the 'Create Review' modal.
 */
function launchCreateReviewModal() {
  // jQuery
  $("#createReviewModal").modal({ backdrop: false, keyboard: false, show: true });

  // Blackout before opening the Modal
  blackout();

  // Populate the Crucible serer instances
  populateCrucibleServerRadioDiv();
}

/**
 * Dismiss the 'Create Review' modal.
 */
function dismissCreateReviewModal() {
  // jQuery
  $("#createReviewModal").modal('hide');

  // Display App Wrapper
  removeBlackout();
}

/**
 * Populate the Crucible serer instances.
 */
function populateCrucibleServerRadioDiv() {
  var serverContainer = document.getElementById("crucibleServerRadioDiv");

  if(typeof crucibleServerList === "undefined" || crucibleServerList == null || crucibleServerList.length == 0) {
    // TODO - Handle this
    console.log(new Date().toJSON(), appConstants.LOG_WARN, "crucibleServerList undefined!");
  } else {
    var serverIdx;
    for (serverIdx = 0; serverIdx < crucibleServerList.length; serverIdx++) {
      var outestDiv = document.createElement("div");
      outestDiv.classList.add("input-group");

      var outerDiv = document.createElement("div");
      outerDiv.classList.add("input-group-prepend");

      var innerDiv = document.createElement("div");
      innerDiv.classList.add("input-group-text");

      var inputRadio = document.createElement("input");
      inputRadio.type = "radio";
      inputRadio.name = "crucibleServer";
      inputRadio.value = serverIdx;
      inputRadio.classList.add("radio-input-group");
      inputRadio.setAttribute("aria-label", "Radio For Server");

      var disabledText = document.createElement("input");
      disabledText.type = "text";
      disabledText.value = crucibleServerList[serverIdx].instance;
      disabledText.classList.add("form-control");
      disabledText.setAttribute("aria-label", "Radio Button Text");
      disabledText.setAttribute("disabled", "disabled");

      innerDiv.appendChild(inputRadio);
      outerDiv.appendChild(innerDiv);
      outestDiv.appendChild(outerDiv);
      outestDiv.appendChild(disabledText);

      serverContainer.appendChild(outestDiv);
    }
  }
}