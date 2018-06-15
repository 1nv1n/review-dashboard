/**
 * Handle operations on the Review Statistics Div
 */

let statReviewList = [];
let statReviewerList = [];

/**
 * If the 'Chart' button is not enabled:
 *  Toggle the 'Chart' & 'Table' buttons & containers.
 */
function statChartToggle() {
  console.log(new Date().toJSON(), _GLOBAL_APP_CONSTANTS.LOG_INFO, "statChartToggle()");

  // Enable the Table Button, but hide the Container
  document.getElementById("statTableButton").disabled = false;
  document.getElementById("statTableContainer").style.display = "none";

  // Disable the Chart Button, but show the Container
  document.getElementById("statChartButton").disabled = true;
  document.getElementById("statChartContainer").style.display = "block";

  setTotalTimeChart();
}

/**
 * If the 'Table' button is not enabled:
 *  Toggle the 'Chart' & 'Table' buttons & containers.
 */
function statTableToggle() {
  console.log(new Date().toJSON(), _GLOBAL_APP_CONSTANTS.LOG_INFO, "statTableToggle()");

  // Enable the Chart Button, but hide the Container
  document.getElementById("statChartButton").disabled = false;
  document.getElementById("statChartContainer").style.display = "none";

  // Disable the Table Button, but show the Container
  document.getElementById("statTableButton").disabled = true;
  document.getElementById("statTableContainer").style.display = "block";

  // Disable the Chart Buttons
  document.getElementById("totalTimeChartButton").disabled = true;
  document.getElementById("avgTimeChartButton").disabled = true;
  document.getElementById("commentChartButton").disabled = true;
}

/**
 * Set the Chart for the provided flag.
 *
 * @param {*} optionFlag (0: Total Time, 1: Avg. Time, 2: Comment)
 */
function setChart(optionFlag) {
  console.log(
    new Date().toJSON(),
    _GLOBAL_APP_CONSTANTS.LOG_INFO,
    "setChart()",
    "Setting Chart for",
    statReviewerList.length,
    "Reviewers. (Option",
    optionFlag,
    ")."
  );

  document.getElementById("statChart").remove();
  const CHART_CANVAS = document.createElement("canvas");
  CHART_CANVAS.id = "statChart";
  CHART_CANVAS.height = "30%";
  CHART_CANVAS.width = "100%";
  document.getElementById("statChartContainer").appendChild(CHART_CANVAS);

  let chartLabel = "";
  let secondaryChartLabel = "";

  const LABEL_LIST = [];
  const DATA_LIST = [];
  const SECONDARY_DATA_LIST = [];

  const BORDER_COLOR_LIST = [];
  const BACKGROUND_COLOR_LIST = [];
  const SECONDARY_BORDER_COLOR_LIST = [];
  const SECONDARY_BACKGROUND_COLOR_LIST = [];

  statReviewerList.forEach((reviewer) => {
    LABEL_LIST.push(reviewer.userName.toUpperCase());

    if (typeof optionFlag === "undefined" || optionFlag === null || optionFlag === 0) {
      chartLabel = "Total Time Spent (min.)";
      DATA_LIST.push(reviewer.timeSpent / 60000);
    } else if (optionFlag === 1) {
      chartLabel = "Avg. Time Spent (min.)";
      DATA_LIST.push(reviewer.avgTimeSpent / 60000);
    } else if (optionFlag === 2) {
      chartLabel = "Comments";
      secondaryChartLabel = "Defects";

      DATA_LIST.push(reviewer.publishedCommentCount);
      SECONDARY_DATA_LIST.push(reviewer.defectCommentCount);

      SECONDARY_BORDER_COLOR_LIST.push("rgba(255,99,132,1)");
      SECONDARY_BACKGROUND_COLOR_LIST.push("rgba(255, 99, 132, 0.2)");
    }

    BORDER_COLOR_LIST.push("rgba(54, 162, 235, 1)");
    BACKGROUND_COLOR_LIST.push("rgba(54, 162, 235, 0.2)");
  });

  const CTX = document.getElementById("statChart").getContext("2d");

  if (optionFlag === 2) {
    new Chart(CTX, {
      type: "bar",
      data: {
        labels: LABEL_LIST,
        datasets: [{
          label: chartLabel,
          data: DATA_LIST,
          borderColor: BORDER_COLOR_LIST,
          backgroundColor: BACKGROUND_COLOR_LIST,
          borderWidth: 1
        }, {
          label: secondaryChartLabel,
          data: SECONDARY_DATA_LIST,
          borderColor: SECONDARY_BORDER_COLOR_LIST,
          backgroundColor: SECONDARY_BACKGROUND_COLOR_LIST,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true
      }
    });
  } else {
    new Chart(CTX, {
      type: "bar",
      data: {
        labels: LABEL_LIST,
        datasets: [{
          label: chartLabel,
          data: DATA_LIST,
          backgroundColor: BACKGROUND_COLOR_LIST,
          borderColor: BORDER_COLOR_LIST,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true
      }
    });
  }
}

function makeTimeReadable(timeInMilliSec) {
  let readableTimeStr = "";

  if (timeInMilliSec > 86400000) {
    let dayCounter = 0;
    while (timeInMilliSec > 86400000) {
      dayCounter += 1;
      timeInMilliSec -= 86400000;
    }

    readableTimeStr += dayCounter;
    if (dayCounter === 1) {
      readableTimeStr += " Day, ";
    } else {
      readableTimeStr += " Days, ";
    }
  }

  if (timeInMilliSec > 3600000) {
    let hourCounter = 0;
    while (timeInMilliSec > 3600000) {
      hourCounter += 1;
      timeInMilliSec -= 3600000;
    }

    readableTimeStr += hourCounter;
    if (hourCounter === 1) {
      readableTimeStr += " Hour, ";
    } else {
      readableTimeStr += " Hours, ";
    }
  }

  if (timeInMilliSec > 60000) {
    let minCounter = 0;
    while (timeInMilliSec > 60000) {
      minCounter += 1;
      timeInMilliSec -= 60000;
    }

    readableTimeStr += minCounter;
    if (minCounter === 1) {
      readableTimeStr += " Minute, ";
    } else {
      readableTimeStr += " Minutes, ";
    }
  }

  if (timeInMilliSec > 1000) {
    let secCounter = 0;
    while (timeInMilliSec > 1000) {
      secCounter += 1;
      timeInMilliSec -= 1000;
    }

    readableTimeStr += secCounter;
    if (secCounter === 1) {
      readableTimeStr += " Second, ";
    } else {
      readableTimeStr += " Seconds.";
    }
  }

  return readableTimeStr;
}

/**
 * Set statistics to the table.
 */
function setStatTable() {
  console.log(new Date().toJSON(), _GLOBAL_APP_CONSTANTS.LOG_INFO, "setStatTable()");

  let totalCommentCount = 0;
  let totalTimeSpent = 0;
  let totalAvgTimeSpent = 0;

  statReviewerList.forEach((reviewer) => {
    if (reviewer.hasOwnProperty("defectCommentCount")) {
      totalCommentCount += reviewer.defectCommentCount;
    }

    if (reviewer.hasOwnProperty("draftCommentCount")) {
      totalCommentCount += reviewer.draftCommentCount;
    }

    if (reviewer.hasOwnProperty("publishedCommentCount")) {
      totalCommentCount += reviewer.publishedCommentCount;
    }

    totalTimeSpent += reviewer.timeSpent;
    totalAvgTimeSpent += reviewer.avgTimeSpent;
  });

  let totalTimeSpentStr = makeTimeReadable(totalTimeSpent);
  let avgTimeSpentStr = makeTimeReadable(totalAvgTimeSpent);

  console.log(totalTimeSpentStr);
  console.log(avgTimeSpentStr);

  document.getElementById("statTableReviewCount").innerHTML = statReviewList.length;
  document.getElementById("statTableReviewerCount").innerHTML = statReviewerList.length;
  document.getElementById("statTableCommentCount").innerHTML = totalCommentCount;
  document.getElementById("statTableTotalTimeSpent").innerHTML = totalTimeSpentStr;
  document.getElementById("statTableAvgTimeSpent").innerHTML = avgTimeSpentStr;
}

/**
 * Handle review stat retrieval.
 *
 * @param {*} retrievedReviewList
 */
function handleReviewStatRetrieval(retrievedReviewList) {
  console.log(new Date().toJSON(), _GLOBAL_APP_CONSTANTS.LOG_INFO, "handleReviewStatRetrieval()", "Setting Statistics for", retrievedReviewList.length, "Reviews.");
  statReviewList = retrievedReviewList;
}

/**
 * Handle Stat. Retrieval (Set to Chart)
 *
 * @param {*} retrievedReviewerList
 */
function handleStatRetrieval(retrievedReviewerList) {
  console.log(new Date().toJSON(), _GLOBAL_APP_CONSTANTS.LOG_INFO, "handleStatRetrieval()", "Setting Statistics for", retrievedReviewerList.length, "Reviewers.");
  statReviewerList = retrievedReviewerList;
  endRetrievalSpinner("refreshStatisticsIcon");
  setTotalTimeChart();
  setStatTable();
}

/**
 * Clear out the statistics data.
 */
function clearChartData() {
  statReviewerList = [];
  setTotalTimeChart();
}

/**
 * Clear out the table statistics.
 */
function clearTableData() {
  statReviewList = [];
  document.getElementById("statTableReviewCount").innerHTML = "";
  document.getElementById("statTableReviewerCount").innerHTML = "";
  document.getElementById("statTableCommentCount").innerHTML = "";
  document.getElementById("statTableTotalTimeSpent").innerHTML = "";
  document.getElementById("statTableAvgTimeSpent").innerHTML = "";
}

/**
 * Set Total Time data to the Chart.
 */
function setTotalTimeChart() {
  setChart(0);

  // Diable the Total Time button, enable all else.
  document.getElementById("totalTimeChartButton").disabled = true;
  document.getElementById("avgTimeChartButton").disabled = false;
  document.getElementById("commentChartButton").disabled = false;
}

/**
 * Set Avg. Time data to the Chart.
 */
function setAvgTimeChart() {
  setChart(1);

  // Diable the Avg. Time button, enable all else.
  document.getElementById("totalTimeChartButton").disabled = false;
  document.getElementById("avgTimeChartButton").disabled = true;
  document.getElementById("commentChartButton").disabled = false;
}

/**
 * Set comment data to the Chart.
 */
function setCommentChart() {
  setChart(2);

  // Diable the comment button, enable all else.
  document.getElementById("totalTimeChartButton").disabled = false;
  document.getElementById("avgTimeChartButton").disabled = false;
  document.getElementById("commentChartButton").disabled = true;
}