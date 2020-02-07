import { Chart } from "chart.js";

export function drawDoughnutChart(
  datasets: object[],
  element: string,
  labels: string[],
  title: string
) {
  const ctx = document.getElementById(element) as HTMLCanvasElement;
  const doughnutChart = new Chart(ctx, {
    data: {
      datasets,
      labels
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
