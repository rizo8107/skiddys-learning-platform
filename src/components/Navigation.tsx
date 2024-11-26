import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { logout, pb, isAdmin, getCurrentUser } from '../lib/pocketbase';
import { Logo } from './Logo';
import { UserCircle, Settings, LogOut } from 'lucide-react';

export function Navigation() {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const user = pb.authStore.model;
  const currentUser = getCurrentUser();
  const isAdminUser = isAdmin();
  
  console.log('Current user:', currentUser);
  console.log('User role:', currentUser?.role);
  console.log('Is admin?', isAdminUser);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        dropdownRef.current && 
        buttonRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsProfileOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) {
    return (
      <nav className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/">
                  <Logo />
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <Link
                to="/login"
                className="text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium 
                         hover:bg-gray-700/50 transition-colors duration-200"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700/50 relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/">
                <Logo />
              </Link>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
              <Link
                to="/courses"
                className="text-gray-300 hover:text-white px-3 py-2 rounded-lg text-sm font-medium
                         hover:bg-gray-700/50 transition-colors duration-200"
              >
                Courses
              </Link>
              {isAdminUser && (
                <Link
                  to="/settings"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-lg text-sm font-medium
                           hover:bg-gray-700/50 transition-colors duration-200"
                >
                  Settings
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center">
            <div className="relative">
              <button
                ref={buttonRef}
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                aria-expanded={isProfileOpen}
                aria-haspopup="true"
                aria-label="User menu"
                className="flex items-center text-gray-300 hover:text-white p-2 rounded-lg
                         hover:bg-gray-700/50 transition-colors duration-200"
              >
                <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              </button>

              {isProfileOpen && (
                <div 
                  ref={dropdownRef}
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="user-menu"
                  className="absolute right-0 mt-2 w-48 py-2 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-50"
                >
                  <Link
                    to="/profile"
                    role="menuitem"
                    className="flex items-center px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50
                             transition-colors duration-200"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <UserCircle className="w-4 h-4 mr-2" />
                    Profile
                  </Link>
                  <Link
                    to="/support"
                    role="menuitem"
                    className="flex items-center px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50
                             transition-colors duration-200"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Support
                  </Link>
                  <button
                    role="menuitem"
                    onClick={() => {
                      setIsProfileOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50
                             transition-colors duration-200"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
