import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getUserRole } from '../auth/authUtils';
import { useState } from 'react';

function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = localStorage.getItem('access_token');
  const userRole = getUserRole();
  const userName = localStorage.getItem('user_name') || 'User';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/');
  };

  if (!isAuthenticated) return null;

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <div className="bg-slate-900 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between text-xs">
          <div className="text-slate-400">
            An official website of the Government
          </div>
          <div className="hidden sm:flex items-center gap-4 text-slate-400">
            <span>Welcome, <span className="text-white font-medium">{userName}</span></span>
            <span className="text-slate-600">|</span>
            <span className="capitalize">{userRole}</span>
          </div>
        </div>
      </div>

      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3">
          <div className="flex items-center justify-between h-14">
            {/* Logo Section */}
            <Link to="/dashboard" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                </svg>
              </div>
              <div className="hidden sm:block">
                <div className="text-base font-bold text-slate-900 leading-tight">OpenGov</div>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
              <Link
                to="/dashboard"
                className={`px-2 py-1.5 text-xs font-semibold rounded transition-all whitespace-nowrap ${
                  isActive('/dashboard')
                    ? 'bg-blue-700 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                Dashboard
              </Link>

              <Link
                to="/expenditures"
                className={`px-2 py-1.5 text-xs font-semibold rounded transition-all whitespace-nowrap ${
                  isActive('/expenditures')
                    ? 'bg-blue-700 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                Expenditures
              </Link>

              <Link
                to="/feedback"
                className={`px-2 py-1.5 text-xs font-semibold rounded transition-all whitespace-nowrap ${
                  isActive('/feedback')
                    ? 'bg-blue-700 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                Feedback
              </Link>

              <Link
                to="/forum"
                className={`px-2 py-1.5 text-xs font-semibold rounded transition-all whitespace-nowrap ${
                  isActive('/forum')
                    ? 'bg-blue-700 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                Forum
              </Link>

              {(userRole === 'admin' || userRole === 'super_admin') && (
                <Link
                  to="/admin"
                  className={`px-2 py-1.5 text-xs font-semibold rounded transition-all whitespace-nowrap ${
                    isActive('/admin')
                      ? 'bg-blue-700 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Admin
                </Link>
              )}

              {userRole === 'super_admin' && (
                <Link
                  to="/super-admin"
                  className={`px-2 py-1.5 text-xs font-semibold rounded transition-all whitespace-nowrap ${
                    isActive('/super-admin')
                      ? 'bg-blue-700 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Super Admin
                </Link>
              )}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={handleLogout}
                className="px-2.5 py-1.5 bg-slate-700 hover:bg-slate-800 text-white text-xs font-semibold rounded transition-colors whitespace-nowrap"
              >
                Logout
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-1.5 text-slate-700 hover:bg-slate-100 rounded"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-slate-200">
              <div className="flex flex-col gap-2">
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 text-sm font-semibold rounded-lg ${
                    isActive('/dashboard')
                      ? 'bg-blue-700 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Dashboard
                </Link>

                <Link
                  to="/expenditures"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 text-sm font-semibold rounded-lg ${
                    isActive('/expenditures')
                      ? 'bg-blue-700 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Expenditures
                </Link>

                <Link
                  to="/feedback"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 text-sm font-semibold rounded-lg ${
                    isActive('/feedback')
                      ? 'bg-blue-700 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Feedback
                </Link>

                <Link
                  to="/forum"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 text-sm font-semibold rounded-lg ${
                    isActive('/forum')
                      ? 'bg-blue-700 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Forum
                </Link>

                {(userRole === 'admin' || userRole === 'super_admin') && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-3 text-sm font-semibold rounded-lg ${
                      isActive('/admin')
                        ? 'bg-blue-700 text-white'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Admin
                  </Link>
                )}

                {userRole === 'super_admin' && (
                  <Link
                    to="/super-admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-3 text-sm font-semibold rounded-lg ${
                      isActive('/super-admin')
                        ? 'bg-blue-700 text-white'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Super Admin
                  </Link>
                )}

                <div className="px-4 py-3 mt-2 border-t border-slate-200 text-sm text-slate-600">
                  <div className="font-medium text-slate-900">{userName}</div>
                  <div className="text-xs capitalize">{userRole}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}

export default Navigation;
