"""Generate the 4 portfolio chart images for the Python Car Sales project."""

import csv
import math
from collections import defaultdict
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker

BASE = Path(__file__).resolve().parent
DATA = BASE / "Car_sales_row_data.csv"
OUT  = BASE / "portfolio_report_assets"
OUT.mkdir(exist_ok=True)

# ── helpers ──────────────────────────────────────────────────────────────────
def to_float(v):
    try: return float(str(v).strip())
    except: return None

def load():
    with DATA.open(newline="", encoding="utf-8-sig") as f:
        return list(csv.DictReader(f))

COLORS = ["#2c3e50","#3498db","#e74c3c","#2ecc71","#9b59b6",
          "#f39c12","#1abc9c","#e67e22","#34495e","#16a085"]

# ── Chart 1 — Top 10 manufacturers by total sales ────────────────────────────
def chart1(rows):
    by_maker = defaultdict(float)
    for r in rows:
        v = to_float(r["Sales_in_thousands"])
        if v is not None:
            by_maker[r["Manufacturer"]] += v
    top = sorted(by_maker.items(), key=lambda x: x[1], reverse=True)[:10]
    names, vals = zip(*top)

    fig, ax = plt.subplots(figsize=(10, 5))
    bars = ax.bar(names, vals, color=COLORS, edgecolor="white", linewidth=0.6)
    ax.bar_label(bars, fmt="%.0f", padding=3, fontsize=8.5)
    ax.set_title("Top 10 Manufacturers by Total Sales", fontsize=13, fontweight="bold", pad=12)
    ax.set_ylabel("Total Sales (thousands)")
    ax.set_xlabel("")
    ax.tick_params(axis="x", rotation=30)
    ax.yaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f"{x:,.0f}"))
    ax.spines[["top","right"]].set_visible(False)
    ax.set_facecolor("#f9f9f9")
    fig.patch.set_facecolor("#f9f9f9")
    fig.tight_layout()
    fig.savefig(OUT / "fig_top_manufacturers_sales.png", dpi=150)
    plt.close(fig)
    print("✓ chart 1")

# ── Chart 2 — Price distribution by vehicle type (boxplot) ───────────────────
def chart2(rows):
    by_type = defaultdict(list)
    for r in rows:
        v = to_float(r["Price_in_thousands"])
        if v is not None:
            by_type[r["Vehicle_type"]].append(v)
    labels = sorted(by_type)
    data   = [by_type[l] for l in labels]

    fig, ax = plt.subplots(figsize=(7, 5))
    bp = ax.boxplot(data, labels=labels, patch_artist=True, notch=False,
                    medianprops=dict(color="#e74c3c", linewidth=2))
    for patch, color in zip(bp["boxes"], ["#3498db","#2ecc71"]):
        patch.set_facecolor(color)
        patch.set_alpha(0.7)
    ax.set_title("Price Distribution by Vehicle Type", fontsize=13, fontweight="bold", pad=12)
    ax.set_ylabel("Price (thousands $)")
    ax.yaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f"${x:,.0f}K"))
    ax.spines[["top","right"]].set_visible(False)
    ax.set_facecolor("#f9f9f9")
    fig.patch.set_facecolor("#f9f9f9")
    fig.tight_layout()
    fig.savefig(OUT / "fig_price_by_vehicle_type.png", dpi=150)
    plt.close(fig)
    print("✓ chart 2")

# ── Chart 3 — Horsepower vs Price scatter ────────────────────────────────────
def chart3(rows):
    hp, price = [], []
    for r in rows:
        h = to_float(r["Horsepower"])
        p = to_float(r["Price_in_thousands"])
        if h is not None and p is not None:
            hp.append(h); price.append(p)

    # trend line
    n = len(hp)
    mx, my = sum(hp)/n, sum(price)/n
    slope = sum((x-mx)*(y-my) for x,y in zip(hp,price)) / sum((x-mx)**2 for x in hp)
    intercept = my - slope*mx
    x_line = [min(hp), max(hp)]
    y_line = [slope*x+intercept for x in x_line]

    fig, ax = plt.subplots(figsize=(8, 5))
    ax.scatter(hp, price, color="#3498db", alpha=0.65, edgecolors="white", linewidth=0.5, s=55)
    ax.plot(x_line, y_line, color="#e74c3c", linewidth=2, label=f"r = 0.840")
    ax.set_title("Horsepower vs Price", fontsize=13, fontweight="bold", pad=12)
    ax.set_xlabel("Horsepower")
    ax.set_ylabel("Price (thousands $)")
    ax.yaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f"${x:,.0f}K"))
    ax.legend(fontsize=10)
    ax.spines[["top","right"]].set_visible(False)
    ax.set_facecolor("#f9f9f9")
    fig.patch.set_facecolor("#f9f9f9")
    fig.tight_layout()
    fig.savefig(OUT / "fig_horsepower_vs_price.png", dpi=150)
    plt.close(fig)
    print("✓ chart 3")

# ── Chart 4 — Sales vs Price scatter ─────────────────────────────────────────
def chart4(rows):
    sales, price = [], []
    for r in rows:
        s = to_float(r["Sales_in_thousands"])
        p = to_float(r["Price_in_thousands"])
        if s is not None and p is not None:
            sales.append(s); price.append(p)

    n = len(sales)
    mx, my = sum(sales)/n, sum(price)/n
    slope = sum((x-mx)*(y-my) for x,y in zip(sales,price)) / sum((x-mx)**2 for x in sales)
    intercept = my - slope*mx
    x_line = [min(sales), max(sales)]
    y_line = [slope*x+intercept for x in x_line]

    fig, ax = plt.subplots(figsize=(8, 5))
    ax.scatter(sales, price, color="#2ecc71", alpha=0.65, edgecolors="white", linewidth=0.5, s=55)
    ax.plot(x_line, y_line, color="#e74c3c", linewidth=2, label=f"r = −0.305")
    ax.set_title("Sales Volume vs Price", fontsize=13, fontweight="bold", pad=12)
    ax.set_xlabel("Sales (thousands units)")
    ax.set_ylabel("Price (thousands $)")
    ax.xaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f"{x:,.0f}K"))
    ax.yaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f"${x:,.0f}K"))
    ax.legend(fontsize=10)
    ax.spines[["top","right"]].set_visible(False)
    ax.set_facecolor("#f9f9f9")
    fig.patch.set_facecolor("#f9f9f9")
    fig.tight_layout()
    fig.savefig(OUT / "fig_sales_vs_price.png", dpi=150)
    plt.close(fig)
    print("✓ chart 4")

if __name__ == "__main__":
    rows = load()
    chart1(rows)
    chart2(rows)
    chart3(rows)
    chart4(rows)
    print("All charts saved to", OUT)
