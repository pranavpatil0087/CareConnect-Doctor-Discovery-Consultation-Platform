import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Stethoscope, ArrowLeft, HeartPulse } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageTransition } from '../components/common/PageTransition';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [step, setStep] = useState('type'); // 'type' or 'details'
  const [userType, setUserType] = useState('patient'); // 'patient' or 'doctor'
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    specialityId: '',
    licenseNumber: '',
    experienceYears: '',
    hospitalName: '',
    city: '',
    consultationFee: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectType = (type) => {
    setUserType(type);
    setStep('details');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        userType
      };

      const user = await register(payload);
      if (user?.userType === 'doctor') {
        toast.success('Registration successful! Welcome Doctor.');
        navigate('/doctor-dashboard');
      } else {
        toast.success('Registration successful!');
        navigate('/patient-dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
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
            backgroundImage: `url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80')`
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#00685f]/95 via-[#00685f]/40 to-transparent"></div>

        {/* Content */}
        <div className="relative z-10 p-12 flex flex-col justify-end h-full w-full">
          <div className="bg-white/80 backdrop-blur-md p-8 rounded-[24px] shadow-[0_10px_32px_rgba(15,23,42,0.1)] border border-white/40 max-w-lg">
            <h1 className="text-3xl font-bold font-['Plus_Jakarta_Sans'] text-[#00685f] mb-4">
              Empowering Healthcare Connection
            </h1>
            <p className="text-base text-[#3d4947] leading-relaxed">
              CareConnect bridges the gap between patients and specialists, ensuring secure, timely, and empathetic medical consultations.
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

      {/* Right Panel: Authentication Flows */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-[#f5faf8]">
        <div className="w-full max-w-md">
          {/* Mobile Brand Header */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <HeartPulse size={28} className="text-[#00685f]" />
            <span className="text-2xl font-bold font-['Plus_Jakarta_Sans'] text-[#00685f]">
              CareConnect
            </span>
          </div>

          {step === 'type' ? (
            <div>
              <Link
                to="/login"
                className="mb-6 inline-flex items-center text-xs font-semibold text-[#6d7a77] hover:text-[#171d1c] transition-colors"
              >
                <ArrowLeft size={16} className="mr-1" /> Back to login
              </Link>

              <div className="mb-8">
                <h2 className="text-3xl font-bold font-['Plus_Jakarta_Sans'] text-[#171d1c] mb-2">
                  Join CareConnect
                </h2>
                <p className="text-sm text-[#3d4947]">Select your account type to continue.</p>
              </div>

              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => handleSelectType('patient')}
                  className="w-full text-left p-6 border border-[#bcc9c6]/40 rounded-[24px] bg-[#ffffff] hover:border-[#00685f] hover:bg-[#f0f5f2] transition-all group flex items-center gap-4 shadow-sm"
                >
                  <div className="w-12 h-12 rounded-full bg-[#d3e5f1] flex items-center justify-center text-[#00685f] group-hover:bg-[#00685f] group-hover:text-[#ffffff] transition-colors shrink-0">
                    <User size={24} />
                  </div>
                  <div>
                    <div className="text-lg font-semibold font-['Plus_Jakarta_Sans'] text-[#171d1c]">
                      I'm a Patient
                    </div>
                    <div className="text-xs text-[#3d4947]">
                      Find doctors, book appointments, view records.
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectType('doctor')}
                  className="w-full text-left p-6 border border-[#bcc9c6]/40 rounded-[24px] bg-[#ffffff] hover:border-[#00685f] hover:bg-[#f0f5f2] transition-all group flex items-center gap-4 shadow-sm"
                >
                  <div className="w-12 h-12 rounded-full bg-[#d3e5f1] flex items-center justify-center text-[#00685f] group-hover:bg-[#00685f] group-hover:text-[#ffffff] transition-colors shrink-0">
                    <Stethoscope size={24} />
                  </div>
                  <div>
                    <div className="text-lg font-semibold font-['Plus_Jakarta_Sans'] text-[#171d1c]">
                      I'm a Doctor
                    </div>
                    <div className="text-xs text-[#3d4947]">
                      Manage schedule, consult patients, access history.
                    </div>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <div>
              <button
                type="button"
                onClick={() => setStep('type')}
                className="mb-6 inline-flex items-center text-xs font-semibold text-[#6d7a77] hover:text-[#171d1c] transition-colors"
              >
                <ArrowLeft size={16} className="mr-1" /> Change account type
              </button>

              <div className="mb-6">
                <h2 className="text-2xl font-bold font-['Plus_Jakarta_Sans'] text-[#171d1c] mb-1">
                  Create {userType === 'doctor' ? 'Doctor' : 'Patient'} Account
                </h2>
                <p className="text-xs text-[#3d4947]">Please fill in your details to register.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[#171d1c] block mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Dr. John Doe or Jane Smith"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-[#6d7a77] bg-[#ffffff] text-sm text-[#171d1c] focus:border-[#00685f] focus:ring-2 focus:ring-[#d3e5f1] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#171d1c] block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-[#6d7a77] bg-[#ffffff] text-sm text-[#171d1c] focus:border-[#00685f] focus:ring-2 focus:ring-[#d3e5f1] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#171d1c] block mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 234 567 890"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-[#6d7a77] bg-[#ffffff] text-sm text-[#171d1c] focus:border-[#00685f] focus:ring-2 focus:ring-[#d3e5f1] focus:outline-none"
                  />
                </div>

                {userType === 'doctor' && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-[#171d1c] block mb-1">
                          License No.
                        </label>
                        <input
                          type="text"
                          name="licenseNumber"
                          value={formData.licenseNumber}
                          onChange={handleChange}
                          placeholder="MD-12345"
                          required
                          className="w-full px-3 py-2.5 rounded-xl border border-[#6d7a77] bg-[#ffffff] text-xs text-[#171d1c] focus:border-[#00685f] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-[#171d1c] block mb-1">
                          Experience (Yrs)
                        </label>
                        <input
                          type="number"
                          name="experienceYears"
                          value={formData.experienceYears}
                          onChange={handleChange}
                          placeholder="8"
                          required
                          className="w-full px-3 py-2.5 rounded-xl border border-[#6d7a77] bg-[#ffffff] text-xs text-[#171d1c] focus:border-[#00685f] focus:outline-none"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#171d1c] block mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                      className="w-full px-3 py-2.5 rounded-xl border border-[#6d7a77] bg-[#ffffff] text-xs text-[#171d1c] focus:border-[#00685f] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#171d1c] block mb-1">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                      className="w-full px-3 py-2.5 rounded-xl border border-[#6d7a77] bg-[#ffffff] text-xs text-[#171d1c] focus:border-[#00685f] focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#00685f] hover:bg-[#008378] text-[#ffffff] py-3 px-6 rounded-full font-semibold text-sm transition-colors shadow-sm mt-4 disabled:opacity-50"
                >
                  {loading ? 'Creating Account...' : 'Complete Registration'}
                </button>
              </form>
            </div>
          )}
        </div>
        </div>
      </div>
    </PageTransition>
  );
};
