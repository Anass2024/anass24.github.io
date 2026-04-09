import { getLastMonth, isSameMonth } from "./utils.js";

export function applyFilters(transactions, filters, referenceDate = new Date()) {
  return transactions.filter((transaction) => {
    const matchesCategory =
      filters.category === "all" || transaction.category === filters.category;

    const matchesType = filters.type === "all" || transaction.type === filters.type;

    let matchesDate = true;
    if (filters.date === "thisMonth") {
      matchesDate = isSameMonth(transaction.date, referenceDate);
    }

    if (filters.date === "lastMonth") {
      matchesDate = isSameMonth(transaction.date, getLastMonth(referenceDate));
    }

    return matchesCategory && matchesType && matchesDate;
  });
}
