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

function sanitizeTransactions(transactions) {
  const seen = new Set();

  return (Array.isArray(transactions) ? transactions : []).filter((transaction) => {
    const valid =
      transaction &&
      typeof transaction.id === "string" &&
      typeof transaction.title === "string" &&
      Number.isFinite(Number(transaction.amount)) &&
      typeof transaction.type === "string" &&
      typeof transaction.category === "string" &&
      typeof transaction.date === "string";

    if (!valid || seen.has(transaction.id)) {
      return false;
    }

    seen.add(transaction.id);
    transaction.amount = Number(transaction.amount);
    return true;
  });
}

export const localStore = {
  getTransactions() {
    return sanitizeTransactions(safeRead("pulsebudget-guest-transactions", []));
  },
  saveTransactions(transactions) {
    return safeWrite("pulsebudget-guest-transactions", sanitizeTransactions(transactions));
  },
  getBudget() {
    const budget = safeRead("pulsebudget-guest-budget", 0);
    return Number.isFinite(Number(budget)) && Number(budget) >= 0 ? Number(budget) : 0;
  },
  saveBudget(budget) {
    return safeWrite("pulsebudget-guest-budget", Number(budget) || 0);
  },
  clearGuestData() {
    window.localStorage.removeItem("pulsebudget-guest-transactions");
    window.localStorage.removeItem("pulsebudget-guest-budget");
  }
};
