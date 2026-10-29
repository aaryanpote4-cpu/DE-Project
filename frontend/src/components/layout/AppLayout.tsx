import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Topbar from './Topbar';
import QuickDispatchModal from '../QuickDispatchModal';

export default function AppLayout() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-gray-900 font-sans">
      <Topbar onOpenDispatch={() => setIsModalOpen(true)} />
      <main className="flex-1 w-full max-w-7xl mx-auto p-6 lg:p-8">
        <Outlet />
      </main>
      <QuickDispatchModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
