'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getFingerprint } from "bro-auth/browser";
import { useAuth } from '../../context/AuthContext';
import logger from '../../utils/logger';
export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { setToken } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    // debug: log change events
    try {
      logger.log('signup handleChange', name, value);
    } catch (e) {
      /* ignore */
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!agreedToTerms) return setError('You must accept the Terms and Privacy');
    setLoading(true);
    try {
      const fp = await getFingerprint();
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...formData, fingerprint: fp.hash }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');
      if (data.accessToken) setToken(data.accessToken);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center relative overflow-hidden">
      {/* Animated background blobs */}
      
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600/20 rounded-full mix-blend-screen filter blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600/20 rounded-full mix-blend-screen filter blur-3xl" />
      </div>
      
      <div className="w-full max-w-6xl relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center px-6">
        {/* LEFT SIDE - Interactive Whisp Info */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:block order-2 lg:order-1"
        >
          {/* Logo */}
          <Link href="/" className="inline-block mb-12">
          
            <span className="text-4xl font-bold bg-linear-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Whisp
            </span>
          </Link>

          {/* Main Heading */}
          <h2 className="text-5xl font-bold text-white mb-6 leading-tight">
            Private Chat,
            <br />
            <span className="bg-linear-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              No Compromises
            </span>
          </h2>

          <p className="text-gray-300 text-lg mb-8 leading-relaxed">
            AES-256 encryption. Instant messaging. Zero ads. Join thousands chatting securely right now.
          </p>

          {/* Stats - More formal, no icons */}
          <div className="space-y-4">
            {[
              '256-bit military encryption',
              'Messages in milliseconds',
              'Works globally, offline-ready',
              'No data collection',
            ].map((text, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
                className="flex items-center gap-3"
              >
                <span className="text-gray-300">{text}</span>
              </motion.div>
            ))}
          </div>

          {/* Animated Stats Counter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 bg-linear-to-r from-gray-800/50 to-gray-800/30 rounded-lg p-4 border border-gray-700/50"
          >
            <div className="flex justify-between">
              <div>
                <motion.div className="text-2xl font-bold text-purple-400">
                  ∞
                </motion.div>
                <p className="text-xs text-gray-400">Secure Chats</p>
              </div>
              <div>
                <motion.div className="text-2xl font-bold text-blue-400">
                  0ms
                </motion.div>
                <p className="text-xs text-gray-400">Latency</p>
              </div>
              <div>
                <motion.div className="text-2xl font-bold text-green-400">
                  100%
                </motion.div>
                <p className="text-xs text-gray-400">Private</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* RIGHT SIDE - Signup Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, x: 40 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full order-1 lg:order-2"
        >
          {/* Back Button - Always visible, formal */}
          

          {/* Card */}
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl p-7 border border-gray-800/50 shadow-2xl max-w-sm mx-auto lg:mx-0">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-6"
          >
            <h1 className="text-2xl font-bold text-white mb-1">Join Whisp</h1>
            <p className="text-sm text-gray-400">Create your private account</p>
          </motion.div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Name */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <label className="block text-xs font-semibold text-gray-300 mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
              />
            </motion.div>

            {/* Email */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label className="block text-xs font-semibold text-gray-300 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
              />
            </motion.div>

            {/* Password */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <label className="block text-xs font-semibold text-gray-300 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 text-sm"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </motion.div>

            {/* Terms Checkbox */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <label className="flex items-start gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="w-3.5 h-3.5 rounded mt-0.5 bg-gray-800 border border-gray-700 checked:bg-purple-600 cursor-pointer accent-purple-600"
                />
                <span className="text-gray-300 leading-relaxed">
                  I agree to the{' '}
                  <Link href="/terms" className="text-purple-400 hover:text-purple-300 font-medium" target="_blank" rel="noopener noreferrer">
                    Terms
                  </Link>{' '}
                  &{' '}
                  <Link href="/privacy" className="text-purple-400 hover:text-purple-300 font-medium" target="_blank" rel="noopener noreferrer">
                    Privacy
                  </Link>
                </span>
              </label>
            </motion.div>

            {error && <p className="text-sm text-red-400">{error}</p>}
            {/* Sign Up Button */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={!agreedToTerms || loading}
              className="w-full py-2.5 rounded-lg bg-linear-to-r from-purple-600 to-purple-700 text-white font-semibold text-sm hover:shadow-lg hover:shadow-purple-500/40 transition-all mt-2 disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </motion.button>
          </form>

          {/* Debug: show current form state (name & email only) */}
          <div className="mt-3 text-xs text-gray-500">
            <div>Debug: {formData.name ? `name=${formData.name}` : 'name empty'}</div>
            <div>{formData.email ? `email=${formData.email}` : 'email empty'}</div>
          </div>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700/50" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-gray-900/80 text-gray-500">or</span>
            </div>
          </div>

          {/* Social Buttons - Compact */}
          


          {/* Login Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="text-center"
          >
            <p className="text-xs text-gray-400">
              Already have an account?{' '}
              <Link href="/login" className="text-purple-400 hover:text-purple-300 font-semibold">
                Sign in
              </Link>
            </p>
          </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Footer Text - Small */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-2 left-1/2 -translate-x-1/2 text-center text-gray-600 text-xs"
      >
        Private • Encrypted • Fast
      </motion.p>
    </div>
  );
}
