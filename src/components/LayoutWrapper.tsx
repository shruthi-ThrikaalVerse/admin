import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import NotificationToast from './NotificationToast';

const LayoutWrapper: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Sidebar isOpen={sidebarOpen} setOpen={setSidebarOpen} />
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <div className="lg:ml-64 flex flex-col min-h-screen">
        <Header setOpen={setSidebarOpen} />
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto invisible-scrollbar">
          {children}
        </main>
      </div>
      <NotificationToast />
    </div>
  );
};

export default LayoutWrapper;
