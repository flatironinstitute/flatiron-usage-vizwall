"use strict";
exports.__esModule = true;
var chart_js_1 = require("chart.js");
function drawLineChart(element, datasets, title) {
    var ctx = document.getElementById(element);
    var lineChart = new chart_js_1.Chart(ctx, {
        type: "line",
        data: {
            datasets: datasets
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: title
            },
            scales: {
                xAxes: [
                    {
                        type: "time",
                        time: {
                            unit: "day"
                        },
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: "Date"
                        },
                        ticks: {
                            major: {
                                enabled: true
                            }
                        }
                    }
                ],
                yAxes: [
                    {
                        display: true,
                        stacked: true,
                        scaleLabel: {
                            display: true,
                            labelString: "value"
                        }
                    }
                ]
            }
        }
    });
}
exports.drawLineChart = drawLineChart;
module.exports = { drawLineChart: drawLineChart };
//# sourceMappingURL=linechart.js.map