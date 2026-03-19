# Microsoft Stock Price Forecasting with LSTM

## Project Overview

This project forecasts Microsoft's stock price using a Long Short-Term Memory (LSTM) deep learning model trained on 37 years of historical daily data (March 1986 – December 2023). The model learns temporal patterns in adjusted close prices and generates both direct and recursive multi-step forecasts, evaluated with quantitative metrics on a held-out test set.

---

## Methodology

| Step | Choice | Reason |
|------|--------|--------|
| Price column | `Adj Close` | Corrects for stock splits and dividends across 37 years |
| Date parsing | `pd.to_datetime()` | Built-in pandas utility — reliable and concise |
| Normalization | `MinMaxScaler` (0–1) | Required for stable LSTM gradient flow |
| Window size | 60 trading days | ~3 months of context for meaningful sequence learning |
| Windowing | pandas `.shift()` | Gap-safe and simpler than manual date-walking loops |
| Train / Val / Test | 80% / 10% / 10% | Chronological split — no shuffling |
| Training | `EarlyStopping` (patience=10) | Prevents overfitting; restores best weights |
| Evaluation | RMSE, MAE, MAPE | Quantitative assessment beyond visual inspection |
| Recursive forecast | Rolling window update | Each prediction feeds the next step |

---

## Model Architecture

```
Input: (60 timesteps × 1 feature)
  → LSTM(64 units)
  → Dense(32, ReLU)
  → Dense(32, ReLU)
  → Dense(1)

Loss: MSE | Optimizer: Adam (lr=0.001) | Metric: MAE
```

---

## Key Results

- Predictions are inverse-transformed back to USD for interpretability
- Recursive forecasting shows realistic error accumulation over time
- Model saved to `msft_lstm_best.keras` (best validation checkpoint) and `msft_lstm_final.keras`

---

## Project Structure

```
msft_analysis/
├── MSFT.ipynb        # Full notebook with all code, analysis, and plots
├── MSFT.html         # Rendered interactive report (portfolio view)
├── MSFT.csv          # Historical MSFT daily OHLCV data (1986–2023)
└── README.md
```

---

## How to Run

**Requirements:** Python 3.8+

```bash
pip install pandas numpy matplotlib scikit-learn tensorflow
```

**Run the notebook:**

```bash
jupyter notebook MSFT.ipynb
```

The notebook is fully self-contained. Run all cells top-to-bottom — the scaler, model, and predictions are defined and used in sequence.

---

## Dataset

- **Source:** Yahoo Finance historical data for `MSFT`
- **Period:** March 13, 1986 – December 29, 2023
- **Rows:** 9,527 trading days
- **Columns used:** `Date`, `Adj Close`

---

## Technologies

- **Python** — pandas, NumPy, Matplotlib
- **Scikit-learn** — MinMaxScaler, RMSE/MAE metrics
- **TensorFlow / Keras** — LSTM model, EarlyStopping, ModelCheckpoint
- **Jupyter Notebook**
