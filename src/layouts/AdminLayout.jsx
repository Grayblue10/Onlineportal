import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Users, BarChart3, Settings, Shield, GraduationCap, UserPlus, UserCheck, BookOpen } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button, Modal } from '../components/ui';

const AdminLayout = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [rolesOpen, setRolesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const sidebarItems = [
    { name: 'Dashboard', href: '/admin', icon: BarChart3 },
    { name: 'Teachers', href: '/admin/teachers', icon: GraduationCap },
    { name: 'Student Enrollment', href: '/admin/enrollment', icon: UserPlus },
    { name: 'Course Enrollment', href: '/admin/program-enrollment', icon: BookOpen },
    { name: 'Teacher Assignment', href: '/admin/assignment', icon: UserCheck },
    { name: 'System Settings', href: '/admin/settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <Navbar showMenuButton onMenuClick={() => setMobileOpen(true)} />
      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <div className="flex">
        <aside className={`w-64 sidebar-primary fixed top-16 h-[calc(100vh-4rem)] overflow-y-auto shadow-lg bg-white border-r border-gray-200 z-40 transform transition-transform duration-300 md:translate-x-0 md:static md:h-auto md:top-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <div className="p-4 md:p-6 pt-6 md:pt-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-2 text-blue-700">
                Admin Panel
              </h2>
              <div className="w-12 h-1 rounded-full bg-blue-600"></div>
            </div>
            <nav className="space-y-2">
              {sidebarItems.map((item) => {
                const isActive = location.pathname === item.href || 
                  (item.href === '/admin' && location.pathname === '/admin/dashboard');

                // Render System Settings as a dropdown
                if (item.name === 'System Settings') {
                  return (
                    <div key={item.name} className="space-y-1">
                      <button
                        type="button"
                        onClick={() => setSettingsOpen((v) => !v)}
                        className={`w-full text-left group relative flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                          isActive || settingsOpen
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md focus-visible:ring-blue-500'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 hover:shadow-md focus-visible:ring-blue-500'
                        }`}
                      >
                        <div className={`p-2 rounded-lg transition-colors duration-200 ${
                          isActive || settingsOpen ? 'bg-white/20' : 'group-hover:bg-blue-100'
                        }`}>
                          <item.icon className="w-5 h-5"/>
                        </div>
                        <span className="font-medium truncate">{item.name}</span>
                        <span className="ml-auto text-xs opacity-80">{settingsOpen ? 'Hide' : 'Show'}</span>
                      </button>

                      {settingsOpen && (
                        <div className="ml-4 pl-2 border-l border-blue-100 space-y-1">
                          <button
                            onClick={() => setRolesOpen(true)}
                            className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                          >
                            Roles & Permissions
                          </button>
                          <div className="h-px bg-gray-200 my-2" />
                          <button
                            onClick={() => setAboutOpen(true)}
                            className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                          >
                            About System
                          </button>
                          <button
                            onClick={logout}
                            className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            Logout
                          </button>
                        </div>
                      )}
                    </div>
                  );
                }

                // Default item rendering
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                      isActive
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md focus-visible:ring-blue-500'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 hover:shadow-md focus-visible:ring-blue-500'
                    }`}
                  >
                    <div className={`p-2 rounded-lg transition-colors duration-200 ${
                      isActive ? 'bg-white/20' : 'group-hover:bg-blue-100'
                    }`}>
                      <item.icon className="w-5 h-5"/>
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
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>

      {/* About System Modal */}
      <Modal
        isOpen={aboutOpen}
        onClose={() => setAboutOpen(false)}
        title="About System"
      >
        <div className="space-y-2">
          <p className="text-gray-700"><span className="font-medium">Application:</span> University Grading System</p>
          <p className="text-gray-700"><span className="font-medium">Version:</span> 1.0.0</p>
          <p className="text-gray-700"><span className="font-medium">Description:</span> A platform for managing subjects, enrollments, and grades for students and teachers.</p>
          <div className="pt-3 flex justify-end">
            <Button variant="outline" onClick={() => setAboutOpen(false)}>Close</Button>
          </div>
        </div>
      </Modal>

      {/* Roles & Permissions Modal */}
      <Modal
        isOpen={rolesOpen}
        onClose={() => setRolesOpen(false)}
        title="Roles & Permissions"
      >
        <div className="space-y-4">
          <p className="text-gray-700">Manage system roles and their permissions. This is a simplified placeholder UI; we can wire it to backend endpoints later.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card p-4">
              <h3 className="font-semibold mb-2">Roles</h3>
              <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                <li>Administrator</li>
                <li>Teacher</li>
                <li>Student</li>
              </ul>
            </div>
            <div className="card p-4">
              <h3 className="font-semibold mb-2">Permissions</h3>
              <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                <li>Manage Users</li>
                <li>Manage Subjects</li>
                <li>View Audit Logs</li>
                <li>Configure Grading</li>
              </ul>
            </div>
          </div>
          <div className="pt-2 flex justify-end">
            <Button variant="outline" onClick={() => setRolesOpen(false)}>Close</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminLayout;