"use strict";
exports.__esModule = true;
var chart_js_1 = require("chart.js");
function drawBubbleplot(element, datasets, title) {
    var ctx = document.getElementById(element);
    var bubbleplot = new chart_js_1.Chart(ctx, {
        type: "bubble",
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
                            unit: "hour"
                        },
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: "Time"
                        },
                        ticks: {
                            major: {
                                enabled: true
                            }
                        }
                    },
                ],
                yAxes: [
                    {
                        display: true,
                        stacked: true,
                        scaleLabel: {
                            display: true,
                            labelString: "Wait in minutes"
                        }
                    },
                ]
            }
        }
    });
}
exports.drawBubbleplot = drawBubbleplot;
module.exports = { drawBubbleplot: drawBubbleplot };
//# sourceMappingURL=bubbleplot.js.map