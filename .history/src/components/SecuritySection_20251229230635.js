'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: 'easeOut' },
  },
};

import { LockClosedIcon } from '@heroicons/react/24/solid';

export default function SecuritySection() {
  return (
    <section id="security" className="py-20 px-4 sm:px-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex flex-col lg:flex-row items-center gap-16"
        >
          {/* Icon & Visual */}
          <motion.div
            variants={itemVariants}
            className="flex-1 flex justify-center lg:justify-start"
          >
            <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
              {/* Animated background circles */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 border-2 border-blue-500/30 rounded-full"
                aria-hidden="true"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-8 border-2 border-purple-500/30 rounded-full"
                aria-hidden="true"
              />
              {/* Professional lock icon */}
              <div className="relative z-10 flex items-center justify-center bg-slate-900 rounded-full shadow-xl w-24 h-24">
                <LockClosedIcon className="w-16 h-16 text-blue-500" aria-label="Security lock icon" />
              </div>
            </div>
          </motion.div>

          {/* Text Content */}
          <motion.div variants={itemVariants} className="flex-1 space-y-7">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              Privacy First
            </h2>
            <p className="text-base sm:text-lg text-gray-300 leading-relaxed max-w-xl">
              We believe privacy is a fundamental right. Every aspect of Whisp is designed with your security in mind.
            </p>
            <div className="space-y-5 pt-6">
              {[
                { title: 'AES-256-GCM Encryption', desc: 'Military-grade encryption for all messages' },
                { title: 'No Profile Pictures Stored', desc: 'Profile data is never stored on servers' },
                { title: 'Stateless File Transfers', desc: 'Files are transferred peer-to-peer, never stored' },
                { title: 'Secure Authentication', desc: 'Fingerprint binding for verified connections' },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 + 0.2 }}
                  viewport={{ once: true }}
                  className="flex gap-4 items-start"
                >
                  <div>
                    <h3 className="font-semibold text-white mb-1 text-base sm:text-lg">{item.title}</h3>
                    <p className="text-gray-400 text-sm sm:text-base">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <Link
              href="#contact"
              className="inline-flex items-center gap-2 rounded-full border border-blue-500/70 px-5 py-3 text-sm font-semibold text-blue-200 transition-all hover:bg-blue-500/10 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              aria-label="Contact us about security"
            >
              <span>Questions about security? Contact us</span>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
