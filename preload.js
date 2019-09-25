// Preloading of API Queries for new data
console.log("preloading starts now");
const base64 = require("base-64");
const Chart = require("chart.js");
const moment = require("moment");

let cpuChart = null;

// TODO Add set interval to get new data
function setLastMeasuredTime() {
  const element = document.getElementById("lastMeasuredTime");
  let now = moment().format("MMMM Do YYYY, h:mm:ss a");
  if (element) {
    element.innerText = `${now}`;
  }
}

let queries = [
  {
    name: "Free CPUs (non-GPU) by location",
    query: 'sum(slurm_node_cpus{state="free",nodes!="gpu"}) by (cluster,nodes)'
  },
  {
    name: "Percent Free CPUs (non-GPU) by location",
    query:
      'sum(slurm_node_cpus{state="free",nodes!="gpu"}) by (cluster,nodes) / sum(slurm_node_cpus{nodes!="gpu"}) by (cluster,nodes)'
  },
  {
    name: "Total CPUs (non-GPU) by location",
    query: 'sum(slurm_node_cpus{nodes!="gpu"}) by (cluster,nodes)'
  },
  {
    name: "GPUs free by location",
    query: 'sum(slurm_node_gpus{state="free",nodes="gpu"}) by (cluster,nodes)'
  },
  {
    name: "Total GPUs by location",
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

function getCPUChartData() {
  return "CPU CHART DATA";
}

// TODO: Make this
function updateDatasets() {
  // redo fetch calls
  // then
  // setLastMeasuredTime();
  // drawChart();
}

function drawChart() {
  let ctx = document.getElementById("cpuChart");
  console.log("🍎", getCPUChartData());
  cpuChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
      datasets: [
        {
          label: "Free CPUs (non-GPU) by location",
          data: [12, 19, 3, 5, 2, 3],
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

  // setInterval(updateDatasets, 10000);
}

console.log("in the preloader footer");
let bob = await getDatasets();
console.log("👦", bob);

window.addEventListener("DOMContentLoaded", () => {
  console.log("preloading dom content loaded");
  setLastMeasuredTime();
  drawChart();
});
