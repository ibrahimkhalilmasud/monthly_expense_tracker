import { useState, lazy, Suspense } from 'react';
import useExpenseStore from '../store/useExpenseStore';
import StatCard from '../components/ui/StatCard';
import BudgetProgress from '../components/ui/BudgetProgress';
import { formatCurrency, formatShortDate, getMonthLabel } from '../utils/formatters';
import { CATEGORIES, getCategoryById } from '../utils/categories';
import ExpenseModal from '../modals/ExpenseModal';

const PieChart = lazy(() => import('recharts').then((m) => ({ default: m.PieChart })));
const Pie = lazy(() => import('recharts').then((m) => ({ default: m.Pie })));
const Cell = lazy(() => import('recharts').then((m) => ({ default: m.Cell })));
const Tooltip = lazy(() => import('recharts').then((m) => ({ default: m.Tooltip })));
const ResponsiveContainer = lazy(() => import('recharts').then((m) => ({ default: m.ResponsiveContainer })));
const LineChart = lazy(() => import('recharts').then((m) => ({ default: m.LineChart })));
const Line = lazy(() => import('recharts').then((m) => ({ default: m.Line })));
const XAxis = lazy(() => import('recharts').then((m) => ({ default: m.XAxis })));
const YAxis = lazy(() => import('recharts').then((m) => ({ default: m.YAxis })));
const CartesianGrid = lazy(() => import('recharts').then((m) => ({ default: m.CartesianGrid })));

function ChartLoading() {
  return <div className="flex items-center justify-center h-48 text-gray-400">Loading chart...</div>;
}

export default function Dashboard() {
  const [modalOpen, setModalOpen] = useState(false);
  const budget = useExpenseStore((s) => s.budget);
  const selectedMonth = useExpenseStore((s) => s.selectedMonth);
  const getMonthlyTotal = useExpenseStore((s) => s.getMonthlyTotal);
  const getCategoryBreakdown = useExpenseStore((s) => s.getCategoryBreakdown);
  const getDailyTrend = useExpenseStore((s) => s.getDailyTrend);
  const getMonthlyExpenses = useExpenseStore((s) => s.getMonthlyExpenses);

  const total = getMonthlyTotal();
  const remaining = budget - total;
  const breakdown = getCategoryBreakdown();
  const dailyTrend = getDailyTrend();
  const recentExpenses = getMonthlyExpenses().slice(0, 5);

  const pieData = CATEGORIES
    .filter((c) => breakdown[c.id])
    .map((c) => ({ name: c.label, value: breakdown[c.id], color: c.color, id: c.id }));

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{getMonthLabel(selectedMonth)}</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="hidden lg:flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
        >
          + Add Expense
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard
          title="Total Spent"
          value={formatCurrency(total)}
          subtitle={getMonthLabel(selectedMonth)}
          icon="💸"
          color="indigo"
        />
        <StatCard
          title="Remaining"
          value={formatCurrency(Math.abs(remaining))}
          subtitle={remaining < 0 ? 'Over budget!' : 'Available'}
          icon={remaining < 0 ? '⚠️' : '✅'}
          color={remaining < 0 ? 'red' : 'green'}
        />
        <StatCard
          title="Budget"
          value={formatCurrency(budget)}
          subtitle="Monthly limit"
          icon="🎯"
          color="amber"
        />
        <StatCard
          title="Transactions"
          value={getMonthlyExpenses().length}
          subtitle="This month"
          icon="📝"
          color="indigo"
        />
      </div>

      {/* Budget progress */}
      <div className="mb-6">
        <BudgetProgress spent={total} budget={budget} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Pie chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-3">Category Breakdown</h2>
          {pieData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No expenses this month</div>
          ) : (
            <Suspense fallback={<ChartLoading />}>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                    {pieData.map((entry) => (
                      <Cell key={entry.id} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-1 mt-2">
                {pieData.map((entry) => (
                  <div key={entry.id} className="flex items-center gap-1.5 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                    <span className="text-gray-600 dark:text-gray-400 truncate">{entry.name}</span>
                    <span className="ml-auto text-gray-800 dark:text-gray-200 font-medium">{formatCurrency(entry.value)}</span>
                  </div>
                ))}
              </div>
            </Suspense>
          )}
        </div>

        {/* Line chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-3">Daily Spending</h2>
          {dailyTrend.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No expenses this month</div>
          ) : (
            <Suspense fallback={<ChartLoading />}>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(d) => formatShortDate(d)}
                    tick={{ fontSize: 10 }}
                    stroke="#9ca3af"
                  />
                  <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" tickFormatter={(v) => `RM${v}`} />
                  <Tooltip formatter={(value) => [formatCurrency(value), 'Spent']} labelFormatter={(d) => formatShortDate(d)} />
                  <Line type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </Suspense>
          )}
        </div>
      </div>

      {/* Recent expenses */}
      {recentExpenses.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-3">Recent Expenses</h2>
          <div className="space-y-2">
            {recentExpenses.map((e) => {
              const cat = getCategoryById(e.category);
              return (
                <div key={e.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{cat.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{cat.label}</p>
                      <p className="text-xs text-gray-400">{formatShortDate(e.date)}</p>
                    </div>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(e.amount)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mobile FAB */}
      <button
        onClick={() => setModalOpen(true)}
        className="lg:hidden fixed bottom-20 right-4 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg flex items-center justify-center text-2xl z-40 transition-transform hover:scale-110 active:scale-95"
      >
        +
      </button>

      <ExpenseModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
