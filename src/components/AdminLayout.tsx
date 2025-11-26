import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserButton, useUser } from '@clerk/clerk-react';
import { Trophy, LayoutDashboard, Users, ClipboardCheck, Settings, Home, Menu, X } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/groups', icon: Users, label: 'Groups' },
    { path: '/admin/checkin', icon: ClipboardCheck, label: 'Check-In' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-20 lg:pb-0">
      {/* Top Navigation */}
      <nav className="bg-blue-900 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14 lg:h-16">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 lg:gap-3 hover:opacity-80 transition-opacity"
            >
              <Trophy size={28} className="lg:w-8 lg:h-8" />
              <div className="text-left">
                <h1 className="font-bold text-base lg:text-lg">Tournament Admin</h1>
                <p className="text-[10px] lg:text-xs text-blue-200 hidden sm:block">Edward A.P. Muna II Memorial</p>
              </div>
            </button>
            
            <div className="flex items-center gap-2 lg:gap-4">
              <button
                onClick={() => navigate('/')}
                className="hidden lg:flex items-center gap-1 text-sm text-blue-200 hover:text-white transition-colors"
              >
                <Home size={16} />
                Home
              </button>
              {user && (
                <span className="hidden lg:inline text-sm text-blue-200 max-w-[150px] truncate">
                  {user.firstName || user.emailAddresses[0]?.emailAddress}
                </span>
              )}
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8 lg:w-9 lg:h-9",
                  },
                }}
              />
              
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-1.5 rounded-lg hover:bg-blue-800 transition-colors"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-blue-800 border-t border-blue-700 animate-fade-in">
            <div className="container mx-auto px-4 py-3 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigate(item.path)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-900 text-white'
                        : 'text-blue-100 hover:bg-blue-700'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
              <button
                onClick={() => handleNavigate('/')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-blue-100 hover:bg-blue-700 transition-colors"
              >
                <Home size={20} />
                <span className="font-medium">Home</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      <div className="container mx-auto px-3 lg:px-4 py-4 lg:py-6">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Desktop Sidebar - Hidden on mobile */}
          <aside className="hidden lg:block lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md p-4 space-y-2 sticky top-24">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-900 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation - Fixed at bottom */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="flex justify-around items-center h-16 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-lg transition-colors ${
                  isActive
                    ? 'text-blue-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-[10px] mt-0.5 ${isActive ? 'font-semibold' : 'font-medium'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
