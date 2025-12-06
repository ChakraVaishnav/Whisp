'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { getFingerprint } from 'bro-auth/browser';
import { useAuth } from '../context/AuthContext';
import { useRouter } from "next/navigation";
import logger from '../utils/logger';

export default function Navigation() {
  const { accessToken, setToken} = useAuth();
  let token = accessToken;
  const Router = useRouter();
  useEffect(() => {
    const tryRefresh = async () => {
    try {
      const fp = await getFingerprint();
      const res = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ fingerprint: fp.hash }),
      });

      if (!res.ok) return null;

      const data = await res.json();
      if (!data.accessToken) return null;

      setToken(data.accessToken);
      verifyToken(data.accessToken);
    } catch (err) {
      logger.error("Refresh failed", err);
      return null;
    }
  };
  const verifyToken = async (token) => {
    try {
      const fp = await getFingerprint();

      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token, fingerprint: fp.hash }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.valid) {
          Router.push("/dashboard");
        }
      }
    } catch (err) {
      logger.error("Verify error", err);
    }
  };

  tryRefresh();
}, []);


  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800/50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/" className="text-2xl font-bold tracking-tight">
            <span className="bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Whisp
            </span>
          </Link>
        </motion.div>

        {/* Menu Items */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="hidden md:flex items-center gap-8"
        >
          <Link href="#features" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
            Features
          </Link>
          <Link href="#security" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
            Security
          </Link>
          <Link href="#download" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
            Download
          </Link>
          <Link href="#contact" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
            Contact
          </Link>
        </motion.div>

        {/* Auth Buttons */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center gap-4"
        >
          <Link href="/login" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
            Login
          </Link>
          <Link href="/signup" className="px-6 py-2 rounded-lg bg-linear-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300">
            Sign Up
          </Link>
        </motion.div>
      </div>
    </nav>
  );
}
