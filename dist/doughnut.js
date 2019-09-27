"use strict";
exports.__esModule = true;
var chart_js_1 = require("chart.js");
function drawDoughnutChart(datasets, element, labels, title) {
    var ctx = document.getElementById(element);
    var doughnutChart = new chart_js_1.Chart(ctx, {
        data: {
            datasets: datasets,
            labels: labels
        },
        options: {
            animation: {
                animateRotate: true,
                animateScale: true
            },
            circumference: Math.PI,
            legend: {
                position: "top"
            },
            responsive: true,
            rotation: Math.PI,
            title: {
                display: true,
                text: title
            }
        },
        type: "doughnut"
    });
}
exports.drawDoughnutChart = drawDoughnutChart;
//# sourceMappingURL=doughnut.js.map