export function formatCurrency(value) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2
  }).format(Number(value) || 0);
}

export function formatDate(dateValue) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(dateValue));
}

export function getMonthKey(dateValue) {
  const date = new Date(dateValue);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  return `${year}-${month}`;
}

export function formatMonthKey(monthKey) {
  const [year, month] = monthKey.split("-");
  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric"
  }).format(new Date(Number(year), Number(month) - 1, 1));
}

export function normalizeAmount(value) {
  return Math.round(Number(value) * 100) / 100;
}

export function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}
