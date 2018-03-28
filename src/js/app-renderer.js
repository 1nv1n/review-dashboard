/**
 * Reload the current page (force-refresh)
 */
function reloadPage() {
  window.location.reload(true);
}

/**
 * Launch the 'Server Instances' modal.
 */
function launchServerModal() {
  // jQuery
  $("#serverModal").modal({backdrop: false, keyboard: false, show: true});
  // JavaScript
  // var serverModal = new Modal('#serverModal', {backdrop: true});
  // serverModal.show();
}

/**
 * Adds an Input (text) field for additional Server inputs
 */
function addServerInstanceInput() {
  console.log(new Date().toJSON(), AppConstants.LOG_INFO, "Adding Server Instance.");
  var serverContainer = document.getElementById("crucibleServerInputDiv");

  var outerDiv = document.createElement("div");
  outerDiv.classList.add("input-group");
  outerDiv.classList.add("mb-3");

  var innerDiv = document.createElement("div");
  innerDiv.className = "input-group-prepend";

  var span = document.createElement("span");
  span.className = "input-group-text";
  span.id = "basic-addon3"
  span.innerHTML = "https://";

  var input = document.createElement("input");
  input.type = "text";
  input.classList.add("form-control");
  input.classList.add("crucible-server");
  input.id = "basic-url";
  input.setAttribute("aria-describedby","basic-addon3");
  
  innerDiv.appendChild(span);
  outerDiv.appendChild(innerDiv);
  outerDiv.appendChild(input);
  serverContainer.appendChild(outerDiv);
}

/**
 * Saves Server list
 */
function saveServerInput() {
  console.log(new Date().toJSON(), AppConstants.LOG_INFO, "Saving Server Input.");
  var serverList = [];
  var crucibleServerCollection = document.getElementsByClassName('crucible-server');
  for (var serverIdx = 0; serverIdx < crucibleServerCollection.length; serverIdx++) {
    serverList.push(crucibleServerCollection[serverIdx].value);
  }
  console.log(serverList);
}