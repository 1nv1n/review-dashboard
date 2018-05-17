/**
 * Handle operations on the Review Statistics Div
 */

 var reviewerList = [];

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
  reviewerList = [];
  setChart();
}

/**
 * Handle Stat. Retrieval (Set to Chart)
 *
 * @param {*} retrievedReviewerList
 */
function handleStatRetrieval(retrievedReviewerList) {
  console.log(new Date().toJSON(), appConstants.LOG_INFO, "handleStatRetrieval()", "Setting Statistics for", retrievedReviewerList.length, "Reviewers.");
  reviewerList = retrievedReviewerList;
  endRetrievalSpinner("refreshStatisticsIcon");
}

function setChart() {
  console.log(new Date().toJSON(), appConstants.LOG_INFO, "setChart()", "Setting Chart for", reviewerList.length, "Reviewers.");
  var labelList = [];
  var timeSpentList = [];
  var avgTimeSpentList = [];
  var totalTimeBackgroundColorList = [];
  var totalTimeBorderColorList = [];
  var avgTimeBackgroundColorList = [];
  var avgTimeBorderColorList = [];

  reviewerList.forEach(function(reviewer) {
    labelList.push(reviewer.userName.toUpperCase());
    timeSpentList.push(reviewer.timeSpent / 60000);
    avgTimeSpentList.push(reviewer.avgTimeSpent / 60000);

    totalTimeBackgroundColorList.push("rgba(54, 162, 235, 0.2)");
    totalTimeBorderColorList.push("rgba(54, 162, 235, 1)");
    
    avgTimeBackgroundColorList.push("rgba(75, 192, 192, 0.2)");
    avgTimeBorderColorList.push("rgba(75, 192, 192, 1)");
  });

  var ctx = document.getElementById("statChart").getContext("2d");
  var myChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labelList,
      datasets: [
        {
          label: "Total Time Spent (min.)",
          data: timeSpentList,
          backgroundColor: totalTimeBackgroundColorList,
          borderColor: totalTimeBorderColorList,
          borderWidth: 1
        }
      ]
    },
    options: {
      maintainAspectRatio: false,
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true
            }
          }
        ]
      }
    }
  });
}
