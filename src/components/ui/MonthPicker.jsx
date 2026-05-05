import useExpenseStore from '../../store/useExpenseStore';
import { getMonthLabel } from '../../utils/formatters';

/**
 * A compact month-picker dropdown.
 * Builds a sorted list of all months that have expenses, always including the
 * current calendar month so the user can always go "back to today".
 */
export default function MonthPicker({ className = '' }) {
  const expenses = useExpenseStore((s) => s.expenses);
  const selectedMonth = useExpenseStore((s) => s.selectedMonth);
  const setSelectedMonth = useExpenseStore((s) => s.setSelectedMonth);

  // Collect all months from expense data
  const monthSet = new Set(expenses.map((e) => e.date?.substring(0, 7)).filter(Boolean));
  // Always include the currently selected month (in case there's no data for it)
  monthSet.add(selectedMonth);

  const months = [...monthSet].sort().reverse();

  return (
    <select
      value={selectedMonth}
      onChange={(e) => setSelectedMonth(e.target.value)}
      className={`px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${className}`}
    >
      {months.map((m) => (
        <option key={m} value={m}>
          {getMonthLabel(m)}
        </option>
      ))}
    </select>
  );
}
