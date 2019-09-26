const Chart = require("chart.js");

// TODO: Refactor into something more reusable
function drawCPUChart() {
  let ctx = document.getElementById("cpuChart");
  let cpuChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: [
        "Iron: BNL",
        "Iron: Broadwell",
        "Iron: Infinite Band",
        "Iron: Skylake",
        "Popeye: Cascade Lake",
        "Popeye: Skylake"
      ],
      datasets: [
        {
          label: "Free CPUs (non-GPU) by location",
          data: getChartData("cpuFree"),
          borderColor: [
            "rgba(255, 99, 132, 0.2)",
            "rgba(54, 162, 235, 0.2)",
            "rgba(255, 206, 86, 0.2)",
            "rgba(75, 192, 192, 0.2)",
            "rgba(153, 102, 255, 0.2)",
            "rgba(255, 159, 64, 0.2)"
          ],
          backgroundColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 159, 64, 1)"
          ],
          borderWidth: 1
        },
        {
          label: "Total CPUs (non-GPU)",
          data: getChartData("cpuTotal"),
          backgroundColor: [
            "rgba(255, 99, 132, 0.2)",
            "rgba(54, 162, 235, 0.2)",
            "rgba(255, 206, 86, 0.2)",
            "rgba(75, 192, 192, 0.2)",
            "rgba(153, 102, 255, 0.2)",
            "rgba(255, 159, 64, 0.2)"
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 159, 64, 1)"
          ],
          borderWidth: 1
        }
      ]
    },
    options: {
      scales: {
        xAxes: [{ stacked: true }],
        yAxes: [
          {
            ticks: {
              beginAtZero: true
            },
            stacked: false
          }
        ]
      }
    }
  });
}

module.exports = { drawCPUChart: drawCPUChart };
