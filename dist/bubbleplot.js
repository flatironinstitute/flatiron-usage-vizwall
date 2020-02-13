"use strict";
exports.__esModule = true;
var chart_js_1 = require("chart.js");
function drawBubbleplot(element, datasets, title) {
    console.log(element, "inbubbleplot");
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
            }
        }
    });
}
exports.drawBubbleplot = drawBubbleplot;
module.exports = { drawBubbleplot: drawBubbleplot };
//# sourceMappingURL=bubbleplot.js.map