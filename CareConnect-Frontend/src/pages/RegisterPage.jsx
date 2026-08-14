import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doctorService } from '../services/doctorService';
import { User, Stethoscope, ArrowLeft, HeartPulse, Upload, CheckCircle, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageTransition } from '../components/common/PageTransition';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [step, setStep] = useState('type'); // 'type' or 'details'
  const [userType, setUserType] = useState('patient'); // 'patient' or 'doctor'
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    degree: 'MBBS',
    licenseNumber: '',
    specialization: 'General Physician',
    experienceYears: '',
    consultationFee: '500',
    hospitalName: '',
    city: '',
    address: '',
    languages: 'English, Hindi',
    bio: '',
    profilePictureUrl: ''
  });

  const [imagePreview, setImagePreview] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectType = (type) => {
    setUserType(type);
    setStep('details');
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid image type. Please select JPEG, PNG, or WEBP.');
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB.');
      return;
    }

    // Live preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload to server
    try {
      setUploadingImage(true);
      const data = new FormData();
      data.append('file', file);
      const res = await doctorService.uploadPublicImage(data);
      if (res?.data?.url) {
        setFormData(prev => ({ ...prev, profilePictureUrl: res.data.url }));
        toast.success('Profile image uploaded successfully!');
      }
    } catch (err) {
      console.error('Image upload failed:', err);
      toast.error(err.response?.data?.message || 'Failed to upload profile image.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.email) {
      toast.error('Please fill in all required personal information.');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    if (userType === 'doctor') {
      if (!formData.licenseNumber) {
        toast.error('Medical License Number is required.');
        return;
      }
      if (!formData.degree) {
        toast.error('Medical Degree is required.');
        return;
      }
      if (!formData.specialization) {
        toast.error('Specialization is required.');
        return;
      }
      if (!formData.city) {
        toast.error('City is required.');
        return;
      }
      if (formData.experienceYears && parseInt(formData.experienceYears, 10) < 0) {
        toast.error('Experience must be a non-negative number.');
        return;
      }
      if (formData.consultationFee && parseInt(formData.consultationFee, 10) <= 0) {
        toast.error('Consultation fee must be greater than zero.');
        return;
      }
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        mobileNumber: formData.phone,
        password: formData.password,
        userType,
        city: formData.city || undefined,
        address: formData.address || undefined
      };

      if (userType === 'doctor') {
        payload.specialization = formData.specialization;
        payload.degree = formData.degree;
        payload.licenseNumber = formData.licenseNumber;
        payload.experience = formData.experienceYears ? parseInt(formData.experienceYears, 10) : 0;
        payload.fees = formData.consultationFee ? parseInt(formData.consultationFee, 10) : 500;
        payload.workingOn = formData.hospitalName || 'CareConnect Partner Clinic';
        payload.clinicName = formData.hospitalName || 'CareConnect Partner Clinic';
        payload.languages = formData.languages;
        payload.bio = formData.bio;
        payload.profilePictureUrl = formData.profilePictureUrl || undefined;
      }

      const user = await register(payload);
      if (user?.userType === 'doctor') {
        toast.success('Doctor Registration Successful! Welcome to CareConnect.');
        navigate('/doctor-dashboard');
      } else {
        toast.success('Registration Successful!');
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
        {/* Left Panel: Visual Branding */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-[#eaefed] overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80')`
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#00685f]/95 via-[#00685f]/40 to-transparent"></div>

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
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-[#f5faf8] overflow-y-auto max-h-screen">
          <div className="w-full max-w-lg my-auto py-8">
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
                    Create {userType === 'doctor' ? 'Doctor Professional' : 'Patient'} Account
                  </h2>
                  <p className="text-xs text-[#3d4947]">Please fill in your details to complete registration.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Doctor Profile Image Upload Section */}
                  {userType === 'doctor' && (
                    <div className="bg-[#f0f5f2] p-4 rounded-2xl border border-[#eaefed] mb-4">
                      <label className="text-xs font-bold text-[#00685f] block uppercase tracking-wider mb-2">
                        Professional Profile Image
                      </label>
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-2xl bg-white border border-[#bcc9c6] overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
                          {imagePreview ? (
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon size={32} className="text-[#bcc9c6]" />
                          )}
                        </div>
                        <div className="flex-1">
                          <input
                            type="file"
                            accept="image/*"
                            id="profile-image-input"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                          <label
                            htmlFor="profile-image-input"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#00685f] text-[#00685f] hover:bg-[#00685f] hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                          >
                            <Upload size={14} /> {uploadingImage ? 'Uploading...' : 'Choose Image'}
                          </label>
                          <span className="block text-[11px] text-[#6d7a77] mt-1">JPEG, PNG or WEBP (Max 5MB)</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Personal Information */}
                  <div>
                    <label className="text-xs font-semibold text-[#171d1c] block mb-1">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={userType === 'doctor' ? "Dr. Jane Smith" : "Jane Smith"}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-[#bcc9c6] bg-[#ffffff] text-sm text-[#171d1c] focus:border-[#00685f] focus:ring-2 focus:ring-[#d3e5f1] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-[#171d1c] block mb-1">Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="doctor@example.com"
                        required
                        className="w-full px-3 py-2.5 rounded-xl border border-[#bcc9c6] bg-[#ffffff] text-xs text-[#171d1c] focus:border-[#00685f] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#171d1c] block mb-1">Phone Number *</label>
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+91 9876543210"
                        required
                        className="w-full px-3 py-2.5 rounded-xl border border-[#bcc9c6] bg-[#ffffff] text-xs text-[#171d1c] focus:border-[#00685f] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Doctor Professional Information */}
                  {userType === 'doctor' && (
                    <>
                      <div className="pt-2 border-t border-[#eaefed]">
                        <h4 className="text-xs font-bold text-[#00685f] uppercase tracking-wider mb-2">Professional Information</h4>
                        
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="text-xs font-semibold text-[#171d1c] block mb-1">Medical Degree *</label>
                            <input
                              type="text"
                              name="degree"
                              value={formData.degree}
                              onChange={handleChange}
                              placeholder="MBBS, MD, MS"
                              required
                              className="w-full px-3 py-2.5 rounded-xl border border-[#bcc9c6] bg-[#ffffff] text-xs text-[#171d1c] focus:border-[#00685f] focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-[#171d1c] block mb-1">License / Reg. No. *</label>
                            <input
                              type="text"
                              name="licenseNumber"
                              value={formData.licenseNumber}
                              onChange={handleChange}
                              placeholder="MCI-98765"
                              required
                              className="w-full px-3 py-2.5 rounded-xl border border-[#bcc9c6] bg-[#ffffff] text-xs text-[#171d1c] focus:border-[#00685f] focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-3">
                          <div>
                            <label className="text-xs font-semibold text-[#171d1c] block mb-1">Specialization *</label>
                            <select
                              name="specialization"
                              value={formData.specialization}
                              onChange={handleChange}
                              className="w-full px-2 py-2.5 rounded-xl border border-[#bcc9c6] bg-[#ffffff] text-xs text-[#171d1c] focus:border-[#00685f] focus:outline-none"
                            >
                              <option value="Cardiology">Cardiology</option>
                              <option value="Dermatology">Dermatology</option>
                              <option value="General Physician">General Physician</option>
                              <option value="Neurology">Neurology</option>
                              <option value="Pediatrics">Pediatrics</option>
                              <option value="Orthopedics">Orthopedics</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-[#171d1c] block mb-1">Experience (Yrs)</label>
                            <input
                              type="number"
                              name="experienceYears"
                              value={formData.experienceYears}
                              onChange={handleChange}
                              placeholder="8"
                              required
                              className="w-full px-3 py-2.5 rounded-xl border border-[#bcc9c6] bg-[#ffffff] text-xs text-[#171d1c] focus:border-[#00685f] focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-[#171d1c] block mb-1">Fee (₹)</label>
                            <input
                              type="number"
                              name="consultationFee"
                              value={formData.consultationFee}
                              onChange={handleChange}
                              placeholder="500"
                              required
                              className="w-full px-3 py-2.5 rounded-xl border border-[#bcc9c6] bg-[#ffffff] text-xs text-[#171d1c] focus:border-[#00685f] focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="text-xs font-semibold text-[#171d1c] block mb-1">Clinic / Hospital Name *</label>
                            <input
                              type="text"
                              name="hospitalName"
                              value={formData.hospitalName}
                              onChange={handleChange}
                              placeholder="CareConnect Medical Center"
                              required
                              className="w-full px-3 py-2.5 rounded-xl border border-[#bcc9c6] bg-[#ffffff] text-xs text-[#171d1c] focus:border-[#00685f] focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-[#171d1c] block mb-1">City *</label>
                            <input
                              type="text"
                              name="city"
                              value={formData.city}
                              onChange={handleChange}
                              placeholder="Mumbai, Delhi, Bangalore"
                              required
                              className="w-full px-3 py-2.5 rounded-xl border border-[#bcc9c6] bg-[#ffffff] text-xs text-[#171d1c] focus:border-[#00685f] focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="mb-3">
                          <label className="text-xs font-semibold text-[#171d1c] block mb-1">Languages Spoken</label>
                          <input
                            type="text"
                            name="languages"
                            value={formData.languages}
                            onChange={handleChange}
                            placeholder="English, Hindi, Marathi"
                            className="w-full px-3 py-2.5 rounded-xl border border-[#bcc9c6] bg-[#ffffff] text-xs text-[#171d1c] focus:border-[#00685f] focus:outline-none"
                          />
                        </div>

                        <div className="mb-3">
                          <label className="text-xs font-semibold text-[#171d1c] block mb-1">Professional Bio</label>
                          <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            rows="2"
                            placeholder="Brief description of experience and clinical expertise..."
                            className="w-full px-3 py-2.5 rounded-xl border border-[#bcc9c6] bg-[#ffffff] text-xs text-[#171d1c] focus:border-[#00685f] focus:outline-none"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Password Security */}
                  <div className="pt-2 border-t border-[#eaefed] grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-[#171d1c] block mb-1">Password *</label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        required
                        className="w-full px-3 py-2.5 rounded-xl border border-[#bcc9c6] bg-[#ffffff] text-xs text-[#171d1c] focus:border-[#00685f] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#171d1c] block mb-1">Confirm Password *</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        required
                        className="w-full px-3 py-2.5 rounded-xl border border-[#bcc9c6] bg-[#ffffff] text-xs text-[#171d1c] focus:border-[#00685f] focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || uploadingImage}
                    className="w-full bg-[#00685f] hover:bg-[#008378] text-[#ffffff] py-3.5 px-6 rounded-full font-semibold text-sm transition-colors shadow-sm mt-4 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? 'Creating Account...' : 'Complete Doctor Registration'}
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
