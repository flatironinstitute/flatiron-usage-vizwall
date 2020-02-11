import * as base64 from "base-64";
import * as moment from "moment";
import * as Barchart from "./barchart";
import * as Doughnut from "./doughnut";
import * as LineChart from "./linechart";
import * as Table from "./table";

interface QueryObject {
  label: string;
  name: string;
  query: string;
  amount?: any;
  unit?: any;
  step?: string;
}

interface PrometheusObject {
  metric: any;
  value: [number, string];
  values?: [number, string];
}

interface QueryResultObject {
  data: PrometheusObject[];
  name: string;
}

let dataMaster: any[] = [];
let lastMeasuredTime: string;

function setLastMeasuredTime() {
  lastMeasuredTime = getNow();
  const element = document.getElementById("lastMeasuredTime");
  if (element) {
    element.innerText = `${lastMeasuredTime}`;
  }
}

function getNow() {
  return moment().format("MMMM Do YYYY, h:mm:ss a");
}

const queries = [
  {
    label: "Free CPUs (non-GPU) by location",
    name: "cpuFree",
    query:
      'sort(sum(slurm_node_cpus{state="free",nodes!="gpu"}) by (cluster,nodes)) '
  },
  {
    label: "Percent Free CPUs (non-GPU) by location",
    name: "cpuPercentChart",
    query:
      'sum(slurm_node_cpus{state="free",nodes!="gpu"}) by (cluster,nodes) / sum(slurm_node_cpus{nodes!="gpu"}) by (cluster,nodes)'
  },
  {
    label: "Total CPUs (non-GPU) by location",
    name: "cpuTotal",
    query: 'sum(slurm_node_cpus{nodes!="gpu"}) by (cluster,nodes)'
  },
  {
    label: "GPUs free by location",
    name: "gpuFree",
    query:
      'sort(sum(slurm_node_gpus{state="free",nodes="gpu"}) by (cluster,nodes))'
  },
  {
    label: "Total GPUs by location",
    name: "gpuTotal",
    query: 'sum(slurm_node_cpus{nodes="gpu"}) by (cluster,nodes)'
  },
  {
    label: "Slurm queued pending job requests",
    name: "queued",
    query: 'sum(slurm_job_count{state="pending"}) by (account)'
  }
];

const rangeQueries = [
  {
    label: "Rusty queue wait time over 24 hours",
    name: "waitTime",
    query:
      'sum(slurm_job_seconds{cluster="iron",state="pending"}) by (account)',
    amount: 1,
    unit: "day",
    step: "10m" //prometheus duration format
  },
  {
    label: "Rusty queue length over 24 hours",
    name: "lengthQueue",
    query: 'sum(slurm_job_count{state="pending"}) by (account)',
    amount: 1,
    unit: "day",
    step: "10m" //prometheus duration format
  },
  {
    label: "Node counts by center for the last 7 Days",
    name: "nodeCount",
    query: 'sum(slurm_job_nodes{state="pending"}) by (account)',
    amount: 7,
    unit: "day",
    step: "60m"
  }
];

// Fetch data from Prometheus.
async function fetchData(queryObj: QueryObject, isRange: boolean) {
  const base = isRange
    ? "http://prometheus.flatironinstitute.org/api/v1/query_range?query="
    : "http://prometheus.flatironinstitute.org/api/v1/query?query=";

  let url = base + encodeURI(queryObj.query);

  if (isRange) {
    let end = moment()
      .subtract(10, "minutes")
      .toISOString();
    let start = moment()
      .subtract(queryObj.amount, queryObj.unit)
      .toISOString();

    url = url + encodeURI(`&start=${start}&end=${end}&step=${queryObj.step}`);
  }

  console.log(`Calling ☎️: ${queryObj.name}: ${url}`);

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
    // tslint:disable-next-line
    .catch(err => console.log(Error(err.statusText)));
}

async function getDatasets() {
  const fetchArr = queries.map(async queryObj => ({
    data: await fetchData(queryObj, false),
    name: queryObj.name
  }));

  const fetchRangeArr = rangeQueries.map(async rangeQueryObj => ({
    data: await fetchData(rangeQueryObj, true),
    name: rangeQueryObj.name
  }));

  return Promise.all(fetchArr.concat(fetchRangeArr));
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
  return cpudata.filter(obj => obj.metric.nodes !== "mem");
}

// Parse data for Chart
function getBarChartData(name: string) {
  const chartObj = dataMaster.find(data => data.name === name).data;
  let filtered;
  if (name.charAt(0) === "c") {
    filtered = sortCPUData(chartObj);
  } else {
    filtered = chartObj.sort((a: PrometheusObject, b: PrometheusObject) =>
      a.metric.cluster > b.metric.cluster ? 1 : -1
    );
  }
  return filtered.map((obj: PrometheusObject) => obj.value[1]);
}

function getDoughnutData() {
  const gpuData = dataMaster.filter(data => data.name.charAt(0) === "g");
  const alpha = gpuData.sort((a: QueryObject, b: QueryObject) =>
    a.name > b.name ? 1 : -1
  );
  let dough: any = {};
  dough = {
    iron: {
      backgroundColor: ["rgba(153, 102, 255, 1)", "rgba(153, 102, 255, 0.2)"],
      borderColor: ["rgba(153, 102, 255, 1)", "rgba(153, 102, 255, 1)"],
      data: [],
      label: "Iron"
    },
    popeye: {
      backgroundColor: ["rgba(255, 99, 132, 1)", "rgba(255, 99, 132, 0.2)"],
      borderColor: ["rgba(255, 99, 132, 1)", "rgba(255, 99, 132, 1)"],
      data: [],
      label: "Popeye"
    }
  };
  alpha.forEach(gpuQuery => {
    gpuQuery.data.forEach((obj: any) => {
      if (obj.metric.cluster === "popeye") {
        dough.popeye.data.push(obj.value[1]);
      } else {
        dough.iron.data.push(obj.value[1]);
      }
    });
  });
  // Doughnut data array order: available, used, total
  for (const value in dough) {
    if (dough.hasOwnProperty(value)) {
      const arr = dough[value].data;
      arr.splice(1, 1, arr[1] - arr[0]);
    }
  }
  return dough;
}

function getCurrentQueueData() {
  return dataMaster.filter(data => data.name.charAt(0) === "q")[0].data;
}

function getWaitTime() {
  return dataMaster.filter(data => data.name.charAt(0) === "w")[0].data;
}

function getNodeCountData() {
  // [
  //   {
  //     label: "first dataset",
  //     data: [
  //       {
  //         x: 10,
  //         y: 20
  //       },
  //       {
  //         x: 15,
  //         y: 10
  //       }
  //     ]
  //   }
  // ];

  const nodeCount: QueryResultObject = dataMaster.find(
    data => data.name.charAt(0) === "n"
  );

  nodeCount.data.sort((a: PrometheusObject, b: PrometheusObject) =>
    a.metric.account > b.metric.account ? 1 : -1
  );
  let formatted = nodeCount.data.map((a: PrometheusObject) => {
    return {
      label: a.metric.account,
      data: a.values.map(val => {
        return {
          x: val,
          y: val
        };
      })
    };
  });

  console.table("formatted 🎾", formatted);
}

function buildBarChart() {
  // TODO: FIX THESE COLORS DOG
  const cpuDatasets = [
    {
      backgroundColor: [
        "rgba(255, 99, 132, 1)",
        "rgba(54, 162, 235, 1)",
        "rgba(255, 206, 86, 1)",
        "rgba(75, 192, 192, 1)",
        "rgba(153, 102, 255, 1)",
        "rgba(255, 159, 64, 1)"
      ],
      borderColor: [
        "rgba(255, 99, 132, 0.2)",
        "rgba(54, 162, 235, 0.2)",
        "rgba(255, 206, 86, 0.2)",
        "rgba(75, 192, 192, 0.2)",
        "rgba(153, 102, 255, 0.2)",
        "rgba(255, 159, 64, 0.2)"
      ],
      borderWidth: 1,
      data: getBarChartData("cpuFree"),
      label: "Free CPUs (non-GPU) by location"
    },
    {
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
      borderWidth: 1,
      data: getBarChartData("cpuTotal"),
      label: "Total CPUs (non-GPU)"
    }
  ];
  const cpuLabels = [
    "Iron: BNL",
    "Iron: Broadwell",
    "Iron: Infinite Band",
    "Iron: Skylake",
    "Popeye: Cascade Lake",
    "Popeye: Skylake"
  ];
  Barchart.drawStackedBarChart("cpuChart", cpuDatasets, cpuLabels);
}

function buildDoughnutCharts() {
  let gpuData: any = {};
  gpuData = getDoughnutData();
  let index = 1;
  for (const value in gpuData) {
    if (gpuData.hasOwnProperty(value)) {
      Doughnut.drawDoughnutChart(
        [gpuData[value]],
        `gpuChart${index}`,
        ["In Use", "Free"],
        `${value.toString().toUpperCase()}`
      );
    }
    index++;
  }
}

function buildTable() {
  let currentQueuedData: any = getCurrentQueueData();
  currentQueuedData.sort((a: PrometheusObject, b: PrometheusObject) =>
    a.metric.account > b.metric.account ? 1 : -1
  );
  Table.drawTable(
    "queueTable",
    currentQueuedData,
    ["Center", "Count"],
    "Current Queue Count"
  );
}

function buildLineChart() {
  let queuedData = [{ label: "first dataset", data: [0, 20, 40, 50] }];
  getNodeCountData();
  LineChart.drawLineChart(
    "lineChart1",
    queuedData,
    ["January", "Feb", "March", "April"],
    "Slurm queued (pending) by Center"
  );
}

// function buildScatterplot() {
//   Scatterplot.drawScatterplot("#scatterplot");
// }

function drawCharts() {
  toggleLoading(); // loading off

  buildBarChart(); // Draw cpu chart
  buildDoughnutCharts(); // Draw gpu charts
  buildTable(); // Draw queued data table

  // TODO: Swap with line chart
  buildLineChart();

  // buildScatterplot();

  console.log("🧛‍♂️ datamaster", dataMaster);

  // Set timer
  setLastMeasuredTime();
}

function toggleLoading() {
  const loading = document.getElementById("loading");
  if (!loading.style.display) {
    loading.style.display = "block";
  } else {
    loading.style.display = "none";
  }
}

async function doTheThing() {
  toggleLoading(); // loading on
  dataMaster = await getDatasets();
  drawCharts();
  await sleep(30000);
  doTheThing();
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Set loading screen for initial display
window.addEventListener("DOMContentLoaded", () => {
  doTheThing();
});
