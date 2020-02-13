import { Chart } from "chart.js";

export function drawBubbleplot(
  element: string,
  datasets: object[],
  title: string[]
) {
  const ctx = document.getElementById(element) as HTMLCanvasElement;

  let bubbleplot = new Chart(ctx, {
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
          }
        ],
        yAxes: [
          {
            display: true,
            stacked: true,
            scaleLabel: {
              display: true,
              labelString: "Wait in minutes"
            }
          }
        ]
      }
    }
  });
}

module.exports = { drawBubbleplot };
