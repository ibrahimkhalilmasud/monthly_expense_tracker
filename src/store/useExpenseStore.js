import { create } from 'zustand';
import { storageService } from '../services/storage';
import { getCurrentMonth } from '../utils/formatters';
import { SAMPLE_EXPENSES, SAMPLE_BUDGET } from '../utils/sampleData';

const YEAR_MONTH_LENGTH = 7;

let idCounter = Date.now();
const genId = () => `exp_${++idCounter}_${Math.random().toString(36).slice(2, 8)}`;

// Auto-load sample data on first visit (empty localStorage).
// On subsequent visits, auto-merge any new sample items that are not yet stored.
function initExpenses() {
  const stored = storageService.getExpenses();
  if (stored.length === 0) {
    storageService.saveExpenses(SAMPLE_EXPENSES);
    storageService.saveBudget(SAMPLE_BUDGET);
    return SAMPLE_EXPENSES;
  }
  // Merge new sample items (identified by id) into existing data so that
  // users automatically see newly-added sample entries on reload.
  const storedIds = new Set(stored.map((e) => e.id));
  const newItems = SAMPLE_EXPENSES.filter((e) => !storedIds.has(e.id));
  if (newItems.length > 0) {
    const merged = [...stored, ...newItems];
    storageService.saveExpenses(merged);
    return merged;
  }
  return stored;
}

const initialExpenses = initExpenses();
const currentMonth = getCurrentMonth();
const currentYear = String(new Date().getFullYear());
const availableMonths = [
  ...new Set(initialExpenses.map((e) => e.date?.substring(0, YEAR_MONTH_LENGTH)).filter(Boolean)),
].sort();
const availableYears = [
  ...new Set(initialExpenses.map((e) => e.date?.split('-')[0]).filter(Boolean)),
].sort();
const monthsUpToCurrent = availableMonths.filter((month) => month <= currentMonth);
const yearsUpToCurrent = availableYears.filter((year) => year <= currentYear);
const latestPastMonth = monthsUpToCurrent[monthsUpToCurrent.length - 1];
const latestPastYear = yearsUpToCurrent[yearsUpToCurrent.length - 1];
const latestAvailableMonth = availableMonths[availableMonths.length - 1];
const latestAvailableYear = availableYears[availableYears.length - 1];
const initialMonth = availableMonths.includes(currentMonth)
  ? currentMonth
  : (latestPastMonth || latestAvailableMonth || currentMonth);
const initialYear = availableYears.includes(currentYear)
  ? currentYear
  : (latestPastYear || latestAvailableYear || currentYear);

const useExpenseStore = create((set, get) => ({
  expenses: initialExpenses,
  budget: storageService.getBudget(),
  settings: storageService.getSettings(),
  selectedMonth: initialMonth,
  selectedYear: initialYear,

  setSelectedMonth: (month) => set({ selectedMonth: month }),
  setSelectedYear: (year) => set({ selectedYear: year }),

  addExpense: (data) => {
    const expense = {
      id: genId(),
      ...data,
      createdAt: Date.now(),
    };
    const expenses = [expense, ...get().expenses];
    storageService.saveExpenses(expenses);
    set({ expenses });
  },

  updateExpense: (id, data) => {
    const expenses = get().expenses.map((e) => (e.id === id ? { ...e, ...data } : e));
    storageService.saveExpenses(expenses);
    set({ expenses });
  },

  deleteExpense: (id) => {
    const expenses = get().expenses.filter((e) => e.id !== id);
    storageService.saveExpenses(expenses);
    set({ expenses });
  },

  loadSampleData: () => {
    const existing = get().expenses;
    const existingIds = new Set(existing.map((e) => e.id));
    const newExpenses = SAMPLE_EXPENSES.filter((e) => !existingIds.has(e.id));
    const merged = [...newExpenses, ...existing];
    storageService.saveExpenses(merged);
    storageService.saveBudget(SAMPLE_BUDGET);
    set({ expenses: merged, budget: SAMPLE_BUDGET });
  },

  setBudget: (budget) => {
    storageService.saveBudget(budget);
    set({ budget });
  },

  updateSettings: (settings) => {
    const newSettings = { ...get().settings, ...settings };
    storageService.saveSettings(newSettings);
    set({ settings: newSettings });
  },

  getMonthlyExpenses: () => {
    const { expenses, selectedMonth } = get();
    return expenses.filter((e) => e.date && e.date.startsWith(selectedMonth));
  },

  getMonthlyTotal: () => {
    return get().getMonthlyExpenses().reduce((sum, e) => sum + Number(e.amount), 0);
  },

  getCategoryBreakdown: () => {
    const monthly = get().getMonthlyExpenses();
    const breakdown = {};
    monthly.forEach((e) => {
      breakdown[e.category] = (breakdown[e.category] || 0) + Number(e.amount);
    });
    return breakdown;
  },

  getDailyTrend: () => {
    const monthly = get().getMonthlyExpenses();
    const daily = {};
    monthly.forEach((e) => {
      const day = e.date;
      daily[day] = (daily[day] || 0) + Number(e.amount);
    });
    return Object.entries(daily)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, amount]) => ({ date, amount }));
  },

  // ── Yearly helpers ──────────────────────────────────────────────────────────

  getAvailableYears: () => {
    const { expenses } = get();
    const years = new Set(
      expenses.map((e) => e.date?.split('-')[0]).filter(Boolean)
    );
    return [...years].sort().reverse();
  },

  getYearlyMonthlyData: (year) => {
    const { expenses } = get();
    const yearExpenses = expenses.filter((e) => e.date?.startsWith(year));
    const monthly = {};
    for (let m = 1; m <= 12; m++) {
      const key = `${year}-${String(m).padStart(2, '0')}`;
      monthly[key] = 0;
    }
    yearExpenses.forEach((e) => {
      const month = e.date.substring(0, 7);
      if (month in monthly) monthly[month] += Number(e.amount);
    });
    return Object.entries(monthly).map(([month, amount]) => ({ month, amount }));
  },

  getYearlyCategoryBreakdown: (year) => {
    const { expenses } = get();
    const yearExpenses = expenses.filter((e) => e.date?.startsWith(year));
    const breakdown = {};
    yearExpenses.forEach((e) => {
      breakdown[e.category] = (breakdown[e.category] || 0) + Number(e.amount);
    });
    return breakdown;
  },

  getYearlyTotal: (year) => {
    const { expenses } = get();
    return expenses
      .filter((e) => e.date?.startsWith(year))
      .reduce((sum, e) => sum + Number(e.amount), 0);
  },
}));

export default useExpenseStore;
