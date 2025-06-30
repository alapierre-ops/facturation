import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiHome, FiUsers, FiFileText, FiLogOut, FiMenu, FiUser, FiShield } from 'react-icons/fi';
import { useState } from 'react';

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', path: '/dashboard', icon: FiHome },
    { name: 'Clients', path: '/clients', icon: FiUsers },
    { name: 'Projects', path: '/projects', icon: FiFileText },
    { name: 'Profile', path: '/profile', icon: FiUser }
  ];

  // Add admin navigation if user is admin
  if (user?.role === 'admin') {
    navigation.push({ name: 'User Management', path: '/admin/users', icon: FiShield });
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile header */}
      <div className="md:hidden flex items-center justify-between h-16 px-4 bg-blue-600">
        <h1 className="text-xl font-bold text-white">ProPulse</h1>
        <button
          className="text-white text-2xl focus:outline-none"
          onClick={() => setDrawerOpen(true)}
        >
          <FiMenu />
        </button>
      </div>
      {/* Sidebar for desktop */}
      <div className="hidden md:block fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-30">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 bg-blue-600">
            <h1 className="text-xl font-bold text-white">ProPulse</h1>
          </div>
          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          {/* User section */}
          <div className="p-4 border-t">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{user?.fullName || user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
                {user?.role === 'admin' && (
                  <p className="text-xs text-blue-600 font-medium">Admin</p>
                )}
              </div>
              <button
                onClick={logout}
                className="p-2 text-gray-400 hover:text-gray-500"
                title="Déconnexion"
              >
                <FiLogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Sidebar drawer for mobile */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 flex">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-40"
            onClick={() => setDrawerOpen(false)}
          ></div>
          {/* Drawer */}
          <div className="relative w-64 bg-white shadow-lg h-full flex flex-col animate-slideInLeft">
            <div className="flex items-center justify-between h-16 px-4 bg-blue-600">
              <h1 className="text-xl font-bold text-white">ProPulse</h1>
              <button
                className="text-white text-2xl focus:outline-none"
                onClick={() => setDrawerOpen(false)}
              >
                &times;
              </button>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                    onClick={() => setDrawerOpen(false)}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{user?.fullName || user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                  {user?.role === 'admin' && (
                    <p className="text-xs text-blue-600 font-medium">Admin</p>
                  )}
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-gray-400 hover:text-gray-500"
                  title="Déconnexion"
                >
                  <FiLogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Main content */}
      <div className="md:pl-64">
        <main className="p-4 sm:p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout; 