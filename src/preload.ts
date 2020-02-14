import * as base64 from "base-64";
import * as moment from "moment";
import * as Barchart from "./barchart";
import * as Doughnut from "./doughnut";
import * as LineChart from "./linechart";
import * as Bubbleplot from "./bubbleplot";
import * as Table from "./table";

const user = process.env.PROMETHEUS_USER;
const pass = process.env.PROMETHEUS_PASS;

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
  values?: [any];
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

function getColor(center: string) {
  const accountColors: any = {
    cca: "rgb(191, 43, 36)",
    ccb: "rgb(128, 172, 87)",
    ccm: "rgb(242, 139, 0)",
    ccq: "rgb(128, 93, 139)",
    scc: "rgb(56, 75, 162)",
    other: "rgb(128, 127, 132)",
    popeye: "rgb(0, 131, 155)"
  };
  return accountColors[center];
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
    query: 'sum(slurm_node_gpus{state="free",nodes="gpu"}) by (cluster)'
  },
  {
    label: "GPUs allocated by location",
    name: "gpuAlloc",
    query: 'sum(slurm_node_gpus{state="alloc",nodes="gpu"}) by (cluster)'
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
    step: "15m" //prometheus duration format
  },
  {
    label: "Rusty queue length over 24 hours",
    name: "lengthQueue",
    query: 'sum(slurm_job_count{state="pending"}) by (account)',
    amount: 1,
    unit: "day",
    step: "15m" //prometheus duration format
  },
  {
    label: "Node counts by center for the last 7 Days",
    name: "nodeCount",
    query: 'sum(slurm_job_nodes{state="pending"}) by (account)',
    amount: 7,
    unit: "day",
    step: "90m"
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

  return await fetch(url, {
    headers: new Headers({
      Authorization: `Basic ${base64.encode(`${user}:${pass}`)}`
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

function filterDataMaster(char: string) {
  return dataMaster.filter(data => data.name.charAt(0) === char);
}

function filterDataMasterWithoutPopeye(char: string) {
  return filterDataMaster(char)[0].data.filter(
    (center: PrometheusObject) => center.metric.account !== "popeye"
  );
}

function dictBy<T, V>(
  data: T[],
  key: (d: T) => string,
  value: (d: T) => V
): { [key: string]: V } {
  const map: { [name: string]: V } = {};
  for (const d of data) map[key(d)] = value(d);
  return map;
}

function dictDataMaster(): { [name: string]: any } {
  return dictBy(
    dataMaster,
    d => d.name,
    d => d.data
  );
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
  const data = dictBy(
    filterDataMaster("g"),
    d => d.name,
    d =>
      dictBy(
        d.data,
        d => (<any>d).metric.cluster,
        d => (<any>d).value[1]
      )
  );
  let dough: any = {};
  dough = {
    iron: {
      backgroundColor: ["rgba(153, 102, 255, 1)", "rgba(153, 102, 255, 0.2)"],
      borderColor: ["rgba(153, 102, 255, 1)", "rgba(153, 102, 255, 1)"],
      data: [data.gpuFree.iron, data.gpuAlloc.iron],
      label: "Iron"
    },
    popeye: {
      backgroundColor: ["rgba(255, 99, 132, 1)", "rgba(255, 99, 132, 0.2)"],
      borderColor: ["rgba(255, 99, 132, 1)", "rgba(255, 99, 132, 1)"],
      data: [data.gpuFree.popeye, data.gpuAlloc.popeye],
      label: "Popeye"
    }
  };
  return dough;
}

function getCurrentQueueData() {
  let filtered = filterDataMaster("q");
  return filtered[0].data;
}

function combineBubbleData(waittimes: [any], queuelengths: [any]) {
  var combined = new Array<Object>();
  if (waittimes.length !== queuelengths.length) {
    // todo: invent a better error mechanism
    console.error("length mismatch", waittimes, queuelengths);
  }
  let shorter =
    waittimes.length < queuelengths.length
      ? waittimes.length
      : queuelengths.length;
  // loop the shorter array.
  for (let i = 0; i < shorter; i++) {
    let tstamp1: number = waittimes[i][0];
    let y: string = waittimes[i][1];
    let tstamp2: number = queuelengths[i][0];
    let r: string = queuelengths[i][1];
    // strip the decimal with Math.floor
    if (Math.floor(tstamp1) !== Math.floor(tstamp2)) {
      // todo: invent a better error mechanism
      console.error("mismatch", "⏰", waittimes[i], "📐", queuelengths[i]);
    } else {
      combined.push({
        x: moment.unix(tstamp1), //timestamp
        y: Math.floor(parseInt(y) / 60000), //waittime string
        r: r //queue length
      });
    }
  }
  return combined;
}

function getBubbleplotData() {
  let waitTimes = filterDataMasterWithoutPopeye("w");
  let queueLengths = filterDataMasterWithoutPopeye("l");
  var combo = new Array<Object>();
  for (let i = 0; i < waitTimes.length; i++) {
    if (waitTimes[i].metric.account === queueLengths[i].metric.account) {
      let datamap = combineBubbleData(
        waitTimes[i].values,
        queueLengths[i].values
      );
      let border = getColor(waitTimes[i].metric.account);
      let background = border.replace(/rgb/i, "rgba").replace(/\)/i, ",0.2)");
      combo.push({
        label: waitTimes[i].metric.account,
        backgroundColor: background,
        borderColor: border,
        borderWidth: 1,
        hoverRadius: 1,
        hitRadius: 1,
        data: datamap
      });
    } else {
      console.error(
        "Bubble data objects out of order",
        typeof waitTimes[i].metric.account,
        typeof queueLengths[i].metric.account
      );
    }
  }
  return combo;
}

function getNodeCountData() {
  const nodeCount: QueryResultObject = dataMaster.find(
    data => data.name.charAt(0) === "n"
  );
  nodeCount.data.sort((a: PrometheusObject, b: PrometheusObject) =>
    a.metric.account > b.metric.account ? 1 : -1
  );
  return nodeCount.data.map((a: PrometheusObject) => {
    let dataMap: Array<any> = [];
    a.values.forEach(val => {
      let [time, qty] = val;
      dataMap.push({ y: parseInt(qty), x: moment.unix(time) });
    });
    let background = getColor(a.metric.account);
    let border = background.replace(/rgb/i, "rgba").replace(/\)/i, ",0.2)");
    return {
      label: a.metric.account,
      data: dataMap,
      fill: false,
      backgroundColor: background,
      borderColor: border
    };
  });
}

function buildBarChart() {
  // TODO: FIX THESE COLORS DAWG 👷‍♂️
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
        ["Free", "In Use"],
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
  let nodecontent = getNodeCountData();

  LineChart.drawLineChart(
    "nodeChart",
    nodecontent,
    "Node counts by center for the last 7 Days"
  );
}

function buildBubbleplot() {
  let bubbleContent = getBubbleplotData();

  Bubbleplot.drawBubbleplot("bubbleplot", bubbleContent, [
    "Wait time by center over last 24 hours",
    "Point size reflects number of queue items"
  ]);
}

function drawCharts() {
  toggleLoading(); // loading off

  buildBarChart(); // Draw cpu chart
  buildDoughnutCharts(); // Draw gpu charts
  buildTable(); // Draw queued data table
  buildLineChart(); //Draw node count chart
  buildBubbleplot(); //Draw queue bubbleplot

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

  console.log("🐉", dataMaster);
  drawCharts();
  await sleep(120000);
  doTheThing();
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Set loading screen for initial display
window.addEventListener("DOMContentLoaded", () => {
  doTheThing();
});
