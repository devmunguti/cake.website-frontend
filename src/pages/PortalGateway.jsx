import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

export default function PortalGateway() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { login, register, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || (user?.role === 'admin' ? '/admin' : '/');

  React.useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, from]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error('Email and password are required.');
      return;
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    try {
      setSubmitting(true);
      if (isLogin) {
        const res = await login({
          email: formData.email.trim(),
          password: formData.password
        });
        if (res.success) {
          toast.success(`Welcome back, ${res.user?.firstName || res.user?.fullName || 'Customer'}!`);
          if (res.user?.role === 'admin') {
            navigate('/admin');
          } else {
            navigate(from);
          }
        }
      } else {
        const res = await register({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          fullName: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          password: formData.password
        });
        if (res.success) {
          toast.success('Account created successfully!');
          navigate('/');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl border border-[#E8DFD3] shadow-xl space-y-8 animate-fadeIn">
        {/* Brand Logo & Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-[#C85A32] text-white flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-2xl">cake</span>
            </div>
          </Link>
          <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#2C2420]">
            {isLogin ? 'Sign In to Your Account' : 'Create Customer Account'}
          </h1>
          <p className="text-xs text-stone-500">
            {isLogin
              ? 'Access your cake orders, saved addresses, and quotes.'
              : 'Join Sweet Delights for faster cake checkout and exclusive offers.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[#FAF7F2] p-1 rounded-2xl border border-[#E8DFD3]">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isLogin ? 'bg-white text-[#C85A32] shadow-sm' : 'text-stone-600 hover:text-[#2C2420]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              !isLogin ? 'bg-white text-[#C85A32] shadow-sm' : 'text-stone-600 hover:text-[#2C2420]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  placeholder="Sarah"
                  className="w-full p-3 rounded-xl border border-[#E8DFD3] text-sm bg-[#FAF7F2] focus:border-[#C85A32] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Mwangi"
                  className="w-full p-3 rounded-xl border border-[#E8DFD3] text-sm bg-[#FAF7F2] focus:border-[#C85A32] focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="customer@example.com"
              className="w-full p-3 rounded-xl border border-[#E8DFD3] text-sm bg-[#FAF7F2] focus:border-[#C85A32] focus:outline-none"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">Phone Number (M-Pesa)</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="0712 345 678"
                className="w-full p-3 rounded-xl border border-[#E8DFD3] text-sm bg-[#FAF7F2] focus:border-[#C85A32] focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full p-3 pr-10 rounded-xl border border-[#E8DFD3] text-sm bg-[#FAF7F2] focus:border-[#C85A32] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <span className="material-symbols-outlined text-lg">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full p-3 rounded-xl border border-[#E8DFD3] text-sm bg-[#FAF7F2] focus:border-[#C85A32] focus:outline-none"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-full bg-[#C85A32] text-white font-bold text-sm hover:bg-[#B04B25] shadow-md transition-all cursor-pointer disabled:opacity-50 mt-2"
          >
            {submitting ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="text-center text-xs text-stone-500 pt-2 border-t border-stone-100">
          <Link to="/" className="text-[#C85A32] font-semibold hover:underline">
            ← Back to Bakery Home
          </Link>
        </div>
      </div>
    </div>
  );
}
