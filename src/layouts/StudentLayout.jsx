import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { BookOpen, Award, User, GraduationCap } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const StudentLayout = () => {
  const location = useLocation();
  const { user } = useAuth();
  // Sidebar open state across all breakpoints
  const [mobileOpen, setMobileOpen] = useState(true);
  
  const sidebarItems = [
    { name: 'My Grades', href: '/student/grades', icon: Award },
    { name: 'Subjects', href: '/student/subjects', icon: BookOpen },
    { name: 'Profile', href: '/student/profile', icon: User }
  ];

  const isActive = (href) => {
    if (href === '/student') {
      return location.pathname === '/student' || location.pathname === '/student/';
    }
    return location.pathname.startsWith(href);
  };

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
              <h2 className="text-xl font-bold mb-2 text-yellow-700">
                Student Portal
              </h2>
              <div className="w-12 h-1 rounded-full bg-yellow-500"></div>
              {typeof user?.yearLevel !== 'undefined' && (
                <div className="mt-3 inline-flex items-center gap-1 text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 px-2 py-1 rounded-md">
                  <GraduationCap className="w-3 h-3" /> Year: Y{user.yearLevel}
                </div>
              )}
            </div>
            <nav className="space-y-2">
              {sidebarItems.map((item) => {
                const itemIsActive = isActive(item.href);
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                      itemIsActive
                        ? 'bg-yellow-500 text-gray-900 border-yellow-500 shadow-md focus-visible:ring-yellow-500'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-yellow-50 hover:text-yellow-700 hover:border-yellow-200 hover:shadow-md focus-visible:ring-yellow-500'
                    }`}
                  >
                    <div className={`p-2 rounded-lg transition-colors duration-200 ${
                      itemIsActive ? 'bg-white/30' : 'group-hover:bg-yellow-100'
                    }`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <span className="font-medium truncate">{item.name}</span>
                    {itemIsActive && (
                      <div className="absolute right-0 top-0 bottom-0 w-1 rounded-l-full bg-blue-600"></div>
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

export default StudentLayout;