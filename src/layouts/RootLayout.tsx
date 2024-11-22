import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { pb } from '../lib/pocketbase';
import { UserCircle, LogOut } from 'lucide-react';

export default function RootLayout() {
  const navigate = useNavigate();
  const user = pb.authStore.model;

  const handleLogout = () => {
    pb.authStore.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold text-white">
                LMS
              </Link>
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  to="/courses"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Courses
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              {user ? (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/profile"
                    className="flex items-center text-gray-300 hover:text-white"
                  >
                    <UserCircle className="w-6 h-6 mr-2" />
                    <span>{user.username}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center text-gray-300 hover:text-white"
                  >
                    <LogOut className="w-6 h-6" />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
