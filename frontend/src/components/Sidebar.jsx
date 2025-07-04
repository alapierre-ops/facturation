import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { FiHome, FiUsers, FiFileText, FiLogOut, FiMenu, FiUser, FiShield, FiGlobe, FiMoon, FiSun, FiSettings, FiDollarSign, FiClipboard } from 'react-icons/fi';
import { useState } from 'react';

const Layout = () => {
  const { user, logout } = useAuth();
  const { t, language, currency, toggleLanguage, toggleCurrency } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navigation = [
    { name: t('dashboard'), path: '/dashboard', icon: FiHome },
    { name: t('clients'), path: '/clients', icon: FiUsers },
    { name: t('projects'), path: '/projects', icon: FiFileText },
    { name: t('quotes'), path: '/quotes', icon: FiClipboard },
    { name: t('invoices'), path: '/invoices', icon: FiDollarSign },
    { name: t('profile'), path: '/profile', icon: FiUser },
  ];

  if (user?.role === "admin") {
    navigation.push({ name: t('userManagement'), path: '/admin/users', icon: FiShield });
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="md:hidden flex items-center justify-between h-16 px-4 bg-blue-600">
        <h1 className="text-xl font-bold text-white">ProPulse</h1>
        <button
          className="text-white text-2xl focus:outline-none"
          onClick={() => setDrawerOpen(true)}
        >
          <FiMenu />
        </button>
      </div>
      <div className="hidden md:block fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 shadow-lg z-30">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 px-4 bg-blue-600">
            <h1 className="text-xl font-bold text-white">ProPulse</h1>
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
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FiGlobe className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {language.toUpperCase()}/{currency}
                  </span>
                </div>
                <button
                  onClick={() => {
                    toggleLanguage();
                    toggleCurrency();
                  }}
                  className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
                  title={`Switch to ${language === 'en' ? 'French/Euro' : 'English/Dollar'}`}
                >
                  {language === 'en' ? 'FR/€' : 'EN/$'}
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {isDark ? (
                    <FiSun className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <FiMoon className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                  )}
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {isDark ? t('lightMode') : t('darkMode')}
                  </span>
                </div>
                <button
                  onClick={toggleTheme}
                  className={`px-2 py-1 text-xs rounded ${
                    isDark 
                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:hover:bg-yellow-800' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                  title={isDark ? t('lightMode') : t('darkMode')}
                >
                  {isDark ? '☀️' : '🌙'}
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {user?.fullName || user?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.email}
                </p>
                {user?.role === 'admin' && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">{t('admin')}</p>
                )}
              </div>
              <button
                onClick={logout}
                className="p-2 text-gray-400 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300"
                title={t('logout')}
              >
                <FiLogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="md:ml-64">
        <div className="p-6">
          <Outlet />
        </div>
      </div>
      
      {drawerOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black bg-opacity-40"
            onClick={() => setDrawerOpen(false)}
          ></div>
          <div className="relative w-64 bg-white dark:bg-gray-800 shadow-lg h-full flex flex-col animate-slideInLeft">
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
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => setDrawerOpen(false)}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FiGlobe className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {language.toUpperCase()}/{currency}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      toggleLanguage();
                      toggleCurrency();
                    }}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
                  >
                    {language === 'en' ? 'FR/€' : 'EN/$'}
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {isDark ? (
                      <FiSun className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                    ) : (
                      <FiMoon className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                    )}
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {isDark ? t('lightMode') : t('darkMode')}
                    </span>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className={`px-2 py-1 text-xs rounded ${
                      isDark 
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:hover:bg-yellow-800' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {isDark ? '☀️' : '🌙'}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {user?.fullName || user?.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.email}
                  </p>
                  {user?.role === "admin" && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">{t('admin')}</p>
                  )}
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-gray-400 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300"
                  title={t('logout')}
                >
                  <FiLogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout; 