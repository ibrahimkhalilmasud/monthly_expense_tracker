import { getCategoryById } from './categories';
import { formatDate } from './formatters';

export const exportToCSV = (expenses, filename = 'expenses.csv') => {
  const headers = ['Date', 'Category', 'Amount', 'Notes'];
  const rows = expenses.map((e) => [
    formatDate(e.date),
    getCategoryById(e.category).label,
    e.amount,
    e.note || '',
  ]);
  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
