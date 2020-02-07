"use strict";
exports.__esModule = true;
var chart_js_1 = require("chart.js");
function drawLineChart(element, datasets, labels, title) {
    var ctx = document.getElementById(element);
    //   TODO: add min.max function
    var lineChart = new chart_js_1.Chart(ctx, {
        type: "line",
        data: {
            datasets: datasets,
            labels: labels
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: title
            },
            scales: {
                yAxes: [
                    {
                        ticks: {
                            suggestedMin: 50,
                            suggestedMax: 100
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