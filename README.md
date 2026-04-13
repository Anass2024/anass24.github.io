# Anass — Data Analyst Portfolio

> **Live site:** https://anass2024.github.io/anass24.github.io/

Personal portfolio built with HTML/CSS/JS and hosted on GitHub Pages. It showcases data analysis, machine learning, and full-stack projects alongside certifications and a skills overview.

---

## Projects

### 📊 Customer Segmentation & Marketing Insights
`R` `K-Means` `ggplot2` `R Markdown`

K-Means clustering on 2,240 customers to identify four behavioral personas (Budget Shoppers, Premium Customers, Mid-Range Buyers, High-Value Loyalists) and derive targeted marketing strategies. Features full feature engineering, multicollinearity mitigation, elbow/silhouette method for k selection, and a rendered PDF report.

📂 [`projects/customer_segmentation/`](projects/customer_segmentation/)

---

### 📈 Microsoft Stock Price Forecasting with LSTM
`Python` `TensorFlow/Keras` `Scikit-learn` `Jupyter`

LSTM deep learning model trained on 37 years of MSFT daily data (1986–2023). Uses a 60-day sliding window, MinMaxScaler normalization, EarlyStopping, and recursive multi-step forecasting. Evaluated with RMSE, MAE, and MAPE on a chronological 80/10/10 split.

📂 [`projects/msft_analysis/`](projects/msft_analysis/) · 🌐 [Interactive Report](https://anass2024.github.io/anass24.github.io/projects/msft_analysis/MSFT.html)

---

### 🚗 Car Sales Strategy: Value Retention & Market Entry
`Python` `Pandas` `Matplotlib` `NumPy`

Retention-rate analysis across 157 models and 30 manufacturers. Computes 1-year depreciation per model, maps price vs. retention quadrants, and produces strategic recommendations for buyers, fleet managers, and market entrants. Five charts generated programmatically.

📂 [`projects/car_sales_analysis/`](projects/car_sales_analysis/)

---

### 🐍 Car Sales Data Analysis (Python)
`Python` `Pandas` `Matplotlib`

Exploratory data analysis on 157-row car sales dataset. Covers missing-value checks, top manufacturers by volume, price distributions by vehicle type, and HP/price/sales correlations. Outputs a full Markdown report with reproducible charts.

📂 [`projects/python_car_sales_analysis/`](projects/python_car_sales_analysis/)

---

### 🏦 Banking Transactions SQL Analysis
`PostgreSQL` `SQL` `CTEs` `Window Functions`

End-to-end SQL project: schema design, sample data, and analytical queries to answer business questions on product revenue, customer value, and monthly sales trends. Demonstrates joins, aggregations, `DATE_TRUNC`, and `RANK()` window functions.

📂 [`projects/sql_project/`](projects/sql_project/)

---

### 💰 Personal Finance Tracker
`JavaScript` `HTML/CSS` `Firebase` `Chart.js`

Single-page web app for tracking income and expenses. Features real-time Firebase cloud sync (with local-storage fallback for guest mode), budget progress bar, donut chart by category, monthly spending bar chart, CSV export, and a Load Demo Data button pre-loaded with 3 months of realistic EUR transactions.

📂 [`finance-tracker/`](finance-tracker/) · 🌐 [Live App](https://anass2024.github.io/anass24.github.io/finance-tracker/)

---

## Skills

| Area | Tools & Technologies |
|------|----------------------|
| Data Science & ML | Python (Pandas, Scikit-learn, Keras, TensorFlow), R, Jupyter |
| Deep Learning | LSTM, Neural Networks, EarlyStopping, Time-Series Forecasting |
| BI & Workflow | SQL, Excel, Power BI, IBM Cognos, Git & GitHub |
| Quantitative Methods | Regression, ARIMA, Hypothesis Testing, Statistical Inference |
| Web / Full-Stack | HTML, CSS, JavaScript, Firebase (Firestore + Auth) |

---

## Certifications

- **IBM Data Analyst Professional Certificate** (11 courses) — Coursera, Apr 2026
  [View Credential](https://coursera.org/share/d920015b3f45169865b8ab2b65a5bfaa) · [PDF](IBM_Data_Analyst.pdf)
- **Specialized Models: Time Series and Survival Analysis** — IBM / Coursera

---

## Repo Structure

```
anass24.github.io/
├── index.html                     # Portfolio homepage
├── styles.css
├── IBM_Data_Analyst.pdf
├── finance-tracker/               # Personal Finance Tracker app
│   ├── index.html
│   ├── styles.css
│   └── js/
├── projects/
│   ├── msft_analysis/             # LSTM stock forecasting
│   ├── customer_segmentation/     # K-Means clustering (R)
│   ├── car_sales_analysis/        # Value retention analysis (Python)
│   ├── python_car_sales_analysis/ # EDA car sales (Python)
│   └── sql_project/               # Retail SQL analysis
└── README.md
```
