import { formatMonthKey, getMonthKey } from "./utils.js";

export function calculateSummary(transactions) {
  return transactions.reduce(
    (summary, transaction) => {
      if (transaction.type === "income") {
        summary.income += transaction.amount;
      } else {
        summary.expenses += transaction.amount;
      }

      summary.balance = summary.income - summary.expenses;
      return summary;
    },
    { income: 0, expenses: 0, balance: 0 }
  );
}

export function getCategorySpending(transactions, categoriesMap) {
  const totals = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((accumulator, transaction) => {
      accumulator[transaction.category] =
        (accumulator[transaction.category] || 0) + transaction.amount;
      return accumulator;
    }, {});

  return Object.entries(totals)
    .map(([category, total]) => ({
      category,
      total,
      label: categoriesMap.get(category)?.label || category
    }))
    .sort((left, right) => right.total - left.total);
}

export function getTopSpendingCategory(transactions, categoriesMap) {
  return getCategorySpending(transactions, categoriesMap)[0] || null;
}

export function getSpentThisMonth(transactions, referenceDate = new Date()) {
  const currentMonth = getMonthKey(referenceDate);
  return transactions
    .filter((transaction) => transaction.type === "expense")
    .filter((transaction) => getMonthKey(transaction.date) === currentMonth)
    .reduce((sum, transaction) => sum + transaction.amount, 0);
}

export function getMonthOptions(transactions) {
  const keys = new Set([getMonthKey(new Date())]);
  transactions.forEach((transaction) => keys.add(getMonthKey(transaction.date)));

  return [...keys]
    .sort((left, right) => right.localeCompare(left))
    .map((key) => ({ value: key, label: formatMonthKey(key) }));
}

export function getBudgetSnapshot(budget, spentThisMonth) {
  const percentage = budget > 0 ? (spentThisMonth / budget) * 100 : 0;
  return {
    budget,
    spentThisMonth,
    percentage,
    remaining: Math.max(budget - spentThisMonth, 0),
    exceeded: budget > 0 && spentThisMonth > budget
  };
}

export function getMonthlyExpenseSeries(transactions) {
  const grouped = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((accumulator, transaction) => {
      const monthKey = getMonthKey(transaction.date);
      accumulator[monthKey] = (accumulator[monthKey] || 0) + transaction.amount;
      return accumulator;
    }, {});

  return Object.entries(grouped)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([month, amount]) => ({
      month,
      label: formatMonthKey(month),
      amount
    }));
}
