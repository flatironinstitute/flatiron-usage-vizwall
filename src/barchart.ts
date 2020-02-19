import { Chart } from "chart.js";

export function drawStackedBarChart(
  element: string,
  datasets: object[],
  labels: string[]
) {
  const ctx = document.getElementById(element) as HTMLCanvasElement;
  const stackedBarChart = new Chart(ctx, {
    data: {
      datasets,
      labels
    },
    options: {
      scales: {
        xAxes: [{ stacked: true }],
        yAxes: [
          {
            stacked: true,
            ticks: {
              beginAtZero: true
            }
          }
        ]
      }
    },
    type: "bar"
  });
}

module.exports = { drawStackedBarChart };
