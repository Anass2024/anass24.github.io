export function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value || 0);
}

export function formatDate(dateValue) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
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
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric"
  }).format(new Date(Number(year), Number(month) - 1, 1));
}

export function isSameMonth(dateValue, referenceDate) {
  const date = new Date(dateValue);
  return (
    date.getFullYear() === referenceDate.getFullYear() &&
    date.getMonth() === referenceDate.getMonth()
  );
}

export function getLastMonth(referenceDate) {
  return new Date(referenceDate.getFullYear(), referenceDate.getMonth() - 1, 1);
}

export function normalizeAmount(amount) {
  return Math.round(Number(amount) * 100) / 100;
}

export function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
