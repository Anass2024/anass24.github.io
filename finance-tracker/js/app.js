import { logInWithEmail, logOut, signUpWithEmail, watchAuthState } from "./auth.js";
import { DashboardCharts } from "./charts.js";
import { APP_COPY, CATEGORIES } from "./constants.js";
import {
  addTransaction as addTransactionDoc,
  deleteTransaction as deleteTransactionDoc,
  saveBudget as saveBudgetDoc,
  subscribeToSettings,
  subscribeToTransactions,
  upsertTransaction
} from "./db.js";
import { applyFilters } from "./filters.js";
import { firebaseReady } from "./firebase.js";
import {
  calculateSummary,
  getBudgetSnapshot,
  getCategorySpending,
  getMonthOptions,
  getMonthlyExpenseSeries,
  getSpentThisMonth,
  getTopSpendingCategory
} from "./insights.js";
import { localStore } from "./local-store.js";
import {
  populateCategorySelect,
  populateMonthFilter,
  renderTransactions,
  setAuthMode,
  setErrorState,
  setLoadingState,
  showMessage,
  updateBudget,
  updateSummary
} from "./ui.js";
import { escapeCsvValue, normalizeAmount, todayIso, uid } from "./utils.js";

const categoriesMap = new Map(CATEGORIES.map((category) => [category.value, category]));

const elements = {
  authPanel: document.querySelector("#auth-panel"),
  appPanel: document.querySelector("#app-panel"),
  authForm: document.querySelector("#auth-form"),
  authEmail: document.querySelector("#auth-email"),
  authPassword: document.querySelector("#auth-password"),
  authMessage: document.querySelector("#auth-message"),
  loginButton: document.querySelector("#login-button"),
  logoutButton: document.querySelector("#logout-button"),
  openAuthButton: document.querySelector("#open-auth-button"),
  closeAuthButton: document.querySelector("#close-auth-button"),
  userChip: document.querySelector("#user-chip"),
  guestBanner: document.querySelector("#guest-banner"),
  transactionForm: document.querySelector("#transaction-form"),
  resetForm: document.querySelector("#reset-form"),
  recurringInput: document.querySelector("#recurring-input"),
  budgetForm: document.querySelector("#budget-form"),
  budgetInput: document.querySelector("#budget-input"),
  filtersForm: document.querySelector("#filters-form"),
  categorySelect: document.querySelector("#category-select"),
  filterCategory: document.querySelector("#filter-category"),
  filterMonth: document.querySelector("#filter-month"),
  filterType: document.querySelector("#filter-type"),
  resetFilters: document.querySelector("#reset-filters"),
  transactionList: document.querySelector("#transaction-list"),
  transactionTemplate: document.querySelector("#transaction-item-template"),
  formMessage: document.querySelector("#form-message"),
  syncStatus: document.querySelector("#sync-status"),
  exportCsv: document.querySelector("#export-csv"),
  loadingState: document.querySelector("#loading-state"),
  errorState: document.querySelector("#error-state"),
  balance: document.querySelector("#balance-value"),
  income: document.querySelector("#income-value"),
  expense: document.querySelector("#expense-value"),
  count: document.querySelector("#transaction-count"),
  topCategory: document.querySelector("#top-category"),
  topCategoryValue: document.querySelector("#top-category-value"),
  insightMessage: document.querySelector("#insight-message"),
  spentThisMonth: document.querySelector("#spent-this-month"),
  budgetPercent: document.querySelector("#budget-percent"),
  budgetSpent: document.querySelector("#budget-spent"),
  budgetRemaining: document.querySelector("#budget-remaining"),
  budgetProgress: document.querySelector("#budget-progress"),
  budgetMessage: document.querySelector("#budget-message"),
  categoryChart: document.querySelector("#category-chart"),
  trendChart: document.querySelector("#trend-chart")
};

const charts = new DashboardCharts({
  categoryCanvas: elements.categoryChart,
  trendCanvas: elements.trendChart
});

const state = {
  mode: "guest",
  user: null,
  transactions: [],
  budget: 0,
  filters: {
    category: "all",
    month: "all",
    type: "all"
  },
  unsubTransactions: null,
  unsubSettings: null
};

function setSyncStatus(label) {
  elements.syncStatus.textContent = label;
}

function validateAuthInputs() {
  const email = elements.authEmail.value.trim();
  const password = elements.authPassword.value;

  if (!email || !password) {
    return { error: "Please enter both email and password." };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  return { value: { email, password } };
}

function validateTransaction(formData) {
  const title = formData.get("title")?.trim() || "";
  const amountValue = formData.get("amount");
  const amount = normalizeAmount(amountValue);
  const type = formData.get("type");
  const category = formData.get("category");
  const date = formData.get("date");
  const recurring = formData.get("recurring") === "on";

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
      date,
      recurring
    }
  };
}

function render() {
  const filteredTransactions = applyFilters(state.transactions, state.filters);
  const summary = calculateSummary(filteredTransactions);
  const categorySpending = getCategorySpending(filteredTransactions, categoriesMap);
  const topCategory = getTopSpendingCategory(state.transactions, categoriesMap);
  const spentThisMonth = getSpentThisMonth(state.transactions);
  const budgetSnapshot = getBudgetSnapshot(state.budget, spentThisMonth);
  const monthOptions = getMonthOptions(state.transactions);
  const monthlySeries = getMonthlyExpenseSeries(filteredTransactions);

  populateMonthFilter(elements.filterMonth, monthOptions);
  elements.filterMonth.value = state.filters.month;

  updateSummary(summary, filteredTransactions.length, { topCategory, spentThisMonth }, {
    balance: elements.balance,
    income: elements.income,
    expense: elements.expense,
    count: elements.count,
    topCategory: elements.topCategory,
    topCategoryValue: elements.topCategoryValue,
    insightMessage: elements.insightMessage,
    spentThisMonth: elements.spentThisMonth
  });

  updateBudget(budgetSnapshot, {
    input: elements.budgetInput,
    percent: elements.budgetPercent,
    spent: elements.budgetSpent,
    remaining: elements.budgetRemaining,
    progress: elements.budgetProgress,
    message: elements.budgetMessage
  });

  renderTransactions(
    filteredTransactions,
    categoriesMap,
    elements.transactionList,
    elements.transactionTemplate
  );

  charts.renderCategoryChart(categorySpending);
  charts.renderTrendChart(monthlySeries);

  const shouldPromptUpgrade = state.mode === "guest" && state.transactions.length >= 3;
  elements.guestBanner.classList.toggle("hidden", !shouldPromptUpgrade);
}

function clearSubscriptions() {
  state.unsubTransactions?.();
  state.unsubSettings?.();
  state.unsubTransactions = null;
  state.unsubSettings = null;
}

function loadLocalData() {
  clearSubscriptions();
  state.mode = "guest";
  state.user = null;
  state.transactions = localStore.getTransactions();
  state.budget = localStore.getBudget();
  setLoadingState(elements.loadingState, false);
  setErrorState(elements.errorState, firebaseReady ? "" : APP_COPY.configMissing);
  setSyncStatus(APP_COPY.guestMode);
  elements.logoutButton.classList.add("hidden");
  elements.openAuthButton.classList.remove("hidden");
  render();
}

function resetForm() {
  elements.transactionForm.reset();
  elements.transactionForm.elements.date.value = todayIso();
  elements.recurringInput.checked = false;
  showMessage(elements.formMessage, "");
}

function exportTransactionsCsv() {
  const headers = ["id", "title", "amount", "type", "category", "date", "recurring"];
  const rows = state.transactions.map((transaction) =>
    [
      escapeCsvValue(transaction.id),
      escapeCsvValue(transaction.title),
      transaction.amount,
      escapeCsvValue(transaction.type),
      escapeCsvValue(transaction.category),
      escapeCsvValue(transaction.date),
      escapeCsvValue(transaction.recurring ? "yes" : "no")
    ].join(",")
  );

  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "pulsebudget-transactions.csv";
  link.click();
  URL.revokeObjectURL(url);
}

async function syncGuestDataToCloud(user) {
  const guestTransactions = localStore.getTransactions();
  const guestBudget = localStore.getBudget();

  if (!guestTransactions.length && !guestBudget) {
    return;
  }

  setSyncStatus(APP_COPY.syncMigrating);

  await Promise.all(
    guestTransactions.map((transaction) => upsertTransaction(user.uid, transaction))
  );

  if (guestBudget) {
    await saveBudgetDoc(user.uid, guestBudget);
  }

  localStore.clearGuestData();
}

function saveToLocal({ transactions = state.transactions, budget = state.budget } = {}) {
  const transactionsSaved = localStore.saveTransactions(transactions);
  const budgetSaved = localStore.saveBudget(budget);

  if (transactionsSaved) {
    state.transactions = localStore.getTransactions();
  }

  if (budgetSaved) {
    state.budget = localStore.getBudget();
  }

  return transactionsSaved && budgetSaved;
}

async function saveToFirebase(userId, { transaction = null, deleteId = null, budget = null } = {}) {
  if (transaction) {
    await addTransactionDoc(userId, transaction);
  }

  if (deleteId) {
    await deleteTransactionDoc(userId, deleteId);
  }

  if (budget !== null) {
    await saveBudgetDoc(userId, budget);
  }
}

async function handleSignUp(event) {
  event.preventDefault();
  const result = validateAuthInputs();
  if (result.error) {
    showMessage(elements.authMessage, result.error, "error");
    return;
  }

  try {
    showMessage(elements.authMessage, "Creating account...");
    await signUpWithEmail(result.value.email, result.value.password);
    showMessage(elements.authMessage, "Account created.", "success");
  } catch (error) {
    showMessage(elements.authMessage, error.message || "Could not create account.", "error");
  }
}

async function handleLogIn() {
  const result = validateAuthInputs();
  if (result.error) {
    showMessage(elements.authMessage, result.error, "error");
    return;
  }

  try {
    showMessage(elements.authMessage, "Logging in...");
    await logInWithEmail(result.value.email, result.value.password);
    showMessage(elements.authMessage, "Logged in.", "success");
  } catch (error) {
    showMessage(elements.authMessage, error.message || "Could not log in.", "error");
  }
}

async function handleLogout() {
  try {
    await logOut();
  } catch (error) {
    setErrorState(elements.errorState, error.message || "Could not log out.");
  }
}

async function loadFirebaseData(user) {
  clearSubscriptions();
  state.user = user;
  state.mode = "cloud";
  state.transactions = [];
  state.budget = 0;
  setLoadingState(elements.loadingState, true);
  setErrorState(elements.errorState, "");
  setSyncStatus(APP_COPY.syncLoading);
  elements.logoutButton.classList.remove("hidden");
  elements.openAuthButton.classList.add("hidden");

  try {
    await syncGuestDataToCloud(user);
  } catch (error) {
    setErrorState(elements.errorState, error.message || "Could not sync guest data.");
  }

  state.unsubTransactions = subscribeToTransactions(
    user.uid,
    (transactions) => {
      state.transactions = transactions;
      setLoadingState(elements.loadingState, false);
      setSyncStatus(APP_COPY.syncReady);
      render();
    },
    (error) => {
      setLoadingState(elements.loadingState, false);
      setErrorState(elements.errorState, error.message || "Failed to sync transactions.");
    }
  );

  state.unsubSettings = subscribeToSettings(
    user.uid,
    (settings) => {
      state.budget = Number(settings.budget) || 0;
      render();
    },
    (error) => {
      setErrorState(elements.errorState, error.message || "Failed to sync settings.");
    }
  );
}

async function addTransaction(transaction) {
  if (state.mode === "cloud" && state.user) {
    await saveToFirebase(state.user.uid, { transaction });
    return true;
  }

  return saveToLocal({
    transactions: [...state.transactions, transaction],
    budget: state.budget
  });
}

async function deleteTransaction(transactionId) {
  if (state.mode === "cloud" && state.user) {
    await saveToFirebase(state.user.uid, { deleteId: transactionId });
    return true;
  }

  const nextTransactions = state.transactions.filter((transaction) => transaction.id !== transactionId);
  return saveToLocal({
    transactions: nextTransactions,
    budget: state.budget
  });
}

async function saveBudget(value) {
  const budget = normalizeAmount(value);

  if (!Number.isFinite(budget) || budget < 0) {
    showMessage(elements.budgetMessage, "Enter a valid budget amount.", "error");
    return false;
  }

  if (budget > 999999999.99) {
    showMessage(elements.budgetMessage, "Budget is too large. Please enter a smaller value.", "error");
    return false;
  }

  if (state.mode === "cloud" && state.user) {
    await saveToFirebase(state.user.uid, { budget });
    return true;
  }

  return saveToLocal({
    transactions: state.transactions,
    budget
  });
}

async function handleTransactionSubmit(event) {
  event.preventDefault();
  const result = validateTransaction(new FormData(elements.transactionForm));

  if (result.error) {
    showMessage(elements.formMessage, result.error, "error");
    return;
  }

  try {
    showMessage(elements.formMessage, "Saving transaction...");
    const didSave = await addTransaction(result.value);

    if (state.mode === "guest" && !didSave) {
      showMessage(elements.formMessage, "Could not save transaction in local storage.", "error");
      return;
    }

    if (state.mode === "guest") {
      state.transactions = localStore.getTransactions();
      render();
    }

    resetForm();
    showMessage(elements.formMessage, "Transaction saved.", "success");
  } catch (error) {
    showMessage(elements.formMessage, error.message || "Could not save transaction.", "error");
  }
}

async function handleDelete(event) {
  const button = event.target.closest(".delete-button");
  if (!button?.dataset.id) {
    return;
  }

  try {
    const didDelete = await deleteTransaction(button.dataset.id);

    if (state.mode === "guest" && !didDelete) {
      showMessage(elements.formMessage, "Could not delete transaction from local storage.", "error");
      return;
    }

    if (state.mode === "guest") {
      state.transactions = localStore.getTransactions();
      render();
    }

    showMessage(elements.formMessage, "Transaction deleted.", "success");
  } catch (error) {
    showMessage(elements.formMessage, error.message || "Could not delete transaction.", "error");
  }
}

async function handleBudgetSubmit(event) {
  event.preventDefault();

  try {
    const didSave = await saveBudget(elements.budgetInput.value || 0);
    if (!didSave) {
      if (state.mode === "guest") {
        showMessage(elements.budgetMessage, "Could not save budget in local storage.", "error");
      }
      return;
    }

    if (state.mode === "guest") {
      state.budget = localStore.getBudget();
      render();
    }

    showMessage(elements.budgetMessage, "Budget saved.", "success");
  } catch (error) {
    showMessage(elements.budgetMessage, error.message || "Could not save budget.", "error");
  }
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
  state.filters = { category: "all", month: "all", type: "all" };
  elements.filterCategory.value = "all";
  elements.filterMonth.value = "all";
  elements.filterType.value = "all";
  render();
}

function toggleAuthPanel(forceOpen) {
  const shouldOpen = typeof forceOpen === "boolean"
    ? forceOpen
    : elements.authPanel.classList.contains("hidden");

  elements.authPanel.classList.toggle("hidden", !shouldOpen);
}

function initAuth() {
  if (!firebaseReady) {
    elements.openAuthButton.disabled = true;
    elements.openAuthButton.textContent = "Login unavailable";
    setErrorState(elements.errorState, APP_COPY.configMissing);
    loadLocalData();
    return;
  }

  watchAuthState((user) => {
    setAuthMode(
      {
        authPanel: elements.authPanel,
        appPanel: elements.appPanel,
        userChip: elements.userChip,
        userEmail: user ? `Cloud account: ${user.email}` : "Guest mode"
      },
      Boolean(user)
    );

    if (!user) {
      elements.userChip.classList.remove("hidden");
      elements.userChip.textContent = "Guest mode";
      loadLocalData();
      return;
    }

    toggleAuthPanel(false);
    loadFirebaseData(user);
  });
}

function init() {
  populateCategorySelect(elements.categorySelect, CATEGORIES);
  populateCategorySelect(elements.filterCategory, CATEGORIES, true);
  elements.transactionForm.elements.date.value = todayIso();
  elements.userChip.classList.remove("hidden");
  elements.userChip.textContent = "Guest mode";
  loadLocalData();

  elements.authForm.addEventListener("submit", handleSignUp);
  elements.loginButton.addEventListener("click", handleLogIn);
  elements.logoutButton.addEventListener("click", handleLogout);
  elements.openAuthButton.addEventListener("click", () => toggleAuthPanel(true));
  elements.closeAuthButton.addEventListener("click", () => toggleAuthPanel(false));
  elements.transactionForm.addEventListener("submit", handleTransactionSubmit);
  elements.resetForm.addEventListener("click", resetForm);
  elements.budgetForm.addEventListener("submit", handleBudgetSubmit);
  elements.filtersForm.addEventListener("change", handleFilterChange);
  elements.resetFilters.addEventListener("click", resetFilters);
  elements.transactionList.addEventListener("click", handleDelete);
  elements.exportCsv.addEventListener("click", exportTransactionsCsv);

  render();
  initAuth();
}

init();
