import { CategoryChart } from "./charts.js";
import { CATEGORIES } from "./constants.js";
import { applyFilters } from "./filters.js";
import {
  calculateSummary,
  getCategorySpending,
  getMonthOptions,
  getSpentThisMonth,
  getTopSpendingCategory
} from "./insights.js";
import { store } from "./store.js";
import {
  populateCategorySelect,
  populateMonthFilter,
  renderTransactions,
  showFormMessage,
  updateSummary
} from "./ui.js";
import { normalizeAmount, todayIso, uid } from "./utils.js";

const categoriesMap = new Map(CATEGORIES.map((category) => [category.value, category]));

const elements = {
  transactionForm: document.querySelector("#transaction-form"),
  resetForm: document.querySelector("#reset-form"),
  filtersForm: document.querySelector("#filters-form"),
  loadDemo: document.querySelector("#load-demo"),
  categorySelect: document.querySelector("#category-select"),
  filterCategory: document.querySelector("#filter-category"),
  filterMonth: document.querySelector("#filter-month"),
  filterType: document.querySelector("#filter-type"),
  resetFilters: document.querySelector("#reset-filters"),
  transactionList: document.querySelector("#transaction-list"),
  transactionTemplate: document.querySelector("#transaction-item-template"),
  formMessage: document.querySelector("#form-message"),
  balance: document.querySelector("#balance-value"),
  income: document.querySelector("#income-value"),
  expense: document.querySelector("#expense-value"),
  count: document.querySelector("#transaction-count"),
  topCategory: document.querySelector("#top-category"),
  topCategoryValue: document.querySelector("#top-category-value"),
  spentThisMonth: document.querySelector("#spent-this-month"),
  categoryChart: document.querySelector("#category-chart")
};

const chart = new CategoryChart(elements.categoryChart);

const state = {
  transactions: store.getTransactions(),
  filters: {
    category: "all",
    month: "all",
    type: "all"
  }
};

function getDemoTransactions() {
  const entries = [
    ["Salary payment", 3200, "income", "other", "2026-04-01"],
    ["Apartment rent", 980, "expense", "rent", "2026-04-02"],
    ["Groceries", 146.35, "expense", "food", "2026-04-04"],
    ["Bus pass", 52, "expense", "transport", "2026-04-05"],
    ["Freelance payment", 740, "income", "other", "2026-04-08"],
    ["Groceries", 132.2, "expense", "food", "2026-04-11"],
    ["Taxi", 18.5, "expense", "transport", "2026-04-13"],
    ["House supplies", 74.9, "expense", "other", "2026-04-16"],
    ["Salary payment", 3200, "income", "other", "2026-03-01"],
    ["Apartment rent", 980, "expense", "rent", "2026-03-02"],
    ["Groceries", 154.8, "expense", "food", "2026-03-06"],
    ["Train tickets", 67.4, "expense", "transport", "2026-03-09"],
    ["Utilities", 88.2, "expense", "other", "2026-03-12"],
    ["Groceries", 121.75, "expense", "food", "2026-03-18"],
    ["Salary payment", 3100, "income", "other", "2026-02-01"],
    ["Apartment rent", 950, "expense", "rent", "2026-02-02"],
    ["Groceries", 140.15, "expense", "food", "2026-02-07"],
    ["Metro card", 44, "expense", "transport", "2026-02-10"],
    ["Doctor visit", 62, "expense", "other", "2026-02-17"]
  ];

  return entries.map(([title, amount, type, category, date]) => ({
    id: uid(),
    title,
    amount,
    type,
    category,
    date
  }));
}

function validateTransaction(formData) {
  const title = formData.get("title")?.trim() || "";
  const amountValue = formData.get("amount");
  const amount = normalizeAmount(amountValue);
  const type = formData.get("type");
  const category = formData.get("category");
  const date = formData.get("date");

  if (!title || !amountValue || !type || !category || !date) {
    return { error: "Please complete all fields before saving." };
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: "Enter a valid amount greater than zero." };
  }

  if (amount > 999999999.99) {
    return { error: "Amount is too large. Please enter a smaller value." };
  }

  return {
    value: {
      id: uid(),
      title,
      amount,
      type,
      category,
      date
    }
  };
}

function saveTransactions(nextTransactions) {
  // Persist first, then update in-memory state so the UI never implies a save
  // worked when the browser storage layer actually rejected it.
  const didSave = store.saveTransactions(nextTransactions);

  if (!didSave) {
    showFormMessage(
      elements.formMessage,
      "Could not save your data in this browser. Please check local storage settings.",
      "error"
    );
    return false;
  }

  state.transactions = nextTransactions;
  return true;
}

function render() {
  const filteredTransactions = applyFilters(state.transactions, state.filters);
  const summary = calculateSummary(filteredTransactions);
  const categorySpending = getCategorySpending(filteredTransactions, categoriesMap);
  const topCategory = getTopSpendingCategory(state.transactions, categoriesMap);
  const spentThisMonth = getSpentThisMonth(state.transactions);
  const monthOptions = getMonthOptions(state.transactions);

  populateMonthFilter(elements.filterMonth, monthOptions);
  elements.filterMonth.value = state.filters.month;

  updateSummary(summary, filteredTransactions.length, { topCategory, spentThisMonth }, {
    balance: elements.balance,
    income: elements.income,
    expense: elements.expense,
    count: elements.count,
    topCategory: elements.topCategory,
    topCategoryValue: elements.topCategoryValue,
    spentThisMonth: elements.spentThisMonth
  });

  renderTransactions(
    filteredTransactions,
    categoriesMap,
    elements.transactionList,
    elements.transactionTemplate
  );

  chart.render(categorySpending);
}

function resetForm() {
  elements.transactionForm.reset();
  elements.transactionForm.elements.date.value = todayIso();
  showFormMessage(elements.formMessage, "");
}

function handleSubmit(event) {
  event.preventDefault();

  const result = validateTransaction(new FormData(elements.transactionForm));
  if (result.error) {
    showFormMessage(elements.formMessage, result.error, "error");
    return;
  }

  const nextTransactions = [...state.transactions, result.value];
  if (!saveTransactions(nextTransactions)) {
    return;
  }

  resetForm();
  showFormMessage(elements.formMessage, "Transaction saved.", "success");
  render();
}

function handleDelete(event) {
  const button = event.target.closest(".delete-button");
  if (!button?.dataset.id) {
    return;
  }

  const nextTransactions = state.transactions.filter(
    (transaction) => transaction.id !== button.dataset.id
  );

  if (!saveTransactions(nextTransactions)) {
    return;
  }

  showFormMessage(elements.formMessage, "Transaction deleted.", "success");
  render();
}

function handleFilterChange() {
  state.filters = {
    category: elements.filterCategory.value,
    month: elements.filterMonth.value,
    type: elements.filterType.value
  };
  render();
}

function resetFilters() {
  state.filters = {
    category: "all",
    month: "all",
    type: "all"
  };

  elements.filterCategory.value = "all";
  elements.filterMonth.value = "all";
  elements.filterType.value = "all";
  render();
}

function loadDemoData() {
  if (!saveTransactions(getDemoTransactions())) {
    return;
  }

  showFormMessage(elements.formMessage, "Demo data loaded.", "success");
  render();
}

function init() {
  populateCategorySelect(elements.categorySelect, CATEGORIES);
  populateCategorySelect(elements.filterCategory, CATEGORIES, true);
  elements.transactionForm.elements.date.value = todayIso();

  elements.transactionForm.addEventListener("submit", handleSubmit);
  elements.resetForm.addEventListener("click", resetForm);
  elements.filtersForm.addEventListener("change", handleFilterChange);
  elements.resetFilters.addEventListener("click", resetFilters);
  elements.transactionList.addEventListener("click", handleDelete);
  elements.loadDemo.addEventListener("click", loadDemoData);

  render();
}

init();
