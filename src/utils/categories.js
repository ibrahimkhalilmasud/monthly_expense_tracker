export const CATEGORIES = [
  { id: 'food', label: 'Food & Dining', color: '#f97316', icon: '🍔' },
  { id: 'transport', label: 'Transport', color: '#3b82f6', icon: '🚗' },
  { id: 'housing', label: 'Housing', color: '#8b5cf6', icon: '🏠' },
  { id: 'entertainment', label: 'Entertainment', color: '#ec4899', icon: '🎬' },
  { id: 'health', label: 'Health', color: '#10b981', icon: '💊' },
  { id: 'shopping', label: 'Shopping', color: '#f59e0b', icon: '🛍️' },
  { id: 'utilities', label: 'Utilities', color: '#6366f1', icon: '⚡' },
  { id: 'other', label: 'Other', color: '#6b7280', icon: '📦' },
];

export const getCategoryById = (id) =>
  CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
