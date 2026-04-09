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
  months.forEach((month) => select.append(buildOption(month.value, month.label)));
}

export function showMessage(element, message, variant = "") {
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
    elements.insightMessage.textContent = "Add a few expense transactions to start getting insights.";
  } else {
    elements.topCategory.textContent = extra.topCategory.label;
    elements.topCategoryValue.textContent = formatCurrency(extra.topCategory.total);
    elements.insightMessage.textContent = `You spent most on ${extra.topCategory.label} this month.`;
  }

  elements.spentThisMonth.textContent = formatCurrency(extra.spentThisMonth);
}

export function updateBudget(snapshot, elements) {
  elements.input.value = snapshot.budget ? snapshot.budget : "";
  elements.percent.textContent = `${snapshot.percentage.toFixed(0)}%`;
  elements.spent.textContent = formatCurrency(snapshot.spentThisMonth);
  elements.remaining.textContent = formatCurrency(snapshot.remaining);
  elements.progress.style.width = `${Math.min(snapshot.percentage, 100)}%`;

  if (!snapshot.budget) {
    elements.message.textContent = "Set a monthly budget to track progress and get alerts.";
    elements.message.classList.remove("budget-warning");
    return;
  }

  if (snapshot.exceeded) {
    elements.message.textContent = `Budget exceeded by ${formatCurrency(snapshot.spentThisMonth - snapshot.budget)}.`;
    elements.message.classList.add("budget-warning");
    return;
  }

  elements.message.textContent = `You still have ${formatCurrency(snapshot.remaining)} available this month.`;
  elements.message.classList.remove("budget-warning");
}

export function renderTransactions(transactions, categoriesMap, container, template) {
  container.innerHTML = "";

  if (!transactions.length) {
    const emptyState = document.createElement("div");
    emptyState.className = "empty-state";
    emptyState.textContent = "No transactions yet. Add your first one to start building the dashboard.";
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

    const recurringText = transaction.recurring ? " · recurring" : "";
    fragment.querySelector(".transaction-meta").textContent =
      `${category?.label || transaction.category} · ${formatDate(transaction.date)} · ${transaction.type}${recurringText}`;

    const amount = fragment.querySelector(".transaction-amount");
    amount.textContent = `${transaction.type === "income" ? "+" : "-"}${formatCurrency(transaction.amount)}`;
    amount.classList.add(transaction.type === "income" ? "positive" : "negative");

    fragment.querySelector(".delete-button").dataset.id = transaction.id;
    container.append(fragment);
  });
}

export function setLoadingState(loadingElement, loading) {
  loadingElement.classList.toggle("hidden", !loading);
}

export function setErrorState(errorElement, message = "") {
  errorElement.textContent = message;
  errorElement.classList.toggle("hidden", !message);
}

export function setAuthMode({
  authPanel,
  appPanel,
  userChip,
  userEmail
}, isAuthenticated) {
  authPanel.classList.toggle("hidden", isAuthenticated);
  appPanel.classList.toggle("hidden", !isAuthenticated);
  userChip.classList.toggle("hidden", !isAuthenticated);
  userChip.textContent = isAuthenticated ? userEmail : "";
}
