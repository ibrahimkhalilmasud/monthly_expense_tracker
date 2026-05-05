import { useState } from 'react';
import useExpenseStore from '../store/useExpenseStore';
import { CATEGORIES } from '../utils/categories';
import { formatCurrency, formatShortDate, getMonthLabel, getMonthShortLabel } from '../utils/formatters';
import MonthPicker from '../components/ui/MonthPicker';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  LineChart, Line,
} from 'recharts';

export default function Analytics() {
  const [view, setView] = useState('monthly'); // 'monthly' | 'yearly'

  // ── Monthly state ────────────────────────────────────────────────────────────
  const selectedMonth = useExpenseStore((s) => s.selectedMonth);
  const getMonthlyExpenses = useExpenseStore((s) => s.getMonthlyExpenses);
  const getCategoryBreakdown = useExpenseStore((s) => s.getCategoryBreakdown);
  const getDailyTrend = useExpenseStore((s) => s.getDailyTrend);
  const budget = useExpenseStore((s) => s.budget);

  // ── Yearly state ─────────────────────────────────────────────────────────────
  const selectedYear = useExpenseStore((s) => s.selectedYear);
  const setSelectedYear = useExpenseStore((s) => s.setSelectedYear);
  const getAvailableYears = useExpenseStore((s) => s.getAvailableYears);
  const getYearlyMonthlyData = useExpenseStore((s) => s.getYearlyMonthlyData);
  const getYearlyCategoryBreakdown = useExpenseStore((s) => s.getYearlyCategoryBreakdown);
  const getYearlyTotal = useExpenseStore((s) => s.getYearlyTotal);

  // ── Monthly data ─────────────────────────────────────────────────────────────
  const monthly = getMonthlyExpenses();
  const breakdown = getCategoryBreakdown();
  const dailyTrend = getDailyTrend();
  const mTotal = monthly.reduce((s, e) => s + Number(e.amount), 0);
  const mAvg = monthly.length > 0 ? mTotal / monthly.length : 0;
  const mMax = monthly.length > 0 ? Math.max(...monthly.map((e) => Number(e.amount))) : 0;
  const mBarData = CATEGORIES.filter((c) => breakdown[c.id])
    .map((c) => ({ name: c.label, amount: breakdown[c.id], color: c.color }));
  const mPieData = mBarData.map((d) => ({ ...d, value: d.amount }));

  // ── Yearly data ──────────────────────────────────────────────────────────────
  const availableYears = getAvailableYears();
  const yMonthlyData = getYearlyMonthlyData(selectedYear).map((d) => ({
    ...d,
    label: getMonthShortLabel(d.month),
  }));
  const yCatBreakdown = getYearlyCategoryBreakdown(selectedYear);
  const yTotal = getYearlyTotal(selectedYear);
  const yCatData = CATEGORIES.filter((c) => yCatBreakdown[c.id])
    .map((c) => ({ name: c.label, amount: yCatBreakdown[c.id], color: c.color, value: yCatBreakdown[c.id] }));
  const yTransactions = useExpenseStore((s) =>
    s.expenses.filter((e) => e.date?.startsWith(selectedYear))
  );
  const yAvg = yTransactions.length > 0 ? yTotal / yTransactions.length : 0;
  const yMax = yTransactions.length > 0 ? Math.max(...yTransactions.map((e) => Number(e.amount))) : 0;

  const tabCls = (t) =>
    `px-5 py-2 rounded-xl text-sm font-medium transition-colors ${
      view === t
        ? 'bg-indigo-600 text-white shadow'
        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
    }`;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header + tab toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex gap-2">
            <button className={tabCls('monthly')} onClick={() => setView('monthly')}>
              📅 Monthly
            </button>
            <button className={tabCls('yearly')} onClick={() => setView('yearly')}>
              📆 Yearly
            </button>
          </div>
          {/* Selectors */}
          {view === 'monthly' && <MonthPicker className="lg:hidden" />}
          {view === 'yearly' && availableYears.length > 0 && (
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {availableYears.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* ── MONTHLY VIEW ──────────────────────────────────────────────────────── */}
      {view === 'monthly' && (
        <>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{getMonthLabel(selectedMonth)}</p>
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Total', value: formatCurrency(mTotal), icon: '💰' },
              { label: 'Avg/Expense', value: formatCurrency(mAvg), icon: '📊' },
              { label: 'Largest', value: formatCurrency(mMax), icon: '📈' },
            ].map((s) => (
              <div key={s.label} className="bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{s.label}</div>
                <div className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">{s.value}</div>
              </div>
            ))}
          </div>

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
                  <BarChart data={mBarData} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                    <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" tickFormatter={(v) => `RM${v}`} />
                    <Tooltip formatter={(value) => [formatCurrency(value), 'Spent']} />
                    <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                      {mBarData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
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

              {/* Distribution */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-3">Distribution</h2>
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={mPieData} dataKey="value" cx="50%" cy="50%" outerRadius={80}>
                        {mPieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip formatter={(v) => formatCurrency(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="w-full space-y-2">
                    {mBarData.map((d) => (
                      <div key={d.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                        <span className="text-xs text-gray-600 dark:text-gray-400 flex-1">{d.name}</span>
                        <span className="text-xs font-semibold text-gray-900 dark:text-white">{formatCurrency(d.amount)}</span>
                        <span className="text-xs text-gray-400">({mTotal > 0 ? Math.round((d.amount / mTotal) * 100) : 0}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* vs Budget */}
              {budget > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                  <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-3">vs Monthly Budget</h2>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${mTotal > budget ? 'bg-red-500' : 'bg-indigo-500'}`}
                        style={{ width: `${Math.min((mTotal / budget) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                      {Math.round((mTotal / budget) * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Spent: {formatCurrency(mTotal)}</span>
                    <span>Budget: {formatCurrency(budget)}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ── YEARLY VIEW ───────────────────────────────────────────────────────── */}
      {view === 'yearly' && (
        <>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Overview for {selectedYear}</p>

          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Total', value: formatCurrency(yTotal), icon: '💰' },
              { label: 'Avg/Expense', value: formatCurrency(yAvg), icon: '📊' },
              { label: 'Largest', value: formatCurrency(yMax), icon: '📈' },
            ].map((s) => (
              <div key={s.label} className="bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{s.label}</div>
                <div className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">{s.value}</div>
              </div>
            ))}
          </div>

          {yTransactions.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <div className="text-5xl mb-3">📆</div>
              <p>No data for {selectedYear}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Monthly spending bar chart */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-3">
                  Monthly Spending — {selectedYear}
                </h2>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={yMonthlyData} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                    <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" tickFormatter={(v) => `RM${v}`} />
                    <Tooltip
                      formatter={(v) => [formatCurrency(v), 'Spent']}
                      labelFormatter={(l) => l}
                    />
                    <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Monthly detail table */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                  <h2 className="text-base font-semibold text-gray-800 dark:text-white">Monthly Breakdown</h2>
                </div>
                <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                  {yMonthlyData.filter((d) => d.amount > 0).map((d) => (
                    <div key={d.month} className="flex items-center justify-between px-4 py-3">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{getMonthLabel(d.month)}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{ width: `${yTotal > 0 ? Math.min((d.amount / yTotal) * 100 * 3, 100) : 0}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white w-28 text-right">
                          {formatCurrency(d.amount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category breakdown */}
              {yCatData.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                  <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-3">
                    Category Distribution — {selectedYear}
                  </h2>
                  <div className="flex flex-col md:flex-row items-center gap-4">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={yCatData} dataKey="value" cx="50%" cy="50%" outerRadius={80}>
                          {yCatData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Pie>
                        <Tooltip formatter={(v) => formatCurrency(v)} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="w-full space-y-2">
                      {yCatData.map((d) => (
                        <div key={d.name} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                          <span className="text-xs text-gray-600 dark:text-gray-400 flex-1">{d.name}</span>
                          <span className="text-xs font-semibold text-gray-900 dark:text-white">{formatCurrency(d.amount)}</span>
                          <span className="text-xs text-gray-400">({yTotal > 0 ? Math.round((d.amount / yTotal) * 100) : 0}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
