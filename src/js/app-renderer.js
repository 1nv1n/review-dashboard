/*
 * Reload the current page (force-refresh)
 */
function reloadPage() {
  window.location.reload(true);
}

/*
 * Launch the 'Server Instances' modal.
 */
function launchServerModal() {
  // jQuery
  $("#serverModal").modal({backdrop: false, keyboard: false, show: true});
  // JavaScript
  // var serverModal = new Modal('#serverModal', {backdrop: true});
  // serverModal.show();
}