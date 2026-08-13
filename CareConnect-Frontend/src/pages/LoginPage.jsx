import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HeartPulse, Lock, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageTransition } from '../components/common/PageTransition';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await login(formData);
      if (user?.userType === 'doctor') {
        toast.success('Welcome back, Doctor!');
        navigate('/doctor-dashboard');
      } else {
        toast.success('Login successful!');
        navigate('/patient-dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="w-full min-h-screen flex bg-[#f5faf8]">
        {/* Left Panel: Visual Branding (Hidden on Mobile) */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-[#eaefed] overflow-hidden">
          <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1638202993928-7267aad84c31?auto=format&fit=crop&w=1200&q=80')`
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#00685f]/95 via-[#00685f]/40 to-transparent"></div>

        {/* Content */}
        <div className="relative z-10 p-12 flex flex-col justify-end h-full w-full">
          <div className="bg-white/80 backdrop-blur-md p-8 rounded-[24px] shadow-[0_10px_32px_rgba(15,23,42,0.1)] border border-white/40 max-w-lg">
            <h1 className="text-3xl font-bold font-['Plus_Jakarta_Sans'] text-[#00685f] mb-4">
              Welcome back to CareConnect
            </h1>
            <p className="text-base text-[#3d4947] leading-relaxed">
              Log in to access your dashboard, manage appointments, and connect with healthcare professionals seamlessly.
            </p>
          </div>
        </div>

        {/* Brand Logo Floating */}
        <div className="absolute top-12 left-12 z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#ffffff] rounded-xl flex items-center justify-center shadow-sm text-[#00685f]">
            <HeartPulse size={24} />
          </div>
          <span className="text-2xl font-bold font-['Plus_Jakarta_Sans'] text-[#ffffff]">
            CareConnect
          </span>
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-[#f5faf8]">
        <div className="w-full max-w-md">
          {/* Mobile Brand Header */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-10">
            <HeartPulse size={28} className="text-[#00685f]" />
            <span className="text-2xl font-bold font-['Plus_Jakarta_Sans'] text-[#00685f]">
              CareConnect
            </span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold font-['Plus_Jakarta_Sans'] text-[#171d1c] mb-2">
              Sign In
            </h2>
            <p className="text-sm text-[#3d4947]">Enter your email and password to access your account.</p>
          </div>
          
          {/* Quick Demo Credentials */}
          <div className="mb-6 flex gap-3">
            <button 
              type="button"
              onClick={() => setFormData({ email: 'doctor@demo.com', password: 'demo123' })}
              className="flex-1 bg-[#d3e5f1] text-[#00685f] py-2 rounded-xl text-xs font-bold hover:bg-[#c0daea] transition-colors border border-[#bcc9c6]/30"
            >
              Load Demo Doctor
            </button>
            <button 
              type="button"
              onClick={() => setFormData({ email: 'patient@demo.com', password: 'demo123' })}
              className="flex-1 bg-[#f0f5f2] text-[#171d1c] py-2 rounded-xl text-xs font-bold hover:bg-[#eaefed] transition-colors border border-[#bcc9c6]/30"
            >
              Load Demo Patient
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-semibold text-[#171d1c] block mb-1.5 uppercase tracking-wide">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6d7a77]">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#bcc9c6] bg-[#ffffff] text-sm text-[#171d1c] focus:border-[#00685f] focus:ring-2 focus:ring-[#d3e5f1] focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#171d1c] block uppercase tracking-wide">
                  Password
                </label>
                <Link to="#" className="text-xs font-semibold text-[#00685f] hover:text-[#008378] transition-colors">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6d7a77]">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#bcc9c6] bg-[#ffffff] text-sm text-[#171d1c] focus:border-[#00685f] focus:ring-2 focus:ring-[#d3e5f1] focus:outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00685f] hover:bg-[#008378] text-[#ffffff] py-3.5 px-6 rounded-full font-semibold text-sm transition-colors shadow-sm mt-2 disabled:opacity-70 flex justify-center items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-[#3d4947]">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-[#00685f] hover:text-[#008378] transition-colors">
                Create an account
              </Link>
            </p>
          </div>
        </div>
        </div>
      </div>
    </PageTransition>
  );
};
