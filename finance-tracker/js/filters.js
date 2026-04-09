import { getMonthKey } from "./utils.js";

export function applyFilters(transactions, filters) {
  return transactions.filter((transaction) => {
    const categoryMatch =
      filters.category === "all" || transaction.category === filters.category;

    const typeMatch = filters.type === "all" || transaction.type === filters.type;

    const monthMatch =
      filters.month === "all" || getMonthKey(transaction.date) === filters.month;

    return categoryMatch && typeMatch && monthMatch;
  });
}
