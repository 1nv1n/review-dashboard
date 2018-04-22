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
 * Removes the children of the given node.
 *
 * @param {*} node
 */
function removeChildren(node) {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
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

  return num % 2 == 0;
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

  return num % 4 == 0;
}
