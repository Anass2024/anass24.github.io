import { formatCurrency, formatDate } from "./utils.js";

function buildOption(value, label) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = label;
  return option;
}

export function populateCategorySelect(select, categories, includeAll = false) {
  select.innerHTML = "";

  if (includeAll) {
    select.append(buildOption("all", "All categories"));
  }

  categories.forEach((category) => {
    select.append(buildOption(category.value, `${category.icon} ${category.label}`));
  });
}

export function populateMonthFilter(select, months) {
  select.innerHTML = "";
  select.append(buildOption("all", "All months"));

  months.forEach((month) => {
    select.append(buildOption(month.value, month.label));
  });
}

export function showFormMessage(element, message, variant = "") {
  element.textContent = message;
  element.className = "helper-text";
  if (variant) {
    element.classList.add(variant);
  }
}

export function updateSummary(summary, count, extra, elements) {
  elements.balance.textContent = formatCurrency(summary.balance);
  elements.income.textContent = formatCurrency(summary.income);
  elements.expense.textContent = formatCurrency(summary.expenses);
  elements.count.textContent = String(count);

  if (!extra.topCategory) {
    elements.topCategory.textContent = "No expenses yet";
    elements.topCategoryValue.textContent = formatCurrency(0);
  } else {
    elements.topCategory.textContent = extra.topCategory.label;
    elements.topCategoryValue.textContent = formatCurrency(extra.topCategory.total);
  }

  elements.spentThisMonth.textContent = formatCurrency(extra.spentThisMonth);
}

export function renderTransactions(transactions, categoriesMap, container, template) {
  container.innerHTML = "";

  if (!transactions.length) {
    const emptyState = document.createElement("div");
    emptyState.className = "empty-state";
    emptyState.textContent = "No transactions yet. Add one above or change your filters.";
    container.append(emptyState);
    return;
  }

  const sortedTransactions = [...transactions].sort(
    (left, right) => new Date(right.date) - new Date(left.date)
  );

  sortedTransactions.forEach((transaction) => {
    const fragment = template.content.cloneNode(true);
    const category = categoriesMap.get(transaction.category);

    fragment.querySelector(".transaction-icon").textContent = category?.icon || "🧾";
    fragment.querySelector(".transaction-title").textContent = transaction.title;
    fragment.querySelector(".transaction-meta").textContent =
      `${category?.label || transaction.category} · ${formatDate(transaction.date)} · ${transaction.type}`;

    const amount = fragment.querySelector(".transaction-amount");
    amount.textContent = `${transaction.type === "income" ? "+" : "-"}${formatCurrency(transaction.amount)}`;
    amount.classList.add(transaction.type === "income" ? "positive" : "negative");

    fragment.querySelector(".delete-button").dataset.id = transaction.id;
    container.append(fragment);
  });
}
