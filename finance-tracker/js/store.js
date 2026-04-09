import { STORAGE_KEYS } from "./constants.js";

function safeRead(key, fallback) {
  try {
    const rawValue = window.localStorage.getItem(key);
    return rawValue ? JSON.parse(rawValue) : fallback;
  } catch {
    return fallback;
  }
}

function safeWrite(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export const store = {
  getTransactions() {
    const currentTransactions = safeRead(STORAGE_KEYS.transactions, null);
    if (Array.isArray(currentTransactions)) {
      return currentTransactions;
    }

    const legacyTransactions = safeRead(STORAGE_KEYS.legacyTransactions, []);
    return Array.isArray(legacyTransactions) ? legacyTransactions : [];
  },
  saveTransactions(transactions) {
    return safeWrite(STORAGE_KEYS.transactions, transactions);
  }
};
