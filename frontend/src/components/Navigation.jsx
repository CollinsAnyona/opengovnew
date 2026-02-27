import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getUserRole } from '../auth/authUtils';

function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = localStorage.getItem('access_token');
  const userRole = getUserRole();
  const userName = localStorage.getItem('user_name') || 'User';

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/');
  };

  if (!isAuthenticated) return null;

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <div className="bg-slate-900 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between text-xs">
          <div className="text-slate-400">
            An official website of the Government
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Welcome, <span className="text-white font-medium">{userName}</span></span>
            <span className="text-slate-600">|</span>
            <span className="capitalize">{userRole}</span>
          </div>
        </div>
      </div>

      <nav className="bg-white border-b-4 border-blue-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-12 h-20">
              <Link to="/dashboard" className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-blue-700 rounded flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900 leading-tight">OpenGov</div>
                    <div className="text-xs text-slate-600 font-medium">Governance Transparency Portal</div>
                  </div>
                </div>
              </Link>

              <div className="flex items-center h-20 gap-1">
                <Link
                  to="/dashboard"
                  className={`h-full flex items-center px-5 text-sm font-semibold border-b-4 transition-all ${
                    isActive('/dashboard')
                      ? 'border-blue-700 text-blue-700 bg-blue-50'
                      : 'border-transparent text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  Dashboard
                </Link>

                <Link
                  to="/expenditures"
                  className={`h-full flex items-center px-5 text-sm font-semibold border-b-4 transition-all ${
                    isActive('/expenditures')
                      ? 'border-blue-700 text-blue-700 bg-blue-50'
                      : 'border-transparent text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  Expenditures
                </Link>

                <Link
                  to="/feedback"
                  className={`h-full flex items-center px-5 text-sm font-semibold border-b-4 transition-all ${
                    isActive('/feedback')
                      ? 'border-blue-700 text-blue-700 bg-blue-50'
                      : 'border-transparent text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  Feedback
                </Link>

                {userRole === 'admin' && (
                  <Link
                    to="/admin"
                    className={`h-full flex items-center px-5 text-sm font-semibold border-b-4 transition-all ${
                      isActive('/admin')
                        ? 'border-blue-700 text-blue-700 bg-blue-50'
                        : 'border-transparent text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    Admin
                  </Link>
                )}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="px-5 py-2 bg-slate-700 hover:bg-slate-800 text-white text-sm font-semibold rounded transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navigation;
