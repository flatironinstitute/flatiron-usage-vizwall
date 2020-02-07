import { Chart } from "chart.js";

export function drawLineChart(
  element: string,
  datasets: object[],
  labels: string[],
  title: string
) {
  const ctx = document.getElementById(element) as HTMLCanvasElement;
  //   TODO: add min.max function
  let lineChart = new Chart(ctx, {
    type: "line",
    data: {
      datasets: datasets,
      labels
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

module.exports = { drawLineChart };
