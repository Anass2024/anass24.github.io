import { CHART_COLORS } from "./constants.js";

export class DashboardCharts {
  constructor({ categoryCanvas, trendCanvas }) {
    this.categoryCanvas = categoryCanvas;
    this.trendCanvas = trendCanvas;
    this.categoryChart = null;
    this.trendChart = null;
  }

  renderCategoryChart(categorySpending) {
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
              color: "#14211b"
            }
          }
        }
      }
    });
  }

  renderTrendChart(series) {
    if (!window.Chart) {
      return;
    }

    this.trendChart?.destroy();
    this.trendChart = new window.Chart(this.trendCanvas, {
      type: "line",
      data: {
        labels: series.map((item) => item.label),
        datasets: [
          {
            label: "Expenses",
            data: series.map((item) => item.amount),
            borderColor: "#1d6d58",
            pointBackgroundColor: "#c66b3d",
            backgroundColor: "rgba(29, 109, 88, 0.12)",
            fill: true,
            tension: 0.32
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            ticks: { color: "#697971" },
            grid: { color: "rgba(20, 33, 27, 0.08)" }
          },
          y: {
            ticks: { color: "#697971" },
            grid: { color: "rgba(20, 33, 27, 0.08)" }
          }
        },
        plugins: {
          legend: {
            labels: { color: "#14211b" }
          }
        }
      }
    });
  }
}
