import { useState } from 'react';
import useExpenseStore from '../store/useExpenseStore';
import { formatCurrency } from '../utils/formatters';
import { exportToCSV } from '../utils/csvExport';
import { SAMPLE_EXPENSES } from '../utils/sampleData';

export default function Settings() {
  const budget = useExpenseStore((s) => s.budget);
  const setBudget = useExpenseStore((s) => s.setBudget);
  const settings = useExpenseStore((s) => s.settings);
  const updateSettings = useExpenseStore((s) => s.updateSettings);
  const expenses = useExpenseStore((s) => s.expenses);
  const deleteExpense = useExpenseStore((s) => s.deleteExpense);
  const loadSampleData = useExpenseStore((s) => s.loadSampleData);

  const [budgetInput, setBudgetInput] = useState(String(budget));
  const [saved, setSaved] = useState(false);
  const [sampleLoaded, setSampleLoaded] = useState(false);

  const handleSaveBudget = () => {
    const val = Number(budgetInput);
    if (val > 0) {
      setBudget(val);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleExportCSV = () => {
    exportToCSV(expenses, 'expenses.csv');
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to delete ALL expenses? This cannot be undone.')) {
      expenses.forEach((e) => deleteExpense(e.id));
    }
  };

  const handleLoadSample = () => {
    const existing = new Set(expenses.map((e) => e.id));
    const newCount = SAMPLE_EXPENSES.filter((e) => !existing.has(e.id)).length;
    if (newCount === 0) {
      alert('Sample data is already loaded.');
      return;
    }
    if (window.confirm(`This will add ${newCount} sample expense records from the Office Expenses data. Continue?`)) {
      loadSampleData();
      setSampleLoaded(true);
      setTimeout(() => setSampleLoaded(false), 3000);
    }
  };

  const toggleDark = () => {
    updateSettings({ darkMode: !settings.darkMode });
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h1>

      {/* Budget */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 mb-4">
        <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-1">Monthly Budget</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Set your spending limit for the month</p>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">RM</span>
            <input
              type="number"
              min="1"
              step="50"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
          <button
            onClick={handleSaveBudget}
            className={`px-5 py-3 rounded-xl font-medium text-sm transition-colors ${
              saved
                ? 'bg-green-500 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {saved ? '✓ Saved' : 'Save'}
          </button>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
          Current budget: {formatCurrency(budget)}
        </p>
      </section>

      {/* Appearance */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 mb-4">
        <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-1">Appearance</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Customize the look and feel</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Dark Mode</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Switch to dark theme</p>
          </div>
          <button
            onClick={toggleDark}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              settings.darkMode ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'
            }`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                settings.darkMode ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </section>

      {/* Data */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 mb-4">
        <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-1">Data Management</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{expenses.length} total expenses</p>
        <div className="space-y-2">
          <button
            onClick={handleLoadSample}
            className={`w-full px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              sampleLoaded
                ? 'bg-green-500 text-white'
                : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
            }`}
          >
            {sampleLoaded ? '✓ Sample Data Loaded!' : '📊 Load Sample Data (Office Expenses)'}
          </button>
          <button
            onClick={handleExportCSV}
            disabled={expenses.length === 0}
            className="w-full px-4 py-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-xl text-sm font-medium hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            📥 Export to CSV
          </button>
          <button
            onClick={handleClearAll}
            disabled={expenses.length === 0}
            className="w-full px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            🗑️ Clear All Expenses
          </button>
        </div>
      </section>

      {/* About */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-1">About</h2>
        <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
          <p>Monthly Expense Tracker v1.0.0</p>
          <p>Built with React, Vite, Tailwind CSS &amp; Recharts</p>
          <p>Data is stored locally in your browser.</p>
        </div>
      </section>
    </div>
  );
}
