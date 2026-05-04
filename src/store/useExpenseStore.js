import { create } from 'zustand';
import { storageService } from '../services/storage';
import { getCurrentMonth } from '../utils/formatters';
import { SAMPLE_EXPENSES, SAMPLE_BUDGET } from '../utils/sampleData';

let idCounter = Date.now();
const genId = () => `exp_${++idCounter}_${Math.random().toString(36).slice(2, 8)}`;

const useExpenseStore = create((set, get) => ({
  expenses: storageService.getExpenses(),
  budget: storageService.getBudget(),
  settings: storageService.getSettings(),
  selectedMonth: getCurrentMonth(),

  setSelectedMonth: (month) => set({ selectedMonth: month }),

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
}));

export default useExpenseStore;
