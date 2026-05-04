const EXPENSES_KEY = 'met_expenses';
const BUDGET_KEY = 'met_budget';
const SETTINGS_KEY = 'met_settings';

export const storageService = {
  getExpenses: () => {
    try {
      return JSON.parse(localStorage.getItem(EXPENSES_KEY)) || [];
    } catch { return []; }
  },
  saveExpenses: (expenses) => {
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
  },
  getBudget: () => {
    try {
      return JSON.parse(localStorage.getItem(BUDGET_KEY)) || 2000;
    } catch { return 2000; }
  },
  saveBudget: (budget) => {
    localStorage.setItem(BUDGET_KEY, JSON.stringify(budget));
  },
  getSettings: () => {
    try {
      return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || { darkMode: false };
    } catch { return { darkMode: false }; }
  },
  saveSettings: (settings) => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  },
};
