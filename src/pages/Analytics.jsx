import useExpenseStore from '../store/useExpenseStore';
import { CATEGORIES } from '../utils/categories';
import { formatCurrency, formatShortDate, getMonthLabel } from '../utils/formatters';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  LineChart, Line,
} from 'recharts';

export default function Analytics() {
  const selectedMonth = useExpenseStore((s) => s.selectedMonth);
  const getMonthlyExpenses = useExpenseStore((s) => s.getMonthlyExpenses);
  const getCategoryBreakdown = useExpenseStore((s) => s.getCategoryBreakdown);
  const getDailyTrend = useExpenseStore((s) => s.getDailyTrend);
  const budget = useExpenseStore((s) => s.budget);

  const monthly = getMonthlyExpenses();
  const breakdown = getCategoryBreakdown();
  const dailyTrend = getDailyTrend();
  const total = monthly.reduce((s, e) => s + Number(e.amount), 0);
  const avg = monthly.length > 0 ? total / monthly.length : 0;
  const maxExpense = monthly.length > 0 ? Math.max(...monthly.map((e) => Number(e.amount))) : 0;

  const barData = CATEGORIES
    .filter((c) => breakdown[c.id])
    .map((c) => ({ name: c.label, amount: breakdown[c.id], color: c.color }));

  const pieData = barData.map((d) => ({ ...d, value: d.amount }));

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{getMonthLabel(selectedMonth)}</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Total', value: formatCurrency(total), icon: '💰' },
          { label: 'Avg/Expense', value: formatCurrency(avg), icon: '📊' },
          { label: 'Largest', value: formatCurrency(maxExpense), icon: '📈' },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{s.label}</div>
            <div className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      {monthly.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-3">📊</div>
          <p>No data for this month</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Bar Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-3">Spending by Category</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" tickFormatter={(v) => `RM${v}`} />
                <Tooltip formatter={(value) => [formatCurrency(value), 'Spent']} />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                  {barData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Daily trend */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-3">Daily Spending Trend</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={dailyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tickFormatter={(d) => formatShortDate(d)} tick={{ fontSize: 10 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" tickFormatter={(v) => `RM${v}`} />
                <Tooltip formatter={(v) => [formatCurrency(v), 'Spent']} labelFormatter={(d) => formatShortDate(d)} />
                <Line type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Category distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-3">Distribution</h2>
            <div className="flex flex-col md:flex-row items-center gap-4">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={80}>
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="w-full space-y-2">
                {barData.map((d) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="text-xs text-gray-600 dark:text-gray-400 flex-1">{d.name}</span>
                    <span className="text-xs font-semibold text-gray-900 dark:text-white">{formatCurrency(d.amount)}</span>
                    <span className="text-xs text-gray-400">({total > 0 ? Math.round((d.amount / total) * 100) : 0}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
