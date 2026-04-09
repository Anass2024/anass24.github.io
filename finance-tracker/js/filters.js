import { getMonthKey } from "./utils.js";

export function applyFilters(transactions, filters) {
  return transactions.filter((transaction) => {
    const matchesCategory =
      filters.category === "all" || transaction.category === filters.category;

    const matchesType =
      filters.type === "all" || transaction.type === filters.type;

    const matchesMonth =
      filters.month === "all" || getMonthKey(transaction.date) === filters.month;

    return matchesCategory && matchesType && matchesMonth;
  });
}
