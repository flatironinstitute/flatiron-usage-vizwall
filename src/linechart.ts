import { Chart } from "chart.js";
import * as moment from "moment";

export function drawLineChart(
  element: string,
  datasets: object[],
  title: string
) {
  const ctx = document.getElementById(element) as HTMLCanvasElement;
  let lineChart = new Chart(ctx, {
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
              },
              fontStyle: "bold"
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

module.exports = { drawLineChart };
