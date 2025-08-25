import { Link } from 'react-router-dom';
import { LogOut, User, Menu } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import tracLogo from '../assets/images/traclogo.png';

const Navbar = ({ showMenuButton = false, onMenuClick }) => {
  const { user, logout, isAdmin, isTeacher, isStudent } = useAuth();

  const getRoleColor = () => {
    if (isAdmin) return 'admin';
    if (isTeacher) return 'teacher';
    if (isStudent) return 'student';
    return 'primary';
  };

  const getRoleName = () => {
    if (isAdmin) return 'Administrator';
    if (isTeacher) return 'Teacher';
    if (isStudent) return 'Student';
    return 'User';
  };

  return (
    <nav className="fixed top-0 inset-x-0 z-50 shadow-sm border-b border-gray-200 bg-white text-black">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {showMenuButton && (
              <button
                type="button"
                onClick={onMenuClick}
                className="p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            )}
            <Link to="/" className="flex items-center space-x-2 min-w-0">
              <img src={tracLogo} alt="TRAC Logo" className="h-10 sm:h-12 w-auto flex-shrink-0" />
              <span className="hidden sm:inline text-lg sm:text-xl font-bold text-black truncate">GradingSystem</span>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-100 text-blue-700">
                <User className="w-5 h-5" />
              </div>
              <div className="leading-tight min-w-0">
                <p className="text-sm sm:text-base font-medium truncate max-w-[7.5rem] sm:max-w-none">{user?.firstName} {user?.lastName}</p>
                <p className="text-[11px] sm:text-xs truncate max-w-[7.5rem] sm:max-w-none text-yellow-600">{getRoleName()}</p>
              </div>
            </div>

            {isStudent && typeof user?.yearLevel !== 'undefined' && (
              <span className="hidden sm:inline-flex items-center px-2 py-1 text-xs rounded-md border border-yellow-300 bg-yellow-50 text-yellow-700">
                Year: Y{user.yearLevel}
              </span>
            )}

            <div className="flex items-center space-x-2">
              <button
                onClick={logout}
                className="p-2 rounded-lg transition-colors hover:bg-red-50 text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;