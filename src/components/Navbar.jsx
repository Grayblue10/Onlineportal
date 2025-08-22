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
    <nav className="fixed top-0 inset-x-0 z-50 shadow-sm border-b border-gray-200 bg-white" style={{backgroundColor: '#ffffff', color: 'black'}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            {showMenuButton && (
              <button
                type="button"
                onClick={onMenuClick}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6 text-black" />
              </button>
            )}
            <Link to="/" className="flex items-center space-x-2">
              <img src={tracLogo} alt="TRAC Logo" className="h-8 w-auto" />
              <span className="text-xl font-bold text-black">GradingSystem</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{backgroundColor: 'var(--deep-blue-light)'}}>
                <User className="w-5 h-5 text-black" />
              </div>
              <div className="text-sm">
                <p className="font-medium text-black">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs" style={{color: 'var(--golden-yellow)'}}>{getRoleName()}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={logout}
                className="p-2 text-black rounded-lg transition-colors"
                style={{'&:hover': {backgroundColor: 'var(--error)', color: 'black'}}}
                onMouseEnter={(e) => {e.target.style.backgroundColor = 'var(--error)'; e.target.style.color = 'black';}}
                onMouseLeave={(e) => {e.target.style.backgroundColor = 'transparent'; e.target.style.color = 'black';}}
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