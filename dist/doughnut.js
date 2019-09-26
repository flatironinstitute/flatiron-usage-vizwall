function drawGPUChart() {
    var ctx = document.getElementById("gpuChart1");
    var config = {
        type: "doughnut",
        data: {
            datasets: [
                {
                    data: [5, 10, 30, 5, 50],
                    borderColor: [
                        "rgba(255, 99, 132, 0.2)",
                        "rgba(54, 162, 235, 0.2)",
                        "rgba(255, 206, 86, 0.2)",
                        "rgba(75, 192, 192, 0.2)",
                        "rgba(153, 102, 255, 0.2)",
                    ],
                    backgroundColor: [
                        "rgba(255, 99, 132, 1)",
                        "rgba(54, 162, 235, 1)",
                        "rgba(255, 206, 86, 1)",
                        "rgba(75, 192, 192, 1)",
                        "rgba(153, 102, 255, 1)",
                    ],
                    label: "Dataset 1"
                },
            ],
            labels: ["Red", "Orange", "Yellow", "Green", "Blue"]
        },
        options: {
            responsive: true,
            legend: {
                position: "top"
            },
            title: {
                display: true,
                text: "Chart.js Doughnut Chart"
            },
            animation: {
                animateScale: true,
                animateRotate: true
            }
        }
    };
}
function drawGPUChart2() {
    var ctx = document.getElementById("gpuChart2");
    var config = {
        type: "doughnut",
        data: {
            datasets: [
                {
                    data: [5, 10, 30, 5, 50],
                    borderColor: [
                        "rgba(255, 99, 132, 0.2)",
                        "rgba(54, 162, 235, 0.2)",
                        "rgba(255, 206, 86, 0.2)",
                        "rgba(75, 192, 192, 0.2)",
                        "rgba(153, 102, 255, 0.2)",
                    ],
                    backgroundColor: [
                        "rgba(255, 99, 132, 1)",
                        "rgba(54, 162, 235, 1)",
                        "rgba(255, 206, 86, 1)",
                        "rgba(75, 192, 192, 1)",
                        "rgba(153, 102, 255, 1)",
                    ],
                    label: "Dataset 1"
                },
            ],
            labels: ["Red", "Orange", "Yellow", "Green", "Blue"]
        },
        options: {
            responsive: true,
            legend: {
                position: "top"
            },
            title: {
                display: true,
                text: "Chart.js Doughnut Chart"
            },
            animation: {
                animateScale: true,
                animateRotate: true
            }
        }
    };
}
//# sourceMappingURL=doughnut.js.map