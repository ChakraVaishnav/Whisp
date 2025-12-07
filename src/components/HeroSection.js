'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: 'easeOut' },
  },
};

export default function HeroSection() {
  return (
    <section className="min-h-screen pt-32 pb-20 px-6 flex items-center justify-center bg-linear-to-br from-gray-950 via-blue-950/20 to-gray-950">
      <div className="max-w-6xl mx-auto w-full">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
        >
          {/* Left Side - Text */}
          <div className="space-y-6">
            <motion.h1
              variants={itemVariants}
              className="text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-white"
            >
              Say Less.
              <br />
              <span className="bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Connect More.
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg text-gray-300 leading-relaxed max-w-lg"
            >
              Whisp is a fast, secure, minimal chat app designed for effortless real-time conversations with AES-encrypted messages. Privacy, simplicity, and speed in one place.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              <Link href="/signup" className="px-8 py-4 rounded-lg bg-linear-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 transform hover:scale-105 text-center">
                Get Started
              </Link>
              <Link href="/dashboard" className="px-8 py-4 rounded-lg border-2 border-gray-300 text-gray-800 font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 text-center">
                Open App
              </Link>
            </motion.div>
          </div>

          {/* Right Side - Chat Mockup */}
          <motion.div
            variants={itemVariants}
            className="relative h-[600px] flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-linear-to-r from-blue-600/10 to-purple-600/10 rounded-3xl blur-3xl" />
            
            {/* Chat Window Mockup */}
              <div className="bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-800/50">
              {/* Header */}
              <div className="bg-linear-to-r from-blue-600 to-purple-600 text-white px-6 py-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Whisp User</h3>
                  <p className="text-xs text-white/70">Active now</p>
                </div>
                <div className="w-3 h-3 bg-green-400 rounded-full" />
              </div>

              {/* Chat Messages */}
              <div className="h-96 px-6 py-4 space-y-4 overflow-hidden bg-gray-900/50">
                {/* Received Message */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-700 text-gray-100 rounded-2xl rounded-bl-none px-4 py-2 max-w-xs text-sm">
                    Hey, what's up?
                  </div>
                </motion.div>

                {/* Sent Message */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  className="flex justify-end"
                >
                  <div className="bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-2xl rounded-br-none px-4 py-2 max-w-xs text-sm">
                    Not much, just testing Whisp ✨
                  </div>
                </motion.div>

                {/* Received Message */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1, duration: 0.5 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-700 text-gray-100 rounded-2xl rounded-bl-none px-4 py-2 max-w-xs text-sm">
                    It's so fast and private! 🔒
                  </div>
                </motion.div>

                {/* Sent Message */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2, duration: 0.5 }}
                  className="flex justify-end"
                >
                  <div className="bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-2xl rounded-br-none px-4 py-2 max-w-xs text-sm">
                    Absolutely! AES-256 encrypted 🚀
                  </div>
                </motion.div>
              </div>

              {/* Input Area */}
              <div className="bg-gray-900 px-6 py-4 border-t border-gray-800 flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-800 rounded-lg px-4 py-2 text-sm placeholder-gray-500 focus:outline-none text-white"
                />
                <button className="bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-lg px-4 py-2 font-semibold hover:shadow-lg transition-all">
                  Send
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
