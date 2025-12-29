'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function CTASection() {
  return (
    <section className="py-20 px-6 bg-linear-to-br from-blue-600 via-purple-600 to-blue-700 text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full mix-blend-screen filter blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-white rounded-full mix-blend-screen filter blur-3xl animate-pulse delay-700" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto text-center relative z-10 space-y-8"
      >
        <h2 className="text-5xl lg:text-6xl font-bold leading-tight">
          Get Started with Whisp
        </h2>

        <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
          Join a secure, private chat platform. No ads, no tracking, just conversation.
        </p>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Link href="/signup" className="inline-block px-10 py-4 rounded-xl bg-white text-blue-600 font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300">
            Create Account
          </Link>
        </motion.div>

        <p className="text-white/70 text-sm">
          No credit card required. Free to use.
        </p>
      </motion.div>
    </section>
  );
}
