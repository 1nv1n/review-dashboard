/**
 * JS for operations on the Info. Modal
 */

/**
 * Launch the 'Info.' modal.
 */
function launchInfoModal() {
  // jQuery
  $("#infoModal").modal({ backdrop: false, keyboard: false, show: true });

  // Blackout before opening the Modal
  blackout();

  // Get the running App version from Electron
  var appVersion = require('electron').remote.app.getVersion();
  
  // Call this initially because the first call always returns 0
  process.getCPUUsage();

  // Set the information to the modal
  document.getElementById("appVersion").innerHTML = appVersion;
  document.getElementById("cpuUsage").innerHTML = process.getCPUUsage().percentCPUUsage + " %";
  document.getElementById("workingSetSize").innerHTML = formatBytes(process.getProcessMemoryInfo().workingSetSize);
  document.getElementById("peakWorkingSetSize").innerHTML = formatBytes(process.getProcessMemoryInfo().peakWorkingSetSize);
  document.getElementById("privateBytes").innerHTML = formatBytes(process.getProcessMemoryInfo().privateBytes);
  document.getElementById("sharedBytes").innerHTML = formatBytes(process.getProcessMemoryInfo().sharedBytes);
  document.getElementById("totalMemory").innerHTML = formatBytes(process.getSystemMemoryInfo().total);
  document.getElementById("freeMemory").innerHTML = formatBytes(process.getSystemMemoryInfo().free);
}

/**
 * Dismiss the Info Modal
 */
function dismissInfoModal() {
  // jQuery
  $("#infoModal").modal('hide');

  // Display App Wrapper
  removeBlackout();
}

/**
 * Formats the input bytes
 * 
 * @param {*} bytes 
 * @param {*} decimalPlaces 
 */
function formatBytes(kilobytes, decimalPlaces) {
  if(0 == kilobytes) {
    return "0 Bytes";
  }
  
  var byteMultiplier = 1024;
  var bytes = kilobytes * byteMultiplier;
  var fractionalDigit = decimalPlaces||2;
  var sizeArr = ["Bytes", "KB", "MB", "GB"," TB", "PB", "EB", "ZB", "YB"];
  var calcBytes = Math.floor(Math.log(bytes)/Math.log(byteMultiplier));
  
  return parseFloat((bytes/Math.pow(byteMultiplier, calcBytes)).toFixed(fractionalDigit)) + " " + sizeArr[calcBytes];
}