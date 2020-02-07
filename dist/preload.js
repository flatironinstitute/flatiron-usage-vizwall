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
var Doughnut = require("./doughnut");
var LineChart = require("./linechart");
var Table = require("./table");
var dataMaster = [];
var lastMeasuredTime;
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
var queries = [
    {
        label: "Free CPUs (non-GPU) by location",
        name: "cpuFree",
        query: 'sort(sum(slurm_node_cpus{state="free",nodes!="gpu"}) by (cluster,nodes)) '
    },
    {
        label: "Percent Free CPUs (non-GPU) by location",
        name: "cpuPercentChart",
        query: 'sum(slurm_node_cpus{state="free",nodes!="gpu"}) by (cluster,nodes) / sum(slurm_node_cpus{nodes!="gpu"}) by (cluster,nodes)'
    },
    {
        label: "Total CPUs (non-GPU) by location",
        name: "cpuTotal",
        query: 'sum(slurm_node_cpus{nodes!="gpu"}) by (cluster,nodes)'
    },
    {
        label: "GPUs free by location",
        name: "gpuFree",
        query: 'sort(sum(slurm_node_gpus{state="free",nodes="gpu"}) by (cluster,nodes))'
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
    },
    {
        label: "Total queue wait time",
        name: "waitTime",
        query: 'sum(slurm_job_seconds{cluster="iron",state="pending"}) by (account)&start=1581019440&end=1581105840&step=30'
    }
];
// Fetch data from Prometheus.
function fetchData(queryObj) {
    return __awaiter(this, void 0, void 0, function () {
        var base, url;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    base = "http://prometheus.flatironinstitute.org/api/v1/query?query=";
                    url = base + encodeURI(queryObj.query);
                    return [4 /*yield*/, fetch(url, {
                            headers: new Headers({
                                Authorization: "Basic " + base64.encode("prom:etheus")
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
        var fetchArr;
        var _this = this;
        return __generator(this, function (_a) {
            fetchArr = queries.map(function (queryObj) { return __awaiter(_this, void 0, void 0, function () {
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _a = {};
                            return [4 /*yield*/, fetchData(queryObj)];
                        case 1: return [2 /*return*/, (_a.data = _b.sent(),
                                _a.name = queryObj.name,
                                _a)];
                    }
                });
            }); });
            return [2 /*return*/, Promise.all(fetchArr)];
        });
    });
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
// Parse data for Chart
function getBarChartData(name) {
    var chartObj = dataMaster.find(function (data) { return data.name === name; }).data;
    var filtered;
    if (name.charAt(0) === "c") {
        filtered = sortCPUData(chartObj);
    }
    else {
        filtered = chartObj.sort(function (a, b) {
            return a.metric.cluster > b.metric.cluster ? 1 : -1;
        });
    }
    return filtered.map(function (obj) { return obj.value[1]; });
}
function getDoughnutData() {
    var gpuData = dataMaster.filter(function (data) { return data.name.charAt(0) === "g"; });
    var alpha = gpuData.sort(function (a, b) {
        return a.name > b.name ? 1 : -1;
    });
    var dough = {};
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
    alpha.forEach(function (gpuQuery) {
        gpuQuery.data.forEach(function (obj) {
            if (obj.metric.cluster === "popeye") {
                dough.popeye.data.push(obj.value[1]);
            }
            else {
                dough.iron.data.push(obj.value[1]);
            }
        });
    });
    // Doughnut data array order: available, used, total
    for (var value in dough) {
        if (dough.hasOwnProperty(value)) {
            var arr = dough[value].data;
            arr.splice(1, 1, arr[1] - arr[0]);
        }
    }
    return dough;
}
function getCurrentQueueData() {
    return dataMaster.filter(function (data) { return data.name.charAt(0) === "q"; })[0].data;
}
function getWaitTime() {
    return dataMaster.filter(function (data) { return data.name.charAt(0) === "w"; })[0].data;
}
function buildBarChart() {
    // TODO: FIX THESE COLORS DOG
    var cpuDatasets = [
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
    var cpuLabels = [
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
    var gpuData = {};
    gpuData = getDoughnutData();
    var index = 1;
    for (var value in gpuData) {
        if (gpuData.hasOwnProperty(value)) {
            Doughnut.drawDoughnutChart([gpuData[value]], "gpuChart" + index, ["In Use", "Free"], "" + value.toString().toUpperCase());
        }
        index++;
    }
}
function buildTable() {
    var currentQueuedData = getCurrentQueueData();
    currentQueuedData.sort(function (a, b) {
        return a.metric.account > b.metric.account ? 1 : -1;
    });
    Table.drawTable("queueTable", currentQueuedData, ["Center", "Count"], "Current Queue Count");
}
function buildLineChart() {
    var queuedData = [{ label: "first dataset", data: [0, 20, 40, 50] }];
    LineChart.drawLineChart("lineChart1", queuedData, ["January", "Feb", "March", "April"], "Slurm queued (pending) by Center");
}
function drawCharts() {
    toggleLoading(); // loading off
    buildBarChart(); // Draw cpu chart
    buildDoughnutCharts(); // Draw gpu charts
    buildTable(); // Draw queued data table
    // TODO: Swap with line chart
    buildLineChart();
    console.log("🌜", getWaitTime());
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
function doTheThing() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    toggleLoading(); // loading on
                    return [4 /*yield*/, getDatasets()];
                case 1:
                    dataMaster = _a.sent();
                    drawCharts();
                    return [4 /*yield*/, sleep(30000)];
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