import { STORAGE_KEYS } from "./constants.js";

function read(key, fallback) {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

export const store = {
  getTransactions() {
    return read(STORAGE_KEYS.transactions, []);
  },
  saveTransactions(transactions) {
    write(STORAGE_KEYS.transactions, transactions);
  },
  getBudget() {
    return read(STORAGE_KEYS.budget, 0);
  },
  saveBudget(budget) {
    write(STORAGE_KEYS.budget, budget);
  },
  getTheme() {
    return read(STORAGE_KEYS.theme, "light");
  },
  saveTheme(theme) {
    write(STORAGE_KEYS.theme, theme);
  }
};
