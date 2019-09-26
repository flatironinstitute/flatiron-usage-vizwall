// Preloading of API Queries for new data
console.log("preloading starts now");
const base64 = require("base-64");
const moment = require("moment");
const Chart = require("chart.js");

let dataMaster = [];

function setLastMeasuredTime() {
  const element = document.getElementById("lastMeasuredTime");
  let now = moment().format("MMMM Do YYYY, h:mm:ss a");
  if (element) {
    element.innerText = `${now}`;
  }
}

let queries = [
  {
    name: "cpuFree",
    label: "Free CPUs (non-GPU) by location",
    query:
      'sort(sum(slurm_node_cpus{state="free",nodes!="gpu"}) by (cluster,nodes)) '
  },
  {
    name: "cpuPercentChart",
    label: "Percent Free CPUs (non-GPU) by location",
    query:
      'sum(slurm_node_cpus{state="free",nodes!="gpu"}) by (cluster,nodes) / sum(slurm_node_cpus{nodes!="gpu"}) by (cluster,nodes)'
  },
  {
    name: "cpuTotal",
    label: "Total CPUs (non-GPU) by location",
    query: 'sum(slurm_node_cpus{nodes!="gpu"}) by (cluster,nodes)'
  },
  {
    name: "gpuFree",
    label: "GPUs free by location",
    query:
      'sort(sum(slurm_node_gpus{state="free",nodes="gpu"}) by (cluster,nodes))'
  },
  {
    name: "gpuTotal",
    label: "Total GPUs by location",
    query: 'sum(slurm_node_cpus{nodes="gpu"}) by (cluster,nodes)'
  }
];

// Fetch data from Prometheus.
async function fetchData(queryObj) {
  let base = "http://prometheus.flatironinstitute.org/api/v1/query?query=";
  let url = base + encodeURI(queryObj.query);
  return await fetch(url, {
    headers: new Headers({
      Authorization: `Basic ${base64.encode(`prom:etheus`)}`
    })
  })
    .then(res => res.json())
    .then(body => {
      if (body.status === "success") {
        return body.data.result;
      } else {
        return {};
      }
    })
    .catch(err => console.log(Error(err.statusText)));
}

async function getDatasets() {
  let fetchArr = queries.map(async queryObj => ({
    name: queryObj.name,
    data: await fetchData(queryObj)
  }));

  return Promise.all(fetchArr);
}

function sortCPUData(cpudata) {
  cpudata.sort(function(last, next) {
    if (last.metric.cluster === next.metric.cluster) {
      // Nodes are only important when clusters are the same
      return last.metric.nodes > next.metric.nodes ? 1 : -1;
    }
    return last.metric.cluster > next.metric.cluster ? 1 : -1;
  });
  // Remove mem from display
  return cpudata.filter(obj => obj.metric.nodes !== "mem");
}

// Parse data for Chart
function getChartData(name) {
  let chartObj = dataMaster.find(data => data.name === name).data;
  // TODO: Move to a new function?
  let filtered;
  if (name.charAt(0) === "c") {
    filtered = sortCPUData(chartObj);
  } else {
    filtered = chartObj.sort((a, b) =>
      a.metric.cluster > b.metric.cluster ? 1 : -1
    );
  }
  return filtered.map(obj => obj.value[1]);
}

// Refresh Data
function updateDatasets() {
  let time = moment().format("h:mm:ss a");
  console.log("Updated ⌚" + time);
  doTheThing();
}

// TODO: Refactor into something more reusable
function drawCPUChart() {
  let ctx = document.getElementById("cpuChart");
  let cpuChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: [
        "Iron: BNL",
        "Iron: Broadwell",
        "Iron: Infinite Band",
        "Iron: Skylake",
        "Popeye: Cascade Lake",
        "Popeye: Skylake"
      ],
      datasets: [
        {
          label: "Free CPUs (non-GPU) by location",
          data: getChartData("cpuFree"),
          borderColor: [
            "rgba(255, 99, 132, 0.2)",
            "rgba(54, 162, 235, 0.2)",
            "rgba(255, 206, 86, 0.2)",
            "rgba(75, 192, 192, 0.2)",
            "rgba(153, 102, 255, 0.2)",
            "rgba(255, 159, 64, 0.2)"
          ],
          backgroundColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 159, 64, 1)"
          ],
          borderWidth: 1
        },
        {
          label: "Total CPUs (non-GPU)",
          data: getChartData("cpuTotal"),
          backgroundColor: [
            "rgba(255, 99, 132, 0.2)",
            "rgba(54, 162, 235, 0.2)",
            "rgba(255, 206, 86, 0.2)",
            "rgba(75, 192, 192, 0.2)",
            "rgba(153, 102, 255, 0.2)",
            "rgba(255, 159, 64, 0.2)"
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 159, 64, 1)"
          ],
          borderWidth: 1
        }
      ]
    },
    options: {
      scales: {
        xAxes: [{ stacked: true }],
        yAxes: [
          {
            ticks: {
              beginAtZero: true
            },
            stacked: false
          }
        ]
      }
    }
  });
}

// TODO: Refactor into something more reusable
function drawGPUChart() {
  let ctx = document.getElementById("gpuChart1");
  var config = {
    type: "doughnut",
    data: {
      datasets: [
        {
          data: [5, 10, 30, 5, 50],
          borderColor: [
            "rgba(255, 99, 132, 0.2)",
            "rgba(54, 162, 235, 0.2)",
            "rgba(255, 206, 86, 0.2)",
            "rgba(75, 192, 192, 0.2)",
            "rgba(153, 102, 255, 0.2)"
          ],
          backgroundColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)"
          ],
          label: "Dataset 1"
        }
      ],
      labels: ["Red", "Orange", "Yellow", "Green", "Blue"]
    },
    options: {
      responsive: true,
      legend: {
        position: "top"
      },
      title: {
        display: true,
        text: "Chart.js Doughnut Chart"
      },
      animation: {
        animateScale: true,
        animateRotate: true
      }
    }
  };
}

function drawGPUChart2() {
  let ctx = document.getElementById("gpuChart2");
  var config = {
    type: "doughnut",
    data: {
      datasets: [
        {
          data: [5, 10, 30, 5, 50],
          borderColor: [
            "rgba(255, 99, 132, 0.2)",
            "rgba(54, 162, 235, 0.2)",
            "rgba(255, 206, 86, 0.2)",
            "rgba(75, 192, 192, 0.2)",
            "rgba(153, 102, 255, 0.2)"
          ],
          backgroundColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)"
          ],
          label: "Dataset 1"
        }
      ],
      labels: ["Red", "Orange", "Yellow", "Green", "Blue"]
    },
    options: {
      responsive: true,
      legend: {
        position: "top"
      },
      title: {
        display: true,
        text: "Chart.js Doughnut Chart"
      },
      animation: {
        animateScale: true,
        animateRotate: true
      }
    }
  };
}

function drawCharts() {
  // TODO: Increase/decrease interval of reset?
  drawCPUChart();
  drawGPUChart1();
  drawGPUChart2();
  setInterval(updateDatasets, 30000);
}

async function doTheThing() {
  setLastMeasuredTime();
  dataMaster = await getDatasets();
  drawCharts();
}

doTheThing();

window.addEventListener("DOMContentLoaded", () => {
  console.log("preloading dom content loaded");
  setLastMeasuredTime();
  // TODO: Add loading conditional display
});
