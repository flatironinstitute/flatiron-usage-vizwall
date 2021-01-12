import { Chart } from "chart.js";

export function drawLineChart(
  element: string,
  datasets: object[],
  title: string,
  chartHeight: number,
) {
  const ctx = document.getElementById(element) as HTMLCanvasElement;
  // ctx.height = chartHeight;
  // console.log("🚀", ctx, chartHeight);
  const lineChart = new Chart(ctx, {
    type: "line",
    data: {
      datasets,
    },
    options: {
      responsive: true,
      title: {
        display: true,
        text: title,
      },
      scales: {
        xAxes: [
          {
            type: "time",
            time: {
              unit: "day",
            },
            display: true,
            scaleLabel: {
              display: true,
              labelString: "Date",
            },
            ticks: {
              major: {
                enabled: true,
              },
            },
          },
        ],
        yAxes: [
          {
            display: true,
            stacked: false,
            scaleLabel: {
              display: true,
              labelString: "value",
            },
          },
        ],
      },
    },
  });
}

module.exports = { drawLineChart };
