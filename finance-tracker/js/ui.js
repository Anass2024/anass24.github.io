import { formatCurrency, formatDate } from "./utils.js";

function buildOption(value, label) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = label;
  return option;
}

export function populateCategorySelects({ categorySelect, filterCategory, categories }) {
  categorySelect.innerHTML = "";
  filterCategory.innerHTML = "";

  filterCategory.append(buildOption("all", "All categories"));

  categories.forEach((category) => {
    categorySelect.append(buildOption(category.value, `${category.icon} ${category.label}`));
    filterCategory.append(buildOption(category.value, `${category.icon} ${category.label}`));
  });
}

export function updateSummary(summary, count, elements) {
  elements.balance.textContent = formatCurrency(summary.balance);
  elements.income.textContent = formatCurrency(summary.income);
  elements.expense.textContent = formatCurrency(summary.expenses);
  elements.count.textContent = count;
}

export function updateBudget({ budget, spent, remaining, percentage }, elements) {
  elements.input.value = budget ? budget : "";
  elements.spent.textContent = formatCurrency(spent);
  elements.remaining.textContent = formatCurrency(remaining);
  elements.percent.textContent = `${percentage.toFixed(0)}%`;
  elements.progress.style.width = `${Math.min(percentage, 100)}%`;

  if (!budget) {
    elements.alert.textContent = "Set a monthly budget to start tracking progress.";
    elements.alert.classList.remove("budget-warning");
    elements.pill.textContent = "Budget not set";
    return;
  }

  if (percentage > 100) {
    elements.alert.textContent = `Budget exceeded by ${formatCurrency(spent - budget)}.`;
    elements.alert.classList.add("budget-warning");
    elements.pill.textContent = "Budget exceeded";
    return;
  }

  elements.alert.textContent = `You still have ${formatCurrency(remaining)} available this month.`;
  elements.alert.classList.remove("budget-warning");
  elements.pill.textContent = "Budget on track";
}

export function updateInsights(
  { topCategory, comparison, categorySpending },
  elements
) {
  if (!topCategory) {
    elements.topCategory.textContent = "No expenses yet";
    elements.topCategoryValue.textContent = formatCurrency(0);
  } else {
    elements.topCategory.textContent = topCategory.label;
    elements.topCategoryValue.textContent = formatCurrency(topCategory.total);
  }

  const direction = comparison.changePercent >= 0 ? "up" : "down";
  elements.monthComparison.textContent = `${comparison.changePercent.toFixed(1)}% ${direction}`;
  elements.monthComparisonDetail.textContent =
    `${formatCurrency(comparison.currentMonthExpenses)} this month vs ${formatCurrency(comparison.lastMonthExpenses)} last month`;

  elements.categoryInsights.innerHTML = "";
  if (!categorySpending.length) {
    const item = document.createElement("li");
    item.textContent = "No category spending data yet.";
    elements.categoryInsights.append(item);
    return;
  }

  categorySpending.forEach((entry) => {
    const item = document.createElement("li");
    const label = document.createElement("span");
    label.textContent = entry.label;
    const value = document.createElement("strong");
    value.textContent = formatCurrency(entry.total);
    item.append(label, value);
    elements.categoryInsights.append(item);
  });
}

export function renderTransactions(transactions, categoriesMap, container, template) {
  container.innerHTML = "";

  if (!transactions.length) {
    const emptyState = document.createElement("div");
    emptyState.className = "empty-state";
    emptyState.textContent = "No transactions match the current filters yet.";
    container.append(emptyState);
    return;
  }

  const sortedTransactions = [...transactions].sort(
    (left, right) => new Date(right.date) - new Date(left.date)
  );

  sortedTransactions.forEach((transaction) => {
    const fragment = template.content.cloneNode(true);
    const category = categoriesMap.get(transaction.category);
    const transactionItem = fragment.querySelector(".transaction-item");
    const icon = fragment.querySelector(".transaction-icon");
    const title = fragment.querySelector(".transaction-title");
    const subtitle = fragment.querySelector(".transaction-subtitle");
    const amount = fragment.querySelector(".transaction-amount");
    const button = fragment.querySelector(".delete-button");

    icon.textContent = category?.icon || "🧾";
    title.textContent = transaction.title;

    const recurringText = transaction.recurring ? " · recurring" : "";
    subtitle.textContent =
      `${category?.label || transaction.category} · ${formatDate(transaction.date)}${recurringText}`;

    amount.textContent = `${transaction.type === "income" ? "+" : "-"}${formatCurrency(transaction.amount)}`;
    amount.classList.add(transaction.type === "income" ? "positive" : "negative");

    button.dataset.id = transaction.id;
    transactionItem.dataset.id = transaction.id;

    container.append(fragment);
  });
}

export function applyTheme(theme, toggleButton) {
  document.body.classList.toggle("dark", theme === "dark");
  toggleButton.setAttribute("aria-pressed", String(theme === "dark"));
  toggleButton.textContent = theme === "dark" ? "Use light mode" : "Use dark mode";
}
