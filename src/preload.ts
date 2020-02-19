import * as base64 from "base-64";
import * as moment from "moment";
import * as Barchart from "./barchart";
import * as Doughnut from "./doughnut";
import * as LineChart from "./linechart";
import * as Bubbleplot from "./bubbleplot";
import * as Table from "./table";

const user = process.env.PROMETHEUS_USER;
const pass = process.env.PROMETHEUS_PASS;

type Dict<T> = { [name: string]: T };

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

let dataMaster: QueryResultObject[] = [];
let dataMasterDict: Dict<PrometheusObject[]> = {};
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
    info: "rgb(128, 127, 132)",
    popeye: "rgb(0, 131, 155)"
  };
  return accountColors[center];
}

const queries = [
  {
    label: "Free CPUs (non-GPU) by location",
    name: "cpuFree",
    query: 'sum(slurm_node_cpus{state="free",nodes!="gpu"}) by (cluster,nodes)'
  },
  {
    label: "Allocated CPUs (non-GPU) by location",
    name: "cpuAlloc",
    query: 'sum(slurm_node_cpus{state="alloc",nodes!="gpu"}) by (cluster,nodes)'
  },
  {
    label: "Percent Free CPUs (non-GPU) by location",
    name: "cpuPercentChart",
    query:
      'sum(slurm_node_cpus{state="free",nodes!="gpu"}) by (cluster,nodes) / sum(slurm_node_cpus{nodes!="gpu"}) by (cluster,nodes)'
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
    query: 'sum(slurm_job_nodes{state="running"}) by (account)',
    amount: 7,
    unit: "day",
    step: "90m" //prometheus duration format
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

function mapDict<T, V>(data: Dict<T>, f: (d: T) => V): Dict<V> {
  const r: Dict<V> = {};
  for (const k in data) r[k] = f(data[k]);
  return r;
}

function dictBy<T, V>(
  data: T[],
  key: (d: T) => string,
  value: (d: T) => V
): Dict<V> {
  const r: Dict<V> = {};
  for (const d of data) r[key(d)] = value(d);
  return r;
}

function valueByCluster(data: PrometheusObject[]): Dict<string> {
  return dictBy(
    data,
    d => d.metric.cluster,
    d => d.value[1]
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

type BarChart = {
  label: string;
  cluster: string;
  nodes: string;
  color: string;
};

const barCharts: BarChart[] = [
  // TODO: FIX THESE COLORS DAWG 🐶
  {
    label: "Iron Broadwell",
    cluster: "iron",
    nodes: "broadwell",
    color: "255,99,132"
  },
  {
    label: "Iron Skylake",
    cluster: "iron",
    nodes: "skylake",
    color: "54,162,235"
  },
  {
    label: "Iron Infiniband",
    cluster: "iron",
    nodes: "ib",
    color: "255,206,86"
  },
  {
    label: "Iron BNL",
    cluster: "iron",
    nodes: "bnl",
    color: "75,192,192"
  },
  {
    label: "Popeye Skylake",
    cluster: "popeye",
    nodes: "skylake",
    color: "153,102,255"
  },
  {
    label: "Popeye Cascade Lake",
    cluster: "popeye",
    nodes: "cascadelake",
    color: "255,159,64"
  }
];

function findBarChart(
  chartObj: PrometheusObject[],
  chart: BarChart
): string | undefined {
  const o = chartObj.find(
    o => o.metric.cluster == chart.cluster && o.metric.nodes == chart.nodes
  );
  if (o) return o.value[1];
}

// Parse data for Chart
function getBarChartData(chartObj: PrometheusObject[]): string[] {
  return barCharts.map(c => findBarChart(chartObj, c));
}

function getDoughnutData() {
  const free = valueByCluster(dataMasterDict.gpuFree);
  const alloc = valueByCluster(dataMasterDict.gpuAlloc);
  let dough: any = {
    iron: {
      backgroundColor: ["rgba(153, 102, 255, 1)", "rgba(153, 102, 255, 0.2)"],
      borderColor: ["rgba(153, 102, 255, 1)", "rgba(153, 102, 255, 1)"],
      data: [free.iron, alloc.iron],
      label: "Iron"
    },
    popeye: {
      backgroundColor: ["rgba(255, 99, 132, 1)", "rgba(255, 99, 132, 0.2)"],
      borderColor: ["rgba(255, 99, 132, 1)", "rgba(255, 99, 132, 1)"],
      data: [free.popeye, alloc.popeye],
      label: "Popeye"
    }
  };
  return dough;
}

function combineBubbleData(waittimes: [any], queuelengths: [any]) {
  var combined = new Array<Object>();
  if (waittimes.length !== queuelengths.length) {
    // todo: better error mechanism
    console.error("length mismatch", waittimes, queuelengths);
  }
  let shorter =
    waittimes.length < queuelengths.length
      ? waittimes.length
      : queuelengths.length;
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

function buildBarChart() {
  const cpuDatasets = [
    {
      backgroundColor: barCharts.map(c => `rgba(${c.color},1)`),
      borderColor: barCharts.map(c => `rgba(${c.color},0.2)`),
      borderWidth: 1,
      data: getBarChartData(dataMasterDict.cpuFree),
      label: "Free CPUs (non-GPU) by location"
    },
    {
      backgroundColor: barCharts.map(c => `rgba(${c.color},0.2)`),
      borderColor: barCharts.map(c => `rgba(${c.color},1)`),
      borderWidth: 1,
      data: getBarChartData(dataMasterDict.cpuAlloc),
      label: "Allocated CPUs (non-GPU)"
    }
  ];
  Barchart.drawStackedBarChart(
    "cpuChart",
    cpuDatasets,
    barCharts.map(c => c.label)
  );
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
  const currentQueuedData = dataMasterDict.queued;
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
  const nodeCount = dataMasterDict.nodeCount;
  nodeCount.sort((a: PrometheusObject, b: PrometheusObject) =>
    a.metric.account > b.metric.account ? 1 : -1
  );
  const nodecontent = [];
  for (const a of nodeCount) {
    const background = getColor(a.metric.account);
    if (!background) continue;
    const border = background.replace(/rgb/i, "rgba").replace(/\)/i, ",0.2)");
    const dataMap: Array<any> = [];
    a.values.forEach(val => {
      let [time, qty] = val;
      dataMap.push({ y: parseInt(qty), x: moment.unix(time) });
    });
    nodecontent.push({
      label: a.metric.account,
      data: dataMap,
      fill: false,
      backgroundColor: background,
      borderColor: border
    });
  }

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

  dataMasterDict = dictBy(
    dataMaster,
    d => d.name,
    d => d.data
  );

  console.table(dataMaster);
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
