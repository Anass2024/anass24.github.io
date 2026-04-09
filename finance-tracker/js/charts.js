import { CHART_COLORS } from "./constants.js";

export class DashboardCharts {
  constructor({ categoryCanvas, trendCanvas }) {
    this.categoryCanvas = categoryCanvas;
    this.trendCanvas = trendCanvas;
    this.categoryChart = null;
    this.trendChart = null;
  }

  renderCategoryChart(categorySpending, theme) {
    if (!window.Chart) {
      return;
    }

    this.categoryChart?.destroy();
    this.categoryChart = new window.Chart(this.categoryCanvas, {
      type: "pie",
      data: {
        labels: categorySpending.map((item) => item.label),
        datasets: [
          {
            data: categorySpending.map((item) => item.total),
            backgroundColor: CHART_COLORS,
            borderWidth: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: theme === "dark" ? "#eef6f2" : "#12201a"
            }
          }
        }
      }
    });
  }

  renderTrendChart(monthlySeries, theme) {
    if (!window.Chart) {
      return;
    }

    this.trendChart?.destroy();
    this.trendChart = new window.Chart(this.trendCanvas, {
      type: "line",
      data: {
        labels: monthlySeries.map((item) => item.label),
        datasets: [
          {
            label: "Expenses",
            data: monthlySeries.map((item) => item.amount),
            borderColor: "#1d6d58",
            pointBackgroundColor: "#c86a3a",
            backgroundColor: "rgba(29, 109, 88, 0.14)",
            fill: true,
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            ticks: {
              color: theme === "dark" ? "#9bb1a9" : "#61726a"
            },
            grid: {
              color: theme === "dark" ? "rgba(238, 246, 242, 0.08)" : "rgba(18, 32, 26, 0.08)"
            }
          },
          y: {
            ticks: {
              color: theme === "dark" ? "#9bb1a9" : "#61726a"
            },
            grid: {
              color: theme === "dark" ? "rgba(238, 246, 242, 0.08)" : "rgba(18, 32, 26, 0.08)"
            }
          }
        },
        plugins: {
          legend: {
            labels: {
              color: theme === "dark" ? "#eef6f2" : "#12201a"
            }
          }
        }
      }
    });
  }
}
