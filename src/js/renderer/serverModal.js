/**
 * JS for operations on the Server Modal
 */

/**
 * Launch the 'Server Instances' modal.
 */
function launchServerModal() {
  // jQuery
  $("#serverModal").modal({ backdrop: false, keyboard: false, show: true });
  // JavaScript
  // var serverModal = new Modal('#serverModal', {backdrop: true});
  // serverModal.show();
}

/**
 * Adds an Input (text) field for additional Server inputs
 */
function addServerInstanceInput(server) {
  var isServerInputProvided = false;
  if((typeof(server) !== 'undefined') && (server !== null) && server.instance.length > 0) {
    console.log(new Date().toJSON(), AppConstants.LOG_INFO, "Adding Server: "+server.instance);
    isServerInputProvided = true;
  } else {
    console.log(new Date().toJSON(), AppConstants.LOG_INFO, "Adding Server Instance Input.");
  }

  var serverContainer = document.getElementById("crucibleServerInputDiv");
  var crucibleServerListLength = document.getElementsByClassName("crucible-server").length;

  var outerDiv = document.createElement("div");
  outerDiv.classList.add("input-group");
  outerDiv.classList.add("mb-3");

  var innerDiv = document.createElement("div");
  innerDiv.className = "input-group-prepend";

  var span = document.createElement("span");
  span.className = "input-group-text";
  span.id = "basic-addon3";
  span.innerHTML = "https://";

  var input = document.createElement("input");
  input.type = "text";
  input.classList.add("form-control");
  input.classList.add("crucible-server");
  input.classList.add("crucible-"+crucibleServerListLength+1);
  input.id = "basic-url";
  
  if(isServerInputProvided) {
    input.value = server.instance;
  }
  
  input.setAttribute("aria-describedby", "basic-addon3");

  innerDiv.appendChild(span);
  outerDiv.appendChild(innerDiv);
  outerDiv.appendChild(input);
  serverContainer.appendChild(outerDiv);

  // Set focus to added input
  if(document.getElementsByClassName("crucible-"+crucibleServerListLength+1).length == 1) {
    document.getElementsByClassName("crucible-"+crucibleServerListLength+1)[0].focus();
  }
}

/**
 * Saves Server list
 */
function saveServerInput() {
  console.log(new Date().toJSON(), AppConstants.LOG_INFO, "Saving Server Input.");
  var currentServerList = [];
  var crucibleServerCollection = document.getElementsByClassName("crucible-server");
  
  if(crucibleServerCollection.length > 0) {
    for (var serverIdx = 0; serverIdx < crucibleServerCollection.length; serverIdx++) {
      // TODO: Add URL validation here.
      if(crucibleServerCollection[serverIdx].value.length > 0) {
        currentServerList.push(crucibleServerCollection[serverIdx].value);
      }
    }
  }

  // Send the server list to the main process
  ipc.send("save-crucible-server-list", currentServerList);

  normalizeServerInput();
}

/**
 * Remove empty input boxes & add a default one if none exist.
 */
function normalizeServerInput() {
  var crucibleServerCollection = document.getElementsByClassName("crucible-server");
  
  if(crucibleServerCollection.length > 0) {
    for (var serverIdx = 0; serverIdx < crucibleServerCollection.length; serverIdx++) {
      // Remove empty server input boxes
      if(crucibleServerCollection[serverIdx].value.length <= 0) {
        crucibleServerCollection[serverIdx].parentNode.parentNode.removeChild(crucibleServerCollection[serverIdx].parentNode);
      }
    }
  } else {
    addServerInstanceInput(null);
  }
}