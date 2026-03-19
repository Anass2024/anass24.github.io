# Customer Segmentation & Marketing Insights

## Project Overview

K-Means clustering analysis on 2,240 customers to identify distinct behavioral segments and derive targeted marketing strategies. Built in R with a full R Markdown report rendered to PDF.

The analysis segments customers by income, spending patterns, purchase channels, and campaign engagement — producing four named personas with actionable marketing recommendations for each.

---

## Customer Segments Identified

| Cluster | Persona | Profile |
|---------|---------|---------|
| 1 | **Budget Shoppers** | Lower income, minimal spending, low campaign response |
| 2 | **Premium Customers** | High income, high spending, most responsive to campaigns |
| 3 | **Mid-Range Buyers** | Moderate income and spending, occasional deal seekers |
| 4 | **High-Value Loyalists** | High income, frequent purchases, high catalog/store usage |

---

## Methodology

**1. Data Cleaning**
- Imputed 24 missing `Income` values with the median (robust to outliers)
- Detected and removed income outliers using the IQR-based boxplot rule
- Reference year for `Age` derived dynamically from `Dt_Customer` — no hardcoded values

**2. Feature Engineering**
- `Age` = reference year − `Year_Birth`
- `Total_Spending` = sum of all product category spend (Wines, Fruits, Meat, Fish, Sweets, Gold)
- `Total_Purchases` = Web + Catalog + Store purchases
- `Total_Accepted_Campaigns` = sum of 5 campaign response flags
- `Total_Children` = Kids at home + Teens at home

**3. Feature Selection — Multicollinearity Avoided**

Aggregate features are used *instead of* their individual components to prevent double-weighting in the distance calculations K-Means relies on:

| Used | Dropped |
|------|---------|
| `Total_Spending` | `MntWines`, `MntFruits`, `MntMeatProducts`, `MntFishProducts`, `MntSweetProducts`, `MntGoldProds` |
| `Total_Purchases` | `NumWebPurchases`, `NumCatalogPurchases`, `NumStorePurchases` |
| `Total_Accepted_Campaigns` | `AcceptedCmp1` – `AcceptedCmp5` |

Final feature set: 11 variables across demographics, spending, channel behavior, and engagement.

**4. Scaling**
- All features standardized with `scale()` (mean = 0, sd = 1)
- Scaling parameters saved (`scale_center`, `scale_sd`) for applying to new data

**5. Optimal k Selection**
- Elbow Method (WSS) and Silhouette Method both plotted and compared
- k = 4 selected based on visual analysis

**6. Validation**
- Average silhouette width computed post-clustering to confirm cluster separation quality

**7. Visualizations**
- PCA cluster plot (`fviz_cluster`)
- Scatter plots: Income vs Spending, Recency vs Spending, Age vs Income
- Box plots: Spending and Income distributions per segment
- Centroid heatmap (Z-scores across all features) for full cluster profile at a glance

---

## Project Structure

```
customer_segmentation/
├── customer_segmentation.rmd          # R Markdown source (full analysis + report)
├── customer_segmentation.R            # Standalone R script
├── customer_segmentation.csv          # Dataset (2,240 customers, 29 columns)
├── customer_segmentation_Report.pdf   # Rendered PDF report
└── README.md
```

---

## How to Run

**Requirements:** R 4.0+ and RStudio

```r
install.packages(c("tidyverse", "cluster", "factoextra", "knitr", "tinytex"))
tinytex::install_tinytex()  # for PDF rendering
```

**Render the report to PDF:**

```r
rmarkdown::render("customer_segmentation.rmd")
```

**Or run the standalone script:**

```r
source("customer_segmentation.R")
```

---

## Dataset

- **Source:** [Kaggle — Customer Personality Analysis](https://www.kaggle.com/datasets/imakash3011/customer-personality-analysis)
- **Rows:** 2,240 customers
- **Columns:** 29 (demographics, spending by category, purchase channels, campaign responses)
- **Notable column:** `Income` — 24 missing values, imputed with median

---

## Technologies

- **R** — dplyr, tidyr, ggplot2, readr
- **Clustering** — cluster, factoextra
- **Reporting** — R Markdown, knitr, TinyTeX (PDF)
