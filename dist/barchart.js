"use strict";
exports.__esModule = true;
var chart_js_1 = require("chart.js");
function drawStackedBarChart(element, datasets, labels) {
    var ctx = document.getElementById(element);
    var stackedBarChart = new chart_js_1.Chart(ctx, {
        data: {
            datasets: datasets,
            labels: labels
        },
        options: {
            scales: {
                xAxes: [{ stacked: true }],
                yAxes: [
                    {
                        stacked: false,
                        ticks: {
                            beginAtZero: true
                        }
                    },
                ]
            }
        },
        type: "bar"
    });
}
exports.drawStackedBarChart = drawStackedBarChart;
module.exports = { drawStackedBarChart: drawStackedBarChart };
//# sourceMappingURL=barchart.js.map