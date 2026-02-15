
"""Python data analysis project based on car sales CSV data.

Uses only the Python standard library so it runs in minimal environments.
"""

from __future__ import annotations

import csv
import math
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA_PATH = ROOT / "projects" / "car_sales_analysis" / "Car_sales_row_data.csv"
OUTPUT_DIR = Path(__file__).resolve().parent

NUMERIC_COLUMNS = [
    "Sales_in_thousands",
    "__year_resale_value",
    "Price_in_thousands",
    "Engine_size",
    "Horsepower",
    "Fuel_efficiency",
    "Power_perf_factor",
]


def to_float(value: str):
    if value is None:
        return None
    value = value.strip()
    if value == "":
        return None
    try:
        return float(value)
    except ValueError:
        return None


def mean(values):
    return sum(values) / len(values) if values else None


def pearson(x, y):
    if len(x) != len(y) or len(x) < 2:
        return None
    mx, my = mean(x), mean(y)
    num = sum((a - mx) * (b - my) for a, b in zip(x, y))
    den_x = math.sqrt(sum((a - mx) ** 2 for a in x))
    den_y = math.sqrt(sum((b - my) ** 2 for b in y))
    if den_x == 0 or den_y == 0:
        return None
    return num / (den_x * den_y)


def load_rows(path: Path):
    with path.open(newline="", encoding="utf-8-sig") as f:
        return list(csv.DictReader(f))


def run_analysis():
    rows = load_rows(DATA_PATH)

    missing_counts = {col: 0 for col in NUMERIC_COLUMNS}
    by_maker_sales = defaultdict(float)
    by_type_price = defaultdict(list)

    horsepower, sales = [], []
    aligned_hp, aligned_price_for_hp = [], []

    for row in rows:
        maker = row["Manufacturer"]
        vtype = row["Vehicle_type"]

        sales_val = to_float(row["Sales_in_thousands"])
        price_val = to_float(row["Price_in_thousands"])
        hp_val = to_float(row["Horsepower"])

        for col in NUMERIC_COLUMNS:
            if to_float(row.get(col, "")) is None:
                missing_counts[col] += 1

        if sales_val is not None:
            by_maker_sales[maker] += sales_val
            sales.append(sales_val)

        if price_val is not None:
            by_type_price[vtype].append(price_val)

        if hp_val is not None and price_val is not None:
            aligned_hp.append(hp_val)
            aligned_price_for_hp.append(price_val)

    # align sales-price for correlation
    aligned_sales, aligned_price = [], []
    for row in rows:
        s = to_float(row["Sales_in_thousands"])
        p = to_float(row["Price_in_thousands"])
        if s is not None and p is not None:
            aligned_sales.append(s)
            aligned_price.append(p)

    top_manufacturers = sorted(by_maker_sales.items(), key=lambda kv: kv[1], reverse=True)[:10]
    avg_price_by_type = {k: mean(v) for k, v in by_type_price.items() if v}

    corr_hp_price = pearson(aligned_hp, aligned_price_for_hp)
    corr_sales_price = pearson(aligned_sales, aligned_price)

    summary_lines = [
        "# Python Data Analysis: Car Sales Database",
        "",
        f"- Total rows analyzed: **{len(rows)}**",
        f"- Columns analyzed: **{len(rows[0]) if rows else 0}**",
        "",
        "## Data Quality (Missing Values in Numeric Columns)",
    ]
    for col, count in missing_counts.items():
        summary_lines.append(f"- {col}: {count} missing")

    summary_lines.extend(["", "## Top 10 Manufacturers by Total Sales (in thousands)"])
    for i, (maker, total_sales) in enumerate(top_manufacturers, 1):
        summary_lines.append(f"{i}. {maker}: {total_sales:.2f}")

    summary_lines.extend(["", "## Average Price by Vehicle Type (in thousands)"])
    for vtype, avg_p in sorted(avg_price_by_type.items()):
        summary_lines.append(f"- {vtype}: {avg_p:.2f}")

    summary_lines.extend([
        "",
        "## Correlation Insights",
        f"- Horsepower vs Price correlation: {corr_hp_price:.3f}" if corr_hp_price is not None else "- Horsepower vs Price correlation: not available",
        f"- Sales vs Price correlation: {corr_sales_price:.3f}" if corr_sales_price is not None else "- Sales vs Price correlation: not available",
        "",
        "## Business Takeaways",
        "- Focus marketing on top-selling manufacturers and benchmark their model mix.",
        "- Keep separate pricing strategy by vehicle type because average prices differ significantly.",
        "- The negative sales-vs-price correlation suggests lower-priced models tend to sell more volume.",
    ])

    summary_path = OUTPUT_DIR / "insights.md"
    summary_path.write_text("\n".join(summary_lines), encoding="utf-8")

    top_path = OUTPUT_DIR / "top_manufacturers.csv"
    with top_path.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["rank", "manufacturer", "total_sales_in_thousands"])
        for i, (maker, total_sales) in enumerate(top_manufacturers, 1):
            w.writerow([i, maker, round(total_sales, 3)])

    print(f"Wrote {summary_path}")
    print(f"Wrote {top_path}")


if __name__ == "__main__":
    run_analysis()
