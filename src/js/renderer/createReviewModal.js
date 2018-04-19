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

  // Populate the Reviewer List
  populateReviewerList();
}

/**
 * Dismiss the 'Create Review' modal.
 */
function dismissCreateReviewModal() {
  // jQuery
  $("#createReviewModal").modal("hide");

  // Display App Wrapper
  removeBlackout();
}

/**
 * Populate the Crucible serer instances.
 */
function populateCrucibleServerRadioDiv() {
  var crucibleServerRadioDivNode = document.getElementById("crucibleServerRadioDiv");

  // Remove existing
  while (crucibleServerRadioDivNode.firstChild) {
    crucibleServerRadioDivNode.removeChild(crucibleServerRadioDivNode.firstChild);
  }

  if (typeof crucibleServerList === "undefined" || crucibleServerList == null || crucibleServerList.length == 0) {
    // TODO - Handle this
    console.log(new Date().toJSON(), appConstants.LOG_WARN, "crucibleServerList undefined!");
  } else {
    var serverIdx;
    for (serverIdx = 0; serverIdx < crucibleServerList.length; serverIdx++) {
      var outerDiv = document.createElement("div");
      outerDiv.classList.add("input-group");
      outerDiv.classList.add("radio-input-group");

      var middleDiv = document.createElement("div");
      middleDiv.classList.add("input-group-prepend");

      var innerDiv = document.createElement("div");
      innerDiv.classList.add("input-group-text");

      var inputRadio = document.createElement("input");
      inputRadio.type = "radio";
      inputRadio.name = "crucibleServer";
      inputRadio.value = serverIdx;
      inputRadio.setAttribute("aria-label", "Radio For Server");

      // Auto-check the first option by default
      if (serverIdx == 0) {
        inputRadio.checked = true;
      }

      var disabledText = document.createElement("input");
      disabledText.type = "text";
      disabledText.value = crucibleServerList[serverIdx].instance;
      disabledText.classList.add("form-control");
      disabledText.classList.add("form-control-sm");
      disabledText.setAttribute("aria-label", "Radio Button Text");
      disabledText.setAttribute("disabled", "disabled");

      innerDiv.appendChild(inputRadio);
      middleDiv.appendChild(innerDiv);
      outerDiv.appendChild(middleDiv);
      outerDiv.appendChild(disabledText);

      crucibleServerRadioDivNode.appendChild(outerDiv);
    }
  }
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
  // Remove existing
  var reviewerListDivNode = document.getElementById("reviewerListDiv");
  while (reviewerListDivNode.firstChild) {
    reviewerListDivNode.removeChild(reviewerListDivNode.firstChild);
  }

  // Add from the main list
  reviewerList.forEach(function(reviewer) {
    addReviewer(reviewer);
  });
}

/**
 * Adds a reviewer to the list
 */
function addReviewer(reviewer) {
  var reviewerContainer = document.getElementById("reviewerListDiv");
  var currentReviewerListLength = document.getElementsByClassName("reviewer").length;

  var outerDiv = document.createElement("div");
  outerDiv.classList.add("input-group");
  outerDiv.classList.add("mb-2");

  var input = document.createElement("input");
  input.id = currentReviewerListLength + 1
  input.type = "text";
  input.placeholder = "ID";
  input.classList.add("form-control");
  input.classList.add("form-control-sm");
  input.classList.add("reviewer");
  input.classList.add("reviewer-" + currentReviewerListLength + 1);
  input.setAttribute("aria-describedby", "basic-addon3");

  if (typeof reviewer !== "undefined" || reviewer !== null) {
    input.value = reviewer;
  }

  outerDiv.appendChild(input);
  reviewerContainer.appendChild(outerDiv);
}

/**
 * Creates a Review.
 */
function createReview() {
  console.log(new Date().toJSON(), appConstants.LOG_INFO, "Creating Review.");

  // Add the spinner
  var createReviewIconClassList = document.getElementById("createReviewIcon").classList;
  createReviewIconClassList.add("fas");
  createReviewIconClassList.add("fa-circle-notch");
  createReviewIconClassList.add("fa-spin");

  // Consolidate Reviewers
  consolidateReviewerList();

  var serverIdx = document.querySelector('input[name="crucibleServer"]:checked').value;

  var projectKey = document.getElementById("projectKey").value;
  
  var reviewName = document.getElementById("reviewName").value;
  document.getElementById("reviewName").value = "";
  
  var reviewDesc = document.getElementById("reviewDesc").value;
  document.getElementById("reviewDesc").value = "";
  
  var jiraKey = document.getElementById("jiraKey").value;
  document.getElementById("jiraKey").value = "";
  
  var allowReviewersCheck = document.getElementById("allowReviewerJoinCheck").checked;

  // Send Review Data to the Main Process
  IPC.send("create-review", crucibleServerList[serverIdx].instance, projectKey, reviewName, reviewDesc, jiraKey, reviewerList);
}

function consolidateReviewerList() {
  // Clear out the existing list
  reviewerList = [];

  // List that contains the IDs of the elements to remove
  removeIDList = [];

  // Loop through the Reviewer Div & set the reviewer list
  var reviewerListCollection = document.getElementsByClassName("reviewer");
  if(reviewerListCollection.length > 0) {
    for (var reviewerIdx = 0; reviewerIdx < reviewerListCollection.length; reviewerIdx++) {
      if(typeof reviewerListCollection[reviewerIdx] !== "undefined" && reviewerListCollection[reviewerIdx] !== null && reviewerListCollection[reviewerIdx].value.length > 0) {
        console.log('Pushing'+reviewerListCollection[reviewerIdx].value);
        reviewerList.push(reviewerListCollection[reviewerIdx].value);
      } else {
        console.log('To Remove'+reviewerListCollection[reviewerIdx].id);
        removeIDList.push(reviewerListCollection[reviewerIdx].id);
      }
    }
  }

  // Remove empty/invalid elements
  if(removeIDList.length > 0) {
    removeIDList.forEach(function(id) {
      document.getElementById(id).parentNode.parentNode.removeChild(document.getElementById(id).parentNode);
    });
  }
}

/**
 * Handle 'Create Review'
 * 
 * @param {bool} isCreated
 * @param {String} reviewID
 */
function handleReviewCreated(isCreated, reviewID) {
  // Remove the spinner
  var createReviewIconClassList = document.getElementById("createReviewIcon").classList;
  createReviewIconClassList.remove("fas");
  createReviewIconClassList.remove("fa-circle-notch");
  createReviewIconClassList.remove("fa-spin");
  
  if(!isCreated) {
    // Display toast
  }
  
  // Dismiss the Modal
  dismissCreateReviewModal();
}
