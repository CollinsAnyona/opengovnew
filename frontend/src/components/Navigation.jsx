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
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/');
  };

  if (!isAuthenticated) return null;

  const isActive = (path) => location.pathname === path;
  const isAdmin = userRole === 'admin' || userRole === 'super_admin';

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo Section */}
            <div className="flex items-center gap-4">
              {isAdmin && (
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}
              <Link to="/dashboard" className="flex items-center gap-2">
                <div className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                  </svg>
                </div>
                <div>
                  <div className="text-xl font-bold text-slate-900">OpenGov</div>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links - Only for Citizens */}
            {!isAdmin && (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/dashboard" className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${isActive('/dashboard') ? 'bg-blue-700 text-white' : 'text-slate-700 hover:bg-slate-100'}`}>Dashboard</Link>
                <Link to="/expenditures" className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${isActive('/expenditures') ? 'bg-blue-700 text-white' : 'text-slate-700 hover:bg-slate-100'}`}>Expenditures</Link>
                <Link to="/feedback" className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${isActive('/feedback') ? 'bg-blue-700 text-white' : 'text-slate-700 hover:bg-slate-100'}`}>Feedback</Link>
                <Link to="/forum" className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${isActive('/forum') ? 'bg-blue-700 text-white' : 'text-slate-700 hover:bg-slate-100'}`}>Forum</Link>
              </div>
            )}

            {/* Right Section */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-sm font-semibold text-slate-900">{userName}</div>
                <span className="text-slate-300">|</span>
                <div className="text-xs text-slate-500 capitalize">{userRole}</div>
              </div>
              <button onClick={handleLogout} className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg transition-colors">Logout</button>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-slate-200">
              <div className="flex flex-col gap-2">
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className={`px-4 py-3 text-sm font-semibold rounded-lg ${isActive('/dashboard') ? 'bg-blue-700 text-white' : 'text-slate-700 hover:bg-slate-100'}`}>Dashboard</Link>
                <Link to="/expenditures" onClick={() => setMobileMenuOpen(false)} className={`px-4 py-3 text-sm font-semibold rounded-lg ${isActive('/expenditures') ? 'bg-blue-700 text-white' : 'text-slate-700 hover:bg-slate-100'}`}>Expenditures</Link>
                <Link to="/feedback" onClick={() => setMobileMenuOpen(false)} className={`px-4 py-3 text-sm font-semibold rounded-lg ${isActive('/feedback') ? 'bg-blue-700 text-white' : 'text-slate-700 hover:bg-slate-100'}`}>Feedback</Link>
                <Link to="/forum" onClick={() => setMobileMenuOpen(false)} className={`px-4 py-3 text-sm font-semibold rounded-lg ${isActive('/forum') ? 'bg-blue-700 text-white' : 'text-slate-700 hover:bg-slate-100'}`}>Forum</Link>
                {(userRole === 'admin' || userRole === 'super_admin') && (
                  <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className={`px-4 py-3 text-sm font-semibold rounded-lg ${isActive('/admin') ? 'bg-blue-700 text-white' : 'text-slate-700 hover:bg-slate-100'}`}>Admin</Link>
                )}
                {userRole === 'super_admin' && (
                  <Link to="/super-admin" onClick={() => setMobileMenuOpen(false)} className={`px-4 py-3 text-sm font-semibold rounded-lg ${isActive('/super-admin') ? 'bg-blue-700 text-white' : 'text-slate-700 hover:bg-slate-100'}`}>Super Admin</Link>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Sidebar for Admins */}
      {isAdmin && sidebarOpen && (
        <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-slate-800 shadow-xl z-40 overflow-y-auto">
          <div className="p-4">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Citizen Views</div>
            <Link to="/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all ${isActive('/dashboard') ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              <span className="text-sm font-semibold">Dashboard</span>
            </Link>
            <Link to="/expenditures" className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all ${isActive('/expenditures') ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span className="text-sm font-semibold">Expenditures</span>
            </Link>
            <Link to="/feedback" className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all ${isActive('/feedback') ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
              <span className="text-sm font-semibold">Feedback</span>
            </Link>
            <Link to="/forum" className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-4 transition-all ${isActive('/forum') ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
              <span className="text-sm font-semibold">Forum</span>
            </Link>

            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 mt-6">Admin Tools</div>
            {(userRole === 'admin' || userRole === 'super_admin') && (
              <Link to="/admin" className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all ${isActive('/admin') ? 'bg-purple-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                <span className="text-sm font-semibold">Admin Panel</span>
              </Link>
            )}
            {userRole === 'super_admin' && (
              <Link to="/super-admin" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive('/super-admin') ? 'bg-purple-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span className="text-sm font-semibold">Super Admin</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Navigation;
