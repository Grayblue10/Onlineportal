import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { BarChart3, Users, UserCheck } from 'lucide-react';

const TeacherLayout = () => {
  const location = useLocation();
  // Sidebar open state (now used for all breakpoints)
  const [mobileOpen, setMobileOpen] = useState(true);
  
  const sidebarItems = [
    { name: 'Dashboard', href: '/teacher', icon: BarChart3 },
    { name: 'Enrolled Students', href: '/teacher/enrolled-students', icon: UserCheck },
    { name: 'My Classes', href: '/teacher/classes', icon: Users }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <Navbar showMenuButton onMenuClick={() => setMobileOpen((prev) => !prev)} />
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
      )}
      <div className="relative">
        <aside className={`w-64 sidebar-primary fixed top-16 left-0 h-[calc(100vh-4rem)] overflow-y-auto shadow-lg bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-4 md:p-6 pt-6 md:pt-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-2 text-emerald-700">
                Teacher Portal
              </h2>
              <div className="w-12 h-1 rounded-full bg-emerald-600"></div>
            </div>
            <nav className="space-y-2">
              {sidebarItems.map((item) => {
                const isActive = location.pathname === item.href || 
                  (item.href === '/teacher' && location.pathname === '/teacher/dashboard');
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                      isActive
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md focus-visible:ring-emerald-500'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 hover:shadow-md focus-visible:ring-emerald-500'
                    }`}
                  >
                    <div className={`p-2 rounded-lg transition-colors duration-200 ${
                      isActive ? 'bg-white/20' : 'group-hover:bg-green-100'
                    }`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <span className="font-medium truncate">{item.name}</span>
                    {isActive && (
                      <div className="absolute right-0 top-0 bottom-0 w-1 rounded-l-full bg-yellow-400"></div>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>
        <main className={`p-4 md:p-6 transition-all duration-300 ${mobileOpen ? 'md:ml-64' : 'md:ml-0'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TeacherLayout;