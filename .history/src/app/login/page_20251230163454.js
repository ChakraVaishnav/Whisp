'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getFingerprint } from "bro-auth/browser";
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { setToken } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const fp = await getFingerprint();
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, fingerprint: fp.hash }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      // keep access token in-memory only
      if (data.accessToken) setToken(data.accessToken);
      // redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center relative overflow-hidden">
      {/* Back Button - Top Left */}
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors z-20 text-sm font-semibold"
        aria-label="Back to home"
      >
        <ArrowLeftIcon className="w-5 h-5" />
        <span>Back</span>
      </Link>
      {/* Animated background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-600/20 rounded-full mix-blend-screen filter blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-600/20 rounded-full mix-blend-screen filter blur-3xl" />
      </div>

      <div className="w-full max-w-6xl relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center px-6">
        {/* LEFT SIDE - Interactive Whisp Info */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:block"
        >
          {/* Logo */}
          <Link href="/" className="inline-block mb-12">
            <span className="text-4xl font-bold bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Whisp
            </span>
          </Link>

          {/* Main Heading */}
          <h2 className="text-5xl font-bold text-white mb-6 leading-tight">
            Chat with
            <br />
            <span className="bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Complete Privacy
            </span>
          </h2>

          <p className="text-gray-300 text-lg mb-8 leading-relaxed">
            Lightning-fast encrypted messaging. AES-256 security. Zero tracking. Just pure conversation.
          </p>

          {/* Feature Highlights */}
          <div className="space-y-4">
            {[
              { icon: '🔒', text: 'End-to-end encrypted' },
              { icon: '⚡', text: 'Ultra-low latency' },
              { icon: '🕵️', text: 'Zero tracking' },
              { icon: '🚀', text: 'Lightning fast' },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
                className="flex items-center gap-3"
              >
                <span className="text-2xl">{feature.icon}</span>
                <span className="text-gray-300">{feature.text}</span>
              </motion.div>
            ))}
          </div>

          {/* Animated Chat Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 space-y-3"
          >
            <motion.div
              animate={{ x: [0, 10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="bg-gray-800/50 rounded-lg p-3 max-w-xs border border-gray-700/50"
            >
              <p className="text-sm text-gray-300">Hey, totally secure now ✨</p>
            </motion.div>
            <motion.div
              animate={{ x: [10, 0, 10] }}
              transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
              className="bg-linear-to-r from-blue-600 to-purple-600 rounded-lg p-3 max-w-xs text-white text-sm ml-auto"
            >
              <p>No one can read this but us 🔐</p>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* RIGHT SIDE - Login Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, x: 40 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          {/* Back Button removed, now always top left */}

          {/* Card */}
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl p-7 border border-gray-800/50 shadow-2xl max-w-sm mx-auto lg:mx-0">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center mb-6"
            >
              <h1 className="text-2xl font-bold text-white mb-1">Welcome Back</h1>
              <p className="text-sm text-gray-400">Sign in to your Whisp account</p>
            </motion.div>

            {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Email */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <label className="block text-xs font-semibold text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
              />
            </motion.div>

            {/* Password */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label className="block text-xs font-semibold text-gray-300 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 text-sm"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </motion.div>

            {/* Remember Me & Forgot */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="flex items-center justify-between text-xs"
            >
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-3.5 h-3.5 rounded bg-gray-800 border border-gray-700 checked:bg-blue-600 cursor-pointer accent-blue-600"
                />
                <span className="text-gray-300">Remember me</span>
              </label>
              <Link href="#" className="text-blue-400 hover:text-blue-300 font-medium">
                Forgot?
              </Link>
            </motion.div>

            {/* Sign In Button */}
            {error && <p className="text-sm text-red-400">{error}</p>}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-linear-to-r from-blue-600 to-blue-700 text-white font-semibold text-sm hover:shadow-lg hover:shadow-blue-500/40 transition-all mt-2 disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </motion.button>
          </form>

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
          

          {/* Sign Up Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <p className="text-xs text-gray-400">
              Don't have an account?{' '}
              <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-semibold">
                Sign up
              </Link>
            </p>
          </motion.div>
          </div>
        </motion.div>

        {/* Footer Text - Small */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="text-center text-gray-600 text-xs mt-4 lg:hidden"
        >
          Terms & Privacy
        </motion.p>
      </div>
    </div>
  );
}
