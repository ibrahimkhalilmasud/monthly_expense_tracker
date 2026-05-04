import { useState, useEffect } from 'react';
import { CATEGORIES } from '../utils/categories';
import useExpenseStore from '../store/useExpenseStore';

const defaultForm = {
  amount: '',
  category: 'office_rental',
  date: new Date().toISOString().split('T')[0],
  note: '',
};

export default function ExpenseModal({ isOpen, onClose, editExpense }) {
  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState('');
  const addExpense = useExpenseStore((s) => s.addExpense);
  const updateExpense = useExpenseStore((s) => s.updateExpense);

  useEffect(() => {
    if (editExpense) {
      setForm({
        amount: String(editExpense.amount),
        category: editExpense.category,
        date: editExpense.date,
        note: editExpense.note || '',
      });
    } else {
      setForm(defaultForm);
    }
    setError('');
  }, [editExpense, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    const data = {
      amount: Number(form.amount),
      category: form.category,
      date: form.date,
      note: form.note,
    };
    if (editExpense) {
      updateExpense(editExpense.id, data);
    } else {
      addExpense(data);
    }
    onClose();
  };

  const inputClass =
    'w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm';

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50 lg:flex lg:items-center lg:justify-center"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        {/* Panel - full screen on mobile, modal on desktop */}
        <div className="fixed inset-0 lg:relative lg:inset-auto bg-white dark:bg-gray-800 lg:rounded-2xl lg:w-full lg:max-w-md lg:shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {editExpense ? 'Edit Expense' : 'Add Expense'}
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              ✕
            </button>
          </div>
          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-3 rounded-xl">
                {error}
              </div>
            )}
            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Amount *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">RM</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="0.00"
                  className={`${inputClass} pl-12`}
                  autoFocus
                  required
                />
              </div>
            </div>
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Category
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setForm({ ...form, category: cat.id })}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                      form.category === cat.id
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                        : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span className="truncate">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Date
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className={inputClass}
                required
              />
            </div>
            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Notes (optional)
              </label>
              <textarea
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                placeholder="Add a note..."
                rows={2}
                className={`${inputClass} resize-none`}
              />
            </div>
            <div className="pt-2 pb-safe">
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 rounded-xl transition-colors"
              >
                {editExpense ? 'Update Expense' : 'Add Expense'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
