import { CHART_COLORS } from "./constants.js";

export class CategoryChart {
  constructor(canvas) {
    this.canvas = canvas;
    this.instance = null;
  }

  render(categorySpending) {
    if (!window.Chart) {
      return;
    }

    this.instance?.destroy();

    this.instance = new window.Chart(this.canvas, {
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
}
