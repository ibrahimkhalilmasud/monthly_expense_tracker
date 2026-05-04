# Monthly Expense Tracker

A production-ready, mobile-first monthly expense tracking web application.

## Features

- 📊 **Dashboard** — Monthly overview with charts and budget progress
- 💸 **Expense Tracking** — Add, edit, delete expenses with categories
- 📈 **Analytics** — Spending trends, category breakdowns, daily charts
- ⚙️ **Settings** — Budget management, dark mode, CSV export
- 📱 **Mobile-first** — Optimized for mobile with responsive desktop layout
- 🌙 **Dark Mode** — Full dark theme support
- 💾 **LocalStorage** — Data persists in your browser

## Tech Stack

- React + Vite
- Tailwind CSS v3
- Zustand (state management)
- Recharts (charts)
- React Router DOM v6

## Setup

```bash
git clone <repo>
cd monthly_expense_tracker
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Build

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── layout/       # AppLayout, Sidebar, BottomNav
│   └── ui/           # StatCard, BudgetProgress, ExpenseCard, CategoryBadge
├── modals/           # ExpenseModal
├── pages/            # Dashboard, Expenses, Analytics, Settings
├── services/         # storage.js (LocalStorage abstraction)
├── store/            # useExpenseStore.js (Zustand)
└── utils/            # categories, formatters, csvExport
```

## Responsive Breakpoints

- **Mobile** (< 640px): Single column, bottom nav, FAB button
- **Tablet** (640–1024px): 2-column, content adapts
- **Desktop** (1024px+): Sidebar nav, table views, modal dialogs
