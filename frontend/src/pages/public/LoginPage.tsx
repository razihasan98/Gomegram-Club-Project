import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useClub } from '../../context/ClubContext';
import { useToast } from '../../context/ToastContext';
import { ThemeToggle } from '../../components/ThemeToggle';

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated, isLoading, user } = useAuth();
  const { settings } = useClub();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect to dashboard
  React.useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (user.role === 'expense_manager') {
        navigate('/admin/expenses', { replace: true });
      } else {
        navigate('/admin/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      error('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const loggedInUser = res.data.user;
      login(res.data.token, loggedInUser);
      success('Login successful! Redirecting to Admin Dashboard...');
      if (loggedInUser.role === 'expense_manager') {
        navigate('/admin/expenses', { replace: true });
      } else {
        navigate('/admin/dashboard', { replace: true });
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Invalid credentials. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center px-4 py-12 dark:text-[#F7F7FB]">
      <div className="w-full max-w-md space-y-6">
        {/* Login Box */}
        <div className="p-8 rounded-3xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-4 right-4 z-10">
            <ThemeToggle />
          </div>
          <div className="text-center space-y-2">
            <h2 className="font-heading font-extrabold text-2xl text-gray-900 dark:text-[#F7F7FB] tracking-tight mb-1">
              Club Admin Portal
            </h2>
            <p className="text-xs font-medium text-gray-500 dark:text-[#9CA6C1] tracking-wide">
              {settings.club_name}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-[#C5CCE0] mb-1">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-500 dark:text-[#9CA6C1] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="off"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-[#F7F7FB] placeholder-gray-400 focus:outline-none focus:border-[#7C3AED] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-[#C5CCE0] mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 dark:text-[#9CA6C1] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-[#F7F7FB] placeholder-gray-400 focus:outline-none focus:border-[#7C3AED] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-[#9CA6C1] hover:text-[#D4AF37] transition-colors p-1"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-slate-700 hover:bg-slate-800 text-white dark:bg-slate-300 dark:hover:bg-slate-200 dark:text-slate-900 shadow-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 !mt-6"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Back to Website Button with Arrow Sign */}
        <div className="text-center pt-2">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-black hover:bg-slate-800 hover:text-white hover:border-transparent dark:hover:bg-slate-200 dark:hover:text-slate-900 dark:bg-[#0D1224] text-xs font-semibold text-gray-600 dark:text-[#C5CCE0] border border-gray-200 dark:border-gray-800 shadow-lg transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Website</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
