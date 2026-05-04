export const CATEGORIES = [
  { id: 'office_rental', label: 'Office Rental', color: '#8b5cf6', icon: '🏢' },
  { id: 'electricity', label: 'Electricity', color: '#f59e0b', icon: '⚡' },
  { id: 'water', label: 'Water Bill', color: '#3b82f6', icon: '💧' },
  { id: 'internet', label: 'Internet', color: '#06b6d4', icon: '📡' },
  { id: 'salary', label: 'Salary', color: '#10b981', icon: '💼' },
  { id: 'office_expenses', label: 'Office Expenses', color: '#f97316', icon: '🖥️' },
  { id: 'advance_payments', label: 'Advance Payments', color: '#ec4899', icon: '💳' },
  { id: 'food', label: 'Food & Dining', color: '#ef4444', icon: '🍔' },
  { id: 'transport', label: 'Transport', color: '#6366f1', icon: '🚗' },
  { id: 'health', label: 'Health', color: '#14b8a6', icon: '💊' },
  { id: 'other', label: 'Other', color: '#6b7280', icon: '📦' },
];

export const getCategoryById = (id) =>
  CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
