import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="fixed top-0 left-0 w-full z-50 flex justify-center px-4 pt-6 pointer-events-none">
      <header className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_rgba(0,104,95,0.12)] rounded-[32px] pointer-events-auto w-full max-w-5xl transition-all duration-300">
        <div className="flex justify-between items-center w-full px-6 h-16">
          <Link to="/" className="text-xl font-bold font-['Plus_Jakarta_Sans'] text-[#00685f] tracking-tight">
            CareConnect
          </Link>

          <nav className="hidden md:flex space-x-6 items-center">
            <Link
              to="/"
              className={`font-medium text-sm transition-all duration-300 ${
                location.pathname === '/'
                  ? 'text-[#00685f] bg-[#d3e5f1] px-4 py-1.5 rounded-full'
                  : 'text-[#3d4947] hover:text-[#00685f] hover:bg-[#f0f5f2] px-4 py-1.5 rounded-full'
              }`}
            >
              Home
            </Link>
            <Link
              to="/doctors"
              className={`font-medium text-sm transition-all duration-300 ${
                location.pathname === '/doctors'
                  ? 'text-[#00685f] bg-[#d3e5f1] px-4 py-1.5 rounded-full'
                  : 'text-[#3d4947] hover:text-[#00685f] hover:bg-[#f0f5f2] px-4 py-1.5 rounded-full'
              }`}
            >
              Doctors
            </Link>
            {user?.userType === 'patient' && (
              <Link
                to="/patient-dashboard"
                className={`font-medium text-sm transition-all duration-300 ${
                  location.pathname === '/patient-dashboard'
                    ? 'text-[#00685f] bg-[#d3e5f1] px-4 py-1.5 rounded-full'
                    : 'text-[#3d4947] hover:text-[#00685f] hover:bg-[#f0f5f2] px-4 py-1.5 rounded-full'
                }`}
              >
                My Appointments
              </Link>
            )}
            {user?.userType === 'doctor' && (
              <Link
                to="/doctor-dashboard"
                className={`font-medium text-sm transition-all duration-300 ${
                  location.pathname === '/doctor-dashboard'
                    ? 'text-[#00685f] bg-[#d3e5f1] px-4 py-1.5 rounded-full'
                    : 'text-[#3d4947] hover:text-[#00685f] hover:bg-[#f0f5f2] px-4 py-1.5 rounded-full'
                }`}
              >
                Doctor Portal
              </Link>
            )}
          </nav>

          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="hidden md:inline-block text-sm font-medium text-[#171d1c]">
                  {user.name.split(' ')[0]}
                </span>
                <button
                  onClick={handleLogout}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-[#f0f5f2] text-[#ba1a1a] hover:bg-[#ffdad6] hover:text-[#93000a] transition-colors"
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-semibold text-[#00685f] hover:text-[#008378] transition-colors px-4 py-2"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-[#00685f] text-[#ffffff] px-6 py-2 rounded-full text-sm font-bold hover:bg-[#008378] hover:shadow-[0_4px_12px_rgba(0,104,95,0.3)] hover:-translate-y-0.5 transition-all duration-300"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
    </div>
  );
};


