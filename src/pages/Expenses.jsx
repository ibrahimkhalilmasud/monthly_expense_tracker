import { useState } from 'react';
import useExpenseStore from '../store/useExpenseStore';
import ExpenseCard from '../components/ui/ExpenseCard';
import CategoryBadge from '../components/ui/CategoryBadge';
import { formatCurrency, formatDate } from '../utils/formatters';
import { getCategoryById } from '../utils/categories';
import ExpenseModal from '../modals/ExpenseModal';

export default function Expenses() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editExpense, setEditExpense] = useState(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const expenses = useExpenseStore((s) => s.expenses);
  const deleteExpense = useExpenseStore((s) => s.deleteExpense);

  const filtered = expenses.filter((e) => {
    const cat = getCategoryById(e.category);
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      cat.label.toLowerCase().includes(q) ||
      (e.note && e.note.toLowerCase().includes(q)) ||
      (e.vendor && e.vendor.toLowerCase().includes(q));
    const matchCategory = filterCategory === 'all' || e.category === filterCategory;
    return matchSearch && matchCategory;
  });

  const handleEdit = (expense) => {
    setEditExpense(expense);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditExpense(null);
  };

  const uniqueCategories = [...new Set(expenses.map((e) => e.category))];

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Expenses</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{filtered.length} of {expenses.length} records</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="hidden lg:flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
        >
          + Add Expense
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Search category, vendor or notes…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Categories</option>
          {uniqueCategories.map((c) => {
            const cat = getCategoryById(c);
            return <option key={c} value={c}>{cat.icon} {cat.label}</option>;
          })}
        </select>
      </div>

      {/* Mobile list */}
      <div className="lg:hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-2">💸</div>
            <p>No expenses found</p>
          </div>
        ) : (
          filtered.map((e) => (
            <ExpenseCard
              key={e.id}
              expense={e}
              onDelete={deleteExpense}
              onEdit={handleEdit}
            />
          ))
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
              <th className="text-left px-5 py-3.5 text-gray-500 dark:text-gray-400 font-medium">Date</th>
              <th className="text-left px-5 py-3.5 text-gray-500 dark:text-gray-400 font-medium">Category</th>
              <th className="text-left px-5 py-3.5 text-gray-500 dark:text-gray-400 font-medium">Vendor</th>
              <th className="text-left px-5 py-3.5 text-gray-500 dark:text-gray-400 font-medium">Amount</th>
              <th className="text-left px-5 py-3.5 text-gray-500 dark:text-gray-400 font-medium">Notes</th>
              <th className="text-left px-5 py-3.5 text-gray-500 dark:text-gray-400 font-medium">Files</th>
              <th className="text-left px-5 py-3.5 text-gray-500 dark:text-gray-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-16 text-gray-400">
                  No expenses found
                </td>
              </tr>
            ) : (
              filtered.map((e) => (
                <tr key={e.id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-5 py-3.5 text-gray-600 dark:text-gray-400 whitespace-nowrap">{formatDate(e.date)}</td>
                  <td className="px-5 py-3.5"><CategoryBadge categoryId={e.category} /></td>
                  <td className="px-5 py-3.5 text-gray-700 dark:text-gray-300 max-w-[140px] truncate">
                    {e.vendor || <span className="text-gray-300 dark:text-gray-600">—</span>}
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-gray-900 dark:text-white whitespace-nowrap">{formatCurrency(e.amount)}</td>
                  <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 max-w-[180px] truncate">
                    {e.note || <span className="text-gray-300 dark:text-gray-600">—</span>}
                  </td>
                  {/* Attachment indicators + click-to-view */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      {e.billCopy ? (
                        <a
                          href={e.billCopy}
                          download={e.billCopyName || 'bill.jpg'}
                          target="_blank"
                          rel="noreferrer"
                          title="View bill copy"
                          className="text-base hover:scale-110 transition-transform"
                        >
                          📄
                        </a>
                      ) : (
                        <span className="text-gray-300 dark:text-gray-700 text-base" aria-label="No bill copy attached">–</span>
                      )}
                      {e.paymentCopy ? (
                        <a
                          href={e.paymentCopy}
                          download={e.paymentCopyName || 'payment.jpg'}
                          target="_blank"
                          rel="noreferrer"
                          title="View payment copy"
                          className="text-base hover:scale-110 transition-transform"
                        >
                          ✅
                        </a>
                      ) : (
                        <span className="text-gray-300 dark:text-gray-700 text-base" aria-label="No payment copy attached">–</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleEdit(e)}
                        className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 text-xs font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteExpense(e.id)}
                        className="text-red-500 hover:text-red-600 text-xs font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile FAB */}
      <button
        onClick={() => setModalOpen(true)}
        className="lg:hidden fixed bottom-20 right-4 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg flex items-center justify-center text-2xl z-40 transition-transform hover:scale-110 active:scale-95"
      >
        +
      </button>

      <ExpenseModal key={editExpense?.id || (modalOpen ? 'new' : 'closed')} isOpen={modalOpen} onClose={handleCloseModal} editExpense={editExpense} />
    </div>
  );
}
