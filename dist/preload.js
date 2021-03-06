"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var base64 = require("base-64");
var moment = require("moment");
var Barchart = require("./barchart");
var Bubbleplot = require("./bubbleplot");
var Doughnut = require("./doughnut");
var LineChart = require("./linechart");
var Table = require("./table");
var user = process.env.PROMETHEUS_USER;
var pass = process.env.PROMETHEUS_PASS;
var dataMaster = [];
var dataMasterDict = {};
var lastMeasuredTime;
var chartHeight;
function setLastMeasuredTime() {
    lastMeasuredTime = getNow();
    var element = document.getElementById("lastMeasuredTime");
    if (element) {
        element.innerText = "" + lastMeasuredTime;
    }
}
function getNow() {
    return moment().format("MMMM Do YYYY, h:mm:ss a");
}
function getColor(center) {
    var accountColors = {
        cca: "rgb(191, 43, 36)",
        ccb: "rgb(128, 172, 87)",
        ccm: "rgb(242, 139, 0)",
        ccq: "rgb(128, 93, 139)",
        ccn: "rbg(0, 128, 158)",
        scc: "rgb(246, 194, 68)",
        other: "rgb(128, 127, 132)",
        info: "rgb(65, 83, 175)",
        popeye: "rgb(0, 131, 155)"
    };
    return accountColors[center];
}
var queries = [
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
        query: 'sum(slurm_node_cpus{state="free",nodes!="gpu"}) by (cluster,nodes) / sum(slurm_node_cpus{nodes!="gpu"}) by (cluster,nodes)'
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
    },
];
var rangeQueries = [
    {
        label: "Rusty queue wait time over 24 hours",
        name: "waitTime",
        query: 'sum(slurm_job_seconds{cluster="iron",state="pending"}) by (account)',
        amount: 1,
        unit: "day",
        step: "15m"
    },
    {
        label: "Rusty queue length over 24 hours",
        name: "lengthQueue",
        query: 'sum(slurm_job_count{state="pending"}) by (account)',
        amount: 1,
        unit: "day",
        step: "15m"
    },
    {
        label: "Node counts by center for the last 7 Days",
        name: "nodeCount",
        query: 'sum(slurm_job_nodes{state="running"}) by (account)',
        amount: 7,
        unit: "day",
        step: "90m"
    },
];
var backgroundIndex = 0;
var backgroundColors = [
    "#858585",
    "#3d4dff",
    "#ffffff",
    "#f5f5dc",
    "#3f8fd4",
    "#8c8599",
    "#00d5fa",
    "#ffb32f",
    "#4138a1",
    "#ffffff",
    "#6e719e",
    "#ababab",
    "#ed8917",
    "#787878",
    "#0ccc1c",
    "#87ff5c",
    "#ffffff",
    "#440be0",
    "#575757",
    "#e0d8c7",
    "#78FA8C",
    "#FFEE52",
    "#7d7d7d",
    "#ff0000",
    "#006400",
    "#ff7d7d",
    "#00ff09",
    "#c9c3c3",
    "#d9e9f7",
    "#f0c539",
    "#0000fb",
    "#fa002e",
    "#006cfa",
    "#ff7bff",
    "#ff4b0a",
    "#ffcc99",
    "#fe984d",
    "#4c914e",
    "#bec7a2",
    "#ffc108",
    "#cc9966",
    "#0031ff",
    "#ebcece",
    "#4ea8fc",
    "#990f46",
    "#d8cda3",
    "#cddede",
    "#67caeb",
    "#e85858",
    "#d3d4e0",
    "#e00025",
    "#f405fc",
    "#f5b505",
    "#acacac",
    "#6791d3",
    "#455de6",
    "#6ae8c0",
    "#d1d143",
    "#ffc5b2",
    "#5f96a1",
    "#4955fc",
    "#e3ff8f",
    "#482e84",
    "#6b7367",
    "#ffff00",
    "#9bbac2",
    "#E7C0ED",
    "#bdd5e6",
    "#bfbfbf",
    "#feffb2",
    "#c9e1f5",
    "#71C5E8",
    "#52a1eb",
    "#fcfcfc",
    "#707682",
    "#f08660",
    "#ceff0a",
    "#43d61a",
    "rgba(255, 239, 97, 1.00)",
    "#FF33FF",
    "#fa697a",
    "#ff99c9",
    "#e2ecf0",
    "#A1C1F4",
    "rgba(252, 0, 244, 1.00)",
    "#9e9e9e",
    "#9fb899",
    "#f2b530",
    "#d102c7",
    "#f26508",
    "#e9f0a1",
    "#3b5998",
    "#e615c3",
    "#11ff00",
    "#e0ed23",
    "#fff242",
    "#9965e6",
    "#ffce64",
    "rgba(237, 187, 7, 1.00)",
    "#ff0000",
];
// Fetch data from Prometheus.
function fetchData(queryObj, isRange) {
    return __awaiter(this, void 0, void 0, function () {
        var base, url, end, start;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    base = isRange
                        ? "http://prometheus.flatironinstitute.org/api/v1/query_range?query="
                        : "http://prometheus.flatironinstitute.org/api/v1/query?query=";
                    url = base + encodeURI(queryObj.query);
                    if (isRange) {
                        end = moment().subtract(10, "minutes").toISOString();
                        start = moment().subtract(queryObj.amount, queryObj.unit).toISOString();
                        url = url + encodeURI("&start=" + start + "&end=" + end + "&step=" + queryObj.step);
                    }
                    return [4 /*yield*/, fetch(url, {
                            headers: new Headers({
                                Authorization: "Basic " + base64.encode(user + ":" + pass)
                            })
                        })
                            .then(function (res) { return res.json(); })
                            .then(function (body) {
                            if (body.status === "success") {
                                return body.data.result;
                            }
                            else {
                                return {};
                            }
                        })["catch"](function (err) { return console.log(Error(err.statusText)); })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function getDatasets() {
    return __awaiter(this, void 0, void 0, function () {
        var fetchArr, fetchRangeArr;
        var _this = this;
        return __generator(this, function (_a) {
            fetchArr = queries.map(function (queryObj) { return __awaiter(_this, void 0, void 0, function () {
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _a = {};
                            return [4 /*yield*/, fetchData(queryObj, false)];
                        case 1: return [2 /*return*/, (_a.data = _b.sent(),
                                _a.name = queryObj.name,
                                _a)];
                    }
                });
            }); });
            fetchRangeArr = rangeQueries.map(function (rangeQueryObj) { return __awaiter(_this, void 0, void 0, function () {
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _a = {};
                            return [4 /*yield*/, fetchData(rangeQueryObj, true)];
                        case 1: return [2 /*return*/, (_a.data = _b.sent(),
                                _a.name = rangeQueryObj.name,
                                _a)];
                    }
                });
            }); });
            return [2 /*return*/, Promise.all(fetchArr.concat(fetchRangeArr))];
        });
    });
}
function filterDataMaster(char) {
    return dataMaster.filter(function (data) { return data.name.charAt(0) === char; });
}
function filterDataMasterWithoutPopeye(char) {
    return filterDataMaster(char)[0].data.filter(function (center) { return center.metric.account !== "popeye"; });
}
function mapDict(data, f) {
    var r = {};
    for (var k in data) {
        r[k] = f(data[k]);
    }
    return r;
}
function dictBy(data, key, value) {
    var r = {};
    for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
        var d = data_1[_i];
        r[key(d)] = value(d);
    }
    return r;
}
function valueByCluster(data) {
    return dictBy(data, function (d) { return d.metric.cluster; }, function (d) { return d.value[1]; });
}
function sortCPUData(cpudata) {
    cpudata.sort(function (last, next) {
        if (last.metric.cluster === next.metric.cluster) {
            // Nodes are only important when clusters are the same.
            return last.metric.nodes > next.metric.nodes ? 1 : -1;
        }
        return last.metric.cluster > next.metric.cluster ? 1 : -1;
    });
    // Remove mem from display.
    return cpudata.filter(function (obj) { return obj.metric.nodes !== "mem"; });
}
var barCharts = [
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
    },
];
function findBarChart(chartObj, chart) {
    var o = chartObj.find(function (o) { return o.metric.cluster == chart.cluster && o.metric.nodes == chart.nodes; });
    if (o) {
        return o.value[1];
    }
}
// Parse data for Chart
function getBarChartData(chartObj) {
    return barCharts.map(function (c) { return findBarChart(chartObj, c); });
}
function getDoughnutData() {
    var free = valueByCluster(dataMasterDict.gpuFree);
    var alloc = valueByCluster(dataMasterDict.gpuAlloc);
    var dough = {
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
function combineBubbleData(waittimes, queuelengths) {
    var combined = new Array();
    if (waittimes.length !== queuelengths.length) {
        // todo: better error mechanism
        console.error("length mismatch", waittimes, queuelengths);
    }
    var shorter = waittimes.length < queuelengths.length ? waittimes.length : queuelengths.length;
    for (var i = 0; i < shorter; i++) {
        var tstamp1 = waittimes[i][0];
        var y = waittimes[i][1];
        var tstamp2 = queuelengths[i][0];
        var r = queuelengths[i][1];
        // strip the decimal with Math.floor
        if (Math.floor(tstamp1) !== Math.floor(tstamp2)) {
            // todo: invent a better error mechanism
            console.error("mismatch", "⏰", waittimes[i], "📐", queuelengths[i]);
        }
        else {
            combined.push({
                x: moment.unix(tstamp1),
                y: Math.floor(parseInt(y) / 60000),
                r: r
            });
        }
    }
    return combined;
}
function getBubbleplotData() {
    var waitTimes = filterDataMasterWithoutPopeye("w");
    var queueLengths = filterDataMasterWithoutPopeye("l");
    var combo = new Array();
    for (var i = 0; i < waitTimes.length; i++) {
        if (waitTimes[i].metric.account === queueLengths[i].metric.account) {
            var datamap = combineBubbleData(waitTimes[i].values, queueLengths[i].values);
            var border = getColor(waitTimes[i].metric.account);
            console.table(waitTimes[i].metric.account, border);
            var background = border.replace(/rgb/i, "rgba").replace(/\)/i, ",0.2)");
            combo.push({
                label: waitTimes[i].metric.account,
                backgroundColor: background,
                borderColor: border,
                borderWidth: 1,
                hoverRadius: 1,
                hitRadius: 1,
                data: datamap
            });
        }
        else {
            console.error("Bubble data objects out of order", typeof waitTimes[i].metric.account, typeof queueLengths[i].metric.account);
        }
    }
    return combo;
}
function buildBarChart() {
    var cpuDatasets = [
        {
            backgroundColor: barCharts.map(function (c) { return "rgba(" + c.color + ",1)"; }),
            borderColor: barCharts.map(function (c) { return "rgba(" + c.color + ",0.2)"; }),
            borderWidth: 1,
            data: getBarChartData(dataMasterDict.cpuFree),
            label: "Free CPUs (non-GPU) by location"
        },
        {
            backgroundColor: barCharts.map(function (c) { return "rgba(" + c.color + ",0.2)"; }),
            borderColor: barCharts.map(function (c) { return "rgba(" + c.color + ",1)"; }),
            borderWidth: 1,
            data: getBarChartData(dataMasterDict.cpuAlloc),
            label: "Allocated CPUs (non-GPU)"
        },
    ];
    Barchart.drawStackedBarChart("cpuChart", cpuDatasets, barCharts.map(function (c) { return c.label; }));
}
function buildDoughnutCharts() {
    var gpuData = {};
    gpuData = getDoughnutData();
    var index = 1;
    for (var value in gpuData) {
        if (gpuData.hasOwnProperty(value)) {
            Doughnut.drawDoughnutChart([gpuData[value]], "gpuChart" + index, ["Free", "In Use"], "" + value.toString().toUpperCase());
        }
        index++;
    }
}
function buildTable() {
    var currentQueuedData = dataMasterDict.queued;
    currentQueuedData.sort(function (a, b) { return (a.metric.account > b.metric.account ? 1 : -1); });
    Table.drawTable("queueTable", currentQueuedData, ["Center", "Count"], "Current Queue Count");
}
function buildLineChart() {
    var nodeCount = dataMasterDict.nodeCount;
    nodeCount.sort(function (a, b) { return (a.metric.account > b.metric.account ? 1 : -1); });
    var nodecontent = [];
    var _loop_1 = function (a) {
        var background = getColor(a.metric.account);
        if (!background) {
            return "continue";
        }
        var border = background.replace(/rgb/i, "rgba").replace(/\)/i, ",0.2)");
        var dataMap = [];
        a.values.forEach(function (val) {
            var time = val[0], qty = val[1];
            dataMap.push({ y: parseInt(qty), x: moment.unix(time) });
        });
        nodecontent.push({
            label: a.metric.account,
            data: dataMap,
            fill: false,
            backgroundColor: background,
            borderColor: border
        });
    };
    for (var _i = 0, nodeCount_1 = nodeCount; _i < nodeCount_1.length; _i++) {
        var a = nodeCount_1[_i];
        _loop_1(a);
    }
    LineChart.drawLineChart("nodeChart", nodecontent, "Node counts by center for the last 7 Days", chartHeight);
}
function buildBubbleplot() {
    var bubbleContent = getBubbleplotData();
    Bubbleplot.drawBubbleplot("bubbleplot", bubbleContent, [
        "Wait time by center over last 24 hours",
        "Point size reflects number of queue items",
    ]);
}
function drawCharts() {
    toggleLoading(); // loading off
    buildBarChart(); // Draw cpu chart
    buildDoughnutCharts(); // Draw gpu charts
    buildTable(); // Draw queued data table
    buildLineChart(); // Draw node count chart
    buildBubbleplot(); // Draw queue bubbleplot
    // Set timer
    setLastMeasuredTime();
}
function toggleLoading() {
    var loading = document.getElementById("loading");
    if (!loading.style.display) {
        loading.style.display = "block";
    }
    else {
        loading.style.display = "none";
    }
}
function swapBackgroundColor() {
    document.body.style.backgroundColor = backgroundColors[backgroundIndex];
    backgroundIndex++;
}
function doTheThing() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    toggleLoading(); // loading on
                    swapBackgroundColor();
                    // get master page height for chart sizing
                    chartHeight = (document.documentElement.clientHeight - 120) / 3;
                    return [4 /*yield*/, getDatasets()];
                case 1:
                    dataMaster = _a.sent();
                    dataMasterDict = dictBy(dataMaster, function (d) { return d.name; }, function (d) { return d.data; });
                    console.table(dataMaster);
                    drawCharts();
                    return [4 /*yield*/, sleep(120000)];
                case 2:
                    _a.sent();
                    doTheThing();
                    return [2 /*return*/];
            }
        });
    });
}
function sleep(ms) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve) { return setTimeout(resolve, ms); })];
        });
    });
}
// Set loading screen for initial display
window.addEventListener("DOMContentLoaded", function () {
    doTheThing();
});
//# sourceMappingURL=preload.js.map