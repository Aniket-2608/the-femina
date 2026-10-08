import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/index.js';
import {
  closeAuthModal,
  setAuthModalTab,
  setCredentials,
  setUnverifiedCredentials,
  clearPostAuthRedirect,
} from '../../store/slices/authSlice.js';
import { addToast } from '../../store/slices/uiSlice.js';
import {
  useLoginMutation,
  useRegisterMutation,
  useVerifyEmailOtpMutation,
  useVerifyPhoneOtpMutation,
  useResendOtpMutation,
} from '../../store/api/apiSlice.js';
import { Button } from '../common/Button.js';
import { X, Mail, Phone, Lock, User as UserIcon, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthModalOpen, authModalTab, unverifiedEmail, unverifiedPhone, postAuthRedirectUrl } =
    useSelector((state: RootState) => state.auth);

  // Form States
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [regForm, setRegForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [emailOtp, setEmailOtp] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // API Mutations
  const [loginMutation, { isLoading: isLoginLoading }] = useLoginMutation();
  const [registerMutation, { isLoading: isRegisterLoading }] = useRegisterMutation();
  const [verifyEmailMutation, { isLoading: isEmailVerifying }] = useVerifyEmailOtpMutation();
  const [verifyPhoneMutation, { isLoading: isPhoneVerifying }] = useVerifyPhoneOtpMutation();
  const [resendOtpMutation, { isLoading: isResendLoading }] = useResendOtpMutation();

  const handlePostAuthSuccess = (userData: any, tokens: any) => {
    dispatch(
      setCredentials({
        user: userData,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      })
    );
    dispatch(closeAuthModal());
    dispatch(
      addToast({
        type: 'success',
        message: `Welcome back, ${userData.firstName}! Your session is active.`,
      })
    );

    if (postAuthRedirectUrl) {
      navigate(postAuthRedirectUrl);
      dispatch(clearPostAuthRedirect());
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      const res = await loginMutation(loginForm).unwrap();
      if (res.success) {
        handlePostAuthSuccess(res.data.user, res.data.tokens);
      }
    } catch (err: any) {
      setErrorMessage(err?.data?.message || 'Invalid email or password.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (regForm.password !== regForm.confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    try {
      const res = await registerMutation(regForm).unwrap();
      if (res.success) {
        dispatch(
          setUnverifiedCredentials({
            email: res.data.email,
            phone: res.data.phone,
          })
        );
        dispatch(
          addToast({
            type: 'info',
            message: 'Account created! Please enter the 6-digit verification code sent to your email.',
          })
        );
        dispatch(setAuthModalTab('verify-email'));
      }
    } catch (err: any) {
      setErrorMessage(err?.data?.message || 'Registration failed. Please try again.');
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const targetEmail = unverifiedEmail || regForm.email;
    try {
      const res = await verifyEmailMutation({ email: targetEmail, otp: emailOtp }).unwrap();
      if (res.success) {
        dispatch(
          addToast({
            type: 'success',
            message: 'Email verified! Now please confirm your mobile number OTP.',
          })
        );
        dispatch(setAuthModalTab('verify-phone'));
      }
    } catch (err: any) {
      setErrorMessage(err?.data?.message || 'Invalid email verification code.');
    }
  };

  const handleVerifyPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const targetPhone = unverifiedPhone || regForm.phone;
    try {
      const res = await verifyPhoneMutation({ phone: targetPhone, otp: phoneOtp }).unwrap();
      if (res.success) {
        handlePostAuthSuccess(res.data.user, res.data.tokens);
      }
    } catch (err: any) {
      setErrorMessage(err?.data?.message || 'Invalid SMS verification code.');
    }
  };

  const handleResend = async (type: 'email' | 'phone') => {
    try {
      const res = await resendOtpMutation({
        email: unverifiedEmail || regForm.email,
        phone: unverifiedPhone || regForm.phone,
        type,
      }).unwrap();
      dispatch(addToast({ type: 'info', message: res.message }));
    } catch {
      dispatch(addToast({ type: 'error', message: 'Failed to resend code.' }));
    }
  };

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={() => dispatch(closeAuthModal())}
        className="absolute inset-0 bg-black/70 backdrop-blur-xs transition-opacity duration-300"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-femina-200 animate-slide-up z-10">
        {/* Header Ribbon */}
        <div className="bg-luxury-gradient text-white p-6 pb-5 text-center relative">
          <button
            onClick={() => dispatch(closeAuthModal())}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-1 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <span className="font-serif text-xl font-bold tracking-widest uppercase block text-gold-shimmer">
            The Femina Exclusive
          </span>
          <p className="text-xs text-femina-200 mt-1">
            {postAuthRedirectUrl
              ? 'Complete sign in to proceed seamlessly to checkout'
              : 'Sign in to access your luxury bespoke bag & orders'}
          </p>

          {/* Navigation Tabs (Only when not in verification step) */}
          {(authModalTab === 'login' || authModalTab === 'register') && (
            <div className="flex bg-white/10 rounded-xl p-1 mt-4 border border-white/10">
              <button
                onClick={() => {
                  setErrorMessage('');
                  dispatch(setAuthModalTab('login'));
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  authModalTab === 'login' ? 'bg-white text-luxury-wine shadow-sm' : 'text-white/80 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setErrorMessage('');
                  dispatch(setAuthModalTab('register'));
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  authModalTab === 'register' ? 'bg-white text-luxury-wine shadow-sm' : 'text-white/80 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>
          )}
        </div>

        {/* Form Body */}
        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
              {errorMessage}
            </div>
          )}

          {/* 1. LOGIN TAB */}
          {authModalTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-femina-50/50 border border-femina-200 rounded-xl text-sm focus:outline-none focus:border-luxury-wine focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-femina-50/50 border border-femina-200 rounded-xl text-sm focus:outline-none focus:border-luxury-wine focus:bg-white transition-all"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="gold"
                size="lg"
                isLoading={isLoginLoading}
                className="w-full justify-center mt-2"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Sign In to Account
              </Button>

              <div className="pt-2 text-center text-xs text-gray-500">
                New to Femina Exclusive?{' '}
                <button
                  type="button"
                  onClick={() => dispatch(setAuthModalTab('register'))}
                  className="font-semibold text-luxury-wine hover:underline"
                >
                  Create an account
                </button>
              </div>
            </form>
          )}

          {/* 2. REGISTER TAB */}
          {authModalTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="First Name"
                    value={regForm.firstName}
                    onChange={(e) => setRegForm({ ...regForm, firstName: e.target.value })}
                    className="w-full px-3 py-2 bg-femina-50/50 border border-femina-200 rounded-xl text-xs focus:outline-none focus:border-luxury-wine focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Last Name"
                    value={regForm.lastName}
                    onChange={(e) => setRegForm({ ...regForm, lastName: e.target.value })}
                    className="w-full px-3 py-2 bg-femina-50/50 border border-femina-200 rounded-xl text-xs focus:outline-none focus:border-luxury-wine focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={regForm.email}
                  onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                  className="w-full px-3 py-2 bg-femina-50/50 border border-femina-200 rounded-xl text-xs focus:outline-none focus:border-luxury-wine focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={regForm.phone}
                  onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-femina-50/50 border border-femina-200 rounded-xl text-xs focus:outline-none focus:border-luxury-wine focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={regForm.password}
                    onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                    className="w-full px-3 py-2 bg-femina-50/50 border border-femina-200 rounded-xl text-xs focus:outline-none focus:border-luxury-wine focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Confirm
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={regForm.confirmPassword}
                    onChange={(e) => setRegForm({ ...regForm, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 bg-femina-50/50 border border-femina-200 rounded-xl text-xs focus:outline-none focus:border-luxury-wine focus:bg-white"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="gold"
                size="md"
                isLoading={isRegisterLoading}
                className="w-full justify-center mt-2"
              >
                Create & Verify Account
              </Button>
            </form>
          )}

          {/* 3. EMAIL OTP VERIFICATION */}
          {authModalTab === 'verify-email' && (
            <form onSubmit={handleVerifyEmail} className="space-y-4 text-center">
              <div className="w-12 h-12 bg-femina-100 rounded-full flex items-center justify-center mx-auto text-femina-700">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-luxury-dark">Step 1: Verify Email Address</h3>
                <p className="text-xs text-gray-500 mt-1">
                  We dispatched a 6-digit code to <strong>{unverifiedEmail || regForm.email}</strong>.
                </p>
              </div>

              <div className="my-3">
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="• • • • • •"
                  value={emailOtp}
                  onChange={(e) => setEmailOtp(e.target.value)}
                  className="w-full text-center tracking-[0.5em] font-mono text-xl py-2.5 bg-femina-50 border-2 border-femina-300 rounded-xl focus:outline-none focus:border-luxury-wine font-bold text-luxury-wine"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isEmailVerifying}
                className="w-full justify-center"
              >
                Confirm Email OTP
              </Button>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => dispatch(setAuthModalTab('register'))}
                  className="text-gray-500 hover:text-luxury-wine"
                >
                  ← Edit details
                </button>
                <button
                  type="button"
                  onClick={() => handleResend('email')}
                  disabled={isResendLoading}
                  className="font-semibold text-luxury-wine hover:underline"
                >
                  Resend Code
                </button>
              </div>
            </form>
          )}

          {/* 4. PHONE OTP VERIFICATION */}
          {authModalTab === 'verify-phone' && (
            <form onSubmit={handleVerifyPhone} className="space-y-4 text-center">
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-700">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-luxury-dark">Step 2: Verify Phone Number</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Enter the 6-digit verification code sent to <strong>{unverifiedPhone || regForm.phone}</strong>.
                </p>
              </div>

              <div className="my-3">
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="• • • • • •"
                  value={phoneOtp}
                  onChange={(e) => setPhoneOtp(e.target.value)}
                  className="w-full text-center tracking-[0.5em] font-mono text-xl py-2.5 bg-femina-50 border-2 border-emerald-300 rounded-xl focus:outline-none focus:border-emerald-700 font-bold text-emerald-900"
                />
              </div>

              <Button
                type="submit"
                variant="gold"
                size="lg"
                isLoading={isPhoneVerifying}
                className="w-full justify-center"
                rightIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Complete & Finish
              </Button>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => dispatch(setAuthModalTab('verify-email'))}
                  className="text-gray-500 hover:text-luxury-wine"
                >
                  ← Back to Email OTP
                </button>
                <button
                  type="button"
                  onClick={() => handleResend('phone')}
                  disabled={isResendLoading}
                  className="font-semibold text-luxury-wine hover:underline"
                >
                  Resend SMS
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
