import { getCategoryById } from '../../utils/categories';

export default function CategoryBadge({ categoryId }) {
  const cat = getCategoryById(categoryId);
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white"
      style={{ backgroundColor: cat.color }}
    >
      <span>{cat.icon}</span>
      <span>{cat.label}</span>
    </span>
  );
}
