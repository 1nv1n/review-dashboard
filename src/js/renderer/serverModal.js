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
    console.log(new Date().toJSON(), appConstants.LOG_INFO, "Adding Server: "+server.instance);
    isServerInputProvided = true;
  } else {
    console.log(new Date().toJSON(), appConstants.LOG_INFO, "Adding Server Instance Input.");
  }

  var serverContainer = document.getElementById("crucibleServerInputDiv");
  var crucibleServerListLength = document.getElementsByClassName("crucible-server").length;

  var outerDiv = document.createElement("div");
  outerDiv.classList.add("input-group");
  outerDiv.classList.add("mb-3");

  var innerDiv = document.createElement("div");
  innerDiv.className = "input-group-prepend";

  var span = document.createElement("span");
  span.classList.add("input-group-text");
  span.classList.add("server-modal-input-https-span");
  span.id = "basic-addon3";
  if(document.getElementById("httpsCheckBox").checked == true) {
    span.innerHTML = "https://";
  } else {
    span.innerHTML = "http://";
  }

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

  var removeButton = document.createElement("button");
  removeButton.classList.add("btn");
  removeButton.classList.add("btn-sm");
  removeButton.classList.add("btn-danger");
  removeButton.classList.add("btn-modal");
  removeButton.setAttribute("onclick", removeCurrentServerInput);
  removeButton.innerHTML = "&nbsp;-&nbsp;";

  innerDiv.appendChild(span);
  outerDiv.appendChild(innerDiv);
  outerDiv.appendChild(input);

  if(crucibleServerListLength > 0) {
    //outerDiv.appendChild(removeButton);
  }

  serverContainer.appendChild(outerDiv);

  // Set focus to added input
  if(document.getElementsByClassName("crucible-"+crucibleServerListLength+1).length == 1) {
    document.getElementsByClassName("crucible-"+crucibleServerListLength+1)[0].focus();
  }
}

/**
 * Remove existing server input elements & add a default one.
 */
function removeServerInput() {
  var crucibleServerInputDivNode = document.getElementById("crucibleServerInputDiv");
  while (crucibleServerInputDivNode.firstChild) {
    crucibleServerInputDivNode.removeChild(crucibleServerInputDivNode.firstChild);
  }
  addServerInstanceInput(null);
}

/**
 * Saves Server list
 */
function saveServerInput() {
  console.log(new Date().toJSON(), appConstants.LOG_INFO, "Saving Server Input.");
  var httpProtocol;
  var currentServerList = [];
  var crucibleServerCollection = document.getElementsByClassName("crucible-server");

  // Prepend HTTP/S
  if(document.getElementById("httpsCheckBox").checked == true) {
    httpProtocol = "https://";
  } else {
    httpProtocol = "http://";
  }
  
  if(crucibleServerCollection.length > 0) {
    for (var serverIdx = 0; serverIdx < crucibleServerCollection.length; serverIdx++) {
      // TODO: Add URL validation here.
      if(crucibleServerCollection[serverIdx].value.length > 0) {
        currentServerList.push(httpProtocol+crucibleServerCollection[serverIdx].value);
      }
    }
  }

  // Send the server list to the main process
  IPC.send("save-crucible-server-list", currentServerList);

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
  if(checkbox.checked == true){
    var httpsSpanCollection = document.getElementsByClassName("server-modal-input-https-span");
    for (var spanIdx = 0; spanIdx < httpsSpanCollection.length; spanIdx++) {
      httpsSpanCollection[spanIdx].innerHTML = "https://";
    }
  }else{
    var httpsSpanCollection = document.getElementsByClassName("server-modal-input-https-span");
    for (var spanIdx = 0; spanIdx < httpsSpanCollection.length; spanIdx++) {
      httpsSpanCollection[spanIdx].innerHTML = "http://";
    }
 }
}