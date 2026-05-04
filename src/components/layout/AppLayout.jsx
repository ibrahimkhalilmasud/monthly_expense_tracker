import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import { useEffect } from 'react';
import useExpenseStore from '../../store/useExpenseStore';

export default function AppLayout() {
  const settings = useExpenseStore((s) => s.settings);

  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <div className="lg:ml-64">
        <main className="pb-20 lg:pb-8 min-h-screen">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
