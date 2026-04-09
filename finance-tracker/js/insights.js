import { formatMonthKey, getMonthKey, getLastMonth, isSameMonth } from "./utils.js";

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
  const [topCategory] = getCategorySpending(transactions, categoriesMap);
  if (!topCategory) {
    return null;
  }

  return topCategory;
}

export function getMonthlyExpenseComparison(transactions, referenceDate = new Date()) {
  const currentMonthExpenses = transactions
    .filter((transaction) => transaction.type === "expense")
    .filter((transaction) => isSameMonth(transaction.date, referenceDate))
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const lastMonthDate = getLastMonth(referenceDate);
  const lastMonthExpenses = transactions
    .filter((transaction) => transaction.type === "expense")
    .filter((transaction) => isSameMonth(transaction.date, lastMonthDate))
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  if (lastMonthExpenses === 0) {
    return {
      currentMonthExpenses,
      lastMonthExpenses,
      changePercent: currentMonthExpenses > 0 ? 100 : 0
    };
  }

  return {
    currentMonthExpenses,
    lastMonthExpenses,
    changePercent: ((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100
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
    .map(([month, amount]) => ({ month, label: formatMonthKey(month), amount }));
}
