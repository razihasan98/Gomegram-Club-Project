import React, { useState, useMemo } from 'react';
import { Link, NavLink, Outlet, useNavigate, Navigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calendar,
  CreditCard,
  Image as ImageIcon,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Coins,
  Wallet,
  Map,
  Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useClub } from '../context/ClubContext';
import { useToast } from '../context/ToastContext';

export const AdminLayout: React.FC = () => {
  const { isAuthenticated, isLoading, logout, user } = useAuth();
  const { settings } = useClub();
  const { info } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const allNavItems = useMemo(() => [
    { name: 'Dashboard Overview', path: '/admin/dashboard', icon: <LayoutDashboard className="w-4 h-4" />, roles: ['super_admin'] },
    { name: 'Member Management', path: '/admin/members', icon: <Users className="w-4 h-4" />, roles: ['super_admin'] },
    { name: 'Events', path: '/admin/events', icon: <Calendar className="w-4 h-4" />, roles: ['super_admin'] },
    { name: 'Event Expenses', path: '/admin/expenses', icon: <Wallet className="w-4 h-4" />, roles: ['super_admin', 'expense_manager'] },
    { name: 'Event Fees', path: '/admin/fees', icon: <Coins className="w-4 h-4" />, roles: ['super_admin'] },
    { name: 'Payments & Ledger', path: '/admin/payments', icon: <CreditCard className="w-4 h-4" />, roles: ['super_admin'] },
    { name: 'Gallery Manager', path: '/admin/gallery', icon: <ImageIcon className="w-4 h-4" />, roles: ['super_admin'] },
    { name: 'Our Journey', path: '/admin/journeys', icon: <Map className="w-4 h-4" />, roles: ['super_admin'] },
    { name: 'Financial Reports', path: '/admin/reports', icon: <FileText className="w-4 h-4" />, roles: ['super_admin'] },
    { name: 'User Management', path: '/admin/users', icon: <Shield className="w-4 h-4" />, roles: ['super_admin'] },
    { name: 'Club Settings', path: '/admin/settings', icon: <Settings className="w-4 h-4" />, roles: ['super_admin'] },
    { name: 'Slider Settings', path: '/admin/slider', icon: <ImageIcon className="w-4 h-4" />, roles: ['super_admin'] },
  ], []);

  const navItems = useMemo(() => {
    return allNavItems.filter(item => item.roles.includes(user?.role || 'super_admin'));
  }, [user?.role, allNavItems]);

  React.useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const isAllowed = navItems.some(item => location.pathname.startsWith(item.path));
      if (!isAllowed && navItems.length > 0 && location.pathname !== '/admin') {
        navigate(navItems[0].path, { replace: true });
      }
      if (location.pathname === '/admin/dashboard' && user.role === 'expense_manager') {
          navigate('/admin/expenses', { replace: true });
      }
    }
  }, [location.pathname, isAuthenticated, isLoading, user, navItems, navigate]);

  // Protected Route Check
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }



  const handleLogout = async () => {
    await logout();
    info('Logged out from Admin Console');
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-[#F7F7FB] flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-[#C5CCE0] hover:text-gray-900 dark:hover:text-[#F7F7FB]"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div>
            <h2 className="font-heading font-bold text-sm text-gray-900 dark:text-[#F7F7FB]">{settings.club_name}</h2>
            <p className="text-[10px] text-[#D4AF37]">Admin Console</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 lg:static ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Brand Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#7C3AED] via-[#6366F1] to-[#240F06] p-0.5 shadow-md shadow-[#7C3AED]/20">
                <div className="w-full h-full bg-white dark:bg-black rounded-[14px] flex items-center justify-center font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#6366F1] to-[#F0D675] text-sm">
                  GS
                </div>
              </div>
              <div>
                <h3 className="font-heading font-bold text-sm text-gray-900 dark:text-[#F7F7FB] leading-tight">
                  {settings.club_name}
                </h3>
                <p className="text-[11px] text-[#D4AF37] font-medium">Management Portal</p>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-[#9CA6C1]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="p-4 space-y-1.5 flex-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-[#0F172A] text-white dark:bg-white dark:text-[#0F172A] font-bold shadow-lg shadow-slate-900/20'
                      : 'text-gray-600 dark:text-[#9CA6C1] hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-900'
                  }`
                }
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            ))}
          </div>

          {/* Footer Actions (Sign Out) */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
            <button
              onClick={handleLogout}
              className="w-full py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-rose-500/20"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* 3. Main Console Content Area */}
      <main className="flex-1 min-w-0 bg-white dark:bg-black p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};
