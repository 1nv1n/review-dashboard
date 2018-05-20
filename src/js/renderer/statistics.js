/**
 * Handle operations on the Review Statistics Div
 */

let statReviewerList = [];

/**
 * If the 'Chart' button is not enabled:
 *  Toggle the 'Chart' & 'Table' buttons & containers.
 */
function statChartToggle() {
  // Enable the Table Button, but hide the Container
  document.getElementById("statTableButton").disabled = false;
  document.getElementById("statTableContainer").style.display = "none";

  // Disable the Chart Button, but show the Container
  document.getElementById("statChartButton").disabled = true;
  document.getElementById("statChartContainer").style.display = "block";

  setChart();
}

/**
 * If the 'Table' button is not enabled:
 *  Toggle the 'Chart' & 'Table' buttons & containers.
 */
function statTableToggle() {
  // Enable the Chart Button, but hide the Container
  document.getElementById("statChartButton").disabled = false;
  document.getElementById("statChartContainer").style.display = "none";

  // Disable the Table Button, but show the Container
  document.getElementById("statTableButton").disabled = true;
  document.getElementById("statTableContainer").style.display = "block";
}

function clearChartData() {
  statReviewerList = [];
  setChart();
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
  setChart();
}

function setChart() {
  console.log(new Date().toJSON(), _GLOBAL_APP_CONSTANTS.LOG_INFO, "setChart()", "Setting Chart for", statReviewerList.length, "Reviewers.");
  let LABEL_LIST = [];
  let TIME_SPENT_LIST = [];
  let AVG_TIME_SPENT_LIST = [];
  let TOTAL_TIME_BACKGROUND_COLOR_LIST = [];
  let TOTAL_TIME_BORDER_COLOR_LIST = [];
  let AVG_TIME_BACKGROUND_COLOR_LIST = [];
  let AVG_TIME_BORDER_COLOR_LIST = [];

  statReviewerList.forEach((reviewer) => {
    LABEL_LIST.push(reviewer.userName.toUpperCase());
    TIME_SPENT_LIST.push(reviewer.timeSpent / 60000);
    AVG_TIME_SPENT_LIST.push(reviewer.avgTimeSpent / 60000);

    TOTAL_TIME_BORDER_COLOR_LIST.push("rgba(54, 162, 235, 1)");
    TOTAL_TIME_BACKGROUND_COLOR_LIST.push("rgba(54, 162, 235, 0.2)");

    AVG_TIME_BORDER_COLOR_LIST.push("rgba(75, 192, 192, 1)");
    AVG_TIME_BACKGROUND_COLOR_LIST.push("rgba(75, 192, 192, 0.2)");
  });

  let CTX = document.getElementById("statChart").getContext("2d");
  let CHART = new Chart(CTX, {
    type: "bar",
    data: {
      labels: LABEL_LIST,
      datasets: [{
        label: "Total Time Spent (min.)",
        data: TIME_SPENT_LIST,
        backgroundColor: TOTAL_TIME_BACKGROUND_COLOR_LIST,
        borderColor: TOTAL_TIME_BORDER_COLOR_LIST,
        borderWidth: 1
      }]
    },
    options: {
      maintainAspectRatio: false,
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true
          }
        }]
      }
    }
  });
}