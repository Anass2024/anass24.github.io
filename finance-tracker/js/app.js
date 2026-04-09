import { CATEGORIES } from "./constants.js";
import { DashboardCharts } from "./charts.js";
import { applyFilters } from "./filters.js";
import {
  calculateSummary,
  getCategorySpending,
  getMonthlyExpenseComparison,
  getMonthlyExpenseSeries,
  getTopSpendingCategory
} from "./insights.js";
import { store } from "./store.js";
import {
  applyTheme,
  populateCategorySelects,
  renderTransactions,
  updateBudget,
  updateInsights,
  updateSummary
} from "./ui.js";
import { getMonthKey, normalizeAmount, uid } from "./utils.js";

const categoriesMap = new Map(CATEGORIES.map((category) => [category.value, category]));

const elements = {
  transactionForm: document.querySelector("#transaction-form"),
  budgetForm: document.querySelector("#budget-form"),
  filtersForm: document.querySelector("#filters-form"),
  categorySelect: document.querySelector("#category-select"),
  filterCategory: document.querySelector("#filter-category"),
  filterType: document.querySelector("#filter-type"),
  filterDate: document.querySelector("#filter-date"),
  transactionList: document.querySelector("#transaction-list"),
  transactionTemplate: document.querySelector("#transaction-item-template"),
  themeToggle: document.querySelector("#theme-toggle"),
  exportCsv: document.querySelector("#export-csv"),
  resetFilters: document.querySelector("#reset-filters"),
  balance: document.querySelector("#balance-value"),
  income: document.querySelector("#income-value"),
  expense: document.querySelector("#expense-value"),
  count: document.querySelector("#transaction-count"),
  budgetInput: document.querySelector("#budget-input"),
  budgetSpent: document.querySelector("#budget-spent"),
  budgetRemaining: document.querySelector("#budget-remaining"),
  budgetPercent: document.querySelector("#budget-percent"),
  budgetProgress: document.querySelector("#budget-progress"),
  budgetAlert: document.querySelector("#budget-alert"),
  budgetPill: document.querySelector("#budget-status-pill"),
  topCategory: document.querySelector("#top-category"),
  topCategoryValue: document.querySelector("#top-category-value"),
  monthComparison: document.querySelector("#month-comparison"),
  monthComparisonDetail: document.querySelector("#month-comparison-detail"),
  categoryInsights: document.querySelector("#category-insights"),
  categoryChart: document.querySelector("#category-chart"),
  trendChart: document.querySelector("#trend-chart")
};

const charts = new DashboardCharts({
  categoryCanvas: elements.categoryChart,
  trendCanvas: elements.trendChart
});

const state = {
  transactions: [],
  budget: 0,
  filters: {
    category: "all",
    type: "all",
    date: "all"
  },
  theme: store.getTheme()
};

function isoDateForMonth(day, monthOffset = 0) {
  const reference = new Date();
  return new Date(
    reference.getFullYear(),
    reference.getMonth() + monthOffset,
    day
  ).toISOString().slice(0, 10);
}

function getSampleTransactions() {
  return [
    {
      id: uid(),
      title: "Monthly salary",
      amount: 2850,
      type: "income",
      category: "salary",
      date: isoDateForMonth(2, 0),
      recurring: true,
      recurringGroup: null
    },
    {
      id: uid(),
      title: "Apartment rent",
      amount: 900,
      type: "expense",
      category: "rent",
      date: isoDateForMonth(3, 0),
      recurring: true,
      recurringGroup: null
    },
    {
      id: uid(),
      title: "Groceries",
      amount: 168.5,
      type: "expense",
      category: "food",
      date: isoDateForMonth(5, 0),
      recurring: false,
      recurringGroup: null
    },
    {
      id: uid(),
      title: "Metro and taxis",
      amount: 74,
      type: "expense",
      category: "transport",
      date: isoDateForMonth(6, 0),
      recurring: false,
      recurringGroup: null
    },
    {
      id: uid(),
      title: "Electricity bill",
      amount: 92,
      type: "expense",
      category: "utilities",
      date: isoDateForMonth(7, 0),
      recurring: true,
      recurringGroup: null
    },
    {
      id: uid(),
      title: "Freelance dashboard project",
      amount: 640,
      type: "income",
      category: "freelance",
      date: isoDateForMonth(8, 0),
      recurring: false,
      recurringGroup: null
    },
    {
      id: uid(),
      title: "Cinema and dinner",
      amount: 58,
      type: "expense",
      category: "entertainment",
      date: isoDateForMonth(9, 0),
      recurring: false,
      recurringGroup: null
    },
    {
      id: uid(),
      title: "Course subscription",
      amount: 45,
      type: "expense",
      category: "education",
      date: isoDateForMonth(12, 0),
      recurring: false,
      recurringGroup: null
    },
    {
      id: uid(),
      title: "Monthly salary",
      amount: 2850,
      type: "income",
      category: "salary",
      date: isoDateForMonth(2, -1),
      recurring: false,
      recurringGroup: null
    },
    {
      id: uid(),
      title: "Apartment rent",
      amount: 900,
      type: "expense",
      category: "rent",
      date: isoDateForMonth(3, -1),
      recurring: false,
      recurringGroup: null
    },
    {
      id: uid(),
      title: "Groceries",
      amount: 151.25,
      type: "expense",
      category: "food",
      date: isoDateForMonth(8, -1),
      recurring: false,
      recurringGroup: null
    },
    {
      id: uid(),
      title: "Train tickets",
      amount: 88,
      type: "expense",
      category: "transport",
      date: isoDateForMonth(10, -1),
      recurring: false,
      recurringGroup: null
    },
    {
      id: uid(),
      title: "Weekend trip",
      amount: 210,
      type: "expense",
      category: "travel",
      date: isoDateForMonth(18, -1),
      recurring: false,
      recurringGroup: null
    }
  ].map((transaction) => ({
    ...transaction,
    recurringGroup: transaction.recurring ? transaction.id : null
  }));
}

function getCurrentMonthExpenses(transactions) {
  const currentMonthKey = getMonthKey(new Date());
  return transactions
    .filter((transaction) => transaction.type === "expense")
    .filter((transaction) => getMonthKey(transaction.date) === currentMonthKey)
    .reduce((sum, transaction) => sum + transaction.amount, 0);
}

function ensureRecurringTransactions() {
  // Generate missing monthly copies for recurring transactions so they remain
  // visible after refresh without requiring a backend scheduler.
  const existingKeys = new Set(
    state.transactions.map((transaction) => `${transaction.recurringGroup || transaction.id}-${getMonthKey(transaction.date)}`)
  );
  const today = new Date();
  const generated = [];

  state.transactions
    .filter((transaction) => transaction.recurring)
    .forEach((transaction) => {
      const startDate = new Date(transaction.date);
      let cursor = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());

      while (cursor <= today) {
        const monthKey = getMonthKey(cursor);
        const recurringGroup = transaction.recurringGroup || transaction.id;
        const compositeKey = `${recurringGroup}-${monthKey}`;

        if (!existingKeys.has(compositeKey)) {
          generated.push({
            ...transaction,
            id: uid(),
            date: cursor.toISOString().slice(0, 10),
            recurringGroup,
            generatedFromRecurring: true
          });
          existingKeys.add(compositeKey);
        }

        cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, startDate.getDate());
      }
    });

  if (generated.length) {
    state.transactions = [...state.transactions, ...generated];
    store.saveTransactions(state.transactions);
  }
}

function exportToCsv() {
  const headers = ["id", "title", "amount", "type", "category", "date", "recurring"];
  const rows = state.transactions.map((transaction) =>
    [
      transaction.id,
      `"${transaction.title.replace(/"/g, '""')}"`,
      transaction.amount,
      transaction.type,
      transaction.category,
      transaction.date,
      transaction.recurring ? "yes" : "no"
    ].join(",")
  );

  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "finance-transactions.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function computeBudgetModel() {
  const spent = getCurrentMonthExpenses(state.transactions);
  const percentage = state.budget ? (spent / state.budget) * 100 : 0;

  return {
    budget: state.budget,
    spent,
    remaining: Math.max(state.budget - spent, 0),
    percentage
  };
}

function render() {
  // The dashboard always renders from derived data so filters, insights,
  // charts, and totals stay in sync after every change.
  const filteredTransactions = applyFilters(state.transactions, state.filters);
  const summary = calculateSummary(filteredTransactions);
  const categorySpending = getCategorySpending(filteredTransactions, categoriesMap);
  const topCategory = getTopSpendingCategory(filteredTransactions, categoriesMap);
  const comparison = getMonthlyExpenseComparison(state.transactions);
  const monthlySeries = getMonthlyExpenseSeries(filteredTransactions);

  updateSummary(summary, filteredTransactions.length, {
    balance: elements.balance,
    income: elements.income,
    expense: elements.expense,
    count: elements.count
  });

  updateBudget(computeBudgetModel(), {
    input: elements.budgetInput,
    spent: elements.budgetSpent,
    remaining: elements.budgetRemaining,
    percent: elements.budgetPercent,
    progress: elements.budgetProgress,
    alert: elements.budgetAlert,
    pill: elements.budgetPill
  });

  updateInsights(
    { topCategory, comparison, categorySpending },
    {
      topCategory: elements.topCategory,
      topCategoryValue: elements.topCategoryValue,
      monthComparison: elements.monthComparison,
      monthComparisonDetail: elements.monthComparisonDetail,
      categoryInsights: elements.categoryInsights
    }
  );

  renderTransactions(
    filteredTransactions,
    categoriesMap,
    elements.transactionList,
    elements.transactionTemplate
  );

  charts.renderCategoryChart(categorySpending, state.theme);
  charts.renderTrendChart(monthlySeries, state.theme);
}

function handleTransactionSubmit(event) {
  event.preventDefault();
  const formData = new FormData(elements.transactionForm);
  const transaction = {
    id: uid(),
    title: formData.get("title").trim(),
    amount: normalizeAmount(formData.get("amount")),
    type: formData.get("type"),
    category: formData.get("category"),
    date: formData.get("date"),
    recurring: formData.get("recurring") === "on",
    recurringGroup: null
  };

  if (!transaction.title || !transaction.amount || !transaction.date) {
    return;
  }

  if (transaction.recurring) {
    transaction.recurringGroup = transaction.id;
  }

  state.transactions = [...state.transactions, transaction];
  store.saveTransactions(state.transactions);
  elements.transactionForm.reset();
  elements.transactionForm.elements.date.value = new Date().toISOString().slice(0, 10);
  render();
}

function handleBudgetSubmit(event) {
  event.preventDefault();
  state.budget = normalizeAmount(elements.budgetInput.value || 0);
  store.saveBudget(state.budget);
  render();
}

function handleFilterChange() {
  state.filters = {
    category: elements.filterCategory.value,
    type: elements.filterType.value,
    date: elements.filterDate.value
  };
  render();
}

function resetFilters() {
  state.filters = {
    category: "all",
    type: "all",
    date: "all"
  };

  elements.filterCategory.value = "all";
  elements.filterType.value = "all";
  elements.filterDate.value = "all";
  render();
}

function deleteTransaction(transactionId) {
  state.transactions = state.transactions.filter((transaction) => transaction.id !== transactionId);
  store.saveTransactions(state.transactions);
  render();
}

function toggleTheme() {
  state.theme = state.theme === "dark" ? "light" : "dark";
  store.saveTheme(state.theme);
  applyTheme(state.theme, elements.themeToggle);
  render();
}

function seedFormDefaults() {
  elements.transactionForm.elements.date.value = new Date().toISOString().slice(0, 10);
}

function bindEvents() {
  elements.transactionForm.addEventListener("submit", handleTransactionSubmit);
  elements.budgetForm.addEventListener("submit", handleBudgetSubmit);
  elements.filtersForm.addEventListener("change", handleFilterChange);
  elements.resetFilters.addEventListener("click", resetFilters);
  elements.themeToggle.addEventListener("click", toggleTheme);
  elements.exportCsv.addEventListener("click", exportToCsv);

  elements.transactionList.addEventListener("click", (event) => {
    const button = event.target.closest(".delete-button");
    if (button?.dataset.id) {
      deleteTransaction(button.dataset.id);
    }
  });
}

function init() {
  state.transactions = store.getTransactions();
  state.budget = store.getBudget();

  if (!state.transactions.length) {
    state.transactions = getSampleTransactions();
    store.saveTransactions(state.transactions);
  }

  if (!state.budget) {
    state.budget = 3200;
    store.saveBudget(state.budget);
  }

  populateCategorySelects({
    categorySelect: elements.categorySelect,
    filterCategory: elements.filterCategory,
    categories: CATEGORIES
  });

  applyTheme(state.theme, elements.themeToggle);
  seedFormDefaults();
  ensureRecurringTransactions();
  bindEvents();
  render();
}

init();
