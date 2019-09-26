import * as base64 from "base-64";
import * as moment from "moment";
import * as Barchart from "./barchart";
import * as Doughnut from "./doughnut";

interface QueryObject {
  label: string;
  name: string;
  query: string;
}

interface PrometheusObject {
  metric: any;
  value: any;
}

let dataMaster: any[] = [];

function setLastMeasuredTime() {
  const element = document.getElementById("lastMeasuredTime");
  const now = moment().format("MMMM Do YYYY, h:mm:ss a");
  if (element) {
    element.innerText = `${now}`;
  }
}

const queries = [
  {
    label: "Free CPUs (non-GPU) by location",
    name: "cpuFree",
    query:
      'sort(sum(slurm_node_cpus{state="free",nodes!="gpu"}) by (cluster,nodes)) ',
  },
  {
    label: "Percent Free CPUs (non-GPU) by location",
    name: "cpuPercentChart",
    query:
      'sum(slurm_node_cpus{state="free",nodes!="gpu"}) by (cluster,nodes) / sum(slurm_node_cpus{nodes!="gpu"}) by (cluster,nodes)',
  },
  {
    label: "Total CPUs (non-GPU) by location",
    name: "cpuTotal",
    query: 'sum(slurm_node_cpus{nodes!="gpu"}) by (cluster,nodes)',
  },
  {
    label: "GPUs free by location",
    name: "gpuFree",
    query:
      'sort(sum(slurm_node_gpus{state="free",nodes="gpu"}) by (cluster,nodes))',
  },
  {
    label: "Total GPUs by location",
    name: "gpuTotal",
    query: 'sum(slurm_node_cpus{nodes="gpu"}) by (cluster,nodes)',
  },
];

// Fetch data from Prometheus.
async function fetchData(queryObj: QueryObject) {
  const base = "http://prometheus.flatironinstitute.org/api/v1/query?query=";
  const url = base + encodeURI(queryObj.query);
  return await fetch(url, {
    headers: new Headers({
      Authorization: `Basic ${base64.encode(`prom:etheus`)}`,
    }),
  })
    .then((res) => res.json())
    .then((body) => {
      if (body.status === "success") {
        return body.data.result;
      } else {
        return {};
      }
    })
    // tslint:disable-next-line
    .catch(err => console.log(Error(err.statusText)));
}

async function getDatasets() {
  const fetchArr = queries.map(async (queryObj) => ({
    data: await fetchData(queryObj),
    name: queryObj.name,
  }));

  return Promise.all(fetchArr);
}

function sortCPUData(cpudata: PrometheusObject[]) {
  cpudata.sort((last, next) => {
    if (last.metric.cluster === next.metric.cluster) {
      // Nodes are only important when clusters are the same.
      return last.metric.nodes > next.metric.nodes ? 1 : -1;
    }
    return last.metric.cluster > next.metric.cluster ? 1 : -1;
  });
  // Remove mem from display.
  return cpudata.filter((obj) => obj.metric.nodes !== "mem");
}

// Parse data for Chart
function getChartData(name: string) {
  const chartObj = dataMaster.find((data) => data.name === name).data;
  let filtered;
  if (name.charAt(0) === "c") {
    filtered = sortCPUData(chartObj);
  } else {
    filtered = chartObj.sort((a: PrometheusObject, b: PrometheusObject) =>
      a.metric.cluster > b.metric.cluster ? 1 : -1,
    );
  }
  return filtered.map((obj: PrometheusObject) => obj.value[1]);
}

// Refresh data and last measured time.
function updateDatasets() {
  doTheThing();
}

function drawCharts() {
  const cpuDatasets = [
    {
      backgroundColor: [
        "rgba(255, 99, 132, 1)",
        "rgba(54, 162, 235, 1)",
        "rgba(255, 206, 86, 1)",
        "rgba(75, 192, 192, 1)",
        "rgba(153, 102, 255, 1)",
        "rgba(255, 159, 64, 1)",
      ],
      borderColor: [
        "rgba(255, 99, 132, 0.2)",
        "rgba(54, 162, 235, 0.2)",
        "rgba(255, 206, 86, 0.2)",
        "rgba(75, 192, 192, 0.2)",
        "rgba(153, 102, 255, 0.2)",
        "rgba(255, 159, 64, 0.2)",
      ],
      borderWidth: 1,
      data: getChartData("cpuFree"),
      label: "Free CPUs (non-GPU) by location",
    },
    {
      backgroundColor: [
        "rgba(255, 99, 132, 0.2)",
        "rgba(54, 162, 235, 0.2)",
        "rgba(255, 206, 86, 0.2)",
        "rgba(75, 192, 192, 0.2)",
        "rgba(153, 102, 255, 0.2)",
        "rgba(255, 159, 64, 0.2)",
      ],
      borderColor: [
        "rgba(255, 99, 132, 1)",
        "rgba(54, 162, 235, 1)",
        "rgba(255, 206, 86, 1)",
        "rgba(75, 192, 192, 1)",
        "rgba(153, 102, 255, 1)",
        "rgba(255, 159, 64, 1)",
      ],
      borderWidth: 1,
      data: getChartData("cpuTotal"),
      label: "Total CPUs (non-GPU)",
    },
  ];
  const cpuLabels = [
    "Iron: BNL",
    "Iron: Broadwell",
    "Iron: Infinite Band",
    "Iron: Skylake",
    "Popeye: Cascade Lake",
    "Popeye: Skylake",
  ];

  const gpuDatasets = [
    {
      backgroundColor: [
        "rgba(255, 99, 132, 1)",
        "rgba(54, 162, 235, 1)",
        "rgba(255, 206, 86, 1)",
        "rgba(75, 192, 192, 1)",
        "rgba(153, 102, 255, 1)",
      ],
      borderColor: [
        "rgba(255, 99, 132, 0.2)",
        "rgba(54, 162, 235, 0.2)",
        "rgba(255, 206, 86, 0.2)",
        "rgba(75, 192, 192, 0.2)",
        "rgba(153, 102, 255, 0.2)",
      ],
      data: [5, 10, 30, 5, 50],
      label: "Dataset 1",
    },
  ];

  Barchart.drawStackedBarChart("cpuChart", cpuDatasets, cpuLabels);
  Doughnut.drawDoughnutChart(
    "gpuChart1",
    gpuDatasets,
    ["Red", "Orange", "Yellow", "Green", "Blue"],
    "Doughnut Test",
  );
  setInterval(updateDatasets, 30000);
}

async function doTheThing() {
  setLastMeasuredTime();
  dataMaster = await getDatasets();
  drawCharts();
}

function toggleLoading() {
  const loading = document.getElementById("loading");
  if (loading.style.display === "none") {
    loading.style.display = "block";
  } else {
    loading.style.display = "none";
  }
}

// Set loading screen for initial display
window.addEventListener("DOMContentLoaded", () => {
  setLastMeasuredTime();
  toggleLoading();
});

doTheThing();
