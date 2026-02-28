# Customer Segmentation Analysis using K-Means Clustering
## Project Overview

This project performs a comprehensive Customer Segmentation Analysis on a dataset containing 2,240 customers. By utilizing the K-Means clustering algorithm, the analysis identifies distinct groups of customers based on their demographic characteristics, purchasing behaviors, and engagement with marketing campaigns. These insights are designed to help businesses develop targeted marketing strategies and improve customer retention.

## Key Features: 
  Data Preprocessing: Handling missing values in the Income column via median imputation.
  Feature Engineering: Creation of new metrics such as Age, Total_Spending, Total_Children, and Total_Purchases.
  Standardization: Scaling numerical features to ensure the K-Means algorithm performs accurately.
  Cluster Optimization: Implementation of the Elbow Method and Silhouette Analysis to determine the optimal number of clusters (k=4).
  Visualization: Clear 2D cluster plots using Principal Component Analysis (PCA) and specific behavioral plots (e.g., Income vs. Total Spending).

## Technologies Used
  R Language
  Tidyverse (dplyr, ggplot2, tidyr, readr) 
  Cluster Analysis: cluster, factoextra 
  Reporting: R Markdown & TinyTeX for PDF generation

## How to Run
  Ensure you have R and RStudio installed.
  Install required packages:
    install.packages("tidyverse")
    install.packages("cluster")
    install.packages("factoextra")
    install.packages("tinytex")
    tinytex::install_tinytex()
