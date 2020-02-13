import { Chart } from "chart.js";
import * as moment from "moment";

export function drawBubbleplot(
  element: string,
  datasets: object[],
  title: string
) {
  console.log(element, "inbubbleplot");
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
      }
    }
  });
}

module.exports = { drawBubbleplot };
