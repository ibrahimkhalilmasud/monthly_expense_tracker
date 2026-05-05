import { useState, useRef } from 'react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { getCategoryById } from '../../utils/categories';

export default function ExpenseCard({ expense, onDelete, onEdit }) {
  const [swipeX, setSwipeX] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const startX = useRef(null);

  const handleTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    if (startX.current === null) return;
    const dx = e.touches[0].clientX - startX.current;
    if (dx < 0) {
      setSwiping(true);
      setSwipeX(Math.max(dx, -80));
    }
  };

  const handleTouchEnd = () => {
    if (swipeX < -40) {
      setSwipeX(-80);
    } else {
      setSwipeX(0);
      setSwiping(false);
    }
    startX.current = null;
  };

  const cat = getCategoryById(expense.category);
  const hasAttachments = expense.billCopy || expense.paymentCopy;

  return (
    <div className="relative overflow-hidden rounded-xl mb-2">
      {/* Delete background */}
      <div className="absolute right-0 top-0 bottom-0 bg-red-500 flex items-center justify-end pr-4 w-20 rounded-r-xl">
        <button
          onClick={() => onDelete(expense.id)}
          className="text-white font-bold text-sm"
        >
          🗑️
        </button>
      </div>
      {/* Card */}
      <div
        className="bg-white dark:bg-gray-800 p-4 border border-gray-100 dark:border-gray-700 rounded-xl cursor-pointer transition-transform"
        style={{ transform: `translateX(${swipeX}px)`, transition: swiping ? 'none' : 'transform 0.3s ease' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => swipeX === 0 && onEdit && onEdit(expense)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
              style={{ backgroundColor: cat.color + '20' }}
            >
              {cat.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-white text-sm">{cat.label}</p>
              {expense.vendor && (
                <p className="text-xs text-indigo-500 dark:text-indigo-400 truncate">{expense.vendor}</p>
              )}
              {expense.note && (
                <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{expense.note}</p>
              )}
              <p className="text-xs text-gray-400 dark:text-gray-500">{formatDate(expense.date)}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-2">
            <span className="font-bold text-gray-900 dark:text-white">
              {formatCurrency(expense.amount)}
            </span>
            {hasAttachments && (
              <div className="flex gap-1">
                {expense.billCopy && <span className="text-xs" title="Bill copy">📄</span>}
                {expense.paymentCopy && <span className="text-xs" title="Payment copy">✅</span>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
