import { formatCurrency } from '../../utils/formatters';

export default function BudgetProgress({ spent, budget }) {
  const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const remaining = budget - spent;
  const color =
    pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-green-500';
  const textColor =
    pct >= 90 ? 'text-red-600 dark:text-red-400' : pct >= 70 ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Monthly Budget</span>
        <span className={`text-sm font-bold ${textColor}`}>{Math.round(pct)}%</span>
      </div>
      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 mb-3">
        <div
          className={`${color} h-3 rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>Spent: <strong className="text-gray-800 dark:text-gray-200">{formatCurrency(spent)}</strong></span>
        <span className={remaining < 0 ? 'text-red-500' : ''}>
          {remaining >= 0 ? `Remaining: ` : `Over by: `}
          <strong className={remaining >= 0 ? 'text-gray-800 dark:text-gray-200' : 'text-red-600'}>
            {formatCurrency(Math.abs(remaining))}
          </strong>
        </span>
      </div>
    </div>
  );
}
