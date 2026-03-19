"""
Car Sales Strategy: Value Retention & Market Entry Analysis
Author: Anass Hamdy
Dataset: 157 car models across 30 manufacturers
"""

import csv
import math
import os
from collections import defaultdict
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np

# ── Load Data ─────────────────────────────────────────────────
script_dir = os.path.dirname(os.path.abspath(__file__))
csv_path   = os.path.join(script_dir, 'Car_sales_row_data.csv')
charts_dir = os.path.join(script_dir, 'charts')
os.makedirs(charts_dir, exist_ok=True)

with open(csv_path) as f:
    raw = list(csv.DictReader(f))

def safe_float(val):
    try:
        return float(val) if val.strip() else None
    except:
        return None

rows = []
for r in raw:
    price  = safe_float(r['Price_in_thousands'])
    resale = safe_float(r['__year_resale_value'])
    sales  = safe_float(r['Sales_in_thousands'])
    hp     = safe_float(r['Horsepower'])
    mpg    = safe_float(r['Fuel_efficiency'])
    engine = safe_float(r['Engine_size'])
    rows.append({
        'manufacturer': r['Manufacturer'],
        'model':        r['Model'],
        'full_name':    r['Manufacturer'] + ' ' + r['Model'],
        'price':        price,
        'resale':       resale,
        'sales':        sales,
        'hp':           hp,
        'mpg':          mpg,
        'engine':       engine,
        'type':         r['Vehicle_type'],
        'retention':    (resale / price * 100) if price and resale else None,
        'depreciation': (price - resale) if price and resale else None,
    })

# Rows with complete retention data
complete = [r for r in rows if r['retention'] is not None]

# ── Manufacturer aggregates ────────────────────────────────────
mfr_data = defaultdict(list)
for r in complete:
    mfr_data[r['manufacturer']].append(r)

mfr_stats = []
for mfr, models in mfr_data.items():
    mfr_stats.append({
        'manufacturer':    mfr,
        'avg_retention':   sum(m['retention'] for m in models) / len(models),
        'avg_price':       sum(m['price'] for m in models) / len(models),
        'total_sales':     sum(m['sales'] for m in models if m['sales']),
        'avg_depreciation':sum(m['depreciation'] for m in models) / len(models),
        'models':          len(models),
    })

mfr_stats.sort(key=lambda x: x['avg_retention'], reverse=True)

# ── Style ──────────────────────────────────────────────────────
BLUE    = '#2980b9'
RED     = '#e74c3c'
GREEN   = '#27ae60'
YELLOW  = '#f39c12'
DARK    = '#2c3e50'
LIGHT   = '#ecf0f1'
plt.rcParams.update({
    'font.family': 'DejaVu Sans',
    'axes.spines.top':   False,
    'axes.spines.right': False,
    'axes.grid':         True,
    'grid.alpha':        0.3,
    'grid.linestyle':    '--',
})

# ═══════════════════════════════════════════════════════════════
# CHART 1 — Manufacturer Retention Rates
# ═══════════════════════════════════════════════════════════════
fig, ax = plt.subplots(figsize=(12, 7))

labels     = [m['manufacturer'] for m in mfr_stats]
retentions = [m['avg_retention'] for m in mfr_stats]
colors     = [GREEN if r >= 75 else BLUE if r >= 65 else RED for r in retentions]

bars = ax.barh(labels, retentions, color=colors, edgecolor='white', linewidth=0.5)

for bar, val in zip(bars, retentions):
    ax.text(val + 0.5, bar.get_y() + bar.get_height() / 2,
            f'{val:.1f}%', va='center', fontsize=9, color=DARK, fontweight='bold')

ax.axvline(75, color=GREEN, linestyle='--', linewidth=1.2, alpha=0.7)
ax.axvline(65, color=YELLOW, linestyle='--', linewidth=1.2, alpha=0.7)

legend = [
    mpatches.Patch(color=GREEN,  label='Strong (≥75%)'),
    mpatches.Patch(color=BLUE,   label='Average (65–74%)'),
    mpatches.Patch(color=RED,    label='Weak (<65%)'),
]
ax.legend(handles=legend, loc='lower right', fontsize=9)

ax.set_xlabel('1-Year Resale Value Retention (%)', fontsize=11)
ax.set_title('Manufacturer Value Retention (1-Year)', fontsize=14, fontweight='bold', color=DARK, pad=15)
ax.set_xlim(0, 105)
ax.invert_yaxis()
plt.tight_layout()
plt.savefig(os.path.join(charts_dir, 'chart1_manufacturer_retention.png'), dpi=150, bbox_inches='tight')
plt.close()
print('Chart 1 saved.')

# ═══════════════════════════════════════════════════════════════
# CHART 2 — Price vs Retention (Scatter, sized by Sales)
# ═══════════════════════════════════════════════════════════════
fig, ax = plt.subplots(figsize=(11, 7))

plot_rows = [r for r in complete if r['sales']]
prices     = [r['price']     for r in plot_rows]
retentions = [r['retention'] for r in plot_rows]
sales      = [r['sales']     for r in plot_rows]
sizes      = [max(20, s / 3) for s in sales]

scatter = ax.scatter(prices, retentions, s=sizes, alpha=0.55, color=BLUE, edgecolors='white', linewidth=0.5)

# Annotate notable models
notable = ['Porsche Boxter', 'BMW 528i', 'Toyota Camry', 'Honda Accord',
           'Ford F-Series', 'Jeep Wrangler', 'Buick LeSabre', 'Lincoln Town car']
for r in plot_rows:
    if r['full_name'] in notable:
        ax.annotate(r['full_name'], (r['price'], r['retention']),
                    textcoords='offset points', xytext=(6, 4),
                    fontsize=7.5, color=DARK)

ax.axhline(75, color=GREEN,  linestyle='--', linewidth=1, alpha=0.7, label='75% threshold')
ax.axhline(65, color=YELLOW, linestyle='--', linewidth=1, alpha=0.7, label='65% threshold')
ax.axvline(30, color=RED,    linestyle='--', linewidth=1, alpha=0.5, label='$30K price point')

ax.set_xlabel('Price (USD thousands)', fontsize=11)
ax.set_ylabel('1-Year Retention Rate (%)', fontsize=11)
ax.set_title('Price vs. Value Retention\n(bubble size = sales volume)', fontsize=13, fontweight='bold', color=DARK)
ax.legend(fontsize=9)
plt.tight_layout()
plt.savefig(os.path.join(charts_dir, 'chart2_price_vs_retention.png'), dpi=150, bbox_inches='tight')
plt.close()
print('Chart 2 saved.')

# ═══════════════════════════════════════════════════════════════
# CHART 3 — Top 10 & Bottom 10 Models by Retention
# ═══════════════════════════════════════════════════════════════
sorted_models = sorted(complete, key=lambda x: x['retention'], reverse=True)
top10    = sorted_models[:10]
bottom10 = sorted_models[-10:]

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))

# Top 10
top_labels = [r['full_name'] for r in top10]
top_vals   = [r['retention'] for r in top10]
bars = ax1.barh(top_labels, top_vals, color=GREEN, edgecolor='white')
for bar, val in zip(bars, top_vals):
    ax1.text(val - 1.5, bar.get_y() + bar.get_height()/2, f'{val:.1f}%',
             va='center', ha='right', fontsize=9, color='white', fontweight='bold')
ax1.set_xlabel('Retention Rate (%)')
ax1.set_title('Top 10 — Best Value Retention', fontweight='bold', color=DARK)
ax1.set_xlim(0, 110)
ax1.invert_yaxis()

# Bottom 10
bot_labels = [r['full_name'] for r in bottom10]
bot_vals   = [r['retention'] for r in bottom10]
bars = ax2.barh(bot_labels, bot_vals, color=RED, edgecolor='white')
for bar, val in zip(bars, bot_vals):
    ax2.text(val + 0.5, bar.get_y() + bar.get_height()/2, f'{val:.1f}%',
             va='center', fontsize=9, color=DARK, fontweight='bold')
ax2.set_xlabel('Retention Rate (%)')
ax2.set_title('Bottom 10 — Highest Depreciation Risk', fontweight='bold', color=DARK)
ax2.set_xlim(0, 70)
ax2.invert_yaxis()

plt.suptitle('Model-Level Value Retention Analysis', fontsize=14, fontweight='bold', color=DARK, y=1.02)
plt.tight_layout()
plt.savefig(os.path.join(charts_dir, 'chart3_top_bottom_models.png'), dpi=150, bbox_inches='tight')
plt.close()
print('Chart 3 saved.')

# ═══════════════════════════════════════════════════════════════
# CHART 4 — Price vs Sales Volume (Market Positioning Map)
# ═══════════════════════════════════════════════════════════════
fig, ax = plt.subplots(figsize=(11, 7))

plot_rows = [r for r in rows if r['price'] and r['sales'] and r['retention']]
prices    = [r['price']     for r in plot_rows]
sales_v   = [r['sales']     for r in plot_rows]
rets      = [r['retention'] for r in plot_rows]

sc = ax.scatter(prices, sales_v, c=rets, cmap='RdYlGn',
                vmin=45, vmax=100, alpha=0.7, s=80, edgecolors='white')

cbar = plt.colorbar(sc, ax=ax)
cbar.set_label('Retention Rate (%)', fontsize=10)

# Quadrant lines
med_price = np.median(prices)
med_sales = np.median(sales_v)
ax.axvline(med_price, color='gray', linestyle='--', linewidth=1, alpha=0.5)
ax.axhline(med_sales, color='gray', linestyle='--', linewidth=1, alpha=0.5)

# Quadrant labels
ax.text(med_price * 0.3,  med_sales * 4,   'High Volume\nBudget',  fontsize=9, color='gray', ha='center')
ax.text(med_price * 2.0,  med_sales * 4,   'Premium\nNiche',       fontsize=9, color='gray', ha='center')
ax.text(med_price * 0.3,  med_sales * 0.2, 'Low Volume\nBudget',   fontsize=9, color='gray', ha='center')
ax.text(mid := med_price*1.8, med_sales * 0.3, 'Mid-Premium\nLow Vol', fontsize=9, color='gray', ha='center')

# Annotate top sellers
top_sellers = sorted(plot_rows, key=lambda x: x['sales'], reverse=True)[:6]
for r in top_sellers:
    ax.annotate(r['full_name'], (r['price'], r['sales']),
                textcoords='offset points', xytext=(5, 4), fontsize=7.5, color=DARK)

ax.set_xlabel('Price (USD thousands)', fontsize=11)
ax.set_ylabel('Sales Volume (thousands of units)', fontsize=11)
ax.set_title('Market Positioning Map\n(color = value retention)', fontsize=13, fontweight='bold', color=DARK)
plt.tight_layout()
plt.savefig(os.path.join(charts_dir, 'chart4_market_positioning.png'), dpi=150, bbox_inches='tight')
plt.close()
print('Chart 4 saved.')

# ═══════════════════════════════════════════════════════════════
# CHART 5 — Depreciation Cost by Manufacturer
# ═══════════════════════════════════════════════════════════════
fig, ax = plt.subplots(figsize=(12, 7))

mfr_dep = sorted(mfr_stats, key=lambda x: x['avg_depreciation'], reverse=True)
labels  = [m['manufacturer']    for m in mfr_dep]
deps    = [m['avg_depreciation'] for m in mfr_dep]
colors  = [RED if d > 15 else YELLOW if d > 8 else GREEN for d in deps]

bars = ax.barh(labels, deps, color=colors, edgecolor='white')
for bar, val in zip(bars, deps):
    ax.text(val + 0.2, bar.get_y() + bar.get_height()/2,
            f'${val:.1f}K', va='center', fontsize=9, color=DARK, fontweight='bold')

legend = [
    mpatches.Patch(color=RED,    label='High depreciation (>$15K)'),
    mpatches.Patch(color=YELLOW, label='Medium ($8K–$15K)'),
    mpatches.Patch(color=GREEN,  label='Low (<$8K)'),
]
ax.legend(handles=legend, loc='lower right', fontsize=9)

ax.set_xlabel('Average 1-Year Depreciation (USD thousands)', fontsize=11)
ax.set_title('Average Depreciation Cost by Manufacturer', fontsize=14, fontweight='bold', color=DARK, pad=15)
ax.invert_yaxis()
plt.tight_layout()
plt.savefig(os.path.join(charts_dir, 'chart5_depreciation_cost.png'), dpi=150, bbox_inches='tight')
plt.close()
print('Chart 5 saved.')

# ── Print Summary for README ───────────────────────────────────
print('\n=== SUMMARY STATS ===')
print(f'Total models: {len(rows)}')
print(f'Manufacturers: {len(mfr_data)}')
complete_ret = [r for r in rows if r["retention"]]
print(f'Avg retention: {sum(r["retention"] for r in complete_ret)/len(complete_ret):.1f}%')

print('\nTop 5 manufacturers by retention:')
for m in mfr_stats[:5]:
    print(f"  {m['manufacturer']:12} {m['avg_retention']:.1f}%  avg_price=${m['avg_price']:.1f}K  sales={m['total_sales']:.0f}K")

print('\nBottom 5 manufacturers by retention:')
for m in mfr_stats[-5:]:
    print(f"  {m['manufacturer']:12} {m['avg_retention']:.1f}%  avg_price=${m['avg_price']:.1f}K  sales={m['total_sales']:.0f}K")

print('\nAll charts saved to charts/ directory.')
